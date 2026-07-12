// ================================================================================================
// data.js — capa de datos: registro de parques, manifiesto, datos/geo y progreso local-first.
// ------------------------------------------------------------------------------------------------
// Módulo ES importado por app.js. Todo lo que habla con la red o con la caché offline vive aquí:
// nada de DOM ni de Leaflet. Usa el global NaturDexOffline (offline.js, script clásico cargado
// antes) para cachear cada JSON en el dispositivo: con visitar un parque online una vez, sus datos
// y mapas vectoriales quedan disponibles sin conexión.
// ================================================================================================

import { API_BASE, DEFAULT_PARK_SLUG, state } from './state.js';

// --- Registro de parques --------------------------------------------------------------------------
export function resolveActivePark(registry) {
  const wanted = state.activeParkSlug || (registry && registry.defaultPark) || DEFAULT_PARK_SLUG;
  let firstAvailable = null;
  const communities = (registry && registry.communities) || [];
  for (const community of communities) {
    for (const province of (community.provinces || [])) {
      for (const park of (province.parks || [])) {
        if (park.status === 'available' && !firstAvailable) firstAvailable = park;
        if (park.slug === wanted) return park;
      }
    }
  }
  return firstAvailable;
}

export async function loadManifest(parkEntry) {
  const res = await NaturDexOffline.fetchJsonCached(parkEntry.manifest);
  return res.data;
}

// --- Datos del parque (especies, hábitats, POIs) ---------------------------------------------------
export async function loadData(manifest) {
  // 1) Fichero de datos del parque (cacheado para offline).
  const res = await NaturDexOffline.fetchJsonCached(manifest.data);
  state.data = res.data;
  state.dataFromCache = res.fromCache;
  // 2) Si hay backend accesible, sus datos (desde la base de datos) tienen prioridad y refrescan
  //    la copia offline con la versión más completa.
  try {
    const apiResponse = await fetch(API_BASE + '/species.php?park=' + encodeURIComponent(manifest.apiSlug));
    if (apiResponse.ok) {
      const apiData = await apiResponse.json();
      if (apiData?.species?.length) {
        state.data = apiData;
        NaturDexOffline.cacheResource(manifest.data, apiData);
      }
    }
  } catch (error) {
    console.info('Sin backend; se usan los datos empaquetados/cacheados del parque.', error);
  }
}

// --- Geometría del mapa ----------------------------------------------------------------------------
export async function loadGeo(manifest) {
  // Geometría del mapa desde GeoJSON declarado en el manifiesto. Las zonas protegidas son geometría
  // oficial (IMIDA/CARM); los hábitats son opcionales (si no hay polígonos, se dibujan círculos).
  state.geo = { parque: null, lic: null, zepa: null, trails: null, habitatGeom: {}, habitatArea: {} };
  const geo = (manifest && manifest.geo) || {};
  const load = async (path) => {
    if (!path) return null;
    try { return (await NaturDexOffline.fetchJsonCached(path)).data; } catch (e) { return null; }
  };
  const [parque, lic, zepa, trails, habitats] = await Promise.all([
    load(geo.parque), load(geo.lic), load(geo.zepa), load(geo.trails), load(geo.habitats)
  ]);
  state.geo.parque = parque;
  state.geo.lic = lic;
  state.geo.zepa = zepa;
  state.geo.trails = trails;
  if (habitats) {
    (habitats.features || []).forEach(f => {
      const slug = f.properties && f.properties.slug;
      const type = f.geometry && f.geometry.type;
      if (slug && (type === 'Polygon' || type === 'MultiPolygon')) {
        state.geo.habitatGeom[slug] = f.geometry;
        // Superficie del hábitat dentro del parque (ha), calculada a partir de los recintos del INB.
        if (f.properties && typeof f.properties.hectares === 'number') state.geo.habitatArea[slug] = f.properties.hectares;
      }
    });
  }
}

// --- Progreso local-first (funciona sin conexión, sincroniza con el servidor cuando lo hay) ------
function applyProgress(progress) {
  state.seenSpecies = new Set((progress.seenSpeciesIds || []).map(Number));
  state.seenPois = new Set(progress.seenPoiIds || []);
  state.sightings = new Map();
  const sightings = progress.sightings || {};
  Object.keys(sightings).forEach(k => {
    const s = sightings[k];
    if (s && typeof s.lat === 'number' && typeof s.lng === 'number') state.sightings.set(Number(k), { lat: s.lat, lng: s.lng });
  });
}

function currentProgressSnapshot() {
  const sightings = {};
  state.sightings.forEach((v, k) => { sightings[k] = { lat: v.lat, lng: v.lng }; });
  return {
    seenSpeciesIds: Array.from(state.seenSpecies),
    seenPoiIds: Array.from(state.seenPois),
    sightings,
    updatedAt: new Date().toISOString()
  };
}

// El progreso es por usuario y por parque: la clave local combina ambos para que no se mezclen
// las cuentas ni los parques en el mismo dispositivo.
function progressScope() {
  return (state.userId != null ? 'u' + state.userId : 'anon') + ':' + state.activeParkSlug;
}

export function saveProgressLocalNow() {
  NaturDexOffline.saveProgressLocal(progressScope(), currentProgressSnapshot());
}

export async function loadProgress() {
  // Primero el progreso local del dispositivo (instantáneo y offline-safe).
  applyProgress(NaturDexOffline.loadProgressLocal(progressScope()));
  // Luego, si hay backend y sesión, se fusiona por unión (nunca se pierde un "visto" offline).
  try {
    const response = await fetch(API_BASE + '/progress.php?park=' + encodeURIComponent(state.activeParkSlug));
    if (!response.ok) throw new Error('progress endpoint unavailable');
    const server = await response.json();
    (server.seenSpeciesIds || []).forEach(id => state.seenSpecies.add(Number(id)));
    (server.seenPoiIds || []).forEach(id => state.seenPois.add(id));
    const ss = server.sightings || {};
    Object.keys(ss).forEach(k => {
      if (!state.sightings.has(Number(k)) && ss[k] && typeof ss[k].lat === 'number') {
        state.sightings.set(Number(k), { lat: ss[k].lat, lng: ss[k].lng });
      }
    });
    state.progressReady = true;
    saveProgressLocalNow();
  } catch (error) {
    console.info('Sin backend de progreso; se usa el progreso local del dispositivo.', error);
  }
}

export async function persistProgress(type, id, seen, coords) {
  // Siempre se guarda primero en el dispositivo (offline-safe); el envío al servidor es adicional.
  saveProgressLocalNow();
  try {
    const payload = { type, id, seen };
    if (coords) { payload.lat = coords.lat; payload.lng = coords.lng; }
    const response = await fetch(API_BASE + '/progress.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('progress endpoint unavailable');
    state.progressReady = true;
  } catch (error) {
    console.info('No se pudo guardar el progreso en el backend; se mantiene solo en esta sesión.', error);
  }
}
