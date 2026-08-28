#!/usr/bin/env node
'use strict';
/*
 * mide-niveles-puerta.js — reparto por niveles de la puerta del catálogo (regla nº 3 del CLAUDE.md)
 * sobre las fichas YA PUBLICADAS de los espacios completos.
 *
 * El problema que resuelve
 * -----------------------
 * La medición «cuántas fichas se sostienen en cada nivel» se ha hecho ya dos veces y ninguna dejó
 * herramienta: la de la sesión 2026-08-16 (k) —la tabla de los 330 «solo GBIF»— vivió en un script
 * de sesión que no se versionó, y la de la (l) tuvo que reconstruirla desde cero para poder medir el
 * arreglo del Atlas. Es el mismo fallo que ya costó dos veces los umbrales de selección: una
 * calibración que vive solo en su informe se pierde con el informe. La medición se repetirá como
 * mínimo al regenerar cada espacio (deuda nº 24, paso 3); a partir de aquí, es este fichero.
 *
 * Qué mide, exactamente
 * ---------------------
 * Para cada ficha VISIBLE (`visible !== false`, que es lo que la app enseña) de cada espacio con
 * catálogo, el nivel de la puerta que la sostiene:
 *
 *   N1 · RESPALDO DOCUMENTAL — figura en el anexo normativo del espacio (verbatim o
 *        `nombreCorregido`) o en el formulario del sitio Red Natura 2000
 *        (`out/<slug>-rn2000-sitio.json`), cruzados con el puente de `lib/respaldo-sitio`:
 *        binomio + nombre aceptado en EIDOS del nombre DE LA FUENTE (leído de la caché
 *        `out/<slug>-eidos-respaldo-cache.json`, sin salir a la red) + tabla de equivalencias.
 *   N2 · FIGURA LEGAL O ATLAS — el texto ya escrito de la ficha declara una figura de protección
 *        (`lib/rareza`, tramo > 1 en `spainStatus` o `regionalStatus`), o la especie es
 *        característica de algún HIC del espacio según el Atlas (`lib/atlas`, cruce por binomio).
 *   N3 · SOLO GBIF — nada de lo anterior.
 *
 * El aviso que hay que tener delante: la figura legal se lee del TEXTO de la ficha, no de EIDOS en
 * vivo, así que los totales pueden divergir de una medición con red (la de la sesión (k) consultaba
 * EIDOS). El valor de esta herramienta es el DELTA con criterio constante: mismo criterio antes y
 * después de tocar una fuente, y lo que se mueve es efecto de lo tocado. Y el cruce con el Atlas va
 * por binomio, que no puentea cambios de género: el esparto (*Stipa* ↔ *Macrochloa*) no casa hasta
 * que se pague la deuda nº 26.
 *
 * Solo lectura, sin red, idempotente: no escribe nada salvo el `--json` que se le pida.
 *
 * Uso:
 *   node Tools/catalogo-nacional/mide-niveles-puerta.js [--atlas <atlas.txt>] [--park <slug>]
 *        [--detalle] [--json <ruta>]
 *
 *   --atlas    texto del Atlas (por defecto fuentes/atlas.txt). Sin él no hay señal
 *              `caracteristica` y se avisa, en vez de callarlo.
 *   --park     limita la medición a un espacio.
 *   --detalle  lista las fichas de cada nivel (con --park se lee mejor).
 *   --json     vuelca el resultado completo para comparar dos mediciones a máquina.
 */

const fs = require('fs');
const path = require('path');
const { arg, flag } = require('../lib/cli');
const { CATALOGO_DIR, readJson, writeJson, rel, fromRoot, parkFiles } = require('../lib/io');
const { especiesCaracteristicas, binomio, puenteDesdeCache } = require('../lib/atlas');
const { tramoDeTexto } = require('../lib/rareza');
const respaldo = require('../lib/respaldo-sitio');

const OUT_DIR = path.join(CATALOGO_DIR, 'out');
const RUTA_ATLAS = fromRoot(arg('atlas', path.join(CATALOGO_DIR, 'fuentes', 'atlas.txt')));
const SOLO_PARK = arg('park', null);
const DETALLE = flag('detalle');
const RUTA_JSON = arg('json') ? fromRoot(arg('json')) : null;

const hayAtlas = fs.existsSync(RUTA_ATLAS);
if (!hayAtlas) {
  process.stderr.write(`⚠ sin texto del Atlas en ${rel(RUTA_ATLAS)}: la señal \`caracteristica\` ` +
    'queda fuera de la medición (la receta para generarlo está en la cabecera de Tools/lib/atlas.js).\n');
}

// El puente de nomenclatura del Atlas (deuda nº 26), LEÍDO de la caché que deja `species:seleccion`.
// Aquí no se sale a la red: esta herramienta es offline por diseño y su valor es el delta con
// criterio constante. Sin caché la medición sale igual, con el sesgo de antes — y dicho, que es la
// diferencia entre un hueco conocido y uno que nadie ve.
const RUTA_PUENTE = fromRoot(arg('cache-atlas', path.join(OUT_DIR, 'atlas-eidos-nombres-cache.json')));
const puenteAtlas = puenteDesdeCache(fs.existsSync(RUTA_PUENTE) ? readJson(RUTA_PUENTE) : {});
if (hayAtlas && !puenteAtlas.size) {
  process.stderr.write(`⚠ sin caché del puente de nomenclatura del Atlas en ${rel(RUTA_PUENTE)}: ` +
    'el esparto y los demás cambios de género no casarán y el N3 saldrá inflado. La genera ' +
    '`npm run species:seleccion` con --atlas.\n');
}

const anexos = readJson(path.join(CATALOGO_DIR, 'data', 'anexos-normativos.json'));
const { mapa: equivalencias } = respaldo.cargaEquivalencias();

const resultado = { criterio: 'visible !== false; N1 respaldo documental, N2 figura legal (texto) o Atlas, N3 resto', porParque: {}, total: { visibles: 0, n1: 0, n2: 0, n3: 0 } };

for (const p of parkFiles()) {
  if (SOLO_PARK && p.slug !== SOLO_PARK) continue;
  const park = readJson(p.file);
  if (!(park.species || []).length) continue; // ficha base sin catálogo: no hay nada que medir

  // El respaldo documental del espacio, indexado con el puente de nombres completo.
  const resueltas = new Map();
  const cacheF = path.join(OUT_DIR, `${p.slug}-eidos-respaldo-cache.json`);
  if (fs.existsSync(cacheF)) {
    for (const [n, r] of Object.entries(readJson(cacheF))) {
      if (n !== '_meta' && r && !r.error) resueltas.set(n, r);
    }
  }
  const entradas = [];
  for (const e of ((anexos.espacios || {})[p.slug] || {}).especies || []) {
    entradas.push({ scientificName: e.scientificName });
    if (e.nombreCorregido) entradas.push({ scientificName: e.nombreCorregido });
  }
  const sitioF = path.join(OUT_DIR, `${p.slug}-rn2000-sitio.json`);
  if (fs.existsSync(sitioF)) {
    for (const e of readJson(sitioF).especies || []) entradas.push({ scientificName: e.scientificName });
  }
  const idx = respaldo.indexa(entradas, { nombreDe: (e) => e.scientificName, resueltas, equivalencias });

  // Los binomios característicos de los HIC de ESTE espacio según el Atlas, con el puente de
  // nomenclatura tendido (deuda nº 26): el Atlas cita *Stipa tenacissima* y el catálogo ficha
  // *Macrochloa tenacissima*, y `binomio()` normaliza la desinencia pero no el género. El puente se
  // LEE de la caché que deja `species:seleccion` y NO se sale a la red: esta herramienta es offline
  // por diseño. Sin caché la medición sigue saliendo, con el mismo sesgo que tenía antes y dicho.
  const atlasBin = new Set();
  if (hayAtlas) {
    const hics = new Set((park.habitats || []).map((h) => h.code).filter(Boolean));
    const atlas = especiesCaracteristicas(RUTA_ATLAS, hics);
    for (const [, set] of atlas.porHic) {
      for (const n of set) {
        const b = binomio(n);
        if (!b) continue;
        atlasBin.add(b);
        const hoy = puenteAtlas.get(b);
        if (hoy) atlasBin.add(hoy);
      }
    }
  }

  const cuenta = { visibles: 0, n1: 0, n2: 0, n3: 0 };
  const detalle = { 1: [], 2: [], 3: [] };
  const conAtlas = [];
  for (const s of park.species || []) {
    if (s.visible === false) continue;
    cuenta.visibles++;
    let nivel;
    if (respaldo.busca(idx.mapa, { scientificName: s.scientificName, eidosTaxonId: s.eidosTaxonId })) {
      nivel = 1;
    } else {
      const legal = tramoDeTexto(s.spainStatus).tramo > 1 || tramoDeTexto(s.regionalStatus).tramo > 1;
      const carac = atlasBin.has(binomio(s.scientificName));
      if (carac) conAtlas.push(s.scientificName);
      nivel = (legal || carac) ? 2 : 3;
    }
    cuenta['n' + nivel]++;
    detalle[nivel].push(s.scientificName);
  }

  resultado.porParque[p.slug] = { ...cuenta, atlasSinN1: conAtlas };
  for (const k of Object.keys(resultado.total)) resultado.total[k] += cuenta[k];
  console.log(`${p.slug.padEnd(30)} ${String(cuenta.visibles).padStart(4)}  N1=${String(cuenta.n1).padStart(3)}  N2=${String(cuenta.n2).padStart(3)}  N3=${String(cuenta.n3).padStart(3)}`);
  if (DETALLE) for (const n of [1, 2, 3]) console.log(`  nivel ${n}: ${detalle[n].join(', ') || '—'}`);
}

const t = resultado.total;
console.log('─'.repeat(62));
console.log(`TOTAL${' '.repeat(25)} ${String(t.visibles).padStart(4)}  N1=${t.n1}  N2=${t.n2}  N3=${t.n3}`);
if (RUTA_JSON) { writeJson(RUTA_JSON, resultado); console.log('→ ' + rel(RUTA_JSON)); }
