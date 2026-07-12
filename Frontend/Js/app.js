// ================================================================================================
// app.js — orquestador de la experiencia del parque.
// ------------------------------------------------------------------------------------------------
// Módulo ES de entrada. Los detalles viven en los demás módulos: estado y selectores (state.js),
// referencias DOM (dom.js), capa de datos (data.js), pintado del DOM (render.js) y Leaflet
// (map.js). Aquí queda la navegación entre vistas, la delegación de eventos, el modo explorador,
// la UI offline y el arranque del parque.
//
// API global (scripts clásicos auth.js/offline.js dependen de ella):
//   window.startParkExperience(slug, user) — auth.js la llama al elegir parque.
//   window.naturdexInvalidateMap()         — auth.js la llama al mostrar la pantalla del parque.
//   window.__imgFallback / window.__habitatImgFallback — las publica render.js (onerror inline).
// ================================================================================================

import { html, poiEmoji, haversineMeters } from './util.js';
import {
  DEFAULT_PARK_SLUG, PARK_INDEX_PATH,
  state, isHabitatComplete, computeProgress, speciesLatLng
} from './state.js';
import {
  resolveActivePark, loadManifest, loadData, loadGeo,
  loadProgress, persistProgress
} from './data.js';
import {
  speciesList, searchInput, catalogControls, catalogPanel,
  backToHabitatsBtn, catalogCrumbLabel, parkTitle, progressPanel, detailPanel, sheetClose,
  explorerToggle, nearbyPanel, nearbyStatus, nearbyList, nearbyClose,
  saveOfflineBtn, connStatus
} from './dom.js';
import {
  renderHabitatCatalog, renderSpeciesList, renderCatalogBody,
  renderSummary, renderProgress, renderDetail, renderProgressTab
} from './render.js';
import {
  map, setMapHandlers, ensureMapSized, placeUserMarker,
  renderMarkers, renderPoiMarkers, renderTrails, renderProtectedAreas, renderHabitatZones
} from './map.js';

// --- Navegación del catálogo ----------------------------------------------------------------------
function enterHabitat(habitatId) {
  state.habitatFocus = habitatId;
  state.catalogMode = 'species';
  state.query = '';
  searchInput.value = '';
  // Al entrar en un hábitat concreto, su etiqueta se muestra en el panel de detalle de la derecha.
  // "Ver todas las especies" (habitatId nulo) no tiene hábitat que mostrar, así que no la toca.
  if (habitatId) selectHabitat(habitatId);
  renderCatalogBody();
}

// Muestra la etiqueta (ficha) de un hábitat en el panel de detalle de la derecha.
function selectHabitat(habitatId) {
  state.selectedHabitatId = habitatId;
  state.detailMode = 'habitat';
  renderDetail();
}

function backToHabitats() {
  state.habitatFocus = null;
  state.catalogMode = 'habitats';
  state.query = '';
  searchInput.value = '';
  renderCatalogBody();
}

function focusHabitat(habitatId) {
  // Entrada al catálogo de especies de un hábitat desde su popup en el mapa.
  closeDetailSheet();
  setView('catalog');
  enterHabitat(habitatId);
}

function selectSpecies(id, focusMap = true) {
  state.selectedId = Number(id);
  state.detailMode = 'species';
  renderSpeciesList();
  renderDetail();
  const species = state.data.species.find(item => item.id === state.selectedId);
  const marker = state.markers.get(state.selectedId);
  if (species && marker && focusMap) {
    // Si el marcador está dentro de un clúster, abrimos el clúster hasta mostrarlo y luego el popup.
    if (map.hasLayer(state.speciesCluster) && typeof state.speciesCluster.zoomToShowLayer === 'function') {
      state.speciesCluster.zoomToShowLayer(marker, () => marker.openPopup());
    } else {
      map.setView(speciesLatLng(species), 14, { animate: true });
      marker.openPopup();
    }
  }
  openDetailSheet(); // en móvil, la ficha se muestra como bottom-sheet
}

// --- Marcar visto / visitado ------------------------------------------------------------------------
function afterSeenChange() {
  // El detalle de especie es independiente del modo del catálogo (hábitats o especies), así que
  // se refresca lo que corresponda en cada uno sin pisar una lista de hábitats con la de especies.
  if (state.view === 'catalog') renderCatalogBody(); else renderProgressTab();
  renderDetail();
  renderMarkers();
  renderHabitatZones();
  renderProgress();
}

// Al marcar una especie como vista, la ubicación del avistamiento la aporta el GPS del dispositivo.
// Si el usuario deniega el permiso o no hay GPS, se marca igualmente como vista y el marcador cae
// en la coordenada representativa del catálogo (con aviso en el popup).
function captureSighting(numericId) {
  const finish = (coords) => {
    if (coords) state.sightings.set(numericId, coords);
    renderMarkers();
    if (state.selectedId === numericId) renderDetail();
    persistProgress('species', numericId, true, coords);
  };
  if (!('geolocation' in navigator)) { finish(null); return; }
  navigator.geolocation.getCurrentPosition(
    pos => finish({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
    () => finish(null),
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
  );
}

function toggleSpeciesSeen(id) {
  const numericId = Number(id);
  const nowSeen = !state.seenSpecies.has(numericId);
  if (nowSeen) {
    state.seenSpecies.add(numericId);
    afterSeenChange();
    captureSighting(numericId);
  } else {
    state.seenSpecies.delete(numericId);
    state.sightings.delete(numericId);
    afterSeenChange();
    persistProgress('species', numericId, false);
  }
}

function togglePoiSeen(id) {
  const nowSeen = !state.seenPois.has(id);
  if (nowSeen) state.seenPois.add(id); else state.seenPois.delete(id);
  renderPoiMarkers();
  if (state.view === 'progress') renderProgressTab();
  persistProgress('poi', id, nowSeen);
}

// Acciones que los popups del mapa disparan sobre la app (ver map.js).
setMapHandlers({
  onSelectSpecies: selectSpecies,
  onFocusHabitat: focusHabitat,
  onTogglePoiSeen: togglePoiSeen
});

// --- Vistas (catálogo / progreso) ---------------------------------------------------------------------
function setView(view) {
  state.view = view;
  document.querySelectorAll('.view-tab').forEach(btn => {
    const active = btn.dataset.view === view;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', active ? 'true' : 'false');
  });
  catalogControls.hidden = view !== 'catalog';
  catalogPanel.hidden = view !== 'catalog';
  progressPanel.hidden = view !== 'progress';
  if (view === 'progress') renderProgressTab();
  else renderCatalogBody();
  syncMobileNav(view); // catálogo y progreso también son pestañas de la nav inferior móvil
}

// --- Vistas móviles: nav inferior + ficha como bottom-sheet -------------------------------------
// En ≤900px la app funciona por pantallas completas (Catálogo / Mapa / Progreso) conmutadas por la
// nav inferior (body[data-mtab] en CSS), y la ficha de detalle se desliza como bottom-sheet
// (body.sheet-open). En escritorio estas funciones son inofensivas: la nav está oculta y la clase
// sheet-open solo tiene efecto dentro de la media query móvil.
const mobileMedia = window.matchMedia('(max-width: 900px)');

function syncMobileNav(tab) {
  document.body.dataset.mtab = tab;
  document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
    const active = btn.dataset.mtab === tab;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', active ? 'true' : 'false');
  });
}

function setMobileTab(tab) {
  if (tab === 'map') {
    syncMobileNav('map');
    closeDetailSheet();
    ensureMapSized(); // el mapa estaba display:none; Leaflet debe recalcular el tamaño del contenedor
  } else {
    setView(tab); // 'catalog' | 'progress' — setView ya sincroniza la nav inferior
  }
}

function openDetailSheet() {
  if (mobileMedia.matches) document.body.classList.add('sheet-open');
}

function closeDetailSheet() {
  document.body.classList.remove('sheet-open');
}

document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
  btn.addEventListener('click', () => setMobileTab(btn.dataset.mtab));
});
if (sheetClose) sheetClose.addEventListener('click', closeDetailSheet);
// La miga de pan del catálogo abre la ficha del hábitat en el que se está navegando.
catalogCrumbLabel.addEventListener('click', () => {
  if (state.habitatFocus) { selectHabitat(state.habitatFocus); openDetailSheet(); }
});
syncMobileNav('catalog'); // pestaña inicial

// --- Delegación de eventos ------------------------------------------------------------------------------
speciesList.addEventListener('click', event => {
  const card = event.target.closest('.species-card');
  if (card) { selectSpecies(card.dataset.id); return; }
  const habitatCard = event.target.closest('.habitat-card');
  if (habitatCard) { enterHabitat(habitatCard.dataset.habitat); return; }
  if (event.target.closest('#viewAllSpeciesBtn')) enterHabitat(null);
});

detailPanel.addEventListener('click', event => {
  const seenBtn = event.target.closest('[data-toggle-seen]');
  if (seenBtn) { toggleSpeciesSeen(seenBtn.dataset.toggleSeen); return; }
  // Desde la etiqueta de hábitat: abrir el catálogo de especies de ese hábitat.
  const viewSpecies = event.target.closest('[data-view-habitat-species]');
  if (viewSpecies) { focusHabitat(viewSpecies.dataset.viewHabitatSpecies); return; }
  // Desde una de las especies listadas en la etiqueta de hábitat: abrir su ficha.
  const chip = event.target.closest('[data-species-chip]');
  if (chip) {
    setView('catalog');
    enterHabitat(state.selectedHabitatId);
    selectSpecies(chip.dataset.speciesChip);
  }
});

document.querySelectorAll('.filter-button').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.filter-button').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    state.filter = button.dataset.filter;
    renderSpeciesList();
  });
});

document.querySelectorAll('.view-tab').forEach(button => {
  button.addEventListener('click', () => setView(button.dataset.view));
});

backToHabitatsBtn.addEventListener('click', backToHabitats);

searchInput.addEventListener('input', event => {
  state.query = event.target.value;
  if (state.catalogMode === 'species') renderSpeciesList(); else renderHabitatCatalog();
});

// --- Modo explorador: primer paso hacia la guía ambiental móvil ---------------------------------
// Activa el GPS del dispositivo de forma continua (watchPosition) y muestra, ordenados por
// distancia, los puntos de interés y hábitats más cercanos a la posición real del usuario. Es la
// base sobre la que, en la futura app móvil, se irán "activando" fichas y logros a medida que el
// usuario se pasea físicamente por el parque, en vez de tener que buscarlos en una lista.
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
    const here = t.dist < 60;
    return html`<li class="nearby-item${here ? ' here' : ''}" data-kind="${t.kind}" data-id="${String(t.id)}"><span class="nearby-icon">${t.icon}</span><span class="nearby-name">${t.name}${t.visited ? ' ✓' : ''}${here ? html`<br><strong>¡Estás aquí!</strong>` : ''}</span><span class="nearby-dist">${distLabel}</span></li>`;
  })}`;
}

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
  state.explorerWatchId = navigator.geolocation.watchPosition(
    pos => {
      placeUserMarker(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy);
      updateNearby(pos.coords.latitude, pos.coords.longitude);
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
  if (state.explorerWatchId != null) navigator.geolocation.clearWatch(state.explorerWatchId);
  state.explorerWatchId = null;
  if (state.userMarker) { state.userMarker.remove(); state.userMarker = null; }
  if (state.userAccuracyCircle) { state.userAccuracyCircle.remove(); state.userAccuracyCircle = null; }
}

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

// --- UI de estado offline (indicador de conexión + botón "Guardar sin conexión") -----------------
function initOfflineUI() {
  const btn = saveOfflineBtn;
  const status = connStatus;
  if (!btn || !status) return;

  const refresh = () => {
    const online = NaturDexOffline.isOnline();
    const saved = NaturDexOffline.isParkSaved(state.activeParkSlug);
    status.textContent = online ? 'En línea' : (saved ? 'Sin conexión · parque guardado' : 'Sin conexión');
    status.classList.toggle('offline', !online);
    if (saved) { btn.textContent = '✓ Guardado sin conexión'; btn.classList.add('saved'); }
  };
  refresh();
  NaturDexOffline.onConnectivityChange(refresh);

  btn.addEventListener('click', async () => {
    if (!state.manifest || btn.classList.contains('saved')) return;
    btn.disabled = true;
    const total = (state.manifest.images || []).length;
    btn.textContent = 'Guardando… 0/' + total;
    try {
      await NaturDexOffline.saveParkOffline(state.manifest, (done, tot) => {
        btn.textContent = 'Guardando… ' + done + '/' + tot;
      });
      btn.textContent = '✓ Guardado sin conexión';
      btn.classList.add('saved');
    } catch (e) {
      btn.textContent = '⬇️ Guardar sin conexión';
      console.info('No se pudo guardar el parque sin conexión', e);
    } finally {
      btn.disabled = false;
      refresh();
    }
  });
}

// --- Arranque de la experiencia de un parque -------------------------------------------------------
// Carga la experiencia completa de un parque concreto. Lo llama auth.js cuando el usuario elige un
// parque en el mapa de España. Se puede llamar varias veces (cambiar de parque): las funciones de
// render limpian y reconstruyen sus capas, así que recargar los datos basta.
let parkExperienceInited = false;
async function startParkExperience(slug, user) {
  NaturDexOffline.registerServiceWorker(); // mejora progresiva, no bloqueante
  if (user) { state.userId = user.id; state.userName = user.name || user.email; }

  const registry = (await NaturDexOffline.fetchJsonCached(PARK_INDEX_PATH)).data;
  state.activeParkSlug = slug || (registry && registry.defaultPark) || DEFAULT_PARK_SLUG;
  const parkEntry = resolveActivePark({ ...registry, defaultPark: state.activeParkSlug });
  if (!parkEntry) throw new Error('No hay ningún parque disponible en el registro.');
  state.activeParkSlug = parkEntry.slug;
  const manifest = await loadManifest(parkEntry);
  state.manifest = manifest;

  await Promise.all([loadData(manifest), loadGeo(manifest), loadProgress()]);

  if (parkTitle && state.data.park && state.data.park.name) parkTitle.textContent = state.data.park.name;

  state.selectedId = state.data.species[0]?.id ?? null;
  // Al entrar al parque, el panel de detalle de la derecha muestra por defecto la etiqueta de un
  // hábitat (no la de una especie). Se prefiere un hábitat sin nota de revisión para una portada
  // limpia; si todos la tuvieran, se usa el primero.
  const defaultHabitat = (state.data.habitats || []).find(h => !h.reviewNote)
    || (state.data.habitats || [])[0];
  state.selectedHabitatId = defaultHabitat ? defaultHabitat.id : null;
  state.detailMode = 'habitat';
  renderSummary();
  renderProtectedAreas();
  renderTrails();
  renderHabitatZones();
  renderMarkers();
  renderPoiMarkers();
  renderCatalogBody();
  renderDetail();
  state.parkWasComplete = computeProgress().parkComplete;
  map.setView(state.data.park.center, 12);
  // Leaflet cachea el tamaño del contenedor al crearse; si el layout aún no estaba listo (0 de
  // alto), el mapa no dibuja capas ni teselas (ver ensureMapSized en map.js).
  ensureMapSized();

  if (!parkExperienceInited) { initOfflineUI(); parkExperienceInited = true; }
}
window.startParkExperience = startParkExperience;
window.naturdexInvalidateMap = ensureMapSized; // auth.js lo llama al mostrar la pantalla del parque
