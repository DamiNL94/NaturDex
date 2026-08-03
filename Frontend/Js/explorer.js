// ================================================================================================
// explorer.js — modo explorador: GPS continuo, panel "cerca de ti" y descubrimiento por proximidad.
// ------------------------------------------------------------------------------------------------
// Módulo ES importado por app.js. Sigue la posición real del usuario (watchPosition) y, además de
// listar lo más cercano ordenado por distancia, DETECTA dónde está: si entra en el radio de un
// punto de interés (~60 m) ofrece marcarlo como visitado con un toque, y si entra en el polígono
// de un hábitat le pregunta con un diálogo si quiere ver las especies de ese hábitat. Es la
// mecánica pokédex en campo: pasear por el parque hace que la app reaccione, en vez de tener que
// buscar en listas.
//
// No conoce la lógica de vistas: las acciones (marcar POI, abrir el catálogo de un hábitat) las
// inyecta app.js en initExplorer(), igual que hace map.js con setMapHandlers().
// ================================================================================================

import { html, poiEmoji, haversineMeters, pointInGeometry, iconMarkup, icon, geoUnavailableReason, geoErrorMessage } from './util.js';
import { state, isHabitatComplete } from './state.js';
import {
  explorerToggle, nearbyPanel, nearbyStatus, nearbyList, nearbyClose, explorerHint
} from './dom.js';
import { map, placeUserMarker, highlightHabitat, focusOn, fitOn } from './map.js';

// Umbrales de proximidad. El de POI coincide con el "¡Estás aquí!" del panel cercano; el círculo
// de hábitat es el mismo radio que dibuja map.js cuando un hábitat no tiene polígono todavía.
const POI_NEAR_METERS = 60;
const HABITAT_CIRCLE_METERS = 420;

const handlers = {
  onTogglePoiSeen: null,      // (poiId) desde el botón "Marcar visitado" del aviso
  onShowHabitatSpecies: null, // (habitatId) desde el "Sí, ver especies" del diálogo de hábitat
  onFix: null                 // (lat, lng, accuracy) cada posición, para la verificación de presencia
};

// Avisos ya mostrados en esta sesión de exploración (para no repetir el mismo al ritmo del GPS).
let shownKeys = new Set();
let currentHabitatId = null;

// --- Seguimiento: el mapa se mueve contigo ----------------------------------------------------------
// Explorar y seguir son la misma cosa (ambos viven del mismo watchPosition), así que los gobierna un
// único botón: el del modo explorador. Activo el seguimiento, cada posición del GPS re-centra el mapa
// manteniendo el zoom que el usuario elija. Arrastrar el mapa a mano lo desactiva (el usuario "toma
// el mando") sin apagar el GPS, y el botón pasa a ofrecer "Centrar en mí" para recuperarlo.
let followActive = false;
let followZoomed = false; // ¿ya se hizo el acercamiento inicial de esta sesión de seguimiento?
let lastFix = null;

// Zoom mínimo al empezar a seguir: a 16 se ven los límites de hábitat.
const FOLLOW_ZOOM = 16;

// Sin animación: los fixes del GPS llegan cada pocos segundos y encadenar animaciones produce
// "efecto goma" (cada fix cancela la anterior a medias); el recentrado instantáneo es lo preciso.
function centerOn(lat, lng) {
  const zoom = followZoomed ? map.getZoom() : Math.max(map.getZoom(), FOLLOW_ZOOM);
  followZoomed = true;
  focusOn([lat, lng], zoom, { animate: false });
}

function setFollow(on) {
  followActive = on && state.explorerActive; // sin GPS encendido no hay seguimiento que valga
  if (!followActive) followZoomed = false;
  renderExplorerToggle();
  if (followActive && lastFix) centerOn(lastFix.lat, lastFix.lng);
}

// --- El botón todo-en-uno ---------------------------------------------------------------------------
// Tres estados: apagado · explorando y siguiendo · explorando con el mapa suelto (invita a centrar).
function renderExplorerToggle() {
  const active = state.explorerActive;
  explorerToggle.classList.toggle('active', active);
  explorerToggle.classList.toggle('recenter', active && !followActive);
  explorerToggle.setAttribute('aria-pressed', active ? 'true' : 'false');
  if (!active) {
    explorerToggle.innerHTML = iconMarkup('pin', 14) + ' Modo explorador';
    explorerToggle.title = 'Activa tu GPS: el mapa te sigue y te avisamos de lo que tienes cerca';
  } else if (followActive) {
    explorerToggle.innerHTML = iconMarkup('target', 14) + ' Explorando…';
    explorerToggle.title = 'El mapa te sigue. Toca para salir del modo explorador';
  } else {
    explorerToggle.innerHTML = iconMarkup('target', 14) + ' Centrar en mí';
    explorerToggle.title = 'Has movido el mapa a mano. Toca para que vuelva a seguirte';
  }
}

// Los límites de hábitat piden ver la posición con su precisión: se informa del margen del GPS y
// se avisa cuando la señal es demasiado imprecisa para fiarse de en qué lado del límite se está.
function accuracyLabel(accuracy) {
  if (typeof accuracy !== 'number') return '';
  const rounded = Math.round(accuracy);
  return accuracy > 40
    ? `GPS ±${rounded} m (señal imprecisa: tómate los límites de hábitat con cautela)`
    : `GPS ±${rounded} m`;
}

// --- Panel "cerca de ti" (lista ordenada por distancia) -------------------------------------------
function nearbyTargets() {
  const targets = [];
  (state.data.pointsOfInterest || []).forEach(poi => {
    // Mismo criterio que los hábitats: sin coordenadas no hay distancia que ordenar (y leer
    // coords[0] de un null tumbaría el panel entero al llegar la primera posición del GPS).
    if (!poi.coordinates) return;
    targets.push({
      kind: 'poi', id: poi.id, name: poi.name, icon: poiEmoji(poi), coords: poi.coordinates, visited: state.seenPois.has(poi.id)
    });
  });
  (state.data.habitats || []).forEach(h => {
    if (!h.coordinates) return;
    targets.push({ kind: 'habitat', id: h.id, name: h.name, icon: '🌿', coords: h.coordinates, visited: isHabitatComplete(h) });
  });
  return targets;
}

function updateNearby(lat, lng, accuracy) {
  const withDist = nearbyTargets().map(t => ({ ...t, dist: haversineMeters(lat, lng, t.coords[0], t.coords[1]) }));
  withDist.sort((a, b) => a.dist - b.dist);
  const nearest = withDist.slice(0, 8);
  const acc = accuracyLabel(accuracy);
  nearbyStatus.textContent = (acc ? acc + ' · ' : '') + 'Ordenado por distancia a tu posición.';
  // Cada elemento es un <button> real (no un <li> clicable): navegable y activable con teclado.
  nearbyList.innerHTML = html`${nearest.map(t => {
    const distLabel = t.dist < 1000 ? Math.round(t.dist) + ' m' : (t.dist / 1000).toFixed(1) + ' km';
    const here = t.dist < POI_NEAR_METERS;
    return html`<li><button type="button" class="nearby-item${here ? ' here' : ''}" data-kind="${t.kind}" data-id="${String(t.id)}"><span class="nearby-icon" aria-hidden="true">${t.icon}</span><span class="nearby-name">${t.name}${t.visited ? html` <span aria-hidden="true">✓</span><span class="sr-only">(visitado)</span>` : ''}${here ? html`<br><strong>¡Estás aquí!</strong>` : ''}</span><span class="nearby-dist">${distLabel}</span></button></li>`;
  })}`;
}

// --- Descubrimiento por proximidad -----------------------------------------------------------------
function habitatAt(lat, lng) {
  // Con polígono real: punto-en-polígono. Sin él: el mismo círculo aproximado que pinta el mapa.
  // Si varios hábitats se solapan se queda el primero del catálogo (suficiente para el prototipo).
  return (state.data.habitats || []).find(h => {
    const geom = state.geo && state.geo.habitatGeom ? state.geo.habitatGeom[h.id] : null;
    if (geom) return pointInGeometry(lat, lng, geom);
    if (h.coordinates) return haversineMeters(lat, lng, h.coordinates[0], h.coordinates[1]) <= HABITAT_CIRCLE_METERS;
    return false;
  }) || null;
}

function showHint(key, content) {
  if (shownKeys.has(key)) return;
  shownKeys.add(key);
  explorerHint.innerHTML = String(content);
  explorerHint.hidden = false;
  if (navigator.vibrate) navigator.vibrate(80); // toque háptico al descubrir algo (si el móvil puede)
}

function hideHint() {
  explorerHint.hidden = true;
}

// --- Pregunta de hábitat -----------------------------------------------------------------------------
// Al pisar un hábitat con especies catalogadas la app pregunta de frente (diálogo modal con Sí/No)
// si se quiere abrir su catálogo, en vez del banner discreto que se reserva para los POI. El
// overlay se crea perezosamente la primera vez (mismo patrón que el tutorial).
let habitatPromptEl = null;
let habitatPromptOpener = null;

function ensureHabitatPrompt() {
  if (habitatPromptEl) return habitatPromptEl;
  habitatPromptEl = document.createElement('div');
  habitatPromptEl.className = 'habitat-prompt';
  habitatPromptEl.hidden = true;
  habitatPromptEl.innerHTML =
    '<div class="habitat-prompt-backdrop" data-prompt-close></div>' +
    '<div class="habitat-prompt-card" role="dialog" aria-modal="true" aria-labelledby="habitatPromptTitle" aria-describedby="habitatPromptText" tabindex="-1">' +
      '<span class="habitat-prompt-icon" aria-hidden="true">🌿</span>' +
      '<h3 id="habitatPromptTitle"></h3>' +
      '<p id="habitatPromptText"></p>' +
      '<div class="habitat-prompt-actions">' +
        '<button type="button" class="habitat-prompt-no" data-prompt-close>Ahora no</button>' +
        '<button type="button" class="habitat-prompt-yes">Sí, ver especies</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(habitatPromptEl);

  habitatPromptEl.addEventListener('click', event => {
    const yes = event.target.closest('.habitat-prompt-yes');
    if (yes) {
      const id = yes.dataset.habitatId;
      hideHabitatPrompt();
      if (handlers.onShowHabitatSpecies) handlers.onShowHabitatSpecies(id);
      return;
    }
    if (event.target.closest('[data-prompt-close]')) hideHabitatPrompt();
  });
  habitatPromptEl.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); hideHabitatPrompt(); return; }
    if (event.key !== 'Tab') return;
    // Diálogo modal con dos botones: el foco rebota entre ellos y no se escapa al mapa de detrás.
    const noBtn = habitatPromptEl.querySelector('.habitat-prompt-no');
    const yesBtn = habitatPromptEl.querySelector('.habitat-prompt-yes');
    if (event.shiftKey && document.activeElement !== yesBtn) { event.preventDefault(); yesBtn.focus(); }
    else if (!event.shiftKey && document.activeElement === yesBtn) { event.preventDefault(); noBtn.focus(); }
  });
  return habitatPromptEl;
}

function askHabitatSpecies(habitat, unseen, total) {
  const key = 'hab:' + habitat.id;
  if (shownKeys.has(key)) return; // cada hábitat pregunta una vez por sesión de exploración
  shownKeys.add(key);
  const el = ensureHabitatPrompt();
  el.querySelector('#habitatPromptTitle').textContent = 'Estás en ' + habitat.name;
  el.querySelector('#habitatPromptText').textContent = unseen > 0
    ? '¿Quieres ver las especies de este hábitat? Te ' + (unseen === 1 ? 'queda 1' : 'quedan ' + unseen) + ' de ' + total + ' por descubrir.'
    : '¡Hábitat completo! 🏅 ¿Quieres repasar sus ' + total + ' especies?';
  el.querySelector('.habitat-prompt-yes').dataset.habitatId = String(habitat.id);
  // El foco pasa al diálogo y al cerrarlo vuelve a donde estaba: la pregunta no puede pasar
  // desapercibida, que es justo lo que la distingue del banner de los POI.
  habitatPromptOpener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  el.hidden = false;
  el.querySelector('.habitat-prompt-card').focus({ preventScroll: true });
  if (navigator.vibrate) navigator.vibrate(80);
}

function hideHabitatPrompt() {
  if (!habitatPromptEl || habitatPromptEl.hidden) return;
  habitatPromptEl.hidden = true;
  if (habitatPromptOpener && document.contains(habitatPromptOpener) && habitatPromptOpener.getClientRects().length) {
    habitatPromptOpener.focus({ preventScroll: true });
  }
  habitatPromptOpener = null;
}

function checkDiscoveries(lat, lng) {
  // Prioridad al POI (es lo más concreto): el más cercano sin visitar dentro del radio.
  const poiHit = (state.data.pointsOfInterest || [])
    .filter(p => !state.seenPois.has(p.id) && p.coordinates)
    .map(p => ({ p, dist: haversineMeters(lat, lng, p.coordinates[0], p.coordinates[1]) }))
    .filter(x => x.dist <= POI_NEAR_METERS)
    .sort((a, b) => a.dist - b.dist)[0];
  if (poiHit) {
    showHint('poi:' + poiHit.p.id, html`<span class="hint-icon" aria-hidden="true">${poiEmoji(poiHit.p)}</span><span class="hint-body"><strong>¡Estás junto a ${poiHit.p.name}!</strong><span>Punto de interés a ${Math.round(poiHit.dist)} m</span></span><span class="hint-actions"><button type="button" class="hint-primary" data-hint-poi="${poiHit.p.id}">✓ Marcar visitado</button><button type="button" class="hint-close" data-hint-close aria-label="Cerrar aviso">${icon('close', 14)}</button></span>`);
    return;
  }
  // Sin POI cerca: ¿en qué hábitat está pisando?
  const habitat = habitatAt(lat, lng);
  const habitatId = habitat ? habitat.id : null;
  if (habitatId !== currentHabitatId) {
    currentHabitatId = habitatId;
    // El polígono del hábitat pisado se resalta (y se atenúa al salir): los límites entre
    // hábitats dejan de depender del ojo experto.
    highlightHabitat(habitatId);
    if (habitat) {
      const total = (habitat.speciesIds || []).length;
      const unseen = (habitat.speciesIds || []).filter(id => !state.seenSpecies.has(id)).length;
      if (total > 0) {
        askHabitatSpecies(habitat, unseen, total);
      } else {
        // Sin especies catalogadas no hay pregunta que hacer: basta el aviso discreto de siempre.
        showHint('hab:' + habitat.id, html`<span class="hint-icon" aria-hidden="true">🌿</span><span class="hint-body"><strong>Estás en ${habitat.name}</strong><span>Sin especies catalogadas todavía</span></span><span class="hint-actions"><button type="button" class="hint-close" data-hint-close aria-label="Cerrar aviso">${icon('close', 14)}</button></span>`);
      }
    }
  }
}

// --- Arranque / parada del modo explorador ----------------------------------------------------------
function startExplorerMode() {
  const blocked = geoUnavailableReason();
  if (blocked) {
    nearbyPanel.hidden = false;
    nearbyStatus.textContent = blocked;
    return;
  }
  state.explorerActive = true;
  nearbyPanel.hidden = false;
  nearbyStatus.textContent = 'Buscando tu posición…';
  nearbyList.innerHTML = '';
  shownKeys = new Set();
  currentHabitatId = null;
  setFollow(true); // encender el explorador es también empezar a seguir: es el mismo gesto
  state.explorerWatchId = navigator.geolocation.watchPosition(
    pos => {
      const { latitude: lat, longitude: lng, accuracy } = pos.coords;
      lastFix = { lat, lng };
      placeUserMarker(lat, lng, accuracy);
      if (followActive) centerOn(lat, lng); // el mapa te acompaña (y el primer fix te acerca)
      updateNearby(lat, lng, accuracy);
      checkDiscoveries(lat, lng);
      // La misma posición alimenta la verificación de presencia (presence.js decide si la envía:
      // aquí llegan fixes cada pocos segundos y allí se espacian).
      if (handlers.onFix) handlers.onFix(lat, lng, accuracy);
    },
    error => {
      nearbyStatus.textContent = geoErrorMessage(error);
    },
    // maximumAge bajo: para seguir el paso del usuario hacen falta posiciones frescas, no cacheadas.
    // La alta precisión es una preferencia (Perfil y ajustes): da mejor lectura de en qué hábitat
    // estás, a cambio de batería, y hay quien prefiere lo segundo en una ruta larga.
    { enableHighAccuracy: highAccuracyPref(), maximumAge: 3000, timeout: 20000 }
  );
  // "Seguirme al explorar": arrancar ya con el mapa acompañando, sin tener que pulsar el 🎯.
  if (!followActive && window.NaturDexPrefs && window.NaturDexPrefs.get('followByDefault')) setFollow(true);
}

function highAccuracyPref() {
  return !window.NaturDexPrefs || window.NaturDexPrefs.get('highAccuracyGps') !== false;
}

function stopExplorerMode() {
  state.explorerActive = false;
  nearbyPanel.hidden = true;
  hideHint();
  hideHabitatPrompt();
  setFollow(false); // también repinta el botón (vuelve a "Modo explorador")
  lastFix = null;
  currentHabitatId = null;
  highlightHabitat(null);
  if (state.explorerWatchId != null) navigator.geolocation.clearWatch(state.explorerWatchId);
  state.explorerWatchId = null;
  if (state.userMarker) { state.userMarker.remove(); state.userMarker = null; }
  if (state.userAccuracyCircle) { state.userAccuracyCircle.remove(); state.userAccuracyCircle = null; }
}

// --- Cableado ----------------------------------------------------------------------------------------
export function initExplorer(h) {
  Object.assign(handlers, h);

  // Un solo botón para las tres cosas: encender el GPS, recuperar el seguimiento si el usuario ha
  // movido el mapa, y apagarlo todo. Salir también se puede por la × del panel "Cerca de ti".
  explorerToggle.addEventListener('click', () => {
    if (!state.explorerActive) startExplorerMode();
    else if (!followActive) setFollow(true); // recentrar sin salir del modo explorador
    else stopExplorerMode();
  });
  nearbyClose.addEventListener('click', stopExplorerMode);

  // Arrastrar el mapa a mano = tomar el mando: el seguimiento se apaga solo (el GPS sigue vivo).
  map.on('dragstart', () => { if (followActive) setFollow(false); });

  nearbyList.addEventListener('click', event => {
    const item = event.target.closest('.nearby-item');
    if (!item) return;
    const { kind, id } = item.dataset;
    // Ir a un punto de la lista también es tomar el mando: si no, el siguiente fix del GPS
    // devolvería el mapa a tu posición de golpe. El botón queda en "Centrar en mí".
    if (followActive) setFollow(false);
    if (kind === 'poi') {
      const marker = state.poiMarkers.get(id);
      if (marker) { focusOn(marker.getLatLng(), 16, { animate: true }); marker.openPopup(); }
    } else if (kind === 'habitat') {
      const layer = state.habitatLayers.get(id);
      if (layer) {
        const bounds = layer.getBounds ? layer.getBounds() : null;
        if (bounds) fitOn(bounds, { maxZoom: 15 });
        if (layer.openPopup) layer.openPopup();
      }
    }
  });

  explorerHint.addEventListener('click', event => {
    const poiBtn = event.target.closest('[data-hint-poi]');
    if (poiBtn) {
      if (handlers.onTogglePoiSeen) handlers.onTogglePoiSeen(poiBtn.dataset.hintPoi);
      hideHint();
      return;
    }
    if (event.target.closest('[data-hint-close]')) hideHint();
  });
}
