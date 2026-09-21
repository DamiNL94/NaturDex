#!/usr/bin/env node
/*
 * build-park-sql.js — vuelca el N2 completo de un espacio (`park.json` + `habitats.geojson`) a SQL.
 *
 * Por qué existe
 * --------------
 * `Frontend/Js/data.js` da PRIORIDAD a la respuesta de la API sobre el `park.json` empaquetado. Con
 * backend desplegado, un espacio que no esté en la base de datos **no existe para el usuario** por
 * mucho que su ficha esté perfecta en el repositorio. Y sin fila en `parks` no se puede cargar nada
 * más: ni hábitats, ni especies, ni puntos de interés.
 *
 * Hasta ahora ese volcado se hacía con scripts de sesión que no quedaban en el repositorio
 * (`cuatro-calas-n2.sql` y `sierra-espuna-n2.sql` salieron así, ver Docs/rollout/sesiones/), y el
 * cierre del 2026-08-10 (c) lo dejó anotado como lo que bloqueaba a Carrascoy: «no existe generador
 * de SQL por espacio». Esto es ese generador.
 *
 * Qué escribe, en el orden en que hay que aplicarlo
 * ------------------------------------------------
 *   1. `parks`            — una fila. Sin ella, todo lo demás carga CERO filas EN SILENCIO.
 *   2. `habitats`         — con su `geometry` sacada de `geo/habitats.geojson` (casada por slug).
 *   3. `species`          — la ficha completa, incluidas las claves maestras de reconciliación.
 *   4. `species_habitats` — el vínculo, resuelto por nombre científico y slug de hábitat.
 *
 * El mapeo columna ↔ campo del `park.json` vive en `Tools/lib/filas-bd.js`, compartido con
 * `build-poi-sql.js` y con `coteja-ida-y-vuelta.js`, que comprueba —valor a valor, no solo clave a
 * clave— que es el inverso de `Backend/Lib/park_payload.php`, la única definición de la forma del
 * JSON de un parque. Si allí cambia un nombre de columna, cambia en filas-bd.js.
 *
 * LA EVIDENCIA DEL VÍNCULO ESPECIE↔HÁBITAT
 * ----------------------------------------
 * Es la regla nº 1 de CLAUDE.md: el enlace es SIEMPRE derivado y hay que guardar de dónde sale. El
 * problema es que el `park.json` empaquetado **no lleva la evidencia por enlace** —vive en
 * `out/<slug>-gbif.json`, que no se versiona—, así que no se puede copiar sin más.
 *
 * Lo que sí se puede hacer, y es lo que se hace, es LEER lo que la propia ficha declara: el `source`
 * de cada especie con enlaces dice «GBIF: N ocurrencias dentro de los polígonos de hábitat del
 * espacio (K hábitats; barrido de …)». Se comprueba que esa K coincide con el número de hábitats
 * enlazados; si coincide para todas, cada enlace está respaldado por GBIF y se escribe
 * `evidence = 'observada_gbif'`. Si en algún espacio NO coincidiera, esas especies salen con
 * `evidence` a NULL y avisando por consola, porque rellenarlas sería inventar la procedencia.
 *
 * Hay una segunda procedencia, y no pasa por GBIF: los enlaces que afirma el **Atlas de Hábitats**
 * («esta especie es característica de este HIC»), que se leen de `out/<slug>-hic-especies.json` y se
 * escriben `evidence = 'caracteristica'`. Esos NO necesitan ocurrencia detrás —es la evidencia
 * fuerte, no la débil— y se reconocen enlace a enlace, no por especie: una misma ficha puede tener
 * unos de GBIF y otros del Atlas, y antes esa mezcla descuadraba la cuenta de arriba y mandaba la
 * ficha ENTERA a NULL, perdiendo la procedencia de los enlaces que GBIF sí respaldaba.
 *
 * `species_habitats.gbif_occurrences` —el recuento de UN polígono— se queda a NULL siempre: el
 * `park.json` guarda el total de la especie sumando todos sus polígonos, no el recuento de cada uno,
 * y repartir ese total sería un dato falso.
 *
 * Distinto es `species.gbif_occurrences`, que SÍ se vuelca desde el 2026-08-27: es ese total, la
 * huella del filtro de presencia, y no tenía columna — por eso la ida y vuelta por la API lo borraba
 * en silencio de 767 fichas (deuda nº 3). Igual que `habitats.origen`, el campo de procedencia de
 * cada recinto, que vive en el geojson y tampoco tenía dónde caer.
 *
 * Uso
 * ---
 *   node Tools/catalogo-nacional/build-park-sql.js --park <slug> [--out Database/<fichero>.sql]
 *
 * Sin `--out` escribe en `Database/<slug>-n2.sql`. Idempotente en los dos sentidos: dos pases dan el
 * mismo fichero, y el fichero aplicado dos veces deja la base de datos igual (`ON DUPLICATE KEY
 * UPDATE` sobre las claves únicas del esquema).
 */

'use strict';
const fs = require('fs');
const path = require('path');

const { DATABASE, FRONTEND, OUT_DIR, readJson, readJsonIf, rel, parkFiles } = require('../lib/io');
const { arg, die } = require('../lib/cli');
const { sqlStr, sqlStrOrNull, sqlNum, PISTAS_EN_JSON } = require('../lib/sql');
const { HABITAT, ESPECIE, literales, columnas, actualizables, contextoHabitats } = require('../lib/filas-bd');

const slug = arg('park', null);
if (!slug) die('falta --park <slug>');

const espacio = parkFiles().find(p => p.slug === slug);
if (!espacio) die(`no encuentro el espacio «${slug}» en Frontend/Data/parks/`);

const park = readJson(espacio.file);
const manifest = readJson(path.join(espacio.dir, 'manifest.json'));
const p = park.park;
const habitats = park.habitats || [];
const species = park.species || [];
const salida = arg('out', path.join(DATABASE, `${slug}-n2.sql`));

// --- Lo que el recinto lleva en el geojson y no en el park.json ------------------------------------
// La geometría —sin ella el mapa dibuja el círculo aproximado de latitude/longitude— y la PROCEDENCIA
// de cada recinto (`origen`, `fuentes`, `solo_curada`), que hasta el 2026-08-27 no tenía columna y la
// ida y vuelta por la API borraba (deuda nº 3). La lectura está en lib/filas-bd.js.
const geoRel = manifest.geo && manifest.geo.habitats;
const geo = geoRel ? readJsonIf(path.join(FRONTEND, geoRel)) : null;
const contextoDe = contextoHabitats(geo);

// --- Evidencia del vínculo (ver cabecera) ---------------------------------------------------------
// Los enlaces que afirma el Atlas se identifican uno a uno, y por eso van aparte: son `caracteristica`
// y NO tienen por qué tener una ocurrencia detrás. Sin esta lectura, una especie con enlaces de las
// dos procedencias descuadraba la cuenta de abajo y se iba ENTERA a NULL, perdiendo también la
// evidencia de los enlaces que GBIF sí respaldaba.
const atlasPorNombre = new Map();
{
  const f = path.join(OUT_DIR, `${slug}-hic-especies.json`);
  const doc = readJsonIf(f);
  for (const l of (doc && doc.links) || []) {
    if (!atlasPorNombre.has(l.scientific_name)) atlasPorNombre.set(l.scientific_name, new Set());
    atlasPorNombre.get(l.scientific_name).add(l.habitat_slug);
  }
}
const esDelAtlas = (nombre, habitat) => (atlasPorNombre.get(nombre) || new Set()).has(habitat);

const conEnlaces = species.filter(s => (s.habitatIds || []).length);
const sinRespaldo = new Set();
for (const s of conEnlaces) {
  // La K del `source` cuenta los hábitats que vio GBIF, y los del Atlas PUEDEN solaparse con ellos o
  // no: el Atlas da a *Cosentinia vellea* como característica del 8210 y GBIF además la registró
  // allí, mientras que a *Centaurea saxicola* la afirma solo el Atlas. Por eso la cuenta no es una
  // resta sino un intervalo: K tiene que caer entre «ningún enlace del Atlas lo vio GBIF» y «todos
  // los vio». Fuera de ahí, la ficha declara un número de hábitats que sus enlaces no explican, y esa
  // procedencia no se rellena a ojo.
  const nAtlas = s.habitatIds.filter(h => esDelAtlas(s.scientificName, h)).length;
  const m = /\((\d+) hábitats?;/.exec(s.source || '');
  const k = m ? Number(m[1]) : null;
  if (k === null || k > s.habitatIds.length || k < s.habitatIds.length - nAtlas) sinRespaldo.add(s.scientificName);
}
if (sinRespaldo.size) {
  console.log(`⚠ ${sinRespaldo.size} especie(s) cuyo \`source\` no respalda todos sus enlaces:`);
  for (const n of sinRespaldo) console.log(`   · ${n} → evidence NULL`);
}
const evidenciaDe = (nombre, habitat) =>
  esDelAtlas(nombre, habitat) ? sqlStr('caracteristica')
    : sinRespaldo.has(nombre) ? 'NULL'
      : sqlStr('observada_gbif');

// --- Bloques ---------------------------------------------------------------------------------------
const L = [];
const seccion = (titulo) => L.push('', '-- ' + '-'.repeat(96), `-- ${titulo}`, '-- ' + '-'.repeat(96));

L.push(`-- ${'='.repeat(96)}`);
L.push(`-- ${p.name} · N2 completo: espacio, hábitats, especies y vínculos.`);
L.push('--');
L.push(`-- GENERADO por Tools/catalogo-nacional/build-park-sql.js desde ${rel(espacio.file)}`);
L.push(`-- y ${geoRel || '(sin geojson de hábitats)'}. No editar a mano: regenerar con`);
L.push(`--   node Tools/catalogo-nacional/build-park-sql.js --park ${slug}`);
L.push('--');
L.push('-- Hace falta porque Frontend/Js/data.js da PRIORIDAD a la API sobre el park.json empaquetado:');
L.push('-- con backend desplegado, un espacio que no esté en la base de datos no existe para el usuario.');
L.push('--');
L.push(`-- Contenido: 1 espacio · ${habitats.length} hábitats · ${species.length} especies · ` +
       `${species.reduce((n, s) => n + (s.habitatIds || []).length, 0)} vínculos especie↔hábitat.`);
L.push('-- Los puntos de interés van aparte, en `n3-pois-<slug>.sql` (build-poi-sql.js).');
L.push('--');
L.push('-- ORDEN: la fila de `parks` va PRIMERO y no es opcional. Sin ella los INSERT ... SELECT de');
L.push('-- abajo no encuentran nada y cargan CERO filas sin dar ningún error.');
L.push('--');
L.push('-- Idempotente: ON DUPLICATE KEY UPDATE sobre las claves únicas del esquema. Aplicar con:');
L.push(`--   docker exec -i naturdex-db-1 sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql --default-character-set=utf8mb4 naturadex' < ${rel(salida)}`);
L.push(`-- ${'='.repeat(96)}`);
L.push('');
L.push('SET NAMES utf8mb4;');

// 1) El espacio ------------------------------------------------------------------------------------
seccion('1. El espacio. Sin esta fila, TODO lo demás carga cero filas en silencio.');
L.push('INSERT INTO parks (slug, name, category, region, province, municipality, description, latitude, longitude, status)');
L.push('VALUES (' + [
  sqlStr(p.slug), sqlStr(p.name), sqlStr(p.category), sqlStr(p.region), sqlStr(p.province),
  // `park_payload.php` reconstruye el array partiendo por " y ": se escribe con ese mismo separador.
  sqlStrOrNull((p.municipalities || []).join(' y ')),
  sqlStrOrNull(p.summary),
  sqlNum(p.center[0]), sqlNum(p.center[1]), sqlStr('available'),
].join(', ') + ')');
L.push('ON DUPLICATE KEY UPDATE');
L.push('    name = VALUES(name), category = VALUES(category), region = VALUES(region),');
L.push('    province = VALUES(province), municipality = VALUES(municipality),');
L.push('    description = VALUES(description), latitude = VALUES(latitude),');
L.push('    longitude = VALUES(longitude), status = VALUES(status);');

// 2) Hábitats --------------------------------------------------------------------------------------
seccion(`2. Hábitats (${habitats.length}). \`geometry\` sale del geojson; sin ella el mapa dibuja un círculo.`);
// Las columnas y su valor salen de lib/filas-bd.js; la lista del `ON DUPLICATE KEY UPDATE` también
// (todo menos las dos claves únicas, `slug` y `code`), para que no haya una tercera lista que olvidar.
const alias = (arr, primera) => arr.map((v, i) => v + (primera ? ' ' + primera[i] : '')).join(', ');
const COLS_H = columnas(HABITAT);
L.push('INSERT INTO habitats (park_id, ' + COLS_H.join(', ') + ')');
L.push('SELECT pk.id, ' + COLS_H.map(c => 'h.' + c).join(', '));
L.push('FROM parks pk JOIN (');
habitats.forEach((h, i) => {
  L.push('    SELECT ' + alias(literales(HABITAT, h, contextoDe(h.id)), i === 0 ? COLS_H : null));
  if (i < habitats.length - 1) L.push('    UNION ALL');
});
L.push(`) h WHERE pk.slug = ${sqlStr(slug)}`);
L.push('ON DUPLICATE KEY UPDATE');
L.push(actualizables(HABITAT).map(c => `    ${c} = VALUES(${c})`).join(',\n') + ';');

// 3) Especies --------------------------------------------------------------------------------------
// El comentario del SQL dice el formato que DE VERDAD lleva este fichero: con el interruptor apagado
// afirmar «array JSON» sería mentir en la cabecera de algo que se va a aplicar a la base.
seccion(`3. Especies (${species.length}). \`identification_tips\` va ${PISTAS_EN_JSON
  ? 'como array JSON: una pista puede llevar «;» (Backend/Lib/species_tips.php).'
  : 'unido con «; », el formato que lee el PHP desplegado. Pasa a array JSON cuando `PISTAS_EN_JSON` (Tools/lib/sql.js) se encienda, DESPUÉS de desplegar species_tips.php.'}`);
// Columna a columna, qué se escribe y por qué (los NULL que no son 0 ni FALSE, los `*_basis` como
// JSON…) está en lib/filas-bd.js, junto a la definición de cada una.
const COLS_S = columnas(ESPECIE);
L.push('INSERT INTO species (park_id, ' + COLS_S.join(', ') + ')');
L.push('SELECT pk.id, ' + COLS_S.map(c => 's.' + c).join(', '));
L.push('FROM parks pk JOIN (');
species.forEach((s, i) => {
  L.push('    SELECT ' + alias(literales(ESPECIE, s), i === 0 ? COLS_S : null));
  if (i < species.length - 1) L.push('    UNION ALL');
});
L.push(`) s WHERE pk.slug = ${sqlStr(slug)}`);
L.push('ON DUPLICATE KEY UPDATE');
L.push(actualizables(ESPECIE).map(c => `    ${c} = VALUES(${c})`).join(',\n') + ';');

// 4) Vínculos --------------------------------------------------------------------------------------
const pares = [];
for (const s of species) for (const h of s.habitatIds || []) pares.push([s.scientificName, h, evidenciaDe(s.scientificName, h)]);
seccion(`4. Vínculos especie↔hábitat (${pares.length}). \`evidence\` = lo que declara el \`source\` de cada ficha; ver cabecera.`);
if (!pares.length) {
  L.push('-- (ninguno)');
} else {
  L.push('INSERT INTO species_habitats (species_id, habitat_id, evidence)');
  L.push('SELECT sp.id, hb.id, v.evidence');
  L.push('FROM parks pk');
  L.push('JOIN (');
  pares.forEach(([sn, hs, ev], i) => {
    const primera = i === 0 ? [' scientific_name', ' habitat_slug', ' evidence'] : ['', '', ''];
    L.push('    SELECT ' + [sqlStr(sn) + primera[0], sqlStr(hs) + primera[1], ev + primera[2]].join(', '));
    if (i < pares.length - 1) L.push('    UNION ALL');
  });
  L.push(') v');
  L.push('JOIN species sp ON sp.park_id = pk.id AND sp.scientific_name = v.scientific_name');
  L.push('JOIN habitats hb ON hb.park_id = pk.id AND hb.slug = v.habitat_slug');
  L.push(`WHERE pk.slug = ${sqlStr(slug)}`);
  L.push('ON DUPLICATE KEY UPDATE evidence = VALUES(evidence);');
}

// 5) Comprobación ----------------------------------------------------------------------------------
seccion('5. Comprobación posterior. Debe devolver exactamente los recuentos de la cabecera.');
L.push('SELECT');
L.push(`    (SELECT COUNT(*) FROM parks WHERE slug = ${sqlStr(slug)}) AS espacio,`);
L.push(`    (SELECT COUNT(*) FROM habitats h JOIN parks p ON p.id = h.park_id WHERE p.slug = ${sqlStr(slug)}) AS habitats,`);
L.push(`    (SELECT COUNT(*) FROM species s JOIN parks p ON p.id = s.park_id WHERE p.slug = ${sqlStr(slug)}) AS especies,`);
L.push(`    (SELECT COUNT(*) FROM species_habitats sh JOIN species s ON s.id = sh.species_id JOIN parks p ON p.id = s.park_id WHERE p.slug = ${sqlStr(slug)}) AS vinculos;`);

fs.writeFileSync(salida, L.join('\n') + '\n', 'utf8');
const conGeo = habitats.filter(h => contextoDe(h.id).geometria).length;
console.log(`→ ${rel(salida)}`);
console.log(`   1 espacio · ${habitats.length} hábitats (${conGeo} con geometría) · ${species.length} especies · ${pares.length} vínculos`);
