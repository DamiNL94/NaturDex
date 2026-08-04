#!/usr/bin/env node
/*
 * NaturDex · db-sync
 * ------------------------------------------------------------------------------------------------
 * Mantiene sincronizada la base de datos VIVA (el contenedor MySQL de Docker) con la base de datos
 * LOCAL del repositorio (los ficheros Database/schema.sql + Database/seed.sql).
 *
 * Modelo de sincronización (bidireccional, explícito y reversible):
 *
 *     Database/schema.sql ┐                      ┌─────────────────────────┐
 *     Database/seed.sql   ├──── push ───────────▶│  contenedor MySQL       │
 *     (fuente curada)     ┘                      │  naturadex (datos vivos)│
 *                         ▲                      └───────────┬─────────────┘
 *                         │                                  │
 *     Database/snapshot.sql ◀──────── pull ──────────────────┘
 *     (volcado determinista, diffeable en git)
 *
 *   · push : LOCAL → contenedor. Aplica schema.sql + seed.sql (idempotentes) a la BD viva.
 *   · pull : contenedor → LOCAL. Vuelca la BD viva a Database/snapshot.sql; `git diff` muestra
 *            EXACTAMENTE qué cambió en el contenedor desde la última vez.
 *   · status: informa de la deriva (qué tablas difieren entre el contenedor y el seed curado, y si
 *            snapshot.sql está desactualizado respecto al contenedor).
 *   · backup: copia de seguridad con marca de tiempo en Tools/db-sync/backups/.
 *
 * Por qué `pull` NO reescribe seed.sql: seed.sql está curado a mano (comentarios, fuentes, orden,
 * inserts idempotentes). Regenerarlo automáticamente destruiría ese trabajo. En su lugar `pull`
 * escribe snapshot.sql y `status` te dice qué cambió, para que decidas qué incorporar al seed.
 * (schema.sql/seed.sql siguen siendo la fuente canónica para una instalación limpia y para `push`.)
 *
 * Requisitos: Node.js y Docker con el contenedor de la BD levantado (docker compose up -d db).
 * No necesita que MySQL esté publicado en el host ni la contraseña en el host: todos los comandos
 * mysql/mysqldump se ejecutan DENTRO del contenedor usando su propia variable MYSQL_ROOT_PASSWORD.
 * ================================================================================================
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { ROOT, DATABASE } = require('../lib/io');
const { findContainer, isContainerRunning, container, inContainer, query } = require('../lib/db');

const DB = 'naturadex';
const REF_DB = 'naturadex_sync_ref'; // BD temporal para comparar el seed contra el contenedor
const REPO_ROOT = ROOT;
const SCHEMA_FILE = path.join(DATABASE, 'schema.sql');
const SEED_FILE = path.join(DATABASE, 'seed.sql');
const SNAPSHOT_FILE = path.join(DATABASE, 'snapshot.sql');
const BACKUP_DIR = path.join(__dirname, 'backups');

// Columnas ignoradas al comparar contenido (claves subrogadas y marcas de tiempo automáticas).
const IGNORED_COLS = new Set(['id', 'created_at', 'updated_at']);

const C = {
  reset: '\x1b[0m', red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m',
  cyan: '\x1b[36m', dim: '\x1b[2m', bold: '\x1b[1m',
};
const color = (c, s) => (process.stdout.isTTY ? c + s + C.reset : s);
const info = (s) => console.log(s);
const ok = (s) => console.log(color(C.green, '✔ ') + s);
const warn = (s) => console.log(color(C.yellow, '⚠ ') + s);
const fail = (s) => { console.error(color(C.red, '✖ ') + s); };

function die(msg) { fail(msg); process.exit(1); }

// --- Acceso al contenedor (Tools/lib/db.js) -----------------------------------------------------
// `findContainer`, `isContainerRunning`, `inContainer` y `query` viven en el módulo compartido:
// eran idénticos aquí y en Tools/eidos-diff.js, incluidos el `docker compose ps -q db` y el paso de
// la contraseña por MYSQL_PWD (nunca en la línea de órdenes).

// --- Utilidades de comparación ----------------------------------------------------------------

function listTables(db) {
  const out = query(
    `SELECT table_name FROM information_schema.tables ` +
    `WHERE table_schema='${db}' AND table_type='BASE TABLE' ORDER BY table_name;`,
  ).trim();
  return out ? out.split('\n').map((s) => s.trim()).filter(Boolean) : [];
}

function tableColumns(db, table) {
  const out = query(
    `SELECT column_name FROM information_schema.columns ` +
    `WHERE table_schema='${db}' AND table_name='${table}' ORDER BY ordinal_position;`,
  ).trim();
  return out ? out.split('\n').map((s) => s.trim()).filter(Boolean) : [];
}

// Hash del contenido de una tabla, independiente del orden y de las claves subrogadas.
function tableHash(db, table) {
  const cols = tableColumns(db, table).filter((c) => !IGNORED_COLS.has(c));
  if (cols.length === 0) return { rows: 0, hash: 'empty' };
  const concat = cols.map((c) => `COALESCE(\`${c}\`,'\\0')`).join(",'|',");
  const sql =
    `SET SESSION group_concat_max_len = 1000000000; ` +
    `SELECT COUNT(*), COALESCE(MD5(GROUP_CONCAT(rh ORDER BY rh SEPARATOR '')),'empty') ` +
    `FROM (SELECT MD5(CONCAT_WS('|',${concat})) rh FROM \`${db}\`.\`${table}\`) t;`;
  const out = query(sql).trim().split('\n').pop().split('\t');
  return { rows: parseInt(out[0], 10), hash: out[1] };
}

function dropRefDb() {
  try { query(`DROP DATABASE IF EXISTS \`${REF_DB}\`;`); } catch (_) { /* ignorar */ }
}

// Construye una BD de referencia efímera desde schema.sql + seed.sql (renombrada a REF_DB).
function buildRefDb() {
  const rename = (sql) => sql
    .replace(/CREATE DATABASE IF NOT EXISTS naturadex/g, `CREATE DATABASE IF NOT EXISTS ${REF_DB}`)
    .replace(/USE naturadex;/g, `USE ${REF_DB};`);
  dropRefDb();
  inContainer('mysql --default-character-set=utf8mb4', rename(fs.readFileSync(SCHEMA_FILE, 'utf8')));
  inContainer('mysql --default-character-set=utf8mb4', rename(fs.readFileSync(SEED_FILE, 'utf8')));
}

// --- Subcomandos ------------------------------------------------------------------------------

function cmdStatus() {
  info(color(C.bold, `db-sync status`) + color(C.dim, `  (contenedor: ${container()})`));
  info('');

  // 1) ¿Coincide el contenedor con el seed curado del repo?
  info(color(C.cyan, 'Contenedor  vs  Database/seed.sql (fuente curada)'));
  let anyDrift = false;
  try {
    buildRefDb();
    const tables = new Set([...listTables(DB), ...listTables(REF_DB)]);
    for (const t of [...tables].sort()) {
      const live = safeHash(DB, t);
      const ref = safeHash(REF_DB, t);
      if (live.hash === ref.hash && live.rows === ref.rows) {
        info('  ' + color(C.green, 'en sync') + `   ${t} ` + color(C.dim, `(${live.rows} filas)`));
      } else {
        anyDrift = true;
        info('  ' + color(C.yellow, 'DIFIERE') + `   ${t} ` +
             color(C.dim, `(contenedor: ${live.rows} filas · seed: ${ref.rows} filas)`));
      }
    }
  } finally {
    dropRefDb();
  }
  info('');
  if (anyDrift) {
    warn('El contenedor y el seed difieren.');
    info(color(C.dim, '    · Para llevar los cambios del contenedor al repo:  db-sync pull  (luego revisa git diff)'));
    info(color(C.dim, '    · Para imponer el seed del repo en el contenedor:   db-sync push'));
  } else {
    ok('El contenedor coincide con Database/seed.sql.');
  }

  // 2) ¿Está snapshot.sql al día respecto al contenedor?
  info('');
  info(color(C.cyan, 'Database/snapshot.sql  vs  contenedor'));
  if (!fs.existsSync(SNAPSHOT_FILE)) {
    info('  ' + color(C.dim, 'no existe todavía; genéralo con  db-sync pull'));
  } else {
    const fresh = dumpNormalized();
    const saved = fs.readFileSync(SNAPSHOT_FILE, 'utf8');
    // Comparar solo el cuerpo del volcado (el snapshot guardado lleva además una cabecera propia).
    if (normalizeForCompare(dumpBody(fresh)) === normalizeForCompare(dumpBody(saved))) {
      ok('snapshot.sql está al día.');
    } else {
      warn('snapshot.sql está desactualizado (el contenedor cambió desde el último pull).');
      info(color(C.dim, '    Actualízalo con:  db-sync pull'));
    }
  }
}

function safeHash(db, table) {
  try { return tableHash(db, table); } catch (_) { return { rows: 0, hash: 'missing' }; }
}

// Volcado determinista (estructura + datos) de la BD viva.
function dumpNormalized() {
  const raw = inContainer(
    `mysqldump --databases ${DB} --skip-extended-insert --complete-insert ` +
    `--order-by-primary --skip-dump-date --no-tablespaces`,
  );
  // Quitar los contadores AUTO_INCREMENT (ruido no semántico en el diff).
  return raw.replace(/ AUTO_INCREMENT=\d+/g, '');
}

// Normaliza para comparar (ignora finales de línea).
function normalizeForCompare(s) {
  return s.replace(/\r\n/g, '\n').trim();
}

// Extrae el cuerpo del volcado de mysqldump (desde su primera línea de cabecera), ignorando
// cualquier cabecera propia que db-sync haya antepuesto en snapshot.sql.
function dumpBody(s) {
  const i = s.indexOf('-- MySQL dump');
  return i >= 0 ? s.slice(i) : s;
}

function cmdPull(opts) {
  // Modo tolerante (usado por el hook de git): si el contenedor no está activo, no falla.
  if (opts && opts.ifRunning && !isContainerRunning()) {
    info(color(C.dim, '[db-sync] contenedor de BD no activo; omito el pull automático.'));
    return;
  }
  info(color(C.bold, 'db-sync pull') + color(C.dim, `  (contenedor → Database/snapshot.sql)`));
  const dump = dumpNormalized();
  const header =
    `-- ================================================================================================\n` +
    `-- NaturDex · snapshot.sql  ·  VOLCADO AUTOMÁTICO (no editar a mano)\n` +
    `-- Generado por Tools/db-sync (db-sync pull). Refleja el estado VIVO del contenedor MySQL.\n` +
    `-- 'git diff Database/snapshot.sql' muestra qué cambió en el contenedor desde el último pull.\n` +
    `-- La fuente CURADA sigue siendo Database/schema.sql + Database/seed.sql (usadas por 'push').\n` +
    `-- ================================================================================================\n` +
    `SET NAMES utf8mb4;\n`;
  fs.writeFileSync(SNAPSHOT_FILE, header + dump.replace(/\r\n/g, '\n'));
  ok(`Escrito ${path.relative(REPO_ROOT, SNAPSHOT_FILE)} (${dump.split('\n').length} líneas).`);
  info(color(C.dim, "    Revisa los cambios con:  git diff Database/snapshot.sql"));
}

function cmdPush(opts) {
  info(color(C.bold, 'db-sync push') + color(C.dim, `  (schema.sql + seed.sql → contenedor)`));
  if (!opts.yes) {
    // Copia de seguridad automática antes de modificar la BD viva.
    const bkp = doBackup();
    ok(`Copia de seguridad previa: ${path.relative(REPO_ROOT, bkp)}`);
  }
  info(color(C.dim, '    Aplicando schema.sql…'));
  inContainer('mysql --default-character-set=utf8mb4', fs.readFileSync(SCHEMA_FILE, 'utf8'));
  info(color(C.dim, '    Aplicando seed.sql…'));
  inContainer('mysql --default-character-set=utf8mb4', fs.readFileSync(SEED_FILE, 'utf8'));
  ok('Contenedor actualizado desde el repositorio.');
  info(color(C.dim, "    (schema.sql y seed.sql son idempotentes: crea/actualiza, no borra filas ajenas)"));
}

function doBackup() {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  // Marca de tiempo derivada del contenedor para evitar depender del reloj del host.
  const stamp = query('SELECT DATE_FORMAT(NOW(), "%Y%m%d-%H%i%s");').trim();
  const file = path.join(BACKUP_DIR, `${DB}-${stamp}.sql`);
  const dump = inContainer(
    `mysqldump --databases ${DB} --skip-dump-date --no-tablespaces --routines --events`,
  );
  fs.writeFileSync(file, dump.replace(/\r\n/g, '\n'));
  return file;
}

function cmdBackup() {
  info(color(C.bold, 'db-sync backup'));
  const file = doBackup();
  ok(`Copia de seguridad: ${path.relative(REPO_ROOT, file)}`);
}

function cmdHelp() {
  info(`${color(C.bold, 'NaturDex · db-sync')} — sincroniza el contenedor MySQL con el repositorio.

${color(C.cyan, 'Uso:')}  node Tools/db-sync/db-sync.js <comando>
      (o los envoltorios  Tools/db-sync/db-sync.ps1  /  Tools/db-sync/db-sync.sh)

${color(C.cyan, 'Comandos:')}
  status    Muestra si el contenedor y el seed del repo coinciden, y si snapshot.sql está al día.
  pull      Contenedor → repo. Vuelca la BD viva a Database/snapshot.sql (revisa con git diff).
  push      Repo → contenedor. Aplica schema.sql + seed.sql (hace copia de seguridad antes).
  backup    Copia de seguridad con marca de tiempo en Tools/db-sync/backups/.
  help      Esta ayuda.

${color(C.cyan, 'Flujo típico:')}
  · Editaste datos en la app (contenedor):   db-sync pull   → git diff → incorpora al seed.sql si procede.
  · Editaste schema.sql/seed.sql (repo):      db-sync push   → el contenedor queda igual que el repo.
  · ¿Dudas de si están sincronizados?:        db-sync status

${color(C.dim, 'Contenedor: se detecta con `docker compose ps -q db`; se puede forzar con NATURDEX_DB_CONTAINER.')}`);
}

// --- Entrada ----------------------------------------------------------------------------------

function main() {
  const argv = process.argv.slice(2);
  const cmd = (argv[0] || 'help').toLowerCase();
  const opts = {
    yes: argv.includes('--yes') || argv.includes('-y'),
    ifRunning: argv.includes('--if-running'),
  };
  try {
    switch (cmd) {
      case 'status': return cmdStatus();
      case 'pull': return cmdPull(opts);
      case 'push': return cmdPush(opts);
      case 'backup': return cmdBackup();
      case 'help': case '-h': case '--help': return cmdHelp();
      default:
        fail(`Comando desconocido: ${cmd}`);
        info('');
        return cmdHelp();
    }
  } catch (e) {
    die(e.message || String(e));
  }
}

main();
