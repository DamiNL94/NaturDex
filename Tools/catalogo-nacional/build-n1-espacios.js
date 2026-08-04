#!/usr/bin/env node
'use strict';
/*
 * build-n1-espacios.js — genera las fichas base (nivel N1 del rollout nacional) de todos los
 * Espacios Naturales Protegidos de una comunidad autónoma, a partir de las capas oficiales del
 * Banco de Datos de la Naturaleza (MITECO).
 *
 *   node Tools/catalogo-nacional/build-n1-espacios.js --nuts2 62 [--dry] [--solo ES620013]
 *
 * Qué produce, por espacio, en Frontend/Data/parks/<provincia>/<slug>/:
 *   geo/parque.geojson  límite oficial del ENP, reproyectado a WGS84 y generalizado
 *   geo/lic.geojson     sitios LIC/ZEC de la Red Natura 2000 que solapan (si los hay)
 *   geo/zepa.geojson    sitios ZEPA que solapan (si los hay)
 *   park.json           solo el bloque `park`; habitats/species/pointsOfInterest vacíos
 *   manifest.json       contadores a cero, sin bloque `tiles` (los pmtiles se generan aparte)
 * y la entrada correspondiente en Frontend/Data/parks-index.json con status "basic".
 *
 * Es IDEMPOTENTE: reejecutarlo con la misma entrada no cambia ni un byte. Todas las decisiones que
 * podrían depender del orden o del azar (tolerancia de generalización, orden de los sitios Natura
 * 2000, orden de las entradas del registro) están fijadas de forma determinista.
 *
 * Fuente: «© Ministerio para la Transición Ecológica y el Reto Demográfico».
 *
 * --- Las cuatro decisiones no obvias -----------------------------------------------------------
 *
 * 1. HAY QUE REPROYECTAR. Pese a que la especificación GeoJSON exige WGS84, el MITECO publica sus
 *    capas PROYECTADAS en UTM y lo declara en el miembro `crs` (EPSG:25830 para península y
 *    Baleares, EPSG:32628 para Canarias). Sin `utmToLonLat()` las coordenadas salen en metros y el
 *    mapa dibuja el parque en mitad del Atlántico. El validador tiene una comprobación específica
 *    para cazar justo este error (vértices fuera de la caja de España).
 *
 * 2. HAY QUE LEER POR STREAMING. `Enp2025_p.json` pesa 190 MB y el de Red Natura 620 MB, ambos en
 *    UNA sola línea: un `JSON.parse` revienta el heap de Node. Se recorren troceando el array
 *    `features` a mano, equilibrando llaves y respetando cadenas y escapes.
 *
 * 3. SE GENERALIZA EN UTM, NO EN GRADOS. Douglas-Peucker necesita una tolerancia con significado;
 *    en grados no lo tiene (un grado de longitud mide ~88 km aquí y uno de latitud ~111 km, así que
 *    la misma tolerancia deforma más en un eje que en otro). Se simplifica sobre las coordenadas
 *    nativas en metros y sólo después se reproyecta. La tolerancia no es fija: se prueba una
 *    escalera de valores y se coge la MENOR que deja el fichero por debajo del presupuesto de peso.
 *    Determinista, así que idempotente.
 *
 * 4. EL SOLAPE CON RED NATURA SE MIDE, NO SE SUPONE. Filtrar por caja envolvente daría falsos
 *    positivos (una ZEPA marina grande puede envolver un monumento natural de tierra adentro sin
 *    tocarlo). Se usa la caja sólo como prefiltro barato y después se calcula la intersección real
 *    con polygon-clipping, exigiendo un mínimo de superficie para descartar las astillas que deja
 *    la generalización.
 */
const fs = require('fs');
const path = require('path');
const pc = require('polygon-clipping');
const { utmToLonLat } = require('../lib/shapefile');
const { ringArea, closeRing, orientRing, inRing } = require('../lib/geo');

const { ROOT: RAIZ } = require('../lib/io');
const FRONTEND = path.join(RAIZ, 'Frontend');
const FUENTES = path.join(__dirname, 'fuentes', 'miteco-ide');
const REGISTRO = path.join(FRONTEND, 'Data', 'parks-index.json');

// --- Configuración por comunidad autónoma -------------------------------------------------------
// La capa ENP trae la comunidad en `NUT2` (código NUTS2 numérico) pero NO trae ni provincia ni
// municipios, así que ambas cosas van aquí o en el fichero de municipios. Para dar de alta otra
// comunidad basta añadir su entrada; las multiprovinciales necesitarán además resolver la provincia
// de cada espacio (hoy el script se planta si `provinciaSlug` no está definido).
const COMUNIDADES = {
  62: {
    region: 'Región de Murcia',
    regionEn: 'la Región de Murcia',   // la misma con artículo, para que las frases suenen a español
    comunidadSlug: 'region-de-murcia',
    provinciaSlug: 'murcia',
    provinciaNombre: 'Murcia',
    huso: 30,                       // ETRS89 / UTM 30N — EPSG:25830
    enp: 'Enp2025_geojson/Enp2025_p.json',
    n2000: 'n2000_2025_GeoJson/n2000_spatial_es_pibal_proy_end25.geojson',
    municipios: 'data/murcia-enp-municipios.json',
    // Espacios que ya están en NaturDex con geometría propia verificada: no se tocan.
    yaCargados: { ES620007: 'cabo-cope-puntas-calnegre', ES620004: 'cuatro-calas' },
    // Espacios que NO se dan de alta, con el motivo. Si existen en disco de una ejecución anterior,
    // el script los retira (sólo si siguen siendo fichas base vacías: ver `retirarFicha`).
    excluidos: {
      ES620023: 'territorio marino: 39,5 ha de islotes repartidos por 100 km de costa, sin acceso a pie',
      ES620021: 'Monumento Natural geológico fuera de todo territorio protegido (a 440 m de Sierra de las Moreras). Anotado como POI pendiente de `sierra-de-las-moreras`',
      ES620024: 'Monumento Natural geológico (cueva kárstica) fuera de todo territorio protegido, a 3,5 km de Sierra Espuña',
      ES620025: 'Monumento Natural geológico (estrato del límite K/Pg) fuera de todo territorio protegido, a 18,5 km del ENP más cercano'
    },
    // Sitios Natura 2000 marinos de competencia autonómica: el criterio general de abajo (AC) sólo
    // delata los de competencia estatal, así que los regionales hay que enumerarlos.
    marinosRegionales: ['ES6200029']   // Franja Litoral Sumergida de la Región de Murcia
  }
};

// Criterio nacional para descartar sitios marinos de la Red Natura 2000: la app no es útil en el
// mar, así que un espacio sumergido no aporta nada al mapa de un parque. La capa del MITECO NO trae
// el porcentaje marino de cada sitio, pero sí la administración competente, y **los 96 sitios de
// competencia estatal (`DGBBD`) de la capa nacional son marinos sin excepción** — comprobado uno a
// uno sobre los 1.865 sitios. El nombre NO sirve de criterio: sólo 63 de esos 96 llevan una palabra
// marina («Sebadales de…», «Bahía de…», «Canal de…», «El Cachucho» son marinos y no la llevan).
const AC_MARINA = new Set(['DGBBD']);

const FECHA_CAPA = 'diciembre de 2025';
const ATRIBUCION = 'Fuente: «© Ministerio para la Transición Ecológica y el Reto Demográfico».';
// Presupuesto de peso por fichero geográfico. Un móvil en 4G se descarga esto por cada espacio que
// abre, así que la generalización sube hasta que quepa.
const PRESUPUESTO_BYTES = 300 * 1024;
// Escalera de tolerancias Douglas-Peucker, en metros sobre las coordenadas UTM originales.
const TOLERANCIAS = [1, 2, 5, 10, 20, 50, 100];
// Superficie mínima de intersección para considerar que un sitio Natura 2000 solapa de verdad con
// el espacio: por debajo de 0,1 ha es una astilla de la generalización, no un solape.
const SOLAPE_MINIMO_M2 = 1000;

// --- Argumentos ---------------------------------------------------------------------------------
const args = process.argv.slice(2);
const opt = (n, def) => { const i = args.indexOf(n); return i === -1 ? def : args[i + 1]; };
const DRY = args.includes('--dry');
const NUTS2 = Number(opt('--nuts2', '62'));
const SOLO = opt('--solo', null);

const cfg = COMUNIDADES[NUTS2];
if (!cfg) {
  console.error(`No hay configuración para NUTS2=${NUTS2}. Comunidades disponibles: ${Object.keys(COMUNIDADES).join(', ')}`);
  process.exit(2);
}

// --- Utilidades de texto ------------------------------------------------------------------------
const SIN_TILDES = { á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', ü: 'u', ñ: 'n', à: 'a', è: 'e', ì: 'i', ò: 'o', ù: 'u', ç: 'c' };

// Slug estable y para siempre (es una clave). Regla: minúsculas sin tildes, separadas por guiones.
// Sólo si el resultado pasa de 40 caracteres se descartan los conectores (y, e, de, del, la…), que
// es la convención con la que ya se nombró `cabo-cope-puntas-calnegre` ("Cabo Cope y Puntas de
// Calnegre"). Los slugs de los espacios ya cargados son anteriores a esta regla y no se recalculan.
const CONECTORES = new Set(['y', 'e', 'de', 'del', 'la', 'las', 'los', 'el', 'a', 'en']);
function slugificar(nombre) {
  const palabras = nombre.toLowerCase()
    .replace(/[áéíóúüñàèìòùç]/g, c => SIN_TILDES[c])
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/[\s-]+/).filter(Boolean);
  const completo = palabras.join('-');
  if (completo.length <= 40) return completo;
  return palabras.filter(p => !CONECTORES.has(p)).join('-');
}

// El INE (y de ahí el CNIG) lista los municipios con el artículo pospuesto: "Unión, La". En una
// ficha eso se lee como un error tipográfico, así que se devuelve al orden natural.
function municipioLegible(m) {
  const p = m.match(/^(.+),\s*(El|La|Los|Las|L'|Els|Les)$/);
  return p ? `${p[2]} ${p[1]}` : m;
}

const numeroEs = (n, dec = 1) => n.toLocaleString('es-ES', { minimumFractionDigits: dec, maximumFractionDigits: dec });

function frasedeLista(items, union = 'y') {
  if (items.length === 1) return items[0];
  return items.slice(0, -1).join(', ') + ` ${union} ` + items[items.length - 1];
}

// --- Lectura por streaming del array `features` -------------------------------------------------
// Devuelve el índice justo tras la llave que cierra el objeto que empieza en `i`. Tiene en cuenta
// cadenas y escapes para no cortar por una llave que esté dentro de un valor de texto. -1 si el
// objeto todavía está incompleto (se completará con el siguiente trozo del flujo).
function finObjeto(s, i) {
  let prof = 0, enCadena = false, escape = false;
  for (; i < s.length; i++) {
    const c = s[i];
    if (escape) { escape = false; continue; }
    if (c === '\\') { escape = true; continue; }
    if (c === '"') { enCadena = !enCadena; continue; }
    if (enCadena) continue;
    if (c === '{') prof++;
    else if (c === '}') { prof--; if (prof === 0) return i + 1; }
  }
  return -1;
}

// Recorre el fichero y llama a `alFeature(textoDelFeature)` con el JSON en crudo de cada uno. No
// parsea nada: quien recibe decide si le compensa parsear ese feature o descartarlo por su caja.
function recorrerFeatures(fichero, alFeature) {
  return new Promise((resolve, reject) => {
    let buf = '', dentro = false;
    const flujo = fs.createReadStream(fichero, { encoding: 'utf8', highWaterMark: 1 << 22 });
    flujo.on('data', trozo => {
      buf += trozo;
      if (!dentro) {
        const k = buf.indexOf('"features"');
        if (k === -1) { if (buf.length > 1 << 20) buf = buf.slice(-4096); return; }
        const c = buf.indexOf('[', k);
        if (c === -1) return;
        buf = buf.slice(c + 1);
        dentro = true;
      }
      let pos = 0;
      for (;;) {
        while (pos < buf.length && ' \t\r\n,'.includes(buf[pos])) pos++;
        if (pos >= buf.length || buf[pos] !== '{') break;
        const fin = finObjeto(buf, pos);
        if (fin === -1) break;               // feature partido entre trozos: se completa en el siguiente
        alFeature(buf.slice(pos, fin));
        pos = fin;
      }
      buf = buf.slice(pos);
    });
    flujo.on('end', resolve);
    flujo.on('error', reject);
  });
}

// Extrae y parsea SOLO el objeto `properties` de un feature en crudo (es pequeño; el caro es el de
// geometría). Sirve para descartar por atributo antes de tocar las coordenadas.
function propiedadesDe(textoFeature) {
  const k = textoFeature.indexOf('"properties"');
  if (k === -1) return null;
  const llave = textoFeature.indexOf('{', k);
  if (llave === -1) return null;
  const fin = finObjeto(textoFeature, llave);
  if (fin === -1) return null;
  try { return JSON.parse(textoFeature.slice(llave, fin)); } catch { return null; }
}

// Caja envolvente leyendo los números del bloque `coordinates` en crudo, sin construir arrays. Es
// el prefiltro que hace viable recorrer los 620 MB de Red Natura: las coordenadas son siempre pares
// [x, y] (ninguna de estas capas trae Z), así que basta alternar.
function cajaEnCrudo(textoFeature) {
  const k = textoFeature.indexOf('"coordinates"');
  if (k === -1) return null;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  let i = k + 13, par = 0;
  const n = textoFeature.length;
  while (i < n) {
    const c = textoFeature.charCodeAt(i);
    if (c === 45 || c === 46 || (c >= 48 && c <= 57)) {           // '-', '.', dígito
      let j = i + 1;
      while (j < n) {
        const d = textoFeature.charCodeAt(j);
        if (d === 46 || d === 45 || d === 43 || d === 101 || d === 69 || (d >= 48 && d <= 57)) j++;
        else break;
      }
      const v = +textoFeature.slice(i, j);
      if (par === 0) { if (v < minX) minX = v; if (v > maxX) maxX = v; par = 1; }
      else { if (v < minY) minY = v; if (v > maxY) maxY = v; par = 0; }
      i = j;
    } else i++;
  }
  return minX === Infinity ? null : [minX, minY, maxX, maxY];
}

const cajasSolapan = (a, b) => !(a[2] < b[0] || b[2] < a[0] || a[3] < b[1] || b[3] < a[1]);

// --- Geometría ----------------------------------------------------------------------------------
// Normaliza Polygon y MultiPolygon a una lista de polígonos [ [anilloExterior, agujero...], ... ].
function aPoligonos(geom) {
  if (!geom) return [];
  if (geom.type === 'Polygon') return [geom.coordinates];
  if (geom.type === 'MultiPolygon') return geom.coordinates;
  return [];
}

function deMultiPoligono(polys) {
  if (!polys.length) return null;
  return polys.length === 1
    ? { type: 'Polygon', coordinates: polys[0] }
    : { type: 'MultiPolygon', coordinates: polys };
}

// Douglas-Peucker. Con un anillo cerrado el primer y el último punto coinciden, así que la cuerda
// de referencia tiene longitud cero: la distancia se mide entonces radialmente desde ese punto, que
// es exactamente lo que hace falta para que la primera partición del anillo sea la correcta.
function douglasPeucker(pts, tol) {
  if (pts.length <= 3) return pts.slice();
  const conservar = new Uint8Array(pts.length);
  conservar[0] = conservar[pts.length - 1] = 1;
  const pila = [[0, pts.length - 1]];
  while (pila.length) {
    const [i0, i1] = pila.pop();
    if (i1 - i0 < 2) continue;
    const [x0, y0] = pts[i0], [x1, y1] = pts[i1];
    const dx = x1 - x0, dy = y1 - y0, len2 = dx * dx + dy * dy;
    let maxD = -1, idx = -1;
    for (let i = i0 + 1; i < i1; i++) {
      const [x, y] = pts[i];
      let d;
      if (len2 === 0) d = Math.hypot(x - x0, y - y0);
      else {
        let t = ((x - x0) * dx + (y - y0) * dy) / len2;
        if (t < 0) t = 0; else if (t > 1) t = 1;
        d = Math.hypot(x - (x0 + t * dx), y - (y0 + t * dy));
      }
      if (d > maxD) { maxD = d; idx = i; }
    }
    if (maxD > tol) { conservar[idx] = 1; pila.push([i0, idx], [idx, i1]); }
  }
  const out = [];
  for (let i = 0; i < pts.length; i++) if (conservar[i]) out.push(pts[i]);
  return out;
}

// Generaliza en UTM. Si un anillo se derrumbaría por debajo de un triángulo (islotes diminutos), se
// conserva sin simplificar: pesa cuatro coordenadas y perderlo sería perder geometría oficial.
function simplificarPoligonos(polys, tol) {
  if (tol <= 0) return polys;
  return polys.map(poly => poly.map(anillo => {
    const s = closeRing(douglasPeucker(anillo, tol));
    return s.length >= 4 ? s : anillo;
  }));
}

function reproyectarPoligonos(polys, huso) {
  return polys.map(poly => poly.map(anillo => anillo.map(([x, y]) => utmToLonLat(x, y, huso))));
}

// Redondea a `dec` decimales (5 ≈ 1 m) y quita puntos consecutivos repetidos: es lo que de verdad
// recorta el peso del fichero, más aún que Douglas-Peucker. Si un anillo se derrumba al redondear
// —posible en islotes de pocos metros— se reintenta con más precisión antes que perderlo.
function redondearPoligonos(polys, dec, avisos) {
  const salida = [];
  polys.forEach((poly, ip) => {
    const anillos = [];
    poly.forEach((anillo, ia) => {
      let r = null;
      for (const d of [dec, dec + 1, dec + 2]) {
        const f = Math.pow(10, d);
        const pts = [];
        for (const [lng, lat] of anillo) {
          const p = [Math.round(lng * f) / f, Math.round(lat * f) / f];
          const u = pts[pts.length - 1];
          if (!u || u[0] !== p[0] || u[1] !== p[1]) pts.push(p);
        }
        const cerrado = closeRing(pts);
        if (cerrado.length >= 4) { r = cerrado; break; }
      }
      if (r) anillos.push(r);
      else avisos.push(`anillo ${ip}.${ia} descartado: se derrumba incluso a 7 decimales`);
    });
    if (anillos.length) salida.push(anillos);
  });
  return salida;
}

// GeoJSON exige exterior antihorario y agujeros horarios (RFC 7946 §3.1.6). Las capas del MITECO
// vienen del mundo shapefile, donde la convención es la contraria.
function orientarGeoJson(polys) {
  return polys.map(poly => poly.map((anillo, i) => orientRing(anillo, i === 0)));
}

// Área en m² sobre coordenadas UTM (que ya están en metros): exterior menos agujeros.
function areaM2(polys) {
  let a = 0;
  for (const poly of polys) {
    a += ringArea(poly[0]);
    for (let i = 1; i < poly.length; i++) a -= ringArea(poly[i]);
  }
  return a;
}

// Centroide de área (media ponderada de los centroides de cada anillo exterior). En figuras muy
// cóncavas o troceadas puede caer fuera del polígono, así que después se comprueba y, si hace falta,
// se sustituye por un punto interior de verdad: el validador y el mapa esperan que el centro esté
// dentro del espacio.
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
  return sa ? [sx / sa, sy / sa] : null;
}

function dentroDe(pt, polys) {
  for (const poly of polys) {
    if (!inRing(pt[0], pt[1], poly[0])) continue;
    let enAgujero = false;
    for (let i = 1; i < poly.length; i++) if (inRing(pt[0], pt[1], poly[i])) { enAgujero = true; break; }
    if (!enAgujero) return true;
  }
  return false;
}

// Punto interior garantizado, el más cercano al centroide: rejilla determinista de 64×64 sobre la
// caja del polígono mayor. Sólo se usa cuando el centroide de área cae fuera.
function puntoInterior(polys, cerca) {
  const mayor = polys.reduce((m, p) => (ringArea(p[0]) > ringArea(m[0]) ? p : m), polys[0]);
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [x, y] of mayor[0]) { if (x < minX) minX = x; if (y < minY) minY = y; if (x > maxX) maxX = x; if (y > maxY) maxY = y; }
  let mejor = null, mejorD = Infinity;
  for (let i = 1; i < 64; i++) for (let j = 1; j < 64; j++) {
    const p = [minX + (maxX - minX) * i / 64, minY + (maxY - minY) * j / 64];
    if (!dentroDe(p, [mayor])) continue;
    const d = cerca ? Math.hypot(p[0] - cerca[0], p[1] - cerca[1]) : 0;
    if (d < mejorD) { mejorD = d; mejor = p; }
  }
  return mejor;
}

// Superficie de la intersección real entre dos geometrías (en las unidades de entrada, aquí UTM).
// polygon-clipping puede protestar con anillos degenerados; si lo hace, se informa y se cuenta como
// "no solapa" en vez de tragarse el error en silencio.
function areaInterseccionM2(polysA, polysB, avisos, etiqueta) {
  try {
    const r = pc.intersection(polysA, polysB);
    return r && r.length ? areaM2(r) : 0;
  } catch (e) {
    avisos.push(`intersección fallida con ${etiqueta}: ${e.message}`);
    return 0;
  }
}

// --- Serialización --------------------------------------------------------------------------------
// Una línea por feature: legible en un diff sin inflar el fichero como haría un stringify indentado.
function serializarFeatureCollection(features) {
  return '{"type":"FeatureCollection","features":[\n' +
    features.map(f => JSON.stringify(f)).join(',\n') + '\n]}\n';
}

// Retira una ficha base que ya no debe existir. Sólo borra si sigue siendo lo que este script
// genera —una ficha N1 vacía—: si alguien le ha añadido especies, hábitats o POIs, se niega y avisa,
// porque entonces ya no es un fichero desechable.
let retirados = 0;
function retirarFicha(dir, slug) {
  if (!fs.existsSync(dir)) return null;
  const parkPath = path.join(dir, 'park.json');
  if (fs.existsSync(parkPath)) {
    let p;
    try { p = JSON.parse(fs.readFileSync(parkPath, 'utf8')); } catch { p = null; }
    const conContenido = p && ((p.habitats || []).length || (p.species || []).length || (p.pointsOfInterest || []).length);
    if (conContenido) return `! ${slug}: NO se retira, la ficha ya tiene contenido propio (revísala a mano)`;
  }
  if (!DRY) fs.rmSync(dir, { recursive: true, force: true });
  retirados++;
  return `${DRY ? '~' : '-'} ${path.relative(RAIZ, dir)} (retirado)`;
}

let escritos = 0, sinCambios = 0;
function escribir(abs, contenido) {
  const rel = path.relative(RAIZ, abs);
  if (fs.existsSync(abs) && fs.readFileSync(abs, 'utf8') === contenido) { sinCambios++; return `= ${rel}`; }
  if (!DRY) {
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, contenido);
  }
  escritos++;
  return `${DRY ? '~' : '+'} ${rel} (${(Buffer.byteLength(contenido) / 1024).toFixed(1)} KB)`;
}

// --- Construcción del fichero publicable ----------------------------------------------------------
// Construye una FeatureCollection entera con una tolerancia dada: simplifica en UTM, reproyecta,
// redondea, orienta y serializa.
function construirColeccion(items, huso, tol, hacerFeature, avisos) {
  const partes = items.map(it => {
    const simplificado = simplificarPoligonos(it.polysUtm, tol);
    const wgs = orientarGeoJson(redondearPoligonos(reproyectarPoligonos(simplificado, huso), 5, avisos));
    return { polysUtm: simplificado, polysWgs: wgs, geom: deMultiPoligono(wgs) };
  });
  if (partes.some(p => !p.geom)) return null;
  const features = partes.map((p, i) => hacerFeature(items[i], p.geom));
  const texto = serializarFeatureCollection(features);
  return { partes, features, texto, tol, bytes: Buffer.byteLength(texto) };
}

// Elige la MENOR tolerancia de la escalera cuyo resultado cabe en el presupuesto. `construir(tol)`
// devuelve el conjunto de ficheros de esa tolerancia y `pesar` su tamaño total. La elección depende
// sólo de los datos, así que dos ejecuciones dan el mismo resultado (idempotencia).
function elegirTolerancia(construir, pesar, presupuesto, avisos, etiqueta) {
  let ultimo = null;
  for (const tol of TOLERANCIAS) {
    ultimo = construir(tol);
    if (pesar(ultimo) <= presupuesto) return { resultado: ultimo, tol };
  }
  avisos.push(`${etiqueta}: no cabe en ${(presupuesto / 1024).toFixed(0)} KB ni con la tolerancia máxima de ${TOLERANCIAS[TOLERANCIAS.length - 1]} m (${(pesar(ultimo) / 1024).toFixed(0)} KB)`);
  return { resultado: ultimo, tol: TOLERANCIAS[TOLERANCIAS.length - 1] };
}

// --- Programa ---------------------------------------------------------------------------------------
(async () => {
  const ficheroEnp = path.join(FUENTES, cfg.enp);
  const ficheroN2000 = path.join(FUENTES, cfg.n2000);
  for (const f of [ficheroEnp, ficheroN2000]) {
    if (!fs.existsSync(f)) { console.error(`No se encuentra la capa oficial: ${f}`); process.exit(2); }
  }

  const municipiosDoc = JSON.parse(fs.readFileSync(path.join(__dirname, cfg.municipios), 'utf8'));
  const porCodigo = new Map(municipiosDoc.espacios.map(e => [e.codigoENP, e]));

  console.log(`\nNaturDex · fichas base N1 — ${cfg.region} (NUTS2 ${NUTS2})${DRY ? '  [simulación]' : ''}`);
  console.log('─'.repeat(78));

  // 1) ENP de la comunidad -------------------------------------------------------------------------
  process.stdout.write('Leyendo la capa ENP… ');
  const enp = new Map();                       // codigoENP → { props, polysUtm }
  let totalEnp = 0;
  await recorrerFeatures(ficheroEnp, txt => {
    totalEnp++;
    const props = propiedadesDe(txt);
    if (!props || props.NUT2 !== NUTS2) return;
    let f;
    try { f = JSON.parse(txt); } catch { return; }
    const polys = aPoligonos(f.geometry);
    if (!polys.length) return;
    const cod = props.SITE_CODE_;
    // Un mismo código publicado en varios features (espacio en varias piezas) se funde en uno solo:
    // si no, `render.js` sumaría la superficie oficial una vez por pieza.
    if (enp.has(cod)) enp.get(cod).polysUtm.push(...polys);
    else enp.set(cod, { props, polysUtm: polys });
  });
  console.log(`${totalEnp.toLocaleString('es-ES')} features, ${enp.size} en ${cfg.region}`);

  // 2) Qué se procesa y qué se queda fuera ----------------------------------------------------------
  const objetivos = [], fuera = [], retirar = [];
  for (const [cod, e] of enp) {
    if (SOLO && cod !== SOLO) continue;
    if (cfg.yaCargados[cod]) { fuera.push({ cod, nombre: e.props.SITE_NAME, motivo: `ya en NaturDex como \`${cfg.yaCargados[cod]}\`` }); continue; }
    // Exclusiones de producto (marino / geológico fuera de territorio protegido): además de no
    // generarse, hay que deshacer lo que dejó una ejecución anterior.
    if (cfg.excluidos && cfg.excluidos[cod]) {
      const slug = slugificar(e.props.SITE_NAME);
      fuera.push({ cod, nombre: e.props.SITE_NAME, motivo: cfg.excluidos[cod] });
      retirar.push({ cod, slug, dir: path.join(FRONTEND, 'Data', 'parks', cfg.provinciaSlug, slug) });
      continue;
    }
    // Un límite ya refinado desde el IMIDA es MEJOR que el que produce este generador (la capa ENP
    // nacional viene generalizada). Regenerarlo lo empeoraría en silencio, así que ese espacio se
    // deja intacto. Marca inequívoca: `CodigoIMIDA` en las propiedades, que sólo escribe
    // refina-limites-imida.js. Para rehacerlo de cero, borrar su carpeta.
    const slugPrevio = slugificar(e.props.SITE_NAME);
    const geoPrevio = path.join(FRONTEND, 'Data', 'parks', cfg.provinciaSlug, slugPrevio, 'geo', 'parque.geojson');
    if (fs.existsSync(geoPrevio)) {
      try {
        const g = JSON.parse(fs.readFileSync(geoPrevio, 'utf8'));
        if (((g.features || [])[0] || {}).properties && g.features[0].properties.CodigoIMIDA) {
          fuera.push({ cod, nombre: e.props.SITE_NAME, motivo: `límite ya refinado desde el IMIDA (\`${slugPrevio}\`): no se regenera para no empeorarlo` });
          continue;
        }
      } catch { /* ilegible: que lo regenere */ }
    }

    const muni = porCodigo.get(cod);
    if (!muni) { fuera.push({ cod, nombre: e.props.SITE_NAME, motivo: 'sin entrada en el fichero de municipios' }); continue; }
    // validate-park-data.js exige `municipalities` no vacío: sin municipio la ficha no se sostiene,
    // y rellenarlo a ojo sería inventar. Se queda fuera y se dice.
    if (!muni.municipios || !muni.municipios.length) {
      fuera.push({ cod, nombre: e.props.SITE_NAME, motivo: 'sin municipios en fuente oficial: ' + (muni.nota || 'no consta') });
      continue;
    }
    objetivos.push({ cod, ...e, muni });
  }
  objetivos.sort((a, b) => b.props.Sup_ha - a.props.Sup_ha);
  console.log(`A generar: ${objetivos.length} espacio(s). Fuera del lote: ${fuera.length}.`);

  if (!objetivos.length) { console.log('Nada que hacer.'); process.exit(0); }

  // 3) Caja envolvente de cada objetivo (en UTM) para prefiltrar Red Natura -------------------------
  const cajas = objetivos.map(o => {
    let c = [Infinity, Infinity, -Infinity, -Infinity];
    for (const poly of o.polysUtm) for (const [x, y] of poly[0]) {
      if (x < c[0]) c[0] = x; if (y < c[1]) c[1] = y; if (x > c[2]) c[2] = x; if (y > c[3]) c[3] = y;
    }
    return c;
  });

  // 4) Red Natura 2000: candidatos por caja y solape medido ------------------------------------------
  process.stdout.write('Leyendo la capa Red Natura 2000 (620 MB, tarda)… ');
  const candidatos = [];
  let totalN2000 = 0;
  await recorrerFeatures(ficheroN2000, txt => {
    totalN2000++;
    const caja = cajaEnCrudo(txt);
    if (!caja || !cajas.some(c => cajasSolapan(c, caja))) return;
    let f;
    try { f = JSON.parse(txt); } catch { return; }
    const polys = aPoligonos(f.geometry);
    if (polys.length) candidatos.push({ props: f.properties, polysUtm: polys, caja });
  });
  console.log(`${totalN2000.toLocaleString('es-ES')} sitios, ${candidatos.length} candidatos por caja`);

  const avisosGlobales = [], descartes = [], marinosFuera = new Map();
  const esMarino = p => AC_MARINA.has(String(p.AC || '').trim()) ||
    (cfg.marinosRegionales || []).includes(p.site_code);

  const solapes = objetivos.map(() => ({ lic: [], zepa: [] }));
  candidatos.forEach(c => {
    const tipo = String(c.props.TIPO || '').toUpperCase();   // A = ZEPA · B = LIC/ZEC · C = ambas
    // La app no es útil en el mar: un sitio sumergido no aporta nada al mapa de un parque.
    if (esMarino(c.props)) {
      if (!marinosFuera.has(c.props.site_code))
        marinosFuera.set(c.props.site_code, `${c.props.site_code} «${c.props.SITE_NAME}» (${String(c.props.AC).trim()}, ${numeroEs(c.props.HECTAREAS)} ha)`);
      return;
    }
    objetivos.forEach((o, i) => {
      if (!cajasSolapan(cajas[i], c.caja)) return;
      const m2 = areaInterseccionM2(o.polysUtm, c.polysUtm, avisosGlobales, `${c.props.site_code} × ${o.cod}`);
      if (m2 <= 0) return;
      if (m2 < SOLAPE_MINIMO_M2) {
        // No se descarta en silencio: un solape residual puede ser una astilla de la generalización
        // o un espacio que sólo roza el límite. Queda dicho para poder revisarlo.
        descartes.push(`${o.cod} × ${c.props.site_code} (${c.props.SITE_NAME}): solape de ${(m2 / 10000).toFixed(3)} ha, por debajo del mínimo de ${(SOLAPE_MINIMO_M2 / 10000).toFixed(1)} ha`);
        return;
      }
      const conArea = Object.assign({ solapeHa: m2 / 10000 }, c);
      if (tipo === 'A' || tipo === 'C') solapes[i].zepa.push(conArea);
      if (tipo === 'B' || tipo === 'C') solapes[i].lic.push(conArea);
    });
  });
  // Orden estable por código: el fichero no puede depender del orden de lectura.
  solapes.forEach(s => { s.lic.sort((a, b) => a.props.site_code.localeCompare(b.props.site_code)); s.zepa.sort((a, b) => a.props.site_code.localeCompare(b.props.site_code)); });

  // 5) Generación por espacio -------------------------------------------------------------------------
  const nuevasEntradas = [], informe = [];
  objetivos.forEach((o, i) => {
    const avisos = [];
    const nombre = o.props.SITE_NAME;                 // literal de la capa oficial
    const figura = o.props.ODESIGNATE;                // literal de la capa oficial
    const slug = slugificar(nombre);
    const supOficial = o.props.Sup_ha;
    const cdda = String(o.props.SITE_CDDA || '').replace(/_CDDA$/, '');
    const dir = path.join(FRONTEND, 'Data', 'parks', cfg.provinciaSlug, slug);
    const relBase = `Data/parks/${cfg.provinciaSlug}/${slug}`;

    // -- límite del espacio. Es lo único que una ficha base promete, así que se lleva el presupuesto
    // entero y se queda con la tolerancia más fina que quepa; lo que sobre es para las capas Natura.
    const hacerFeatureParque = (_it, geom) => ({
      type: 'Feature',
      // Nombres de propiedad exigidos por Frontend/Js/map.js (popup del límite) y render.js
      // (superficie de la ficha base): `nombre`, `Figura`, `Hectareas`. No renombrar.
      properties: {
        nombre, Figura: figura, CodigoENP: o.cod, CDDA: cdda, Hectareas: supOficial,
        fuente: `Capa ENP del Banco de Datos de la Naturaleza (MITECO, ${FECHA_CAPA}), EPSG:25830 reproyectado a WGS84`
      },
      geometry: geom
    });
    const parque = elegirTolerancia(
      tol => construirColeccion([o], cfg.huso, tol, hacerFeatureParque, avisos),
      r => r.bytes, PRESUPUESTO_BYTES, avisos, 'parque.geojson').resultado;
    const parte = parque.partes[0];
    const supGeneralizada = areaM2(parte.polysUtm) / 10000;
    const desvio = Math.abs(supGeneralizada - supOficial) / supOficial * 100;
    if (desvio > 1) avisos.push(`la generalización a ${parque.tol} m desvía la superficie un ${numeroEs(desvio, 2)} %`);

    // -- centro: centroide de área y, si cae fuera, punto interior
    let centro = centroide(parte.polysWgs);
    if (!centro || !dentroDe(centro, parte.polysWgs)) {
      const alt = puntoInterior(parte.polysWgs, centro);
      if (alt) { avisos.push('el centroide de área caía fuera del polígono: se usa un punto interior'); centro = alt; }
      else avisos.push('no se ha podido situar un punto interior; se conserva el centroide de área');
    }
    const center = [+centro[1].toFixed(5), +centro[0].toFixed(5)];   // [lat, lng]

    // -- capas Red Natura 2000
    const geoRel = { parque: `${relBase}/geo/parque.geojson` };
    const ficheros = [escribir(path.join(dir, 'geo', 'parque.geojson'), parque.texto)];

    // Las dos capas Natura comparten tolerancia y lo que queda del presupuesto del espacio: un
    // lic.geojson con tres sitios grandes es peso que se descarga el móvil igual que el límite.
    const capas = [
      ['lic', solapes[i].lic, c => ({ SITE_CODE: c.props.site_code, SITE_NAME: c.props.SITE_NAME, HECTARES: c.props.HECTAREAS, FIGURA: 'LIC' })],
      ['zepa', solapes[i].zepa, c => ({ site_code: c.props.site_code, site_name: c.props.SITE_NAME, hectares: c.props.HECTAREAS, Leyenda: 'ZEPA' })]
    ].filter(([, lista]) => lista.length);   // el validador acepta que falte la clave: no se declara

    let tolNatura = null, bytesGeo = parque.bytes;
    if (capas.length) {
      const elegida = elegirTolerancia(
        tol => capas.map(([, lista, propsDe]) =>
          construirColeccion(lista, cfg.huso, tol, (it, geom) => ({ type: 'Feature', properties: propsDe(it), geometry: geom }), avisos)),
        cols => cols.reduce((s, c) => s + c.bytes, 0),
        PRESUPUESTO_BYTES - parque.bytes, avisos, 'capas Natura 2000');
      tolNatura = elegida.tol;
      capas.forEach(([clave], k) => {
        geoRel[clave] = `${relBase}/geo/${clave}.geojson`;
        bytesGeo += elegida.resultado[k].bytes;
        ficheros.push(escribir(path.join(dir, 'geo', `${clave}.geojson`), elegida.resultado[k].texto));
      });
    }

    // -- textos: sólo dato verificable, sin adjetivos
    const municipios = o.muni.municipios.map(municipioLegible).sort((a, b) => a.localeCompare(b, 'es'));
    const fraseMuni = municipios.length === 1
      ? `el término municipal de ${municipios[0]}`
      : `los términos municipales de ${frasedeLista(municipios)}`;
    // Un sitio de TIPO C es LIC/ZEC y ZEPA a la vez, y aparece en las dos capas: se cita una sola
    // vez con las dos figuras en vez de repetir el mismo código dos veces.
    const enLic = new Set(solapes[i].lic.map(c => c.props.site_code));
    const enZepa = new Set(solapes[i].zepa.map(c => c.props.site_code));
    const unicos = solapes[i].lic.concat(solapes[i].zepa.filter(c => !enLic.has(c.props.site_code)))
      .sort((a, b) => a.props.site_code.localeCompare(b.props.site_code));
    const citas = unicos.map(c => {
      const cod = c.props.site_code;
      const etq = enLic.has(cod) && enZepa.has(cod) ? 'LIC/ZEC y ZEPA' : (enLic.has(cod) ? 'LIC/ZEC' : 'ZEPA');
      return `${etq} ${cod} «${c.props.SITE_NAME}»`;
    });
    const fraseNatura = citas.length
      ? `Solapa con ${citas.length === 1 ? 'el espacio' : 'los espacios'} de la Red Natura 2000 ${frasedeLista(citas)}.`
      : `Sin solape con la Red Natura 2000 en la capa oficial de ${FECHA_CAPA}.`;
    const summary = `${figura} de ${cfg.regionEn}, con una superficie oficial de ${numeroEs(supOficial)} ha en ${fraseMuni}. ${fraseNatura}`;

    let boundaryNote = `Límite oficial servido en geo/parque.geojson, recortado de la capa de Espacios Naturales Protegidos del Banco de Datos de la Naturaleza (MITECO, ${FECHA_CAPA}). Código ENP oficial ${o.cod}${cdda ? ` (CDDA ${cdda})` : ''}, superficie oficial ${numeroEs(supOficial)} ha. La capa se publica proyectada en ETRS89 UTM ${cfg.huso}N (EPSG:258${cfg.huso}): la geometría se ha reproyectado a WGS84 y generalizada con tolerancia de ${parque.tol} m para uso web (superficie resultante ${numeroEs(supGeneralizada)} ha, desviación del ${numeroEs(desvio, 2)} %).`;
    // La discrepancia entre fuentes es un dato, no un problema a ocultar: si la cartografía regional
    // da otra superficie para el mismo espacio, consta en la propia ficha.
    if (o.muni.supHaImida != null && o.muni.desvioPct >= 1) {
      boundaryNote += ` La cartografía del IMIDA/CARM da ${numeroEs(o.muni.supHaImida)} ha para este mismo espacio, un ${numeroEs(o.muni.desvioPct, 2)} % menos; se conserva la del MITECO por ser la fuente de la geometría aquí servida.`;
    }
    boundaryNote += ` Municipios obtenidos por intersección geométrica contra los límites municipales del CNIG servidos por el IMIDA/CARM (ver Tools/catalogo-nacional/data/${path.basename(cfg.municipios)}). ${ATRIBUCION}`;

    const park = {
      park: {
        slug, name: nombre, category: figura,
        region: cfg.region, province: cfg.provinciaNombre,
        municipalities: municipios,
        center,
        summary,
        boundaryNote
      },
      habitats: [],
      pointsOfInterest: [],
      species: []
    };
    ficheros.push(escribir(path.join(dir, 'park.json'), JSON.stringify(park, null, 2) + '\n'));

    const manifest = {
      slug, name: nombre, apiSlug: slug, version: 1, updatedAt: municipiosDoc.generado,
      data: `${relBase}/park.json`,
      geo: geoRel,
      images: [], audio: [],
      counts: { species: 0, habitats: 0, pointsOfInterest: 0, images: 0, assetBytes: 0 }
    };
    ficheros.push(escribir(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n'));

    nuevasEntradas.push({
      slug, name: nombre, category: figura, status: 'basic', center,
      path: relBase, manifest: `${relBase}/manifest.json`,
      _sup: supOficial
    });
    const todos = solapes[i].lic.concat(solapes[i].zepa.filter(z => !solapes[i].lic.includes(z)));
    informe.push({
      cod: o.cod, slug, nombre, figura, supOficial, tol: parque.tol, tolNatura, bytesGeo, desvio, municipios, center, ficheros, avisos,
      lic: solapes[i].lic.map(c => c.props.site_code),
      zepa: solapes[i].zepa.map(c => c.props.site_code),
      solapes: todos.map(c => `${c.props.site_code} ${numeroEs(c.solapeHa)} ha (${(c.solapeHa / supOficial * 100).toFixed(0)} % del espacio)`)
    });
  });

  // 6) Registro de parques ---------------------------------------------------------------------------
  const registro = JSON.parse(fs.readFileSync(REGISTRO, 'utf8'));
  const comunidad = registro.communities.find(c => c.slug === cfg.comunidadSlug);
  if (!comunidad) { console.error(`El registro no tiene la comunidad "${cfg.comunidadSlug}"; añádela a mano antes de seguir.`); process.exit(2); }
  const provincia = comunidad.provinces.find(p => p.slug === cfg.provinciaSlug);
  if (!provincia) { console.error(`El registro no tiene la provincia "${cfg.provinciaSlug}".`); process.exit(2); }

  const generados = new Set(nuevasEntradas.map(e => e.slug));
  const fueraDelRegistro = new Set(retirar.map(r => r.slug));
  const previos = provincia.parks.filter(p => !generados.has(p.slug) && !fueraDelRegistro.has(p.slug));
  provincia.parks = previos.concat(nuevasEntradas
    .sort((a, b) => b._sup - a._sup)                     // orden estable: por superficie, como el inventario
    .map(({ _sup, ...e }) => e));

  // Se respeta el estilo del fichero: 4 espacios de sangrado y los `center` en una sola línea.
  const registroTexto = JSON.stringify(registro, null, 4)
    .replace(/"center": \[\s*\n\s*([-\d.]+),\s*\n\s*([-\d.]+)\s*\n\s*\]/g, '"center": [$1, $2]') + '\n';
  const lineaRegistro = escribir(REGISTRO, registroTexto);

  // 7) Informe -----------------------------------------------------------------------------------------
  console.log('\n' + '─'.repeat(78));
  informe.forEach(r => {
    console.log(`\n▶ ${r.slug}  (${r.cod} · ${r.figura})`);
    console.log(`  ${r.nombre} — ${numeroEs(r.supOficial)} ha · ${r.municipios.join(', ')}`);
    console.log(`  centro [${r.center.join(', ')}] · límite generalizado a ${r.tol} m (desvío ${numeroEs(r.desvio, 2)} %)${r.tolNatura ? ` · capas Natura a ${r.tolNatura} m` : ''}`);
    console.log(`  peso de geo/: ${(r.bytesGeo / 1024).toFixed(1)} KB`);
    console.log(`  Natura 2000: LIC ${r.lic.join(', ') || '—'} · ZEPA ${r.zepa.join(', ') || '—'}`);
    if (r.solapes.length) console.log(`  solape medido: ${r.solapes.join(' · ')}`);
    r.ficheros.forEach(f => console.log(`    ${f}`));
    r.avisos.forEach(a => console.log(`    \x1b[33m⚠ ${a}\x1b[0m`));
  });
  console.log(`\n    ${lineaRegistro}`);

  if (retirar.length) {
    console.log('\nFichas retiradas (espacios excluidos que existían de una ejecución anterior):');
    retirar.forEach(r => {
      const linea = retirarFicha(r.dir, r.slug);
      console.log(`  ${linea || `= ${r.slug}: no existía en disco`}`);
    });
  }

  if (fuera.length) {
    console.log('\nFuera del lote:');
    fuera.forEach(f => console.log(`  · ${f.cod} ${f.nombre} — ${f.motivo}`));
  }
  if (marinosFuera.size) {
    console.log('\nSitios Natura 2000 marinos excluidos de las capas (la app no es útil en el mar):');
    [...marinosFuera.values()].sort().forEach(m => console.log(`  · ${m}`));
  }
  if (descartes.length) {
    console.log('\nSolapes por debajo del mínimo (no se declaran, quedan aquí para revisión):');
    descartes.sort().forEach(d => console.log(`  · ${d}`));
  }
  if (avisosGlobales.length) {
    console.log('\nAvisos de geometría:');
    avisosGlobales.forEach(a => console.log(`  ⚠ ${a}`));
  }
  console.log('\n' + '─'.repeat(78));
  console.log(`${informe.length} espacio(s) · ${escritos} fichero(s) ${DRY ? 'a escribir' : 'escritos'}, ${sinCambios} sin cambios` +
    (retirados ? `, ${retirados} ficha(s) ${DRY ? 'a retirar' : 'retirada(s)'}` : '') + '.');
  if (DRY) console.log('Simulación: no se ha tocado nada en disco.');
})().catch(e => { console.error(e); process.exit(1); });
