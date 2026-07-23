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
  habitatImageSrc, habitatPlaceholderImage, icon
} from './util.js';
import { audioBlock } from './audio.js';
import { highlightGlossary } from './glossary.js';
import {
  ACHIEVEMENT_NAME, state, getFilteredSpecies, getFilteredHabitats,
  habitatSpeciesSeenCount, habitatAreaLabel, isHabitatComplete, computeProgress
} from './state.js';
import {
  speciesList, detailPanel, searchInput, resultCount,
  speciesCount, habitatCount, coastlineKm, parkSummary,
  progressTrack, progressFill, progressLabel,
  catalogCrumb, catalogCrumbLabel, catalogTitle,
  speciesFilterGroup, searchLabel, progressPanel, invasorasPanel
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

// Foto de invasora rota (p. ej. sin conexión o URL de GBIF caída) → se sustituye por el emoji del grupo.
window.__invImgFallback = function (imgEl) {
  if (!imgEl) return;
  imgEl.onerror = null;
  const span = document.createElement('span');
  span.className = 'invasora-hero-emoji';
  span.setAttribute('aria-hidden', 'true');
  span.textContent = imgEl.dataset.emoji || '🌿';
  imgEl.replaceWith(span);
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
    return html`<button class="species-card ${item.id === state.selectedId ? 'active' : ''}${seen ? ' seen' : ''}" type="button" data-id="${item.id}"${item.id === state.selectedId ? html` aria-current="true"` : ''}><span class="card-thumb"><img src="${speciesImageSrc(item)}" alt="" loading="lazy" onerror="window.__imgFallback(this,${item.id})">${seen ? html`<span class="seen-badge" aria-hidden="true">${icon('check', 12)}</span>` : ''}</span><span><span class="card-meta"><span class="badge ${item.kingdom}">${item.kingdom}</span>${item.zepaSiteCode ? html`<span class="badge migratoria">🕊️ migratoria</span>` : ''}${item.featured ? html`<span class="badge alert">prioritaria</span>` : ''}${item.reviewNote ? html`<span class="badge review">a revisar</span>` : ''}</span><h3>${item.commonName}</h3><em>${item.scientificName}</em>${seen ? html`<span class="sr-only">Especie vista.</span>` : ''}</span></button>`;
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
    const label = habitat ? habitat.name : 'Todas las especies';
    catalogCrumbLabel.textContent = label;
    catalogTitle.textContent = label;
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
  progressTrack.setAttribute('aria-valuenow', String(pct));
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
  if (state.detailMode === 'invasora') { renderInvasoraDetail(); return; } // ya resalta el glosario dentro
  if (state.detailMode === 'habitat') renderHabitatDetail();
  else renderSpeciesDetail();
  // Resalta los términos del glosario en las descripciones ya pintadas (no-op si aún no cargó).
  highlightGlossary(detailPanel);
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
    return html`<button type="button" class="habitat-species-chip${wasSeen ? ' seen' : ''}" data-species-chip="${s.id}"><span aria-hidden="true">${kingdomEmoji(s)}</span>${s.commonName}${wasSeen ? html` <span aria-hidden="true">✓</span><span class="sr-only">(vista)</span>` : ''}</button>`;
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
    <p class="detail-prose">${habitat.description}</p>
    ${audioBlock(habitat, 'Audioguía del hábitat')}
    <div class="detail-facts">
    <div><span>Código Natura 2000</span><strong>${habitat.code || '—'}</strong></div>
    ${habitat.hicSubtipos && habitat.hicSubtipos.length > 1 ? html`<div><span>Subtipos HIC</span><strong>${habitat.hicSubtipos.join(', ')}</strong></div>` : ''}
    <div><span>Superficie en el parque</span><strong>${area || 'Sin cartografiar'}</strong></div>
    </div>
    ${habitat.fitosociologia && habitat.fitosociologia.length ? html`<h3 class="detail-subtitle">Asociación fitosociológica</h3><ul class="detail-list">${habitat.fitosociologia.map(a => html`<li><em>${a}</em></li>`)}</ul><p class="detail-source">Fuente: Cartografía de Hábitats, Directiva 92/43/CEE (MITECO)</p>` : ''}
    <div class="habitat-detail-progress">
    <div class="progress-track big" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" aria-label="Especies vistas en este hábitat"><div class="progress-fill" style="width:${pct}%"></div></div>
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
    ${species.zepaSiteCode ? html`<span class="badge migratoria">🕊️ Ave migratoria</span>` : ''}
    ${species.reviewNote ? html`<span class="badge review">a revisar</span>` : ''}
    </span>
    <h2>${species.commonName}</h2><em>${species.scientificName}</em>
    <p class="detail-prose">${species.description}</p>
    <ul class="detail-list">${species.tips.map(tip => html`<li>${tip}</li>`)}</ul>
    <div class="detail-facts">
    <div><span>Hábitat</span><strong>${species.habitat}</strong></div>
    <div><span>Temporada</span><strong>${species.seasonality}</strong></div>
    <div><span>Grupo</span><strong>${species.group}</strong></div>
    <div><span>Rareza</span><strong><span role="img" aria-label="${species.rarityScore} de 5">${stars}</span></strong></div>
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
    <li class="detail-prose"><span>UICN (global)</span>${species.iucnGlobal || 'No evaluada'}</li>
    <li class="detail-prose"><span>España</span>${species.spainStatus || 'Sin dato'}</li>
    <li class="detail-prose"><span>Región de Murcia</span>${species.murciaStatus || 'Sin dato'}</li>
    </ul>
    ${species.reviewNote ? html`<div class="review-note"><strong>Pendiente de revisión:</strong> ${species.reviewNote}</div>` : ''}
    ${species.source ? html`<p class="detail-source">Fuente: ${species.source}</p>` : ''}
    <button class="seen-toggle ${seen ? 'is-seen' : ''}" type="button" data-toggle-seen="${species.id}" aria-pressed="${seen ? 'true' : 'false'}">${seen ? '✓ Visto' : 'Marcar como visto'}</button>
    </div>`;
}

// --- Pestaña de invasoras -----------------------------------------------------------------------------
function invasoraEmoji(group) {
  const g = (group || '').toLowerCase();
  if (g.includes('ave')) return '🐦';
  if (g.includes('mamíf') || g.includes('mamif')) return '🦔';
  if (g.includes('invertebrad') || g.includes('molusc') || g.includes('artróp')) return '🐛';
  if (g.includes('reptil') || g.includes('anfib')) return '🦎';
  if (g.includes('pez') || g.includes('peces')) return '🐟';
  return '🌿';
}

// Lista de invasoras del parque (filtradas por la CCAA de la región).
function invasorasForPark() {
  const region = state.data.park && state.data.park.region;
  return (state.data.invasoras || []).filter(i => !region || i.ccaa === region);
}

export function renderInvasoras() {
  if (!invasorasPanel) return;
  const region = state.data.park && state.data.park.region;
  const list = invasorasForPark();
  // Tarjetas compactas y clicables (como las de especies); la ficha completa se abre a la derecha.
  const cards = list.map(i => html`<button class="species-card invasora-card${i.scientificName === state.selectedInvasora ? ' active' : ''}" type="button" data-invasora="${i.scientificName}"${i.scientificName === state.selectedInvasora ? html` aria-current="true"` : ''}><span class="card-thumb invasora-thumb" aria-hidden="true">${invasoraEmoji(i.group)}</span><span><span class="card-meta"><span class="badge alert">Invasora</span><span class="badge">${i.group || ''}</span></span><h3>${i.commonName || i.scientificName}</h3><em>${i.scientificName}</em></span></button>`);
  const intro = list.length
    ? html`<p class="invasoras-intro">Especies exóticas <strong>invasoras</strong> registradas en ${region || 'esta zona'} (Catálogo Español de EEI, RD 630/2013). No son parte de la fauna y flora del parque: apréndelas a reconocer y <strong>no las plantes, transportes ni sueltes</strong> en el medio natural. Pulsa una para ver su ficha.</p>`
    : html`<p class="invasoras-intro">No hay invasoras catalogadas para esta zona todavía.</p>`;
  invasorasPanel.innerHTML = html`<div class="section-title"><h2>Especies invasoras</h2><span role="status">${list.length}</span></div>${intro}<div class="species-list">${cards}</div>`;
}

function renderInvasoraDetail() {
  const list = invasorasForPark();
  const inv = list.find(i => i.scientificName === state.selectedInvasora) ?? list[0];
  if (!inv) { detailPanel.innerHTML = ''; return; }
  const emoji = invasoraEmoji(inv.group);
  const hasPhoto = inv.image && /^https?:/.test(inv.image);
  detailPanel.innerHTML = html`<div class="detail-image-wrap invasora-detail-hero">
    ${hasPhoto
      ? html`<img src="${inv.image}" alt="${inv.commonName || inv.scientificName}" data-emoji="${emoji}" onerror="window.__invImgFallback(this)">`
      : html`<span class="invasora-hero-emoji" aria-hidden="true">${emoji}</span>`}
    <span class="habitat-detail-kind">Invasora</span>
    </div>
    <div class="detail-body">
    <span class="card-meta"><span class="badge alert">Especie invasora</span><span class="badge">${inv.group || ''}</span></span>
    <h2>${inv.commonName || inv.scientificName}</h2><em>${inv.scientificName}</em>
    <p class="detail-prose">${inv.description || ''}</p>
    <h3 class="detail-subtitle">Ficha</h3>
    <ul class="status-list">
    ${inv.origin ? html`<li class="detail-prose"><span>Origen</span>${inv.origin}</li>` : ''}
    ${inv.habitat ? html`<li class="detail-prose"><span>Hábitat</span>${inv.habitat}</li>` : ''}
    <li><span>Grupo</span>${inv.group || 'Sin dato'}</li>
    <li><span>Catálogo oficial</span>${inv.catalogo || 'Catálogo Español de EEI (RD 630/2013)'}</li>
    <li><span>Presencia en ${inv.ccaa || 'la zona'}</span>${inv.gbifOccurrences ? inv.gbifOccurrences + ' registros (GBIF)' : 'Registrada'}</li>
    </ul>
    ${hasPhoto && inv.imageAttribution ? html`<p class="detail-source">Foto: ${inv.imageAttribution}</p>` : ''}
    ${inv.source ? html`<p class="detail-source">Fuente: ${inv.source}</p>` : ''}
    </div>`;
  highlightGlossary(detailPanel);
}

// --- Pestaña de progreso ------------------------------------------------------------------------------
// Tarjeta de logro reutilizable (bloqueado/desbloqueado). `justUnlocked` anima el que se acaba de ganar.
function achievementCard(name, unlocked, desc, justUnlocked) {
  return html`<div class="achievement-card ${unlocked ? 'unlocked' : 'locked'}${justUnlocked ? ' just-unlocked' : ''}"><span class="achievement-icon" aria-hidden="true">${unlocked ? icon('trophy', 22) : icon('lock', 22)}</span><div><strong>${name}</strong><p>${desc}</p></div></div>`;
}

export function renderProgressTab() {
  const progress = computeProgress();
  const speciesPct = progress.speciesTotal ? Math.round((progress.speciesSeen / progress.speciesTotal) * 100) : 0;
  const poiPct = progress.poisTotal ? Math.round((progress.poisSeen / progress.poisTotal) * 100) : 0;
  const nHab = progress.habitatProgress.length;

  // Hábitats subdivididos: cada uno es un mini-logro con su propia barra; al verlos todos, medalla.
  const habitatsHtml = progress.habitatProgress.map(h => {
    const pct = h.total ? Math.round((h.seen / h.total) * 100) : 0;
    return html`<li class="progress-row habitat-goal${h.complete ? ' complete' : ''}"><span class="progress-row-label"><span class="dot" style="background:${h.color || '#2f6f4e'}"></span>${h.name}</span><span class="habitat-goal-bar"><span class="progress-track"><span class="progress-fill" style="width:${pct}%"></span></span></span><span class="progress-row-value">${h.seen}/${h.total}${h.complete ? ' 🏅' : ''}</span></li>`;
  });

  const poisHtml = (state.data.pointsOfInterest || []).map(p =>
    html`<li class="progress-row${state.seenPois.has(p.id) ? ' complete' : ''}"><span class="progress-row-label">${p.name}</span><span class="progress-row-value">${state.seenPois.has(p.id) ? 'Visitado ✓' : 'Pendiente'}</span></li>`);

  const justUnlocked = progress.parkComplete && !state.parkWasComplete;
  state.parkWasComplete = progress.parkComplete;

  // Logros temáticos: colección de hábitats, colección de aves de la ZEPA y el logro grande del parque.
  const habitatsAllComplete = nHab > 0 && progress.habitatsCompleteCount === nHab;
  const zepaAllSeen = progress.zepaTotal > 0 && progress.zepaSeen === progress.zepaTotal;
  const logros = [
    achievementCard('Explorador de hábitats', habitatsAllComplete,
      habitatsAllComplete ? 'Has completado todos los hábitats del parque.' : `Completa los ${nHab} hábitats viendo todas sus especies (${progress.habitatsCompleteCount}/${nHab}).`, false),
    progress.zepaTotal > 0 ? achievementCard('Gran observador de aves', zepaAllSeen,
      zepaAllSeen ? '¡Lista completa! Has avistado las ' + progress.zepaTotal + ' aves migratorias de este espacio protegido (ZEPA, Red Natura 2000).' : `Completa tu lista de avistamientos de las aves migratorias del parque (${progress.zepaSeen}/${progress.zepaTotal}).`, false) : '',
    achievementCard(ACHIEVEMENT_NAME, progress.parkComplete,
      progress.parkComplete ? 'Logro desbloqueado: has completado todos los hábitats y puntos de interés de Cabo Cope y Puntas de Calnegre.'
        : 'Completa todos los hábitats y visita todos los puntos de interés para desbloquear el logro final.', justUnlocked),
  ];

  const zepaPct = progress.zepaTotal ? Math.round((progress.zepaSeen / progress.zepaTotal) * 100) : 0;
  const zepaSection = progress.zepaTotal > 0
    ? html`<div class="progress-section"><h3>🕊️ Aves migratorias</h3><div class="progress-track big" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${zepaPct}" aria-label="Aves migratorias avistadas"><div class="progress-fill" style="width:${zepaPct}%"></div></div><span class="progress-caption">${progress.zepaSeen} / ${progress.zepaTotal} aves migratorias avistadas · tu lista de la ZEPA (Red Natura 2000)</span></div>`
    : '';

  progressPanel.innerHTML = html`<div class="progress-section"><h3>Especies</h3><div class="progress-track big" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${speciesPct}" aria-label="Especies vistas"><div class="progress-fill" style="width:${speciesPct}%"></div></div><span class="progress-caption">${progress.speciesSeen} / ${progress.speciesTotal} especies vistas</span></div><div class="progress-section"><h3>Hábitats</h3><span class="progress-caption">${progress.habitatsCompleteCount} / ${nHab} hábitats completados 🏅</span><ul class="progress-list">${habitatsHtml}</ul></div>${zepaSection}<div class="progress-section"><h3>Puntos de interés</h3><div class="progress-track big" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${poiPct}" aria-label="Puntos de interés visitados"><div class="progress-fill" style="width:${poiPct}%"></div></div><span class="progress-caption">${progress.poisSeen} / ${progress.poisTotal} puntos visitados</span><ul class="progress-list">${poisHtml}</ul></div><div class="progress-section"><h3>Logros</h3>${logros}</div>`;
}
