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
import { map, setHabitatVisible, focusHabitatOnMap, hasParkBaseLayer, applyBaseChoice, activeBaseKind, trailKind } from './map.js';

// Capas generales (las de hábitats van en su propia subsección). El swatch reutiliza las clases
// de la antigua leyenda (.legend-dot/.legend-line) para que la simbología siga siendo la misma.
// `label` puede ser una función: la de senderos varía según el parque (GR-92 en el litoral, GR-250
// en Carrascoy…), y no todos los parques tienen uno — `visible` la oculta si no hay ninguno cargado,
// así la leyenda nunca anuncia un sendero que no pasa por el parque abierto.
const OVERLAYS = [
  { key: 'parque', label: 'Límite del parque', swatch: '<i class="legend-line parque"></i>', group: () => state.parqueLayer },
  { key: 'lic', label: 'LIC · Red Natura 2000', swatch: '<i class="legend-line lic"></i>', group: () => state.licLayer },
  { key: 'zepa', label: 'ZEPA · Red Natura 2000', swatch: '<i class="legend-line zepa"></i>', group: () => state.zepaLayer },
  { key: 'trails', label: trailsLabel, swatch: trailsSwatch, group: () => state.trailLayer, visible: hasTrails },
  { key: 'pois', label: 'Puntos de interés', swatch: '<i class="legend-dot poi"></i>', group: () => state.poiGroup },
  { key: 'species', label: 'Especies vistas', swatch: '<i class="legend-dot fauna"></i>', group: () => state.speciesCluster }
];

// Los senderos señalizados (GR, PR y SL) de un parque salen de su trails.geojson (ver
// Tools/build-park-trails.js), no de una lista fija: un parque puede no tener ninguno, uno o casi
// veinte (Carrascoy y El Valle tiene 18 entre el GR-250 y su malla de PR-MU).
function trailFeatures() {
  const trails = state.geo && state.geo.trails;
  return (trails && trails.features) || [];
}

function hasTrails() {
  return trailFeatures().length > 0;
}

// Con uno o dos senderos el código en la etiqueta es la información útil ("Senderos (GR-92)").
// A partir de ahí la lista completa desborda la fila del panel, así que se pasa al recuento: los
// códigos siguen estando, uno a uno, en el popup de cada traza.
const TRAIL_CODES_INLINE = 3;

function trailCodes() {
  return [...new Set(trailFeatures().map(f => {
    const p = f.properties || {};
    return p.codigo || (String(p.name || '').match(/\b(?:GR|PR|SL)[-\s][\w.]+/i) || [''])[0];
  }).filter(Boolean))];
}

function trailsLabel() {
  const count = trailFeatures().length;
  if (!count) return 'Senderos';
  const codes = trailCodes();
  return codes.length && codes.length <= TRAIL_CODES_INLINE
    ? 'Senderos (' + codes.join(' · ') + ')'
    : 'Senderos (' + count + ')';
}

// La muestra deja de ser un único trazo naranja en cuanto el parque mezcla rangos: enseña uno por
// cada tipo presente, en el mismo orden y con el mismo trazo con que se pintan en el mapa, para que
// el panel siga siendo la leyenda de lo que se ve.
function trailsSwatch() {
  const kinds = ['GR', 'PR', 'SL'].filter(k => trailFeatures().some(f => trailKind(f.properties) === k));
  // Envueltos: .layers-row es un flex con gap de 8 px, y sueltos los trazos se separarían tanto
  // que parecerían capas distintas en vez de una sola muestra.
  return '<span class="legend-trails">' + (kinds.length ? kinds : ['GR'])
    .map(k => '<i class="legend-line trail trail-' + k.toLowerCase() + '"></i>').join('') + '</span>';
}

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
  // El mapa del parque solo se ofrece si ese parque trae paquete de teselas; los otros dos necesitan
  // cobertura, así que se etiqueta cuál es el que funciona sin ella.
  const activeBase = activeBaseKind();
  layersPanel.innerHTML = html`
    <section class="layers-section">
    <h4>Mapa base</h4>
    <label class="layers-row"><input type="radio" name="baseLayer" value="osm" ${activeBase === 'osm' ? raw('checked') : ''}> Mapa</label>
    <label class="layers-row"><input type="radio" name="baseLayer" value="pnoa" ${activeBase === 'pnoa' ? raw('checked') : ''}> Satélite (PNOA)</label>
    ${hasParkBaseLayer() ? html`<label class="layers-row"><input type="radio" name="baseLayer" value="parque" ${activeBase === 'parque' ? raw('checked') : ''}> Mapa del parque <span class="layers-hint">sin conexión</span></label>` : ''}
    </section>
    <section class="layers-section">
    <h4>Capas</h4>
    ${OVERLAYS.filter(o => !o.visible || o.visible()).map(o => html`<label class="layers-row"><input type="checkbox" data-overlay="${o.key}" ${map.hasLayer(o.group()) ? raw('checked') : ''}>${raw(typeof o.swatch === 'function' ? o.swatch() : o.swatch)}${typeof o.label === 'function' ? o.label() : o.label}</label>`)}
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

  // El panel de capas también es un paso deshacible: se abre encima de todo, así que «atrás»
  // (o Escape) lo cierra antes que ninguna otra cosa. Ver Js/nav.js.
  const closePanel = () => {
    layersPanel.hidden = true;
    layersToggle.setAttribute('aria-expanded', 'false');
  };

  layersToggle.addEventListener('click', () => {
    const open = layersPanel.hidden;
    if (!open) {
      if (window.NaturDexNav && window.NaturDexNav.close('layers')) return;
      closePanel();
      return;
    }
    layersPanel.hidden = false;
    layersToggle.setAttribute('aria-expanded', 'true');
    refreshLayersPanel(); // reconstruir al abrir: refleja el estado real de cada capa
    if (window.NaturDexNav) window.NaturDexNav.open('layers', closePanel);
  });

  layersPanel.addEventListener('change', event => {
    const base = event.target.closest('input[name="baseLayer"]');
    if (base) {
      // `true`: la elección es del usuario, así que al recuperar cobertura no se le deshace.
      applyBaseChoice(base.value, true);
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
