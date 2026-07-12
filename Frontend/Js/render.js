// ================================================================================================
// render.js — pintado del DOM: catálogo, fichas de detalle, resumen y pestaña de progreso.
// ------------------------------------------------------------------------------------------------
// Módulo ES importado por app.js. Lee el estado (state.js) y escribe en los nodos (dom.js) usando
// siempre la plantilla html`` de util.js (escapado automático, anti-XSS). No registra eventos de
// usuario: la delegación de clicks y la lógica de navegación siguen en app.js, que llama a estas
// funciones cuando el estado cambia.
// ================================================================================================

import {
  html, kingdomEmoji, placeholderImage, speciesImageSrc,
  habitatImageSrc, habitatPlaceholderImage
} from './util.js';
import {
  ACHIEVEMENT_NAME, state, getFilteredSpecies, getFilteredHabitats,
  habitatSpeciesSeenCount, habitatAreaLabel, isHabitatComplete, computeProgress
} from './state.js';
import {
  speciesList, detailPanel, searchInput, resultCount,
  speciesCount, habitatCount, coastlineKm, parkSummary,
  progressTrack, progressFill, progressLabel,
  catalogCrumb, catalogCrumbLabel, catalogTitle,
  speciesFilterGroup, searchLabel, progressPanel
} from './dom.js';

// Fallbacks de imagen usados por el HTML generado (onerror inline): forman parte de la API global
// que el render publica en window (documentado también en app.js).
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

// --- Catálogo ---------------------------------------------------------------------------------------
export function renderHabitatCatalog() {
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

export function renderSpeciesList() {
  const species = getFilteredSpecies();
  resultCount.textContent = species.length === 1 ? '1 resultado' : species.length + ' resultados';
  const cards = species.map(item => {
    const seen = state.seenSpecies.has(item.id);
    return html`<button class="species-card ${item.id === state.selectedId ? 'active' : ''}${seen ? ' seen' : ''}" type="button" data-id="${item.id}"><span class="card-thumb"><img src="${speciesImageSrc(item)}" alt="${item.commonName}" loading="lazy" onerror="window.__imgFallback(this,${item.id})">${seen ? html`<span class="seen-badge" title="Visto">✓</span>` : ''}</span><span><span class="card-meta"><span class="badge ${item.kingdom}">${item.kingdom}</span>${item.featured ? html`<span class="badge alert">prioritaria</span>` : ''}${item.reviewNote ? html`<span class="badge review">a revisar</span>` : ''}</span><h3>${item.commonName}</h3><em>${item.scientificName}</em></span></button>`;
  });
  speciesList.innerHTML = html`${cards}`;
}

export function renderCatalogBody() {
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

// --- Cabecera del parque (resumen + barra de progreso) -----------------------------------------------
export function renderSummary() {
  speciesCount.textContent = state.data.species.length;
  habitatCount.textContent = state.data.habitats.length;
  coastlineKm.textContent = state.data.park.coastlineKm + ' km';
  parkSummary.textContent = state.data.park.summary;
  renderProgress();
}

export function renderProgress() {
  if (!progressTrack) return;
  const total = state.data.species.length;
  const seen = state.seenSpecies.size;
  const pct = total ? Math.round((seen / total) * 100) : 0;
  progressFill.style.width = pct + '%';
  progressLabel.textContent = seen + ' / ' + total + ' especies descubiertas';
}

// --- Panel de detalle (ficha de especie o de hábitat) ------------------------------------------------
function renderTaxonomyRow(label, value) {
  if (!value) return '';
  return html`<div><span>${label}</span><strong>${value}</strong></div>`;
}

// El panel de detalle de la derecha muestra o bien la etiqueta de una especie o bien la de un
// hábitat, según qué haya seleccionado el usuario (`detailMode`).
export function renderDetail() {
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

// --- Pestaña de progreso ------------------------------------------------------------------------------
export function renderProgressTab() {
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
