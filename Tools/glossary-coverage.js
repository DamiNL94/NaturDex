#!/usr/bin/env node
/*
 * glossary-coverage.js — vigila que el glosario divulgativo cubra el vocabulario de las fichas.
 *
 * Cada vez que entran especies nuevas (altas de GBIF/EIDOS para rellenar hábitats, redacción de
 * contenido en Tools/catalogo-nacional/data/contenido/*.json, fichas N1...) llega vocabulario
 * científico nuevo a las descripciones. Si ese vocabulario no está en la tabla `glosario`, el lector
 * se queda sin la definición: el resaltado de Frontend/Js/glossary.js solo enlaza lo que existe.
 *
 * Este script compara los DOS lados:
 *   · lo que dicen las fichas  -> descripciones, pistas de identificación y hábitat de cada especie
 *                                 (catálogo universal + park.json + invasoras), y las descripciones
 *                                 de los hábitats;
 *   · lo que sabe el glosario  -> Frontend/Data/glosario.json (la copia exportada de la BD).
 *
 * Lo que encuentra sin definir se lista para redactarlo. NO adivina definiciones: el texto
 * divulgativo lo escribe una persona. Detecta por dos vías complementarias:
 *   1. LEXICO: lista explícita de raíces del vocabulario de campo (botánica, zoología, suelos).
 *   2. SUFIJOS: terminaciones inequívocamente técnicas (-ófilo, -ícola, -áceas, -fito...), que
 *      cazan palabras que nadie había previsto.
 *
 * Uso:   node Tools/glossary-coverage.js            (o `npm run glossary:check`)
 *        node Tools/glossary-coverage.js --ejemplos (añade una cita de dónde aparece cada término)
 * Salida: SIEMPRE código 0. Es un aviso, no una barrera: nunca debe bloquear un commit por que
 *         falte una definición. Con --estricto devuelve 1 si queda algo sin cubrir.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const FRONTEND = path.join(ROOT, 'Frontend');
const GLOSARIO = path.join(FRONTEND, 'Data', 'glosario.json');
const UNIVERSAL = path.join(ROOT, 'Tools', 'catalogo-nacional', 'data', 'especies-universal.json');
const CONTENIDO = path.join(ROOT, 'Tools', 'catalogo-nacional', 'data', 'contenido');

const CON_EJEMPLOS = process.argv.includes('--ejemplos');
const ESTRICTO = process.argv.includes('--estricto');

// ------------------------------------------------------------------------------------------------
// LEXICO — raíces del vocabulario científico que aparece (o puede aparecer) en las fichas. Se
// comparan como "raíz + hasta 4 letras" para cubrir género, número y derivados (umbela/umbelas,
// tomentoso/tomentosas). Estar en esta lista NO significa que falte: solo que, si el texto lo usa,
// el glosario tiene que definirlo. Al redactar fichas nuevas conviene AMPLIAR esta lista con los
// tecnicismos que se hayan usado, aunque ya se hayan definido.
// ------------------------------------------------------------------------------------------------
const LEXICO = [
  // -- Morfología vegetal: hoja, tallo, porte
  'envés', 'haz', 'peciolo', 'pecíolo', 'estípul', 'foliol', 'raquis', 'lanceolad',
  'espatulad', 'lobulad', 'dentad', 'aserrad', 'ovad', 'obovad', 'acuminad', 'revolut',
  'coriác', 'esclerófil', 'perennifoli', 'caducifoli', 'marcescent', 'glauc', 'glabr', 'pubescent',
  'tomentos', 'afieltr', 'lanos', 'seríce', 'híspid', 'glandul', 'imbricad', 'acícul',
  'cladodi', 'filodi', 'zarcill', 'espinescent', 'rastrer', 'postrad', 'decumbent',
  'cespitos', 'rizomatos', 'rizoma', 'estol', 'bulb', 'tubércul', 'roseta', 'cojín', 'cojin',
  'leños', 'sufrútice', 'herbác', 'suculent', 'látex', 'agalla', 'papirác',
  // -- Morfología vegetal: flor, inflorescencia, fruto
  'umbela', 'umbelífer', 'capítul', 'cabezuel', 'inflorescenc', 'infrutescenc', 'panícul', 'racim',
  'corimb', 'espiga', 'espiguill', 'verticil', 'amento', 'espata', 'brácte', 'involucr', 'cáliz',
  'corola', 'pétal', 'sépal', 'estambr', 'estigm', 'espolón', 'labelo', 'lígul', 'flóscul',
  'quilla', 'sésil', 'pedicel', 'pedúncul', 'aqueni', 'vilano', 'sámar', 'cápsul', 'legumbre',
  'vaina', 'drupa', 'gálbul', 'cúpul', 'dehiscent', 'polinizad', 'polinizac', 'melífer',
  'nectari', 'bienal', 'terófit', 'caméfit', 'geófit', 'hemicriptófit', 'nanofanerófit',
  'clorofila', 'fotosínt', 'fronde', 'soro', 'espora', 'micorriz', 'parásit', 'hemiparásit', 'epífit',
  // -- Familias y grupos que se citan por su nombre de familia
  'gramíne', 'legumino', 'labiad', 'crucífer', 'quenopodiác', 'crasulác', 'ciperác', 'geraniác',
  'conífer', 'briófit', 'liquen', 'liana', 'lianoide',
  // -- Zoología de campo
  'obispill', 'supercili', 'timoner', 'rémig', 'cobertera', 'librea', 'ocel',
  'quillad', 'jaspead', 'mimétic', 'mimetism', 'aposemát', 'dimorfism', 'crepuscul',
  'gregari', 'reclam', 'posader', 'cernir', 'cerni', 'estival',
  'invernant', 'invernad', 'migrator', 'sedentari', 'residente', 'nidífug', 'nidícol', 'nidific',
  'pollada', 'limícol', 'estepari', 'rapaz', 'insectívor', 'granívor', 'frugívor', 'carroñer',
  'piscívor', 'ungulad', 'lagomorf', 'gallinác', 'quiróptero', 'ecolocaliz', 'hibernac', 'letargo',
  'autotom', 'letrin', 'egagrópil', 'ovípar', 'vivípar',
  // -- Ecología, suelos y relieve
  'halófil', 'halonitrófil', 'nitrófil', 'nitrific', 'gipsícol', 'psamófil', 'casmofít', 'rupícol',
  'calcícol', 'basófil', 'acidófil', 'silícol', 'xerófil', 'freatófit', 'freátic', 'termófil',
  'orófil', 'ruderal', 'antrópic', 'endemism', 'endémic', 'alócton', 'autócton', 'relicto',
  'invasor', 'pionera', 'ecoton', 'sotobosque', 'dosel', 'orla', 'clímax',
  'sustrato', 'marga', 'yeso', 'silíce', 'descarbonat', 'hipersalin', 'endorreic', 'karst', 'dolina',
  'canchal', 'talud', 'ribazo', 'cantil', 'cortado', 'umbrí', 'rambl', 'ramblizo',
  'erial', 'baldí', 'barbecho', 'arenal', 'saladar', 'estepa', 'albardinal', 'espartal',
  'atochar', 'tomillar', 'garriga', 'maqui', 'sabinar', 'azufaifar', 'jaral', 'tarayal', 'tarajal',
  'carrizal', 'fitosociológ', 'asociación fitosociológica', 'biogeográf',
  'termomediterrán', 'mesomediterrán', 'supramediterrán', 'semiárid', 'ombroclim',
  // -- Taxonomía y conservación
  'taxón', 'taxone', 'taxonómic', 'subespecie', 'híbrid', 'binomial', 'endemismo',
];

// Terminaciones inequívocamente técnicas: cazan vocabulario nuevo que no está en el LEXICO.
const SUFIJOS = [
  /ó[fF]ilo?s?$/u, /ófilas?$/u, /ícolas?$/u, /áceas?$/u, /áceos?$/u, /íferas?$/u, /fitos?$/u,
  /fitas?$/u, /morfos?$/u, /voros?$/u, /voras?$/u, /ípar[oa]s?$/u, /oides?$/u,
];

// Palabras que caen en los patrones de arriba pero no son tecnicismos que haya que definir:
// adjetivos de color en -áceo, nombres de género que aparecen dentro del nombre de un hábitat, y
// alguna errata heredada de la fuente oficial (invasoras.json viene del catálogo EEI tal cual).
const EXCEPCIONES = new Set([
  'agrícolas', 'agrícola', 'agícolas', 'grafitos', 'depósitos', 'compuestos', 'compuesto',
  'grisáceo', 'grisáceos', 'grisácea', 'grisáceas', 'violáceo', 'violáceos', 'violácea', 'violáceas',
  'rosáceo', 'rosáceos', 'lilácea', 'liláceas', 'oliváceo', 'oliváceos', 'olivácea', 'oliváceas',
  'azulgrisáceo', 'azulgrisácea', 'glaucium', 'margarita', 'margaritas',
]);

// ------------------------------------------------------------------------------------------------
// Glosario: todas las formas que el frontend sabe resaltar (término canónico + alias).
// ------------------------------------------------------------------------------------------------
function formasDelGlosario() {
  if (!fs.existsSync(GLOSARIO)) {
    console.error('No se encontró ' + path.relative(ROOT, GLOSARIO) + '. Ejecuta `npm run export:glossary`.');
    process.exit(2);
  }
  const terms = JSON.parse(fs.readFileSync(GLOSARIO, 'utf8'));
  const formas = new Set();
  terms.forEach(t => [t.term, ...(t.aliases || [])].forEach(f => f && formas.add(f.toLowerCase())));
  return { terms, formas };
}

// ------------------------------------------------------------------------------------------------
// Corpus: exactamente el texto que el frontend resalta (los bloques .detail-prose de las fichas).
// ------------------------------------------------------------------------------------------------
function leerJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }

function corpus() {
  const fichas = [];
  const add = (origen, ...trozos) => {
    const texto = trozos.filter(Boolean).join(' | ').trim();
    if (texto) fichas.push({ origen, texto });
  };

  // 1) Catálogo universal de especies (lo que la especie ES: descripción, pistas, hábitat).
  if (fs.existsSync(UNIVERSAL)) {
    const universal = leerJson(UNIVERSAL);
    Object.keys(universal).forEach(sci => {
      const s = universal[sci];
      add('universal/' + sci, s.description, (s.tips || []).join(' | '), s.habitat);
    });
  }

  // 2) Contenido redactado a mano (fuente de verdad del texto divulgativo).
  if (fs.existsSync(CONTENIDO)) {
    fs.readdirSync(CONTENIDO).filter(f => f.endsWith('.json')).forEach(f => {
      const data = leerJson(path.join(CONTENIDO, f));
      Object.keys(data).forEach(k => {
        const s = data[k] || {};
        add('contenido/' + f + '#' + k, s.description, (s.tips || []).join(' | '), s.habitat);
      });
    });
  }

  // 3) Datos empaquetados de cada parque: especies y hábitats.
  const parksDir = path.join(FRONTEND, 'Data', 'parks');
  if (fs.existsSync(parksDir)) {
    fs.readdirSync(parksDir).forEach(region => {
      const regionDir = path.join(parksDir, region);
      if (!fs.statSync(regionDir).isDirectory()) return;
      fs.readdirSync(regionDir).forEach(slug => {
        const file = path.join(regionDir, slug, 'park.json');
        if (!fs.existsSync(file)) return;
        const data = leerJson(file);
        (data.species || []).forEach(s =>
          add(slug + '/' + (s.scientificName || s.commonName), s.description, (s.tips || []).join(' | '), s.habitat));
        (data.habitats || []).forEach(h => add(slug + '/hábitat ' + (h.code || h.name), h.description));
      });
    });
  }

  // 4) Especies exóticas invasoras (pestaña propia, también con .detail-prose).
  const invasoras = path.join(FRONTEND, 'Data', 'invasoras.json');
  if (fs.existsSync(invasoras)) {
    const data = leerJson(invasoras);
    (Array.isArray(data) ? data : data.invasoras || []).forEach(i =>
      add('invasoras/' + (i.scientificName || i.commonName), i.description, i.origin, i.habitat));
  }

  return fichas;
}

// ------------------------------------------------------------------------------------------------
// Detección
// ------------------------------------------------------------------------------------------------
function esCandidata(palabra) {
  if (EXCEPCIONES.has(palabra)) return false;
  return SUFIJOS.some(re => re.test(palabra));
}

function analizar() {
  const { terms, formas } = formasDelGlosario();
  const fichas = corpus();
  const pendientes = new Map(); // palabra -> { veces, ejemplo, via }

  const anota = (palabra, ficha, via) => {
    if (formas.has(palabra) || EXCEPCIONES.has(palabra)) return;
    const prev = pendientes.get(palabra);
    if (prev) { prev.veces++; return; }
    pendientes.set(palabra, { veces: 1, ejemplo: ficha.origen, via });
  };

  const reLexico = LEXICO.map(raiz => ({
    raiz,
    re: new RegExp('(?<![\\p{L}\\p{N}])' + raiz.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[\\p{L}]{0,4}(?![\\p{L}\\p{N}])', 'giu'),
  }));

  fichas.forEach(ficha => {
    const texto = ficha.texto;
    // 1) Raíces conocidas del vocabulario de campo.
    reLexico.forEach(({ re }) => {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(texto))) anota(m[0].toLowerCase(), ficha, 'léxico');
    });
    // 2) Terminaciones técnicas no previstas.
    (texto.toLowerCase().match(/[\p{L}]{5,}/gu) || []).forEach(p => {
      if (esCandidata(p)) anota(p, ficha, 'sufijo');
    });
  });

  return { terms, fichas, pendientes };
}

// ------------------------------------------------------------------------------------------------
// Salida
// ------------------------------------------------------------------------------------------------
const { terms, fichas, pendientes } = analizar();

console.log('\x1b[1mNaturDex · cobertura del glosario divulgativo\x1b[0m');
console.log('  glosario: ' + terms.length + ' términos · fichas analizadas: ' + fichas.length);

if (!pendientes.size) {
  console.log('  \x1b[32m✓\x1b[0m Todo el vocabulario técnico de las fichas está definido.');
  process.exit(0);
}

const orden = [...pendientes.entries()].sort((a, b) => b[1].veces - a[1].veces || a[0].localeCompare(b[0], 'es'));
console.log('\n  \x1b[33m⚠ ' + orden.length + ' término(s) sin definir\x1b[0m (aparecen en las fichas y no están en el glosario):');
orden.forEach(([palabra, info]) => {
  const cita = CON_EJEMPLOS ? '   ← ' + info.ejemplo : '';
  console.log('    · ' + palabra + '  (' + info.veces + ' ficha' + (info.veces === 1 ? '' : 's') + ', ' + info.via + ')' + cita);
});

console.log('\n  Para cubrirlos: añade las filas al bloque `glosario` de Database/seed.sql, aplícalas a la');
console.log('  BD viva y regenera la copia offline con `npm run export:glossary`.');
console.log('  Guía completa: Docs/glosario-divulgativo.md');

process.exit(ESTRICTO ? 1 : 0);
