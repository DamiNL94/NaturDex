#!/usr/bin/env node
/*
 * NaturDex · catalogo-nacional/build-habitats
 * ------------------------------------------------------------------------------------------------
 * CAPA 2 del catálogo nacional: construye la capa OFICIAL de hábitats de un parque a partir de la
 * Cartografía de Hábitats de la Directiva 92/43/CEE del MITECO/BDN.
 *
 *   shapefile (recintos, ETRS89 UTM)  +  Habi<NN>.dbf (HIC/asociación/prioridad por recinto)
 *        │  reproyecta UTM<zona> → WGS84
 *        │  une por CODIGO  (un recinto puede tener VARIOS HIC = mosaico)
 *        │  recorta al límite del parque
 *        ▼
 *   <slug>-oficial.geojson  (un Feature por recinto, con su combinación HIC)
 *
 * Es SOLO LECTURA sobre los datos del repo: no toca la BD, ni el seed, ni el habitats.geojson
 * curado. Escribe únicamente su fichero de salida.
 *
 * Descarga previa (manual, por región NN = código de provincia; Murcia = 30) desde
 * https://www.miteco.gob.es/es/biodiversidad/servicios/banco-datos-naturaleza/informacion-disponible/habitat_descargas_2.html
 *   - DirectivaHabitat<NN>_1997_*.zip  → shapefile (.shp + .dbf)
 *   - directivadatos_<NN>_*.zip        → Habi<NN>.dbf
 *
 * Uso:
 *   node Tools/catalogo-nacional/build-habitats.js --park <slug> --shp <ruta.shp> \
 *        --habi <ruta/Habi30.dbf> --zone 30 [--boundary <ruta.geojson>] [--out <salida.geojson>]
 *
 * Ojo: el huso UTM depende de la región (28N Canarias, 29N, 30N, 31N). Ver README.md.
 * ================================================================================================
 */
'use strict';

const fs = require('fs');
const path = require('path');
const pc = require('polygon-clipping');
const { readDbf } = require('./lib/dbf');
const { readPolygons, utmToLonLat } = require('./lib/shapefile');
const { bbox, bboxOverlap, inRing, signedArea } = require('./lib/geo');
const { resolvePark, readBoundaryRing } = require('./lib/registry');

const REPO_ROOT = path.resolve(__dirname, '..', '..');

// --- Flags ------------------------------------------------------------------------------------
const ARGV = process.argv.slice(2);
const flag = (n, d = null) => { const i = ARGV.indexOf(n); return i >= 0 && i + 1 < ARGV.length ? ARGV[i + 1] : d; };
const die = (m) => { console.error('✖ ' + m); process.exit(1); };

const PARK = flag('--park');
const SHP = flag('--shp');
const HABI = flag('--habi');
const ZONE = parseInt(flag('--zone', '30'), 10);
const BOUNDARY = flag('--boundary');
const OUT = flag('--out');

if (ARGV.includes('--help')) { console.log(fs.readFileSync(__filename, 'utf8').split('*/')[0]); process.exit(0); }
if (!SHP || !HABI) die('Faltan --shp y/o --habi. Ver: node Tools/catalogo-nacional/build-habitats.js --help');
if (!fs.existsSync(SHP)) die(`No existe el shapefile: ${SHP}`);
if (!fs.existsSync(HABI)) die(`No existe la tabla Habi: ${HABI}`);
if (!Number.isInteger(ZONE) || ZONE < 27 || ZONE > 31) die(`--zone debe ser un huso UTM válido (28..31). Recibido: ${ZONE}`);

// El .dbf de atributos del shapefile es el hermano del .shp.
const SHP_DBF = SHP.replace(/\.shp$/i, '.dbf');
if (!fs.existsSync(SHP_DBF)) die(`No encuentro el .dbf del shapefile junto a ${SHP}`);

// --- Programa ---------------------------------------------------------------------------------

function main() {
  const park = resolvePark(REPO_ROOT, PARK);
  const boundaryPath = BOUNDARY || park.boundaryPath;
  if (!fs.existsSync(boundaryPath)) die(`No existe el límite del parque: ${boundaryPath}. Pásalo con --boundary.`);
  const parkRing = readBoundaryRing(boundaryPath);
  const parkPoly = [parkRing];
  const pbb = bbox(parkRing);
  console.log(`Parque: ${park.name} (${park.slug}) · huso UTM ${ZONE}N · límite: ${path.relative(REPO_ROOT, boundaryPath)}`);

  const recs = readPolygons(SHP);
  const attrs = readDbf(SHP_DBF).rows;      // CODIGO por índice de registro
  const habiRows = readDbf(HABI).rows;      // CODIGO -> N filas (mosaico de HIC)
  console.log(`Fuente: ${recs.length} recintos en el shapefile · ${habiRows.length} filas de hábitat en ${path.basename(HABI)}`);

  const byCod = new Map();
  for (const h of habiRows) { if (!byCod.has(h.CODIGO)) byCod.set(h.CODIGO, []); byCod.get(h.CODIGO).push(h); }

  const features = [];
  let skipNoHic = 0, clipped = 0;
  for (let i = 0; i < recs.length; i++) {
    const rings = recs[i];
    if (!rings) continue;
    // Reproyecta todos los anillos del recinto a WGS84.
    const ll = rings.map(r => r.map(([x, y]) => utmToLonLat(x, y, ZONE)));
    if (!bboxOverlap(bbox(ll[0]), pbb)) continue;

    const habs = habitatsOf(byCod, attrs[i] && attrs[i].CODIGO);
    if (habs.length === 0) { skipNoHic++; continue; } // marco/artefactos sin atributos

    // Recorta el recinto (como MultiPolygon con sus agujeros) contra el límite del parque.
    let inter;
    try { inter = pc.intersection(recintoMultiPolygon(ll), parkPoly); }
    catch (e) { console.warn(`  ⚠ recinto ${attrs[i].CODIGO}: fallo al recortar (${e.message}), se omite`); continue; }
    if (!inter || inter.length === 0) continue;
    clipped++;

    const coords = inter.map(poly => poly.map(ring => ring.map(([x, y]) => [+x.toFixed(6), +y.toFixed(6)])));
    const geometry = coords.length === 1 ? { type: 'Polygon', coordinates: coords[0] } : { type: 'MultiPolygon', coordinates: coords };
    const dominante = habs.slice().sort((a, b) => b.cobertura - a.cobertura)[0];
    features.push({
      type: 'Feature',
      properties: {
        recinto: attrs[i].CODIGO,
        hic_dominante: dominante.hic,
        n_habitats: habs.length,
        habitats: habs,
        prioritario_1997: habs.some(h => h.prioritario_1997),
        fuente: `MITECO/BDN — Cartografía Hábitat Directiva 92/43/CEE (1997); recinto recortado al límite del parque y reproyectado ETRS89 UTM${ZONE}N→WGS84`,
      },
      geometry,
    });
  }

  const outPath = OUT || path.join(__dirname, 'out', `${park.slug}-oficial.geojson`);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify({ type: 'FeatureCollection', features }));

  // --- Validación ---
  let outside = 0, totV = 0;
  for (const f of features) {
    const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
    for (const poly of polys) for (const [x, y] of poly[0]) {
      totV++;
      if (!inRing(x, y, parkRing) && (x < pbb[0] - 1e-4 || x > pbb[2] + 1e-4 || y < pbb[1] - 1e-4 || y > pbb[3] + 1e-4)) outside++;
    }
  }
  const hic = new Map();
  for (const f of features) for (const h of f.properties.habitats) hic.set(h.hic || '(sin HIC)', (hic.get(h.hic || '(sin HIC)') || 0) + 1);
  console.log(`\nRecintos en el parque: ${features.length} (recortados: ${clipped}) · descartados sin atributos: ${skipNoHic}`);
  console.log(`Validación · vértices fuera del parque: ${outside}/${totV} ${outside === 0 ? '✔' : '✖'}`);
  console.log(`HIC presentes: ${[...hic.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${v}`).join('  ')}`);
  console.log(`\n→ ${path.relative(REPO_ROOT, outPath)}`);
}

// Filas de Habi<NN> para un recinto, deduplicadas por HIC+código de hábitat.
function habitatsOf(byCod, codigo) {
  const rows = byCod.get(codigo) || [];
  const seen = new Set(), out = [];
  for (const r of rows) {
    const key = r.CODIGO_UE + '|' + r.CODHABITAT;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      hic: r.CODIGO_UE || null,
      cod_habitat: r.CODHABITAT || null,
      concepto: limpiaConcepto(r.CONCEPTO),
      // Flag original de la fuente 1997: poco fiable, se conserva solo por trazabilidad.
      // La prioridad real la asigna merge-habitats.js desde data/hic-prioritarios.json.
      prioritario_1997: r.PRIORITARI === '*',
      cobertura: parseFloat(r.COBERTURA) || 0,
    });
  }
  return out;
}

// El CONCEPTO trae marcas tipográficas (+ y $) alrededor de los sintaxones.
function limpiaConcepto(s) { return s ? String(s).replace(/[+$]/g, '').replace(/\s+/g, ' ').trim() : null; }

// Convierte los anillos de un recinto en MultiPolygon: exteriores (CW, área<0) con sus agujeros.
function recintoMultiPolygon(rings) {
  const outers = [], holes = [];
  for (const r of rings) (signedArea(r) < 0 ? outers : holes).push(r);
  return outers.map(o => {
    const poly = [o];
    for (const h of holes) if (h.some(p => inRing(p[0], p[1], o))) poly.push(h);
    return poly;
  });
}

try { main(); } catch (e) { die(e.stack || e.message); }
