// ================================================================================================
// ./render/migratorias.js — pestaña de aves migratorias
// ------------------------------------------------------------------------------------------------
// Trozo de render.js. El índice de la carpeta está en Frontend/Js/CLAUDE.md.
//
// Por qué es una pestaña y no un filtro del catálogo
// -------------------------------------------------
// Porque un ave migratoria no se busca igual que una planta. El catálogo se recorre por hábitats
// —grupo, hábitat, especies de ese hábitat— y las aves no cuelgan de ninguno a propósito (vuelan:
// sus registros caen dentro de cualquier polígono, regla nº 8 del CLAUDE.md raíz). Así que la mitad
// del catálogo de un humedal solo era alcanzable por «Ver todas las especies», una lista plana de
// 355 fichas. Aquí son una colección con su propia puerta, como las invasoras.
//
// Y a diferencia de las invasoras, éstas SÍ son catálogo del parque: se marcan como vistas, cuentan
// en el progreso de especies y en los logros. Lo único que cambia es dónde se listan, así que la
// ficha que abren es la de especie de siempre (render/detalle.js), no una propia.
// ================================================================================================

import { migratoriasPanel } from '../dom.js';
import { migratorySpecies, state } from '../state.js';
import { html, icon, speciesImageSrc } from '../util.js';

/** ¿Alguna ficha de este espacio trae fenología? Distingue «no hay migratorias» de «no hay fuente». */
function hayFuente() {
  // El campo tiene tres estados: true, false y ausente/null. Los dos primeros salen del formulario
  // oficial; el tercero significa que no hay formulario que consultar. Si NINGUNA ficha trae uno de
  // los dos primeros, este espacio no tiene lista oficial de aves y decirlo es la respuesta honesta:
  // cuatro de los dieciséis espacios publicados están en ese caso.
  return (state.data.species || []).some(s => s.migratory === true || s.migratory === false);
}

export function renderMigratorias() {
  if (!migratoriasPanel) return;
  const list = migratorySpecies();

  const cards = list.map(item => {
    const seen = state.seenSpecies.has(item.id);
    const etiqueta = (item.sitePresence && item.sitePresence.etiqueta) || '';
    return html`<button class="species-card migratoria-card${item.id === state.selectedId ? ' active' : ''}${seen ? ' seen' : ''}" type="button" data-id="${item.id}"${item.id === state.selectedId ? html` aria-current="true"` : ''}><span class="card-thumb"><img src="${speciesImageSrc(item)}" alt="" loading="lazy" onerror="window.__imgFallback(this,${item.id})">${seen ? html`<span class="seen-badge" aria-hidden="true">${icon('check', 12)}</span>` : ''}</span><span><span class="card-meta"><span class="badge migratoria">🕊️ Migratoria</span>${etiqueta ? html`<span class="badge">${etiqueta}</span>` : ''}</span><h3>${item.commonName}</h3><em>${item.scientificName}</em>${seen ? html`<span class="sr-only">Especie vista.</span>` : ''}</span></button>`;
  });

  // Los tres estados posibles del espacio se dicen con tres textos distintos. Un «no hay ninguna»
  // para un espacio que además no tiene formulario sería mentira por omisión: no es que no vengan
  // aves migratorias, es que ninguna fuente oficial lo declara aquí.
  let intro;
  if (list.length) {
    intro = html`<p class="migratorias-intro">Aves que <strong>no viven aquí todo el año</strong>: crían y se van, vienen a pasar el invierno o solo paran de camino. Lo declara el <strong>Formulario Normalizado de Datos</strong> del sitio Red Natura 2000 de este espacio, especie a especie, y cada ficha cita el suyo. Cuentan para tu progreso igual que el resto del catálogo. Pulsa una para ver su ficha.</p>`;
  } else if (hayFuente()) {
    intro = html`<p class="migratorias-intro">El formulario oficial de este espacio declara aves, pero <strong>todas con población permanente</strong>: aquí no hay ninguna migratoria reconocida. Las encontrarás en el catálogo, con el resto de las especies.</p>`;
  } else {
    intro = html`<p class="migratorias-intro">Este espacio <strong>no tiene lista oficial de aves</strong>: su Formulario Normalizado de Datos de la Red Natura 2000 no enumera ninguna. Sin esa fuente no se puede decir qué aves migran y cuáles no, y clasificarlas a ojo sería inventarlo, así que todas se quedan en el catálogo general.</p>`;
  }

  migratoriasPanel.innerHTML = html`<div class="section-title"><h2>Aves migratorias</h2><span role="status">${list.length}</span></div>${intro}<div class="species-list">${cards}</div>`;
}
