// ================================================================================================
// state.js — estado de la aplicación, constantes y selectores derivados.
// ------------------------------------------------------------------------------------------------
// Módulo ES importado por app.js (y por los futuros render.js/map.js). Aquí vive la única fuente
// de verdad del frontend: el objeto `state` (mutable; los módulos lo importan y lo leen/escriben
// directamente) y los "selectores": funciones puras que derivan datos del estado sin tocarlo
// (filtros del catálogo, progreso, completitud de hábitats…). Nada de DOM ni de Leaflet aquí,
// salvo que a `state` se le cuelgan capas Leaflet creadas en otros módulos.
// ================================================================================================

import { normalize } from './util.js';

// --- Constantes de la aplicación ----------------------------------------------------------------
export const API_BASE = '../Backend/Api';
// Logro final de un parque (todos los hábitats y todos los puntos de interés, verificados en campo).
// Antes era un guiño local de Águilas ("¡Más aguileño que un pijo lobo!"); con el catálogo creciendo
// a espacios de toda la Región, el nombre tenía que dejar de hablar de una sola comarca.
export const ACHIEVEMENT_NAME = 'Guardián del parque';
export const DEFAULT_PARK_SLUG = 'cabo-cope-puntas-calnegre';
export const PARK_INDEX_PATH = 'Data/parks-index.json';
export const ACHIEVEMENTS_CATALOG_PATH = 'Data/achievements.json';

// --- Estado mutable -------------------------------------------------------------------------------
export const state = {
  data: null,
  filter: 'all',
  query: '',
  selectedId: null,
  view: 'catalog',
  catalogMode: 'habitats',
  habitatFocus: null,
  detailMode: 'habitat',
  selectedHabitatId: null,
  // Punto de interés cuya ficha se muestra en el panel de detalle (detailMode='poi'). Los POIs
  // tenían su información en un globo del mapa; ahora comparten el mismo sitio que el resto de
  // fichas, así que necesitan su propia selección.
  selectedPoiId: null,
  // Nombre científico de la invasora cuya ficha se muestra en el panel de detalle (detailMode='invasora').
  selectedInvasora: null,
  markers: new Map(),
  poiMarkers: new Map(),
  habitatLayers: new Map(),
  hiddenHabitats: new Set(),
  seenSpecies: new Set(),
  seenPois: new Set(),
  sightings: new Map(),
  // Cuándo se marcó cada cosa: { 'species:12': ISO, 'poi:mirador': ISO }. No es adorno: cruzar esa
  // hora con las visitas verificadas al parque (presence.js) es lo que decide si una marca cuenta
  // para los logros o se queda en el cuaderno personal. La sella el servidor en cada POST.
  markedAt: {},
  progressReady: false,
  parkWasComplete: false,
  activeParkSlug: null,
  // Nivel de dato del parque activo, tomado del `status` de parks-index.json:
  //   'full'  → status "available": catálogo completo (hábitats, especies, POIs).
  //   'basic' → status "basic": ficha base (límite oficial + Red Natura 2000), sin catálogo.
  // El frontend usa esto para no enseñar catálogos vacíos ni contadores a cero sin explicación.
  parkLevel: 'full',
  manifest: null,
  dataFromCache: false,
  userId: null,
  userName: null,
  explorerActive: false,
  explorerWatchId: null,
  userMarker: null,
  userAccuracyCircle: null,
  // Progreso de CUENTA (ámbito estatal, por encima del progreso por parque de arriba). Lo llena
  // achievements.js: `totals` son los agregados (especies estatales, parques visitados...) y
  // `achievements` es un Map id -> { unlockedAt, celebratedAt, context }. `ready` indica que ya se
  // cargó al menos una vez (local u online) y la rejilla de logros puede pintarse sin parpadeo.
  account: { totals: null, achievements: new Map(), ready: false, visits: [] }
};

// --- Selectores: catálogo -------------------------------------------------------------------------
export function getFilteredSpecies() {
  return state.data.species.filter(species => {
    const matchesFilter = state.filter === 'all'
      || (state.filter === 'seen' && state.seenSpecies.has(species.id))
      || species.kingdom === state.filter;
    const matchesHabitat = !state.habitatFocus || (species.habitatIds || []).includes(state.habitatFocus);
    const text = normalize([species.commonName, species.scientificName, species.group, species.habitat].join(' '));
    return matchesFilter && matchesHabitat && text.includes(normalize(state.query));
  });
}

// --- Catálogo organizado por hábitat: se navega primero por hábitat (donde viven las especies) y
// solo al entrar en uno se muestran sus fichas. Es más fácil de recorrer que una lista plana de
// 78 especies, y refuerza la idea de que cada especie pertenece a un ecosistema concreto.
export function getFilteredHabitats() {
  const q = normalize(state.query);
  return (state.data.habitats || []).filter(h => {
    if (!q) return true;
    return normalize([h.name, h.code, h.type].join(' ')).includes(q);
  });
}

// --- Selectores: identidad de especie (progreso compartido entre hábitats) ------------------------
// Una misma especie puede vivir en varios hábitats del parque. Ya sea modelada como una sola ficha
// con varios hábitats (relación N:M) o como fichas separadas por hábitat, el nombre científico es su
// identidad real: marcarla vista debe reflejarse en TODAS sus apariciones dentro del parque. La clave
// de agrupación es el nombre científico normalizado (misma normalización que el buscador).
export function speciesGroupKey(species) {
  return species ? normalize(species.scientificName || '') : '';
}

// Ids de todas las especies del parque que representan la MISMA especie que la dada (incluida ella).
// Si no tiene nombre científico, se agrupa solo consigo misma (no se funde con otras sin nombre).
export function relatedSpeciesIds(speciesId) {
  const all = (state.data && state.data.species) || [];
  const target = all.find(s => s.id === speciesId);
  const key = speciesGroupKey(target);
  if (!target || !key) return [speciesId];
  return all.filter(s => speciesGroupKey(s) === key).map(s => s.id);
}

// --- Selectores: hábitats y progreso --------------------------------------------------------------
export function habitatSpeciesSeenCount(habitat) {
  return (habitat.speciesIds || []).filter(id => state.seenSpecies.has(id)).length;
}

// Superficie del hábitat dentro del parque, si se conoce (de los recintos del INB). Devuelve '' si no.
export function habitatAreaLabel(habitat) {
  const ha = state.geo && state.geo.habitatArea ? state.geo.habitatArea[habitat.id] : null;
  if (typeof ha !== 'number') return '';
  return ha >= 100 ? Math.round(ha).toLocaleString('es-ES') + ' ha' : ha.toLocaleString('es-ES') + ' ha';
}

export function isHabitatComplete(habitat) {
  const total = (habitat.speciesIds || []).length;
  return total > 0 && habitatSpeciesSeenCount(habitat) === total;
}

export function computeProgress() {
  const species = state.data.species || [];
  const habitats = state.data.habitats || [];
  const pois = state.data.pointsOfInterest || [];
  const speciesTotal = species.length;
  const speciesSeen = state.seenSpecies.size;
  const habitatProgress = habitats.map(h => {
    const total = (h.speciesIds || []).length;
    const seen = habitatSpeciesSeenCount(h);
    return { id: h.id, name: h.name, code: h.code, color: h.color, total, seen, complete: total > 0 && seen === total };
  });
  const poisTotal = pois.length;
  const poisSeen = pois.filter(p => state.seenPois.has(p.id)).length;
  const habitatsComplete = habitatProgress.length > 0 && habitatProgress.every(h => h.complete);
  const habitatsCompleteCount = habitatProgress.filter(h => h.complete).length;
  const poisComplete = poisTotal > 0 && poisSeen === poisTotal;
  const parkComplete = habitatsComplete && poisComplete;
  // Colección de aves de la ZEPA (Red Natura 2000): logro propio, ya que no cuelgan de hábitats.
  const zepaSpecies = species.filter(s => s.zepaSiteCode);
  const zepaTotal = zepaSpecies.length;
  const zepaSeen = zepaSpecies.filter(s => state.seenSpecies.has(s.id)).length;
  return {
    speciesTotal, speciesSeen, habitatProgress, habitatsCompleteCount, poisTotal, poisSeen,
    poisComplete, zepaTotal, zepaSeen, parkComplete
  };
}

// --- Selectores: mapa -----------------------------------------------------------------------------
export function speciesLatLng(species) {
  // La ubicación del avistamiento la aporta el GPS del móvil; si no la hay, se usa la coordenada
  // representativa del catálogo como aproximación.
  const s = state.sightings.get(species.id);
  return s ? [s.lat, s.lng] : species.coordinates;
}
