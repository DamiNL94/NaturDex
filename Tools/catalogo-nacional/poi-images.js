#!/usr/bin/env node
/*
 * poi-images.js — foto y atribución para los puntos de interés de un espacio.
 *
 * Por qué NO vale wikimedia-images.js
 * -----------------------------------
 * Toda la cadena de resolución de fotos del catálogo cuelga de un ancla que un POI no tiene: el
 * nombre científico. Wikidata responde a `haswbstatement:P225="Ziziphus lotus"` con la foto del
 * taxón correcto, y de ahí para abajo todo el criterio de descarte (otra especie del género, mapas
 * de área, pliegos de herbario) se apoya en el binomio. Un punto de interés no es un taxón: no hay
 * declaración que consultar y su nombre es un topónimo, que es justo el tipo de cadena que se repite
 * por toda España. "Ermita de Santa Leocadia" son al menos tres ermitas en tres provincias, y
 * "Playa de las Higuericas" está en Pilar de la Horadada, a 200 km de la Higuerica de Águilas.
 *
 * Así que aquí el ancla es otra: la CATEGORÍA DE COMMONS DEL PROPIO ESPACIO. Un archivo que está
 * dentro de `Category:Cuatro Calas Protected Landscape` está, por construcción, en Cuatro Calas.
 * Eso resuelve la mitad del problema —dónde— y deja la otra mitad, qué elemento concreto retrata,
 * al nombre del archivo.
 *
 * Cadena de resolución
 * --------------------
 *   1. Categoría de Commons del espacio (y sus subcategorías, un nivel): archivo cuyo nombre
 *      mencione el POI. Es la vía buena: el sitio lo garantiza la categoría y el elemento, el nombre.
 *   2. Buscador de archivos de Commons con el nombre del POI Y el del espacio o su municipio. Se
 *      marca `needsReview` siempre: el buscador no garantiza nada.
 *
 * Alias de topónimo (data/poi-alias.json)
 * ---------------------------------------
 * El nombre con el que un POI está dado de alta y el que usa Commons no tienen por qué coincidir, y
 * cuando no coinciden este script no encuentra NADA aunque la foto esté delante. El caso que lo
 * motiva es real y está documentado en Docs/rollout/n3-cuatro-calas-sierra-espuna.md §5: el POI se
 * llama «Playa de los Cocedores» (grafía de OSM) y los diez archivos de Commons dicen «Cala de los
 * CocedEros» (grafía del IELIG). Ni «playa» ni «cocedores» aparecen en el nombre del archivo, así
 * que `mencionaSitio` decía que no y el mejor POI documentado de Cuatro Calas se quedaba sin foto.
 *
 * Los alias SOLO se aplican en la vía 1, nunca en el buscador. No es una limitación, es la razón de
 * que sean seguros: dentro de la categoría del espacio el sitio ya está garantizado, así que un
 * topónimo corto como «Carolina» solo puede traer algo de este espacio. En el buscador ese mismo
 * alias traería la Carolina de Jaén, y por eso allí se sigue exigiendo el nombre completo.
 *
 * Dos puertas que este script no abre nunca solo
 * ----------------------------------------------
 *   · **Licencia.** Solo entran CC0, dominio público, CC BY y CC BY-SA. Lo demás —NC, ND, licencia
 *     sin especificar— se descarta y se anota. Es la regla del §4.5 del prompt de rollout: sin foto
 *     es mejor que con foto de licencia dudosa, y aquí no hay margen porque la app se descarga
 *     entera para uso sin conexión.
 *   · **Coincidencia dudosa.** Un candidato `needsReview` sale en el informe pero NO se escribe.
 *     Que una foto sea del sitio correcto no lo puede decidir una heurística sobre un topónimo:
 *     tiene que verlo alguien. `--force` levanta esta puerta; la de la licencia no la levanta nada.
 *
 * Uso
 * ---
 *   node Tools/catalogo-nacional/poi-images.js --park cuatro-calas --list
 *   node Tools/catalogo-nacional/poi-images.js --park cuatro-calas --categoria "Cuatro Calas Protected Landscape" --write
 *   node Tools/catalogo-nacional/poi-images.js --write --sql Database/poi-imagenes.sql --report Docs/fotos-poi.md
 *
 * Opciones: --park <slug> (por defecto, todos), --categoria <Categoría de Commons del espacio>,
 *           --municipio <nombre> (afina la búsqueda del paso 2), --all (revisa también los POIs que
 *           ya tienen foto), --force (acepta candidatos `needsReview`), --width <px>, --dry-run.
 *
 * `--sql` hace falta porque Frontend/Js/data.js da prioridad a la respuesta de la API sobre el
 * park.json empaquetado: sin cargar la BD, un despliegue con backend seguiría sirviendo lo viejo.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const { api, loads, usable, metadatos, atribucion, filePathUrl, commonsFileFromUrl } = require('../lib/wikimedia');
const { sqlStr } = require('../lib/sql');
const { arg, flag, num } = require('../lib/cli');
const { parkFiles, readJson, readJsonIf, fromRoot, rel } = require('../lib/io');

const COMMONS = 'https://commons.wikimedia.org/w/api.php';
const ALIAS_FILE = path.join(__dirname, 'data', 'poi-alias.json');

const OPT = {
  park: arg('park', null),
  categoria: arg('categoria', null),
  municipio: arg('municipio', null),
  list: flag('list'),
  all: flag('all'),
  write: flag('write'),
  force: flag('force'),
  sql: arg('sql', null),
  report: arg('report', null),
  width: num('width', 1280),
  dryRun: flag('dry-run'),
};

const sentencias = [];

const red = s => '\x1b[31m' + s + '\x1b[0m';
const green = s => '\x1b[32m' + s + '\x1b[0m';
const yellow = s => '\x1b[33m' + s + '\x1b[0m';
const dim = s => '\x1b[2m' + s + '\x1b[0m';

// --- Licencias ---------------------------------------------------------------------------------
// Lista blanca, no lista negra: una licencia que no se reconoce se rechaza. Es lo contrario de lo
// que hace el pipeline de especies —que se limita a anotar lo que diga Commons— y es deliberado:
// allí la foto ilustra un taxón y se puede sustituir; aquí acompaña a un sitio concreto y se
// empaqueta en la descarga sin conexión del parque.
const LICENCIA_LIBRE = /^(cc0|cc[ -]?by([ -]sa)?([ -]\d(\.\d)?)*( [a-z]{2})?|public domain|dominio p[úu]blico|pd([ -].*)?|no restrictions)$/i;

function licenciaLibre(licencia) {
  const plano = String(licencia || '').trim().toLowerCase().replace(/\s+/g, ' ');
  if (!plano || plano === 'licencia sin especificar') return false;
  // Un "CC BY-NC-SA 4.0" empieza por "cc by" y casaría con un patrón laxo: se corta antes.
  if (/\bnc\b|non[- ]commercial|no comercial|\bnd\b|no ?deriv|fair use|uso legítimo/i.test(plano)) return false;
  return LICENCIA_LIBRE.test(plano);
}

// --- Coincidencia de topónimo ---------------------------------------------------------------------
// El equivalente de `mencionaBinomio` para un sitio. Se exige que TODAS las palabras con peso del
// nombre del POI aparezcan en el nombre del archivo: los artículos y preposiciones se caen porque
// Commons los escribe de cualquier manera ("Playa Cocedores", "Playa de los Cocedores").
const VACIAS = new Set(['de', 'del', 'la', 'las', 'el', 'los', 'y', 'e', 'a', 'al', 'en', 'the', 'of']);

const plano = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[_\-().,'"]/g, ' ').replace(/\s+/g, ' ').trim();

function palabrasClave(nombre) {
  return plano(nombre).split(' ').filter(w => w.length > 2 && !VACIAS.has(w));
}

// Palabra completa, nunca subcadena. Parece un detalle y es el fallo que este script existe para no
// cometer: «Playa de las Higuericas» contiene «higuerica» como subcadena, y es una playa de Pilar de
// la Horadada, a 200 km de la Higuerica de Águilas. Un singular no vale por su plural.
function mencionaSitio(fileName, nombrePoi) {
  const tokens = new Set(plano(fileName).split(' '));
  const claves = palabrasClave(nombrePoi);
  if (!claves.length) return false;
  return claves.every(w => tokens.has(w));
}

/** Igual, pero dando por bueno cualquiera de los nombres (el del POI o uno de sus alias). */
const mencionaAlguno = (fileName, nombres) => nombres.some(n => mencionaSitio(fileName, n));

// --- Alias de topónimo -----------------------------------------------------------------------------
// data/poi-alias.json: { "<slug del espacio>": { "<id del POI>": ["otro nombre", …] } }
// Un fichero ausente o una entrada que falte no son un error: significa que ese POI se busca solo
// por su nombre, que es el caso normal.
const ALIAS = readJsonIf(ALIAS_FILE, {});

function aliasDe(slug, poiId) {
  const delEspacio = ALIAS[slug];
  if (!delEspacio) return [];
  const lista = delEspacio[poiId];
  return Array.isArray(lista) ? lista.filter(s => typeof s === 'string' && s.trim()) : [];
}

// --- Commons ---------------------------------------------------------------------------------------
async function miembrosDeCategoria(categoria, tipo) {
  const j = await api(`${COMMONS}?action=query&list=categorymembers&cmtitle=${encodeURIComponent('Category:' + categoria)}` +
    `&cmtype=${tipo}&cmlimit=500&format=json&origin=*`);
  return (j?.query?.categorymembers || []).map(m => String(m.title || ''));
}

/**
 * Todos los archivos de la categoría del espacio y de sus subcategorías directas.
 *
 * Un nivel de profundidad y no más: en Commons las categorías de un espacio protegido cuelgan de
 * las del municipio y de las de la comunidad, y bajar dos niveles acaba trayendo la playa urbana
 * del pueblo de al lado. Un nivel sí hace falta —`Category:Cuatro Calas Protected Landscape`
 * agrupa por cala en subcategorías como `Category:Cala de los Cocedores`— y sigue estando dentro
 * del espacio.
 */
async function archivosDelEspacio(categoria) {
  const ficheros = new Set();
  for (const t of await miembrosDeCategoria(categoria, 'file')) ficheros.add(t.replace(/^File:/, ''));
  for (const sub of await miembrosDeCategoria(categoria, 'subcat')) {
    for (const t of await miembrosDeCategoria(sub.replace(/^Category:/, ''), 'file')) ficheros.add(t.replace(/^File:/, ''));
  }
  return [...ficheros].filter(usable);
}

async function buscaEnCommons(nombrePoi, contexto) {
  const consulta = [nombrePoi, contexto].filter(Boolean).join(' ');
  const j = await api(`${COMMONS}?action=query&list=search&srsearch=${encodeURIComponent(consulta)}` +
    `&srnamespace=6&srlimit=15&format=json&origin=*`);
  const out = [];
  for (const hit of (j?.query?.search || [])) {
    const name = String(hit.title || '').replace(/^File:/, '');
    if (!usable(name) || !mencionaSitio(name, nombrePoi)) continue;
    out.push(name);
  }
  return out;
}

// Un POI no tiene `imageAttribution`: a diferencia de una especie o un hábitat, el crédito de su
// foto va DENTRO de `source`, detrás de la fuente del hecho y separado por punto y coma. Es el
// formato del piloto —«Anexo I del proyecto de PORN…; Wikimedia Commons (foto: J.Alberto, CC BY-SA
// 4.0)»— y lo pide el §4.5: `source` cita la fuente del hecho y, aparte, la de la foto y su licencia.
function conCredito(source, meta) {
  const credito = `Wikimedia Commons (foto: ${meta.autor}, ${meta.licencia})`;
  const previo = String(source || '').trim();
  if (!previo) return credito;
  // Idempotencia: una segunda pasada no debe encadenar créditos. Si ya hay uno de Commons, se
  // sustituye entero en vez de añadir otro.
  if (/wikimedia commons/i.test(previo)) return previo.replace(/;\s*Wikimedia Commons[^;]*$/i, '') .trim().replace(/;$/, '') + '; ' + credito;
  return previo.replace(/[;.]$/, '') + '; ' + credito;
}

/** Primera candidata que carga de verdad y tiene licencia libre. Devuelve también las rechazadas. */
async function primeraValida(ficheros, via, needsReview) {
  const rechazos = [];
  for (const file of ficheros) {
    const url = filePathUrl(file, OPT.width);
    if (!(await loads(url))) { rechazos.push({ file, motivo: 'la URL no devuelve imagen' }); continue; }
    const meta = await metadatos(file);
    if (!meta) { rechazos.push({ file, motivo: 'sin metadatos en Commons' }); continue; }
    if (!licenciaLibre(meta.licencia)) { rechazos.push({ file, motivo: 'licencia no libre: ' + meta.licencia }); continue; }
    return { elegida: { url, file, via, needsReview, attribution: atribucion(meta), ...meta }, rechazos };
  }
  return { elegida: null, rechazos };
}

async function resuelvePoi(poi, { archivos, contexto, alias }) {
  // 1 · dentro de la categoría del espacio, por nombre o por cualquiera de sus alias. Los alias solo
  //     valen aquí: la categoría ya garantiza el sitio (ver cabecera).
  const nombres = [poi.name, ...alias];
  const enCategoria = archivos.filter(f => mencionaAlguno(f, nombres));
  if (enCategoria.length) {
    const { elegida, rechazos } = await primeraValida(enCategoria, 'Categoría de Commons del espacio', false);
    if (elegida) {
      // Que la coincidencia haya salido por alias y no por el nombre del POI se dice en el informe:
      // es lo que hay que mirar si alguna vez una foto acaba en el POI equivocado.
      if (!mencionaSitio(elegida.file, poi.name)) elegida.via += ' (por alias)';
      return { elegida, rechazos };
    }
    if (rechazos.length) return { elegida: null, rechazos };
  }
  // 2 · buscador, con el espacio o el municipio como contexto. Siempre a revisar.
  const encontrados = await buscaEnCommons(poi.name, contexto);
  const { elegida, rechazos } = await primeraValida(encontrados, 'Búsqueda en Commons', true);
  return { elegida, rechazos };
}

// --- Recorrido -----------------------------------------------------------------------------------------
async function procesaParque(entry, informe) {
  const data = readJson(entry.file);
  const pois = data.pointsOfInterest || [];
  if (!pois.length) return 0;

  const contexto = OPT.municipio || (data.park && data.park.name) || entry.slug;
  const categoria = OPT.categoria;
  console.log('▶ ' + (data.park ? data.park.name : entry.slug) + dim(' · ' + pois.length + ' POI(s)'));
  if (!categoria) {
    console.log(yellow('  sin --categoria: solo se usará el buscador de Commons, y todo saldrá a revisar'));
  }
  const archivos = categoria ? await archivosDelEspacio(categoria) : [];
  if (categoria) console.log(dim('  categoría del espacio: ' + archivos.length + ' archivo(s) utilizables'));

  let escritos = 0;
  for (const poi of pois) {
    const tieneFoto = !!poi.image;
    if (tieneFoto && !OPT.all) { informe.push({ parque: entry.slug, poi: poi.name, estado: 'ya tenía foto', detalle: poi.image }); continue; }

    const alias = aliasDe(entry.slug, poi.id);
    if (alias.length) console.log(dim('    alias: ' + alias.join(' · ')));
    const res = await resuelvePoi(poi, { archivos, contexto, alias });
    for (const r of (res.rechazos || [])) {
      informe.push({ parque: entry.slug, poi: poi.name, estado: 'descartada', detalle: r.file + ' — ' + r.motivo });
    }
    if (!res.elegida) {
      console.log('  ' + yellow('· ') + poi.name + dim(' — sin candidata'));
      informe.push({ parque: entry.slug, poi: poi.name, estado: 'sin foto', detalle: 'ninguna candidata pasó licencia y carga' });
      continue;
    }
    const c = res.elegida;
    const marca = c.needsReview ? yellow('? ') : green('✓ ');
    console.log('  ' + marca + poi.name + dim(' → ' + c.file + ' (' + c.licencia + ', ' + c.via + ')'));
    informe.push({
      parque: entry.slug, poi: poi.name,
      estado: c.needsReview ? 'candidata a revisar' : 'candidata',
      detalle: c.file + ' — ' + c.attribution + ' — ' + c.via,
      url: c.url,
    });

    if (c.needsReview && !OPT.force) continue;   // se propone, no se escribe
    if (!OPT.write) continue;
    poi.image = c.url;
    poi.source = conCredito(poi.source, c);
    escritos++;
    if (OPT.sql) {
      sentencias.push(`UPDATE points_of_interest SET image_url = ${sqlStr(c.url)}, source = ${sqlStr(poi.source)} ` +
        `WHERE slug = ${sqlStr(poi.id)} AND park_id = (SELECT id FROM parks WHERE slug = ${sqlStr(entry.slug)});`);
    }
  }

  if (escritos && OPT.write && !OPT.dryRun) {
    fs.writeFileSync(entry.file, JSON.stringify(data, null, 2) + '\n', 'utf8');
    console.log('  → ' + rel(entry.file) + ' (' + escritos + ' foto(s))');
  } else if (escritos && OPT.dryRun) {
    console.log(yellow('  --dry-run: ' + escritos + ' foto(s) sin escribir'));
  }
  return escritos;
}

function escribeInforme(informe, file) {
  const L = ['# Fotos de puntos de interés — informe', '',
    'Generado por `Tools/catalogo-nacional/poi-images.js` el ' + new Date().toISOString().slice(0, 10) + '.', '',
    'Solo se escriben las candidatas con licencia libre (CC0, dominio público, CC BY, CC BY-SA) y',
    'coincidencia segura. Las marcadas «a revisar» salen del buscador de Commons y hay que mirarlas',
    'antes de aceptarlas: el buscador no garantiza que la foto sea del sitio.', '',
    '| Espacio | Punto de interés | Estado | Detalle |', '|---|---|---|---|'];
  for (const r of informe) L.push(`| ${r.parque} | ${r.poi} | ${r.estado} | ${r.detalle} |`);
  L.push('');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, L.join('\n'), 'utf8');
  console.log('→ ' + rel(file));
}

async function main() {
  const parques = parkFiles().filter(p => !OPT.park || p.slug === OPT.park);
  if (!parques.length) { console.error(red('✖ no hay parques que procesar' + (OPT.park ? ' para --park ' + OPT.park : ''))); process.exit(2); }
  if (OPT.park && OPT.categoria == null && !OPT.list) {
    console.log(yellow('Aviso: sin --categoria la resolución baja al buscador de Commons, que no garantiza el sitio.'));
  }

  const informe = [];
  let total = 0;
  for (const entry of parques) total += await procesaParque(entry, informe);

  if (OPT.report) escribeInforme(informe, fromRoot(OPT.report));
  if (OPT.sql && sentencias.length && !OPT.dryRun) {
    const file = fromRoot(OPT.sql);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, '-- Fotos de puntos de interés (poi-images.js)\n' + sentencias.join('\n') + '\n', 'utf8');
    console.log('→ ' + rel(file) + ' (' + sentencias.length + ' sentencia(s))');
  }
  console.log('\n' + (total ? green(total + ' foto(s) escritas') : 'Sin cambios') +
    dim(' · las candidatas «a revisar» no se escriben sin --force'));
}

if (require.main === module) {
  main().catch(err => { console.error(red('✖ ' + (err.stack || err.message))); process.exit(1); });
}

// Las tres decisiones que no dependen de la red y sí de acertar: qué licencia entra, cuándo un
// nombre de archivo habla del sitio, y cómo queda el crédito dentro de `source`.
module.exports = { licenciaLibre, mencionaSitio, mencionaAlguno, aliasDe, conCredito };
