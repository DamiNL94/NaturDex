#!/usr/bin/env node
// ================================================================================================
// build-park-trails.js — busca senderos de Gran Recorrido (GR) que pasan por un parque y genera
// su geo/trails.geojson.
// ------------------------------------------------------------------------------------------------
//   node Tools/build-park-trails.js <slug> [--dry-run]
//   node Tools/build-park-trails.js --all [--dry-run]
//
// Por qué existe: Cabo Cope tenía su trails.geojson hecho a mano (GR-92 recortado a su bbox desde
// Overpass). Este script generaliza ese proceso a cualquier parque: consulta Overpass API por
// relaciones route=hiking cuyo ref contenga "GR", y de las que de verdad CRUZAN el polígono oficial
// del parque (no solo su bbox, que en parques con varios recintos dispersos —p. ej. islas del Mar
// Menor— puede abarcar kilómetros de costa por los que el GR pasa sin tocar el espacio protegido).
// El recorte final es contra el polígono, con un margen pequeño para no cortar un sendero que roza
// el límite. Si ningún GR pasa de verdad por el parque, no se escribe trails.geojson ni se toca el
// manifiesto: así el panel de capas (Frontend/Js/layers.js) no ofrece una capa de senderos vacía.
//
// Fuente: OpenStreetMap vía Overpass API (© OpenStreetMap contributors, ODbL).
// ================================================================================================

'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const FRONTEND = path.join(ROOT, 'Frontend');
const REGISTRY = path.join(FRONTEND, 'Data', 'parks-index.json');
// El endpoint principal es un servicio público compartido: cuando está saturado devuelve 504
// ("the server is probably too busy"), no un fallo de la consulta. Se reintenta con espera y, si
// sigue caído, se prueba el mirror francés antes de rendirse.
const OVERPASS_URLS = ['https://overpass-api.de/api/interpreter', 'https://overpass.openstreetmap.fr/api/interpreter'];
const UA = 'NaturDex-Tool/1.0 (+https://github.com/DamiNL94/NaturDex; senderos GR)';

// Margen alrededor del bbox del parque al consultar Overpass: un sendero que discurre justo por el
// límite necesita nodos algo más allá para que el recorte por polígono (más abajo) tenga con qué
// trabajar. Margen de recorte final contra el polígono: un sendero que roza el límite oficial pero
// va justo por fuera (frecuente en bordes de acantilado o carretera) sigue contando como "del parque".
const QUERY_PAD_DEG = 0.02;   // ~2 km
const POLY_BUFFER_DEG = 0.0015; // ~150 m

const red = s => '\x1b[31m' + s + '\x1b[0m';
const green = s => '\x1b[32m' + s + '\x1b[0m';
const yellow = s => '\x1b[33m' + s + '\x1b[0m';

function fail(msg) { console.error(red('✖ ' + msg)); process.exit(1); }
function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }

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

// --- Geometría del límite oficial (misma lógica que build-park-tiles.js) --------------------------
function parkGeometry(boundaryPath) {
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
  return geometry;
}

function bboxOfGeometry(geometry) {
  const rings = geometry.type === 'Polygon' ? geometry.coordinates : geometry.coordinates.flat();
  let minLon = Infinity, minLat = Infinity, maxLon = -Infinity, maxLat = -Infinity;
  rings.flat().forEach(([lon, lat]) => {
    if (lon < minLon) minLon = lon;
    if (lat < minLat) minLat = lat;
    if (lon > maxLon) maxLon = lon;
    if (lat > maxLat) maxLat = lat;
  });
  return [minLon, minLat, maxLon, maxLat];
}

// --- Punto en polígono (ray casting, admite agujeros y MultiPolygon) -------------------------------
function pointInRing(pt, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1];
    const intersect = ((yi > pt[1]) !== (yj > pt[1])) && (pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function distToSegment(pt, a, b) {
  const [px, py] = pt, [ax, ay] = a, [bx, by] = b;
  const dx = bx - ax, dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  let t = lenSq === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + t * dx, cy = ay + t * dy;
  return Math.hypot(px - cx, py - cy);
}

function distToPolygonBoundary(pt, geometry) {
  const polys = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  let min = Infinity;
  for (const rings of polys) {
    for (const ring of rings) {
      for (let i = 0; i < ring.length - 1; i++) {
        const d = distToSegment(pt, ring[i], ring[i + 1]);
        if (d < min) min = d;
      }
    }
  }
  return min;
}

// "Dentro" con margen: de verdad dentro del polígono, o a menos de POLY_BUFFER_DEG de su borde.
function insideWithBuffer(pt, geometry) {
  const polys = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  for (const rings of polys) {
    if (!rings.length) continue;
    if (pointInRing(pt, rings[0])) {
      let inHole = false;
      for (let h = 1; h < rings.length; h++) if (pointInRing(pt, rings[h])) { inHole = true; break; }
      if (!inHole) return true;
    }
  }
  return distToPolygonBoundary(pt, geometry) <= POLY_BUFFER_DEG;
}

// --- Recorte de una polilínea contra el polígono (con el margen de arriba) -------------------------
function bisectCrossing(p0, p1, in0, geometry) {
  let a = p0, b = p1;
  for (let i = 0; i < 22; i++) {
    const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    if (insideWithBuffer(mid, geometry) === in0) a = mid; else b = mid;
  }
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}

function clipLineToPolygon(coords, geometry) {
  const lines = [];
  let current = [];
  let prevPt = null, prevIn = null;
  for (const p of coords) {
    const isIn = insideWithBuffer(p, geometry);
    if (prevPt && isIn !== prevIn) {
      const c = bisectCrossing(prevPt, p, prevIn, geometry);
      if (prevIn) { current.push(c); lines.push(current); current = []; }
      else { current = [c]; }
    }
    if (isIn) current.push(p);
    prevPt = p; prevIn = isIn;
  }
  if (current.length > 1) lines.push(current);
  return lines;
}

function lineLengthDeg(coords) {
  let len = 0;
  for (let i = 1; i < coords.length; i++) len += Math.hypot(coords[i][0] - coords[i - 1][0], coords[i][1] - coords[i - 1][1]);
  return len;
}

// --- Overpass ---------------------------------------------------------------------------------------
async function overpass(query, attempt = 1) {
  // 2 intentos en el endpoint principal, luego se prueba el mirror.
  const url = OVERPASS_URLS[attempt <= 2 ? 0 : 1] || OVERPASS_URLS[0];
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': '*/*', 'User-Agent': UA },
    body: 'data=' + encodeURIComponent(query)
  });
  let bodyLooksLikeError = false;
  if (res.ok) {
    const text = await res.text();
    if (/runtime error|too busy|rate_limited/i.test(text)) bodyLooksLikeError = true;
    else return JSON.parse(text);
  }
  if (!res.ok || bodyLooksLikeError) {
    // 504/429/"demasiado ocupado": el servidor público (compartido) está saturado, no un fallo de
    // la consulta. Reintenta con espera creciente y, a partir del 3er intento, prueba el mirror.
    if (attempt < 5) {
      await sleep(4000 * attempt);
      return overpass(query, attempt + 1);
    }
    throw new Error('Overpass no disponible tras ' + attempt + ' intentos (HTTP ' + res.status + ')');
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Normaliza "GR 92", "GR92", "GR-92" -> "GR-92" para las etiquetas.
function normalizeRef(ref) {
  const m = String(ref || '').match(/GR[\s-]?(\d+)/i);
  return m ? 'GR-' + m[1] : String(ref || '').trim();
}

async function findGrRelations(bbox) {
  const [minLon, minLat, maxLon, maxLat] = bbox;
  const q = `[out:json][timeout:60];\nrel["route"="hiking"]["ref"~"GR",i](${minLat},${minLon},${maxLat},${maxLon});\nout tags;`;
  const data = await overpass(q);
  return (data.elements || []).filter(e => e.type === 'relation');
}

async function fetchWaysForRelations(relIds, bbox) {
  if (!relIds.length) return [];
  const [minLon, minLat, maxLon, maxLat] = bbox;
  const ids = relIds.join(',');
  const q = `[out:json][timeout:60];\nrel(id:${ids});\nway(r)(${minLat},${minLon},${maxLat},${maxLon});\nout geom;`;
  const data = await overpass(q);
  return (data.elements || []).filter(e => e.type === 'way' && e.geometry);
}

// Averigua a qué relaciones (GR) pertenece cada way devuelto, para poder agrupar los tramos por
// sendero cuando hay más de un GR candidato. Se hace con una llamada por relación (son pocas por
// parque) en vez de una única consulta combinada, porque Overpass QL no deja anotar de forma
// sencilla "a qué relación pertenece" dentro de un `out geom` de ways sueltos.
async function relationsOfWays(wayIds, relIds) {
  if (!wayIds.length) return {};
  const idsWay = wayIds.join(',');
  const map = {};
  for (const relId of relIds) {
    const qq = `[out:json][timeout:60];\nrel(${relId});\nway(r)->.w;\nway.w(id:${idsWay});\nout ids;`;
    const data = await overpass(qq);
    for (const el of data.elements || []) {
      if (el.type === 'way') { (map[el.id] = map[el.id] || []).push(relId); }
    }
    await sleep(400);
  }
  return map;
}

async function buildTrailsForPark(slug, registry, opts) {
  const entry = findParkEntry(registry, slug);
  if (!entry) { console.error(red('  el slug "' + slug + '" no está en parks-index.json')); return null; }

  const manifestPath = path.join(FRONTEND, entry.manifest);
  const manifest = readJson(manifestPath);
  const boundaryRel = manifest.geo && manifest.geo.parque;
  if (!boundaryRel) { console.error(red('  sin geo.parque: no se puede recortar')); return null; }
  const boundaryPath = path.join(FRONTEND, boundaryRel);
  const geometry = parkGeometry(boundaryPath);
  if (!geometry) { console.error(red('  límite sin polígono utilizable')); return null; }

  const bbox = bboxOfGeometry(geometry);
  const queryBbox = [bbox[0] - QUERY_PAD_DEG, bbox[1] - QUERY_PAD_DEG, bbox[2] + QUERY_PAD_DEG, bbox[3] + QUERY_PAD_DEG];

  console.log('▶ ' + slug + ' · buscando senderos GR en Overpass…');
  const relations = await findGrRelations(queryBbox);
  await sleep(500);
  if (!relations.length) { console.log(yellow('  sin candidatos GR en la zona')); return { slug, features: [] }; }

  const relIds = relations.map(r => r.id);
  console.log('  candidatos: ' + relations.map(r => (r.tags && (r.tags.ref || r.tags.name)) || r.id).join(', '));

  const ways = await fetchWaysForRelations(relIds, queryBbox);
  await sleep(500);
  if (!ways.length) { console.log(yellow('  el/los GR candidato(s) no tienen tramo cerca del parque')); return { slug, features: [] }; }

  const wayOwners = relations.length > 1
    ? await relationsOfWays(ways.map(w => w.id), relIds)
    : Object.fromEntries(ways.map(w => [w.id, [relIds[0]]]));

  // Agrupa por relación (= por sendero), recorta cada way contra el polígono real del parque y
  // descarta lo que no llega a tocarlo.
  const byRelation = new Map();
  for (const way of ways) {
    const coords = way.geometry.map(pt => [pt.lon, pt.lat]);
    const clipped = clipLineToPolygon(coords, geometry);
    const meaningful = clipped.filter(seg => lineLengthDeg(seg) > 0.00005); // > ~5 m
    if (!meaningful.length) continue;
    const owners = wayOwners[way.id] || relIds;
    for (const relId of owners) {
      if (!byRelation.has(relId)) byRelation.set(relId, []);
      byRelation.get(relId).push(...meaningful);
    }
  }

  const features = [];
  const parkName = manifest.name || slug;
  for (const rel of relations) {
    const segs = byRelation.get(rel.id);
    if (!segs || !segs.length) {
      console.log(yellow('  ' + (rel.tags.ref || rel.id) + ': no cruza el polígono oficial, descartado'));
      continue;
    }
    const ref = normalizeRef(rel.tags.ref);
    const spanishName = rel.tags['name:es'] || rel.tags.name || ref;
    const label = spanishName.toLowerCase().includes(ref.toLowerCase().replace('-', ' ')) || spanishName.includes(ref)
      ? spanishName
      : spanishName + ' (' + ref + ')';
    features.push({
      type: 'Feature',
      properties: {
        name: label,
        tipo: 'Sendero de Gran Recorrido',
        descripcion: 'Tramo del ' + ref + (rel.tags.name ? ' / ' + rel.tags.name : '') + ' a su paso por ' + parkName + '.',
        source: 'OpenStreetMap contributors (ODbL)'
      },
      geometry: { type: 'MultiLineString', coordinates: segs }
    });
    console.log(green('  ✓ ' + ref + ': ' + segs.length + ' tramo(s) dentro del parque'));
  }

  return { slug, manifestPath, manifest, features };
}

function writeTrails(result, dryRun) {
  const { slug, manifestPath, manifest, features } = result;
  if (!features.length) {
    console.log(yellow('  → sin GR dentro de ' + slug + ', no se escribe trails.geojson'));
    return;
  }
  if (dryRun) { console.log(yellow('  (--dry-run: no se ha escrito nada)')); return; }

  const outRel = path.posix.join('Data', 'parks', ...manifest.geo.parque.split(/[\\/]/).slice(2, -1), 'trails.geojson');
  const outPath = path.join(FRONTEND, outRel);
  const fc = {
    type: 'FeatureCollection',
    name: 'trails',
    crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' } },
    features
  };
  fs.writeFileSync(outPath, JSON.stringify(fc, null, 4) + '\n');
  manifest.geo.trails = outRel.replace(/\\/g, '/');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(green('  ✓ ' + outRel + ' escrito (' + features.length + ' sendero(s)) y manifest.geo.trails actualizado'));
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const all = args.includes('--all');
  const slugArg = args.find(a => !a.startsWith('--'));

  if (!all && !slugArg) fail('uso: node Tools/build-park-trails.js <slug>|--all [--dry-run]');

  const registry = readJson(REGISTRY);
  let slugs;
  if (all) {
    slugs = [];
    for (const c of registry.communities || []) for (const p of c.provinces || []) for (const k of p.parks) slugs.push(k.slug);
  } else {
    slugs = [slugArg];
  }

  for (const slug of slugs) {
    try {
      const result = await buildTrailsForPark(slug, registry);
      if (result) writeTrails(result, dryRun);
    } catch (e) {
      console.error(red('  error en ' + slug + ': ' + e.message));
    }
    await sleep(1000); // cortesía con Overpass API entre parques
  }
}

main().catch(e => fail(e.message));
