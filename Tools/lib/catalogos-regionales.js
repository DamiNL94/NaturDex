'use strict';
/*
 * catalogos-regionales.js — la frase con la que una ficha dice que NO está en el catálogo
 * autonómico de su comunidad, en un solo sitio.
 *
 * El problema que resuelve
 * -----------------------
 * «No incluida en el Catálogo Regional de especies protegidas (X)» es una AFIRMACIÓN sobre el
 * catálogo de X, y la escribe `build-species-n2.js` al generar cada ficha. Hasta el 2026-09-19 esa
 * composición vivía **solo dentro del generador**, y eso bastaba mientras nadie más tuviera que
 * escribir la misma frase. Dejó de bastar con la deuda nº 44(b): el catálogo tiene **trece
 * redacciones distintas de la misma negación** en 2.580 fichas —1.939 con la genérica de antes del
 * 2026-08-27, 470 con la del generador de hoy, 81 citando el Decreto de FLORA para fauna, y nueve
 * variantes sueltas del piloto con una coletilla ecológica pegada detrás— y uniformarlas exige
 * componer la frase buena fuera del generador.
 *
 * Copiarla habría sido la regla nº 1 de `Tools/CLAUDE.md` incumplida en el peor sitio: dos
 * redacciones de la negación que divergen es exactamente el estado del que se viene.
 *
 * Por qué la frase enumera TODOS los catálogos de la comunidad
 * ------------------------------------------------------------
 * Porque una comunidad puede tener más de uno y Murcia lo demuestra: la flora va por el Decreto
 * n.º 50/2003 y la fauna por la Ley 7/1995, con dos escaleras de categorías distintas. Negar solo
 * el que corresponde al reino de la ficha sería más corto, pero obligaría a decidir el reino aquí
 * —y una negación exhaustiva es cierta para los dos—. Lo que NO se puede hacer es lo que hacían las
 * 81 fichas de Sierra Espuña: citar el catálogo de flora en la ficha de un ave.
 *
 * Y sin artículo delante del nombre de la comunidad: «de la Región de Murcia» se lee bien y «de la
 * Andalucía» no, y este texto tiene que servir para las diecisiete.
 */
const path = require('path');
const { CATALOGO_DIR, readJson } = require('./io');
const fs = require('fs');

const RUTA = path.join(CATALOGO_DIR, 'data', 'catalogos-regionales.json');

/** El fichero entero, o `{}` si no existe (ningún llamante debe reventar por eso). */
const carga = () => (fs.existsSync(RUTA) ? readJson(RUTA) : {});

/**
 * La frase de «no incluida» de una comunidad, o `null` si la comunidad no está dada de alta.
 *
 * El `null` es deliberado y es la mitad importante: afirmar que una especie no está en el catálogo
 * de una comunidad cuyo catálogo nadie ha mirado es inventar el dato (CLAUDE.md §1.2). Sin entrada,
 * la ficha se queda sin el campo y eso dice «no hay dato», que no es «no está protegida».
 */
function fraseNoIncluida(comunidad, catalogos) {
  const ficha = (catalogos || {})[comunidad];
  if (!ficha || !Array.isArray(ficha.catalogos) || !ficha.catalogos.length) return null;
  const nombres = [...new Set(ficha.catalogos.map(c => c.nombre))];
  return `No incluida en ${nombres.length === 1 ? 'el ' + nombres[0] : nombres.join(' ni en ')} (${comunidad})`;
}

module.exports = { RUTA, carga, fraseNoIncluida };
