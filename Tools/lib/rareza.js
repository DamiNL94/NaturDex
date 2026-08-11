'use strict';
/*
 * rareza.js — la escalera de gravedad legal que traduce una figura de protección a un tramo 1–5.
 *
 * El problema que resuelve
 * -----------------------
 * `rarityScore` era «criterio propio 1–5»: un número puesto a mano, ficha a ficha, que nadie podía
 * recalcular ni discutir. Ahora sale de la categoría legal vigente, que es dato oficial directo. Pero
 * el cálculo hace falta en dos sitios que trabajan con formatos distintos:
 *
 *   · `build-species-seleccion.js` tiene las normas ESTRUCTURADAS de EIDOS ({ambito, norma, categoria}).
 *   · `rareza-legal.js` solo tiene el TEXTO ya redactado del park.json (`spainStatus`, `murciaStatus`),
 *     porque los espacios antiguos no conservan la selección y volver a EIDOS pide red.
 *
 * Tener dos copias de la escalera es exactamente el fallo que este repo ya conoce con
 * `canonicalSpeciesKey()` (Docs/PROGRESO-CUENTA-LOGROS.md): dos implementaciones del mismo criterio
 * que se separan en cuanto alguien toca una. Vive aquí una sola vez.
 *
 * La escalera
 * -----------
 *   5  En peligro de extinción · Extinguida
 *   4  Vulnerable · Sensible a la alteración de su hábitat
 *   3  De interés especial
 *   2  En régimen de protección especial (LESRPE), sin categoría de amenaza
 *   1  sin figura de protección
 *
 * No interviene ninguna señal de abundancia: ni ocurrencias de GBIF ni en cuántos espacios aparece.
 * Un tramo derivado de la abundancia sería otro dato derivado al que habría que buscarle respaldo;
 * la categoría legal es oficial y se cita sola.
 */

const ESCALERA = [
  [5, /en\s+peligro\s+de\s+extinci[óo]n|^extinguid[ao]s?$|\bextinguida\b/i],
  [4, /\bvulnerable\b|sensible\s+a\s+la\s+alteraci[óo]n/i],
  [3, /(especies?\s+)?de\s+inter[ée]s\s+especial/i],
  // La Directiva Aves es norma legal comunitaria y vigente: una especie de su anexo está protegida
  // aunque el LESRPE no la nombre. Entra al mismo nivel que el LESRPE —protección sin categoría de
  // amenaza— y no más arriba. Decisión del 2026-08-11; afectaba a 20 fichas que estaban en tramo 1.
  [2, /r[ée]gimen\s+de\s+protecci[óo]n\s+especial|\bLESRPE\b|Directiva\s+Aves/i],
];

/*
 * La Lista Roja de la Flora Vascular Española (2008) NO es una figura legal: es una evaluación de
 * conservación con criterios UICN, y no protege a nadie jurídicamente. Se cuenta igualmente, por
 * decisión explícita del 2026-08-11, porque para la flora es la única señal que distingue una planta
 * rara de una común cuando ninguna norma la nombra.
 *
 * La consecuencia hay que tenerla presente: `rarityLocal` deja de significar «lo protegida que está»
 * para significar «lo excepcional que es», mezclando norma y evaluación científica en el mismo
 * número. Por eso `rarityLocalBasis` guarda SIEMPRE el texto que decidió el tramo: es lo único que
 * permite saber después si un 5 lo puso el Catálogo Regional o la Lista Roja.
 *
 * Solo se traducen las tres categorías de amenaza. NT (casi amenazada) y DD (datos insuficientes) no
 * suben el tramo: la primera es explícitamente «todavía no amenazada» y la segunda dice que no se
 * sabe, que es justo lo contrario de un dato.
 *
 * Y cubre las DOS evaluaciones que usa el catálogo, no solo la de flora. La Lista Roja entró por
 * decisión explícita; el «Libro Rojo de las Aves de España» se estaba colando por la puerta de atrás,
 * porque la palabra «Vulnerable» de su texto la cazaba el patrón genérico de la escalera. Era la
 * misma clase de fuente puntuando por accidente en vez de por criterio: *Bucanetes githagineus*
 * salía en tramo 4 por el Libro Rojo teniendo «De interés especial» (tramo 3) como figura legal.
 * Contarlas es coherente con la decisión tomada; contarlas *sin saberlo* no lo era.
 */
const EVALUACIONES = [
  [5, /(Lista\s+Roja|Libro\s+Rojo)[^:]*:\s*(CR|EN)\b|En\s+Peligro\s+Cr[íi]tico/i],
  [5, /(Lista|Libro)\s+Rojo?a?[^.;·]*\ben\s+peligro\b/i],
  [4, /(Lista\s+Roja|Libro\s+Rojo)[^:]*:\s*VU\b/i],
  [4, /\bvulnerable\b[^.;·]*(Lista\s+Roja|Libro\s+Rojo)|(Lista\s+Roja|Libro\s+Rojo)[^.;·]*\bvulnerable\b/i],
];

const SIGNIFICADO = {
  5: 'En peligro de extinción · Extinguida',
  4: 'Vulnerable · Sensible a la alteración de su hábitat',
  3: 'De interés especial',
  2: 'En régimen de protección especial (LESRPE)',
  1: 'Sin figura de protección',
};

/*
 * Figuras que NO son protección, aunque EIDOS las devuelva junto a las que sí lo son. Si se colaran,
 * subirían el tramo de especies que no están protegidas por nada:
 *
 *   · CEEEI (RD 630/2013, RD 216/2019) — catálogo de especies exóticas INVASORAS. Es lo contrario.
 *   · RD 159/2022 y RD 289/2003, anexos forestales — listas de recursos genéticos. Incluyen a
 *     *Pinus halepensis*, que no es una especie protegida: es madera.
 *   · Anexos IV y V de la Ley 42/2007 — régimen de explotación, no de protección.
 */
const NO_SON_PROTECCION = [
  /RD\s*630\/2013|RD\s*216\/2019|exóticas?\s+invasoras|\bCEEEI\b/i,
  /RD\s*159\/2022|Real\s+Decreto\s+159\/2022|RD\s*289\/2003|forestales?\s+para\s+conservaci[óo]n/i,
  /anexo\s*[IV]+\s*\(ley\s*42\/2007|r[ée]gimen\s+de\s+explotaci[óo]n/i,
  // Decreto 50/2003 de Murcia: «aprovechamiento sujeto a autorización previa» regula la recolección
  // (tomillo, romero…), no protege al taxón. 16 fichas.
  /aprovechamiento\s+sujeto\s+a\s+autorizaci[óo]n/i,
];

/*
 * Y las fórmulas que dicen «esto no se ha comprobado». No son ni figura ni ausencia de figura: son la
 * ausencia de comprobación, y merecen su propio estado.
 *
 * Escribirles tramo 1 sería afirmar «comprobado que no tiene figura de protección», que es
 * exactamente lo que no consta. Quedan SIN tramo y se listan para contrastarlas contra EIDOS y la
 * Lista Roja. Son 43 fichas.
 */
const INDETERMINADO = /pendiente\s+de\s+(confirmar|contrastar|comprobar)|categor[íi]a\s+exacta|no\s+confirmada|dudas\s+sobre/i;

/*
 * Y las fórmulas con las que una ficha dice «aquí no hay nada». Importan más de lo que parece: la
 * frase «No incluida en la Lista Roja de la Flora Vascular Española ni en el LESRPE» CONTIENE la
 * palabra LESRPE, y sin esto puntuaría 2 justo por decir que no está.
 */
const NEGACION = /^\s*(no\s+(incluid[ao]|catalogad[ao]|localizad[ao]|figura|consta|evaluad[ao])|sin\s+(figura|categor[íi]a|protecci[óo]n)|excluid[ao]\s+del)/i;

/** Tramo de UNA categoría legal ya aislada (el formato de EIDOS). 1 si no la reconoce. */
function tramoDeCategoria(categoria) {
  const cat = String(categoria || '').replace(/^(CEEA|LESRPE):\s*/, '').trim();
  if (!cat || NEGACION.test(cat)) return 1;
  if (NO_SON_PROTECCION.some(re => re.test(cat))) return 1;
  for (const [valor, re] of ESCALERA) if (re.test(cat)) return valor;
  return 1;
}

/**
 * Tramo de un TEXTO de estado legal tal y como lo guarda el park.json, que puede encadenar varias
 * figuras («LESRPE: En régimen de protección especial (RD 139/2011) · Anexo IV (Ley 42/2007)»).
 *
 * Se evalúa segmento a segmento y gana el más grave, porque una figura no anula a la otra. Devuelve
 * también el segmento que decidió el tramo: sin él, el número volvería a ser una cifra sin
 * procedencia, que es de lo que veníamos.
 *
 * `reconocido` distingue «he leído el texto y dice que no hay figura» de «no he sabido leerlo». Lo
 * segundo NO se escribe como tramo 1: se lista para mirarlo a mano.
 */
function tramoDeTexto(texto) {
  const t = String(texto || '').trim();
  if (!t || t === '—') return { tramo: 1, motivo: null, reconocido: false, indeterminado: false };

  let mejor = 1, motivo = null, reconocido = false, indeterminado = false;
  for (const seg of t.split(/\s*[;·]\s*/).filter(Boolean)) {
    // El orden importa: «pendiente de confirmar» se mira ANTES que la escalera, porque la frase
    // «Lista Roja 2008 (categoría exacta pendiente de confirmar)» contiene el nombre de la fuente y
    // sin esto puntuaría como si la categoría constara.
    if (INDETERMINADO.test(seg)) { indeterminado = true; continue; }
    if (NEGACION.test(seg)) { reconocido = true; continue; }

    // La escalera se mira ANTES que la lista de figuras que no protegen, y el orden no es un detalle:
    // el Catálogo Regional escribe «De interés especial (Anexo II: aprovechamiento sujeto a
    // autorización)», donde el paréntesis es un matiz del aprovechamiento y la categoría está delante.
    // Descartando primero, el segmento entero se iba a la basura con su categoría dentro, y cinco
    // fichas acababan en la lista de «por contrastar» teniendo el dato escrito.
    let puesto = false;
    for (const [valor, re] of [...EVALUACIONES, ...ESCALERA]) {
      if (!re.test(seg)) continue;
      reconocido = true;
      if (valor > mejor) { mejor = valor; motivo = seg.trim(); }
      puesto = true;
      break;
    }
    // Sin categoría reconocible, el segmento solo nombra una figura que no protege: queda leído y
    // descartado, que no es lo mismo que no haberlo entendido.
    if (!puesto && NO_SON_PROTECCION.some(re => re.test(seg))) reconocido = true;
  }
  // Si algo quedó indeterminado y NO hay ninguna figura que lo supere, el tramo no se puede afirmar.
  return { tramo: mejor, motivo, reconocido, indeterminado: indeterminado && mejor === 1 };
}

module.exports = {
  ESCALERA, EVALUACIONES, SIGNIFICADO, NEGACION, NO_SON_PROTECCION, INDETERMINADO,
  tramoDeCategoria, tramoDeTexto,
};
