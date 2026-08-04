#!/usr/bin/env node
/*
 * invasoras-contenido.js — texto de la ficha de cada especie exótica invasora, desde EIDOS.
 *
 * Por qué existe
 * --------------
 * El contenido de las 25 invasoras venía de un primer volcado de EIDOS que las dejó a medias:
 *
 *   - cortadas a mitad de palabra («…región de los…», «…Hábitat en su área de…»), porque se
 *     recortaba el valor a una longitud fija;
 *   - con el encabezado del formulario dentro del texto («Hábitat en su área de distribución
 *     natural - No hay datos Hábitat en su área de introducción - …»), que ocupa media ficha para
 *     no decir nada;
 *   - con la basura del documento de origen («opuntia_maxima.doc Página 3 de 5» en mitad de una
 *     frase), porque se eligió una versión del atributo que no es la preferente;
 *   - y sin lo único que de verdad justifica la pestaña: POR QUÉ es un problema esta especie y CÓMO
 *     llegó aquí. Eso está en EIDOS (atributos «Invasividad», «Ruta» y «Vector») y no se usaba.
 *
 * Este script vuelve a leer EIDOS, se queda con el valor preferente de cada atributo, lo limpia y
 * reescribe la ficha entera: descripción, origen, hábitat, impacto y vía de entrada.
 *
 * Fidelidad a la fuente
 * ---------------------
 * El texto es el de EIDOS: aquí solo se limpia (encabezados de formulario, restos de maquetación,
 * apartados vacíos del tipo «No hay datos», frases cortadas a medias). NO se reescribe ni se
 * inventa contenido. Las únicas excepciones son las de `CORRECCIONES`, una por una y con su motivo
 * escrito: fichas donde el propio EIDOS trae texto de OTRA especie, que no se puede publicar tal
 * cual sin engañar al visitante.
 *
 * Uso
 * ---
 *   node Tools/catalogo-nacional/invasoras-contenido.js --preview <fichero.md>   (revisar antes)
 *   node Tools/catalogo-nacional/invasoras-contenido.js --write --sql Database/invasoras-contenido.sql
 *
 * Como en las fotos, `--sql` no es opcional: la BD es la fuente de verdad de las invasoras.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { getJson } = require('../lib/http');
const { arg, flag } = require('../lib/cli');
const { ROOT, DATA } = require('../lib/io');
const eidos = require('../lib/eidos');

const JSON_PATH = path.join(DATA, 'invasoras.json');
const FUENTE = 'EIDOS (IEPNB) · Catálogo Español de Especies Exóticas Invasoras (RD 630/2013)';

const OPT = { write: flag('write'), sql: arg('sql', null), preview: arg('preview', null) };

// --- EIDOS ---------------------------------------------------------------------------------------
// El cliente compartido acumula la respuesta en Buffer y la decodifica una sola vez al final. Es
// lo que evita el fallo de este script en su primera versión: concatenar los Buffer con `+=` los
// convierte a texto uno a uno y parte por la mitad los caracteres multibyte que caen en el borde
// de un trozo — así se colaron los «conservaci<?>n» y «germinaci<?>n» del primer volcado.
const get = (pathname) => getJson(eidos.HOST, pathname, { agent: 'invasoras-contenido' });

// --- Limpieza del texto de EIDOS -------------------------------------------------------------------
// Los valores llegan tal cual se teclearon en las Memorias Técnicas y Fichas Descriptivas del RD
// 630/2013: con saltos de línea, dobles espacios, encabezados del propio formulario y, en algunos
// casos, el pie de página del .doc del que se copiaron.

// Restos de maquetación del documento de origen.
const BASURA = [
  /\b[\wáéíóúñ_-]+\.docx?\s*P[áa]gina\s*\d+\s*de\s*\d+\s*/gi,   // "opuntia_maxima.doc Página 3 de 5"
  /\bP[áa]gina\s*\d+\s*de\s*\d+\s*/gi,
];

// Palabras que el copiado desde el PDF/DOC original partió o pegó. Son erratas de transcripción,
// no contenido: se arreglan tal cual, sin tocar lo que dice la frase.
const ERRATAS = [
  [/\bnidifi\s+caci[óo]n\b/gi, 'nidificación'],
  [/\bdecarreteras\b/gi, 'de carreteras'],
  [/\bmesof[íi]{2}tico\b/gi, 'mesofítico'],
  [/\bor[íi]gen antr[óo]pico\b/gi, 'origen antrópico'],
];

// Apartados que en el formulario se rellenaron con un "no consta". Publicarlos es ruido: la ficha
// dice lo que se sabe y calla lo que no.
const VACIO = /^(no\s+(hay|se\s+han|se\s+dispone|existen|consta)[^.]*\.?|sin\s+datos\.?|desconocid[oa]s?\.?|-+)$/i;

function normaliza(texto) {
  let t = String(texto || '').replace(/\s+/g, ' ').trim();
  for (const re of BASURA) t = t.replace(re, ' ');
  for (const [re, bien] of ERRATAS) t = t.replace(re, bien);
  return t.replace(/\s+/g, ' ').replace(/\s+([.,;:])/g, '$1').replace(/^[-–—\s]+/, '').trim();
}

// Une dos valores de EIDOS (p. ej. Ruta + Vector) como dos frases, no como una pegada a la otra:
// «…para la formación de setos Dispersión de las semillas…» se leía como una errata.
function unirFrases(partes) {
  return partes
    .filter(t => t && !VACIO.test(t))
    .map(t => (/[.!?…]$/.test(t) ? t : t + '.'))
    .join(' ')
    .trim();
}

// EIDOS guarda muchos valores cortados a mitad de palabra («…100-10.000 parejas reproducto»). Se
// recorta hasta la última frase completa, pero solo si con eso no se pierde la mitad del texto.
function frasesCompletas(t, maxLen) {
  let out = t;
  if (maxLen && out.length > maxLen) {
    const corte = out.slice(0, maxLen);
    const fin = Math.max(corte.lastIndexOf('. '), corte.lastIndexOf('.\n'));
    out = fin > maxLen * 0.5 ? corte.slice(0, fin + 1) : corte.trim() + '…';
  }
  if (!/[.!?…]$/.test(out)) {
    const fin = out.lastIndexOf('.');
    if (fin > out.length * 0.6) out = out.slice(0, fin + 1);
  }
  // Un final del tipo «…de las subespecies asiáticas, P. k.» tampoco es una frase: es una
  // abreviatura partida. Se retrocede hasta la anterior.
  while (/(^|\s)\p{L}{1,2}\.$/u.test(out)) {
    const fin = out.slice(0, -1).lastIndexOf('.');
    if (fin <= 0) break;
    out = out.slice(0, fin + 1);
  }
  return out.trim();
}

// «Distribución» empieza por el área NATIVA y sigue, tras un guion, con el detalle de subespecies y
// del área ya invadida. En la ficha lo que interesa es lo primero: de dónde viene esta especie.
function origenUtil(bruto) {
  const t = normaliza(bruto);
  const guion = t.search(/\s[-–—]\s*[A-ZÁÉÍÓÚ]/);
  return frasesCompletas(guion > 40 ? t.slice(0, guion).trim() : t, 420);
}

// «Sobre el hábitat: … Sobre las especies: … Sobre la salud humana: no se han descrito.» → se
// mantienen los apartados con contenido y se tiran los que dicen que no hay nada.
function quitaApartadosVacios(t) {
  const partes = t.split(/(?=\b(?:Sobre|Hábitat en su área|Propuestas|Desarrolladas)\b)/);
  if (partes.length < 2) return t;
  return partes
    .map(p => p.trim())
    .filter(p => {
      const cuerpo = p.replace(/^[^:]{0,60}:\s*/, '').trim();
      return cuerpo && !VACIO.test(cuerpo);
    })
    .join(' ')
    .trim();
}

// El atributo «Hábitat» viene partido en dos bloques con el encabezado del formulario dentro del
// texto. Al visitante le sirve el de la zona invadida (dónde se lo va a encontrar aquí); el del área
// nativa se usa solo si el otro está vacío. En ningún caso se publica el encabezado.
function habitatUtil(bruto) {
  const t = normaliza(bruto);
  const marca = /H[áa]bitat en su [áa]rea de (distribuci[óo]n natural|introducci[óo]n)\s*[-–—:]?\s*/gi;
  const trozos = [];
  let ultimo = null, pos = 0, m;
  while ((m = marca.exec(t)) !== null) {
    if (ultimo !== null) trozos.push({ tipo: ultimo, texto: t.slice(pos, m.index).trim() });
    ultimo = /introducci/i.test(m[1]) ? 'introducida' : 'nativa';
    pos = m.index + m[0].length;
  }
  if (ultimo !== null) trozos.push({ tipo: ultimo, texto: t.slice(pos).trim() });
  if (!trozos.length) return t;                       // no traía encabezados: se usa entero

  const util = trozos.filter(x => x.texto && !VACIO.test(x.texto));
  const introducida = util.filter(x => x.tipo === 'introducida').map(x => x.texto).join(' ');
  const nativa = util.filter(x => x.tipo === 'nativa').map(x => x.texto).join(' ');
  // Algunas fichas resuelven el bloque de la zona invadida con una remisión al otro («El mismo que
  // en las zonas de distribución natural»), que sola no dice nada: entonces vale el del área nativa.
  const remite = /^(el mismo|los mismos|[íi]dem|igual)\b/i.test(introducida);
  return ((remite ? nativa : introducida) || nativa || '').trim();
}

// --- Correcciones documentadas ---------------------------------------------------------------------
// EIDOS es la fuente, pero tiene fichas con el texto de otra especie pegado dentro. Publicar eso
// sería peor que no publicar nada, así que aquí se anula el campo afectado (`null` = no se muestra)
// o se sustituye por el dato del propio catálogo oficial. Cada entrada lleva su porqué.
const CORRECCIONES = {
  'Estrilda astrild': {
    // El atributo «Distribución» de este taxón en EIDOS describe la población reproductora ibérica
    // de un ave esteparia (linderos, barbechos, insecticidas, citas de Donázar y Tella): es texto
    // de otra ficha. Lo que sí es del pico de coral, y consta en el propio Catálogo Español de EEI,
    // es su origen: África subsahariana.
    origin: 'Originaria de África subsahariana.',
    motivo: 'EIDOS trae en «Distribución» texto de otra especie (un ave esteparia ibérica).',
  },
  // (el impacto se anula solo, porque su único candidato era «Presiones y amenazas», que no se usa)
  'Oxalis pes-caprae': {
    // «Se desarrolla en aguas más o menos estancadas y de movimiento lento» es de una planta
    // acuática; la vinagrera es una hierba de cultivos, bordes de camino y solares. La propia
    // descripción de EIDOS la sitúa en tierra firme.
    habitat: null,
    motivo: 'EIDOS describe en «Hábitat» una planta acuática, que no es la vinagrera.',
  },
};

// --- Selección del valor de cada atributo ------------------------------------------------------------
// Un mismo atributo puede venir de varias fuentes (Memorias Técnicas, Fichas Descriptivas…). El
// marcado como `prioritario` es el que EIDOS considera preferente y es, sistemáticamente, el mejor
// redactado: los no preferentes son los que arrastran el pie de página del .doc y las frases sueltas.
function mejorValor(filas, atributo) {
  const candidatas = filas.filter(f => f.atributo === atributo && f.valor && String(f.valor).trim());
  if (!candidatas.length) return null;
  const prio = candidatas.filter(f => f.prioritario);
  const lista = prio.length ? prio : candidatas;
  return lista.sort((a, b) => String(b.valor).length - String(a.valor).length)[0].valor;
}

const comoPhp = data => JSON.stringify(data, null, 4).replace(/\//g, '\\/') + '\n';

// Los campos nuevos se escriben en el mismo orden en que los emite buildInvasorasPayload(): así,
// reexportar desde la BD (`npm run export:invasoras`) no genera un diff de ordenación.
const ORDEN = ['scientificName', 'commonName', 'group', 'kingdom', 'ccaa', 'description', 'origin',
  'habitat', 'impact', 'pathway', 'catalogo', 'eidosTaxonId', 'gbifSpeciesKey', 'gbifOccurrences',
  'image', 'imageAttribution', 'source'];
const enOrden = ficha => {
  const out = {};
  for (const k of ORDEN) if (k in ficha) out[k] = ficha[k];
  for (const k of Object.keys(ficha)) if (!(k in out)) out[k] = ficha[k];
  return out;
};
const { sqlStrOrNull: sqlStr } = require('../lib/sql');

(async () => {
  const invasoras = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
  const porTaxon = new Map();
  for (const inv of invasoras) {
    if (!porTaxon.has(inv.scientificName)) porTaxon.set(inv.scientificName, []);
    porTaxon.get(inv.scientificName).push(inv);
  }

  const preview = ['# Contenido de las invasoras (EIDOS)', ''];
  const cambios = [];
  let sinImpacto = 0, sinVia = 0, sinHabitat = 0;

  for (const [scientificName, fichas] of porTaxon) {
    const ref = fichas[0];
    const filas = await get('/api/especie/v_atributos_pliniancore?idtaxon=eq.' + ref.eidosTaxonId
      + '&select=atributo,valor,prioritario,fuente');

    const bruto = a => mejorValor(filas, a);
    const corr = CORRECCIONES[scientificName] || {};

    const description = frasesCompletas(normaliza(bruto('Descripción de la especie')), 1400);
    const origin = 'origin' in corr ? corr.origin : origenUtil(bruto('Distribución'));
    const habitat = 'habitat' in corr ? corr.habitat
      : frasesCompletas(habitatUtil(bruto('Hábitat')), 700) || null;
    // «Invasividad» es el daño que causa la especie. Cuando falta, sirve «Relevancia para el ser
    // humano y el medioambiente», que en esas fichas recoge los perjuicios documentados. Lo que NO
    // se usa nunca es «Presiones y amenazas»: eso son las amenazas que sufre la especie, justo lo
    // contrario, y colocarlo aquí dejaba a la invasora como víctima.
    const impact = frasesCompletas(quitaApartadosVacios(normaliza(
      bruto('Invasividad') || bruto('Relevancia para el ser humano y el medioambiente'))), 900) || null;
    // Ruta = cómo entró en España; Vector = cómo se mueve una vez aquí. Juntas responden a la única
    // pregunta accionable de la pestaña: qué NO hay que hacer con esta especie.
    const pathway = frasesCompletas(unirFrases([normaliza(bruto('Ruta')), normaliza(bruto('Vector'))]), 500) || null;

    if (!impact) sinImpacto++;
    if (!pathway) sinVia++;
    if (!habitat) sinHabitat++;

    fichas.forEach(f => {
      f.description = description || null;
      f.origin = origin || null;
      f.habitat = habitat;
      f.impact = impact;
      f.pathway = pathway;
      f.source = FUENTE;
    });
    cambios.push({ scientificName, description, origin, habitat, impact, pathway });

    preview.push(`## ${ref.commonName || scientificName} — _${scientificName}_`, '');
    if (corr.motivo) preview.push(`> ⚠ Corrección aplicada: ${corr.motivo}`, '');
    preview.push(`**Descripción** · ${description || '—'}`, '');
    preview.push(`**Origen** · ${origin || '—'}`, '');
    preview.push(`**Hábitat** · ${habitat || '—'}`, '');
    preview.push(`**Impacto** · ${impact || '—'}`, '');
    preview.push(`**Vía de entrada** · ${pathway || '—'}`, '');
    console.log(`  ✓ ${ref.commonName || scientificName}`
      + ` — desc ${description.length} · origen ${(origin || '').length}`
      + ` · hábitat ${(habitat || '—').length} · impacto ${(impact || '—').length} · vía ${(pathway || '—').length}`);
  }

  console.log(`\n${cambios.length} fichas · sin impacto ${sinImpacto} · sin vía ${sinVia} · sin hábitat ${sinHabitat}`);

  if (OPT.preview) {
    const destino = path.isAbsolute(OPT.preview) ? OPT.preview : path.join(ROOT, OPT.preview);
    fs.writeFileSync(destino, preview.join('\n') + '\n', 'utf8');
    console.log('Vista previa en ' + OPT.preview);
  }

  if (OPT.write) {
    fs.writeFileSync(JSON_PATH, comoPhp(invasoras.map(enOrden)), 'utf8');
    console.log(`→ escrito ${path.relative(ROOT, JSON_PATH)}`);
  } else {
    console.log('(simulación: usa --write para guardar)');
  }

  if (OPT.sql && cambios.length) {
    const cabecera = [
      '-- invasoras-contenido.sql — texto de la ficha de cada especie exótica invasora.',
      '-- GENERADO por Tools/catalogo-nacional/invasoras-contenido.js --sql. No editar a mano.',
      '-- Requiere las columnas especies_invasoras.impact y .pathway (Database/migrations.sql).',
      '-- Fuente del texto: ' + FUENTE + '.',
      '', '',
    ].join('\n');
    const sentencias = cambios.map(c =>
      `UPDATE especies_invasoras SET\n` +
      `  description = ${sqlStr(c.description)},\n` +
      `  origin = ${sqlStr(c.origin)},\n` +
      `  habitat = ${sqlStr(c.habitat)},\n` +
      `  impact = ${sqlStr(c.impact)},\n` +
      `  pathway = ${sqlStr(c.pathway)},\n` +
      `  source = ${sqlStr(FUENTE)}\n` +
      `WHERE scientific_name = ${sqlStr(c.scientificName)};`
    );
    const destino = path.isAbsolute(OPT.sql) ? OPT.sql : path.join(ROOT, OPT.sql);
    fs.writeFileSync(destino, cabecera + sentencias.join('\n\n') + '\n', 'utf8');
    console.log(`SQL escrito en ${path.relative(ROOT, destino)} (${sentencias.length} UPDATE)`);
  }
})().catch(e => { console.error('Error: ' + e.message); process.exit(1); });
