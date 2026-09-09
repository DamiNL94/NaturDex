// ================================================================================================
// tiempo.js — pedir la predicción del espacio, guardar la última lectura y decidir si aún vale.
// ------------------------------------------------------------------------------------------------
// EL PROBLEMA: la pregunta que se hace alguien antes de coger el coche es «¿salgo hoy a este
// espacio?». La app sabía decir qué hay allí, no si hoy se puede ir. Este módulo trae el dato
// (AEMET, a través de Backend/Api/tiempo.php) y, sobre todo, decide CUÁNDO DEJA DE VALER.
//
// PORQUE EL TIEMPO ES DATO PERECEDERO, Y ESTA APP ES OFFLINE-FIRST. Ahí está el fallo que hay que
// evitar: una predicción de anteayer presentada como la de hoy es exactamente el fallo silencioso
// que este repositorio persigue — no da error, se ve bien, y manda a alguien al monte con la
// información equivocada. Por eso:
//
//   · NADA de esto entra en el precache del Service Worker ni en la capa 2 de offline.js. El módulo
//     `.js` sí (si no, la app no arranca sin cobertura); el DATO no. sw.js excluye además a
//     `Api/tiempo.php` de su caché de runtime, o habría DOS copias del dato con dos edades y solo
//     una de ellas sabría cuál es la suya.
//   · La única copia guardada es la de aquí, en localStorage, y va SIEMPRE con su hora.
//
// LOS DOS UMBRALES, Y POR QUÉ SON ÉSTOS:
//   · VIEJA_MS = 6 h. A partir de ahí la lectura se marca como vieja y el widget lo dice. Seis horas
//     porque AEMET emite la predicción municipal unas pocas veces al día: pasadas seis, es probable
//     que exista una emisión posterior que dice otra cosa, y quien la lee tiene derecho a saber que
//     está mirando la de antes. Y se marca vieja TAMBIÉN si AEMET la elaboró en un día anterior,
//     aunque se acabe de traer: son dos edades distintas y solo la segunda caza la predicción de
//     ayer por la tarde, que trae una fila para hoy y por tanto se pinta (ver `elaboradaOtroDia`).
//   · Y la que de verdad decide, que NO es una cuenta de horas: **la predicción se deja de pintar en
//     cuanto ninguno de sus días es HOY**. Un umbral de 12 o 24 h se equivoca en los dos sentidos
//     —a las 23:00 una lectura de hace 10 h sigue siendo de hoy, y a las 00:30 una de hace 2 h ya no
//     lo es—, y el error que importa es justo ése: enseñar como «Hoy» el día de ayer. Se busca el
//     día cuya fecha es la de hoy y se pinta desde ahí; si no está, no hay nada que pintar.
//     Como efecto secundario esto acota la lectura guardada a menos de 24 h sin tener que decirlo.
//
// La credencial de AEMET NO PASA POR AQUÍ ni por ninguna parte de Frontend/: vive en una variable
// de entorno DEL SERVIDOR (ver Backend/Api/tiempo.php y DEPLOY.md) y este módulo solo habla con
// Backend/Api/, como todo lo demás. En esta carpeta no debe aparecer ni el nombre de esa variable:
// la comprobación de que no se ha filtrado es un grep, y un grep con excepciones no comprueba nada.
// ================================================================================================

import { apiFetch } from './api.js';

// Ver la cabecera: seis horas para marcarla vieja; el corte duro lo pone el día, no el reloj.
const VIEJA_MS = 6 * 60 * 60 * 1000;

const claveGuardado = (ine) => 'naturdex.tiempo.' + ine;

/** La fecha de hoy en «AAAA-MM-DD» y en hora LOCAL, que es la que usa la predicción de AEMET. */
function hoyLocal() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

/**
 * Reordena la predicción a lo que se va a pintar: `hoy` y `manana`.
 *
 * Devuelve `null` si NINGÚN día de la predicción es hoy — que es el corte duro descrito arriba y la
 * única puerta por la que se decide no pintar por antigüedad.
 */
function encuadraDias(datos) {
  const dias = (datos && datos.dias) || [];
  const i = dias.findIndex(d => d && d.fecha === hoyLocal());
  if (i < 0) return null;
  return { hoy: dias[i], manana: dias[i + 1] || null };
}

/** La lectura guardada de este municipio, o null. Nunca lanza: sin localStorage, simplemente no hay. */
function leeGuardado(ine) {
  try {
    const bruto = localStorage.getItem(claveGuardado(ine));
    if (!bruto) return null;
    const guardado = JSON.parse(bruto);
    if (!guardado || !guardado.datos || !guardado.guardadoEn) return null;
    return guardado;
  } catch (e) { return null; }
}

function guarda(ine, datos) {
  try {
    localStorage.setItem(claveGuardado(ine), JSON.stringify({ guardadoEn: Date.now(), datos }));
  } catch (e) { /* sin localStorage o cuota llena: el widget funciona igual, solo que sin memoria */ }
}

/**
 * ¿Está la predicción elaborada en un día ANTERIOR a hoy?
 *
 * Hace falta además de la cuenta de horas, y no es lo mismo: una predicción elaborada ayer por la
 * tarde SÍ trae una fila para hoy —así que se puede pintar, y el día que enseña es de verdad hoy—
 * pero es un documento del día anterior y AEMET ya habrá emitido otro. Midiendo solo desde que la
 * pedimos NOSOTROS, ese caso salía como recién traída y sin ningún aviso. Lo destapó la prueba en
 * navegador del 2026-09-09.
 */
function elaboradaOtroDia(emitidoEn) {
  if (!emitidoEn) return false;   // sin fecha de elaboración no se afirma nada
  const d = new Date(emitidoEn);
  if (isNaN(d.getTime())) return false;
  const p = (n) => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) < hoyLocal();
}

/**
 * Empaqueta lo que necesita el pintado: los dos días encuadrados, si la lectura es vieja y de
 * cuándo es. Devuelve null cuando no hay nada que se pueda pintar honestamente.
 */
function paraPintar(datos, guardadoEn) {
  const encuadre = encuadraDias(datos);
  if (!encuadre) return null;
  const edadMs = Date.now() - guardadoEn;
  return {
    ...encuadre,
    municipio: datos.municipio || {},
    emitidoEn: datos.emitidoEn || null,
    fuente: datos.fuente || null,
    // `viejo` lo pueden decir tres cosas, y basta una: el servidor (sirvió su caché porque AEMET no
    // respondía), el reloj de aquí desde que se guardó, y —la que se olvidaba— la fecha de
    // ELABORACIÓN de AEMET. Las tres significan lo mismo para quien lo lee: puede haber una más
    // reciente. La tercera es la única que caza la predicción de ayer que trae una fila para hoy.
    viejo: Boolean(datos.viejo) || edadMs > VIEJA_MS || elaboradaOtroDia(datos.emitidoEn),
    guardadoEn,
  };
}

/**
 * Pide la predicción al backend. Devuelve null ante CUALQUIER cosa que no sea un 200 con dato: sin
 * conexión, sin backend (el despliegue estático de Docs/DESPLIEGUE_ESTATICO.md devuelve 404), AEMET
 * caída, 429, o el servidor sin credencial de AEMET. En todos esos casos el widget se calla, que es
 * lo pedido: el tiempo es una mejora, no un requisito.
 */
async function pideAlServidor(ine) {
  try {
    const res = await apiFetch('/tiempo.php?municipio=' + encodeURIComponent(ine));
    if (!res.ok) return null;
    const datos = await res.json();
    return (datos && Array.isArray(datos.dias) && datos.dias.length) ? datos : null;
  } catch (e) {
    return null;   // sin red: se sigue con lo guardado, si lo hay
  }
}

/**
 * Carga el tiempo del espacio y lo va pintando.
 *
 * `pinta(datos|null)` se llama una o dos veces: primero con la lectura guardada (si la hay, para que
 * no haya un hueco esperando a la red) y después con la fresca. Un `null` significa «no hay nada que
 * enseñar»: el widget se apaga y no deja ni hueco ni mensaje de error, que es el estado normal en un
 * despliegue sin backend.
 *
 * No hay estado de «cargando» a propósito: un esqueleto o un giro en la cabecera ocuparía el sitio
 * que se acaba de ganar plegándola, y parpadearía en cada entrada a un espacio para un dato que es
 * una mejora. Si hay lectura guardada aparece al instante; si no, aparece cuando llega.
 */
export async function cargaTiempo(park, pinta) {
  const ine = park && park.weather && park.weather.ine;
  // Espacio sin municipio resuelto: no se pinta nada. Es un hueco declarado, no un fallo — ver
  // Tools/resuelve-municipio-aemet.js.
  if (!ine) { pinta(null); return; }

  const guardado = leeGuardado(ine);
  const previo = guardado ? paraPintar(guardado.datos, guardado.guardadoEn) : null;
  if (previo) pinta({ ...previo, municipioEspacio: park.weather.municipio });

  const fresco = await pideAlServidor(ine);
  if (fresco) {
    guarda(ine, fresco);
    const listo = paraPintar(fresco, Date.now());
    // Un dato recién traído que no trae el día de hoy es una rareza de la fuente, no algo que
    // enseñar: se prefiere no pintar nada antes que pintar el día equivocado.
    pinta(listo ? { ...listo, municipioEspacio: park.weather.municipio } : null);
    return;
  }
  if (!previo) pinta(null);
}
