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

  const spOf = new Map(habitats.map(h => [h.id, new Set(h.speciesIds || [])]));
  species.forEach(s => (s.habitatIds || []).forEach(hid => {
    if (spOf.has(hid) && !spOf.get(hid).has(s.id))
      warn(scope, 'asimetría: la especie #' + s.id + ' lista el hábitat "' + hid + '" pero ese hábitat no lista la especie');
  }));

  // 3) Especies huérfanas (sin ningún hábitat) ----------------------------------------------------
  const orphans = species.filter(s => !(s.habitatIds && s.habitatIds.length));
  if (orphans.length) warn(scope, 'especies sin hábitat asignado (' + orphans.length + '): ' + orphans.map(s => '#' + s.id + ' ' + s.commonName).join(', '));

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
   * Quedan fuera las especies del apartado de la ZEPA (`zepaSiteCode`): sus ocurrencias también
   * cayeron dentro de los polígonos, pero el catálogo decide a propósito no colgar las aves de
   * ningún hábitat —son el grueso del ruido espacial, registros en vuelo que entran en cualquier
   * recinto—, así que ahí la discrepancia es el diseño y no un fallo.
   */
  const CITA_HABITATS = /\((\d+) hábitats?;/;
  species.forEach(s => {
    if (s.zepaSiteCode) return;
    const m = String(s.source || '').match(CITA_HABITATS);
    if (!m) return;
    const dice = Number(m[1]);
    const tiene = (s.habitatIds || []).length;
    if (dice > 0 && tiene === 0)
      err(scope, 'especie #' + s.id + ' (' + s.commonName + '): su `source` cuenta ' + dice +
        ' hábitat(s) y `habitatIds` está vacío. Ver Tools/catalogo-nacional/build-species-n2.js');
  });

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
  'description', 'descriptionSource', 'tips', 'taxonomy', 'iucnGlobal', 'spainStatus', 'image', 'imageAttribution'];

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

const total = full.length + basic.length;
const desglose = full.length + ' completo(s) + ' + basic.length + ' ficha(s) base';
console.log('\n' + '─'.repeat(60));
console.log(errors === 0
  ? '\x1b[32m✓ Validación superada\x1b[0m (' + total + ' espacio(s): ' + desglose + ', ' + warnings + ' aviso(s))'
  : '\x1b[31m✗ ' + errors + ' error(es)\x1b[0m y ' + warnings + ' aviso(s) en ' + total + ' espacio(s): ' + desglose);
process.exit(errors === 0 ? 0 : 1);
