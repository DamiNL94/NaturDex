'use strict';
/*
 * uicn.js — cómo se escribe una categoría de la UICN en una ficha, y por qué el ÁMBITO va dentro
 * del texto y no se puede perder.
 *
 * El problema que resuelve
 * -----------------------
 * EIDOS sirve la evaluación de la UICN **por ámbito**: `Mundial`, `España`, `Península`, `Canarias`
 * (`conservationByScope()`). Son evaluaciones distintas del mismo taxón por autoridades distintas y
 * con años distintos, y una especie puede ser `LC` en el mundo y `NT` en España sin que ninguna de
 * las dos esté equivocada. Meterlas en el mismo campo sería exactamente el error que ya pagó
 * `spainStatus` con las normas de otras comunidades (deuda nº 5): un campo con dos significados no
 * se puede discutir, porque no se sabe cuál de los dos se está leyendo.
 *
 * De ahí que cada ámbito tenga su campo —`iucnGlobal` e `iucnSpain`— y que el texto **diga siempre
 * de qué Lista Roja habla**. El usuario no ve el nombre del campo; ve la frase.
 *
 * Por qué está en `lib/`
 * ----------------------
 * El formateo estaba en `build-species-universal.js`, que es el generador de fichas NUEVAS. Cuando
 * el 2026-08-27 hubo que barrer las 1.067 fichas ya existentes para rellenarles el ámbito España,
 * la alternativa era copiar la función: dos copias del mismo criterio que divergen a la primera
 * corrección, que es lo que dice la regla nº 1 de `Tools/CLAUDE.md`. Aquí hay una sola.
 *
 * Lo que NO se guarda, y por qué
 * ------------------------------
 * Los ámbitos `Península` y `Canarias` se descartan. No es que sobren: es que son evaluaciones
 * **subestatales** y el catálogo no tiene hoy un campo con ese significado, así que escribirlas en
 * el de España afirmaría un ámbito que la fuente no dice. Cuando haga falta, se abre su campo.
 */

/** Las nueve categorías de la UICN, con el nombre que ve el usuario. */
const CATEGORIA_UICN = {
  EX: 'Extinta', EW: 'Extinta en estado silvestre', CR: 'En peligro crítico', EN: 'En peligro',
  VU: 'Vulnerable', NT: 'Casi amenazada', LC: 'Preocupación menor', DD: 'Datos insuficientes',
  NE: 'No evaluada',
};

/*
 * Cómo se nombra cada Lista Roja en la ficha.
 *
 * `España` NO es «la Lista Roja de España» a secas porque no hay una: son varias, por grupo —la de
 * la Flora Vascular Española, los Atlas y Libros Rojos de vertebrados, invertebrados…—, y EIDOS
 * sirve la fila sin decir de cuál viene. «Lista Roja española» es lo más que se puede afirmar con
 * lo que hay; el año, que sí viene, es lo que permite ir a buscar la publicación concreta.
 */
const AMBITOS = {
  Mundial: { fuente: 'Lista Roja mundial de la UICN', sinEvaluar: 'No evaluada en la Lista Roja mundial de la UICN' },
  España: { fuente: 'Lista Roja española', sinEvaluar: null },
};

/**
 * Texto de la ficha para un ámbito.
 *
 * Devuelve `null` cuando la fuente no dice nada de ese ámbito **y** el ámbito no tiene frase de «sin
 * evaluar»: un campo ausente distingue «nadie lo ha mirado» de «comprobado que no está evaluada»,
 * que es la misma regla que aplica `lib/fenologia.js` con la fenología de las aves. El ámbito
 * Mundial sí la tiene porque la ficha lo enseña siempre.
 *
 * @param {object} porAmbito  lo que devuelve `eidos.conservationByScope()`
 * @param {string} ambito     'Mundial' | 'España'
 * @returns {string|null}
 */
function etiquetaUicn(porAmbito, ambito) {
  const cfg = AMBITOS[ambito];
  if (!cfg) throw new Error(`uicn: ámbito no contemplado «${ambito}»`);
  const fila = (porAmbito || {})[ambito];
  if (!fila || !fila.categoriaconservacion) return cfg.sinEvaluar;
  const cruda = String(fila.categoriaconservacion).trim();
  const cod = (cruda.match(/^[A-Z]{2}/) || [])[0];
  const nombre = CATEGORIA_UICN[cod];
  const anio = fila.anio ? `, ${fila.anio}` : '';
  return nombre
    ? `${cod} — ${nombre} (${cfg.fuente}${anio})`
    : `${cruda} (${cfg.fuente}${anio})`;
}

/** El código de dos letras de una etiqueta ya escrita, para quien necesite ordenar o comparar. */
const codigoDe = (etiqueta) => (String(etiqueta || '').match(/^[A-Z]{2}/) || [])[0] || null;

module.exports = { CATEGORIA_UICN, AMBITOS, etiquetaUicn, codigoDe };
