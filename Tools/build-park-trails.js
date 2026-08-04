#!/usr/bin/env node
// ================================================================================================
// build-park-trails.js — busca los senderos señalizados (GR, PR y SL) que pasan por un parque y
// genera su geo/trails.geojson.
// ------------------------------------------------------------------------------------------------
//   node Tools/build-park-trails.js <slug> [--dry-run]
//   node Tools/build-park-trails.js --all [--dry-run]
//
// Por qué existe: Cabo Cope tenía su trails.geojson hecho a mano (GR-92 recortado a su bbox desde
// Overpass). Este script generaliza ese proceso a cualquier parque y a los tres tipos de la red
// señalizada española: GR (Gran Recorrido), PR (Pequeño Recorrido) y SL (Sendero Local). Antes solo
// traía los GR, que son rutas de decenas o cientos de kilómetros y dejaban fuera precisamente los
// senderos que se recorren dentro del parque en una mañana.
//
// Criterio de pertenencia: que la traza CRUCE de verdad el polígono oficial del parque, no su bbox
// —en parques con varios recintos dispersos (p. ej. islas del Mar Menor) el bbox abarca kilómetros
// de costa por los que un sendero pasa sin tocar el espacio protegido—. El recorte final es contra
// el polígono, con un margen pequeño para no cortar un sendero que roza el límite. Si ningún
// sendero pasa de verdad por el parque no se escribe trails.geojson ni se toca el manifiesto: así
// el panel de capas (Frontend/Js/layers.js) no ofrece una capa de senderos vacía.
//
// Homologación: la geometría sale de OpenStreetMap, pero la autoridad sobre qué senderos están
// homologados y cómo se llaman oficialmente es la Federación de Montañismo de la Región de Murcia.
// Su catálogo (Tools/catalogo-nacional/data/senderos-fmrm-murcia.json) no trae trazas —sus enlaces
// van a Wikiloc y no son redistribuibles—, así que se usa como puente: si el `ref` de OSM está en
// el catálogo, el sendero se marca `homologado` y se le pone el nombre oficial. La marca solo se
// afirma, nunca se niega: el catálogo recoge una parte de la red (los senderos que se cruzaron con
// los espacios dados de alta), y los de provincias vecinas (PR-CV, PR-AB…) que entran en un parque
// fronterizo ni siquiera son competencia de la FMRM. Un sendero sin la marca es un sendero sobre el
// que no consta la homologación, no uno que no esté homologado.
//
// Fuente de geometría: OpenStreetMap vía Overpass API (© OpenStreetMap contributors, ODbL).
// ================================================================================================

'use strict';
const fs = require('fs');
const path = require('path');

const { ROOT, REGISTRY_FILE } = require('./lib/io');
const FRONTEND = path.join(ROOT, 'Frontend');
const REGISTRY = path.join(FRONTEND, 'Data', 'parks-index.json');
const FMRM_CATALOG = path.join(__dirname, 'catalogo-nacional', 'data', 'senderos-fmrm-murcia.json');
// El endpoint principal es un servicio público compartido: cuando está saturado devuelve 504
// ("the server is probably too busy"), no un fallo de la consulta. Se reintenta con espera y, si
// sigue caído, se prueba el mirror francés antes de rendirse.
const OVERPASS_URLS = ['https://overpass-api.de/api/interpreter', 'https://overpass.openstreetmap.fr/api/interpreter'];
const UA = 'NaturDex-Tool/1.0 (+https://github.com/DamiNL94/NaturDex; senderos)';

// Margen alrededor del bbox del parque al consultar Overpass: un sendero que discurre justo por el
// límite necesita nodos algo más allá para que el recorte por polígono (más abajo) tenga con qué
// trabajar.
const QUERY_PAD_DEG = 0.02;   // ~2 km
// Tolerancia de "esto es del parque": un sendero que roza el límite oficial pero va justo por fuera
// (frecuente en bordes de acantilado o de carretera, y en cualquier traza de OSM contra un límite
// administrativo digitalizado aparte) sigue contando. Antes era de 150 m y era demasiado: sembraba
// de migajas el exterior del parque. Los rodeos de verdad no los cubre esta tolerancia sino
// BRIDGE_MAX_KM, que es mucho más generoso.
const POLY_BUFFER_DEG = 0.0005; // ~50 m
// Un sendero que se sale del parque y vuelve a entrar antes de este kilometraje se conserva ENTERO,
// rodeo incluido: sobre el terreno es el mismo camino y cortarlo dejaba el sendero troceado en
// trozos que no llevaban a ninguna parte. Pasado ese umbral ya no es un rodeo: el sendero se ha ido
// a otra parte y ahí sí se corta.
// El valor sale de los dos casos reales que hay que separar: el GR-127 recorre la ribera del Segura
// por la reserva de Cañaverosa y se sale del límite cuatro veces, la mayor de 1,25 km, y debe salir
// de un trazo; el PR-MU 92 de Gebas, en cambio, se marcha 2,4 km fuera del paisaje protegido, y eso
// ya no es el mismo recorrido. 1,5 km cae entre ambos con margen por los dos lados.
const BRIDGE_MAX_KM = 1.5;
// Precisión de salida: 5 decimales ≈ 1 m. OSM sirve 7 (≈1 cm), que en un sendero de montaña es
// ruido y multiplica por dos el peso del fichero, que aquí importa: estos GeoJSON se descargan
// enteros al guardar el parque sin conexión.
const COORD_DECIMALS = 5;
// Una traza resultante más corta que esto es un roce del límite, no un paso por el parque.
const MIN_KEPT_KM = 0.1;

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

// --- Códigos de sendero -------------------------------------------------------------------------
// OSM escribe el mismo sendero de muchas formas ("GR 92", "GR-92", "GR 92 E21"). Se normaliza a la
// nomenclatura de la FMRM para poder cruzarlo con el catálogo y para no pintar dos veces el mismo
// sendero cuando OSM lo tiene partido en varias relaciones (los tramos europeos E21/E22 del GR-92
// son eso: trozos del GR-92).
function normalizeCode(ref) {
  const raw = String(ref || '').trim();
  const regional = raw.match(/^(PR|SL)[\s-]*([A-Z]{1,2})[\s-]*(\d+(?:\.\d+)?)/i);
  if (regional) return regional[1].toUpperCase() + '-' + regional[2].toUpperCase() + ' ' + regional[3];
  const gr = raw.match(/^GR[\s-]*(\d+(?:\.\d+)?)/i);
  if (gr) return 'GR-' + gr[1];
  return raw;
}

const TIPOS = {
  GR: 'Sendero de Gran Recorrido',
  PR: 'Sendero de Pequeño Recorrido',
  SL: 'Sendero Local'
};

function tipoOf(code) {
  const m = String(code).match(/^(GR|PR|SL)/i);
  return m ? TIPOS[m[1].toUpperCase()] : 'Sendero señalizado';
}

// Catálogo FMRM aplanado a código -> nombre oficial. Cubre los GR (lista propia) y los PR-MU/SL-MU
// (repartidos por espacio). Un código puede repetirse en dos espacios: el nombre es el mismo.
function loadFmrmCatalog() {
  if (!fs.existsSync(FMRM_CATALOG)) return new Map();
  const cat = readJson(FMRM_CATALOG);
  const byCode = new Map();
  const add = s => {
    const code = normalizeCode(s.codigo);
    if (code && !byCode.has(code)) byCode.set(code, (s.nombre || '').trim());
  };
  // La FMRM lista los GR con el ámbito por delante ("Región de Murcia (Sendero del Mediterráneo)")
  // porque su página es un índice regional de rutas que atraviesan varias comunidades. Como nombre
  // de sendero en la app eso sobra: se queda el paréntesis, que es el nombre propio de la ruta.
  const unwrapAmbito = s => {
    const m = String(s.nombre || '').match(/^Región de Murcia\s*\((.+)\)$/i);
    if (!m) return s;
    const inner = m[1].trim();
    return { ...s, nombre: inner.charAt(0).toUpperCase() + inner.slice(1) };
  };
  ((cat.granRecorrido && cat.granRecorrido.senderos) || []).map(unwrapAmbito).forEach(add);
  for (const key of Object.keys(cat.espacios || {})) {
    ((cat.espacios[key] || {}).senderos || []).forEach(add);
  }
  return byCode;
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

// Dentro del polígono de verdad, agujeros incluidos.
function insidePolygon(pt, geometry) {
  const polys = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  for (const rings of polys) {
    if (!rings.length) continue;
    if (pointInRing(pt, rings[0])) {
      let inHole = false;
      for (let h = 1; h < rings.length; h++) if (pointInRing(pt, rings[h])) { inHole = true; break; }
      if (!inHole) return true;
    }
  }
  return false;
}

// "Dentro" con margen: de verdad dentro, o a menos de POLY_BUFFER_DEG del borde.
// OJO a la diferencia de papeles entre las dos, que es lo que evita los senderos fantasma:
// esta tolerancia decide hasta dónde LLEGA una traza y si sigue siendo continua cuando el límite
// serpentea, pero NO decide si el sendero es del parque. Eso lo decide `insidePolygon`: una traza
// que se pasa sus 800 m enteros a 50 m del borde sin entrar nunca no es un sendero del parque,
// aunque la tolerancia la abrace (era el caso de un trozo del PR-MU 92 en Gebas, a 1,6 km del
// resto del sendero y sin tocar el paisaje protegido).
function insideWithBuffer(pt, geometry) {
  return insidePolygon(pt, geometry) || distToPolygonBoundary(pt, geometry) <= POLY_BUFFER_DEG;
}

// --- Cosido de la ruta ------------------------------------------------------------------------------
// Una relación de OSM no es una línea: es una bolsa de `way` sin orden garantizado, cada uno con su
// sentido, y partidos donde a quien los mapeó le vino bien (un cambio de superficie, un cruce…).
// Recortar way a way, como se hacía antes, heredaba ese troceado: el GR-252 salía en 95 trozos que
// en realidad se tocan de punta a punta. Peor aún, impedía razonar sobre el sendero como recorrido,
// que es lo que hace falta para distinguir "se sale del parque y vuelve" de "esto es una migaja
// suelta". Así que primero se cose la ruta encadenando los ways por sus extremos comunes, y solo
// después se decide qué parte se queda.
const endKey = p => p[0].toFixed(7) + ',' + p[1].toFixed(7);

function stitchWays(lines) {
  const pending = new Map();
  lines.forEach((c, i) => { if (c && c.length > 1) pending.set(i, c); });
  const byEnd = new Map();
  const addEnd = (k, id) => { if (!byEnd.has(k)) byEnd.set(k, []); byEnd.get(k).push(id); };
  for (const [id, c] of pending) { addEnd(endKey(c[0]), id); addEnd(endKey(c[c.length - 1]), id); }

  const chains = [];
  while (pending.size) {
    const startId = pending.keys().next().value;
    let chain = pending.get(startId).slice();
    pending.delete(startId);
    // Se extiende por los dos extremos hasta que ningún way pendiente encaje. En un nudo (una
    // variante que arranca de la traza principal) la elección es arbitraria y da igual: lo único
    // que se busca es continuidad, y el way no elegido arrancará su propia cadena.
    let grew = true;
    while (grew) {
      grew = false;
      for (const side of ['tail', 'head']) {
        const pt = side === 'tail' ? chain[chain.length - 1] : chain[0];
        const next = (byEnd.get(endKey(pt)) || []).find(id => pending.has(id));
        if (next === undefined) continue;
        const piece = pending.get(next).slice();
        pending.delete(next);
        if (side === 'tail') {
          if (endKey(piece[0]) !== endKey(pt)) piece.reverse();
          chain = chain.concat(piece.slice(1));
        } else {
          if (endKey(piece[piece.length - 1]) !== endKey(pt)) piece.reverse();
          chain = piece.slice(0, -1).concat(chain);
        }
        grew = true;
      }
    }
    chains.push(chain);
  }
  return chains;
}

// --- Qué parte de la ruta cosida se queda -----------------------------------------------------------
function bisectCrossing(pIn, pOut, geometry) {
  let a = pIn, b = pOut;
  for (let i = 0; i < 22; i++) {
    const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    if (insideWithBuffer(mid, geometry)) a = mid; else b = mid;
  }
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}

// Recorre la ruta cosida y devuelve los trozos que son "del parque":
//   · si NINGÚN vértice toca el parque, la ruta entera se descarta — ahí mueren los fragmentos
//     sueltos que quedaban flotando fuera del límite sin conectar con nada;
//   · lo de antes del primer vértice dentro y lo de después del último se recorta, para que la traza
//     no siga colgando hacia el monte de al lado;
//   · una salida del parque que vuelve a entrar antes de BRIDGE_MAX_KM se conserva entera, así el
//     sendero se dibuja de un trazo en vez de trocearse en cada mordisco del límite;
//   · y al final cada trozo tiene que entrar de verdad en el polígono (no basta con quedarse dentro
//     de la tolerancia) y medir al menos MIN_KEPT_KM.
function keepParkPortion(coords, geometry) {
  const inside = coords.map(p => insideWithBuffer(p, geometry));
  const first = inside.indexOf(true);
  if (first === -1) return [];
  const last = inside.lastIndexOf(true);

  const pieces = [];
  // Arranque: si venía de fuera, se empieza exactamente en el borde en vez de en el primer nodo.
  let current = first > 0 ? [bisectCrossing(coords[first], coords[first - 1], geometry), coords[first]] : [coords[first]];
  let i = first + 1;
  while (i <= last) {
    if (inside[i]) { current.push(coords[i]); i++; continue; }
    let j = i;
    while (j <= last && !inside[j]) j++; // `last` está dentro, así que j siempre para en un vértice dentro
    const detour = coords.slice(i - 1, j + 1);
    if (lineLengthKm(detour) <= BRIDGE_MAX_KM) {
      for (let k = i; k <= j; k++) current.push(coords[k]);
    } else {
      current.push(bisectCrossing(coords[i - 1], coords[i], geometry));
      pieces.push(current);
      current = [bisectCrossing(coords[j], coords[j - 1], geometry), coords[j]];
    }
    i = j + 1;
  }
  // Cierre simétrico al arranque.
  if (last < coords.length - 1) current.push(bisectCrossing(coords[last], coords[last + 1], geometry));
  pieces.push(current);
  return pieces.filter(p => p.length > 1 &&
    lineLengthKm(p) >= MIN_KEPT_KM &&
    p.some(pt => insidePolygon(pt, geometry))); // ha de entrar en el parque, no solo rozarlo
}

// Longitud en km (equirectangular a la latitud media del segmento: a esta escala el error es
// despreciable y evita arrastrar una dependencia). Es informativa: se publica en el popup para que
// se vea cuánto sendero hay DENTRO del parque, que casi nunca es la longitud total de la ruta.
function lineLengthKm(coords) {
  let len = 0;
  for (let i = 1; i < coords.length; i++) {
    const latMid = (coords[i][1] + coords[i - 1][1]) / 2 * Math.PI / 180;
    const dx = (coords[i][0] - coords[i - 1][0]) * Math.cos(latMid) * 111.32;
    const dy = (coords[i][1] - coords[i - 1][1]) * 110.57;
    len += Math.hypot(dx, dy);
  }
  return len;
}

function roundCoords(coords) {
  const f = Math.pow(10, COORD_DECIMALS);
  const out = [];
  for (const [lon, lat] of coords) {
    const p = [Math.round(lon * f) / f, Math.round(lat * f) / f];
    const last = out[out.length - 1];
    if (!last || last[0] !== p[0] || last[1] !== p[1]) out.push(p); // el redondeo puede fundir nodos
  }
  return out;
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

// Una sola consulta por parque: las relaciones con sus miembros (`out body`, que ya dice qué ways
// forman cada sendero) y la geometría de esos ways dentro del bbox. La versión anterior necesitaba
// una llamada extra POR RELACIÓN solo para averiguar la pertenencia; con `out body` sobra, y eso
// importa ahora que los candidatos pasan de uno o dos GR a decenas de PR y SL.
async function fetchTrails(bbox) {
  const [minLon, minLat, maxLon, maxLat] = bbox;
  const area = `(${minLat},${minLon},${maxLat},${maxLon})`;
  const q = `[out:json][timeout:180];\n` +
    `rel["route"~"^(hiking|foot)$"]["ref"~"^(GR|PR|SL)",i]${area}->.r;\n` +
    `.r out body;\n` +
    `way(r.r)${area};\n` +
    `out geom;`;
  const data = await overpass(q);
  const relations = [], ways = new Map();
  for (const el of data.elements || []) {
    if (el.type === 'relation') relations.push(el);
    else if (el.type === 'way' && el.geometry) ways.set(el.id, el);
  }
  return { relations, ways };
}

// --- Construcción de un parque --------------------------------------------------------------------
async function buildTrailsForPark(slug, registry, catalog) {
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

  console.log('▶ ' + slug + ' · buscando senderos GR/PR/SL en Overpass…');
  const { relations, ways } = await fetchTrails(queryBbox);
  if (!relations.length) { console.log(yellow('  sin candidatos en la zona')); return { slug, manifestPath, manifest, features: [] }; }
  console.log('  candidatos: ' + relations.length + ' relación(es) — ' +
    [...new Set(relations.map(r => normalizeCode(r.tags.ref)))].sort().join(', '));

  // Agrupa por código normalizado, no por relación: OSM parte algunos senderos en varias relaciones
  // (los tramos E21/E22 del GR-92) y son el mismo sendero sobre el terreno.
  // Primero se juntan los ways de todas las relaciones que comparten código y solo después se cose:
  // los tramos europeos E21/E22 del GR-92 son relaciones distintas que continúan la una a la otra,
  // y cosiéndolas por separado quedaba una costura artificial en la frontera entre ambas.
  // Los ids se deduplican en el camino: hay relaciones que listan el mismo way dos veces —el
  // PR-MU 69 repite 18 de sus 55 miembros, por ser ida y vuelta por el mismo camino— y sin esto su
  // geometría se recortaba y se dibujaba dos veces, una encima de la otra.
  const byCode = new Map();
  for (const rel of relations) {
    const code = normalizeCode(rel.tags.ref);
    if (!code) continue;
    if (!byCode.has(code)) byCode.set(code, { code, wayIds: new Set(), osmNames: new Map(), segments: [] });
    const bucket = byCode.get(code);
    for (const m of rel.members || []) if (m.type === 'way') bucket.wayIds.add(m.ref);
    const osmName = (rel.tags['name:es'] || rel.tags.name || '').trim();
    if (osmName) bucket.osmNames.set(osmName, (bucket.osmNames.get(osmName) || 0) + 1);
  }

  for (const bucket of byCode.values()) {
    const wayLines = [...bucket.wayIds].map(id => ways.get(id))
      .filter(Boolean) // miembro fuera del bbox consultado
      .map(w => w.geometry.map(pt => [pt.lon, pt.lat]));
    bucket.chains = stitchWays(wayLines);
    bucket.segments = bucket.chains.flatMap(chain => keepParkPortion(chain, geometry));
    if (!bucket.segments.length) {
      byCode.delete(bucket.code);
      console.log(yellow('  ' + bucket.code + ': no cruza el polígono oficial, descartado'));
    }
  }

  const parkName = manifest.name || slug;
  const features = [];
  for (const bucket of byCode.values()) {
    const segments = bucket.segments.map(roundCoords).filter(s => s.length > 1);
    if (!segments.length) continue;
    const km = segments.reduce((n, s) => n + lineLengthKm(s), 0);
    const oficial = catalog.get(bucket.code) || '';
    // El nombre de OSM más repetido y, a igualdad, el más corto: cuando un código agrupa varias
    // relaciones (GR-92 con sus tramos E21 y E22) el corto es el del sendero y el largo el del
    // subtramo europeo. Empatar por longitud además hace la elección determinista.
    const osmName = [...bucket.osmNames.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].length - b[0].length)
      .map(e => e[0])[0] || '';
    const baseName = oficial || osmName || bucket.code;
    // El código no se repite si el nombre ya lo lleva ("GR 92 Sendero del Mediterráneo").
    const name = baseName.replace(/[\s-]/g, '').toUpperCase().includes(bucket.code.replace(/[\s-]/g, '').toUpperCase())
      ? baseName
      : baseName + ' (' + bucket.code + ')';
    const tipo = tipoOf(bucket.code);
    // `homologado` solo se afirma cuando el código consta en el catálogo FMRM, y NUNCA se niega:
    // ese catálogo recoge 53 de los 143 PR/SL de la federación (los que se cruzaron con los espacios
    // dados de alta), así que "no está en el catálogo" no significa "no homologado". Poner
    // `homologado: false` sería publicar como dato algo que no consta.
    const homologado = catalog.has(bucket.code);
    features.push({
      type: 'Feature',
      properties: {
        codigo: bucket.code,
        name,
        tipo,
        // Kilómetros DENTRO del parque, no de la ruta entera: el frontend lo formatea y lo rotula
        // como tal en el popup (map.js). Va como número, igual que las hectáreas de los límites.
        longitudKm: Math.round(km * 100) / 100,
        ...(homologado ? { homologado: true } : {}),
        descripcion: 'Tramo del ' + bucket.code + ' a su paso por ' + parkName + '.' +
          (homologado ? ' Sendero homologado por la Federación de Montañismo de la Región de Murcia.' : ''),
        source: 'OpenStreetMap contributors (ODbL)' + (homologado ? ' · homologación: FMRM' : '')
      },
      geometry: { type: 'MultiLineString', coordinates: segments },
      // Solo para el informe en pantalla, no llega al fichero.
      _stats: { ways: bucket.wayIds.size, chains: bucket.chains.length }
    });
  }

  // De más a menos recorrido dentro del parque: el primero es el que de verdad lo vertebra.
  features.sort((a, b) => b.properties.longitudKm - a.properties.longitudKm);
  for (const f of features) {
    const s = f._stats;
    delete f._stats;
    console.log(green('  ✓ ' + f.properties.codigo.padEnd(11) + f.properties.longitudKm.toFixed(2).padStart(7) + ' km · ' +
      String(f.geometry.coordinates.length).padStart(2) + ' traza(s)') +
      '  (' + s.ways + ' ways de OSM cosidos en ' + s.chains + ')' +
      (f.properties.homologado ? '' : yellow(' · sin confirmar en el catálogo FMRM')));
  }

  return { slug, manifestPath, manifest, features };
}

// Las audioguías de ruta se escriben a mano sobre el trails.geojson (propiedades `audio` /
// `audioTranscript`, ver Tools/validate-park-data.js). Regenerar el fichero no puede tirarlas:
// se recuperan del anterior emparejando por código de sendero.
function preserveAuthoredProps(features, outPath) {
  if (!fs.existsSync(outPath)) return;
  let previous;
  try { previous = readJson(outPath); } catch { return; }
  const before = new Map();
  for (const f of previous.features || []) {
    const p = f.properties || {};
    const code = p.codigo || normalizeCode((String(p.name || '').match(/(GR|PR|SL)[\s-][\w\s.]*/) || [''])[0]);
    if (code) before.set(code, p);
  }
  for (const f of features) {
    const old = before.get(f.properties.codigo);
    if (!old) continue;
    for (const key of ['audio', 'audioTranscript']) if (old[key]) f.properties[key] = old[key];
  }
}

// Serialización compacta: la estructura queda legible y diffeable feature a feature, pero cada
// tramo va en una línea. Con 4 espacios de indentación por coordenada, Sierra Espuña (17 senderos,
// ~340 tramos) pesaba varios megas, y estos ficheros se descargan enteros al guardar sin conexión.
function stringifyTrails(fc) {
  const featureText = fc.features.map(f => {
    const props = JSON.stringify(f.properties, null, 2).split('\n').map((l, i) => i ? '      ' + l : l).join('\n');
    const lines = f.geometry.coordinates.map(seg => '        ' + JSON.stringify(seg)).join(',\n');
    return '    {\n      "type": "Feature",\n      "properties": ' + props +
      ',\n      "geometry": {\n        "type": "MultiLineString",\n        "coordinates": [\n' + lines + '\n        ]\n      }\n    }';
  }).join(',\n');
  return '{\n  "type": "FeatureCollection",\n  "name": "trails",\n' +
    '  "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },\n' +
    '  "features": [\n' + featureText + '\n  ]\n}\n';
}

function writeTrails(result, dryRun) {
  const { slug, manifestPath, manifest, features } = result;
  if (!features.length) {
    console.log(yellow('  → sin senderos dentro de ' + slug + ', no se escribe trails.geojson'));
    return;
  }
  const outRel = path.posix.join('Data', 'parks', ...manifest.geo.parque.split(/[\\/]/).slice(2, -1), 'trails.geojson');
  const outPath = path.join(FRONTEND, outRel);
  preserveAuthoredProps(features, outPath);
  if (dryRun) { console.log(yellow('  (--dry-run: no se ha escrito nada)')); return; }

  const text = stringifyTrails({ type: 'FeatureCollection', name: 'trails', features });
  const declaredPath = outRel.replace(/\\/g, '/');
  const geometryChanged = !fs.existsSync(outPath) || fs.readFileSync(outPath, 'utf8') !== text;
  const manifestChanged = manifest.geo.trails !== declaredPath;
  if (!geometryChanged && !manifestChanged) {
    console.log('  = ' + outRel + ' sin cambios (' + features.length + ' sendero(s)), no se toca nada');
    return;
  }

  fs.writeFileSync(outPath, text);
  manifest.geo.trails = declaredPath;
  // Quien ya tenga el parque guardado sin conexión conserva su copia hasta que el manifiesto diga
  // que hay algo nuevo: offline.js compara `version` y `updatedAt` (parkNeedsRevalidation) y solo
  // entonces ofrece reponer los ficheros. Sin subirlos, una corrección de la geometría no llegaría
  // nunca a quien más la necesita, que es justo el que camina el sendero sin cobertura.
  if (geometryChanged) {
    manifest.version = Number.isFinite(Number(manifest.version)) ? Number(manifest.version) + 1 : 1;
    manifest.updatedAt = new Date().toISOString().slice(0, 10);
  }
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(green('  ✓ ' + outRel + ' escrito (' + features.length + ' sendero(s), ' +
    (Buffer.byteLength(text) / 1024).toFixed(0) + ' KB)') +
    (geometryChanged ? ' · manifest v' + manifest.version + ' (' + manifest.updatedAt + ')' : ' · manifest.geo.trails declarado'));
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const all = args.includes('--all');
  const slugArg = args.find(a => !a.startsWith('--'));

  if (!all && !slugArg) fail('uso: node Tools/build-park-trails.js <slug>|--all [--dry-run]');

  const registry = readJson(REGISTRY);
  const catalog = loadFmrmCatalog();
  let slugs;
  if (all) {
    slugs = [];
    for (const c of registry.communities || []) for (const p of c.provinces || []) for (const k of p.parks) slugs.push(k.slug);
  } else {
    slugs = [slugArg];
  }

  for (const slug of slugs) {
    try {
      const result = await buildTrailsForPark(slug, registry, catalog);
      if (result) writeTrails(result, dryRun);
    } catch (e) {
      console.error(red('  error en ' + slug + ': ' + e.message));
    }
    await sleep(1000); // cortesía con Overpass API entre parques
  }
}

main().catch(e => fail(e.message));
