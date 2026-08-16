#!/usr/bin/env node
/*
 * scan-taxones-duplicados.js — el mismo taxón dado de alta con dos nombres científicos distintos.
 *
 * El problema que resuelve
 * -----------------------
 * `validate-park-data.js` y `sync-species-catalog.js` identifican una especie por su
 * `scientificName`. Es lo correcto para casi todo, pero deja un punto ciego: si el mismo taxón se
 * da de alta en un parque con el basónimo y en otro con el nombre aceptado, para esas herramientas
 * son dos especies distintas y no hay nada que comparar. El catálogo universal genera DOS fichas
 * (con foto y texto que derivan por separado) y los contadores nacionales cuentan dos especies
 * donde hay una.
 *
 * Pasó con el esparto: Cabo Cope lo tenía como *Stipa tenacissima* y Sierra Espuña y Cuatro Calas
 * como *Macrochloa tenacissima*, los dos con `eidosTaxonId` 27376.
 *
 * Este script agrupa las fichas por identificador externo en vez de por nombre, que es lo único
 * que delata el caso. Comprueba las dos direcciones:
 *
 *   - un identificador con varios nombres  → el mismo taxón duplicado (el caso del esparto);
 *   - un nombre con varios identificadores → un id mal copiado en algún parque.
 *
 * EL PUNTO CIEGO DE LAS DOS, y la tercera pasada
 * ----------------------------------------------
 * Las dos comprobaciones anteriores dan por hecho que un taxón duplicado comparte al menos un
 * identificador. Cuando las dos autoridades mantienen las DOS entradas como válidas, no comparte
 * ninguno y el duplicado pasa con los papeles en regla.
 *
 * Pasó con la curruca rabilarga: `Curruca undata` (EIDOS 80931, GBIF 10355796) en tres espacios y
 * `Sylvia undata` (EIDOS 80230 —que es *Sylvia undata undata*, la subespecie nominal—, GBIF
 * 2492949) en otros cuatro. Cuatro identificadores distintos para una sola ave, y ni un solo aviso.
 *
 * Así que hay una tercera pasada, por EPÍTETO ESPECÍFICO compartido con género distinto. Es una
 * SOSPECHA y no un veredicto —*Calandrella brachydactyla* (terrera) y *Certhia brachydactyla*
 * (agateador) comparten epíteto y no tienen nada que ver—, así que no hace fallar la comprobación:
 * enumera para que alguien mire. En el catálogo de hoy propone siete pares y solo uno era duplicado,
 * que es exactamente la proporción que hace falta para que mirarlos sea barato y no mirarlos caro.
 *
 * Uso
 * ---
 *   node Tools/scan-taxones-duplicados.js        Sale con código 1 si encuentra algo.
 */
'use strict';

const fs = require('fs');
const path = require('path');

// El recorrido de los park.json en disco vive en Tools/lib/io.js (`parkFiles`).
const { parkFiles } = require('./lib/io');

const fichas = [];
for (const { slug, file } of parkFiles()) {
  for (const sp of (JSON.parse(fs.readFileSync(file, 'utf8')).species || [])) {
    fichas.push({
      slug,
      sci: sp.scientificName,
      comun: sp.commonName,
      eidos: sp.eidosTaxonId,
      gbif: sp.gbifSpeciesKey,
      familia: (sp.taxonomy || {}).family || null,
      clase: (sp.taxonomy || {}).class || null,
    });
  }
}

// Un identificador que aparece bajo más de un nombre científico: el mismo taxón, dos fichas.
function taxonesDuplicados(campo, etiqueta) {
  const porId = new Map();
  for (const f of fichas) {
    if (f[campo] === null || f[campo] === undefined) continue;
    if (!porId.has(f[campo])) porId.set(f[campo], []);
    porId.get(f[campo]).push(f);
  }

  const casos = [...porId].filter(([, fs_]) => new Set(fs_.map(f => f.sci)).size > 1);
  console.log(`\n${etiqueta} con más de un nombre científico: ${casos.length}`);
  for (const [id, fs_] of casos) {
    console.log(`  · ${etiqueta} ${id}`);
    for (const f of fs_) console.log(`      ${f.slug}: ${f.sci} («${f.comun}»)`);
  }
  return casos.length;
}

// El caso inverso: un nombre con dos identificadores. No es un duplicado, es un id equivocado.
function identificadoresIncoherentes(campo, etiqueta) {
  const porNombre = new Map();
  for (const f of fichas) {
    if (f[campo] === null || f[campo] === undefined) continue;
    if (!porNombre.has(f.sci)) porNombre.set(f.sci, new Map());
    porNombre.get(f.sci).set(f[campo], f.slug);
  }

  const casos = [...porNombre].filter(([, ids]) => ids.size > 1);
  console.log(`\nNombres científicos con más de un ${etiqueta}: ${casos.length}`);
  for (const [sci, ids] of casos) {
    console.log(`  · ${sci} → ${[...ids].map(([id, slug]) => `${id} (${slug})`).join(' / ')}`);
  }
  return casos.length;
}

/*
 * Tercera pasada: mismo epíteto específico, distinto género. Ningún identificador los une, así que
 * es lo único que puede delatar un taxón partido en dos por un cambio de género. NO cuenta para el
 * código de salida: la mayoría de los pares que encuentra son especies distintas de verdad.
 */
function sospechasPorEpiteto() {
  const epiteto = (sci) => {
    const w = String(sci).trim().split(/\s+/);
    if (w.length < 2) return null;
    // Se normaliza la terminación de género, para que «torquatus» y «torquata» sean el mismo epíteto.
    return w[1].toLowerCase().replace(/[^a-záéíóúü-]/g, '').replace(/(us|um|a|os|as|is|e)$/, '');
  };
  /*
   * Se agrupa por epíteto Y FAMILIA, no por epíteto a secas. Un cambio de género se queda dentro de
   * su familia —*Sylvia*→*Curruca* son las dos Sylviidae, *Larus*→*Chroicocephalus* las dos
   * Laridae—, mientras que casi todo el ruido lo produce el epíteto compartido entre familias, y a
   * menudo entre reinos: *Larus fuscus* (gaviota) y *Ophrys fusca* (orquídea). Sin este acotado la
   * pasada saca 54 pares sobre el catálogo de hoy, que nadie va a mirar; con él, siete.
   */
  const porEpiteto = new Map();
  for (const f of fichas) {
    const e = epiteto(f.sci);
    if (!e) continue;
    const clave = e + ' · ' + (f.familia || f.clase || '?');
    if (!porEpiteto.has(clave)) porEpiteto.set(clave, new Map());
    if (!porEpiteto.get(clave).has(f.sci)) porEpiteto.get(clave).set(f.sci, f);
  }
  const casos = [...porEpiteto].filter(([, porNombre]) =>
    porNombre.size > 1 && new Set([...porNombre.keys()].map(n => n.split(/\s+/)[0])).size > 1);
  console.log(`\nMismo epíteto y distinto género (SOSPECHA, hay que mirarlos): ${casos.length}`);
  for (const [ep, porNombre] of casos) {
    console.log(`  · «${ep}»`);
    for (const [sci, f] of porNombre) {
      console.log(`      ${sci} («${f.comun}») eidos:${f.eidos} gbif:${f.gbif}`);
    }
  }
  if (casos.length) {
    console.log('  Si dos de estos son el mismo taxón, la equivalencia va a');
    console.log('  Tools/catalogo-nacional/data/equivalencias-nomenclatura.json, no solo a la ficha:');
    console.log('  una corrección que vive en el dato la deshace la siguiente regeneración.');
  }
  return casos.length;
}

const nombres = new Set(fichas.map(f => f.sci));
console.log(`Fichas: ${fichas.length} · nombres científicos distintos: ${nombres.size}`);

const duplicados = taxonesDuplicados('eidos', 'eidosTaxonId')
                 + taxonesDuplicados('gbif', 'gbifSpeciesKey');
const incoherentes = identificadoresIncoherentes('eidos', 'eidosTaxonId')
                   + identificadoresIncoherentes('gbif', 'gbifSpeciesKey');
const sospechas = sospechasPorEpiteto();

console.log(
  `\n${duplicados ? '✗' : '✓'} taxones duplicados: ${duplicados}` +
  ` · ${incoherentes ? '⚠' : '✓'} identificadores incoherentes: ${incoherentes}` +
  ` · ${sospechas} sospecha(s) por epíteto (no bloquean)`
);
process.exit(duplicados + incoherentes ? 1 : 0);
