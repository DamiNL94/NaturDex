#!/usr/bin/env node
// ================================================================================================
// build-park-pois.js — busca CANDIDATOS a punto de interés dentro del límite de un parque.
// ------------------------------------------------------------------------------------------------
//   node Tools/build-park-pois.js <slug> [--fuente=auto|overpass|basemap] [--dry-run]
//   node Tools/build-park-pois.js --all  [--fuente=…] [--dry-run]
//
// Por qué existe: la Fase 3 del rollout (N3) añade a cada espacio la capa de "qué hay que ver aquí
// y por qué". Hasta ahora esa búsqueda se hacía entera a mano, espacio por espacio. Este script
// automatiza SOLO la parte mecánica —barrer el territorio del parque y traer todo lo que tiene
// nombre y coordenada— y deja escrito un documento de trabajo con los candidatos ya recortados al
// polígono, clasificados y con los descartes automáticos justificados por su regla.
//
// ESCRIBE CANDIDATOS, NUNCA park.json. Es la regla del §4.4 de Docs/prompts/e-rollout-nacional.md y
// no es una precaución de más: la descripción de un POI son dos o cuatro frases redactadas con la
// fuente delante, y de los 15 del piloto de Cabo Cope no salió ni uno tal cual de una consulta. Lo
// que este script propone es dónde mirar; qué entra y qué se cuenta de ello lo decide una persona.
//
// Dos fuentes para lo mismo (OpenStreetMap), y conviene saber cuál se ha usado:
//   · `overpass`  — el OSM vivo, con las etiquetas completas del §4.2. Es la buena cuando hay red:
//                   trae `historic=*`, `man_made=*` y todo lo que el basemap filtra. A cambio, dos
//                   ejecuciones en fechas distintas pueden dar listas distintas.
//   · `basemap`   — `tiles/base.pmtiles`, el recorte de Protomaps que el parque ya lleva en el repo
//                   (ODbL, ver build-park-tiles.js). No necesita red y está congelado en la fecha de
//                   su build, así que es reproducible; a cambio ve menos: solo las capas `pois`,
//                   `places` y `water`, y solo lo que sobrevive al filtro de zoom de Protomaps.
//   · `auto`      — Overpass y, si no responde, el basemap, diciéndolo en el informe. Un candidato
//                   que solo aparece por basemap NO significa que OSM no tenga más: significa que
//                   esa consulta no se ha podido hacer, y así queda anotado en el documento.
//
// El recorte de pertenencia es el mismo criterio que build-park-trails.js: point-in-polygon contra
// el límite OFICIAL del parque (no su bbox, que en un espacio con varios recintos abarca kilómetros
// de territorio ajeno) con un margen de ~50 m para no descartar lo que va justo por el borde.
//
// Fuente de los datos: OpenStreetMap contributors (ODbL).
// ================================================================================================

'use strict';
const fs = require('fs');
const path = require('path');

const { ROOT, FRONTEND, OUT_DIR, REGISTRY_FILE, readJson, readJsonIf, rel } = require('./lib/io');
const { arg, flag, die } = require('./lib/cli');
const { namedFeatures } = require('./lib/pmtiles');

const OVERPASS_URLS = ['https://overpass-api.de/api/interpreter', 'https://overpass.openstreetmap.fr/api/interpreter'];
const UA = 'NaturDex-Tool/1.0 (+https://github.com/DamiNL94/NaturDex; puntos de interes)';

// Margen del bbox al consultar Overpass: se pide algo más que el límite y se recorta después contra
// el polígono, que es quien manda.
const QUERY_PAD_DEG = 0.02;     // ~2 km
// Tolerancia de pertenencia, la misma que los senderos: un mirador señalizado justo en el borde de
// la pista que hace de límite sigue siendo del parque.
const POLY_BUFFER_DEG = 0.0005; // ~50 m
// Dos chinchetas a menos de esto son el mismo sitio contado dos veces (§4.3.7). El valor sale del
// piloto: en Cabo Cope, la Torre de Cope y su ermita están a 150 m y son dos POIs distintos y bien
// distintos; por debajo de 50 m lo que hay es el mismo elemento mapeado dos veces (el nodo y el
// polígono, la fuente y su área recreativa).
const DEDUP_M = 50;
// Un candidato a esta distancia de una traza de geo/trails.geojson no se descarta —el inicio
// señalizado de un sendero es un POI de tipo Acceso perfectamente válido— pero se marca, porque es
// donde aparecen los duplicados de la capa de senderos.
const TRAIL_NEAR_M = 40;

const red = s => '\x1b[31m' + s + '\x1b[0m';
const green = s => '\x1b[32m' + s + '\x1b[0m';
const yellow = s => '\x1b[33m' + s + '\x1b[0m';
const dim = s => '\x1b[2m' + s + '\x1b[0m';

// --- Vocabulario -----------------------------------------------------------------------------------
// De la etiqueta de OSM al `type` del piloto. Son los OCHO que Frontend/Js/util.js sabe dibujar: un
// tipo fuera de esta lista sale con la estrella genérica. La sugerencia es solo eso —quien redacta
// decide—: la Playa del Charco de Cabo Cope entró como `Natural` por su tarayal y no como
// `Paisajístico`, y eso no lo puede saber una tabla.
const TIPO_POR_KIND = {
  arch: 'Geológico', rock: 'Geológico', cliff: 'Geológico', volcano: 'Geológico', sinkhole: 'Geológico',
  cave_entrance: 'Geológico', quarry: 'Geológico',
  peak: 'Paisajístico', saddle: 'Paisajístico', viewpoint: 'Paisajístico', cape: 'Paisajístico',
  beach: 'Natural', spring: 'Natural', waterfall: 'Natural', wetland: 'Natural', water: 'Natural',
  tree: 'Natural', oasis: 'Natural',
  ruins: 'Cultural', castle: 'Cultural', tower: 'Cultural', manor: 'Cultural', monument: 'Cultural',
  memorial: 'Cultural', museum: 'Cultural', mine: 'Cultural', lighthouse: 'Cultural', watermill: 'Cultural',
  archaeological_site: 'Arqueológico',
  place_of_worship: 'Religioso', wayside_cross: 'Religioso', monastery: 'Religioso', chapel: 'Religioso',
  information: 'Acceso', picnic_site: 'Acceso', camp_site: 'Acceso', ranger_station: 'Acceso',
  parking: 'Acceso', trailhead: 'Acceso', hamlet: 'Acceso', village: 'Acceso',
};

// Lo que se descarta solo, con la regla que lo tumba escrita al lado. No es una lista de exclusión
// moral: es la lista de lo que NO es un POI según el §4.1, y sale igualmente en el documento para
// que la siguiente sesión no vuelva a mirarlo.
const DESCARTE_POR_KIND = {
  restaurant: 'servicio, no valor del espacio', fuel: 'servicio', car_wash: 'servicio',
  bakery: 'servicio', hostel: 'alojamiento', hotel: 'alojamiento', guest_house: 'alojamiento',
  chalet: 'alojamiento', caravan_site: 'alojamiento', summer_camp: 'alojamiento',
  recycling: 'servicio', fire_station: 'servicio', industrial: 'servicio', farmyard: 'servicio',
  pitch: 'instalación deportiva', social_centre: 'servicio', building: 'sin contenido propio',
  drinking_water: 'equipamiento de ruta (fuente potable), no valor en sí',
  fountain: 'equipamiento de ruta', wildlife_feeding: 'instalación de gestión',
  recreation_ground: 'equipamiento', forest: 'cobertura vegetal: eso es Capa 2 (hábitats)',
  military: 'zona militar en activo: no se pisa (§4.3.5)',
  nature_reserve: 'es el propio espacio protegido, no un punto dentro de él',
  artwork: 'sin hecho comprobable detrás salvo que la fuente lo dé',
  other: 'etiqueta sin contenido: mirar en OSM qué es antes de proponerlo',
};

// Avisos que NO descartan pero obligan a mirar antes de escribir nada.
const AVISO_POR_KIND = {
  cave_entrance: '§4.3.6 — una cavidad con registro arqueológico y sin vigilancia no se señala en ' +
    'una guía de campo (precedente: Cueva C.6 de Cabo Cope). Comprobar protección antes de admitirlo',
  coastline: '§4.3.5 — comprobar que se pisa: islotes y elementos marinos quedan fuera',
  islet: '§4.3.5 — elemento marino, fuera del rollout',
  water: 'comprobar que es un elemento natural y no una balsa de gestión forestal',
};

// --- Geometría ---------------------------------------------------------------------------------------
// Las mismas primitivas que build-park-trails.js: ray casting contra el anillo, agujeros incluidos, y
// distancia al borde para el margen. Aquí solo hacen falta para puntos, así que no se copia el
// aparato de recorte de líneas.
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
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

function distToPolygonBoundary(pt, geometry) {
  const polys = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  let min = Infinity;
  for (const rings of polys) for (const ring of rings) {
    for (let i = 0; i < ring.length - 1; i++) min = Math.min(min, distToSegment(pt, ring[i], ring[i + 1]));
  }
  return min;
}

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

const insideWithBuffer = (pt, geometry) => insidePolygon(pt, geometry) || distToPolygonBoundary(pt, geometry) <= POLY_BUFFER_DEG;

// Distancia en metros sobre el elipsoide aproximada como plana: a estas escalas (decenas de metros)
// el error es despreciable y evita arrastrar una fórmula de haversine para comparar contra 50 m.
function metersBetween(a, b) {
  const midLat = (a[1] + b[1]) / 2 * Math.PI / 180;
  const dx = (a[0] - b[0]) * 111320 * Math.cos(midLat);
  const dy = (a[1] - b[1]) * 110540;
  return Math.hypot(dx, dy);
}

function bboxOfGeometry(geometry) {
  const polys = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  let minLon = Infinity, minLat = Infinity, maxLon = -Infinity, maxLat = -Infinity;
  for (const rings of polys) for (const ring of rings) for (const [lon, lat] of ring) {
    if (lon < minLon) minLon = lon; if (lon > maxLon) maxLon = lon;
    if (lat < minLat) minLat = lat; if (lat > maxLat) maxLat = lat;
  }
  return [minLon, minLat, maxLon, maxLat];
}

function parkGeometry(file) {
  const geo = readJson(file);
  const geoms = (geo.type === 'FeatureCollection' ? geo.features.map(f => f.geometry) : [geo.geometry || geo])
    .filter(g => g && (g.type === 'Polygon' || g.type === 'MultiPolygon'));
  if (!geoms.length) return null;
  if (geoms.length === 1) return geoms[0];
  const coords = [];
  for (const g of geoms) g.type === 'Polygon' ? coords.push(g.coordinates) : coords.push(...g.coordinates);
  return { type: 'MultiPolygon', coordinates: coords };
}

/** Todos los vértices de las trazas de senderos, para avisar de los candidatos que caen encima. */
function trailPoints(file) {
  const geo = readJsonIf(file, null);
  if (!geo) return [];
  const pts = [];
  for (const feat of geo.features || []) {
    const g = feat.geometry;
    if (!g) continue;
    const lines = g.type === 'LineString' ? [g.coordinates] : g.type === 'MultiLineString' ? g.coordinates : [];
    for (const line of lines) pts.push(...line);
  }
  return pts;
}

// --- Slug ---------------------------------------------------------------------------------------------
// El `id` de un POI es clave en la BD (`points_of_interest.slug`, único por parque), así que tiene que
// ser estable y sin sorpresas: sin tildes, minúsculas y guiones (§4.3.8).
function slugify(name) {
  return name.normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
}

// --- Overpass -------------------------------------------------------------------------------------------
async function overpass(query, attempt = 1) {
  const url = OVERPASS_URLS[attempt <= 2 ? 0 : 1] || OVERPASS_URLS[0];
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': '*/*', 'User-Agent': UA },
    body: 'data=' + encodeURIComponent(query),
  });
  if (res.ok) {
    const text = await res.text();
    if (!/runtime error|too busy|rate_limited/i.test(text)) return JSON.parse(text);
  }
  // 504/429/"demasiado ocupado" es un servidor público saturado, no una consulta mal escrita:
  // se reintenta con espera creciente y a partir del tercer intento se prueba el mirror.
  if (attempt < 5) {
    await new Promise(r => setTimeout(r, 4000 * attempt));
    return overpass(query, attempt + 1);
  }
  throw new Error('Overpass no disponible tras ' + attempt + ' intentos');
}

// Las etiquetas del §4.2, tal cual. `nwr` porque un yacimiento o un castillo pueden estar mapeados
// como área, y `out center` da entonces el centro del polígono — que es la coordenada representativa
// que se busca aquí, no la geometría.
const OVERPASS_FILTERS = [
  'nwr["natural"~"^(cape|beach|peak|spring|cliff|arch|saddle|volcano|cave_entrance)$"]',
  'nwr["tourism"~"^(viewpoint|information|picnic_site|artwork|museum)$"]',
  'nwr["historic"~"^(tower|ruins|archaeological_site|castle|wayside_cross|monument|memorial|mine|manor)$"]',
  'nwr["man_made"~"^(lighthouse|watermill|windmill|water_well)$"]',
  'nwr["amenity"~"^(parking|place_of_worship|ranger_station)$"]',
  'nwr["place"~"^(hamlet|locality|village)$"]',
];

async function fetchOverpass(bbox) {
  const [minLon, minLat, maxLon, maxLat] = bbox;
  const area = `(${minLat},${minLon},${maxLat},${maxLon})`;
  const q = `[out:json][timeout:180];\n(\n` +
    OVERPASS_FILTERS.map(f => '  ' + f + area + ';').join('\n') +
    `\n);\nout center tags;`;
  const data = await overpass(q);
  const out = [];
  for (const el of data.elements || []) {
    const tags = el.tags || {};
    if (!tags.name) continue;                    // sin nombre no hay POI que proponer
    const lat = el.lat != null ? el.lat : el.center && el.center.lat;
    const lon = el.lon != null ? el.lon : el.center && el.center.lon;
    if (lat == null || lon == null) continue;
    const kind = tags.natural || tags.historic || tags.tourism || tags.man_made || tags.amenity || tags.place || null;
    out.push({
      name: tags.name, kind, kindDetail: tags.site_type || tags.building || null,
      lat, lon, origen: 'OSM ' + el.type + '/' + el.id, tags,
    });
  }
  return out;
}

// --- Basemap ----------------------------------------------------------------------------------------------
function fetchBasemap(tilesFile) {
  const { header, features } = namedFeatures(tilesFile, { layers: ['pois', 'places', 'water'] });
  return {
    header,
    candidatos: features
      // `water` solo aporta láminas de agua con nombre; sus ríos y ramblas son líneas y no son POIs.
      .filter(f => f.layer !== 'water' || f.geometry === 'polígono')
      .map(f => ({
        name: f.name, kind: f.kind, kindDetail: f.kindDetail, lat: f.lat, lon: f.lon,
        origen: 'basemap ' + f.layer + (f.geometry !== 'punto' ? ' (' + f.geometry + ')' : ''),
        tags: {},
      })),
  };
}

// --- Clasificación y filtros ----------------------------------------------------------------------------------
function clasifica(cand, { trails, existentes }) {
  const kind = cand.kind || '';
  const nota = [];
  let descarte = DESCARTE_POR_KIND[kind] || null;

  // Un topónimo suelto llena el mapa de chinchetas y no le dice nada al usuario (§4.1). No se
  // descarta del todo porque es justo el material del paso 1→4 de la cascada: el PORN nombra un
  // paraje y OSM lo sitúa. Pero sin un hecho documentado detrás no entra.
  if (kind === 'locality') descarte = 'topónimo suelto (§4.1): solo entra si una fuente le pone un hecho detrás';

  if (AVISO_POR_KIND[kind]) nota.push(AVISO_POR_KIND[kind]);

  const yaExiste = existentes.find(p => p.id === slugify(cand.name) ||
    (p.coordinates && metersBetween([cand.lon, cand.lat], [p.coordinates[1], p.coordinates[0]]) <= DEDUP_M));
  if (yaExiste) descarte = 'duplicado de un POI ya dado de alta (' + yaExiste.id + ') — §4.3.7';

  let cerca = Infinity;
  for (const p of trails) {
    const d = metersBetween([cand.lon, cand.lat], p);
    if (d < cerca) cerca = d;
    if (cerca <= 1) break;
  }
  if (cerca <= TRAIL_NEAR_M) {
    nota.push('a ' + Math.round(cerca) + ' m de una traza de trails.geojson: si lo que se quiere ' +
      'contar es el recorrido, ya está en la capa de senderos (§4.1)');
  }

  return {
    ...cand,
    id: slugify(cand.name),
    tipo: TIPO_POR_KIND[kind] || null,
    descarte,
    notas: nota,
  };
}

/** Dos candidatos a menos de DEDUP_M son el mismo sitio traído por dos etiquetas distintas. */
function dedup(candidatos) {
  const kept = [], fused = [];
  for (const c of candidatos) {
    const gemelo = kept.find(k => metersBetween([c.lon, c.lat], [k.lon, k.lat]) <= DEDUP_M);
    if (gemelo) { fused.push({ ...c, fusionadoCon: gemelo.name }); gemelo.tambien = (gemelo.tambien || []).concat(c.name + ' (' + (c.kind || '?') + ')'); }
    else kept.push(c);
  }
  return { kept, fused };
}

// --- Informe ------------------------------------------------------------------------------------------------
function informe(park, ctx) {
  const { fuente, header, dentro, fuera, descartados, fusionados, avisoOverpass } = ctx;
  const L = [];
  const fecha = new Date().toISOString().slice(0, 10);
  L.push('# ' + park.name + ' — candidatos a punto de interés (N3)');
  L.push('');
  L.push('> Generado por `Tools/build-park-pois.js` el ' + fecha + '. **Documento de trabajo, no una');
  L.push('> alta.** Nada de lo que hay aquí entra en `park.json` sin pasar por el paso 2 del §4.5 de');
  L.push('> `Docs/prompts/e-rollout-nacional.md`: tabla de candidatos, visto bueno, y descripción');
  L.push('> redactada con la fuente del hecho delante.');
  L.push('');
  L.push('| | |');
  L.push('|---|---|');
  L.push('| Espacio | ' + park.name + ' (`' + park.slug + '`) |');
  L.push('| Fuente consultada | ' + fuente + ' |');
  if (header) L.push('| Basemap | zoom máx. ' + header.maxZoom + ', recorte ' + header.minLon.toFixed(4) + ',' + header.minLat.toFixed(4) + ' → ' + header.maxLon.toFixed(4) + ',' + header.maxLat.toFixed(4) + ' |');
  L.push('| Candidatos dentro del límite | ' + dentro.length + ' |');
  L.push('| Fuera del polígono (descartados) | ' + fuera.length + ' |');
  L.push('| Descartados por regla | ' + descartados.length + ' |');
  L.push('');
  if (avisoOverpass) {
    L.push('> ⚠️ **' + avisoOverpass + '** Los candidatos de abajo salen solo del basemap del repo, que');
    L.push('> ve menos que OSM: no lleva `historic=*` ni `man_made=*`, y filtra por zoom. Un "no');
    L.push('> aparece" de esta lista NO cierra la fuente nº 4 de la cascada.');
    L.push('');
  }

  L.push('## Candidatos');
  L.push('');
  L.push('Coordenada en el orden de `park.json` (`[lat, lon]`). El tipo es una **sugerencia** a partir');
  L.push('de la etiqueta de OSM: los ocho del vocabulario cerrado del §4.1, y quien redacta decide.');
  L.push('');
  L.push('| Nombre | `id` propuesto | Tipo sug. | Coordenada | Origen | A revisar |');
  L.push('|---|---|---|---|---|---|');
  for (const c of dentro) {
    const notas = (c.notas || []).join(' · ') + (c.tambien ? (c.notas.length ? ' · ' : '') + 'también mapeado como: ' + c.tambien.join(', ') : '');
    L.push('| ' + c.name + ' | `' + c.id + '` | ' + (c.tipo || '—') + ' | ' +
      c.lat.toFixed(6) + ', ' + c.lon.toFixed(6) + ' | ' + c.origen + ' | ' + (notas || '—') + ' |');
  }
  if (!dentro.length) L.push('| _(ninguno)_ | | | | | |');
  L.push('');
  L.push('**Lo que falta en cada fila y no lo puede poner un script**: el hecho comprobable y su');
  L.push('fuente, `approx` (y por qué), la foto con su licencia, y la descripción. Sin fuente del');
  L.push('hecho, el candidato no entra (§4.3.1).');
  L.push('');

  L.push('## Descartados por regla');
  L.push('');
  if (descartados.length) {
    L.push('| Nombre | Etiqueta OSM | Regla que lo descarta |');
    L.push('|---|---|---|');
    for (const c of descartados) L.push('| ' + c.name + ' | `' + (c.kind || '?') + '` | ' + c.descarte + ' |');
  } else L.push('_Ninguno._');
  L.push('');

  L.push('## Fuera del polígono oficial');
  L.push('');
  L.push('Caen en el bbox pero no en el límite (§4.3.3), con el margen de ~50 m ya aplicado.');
  L.push('');
  if (fuera.length) {
    L.push('| Nombre | Etiqueta OSM | Coordenada |');
    L.push('|---|---|---|');
    for (const c of fuera) L.push('| ' + c.name + ' | `' + (c.kind || '?') + '` | ' + c.lat.toFixed(6) + ', ' + c.lon.toFixed(6) + ' |');
  } else L.push('_Ninguno._');
  L.push('');

  if (fusionados.length) {
    L.push('## Fundidos por proximidad');
    L.push('');
    L.push('A menos de ' + DEDUP_M + ' m de otro candidato: el mismo sitio con dos etiquetas (§4.3.7).');
    L.push('');
    L.push('| Nombre | Etiqueta | Fundido con |');
    L.push('|---|---|---|');
    for (const c of fusionados) L.push('| ' + c.name + ' | `' + (c.kind || '?') + '` | ' + c.fusionadoCon + ' |');
    L.push('');
  }

  L.push('## Resto de la cascada (§4.2) — a mano');
  L.push('');
  L.push('Este script solo cubre la fuente nº 4. Las demás no tienen servicio consultable por');
  L.push('programa y son las que aportan el HECHO, no la coordenada:');
  L.push('');
  L.push('- [ ] **1 · PORN/PRUG del espacio** — ¿hay anexo que enumere valores geológicos, culturales o paisajísticos? Citar documento y apartado.');
  L.push('- [ ] **2 · IELIG (IGME)** — LIG cuyo punto o polígono caiga dentro del límite.');
  L.push('- [ ] **3 · BIC y patrimonio** — Ministerio de Cultura + catálogo de la comunidad.');
  L.push('- [ ] **5 · Organismo gestor / Wikipedia** — contexto para redactar.');
  L.push('- [ ] **6 · Wikimedia Commons / `Frontend/Img/poi/`** — la foto, con autor y licencia.');
  L.push('');
  L.push('Recordar que **el hecho y el nombre bajan por la cascada y la coordenada sube**: si el PORN');
  L.push('nombra un paraje que la tabla de arriba sitúa, la coordenada es la de OSM y el POI va con');
  L.push('`approx: true` y el porqué escrito en `source`.');
  L.push('');
  L.push('---');
  L.push('');
  L.push('Datos de posición: © OpenStreetMap contributors, ODbL.');
  L.push('');
  return L.join('\n');
}

// --- Un parque -------------------------------------------------------------------------------------------------
async function buildForPark(entry, opciones) {
  const slug = entry.slug;
  const manifest = readJson(path.join(FRONTEND, entry.manifest));
  const boundaryRel = manifest.geo && manifest.geo.parque;
  if (!boundaryRel) { console.error(red('  sin geo.parque: no se puede recortar')); return null; }
  const geometry = parkGeometry(path.join(FRONTEND, boundaryRel));
  if (!geometry) { console.error(red('  el límite no trae ningún polígono utilizable')); return null; }

  const parkDir = path.dirname(path.join(FRONTEND, entry.manifest));
  const parkJson = readJsonIf(path.join(parkDir, 'park.json'), {});
  const existentes = parkJson.pointsOfInterest || [];
  const trails = trailPoints(path.join(parkDir, 'geo', 'trails.geojson'));
  const tilesFile = path.join(parkDir, 'tiles', 'base.pmtiles');

  // --- de dónde salen los candidatos
  let brutos = [], fuente = '', header = null, avisoOverpass = null;
  const quiere = opciones.fuente;
  if (quiere === 'overpass' || quiere === 'auto') {
    const bbox = bboxOfGeometry(geometry).map((v, i) => i < 2 ? v - QUERY_PAD_DEG : v + QUERY_PAD_DEG);
    try {
      console.log('  consultando Overpass…');
      brutos = await fetchOverpass(bbox);
      fuente = 'OpenStreetMap vía Overpass (' + new Date().toISOString().slice(0, 10) + ')';
    } catch (err) {
      if (quiere === 'overpass') { console.error(red('  ' + err.message)); return null; }
      avisoOverpass = 'Overpass no respondió (' + err.message + '), se ha usado el basemap del repo.';
      console.log(yellow('  ' + avisoOverpass));
    }
  }
  if (!fuente) {
    if (!fs.existsSync(tilesFile)) { console.error(red('  sin tiles/base.pmtiles: no hay fuente de la que tirar')); return null; }
    const bm = fetchBasemap(tilesFile);
    brutos = bm.candidatos; header = bm.header;
    fuente = 'basemap Protomaps del repo (`' + rel(tilesFile) + '`, ODbL)';
  }

  // --- recorte, clasificación y dedup
  const fuera = [], clasificados = [];
  for (const c of brutos) {
    if (!insideWithBuffer([c.lon, c.lat], geometry)) { fuera.push(c); continue; }
    clasificados.push(clasifica(c, { trails, existentes }));
  }
  const descartados = clasificados.filter(c => c.descarte);
  const { kept, fused } = dedup(clasificados.filter(c => !c.descarte));
  kept.sort((a, b) => (a.tipo || 'zz').localeCompare(b.tipo || 'zz') || a.name.localeCompare(b.name, 'es'));

  console.log('  ' + green(kept.length + ' candidato(s)') + dim(' · ' + descartados.length + ' descartados por regla · ' +
    fuera.length + ' fuera del polígono · ' + fused.length + ' fundidos'));

  const texto = informe({ slug, name: parkJson.park ? parkJson.park.name : slug },
    { fuente, header, dentro: kept, fuera, descartados, fusionados: fused, avisoOverpass });
  const outFile = path.join(OUT_DIR, slug + '-poi-candidatos.md');
  if (opciones.dryRun) {
    console.log(yellow('  --dry-run: no se escribe ' + rel(outFile)));
  } else {
    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.writeFileSync(outFile, texto, 'utf8');
    console.log('  → ' + rel(outFile));
  }
  return { slug, candidatos: kept.length };
}

// --- Entrada ----------------------------------------------------------------------------------------------------
async function main() {
  const argv = process.argv.slice(2);
  const todos = flag('all', argv);
  const slug = argv.find(a => !a.startsWith('-'));
  if (!todos && !slug) {
    die('uso: node Tools/build-park-pois.js <slug> [--fuente=auto|overpass|basemap] [--dry-run]\n' +
      '     node Tools/build-park-pois.js --all [--fuente=…] [--dry-run]');
  }
  const fuente = arg('fuente', 'auto', argv);
  if (!['auto', 'overpass', 'basemap'].includes(fuente)) die('--fuente debe ser auto, overpass o basemap');
  const opciones = { fuente, dryRun: flag('dry-run', argv) };

  // El registro va anidado por comunidad y provincia, no es una lista plana.
  const registry = readJson(REGISTRY_FILE);
  const parks = [];
  for (const community of registry.communities || [])
    for (const province of community.provinces || [])
      for (const park of province.parks || []) if (park.manifest) parks.push(park);

  const objetivo = todos ? parks : parks.filter(p => p.slug === slug);
  if (!objetivo.length) die('el slug "' + slug + '" no está en ' + rel(REGISTRY_FILE));

  for (const entry of objetivo) {
    console.log('▶ ' + entry.slug);
    try {
      await buildForPark(entry, opciones);
    } catch (err) {
      console.error(red('  error en ' + entry.slug + ': ' + err.message));
    }
    if (opciones.fuente !== 'basemap') await new Promise(r => setTimeout(r, 1000)); // cortesía con Overpass
  }
  console.log('\nLos candidatos NO son altas: la admisión y la redacción se hacen a mano (§4.4).');
}

if (require.main === module) {
  main().catch(err => { console.error(red('✖ ' + (err.stack || err.message))); process.exit(1); });
}

module.exports = { slugify, insideWithBuffer, metersBetween };
