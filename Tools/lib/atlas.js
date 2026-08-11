'use strict';
/*
 * atlas.js — lectura del «Atlas y Manual de los Hábitats Naturales y Seminaturales de España»
 * (MITECO, 2005) como fuente de ESPECIES CARACTERÍSTICAS por código HIC.
 *
 * El problema que resuelve
 * -----------------------
 * El Atlas solo existe en PDF, y de un PDF se saca texto de formas distintas según la herramienta.
 * El parser vivía dentro de `atlas-hic-especies.js` dando por hecho **un** formato concreto: el de
 * `pdftotext -layout`, que deja el encabezado «Especies características» y su lista de especies en
 * la MISMA línea. Con cualquier otro extractor —pypdf, por ejemplo, que es lo que hay disponible
 * cuando poppler no está instalado— el encabezado queda solo en su línea y la lista cae debajo.
 *
 * El resultado de esa diferencia no era un error: eran **cero especies características, en silencio**.
 * Es exactamente el modo de fallo que `CLAUDE.md` §2 llama «fallar en verde», y aquí duele el doble
 * porque `caracteristica` es el backbone determinista de la Capa 3 —el respaldo que le conserva la
 * plaza a una especie con pocos registros en GBIF—: sin él, la selección de un espacio pierde
 * especies oficiales y nada lo avisa.
 *
 * Por eso este módulo lee **los dos formatos** y, sobre todo, **se queja cuando no encuentra nada**:
 * un Atlas del que no sale ni una especie es un problema de lectura, no un hábitat sin flora.
 *
 * Vive en `lib/` porque lo necesitan dos herramientas: `atlas-hic-especies.js` (que cruza con el
 * catálogo ya escrito de un espacio) y `build-species-seleccion.js` (que lo cruza con los candidatos
 * de GBIF, antes de que el espacio tenga catálogo).
 */

const fs = require('fs');

// Un código HIC: cuatro dígitos (9340) o el formato con letra (92D0), con el asterisco opcional del
// Anexo I. El asterisco NO se usa aquí para decidir prioridad —eso sale de hic-prioritarios.json—,
// solo se tolera al reconocer el código.
const RE_CODIGO = /\b(\d{2}[A-Z]\d|\d{4})\*?\b/g;

// Encabezado del bloque. El texto que sigue en la misma línea es el formato de `pdftotext -layout`;
// si no hay nada, la lista viene en las líneas de debajo.
const RE_ENCABEZADO = /Especies características\s*(.*)$/;

// Dónde termina la lista de especies. Son los encabezados que el Atlas pone justo después del
// bloque, más los rótulos de la maquetación (cintillos, número de página, títulos de sección en
// versales) que la extracción sin layout intercala.
const RE_FIN = new RegExp([
  '^\\s*(Asociaciones que incluye|Descripci[óo]n|Distribuci[óo]n|Perfil ed[áa]fico|Especies',
  'Clase\\.|Orden\\.|Alianza\\.|CAR[ÁA]CTER|Atlas y Manual)',
].join('|'), 'i');

// Una línea que ya no es lista de especies: versales de sección («IA. VEGETACIÓN DE AGUAS DULCES»),
// una línea que empieza por un código de asociación fitosociológica, o una línea vacía.
const RE_NO_LISTA = /^\s*$|^\s*[IVX]+[A-Z]?\.\s|^\s*\d{6}\b|^\s*\d{1,3}\s*$/;

// Cuántas líneas puede ocupar la lista. Las hay largas de verdad: el bloque del 4090 enumera más de
// veinte taxones. El tope es solo la red por si faltara el encabezado de cierre; quien manda es
// RE_FIN.
const MAX_LINEAS_LISTA = 30;

// El punto final cierra la lista… salvo cuando es el de una abreviatura. El Atlas parte los renglones
// justo detrás de «subsp.», «var.» o «f.», y tomarse ese punto por el final del bloque dejaba la
// lista en su primera línea: es lo que hacía que el 4090 se quedara sin ninguna de sus especies.
const RE_ABREVIATURA = /\b(subsp|ssp|var|subvar|f|cf|aff|s\.\s*l|s\.\s*str)\.\s*$/i;

// Cuánto se mira hacia arriba buscando el código HIC del bloque. En el formato con layout el código
// estaba a ~12 líneas; sin layout la descripción se parte en más líneas cortas y se va a ~20.
const VENTANA_CODIGO = 22;

const limpia = (s) => String(s).replace(/\s+/g, ' ').replace(/[.;,]+$/, '').trim();

/**
 * Une las líneas de un bloque deshaciendo la partición por guion.
 * El Atlas parte los nombres a final de renglón («Chara galioi-» / «des»), y unir con espacio
 * produciría dos taxones inexistentes en vez de uno bueno.
 */
function uneLineas(lineas) {
  let out = '';
  for (const l of lineas) {
    const t = l.trim();
    if (!t) continue;
    if (out.endsWith('-')) out = out.slice(0, -1) + t;
    else out = out ? out + ' ' + t : t;
  }
  return out;
}

/**
 * Parte el texto del bloque en nombres científicos.
 * Se exige «Género epíteto» con género capitalizado: es lo que descarta los restos de maquetación
 * que se cuelan en la misma línea.
 */
function parteEspecies(bloque) {
  return bloque
    .split(/,|;| y (?=[A-Z])/)
    .map(limpia)
    .filter((x) => /^[A-ZÁÉÍÓÚ][a-záéíóúü-]+ [a-z]/.test(x))
    .filter((v, i, a) => a.indexOf(v) === i);
}

/**
 * Código HIC al que pertenece el bloque que empieza en `idx`: el más cercano hacia arriba que esté
 * en la lista de códigos que interesan y que encabece su línea seguido de texto (así se descarta un
 * número que aparezca suelto dentro de una descripción).
 */
function codigoMasCercano(lineas, idx, codigos) {
  for (let i = idx; i >= 0 && i > idx - VENTANA_CODIGO; i--) {
    const l = lineas[i];
    let m, encontrado = null;
    RE_CODIGO.lastIndex = 0;
    while ((m = RE_CODIGO.exec(l))) if (codigos.has(m[1])) encontrado = m[1];
    if (encontrado && new RegExp(encontrado + '\\*?\\s+[A-Za-zÁÉÍÓÚÑ]').test(l)) return encontrado;
  }
  return null;
}

/** Recoge el texto de la lista de especies de un bloque, venga en la misma línea o debajo. */
function textoDelBloque(lineas, idx, restoDeLaLinea) {
  if (restoDeLaLinea && restoDeLaLinea.trim()) return restoDeLaLinea;
  const acc = [];
  for (let i = idx + 1; i < lineas.length && acc.length < MAX_LINEAS_LISTA; i++) {
    const l = lineas[i];
    if (RE_FIN.test(l) || RE_NO_LISTA.test(l)) break;
    acc.push(l);
    if (/\.\s*$/.test(l) && !RE_ABREVIATURA.test(l)) break; // el bloque cierra con punto
  }
  return uneLineas(acc);
}

/**
 * Especies características por código HIC.
 *
 * @param {string} ruta        fichero de texto del Atlas (pdftotext, pypdf… da igual).
 * @param {Iterable<string>} codigosHic  códigos que interesan; el resto del Atlas se ignora.
 * @returns {{porHic: Map<string, Set<string>>, bloques: number, bloquesConEspecies: number}}
 */
function especiesCaracteristicas(ruta, codigosHic) {
  const codigos = new Set(codigosHic);
  const lineas = fs.readFileSync(ruta, 'utf8').split(/\r?\n/);
  const porHic = new Map();
  for (const c of codigos) porHic.set(c, new Set());

  let bloques = 0, bloquesConEspecies = 0;
  for (let i = 0; i < lineas.length; i++) {
    const m = lineas[i].match(RE_ENCABEZADO);
    if (!m) continue;
    bloques++;
    const codigo = codigoMasCercano(lineas, i, codigos);
    if (!codigo) continue;
    const especies = parteEspecies(textoDelBloque(lineas, i, m[1]));
    if (especies.length) bloquesConEspecies++;
    for (const sp of especies) porHic.get(codigo).add(sp);
  }
  return { porHic, bloques, bloquesConEspecies };
}

/**
 * Binomio normalizado para comparar nombres entre fuentes: género + raíz del epíteto, sin la
 * desinencia latina que cambia con el género gramatical del género botánico
 * (*Sedum sediforme* / *Sedum sediformis*). Es la misma clave con la que se cruzaban Atlas y
 * catálogo antes de que esto viviera en `lib/`.
 */
function binomio(nombre) {
  const w = String(nombre).trim().split(/\s+/);
  if (w.length < 2) return null;
  const g = w[0].toLowerCase().replace(/[^a-záéíóúü-]/g, '');
  const ep = w[1].toLowerCase().replace(/[^a-záéíóúü-]/g, '').replace(/(us|um|a|os|as|is|e)$/, '');
  return g + ' ' + ep;
}

module.exports = { especiesCaracteristicas, binomio };
