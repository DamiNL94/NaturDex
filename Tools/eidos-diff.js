#!/usr/bin/env node
/*
 * NaturDex · eidos-diff
 * ------------------------------------------------------------------------------------------------
 * Informe de diferencias (SOLO LECTURA): compara el estado de conservación y legal que hoy tiene
 * cada especie en la BD contra la fuente oficial EIDOS del IEPNB (https://iepnb.gob.es/), vía su
 * API REST pública (PostgREST, sin autenticación). NO escribe nada: ni en la BD, ni en el seed, ni
 * en EIDOS. Su único objetivo es enseñar, antes de decidir migrar, cuántas especies casan con
 * EIDOS y en qué difieren los datos de conservación (UICN por ámbito) y legales (CEEA/LESRPE/CCAA).
 *
 * Qué hace:
 *   1) Lee las especies de la BD VIVA del contenedor Docker (scientific_name + los 3 campos de
 *      estado que hoy son texto libre: iucn_global, spain_status, murcia_status).
 *   2) Por cada especie consulta EIDOS: v_taxonomia (para resolver el idtaxon del nombre aceptado),
 *      v_estadoconservacion (UICN por ámbito y año) y v_estadolegal (normas por ámbito/CCAA).
 *   3) Deriva el valor "vigente y más reciente" de cada eje y lo contrasta con lo que hay en la BD.
 *   4) Imprime un informe por especie + un resumen de cobertura. Con --out escribe además un .md.
 *
 * Igual que Tools/db-sync / import-habitat-geometry, ejecuta el cliente mysql DENTRO del contenedor
 * (no necesita el puerto de MySQL publicado ni la contraseña en el host). Solo hace SELECT.
 *
 * Uso:   node Tools/eidos-diff.js [--limit N] [--out informe.md] [--only-diffs]
 *        (Requiere Docker con el contenedor de la BD levantado: docker compose up -d db)
 * ================================================================================================
 */
'use strict';

const { execFileSync, spawnSync } = require('child_process');
const https = require('https');
const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');

// --- Flags ------------------------------------------------------------------------------------

const ARGV = process.argv.slice(2);
function flagValue(name) {
  const i = ARGV.indexOf(name);
  return i >= 0 && i + 1 < ARGV.length ? ARGV[i + 1] : null;
}
const LIMIT = flagValue('--limit') ? parseInt(flagValue('--limit'), 10) : Infinity;
const OUT_FILE = flagValue('--out');
const ONLY_DIFFS = ARGV.includes('--only-diffs');

// EIDOS API (PostgREST). Host y base path descubiertos en la ficha del catálogo IEPNB.
const EIDOS_HOST = 'iepnb.gob.es';
const EIDOS_BASE = '/api/especie';
// Pausa entre especies para no martillear el servicio público (~78 especies x 3 llamadas).
const THROTTLE_MS = 150;

// Códigos UICN reconocidos, para extraerlos tanto del texto libre de la BD como de EIDOS.
const IUCN_CODES = ['CR', 'EN', 'VU', 'NT', 'LC', 'DD', 'NE', 'RE', 'EW', 'EX'];

// --- Docker (mismo patrón que Tools/db-sync e import-habitat-geometry) -------------------------

function die(msg) { console.error('✖ ' + msg); process.exit(1); }

function findContainer() {
  if (process.env.NATURDEX_DB_CONTAINER) return process.env.NATURDEX_DB_CONTAINER;
  try {
    const id = execFileSync('docker', ['compose', 'ps', '-q', 'db'], {
      cwd: REPO_ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (id) return id;
  } catch (_) { /* docker compose no disponible */ }
  return 'naturdex-db-1';
}

let CONTAINER = null;
function container() {
  if (CONTAINER) return CONTAINER;
  CONTAINER = findContainer();
  try {
    const state = execFileSync('docker', ['inspect', '-f', '{{.State.Running}}', CONTAINER],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    if (state !== 'true') die(`El contenedor de la BD ('${CONTAINER}') no está en marcha. Levántalo con: docker compose up -d db`);
  } catch (_) {
    die(`No encuentro el contenedor de la BD ('${CONTAINER}'). Levántalo con: docker compose up -d db`);
  }
  return CONTAINER;
}

// Ejecuta mysql DENTRO del contenedor con la SQL de `input` por stdin. Devuelve stdout. Solo SELECT.
function runSql(input) {
  const res = spawnSync('docker', [
    'exec', '-i', container(), 'sh', '-c',
    'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql --default-character-set=utf8mb4 --batch --skip-column-names naturadex',
  ], { input, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (res.status !== 0) throw new Error(`docker exec mysql falló (${res.status}): ${(res.stderr || '').trim() || 'sin detalle'}`);
  return res.stdout;
}

// Lee las especies de la BD como JSON (evita problemas de separadores con el texto libre).
function loadSpecies() {
  const sql =
    "SELECT COALESCE(JSON_ARRAYAGG(JSON_OBJECT(" +
    "'sci', scientific_name, 'common', common_name, 'kingdom', kingdom, " +
    "'iucn', iucn_global, 'spain', spain_status, 'murcia', murcia_status)), JSON_ARRAY()) " +
    "FROM species ORDER BY kingdom, scientific_name;";
  const out = runSql(sql).trim();
  let rows;
  try { rows = JSON.parse(out); } catch (e) { die('No pude parsear las especies de la BD: ' + e.message); }
  // Dedup por nombre científico (una especie puede estar en varios parques).
  const seen = new Set();
  return rows.filter(r => {
    const k = (r.sci || '').trim().toLowerCase();
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

// --- Cliente EIDOS ----------------------------------------------------------------------------

function httpGetJson(pathQuery, attempt = 0) {
  return new Promise((resolve, reject) => {
    const req = https.get({
      host: EIDOS_HOST, path: pathQuery, headers: { 'Accept': 'application/json', 'User-Agent': 'NaturDex-eidos-diff/1.0' },
    }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (c) => { body += c; });
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error(`HTTP ${res.statusCode} en ${pathQuery}: ${body.slice(0, 200)}`));
        }
        try { resolve(JSON.parse(body)); }
        catch (e) { reject(new Error('JSON inválido de EIDOS: ' + e.message)); }
      });
    });
    req.setTimeout(30000, () => req.destroy(new Error('timeout')));
    req.on('error', (e) => {
      if (attempt < 1) { setTimeout(() => httpGetJson(pathQuery, attempt + 1).then(resolve, reject), 500); }
      else reject(e);
    });
  });
}

function q(view, params) {
  return `${EIDOS_BASE}/${view}?${params.join('&')}`;
}

// El nombre científico de la BD, en minúsculas y sin autor, para comparar con el `name` de EIDOS
// (que siempre trae el autor detrás: "Aquila fasciata Vieillot, 1822").
function norm(s) { return String(s || '').trim().toLowerCase(); }
function nameMatches(eidosName, sci) {
  const n = norm(eidosName), s = norm(sci);
  return n === s || n.startsWith(s + ' ');
}

// Resuelve el idtaxon del NOMBRE ACEPTADO para un nombre (bi- o trinomial) de la BD. Vale para
// especie y subespecie: empareja por prefijo del `name`, no por rango, así que no descarta subsp.
async function resolveTaxon(sci) {
  const rows = await httpGetJson(q('v_taxonomia', [
    `name=like.${encodeURIComponent(sci)}*`,
    'select=taxonid,nameid,acceptednameid,name,taxonrank,nametype,genus,specificepithet,scientificnameauthorship,taxonomicgroup,origen',
  ]));
  if (!Array.isArray(rows) || rows.length === 0) return { status: 'no-encontrada' };

  const accepted = rows.filter(r => r.nametype === 'Aceptado/válido');
  // 1) Nombre aceptado que coincide exactamente (prefijo) con el de la BD → migración limpia.
  const exact = accepted.find(r => nameMatches(r.name, sci));
  if (exact) return { status: 'ok', taxon: exact };
  // 2) Hay un aceptado bajo ese prefijo aunque no case letra a letra (raro) → lo damos por bueno.
  if (accepted.length) return { status: 'ok', taxon: accepted[0] };

  // 3) Solo aparece como sinónimo: el nombre de la BD está reclasificado. Resolvemos el nombre
  //    ACEPTADO real (por acceptednameid) para decir a qué binomio habría que migrar.
  const syn = rows[0];
  let acceptedName = null;
  if (syn.acceptednameid && syn.acceptednameid !== syn.nameid) {
    try {
      const acc = await httpGetJson(q('v_taxonomia', [
        `nameid=eq.${syn.acceptednameid}`, 'select=name,taxonid',
      ]));
      if (Array.isArray(acc) && acc.length) acceptedName = acc[0].name;
    } catch (_) { /* si falla, dejamos acceptedName en null */ }
  }
  return { status: 'sinonimo', taxon: syn, acceptedName };
}

// De v_estadoconservacion (UICN), devuelve por ámbito la fila vigente más reciente.
async function conservationByScope(idtaxon) {
  const rows = await httpGetJson(q('v_estadoconservacion', [
    `idtaxon=eq.${idtaxon}`,
    'select=categoriaconservacion,autoridad,aplicaa,anio,vigencia',
  ]));
  const byScope = {};
  for (const r of rows) {
    if (r.vigencia !== 'Vigente' || r.autoridad !== 'UICN') continue;
    const scope = r.aplicaa || '?';
    if (!byScope[scope] || (r.anio || 0) > (byScope[scope].anio || 0)) byScope[scope] = r;
  }
  return byScope;
}

// De v_estadolegal, separa las normas vigentes de ámbito nacional y las de la CCAA de Murcia.
async function legalStatus(idtaxon) {
  const rows = await httpGetJson(q('v_estadolegal', [
    `idtaxon=eq.${idtaxon}`,
    'select=estadolegal,norma,ambito,ccaa,idvigente',
  ]));
  const vig = rows.filter(r => r.idvigente === 1);
  const murcia = vig.filter(r => /murcia/i.test(r.ccaa || '') || /murcia/i.test(r.norma || ''));
  const nacional = vig.filter(r => r.ambito === 'Nacional');
  return { murcia, nacional };
}

// --- Comparación --------------------------------------------------------------------------------

function iucnCodeIn(text) {
  if (!text) return null;
  const m = String(text).match(new RegExp(`\\b(${IUCN_CODES.join('|')})\\b`));
  return m ? m[1] : null;
}
function iucnCodeOf(cat) {
  if (!cat) return null;
  const m = String(cat).match(/^([A-Z]{2})\b/);
  return m ? m[1] : null;
}
function scopeCode(byScope, scope) {
  const r = byScope[scope];
  return r ? { code: iucnCodeOf(r.categoriaconservacion), anio: r.anio } : null;
}

// --- Programa principal -------------------------------------------------------------------------

async function main() {
  const species = loadSpecies();
  if (species.length === 0) die('No hay especies en la BD.');
  const total = Math.min(species.length, LIMIT);
  console.log(`Comparando ${total} especie(s) contra EIDOS (${EIDOS_HOST})…\n`);

  const report = [];
  const stats = { encontradas: 0, noEncontradas: 0, sinonimos: 0, sinConservacion: 0, uicnMundialDiff: 0 };

  for (let i = 0; i < total; i++) {
    const sp = species[i];
    const line = { sp };
    try {
      const res = await resolveTaxon(sp.sci);
      if (res.status === 'no-encontrada') { stats.noEncontradas++; line.estado = 'NO ENCONTRADA en EIDOS'; report.push(line); continue; }
      if (res.status === 'sinonimo') {
        stats.sinonimos++;
        line.estado = res.acceptedName
          ? `RECLASIFICADA — nombre aceptado en EIDOS: "${res.acceptedName}"`
          : `SINÓNIMO en EIDOS (sin nombre aceptado resoluble)`;
        report.push(line);
        continue;
      }
      stats.encontradas++;
      const t = res.taxon;
      line.taxon = t;

      const [cons, legal] = await Promise.all([conservationByScope(t.taxonid), legalStatus(t.taxonid)]);
      const mundial = scopeCode(cons, 'Mundial');
      const espana = scopeCode(cons, 'España');
      const peninsula = scopeCode(cons, 'Península');
      if (!mundial && !espana && !peninsula) stats.sinConservacion++;

      const seedMundial = iucnCodeIn(sp.iucn);
      line.mundialDiff = mundial && seedMundial && mundial.code !== seedMundial;
      if (line.mundialDiff) stats.uicnMundialDiff++;

      line.eidos = { mundial, espana, peninsula, murcia: legal.murcia, nacional: legal.nacional };
      report.push(line);
    } catch (e) {
      line.estado = 'ERROR: ' + e.message;
      report.push(line);
    }
    if (i < total - 1) await new Promise(r => setTimeout(r, THROTTLE_MS));
    process.stdout.write(`\r  ${i + 1}/${total}`);
  }
  process.stdout.write('\n\n');

  const md = renderReport(report, stats, total);
  console.log(md);
  if (OUT_FILE) {
    fs.writeFileSync(path.resolve(OUT_FILE), md);
    console.log(`\nInforme escrito en ${path.resolve(OUT_FILE)}`);
  }
}

function fmtScope(s) { return s ? `${s.code} (${s.anio})` : '—'; }

function renderReport(report, stats, total) {
  const L = [];
  L.push('# Informe EIDOS ↔ NaturDex (solo lectura)\n');
  L.push(`Fuente: EIDOS (IEPNB, MITECO) · API REST \`https://${EIDOS_HOST}${EIDOS_BASE}\`\n`);
  L.push('## Resumen de cobertura\n');
  L.push(`- Especies comparadas: **${total}**`);
  L.push(`- Encontradas en EIDOS (nombre aceptado): **${stats.encontradas}**`);
  L.push(`- Solo como sinónimo (posible reclasificación): **${stats.sinonimos}**`);
  L.push(`- No encontradas: **${stats.noEncontradas}**`);
  L.push(`- Sin datos de conservación UICN en EIDOS: **${stats.sinConservacion}**`);
  L.push(`- Discrepancias UICN Mundial (BD vs EIDOS): **${stats.uicnMundialDiff}**\n`);

  L.push('## Detalle por especie\n');
  L.push('| Especie | Estado | UICN Mundial (BD→EIDOS) | UICN España | UICN Península | Legal Murcia (EIDOS) |');
  L.push('|---|---|---|---|---|---|');
  for (const r of report) {
    if (ONLY_DIFFS && !r.estado && !r.mundialDiff) continue;
    const name = `${r.sp.sci}${r.sp.common ? ` <br><small>${r.sp.common}</small>` : ''}`;
    if (r.estado) { L.push(`| ${name} | ${r.estado} | | | | |`); continue; }
    const e = r.eidos;
    const seedM = iucnCodeIn(r.sp.iucn) || '?';
    const mundial = `${seedM} → ${fmtScope(e.mundial)}${r.mundialDiff ? ' ⚠️' : ''}`;
    const murcia = e.murcia.length ? e.murcia.map(m => m.estadolegal).join('; ') : '—';
    L.push(`| ${name} | ok | ${mundial} | ${fmtScope(e.espana)} | ${fmtScope(e.peninsula)} | ${murcia} |`);
  }
  L.push('\n> Nota: "BD→EIDOS" compara solo el código UICN; los campos `spain_status`/`murcia_status`');
  L.push('> de la BD son texto libre y deben revisarse a mano frente a las columnas de EIDOS.');
  return L.join('\n');
}

main().catch(e => die(e.stack || e.message));
