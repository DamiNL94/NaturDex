// ================================================================================================
// habitat-groups.js — grupos de hábitats: la agrupación única que comparten mapa, leyenda y catálogo.
// ------------------------------------------------------------------------------------------------
// EL PROBLEMA QUE RESUELVE
// Un parque trae entre once y veintiún hábitats de interés comunitario. Vistos como UNA lista plana
// —en el panel de capas, en la leyenda y en el catálogo— no hay forma de recorrerlos con tranquilidad
// ni de gestionar el solapamiento en el mapa: los polígonos se pisan unos a otros y encender o apagar
// veintiuna casillas de una en una no es manejable, menos aún en un móvil en el campo.
//
// LA AGRUPACIÓN
// Los hábitats se reparten en SIETE grupos de características similares, ordenados del mar hacia
// dentro. El criterio es el código HIC (anexo I de la Directiva 92/43/CEE), que ya agrupa por grandes
// tipos, y solo si el hábitat viniera sin código se recurre al campo `type` del catálogo, que es texto
// libre. Cada grupo lleva su TRAMA y su TINTA: son las que pinta el mapa (map.js), las que enseña la
// leyenda (layers.js) y las que encabezan el catálogo (render.js), así que el mismo hábitat se
// reconoce igual en los tres sitios.
//
// Este módulo es puro: no toca el DOM ni Leaflet. Los tres consumidores importan de aquí.
// ================================================================================================

import { state } from './state.js';

// Minúsculas y sin diacríticos: el campo `type` del catálogo es texto libre ("Litoral", "Salino"…)
// y se compara por trozos. `normalize` de util.js solo baja a minúsculas (lo que necesita el
// buscador, que compara con lo que el usuario teclea), así que aquí hace falta el paso de más.
function plain(value) {
  return String(value ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// --- Los siete grupos -----------------------------------------------------------------------------
// `pattern` es la tesela de PATTERN_TILES (abajo); `ink` la tinta del grupo, elegida por el MEDIO
// (verde vegetación, marrón mineral, azul agua) y no por el capricho de cada hábitat; `bgOpacity` el
// velo de fondo con el que la trama se posa sobre la ortofoto sin taparla.
export const HABITAT_GROUPS = [
  {
    id: 'litoral',
    name: 'Costa y dunas',
    short: 'Costa',
    description: 'Acantilados, arribazones y arenales del borde del mar.',
    pattern: 'waveDry', ink: '#4A3B2A', bgOpacity: .05
  },
  {
    id: 'salino',
    name: 'Saladares y estepas salinas',
    short: 'Saladares',
    description: 'Suelos con sal: saladares, albardinales y matorrales halófilos.',
    pattern: 'hatchDash', ink: '#2E6D8E', bgOpacity: .05
  },
  {
    id: 'agua',
    name: 'Ríos, humedales y riberas',
    short: 'Agua dulce',
    description: 'Cauces y ramblas con agua, humedales y bosques de galería.',
    pattern: 'waveWet', ink: '#2E6D8E', bgOpacity: .07
  },
  {
    id: 'matorral',
    name: 'Matorrales y tomillares',
    short: 'Matorral',
    description: 'Matorral mediterráneo: sabinares, azufaifares, coscojares y tomillares.',
    pattern: 'hatch45', ink: '#1F4D34', bgOpacity: .07
  },
  {
    id: 'pastos',
    name: 'Pastizales y prados',
    short: 'Pastizales',
    description: 'Herbazales y pastos: subestepas de gramíneas y prados sobre suelo somero.',
    pattern: 'dots', ink: '#1F4D34', bgOpacity: .05
  },
  {
    id: 'roquedo',
    name: 'Roquedos, cuevas y canchales',
    short: 'Roquedos',
    description: 'Paredes de roca, pedreras y cuevas, con su flora de grietas.',
    pattern: 'grid', ink: '#4A3B2A', bgOpacity: .06
  },
  {
    id: 'bosque',
    name: 'Bosques',
    short: 'Bosques',
    description: 'Masas arboladas: pinares, encinares y carrascales.',
    pattern: 'hatch-45', ink: '#1F4D34', bgOpacity: .07
  }
];

const GROUPS_BY_ID = new Map(HABITAT_GROUPS.map(g => [g.id, g]));
export const DEFAULT_GROUP_ID = 'matorral';

/** Definición de un grupo por su id (nunca devuelve undefined: cae en el grupo por defecto). */
export function habitatGroupById(id) {
  return GROUPS_BY_ID.get(id) || GROUPS_BY_ID.get(DEFAULT_GROUP_ID);
}

// Bosques de GALERÍA: van con el agua, no con los bosques, porque es el río lo que los explica y es
// junto al cauce donde se ven. Lista explícita y no el prefijo "91"/"92": en la nomenclatura HIC esos
// dos dígitos los comparten con bosques de ladera que no tienen nada de ribereño —9240 (robledales
// de Quercus faginea), 9120, 9180…—, y agruparlos por el prefijo mandaba un robledal al grupo del
// agua. Lo que distingue a los de galería es la LETRA en la tercera posición, pero tampoco todas
// (91AA es un quejigar), así que se nombran uno a uno.
const GALLERY_CODES = new Set(['91B0', '91E0', '91F0', '92A0', '92B0', '92C0', '92D0']);

/**
 * Grupo al que pertenece un hábitat. Por código HIC: 1x costeros y salinos (los acantilados y las
 * arribazones se leen como costa; las marismas y estepas salinas, como saladar), 2x dunas, 3x aguas
 * continentales, 4x-5x matorrales, 6x pastizales, 7x turberas, 8x roquedos y 9x bosques (con los
 * bosques de galería de GALLERY_CODES apartados al grupo del agua).
 */
export function habitatGroupId(habitat) {
  const code = String((habitat && habitat.code) || '').toUpperCase();
  if (GALLERY_CODES.has(code)) return 'agua';
  if (code.startsWith('9')) return 'bosque';
  if (code.startsWith('3') || code.startsWith('7')) return 'agua';
  if (code.startsWith('2') || code === '1210' || code === '1220') return 'litoral';
  if (code === '1230' || code === '1240') return 'litoral';   // acantilados marinos
  if (code.startsWith('1')) return 'salino';                  // 13xx-15xx: marismas y estepas salinas
  if (code.startsWith('4') || code.startsWith('5')) return 'matorral';
  if (code.startsWith('6')) return 'pastos';
  if (code.startsWith('8')) return 'roquedo';
  // NFD + quitar diacríticos: el campo es texto libre del catálogo ("Roquedos", "Salino"…).
  const type = plain(String((habitat && habitat.type) || ''));
  if (type.includes('bosque')) return 'bosque';
  if (type.includes('pasto') || type.includes('prado')) return 'pastos';
  if (type.includes('roqued') || type.includes('rocos') || type.includes('cueva')) return 'roquedo';
  if (type.includes('ribera') || type.includes('fluvial') || type.includes('humedal') || type.includes('rio')) return 'agua';
  if (type.includes('salin') || type.includes('salad')) return 'salino';
  if (type.includes('litoral') || type.includes('duna') || type.includes('playa') || type.includes('costa')) return 'litoral';
  return DEFAULT_GROUP_ID;
}

/** Definición del grupo de un hábitat (atajo de habitatGroupById(habitatGroupId(h))). */
export function habitatGroup(habitat) {
  return habitatGroupById(habitatGroupId(habitat));
}

// --- Consultas sobre el parque cargado ------------------------------------------------------------
function allHabitats() {
  return (state.data && state.data.habitats) ? state.data.habitats : [];
}

/** Hábitats del parque que pertenecen a un grupo, en el orden del catálogo. */
export function habitatsOfGroup(groupId, habitats) {
  return (habitats || allHabitats()).filter(h => habitatGroupId(h) === groupId);
}

/** Grupo de un hábitat por su id (el del catálogo, no el del grupo). '' si no existe. */
export function groupIdOfHabitat(habitatId) {
  const habitat = allHabitats().find(h => h.id === habitatId);
  return habitat ? habitatGroupId(habitat) : '';
}

/**
 * Los grupos PRESENTES en el parque cargado, en el orden canónico (del mar hacia dentro) y con sus
 * hábitats dentro. Los grupos vacíos no salen: un parque de interior no tiene por qué enseñar una
 * entrada de "Costa y dunas" que nunca va a poder abrir.
 */
export function groupedHabitats(habitats) {
  const list = habitats || allHabitats();
  return HABITAT_GROUPS
    .map(group => ({ group, habitats: list.filter(h => habitatGroupId(h) === group.id) }))
    .filter(entry => entry.habitats.length > 0);
}

// --- Tramas ---------------------------------------------------------------------------------------
// La tesela de cada trama. Vive aquí (y no en map.js) porque la usan los dos: el mapa para rellenar
// los polígonos y la leyenda/el catálogo para dibujar la muestra del grupo, y tienen que ser el mismo
// dibujo o la muestra dejaría de explicar el mapa. Las diagonales se dibujan con las dos esquinas
// repetidas (los tramos fuera de la tesela) para que el rayado sea continuo al repetirse.
// `alpha` multiplica la opacidad de los trazos. Sobre el mapa vale 1: la trama tiene que dejar ver
// la ortofoto que hay debajo. En la muestra de la leyenda no hay nada debajo que respetar y esos
// mismos trazos, en un cuadrado de 20 px, se quedaban en un gris casi vacío: allí se sube.
export const PATTERN_TILES = {
  hatch45:    { w: 8,  h: 8,  marks: (ink, a) => mark('M0 8 L8 0 M-1 1 L1 -1 M7 9 L9 7', ink, 1, .55, null, a) },
  'hatch-45': { w: 8,  h: 8,  marks: (ink, a) => mark('M0 0 L8 8 M-1 7 L1 9 M7 -1 L9 1', ink, 1, .55, null, a) },
  grid:       { w: 9,  h: 9,  marks: (ink, a) => mark('M0 0 L0 9 M0 0 L9 0', ink, .8, .45, null, a) },
  dots:       { w: 7,  h: 7,  marks: (ink, a) => '<circle cx="3.5" cy="3.5" r="1.1" fill="' + ink + '" fill-opacity="' + alpha(.5, a) + '"/>' },
  waveWet:    { w: 12, h: 8,  marks: (ink, a) => mark('M0 6 q3 -3 6 0 t6 0', ink, 1, .55, null, a) },
  waveDry:    { w: 12, h: 8,  marks: (ink, a) => mark('M0 6 q3 -3 6 0 t6 0', ink, 1, .45, '3 2.5', a) },
  hatchDash:  { w: 8,  h: 8,  marks: (ink, a) => mark('M0 8 L8 0 M-1 1 L1 -1 M7 9 L9 7', ink, 1, .5, '2.5 2.5', a) }
};

function alpha(opacity, factor) {
  return Math.min(1, opacity * (factor || 1)).toFixed(2);
}

function mark(d, ink, width, opacity, dash, factor) {
  return '<path d="' + d + '" fill="none" stroke="' + ink + '" stroke-width="' + width + '"'
    + ' stroke-opacity="' + alpha(opacity, factor) + '" stroke-linecap="round"'
    + (dash ? ' stroke-dasharray="' + dash + '"' : '') + '/>';
}

// Cada muestra lleva su propio <pattern> con id único: son SVG sueltos repartidos por la leyenda y el
// catálogo, que se repintan a menudo, y un id compartido dejaría a las demás muestras apuntando a un
// <defs> que ya no está en el documento.
let swatchSeq = 0;

/**
 * Muestra cuadrada de un grupo: su trama, su tinta y su filete, como HTML listo para interpolar.
 * El velo de fondo se sube respecto al del mapa (allí es del 5-7 % para dejar ver la ortofoto): en
 * 22 píxeles y sobre papel blanco, ese velo no se vería y la muestra parecería un cuadro vacío.
 */
export function groupSwatch(group, size = 22) {
  const def = typeof group === 'string' ? habitatGroupById(group) : group;
  const tile = PATTERN_TILES[def.pattern] || PATTERN_TILES.hatch45;
  const id = 'ndsw' + (++swatchSeq);
  return '<svg class="hab-swatch" width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '"'
    + ' aria-hidden="true" focusable="false">'
    + '<defs><pattern id="' + id + '" width="' + tile.w + '" height="' + tile.h + '" patternUnits="userSpaceOnUse">'
    + '<rect width="' + tile.w + '" height="' + tile.h + '" fill="' + def.ink + '" fill-opacity="' + Math.max(def.bgOpacity * 2.4, .12) + '"/>'
    + tile.marks(def.ink, 1.7) + '</pattern></defs>'
    + '<rect x=".75" y=".75" width="' + (size - 1.5) + '" height="' + (size - 1.5) + '" rx="2"'
    + ' fill="url(#' + id + ')" stroke="' + def.ink + '" stroke-opacity=".55"/></svg>';
}
