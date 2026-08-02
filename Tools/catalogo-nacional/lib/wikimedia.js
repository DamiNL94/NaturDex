/*
 * lib/wikimedia.js — resolución de la foto de un taxón contra Wikimedia (Wikidata + Wikipedia +
 * Commons), compartida por los scripts que asignan fotos al catálogo.
 *
 * La usan:
 *   - wikimedia-images.js   (fotos de las especies de cada park.json)
 *   - invasoras-images.js   (fotos de las especies exóticas invasoras, catálogo nacional)
 *
 * Está aquí y no duplicada en cada script porque lo delicado no es pedir la foto, sino DESCARTAR la
 * que no sirve: mapas de distribución, láminas del XIX, pliegos de herbario y —sobre todo— fotos de
 * otra especie del mismo género. Ese criterio tiene que ser el mismo para todo el catálogo.
 *
 * Cadena de resolución (de más fiable a menos)
 * --------------------------------------------
 *   1. Wikidata por declaración exacta: `haswbstatement:P225="<nombre científico>"` → imagen P18.
 *      Es la vía buena: P225 es el nombre del taxón, así que la foto es del taxón correcto.
 *   2. Wikidata del taxón padre no se usa nunca (daría foto de otra especie).
 *   3. Artículo de Wikipedia (es → en → ca) enlazado desde ese elemento: imagen principal.
 *   4. Categoría de Commons del taxón (`Category:<nombre científico>`): primer archivo utilizable.
 *   5. Búsqueda de archivos en Commons por nombre científico. Se marca `needsReview` porque el
 *      buscador puede devolver un archivo de otra especie del mismo género.
 *
 * Siempre se devuelve la URL canónica `commons.wikimedia.org/wiki/Special:FilePath/Archivo.jpg`
 * (redirección de MediaWiki: sobrevive a renombrados y no se rate-limita como el thumb), y se
 * comprueba que devuelve de verdad una imagen antes de darla por buena.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const FRONTEND = path.join(__dirname, '..', '..', '..', 'Frontend');
const UA = 'NaturDexBot/1.0 (https://naturdex.app; catálogo naturalista sin ánimo de lucro)';

// Wikimedia pide identificarse y no martillear. Una petición cada 120 ms y sin paralelismo sobre
// el mismo host mantiene el 429 lejos.
const THROTTLE_MS = 120;
let lastCall = 0;

const sleep = ms => new Promise(r => setTimeout(r, ms));

// --- utilidades de red ---------------------------------------------------------------------------
async function api(url) {
  const wait = THROTTLE_MS - (Date.now() - lastCall);
  if (wait > 0) await sleep(wait);
  lastCall = Date.now();
  for (let intento = 1; intento <= 3; intento++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA, 'Accept': 'application/json' } });
      if (r.status === 429) { await sleep(1500 * intento); continue; }
      if (!r.ok) return null;
      return await r.json();
    } catch (e) {
      if (intento === 3) return null;
      await sleep(600 * intento);
    }
  }
  return null;
}

// ¿La URL devuelve de verdad una imagen? (no basta con que el registro exista). Una ruta relativa
// se interpreta como fichero del propio repo (Frontend/Img/...).
async function loads(url) {
  if (!url) return false;
  if (!/^https?:/i.test(url)) return fs.existsSync(path.join(FRONTEND, url));
  const wait = THROTTLE_MS - (Date.now() - lastCall);
  if (wait > 0) await sleep(wait);
  lastCall = Date.now();
  // Paciencia larga a propósito: un 429 aquí NO significa "la foto no sirve", pero si se
  // interpretara así se descartaría una candidata buena (la de Wikidata/Wikipedia) y se acabaría
  // eligiendo la mala de más abajo en la cadena. Antes pasaba: por eso el jabalí acabó con una
  // postal de 1898.
  for (let intento = 1; intento <= 6; intento++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA, 'Accept': 'image/*,*/*' }, redirect: 'follow' });
      if (r.status === 429) { await sleep(2500 * intento); continue; }
      if (!r.ok) return false;
      if (!/^image\//i.test(r.headers.get('content-type') || '')) return false;
      const buf = await r.arrayBuffer();
      return buf.byteLength > 2000;   // los "placeholder" y errores HTML disfrazados son diminutos
    } catch (e) {
      if (intento === 6) return false;
      await sleep(800 * intento);
    }
  }
  return false;
}

// --- filtros de archivo --------------------------------------------------------------------------
// Un mapa de distribución, una figura de artículo o un diagrama no sirven como foto de la ficha.
// Las categorías de Commons de muchas especies mezclan la foto con su mapa de área ("…_area.png",
// "Verbreitung…", "…range map…"), así que hay que descartarlos por nombre antes de elegir.
// Se descartan también las láminas botánicas y grabados históricos (Köhler, Sturm, Flora Batava,
// «ecloga», «pl. 07»…): son de dominio público y por eso salen las primeras en muchas categorías,
// pero en una ficha de campo un dibujo del XIX no ayuda a reconocer la planta.
const NO_FOTO = /(distribut|distribucion|distribución|\brange\b|_area|[_ ]areal|verbreitung|r[ée]partition|\bmapa\b|\bmap\b|karte|locator|iucn|status|\bskeleton\b|\bskull\b|cranium|coat[_ ]of[_ ]arms|logo|icon|chart|diagram|graph|stamp|sello|^\d{2}-\d{4}-|illustration|medizinal.?pflanzen|k[oö]hler|\bsturm\b|flora[_ ]batava|ecloga|\bpl\.?[_ ]?\d|\btab\.?[_ ]?\d|lithograph|engraving|planche|nypl|\bdrawing\b|\bplate\b|herbarium|herbier|\bsheet\b|specimen|^[A-Z]{1,4}\d{5,}|\.svg$|\.ogg$|\.ogv$|\.webm$|\.pdf$|\.tiff?$)/i;
const EXT_OK = /\.(jpe?g|png|webp)$/i;

// El nombre de archivo de Commons usa `_` como separador, y `_` es carácter de palabra: sin
// normalizarlo, `\bplate\b` NO casa con "…(Plate_16)…" y las láminas del XIX se colaban igual
// (pasó con Ammochloa palaestina, ilustrada con una plancha de la Flora Atlantica de 1798).
// Las láminas de libro escaneadas por bibliotecas suelen enumerar VARIAS especies en el propio
// nombre del archivo ("Botanique. 1. Balsamita tridentata; 2. Filago mareotica; 3. …"): esa
// numeración con punto y coma es la firma de una plancha, no de una foto de campo.
const LAMINA_MULTIPLE = /\d\.\s*[A-Z][a-z]+\s+[A-Za-z]+\s*[.;]\s*\d\./;
const usable = name => {
  if (!name || !EXT_OK.test(name)) return false;
  const plano = String(name).replace(/[_\-().,]/g, ' ');
  if (LAMINA_MULTIPLE.test(String(name).replace(/_/g, ' '))) return false;
  return !NO_FOTO.test(name) && !NO_FOTO.test(plano);
};

// ¿El nombre del archivo menciona el binomio (o al menos el género)? Un archivo de la categoría de
// un taxón que se llama "10-0002-F1.png" es casi siempre una figura de artículo, no una foto.
function mencionaTaxon(fileName, scientificName) {
  const plano = fileName.toLowerCase().replace(/[_-]/g, ' ');
  const [genero, especie] = scientificName.toLowerCase().split(' ');
  return plano.includes(genero) || (especie && plano.includes(especie));
}

// Más estricto: el nombre menciona género Y epíteto como palabras completas. «melanantherum» no
// cuela por «melananthum», que es lo que hacía elegir la especie equivocada.
function mencionaBinomio(fileName, scientificName) {
  const plano = ' ' + fileName.toLowerCase().replace(/[_\-().,]/g, ' ').replace(/\s+/g, ' ') + ' ';
  const [genero, especie] = scientificName.toLowerCase().split(' ');
  // El epíteto puede llevar pegado el número de serie del autor ("…melananthum02.jpg"), pero no
  // puede continuar con letras ("melanantherum" es otra especie).
  const palabra = p => new RegExp('\\s' + p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\d*\\s').test(plano);
  if (!especie) return palabra(genero);
  return palabra(genero) && palabra(especie);
}

// El archivo nombra al MISMO género con OTRO epíteto: es la foto de otra especie, no de ésta.
// Pasa cuando el artículo pedido redirige al género (`redirects=1`) y el género es un homónimo de
// otro reino: "Sphenopus divaricatus" es una gramínea, pero el artículo `Sphenopus` de la
// Viquipèdia es el del zoantario, ilustrado con "Sphenopus_marsupialis.jpg".
function otraEspecieDelGenero(fileName, scientificName) {
  const [genero, especie] = String(scientificName).toLowerCase().split(' ');
  if (!especie) return false;
  const plano = String(fileName).toLowerCase().replace(/[_\-().,]/g, ' ').replace(/\s+/g, ' ');
  const m = plano.match(new RegExp('\\b' + genero + '\\s+([a-z]{4,})\\b'));
  return !!m && m[1] !== especie;
}

// --- Wikimedia -----------------------------------------------------------------------------------
const WD = 'https://www.wikidata.org/w/api.php';
const COMMONS = 'https://commons.wikimedia.org/w/api.php';

// Elemento de Wikidata cuyo "nombre del taxón" (P225) es exactamente el nombre científico.
async function wikidataTaxon(scientificName) {
  const q = `${WD}?action=query&list=search&srsearch=${encodeURIComponent(`haswbstatement:P225="${scientificName}"`)}&srlimit=3&format=json&origin=*`;
  const j = await api(q);
  const hits = j?.query?.search || [];
  if (!hits.length) return null;
  const ids = hits.map(h => h.title).join('|');
  const e = await api(`${WD}?action=wbgetentities&ids=${ids}&props=claims|sitelinks&format=json`);
  const ents = e?.entities || {};
  // Preferimos el que además tenga P18; si ninguno la tiene devolvemos el primero (por los sitelinks).
  const lista = hits.map(h => ents[h.title]).filter(Boolean);
  return lista.find(x => x?.claims?.P18?.length) || lista[0] || null;
}

function p18Files(entity) {
  return (entity?.claims?.P18 || [])
    .map(c => c?.mainsnak?.datavalue?.value)
    .filter(usable);
}

// Imagen principal del artículo de Wikipedia enlazado (es → en → ca).
async function wikipediaLead(entity) {
  const links = entity?.sitelinks || {};
  for (const wiki of ['eswiki', 'enwiki', 'cawiki', 'frwiki', 'dewiki']) {
    const title = links[wiki]?.title;
    if (!title) continue;
    const host = wiki.replace('wiki', '') + '.wikipedia.org';
    const j = await api(`https://${host}/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&piprop=original|name&format=json&origin=*`);
    const page = Object.values(j?.query?.pages || {})[0];
    const name = page?.pageimage;
    if (usable(name)) return { file: name, via: `Wikipedia (${wiki.replace('wiki', '')})` };
  }
  return null;
}

// Imagen principal del artículo de Wikipedia buscado DIRECTAMENTE por nombre científico, sin pasar
// por Wikidata. Hace falta porque no todos los taxones tienen un elemento con P225: `Sus scrofa`,
// por ejemplo, no aparece en `haswbstatement:P225`, y sin este paso se caía a la categoría de
// Commons (cuyo primer archivo alfabético era una postal de 1898).
async function wikipediaPorNombre(scientificName) {
  for (const host of ['es.wikipedia.org', 'en.wikipedia.org', 'ca.wikipedia.org']) {
    const j = await api(`https://${host}/w/api.php?action=query&titles=${encodeURIComponent(scientificName)}&redirects=1&prop=pageimages&piprop=original|name&format=json&origin=*`);
    const page = Object.values(j?.query?.pages || {})[0];
    const name = page?.pageimage;
    // `redirects=1` puede llevar del binomio al artículo del GÉNERO: si la foto de portada es de
    // otra especie del mismo género, no vale.
    if (usable(name) && !otraEspecieDelGenero(name, scientificName)) {
      return { file: name, via: `Wikipedia (${host.split('.')[0]})` };
    }
  }
  return null;
}

// Primer archivo utilizable de la categoría de Commons del taxón.
async function commonsCategory(scientificName) {
  const j = await api(`${COMMONS}?action=query&list=categorymembers&cmtitle=${encodeURIComponent('Category:' + scientificName)}&cmtype=file&cmlimit=20&format=json&origin=*`);
  const members = (j?.query?.categorymembers || [])
    .map(m => String(m.title || '').replace(/^File:/, ''))
    .filter(usable);
  // Las categorías salen en orden alfabético, y ese orden no tiene nada que ver con la calidad: en
  // «Category:Sus scrofa» los primeros son postales de 1898, y en «Category:Allium melananthum» hay
  // fotos de *A. melanantherum* (otra especie, de los Balcanes) antes que las del taxón correcto.
  // Por eso se ordena: primero binomio exacto, luego solo el género, y lo demás al final.
  const binomio = members.filter(n => mencionaBinomio(n, scientificName));
  const soloGenero = members.filter(n => !binomio.includes(n) && mencionaTaxon(n, scientificName));
  const elegido = binomio[0] || soloGenero[0] || members[0];
  if (!elegido) return null;
  return { file: elegido, via: 'Categoría de Commons', needsReview: !binomio.includes(elegido) };
}

// Último recurso: buscador de archivos de Commons. Puede traer otra especie del género → a revisar.
async function commonsSearch(scientificName) {
  const j = await api(`${COMMONS}?action=query&list=search&srsearch=${encodeURIComponent(scientificName)}&srnamespace=6&srlimit=10&format=json&origin=*`);
  for (const hit of (j?.query?.search || [])) {
    const name = String(hit.title || '').replace(/^File:/, '');
    // Aquí sí se exige el binomio completo (género Y epíteto): el buscador devuelve cualquier cosa
    // que mencione el género, y eso traería la foto de otra especie.
    const especie = scientificName.toLowerCase().split(' ')[1];
    const plano = name.toLowerCase().replace(/[_-]/g, ' ');
    if (!usable(name)) continue;
    if (!mencionaTaxon(name, scientificName) || (especie && !plano.includes(especie))) continue;
    return { file: name, via: 'Búsqueda en Commons', needsReview: true };
  }
  return null;
}

// Limpia el HTML que Commons devuelve en Artist/LicenseShortName.
function texto(html) {
  return String(html || '')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

// Autor + licencia desde la ficha del archivo en Commons.
async function metadatos(file) {
  const j = await api(`${COMMONS}?action=query&titles=${encodeURIComponent('File:' + file)}&prop=imageinfo&iiprop=extmetadata|size|url&format=json&origin=*`);
  const page = Object.values(j?.query?.pages || {})[0];
  const info = page?.imageinfo?.[0];
  if (!info) return null;
  const meta = info.extmetadata || {};
  const licencia = texto(meta.LicenseShortName?.value) || texto(meta.License?.value) || 'licencia sin especificar';
  let autor = texto(meta.Artist?.value) || texto(meta.Credit?.value) || 'autor no indicado';
  if (autor.length > 70) autor = autor.slice(0, 67) + '…';
  return { autor, licencia, width: info.width, height: info.height };
}

/** Crédito en el formato del catálogo: «Autor (licencia) · Wikimedia Commons». */
const atribucion = meta => `${meta.autor} (${meta.licencia}) · Wikimedia Commons`;

const filePathUrl = (file, width) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file.replace(/ /g, '_'))}?width=${width}`;

// Nombre del archivo de Commons a partir de cualquier URL de Wikimedia:
//   upload…/commons/thumb/f/f8/Archivo.jpg/640px-Archivo.jpg  → Archivo.jpg   (derivado cacheado)
//   upload…/commons/c/c3/Archivo.JPG                          → Archivo.JPG   (original)
//   commons…/wiki/Special:FilePath/Archivo.jpg?width=800      → Archivo.jpg   (ya canónica)
function commonsFileFromUrl(url) {
  if (!url || !/^https?:\/\/(upload|commons)\.wikimedia\.org/i.test(url)) return null;
  const sinQuery = url.split('?')[0];
  const especial = sinQuery.match(/Special:FilePath\/(.+)$/i);
  if (especial) return decodeURIComponent(especial[1]);
  const partes = sinQuery.split('/');
  const idxThumb = partes.indexOf('thumb');
  // En un thumb el original es el penúltimo segmento; en una URL directa, el último.
  const nombre = idxThumb >= 0 ? partes[partes.length - 2] : partes[partes.length - 1];
  return nombre ? decodeURIComponent(nombre) : null;
}

// Nota sobre la FORMA de la foto: la portada de la ficha es apaisada y muchas de estas fotos son
// verticales, así que se ven entre dos franjas de fondo. Se probó a preferir una candidata apaisada
// y se descartó: para encontrarla hay que bajar hasta el buscador de Commons, que es el último
// eslabón de la cadena y el único que puede devolver otra especie del género. Antes una foto
// vertical y segura que una apaisada sin verificar.
/**
 * Mejor foto disponible para un nombre científico, ya verificada (la URL carga y devuelve imagen).
 * @param {string} scientificName
 * @param {number} width  Ancho pedido a Special:FilePath.
 * @returns {Promise<{url,file,via,needsReview,attribution,width,height}|null>}
 */
async function resolver(scientificName, width = 1280) {
  const entity = await wikidataTaxon(scientificName);

  const candidatos = [];
  for (const f of p18Files(entity)) candidatos.push({ file: f, via: 'Wikidata P18' });
  if (entity) { const w = await wikipediaLead(entity); if (w) candidatos.push(w); }
  const wp = await wikipediaPorNombre(scientificName); if (wp) candidatos.push(wp);
  const cat = await commonsCategory(scientificName); if (cat) candidatos.push(cat);
  const bus = await commonsSearch(scientificName); if (bus) candidatos.push(bus);

  for (const c of candidatos) {
    const url = filePathUrl(c.file, width);
    if (!(await loads(url))) continue;
    const meta = await metadatos(c.file);
    if (!meta) continue;
    return {
      url,
      file: c.file,
      via: c.via,
      needsReview: !!c.needsReview,
      attribution: atribucion(meta),
      width: meta.width,
      height: meta.height,
    };
  }
  return null;
}

module.exports = {
  UA, api, loads, usable, metadatos, atribucion, filePathUrl, commonsFileFromUrl, resolver,
};
