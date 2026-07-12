import {
  html, kingdomEmoji,
  placeholderImage, speciesImageSrc,
  habitatImageSrc, habitatPlaceholderImage,
  poiEmoji, poiImageSrc, haversineMeters
} from './util.js';
import {
  ACHIEVEMENT_NAME, DEFAULT_PARK_SLUG, PARK_INDEX_PATH,
  state, getFilteredSpecies, getFilteredHabitats,
  habitatSpeciesSeenCount, habitatAreaLabel, isHabitatComplete,
  computeProgress, speciesLatLng
} from './state.js';
import {
  resolveActivePark, loadManifest, loadData, loadGeo,
  loadProgress, persistProgress
} from './data.js';
import {
  speciesList, searchInput, resultCount, catalogControls, catalogPanel,
  catalogCrumb, catalogCrumbLabel, backToHabitatsBtn, catalogTitle,
  speciesFilterGroup, searchLabel,
  parkTitle, speciesCount, habitatCount, coastlineKm, parkSummary,
  progressTrack, progressFill, progressLabel,
  progressPanel, detailPanel,
  explorerToggle, nearbyPanel, nearbyStatus, nearbyList, nearbyClose,
  saveOfflineBtn, connStatus
} from './dom.js';

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
  // En pantallas estrechas (futura app móvil) el control arranca colapsado para no solapar con
  // el panel "Cerca de ti" del modo explorador, que también vive en la franja superior del mapa.
  { position: 'topright', collapsed: window.innerWidth <= 900 }
).addTo(map);

window.__imgFallback = function (imgEl, speciesId) {
  const species = state.data.species.find(item => item.id === Number(speciesId));
  if (!species || !imgEl) return;
  imgEl.onerror = null;
  imgEl.src = placeholderImage(species);
};

window.__habitatImgFallback = function (imgEl, habitatId) {
  const habitat = (state.data.habitats || []).find(item => item.id === habitatId);
  if (!habitat || !imgEl) return;
  imgEl.onerror = null;
  imgEl.src = habitatPlaceholderImage(habitat);
};

function renderHabitatCatalog() {
  const habitats = getFilteredHabitats();
  resultCount.textContent = habitats.length === 1 ? '1 hábitat' : habitats.length + ' hábitats';
  const cards = habitats.map(h => {
    const total = (h.speciesIds || []).length;
    const seen = habitatSpeciesSeenCount(h);
    const complete = isHabitatComplete(h);
    return html`<button class="habitat-card${complete ? ' complete' : ''}" type="button" data-habitat="${h.id}"><span class="habitat-card-dot" style="background:${h.color || '#2f6f4e'}"></span><span class="habitat-card-body"><span class="habitat-card-meta"><span class="badge habitat-code">${h.code || ''}</span>${h.priority ? html`<span class="badge alert">prioritario UE</span>` : ''}${h.reviewNote ? html`<span class="badge review">a revisar</span>` : ''}</span><strong>${h.name}</strong><span class="habitat-card-count">${seen} / ${total} especies vistas${complete && total > 0 ? ' · completo 🏅' : ''}</span></span></button>`;
  });
  speciesList.innerHTML = html`<button class="habitat-all-link" type="button" id="viewAllSpeciesBtn">Ver todas las especies (${state.data.species.length})</button>${cards}`;
}

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

function renderCatalogBody() {
  const inSpeciesMode = state.catalogMode === 'species';
  speciesFilterGroup.hidden = !inSpeciesMode;
  searchLabel.textContent = inSpeciesMode ? 'Buscar especie' : 'Buscar hábitat';
  searchInput.placeholder = inSpeciesMode ? 'Nombre común o científico' : 'Nombre o código de hábitat';
  catalogCrumb.hidden = !inSpeciesMode;
  if (inSpeciesMode) {
    const habitat = state.habitatFocus ? state.data.habitats.find(h => h.id === state.habitatFocus) : null;
    catalogCrumbLabel.textContent = habitat ? habitat.name : 'Todas las especies';
    catalogTitle.textContent = habitat ? habitat.name : 'Todas las especies';
    renderSpeciesList();
  } else {
    catalogTitle.textContent = 'Hábitats';
    renderHabitatCatalog();
  }
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
  const cards = species.map(item => {
    const seen = state.seenSpecies.has(item.id);
    return html`<button class="species-card ${item.id === state.selectedId ? 'active' : ''}${seen ? ' seen' : ''}" type="button" data-id="${item.id}"><span class="card-thumb"><img src="${speciesImageSrc(item)}" alt="${item.commonName}" loading="lazy" onerror="window.__imgFallback(this,${item.id})">${seen ? html`<span class="seen-badge" title="Visto">✓</span>` : ''}</span><span><span class="card-meta"><span class="badge ${item.kingdom}">${item.kingdom}</span>${item.featured ? html`<span class="badge alert">prioritaria</span>` : ''}${item.reviewNote ? html`<span class="badge review">a revisar</span>` : ''}</span><h3>${item.commonName}</h3><em>${item.scientificName}</em></span></button>`;
  });
  speciesList.innerHTML = html`${cards}`;
}

function renderTaxonomyRow(label, value) {
  if (!value) return '';
  return html`<div><span>${label}</span><strong>${value}</strong></div>`;
}

// El panel de detalle de la derecha muestra o bien la etiqueta de una especie o bien la de un
// hábitat, según qué haya seleccionado el usuario (`detailMode`).
function renderDetail() {
  if (state.detailMode === 'habitat') { renderHabitatDetail(); return; }
  renderSpeciesDetail();
}

function renderHabitatDetail() {
  const habitat = (state.data.habitats || []).find(item => item.id === state.selectedHabitatId)
    ?? (state.data.habitats || [])[0];
  if (!habitat) { detailPanel.innerHTML = ''; return; }
  const total = (habitat.speciesIds || []).length;
  const seen = habitatSpeciesSeenCount(habitat);
  const complete = isHabitatComplete(habitat);
  const pct = total ? Math.round((seen / total) * 100) : 0;
  const area = habitatAreaLabel(habitat);
  const chips = (habitat.speciesIds || []).map(id => {
    const s = (state.data.species || []).find(item => item.id === id);
    if (!s) return '';
    const wasSeen = state.seenSpecies.has(s.id);
    return html`<button type="button" class="habitat-species-chip${wasSeen ? ' seen' : ''}" data-species-chip="${s.id}"><span>${kingdomEmoji(s)}</span>${s.commonName}${wasSeen ? ' ✓' : ''}</button>`;
  });
  detailPanel.innerHTML = html`<div class="detail-image-wrap habitat-detail-image">
    <img src="${habitatImageSrc(habitat)}" alt="${habitat.name}" onerror="window.__habitatImgFallback(this,'${habitat.id}')">
    <span class="habitat-detail-kind">Hábitat</span>
    </div>
    <div class="detail-body">
    <span class="card-meta">
    <span class="badge habitat-code">${habitat.code || ''}</span>
    <span class="badge">${habitat.type || ''}</span>
    ${habitat.priority ? html`<span class="badge alert">prioritario UE</span>` : ''}
    ${habitat.reviewNote ? html`<span class="badge review">a revisar</span>` : ''}
    ${complete && total > 0 ? html`<span class="badge">completo 🏅</span>` : ''}
    </span>
    <h2>${habitat.name}</h2>
    <p>${habitat.description}</p>
    <div class="detail-facts">
    <div><span>Código Natura 2000</span><strong>${habitat.code || '—'}</strong></div>
    <div><span>Superficie en el parque</span><strong>${area || 'Sin cartografiar'}</strong></div>
    </div>
    <div class="habitat-detail-progress">
    <div class="progress-track big"><div class="progress-fill" style="width:${pct}%"></div></div>
    <span class="progress-caption">${seen} / ${total} especies vistas en este hábitat</span>
    </div>
    ${total > 0 ? html`<h3 class="detail-subtitle">Especies de este hábitat</h3><div class="habitat-species-chips">${chips}</div>` : ''}
    ${habitat.reviewNote ? html`<div class="review-note"><strong>Pendiente de revisión:</strong> ${habitat.reviewNote}</div>` : ''}
    <button class="seen-toggle" type="button" data-view-habitat-species="${habitat.id}">Ver ${total === 1 ? 'la especie' : 'las ' + total + ' especies'} en el catálogo</button>
    </div>`;
}

function renderSpeciesDetail() {
  const species = state.data.species.find(item => item.id === state.selectedId) ?? state.data.species[0];
  if (!species) { detailPanel.innerHTML = ''; return; }
  const seen = state.seenSpecies.has(species.id);
  const tx = species.taxonomy || {};
  const stars = '★'.repeat(species.rarityScore) + '☆'.repeat(5 - species.rarityScore);
  detailPanel.innerHTML = html`<div class="detail-image-wrap">
    <img src="${speciesImageSrc(species)}" alt="${species.commonName}" onerror="window.__imgFallback(this,${species.id})">
    </div>
    <div class="detail-body">
    <span class="card-meta"><span class="badge ${species.kingdom}">${species.kingdom}</span>
    <span class="badge alert">${species.conservationStatus}</span>
    ${species.reviewNote ? html`<span class="badge review">a revisar</span>` : ''}
    </span>
    <h2>${species.commonName}</h2><em>${species.scientificName}</em>
    <p>${species.description}</p>
    <ul class="detail-list">${species.tips.map(tip => html`<li>${tip}</li>`)}</ul>
    <div class="detail-facts">
    <div><span>Hábitat</span><strong>${species.habitat}</strong></div>
    <div><span>Temporada</span><strong>${species.seasonality}</strong></div>
    <div><span>Grupo</span><strong>${species.group}</strong></div>
    <div><span>Rareza</span><strong>${stars}</strong></div>
    </div>
    <h3 class="detail-subtitle">Taxonomía</h3>
    <div class="detail-facts detail-taxonomy">
    ${renderTaxonomyRow('Reino', tx.kingdom)}
    ${renderTaxonomyRow('Filo/División', tx.phylum)}
    ${renderTaxonomyRow('Clase', tx.class)}
    ${renderTaxonomyRow('Orden', tx.order)}
    ${renderTaxonomyRow('Familia', tx.family)}
    ${renderTaxonomyRow('Género', tx.genus)}
    </div>
    <h3 class="detail-subtitle">Estado de conservación</h3>
    <ul class="status-list">
    <li><span>UICN (global)</span>${species.iucnGlobal || 'No evaluada'}</li>
    <li><span>España</span>${species.spainStatus || 'Sin dato'}</li>
    <li><span>Región de Murcia</span>${species.murciaStatus || 'Sin dato'}</li>
    </ul>
    ${species.reviewNote ? html`<div class="review-note"><strong>Pendiente de revisión:</strong> ${species.reviewNote}</div>` : ''}
    ${species.source ? html`<p class="detail-source">Fuente: ${species.source}</p>` : ''}
    <button class="seen-toggle ${seen ? 'is-seen' : ''}" type="button" data-toggle-seen="${species.id}">${seen ? '✓ Visto' : 'Marcar como visto'}</button>
    </div>`;
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

// El icono por tipo de POI (poiEmoji) y las imágenes-placeholder viven en util.js.
function poiDivIcon(poi, seen) {
  return L.divIcon({
    className: 'poi-marker' + (seen ? ' seen' : ''),
    html: '<span>' + poiEmoji(poi) + '</span>',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -13]
  });
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
      String(html`<strong>${species.commonName}</strong><br>${species.scientificName}<br><small>${fromGps ? '📍 Ubicación registrada por GPS' : '📍 Ubicación aproximada (sin GPS)'}</small>`)
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
    const marker = L.marker(poi.coordinates, { icon: poiDivIcon(poi, seen) }).addTo(state.poiGroup);
    marker.bindPopup(
      String(html`<div class="poi-popup-image"><img src="${poiImageSrc(poi)}" alt="${poi.name}" loading="lazy"></div><strong>${poi.name}</strong><br><span class="popup-type">${poi.type}</span>${poi.approx ? html`<span class="badge review poi-approx-badge">ubicación aproximada</span>` : ''}<p>${poi.description}</p>${poi.source ? html`<p class="detail-source">Fuente: ${poi.source}</p>` : ''}<button type="button" class="poi-seen-btn" data-poi="${poi.id}">${seen ? '✓ Visitado' : 'Marcar como visitado'}</button>`),
      { maxWidth: 260 }
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

function renderTrails() {
  if (!state.geo || !state.trailLayer) return;
  state.trailLayer.clearLayers();
  if (!state.geo.trails) return;
  L.geoJSON(state.geo.trails, {
    style: { color: '#c0662a', weight: 3, opacity: 0.9, lineJoin: 'round', lineCap: 'round' },
    onEachFeature: (feature, layer) => {
      const p = feature.properties || {};
      layer.bindPopup(
        String(html`<strong>${p.name || 'Sendero'}</strong><br><span class="popup-type">${p.tipo || ''}</span>${p.descripcion ? html`<p>${p.descripcion}</p>` : ''}${p.source ? html`<small>${p.source}</small>` : ''}`)
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
      // Geometría real (polígono) servida desde el habitats.geojson del parque (ver manifiesto).
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
  // Entrada al catálogo de especies de un hábitat desde su popup en el mapa.
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
}

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
}

function renderProgressTab() {
  const progress = computeProgress();
  const speciesPct = progress.speciesTotal ? Math.round((progress.speciesSeen / progress.speciesTotal) * 100) : 0;
  const poiPct = progress.poisTotal ? Math.round((progress.poisSeen / progress.poisTotal) * 100) : 0;

  const habitatsHtml = progress.habitatProgress.map(h =>
    html`<li class="progress-row${h.complete ? ' complete' : ''}"><span class="progress-row-label"><span class="dot" style="background:${h.color || '#2f6f4e'}"></span>${h.name}</span><span class="progress-row-value">${h.seen}/${h.total}${h.complete ? ' ✓' : ''}</span></li>`);

  const poisHtml = (state.data.pointsOfInterest || []).map(p =>
    html`<li class="progress-row${state.seenPois.has(p.id) ? ' complete' : ''}"><span class="progress-row-label">${p.name}</span><span class="progress-row-value">${state.seenPois.has(p.id) ? 'Visitado ✓' : 'Pendiente'}</span></li>`);

  const justUnlocked = progress.parkComplete && !state.parkWasComplete;
  state.parkWasComplete = progress.parkComplete;

  progressPanel.innerHTML = html`<div class="progress-section"><h3>Especies</h3><div class="progress-track big"><div class="progress-fill" style="width:${speciesPct}%"></div></div><span class="progress-caption">${progress.speciesSeen} / ${progress.speciesTotal} especies vistas</span></div><div class="progress-section"><h3>Hábitats</h3><ul class="progress-list">${habitatsHtml}</ul></div><div class="progress-section"><h3>Puntos de interés</h3><div class="progress-track big"><div class="progress-fill" style="width:${poiPct}%"></div></div><span class="progress-caption">${progress.poisSeen} / ${progress.poisTotal} puntos visitados</span><ul class="progress-list">${poisHtml}</ul></div><div class="achievement-card ${progress.parkComplete ? 'unlocked' : 'locked'}${justUnlocked ? ' just-unlocked' : ''}"><span class="achievement-icon">${progress.parkComplete ? '🏆' : '🔒'}</span><div><strong>${ACHIEVEMENT_NAME}</strong><p>${progress.parkComplete
      ? 'Logro desbloqueado: has completado todos los hábitats y puntos de interés de Cabo Cope y Puntas de Calnegre.'
      : 'Completa todos los hábitats (viendo todas sus especies) y visita todos los puntos de interés para desbloquear este logro.'}</p></div></div>`;
}

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

function userDivIcon() {
  return L.divIcon({ className: 'user-marker', html: '<span></span>', iconSize: [18, 18], iconAnchor: [9, 9] });
}

function placeUserMarker(lat, lng, accuracy) {
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

searchInput.addEventListener('input', event => {
  state.query = event.target.value;
  if (state.catalogMode === 'species') renderSpeciesList(); else renderHabitatCatalog();
});

// --- Carga por parque: registro (por provincia) -> manifiesto -> datos/geo -----------------------
// Todo pasa por NaturDexOffline.fetchJsonCached, que cachea cada JSON en el dispositivo: con visitar
// un parque online una vez, sus datos y mapas vectoriales quedan disponibles sin conexión (la
// lógica vive en data.js).

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
  // Leaflet cachea el tamaño del contenedor al crearse; si el layout aún no estaba listo (0 de alto),
  // el mapa no dibuja capas ni teselas. Forzamos que recalcule cuando el DOM ya está estable/visible.
  ensureMapSized();

  if (!parkExperienceInited) { initOfflineUI(); parkExperienceInited = true; }
}
window.startParkExperience = startParkExperience;

function ensureMapSized() {
  const invalidate = () => map.invalidateSize(false);
  invalidate();
  requestAnimationFrame(invalidate);
  setTimeout(invalidate, 200);
  setTimeout(invalidate, 600);
}
window.naturdexInvalidateMap = ensureMapSized; // auth.js lo llama al mostrar la pantalla del parque

window.addEventListener('resize', () => map.invalidateSize(false));
// Si el contenedor del mapa cambia de tamaño (paneles que aparecen/desaparecen, rotación en móvil),
// recalculamos automáticamente. ResizeObserver no está en navegadores muy antiguos: es opcional.
if (typeof ResizeObserver !== 'undefined') {
  const mapEl = document.getElementById('map');
  if (mapEl) new ResizeObserver(() => map.invalidateSize(false)).observe(mapEl);
}
