#!/usr/bin/env node
'use strict';
/*
 * completa-taxonomia.js — rellena los rangos que faltan en `taxonomy`, y NO toca los que ya están.
 *
 * El problema que resuelve
 * -----------------------
 * `PROCEDENCIA-DE-CAMPOS.md:44` dice que los seis rangos de `taxonomy` los manda **EIDOS**
 * (`v_taxonomia`), y `build-species-universal.js` los escribe al crear una ficha. Pero las fichas
 * que nacieron antes de que ese generador existiera —o que se crearon desde una fuente que no traía
 * el rango— se quedaron con huecos, y nada los rellenaba después.
 *
 * Medido el 2026-09-14 sobre las 1.058 del catálogo universal: **20 fichas sin `order` ni `family`**,
 * las veinte aves. Es el segundo bloque de la cola universal que dejó la auditoría del catálogo,
 * detrás de `iucnGlobal`.
 *
 * La regla: rellenar el hueco, nunca pisar el dato
 * -----------------------------------------------
 * Solo se escribe un rango que hoy está **vacío**. Si EIDOS dice otra cosa que la ficha en un rango
 * que ya tiene valor, **no se toca y se lista aparte**, porque eso no es un hueco: significa que el
 * `eidosTaxonId` de la ficha apunta a otro taxón, y entonces manda el hallazgo de nomenclatura
 * (`npm run taxones:nomenclatura`), que es donde se decide el anclaje. Pisarlo aquí sería adoptar en
 * silencio la taxonomía de un taxón que nadie ha comprobado que sea el suyo — el mismo error que
 * `lista-roja-mundial.js` evita con su guarda.
 *
 * Y como allí, un nombre que EIDOS da por **sinónimo** no se resuelve: es un renombrado, y se decide
 * en la deuda nº 36.
 *
 * Lo que NO hace
 * --------------
 * No escribe en los `park.json` ni en la BD: eso es `npm run species:apply`, que reparte el catálogo
 * universal y genera el SQL. Y `taxonomy` es campo UNIVERSAL, así que corregirlo en un `park.json`
 * no sirve de nada —el siguiente `species:apply` lo revierte— (trampa nº 4 del `CLAUDE.md`).
 *
 * Idempotente: un segundo pase no cambia un byte.
 *
 * Uso:
 *     node Tools/catalogo-nacional/completa-taxonomia.js            informe, sin escribir
 *     node Tools/catalogo-nacional/completa-taxonomia.js --write    lo escribe en el catálogo
 *       [--sin-cache]
 */

const fs = require('fs');
const path = require('path');
const { flag, sleep } = require('../lib/cli');
const { CATALOGO_DIR, OUT_DIR, readJson, writeJson, rel } = require('../lib/io');
const eidos = require('../lib/eidos');

const WRITE = flag('write');
const SIN_CACHE = flag('sin-cache');

const CATALOGO = path.join(CATALOGO_DIR, 'data', 'especies-universal.json');
const CACHE_FILE = path.join(OUT_DIR, 'completa-taxonomia-cache.json');

/*
 * Los seis rangos, con el nombre que les da cada lado. `ordertaxonomic` es el orden en `v_taxonomia`:
 * `order` es palabra reservada en SQL y la vista lo esquiva con otro nombre.
 */
const RANGOS = [
  ['kingdom', 'kingdom'], ['phylum', 'phylum'], ['class', 'class'],
  ['order', 'ordertaxonomic'], ['family', 'family'], ['genus', 'genus'],
];

const cargaCache = () => {
  if (SIN_CACHE || !fs.existsSync(CACHE_FILE)) return {};
  try { return readJson(CACHE_FILE); } catch (_) { return {}; }
};

(async () => {
  const catalogo = readJson(CATALOGO);
  const cache = cargaCache();
  let peticiones = 0;

  // Solo se pregunta por las fichas que tienen algún hueco: las demás no necesitan a EIDOS.
  const conHueco = Object.keys(catalogo).sort()
    .filter((sci) => RANGOS.some(([campo]) => !(catalogo[sci].taxonomy || {})[campo]));

  console.log(`Fichas del catálogo universal: ${Object.keys(catalogo).length}`);
  console.log(`Con algún rango vacío: ${conHueco.length}`);

  const rellenadas = [], desacuerdos = [], sinResolver = [], sinDato = [];

  for (const sci of conHueco) {
    const ficha = catalogo[sci];
    let entrada = cache[`sci:${sci}`];

    if (!entrada) {
      let taxonid = ficha.eidosTaxonId || null;
      let motivo = null;
      if (!taxonid) {
        const e = await eidos.resolveTaxon(sci, { agent: 'completa-taxonomia' });
        peticiones++;
        await sleep(eidos.THROTTLE_MS);
        if (e.status === 'no-encontrada') motivo = 'EIDOS no conoce este nombre';
        else if (e.status === 'sinonimo') motivo = `EIDOS lo da por sinónimo de «${e.acceptedName || '?'}»: se decide en la deuda nº 36, no aquí`;
        else taxonid = e.taxonid;
      }
      let fila = null;
      if (taxonid && !motivo) {
        const filas = await eidos.rows('v_taxonomia', [
          `taxonid=eq.${taxonid}`,
          'select=taxonid,kingdom,phylum,class,ordertaxonomic,family,genus',
        ], { agent: 'completa-taxonomia' });
        peticiones++;
        await sleep(eidos.THROTTLE_MS);
        fila = (filas || [])[0] || null;
      }
      entrada = { taxonid: taxonid || null, motivo, fila };
      cache[`sci:${sci}`] = entrada;
    }

    if (entrada.motivo) { sinResolver.push({ sci, motivo: entrada.motivo }); continue; }
    if (!entrada.fila) { sinDato.push({ sci, taxonid: entrada.taxonid }); continue; }

    const puestos = [];
    for (const [campo, enEidos] of RANGOS) {
      const valor = entrada.fila[enEidos];
      const actual = (ficha.taxonomy || {})[campo];
      if (!valor) continue;
      if (!actual) { puestos.push([campo, valor]); continue; }
      // Ya tiene valor: si discrepa, es un problema de ANCLAJE, no un hueco. Ni se toca ni se calla.
      if (String(actual).trim() !== String(valor).trim()) desacuerdos.push({ sci, campo, actual, eidos: valor });
    }
    if (puestos.length) rellenadas.push({ sci, puestos });
  }

  if (!SIN_CACHE && peticiones) writeJson(CACHE_FILE, cache);

  // --- Informe ---------------------------------------------------------------------------------

  console.log(`Peticiones nuevas a EIDOS: ${peticiones}${peticiones ? '' : ' (todo de la caché)'}`);
  console.log(`\nSe rellenarían ${rellenadas.length} ficha(s):`);
  for (const r of rellenadas) console.log(`  · ${r.sci}: ${r.puestos.map(([c, v]) => `${c}=${v}`).join(', ')}`);

  if (desacuerdos.length) {
    console.log(`\n⚠ ${desacuerdos.length} rango(s) donde EIDOS dice otra cosa que la ficha. NO se tocan:`);
    for (const d of desacuerdos) console.log(`  · ${d.sci} · ${d.campo}: ficha «${d.actual}» ≠ EIDOS «${d.eidos}»`);
    console.log('  Un desacuerdo de rango NO es un hueco: significa que el eidosTaxonId apunta a otro');
    console.log('  taxón. Se decide en `npm run taxones:nomenclatura`, no aquí.');
  }
  if (sinDato.length) {
    console.log(`\n${sinDato.length} ficha(s) con taxonid pero sin fila en v_taxonomia:`);
    for (const s of sinDato) console.log(`  · ${s.sci} (taxonid ${s.taxonid})`);
  }
  if (sinResolver.length) {
    console.log(`\nNo se ha podido preguntar por ${sinResolver.length} ficha(s):`);
    for (const s of sinResolver) console.log(`  · ${s.sci}: ${s.motivo}`);
  }

  if (!rellenadas.length) {
    console.log('\nNada que escribir: el catálogo ya está al día.');
    return;
  }
  if (WRITE) {
    for (const r of rellenadas) {
      catalogo[r.sci].taxonomy = catalogo[r.sci].taxonomy || {};
      for (const [campo, valor] of r.puestos) catalogo[r.sci].taxonomy[campo] = valor;
    }
    writeJson(CATALOGO, catalogo);
    console.log(`\n+ ${rel(CATALOGO)} (${rellenadas.length} ficha(s))`);
    console.log('Siguiente: `npm run species:apply` para repartirlo a los park.json y generar el SQL.');
  } else {
    console.log(`\nSimulación: ${rellenadas.length} ficha(s) cambiarían. Añade --write.`);
  }
})();
