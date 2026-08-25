#!/usr/bin/env node
'use strict';
/*
 * coteja-nomenclatura.js — comprueba que el nombre con el que el catálogo ficha un taxón sigue
 * siendo el que aceptan las autoridades, y que cada identificador apunta a lo que dice apuntar.
 *
 * El problema que resuelve
 * -----------------------
 * `scan-taxones-duplicados.js` caza el taxón que está DOS VECES en el catálogo. Pero un taxón puede
 * estar **una sola vez y con el nombre equivocado**, y entonces no hay nada que comparar: ninguna
 * comprobación del repositorio sale a preguntar si ese nombre sigue vigente. Ahí caben tres averías
 * distintas, y las tres estaban en el catálogo el 2026-08-17 sin producir un solo aviso:
 *
 *   1. **El nombre de la ficha es un SINÓNIMO.** Ocho fichas se llamaban *Sylvia communis*,
 *      *Pallenis spinosa*, *Coloeus monedula*… cuando EIDOS las da por sinónimos y acepta
 *      *Curruca communis*, *Asteriscus spinosus*, *Corvus monedula*. No es cosmético: el cruce
 *      contra el formulario de un sitio Red Natura 2000 o contra el anexo de un PRUG se hace por
 *      nombre, y un nombre desalineado se salda con «no figura en el formulario oficial», que es un
 *      motivo falso escrito al lado de la especie (§2 del CLAUDE.md).
 *   2. **El identificador es de otro rango.** La curruca rabilarga llevaba `eidosTaxonId` 80230, que
 *      es *Sylvia undata undata*, la SUBESPECIE nominal, no la especie. EIDOS sirve las dos como
 *      aceptadas, así que nada chirriaba.
 *   3. **La `gbifSpeciesKey` apunta a un sinónimo de GBIF**, y la key de un sinónimo NO trae las
 *      mismas ocurrencias que la del nombre aceptado: en *Curruca undata* eran 77.236 frente a
 *      92.719 (−17 %), y en *Curruca communis* 44.281 frente a 97.267 (−54 %). Medido el 2026-08-17
 *      contra `api.gbif.org`, la unión de las dos keys da exactamente la cuenta de la aceptada, de
 *      modo que la aceptada es superconjunto y la del sinónimo es siempre una pérdida.
 *
 * La regla que se comprueba, y por qué NO es «unificar el género»
 * --------------------------------------------------------------
 * La tentación al ver *Sylvia communis* junto a *Curruca undata* es unificar el género en todo el
 * catálogo. Sería un error: EIDOS acepta *Curruca undata* y *Curruca communis* pero **también**
 * *Sylvia atricapilla*, porque el curruquero se partió y el capirote se quedó en *Sylvia*. Y en el
 * romero pasa justo al revés que en todos los demás: EIDOS acepta *Rosmarinus officinalis* y da
 * *Salvia rosmarinus* por sinónimo, mientras GBIF hace lo contrario.
 *
 * Así que no se unifica nada por parecido. Cada campo cita a SU autoridad, que es la regla nº 3 del
 * CLAUDE.md bajada a campo concreto:
 *
 *   · `scientificName`, `eidosTaxonId` y `taxonomy` ── EIDOS, y el nombre **aceptado**, a rango de
 *     especie salvo que la ficha sea de una subespecie a propósito.
 *   · `gbifSpeciesKey` ─────────────────────────────── GBIF, y la key **aceptada de su backbone**,
 *     que es la que lleva las ocurrencias.
 *
 * Que las dos autoridades usen géneros distintos para el mismo bicho no es una incoherencia que
 * haya que resolver: es el estado real de la nomenclatura hoy, y el catálogo lo refleja citando a
 * cada una en su campo. Lo que sí es un error es que un campo cite a una autoridad que le lleva la
 * contraria.
 *
 * Las tres pasadas
 * ----------------
 *   A. GÉNERO (sin red, gratis). El primer término del `scientificName` contra `taxonomy.genus`, que
 *      viene de EIDOS literal (`build-species-universal.js` §29). Si no coinciden, uno de los dos
 *      está desalineado — y **caza los nueve casos de esta clase sin gastar una sola petición**, que
 *      es lo que la hace apta para entrar en `validate`. No dice CUÁL de los dos está mal: eso lo
 *      resuelve la pasada B.
 *   B. EIDOS (con red). Resuelve el `scientificName` y comprueba el `eidosTaxonId`: nombre aceptado,
 *      y rango del identificador.
 *   C. GBIF (con red). Estado de cada `gbifSpeciesKey` en el backbone.
 *
 * Qué corrige `--write`, y qué NO
 * -------------------------------
 * Escribe **solo lo que no cambia el nombre de la ficha**: la `gbifSpeciesKey` que apunta a un
 * sinónimo HOMOTÍPICO —mismo tipo nomenclatural, así que es literalmente el mismo taxón y la
 * aceptada es superconjunto— y el `taxonomy.genus` que EIDOS desmiente.
 *
 * NO renombra, y no por prudencia decorativa: renombrar un taxón **desengancha su entrada del
 * catálogo universal y su texto de `data/contenido/`**, que se indexan por nombre científico (§2 del
 * CLAUDE.md), y además hay que decidir si es un renombrado o una FUSIÓN con una ficha que ya existe
 * con el nombre bueno. Eso va en un `fix-*.js` con la decisión escrita, como se hizo con
 * `fix-curruca-undata.js` y `fix-nomenclatura-eidos.js`.
 *
 * Un sinónimo HETEROTÍPICO de GBIF tampoco se toca nunca: ahí las dos autoridades discrepan de
 * CIRCUNSCRIPCIÓN —GBIF hunde *Anabasis hispanica* en *A. articulata*, que es otra especie para
 * EIDOS—, y cambiar la key traería ocurrencias de un taxón distinto. Se enumera y se queda.
 *
 * Idempotente: un segundo pase no cambia un byte. No toca la base de datos (regla nº 2 de
 * `Tools/CLAUDE.md`); tras un `--write` hay que regenerar el SQL de los espacios tocados.
 *
 * Uso:
 *     node Tools/catalogo-nacional/coteja-nomenclatura.js            solo la pasada A (sin red)
 *     node Tools/catalogo-nacional/coteja-nomenclatura.js --online   las tres, con caché
 *     node Tools/catalogo-nacional/coteja-nomenclatura.js --online --write
 *       [--park <slug>] [--informe <ruta>] [--sin-cache]
 */

const fs = require('fs');
const path = require('path');
const { arg, flag, sleep } = require('../lib/cli');
const { OUT_DIR, readJson, writeJson, rel, fromRoot, parkFiles } = require('../lib/io');
const { rows } = require('../lib/eidos');
const { getJson } = require('../lib/http');

const PARK = arg('park');
const ONLINE = flag('online');
const WRITE = flag('write');
const SIN_CACHE = flag('sin-cache');
const INFORME = arg('informe');

// La caché evita repetir 1.500 peticiones a dos servicios públicos cada vez que alguien mira el
// informe. Se guarda en `out/`, que está excluido de la búsqueda por ser dato reproducible.
const CACHE_FILE = path.join(OUT_DIR, 'nomenclatura-autoridades.json');

const generoDe = (sci) => String(sci || '').trim().split(/\s+/)[0] || null;
const binomio = (sci) => String(sci || '').trim().split(/\s+/).slice(0, 2).join(' ');
// EIDOS sirve el nombre CON autor («Curruca undata (Boddaert, 1783)»); el catálogo lo guarda sin él.
const casaNombre = (eidosName, sci) => {
  const n = String(eidosName || '').trim().toLowerCase().replace(/\s+/g, ' ');
  const s = String(sci || '').trim().toLowerCase().replace(/\s+/g, ' ');
  return n === s || n.startsWith(s + ' ');
};

// --- Lectura del catálogo -------------------------------------------------------------------------

function cargaFichas() {
  const fichas = [];
  for (const p of parkFiles()) {
    if (PARK && p.slug !== PARK) continue;
    const doc = readJson(p.file);
    for (const sp of (doc.species || [])) fichas.push({ slug: p.slug, file: p.file, doc, sp });
  }
  return fichas;
}

// --- Pasada A: el género, sin red -----------------------------------------------------------------

function pasadaGenero(fichas) {
  const casos = new Map();
  for (const f of fichas) {
    const gTax = (f.sp.taxonomy || {}).genus;
    if (!gTax) continue;
    const gSci = generoDe(f.sp.scientificName);
    if (gTax === gSci) continue;
    const clave = f.sp.scientificName;
    if (!casos.has(clave)) casos.set(clave, { sci: clave, genusTaxonomia: gTax, slugs: [] });
    casos.get(clave).slugs.push(f.slug);
  }
  return [...casos.values()];
}

// --- Pasadas B y C: las autoridades ---------------------------------------------------------------

async function consultaEidosPorNombre(sci) {
  const filas = await rows('v_taxonomia',
    [`name=like.${encodeURIComponent(sci)}*`, 'select=taxonid,name,taxonrank,nametype,genus']);
  const propia = filas.filter(r => casaNombre(r.name, sci));
  const aceptadoPropio = propia.find(r => r.nametype === 'Aceptado/válido') || null;
  const sinonimoPropio = propia.find(r => r.nametype === 'Sinónimo') || null;
  return { filas, aceptadoPropio, sinonimoPropio };
}

async function consultaEidosPorId(taxonid) {
  const filas = await rows('v_taxonomia',
    [`taxonid=eq.${taxonid}`, 'select=taxonid,name,taxonrank,nametype,genus']);
  return { filas, aceptado: filas.find(r => r.nametype === 'Aceptado/válido') || null };
}

async function consultaGbif(key) {
  const sp = await getJson('api.gbif.org', `/v1/species/${key}`, { agent: 'gbif' });
  return {
    status: sp.taxonomicStatus || null, rank: sp.rank || null,
    nombre: sp.scientificName || null, aceptado: sp.accepted || null, aceptadaKey: sp.acceptedKey || null,
  };
}

async function pasadaAutoridades(fichas) {
  const cache = (!SIN_CACHE && fs.existsSync(CACHE_FILE)) ? readJson(CACHE_FILE) : { eidosNombre: {}, eidosId: {}, gbif: {} };
  cache.eidosNombre ||= {}; cache.eidosId ||= {}; cache.gbif ||= {};

  const nombres = [...new Set(fichas.map(f => f.sp.scientificName).filter(Boolean))];
  const ids = [...new Set(fichas.map(f => f.sp.eidosTaxonId).filter(v => v !== null && v !== undefined))];
  const keys = [...new Set(fichas.map(f => f.sp.gbifSpeciesKey).filter(v => v !== null && v !== undefined))];

  let pedidas = 0;
  const progreso = (n, total, que) => {
    if (n % 100 === 0) process.stderr.write(`  ${que}: ${n}/${total}\n`);
  };

  for (let i = 0; i < nombres.length; i++) {
    progreso(i, nombres.length, 'EIDOS por nombre');
    if (cache.eidosNombre[nombres[i]]) continue;
    try { cache.eidosNombre[nombres[i]] = await consultaEidosPorNombre(nombres[i]); }
    catch (e) { cache.eidosNombre[nombres[i]] = { error: e.message }; }
    pedidas++; await sleep(150);
  }
  for (let i = 0; i < ids.length; i++) {
    progreso(i, ids.length, 'EIDOS por id');
    if (cache.eidosId[ids[i]]) continue;
    try { cache.eidosId[ids[i]] = await consultaEidosPorId(ids[i]); }
    catch (e) { cache.eidosId[ids[i]] = { error: e.message }; }
    pedidas++; await sleep(150);
  }
  for (let i = 0; i < keys.length; i++) {
    progreso(i, keys.length, 'GBIF por key');
    if (cache.gbif[keys[i]]) continue;
    try { cache.gbif[keys[i]] = await consultaGbif(keys[i]); }
    catch (e) { cache.gbif[keys[i]] = { error: e.message }; }
    pedidas++; await sleep(60);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  writeJson(CACHE_FILE, cache);
  console.log(`Autoridades consultadas: ${pedidas} petición(es) nueva(s); el resto, de ${rel(CACHE_FILE)}.`);
  return cache;
}

/*
 * Clasificación de los hallazgos. Cada uno lleva `corregible`, que es lo único que `--write` mira:
 * los renombrados NO lo son por lo que explica la cabecera, aunque el nombre bueno se sepa.
 */
function clasifica(fichas, cache) {
  const hallazgos = [];
  const porNombre = new Map();
  for (const f of fichas) {
    const clave = `${f.sp.scientificName}`;
    if (!porNombre.has(clave)) porNombre.set(clave, []);
    porNombre.get(clave).push(f);
  }

  for (const [sci, grupo] of porNombre) {
    const e = cache.eidosNombre[sci];
    const sp = grupo[0].sp;
    const slugs = grupo.map(g => g.slug);

    /*
     * B1 · el nombre de la ficha es un sinónimo y EIDOS acepta otro.
     *
     * La propuesta SOLO se da cuando el nombre aceptado es de rango especie. Cuando EIDOS acepta una
     * subespecie o una variedad —*Klasea flavescens* subsp. *mucronata* por *Serratula mucronata*—,
     * truncar el trinomio a binomio afirmaría que la ficha es de la especie entera, que es un taxón
     * distinto y más amplio del que la fuente reconoce. Eso es rellenar un campo a ojo (regla nº 2
     * del CLAUDE.md), así que se dice el nombre completo, se dice el rango y se deja la decisión.
     */
    if (e && !e.error && !e.aceptadoPropio && e.sinonimoPropio) {
      const porId = cache.eidosId[sp.eidosTaxonId];
      const aceptado = porId && !porId.error ? porId.aceptado : null;
      const esEspecie = !!(aceptado && aceptado.taxonrank === 'Species');
      hallazgos.push({
        tipo: 'nombre_sinonimo', corregible: false, sci, slugs,
        detalle: `EIDOS da «${sci}» por Sinónimo` +
          (aceptado ? `; acepta «${aceptado.name}» (taxonid ${aceptado.taxonid}, ${aceptado.taxonrank})` : '') +
          (aceptado && !esEspecie
            ? `. **El aceptado es de rango ${aceptado.taxonrank}**: adoptarlo cambia el rango de la ` +
              'ficha, no solo el nombre, así que no se propone un binomio truncado'
            : ''),
        propuesta: esEspecie ? binomio(aceptado.name) : null,
        propuestaTaxonId: aceptado ? aceptado.taxonid : null,
      });
    }

    // B2 · el eidosTaxonId no es de rango especie mientras la ficha lleva un binomio.
    const porId = cache.eidosId[sp.eidosTaxonId];
    if (porId && !porId.error && porId.aceptado &&
        porId.aceptado.taxonrank && porId.aceptado.taxonrank !== 'Species' &&
        String(sci).trim().split(/\s+/).length === 2) {
      hallazgos.push({
        tipo: 'id_de_otro_rango', corregible: false, sci, slugs,
        detalle: `el eidosTaxonId ${sp.eidosTaxonId} es de rango ${porId.aceptado.taxonrank} ` +
          `(«${porId.aceptado.name}»), pero la ficha declara un binomio de especie`,
        propuesta: null, propuestaTaxonId: null,
      });
    }

    // A · el género de la taxonomía (EIDOS) contra el del nombre. Se resuelve con lo que diga EIDOS
    // del nombre: si el nombre es el aceptado, el desalineado es `taxonomy.genus`.
    const gTax = (sp.taxonomy || {}).genus;
    if (gTax && gTax !== generoDe(sci)) {
      const nombreEsAceptado = !!(e && !e.error && e.aceptadoPropio);
      hallazgos.push({
        tipo: nombreEsAceptado ? 'genus_taxonomia_desalineado' : 'genus_discordante',
        corregible: nombreEsAceptado,
        sci, slugs,
        detalle: nombreEsAceptado
          ? `taxonomy.genus dice «${gTax}» y EIDOS acepta «${e.aceptadoPropio.name}», cuyo género es ` +
            `«${e.aceptadoPropio.genus}». El nombre de la ficha es el bueno; el género, no`
          : `taxonomy.genus «${gTax}» ≠ género del nombre «${generoDe(sci)}»`,
        propuesta: nombreEsAceptado ? e.aceptadoPropio.genus : null, propuestaTaxonId: null,
      });
    }

    // C · la gbifSpeciesKey.
    const g = cache.gbif[sp.gbifSpeciesKey];
    if (g && !g.error && g.status && g.status !== 'ACCEPTED') {
      const homotipico = g.status === 'HOMOTYPIC_SYNONYM' && g.aceptadaKey;
      hallazgos.push({
        tipo: homotipico ? 'gbif_key_sinonimo_homotipico'
          : (g.status === 'DOUBTFUL' ? 'gbif_key_dudosa' : 'gbif_key_sinonimo_heterotipico'),
        corregible: !!homotipico, sci, slugs,
        detalle: `gbifSpeciesKey ${sp.gbifSpeciesKey} («${g.nombre}») es ${g.status} en el backbone` +
          (g.aceptado ? `; el aceptado es «${g.aceptado}» (key ${g.aceptadaKey})` : '; GBIF no da un aceptado'),
        propuesta: homotipico ? g.aceptadaKey : null, propuestaTaxonId: null,
      });
    }

    /*
     * D · la key que no identifica ninguna especie.
     *
     * `lib/gbif.js` lo dice en su cabecera —«una `usageKey` de género o familia no identifica ninguna
     * especie»— y aun así había tres fichadas así, todas del volcado del piloto: *Salsola
     * vermiculata* y *Arthrocnemum macrostachyum* con la **3064**, que es la FAMILIA Amaranthaceae;
     * *Stipa capensis* con la **3073**, que es Poaceae; y *Sedum sediforme* con la **2406**, que es
     * Crassulaceae. La comprobación C no las ve porque una familia es un taxón perfectamente
     * `ACCEPTED`: lo que falla no es el estado, es el RANGO.
     *
     * Y no es cosmético. La key es con lo que se piden las ocurrencias, así que una key de familia
     * trae las de toda la familia; y dos especies distintas con la misma key son un duplicado que
     * `scan-taxones-duplicados` marca sin poder decir cuál de las dos está mal.
     *
     * Se corrige SOLO cuando otro espacio ficha ese mismo nombre con una key de rango especie: se
     * reutiliza esa, que es lo mismo que hace `build-species-n2.js` con los identificadores. Si no
     * hay de dónde copiarla, se dice y se deja — deducirla sería inventarla.
     */
    const RANGOS_DE_ESPECIE = new Set(['SPECIES', 'SUBSPECIES', 'VARIETY', 'FORM']);
    const keyBuena = grupo
      .map(x => x.sp.gbifSpeciesKey)
      .filter(k => k != null && cache.gbif[k] && !cache.gbif[k].error &&
        RANGOS_DE_ESPECIE.has(String(cache.gbif[k].rank || '').toUpperCase()))
      .find(Boolean);
    for (const f of grupo) {
      const k = f.sp.gbifSpeciesKey;
      const gk = k != null ? cache.gbif[k] : null;
      if (!gk || gk.error || !gk.rank) continue;
      if (RANGOS_DE_ESPECIE.has(String(gk.rank).toUpperCase())) continue;
      hallazgos.push({
        tipo: 'gbif_key_de_otro_rango',
        corregible: keyBuena != null && keyBuena !== k,
        sci, slugs: [f.slug],
        detalle: `gbifSpeciesKey ${k} es de rango ${gk.rank} («${gk.nombre}»), que no identifica ` +
          'ninguna especie: pedir ocurrencias con ella trae las de todo el grupo' +
          (keyBuena != null && keyBuena !== k
            ? `. Otro espacio la ficha con la key ${keyBuena} («${cache.gbif[keyBuena].nombre}», ` +
              `${cache.gbif[keyBuena].rank}), que es la que se reutiliza`
            : '. **Ningún espacio la ficha con una key de especie**, así que no hay de dónde copiarla'),
        propuesta: keyBuena != null && keyBuena !== k ? keyBuena : null, propuestaTaxonId: null,
      });
    }
  }
  return hallazgos;
}

// --- Escritura de lo seguro -----------------------------------------------------------------------

/*
 * `taxonomy` es un campo UNIVERSAL: vive en `data/especies-universal.json` y `species:apply` lo
 * reparte a los `park.json`. Corregirlo solo en las fichas es escribir en el sitio equivocado — la
 * siguiente sincronización lo revierte en silencio, que es el fallo en verde nº 1 del §2 del
 * CLAUDE.md—. Se comprobó de la peor manera: la primera versión de esta herramienta corrigió el
 * género del romero en los ocho `park.json`, y `species:apply` lo devolvió a «Salvia» acto seguido.
 * Por eso la corrección va a los dos sitios, y el universal es el que manda.
 */
function corrigeUniversal(hallazgos) {
  const universalPath = path.join(path.dirname(OUT_DIR), 'data', 'especies-universal.json');
  if (!fs.existsSync(universalPath)) return 0;
  const universal = readJson(universalPath);
  let n = 0;
  for (const h of hallazgos) {
    if (h.tipo !== 'genus_taxonomia_desalineado') continue;
    const ficha = universal[h.sci];
    if (!ficha || !ficha.taxonomy || ficha.taxonomy.genus === h.propuesta) continue;
    ficha.taxonomy.genus = h.propuesta;
    n++;
  }
  if (n) writeJson(universalPath, universal);
  return n;
}

function aplica(fichas, hallazgos) {
  const porSci = new Map();
  for (const h of hallazgos.filter(x => x.corregible)) {
    if (!porSci.has(h.sci)) porSci.set(h.sci, []);
    porSci.get(h.sci).push(h);
  }
  const docs = new Map();
  let cambios = corrigeUniversal(hallazgos.filter(x => x.corregible));
  for (const f of fichas) {
    const hs = porSci.get(f.sp.scientificName);
    if (!hs) continue;
    for (const h of hs) {
      if (h.tipo === 'gbif_key_de_otro_rango' && h.propuesta != null && f.sp.gbifSpeciesKey !== h.propuesta) {
        f.sp.gbifSpeciesKey = h.propuesta; cambios++;
        docs.set(f.file, f.doc);
      }
      if (h.tipo === 'gbif_key_sinonimo_homotipico' && f.sp.gbifSpeciesKey !== h.propuesta) {
        f.sp.gbifSpeciesKey = h.propuesta; cambios++;
        docs.set(f.file, f.doc);
      }
      if (h.tipo === 'genus_taxonomia_desalineado' && f.sp.taxonomy && f.sp.taxonomy.genus !== h.propuesta) {
        f.sp.taxonomy.genus = h.propuesta; cambios++;
        docs.set(f.file, f.doc);
      }
    }
  }
  for (const [file, doc] of docs) writeJson(file, doc);
  return { cambios, ficheros: docs.size };
}

// --- Informe --------------------------------------------------------------------------------------

const TITULOS = {
  nombre_sinonimo: 'El nombre de la ficha es un SINÓNIMO para EIDOS (hay que renombrar)',
  id_de_otro_rango: 'El eidosTaxonId no es de rango especie (hay que reanclar)',
  genus_discordante: 'El género de taxonomy no cuadra con el del nombre (sin resolver)',
  genus_taxonomia_desalineado: 'taxonomy.genus contradice a EIDOS (corregible)',
  gbif_key_sinonimo_homotipico: 'gbifSpeciesKey apunta a un sinónimo HOMOTÍPICO de GBIF (corregible: pierde ocurrencias)',
  gbif_key_sinonimo_heterotipico: 'gbifSpeciesKey apunta a un sinónimo HETEROTÍPICO (NO se toca: cambia el taxón)',
  gbif_key_dudosa: 'GBIF marca la key como DOUBTFUL y no da aceptado (no hay nada que corregir)',
  gbif_key_de_otro_rango: 'gbifSpeciesKey de rango familia o género: no identifica ninguna especie',
};
const ORDEN = Object.keys(TITULOS);

function informe(hallazgos, pasoA) {
  const l = [];
  l.push('# Cotejo de nomenclatura contra EIDOS y GBIF', '');
  l.push(`Generado por \`npm run taxones:nomenclatura\`. Fichas con hallazgo: ${new Set(hallazgos.map(h => h.sci)).size}.`, '');
  l.push('La regla que se comprueba: `scientificName`, `eidosTaxonId` y `taxonomy` los manda **EIDOS**');
  l.push('(nombre aceptado); `gbifSpeciesKey` la manda **GBIF** (key aceptada de su backbone, que es la');
  l.push('que lleva las ocurrencias). Que las dos autoridades usen géneros distintos no es un error.', '');
  for (const tipo of ORDEN) {
    const del = hallazgos.filter(h => h.tipo === tipo);
    if (!del.length) continue;
    l.push(`## ${TITULOS[tipo]} — ${del.length}`, '');
    for (const h of del) {
      l.push(`- **${h.sci}** (${h.slugs.join(', ')})`);
      l.push(`  - ${h.detalle}`);
      if (h.propuesta) l.push(`  - propuesta: \`${h.propuesta}\``);
    }
    l.push('');
  }
  if (pasoA.length) {
    l.push('## Anexo: lo que ve la pasada A, sin salir a la red', '');
    l.push('Es la comprobación barata, apta para `validate`: caza esta clase entera sin una petición.', '');
    for (const c of pasoA) l.push(`- \`${c.sci}\` · taxonomy.genus = \`${c.genusTaxonomia}\` · ${c.slugs.join(', ')}`);
    l.push('');
  }
  return l.join('\n');
}

// --- Principal ------------------------------------------------------------------------------------

async function main() {
  const fichas = cargaFichas();
  console.log(`Fichas leídas: ${fichas.length}${PARK ? ` (solo ${PARK})` : ''}.`);

  const pasoA = pasadaGenero(fichas);
  console.log(`\nPasada A (sin red) · género del nombre ≠ taxonomy.genus: ${pasoA.length}`);
  for (const c of pasoA) console.log(`  · ${c.sci.padEnd(28)} taxonomy.genus=${c.genusTaxonomia}  [${c.slugs.length} espacio(s)]`);

  if (!ONLINE) {
    console.log('\nSolo se ha hecho la pasada A. Añade --online para preguntar a EIDOS y a GBIF.');
    process.exit(pasoA.length ? 1 : 0);
  }

  const cache = await pasadaAutoridades(fichas);
  const hallazgos = clasifica(fichas, cache);

  console.log('');
  for (const tipo of ORDEN) {
    const n = hallazgos.filter(h => h.tipo === tipo).length;
    if (n) console.log(`${String(n).padStart(4)} · ${TITULOS[tipo]}`);
  }

  if (WRITE) {
    const { cambios, ficheros } = aplica(fichas, hallazgos);
    console.log(`\n+ ${cambios} campo(s) corregido(s) en ${ficheros} park.json.`);
    if (cambios) {
      console.log('  Regenera el SQL de los espacios tocados (npm run park:sql): la API manda sobre');
      console.log('  el park.json empaquetado, así que sin eso el usuario sigue viendo el dato viejo.');
    }
  } else {
    const n = hallazgos.filter(h => h.corregible).length;
    console.log(`\nSimulación: ${n} hallazgo(s) corregible(s) sin escribir. Añade --write para aplicarlos.`);
  }

  const destino = fromRoot(INFORME || 'Docs/nomenclatura-autoridades.md');
  fs.writeFileSync(destino, informe(hallazgos, pasoA));
  console.log(`Informe en ${rel(destino)}`);

  // Los no corregibles son los que exigen una decisión humana: sale con 1 mientras queden.
  process.exit(hallazgos.some(h => !h.corregible && h.tipo !== 'gbif_key_dudosa' &&
    h.tipo !== 'gbif_key_sinonimo_heterotipico') ? 1 : 0);
}

main();
