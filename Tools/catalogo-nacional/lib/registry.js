'use strict';
/*
 * Localiza en el registro de parques (Frontend/Data/parks-index.json) los ficheros geo de un
 * parque: su habitats.geojson (capa curada) y su límite. Mismo recorrido que Tools/gbif-habitats.js.
 */
const fs = require('fs');
const path = require('path');

function resolvePark(repoRoot, slug) {
  const frontend = path.join(repoRoot, 'Frontend');
  const registry = JSON.parse(fs.readFileSync(path.join(frontend, 'Data', 'parks-index.json'), 'utf8'));
  const parks = [];
  for (const community of registry.communities || [])
    for (const province of community.provinces || [])
      for (const park of province.parks || []) {
        if ((park.status || '') !== 'available' || !park.manifest) continue;
        const manifestPath = path.join(frontend, park.manifest);
        if (!fs.existsSync(manifestPath)) continue;
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        const habRel = manifest.geo && manifest.geo.habitats;
        if (!habRel) continue;
        const habitatsPath = path.join(frontend, habRel);
        const geoDir = path.dirname(habitatsPath);
        const boundRel = manifest.geo && (manifest.geo.boundary || manifest.geo.park);
        const boundaryPath = boundRel ? path.join(frontend, boundRel) : path.join(geoDir, 'parque-regional.geojson');
        parks.push({ slug: manifest.apiSlug || park.slug, name: park.name || manifest.name || park.slug, habitatsPath, boundaryPath, geoDir });
      }
  if (parks.length === 0) throw new Error('No hay parques "available" con habitats en el registro.');
  if (!slug) return parks[0];
  const p = parks.find(x => x.slug === slug);
  if (!p) throw new Error(`Parque '${slug}' no encontrado. Disponibles: ${parks.map(x => x.slug).join(', ')}`);
  return p;
}

// Lee el anillo exterior del límite del parque (primer Feature, primer anillo) en WGS84.
function readBoundaryRing(boundaryPath) {
  const gj = JSON.parse(fs.readFileSync(boundaryPath, 'utf8'));
  const geom = gj.type === 'FeatureCollection' ? gj.features[0].geometry : (gj.geometry || gj);
  return geom.type === 'Polygon' ? geom.coordinates[0] : geom.coordinates[0][0];
}

module.exports = { resolvePark, readBoundaryRing };
