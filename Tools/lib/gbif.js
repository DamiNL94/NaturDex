'use strict';
/*
 * gbif.js — cliente de GBIF (api.gbif.org), la fuente EMPÍRICA de la Capa 3.
 *
 * GBIF aporta dos cosas al catálogo, y conviene no confundirlas:
 *   · `matchName()`  → la clave `gbif_species_key`, que liga la ficha con las ocurrencias. Es la
 *     segunda mitad de la clave maestra de reconciliación taxonómica (la primera es `eidos_taxonid`).
 *   · `searchOccurrences()` → las observaciones georreferenciadas que, intersecadas con los polígonos
 *     de hábitat, dan la evidencia `observada_gbif`.
 *
 * DOS TRAMPAS QUE YA COSTARON DATOS MALOS:
 *   1. `usageKey` NO siempre es una especie. Si el nombre no resuelve a rango específico, GBIF
 *      devuelve la clave del género o de la FAMILIA, y el catálogo acabó con 3073 (Poaceae) como
 *      «clave del esparto»: cualquier consulta con ella devuelve la familia entera. `matchName()`
 *      devuelve `rank` para que el llamante pueda rechazar lo que no sea SPECIES/SUBSPECIES.
 *   2. Para un sinónimo hay que quedarse con `acceptedUsageKey`, no con `usageKey`.
 */
const { getJson } = require('./http');

const HOST = 'api.gbif.org';
// GBIF admite hasta 300 por página en occurrence/search; por encima ignora el límite y pagina peor.
const PAGE = 300;

const qs = (params) => Object.entries(params)
  .filter(([, v]) => v !== undefined && v !== null && v !== '')
  .flatMap(([k, v]) => (Array.isArray(v) ? v.map(x => `${k}=${encodeURIComponent(x)}`) : [`${k}=${encodeURIComponent(v)}`]))
  .join('&');

/**
 * Resuelve un nombre científico contra el backbone de GBIF.
 * @returns {Promise<{status:'ok'|'sinonimo'|'no-encontrada', speciesKey:number|null,
 *                    acceptedName:string|null, rank:string|null, matchType:string|null}>}
 */
async function matchName(sci, opts = {}) {
  const m = await getJson(HOST, `/v1/species/match?${qs({ name: sci })}`, { agent: 'gbif', ...opts });
  if (!m || m.matchType === 'NONE') {
    return { status: 'no-encontrada', speciesKey: null, acceptedName: null, rank: null, matchType: 'NONE' };
  }
  const key = m.synonym && m.acceptedUsageKey ? m.acceptedUsageKey : m.usageKey;
  return {
    status: m.synonym ? 'sinonimo' : 'ok',
    speciesKey: key || null,
    acceptedName: m.species || m.scientificName || null,
    rank: m.rank || null,
    matchType: m.matchType || null,
  };
}

/** ¿La clave devuelta identifica de verdad un taxón específico, y no un género o una familia? */
const esRangoEspecifico = (rank) => rank === 'SPECIES' || rank === 'SUBSPECIES' || rank === 'VARIETY' || rank === 'FORM';

/**
 * Una página de `occurrence/search`. `params` se pasa tal cual a la API (decimalLatitude,
 * decimalLongitude, hasCoordinate, mediaType, country…).
 *
 * Reintentos por encima del valor por defecto de `http.js` (2, ~1,8 s de margen) porque aquí no se
 * pierde una petición: se pierde la descarga entera. Barrer el bbox de un parque son cientos de
 * páginas y la caché no se escribe hasta el final, así que un `503 Backend fetch failed` de GBIF a
 * media pasada tira diez minutos de trabajo — que es justo lo que ocurrió con Carrascoy y El Valle
 * en la página 105 de 134. Cinco intentos con espera creciente dan ~9 s acumulados, que es lo que
 * suele durar el bache y sigue siendo cortés con un servicio público.
 */
function searchOccurrences(params, opts = {}) {
  return getJson(HOST, `/v1/occurrence/search?${qs(params)}`, {
    agent: 'gbif', timeoutMs: 45000, retries: 5, retryDelayMs: 600, ...opts,
  });
}

module.exports = { HOST, PAGE, qs, matchName, esRangoEspecifico, searchOccurrences };
