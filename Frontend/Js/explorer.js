// ================================================================================================
// explorer.js — modo explorador: GPS continuo, panel "cerca de ti" y descubrimiento por proximidad.
// ------------------------------------------------------------------------------------------------
// Módulo ES importado por app.js. Sigue la posición real del usuario (watchPosition) y, además de
// listar lo más cercano ordenado por distancia, DETECTA dónde está: si entra en el radio de un
// punto de interés (~60 m) ofrece marcarlo como visitado con un toque, y si está dentro del
// polígono de un hábitat le dice qué especies puede descubrir ahí. Es la mecánica pokédex en
// campo: pasear por el parque hace que la app reaccione, en vez de tener que buscar en listas.
//
// No conoce la lógica de vistas: las acciones (marcar POI, abrir el catálogo de un hábitat) las
// inyecta app.js en initExplorer(), igual que hace map.js con setMapHandlers().
// ================================================================================================

import { html, poiEmoji, haversineMeters, pointInGeometry } from './util.js';
import { state, isHabitatComplete } from './state.js';
import {
  explorerToggle, nearbyPanel, nearbyStatus, nearbyList, nearbyClose, explorerHint
} from './dom.js';
import { map, placeUserMarker } from './map.js';

// Umbrales de proximidad. El de POI coincide con el "¡Estás aquí!" del panel cercano; el círculo
// de hábitat es el mismo radio que dibuja map.js cuando un hábitat no tiene polígono todavía.
const POI_NEAR_METERS = 60;
const HABITAT_CIRCLE_METERS = 420;

const handlers = {
  onTogglePoiSeen: null,      // (poiId) desde el botón "Marcar visitado" del aviso
  onShowHabitatSpecies: null  // (habitatId) desde el botón "Ver especies" del aviso
};

// Avisos ya mostrados en esta sesión de exploración (para no repetir el mismo al ritmo del GPS).
let shownKeys = new Set();
let currentHabitatId = null;

// --- Panel "cerca de ti" (lista ordenada por distancia) -------------------------------------------
function nearbyTargets() {
  const targets = [];
  (state.data.pointsOfInterest || []).forEach(poi => targets.push({
    kind: 'poi', id: poi.id, name: poi.name, icon: poiEmoji(poi), coords: poi.coordinates, visited: state.seenPois.has(poi.id)
  }));
  (state.data.habitats || []).forEach(h => {
    if (!h.coordinates) return;
    targets.push({ kind: 'habitat', id: h.id, name: h.name, icon: '🌿', coords: h.coordinates, visited: isHabitatComplete(h) });
  });
  return targets;
}

function updateNearby(lat, lng) {
  const withDist = nearbyTargets().map(t => ({ ...t, dist: haversineMeters(lat, lng, t.coords[0], t.coords[1]) }));
  withDist.sort((a, b) => a.dist - b.dist);
  const nearest = withDist.slice(0, 8);
  nearbyStatus.textContent = 'Ordenado por distancia a tu posición actual.';
  nearbyList.innerHTML = html`${nearest.map(t => {
    const distLabel = t.dist < 1000 ? Math.round(t.dist) + ' m' : (t.dist / 1000).toFixed(1) + ' km';
    const here = t.dist < POI_NEAR_METERS;
    return html`<li class="nearby-item${here ? ' here' : ''}" data-kind="${t.kind}" data-id="${String(t.id)}"><span class="nearby-icon">${t.icon}</span><span class="nearby-name">${t.name}${t.visited ? ' ✓' : ''}${here ? html`<br><strong>¡Estás aquí!</strong>` : ''}</span><span class="nearby-dist">${distLabel}</span></li>`;
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

function checkDiscoveries(lat, lng) {
  // Prioridad al POI (es lo más concreto): el más cercano sin visitar dentro del radio.
  const poiHit = (state.data.pointsOfInterest || [])
    .filter(p => !state.seenPois.has(p.id) && p.coordinates)
    .map(p => ({ p, dist: haversineMeters(lat, lng, p.coordinates[0], p.coordinates[1]) }))
    .filter(x => x.dist <= POI_NEAR_METERS)
    .sort((a, b) => a.dist - b.dist)[0];
  if (poiHit) {
    showHint('poi:' + poiHit.p.id, html`<span class="hint-icon">${poiEmoji(poiHit.p)}</span><span class="hint-body"><strong>¡Estás junto a ${poiHit.p.name}!</strong><span>Punto de interés a ${Math.round(poiHit.dist)} m</span></span><span class="hint-actions"><button type="button" class="hint-primary" data-hint-poi="${poiHit.p.id}">✓ Marcar visitado</button><button type="button" class="hint-close" data-hint-close aria-label="Cerrar aviso">✕</button></span>`);
    return;
  }
  // Sin POI cerca: ¿en qué hábitat está pisando?
  const habitat = habitatAt(lat, lng);
  const habitatId = habitat ? habitat.id : null;
  if (habitatId !== currentHabitatId) {
    currentHabitatId = habitatId;
    if (habitat) {
      const total = (habitat.speciesIds || []).length;
      const unseen = (habitat.speciesIds || []).filter(id => !state.seenSpecies.has(id)).length;
      const caption = unseen > 0
        ? unseen + (unseen === 1 ? ' especie por descubrir aquí' : ' especies por descubrir aquí')
        : (total > 0 ? '¡Hábitat completo! 🏅' : 'Sin especies catalogadas todavía');
      showHint('hab:' + habitat.id, html`<span class="hint-icon">🌿</span><span class="hint-body"><strong>Estás en ${habitat.name}</strong><span>${caption}</span></span><span class="hint-actions">${unseen > 0 ? html`<button type="button" class="hint-primary" data-hint-habitat="${habitat.id}">Ver especies</button>` : ''}<button type="button" class="hint-close" data-hint-close aria-label="Cerrar aviso">✕</button></span>`);
    }
  }
}

// --- Arranque / parada del modo explorador ----------------------------------------------------------
function startExplorerMode() {
  if (!('geolocation' in navigator)) {
    nearbyPanel.hidden = false;
    nearbyStatus.textContent = 'Tu navegador no admite geolocalización.';
    return;
  }
  state.explorerActive = true;
  explorerToggle.classList.add('active');
  explorerToggle.textContent = '📍 Explorando…';
  nearbyPanel.hidden = false;
  nearbyStatus.textContent = 'Buscando tu posición…';
  nearbyList.innerHTML = '';
  shownKeys = new Set();
  currentHabitatId = null;
  state.explorerWatchId = navigator.geolocation.watchPosition(
    pos => {
      placeUserMarker(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy);
      updateNearby(pos.coords.latitude, pos.coords.longitude);
      checkDiscoveries(pos.coords.latitude, pos.coords.longitude);
    },
    error => {
      nearbyStatus.textContent = 'No se pudo obtener tu posición (' + (error.message || 'permiso denegado') + ').';
    },
    { enableHighAccuracy: true, maximumAge: 15000, timeout: 20000 }
  );
}

function stopExplorerMode() {
  state.explorerActive = false;
  explorerToggle.classList.remove('active');
  explorerToggle.textContent = '📍 Modo explorador';
  nearbyPanel.hidden = true;
  hideHint();
  if (state.explorerWatchId != null) navigator.geolocation.clearWatch(state.explorerWatchId);
  state.explorerWatchId = null;
  if (state.userMarker) { state.userMarker.remove(); state.userMarker = null; }
  if (state.userAccuracyCircle) { state.userAccuracyCircle.remove(); state.userAccuracyCircle = null; }
}

// --- Cableado ----------------------------------------------------------------------------------------
export function initExplorer(h) {
  Object.assign(handlers, h);

  explorerToggle.addEventListener('click', () => { state.explorerActive ? stopExplorerMode() : startExplorerMode(); });
  nearbyClose.addEventListener('click', stopExplorerMode);

  nearbyList.addEventListener('click', event => {
    const item = event.target.closest('.nearby-item');
    if (!item) return;
    const { kind, id } = item.dataset;
    if (kind === 'poi') {
      const marker = state.poiMarkers.get(id);
      if (marker) { map.setView(marker.getLatLng(), 16, { animate: true }); marker.openPopup(); }
    } else if (kind === 'habitat') {
      const layer = state.habitatLayers.get(id);
      if (layer) {
        const bounds = layer.getBounds ? layer.getBounds() : null;
        if (bounds) map.fitBounds(bounds, { maxZoom: 15 });
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
    const habBtn = event.target.closest('[data-hint-habitat]');
    if (habBtn) {
      if (handlers.onShowHabitatSpecies) handlers.onShowHabitatSpecies(habBtn.dataset.hintHabitat);
      hideHint();
      return;
    }
    if (event.target.closest('[data-hint-close]')) hideHint();
  });
}
