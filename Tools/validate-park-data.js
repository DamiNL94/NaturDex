#!/usr/bin/env node
/*
 * validate-park-data.js — red de seguridad de los datos empaquetados de NaturDex.
 *
 * Recorre el registro de parques (Frontend/Data/parks-index.json) y valida, para cada parque
 * "available", la coherencia de park.json ↔ manifest.json ↔ geo/habitats.geojson: contadores,
 * referencias especie↔hábitat, unicidad de ids/códigos, convención de imágenes y geometría.
 *
 * Los espacios de ficha base ("basic", nivel N1 del rollout nacional) se validan con reglas
 * relajadas: se exige el bloque `park` completo, un geo/parque.geojson válido y que los contadores
 * del manifiesto cuadren (a cero si están a cero). NO se exigen hábitats, especies, POIs ni
 * imágenes: por definición todavía no los tienen.
 *
 * Es lo que habría cazado el desajuste "21 vs 15 hábitats". Sin dependencias externas.
 *
 * Uso:   node Tools/validate-park-data.js        (o `npm run validate`)
 * Salida: código 1 si hay algún ERROR; 0 si solo hay avisos o todo correcto.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { ROOT, FRONTEND, REGISTRY_FILE: REGISTRY, readJson } = require('./lib/io');

let errors = 0, warnings = 0;
const err = (scope, msg) => { errors++; console.log('  \x1b[31m✗ ERROR\x1b[0m [' + scope + '] ' + msg); };
const warn = (scope, msg) => { warnings++; console.log('  \x1b[33m⚠ aviso\x1b[0m [' + scope + '] ' + msg); };
const ok = (msg) => console.log('  \x1b[32m✓\x1b[0m ' + msg);

// Devuelve los duplicados de una lista de valores.
function duplicates(values) {
  const seen = new Set(), dup = new Set();
  values.forEach(v => { if (seen.has(v)) dup.add(v); else seen.add(v); });
  return [...dup];
}

function listParks(registry) {
  const out = [];
  (registry.communities || []).forEach(c =>
    (c.provinces || []).forEach(p =>
      (p.parks || []).forEach(park => out.push(park))));
  return out;
}

// Coordenada [lat, lng] bien formada.
const badCoord = c => !Array.isArray(c) || c.length !== 2 || c.some(n => typeof n !== 'number');
// ¿La coordenada [lat, lng] cae fuera de la caja de España (SPAIN_BBOX, más abajo)? Caza el [0, 0]
// y el lat/lng intercambiado, que están bien formados pero no señalan a ningún sitio del catálogo.
const outsideSpain = c =>
  c[0] < SPAIN_BBOX.latMin || c[0] > SPAIN_BBOX.latMax ||
  c[1] < SPAIN_BBOX.lngMin || c[1] > SPAIN_BBOX.lngMax;

// --- Ficha base (status "basic") ------------------------------------------------------------------
// Nivel N1 del rollout nacional (Docs/prompts/e-rollout-nacional.md): el espacio existe en el mapa
// con su límite oficial y sus códigos Natura 2000, pero su catálogo está en preparación.

// Campos del bloque `park` sin los cuales la ficha no se sostiene: identidad, encuadre en el mapa,
// descripción y —lo más importante— la procedencia del límite.
const BASIC_PARK_FIELDS = [
  'slug', 'name', 'category', 'region', 'province', 'municipalities', 'center', 'summary', 'boundaryNote'
];

// Caja envolvente de España (incluidas Canarias y Baleares), con holgura. Sirve para cazar el error
// clásico de subir un límite en UTM o con lat/lng intercambiadas, que en el mapa no se ve.
const SPAIN_BBOX = { lngMin: -19.0, lngMax: 5.0, latMin: 27.0, latMax: 44.5 };

// Recorre las coordenadas de una geometría GeoJSON (a cualquier profundidad de anidamiento).
function forEachPosition(coords, fn) {
  if (!Array.isArray(coords)) return;
  if (typeof coords[0] === 'number') { fn(coords); return; }
  coords.forEach(c => forEachPosition(c, fn));
}

// Valida el fichero del límite oficial: existe, es GeoJSON de polígonos y está en WGS84 sobre España.
function validateBoundaryGeojson(scope, rel) {
  const abs = path.join(FRONTEND, rel);
  if (!fs.existsSync(abs)) { err(scope, 'límite no encontrado: ' + rel); return 0; }
  let geo;
  try { geo = readJson(abs); } catch (e) { err(scope, 'límite ilegible (JSON inválido): ' + rel); return 0; }
  const feats = geo.type === 'FeatureCollection' ? (geo.features || []) : (geo.type === 'Feature' ? [geo] : []);
  if (!feats.length) { err(scope, 'límite sin features: ' + rel); return 0; }
  let bad = 0, outside = 0;
  feats.forEach((f, i) => {
    const t = f.geometry && f.geometry.type;
    if (t !== 'Polygon' && t !== 'MultiPolygon') { err(scope, 'límite: feature #' + i + ' con geometría "' + t + '" (se esperaba Polygon/MultiPolygon)'); bad++; return; }
    forEachPosition(f.geometry.coordinates, ([lng, lat]) => {
      if (typeof lng !== 'number' || typeof lat !== 'number') { bad++; return; }
      if (lng < SPAIN_BBOX.lngMin || lng > SPAIN_BBOX.lngMax || lat < SPAIN_BBOX.latMin || lat > SPAIN_BBOX.latMax) outside++;
    });
  });
  if (bad) err(scope, 'límite: ' + bad + ' geometría(s) mal formadas en ' + rel);
  if (outside) err(scope, 'límite: ' + outside + ' vértice(s) fuera de España — ¿coordenadas en UTM o lat/lng intercambiadas? (' + rel + ')');
  return feats.length;
}

// --- Reglas de admisión del N3 (§4.1 y §4.3 del prompt de rollout) -------------------------------

// Los ocho que Frontend/Js/util.js sabe dibujar. Uno fuera de la lista no rompe nada, pero sale con
// la estrella genérica: es un aviso, no un error.
const TIPOS_POI = new Set(['Cultural', 'Paisajístico', 'Geológico', 'Acceso', 'Natural',
  'Arqueológico', 'Paleontológico', 'Religioso']);
// El mismo margen que usa build-park-trails.js para no descartar lo que roza el límite (§4.3.3),
// y el mismo umbral de «dos chinchetas son el mismo sitio» del §4.3.7.
const MARGEN_POI_M = 50;

function distanciaM(a, b) {
  const R = 6371000, t = x => x * Math.PI / 180;
  const dLa = t(b[0] - a[0]), dLo = t(b[1] - a[1]);
  const h = Math.sin(dLa / 2) ** 2 + Math.cos(t(a[0])) * Math.cos(t(b[0])) * Math.sin(dLo / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Distancia al BORDE del polígono, no al vértice más próximo. La diferencia no es cosmética: con
// límites de miles de vértices, medir contra los vértices da una cota superior que se pasa de largo
// —la Torre del Azaraque salía a 60 m y está a 14—, y una cifra inflada en un `source` es
// exactamente el tipo de dato que este repo no publica.
function metrosAlBorde(polys, lat, lon) {
  const kx = 111320 * Math.cos(lat * Math.PI / 180), ky = 110540;
  const px = lon * kx, py = lat * ky;
  let min = Infinity;
  for (const poly of polys) for (const ring of poly) {
    for (let i = 0; i < ring.length - 1; i++) {
      const ax = ring[i][0] * kx, ay = ring[i][1] * ky;
      const bx = ring[i + 1][0] * kx, by = ring[i + 1][1] * ky;
      const dx = bx - ax, dy = by - ay, len2 = dx * dx + dy * dy;
      let t = len2 ? ((px - ax) * dx + (py - ay) * dy) / len2 : 0;
      t = Math.max(0, Math.min(1, t));
      min = Math.min(min, Math.hypot(px - (ax + t * dx), py - (ay + t * dy)));
    }
  }
  return min;
}

function enAnillo(x, y, ring) {
  let dentro = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1];
    if (((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)) dentro = !dentro;
  }
  return dentro;
}
function enPoligonos(polys, lat, lon) {
  for (const poly of polys) {
    if (!enAnillo(lon, lat, poly[0])) continue;
    let enHueco = false;
    for (let i = 1; i < poly.length; i++) if (enAnillo(lon, lat, poly[i])) enHueco = true;
    if (!enHueco) return true;
  }
  return false;
}

function poligonosDelLimite(manifest) {
  const rel = manifest.geo && manifest.geo.parque;
  if (!rel) return null;
  const abs = path.join(FRONTEND, rel);
  if (!fs.existsSync(abs)) return null;
  let gj;
  try { gj = readJson(abs); } catch (e) { return null; }
  const feats = gj.type === 'FeatureCollection' ? (gj.features || []) : [gj.geometry ? gj : { geometry: gj }];
  const polys = [];
  for (const f of feats) {
    const g = f.geometry;
    if (!g) continue;
    if (g.type === 'Polygon') polys.push(g.coordinates);
    else if (g.type === 'MultiPolygon') polys.push(...g.coordinates);
  }
  return polys.length ? polys : null;
}

function validatePoiRules(scope, pois, manifest) {
  if (!pois.length) return;
  const polys = poligonosDelLimite(manifest);

  pois.forEach(p => {
    // §4.1 — vocabulario cerrado de `type`.
    if (!TIPOS_POI.has(p.type))
      warn(scope, 'POI "' + p.id + '": type "' + p.type + '" no está en el vocabulario cerrado del §4.1, saldrá con la estrella genérica');
    // §4.3.8 — el id es clave en la BD (points_of_interest.slug): minúsculas, sin tildes, guiones.
    // Va como AVISO y no como error a propósito: el id ya está escrito en `seed.sql`, en
    // `snapshot.sql` y en la fila viva de `points_of_interest`, así que arreglarlo no es editar el
    // `park.json` sino una renombrada coordinada de las cuatro cosas a la vez. Bloquear el commit
    // por una deuda que solo se puede saldar tocando la BD dejaría el repo sin red de seguridad para
    // todo lo demás. Está en Docs/DEUDA-TECNICA.md.
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.id || ''))
      warn(scope, 'POI "' + p.id + '": el id no es un slug limpio (§4.3.8) y es clave única en points_of_interest. Renombrarlo exige tocar a la vez park.json, seed.sql, snapshot.sql y la fila viva');
    // §4.3.1 — un POI sin fuente no entra.
    if (!p.source || !String(p.source).trim())
      err(scope, 'POI "' + p.id + '": sin `source`, y un POI sin fuente del hecho no entra (§4.3.1)');
    // §4.3.4 — `approx` es una afirmación sobre el dato, así que tiene que estar dicha.
    if (typeof p.approx !== 'boolean')
      warn(scope, 'POI "' + p.id + '": `approx` no es booleano, así que no consta si la coordenada está verificada');

    // La foto: la atribución es CONDICIÓN de la licencia, no un extra.
    if (p.image) {
      if (/\/thumb\//.test(p.image))
        err(scope, 'POI "' + p.id + '": la imagen es un /thumb/ de Wikimedia (derivado cacheado que devuelve 400 en cuanto no está generado)');
      const src = String(p.source || '');
      if (!/\bCC[ -]|CC0|dominio público|domino público|Public Domain|\bFAL\b|licencia/i.test(src))
        err(scope, 'POI "' + p.id + '": sirve una imagen y su `source` no dice de quién es ni bajo qué licencia — la atribución es condición de la CC BY / CC BY-SA');
    }

    // §4.3.3 — pertenencia por polígono, no por bbox.
    if (polys && Array.isArray(p.coordinates) && p.coordinates.length === 2) {
      const [lat, lon] = p.coordinates;
      if (typeof lat === 'number' && typeof lon === 'number' && !enPoligonos(polys, lat, lon)) {
        const d = metrosAlBorde(polys, lat, lon);
        if (d > MARGEN_POI_M)
          warn(scope, 'POI "' + p.id + '": cae FUERA del límite oficial, a ' + d.toFixed(0) + ' m del borde (§4.3.3). Si entra a propósito, tiene que decirlo su `source` — con esta misma distancia');
      }
    }
  });

  // §4.3.7 — dos chinchetas a menos de 50 m son el mismo sitio contado dos veces.
  for (let i = 0; i < pois.length; i++) for (let j = i + 1; j < pois.length; j++) {
    const a = pois[i].coordinates, b = pois[j].coordinates;
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== 2 || b.length !== 2) continue;
    const d = distanciaM(a, b);
    if (d < MARGEN_POI_M)
      warn(scope, 'POI "' + pois[i].id + '" y "' + pois[j].id + '" están a ' + d.toFixed(0) + ' m (§4.3.7): ¿son el mismo sitio dos veces?');
  }
}

// Presupuesto de descarga por parque: es lo que se baja un móvil en 4G y lo que ocupa para siempre
// en el dispositivo. Mismo número que Tools/build-park-tiles.js, a propósito.
const MAX_TOTAL_BYTES = 25 * 1024 * 1024;
const mbOf = b => (b / (1024 * 1024)).toFixed(2) + ' MB';

/**
 * Paquete de mapa base sin conexión (manifest.tiles) y peso real de lo que se descarga.
 * Es opcional: un parque sin paquete sigue funcionando, solo que sin cobertura su mapa base sale
 * vacío. Si está declarado, tiene que ser coherente, caber en el presupuesto y traer atribución
 * (la ODbL del basemap de Protomaps la exige, y debe verse también sin conexión).
 */
function validateTiles(scope, manifest) {
  const assets = (manifest.images || []).concat(manifest.audio || []);
  let assetBytes = 0;
  assets.forEach(rel => {
    const file = path.join(FRONTEND, rel);
    if (fs.existsSync(file)) assetBytes += fs.statSync(file).size;
  });

  const counts = manifest.counts || {};
  if (counts.assetBytes == null) {
    warn(scope, 'manifest.counts.assetBytes no declarado: el botón "Guardar sin conexión" no podrá anunciar el peso');
  } else if (Math.abs(counts.assetBytes - assetBytes) > 1024) {
    err(scope, 'manifest.counts.assetBytes=' + counts.assetBytes + ' ≠ ' + assetBytes +
      ' bytes reales en disco (vuelve a lanzar `npm run tiles:build ' + scope + '`)');
  }

  const tiles = manifest.tiles;
  if (!tiles) {
    warn(scope, 'sin manifest.tiles: sin cobertura el mapa base saldrá vacío (`npm run tiles:build ' + scope + '`)');
    return;
  }
  if (!tiles.pmtiles) { err(scope, 'manifest.tiles sin la ruta `pmtiles`'); return; }

  const tilePath = path.join(FRONTEND, tiles.pmtiles);
  if (!fs.existsSync(tilePath)) {
    err(scope, 'manifest.tiles.pmtiles declarado pero no encontrado en disco: ' + tiles.pmtiles);
    return;
  }
  const realBytes = fs.statSync(tilePath).size;
  if (tiles.bytes !== realBytes)
    err(scope, 'manifest.tiles.bytes=' + tiles.bytes + ' ≠ ' + realBytes + ' bytes reales de ' + tiles.pmtiles);

  // La atribución viaja en el manifiesto justo para poder pintarla sin red: si falta, estaríamos
  // incumpliendo la licencia precisamente en el modo para el que se empaquetó el mapa.
  if (!tiles.attribution || !String(tiles.attribution).trim())
    err(scope, 'manifest.tiles.attribution vacío: la ODbL exige atribución visible también sin conexión');

  if (!Array.isArray(tiles.bbox) || tiles.bbox.length !== 4 || tiles.bbox.some(n => typeof n !== 'number')) {
    err(scope, 'manifest.tiles.bbox debe ser [minLon, minLat, maxLon, maxLat] numérico');
  } else {
    const [minLon, minLat, maxLon, maxLat] = tiles.bbox;
    if (minLon >= maxLon || minLat >= maxLat) err(scope, 'manifest.tiles.bbox degenerado: ' + tiles.bbox.join(', '));
    if (minLon < SPAIN_BBOX.lngMin || maxLon > SPAIN_BBOX.lngMax || minLat < SPAIN_BBOX.latMin || maxLat > SPAIN_BBOX.latMax)
      err(scope, 'manifest.tiles.bbox se sale de España: ' + tiles.bbox.join(', '));
  }

  if (!(tiles.maxzoom >= 0 && tiles.maxzoom <= 20)) err(scope, 'manifest.tiles.maxzoom fuera de rango: ' + tiles.maxzoom);
  if (tiles.minzoom != null && tiles.minzoom > tiles.maxzoom) err(scope, 'manifest.tiles.minzoom > maxzoom');

  const total = realBytes + assetBytes;
  if (total > MAX_TOTAL_BYTES)
    err(scope, 'el parque se pasa del presupuesto de descarga: ' + mbOf(total) + ' > ' + mbOf(MAX_TOTAL_BYTES));
  else
    ok('mapa sin conexión: ' + mbOf(realBytes) + ' de teselas · ' + mbOf(total) + ' en total (tope ' + mbOf(MAX_TOTAL_BYTES) + ')');
}

function validateBasicPark(entry) {
  console.log('\n\x1b[1m▶ ' + entry.slug + '\x1b[0m (' + entry.name + ') \x1b[36m· ficha base\x1b[0m');
  const scope = entry.slug;
  const errorsBefore = errors;

  const manifestPath = path.join(FRONTEND, entry.manifest);
  if (!fs.existsSync(manifestPath)) { err(scope, 'manifest no encontrado: ' + entry.manifest); return; }
  const manifest = readJson(manifestPath);

  const parkPath = path.join(FRONTEND, manifest.data);
  if (!fs.existsSync(parkPath)) { err(scope, 'park.json no encontrado: ' + manifest.data); return; }
  const park = readJson(parkPath);
  const p = park.park || {};

  // 1) Bloque `park` completo -----------------------------------------------------------------
  BASIC_PARK_FIELDS.forEach(field => {
    const v = p[field];
    const vacio = v == null || v === '' || (Array.isArray(v) && v.length === 0);
    if (vacio) err(scope, 'park.' + field + ' vacío o ausente (obligatorio también en una ficha base)');
  });
  if (p.slug && p.slug !== entry.slug) err(scope, 'park.slug="' + p.slug + '" no coincide con el slug del registro "' + entry.slug + '"');
  if (badCoord(p.center)) err(scope, 'park.center mal formado');
  else if (p.center[0] < SPAIN_BBOX.latMin || p.center[0] > SPAIN_BBOX.latMax || p.center[1] < SPAIN_BBOX.lngMin || p.center[1] > SPAIN_BBOX.lngMax)
    err(scope, 'park.center fuera de España: [' + p.center.join(', ') + '] (se espera [lat, lng] en WGS84)');
  if (entry.category && p.category && entry.category !== p.category)
    warn(scope, 'la figura del registro ("' + entry.category + '") no coincide con park.category ("' + p.category + '")');

  // 2) Límite oficial: es lo único que esta ficha promete, así que se exige ------------------------
  const boundaryRel = manifest.geo && manifest.geo.parque;
  if (!boundaryRel) err(scope, 'manifest.geo.parque no declarado: una ficha base necesita su límite oficial');
  else validateBoundaryGeojson(scope, boundaryRel);

  // Las capas Natura 2000 son opcionales (no todo espacio protegido solapa con LIC o ZEPA), pero si
  // se declaran tienen que existir.
  ['lic', 'zepa'].forEach(k => {
    const rel = manifest.geo && manifest.geo[k];
    if (rel && !fs.existsSync(path.join(FRONTEND, rel))) err(scope, k + '.geojson declarado en el manifiesto pero no encontrado: ' + rel);
  });

  // 3) Contadores del manifiesto: deben cuadrar igual (a cero si están a cero) -------------------
  const habitats = park.habitats || [], species = park.species || [], pois = park.pointsOfInterest || [];
  const counts = manifest.counts || {};
  const images = manifest.images || [];
  if (counts.habitats !== habitats.length) err(scope, 'manifest.counts.habitats=' + counts.habitats + ' ≠ ' + habitats.length + ' en park.json');
  if (counts.species !== species.length) err(scope, 'manifest.counts.species=' + counts.species + ' ≠ ' + species.length + ' en park.json');
  if (counts.pointsOfInterest !== pois.length) err(scope, 'manifest.counts.pointsOfInterest=' + counts.pointsOfInterest + ' ≠ ' + pois.length + ' en park.json');
  if (counts.images !== images.length) err(scope, 'manifest.counts.images=' + counts.images + ' ≠ ' + images.length + ' entradas en manifest.images');

  validateTiles(scope, manifest);

  // 4) Contenido inesperado: no es un error, pero significa que la ficha ya no es solo "base" ----
  if (habitats.length || species.length || pois.length)
    warn(scope, 'la ficha base ya trae contenido (' + habitats.length + ' hábitats, ' + species.length + ' especies, ' + pois.length + ' POIs): ¿toca pasarla a status "available"?');

  if (errors === errorsBefore) ok('ficha base OK: bloque park completo y límite oficial válido');
}

function validatePark(entry) {
  console.log('\n\x1b[1m▶ ' + entry.slug + '\x1b[0m (' + entry.name + ')');
  const scope = entry.slug;
  const errorsBefore = errors;

  const manifestPath = path.join(FRONTEND, entry.manifest);
  if (!fs.existsSync(manifestPath)) { err(scope, 'manifest no encontrado: ' + entry.manifest); return; }
  const manifest = readJson(manifestPath);

  const parkPath = path.join(FRONTEND, manifest.data);
  if (!fs.existsSync(parkPath)) { err(scope, 'park.json no encontrado: ' + manifest.data); return; }
  const park = readJson(parkPath);

  const habitats = park.habitats || [];
  const species = park.species || [];
  const pois = park.pointsOfInterest || [];
  const habitatIds = new Set(habitats.map(h => h.id));
  const speciesIds = new Set(species.map(s => s.id));

  // 1) Unicidad de identificadores y códigos ------------------------------------------------------
  const dupHab = duplicates(habitats.map(h => h.id));
  const dupHabCode = duplicates(habitats.map(h => h.code));
  const dupSpp = duplicates(species.map(s => s.id));
  const dupPoi = duplicates(pois.map(p => p.id));
  if (dupHab.length) err(scope, 'ids de hábitat duplicados: ' + dupHab.join(', '));
  if (dupHabCode.length) err(scope, 'códigos de hábitat duplicados: ' + dupHabCode.join(', '));
  if (dupSpp.length) err(scope, 'ids de especie duplicados: ' + dupSpp.join(', '));
  if (dupPoi.length) err(scope, 'ids de POI duplicados: ' + dupPoi.join(', '));

  // 2) Integridad referencial especie ↔ hábitat ---------------------------------------------------
  species.forEach(s => (s.habitatIds || []).forEach(hid => {
    if (!habitatIds.has(hid)) err(scope, 'especie #' + s.id + ' (' + s.commonName + ') referencia hábitat inexistente "' + hid + '"');
  }));
  /*
   * El enlace REPETIDO, que solo se veía cargando el SQL.
   *
   * `species_habitats` tiene clave única en `(species_id, habitat_id)`, así que un `habitatIds` con
   * el mismo slug dos veces se colapsa al insertarlo: el fichero declara un número de vínculos y la
   * base guarda otro, y ninguna de las dos cifras avisa de la otra. En Carrascoy y El Valle eran
   * 1.310 contra 1.307, y la diferencia la ponía una sola ficha —*Osyris lanceolata*, que GBIF sirve
   * con dos claves distintas bajo el mismo nombre—.
   *
   * Se mira aquí porque es donde se nota sin base de datos delante: que el paquete y la API digan
   * cosas distintas es la cuarta de las «cinco cosas que fallan en verde» del CLAUDE.md, y esperar a
   * tener un MySQL para enterarse es exactamente lo que no puede pasar.
   */
  species.forEach(s => {
    const ids = s.habitatIds || [];
    const repes = [...new Set(ids.filter((x, i) => ids.indexOf(x) !== i))];
    if (repes.length)
      err(scope, 'especie #' + s.id + ' (' + s.commonName + '): `habitatIds` repite ' +
        repes.map(r => '"' + r + '"').join(', ') + '. La BD tiene clave única en (species_id, habitat_id), ' +
        'así que el paquete contaría ' + ids.length + ' vínculos y la carga insertaría ' + new Set(ids).size +
        '. Ver Tools/catalogo-nacional/build-species-n2.js');
  });
  habitats.forEach(h => (h.speciesIds || []).forEach(sid => {
    if (!speciesIds.has(sid)) err(scope, 'hábitat "' + h.id + '" referencia especie inexistente #' + sid);
  }));
  // Simetría: si un hábitat lista una especie, la especie debería listar ese hábitat (y viceversa).
  const habOf = new Map(species.map(s => [s.id, new Set(s.habitatIds || [])]));
  habitats.forEach(h => (h.speciesIds || []).forEach(sid => {
    if (habOf.has(sid) && !habOf.get(sid).has(h.id))
      warn(scope, 'asimetría: hábitat "' + h.id + '" lista la especie #' + sid + ' pero esa especie no lista el hábitat');
  }));

  const spOf = new Map(habitats.map(h => [h.id, new Set(h.speciesIds || [])]));
  species.forEach(s => (s.habitatIds || []).forEach(hid => {
    if (spOf.has(hid) && !spOf.get(hid).has(s.id))
      warn(scope, 'asimetría: la especie #' + s.id + ' lista el hábitat "' + hid + '" pero ese hábitat no lista la especie');
  }));

  /*
   * 3) Especies huérfanas (sin ningún hábitat).
   *
   * Las AVES se cuentan aparte y no se enumeran. Estar sin hábitat es su estado NORMAL —el catálogo
   * decide a propósito no colgarlas de ningún polígono—, así que meterlas en la lista convertía el
   * aviso en un volcado de sesenta nombres por espacio donde ya no se veía la planta huérfana, que
   * es lo único que aquí es un problema. Es el mismo aviso de siempre; lo que cambia es que ahora
   * se puede leer.
   */
  const sinHabitat = species.filter(s => !(s.habitatIds && s.habitatIds.length));
  const orphans = sinHabitat.filter(s => (s.taxonomy || {}).class !== 'Aves');
  const avesSinHabitat = sinHabitat.length - orphans.length;
  if (orphans.length) warn(scope, 'especies sin hábitat asignado (' + orphans.length + '): ' + orphans.map(s => '#' + s.id + ' ' + s.commonName).join(', '));
  if (avesSinHabitat) ok(avesSinHabitat + ' ave(s) sin hábitat asignado, que es lo esperado: las aves no se adscriben a hábitats');

  /*
   * 3 bis) La ficha que se contradice a sí misma.
   *
   * Estar sin hábitat es legítimo —las aves van al apartado de la ZEPA y no cuelgan de ningún
   * polígono—, así que el aviso de arriba, con 83 aves dentro, es ruido en el que se puede esconder
   * cualquier cosa. Y se escondió: cinco plantas de Sierra de la Pila tenían `habitatIds` vacío
   * mientras su `source` decía «200 ocurrencias dentro de los polígonos de hábitat del espacio
   * (9 hábitats)». El dato estaba dentro de la propia ficha y nadie lo cotejaba.
   *
   * `source` lo escribe `build-species-n2.js` con la cifra que sale del barrido de GBIF, así que
   * discrepar de `habitatIds` no es una imprecisión de redacción: es que se ha perdido el enlace.
   *
   * Quedan fuera las AVES: el catálogo decide a propósito no colgarlas de ningún hábitat —son el
   * grueso del ruido espacial, registros en vuelo que entran en cualquier recinto—, así que ahí la
   * discrepancia es el diseño y no un fallo.
   *
   * La exención iba por `zepaSiteCode` y ese era el campo equivocado: no dice que la especie sea un
   * ave, dice que su espacio solapa con una ZEPA. Cuando llegó Sierra de El Carche, que es LIC y
   * nada más, sus 92 aves perdieron la exención de golpe y salieron como 92 errores; y desde que
   * `zepaSiteCode` solo lo llevan las aves que el formulario oficial declara, la exención habría
   * dejado fuera a todas las demás. Se exime por la clase, que es lo que de verdad manda.
   */
  const CITA_HABITATS = /\((\d+) hábitats?;/;
  species.forEach(s => {
    if ((s.taxonomy || {}).class === 'Aves') return;
    const m = String(s.source || '').match(CITA_HABITATS);
    if (!m) return;
    const dice = Number(m[1]);
    const tiene = (s.habitatIds || []).length;
    if (dice > 0 && tiene === 0)
      err(scope, 'especie #' + s.id + ' (' + s.commonName + '): su `source` cuenta ' + dice +
        ' hábitat(s) y `habitatIds` está vacío. Ver Tools/catalogo-nacional/build-species-n2.js');
  });

  /*
   * 3 quater) El ave colgada de un hábitat: la contradicción por el otro lado, que no miraba nadie.
   *
   * El catálogo afirma dos cosas a la vez —«las aves no se adscriben a hábitats», que es lo que dice
   * su propio `source`, y una lista de `habitatIds`— y las dos no pueden ser ciertas. Quedaban 25
   * aves así en Cabo Cope, del volcado del piloto, anteriores a la regla; y la comprobación de
   * arriba no podía verlas porque las eximía a todas.
   *
   * Es aviso y no error porque son datos heredados y se limpian regenerando la Capa 3 del espacio,
   * no a mano en mitad de otra tarea.
   */
  const avesConHabitat = species.filter(s => (s.taxonomy || {}).class === 'Aves' && (s.habitatIds || []).length);
  if (avesConHabitat.length)
    warn(scope, avesConHabitat.length + ' ave(s) con `habitatIds`, que contradice su propio `source` ' +
      '(«las aves no se adscriben a hábitats»): ' +
      avesConHabitat.slice(0, 8).map(s => '#' + s.id + ' ' + s.commonName).join(', ') +
      (avesConHabitat.length > 8 ? ', …' : '') +
      '. Se limpia regenerando la Capa 3 del espacio (build-species-n2.js)');

  /*
   * 3 ter) Hábitats sin ninguna especie.
   *
   * En la app un hábitat sin especies es un callejón sin salida: se puede pisar su polígono y no hay
   * nada que descubrir (`explorer.js` ni siquiera pregunta). Puede ser legítimo —el 92D0 de Sierra de
   * la Pila son 13,2 ha de ribera con UNA ocurrencia de GBIF dentro, y es un insecto, fuera del
   * alcance del catálogo—, pero entonces tiene que constar por qué, en el `reviewNote` del hábitat.
   * Sin nota, el hueco no se distingue de un enlace perdido.
   */
  habitats.forEach(h => {
    if ((h.speciesIds || []).length) return;
    const nota = String(h.reviewNote || '').trim();
    if (nota) warn(scope, 'hábitat "' + h.id + '" (' + h.code + ') sin ninguna especie; el hueco está documentado en su `reviewNote`');
    else err(scope, 'hábitat "' + h.id + '" (' + h.code + ') sin ninguna especie y sin `reviewNote` que lo explique: ' +
      'o se han perdido los enlaces o el hueco es real, y en ese caso hay que escribirlo');
  });

  // 4) Contadores del manifiesto (el catcher de "21 vs 15") ---------------------------------------
  const counts = manifest.counts || {};
  if (counts.habitats !== habitats.length) err(scope, 'manifest.counts.habitats=' + counts.habitats + ' ≠ ' + habitats.length + ' en park.json');
  if (counts.species !== species.length) err(scope, 'manifest.counts.species=' + counts.species + ' ≠ ' + species.length + ' en park.json');
  if (counts.pointsOfInterest !== pois.length) err(scope, 'manifest.counts.pointsOfInterest=' + counts.pointsOfInterest + ' ≠ ' + pois.length + ' en park.json');
  const images = manifest.images || [];
  if (counts.images !== images.length) err(scope, 'manifest.counts.images=' + counts.images + ' ≠ ' + images.length + ' entradas en manifest.images');

  // 5) Imágenes ------------------------------------------------------------------------------------
  // La foto puede ser un fichero del repo (`Img/...`, cuando el servidor de origen no permite el
  // enlace directo) o una URL externa (Wikimedia Commons, GBIF/iNaturalist). Las dos son válidas;
  // lo que NO vale es una URL a un derivado cacheado de Wikimedia (`upload.wikimedia.org/.../thumb/
  // .../640px-...`): ese enlace apunta a un fichero generado, no al original, y devuelve 400 en
  // cuanto el thumb no está o el archivo se renombra. Fue lo que dejó sin foto a la Tortuga mora.
  // Se resuelve con Tools/catalogo-nacional/wikimedia-images.js --canonicalize.
  const thumbFragil = url => /upload\.wikimedia\.org\/.*\/thumb\//i.test(url || '');
  habitats.forEach(h => {
    if (h.image && h.image.startsWith('Img/') && !images.includes(h.image))
      warn(scope, 'la imagen local del hábitat "' + h.id + '" no está en manifest.images');
    if (thumbFragil(h.image)) err(scope, 'hábitat "' + h.id + '": enlaza a un thumb de Wikimedia (frágil). Usa Special:FilePath');
    if (h.image && !h.imageAttribution)
      warn(scope, 'hábitat "' + h.id + '" tiene foto pero no `imageAttribution` (CC-BY obliga a citar autor y licencia)');
  });
  species.forEach(s => {
    if (thumbFragil(s.image)) err(scope, 'especie #' + s.id + ' (' + s.commonName + '): enlaza a un thumb de Wikimedia (frágil). Usa Special:FilePath');
    if (s.image && !s.imageAttribution)
      warn(scope, 'especie #' + s.id + ' (' + s.commonName + ') tiene foto pero no `imageAttribution` (CC-BY obliga a citar autor y licencia)');
    if (!s.image) warn(scope, 'especie #' + s.id + ' (' + s.commonName + ') sin foto: la ficha muestra la portada temática');
  });

  // 4 bis) Rareza: las dos escalas y su procedencia -------------------------------------------------
  // `rarityScore` (universal) sale de la categoría legal ESTATAL; `rarityLocal` toma la más grave de
  // los dos ámbitos, estatal y autonómico. De ahí que el local nunca pueda ser MENOR que el estatal:
  // si lo es, o el tramo se ha escrito a mano o la selección se generó con otro criterio.
  //
  // Y un `rarityScore` sin `rarityBasis` es uno de los 448 valores heredados, puestos a ojo antes de
  // que el tramo se derivara de la norma. No es un error —el dato sigue ahí— pero tampoco puede pasar
  // por derivado: sale como aviso hasta que la migración lo recalcule contra EIDOS.
  // 4 ter) Trazabilidad del texto divulgativo -------------------------------------------------------
  // La descripción es lo que más lee el usuario y era el único campo de la ficha sin procedencia:
  // 476 fichas con texto y ninguna decía si lo servía EIDOS o lo había redactado alguien. Las dos
  // cosas conviven y en la app se ven idénticas, que es justo lo que la regla nº 7 pide no hacer.
  //
  // Desde ahora `descriptionSource` acompaña al texto. Es AVISO y no error a propósito: el texto
  // heredado es útil y no se va a tirar, pero tiene que constar cuánto queda sin trazar.
  //
  // Lo que sí es error: una ficha VISIBLE sin descripción. Esas se ocultan con
  // `npm run especies:ocultar` hasta que tengan texto — un hueco documentado, no una ficha en blanco
  // servida al usuario.
  let sinCita = 0;
  species.forEach(s => {
    const texto = String(s.description || '').trim();
    if (texto && !s.descriptionSource) sinCita++;
    if (!texto && s.visible !== false)
      err(scope, 'especie #' + s.id + ' (' + s.commonName + '): sin `description` y VISIBLE. ' +
        'Ocúltala (`visible: false`) hasta que tenga texto: ver npm run especies:ocultar');
  });
  if (sinCita)
    warn(scope, sinCita + ' especie(s) con descripción sin `descriptionSource`: no consta si el texto ' +
      'lo sirve EIDOS o lo redactó alguien. Ver Tools/catalogo-nacional/data/contenido/README.md');

  let sinBase = 0;
  species.forEach(s => {
    const fuera = v => v != null && (!Number.isInteger(v) || v < 1 || v > 5);
    if (fuera(s.rarityScore)) err(scope, 'especie #' + s.id + ' (' + s.commonName + '): `rarityScore` fuera del tramo 1–5: ' + s.rarityScore);
    if (fuera(s.rarityLocal)) err(scope, 'especie #' + s.id + ' (' + s.commonName + '): `rarityLocal` fuera del tramo 1–5: ' + s.rarityLocal);
    // El local incluye al estatal, así que nunca puede ser menor… pero SOLO cuando los dos salen de
    // la escalera legal. Mientras `rarityScore` siga siendo el número heredado a ojo (el que no tiene
    // `rarityBasis`), compararlos no dice nada: daba 339 errores contra valores que no significan lo
    // mismo. La comprobación se activa sola, ficha a ficha, en cuanto el estatal se migre.
    if (s.rarityBasis && s.rarityLocal != null && s.rarityScore != null && s.rarityLocal < s.rarityScore)
      err(scope, 'especie #' + s.id + ' (' + s.commonName + '): `rarityLocal` (' + s.rarityLocal +
        ') es MENOR que `rarityScore` (' + s.rarityScore + '), y el local incluye al estatal');
    if (s.rarityScore != null && !s.rarityBasis) sinBase++;
  });
  if (sinBase)
    warn(scope, sinBase + ' especie(s) con `rarityScore` sin `rarityBasis`: el tramo viene del criterio ' +
      'propio anterior, no de una norma. Pendiente de recalcular contra EIDOS');

  // 4 quater) Fenología del ave: `migratory` y `sitePresence` ------------------------------------
  /*
   * La pestaña de aves migratorias se construye con `migratory`, y ese campo solo puede decir lo que
   * declara el Formulario Normalizado de Datos del sitio Red Natura 2000. Aquí se comprueba que el
   * par no se separe nunca, porque separado no falla: la pestaña seguiría pintando la ficha y el
   * usuario leería «Ave migratoria» sin ninguna cita debajo, que es exactamente el cartel sin fuente
   * que la regla nº 2 prohíbe.
   *
   * Las tres cosas que se miran:
   *   · `migratory` sin `sitePresence` (o al revés) — el dato se ha escrito a mano o a medias.
   *   · `migratory` en algo que no es un ave — el FND da tipo de población a peces y mamíferos
   *     también, pero ahí «permanente» no significa «no migra»: clasificarlos sería inventar.
   *   · `migratory` que contradice a sus propios `tipos` — migratoria es, por definición, la que NO
   *     tiene población permanente declarada (Tools/lib/fenologia.js).
   *
   * Una ficha SIN los dos campos no es un error: son las 591 aves que ningún formulario nombra, y
   * omitir el campo es lo que distingue «nadie lo ha mirado» de «comprobado que no».
   */
  species.forEach(s => {
    const tiene = s.migratory !== undefined;
    const cita = s.sitePresence !== undefined;
    if (tiene !== cita)
      err(scope, 'especie #' + s.id + ' (' + s.commonName + '): tiene `' + (tiene ? 'migratory' : 'sitePresence') + '` sin el otro. Los dos los escribe Tools/lib/fenologia.js y viajan juntos: uno clasifica y el otro cita la fuente');
    if (!tiene) return;
    if ((s.taxonomy || {}).class !== 'Aves')
      err(scope, 'especie #' + s.id + ' (' + s.commonName + '): lleva `migratory` y no es un ave (clase «' +
        ((s.taxonomy || {}).class || 'sin dato') + '»). La fenología del formulario solo se interpreta para aves');
    const tipos = (s.sitePresence && s.sitePresence.tipos) || [];
    if (!tipos.length)
      err(scope, 'especie #' + s.id + ' (' + s.commonName + '): `sitePresence.tipos` vacío. Sin tipo de población no hay nada que clasificar');
    else if (s.migratory === tipos.includes('permanente'))
      err(scope, 'especie #' + s.id + ' (' + s.commonName + '): `migratory` = ' + s.migratory + ' contradice sus tipos [' +
        tipos.join(', ') + ']. Migratoria = ninguna población permanente declarada; ver Tools/lib/fenologia.js');
    if (!(s.sitePresence && String(s.sitePresence.fuente || '').trim()))
      err(scope, 'especie #' + s.id + ' (' + s.commonName + '): `sitePresence` sin `fuente`. El cartel de la ficha cita ese texto');
  });

  // 5 bis) Contenido universal de la ficha de especie ----------------------------------------------
  // Una ficha de especie describe a la ESPECIE, no su presencia en este parque: la misma ficha se
  // sirve en todos los espacios donde vive. Si `description`, `habitat` o `tips` nombran un parque,
  // una ZEPA o un LIC concretos, el texto es falso en cuanto la especie aparece en otro sitio —así
  // acabaron 40 fichas de Sierra Espuña hablando de una ZEPA de Cabo Cope. Lo específico del
  // espacio va en `habitatIds`, `source`, `featured` y `zepaSiteCode`.
  const RASTRO_LOCAL = /\b(este parque|del parque|en el parque|parque piloto|este espacio|Cabo Cope|Calnegre|Marina de Cope|Espuña|ZEPA ES\d+|LIC\/ZEC ES\d+|EEA\/BISE)\b/i;
  species.forEach(s => {
    for (const campo of ['description', 'habitat', 'tips']) {
      const texto = Array.isArray(s[campo]) ? s[campo].join(' ') : (s[campo] || '');
      const m = texto.match(RASTRO_LOCAL);
      if (m) err(scope, 'especie #' + s.id + ' (' + s.commonName + '): `' + campo + '` menciona «' + m[0] + '». Ese campo es universal; ver Tools/sync-species-catalog.js');
    }
    if (!(s.tips || []).length) warn(scope, 'especie #' + s.id + ' (' + s.commonName + ') sin pistas de identificación');
  });

  // 5 ter) Contenido universal de la ficha de hábitat ---------------------------------------------
  // Un código HIC es el mismo tipo de hábitat en toda la Directiva: el 5330 de Almería y el de
  // Tarragona son el mismo matorral. Su `description` describe ESE tipo de vegetación, no el recinto
  // que le tocó en este espacio, así que tampoco puede nombrar un parque —lo hacía: «terrestre del
  // parque piloto», «marina de Cope»—. Lo local del hábitat es el polígono, la superficie, el
  // centroide y sus `speciesIds`. La fuente de verdad es
  // Tools/catalogo-nacional/data/contenido/habitats.json, indexado por código.
  habitats.forEach(h => {
    const texto = h.description || '';
    if (!texto.trim()) { warn(scope, 'hábitat "' + h.id + '" sin descripción'); return; }
    const m = texto.match(RASTRO_LOCAL);
    if (m) err(scope, 'hábitat "' + h.id + '": `description` menciona «' + m[0] + '». Ese campo es universal; ver Tools/sync-habitat-catalog.js');
  });

  // 6) Coordenadas bien formadas ------------------------------------------------------------------
  // Además del formato se comprueba el encuadre: un [0, 0] es sintácticamente válido pero cae en el
  // golfo de Guinea, y así es como se colaban los POIs sin ubicar (NULL en la BD casteado a 0.0).
  if (badCoord(park.park && park.park.center)) err(scope, 'park.center mal formado');
  const checkCoord = (c, what) => {
    if (badCoord(c)) { err(scope, 'coordinates de ' + what + ' mal formadas'); return; }
    if (outsideSpain(c)) err(scope, 'coordinates de ' + what + ' fuera de España: [' + c.join(', ') + ']');
  };
  habitats.forEach(h => { if (h.coordinates) checkCoord(h.coordinates, 'hábitat "' + h.id + '"'); });
  species.forEach(s => { if (s.coordinates) checkCoord(s.coordinates, 'especie #' + s.id); });
  // Un POI siempre va ubicado (a diferencia de hábitats y especies, donde la coordenada es opcional).
  pois.forEach(p => {
    if (!p.coordinates) { err(scope, 'el punto de interés "' + p.id + '" no tiene coordenadas (son obligatorias)'); return; }
    checkCoord(p.coordinates, 'punto de interés "' + p.id + '"');
  });

  // 6 bis) Las reglas de admisión del N3 (§4 de Docs/prompts/e-rollout-nacional.md) --------------
  // Estaban escritas en el prompt y comprobadas a mano espacio por espacio, que es como se pierden:
  // la auditoría del 2026-08-15 encontró seis fotos de Commons servidas sin acreditar a su autor
  // —que es CONDICIÓN de la CC BY y la CC BY-SA, no un adorno—, dos POIs fuera del límite sin que su
  // ficha lo dijera y una distancia declarada («69 m») que no era la real (86,5 m). Nada de eso lo
  // veía ningún guardián.
  validatePoiRules(scope, pois, manifest);

  // 7) GeoJSON de hábitats ------------------------------------------------------------------------
  const geoRel = manifest.geo && manifest.geo.habitats;
  if (geoRel) {
    const geoPath = path.join(FRONTEND, geoRel);
    if (!fs.existsSync(geoPath)) { err(scope, 'habitats.geojson no encontrado: ' + geoRel); }
    else {
      const geo = readJson(geoPath);
      const feats = geo.features || [];
      const slugs = feats.map(f => f.properties && f.properties.slug);
      duplicates(slugs).forEach(s => err(scope, 'geojson: slug de hábitat duplicado "' + s + '"'));
      feats.forEach((f, i) => {
        const slug = f.properties && f.properties.slug;
        if (!slug) { err(scope, 'geojson: feature #' + i + ' sin properties.slug'); return; }
        if (!habitatIds.has(slug)) err(scope, 'geojson: slug "' + slug + '" no corresponde a ningún hábitat de park.json');
        const t = f.geometry && f.geometry.type;
        if (t !== 'Polygon' && t !== 'MultiPolygon') err(scope, 'geojson: "' + slug + '" con geometría "' + t + '" (se esperaba Polygon/MultiPolygon)');
        if (f.properties && f.properties.hectares != null && typeof f.properties.hectares !== 'number')
          warn(scope, 'geojson: "' + slug + '" con hectares no numérico');
      });
      const withGeom = new Set(slugs);
      const without = habitats.filter(h => !withGeom.has(h.id)).map(h => h.id);
      if (without.length) warn(scope, 'hábitats sin geometría (dibujan círculo aproximado): ' + without.join(', '));
      ok('geojson: ' + feats.length + '/' + habitats.length + ' hábitats con polígono');
    }
  }

  // 8) Existencia en disco de las imágenes locales referenciadas ----------------------------------
  let missing = 0;
  images.forEach(rel => { if (!fs.existsSync(path.join(FRONTEND, rel))) missing++; });
  if (missing) warn(scope, missing + '/' + images.length + ' imágenes de manifest.images aún no existen en disco (p. ej. fotos de hábitat pendientes de subir)');

  validateTiles(scope, manifest);

  // 9) Audioguías (accesibilidad UNE-EN 301549) ---------------------------------------------------
  // Todo audio explicativo necesita transcripción (WCAG 1.2.1) y debería figurar en manifest.audio
  // para que "Guardar sin conexión" lo descargue. También en las rutas del trails.geojson.
  const audioAssets = manifest.audio || [];
  const checkAudio = (kind, id, item) => {
    if (!item.audio) return;
    if (!item.audioTranscript || !String(item.audioTranscript).trim())
      err(scope, kind + ' "' + id + '" tiene audioguía sin transcripción (obligatoria por WCAG 1.2.1)');
    const local = !/^https?:\/\//i.test(item.audio);
    if (local && !audioAssets.includes(item.audio))
      warn(scope, 'la audioguía de ' + kind + ' "' + id + '" no está en manifest.audio (no se guardará sin conexión)');
    if (local && !fs.existsSync(path.join(FRONTEND, item.audio)))
      warn(scope, 'la audioguía de ' + kind + ' "' + id + '" aún no existe en disco: ' + item.audio);
  };
  habitats.forEach(h => checkAudio('hábitat', h.id, h));
  pois.forEach(p => checkAudio('POI', p.id, p));
  const trailsRel = manifest.geo && manifest.geo.trails;
  if (trailsRel && fs.existsSync(path.join(FRONTEND, trailsRel))) {
    const trails = readJson(path.join(FRONTEND, trailsRel));
    (trails.features || []).forEach((f, i) => {
      const p = f.properties || {};
      checkAudio('ruta', p.name || ('feature #' + i), { audio: p.audio, audioTranscript: p.audioTranscript });
    });
  }

  if (errors === errorsBefore) ok('coherencia OK: ' + habitats.length + ' hábitats, ' + species.length + ' especies, ' + pois.length + ' POIs');
}

// --- Coherencia ENTRE parques ---------------------------------------------------------------------
// La misma especie aparece en varios park.json. Los campos que describen a la especie tienen que ser
// idénticos en todos: si el pino carrasco sale con una foto en un parque y otra distinta en otro, es
// que alguien editó una copia. La fuente de verdad es el catálogo universal y quien las vuelve a
// alinear es `node Tools/sync-species-catalog.js --apply`.
const CAMPOS_UNIVERSALES = ['commonName', 'kingdom', 'group', 'habitat', 'seasonality', 'rarityScore', 'rarityBasis',
  'description', 'descriptionSource', 'tips', 'taxonomy', 'iucnGlobal', 'iucnSpain', 'spainStatus', 'image', 'imageAttribution'];

// Lo mismo, pero para los hábitats: la clave no es el nombre científico sino el CÓDIGO HIC, y el
// único campo universal de momento es la descripción. Quien las vuelve a alinear es
// `node Tools/sync-habitat-catalog.js --apply`.
const CAMPOS_UNIVERSALES_HABITAT = ['description'];

function validarCoherenciaEntreParques(parques) {
  const porEspecie = new Map();
  const porCodigoHic = new Map();
  parques.forEach(p => {
    // El park.json se localiza SIEMPRE por el manifiesto, que es lo que hace también el frontend.
    // Antes había un respaldo que construía la ruta a mano con `p.region || 'murcia'`: nunca se
    // ejecutaba (todo parque del registro tiene manifiesto) y, de hacerlo, habría buscado en
    // Murcia el park.json de cualquier parque de otra provincia. `region` es además el nombre de la
    // comunidad ("Región de Murcia"), no el segmento de ruta, así que jamás habría acertado.
    const manifestPath = p.manifest ? path.join(FRONTEND, p.manifest) : null;
    if (!manifestPath || !fs.existsSync(manifestPath)) return;   // ya avisado al validar el parque
    let data = null;
    const dataRel = readJson(manifestPath).data;
    if (dataRel && fs.existsSync(path.join(FRONTEND, dataRel))) data = readJson(path.join(FRONTEND, dataRel));
    (data && data.species || []).forEach(s => {
      if (!porEspecie.has(s.scientificName)) porEspecie.set(s.scientificName, []);
      porEspecie.get(s.scientificName).push({ slug: p.slug, sp: s });
    });
    (data && data.habitats || []).forEach(h => {
      const code = String(h.code || '');
      if (!code) return;
      if (!porCodigoHic.has(code)) porCodigoHic.set(code, []);
      porCodigoHic.get(code).push({ slug: p.slug, h });
    });
  });

  let divergencias = 0;
  porEspecie.forEach((apariciones, sci) => {
    if (apariciones.length < 2) return;
    const [primera, ...resto] = apariciones;
    CAMPOS_UNIVERSALES.forEach(campo => {
      const distintos = resto.filter(a => JSON.stringify(a.sp[campo]) !== JSON.stringify(primera.sp[campo]));
      if (!distintos.length) return;
      divergencias++;
      err('entre parques', sci + ': `' + campo + '` difiere entre ' + primera.slug + ' y ' + distintos.map(d => d.slug).join(', '));
    });
  });
  let divergenciasHic = 0;
  porCodigoHic.forEach((apariciones, code) => {
    if (apariciones.length < 2) return;
    const [primera, ...resto] = apariciones;
    CAMPOS_UNIVERSALES_HABITAT.forEach(campo => {
      const distintos = resto.filter(a => JSON.stringify(a.h[campo]) !== JSON.stringify(primera.h[campo]));
      if (!distintos.length) return;
      divergenciasHic++;
      err('entre parques', 'HIC ' + code + ': `' + campo + '` difiere entre ' + primera.slug + ' y ' + distintos.map(d => d.slug).join(', '));
    });
  });

  if (!divergencias && !divergenciasHic && porEspecie.size) {
    console.log('\n\x1b[1m▶ coherencia entre parques\x1b[0m');
    ok(porEspecie.size + ' especies y ' + porCodigoHic.size + ' códigos HIC distintos, sin divergencias en los campos universales');
  }
}

// --- Logros: catálogo universal y umbrales alcanzables --------------------------------------------
// Los logros son de ÁMBITO ESTATAL: el mismo texto lo lee alguien en Canarias y alguien en el
// Pirineo. Vale la regla 3 del CLAUDE.md —un texto universal que nombre un espacio concreto es un
// error del validador, no un aviso— y se comprueba aquí porque no hay ningún otro sitio donde
// pueda saltar: `Data/achievements.json` es la fuente única que leen el backend y el frontend.
//
// Además se avisa (aviso, no error) de los umbrales que HOY no puede alcanzar nadie con el
// catálogo dado de alta. No es un error: los umbrales territoriales apuntan a la España entera a
// propósito, y la app lo dice en la propia medalla. Pero conviene verlo al validar.
function validarLogros(registry, parques) {
  const file = path.join(FRONTEND, 'Data', 'achievements.json');
  if (!fs.existsSync(file)) { err('logros', 'falta Frontend/Data/achievements.json'); return; }
  const catalogo = readJson(file);
  const logros = catalogo.achievements || [];
  console.log('\n\x1b[1m▶ logros de cuenta\x1b[0m');

  // Nombres propios que un texto universal no puede mencionar: espacios, comunidades y provincias.
  const propios = [];
  (registry.communities || []).forEach(c => {
    if (c.name) propios.push(c.name);
    (c.provinces || []).forEach(p => {
      if (p.name) propios.push(p.name);
      (p.parks || []).forEach(e => { if (e.name) propios.push(e.name); });
    });
  });
  const normaliza = s => String(s || '').toLocaleLowerCase('es-ES');
  let citas = 0;
  logros.forEach(a => {
    const texto = normaliza(a.title + ' ' + a.description);
    propios.forEach(nombre => {
      if (nombre.length < 5) return; // nombres muy cortos darían falsos positivos dentro de palabras
      if (texto.includes(normaliza(nombre))) {
        citas++;
        err('logros', a.id + ': el texto nombra «' + nombre + '». Los logros son estatales y los lee todo el país.');
      }
    });
  });

  // Ids únicos y estables: un id reciclado le cambia el logro a quien ya lo tenía.
  const repetidos = duplicates(logros.map(a => a.id));
  if (repetidos.length) err('logros', 'ids repetidos: ' + repetidos.join(', '));

  // Techo del catálogo, contado de lo que hay dado de alta ahora mismo.
  const conCatalogo = parques.filter(p => p.status === 'available');
  const techo = {
    parksVisited: parques.length,
    parksCompleted: conCatalogo.length,
    regionsVisited: (registry.communities || []).filter(c => (c.provinces || []).some(p => (p.parks || []).length)).length,
    provincesVisited: (registry.communities || []).reduce((n, c) => n + (c.provinces || []).filter(p => (p.parks || []).length).length, 0)
  };
  const inalcanzables = logros.filter(a => techo[a.metric] !== undefined && a.threshold > techo[a.metric]);
  if (inalcanzables.length) {
    warn('logros', inalcanzables.length + ' logro(s) por encima de lo que permite el catálogo de hoy: '
      + inalcanzables.map(a => a.id + ' (' + a.threshold + ' > ' + techo[a.metric] + ')').join(', ')
      + '. La rejilla lo dice en la medalla; revísalos al ampliar el rollout.');
  }
  if (!citas && !repetidos.length) {
    ok(logros.length + ' logros en ' + (catalogo.categories || []).length + ' categorías, sin ningún texto que nombre un espacio o una comunidad');
  }
}

// --- main ---------------------------------------------------------------------------------------
console.log('\x1b[1mNaturDex · validación de datos de parques\x1b[0m');
if (!fs.existsSync(REGISTRY)) { console.error('No se encontró el registro: ' + REGISTRY); process.exit(2); }
const registry = readJson(REGISTRY);
const all = listParks(registry);
// Se validan los dos niveles con datos en disco. Los "planned" no tienen carpeta: no hay nada que
// comprobar, pero sí conviene avisar si alguno se quedó con manifiesto a medias.
const full = all.filter(p => p.status === 'available');
const basic = all.filter(p => p.status === 'basic');
const unknown = all.filter(p => !['available', 'basic', 'planned'].includes(p.status));
unknown.forEach(p => err(p.slug, 'status desconocido "' + p.status + '" (valores válidos: available, basic, planned)'));

if (!full.length && !basic.length) { console.log('No hay parques con datos que validar.'); process.exit(errors === 0 ? 0 : 1); }
full.forEach(validatePark);
basic.forEach(validateBasicPark);
validarCoherenciaEntreParques(full);
validarLogros(registry, all.filter(p => p.status === 'available' || p.status === 'basic'));

const total = full.length + basic.length;
const desglose = full.length + ' completo(s) + ' + basic.length + ' ficha(s) base';
console.log('\n' + '─'.repeat(60));
console.log(errors === 0
  ? '\x1b[32m✓ Validación superada\x1b[0m (' + total + ' espacio(s): ' + desglose + ', ' + warnings + ' aviso(s))'
  : '\x1b[31m✗ ' + errors + ' error(es)\x1b[0m y ' + warnings + ' aviso(s) en ' + total + ' espacio(s): ' + desglose);
process.exit(errors === 0 ? 0 : 1);
