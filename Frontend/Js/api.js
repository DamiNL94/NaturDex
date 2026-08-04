// ================================================================================================
// api.js — el único sitio del frontend que habla con Backend/Api/.
// ------------------------------------------------------------------------------------------------
// Cuatro módulos (data, achievements, presence, profile) tenían la MISMA función `apiSignal()`
// copiada y repetían en cada llamada la misma plantilla: montar la URL, poner el `Content-Type`,
// serializar el cuerpo, mirar `res.ok` y sacar el mensaje de error del JSON. Aquí está una vez.
//
// LA REGLA QUE MANDA EN TODO ESTO: la app es *offline-first*. El backend es una mejora, no un
// requisito, así que ninguna llamada puede dejar la interfaz colgada esperando. Por eso todas
// llevan un corte por tiempo: medido con MySQL caído, sin él entrar a un parque tardaba ~10 s
// porque los fetch fallidos se esperaban en serie. `AbortSignal.timeout` no existe en navegadores
// antiguos; ahí se devuelve `undefined` y la petición va sin límite, como iba antes.
// ================================================================================================

import { API_BASE } from './state.js';

// Corte por defecto de una llamada interactiva.
export const API_TIMEOUT_MS = 3000;
// Vaciar la cola de pendientes puede mandar los eventos de una excursión entera: 3 s son pocos, y
// abortar a medias significaría reintentarlo todo en el próximo arranque.
export const SYNC_TIMEOUT_MS = 15000;

export function apiSignal(ms = API_TIMEOUT_MS) {
  return (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) ? AbortSignal.timeout(ms) : undefined;
}

/** URL absoluta de un endpoint. `path` empieza por «/» («/species.php?park=…»). */
export const apiUrl = (path) => API_BASE + path;

/**
 * `fetch` contra la API, con corte por tiempo. Devuelve la `Response` CRUDA: para quien necesita
 * distinguir un 404 de un fallo de red sin que salte una excepción.
 */
export function apiFetch(path, { method = 'GET', body, timeoutMs = API_TIMEOUT_MS, headers } = {}) {
  const opts = { method, signal: apiSignal(timeoutMs) };
  if (body !== undefined) {
    opts.headers = { 'Content-Type': 'application/json', ...(headers || {}) };
    opts.body = JSON.stringify(body);
  } else if (headers) {
    opts.headers = headers;
  }
  return fetch(apiUrl(path), opts);
}

/**
 * Mensaje de error de una respuesta fallida. Se prefiere el campo `error` del cuerpo, que es el que
 * el backend redacta en castellano para el usuario; el código HTTP es el último recurso.
 */
async function errorDe(res, porDefecto) {
  const data = await res.json().catch(() => null);
  if (data && data.error) return new Error(data.error);
  return new Error(`${porDefecto} (HTTP ${res.status}).`);
}

/** GET que devuelve el JSON ya parseado y LANZA si la respuesta no es 2xx. */
export async function apiGetJson(path, { timeoutMs = API_TIMEOUT_MS } = {}) {
  const res = await apiFetch(path, { timeoutMs });
  if (!res.ok) throw await errorDe(res, 'No se pudo leer del servidor');
  return res.json();
}

/** POST de JSON que devuelve el JSON ya parseado y LANZA si la respuesta no es 2xx. */
export async function apiPostJson(path, body, { timeoutMs = API_TIMEOUT_MS } = {}) {
  const res = await apiFetch(path, { method: 'POST', body, timeoutMs });
  if (!res.ok) throw await errorDe(res, 'No se pudo completar la operación');
  return res.json();
}

/**
 * POST «de mejor esfuerzo»: devuelve el JSON si todo fue bien y `null` si no hubo red, el backend
 * no respondió o devolvió error. Es la forma que necesitan los avisos que la app manda al servidor
 * sin depender de ellos (progreso de cuenta, glosario, invasoras): la predicción local ya está
 * hecha y se reconciliará al reconectar, así que un fallo aquí no debe romper nada ni gritar.
 */
export async function apiPostQuiet(path, body, { timeoutMs = API_TIMEOUT_MS } = {}) {
  try {
    const res = await apiFetch(path, { method: 'POST', body, timeoutMs });
    return res.ok ? await res.json() : null;
  } catch (e) {
    return null;
  }
}
