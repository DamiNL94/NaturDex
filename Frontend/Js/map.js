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
export const baseOSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors', maxZoom: 19
});
export const basePNOA = L.tileLayer(
  'https://www.ign.es/wmts/pnoa-ma?layer=OI.OrthoimageCoverage&style=default&tilematrixset=GoogleMapsCompatible&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fjpeg&TileMatrix={z}&TileCol={x}&TileRow={y}',
  { attribution: '&copy; Instituto Geográfico Nacional de España (PNOA)', maxZoom: 19 }
);

export const map = L.map('map', { zoomControl: false, layers: [baseOSM] }).setView([37.5016, -1.44925], 12);
L.control.zoom({ position: 'bottomright' }).addTo(map);

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
    // Las especies sin coordenadas (p. ej. las aves de la ZEPA, que vuelan) no llevan marcador.
    if (!species.coordinates) return;
    const fromGps = state.sightings.has(species.id);
    const marker = L.marker(speciesLatLng(species), { icon: speciesDivIcon(species) });
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

export function renderTrails() {
  if (!state.geo || !state.trailLayer) return;
  state.trailLayer.clearLayers();
  if (!state.geo.trails) return;
  L.geoJSON(state.geo.trails, {
    style: { color: '#c0662a', weight: 3, opacity: 0.9, lineJoin: 'round', lineCap: 'round' },
    onEachFeature: (feature, layer) => {
      const p = feature.properties || {};
      // Las rutas (senderos) admiten audioguía: propiedades `audio`/`audioTranscript` en el
      // feature del trails.geojson (mismas claves que hábitats y POIs).
      layer.bindPopup(
        String(html`<strong>${p.name || 'Sendero'}</strong><br><span class="popup-type">${p.tipo || ''}</span>${p.descripcion ? html`<p>${p.descripcion}</p>` : ''}${audioBlock(p, 'Audioguía de la ruta')}${p.source ? html`<small>${p.source}</small>` : ''}`)
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

// Encuadra un hábitat en el mapa (y abre su popup si se pide). Lo usan el panel de capas y el
// panel "cerca de ti" del explorador.
export function focusHabitatOnMap(habitatId, openPopup = false) {
  const layer = state.habitatLayers.get(habitatId);
  if (!layer) return;
  const bounds = layer.getBounds ? layer.getBounds() : null;
  if (bounds) map.fitBounds(bounds, { maxZoom: 15 });
  if (openPopup && layer.openPopup) layer.openPopup();
}

// --- Posición del usuario (modo explorador) ---------------------------------------------------------
export function placeUserMarker(lat, lng, accuracy) {
  const latlng = [lat, lng];
  if (!state.userMarker) {
    state.userMarker = L.marker(latlng, { icon: userDivIcon(), zIndexOffset: 1000 }).addTo(map);
    state.userAccuracyCircle = L.circle(latlng, {
      radius: accuracy || 30, color: '#1f6f8b', weight: 1, fillColor: '#1f6f8b', fillOpacity: 0.08, interactive: false
    }).addTo(map);
    map.setView(latlng, 15, { animate: true });
  } else {
    state.userMarker.setLatLng(latlng);
    state.userAccuracyCircle.setLatLng(latlng).setRadius(accuracy || 30);
  }
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
