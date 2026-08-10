// ================================================================================================
// ./map/capas.js — zonas protegidas, senderos y zonas de hábitat: pintado, resaltado y visibilidad por hábitat y por grupo
// ------------------------------------------------------------------------------------------------
// Trozo de map.js. El índice de la carpeta está en Frontend/Js/CLAUDE.md.
// ================================================================================================

import { audioBlock } from '../audio.js';
import { PATTERN_TILES, habitatGroupById, habitatGroupId, habitatsOfGroup } from '../habitat-groups.js';
import { isHabitatComplete, state } from '../state.js';
import { html } from '../util.js';
import { POPUP_OPTIONS, fitOn } from './camara.js';
import { PANES, handlers, map } from './core.js';
import { PAPER, SVG_NS, clipPathsToSelf, eachPath, svgDefs } from './tramas.js';

// --- Zonas protegidas y senderos (geometría oficial IMIDA/CARM) ------------------------------------
// Plano 1 · zonas protegidas: borde + banda interior, sin relleno. Un espacio protegido no es una
// mancha de color sino un LÍMITE ("a partir de aquí, esto está protegido"), y rellenarlo enturbiaba
// las tramas de hábitat y la ortofoto que hay debajo. El parque lleva casing crema (halo a los dos
// lados que despega el borde de cualquier fondo); LIC y ZEPA, banda hacia dentro, que además dice de
// qué lado del trazo está la figura sin necesidad de leyenda.
const PROTECTED_STYLES = {
  parque: { color: '#1F4D34', weight: 2.5, fill: false, casing: { color: PAPER, weight: 7, opacity: .7 } },
  lic:    { color: '#2E6D8E', weight: 1.5, opacity: .8, dashArray: '6 4', fill: false, band: { weight: 12, opacity: .10 } },
  zepa:   { color: '#4A3B2A', weight: 1.5, opacity: .7, dashArray: '1 5', lineCap: 'round', fill: false, band: { weight: 12, opacity: .08 } }
};

function protectedPopup(figura, nombre, codigo, ha) {
  return String(html`<strong>${nombre}</strong><br><span class="popup-type">${figura}${codigo ? ' · ' + codigo : ''}</span>${ha ? html`<p>${Math.round(ha).toLocaleString('es-ES')} ha</p>` : ''}`);
}

function addProtectedLayer(group, geojson, style, popupFor) {
  if (!geojson) return;
  const { casing, band, ...line } = style;
  const under = casing || band;
  // POPUP_OPTIONS: sin `autoPan`, porque el globo lo coloca revealPopup() dentro de la franja de
  // mapa que de verdad se ve (ver la sección de encuadre).
  const bindPopup = (feature, layer) => layer.bindPopup(popupFor(feature.properties || {}), POPUP_OPTIONS);
  // Casing y banda son el mismo recurso —un trazo ancho por debajo del borde fino— con dos
  // acabados: el casing es crema y sobresale a los dos lados; la banda va del color de la figura y
  // se recorta contra el polígono, así que solo se ve su mitad de dentro. Va en su propia capa y se
  // da de alta ANTES que el borde: dentro de un plano el orden de pintado es el de alta.
  if (under) {
    const underLayer = L.geoJSON(geojson, {
      style: {
        color: under.color || line.color,
        weight: under.weight,
        opacity: under.opacity == null ? 1 : under.opacity,
        fill: false, lineJoin: 'round', lineCap: 'round', pane: PANES.protected
      },
      // El borde son 1,5-2,5 px: sin esto habría que acertarle al píxel para abrir su ficha. La capa
      // de debajo es ancha y lleva el mismo popup, así que hace de zona de toque.
      onEachFeature: bindPopup
    });
    if (band) underLayer.on('add', () => clipPathsToSelf(underLayer));
    underLayer.addTo(group);
  }
  L.geoJSON(geojson, {
    style: { ...line, lineJoin: 'round', pane: PANES.protected },
    onEachFeature: bindPopup
  }).addTo(group);
}

// Plano 3 · senderos: casing crema + núcleo. Los senderos vienen en tres rangos de la red señalizada
// (GR, PR y SL) y un parque puede tener casi veinte a la vez: pintados todos del mismo naranja
// resultaban una maraña en la que no se distinguía la travesía que cruza la sierra del sendero local
// de una hora. Se mantienen dentro de la misma familia de color —siguen leyéndose como "senderos",
// que es una sola capa— y se separan por grosor y trazo, que es justo la jerarquía que tienen sobre
// el terreno. `casing` es el ancho de la banda crema que va debajo: separa la traza del hábitat, del
// límite o de la ortofoto sobre los que cruza sin necesidad de subirle el contraste al color.
export const TRAIL_STYLES = {
  GR: { color: '#8A3B19', weight: 4.5, casing: 9 },
  PR: { color: '#C4762A', weight: 3.5, casing: 8 },
  SL: { color: '#C4762A', weight: 3,   casing: 7.5, dashArray: '0.1 7', lineCap: 'round' }
};

export function trailKind(properties) {
  const m = String((properties && (properties.codigo || properties.name)) || '').match(/\b(GR|PR|SL)\b/i);
  return m ? m[1].toUpperCase() : 'GR';
}

function trailStyle(feature) {
  return Object.assign(
    { opacity: 0.95, lineJoin: 'round', lineCap: 'round', pane: PANES.trails },
    TRAIL_STYLES[trailKind(feature.properties)] || TRAIL_STYLES.GR
  );
}

function trailPopup(p) {
  // `longitudKm` son los kilómetros DENTRO del parque, no los de la ruta completa: se rotula
  // así para no dar a entender que el GR-92 mide 15 km. `homologado` solo se afirma cuando
  // consta en el catálogo de la FMRM (ver Tools/build-park-trails.js), nunca se niega.
  const km = typeof p.longitudKm === 'number'
    ? p.longitudKm.toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' km dentro del parque'
    : '';
  // Las rutas (senderos) admiten audioguía: propiedades `audio`/`audioTranscript` en el
  // feature del trails.geojson (mismas claves que hábitats y POIs).
  return String(html`<strong>${p.name || 'Sendero'}</strong><br><span class="popup-type">${p.tipo || ''}${km ? ' · ' + km : ''}</span>${p.homologado ? html`<span class="badge">homologado</span>` : ''}${p.descripcion ? html`<p>${p.descripcion}</p>` : ''}${audioBlock(p, 'Audioguía de la ruta')}${p.source ? html`<small>${p.source}</small>` : ''}`);
}

export function renderTrails() {
  if (!state.geo || !state.trailLayer) return;
  state.trailLayer.clearLayers();
  if (!state.geo.trails) return;
  const bindPopup = (feature, layer) => layer.bindPopup(trailPopup(feature.properties || {}), POPUP_OPTIONS);
  // El casing va en su propia capa y se da de alta primero, para quedar por debajo de TODOS los
  // núcleos: si fueran pares casing+núcleo sendero a sendero, el casing de uno taparía el núcleo del
  // que cruza por debajo. Copia el punteado del núcleo (el SL es una fila de puntos, y su casing
  // tiene que ser la misma fila, más gruesa, para que cada punto salga con su aro crema).
  L.geoJSON(state.geo.trails, {
    style: feature => {
      const core = trailStyle(feature);
      return {
        color: PAPER, weight: core.casing || core.weight + 4, opacity: .85,
        dashArray: core.dashArray, lineJoin: 'round', lineCap: core.lineCap || 'round',
        fill: false, pane: PANES.trails
      };
    },
    // Un sendero es una línea de 3-4,5 px: el casing es más ancho y lleva el mismo popup, así que
    // hace de zona de toque (importante en móvil, que es donde se usa esto andando).
    onEachFeature: bindPopup
  }).addTo(state.trailLayer);
  L.geoJSON(state.geo.trails, {
    style: trailStyle,
    onEachFeature: bindPopup,
    // La atribución de las trazas NO puede depender de la capa base. Salen de OpenStreetMap (ODbL,
    // ver Tools/build-park-trails.js) y hasta ahora el único crédito a OSM lo ponían el callejero y
    // el paquete de Protomaps: con «Satélite (PNOA)» activo el control pasaba a acreditar solo al
    // IGN y los senderos se pintaban sin mencionar a OSM. Va aquí, en la capa, para que Leaflet la
    // dé de alta y de baja con ella y solo se lea cuando hay senderos dibujados. El `source` de
    // cada sendero sigue en su popup: esto es el crédito visible permanente, no lo sustituye.
    attribution: 'Senderos: &copy; OpenStreetMap contributors (ODbL)'
  }).addTo(state.trailLayer);
}

export function renderProtectedAreas() {
  if (!state.geo) return;
  state.parqueLayer.clearLayers();
  state.licLayer.clearLayers();
  state.zepaLayer.clearLayers();
  addProtectedLayer(state.parqueLayer, state.geo.parque, PROTECTED_STYLES.parque,
    // La figura sale de la propiedad `Figura` del propio GeoJSON (Parque Regional, Paisaje Protegido…),
    // no hardcodeada: este módulo es compartido por todos los parques.
    p => protectedPopup(p.Figura || 'Espacio protegido', p.nombre || '', null, p.Hectareas));
  addProtectedLayer(state.licLayer, state.geo.lic, PROTECTED_STYLES.lic,
    p => protectedPopup('LIC (Red Natura 2000)', p.SITE_NAME || 'LIC', p.SITE_CODE, p.HECTARES));
  addProtectedLayer(state.zepaLayer, state.geo.zepa, PROTECTED_STYLES.zepa,
    p => protectedPopup('ZEPA (Red Natura 2000)', p.site_name || 'ZEPA', p.site_code, p.hectares));
}

// --- Zonas de hábitat -------------------------------------------------------------------------------
// Plano 2 · hábitats: trama SVG por GRUPO. Un parque trae hasta veintiún hábitats solapados, y con
// veintiún rellenos planos de color el mapa se convertía en un mosaico opaco en el que ni se leía la
// ortofoto ni se sabía qué había debajo de qué. La trama resuelve las dos cosas: deja pasar el
// fondo y sigue distinguiéndose donde dos hábitats se pisan, porque lo que separa no es el tono
// sino el dibujo.
//
// La trama y la tinta salen del GRUPO del hábitat (habitat-groups.js), que es el mismo con el que
// se ordenan la leyenda y el catálogo: mirando un polígono se sabe de qué entrada del panel viene.
// Dentro de un grupo todos comparten trama —son formaciones parecidas y así se leen como una sola
// familia—, y lo que los separa entre sí es el BORDE, que toma el color propio del hábitat en el
// catálogo. Es justo el reparto que hace falta ahora que el panel enseña un grupo desplegado cada
// vez: entre grupos distingue el dibujo, dentro del grupo distingue el color.
/** Deja el <pattern> de una trama en los <defs> del svg de ese path y devuelve su id. */
function ensurePattern(path, texture) {
  const tile = PATTERN_TILES[texture.pattern];
  const defs = tile && svgDefs(path);
  if (!defs) return null;
  const id = 'tx-' + texture.pattern;
  if (!defs.querySelector('[id="' + id + '"]')) {
    const pattern = document.createElementNS(SVG_NS, 'pattern');
    pattern.setAttribute('id', id);
    pattern.setAttribute('width', tile.w);
    pattern.setAttribute('height', tile.h);
    // userSpaceOnUse y no objectBoundingBox: la trama es simbología, no textura del terreno, y su
    // paso tiene que medir lo mismo en pantalla en un hábitat de 3 ha y en uno de 3.000.
    pattern.setAttribute('patternUnits', 'userSpaceOnUse');
    pattern.innerHTML = '<rect width="' + tile.w + '" height="' + tile.h + '" fill="' + texture.ink
      + '" fill-opacity="' + texture.bgOpacity + '"/>' + tile.marks(texture.ink);
    defs.appendChild(pattern);
  }
  return id;
}

/**
 * Apunta el relleno de la capa a su trama. fill-opacity vuelve a 1 porque la transparencia ya va
 * dentro de la propia trama (fondo al 5-7 %, trazos al 45-55 %): dejar el 0,16 del relleno plano
 * la borraría. Si algo fallase —navegador sin <pattern>, capa sin path todavía— se queda el relleno
 * de color de siempre, que sigue estando en las opciones de la capa.
 */
function paintTexture(layer) {
  const texture = layer._naturdexTexture;
  if (!texture) return;
  eachPath(layer, path => {
    const id = ensurePattern(path, texture);
    if (!id) return;
    path.setAttribute('fill', 'url(#' + id + ')');
    path.setAttribute('fill-opacity', '1');
  });
}

// Tocar un hábitat abre su ficha (la misma que el catálogo), no un globo propio: ahí ya está la
// superficie, el progreso, las especies y el botón de "ver sus especies", con sitio para leerlo.
function bindHabitatTap(layer, habitat) {
  if (!L.Browser.touch && layer.bindTooltip) layer.bindTooltip(habitat.name, { sticky: true });
  layer.on('click', event => {
    // Sin esto, el toque sigue subiendo hasta el mapa: Leaflet lo trataría como "clic en el mapa" y
    // cerraría la ficha que se acaba de pedir.
    L.DomEvent.stopPropagation(event);
    if (handlers.onSelectHabitat) handlers.onSelectHabitat(habitat.id);
  });
}

export function renderHabitatZones() {
  state.habitatGroup.clearLayers();
  state.habitatLayers.clear();
  (state.data.habitats || []).forEach(habitat => {
    const complete = isHabitatComplete(habitat);
    const geom = state.geo && state.geo.habitatGeom ? state.geo.habitatGeom[habitat.id] : null;
    // La trama (y su velo de fondo) es la del GRUPO; el borde, el color propio del hábitat en el
    // catálogo. Así el plano se lee en dos niveles: el dibujo dice de qué grupo es el polígono —el
    // mismo que encabeza la leyenda y el catálogo— y el filete distingue un hábitat de otro dentro
    // de ese grupo, que es justo lo que hace falta cuando el panel deja desplegado un grupo entero.
    // El oro del hábitat completo manda sobre todo lo demás: es un estado, no una identidad.
    const texture = habitatGroupById(habitatGroupId(habitat));
    const baseStyle = {
      color: complete ? '#d89b30' : (habitat.color || texture.ink),
      weight: complete ? 3 : 2,
      opacity: complete ? 1 : 0.9, // el color del catálogo es más claro que la tinta del grupo: aguanta casi opaco
      fillColor: habitat.color || '#2f6f4e',
      fillOpacity: 0.16,
      pane: PANES.habitats
    };
    let layer;
    if (geom) {
      // Geometría real (polígono) servida desde el habitats.geojson del parque (ver manifiesto).
      layer = L.geoJSON(geom, { style: baseStyle });
    } else if (habitat.coordinates) {
      // Sin polígono todavía: círculo aproximado en la posición representativa del hábitat.
      layer = L.circle(habitat.coordinates, { radius: 420, ...baseStyle });
    } else {
      return;
    }
    // Se guarda el estilo base para poder deshacer el resaltado "estás pisando este hábitat".
    layer._naturdexBaseStyle = baseStyle;
    layer._naturdexTexture = texture;
    bindHabitatTap(layer, habitat);
    // Desde 'add' y no tras el addTo: Leaflet crea un <path> nuevo cada vez que la capa entra al
    // mapa, así que la trama tiene que volver a ponerse también cuando se reactiva desde el panel.
    layer.on('add', () => paintTexture(layer));
    // La visibilidad por hábitat la gobierna el panel de capas (layers.js): la capa se crea
    // siempre (la ficha y el zoom desde otras vistas la necesitan) pero solo se añade al grupo
    // si el usuario no la tiene apagada.
    if (!state.hiddenHabitats.has(habitat.id)) layer.addTo(state.habitatGroup);
    state.habitatLayers.set(habitat.id, layer);
  });
  // Los re-renders (marcar especie vista) recrean las capas: se re-aplica el resaltado vigente.
  if (highlightedHabitatId) applyHighlight(highlightedHabitatId);
}

// --- Resaltado del hábitat que el usuario está pisando (modo explorador) ---------------------------
// Los límites entre hábitats son difíciles de leer para quien no es experto: cuando el GPS sitúa
// al usuario dentro de un hábitat, su polígono se engrosa y rellena más para que el "dónde estoy"
// sea evidente, y se atenúa al salir.
let highlightedHabitatId = null;

function applyHighlight(habitatId) {
  const layer = state.habitatLayers.get(habitatId);
  if (!layer || !layer._naturdexBaseStyle) return;
  // Con relleno de trama el resaltado no puede ser "más opacidad": lo lleva el borde, que se
  // engruesa. setStyle reescribe el fill desde las opciones, así que la trama se repinta detrás.
  layer.setStyle({ ...layer._naturdexBaseStyle, weight: 5, opacity: 1, fillOpacity: 0.32 });
  paintTexture(layer);
  if (layer.bringToFront) layer.bringToFront();
}

export function highlightHabitat(habitatId) {
  if (highlightedHabitatId && highlightedHabitatId !== habitatId) {
    const prev = state.habitatLayers.get(highlightedHabitatId);
    if (prev && prev._naturdexBaseStyle) { prev.setStyle(prev._naturdexBaseStyle); paintTexture(prev); }
  }
  highlightedHabitatId = habitatId || null;
  if (highlightedHabitatId) applyHighlight(highlightedHabitatId);
}

export function setHabitatVisible(habitatId, visible) {
  const layer = state.habitatLayers.get(habitatId);
  if (visible) state.hiddenHabitats.delete(habitatId);
  else state.hiddenHabitats.add(habitatId);
  if (!layer) return;
  if (visible) { if (!state.habitatGroup.hasLayer(layer)) layer.addTo(state.habitatGroup); }
  else state.habitatGroup.removeLayer(layer);
}

// Aísla un hábitat en el mapa: apaga todos los demás y deja visible solo este (los polígonos se
// solapan y vistos todos a la vez confunden). El resto queda en state.hiddenHabitats y el usuario
// puede reactivarlos desde el panel de capas ("Todos" o cada casilla). Lo llama el catálogo al
// seleccionar un hábitat; el panel de capas hace lo mismo con su botón "Solo".
export function soloHabitat(habitatId) {
  (state.data.habitats || []).forEach(h => setHabitatVisible(h.id, h.id === habitatId));
  if (!map.hasLayer(state.habitatGroup)) state.habitatGroup.addTo(map);
}

// --- Visibilidad por GRUPO de hábitats -------------------------------------------------------------
// Es la herramienta de verdad contra el solapamiento: los polígonos que se pisan suelen ser vecinos
// del mismo tipo (tres dunas encadenadas, dos saladares…), así que encender y apagar por grupos deja
// el mapa legible con un solo gesto, en vez de con veintiuna casillas.

/** Enciende o apaga de golpe todos los hábitats de un grupo. */
export function setHabitatGroupVisible(groupId, visible) {
  habitatsOfGroup(groupId).forEach(h => setHabitatVisible(h.id, visible));
  if (visible && !map.hasLayer(state.habitatGroup)) state.habitatGroup.addTo(map);
}

/** Aísla un grupo: deja visibles sus hábitats y apaga los de todos los demás grupos. */
export function soloHabitatGroup(groupId) {
  (state.data.habitats || []).forEach(h => setHabitatVisible(h.id, habitatGroupId(h) === groupId));
  if (!map.hasLayer(state.habitatGroup)) state.habitatGroup.addTo(map);
}

/** Encuadra el mapa sobre todos los hábitats de un grupo (los que tengan geometría cargada). */
export function focusHabitatGroupOnMap(groupId) {
  let bounds = null;
  habitatsOfGroup(groupId).forEach(h => {
    const layer = state.habitatLayers.get(h.id);
    if (!layer || !layer.getBounds) return;
    const b = layer.getBounds();
    if (!b || !b.isValid()) return;
    bounds = bounds ? bounds.extend(b) : L.latLngBounds(b.getSouthWest(), b.getNorthEast());
  });
  if (bounds) fitOn(bounds, { maxZoom: 14 });
}
