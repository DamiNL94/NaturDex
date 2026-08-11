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
 * El mapeo de campos es el inverso EXACTO de `Backend/Lib/park_payload.php`, que es la única
 * definición de la forma del JSON de un parque. Si allí cambia un nombre de columna, cambia aquí.
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
 * `gbif_occurrences` se queda a NULL siempre: el `park.json` guarda el total de la especie sumando
 * todos sus polígonos, no el recuento de cada uno, y repartir ese total sería un dato falso.
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

const { DATABASE, FRONTEND, readJson, readJsonIf, rel, parkFiles } = require('../lib/io');
const { arg, die } = require('../lib/cli');
const { sqlStr, sqlStrOrNull, sqlNum, sqlBool, sqlJson } = require('../lib/sql');

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

// --- Geometría de los hábitats -------------------------------------------------------------------
// Vive en el geojson, no en el park.json. Es la columna que hace que el mapa dibuje el polígono real
// en vez del círculo aproximado de latitude/longitude.
const geoRel = manifest.geo && manifest.geo.habitats;
const geo = geoRel ? readJsonIf(path.join(FRONTEND, geoRel)) : null;
const geometriaPorSlug = new Map();
for (const f of (geo && geo.features) || []) {
  const s = f.properties && f.properties.slug;
  if (s && f.geometry) geometriaPorSlug.set(s, f.geometry);
}

// --- Evidencia del vínculo (ver cabecera) ---------------------------------------------------------
const conEnlaces = species.filter(s => (s.habitatIds || []).length);
const sinRespaldo = new Set();
for (const s of conEnlaces) {
  const m = /\((\d+) hábitats?;/.exec(s.source || '');
  if (!m || Number(m[1]) !== s.habitatIds.length) sinRespaldo.add(s.scientificName);
}
if (sinRespaldo.size) {
  console.log(`⚠ ${sinRespaldo.size} especie(s) cuyo \`source\` no respalda todos sus enlaces:`);
  for (const n of sinRespaldo) console.log(`   · ${n} → evidence NULL`);
}
const evidenciaDe = nombre => (sinRespaldo.has(nombre) ? 'NULL' : sqlStr('observada_gbif'));

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
L.push('INSERT INTO habitats (park_id, slug, code, name, habitat_type, description, is_priority, latitude, longitude, color, geometry, review_note, hic_subtipos, fitosociologia, audio_url, audio_transcript, image_url, image_attribution, image_note)');
L.push('SELECT pk.id, h.slug, h.code, h.name, h.habitat_type, h.description, h.is_priority, h.latitude, h.longitude, h.color, h.geometry, h.review_note, h.hic_subtipos, h.fitosociologia, h.audio_url, h.audio_transcript, h.image_url, h.image_attribution, h.image_note');
L.push('FROM parks pk JOIN (');
const alias = (arr, primera) => arr.map((v, i) => v + (primera ? ' ' + primera[i] : '')).join(', ');
const COLS_H = ['slug', 'code', 'name', 'habitat_type', 'description', 'is_priority', 'latitude', 'longitude', 'color', 'geometry', 'review_note', 'hic_subtipos', 'fitosociologia', 'audio_url', 'audio_transcript', 'image_url', 'image_attribution', 'image_note'];
habitats.forEach((h, i) => {
  const v = [
    sqlStr(h.id), sqlStrOrNull(h.code), sqlStr(h.name), sqlStrOrNull(h.type), sqlStrOrNull(h.description),
    sqlBool(h.priority),
    sqlNum(h.coordinates && h.coordinates[0]), sqlNum(h.coordinates && h.coordinates[1]),
    sqlStrOrNull(h.color),
    geometriaPorSlug.has(h.id) ? sqlJson(geometriaPorSlug.get(h.id)) : 'NULL',
    sqlStrOrNull(h.reviewNote), sqlJson(h.hicSubtipos), sqlJson(h.fitosociologia),
    sqlStrOrNull(h.audio), sqlStrOrNull(h.audioTranscript),
    sqlStrOrNull(h.image), sqlStrOrNull(h.imageAttribution), sqlStrOrNull(h.imageNote),
  ];
  L.push('    SELECT ' + alias(v, i === 0 ? COLS_H : null) + (i < habitats.length - 1 ? '' : ''));
  if (i < habitats.length - 1) L.push('    UNION ALL');
});
L.push(`) h WHERE pk.slug = ${sqlStr(slug)}`);
L.push('ON DUPLICATE KEY UPDATE');
L.push('    name = VALUES(name), habitat_type = VALUES(habitat_type), description = VALUES(description),');
L.push('    is_priority = VALUES(is_priority), latitude = VALUES(latitude), longitude = VALUES(longitude),');
L.push('    color = VALUES(color), geometry = VALUES(geometry), review_note = VALUES(review_note),');
L.push('    hic_subtipos = VALUES(hic_subtipos), fitosociologia = VALUES(fitosociologia),');
L.push('    audio_url = VALUES(audio_url), audio_transcript = VALUES(audio_transcript),');
L.push('    image_url = VALUES(image_url), image_attribution = VALUES(image_attribution),');
L.push('    image_note = VALUES(image_note);');

// 3) Especies --------------------------------------------------------------------------------------
seccion(`3. Especies (${species.length}). \`identification_tips\` va como texto separado por «; », que es como lo parte park_payload.php.`);
const COLS_S = ['common_name', 'scientific_name', 'kingdom', 'family', 'primary_habitat', 'conservation_status', 'description', 'identification_tips', 'seasonality', 'image_url', 'image_attribution', 'latitude', 'longitude', 'rarity_score', 'is_featured', 'is_visible', 'source', 'taxon_phylum', 'taxon_class', 'taxon_order', 'taxon_family', 'taxon_genus', 'iucn_global', 'spain_status', 'murcia_status', 'review_note', 'eidos_taxonid', 'gbif_species_key', 'zepa_site_code'];
L.push('INSERT INTO species (park_id, ' + COLS_S.join(', ') + ')');
L.push('SELECT pk.id, ' + COLS_S.map(c => 's.' + c).join(', '));
L.push('FROM parks pk JOIN (');
species.forEach((s, i) => {
  const t = s.taxonomy || {};
  const v = [
    sqlStr(s.commonName), sqlStr(s.scientificName), sqlStr(s.kingdom),
    sqlStrOrNull(s.group), sqlStrOrNull(s.habitat), sqlStrOrNull(s.conservationStatus),
    sqlStrOrNull(s.description), sqlStrOrNull((s.tips || []).join('; ')), sqlStrOrNull(s.seasonality),
    sqlStrOrNull(s.image), sqlStrOrNull(s.imageAttribution),
    sqlNum(s.coordinates && s.coordinates[0]), sqlNum(s.coordinates && s.coordinates[1]),
    sqlNum(s.rarityScore == null ? 1 : s.rarityScore), sqlBool(s.featured),
    sqlBool(s.visible === undefined ? true : s.visible),
    sqlStrOrNull(s.source),
    sqlStrOrNull(t.phylum), sqlStrOrNull(t.class), sqlStrOrNull(t.order), sqlStrOrNull(t.family), sqlStrOrNull(t.genus),
    sqlStrOrNull(s.iucnGlobal), sqlStrOrNull(s.spainStatus), sqlStrOrNull(s.murciaStatus), sqlStrOrNull(s.reviewNote),
    sqlNum(s.eidosTaxonId), sqlNum(s.gbifSpeciesKey), sqlStrOrNull(s.zepaSiteCode),
  ];
  L.push('    SELECT ' + alias(v, i === 0 ? COLS_S : null));
  if (i < species.length - 1) L.push('    UNION ALL');
});
L.push(`) s WHERE pk.slug = ${sqlStr(slug)}`);
L.push('ON DUPLICATE KEY UPDATE');
L.push(COLS_S.filter(c => c !== 'scientific_name').map(c => `    ${c} = VALUES(${c})`).join(',\n') + ';');

// 4) Vínculos --------------------------------------------------------------------------------------
const pares = [];
for (const s of species) for (const h of s.habitatIds || []) pares.push([s.scientificName, h, evidenciaDe(s.scientificName)]);
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
const conGeo = habitats.filter(h => geometriaPorSlug.has(h.id)).length;
console.log(`→ ${rel(salida)}`);
console.log(`   1 espacio · ${habitats.length} hábitats (${conGeo} con geometría) · ${species.length} especies · ${pares.length} vínculos`);
