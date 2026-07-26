'use strict';
/*
 * Utilidades geométricas compartidas (sin dependencias): bbox, punto-en-polígono, áreas,
 * orientación y cierre de anillos, área aproximada en hectáreas.
 */

function bbox(ring) {
  let a = [Infinity, Infinity, -Infinity, -Infinity];
  for (const [x, y] of ring) { if (x < a[0]) a[0] = x; if (y < a[1]) a[1] = y; if (x > a[2]) a[2] = x; if (y > a[3]) a[3] = y; }
  return a;
}
function bboxOverlap(a, b) { return !(a[2] < b[0] || b[2] < a[0] || a[3] < b[1] || b[3] < a[1]); }

// Ray casting: ¿[x,y] dentro del anillo?
function inRing(x, y, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1];
    if (((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)) inside = !inside;
  }
  return inside;
}

// Área con signo (positiva si CCW). En shapefile los anillos exteriores son CW (área < 0).
function signedArea(r) { let a = 0; for (let i = 0, j = r.length - 1; i < r.length; j = i++) a += (r[j][0] * r[i][1] - r[i][0] * r[j][1]); return a / 2; }
function ringArea(r) { return Math.abs(signedArea(r)); }

function closeRing(r) { const c = r.slice(); if (c.length && (c[0][0] !== c[c.length - 1][0] || c[0][1] !== c[c.length - 1][1])) c.push(c[0]); return c; }
// Orienta un anillo: ccw=true → sentido antihorario (exterior GeoJSON); ccw=false → horario (agujero).
function orientRing(r, ccw) { return ((signedArea(r) < 0) === ccw) ? r.slice().reverse() : r.slice(); }

// Área de una geometría GeoJSON (Polygon/MultiPolygon en lon/lat) en hectáreas, aprox. equirectangular.
function areaHectares(geom, latRef) {
  const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
  let a = 0;
  for (const poly of polys) { a += ringArea(poly[0]); for (let i = 1; i < poly.length; i++) a -= ringArea(poly[i]); }
  const m2 = a * (111320 * 111320 * Math.cos(latRef * Math.PI / 180));
  return +(m2 / 10000).toFixed(1);
}

module.exports = { bbox, bboxOverlap, inRing, signedArea, ringArea, closeRing, orientRing, areaHectares };
