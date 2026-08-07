// ================================================================================================
// map.js — todo lo que toca Leaflet: mapa, capas base, grupos, marcadores y popups.
// ------------------------------------------------------------------------------------------------
// Módulo ES importado por app.js. Crea el mapa al importarse (igual que hacía app.js) y expone
// las funciones de dibujo. No conoce la lógica de vistas: cuando un popup necesita disparar una
// acción de la app (abrir una ficha, marcar un POI…), llama a un handler que app.js inyecta con
// setMapHandlers(). Así render/app pueden cambiar sin tocar este módulo y no hay imports cíclicos.
// ================================================================================================

import { html, escapeHtml, kingdomEmoji, poiEmoji } from './util.js';
import { audioBlock } from './audio.js';
import { state, isHabitatComplete, speciesLatLng } from './state.js';
import { habitatGroupId, habitatGroupById, habitatsOfGroup, PATTERN_TILES } from './habitat-groups.js';

// --- Acciones de la app disparadas desde el mapa (las inyecta app.js) ----------------------------
const handlers = {
  onSelectSpecies: null, // (speciesId, focusMap) al tocar un marcador de especie
  onSelectPoi: null,     // (poiId) al tocar un punto de interés: abre su ficha en el panel/hoja
  onSelectHabitat: null, // (habitatId) al tocar un polígono de hábitat: abre su ficha
  onFocusHabitat: null,  // (habitatId) desde el botón "Ver especies de este hábitat"
  onTogglePoiSeen: null  // (poiId) desde el botón "Marcar como visitado"
};
export function setMapHandlers(h) { Object.assign(handlers, h); }

// --- Mapa y capas base ----------------------------------------------------------------------------
// Capas base: mapa callejero (OSM) y ortofoto aérea (PNOA del IGN, vía WMTS en cuadrícula
// GoogleMapsCompatible = mismo esquema z/x/y que las teselas XYZ de Leaflet).
// className 'tile-osm': el tema oscuro atenúa SOLO este callejero (el PNOA es una ortofoto real y
// alterarla falsearía lo que se ve del terreno). Ver styles.css, bloque del tema oscuro.
export const baseOSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors', maxZoom: 19, className: 'tile-osm'
});
export const basePNOA = L.tileLayer(
  'https://www.ign.es/wmts/pnoa-ma?layer=OI.OrthoimageCoverage&style=default&tilematrixset=GoogleMapsCompatible&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fjpeg&TileMatrix={z}&TileCol={x}&TileRow={y}',
  { attribution: '&copy; Instituto Geográfico Nacional de España (PNOA)', maxZoom: 19 }
);

// --- Mapa base sin conexión (paquete .pmtiles del parque) -----------------------------------------
// OSM y PNOA se sirven desde sus propios dominios, así que sin cobertura el mapa se queda en blanco
// y solo se ve la geometría del parque flotando. Este tercer base lo resuelve: cada parque puede
// traer su propio recorte del basemap de Protomaps (teselas vectoriales derivadas de OSM, ODbL),
// servido desde NUESTRO origen y guardado en la caché del parque, así que funciona igual sin red.
//
// Por qué vectorial y no un recorte ráster: la política de teselas de OSM prohíbe expresamente el
// prefetch y el uso sin conexión de tile.openstreetmap.org, y el mismo parque en ráster hasta z17
// serían decenas de MB frente a ~1 MB en vectorial, que además escala más allá de su zoom máximo.
let baseParque = null;      // capa Leaflet del parque activo (null si no trae paquete)
let baseParqueSlug = null;  // para no reconstruirla en cada render del mismo parque
let baseParqueTiles = null; // descriptor `tiles` del manifiesto, para poder rehacer la capa
let userPickedBase = null;  // 'osm' | 'pnoa' | 'parque' si el usuario eligió a mano en «Capas»

function darkFlavor() {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

/**
 * Construye (o descarta) la capa base del parque a partir de su manifiesto. Degrada en silencio:
 * sin paquete declarado, sin librería vendorizada o con un navegador que no la soporte, se sigue
 * con OSM/PNOA y el fondo vacío de siempre, sin ruido en consola.
 */
export function setupParkBaseLayer(manifest) {
  const tiles = manifest && manifest.tiles;
  if (baseParque && baseParqueSlug !== (manifest && manifest.slug)) {
    if (map.hasLayer(baseParque)) map.removeLayer(baseParque);
    baseParque = null;
    baseParqueSlug = null;
  }
  if (!tiles || !tiles.pmtiles) return null;
  if (typeof protomapsL === 'undefined') return null;
  if (baseParque && baseParqueSlug === manifest.slug) return baseParque;

  try {
    baseParque = protomapsL.leafletLayer({
      url: tiles.pmtiles,
      // El tema es un nombre, no un objeto: protomaps-leaflet trae sus propias paletas, así que no
      // hace falta vendorizar además @protomaps/basemaps.
      flavor: darkFlavor(),
      lang: 'es',
      maxDataZoom: tiles.maxzoom || 15,
      // La atribución es obligatoria (ODbL) y tiene que verse TAMBIÉN sin conexión, que es
      // justo cuando esta capa se usa: por eso viaja en el manifiesto y no en un texto remoto.
      attribution: tiles.attribution
    });
    baseParqueSlug = manifest.slug;
    baseParqueTiles = tiles;
    return baseParque;
  } catch (e) {
    baseParque = null;
    baseParqueSlug = null;
    baseParqueTiles = null;
    return null;
  }
}

export function hasParkBaseLayer() { return !!baseParque; }
export function parkBaseLayer() { return baseParque; }

/** Deja activa una sola capa base. `remember` marca que la elección fue del usuario. */
export function applyBaseChoice(kind, remember) {
  const wanted = kind === 'pnoa' ? basePNOA : (kind === 'parque' ? baseParque : baseOSM);
  if (!wanted) return;
  [baseOSM, basePNOA, baseParque].forEach(layer => {
    if (layer && layer !== wanted && map.hasLayer(layer)) map.removeLayer(layer);
  });
  if (!map.hasLayer(wanted)) wanted.addTo(map);
  if (remember) userPickedBase = kind;
}

export function activeBaseKind() {
  if (baseParque && map.hasLayer(baseParque)) return 'parque';
  return map.hasLayer(basePNOA) ? 'pnoa' : 'osm';
}

// Sin cobertura, OSM y PNOA no pintan nada: si el parque trae paquete propio se conmuta solo, y al
// volver la red se recupera la base de antes salvo que el usuario haya elegido la del parque a mano.
if (window.NaturDexOffline) {
  window.NaturDexOffline.onConnectivityChange(online => {
    if (!baseParque) return;
    if (!online) { if (activeBaseKind() !== 'parque') applyBaseChoice('parque', false); }
    else if (userPickedBase !== 'parque' && activeBaseKind() === 'parque') {
      applyBaseChoice(userPickedBase || preferredBaseKind(), false);
    }
  });
}

// Capa base de arranque: la que el usuario haya elegido en Perfil y ajustes (prefs.js). Sigue
// pudiendo cambiarla sobre la marcha desde el panel de «Capas»; esto solo decide con cuál se abre.
function preferredBaseKind() {
  return (window.NaturDexPrefs && window.NaturDexPrefs.get('mapBase') === 'pnoa') ? 'pnoa' : 'osm';
}
function preferredBase() {
  return preferredBaseKind() === 'pnoa' ? basePNOA : baseOSM;
}

export const map = L.map('map', { zoomControl: false, layers: [preferredBase()] }).setView([37.5016, -1.44925], 12);
L.control.zoom({ position: 'bottomright' }).addTo(map);

// --- Planos del mapa (panes propios) ---------------------------------------------------------------
// Leaflet mete por defecto TODOS los vectores en el mismo plano (overlayPane) y los apila por orden
// de alta: según qué se renderizara antes, la trama de un hábitat acababa tapando el límite del
// parque o un sendero. Con un pane por plano el orden deja de depender del render y pasa a ser el de
// la lectura del mapa: tramas de hábitat al fondo, figuras de protección encima, senderos sobre
// ellas y, arriba del todo, los puntos (POIs, especies y tu posición).
// El pane es además la unidad de la entrada escalonada: fundir un plano es fundir su <div>.
export const PANES = {
  habitats: 'nd-habitats',
  protected: 'nd-protected',
  trails: 'nd-trails',
  pois: 'nd-pois',
  species: 'nd-species',
  user: 'nd-user'
};
// Referencia de los z-index nativos: overlayPane 400, shadowPane 500, markerPane 600,
// tooltipPane 650, popupPane 700. Los propios se intercalan sin pisar ninguno.
[
  [PANES.habitats, 410],
  [PANES.protected, 420],
  [PANES.trails, 430],
  [PANES.pois, 610],
  [PANES.species, 620],
  [PANES.user, 640] // tu posición no la tapa ningún marcador, pero sigue por debajo de los popups
].forEach(([name, zIndex]) => {
  const pane = map.createPane(name);
  pane.style.zIndex = zIndex;
  pane.classList.add('nd-plane');
});

// --- Tocar fuera de una etiqueta la cierra --------------------------------------------------------
// El mapa está cubierto de polígonos clicables (el límite del parque, los LIC/ZEPA, los hábitats),
// así que "tocar fuera" de un globo abierto casi nunca caía en mapa vacío: caía en otro polígono,
// que abría SU etiqueta. Desde fuera parecía que la etiqueta no se cerraba nunca y que la app iba
// sola. Con este guardián, mientras haya algo abierto la siguiente pulsación solo cierra —el mismo
// gesto de descarte que tiene cualquier hoja o menú—, y ya la siguiente vuelve a abrir cosas.
let openPopup = null;
map.on('popupopen', event => { openPopup = event.popup; });
map.on('popupclose', event => { if (openPopup === event.popup) openPopup = null; });

map.getContainer().addEventListener('click', event => {
  if (!openPopup) return;
  const target = event.target;
  if (!target || !target.closest) return;
  // Dentro del propio globo (leer, pulsar su botón, cerrarlo) y en los controles del mapa (zoom,
  // «Capas») el toque es para ellos, no un descarte.
  if (target.closest('.leaflet-popup') || target.closest('.leaflet-control')) return;
  // Tocar OTRO marcador tampoco es descartar: es cambiar de sitio. Se deja pasar para que abra lo
  // suyo directamente (lo abierto se cierra solo al abrirse lo nuevo). Tragarse ese toque obligaría
  // a pulsar dos veces cada punto, que es exactamente la sensación de app que no responde.
  if (target.closest('.leaflet-marker-icon')) return;
  map.closePopup();
  event.stopPropagation();  // que no llegue a los manejadores de Leaflet: este toque solo cierra
  event.preventDefault();
}, true);

// El «atrás» del móvil cierra la etiqueta abierta antes que nada, como en cualquier mapa: es lo
// último que se abrió, así que es lo primero que debe deshacerse (ver Js/nav.js).
map.on('popupopen', () => {
  if (window.NaturDexNav) window.NaturDexNav.open('map-popup', () => map.closePopup());
});
map.on('popupclose', () => {
  if (window.NaturDexNav) window.NaturDexNav.close('map-popup');
});

// --- La franja de mapa que de verdad se ve --------------------------------------------------------
// En móvil, el contenedor del mapa ocupa toda la pantalla pero por arriba lo tapa la barra del
// parque y por abajo la nav inferior y, si está abierta, la ficha deslizante. Centrar "en el centro
// del contenedor" dejaba el punto justo debajo de la hoja: el usuario tocaba un punto de interés y
// el mapa parecía no moverse (o moverse a un sitio que no veía). Todo encuadre pasa por aquí.
const MIN_VISIBLE_STRIP = 140; // px de mapa que se reservan siempre, pase lo que pase

function chromeInset() {
  const inset = { top: 0, bottom: 0 };
  if (!window.matchMedia('(max-width: 900px)').matches) return inset;
  const el = map.getContainer();
  if (!el) return inset;
  const rect = el.getBoundingClientRect();
  if (!rect.height) return inset;
  // Lo de abajo (nav y ficha) se mide por su ALTO, no por su posición: la ficha entra deslizándose
  // y, a mitad de la animación, su posición todavía miente. El alto ya es el definitivo.
  // Se mira `offsetHeight` y no `offsetParent`: la nav y la ficha son position:fixed y ahí
  // offsetParent siempre es null, así que ese atajo habría medido cero en el único caso que importa.
  // Con display:none el alto sí es cero, que es justo la comprobación que se necesita.
  const heightOf = node => (node && !node.hidden && node.offsetHeight) || 0;
  const topBar = document.querySelector('.map-topbar');
  if (heightOf(topBar)) inset.top = Math.max(0, topBar.getBoundingClientRect().bottom - rect.top + 8);
  inset.bottom = heightOf(document.querySelector('.mobile-nav'));
  if (document.body.classList.contains('sheet-open')) {
    inset.bottom = Math.max(inset.bottom, heightOf(document.querySelector('.detail-dock')));
  }
  if (inset.bottom) inset.bottom += 8;
  // Con la hoja casi a pantalla completa no queda franja donde encuadrar nada: se le devuelve al
  // mapa un mínimo para que el punto siga estando "arriba del todo" y no fuera de la pantalla.
  const free = rect.height - inset.top - inset.bottom;
  if (free < MIN_VISIBLE_STRIP) inset.bottom = Math.max(0, rect.height - inset.top - MIN_VISIBLE_STRIP);
  return inset;
}

// Desplazamiento (px) entre el centro del contenedor y el centro de la franja visible.
function visualCenterOffset() {
  const inset = chromeInset();
  return (inset.top - inset.bottom) / 2;
}

// Cambiar la preferencia con la app abierta se refleja en el acto. Se compara con el valor anterior
// a propósito: el listener salta con CUALQUIER preferencia que cambie (tema, texto…) y, sin esta
// guarda, tocar el tema desharía la capa base que el usuario acabase de elegir a mano en «Capas».
if (window.NaturDexPrefs) {
  let lastBasePref = window.NaturDexPrefs.get('mapBase');
  let lastTheme = document.documentElement.dataset.theme;
  window.NaturDexPrefs.onChange(prefs => {
    // El tema del mapa del parque va en las propias teselas (colores vectoriales), no en un filtro
    // CSS como el callejero de OSM: cambiar de claro a oscuro obliga a rehacer la capa.
    const theme = document.documentElement.dataset.theme;
    if (theme !== lastTheme) {
      lastTheme = theme;
      if (baseParque) {
        const wasActive = map.hasLayer(baseParque);
        const manifest = { slug: baseParqueSlug, tiles: baseParqueTiles };
        map.removeLayer(baseParque);
        baseParque = null; baseParqueSlug = null;
        if (setupParkBaseLayer(manifest) && wasActive) applyBaseChoice('parque', false);
      }
    }
    if (prefs.mapBase === lastBasePref) return;
    lastBasePref = prefs.mapBase;
    applyBaseChoice(preferredBaseKind(), false);
  });
}

// Grupos superponibles (cada uno se puede activar/desactivar desde el control de capas).
// Zonas protegidas con geometría oficial (IMIDA/CARM). Parque Regional visible por defecto;
// LIC y ZEPA quedan disponibles pero apagadas para no saturar el mapa de inicio.
state.parqueLayer = L.layerGroup().addTo(map);
state.licLayer = L.layerGroup();
state.zepaLayer = L.layerGroup();
state.trailLayer = L.layerGroup().addTo(map);
state.habitatGroup = L.layerGroup().addTo(map);
state.poiGroup = L.layerGroup().addTo(map);
state.speciesCluster = L.markerClusterGroup({
  maxClusterRadius: 50,
  showCoverageOnHover: false,
  spiderfyOnMaxZoom: true,
  disableClusteringAtZoom: 16,
  clusterPane: PANES.species // los globos de racimo comparten plano con sus marcadores
}).addTo(map);

// El control de capas y la leyenda son un panel propio (layers.js): el control nativo de Leaflet
// no admite subsecciones y aquí hace falta poder encender/apagar cada hábitat por separado.

// --- Iconos ---------------------------------------------------------------------------------------
function speciesDivIcon(species) {
  const seen = state.seenSpecies.has(species.id);
  const color = species.kingdom === 'flora' ? '#2f6f4e' : '#1f6f8b';
  // role="img" + aria-label: los marcadores son alcanzables con el teclado (Leaflet les pone
  // tabindex) y el lector de pantalla debe anunciar qué son, no el emoji literal.
  return L.divIcon({
    className: 'species-marker' + (seen ? ' seen' : ''),
    html: '<span role="img" aria-label="' + escapeHtml(species.commonName) + '" style="background:' + color + '">' + kingdomEmoji(species) + '</span>',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  });
}

// El icono por tipo de POI (poiEmoji) y las imágenes-placeholder viven en util.js.
function poiDivIcon(poi, seen) {
  return L.divIcon({
    className: 'poi-marker' + (seen ? ' seen' : '') + (state.selectedPoiId === poi.id ? ' active' : ''),
    html: '<span role="img" aria-label="' + escapeHtml(poi.name) + (seen ? ' (visitado)' : '') + '">' + poiEmoji(poi) + '</span>',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -13]
  });
}

function userDivIcon() {
  return L.divIcon({ className: 'user-marker', html: '<span></span>', iconSize: [18, 18], iconAnchor: [9, 9] });
}

// --- Marcadores de especies y puntos de interés ----------------------------------------------------
export function renderMarkers() {
  // La ubicación de una especie en el mapa se revela solo cuando el usuario la marca como vista
  // (es parte de la mecánica tipo pokédex, no un inventario de localizaciones pre-cargado).
  state.speciesCluster.clearLayers();
  state.markers.clear();
  state.data.species.forEach(species => {
    if (!state.seenSpecies.has(species.id)) return;
    // Las especies sin coordenada de catálogo (p. ej. las aves de la ZEPA, que vuelan) no tienen
    // un punto fijo, pero SÍ adquieren ubicación cuando el usuario las marca como vistas con GPS:
    // speciesLatLng antepone el avistamiento. Solo se quedan sin marcador si tampoco hay eso.
    const latLng = speciesLatLng(species);
    if (!latLng) return;
    const marker = L.marker(latLng, { icon: speciesDivIcon(species), pane: PANES.species });
    // Sin globo: tocar el marcador abre la ficha completa en el mismo sitio donde el usuario ya lee
    // las fichas (la columna de la derecha en escritorio, la hoja deslizante en móvil). Un globo
    // encima del mapa era un TERCER contenedor de información, con su propio cierre y su propia
    // forma de descartarse, para decir menos que la ficha.
    if (!L.Browser.touch) marker.bindTooltip(species.commonName, { direction: 'top', offset: [0, -12] });
    marker.on('click', () => {
      if (handlers.onSelectSpecies) handlers.onSelectSpecies(species.id, false);
      revealOn(latLng, map.getZoom()); // recolocar bajo la ficha: si no, la hoja lo tapa
    });
    state.speciesCluster.addLayer(marker);
    state.markers.set(species.id, marker);
  });
}

export function renderPoiMarkers() {
  state.poiGroup.clearLayers();
  state.poiMarkers.clear();
  const pois = state.data.pointsOfInterest || [];
  pois.forEach(poi => {
    // Un POI siempre debería venir ubicado, pero una ficha antigua sin coordenadas haría reventar
    // a L.marker(null). Se salta: mejor que falte un marcador a que se caiga el mapa entero.
    if (!poi.coordinates) return;
    const seen = state.seenPois.has(poi.id);
    const marker = L.marker(poi.coordinates, { icon: poiDivIcon(poi, seen), pane: PANES.pois }).addTo(state.poiGroup);
    // Igual que las especies: la ficha del punto de interés se abre donde se abren todas las fichas.
    // El globo anterior traía foto de 180 px, descripción, audioguía y botón: en un móvil ocupaba
    // casi la pantalla entera, Leaflet no conseguía encajarlo y quedaba cortado por arriba o debajo
    // de la nav. Ahora ese mismo contenido cabe en la hoja, que ya sabe deslizarse, hacer scroll y
    // cerrarse con el velo, con la ✕ o con «atrás».
    if (!L.Browser.touch) marker.bindTooltip(poi.name, { direction: 'top', offset: [0, -12] });
    marker.on('click', () => {
      if (handlers.onSelectPoi) handlers.onSelectPoi(poi.id);
      revealOn(poi.coordinates, Math.max(map.getZoom(), 15));
    });
    state.poiMarkers.set(poi.id, marker);
  });
}

// --- Trabajo directo sobre el SVG: tramas y recortes ------------------------------------------------
// Leaflet dibuja cada polígono como un <path> dentro del <svg> del plano que le toca, y no conoce ni
// tramas ni recortes: hay que inyectar los <pattern>/<clipPath> en los <defs> de ESE svg y apuntar
// el atributo del path a su id. Dos avisos que explican la forma de todo lo que sigue:
//   · Leaflet crea un <path> NUEVO cada vez que la capa vuelve al mapa (encender un hábitat en el
//     panel de capas), así que la trama se re-aplica desde el evento 'add' de la capa, no una vez.
//   · setStyle() reescribe fill y fill-opacity desde las opciones, así que después de tocar el
//     estilo (resaltado del hábitat que estás pisando) hay que volver a poner la trama.
const SVG_NS = 'http://www.w3.org/2000/svg';
const PAPER = '#FBF7EE'; // crema del casing: el mismo papel sobre el que se lee todo el plano

/** Recorre los <path> ya montados de una capa (una geometría suelta o un grupo GeoJSON). */
function eachPath(layer, fn) {
  if (layer._path) fn(layer._path, layer);
  if (layer.eachLayer) layer.eachLayer(child => eachPath(child, fn));
}

function svgDefs(path) {
  const svg = path.ownerSVGElement;
  if (!svg) return null;
  let defs = svg.querySelector('defs');
  if (!defs) {
    defs = document.createElementNS(SVG_NS, 'defs');
    svg.insertBefore(defs, svg.firstChild);
  }
  return defs;
}

// Recorte de un trazo contra su propia geometría. Un <stroke> SVG siempre se pinta centrado sobre la
// línea: para una "banda interior" se dibuja un trazo del doble de ancho y se le quita la mitad de
// fuera recortándolo contra el mismo polígono. El <clipPath> lleva una copia del `d` del path, que
// Leaflet recalcula al mover o hacer zoom, así que se resincroniza con la vista.
let clipSeq = 0;
const selfClips = [];

function clipPathsToSelf(layer) {
  eachPath(layer, path => {
    const defs = svgDefs(path);
    if (!defs) return;
    const id = 'nd-clip-' + (++clipSeq);
    const clip = document.createElementNS(SVG_NS, 'clipPath');
    clip.setAttribute('id', id);
    const shape = document.createElementNS(SVG_NS, 'path');
    shape.setAttribute('d', path.getAttribute('d') || '');
    clip.appendChild(shape);
    defs.appendChild(clip);
    path.setAttribute('clip-path', 'url(#' + id + ')');
    selfClips.push({ clip, shape, path });
  });
  syncSelfClips();
}

function syncSelfClips() {
  for (let i = selfClips.length - 1; i >= 0; i--) {
    const entry = selfClips[i];
    // Capa dada de baja (cambio de parque, capa apagada): su <path> ya no está en el documento y el
    // recorte se queda huérfano. Se limpia aquí y no en un removeLayer para no depender del camino
    // por el que la capa desapareció.
    if (!entry.path.isConnected) { entry.clip.remove(); selfClips.splice(i, 1); continue; }
    entry.shape.setAttribute('d', entry.path.getAttribute('d') || '');
  }
}
map.on('zoomend viewreset moveend', syncSelfClips);

// --- Zonas protegidas y senderos (geometría oficial IMIDA/CARM) ------------------------------------
// Plano 1 · zonas protegidas: borde + banda interior, sin relleno. Un espacio protegido no es una
// mancha de color sino un LÍMITE ("a partir de aquí, esto está protegido"), y rellenarlo enturbiaba
// las tramas de hábitat y la ortofoto que hay debajo. El parque lleva casing crema (halo a los dos
// lados que despega el borde de cualquier fondo); LIC y ZEPA, banda hacia dentro, que además dice de
// qué lado del trazo está la figura sin necesidad de leyenda.
const PROTECTED_STYLES = {
  parque: { color: '#1F4D34', weight: 2.5, fill: false, casing: { color: PAPER, weight: 7, opacity: .7 } },
  lic:    { color: '#2E6D8E', weight: 1.5, opacity: .8, dashArray: '6 4', fill: false, band: { weight: 12, opacity: .10 } },
  zepa:   { color: '#4A3B2A', weight: 1.5, opacity: .7, dashArray: '1 5', lineCap: 'round', fill: false, band: { weight: 12, opacity: .08 } }
};

function protectedPopup(figura, nombre, codigo, ha) {
  return String(html`<strong>${nombre}</strong><br><span class="popup-type">${figura}${codigo ? ' · ' + codigo : ''}</span>${ha ? html`<p>${Math.round(ha).toLocaleString('es-ES')} ha</p>` : ''}`);
}

function addProtectedLayer(group, geojson, style, popupFor) {
  if (!geojson) return;
  const { casing, band, ...line } = style;
  const under = casing || band;
  // POPUP_OPTIONS: sin `autoPan`, porque el globo lo coloca revealPopup() dentro de la franja de
  // mapa que de verdad se ve (ver la sección de encuadre).
  const bindPopup = (feature, layer) => layer.bindPopup(popupFor(feature.properties || {}), POPUP_OPTIONS);
  // Casing y banda son el mismo recurso —un trazo ancho por debajo del borde fino— con dos
  // acabados: el casing es crema y sobresale a los dos lados; la banda va del color de la figura y
  // se recorta contra el polígono, así que solo se ve su mitad de dentro. Va en su propia capa y se
  // da de alta ANTES que el borde: dentro de un plano el orden de pintado es el de alta.
  if (under) {
    const underLayer = L.geoJSON(geojson, {
      style: {
        color: under.color || line.color,
        weight: under.weight,
        opacity: under.opacity == null ? 1 : under.opacity,
        fill: false, lineJoin: 'round', lineCap: 'round', pane: PANES.protected
      },
      // El borde son 1,5-2,5 px: sin esto habría que acertarle al píxel para abrir su ficha. La capa
      // de debajo es ancha y lleva el mismo popup, así que hace de zona de toque.
      onEachFeature: bindPopup
    });
    if (band) underLayer.on('add', () => clipPathsToSelf(underLayer));
    underLayer.addTo(group);
  }
  L.geoJSON(geojson, {
    style: { ...line, lineJoin: 'round', pane: PANES.protected },
    onEachFeature: bindPopup
  }).addTo(group);
}

// Plano 3 · senderos: casing crema + núcleo. Los senderos vienen en tres rangos de la red señalizada
// (GR, PR y SL) y un parque puede tener casi veinte a la vez: pintados todos del mismo naranja
// resultaban una maraña en la que no se distinguía la travesía que cruza la sierra del sendero local
// de una hora. Se mantienen dentro de la misma familia de color —siguen leyéndose como "senderos",
// que es una sola capa— y se separan por grosor y trazo, que es justo la jerarquía que tienen sobre
// el terreno. `casing` es el ancho de la banda crema que va debajo: separa la traza del hábitat, del
// límite o de la ortofoto sobre los que cruza sin necesidad de subirle el contraste al color.
export const TRAIL_STYLES = {
  GR: { color: '#8A3B19', weight: 4.5, casing: 9 },
  PR: { color: '#C4762A', weight: 3.5, casing: 8 },
  SL: { color: '#C4762A', weight: 3,   casing: 7.5, dashArray: '0.1 7', lineCap: 'round' }
};

export function trailKind(properties) {
  const m = String((properties && (properties.codigo || properties.name)) || '').match(/\b(GR|PR|SL)\b/i);
  return m ? m[1].toUpperCase() : 'GR';
}

function trailStyle(feature) {
  return Object.assign(
    { opacity: 0.95, lineJoin: 'round', lineCap: 'round', pane: PANES.trails },
    TRAIL_STYLES[trailKind(feature.properties)] || TRAIL_STYLES.GR
  );
}

function trailPopup(p) {
  // `longitudKm` son los kilómetros DENTRO del parque, no los de la ruta completa: se rotula
  // así para no dar a entender que el GR-92 mide 15 km. `homologado` solo se afirma cuando
  // consta en el catálogo de la FMRM (ver Tools/build-park-trails.js), nunca se niega.
  const km = typeof p.longitudKm === 'number'
    ? p.longitudKm.toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' km dentro del parque'
    : '';
  // Las rutas (senderos) admiten audioguía: propiedades `audio`/`audioTranscript` en el
  // feature del trails.geojson (mismas claves que hábitats y POIs).
  return String(html`<strong>${p.name || 'Sendero'}</strong><br><span class="popup-type">${p.tipo || ''}${km ? ' · ' + km : ''}</span>${p.homologado ? html`<span class="badge">homologado</span>` : ''}${p.descripcion ? html`<p>${p.descripcion}</p>` : ''}${audioBlock(p, 'Audioguía de la ruta')}${p.source ? html`<small>${p.source}</small>` : ''}`);
}

export function renderTrails() {
  if (!state.geo || !state.trailLayer) return;
  state.trailLayer.clearLayers();
  if (!state.geo.trails) return;
  const bindPopup = (feature, layer) => layer.bindPopup(trailPopup(feature.properties || {}), POPUP_OPTIONS);
  // El casing va en su propia capa y se da de alta primero, para quedar por debajo de TODOS los
  // núcleos: si fueran pares casing+núcleo sendero a sendero, el casing de uno taparía el núcleo del
  // que cruza por debajo. Copia el punteado del núcleo (el SL es una fila de puntos, y su casing
  // tiene que ser la misma fila, más gruesa, para que cada punto salga con su aro crema).
  L.geoJSON(state.geo.trails, {
    style: feature => {
      const core = trailStyle(feature);
      return {
        color: PAPER, weight: core.casing || core.weight + 4, opacity: .85,
        dashArray: core.dashArray, lineJoin: 'round', lineCap: core.lineCap || 'round',
        fill: false, pane: PANES.trails
      };
    },
    // Un sendero es una línea de 3-4,5 px: el casing es más ancho y lleva el mismo popup, así que
    // hace de zona de toque (importante en móvil, que es donde se usa esto andando).
    onEachFeature: bindPopup
  }).addTo(state.trailLayer);
  L.geoJSON(state.geo.trails, {
    style: trailStyle,
    onEachFeature: bindPopup,
    // La atribución de las trazas NO puede depender de la capa base. Salen de OpenStreetMap (ODbL,
    // ver Tools/build-park-trails.js) y hasta ahora el único crédito a OSM lo ponían el callejero y
    // el paquete de Protomaps: con «Satélite (PNOA)» activo el control pasaba a acreditar solo al
    // IGN y los senderos se pintaban sin mencionar a OSM. Va aquí, en la capa, para que Leaflet la
    // dé de alta y de baja con ella y solo se lea cuando hay senderos dibujados. El `source` de
    // cada sendero sigue en su popup: esto es el crédito visible permanente, no lo sustituye.
    attribution: 'Senderos: &copy; OpenStreetMap contributors (ODbL)'
  }).addTo(state.trailLayer);
}

export function renderProtectedAreas() {
  if (!state.geo) return;
  state.parqueLayer.clearLayers();
  state.licLayer.clearLayers();
  state.zepaLayer.clearLayers();
  addProtectedLayer(state.parqueLayer, state.geo.parque, PROTECTED_STYLES.parque,
    // La figura sale de la propiedad `Figura` del propio GeoJSON (Parque Regional, Paisaje Protegido…),
    // no hardcodeada: este módulo es compartido por todos los parques.
    p => protectedPopup(p.Figura || 'Espacio protegido', p.nombre || '', null, p.Hectareas));
  addProtectedLayer(state.licLayer, state.geo.lic, PROTECTED_STYLES.lic,
    p => protectedPopup('LIC (Red Natura 2000)', p.SITE_NAME || 'LIC', p.SITE_CODE, p.HECTARES));
  addProtectedLayer(state.zepaLayer, state.geo.zepa, PROTECTED_STYLES.zepa,
    p => protectedPopup('ZEPA (Red Natura 2000)', p.site_name || 'ZEPA', p.site_code, p.hectares));
}

// --- Zonas de hábitat -------------------------------------------------------------------------------
// Plano 2 · hábitats: trama SVG por GRUPO. Un parque trae hasta veintiún hábitats solapados, y con
// veintiún rellenos planos de color el mapa se convertía en un mosaico opaco en el que ni se leía la
// ortofoto ni se sabía qué había debajo de qué. La trama resuelve las dos cosas: deja pasar el
// fondo y sigue distinguiéndose donde dos hábitats se pisan, porque lo que separa no es el tono
// sino el dibujo.
//
// La trama y la tinta salen del GRUPO del hábitat (habitat-groups.js), que es el mismo con el que
// se ordenan la leyenda y el catálogo: mirando un polígono se sabe de qué entrada del panel viene.
// Dentro de un grupo todos comparten trama —son formaciones parecidas y así se leen como una sola
// familia—, y lo que los separa entre sí es el BORDE, que toma el color propio del hábitat en el
// catálogo. Es justo el reparto que hace falta ahora que el panel enseña un grupo desplegado cada
// vez: entre grupos distingue el dibujo, dentro del grupo distingue el color.
/** Deja el <pattern> de una trama en los <defs> del svg de ese path y devuelve su id. */
function ensurePattern(path, texture) {
  const tile = PATTERN_TILES[texture.pattern];
  const defs = tile && svgDefs(path);
  if (!defs) return null;
  const id = 'tx-' + texture.pattern;
  if (!defs.querySelector('[id="' + id + '"]')) {
    const pattern = document.createElementNS(SVG_NS, 'pattern');
    pattern.setAttribute('id', id);
    pattern.setAttribute('width', tile.w);
    pattern.setAttribute('height', tile.h);
    // userSpaceOnUse y no objectBoundingBox: la trama es simbología, no textura del terreno, y su
    // paso tiene que medir lo mismo en pantalla en un hábitat de 3 ha y en uno de 3.000.
    pattern.setAttribute('patternUnits', 'userSpaceOnUse');
    pattern.innerHTML = '<rect width="' + tile.w + '" height="' + tile.h + '" fill="' + texture.ink
      + '" fill-opacity="' + texture.bgOpacity + '"/>' + tile.marks(texture.ink);
    defs.appendChild(pattern);
  }
  return id;
}

/**
 * Apunta el relleno de la capa a su trama. fill-opacity vuelve a 1 porque la transparencia ya va
 * dentro de la propia trama (fondo al 5-7 %, trazos al 45-55 %): dejar el 0,16 del relleno plano
 * la borraría. Si algo fallase —navegador sin <pattern>, capa sin path todavía— se queda el relleno
 * de color de siempre, que sigue estando en las opciones de la capa.
 */
function paintTexture(layer) {
  const texture = layer._naturdexTexture;
  if (!texture) return;
  eachPath(layer, path => {
    const id = ensurePattern(path, texture);
    if (!id) return;
    path.setAttribute('fill', 'url(#' + id + ')');
    path.setAttribute('fill-opacity', '1');
  });
}

// Tocar un hábitat abre su ficha (la misma que el catálogo), no un globo propio: ahí ya está la
// superficie, el progreso, las especies y el botón de "ver sus especies", con sitio para leerlo.
function bindHabitatTap(layer, habitat) {
  if (!L.Browser.touch && layer.bindTooltip) layer.bindTooltip(habitat.name, { sticky: true });
  layer.on('click', event => {
    // Sin esto, el toque sigue subiendo hasta el mapa: Leaflet lo trataría como "clic en el mapa" y
    // cerraría la ficha que se acaba de pedir.
    L.DomEvent.stopPropagation(event);
    if (handlers.onSelectHabitat) handlers.onSelectHabitat(habitat.id);
  });
}

export function renderHabitatZones() {
  state.habitatGroup.clearLayers();
  state.habitatLayers.clear();
  (state.data.habitats || []).forEach(habitat => {
    const complete = isHabitatComplete(habitat);
    const geom = state.geo && state.geo.habitatGeom ? state.geo.habitatGeom[habitat.id] : null;
    // La trama (y su velo de fondo) es la del GRUPO; el borde, el color propio del hábitat en el
    // catálogo. Así el plano se lee en dos niveles: el dibujo dice de qué grupo es el polígono —el
    // mismo que encabeza la leyenda y el catálogo— y el filete distingue un hábitat de otro dentro
    // de ese grupo, que es justo lo que hace falta cuando el panel deja desplegado un grupo entero.
    // El oro del hábitat completo manda sobre todo lo demás: es un estado, no una identidad.
    const texture = habitatGroupById(habitatGroupId(habitat));
    const baseStyle = {
      color: complete ? '#d89b30' : (habitat.color || texture.ink),
      weight: complete ? 3 : 2,
      opacity: complete ? 1 : 0.9, // el color del catálogo es más claro que la tinta del grupo: aguanta casi opaco
      fillColor: habitat.color || '#2f6f4e',
      fillOpacity: 0.16,
      pane: PANES.habitats
    };
    let layer;
    if (geom) {
      // Geometría real (polígono) servida desde el habitats.geojson del parque (ver manifiesto).
      layer = L.geoJSON(geom, { style: baseStyle });
    } else if (habitat.coordinates) {
      // Sin polígono todavía: círculo aproximado en la posición representativa del hábitat.
      layer = L.circle(habitat.coordinates, { radius: 420, ...baseStyle });
    } else {
      return;
    }
    // Se guarda el estilo base para poder deshacer el resaltado "estás pisando este hábitat".
    layer._naturdexBaseStyle = baseStyle;
    layer._naturdexTexture = texture;
    bindHabitatTap(layer, habitat);
    // Desde 'add' y no tras el addTo: Leaflet crea un <path> nuevo cada vez que la capa entra al
    // mapa, así que la trama tiene que volver a ponerse también cuando se reactiva desde el panel.
    layer.on('add', () => paintTexture(layer));
    // La visibilidad por hábitat la gobierna el panel de capas (layers.js): la capa se crea
    // siempre (la ficha y el zoom desde otras vistas la necesitan) pero solo se añade al grupo
    // si el usuario no la tiene apagada.
    if (!state.hiddenHabitats.has(habitat.id)) layer.addTo(state.habitatGroup);
    state.habitatLayers.set(habitat.id, layer);
  });
  // Los re-renders (marcar especie vista) recrean las capas: se re-aplica el resaltado vigente.
  if (highlightedHabitatId) applyHighlight(highlightedHabitatId);
}

// --- Resaltado del hábitat que el usuario está pisando (modo explorador) ---------------------------
// Los límites entre hábitats son difíciles de leer para quien no es experto: cuando el GPS sitúa
// al usuario dentro de un hábitat, su polígono se engrosa y rellena más para que el "dónde estoy"
// sea evidente, y se atenúa al salir.
let highlightedHabitatId = null;

function applyHighlight(habitatId) {
  const layer = state.habitatLayers.get(habitatId);
  if (!layer || !layer._naturdexBaseStyle) return;
  // Con relleno de trama el resaltado no puede ser "más opacidad": lo lleva el borde, que se
  // engruesa. setStyle reescribe el fill desde las opciones, así que la trama se repinta detrás.
  layer.setStyle({ ...layer._naturdexBaseStyle, weight: 5, opacity: 1, fillOpacity: 0.32 });
  paintTexture(layer);
  if (layer.bringToFront) layer.bringToFront();
}

export function highlightHabitat(habitatId) {
  if (highlightedHabitatId && highlightedHabitatId !== habitatId) {
    const prev = state.habitatLayers.get(highlightedHabitatId);
    if (prev && prev._naturdexBaseStyle) { prev.setStyle(prev._naturdexBaseStyle); paintTexture(prev); }
  }
  highlightedHabitatId = habitatId || null;
  if (highlightedHabitatId) applyHighlight(highlightedHabitatId);
}

export function setHabitatVisible(habitatId, visible) {
  const layer = state.habitatLayers.get(habitatId);
  if (visible) state.hiddenHabitats.delete(habitatId);
  else state.hiddenHabitats.add(habitatId);
  if (!layer) return;
  if (visible) { if (!state.habitatGroup.hasLayer(layer)) layer.addTo(state.habitatGroup); }
  else state.habitatGroup.removeLayer(layer);
}

// Aísla un hábitat en el mapa: apaga todos los demás y deja visible solo este (los polígonos se
// solapan y vistos todos a la vez confunden). El resto queda en state.hiddenHabitats y el usuario
// puede reactivarlos desde el panel de capas ("Todos" o cada casilla). Lo llama el catálogo al
// seleccionar un hábitat; el panel de capas hace lo mismo con su botón "Solo".
export function soloHabitat(habitatId) {
  (state.data.habitats || []).forEach(h => setHabitatVisible(h.id, h.id === habitatId));
  if (!map.hasLayer(state.habitatGroup)) state.habitatGroup.addTo(map);
}

// --- Visibilidad por GRUPO de hábitats -------------------------------------------------------------
// Es la herramienta de verdad contra el solapamiento: los polígonos que se pisan suelen ser vecinos
// del mismo tipo (tres dunas encadenadas, dos saladares…), así que encender y apagar por grupos deja
// el mapa legible con un solo gesto, en vez de con veintiuna casillas.

/** Enciende o apaga de golpe todos los hábitats de un grupo. */
export function setHabitatGroupVisible(groupId, visible) {
  habitatsOfGroup(groupId).forEach(h => setHabitatVisible(h.id, visible));
  if (visible && !map.hasLayer(state.habitatGroup)) state.habitatGroup.addTo(map);
}

/** Aísla un grupo: deja visibles sus hábitats y apaga los de todos los demás grupos. */
export function soloHabitatGroup(groupId) {
  (state.data.habitats || []).forEach(h => setHabitatVisible(h.id, habitatGroupId(h) === groupId));
  if (!map.hasLayer(state.habitatGroup)) state.habitatGroup.addTo(map);
}

/** Encuadra el mapa sobre todos los hábitats de un grupo (los que tengan geometría cargada). */
export function focusHabitatGroupOnMap(groupId) {
  let bounds = null;
  habitatsOfGroup(groupId).forEach(h => {
    const layer = state.habitatLayers.get(h.id);
    if (!layer || !layer.getBounds) return;
    const b = layer.getBounds();
    if (!b || !b.isValid()) return;
    bounds = bounds ? bounds.extend(b) : L.latLngBounds(b.getSouthWest(), b.getNorthEast());
  });
  if (bounds) fitOn(bounds, { maxZoom: 14 });
}

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
const POPUP_OPTIONS = { autoPan: false, maxWidth: 300, className: 'nd-popup' };

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
