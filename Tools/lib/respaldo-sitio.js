'use strict';
/*
 * respaldo-sitio.js — decide si una especie tiene RESPALDO DE SITIO, y lo hace sin perder por el
 * camino las que sí lo tienen pero se llaman de otra forma.
 *
 * El problema que resuelve
 * -----------------------
 * «Respaldo de sitio» es la única evidencia que afirma que una especie pertenece a ESTE espacio, y
 * desde el filtro 3 bis es la puerta de entrada de las aves (ver `build-species-seleccion.js`). Sale
 * de dos fuentes, las dos por escrito y las dos oficiales:
 *
 *   · el Formulario Normalizado de Datos del sitio Red Natura 2000 (`especies-sitio-rn2000.js`),
 *   · el anexo normativo del PORN/PRUG/decreto del espacio (`data/anexos-normativos.json`).
 *
 * Las dos se cruzan con el catálogo POR NOMBRE, y ahí está la trampa: **el nombre de la fuente y el
 * nombre del catálogo son de épocas distintas.** El formulario del sitio ES0000269 declara *Sylvia
 * undata*; el catálogo la ficha como *Curruca undata*, que es como la sirve GBIF desde que las
 * currucas se separaron de *Sylvia*. Son la misma curruca rabilarga. Cruzar a pelo da CERO, y el
 * resultado no es un error: es un ave que el formulario declara expresamente y que la puerta deja
 * fuera **en silencio**, con el motivo «no figura en el formulario oficial del sitio» escrito al lado.
 *
 * Medido sobre los ocho espacios publicados: de las 82 aves que los formularios declaran, 11 no
 * casaban por nombre. Cuatro las cierra EIDOS resolviendo el nombre de la FUENTE (no el del
 * catálogo, que es lo que se hacía). Las otras siete hay que mirarlas una a una: cinco son huecos de
 * verdad —el sitio la declara y el barrido no la ha visto— y dos son la misma ave con dos nombres
 * que ninguna autoridad reconcilia sola.
 *
 * Por qué el puente NO puede ser automático del todo
 * --------------------------------------------------
 * La tentación es casar por epíteto: *Sylvia undata* ↔ *Curruca undata*, mismo epíteto, listo. Sobre
 * estos ocho espacios eso propone nueve pares y **tres son falsos**:
 *
 *   · *Calandrella brachydactyla* (terrera común) ↔ *Certhia brachydactyla* (agateador común)
 *   · *Melanocorypha calandra* (calandria) ↔ *Emberiza calandra* (triguero)
 *   · *Saxicola torquatus* (tarabilla) ↔ *Turdus torquatus* (mirlo capiblanco)
 *
 * Y además **pierde el par verdadero** de ese último caso, que es *Saxicola torquatus* ↔ *Saxicola
 * rubicola*: el epíteto no se parece en nada. O sea que la heurística acierta dos tercios, y los
 * fallos son fusiones de especies distintas, que es el peor dato posible en un catálogo.
 *
 * Así que el puente son tres capas, en este orden y con esta jerarquía:
 *
 *   1. BINOMIO del nombre verbatim de la fuente (que ya normaliza la terminación de género:
 *      «torquatus»/«torquata» dan la misma clave).
 *   2. NOMBRE ACEPTADO EN EIDOS del nombre de la fuente, y su `taxonid`. Esto es lo que cierra
 *      *Larus ridibundus* → *Chroicocephalus ridibundus*, *Catharacta skua* → *Stercorarius skua* y
 *      las *Sylvia* que EIDOS sí ha movido a *Curruca*.
 *   3. TABLA DE EQUIVALENCIAS VERIFICADAS A MANO (`data/equivalencias-nomenclatura.json`), solo para
 *      lo que las dos capas anteriores no cierran, con su fuente y su fecha. Es el mismo mecanismo
 *      que el `nombreCorregido` del anexo normativo, y por el mismo motivo.
 *
 * Y lo que ninguna de las tres cierra NO se adivina: sale en el informe como hueco, con la lista de
 * pares que la heurística de epíteto propondría marcada como «a verificar», nunca aplicada. Ese es
 * el trabajo humano que da de alta una entrada en la tabla, y es de diez minutos.
 */
const fs = require('fs');
const path = require('path');
const { binomio } = require('./atlas');
const { CATALOGO_DIR, readJson } = require('./io');

const RUTA_EQUIVALENCIAS = path.join(CATALOGO_DIR, 'data', 'equivalencias-nomenclatura.json');

/**
 * La tabla de equivalencias verificadas a mano, indexada por el binomio del nombre de la FUENTE.
 * Devuelve también `consultada: false` cuando el fichero no existe, para poder decirlo en vez de
 * comportarse como si estuviera vacío.
 */
function cargaEquivalencias(ruta = RUTA_EQUIVALENCIAS) {
  if (!fs.existsSync(ruta)) return { mapa: new Map(), consultada: false, total: 0 };
  const doc = readJson(ruta);
  const mapa = new Map();
  for (const e of doc.equivalencias || []) {
    const b = binomio(e.nombreEnLaFuente);
    if (!b) continue;
    mapa.set(b, e);
  }
  return { mapa, consultada: true, total: (doc.equivalencias || []).length, fuente: doc._fuente || null };
}

/**
 * Todas las claves con las que hay que indexar un nombre de la fuente para que el cruce con el
 * catálogo no dependa de la época en que se redactó el documento.
 *
 * `nombreAceptado` es lo que devuelve EIDOS al resolver el nombre DE LA FUENTE. Se pide como
 * parámetro y no se resuelve aquí porque salir a EIDOS es asíncrono y con caché: quién y cuándo lo
 * hace es decisión del llamante, que es quien tiene la caché del espacio.
 */
function clavesDe(nombre, { nombreAceptado = null, equivalencias = null } = {}) {
  const claves = new Set();
  const b = binomio(nombre);
  if (b) claves.add(b);
  // El nombre de la fuente puede venir con salvedades entre paréntesis —«Falco peregrinus
  // ([including pelegrinoides])», «Sylvia cantillans ([excluding subalpina])»— y también como
  // trinomio de subespecie. `binomio()` se queda con las dos primeras palabras, así que el trinomio
  // ya cae solo; el paréntesis, cuando abre en la tercera palabra, también.
  const bAcept = binomio(nombreAceptado || '');
  if (bAcept) claves.add(bAcept);
  const equiv = equivalencias && [...claves].map(k => equivalencias.get(k)).find(Boolean);
  if (equiv) {
    const be = binomio(equiv.nombreEnElCatalogo);
    if (be) claves.add(be);
  }
  return claves;
}

/**
 * Indexa una lista de entradas de fuente (formulario del sitio o anexo) por TODAS sus claves.
 *
 * `resueltas` es un Map nombreDeLaFuente → { acceptedName, taxonid } con lo que EIDOS haya
 * devuelto; puede venir vacío, y entonces el puente se queda en la capa 1 y la 3, que es
 * exactamente lo que hay que poder decir en el informe.
 */
function indexa(entradas, { nombreDe, resueltas = new Map(), equivalencias = null } = {}) {
  const mapa = new Map();
  const puentes = [];
  for (const e of entradas) {
    const nombre = nombreDe(e);
    if (!nombre) continue;
    const r = resueltas.get(nombre) || {};
    const claves = clavesDe(nombre, { nombreAceptado: r.acceptedName, equivalencias });
    const directa = binomio(nombre);
    for (const k of claves) {
      if (!mapa.has(k)) mapa.set(k, []);
      mapa.get(k).push(e);
      // Qué claves NO son la del nombre verbatim: son los puentes que se han tenido que tender, y
      // hay que poder enseñarlos. Un puente que nadie ve es un puente que nadie revisa.
      if (k !== directa) puentes.push({ nombre, clave: k, via: r.acceptedName && binomio(r.acceptedName) === k ? 'EIDOS' : 'tabla' });
    }
    if (r.taxonid) {
      const k = 'taxonid:' + r.taxonid;
      if (!mapa.has(k)) mapa.set(k, []);
      mapa.get(k).push(e);
    }
  }
  return { mapa, puentes };
}

/** Busca una especie del catálogo en un índice, por sus propias claves. */
function busca(mapa, { scientificName, nombreAceptado = null, eidosTaxonId = null }) {
  const claves = [binomio(scientificName), binomio(nombreAceptado || '')].filter(Boolean);
  if (eidosTaxonId != null) claves.push('taxonid:' + eidosTaxonId);
  for (const k of claves) {
    const hit = mapa.get(k);
    if (hit && hit.length) return hit;
  }
  return null;
}

/*
 * El epíteto específico, para la heurística de cambio de género. Se calcula sobre el binomio ya
 * normalizado, así que «torquatus» y «torquata» son el mismo epíteto — que es justo lo que hace
 * falta para reconocer las variantes de género de las normas antiguas.
 */
function epiteto(nombre) {
  const b = binomio(nombre);
  return b ? b.split(' ')[1] : null;
}

/**
 * Los pares que un humano tiene que mirar: lo que la fuente declara y no ha casado, junto a los
 * candidatos del catálogo con el mismo epíteto.
 *
 * **Esto NO se aplica nunca.** Es una lista para el informe. Tres de los nueve pares que propone
 * sobre los espacios ya publicados son especies distintas (ver la cabecera), así que aplicarlo sin
 * mirar fusionaría fichas de aves que no tienen nada que ver.
 */
function probablesCambiosDeGenero(sinCasar, candidatos, { nombreDe = e => e.scientificName } = {}) {
  const porEpiteto = new Map();
  for (const c of candidatos) {
    const e = epiteto(c.scientificName || c);
    if (!e) continue;
    if (!porEpiteto.has(e)) porEpiteto.set(e, []);
    porEpiteto.get(e).push(c.scientificName || c);
  }
  const salida = [];
  for (const s of sinCasar) {
    const nombre = nombreDe(s);
    const e = epiteto(nombre);
    if (!e) continue;
    const cand = (porEpiteto.get(e) || []).filter(n => binomio(n) !== binomio(nombre));
    if (cand.length) salida.push({ nombreEnLaFuente: nombre, candidatos: cand });
  }
  return salida;
}

module.exports = {
  RUTA_EQUIVALENCIAS, cargaEquivalencias, clavesDe, indexa, busca, epiteto,
  probablesCambiosDeGenero, binomio,
};
