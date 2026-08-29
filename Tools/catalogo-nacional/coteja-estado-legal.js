#!/usr/bin/env node
'use strict';
/*
 * coteja-estado-legal.js — el barrido de la deuda nº 43: comprobar, taxón a taxón, que la figura
 * legal que AFIRMA el texto de una ficha es la que devuelve EIDOS, en los dos ámbitos y en las dos
 * direcciones.
 *
 * El problema que resuelve
 * -----------------------
 * `spainStatus` y `regionalStatus` son PROSA. Los del piloto se escribieron a mano —hoy hay 39
 * redacciones distintas de `regionalStatus` en dieciséis espacios— y varias no son un estado legal
 * en absoluto («Fauna protegida; estival que cría en taludes de rambla», «Ave de la ZEPA
 * ES0000261»). Nadie los ha vuelto a mirar desde entonces, y `migra-estado-regional.js` lo dejó
 * escrito a propósito: mover la clave no es limpiar el texto.
 *
 * Eso no sería grave si el texto fuera decoración. No lo es, y por dos puertas:
 *
 *   1. `mide-niveles-puerta.js` lee la figura legal **del TEXTO de la ficha**, no de EIDOS. Un texto
 *      que afirma una protección que ninguna norma sostiene mete la ficha en el nivel 2 de la puerta
 *      —«la respalda la figura legal»— sin que ninguna fuente lo respalde.
 *   2. `rareza-legal.js` deriva `rarityLocal` del mismo texto, y ése es el número que decide qué
 *      especies destaca la app y qué foto ilustra cada hábitat.
 *
 * O sea: una frase mal copiada en 2026-07 sigue decidiendo hoy dos campos que el usuario ve, y no
 * hay ninguna comprobación que la contraste con la fuente. Es el §2 del CLAUDE.md en estado puro —
 * nada falla, nada avisa.
 *
 * El 2026-08-28, al desglosar la deuda nº 41, salieron TRES casos por casualidad (*Malpolon
 * monspessulanus*, *Lavandula dentata* y *Lavandula multifida*), y salieron mirando otra cosa. Esto
 * es el barrido que faltaba.
 *
 * Qué compara, y por qué en las DOS direcciones
 * ---------------------------------------------
 * Por cada taxón del catálogo y cada ámbito (estatal y autonómico):
 *
 *   · el TRAMO que `lib/rareza.js` lee del texto de la ficha  (`tramoDeTexto`)
 *   · el TRAMO que sale de las normas vigentes de EIDOS       (`tramoDeCategoria` sobre `estadolegal`)
 *
 * Los dos lados usan la MISMA escalera —la de `lib/rareza.js`, no una copia—, que es lo que hace
 * comparable un texto con una fila de PostgREST.
 *
 * Las dos direcciones importan porque la contradicción va en los dos sentidos y no se arregla
 * eligiendo un bando: en la culebra bastarda lo que afirma la ficha no lo sostiene ninguna fuente
 * consultada; en las dos lavandas es EIDOS quien no trae un Decreto que sí existe. La lección es la
 * de la deuda nº 4: **la etiqueta de una autoridad dice lo que opina esa autoridad, no si dos
 * autoridades discrepan.** Por eso esto es un INFORME y no un `--write`: lo que encuentra hay que
 * llevarlo al BOE y al BORM, taxón a taxón.
 *
 * LO QUE NO SE PUEDE CONTRASTAR, Y POR QUÉ SE APARTA EN VEZ DE ACUSAR
 * ------------------------------------------------------------------
 * `v_estadolegal` sirve NORMAS, y el texto de una ficha encadena tres cosas distintas en la misma
 * frase. Comparar las tres contra la misma vista es el cotejo asimétrico que ya costó caro con los
 * medios de la posidonia: **la mitad de los casos sale mal y ni siquiera se ve.** En la primera
 * pasada de esta herramienta, siete de los veintiún casos de la clase A eran de esta clase:
 *
 *   · **Evaluaciones de conservación** — «UICN España: VU (Vulnerable) (2010)», «Lista Roja de la
 *     Flora Vascular Española 2008: EN». `lib/rareza.js` las cuenta a propósito (decisión del
 *     2026-08-11: para la flora es la única señal que distingue una planta rara de una común), pero
 *     **no son figuras legales** y `v_estadolegal` no las tiene ni las tendrá. Su ámbito propio es
 *     `v_estadoconservacion`, que es otra vista.
 *   · **Instrumentos supranacionales** — Directiva Aves, Directiva Hábitats, CITES, Berna, Bonn,
 *     Barcelona. EIDOS los sirve con `ambito: "Internacional"` (1.102 filas vigentes en este
 *     catálogo), así que el filtro de lo NACIONAL los excluye por definición: acusar a la ficha de
 *     afirmar algo que la vista «no sostiene» sería culparla de un filtro propio.
 *
 * Así que el tramo de la ficha se calcula **segmento a segmento** y solo se contrasta el que sale de
 * una figura estatal o autonómica. Lo demás va a la clase F, que no es una acusación: es la lista de
 * fichas cuyo nivel 2 de la puerta descansa sobre algo que esta comprobación no puede confirmar.
 *
 * Qué NO hace, y no es pereza
 * ---------------------------
 *   · **No escribe nada.** Ni en los `park.json`, ni en el catálogo universal, ni en la base. Un
 *     silencio de EIDOS no es una desprotección (deuda nº 38: «una fuente que no se ha podido
 *     consultar no dice que no»), así que borrar un `regionalStatus` porque la vista venga vacía
 *     sería fabricar el dato contrario.
 *   · **No decide quién tiene razón.** Clasifica la discrepancia y la deja a la vista con las dos
 *     versiones al lado.
 *   · **No mira `v_estadoconservacion`.** Las evaluaciones de la UICN tienen su propia herramienta
 *     (`especies:listaroja`) y su propio campo (`iucnSpain`).
 *
 * Las clases del informe
 * ----------------------
 *   A · AFIRMA SIN RESPALDO   la ficha declara una figura estatal o autonómica y EIDOS no devuelve
 *                             NINGUNA norma que proteja en ese ámbito. Es el caso de la culebra
 *                             bastarda, y el que infla el nivel 2 de la puerta.
 *   B · NO LA RECOGE          la ficha dice «no incluida» —o no menciona ninguna figura— y EIDOS sí
 *                             trae una norma vigente. Aquí se pierde una especie protegida, que es
 *                             peor que el caso A. Las dos formas cuestan lo mismo: por negación y
 *                             por silencio.
 *   C · CATEGORÍA DISTINTA    las dos partes ven figura, pero de gravedad distinta (la siempreviva
 *                             anunciada «En peligro» siendo «Vulnerable», que ya pasó una vez).
 *   D · EL TEXTO NO ES UN ESTADO LEGAL   `lib/rareza.js` no reconoce ni figura ni negación: la
 *                             frase dice otra cosa. No hay nada que cotejar hasta reescribirla.
 *   E · SIN TAXÓN EN EIDOS    no hay con qué cotejar. Es un hueco declarado, no un hallazgo.
 *   F · NO CONTRASTABLE       todo lo que el texto afirma es una evaluación o un instrumento
 *                             supranacional. Ni acusación ni respaldo: queda dicho de qué cuelga.
 *   G · SE CONTRADICE SOLO    el mismo taxón con dos tramos distintos en dos espacios de la MISMA
 *                             comunidad. Un catálogo autonómico protege a la especie en todo el
 *                             territorio, así que los dos no pueden tener razón — y esto **no
 *                             necesita a EIDOS**: sale del propio catálogo, sin gastar una petición.
 *                             `validate` no puede verlo porque solo coteja entre parques los campos
 *                             UNIVERSALES, y `regionalStatus` es local por diseño.
 *
 * Uso:
 *     node Tools/catalogo-nacional/coteja-estado-legal.js                 pasada sin red (D, F y G)
 *     node Tools/catalogo-nacional/coteja-estado-legal.js --online        el cotejo entero, con caché
 *       [--park <slug>] [--informe <ruta>] [--sin-cache] [--ccaa "Región de Murcia"]
 *
 * La caché vive en `out/estado-legal-eidos.json` y hace que la segunda pasada no gaste red. EIDOS es
 * un servicio público: sin caché son ~1.100 peticiones.
 */

const fs = require('fs');
const path = require('path');
const { arg, flag, sleep } = require('../lib/cli');
const { OUT_DIR, ROOT, readJson, writeJson, rel, parkFiles } = require('../lib/io');
const eidos = require('../lib/eidos');
const { tramoDeTexto, tramoDeCategoria, SIGNIFICADO } = require('../lib/rareza');

const PARK = arg('park');
const ONLINE = flag('online');
const SIN_CACHE = flag('sin-cache');
const CCAA_FORZADA = arg('ccaa');
const INFORME = arg('informe') || path.join(ROOT, 'Docs', 'cotejo-estado-legal.md');

const CACHE_FILE = path.join(OUT_DIR, 'estado-legal-eidos.json');

// --- Lectura del catálogo -------------------------------------------------------------------------

/*
 * Un taxón, no una ficha: el mismo `spainStatus` se reparte a los dieciséis espacios desde el
 * catálogo universal, así que cotejarlo dieciséis veces sería repetir el mismo hallazgo. El
 * `regionalStatus`, en cambio, es LOCAL —cada `park.json` lleva el suyo— y por eso se agrupa por
 * texto: dos espacios pueden redactarlo distinto para la misma especie, y eso es justo lo que
 * interesa ver.
 */
function cargaTaxones() {
  const universal = readJson(path.join(ROOT, 'Tools', 'catalogo-nacional', 'data', 'especies-universal.json'));
  const taxones = new Map();

  for (const p of parkFiles()) {
    if (PARK && p.slug !== PARK) continue;
    const doc = readJson(p.file);
    for (const sp of (doc.species || [])) {
      const sci = sp.scientificName;
      if (!sci) continue;
      if (!taxones.has(sci)) {
        taxones.set(sci, {
          sci,
          eidosTaxonId: null,
          spainStatus: (universal[sci] || {}).spainStatus ?? sp.spainStatus ?? null,
          regionales: new Map(), // clave -> { texto, ccaa, slugs: [] }
        });
      }
      const t = taxones.get(sci);
      // El identificador se toma de donde lo haya: el catálogo universal solo lo trae en 729 de los
      // 1.058 taxones, mientras que las fichas lo llevan en 2.869 de 2.882.
      if (t.eidosTaxonId == null) {
        t.eidosTaxonId = (universal[sci] || {}).eidosTaxonId ?? sp.eidosTaxonId ?? null;
      }
      const texto = sp.regionalStatus ?? null;
      const ccaa = CCAA_FORZADA || sp.regionalCcaa || (doc.park && doc.park.region) || null;
      const clave = JSON.stringify([ccaa, texto]);
      if (!t.regionales.has(clave)) t.regionales.set(clave, { texto, ccaa, slugs: [] });
      t.regionales.get(clave).slugs.push(p.slug);
    }
  }
  return [...taxones.values()];
}

const slugsDe = (t) => [...new Set([].concat(...[...t.regionales.values()].map(r => r.slugs)))];

// --- Qué parte del texto se puede contrastar con `v_estadolegal` -----------------------------------

/*
 * Un segmento que nombra una evaluación de conservación o un instrumento supranacional NO se puede
 * contrastar con esta vista, y la razón está arriba, en la cabecera. Se aparta antes de comparar, no
 * después: apartarlo después sería haberlo acusado ya.
 *
 * La lista no incluye «Ley 42/2007» ni «RD 139/2011», que sí son estatales y sí están en la vista.
 */
const NO_CONTRASTABLE = /\bUICN\b|Lista\s+Roja|Libro\s+Rojo|\bDirectiva\b|\bCITES\b|Convenio|Convenci[óo]n|Reglamento\s*\(?CE|\bBerna\b|\bBonn\b|\bBarcelona\b|\bAEWA\b/i;

/*
 * El tramo de la ficha, partido en dos: lo contrastable y lo que no.
 *
 * Se trocea por los mismos separadores que usa `tramoDeTexto` (`;` y `·`) y se le pasa CADA segmento
 * a esa misma función, en vez de reimplementar la escalera aquí. Es la regla del repo: el criterio
 * vive en un solo sitio, y aquí solo se decide QUÉ segmentos entran.
 */
function leeTexto(texto) {
  const t = String(texto || '').trim();
  const segmentos = t.split(/\s*[;·]\s*/).filter(Boolean);

  let contrastable = { tramo: 1, motivo: null, reconocido: false };
  const apartados = [];
  let indeterminado = false;

  for (const seg of segmentos) {
    const r = tramoDeTexto(seg);
    if (r.indeterminado) { indeterminado = true; continue; }
    if (NO_CONTRASTABLE.test(seg)) {
      if (r.reconocido) apartados.push({ seg: seg.trim(), tramo: r.tramo });
      continue;
    }
    if (r.reconocido) contrastable.reconocido = true;
    if (r.tramo > contrastable.tramo) { contrastable.tramo = r.tramo; contrastable.motivo = seg.trim(); }
  }

  // Sin ningún segmento legible el texto no es un estado legal (clase D), salvo que lo único que
  // haya sea un «pendiente de confirmar», que es un hueco que la ficha ya declara.
  const legible = contrastable.reconocido || apartados.length > 0;
  return { contrastable, apartados, indeterminado, legible };
}

// --- Pasada con red -------------------------------------------------------------------------------

/*
 * Se pregunta por identificador cuando lo hay y por nombre cuando no. No al revés y no las dos: la
 * clave maestra del modelo es `eidos_taxonid`, y resolver por nombre un taxón que ya lo tiene sería
 * volver a exponerse al cambio de nomenclatura que el identificador existe para esquivar.
 */
async function consultaEidos(t) {
  let idtaxon = t.eidosTaxonId;
  let resuelto = idtaxon != null ? 'identificador' : null;
  let nombreEidos = null;

  if (idtaxon == null) {
    const r = await eidos.resolveTaxon(t.sci);
    if (r.status === 'no-encontrada') return { idtaxon: null, resuelto: 'no-encontrada', filas: [] };
    idtaxon = r.taxonid;
    nombreEidos = r.acceptedName;
    resuelto = r.status === 'sinonimo' ? 'sinonimo' : 'nombre';
  }

  const filas = await eidos.rows('v_estadolegal',
    [`idtaxon=eq.${idtaxon}`, 'select=estadolegal,norma,ambito,ccaa,idvigente']);
  return { idtaxon, resuelto, nombreEidos, filas };
}

async function pasadaEidos(taxones) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const cache = (!SIN_CACHE && fs.existsSync(CACHE_FILE)) ? readJson(CACHE_FILE) : {};

  let pedidas = 0;
  for (let i = 0; i < taxones.length; i++) {
    const t = taxones[i];
    if (i % 100 === 0) process.stderr.write(`  EIDOS estado legal: ${i}/${taxones.length}\n`);
    if (cache[t.sci]) continue;
    try { cache[t.sci] = await consultaEidos(t); }
    catch (e) { cache[t.sci] = { error: e.message }; }
    pedidas++;
    await sleep(eidos.THROTTLE_MS);
  }

  writeJson(CACHE_FILE, cache);
  console.log(`EIDOS: ${pedidas} petición(es) nueva(s); el resto, de ${rel(CACHE_FILE)}.`);
  return cache;
}

// --- Cotejo ---------------------------------------------------------------------------------------

/*
 * De las filas de EIDOS al tramo, ámbito por ámbito.
 *
 * El filtro de lo NACIONAL exige `ambito === 'Nacional'` Y `ccaa` vacío, que es la segunda trampa
 * documentada en `lib/eidos.js`: EIDOS sirve el Catálogo Regional de Castilla-La Mancha con
 * `ambito: "Nacional"` y solo se delata por traer la comunidad rellena. Sin las dos condiciones, una
 * ley manchega se cuela como norma estatal — de ahí salieron las 60 fichas que citaban la Ley 9/1999
 * en su `spainStatus`.
 *
 * El de lo AUTONÓMICO compara la comunidad por igualdad de texto, no por expresión regular sobre la
 * norma: el título de un decreto de otra comunidad puede nombrar a Murcia (convenios, límites
 * compartidos) y colar una figura ajena. Descarta de paso las 92 filas que EIDOS marca
 * `Autonómico` con la comunidad VACÍA, que al mirarlas son convenios internacionales (Berna,
 * Barcelona) mal clasificados en la propia fuente.
 */
const normCcaa = (s) => String(s || '').trim().toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '');

function tramoEidos(filas, filtro) {
  let tramo = 1, basis = null, hayFilas = false;
  for (const f of (filas || [])) {
    if (f.idvigente !== 1) continue;      // 2 y siguientes son normas derogadas o sustituidas
    if (!filtro(f)) continue;
    hayFilas = true;
    const cat = String(f.estadolegal || '').replace(/^(CEEA|LESRPE):\s*/, '').trim();
    const valor = tramoDeCategoria(cat);
    if (valor > tramo) { tramo = valor; basis = { categoria: cat, norma: f.norma, ambito: f.ambito, ccaa: f.ccaa }; }
  }
  return { tramo, basis, hayFilas };
}

const esNacional = (f) => f.ambito === 'Nacional' && !f.ccaa;
const esDeCcaa = (ccaa) => (f) => !!f.ccaa && normCcaa(f.ccaa) === normCcaa(ccaa);

/*
 * Un caso del informe. `texto` y `eidosBasis` van siempre juntos: sin las dos citas al lado, la tabla
 * sería una lista de números discrepantes que nadie puede resolver sin volver a ejecutar la
 * herramienta, y resolverlos exige ir al boletín.
 */
function coteja(sci, ambito, ccaa, texto, filas, slugs) {
  const leido = leeTexto(texto);
  const filtro = ambito === 'estatal' ? esNacional : esDeCcaa(ccaa);
  const oficial = tramoEidos(filas, filtro);

  const base = {
    sci, ambito, ccaa, texto, slugs,
    tramoFicha: leido.contrastable.tramo, tramoEidos: oficial.tramo,
    eidosBasis: oficial.basis, apartados: leido.apartados,
  };

  if (!leido.legible) return leido.indeterminado ? null : { ...base, clase: 'D' };

  /*
   * El texto no dice nada sobre una figura estatal o autonómica. Hay dos casos y NO son el mismo:
   *
   *   · Lo que afirma es una evaluación o un instrumento supranacional, y AFIRMA ALGO —sube el
   *     tramo—. Ahí no hay nada que contrastar contra esta vista, y decir que «EIDOS no lo sostiene»
   *     sería acusar a la ficha de un filtro nuestro. Es la clase F.
   *   · Lo único que dice es que NO está en una evaluación («No incluida en la Lista Roja de la Flora
   *     Vascular Española 2008»). Eso no afirma ninguna figura y tampoco la niega: deja el hueco
   *     abierto. Y ese hueco SÍ hay que cotejarlo, porque si EIDOS trae una norma vigente la ficha se
   *     está dejando una protección fuera exactamente igual que en la clase B — solo que por silencio
   *     en vez de por negación. La primera versión de esto las metía todas en la F y así se perdían.
   */
  if (!leido.contrastable.reconocido) {
    const afirmaAlgo = leido.apartados.some(a => a.tramo >= 2);
    if (afirmaAlgo) return { ...base, clase: 'F' };
    if (oficial.tramo >= 2) return { ...base, clase: 'B', porSilencio: true };
    return null;
  }

  if (leido.contrastable.tramo >= 2 && oficial.tramo === 1) {
    return { ...base, clase: 'A', hayNormaNoProtectora: oficial.hayFilas };
  }
  if (leido.contrastable.tramo === 1 && oficial.tramo >= 2) return { ...base, clase: 'B' };
  if (leido.contrastable.tramo !== oficial.tramo) return { ...base, clase: 'C' };
  return null;
}

// --- Informe --------------------------------------------------------------------------------------

const TITULOS = {
  A: 'A · La ficha AFIRMA una figura que EIDOS no sostiene',
  B: 'B · La ficha no recoge una figura que EIDOS sí trae',
  C: 'C · Las dos ven figura, con gravedad distinta',
  D: 'D · El texto no es un estado legal',
  E: 'E · Sin taxón en EIDOS: no hay con qué cotejar',
  F: 'F · La afirmación no es contrastable con `v_estadolegal`',
  G: 'G · El mismo taxón se contradice entre espacios de la MISMA comunidad',
};

const cita = (s, n = 120) => {
  const t = String(s == null ? '—' : s).replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n - 1) + '…' : t;
};

const ambitoDe = (h) => h.ambito === 'estatal' ? 'estatal' : `autonómico (${h.ccaa})`;

/*
 * SIN LA PASADA CON RED, LAS CLASES A, B, C Y E NO SON CERO: SON DESCONOCIDAS.
 *
 * La primera versión escribía «_Ninguno._» en las cuatro cuando se corría sin `--online`, y ese
 * informe queda versionado en `Docs/`: quien lo abriera leería «no hay ninguna discrepancia con
 * EIDOS» donde lo cierto es «no se le ha preguntado a EIDOS». Es el §2 del CLAUDE.md por la puerta
 * del propio informe — un fichero generado que afirma más de lo que sabe. De ahí `conRed`.
 */
const CLASES_CON_RED = new Set(['A', 'B', 'C', 'E']);

function escribeInforme(hallazgos, sinTaxon, stats, conRed) {
  const L = [];
  const cuenta = (c) => hallazgos.filter(h => h.clase === c).length;
  const sinDatos = (c) => !conRed && CLASES_CON_RED.has(c);

  L.push('# Cotejo del estado legal de las fichas contra EIDOS');
  L.push('');
  L.push('Generado por `npm run especies:legal -- --online`. **Informe, no arreglo**: lo que aquí sale');
  L.push('hay que llevarlo al BOE y al BORM taxón a taxón, porque la contradicción va en las dos');
  L.push('direcciones y EIDOS no es árbitro de sí mismo (deuda nº 43, y la lección de la nº 4).');
  L.push('');
  if (!conRed) {
    L.push('> ⚠️ **Esta copia se ha generado SIN `--online`.** Las clases A, B, C y E salen como «sin');
    L.push('> datos», que no es lo mismo que «ninguno»: a EIDOS no se le ha preguntado. Vuelve a pasar');
    L.push('> `npm run especies:legal -- --online` para completarlas.');
    L.push('');
  }
  L.push(`Cotejados **${stats.taxones} taxones** de **${stats.fichas} fichas** en ${stats.espacios} espacio(s).`);
  L.push('');
  L.push('| Clase | Qué es | Casos |');
  L.push('|---|---|---|');
  for (const c of ['A', 'B', 'C', 'G', 'D', 'F']) {
    L.push(`| ${c} | ${TITULOS[c].replace(/^\w · /, '')} | ${sinDatos(c) ? '_sin datos_' : cuenta(c)} |`);
  }
  L.push(`| E | ${TITULOS.E.replace(/^\w · /, '')} | ${sinDatos('E') ? '_sin datos_' : sinTaxon.length} |`);
  L.push('');
  L.push('La escalera de tramos es la de `Tools/lib/rareza.js`, la misma con la que el pipeline');
  L.push('deriva `rarityScore` y `rarityLocal`:');
  L.push('');
  for (const n of [5, 4, 3, 2, 1]) L.push(`- **${n}** · ${SIGNIFICADO[n]}`);
  L.push('');
  L.push('**Lo que este cotejo NO puede decidir.** `v_estadolegal` sirve NORMAS. Las evaluaciones de');
  L.push('conservación (UICN, Lista Roja, Libro Rojo) y los instrumentos supranacionales (Directiva');
  L.push('Aves, Directiva Hábitats, CITES, Berna, Bonn, Barcelona) se apartan **antes** de comparar:');
  L.push('las primeras viven en otra vista y los segundos llegan con `ambito: "Internacional"`, que el');
  L.push('filtro de lo nacional excluye por definición. Acusarlas de «no sostenidas» sería culpar a la');
  L.push('ficha de un filtro nuestro. Van a la clase F.');
  L.push('');
  L.push('Y una limitación conocida de la escalera: EIDOS escribe `LAESRPE` en las normas de Aragón,');
  L.push('que el patrón `\\bLESRPE\\b` de `lib/rareza.js` no reconoce. No afecta a Murcia —su catálogo');
  L.push('usa «Especies de interés especial» y «Vulnerable»— pero hay que mirarlo al entrar en Aragón.');
  L.push('');

  for (const c of ['A', 'B', 'C', 'G', 'F', 'D']) {
    const casos = hallazgos.filter(h => h.clase === c)
      .sort((a, b) => a.sci.localeCompare(b.sci) || a.ambito.localeCompare(b.ambito));
    L.push(`## ${TITULOS[c]}`);
    L.push('');
    if (!casos.length) {
      L.push(sinDatos(c) ? '_Sin datos: esta copia se generó sin `--online`._' : '_Ninguno._');
      L.push('');
      continue;
    }

    if (c === 'D') {
      L.push('No hay contradicción que resolver: hasta que la frase se reescriba como estado legal, ni');
      L.push('`rareza-legal.js` ni `mide-niveles-puerta.js` pueden leerla, y la ficha se queda **sin');
      L.push('tramo** — que es lo correcto, pero es un hueco.');
      L.push('');
      L.push('| Taxón | Ámbito | Texto de la ficha | Espacios |');
      L.push('|---|---|---|---|');
      for (const h of casos) L.push(`| *${h.sci}* | ${ambitoDe(h)} | ${cita(h.texto)} | ${h.slugs.join(', ')} |`);
    } else if (c === 'G') {
      L.push('No hace falta EIDOS para verlo: un catálogo autonómico protege a la especie en TODA la');
      L.push('comunidad, así que dos espacios de la misma comunidad no pueden darle tramos distintos al');
      L.push('mismo taxón. **No se resuelve por mayoría** — en la chova piquirroja el texto correcto es el');
      L.push('del espacio que va solo—, pero uno de los dos lados está mal escrito siempre.');
      L.push('');
      L.push('| Taxón | Comunidad | Variantes (tramo · espacios) |');
      L.push('|---|---|---|');
      for (const h of casos) {
        const vs = h.variantes
          .sort((a, b) => b.tramo - a.tramo)
          .map(v => `**${v.tramo}** · ${cita(v.texto, 80)} — ${v.slugs.join(', ')}`)
          .join('<br>');
        L.push(`| *${h.sci}* | ${h.ccaa} | ${vs} |`);
      }
    } else if (c === 'F') {
      L.push('Ni acusación ni respaldo. Lo que interesa aquí es de qué cuelga cada una: son fichas cuyo');
      L.push('tramo —y por tanto su nivel 2 en `mide-niveles-puerta.js`— descansa entero sobre una');
      L.push('evaluación de conservación o sobre un instrumento supranacional, no sobre el LESRPE ni');
      L.push('sobre un catálogo autonómico. Es legítimo y está documentado (`lib/rareza.js` cuenta las');
      L.push('evaluaciones a propósito desde el 2026-08-11), pero conviene saber cuántas son.');
      L.push('');
      L.push('| Taxón | Ámbito | Lo que afirma | Tramo | Espacios |');
      L.push('|---|---|---|---|---|');
      for (const h of casos) {
        const ap = h.apartados.map(a => `${cita(a.seg, 70)} (${a.tramo})`).join(' · ');
        const t = Math.max(...h.apartados.map(a => a.tramo));
        L.push(`| *${h.sci}* | ${ambitoDe(h)} | ${ap} | ${t} | ${h.slugs.join(', ')} |`);
      }
    } else {
      L.push('| Taxón | Ámbito | Texto de la ficha | Tramo ficha | Tramo EIDOS | Norma vigente en EIDOS | Espacios |');
      L.push('|---|---|---|---|---|---|---|');
      for (const h of casos) {
        const b = h.eidosBasis;
        const norma = b ? `${cita(b.categoria, 60)} — ${cita(b.norma, 70)}` : '—';
        const txt = h.porSilencio ? `${cita(h.texto, 100)} — **no menciona ninguna figura** (por silencio)` : cita(h.texto);
        L.push(`| *${h.sci}* | ${ambitoDe(h)} | ${txt} | ${h.tramoFicha} | ${h.tramoEidos} | ${norma} | ${h.slugs.join(', ')} |`);
      }
    }
    L.push('');
    if (c === 'A') {
      L.push('El subconjunto que más pesa: estas fichas entran en el **nivel 2** de la puerta');
      L.push('(`mide-niveles-puerta.js` lee la figura del texto), así que su respaldo documental está');
      L.push('construido sobre una afirmación sin cotejar. Que EIDOS calle **no** las desprotege —puede');
      L.push('ser un hueco de EIDOS, como en las dos lavandas—, pero tampoco las respalda.');
      L.push('');
    }
    if (c === 'B') {
      L.push('Peor que la clase A: aquí se está **perdiendo** una especie protegida. La norma vigente');
      L.push('dice una cosa y la ficha dice otra —o no dice nada, que sale marcado «por silencio»—, así');
      L.push('que su `rarityLocal` está por debajo de lo que le toca y la app no la destaca.');
      L.push('');
    }
  }

  L.push(`## ${TITULOS.E}`);
  L.push('');
  if (!sinTaxon.length) {
    L.push(sinDatos('E') ? '_Sin datos: esta copia se generó sin `--online`._' : '_Ninguno._');
  } else {
    L.push('EIDOS no conoce estos nombres, así que su estado legal no se puede contrastar con nada. No es');
    L.push('un hallazgo: es un hueco de la fuente, y coincide en parte con la deuda nº 27 (nombres que la');
    L.push('autoridad da por sinónimos). `npm run taxones:nomenclatura` es quien lo persigue.');
    L.push('');
    L.push('| Taxón | Motivo |');
    L.push('|---|---|');
    for (const s of sinTaxon.sort((a, b) => a.sci.localeCompare(b.sci))) {
      L.push(`| *${s.sci}* | ${s.motivo} |`);
    }
  }
  L.push('');

  fs.writeFileSync(INFORME, L.join('\n') + '\n', 'utf8');
  console.log(`Informe en ${rel(INFORME)}`);
}

// --- La comprobación que no necesita a nadie -------------------------------------------------------

/*
 * El mismo taxón, la misma comunidad, dos tramos distintos según el espacio.
 *
 * Un catálogo autonómico de especies protegidas es territorial **para la especie**, no para el
 * espacio: la Ley 7/1995 protege a la garduña en toda la Región de Murcia o no la protege en
 * ninguna parte. Así que dos `regionalStatus` de la misma comunidad que dan tramos distintos para el
 * mismo taxón **no pueden tener razón los dos**, y eso se sabe sin preguntarle nada a EIDOS.
 *
 * Es la comprobación más barata del barrido y la que ninguna herramienta hacía: `validate` coteja la
 * coherencia entre parques de los campos UNIVERSALES, y `regionalStatus` es local, así que queda
 * fuera de esa red por diseño. Con razón —el día que entren dos comunidades, la misma especie tendrá
 * legítimamente dos estados—; por eso esto agrupa **por comunidad** y no por taxón a secas.
 *
 * No decide quién tiene razón, y el catálogo demuestra por qué no debe hacerlo: en seis de los siete
 * casos medidos el 2026-08-29 la mayoría acertaba y el raro era Sierra Espuña, pero en la chova
 * piquirroja pasa al revés —Sierra Espuña dice «De interés especial», que es lo que devuelve EIDOS, y
 * los otros nueve espacios dicen «no incluida»—. Una votación habría borrado el único texto correcto.
 */
function contradiccionesInternas(taxones) {
  const casos = [];
  for (const t of taxones) {
    const porCcaa = new Map();
    for (const r of t.regionales.values()) {
      if (!r.ccaa) continue;
      if (!porCcaa.has(r.ccaa)) porCcaa.set(r.ccaa, []);
      const leido = leeTexto(r.texto);
      if (!leido.contrastable.reconocido) continue; // un texto ilegible ya sale por la clase D
      porCcaa.get(r.ccaa).push({ texto: r.texto, slugs: r.slugs, tramo: leido.contrastable.tramo });
    }
    for (const [ccaa, variantes] of porCcaa) {
      if (new Set(variantes.map(v => v.tramo)).size < 2) continue;
      casos.push({ clase: 'G', sci: t.sci, ambito: 'autonómico', ccaa, variantes });
    }
  }
  return casos;
}

// --- Programa -------------------------------------------------------------------------------------

async function main() {
  const taxones = cargaTaxones();
  const espacios = new Set();
  let fichas = 0;
  for (const t of taxones) for (const r of t.regionales.values()) { fichas += r.slugs.length; r.slugs.forEach(s => espacios.add(s)); }

  console.log(`Catálogo: ${taxones.length} taxones en ${fichas} fichas de ${espacios.size} espacio(s).`);

  /*
   * Pasada sin red: las clases D, F y G salen enteras sin preguntar a nadie, porque ninguna de las
   * tres compara con EIDOS — la D dice que el texto no se puede leer, la F que no se puede
   * contrastar y la G que el catálogo se contradice consigo mismo. Es la mitad barata del barrido, y
   * la que se puede pasar en una máquina sin salida a Internet.
   */
  const sinRed = [...contradiccionesInternas(taxones)];
  for (const t of taxones) {
    const slugsTodos = slugsDe(t);
    for (const [texto, ambito, ccaa, slugs] of [
      [t.spainStatus, 'estatal', null, slugsTodos],
      ...[...t.regionales.values()].map(r => [r.texto, 'autonómico', r.ccaa, r.slugs]),
    ]) {
      const leido = leeTexto(texto);
      if (!leido.legible && !leido.indeterminado) {
        sinRed.push({ clase: 'D', sci: t.sci, ambito, ccaa, texto, slugs, apartados: [] });
      } else if (leido.legible && !leido.contrastable.reconocido && leido.apartados.some(a => a.tramo >= 2)) {
        // Solo cuenta como F lo que AFIRMA algo no contrastable. Un «no incluida en la Lista Roja» no
        // afirma ninguna figura: deja un hueco, y ese hueco lo cotejará la pasada con red.
        sinRed.push({ clase: 'F', sci: t.sci, ambito, ccaa, texto, slugs, apartados: leido.apartados });
      }
    }
  }
  console.log(`Clase G (el catálogo se contradice consigo mismo): ${sinRed.filter(h => h.clase === 'G').length} caso(s), sin red.`);
  console.log(`Clase D (el texto no es un estado legal): ${sinRed.filter(h => h.clase === 'D').length} caso(s), sin red.`);
  console.log(`Clase F (no contrastable con v_estadolegal): ${sinRed.filter(h => h.clase === 'F').length} caso(s), sin red.`);

  if (!ONLINE) {
    escribeInforme(sinRed, [], { taxones: taxones.length, fichas, espacios: espacios.size }, false);
    console.log('\nSolo se ha hecho la pasada sin red. Añade --online para cotejar contra EIDOS (clases A, B y C).');
    return;
  }

  const cache = await pasadaEidos(taxones);

  // La clase G no depende de EIDOS: se arrastra de la pasada sin red en vez de recalcularla.
  const hallazgos = sinRed.filter(h => h.clase === 'G');
  const sinTaxon = [];
  for (const t of taxones) {
    const e = cache[t.sci];
    if (!e || e.error) { sinTaxon.push({ sci: t.sci, motivo: e ? `error al consultar: ${e.error}` : 'sin consultar' }); continue; }
    if (e.resuelto === 'no-encontrada') { sinTaxon.push({ sci: t.sci, motivo: 'EIDOS no conoce el nombre' }); continue; }

    const slugsTodos = slugsDe(t);
    const est = coteja(t.sci, 'estatal', null, t.spainStatus, e.filas, slugsTodos);
    if (est) hallazgos.push(est);

    for (const r of t.regionales.values()) {
      if (!r.ccaa) continue; // sin comunidad no hay catálogo autonómico contra el que cotejar
      const aut = coteja(t.sci, 'autonómico', r.ccaa, r.texto, e.filas, r.slugs);
      if (aut) hallazgos.push(aut);
    }
  }

  for (const c of ['A', 'B', 'C', 'G', 'D', 'F']) {
    console.log(`Clase ${c}: ${hallazgos.filter(h => h.clase === c).length} caso(s).`);
  }
  console.log(`Clase E (sin taxón en EIDOS): ${sinTaxon.length}.`);

  escribeInforme(hallazgos, sinTaxon, { taxones: taxones.length, fichas, espacios: espacios.size }, true);
}

main().catch(e => { console.error(e); process.exit(1); });
