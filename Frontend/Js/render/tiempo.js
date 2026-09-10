// ================================================================================================
// ./render/tiempo.js — el tiempo del espacio, en la cabecera del parque.
// ------------------------------------------------------------------------------------------------
// Trozo de render.js. El índice de la carpeta está en Frontend/Js/CLAUDE.md. El dato y su caducidad
// los decide Frontend/Js/tiempo.js; aquí solo se pinta lo que llega.
//
// TRES REGLAS QUE MANDAN EN LA FORMA DE ESTO:
//
// 1. NINGÚN DATO SE PINTA SIN SU HORA AL LADO. La línea de abajo dice siempre cuándo elaboró AEMET
//    la predicción, y si la lectura es vieja lo dice también. Es la regla de la casa y además es
//    literalmente lo que exige el punto 3 de la nota legal de AEMET («mencionar la fecha de la
//    última actualización»).
//    El CRÉDITO visible es «© AEMET», que no es una abreviatura nuestra: la nota legal ofrece las
//    dos formas —«Incluir el Copyright de AEMET (© AEMET) **o en su lugar** el texto: "Información
//    elaborada por la Agencia Estatal de Meteorología"»— y la corta cabe en la línea de la hora, que
//    es la diferencia entre una línea y tres en una columna de 295 px. La fórmula larga viaja igual
//    en el `title` del enlace y como texto para lectores de pantalla, así que no se pierde.
// 2. EL ICONO NUNCA ES EL ÚNICO PORTADOR DEL DATO. Va `aria-hidden` y el estado del cielo se
//    escribe siempre con su texto («Nubes altas, 12°/24°»). Si mañana falta el icono no se pierde
//    nada; si faltara el texto, se perdería todo.
// 3. NO ES INTERACTIVO, Y NO LO PARECE. No hay botón, ni cursor de mano, ni área táctil que invite
//    a tocar: es una tarjeta de lectura. Por eso este módulo no necesita nada en la delegación de
//    eventos de app.js (donde entran TODOS los clicks de la app).
//
// LO QUE NO SE PINTA SIEMPRE, Y POR QUÉ. La predicción diaria trae más campos de los que caben en
// una cabecera de 320 px que se acaba de reducir plegándola. Se enseñan siempre el cielo, las
// temperaturas y la probabilidad de lluvia, que son los tres con los que se decide si salir. La
// RACHA y el ÍNDICE UV solo aparecen cuando son un aviso —rachas fuertes o UV muy alto—, porque ahí
// dejan de ser un número más y pasan a ser el motivo de no ir o de ir de otra manera. El viento
// medio no se pinta: con la racha cubierta, es la mitad del dato que ocupa el doble de sitio.
// ================================================================================================

import { parkWeather } from '../dom.js';
import { html } from '../util.js';

// Umbrales de aviso. La racha en 40 km/h porque es donde una cresta o un cortado dejan de ser
// cómodos; el UV en 8, que es el principio del tramo «muy alto» de la escala de la OMS que usa la
// propia AEMET. No son criterios meteorológicos finos: son el punto a partir del cual merece la
// pena gastar una línea de la cabecera en decirlo.
const RACHA_AVISO_KMH = 40;
const UV_AVISO = 8;

/**
 * Icono del estado del cielo por el código de AEMET. Las familias van por la primera cifra: 1x
 * cielo (despejado → cubierto), 2x lluvia, 3x nieve, 4x chubascos, 5x y 6x tormenta, 7x nieve
 * escasa. Un código desconocido devuelve el genérico: el texto ya dice lo que pasa.
 */
function iconoCielo(codigo) {
  const n = parseInt(String(codigo || ''), 10);
  if (!Number.isFinite(n)) return '🌡️';
  if (n === 11) return '☀️';
  if (n === 12 || n === 13) return '🌤️';
  if (n === 14 || n === 15) return '⛅';
  if (n === 16 || n === 17) return '☁️';
  if (n >= 20 && n < 30) return '🌧️';
  if (n >= 30 && n < 40) return '❄️';
  if (n >= 40 && n < 50) return '🌦️';
  if (n >= 50 && n < 70) return '⛈️';
  if (n >= 70 && n < 80) return '🌨️';
  return '🌡️';
}

/** «12° / 24°». El sr-only lo dice entero: una barra no se lee como «mínima y máxima». */
function temperaturas(dia) {
  if (dia.tempMin == null && dia.tempMax == null) return '';
  const min = dia.tempMin != null ? dia.tempMin + '°' : '—';
  const max = dia.tempMax != null ? dia.tempMax + '°' : '—';
  return html`<span class="weather-temp"><span aria-hidden="true">${min} / ${max}</span><span class="sr-only">mínima de ${min}, máxima de ${max}</span></span>`;
}

/**
 * « de 12 a 24 h» para el tramo de AEMET del que sale la lluvia, o nada si es el día entero.
 *
 * La probabilidad que llega es el MÁXIMO de los tramos del día (Backend/Lib/tiempo_payload.php ·
 * aemetMaximo), y sin su franja se leería como la del día entero, que es justo lo que no es: el 95 %
 * de una tarde de tormenta no dice nada de la mañana, y quien sale temprano necesita saberlo.
 */
function tramoHorario(periodo) {
  const m = /^(\d{2})-(\d{2})$/.exec(periodo || '');
  if (!m || (m[1] === '00' && m[2] === '24')) return '';
  return ' de ' + Number(m[1]) + ' a ' + Number(m[2]) + ' h';
}

/**
 * Las piezas de un día, ya separadas (el punto medio lo pone el CSS). El cielo va SIEMPRE con su
 * texto. `conLluvia` es false para MAÑANA: la columna del catálogo mide unos 295 px y cada pieza de
 * más es una línea de más en la cabecera. Hoy es el día con el que se decide y lleva la
 * probabilidad; mañana es un adelanto, y ahí el cielo y las temperaturas ya dicen lo que hace falta
 * para saber si conviene esperar un día.
 */
function lineaDia(dia, conLluvia) {
  const piezas = [];
  if (dia.cielo && dia.cielo.texto) piezas.push(html`<span>${dia.cielo.texto}</span>`);
  const temp = temperaturas(dia);
  if (temp) piezas.push(temp);
  if (conLluvia && dia.probPrecipitacion != null) {
    piezas.push(html`<span>Lluvia ${String(dia.probPrecipitacion)} %${tramoHorario(dia.probPrecipitacionPeriodo)}</span>`);
  }
  return piezas;
}

/** Los avisos: solo racha fuerte y UV muy alto. Ver el comentario de la cabecera. */
function avisos(dia) {
  const out = [];
  const racha = dia.viento && dia.viento.rachaMaxKmh;
  if (racha != null && racha >= RACHA_AVISO_KMH) out.push('Rachas de ' + racha + ' km/h');
  if (dia.uvMax != null && dia.uvMax >= UV_AVISO) out.push('UV ' + dia.uvMax + ' (muy alto)');
  return out;
}

/** «hoy a las 07:12» / «el 8 sept a las 20:03». Sin hora no se pinta nada: ver la regla nº 1. */
function cuando(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  const hora = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  const mismoDia = d.toDateString() === new Date().toDateString();
  if (mismoDia) return 'hoy a las ' + hora;
  return 'el ' + d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) + ' a las ' + hora;
}

/**
 * Pinta (o apaga) el widget. `datos` viene de Frontend/Js/tiempo.js; `null` lo apaga ENTERO con
 * `hidden`, sin dejar hueco ni mensaje de error: sin backend, sin conexión o sin municipio
 * resuelto, la cabecera queda exactamente como estaba antes de que existiera esto.
 */
export function renderTiempo(datos) {
  if (!parkWeather) return;
  if (!datos || !datos.hoy) { parkWeather.hidden = true; parkWeather.innerHTML = ''; return; }

  const { hoy, manana } = datos;
  // El nombre que se enseña es el que declara el espacio; el de AEMET queda de respaldo. Que el
  // municipio esté A LA VISTA es parte del dato: un parque de 17 km de costa o con 1.500 m de
  // desnivel no tiene «un tiempo», y esta predicción es la de ESE municipio, no la del espacio.
  const municipio = datos.municipioEspacio || (datos.municipio && datos.municipio.nombre) || '';
  const emitida = cuando(datos.emitidoEn);
  const guardada = datos.viejo ? cuando(new Date(datos.guardadoEn).toISOString()) : null;
  const listaAvisos = avisos(hoy);
  const atribucion = (datos.fuente && datos.fuente.atribucion) || 'Información elaborada por la Agencia Estatal de Meteorología';
  const urlFuente = (datos.fuente && datos.fuente.url) || 'https://www.aemet.es';

  parkWeather.innerHTML = html`<div class="weather-row">
      <span class="weather-icon" aria-hidden="true">${iconoCielo(hoy.cielo && hoy.cielo.codigo)}</span>
      <div class="weather-body">
        <p class="weather-place">Hoy${municipio ? ' en ' + municipio : ''}</p>
        <p class="weather-today">${lineaDia(hoy, true)}</p>
        ${manana ? html`<p class="weather-tomorrow"><span class="weather-when">Mañana</span>${lineaDia(manana, false)}</p>` : ''}
      </div>
    </div>
    ${listaAvisos.length ? html`<p class="weather-alert">${listaAvisos.join(' · ')}</p>` : ''}
    ${datos.viejo ? html`<p class="weather-old">Predicción guardada${guardada ? ' ' + guardada : ''}: puede haber otra más reciente.</p>` : ''}
    <p class="weather-foot">${emitida ? 'Elaborada ' + emitida + ' · ' : ''}<a href="${urlFuente}" target="_blank" rel="noopener noreferrer" title="${atribucion}">© AEMET<span class="sr-only"> · ${atribucion}</span></a></p>`;
  parkWeather.hidden = false;
}
