#!/usr/bin/env node
'use strict';
/*
 * migra-estado-regional.js — `murciaStatus` → `regionalStatus` + `regionalCcaa` en las fichas ya
 * escritas, que es la mitad de la deuda nº 2 que no arregla renombrar la columna.
 *
 * El problema que resuelve
 * -----------------------
 * `murcia_status` era «el bloqueo real del rollout nacional a nivel de campo»: cada comunidad tiene
 * su propio catálogo de especies amenazadas —Murcia tiene DOS, uno de flora (Decreto n.º 50/2003) y
 * otro de fauna (Ley 7/1995)— y un campo con el nombre de una comunidad dentro no puede guardar el
 * de las otras dieciséis. El pipeline ya era consciente de la comunidad (la saca de
 * `park.region`); lo que estaba atado era **el nombre del campo y el rótulo de la app**, que decía
 * «Región de Murcia» escrito a mano en el HTML.
 *
 * Renombrar la columna y el campo del pipeline no basta: hay **2.945 fichas escritas** con la clave
 * vieja en dieciséis `park.json`, y regenerarlas con `build-species-n2.js` es la trampa nº 6 del
 * CLAUDE.md (reescribe el catálogo desde la selección aprobada y devuelve las aves que `aves:poda`
 * quitó a ocho de los dieciséis espacios). Esto renombra la clave **in situ** y añade
 * `regionalCcaa`, sin tocar nada más.
 *
 * De dónde sale `regionalCcaa`, y por qué no se pone «Región de Murcia» a todas
 * ----------------------------------------------------------------------------
 * De `park.region` de CADA espacio, que es el mismo sitio del que lo saca el pipeline. Hoy las
 * dieciséis dan «Región de Murcia» y el resultado es idéntico a escribirlo a mano, pero la
 * diferencia importa el día que entre el primer espacio de otra comunidad: una constante habría que
 * acordarse de cambiarla, y esto no. Un espacio **sin** `park.region` no se toca y sale avisado: la
 * comunidad no se adivina por el slug.
 *
 * Qué NO hace
 * -----------
 * **No reescribe el texto de `regionalStatus`.** Los 85 textos distintos que hay hoy son la cita de
 * la norma tal y como la devolvió EIDOS, y varios traen añadidos del piloto que no son estado legal
 * («Fauna protegida; gecko común en roquedos y muros», «Ave de la ZEPA ES0000261»). Limpiarlos es
 * otro trabajo, con la fuente delante y ficha a ficha; aquí solo se mueve la clave.
 *
 * **No inventa la comunidad de una ficha que no la tenga**. Y no borra: el campo viejo desaparece
 * porque se renombra, no porque se tire el dato.
 *
 * Idempotente: un segundo pase no cambia un byte. `--sql` escribe los `UPDATE` de `regional_ccaa`
 * para la base —el renombrado de la columna lo hace `Database/migrations.sql`, que conserva los
 * datos, así que lo único que falta rellenar allí es la comunidad—.
 *
 * Uso:
 *     node Tools/catalogo-nacional/migra-estado-regional.js
 *     node Tools/catalogo-nacional/migra-estado-regional.js --write [--sql Database/regional-ccaa.sql]
 */

const fs = require('fs');
const path = require('path');
const { arg, flag } = require('../lib/cli');
const { DATABASE, readJson, rel, parkFiles, escribeEspacio } = require('../lib/io');
const { sqlStr, cabeceraSql } = require('../lib/sql');

const WRITE = flag('write');
const SQL = arg('sql', null);
const HOY = '2026-08-27';

function migra() {
  const porEspacio = [];
  let renombradas = 0, conCcaa = 0, sinRegion = 0;

  for (const espacio of parkFiles()) {
    const doc = readJson(espacio.file);
    const comunidad = (doc.park && doc.park.region) || null;
    const species = doc.species || [];
    if (!species.length) continue;

    if (!comunidad) {
      console.warn(`  ! ${espacio.slug}: su park.json no dice \`park.region\`, así que no se le puede`);
      console.warn('    poner la comunidad. Se renombra la clave y `regionalCcaa` se queda sin escribir.');
      sinRegion++;
    }

    let r = 0, c = 0;
    for (const sp of species) {
      // El renombrado conserva la POSICIÓN de la clave dentro del objeto: reconstruir la ficha con
      // el orden cambiado produce un diff completo de 2.945 fichas y entierra lo que sí cambia.
      if (Object.prototype.hasOwnProperty.call(sp, 'murciaStatus')) {
        const claves = Object.keys(sp);
        const valores = {};
        for (const k of claves) valores[k] = sp[k];
        for (const k of claves) delete sp[k];
        for (const k of claves) {
          if (k === 'murciaStatus') { sp.regionalStatus = valores[k]; if (comunidad) sp.regionalCcaa = comunidad; }
          else sp[k] = valores[k];
        }
        r++;
        if (comunidad) c++;
      } else if (comunidad && sp.regionalStatus !== undefined && sp.regionalCcaa === undefined) {
        // Ficha ya renombrada por otra vía (una regeneración) a la que le falta la comunidad.
        sp.regionalCcaa = comunidad;
        c++;
      }
    }

    if (!r && !c) continue;
    renombradas += r; conCcaa += c;
    porEspacio.push({ slug: espacio.slug, comunidad, fichas: species.length, renombradas: r });
    console.log(`\n${espacio.slug} · ${comunidad || '(sin park.region)'}`);
    console.log(`  · ${r} ficha(s) con la clave renombrada · ${c} con comunidad escrita`);
    const { lineas } = escribeEspacio({ dir: espacio.dir, file: espacio.file, doc, write: WRITE });
    for (const l of lineas) console.log('  ' + l);
  }

  return { porEspacio, renombradas, conCcaa, sinRegion };
}

/*
 * El SQL solo rellena `regional_ccaa`.
 *
 * El renombrado de la columna lo hace `Database/migrations.sql` con `RENAME COLUMN`, que **conserva
 * los datos**: no hay que volver a escribir los 2.945 textos. Lo único que la base no puede deducir
 * sola es de qué comunidad habla cada fila, y eso se sabe por el espacio — una sentencia por
 * espacio, no una por ficha.
 */
function escribeSql(porEspacio, ruta) {
  const conComunidad = porEspacio.filter(e => e.comunidad);
  const l = [];
  l.push(cabeceraSql(null).trimEnd(), '');
  l.push('-- ' + '='.repeat(96));
  l.push(`-- NaturDex · comunidad autónoma del estado regional de cada ficha (${HOY})`);
  l.push('-- ' + '-'.repeat(96));
  l.push('-- Generado por `node Tools/catalogo-nacional/migra-estado-regional.js --write --sql`.');
  l.push('--');
  l.push('-- VA DESPUÉS de `Database/migrations.sql`, que es quien renombra `murcia_status` a');
  l.push('-- `regional_status` y crea `regional_ccaa`. El renombrado CONSERVA los textos: aquí no se');
  l.push('-- vuelve a escribir ninguno, solo se dice de qué comunidad hablan.');
  l.push('--');
  l.push('-- Una sentencia por ESPACIO y no por ficha: la comunidad es del espacio, no del taxón.');
  l.push('-- Idempotente: aplicado dos veces, la segunda escribe el mismo valor.');
  l.push('-- ' + '='.repeat(96), '');
  l.push('START TRANSACTION;', '');
  for (const e of conComunidad) {
    l.push(`-- ${e.slug} · ${e.fichas} ficha(s)`);
    l.push('UPDATE species sp JOIN parks pk ON pk.id = sp.park_id');
    l.push(`   SET sp.regional_ccaa = ${sqlStr(e.comunidad)}`);
    l.push(` WHERE pk.slug = ${sqlStr(e.slug)};`, '');
  }
  l.push('COMMIT;', '');
  l.push('-- Comprobación: no debe quedar ninguna ficha con estado regional y sin comunidad.');
  l.push('SELECT pk.slug, COUNT(*) AS sin_comunidad');
  l.push('  FROM species sp JOIN parks pk ON pk.id = sp.park_id');
  l.push(' WHERE sp.regional_status IS NOT NULL AND sp.regional_ccaa IS NULL');
  l.push(' GROUP BY pk.slug;');

  const destino = path.isAbsolute(ruta) ? ruta : path.join(DATABASE, path.basename(ruta));
  if (WRITE) fs.writeFileSync(destino, l.join('\n') + '\n', 'utf8');
  console.log(`\n${WRITE ? '+' : '~'} ${rel(destino)} (${conComunidad.length} UPDATE)`);
}

const { porEspacio, renombradas, conCcaa, sinRegion } = migra();
if (!renombradas && !conCcaa) {
  console.log('\nNada que migrar: las fichas ya usan `regionalStatus` + `regionalCcaa`.');
} else {
  console.log(`\n${renombradas} ficha(s) renombradas · ${conCcaa} con comunidad · ${porEspacio.length} espacio(s)`);
  if (sinRegion) console.log(`⚠ ${sinRegion} espacio(s) sin \`park.region\`: su comunidad se queda sin escribir.`);
  if (SQL) escribeSql(porEspacio, SQL);
  if (!WRITE) console.log('\nSimulación. Añade --write para escribirlo.');
}
