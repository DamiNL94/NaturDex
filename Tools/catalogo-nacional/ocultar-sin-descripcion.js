#!/usr/bin/env node
'use strict';
/*
 * ocultar-sin-descripcion.js — pone `visible: false` a las fichas de especie que no tienen texto.
 *
 * El problema que resuelve
 * -----------------------
 * 76 de las 552 fichas del catálogo universal no tienen descripción, y la app las servía igual: una
 * tarjeta con nombre, foto y un hueco donde debería estar lo único que explica qué es esa especie.
 * No es un fallo de datos —EIDOS sencillamente no publica el atributo «Descripción de la especie»
 * para la mayor parte de la flora vascular: 70 de las 76 son Magnoliopsida y Liliopsida— pero
 * servirlas en blanco convierte un hueco conocido en una ficha rota a ojos del usuario.
 *
 * `visible: false` es el mecanismo que ya existía para esto (`Frontend/Js/data.js` filtra la especie
 * y la descuelga de sus hábitats, y el progreso del parque deja de contarla). Se usaba para
 * «evidencia insuficiente»; aquí se usa para «sin texto que enseñar». En los dos casos la ficha
 * SIGUE en el `park.json` con todos sus datos: no se borra nada, se deja de mostrar.
 *
 * Por qué es una herramienta aparte y no un paso de build-species-n2.js
 * --------------------------------------------------------------------
 * `build-species-n2.js` es quien manda sobre `visible`, pero necesita la selección aprobada del
 * espacio, y solo dos de los cinco espacios cerrados la tienen en el repo: los tres primeros son
 * anteriores a que la selección fuera un fichero. Esto tiene que poder pasar por los cinco.
 *
 * Es idempotente y NO sale a la red: decide mirando el propio `park.json`. Un segundo pase no
 * cambia un byte. Y no toca las que alguien haya ocultado a mano por otro motivo: solo escribe
 * cuando el motivo es la falta de descripción, y lo dice.
 *
 * Uso:
 *     node Tools/catalogo-nacional/ocultar-sin-descripcion.js [--park <slug>] [--dry] [--mostrar]
 *
 *     --mostrar  el camino de vuelta: devuelve a `visible: true` las que ya tengan descripción y
 *                sigan ocultas por este motivo. Sin él, dar texto a una ficha no la resucita.
 *
 * NO escribe en la base de datos (regla nº 2 de Tools/CLAUDE.md). Con backend desplegado hace falta
 * además el SQL del espacio: `Frontend/Js/data.js` da prioridad a la API sobre el park.json
 * empaquetado, así que sin él la app seguiría enseñando la ficha vacía.
 */

const fs = require('fs');
const { arg, flag } = require('../lib/cli');
const { readJson, rel, parkFiles } = require('../lib/io');

const PARK = arg('park');
const DRY = flag('dry');
const MOSTRAR = flag('mostrar');

// La marca que distingue «oculta porque no tiene texto» de «oculta por decisión de alguien». Sin
// ella, --mostrar no podría saber cuáles puede volver a encender sin pisar una decisión ajena.
const MOTIVO = 'Sin descripción: ninguna fuente publica texto para este taxón. Oculta hasta redactarla.';

const sinTexto = sp => !String(sp.description || '').trim();

function main() {
  const objetivo = parkFiles().filter(p => !PARK || p.slug === PARK);
  if (!objetivo.length) {
    console.error(PARK ? `No existe el espacio '${PARK}'.` : 'No hay ningún park.json.');
    process.exit(1);
  }

  let ocultadas = 0, mostradas = 0, yaOcultas = 0, ajenas = 0;

  for (const { slug, file } of objetivo) {
    const doc = readJson(file);
    const species = doc.species || [];
    if (!species.length) continue;

    const cambios = [];
    for (const sp of species) {
      const vacia = sinTexto(sp);
      const oculta = sp.visible === false;
      const porEsteMotivo = sp.hiddenReason === MOTIVO;

      if (vacia && !oculta) {
        sp.visible = false;
        sp.hiddenReason = MOTIVO;
        cambios.push(`− #${sp.id} ${sp.scientificName}`);
        ocultadas++;
      } else if (vacia && oculta && !porEsteMotivo) {
        // Ya estaba oculta por otra razón. No se pisa el motivo ajeno.
        ajenas++;
      } else if (vacia && oculta) {
        yaOcultas++;
      } else if (!vacia && oculta && porEsteMotivo) {
        if (MOSTRAR) {
          sp.visible = true;
          delete sp.hiddenReason;
          cambios.push(`+ #${sp.id} ${sp.scientificName}`);
          mostradas++;
        } else {
          console.log(`  · #${sp.id} ${sp.scientificName} ya tiene texto y sigue oculta (usa --mostrar)`);
        }
      }
    }

    if (!cambios.length) continue;
    const texto = JSON.stringify(doc, null, 2) + '\n';
    const previo = fs.readFileSync(file, 'utf8');
    if (previo === texto) continue;
    if (!DRY) fs.writeFileSync(file, texto, 'utf8');
    console.log(`${DRY ? '~' : '+'} ${rel(file)}  (${slug})`);
    cambios.forEach(c => console.log('   ' + c));
  }

  console.log(`\n${ocultadas} ocultada(s) por no tener descripción · ${mostradas} devuelta(s) a visible`);
  if (yaOcultas) console.log(`${yaOcultas} ya estaban ocultas por este mismo motivo (nada que hacer)`);
  if (ajenas) console.log(`⚠ ${ajenas} sin texto y ocultas por OTRO motivo: no se ha tocado su \`hiddenReason\``);
  if (ocultadas || mostradas) {
    console.log('\nEl manifiesto NO se ha tocado: la ficha sigue en el park.json y los contadores no cambian.');
    console.log('Con backend desplegado hace falta además regenerar y aplicar el SQL del espacio.');
  }
  if (DRY) console.log('\nSimulación: no se ha escrito nada.');
}

main();
