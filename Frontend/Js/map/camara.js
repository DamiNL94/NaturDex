// ================================================================================================
// ./map/camara.js — encuadre (focusOn/fitOn/revealOn), entrada escalonada, marcador de posición y tamaño del contenedor
// ------------------------------------------------------------------------------------------------
// Trozo de map.js. El índice de la carpeta está en Frontend/Js/CLAUDE.md.
// ================================================================================================

import { state } from '../state.js';
import { PANES, chromeInset, handlers, map, visualCenterOffset } from './core.js';
import { userDivIcon } from './iconos.js';

// --- Entrada escalonada ----------------------------------------------------------------------------
// Al abrir un parque aparecían de golpe cinco capas de información sobre el mapa y no había forma de
// saber qué era cada cosa. Entrando por planos, de abajo arriba, el mapa se explica solo: primero
// dónde estás (el límite protegido), luego por dónde se anda (senderos), qué hay (hábitats) y al
// final los puntos. Son 120 ms entre planos: medio segundo largo en total, lo justo para leerlo
// como una secuencia sin que llegue a hacerse esperar.
// prefers-reduced-motion: la secuencia se salta entera —todo visible desde el primer fotograma—,
// no se hace "más despacio". La CSS de .nd-plane hace lo propio con la transición.
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const STAGGER = REDUCED ? 0 : 120; // ms entre planos, fundido de 400 ms por capa (ver styles.css)
const ENTRY_ORDER = ['parque', 'trails', 'habitats', 'pois', 'species'];
const ENTRY_PANES = {
  parque: PANES.protected, trails: PANES.trails, habitats: PANES.habitats,
  pois: PANES.pois, species: PANES.species
};
let entryTimers = [];

/** Reproduce la entrada por planos. La llama app.js al terminar de pintar un parque. */
export function playEntrySequence() {
  entryTimers.forEach(clearTimeout);
  entryTimers = [];
  const panes = map.getPanes();
  const planes = ENTRY_ORDER.map(key => panes[ENTRY_PANES[key]]).filter(Boolean);
  if (REDUCED) { planes.forEach(pane => pane.classList.remove('nd-plane-enter')); return; }
  planes.forEach(pane => pane.classList.add('nd-plane-enter'));
  // Reflow forzado: sin él, poner y quitar la clase en el mismo fotograma no cuenta como cambio y
  // el navegador se salta la transición (el plano aparecería de golpe, que es lo que se evita).
  if (planes[0]) void planes[0].offsetWidth;
  planes.forEach((pane, i) => {
    entryTimers.push(setTimeout(() => pane.classList.remove('nd-plane-enter'), i * STAGGER));
  });
}

// --- Encuadre ------------------------------------------------------------------------------------
// Punto único por el que la app mueve el mapa "para enseñar algo", y el único sitio donde se
// descuenta lo que tapan la barra del parque, la nav inferior y la ficha deslizante (chromeInset).
// Enseñar algo significa dejarlo donde el usuario lo ve, no donde el contenedor dice que está el
// centro: es la diferencia entre "he tocado el mirador y el mapa se ha centrado en él" y "he tocado
// el mirador y no ha pasado nada".
export function focusOn(latlng, zoom = null, options = {}) {
  const z = zoom == null ? map.getZoom() : zoom;
  const offset = visualCenterOffset();
  if (!offset) { map.setView(latlng, z, options); return; }
  // Se corrige en coordenadas de píxel del zoom de destino: mover el centro del mapa `offset` px
  // hacia arriba coloca el punto `offset` px más abajo en la pantalla, y al revés.
  const target = map.unproject(map.project(latlng, z).subtract([0, offset]), z);
  map.setView(target, z, options);
}

export function fitOn(bounds, options = {}) {
  const inset = chromeInset();
  map.fitBounds(bounds, Object.assign({
    paddingTopLeft: [24, inset.top + 24],
    paddingBottomRight: [24, inset.bottom + 24]
  }, options));
}

// Coloca un punto concreto (un marcador tocado) en la franja visible, acercando si hacía falta.
// `minZoom` evita el efecto de "se ha centrado pero sigo sin ver dónde está".
export function revealOn(latlng, minZoom = 15) {
  if (!latlng) return;
  focusOn(latlng, Math.max(map.getZoom(), minZoom), { animate: true });
}

// Los globos que quedan (senderos y figuras de protección) se colocan a mano: `autoPan` de Leaflet
// solo empuja el mapa lo justo para que el globo entre en el CONTENEDOR, y en móvil eso lo dejaba
// medio tapado por la nav inferior o por la ficha. Aquí se coloca dentro de la franja visible.
export const POPUP_OPTIONS = { autoPan: false, maxWidth: 300, className: 'nd-popup' };

function revealPopup(popup) {
  const el = popup.getElement();
  const latlng = popup.getLatLng();
  if (!el || !latlng) return;
  const inset = chromeInset();
  const size = map.getSize();
  const height = el.offsetHeight || 200;
  // El globo crece hacia arriba desde su punto de anclaje: para que quepa entero, el ancla tiene que
  // quedar por debajo de `inset.top + alto`, y siempre por encima de lo que tapa la parte de abajo.
  const lowest = size.y - inset.bottom - 16;
  const desiredY = Math.max(inset.top + 24, Math.min(lowest, inset.top + height + 24));
  const delta = desiredY - size.y / 2;
  if (Math.abs(delta) < 8) return;
  const z = map.getZoom();
  map.panTo(map.unproject(map.project(latlng, z).subtract([0, delta]), z), { animate: true });
}

map.on('popupopen', event => revealPopup(event.popup));

// Encuadra un hábitat en el mapa (y abre su ficha si se pide). Lo usan el panel de capas y el
// panel "cerca de ti" del explorador.
export function focusHabitatOnMap(habitatId, openDetail = false) {
  const layer = state.habitatLayers.get(habitatId);
  if (!layer) return;
  const bounds = layer.getBounds ? layer.getBounds() : null;
  if (bounds) fitOn(bounds, { maxZoom: 15 });
  if (openDetail && handlers.onSelectHabitat) handlers.onSelectHabitat(habitatId);
}

// --- "Estás aquí": el punto azul de tu posición ---------------------------------------------------
// Se pinta con CUALQUIER posición que llegue, venga del modo explorador (GPS de alta precisión) o
// del seguimiento discreto de presence.js (baja precisión, encendido en cuanto hay permiso). Antes
// solo existía con el explorador encendido, y sin él no había forma de saber dónde estabas dentro
// del parque. NO mueve el mapa: dibujar dónde estás y llevarte allí son dos cosas distintas, y la
// segunda solo la hace el modo explorador cuando el seguimiento está activo (explorer.js).
export function placeUserMarker(lat, lng, accuracy) {
  const latlng = [lat, lng];
  if (!state.userMarker) {
    // Plano propio por encima de todos los demás: tu punto no lo tapa ningún marcador de especie ni
    // de punto de interés, ni la trama de un hábitat (el círculo de precisión es un vector).
    state.userMarker = L.marker(latlng, { icon: userDivIcon(), pane: PANES.user, zIndexOffset: 1000, interactive: false }).addTo(map);
    state.userAccuracyCircle = L.circle(latlng, {
      radius: accuracy || 30, color: '#1f6f8b', weight: 1, fillColor: '#1f6f8b', fillOpacity: 0.08,
      interactive: false, pane: PANES.user
    }).addTo(map);
  } else {
    state.userMarker.setLatLng(latlng);
    state.userAccuracyCircle.setLatLng(latlng).setRadius(accuracy || 30);
  }
}

// Retira el punto (al salir del parque): quedaría un "estás aquí" mintiendo en el mapa siguiente.
export function clearUserMarker() {
  if (state.userMarker) { map.removeLayer(state.userMarker); state.userMarker = null; }
  if (state.userAccuracyCircle) { map.removeLayer(state.userAccuracyCircle); state.userAccuracyCircle = null; }
}

// --- Tamaño del contenedor ---------------------------------------------------------------------------
// Leaflet cachea el tamaño del contenedor al crearse; si el layout aún no estaba listo (0 de alto),
// el mapa no dibuja capas ni teselas. Forzamos que recalcule cuando el DOM ya está estable/visible.
export function ensureMapSized() {
  const invalidate = () => map.invalidateSize(false);
  invalidate();
  requestAnimationFrame(invalidate);
  setTimeout(invalidate, 200);
  setTimeout(invalidate, 600);
}

window.addEventListener('resize', () => map.invalidateSize(false));
// Si el contenedor del mapa cambia de tamaño (paneles que aparecen/desaparecen, rotación en móvil),
// recalculamos automáticamente. ResizeObserver no está en navegadores muy antiguos: es opcional.
if (typeof ResizeObserver !== 'undefined') {
  const mapEl = document.getElementById('map');
  if (mapEl) new ResizeObserver(() => map.invalidateSize(false)).observe(mapEl);
}
