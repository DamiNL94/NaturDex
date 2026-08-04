#!/usr/bin/env node
/*
 * sync-species-catalog.js — una especie, una ficha, en todos los parques.
 *
 * El problema que resuelve
 * -----------------------
 * Cada park.json llevaba su propia copia de cada especie. Como la misma especie aparece en varios
 * parques, las copias derivaban: el pino carrasco tenía una foto en Cabo Cope y otra en Sierra
 * Espuña, y su descripción decía «presente en laderas y zonas de repoblación del interior del
 * parque» en los dos sitios, con la fuente citando un artículo sobre la Marina de Cope. Peor: 40
 * especies de Sierra Espuña arrastraban descripciones que hablaban de «la ZEPA ES0000261 (Almenara,
 * Moreras y Cabo Cope)», que es de otro espacio a 100 km.
 *
 * La causa es que la ficha mezclaba dos cosas distintas:
 *
 *   - Lo que la especie ES: cómo se llama, a qué grupo pertenece, cómo se reconoce, su taxonomía y
 *     su estado legal. Esto es idéntico la vea uno donde la vea → UNIVERSAL.
 *   - Dónde y cómo aparece EN ESTE PARQUE: en qué hábitats se ha citado, si es una especie
 *     destacada de ese catálogo, cuántas ocurrencias hay, de qué fuente salió esa cita → LOCAL.
 *
 * Este script separa ambas. El catálogo universal
 * (`Tools/catalogo-nacional/data/especies-universal.json`, indexado por nombre científico) es la
 * fuente de verdad de lo primero; el park.json sigue siendo la de lo segundo y sigue siendo
 * autosuficiente (importa: la PWA funciona sin conexión leyendo solo su park.json).
 *
 * Uso
 * ---
 *   node Tools/sync-species-catalog.js --check     Informa de divergencias y de texto local
 *                                                  colado en campos universales. No escribe nada.
 *   node Tools/sync-species-catalog.js --extract   Vuelca a un catálogo universal lo que hoy hay en
 *                                                  los park.json (punto de partida; avisa de los
 *                                                  conflictos entre parques en vez de elegir a ciegas).
 *   node Tools/sync-species-catalog.js --apply     Escribe los campos universales del catálogo en
 *                                                  todos los park.json.
 *   node Tools/sync-species-catalog.js --apply --sql Database/species-universal.sql
 *                                                  Además, genera los UPDATE para la base de datos
 *                                                  (necesario: Frontend/Js/data.js da PRIORIDAD a la
 *                                                  API sobre el park.json cuando hay backend).
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { arg, flag } = require('./lib/cli');
const { sqlStr } = require('./lib/sql');
const { ROOT, CATALOGO_DIR, rel, fromRoot, parkFiles } = require('./lib/io');

const CATALOGO = path.join(CATALOGO_DIR, 'data', 'especies-universal.json');
const CONTENIDO_DIR = path.join(CATALOGO_DIR, 'data', 'contenido');

// Vocabulario cerrado de `group`. Antes había 79 valores distintos en un parque y 61 en otro,
// mezclando tres cosas: la forma de vida ("Arbusto"), la familia botánica ("Quenopodiácea") y el
// ambiente ("psamófila", "de rambla"). La ficha ya tiene un apartado de taxonomía para la familia y
// un campo `habitat` para el ambiente, así que `group` se queda con lo único que no está en otro
// sitio: qué clase de ser vivo es. Lo demás se traduce aquí.
const GRUPO_NORMALIZADO = {
  'Arbusto esclerófilo': 'Arbusto', 'Arbusto espinoso': 'Arbusto', 'Arbusto halófilo': 'Arbusto',
  'Arbusto o arbolillo': 'Arbusto', 'Arbusto iberoafricano': 'Arbusto', 'Arbusto ribereño (adelfa)': 'Arbusto',
  'Arbusto aromático': 'Mata aromática', 'Árbol o arbusto': 'Árbol', 'Taray': 'Árbol',
  'Leguminosa arbustiva': 'Arbusto', 'Compuesta espinosa': 'Mata', 'Asparagácea espinosa': 'Arbusto',
  'Gnetófita arbustiva': 'Arbusto', 'Arbusto hemiparásito': 'Arbusto',
  'Jara (Cistácea)': 'Mata', 'Jarilla (Cistácea)': 'Mata', 'Cistácea': 'Mata',
  'Matorral aromático': 'Mata aromática', 'Planta aromática': 'Mata aromática',
  'Labiada arbustiva': 'Mata aromática', 'Labiada de tomillar': 'Mata aromática', 'Labiada': 'Mata aromática',
  'Planta litoral': 'Mata', 'Quenopodiácea halófila': 'Mata', 'Quenopodiácea halonitrófila': 'Mata',
  'Quenopodiácea de playa': 'Hierba', 'Frankeniácea halófila': 'Mata', 'Plumbaginácea halófila': 'Hierba',
  'Planta halófila': 'Hierba', 'Compuesta rupícola': 'Mata', 'Compuesta pionera': 'Mata',
  'Compuesta de rambla': 'Hierba', 'Compuesta': 'Hierba',
  'Planta herbácea': 'Hierba', 'Planta herbácea endémica': 'Hierba', 'Hierba anual': 'Hierba',
  'Hierba de roquedo': 'Hierba', 'Hierba dunar': 'Hierba', 'Lechetrezna litoral': 'Hierba',
  'Leguminosa dunar': 'Hierba', 'Leguminosa psamófila': 'Hierba', 'Leguminosa': 'Hierba',
  'Papaverácea de gravas': 'Hierba', 'Escrofulariácea de gravas': 'Hierba', 'Ciperácea dunar': 'Hierba',
  'Terófito calcícola': 'Hierba', 'Terófito dunar': 'Hierba', 'Terófito psammófilo': 'Hierba',
  'Plantaginácea de pastizal': 'Hierba', 'Asfodelácea de pastizal': 'Hierba',
  'Cigofilácea iberoafricana': 'Hierba', 'Umbelífera rupícola litoral': 'Hierba', 'Umbelífera': 'Hierba',
  'Dicotiledónea': 'Hierba', 'Monocotiledónea': 'Hierba', 'Campanulácea': 'Hierba',
  'Caprifoliácea': 'Arbusto', 'Plantaginácea': 'Hierba', 'Geraniácea': 'Hierba',
  'Cariofilácea': 'Hierba', 'Rosácea': 'Arbusto', 'Ramnácea': 'Arbusto', 'Oleácea': 'Arbusto',
  'Ericácea': 'Arbusto', 'Solanácea': 'Arbusto', 'Anacardiácea': 'Arbusto', 'Acerácea': 'Árbol',
  'Salicácea': 'Árbol', 'Fagácea (roble/encina)': 'Árbol', 'Convolvulácea': 'Hierba',
  'Amarilidácea': 'Planta bulbosa', 'Liliácea': 'Planta bulbosa', 'Iridácea': 'Planta bulbosa',
  'Planta bulbosa litoral': 'Planta bulbosa',
  'Crasulácea': 'Planta suculenta', 'Planta suculenta halófila': 'Planta suculenta',
  'Gramínea anual': 'Gramínea', 'Gramínea vivaz': 'Gramínea', 'Gramínea vivaz esteparia': 'Gramínea',
  'Gramínea ribereña': 'Gramínea', 'Gramínea rupícola': 'Gramínea',
  'Gramínea psamófila': 'Gramínea', 'Gramínea psammófila': 'Gramínea', 'Helófito': 'Gramínea',
  'Orquídea': 'Orquídea', 'Palmera': 'Palmera', 'Conífera': 'Conífera', 'Helecho': 'Helecho',
  'Aves': 'Ave', 'Quiróptero': 'Murciélago', 'Mamífero ungulado': 'Mamífero ungulado',
};

// Campos que describen a la ESPECIE. Se sincronizan a todos los parques.
const UNIVERSALES = [
  'commonName', 'kingdom', 'group', 'habitat', 'seasonality', 'rarityScore',
  'description', 'tips', 'taxonomy', 'iucnGlobal', 'spainStatus',
  'image', 'imageAttribution',
];

// Campos que describen la PRESENCIA en un parque concreto. No se tocan nunca.
const LOCALES = [
  'id', 'habitatIds', 'coordinates', 'featured', 'visible', 'source', 'reviewNote',
  'zepaSiteCode', 'gbifOccurrences', 'gbifBboxSightings', 'gbifSpeciesKey', 'eidosTaxonId',
  'murciaStatus', 'conservationStatus', 'audio', 'audioTranscript',
];

// Texto que delata que un campo universal se escribió pensando en un parque concreto.
const RASTRO_LOCAL = /\b(este parque|del parque|en el parque|parque piloto|este espacio|Cabo Cope|Calnegre|Marina de Cope|Espuña|ZEPA ES\d+|LIC\/ZEC ES\d+|EEA\/BISE|Red Natura 2000)\b/i;

// Lectura de opciones: Tools/lib/cli.js (admite `--x v` y `--x=v`).
const has = flag, val = arg;

// El recorrido de Frontend/Data/parks/<provincia>/<slug>/park.json vive en Tools/lib/io.js
// (`parkFiles`): lo hacían igual esta herramienta, wikimedia-images.js y habitat-images.js.

const leer = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const escribir = (f, obj) => fs.writeFileSync(f, JSON.stringify(obj, null, 2) + '\n', 'utf8');
const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
// «Vacío» a efectos de fusión: null, cadena en blanco, array sin elementos u objeto sin claves.
const vacio = v => v === null || v === undefined || v === ''
  || (Array.isArray(v) && !v.length)
  || (typeof v === 'object' && !Array.isArray(v) && !Object.keys(v).length);

// --- --check ---------------------------------------------------------------------------------------
function comprobar() {
  const porEspecie = new Map();
  let totalFichas = 0;

  for (const { slug, file } of parkFiles()) {
    for (const sp of (leer(file).species || [])) {
      totalFichas++;
      if (!porEspecie.has(sp.scientificName)) porEspecie.set(sp.scientificName, []);
      porEspecie.get(sp.scientificName).push({ slug, sp });
    }
  }

  const divergencias = [];
  for (const [sci, apariciones] of porEspecie) {
    if (apariciones.length < 2) continue;
    const [primera, ...resto] = apariciones;
    for (const campo of UNIVERSALES) {
      const distinto = resto.filter(a => !igual(a.sp[campo], primera.sp[campo]));
      if (distinto.length) {
        divergencias.push({ sci, campo, parques: [primera.slug, ...distinto.map(d => d.slug)] });
      }
    }
  }

  const contaminadas = [];
  for (const [sci, apariciones] of porEspecie) {
    for (const { slug, sp } of apariciones) {
      for (const campo of ['description', 'habitat', 'tips']) {
        const texto = Array.isArray(sp[campo]) ? sp[campo].join(' ') : (sp[campo] || '');
        const m = texto.match(RASTRO_LOCAL);
        if (m) { contaminadas.push({ sci, slug, campo, rastro: m[0] }); break; }
      }
    }
  }

  const sinTips = [];
  const sinFoto = [];
  const sinAtribucion = [];
  for (const [sci, apariciones] of porEspecie) {
    const sp = apariciones[0].sp;
    if (!(sp.tips || []).length) sinTips.push(sci);
    if (!sp.image) sinFoto.push(sci);
    else if (!sp.imageAttribution) sinAtribucion.push(sci);
  }

  console.log(`Fichas: ${totalFichas} · especies distintas: ${porEspecie.size}`);
  console.log(`\nDivergencias entre parques en campos universales: ${divergencias.length}`);
  divergencias.slice(0, 30).forEach(d => console.log(`  · ${d.sci} — ${d.campo} (${d.parques.join(' vs ')})`));
  if (divergencias.length > 30) console.log(`  … y ${divergencias.length - 30} más`);

  console.log(`\nCampos universales con texto de un parque concreto: ${contaminadas.length}`);
  contaminadas.slice(0, 30).forEach(c => console.log(`  · ${c.slug} — ${c.sci} (${c.campo}): «${c.rastro}»`));
  if (contaminadas.length > 30) console.log(`  … y ${contaminadas.length - 30} más`);

  console.log(`\nSin pistas de identificación: ${sinTips.length}`);
  console.log(`Sin foto: ${sinFoto.length}${sinFoto.length ? ' → ' + sinFoto.join(', ') : ''}`);
  console.log(`Con foto pero sin atribución: ${sinAtribucion.length}${sinAtribucion.length ? ' → ' + sinAtribucion.join(', ') : ''}`);

  return divergencias.length + contaminadas.length;
}

// --- --extract -------------------------------------------------------------------------------------
function extraer() {
  const catalogo = fs.existsSync(CATALOGO) ? leer(CATALOGO) : {};
  const conflictos = [];
  let nuevas = 0;

  for (const { slug, file } of parkFiles()) {
    for (const sp of (leer(file).species || [])) {
      const sci = sp.scientificName;
      if (!catalogo[sci]) {
        catalogo[sci] = {};
        for (const campo of UNIVERSALES) if (sp[campo] !== undefined) catalogo[sci][campo] = sp[campo];
        nuevas++;
        continue;
      }
      for (const campo of UNIVERSALES) {
        if (sp[campo] === undefined) continue;
        if (igual(catalogo[sci][campo], sp[campo])) continue;
        // Una misma especie puede estar más documentada en un parque que en otro (a Cabo Cope le
        // faltaba la taxonomía de dos aves que Sierra Espuña sí tenía). Si el catálogo no tiene
        // nada en ese campo, se rellena con lo que sí hay; si tiene dos valores distintos y ambos
        // con contenido, eso es un conflicto real y hay que mirarlo a mano.
        if (vacio(catalogo[sci][campo])) { catalogo[sci][campo] = sp[campo]; continue; }
        if (vacio(sp[campo])) continue;
        // La taxonomía se fusiona rango a rango: un parque puede traer el orden y la familia que al
        // otro le faltaban (venían a null), y quedarse con el primero perdería ese dato.
        if (campo === 'taxonomy') {
          let completado = false;
          for (const rango in sp.taxonomy) {
            if (vacio(catalogo[sci].taxonomy[rango]) && !vacio(sp.taxonomy[rango])) {
              catalogo[sci].taxonomy[rango] = sp.taxonomy[rango];
              completado = true;
            }
          }
          if (completado || igual(catalogo[sci].taxonomy, sp.taxonomy)) continue;
        }
        conflictos.push({ sci, campo, slug });
      }
    }
  }

  // Normaliza el vocabulario de `group` antes de superponer nada.
  let gruposTraducidos = 0;
  for (const sci in catalogo) {
    const g = catalogo[sci].group;
    if (g && GRUPO_NORMALIZADO[g] && GRUPO_NORMALIZADO[g] !== g) { catalogo[sci].group = GRUPO_NORMALIZADO[g]; gruposTraducidos++; }
  }

  // Superpone el contenido redactado a mano (data/contenido/*.json). Manda sobre lo extraído: es
  // texto escrito para ser universal, mientras que lo de los park.json arrastra el sesgo del parque
  // en el que se escribió.
  let redactadas = 0, sinFicha = [], fotosMuertas = [];
  if (fs.existsSync(CONTENIDO_DIR)) {
    for (const fichero of fs.readdirSync(CONTENIDO_DIR).filter(f => f.endsWith('.json')).sort()) {
      const bloque = leer(path.join(CONTENIDO_DIR, fichero));
      for (const sci in bloque) {
        if (sci.startsWith('_')) continue;
        if (!catalogo[sci]) { sinFicha.push(`${sci} (${fichero})`); continue; }
        // Una foto LOCAL fijada aquí que ya no existe en disco es el peor caso posible: como este
        // bloque manda sobre todo lo demás, cada --extract pisa la foto buena del catálogo con una
        // ruta muerta y --apply la propaga a todos los park.json y al SQL, sin que nada falle.
        // Pasó con el pliego de Anabasis hispanica, borrado al cambiar los pliegos por fotos de
        // campo pero no retirado de data/contenido/. Se ignora el campo y se avisa.
        const img = bloque[sci].image;
        if (img && !/^https?:/i.test(img) && !fs.existsSync(path.join(ROOT, 'Frontend', img))) {
          fotosMuertas.push(`${sci} (${fichero}) → ${img}`);
          delete bloque[sci].image;
          delete bloque[sci].imageAttribution;
        }
        Object.assign(catalogo[sci], bloque[sci]);
        redactadas++;
      }
    }
  }

  fs.mkdirSync(path.dirname(CATALOGO), { recursive: true });
  escribir(CATALOGO, Object.fromEntries(Object.keys(catalogo).sort().map(k => [k, catalogo[k]])));
  console.log(`Catálogo universal: ${Object.keys(catalogo).length} especies (${nuevas} nuevas) → ${rel(CATALOGO)}`);
  console.log(`Grupos normalizados: ${gruposTraducidos} · fichas con contenido redactado: ${redactadas}`);
  if (sinFicha.length) {
    console.log(`\n⚠ ${sinFicha.length} entradas de data/contenido/ no corresponden a ninguna especie del catálogo:`);
    sinFicha.forEach(s => console.log('  · ' + s));
  }
  if (fotosMuertas.length) {
    console.log(`\n⚠ ${fotosMuertas.length} foto(s) de data/contenido/ apuntan a un fichero que no existe en Frontend/.`);
    console.log('  Se han IGNORADO (se conserva la del catálogo). Quita esas claves del fichero de contenido:');
    fotosMuertas.forEach(s => console.log('  · ' + s));
  }
  if (conflictos.length) {
    console.log(`\n⚠ ${conflictos.length} valores del catálogo NO coinciden con lo que hay en algún parque.`);
    console.log('  Se ha conservado el valor del catálogo (es la fuente de verdad). Revisa:');
    conflictos.slice(0, 25).forEach(c => console.log(`  · ${c.sci} — ${c.campo} (difiere en ${c.slug})`));
    if (conflictos.length > 25) console.log(`  … y ${conflictos.length - 25} más`);
  }
}

// --- --apply ---------------------------------------------------------------------------------------

function aplicar() {
  if (!fs.existsSync(CATALOGO)) {
    console.error('No existe el catálogo universal. Créalo primero con --extract.');
    process.exit(1);
  }
  const catalogo = leer(CATALOGO);
  const sqlPath = val('--sql', null);
  const sql = [];
  let fichas = 0, cambiadas = 0, huerfanas = [];

  for (const { slug, file } of parkFiles()) {
    const park = leer(file);
    if (!(park.species || []).length) continue;
    let tocado = false;

    for (const sp of park.species) {
      fichas++;
      const universal = catalogo[sp.scientificName];
      if (!universal) { huerfanas.push(`${slug}: ${sp.scientificName}`); continue; }
      let cambia = false;
      for (const campo of UNIVERSALES) {
        if (universal[campo] === undefined) continue;
        if (igual(sp[campo], universal[campo])) continue;
        sp[campo] = universal[campo];
        cambia = true;
      }
      if (cambia) { cambiadas++; tocado = true; }
    }

    if (tocado) { escribir(file, park); console.log(`  → ${rel(file)}`); }

    if (sqlPath) {
      for (const sp of park.species) {
        const u = catalogo[sp.scientificName];
        if (!u) continue;
        sql.push(
          `UPDATE species s JOIN parks p ON p.id = s.park_id SET\n` +
          `  s.common_name = ${sqlStr(u.commonName)},\n` +
          `  s.primary_habitat = ${sqlStr(u.habitat)},\n` +
          `  s.description = ${sqlStr(u.description)},\n` +
          `  s.identification_tips = ${sqlStr((u.tips || []).join('\n'))},\n` +
          `  s.seasonality = ${sqlStr(u.seasonality)},\n` +
          `  s.image_url = ${sqlStr(u.image)},\n` +
          `  s.image_attribution = ${sqlStr(u.imageAttribution)},\n` +
          `  s.rarity_score = ${u.rarityScore ?? 1}\n` +
          `WHERE p.slug = ${sqlStr(slug)} AND s.scientific_name = ${sqlStr(sp.scientificName)};`
        );
      }
    }
  }

  console.log(`\nFichas revisadas ${fichas} · actualizadas ${cambiadas}`);
  if (huerfanas.length) {
    console.log(`\n⚠ ${huerfanas.length} fichas sin entrada en el catálogo universal (se dejan como estaban):`);
    huerfanas.slice(0, 20).forEach(h => console.log('  · ' + h));
  }
  if (sqlPath && sql.length) {
    const cabecera = [
      '-- species-universal.sql — contenido universal de las fichas de especie.',
      '-- GENERADO por Tools/sync-species-catalog.js --apply --sql. No editar a mano:',
      '-- la fuente es Tools/catalogo-nacional/data/especies-universal.json.',
      '--',
      '-- Hace falta porque Frontend/Js/data.js prioriza la respuesta de la API sobre el park.json',
      '-- empaquetado: sin aplicar esto, un despliegue con backend seguiría sirviendo los textos viejos.',
      '', '',
    ].join('\n');
    const destino = fromRoot(sqlPath);
    fs.writeFileSync(destino, cabecera + sql.join('\n\n') + '\n', 'utf8');
    console.log(`SQL escrito en ${rel(destino)} (${sql.length} UPDATE)`);
  }
}

// --- entrada ---------------------------------------------------------------------------------------
if (has('--extract')) extraer();
else if (has('--apply')) aplicar();
else process.exit(comprobar() ? 1 : 0);
