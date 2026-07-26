// ================================================================================================
// app.js — orquestador de la experiencia del parque.
// ------------------------------------------------------------------------------------------------
// Módulo ES de entrada. Los detalles viven en los demás módulos: estado y selectores (state.js),
// referencias DOM (dom.js), capa de datos (data.js), pintado del DOM (render.js), Leaflet (map.js)
// y modo explorador (explorer.js). Aquí queda la navegación entre vistas, la delegación de
// eventos, la UI offline y el arranque del parque.
//
// API global (scripts clásicos auth.js/offline.js dependen de ella):
//   window.startParkExperience(slug, user) — auth.js la llama al elegir parque.
//   window.naturdexInvalidateMap()         — auth.js la llama al mostrar la pantalla del parque.
//   window.__imgFallback / window.__habitatImgFallback — las publica render.js (onerror inline).
// ================================================================================================

import {
  DEFAULT_PARK_SLUG, PARK_INDEX_PATH,
  state, computeProgress, speciesLatLng, relatedSpeciesIds, isHabitatComplete
} from './state.js';
import { iconMarkup, geoUnavailableReason, formatBytes } from './util.js';
import {
  resolveActivePark, loadManifest, loadData, loadGeo,
  loadProgress, persistProgress, flushProgressQueue
} from './data.js';
import {
  speciesList, searchInput, catalogControls, catalogPanel,
  backToHabitatsBtn, catalogCrumbLabel, parkTitle, parkEyebrow, parkStats, parkProgressWrap,
  progressPanel, invasorasPanel, basicNotice, detailPanel, sheetClose, sheetScrim,
  saveOfflineBtn, connStatus, layersToggle, layersPanel, explorerToggle
} from './dom.js';
import {
  renderHabitatCatalog, renderSpeciesList, renderCatalogBody,
  renderSummary, renderProgress, renderDetail, renderProgressTab, renderInvasoras,
  renderBasicPark, renderAccountProgress
} from './render.js';
import {
  map, setMapHandlers, ensureMapSized, soloHabitat, setupParkBaseLayer, applyBaseChoice,
  renderMarkers, renderPoiMarkers, renderTrails, renderProtectedAreas, renderHabitatZones
} from './map.js';
import { initExplorer } from './explorer.js';
import { initLayersPanel, refreshLayersPanel } from './layers.js';
import { loadGlossary, initGlossaryPopover } from './glossary.js';
import { initTutorial } from './tutorial.js';
import { initAchievements, noteParkActivity, handleServerNewlyUnlocked, reportFlavorFlag, reportInvasiveSeen, refreshAccountProgress, syncWithServer } from './achievements.js';
import { initProfile, showProfile } from './profile.js';
import { showNotice } from './notice.js';

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

// Pestaña de invasoras: lista a la izquierda + ficha en el panel de detalle de la derecha (como especies).
function invasorasList() {
  const region = state.data.park && state.data.park.region;
  return (state.data.invasoras || []).filter(i => !region || i.ccaa === region);
}
function showInvasoras() {
  const list = invasorasList();
  if (!list.some(i => i.scientificName === state.selectedInvasora)) {
    state.selectedInvasora = list.length ? list[0].scientificName : null;
  }
  state.detailMode = 'invasora';
  renderInvasoras();
  renderDetail(); // muestra la ficha por defecto en la derecha (en escritorio siempre visible)
}
function selectInvasora(scientificName) {
  state.selectedInvasora = scientificName;
  state.detailMode = 'invasora';
  renderInvasoras();
  renderDetail();
  openDetailSheet(); // en móvil, la ficha se desliza como bottom-sheet
}

// Muestra la etiqueta (ficha) de un hábitat en el panel de detalle de la derecha y lo aísla en el
// mapa: al elegir un hábitat en el catálogo se apagan los demás y solo se ve este (el usuario puede
// reactivar el resto desde el panel de capas). Se refresca dicho panel para que sus casillas cuadren.
function selectHabitat(habitatId) {
  state.selectedHabitatId = habitatId;
  state.detailMode = 'habitat';
  renderDetail();
  soloHabitat(habitatId);
  refreshLayersPanel();
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
// en la coordenada representativa del catálogo (con aviso en el popup). `alsoSeen` son las demás
// apariciones de la misma especie (otros hábitats): se marcan vistas también, pero sin avistamiento
// GPS propio (cada una usa su coordenada representativa en el mapa).
function captureSighting(numericId, alsoSeen = []) {
  const finish = (coords) => {
    if (coords) state.sightings.set(numericId, coords);
    renderMarkers();
    if (state.selectedId === numericId) renderDetail();
    noteParkActivity(state.activeParkSlug);
    // Predicción offline inmediata (sin esperar respuesta de red): el usuario puede estar sin
    // cobertura en pleno campo y el cartel de celebración debe aparecer igual.
    refreshAccountProgress();
    persistProgress('species', numericId, true, coords).then(res => res && handleServerNewlyUnlocked(res.newlyUnlocked));
    alsoSeen.forEach(rid => persistProgress('species', rid, true).then(res => res && handleServerNewlyUnlocked(res.newlyUnlocked)));
    checkNoSearchHabitatFlavor(numericId);
  };
  // Sin geolocalización posible (navegador sin API o contexto no seguro) el avistamiento se marca
  // igual, solo que sin coordenada GPS propia — no bloquea al usuario.
  if (geoUnavailableReason()) { finish(null); return; }
  navigator.geolocation.getCurrentPosition(
    pos => finish({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
    () => finish(null),
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
  );
}

function toggleSpeciesSeen(id) {
  const numericId = Number(id);
  const nowSeen = !state.seenSpecies.has(numericId);
  // La misma especie puede aparecer en varios hábitats del parque: el "visto" se propaga a todas
  // sus apariciones (por nombre científico), así el progreso del catálogo, de cada hábitat y del
  // parque cuadra estén como estén modeladas las fichas.
  const related = relatedSpeciesIds(numericId);
  const others = related.filter(rid => rid !== numericId);
  if (nowSeen) {
    related.forEach(rid => state.seenSpecies.add(rid));
    afterSeenChange();
    captureSighting(numericId, others);
  } else {
    related.forEach(rid => { state.seenSpecies.delete(rid); state.sightings.delete(rid); });
    afterSeenChange();
    related.forEach(rid => persistProgress('species', rid, false));
  }
}

function togglePoiSeen(id) {
  const nowSeen = !state.seenPois.has(id);
  if (nowSeen) state.seenPois.add(id); else state.seenPois.delete(id);
  renderPoiMarkers();
  if (state.view === 'progress') renderProgressTab();
  if (nowSeen) { noteParkActivity(state.activeParkSlug); refreshAccountProgress(); }
  persistProgress('poi', id, nowSeen).then(res => res && handleServerNewlyUnlocked(res.newlyUnlocked));
}

// Logro de sabor "hábitat completado sin buscador": si marcar esta especie acaba de completar
// alguno de sus hábitats y en toda la sesión no se ha escrito nada en el buscador, se reporta.
function checkNoSearchHabitatFlavor(speciesId) {
  if (state.searchUsedThisSession) return;
  const habitats = (state.data.habitats || []).filter(h => (h.speciesIds || []).includes(speciesId));
  if (habitats.some(h => isHabitatComplete(h))) reportFlavorFlag('noSearchHabitat');
}

// Acciones que los popups del mapa disparan sobre la app (ver map.js).
setMapHandlers({
  onSelectSpecies: selectSpecies,
  onFocusHabitat: focusHabitat,
  onTogglePoiSeen: togglePoiSeen
});

// --- Nivel de dato del espacio (ficha base vs. catálogo completo) --------------------------------
// Los espacios "basic" (N1 del rollout nacional) tienen límite oficial y Red Natura 2000 pero aún no
// catálogo. En vez de enseñar listas vacías y contadores a cero, se apaga todo lo que depende del
// catálogo y la barra lateral pasa a mostrar el aviso de ficha base (render.js · renderBasicPark).
function applyParkLevel(level) {
  const basic = level === 'basic';
  state.parkLevel = basic ? 'basic' : 'full';
  document.body.dataset.parkLevel = state.parkLevel;
  if (parkEyebrow) parkEyebrow.textContent = basic ? 'Ficha base' : 'NaturDex piloto';
  // Contadores y barra de progreso: sin catálogo no hay nada que contar, así que se ocultan.
  if (parkStats) parkStats.hidden = basic;
  if (parkProgressWrap) parkProgressWrap.hidden = basic;
  // La pestaña de progreso mediría una colección que todavía no existe (y el modo explorador
  // descubriría especies y POIs que aún no están cargados): se ocultan mientras el espacio sea N1.
  document.querySelectorAll('.view-tab[data-view="progress"], .mobile-nav-btn[data-mtab="progress"]')
    .forEach(btn => { btn.hidden = basic; });
  if (explorerToggle) explorerToggle.hidden = basic;
}

// --- Vistas (catálogo / progreso) ---------------------------------------------------------------------
function setView(view) {
  const basic = state.parkLevel === 'basic';
  if (basic && view === 'progress') view = 'catalog'; // la pestaña está oculta; por si acaso
  state.view = view;
  document.querySelectorAll('.view-tab').forEach(btn => {
    const active = btn.dataset.view === view;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
  // En un espacio de ficha base, el hueco del catálogo lo ocupa el aviso (nunca los dos a la vez).
  catalogControls.hidden = basic || view !== 'catalog';
  catalogPanel.hidden = basic || view !== 'catalog';
  if (basicNotice) basicNotice.hidden = !basic || view !== 'catalog';
  progressPanel.hidden = view !== 'progress';
  if (invasorasPanel) invasorasPanel.hidden = view !== 'invasoras';
  if (view === 'progress') renderProgressTab();
  else if (view === 'invasoras') showInvasoras();
  else if (basic) renderBasicPark();
  else renderCatalogBody();
  syncMobileNav(view); // catálogo, invasoras y progreso también son pestañas de la nav inferior móvil
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
    // aria-current marca la sección activa de la navegación (los botones no son pestañas ARIA)
    if (active) btn.setAttribute('aria-current', 'true'); else btn.removeAttribute('aria-current');
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
  if (mobileMedia.matches) {
    document.body.classList.add('sheet-open');
    // El foco entra en la ficha (tabindex="-1" en el HTML): el lector de pantalla anuncia el
    // contenido recién abierto y Escape/el botón ✕ quedan al alcance del teclado.
    detailPanel.focus({ preventScroll: true });
  }
}

function closeDetailSheet() {
  document.body.classList.remove('sheet-open');
}

// Escape cierra lo que esté superpuesto (bottom-sheet de la ficha o panel de capas), devolviendo
// el foco a un lugar coherente. Complementa a los botones ✕ para el uso con teclado.
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  if (document.body.classList.contains('sheet-open')) { closeDetailSheet(); return; }
  if (layersPanel && !layersPanel.hidden) {
    layersPanel.hidden = true;
    layersToggle.setAttribute('aria-expanded', 'false');
    layersToggle.focus();
  }
});

document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
  btn.addEventListener('click', () => setMobileTab(btn.dataset.mtab));
});
if (sheetClose) sheetClose.addEventListener('click', closeDetailSheet);
// Tocar el velo (fondo atenuado) también cierra la ficha, como en cualquier bottom-sheet.
if (sheetScrim) sheetScrim.addEventListener('click', closeDetailSheet);
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

// Tarjetas de invasoras: abren su ficha en el panel de detalle de la derecha.
if (invasorasPanel) invasorasPanel.addEventListener('click', event => {
  const card = event.target.closest('[data-invasora]');
  if (card) selectInvasora(card.dataset.invasora);
});

detailPanel.addEventListener('click', event => {
  const seenBtn = event.target.closest('[data-toggle-seen]');
  if (seenBtn) { toggleSpeciesSeen(seenBtn.dataset.toggleSeen); return; }
  const invasiveBtn = event.target.closest('[data-mark-invasive]');
  if (invasiveBtn) {
    reportInvasiveSeen(invasiveBtn.dataset.markInvasive, invasiveBtn.dataset.invasiveCcaa).then(() => renderDetail());
    return;
  }
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
    document.querySelectorAll('.filter-button').forEach(item => {
      item.classList.remove('active');
      item.setAttribute('aria-pressed', 'false');
    });
    button.classList.add('active');
    button.setAttribute('aria-pressed', 'true');
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
  if (state.query.trim()) state.searchUsedThisSession = true;
  if (state.catalogMode === 'species') renderSpeciesList(); else renderHabitatCatalog();
});

// --- Modo explorador (explorer.js): GPS continuo, "cerca de ti" y descubrimiento por proximidad --
// Las acciones que el explorador dispara sobre la app se inyectan aquí, igual que con map.js.
initExplorer({
  onTogglePoiSeen: togglePoiSeen,
  onShowHabitatSpecies: focusHabitat
});

// Panel de capas del mapa (layers.js): bases, capas con leyenda y hábitats individuales.
initLayersPanel();

// Tutorial de bienvenida (tutorial.js): botones "?" y API por window para auth.js.
initTutorial();

// Perfil y ajustes (profile.js): delegación de eventos de su pantalla. No depende de que haya
// ningún parque cargado, igual que el progreso de cuenta.
initProfile();

// --- UI de estado offline (indicador de conexión + botón "Guardar sin conexión") -----------------
// Por encima de este umbral se pide confirmación explícita: descargar un parque entero puede irse a
// decenas de MB y mucha gente entra al parque ya de camino, con datos móviles.
const CONFIRM_DOWNLOAD_BYTES = 20 * 1024 * 1024;

// Descarga de activos del parque, publicada por initOfflineUI para que el aviso de "hay contenido
// nuevo" pueda dispararla. No vale con hacer click() en el botón: un parque pendiente de revalidar
// ya está marcado como guardado y su manejador se corta ahí.
let downloadParkAssets = null;

function initOfflineUI() {
  const btn = saveOfflineBtn;
  const status = connStatus;
  if (!btn || !status) return;

  const refresh = () => {
    const online = NaturDexOffline.isOnline();
    const saved = NaturDexOffline.isParkSaved(state.activeParkSlug);
    status.textContent = online ? 'En línea' : (saved ? 'Sin conexión · parque guardado' : 'Sin conexión');
    status.classList.toggle('offline', !online);
    if (saved) {
      btn.innerHTML = iconMarkup('check', 14) + ' Guardado sin conexión';
      btn.classList.add('saved');
    } else {
      // El peso sale del manifiesto, así que se anuncia ANTES de gastar un solo byte.
      const size = formatBytes(NaturDexOffline.parkDownloadBytes(state.manifest));
      btn.innerHTML = iconMarkup('download', 14) + ' Guardar sin conexión' + (size ? ' · ' + size : '');
      btn.classList.remove('saved');
    }
  };

  // Descarga (o repone) los activos del parque mostrando el avance en el propio botón.
  const download = async (revalidate) => {
    if (!state.manifest) return;
    btn.disabled = true;
    const previous = btn.innerHTML;
    try {
      const run = revalidate ? NaturDexOffline.revalidateParkOffline : NaturDexOffline.saveParkOffline;
      const result = await run(state.manifest, (done, tot) => {
        btn.textContent = (revalidate ? 'Actualizando… ' : 'Guardando… ') + done + '/' + tot;
      });
      if (result.failed) {
        // Media descarga no es una descarga: el parque sigue sin marcarse como guardado y se dice.
        btn.innerHTML = previous;
        showNotice({
          key: 'offline-error', icon: '⚠️',
          title: 'La descarga se quedó a medias',
          text: 'Faltaron ' + result.failed + ' de ' + result.totalImages + ' archivos. Inténtalo otra vez con mejor cobertura.'
        });
      }
    } catch (e) {
      console.info('No se pudo guardar el parque sin conexión', e);
    } finally {
      btn.disabled = false;
      refresh();
    }
  };
  downloadParkAssets = download;

  btn.addEventListener('click', () => {
    if (!state.manifest || btn.classList.contains('saved')) return;
    const bytes = NaturDexOffline.parkDownloadBytes(state.manifest);
    if (bytes > CONFIRM_DOWNLOAD_BYTES &&
        !window.confirm('Este parque ocupa ' + formatBytes(bytes) + ' en tu móvil.\n\n' +
                        'Si no estás en wifi, gastarás esos datos. ¿Lo descargamos ahora?')) return;
    download(false);
  });

  refresh();
  window.naturdexRefreshOfflineUI = refresh; // startParkExperience la llama al cambiar de parque

  // --- Puesta al día al recuperar cobertura -----------------------------------------------------
  // Antes esto solo cambiaba la etiqueta "En línea / Sin conexión". Ahora es el punto donde se
  // recupera todo lo que quedó a medias sin red. El debounce y el candado son necesarios: la
  // conectividad de un móvil en el campo va y viene, y sin ellos cada parpadeo dispararía una
  // tanda entera de peticiones solapadas.
  let syncTimer = null;
  let syncing = false;
  const syncNow = async () => {
    if (syncing || !NaturDexOffline.isOnline()) return;
    syncing = true;
    try {
      // 1) Subir lo marcado sin cobertura. Va primero: es lo único que solo existe en el móvil.
      const flushed = await flushProgressQueue();
      if (flushed.sent) {
        showNotice({
          key: 'offline-sync', icon: '☁️',
          title: 'Progreso sincronizado',
          text: 'Se han subido ' + flushed.sent + (flushed.sent === 1 ? ' marca hecha' : ' marcas hechas') + ' sin cobertura.'
        });
        if (flushed.newlyUnlocked.length) handleServerNewlyUnlocked(flushed.newlyUnlocked);
      }
      // 2) Reconciliar los logros de cuenta (hasta ahora solo corría al arrancar).
      if (state.userId != null) await syncWithServer();
      // 3) ¿El parque guardado tiene fotos o mapa nuevos? Nunca se descarga solo.
      await maybeOfferRevalidation();
    } catch (e) {
      console.info('La sincronización al recuperar conexión falló; se reintentará.', e);
    } finally {
      syncing = false;
    }
  };
  const scheduleSync = () => {
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(syncNow, 2000);
  };

  NaturDexOffline.onConnectivityChange(online => {
    refresh();
    if (online) scheduleSync();
  });
  scheduleSync(); // y también al arrancar, que es cuando se recupera lo de la última salida
}

/**
 * Si el manifiesto del servidor va por delante de lo guardado en el dispositivo, se ofrece
 * reponerlo. Se ofrece, no se hace: pueden ser decenas de MB sobre datos móviles.
 */
async function maybeOfferRevalidation() {
  if (!state.manifest || !NaturDexOffline.parkNeedsRevalidation(state.manifest)) return;
  const size = formatBytes(NaturDexOffline.parkDownloadBytes(state.manifest));
  showNotice({
    key: 'offline-revalidate', icon: '🔄',
    title: 'Este parque tiene contenido nuevo',
    text: 'Hay fichas, fotos o mapa actualizados' + (size ? ' (' + size + ')' : '') + '. Descárgalos cuando estés en wifi.',
    action: { label: 'Actualizar ahora', onClick: () => downloadParkAssets && downloadParkAssets(true) }
  });
}

/**
 * Sugiere guardar el parque la primera vez que se entra en él con cobertura. El momento importa:
 * quien lo descubre ya de ruta, sin señal, llega tarde. Una sola vez por parque y por dispositivo,
 * y como aviso discreto, no como modal: es un consejo, no un trámite.
 */
const SUGGEST_SAVE_KEY = 'naturdex.suggestedSave';
function maybeSuggestSavingPark() {
  const slug = state.activeParkSlug;
  if (!slug || !state.manifest) return;
  if (!NaturDexOffline.isOnline() || NaturDexOffline.isParkSaved(slug)) return;
  let suggested = [];
  try { suggested = JSON.parse(localStorage.getItem(SUGGEST_SAVE_KEY) || '[]'); } catch (e) { suggested = []; }
  if (!Array.isArray(suggested) || suggested.includes(slug)) return;
  try { localStorage.setItem(SUGGEST_SAVE_KEY, JSON.stringify(suggested.concat(slug))); } catch (e) { /* sin localStorage: volvería a salir, tampoco pasa nada */ }

  const size = formatBytes(NaturDexOffline.parkDownloadBytes(state.manifest));
  showNotice({
    key: 'offline-suggest', icon: '📶',
    title: '¿Vas a venir a este parque?',
    text: 'Aquí dentro casi no hay cobertura. Descárgalo mientras tengas wifi y lo tendrás entero'
      + (size ? ' (' + size + ')' : '') + ': fichas, fotos, audioguías y mapa.',
    action: { label: 'Guardar sin conexión', onClick: () => saveOfflineBtn && saveOfflineBtn.click() }
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
  // Nivel de dato del espacio: "basic" (ficha base N1) o completo. Se aplica antes de pintar nada
  // para que la cabecera y las pestañas ya salgan coherentes con lo que hay.
  applyParkLevel(parkEntry.status === 'basic' ? 'basic' : 'full');
  const manifest = await loadManifest(parkEntry);
  state.manifest = manifest;

  await Promise.all([loadData(manifest), loadGeo(manifest), loadProgress(), loadGlossary(), initAchievements()]);

  // Especies invasoras (dato nacional por CCAA, empaquetado offline). renderInvasoras filtra por
  // región. fetchJsonCached lo cachea en localStorage (capa 1): disponible sin conexión aunque el
  // Service Worker no esté activo, como el resto de datos del parque.
  try {
    state.data.invasoras = (await NaturDexOffline.fetchJsonCached('Data/invasoras.json')).data;
  } catch (e) { /* sin invasoras: la pestaña muestra el aviso de "sin datos" */ }

  if (parkTitle && state.data.park && state.data.park.name) parkTitle.textContent = state.data.park.name;

  state.selectedId = state.data.species?.[0]?.id ?? null;
  // Al entrar al parque, el panel de detalle de la derecha muestra por defecto la etiqueta de un
  // hábitat (no la de una especie). Se prefiere un hábitat sin nota de revisión para una portada
  // limpia; si todos la tuvieran, se usa el primero.
  const defaultHabitat = (state.data.habitats || []).find(h => !h.reviewNote)
    || (state.data.habitats || [])[0];
  state.selectedHabitatId = defaultHabitat ? defaultHabitat.id : null;
  state.detailMode = 'habitat';
  state.hiddenHabitats.clear(); // al (re)entrar a un parque, todos sus hábitats parten visibles
  // Mapa base propio del parque (paquete .pmtiles). Si ya se entra sin cobertura se activa de
  // salida: OSM/PNOA no pintarían nada y el usuario vería la geometría flotando sobre el vacío.
  if (setupParkBaseLayer(manifest) && !NaturDexOffline.isOnline()) applyBaseChoice('parque', false);
  renderSummary();
  renderProtectedAreas();
  renderTrails();
  renderHabitatZones();
  renderMarkers();
  renderPoiMarkers();
  // setView reinicia la vista al catálogo (o a su aviso, si el espacio es de ficha base) al entrar
  // a un parque; así cambiar de parque nunca deja abierta una pestaña que no aplica al nuevo.
  setView('catalog');
  if (state.parkLevel !== 'basic') renderDetail();
  refreshLayersPanel();
  state.parkWasComplete = computeProgress().parkComplete;
  map.setView(state.data.park.center, 12);
  // Leaflet cachea el tamaño del contenedor al crearse; si el layout aún no estaba listo (0 de
  // alto), el mapa no dibuja capas ni teselas (ver ensureMapSized en map.js).
  ensureMapSized();

  if (!parkExperienceInited) { initOfflineUI(); initGlossaryPopover(); parkExperienceInited = true; }
  // La UI offline es única pero su contenido depende del parque (si está guardado, cuánto ocupa),
  // así que al cambiar de parque hay que repintarla y volver a mirar si lo guardado está viejo.
  if (window.naturdexRefreshOfflineUI) window.naturdexRefreshOfflineUI();
  maybeOfferRevalidation();
  maybeSuggestSavingPark();
}
window.startParkExperience = startParkExperience;
window.naturdexInvalidateMap = ensureMapSized; // auth.js lo llama al mostrar la pantalla del parque

// Pantalla de progreso de cuenta (ámbito estatal): auth.js la llama desde "screen-select" (botón de
// trofeo) y achievements.js desde el cartel agrupado ("¡N logros nuevos!"). No depende de que haya
// ningún parque cargado: funciona nada más entrar, incluso sin haber visitado ningún parque todavía.
window.naturdexShowAccountProgress = async function (user) {
  // auth.js puede llamar esto ANTES de entrar a ningún parque (desde "screen-select"), momento en
  // el que startParkExperience todavía no ha puesto el id de usuario en el estado: se pasa aquí
  // para que el progreso de cuenta se calcule con el ámbito correcto desde el primer vistazo.
  if (user && user.id != null) { state.userId = user.id; state.userName = user.name || user.email; }
  if (window.naturdexShowScreen) window.naturdexShowScreen('screen-account');
  await renderAccountProgress();
};

// Pantalla de perfil y ajustes: la llama auth.js desde el botón de perfil de las dos cabeceras
// (selector de parque y parque). Igual que la anterior, no necesita ningún parque cargado.
window.naturdexShowProfile = async function (user) {
  if (user && user.id != null) { state.userId = user.id; state.userName = user.name || user.email; }
  await showProfile();
};
