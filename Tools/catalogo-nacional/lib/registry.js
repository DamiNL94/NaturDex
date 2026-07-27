'use strict';
/*
 * Localiza en el registro de parques (Frontend/Data/parks-index.json) los ficheros geo de un
 * parque: su habitats.geojson (capa curada) y su límite. Mismo recorrido que Tools/gbif-habitats.js.
 */
const fs = require('fs');
const path = require('path');

// Se resuelven los DOS niveles de dato del rollout nacional: "available" (N2, completo) y "basic"
// (N1, ficha base). Un espacio N1 es justamente el que está ascendiendo a N2, así que excluirlo
// hacía imposible generarle los hábitats: todavía no tiene `habitats.geojson`, lo estamos creando.
const NIVELES = ['available', 'basic'];

function resolvePark(repoRoot, slug) {
  const frontend = path.join(repoRoot, 'Frontend');
  const registry = JSON.parse(fs.readFileSync(path.join(frontend, 'Data', 'parks-index.json'), 'utf8'));
  const parks = [];
  for (const community of registry.communities || [])
    for (const province of community.provinces || [])
      for (const park of province.parks || []) {
        if (!NIVELES.includes(park.status || '') || !park.manifest) continue;
        const manifestPath = path.join(frontend, park.manifest);
        if (!fs.existsSync(manifestPath)) continue;
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        // `parque` es la clave que usan de verdad el registro, el generador N1 y el frontend
        // (Frontend/Js/map.js). `boundary`/`park` se conservan por compatibilidad. Antes no se
        // miraba ninguna de las tres y sólo funcionaba de rebote, porque el fallback coincidía con
        // el nombre de fichero del piloto (`parque-regional.geojson`).
        const boundRel = manifest.geo && (manifest.geo.parque || manifest.geo.boundary || manifest.geo.park);
        const habRel = manifest.geo && manifest.geo.habitats;
        if (!boundRel && !habRel) continue;
        const geoDir = path.dirname(path.join(frontend, habRel || boundRel));
        const habitatsPath = habRel ? path.join(frontend, habRel) : path.join(geoDir, 'habitats.geojson');
        const boundaryPath = boundRel ? path.join(frontend, boundRel) : path.join(geoDir, 'parque-regional.geojson');
        parks.push({
          slug: manifest.apiSlug || park.slug, name: park.name || manifest.name || park.slug,
          status: park.status, habitatsPath, boundaryPath, geoDir
        });
      }
  if (parks.length === 0) throw new Error('No hay parques con datos geográficos en el registro.');
  if (!slug) return parks[0];
  const p = parks.find(x => x.slug === slug);
  if (!p) throw new Error(`Parque '${slug}' no encontrado. Disponibles: ${parks.map(x => x.slug).join(', ')}`);
  return p;
}

// Todos los polígonos del límite en WGS84, como coordenadas de MultiPolygon: [[exterior, agujero…], …].
// Hay que quedarse con TODOS: la mayoría de los espacios protegidos son multiparte y con enclaves
// excluidos. Sierra Espuña, sin ir más lejos, son 5 piezas y la mayor tiene un agujero de 471 ha;
// recortar contra el primer anillo daba un límite 446 ha mayor que el real (+2,5 %).
function readBoundaryPolygons(boundaryPath) {
  const gj = JSON.parse(fs.readFileSync(boundaryPath, 'utf8'));
  const feats = gj.type === 'FeatureCollection' ? (gj.features || []) : [gj.geometry ? gj : { geometry: gj }];
  const polys = [];
  for (const f of feats) {
    const g = f.geometry;
    if (!g) continue;
    if (g.type === 'Polygon') polys.push(g.coordinates);
    else if (g.type === 'MultiPolygon') polys.push(...g.coordinates);
  }
  return polys;
}

// Anillo exterior de la primera pieza. Sólo para usos en los que basta una referencia aproximada
// (p. ej. la latitud media para calcular áreas); para recortar hay que usar readBoundaryPolygons.
function readBoundaryRing(boundaryPath) {
  const polys = readBoundaryPolygons(boundaryPath);
  if (!polys.length) throw new Error(`Límite sin polígonos: ${boundaryPath}`);
  return polys[0][0];
}

module.exports = { resolvePark, readBoundaryRing, readBoundaryPolygons };
