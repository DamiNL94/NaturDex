// ================================================================================================
// achievements.js — progreso de CUENTA (ámbito estatal) y logros: carga del catálogo compartido,
// predicción offline, sincronización con el servidor y cola de celebración animada.
// ------------------------------------------------------------------------------------------------
// Módulo ES importado por app.js. El progreso "de siempre" (seenSpecies/seenPois por parque) sigue
// viviendo en state.js/data.js sin cambios; este módulo agrega TODO lo visto en TODOS los parques
// de la cuenta y evalúa Frontend/Data/achievements.json (el mismo fichero que lee el backend, ver
// Backend/Lib/account_progress.php: ninguno de los dos lados puede desincronizarse de las reglas).
//
// Offline-first: cuando hay red, el servidor es la fuente de verdad (GET account-progress.php, y
// cada POST a progress.php ya devuelve `newlyUnlocked`). Sin red, este módulo predice localmente a
// partir de los progresos de parque ya cacheados en el dispositivo (mismo criterio de deduplicación
// de especies que el servidor) y reconcilia al recuperar la conexión: un logro que el cliente creyó
// desbloqueado y el servidor no confirma se retira en silencio; uno que el servidor tiene y el
// cliente no había celebrado, se celebra al reconectar.
// ================================================================================================

import { normalize, pointInGeometry } from './util.js';
import { API_BASE, ACHIEVEMENTS_CATALOG_PATH, PARK_INDEX_PATH, state } from './state.js';
import { localVerifiedWindows } from './presence.js';

// Cupo de ritmo humano por visita (espejo de PRESENCE_MARKS_* en Backend/Lib/presence.php).
const MARKS_PER_MINUTE = 3;
const MARKS_FLOOR = 10;

const API_TIMEOUT_MS = 3000;
function apiSignal() {
  return (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) ? AbortSignal.timeout(API_TIMEOUT_MS) : undefined;
}

// --- Catálogo de logros (compartido con el backend) ----------------------------------------------
let catalogPromise = null;
export async function loadAchievementsCatalog() {
  if (!catalogPromise) {
    catalogPromise = NaturDexOffline.fetchJsonCached(ACHIEVEMENTS_CATALOG_PATH)
      .then(res => res.data)
      .catch(() => ({ achievements: [], categories: [] }));
  }
  return catalogPromise;
}

// --- Ámbito de almacenamiento local (por cuenta, NO por parque: esta capa es de toda la cuenta) --
function accountScope() {
  return state.userId != null ? 'u' + state.userId : 'anon';
}
function lsKey(name) { return 'naturdex.' + name + '.' + accountScope(); }
function getJSON(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
}
function setJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* almacenamiento lleno/bloqueado: se ignora */ }
}

// Parques con los que esta cuenta ha interactuado localmente (para poder recalcular el agregado
// estatal en offline sin depender de haber sincronizado nunca con el servidor).
function getLocalParkIndex() { return getJSON(lsKey('accountParks'), []); }
function addLocalParkIndex(slug) {
  const list = getLocalParkIndex();
  if (!list.includes(slug)) { list.push(slug); setJSON(lsKey('accountParks'), list); }
}

// Registro de actividad local: un día por (parque, fecha). Ojo, esto NO es constancia: marcar algo
// se puede hacer desde el sofá. La constancia que puntúa sale de las visitas verificadas
// (presence.js·localVisits); esto se conserva solo como rastro de uso de la app.
function getLocalActivityLog() { return getJSON(lsKey('activityLog'), []); }
function recordLocalActivity(parkSlug) {
  if (!parkSlug) return;
  const log = getLocalActivityLog();
  const date = new Date().toISOString().slice(0, 10);
  if (!log.some(e => e.parkSlug === parkSlug && e.date === date)) {
    log.push({ parkSlug, date });
    setJSON(lsKey('activityLog'), log);
  }
}

// Logros ya animados en este dispositivo (para no repetir el cartel tras un refresco de página).
function getCelebratedIds() { return new Set(getJSON(lsKey('celebrated'), [])); }
function addCelebratedIds(ids) {
  const set = getCelebratedIds();
  ids.forEach(id => set.add(id));
  setJSON(lsKey('celebrated'), Array.from(set));
}
function removeCelebratedIds(ids) {
  const set = getCelebratedIds();
  ids.forEach(id => set.delete(id));
  setJSON(lsKey('celebrated'), Array.from(set));
}

// --- Clave canónica de especie (deduplicación entre parques) ------------------------------------
// Mismo criterio que Backend/Lib/account_progress.php·canonicalSpeciesKey: gbif_species_key >
// eidos_taxonid > nombre científico normalizado (misma normalización que el buscador del catálogo).
function canonicalSpeciesKey(species) {
  if (!species) return '';
  if (species.gbifSpeciesKey) return 'gbif:' + species.gbifSpeciesKey;
  if (species.eidosTaxonId) return 'eidos:' + species.eidosTaxonId;
  return 'sci:' + normalize(species.scientificName || '').trim().replace(/\s+/g, ' ');
}

// --- Semana ISO (para la racha de semanas) --------------------------------------------------------
function isoWeekKey(dateStr) {
  const d = new Date(dateStr + 'T00:00:00Z');
  const dayNum = (d.getUTCDay() + 6) % 7; // lunes=0..domingo=6
  d.setUTCDate(d.getUTCDate() - dayNum + 3); // jueves de esa semana ISO
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);
  const week = 1 + Math.round((d - firstThursday) / (7 * 86400000));
  return d.getUTCFullYear() + '-W' + String(week).padStart(2, '0');
}
function isoWeekStartMs(key) {
  const [y, w] = key.split('-W').map(Number);
  const jan4 = new Date(Date.UTC(y, 0, 4));
  const jan4DayNum = (jan4.getUTCDay() + 6) % 7;
  return jan4.getTime() - jan4DayNum * 86400000 + (w - 1) * 7 * 86400000;
}

// Estadísticas de campo a partir de las visitas VERIFICADAS conocidas por este dispositivo (espejo
// de presenceFieldStats en el servidor). Nada de esto sale ya de "días en los que marqué algo".
function localFieldStats() {
  const windows = localVerifiedWindows();
  const days = new Set();
  const perPark = {};
  const parks = new Set();
  let seconds = 0, meters = 0, longest = 0, earlyBird = false, winterVisit = false;

  windows.forEach(w => {
    const start = new Date(w.startedAt);
    // Día y hora "de la persona": el campo se mide en hora peninsular, no en UTC.
    const date = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Madrid' }).format(start); // AAAA-MM-DD
    days.add(date);
    (perPark[w.park] || (perPark[w.park] = new Set())).add(date);
    parks.add(w.park);
    seconds += w.seconds;
    meters += w.distanceM || 0;
    longest = Math.max(longest, w.seconds);
    const hour = Number(new Intl.DateTimeFormat('es-ES', { hour: 'numeric', hour12: false, timeZone: 'Europe/Madrid' }).format(start));
    if (hour < 8) earlyBird = true;
    const month = Number(date.slice(5, 7));
    if (month === 12 || month === 1 || month === 2) winterVisit = true;
  });

  let maxParkRevisitDays = 0;
  Object.values(perPark).forEach(set => { maxParkRevisitDays = Math.max(maxParkRevisitDays, set.size); });

  const weekKeys = Array.from(new Set(Array.from(days).map(isoWeekKey))).sort();
  let best = 0, current = 0, prevMs = null;
  weekKeys.forEach(wk => {
    const ms = isoWeekStartMs(wk);
    current = (prevMs !== null && ms - prevMs === 7 * 86400000) ? current + 1 : 1;
    best = Math.max(best, current);
    prevMs = ms;
  });

  return {
    parksVisited: parks.size,
    parksList: Array.from(parks),
    fieldDays: days.size,
    weekStreak: best,
    maxParkRevisitDays,
    fieldHours: Math.floor(seconds / 3600),
    fieldKilometers: Math.floor(meters / 1000),
    longestVisitHours: Math.floor(longest / 3600),
    earlyBird,
    winterVisit
  };
}

// Marcas de un parque que caen dentro de una visita verificada, con el mismo cupo de ritmo humano
// que aplica el servidor (partitionVerifiedMarks en Backend/Lib/account_progress.php).
function verifiedMarksOf(parkSlug, markedAt, windows) {
  const mine = windows.filter(w => w.park === parkSlug);
  const species = new Set();
  const pois = new Set();
  if (!mine.length) return { species, pois };

  const perWindow = new Map();
  Object.keys(markedAt || {}).forEach(key => {
    const ts = Date.parse(markedAt[key]);
    if (!ts) return;
    const idx = mine.findIndex(w => ts >= w.from && ts <= w.to);
    if (idx < 0) return;
    if (!perWindow.has(idx)) perWindow.set(idx, []);
    perWindow.get(idx).push({ key, ts });
  });

  perWindow.forEach((marks, idx) => {
    marks.sort((a, b) => a.ts - b.ts);
    const allowed = Math.max(MARKS_FLOOR, Math.ceil((mine[idx].seconds / 60) * MARKS_PER_MINUTE));
    marks.slice(0, allowed).forEach(m => {
      const sep = m.key.indexOf(':');
      const type = m.key.slice(0, sep);
      const id = m.key.slice(sep + 1);
      if (type === 'species') species.add(Number(id));
      else if (type === 'poi') pois.add(id);
    });
  });
  return { species, pois };
}

// --- Registro de parques (para resolver la ruta de datos de un parque distinto del activo) -------
let registryPromise = null;
function loadRegistry() {
  if (!registryPromise) registryPromise = NaturDexOffline.fetchJsonCached(PARK_INDEX_PATH).then(r => r.data).catch(() => null);
  return registryPromise;
}
function findParkEntry(registry, slug) {
  for (const c of ((registry && registry.communities) || [])) {
    for (const p of (c.provinces || [])) {
      for (const park of (p.parks || [])) if (park.slug === slug) return park;
    }
  }
  return null;
}

// --- Agregación local (espejo best-effort de computeAccountAggregates en account_progress.php) ---
// Solo puede tener en cuenta los parques con los que este DISPOSITIVO ha interactuado (getLocalParkIndex)
// y cuyos datos siguen cacheados; por eso es una predicción, no la fuente de verdad, y se reconcilia
// con el servidor en cuanto hay red (ver syncWithServer más abajo).
async function computeLocalAggregates() {
  const parkSlugs = getLocalParkIndex();
  const registry = await loadRegistry();
  const windows = localVerifiedWindows();
  const field = localFieldStats();
  const speciesKeys = new Set();
  const gpsKeys = new Set();
  const regions = new Set();
  const provinces = new Set();
  let poisSeen = 0;
  let habitatsCompleted = 0;
  let parksCompleted = 0;
  let unverifiedMarks = 0;

  // Comunidades y provincias salen de haber PISADO el espacio, no de haber marcado nada en él.
  for (const slug of field.parksList) {
    const entry = registry ? findParkEntry(registry, slug) : null;
    if (!entry) continue;
    try {
      const manifest = (await NaturDexOffline.fetchJsonCached(entry.manifest)).data;
      const parkData = (await NaturDexOffline.fetchJsonCached(manifest.data)).data;
      const park = (parkData && parkData.park) || {};
      if (park.region) regions.add(park.region);
      if (park.province) provinces.add(park.province);
    } catch (e) { /* sin datos cacheados: se omite su aportación al recuento territorial */ }
  }

  for (const slug of parkSlugs) {
    const scope = (state.userId != null ? 'u' + state.userId : 'anon') + ':' + slug;
    const progress = NaturDexOffline.loadProgressLocal(scope);
    const seenSpecies = new Set((progress.seenSpeciesIds || []).map(Number));
    const seenPois = new Set(progress.seenPoiIds || []);
    if (!seenSpecies.size && !seenPois.size) continue;

    // Solo cuenta lo marcado durante una visita verificada a ESTE espacio. Lo demás sigue en el
    // cuaderno del usuario (y se cuenta aparte para poder decírselo con claridad).
    const verified = verifiedMarksOf(slug, progress.markedAt || {}, windows);
    const verifiedSpecies = Array.from(verified.species).filter(id => seenSpecies.has(id));
    const verifiedPois = Array.from(verified.pois).filter(id => seenPois.has(id));
    unverifiedMarks += (seenSpecies.size - verifiedSpecies.length) + (seenPois.size - verifiedPois.length);
    if (!verifiedSpecies.length && !verifiedPois.length) continue;

    const entry = registry ? findParkEntry(registry, slug) : null;
    if (!entry) continue;
    let parkData, boundary = null;
    try {
      const manifest = (await NaturDexOffline.fetchJsonCached(entry.manifest)).data;
      parkData = (await NaturDexOffline.fetchJsonCached(manifest.data)).data;
      if (manifest.geo && manifest.geo.parque) boundary = (await NaturDexOffline.fetchJsonCached(manifest.geo.parque)).data;
    } catch (e) { continue; } // sin datos cacheados de este parque: se omite su aportación

    poisSeen += verifiedPois.length;
    const verifiedSpeciesSet = new Set(verifiedSpecies);
    const speciesById = new Map((parkData.species || []).map(s => [s.id, s]));
    verifiedSpecies.forEach(id => {
      const sp = speciesById.get(id);
      if (!sp) return;
      const key = canonicalSpeciesKey(sp);
      speciesKeys.add(key);
      // Registro georreferenciado: la coordenada del avistamiento tiene que caer dentro del límite.
      const sighting = progress.sightings && progress.sightings[String(id)];
      if (sighting && boundary && insideBoundary(boundary, sighting.lat, sighting.lng)) gpsKeys.add(key);
    });

    const habitats = parkData.habitats || [];
    let habitatsCompleteHere = 0;
    habitats.forEach(h => {
      const members = h.speciesIds || [];
      if (!members.length) return;
      const seenHere = members.filter(id => verifiedSpeciesSet.has(id)).length;
      if (seenHere === members.length) habitatsCompleteHere++;
    });
    habitatsCompleted += habitatsCompleteHere;

    const poisTotal = (parkData.pointsOfInterest || []).length;
    const parkComplete = habitats.length > 0 && habitatsCompleteHere === habitats.length
      && poisTotal > 0 && verifiedPois.length === poisTotal;
    if (parkComplete) parksCompleted++;
  }

  return {
    speciesSeen: speciesKeys.size,
    parksVisited: field.parksVisited,
    parksCompleted,
    regionsVisited: regions.size,
    provincesVisited: provinces.size,
    habitatsCompleted,
    poisSeen,
    gpsSightings: gpsKeys.size,
    fieldDays: field.fieldDays,
    weekStreak: field.weekStreak,
    maxParkRevisitDays: field.maxParkRevisitDays,
    fieldHours: field.fieldHours,
    fieldKilometers: field.fieldKilometers,
    invasiveSeen: getJSON(lsKey('invasiveSeen'), []).length,
    glossaryViewed: getJSON(lsKey('glossaryViewed'), []).length,
    unverifiedMarks,
    regionsList: Array.from(regions),
    flags: {
      earlyBird: field.earlyBird,
      winterVisit: field.winterVisit,
      longVisit: field.longestVisitHours >= 3
    }
  };
}

/** ¿Cae la coordenada dentro del GeoJSON del límite del parque? (mismo criterio que el servidor). */
function insideBoundary(geojson, lat, lng) {
  if (!geojson || typeof lat !== 'number' || typeof lng !== 'number') return false;
  const features = geojson.features || [{ geometry: geojson.geometry || geojson }];
  return features.some(f => pointInGeometry(lat, lng, f.geometry || f));
}

function metricValue(aggregates, metric) {
  if (aggregates[metric] !== undefined) return Number(aggregates[metric]) || 0;
  if (aggregates.flags && aggregates.flags[metric] !== undefined) return aggregates.flags[metric] ? 1 : 0;
  return 0;
}

async function evaluateLocally(aggregates) {
  const catalog = (await loadAchievementsCatalog()).achievements || [];
  const known = new Set(state.account.achievements.keys());
  const newly = [];
  catalog.forEach(ach => {
    if (known.has(ach.id)) return;
    if (metricValue(aggregates, ach.metric) >= ach.threshold) newly.push(ach.id);
  });
  return newly;
}

// --- Núcleo: recalcula (local u online), evalúa y refresca state.account -------------------------
// `evaluateLocally` compara contra `state.account.achievements`, que arranca vacío en CADA carga de
// página (state.js). Así que, nada más recargar o volver a entrar, todo logro ya ganado con
// anterioridad "parece" recién desbloqueado desde el punto de vista de este Map en memoria. Sin
// distinguir eso de un desbloqueo genuino, se volvería a celebrar con cartel animado cada vez que se
// abre la app — el bug de "saltan logros todo el rato". `getCelebratedIds()` (persistente, por
// dispositivo) es la fuente de verdad de "esto ya se le enseñó a la persona": solo se celebra lo que
// NO esté ahí, aunque se siga añadiendo TODO lo que cumple el umbral a state.account.achievements
// para que la pantalla de progreso no se quede corta mientras no hay red para reconciliar con el
// servidor.
async function refreshLocal() {
  const aggregates = await computeLocalAggregates();
  state.account.totals = aggregates;
  // Sin red, el historial de salidas que se enseña es el que conoce este dispositivo (el servidor
  // lo sustituye por el suyo en cuanto hay conexión, en syncWithServer).
  if (!state.account.visits || !state.account.visits.length) {
    state.account.visits = localVerifiedWindows().slice().reverse().map(w => ({
      park: w.park, parkName: w.park, startedAt: w.startedAt,
      seconds: w.seconds, distanceM: w.distanceM, verified: true, suspicious: false, flags: []
    }));
  }
  const newlyLocal = await evaluateLocally(aggregates);
  const now = new Date().toISOString();
  const celebratedBefore = getCelebratedIds();
  const toCelebrate = [];
  newlyLocal.forEach(id => {
    const alreadyCelebrated = celebratedBefore.has(id);
    state.account.achievements.set(id, { unlockedAt: now, celebratedAt: alreadyCelebrated ? now : null, context: null, local: true });
    if (!alreadyCelebrated) toCelebrate.push(id);
  });
  state.account.ready = true;
  if (toCelebrate.length) celebrate(toCelebrate);
  return toCelebrate;
}

// Conjunto de logros que el servidor devuelve como recién desbloqueados (progress.php POST o
// account-progress.php POST): ya están confirmados, se celebran directamente sin esperar el GET.
export function handleServerNewlyUnlocked(ids) {
  if (!ids || !ids.length) return;
  const now = new Date().toISOString();
  ids.forEach(id => {
    if (!state.account.achievements.has(id)) state.account.achievements.set(id, { unlockedAt: now, celebratedAt: null, context: null });
  });
  celebrate(ids);
}

// Sincroniza con el servidor: sustituye los totales (el servidor manda) y reconcilia la lista de
// logros. Los que el servidor no confirma y el cliente había dado por buenos en local se retiran en
// silencio; los que el servidor tiene y el cliente no había celebrado, se celebran ahora.
export async function syncWithServer() {
  try {
    const res = await fetch(API_BASE + '/account-progress.php', { signal: apiSignal() });
    if (!res.ok) throw new Error('account-progress unavailable');
    const data = await res.json();
    state.account.totals = data.totals || state.account.totals;
    // Historial de salidas: si los logros dependen de haber estado allí, la pantalla de progreso
    // tiene que poder enseñar qué visitas se han contado y cuáles no.
    if (Array.isArray(data.visits)) state.account.visits = data.visits;

    const serverIds = new Set((data.achievements || []).map(a => a.id));
    // Retirar en silencio lo predicho localmente que el servidor no confirma.
    Array.from(state.account.achievements.keys()).forEach(id => {
      const entry = state.account.achievements.get(id);
      if (entry && entry.local && !serverIds.has(id)) state.account.achievements.delete(id);
    });
    removeCelebratedIds(Array.from(getCelebratedIds()).filter(id => !serverIds.has(id)));

    const celebratedLocally = getCelebratedIds();
    const toCelebrateNow = [];
    const toBundleDiscreetly = [];
    (data.achievements || []).forEach(a => {
      state.account.achievements.set(a.id, { unlockedAt: a.unlockedAt, celebratedAt: a.celebratedAt, context: a.context });
      if (a.celebratedAt || celebratedLocally.has(a.id)) return;
      // Ya se puso en cola por handleServerNewlyUnlocked (desbloqueo en vivo de esta sesión): no se
      // duplica ni se manda al resumen agrupado de "progreso anterior".
      if (queuedOrShown.has(a.id)) return;
      toBundleDiscreetly.push(a.id);
    });
    state.account.ready = true;
    // Retrocompatibilidad: un alta con progreso previo no debe recibir N carteles de golpe. Si hay
    // logros sin celebrar que NO vinieron de un desbloqueo en vivo de esta sesión, se resumen en un
    // único aviso discreto en vez de animarlos uno a uno.
    if (toBundleDiscreetly.length) showBackfillSummary(toBundleDiscreetly);
    return data;
  } catch (e) {
    // Sin red o sin sesión (invitado): se mantiene la predicción local ya calculada.
    return null;
  }
}

export async function refreshAccountProgress() {
  await refreshLocal();
  if (state.userId != null && NaturDexOffline.isOnline()) await syncWithServer();
}

// --- Eventos que alimentan el progreso de cuenta (los llama app.js/glossary.js) ------------------
export function noteParkActivity(parkSlug) {
  if (!parkSlug) return;
  addLocalParkIndex(parkSlug);
  recordLocalActivity(parkSlug);
}

// Para pintar el botón "identificada"/"marcar como identificada" en la ficha (render.js).
export function isInvasiveSeenLocally(scientificName) {
  return getJSON(lsKey('invasiveSeen'), []).includes(normalize(scientificName || ''));
}

export async function reportInvasiveSeen(scientificName, ccaa) {
  const key = normalize(scientificName || '');
  const list = getJSON(lsKey('invasiveSeen'), []);
  if (!list.includes(key)) { list.push(key); setJSON(lsKey('invasiveSeen'), list); }
  await refreshLocal();
  if (state.userId != null) {
    try {
      const res = await fetch(API_BASE + '/account-progress.php', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'invasive', scientificName, ccaa }), signal: apiSignal()
      });
      if (res.ok) { const data = await res.json(); handleServerNewlyUnlocked(data.newlyUnlocked); }
    } catch (e) { /* offline: la predicción local ya quedó registrada, se reconcilia al reconectar */ }
  }
}

export async function reportGlossaryView(term) {
  const key = normalize(term || '');
  const list = getJSON(lsKey('glossaryViewed'), []);
  if (list.includes(key)) return; // ya contado: no repetir llamada de red por cada apertura del popover
  list.push(key);
  setJSON(lsKey('glossaryViewed'), list);
  await refreshLocal();
  if (state.userId != null) {
    try {
      const res = await fetch(API_BASE + '/account-progress.php', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'glossary', term }), signal: apiSignal()
      });
      if (res.ok) { const data = await res.json(); handleServerNewlyUnlocked(data.newlyUnlocked); }
    } catch (e) { /* se reconcilia al reconectar */ }
  }
}

// ================================================================================================
// Cola de celebración: cartel animado. Módulo autocontenido (como el popover de glossary.js): crea
// su propio DOM la primera vez que hace falta, en vez de depender de marcado ya presente en el HTML.
// ================================================================================================
const queuedOrShown = new Set(); // ids ya encolados/mostrados en ESTA carga de página (anti-duplicado)
let queue = [];
let showing = false;
let regionEl = null;

function ensureRegion() {
  if (regionEl) return regionEl;
  regionEl = document.createElement('div');
  regionEl.id = 'achievementToastRegion';
  regionEl.className = 'achievement-toast-region';
  regionEl.setAttribute('aria-live', 'polite');
  regionEl.setAttribute('aria-atomic', 'true');
  document.body.appendChild(regionEl);
  return regionEl;
}

// "Menos movimiento": el ajuste del sistema o el de la app (Perfil y ajustes → prefs.js).
function prefersReducedMotion() {
  if (window.NaturDexPrefs) return window.NaturDexPrefs.prefersReducedMotion();
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Sonido opcional, silenciado por defecto. Se genera con Web Audio API, sin fichero de audio nuevo
// que empaquetar. Nació aquí con su propia clave de localStorage y hoy es una preferencia más: se
// delega en prefs.js (que adoptó el valor antiguo la primera vez) y se mantiene el camino directo
// como respaldo por si el script de preferencias no estuviera cargado.
function soundEnabled() {
  if (window.NaturDexPrefs) return window.NaturDexPrefs.get('achievementSound') === true;
  return getJSON(lsKey('achievementSound'), false) === true;
}
function setSoundEnabled(v) {
  if (window.NaturDexPrefs) { window.NaturDexPrefs.set('achievementSound', !!v); return; }
  setJSON(lsKey('achievementSound'), !!v);
}
function playChime() {
  if (!soundEnabled()) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [880, 1318.5].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const start = ctx.currentTime + i * 0.09;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.12, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.3);
    });
    setTimeout(() => ctx.close(), 600);
  } catch (e) { /* Web Audio no disponible: sin sonido, sin romper nada */ }
}

function confettiMarkup(rarity) {
  if (prefersReducedMotion()) return '';
  const count = rarity === 'legendario' ? 18 : rarity === 'raro' ? 12 : 7;
  const pieces = Array.from({ length: count }, (_, i) => {
    const left = Math.round(Math.random() * 100);
    const delay = (Math.random() * 0.25).toFixed(2);
    const hue = Math.round(Math.random() * 360);
    return `<i class="confetti-piece" style="left:${left}%;animation-delay:${delay}s;background:hsl(${hue} 70% 55%)"></i>`;
  }).join('');
  return `<div class="achievement-confetti" aria-hidden="true">${pieces}</div>`;
}

async function achievementById(id) {
  const catalog = (await loadAchievementsCatalog()).achievements || [];
  return catalog.find(a => a.id === id) || null;
}

async function showCard(id) {
  const ach = await achievementById(id);
  const region = ensureRegion();
  const card = document.createElement('div');
  card.className = 'achievement-toast rarity-' + (ach ? ach.rarity : 'comun') + (prefersReducedMotion() ? ' reduced' : '');
  card.setAttribute('role', 'status');
  card.tabIndex = -1;
  const title = ach ? ach.title : 'Logro desbloqueado';
  const desc = ach ? ach.description : '';
  const emoji = ach ? ach.icon : '🏅';
  card.innerHTML = `
    ${confettiMarkup(ach ? ach.rarity : 'comun')}
    <span class="achievement-toast-icon" aria-hidden="true">${emoji}</span>
    <div class="achievement-toast-body">
      <p class="achievement-toast-eyebrow">Logro desbloqueado</p>
      <strong>${escapeText(title)}</strong>
      <p>${escapeText(desc)}</p>
    </div>
    <div class="achievement-toast-actions">
      <button type="button" class="achievement-toast-sound" aria-pressed="${soundEnabled()}" title="${soundEnabled() ? 'Silenciar el sonido de logro' : 'Activar el sonido de logro'}">${soundEnabled() ? '🔊' : '🔈'}</button>
      <button type="button" class="achievement-toast-close" aria-label="Cerrar aviso">✕</button>
    </div>`;
  region.appendChild(card);
  playChime();
  requestAnimationFrame(() => card.classList.add('in'));

  let dismissed = false;
  const dismiss = () => {
    if (dismissed) return;
    dismissed = true;
    card.classList.remove('in');
    card.classList.add('out');
    setTimeout(() => card.remove(), prefersReducedMotion() ? 0 : 320);
  };
  card.querySelector('.achievement-toast-close').addEventListener('click', dismiss);
  card.querySelector('.achievement-toast-sound').addEventListener('click', (e) => {
    setSoundEnabled(!soundEnabled());
    e.currentTarget.textContent = soundEnabled() ? '🔊' : '🔈';
    e.currentTarget.setAttribute('aria-pressed', String(soundEnabled()));
    if (soundEnabled()) playChime();
  });
  card.addEventListener('keydown', e => { if (e.key === 'Escape') dismiss(); });

  const timeout = setTimeout(dismiss, 5000);
  await new Promise(resolve => {
    card.addEventListener('transitionend', function onEnd(e) {
      if (e.propertyName !== 'opacity' || !dismissed) return;
      card.removeEventListener('transitionend', onEnd);
      clearTimeout(timeout);
      resolve();
    });
    // Salvaguarda por si transitionend no llega (reduced motion, pestaña en segundo plano...).
    setTimeout(() => resolve(), 6000);
  });
}

function escapeText(s) {
  const div = document.createElement('div');
  div.textContent = String(s ?? '');
  return div.innerHTML;
}

function showBackfillSummary(ids) {
  // Con los avisos desactivados, el resumen de "progreso anterior" tampoco interrumpe.
  if (window.NaturDexPrefs && window.NaturDexPrefs.get('celebrations') === false) { markCelebrated(ids); return; }
  const region = ensureRegion();
  const card = document.createElement('div');
  card.className = 'achievement-toast discreet';
  card.setAttribute('role', 'status');
  card.innerHTML = `
    <span class="achievement-toast-icon" aria-hidden="true">🏅</span>
    <div class="achievement-toast-body">
      <strong>Has desbloqueado ${ids.length} ${ids.length === 1 ? 'logro' : 'logros'} con tu progreso anterior</strong>
      <p>Puedes verlos en tu progreso estatal.</p>
    </div>
    <button type="button" class="achievement-toast-close" aria-label="Cerrar aviso">✕</button>`;
  region.appendChild(card);
  requestAnimationFrame(() => card.classList.add('in'));
  const dismiss = () => { card.classList.remove('in'); card.classList.add('out'); setTimeout(() => card.remove(), 320); };
  card.querySelector('.achievement-toast-close').addEventListener('click', dismiss);
  setTimeout(dismiss, 6000);
  markCelebrated(ids);
}

async function markCelebrated(ids) {
  addCelebratedIds(ids);
  ids.forEach(id => {
    const entry = state.account.achievements.get(id);
    if (entry) entry.celebratedAt = new Date().toISOString();
  });
  if (state.userId != null) {
    try {
      await fetch(API_BASE + '/account-progress.php', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'celebrate', ids }), signal: apiSignal()
      });
    } catch (e) { /* se reintentará en la próxima sincronización (removeCelebratedIds no las borra) */ }
  }
}

async function runQueue() {
  if (showing) return;
  showing = true;
  while (queue.length) {
    // Más de 3 desbloqueados de golpe (muy probable al sincronizar tras una salida al campo): se
    // agrupan en un único aviso en vez de encadenar N carteles.
    if (queue.length > 3) {
      const batch = queue.splice(0, queue.length);
      showGroupedLive(batch);
      await markCelebrated(batch);
      continue;
    }
    const id = queue.shift();
    await showCard(id);
    await markCelebrated([id]);
  }
  showing = false;
}

function showGroupedLive(ids) {
  const region = ensureRegion();
  const card = document.createElement('div');
  card.className = 'achievement-toast grouped' + (prefersReducedMotion() ? ' reduced' : '');
  card.setAttribute('role', 'status');
  card.innerHTML = `
    ${confettiMarkup('raro')}
    <span class="achievement-toast-icon" aria-hidden="true">🎉</span>
    <div class="achievement-toast-body">
      <strong>¡${ids.length} logros nuevos!</strong>
      <p>Consulta tu progreso estatal para verlos todos.</p>
    </div>
    <button type="button" class="achievement-toast-close" aria-label="Cerrar aviso">✕</button>`;
  region.appendChild(card);
  playChime();
  requestAnimationFrame(() => card.classList.add('in'));
  const dismiss = () => { card.classList.remove('in'); card.classList.add('out'); setTimeout(() => card.remove(), 320); };
  card.querySelector('.achievement-toast-close').addEventListener('click', dismiss);
  card.addEventListener('click', e => { if (!e.target.closest('.achievement-toast-close') && window.naturdexShowAccountProgress) window.naturdexShowAccountProgress(); });
  setTimeout(dismiss, 5000);
}

export function celebrate(ids) {
  const fresh = (ids || []).filter(id => !queuedOrShown.has(id));
  if (!fresh.length) return;
  fresh.forEach(id => queuedOrShown.add(id));
  // Avisos de logro desactivados (Perfil y ajustes): el logro se gana y se registra igual, solo que
  // sin cartel. Se marca como celebrado para que no reaparezca en cuanto se vuelvan a activar.
  if (window.NaturDexPrefs && window.NaturDexPrefs.get('celebrations') === false) {
    markCelebrated(fresh);
    return;
  }
  queue.push(...fresh);
  runQueue();
}

// --- Migración invitado → cuenta registrada ------------------------------------------------------
// El modo invitado guarda todo bajo el ámbito 'anon' (progreso por parque en data.js, y aquí el
// índice de parques/actividad/logros/flags locales). Al registrarse o entrar con una cuenta, esos
// datos se copian UNA SOLA VEZ al ámbito 'u<id>' (sin pisar progreso que la cuenta ya tuviera).
// Guardia con marca persistente: si no, un usuario que vuelve a explorar como invitado en el mismo
// dispositivo y luego reinicia sesión con su cuenta vería su progreso real sobrescrito por el nuevo
// rastro de invitado en cada carga.
const MIGRATABLE_KEYS = ['accountParks', 'activityLog', 'visits', 'celebrated', 'invasiveSeen', 'glossaryViewed', 'achievementSound'];
function migrateGuestDataIfNeeded() {
  if (state.userId == null) return;
  const guardKey = 'naturdex.migratedGuestData.u' + state.userId;
  if (localStorage.getItem(guardKey)) return;

  const anonParks = getJSON('naturdex.accountParks.anon', []);
  anonParks.forEach(slug => {
    const dstScope = 'u' + state.userId + ':' + slug;
    const existing = NaturDexOffline.loadProgressLocal(dstScope);
    const hasExisting = (existing.seenSpeciesIds || []).length || (existing.seenPoiIds || []).length;
    if (hasExisting) return; // la cuenta ya tiene su propio progreso en este parque: no se pisa
    const guestProgress = NaturDexOffline.loadProgressLocal('anon:' + slug);
    NaturDexOffline.saveProgressLocal(dstScope, guestProgress);
  });

  MIGRATABLE_KEYS.forEach(name => {
    const dstKey = 'naturdex.' + name + '.u' + state.userId;
    if (localStorage.getItem(dstKey) != null) return;
    const raw = localStorage.getItem('naturdex.' + name + '.anon');
    if (raw != null) localStorage.setItem(dstKey, raw);
  });

  try { localStorage.setItem(guardKey, '1'); } catch (e) { /* sin almacenamiento: se reintentará la próxima carga */ }
}

// --- Arranque ---------------------------------------------------------------------------------
export async function initAchievements() {
  migrateGuestDataIfNeeded();
  await loadAchievementsCatalog();
  await refreshLocal();
  if (state.userId != null && NaturDexOffline.isOnline()) await syncWithServer();
}
