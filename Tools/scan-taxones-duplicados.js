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

const nombres = new Set(fichas.map(f => f.sci));
console.log(`Fichas: ${fichas.length} · nombres científicos distintos: ${nombres.size}`);

const duplicados = taxonesDuplicados('eidos', 'eidosTaxonId')
                 + taxonesDuplicados('gbif', 'gbifSpeciesKey');
const incoherentes = identificadoresIncoherentes('eidos', 'eidosTaxonId')
                   + identificadoresIncoherentes('gbif', 'gbifSpeciesKey');

console.log(
  `\n${duplicados ? '✗' : '✓'} taxones duplicados: ${duplicados}` +
  ` · ${incoherentes ? '⚠' : '✓'} identificadores incoherentes: ${incoherentes}`
);
process.exit(duplicados + incoherentes ? 1 : 0);
