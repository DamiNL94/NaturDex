#!/usr/bin/env node
/*
 * NaturDex · catalogo-nacional/build-habitats
 * ------------------------------------------------------------------------------------------------
 * CAPA 2 del catálogo nacional: construye la capa OFICIAL de hábitats de un parque a partir de la
 * cartografía de hábitats del MITECO/BDN.
 *
 *   shapefile (recintos, ETRS89 UTM)  +  tabla de hábitats por recinto
 *        │  reproyecta UTM<zona> → WGS84   (la zona se LEE del .prj, no se asume)
 *        │  une por la clave del recinto   (un recinto puede tener VARIOS hábitats = mosaico)
 *        │  recorta al límite del parque
 *        ▼
 *   <slug>-oficial.geojson  (un Feature por recinto, con su mosaico de hábitats)
 *
 * DOS FUENTES POSIBLES, autodetectadas por los campos de la tabla:
 *
 *   atlas2005  ← PREFERENTE. «Atlas y Manual de los Hábitats Naturales y Seminaturales de España»
 *                (2005). Une por HAB_LAY. Trae el código HIC en CODUE —vacío si el hábitat no es
 *                de interés comunitario— y además nombre común, genérico, descripción oficial,
 *                alianza, especies características, naturalidad y % de cobertura.
 *                Es un SUPERCONJUNTO de la de 1997: incluye hábitats seminaturales que la
 *                Directiva no recoge, marcados con esHIC=false.
 *                Ficheros: INB_Habitat<NN>_ETRS89_H30.shp + Datos<NN>.dbf
 *
 *   hic1997    ← heredada. Cartografía de Hábitats de Interés Comunitario (Directiva 92/43/CEE),
 *                actualización de 1997. Une por CODIGO. Solo hábitats del Anexo I y con subtipos
 *                españoles (8211, 5334) en vez de los códigos UE de 4 dígitos.
 *                Ficheros: DirectivaHabitat<NN>_1997.shp + Habi<NN>.dbf
 *
 * Es SOLO LECTURA sobre los datos del repo: no toca la BD, ni el seed, ni el habitats.geojson
 * curado. Escribe únicamente su fichero de salida.
 *
 * Manifiestos de descarga y procedencia:
 *   Tools/catalogo-nacional/fuentes/atlas-habitats-2005-provincias.json  (52 provincias)
 *   Tools/catalogo-nacional/fuentes/habitat-provincias.json              (50 provincias, 1997)
 * Análisis de la diferencia entre ambas:
 *   Tools/catalogo-nacional/out/fusion-habitats-1997-atlas2005.md
 *
 * Uso:
 *   node Tools/catalogo-nacional/build-habitats.js --park <slug> --shp <ruta.shp> \
 *        --datos <ruta/Datos30.dbf> [--boundary <ruta.geojson>] [--out <salida.geojson>]
 *
 *   --datos    tabla de hábitats por recinto (Datos<NN>.dbf o Habi<NN>.dbf). `--habi` es su alias.
 *   --fuente   fuerza atlas2005 | hic1997. Por defecto se autodetecta por los campos de la tabla.
 *   --zone     fuerza el huso UTM. Por defecto se lee del .prj del shapefile.
 * ================================================================================================
 */
'use strict';

const fs = require('fs');
const path = require('path');
const pc = require('polygon-clipping');
const { readDbf } = require('../lib/dbf');
const { readPolygons, utmToLonLat } = require('../lib/shapefile');
const { bbox, bboxOverlap, inRing, signedArea } = require('../lib/geo');
const { resolvePark, readBoundaryPolygons } = require('../lib/registry');
const { arg, num, flag: has, die } = require('../lib/cli');
const { ROOT } = require('../lib/io');

// Caja envolvente de un MultiPolygon (todas las piezas), y punto dentro del límite teniendo en
// cuenta piezas y agujeros: el equivalente multiparte de bbox()/inRing() para el límite del parque.
function bboxDePolys(polys) {
  let a = [Infinity, Infinity, -Infinity, -Infinity];
  for (const poly of polys) for (const [x, y] of poly[0]) {
    if (x < a[0]) a[0] = x; if (y < a[1]) a[1] = y; if (x > a[2]) a[2] = x; if (y > a[3]) a[3] = y;
  }
  return a;
}
function dentroDelLimite(x, y, polys) {
  for (const poly of polys) {
    if (!inRing(x, y, poly[0])) continue;
    let enAgujero = false;
    for (let i = 1; i < poly.length; i++) if (inRing(x, y, poly[i])) { enAgujero = true; break; }
    if (!enAgujero) return true;
  }
  return false;
}

const REPO_ROOT = ROOT;

// --- Opciones (Tools/lib/cli.js) ----------------------------------------------------------------
const PARK = arg('park');
const SHP = arg('shp');
const HABI = arg('datos') || arg('habi');   // --habi se mantiene por compatibilidad
const BOUNDARY = arg('boundary');
const OUT = arg('out');
const FUENTE_FORZADA = arg('fuente');

if (has('help')) { console.log(fs.readFileSync(__filename, 'utf8').split('*/')[0]); process.exit(0); }
if (!SHP || !HABI) die('Faltan --shp y/o --datos. Ver: node Tools/catalogo-nacional/build-habitats.js --help');
if (!fs.existsSync(SHP)) die(`No existe el shapefile: ${SHP}`);
if (!fs.existsSync(HABI)) die(`No existe la tabla de hábitats: ${HABI}`);
if (FUENTE_FORZADA && !['atlas2005', 'hic1997'].includes(FUENTE_FORZADA)) die(`--fuente debe ser atlas2005 o hic1997. Recibido: ${FUENTE_FORZADA}`);

// El .dbf de atributos del shapefile es el hermano del .shp.
const SHP_DBF = SHP.replace(/\.shp$/i, '.dbf');
if (!fs.existsSync(SHP_DBF)) die(`No encuentro el .dbf del shapefile junto a ${SHP}`);

// El huso UTM se LEE del .prj. Asumirlo es el error clásico de esta cartografía: en la de 1997 el
// huso es propio de cada provincia, y en el Atlas 2005 son 30N (península y Baleares) y 28N
// (Canarias). --zone sigue existiendo como anulación manual.
function husoDelPrj(shpPath) {
  const prj = shpPath.replace(/\.shp$/i, '.prj');
  if (!fs.existsSync(prj)) return null;
  const m = fs.readFileSync(prj, 'latin1').match(/UTM[_\s]*Zone[_\s]*(\d{1,2})\s*N/i);
  return m ? parseInt(m[1], 10) : null;
}
const ZONE_PRJ = husoDelPrj(SHP);
const ZONE = num('zone', ZONE_PRJ);
if (!Number.isInteger(ZONE) || ZONE < 27 || ZONE > 31)
  die(`No he podido determinar el huso UTM. El .prj no lo declara de forma reconocible: pásalo con --zone. Valor obtenido: ${ZONE}`);

// Autodetección de la fuente por los campos de la tabla. Es más fiable que fiarse del nombre del
// fichero o de una bandera que se puede olvidar.
function detectaFuente(campos) {
  const n = new Set(campos.map(c => c.name));
  if (n.has('CODUE') && n.has('HAB_LAY')) return 'atlas2005';
  if (n.has('CODIGO_UE') && n.has('CODIGO')) return 'hic1997';
  return null;
}

// Perfil de cada fuente: qué clave une, de qué campo sale cada cosa y cómo se llama en la salida.
const PERFILES = {
  atlas2005: {
    clave: 'HAB_LAY',
    etiqueta: 'Atlas y Manual de los Hábitats Naturales y Seminaturales de España (2005)',
    manifiesto: 'fuentes/atlas-habitats-2005-provincias.json',
  },
  hic1997: {
    clave: 'CODIGO',
    etiqueta: 'Cartografía Hábitat Directiva 92/43/CEE (1997)',
    manifiesto: 'fuentes/habitat-provincias.json',
  },
};

// --- Programa ---------------------------------------------------------------------------------

function main() {
  const park = resolvePark(REPO_ROOT, PARK);
  const boundaryPath = BOUNDARY || park.boundaryPath;
  if (!fs.existsSync(boundaryPath)) die(`No existe el límite del parque: ${boundaryPath}. Pásalo con --boundary.`);
  // El límite se usa ENTERO: todas sus piezas y todos sus agujeros. La mayoría de los espacios
  // protegidos son multiparte y con enclaves excluidos, y recortar contra un solo anillo exterior
  // mete dentro del parque lo que está en un agujero y deja fuera las piezas menores.
  const parkPolys = readBoundaryPolygons(boundaryPath);
  const parkPoly = parkPolys;                       // coordenadas de MultiPolygon para polygon-clipping
  const pbb = bboxDePolys(parkPolys);
  console.log(`Parque: ${park.name} (${park.slug}) · huso UTM ${ZONE}N · límite: ${path.relative(REPO_ROOT, boundaryPath)}`);

  const recs = readPolygons(SHP);
  const attrs = readDbf(SHP_DBF).rows;      // atributos del recinto, por índice de registro
  const tabla = readDbf(HABI);              // tabla de hábitats: clave -> N filas (mosaico)

  const fuente = FUENTE_FORZADA || detectaFuente(tabla.fields);
  if (!fuente) die(`No reconozco el formato de ${path.basename(HABI)}. Campos: ${tabla.fields.map(f => f.name).join(', ')}. Fuérzalo con --fuente.`);
  const perfil = PERFILES[fuente];
  const CLAVE = perfil.clave;

  if (!attrs.length || !(CLAVE in attrs[0]))
    die(`El .dbf del shapefile no tiene el campo "${CLAVE}" que necesita la fuente ${fuente}. ¿Has emparejado shapefile y tabla de la misma fuente?`);

  console.log(`Fuente: ${fuente} — ${perfil.etiqueta}`);
  console.log(`  ${recs.length} recintos · ${tabla.nRec} filas de hábitat en ${path.basename(HABI)} · unión por ${CLAVE}`);

  const byCod = new Map();
  for (const h of tabla.rows) { const k = h[CLAVE]; if (!byCod.has(k)) byCod.set(k, []); byCod.get(k).push(h); }

  const features = [];
  let skipNoHic = 0, clipped = 0;
  for (let i = 0; i < recs.length; i++) {
    const rings = recs[i];
    if (!rings) continue;
    // Reproyecta todos los anillos del recinto a WGS84.
    const ll = rings.map(r => r.map(([x, y]) => utmToLonLat(x, y, ZONE)));
    if (!bboxOverlap(bbox(ll[0]), pbb)) continue;

    const idRecinto = attrs[i] && attrs[i][CLAVE];
    const habs = fuente === 'atlas2005' ? habitatsAtlas(byCod, idRecinto) : habitatsHic1997(byCod, idRecinto);
    if (habs.length === 0) { skipNoHic++; continue; } // marco/artefactos sin atributos

    // Recorta el recinto (como MultiPolygon con sus agujeros) contra el límite del parque.
    let inter;
    try { inter = pc.intersection(recintoMultiPolygon(ll), parkPoly); }
    catch (e) { console.warn(`  ⚠ recinto ${idRecinto}: fallo al recortar (${e.message}), se omite`); continue; }
    if (!inter || inter.length === 0) continue;
    clipped++;

    const coords = inter.map(poly => poly.map(ring => ring.map(([x, y]) => [+x.toFixed(6), +y.toFixed(6)])));
    const geometry = coords.length === 1 ? { type: 'Polygon', coordinates: coords[0] } : { type: 'MultiPolygon', coordinates: coords };
    // El hábitat dominante es el de mayor cobertura DENTRO de los que son HIC: si el recinto tiene
    // alguno comunitario, ése es el que interesa etiquetar. Si no lo hay, manda el de más cobertura.
    const conHic = habs.filter(h => h.hic);
    const dominante = (conHic.length ? conHic : habs).slice().sort((a, b) => b.cobertura - a.cobertura)[0];
    features.push({
      type: 'Feature',
      properties: {
        recinto: idRecinto,
        hic_dominante: dominante.hic,
        n_habitats: habs.length,
        // ¿el recinto contiene algún hábitat de interés comunitario?
        esHIC: habs.some(h => h.esHIC),
        n_hic: conHic.length,
        habitats: habs,
        // Bandera de prioridad tal y como la declara la FUENTE. La definitiva la asigna
        // merge-habitats.js desde data/hic-prioritarios.json, que es el Anexo I de la Directiva.
        prioritario_fuente: habs.some(h => h.prioritario_fuente),
        fuenteId: fuente,
        fuente: `MITECO/BDN — ${perfil.etiqueta}; recinto recortado al límite del parque y reproyectado UTM${ZONE}N→WGS84`,
      },
      geometry,
    });
  }

  const outPath = OUT || path.join(__dirname, 'out', `${park.slug}-oficial.geojson`);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify({ type: 'FeatureCollection', features }));

  // --- Validación ---
  let outside = 0, totV = 0;
  for (const f of features) {
    const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
    for (const poly of polys) for (const [x, y] of poly[0]) {
      totV++;
      if (!dentroDelLimite(x, y, parkPolys) && (x < pbb[0] - 1e-4 || x > pbb[2] + 1e-4 || y < pbb[1] - 1e-4 || y > pbb[3] + 1e-4)) outside++;
    }
  }
  const hic = new Map(), semi = new Map();
  for (const f of features) for (const h of f.properties.habitats) {
    if (h.esHIC) hic.set(h.hic, (hic.get(h.hic) || 0) + 1);
    else { const k = h.generico || h.nombre_comun || '(sin nombre)'; semi.set(k, (semi.get(k) || 0) + 1); }
  }
  const orden = (m) => [...m.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${v}`).join('  ');
  console.log(`\nRecintos en el parque: ${features.length} (recortados: ${clipped}) · descartados sin atributos: ${skipNoHic}`);
  console.log(`  de ellos con algún HIC: ${features.filter(f => f.properties.esHIC).length} · solo seminaturales: ${features.filter(f => !f.properties.esHIC).length}`);
  console.log(`Validación · vértices fuera del parque: ${outside}/${totV} ${outside === 0 ? '✔' : '✖'}`);
  console.log(`HIC presentes (${hic.size}): ${orden(hic) || '—'}`);
  if (semi.size) console.log(`Seminaturales, no HIC (${semi.size}): ${orden(semi)}`);
  console.log(`\n→ ${path.relative(REPO_ROOT, outPath)}`);
}

const texto = (s) => { const v = s == null ? '' : String(s).replace(/\s+/g, ' ').trim(); return v || null; };

// --- Atlas 2005 (fuente preferente) ------------------------------------------------------------
// Filas de Datos<NN> para un recinto, deduplicadas por CODUE+CODHAB.
//
// La diferencia de fondo con 1997: aquí CODUE puede venir VACÍO. Eso no es un dato que falte, es la
// afirmación de que ese hábitat NO es de interés comunitario —un seminatural, p. ej. un espartal—.
// Por eso `esHIC` es un booleano derivado y no una ausencia.
function habitatsAtlas(byCod, clave) {
  const rows = byCod.get(clave) || [];
  const seen = new Set(), out = [];
  for (const r of rows) {
    const hic = texto(r.CODUE);
    const key = (hic || '') + '|' + (r.CODHAB || '');
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      hic,                                  // código UE de 4 dígitos, o null si no es comunitario
      esHIC: Boolean(hic),
      cod_habitat: texto(r.CODHAB),
      // `concepto` se mantiene con este nombre porque merge-habitats.js lo consume.
      concepto: texto(r.NOM_HABITA),        // asociación fitosociológica
      nombre_comun: texto(r.NOM_COMUN),     // «Espartales manchegos sudorientales»
      generico: texto(r.GENERICO),          // «Espartales»
      descripcion: texto(r.DESCRIPCIO),     // descripción oficial del HIC (vacía en seminaturales)
      alianza: texto(r.ALIANZA),
      especies_alianza: texto(r.SPSALIANZA) ? texto(r.SPSALIANZA).split(/\s*,\s*/).filter(Boolean) : [],
      naturalidad: Number.isFinite(parseFloat(r.NATURALIDA)) ? Math.round(parseFloat(r.NATURALIDA)) : null,
      // Un hábitat seminatural nunca es prioritario: PRIORITARI viene vacío y eso es `false`,
      // no «desconocido».
      prioritario_fuente: texto(r.PRIORITARI) === '*',
      cobertura: parseFloat(r.PORCENTAJE) || 0,   // % del recinto que ocupa este hábitat
    });
  }
  return out;
}

// --- HIC 1997 (heredada) -----------------------------------------------------------------------
// Filas de Habi<NN> para un recinto, deduplicadas por HIC+código de hábitat.
// Aquí TODO recinto con atributos es de interés comunitario: la fuente solo cartografía el Anexo I.
function habitatsHic1997(byCod, codigo) {
  const rows = byCod.get(codigo) || [];
  const seen = new Set(), out = [];
  for (const r of rows) {
    const key = r.CODIGO_UE + '|' + r.CODHABITAT;
    if (seen.has(key)) continue;
    seen.add(key);
    const hic = texto(r.CODIGO_UE);
    out.push({
      hic,
      esHIC: Boolean(hic),
      cod_habitat: texto(r.CODHABITAT),
      concepto: limpiaConcepto(r.CONCEPTO),
      // Flag original de la fuente 1997: poco fiable, se conserva solo por trazabilidad.
      prioritario_fuente: r.PRIORITARI === '*',
      cobertura: parseFloat(r.COBERTURA) || 0,
    });
  }
  return out;
}

// El CONCEPTO trae marcas tipográficas (+ y $) alrededor de los sintaxones.
function limpiaConcepto(s) { return s ? String(s).replace(/[+$]/g, '').replace(/\s+/g, ' ').trim() : null; }

// Convierte los anillos de un recinto en MultiPolygon: exteriores (CW, área<0) con sus agujeros.
function recintoMultiPolygon(rings) {
  const outers = [], holes = [];
  for (const r of rings) (signedArea(r) < 0 ? outers : holes).push(r);
  return outers.map(o => {
    const poly = [o];
    for (const h of holes) if (h.some(p => inRing(p[0], p[1], o))) poly.push(h);
    return poly;
  });
}

try { main(); } catch (e) { die(e.stack || e.message); }
