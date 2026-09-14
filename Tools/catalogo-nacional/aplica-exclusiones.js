#!/usr/bin/env node
'use strict';
/*
 * aplica-exclusiones.js — retira de un `park.json` YA ESCRITO las fichas que
 * `data/exclusiones-especies.json` da por excluidas, y redacta el borrado para la base.
 *
 * El problema que resuelve
 * -----------------------
 * `exclusiones-especies.json` existe para que una decisión de curación no se deshaga sola: la lee
 * `build-species-seleccion.js` y las especies que enumera no vuelven a entrar en la selección de ese
 * espacio. Eso cubre el futuro — y **no toca lo ya publicado**. Una exclusión escrita DESPUÉS de que
 * el espacio se escribiera se queda ahí, cerrando una puerta por la que la ficha ya había pasado, y
 * el catálogo sigue publicándola. No falla nada y nadie avisa: la herramienta que sabe de
 * exclusiones no mira los `park.json`, y la que escribe los `park.json` no vuelve a pasar.
 *
 * Le ocurrió a la *Posidonia oceanica* de San Pedro del Pinatar: excluida el 2026-08-29 —fanerógama
 * marina en un parque sin un solo HIC marino, sus ocurrencias son arribazón—, aquella pasada le vació
 * los `habitatIds` y la ficha se quedó **publicada y visible**. Dieciséis días después seguía ahí, y
 * de paso su `source` regenerado la describía como «un taxón volador», que es la frase que el
 * generador escribe para lo que no cuelga de ningún hábitat.
 *
 * Regenerar el espacio NO es la salida: es la trampa nº 6 del CLAUDE.md —un espacio publicado que se
 * regenera recupera las aves que `aves:poda` le quitó, porque la poda no toca la selección—. Así que
 * esto hace UNA cosa: quitar las fichas excluidas y no tocar nada más.
 *
 * Y POR QUÉ HACE FALTA ADEMÁS EL SQL (`--sql`)
 * --------------------------------------------
 * `build-park-sql.js` solo hace UPSERT. Regenerar el `-n2.sql` después de quitar una ficha deja la
 * base igual que antes, y `Frontend/Js/data.js` da prioridad a la API sobre el paquete: el
 * repositorio sin la ficha y el usuario viéndola. El borrado se escribe aparte y con los nombres uno
 * a uno, que es lo que un DELETE necesita y un UPSERT no.
 *
 * Idempotente: en un segundo pase no encuentra nada que quitar, no reescribe el `park.json` y no
 * sube la versión del manifiesto.
 *
 * Uso:
 *   node Tools/catalogo-nacional/aplica-exclusiones.js [--park <slug>] [--write]
 *                                                      [--sql <ruta|auto>]
 *
 *   Sin `--park` recorre TODOS los espacios con exclusiones escritas, que es también la forma de
 *   comprobar que las ya ejecutadas siguen ejecutadas.
 *   `--sql auto` escribe `Database/poda-exclusiones-<slug>.sql` por cada espacio con algo que
 *   retirar.
 */
const fs = require('fs');
const path = require('path');

const { arg, flag } = require('../lib/cli');
const { DATABASE, CATALOGO_DIR, readJson, rel, fromRoot, parkFiles, escribeEspacio } = require('../lib/io');
const { sqlStr, cabeceraSql } = require('../lib/sql');

const PARK = arg('park');
const WRITE = flag('write');
const SQL = arg('sql');

const RUTA_EXCLUSIONES = path.join(CATALOGO_DIR, 'data', 'exclusiones-especies.json');
if (!fs.existsSync(RUTA_EXCLUSIONES)) {
  console.error(`No existe ${rel(RUTA_EXCLUSIONES)}.`);
  process.exit(1);
}
const EXCLUSIONES = readJson(RUTA_EXCLUSIONES).espacios || {};

/** El `.sql` de un espacio: la ruta que pida `--sql`, o la canónica con `auto`. */
function rutaSql(slug) {
  if (!SQL) return null;
  if (SQL === 'auto') return path.join(DATABASE, `poda-exclusiones-${slug}.sql`);
  return fromRoot(SQL);
}

/**
 * El borrado, con el motivo de la exclusión copiado dentro.
 *
 * El motivo va en el fichero y no solo en el informe a propósito: quien aplique esto a la base de
 * producción tiene que poder leer por qué se borra sin salir del `.sql`.
 */
function redactaSql(espacio, retiradas) {
  const l = [];
  l.push(cabeceraSql());
  l.push(`-- ${espacio.name} (${espacio.slug}) · retirada de las especies excluidas a mano`);
  l.push(`-- Generado por Tools/catalogo-nacional/aplica-exclusiones.js desde`);
  l.push('-- Tools/catalogo-nacional/data/exclusiones-especies.json');
  l.push('--');
  l.push('-- Son decisiones de curación: los filtros de build-species-seleccion.js aprobaron la especie');
  l.push('-- y una revisión con el dato delante concluyó que no debe entrar. El motivo, tal cual está');
  l.push('-- escrito en el fichero de exclusiones, va debajo de cada nombre.');
  l.push('--');
  l.push('-- HACE FALTA porque build-park-sql.js solo hace UPSERT: regenerar el -n2.sql corrige y da de');
  l.push('-- alta, pero no retira nada. Sin este fichero, la API sigue sirviendo la ficha excluida.');
  l.push('--');
  l.push('-- ANTES DE APLICARLO:');
  l.push('--   · Haz copia (npm run db:backup). Un DELETE no se deshace con otra pasada.');
  l.push('--   · `observations` tiene clave foránea a `species` con ON DELETE CASCADE: si alguien');
  l.push('--     hubiera anotado una observación de esta ficha, se borra con ella. El SELECT de');
  l.push('--     comprobación de más abajo lo dice ANTES, y por eso va antes del DELETE.');
  l.push('--   · user_progress.payload indexa los descubrimientos por el species_id de cada parque, así');
  l.push('--     que quien la hubiera descubierto conserva una marca que ya no apunta a ninguna ficha.');
  l.push('--     Después de aplicar esto hay que pasar Tools/recalculate-account-progress.php para que');
  l.push('--     el progreso y los logros cuadren.');
  l.push('--   · Las citas Darwin Core (user_occurrences) NO se tocan: no tienen clave foránea a');
  l.push('--     species precisamente para esto, y llevan su taxonomía copiada.');
  l.push('');

  const nombres = retiradas.map(r => r.sp.scientificName).sort((a, b) => a.localeCompare(b));
  const enLista = nombres.map(n => sqlStr(n)).join(', ');

  l.push('-- Lo que hay en la base AHORA. Léelo antes de seguir: si `observaciones` no es 0, el DELETE');
  l.push('-- se las lleva por cascada.');
  l.push('SELECT s.id, s.scientific_name, s.is_visible,');
  l.push('       (SELECT COUNT(*) FROM observations o WHERE o.species_id = s.id) AS observaciones');
  l.push('FROM species s JOIN parks p ON p.id = s.park_id');
  l.push(`WHERE p.slug = ${sqlStr(espacio.slug)} AND s.scientific_name IN (${enLista});`);
  l.push('');
  l.push('START TRANSACTION;');
  l.push('');
  l.push('DELETE sp FROM species sp');
  l.push('JOIN parks pk ON pk.id = sp.park_id');
  l.push(`WHERE pk.slug = ${sqlStr(espacio.slug)}`);
  l.push('  AND sp.scientific_name IN (');
  retiradas.sort((a, b) => a.sp.scientificName.localeCompare(b.sp.scientificName))
    .forEach((r, i) => {
      l.push(`    ${sqlStr(r.sp.scientificName)}${i < retiradas.length - 1 ? ',' : ''}` +
        `  -- ${r.sp.commonName || '—'}`);
      // El motivo, partido en líneas de comentario para que se lea sin desplazamiento horizontal.
      for (const linea of troceaMotivo(r.motivo)) l.push(`    --   ${linea}`);
    });
  l.push('  );');
  l.push('');
  l.push('COMMIT;');
  l.push('');
  l.push('-- Comprobación: `retiradas_que_siguen` debe ser 0 y el total, el del park.json.');
  l.push('SELECT');
  l.push(`    (SELECT COUNT(*) FROM species s JOIN parks p ON p.id = s.park_id` +
    ` WHERE p.slug = ${sqlStr(espacio.slug)}) AS especies_del_espacio,`);
  l.push(`    (SELECT COUNT(*) FROM species s JOIN parks p ON p.id = s.park_id` +
    ` WHERE p.slug = ${sqlStr(espacio.slug)} AND s.scientific_name IN (${enLista})) AS retiradas_que_siguen;`);
  return l.join('\n') + '\n';
}

/** Parte un motivo largo en líneas de ~95 caracteres, sin cortar palabras. */
function troceaMotivo(motivo, ancho = 95) {
  const out = [];
  let linea = '';
  for (const palabra of String(motivo || '').split(/\s+/)) {
    if (!palabra) continue;
    if ((linea + ' ' + palabra).trim().length > ancho) { out.push(linea.trim()); linea = palabra; }
    else linea += ' ' + palabra;
  }
  if (linea.trim()) out.push(linea.trim());
  return out;
}

// --- Recorrido ------------------------------------------------------------------------------------

const espacios = parkFiles().filter(p => (PARK ? p.slug === PARK : EXCLUSIONES[p.slug]));
if (!espacios.length) {
  console.error(PARK ? `No hay ningún espacio con slug «${PARK}».` : 'Ningún espacio tiene exclusiones escritas.');
  process.exit(1);
}

let totalRetiradas = 0;
for (const p of espacios) {
  const lista = EXCLUSIONES[p.slug] || [];
  if (!lista.length) { console.log(`· ${p.slug}: sin exclusiones escritas`); continue; }

  const doc = readJson(p.file);
  const porNombre = new Map(lista.map(e => [e.scientificName, e]));
  const retiradas = [];
  const quedan = [];
  for (const sp of doc.species || []) {
    const e = porNombre.get(sp.scientificName);
    if (e) retiradas.push({ sp, motivo: e.motivo, decidido: e.decidido });
    else quedan.push(sp);
  }

  const ausentes = [...porNombre.keys()].filter(n => !retiradas.some(r => r.sp.scientificName === n));
  console.log(`\n· ${p.slug}: ${lista.length} exclusión(es) escrita(s) · ${retiradas.length} ficha(s) publicada(s) que retirar` +
    (ausentes.length ? ` · ${ausentes.length} ya retirada(s): ${ausentes.join(', ')}` : ''));

  if (!retiradas.length) continue;
  totalRetiradas += retiradas.length;

  for (const r of retiradas) {
    console.log(`    − ${r.sp.scientificName} (${r.sp.commonName || '—'}) · id ${r.sp.id}` +
      ` · visible: ${r.sp.visible !== false} · hábitats: ${(r.sp.habitatIds || []).length} · excluida el ${r.decidido}`);
  }

  doc.species = quedan;
  // El inverso especie↔hábitat: una ficha retirada que colgara de un hábitat dejaría su id en
  // `speciesIds`, y eso es una referencia rota que el validador SÍ ve.
  const porHabitat = new Map((doc.habitats || []).map(h => [h.id, []]));
  for (const sp of quedan) for (const hid of sp.habitatIds || []) if (porHabitat.has(hid)) porHabitat.get(hid).push(sp.id);
  for (const h of doc.habitats || []) h.speciesIds = (porHabitat.get(h.id) || []).sort((a, b) => a - b);

  // Paquete y `version` del manifiesto en el mismo paso: aquí se RETIRAN fichas, así que un
  // dispositivo que no vuelva a descargarlo seguiría enseñando la excluida.
  const { lineas } = escribeEspacio({
    file: p.file, manifestFile: path.join(p.dir, 'manifest.json'), doc,
    counts: { species: quedan.length }, write: WRITE,
  });
  console.log('    ' + lineas.join('\n    '));

  const ruta = rutaSql(p.slug);
  if (ruta) {
    const sql = redactaSql({ slug: p.slug, name: (doc.park && doc.park.name) || p.slug }, retiradas);
    if (WRITE) fs.writeFileSync(ruta, sql, 'utf8');
    console.log(`    ${WRITE ? '+' : '~'} ${rel(ruta)} (${retiradas.length} borrado(s))`);
  }
}

console.log(`\n${totalRetiradas} ficha(s) retirada(s) en total.`);
if (!WRITE && totalRetiradas) console.log('Simulación: no se ha escrito nada. Repite con --write.');
