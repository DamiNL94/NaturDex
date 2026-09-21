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
 * Y por qué además existe `textoAnterior`
 * ---------------------------------------
 * Porque «por comunidad» es el alcance bueno cuando el error está en toda la comunidad, y demasiado
 * ancho cuando está en UN espacio. El caso que lo estrena: once aves de **Sierra Espuña** cuyo
 * `regionalStatus` no era una figura del catálogo sino «Ave de la ZEPA ES0000261 (Almenara, Moreras
 * y Cabo Cope)» —el código de OTRO espacio, y además un formulario de la Red Natura 2000 no es una
 * categoría del Catálogo Regional—, mientras los otros quince espacios las fichan bien. Aplicar eso
 * por comunidad habría reescrito 111 textos correctos.
 *
 * No es un truco para acotar el alcance: es una guarda. Dice «corrige solo donde SIGA el texto que
 * el cotejo demostró falso», y así una corrección no puede pisar lo que alguien ya arregló ni
 * uniformar a la fuerza una redacción distinta pero cierta — que las hay: el catálogo tenía **trece
 * redacciones** de la misma negación, y la que escribe el generador estaba en 470 fichas de las
 * 2.580 que la llevan. Es opcional: sin el campo, el alcance es el de siempre.
 *
 * Y `--uniforma`, que es otra cosa y por eso es otra bandera
 * ----------------------------------------------------------
 * Una corrección cambia lo que la ficha AFIRMA: la norma decía una cosa y el texto otra. La
 * uniformación (deuda nº 44(b)) **no cambia ningún hecho** — las trece redacciones de la negación
 * dicen lo mismo y las trece dan tramo 1, comprobado con `lib/rareza.js` antes de tocar nada— sino
 * la forma de decirlo, en un campo que el usuario LEE. Mezclarlas en la misma bandera habría hecho
 * imposible revisar un diff de 2.110 fichas buscando las diez que sí cambian un hecho.
 *
 * Las redacciones equivalentes se declaran en `uniformacion.<comunidad>` del mismo fichero, con de
 * dónde viene cada una; la sustitución es por texto EXACTO. Nada se reescribe por parecerse, y una
 * frase que alguien haya matizado a mano y no esté declarada se queda como está. La frase de
 * destino **no se escribe aquí**: la compone `lib/catalogos-regionales.js`, que es la misma que usa
 * `build-species-n2.js` al generar — con dos copias, la negación volvería a divergir a la primera
 * comunidad nueva, que es justo de donde se viene.
 *
 * Lo que NO hace
 * --------------
 * **No toca `rarityLocal` ni `rarityLocalBasis`.** El tramo se deriva de este texto, y quien lo
 * deriva es `npm run especies:rareza` (`rareza-legal.js`), con la escalera de `lib/rareza.js`.
 * Calcularlo aquí sería una segunda copia del criterio, que es la regla nº 1 de `Tools/CLAUDE.md`.
 * El orden es: esta herramienta primero, `especies:rareza` detrás.
 *
 * **Lo que sí escribe, desde el 2026-09-19, es el SQL de SU columna.** `regional_status` es local:
 * no viaja en el `species-universal.sql` de `species:apply`, y `rareza-legal.js --sql` tampoco la
 * lleva —escribe el tramo derivado, no el texto—, así que hasta esa fecha la corrección quedaba
 * bien en el repositorio y vieja en la base, que es la que ve el usuario (trampa nº 7). La cabecera
 * de esta herramienta afirmaba lo contrario, y una afirmación falsa en un comentario no la puede
 * comprobar `validate`.
 *
 * Escribe con `escribeEspacio()`, que sube el manifiesto: un `park.json` reescrito sin subir la
 * versión deja al usuario que lo tenga guardado sin conexión con el dato viejo (trampa nº 11).
 *
 * Idempotente: un segundo pase no cambia un byte.
 *
 * Uso:
 *     node Tools/catalogo-nacional/corrige-estado-autonomico.js            informe, sin escribir
 *     node Tools/catalogo-nacional/corrige-estado-autonomico.js --write    lo aplica
 *       [--uniforma]              además, sustituye las redacciones equivalentes de la NEGACIÓN por
 *                                 la que compone el generador (deuda nº 44(b))
 *       [--sql <ruta>]            escribe el UPDATE de `regional_status` para la base
 *       [--correcciones <ruta.json>]
 */

const path = require('path');
const { flag, arg } = require('../lib/cli');
const fs = require('fs');
const { CATALOGO_DIR, readJson, parkFiles, escribeEspacio, rel, fromRoot } = require('../lib/io');
const { sqlStr, cabeceraSql } = require('../lib/sql');
const { carga: cargaCatalogos, fraseNoIncluida } = require('../lib/catalogos-regionales');

const WRITE = flag('write');
const SQL = arg('sql') ? fromRoot(arg('sql')) : null;
const UNIFORMA = flag('uniforma');
const RUTA = arg('correcciones')
  ? fromRoot(arg('correcciones'))
  : path.join(CATALOGO_DIR, 'data', 'estado-autonomico-correcciones.json');

/*
 * EL SQL, y por qué es un ESPEJO y no una cola.
 *
 * `regionalStatus` es una columna LOCAL (`species.regional_status`) y no viaja en el
 * `species-universal.sql` de `species:apply`. La cabecera de esta herramienta decía que lo redactaba
 * `rareza-legal.js --sql`, y **no es verdad**: ese fichero escribe `rarity_local`,
 * `rarity_local_basis` e `is_featured`, que es el tramo derivado, no el texto. Así que hasta el
 * 2026-09-19 una corrección aplicada aquí quedaba bien en el repositorio y vieja en la base — y la
 * API manda sobre el paquete, así que el usuario seguía leyendo la negación que la norma desmiente.
 * La única vía era regenerar el `-n2.sql` del espacio, que es la trampa nº 6.
 *
 * Se escribe como ESPEJO —todas las fichas que DEBEN tener el texto, estuvieran ya o no— y no como
 * cola de lo que este pase acaba de cambiar. Es la lección del `--sql` de la auditoría de enlaces:
 * un fichero generado que solo lleva lo del último pase pierde la cola pendiente en cuanto se
 * regenera sin haberla aplicado. Como espejo, aplicarlo dos veces escribe lo mismo y regenerarlo
 * nunca pierde nada.
 */
/*
 * Una ficha puede entrar en el espejo por dos puertas —una corrección concreta cuyo texto ES la
 * negación canónica, y el barrido de uniformación— y entonces se escribiría dos veces. Con el mismo
 * valor, así que el SQL no estaría mal; pero un espejo con la misma fila repetida invita a pensar
 * que hay dos verdades. Se deduplica, y si alguna vez las dos puertas dieran textos DISTINTOS eso
 * sí es un fallo de criterio y aquí se para en seco en vez de escribir la última que llegue.
 */
function deduplica(filas) {
  const vistas = new Map();
  for (const f of filas) {
    // El slug no lleva espacios ni barras: «slug | nombre» no puede colisionar.
    const clave = `${f.slug} | ${f.sn}`;
    const previa = vistas.get(clave);
    if (previa && previa.texto !== f.texto) {
      console.error(`✖ ${f.slug} · ${f.sn}: el espejo pide dos textos distintos para la misma ficha.`);
      console.error(`   ${JSON.stringify(previa.texto)}`);
      console.error(`   ${JSON.stringify(f.texto)}`);
      process.exit(1);
    }
    if (!previa) vistas.set(clave, f);
  }
  return [...vistas.values()];
}

function escribeSql(ruta, filas) {
  const L = [cabeceraSql('NaturDex · estado legal autonómico corregido (regional_status)')];
  L.push('-- Generado por `node Tools/catalogo-nacional/corrige-estado-autonomico.js --sql <ruta>`.');
  L.push('-- Cada UPDATE lleva la corrección que `data/estado-autonomico-correcciones.json` declara y');
  L.push('-- que el cotejo contra EIDOS y el boletín respaldan. Solo toca esa columna: NO regenera la');
  L.push('-- ficha (trampa nº 6). Idempotente, y espejo de lo que dice el repositorio.');
  L.push('');
  L.push('START TRANSACTION;');
  let slug = null;
  for (const f of filas) {
    if (f.slug !== slug) { slug = f.slug; L.push('', `-- ── ${slug} ──`); }
    L.push('UPDATE species sp JOIN parks pk ON pk.id = sp.park_id');
    L.push(`   SET sp.regional_status = ${sqlStr(f.texto)}`);
    L.push(` WHERE pk.slug = ${sqlStr(f.slug)} AND sp.scientific_name = ${sqlStr(f.sn)};`);
  }
  L.push('', 'COMMIT;', '');
  fs.writeFileSync(ruta, L.join('\n'), 'utf8');
  console.log(`+ ${rel(ruta)} (${filas.length} UPDATE)`);
}

const doc = readJson(RUTA);
const correcciones = doc.correcciones || [];
if (!correcciones.length) { console.log(`Sin correcciones en ${rel(RUTA)}.`); process.exit(0); }

console.log(`Correcciones declaradas en ${rel(RUTA)}: ${correcciones.length}`);

const porEspacio = new Map();   // slug → { entrada, cambios: [] }
const yaEstaban = [];
const espejo = [];            // todas las fichas que DEBEN llevar el texto corregido
const fueraDeCcaa = [];
const noCoincideTexto = [];
const uniformacion = doc.uniformacion || {};
const catalogos = cargaCatalogos();
const sinCatalogo = new Set();

for (const p of parkFiles()) {
  const pj = readJson(p.file);
  if (!(pj.species || []).length) continue;
  const cambios = [];

  for (const c of correcciones) {
    for (const s of pj.species) {
      if (s.scientificName !== c.scientificName) continue;
      // La corrección habla de UNA comunidad: fuera de ella no dice nada.
      if (c.ccaa && s.regionalCcaa && s.regionalCcaa !== c.ccaa) { fueraDeCcaa.push({ slug: p.slug, sn: s.scientificName, ccaa: s.regionalCcaa }); continue; }
      // El «ya está» va ANTES de la guarda de `textoAnterior`, o una corrección aplicada se
      // contaría en el segundo pase como «tiene otro texto»: cierto, pero ilegible — el otro texto
      // es justamente el que escribió esta entrada.
      if (s.regionalStatus === c.regionalStatus) { yaEstaban.push({ slug: p.slug, sn: s.scientificName }); espejo.push({ slug: p.slug, sn: s.scientificName, texto: c.regionalStatus }); continue; }
      // `textoAnterior`: la corrección solo alcanza a las fichas que SIGUEN diciendo lo que el
      // cotejo demostró falso. Sin esta guarda, una entrada escrita para arreglar un espacio pisa
      // el texto de los otros quince, que puede decir lo mismo con otra redacción — y el catálogo
      // tiene ONCE redacciones distintas de la misma negación («No incluida en el Catálogo Regional
      // de especies protegidas» en 1.948 fichas, la frase que escribe hoy el generador en 461),
      // así que eso no es una hipótesis. Es opcional: sin el campo, la corrección se comporta como
      // siempre y alcanza a toda la comunidad.
      if (c.textoAnterior != null && String(s.regionalStatus ?? '') !== c.textoAnterior) {
        noCoincideTexto.push({ slug: p.slug, sn: s.scientificName, tiene: s.regionalStatus });
        continue;
      }
      cambios.push({ ficha: s, sn: s.scientificName, antes: s.regionalStatus, despues: c.regionalStatus });
      espejo.push({ slug: p.slug, sn: s.scientificName, texto: c.regionalStatus });
    }
  }

  /*
   * UNIFORMACIÓN (`--uniforma`), que es la deuda nº 44(b) y no es lo mismo que una corrección.
   *
   * Las correcciones de arriba cambian lo que la ficha AFIRMA: la norma dice una cosa y el texto
   * decía otra. Esto no cambia ningún hecho — las trece redacciones de la negación dicen lo mismo y
   * todas dan tramo 1— sino la forma de decirlo, en un campo que el usuario LEE. 2.110 fichas de
   * 2.580 no usan la frase que compone el generador.
   *
   * Solo se sustituye por texto EXACTO y solo si la redacción está declarada en
   * `uniformacion.<comunidad>`: nada se reescribe por parecerse, y una frase que alguien haya
   * matizado a mano y no esté en la lista se queda como está y sale contada. La frase de destino no
   * se escribe aquí, se compone con `lib/catalogos-regionales.js`, que es la misma que usa
   * `build-species-n2.js` al generar — si se escribiera aquí, en el momento en que cambiara el
   * catálogo de una comunidad habría dos negaciones distintas conviviendo, que es de lo que se viene.
   */
  if (UNIFORMA) {
    const yaTocadas = new Set(cambios.map(c => c.sn));
    for (const s of pj.species) {
      if (yaTocadas.has(s.scientificName)) continue;      // manda la corrección concreta
      const ccaa = s.regionalCcaa || (pj.park && pj.park.region) || null;
      const equivalentes = (uniformacion[ccaa] || []).map(e => e.textoAnterior);
      if (!equivalentes.includes(s.regionalStatus ?? '')) continue;
      const canonica = fraseNoIncluida(ccaa, catalogos);
      if (!canonica) { sinCatalogo.add(ccaa); continue; }
      if (s.regionalStatus === canonica) continue;
      cambios.push({ ficha: s, sn: s.scientificName, antes: s.regionalStatus, despues: canonica, uniformada: true });
      espejo.push({ slug: p.slug, sn: s.scientificName, texto: canonica });
    }
    // El espejo tiene que llevar también las que YA están uniformadas, o dejaría de ser espejo.
    for (const s of pj.species) {
      const ccaa = s.regionalCcaa || (pj.park && pj.park.region) || null;
      const canonica = fraseNoIncluida(ccaa, catalogos);
      if (canonica && s.regionalStatus === canonica) espejo.push({ slug: p.slug, sn: s.scientificName, texto: canonica });
    }
  }

  if (cambios.length) porEspacio.set(p.slug, { entrada: p, doc: pj, cambios });
}

const total = [...porEspacio.values()].reduce((a, e) => a + e.cambios.length, 0);
const uniformadas = [...porEspacio.values()].reduce((a, e) => a + e.cambios.filter(c => c.uniformada).length, 0);

for (const [slug, e] of porEspacio) {
  const concretas = e.cambios.filter(c => !c.uniformada);
  const uniformes = e.cambios.filter(c => c.uniformada);
  if (!concretas.length && !uniformes.length) continue;
  console.log(`\n▶ ${slug}`);
  for (const c of concretas) {
    console.log(`   · ${c.sn}`);
    console.log(`     antes:   ${JSON.stringify(String(c.antes ?? '').slice(0, 100))}`);
    console.log(`     después: ${JSON.stringify(c.despues.slice(0, 100))}`);
  }
  // Las uniformadas son miles y todas acaban en el mismo texto: enumerarlas ficha a ficha haría
  // ilegible el informe y taparía las correcciones concretas, que son las que hay que mirar. Se
  // agrupan por la redacción que se sustituye, que es la unidad que se declaró en el fichero.
  if (uniformes.length) {
    const porTexto = new Map();
    for (const c of uniformes) porTexto.set(c.antes, (porTexto.get(c.antes) || 0) + 1);
    console.log(`   uniformadas: ${uniformes.length}`);
    for (const [t, n] of [...porTexto.entries()].sort((a, b) => b[1] - a[1])) {
      console.log(`     ${String(n).padStart(4)} × ${JSON.stringify(String(t).slice(0, 96))}`);
    }
  }
}

console.log(`\nFichas a corregir: ${total} en ${porEspacio.size} espacio(s) · ya correctas: ${yaEstaban.length}`);
if (UNIFORMA) console.log(`   De ellas, ${uniformadas} son UNIFORMACIÓN: misma afirmación, la redacción que compone el generador.`);
if (sinCatalogo.size) {
  console.log(`\n⚠ Comunidad(es) sin catálogo dado de alta en data/catalogos-regionales.json: ${[...sinCatalogo].join(', ')}`);
  console.log('  Sus fichas NO se uniforman: componer la negación exigiría afirmar algo sobre un catálogo que nadie ha mirado.');
}
if (noCoincideTexto.length) {
  console.log(`Con \`textoAnterior\` declarado y otro texto en la ficha (no se tocan): ${noCoincideTexto.length}`);
  for (const f of noCoincideTexto.slice(0, 10)) console.log(`   · ${f.slug} · ${f.sn}: ${JSON.stringify(String(f.tiene ?? '').slice(0, 80))}`);
  if (noCoincideTexto.length > 10) console.log(`   … y ${noCoincideTexto.length - 10} más`);
}
if (fueraDeCcaa.length) {
  console.log(`Fuera del ámbito de la corrección (otra comunidad): ${fueraDeCcaa.length}`);
  for (const f of fueraDeCcaa) console.log(`   · ${f.slug} · ${f.sn} (${f.ccaa})`);
}

// El espejo se escribe SIEMPRE que se pida, haya o no cambios en este pase: es el estado que la
// base debe tener, no el diario de lo que acaba de pasar.
if (SQL) {
  const filas = deduplica(espejo).sort((x, y) => x.slug.localeCompare(y.slug) || x.sn.localeCompare(y.sn));
  escribeSql(SQL, filas);
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
