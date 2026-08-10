// ================================================================================================
// ./render/catalogo.js — catálogo en tres niveles: grupos de hábitats → hábitats → especies
// ------------------------------------------------------------------------------------------------
// Trozo de render.js. El índice de la carpeta está en Frontend/Js/CLAUDE.md.
// ================================================================================================

import { backToHabitatsBtn, catalogCrumb, catalogCrumbLabel, catalogTitle, resultCount, searchInput, searchLabel, speciesFilterGroup, speciesList } from '../dom.js';
import { groupSwatch, groupedHabitats, habitatGroup, habitatGroupById, habitatsOfGroup } from '../habitat-groups.js';
import { getFilteredHabitats, getFilteredSpecies, habitatSpeciesSeenCount, isHabitatComplete, state } from '../state.js';
import { html, icon, raw, speciesImageSrc } from '../util.js';

// --- Catálogo ---------------------------------------------------------------------------------------
// Tres niveles: grupos de hábitats → hábitats del grupo → especies del hábitat. Ver state.catalogMode.

/** Tarjeta de un hábitat (la usan el nivel de grupo y los resultados del buscador). */
function habitatCard(h, withGroup) {
  const total = (h.speciesIds || []).length;
  const seen = habitatSpeciesSeenCount(h);
  const complete = isHabitatComplete(h);
  return html`<button class="habitat-card${complete ? ' complete' : ''}" type="button" data-habitat="${h.id}"><span class="habitat-card-dot" style="background:${h.color || '#2f6f4e'}"></span><span class="habitat-card-body"><span class="habitat-card-meta"><span class="badge habitat-code">${h.code || ''}</span>${withGroup ? html`<span class="badge">${habitatGroup(h).short}</span>` : ''}${h.priority ? html`<span class="badge alert">prioritario UE</span>` : ''}${h.reviewNote ? html`<span class="badge review">a revisar</span>` : ''}</span><strong>${h.name}</strong><span class="habitat-card-count">${seen} / ${total} especies vistas${complete && total > 0 ? ' · completo 🏅' : ''}</span></span></button>`;
}

/**
 * Nivel de entrada: los grupos de hábitats presentes en el parque. Con el buscador escrito se
 * cortocircuita y se enseñan directamente los hábitats que coinciden, vengan del grupo que vengan:
 * quien busca "duna" quiere el hábitat, no que le hagan adivinar en qué grupo cae.
 */
export function renderHabitatGroups() {
  const query = state.query.trim();
  if (query) {
    const matches = getFilteredHabitats();
    resultCount.textContent = matches.length === 1 ? '1 hábitat' : matches.length + ' hábitats';
    speciesList.innerHTML = matches.length
      ? html`${matches.map(h => habitatCard(h, true))}`
      : html`<p class="catalog-empty">Ningún hábitat coincide con «${query}».</p>`;
    return;
  }
  const groups = groupedHabitats();
  resultCount.textContent = groups.length === 1 ? '1 grupo' : groups.length + ' grupos';
  const cards = groups.map(({ group, habitats }) => {
    const total = habitats.reduce((n, h) => n + (h.speciesIds || []).length, 0);
    const seen = habitats.reduce((n, h) => n + habitatSpeciesSeenCount(h), 0);
    const complete = habitats.every(h => isHabitatComplete(h));
    return html`<button class="habitat-group-card${complete ? ' complete' : ''}" type="button" data-habitat-group="${group.id}">
      <span class="habitat-group-swatch">${raw(groupSwatch(group, 34))}</span>
      <span class="habitat-card-body">
      <span class="habitat-card-meta"><span class="badge">${habitats.length === 1 ? '1 hábitat' : habitats.length + ' hábitats'}</span>${habitats.some(h => h.priority) ? html`<span class="badge alert">prioritario UE</span>` : ''}${complete ? html`<span class="badge">completo 🏅</span>` : ''}</span>
      <strong>${group.name}</strong>
      <span class="habitat-group-desc">${group.description}</span>
      <span class="habitat-card-count">${seen} / ${total} especies vistas</span>
      </span>
      <span class="habitat-group-go" aria-hidden="true">${icon('chevronRight', 18)}</span>
      </button>`;
  });
  speciesList.innerHTML = html`<button class="habitat-all-link" type="button" id="viewAllSpeciesBtn">Ver todas las especies (${state.data.species.length})</button>${cards}`;
}

/** Segundo nivel: los hábitats de un grupo (state.habitatGroupFocus). */
export function renderHabitatCatalog() {
  const groupId = state.habitatGroupFocus;
  const habitats = getFilteredHabitats(groupId ? habitatsOfGroup(groupId) : null);
  resultCount.textContent = habitats.length === 1 ? '1 hábitat' : habitats.length + ' hábitats';
  const group = groupId ? habitatGroupById(groupId) : null;
  const head = group
    ? html`<p class="catalog-group-intro">${raw(groupSwatch(group, 26))}<span>${group.description}</span></p>`
    : '';
  speciesList.innerHTML = habitats.length
    ? html`${head}${habitats.map(h => habitatCard(h, false))}`
    : html`${head}<p class="catalog-empty">Ningún hábitat de este grupo coincide con la búsqueda.</p>`;
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
  const mode = state.catalogMode;
  const inSpeciesMode = mode === 'species';
  speciesFilterGroup.hidden = !inSpeciesMode;
  searchLabel.textContent = inSpeciesMode ? 'Buscar especie' : 'Buscar hábitat';
  searchInput.placeholder = inSpeciesMode ? 'Nombre común o científico' : 'Nombre o código de hábitat';
  // La miga de pan solo existe a partir del segundo nivel: en los grupos no hay de dónde volver.
  catalogCrumb.hidden = mode === 'groups';
  const group = state.habitatGroupFocus ? habitatGroupById(state.habitatGroupFocus) : null;
  if (inSpeciesMode) {
    const habitat = state.habitatFocus ? state.data.habitats.find(h => h.id === state.habitatFocus) : null;
    const label = habitat ? habitat.name : 'Todas las especies';
    // El botón de volver dice a DÓNDE se vuelve, que dentro de un hábitat es su grupo y no la lista
    // entera: sin eso, el usuario que entró por "Costa y dunas" no sabe si va a salir a su grupo o
    // al principio del catálogo.
    setCrumbBack(habitat && group ? group.short : 'Hábitats');
    catalogCrumbLabel.textContent = label;
    catalogCrumbLabel.title = habitat ? 'Abrir la ficha de este hábitat' : '';
    catalogTitle.textContent = label;
    renderSpeciesList();
  } else if (mode === 'habitats') {
    setCrumbBack('Grupos');
    catalogCrumbLabel.textContent = group ? group.name : 'Hábitats';
    catalogCrumbLabel.title = 'Ver en el mapa solo este grupo';
    catalogTitle.textContent = group ? group.name : 'Hábitats';
    renderHabitatCatalog();
  } else {
    catalogTitle.textContent = 'Grupos de hábitats';
    renderHabitatGroups();
  }
}

// El botón «←» de la miga es uno solo y cambia de rótulo según el nivel. El texto va en un <span>
// aparte de la flecha para no rehacer el botón entero en cada render.
function setCrumbBack(label) {
  backToHabitatsBtn.textContent = '← ' + label;
}
