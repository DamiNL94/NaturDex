#!/usr/bin/env node
// ================================================================================================
// build-park-tiles.js — empaqueta el mapa base sin conexión de un parque (.pmtiles).
// ------------------------------------------------------------------------------------------------
//   node Tools/build-park-tiles.js <slug> [--maxzoom=15] [--build=20260726] [--dry-run]
//
// Por qué existe: OSM y PNOA se sirven desde sus propios dominios, así que sin cobertura el mapa
// del parque se veía flotando sobre un fondo vacío. Este script recorta el basemap de Protomaps
// (teselas vectoriales derivadas de OpenStreetMap) al LÍMITE OFICIAL del parque y deja un único
// fichero que se sirve desde nuestro origen y se guarda en la caché del parque.
//
// Licencias (importante, y por eso no se descargan teselas de tile.openstreetmap.org):
//   - La política de teselas de OSM prohíbe expresamente el prefetch y el uso sin conexión de sus
//     servidores. Descargar de ahí para empaquetar NO es una opción.
//   - El basemap de Protomaps es una "Produced Work" de OSM bajo ODbL: se puede redistribuir
//     exigiendo atribución "© OpenStreetMap", que este script escribe en manifest.tiles.attribution
//     para que la app pueda mostrarla también sin conexión.
//
// Requisito: el CLI `pmtiles` (go-pmtiles). Se busca en Tools/bin/ y, si no, en el PATH.
// Se instala descargando la release de https://github.com/protomaps/go-pmtiles/releases y dejando
// el binario en Tools/bin/ (ignorado por git). Solo lo necesita quien genera los paquetes: la app
// no lo usa nunca.
// ================================================================================================

'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const FRONTEND = path.join(ROOT, 'Frontend');
const REGISTRY = path.join(FRONTEND, 'Data', 'parks-index.json');
const BUILDS_URL = 'https://build-metadata.protomaps.dev/builds.json';
const ARCHIVE_URL = 'https://build.protomaps.com/';

// Presupuesto por parque: esto se lo descarga un móvil en 4G antes de entrar a la ruta, y ocupa
// espacio permanente en el dispositivo. El tope cubre TODO lo que se guarda (mapa + fotos + audio),
// no solo las teselas, porque es lo que de verdad le cuesta al usuario.
const MAX_TOTAL_BYTES = 25 * 1024 * 1024;

const red = s => '\x1b[31m' + s + '\x1b[0m';
const green = s => '\x1b[32m' + s + '\x1b[0m';
const yellow = s => '\x1b[33m' + s + '\x1b[0m';
const mb = b => (b / (1024 * 1024)).toFixed(2) + ' MB';

function fail(msg) { console.error(red('✖ ' + msg)); process.exit(1); }

function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }

// El CLI se llama pmtiles.exe en Windows y pmtiles en el resto; en Tools/bin/ o en el PATH.
function resolveCli() {
  const local = path.join(__dirname, 'bin', process.platform === 'win32' ? 'pmtiles.exe' : 'pmtiles');
  if (fs.existsSync(local)) return local;
  return 'pmtiles';
}

async function latestBuild() {
  const res = await fetch(BUILDS_URL);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const list = await res.json();
  const builds = Array.isArray(list) ? list : (list.builds || []);
  if (!builds.length) throw new Error('la lista de builds vino vacía');
  return builds[builds.length - 1].key; // van en orden ascendente por fecha
}

function findParkEntry(registry, slug) {
  for (const community of registry.communities || []) {
    for (const province of community.provinces || []) {
      for (const park of province.parks || []) {
        if (park.slug === slug) return park;
      }
    }
  }
  return null;
}

// El polígono del parque es el recorte: así los zooms altos solo traen detalle DENTRO del espacio
// protegido, en vez de cubrir el bbox entero (que en un parque costero es medio mar).
function writeRegionFile(boundaryPath) {
  const geo = readJson(boundaryPath);
  let geometry = null;
  if (geo.type === 'FeatureCollection') {
    const polys = (geo.features || []).map(f => f.geometry).filter(g => g && (g.type === 'Polygon' || g.type === 'MultiPolygon'));
    if (!polys.length) return null;
    geometry = polys.length === 1 ? polys[0] : {
      type: 'MultiPolygon',
      coordinates: polys.flatMap(g => g.type === 'Polygon' ? [g.coordinates] : g.coordinates)
    };
  } else if (geo.type === 'Feature') {
    geometry = geo.geometry;
  } else {
    geometry = geo;
  }
  if (!geometry || (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon')) return null;
  const file = path.join(os.tmpdir(), 'naturdex-region-' + process.pid + '.geojson');
  fs.writeFileSync(file, JSON.stringify(geometry));
  return file;
}

function bboxOf(geometryFile) {
  const g = readJson(geometryFile);
  const rings = g.type === 'Polygon' ? g.coordinates : g.coordinates.flat();
  let minLon = Infinity, minLat = Infinity, maxLon = -Infinity, maxLat = -Infinity;
  rings.flat().forEach(([lon, lat]) => {
    if (lon < minLon) minLon = lon;
    if (lat < minLat) minLat = lat;
    if (lon > maxLon) maxLon = lon;
    if (lat > maxLat) maxLat = lat;
  });
  return [minLon, minLat, maxLon, maxLat].map(n => Number(n.toFixed(6)));
}

// Lo que de verdad se descargará de fotos y audios. Se cuenta solo lo que existe en disco: el
// manifiesto declara fotos aún no subidas (el validador ya avisa) y anunciar un peso que no se va a
// descargar sería mentirle al usuario en el botón de "Guardar sin conexión".
function assetBytesOnDisk(manifest) {
  const assets = (manifest.images || []).concat(manifest.audio || []);
  let bytes = 0, missing = 0;
  assets.forEach(rel => {
    const file = path.join(FRONTEND, rel);
    if (fs.existsSync(file)) bytes += fs.statSync(file).size;
    else missing++;
  });
  return { bytes, missing, total: assets.length };
}

async function main() {
  const args = process.argv.slice(2);
  const slug = args.find(a => !a.startsWith('--'));
  const flag = name => {
    const hit = args.find(a => a.startsWith('--' + name + '='));
    return hit ? hit.split('=')[1] : null;
  };
  const dryRun = args.includes('--dry-run');
  const maxzoom = Number(flag('maxzoom') || 15);

  if (!slug) fail('uso: node Tools/build-park-tiles.js <slug> [--maxzoom=15] [--build=YYYYMMDD] [--dry-run]');

  const registry = readJson(REGISTRY);
  const entry = findParkEntry(registry, slug);
  if (!entry) fail('el slug "' + slug + '" no está en parks-index.json');

  const manifestPath = path.join(FRONTEND, entry.manifest);
  if (!fs.existsSync(manifestPath)) fail('manifiesto no encontrado: ' + entry.manifest);
  const manifest = readJson(manifestPath);

  const boundaryRel = manifest.geo && manifest.geo.parque;
  if (!boundaryRel) fail('el manifiesto no declara geo.parque: sin límite oficial no hay por dónde recortar');
  const boundaryPath = path.join(FRONTEND, boundaryRel);
  if (!fs.existsSync(boundaryPath)) fail('límite no encontrado: ' + boundaryRel);

  const regionFile = writeRegionFile(boundaryPath);
  if (!regionFile) fail('el límite de ' + slug + ' no tiene un polígono utilizable');

  const build = flag('build') ? flag('build') + '.pmtiles' : await latestBuild();
  const source = ARCHIVE_URL + build;
  const outRel = path.posix.join(path.posix.dirname(entry.manifest.replace(/\\/g, '/')), 'tiles', 'base.pmtiles');
  const outPath = path.join(FRONTEND, outRel);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  console.log('▶ ' + slug + ' · recorte del límite oficial · z0–' + maxzoom);
  console.log('  origen: ' + source);

  const cli = resolveCli();
  const cliArgs = [
    'extract', source, outPath,
    '--region=' + regionFile,
    '--maxzoom=' + maxzoom
  ];
  if (dryRun) cliArgs.push('--dry-run');

  try {
    execFileSync(cli, cliArgs, { stdio: 'inherit' });
  } catch (e) {
    fs.unlinkSync(regionFile);
    fail('falló el CLI pmtiles. ¿Está en Tools/bin/ o en el PATH? Descárgalo de\n  ' +
         'https://github.com/protomaps/go-pmtiles/releases');
  }

  const bbox = bboxOf(regionFile);
  fs.unlinkSync(regionFile);
  if (dryRun) { console.log(yellow('  (--dry-run: no se ha escrito nada)')); return; }

  const tileBytes = fs.statSync(outPath).size;
  const assets = assetBytesOnDisk(manifest);
  const total = tileBytes + assets.bytes;

  console.log('  teselas: ' + mb(tileBytes));
  console.log('  fotos y audio en disco: ' + mb(assets.bytes) +
    (assets.missing ? yellow(' (' + assets.missing + '/' + assets.total + ' aún sin subir, no se cuentan)') : ''));
  console.log('  TOTAL que descargará el móvil: ' + mb(total) + ' / ' + mb(MAX_TOTAL_BYTES));

  if (total > MAX_TOTAL_BYTES) {
    fs.unlinkSync(outPath);
    fail('el parque se pasa del presupuesto (' + mb(total) + ' > ' + mb(MAX_TOTAL_BYTES) + ').\n' +
         '  Baja --maxzoom o recorta fotos. El .pmtiles se ha borrado para no dejarlo a medias.');
  }

  manifest.tiles = {
    pmtiles: outRel,
    bbox,
    minzoom: 0,
    maxzoom,
    bytes: tileBytes,
    attribution: '<a href="https://protomaps.com">Protomaps</a> &copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
    source: source,
    builtAt: new Date().toISOString().slice(0, 10)
  };
  manifest.counts = Object.assign({}, manifest.counts, { assetBytes: assets.bytes });
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

  console.log(green('✓ ' + outRel + ' escrito y manifest.tiles actualizado'));
}

main().catch(e => fail(e.message));
