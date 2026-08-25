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
  state, computeProgress, speciesLatLng, relatedSpeciesIds, migratorySpecies
} from './state.js';
import { iconMarkup, geoUnavailableReason, formatBytes } from './util.js';
import {
  resolveActivePark, loadManifest, loadData, loadGeo,
  loadProgress, persistProgress, flushProgressQueue
} from './data.js';
import {
  sidebar, speciesList, searchInput, catalogControls, catalogPanel,
  backToHabitatsBtn, catalogCrumb, catalogCrumbLabel, parkTitle, parkEyebrow, parkStats, parkProgressWrap,
  progressPanel, migratoriasPanel, invasorasPanel, diccionarioPanel, basicNotice, detailPanel, sheetClose, sheetScrim,
  saveOfflineBtn, connStatus, layersToggle, layersPanel, explorerToggle, rarityFilter
} from './dom.js';
import { FILTROS_RAREZA } from './rareza.js';
import {
  renderHabitatGroups, renderHabitatCatalog, renderSpeciesList, renderCatalogBody,
  renderSummary, renderProgress, renderDetail, renderProgressTab, renderInvasoras, renderMigratorias,
  renderBasicPark, renderAccountProgress
} from './render.js';
import {
  map, setMapHandlers, ensureMapSized, soloHabitat, setupParkBaseLayer, applyBaseChoice, focusOn,
  revealOn, renderMarkers, renderPoiMarkers, renderTrails, renderProtectedAreas, renderHabitatZones,
  playEntrySequence, setHabitatVisible, soloHabitatGroup, focusHabitatGroupOnMap
} from './map.js';
import { groupIdOfHabitat } from './habitat-groups.js';
import { initExplorer } from './explorer.js';
import { initLayersPanel, refreshLayersPanel, setOpenLayersGroup, openLayersGroupOfHabitat } from './layers.js';
import { loadGlossary, initGlossaryPopover, hideGlossaryPopover } from './glossary.js';
import { abreDiccionario, initDiccionario } from './diccionario.js';
import { loadFitosociologia } from './fitosociologia.js';
import { initTutorial } from './tutorial.js';
import { initAchievements, noteParkActivity, handleServerNewlyUnlocked, reportInvasiveSeen, refreshAccountProgress, syncWithServer } from './achievements.js';
import { startPresence, stopPresence, notePresenceFix, flushPresenceQueue, marksCountNow, refreshPresenceBar } from './presence.js';
import { initProfile, showProfile } from './profile.js';
import { showNotice } from './notice.js';
import { abreVisor } from './visor.js';

// --- Pila de navegación (nav.js) ------------------------------------------------------------------
// Cada cosa que se abre dentro del parque —una pestaña, la ficha deslizante, el hábitat en el que se
// entra, el panel de capas— se apila como un paso deshacible. Así el botón «atrás» del móvil deshace
// exactamente ese último paso, en lugar de sacar al usuario de la app, y los botones de la interfaz
// (✕, «← Hábitats», el velo) y la tecla Escape hacen todos lo mismo por dentro.
const nav = window.NaturDexNav || null;
function navOpen(key, close) { if (nav) nav.open(key, close); }
function navClose(key) { return nav ? nav.close(key) : false; }

// --- Empezar por arriba ---------------------------------------------------------------------------
// Los contenedores con scroll propio conservan su `scrollTop` al repintarse. Sin esto, abrir una
// ficha desde una lista ya desplazada dejaba al usuario a media altura, con el texto cortado y sin
// ver la foto; y volver a una pestaña la devolvía por donde se había quedado hace media hora. Para
// quien no maneja bien el móvil eso no se lee como «estoy desplazado»: se lee como «se ha roto».
//
// El salto es seco (asignar `scrollTop`, no `scrollTo({behavior:'smooth'})`), así que respeta
// data-motion="reduce" por construcción: no hay nada que animar.

// La vista entrante (pestaña o nivel del catálogo) arranca arriba del todo. Se tocan los cuatro
// contenedores que scrollean por su cuenta, porque cuál de ellos lo hace depende del ancho: en
// escritorio son las listas; en móvil, la barra lateral entera.
function vistaArriba() {
  [sidebar, speciesList, progressPanel, invasorasPanel, diccionarioPanel]
    .forEach(el => { if (el) el.scrollTop = 0; });
}

// Estreno de la ficha: empieza por la foto y, si se pide, el foco cae en su TÍTULO (no en el panel),
// para que el lector de pantalla anuncie el nombre de la especie y no «Ficha de detalle». Mismo
// criterio que showScreen() en auth.js y closeRaw() en tutorial.js.
//
// `preventScroll` aquí no estorba, al revés: la posición ya se ha corregido a mano una línea antes,
// y sin él el navegador volvería a desplazar el contenedor para «traer» el título a la vista justo
// mientras la hoja móvil está entrando.
function estrenaFicha(enfoca = true) {
  if (!detailPanel) return;
  detailPanel.scrollTop = 0;
  if (!enfoca) return;
  const titulo = detailPanel.querySelector('h2');
  if (!titulo) return;
  if (!titulo.hasAttribute('tabindex')) titulo.setAttribute('tabindex', '-1');
  titulo.focus({ preventScroll: true });
}

// --- Navegación del catálogo ----------------------------------------------------------------------
// Tres niveles encajados: grupos de hábitats → hábitats del grupo → especies del hábitat. Cada uno
// es un paso deshacible en la pila (nav.js), así que «atrás» sube UN nivel, igual que la miga de pan.

// Entrar en un grupo de hábitats. Además de abrir su lista en el catálogo, aísla el grupo en el
// mapa: es la razón de ser de los grupos —dejar de ver veintiún polígonos pisándose— y hace que las
// tres vistas (mapa, leyenda y catálogo) cuenten lo mismo.
function enterHabitatGroup(groupId) {
  state.habitatGroupFocus = groupId;
  state.habitatFocus = null;
  state.catalogMode = 'habitats';
  state.query = '';
  searchInput.value = '';
  soloHabitatGroup(groupId);
  focusHabitatGroupOnMap(groupId);
  setOpenLayersGroup(groupId);
  refreshLayersPanel();
  renderCatalogBody();
  vistaArriba();
  navOpen('habitat-group', backToGroupsRaw);
}

// `sinHabitat` es el tercer destino de este mismo nivel, junto a «un hábitat» y «todas»: las fichas
// que no cuelgan de ningún polígono. Va aquí y no en una función aparte porque la navegación —qué se
// apila, qué se limpia, a dónde vuelve el «atrás»— es exactamente la de «Ver todas las especies».
function enterHabitat(habitatId, sinHabitat = false) {
  // El grupo del hábitat se apila DEBAJO aunque se haya llegado de un salto (desde el mapa, desde
  // "cerca de ti" o desde un resultado del buscador): así «atrás» sube al grupo y solo el siguiente
  // «atrás» sale al principio del catálogo, sin caminos que se salten un nivel.
  const groupId = habitatId ? groupIdOfHabitat(habitatId) : '';
  state.sinHabitatFocus = !!sinHabitat;
  if (groupId) {
    state.habitatGroupFocus = groupId;
    navOpen('habitat-group', backToGroupsRaw);
  } else {
    state.habitatGroupFocus = null; // "Ver todas las especies": no cuelga de ningún grupo
  }
  state.habitatFocus = habitatId;
  state.catalogMode = 'species';
  state.query = '';
  searchInput.value = '';
  // Al entrar en un hábitat concreto, su etiqueta se muestra en el panel de detalle de la derecha.
  // "Ver todas las especies" (habitatId nulo) no tiene hábitat que mostrar, así que no la toca.
  if (habitatId) selectHabitat(habitatId);
  renderCatalogBody();
  vistaArriba();
  navOpen('habitat', backFromHabitatRaw);
}

// Pestaña de aves migratorias: lista a la izquierda y la ficha de ESPECIE de siempre a la derecha.
// A diferencia de las invasoras no hay ficha propia que pintar: una migratoria es una especie del
// catálogo con su `id`, su botón de «marcar como vista» y su progreso — solo se lista en otro sitio.
function showMigratorias() {
  renderMigratorias();
  // La ficha de la derecha (escritorio) sigue enseñando lo último que se abriera, que puede ser un
  // hábitat de la pestaña anterior. Se le pone la primera migratoria de la lista, que es lo que el
  // usuario está mirando; si la lista está vacía, se deja como esté.
  const list = migratorySpecies();
  if (list.length && !list.some(s => s.id === state.selectedId)) {
    state.selectedId = list[0].id;
    state.detailMode = 'species';
    renderDetail();
    estrenaFicha(false); // la ficha cambia sola: no se le roba el foco al usuario
  }
}

// Abrir una migratoria desde su pestaña. No es `selectSpecies` a secas porque esa repinta la lista
// del CATÁLOGO —donde las migratorias ya no están— y dejaría la tarjeta pulsada sin marcar.
function selectMigratoria(id) {
  state.selectedId = Number(id);
  state.detailMode = 'species';
  renderMigratorias();
  renderDetail();
  openDetailSheet();
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
  estrenaFicha(false); // la ficha cambia sola, sin que el usuario la haya pedido: no se le roba el foco
}
function selectInvasora(scientificName) {
  state.selectedInvasora = scientificName;
  state.detailMode = 'invasora';
  renderInvasoras();
  renderDetail();
  openDetailSheet(); // en móvil, la ficha se desliza como bottom-sheet
}

// Muestra la ficha de un hábitat en el panel de detalle de la derecha.
// `solo` lo aísla además en el mapa (apaga los demás; el usuario puede reactivarlos desde el panel
// de capas, que por eso se refresca). Se hace al elegirlo en el CATÁLOGO, donde
// el usuario ha ido a por ese hábitat en concreto. Al tocarlo en el MAPA no: si tocar un hábitat
// apagara los demás, el siguiente ya no estaría ahí para tocarlo, y explorar el mapa a toques —que
// es la forma natural de usarlo— se convertiría en un callejón sin salida.
function selectHabitat(habitatId, solo = true) {
  clearPoiSelection();
  state.selectedHabitatId = habitatId;
  state.detailMode = 'habitat';
  renderDetail();
  // Ficha nueva ⇒ ficha por arriba. El foco no se toca aquí: `selectHabitat` también se llama al
  // ENTRAR en un hábitat desde el catálogo, y allí el usuario se queda navegando la lista.
  estrenaFicha(false);
  // El panel de capas deja desplegado el grupo del hábitat en cuestión: al abrirlo, lo que se está
  // mirando ya está a la vista, sin tener que buscar en qué grupo cae.
  openLayersGroupOfHabitat(habitatId);
  if (solo) { soloHabitat(habitatId); refreshLayersPanel(); }
}

// Tocar un hábitat en el mapa: su ficha, en el mismo sitio que todas las demás.
// A diferencia de una especie o un punto, la hoja se abre ENTERA y no a media altura: un hábitat no
// es un punto que haya que seguir viendo debajo —ocupa media pantalla de mapa— y su ficha es la más
// larga de la app (descripción, superficie, fitosociología, progreso y todas sus especies). A media
// altura obligaba a subirla a mano cada vez.
function selectHabitatFromMap(habitatId) {
  selectHabitat(habitatId, false);
  openDetailSheet();
}

// Salir de un hábitat: se vuelve a la lista de SU grupo (o al nivel de grupos si se estaba en
// "todas las especies", que no cuelga de ninguno).
function backFromHabitatRaw() {
  state.habitatFocus = null;
  state.sinHabitatFocus = false;
  state.catalogMode = state.habitatGroupFocus ? 'habitats' : 'groups';
  state.query = '';
  searchInput.value = '';
  // Entrar en un hábitat lo aísla en el mapa (selectHabitat · soloHabitat); al salir, el mapa vuelve
  // a enseñar el grupo entero, que es lo que la lista está mostrando otra vez. Sin esto, la lista
  // decía "cuatro hábitats" y en el mapa seguía habiendo uno.
  if (state.habitatGroupFocus) {
    soloHabitatGroup(state.habitatGroupFocus);
    refreshLayersPanel();
  }
  renderCatalogBody();
  vistaArriba();
}

// Salir de un grupo: al nivel de entrada del catálogo. El mapa recupera todos los hábitats, que es
// lo que el usuario está viendo en la lista.
function backToGroupsRaw() {
  state.habitatGroupFocus = null;
  state.habitatFocus = null;
  state.sinHabitatFocus = false;
  state.catalogMode = 'groups';
  state.query = '';
  searchInput.value = '';
  (state.data && state.data.habitats ? state.data.habitats : []).forEach(h => setHabitatVisible(h.id, true));
  setOpenLayersGroup(null);
  refreshLayersPanel();
  renderCatalogBody();
  vistaArriba();
}

// El botón «←» de la miga: sube UN nivel, sea cual sea en el que se esté.
function backOneCatalogLevel() {
  if (state.catalogMode === 'species') {
    if (navClose('habitat')) return; // su cierre ya devuelve al grupo (o a los grupos)
    backFromHabitatRaw();
    return;
  }
  if (navClose('habitat-group')) return;
  backToGroupsRaw();
}

function focusHabitat(habitatId) {
  // Entrada al catálogo de especies de un hábitat desde su ficha o desde "cerca de ti".
  closeDetailSheet();
  if (mobileMedia.matches) setMobileTab('catalog'); else setView('catalog');
  enterHabitat(habitatId);
}

// Entrada al catálogo de hábitats de un grupo desde la ficha de un hábitat (su etiqueta de grupo).
function focusHabitatGroup(groupId) {
  closeDetailSheet();
  if (mobileMedia.matches) setMobileTab('catalog'); else setView('catalog');
  enterHabitatGroup(groupId);
}

function selectSpecies(id, focusMap = true) {
  clearPoiSelection();
  state.selectedId = Number(id);
  state.detailMode = 'species';
  renderSpeciesList();
  renderDetail();
  // `focusMap` es false justo cuando la llamada viene de tocar el marcador en el mapa (map.js): en
  // ese caso la hoja se abre a media altura para no tapar el bicho que se acaba de tocar.
  openDetailSheet(!focusMap);
  if (!focusMap) return;
  const species = state.data.species.find(item => item.id === state.selectedId);
  const marker = state.markers.get(state.selectedId);
  if (!species || !marker) return;
  const latLng = speciesLatLng(species);
  // Si el marcador está dentro de un clúster, se abre el clúster hasta mostrarlo y luego se coloca
  // en la franja de mapa que la ficha deja a la vista.
  if (map.hasLayer(state.speciesCluster) && typeof state.speciesCluster.zoomToShowLayer === 'function') {
    state.speciesCluster.zoomToShowLayer(marker, () => revealOn(latLng, map.getZoom()));
  } else {
    revealOn(latLng, 14);
  }
}

// El marcador resaltado deja de estarlo en cuanto la ficha pasa a hablar de otra cosa: si no, el
// mapa se queda señalando un punto que ya no es el que se está leyendo.
function clearPoiSelection() {
  if (state.selectedPoiId == null) return;
  state.selectedPoiId = null;
  renderPoiMarkers();
}

// Punto de interés tocado en el mapa (o desde "cerca de ti"): su ficha, en el panel de detalle.
function selectPoi(id) {
  state.selectedPoiId = id;
  state.detailMode = 'poi';
  renderPoiMarkers(); // el marcador tocado se resalta
  renderDetail();
  openDetailSheet(true);
}

// --- Marcar visto / visitado ------------------------------------------------------------------------
function afterSeenChange() {
  // El detalle de especie es independiente del modo del catálogo (hábitats o especies), así que
  // se refresca lo que corresponda en cada uno sin pisar una lista de hábitats con la de especies.
  // Y la lista que hay que repintar es la de la vista ACTIVA: marcar vista un ave desde la pestaña
  // de migratorias tiene que ponerle su ✓ ahí, no repintar una pestaña de progreso que no se ve.
  if (state.view === 'catalog') renderCatalogBody();
  else if (state.view === 'migratorias') renderMigratorias();
  else renderProgressTab();
  renderDetail();
  renderMarkers();
  renderHabitatZones();
  renderProgress();
}

// Al marcar una especie como vista, la ubicación del avistamiento la aporta el GPS del dispositivo.
// Si el usuario deniega el permiso o no hay GPS, se marca igualmente como vista y el marcador cae
// en la coordenada representativa del catálogo (con aviso en el popup) — pero entonces el
// avistamiento no puede verificarse y no contará para los logros, que es justo lo que la barra de
// presencia le está diciendo por delante. `alsoSeen` son las demás apariciones de la misma especie
// (otros hábitats): se marcan vistas también, pero sin avistamiento GPS propio.
// Pide la posición UNA vez y llama a `hecho(coords|null)`. Nunca falla hacia el usuario: si no hay
// API, si el contexto no es seguro o si deniega el permiso, sigue con `null` y lo marcado se guarda
// igual. Lo comparten el avistamiento de especie y la identificación de invasora, que necesitan lo
// mismo (lat, lng y la PRECISIÓN, que es lo que convierte una coordenada en un dato utilizable).
function conPosicionActual(hecho) {
  if (geoUnavailableReason()) { hecho(null); return; }
  navigator.geolocation.getCurrentPosition(
    pos => hecho({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
    () => hecho(null),
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
  );
}

function captureSighting(numericId, alsoSeen = []) {
  const finish = (coords) => {
    if (coords) state.sightings.set(numericId, { lat: coords.lat, lng: coords.lng });
    // La coordenada del avistamiento también alimenta la presencia: quien recorre el parque
    // marcando bichos verifica su visita sin tener que encender nada aparte.
    if (coords) notePresenceFix(coords.lat, coords.lng, coords.accuracy);
    renderMarkers();
    if (state.selectedId === numericId) renderDetail();
    noteParkActivity(state.activeParkSlug);
    // Predicción offline inmediata (sin esperar respuesta de red): el usuario puede estar sin
    // cobertura en pleno campo y el cartel de celebración debe aparecer igual.
    refreshAccountProgress();
    persistProgress('species', numericId, true, coords).then(res => res && handleServerNewlyUnlocked(res.newlyUnlocked));
    alsoSeen.forEach(rid => persistProgress('species', rid, true).then(res => res && handleServerNewlyUnlocked(res.newlyUnlocked)));
  };
  // Sin geolocalización posible (navegador sin API o contexto no seguro) el avistamiento se marca
  // igual, solo que sin coordenada GPS propia — no bloquea al usuario.
  conPosicionActual(finish);
}

// Avisa UNA VEZ por sesión de que lo que se está marcando no va a contar. El sitio donde duele
// enterarse de esto es al final de la ruta, viendo que no ha sumado nada: mejor decirlo al primer
// avistamiento. No bloquea nada — el cuaderno personal del usuario sigue siendo suyo.
let unverifiedWarned = false;
function warnIfNotVerified() {
  if (unverifiedWarned || marksCountNow()) return;
  unverifiedWarned = true;
  showNotice({
    key: 'presence-unverified', icon: '📍',
    title: 'Esto no cuenta para los logros todavía',
    text: 'Tus marcas se guardan igual, pero para que sumen tiene que constar que estás dentro del parque. '
      + 'Activa la ubicación y camina unos minutos: la barra de arriba te dirá cuándo está verificada.'
  });
}

// Hora de marcado, la pieza que decide si algo cuenta. El servidor sella la suya (progress.php) y
// esta es la copia local para poder predecir sin cobertura; al sincronizar, manda la del servidor.
function noteMarked(type, id, seen) {
  const key = type + ':' + id;
  if (!state.markedAt) state.markedAt = {};
  if (seen) { if (!state.markedAt[key]) state.markedAt[key] = new Date().toISOString(); }
  else delete state.markedAt[key];
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
    related.forEach(rid => { state.seenSpecies.add(rid); noteMarked('species', rid, true); });
    afterSeenChange();
    captureSighting(numericId, others);
    warnIfNotVerified();
  } else {
    related.forEach(rid => { state.seenSpecies.delete(rid); state.sightings.delete(rid); noteMarked('species', rid, false); });
    afterSeenChange();
    related.forEach(rid => persistProgress('species', rid, false));
  }
}

function togglePoiSeen(id) {
  const nowSeen = !state.seenPois.has(id);
  if (nowSeen) state.seenPois.add(id); else state.seenPois.delete(id);
  noteMarked('poi', id, nowSeen);
  renderPoiMarkers();
  if (state.detailMode === 'poi' && state.selectedPoiId === id) renderDetail();
  if (state.view === 'progress') renderProgressTab();
  if (nowSeen) { noteParkActivity(state.activeParkSlug); refreshAccountProgress(); }
  persistProgress('poi', id, nowSeen).then(res => res && handleServerNewlyUnlocked(res.newlyUnlocked));
}

// Acciones que el mapa dispara sobre la app al tocar algo (ver map.js).
setMapHandlers({
  onSelectSpecies: selectSpecies,
  onSelectPoi: selectPoi,
  onSelectHabitat: selectHabitatFromMap,
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
  // El rótulo de encima del título (figura · superficie) lo compone renderSummary, que se llama
  // justo después y ya tiene cargados los datos del espacio.
  // Contadores y barra de progreso: sin catálogo no hay nada que contar, así que se ocultan.
  if (parkStats) parkStats.hidden = basic;
  if (parkProgressWrap) parkProgressWrap.hidden = basic;
  // La pestaña de progreso mediría una colección que todavía no existe (y el modo explorador
  // descubriría especies y POIs que aún no están cargados): se ocultan mientras el espacio sea N1.
  document.querySelectorAll('.view-tab[data-view="progress"], .mobile-nav-btn[data-mtab="progress"]')
    .forEach(btn => { btn.hidden = basic; });
  // La de migratorias la decide `sincronizaPestanaMigratorias()`, no esta función: depende de
  // cuántas aves migratorias tenga el espacio y aquí el catálogo todavía no está cargado
  // (`applyParkLevel` corre antes que `loadData`). Se apaga de salida y se vuelve a decidir allí.
  ocultaPestana('migratorias', true);
  if (explorerToggle) explorerToggle.hidden = basic;
}

/** Apaga o enciende una pestaña en sus DOS sitios: la fila de escritorio y la nav inferior móvil. */
function ocultaPestana(vista, oculta) {
  document.querySelectorAll('.view-tab[data-view="' + vista + '"], .mobile-nav-btn[data-mtab="' + vista + '"]')
    .forEach(btn => { btn.hidden = oculta; });
}

/*
 * ¿Se enseña la pestaña «Migratorias»? Solo si este espacio tiene alguna.
 *
 * Una pestaña de primer nivel que en cuatro de los dieciséis espacios publicados solo puede decir
 * «aquí no hay» es un destino que cobra sitio en la barra sin dar nada a cambio — y en la nav móvil
 * ese sitio se lo quita al mapa y al catálogo, que es lo que se usa a diario
 * (el criterio de los cuatro botones, en Js/diccionario.js).
 *
 * Se llama DESPUÉS de `loadData`, que es cuando `state.data.species` existe. Y no se lee del
 * catálogo entero sino del mismo selector que pinta la pestaña: si un día se filtra algo más, la
 * puerta y la lista no pueden discrepar.
 */
function sincronizaPestanaMigratorias() {
  const hay = state.parkLevel !== 'basic' && migratorySpecies().length > 0;
  ocultaPestana('migratorias', !hay);
  // Si el usuario estaba en esa pestaña y cambia de parque a uno sin migratorias, se le devuelve al
  // catálogo: quedarse en una vista cuya pestaña acaba de desaparecer no tiene vuelta atrás.
  if (!hay && state.view === 'migratorias') setView('catalog');
}

// --- Vistas (catálogo / progreso) ---------------------------------------------------------------------
function setView(view) {
  const basic = state.parkLevel === 'basic';
  if (basic && view === 'progress') view = 'catalog'; // la pestaña está oculta; por si acaso
  // La de migratorias se apaga por dos motivos distintos (ficha base o espacio sin ninguna), así
  // que la pregunta no es cuál de los dos: es si el botón está encendido.
  if (view === 'migratorias' && document.querySelector('.view-tab[data-view="migratorias"]')?.hidden) view = 'catalog';
  state.view = view;
  document.querySelectorAll('.view-tab').forEach(btn => {
    const active = btn.dataset.view === view;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
  // El diccionario ya no tiene pestaña, pero sigue siendo una vista: su icono de la cabecera hace
  // de «estás aquí». Sin esto la vista se abría y nada en la barra decía de dónde había salido.
  const diccBtn = document.querySelector('#diccionarioBtn');
  if (diccBtn) {
    diccBtn.classList.toggle('is-active', view === 'diccionario');
    diccBtn.setAttribute('aria-pressed', view === 'diccionario' ? 'true' : 'false');
  }
  // En un espacio de ficha base, el hueco del catálogo lo ocupa el aviso (nunca los dos a la vez).
  catalogControls.hidden = basic || view !== 'catalog';
  catalogPanel.hidden = basic || view !== 'catalog';
  // La miga de pan es del catálogo: fuera de él no pinta nada. Se quedaba encendida al cambiar de
  // pestaña, así que Progreso e Invasoras salían encabezadas por "← Hábitats · <hábitat>", un
  // rótulo que no era suyo y cuyo botón cambiaba, sin avisar, la vista que había detrás.
  // renderCatalogBody vuelve a decidir si toca al volver al catálogo.
  if (catalogCrumb && view !== 'catalog') catalogCrumb.hidden = true;
  if (basicNotice) basicNotice.hidden = !basic || view !== 'catalog';
  progressPanel.hidden = view !== 'progress';
  if (migratoriasPanel) migratoriasPanel.hidden = view !== 'migratorias';
  if (invasorasPanel) invasorasPanel.hidden = view !== 'invasoras';
  // El diccionario es nacional, no del parque: se ve igual en un espacio de ficha base, donde no
  // hay catálogo que consultar pero las palabras técnicas siguen saliendo en la ficha del espacio.
  if (diccionarioPanel) diccionarioPanel.hidden = view !== 'diccionario';
  if (view === 'progress') renderProgressTab();
  else if (view === 'migratorias') showMigratorias();
  else if (view === 'invasoras') showInvasoras();
  else if (view === 'diccionario') abreDiccionario();
  else if (basic) renderBasicPark();
  else renderCatalogBody();
  vistaArriba(); // la pestaña entrante empieza por su encabezado, no por donde se quedó la anterior
  syncMobileNav(view); // catálogo, migratorias, invasoras y progreso son también la nav inferior móvil
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

// Pinta la pestaña pedida, sin tocar la pila de navegación.
function showMobileTab(tab) {
  if (tab === 'map') {
    syncMobileNav('map');
    closeDetailSheetRaw();
    vistaArriba(); // al volver del mapa, la pestaña de texto no puede seguir a media altura
    ensureMapSized(); // el mapa estaba oculto; Leaflet debe recalcular el tamaño del contenedor
  } else {
    setView(tab); // 'catalog' | 'migratorias' | 'invasoras' | 'progress' — setView sincroniza la nav
  }
}

// El mapa es la "casa" del parque: se abre en él y todas las demás pestañas son un paso hacia
// dentro. Así «atrás» desde el catálogo devuelve al mapa —y solo desde el mapa sale al selector de
// parques—, en vez de encadenar pestañas visitadas como si fueran páginas distintas.
function setMobileTab(tab) {
  if (!mobileMedia.matches) { setView(tab === 'map' ? 'catalog' : tab); return; }
  if (tab === 'map') {
    if (navClose('mtab')) return; // su cierre ya pinta el mapa
    showMobileTab('map');
    return;
  }
  if (nav && nav.has('mtab')) nav.closeAbove('mtab'); // cierra la ficha o el globo que hubiera encima
  navOpen('mtab', () => showMobileTab('map'));
  showMobileTab(tab);
}

// `fromMap` es lo que decide la altura con la que se abre la hoja. Abierta desde el mapa, una hoja
// de 82 % de pantalla tapaba justo lo que el usuario acababa de tocar: se queda a media altura, con
// el punto a la vista, y el asa la sube entera si quiere leerlo todo (el patrón de Google Maps).
// Abierta desde una lista no hay nada detrás que preservar, así que se abre grande como siempre.
function openDetailSheet(fromMap = false) {
  // En escritorio la ficha es la columna de la derecha y siempre está visible: no hay hoja que
  // abrir, pero SÍ hay ficha nueva, así que empieza arriba y el foco entra en ella igual.
  if (!mobileMedia.matches) { estrenaFicha(); return; }
  document.body.classList.toggle('sheet-compact', !!fromMap);
  if (fromMap) document.body.classList.remove('sheet-expanded');
  document.body.classList.add('sheet-open');
  // El foco entra en el TÍTULO de la ficha, no en el panel: así el lector de pantalla anuncia el
  // nombre de la especie y no «Ficha de detalle». Antes de darlo, la ficha se pone arriba del todo.
  estrenaFicha();
  navOpen('sheet', closeDetailSheetRaw);
}

function closeDetailSheetRaw() {
  document.body.classList.remove('sheet-open', 'sheet-expanded');
}

// El asa sube la ficha a pantalla casi completa y la vuelve a bajar.
const sheetExpand = document.querySelector('#sheetExpand');
if (sheetExpand) {
  sheetExpand.addEventListener('click', () => {
    const tall = document.body.classList.toggle('sheet-expanded');
    sheetExpand.setAttribute('aria-expanded', tall ? 'true' : 'false');
    sheetExpand.setAttribute('aria-label', tall ? 'Reducir la ficha' : 'Ampliar la ficha');
  });
}

// Cierre "público" de la ficha (✕, velo, cambio de vista): pasa por la pila para que el historial no
// se quede con un paso de más.
function closeDetailSheet() {
  if (navClose('sheet')) return;
  closeDetailSheetRaw();
}

// Escape deshace el último paso, exactamente igual que el «atrás» del móvil: la ficha, el panel de
// capas, el hábitat en el que se ha entrado… lo que esté arriba de la pila.
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  if (nav && nav.back()) return;
  // Sin pila (navegador sin historial utilizable): al menos, los dos cierres de siempre.
  if (document.body.classList.contains('sheet-open')) { closeDetailSheetRaw(); return; }
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
// La miga de pan del catálogo abre la ficha del hábitat en el que se está navegando; dentro de un
// grupo (que no tiene ficha propia) lo que hace es enseñar ese grupo, y solo ese, en el mapa.
catalogCrumbLabel.addEventListener('click', () => {
  if (state.catalogMode === 'species' && state.habitatFocus) {
    selectHabitat(state.habitatFocus);
    openDetailSheet();
    return;
  }
  if (state.habitatGroupFocus) {
    soloHabitatGroup(state.habitatGroupFocus);
    focusHabitatGroupOnMap(state.habitatGroupFocus);
    refreshLayersPanel();
    if (mobileMedia.matches) setMobileTab('map');
  }
});
syncMobileNav('catalog'); // pestaña inicial

// --- Delegación de eventos ------------------------------------------------------------------------------
speciesList.addEventListener('click', event => {
  const card = event.target.closest('.species-card');
  if (card) { selectSpecies(card.dataset.id); return; }
  const groupCard = event.target.closest('[data-habitat-group]');
  if (groupCard) { enterHabitatGroup(groupCard.dataset.habitatGroup); return; }
  const habitatCard = event.target.closest('.habitat-card');
  if (habitatCard) { enterHabitat(habitatCard.dataset.habitat); return; }
  if (event.target.closest('[data-sin-habitat]')) { enterHabitat(null, true); return; }
  if (event.target.closest('#viewAllSpeciesBtn')) enterHabitat(null);
});

// Tarjetas de migratorias: abren la ficha de especie, la misma que desde el catálogo.
if (migratoriasPanel) migratoriasPanel.addEventListener('click', event => {
  const card = event.target.closest('.species-card');
  if (card) selectMigratoria(card.dataset.id);
});

// Tarjetas de invasoras: abren su ficha en el panel de detalle de la derecha.
if (invasorasPanel) invasorasPanel.addEventListener('click', event => {
  const card = event.target.closest('[data-invasora]');
  if (card) selectInvasora(card.dataset.invasora);
});

detailPanel.addEventListener('click', event => {
  // La foto de portada de la ficha abre el visor a pantalla completa (visor.js). Va la primera:
  // es el único control de la ficha que no es un <button>, así que ningún otro closest la pilla.
  const foto = event.target.closest('img[data-zoom]');
  if (foto) { abreVisor(foto); return; }
  const seenBtn = event.target.closest('[data-toggle-seen]');
  if (seenBtn) { toggleSpeciesSeen(seenBtn.dataset.toggleSeen); return; }
  // "Marcar como visitado" de un punto de interés: antes vivía dentro de su globo del mapa.
  const poiBtn = event.target.closest('[data-toggle-poi]');
  if (poiBtn) { togglePoiSeen(poiBtn.dataset.togglePoi); warnIfNotVerified(); return; }
  const invasiveBtn = event.target.closest('[data-mark-invasive]');
  if (invasiveBtn) {
    // La identificación de una invasora se georreferencia igual que un avistamiento: una cita de
    // especie exótica invasora con coordenada es lo que de verdad le sirve a una administración, y
    // hasta ahora se guardaba solo la especie y la fecha. Sin permiso de GPS se guarda igual, sin
    // coordenada, y el hueco queda dicho en el propio registro (Backend/Lib/occurrences.php).
    const nombre = invasiveBtn.dataset.markInvasive;
    const ccaa = invasiveBtn.dataset.invasiveCcaa;
    conPosicionActual(coords => { reportInvasiveSeen(nombre, ccaa, coords).then(() => renderDetail()); });
    return;
  }
  // Desde la etiqueta de hábitat: abrir el catálogo de especies de ese hábitat.
  const viewSpecies = event.target.closest('[data-view-habitat-species]');
  if (viewSpecies) { focusHabitat(viewSpecies.dataset.viewHabitatSpecies); return; }
  // Desde la etiqueta de grupo de la ficha: subir a los hábitats hermanos de ese grupo.
  const groupLink = event.target.closest('[data-habitat-group-link]');
  if (groupLink) { focusHabitatGroup(groupLink.dataset.habitatGroupLink); return; }
  // Desde una de las especies listadas en la etiqueta de hábitat: abrir su ficha.
  const chip = event.target.closest('[data-species-chip]');
  if (chip) {
    setView('catalog');
    enterHabitat(state.selectedHabitatId);
    selectSpecies(chip.dataset.speciesChip);
  }
});

// La foto de la ficha es un control anunciado (role="button" + tabindex), no una imagen muda que
// resulta que responde: con el teclado tiene que abrirse igual que con el dedo.
detailPanel.addEventListener('keydown', event => {
  if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar') return;
  const foto = event.target.closest('img[data-zoom]');
  if (!foto) return;
  event.preventDefault(); // el espacio, si no, desplaza la ficha por debajo del visor
  abreVisor(foto);
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

// El desplegable de rareza se rellena aquí y no en el HTML para que las cinco opciones —y el orden
// de la escalera— vivan en un solo sitio, `Js/rareza.js`, que es donde está el criterio.
if (rarityFilter) {
  rarityFilter.innerHTML = '';
  for (const opcion of FILTROS_RAREZA) {
    const nodo = document.createElement('option');
    nodo.value = opcion.valor;
    nodo.textContent = opcion.etiqueta;
    rarityFilter.appendChild(nodo);
  }
  rarityFilter.value = state.rarityFilter;
  rarityFilter.addEventListener('change', () => {
    state.rarityFilter = rarityFilter.value;
    renderSpeciesList();
  });
}

document.querySelectorAll('.view-tab').forEach(button => {
  button.addEventListener('click', () => setView(button.dataset.view));
});

// Las dos puertas del diccionario que no son la pestaña de escritorio (ver Js/diccionario.js):
// el enlace de la cabecera del catálogo y el «Ver en el diccionario →» del popover del glosario.
// La segunda además abre el término que se estaba consultando, que es la gracia de tenerla.
function vaAlDiccionario(termino) {
  hideGlossaryPopover();
  closeDetailSheet();          // en móvil el popover se abre sobre la ficha, que tapa la pantalla
  if (mobileMedia.matches) setMobileTab('diccionario'); else setView('diccionario');
  abreDiccionario(termino);    // después de setView: es quien deja el panel a la vista
}

const diccionarioLink = document.querySelector('#openDiccionario');
if (diccionarioLink) diccionarioLink.addEventListener('click', () => vaAlDiccionario());
// El icono de la cabecera, que sustituye a la pestaña: el diccionario es NACIONAL, no del espacio,
// así que su sitio es la fila donde ya vive el progreso estatal y no la de las vistas del parque.
const diccionarioBtn = document.querySelector('#diccionarioBtn');
if (diccionarioBtn) diccionarioBtn.addEventListener('click', () => vaAlDiccionario());

document.body.addEventListener('click', event => {
  const salto = event.target.closest('[data-abrir-diccionario]');
  if (salto) vaAlDiccionario(salto.dataset.abrirDiccionario);
});

backToHabitatsBtn.addEventListener('click', backOneCatalogLevel);

searchInput.addEventListener('input', event => {
  state.query = event.target.value;
  if (state.catalogMode === 'species') renderSpeciesList();
  else if (state.catalogMode === 'habitats') renderHabitatCatalog();
  else renderHabitatGroups(); // en el nivel de grupos el buscador enseña los hábitats que coinciden
});

// --- Modo explorador (explorer.js): GPS continuo, "cerca de ti" y descubrimiento por proximidad --
// Las acciones que el explorador dispara sobre la app se inyectan aquí, igual que con map.js.
// `onFix` conecta su watchPosition con la verificación de presencia: el explorador ya está siguiendo
// la posición, así que no hace falta un segundo GPS encendido en paralelo.
initExplorer({
  onTogglePoiSeen: togglePoiSeen,
  onShowHabitatSpecies: focusHabitat,
  onSelectPoi: selectPoi,
  onSelectHabitat: selectHabitatFromMap,
  onFix: (lat, lng, accuracy) => notePresenceFix(lat, lng, accuracy)
});

// Panel de capas del mapa (layers.js): bases, capas con leyenda y hábitats individuales.
initLayersPanel();

// Diccionario (diccionario.js): el glosario entero, consultable sin pasar por una ficha. Se cablea
// sobre su propio panel, igual que el panel de capas.
initDiccionario();

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
      // 1) Subir las posiciones del GPS pendientes. Van las PRIMERAS de todo: son las que verifican
      //    la visita, y sin visita verificada lo que se suba después no contaría para nada.
      const presenceFlush = await flushPresenceQueue();
      if (presenceFlush.newlyUnlocked.length) handleServerNewlyUnlocked(presenceFlush.newlyUnlocked);
      // 2) Subir lo marcado sin cobertura. Va después: es lo único que solo existe en el móvil.
      const flushed = await flushProgressQueue();
      if (flushed.sent) {
        showNotice({
          key: 'offline-sync', icon: '☁️',
          title: 'Progreso sincronizado',
          text: 'Se han subido ' + flushed.sent + (flushed.sent === 1 ? ' marca hecha' : ' marcas hechas') + ' sin cobertura.'
        });
        if (flushed.newlyUnlocked.length) handleServerNewlyUnlocked(flushed.newlyUnlocked);
      }
      // 3) Reconciliar los logros de cuenta (hasta ahora solo corría al arrancar).
      if (state.userId != null) await syncWithServer();
      refreshPresenceBar();
      // 4) ¿El parque guardado tiene fotos o mapa nuevos? Nunca se descarga solo.
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
// Se llama tanto al entrar al parque (directo) como ~2s después desde la sincronización de arranque
// (syncNow, que también corre en cada reconexión): sin protección, las dos llamadas de la entrada al
// primer parque de la sesión caen sobre el mismo aviso con pocos segundos de diferencia y el cartel
// se cierra y se vuelve a abrir solo mientras el usuario lo está leyendo. Se ignora una repetición
// para el mismo parque si ya se ofreció hace menos de 5s; pasado ese margen (reconexión real, cambio
// de parque) se vuelve a ofrecer con normalidad.
let revalidationOfferedFor = null;
async function maybeOfferRevalidation() {
  if (!state.manifest || !NaturDexOffline.parkNeedsRevalidation(state.manifest)) return;
  const slug = state.manifest.slug;
  const now = Date.now();
  if (revalidationOfferedFor && revalidationOfferedFor.slug === slug && now - revalidationOfferedFor.at < 5000) return;
  revalidationOfferedFor = { slug, at: now };
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

  // loadFitosociologia va aquí, con el glosario, y no perezosamente al abrir la primera ficha de
  // hábitat: la lectura en llano de la asociación se pinta en el mismo `innerHTML` que el resto de
  // la ficha (render.js es síncrono), así que tiene que estar en memoria antes del primer pintado.
  await Promise.all([loadData(manifest), loadGeo(manifest), loadProgress(), loadGlossary(), loadFitosociologia(), initAchievements()]);

  // Especies invasoras (dato nacional por CCAA, empaquetado offline). renderInvasoras filtra por
  // región. fetchJsonCached lo cachea en localStorage (capa 1): disponible sin conexión aunque el
  // Service Worker no esté activo, como el resto de datos del parque.
  try {
    state.data.invasoras = (await NaturDexOffline.fetchJsonCached('Data/invasoras.json')).data;
  } catch (e) { /* sin invasoras: la pestaña muestra el aviso de "sin datos" */ }

  // Ya hay catálogo: se decide si este espacio enseña la pestaña de migratorias.
  sincronizaPestanaMigratorias();

  if (parkTitle && state.data.park && state.data.park.name) parkTitle.textContent = state.data.park.name;
  // El mismo nombre, en la barra superior del mapa (móvil): es la primera pantalla del parque y sin
  // rótulo no queda claro en cuál se ha entrado.
  const mapParkTitle = document.querySelector('#mapParkTitle');
  if (mapParkTitle) mapParkTitle.textContent = (state.data.park && state.data.park.name) || '';

  state.selectedId = state.data.species?.[0]?.id ?? null;
  state.selectedPoiId = null;
  // Al entrar al parque, el panel de detalle de la derecha muestra por defecto la etiqueta de un
  // hábitat (no la de una especie). Se prefiere un hábitat sin nota de revisión para una portada
  // limpia; si todos la tuvieran, se usa el primero.
  const defaultHabitat = (state.data.habitats || []).find(h => !h.reviewNote)
    || (state.data.habitats || [])[0];
  state.selectedHabitatId = defaultHabitat ? defaultHabitat.id : null;
  state.detailMode = 'habitat';
  state.hiddenHabitats.clear(); // al (re)entrar a un parque, todos sus hábitats parten visibles
  // El catálogo arranca por su nivel de entrada: los grupos de hábitats. Cambiar de parque no puede
  // dejarlo dentro del grupo o del hábitat del parque anterior, que ya ni existen.
  state.catalogMode = 'groups';
  state.habitatGroupFocus = null;
  state.habitatFocus = null;
  state.sinHabitatFocus = false;
  setOpenLayersGroup(null);
  // Mapa base propio del parque (paquete .pmtiles). Si ya se entra sin cobertura se activa de
  // salida: OSM/PNOA no pintarían nada y el usuario vería la geometría flotando sobre el vacío.
  if (setupParkBaseLayer(manifest) && !NaturDexOffline.isOnline()) applyBaseChoice('parque', false);
  renderSummary();
  renderProtectedAreas();
  renderTrails();
  renderHabitatZones();
  renderMarkers();
  renderPoiMarkers();
  // Ya está todo pintado: los planos entran escalonados de abajo arriba para que el mapa se lea
  // como una secuencia y no como cinco capas de golpe (ver playEntrySequence en map.js).
  playEntrySequence();
  // setView reinicia la vista al catálogo (o a su aviso, si el espacio es de ficha base) al entrar
  // a un parque; así cambiar de parque nunca deja abierta una pestaña que no aplica al nuevo.
  setView('catalog');
  // ...pero en móvil lo primero que se enseña es el MAPA, no el catálogo: al llegar a un parque lo
  // que se quiere saber es dónde estás y qué tienes alrededor. El catálogo queda ya montado detrás,
  // a un toque de la nav inferior. En escritorio no aplica: allí el mapa y el catálogo se ven a la
  // vez, y esta pestaña no existe.
  if (mobileMedia.matches) setMobileTab('map');
  if (state.parkLevel !== 'basic') renderDetail();
  refreshLayersPanel();
  state.parkWasComplete = computeProgress().parkComplete;
  // focusOn (no setView): en móvil la hoja del catálogo tapa la mitad de abajo del mapa, así que el
  // centro del parque se coloca en la franja que SE VE, no en el centro del contenedor.
  focusOn(state.data.park.center, 12);
  // Leaflet cachea el tamaño del contenedor al crearse; si el layout aún no estaba listo (0 de
  // alto), el mapa no dibuja capas ni teselas (ver ensureMapSized en map.js).
  ensureMapSized();

  // Verificación de presencia: a partir de aquí, la app sabe si estás dentro del límite oficial y
  // te lo dice antes de que marques nada (presence.js). No pide el permiso de ubicación por su
  // cuenta: si ya lo tenía, sigue en silencio; si no, la barra ofrece activarlo.
  startPresence(state.activeParkSlug, { onUnlocked: handleServerNewlyUnlocked });

  if (!parkExperienceInited) { initOfflineUI(); initGlossaryPopover(); parkExperienceInited = true; }
  // La UI offline es única pero su contenido depende del parque (si está guardado, cuánto ocupa),
  // así que al cambiar de parque hay que repintarla y volver a mirar si lo guardado está viejo.
  if (window.naturdexRefreshOfflineUI) window.naturdexRefreshOfflineUI();
  maybeOfferRevalidation();
  maybeSuggestSavingPark();
}
window.startParkExperience = startParkExperience;
window.naturdexInvalidateMap = ensureMapSized; // auth.js lo llama al mostrar la pantalla del parque
window.naturdexStopPresence = stopPresence;    // auth.js lo llama al volver al selector de parques

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
