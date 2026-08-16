'use strict';
/*
 * http.js — cliente HTTPS de solo lectura para las fuentes oficiales (EIDOS/IEPNB, GBIF, Wikimedia,
 * Red Natura 2000 del IEPNB, ArcGIS del IMIDA, Overpass).
 *
 * Por qué existe: había ocho implementaciones distintas del mismo `https.get` → JSON con reintentos,
 * y sus diferencias no eran de diseño sino descuidos que se propagaron al copiar:
 *
 *   · Dos de ellas NO llamaban a `res.setEncoding('utf8')`. Concatenar Buffers con `+=` los convierte
 *     a texto uno a uno y parte por la mitad los caracteres multibyte que caen en el borde de un
 *     trozo: así se colaron los «conservaci<?>n» del primer volcado de invasoras. Aquí se acumula en
 *     Buffer y se decodifica una sola vez al final, que es inmune al problema por construcción.
 *   · Tres no miraban el `statusCode`: un 500 con cuerpo HTML se reportaba como «JSON inválido»,
 *     que manda a depurar el sitio equivocado.
 *   · Ninguna reintentaba ante un 429/503, que es exactamente el fallo transitorio que sí merece
 *     reintento (Commons responde 429 en cuanto varias fichas piden a la vez).
 *
 * SOLO LECTURA: este módulo no expone POST. Ninguna herramienta del catálogo escribe en las fuentes.
 */
const https = require('https');
const { sleep } = require('./cli');

// Identificarse es norma de uso en Wikimedia y buena práctica en GBIF/IEPNB: un User-Agent genérico
// se bloquea antes. Cada script añade su nombre con la opción `agent`.
const UA_BASE = 'NaturDex/1.0 (catalogo de espacios protegidos; +https://github.com/DamiNL94/NaturDex)';

const DEFAULTS = {
  timeoutMs: 40000,
  retries: 2,
  retryDelayMs: 600,   // espera base; crece linealmente con el intento (600, 1200, 1800…)
  agent: null,         // sufijo del User-Agent, p. ej. 'gbif-habitats'
  headers: {},
};

// Códigos que merecen reintento: límite de peticiones y caídas transitorias del servidor.
const REINTENTABLES = new Set([429, 500, 502, 503, 504]);

class HttpError extends Error {
  constructor(status, host, pathQuery, body) {
    super(`HTTP ${status} en ${host}${String(pathQuery).slice(0, 120)}: ${String(body).slice(0, 200)}`);
    this.name = 'HttpError';
    this.status = status;
    this.body = body;
  }
}

/**
 * GET de una URL https, devolviendo el cuerpo como texto.
 * Reintenta ante error de red, timeout y códigos transitorios (429/5xx). Rechaza con HttpError en
 * cualquier otro código fuera de 2xx.
 * @returns {Promise<{status:number, headers:object, body:string}>}
 */
async function getText(host, pathQuery, options = {}) {
  const opt = { ...DEFAULTS, ...options };
  const headers = {
    'Accept': 'application/json',
    'User-Agent': opt.agent ? `${UA_BASE} ${opt.agent}` : UA_BASE,
    ...opt.headers,
  };

  let ultimoError = null;
  for (let intento = 0; intento <= opt.retries; intento++) {
    if (intento > 0) await sleep(opt.retryDelayMs * intento);
    try {
      return await unaPeticion(host, pathQuery, headers, opt.timeoutMs);
    } catch (e) {
      ultimoError = e;
      const transitorio = !(e instanceof HttpError) || REINTENTABLES.has(e.status);
      if (!transitorio) throw e;
    }
  }
  throw ultimoError;
}

function unaPeticion(host, pathQuery, headers, timeoutMs) {
  return new Promise((resolve, reject) => {
    const req = https.get({ host, path: pathQuery, headers }, (res) => {
      // Se acumula en Buffer y se decodifica al final: partir un carácter multibyte entre dos
      // trozos es imposible así, y `getBuffer` puede reutilizar la misma ruta para binarios.
      const trozos = [];
      res.on('data', (c) => trozos.push(c));
      res.on('end', () => {
        const body = Buffer.concat(trozos).toString('utf8');
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new HttpError(res.statusCode, host, pathQuery, body));
          return;
        }
        resolve({ status: res.statusCode, headers: res.headers, body });
      });
    });
    req.setTimeout(timeoutMs, () => req.destroy(new Error(`timeout (${timeoutMs} ms) en ${host}${String(pathQuery).slice(0, 120)}`)));
    req.on('error', reject);
  });
}

/**
 * GET que además parsea el cuerpo como JSON. El error de parseo incluye el principio del cuerpo
 * real: es la única forma de ver de un vistazo que el servidor devolvió HTML o un objeto de error.
 */
async function getJson(host, pathQuery, options = {}) {
  const { body } = await getText(host, pathQuery, options);
  try {
    return JSON.parse(body);
  } catch (e) {
    throw new Error(`respuesta no-JSON de ${host}${String(pathQuery).slice(0, 80)}: ${body.slice(0, 200)}`);
  }
}

/**
 * Ejecuta `fn` sobre `items` con como mucho `n` peticiones en vuelo. Devuelve los resultados en el
 * MISMO orden que la entrada. Un fallo no aborta el lote: esa posición queda con `{error}`, para que
 * el informe final pueda contarlos en vez de perder todo el trabajo por una especie.
 */
async function pool(items, n, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: Math.max(1, Math.min(n, items.length)) }, async () => {
    while (i < items.length) {
      const idx = i++;
      try { out[idx] = await fn(items[idx], idx); }
      catch (e) { out[idx] = { error: String((e && e.message) || e) }; }
    }
  }));
  return out;
}

module.exports = { getText, getJson, pool, HttpError, UA_BASE };
