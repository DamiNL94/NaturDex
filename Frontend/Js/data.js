// ================================================================================================
// data.js — capa de datos: registro de parques, manifiesto, datos/geo y progreso local-first.
// ------------------------------------------------------------------------------------------------
// Módulo ES importado por app.js. Todo lo que habla con la red o con la caché offline vive aquí:
// nada de DOM ni de Leaflet. Usa el global NaturDexOffline (offline.js, script clásico cargado
// antes) para cachear cada JSON en el dispositivo: con visitar un parque online una vez, sus datos
// y mapas vectoriales quedan disponibles sin conexión.
// ================================================================================================

import { API_BASE, DEFAULT_PARK_SLUG, state } from './state.js';

// Señal de corte para las llamadas a la API: si el backend no responde en 3 s se aborta y se sigue
// con los datos locales (offline-first). Medido con MySQL caído: sin esto, entrar al parque tardaba
// ~10 s porque los fetch fallidos se esperaban en serie. AbortSignal.timeout no existe en
// navegadores antiguos: en ese caso se devuelve undefined y el fetch va sin límite, como antes.
const API_TIMEOUT_MS = 3000;
function apiSignal(ms = API_TIMEOUT_MS) {
  return (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) ? AbortSignal.timeout(ms) : undefined;
}
// Vaciar la cola de pendientes puede mandar decenas de eventos de una excursión entera: 3 s son
// pocos para eso, y abortar a medias significaría reintentarlo todo en el próximo arranque.
const SYNC_TIMEOUT_MS = 15000;

// --- Registro de parques --------------------------------------------------------------------------
// Resuelve el parque activo del registro. Si el slug pedido no existe se cae a un parque abrible:
// primero uno con catálogo completo ("available") y, si no hay ninguno, uno de ficha base ("basic").
// Los "planned" no tienen carpeta de datos, así que nunca son un destino válido.
export function resolveActivePark(registry) {
  const wanted = state.activeParkSlug || (registry && registry.defaultPark) || DEFAULT_PARK_SLUG;
  let firstAvailable = null, firstBasic = null;
  const communities = (registry && registry.communities) || [];
  for (const community of communities) {
    for (const province of (community.provinces || [])) {
      for (const park of (province.parks || [])) {
        if (park.status === 'available' && !firstAvailable) firstAvailable = park;
        if (park.status === 'basic' && !firstBasic) firstBasic = park;
        if (park.slug === wanted) return park;
      }
    }
  }
  return firstAvailable || firstBasic;
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
    const apiResponse = await fetch(API_BASE + '/species.php?park=' + encodeURIComponent(manifest.apiSlug), { signal: apiSignal() });
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

// --- Cola de progreso pendiente de subir ----------------------------------------------------------
// Antes, si el POST fallaba (sin cobertura, que es justo cuando se usa la app en el campo), el
// evento se perdía: quedaba en el dispositivo pero no llegaba nunca al servidor, así que no contaba
// para los logros de cuenta. Ahora se encola y se reintenta al recuperar red y al arrancar.
//
// Solo se encola con sesión iniciada: progress.php exige autenticación, así que lo que marca un
// invitado no tiene a dónde subir (vive en el ámbito 'anon' del dispositivo y ahí se queda).
function queueProgress(type, id, seen, coords) {
  if (state.userId == null) return;
  NaturDexOffline.queuePending({
    kind: 'progress',
    user: state.userId,
    park: state.activeParkSlug,
    type, id, seen,
    lat: coords ? coords.lat : null,
    lng: coords ? coords.lng : null,
    at: new Date().toISOString()
  });
}

// Identidad de un evento a efectos de "es el mismo hecho": marcar y desmarcar la misma especie
// cinco veces sin cobertura tiene que acabar en un único envío con el estado final.
function progressEventKey(e) { return e.park + '|' + e.type + '|' + e.id; }

let flushingProgress = false;

/**
 * Vacía la cola de progreso contra el backend. Idempotente por partida doble: se colapsa a un
 * evento por (parque, tipo, id) antes de enviar, y progress.php trabaja por unión, así que
 * reenviar un "visto" que ya estaba no duplica nada. Solo se retira de la cola lo que el servidor
 * confirma; lo demás se queda para el próximo intento.
 */
export async function flushProgressQueue() {
  if (flushingProgress || state.userId == null || !NaturDexOffline.isOnline()) return { sent: 0, newlyUnlocked: [] };
  const queue = NaturDexOffline.pendingQueue();
  const mine = queue.filter(e => e && e.kind === 'progress' && e.user === state.userId);
  if (!mine.length) return { sent: 0, newlyUnlocked: [] };

  flushingProgress = true;
  try {
    const latest = new Map();
    mine.forEach(e => latest.set(progressEventKey(e), e));
    // Un POST por parque: el endpoint trabaja sobre el progreso de un parque concreto, y agrupar
    // evita que cada especie suelta dispare un recálculo completo del progreso de cuenta.
    const byPark = new Map();
    latest.forEach(e => {
      if (!byPark.has(e.park)) byPark.set(e.park, []);
      byPark.get(e.park).push(e);
    });

    const confirmed = new Set();
    const newlyUnlocked = [];
    let sent = 0;
    for (const [park, events] of byPark) {
      try {
        const response = await fetch(API_BASE + '/progress.php?park=' + encodeURIComponent(park), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ events: events.map(e => ({ type: e.type, id: e.id, seen: e.seen, lat: e.lat, lng: e.lng })) }),
          signal: apiSignal(SYNC_TIMEOUT_MS)
        });
        if (!response.ok) throw new Error('progress endpoint unavailable (HTTP ' + response.status + ')');
        const body = await response.json();
        (body.newlyUnlocked || []).forEach(id => newlyUnlocked.push(id));
        events.forEach(e => confirmed.add(progressEventKey(e)));
        sent += events.length;
        state.progressReady = true;
      } catch (error) {
        // Este parque se queda en la cola; los demás se siguen intentando.
        console.info('No se pudo subir el progreso pendiente de ' + park + '; se reintentará.', error);
      }
    }

    if (confirmed.size) {
      NaturDexOffline.setPendingQueue(queue.filter(e =>
        !(e && e.kind === 'progress' && e.user === state.userId && confirmed.has(progressEventKey(e)))));
    }
    return { sent, newlyUnlocked };
  } finally {
    flushingProgress = false;
  }
}

export async function loadProgress() {
  // Primero el progreso local del dispositivo (instantáneo y offline-safe).
  applyProgress(NaturDexOffline.loadProgressLocal(progressScope()));
  // Luego, si hay backend y sesión, se fusiona por unión (nunca se pierde un "visto" offline).
  try {
    const response = await fetch(API_BASE + '/progress.php?park=' + encodeURIComponent(state.activeParkSlug), { signal: apiSignal() });
    if (!response.ok) throw new Error('progress endpoint unavailable');
    const server = await response.json();

    // Lo que el dispositivo tiene y el servidor no, se encola para subir ANTES de fusionar (después
    // ya no se distinguen). Esto recupera el progreso de las versiones que no tenían cola y el de
    // cualquier evento que se perdiera: sin esto, la sincronización solo bajaba, nunca subía.
    const serverSpecies = new Set((server.seenSpeciesIds || []).map(Number));
    const serverPois = new Set(server.seenPoiIds || []);
    state.seenSpecies.forEach(id => {
      if (!serverSpecies.has(Number(id))) queueProgress('species', id, true, state.sightings.get(Number(id)) || null);
    });
    state.seenPois.forEach(id => { if (!serverPois.has(id)) queueProgress('poi', id, true, null); });

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
  if (!NaturDexOffline.isOnline()) { queueProgress(type, id, seen, coords); return null; }
  try {
    const payload = { type, id, seen };
    if (coords) { payload.lat = coords.lat; payload.lng = coords.lng; }
    const response = await fetch(API_BASE + '/progress.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: apiSignal()
    });
    if (!response.ok) throw new Error('progress endpoint unavailable');
    state.progressReady = true;
    // Se devuelve el cuerpo (incluye `newlyUnlocked`) para que app.js pueda celebrar los logros de
    // cuenta que el servidor acaba de confirmar, sin hacer una segunda petición aparte.
    return await response.json();
  } catch (error) {
    // Se encola en vez de darlo por perdido: `navigator.onLine` miente (wifi de hotel sin salida,
    // backend caído), así que el fallo del POST es la señal fiable de que hay que reintentar.
    queueProgress(type, id, seen, coords);
    console.info('No se pudo guardar el progreso en el backend; queda en la cola de pendientes.', error);
    return null;
  }
}
