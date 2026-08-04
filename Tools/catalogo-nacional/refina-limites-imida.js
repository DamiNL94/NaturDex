#!/usr/bin/env node
'use strict';
/*
 * refina-limites-imida.js — sustituye los límites generalizados de la capa ENP nacional (MITECO)
 * por la delimitación detallada que sirve el IMIDA/CARM.
 *
 *   node Tools/catalogo-nacional/refina-limites-imida.js [--dry] [--solo <slug>]
 *
 * POR QUÉ. La capa ENP del Banco de Datos de la Naturaleza es un producto nacional GENERALIZADO.
 * El geoportal del IMIDA sirve la misma delimitación oficial con 2 a 15 veces más vértices
 * (Cabo Cope: 447 → 6.566). La superficie oficial la sigue mandando el MITECO; lo que cambia es el
 * DIBUJO. Ya constaba para `cuatro-calas` («se conserva la del IMIDA por ser la de mayor detalle»);
 * esto lo generaliza al resto de la comunidad.
 *
 * CRITERIOS (decididos al revisar el primer lote):
 *   · Sólo geometrías con `Caracter = 'Firme'`. Las `Provisional` no entran (Carrascoy tiene una de
 *     17.420 ha frente a las 16.686 firmes).
 *   · Si hay VARIOS registros firmes para el mismo espacio, se coge **el de más vértices**, que es
 *     el de mayor detalle. Ojo: puede no cuadrar con la superficie oficial del MITECO — el caso de
 *     Calblanque (4.901 vért./2.472 ha frente a 2.077 vért./2.466 ha). La discrepancia se anota en
 *     el `boundaryNote`, no se esconde.
 *
 * Fuente: IMIDA/CARM, servicio PROYECTOS/OISMA. Superficies oficiales y códigos ENP: «© Ministerio
 * para la Transición Ecológica y el Reto Demográfico».
 */
const fs = require('fs');
const path = require('path');
const { signedArea, ringArea, closeRing, orientRing, inRing } = require('../lib/geo');
const { getText } = require('../lib/http');
const { arg, flag } = require('../lib/cli');
const { ROOT: RAIZ, FRONTEND, REGISTRY_FILE: REGISTRO } = require('../lib/io');

const CACHE = path.join(__dirname, 'fuentes', 'imida-enp');

const DRY = flag('dry');
const SOLO = arg('solo');

const HOST = 'geoportal.imida.es';
const BASE = '/gis/rest/services/PROYECTOS/OISMA/MapServer';
// Una capa por figura de protección. Es como el IMIDA trocea su servicio.
const CAPAS = { 1: 'Parques Regionales', 2: 'Reservas Naturales', 3: 'Paisajes Protegidos', 4: 'Monumentos Naturales', 5: 'Otros ENP' };

// Espacios cuyo límite NO se toca, con el motivo. `cuatro-calas` ya venía del IMIDA y su
// delimitación se dio por cerrada; refinarla sería reabrir algo ya decidido.
const INTOCABLES = { 'cuatro-calas': 'su límite ya procede del IMIDA y se dio por cerrado' };

const PRESUPUESTO_BYTES = 300 * 1024;
const TOLERANCIAS = [0, 1, 2, 5, 10, 20, 50];
const numeroEs = (n, d = 1) => n.toLocaleString('es-ES', { minimumFractionDigits: d, maximumFractionDigits: d });

// Las cinco capas se cachean en disco (`fuentes/imida-enp/capa-N.json`, versionadas): el servicio
// del IMIDA es lento y la respuesta es determinista, así que reejecutar el refinador no vuelve a
// descargar nada. Borrar el fichero fuerza la descarga.
//
// ArcGIS responde 200 con un objeto `{error}` cuando la consulta no le gusta, así que el código de
// estado no basta: hay que mirar el cuerpo antes de darlo por bueno y, sobre todo, antes de
// escribirlo en la caché — si no, el error queda cacheado y las siguientes ejecuciones fallan sin
// que se vea por qué.
async function descarga(capa) {
  const destino = path.join(CACHE, `capa-${capa}.json`);
  if (fs.existsSync(destino)) return JSON.parse(fs.readFileSync(destino, 'utf8'));
  const ruta = `${BASE}/${capa}/query?where=1%3D1&outFields=*&returnGeometry=true&outSR=4326&geometryPrecision=7&f=json`;
  const { body } = await getText(HOST, ruta, { agent: 'refina-limites-imida', timeoutMs: 120000 });
  const j = JSON.parse(body);
  if (j.error) throw new Error(`capa ${capa}: ${JSON.stringify(j.error).slice(0, 200)}`);
  fs.mkdirSync(CACHE, { recursive: true });
  fs.writeFileSync(destino, body);
  return j;
}

// ArcGIS entrega TODOS los anillos en una lista plana, con el exterior en sentido horario y los
// agujeros en antihorario. GeoJSON exige lo contrario y además agrupar cada agujero dentro de su
// exterior. Esta es la conversión, y es el punto donde es fácil equivocarse.
function ringsAPoligonos(rings) {
  const exteriores = [], agujeros = [];
  for (const r of rings) {
    const anillo = closeRing(r.map(([x, y]) => [x, y]));
    if (anillo.length < 4) continue;
    (signedArea(anillo) < 0 ? exteriores : agujeros).push(anillo);
  }
  if (!exteriores.length) return [];
  // Cada agujero va al exterior MÁS PEQUEÑO que lo contiene (evita asignarlo a uno que lo envuelve
  // por casualidad cuando hay islas dentro de bahías).
  const polys = exteriores
    .sort((a, b) => ringArea(b) - ringArea(a))
    .map(e => [orientRing(e, true)]);
  for (const h of agujeros) {
    const p = h[0];
    let mejor = -1, mejorArea = Infinity;
    for (let i = 0; i < polys.length; i++) {
      const ext = polys[i][0];
      if (!inRing(p[0], p[1], ext)) continue;
      const a = ringArea(ext);
      if (a < mejorArea) { mejorArea = a; mejor = i; }
    }
    if (mejor >= 0) polys[mejor].push(orientRing(h, false));
  }
  return polys;
}

// --- generalización (misma escalera y criterio que build-n1-espacios.js) --------------------------
function douglasPeucker(pts, tol) {
  if (pts.length <= 3 || tol <= 0) return pts.slice();
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
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
      else { let t = ((x - x0) * dx + (y - y0) * dy) / len2; t = t < 0 ? 0 : t > 1 ? 1 : t; d = Math.hypot(x - (x0 + t * dx), y - (y0 + t * dy)); }
      if (d > maxD) { maxD = d; idx = i; }
    }
    if (maxD > tol) { keep[idx] = 1; pila.push([i0, idx], [idx, i1]); }
  }
  return pts.filter((_, i) => keep[i]);
}

// La tolerancia va en METROS, pero aquí las coordenadas ya son grados: se convierte con la latitud
// del propio espacio. (En build-n1-espacios se simplificaba en UTM porque la fuente venía en UTM;
// el IMIDA ya sirve en 4326 y reproyectar de ida y vuelta sólo añadiría error.)
function simplifica(polys, tolM, lat) {
  if (tolM <= 0) return polys;
  const gx = tolM / (111320 * Math.cos(lat * Math.PI / 180)), gy = tolM / 110540;
  const tol = Math.min(gx, gy);
  return polys.map(poly => poly.map((r, i) => {
    const s = closeRing(douglasPeucker(r, tol));
    return s.length >= 4 ? orientRing(s, i === 0) : r;
  }));
}
function redondea(polys, dec) {
  const f = Math.pow(10, dec), out = [];
  for (const poly of polys) {
    const anillos = [];
    poly.forEach((r, i) => {
      const pts = [];
      for (const [x, y] of r) {
        const p = [Math.round(x * f) / f, Math.round(y * f) / f];
        const u = pts[pts.length - 1];
        if (!u || u[0] !== p[0] || u[1] !== p[1]) pts.push(p);
      }
      const c = closeRing(pts);
      if (c.length >= 4) anillos.push(orientRing(c, i === 0));
    });
    if (anillos.length) out.push(anillos);
  }
  return out;
}
const nVertices = polys => polys.reduce((s, p) => s + p.reduce((t, r) => t + r.length, 0), 0);
function areaHa(polys, lat) {
  let a = 0;
  for (const p of polys) { a += ringArea(p[0]); for (let i = 1; i < p.length; i++) a -= ringArea(p[i]); }
  return a * 111320 * 111320 * Math.cos(lat * Math.PI / 180) / 10000;
}
function centroide(polys) {
  let sx = 0, sy = 0, sa = 0;
  for (const poly of polys) {
    const r = poly[0]; let a = 0, cx = 0, cy = 0;
    for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
      const f = r[j][0] * r[i][1] - r[i][0] * r[j][1];
      a += f; cx += (r[j][0] + r[i][0]) * f; cy += (r[j][1] + r[i][1]) * f;
    }
    if (a === 0) continue;
    const ar = Math.abs(a / 2);
    sx += (cx / (3 * a)) * ar; sy += (cy / (3 * a)) * ar; sa += ar;
  }
  return sa ? [sx / sa, sy / sa] : null;
}
const dentro = (pt, polys) => polys.some(p => inRing(pt[0], pt[1], p[0]) && !p.slice(1).some(h => inRing(pt[0], pt[1], h)));
function puntoInterior(polys, cerca) {
  const mayor = polys.reduce((m, p) => (ringArea(p[0]) > ringArea(m[0]) ? p : m), polys[0]);
  let a = [Infinity, Infinity, -Infinity, -Infinity];
  for (const [x, y] of mayor[0]) { if (x < a[0]) a[0] = x; if (y < a[1]) a[1] = y; if (x > a[2]) a[2] = x; if (y > a[3]) a[3] = y; }
  let mejor = null, mejorD = Infinity;
  for (let i = 1; i < 64; i++) for (let j = 1; j < 64; j++) {
    const p = [a[0] + (a[2] - a[0]) * i / 64, a[1] + (a[3] - a[1]) * j / 64];
    if (!dentro(p, [mayor])) continue;
    const d = cerca ? Math.hypot(p[0] - cerca[0], p[1] - cerca[1]) : 0;
    if (d < mejorD) { mejorD = d; mejor = p; }
  }
  return mejor;
}

const serializa = feats => '{"type":"FeatureCollection","features":[\n' + feats.map(f => JSON.stringify(f)).join(',\n') + '\n]}\n';

let escritos = 0, iguales = 0;
function escribe(abs, txt) {
  const rel = path.relative(RAIZ, abs);
  if (fs.existsSync(abs) && fs.readFileSync(abs, 'utf8') === txt) { iguales++; return `= ${rel}`; }
  if (!DRY) { fs.mkdirSync(path.dirname(abs), { recursive: true }); fs.writeFileSync(abs, txt); }
  escritos++;
  return `${DRY ? '~' : '+'} ${rel} (${(Buffer.byteLength(txt) / 1024).toFixed(1)} KB)`;
}

(async () => {
  const muni = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'murcia-enp-municipios.json'), 'utf8'));
  // El código del IMIDA en el fichero de municipios viene sucio de tres formas: con erratas
  // (`EN0000018` por `ENP000018`), con distinto número de ceros y, en un caso, con una aclaración
  // detrás («ENP000008 (dos piezas: 1227,3 + 80,1 ha…)»). Normalizar quedándose con el PRIMER grupo
  // de dígitos y quitando los ceros a la izquierda es lo único que casa los tres casos; si se
  // limpian todos los no-dígitos, la aclaración se cuela y el espacio no empareja.
  const digitos = s => { const m = String(s || '').match(/\d+/); return m ? String(Number(m[0])) : ''; };
  const porImida = new Map();
  muni.espacios.forEach(e => { if (e.codigoIMIDA) porImida.set(digitos(e.codigoIMIDA), e); });

  console.log(`\nNaturDex · refinado de límites desde el IMIDA/CARM${DRY ? '  [simulación]' : ''}`);
  console.log('─'.repeat(78));

  // 1) Descargar (con caché en disco) y quedarse con los firmes -------------------------------------
  const candidatos = new Map();   // codigoENP MITECO -> [{attrs, polys, nv}]
  for (const capa of Object.keys(CAPAS)) {
    const j = await descarga(capa);
    let firmes = 0;
    for (const f of j.features || []) {
      const a = f.attributes || {};
      if (String(a.Caracter || '').trim() !== 'Firme') continue;
      const e = porImida.get(digitos(a.CodigoENP));
      if (!e) continue;
      const polys = ringsAPoligonos((f.geometry && f.geometry.rings) || []);
      if (!polys.length) continue;
      firmes++;
      if (!candidatos.has(e.codigoENP)) candidatos.set(e.codigoENP, []);
      candidatos.get(e.codigoENP).push({ a, polys, nv: nVertices(polys), esp: e });
    }
    console.log(`  capa ${capa} (${CAPAS[capa]}): ${(j.features || []).length} registros, ${firmes} firmes emparejados`);
  }

  // 2) Emparejar con lo que hay en el registro ------------------------------------------------------
  const registro = JSON.parse(fs.readFileSync(REGISTRO, 'utf8'));
  const parks = registro.communities.flatMap(c => c.provinces.flatMap(p => p.parks));
  const informe = [], sinFuente = [];

  for (const entry of parks) {
    if (SOLO && entry.slug !== SOLO) continue;
    if (INTOCABLES[entry.slug]) { sinFuente.push(`${entry.slug} — no se toca: ${INTOCABLES[entry.slug]}`); continue; }
    const manifest = JSON.parse(fs.readFileSync(path.join(FRONTEND, entry.manifest), 'utf8'));
    const parkPath = path.join(FRONTEND, manifest.data);
    const doc = JSON.parse(fs.readFileSync(parkPath, 'utf8'));
    const geoRel = manifest.geo && manifest.geo.parque;
    if (!geoRel) continue;
    const geoAbs = path.join(FRONTEND, geoRel);
    const actual = JSON.parse(fs.readFileSync(geoAbs, 'utf8'));
    const props0 = (actual.features[0] || {}).properties || {};
    const cod = props0.CodigoENP && /^ES/.test(props0.CodigoENP) ? props0.CodigoENP : null;

    // Los dos parques anteriores al generador N1 no llevan el código oficial en el geojson: se
    // localizan por el nombre en el fichero de municipios.
    const esp = cod ? muni.espacios.find(e => e.codigoENP === cod)
                    : muni.espacios.find(e => e.nombre === entry.name);
    const lista = esp ? candidatos.get(esp.codigoENP) : null;
    if (!lista || !lista.length) { sinFuente.push(`${entry.slug} — sin registro firme en el IMIDA`); continue; }

    // Varios registros firmes del mismo espacio pueden ser DOS COSAS MUY DISTINTAS, y confundirlas
    // rompe el límite:
    //   · delimitaciones ALTERNATIVAS — cada una cubre el espacio entero (Calblanque: 2.472 y
    //     2.466 ha, oficial 2.466). Hay que quedarse con UNA: la de más vértices.
    //   · PIEZAS complementarias — juntas forman el espacio (Espacios Abiertos del Mar Menor:
    //     1.227,3 + 80,1 = 1.307,4 ha, exactamente la oficial). Hay que UNIRLAS todas; quedarse con
    //     la mayor perdería el 6 % del espacio.
    // El discriminante es la suma: si suman la superficie oficial son piezas; si cada una ya la
    // alcanza, son alternativas.
    const sumaHa = lista.reduce((s, x) => s + (x.a.Hectareas || 0), 0);
    const sonPiezas = lista.length > 1 && Math.abs(sumaHa - esp.supHaMiteco) / esp.supHaMiteco < 0.05;
    const usados = sonPiezas ? lista : [lista.slice().sort((x, y) => y.nv - x.nv)[0]];
    const elegido = usados[0];
    const descartados = lista.filter(x => !usados.includes(x));

    const latRef = entry.center[0];
    const supOficial = esp.supHaMiteco;

    // 3) Generalizar sólo lo justo para caber en el presupuesto -------------------------------------
    let elegida = null;
    const nombre = esp.nombre, figura = esp.figura;
    const hacer = (polys) => ({
      type: 'Feature',
      properties: {
        nombre, Figura: figura, CodigoENP: esp.codigoENP, CodigoIMIDA: elegido.a.CodigoENP,
        Hectareas: supOficial,
        fuente: `Delimitación oficial del IMIDA/CARM (servicio PROYECTOS/OISMA, Caracter «Firme»), en WGS84. Superficie oficial y código ENP del Banco de Datos de la Naturaleza (MITECO)`
      },
      geometry: polys.length === 1 ? { type: 'Polygon', coordinates: polys[0] } : { type: 'MultiPolygon', coordinates: polys }
    });
    // Si son piezas van todas; si son alternativas, `usados` trae una sola.
    const todasLasPolys = usados.flatMap(u => u.polys);
    for (const tol of TOLERANCIAS) {
      const p = redondea(simplifica(todasLasPolys, tol, latRef), 6);
      if (!p.length) continue;
      const txt = serializa([hacer(p)]);
      elegida = { polys: p, tol, bytes: Buffer.byteLength(txt), txt };
      if (elegida.bytes <= PRESUPUESTO_BYTES) break;
    }
    if (!elegida) { sinFuente.push(`${entry.slug} — la geometría del IMIDA se derrumba al procesarla`); continue; }

    // 4) Centro y superficie -------------------------------------------------------------------------
    let c = centroide(elegida.polys);
    if (!c || !dentro(c, elegida.polys)) c = puntoInterior(elegida.polys, c) || c;
    const center = [+c[1].toFixed(5), +c[0].toFixed(5)];
    const haGeom = areaHa(elegida.polys, latRef);
    const desvio = Math.abs(haGeom - supOficial) / supOficial * 100;

    const nvAntes = (() => { let n = 0; actual.features.forEach(f => { const ps = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates; ps.forEach(p => p.forEach(r => n += r.length)); }); return n; })();

    // 5) boundaryNote ---------------------------------------------------------------------------------
    let nota = `Límite oficial servido en geo/parque.geojson, descargado del geoportal del IMIDA/CARM (servicio PROYECTOS/OISMA, capa de ${CAPAS[1] && figura}, registros con Caracter «Firme»), identificador interno ${elegido.a.CodigoENP}. Código ENP oficial ${esp.codigoENP}, superficie oficial ${numeroEs(supOficial)} ha según el Banco de Datos de la Naturaleza (MITECO, diciembre de 2025). Geometría en WGS84`;
    nota += elegida.tol > 0 ? `, generalizada con tolerancia de ${elegida.tol} m para uso web` : ', sin generalizar';
    // OJO: nada de lo que entre en la nota puede depender del estado ANTERIOR del fichero (p. ej.
    // «sustituye a una de N vértices»), o la nota cambia en cada ejecución y el script deja de ser
    // idempotente. La comparación con la capa del MITECO vive en Docs/rollout/ESTADO.md.
    nota += ` (${nVertices(elegida.polys)} vértices, superficie resultante ${numeroEs(haGeom)} ha, desviación del ${numeroEs(desvio, 2)} %). Sustituye a la delimitación de la capa ENP nacional del MITECO, que es un producto generalizado.`;
    if (sonPiezas) {
      nota += ` El IMIDA publica este espacio en ${usados.length} piezas (${usados.map(u => numeroEs(u.a.Hectareas) + ' ha').join(' + ')}), cuya suma es la superficie oficial; se han unido todas.`;
    } else if (descartados.length) {
      nota += ` El IMIDA publica ${lista.length} delimitaciones firmes de este espacio; se ha escogido la de mayor detalle (${elegido.nv} vértices, ${numeroEs(elegido.a.Hectareas)} ha) frente a ${descartados.map(d => `${d.nv} vértices / ${numeroEs(d.a.Hectareas)} ha`).join(' y ')}.`;
    }
    nota += ` Municipios obtenidos por intersección geométrica contra los límites municipales del CNIG servidos por el IMIDA/CARM. Fuente: «© Ministerio para la Transición Ecológica y el Reto Demográfico» (código y superficie oficiales) e IMIDA/CARM (geometría).`;

    doc.park.center = center;
    doc.park.boundaryNote = nota;
    entry.center = center;

    const ficheros = [escribe(geoAbs, elegida.txt), escribe(parkPath, JSON.stringify(doc, null, 2) + '\n')];
    informe.push({ slug: entry.slug, nvAntes, nvDespues: nVertices(elegida.polys), tol: elegida.tol, kb: elegida.bytes / 1024, supOficial, haGeom, desvio, center, ficheros, duplicados: lista.length, piezas: sonPiezas, elegidoHa: elegido.a.Hectareas });
  }

  // 6) Registro ---------------------------------------------------------------------------------------
  const txtReg = JSON.stringify(registro, null, 4)
    .replace(/"center": \[\s*\n\s*([-\d.]+),\s*\n\s*([-\d.]+)\s*\n\s*\]/g, '"center": [$1, $2]') + '\n';
  const lineaReg = escribe(REGISTRO, txtReg);

  console.log('\n' + '─'.repeat(78));
  console.log('espacio                                  vért. antes → después   tol   KB    desvío sup.');
  informe.forEach(r => console.log(
    '  ' + r.slug.padEnd(40) + String(r.nvAntes).padStart(6) + ' → ' + String(r.nvDespues).padStart(6) +
    String(r.tol + ' m').padStart(7) + String(r.kb.toFixed(0)).padStart(6) + String(numeroEs(r.desvio, 2) + ' %').padStart(10) +
    (r.piezas ? `   (${r.duplicados} piezas unidas)` : r.duplicados > 1 ? `   (${r.duplicados} firmes, elegido el de ${numeroEs(r.elegidoHa)} ha)` : '')));
  console.log('\n    ' + lineaReg);
  if (sinFuente.length) { console.log('\nSin refinar:'); sinFuente.forEach(s => console.log('  · ' + s)); }
  console.log('\n' + '─'.repeat(78));
  console.log(`${informe.length} límite(s) refinado(s) · ${escritos} fichero(s) ${DRY ? 'a escribir' : 'escritos'}, ${iguales} sin cambios.`);
})().catch(e => { console.error(e); process.exit(1); });
