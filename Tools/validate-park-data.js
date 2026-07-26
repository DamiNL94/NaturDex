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

const ROOT = path.join(__dirname, '..');
const FRONTEND = path.join(ROOT, 'Frontend');
const REGISTRY = path.join(FRONTEND, 'Data', 'parks-index.json');

let errors = 0, warnings = 0;
const err = (scope, msg) => { errors++; console.log('  \x1b[31m✗ ERROR\x1b[0m [' + scope + '] ' + msg); };
const warn = (scope, msg) => { warnings++; console.log('  \x1b[33m⚠ aviso\x1b[0m [' + scope + '] ' + msg); };
const ok = (msg) => console.log('  \x1b[32m✓\x1b[0m ' + msg);

function readJson(absPath) {
  const raw = fs.readFileSync(absPath, 'utf8');
  return JSON.parse(raw);
}

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
  habitats.forEach(h => (h.speciesIds || []).forEach(sid => {
    if (!speciesIds.has(sid)) err(scope, 'hábitat "' + h.id + '" referencia especie inexistente #' + sid);
  }));
  // Simetría: si un hábitat lista una especie, la especie debería listar ese hábitat (y viceversa).
  const habOf = new Map(species.map(s => [s.id, new Set(s.habitatIds || [])]));
  habitats.forEach(h => (h.speciesIds || []).forEach(sid => {
    if (habOf.has(sid) && !habOf.get(sid).has(h.id))
      warn(scope, 'asimetría: hábitat "' + h.id + '" lista la especie #' + sid + ' pero esa especie no lista el hábitat');
  }));

  // 3) Especies huérfanas (sin ningún hábitat) ----------------------------------------------------
  const orphans = species.filter(s => !(s.habitatIds && s.habitatIds.length));
  if (orphans.length) warn(scope, 'especies sin hábitat asignado (' + orphans.length + '): ' + orphans.map(s => '#' + s.id + ' ' + s.commonName).join(', '));

  // 4) Contadores del manifiesto (el catcher de "21 vs 15") ---------------------------------------
  const counts = manifest.counts || {};
  if (counts.habitats !== habitats.length) err(scope, 'manifest.counts.habitats=' + counts.habitats + ' ≠ ' + habitats.length + ' en park.json');
  if (counts.species !== species.length) err(scope, 'manifest.counts.species=' + counts.species + ' ≠ ' + species.length + ' en park.json');
  if (counts.pointsOfInterest !== pois.length) err(scope, 'manifest.counts.pointsOfInterest=' + counts.pointsOfInterest + ' ≠ ' + pois.length + ' en park.json');
  const images = manifest.images || [];
  if (counts.images !== images.length) err(scope, 'manifest.counts.images=' + counts.images + ' ≠ ' + images.length + ' entradas en manifest.images');

  // 5) Convención de imagen de hábitat ------------------------------------------------------------
  habitats.forEach(h => {
    const expected = 'Img/habitats/' + h.id + '.jpg';
    if (h.image && h.image !== expected) warn(scope, 'hábitat "' + h.id + '" tiene image="' + h.image + '" (se esperaba "' + expected + '")');
    if (h.image && !images.includes(h.image)) warn(scope, 'la imagen del hábitat "' + h.id + '" no está en manifest.images');
  });

  // 6) Coordenadas bien formadas ------------------------------------------------------------------
  if (badCoord(park.park && park.park.center)) err(scope, 'park.center mal formado');
  habitats.forEach(h => { if (h.coordinates && badCoord(h.coordinates)) err(scope, 'coordinates de hábitat "' + h.id + '" mal formadas'); });
  species.forEach(s => { if (s.coordinates && badCoord(s.coordinates)) err(scope, 'coordinates de especie #' + s.id + ' mal formadas'); });

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

const total = full.length + basic.length;
const desglose = full.length + ' completo(s) + ' + basic.length + ' ficha(s) base';
console.log('\n' + '─'.repeat(60));
console.log(errors === 0
  ? '\x1b[32m✓ Validación superada\x1b[0m (' + total + ' espacio(s): ' + desglose + ', ' + warnings + ' aviso(s))'
  : '\x1b[31m✗ ' + errors + ' error(es)\x1b[0m y ' + warnings + ' aviso(s) en ' + total + ' espacio(s): ' + desglose);
process.exit(errors === 0 ? 0 : 1);
