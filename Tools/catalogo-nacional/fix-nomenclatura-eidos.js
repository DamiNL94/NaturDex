#!/usr/bin/env node
'use strict';
/*
 * fix-nomenclatura-eidos.js — ocho fichas del catálogo se llamaban con un nombre que EIDOS da por
 * SINÓNIMO, y nada podía verlo.
 *
 * Qué pasaba
 * ----------
 * El catálogo fichaba *Sylvia communis*, *Sylvia hortensis*, *Pallenis spinosa*, *Clinopodium
 * acinos*, *Anethum ridolfia*, *Ornithogalum narbonense*, *Leuzea conifera* y *Coloeus monedula*.
 * EIDOS —que es la autoridad taxonómica de este repositorio, regla nº 3 del CLAUDE.md— da los ocho
 * por sinónimos y acepta *Curruca communis*, *Curruca hortensis*, *Asteriscus spinosus*, *Ziziphora
 * acinos*, *Ridolfia segetum*, *Loncomelos narbonense*, *Rhaponticum coniferum* y *Corvus monedula*.
 *
 * `scan-taxones-duplicados.js` no podía cazarlo: busca un taxón dado de alta DOS veces, y estos
 * estaban una sola vez, con un nombre y un identificador coherentes entre sí. Lo que los delata es
 * que **la propia ficha ya se contradecía**: su `taxonomy.genus` —que sale de EIDOS literal
 * (`build-species-universal.js` §29)— traía el género bueno mientras el `scientificName` se había
 * quedado con el viejo. *Sylvia communis* con `genus: "Curruca"` al lado. Esa contradicción es la
 * pasada A de `coteja-nomenclatura.js`, no cuesta una sola petición de red y caza los nueve casos.
 *
 * Por qué importa, y no es cosmético
 * ----------------------------------
 * El cruce contra una fuente oficial de sitio —el Formulario Normalizado de un sitio Red Natura 2000
 * o el anexo de un PRUG— se hace **por nombre**. Un nombre desalineado no da error: da un fallo en
 * verde de los del §2 del CLAUDE.md, que excluye la especie y escribe a su lado un motivo que es
 * mentira («no figura en el formulario oficial del sitio»). Es exactamente lo que ya había pasado
 * con la curruca rabilarga.
 *
 * Lo que este fix NO hace, y por qué
 * ----------------------------------
 * **No unifica géneros por parecido.** Sería el error natural al ver *Sylvia communis* junto a
 * *Curruca undata*: EIDOS acepta *Curruca undata* y *Curruca communis* pero **también** *Sylvia
 * atricapilla*, porque el curruquero se partió y el capirote se quedó en *Sylvia*. Se renombra lo
 * que EIDOS marca como sinónimo, uno a uno, y nada más.
 *
 * **No toca ninguna `gbifSpeciesKey`.** Las nueve son ACCEPTED en el backbone de GBIF (comprobado el
 * 2026-08-17), y GBIF discrepa de EIDOS justo al revés en estos taxones: acepta el nombre viejo.
 * Cada campo cita a su autoridad — el nombre a EIDOS, la key a GBIF—, y esa discrepancia es el
 * estado real de la nomenclatura, no una avería. Cambiar la key al nombre nuevo la llevaría a un
 * sinónimo del backbone, que trae MENOS ocurrencias.
 *
 * **No renombra el romero**, que es el noveno caso de la pasada A y va al revés: EIDOS acepta
 * *Rosmarinus officinalis* y da *Salvia rosmarinus* por sinónimo. Ahí el nombre es el bueno y el
 * desalineado es `taxonomy.genus`, que trae «Salvia» de GBIF; eso lo corrige `coteja-nomenclatura.js
 * --write`, que es donde vive lo que se puede arreglar sin renombrar.
 *
 * Dos casos que no son un renombrado a secas
 * ------------------------------------------
 *   · *Leuzea conifera* llevaba `eidosTaxonId` **643**, que es *Rhaponticum coniferum* subsp.
 *     *coniferum*, la SUBESPECIE. El identificador se reancla a **7755**, que es la especie. Es el
 *     mismo defecto que tenía la curruca rabilarga con el 80230.
 *   · *Coloeus monedula* es el único que va contra la nomenclatura de uso moderno: la grajilla se
 *     separa hoy en *Coloeus* y así la sirve GBIF, pero EIDOS mantiene *Corvus monedula* como
 *     aceptado. Manda EIDOS, y queda dicho aquí para que el próximo que lo vea no lo «arregle» al
 *     revés.
 *
 * El arreglo va en TRES sitios, porque uno solo lo deshace la siguiente regeneración:
 *   1. los `park.json` — el nombre, y el identificador cuando cambia;
 *   2. `data/especies-universal.json` — la ficha universal se indexa POR NOMBRE (§2 del CLAUDE.md);
 *   3. `data/equivalencias-nomenclatura.json` — para que una fuente oficial que siga citando el
 *      nombre viejo (y lo harán durante años) cruce con la ficha.
 * Ninguno de los ocho tiene texto en `data/contenido/` ni ficha con el nombre nuevo en el mismo
 * espacio (comprobado antes de escribir; si aparece una colisión, el fix se para en vez de fusionar
 * a ciegas: fusionar exige decidir qué enlaces y qué recuento se conservan).
 *
 * Idempotente. Uso: node Tools/catalogo-nacional/fix-nomenclatura-eidos.js [--write]
 */

const fs = require('fs');
const path = require('path');
const { flag, die } = require('../lib/cli');
const { CATALOGO_DIR, DATABASE, readJson, writeJson, rel, parkFiles } = require('../lib/io');
const { sqlStr } = require('../lib/sql');

const WRITE = flag('write');
const SQL = flag('sql');
const HOY = '2026-08-17';

/*
 * Los ocho, con lo que hay que cambiar y con lo que EIDOS respondió al comprobarlo. `taxonId` solo
 * aparece cuando el identificador cambia: en los otros siete el que llevaba la ficha ya era el del
 * taxón aceptado, y lo único desalineado era el nombre.
 */
const RENOMBRADOS = [
  { viejo: 'Sylvia communis', nuevo: 'Curruca communis',
    eidos: 'taxonid 80921: «Sylvia communis Latham, 1787» es Sinónimo y «Curruca communis (Latham, 1787)» Aceptado/válido' },
  { viejo: 'Sylvia hortensis', nuevo: 'Curruca hortensis',
    eidos: 'taxonid 80927: «Sylvia hortensis (Gmelin, JF, 1789)» es Sinónimo y «Curruca hortensis (Gmelin, 1789)» Aceptado/válido' },
  { viejo: 'Pallenis spinosa', nuevo: 'Asteriscus spinosus',
    eidos: 'taxonid 80443: «Pallenis spinosa (L.) Cass.» es Sinónimo y «Asteriscus spinosus (L.) Schulz Bip.» Aceptado/válido' },
  { viejo: 'Clinopodium acinos', nuevo: 'Ziziphora acinos',
    eidos: 'taxonid 1795: «Clinopodium acinos (L.) Kuntze» es Sinónimo y «Ziziphora acinos (L.) Melnikov» Aceptado/válido' },
  { viejo: 'Anethum ridolfia', nuevo: 'Ridolfia segetum',
    eidos: 'taxonid 7791: «Anethum ridolfia Spalik & Reduron» es Sinónimo y «Ridolfia segetum (L.) Moris» Aceptado/válido' },
  { viejo: 'Ornithogalum narbonense', nuevo: 'Loncomelos narbonense',
    eidos: 'taxonid 6794: «Ornithogalum narbonense L.» es Sinónimo y «Loncomelos narbonense (L.) Raf.» Aceptado/válido' },
  { viejo: 'Leuzea conifera', nuevo: 'Rhaponticum coniferum', taxonId: 7755,
    eidos: 'taxonid 643 es «Rhaponticum coniferum (L.) Greuter subsp. coniferum», la SUBESPECIE; la especie ' +
           'es el taxonid 7755, «Rhaponticum coniferum (L.) Greuter», Aceptado/válido. «Leuzea conifera (L.) DC.» es Sinónimo' },
  { viejo: 'Coloeus monedula', nuevo: 'Corvus monedula',
    eidos: 'taxonid 11769: «Coloeus monedula» es Sinónimo y «Corvus monedula Linnaeus, 1758» Aceptado/válido' },
  /*
   * El noveno lo renombró `fix-curruca-undata.js`, no este fix, y aun así figura aquí: el `--sql`
   * tiene que redactar el borrado de TODOS los renombrados de la sesión, porque la avería que
   * repara —la fila vieja que el UPSERT deja huérfana— no distingue qué herramienta cambió el
   * nombre. Como el fix es idempotente y ya no queda ninguna ficha con el nombre viejo, las tres
   * primeras fases lo saltan sin hacer nada; solo cuenta para el SQL.
   */
  { viejo: 'Sylvia undata', nuevo: 'Curruca undata',
    eidos: 'taxonid 80931: «Sylvia undata (Boddaert, 1783)» es Sinónimo y «Curruca undata ' +
           '(Boddaert, 1783)» Aceptado/válido. Aplicado por fix-curruca-undata.js' },
];

/*
 * El borrado que `build-park-sql.js` NO puede generar.
 *
 * Ese generador solo hace UPSERT y casa por `scientific_name`: ante un renombrado inserta la ficha
 * nueva y **deja la vieja donde estaba**, con su id y sus vínculos, así que la base acaba con las
 * dos y la API —que manda sobre el paquete— sirve las dos. Es el tercer rastro que deja renombrar un
 * taxón, además del catálogo universal y de `data/contenido/` que avisa el §2 del CLAUDE.md, y es el
 * único que no se ve desde el repositorio. Mismo patrón y mismos guardianes que
 * `Database/poda-renombrados-cabo-cope-puntas-calnegre.sql`, que existe por esto mismo.
 *
 * El conjunto sobre el que actúa es «los espacios donde hoy está el nombre NUEVO», que es más ancho
 * que «los espacios que este fix renombró», y a propósito: lo que se busca no es dejar constancia de
 * lo que pasó hoy sino barrer cualquier fila que haya quedado con el nombre viejo, venga del
 * renombrado de esta sesión o de una carga anterior. Donde nunca existió, el DELETE no hace nada. Lo
 * que NO se hace es borrar el nombre viejo en un espacio que no tiene el nuevo: ahí la ficha se
 * retiró por otro motivo —una poda de aves, por ejemplo— y ese borrado tiene su propio fichero.
 */
function escribeSql() {
  const porEspacio = new Map();
  for (const p of parkFiles()) {
    const nombres = new Set((readJson(p.file).species || []).map(s => s.scientificName));
    const viejos = RENOMBRADOS.filter(r => nombres.has(r.nuevo) && !nombres.has(r.viejo));
    if (viejos.length) porEspacio.set(p.slug, viejos);
  }

  const l = [];
  l.push('-- El juego de caracteres se fija SIEMPRE: el cliente mysql lo toma del entorno y en un');
  l.push('-- contenedor sin locale eso es latin1, que convierte cada tilde en mojibake sin dar error.');
  l.push('SET NAMES utf8mb4;', '');
  l.push('-- ' + '='.repeat(96));
  l.push('-- NaturDex · retirada de las fichas que dejó el realineado de nomenclatura del ' + HOY);
  l.push('-- ' + '-'.repeat(96));
  l.push('-- Generado por `node Tools/catalogo-nacional/fix-nomenclatura-eidos.js --sql`.');
  l.push('--');
  l.push('-- QUÉ ES ESTO, Y POR QUÉ NO LO GENERA `build-park-sql.js`');
  l.push('--');
  l.push('-- `build-park-sql.js` solo hace UPSERT y casa por `scientific_name`: ante un renombrado');
  l.push('-- inserta la ficha nueva y deja la vieja donde estaba, con su id y sus vínculos. La base');
  l.push('-- acaba con las dos, y la API manda sobre el paquete, así que el usuario ve las dos.');
  l.push('--');
  l.push('-- NINGUNA especie desaparece del catálogo: todas siguen ahí con su nombre de hoy, el que');
  l.push('-- acepta EIDOS. Lo que se retira es el nombre anterior, que ya no ficha nada.');
  l.push('--');
  l.push('-- LOS RENOMBRADOS, y con qué se comprobó cada uno:');
  for (const r of RENOMBRADOS) {
    l.push(`--   · ${r.viejo}  →  ${r.nuevo}`);
    l.push(`--     ${r.eidos}`);
  }
  l.push('--');
  l.push('-- DÓNDE SE BORRA. En los espacios donde hoy está el nombre NUEVO, que es más ancho que');
  l.push('-- «donde se renombró hoy» y a propósito: así barre también lo que dejara una carga');
  l.push('-- anterior. Donde el nombre viejo no exista, el DELETE no hace nada.');
  l.push('--');
  for (const [slug, viejos] of porEspacio) {
    l.push(`--   ${slug}: ${viejos.map(r => r.viejo).join(', ')}`);
  }
  l.push('--');
  l.push('-- DEPENDENCIAS, las mismas que comprobó `poda-renombrados-cabo-cope-puntas-calnegre.sql`:');
  l.push('--   · `species_habitats` tiene ON DELETE CASCADE; sus vínculos se van con la ficha.');
  l.push('--   · `observations` referencia `species_id`: el borrado se ABORTA si hay alguna, porque');
  l.push('--     una observación de un usuario no se tira para cuadrar un contador.');
  l.push('--   · `user_occurrences` (Darwin Core) no tiene clave foránea a `species` y lleva su');
  l.push('--     taxonomía copiada, precisamente para esto: no se toca.');
  l.push('--   · Después de aplicarlo, `Tools/recalculate-account-progress.php`.');
  l.push('--');
  l.push('-- ORDEN: va DESPUÉS del `-n2.sql` de cada espacio, que es quien da de alta el nombre nuevo.');
  l.push('-- Es idempotente: aplicado dos veces, la segunda no borra nada.');
  l.push('-- ' + '='.repeat(96), '');
  l.push('START TRANSACTION;', '');

  for (const [slug, viejos] of porEspacio) {
    const lista = viejos.map(r => sqlStr(r.viejo)).join(', ');
    l.push(`-- ── ${slug} ${'─'.repeat(Math.max(0, 60 - slug.length))}`);
    l.push('-- Guardián: si algún usuario ha observado una de estas fichas, este SELECT lo deja dicho');
    l.push('-- antes de borrar, y el DELETE de abajo la respeta por su NOT EXISTS.');
    l.push('SELECT COUNT(*) AS observaciones_que_bloquean_el_borrado');
    l.push('  FROM observations o JOIN species sp ON sp.id = o.species_id');
    l.push('  JOIN parks pk ON pk.id = sp.park_id');
    l.push(` WHERE pk.slug = ${sqlStr(slug)} AND sp.scientific_name IN (${lista});`, '');
    l.push('DELETE sp FROM species sp');
    l.push('JOIN parks pk ON pk.id = sp.park_id');
    l.push(`WHERE pk.slug = ${sqlStr(slug)}`);
    l.push('  AND sp.scientific_name IN (');
    l.push(viejos.map(r => `    ${sqlStr(r.viejo)}`).join(',\n')
      .split('\n').map((linea, i) => `${linea}${i === viejos.length - 1 ? '' : ''}`).join('\n'));
    l.push('  )');
    l.push('  AND NOT EXISTS (SELECT 1 FROM observations o WHERE o.species_id = sp.id);', '');
  }

  l.push('COMMIT;', '');
  l.push('-- Comprobación: las dos cuentas deben salir a 0.');
  for (const [slug, viejos] of porEspacio) {
    const lista = viejos.map(r => sqlStr(r.viejo)).join(', ');
    l.push(`SELECT ${sqlStr(slug)} AS espacio, COUNT(*) AS nombres_viejos_que_siguen`);
    l.push('  FROM species sp JOIN parks pk ON pk.id = sp.park_id');
    l.push(` WHERE pk.slug = ${sqlStr(slug)} AND sp.scientific_name IN (${lista});`);
  }

  const destino = path.join(DATABASE, 'poda-renombrados-nomenclatura-eidos.sql');
  if (WRITE) fs.writeFileSync(destino, l.join('\n') + '\n');
  const total = [...porEspacio.values()].reduce((n, v) => n + v.length, 0);
  console.log(`${WRITE ? '→' : '~'} ${rel(destino)}: ${total} ficha(s) vieja(s) en ${porEspacio.size} espacio(s)`);
}

function main() {
  const universalPath = path.join(CATALOGO_DIR, 'data', 'especies-universal.json');
  const equivPath = path.join(CATALOGO_DIR, 'data', 'equivalencias-nomenclatura.json');
  const anexosPath = path.join(CATALOGO_DIR, 'data', 'anexos-normativos.json');
  const universal = readJson(universalPath);
  const equiv = readJson(equivPath);
  const anexos = readJson(anexosPath);

  // Antes de escribir nada: ninguna colisión. Renombrar sobre una ficha que ya existe no es un
  // renombrado, es una fusión, y esa decisión no se toma dentro de un bucle.
  for (const p of parkFiles()) {
    const nombres = new Set((readJson(p.file).species || []).map(s => s.scientificName));
    for (const r of RENOMBRADOS) {
      if (nombres.has(r.viejo) && nombres.has(r.nuevo)) {
        die(`${p.slug} tiene «${r.viejo}» y «${r.nuevo}» a la vez. Fusionarlas exige decidir qué ` +
            'enlaces y qué recuento se conservan; no se hace aquí. Se para.');
      }
    }
  }

  let fichas = 0;
  const tocados = new Set();
  for (const p of parkFiles()) {
    const doc = readJson(p.file);
    let cambiado = false;
    for (const sp of (doc.species || [])) {
      const r = RENOMBRADOS.find(x => x.viejo === sp.scientificName);
      if (!r) continue;
      sp.scientificName = r.nuevo;
      if (r.taxonId) sp.eidosTaxonId = r.taxonId;
      // Alguna ficha usaba el nombre científico como nombre común por no tener otro; al cambiar el
      // científico, dejarlo sería servir dos nombres distintos para la misma cosa en la misma ficha.
      if (sp.commonName === r.viejo) sp.commonName = r.nuevo;
      const nota = `Fichada hasta el ${HOY} como «${r.viejo}», que EIDOS da por sinónimo. ${r.eidos}. ` +
        'Se adopta el nombre aceptado; la gbifSpeciesKey NO cambia porque el backbone de GBIF acepta ' +
        'el nombre anterior y es esa key la que lleva las ocurrencias.';
      sp.reviewNote = sp.reviewNote ? `${sp.reviewNote} ${nota}` : nota;
      cambiado = true; fichas++;
      console.log(`${WRITE ? '+' : '~'} ${p.slug}: ${r.viejo} → ${r.nuevo}`);
    }
    if (cambiado) { tocados.add(p.slug); if (WRITE) writeJson(p.file, doc); }
  }

  // 2 · el catálogo universal, que se indexa por nombre científico.
  let movidas = 0;
  for (const r of RENOMBRADOS) {
    if (!universal[r.viejo]) continue;
    if (universal[r.nuevo]) die(`El catálogo universal ya tiene «${r.nuevo}»: sería una fusión.`);
    const ficha = universal[r.viejo];
    if (ficha.scientificName) ficha.scientificName = r.nuevo;
    if (r.taxonId && ficha.eidosTaxonId) ficha.eidosTaxonId = r.taxonId;
    universal[r.nuevo] = ficha;
    delete universal[r.viejo];
    movidas++;
    console.log(`${WRITE ? '±' : '~'} catálogo universal: ${r.viejo} → ${r.nuevo}`);
  }
  /*
   * Y se reordena. El catálogo universal está ordenado por nombre científico, y una clave nueva se
   * añade al final: sin esto, renombrar ocho entradas produce un diff de 468 líneas en el que las
   * ocho que importan quedan enterradas. Es la misma razón por la que `io.writeJson` fija el formato
   * canónico —que el diff enseñe lo que ha cambiado y no cómo se escribió—, aplicada al orden.
   */
  if (movidas && WRITE) {
    const ordenado = {};
    for (const k of Object.keys(universal).sort((a, b) => a.localeCompare(b))) ordenado[k] = universal[k];
    writeJson(universalPath, ordenado);
  }

  // 3 · la equivalencia, sin la cual la siguiente regeneración vuelve a partir el taxón en dos.
  let nuevas = 0;
  for (const r of RENOMBRADOS) {
    if (equiv.equivalencias.some(e => e.nombreEnLaFuente === r.viejo)) continue;
    equiv.equivalencias.push({
      nombreEnLaFuente: r.viejo,
      nombreEnElCatalogo: r.nuevo,
      verificadoCon: `EIDOS v_taxonomia, ${r.eidos}.`,
      porQueNoLoCierraEidos:
        'Lo cierra, y por eso esta entrada es para el cruce con fuentes de época anterior, no para ' +
        'el pipeline: las fuentes oficiales seguirán citando el nombre viejo durante años (el ' +
        'Formulario Normalizado de un sitio revisado en 2023 aún escribe «Sylvia undata») y el ' +
        'cruce por binomio contra el catálogo, que ya usa el nuevo, da cero coincidencias.',
      consultado: HOY,
    });
    nuevas++;
  }
  if (nuevas && WRITE) writeJson(equivPath, equiv);
  console.log(`${WRITE ? '+' : '~'} equivalencias: ${nuevas} entrada(s) nueva(s)`);

  // Y el anexo normativo, que transcribe lo que dice la norma y por tanto conserva el nombre viejo:
  // necesita la clave adicional para no perder el respaldo, igual que con las erratas de imprenta.
  let entradasAnexo = 0;
  for (const entrada of Object.values(anexos.espacios || {})) {
    for (const e of entrada.especies || []) {
      const r = RENOMBRADOS.find(x => x.viejo === e.scientificName);
      if (!r || e.nombreCorregido) continue;
      e.nombreCorregido = r.nuevo;
      e.nota = (e.nota ? e.nota + ' ' : '') +
        `La norma la cita como «${r.viejo}»; EIDOS lo da por sinónimo y acepta «${r.nuevo}», con el ` +
        `que la ficha el catálogo (verificado ${HOY}).`;
      entradasAnexo++;
    }
  }
  if (entradasAnexo && WRITE) writeJson(anexosPath, anexos);
  console.log(`${WRITE ? '+' : '~'} anexos normativos: ${entradasAnexo} entrada(s) con nombreCorregido`);

  if (SQL) escribeSql();

  console.log(`\n${fichas} ficha(s) renombrada(s) en ${tocados.size} espacio(s): ${[...tocados].join(', ') || '—'}`);
  if (!WRITE) console.log('Simulación: no se ha escrito nada. Añade --write para aplicarlo.');
  else if (fichas) {
    console.log('\nDespués de esto: npm run species:poda (el catálogo universal se indexa por nombre)');
    console.log('y npm run park:sql de los espacios tocados — la API manda sobre el park.json empaquetado.');
  }
}

main();
