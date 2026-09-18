#!/usr/bin/env node
'use strict';
/*
 * lista-roja-espana.js — rellena `iucnSpain` en el catálogo universal: la evaluación de la UICN de
 * ámbito ESPAÑA, que EIDOS lleva sirviendo desde el principio y que el pipeline tiraba.
 *
 * El problema que resuelve
 * -----------------------
 * `eidos.conservationByScope()` devuelve la evaluación **por ámbito** —`Mundial`, `España`,
 * `Península`, `Canarias`— y `build-species-universal.js` se quedaba **solo con `Mundial`**, que es
 * lo que escribe en `iucnGlobal`. La fila de ámbito España es la Lista Roja española, y no es un
 * matiz de la mundial: es otra evaluación, de otra autoridad y de otro año, y una especie puede ser
 * `LC` en el mundo y `NT` en España sin que ninguna de las dos esté equivocada.
 *
 * No era un hueco de fuente sino de **campo**: la ficha no tenía dónde escribirlo, y meterlo en
 * `iucnGlobal` habría mezclado dos ámbitos en la misma columna, que es exactamente el error que ya
 * pagó `spainStatus` con las normas de otras comunidades (deuda nº 5). El campo se abrió el
 * 2026-08-27 en las cinco puntas —`especies-universal.json`, `schema.sql` + migración,
 * `park_payload.php`, la ficha del frontend y el AdminPanel—; esto es lo que lo rellena en las
 * fichas que ya estaban escritas. Las nuevas nacen con él.
 *
 * Lo que NO hace
 * --------------
 * **No escribe «No evaluada» cuando la fuente calla.** Un taxón sin fila de ámbito España se queda
 * **sin el campo**, no con un valor que diga que no la hay: son dos afirmaciones distintas y solo
 * una está respaldada. Es la misma regla que aplica `lib/fenologia.js` con las aves y la que
 * `lib/uicn.js` deja escrita.
 *
 * **No toca `Península` ni `Canarias`.** Son evaluaciones subestatales y el catálogo no tiene un
 * campo con ese significado; escribirlas en el de España afirmaría un ámbito que la fuente no dice.
 * Se cuentan en el informe para que se sepa cuánto hay ahí esperando si algún día se abre su campo.
 *
 * **No escribe en los `park.json` ni en la BD.** Esto llena el catálogo universal; el reparto es
 * `npm run species:apply`, que además genera el `species-universal.sql`. Y ese SQL necesita la
 * columna: **antes hay que pasar `Database/migrations.sql`**.
 *
 * Cómo resuelve cada ficha, y por qué en ese orden
 * -----------------------------------------------
 *   1. `eidosTaxonId` de la ficha universal, cuando lo tiene (724 de 1.067). Es la clave estable: no
 *      depende de cómo se escriba el nombre y no puede resolver a otro taxón.
 *   2. Si no lo tiene, `resolveTaxon(nombre)`. Y aquí hay una guarda que no es decorativa: si EIDOS
 *      responde que el nombre es un **sinónimo**, se anota y **no se escribe nada**. El aceptado
 *      puede ser otro taxón —o el mismo con otro nombre—, y decidirlo es un renombrado, que es la
 *      deuda nº 36: adoptar su Lista Roja de paso sería colgar de la ficha un dato de un taxón que
 *      nadie ha comprobado que sea el suyo.
 *
 * La caché (`out/lista-roja-espana-cache.json`) evita repetir ~1.400 peticiones a un servicio
 * público cada vez que alguien quiera ver el informe. `--sin-cache` la ignora.
 *
 * Idempotente: un segundo pase no cambia un byte.
 *
 * Uso:
 *     node Tools/catalogo-nacional/lista-roja-espana.js                 informe, sin escribir
 *     node Tools/catalogo-nacional/lista-roja-espana.js --write         lo escribe en el catálogo
 *       [--sin-cache] [--limite N]
 */

const fs = require('fs');
const path = require('path');
const { flag, num, sleep } = require('../lib/cli');
const { CATALOGO_DIR, OUT_DIR, readJson, writeJson, rel } = require('../lib/io');
const eidos = require('../lib/eidos');
const { etiquetaUicn, codigoDe } = require('../lib/uicn');

const WRITE = flag('write');
const SIN_CACHE = flag('sin-cache');
const LIMITE = num('limite', 0);

const CATALOGO = path.join(CATALOGO_DIR, 'data', 'especies-universal.json');
const CACHE_FILE = path.join(OUT_DIR, 'lista-roja-espana-cache.json');

// --- Caché ----------------------------------------------------------------------------------------

function cargaCache() {
  if (SIN_CACHE || !fs.existsSync(CACHE_FILE)) return {};
  try { return readJson(CACHE_FILE); } catch (_) { return {}; }
}

// --- Principal ------------------------------------------------------------------------------------

(async () => {
  const catalogo = readJson(CATALOGO);
  const nombres = Object.keys(catalogo).sort();
  const cache = cargaCache();
  let peticiones = 0;

  const resultados = [];   // { sci, ambitos, etiqueta, motivo }
  let hechos = 0;

  for (const sci of nombres) {
    if (LIMITE && hechos >= LIMITE) break;
    hechos++;
    const ficha = catalogo[sci];
    // La clave de la caché lleva DENTRO el identificador con el que se va a resolver, y eso no es
    // un detalle de implementación: una entrada guarda a veces una NEGATIVA —«EIDOS lo da por
    // sinónimo… se decide en la deuda nº 36»— y esa negativa solo vale mientras la ficha no tenga
    // `eidosTaxonId`. El 2026-09-15 se rellenaron 329 identificadores del catálogo universal y las
    // seis fichas bloqueadas siguieron bloqueadas: la caché las contestaba por nombre antes de que
    // nadie mirase el id nuevo. Con el id en la clave, rellenarlo invalida la entrada él solo.
    const clave = ficha.eidosTaxonId ? `id:${ficha.eidosTaxonId}` : `sci:${sci}`;

    let entrada = cache[clave];
    if (!entrada) {
      let taxonid = ficha.eidosTaxonId || null;
      let motivo = null;

      if (!taxonid) {
        const e = await eidos.resolveTaxon(sci, { agent: 'lista-roja-espana' });
        peticiones++;
        await sleep(eidos.THROTTLE_MS);
        if (e.status === 'no-encontrada') motivo = 'EIDOS no conoce este nombre';
        else if (e.status === 'sinonimo') motivo = `EIDOS lo da por sinónimo de «${e.acceptedName || '?'}»: se decide en la deuda nº 36, no aquí`;
        else taxonid = e.taxonid;
      }

      let ambitos = {};
      if (taxonid && !motivo) {
        ambitos = await eidos.conservationByScope(taxonid, { agent: 'lista-roja-espana' });
        peticiones++;
        await sleep(eidos.THROTTLE_MS);
      }
      entrada = {
        taxonid: taxonid || null,
        motivo,
        // Solo se guarda lo que hace falta para reconstruir la etiqueta: la caché no es un espejo
        // de EIDOS, y guardar de más invita a leer de aquí cosas que no se han comprobado.
        ambitos: Object.fromEntries(Object.entries(ambitos).map(([k, v]) => [k, { categoriaconservacion: v.categoriaconservacion, anio: v.anio }])),
      };
      cache[clave] = entrada;
    }

    const etiqueta = entrada.motivo ? null : etiquetaUicn(entrada.ambitos, 'España');
    resultados.push({ sci, ambitos: entrada.ambitos || {}, etiqueta, motivo: entrada.motivo, taxonid: entrada.taxonid });

    if (hechos % 100 === 0) console.log(`  ${hechos}/${nombres.length}`);
  }

  if (!SIN_CACHE) writeJson(CACHE_FILE, cache);

  // --- Escritura ----------------------------------------------------------------------------------

  let escritas = 0, yaEstaban = 0, sinDato = 0;
  const porCategoria = new Map();
  const subestatales = [];
  const sinResolver = [];

  for (const r of resultados) {
    if (r.motivo) { sinResolver.push(r); continue; }
    // Lo que EIDOS tiene de Península o Canarias y este campo NO recoge, contado para que se sepa.
    if (!r.etiqueta && (r.ambitos.Península || r.ambitos.Canarias)) subestatales.push(r);
    if (!r.etiqueta) { sinDato++; continue; }
    const cod = codigoDe(r.etiqueta) || '??';
    porCategoria.set(cod, (porCategoria.get(cod) || 0) + 1);
    if (catalogo[r.sci].iucnSpain === r.etiqueta) { yaEstaban++; continue; }
    catalogo[r.sci].iucnSpain = r.etiqueta;
    escritas++;
  }

  // --- Informe ------------------------------------------------------------------------------------

  console.log(`\nFichas del catálogo universal: ${nombres.length}${LIMITE ? ` (limitado a ${hechos})` : ''}`);
  console.log(`Peticiones nuevas a EIDOS: ${peticiones}; el resto, de ${rel(CACHE_FILE)}`);
  console.log(`\nCon evaluación de ámbito España: ${escritas + yaEstaban} (${escritas} nuevas, ${yaEstaban} ya escritas)`);
  const orden = ['EX', 'EW', 'CR', 'EN', 'VU', 'NT', 'LC', 'DD', 'NE'];
  for (const cod of orden) if (porCategoria.get(cod)) console.log(`  · ${cod}: ${porCategoria.get(cod)}`);
  for (const [cod, n] of porCategoria) if (!orden.includes(cod)) console.log(`  · ${cod} (categoría no prevista): ${n}`);

  console.log(`\nSin fila de ámbito España en EIDOS: ${sinDato} — se quedan SIN el campo, que no es lo mismo que «no evaluada»`);
  if (subestatales.length) {
    console.log(`  De ésas, ${subestatales.length} sí tienen Península o Canarias, que este campo NO recoge:`);
    for (const r of subestatales.slice(0, 10)) {
      const d = ['Península', 'Canarias'].filter(a => r.ambitos[a]).map(a => `${a}=${r.ambitos[a].categoriaconservacion}`).join(', ');
      console.log(`    · ${r.sci}: ${d}`);
    }
    if (subestatales.length > 10) console.log(`    … y ${subestatales.length - 10} más`);
  }

  if (sinResolver.length) {
    console.log(`\nNo se ha podido preguntar por ${sinResolver.length} ficha(s):`);
    for (const r of sinResolver.slice(0, 15)) console.log(`  · ${r.sci}: ${r.motivo}`);
    if (sinResolver.length > 15) console.log(`  … y ${sinResolver.length - 15} más`);
  }

  if (!escritas) {
    console.log('\nNada que escribir: el catálogo ya está al día.');
    return;
  }
  if (WRITE) {
    writeJson(CATALOGO, catalogo);
    console.log(`\n+ ${rel(CATALOGO)} (${escritas} ficha(s))`);
    console.log('Siguiente: `npm run species:apply` para repartirlo a los park.json y generar el SQL,');
    console.log('y ANTES de aplicar ese SQL, `Database/migrations.sql` — la columna `iucn_spain` es nueva.');
  } else {
    console.log(`\nSimulación: ${escritas} ficha(s) cambiarían. Añade --write.`);
  }
})();
