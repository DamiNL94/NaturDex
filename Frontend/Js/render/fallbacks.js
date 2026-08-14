// ================================================================================================
// ./render/fallbacks.js — sustitutos de imagen rota que el HTML generado invoca por onerror (API global en window)
// ------------------------------------------------------------------------------------------------
// Trozo de render.js. El índice de la carpeta está en Frontend/Js/CLAUDE.md.
// ================================================================================================

import { state } from '../state.js';
import { habitatPlaceholderImage, invasoraPlaceholderImage, placeholderImage, poiPlaceholderImage } from '../util.js';

// Una foto que ha caído en su sustituto generado deja de ser ampliable: el visor (Js/visor.js) no
// tiene nada que enseñar de un emoji sobre un degradado, y un control anunciado que al pulsarlo no
// hace nada desconcierta. Se le quitan los atributos que la convertían en control, los mismos que
// pone util.js · atributosAmpliar.
function dejaDeSerAmpliable(imgEl) {
  if (!imgEl) return;
  ['data-zoom', 'data-zoom-credit', 'role', 'tabindex', 'aria-label']
    .forEach(attr => imgEl.removeAttribute(attr));
}

// Fallbacks de imagen usados por el HTML generado (onerror inline): forman parte de la API global
// que el render publica en window (documentado también en app.js).
window.__imgFallback = function (imgEl, speciesId) {
  dejaDeSerAmpliable(imgEl);
  const species = state.data.species.find(item => item.id === Number(speciesId));
  if (!species || !imgEl) return;
  imgEl.onerror = null;
  imgEl.src = placeholderImage(species);
};

window.__habitatImgFallback = function (imgEl, habitatId) {
  dejaDeSerAmpliable(imgEl);
  const habitat = (state.data.habitats || []).find(item => item.id === habitatId);
  if (!habitat || !imgEl) return;
  imgEl.onerror = null;
  imgEl.src = habitatPlaceholderImage(habitat);
};

window.__poiImgFallback = function (imgEl) {
  dejaDeSerAmpliable(imgEl);
  const poi = (state.data.pointsOfInterest || []).find(item => item.id === state.selectedPoiId);
  if (!poi || !imgEl) return;
  imgEl.onerror = null;
  imgEl.src = poiPlaceholderImage(poi);
};

// Foto de invasora rota (p. ej. sin conexión) en la portada de la ficha → emoji del grupo a tamaño
// grande, que es lo que la portada tenía antes de haber foto.
window.__invImgFallback = function (imgEl) {
  if (!imgEl) return;
  imgEl.onerror = null;
  const span = document.createElement('span');
  span.className = 'invasora-hero-emoji';
  span.setAttribute('aria-hidden', 'true');
  span.textContent = imgEl.dataset.emoji || '🌿';
  imgEl.replaceWith(span);
};

// La misma foto rota, pero en la miniatura de la lista: ahí no se puede sustituir el <img> por un
// span (rompería la rejilla de 72 px de la tarjeta), así que se cambia por la portada generada.
window.__invThumbFallback = function (imgEl) {
  if (!imgEl) return;
  imgEl.onerror = null;
  imgEl.src = invasoraPlaceholderImage({ group: imgEl.dataset.group || '' });
};
