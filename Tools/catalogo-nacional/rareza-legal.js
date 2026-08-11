#!/usr/bin/env node
'use strict';
/*
 * rareza-legal.js — escribe `rarityLocal` en las fichas de especie de los park.json.
 *
 * El problema que resuelve
 * -----------------------
 * `rarityLocal` es el tramo 1–5 que decide lo excepcional que es una especie EN ESTE ESPACIO, y el
 * que gobierna las destacadas. Lo calcula `build-species-seleccion.js` cruzando las normas
 * estructuradas de EIDOS… pero eso solo sirve para los espacios nuevos: de los cinco cerrados, tres
 * son anteriores a que la selección fuera un fichero del repo, y volver a EIDOS pide red.
 *
 * Sin embargo el dato ya está escrito en cada ficha: `spainStatus` (universal, ámbito estatal) y
 * `murciaStatus` (local, catálogo autonómico) guardan la figura legal CON su norma. Esta herramienta
 * los lee y aplica la misma escalera de `lib/rareza.js` —la misma, no una copia— sobre el texto.
 *
 * Qué NO hace
 * -----------
 *   · No sale a la red y no inventa: si el texto no permite decidir, deja la ficha SIN `rarityLocal`
 *     y la lista. «Pendiente de confirmar» no es «sin figura de protección»; escribir un 1 ahí sería
 *     afirmar una comprobación que nadie ha hecho (CLAUDE.md, regla nº 2).
 *   · No toca `featured` salvo que se lo pidas con `--destacadas`. Cambiar qué especies destaca la
 *     app es una decisión de producto, no un efecto secundario de recalcular un campo.
 *   · No escribe en la base de datos. Con backend desplegado hace falta además el SQL del espacio.
 *
 * Es idempotente: un segundo pase no cambia un byte.
 *
 * Uso:
 *     node Tools/catalogo-nacional/rareza-legal.js [--park <slug>] [--dry] [--destacadas]
 */

const fs = require('fs');
const path = require('path');
const { arg, flag } = require('../lib/cli');
const { CATALOGO_DIR, OUT_DIR, readJson, writeJson, rel, parkFiles } = require('../lib/io');
const { SIGNIFICADO, tramoDeTexto } = require('../lib/rareza');

const PARK = arg('park');
const DRY = flag('dry');
const DESTACADAS = flag('destacadas');
const CATALOGO = flag('catalogo');

const RUTA_CATALOGO = path.join(CATALOGO_DIR, 'data', 'especies-universal.json');

/*
 * La procedencia del tramo, incluida la del tramo 1.
 *
 * Una especie sin figura de protección no tiene norma que citar, así que la primera versión le
 * dejaba la base a `null`… y entonces era indistinguible de una ficha SIN MIGRAR, que también la
 * tiene a null. El aviso de `validate` contaba 596 «pendientes» cuando solo 23 lo estaban: las otras
 * 573 estaban comprobadas y el resultado era «no hay nada».
 *
 * «Comprobado que no tiene figura» y «nadie lo ha mirado» son dos estados distintos y el segundo es
 * el único que hay que arrastrar. Por eso el tramo 1 también deja constancia, con su ausencia dentro.
 */
function base(r, ambito, origen) {
  if (r.motivo) return { categoria: r.motivo, ambito, origen };
  if (r.reconocido) return { categoria: 'Sin figura de protección', ambito, origen };
  return null; // ni figura ni negación: el texto no dice nada, y eso sí queda pendiente
}

/*
 * --catalogo: migra el `rarityScore` del CATÁLOGO UNIVERSAL.
 *
 * Es el otro tramo, el estatal, y el que llevaba 552 fichas siendo «criterio propio 1–5»: un número
 * puesto a ojo que nadie podía recalcular ni discutir, y que sin embargo decidía las destacadas y
 * ordenaba el catálogo.
 *
 * Se deriva del `spainStatus` de la propia ficha universal —solo ámbito estatal, que es lo único que
 * puede vivir en un campo universal: el catálogo autonómico es territorial y ya va en `rarityLocal`—
 * y se guarda al lado la figura que lo justifica, en `rarityBasis`. A partir de ahí, un `rarityScore`
 * sin `rarityBasis` es, por definición, uno que todavía no se ha migrado, y `validate` lo dice.
 *
 * Después hace falta `npm run species:apply` para bajarlo a todos los park.json (y generar el SQL).
 * Esta herramienta NO lo hace sola: son dos pasos distintos y el segundo ya tiene dueño.
 */
function migrarCatalogo() {
  if (!fs.existsSync(RUTA_CATALOGO)) { console.error(`No existe ${rel(RUTA_CATALOGO)}`); process.exit(1); }
  const catalogo = readJson(RUTA_CATALOGO);
  const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const cambios = [];
  const indeterminadas = [];
  let migradas = 0;

  for (const [sci, ficha] of Object.entries(catalogo)) {
    const r = tramoDeTexto(ficha.spainStatus);
    if (r.tramo === 1 && r.indeterminado) {
      indeterminadas.push({ slug: '(catálogo universal)', id: '—', sci, estatal: ficha.spainStatus || null, autonomico: null });
      continue;
    }
    const antes = ficha.rarityScore;
    if (antes !== r.tramo) cambios.push({ sci, antes, ahora: r.tramo, motivo: r.motivo });
    ficha.rarityScore = r.tramo;
    ficha.rarityBasis = base(r, 'estatal', 'spainStatus del catálogo universal');
    dist[r.tramo]++;
    migradas++;
  }

  if (!DRY) writeJson(RUTA_CATALOGO, catalogo);
  console.log(`${DRY ? '~' : '+'} ${rel(RUTA_CATALOGO)}`);
  console.log(`\n${migradas} ficha(s) universales migradas · ${cambios.length} cambian de tramo`);
  for (const n of [5, 4, 3, 2, 1]) console.log(`   ${n}  ${String(dist[n]).padStart(4)}  ${SIGNIFICADO[n]}`);

  // El reparto del ANTES frente al AHORA es lo que dice si el número viejo tenía algún criterio
  // detrás o era ruido. Sin esto, la migración es un salto a ciegas de 552 valores.
  const matriz = new Map();
  for (const c of cambios) {
    const k = `${c.antes ?? '—'} → ${c.ahora}`;
    matriz.set(k, (matriz.get(k) || 0) + 1);
  }
  console.log('\nMovimientos (viejo → nuevo):');
  for (const [k, n] of [...matriz].sort((a, b) => b[1] - a[1]).slice(0, 12)) {
    console.log(`   ${String(n).padStart(4)}  ${k}`);
  }
  if (indeterminadas.length) {
    console.log(`\n⚠ ${indeterminadas.length} sin migrar: su \`spainStatus\` dice «pendiente de confirmar».`);
    console.log('  Conservan el valor viejo, que sigue sin `rarityBasis` y por tanto sigue avisado.');
  }
  console.log('\nAhora hace falta `npm run species:apply` para bajarlo a los park.json y al SQL.');
  if (DRY) console.log('\nSimulación: no se ha escrito nada.');
}

function main() {
  if (CATALOGO) return migrarCatalogo();
  const objetivo = parkFiles().filter(p => !PARK || p.slug === PARK);
  if (!objetivo.length) { console.error(`No existe el espacio '${PARK}'.`); process.exit(1); }

  const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const indeterminadas = [];
  const cambiaDestacada = [];
  let escritas = 0, ficheros = 0;

  for (const { slug, file } of objetivo) {
    const doc = readJson(file);
    const species = doc.species || [];
    if (!species.length) continue;

    for (const sp of species) {
      const estatal = tramoDeTexto(sp.spainStatus);
      const autonomico = tramoDeTexto(sp.murciaStatus);

      // El tramo local toma la figura MÁS GRAVE de los dos ámbitos: una figura no anula a la otra, y
      // la autonómica es la que discrimina de verdad (el Estado manda casi todo al mismo cajón).
      const gana = autonomico.tramo > estatal.tramo ? autonomico : estatal;
      const tramo = Math.max(estatal.tramo, autonomico.tramo);

      if (tramo === 1 && (estatal.indeterminado || autonomico.indeterminado)) {
        indeterminadas.push({
          slug, id: sp.id, sci: sp.scientificName,
          estatal: sp.spainStatus || null, autonomico: sp.murciaStatus || null,
        });
        // Se BORRA un tramo previo si lo hubiera: dejar el viejo sería peor que no tener ninguno,
        // porque parecería comprobado.
        delete sp.rarityLocal;
        delete sp.rarityLocalBasis;
        continue;
      }

      sp.rarityLocal = tramo;
      // De dónde sale el tramo, para que el número no vuelva a ser una cifra sin procedencia. No
      // dice «EIDOS»: dice que se ha leído el texto del park.json, que es la verdad.
      sp.rarityLocalBasis = base(
        // Con tramo 1 gana el que HAYA leído algo: si el estatal dice «no incluida» y el autonómico
        // está vacío, la constancia es la del estatal.
        gana.motivo ? gana : (estatal.reconocido ? estatal : autonomico),
        gana === autonomico ? 'autonómico' : 'estatal',
        gana === autonomico ? 'murciaStatus del park.json' : 'spainStatus del park.json',
      );
      dist[tramo]++;
      escritas++;

      if (DESTACADAS) {
        const debe = tramo >= 4;
        if (sp.featured !== debe) {
          cambiaDestacada.push(`${slug} · #${sp.id} ${sp.scientificName}: ${sp.featured} → ${debe}`);
          sp.featured = debe;
        }
      }
    }

    const texto = JSON.stringify(doc, null, 2) + '\n';
    if (fs.readFileSync(file, 'utf8') === texto) continue;
    if (!DRY) fs.writeFileSync(file, texto, 'utf8');
    console.log(`${DRY ? '~' : '+'} ${rel(file)}  (${slug})`);
    ficheros++;
  }

  console.log(`\n${escritas} ficha(s) con tramo · ${ficheros} park.json tocado(s)`);
  for (const n of [5, 4, 3, 2, 1]) console.log(`   ${n}  ${String(dist[n]).padStart(4)}  ${SIGNIFICADO[n]}`);
  console.log(`   destacables (>= 4): ${dist[5] + dist[4]}`);

  if (!DESTACADAS) {
    console.log('\n`featured` NO se ha tocado. Pásale --destacadas cuando quieras que las destacadas');
    console.log('salgan de este tramo; es un cambio visible en la app y por eso no va por omisión.');
  } else if (cambiaDestacada.length) {
    console.log(`\n${cambiaDestacada.length} destacada(s) cambiada(s):`);
    cambiaDestacada.slice(0, 20).forEach(c => console.log('  · ' + c));
    if (cambiaDestacada.length > 20) console.log(`  … y ${cambiaDestacada.length - 20} más`);
  }

  if (indeterminadas.length) {
    console.log(`\n⚠ ${indeterminadas.length} ficha(s) SIN tramo: su estado legal dice «pendiente de confirmar».`);
    console.log('  No se les pone 1: eso afirmaría que se comprobó que no tienen figura.');
    const ruta = path.join(OUT_DIR, 'rareza-por-contrastar.md');
    if (!DRY) {
      fs.mkdirSync(OUT_DIR, { recursive: true });
      fs.writeFileSync(ruta, informe(indeterminadas), 'utf8');
      console.log(`  → ${rel(ruta)}`);
    }
  }
  if (DRY) console.log('\nSimulación: no se ha escrito nada.');
}

function informe(filas) {
  const l = [];
  l.push('# Fichas sin tramo de rareza: estado legal por contrastar', '');
  l.push(`${filas.length} fichas cuyo estado legal dice «pendiente de confirmar», «categoría exacta` +
    ' pendiente» o similar. **No tienen `rarityLocal`**: escribirles un 1 afirmaría que se comprobó' +
    ' que no tienen figura de protección, y lo que consta es que nadie lo comprobó.', '');
  l.push('Qué las resuelve, por este orden:', '',
    '1. **EIDOS** (`v_estadolegal`, IEPNB) para la figura estatal y la autonómica. Es la fuente que ya',
    '   usa `build-species-seleccion.js`; con red, basta con volver a generar la selección del espacio.',
    '2. **Lista Roja de la Flora Vascular Española 2008** para las que la citan sin categoría. Cuenta',
    '   en la escalera por decisión del 2026-08-11, así que su categoría sí cambia el tramo.',
    '3. Si ninguna la resuelve, el hueco se queda escrito aquí: es preferible a un número inventado.', '');
  l.push('| Espacio | # | Especie | Estado estatal | Estado autonómico |', '|---|---:|---|---|---|');
  for (const f of filas) {
    l.push(`| ${f.slug} | ${f.id} | *${f.sci}* | ${f.estatal || '—'} | ${f.autonomico || '—'} |`);
  }
  return l.join('\n') + '\n';
}

main();
