#!/usr/bin/env node
'use strict';
/*
 * coteja-anexos-normativos.js — busca los nombres MAL TRANSCRITOS de `data/anexos-normativos.json` y
 * les pone su `nombreCorregido` verificado contra las autoridades.
 *
 * El problema que resuelve
 * -----------------------
 * Es la deuda nº 25. El anexo normativo se transcribe a mano con el documento delante —muchas veces
 * un PDF escaneado con OCR— y las erratas entran con él: «Lanius **senador**» por *senator*,
 * «**Croccidura** russula» por *Crocidura*, «**Hemydactilus turcitus**» por *Hemidactylus turcicus*,
 * «**Portetria** dispar» por *Porthetria*.
 *
 * Y NO fallan. El anexo es la puerta de nivel 1 del catálogo, y el cruce se hace por nombre: la
 * especie que el anexo enumera con una errata simplemente **no casa**, se cae de la selección y sale
 * con un motivo escrito al lado que es falso («no figura en el anexo normativo»). Es la trampa del §2
 * del CLAUDE.md, y aquí entra por la puerta de la transcripción en vez de por la de la nomenclatura.
 *
 * QUÉ SE CORRIGE Y QUÉ NO — el verbatim NO SE TOCA NUNCA
 * -----------------------------------------------------
 * `scientificName` es la transcripción literal de la norma y se queda como está: es la cita, y
 * cambiarla sería falsificar lo que dice el documento. La corrección va en `nombreCorregido`, que es
 * el campo que el `_esquema` del propio fichero reserva para esto y que la selección indexa JUNTO al
 * verbatim.
 *
 * La corrección tampoco se escribe de memoria (regla nº 2). El circuito es:
 *
 *   1. ¿EIDOS resuelve el verbatim? → no hay nada que corregir.
 *   2. Si no, se le pregunta a GBIF, cuyo backbone tolera erratas (`matchType: FUZZY`).
 *   3. La propuesta de GBIF se vuelve a resolver **contra EIDOS**, que es la autoridad del modelo. Si
 *      EIDOS tampoco la conoce, no se escribe nada.
 *
 * Y TRES GUARDAS, QUE ES LO QUE SEPARA CORREGIR DE INVENTAR
 * ---------------------------------------------------------
 * Lo que GBIF devuelve para un nombre que NO es una errata es un taxón DISTINTO, y escribirlo como
 * «nombre corregido» metería en el catálogo del espacio una especie que su norma no enumera. Las tres
 * guardas están detalladas en `esErrata()`, y las dos últimas se añadieron porque la primera sola
 * dejó pasar dos casos reales: «Iberis comosa subsp. hegelmaieri» → *Iberus cobosi*, que es un
 * **caracol**, y «Chaenorrhinum origanifolium subsp. Crassifolium» → la ESPECIE entera, sin la
 * subespecie. En corto: solo `matchType: FUZZY`, misma forma (una subespecie no se convierte en
 * especie) y distancia de edición corta palabra a palabra.
 *
 * Todo lo que no las pasa se ENUMERA para mirarlo con el documento delante, que es como manda hacerlo
 * la deuda.
 *
 * Idempotente: una entrada que ya tiene `nombreCorregido` no se vuelve a mirar. Sin `--write` no
 * toca nada.
 *
 * Uso:
 *     node Tools/catalogo-nacional/coteja-anexos-normativos.js [--park <slug>] [--write]
 *                                                              [--distancia 3]
 */

const fs = require('fs');
const path = require('path');
const { arg, num, flag, sleep } = require('../lib/cli');
const { CATALOGO_DIR, OUT_DIR, readJson, readJsonIf, writeJson, rel, fromRoot } = require('../lib/io');
const eidos = require('../lib/eidos');
const gbif = require('../lib/gbif');

const PARK = arg('park', null);
const WRITE = flag('write');
// Distancia de edición máxima POR PALABRA del binomio. 3 cubre las erratas medidas
// (senador/senator = 2, Croccidura/Crocidura = 1, turcitus/turcicus = 2) y deja fuera los cambios de
// taxón, que están mucho más lejos.
const MAX_DIST = Math.max(1, num('distancia', 3));

const RUTA = fromRoot(arg('anexos', path.join(CATALOGO_DIR, 'data', 'anexos-normativos.json')));
const CACHE = fromRoot(arg('cache', path.join(OUT_DIR, 'anexos-nombres-cache.json')));

/** Distancia de Levenshtein, iterativa y sin dependencias. */
function distancia(a, b) {
  a = String(a).toLowerCase(); b = String(b).toLowerCase();
  if (a === b) return 0;
  const fila = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let anterior = fila[0];
    fila[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = fila[j];
      fila[j] = Math.min(fila[j] + 1, fila[j - 1] + 1, anterior + (a[i - 1] === b[j - 1] ? 0 : 1));
      anterior = tmp;
    }
  }
  return fila[b.length];
}

/**
 * El nombre sin la cita de autoría. Las autoridades devuelven «Acacia retinodes Schltdl.» y
 * «Zodarion isabellinum (Simon, 1870)», y las 229 entradas que ya tenían `nombreCorregido` están
 * escritas sin autor. El campo se usa como CLAVE de cruce —normalizada por `binomio()`, que se queda
 * con las dos primeras palabras—, así que el autor no rompe nada, pero mezclar dos convenciones en el
 * mismo fichero sí invita a que la siguiente comparación se haga a pelo y falle.
 */
function sinAutoria(nombre) {
  const w = String(nombre).trim().split(/\s+/);
  if (w.length < 2) return String(nombre).trim();
  const infra = String(nombre).match(/\b(subsp\.|ssp\.|var\.)\s*([A-Za-zÁÉÍÓÚáéíóúñ-]+)/i);
  return `${w[0]} ${w[1]}` + (infra ? ` ${infra[1]} ${infra[2]}` : '');
}

/** ¿El nombre nombra una SUBESPECIE (o variedad)? Devuelve su epíteto, o `null`. */
function infraespecifico(nombre) {
  const m = String(nombre).match(/\b(?:subsp\.|ssp\.|var\.)\s*([A-Za-zÁÉÍÓÚáéíóúñ-]+)/i);
  if (m) return m[1].toLowerCase();
  // Trinomio sin conector: «Phalacrocorax carbo carbo».
  const w = String(nombre).trim().split(/\s+/).filter((x) => /^[a-záéíóúñ-]+$/i.test(x));
  return w.length >= 3 && /^[a-z]/.test(w[2]) ? w[2].toLowerCase() : null;
}

/**
 * ¿La propuesta es una ERRATA del verbatim, o es otro taxón?
 *
 * LAS TRES GUARDAS, Y LAS DOS ÚLTIMAS ESTÁN AQUÍ PORQUE LA PRIMERA SOLA NO BASTÓ
 * ------------------------------------------------------------------------------
 * La primera versión solo miraba la distancia de edición del binomio, y la pasada del 2026-08-25 (b)
 * enseñó en qué falla, con dos ejemplos que valen por todo el argumento:
 *
 *   · «Iberis comosa Willd. subsp. hegelmaieri» → *Iberus cobosi*, que es un **caracol terrestre**.
 *     *Iberis* → *Iberus* es UNA letra y *comosa* → *cobosi* son tres: pasa la distancia holgadamente
 *     y cambia de reino. Lo que lo delata es que GBIF respondió `HIGHERRANK`, o sea «no he sabido
 *     casar tu nombre, te doy un taxón de rango superior». Eso NUNCA es una corrección.
 *   · «Chaenorrhinum origanifolium subsp. Crassifolium» → *Chaenorhinum origanifolium*, que es la
 *     ESPECIE ENTERA. La propuesta se come la subespecie, y adoptarla afirmaría de la ficha algo más
 *     amplio de lo que dice la norma — que es exactamente el error que la deuda nº 27 documenta.
 *
 * Así que hacen falta las tres:
 *   1. `matchType: FUZZY`. Es la única respuesta de GBIF que significa «tu nombre está mal escrito y
 *      se parece a éste». `EXACT` quiere decir que el verbatim NO tenía errata, y `HIGHERRANK` que
 *      GBIF se rindió.
 *   2. Misma FORMA: si el verbatim nombra una subespecie, la propuesta también, y con su epíteto a
 *      distancia de errata. Si el verbatim es un binomio, la propuesta no puede añadir una.
 *   3. Distancia de edición corta palabra a palabra, que es lo que separa una errata de otro nombre.
 */
function esErrata(verbatim, propuesta, matchType) {
  if (matchType !== 'FUZZY') return false;

  const a = String(verbatim).trim().split(/\s+/).slice(0, 2);
  const b = String(propuesta).trim().split(/\s+/).slice(0, 2);
  if (a.length < 2 || b.length < 2) return false;

  const subA = infraespecifico(verbatim);
  const subB = infraespecifico(propuesta);
  if (Boolean(subA) !== Boolean(subB)) return false;
  if (subA && subB && distancia(subA, subB) > MAX_DIST) return false;

  const dg = distancia(a[0], b[0]);
  const de = distancia(a[1], b[1]);
  if (dg > MAX_DIST || de > MAX_DIST) return false;
  // Y que no sea un cambio limpio de género con el epíteto intacto: eso es una recombinación, y la
  // resuelve EIDOS sola al preguntar por el nombre del candidato.
  if (dg > 0 && de === 0 && dg > 2) return false;
  return dg + de + (subA && subB ? distancia(subA, subB) : 0) > 0;
}

const cache = readJsonIf(CACHE, {}) || {};
let pedidasEidos = 0, pedidasGbif = 0;

async function resuelveEidos(nombre) {
  const k = 'eidos:' + nombre;
  if (k in cache) return cache[k];
  cache[k] = null;
  try {
    const r = await eidos.resolveTaxon(nombre);
    if (r && r.status !== 'no-encontrada') cache[k] = { acceptedName: r.acceptedName || null, taxonid: r.taxonid || null };
  } catch (e) { delete cache[k]; throw e; }
  pedidasEidos++;
  await sleep(eidos.THROTTLE_MS);
  return cache[k];
}

async function proponeGbif(nombre) {
  const k = 'gbif:' + nombre;
  if (k in cache) return cache[k];
  cache[k] = null;
  try {
    const m = await gbif.matchName(nombre);
    if (m && m.status !== 'no-encontrada' && m.acceptedName && gbif.esRangoEspecifico(m.rank)) {
      cache[k] = { acceptedName: m.acceptedName, rank: m.rank, matchType: m.matchType };
    }
  } catch (e) { delete cache[k]; throw e; }
  pedidasGbif++;
  await sleep(200);
  return cache[k];
}

async function main() {
  const doc = readJson(RUTA);
  const espacios = Object.entries(doc.espacios || {}).filter(([slug]) => !PARK || slug === PARK);
  if (!espacios.length) { console.error(PARK ? `El anexo no tiene entrada para ${PARK}.` : 'El fichero no tiene espacios.'); process.exit(1); }

  const corregidas = [], aMano = [], sinPropuesta = [];
  let mirados = 0, yaTenian = 0;

  for (const [slug, entrada] of espacios) {
    for (const lista of ['especies', 'noNativas']) {
      for (const e of entrada[lista] || []) {
        if (!e || !e.scientificName) continue;
        if (e.nombreCorregido) { yaTenian++; continue; }
        mirados++;
        if (await resuelveEidos(e.scientificName)) continue; // la norma lo escribe bien

        const g = await proponeGbif(e.scientificName);
        if (!g) { sinPropuesta.push({ slug, lista, verbatim: e.scientificName }); continue; }

        // La propuesta de GBIF se vuelve a resolver contra EIDOS, que es la autoridad del modelo.
        const enEidos = await resuelveEidos(g.acceptedName);
        const nombre = sinAutoria((enEidos && enEidos.acceptedName) || g.acceptedName);
        const caso = { slug, lista, verbatim: e.scientificName, propuesta: nombre, gbif: g.acceptedName, matchType: g.matchType, enEidos: Boolean(enEidos) };

        if (!enEidos) { aMano.push({ ...caso, motivo: 'la propuesta de GBIF no está en EIDOS' }); continue; }
        if (!esErrata(e.scientificName, nombre, g.matchType)) {
          const porQue = g.matchType !== 'FUZZY'
            ? `GBIF respondió ${g.matchType}, que no es «tu nombre está mal escrito»`
            : `«${nombre}» no tiene forma de errata del verbatim`;
          aMano.push({ ...caso, motivo: porQue });
          continue;
        }
        corregidas.push(caso);
        if (WRITE) e.nombreCorregido = nombre;
      }
    }
  }

  fs.mkdirSync(path.dirname(CACHE), { recursive: true });
  writeJson(CACHE, cache);

  console.log(`${espacios.length} espacio(s) · ${mirados} nombre(s) mirados · ${yaTenian} ya tenían ` +
    `nombreCorregido · ${pedidasEidos} petición(es) a EIDOS y ${pedidasGbif} a GBIF`);

  console.log(`\n${corregidas.length} errata(s) con corrección verificada en GBIF **y** EIDOS:`);
  for (const c of corregidas) console.log(`  · [${c.slug}] «${c.verbatim}»  →  ${c.propuesta}  (GBIF: ${c.matchType})`);

  if (aMano.length) {
    console.log(`\n⚠ ${aMano.length} que NO se corrigen solas. Van con el documento delante:`);
    for (const c of aMano) console.log(`  · [${c.slug}] «${c.verbatim}» — ${c.motivo} (GBIF propone «${c.gbif}»)`);
  }
  if (sinPropuesta.length) {
    console.log(`\n${sinPropuesta.length} que ni EIDOS ni GBIF reconocen. Suelen ser taxones supraespecíficos ` +
      'que la norma enumera («Odonata», «Chiroptera») o nombres que hay que releer del PDF:');
    for (const c of sinPropuesta.slice(0, 40)) console.log(`  · [${c.slug}] «${c.verbatim}»`);
    if (sinPropuesta.length > 40) console.log(`  … y ${sinPropuesta.length - 40} más`);
  }

  if (WRITE && corregidas.length) {
    writeJson(RUTA, doc);
    console.log(`\n+ ${rel(RUTA)} (${corregidas.length} nombreCorregido escritos; el verbatim NO se toca)`);
    console.log('Regenera la selección de los espacios tocados para que el respaldo llegue a las fichas.');
  } else if (!WRITE) {
    console.log('\n(Simulación: nada escrito en el anexo. Añade --write.)');
  }
}

main().catch((e) => { console.error(e.message); process.exit(1); });
