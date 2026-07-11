#!/usr/bin/env node
/*
 * validate-park-data.js — red de seguridad de los datos empaquetados de NaturDex.
 *
 * Recorre el registro de parques (Frontend/Data/parks-index.json) y valida, para cada parque
 * "available", la coherencia de park.json ↔ manifest.json ↔ geo/habitats.geojson: contadores,
 * referencias especie↔hábitat, unicidad de ids/códigos, convención de imágenes y geometría.
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

function validatePark(entry) {
  console.log('\n\x1b[1m▶ ' + entry.slug + '\x1b[0m (' + entry.name + ')');
  const scope = entry.slug;

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
  const badCoord = c => !Array.isArray(c) || c.length !== 2 || c.some(n => typeof n !== 'number');
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

  if (errors === 0) ok('coherencia OK: ' + habitats.length + ' hábitats, ' + species.length + ' especies, ' + pois.length + ' POIs');
}

// --- main ---------------------------------------------------------------------------------------
console.log('\x1b[1mNaturDex · validación de datos de parques\x1b[0m');
if (!fs.existsSync(REGISTRY)) { console.error('No se encontró el registro: ' + REGISTRY); process.exit(2); }
const registry = readJson(REGISTRY);
const parks = listParks(registry).filter(p => p.status === 'available');
if (!parks.length) { console.log('No hay parques "available" que validar.'); process.exit(0); }
parks.forEach(validatePark);

console.log('\n' + '─'.repeat(60));
console.log(errors === 0
  ? '\x1b[32m✓ Validación superada\x1b[0m (' + parks.length + ' parque(s), ' + warnings + ' aviso(s))'
  : '\x1b[31m✗ ' + errors + ' error(es)\x1b[0m y ' + warnings + ' aviso(s) en ' + parks.length + ' parque(s)');
process.exit(errors === 0 ? 0 : 1);
