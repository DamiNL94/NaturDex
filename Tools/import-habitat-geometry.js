#!/usr/bin/env node
/*
 * NaturDex · import-habitat-geometry
 * ------------------------------------------------------------------------------------------------
 * Importación ÚNICA: vuelca la geometría (Polygon/MultiPolygon) de cada hábitat desde los
 * ficheros estáticos `habitats.geojson` a la nueva columna `habitats.geometry` (JSON) de la base
 * de datos. A partir de esta importación, la BD pasa a ser la fuente de verdad del polígono: el
 * panel de administración la edita y el export regenera el habitats.geojson desde la BD.
 *
 * Qué hace:
 *   1) Recorre Frontend/Data/parks-index.json (mismo camino que el exportador PHP), y por cada
 *      parque disponible carga su manifiesto y su habitats.geojson.
 *   2) Empareja cada Feature con su fila por la propiedad `slug` (= habitats.slug) y su parque.
 *   3) Actualiza la BD VIVA del contenedor Docker (UPDATE ... SET geometry = ...).
 *   4) Reescribe un bloque delimitado en Database/seed.sql con esos mismos UPDATE, para que un
 *      despliegue desde cero (schema.sql + seed.sql) también cargue la geometría.
 *
 * No necesita el puerto de MySQL publicado ni la contraseña en el host: como db-sync, ejecuta el
 * cliente mysql DENTRO del contenedor usando su propia MYSQL_ROOT_PASSWORD.
 *
 * Uso:   node Tools/import-habitat-geometry.js [--dry-run]
 *        (Requiere Docker con el contenedor de la BD levantado: docker compose up -d db)
 * ================================================================================================
 */
'use strict';

const { execFileSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const FRONTEND_DIR = path.join(REPO_ROOT, 'Frontend');
const REGISTRY_FILE = path.join(FRONTEND_DIR, 'Data', 'parks-index.json');
const SEED_FILE = path.join(REPO_ROOT, 'Database', 'seed.sql');

// Marcadores del bloque autogenerado dentro de seed.sql (se reemplaza entero al reejecutar).
const BLOCK_BEGIN = '-- >>> NATURDEX:HABITAT-GEOMETRY (bloque generado por Tools/import-habitat-geometry.js; no editar a mano) >>>';
const BLOCK_END = '-- <<< NATURDEX:HABITAT-GEOMETRY <<<';

const DRY_RUN = process.argv.includes('--dry-run');

// --- Docker (mismo patrón que Tools/db-sync) --------------------------------------------------

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

// Ejecuta mysql DENTRO del contenedor con la SQL de `input` por stdin. Devuelve stdout.
function runSql(input) {
  const res = spawnSync('docker', [
    'exec', '-i', container(), 'sh', '-c',
    'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql --default-character-set=utf8mb4 --batch --skip-column-names naturadex',
  ], { input, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
  if (res.status !== 0) throw new Error(`docker exec mysql falló (${res.status}): ${(res.stderr || '').trim() || 'sin detalle'}`);
  return res.stdout;
}

function die(msg) { console.error('✖ ' + msg); process.exit(1); }

// --- Utilidades -------------------------------------------------------------------------------

// Escapa una cadena para incrustarla entre comillas simples en SQL (modo por defecto de MySQL).
function sqlQuote(str) {
  return "'" + String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
}

// Recorre el registro de parques y devuelve [{ slug, geojsonPath }] de los que tengan habitats.
function parksWithHabitats() {
  const registry = JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf8'));
  const out = [];
  for (const community of registry.communities || []) {
    for (const province of community.provinces || []) {
      for (const park of province.parks || []) {
        if ((park.status || '') !== 'available' || !park.manifest) continue;
        const manifestPath = path.join(FRONTEND_DIR, park.manifest);
        if (!fs.existsSync(manifestPath)) continue;
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        const geoRel = manifest.geo && manifest.geo.habitats;
        if (!geoRel) continue;
        const geojsonPath = path.join(FRONTEND_DIR, geoRel);
        if (!fs.existsSync(geojsonPath)) continue;
        // apiSlug es el slug con el que el parque vive en la BD (cae al slug del registro).
        out.push({ slug: manifest.apiSlug || park.slug, geojsonPath });
      }
    }
  }
  return out;
}

// De un habitats.geojson devuelve [{ slug, geometry }] con geometrías Polygon/MultiPolygon.
function geometriesFromGeojson(geojsonPath) {
  const fc = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));
  const rows = [];
  for (const feature of fc.features || []) {
    const slug = feature.properties && feature.properties.slug;
    const geom = feature.geometry;
    const type = geom && geom.type;
    if (!slug) continue;
    if (type !== 'Polygon' && type !== 'MultiPolygon') continue;
    rows.push({ slug, geometry: geom });
  }
  return rows;
}

// --- Programa principal -----------------------------------------------------------------------

function main() {
  const parks = parksWithHabitats();
  if (parks.length === 0) die('No hay parques con habitats.geojson en el registro.');

  const seedStatements = [];
  let totalMatched = 0;

  for (const park of parks) {
    const geoms = geometriesFromGeojson(park.geojsonPath);
    if (geoms.length === 0) {
      console.log(`· ${park.slug}: el geojson no tiene polígonos, se omite.`);
      continue;
    }

    // Slugs de hábitats que existen en la BD para este parque (para avisar de los que no casan).
    const dbSlugs = new Set(
      runSql(`SELECT h.slug FROM habitats h JOIN parks p ON p.id = h.park_id WHERE p.slug = ${sqlQuote(park.slug)};`)
        .trim().split('\n').map(s => s.trim()).filter(Boolean)
    );

    let matched = 0;
    const updates = [];
    for (const { slug, geometry } of geoms) {
      if (!dbSlugs.has(slug)) {
        console.warn(`  ⚠ ${park.slug}/${slug}: la Feature no tiene fila en la BD (slug sin emparejar).`);
        continue;
      }
      const json = JSON.stringify(geometry);
      updates.push(
        `UPDATE habitats h JOIN parks p ON p.id = h.park_id\n` +
        `SET h.geometry = ${sqlQuote(json)}\n` +
        `WHERE p.slug = ${sqlQuote(park.slug)} AND h.slug = ${sqlQuote(slug)};`
      );
      matched++;
    }

    if (updates.length > 0) {
      if (!DRY_RUN) runSql('START TRANSACTION;\n' + updates.join('\n') + '\nCOMMIT;\n');
      seedStatements.push(`-- Parque ${park.slug} (${matched} hábitats con geometría)`);
      seedStatements.push(...updates);
      seedStatements.push('');
    }

    console.log(`${DRY_RUN ? '(dry-run) ' : ''}✔ ${park.slug}: ${matched}/${geoms.length} geometrías ${DRY_RUN ? 'preparadas' : 'importadas'}.`);
    totalMatched += matched;
  }

  patchSeed(seedStatements);
  console.log(`\n${DRY_RUN ? '(dry-run) ' : ''}Total: ${totalMatched} geometrías ${DRY_RUN ? 'que se importarían' : 'importadas a la BD viva'}.`);
  if (!DRY_RUN) console.log(`Bloque de geometría ${seedStatements.length ? 'actualizado' : 'vaciado'} en ${path.relative(REPO_ROOT, SEED_FILE)}.`);
}

// Reemplaza (o añade) el bloque delimitado de UPDATEs de geometría en seed.sql.
function patchSeed(statements) {
  const block = statements.length
    ? [BLOCK_BEGIN,
       '-- Geometría de los hábitats (GeoJSON) volcada desde los habitats.geojson. Los INSERT de',
       '-- arriba crean las filas; estos UPDATE rellenan la columna geometry (idempotentes).',
       ...statements,
       BLOCK_END].join('\n')
    : '';

  let seed = fs.readFileSync(SEED_FILE, 'utf8');
  const eol = seed.includes('\r\n') ? '\r\n' : '\n';
  const normalized = seed.replace(/\r\n/g, '\n');
  const blockRe = new RegExp(
    escapeRe(BLOCK_BEGIN) + '[\\s\\S]*?' + escapeRe(BLOCK_END) + '\\n?'
  );

  let next;
  if (blockRe.test(normalized)) {
    // Ya existe el bloque: se reemplaza en el sitio (reejecución idempotente).
    next = normalized.replace(blockRe, block ? block + '\n' : '');
  } else if (block) {
    // Primera vez: se inserta tras el INSERT de hábitats, justo antes del primer bloque de especies.
    const speciesAt = normalized.indexOf('INSERT INTO species');
    const cut = speciesAt >= 0 ? normalized.lastIndexOf('\n\n', speciesAt) + 1 : normalized.length;
    next = normalized.slice(0, cut) + '\n' + block + '\n\n' + normalized.slice(cut);
  } else {
    next = normalized;
  }

  if (DRY_RUN) return;
  fs.writeFileSync(SEED_FILE, next.replace(/\n/g, eol));
}

function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

main();
