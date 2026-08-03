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
  habitatImageSrc, habitatPlaceholderImage, icon,
  invasoraEmoji, invasoraImageSrc, invasoraPlaceholderImage,
  poiImageSrc, poiPlaceholderImage
} from './util.js';
import { audioBlock } from './audio.js';
import { highlightGlossary } from './glossary.js';
import { isInvasiveSeenLocally, loadAchievementsCatalog, refreshAccountProgress } from './achievements.js';
import { isMarkVerifiedLocally } from './presence.js';
import {
  ACHIEVEMENT_NAME, state, getFilteredSpecies, getFilteredHabitats,
  habitatSpeciesSeenCount, habitatAreaLabel, isHabitatComplete, computeProgress
} from './state.js';
import {
  speciesList, detailPanel, searchInput, resultCount,
  speciesCount, habitatCount, coastlineKm, parkSummary,
  progressTrack, progressFill, progressLabel,
  catalogCrumb, catalogCrumbLabel, catalogTitle,
  speciesFilterGroup, searchLabel, progressPanel, invasorasPanel, basicNotice,
  accountProgressBody
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

window.__poiImgFallback = function (imgEl) {
  const poi = (state.data.pointsOfInterest || []).find(item => item.id === state.selectedPoiId);
  if (!poi || !imgEl) return;
  imgEl.onerror = null;
  imgEl.src = poiPlaceholderImage(poi);
};

// Foto de invasora rota (p. ej. sin conexión) en la portada de la ficha → emoji del grupo a tamaño
// grande, que es lo que la portada tenía antes de haber foto.
window.__invImgFallback = function (imgEl) {
  if (!imgEl) return;
  imgEl.onerror = null;
  const span = document.createElement('span');
  span.className = 'invasora-hero-emoji';
  span.setAttribute('aria-hidden', 'true');
  span.textContent = imgEl.dataset.emoji || '🌿';
  imgEl.replaceWith(span);
};

// La misma foto rota, pero en la miniatura de la lista: ahí no se puede sustituir el <img> por un
// span (rompería la rejilla de 72 px de la tarjeta), así que se cambia por la portada generada.
window.__invThumbFallback = function (imgEl) {
  if (!imgEl) return;
  imgEl.onerror = null;
  imgEl.src = invasoraPlaceholderImage({ group: imgEl.dataset.group || '' });
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
// Tolerante con los espacios de ficha base (status "basic"): sus arrays están vacíos y no tienen
// dato de costa. app.js oculta la rejilla de contadores en ese caso, pero aquí no se asume nada.
export function renderSummary() {
  const park = (state.data && state.data.park) || {};
  speciesCount.textContent = (state.data.species || []).length;
  habitatCount.textContent = (state.data.habitats || []).length;
  coastlineKm.textContent = (typeof park.coastlineKm === 'number' && park.coastlineKm > 0)
    ? park.coastlineKm + ' km' : '—';
  parkSummary.textContent = park.summary || '';
  renderProgress();
}

// --- Ficha base (espacios con status "basic") ---------------------------------------------------
// Un espacio N1 tiene límite oficial y códigos Natura 2000, pero todavía no catálogo de especies ni
// hábitats. En vez de dejar el catálogo vacío y los contadores a cero sin explicación, la barra
// lateral muestra un aviso y el panel de detalle la ficha administrativa: solo dato verificado del
// park.json y de la geometría oficial, nada inventado.

// Códigos de la Red Natura 2000 leídos de la propia geometría (LIC/ZEC y ZEPA). Las capas del IEPNB
// no usan siempre la misma capitalización en las propiedades, así que se prueban ambas variantes.
function natura2000Sites() {
  const out = [];
  const collect = (geo, kind) => {
    ((geo && geo.features) || []).forEach(f => {
      const p = f.properties || {};
      const code = p.SITE_CODE || p.site_code || p.codigo || null;
      const name = p.SITE_NAME || p.site_name || p.nombre || '';
      if (code) out.push({ kind, code, name });
    });
  };
  collect(state.geo && state.geo.lic, 'LIC/ZEC');
  collect(state.geo && state.geo.zepa, 'ZEPA');
  return out;
}

// Superficie oficial del espacio, si viene en las propiedades del límite (ha).
function boundaryHectares() {
  const feats = (state.geo && state.geo.parque && state.geo.parque.features) || [];
  let total = 0;
  feats.forEach(f => {
    const p = f.properties || {};
    const ha = typeof p.Hectareas === 'number' ? p.Hectareas : (typeof p.hectares === 'number' ? p.hectares : null);
    if (ha != null) total += ha;
  });
  return total > 0 ? Math.round(total).toLocaleString('es-ES') + ' ha' : null;
}

function factRow(label, value) {
  if (!value) return '';
  return html`<div><span>${label}</span><strong>${value}</strong></div>`;
}

export function renderBasicPark() {
  const park = (state.data && state.data.park) || {};
  const sites = natura2000Sites();
  const municipios = (park.municipalities || []).join(', ');
  const area = boundaryHectares();
  const sitesLabel = sites.length ? sites.map(s => s.kind + ' ' + s.code).join(' · ') : null;

  if (basicNotice) {
    basicNotice.innerHTML = html`<div class="section-title"><h2>Catálogo en preparación</h2><span class="badge">Ficha base</span></div>
      <p class="basic-lead">De este espacio ya tenemos su <strong>límite oficial</strong> y sus <strong>códigos de la Red Natura 2000</strong>: puedes verlos dibujados en el mapa y activarlos desde el panel de capas.</p>
      <p class="basic-lead"><strong>El catálogo de especies y hábitats está en preparación para este espacio.</strong> Todavía no hay fichas que explorar aquí, y por eso no se muestran contadores ni progreso: preferimos un hueco declarado a un dato inventado.</p>
      <p class="basic-foot">Mientras tanto, desde <strong>← Parques</strong> puedes entrar a los espacios que ya tienen el catálogo completo.</p>`;
  }

  detailPanel.innerHTML = html`<div class="detail-body basic-detail">
    <span class="card-meta"><span class="badge">${park.category || 'Espacio protegido'}</span><span class="badge review">ficha base</span></span>
    <h2>${park.name || ''}</h2>
    <p class="detail-prose">${park.summary || ''}</p>
    <div class="detail-facts">
    ${factRow('Figura de protección', park.category)}
    ${factRow('Comunidad autónoma', park.region)}
    ${factRow('Provincia', park.province)}
    ${factRow('Municipios', municipios)}
    ${factRow('Superficie', area)}
    ${factRow('Red Natura 2000', sitesLabel)}
    </div>
    ${sites.length ? html`<h3 class="detail-subtitle">Sitios de la Red Natura 2000</h3><ul class="status-list">${sites.map(s => html`<li class="detail-prose"><span>${s.kind} · ${s.code}</span>${s.name || 'Sin nombre en la fuente'}</li>`)}</ul>` : ''}
    ${park.boundaryNote ? html`<p class="detail-source">Fuente del límite: ${park.boundaryNote}</p>` : ''}
    </div>`;
  highlightGlossary(detailPanel);
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
  if (state.detailMode === 'poi') renderPoiDetail();
  else if (state.detailMode === 'habitat') renderHabitatDetail();
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
    ${habitat.image && habitat.imageAttribution ? html`<p class="detail-source">Foto: ${habitat.imageAttribution}${habitat.imageNote ? ' — ' + habitat.imageNote : ''}</p>` : ''}
    <button class="seen-toggle" type="button" data-view-habitat-species="${habitat.id}">Ver ${total === 1 ? 'la especie' : 'las ' + total + ' especies'} en el catálogo</button>
    </div>`;
}

// Ficha de un punto de interés. Antes vivía dentro de un globo del mapa, apretada entre una foto de
// 180 px y el borde de la pantalla; aquí tiene el mismo formato que las demás fichas (foto de
// portada, datos, audioguía y su botón de marcar), y por tanto el mismo modo de cerrarse.
function renderPoiDetail() {
  const poi = (state.data.pointsOfInterest || []).find(item => item.id === state.selectedPoiId);
  if (!poi) { detailPanel.innerHTML = ''; return; }
  const seen = state.seenPois.has(poi.id);
  detailPanel.innerHTML = html`<div class="detail-image-wrap poi-detail-image">
    <img src="${poiImageSrc(poi)}" alt="${poi.name}" onerror="window.__poiImgFallback(this)">
    <span class="habitat-detail-kind">Punto de interés</span>
    </div>
    <div class="detail-body">
    <span class="card-meta"><span class="badge">${poi.type || 'Punto de interés'}</span>${poi.approx ? html`<span class="badge review">ubicación aproximada</span>` : ''}${seen ? html`<span class="badge">visitado ✓</span>` : ''}</span>
    <h2>${poi.name}</h2>
    <p class="detail-prose">${poi.description || ''}</p>
    ${audioBlock(poi, 'Audioguía del punto de interés')}
    ${poi.approx ? html`<div class="review-note">La posición de este punto en el mapa es <strong>aproximada</strong>: sigue las indicaciones del terreno y los senderos señalizados.</div>` : ''}
    ${poi.source ? html`<p class="detail-source">Fuente: ${poi.source}</p>` : ''}
    <button class="seen-toggle ${seen ? 'is-seen' : ''}" type="button" data-toggle-poi="${poi.id}" aria-pressed="${seen ? 'true' : 'false'}">${seen ? '✓ Visitado' : 'Marcar como visitado'}</button>
    ${seen ? markVerificationNote('poi', poi.id) : ''}
    </div>`;
}

// Estado de verificación de una marca concreta, bajo su botón de "visto". Es la contrapartida
// honesta de que los logros exijan presencia: si algo no va a contar, se dice en su ficha, no se
// deja al usuario descubrirlo al ver que el contador no sube. La predicción es local (lo que este
// dispositivo sabe de tus visitas); en cuanto hay red, el servidor la corrige.
function markVerificationNote(type, id) {
  const markedIso = (state.markedAt || {})[type + ':' + id];
  const verified = markedIso ? isMarkVerifiedLocally(state.activeParkSlug, Date.parse(markedIso)) : false;
  return verified
    ? html`<p class="mark-verified">✅ Avistamiento verificado en campo: cuenta para tus logros.</p>`
    : html`<p class="mark-unverified">◌ Sin verificar: está en tu cuaderno, pero no cuenta para los logros. Solo suman las marcas hechas dentro del parque con la ubicación activada.</p>`;
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
    <ul class="detail-list detail-prose">${species.tips.map(tip => html`<li>${tip}</li>`)}</ul>
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
    ${species.image && species.imageAttribution ? html`<p class="detail-source">Foto: ${species.imageAttribution}</p>` : ''}
    ${species.source ? html`<p class="detail-source">Fuente: ${species.source}</p>` : ''}
    <button class="seen-toggle ${seen ? 'is-seen' : ''}" type="button" data-toggle-seen="${species.id}" aria-pressed="${seen ? 'true' : 'false'}">${seen ? '✓ Visto' : 'Marcar como visto'}</button>
    ${seen ? markVerificationNote('species', species.id) : ''}
    ${seen ? html`<p class="detail-source">${state.sightings.has(species.id)
      ? '📍 Ya está en el mapa, en el punto exacto que registró tu GPS al marcarla.'
      : '📍 Ya está en el mapa, en su ubicación aproximada del catálogo (no había GPS al marcarla).'}</p>` : ''}
    </div>`;
}

// --- Pestaña de invasoras -----------------------------------------------------------------------------
// Lista de invasoras del parque (filtradas por la CCAA de la región).
function invasorasForPark() {
  const region = state.data.park && state.data.park.region;
  return (state.data.invasoras || []).filter(i => !region || i.ccaa === region);
}

export function renderInvasoras() {
  if (!invasorasPanel) return;
  const region = state.data.park && state.data.park.region;
  const list = invasorasForPark();
  // Tarjetas compactas y clicables (como las de especies): miniatura de la foto —que es justo lo
  // que hay que reconocer en el campo— y, si la foto falla, la portada con el emoji del grupo.
  const cards = list.map(i => html`<button class="species-card invasora-card${i.scientificName === state.selectedInvasora ? ' active' : ''}" type="button" data-invasora="${i.scientificName}"${i.scientificName === state.selectedInvasora ? html` aria-current="true"` : ''}><span class="card-thumb invasora-thumb"><img src="${invasoraImageSrc(i)}" alt="" loading="lazy" data-group="${i.group || ''}" onerror="window.__invThumbFallback(this)"></span><span><span class="card-meta"><span class="badge alert">Invasora</span><span class="badge">${i.group || ''}</span></span><h3>${i.commonName || i.scientificName}</h3><em>${i.scientificName}</em></span></button>`);
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
  const identified = isInvasiveSeenLocally(inv.scientificName);
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
    <div class="review-note invasora-warning"><strong>Especie exótica invasora.</strong> Introducirla en el medio natural, transportarla o comerciar con ella está prohibido (RD 630/2013). Si la tienes en el jardín, no tires los restos de poda al campo.</div>
    ${inv.impact ? html`<h3 class="detail-subtitle">Por qué es un problema</h3><p class="detail-prose">${inv.impact}</p>` : ''}
    ${inv.pathway ? html`<h3 class="detail-subtitle">Cómo llegó y cómo se propaga</h3><p class="detail-prose">${inv.pathway}</p>` : ''}
    <h3 class="detail-subtitle">Ficha</h3>
    <ul class="status-list">
    ${inv.origin ? html`<li class="detail-prose"><span>Origen</span>${inv.origin}</li>` : ''}
    ${inv.habitat ? html`<li class="detail-prose"><span>Dónde vive</span>${inv.habitat}</li>` : ''}
    <li><span>Grupo</span>${inv.group || 'Sin dato'}</li>
    <li><span>Catálogo oficial</span>${inv.catalogo || 'Catálogo Español de EEI (RD 630/2013)'}</li>
    <li><span>Presencia en ${inv.ccaa || 'la zona'}</span>${inv.gbifOccurrences ? inv.gbifOccurrences + ' registros (GBIF)' : 'Registrada'}</li>
    </ul>
    ${hasPhoto && inv.imageAttribution ? html`<p class="detail-source">Foto: ${inv.imageAttribution}</p>` : ''}
    ${inv.source ? html`<p class="detail-source">Fuente: ${inv.source}</p>` : ''}
    <button class="seen-toggle ${identified ? 'is-seen' : ''}" type="button" data-mark-invasive="${inv.scientificName}" data-invasive-ccaa="${inv.ccaa || ''}" aria-pressed="${identified ? 'true' : 'false'}"${identified ? ' disabled' : ''}>${identified ? '✓ Identificada' : 'Marcar como identificada'}</button>
    </div>`;
  highlightGlossary(detailPanel);
}

// --- Pestaña de progreso ------------------------------------------------------------------------------
// Tarjeta de logro reutilizable (bloqueado/desbloqueado). `justUnlocked` anima el que se acaba de ganar.
function achievementCard(name, unlocked, desc, justUnlocked) {
  return html`<div class="achievement-card ${unlocked ? 'unlocked' : 'locked'}${justUnlocked ? ' just-unlocked' : ''}"><span class="achievement-icon" aria-hidden="true">${unlocked ? icon('trophy', 22) : icon('lock', 22)}</span><div><strong>${name}</strong><p>${desc}</p></div></div>`;
}

// Progreso del parque activo contando SOLO lo verificado en campo. Espejo local de lo que hace el
// servidor en Backend/Lib/account_progress.php: cruzar la hora de cada marca con las visitas
// verificadas. Es una predicción (lo que sabe este dispositivo); el servidor tiene la última palabra.
function verifiedParkProgress() {
  const isVerified = (type, id) => {
    const iso = (state.markedAt || {})[type + ':' + id];
    return iso ? isMarkVerifiedLocally(state.activeParkSlug, Date.parse(iso)) : false;
  };
  const species = (state.data.species || []).filter(s => state.seenSpecies.has(s.id) && isVerified('species', s.id));
  const seenIds = new Set(species.map(s => s.id));
  const pois = (state.data.pointsOfInterest || []).filter(p => state.seenPois.has(p.id) && isVerified('poi', p.id));

  const habitats = state.data.habitats || [];
  const habitatsCompleteCount = habitats.filter(h => {
    const members = h.speciesIds || [];
    return members.length > 0 && members.every(id => seenIds.has(id));
  }).length;
  const poisTotal = (state.data.pointsOfInterest || []).length;

  return {
    speciesSeen: species.length,
    poisSeen: pois.length,
    habitatsCompleteCount,
    zepaSeen: species.filter(s => s.zepaSiteCode).length,
    parkComplete: habitats.length > 0 && habitatsCompleteCount === habitats.length
      && poisTotal > 0 && pois.length === poisTotal
  };
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

  // Los tres logros de este parque se miden sobre lo VERIFICADO, no sobre el cuaderno. Las barras de
  // arriba siguen contando todo lo marcado (es tu registro personal y no se toca), pero una medalla
  // se gana en el campo: si no, esta pestaña seguiría repartiendo logros desde el sofá mientras el
  // progreso estatal ya no lo hace, y la app se contradiría a sí misma.
  const verified = verifiedParkProgress();
  const justUnlocked = verified.parkComplete && !state.parkWasComplete;
  state.parkWasComplete = verified.parkComplete;

  const habitatsAllComplete = nHab > 0 && verified.habitatsCompleteCount === nHab;
  const zepaAllSeen = progress.zepaTotal > 0 && verified.zepaSeen === progress.zepaTotal;
  const pendiente = progress.speciesSeen > verified.speciesSeen || progress.poisSeen > verified.poisSeen
    ? html`<p class="account-note">De lo que llevas marcado en este parque, <strong>${verified.speciesSeen} de ${progress.speciesSeen}</strong> ${progress.speciesSeen === 1 ? 'especie está verificada' : 'especies están verificadas'} en campo. Solo eso cuenta para las medallas.</p>`
    : '';
  const logros = [
    achievementCard('Explorador de hábitats', habitatsAllComplete,
      habitatsAllComplete ? 'Has completado todos los hábitats del parque, avistando sus especies allí mismo.' : `Completa los ${nHab} hábitats avistando todas sus especies dentro del parque (${verified.habitatsCompleteCount}/${nHab}).`, false),
    progress.zepaTotal > 0 ? achievementCard('Gran observador de aves', zepaAllSeen,
      zepaAllSeen ? '¡Lista completa! Has avistado las ' + progress.zepaTotal + ' aves migratorias de este espacio protegido (ZEPA, Red Natura 2000).' : `Completa tu lista de avistamientos de las aves migratorias del parque (${verified.zepaSeen}/${progress.zepaTotal}).`, false) : '',
    achievementCard(ACHIEVEMENT_NAME, verified.parkComplete,
      verified.parkComplete ? 'Logro desbloqueado: has completado todos los hábitats y puntos de interés de este parque, sobre el terreno.'
        : 'Completa todos los hábitats y visita todos los puntos de interés, estando allí, para desbloquear el logro final.', justUnlocked),
    pendiente
  ];

  const zepaPct = progress.zepaTotal ? Math.round((progress.zepaSeen / progress.zepaTotal) * 100) : 0;
  const zepaSection = progress.zepaTotal > 0
    ? html`<div class="progress-section"><h3>🕊️ Aves migratorias</h3><div class="progress-track big" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${zepaPct}" aria-label="Aves migratorias avistadas"><div class="progress-fill" style="width:${zepaPct}%"></div></div><span class="progress-caption">${progress.zepaSeen} / ${progress.zepaTotal} aves migratorias avistadas · tu lista de la ZEPA (Red Natura 2000)</span></div>`
    : '';

  progressPanel.innerHTML = html`<div class="progress-section"><h3>Especies</h3><div class="progress-track big" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${speciesPct}" aria-label="Especies vistas"><div class="progress-fill" style="width:${speciesPct}%"></div></div><span class="progress-caption">${progress.speciesSeen} / ${progress.speciesTotal} especies vistas</span></div><div class="progress-section"><h3>Hábitats</h3><span class="progress-caption">${progress.habitatsCompleteCount} / ${nHab} hábitats completados 🏅</span><ul class="progress-list">${habitatsHtml}</ul></div>${zepaSection}<div class="progress-section"><h3>Puntos de interés</h3><div class="progress-track big" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${poiPct}" aria-label="Puntos de interés visitados"><div class="progress-fill" style="width:${poiPct}%"></div></div><span class="progress-caption">${progress.poisSeen} / ${progress.poisTotal} puntos visitados</span><ul class="progress-list">${poisHtml}</ul></div><div class="progress-section"><h3>Logros</h3>${logros}</div>`;
}

// --- Progreso de CUENTA (ámbito estatal, pantalla "screen-account", fuera de un parque concreto) ----
function accountStat(value, label) {
  return html`<div class="account-stat"><strong>${value ?? 0}</strong><span>${label}</span></div>`;
}

function achievementCardHtml(ach, entry, totals) {
  const unlocked = !!entry;
  const value = (totals && totals[ach.metric] !== undefined) ? Number(totals[ach.metric]) || 0 : 0;
  const showBar = !unlocked && ach.threshold > 1;
  const pct = showBar ? Math.max(0, Math.min(100, Math.round((value / ach.threshold) * 100))) : 0;
  return html`<div class="achievement-card rarity-${ach.rarity} ${unlocked ? 'unlocked' : 'locked'}">
    <span class="achievement-icon" aria-hidden="true">${unlocked ? ach.icon : icon('lock', 20)}</span>
    <div class="achievement-card-body">
    <strong>${ach.title}</strong>
    <p>${ach.description}</p>
    ${showBar ? html`<div class="achievement-progress"><span class="progress-track"><span class="progress-fill" style="width:${pct}%"></span></span><span class="achievement-progress-label">${Math.min(value, ach.threshold)} / ${ach.threshold}</span></div>`
      : (!unlocked ? html`<p class="achievement-progress-label">Aún no conseguido</p>` : '')}
    </div>
    </div>`;
}

export async function renderAccountProgress() {
  if (!accountProgressBody) return;
  accountProgressBody.innerHTML = html`<p class="select-hint">Cargando tu progreso…</p>`;
  await refreshAccountProgress();
  const catalog = await loadAchievementsCatalog();
  const totals = state.account.totals || {};
  const achievementsMap = state.account.achievements;

  const totalsGrid = html`<div class="account-totals-grid">
    ${accountStat(totals.speciesSeen, 'especies avistadas')}
    ${accountStat(totals.parksVisited, 'espacios visitados')}
    ${accountStat(totals.parksCompleted, 'espacios completados')}
    ${accountStat(totals.regionsVisited, 'comunidades autónomas')}
    ${accountStat(totals.provincesVisited, 'provincias')}
    ${accountStat(totals.habitatsCompleted, 'hábitats completados')}
    ${accountStat(totals.poisSeen, 'puntos de interés')}
    ${accountStat(totals.gpsSightings, 'registros con GPS')}
    ${accountStat(totals.fieldDays, 'días de campo')}
    ${accountStat(totals.fieldHours, 'horas en el monte')}
    ${accountStat(totals.fieldKilometers, 'km recorridos')}
    ${accountStat(totals.weekStreak, 'semanas seguidas')}
  </div>`;

  // Regla de la casa, dicha de frente: todo lo de arriba se cuenta estando allí.
  const rulesHtml = html`<p class="account-rule">📍 Todo lo que ves aquí se gana en el campo: solo cuentan las marcas hechas <strong>dentro de un espacio protegido</strong> mientras tu ubicación confirma que estás allí.${totals.unverifiedMarks ? html` Tienes <strong>${totals.unverifiedMarks}</strong> ${totals.unverifiedMarks === 1 ? 'marca sin verificar' : 'marcas sin verificar'} en tu cuaderno: siguen ahí, pero no suman.` : ''}</p>`;

  const regionsHtml = (totals.regionsList && totals.regionsList.length)
    ? html`<div class="account-section"><h3>Comunidades autónomas exploradas</h3><div class="account-chips">${totals.regionsList.map(r => html`<span class="badge">${r}</span>`)}</div></div>`
    : '';

  const visitsHtml = renderVisitHistory();

  // Lo que ya no desbloquea logros pero se sigue registrando: se enseña aparte y sin medallas, para
  // que quede claro que es actividad de la app y no mérito de campo.
  const appStatsHtml = html`<div class="account-section"><h3>📖 Actividad en la app</h3>
    <div class="account-totals-grid small">
      ${accountStat(totals.glossaryViewed, 'términos del glosario consultados')}
      ${accountStat(totals.invasiveSeen, 'invasoras identificadas')}
    </div>
    <p class="account-note">Aprender también cuenta, pero no da logros: se puede hacer desde casa.</p></div>`;

  const sections = (catalog.categories || []).map(cat => {
    const items = (catalog.achievements || []).filter(a => a.category === cat.key);
    if (!items.length) return '';
    const unlockedCount = items.filter(a => achievementsMap.has(a.id)).length;
    const cards = items.map(a => achievementCardHtml(a, achievementsMap.get(a.id), totals));
    return html`<div class="account-section"><h3>${cat.icon} ${cat.label} <span class="account-section-count">${unlockedCount}/${items.length}</span></h3><div class="achievement-grid">${cards}</div></div>`;
  });

  accountProgressBody.innerHTML = html`${totalsGrid}${rulesHtml}${regionsHtml}${visitsHtml}${sections}${appStatsHtml}`;
}

// --- Historial de salidas verificadas ------------------------------------------------------------
// Si el progreso depende de haber estado allí, el usuario tiene derecho a ver la lista exacta de lo
// que la app le ha contado como visita, y a que le diga por qué una no le ha valido.
const VISIT_FLAG_LABELS = {
  salto_imposible: 'posiciones incoherentes entre sí',
  gps_congelado: 'la ubicación no se movió ni un metro'
};

function renderVisitHistory() {
  const visits = (state.account.visits || []).slice(0, 12);
  if (!visits.length) {
    return html`<div class="account-section"><h3>🥾 Tus salidas</h3>
      <p class="account-note">Todavía no hay ninguna visita verificada. Entra en un espacio protegido con la ubicación activada y camina unos minutos: la app registrará tu presencia y a partir de ahí todo lo que marques contará.</p></div>`;
  }
  const rows = visits.map(v => {
    const date = new Date(v.startedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    const minutes = Math.round((v.seconds || 0) / 60);
    const km = (v.distanceM || 0) / 1000;
    const detail = [
      minutes >= 60 ? Math.floor(minutes / 60) + ' h ' + (minutes % 60) + ' min' : minutes + ' min',
      km >= 0.1 ? km.toLocaleString('es-ES', { maximumFractionDigits: 1 }) + ' km' : null
    ].filter(Boolean).join(' · ');
    const state_ = v.suspicious
      ? html`<span class="visit-state is-flagged" title="${(v.flags || []).map(f => VISIT_FLAG_LABELS[f] || f).join(', ')}">No verificada</span>`
      : (v.verified ? html`<span class="visit-state is-ok">Verificada ✓</span>` : html`<span class="visit-state">Demasiado corta</span>`);
    return html`<li class="progress-row"><span class="progress-row-label">${v.parkName}<br><small>${date} · ${detail}</small></span><span class="progress-row-value">${state_}</span></li>`;
  });
  return html`<div class="account-section"><h3>🥾 Tus salidas</h3><ul class="progress-list">${rows}</ul>
    <p class="account-note">Una salida se verifica con presencia sostenida dentro del límite oficial del espacio (varias posiciones repartidas en unos minutos).</p></div>`;
}
