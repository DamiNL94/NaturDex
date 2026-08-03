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
  disableClusteringAtZoom: 16
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
    const marker = L.marker(latLng, { icon: speciesDivIcon(species) });
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
    const marker = L.marker(poi.coordinates, { icon: poiDivIcon(poi, seen) }).addTo(state.poiGroup);
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

// --- Zonas protegidas y senderos (geometría oficial IMIDA/CARM) ------------------------------------
const PROTECTED_STYLES = {
  parque: { color: '#2f6f4e', weight: 3, fill: true, fillColor: '#2f6f4e', fillOpacity: 0.04 },
  lic: { color: '#1f6f8b', weight: 2, dashArray: '5 4', fill: true, fillColor: '#1f6f8b', fillOpacity: 0.06 },
  zepa: { color: '#7b4fa0', weight: 2, dashArray: '2 5', fill: true, fillColor: '#7b4fa0', fillOpacity: 0.05 }
};

function protectedPopup(figura, nombre, codigo, ha) {
  return String(html`<strong>${nombre}</strong><br><span class="popup-type">${figura}${codigo ? ' · ' + codigo : ''}</span>${ha ? html`<p>${Math.round(ha).toLocaleString('es-ES')} ha</p>` : ''}`);
}

function addProtectedLayer(group, geojson, style, popupFor) {
  if (!geojson) return;
  L.geoJSON(geojson, {
    style,
    onEachFeature: (feature, layer) => {
      const p = feature.properties || {};
      layer.bindPopup(popupFor(p));
    }
  }).addTo(group);
}

// Los senderos vienen en tres rangos de la red señalizada (GR, PR y SL) y un parque puede tener
// casi veinte a la vez: pintados todos del mismo naranja resultaban una maraña en la que no se
// distinguía la travesía que cruza la sierra del sendero local de una hora. Se mantienen dentro de
// la misma familia de color —siguen leyéndose como "senderos", que es una sola capa— y se separan
// por grosor y trazo, que es justo la jerarquía que tienen sobre el terreno.
export const TRAIL_STYLES = {
  GR: { color: '#b4531f', weight: 4 },
  PR: { color: '#d98032', weight: 3 },
  SL: { color: '#d98032', weight: 3, dashArray: '7 5' }
};

export function trailKind(properties) {
  const m = String((properties && (properties.codigo || properties.name)) || '').match(/\b(GR|PR|SL)\b/i);
  return m ? m[1].toUpperCase() : 'GR';
}

export function renderTrails() {
  if (!state.geo || !state.trailLayer) return;
  state.trailLayer.clearLayers();
  if (!state.geo.trails) return;
  L.geoJSON(state.geo.trails, {
    style: feature => Object.assign(
      { opacity: 0.9, lineJoin: 'round', lineCap: 'round' },
      TRAIL_STYLES[trailKind(feature.properties)] || TRAIL_STYLES.GR
    ),
    onEachFeature: (feature, layer) => {
      const p = feature.properties || {};
      // `longitudKm` son los kilómetros DENTRO del parque, no los de la ruta completa: se rotula
      // así para no dar a entender que el GR-92 mide 15 km. `homologado` solo se afirma cuando
      // consta en el catálogo de la FMRM (ver Tools/build-park-trails.js), nunca se niega.
      const km = typeof p.longitudKm === 'number'
        ? p.longitudKm.toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' km dentro del parque'
        : '';
      // Las rutas (senderos) admiten audioguía: propiedades `audio`/`audioTranscript` en el
      // feature del trails.geojson (mismas claves que hábitats y POIs).
      layer.bindPopup(
        String(html`<strong>${p.name || 'Sendero'}</strong><br><span class="popup-type">${p.tipo || ''}${km ? ' · ' + km : ''}</span>${p.homologado ? html`<span class="badge">homologado</span>` : ''}${p.descripcion ? html`<p>${p.descripcion}</p>` : ''}${audioBlock(p, 'Audioguía de la ruta')}${p.source ? html`<small>${p.source}</small>` : ''}`)
      );
    }
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
    const baseStyle = {
      color: complete ? '#d89b30' : (habitat.color || '#2f6f4e'),
      weight: complete ? 3 : 2,
      fillColor: habitat.color || '#2f6f4e',
      fillOpacity: 0.16
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
    bindHabitatPopup(layer, habitat);
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
  layer.setStyle({ ...layer._naturdexBaseStyle, weight: 5, opacity: 1, fillOpacity: 0.32 });
  if (layer.bringToFront) layer.bringToFront();
}

export function highlightHabitat(habitatId) {
  if (highlightedHabitatId && highlightedHabitatId !== habitatId) {
    const prev = state.habitatLayers.get(highlightedHabitatId);
    if (prev && prev._naturdexBaseStyle) prev.setStyle(prev._naturdexBaseStyle);
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
    // zIndexOffset alto: tu punto no lo tapa ningún marcador de especie ni de punto de interés.
    state.userMarker = L.marker(latlng, { icon: userDivIcon(), zIndexOffset: 1000, interactive: false }).addTo(map);
    state.userAccuracyCircle = L.circle(latlng, {
      radius: accuracy || 30, color: '#1f6f8b', weight: 1, fillColor: '#1f6f8b', fillOpacity: 0.08, interactive: false
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
