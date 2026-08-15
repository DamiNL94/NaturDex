'use strict';
/*
 * http.js — cliente HTTPS de solo lectura para las fuentes oficiales (EIDOS/IEPNB, GBIF, Wikimedia,
 * Discodata/EEA, ArcGIS del IMIDA, Overpass).
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

/*
 * La conexión cortada a media respuesta era un FALLO EN VERDE, y del peor tipo.
 *
 * `res` emite `end` cuando el cuerpo llega entero. Cuando la conexión se corta a mitad —lo hace el
 * proxy de salida, y lo hace sin avisar— `res` emite `aborted` y `close`, y `req` **no** emite
 * `error`. Sin un manejador para eso, la promesa se queda pendiente para siempre; y una promesa
 * pendiente no sostiene el bucle de eventos de node, así que **el proceso termina solo, con código
 * 0 y sin imprimir nada**. `req.setTimeout` tampoco salva: es un temporizador de inactividad del
 * socket, y un socket destruido no está inactivo, está cerrado.
 *
 * El resultado desde fuera es indistinguible de haber terminado bien: `echo $?` dice 0 y no hay ni
 * una línea en stderr. Así se descargó el barrido de GBIF de Carrascoy y El Valle —97.362
 * ocurrencias en su bbox— **cortado en la página 34 de 325**, y el catálogo del espacio se
 * construyó sobre ese trozo sin que nada lo dijera.
 *
 * Con esto, un corte pasa a ser un error de red normal y corriente: `getText` lo reintenta como
 * cualquier 429 o 503, y si los reintentos se agotan, sale por donde tiene que salir — una
 * excepción que se ve.
 */
function unaPeticion(host, pathQuery, headers, timeoutMs) {
  return new Promise((resolve, reject) => {
    // Una promesa solo se resuelve una vez; sin este pestillo, el `close` que sigue a un `end`
    // normal rechazaría una petición que ya ha ido bien.
    let resuelta = false;
    const ok = (v) => { if (!resuelta) { resuelta = true; resolve(v); } };
    const falla = (e) => { if (!resuelta) { resuelta = true; reject(e); } };

    const req = https.get({ host, path: pathQuery, headers }, (res) => {
      // Se acumula en Buffer y se decodifica al final: partir un carácter multibyte entre dos
      // trozos es imposible así, y `getBuffer` puede reutilizar la misma ruta para binarios.
      const trozos = [];
      let recibido = 0;
      res.on('data', (c) => { trozos.push(c); recibido += c.length; });
      res.on('end', () => {
        const body = Buffer.concat(trozos).toString('utf8');
        if (res.statusCode < 200 || res.statusCode >= 300) {
          falla(new HttpError(res.statusCode, host, pathQuery, body));
          return;
        }
        ok({ status: res.statusCode, headers: res.headers, body });
      });
      // El cuerpo se cortó antes de llegar entero. Se dice cuánto llegó y cuánto se esperaba: la
      // diferencia es lo que distingue un corte de red de una respuesta legítimamente vacía.
      const cortada = () => {
        const esperado = res.headers['content-length'];
        falla(new Error(
          `conexión cortada a media respuesta de ${host}${String(pathQuery).slice(0, 120)}: ` +
          `${recibido} B recibidos${esperado ? ` de ${esperado}` : ''} sin fin de cuerpo`));
      };
      res.on('aborted', cortada);
      res.on('close', cortada);
    });
    req.setTimeout(timeoutMs, () => req.destroy(new Error(`timeout (${timeoutMs} ms) en ${host}${String(pathQuery).slice(0, 120)}`)));
    req.on('error', falla);
    // Red de seguridad: si el socket se cierra antes de que llegue a haber respuesta, tampoco puede
    // quedarse la promesa colgando.
    req.on('close', () => falla(new Error(
      `conexión cerrada sin respuesta de ${host}${String(pathQuery).slice(0, 120)}`)));
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
