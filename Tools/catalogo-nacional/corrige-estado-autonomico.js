#!/usr/bin/env node
'use strict';
/*
 * corrige-estado-autonomico.js — aplica a los `park.json` las correcciones de `regionalStatus` que
 * el cotejo contra EIDOS ha demostrado, y solo dentro de la comunidad de la que habla el texto.
 *
 * El problema que resuelve
 * -----------------------
 * `npm run especies:legal` encuentra fichas cuyo `regionalStatus` **niega una protección que la
 * norma sí da** (clase B) o la afirma sin respaldo (clase A), pero no escribe: es un cotejo. Y no
 * puede escribir, porque el campo es **LOCAL** —vive en cada `park.json`, no en el catálogo
 * universal—, así que la corrección hay que llevarla a todos los espacios donde el taxón esté
 * fichado, uno a uno. Hacerlo a mano en nueve ficheros es cómo se crean las divergencias que la
 * auditoría del catálogo pasó dos días midiendo.
 *
 * El caso que lo motiva es el hallazgo C5: la **chova piquirroja** decía «No incluida en el Catálogo
 * Regional» en **nueve de los diez** espacios donde está fichada, y la Ley 7/1995 la tiene como «De
 * interés especial». El décimo, Sierra Espuña, lo tenía bien — y Barrancos de Gebas, que comparte
 * exactamente el mismo PORN que Espuña, lo tenía mal: la prueba de que el error es de redacción de
 * ficha y no de interpretación de la norma.
 *
 * Por qué la corrección va por COMUNIDAD y no por taxón a secas
 * ------------------------------------------------------------
 * Es la trampa nº 25 del `CLAUDE.md`: `regionalStatus` describe algo territorial, así que el día que
 * entre otra comunidad el mismo taxón tendrá legítimamente dos textos distintos, y sobrescribirlos
 * todos con el de Murcia sería inventarse la norma de la otra. Por eso cada corrección lleva su
 * `ccaa` y solo alcanza a los espacios cuyo `regionalCcaa` coincide.
 *
 * Lo que NO hace
 * --------------
 * **No toca `rarityLocal` ni `rarityLocalBasis`.** El tramo se deriva de este texto, y quien lo
 * deriva es `npm run especies:rareza` (`rareza-legal.js`), con la escalera de `lib/rareza.js`.
 * Calcularlo aquí sería una segunda copia del criterio, que es la regla nº 1 de `Tools/CLAUDE.md`.
 * El orden es: esta herramienta primero, `especies:rareza` detrás.
 *
 * **No escribe en la base de datos.** `regionalStatus`, `rarity_local` y `rarity_local_basis` son
 * columnas locales y no viajan en el `species-universal.sql` de `species:apply`: las redacta
 * `rareza-legal.js --sql`. Y la API manda sobre el paquete, así que sin ese SQL el usuario sigue
 * viendo el texto viejo (trampa nº 7 del `CLAUDE.md`).
 *
 * Escribe con `escribeEspacio()`, que sube el manifiesto: un `park.json` reescrito sin subir la
 * versión deja al usuario que lo tenga guardado sin conexión con el dato viejo (trampa nº 11).
 *
 * Idempotente: un segundo pase no cambia un byte.
 *
 * Uso:
 *     node Tools/catalogo-nacional/corrige-estado-autonomico.js            informe, sin escribir
 *     node Tools/catalogo-nacional/corrige-estado-autonomico.js --write    lo aplica
 *       [--correcciones <ruta.json>]
 */

const path = require('path');
const { flag, arg } = require('../lib/cli');
const { CATALOGO_DIR, readJson, parkFiles, escribeEspacio, rel, fromRoot } = require('../lib/io');

const WRITE = flag('write');
const RUTA = arg('correcciones')
  ? fromRoot(arg('correcciones'))
  : path.join(CATALOGO_DIR, 'data', 'estado-autonomico-correcciones.json');

const doc = readJson(RUTA);
const correcciones = doc.correcciones || [];
if (!correcciones.length) { console.log(`Sin correcciones en ${rel(RUTA)}.`); process.exit(0); }

console.log(`Correcciones declaradas en ${rel(RUTA)}: ${correcciones.length}`);

const porEspacio = new Map();   // slug → { entrada, cambios: [] }
const yaEstaban = [];
const fueraDeCcaa = [];

for (const p of parkFiles()) {
  const pj = readJson(p.file);
  if (!(pj.species || []).length) continue;
  const cambios = [];

  for (const c of correcciones) {
    for (const s of pj.species) {
      if (s.scientificName !== c.scientificName) continue;
      // La corrección habla de UNA comunidad: fuera de ella no dice nada.
      if (c.ccaa && s.regionalCcaa && s.regionalCcaa !== c.ccaa) { fueraDeCcaa.push({ slug: p.slug, sn: s.scientificName, ccaa: s.regionalCcaa }); continue; }
      if (s.regionalStatus === c.regionalStatus) { yaEstaban.push({ slug: p.slug, sn: s.scientificName }); continue; }
      cambios.push({ ficha: s, sn: s.scientificName, antes: s.regionalStatus, despues: c.regionalStatus });
    }
  }
  if (cambios.length) porEspacio.set(p.slug, { entrada: p, doc: pj, cambios });
}

const total = [...porEspacio.values()].reduce((a, e) => a + e.cambios.length, 0);

for (const [slug, e] of porEspacio) {
  console.log(`\n▶ ${slug}`);
  for (const c of e.cambios) {
    console.log(`   · ${c.sn}`);
    console.log(`     antes:   ${JSON.stringify(String(c.antes ?? '').slice(0, 100))}`);
    console.log(`     después: ${JSON.stringify(c.despues.slice(0, 100))}`);
  }
}

console.log(`\nFichas a corregir: ${total} en ${porEspacio.size} espacio(s) · ya correctas: ${yaEstaban.length}`);
if (fueraDeCcaa.length) {
  console.log(`Fuera del ámbito de la corrección (otra comunidad): ${fueraDeCcaa.length}`);
  for (const f of fueraDeCcaa) console.log(`   · ${f.slug} · ${f.sn} (${f.ccaa})`);
}

if (!total) { console.log('\nNada que escribir: los park.json ya están al día.'); process.exit(0); }

if (!WRITE) {
  console.log('\nSimulación: no se ha escrito ningún park.json. Repite con --write.');
  process.exit(0);
}

for (const [, e] of porEspacio) {
  for (const c of e.cambios) c.ficha.regionalStatus = c.despues;
  escribeEspacio({ dir: e.entrada.dir, file: e.entrada.file, manifestFile: e.entrada.manifestFile, doc: e.doc });
  console.log(`   = ${rel(e.entrada.file)}`);
}
console.log(`\n+ ${total} ficha(s) en ${porEspacio.size} park.json.`);
console.log('Siguiente, y NO es opcional: `npm run especies:rareza -- --sql Database/rareza-local.sql`,');
console.log('que es quien deriva `rarityLocal` de este texto y redacta el SQL de las columnas locales.');
