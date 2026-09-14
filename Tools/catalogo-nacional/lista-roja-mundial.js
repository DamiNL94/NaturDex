#!/usr/bin/env node
'use strict';
/*
 * lista-roja-mundial.js — pone `iucnGlobal` en la nomenclatura de la UICN, sin borrar lo que la
 * fuente no desmiente.
 *
 * El problema que resuelve
 * -----------------------
 * `iucnSpain` lo escribe entero `lista-roja-espana.js` y cumple la nomenclatura de `lib/uicn.js` en
 * las 350 fichas que lo tienen. `iucnGlobal` no: de las **1.058 fichas del catálogo universal, 286
 * están fuera** —«LC», «NT (Casi amenazado)», «LC (Preocupación menor) (evaluación UICN 2018)», «NE»,
 * «No evaluada específicamente… (especie común)»—, y esas redacciones son las que ve el usuario.
 * Es el hallazgo C3 de la auditoría del catálogo, el más repetido de todos: **289 de las 358 tareas
 * universales que dejó son de este campo**.
 *
 * Por qué NO es un calco de `lista-roja-espana.js`
 * -----------------------------------------------
 * Aquél rellenaba un campo **vacío**: si EIDOS callaba, no escribía nada y no se perdía nada. Éste
 * **reescribe un campo que ya está puesto en las 1.058**, y ahí el silencio de EIDOS es una trampa.
 *
 * `etiquetaUicn(ambitos, 'Mundial')` **nunca devuelve `null`**: cuando no hay fila devuelve «No
 * evaluada en la Lista Roja mundial de la UICN», porque la ficha enseña ese campo siempre. Aplicarla
 * a ciegas encima de una ficha que hoy dice «LC» **cambiaría una afirmación por otra apoyándose en
 * que la fuente calla**, que es justo lo que el `CLAUDE.md` §2 prohíbe: *una fuente que no se ha
 * podido consultar no dice que no*. La auditoría lo dejó medido como el hallazgo C7: **al menos 56
 * fichas** afirman una evaluación que EIDOS no devuelve, y la cadena de procedencia de este campo
 * admite la Red List de la UICN directamente (`PROCEDENCIA-DE-CAMPOS.md:46`), que aquí no se
 * consulta porque necesita clave.
 *
 * De modo que el criterio no es «reescribir con EIDOS» sino cuatro casos, y solo tres escriben:
 *
 *   A · REDACCIÓN — EIDOS trae fila y su código coincide con el de la ficha. Cambia cómo está
 *       escrito, no lo que dice. Es el grueso, y es la corrección que buscaba C3.
 *   B · CATEGORÍA — EIDOS trae fila y el código NO coincide. Manda EIDOS (regla nº 3), pero se
 *       lista aparte porque **cambia lo que la ficha afirma**: son los desacuerdos reales que
 *       encontró la auditoría (*Tamarix boveana* LC → VU 2018, *Alectoris rufa* LC → NT 2020,
 *       *Chalcides bedriagai* LC → NT 2009, *Curruca undata* y *Lanius senator* LC → NT 2022, y
 *       *Phagnalon saxatile*, que NIEGA una LC que la UICN sí tiene).
 *   C · GUARDA — EIDOS no trae fila y la ficha **afirma una categoría**. **No se toca.** Escribir
 *       «No evaluada» aquí sería borrar un dato por un silencio.
 *   D · HUECO — EIDOS no trae fila y la ficha **ya dice que no está evaluada**, con otras palabras.
 *       Se normaliza la frase: es la misma afirmación, escrita como manda `lib/uicn.js`.
 *
 * Cómo resuelve cada ficha
 * ------------------------
 *   1. `eidosTaxonId` de la ficha universal (729 de 1.058). Es la clave estable.
 *   2. Si no lo tiene, `resolveTaxon(nombre)`, con la misma guarda que su hermano: si EIDOS da el
 *      nombre por **sinónimo**, se anota y **no se escribe nada**, porque adoptar la Lista Roja del
 *      aceptado sería colgar de la ficha el dato de un taxón que nadie ha comprobado que sea el
 *      suyo. Eso es un renombrado, y se decide en la deuda nº 36.
 *
 * Lo que NO hace
 * --------------
 * No toca `Península` ni `Canarias` —son ámbitos subestatales sin campo propio—, ni `iucnSpain`, que
 * tiene su herramienta. No escribe en los `park.json` ni en la BD: eso es `npm run species:apply`,
 * que reparte el catálogo universal y genera el SQL. Y ojo con la trampa nº 4 del `CLAUDE.md`:
 * corregir este campo en un `park.json` no sirve de nada, porque el siguiente `species:apply` lo
 * revierte desde aquí.
 *
 * La caché (`out/lista-roja-mundial-cache.json`) evita repetir ~1.400 peticiones a un servicio
 * público cada vez que alguien quiera ver el informe. `--sin-cache` la ignora.
 *
 * Idempotente: un segundo pase no cambia un byte.
 *
 * Uso:
 *     node Tools/catalogo-nacional/lista-roja-mundial.js                 informe, sin escribir
 *     node Tools/catalogo-nacional/lista-roja-mundial.js --write         lo escribe en el catálogo
 *       [--sin-cache] [--limite N] [--informe <ruta.md>] [--con-categoria]
 *
 *   --con-categoria  aplica también el caso B (los desacuerdos de categoría). Va aparte a propósito:
 *                    cambia lo que la ficha afirma, y conviene mirarlo antes de aplicarlo.
 */

const fs = require('fs');
const path = require('path');
const { flag, num, arg, sleep } = require('../lib/cli');
const { CATALOGO_DIR, OUT_DIR, readJson, writeJson, rel } = require('../lib/io');
const eidos = require('../lib/eidos');
const { etiquetaUicn, codigoDe, CATEGORIA_UICN } = require('../lib/uicn');

const WRITE = flag('write');
const SIN_CACHE = flag('sin-cache');
const CON_CATEGORIA = flag('con-categoria');
const LIMITE = num('limite', 0);
const RUTA_INFORME = arg('informe', null);

const CATALOGO = path.join(CATALOGO_DIR, 'data', 'especies-universal.json');
const CACHE_FILE = path.join(OUT_DIR, 'lista-roja-mundial-cache.json');

const cargaCache = () => {
  if (SIN_CACHE || !fs.existsSync(CACHE_FILE)) return {};
  try { return readJson(CACHE_FILE); } catch (_) { return {}; }
};

/*
 * ¿La ficha AFIRMA una categoría, o declara un hueco?
 *
 * Medido sobre las 1.058 del catálogo: los 580 textos que no empiezan por un código de dos letras
 * son todos variantes de «No evaluada…», así que la pregunta se contesta con el código. `NE` cuenta
 * como hueco: es la propia categoría «No evaluada».
 */
function afirmaCategoria(texto) {
  const cod = codigoDe(texto);
  return Boolean(cod) && cod !== 'NE';
}

(async () => {
  const catalogo = readJson(CATALOGO);
  const nombres = Object.keys(catalogo).sort();
  const cache = cargaCache();
  let peticiones = 0;
  const resultados = [];
  let hechos = 0;

  for (const sci of nombres) {
    if (LIMITE && hechos >= LIMITE) break;
    hechos++;
    const ficha = catalogo[sci];
    const clave = `sci:${sci}`;

    let entrada = cache[clave];
    if (!entrada) {
      let taxonid = ficha.eidosTaxonId || null;
      let motivo = null;

      if (!taxonid) {
        const e = await eidos.resolveTaxon(sci, { agent: 'lista-roja-mundial' });
        peticiones++;
        await sleep(eidos.THROTTLE_MS);
        if (e.status === 'no-encontrada') motivo = 'EIDOS no conoce este nombre';
        else if (e.status === 'sinonimo') motivo = `EIDOS lo da por sinónimo de «${e.acceptedName || '?'}»: se decide en la deuda nº 36, no aquí`;
        else taxonid = e.taxonid;
      }

      let ambitos = {};
      if (taxonid && !motivo) {
        ambitos = await eidos.conservationByScope(taxonid, { agent: 'lista-roja-mundial' });
        peticiones++;
        await sleep(eidos.THROTTLE_MS);
      }
      entrada = {
        taxonid: taxonid || null,
        motivo,
        ambitos: Object.fromEntries(Object.entries(ambitos).map(([k, v]) => [k, { categoriaconservacion: v.categoriaconservacion, anio: v.anio }])),
      };
      cache[clave] = entrada;
    }

    resultados.push({ sci, actual: ficha.iucnGlobal, entrada });
    if (hechos % 100 === 0) console.log(`  ${hechos}/${nombres.length}`);
  }

  if (!SIN_CACHE) writeJson(CACHE_FILE, cache);

  // --- Clasificación --------------------------------------------------------------------------

  const A = [], B = [], C = [], D = [], igual = [], sinResolver = [];

  for (const r of resultados) {
    const { sci, actual, entrada } = r;
    if (entrada.motivo) { sinResolver.push({ sci, actual, motivo: entrada.motivo }); continue; }

    const hayFila = Boolean((entrada.ambitos || {}).Mundial && entrada.ambitos.Mundial.categoriaconservacion);
    const propuesta = etiquetaUicn(entrada.ambitos, 'Mundial');
    if (propuesta === actual) { igual.push(r); continue; }

    const codFicha = codigoDe(actual);
    const codEidos = codigoDe(propuesta);
    const fila = { sci, actual, propuesta, codFicha, codEidos };

    if (hayFila) (codFicha === codEidos ? A : B).push(fila);
    else if (afirmaCategoria(actual)) C.push(fila);
    else D.push(fila);
  }

  // --- Escritura ------------------------------------------------------------------------------

  const aplicar = CON_CATEGORIA ? [...A, ...B, ...D] : [...A, ...D];
  for (const f of aplicar) catalogo[f.sci].iucnGlobal = f.propuesta;

  // --- Informe --------------------------------------------------------------------------------

  const L = [];
  const say = (s = '') => { L.push(s); console.log(s); };

  say(`\nFichas del catálogo universal: ${nombres.length}${LIMITE ? ` (limitado a ${hechos})` : ''}`);
  say(`Peticiones nuevas a EIDOS: ${peticiones}; el resto, de ${rel(CACHE_FILE)}`);
  say(`Ya en la nomenclatura de lib/uicn.js: ${igual.length}`);
  say('');
  say(`A · REDACCIÓN — EIDOS confirma la categoría y solo cambia cómo está escrita: ${A.length}  → se reescriben`);
  say(`B · CATEGORÍA — EIDOS devuelve OTRA categoría: ${B.length}  → ${CON_CATEGORIA ? 'se reescriben (--con-categoria)' : 'NO se tocan sin --con-categoria'}`);
  say(`C · GUARDA    — EIDOS no devuelve fila y la ficha afirma una categoría: ${C.length}  → NO se tocan`);
  say(`D · HUECO     — EIDOS no devuelve fila y la ficha ya dice «no evaluada»: ${D.length}  → se normaliza la frase`);
  if (sinResolver.length) say(`      no se ha podido preguntar por ${sinResolver.length} ficha(s)`);

  if (B.length) {
    say('\n## B · Desacuerdos de categoría (cambian lo que la ficha afirma)\n');
    say('| Taxón | Dice la ficha | Dice EIDOS |');
    say('|---|---|---|');
    for (const f of B) say(`| *${f.sci}* | ${f.actual} | ${f.propuesta} |`);
  }

  if (C.length) {
    say('\n## C · La guarda: fichas que afirman una evaluación que EIDOS no devuelve\n');
    say('No se reescriben. El silencio de EIDOS no dice que no, y la Red List de la UICN —que');
    say('`PROCEDENCIA-DE-CAMPOS.md:46` admite como fuente de este campo— no se ha consultado.\n');
    say('| Taxón | Dice la ficha |');
    say('|---|---|');
    for (const f of C) say(`| *${f.sci}* | ${f.actual} |`);
  }

  if (sinResolver.length) {
    say('\n## Sin resolver en EIDOS\n');
    say('| Taxón | Motivo |');
    say('|---|---|');
    for (const f of sinResolver) say(`| *${f.sci}* | ${f.motivo} |`);
  }

  const porCategoria = new Map();
  for (const f of [...A, ...B, ...D, ...igual]) {
    const cod = codigoDe(f.propuesta || f.actual) || 'sin código';
    porCategoria.set(cod, (porCategoria.get(cod) || 0) + 1);
  }
  say('\n## Reparto por categoría, ya con la nomenclatura puesta\n');
  for (const cod of ['EX', 'EW', 'CR', 'EN', 'VU', 'NT', 'LC', 'DD', 'NE', 'sin código']) {
    if (porCategoria.get(cod)) say(`  · ${cod}${CATEGORIA_UICN[cod] ? ` (${CATEGORIA_UICN[cod]})` : ''}: ${porCategoria.get(cod)}`);
  }

  if (RUTA_INFORME) {
    fs.mkdirSync(path.dirname(RUTA_INFORME), { recursive: true });
    fs.writeFileSync(RUTA_INFORME, '# Lista Roja mundial: `iucnGlobal` contra EIDOS\n\n_Generado por `npm run especies:listaroja-mundial`. No se edita a mano: se regenera._\n' + L.join('\n') + '\n');
    console.log(`\n+ ${rel(RUTA_INFORME)}`);
  }

  if (!aplicar.length) {
    console.log('\nNada que escribir: el catálogo ya está al día.');
    return;
  }
  if (WRITE) {
    writeJson(CATALOGO, catalogo);
    console.log(`\n+ ${rel(CATALOGO)} (${aplicar.length} ficha(s))`);
    console.log('Siguiente: `npm run species:apply` para repartirlo a los park.json y generar el SQL.');
    console.log('Y detrás, el SEGUNDO `species:extract` de la trampa nº 1 del CLAUDE.md.');
  } else {
    console.log(`\nSimulación: ${aplicar.length} ficha(s) cambiarían (${A.length} de redacción${CON_CATEGORIA ? `, ${B.length} de categoría` : ''}, ${D.length} de hueco). Añade --write.`);
  }
})();
