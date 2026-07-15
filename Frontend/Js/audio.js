// ================================================================================================
// audio.js — audioguías explicativas de puntos de interés, rutas (senderos) y hábitats.
// ------------------------------------------------------------------------------------------------
// Módulo ES importado por render.js (ficha de hábitat) y map.js (popups de POI y sendero).
//
// Modelo de datos (mismo contrato en los tres sitios):
//   - Hábitats y POIs: campos `audio` (ruta relativa a Frontend/, p. ej. "Audio/poi/torre-cope.mp3")
//     y `audioTranscript` (transcripción textual) en park.json. Salen de la BD (habitats.audio_url /
//     points_of_interest.audio_url + *_transcript) vía park_payload.php, y se editan en el panel
//     de administración.
//   - Rutas: propiedades `audio` y `audioTranscript` del feature en geo/trails.geojson.
//   - Offline: el manifiesto del parque lista los ficheros en `audio: []` y "Guardar sin conexión"
//     los descarga a la Cache Storage junto a las imágenes (offline.js).
//
// Accesibilidad (UNE-EN 301549 / WCAG 2.1 AA): se usa el reproductor NATIVO <audio controls>
// (manejable con teclado y anunciado por lectores de pantalla) y la transcripción se ofrece como
// alternativa textual desplegable (criterio 1.2.1, contenido solo audio pregrabado).
// ================================================================================================

import { html, icon } from './util.js';

/**
 * Bloque de audioguía listo para interpolar dentro de una plantilla html``.
 * Devuelve '' si el elemento no tiene audio, así los llamadores lo insertan incondicionalmente.
 * @param {object} item   Objeto con `audio` y opcionalmente `audioTranscript` (hábitat, POI o
 *                        propiedades de un feature de sendero).
 * @param {string} title  Texto de la cabecera del bloque (p. ej. "Audioguía del hábitat").
 */
export function audioBlock(item, title = 'Audioguía') {
  const src = item && typeof item.audio === 'string' ? item.audio.trim() : '';
  if (!src) return '';
  const transcript = item.audioTranscript && String(item.audioTranscript).trim();
  return html`<figure class="audio-block">
    <figcaption><span aria-hidden="true">${icon('volume', 14)}</span> ${title}</figcaption>
    <audio controls preload="none" src="${src}">Tu navegador no puede reproducir este audio. <a href="${src}" download>Descargar la audioguía</a></audio>
    ${transcript
      ? html`<details class="audio-transcript"><summary>Leer la transcripción</summary><p>${transcript}</p></details>`
      : ''}
    </figure>`;
}

// Solo puede sonar una audioguía a la vez: al reproducir una, las demás se pausan (evita
// solapamientos si el usuario abre otro popup sin parar el audio anterior). Listener en captura
// porque los eventos de <audio> no burbujean.
document.addEventListener('play', event => {
  if (!(event.target instanceof HTMLMediaElement)) return;
  document.querySelectorAll('.audio-block audio').forEach(el => {
    if (el !== event.target && !el.paused) el.pause();
  });
}, true);
