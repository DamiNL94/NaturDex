const API_BASE = '../Backend/Api';
const ACHIEVEMENT_NAME = '¡Más aguileño que un pijo lobo!';

const state = {
  data: null,
  filter: 'all',
  query: '',
  selectedId: null,
  view: 'catalog',
  habitatFocus: null,
  markers: new Map(),
  poiMarkers: new Map(),
  habitatLayers: new Map(),
  seenSpecies: new Set(),
  seenPois: new Set(),
  sightings: new Map(),
  progressReady: false,
  parkWasComplete: false
};

// Capas base: mapa callejero (OSM) y ortofoto aérea (PNOA del IGN, vía WMTS en cuadrícula
// GoogleMapsCompatible = mismo esquema z/x/y que las teselas XYZ de Leaflet).
const baseOSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors', maxZoom: 19
});
const basePNOA = L.tileLayer(
  'https://www.ign.es/wmts/pnoa-ma?layer=OI.OrthoimageCoverage&style=default&tilematrixset=GoogleMapsCompatible&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fjpeg&TileMatrix={z}&TileCol={x}&TileRow={y}',
  { attribution: '&copy; Instituto Geográfico Nacional de España (PNOA)', maxZoom: 19 }
);

const map = L.map('map', { zoomControl: false, layers: [baseOSM] }).setView([37.5016, -1.44925], 12);
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

L.control.layers(
  { 'Mapa': baseOSM, 'Satélite (PNOA)': basePNOA },
  {
    '🟩 Parque Regional': state.parqueLayer,
    '🟦 LIC · Red Natura 2000': state.licLayer,
    '🟪 ZEPA · Red Natura 2000': state.zepaLayer,
    '🥾 Senderos (GR-92)': state.trailLayer,
    '🌿 Hábitats': state.habitatGroup,
    '⭐ Puntos de interés': state.poiGroup,
    '🐾 Especies vistas': state.speciesCluster
  },
  { position: 'topright', collapsed: false }
).addTo(map);

const speciesList = document.querySelector('#speciesList');
const detailPanel = document.querySelector('#detailPanel');
const searchInput = document.querySelector('#searchInput');
const resultCount = document.querySelector('#resultCount');
const speciesCount = document.querySelector('#speciesCount');
const habitatCount = document.querySelector('#habitatCount');
const coastlineKm = document.querySelector('#coastlineKm');
const parkSummary = document.querySelector('#parkSummary');
const progressTrack = document.querySelector('#progressTrack');
const progressFill = document.querySelector('#progressFill');
const progressLabel = document.querySelector('#progressLabel');
const catalogControls = document.querySelector('#catalogControls');
const catalogPanel = document.querySelector('#catalogPanel');
const progressPanel = document.querySelector('#progressPanel');
const habitatFilterChip = document.querySelector('#habitatFilterChip');
const habitatFilterLabel = document.querySelector('#habitatFilterLabel');
const habitatFilterClear = document.querySelector('#habitatFilterClear');

function escapeHtml(value) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function normalize(value) {
  return String(value ?? '').toLocaleLowerCase('es-ES');
}

function kingdomEmoji(species) {
  if (species.kingdom === 'flora') return '🌿';
  const group = normalize(species.group);
  if (group.includes('ave')) return '🐦';
  if (group.includes('reptil')) return '🦎';
  if (group.includes('anfibio')) return '🐸';
  if (group.includes('mam')) return '🐾';
  return '🐚';
}

function placeholderImage(species) {
  const bg = species.kingdom === 'flora' ? '#e4f0e7' : '#e1eef5';
  const icon = kingdomEmoji(species);
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">'
    + '<rect width="100%" height="100%" fill="' + bg + '"/>'
    + '<text x="50%" y="55%" font-size="76" text-anchor="middle" dominant-baseline="middle">' + icon + '</text>'
    + '</svg>';
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

window.__imgFallback = function (imgEl, speciesId) {
  const species = state.data.species.find(item => item.id === Number(speciesId));
  if (!species || !imgEl) return;
  imgEl.onerror = null;
  imgEl.src = placeholderImage(species);
};

function speciesImageSrc(species) {
  return species.image && species.image.trim() ? species.image : placeholderImage(species);
}

function getFilteredSpecies() {
  return state.data.species.filter(species => {
    const matchesFilter = state.filter === 'all'
      || (state.filter === 'seen' && state.seenSpecies.has(species.id))
      || species.kingdom === state.filter;
    const matchesHabitat = !state.habitatFocus || (species.habitatIds || []).includes(state.habitatFocus);
    const text = normalize([species.commonName, species.scientificName, species.group, species.habitat].join(' '));
    return matchesFilter && matchesHabitat && text.includes(normalize(state.query));
  });
}

function renderSummary() {
  speciesCount.textContent = state.data.species.length;
  habitatCount.textContent = state.data.habitats.length;
  coastlineKm.textContent = state.data.park.coastlineKm + ' km';
  parkSummary.textContent = state.data.park.summary;
  renderProgress();
}

function renderProgress() {
  if (!progressTrack) return;
  const total = state.data.species.length;
  const seen = state.seenSpecies.size;
  const pct = total ? Math.round((seen / total) * 100) : 0;
  progressFill.style.width = pct + '%';
  progressLabel.textContent = seen + ' / ' + total + ' especies descubiertas';
}

function renderSpeciesList() {
  const species = getFilteredSpecies();
  resultCount.textContent = species.length === 1 ? '1 resultado' : species.length + ' resultados';
  speciesList.innerHTML = species.map(item => {
    const seen = state.seenSpecies.has(item.id);
    return '<button class="species-card ' + (item.id === state.selectedId ? 'active' : '') + (seen ? ' seen' : '') + '" type="button" data-id="' + item.id + '">'
      + '<span class="card-thumb">'
      + '<img src="' + escapeHtml(speciesImageSrc(item)) + '" alt="' + escapeHtml(item.commonName) + '" loading="lazy" onerror="window.__imgFallback(this,' + item.id + ')">'
      + (seen ? '<span class="seen-badge" title="Visto">✓</span>' : '')
      + '</span>'
      + '<span><span class="card-meta"><span class="badge ' + item.kingdom + '">' + escapeHtml(item.kingdom) + '</span>'
      + (item.featured ? '<span class="badge alert">prioritaria</span>' : '')
      + (item.reviewNote ? '<span class="badge review">a revisar</span>' : '') + '</span>'
      + '<h3>' + escapeHtml(item.commonName) + '</h3><em>' + escapeHtml(item.scientificName) + '</em></span></button>';
  }).join('');
}

function renderTaxonomyRow(label, value) {
  if (!value) return '';
  return '<div><span>' + label + '</span><strong>' + escapeHtml(value) + '</strong></div>';
}

function renderDetail() {
  const species = state.data.species.find(item => item.id === state.selectedId) ?? state.data.species[0];
  if (!species) { detailPanel.innerHTML = ''; return; }
  const seen = state.seenSpecies.has(species.id);
  const tx = species.taxonomy || {};
  detailPanel.innerHTML = '<div class="detail-image-wrap">'
    + '<img src="' + escapeHtml(speciesImageSrc(species)) + '" alt="' + escapeHtml(species.commonName) + '" onerror="window.__imgFallback(this,' + species.id + ')">'
    + '</div>'
    + '<div class="detail-body">'
    + '<span class="card-meta"><span class="badge ' + species.kingdom + '">' + escapeHtml(species.kingdom) + '</span>'
    + '<span class="badge alert">' + escapeHtml(species.conservationStatus) + '</span>'
    + (species.reviewNote ? '<span class="badge review">a revisar</span>' : '')
    + '</span>'
    + '<h2>' + escapeHtml(species.commonName) + '</h2><em>' + escapeHtml(species.scientificName) + '</em>'
    + '<p>' + escapeHtml(species.description) + '</p>'
    + '<ul class="detail-list">' + species.tips.map(tip => '<li>' + escapeHtml(tip) + '</li>').join('') + '</ul>'
    + '<div class="detail-facts">'
    + '<div><span>Hábitat</span><strong>' + escapeHtml(species.habitat) + '</strong></div>'
    + '<div><span>Temporada</span><strong>' + escapeHtml(species.seasonality) + '</strong></div>'
    + '<div><span>Grupo</span><strong>' + escapeHtml(species.group) + '</strong></div>'
    + '<div><span>Rareza</span><strong>' + '★'.repeat(species.rarityScore) + '☆'.repeat(5 - species.rarityScore) + '</strong></div>'
    + '</div>'
    + '<h3 class="detail-subtitle">Taxonomía</h3>'
    + '<div class="detail-facts detail-taxonomy">'
    + renderTaxonomyRow('Reino', tx.kingdom)
    + renderTaxonomyRow('Filo/División', tx.phylum)
    + renderTaxonomyRow('Clase', tx.class)
    + renderTaxonomyRow('Orden', tx.order)
    + renderTaxonomyRow('Familia', tx.family)
    + renderTaxonomyRow('Género', tx.genus)
    + '</div>'
    + '<h3 class="detail-subtitle">Estado de conservación</h3>'
    + '<ul class="status-list">'
    + '<li><span>UICN (global)</span>' + escapeHtml(species.iucnGlobal || 'No evaluada') + '</li>'
    + '<li><span>España</span>' + escapeHtml(species.spainStatus || 'Sin dato') + '</li>'
    + '<li><span>Región de Murcia</span>' + escapeHtml(species.murciaStatus || 'Sin dato') + '</li>'
    + '</ul>'
    + (species.reviewNote ? '<div class="review-note"><strong>Pendiente de revisión:</strong> ' + escapeHtml(species.reviewNote) + '</div>' : '')
    + (species.source ? '<p class="detail-source">Fuente: ' + escapeHtml(species.source) + '</p>' : '')
    + '<button class="seen-toggle ' + (seen ? 'is-seen' : '') + '" type="button" data-toggle-seen="' + species.id + '">'
    + (seen ? '✓ Visto' : 'Marcar como visto')
    + '</button>'
    + '</div>';
}

function speciesDivIcon(species) {
  const seen = state.seenSpecies.has(species.id);
  const color = species.kingdom === 'flora' ? '#2f6f4e' : '#1f6f8b';
  return L.divIcon({
    className: 'species-marker' + (seen ? ' seen' : ''),
    html: '<span style="background:' + color + '">' + kingdomEmoji(species) + '</span>',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  });
}

function poiDivIcon(seen) {
  return L.divIcon({
    className: 'poi-marker' + (seen ? ' seen' : ''),
    html: '<span>★</span>',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
}

function speciesLatLng(species) {
  // La ubicación del avistamiento la aporta el GPS del móvil; si no la hay, se usa la coordenada
  // representativa del catálogo como aproximación.
  const s = state.sightings.get(species.id);
  return s ? [s.lat, s.lng] : species.coordinates;
}

function renderMarkers() {
  // La ubicación de una especie en el mapa se revela solo cuando el usuario la marca como vista
  // (es parte de la mecánica tipo pokédex, no un inventario de localizaciones pre-cargado).
  state.speciesCluster.clearLayers();
  state.markers.clear();
  state.data.species.forEach(species => {
    if (!state.seenSpecies.has(species.id)) return;
    const fromGps = state.sightings.has(species.id);
    const marker = L.marker(speciesLatLng(species), { icon: speciesDivIcon(species) });
    marker.bindPopup(
      '<strong>' + escapeHtml(species.commonName) + '</strong><br>' + escapeHtml(species.scientificName)
      + '<br><small>' + (fromGps ? '📍 Ubicación registrada por GPS' : '📍 Ubicación aproximada (sin GPS)') + '</small>'
    );
    marker.on('click', () => selectSpecies(species.id, false));
    state.speciesCluster.addLayer(marker);
    state.markers.set(species.id, marker);
  });
}

function renderPoiMarkers() {
  state.poiGroup.clearLayers();
  state.poiMarkers.clear();
  const pois = state.data.pointsOfInterest || [];
  pois.forEach(poi => {
    const seen = state.seenPois.has(poi.id);
    const marker = L.marker(poi.coordinates, { icon: poiDivIcon(seen) }).addTo(state.poiGroup);
    marker.bindPopup(
      '<strong>' + escapeHtml(poi.name) + '</strong><br>'
      + '<span class="popup-type">' + escapeHtml(poi.type) + '</span>'
      + '<p>' + escapeHtml(poi.description) + '</p>'
      + '<button type="button" class="poi-seen-btn" data-poi="' + escapeHtml(poi.id) + '">' + (seen ? '✓ Visitado' : 'Marcar como visitado') + '</button>'
    );
    marker.on('popupopen', event => {
      const button = event.popup.getElement().querySelector('.poi-seen-btn');
      if (button) button.addEventListener('click', () => togglePoiSeen(poi.id));
    });
    state.poiMarkers.set(poi.id, marker);
  });
}

// Estilos por figura de protección (geometría oficial de IMIDA/CARM).
const PROTECTED_STYLES = {
  parque: { color: '#2f6f4e', weight: 3, fill: true, fillColor: '#2f6f4e', fillOpacity: 0.04 },
  lic: { color: '#1f6f8b', weight: 2, dashArray: '5 4', fill: true, fillColor: '#1f6f8b', fillOpacity: 0.06 },
  zepa: { color: '#7b4fa0', weight: 2, dashArray: '2 5', fill: true, fillColor: '#7b4fa0', fillOpacity: 0.05 }
};

function protectedPopup(figura, nombre, codigo, ha) {
  return '<strong>' + escapeHtml(nombre) + '</strong><br>'
    + '<span class="popup-type">' + escapeHtml(figura) + (codigo ? ' · ' + escapeHtml(codigo) : '') + '</span>'
    + (ha ? '<p>' + Math.round(ha).toLocaleString('es-ES') + ' ha</p>' : '');
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

function renderTrails() {
  if (!state.geo || !state.trailLayer) return;
  state.trailLayer.clearLayers();
  if (!state.geo.trails) return;
  L.geoJSON(state.geo.trails, {
    style: { color: '#c0662a', weight: 3, opacity: 0.9, lineJoin: 'round', lineCap: 'round' },
    onEachFeature: (feature, layer) => {
      const p = feature.properties || {};
      layer.bindPopup(
        '<strong>' + escapeHtml(p.name || 'Sendero') + '</strong><br>'
        + '<span class="popup-type">' + escapeHtml(p.tipo || '') + '</span>'
        + (p.descripcion ? '<p>' + escapeHtml(p.descripcion) + '</p>' : '')
        + (p.source ? '<small>' + escapeHtml(p.source) + '</small>' : '')
      );
    }
  }).addTo(state.trailLayer);
}

function renderProtectedAreas() {
  if (!state.geo) return;
  state.parqueLayer.clearLayers();
  state.licLayer.clearLayers();
  state.zepaLayer.clearLayers();
  addProtectedLayer(state.parqueLayer, state.geo.parque, PROTECTED_STYLES.parque,
    p => protectedPopup('Parque Regional', p.nombre || 'Calnegre y Cabo Cope', null, p.Hectareas));
  addProtectedLayer(state.licLayer, state.geo.lic, PROTECTED_STYLES.lic,
    p => protectedPopup('LIC (Red Natura 2000)', p.SITE_NAME || 'LIC', p.SITE_CODE, p.HECTARES));
  addProtectedLayer(state.zepaLayer, state.geo.zepa, PROTECTED_STYLES.zepa,
    p => protectedPopup('ZEPA (Red Natura 2000)', p.site_name || 'ZEPA', p.site_code, p.hectares));
}

function habitatSpeciesSeenCount(habitat) {
  return (habitat.speciesIds || []).filter(id => state.seenSpecies.has(id)).length;
}

function isHabitatComplete(habitat) {
  const total = (habitat.speciesIds || []).length;
  return total > 0 && habitatSpeciesSeenCount(habitat) === total;
}

function bindHabitatPopup(layer, habitat) {
  const complete = isHabitatComplete(habitat);
  const seenCount = habitatSpeciesSeenCount(habitat);
  const total = (habitat.speciesIds || []).length;
  layer.bindPopup(
    '<strong>' + escapeHtml(habitat.name) + '</strong><br>'
    + '<span class="popup-type">' + escapeHtml(habitat.type || '') + (habitat.priority ? ' · prioritario UE' : '') + (habitat.code ? ' · cód. ' + escapeHtml(habitat.code) : '') + '</span>'
    + '<p>' + escapeHtml(habitat.description) + '</p>'
    + '<p class="habitat-progress-line">Especies vistas: <strong>' + seenCount + ' / ' + total + '</strong>' + (complete ? ' · ¡Hábitat completo! 🏅' : '') + '</p>'
    + '<button type="button" class="habitat-filter-btn" data-habitat="' + escapeHtml(habitat.id) + '">Ver especies de este hábitat</button>'
  );
  layer.on('popupopen', event => {
    const button = event.popup.getElement().querySelector('.habitat-filter-btn');
    if (button) button.addEventListener('click', () => focusHabitat(habitat.id));
  });
}

function renderHabitatZones() {
  state.habitatGroup.clearLayers();
  state.habitatLayers.clear();
  (state.data.habitats || []).forEach(habitat => {
    const complete = isHabitatComplete(habitat);
    const geom = state.geo && state.geo.habitatGeom ? state.geo.habitatGeom[habitat.id] : null;
    let layer;
    if (geom) {
      // Geometría real (polígono) servida desde Data/geo/habitats.geojson.
      layer = L.geoJSON(geom, {
        style: {
          color: complete ? '#d89b30' : (habitat.color || '#2f6f4e'),
          weight: complete ? 3 : 2,
          fillColor: habitat.color || '#2f6f4e',
          fillOpacity: 0.16
        }
      });
    } else if (habitat.coordinates) {
      // Sin polígono todavía: círculo aproximado en la posición representativa del hábitat.
      layer = L.circle(habitat.coordinates, {
        radius: 420,
        color: complete ? '#d89b30' : (habitat.color || '#2f6f4e'),
        weight: complete ? 3 : 2,
        fillColor: habitat.color || '#2f6f4e',
        fillOpacity: 0.16
      });
    } else {
      return;
    }
    bindHabitatPopup(layer, habitat);
    layer.addTo(state.habitatGroup);
    state.habitatLayers.set(habitat.id, layer);
  });
}

function focusHabitat(habitatId) {
  state.habitatFocus = habitatId;
  const habitat = state.data.habitats.find(h => h.id === habitatId);
  if (habitat) {
    habitatFilterLabel.textContent = 'Hábitat: ' + habitat.name;
    habitatFilterChip.hidden = false;
  }
  setView('catalog');
  renderSpeciesList();
}

function clearHabitatFocus() {
  state.habitatFocus = null;
  habitatFilterChip.hidden = true;
  renderSpeciesList();
}

function selectSpecies(id, focusMap = true) {
  state.selectedId = Number(id);
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
}

async function persistProgress(type, id, seen, coords) {
  try {
    const payload = { type, id, seen };
    if (coords) { payload.lat = coords.lat; payload.lng = coords.lng; }
    const response = await fetch(API_BASE + '/progress.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('progress endpoint unavailable');
    state.progressReady = true;
  } catch (error) {
    console.info('No se pudo guardar el progreso en el backend; se mantiene solo en esta sesión.', error);
  }
}

function afterSeenChange() {
  renderSpeciesList();
  renderDetail();
  renderMarkers();
  renderHabitatZones();
  renderProgress();
  if (state.view === 'progress') renderProgressTab();
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

function computeProgress() {
  const species = state.data.species || [];
  const habitats = state.data.habitats || [];
  const pois = state.data.pointsOfInterest || [];
  const speciesTotal = species.length;
  const speciesSeen = state.seenSpecies.size;
  const habitatProgress = habitats.map(h => {
    const total = (h.speciesIds || []).length;
    const seen = habitatSpeciesSeenCount(h);
    return { id: h.id, name: h.name, code: h.code, color: h.color, total, seen, complete: total > 0 && seen === total };
  });
  const poisTotal = pois.length;
  const poisSeen = pois.filter(p => state.seenPois.has(p.id)).length;
  const habitatsComplete = habitatProgress.length > 0 && habitatProgress.every(h => h.complete);
  const poisComplete = poisTotal > 0 && poisSeen === poisTotal;
  const parkComplete = habitatsComplete && poisComplete;
  return { speciesTotal, speciesSeen, habitatProgress, poisTotal, poisSeen, parkComplete };
}

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
}

function renderProgressTab() {
  const progress = computeProgress();
  const speciesPct = progress.speciesTotal ? Math.round((progress.speciesSeen / progress.speciesTotal) * 100) : 0;
  const poiPct = progress.poisTotal ? Math.round((progress.poisSeen / progress.poisTotal) * 100) : 0;

  const habitatsHtml = progress.habitatProgress.map(h => (
    '<li class="progress-row' + (h.complete ? ' complete' : '') + '">'
    + '<span class="progress-row-label"><span class="dot" style="background:' + (h.color || '#2f6f4e') + '"></span>' + escapeHtml(h.name) + '</span>'
    + '<span class="progress-row-value">' + h.seen + '/' + h.total + (h.complete ? ' ✓' : '') + '</span>'
    + '</li>'
  )).join('');

  const poisHtml = (state.data.pointsOfInterest || []).map(p => (
    '<li class="progress-row' + (state.seenPois.has(p.id) ? ' complete' : '') + '">'
    + '<span class="progress-row-label">' + escapeHtml(p.name) + '</span>'
    + '<span class="progress-row-value">' + (state.seenPois.has(p.id) ? 'Visitado ✓' : 'Pendiente') + '</span>'
    + '</li>'
  )).join('');

  const justUnlocked = progress.parkComplete && !state.parkWasComplete;
  state.parkWasComplete = progress.parkComplete;

  progressPanel.innerHTML =
    '<div class="progress-section">'
    + '<h3>Especies</h3>'
    + '<div class="progress-track big"><div class="progress-fill" style="width:' + speciesPct + '%"></div></div>'
    + '<span class="progress-caption">' + progress.speciesSeen + ' / ' + progress.speciesTotal + ' especies vistas</span>'
    + '</div>'
    + '<div class="progress-section">'
    + '<h3>Hábitats</h3>'
    + '<ul class="progress-list">' + habitatsHtml + '</ul>'
    + '</div>'
    + '<div class="progress-section">'
    + '<h3>Puntos de interés</h3>'
    + '<div class="progress-track big"><div class="progress-fill" style="width:' + poiPct + '%"></div></div>'
    + '<span class="progress-caption">' + progress.poisSeen + ' / ' + progress.poisTotal + ' puntos visitados</span>'
    + '<ul class="progress-list">' + poisHtml + '</ul>'
    + '</div>'
    + '<div class="achievement-card ' + (progress.parkComplete ? 'unlocked' : 'locked') + (justUnlocked ? ' just-unlocked' : '') + '">'
    + '<span class="achievement-icon">' + (progress.parkComplete ? '🏆' : '🔒') + '</span>'
    + '<div><strong>' + escapeHtml(ACHIEVEMENT_NAME) + '</strong>'
    + '<p>' + (progress.parkComplete
      ? 'Logro desbloqueado: has completado todos los hábitats y puntos de interés de Cabo Cope y Puntas de Calnegre.'
      : 'Completa todos los hábitats (viendo todas sus especies) y visita todos los puntos de interés para desbloquear este logro.')
    + '</p></div>'
    + '</div>';
}

speciesList.addEventListener('click', event => {
  const card = event.target.closest('.species-card');
  if (card) selectSpecies(card.dataset.id);
});

detailPanel.addEventListener('click', event => {
  const button = event.target.closest('[data-toggle-seen]');
  if (button) toggleSpeciesSeen(button.dataset.toggleSeen);
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

habitatFilterClear.addEventListener('click', clearHabitatFocus);

searchInput.addEventListener('input', event => {
  state.query = event.target.value;
  renderSpeciesList();
});

async function loadData() {
  const localResponse = await fetch('Data/cabo-cope.json');
  state.data = await localResponse.json();
  try {
    const apiResponse = await fetch(API_BASE + '/species.php?park=cabo-cope-puntas-calnegre');
    if (apiResponse.ok) {
      const apiData = await apiResponse.json();
      if (apiData?.species?.length) state.data = apiData;
    }
  } catch (error) {
    console.info('Using bundled Cabo Cope demo data.', error);
  }
}

async function loadGeoFile(path) {
  try {
    const r = await fetch(path);
    if (r.ok) return await r.json();
  } catch (error) {
    console.info('No se pudo cargar ' + path, error);
  }
  return null;
}

async function loadGeo() {
  // Geometría del mapa desde GeoJSON. Las zonas protegidas son geometría oficial (IMIDA/CARM);
  // los hábitats son opcionales (si no hay polígonos, se dibujan círculos aproximados).
  state.geo = { parque: null, lic: null, zepa: null, trails: null, habitatGeom: {} };
  const [parque, lic, zepa, trails, habitats] = await Promise.all([
    loadGeoFile('Data/geo/parque-regional.geojson'),
    loadGeoFile('Data/geo/lic.geojson'),
    loadGeoFile('Data/geo/zepa.geojson'),
    loadGeoFile('Data/geo/trails.geojson'),
    loadGeoFile('Data/geo/habitats.geojson')
  ]);
  state.geo.parque = parque;
  state.geo.lic = lic;
  state.geo.zepa = zepa;
  state.geo.trails = trails;
  if (habitats) {
    (habitats.features || []).forEach(f => {
      const slug = f.properties && f.properties.slug;
      const type = f.geometry && f.geometry.type;
      if (slug && (type === 'Polygon' || type === 'MultiPolygon')) {
        state.geo.habitatGeom[slug] = f.geometry;
      }
    });
  }
}

async function loadProgress() {
  try {
    const response = await fetch(API_BASE + '/progress.php');
    if (!response.ok) throw new Error('progress endpoint unavailable');
    const progress = await response.json();
    state.seenSpecies = new Set((progress.seenSpeciesIds || []).map(Number));
    state.seenPois = new Set(progress.seenPoiIds || []);
    state.sightings = new Map();
    const sightings = progress.sightings || {};
    Object.keys(sightings).forEach(key => {
      const s = sightings[key];
      if (s && typeof s.lat === 'number' && typeof s.lng === 'number') {
        state.sightings.set(Number(key), { lat: s.lat, lng: s.lng });
      }
    });
    state.progressReady = true;
  } catch (error) {
    console.info('Sin backend de progreso disponible; se registrará solo en esta sesión.', error);
  }
}

Promise.all([loadData(), loadProgress(), loadGeo()])
  .then(() => {
    state.selectedId = state.data.species[0]?.id ?? null;
    renderSummary();
    renderProtectedAreas();
    renderTrails();
    renderHabitatZones();
    renderMarkers();
    renderPoiMarkers();
    renderSpeciesList();
    renderDetail();
    state.parkWasComplete = computeProgress().parkComplete;
    map.setView(state.data.park.center, 12);
  })
  .catch(error => {
    detailPanel.innerHTML = '<div class="detail-body"><h2>No se pudieron cargar los datos</h2><p>Revisa que el archivo de datos o la API estén disponibles.</p></div>';
    console.error(error);
  });
