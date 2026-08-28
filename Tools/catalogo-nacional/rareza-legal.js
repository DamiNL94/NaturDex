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
 * `regionalStatus` (local, catálogo autonómico) guardan la figura legal CON su norma. Esta herramienta
 * los lee y aplica la misma escalera de `lib/rareza.js` —la misma, no una copia— sobre el texto.
 *
 * Qué NO hace
 * -----------
 *   · No sale a la red y no inventa: si el texto no permite decidir, deja la ficha SIN `rarityLocal`
 *     y la lista. «Pendiente de confirmar» no es «sin figura de protección»; escribir un 1 ahí sería
 *     afirmar una comprobación que nadie ha hecho (CLAUDE.md, regla nº 2).
 *   · No toca `featured` salvo que se lo pidas con `--destacadas`. Cambiar qué especies destaca la
 *     app es una decisión de producto, no un efecto secundario de recalcular un campo.
 *   · No escribe en la base de datos. Lo que sí hace desde el 2026-08-27 es REDACTARLO: `--sql
 *     <ruta>` escribe los UPDATE de las tres columnas locales que toca (`rarity_local`,
 *     `rarity_local_basis` e `is_featured`), que NO viajan en el `species-universal.sql` de
 *     `species:apply` porque ése solo lleva los universales. Antes el único camino era regenerar el
 *     `-n2.sql` entero del espacio, que es la trampa nº 6 del CLAUDE.md.
 *
 * Es idempotente: un segundo pase no cambia un byte.
 *
 * Uso:
 *     node Tools/catalogo-nacional/rareza-legal.js [--park <slug>] [--dry] [--destacadas]
 *       [--sql <ruta>]
 *     node Tools/catalogo-nacional/rareza-legal.js --catalogo [--dry]
 */

const fs = require('fs');
const path = require('path');
const { arg, flag } = require('../lib/cli');
const { CATALOGO_DIR, OUT_DIR, DATABASE, readJson, writeJson, rel, parkFiles, escribeEspacio } = require('../lib/io');
const { sqlStr, sqlNum, sqlJson, cabeceraSql } = require('../lib/sql');
const { SIGNIFICADO, tramoDeTexto, baseDeTramo } = require('../lib/rareza');

const PARK = arg('park');
const DRY = flag('dry');
const DESTACADAS = flag('destacadas');
const CATALOGO = flag('catalogo');
const SQL = arg('sql', null);

const RUTA_CATALOGO = path.join(CATALOGO_DIR, 'data', 'especies-universal.json');

/*
 * La procedencia del tramo vive en `lib/rareza.js` desde el 2026-08-27, junto a la escalera que la
 * produce: `build-species-universal.js` pasó ese día a derivar el `rarityScore` de la figura legal,
 * y con una copia aquí el mismo taxón acabaría con dos procedencias distintas según lo escribiera el
 * generador de fichas nuevas o esta migración.
 */
const base = baseDeTramo;

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

/*
 * `--sql`: los tres campos LOCALES que esta herramienta escribe y que no llegaban a la base.
 *
 * `rarityScore` y `rarityBasis` son universales y viajan en el `species-universal.sql` que genera
 * `species:apply`. Pero `rarityLocal`, `rarityLocalBasis` y `featured` son **locales**: no están en
 * ese volcado, y hasta el 2026-08-27 la única forma de bajarlos era regenerar el `-n2.sql` entero
 * del espacio, que es la trampa nº 6 del CLAUDE.md —reescribe la ficha desde la selección aprobada y
 * a un espacio que haya pasado por `aves:poda` le devuelve las aves podadas—.
 *
 * O sea que el consejo que esta misma cabecera daba («hace falta además el SQL del espacio») pedía
 * hacer algo peligroso para publicar un recálculo, y con la API por delante del paquete lo más
 * probable era no hacerlo: el tramo quedaba bien en el repositorio y viejo en lo que ve el usuario.
 * Esto escribe solo esas tres columnas, fila a fila, casando por espacio y nombre científico.
 *
 * `featured` solo se incluye si se pasó `--destacadas`: si no, esta pasada no lo ha tocado y
 * escribirlo sería publicar como decisión de hoy un valor que viene de antes.
 */
function escribeSql(filas, ruta) {
  const l = [];
  l.push(cabeceraSql(null).trimEnd(), '');
  l.push('-- ' + '='.repeat(96));
  l.push('-- NaturDex · tramo de rareza LOCAL por espacio' + (DESTACADAS ? ' y destacadas' : ''));
  l.push('-- ' + '-'.repeat(96));
  l.push('-- Generado por `npm run especies:rareza -- --sql <ruta>`' + (DESTACADAS ? ' --destacadas' : '') + '.');
  l.push('--');
  l.push('-- QUÉ ES ESTO. `rarity_local`, `rarity_local_basis` y `is_featured` son campos LOCALES: no');
  l.push('-- viajan en `species-universal.sql`, que solo lleva los universales. Sin este fichero, un');
  l.push('-- recálculo del tramo queda bien en el repositorio y viejo en la base — y la API tiene');
  l.push('-- prioridad sobre el `park.json` empaquetado, así que es la base la que ve el usuario.');
  l.push('--');
  l.push('-- Se tocan SOLO esas columnas. NO se regenera el `-n2.sql` del espacio, que reescribiría');
  l.push('-- la ficha entera desde la selección aprobada (trampa nº 6 del CLAUDE.md).');
  l.push('--');
  l.push('-- Una ficha SIN tramo —su estado legal dice «pendiente de confirmar»— se pone a NULL a');
  l.push('-- propósito: dejar el número viejo sería peor que no tener ninguno, porque parecería');
  l.push('-- comprobado. Es la misma regla que aplica el `park.json`.');
  l.push('--');
  l.push('-- Idempotente: aplicado dos veces, la segunda actualiza las mismas filas al mismo valor.');
  l.push('-- ' + '='.repeat(96), '');
  l.push('START TRANSACTION;', '');

  const porEspacio = new Map();
  for (const f of filas) {
    if (!porEspacio.has(f.slug)) porEspacio.set(f.slug, []);
    porEspacio.get(f.slug).push(f);
  }
  for (const [slug, lista] of porEspacio) {
    l.push(`-- ── ${slug} ${'─'.repeat(Math.max(0, 60 - slug.length))}  ${lista.length} ficha(s)`);
    for (const f of lista) {
      const sets = [
        `sp.rarity_local = ${sqlNum(f.tramo)}`,
        `sp.rarity_local_basis = ${sqlJson(f.basis)}`,
      ];
      if (DESTACADAS) sets.push(`sp.is_featured = ${f.featured ? 1 : 0}`);
      l.push('UPDATE species sp JOIN parks pk ON pk.id = sp.park_id');
      l.push(`   SET ${sets.join(', ')}`);
      l.push(` WHERE pk.slug = ${sqlStr(slug)} AND sp.scientific_name = ${sqlStr(f.sci)};`);
    }
    l.push('');
  }
  l.push('COMMIT;', '');

  const destino = path.isAbsolute(ruta) ? ruta : path.join(DATABASE, path.basename(ruta));
  if (!DRY) fs.writeFileSync(destino, l.join('\n') + '\n', 'utf8');
  console.log(`\n${DRY ? '~' : '+'} ${rel(destino)} (${filas.length} UPDATE)`);
}

function main() {
  if (CATALOGO) return migrarCatalogo();
  const objetivo = parkFiles().filter(p => !PARK || p.slug === PARK);
  if (!objetivo.length) { console.error(`No existe el espacio '${PARK}'.`); process.exit(1); }

  const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const indeterminadas = [];
  const cambiaDestacada = [];
  const filasSql = [];
  let escritas = 0, ficheros = 0;

  for (const { slug, file } of objetivo) {
    const doc = readJson(file);
    const species = doc.species || [];
    if (!species.length) continue;

    for (const sp of species) {
      const estatal = tramoDeTexto(sp.spainStatus);
      const autonomico = tramoDeTexto(sp.regionalStatus);

      // El tramo local toma la figura MÁS GRAVE de los dos ámbitos: una figura no anula a la otra, y
      // la autonómica es la que discrimina de verdad (el Estado manda casi todo al mismo cajón).
      const gana = autonomico.tramo > estatal.tramo ? autonomico : estatal;
      const tramo = Math.max(estatal.tramo, autonomico.tramo);

      if (tramo === 1 && (estatal.indeterminado || autonomico.indeterminado)) {
        indeterminadas.push({
          slug, id: sp.id, sci: sp.scientificName,
          estatal: sp.spainStatus || null, autonomico: sp.regionalStatus || null,
        });
        // Se BORRA un tramo previo si lo hubiera: dejar el viejo sería peor que no tener ninguno,
        // porque parecería comprobado. En la base es lo mismo: a NULL, no el número de antes.
        delete sp.rarityLocal;
        delete sp.rarityLocalBasis;
        filasSql.push({ slug, sci: sp.scientificName, tramo: null, basis: null, featured: !!sp.featured });
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
        gana === autonomico ? 'regionalStatus del park.json' : 'spainStatus del park.json',
      );
      dist[tramo]++;
      escritas++;
      filasSql.push({ slug, sci: sp.scientificName, tramo, basis: sp.rarityLocalBasis, featured: false });

      if (DESTACADAS) {
        const debe = tramo >= 4;
        if (sp.featured !== debe) {
          cambiaDestacada.push(`${slug} · #${sp.id} ${sp.scientificName}: ${sp.featured} → ${debe}`);
          sp.featured = debe;
        }
      }
      // El valor que va al SQL es el que la ficha tiene DESPUÉS de decidir, no el de antes.
      const ultima = filasSql[filasSql.length - 1];
      if (ultima && ultima.sci === sp.scientificName) ultima.featured = !!sp.featured;
    }

    /*
     * Por `escribeEspacio()` y no con un `writeFileSync`, que es lo que había aquí hasta el
     * 2026-08-27: esta herramienta era la OCTAVA copia del fallo de la deuda nº 37 —reescribir
     * fichas sin subir la `version` del manifiesto—, y la única que quedaba viva después de taparlo
     * en las otras siete. No se veía porque en la práctica siempre se pasaba detrás de
     * `species:apply`, que sí sube la versión; pero un `--destacadas` suelto publica un cambio
     * VISIBLE en la portada del espacio, y el dispositivo que ya lo tuviera guardado sin conexión no
     * se habría enterado.
     */
    const { cambia, lineas } = escribeEspacio({ dir: path.dirname(file), file, doc, write: !DRY });
    if (!cambia) continue;
    for (const l of lineas) console.log(`  ${l}`);
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
  }
  // El informe es GLOBAL y la ejecución puede no serlo. Con `--park` se reescribía entero a partir de
  // lo mirado en ese espacio, así que revisar Calblanque borraba del informe las dos fichas
  // pendientes de Sierra de El Carche: un hueco documentado desaparecido sin que nada avisara, que es
  // justo lo que el informe existe para evitar. Se refunden las filas — se sustituyen solo las de los
  // espacios recorridos — y así una pasada acotada no puede perder el trabajo de otra.
  const ruta = path.join(OUT_DIR, 'rareza-por-contrastar.md');
  const recorridos = new Set(objetivo.map(o => o.slug));
  const filas = [...ajenas(ruta, recorridos), ...indeterminadas]
    .sort((a, b) => a.slug.localeCompare(b.slug) || Number(a.id) - Number(b.id));
  if (!DRY) {
    if (filas.length) {
      fs.mkdirSync(OUT_DIR, { recursive: true });
      fs.writeFileSync(ruta, informe(filas), 'utf8');
      console.log(`  → ${rel(ruta)}${filas.length > indeterminadas.length
        ? ` (${filas.length - indeterminadas.length} fila(s) de otros espacios conservadas)` : ''}`);
    } else if (fs.existsSync(ruta)) {
      fs.unlinkSync(ruta);
      console.log(`  - ${rel(ruta)} (ya no queda ninguna pendiente)`);
    }
  }
  if (SQL) escribeSql(filasSql, SQL);
  if (DRY) console.log('\nSimulación: no se ha escrito nada.');
}

/*
 * Las filas del informe anterior que NO son de los espacios recorridos en esta pasada. Se leen del
 * propio markdown porque es el único sitio donde viven: el informe es el registro del hueco, no un
 * subproducto, y nada más lo guarda.
 *
 * Releer un markdown es frágil y aquí lo frágil sería perder una fila sin enterarse, que es el
 * mismo fallo en verde que esto viene a tapar. Por eso una línea que PARECE fila —empieza por «|» y
 * trae un número en la segunda celda— y que aun así no se sabe partir no se descarta en silencio:
 * se avisa por pantalla con la línea entera, para poder recuperarla a mano.
 */
function ajenas(ruta, recorridos) {
  if (!fs.existsSync(ruta)) return [];
  const filas = [];
  for (const linea of fs.readFileSync(ruta, 'utf8').split('\n')) {
    const celdas = linea.split('|').map(c => c.trim());
    // `| slug | id | *sci* | estatal | autonómico |` deja siete trozos al partir por «|», con el
    // primero y el último vacíos. La cabecera y el separador se caen solos: no traen id numérico.
    if (!/^\s*\|/.test(linea) || !/^\d+$/.test(celdas[2] || '')) continue;
    if (celdas.length !== 7) {
      console.error(`⚠ fila del informe ilegible (¿un «|» dentro de un texto?), NO se ha conservado:\n  ${linea}`);
      continue;
    }
    const slug = celdas[1];
    if (recorridos.has(slug)) continue;
    filas.push({
      slug, id: celdas[2], sci: celdas[3].replace(/^\*|\*$/g, ''),
      estatal: celdas[4] === '—' ? null : celdas[4],
      autonomico: celdas[5] === '—' ? null : celdas[5],
    });
  }
  return filas;
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
