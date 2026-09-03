// ================================================================================================
// ./render/catalogo.js — catálogo en tres niveles: grupos de hábitats → hábitats → especies
// ------------------------------------------------------------------------------------------------
// Trozo de render.js. El índice de la carpeta está en Frontend/Js/CLAUDE.md.
// ================================================================================================

import { backToHabitatsBtn, catalogCrumb, catalogCrumbLabel, catalogTitle, rarityFilterGroup, resultCount, searchInput, searchLabel, speciesFilterGroup, speciesList } from '../dom.js';
import { groupSwatch, groupedHabitats, habitatGroup, habitatGroupById, habitatsOfGroup } from '../habitat-groups.js';
import { TRAMOS, TRAMO_AMENAZA, estrellas, tramoDe } from '../rareza.js';
import { catalogSpecies, esMigratoria, getFilteredHabitats, getFilteredSpecies, habitatSpeciesSeenCount, isHabitatComplete, speciesSinHabitat, state } from '../state.js';
import { html, icon, raw, speciesImageSrc } from '../util.js';

/*
 * El distintivo de rareza de la tarjeta. Existe por el filtro: sin él, filtrar por «amenazadas»
 * devuelve una lista idéntica a la de antes y no hay forma de ver por qué está cada ficha ahí.
 * Lleva las cinco estrellas —las vacías incluidas— y el nombre de la categoría, y solo se pinta a
 * partir del tramo 2: en el 1 diría «sin figura de protección» en 478 tarjetas de 1.161, que es
 * ruido, y una ficha SIN tramo calculado no puede fingir que tiene uno.
 */
function rarezaBadge(species) {
  const tramo = tramoDe(species);
  if (tramo === null || tramo < 2) return '';
  const clase = tramo >= TRAMO_AMENAZA ? 'badge rareza amenazada' : 'badge rareza';
  // El texto visible va entero en un solo nodo —estrellas y categoría— y el del lector de pantalla
  // en otro: separarlos en dos nodos visibles dejaba las estrellas pegadas a la palabra, porque el
  // espacio entre ellos caía junto a un `.sr-only` posicionado en absoluto y no se pintaba.
  return html`<span class="${clase}" title="${TRAMOS[tramo].significado}"><span aria-hidden="true">${estrellas(tramo)} ${TRAMOS[tramo].corto}</span><span class="sr-only">Rareza ${tramo} de 5: ${TRAMOS[tramo].significado}.</span></span>`;
}

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
  speciesList.innerHTML = html`<button class="habitat-all-link" type="button" id="viewAllSpeciesBtn">Ver todas las especies (${catalogSpecies().length})</button>${cards}${sinHabitatCard()}`;
}

/*
 * La tarjeta de las fichas que no cuelgan de ningún hábitat.
 *
 * Va DESPUÉS de los grupos y no como uno más: no es un grupo de hábitats, es lo que queda fuera de
 * ellos, y mezclarlo con los siete daría a entender que hay un ecosistema llamado «sin hábitat».
 * Se pinta solo cuando hay alguna, y dice de qué están hechas esas fichas, porque el motivo no es
 * uno solo: las aves no se adscriben a ningún polígono a propósito y el resto es un hueco real de
 * evidencia. Sin esto, en Cañaverosa el catálogo enseña cuatro grupos con 41 fichas y esconde 181
 * detrás de un enlace que no dice cuántas hay.
 */
/*
 * ¿Consta la fenología de las aves de este espacio, o no hay fuente que consultar?
 *
 * `migratory` tiene tres estados y el tercero —ausente— no es «no migra»: es que ningún Formulario
 * Normalizado de Datos de la Red Natura 2000 nombra a esa ave. Si NINGUNA ficha del espacio trae uno
 * de los dos primeros, ese formulario no existe o no enumera aves. Son cinco de los dieciséis
 * espacios publicados: Barrancos de Gebas, Cabezo Gordo, Monte Arabí, Sierra de El Carche y
 * Cañaverosa.
 *
 * Lo decía la pestaña «Migratorias», que era el único sitio de la app donde se podía leer «aquí no
 * hay lista oficial de aves». Quitada la pestaña, ese hueco se quedaba sin quien lo contara, y
 * callarlo se lee como que el espacio no tiene ninguna migratoria — justo lo contrario de lo que
 * consta. Se dice aquí, en «Sin hábitat asignado», porque es la lista donde caen TODAS las aves del
 * espacio (no se adscriben a ningún polígono) y por tanto la única cuyo lector está mirando aves.
 * En la ficha de cada ave sería la misma frase repetida 118 veces en Cañaverosa.
 */
function faltaFormularioDeAves() {
  const sp = state.data.species || [];
  return sp.some(s => (s.taxonomy || {}).class === 'Aves')
    && !sp.some(s => s.migratory === true || s.migratory === false);
}

function sinHabitatCard() {
  const sin = speciesSinHabitat();
  if (!sin.length) return '';
  const aves = sin.filter(s => (s.taxonomy || {}).class === 'Aves').length;
  const otras = sin.length - aves;
  const seen = sin.filter(s => state.seenSpecies.has(s.id)).length;
  const partes = [];
  if (aves) partes.push(aves === 1 ? '1 ave, que no se adscribe a ningún polígono porque vuela'
    : `${aves} aves, que no se adscriben a ningún polígono porque vuelan`);
  // El texto NO dice de qué fuente vienen: son varias —el anexo de la norma, el formulario del
  // sitio, el Atlas— y afirmar una sola sería rellenar el motivo a ojo. Dice lo que sí consta: que
  // están en el catálogo del espacio y que no hay registro suyo dentro de ningún hábitat.
  if (otras) partes.push(otras === 1
    ? '1 ficha más del catálogo del espacio, sin ningún registro dentro de sus hábitats cartografiados'
    : `${otras} fichas más del catálogo del espacio, sin ningún registro dentro de sus hábitats cartografiados`);
  return html`<button class="habitat-group-card sin-habitat" type="button" data-sin-habitat="1">
      <span class="habitat-group-swatch" aria-hidden="true">${icon('info', 26)}</span>
      <span class="habitat-card-body">
      <span class="habitat-card-meta"><span class="badge">fuera de los hábitats</span></span>
      <strong>Sin hábitat asignado</strong>
      <span class="habitat-group-desc">${partes.join('. ')}.</span>
      <span class="habitat-card-count">${seen} / ${sin.length} especies vistas</span>
      </span>
      <span class="habitat-group-go" aria-hidden="true">${icon('chevronRight', 18)}</span>
      </button>`;
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
  // Con un filtro de rareza puesto, «12 resultados» a secas se lee como «este hábitat tiene 12
  // especies». Se dice cuántas hay en total para que se vea que es un recorte y no el catálogo.
  const total = state.sinHabitatFocus
    ? speciesSinHabitat().length
    : (state.habitatFocus
      ? (state.data.species || []).filter(s => (s.habitatIds || []).includes(state.habitatFocus)).length
      : (state.data.species || []).length);
  const recorte = species.length < total ? ` de ${total}` : '';
  resultCount.textContent = (species.length === 1 ? '1 resultado' : species.length + ' resultados') + recorte;
  // El distintivo de «migratoria» está de vuelta en la tarjeta, y esta vez dice lo que afirma. El
  // que hubo iba por `zepaSiteCode`, que dice otra cosa —que el formulario oficial del sitio nombra
  // al ave, población permanente incluida—, y era falso en 154 fichas; por eso se quitó. Ahora va
  // por `esMigratoria()`, o sea por `migratory`, derivado del TIPO DE POBLACIÓN de ese mismo
  // formulario (Tools/lib/fenologia.js).
  //
  // Con él va la etiqueta de `sitePresence`, que dice de qué clase es la migración —cría aquí,
  // inverna o solo pasa—, porque «migratoria» a secas no responde a la pregunta que se hace quien
  // la lee, que es cuándo hay que venir. Las dos SOLO en las aves que migran: en una residente la
  // etiqueta diría «Residente todo el año», que es lo mismo que no llevar distintivo, y en las 591
  // fichas de ave que ningún formulario nombra no hay nada que afirmar (ver `esMigratoria`).
  const cards = species.map(item => {
    const seen = state.seenSpecies.has(item.id);
    const migra = esMigratoria(item);
    const fenologia = (migra && item.sitePresence && item.sitePresence.etiqueta) || '';
    return html`<button class="species-card ${item.id === state.selectedId ? 'active' : ''}${seen ? ' seen' : ''}" type="button" data-id="${item.id}"${item.id === state.selectedId ? html` aria-current="true"` : ''}><span class="card-thumb"><img src="${speciesImageSrc(item)}" alt="" loading="lazy" onerror="window.__imgFallback(this,${item.id})">${seen ? html`<span class="seen-badge" aria-hidden="true">${icon('check', 12)}</span>` : ''}</span><span><span class="card-meta"><span class="badge ${item.kingdom}">${item.kingdom}</span>${migra ? html`<span class="badge migratoria">🕊️ Migratoria</span>` : ''}${fenologia ? html`<span class="badge">${fenologia}</span>` : ''}${item.featured ? html`<span class="badge alert">prioritaria</span>` : ''}${rarezaBadge(item)}${item.reviewNote ? html`<span class="badge review">a revisar</span>` : ''}</span><h3>${item.commonName}</h3><em>${item.scientificName}</em>${seen ? html`<span class="sr-only">Especie vista.</span>` : ''}</span></button>`;
  });
  // Una lista vacía sin explicación se lee como un fallo de la app. Con el filtro de rareza puesto
  // es además el caso NORMAL: en un hábitat corriente no hay ninguna especie en peligro, y eso es
  // una respuesta, no un error.
  // En «Sin hábitat asignado» la lista necesita decir POR QUÉ está cada ficha ahí: si no, se lee
  // como un catálogo a medio hacer. Son dos motivos distintos y el texto los separa (ver
  // `speciesSinHabitat` en state.js).
  const intro = state.sinHabitatFocus
    ? html`<p class="catalog-group-intro"><span>Estas fichas no cuelgan de ningún hábitat cartografiado.
        Las <strong>aves</strong> no se adscriben a ninguno a propósito: vuelan, y un registro en vuelo cae dentro de
        cualquier recinto. Las <strong>demás</strong> están en el catálogo del espacio por una fuente oficial, pero no
        hay ningún registro suyo dentro de sus polígonos de hábitat: el vínculo especie–hábitat es derivado y sin señal
        no se da por hecho. Cada ficha dice en su apartado de fuentes de dónde sale.${faltaFormularioDeAves()
          ? html` Y de las aves de este espacio <strong>no hay lista oficial</strong>: su Formulario Normalizado de Datos de
        la Red Natura 2000 no enumera ninguna, así que no consta cuáles migran y cuáles no. Clasificarlas a ojo sería
        inventarlo, y por eso ninguna lleva distintivo de migratoria aquí.`
          : ''}</span></p>`
    : '';
  speciesList.innerHTML = cards.length
    ? html`${intro}${cards}`
    : html`${intro}<p class="catalog-empty">Ninguna especie de esta lista cumple los filtros puestos.${
      state.rarityFilter !== 'all' ? ' Prueba a bajar el listón de rareza.' : ''}</p>`;
}

export function renderCatalogBody() {
  const mode = state.catalogMode;
  const inSpeciesMode = mode === 'species';
  speciesFilterGroup.hidden = !inSpeciesMode;
  // El filtro de rareza es de especies: en los niveles de grupo y de hábitat no filtra nada y solo
  // ocuparía sitio (en móvil, la pantalla entera del buscador).
  if (rarityFilterGroup) rarityFilterGroup.hidden = !inSpeciesMode;
  searchLabel.textContent = inSpeciesMode ? 'Buscar especie' : 'Buscar hábitat';
  searchInput.placeholder = inSpeciesMode ? 'Nombre común o científico' : 'Nombre o código de hábitat';
  // La miga de pan solo existe a partir del segundo nivel: en los grupos no hay de dónde volver.
  catalogCrumb.hidden = mode === 'groups';
  const group = state.habitatGroupFocus ? habitatGroupById(state.habitatGroupFocus) : null;
  if (inSpeciesMode) {
    const habitat = state.habitatFocus ? state.data.habitats.find(h => h.id === state.habitatFocus) : null;
    const label = habitat ? habitat.name
      : (state.sinHabitatFocus ? 'Sin hábitat asignado' : 'Todas las especies');
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
