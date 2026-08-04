'use strict';
/*
 * Parser mínimo de shapefile (.shp) de polígonos (tipo 5) + reproyección inversa
 * ETRS89/UTM (cualquier huso) → WGS84. Sin dependencias.
 *
 * La cartografía de hábitats del MITECO viene en ETRS89 UTM; el huso depende de la región:
 * 28N (Canarias, EPSG:32628), 29N (EPSG:25829), 30N (EPSG:25830), 31N (EPSG:25831).
 * ETRS89 ≈ WGS84 (diferencia < 1 m), así que no se aplica datum-shift.
 */
const fs = require('fs');

// --- Reproyección inversa UTM (GRS80) → lon/lat en grados -------------------------------------
const A = 6378137.0, F = 1 / 298.257222101, E2 = 2 * F - F * F, K0 = 0.9996, E0 = 500000;

// Meridiano central del huso UTM: zona 30 → -3°, 29 → -9°, 31 → +3°, 28 → -15°.
function centralMeridianRad(zone) { return (zone * 6 - 183) * Math.PI / 180; }

function utmToLonLat(E, N, zone) {
  const lon0 = centralMeridianRad(zone);
  const x = E - E0, M = N / K0;
  const mu = M / (A * (1 - E2 / 4 - 3 * E2 * E2 / 64 - 5 * E2 * E2 * E2 / 256));
  const e1 = (1 - Math.sqrt(1 - E2)) / (1 + Math.sqrt(1 - E2));
  const phi1 = mu + (3 * e1 / 2 - 27 * e1 ** 3 / 32) * Math.sin(2 * mu)
    + (21 * e1 * e1 / 16 - 55 * e1 ** 4 / 32) * Math.sin(4 * mu)
    + (151 * e1 ** 3 / 96) * Math.sin(6 * mu) + (1097 * e1 ** 4 / 512) * Math.sin(8 * mu);
  const ep2 = E2 / (1 - E2);
  const C1 = ep2 * Math.cos(phi1) ** 2, T1 = Math.tan(phi1) ** 2;
  const N1 = A / Math.sqrt(1 - E2 * Math.sin(phi1) ** 2);
  const R1 = A * (1 - E2) / Math.pow(1 - E2 * Math.sin(phi1) ** 2, 1.5);
  const D = x / (N1 * K0);
  const lat = phi1 - (N1 * Math.tan(phi1) / R1) * (D * D / 2
    - (5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * ep2) * D ** 4 / 24
    + (61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 252 * ep2 - 3 * C1 * C1) * D ** 6 / 720);
  const lon = lon0 + (D - (1 + 2 * T1 + C1) * D ** 3 / 6
    + (5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * ep2 + 24 * T1 * T1) * D ** 5 / 120) / Math.cos(phi1);
  return [lon * 180 / Math.PI, lat * 180 / Math.PI];
}

// --- Parser .shp (solo Polygon, tipo 5) -------------------------------------------------------
// Devuelve un array (por registro, en el orden del .dbf) de listas de anillos [[x,y],...] en las
// coordenadas nativas del fichero (UTM). Los registros nulos devuelven null.
function readPolygons(file) {
  const b = fs.readFileSync(file);
  const recs = [];
  let o = 100; // cabecera de 100 bytes
  while (o < b.length) {
    const contentLen = b.readInt32BE(o + 4) * 2;
    const start = o + 8;
    const shapeType = b.readInt32LE(start);
    if (shapeType === 5) {
      const numParts = b.readInt32LE(start + 36), numPoints = b.readInt32LE(start + 40);
      let p = start + 44;
      const parts = [];
      for (let i = 0; i < numParts; i++) { parts.push(b.readInt32LE(p)); p += 4; }
      const pts = [];
      for (let i = 0; i < numPoints; i++) { pts.push([b.readDoubleLE(p), b.readDoubleLE(p + 8)]); p += 16; }
      const rings = [];
      for (let i = 0; i < numParts; i++) {
        const s = parts[i], e = (i + 1 < numParts) ? parts[i + 1] : numPoints;
        rings.push(pts.slice(s, e));
      }
      recs.push(rings);
    } else recs.push(null);
    o = start + contentLen;
  }
  return recs;
}

module.exports = { utmToLonLat, readPolygons, centralMeridianRad };
