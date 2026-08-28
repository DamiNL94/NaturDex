#!/usr/bin/env node
'use strict';
/*
 * fix-recombinaciones-eidos.js — las veinte fichas que se llaman con un nombre que EIDOS da por
 * sinónimo Y cuyo aceptado es la MISMA especie en otro género. Es la parte de la deuda nº 36 que se
 * puede decidir con una regla en vez de taxón a taxón.
 *
 * El problema que resuelve
 * -----------------------
 * `coteja-nomenclatura.js --online` enumera **48 fichas** cuyo `scientificName` EIDOS considera
 * sinónimo. La herramienta no las toca a propósito, y con razón: renombrar desengancha la entrada
 * del catálogo universal y el texto de `data/contenido/`, que se indexan por nombre (§2 del
 * CLAUDE.md), y sobre todo **no todas las 48 son el mismo problema**. Meterlas en bloque sería el
 * «dato inventado» de la regla nº 2.
 *
 * La regla que las parte en dos, y no es nueva
 * -------------------------------------------
 * Es exactamente la guarda que ya usa `atlas-puente-nomenclatura.js` para la deuda nº 26, dicha aquí
 * para otro uso: **solo se renombra una RECOMBINACIÓN** — mismo epíteto, otro género, mismo rango.
 * *Stipa capensis* → *Stipellula capensis* es la misma planta en otro género y la ficha entera sigue
 * valiendo. En cambio:
 *
 *   · **Cambia el EPÍTETO** → es un cambio de IDENTIDAD, no de combinación. *Sarcocornia fruticosa*
 *     → *Salicornia lagascae*, *Ruppia cirrhosa* → *Ruppia spiralis*, *Natrix natrix* →
 *     *Natrix helvetica* (la culebra de collar se partió en dos especies). Adoptarlos colgaría de la
 *     ficha —con su foto, su descripción y sus enlaces de hábitat— un taxón distinto.
 *   · **La ficha es un TRINOMIO y el aceptado un binomio** → cambia el RANGO. *Dactylis glomerata*
 *     subsp. *hispanica* → *Dactylis glomerata* afirma de la ficha un taxón MÁS AMPLIO del que la
 *     fuente reconoce, que es justo lo que documenta la deuda nº 27.
 *   · **El aceptado es una SUBESPECIE** → lo mismo al revés, y por eso `coteja-nomenclatura.js` ni
 *     siquiera propone un binomio truncado en esos casos.
 *
 * De las 48: **20 recombinaciones** (aquí) y **28 que no se tocan**, enumeradas abajo con su motivo
 * para que nadie las vuelva a mirar desde cero.
 *
 * La comparación de epítetos usa `binomio()` de `lib/atlas.js`, que normaliza la desinencia latina:
 * *hirsuta* → *hirsutus* y *vermiculata* → *vermiculatum* son concordancia de género gramatical, no
 * un epíteto distinto. La misma función, no una copia.
 *
 * Lo que este fix NO hace, y por qué
 * ----------------------------------
 * **No toca ninguna `gbifSpeciesKey`.** Cada campo cita a SU autoridad: el nombre a EIDOS, la key a
 * GBIF (cabecera de `coteja-nomenclatura.js`). Que GBIF siga aceptando el género viejo no es una
 * incoherencia que arreglar: es el estado real de la nomenclatura.
 *
 * **No toca ningún `eidosTaxonId`,** y no por prudencia: EIDOS da UN taxonid por taxón, no por
 * nombre, así que el identificador de las veinte fichas **ya era el del aceptado**. Comprobado antes
 * de escribir: los veinte coinciden.
 *
 * **No da de alta equivalencias de nomenclatura.** La tentación es evidente —las fuentes oficiales
 * seguirán citando *Sedum sediforme* durante años—, pero el `_cuando_hace_falta_una_entrada` de
 * `data/equivalencias-nomenclatura.json` lo prohíbe con su motivo: EIDOS **sí** resuelve estos
 * nombres, la capa 2 de `lib/respaldo-sitio.js` los cruza, y escribirlos aquí sería «una segunda
 * verdad que puede divergir». Lo que sí hay que saber es que esa capa **solo corre con `--online`**
 * (deuda nº 38): sin red, un anexo que cite el nombre viejo no cruzará.
 *
 * **No toca el `verbatim` de `data/anexos-normativos.json`,** que es la cita literal de la norma y
 * no se corrige nunca.
 *
 * El arreglo va en TRES sitios, y el cuarto no se ve desde el repositorio:
 *   1. los `park.json` — el `scientificName`;
 *   2. `data/especies-universal.json` — la ficha universal se indexa POR NOMBRE, y se reordena, o el
 *      diff entierra lo que cambia;
 *   3. `data/contenido/*.json` — el texto redactado, indexado también por nombre (6 de los 20);
 *   4. `--sql`: el borrado de la fila vieja que `build-park-sql.js` deja huérfana, porque solo hace
 *      UPSERT y casa por `scientific_name`.
 *
 * Se para si el nombre NUEVO ya existe en el mismo espacio: fusionar exige decidir qué enlaces y qué
 * recuento se conservan, y eso no se hace a ciegas. (Comprobado el 2026-08-28: 0 colisiones.)
 *
 * Idempotente. Uso:
 *     node Tools/catalogo-nacional/fix-recombinaciones-eidos.js
 *     node Tools/catalogo-nacional/fix-recombinaciones-eidos.js --write [--sql <ruta>]
 */

const fs = require('fs');
const path = require('path');
const { arg, flag } = require('../lib/cli');
const { CATALOGO_DIR, DATABASE, readJson, writeJson, rel, parkFiles, escribeEspacio } = require('../lib/io');
const { binomio } = require('../lib/atlas');
const { sqlStr, cabeceraSql } = require('../lib/sql');

const WRITE = flag('write');
const SQL = arg('sql', null);
const HOY = '2026-08-28';

const CATALOGO = path.join(CATALOGO_DIR, 'data', 'especies-universal.json');
const CONTENIDO_DIR = path.join(CATALOGO_DIR, 'data', 'contenido');

/*
 * Las veinte, con el taxonid del aceptado en EIDOS. El `taxonid` NO se escribe en ninguna ficha —ya
 * lo llevan— y está aquí para poder rehacer la comprobación sin volver a salir a la red.
 */
const RECOMBINACIONES = [
  { viejo: 'Eptesicus isabellinus', nuevo: 'Cnephaeus isabellinus', taxonid: 16225 },
  { viejo: 'Stipa capensis', nuevo: 'Stipellula capensis', taxonid: 10149 },
  { viejo: 'Saccharum ravennae', nuevo: 'Tripidium ravennae', taxonid: 80560 },
  { viejo: 'Ballota hirsuta', nuevo: 'Pseudodictamnus hirsutus', taxonid: 2631 },
  { viejo: 'Halimione portulacoides', nuevo: 'Atriplex portulacoides', taxonid: 5035 },
  { viejo: 'Salsola vermiculata', nuevo: 'Caroxylon vermiculatum', taxonid: 1341 },
  { viejo: 'Arthrocnemum macrostachyum', nuevo: 'Arthrocaulon macrostachyum', taxonid: 33034 },
  { viejo: 'Sedum sediforme', nuevo: 'Petrosedum sediforme', taxonid: 8225 },
  { viejo: 'Pseudorlaya pumila', nuevo: 'Daucus pumilus', taxonid: 7405 },
  { viejo: 'Calicotome intermedia', nuevo: 'Cytisus intermedius', taxonid: 2950 },
  { viejo: 'Calicotome spinosa', nuevo: 'Cytisus spinosus', taxonid: 2952 },
  { viejo: 'Calicotome infesta', nuevo: 'Cytisus infestus', taxonid: 2949 },
  { viejo: 'Merendera filifolia', nuevo: 'Colchicum filifolium', taxonid: 6169 },
  { viejo: 'Hymenolobus procumbens', nuevo: 'Hornungia procumbens', taxonid: 5124 },
  { viejo: 'Calystegia soldanella', nuevo: 'Convolvulus soldanella', taxonid: 2982 },
  { viejo: 'Chenopodium murale', nuevo: 'Chenopodiastrum murale', taxonid: 3549 },
  { viejo: 'Elymus elongatus', nuevo: 'Thinopyrum elongatum', taxonid: 10013 },
  { viejo: 'Orobanche ramosa', nuevo: 'Phelipanche ramosa', taxonid: 6861 },
  { viejo: 'Barbus sclateri', nuevo: 'Luciobarbus sclateri', taxonid: 12174 },
  { viejo: 'Lycocarpus fugax', nuevo: 'Sisymbrium fugax', taxonid: 5925 },
];

/*
 * La guarda, aplicada a los datos de la tabla y no solo escrita en la cabecera.
 *
 * Una constante que dice «esto son recombinaciones» y nadie comprueba es una afirmación que envejece
 * igual de mal que la que costó la deuda nº 4. Si alguien añade aquí un par que cambia de epíteto o
 * de rango, la herramienta se para en vez de renombrarlo.
 */
function compruebaLaRegla() {
  const malos = [];
  for (const r of RECOMBINACIONES) {
    const epViejo = (binomio(r.viejo) || ' ').split(' ')[1];
    const epNuevo = (binomio(r.nuevo) || ' ').split(' ')[1];
    if (r.viejo.split(/\s+/).length !== 2 || r.nuevo.split(/\s+/).length !== 2) malos.push(`${r.viejo} → ${r.nuevo}: no son dos binomios (cambia el rango)`);
    else if (epViejo !== epNuevo) malos.push(`${r.viejo} → ${r.nuevo}: cambia el epíteto («${epViejo}» ≠ «${epNuevo}»), no es una recombinación`);
    else if (r.viejo.split(' ')[0] === r.nuevo.split(' ')[0]) malos.push(`${r.viejo} → ${r.nuevo}: mismo género, así que no hay recombinación que aplicar`);
  }
  if (malos.length) {
    console.error('La tabla no cumple la regla de esta herramienta:');
    for (const m of malos) console.error('  ✗ ' + m);
    process.exit(1);
  }
}

// --- Fase 1: los park.json ------------------------------------------------------------------------

function renombraFichas() {
  const cambios = [];
  for (const espacio of parkFiles()) {
    const doc = readJson(espacio.file);
    const nombres = new Set((doc.species || []).map(s => s.scientificName));
    const mios = [];
    for (const sp of (doc.species || [])) {
      const r = RECOMBINACIONES.find(x => x.viejo === sp.scientificName);
      if (!r) continue;
      if (nombres.has(r.nuevo)) {
        console.error(`  ✗ ${espacio.slug}: «${r.nuevo}» YA existe junto a «${r.viejo}». Eso es una`);
        console.error('    FUSIÓN, no un renombrado, y exige decidir qué enlaces y qué recuento se');
        console.error('    conservan. La herramienta se para en vez de hacerlo a ciegas.');
        process.exit(1);
      }
      sp.scientificName = r.nuevo;
      mios.push(r);
    }
    if (!mios.length) continue;
    cambios.push({ slug: espacio.slug, pares: mios });
    console.log(`\n${espacio.slug}`);
    for (const r of mios) console.log(`  · ${r.viejo} → ${r.nuevo}`);
    const { lineas } = escribeEspacio({ dir: espacio.dir, file: espacio.file, doc, write: WRITE });
    for (const l of lineas) console.log('  ' + l);
  }
  return cambios;
}

// --- Fase 2: el catálogo universal ----------------------------------------------------------------

function renombraCatalogo() {
  const cat = readJson(CATALOGO);
  let n = 0;
  for (const r of RECOMBINACIONES) {
    if (!cat[r.viejo]) continue;
    if (cat[r.nuevo]) { console.error(`  ✗ el catálogo universal ya tiene «${r.nuevo}»: sería una fusión`); process.exit(1); }
    cat[r.nuevo] = cat[r.viejo];
    delete cat[r.viejo];
    n++;
  }
  if (!n) return 0;
  // Reordenado: sin esto el par entra al final y el diff del fichero entero entierra lo que cambia.
  const ordenado = Object.fromEntries(Object.keys(cat).sort((a, b) => a.localeCompare(b)).map(k => [k, cat[k]]));
  if (WRITE) writeJson(CATALOGO, ordenado);
  console.log(`\n${WRITE ? '+' : '~'} ${rel(CATALOGO)} (${n} entrada(s) renombrada(s) y reordenado)`);
  return n;
}

// --- Fase 3: los textos redactados ----------------------------------------------------------------

function renombraContenido() {
  let total = 0;
  for (const f of fs.readdirSync(CONTENIDO_DIR).filter(x => x.endsWith('.json'))) {
    const ruta = path.join(CONTENIDO_DIR, f);
    const doc = readJson(ruta);
    let n = 0;
    for (const r of RECOMBINACIONES) {
      if (!doc[r.viejo]) continue;
      if (doc[r.nuevo]) { console.error(`  ✗ ${f} ya tiene texto para «${r.nuevo}»`); process.exit(1); }
      doc[r.nuevo] = doc[r.viejo];
      delete doc[r.viejo];
      n++;
    }
    if (!n) continue;
    total += n;
    if (WRITE) writeJson(ruta, doc);
    console.log(`${WRITE ? '+' : '~'} ${rel(ruta)} (${n} texto(s))`);
  }
  return total;
}

// --- Fase 4: el borrado que el UPSERT no genera ---------------------------------------------------

function escribeSql(cambios, ruta) {
  const l = [];
  l.push(cabeceraSql(null).trimEnd(), '');
  l.push('-- ' + '='.repeat(96));
  l.push(`-- NaturDex · retirada de las fichas que dejó el renombrado de recombinaciones del ${HOY}`);
  l.push('-- ' + '-'.repeat(96));
  l.push('-- Generado por `node Tools/catalogo-nacional/fix-recombinaciones-eidos.js --write --sql`.');
  l.push('--');
  l.push('-- QUÉ ES ESTO. `build-park-sql.js` solo hace UPSERT y casa por `scientific_name`: ante un');
  l.push('-- renombrado inserta la ficha nueva y deja la vieja donde estaba, con su id y sus vínculos.');
  l.push('-- La base acaba con las dos, y la API manda sobre el paquete, así que el usuario ve las dos.');
  l.push('--');
  l.push('-- NINGUNA especie desaparece del catálogo: las veinte siguen ahí con el nombre que acepta');
  l.push('-- EIDOS. Lo que se retira es el nombre anterior, que ya no ficha nada.');
  l.push('--');
  l.push('-- LOS RENOMBRADOS, y la regla que los separa de los otros 28 casos de la deuda nº 36:');
  l.push('-- mismo epíteto, otro género, mismo rango. Un cambio de epíteto es un cambio de IDENTIDAD');
  l.push('-- y un trinomio que se vuelve binomio cambia de RANGO; ni unos ni otros están aquí.');
  for (const r of RECOMBINACIONES) l.push(`--   · ${r.viejo}  →  ${r.nuevo}  (EIDOS taxonid ${r.taxonid})`);
  l.push('--');
  l.push('-- DEPENDENCIAS, las mismas que comprobó `poda-renombrados-cabo-cope-puntas-calnegre.sql`:');
  l.push('--   · `species_habitats` tiene ON DELETE CASCADE; sus vínculos se van con la ficha.');
  l.push('--   · `observations` referencia `species_id`: el borrado lo RESPETA por su NOT EXISTS, y el');
  l.push('--     SELECT de arriba deja dicho cuántas hay antes de tocar nada.');
  l.push('--   · `user_occurrences` (Darwin Core) no tiene clave foránea a `species` y lleva su');
  l.push('--     taxonomía copiada, precisamente para esto: no se toca.');
  l.push('--   · Después de aplicarlo, `Tools/recalculate-account-progress.php`.');
  l.push('--');
  l.push('-- ORDEN: va DESPUÉS del `-n2.sql` de cada espacio, que es quien da de alta el nombre nuevo.');
  l.push('-- Es idempotente: aplicado dos veces, la segunda no borra nada.');
  l.push('-- ' + '='.repeat(96), '');
  l.push('START TRANSACTION;', '');

  for (const c of cambios) {
    const lista = c.pares.map(r => sqlStr(r.viejo)).join(', ');
    l.push(`-- ── ${c.slug} ${'─'.repeat(Math.max(0, 56 - c.slug.length))}  ${c.pares.length} ficha(s)`);
    l.push('SELECT COUNT(*) AS observaciones_que_bloquean_el_borrado');
    l.push('  FROM observations o JOIN species sp ON sp.id = o.species_id');
    l.push('  JOIN parks pk ON pk.id = sp.park_id');
    l.push(` WHERE pk.slug = ${sqlStr(c.slug)} AND sp.scientific_name IN (${lista});`, '');
    l.push('DELETE sp FROM species sp');
    l.push('JOIN parks pk ON pk.id = sp.park_id');
    l.push(`WHERE pk.slug = ${sqlStr(c.slug)}`);
    l.push(`  AND sp.scientific_name IN (${lista})`);
    l.push('  AND NOT EXISTS (SELECT 1 FROM observations o WHERE o.species_id = sp.id);', '');
  }
  l.push('COMMIT;', '');
  l.push('-- Comprobación: ninguno de los nombres viejos debe quedar vivo.');
  l.push('SELECT sp.scientific_name, COUNT(*) AS filas FROM species sp');
  l.push(` WHERE sp.scientific_name IN (${RECOMBINACIONES.map(r => sqlStr(r.viejo)).join(', ')})`);
  l.push(' GROUP BY sp.scientific_name;');

  const destino = path.isAbsolute(ruta) ? ruta : path.join(DATABASE, path.basename(ruta));
  if (WRITE) fs.writeFileSync(destino, l.join('\n') + '\n', 'utf8');
  console.log(`\n${WRITE ? '+' : '~'} ${rel(destino)} (${cambios.length} espacio(s))`);
}

// --- Principal ------------------------------------------------------------------------------------

compruebaLaRegla();
const cambios = renombraFichas();
const enCatalogo = renombraCatalogo();
const enContenido = renombraContenido();

const fichas = cambios.reduce((n, c) => n + c.pares.length, 0);
if (!fichas && !enCatalogo && !enContenido) {
  console.log('\nNada que renombrar: las veinte ya usan el nombre que acepta EIDOS.');
} else {
  console.log(`\n${fichas} ficha(s) en ${cambios.length} espacio(s) · ${enCatalogo} entrada(s) universal(es) · ${enContenido} texto(s)`);
  if (SQL) escribeSql(cambios, SQL);
  if (!WRITE) console.log('\nSimulación. Añade --write para escribirlo.');
}
