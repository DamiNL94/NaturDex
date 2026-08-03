// ================================================================================================
// map.js — todo lo que toca Leaflet: mapa, capas base, grupos, marcadores y popups.
// ------------------------------------------------------------------------------------------------
// Módulo ES importado por app.js. Crea el mapa al importarse (igual que hacía app.js) y expone
// las funciones de dibujo. No conoce la lógica de vistas: cuando un popup necesita disparar una
// acción de la app (abrir una ficha, marcar un POI…), llama a un handler que app.js inyecta con
// setMapHandlers(). Así render/app pueden cambiar sin tocar este módulo y no hay imports cíclicos.
// ================================================================================================

import { html, escapeHtml, kingdomEmoji, poiEmoji, poiImageSrc } from './util.js';
import { audioBlock } from './audio.js';
import {
  state, habitatSpeciesSeenCount, habitatAreaLabel, isHabitatComplete, speciesLatLng
} from './state.js';

// --- Acciones de la app disparadas desde el mapa (las inyecta app.js) ----------------------------
const handlers = {
  onSelectSpecies: null, // (speciesId, focusMap) desde el popup/click de un marcador de especie
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
    className: 'poi-marker' + (seen ? ' seen' : ''),
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
    const fromGps = state.sightings.has(species.id);
    const marker = L.marker(latLng, { icon: speciesDivIcon(species), pane: PANES.species });
    marker.bindPopup(
      String(html`<strong>${species.commonName}</strong><br>${species.scientificName}<br><small>${fromGps ? '📍 Ubicación registrada por GPS' : '📍 Ubicación aproximada (sin GPS)'}</small>`)
    );
    marker.on('click', () => handlers.onSelectSpecies && handlers.onSelectSpecies(species.id, false));
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
    marker.bindPopup(
      String(html`<div class="poi-popup-image"><img src="${poiImageSrc(poi)}" alt="" loading="lazy"></div><strong>${poi.name}</strong><br><span class="popup-type">${poi.type}</span>${poi.approx ? html`<span class="badge review poi-approx-badge">ubicación aproximada</span>` : ''}<p>${poi.description}</p>${audioBlock(poi, 'Audioguía del punto de interés')}${poi.source ? html`<p class="detail-source">Fuente: ${poi.source}</p>` : ''}<button type="button" class="poi-seen-btn" data-poi="${poi.id}" aria-pressed="${seen ? 'true' : 'false'}">${seen ? '✓ Visitado' : 'Marcar como visitado'}</button>`),
      { maxWidth: 300 }
    );
    marker.on('popupopen', event => {
      const button = event.popup.getElement().querySelector('.poi-seen-btn');
      if (button) button.addEventListener('click', () => handlers.onTogglePoiSeen && handlers.onTogglePoiSeen(poi.id));
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
  const bindPopup = (feature, layer) => layer.bindPopup(popupFor(feature.properties || {}));
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
  const bindPopup = (feature, layer) => layer.bindPopup(trailPopup(feature.properties || {}));
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
  L.geoJSON(state.geo.trails, { style: trailStyle, onEachFeature: bindPopup }).addTo(state.trailLayer);
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
// Plano 2 · hábitats: trama SVG por familia. Un parque trae hasta once hábitats solapados, y con
// once rellenos planos de color el mapa se convertía en un mosaico opaco en el que ni se leía la
// ortofoto ni se sabía qué había debajo de qué. La trama resuelve las dos cosas: deja pasar el
// fondo y sigue distinguiéndose donde dos hábitats se pisan, porque lo que separa no es el tono
// sino el dibujo. Las familias son las siete grandes formaciones, con tinta según el medio
// (verde vegetación, marrón mineral, azul agua).
export const HABITAT_TEXTURES = {
  matorral: { pattern: 'hatch45',   ink: '#1F4D34', bgOpacity: .07 },
  bosque:   { pattern: 'hatch-45',  ink: '#1F4D34', bgOpacity: .07 },
  pastos:   { pattern: 'dots',      ink: '#1F4D34', bgOpacity: .05 },
  roquedo:  { pattern: 'grid',      ink: '#4A3B2A', bgOpacity: .06 },
  dunas:    { pattern: 'waveDry',   ink: '#4A3B2A', bgOpacity: .05 },
  ribera:   { pattern: 'waveWet',   ink: '#2E6D8E', bgOpacity: .07 },
  saladar:  { pattern: 'hatchDash', ink: '#2E6D8E', bgOpacity: .05 }
};

// La tesela de cada trama. Las diagonales se dibujan con las dos esquinas repetidas (los tramos
// fuera de la tesela) para que el rayado sea continuo al repetirse y no queden escalones.
const PATTERN_TILES = {
  hatch45:    { w: 8,  h: 8,  marks: ink => mark('M0 8 L8 0 M-1 1 L1 -1 M7 9 L9 7', ink, 1, .55) },
  'hatch-45': { w: 8,  h: 8,  marks: ink => mark('M0 0 L8 8 M-1 7 L1 9 M7 -1 L9 1', ink, 1, .55) },
  grid:       { w: 9,  h: 9,  marks: ink => mark('M0 0 L0 9 M0 0 L9 0', ink, .8, .45) },
  dots:       { w: 7,  h: 7,  marks: ink => '<circle cx="3.5" cy="3.5" r="1.1" fill="' + ink + '" fill-opacity=".5"/>' },
  waveWet:    { w: 12, h: 8,  marks: ink => mark('M0 6 q3 -3 6 0 t6 0', ink, 1, .55) },
  waveDry:    { w: 12, h: 8,  marks: ink => mark('M0 6 q3 -3 6 0 t6 0', ink, 1, .45, '3 2.5') },
  hatchDash:  { w: 8,  h: 8,  marks: ink => mark('M0 8 L8 0 M-1 1 L1 -1 M7 9 L9 7', ink, 1, .5, '2.5 2.5') }
};

function mark(d, ink, width, opacity, dash) {
  return '<path d="' + d + '" fill="none" stroke="' + ink + '" stroke-width="' + width + '"'
    + ' stroke-opacity="' + opacity + '" stroke-linecap="round"'
    + (dash ? ' stroke-dasharray="' + dash + '"' : '') + '/>';
}

/**
 * Familia de trama de un hábitat. El criterio es el código HIC (anexo I de la Directiva Hábitats
 * 92/43/CEE), que ya agrupa por grandes tipos: 1x costeros y salinos, 2x dunas, 3x aguas
 * continentales, 4x-5x matorrales, 6x pastizales, 7x turberas, 8x roquedos y 9x bosques (91x y 92x
 * son los bosques de galería, que sobre el mapa se leen como ribera y no como bosque). Solo si el
 * hábitat viniera sin código se recurre al campo `type` del catálogo, que es texto libre.
 */
export function habitatFamily(habitat) {
  const code = String((habitat && habitat.code) || '').toUpperCase();
  const group = code.slice(0, 2);
  if (group === '91' || group === '92') return 'ribera';
  if (code.startsWith('9')) return 'bosque';
  if (code.startsWith('3') || code.startsWith('7')) return 'ribera';
  if (code.startsWith('2') || code === '1210' || code === '1220') return 'dunas';
  if (code === '1230' || code === '1240') return 'roquedo'; // acantilados
  if (code.startsWith('1')) return 'saladar';               // 13xx-15xx: marismas y estepas salinas
  if (code.startsWith('4') || code.startsWith('5')) return 'matorral';
  if (code.startsWith('6')) return 'pastos';
  if (code.startsWith('8')) return 'roquedo';
  // NFD + quitar diacríticos: el campo es texto libre del catálogo ("Roquedos", "Salino"…).
  const type = String((habitat && habitat.type) || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (type.includes('bosque')) return 'bosque';
  if (type.includes('pasto') || type.includes('prado')) return 'pastos';
  if (type.includes('roqued') || type.includes('rocos')) return 'roquedo';
  if (type.includes('ribera') || type.includes('fluvial') || type.includes('humedal')) return 'ribera';
  if (type.includes('salin') || type.includes('salad')) return 'saladar';
  if (type.includes('litoral') || type.includes('duna') || type.includes('playa')) return 'dunas';
  return 'matorral';
}

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

function bindHabitatPopup(layer, habitat) {
  const complete = isHabitatComplete(habitat);
  const seenCount = habitatSpeciesSeenCount(habitat);
  const total = (habitat.speciesIds || []).length;
  const area = habitatAreaLabel(habitat);
  layer.bindPopup(
    String(html`<strong>${habitat.name}</strong><br><span class="popup-type">${habitat.type || ''}${habitat.priority ? ' · prioritario UE' : ''}${habitat.code ? ' · cód. ' + habitat.code : ''}</span>${area ? html`<p class="habitat-area-line">Superficie en el parque: <strong>${area}</strong></p>` : ''}<p>${habitat.description}</p><p class="habitat-progress-line">Especies vistas: <strong>${seenCount} / ${total}</strong>${complete ? ' · ¡Hábitat completo! 🏅' : ''}</p><button type="button" class="habitat-filter-btn" data-habitat="${habitat.id}">Ver especies de este hábitat</button>`)
  );
  layer.on('popupopen', event => {
    const button = event.popup.getElement().querySelector('.habitat-filter-btn');
    if (button) button.addEventListener('click', () => handlers.onFocusHabitat && handlers.onFocusHabitat(habitat.id));
  });
}

export function renderHabitatZones() {
  state.habitatGroup.clearLayers();
  state.habitatLayers.clear();
  (state.data.habitats || []).forEach(habitat => {
    const complete = isHabitatComplete(habitat);
    const geom = state.geo && state.geo.habitatGeom ? state.geo.habitatGeom[habitat.id] : null;
    // Borde y trama comparten la tinta de la familia: el plano queda de una pieza y los hábitats se
    // distinguen por el DIBUJO, no por el tono. El color propio de cada hábitat (verdes, rosas y
    // ocres del catálogo) no desaparece: sigue siendo su punto en el panel de capas, que es la
    // leyenda, y el relleno de respaldo si el navegador no pintase la trama. El oro del hábitat
    // completo manda sobre todo lo demás: es un estado, no una identidad.
    const texture = HABITAT_TEXTURES[habitatFamily(habitat)];
    const baseStyle = {
      color: complete ? '#d89b30' : (texture ? texture.ink : (habitat.color || '#2f6f4e')),
      weight: complete ? 3 : 2,
      opacity: complete ? 1 : 0.75, // la tinta es oscura: a plena opacidad el borde pesaba más que su trama
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
    bindHabitatPopup(layer, habitat);
    // Desde 'add' y no tras el addTo: Leaflet crea un <path> nuevo cada vez que la capa entra al
    // mapa, así que la trama tiene que volver a ponerse también cuando se reactiva desde el panel.
    layer.on('add', () => paintTexture(layer));
    // La visibilidad por hábitat la gobierna el panel de capas (layers.js): la capa se crea
    // siempre (los popups y el zoom desde otras vistas la necesitan) pero solo se añade al grupo
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
// Punto único por el que la app mueve el mapa "para enseñar algo". Hubo una época en que además
// descontaba la parte que tapaba la hoja del catálogo, cuando el mapa era el fondo permanente de la
// pantalla del parque; ahora el mapa tiene su pestaña entera para él y no hay nada delante que
// descontar, pero el embudo se queda: es el sitio donde ponerlo si vuelve a hacer falta.
export function focusOn(latlng, zoom = null, options = {}) {
  map.setView(latlng, zoom == null ? map.getZoom() : zoom, options);
}

export function fitOn(bounds, options = {}) {
  map.fitBounds(bounds, options);
}

// Encuadra un hábitat en el mapa (y abre su popup si se pide). Lo usan el panel de capas y el
// panel "cerca de ti" del explorador.
export function focusHabitatOnMap(habitatId, openPopup = false) {
  const layer = state.habitatLayers.get(habitatId);
  if (!layer) return;
  const bounds = layer.getBounds ? layer.getBounds() : null;
  if (bounds) fitOn(bounds, { maxZoom: 15 });
  if (openPopup && layer.openPopup) layer.openPopup();
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
