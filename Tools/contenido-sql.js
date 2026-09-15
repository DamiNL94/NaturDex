#!/usr/bin/env node
'use strict';
/*
 * contenido-sql.js — lleva a un `.sql` el glosario y las invasoras que hoy solo están en el paquete.
 *
 * El problema que resuelve. Las dos tablas de contenido transversal —`glosario` y
 * `especies_invasoras`— viajan en dirección BD → JSON: `export-glossary.php` y
 * `export-invasoras.php` vuelcan la base a `Frontend/Data/`. No existía el camino de vuelta, y por
 * eso los términos que se fueron añadiendo desde el piloto nunca llegaron a la base desplegada: el
 * 2026-09-14 Railway servía **86 de los 219** términos y **25 de las 26** invasoras, con
 * `glossary.php` e `invasoras.php` respondiendo 200 y sirviendo lo viejo. No fallaba nada: la PWA
 * cae al fichero empaquetado cuando la API no trae el término, así que el hueco solo se ve si se
 * cuentan las filas de las dos puntas.
 *
 * El JSON es el espejo del `seed.sql` curado a mano —los 219 términos están en los dos—, así que
 * generar el SQL desde el JSON no inventa nada: repite lo que el repositorio ya afirma. Las
 * sentencias son `INSERT … ON DUPLICATE KEY UPDATE` sobre las claves únicas que declara
 * `schema.sql` (`glosario.term` y `especies_invasoras (scientific_name, ccaa)`), así que **no
 * borran**: una fila que solo esté en la base se queda. Retirar es otra operación y va aparte, como
 * con las fichas de especie.
 *
 * Uso:
 *   node Tools/contenido-sql.js            escribe Database/glosario.sql y Database/invasoras.sql
 *   node Tools/contenido-sql.js --glosario   solo uno de los dos
 */
const fs = require('fs');
const path = require('path');
const { ROOT, DATABASE } = require('./lib/io');
const { sqlStr, sqlStrOrNull, sqlNum } = require('./lib/sql');

const DATOS = path.join(ROOT, 'Frontend', 'Data');
const args = process.argv.slice(2);
const soloGlosario = args.includes('--glosario');
const soloInvasoras = args.includes('--invasoras');

/** Cabecera común: un fichero generado tiene que decir quién lo escribe y cómo se rehace. */
const cabecera = (titulo, filas, orden) => [
  '-- El juego de caracteres se fija SIEMPRE: el cliente `mysql` lo toma del entorno y en un',
  '-- contenedor sin locale eso es latin1, que convierte cada tilde en mojibake sin dar error.',
  'SET NAMES utf8mb4;',
  '',
  `-- ${titulo} (${filas} filas).`,
  '--',
  `-- GENERADO por Tools/contenido-sql.js. No editar a mano: regenerar con`,
  `--   ${orden}`,
  '--',
  '-- Idempotente y ADITIVO: `ON DUPLICATE KEY UPDATE` sobre la clave única de la tabla. No retira',
  '-- filas que solo estén en la base; para eso hace falta un borrado explícito.',
  '--',
  '-- Necesita una base seleccionada. Por la vía remota, `Tools/import-sql.php` conecta SIN base y',
  '-- la URL de Railway apunta a `railway`, así que hay que anteponerle `USE naturadex;`.',
  '',
].join('\n');

/**
 * Una lista de valores por fila, con el salto y la sangría que usa el resto de `Database/`.
 * NO cierra con `;`: detrás va el `ON DUPLICATE KEY UPDATE`, que es parte de la misma sentencia.
 * Cerrarla aquí partía el INSERT en dos y la segunda mitad era un error de sintaxis —y la vía
 * remota lo tragaba diciendo «OK · 2 sentencias ejecutadas» sin escribir una fila—.
 */
const filas = (lista, aValores) => lista.map(x => '  (' + aValores(x).join(', ') + ')').join(',\n');

function glosario() {
  const terminos = JSON.parse(fs.readFileSync(path.join(DATOS, 'glosario.json'), 'utf8'));
  const cols = ['term', 'definition', 'category', 'aliases', 'source'];
  const cuerpo = [
    cabecera('NaturDex · glosario divulgativo', terminos.length, 'node Tools/contenido-sql.js --glosario'),
    `INSERT INTO glosario (${cols.join(', ')}) VALUES`,
    filas(terminos, t => [
      sqlStr(t.term), sqlStr(t.definition), sqlStrOrNull(t.category),
      // `aliases` es columna JSON: va como texto JSON, igual que en seed.sql.
      t.aliases && t.aliases.length ? sqlStr(JSON.stringify(t.aliases)) : 'NULL',
      sqlStrOrNull(t.source),
    ]),
    'ON DUPLICATE KEY UPDATE',
    cols.filter(c => c !== 'term').map(c => `    ${c} = VALUES(${c})`).join(',\n') + ';',
    '',
    '-- Comprobación: debe decir el mismo número de términos que Frontend/Data/glosario.json.',
    'SELECT COUNT(*) AS terminos FROM glosario;',
    '',
  ].join('\n');
  const destino = path.join(DATABASE, 'glosario.sql');
  fs.writeFileSync(destino, cuerpo);
  console.log(`glosario: ${terminos.length} términos → ${path.relative(ROOT, destino)}`);
}

function invasoras() {
  const lista = JSON.parse(fs.readFileSync(path.join(DATOS, 'invasoras.json'), 'utf8'));
  const cols = ['scientific_name', 'common_name', 'taxon_group', 'kingdom', 'ccaa', 'description',
    'origin', 'habitat', 'impact', 'pathway', 'catalogo', 'eidos_taxonid', 'gbif_species_key',
    'gbif_occurrences', 'image_url', 'image_attribution', 'source'];
  const cuerpo = [
    cabecera('NaturDex · especies exóticas invasoras', lista.length, 'node Tools/contenido-sql.js --invasoras'),
    `INSERT INTO especies_invasoras (${cols.join(', ')}) VALUES`,
    filas(lista, e => [
      sqlStr(e.scientificName), sqlStrOrNull(e.commonName), sqlStrOrNull(e.group),
      sqlStr(e.kingdom || 'other'), sqlStr(e.ccaa),
      sqlStrOrNull(e.description), sqlStrOrNull(e.origin), sqlStrOrNull(e.habitat),
      sqlStrOrNull(e.impact), sqlStrOrNull(e.pathway), sqlStrOrNull(e.catalogo),
      sqlNum(e.eidosTaxonId), sqlNum(e.gbifSpeciesKey), sqlNum(e.gbifOccurrences),
      sqlStrOrNull(e.image), sqlStrOrNull(e.imageAttribution), sqlStrOrNull(e.source),
    ]),
    'ON DUPLICATE KEY UPDATE',
    cols.filter(c => c !== 'scientific_name' && c !== 'ccaa').map(c => `    ${c} = VALUES(${c})`).join(',\n') + ';',
    '',
    '-- Comprobación: debe decir el mismo número que Frontend/Data/invasoras.json.',
    'SELECT COUNT(*) AS invasoras FROM especies_invasoras;',
    '',
  ].join('\n');
  const destino = path.join(DATABASE, 'invasoras.sql');
  fs.writeFileSync(destino, cuerpo);
  console.log(`invasoras: ${lista.length} fichas → ${path.relative(ROOT, destino)}`);
}

if (!soloInvasoras) glosario();
if (!soloGlosario) invasoras();
