#!/usr/bin/env node
/*
 * NaturDex · gbif-habitats
 * ------------------------------------------------------------------------------------------------
 * Prototipo (SOLO LECTURA): estima, por cada hábitat de un parque, qué especies se han observado
 * dentro de su polígono, usando las ocurrencias georreferenciadas de GBIF (https://www.gbif.org/,
 * fuente científica pública, nodo español GBIF.ES). NO escribe nada en la BD ni en el seed.
 *
 * Diseño (escalable a toda España, el mismo por parque):
 *   1) Calcula el bounding box de los polígonos de hábitat del parque (desde su habitats.geojson).
 *   2) Descarga de GBIF TODAS las ocurrencias con coordenadas dentro de ese bbox (paginado) y las
 *      CACHEA en disco (gbif-cache-<parque>.json) para que los experimentos de filtrado sean
 *      instantáneos sin volver a descargar (--refresh fuerza la descarga).
 *   3) Hace el "point-in-polygon" LOCALMENTE de cada ocurrencia contra cada hábitat (geometría
 *      exacta, con agujeros y multipolígonos): evita el límite de complejidad/URL de GBIF.
 *   4) Analiza el RUIDO: composición taxonómica por hábitat, barrido de incertidumbre de
 *      coordenadas, y "ubicuidad" (especies presentes en casi todos los hábitats = ruido espacial,
 *      típicamente aves en vuelo). Separa Aves de no-Aves para ver cuánto se limpia el catálogo.
 *
 * Uso:   node Tools/gbif-habitats.js [--park <slug>] [--top N] [--max-uncertainty M]
 *                                    [--drop-unknown] [--refresh]
 *                                    [--out informe.md] [--json datos.json] [--birds-out aves.json]
 * ================================================================================================
 */
'use strict';

const https = require('https');
const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const FRONTEND_DIR = path.join(REPO_ROOT, 'Frontend');
const REGISTRY_FILE = path.join(FRONTEND_DIR, 'Data', 'parks-index.json');

const GBIF_HOST = 'api.gbif.org';
const PAGE = 300;
const THROTTLE_MS = 120;

// --- Flags ------------------------------------------------------------------------------------

const ARGV = process.argv.slice(2);
function flag(name, def = null) {
  const i = ARGV.indexOf(name);
  return i >= 0 && i + 1 < ARGV.length ? ARGV[i + 1] : def;
}
const has = (name) => ARGV.includes(name);
const PARK = flag('--park');
const TOP = parseInt(flag('--top', '10'), 10);
const MAX_UNCERT = flag('--max-uncertainty') ? parseFloat(flag('--max-uncertainty')) : null;
const DROP_UNKNOWN = has('--drop-unknown'); // al filtrar, descartar registros sin incertidumbre conocida
const REFRESH = has('--refresh');
const OUT_FILE = flag('--out');
const JSON_FILE = flag('--json');
const BIRDS_OUT = flag('--birds-out');
const MAX_OCC = parseInt(flag('--max-occ', '40000'), 10);

function die(msg) { console.error('✖ ' + msg); process.exit(1); }

// --- Registro de parques / geojson ------------------------------------------------------------

function resolvePark() {
  const registry = JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf8'));
  const found = [];
  for (const community of registry.communities || []) {
    for (const province of community.provinces || []) {
      for (const park of province.parks || []) {
        // Acepta 'available' (N2) y 'basic' (N1 ascendiendo a N2, que es justo el caso de uso:
        // todavía no tiene status 'available' pero ya tiene habitats.geojson). Mismo fix que
        // lib/registry.js el 2026-07-27.
        if (!['available', 'basic'].includes(park.status || '') || !park.manifest) continue;
        const manifestPath = path.join(FRONTEND_DIR, park.manifest);
        if (!fs.existsSync(manifestPath)) continue;
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        const geoRel = manifest.geo && manifest.geo.habitats;
        if (!geoRel) continue;
        const geojsonPath = path.join(FRONTEND_DIR, geoRel);
        if (!fs.existsSync(geojsonPath)) continue;
        found.push({ slug: manifest.apiSlug || park.slug, name: park.name || manifest.name || park.slug, geojsonPath });
      }
    }
  }
  if (found.length === 0) die('No hay parques con habitats.geojson en el registro.');
  if (PARK) {
    const p = found.find(f => f.slug === PARK);
    if (!p) die(`Parque '${PARK}' no encontrado. Disponibles: ${found.map(f => f.slug).join(', ')}`);
    return p;
  }
  return found[0];
}

function loadHabitats(geojsonPath) {
  const fc = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));
  const out = [];
  for (const f of fc.features || []) {
    const g = f.geometry;
    if (!g || (g.type !== 'Polygon' && g.type !== 'MultiPolygon')) continue;
    const p = f.properties || {};
    const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
    out.push({
      slug: p.slug || '(sin slug)',
      name: p.name || p.title || p.slug || '',
      hic: p.hic || p.hic_code || p.codigo || p.code || null,
      polys, bbox: bboxOf(polys),
    });
  }
  return out;
}

// --- Geometría --------------------------------------------------------------------------------

function bboxOf(polys) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const poly of polys) for (const ring of poly) for (const [x, y] of ring) {
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
  }
  return { minX, minY, maxX, maxY };
}
function inRing(x, y, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1];
    if (((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)) inside = !inside;
  }
  return inside;
}
function inHabitat(x, y, hab) {
  const b = hab.bbox;
  if (x < b.minX || x > b.maxX || y < b.minY || y > b.maxY) return false;
  for (const poly of hab.polys) {
    if (!inRing(x, y, poly[0])) continue;
    let inHole = false;
    for (let h = 1; h < poly.length; h++) if (inRing(x, y, poly[h])) { inHole = true; break; }
    if (!inHole) return true;
  }
  return false;
}

// --- GBIF + caché -----------------------------------------------------------------------------

function httpGetJson(pathQuery, attempt = 0) {
  return new Promise((resolve, reject) => {
    const req = https.get({ host: GBIF_HOST, path: pathQuery, headers: { 'Accept': 'application/json', 'User-Agent': 'NaturDex-gbif-habitats/1.0' } }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (c) => { body += c; });
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) return reject(new Error(`HTTP ${res.statusCode}: ${body.slice(0, 160)}`));
        try { resolve(JSON.parse(body)); } catch (e) { reject(new Error('JSON inválido de GBIF: ' + e.message)); }
      });
    });
    req.setTimeout(45000, () => req.destroy(new Error('timeout')));
    req.on('error', (e) => { attempt < 2 ? setTimeout(() => httpGetJson(pathQuery, attempt + 1).then(resolve, reject), 700) : reject(e); });
  });
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function downloadOccurrences(bbox) {
  const margin = 0.001;
  const latR = `${(bbox.minY - margin).toFixed(5)},${(bbox.maxY + margin).toFixed(5)}`;
  const lonR = `${(bbox.minX - margin).toFixed(5)},${(bbox.maxX + margin).toFixed(5)}`;
  const base = `/v1/occurrence/search?hasCoordinate=true&hasGeospatialIssue=false` +
    `&decimalLatitude=${encodeURIComponent(latR)}&decimalLongitude=${encodeURIComponent(lonR)}`;
  const first = await httpGetJson(`${base}&limit=0`);
  const total = Math.min(first.count || 0, MAX_OCC);
  const occ = [];
  for (let offset = 0; offset < total; offset += PAGE) {
    const page = await httpGetJson(`${base}&limit=${PAGE}&offset=${offset}`);
    for (const r of page.results || []) {
      if (typeof r.decimalLatitude !== 'number' || typeof r.decimalLongitude !== 'number') continue;
      occ.push({
        lat: r.decimalLatitude, lon: r.decimalLongitude,
        speciesKey: r.speciesKey || null, species: r.species || r.scientificName || null,
        kingdom: r.kingdom || null, class: r.class || null,
        uncertainty: typeof r.coordinateUncertaintyInMeters === 'number' ? r.coordinateUncertaintyInMeters : null,
      });
    }
    process.stdout.write(`\r  descargando ocurrencias… ${Math.min(offset + PAGE, total)}/${total}`);
    if (page.endOfRecords) break;
    await sleep(THROTTLE_MS);
  }
  process.stdout.write('\n');
  return { total: first.count || 0, capped: (first.count || 0) > MAX_OCC, occ };
}

async function getOccurrences(park, bbox) {
  const cacheFile = path.join(REPO_ROOT, `gbif-cache-${park.slug}.json`);
  if (!REFRESH && fs.existsSync(cacheFile)) {
    const c = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
    console.log(`Caché: ${c.occ.length} ocurrencias (${path.basename(cacheFile)}). Usa --refresh para volver a descargar.`);
    return c;
  }
  const data = await downloadOccurrences(bbox);
  fs.writeFileSync(cacheFile, JSON.stringify(data));
  console.log(`Descargadas y cacheadas en ${path.basename(cacheFile)}.`);
  return data;
}

// --- Análisis ---------------------------------------------------------------------------------

const isBird = (o) => o.class === 'Aves';

function passUncertainty(o) {
  if (MAX_UNCERT == null) return true;
  if (o.uncertainty == null) return !DROP_UNKNOWN;
  return o.uncertainty <= MAX_UNCERT;
}

function main() {
  const park = resolvePark();
  const habitats = loadHabitats(park.geojsonPath);
  if (habitats.length === 0) die('El geojson no tiene polígonos de hábitat.');
  console.log(`Parque: ${park.name} (${park.slug}) · ${habitats.length} hábitats`);
  const bbox = bboxOf(habitats.flatMap(h => h.polys));

  getOccurrences(park, bbox).then(({ total, capped, occ }) => {
    const used = occ.filter(passUncertainty);
    console.log(`GBIF: ${total} en bbox${capped ? ` (limitado a ${MAX_OCC})` : ''}; ${used.length} tras filtro de incertidumbre` +
      `${MAX_UNCERT != null ? ` (≤ ${MAX_UNCERT} m${DROP_UNKNOWN ? ', descartando desconocidas' : ', desconocidas incluidas'})` : ' (sin filtro)'}.\n`);

    // Point-in-polygon.
    for (const h of habitats) { h.occ = 0; h.birdsOcc = 0; h.species = new Map(); }
    const spInHab = new Map();      // speciesKey -> {name, class, habitats:Set}
    const birds = new Map();        // speciesKey -> {name, count, habitats:Set} (solo Aves, dentro de hábitats)
    let assigned = 0, orphan = 0;
    for (const o of used) {
      let hit = false;
      for (const h of habitats) {
        if (!inHabitat(o.lon, o.lat, h)) continue;
        hit = true; h.occ++; if (isBird(o)) h.birdsOcc++;
        if (o.speciesKey) {
          const cur = h.species.get(o.speciesKey) || { name: o.species, class: o.class, count: 0 };
          cur.count++; h.species.set(o.speciesKey, cur);
          const s = spInHab.get(o.speciesKey) || { name: o.species, class: o.class, habitats: new Set() };
          s.habitats.add(h.slug); spInHab.set(o.speciesKey, s);
          if (isBird(o)) { const b = birds.get(o.speciesKey) || { name: o.species, count: 0, habitats: new Set() }; b.count++; b.habitats.add(h.slug); birds.set(o.speciesKey, b); }
        }
      }
      if (hit) assigned++; else orphan++;
    }

    const md = renderReport(park, habitats, { total, capped, usedCount: used.length, allOcc: occ, assigned, orphan, spInHab, birds });
    console.log(md);
    if (OUT_FILE) { fs.writeFileSync(path.resolve(OUT_FILE), md); console.log(`\nInforme escrito en ${path.resolve(OUT_FILE)}`); }
    if (JSON_FILE) writeJson(park, habitats);
    if (BIRDS_OUT) writeBirds(park, birds);
  }).catch(e => die(e.stack || e.message));
}

function classHistogram(list) {
  const m = new Map();
  for (const o of list) { const k = o.class || '(sin clase)'; m.set(k, (m.get(k) || 0) + 1); }
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

function uncertaintySweep(allOcc) {
  const known = allOcc.filter(o => o.uncertainty != null);
  const thresholds = [null, 1000, 500, 250, 100];
  return { total: allOcc.length, known: known.length, rows: thresholds.map(t => ({
    t, keptLenient: allOcc.filter(o => t == null ? true : (o.uncertainty == null || o.uncertainty <= t)).length,
    keptStrict: allOcc.filter(o => t == null ? (o.uncertainty != null) : (o.uncertainty != null && o.uncertainty <= t)).length,
  })) };
}

function renderReport(park, habitats, s) {
  const L = [];
  const distinct = s.spInHab.size;
  const birdSp = [...s.spInHab.values()].filter(v => v.class === 'Aves').length;
  const nonBirdSp = distinct - birdSp;

  L.push(`# Especies por hábitat + análisis de ruido (GBIF) — ${park.name}\n`);
  L.push('Fuente: GBIF (ocurrencias georreferenciadas) · método: point-in-polygon local.\n');

  L.push('## 1. Resumen\n');
  L.push(`- Ocurrencias en bbox: **${s.total}**${s.capped ? ' (limitado)' : ''} · usadas tras filtro: **${s.usedCount}**`);
  L.push(`- Dentro de algún hábitat: **${s.assigned}** · fuera: **${s.orphan}**`);
  L.push(`- Especies distintas en hábitats: **${distinct}** → **Aves ${birdSp}** / no-Aves **${nonBirdSp}**\n`);

  L.push('## 2. Composición taxonómica (ocurrencias dentro de hábitats, por clase)\n');
  const perClass = new Map();
  for (const h of habitats) for (const v of h.species.values()) perClass.set(v.class || '(sin clase)', (perClass.get(v.class || '(sin clase)') || 0) + v.count);
  const classRows = [...perClass.entries()].sort((a, b) => b[1] - a[1]);
  const totalClassOcc = classRows.reduce((a, [, c]) => a + c, 0) || 1;
  L.push('| Clase | Ocurrencias | % |');
  L.push('|---|---:|---:|');
  for (const [k, c] of classRows.slice(0, 10)) L.push(`| ${k} | ${c} | ${(100 * c / totalClassOcc).toFixed(1)}% |`);
  L.push('');

  L.push('## 3. Barrido de incertidumbre de coordenadas\n');
  const sw = uncertaintySweep(s.allOcc);
  L.push(`Registros con incertidumbre declarada: **${sw.known}/${sw.total}** (${(100 * sw.known / sw.total).toFixed(0)}%).`);
  L.push('| Umbral | Pasan (desc. incluidas) | Pasan (solo con dato) |');
  L.push('|---|---:|---:|');
  for (const r of sw.rows) L.push(`| ${r.t == null ? 'sin filtro' : '≤ ' + r.t + ' m'} | ${r.keptLenient} | ${r.keptStrict} |`);
  L.push('');

  L.push('## 4. Especies ubicuas (ruido espacial: presentes en muchos hábitats)\n');
  const ubiq = [...s.spInHab.values()].map(v => ({ name: v.name, class: v.class, n: v.habitats.size }))
    .filter(v => v.n >= Math.ceil(habitats.length * 0.6)).sort((a, b) => b.n - a.n);
  const ubiqBirds = ubiq.filter(v => v.class === 'Aves').length;
  L.push(`Especies en ≥ ${Math.ceil(habitats.length * 0.6)}/${habitats.length} hábitats: **${ubiq.length}** (de ellas Aves: **${ubiqBirds}**).\n`);
  L.push('| Especie | Clase | nº hábitats |');
  L.push('|---|---|---:|');
  for (const v of ubiq.slice(0, 15)) L.push(`| ${v.name} | ${v.class || '—'} | ${v.n} |`);
  L.push('');

  L.push('## 5. Por hábitat: total vs sin Aves (cuánto ruido se va)\n');
  L.push('| Hábitat | HIC | Especies | Aves | **No-Aves** | Top no-Aves |');
  L.push('|---|---|---:|---:|---:|---|');
  for (const h of [...habitats].sort((a, b) => b.species.size - a.species.size)) {
    const vals = [...h.species.values()];
    const nonBird = vals.filter(v => v.class !== 'Aves');
    const top = nonBird.sort((a, b) => b.count - a.count).slice(0, TOP).map(v => `${v.name} (${v.count})`).join('; ') || '—';
    L.push(`| ${h.name} <br><small>${h.slug}</small> | ${h.hic || '—'} | ${h.species.size} | ${vals.length - nonBird.length} | **${nonBird.length}** | ${top} |`);
  }
  L.push('\n> Las Aves son el grueso del ruido espacial (registros en vuelo/marinos que caen en cualquier');
  L.push('> polígono). Quitándolas, los hábitats botánicos quedan con su flora coherente. Las Aves NO se');
  L.push('> tiran: van a un apartado propio (migratorias/ZEPA) contrastable con la lista oficial del espacio.');
  return L.join('\n');
}

function writeJson(park, habitats) {
  const dump = { park: park.slug, generatedFrom: 'GBIF + local point-in-polygon',
    habitats: habitats.map(h => ({ slug: h.slug, hic: h.hic, occurrences: h.occ, speciesCount: h.species.size,
      species: [...h.species.entries()].map(([k, v]) => ({ speciesKey: +k, name: v.name, class: v.class, occurrences: v.count })).sort((a, b) => b.occurrences - a.occurrences) })) };
  fs.writeFileSync(path.resolve(JSON_FILE), JSON.stringify(dump, null, 2));
  console.log(`Datos por hábitat escritos en ${path.resolve(JSON_FILE)}`);
}
function writeBirds(park, birds) {
  const list = [...birds.entries()].map(([k, v]) => ({ speciesKey: +k, name: v.name, occurrences: v.count, habitats: v.habitats.size }))
    .sort((a, b) => b.occurrences - a.occurrences);
  fs.writeFileSync(path.resolve(BIRDS_OUT), JSON.stringify({ park: park.slug, birdSpecies: list.length, birds: list }, null, 2));
  console.log(`Aves (para cruce ZEPA) escritas en ${path.resolve(BIRDS_OUT)} — ${list.length} especies.`);
}

main();
