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
 *   0. Archivo elegido a mano en `data/poi-foto.json`, si lo hay. No se salta ninguna comprobación:
 *      la licencia y la carga se verifican igual. Sirve para cuando hay varias fotos válidas del
 *      sitio y la que elige el orden alfabético no es la mejor; eso no lo puede decidir el script.
 *   1. Categoría de Commons del espacio (y sus subcategorías, un nivel): archivo cuyo nombre
 *      mencione el POI. Es la vía buena: el sitio lo garantiza la categoría y el elemento, el nombre.
 *   2. Geosearch de Commons alrededor de la coordenada del POI: archivos geoetiquetados dentro del
 *      radio y cuyo nombre mencione el POI. Alcanza archivos que no están en ninguna categoría del
 *      espacio. **Las coordenadas garantizan el sitio, no el sujeto**: en el radio de un POI hay
 *      fotos de mariposas y de otros elementos, así que se sigue exigiendo la mención por nombre,
 *      exactamente igual que en la vía 1.
 *   3. Buscador de archivos de Commons con el nombre del POI Y el del espacio o su municipio. Se
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
 *           --municipio <nombre> (afina la búsqueda del paso 3), --radio <m> (geosearch, 500 por
 *           defecto), --all (revisa también los POIs que ya tienen foto), --force (acepta candidatos
 *           `needsReview`), --width <px>, --dry-run.
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
const FOTO_FILE = path.join(__dirname, 'data', 'poi-foto.json');

const OPT = {
  park: arg('park', null),
  categoria: arg('categoria', null),
  municipio: arg('municipio', null),
  radio: num('radio', 500),
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
// La FAL (Licence Art Libre / Free Art License) es copyleft libre y Commons la acepta: permite obra
// derivada y uso comercial, que es lo único que esta lista comprueba. Entró al añadirse la lista
// blanca a las portadas de hábitat, donde cuatro portadas buenas de Commons la declaran.
const LICENCIA_LIBRE = /^(cc0|cc[ -]?by([ -]sa)?([ -]\d(\.\d)?)*( [a-z]{2})?|public domain|dominio p[úu]blico|pd([ -].*)?|no restrictions|fal([ -]\d(\.\d)?)?|free art license([ -]\d(\.\d)?)?|licen[cs]e art libre([ -]\d(\.\d)?)?)$/i;

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

// --- Archivo elegido a mano -------------------------------------------------------------------------
// data/poi-foto.json: { "<slug del espacio>": { "<id del POI>": "Nombre del archivo.jpg" } }
// Cuando hay varias fotos válidas del mismo sitio, el script se queda con la primera por orden
// alfabético, y eso no tiene por qué ser la mejor: cuál ilustra mejor un sitio es un juicio que una
// heurística sobre nombres de archivo no puede hacer. Esto lo deja anotado en el repositorio en vez
// de a mano en el `park.json`, que es lo que no se debe tocar. **No salta ninguna comprobación**: la
// licencia sigue siendo lista blanca y el archivo sigue teniendo que cargar.
const FOTO = readJsonIf(FOTO_FILE, {});

function fotoElegida(slug, poiId) {
  const delEspacio = FOTO[slug];
  const f = delEspacio && delEspacio[poiId];
  return typeof f === 'string' && f.trim() ? f.trim().replace(/^File:/, '') : null;
}

// --- Distancia ---------------------------------------------------------------------------------------
function metros(lat1, lon1, lat2, lon2) {
  const R = 6371000, rad = x => x * Math.PI / 180;
  const dLat = rad(lat2 - lat1), dLon = rad(lon2 - lon1);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
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

/**
 * Archivos geoetiquetados alrededor de la coordenada del POI, del más cercano al más lejano.
 *
 * Alcanza lo que la categoría no alcanza: un archivo puede no estar en ninguna categoría del espacio
 * y aun así llevar las coordenadas del sitio. Lo que NO hace es garantizar el sujeto —en 500 m de un
 * POI hay fotos de mariposas y de otros elementos—, así que quien llama sigue exigiendo la mención
 * por nombre. Devuelve `[{ file, dist }]`.
 */
async function geosearchDelPoi(coordenadas, radio) {
  if (!Array.isArray(coordenadas) || coordenadas.length !== 2) return [];
  const [lat, lon] = coordenadas;
  const j = await api(`${COMMONS}?action=query&list=geosearch&gscoord=${lat}|${lon}` +
    `&gsradius=${Math.max(10, Math.min(10000, radio))}&gsnamespace=6&gslimit=100&format=json&origin=*`);
  return (j?.query?.geosearch || [])
    .map(h => ({ file: String(h.title || '').replace(/^File:/, ''), dist: metros(lat, lon, h.lat, h.lon) }))
    .filter(h => usable(h.file))
    .sort((a, b) => a.dist - b.dist);
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
// Los nombres de fuente de foto que este repo sabe escribir en `source`. La lista existe para la
// IDEMPOTENCIA, no por gusto de enumerar: al reescribir un crédito hay que reconocer el anterior
// —venga de Commons o de cualquiera de las alternativas de `poi-images-alt.js`— y sustituirlo, en
// vez de encadenar uno detrás de otro hasta dejar el `source` ilegible.
const FUENTES_FOTO = ['Wikimedia Commons', 'Openverse', 'Flickr', 'Mapillary', 'Europeana', 'Geograph', 'iNaturalist'];
const CREDITO_PREVIO = new RegExp(';\\s*(?:' + FUENTES_FOTO.join('|') + ')[^;]*$', 'i');

function conCredito(source, meta, fuente = 'Wikimedia Commons') {
  const credito = `${fuente} (foto: ${meta.autor}, ${meta.licencia})`;
  const previo = String(source || '').trim();
  if (!previo) return credito;
  // Idempotencia: una segunda pasada no debe encadenar créditos. Si ya hay uno, se sustituye entero.
  if (CREDITO_PREVIO.test(previo)) return previo.replace(CREDITO_PREVIO, '').trim().replace(/[;.]$/, '') + '; ' + credito;
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

async function resuelvePoi(poi, { archivos, contexto, alias, elegidaAMano }) {
  const rechazosPrevios = [];
  const nombres = [poi.name, ...alias];

  // 0 · archivo elegido a mano. Pasa por las mismas comprobaciones que cualquier otro; si no las
  //     pasa, se anota y la cadena sigue como si no estuviera anotado.
  if (elegidaAMano) {
    const { elegida, rechazos } = await primeraValida([elegidaAMano], 'Archivo elegido a mano', false);
    if (elegida) return { elegida, rechazos };
    rechazosPrevios.push(...rechazos);
  }

  // 1 · dentro de la categoría del espacio, por nombre o por cualquiera de sus alias. Los alias solo
  //     valen aquí y en la vía 2: el sitio ya está garantizado (ver cabecera).
  const enCategoria = archivos.filter(f => mencionaAlguno(f, nombres));
  if (enCategoria.length) {
    const { elegida, rechazos } = await primeraValida(enCategoria, 'Categoría de Commons del espacio', false);
    if (elegida) {
      // Que la coincidencia haya salido por alias y no por el nombre del POI se dice en el informe:
      // es lo que hay que mirar si alguna vez una foto acaba en el POI equivocado.
      if (!mencionaSitio(elegida.file, poi.name)) elegida.via += ' (por alias)';
      return { elegida, rechazos: [...rechazosPrevios, ...rechazos] };
    }
    rechazosPrevios.push(...rechazos);
  }

  // 2 · geosearch alrededor del POI, exigiendo también la mención por nombre: las coordenadas dan el
  //     sitio y el nombre el sujeto, que es la misma pareja de garantías que la vía 1.
  const cerca = (await geosearchDelPoi(poi.coordinates, OPT.radio))
    .filter(h => !archivos.includes(h.file) && mencionaAlguno(h.file, nombres));
  if (cerca.length) {
    const { elegida, rechazos } = await primeraValida(cerca.map(h => h.file), 'Geosearch de Commons', false);
    if (elegida) {
      const hit = cerca.find(h => h.file === elegida.file);
      elegida.via += ` (a ${hit.dist} m)`;
      if (!mencionaSitio(elegida.file, poi.name)) elegida.via += ' (por alias)';
      return { elegida, rechazos: [...rechazosPrevios, ...rechazos] };
    }
    rechazosPrevios.push(...rechazos);
  }

  // 3 · buscador, con el espacio o el municipio como contexto. Siempre a revisar.
  const encontrados = await buscaEnCommons(poi.name, contexto);
  const { elegida, rechazos } = await primeraValida(encontrados, 'Búsqueda en Commons', true);
  return { elegida, rechazos: [...rechazosPrevios, ...rechazos] };
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
    const elegidaAMano = fotoElegida(entry.slug, poi.id);
    if (elegidaAMano) console.log(dim('    elegida a mano: ' + elegidaAMano));
    const res = await resuelvePoi(poi, { archivos, contexto, alias, elegidaAMano });
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
  }

  // El SQL se arma con lo que el `park.json` TIENE, no con lo que esta ejecución ha resuelto, y la
  // diferencia es un borrado en silencio contra la base de datos. Un POI que ya trae foto se salta
  // arriba (`tieneFoto && !OPT.all`), así que nunca llegaba a generar su UPDATE: la SEGUNDA vez que
  // se lanza el mismo comando —cuando ya no queda nada nuevo que resolver, que es el caso normal— el
  // fichero se reescribía entero con las poquísimas sentencias de esa pasada y perdía todas las
  // demás. Le pasó a `Database/poi-imagenes.sql` el 2026-08-17: de 18 UPDATE a 1, con la consola
  // diciendo «→ … (1 sentencia(s))» como si fuera lo esperado.
  //
  // El guardián de `--park` de más abajo no cubría esto, porque el caso no es narrar el fichero a un
  // espacio: es una ejecución COMPLETA que no resuelve nada. Con las sentencias tomadas del dato, el
  // fichero sale igual se resuelva algo o no, que es lo que hace falta de un volcado idempotente.
  if (OPT.sql) {
    for (const poi of pois) {
      if (!poi.image) continue;
      sentencias.push(`UPDATE points_of_interest SET image_url = ${sqlStr(poi.image)}, source = ${sqlStr(poi.source)} ` +
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

  // El informe tiene EXACTAMENTE el mismo problema que el SQL de abajo —se reescribe entero y con
  // `--park` se lleva por delante las filas de los demás espacios—, y durante un tiempo solo el SQL
  // estuvo protegido. Se notó el 2026-08-22 cerrando el N3 de Sierra de las Moreras: la guarda del
  // SQL cortó la ejecución, pero el informe YA se había escrito unas líneas antes y `Docs/fotos-poi.md`
  // pasó de 133 filas a 2. Aquí el daño no llega a la base de datos, así que en vez de abortar se
  // avisa y se conserva lo que había: un informe a medias es peor que uno viejo.
  if (OPT.report) {
    const file = fromRoot(OPT.report);
    const soloUno = OPT.park && fs.existsSync(file) &&
      (fs.readFileSync(file, 'utf8').match(/^\| ([a-z0-9-]+) \|/gm) || [])
        .map(m => m.slice(2, m.indexOf(' |', 2)))
        .some(s => s !== OPT.park);
    if (soloUno) {
      console.error(red(`\n✖ ${rel(file)} cubre más espacios y esta ejecución es solo de «${OPT.park}»:\n` +
        '  reescribirlo dejaría el informe con un solo espacio. NO se ha tocado.\n' +
        '  Quita `--park` para regenerarlo entero, o `--report` para no escribirlo.'));
    } else {
      escribeInforme(informe, file);
    }
  }
  if (OPT.sql && sentencias.length && !OPT.dryRun) {
    const file = fromRoot(OPT.sql);
    // El fichero de SQL es de TODOS los espacios y esta ejecución puede ser de uno solo: se
    // reescribe entero, así que con `--park` se llevaría por delante las sentencias de los demás.
    // Es un borrado en silencio de algo YA APLICADO en la base de datos —`Database/poi-imagenes.sql`
    // pasó de 19 sentencias a 1 el 2026-08-15 al resolver la foto de un solo espacio—, y desde la
    // consola no se ve: el script dice «→ … (1 sentencia)» y parece que ha ido bien.
    if (OPT.park && fs.existsSync(file)) {
      const previo = fs.readFileSync(file, 'utf8');
      const ajenas = (previo.match(/FROM parks WHERE slug = '([^']+)'/g) || [])
        .map(m => m.slice(m.indexOf("'") + 1, -1))
        .filter(s => s !== OPT.park);
      if (ajenas.length) {
        console.error(red(`\n✖ ${rel(file)} ya tiene ${new Set(ajenas).size} espacio(s) más ` +
          `(${[...new Set(ajenas)].join(', ')}) y esta ejecución es solo de «${OPT.park}»:\n` +
          '  escribirlo ahora los BORRARÍA, y es un fichero que se aplica contra la base de datos.\n' +
          '  Quita `--park` para regenerarlo entero, o dale a `--sql` una ruta propia de este espacio.'));
        process.exit(1);
      }
    }
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, '-- El juego de caracteres se fija SIEMPRE: el cliente `mysql` lo toma del entorno y en un\n-- contenedor sin locale eso es latin1, que convierte cada tilde en mojibake sin dar error.\nSET NAMES utf8mb4;\n-- Fotos de puntos de interés (poi-images.js)\n' + sentencias.join('\n') + '\n', 'utf8');
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
module.exports = { licenciaLibre, mencionaSitio, mencionaAlguno, aliasDe, fotoElegida, metros, conCredito, FUENTES_FOTO };
