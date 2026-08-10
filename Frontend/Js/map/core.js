// ================================================================================================
// ./map/core.js — la instancia del mapa, las capas base (OSM/PNOA/paquete .pmtiles del parque), los planos propios y chromeInset()
// ------------------------------------------------------------------------------------------------
// Trozo de map.js. El índice de la carpeta está en Frontend/Js/CLAUDE.md.
// ================================================================================================

import { state } from '../state.js';

// --- Acciones de la app disparadas desde el mapa (las inyecta app.js) ----------------------------
export const handlers = {
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

export function chromeInset() {
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
export function visualCenterOffset() {
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
