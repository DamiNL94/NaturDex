// ================================================================================================
// ./achievements/almacen.js — catálogo de logros, almacenamiento local por CUENTA (no por parque), clave canónica de especie y semana ISO
// ------------------------------------------------------------------------------------------------
// Trozo de achievements.js. El índice de la carpeta está en Frontend/Js/CLAUDE.md.
// ================================================================================================

import { localVerifiedWindows } from '../presence.js';
import { ACHIEVEMENTS_CATALOG_PATH, PARK_INDEX_PATH, state } from '../state.js';
import { normalize } from '../util.js';

// Cupo de ritmo humano por visita (espejo de PRESENCE_MARKS_* en Backend/Lib/presence.php).
const MARKS_PER_MINUTE = 3;
const MARKS_FLOOR = 10;

// Las llamadas a la API van por api.js (corte por tiempo, cabeceras y lectura de errores).

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
export function lsKey(name) { return 'naturdex.' + name + '.' + accountScope(); }
export function getJSON(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
}
export function setJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* almacenamiento lleno/bloqueado: se ignora */ }
}

// Parques con los que esta cuenta ha interactuado localmente (para poder recalcular el agregado
// estatal en offline sin depender de haber sincronizado nunca con el servidor).
export function getLocalParkIndex() { return getJSON(lsKey('accountParks'), []); }
export function addLocalParkIndex(slug) {
  const list = getLocalParkIndex();
  if (!list.includes(slug)) { list.push(slug); setJSON(lsKey('accountParks'), list); }
}

// Registro de actividad local: un día por (parque, fecha). Ojo, esto NO es constancia: marcar algo
// se puede hacer desde el sofá. La constancia que puntúa sale de las visitas verificadas
// (presence.js·localVisits); esto se conserva solo como rastro de uso de la app.
function getLocalActivityLog() { return getJSON(lsKey('activityLog'), []); }
export function recordLocalActivity(parkSlug) {
  if (!parkSlug) return;
  const log = getLocalActivityLog();
  const date = new Date().toISOString().slice(0, 10);
  if (!log.some(e => e.parkSlug === parkSlug && e.date === date)) {
    log.push({ parkSlug, date });
    setJSON(lsKey('activityLog'), log);
  }
}

// Logros ya animados en este dispositivo (para no repetir el cartel tras un refresco de página).
export function getCelebratedIds() { return new Set(getJSON(lsKey('celebrated'), [])); }
export function addCelebratedIds(ids) {
  const set = getCelebratedIds();
  ids.forEach(id => set.add(id));
  setJSON(lsKey('celebrated'), Array.from(set));
}
export function removeCelebratedIds(ids) {
  const set = getCelebratedIds();
  ids.forEach(id => set.delete(id));
  setJSON(lsKey('celebrated'), Array.from(set));
}

// --- Clave canónica de especie (deduplicación entre parques) ------------------------------------
// Mismo criterio que Backend/Lib/account_progress.php·canonicalSpeciesKey: gbif_species_key >
// eidos_taxonid > nombre científico normalizado (misma normalización que el buscador del catálogo).
export function canonicalSpeciesKey(species) {
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
export function localFieldStats() {
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
export function verifiedMarksOf(parkSlug, markedAt, windows) {
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
export function loadRegistry() {
  if (!registryPromise) registryPromise = NaturDexOffline.fetchJsonCached(PARK_INDEX_PATH).then(r => r.data).catch(() => null);
  return registryPromise;
}
export function findParkEntry(registry, slug) {
  for (const c of ((registry && registry.communities) || [])) {
    for (const p of (c.provinces || [])) {
      for (const park of (p.parks || [])) if (park.slug === slug) return park;
    }
  }
  return null;
}
