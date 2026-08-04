#!/usr/bin/env node
'use strict';
/*
 * adopt-habitats.js — adopta el <slug>-merged.geojson como la capa REAL del parque.
 *
 *   node Tools/catalogo-nacional/adopt-habitats.js --park <slug> [--dry]
 *
 * Es el paso §7.3 de la deuda técnica del rollout: hasta ahora `merge-habitats.js` dejaba su
 * resultado en `out/` para revisión manual y nadie lo llevaba a `Frontend/`. Esto lo cierra:
 *
 *   1. Escribe Frontend/Data/parks/<prov>/<slug>/geo/habitats.geojson desde el merged.
 *   2. Sincroniza el array `habitats` de park.json: CONSERVA los campos curados a mano
 *      (description, coordinates, color, image, audio, speciesIds, reviewNote) y actualiza desde la
 *      fuente oficial los que son dato (code, name, type, priority, hicSubtipos, fitosociologia).
 *      Los hábitats nuevos entran con la descripción oficial del Atlas y su centroide calculado.
 *   3. Recalcula los contadores del manifiesto.
 *
 * REGLA DE PRODUCTO: los hábitats marinos NO se adoptan. «La app no es útil en el mar», así que un
 * hábitat sumergido (type "Marino" en hic-nombres.json: praderas de Posidonia, fondos…) no entra en
 * el catálogo aunque la cartografía oficial lo recorte dentro del parque. Se informa de cada uno.
 *
 * Fuente: «© Ministerio para la Transición Ecológica y el Reto Demográfico».
 */
const fs = require('fs');
const path = require('path');
const { resolvePark } = require('../lib/registry');
const { ringArea, inRing } = require('../lib/geo');

const { arg, flag, requireArgs } = require('../lib/cli');
const { ROOT: RAIZ, FRONTEND } = require('../lib/io');

const DRY = flag('dry');
const PARK = arg('park');
requireArgs('Uso: --park <slug> [--dry] [--merged <ruta>]', { park: PARK });

const NOMBRES = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'hic-nombres.json'), 'utf8')).codigos;
// Tipos que no se adoptan: lo que está bajo el agua no se explora a pie.
const TIPOS_EXCLUIDOS = new Set(['Marino']);
// Excepciones por parque: códigos que la cartografía oficial recorta dentro del espacio pero que su
// formulario normalizado Natura 2000 no declara (ver el _nota del fichero para la regla de alta).
const EXCLUIDOS_PARQUE = (JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'hic-excluidos.json'), 'utf8')).parques || {})[PARK] || {};

// Campos de park.json que son CURADOS: se conservan tal cual si ya existían.
const CURADOS = ['description', 'coordinates', 'color', 'image', 'audio', 'audioTranscript', 'reviewNote', 'speciesIds'];
// Campos que son DATO: se refrescan siempre desde la capa oficial.
const DATO = { code: 'code', name: 'name', type: 'type', priority: 'priority', hicSubtipos: 'hic_subtipos', fitosociologia: 'fitosociologia' };

const polysDe = g => !g ? [] : g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];

// Centroide de área del hábitat, garantizando que cae dentro del polígono (mismo criterio que
// build-n1-espacios.js): es la coordenada con la que el mapa pone el marcador del hábitat.
function centroide(polys) {
  let sx = 0, sy = 0, sa = 0;
  for (const poly of polys) {
    const r = poly[0];
    let a = 0, cx = 0, cy = 0;
    for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
      const f = r[j][0] * r[i][1] - r[i][0] * r[j][1];
      a += f; cx += (r[j][0] + r[i][0]) * f; cy += (r[j][1] + r[i][1]) * f;
    }
    if (a === 0) continue;
    const area = Math.abs(a / 2);
    sx += (cx / (3 * a)) * area; sy += (cy / (3 * a)) * area; sa += area;
  }
  if (!sa) return null;
  const c = [sx / sa, sy / sa];
  const dentro = polys.some(poly => inRing(c[0], c[1], poly[0]) && !poly.slice(1).some(h => inRing(c[0], c[1], h)));
  if (dentro) return c;
  // Si cae fuera (hábitat troceado), se usa el centroide de la pieza mayor.
  const mayor = polys.reduce((m, p) => (ringArea(p[0]) > ringArea(m[0]) ? p : m), polys[0]);
  return centroide([mayor]) || c;
}

// Paleta de la app: color estable derivado del código HIC, para que un mismo hábitat salga igual en
// todos los parques. No es dato, es presentación.
const PALETA = ['#8b5e34', '#4f7942', '#a0522d', '#556b2f', '#6b8e23', '#8fbc8f', '#b8860b', '#2e8b57', '#9acd32', '#cd853f', '#66cdaa', '#daa520'];
const colorDe = code => PALETA[[...String(code)].reduce((s, c) => s + c.charCodeAt(0), 0) % PALETA.length];

function main() {
  const park = resolvePark(RAIZ, PARK);
  const mergedPath = flag('--merged') || path.join(__dirname, 'out', `${PARK}-merged.geojson`);
  if (!fs.existsSync(mergedPath)) { console.error(`No existe el merged: ${mergedPath}\nLánzalo antes con merge-habitats.js`); process.exit(2); }

  const merged = JSON.parse(fs.readFileSync(mergedPath, 'utf8'));
  const parkJsonPath = path.join(path.dirname(park.geoDir), 'park.json');
  const doc = JSON.parse(fs.readFileSync(parkJsonPath, 'utf8'));
  const previos = new Map((doc.habitats || []).map(h => [h.id, h]));

  console.log(`\nParque: ${park.name} (${park.slug}) · merged: ${merged.features.length} hábitats · park.json: ${previos.size}`);

  // 1) Filtro marino -------------------------------------------------------------------------------
  const excluidos = [], aceptados = [];
  for (const f of merged.features) {
    const code = String(f.properties.code || '');
    const tipo = (NOMBRES[code] && NOMBRES[code].type) || f.properties.type;
    if (TIPOS_EXCLUIDOS.has(tipo)) { excluidos.push(`${code} ${f.properties.name} (tipo ${tipo})`); continue; }
    if (EXCLUIDOS_PARQUE[code]) { excluidos.push(`${code} ${f.properties.name} — ${EXCLUIDOS_PARQUE[code]}`); continue; }
    aceptados.push(f);
  }
  if (excluidos.length) {
    console.log('\nExcluidos (regla de producto marina + excepciones de hic-excluidos.json):');
    excluidos.forEach(e => console.log(`  · ${e}`));
  }
  // Un código sin ficha en hic-nombres.json entra con nombre 'HIC <código>' y tipo 'Hábitat', y con
  // ese tipo se salta el filtro marino. Se avisa para que se decida antes de publicarlo.
  const sinFicha = aceptados.filter(f => !NOMBRES[String(f.properties.code || '')]).map(f => f.properties.code);
  if (sinFicha.length) console.log(`\n⚠ códigos sin ficha en hic-nombres.json (nombre y tipo son un apaño, revísalos): ${sinFicha.join(', ')}`);

  // 2) Sincronizar el array `habitats` --------------------------------------------------------------
  const habitats = [], nuevos = [], actualizados = [];
  for (const f of aceptados) {
    const p = f.properties, id = p.slug;
    const antes = previos.get(id);
    const h = antes ? { ...antes } : { id };
    for (const [destino, origen] of Object.entries(DATO)) if (p[origen] !== undefined) h[destino] = p[origen];
    if (!antes) {
      // Hábitat nuevo: lo que no sea dato oficial se deja vacío antes que inventarlo. La descripción
      // sí es oficial — sale del campo DESCRIPCIO del Atlas, propagado por build-habitats.js.
      h.description = p.descripcion || p.nombre_comun || '';
      h.coordinates = (c => c ? [+c[1].toFixed(6), +c[0].toFixed(6)] : null)(centroide(polysDe(f.geometry)));
      h.color = colorDe(h.code);
      h.image = null; h.audio = null; h.audioTranscript = null; h.reviewNote = null;
      h.speciesIds = [];
      nuevos.push(`${h.code} ${h.name}`);
    } else {
      CURADOS.forEach(k => { if (antes[k] !== undefined) h[k] = antes[k]; });
      actualizados.push(h.code);
    }
    habitats.push(h);
  }
  // Un hábitat curado que la fuente oficial ya no respalda no se borra en silencio.
  const huerfanos = [...previos.keys()].filter(id => !aceptados.some(f => f.properties.slug === id));
  if (huerfanos.length) console.log(`\n⚠ hábitats de park.json que el merged no trae (se CONSERVAN): ${huerfanos.join(', ')}`);
  huerfanos.forEach(id => habitats.push(previos.get(id)));

  doc.habitats = habitats;

  // 3) Escribir -------------------------------------------------------------------------------------
  const geo = { type: 'FeatureCollection', features: aceptados };
  const manifestRel = path.relative(FRONTEND, park.habitatsPath).split(path.sep).join('/');
  const manifestPath = path.join(path.dirname(park.geoDir), 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.geo = manifest.geo || {};
  manifest.geo.habitats = manifestRel;
  manifest.counts = manifest.counts || {};
  manifest.counts.habitats = habitats.length;
  manifest.counts.species = (doc.species || []).length;
  manifest.counts.pointsOfInterest = (doc.pointsOfInterest || []).length;

  const escribir = (p, txt) => {
    const rel = path.relative(RAIZ, p);
    if (fs.existsSync(p) && fs.readFileSync(p, 'utf8') === txt) return `= ${rel}`;
    if (!DRY) { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, txt); }
    return `${DRY ? '~' : '+'} ${rel}`;
  };
  console.log('\n' + escribir(park.habitatsPath, JSON.stringify(geo) + '\n'));
  console.log(escribir(parkJsonPath, JSON.stringify(doc, null, 2) + '\n'));
  console.log(escribir(manifestPath, JSON.stringify(manifest, null, 2) + '\n'));

  console.log(`\n${habitats.length} hábitats · ${nuevos.length} nuevos · ${actualizados.length} refrescados desde la fuente`);
  nuevos.forEach(n => console.log(`   nuevo: ${n}`));
  if (DRY) console.log('\nSimulación: no se ha tocado nada.');
}

main();
