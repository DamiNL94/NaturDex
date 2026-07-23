// ================================================================================================
// layers.js — panel de capas propio: mapa base, capas con su simbología y hábitats individuales.
// ------------------------------------------------------------------------------------------------
// Módulo ES importado por app.js. Sustituye al control nativo de Leaflet y a la antigua leyenda
// estática, que duplicaban información y no permitían encender/apagar cada hábitat por separado
// (los polígonos se solapan y vistos todos a la vez resultan confusos). Cada fila lleva su propia
// muestra de color, así el panel ES la leyenda. La subsección de hábitats ofrece Todos / Ninguno,
// un "Solo" por hábitat (lo aísla y lo encuadra) y zoom con popup al tocar el nombre.
// ================================================================================================

import { html, raw } from './util.js';
import { state } from './state.js';
import { layersToggle, layersPanel } from './dom.js';
import { map, baseOSM, basePNOA, setHabitatVisible, focusHabitatOnMap } from './map.js';

// Capas generales (las de hábitats van en su propia subsección). El swatch reutiliza las clases
// de la antigua leyenda (.legend-dot/.legend-line) para que la simbología siga siendo la misma.
const OVERLAYS = [
  { key: 'parque', label: 'Límite del parque', swatch: '<i class="legend-line parque"></i>', group: () => state.parqueLayer },
  { key: 'lic', label: 'LIC · Red Natura 2000', swatch: '<i class="legend-line lic"></i>', group: () => state.licLayer },
  { key: 'zepa', label: 'ZEPA · Red Natura 2000', swatch: '<i class="legend-line zepa"></i>', group: () => state.zepaLayer },
  { key: 'trails', label: 'Senderos (GR-92)', swatch: '<i class="legend-line trail"></i>', group: () => state.trailLayer },
  { key: 'pois', label: 'Puntos de interés', swatch: '<i class="legend-dot poi"></i>', group: () => state.poiGroup },
  { key: 'species', label: 'Especies vistas', swatch: '<i class="legend-dot fauna"></i>', group: () => state.speciesCluster }
];

function habitatRows() {
  return (state.data && state.data.habitats ? state.data.habitats : []).map(h => {
    const visible = !state.hiddenHabitats.has(h.id);
    return html`<div class="layers-row">
      <input type="checkbox" data-habitat-check="${h.id}" id="lyr-hab-${h.id}" aria-label="Mostrar ${h.name} en el mapa" ${visible ? raw('checked') : ''}>
      <span class="lg-dot" style="background:${h.color || '#2f6f4e'}"></span>
      <button type="button" class="layers-habitat-name" data-habitat-zoom="${h.id}" title="Ver este hábitat en el mapa">${h.name}</button>
      <button type="button" class="layers-solo" data-habitat-solo="${h.id}" title="Mostrar solo este hábitat" aria-label="Mostrar solo ${h.name}">Solo</button>
      </div>`;
  });
}

export function refreshLayersPanel() {
  const pnoaActive = map.hasLayer(basePNOA);
  layersPanel.innerHTML = html`
    <section class="layers-section">
    <h4>Mapa base</h4>
    <label class="layers-row"><input type="radio" name="baseLayer" value="osm" ${!pnoaActive ? raw('checked') : ''}> Mapa</label>
    <label class="layers-row"><input type="radio" name="baseLayer" value="pnoa" ${pnoaActive ? raw('checked') : ''}> Satélite (PNOA)</label>
    </section>
    <section class="layers-section">
    <h4>Capas</h4>
    ${OVERLAYS.map(o => html`<label class="layers-row"><input type="checkbox" data-overlay="${o.key}" ${map.hasLayer(o.group()) ? raw('checked') : ''}>${raw(o.swatch)}${o.label}</label>`)}
    </section>
    <section class="layers-section">
    <h4>Hábitats <span class="layers-mini-actions"><button type="button" data-habitats-all>Todos</button><button type="button" data-habitats-none>Ninguno</button></span></h4>
    <div class="layers-habitats">${habitatRows()}</div>
    </section>`;
}

export function initLayersPanel() {
  // El contenedor se monta como control nativo de Leaflet (esquina superior derecha DEL MAPA):
  // anclado a .map-stage quedaba sobre la columna de la ficha en escritorio, no sobre el mapa.
  // Leaflet además se encarga de que los clics y el scroll del panel no muevan ni acerquen el mapa.
  const container = layersToggle.closest('.layers-control');
  const control = L.control({ position: 'topright' });
  control.onAdd = () => {
    L.DomEvent.disableClickPropagation(container);
    L.DomEvent.disableScrollPropagation(container);
    return container;
  };
  control.addTo(map);

  layersToggle.addEventListener('click', () => {
    const open = layersPanel.hidden;
    layersPanel.hidden = !open;
    layersToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) refreshLayersPanel(); // reconstruir al abrir: refleja el estado real de cada capa
  });

  layersPanel.addEventListener('change', event => {
    const base = event.target.closest('input[name="baseLayer"]');
    if (base) {
      if (base.value === 'pnoa') { map.removeLayer(baseOSM); basePNOA.addTo(map); }
      else { map.removeLayer(basePNOA); baseOSM.addTo(map); }
      return;
    }
    const overlay = event.target.closest('input[data-overlay]');
    if (overlay) {
      const def = OVERLAYS.find(o => o.key === overlay.dataset.overlay);
      if (!def) return;
      const group = def.group();
      if (overlay.checked) group.addTo(map); else map.removeLayer(group);
      return;
    }
    const habCheck = event.target.closest('input[data-habitat-check]');
    if (habCheck) setHabitatVisible(habCheck.dataset.habitatCheck, habCheck.checked);
  });

  layersPanel.addEventListener('click', event => {
    const habitats = (state.data && state.data.habitats) || [];
    if (event.target.closest('[data-habitats-all]')) {
      habitats.forEach(h => setHabitatVisible(h.id, true));
      refreshLayersPanel();
      return;
    }
    if (event.target.closest('[data-habitats-none]')) {
      habitats.forEach(h => setHabitatVisible(h.id, false));
      refreshLayersPanel();
      return;
    }
    const solo = event.target.closest('[data-habitat-solo]');
    if (solo) {
      const id = solo.dataset.habitatSolo;
      habitats.forEach(h => setHabitatVisible(h.id, h.id === id));
      if (!map.hasLayer(state.habitatGroup)) state.habitatGroup.addTo(map);
      focusHabitatOnMap(id);
      refreshLayersPanel();
      return;
    }
    const zoom = event.target.closest('[data-habitat-zoom]');
    if (zoom) {
      const id = zoom.dataset.habitatZoom;
      setHabitatVisible(id, true);
      if (!map.hasLayer(state.habitatGroup)) state.habitatGroup.addTo(map);
      focusHabitatOnMap(id, true);
      refreshLayersPanel();
    }
  });
}
