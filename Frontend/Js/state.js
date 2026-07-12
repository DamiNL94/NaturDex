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
export const ACHIEVEMENT_NAME = '¡Más aguileño que un pijo lobo!';
export const DEFAULT_PARK_SLUG = 'cabo-cope-puntas-calnegre';
export const PARK_INDEX_PATH = 'Data/parks-index.json';

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
  markers: new Map(),
  poiMarkers: new Map(),
  habitatLayers: new Map(),
  seenSpecies: new Set(),
  seenPois: new Set(),
  sightings: new Map(),
  progressReady: false,
  parkWasComplete: false,
  activeParkSlug: null,
  manifest: null,
  dataFromCache: false,
  userId: null,
  userName: null,
  explorerActive: false,
  explorerWatchId: null,
  userMarker: null,
  userAccuracyCircle: null
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
  const poisComplete = poisTotal > 0 && poisSeen === poisTotal;
  const parkComplete = habitatsComplete && poisComplete;
  return { speciesTotal, speciesSeen, habitatProgress, poisTotal, poisSeen, parkComplete };
}

// --- Selectores: mapa -----------------------------------------------------------------------------
export function speciesLatLng(species) {
  // La ubicación del avistamiento la aporta el GPS del móvil; si no la hay, se usa la coordenada
  // representativa del catálogo como aproximación.
  const s = state.sightings.get(species.id);
  return s ? [s.lat, s.lng] : species.coordinates;
}
