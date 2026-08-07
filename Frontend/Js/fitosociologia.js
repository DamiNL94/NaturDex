// ================================================================================================
// fitosociologia.js — traduce al lenguaje llano la asociación fitosociológica de un hábitat.
// ------------------------------------------------------------------------------------------------
// La ficha de hábitat mostraba la cita oficial tal cual («Rhamno lycioidis-Quercetum cocciferae
// Br.-Bl. & O. Bolòs 1954») y nada más. Es dato oficial de la Cartografía de Hábitats (MITECO) y no
// se toca, pero a quien no es botánico no le dice nada: ni qué plantas son, ni qué paisaje describe,
// ni por qué lleva pegado un apellido y un año.
//
// Este módulo NO sustituye la cita: la parte en dos. El nombre latino se acompaña de su lectura en
// llano y de las plantas que lo forman; la autoría —autores, año, `in`, `ex`, `corr.`— se conserva
// entera porque es la referencia bibliográfica que permite rastrear el dato hasta su publicación.
//
// Datos: Frontend/Data/fitosociologia.json, generado por Tools/sync-habitat-catalog.js --apply
// desde Tools/catalogo-nacional/data/contenido/fitosociologia.json.
// ================================================================================================

let DICT = null;      // { explicacion, asociaciones: { "<nombre latino>": {...} } }
let CLAVES = [];      // claves ordenadas de más larga a más corta (ver `explicaAsociacion`)

// Carga el diccionario una sola vez, en el arranque del parque (app.js), junto al glosario. Si falla
// —sin conexión y sin cachear todavía— la ficha sigue mostrando la cita oficial completa, que es el
// dato; lo único que se pierde es la explicación.
export async function loadFitosociologia() {
  if (DICT) return DICT;
  try {
    DICT = (await NaturDexOffline.fetchJsonCached('Data/fitosociologia.json')).data;
    CLAVES = Object.keys(DICT.asociaciones || {}).sort((a, b) => b.length - a.length);
  } catch (e) {
    DICT = { explicacion: null, asociaciones: {} };
    CLAVES = [];
  }
  return DICT;
}

/** El texto introductorio («qué es una asociación fitosociológica»), o null si no cargó. */
export function explicacionFitosociologia() {
  return (DICT && DICT.explicacion) || null;
}

/**
 * Descompone una cita oficial en sus dos mitades y le añade la lectura en llano.
 *
 * El diccionario está indexado por el NOMBRE LATINO SIN AUTORÍA, que es la parte estable: la misma
 * asociación aparece en la cartografía con la autoría corregida («corr. …»), ampliada o con una nota
 * entre paréntesis. Por eso se busca la clave más larga que sea prefijo de la cadena: así
 * «Rhamno lycioidis-Quercetum cocciferae» gana a cualquier clave más corta que también encaje, y lo
 * que quede detrás es exactamente la cita bibliográfica.
 *
 * Devuelve siempre un objeto utilizable: si no hay entrada, `nombre` y `lectura` van a null y la
 * cadena entera se muestra como cita, que es como se mostraba antes de existir este módulo.
 */
export function explicaAsociacion(cadena) {
  const texto = String(cadena || '').trim();
  const clave = CLAVES.find(k => texto.startsWith(k));
  if (!clave) return { latino: texto, autoria: '', nombre: null, lectura: null, rango: null, nombradaPor: [] };
  const entrada = DICT.asociaciones[clave] || {};
  return {
    latino: clave,
    autoria: texto.slice(clave.length).trim(),
    nombre: entrada.nombre || null,
    lectura: entrada.lectura || null,
    rango: entrada.rango || null,
    nombradaPor: entrada.nombradaPor || [],
  };
}
