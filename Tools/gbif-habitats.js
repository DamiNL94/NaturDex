#!/usr/bin/env node
/*
 * NaturDex · gbif-habitats
 * ------------------------------------------------------------------------------------------------
 * Prototipo (SOLO LECTURA): estima, por cada hábitat de un parque, qué especies se han observado
 * dentro de su polígono, usando las ocurrencias georreferenciadas de GBIF (https://www.gbif.org/,
 * fuente científica pública, nodo español GBIF.ES). NO escribe nada en la BD ni en el seed.
 *
 * Diseño (escalable a toda España, el mismo por parque):
 *   1) Calcula el bounding box de los polígonos de hábitat del parque (desde su habitats.geojson).
 *   2) Descarga de GBIF TODAS las ocurrencias con coordenadas dentro de ese bbox (paginado) y las
 *      CACHEA en disco (gbif-cache-<parque>.json) para que los experimentos de filtrado sean
 *      instantáneos sin volver a descargar (--refresh fuerza la descarga).
 *   3) Hace el "point-in-polygon" LOCALMENTE de cada ocurrencia contra cada hábitat (geometría
 *      exacta, con agujeros y multipolígonos): evita el límite de complejidad/URL de GBIF.
 *   4) Analiza el RUIDO: composición taxonómica por hábitat, barrido de incertidumbre de
 *      coordenadas, y "ubicuidad" (especies presentes en casi todos los hábitats = ruido espacial,
 *      típicamente aves en vuelo). Separa Aves de no-Aves para ver cuánto se limpia el catálogo.
 *
 * DOS CUENTAS DISTINTAS, Y NO SON INTERCAMBIABLES. Los recintos del Atlas son MOSAICOS: un mismo
 * polígono lleva varios códigos HIC, así que un registro que cae dentro entra en el listado de cada
 * uno de ellos. Por eso el `--json` sirve las dos cuentas y las llama por su nombre:
 *   · `habitats[].species[].occurrences` — registros dentro de ESE polígono. Sumarlas entre hábitats
 *     NO da los registros de la especie en el espacio: multiplica por el mosaico.
 *   · `especies[].occurrences` — registros DISTINTOS dentro de algún polígono, contados una sola vez.
 *     Es la cuenta que mide presencia, y la que tiene que leer el filtro de `species:seleccion`.
 * La distinción no es teórica: en Sierra de Salinas, un recinto lleva cuatro códigos, y 49 plantas
 * con UN registro cada una aparecían con «4 ocurrencias» al sumar. Ver ESTADO.md, 2026-08-15 (c).
 *
 * Uso:   node Tools/gbif-habitats.js [--park <slug>] [--top N] [--max-uncertainty M]
 *                                    [--drop-unknown] [--refresh]
 *                                    [--out informe.md] [--json datos.json] [--birds-out aves.json]
 * ================================================================================================
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { ROOT } = require('./lib/io');
const { arg, num, flag, die, sleep } = require('./lib/cli');
const { resolvePark } = require('./lib/registry');
const { inRing } = require('./lib/geo');
const gbif = require('./lib/gbif');

const REPO_ROOT = ROOT;
const PAGE = gbif.PAGE;
const THROTTLE_MS = 120;

// --- Opciones ------------------------------------------------------------------------------------

const PARK = arg('park');
const TOP = num('top', 10);
const MAX_UNCERT = num('max-uncertainty', null);
const DROP_UNKNOWN = flag('drop-unknown'); // al filtrar, descartar registros sin incertidumbre conocida
const REFRESH = flag('refresh');
const OUT_FILE = arg('out');
const JSON_FILE = arg('json');
const BIRDS_OUT = arg('birds-out');
const MAX_OCC = num('max-occ', 40000);

// --- Registro de parques / geojson --------------------------------------------------------------
// La localización del parque en Frontend/Data/parks-index.json vive en Tools/lib/registry.js, que
// resuelve tanto los espacios 'available' (N2) como los 'basic' (N1 ascendiendo a N2, que es justo
// el caso de uso de esta herramienta). Estaba duplicada aquí, y esa copia fue la que se olvidó de
// aceptar los 'basic' cuando se arregló la otra.

function parkConHabitats() {
  const park = resolvePark(REPO_ROOT, PARK);
  if (!fs.existsSync(park.habitatsPath)) {
    die(`El parque '${park.slug}' todavía no tiene geo/habitats.geojson: genera antes la Capa 2 ` +
        `(build-habitats.js → merge-habitats.js → adopt-habitats.js).`);
  }
  return { ...park, geojsonPath: park.habitatsPath };
}

function loadHabitats(geojsonPath) {
  const fc = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));
  const out = [];
  for (const f of fc.features || []) {
    const g = f.geometry;
    if (!g || (g.type !== 'Polygon' && g.type !== 'MultiPolygon')) continue;
    const p = f.properties || {};
    const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
    out.push({
      slug: p.slug || '(sin slug)',
      name: p.name || p.title || p.slug || '',
      hic: p.hic || p.hic_code || p.codigo || p.code || null,
      polys, bbox: bboxOf(polys),
    });
  }
  return out;
}

// --- Geometría --------------------------------------------------------------------------------

function bboxOf(polys) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const poly of polys) for (const ring of poly) for (const [x, y] of ring) {
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
  }
  return { minX, minY, maxX, maxY };
}
// `inRing` (ray casting) viene de Tools/lib/geo.js: era idéntico aquí.
function inHabitat(x, y, hab) {
  const b = hab.bbox;
  if (x < b.minX || x > b.maxX || y < b.minY || y > b.maxY) return false;
  for (const poly of hab.polys) {
    if (!inRing(x, y, poly[0])) continue;
    let inHole = false;
    for (let h = 1; h < poly.length; h++) if (inRing(x, y, poly[h])) { inHole = true; break; }
    if (!inHole) return true;
  }
  return false;
}

// --- GBIF + caché -----------------------------------------------------------------------------

// El cliente HTTP compartido (Tools/lib/http.js, vía lib/gbif.js) añade User-Agent, timeout y
// reintento ante 429/5xx, que es justo el fallo que da GBIF al paginar decenas de miles de
// ocurrencias seguidas.
const httpGetJson = (pathQuery) => require('./lib/http').getJson(gbif.HOST, pathQuery, { agent: 'gbif-habitats', timeoutMs: 45000 });

// Cada cuántas páginas se vuelca la caché a disco. El barrido de un parque grande son cientos de
// páginas contra un servicio público que devuelve 503 con cierta frecuencia; volcando cada pocas,
// un corte cuesta esas páginas y no la pasada entera.
const PAGINAS_POR_VOLCADO = 10;

/*
 * El bbox de un parque grande no se puede paginar, y por eso el catálogo salía truncado.
 *
 * El bbox de Carrascoy y El Valle tiene **97.362 ocurrencias** —es un rectángulo que se come media
 * huerta de Murcia—, que a 300 por página son 325 páginas, y GBIF cobra el paginado profundo: la
 * página del offset 10.000 tarda 37 s. La descarga no termina nunca. Lo que se hizo la primera vez
 * fue dejar `--max-occ` en su valor por defecto, 40.000, que **trunca por offset**: el catálogo del
 * espacio se construyó con el 41 % de los datos y con el sesgo de que el offset no es una muestra al
 * azar.
 *
 * Se arregla pidiéndole el filtro espacial a GBIF en vez de traerse el rectángulo entero. GBIF acepta
 * `geometry=<WKT>`, con dos exigencias que no perdona: el anillo tiene que estar **cerrado** y
 * orientado **antihorario** —22 de los 51 recintos de Carrascoy salían del `.shp` en horario y
 * devolvían 400—. El límite oficial trae 2.100 vértices y no cabe en una URL, así que se simplifica
 * con Douglas-Peucker hasta un puñado y **se simplifica siempre hacia fuera**: lo que se manda es un
 * superconjunto del límite, nunca un recorte. Quien decide de verdad si una ocurrencia cuenta sigue
 * siendo el punto-en-polígono LOCAL contra cada hábitat, que no ha cambiado; esto solo evita
 * descargar la mitad de la Región.
 *
 * En Carrascoy: 97.362 → 29.915. Si GBIF rechaza la geometría, se vuelve al bbox **diciéndolo**.
 */
const EPSILON_SIMPLIFICADO = 0.001;   // ~90 m: suficiente para bajar de 2.100 vértices a ~130
const MAX_VERTICES_WKT = 200;         // por encima, la URL se va de tamaño

function simplifica(pts, eps) {
  if (pts.length < 3) return pts;
  const dist = (q, a, b) => {
    const dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy;
    if (!L) return Math.hypot(q[0] - a[0], q[1] - a[1]);
    let t = ((q[0] - a[0]) * dx + (q[1] - a[1]) * dy) / L;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(q[0] - (a[0] + t * dx), q[1] - (a[1] + t * dy));
  };
  let idx = 0, max = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = dist(pts[i], pts[0], pts[pts.length - 1]);
    if (d > max) { max = d; idx = i; }
  }
  if (max <= eps) return [pts[0], pts[pts.length - 1]];
  return simplifica(pts.slice(0, idx + 1), eps).slice(0, -1).concat(simplifica(pts.slice(idx), eps));
}

/** Casco convexo (Andrew). Se usa cuando el límite tiene varios anillos: un WKT es un polígono. */
function cascoConvexo(pts) {
  const cruz = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const s = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const bajo = [], alto = [];
  for (const q of s) { while (bajo.length >= 2 && cruz(bajo[bajo.length - 2], bajo[bajo.length - 1], q) <= 0) bajo.pop(); bajo.push(q); }
  for (const q of [...s].reverse()) { while (alto.length >= 2 && cruz(alto[alto.length - 2], alto[alto.length - 1], q) <= 0) alto.pop(); alto.push(q); }
  return bajo.slice(0, -1).concat(alto.slice(0, -1));
}

/** WKT de un anillo, cerrado y antihorario, que es lo único que GBIF acepta. */
function wktAntihorario(pts) {
  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length];
    area += x1 * y2 - x2 * y1;
  }
  const p = area < 0 ? [...pts].reverse() : pts;
  const ultimo = p[p.length - 1];
  const cerrado = (p[0][0] === ultimo[0] && p[0][1] === ultimo[1]) ? p : p.concat([p[0]]);
  return `POLYGON((${cerrado.map(c => `${c[0].toFixed(4)} ${c[1].toFixed(4)}`).join(',')}))`;
}

/** El WKT con el que pedirle a GBIF que filtre, o null si no se puede construir uno razonable. */
function geometriaDelLimite(boundaryPath) {
  if (!boundaryPath || !fs.existsSync(boundaryPath)) return null;
  const g = JSON.parse(fs.readFileSync(boundaryPath, 'utf8'));
  const anillos = [];
  for (const f of g.features || [g]) {
    const geo = f.geometry || f;
    if (geo.type === 'Polygon') anillos.push(geo.coordinates[0]);
    else if (geo.type === 'MultiPolygon') for (const poly of geo.coordinates) anillos.push(poly[0]);
  }
  if (!anillos.length) return null;
  // Un solo anillo se simplifica; varios se envuelven en su casco convexo, que es un superconjunto
  // (se descarga de más, nunca de menos) y cabe en un único WKT.
  let pts = anillos.length === 1 ? simplifica(anillos[0], EPSILON_SIMPLIFICADO)
    : simplifica(cascoConvexo(anillos.flat()), EPSILON_SIMPLIFICADO);
  if (pts.length > MAX_VERTICES_WKT) pts = cascoConvexo(pts);
  return pts.length >= 4 ? wktAntihorario(pts) : null;
}

async function downloadOccurrences(bbox, cacheFile, previo, geometria) {
  const margin = 0.001;
  const latR = `${(bbox.minY - margin).toFixed(5)},${(bbox.maxY + margin).toFixed(5)}`;
  const lonR = `${(bbox.minX - margin).toFixed(5)},${(bbox.maxX + margin).toFixed(5)}`;
  const porBbox = `/v1/occurrence/search?hasCoordinate=true&hasGeospatialIssue=false` +
    `&decimalLatitude=${encodeURIComponent(latR)}&decimalLongitude=${encodeURIComponent(lonR)}`;
  let base = porBbox;
  if (geometria) {
    const porGeometria = `/v1/occurrence/search?hasCoordinate=true&hasGeospatialIssue=false` +
      `&geometry=${encodeURIComponent(geometria)}`;
    try {
      const prueba = await httpGetJson(`${porGeometria}&limit=0`);
      const enBbox = await httpGetJson(`${porBbox}&limit=0`);
      console.log(`Filtro espacial en el servidor: ${prueba.count} ocurrencias en el límite oficial ` +
        `(${enBbox.count} en el bbox; se ahorran ${Math.max(0, enBbox.count - prueba.count)}).`);
      base = porGeometria;
    } catch (e) {
      // Un «no se pudo» que se ve: si GBIF rechaza la geometría, la descarga sigue por bbox, pero
      // nadie puede confundir eso con no haberlo intentado.
      console.error(`⚠ GBIF rechaza la geometría del límite (${String(e.message).slice(0, 120)}).\n` +
        '  Se descarga por bbox, que en un espacio grande puede no terminar. Revisa el WKT.');
    }
  }
  const first = await httpGetJson(`${base}&limit=0`);
  const total = Math.min(first.count || 0, MAX_OCC);

  // Reanudación: si hay una descarga a medias del MISMO bbox y el mismo tope, se sigue desde donde
  // se quedó en vez de volver a empezar.
  const mismoBarrido = previo && previo.parcial && previo.bbox === base && previo.max === MAX_OCC;
  const occ = mismoBarrido ? previo.occ : [];
  let inicio = mismoBarrido ? previo.offset : 0;
  if (mismoBarrido) console.log(`Reanudando descarga en ${inicio}/${total} (${occ.length} ocurrencias ya guardadas).`);

  const volcar = (offset, parcial) => fs.writeFileSync(cacheFile, JSON.stringify({
    total: first.count || 0, capped: (first.count || 0) > MAX_OCC, occ, parcial, offset, bbox: base, max: MAX_OCC,
  }));

  let pagina = 0;
  for (let offset = inicio; offset < total; offset += PAGE) {
    let page;
    try {
      page = await httpGetJson(`${base}&limit=${PAGE}&offset=${offset}`);
    } catch (e) {
      // Lo descargado hasta aquí NO se tira: se deja en la caché marcada como parcial para que la
      // siguiente ejecución reanude. El error se propaga igual.
      volcar(offset, true);
      process.stdout.write('\n');
      console.error(`✖ corte en el offset ${offset}. Lo descargado queda en ${path.basename(cacheFile)}; relanza para reanudar.`);
      throw e;
    }
    for (const r of page.results || []) {
      if (typeof r.decimalLatitude !== 'number' || typeof r.decimalLongitude !== 'number') continue;
      occ.push({
        lat: r.decimalLatitude, lon: r.decimalLongitude,
        speciesKey: r.speciesKey || null, species: r.species || r.scientificName || null,
        kingdom: r.kingdom || null, class: r.class || null,
        uncertainty: typeof r.coordinateUncertaintyInMeters === 'number' ? r.coordinateUncertaintyInMeters : null,
      });
    }
    process.stdout.write(`\r  descargando ocurrencias… ${Math.min(offset + PAGE, total)}/${total}`);
    if (page.endOfRecords) break;
    if (++pagina % PAGINAS_POR_VOLCADO === 0) volcar(offset + PAGE, true);
    await sleep(THROTTLE_MS);
  }
  process.stdout.write('\n');
  volcar(total, false);
  return { total: first.count || 0, capped: (first.count || 0) > MAX_OCC, occ };
}

async function getOccurrences(park, bbox, geometria) {
  const cacheFile = path.join(REPO_ROOT, `gbif-cache-${park.slug}.json`);
  let previo = null;
  if (fs.existsSync(cacheFile)) {
    previo = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
    // Una caché COMPLETA se reutiliza salvo --refresh; una PARCIAL nunca se sirve como resultado
    // (daría un catálogo a medias sin avisar): sólo vale para reanudar.
    if (!REFRESH && !previo.parcial) {
      console.log(`Caché: ${previo.occ.length} ocurrencias (${path.basename(cacheFile)}). Usa --refresh para volver a descargar.`);
      return previo;
    }
  }
  const data = await downloadOccurrences(bbox, cacheFile, REFRESH ? null : previo, geometria);
  console.log(`Descargadas y cacheadas en ${path.basename(cacheFile)}.`);
  return data;
}

// --- Análisis ---------------------------------------------------------------------------------

const isBird = (o) => o.class === 'Aves';

function passUncertainty(o) {
  if (MAX_UNCERT == null) return true;
  if (o.uncertainty == null) return !DROP_UNKNOWN;
  return o.uncertainty <= MAX_UNCERT;
}

function main() {
  const park = parkConHabitats();
  const habitats = loadHabitats(park.geojsonPath);
  if (habitats.length === 0) die('El geojson no tiene polígonos de hábitat.');
  console.log(`Parque: ${park.name} (${park.slug}) · ${habitats.length} hábitats`);
  const bbox = bboxOf(habitats.flatMap(h => h.polys));

  // El filtro espacial se le pide a GBIF sobre el LÍMITE OFICIAL, no sobre el bbox. `--bbox` vuelve
  // al comportamiento viejo, que en un espacio grande no termina.
  const geometria = flag('bbox') ? null : geometriaDelLimite(park.boundaryPath);
  if (!geometria && !flag('bbox'))
    console.error('⚠ Sin geometría del límite utilizable: se descarga por bbox. En un espacio grande puede no terminar.');

  getOccurrences(park, bbox, geometria).then(({ total, capped, occ }) => {
    const used = occ.filter(passUncertainty);
    console.log(`GBIF: ${total} descargadas${capped ? ` (limitado a ${MAX_OCC})` : ''}; ${used.length} tras filtro de incertidumbre` +
      `${MAX_UNCERT != null ? ` (≤ ${MAX_UNCERT} m${DROP_UNKNOWN ? ', descartando desconocidas' : ', desconocidas incluidas'})` : ' (sin filtro)'}.\n`);

    // Point-in-polygon.
    for (const h of habitats) { h.occ = 0; h.birdsOcc = 0; h.species = new Map(); }
    const spInHab = new Map();      // speciesKey -> {name, class, habitats:Set}
    const birds = new Map();        // speciesKey -> {name, count, habitats:Set} (solo Aves, dentro de hábitats)
    let assigned = 0, orphan = 0;
    for (const o of used) {
      let hit = false;
      for (const h of habitats) {
        if (!inHabitat(o.lon, o.lat, h)) continue;
        hit = true; h.occ++; if (isBird(o)) h.birdsOcc++;
        if (o.speciesKey) {
          const cur = h.species.get(o.speciesKey) || { name: o.species, class: o.class, count: 0 };
          cur.count++; h.species.set(o.speciesKey, cur);
          const s = spInHab.get(o.speciesKey) || { name: o.species, class: o.class, habitats: new Set(), occ: 0 };
          s.habitats.add(h.slug); spInHab.set(o.speciesKey, s);
          if (isBird(o)) { const b = birds.get(o.speciesKey) || { name: o.species, count: 0, habitats: new Set() }; b.count++; b.habitats.add(h.slug); birds.set(o.speciesKey, b); }
        }
      }
      // El registro se cuenta UNA vez por especie, fuera del bucle de hábitats: dentro se contaría
      // una por cada código del mosaico que cubra el mismo punto.
      if (hit && o.speciesKey && spInHab.has(o.speciesKey)) spInHab.get(o.speciesKey).occ++;
      if (hit) assigned++; else orphan++;
    }

    const md = renderReport(park, habitats, { total, capped, usedCount: used.length, allOcc: occ, assigned, orphan, spInHab, birds });
    console.log(md);
    if (OUT_FILE) { fs.writeFileSync(path.resolve(OUT_FILE), md); console.log(`\nInforme escrito en ${path.resolve(OUT_FILE)}`); }
    if (JSON_FILE) writeJson(park, habitats, spInHab);
    if (BIRDS_OUT) writeBirds(park, birds);
  }).catch(e => die(e.stack || e.message));
}

function classHistogram(list) {
  const m = new Map();
  for (const o of list) { const k = o.class || '(sin clase)'; m.set(k, (m.get(k) || 0) + 1); }
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

function uncertaintySweep(allOcc) {
  const known = allOcc.filter(o => o.uncertainty != null);
  const thresholds = [null, 1000, 500, 250, 100];
  return { total: allOcc.length, known: known.length, rows: thresholds.map(t => ({
    t, keptLenient: allOcc.filter(o => t == null ? true : (o.uncertainty == null || o.uncertainty <= t)).length,
    keptStrict: allOcc.filter(o => t == null ? (o.uncertainty != null) : (o.uncertainty != null && o.uncertainty <= t)).length,
  })) };
}

function renderReport(park, habitats, s) {
  const L = [];
  const distinct = s.spInHab.size;
  const birdSp = [...s.spInHab.values()].filter(v => v.class === 'Aves').length;
  const nonBirdSp = distinct - birdSp;

  L.push(`# Especies por hábitat + análisis de ruido (GBIF) — ${park.name}\n`);
  L.push('Fuente: GBIF (ocurrencias georreferenciadas) · método: point-in-polygon local.\n');

  L.push('## 1. Resumen\n');
  L.push(`- Ocurrencias en bbox: **${s.total}**${s.capped ? ' (limitado)' : ''} · usadas tras filtro: **${s.usedCount}**`);
  L.push(`- Dentro de algún hábitat: **${s.assigned}** · fuera: **${s.orphan}**`);
  L.push(`- Especies distintas en hábitats: **${distinct}** → **Aves ${birdSp}** / no-Aves **${nonBirdSp}**\n`);

  L.push('## 2. Composición taxonómica (ocurrencias dentro de hábitats, por clase)\n');
  const perClass = new Map();
  for (const h of habitats) for (const v of h.species.values()) perClass.set(v.class || '(sin clase)', (perClass.get(v.class || '(sin clase)') || 0) + v.count);
  const classRows = [...perClass.entries()].sort((a, b) => b[1] - a[1]);
  const totalClassOcc = classRows.reduce((a, [, c]) => a + c, 0) || 1;
  L.push('| Clase | Ocurrencias | % |');
  L.push('|---|---:|---:|');
  for (const [k, c] of classRows.slice(0, 10)) L.push(`| ${k} | ${c} | ${(100 * c / totalClassOcc).toFixed(1)}% |`);
  L.push('');

  L.push('## 3. Barrido de incertidumbre de coordenadas\n');
  const sw = uncertaintySweep(s.allOcc);
  L.push(`Registros con incertidumbre declarada: **${sw.known}/${sw.total}** (${(100 * sw.known / sw.total).toFixed(0)}%).`);
  L.push('| Umbral | Pasan (desc. incluidas) | Pasan (solo con dato) |');
  L.push('|---|---:|---:|');
  for (const r of sw.rows) L.push(`| ${r.t == null ? 'sin filtro' : '≤ ' + r.t + ' m'} | ${r.keptLenient} | ${r.keptStrict} |`);
  L.push('');

  L.push('## 4. Especies ubicuas (ruido espacial: presentes en muchos hábitats)\n');
  const ubiq = [...s.spInHab.values()].map(v => ({ name: v.name, class: v.class, n: v.habitats.size }))
    .filter(v => v.n >= Math.ceil(habitats.length * 0.6)).sort((a, b) => b.n - a.n);
  const ubiqBirds = ubiq.filter(v => v.class === 'Aves').length;
  L.push(`Especies en ≥ ${Math.ceil(habitats.length * 0.6)}/${habitats.length} hábitats: **${ubiq.length}** (de ellas Aves: **${ubiqBirds}**).\n`);
  L.push('| Especie | Clase | nº hábitats |');
  L.push('|---|---|---:|');
  for (const v of ubiq.slice(0, 15)) L.push(`| ${v.name} | ${v.class || '—'} | ${v.n} |`);
  L.push('');

  L.push('## 5. Por hábitat: total vs sin Aves (cuánto ruido se va)\n');
  L.push('| Hábitat | HIC | Especies | Aves | **No-Aves** | Top no-Aves |');
  L.push('|---|---|---:|---:|---:|---|');
  for (const h of [...habitats].sort((a, b) => b.species.size - a.species.size)) {
    const vals = [...h.species.values()];
    const nonBird = vals.filter(v => v.class !== 'Aves');
    const top = nonBird.sort((a, b) => b.count - a.count).slice(0, TOP).map(v => `${v.name} (${v.count})`).join('; ') || '—';
    L.push(`| ${h.name} <br><small>${h.slug}</small> | ${h.hic || '—'} | ${h.species.size} | ${vals.length - nonBird.length} | **${nonBird.length}** | ${top} |`);
  }
  L.push('\n> Las Aves son el grueso del ruido espacial (registros en vuelo/marinos que caen en cualquier');
  L.push('> polígono). Quitándolas, los hábitats botánicos quedan con su flora coherente. Las Aves NO se');
  L.push('> tiran: van a un apartado propio (migratorias/ZEPA) contrastable con la lista oficial del espacio.');
  return L.join('\n');
}

function writeJson(park, habitats, spInHab) {
  const dump = { park: park.slug, generatedFrom: 'GBIF + local point-in-polygon',
    // Registros DISTINTOS por especie dentro de algún polígono. Es la cuenta de presencia; la de
    // habitats[].species[] es por polígono y sumarla multiplica por el mosaico (ver cabecera).
    especies: [...spInHab.entries()]
      .map(([k, v]) => ({ speciesKey: +k, name: v.name, class: v.class, occurrences: v.occ, habitats: v.habitats.size }))
      .sort((a, b) => b.occurrences - a.occurrences),
    habitats: habitats.map(h => ({ slug: h.slug, hic: h.hic, occurrences: h.occ, speciesCount: h.species.size,
      species: [...h.species.entries()].map(([k, v]) => ({ speciesKey: +k, name: v.name, class: v.class, occurrences: v.count })).sort((a, b) => b.occurrences - a.occurrences) })) };
  fs.writeFileSync(path.resolve(JSON_FILE), JSON.stringify(dump, null, 2));
  console.log(`Datos por hábitat escritos en ${path.resolve(JSON_FILE)}`);
}
function writeBirds(park, birds) {
  const list = [...birds.entries()].map(([k, v]) => ({ speciesKey: +k, name: v.name, occurrences: v.count, habitats: v.habitats.size }))
    .sort((a, b) => b.occurrences - a.occurrences);
  fs.writeFileSync(path.resolve(BIRDS_OUT), JSON.stringify({ park: park.slug, birdSpecies: list.length, birds: list }, null, 2));
  console.log(`Aves (para cruce ZEPA) escritas en ${path.resolve(BIRDS_OUT)} — ${list.length} especies.`);
}

main();
