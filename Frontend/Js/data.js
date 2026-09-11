// ================================================================================================
// data.js — capa de datos: registro de parques, manifiesto, datos/geo y progreso local-first.
// ------------------------------------------------------------------------------------------------
// Módulo ES importado por app.js. Todo lo que habla con la red o con la caché offline vive aquí:
// nada de DOM ni de Leaflet. Usa el global NaturDexOffline (offline.js, script clásico cargado
// antes) para cachear cada JSON en el dispositivo: con visitar un parque online una vez, sus datos
// y mapas vectoriales quedan disponibles sin conexión.
// ================================================================================================

import { DEFAULT_PARK_SLUG, state } from './state.js';
// Todo el trato con Backend/Api/ (corte por tiempo incluido) vive en api.js.
import { apiFetch, apiGetJson, SYNC_TIMEOUT_MS } from './api.js';

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

// --- Biodiversidad agregada (comparativa entre espacios) ------------------------------------------
// Estadísticas de Tools/catalogo-nacional/build-biodiversidad-stats.js. Fichero NACIONAL, no por
// parque como el manifiesto: un único parks-biodiversidad.json con la entrada de todos los espacios.
// A propósito NO pasa por species.php ni vive dentro de park.json —ver la cabecera de ese script—,
// así que aquí no hay fusión con la API: se lee tal cual, cacheado para offline igual que
// Data/achievements.json o Data/glosario.json. Nunca lanza: sin red y sin caché, la pestaña de
// biodiversidad se queda sin datos en vez de romper la carga del parque.
export async function loadBiodiversidad() {
  try {
    const res = await NaturDexOffline.fetchJsonCached('Data/parks-biodiversidad.json');
    return (res.data && res.data.porParque) || {};
  } catch (error) {
    return {};
  }
}

// Especies con `visible: false` (evidencia insuficiente: pocas ocurrencias GBIF y sin figura en
// ningún catálogo/anexo oficial) no se listan ni cuentan en el catálogo público, aunque el dato
// sigue documentado en el JSON/BD para no perder el trabajo de curación. Se retiran también de
// `habitat.speciesIds` para que el contador y las chips de cada hábitat cuadren con lo que
// realmente se puede ver. Especies sin el campo `visible` (todos los parques anteriores a esta
// función) se tratan como visibles: el filtro es aditivo y no cambia nada donde no se use.
function applyVisibility(data) {
  if (!data || !Array.isArray(data.species)) return data;
  const hiddenIds = new Set(data.species.filter(s => s.visible === false).map(s => s.id));
  if (!hiddenIds.size) return data;
  data.species = data.species.filter(s => s.visible !== false);
  if (Array.isArray(data.habitats)) {
    for (const h of data.habitats) {
      if (Array.isArray(h.speciesIds)) h.speciesIds = h.speciesIds.filter(id => !hiddenIds.has(id));
    }
  }
  return data;
}

// --- Datos del parque (especies, hábitats, POIs) ---------------------------------------------------
export async function loadData(manifest) {
  // 1) Fichero de datos del parque (cacheado para offline).
  const res = await NaturDexOffline.fetchJsonCached(manifest.data);
  state.data = applyVisibility(res.data);
  state.dataFromCache = res.fromCache;
  // 2) Si hay backend accesible, sus datos (desde la base de datos) tienen prioridad y refrescan
  //    la copia offline con la versión más completa.
  try {
    const apiResponse = await apiFetch('/species.php?park=' + encodeURIComponent(manifest.apiSlug));
    if (apiResponse.ok) {
      const apiData = await apiResponse.json();
      if (apiData?.species?.length) {
        state.data = applyVisibility(apiData);
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
  // Cuándo se marcó cada cosa ('species:12' / 'poi:mirador' → fecha ISO). Es lo que permite saber si
  // una marca se hizo durante una visita verificada al parque, o sea, si cuenta para los logros
  // (ver Frontend/Js/presence.js y Backend/Lib/account_progress.php).
  state.markedAt = (progress.markedAt && typeof progress.markedAt === 'object') ? { ...progress.markedAt } : {};
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
    markedAt: { ...(state.markedAt || {}) },
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
    accuracy: coords && typeof coords.accuracy === 'number' ? coords.accuracy : null,
    // Cuándo ocurrió de verdad. Lo marcado sin cobertura se sube horas después, y esa hora es la que
    // decide si cayó dentro de una visita verificada: sin ella, una salida entera al monte llegaría
    // al servidor fechada al reconectar, ya en casa, y no contaría para nada.
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
        const response = await apiFetch('/progress.php?park=' + encodeURIComponent(park), {
          method: 'POST',
          body: { events: events.map(e => ({ type: e.type, id: e.id, seen: e.seen, lat: e.lat, lng: e.lng, accuracy: e.accuracy, at: e.at })) },
          timeoutMs: SYNC_TIMEOUT_MS,
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
    const server = await apiGetJson('/progress.php?park=' + encodeURIComponent(state.activeParkSlug));

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
    // El servidor manda en las horas de marcado: son las que sella él y las que deciden qué cuenta.
    Object.assign(state.markedAt, server.markedAt || {});
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
    if (coords) {
      payload.lat = coords.lat;
      payload.lng = coords.lng;
      if (typeof coords.accuracy === 'number') payload.accuracy = coords.accuracy;
    }
    // El parque VIAJA EN LA URL. Sin él, progress.php se cae a su parque por defecto
    // (cabo-cope-puntas-calnegre): marcar una especie en Sierra Espuña con la app abierta escribía
    // el progreso en el parque equivocado, y solo la cola de pendientes (que sí lo mandaba) acertaba.
    const response = await apiFetch('/progress.php?park=' + encodeURIComponent(state.activeParkSlug), {
      method: 'POST', body: payload,
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
