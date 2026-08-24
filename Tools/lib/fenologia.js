'use strict';
/*
 * fenologia.js — decide si un ave del catálogo es MIGRATORIA, y con qué documento se afirma.
 *
 * El problema que resuelve
 * -----------------------
 * La app llevaba desde el piloto llamando «🕊️ Ave migratoria» a **toda** ave con `zepaSiteCode`, y
 * ese campo no dice eso: dice que el Formulario Normalizado de Datos (FND/SDF) del sitio Red Natura
 * 2000 la declara. En Sierra de las Moreras eso son 22 aves de población **permanente** —el búho
 * real, la perdiz roja, el cuervo— anunciadas como migratorias en su ficha y contadas en la barra
 * «Aves migratorias» de la pestaña de progreso. No fallaba nada: el cartel salía en verde y decía
 * una cosa falsa.
 *
 * La señal buena ya estaba en el repo y se tiraba por el camino. El FND trae, especie a especie, el
 * TIPO DE POBLACIÓN en el sitio (`species_type`), que `especies-sitio-rn2000.js` traduce a
 * permanente / reproductora / invernante / en concentración. Hasta hoy solo se escribía como prosa
 * dentro del `source` de la ficha, donde ninguna herramienta ni la app podían leerlo.
 *
 * El criterio
 * -----------
 * Migratoria = el formulario la declara y **ninguna** de sus entradas es de población permanente.
 * Es decir: cría aquí y se va (reproductora), viene a pasar el invierno (invernante) o solo para a
 * repostar (en concentración). Una misma ave puede figurar con varios tipos y en varios sitios del
 * mismo espacio —la ZEPA y el LIC son dos afirmaciones oficiales distintas—: basta UNA entrada
 * permanente para que no sea migratoria, porque significa que aquí hay población todo el año.
 *
 * Los tres estados, y por qué son tres y no dos
 * --------------------------------------------
 *   · `true`      — el formulario lo declara y no hay población permanente.
 *   · `false`     — el formulario lo declara y sí la hay: comprobado que NO es migratoria aquí.
 *   · sin campo   — ningún formulario la declara. **No es `false`.** «Nadie lo ha mirado» y
 *                   «comprobado que no» son estados distintos, igual que en `rarityBasis`
 *                   (regla nº 2 y regla nº 9 del CLAUDE.md raíz). Cuatro de los dieciséis espacios
 *                   publicados —Barrancos de Gebas, Monte Arabí, Cabezo Gordo y Cañaverosa— no
 *                   tienen ni un ave en su formulario: allí no hay señal que dar, y la ficha se
 *                   queda en el catálogo general en vez de fingir una clasificación.
 *
 * El código `np` del formulario NO es un tipo de población: marca a la especie como ya no presente
 * en el sitio. Se descarta para clasificar —ni entra ni impide entrar—, en vez de colarse como un
 * quinto tipo desconocido que la comparación con «permanente» daría por migratorio.
 */

// Los cuatro tipos que el FND reconoce, tal como los deja `especies-sitio-rn2000.js`, con el rótulo
// que ve el usuario. El rótulo vive aquí y no en el frontend porque es la traducción del dato
// oficial, no una decisión de pantalla: la misma frase tiene que valer en la ficha, en el informe
// de la herramienta y en el SQL.
const TIPOS = {
  'permanente': 'Residente todo el año',
  'reproductora': 'Reproductora: cría aquí',
  'invernante': 'Invernante: pasa aquí el invierno',
  'en concentración': 'En paso migratorio',
};

// Marca del formulario para «ya no está presente en el sitio». No es un tipo de población.
const NO_PRESENTE = 'np';

/** ¿Este valor de `tipoPoblacion` es uno de los cuatro tipos del formulario? */
function esTipoConocido(tipo) {
  return Object.prototype.hasOwnProperty.call(TIPOS, tipo);
}

/**
 * Clasifica las entradas del formulario de una especie.
 *
 * `entradas` son las de `listaOficialSitio` de la selección (o las del volcado de
 * `especies-sitio-rn2000.js`): objetos con `tipoPoblacion`, `siteCode`, `siteName` y `seccion`.
 *
 * Devuelve `null` cuando no hay ninguna entrada utilizable —sin formulario, o solo con `np`—, que
 * es lo que hace que la ficha OMITA el campo en vez de escribir un `false` que nadie ha comprobado.
 */
function clasificaPresenciaSitio(entradas) {
  const utiles = (entradas || []).filter(e => e && esTipoConocido(e.tipoPoblacion));
  if (!utiles.length) return null;

  // Tipos distintos, en el orden fijo de TIPOS y no en el que vengan las entradas: sin esto, dos
  // pases con las mismas filas en distinto orden producen dos `etiqueta` distintas y el park.json
  // sale con diff sin que haya cambiado un dato (regla nº 7 del CLAUDE.md raíz).
  const tipos = Object.keys(TIPOS).filter(t => utiles.some(e => e.tipoPoblacion === t));
  const migratory = !tipos.includes('permanente');

  const sitios = [];
  for (const e of utiles) {
    if (!e.siteCode || sitios.some(s => s.code === e.siteCode)) continue;
    sitios.push({ code: e.siteCode, name: e.siteName || null, seccion: e.seccion || null });
  }

  return {
    migratory,
    sitePresence: {
      tipos,
      etiqueta: tipos.map(t => TIPOS[t]).join(' · '),
      sitios,
      // La cita completa, para que la ficha pueda decir de dónde sale sin recomponerla en el cliente.
      fuente: sitios.map(s => `Formulario Normalizado de Datos del sitio Red Natura 2000 ${s.code}` +
        `${s.name ? ` (${s.name})` : ''}${s.seccion ? `, sección ${s.seccion}` : ''}`).join('; '),
    },
  };
}

module.exports = { TIPOS, NO_PRESENTE, esTipoConocido, clasificaPresenciaSitio };
