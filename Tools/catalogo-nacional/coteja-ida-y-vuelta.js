#!/usr/bin/env node
'use strict';
/*
 * coteja-ida-y-vuelta.js — qué campos del paquete NO tienen dónde caer en la base, y por tanto
 * desaparecen cuando el paquete se regenera desde la API.
 *
 * El problema que resuelve
 * -----------------------
 * `Frontend/Js/data.js` da PRIORIDAD a la API sobre el `park.json` empaquetado, y
 * `Backend/Lib/park_export.php` regenera ese paquete DESDE la base. O sea que la base es la fuente de
 * verdad de lo que ve el usuario, y **un campo que el pipeline escribe en el `park.json` pero que no
 * tiene columna se borra en la primera exportación**. Sin error, sin aviso y con los contadores
 * cuadrando: el §2 del `CLAUDE.md` en estado puro. Quien pulse «Publicar cambios offline» en el
 * AdminPanel dispara esa misma ruta.
 *
 * Se midió una vez, a mano, el 2026-08-11: cargar la base desde cero y reexportar perdía
 * `gbifOccurrences` de 767 fichas y el `origen` de cada recinto del `habitats.geojson`. Después
 * nadie volvió a medirlo, porque medirlo exigía una base cargada. Esto lo mide **sin base**: compara
 * las claves que hay escritas en los `park.json` y los `geojson` contra las que el exportador sabe
 * emitir, leyendo el propio código PHP. Es la comprobación que faltaba, no el arreglo.
 *
 * Cómo lo comprueba, y qué NO comprueba
 * -------------------------------------
 * Lee `Backend/Lib/park_payload.php` y `Backend/Lib/park_export.php` y saca las claves que emiten
 * (`"clave" => …` y `$props["clave"]`). Lo que esté en el paquete y no ahí, se pierde. Es una lectura
 * de texto, no una ejecución: **puede fallar si alguien construye una clave de otra forma** (con una
 * variable, por ejemplo), y por eso lo que encuentra hay que leerlo, no obedecerlo a ciegas.
 *
 * **No comprueba el ORDEN**, que es la otra mitad de la deuda nº 3: el exportador ordena las especies
 * por `is_featured, common_name` y los recintos por `name`, mientras el `park.json` los lleva en el
 * orden del pipeline. Eso no pierde ningún dato pero produce un diff completo que esconde lo que sí
 * cambió, y arreglarlo es decidir cuál de los dos órdenes manda.
 *
 * `--sql` escribe el relleno de las columnas que se abrieron el 2026-08-27 para tapar los dos huecos
 * medidos (`species.gbif_occurrences` y `habitats.origen`): el dato está en el repositorio y la base
 * lo tiene a NULL hasta que se le dé.
 *
 * Idempotente y sin red. Uso:
 *     node Tools/catalogo-nacional/coteja-ida-y-vuelta.js
 *     node Tools/catalogo-nacional/coteja-ida-y-vuelta.js --sql Database/ida-y-vuelta.sql
 */

const fs = require('fs');
const path = require('path');
const { arg } = require('../lib/cli');
const { ROOT, FRONTEND, DATABASE, readJson, readJsonIf, rel, parkFiles } = require('../lib/io');
const { sqlStr, sqlNum, cabeceraSql } = require('../lib/sql');

const SQL = arg('sql', null);
const HOY = '2026-08-27';

const PAYLOAD = path.join(ROOT, 'Backend', 'Lib', 'park_payload.php');
const EXPORT = path.join(ROOT, 'Backend', 'Lib', 'park_export.php');

/*
 * Claves que el paquete lleva y que NO tienen que estar en la base, con el motivo. Sin esta lista el
 * informe sería ruido: `id` lo asigna la propia base, `speciesIds` es el espejo del vínculo y
 * `taxonomy` se arma desde seis columnas `taxon_*`.
 */
const ESPERADAS_FUERA = {
  id: 'lo asigna la base (AUTO_INCREMENT); el paquete lo lleva para enlazar dentro del fichero',
  taxonomy: 'se arma en el payload desde las seis columnas `taxon_*`',
  coordinates: 'son las columnas `latitude`/`longitude`',
  habitatIds: 'es el espejo de `species_habitats`, no una columna',
  speciesIds: 'ídem, por el otro lado',
  hectares: 'lo recalcula el exportador desde la geometría',
  priority: 'es la columna `is_priority`',
  featured: 'es `is_featured`',
  visible: 'es `is_visible`',
  audio: 'es `audio_url`',
  tips: 'es `identification_tips`, partido por «;»',
  image: 'es `image_url`',
  habitat: 'es `primary_habitat`',
  group: 'es la columna `family` (nombre histórico)',
  type: 'es `habitat_type` en hábitats y `type` en POIs',
  review: 'propiedad heredada del geojson histórico, conservada tal cual por el exportador',
};

/*
 * Campos que SÍ se pierden y se ha decidido que se pierdan, con la decisión escrita y fechada.
 *
 * Sin esta lista la comprobación se queda en rojo para siempre y deja de leerse, que es peor que no
 * tenerla. Con ella, el rojo significa lo único que debe significar: **hay una pérdida que nadie ha
 * mirado todavía**. Una entrada aquí no es un permiso genérico: es una decisión concreta, con fecha,
 * que se puede revisar.
 */
const PERDIDAS_ACEPTADAS = {
  // Hoy no hay ninguna. `gbifBboxSightings` estuvo aquí desde el 2026-08-27 y se retiró del
  // park.json el 2026-09-14: ya no se pierde nada porque ya no existe el campo.
};

/** Claves que un fichero PHP emite: `"clave" => …` y `$props["clave"] = …`. */
function clavesQueEmite(file) {
  const txt = fs.readFileSync(file, 'utf8');
  const claves = new Set();
  for (const m of txt.matchAll(/"([A-Za-z_][A-Za-z0-9_]*)"\s*=>/g)) claves.add(m[1]);
  for (const m of txt.matchAll(/\$props\[\s*"([A-Za-z_][A-Za-z0-9_]*)"\s*\]/g)) claves.add(m[1]);
  return claves;
}

// --- Lectura del repositorio ----------------------------------------------------------------------

function recorre() {
  const espacios = [];
  for (const p of parkFiles()) {
    const doc = readJson(p.file);
    const manifest = readJsonIf(path.join(p.dir, 'manifest.json')) || {};
    const geoRel = manifest.geo && manifest.geo.habitats;
    const geo = geoRel ? readJsonIf(path.join(FRONTEND, geoRel)) : null;
    espacios.push({ slug: p.slug, doc, geo });
  }
  return espacios;
}

const clavesDe = (lista) => {
  const s = new Set();
  for (const x of lista || []) for (const k of Object.keys(x)) s.add(k);
  return s;
};

// --- Principal ------------------------------------------------------------------------------------

const emitePayload = clavesQueEmite(PAYLOAD);
const emiteExport = clavesQueEmite(EXPORT);
const espacios = recorre();

const bloques = [
  { titulo: 'species', emite: emitePayload, claves: new Set(), fichero: rel(PAYLOAD) },
  { titulo: 'habitats', emite: emitePayload, claves: new Set(), fichero: rel(PAYLOAD) },
  { titulo: 'pointsOfInterest', emite: emitePayload, claves: new Set(), fichero: rel(PAYLOAD) },
  { titulo: 'geo/habitats.geojson (properties)', emite: emiteExport, claves: new Set(), fichero: rel(EXPORT) },
];

for (const e of espacios) {
  for (const k of clavesDe(e.doc.species)) bloques[0].claves.add(k);
  for (const k of clavesDe(e.doc.habitats)) bloques[1].claves.add(k);
  for (const k of clavesDe(e.doc.pointsOfInterest)) bloques[2].claves.add(k);
  for (const k of clavesDe((e.geo && e.geo.features || []).map(f => f.properties || {}))) bloques[3].claves.add(k);
}

console.log(`Espacios leídos: ${espacios.length}\n`);
let perdidos = 0;
for (const b of bloques) {
  const noEmitidas = [...b.claves].filter(k => !b.emite.has(k)).sort();
  const fuera = noEmitidas.filter(k => !ESPERADAS_FUERA[k] && !PERDIDAS_ACEPTADAS[k]);
  const aceptadas = noEmitidas.filter(k => PERDIDAS_ACEPTADAS[k]);
  const justificadas = noEmitidas.filter(k => ESPERADAS_FUERA[k]);
  console.log(`${b.titulo} — ${b.claves.size} clave(s) en el paquete, contra ${b.fichero}`);
  if (!fuera.length) console.log('  ✓ ninguna pérdida sin decidir');
  for (const k of fuera) { console.log(`  ✗ ${k} — el exportador no lo emite: se PIERDE en la ida y vuelta`); perdidos++; }
  for (const k of aceptadas) console.log(`  ~ ${k} — se pierde, DECIDIDO: ${PERDIDAS_ACEPTADAS[k]}`);
  for (const k of justificadas) console.log(`  · ${k} — ${ESPERADAS_FUERA[k]}`);
  console.log('');
}

// --- Relleno de las dos columnas nuevas -----------------------------------------------------------

function escribeSql(ruta) {
  const l = [];
  let filasEsp = 0, filasHab = 0;
  l.push(cabeceraSql(null).trimEnd(), '');
  l.push('-- ' + '='.repeat(96));
  l.push(`-- NaturDex · los dos campos que la ida y vuelta por la API borraba (${HOY})`);
  l.push('-- ' + '-'.repeat(96));
  l.push('-- Generado por `node Tools/catalogo-nacional/coteja-ida-y-vuelta.js --sql <ruta>`.');
  l.push('--');
  l.push('-- VA DESPUÉS de `Database/migrations.sql`, que es quien crea las dos columnas:');
  l.push('--   · `species.gbif_occurrences` — el total de la especie EN EL ESPACIO, la huella del');
  l.push('--     filtro de presencia. NO es `species_habitats.gbif_occurrences`, que es el recuento de');
  l.push('--     un solo polígono y ya existía.');
  l.push('--   · `habitats.origen`         — de dónde sale el recinto. Es el campo de procedencia que');
  l.push('--     exige la regla nº 1 del CLAUDE.md, y vivía SOLO en el geojson.');
  l.push('--');
  l.push('-- Se escribe únicamente lo que el repositorio tiene. Una ficha sin `gbifOccurrences` se');
  l.push('-- queda a NULL, que NO es 0: «nadie barrió» y «se barrió y no cayó ninguna» son distintos, y');
  l.push('-- la auditoría de enlaces los trata distinto.');
  l.push('--');
  l.push('-- Idempotente: aplicado dos veces, la segunda escribe los mismos valores.');
  l.push('-- ' + '='.repeat(96), '');
  l.push('START TRANSACTION;', '');

  for (const e of espacios) {
    const esp = (e.doc.species || []).filter(s => typeof s.gbifOccurrences === 'number');
    const hab = ((e.geo && e.geo.features) || [])
      .map(f => f.properties || {})
      .filter(p => p.slug && p.origen);
    if (!esp.length && !hab.length) continue;
    l.push(`-- ── ${e.slug} ${'─'.repeat(Math.max(0, 56 - e.slug.length))}  ${esp.length} especie(s) · ${hab.length} recinto(s)`);
    for (const s of esp) {
      l.push('UPDATE species sp JOIN parks pk ON pk.id = sp.park_id');
      l.push(`   SET sp.gbif_occurrences = ${sqlNum(s.gbifOccurrences)}`);
      l.push(` WHERE pk.slug = ${sqlStr(e.slug)} AND sp.scientific_name = ${sqlStr(s.scientificName)};`);
      filasEsp++;
    }
    for (const h of hab) {
      l.push('UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id');
      l.push(`   SET hb.origen = ${sqlStr(h.origen)}`);
      l.push(` WHERE pk.slug = ${sqlStr(e.slug)} AND hb.slug = ${sqlStr(h.slug)};`);
      filasHab++;
    }
    l.push('');
  }
  l.push('COMMIT;', '');
  l.push('-- Comprobación: ninguna de las dos columnas debe quedar vacía donde el repositorio tiene dato.');
  l.push('SELECT COUNT(*) AS especies_sin_ocurrencias FROM species WHERE gbif_occurrences IS NULL;');
  l.push('SELECT COUNT(*) AS recintos_sin_origen FROM habitats WHERE geometry IS NOT NULL AND origen IS NULL;');

  const destino = path.isAbsolute(ruta) ? ruta : path.join(DATABASE, path.basename(ruta));
  fs.writeFileSync(destino, l.join('\n') + '\n', 'utf8');
  console.log(`+ ${rel(destino)} (${filasEsp} especie(s) · ${filasHab} recinto(s))`);
}

if (SQL) escribeSql(SQL);
if (perdidos) {
  console.log(`⚠ ${perdidos} clave(s) sin columna: la ida y vuelta por la API las borraría.`);
  process.exit(1);
}
console.log('✓ Ningún campo del paquete se pierde al regenerarlo desde la base.');
