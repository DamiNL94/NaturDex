#!/usr/bin/env node
'use strict';
/*
 * adopt-habitats.js — adopta el <slug>-merged.geojson como la capa REAL del parque.
 *
 *   node Tools/catalogo-nacional/adopt-habitats.js --park <slug> [--dry] [--sql] [--merged <ruta>]
 *
 * Es el paso §8.3 de la deuda técnica del rollout: hasta ahora `merge-habitats.js` dejaba su
 * resultado en `out/` para revisión manual y nadie lo llevaba a `Frontend/`. Esto lo cierra:
 *
 *   1. Escribe Frontend/Data/parks/<prov>/<slug>/geo/habitats.geojson desde el merged.
 *   2. Sincroniza el array `habitats` de park.json: CONSERVA los campos curados a mano
 *      (description, coordinates, color, image, audio, speciesIds, reviewNote) y actualiza desde la
 *      fuente oficial los que son dato (code, name, type, priority, hicSubtipos, fitosociologia).
 *      Los hábitats nuevos entran con la descripción oficial del Atlas y su centroide calculado.
 *   3. Recalcula los contadores del manifiesto y, si algo del paquete cambió —el `park.json` O el
 *      geojson—, sube su `version`, por `escribeEspacio()`. Hasta el 2026-09-21 escribía los tres
 *      ficheros con su propio `writeFileSync` y no la subía nunca: un recinto redibujado no llegaba al
 *      dispositivo que ya tenía el espacio guardado sin conexión.
 *   4. Con `--sql`, regenera `Database/<slug>-n2.sql` (`build-park-sql.js`). Es la deuda nº 3: esto
 *      escribía solo en `Frontend/`, y como la API manda sobre el paquete, el cambio no lo veía nadie
 *      hasta que alguien se acordaba de pasar `park:sql`. Se regenera el n2 entero y no un fichero de
 *      hábitats aparte porque el n2 es el ESPEJO del `park.json` —el que aplica la cola— y uno
 *      parcial dejaría el n2 versionado por detrás de su paquete (§2 del CLAUDE.md). Regenerarlo es
 *      seguro: se lee del `park.json` ya escrito, no de la selección (que es la trampa nº 6). Y como
 *      es UPSERT, un recinto que salga del paquete NO se borra de la base — esta herramienta no retira
 *      ninguno (los huérfanos se conservan), así que hoy no hace falta borrado.
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
const { ROOT: RAIZ, FRONTEND, escribeEspacio } = require('../lib/io');
const { escribeN2 } = require('./build-park-sql');

const DRY = flag('dry');
const SQL = flag('sql');
const PARK = arg('park');
requireArgs('Uso: --park <slug> [--dry] [--sql] [--merged <ruta>]', { park: PARK });

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
  // Ojo: con una sola pieza, `mayor` ES `polys[0]`, así que volver a llamar aquí sería recursión
  // infinita. Pasa de verdad —un hábitat de ribera es una banda sinuosa cuyo centroide de área cae
  // fuera de su propio polígono—, así que ese caso se resuelve con un punto interior garantizado.
  if (polys.length > 1) {
    const c2 = centroide([mayor]);
    if (c2) return c2;
  }
  return puntoInterior(mayor) || c;
}

// Punto garantizado DENTRO del polígono, con sus huecos: se traza una horizontal a media altura y
// se toma el centro del tramo interior más ancho. Es el criterio de `ST_PointOnSurface` de PostGIS.
function puntoInterior(poly) {
  const ys = poly[0].map(p => p[1]);
  const y = (Math.min(...ys) + Math.max(...ys)) / 2;
  const cortes = [];
  for (const anillo of poly) {
    for (let i = 0, j = anillo.length - 1; i < anillo.length; j = i++) {
      const [x1, y1] = anillo[j], [x2, y2] = anillo[i];
      if ((y1 > y) === (y2 > y)) continue;   // el segmento no cruza la horizontal
      cortes.push(x1 + ((y - y1) / (y2 - y1)) * (x2 - x1));
    }
  }
  cortes.sort((a, b) => a - b);
  let centro = null, ancho = -1;
  for (let i = 0; i + 1 < cortes.length; i += 2) {
    const d = cortes[i + 1] - cortes[i];
    if (d > ancho) { ancho = d; centro = (cortes[i] + cortes[i + 1]) / 2; }
  }
  return centro === null ? null : [centro, y];
}

// Paleta de la app: color estable derivado del código HIC, para que un mismo hábitat salga igual en
// todos los parques. No es dato, es presentación.
const PALETA = ['#8b5e34', '#4f7942', '#a0522d', '#556b2f', '#6b8e23', '#8fbc8f', '#b8860b', '#2e8b57', '#9acd32', '#cd853f', '#66cdaa', '#daa520'];
const colorDe = code => PALETA[[...String(code)].reduce((s, c) => s + c.charCodeAt(0), 0) % PALETA.length];

function main() {
  const park = resolvePark(RAIZ, PARK);
  // `arg`, no `flag`: con `flag` la ruta que se pasaba era el booleano `true` y la opción documentada
  // no había funcionado nunca.
  const mergedPath = arg('merged') || path.join(__dirname, 'out', `${PARK}-merged.geojson`);
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
  const geoRel = path.relative(FRONTEND, park.habitatsPath).split(path.sep).join('/');
  const manifestPath = path.join(path.dirname(park.geoDir), 'manifest.json');

  // El geojson no es un `park.json` y se escribe aquí; el `park.json` y el manifiesto, juntos, por
  // `escribeEspacio()` —con el cambio del geojson dicho—, que es la única puerta que sube la versión.
  const geoTxt = JSON.stringify(geo) + '\n';
  const geoCambia = !fs.existsSync(park.habitatsPath) || fs.readFileSync(park.habitatsPath, 'utf8') !== geoTxt;
  if (geoCambia && !DRY) {
    fs.mkdirSync(path.dirname(park.habitatsPath), { recursive: true });
    fs.writeFileSync(park.habitatsPath, geoTxt);
  }
  console.log(`\n${!geoCambia ? '=' : DRY ? '~' : '+'} ${path.relative(RAIZ, park.habitatsPath)}`);
  const { lineas } = escribeEspacio({
    file: parkJsonPath, manifestFile: manifestPath, doc, write: !DRY,
    otrosCambios: geoCambia, geo: { habitats: geoRel },
    counts: {
      habitats: habitats.length,
      species: (doc.species || []).length,
      pointsOfInterest: (doc.pointsOfInterest || []).length,
    },
  });
  lineas.forEach(l => console.log(l));

  // 4) El SQL -----------------------------------------------------------------------------------------
  // En seco no se escribe: el n2 se redacta leyendo el `park.json` del disco, que en seco no ha cambiado.
  if (SQL && !DRY) console.log(escribeN2(PARK).linea);

  console.log(`\n${habitats.length} hábitats · ${nuevos.length} nuevos · ${actualizados.length} refrescados desde la fuente`);
  nuevos.forEach(n => console.log(`   nuevo: ${n}`));
  if (DRY) console.log('\nSimulación: no se ha tocado nada.');
  else if (!SQL) {
    console.log('\nRecuerda: la API manda sobre el park.json empaquetado. Con backend desplegado, repite con');
    console.log('--sql (o pasa `npm run park:sql -- --park ' + PARK + '`) y aplica el -n2.sql a la base.');
  }
}

main();
