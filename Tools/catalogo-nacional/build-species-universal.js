#!/usr/bin/env node
'use strict';
/*
 * build-species-universal.js — da de alta en el catálogo universal la ficha de un taxón nuevo.
 *
 * El problema que resuelve
 * -----------------------
 * El catálogo universal (`data/especies-universal.json`) solo se ha alimentado nunca de una forma:
 * `sync-species-catalog.js --extract`, que VUELCA lo que ya hay escrito en los `park.json`. Y
 * `build-species-n2.js` se niega —con razón— a escribir en un `park.json` una especie que no tenga
 * ficha universal, porque tendría que inventarse taxonomía, nombre común, UICN y foto.
 *
 * Las dos reglas juntas cierran un círculo: **una especie que no está en ningún parque no puede
 * entrar en ninguno**. Ese círculo es exactamente lo que dejó a Carrascoy y El Valle con 146 de 246
 * especies aprobadas y 100 «pendientes» (Docs/rollout/ESTADO.md §"2026-08-10"), y lo que habría
 * repetido cada espacio nuevo del rollout.
 *
 * Esta herramienta es la que faltaba: construye la ficha universal DESDE LAS FUENTES, no desde otro
 * park.json. Con ella, el pendiente de un espacio deja de ser una pared y pasa a ser un paso más:
 *
 *     build-species-universal.js --park <slug>     ← da de alta las fichas que faltan
 *     build-species-n2.js        --park <slug>     ← ya las encuentra y las escribe
 *
 * Qué escribe y de dónde sale cada campo
 * --------------------------------------
 * NINGÚN campo se rellena a ojo (regla nº 2 de CLAUDE.md). Cada uno tiene una fuente o una regla
 * derivada explícita, y lo que no se puede sostener se queda VACÍO y sale en el informe.
 *
 *   taxonomy          EIDOS `v_taxonomia` (kingdom/phylum/class/order/family/genus), literal.
 *   commonName        EIDOS `v_nombrescomunes`, el preferente en castellano. Ojo: el «preferente» de
 *                     EIDOS no siempre es el nombre por el que se conoce a la especie —da «Aguilón»
 *                     para el alimoche y «Alerce» para la sabina mora—, así que el informe lista los
 *                     demás nombres castellanos de la fuente para poder elegir con `--curado`.
 *   description       EIDOS `v_atributos_pliniancore`, atributo «Descripción de la especie»,
 *                     versión preferente, limpiada de restos de maquetación. Es texto de la fuente.
 *   habitat           EIDOS `v_atributos_pliniancore`, atributo «Hábitat», resumido a su primera
 *                     oración (el campo de la ficha es una etiqueta corta, no un párrafo). Se deja
 *                     VACÍO si esa oración nombra un territorio —sería un campo universal diciendo
 *                     algo local, regla nº 3— o si no cabe entera.
 *   iucnGlobal        EIDOS `v_estadoconservacion`, fila UICN vigente de ámbito Mundial.
 *   spainStatus       EIDOS `v_estadolegal`, SOLO las filas vigentes de ámbito Nacional.
 *   image             Wikidata P225 → P18 → Wikipedia → Commons, vía lib/wikimedia.js (la misma
 *                     cadena que `images:species`), con su atribución de licencia.
 *   kingdom, group    DERIVADOS de la taxonomía de EIDOS por la tabla `GRUPO_POR_TAXON`; en plantas,
 *                     cuando la taxonomía no da el porte, se lee de la primera palabra de la
 *                     descripción morfológica de EIDOS («Arbusto 80-120 cm, muy ramoso…»).
 *   rarityScore       DERIVADO del nº de registros de GBIF en España (`country=ES`) por la tabla
 *                     `BANDAS_RAREZA`, y subido un punto si la especie está catalogada como
 *                     amenazada. Ver la nota larga sobre este campo más abajo.
 *   seasonality       DERIVADO del histograma mensual de registros de GBIF en España: el tramo del
 *                     año en que la especie CONSTA PRESENTE (no en el que es más fácil verla, que es
 *                     otra cosa y lleva a escribir falsedades). Ver `estacionalidad()`.
 *   tips              NO SE GENERA. Ver la nota de abajo.
 *
 * Las tres pistas de identificación (`tips`) no se escriben aquí
 * --------------------------------------------------------------
 * Son la síntesis de los rasgos por los que se distingue la especie en el campo, y ninguna fuente
 * las sirve como tales. Generarlas recortando la descripción de EIDOS produciría frases cortadas que
 * no ayudan a identificar nada, y escribirlas de memoria es justo lo que prohíbe la regla nº 2. Así
 * que la ficha nace con `tips: []`, el validador avisa («sin pistas de identificación», es aviso y
 * no error) y la herramienta deja en el informe la descripción de EIDOS de cada especie para que se
 * redacten a partir de ella. Se cargan con `--curado`, junto con los demás campos que ninguna fuente
 * sirve tal cual: el PORTE de una planta (árbol / arbusto / mata / hierba), que no está en la
 * taxonomía —dos especies del mismo género pueden ser una mata y un arbusto—, y el nombre común
 * cuando el preferente de EIDOS no es el usual.
 *
 * Sobre `rarityScore`, que es el único campo de producto
 * ------------------------------------------------------
 * No mide una propiedad de la especie sino lo llamativo que es encontrarla, y por eso alimenta
 * `featured`. Se comprobó que NO se puede derivar de la figura legal: en el catálogo actual las
 * especies con LESRPE reparten su rareza entre 1 y 4 (el petirrojo y el águila perdicera están las
 * dos en el LESRPE). La señal que sí ordena bien es cuántas veces se registra la especie en España,
 * que es dato de GBIF, reproducible y del mismo ámbito NACIONAL que el campo.
 *
 * Uso
 * ---
 *   node Tools/catalogo-nacional/build-species-universal.js --park <slug> [--dry]
 *   node Tools/catalogo-nacional/build-species-universal.js --taxones "Parus major,Tyto alba"
 *
 *   --park <slug>     toma las especies de la selección aprobada del espacio que aún no tienen ficha
 *   --taxones <lista> nombres científicos separados por coma
 *   --curado <ruta>   JSON `{ "<nombre científico>": { "<campo>": <valor> } }` con los campos que
 *                     ninguna fuente sirve: `tips`, `group`, `commonName`… (lista en `CURABLES`)
 *   --cache <ruta>    guarda/reutiliza las respuestas en crudo. Sin él, cada pase vuelve a pedirlo
 *                     todo: son cuatro servicios públicos y ~7 peticiones por taxón
 *   --refrescar       reescribe también las fichas que ya existen (por defecto NO se tocan)
 *   --refrescar-campos <lista>
 *                     vuelve a derivar SOLO esos campos de las fichas indicadas, dejando el resto
 *                     intacto. Es lo que se usa cuando se corrige la lectura de una fuente y hay que
 *                     propagarlo a lo ya escrito sin pisar nada curado, p. ej.:
 *                        --taxones "<…>" --refrescar --refrescar-campos spainStatus
 *   --dry             no escribe nada
 *
 * Idempotente: un segundo pase con la misma caché no cambia un byte.
 */

const fs = require('fs');
const path = require('path');
const { arg, flag, die, sleep } = require('../lib/cli');
const { getJson } = require('../lib/http');
const { CATALOGO_DIR, OUT_DIR, readJson, writeJson, rel, fromRoot, parkFiles } = require('../lib/io');
const eidos = require('../lib/eidos');
const wikimedia = require('../lib/wikimedia');

const DRY = flag('dry');
const REFRESCAR = flag('refrescar');
const PARK = arg('park', null);
const TAXONES = arg('taxones', null);
const CACHE_PATH = fromRoot(arg('cache', path.join(OUT_DIR, 'especies-universal-cache.json')));
const CURADO_PATH = arg('curado', null) ? fromRoot(arg('curado')) : null;
// Refresco quirúrgico: vuelve a derivar SOLO los campos nombrados, sobre fichas que ya existen, y
// deja el resto intacto. Existe porque `--refrescar` es demasiado bruto para el caso real: cuando se
// arregla la lectura de UNA fuente hay que corregir las fichas ya escritas sin tocar lo curado a
// mano. Se estrenó con las 39 fichas cuyo `spainStatus` citaba la Ley 9/1999 de Castilla-La Mancha.
const SOLO_CAMPOS = arg('refrescar-campos', null)
  ? arg('refrescar-campos').split(',').map(s => s.trim()).filter(Boolean) : null;

if (!PARK && !TAXONES) die('Uso: --park <slug> | --taxones "Nombre uno,Nombre dos"  [--dry] [--curado <ruta>]');

// Campos que el fichero de curación puede fijar. Es la lista blanca a propósito: lo que sale de una
// fuente (taxonomía, UICN, estado legal, foto) NO se cura a mano, se corrige en la fuente o se
// arregla el lector. Lo que se cura es lo que ninguna fuente sirve en el formato que pide la ficha.
const CURABLES = ['commonName', 'group', 'habitat', 'seasonality', 'tips', 'rarityScore', 'description'];

const CATALOGO = path.join(CATALOGO_DIR, 'data', 'especies-universal.json');

// --- Tablas de derivación --------------------------------------------------------------------------
// Se declaran aquí, a la vista, porque son las ÚNICAS decisiones de esta herramienta que no vienen
// firmadas por una fuente. Cambiarlas cambia fichas de todo el catálogo.

// `group` es la etiqueta corta de la tarjeta. El frontend solo la usa por coincidencia de subcadena
// para elegir el emoji (Frontend/Js/util.js `kingdomEmoji`), así que importa que empiece por la
// palabra que ese buscador espera: «Ave…», «Reptil», «Mamífero», «Murciélago», «Anfibio».
// El orden importa: se aplica la primera regla que casa.
const GRUPO_POR_TAXON = [
  { si: t => t.class === 'Aves' && /Accipitriformes|Falconiformes|Cathartiformes/.test(t.order), grupo: 'Ave rapaz' },
  { si: t => t.class === 'Aves' && t.order === 'Strigiformes', grupo: 'Ave rapaz nocturna' },
  { si: t => t.class === 'Aves' && t.order === 'Charadriiformes', grupo: 'Ave limícola' },
  { si: t => t.class === 'Aves' && /Anseriformes|Pelecaniformes|Suliformes|Gruiformes|Podicipediformes|Ciconiiformes/.test(t.order), grupo: 'Ave acuática' },
  { si: t => t.class === 'Aves' && t.order === 'Pterocliformes', grupo: 'Ave esteparia' },
  { si: t => t.class === 'Aves', grupo: 'Ave' },
  { si: t => t.class === 'Mammalia' && t.order === 'Chiroptera', grupo: 'Murciélago' },
  { si: t => t.class === 'Mammalia' && t.order === 'Rodentia', grupo: 'Roedor' },
  { si: t => t.class === 'Mammalia' && t.order === 'Carnivora', grupo: 'Mamífero carnívoro' },
  { si: t => t.class === 'Mammalia' && /Artiodactyla|Perissodactyla/.test(t.order), grupo: 'Mamífero ungulado' },
  { si: t => t.class === 'Mammalia', grupo: 'Mamífero' },
  { si: t => /Reptilia|Squamata|Testudines/.test(t.class) || /Squamata|Testudines/.test(t.order), grupo: 'Reptil' },
  { si: t => t.class === 'Amphibia', grupo: 'Anfibio' },
  { si: t => t.class === 'Insecta', grupo: 'Insecto' },
  { si: t => t.family === 'Orchidaceae', grupo: 'Orquídea' },
  { si: t => t.family === 'Poaceae', grupo: 'Gramínea' },
  { si: t => t.family === 'Arecaceae', grupo: 'Palmera' },
  { si: t => /Pinopsida|Pinales|Cupressaceae|Pinaceae/.test(`${t.class} ${t.order} ${t.family}`), grupo: 'Conífera' },
  { si: t => /Polypodiopsida|Pteridopsida|Polypodiales|Pteridales/.test(`${t.class} ${t.order}`), grupo: 'Helecho' },
  // Las bulbosas son un grupo de PORTE, no taxonómico, pero estas tres familias lo son en su
  // totalidad dentro del catálogo mediterráneo que maneja el proyecto.
  { si: t => /Amaryllidaceae|Liliaceae|Iridaceae|Hyacinthaceae|Asphodelaceae/.test(t.family), grupo: 'Planta bulbosa' },
];
// El porte de una planta (árbol / arbusto / mata / hierba) NO está en la taxonomía: dos especies del
// mismo género pueden ser una mata y un arbusto. Pero SÍ suele estar en la primera palabra de la
// descripción morfológica de EIDOS, que es una fuente y empieza justamente por ahí: «Arbusto 80-120
// cm, muy ramoso, perennifolio…». Se lee de ahí, no de la memoria de quien ejecuta.
// No van anclados al principio: la descripción de EIDOS abre con el porte pero no siempre en la
// primera palabra («Pequeño árbol de 5-6 m, caducifolio…», «Perenne sufruticosa, de 10-40 cm…»,
// «Planta procumbente y multicaule, de base sufruticosa…»). Se busca en la primera frase y gana
// la coincidencia que aparezca ANTES, no la primera de esta lista: en *Rhamnus lycioides*
// —«arbustillo de hasta 3 m que frecuentemente tiene aspecto de mata alta»— el orden decide.
// ⚠️ Los límites son Unicode a propósito, no `\b`. En JavaScript `\b` es ASCII: «á» no cuenta como
// carácter de palabra, así que `/\bárbol/` NO casa con «Pequeño árbol de 5-6 m» —hay un espacio
// delante y ninguno de los dos lados es \w, luego no hay frontera— y dejaba sin porte justo a los
// árboles. Con `(?<!\p{L})…(?!\p{L})` y la bandera `u` el límite vale para cualquier letra.
const limite = (alternativas) => new RegExp(`(?<!\\p{L})(?:${alternativas})(?!\\p{L})`, 'iu');
const PORTE_EN_DESCRIPCION = [
  { re: limite('árbol|arbol|arbolillo'), grupo: 'Árbol' },
  { re: limite('arbusto|arbustillo|arbustiva'), grupo: 'Arbusto' },
  { re: limite('mata|matilla|caméfito|camefito|subarbusto|sufruticosa|sufruticoso|sufrútice'), grupo: 'Mata' },
  { re: limite('hierba|herbácea|herbáceo|geófito|geofito|terófito|terofito'), grupo: 'Hierba' },
  { re: limite('liana|trepadora|bejuco'), grupo: 'Trepadora' },
];
// Solo la apertura: más allá, la descripción habla de hojas, flores y frutos, y una mención suelta
// a «las matas vecinas» no dice nada del porte de la especie.
const PORTE_VENTANA = 140;
// Cuando tampoco la descripción lo dice, el grupo se queda vacío y la especie sale en el informe.
const GRUPO_SIN_RESOLVER = null;

// Bandas de rareza por nº de registros de GBIF en España. Los cortes salen de ordenar el catálogo
// actual: las especies con rareza 1-2 son las que se cuentan por decenas de miles de registros
// (petirrojo, carrasca) y las de 4-5 las que no llegan al millar (garcilla cangrejera, sabina mora).
const BANDAS_RAREZA = [
  { desde: 20000, valor: 1 },
  { desde: 5000, valor: 2 },
  { desde: 1000, valor: 3 },
  { desde: 100, valor: 4 },
  { desde: 0, valor: 5 },
];

// SUELO de rareza por grado de amenaza. No es un incremento sobre la banda de GBIF sino un mínimo,
// y la diferencia importa: el alimoche tiene 85.000 registros en España —está bien vigilado— pero
// es «En peligro» mundial, y encontrárselo es un hecho señalado. Con un +1 sobre la banda se
// quedaba en 2, por debajo de cualquier matorral; con suelo sale 5, que es lo que corresponde.
// El recuento de GBIF mide esfuerzo de observación tanto como abundancia, y en aves lo mide sobre
// todo a él: la amenaza es la señal que lo corrige.
const SUELO_AMENAZA = [
  { re: /En peligro de extinción|En peligro crítico|^(CR|EN)\b/i, valor: 5 },
  { re: /Vulnerable|Sensible a la alteración|^VU\b/i, valor: 4 },
  { re: /Casi amenazad|^NT\b/i, valor: 3 },
];

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

// --- Caché de respuestas en crudo --------------------------------------------------------------------
// Cada taxón cuesta ~7 peticiones a cuatro servicios públicos. Sin caché, ajustar una regla de
// derivación obligaría a volver a pedirlo todo.

const cache = fs.existsSync(CACHE_PATH) ? readJson(CACHE_PATH) : {};
let cacheSucia = false;

async function cacheado(clave, fn) {
  if (Object.prototype.hasOwnProperty.call(cache, clave)) return cache[clave];
  const v = await fn();
  cache[clave] = v;
  cacheSucia = true;
  return v;
}

// La caché se guarda TAMBIÉN en `--dry`. No es un entregable —vive en `out/`, que no se versiona—
// sino la copia de lo que ya se ha pedido a cuatro servicios públicos, y una simulación es
// precisamente cuando más se repite la ejecución. Si `--dry` no la guardara, ajustar una regla de
// derivación costaría otras setecientas peticiones cada vez.
function guardarCache() {
  if (!cacheSucia) return;
  fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
  writeJson(CACHE_PATH, cache);
}

// --- Limpieza del texto de EIDOS ---------------------------------------------------------------------
// Los valores llegan tal cual se teclearon en las fichas descriptivas: con saltos de línea, dobles
// espacios y, a veces, el pie de página del documento del que se copiaron. Es la misma basura que
// documenta invasoras-contenido.js. Aquí SOLO se limpia; no se reescribe lo que dice la frase.
const BASURA = [
  /\b[\wáéíóúñ_-]+\.docx?\s*P[áa]gina\s*\d+\s*de\s*\d+\s*/gi,
  /\bP[áa]gina\s*\d+\s*de\s*\d+\s*/gi,
];

// Citas bibliográficas intercaladas: «(Gainzarain, 2006)», «(Blanco & González, 1992)». En una
// ficha de campo no dicen nada, y al recortar el texto a una etiqueta corta dejan el paréntesis sin
// cerrar («…todo tipo de hábitats (Gainzarain, 2006»), que es peor que no ponerlo.
const RE_CITA = /\s*\((?:[A-ZÁÉÍÓÚÑ][\wáéíóúñ'’-]*(?:\s+(?:et\s+al\.?|y|&|,)\s*)*)+,?\s*\d{4}[a-z]?(?:\s*[;,]\s*[^()]{0,60}\d{4}[a-z]?)*\)/g;

function limpiar(texto) {
  let t = String(texto || '');
  for (const re of BASURA) t = t.replace(re, ' ');
  t = t.replace(RE_CITA, '');
  t = t.replace(/\s*\n+\s*/g, ' ').replace(/\s{2,}/g, ' ').trim();
  // Apartados vacíos del formulario: no aportan nada y ocupan media ficha.
  t = t.replace(/\s*-\s*No hay datos\b\.?/gi, '').trim();
  if (/^no hay datos\.?$/i.test(t)) return null;
  return t || null;
}

// Territorios que convierten un texto en LOCAL. La regla nº 3 de CLAUDE.md es que lo universal no
// puede nombrar un sitio concreto: el atributo «Hábitat» de EIDOS a menudo lo hace («En Murcia, los
// ejemplares naturales conocidos…»), y esa frase es falsa en cuanto la especie se sirve en otra
// comunidad. El validador tiene su propia lista, pero solo caza nombres de espacios protegidos; esta
// caza el escalón de arriba, que es el que se cuela por el atributo de EIDOS.
const RE_TERRITORIO = new RegExp('\\b(' + [
  'Andalucía', 'Aragón', 'Asturias', 'Baleares', 'Balears', 'Canarias', 'Cantabria',
  'Castilla-La Mancha', 'Castilla y León', 'Cataluña', 'Extremadura', 'Galicia', 'La Rioja',
  'Madrid', 'Murcia', 'Navarra', 'País Vasco', 'Valencia', 'Valenciana', 'Ceuta', 'Melilla',
  'Península Ibérica', 'la Península', 'España',
  // Las regiones biogeográficas son igual de locales para una ficha nacional: «En la región
  // Eurosiberiana aumenta su densidad…» no describe el hábitat de la especie en Murcia.
  'Eurosiberiana', 'Mediterránea', 'Macaronésica', 'Atlántica',
].join('|') + ')\\b', 'i');

/**
 * Etiqueta corta de hábitat a partir del párrafo de EIDOS: su primera oración.
 *
 * Devuelve `null` —hueco documentado, no texto a medias— en los dos casos en que recortar mentiría:
 * cuando el texto nombra un territorio (sería un campo universal diciendo algo local) y cuando la
 * primera oración no cabe entera, porque cortarla a mitad produce las etiquetas rotas que ya tiene
 * el catálogo.
 */
function etiquetaHabitat(texto, max = 160) {
  if (!texto) return null;
  if (RE_TERRITORIO.test(texto)) return null;
  const m = String(texto).match(/^(.{20,}?[.;])\s/);
  const frase = (m ? m[1] : String(texto)).replace(/[.;]\s*$/, '').trim();
  if (frase.length > max) return null;
  // Un paréntesis abierto y no cerrado delata que la oración venía partida de origen.
  if ((frase.match(/\(/g) || []).length !== (frase.match(/\)/g) || []).length) return null;
  return frase;
}

// --- Consultas a las fuentes ---------------------------------------------------------------------------

/** Todo lo que EIDOS sabe de un taxón, en una sola entrada de caché. */
async function desdeEidos(sci) {
  return cacheado(`eidos2:${sci}`, async () => {
    const r = await eidos.resolveTaxon(sci, { agent: 'build-species-universal' });
    if (!r.taxonid) return { status: r.status, taxon: null };
    await sleep(eidos.THROTTLE_MS);
    const id = r.taxonid;
    // Sin filtrar por `nametype`: el valor «Aceptado/válido» lleva barra y tilde, y PostgREST
    // responde 400 si no van codificadas. `taxonid` ya identifica al taxón aceptado; de las filas
    // que devuelve (una por nombre, incluidos los sinónimos) se elige la del nombre válido.
    const filas = await eidos.rows('v_taxonomia', [`taxonid=eq.${id}`], { agent: 'build-species-universal' });
    const detalle = filas.find(f => f.nametype === 'Aceptado/válido') || filas[0];
    await sleep(eidos.THROTTLE_MS);
    const conservacion = await eidos.conservationByScope(id, { agent: 'build-species-universal' });
    await sleep(eidos.THROTTLE_MS);
    const legal = await eidos.legalStatus(id, null, { agent: 'build-species-universal' });
    await sleep(eidos.THROTTLE_MS);
    // Se guardan TODOS los nombres castellanos, no solo el preferente. EIDOS marca como preferente
    // nombres locales que no son por los que se conoce a la especie —«Aguilón» para el alimoche,
    // «Alerce» para la sabina mora, teniendo «Alimoche común» y «Sabina de Cartagena» en la misma
    // lista—, y el informe tiene que ofrecer las alternativas para poder curar el campo SIN salirse
    // de la fuente: se elige entre lo que dice EIDOS, no se inventa un nombre.
    const nombres = await eidos.rows('v_nombrescomunes',
      [`idtaxon=eq.${id}`, 'select=nombre_comun,idioma,espreferente,tiponombre'],
      { agent: 'build-species-universal' });
    await sleep(eidos.THROTTLE_MS);
    const atributos = await eidos.rows('v_atributos_pliniancore', [`idtaxon=eq.${id}`],
      { agent: 'build-species-universal' });
    return {
      status: r.status,
      taxonid: id,
      acceptedName: r.acceptedName,
      taxon: detalle || r.taxon,
      conservacion,
      // `nacional` ya viene depurado de las normas autonómicas que EIDOS etiqueta mal (ver la nota
      // de legalStatus en lib/eidos.js). Se guardan también todas las vigentes: no las usa la ficha,
      // pero tener el crudo en la caché evita volver a pedirlo si mañana hace falta otra lectura.
      legal: legal.nacional,
      legalTodas: legal.vigentes,
      nombres: (nombres || []).filter(n => !n.idioma || /castellano|espa/i.test(n.idioma))
        .map(n => ({ nombre: n.nombre_comun, preferente: !!n.espreferente })),
      atributos: atributos.map(a => ({ atributo: a.atributo, valor: a.valor, prioritario: a.prioritario })),
    };
  });
}

/**
 * Señal NACIONAL de frecuencia: cuántas veces se ha registrado la especie en España y en qué meses.
 * Es lo que sostiene `rarityScore` y `seasonality`, y es del mismo ámbito (España) que el campo.
 */
async function desdeGbifNacional(sci) {
  return cacheado(`gbif-es:${sci}`, async () => {
    const m = await getJson('api.gbif.org', `/v1/species/match?name=${encodeURIComponent(sci)}`,
      { agent: 'build-species-universal' });
    if (!m || !m.usageKey || m.rank !== 'SPECIES') return { speciesKey: null, total: 0, meses: [] };
    await sleep(120);
    const facetas = await getJson('api.gbif.org',
      `/v1/occurrence/search?taxonKey=${m.usageKey}&country=ES&limit=0&facet=month&facetLimit=12`,
      { agent: 'build-species-universal' });
    const meses = ((facetas.facets || []).find(f => f.field === 'MONTH') || {}).counts || [];
    return {
      speciesKey: m.usageKey,
      total: facetas.count || 0,
      meses: meses.map(c => ({ mes: Number(c.name), n: c.count })),
    };
  });
}

/** Foto con licencia, por la misma cadena que usa `images:species`. */
async function desdeWikimedia(sci) {
  return cacheado(`foto:${sci}`, async () => {
    const r = await wikimedia.resolver(sci);
    return r ? { url: r.url, attribution: r.attribution, via: r.via, needsReview: r.needsReview } : null;
  });
}

// --- Construcción de los campos derivados -----------------------------------------------------------

function taxonomiaDe(t) {
  if (!t) return null;
  const tax = {
    kingdom: t.kingdom || null,
    phylum: t.phylum || null,
    class: t.class || null,
    order: t.ordertaxonomic || null,
    family: t.family || null,
    genus: t.genus || null,
  };
  return Object.values(tax).every(v => !v) ? null : tax;
}

function reinoDe(tax) {
  if (!tax) return null;
  if (tax.kingdom === 'Plantae' || tax.kingdom === 'Fungi') return 'flora';
  if (tax.kingdom === 'Animalia') return 'fauna';
  return null;
}

function grupoDe(tax, descripcion) {
  if (!tax) return GRUPO_SIN_RESOLVER;
  const t = {
    class: tax.class || '', order: tax.order || '', family: tax.family || '', kingdom: tax.kingdom || '',
  };
  for (const regla of GRUPO_POR_TAXON) if (regla.si(t)) return regla.grupo;
  // Segundo intento solo para plantas: el porte, leído de la apertura de la descripción de EIDOS.
  if (t.kingdom === 'Plantae' && descripcion) {
    const apertura = String(descripcion).slice(0, PORTE_VENTANA);
    let mejor = null;
    for (const regla of PORTE_EN_DESCRIPCION) {
      const m = apertura.match(regla.re);
      if (m && (mejor === null || m.index < mejor.pos)) mejor = { pos: m.index, grupo: regla.grupo };
    }
    if (mejor) return mejor.grupo;
  }
  return GRUPO_SIN_RESOLVER;
}

/** Texto del atributo Plinian Core pedido, quedándose con la versión preferente. */
function atributo(atributos, nombre) {
  const filas = (atributos || []).filter(a => a.atributo === nombre);
  if (!filas.length) return null;
  const pref = filas.find(a => a.prioritario) || filas[0];
  return limpiar(pref.valor);
}

const CATEGORIA_UICN = {
  EX: 'Extinta', EW: 'Extinta en estado silvestre', CR: 'En peligro crítico', EN: 'En peligro',
  VU: 'Vulnerable', NT: 'Casi amenazada', LC: 'Preocupación menor', DD: 'Datos insuficientes',
  NE: 'No evaluada',
};

function iucnDe(conservacion) {
  const mundial = (conservacion || {}).Mundial;
  if (!mundial || !mundial.categoriaconservacion) return 'No evaluada en la Lista Roja mundial de la UICN';
  const cruda = String(mundial.categoriaconservacion).trim();
  const cod = (cruda.match(/^[A-Z]{2}/) || [])[0];
  const nombre = CATEGORIA_UICN[cod];
  const anio = mundial.anio ? `, ${mundial.anio}` : '';
  return nombre
    ? `${cod} — ${nombre} (Lista Roja mundial de la UICN${anio})`
    : `${cruda} (Lista Roja mundial de la UICN${anio})`;
}

/**
 * `spainStatus`: SOLO las normas estatales vigentes, que ya llegan filtradas por `legalStatus`.
 *
 * El filtro no es cosmético, y no basta con mirar `ambito`. En el catálogo actual hay 60 fichas cuyo
 * `spainStatus` cita la Ley 9/1999 de Castilla-La Mancha —una norma autonómica de otra comunidad—
 * porque EIDOS la sirve con `ambito: "Nacional"` y solo la delata su campo `ccaa`
 * (Docs/rollout/ESTADO.md §"2026-08-10"; la nota larga está en lib/eidos.js). Lo autonómico va en
 * `murciaStatus`, y lo pone build-species-n2.js desde la selección del espacio.
 */
// Peso de cada figura estatal, para que la ficha empiece por la que de verdad describe el estado de
// protección. Sin esto, la sabina mora abría con dos anexos de material forestal de reproducción y
// enterraba el LESRPE en cuarto lugar, detrás de 1.200 caracteres de título de Real Decreto.
const PESO_FIGURA = [
  { re: /CEEA/i, peso: 0 },
  { re: /LESRPE|régimen de protección especial/i, peso: 1 },
  { re: /Anexo\s*(I|II|IV)\b/i, peso: 2 },
];
const pesoDe = (r) => (PESO_FIGURA.find(p => p.re.test(r.estadolegal || '')) || { peso: 3 }).peso;

// Los títulos de norma de EIDOS llegan completos y llegan a 900 caracteres. La ficha necesita
// identificar la norma, no reproducir su encabezado: se corta por el final de su nombre propio.
function normaCorta(norma) {
  const n = String(norma || '').trim();
  const m = n.match(/^(.{0,120}?\b\d{4}(?:,\s*de\s+\d{1,2}\s+de\s+[a-záéíóú]+)?)/i);
  const corta = (m && m[1] ? m[1] : n.slice(0, 120)).replace(/[,;.\s]+$/, '');
  return corta.length < n.length ? corta : n;
}

function espanaDe(nacionales) {
  if (!(nacionales || []).length) return 'Sin figura de protección de ámbito estatal (LESRPE/CEEA) en EIDOS (IEPNB)';
  const vistos = new Set();
  const partes = [];
  for (const r of [...nacionales].sort((a, b) => pesoDe(a) - pesoDe(b))) {
    const txt = [r.estadolegal, r.norma ? `(${normaCorta(r.norma)})` : null].filter(Boolean).join(' ');
    if (!txt || vistos.has(txt)) continue;
    vistos.add(txt);
    partes.push(txt);
  }
  // Tres figuras bastan para situar a la especie; a partir de ahí la ficha deja de leerse.
  const sobran = partes.length - 3;
  return partes.slice(0, 3).join(' · ') + (sobran > 0 ? ` · y ${sobran} figura${sobran === 1 ? '' : 's'} más en EIDOS (IEPNB)` : '');
}

function rarezaDe(gbifEs, legal, iucn) {
  if (!gbifEs || !gbifEs.total) return null;
  const banda = BANDAS_RAREZA.find(b => gbifEs.total >= b.desde);
  const base = banda ? banda.valor : 3;
  // El grado de amenaza se lee en las dos escalas que tiene la ficha: la categoría legal estatal
  // (CEEA) y la evaluación mundial de la UICN. Manda la más grave de las dos.
  const textos = (legal || []).map(r => r.estadolegal || '').concat([iucn || '']);
  const suelo = Math.max(0, ...SUELO_AMENAZA
    .filter(s => textos.some(t => s.re.test(t)))
    .map(s => s.valor));
  return Math.max(base, suelo);
}

/**
 * `seasonality`: cuándo está presente la especie, leído del histograma mensual de registros de GBIF
 * en España.
 *
 * ⚠️ La trampa de este campo, y por qué el umbral es TAN bajo: el histograma de GBIF mide esfuerzo
 * de observación tanto como presencia. Un residente como el carbonero común concentra sus registros
 * en abril-mayo, que es cuando la gente sale a anillar y a hacer censos de reproductores, pero está
 * aquí los doce meses. La primera versión de esta función se quedaba con los meses por encima del
 * 60 % del máximo y escribía «Abril a mayo» en la ficha del carbonero, que es sencillamente falso.
 *
 * Lo que el histograma sí distingue con fiabilidad es la AUSENCIA: un estival no tiene registros en
 * enero, ni el invernante en julio, y esos ceros no son falta de observadores. Así que el umbral se
 * pone donde separa «no está» de «está aunque se mire menos» —el 10 % del mes de máximo— y lo que
 * se lee es el tramo del año en que la especie consta presente, no cuándo es más fácil verla.
 *
 * Con menos de 200 registros en España el histograma no sostiene ninguna lectura y se deja vacío.
 */
function estacionalidad(gbifEs) {
  if (!gbifEs || gbifEs.total < 200 || !(gbifEs.meses || []).length) return null;
  const porMes = new Array(12).fill(0);
  for (const { mes, n } of gbifEs.meses) if (mes >= 1 && mes <= 12) porMes[mes - 1] = n;
  const max = Math.max(...porMes);
  if (!max) return null;
  const activos = porMes.map((n, i) => (n >= max * 0.1 ? i : -1)).filter(i => i >= 0);
  if (activos.length >= 11) return 'Todo el año';
  if (!activos.length) return null;

  // Tramo continuo en el círculo del año: se busca el hueco más largo entre meses activos y el
  // tramo es lo que queda. Sin esto, un invernante (nov-feb) se describiría como «enero a diciembre».
  let corte = 0, hueco = -1;
  for (let k = 0; k < activos.length; k++) {
    const sig = activos[(k + 1) % activos.length];
    const d = (sig - activos[k] + 12) % 12;
    if (d > hueco) { hueco = d; corte = (k + 1) % activos.length; }
  }
  const orden = activos.slice(corte).concat(activos.slice(0, corte));
  const continuo = orden.every((m, k) => k === 0 || m === (orden[k - 1] + 1) % 12);
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  if (continuo && orden.length > 1) return cap(`${MESES[orden[0]]} a ${MESES[orden[orden.length - 1]]}`);
  if (orden.length === 1) return cap(MESES[orden[0]]);
  return cap(orden.map(m => MESES[m]).join(', '));
}

// --- Programa ------------------------------------------------------------------------------------------

/** Los nombres científicos que hoy usan los DEMÁS parques del catálogo. */
function nombresDeOtrosParques() {
  const usados = new Set();
  for (const { slug, file } of parkFiles()) {
    if (slug === PARK) continue;
    for (const sp of (readJson(file).species || [])) usados.add(sp.scientificName);
  }
  return usados;
}

/**
 * Qué fichas hay que dar de alta de verdad.
 *
 * ⚠️ No basta con «las de la selección que no están en el catálogo». Una selección se aprueba en una
 * sesión y se escribe en otra, y entre medias puede haber pasado una revisión nomenclatural: cuatro
 * especies de Carrascoy —*Salvia rosmarinus*, *Bupleurum gibraltaricum*, *Halimium atriplicifolium*
 * y *Calicotome villosa*— se aprobaron con el nombre viejo y hoy el resto del catálogo las tiene con
 * el aceptado en EIDOS, que SÍ tiene ficha. Darlas de alta por el nombre de la selección crearía
 * cuatro entradas que no usa ningún parque: **exactamente los huérfanos que `species:poda` acababa
 * de retirar** (Docs/rollout/sesiones/2026-08-10.md §"2026-08-10 (b)").
 *
 * Por eso se resuelve el nombre igual que hace `build-species-n2.js` —manda lo que los demás parques
 * usan HOY— y solo se da de alta lo que sigue sin ficha después de resolver.
 */
function nombresPedidos(universal, saltadas) {
  if (TAXONES) return TAXONES.split(',').map(s => s.trim()).filter(Boolean);
  const p = path.join(OUT_DIR, `${PARK}-seleccion-especies.json`);
  if (!fs.existsSync(p)) die(`no existe la selección aprobada: ${rel(p)}`);
  const sel = readJson(p);
  const usados = nombresDeOtrosParques();
  const lista = [];
  for (const e of sel.especies || []) {
    const propuesto = e.scientificName;
    const aceptado = e.nombreAceptadoEidos;
    const efectivo = (!usados.has(propuesto) && aceptado && aceptado !== propuesto && usados.has(aceptado))
      ? aceptado : propuesto;
    if (!REFRESCAR && universal[efectivo]) {
      if (efectivo !== propuesto) saltadas.push(`${propuesto} → ${efectivo} (ya fichada con el nombre aceptado)`);
      continue;
    }
    if (!lista.includes(efectivo)) lista.push(efectivo);
  }
  return lista;
}

async function main() {
  const universal = fs.existsSync(CATALOGO) ? readJson(CATALOGO) : {};
  const saltadas = [];
  const nombres = nombresPedidos(universal, saltadas);
  const curado = CURADO_PATH && fs.existsSync(CURADO_PATH) ? readJson(CURADO_PATH) : {};

  console.log(`\nFichas universales a dar de alta: ${nombres.length}`);
  console.log(`Catálogo: ${rel(CATALOGO)} (${Object.keys(universal).length} entradas)`);
  console.log(`Caché: ${rel(CACHE_PATH)}${fs.existsSync(CACHE_PATH) ? '' : ' (nueva)'}`);
  if (CURADO_PATH) console.log(`Curación: ${rel(CURADO_PATH)} (${Object.keys(curado).length} especies)`);
  if (saltadas.length) {
    console.log(`\n${saltadas.length} de la selección NO necesitan alta: una revisión nomenclatural posterior las dejó\n` +
      'con otro nombre, y con ese SÍ tienen ficha. Darlas de alta crearía entradas huérfanas:');
    saltadas.forEach(s => console.log('  · ' + s));
  }
  if (!nombres.length) { console.log('\nNada que hacer.'); return; }

  const fichas = {};
  const problemas = [];
  const sinonimos = [];
  const avisosCuracion = [];

  for (let i = 0; i < nombres.length; i++) {
    const sci = nombres[i];
    process.stdout.write(`  [${String(i + 1).padStart(3)}/${nombres.length}] ${sci.padEnd(34)}`);
    let e, g, foto;
    try {
      e = await desdeEidos(sci);
      g = await desdeGbifNacional(sci);
      foto = await desdeWikimedia(sci);
    } catch (err) {
      console.log(`✗ ${err.message.slice(0, 60)}`);
      problemas.push({ sci, falta: ['error de red'], detalle: err.message });
      continue;
    }

    if (!e || !e.taxon) {
      console.log('✗ EIDOS no la conoce');
      problemas.push({ sci, falta: ['EIDOS: taxón no encontrado'] });
      continue;
    }
    // EIDOS resuelve por prefijo. Si el nombre aceptado es OTRO, no se da de alta a ciegas: cambiar
    // el nombre de una especie es lo que desengancha su texto de `data/contenido/` (CLAUDE.md §2).
    if (e.status === 'sinonimo') sinonimos.push(`${sci} → ${e.acceptedName}`);

    const tax = taxonomiaDe(e.taxon);
    const iucn = iucnDe(e.conservacion);
    const castellanos = e.nombres || [];
    const preferente = castellanos.find(n => n.preferente) || castellanos[0] || null;
    const descripcion = atributo(e.atributos, 'Descripción de la especie');
    const ficha = {
      // Sin nombre castellano en EIDOS se usa el científico, NO se deja vacío: el catálogo y la
      // ficha lo pintan tal cual (`<h3>${commonName}</h3>` en Frontend/Js/render/), así que un nulo
      // se ve como la palabra «null» en la tarjeta. Hay seis taxones así en Carrascoy —*Cerambyx
      // cerdo*, *Guiraoa arvensis*…— y ninguna fuente les da nombre común: repetir el científico es
      // lo que hace cualquier guía de campo, y no inventa nada.
      commonName: preferente ? preferente.nombre : sci,
      kingdom: reinoDe(tax),
      group: grupoDe(tax, descripcion),
      habitat: etiquetaHabitat(atributo(e.atributos, 'Hábitat')),
      seasonality: estacionalidad(g),
      rarityScore: rarezaDe(g, e.legal, iucn),
      description: descripcion,
      tips: [],
      taxonomy: tax,
      iucnGlobal: iucn,
      spainStatus: espanaDe(e.legal),
      image: foto ? foto.url : null,
      imageAttribution: foto ? foto.attribution : null,
      // La clave maestra del modelo (lib/eidos.js): identifica al taxón y es la misma en todos los
      // espacios, así que su sitio natural es el catálogo universal. Se guarda aquí porque
      // build-species-n2.js solo sabía reutilizarla de OTRO parque, y una especie que se estrena en
      // el catálogo no tiene de dónde copiarla: las 99 de Carrascoy se habrían quedado sin ella.
      // No está en la lista `UNIVERSALES` de sync-species-catalog.js a propósito —no se sincroniza
      // a los park.json por esa vía— pero `--extract` respeta las claves que no conoce.
      eidosTaxonId: e.taxonid || null,
    };
    // La curación se aplica ENCIMA de lo derivado y solo sobre los campos de `CURABLES`.
    for (const [campo, valor] of Object.entries(curado[sci] || {})) {
      if (!CURABLES.includes(campo)) { avisosCuracion.push(`${sci}: «${campo}» no es un campo curable, se ignora`); continue; }
      ficha[campo] = valor;
    }

    const falta = ['group', 'habitat', 'seasonality', 'rarityScore', 'description', 'image']
      .filter(c => ficha[c] == null);
    // El nombre común nunca queda nulo (cae al científico), pero que haya caído SÍ es un hueco.
    if (ficha.commonName === sci) falta.unshift('commonName');
    if (!(ficha.tips || []).length) falta.push('tips');
    fichas[sci] = ficha;
    console.log(falta.length ? `· faltan: ${falta.join(', ')}` : '✓ completa');
    if (falta.length) problemas.push({
      sci, falta,
      descripcion: ficha.description,
      alternativas: castellanos.map(n => n.nombre + (n.preferente ? ' (preferente)' : '')),
    });
  }

  guardarCache();

  // --- Escritura -------------------------------------------------------------------------------------
  // El catálogo se ordena por nombre científico: es un fichero que se lee a mano y que crece con cada
  // espacio, y sin orden el diff de un alta se vuelve ilegible.
  const fusion = { ...universal };
  for (const [sci, f] of Object.entries(fichas)) {
    if (SOLO_CAMPOS && universal[sci]) {
      // Solo los campos pedidos; todo lo demás de la ficha existente se queda como está.
      const parche = {};
      for (const campo of SOLO_CAMPOS) if (f[campo] !== undefined) parche[campo] = f[campo];
      fusion[sci] = { ...universal[sci], ...parche };
    } else {
      fusion[sci] = REFRESCAR && universal[sci] ? { ...universal[sci], ...f } : f;
    }
  }
  const ordenado = Object.fromEntries(Object.keys(fusion).sort((a, b) => a.localeCompare(b)).map(k => [k, fusion[k]]));

  const antes = fs.existsSync(CATALOGO) ? fs.readFileSync(CATALOGO, 'utf8') : null;
  const nuevo = JSON.stringify(ordenado, null, 2) + '\n';
  if (antes === nuevo) console.log(`\n= ${rel(CATALOGO)}`);
  else {
    if (!DRY) fs.writeFileSync(CATALOGO, nuevo, 'utf8');
    console.log(`\n${DRY ? '~' : '+'} ${rel(CATALOGO)} · ${Object.keys(universal).length} → ${Object.keys(ordenado).length} entradas`);
  }

  // --- Informe de lo que ha quedado incompleto ---------------------------------------------------------
  const informePath = path.join(OUT_DIR, `${PARK || 'taxones'}-fichas-incompletas.md`);
  if (problemas.length && !DRY) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.writeFileSync(informePath, informe(problemas, sinonimos), 'utf8');
    console.log(`+ ${rel(informePath)}`);
  }

  // Los problemas incluyen los taxones que ni siquiera llegaron a ficha (error de red, no está en
  // EIDOS): no se pueden restar del total de fichas construidas o el recuento sale negativo.
  const conHueco = problemas.filter(p => fichas[p.sci] && p.falta.length).length;
  const fallidas = problemas.filter(p => !fichas[p.sci]).length;
  console.log(`\n${Object.keys(fichas).length} fichas construidas · ${Object.keys(fichas).length - conHueco} sin ningún hueco` +
    (fallidas ? ` · ${fallidas} sin construir` : ''));
  const cuenta = c => Object.values(fichas).filter(f => (c === 'tips' ? !f.tips.length : f[c] == null)).length;
  for (const c of ['commonName', 'group', 'habitat', 'seasonality', 'rarityScore', 'description', 'image', 'tips']) {
    const n = cuenta(c);
    if (n) console.log(`  · sin ${c}: ${n}`);
  }
  avisosCuracion.forEach(a => console.log('\n⚠ ' + a));
  if (sinonimos.length) {
    console.log(`\n⚠ ${sinonimos.length} nombre(s) que EIDOS da por sinónimo. La ficha se da de alta con el nombre\n` +
      '  PEDIDO (que es el que usa la selección); renombrarla es una decisión aparte, y arrastra la\n' +
      '  clave de `data/contenido/` y del resto de parques (CLAUDE.md §2):');
    sinonimos.forEach(s => console.log('  · ' + s));
  }
  if (DRY) console.log('\nSimulación: no se ha tocado nada.');
}

function informe(problemas, sinonimos) {
  const l = [];
  l.push(`# ${PARK || 'taxones'} · fichas universales con huecos`, '');
  l.push('GENERADO por `Tools/catalogo-nacional/build-species-universal.js`. No editar a mano.', '');
  l.push('Cada especie de aquí **ya está dada de alta** en `data/especies-universal.json`, pero con algún');
  l.push('campo vacío: ninguna fuente lo sirve en el formato que pide la ficha, y rellenarlo a ojo es lo');
  l.push('que prohíbe la regla nº 2 de `CLAUDE.md`. Los huecos se cierran con `--curado <fichero.json>`,');
  l.push('un `{ "<nombre científico>": { "<campo>": <valor> } }` versionado y revisable.', '');
  l.push('Las dos columnas de la derecha son el material con el que curar **sin salirse de la fuente**:');
  l.push('«Descripción en EIDOS» es de donde salen las tres pistas de identificación, y «Otros nombres en');
  l.push('EIDOS» lista los nombres castellanos que la fuente conoce —el marcado como preferente no');
  l.push('siempre es por el que se conoce a la especie: EIDOS prefiere «Aguilón» a «Alimoche común».', '');
  l.push(`Total: **${problemas.length}**.`, '');
  l.push('| Especie | Campos vacíos | Otros nombres en EIDOS | Descripción en EIDOS |');
  l.push('|---|---|---|---|');
  for (const p of problemas) {
    const d = (p.descripcion || p.detalle || '—').replace(/\|/g, '\\|');
    const alt = (p.alternativas || []).length ? p.alternativas.join('<br>') : '—';
    l.push(`| *${p.sci}* | ${p.falta.join(', ')} | ${alt} | ${d.length > 400 ? d.slice(0, 400) + '…' : d} |`);
  }
  if (sinonimos.length) {
    l.push('', '## Nombres que EIDOS da por sinónimo', '');
    l.push('La ficha se ha dado de alta con el nombre **pedido**, que es el de la selección aprobada.');
    l.push('Renombrar arrastra la clave en `data/contenido/` y en el resto de parques.', '');
    sinonimos.forEach(s => l.push(`- ${s}`));
  }
  l.push('');
  return l.join('\n');
}

main().catch(e => { guardarCache(); die(e.stack || e.message); });
