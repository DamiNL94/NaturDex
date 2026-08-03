// ================================================================================================
// presence.js — presencia verificada: la prueba de que estás DENTRO del espacio protegido.
// ------------------------------------------------------------------------------------------------
// Módulo ES importado por app.js. Es la pieza que hace que los logros signifiquen algo: hasta ahora
// se conseguían pulsando "marcar como vista" desde cualquier sitio, así que la colección entera se
// podía completar sin salir de casa. Desde aquí, la app va registrando tu paso por el parque con
// posiciones del GPS y solo lo que marcas durante una presencia verificada cuenta para los logros.
//
// Reparto de responsabilidades, y es importante: este módulo NO decide nada. Manda las posiciones a
// Backend/Api/presence.php y es el SERVIDOR quien las cruza con el límite oficial del espacio y
// dice si valen. Lo que se calcula aquí es solo (a) el texto que ve el usuario y (b) la predicción
// offline, igual que achievements.js predice logros sin cobertura: en cuanto hay red, manda el
// servidor y lo que aquí se hubiera dado por bueno se corrige.
//
// Privacidad: no se guarda ni se envía la traza del paseo, solo posiciones sueltas espaciadas y su
// agregado (cuánto tiempo dentro, cuántos metros). La app no es un registro de por dónde andas.
// ================================================================================================

import { API_BASE, state } from './state.js';
import { pointInGeometry, haversineMeters, geoUnavailableReason } from './util.js';
import { presenceBar, presenceText, presenceAction } from './dom.js';

// --- Reglas (espejo de Backend/Lib/presence.php, solo para predecir y explicar) -------------------
const MIN_FIXES = 3;
const MIN_DWELL_S = 300;        // 5 minutos de presencia sostenida
const SESSION_GAP_S = 2700;     // 45 min sin posiciones ⇒ la siguiente abre una visita nueva
const MAX_ACCURACY_M = 100;
const TOLERANCE_M = 50;
const MARK_PRE_GRACE_S = 600;
const MARK_POST_GRACE_S = 900;

// Ritmo de envío: ni una posición por segundo (gasta batería y datos, y no aporta) ni una cada
// media hora (entonces la visita nunca reúne fixes suficientes).
const SEND_INTERVAL_MS = 60000;
const SEND_DISTANCE_M = 40;

const API_TIMEOUT_MS = 5000;
function apiSignal() {
  return (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) ? AbortSignal.timeout(API_TIMEOUT_MS) : undefined;
}

// --- Almacenamiento local (por cuenta) ------------------------------------------------------------
function scope() { return state.userId != null ? 'u' + state.userId : 'anon'; }
function visitsKey() { return 'naturdex.visits.' + scope(); }

function getJSON(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
}
function setJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* almacenamiento lleno: se ignora */ }
}

/** Visitas conocidas por este dispositivo: [{ park, startedAt, lastFixAt, fixCount, distanceM, verified }]. */
export function localVisits() {
  const list = getJSON(visitsKey(), []);
  return Array.isArray(list) ? list : [];
}
function saveLocalVisits(list) {
  // Tope de seguridad: el historial local es solo para predecir sin red, no un archivo histórico.
  setJSON(visitsKey(), list.slice(-200));
}

/**
 * Ventanas de presencia verificada conocidas localmente, con los mismos márgenes de gracia que el
 * servidor. Las usa achievements.js para predecir qué marcas cuentan cuando no hay cobertura.
 */
export function localVerifiedWindows() {
  return localVisits().filter(v => v.verified && !v.suspicious).map(v => ({
    park: v.park,
    from: Date.parse(v.startedAt) - MARK_PRE_GRACE_S * 1000,
    to: Date.parse(v.lastFixAt) + MARK_POST_GRACE_S * 1000,
    startedAt: v.startedAt,
    seconds: Math.max(0, (Date.parse(v.lastFixAt) - Date.parse(v.startedAt)) / 1000),
    distanceM: v.distanceM || 0
  }));
}

/** ¿La marca hecha en `whenMs` dentro de `parkSlug` cae en una presencia verificada conocida? */
export function isMarkVerifiedLocally(parkSlug, whenMs) {
  return localVerifiedWindows().some(w => w.park === parkSlug && whenMs >= w.from && whenMs <= w.to);
}

// --- Estado en vivo del módulo ---------------------------------------------------------------------
const live = {
  parkSlug: null,
  watchId: null,
  lastSent: null,        // { lat, lng, atMs }
  status: null,          // último estado conocido (servidor si hay red, local si no)
  outsideDistanceM: null // metros al límite cuando se está fuera (para el aviso)
};

/** Estado actual, tal cual lo pinta la barra de presencia y lo consulta app.js. */
export function presenceStatus() {
  return live.status || { active: false, verified: false, fixCount: 0, dwellSeconds: 0 };
}

/** ¿Lo que se marque AHORA MISMO va a contar para los logros? */
export function marksCountNow() {
  const s = presenceStatus();
  return !!(s.verified && !s.suspicious);
}

// --- Registro local de una posición (espejo simplificado del servidor) ---------------------------
// Solo se aplica a la geometría del parque ACTIVO, que es la única cacheada en `state.geo.parque`.
function boundaryDecision(lat, lng, accuracy) {
  const geo = state.geo && state.geo.parque;
  if (!geo) return { known: false };
  const features = geo.features || [{ geometry: geo.geometry || geo }];
  const inside = features.some(f => pointInGeometry(lat, lng, f.geometry || f));
  if (!inside) return { known: true, inside: false };
  if (typeof accuracy === 'number' && accuracy > MAX_ACCURACY_M) return { known: true, inside: true, imprecise: true };
  return { known: true, inside: true };
}

function recordLocalFix(parkSlug, lat, lng, accuracy, atMs) {
  const list = localVisits();
  const iso = new Date(atMs).toISOString();
  const open = list.filter(v => v.park === parkSlug)
    .filter(v => Math.abs(atMs - Date.parse(v.lastFixAt)) <= SESSION_GAP_S * 1000)
    .pop();

  if (!open) {
    list.push({ park: parkSlug, startedAt: iso, lastFixAt: iso, fixCount: 1, distanceM: 0, verified: false, lastLat: lat, lastLng: lng });
    saveLocalVisits(list);
    return list[list.length - 1];
  }
  const segment = (typeof open.lastLat === 'number') ? haversineMeters(open.lastLat, open.lastLng, lat, lng) : 0;
  open.fixCount += 1;
  open.distanceM = Math.round((open.distanceM || 0) + segment);
  open.lastFixAt = atMs > Date.parse(open.lastFixAt) ? iso : open.lastFixAt;
  open.lastLat = lat;
  open.lastLng = lng;
  const dwell = (Date.parse(open.lastFixAt) - Date.parse(open.startedAt)) / 1000;
  open.verified = open.fixCount >= MIN_FIXES && dwell >= MIN_DWELL_S;
  saveLocalVisits(list);
  return open;
}

/**
 * Espeja en el dispositivo una visita que el SERVIDOR da por verificada.
 *
 * Sin esto, la app se contradice: la barra (que lee el estado del servidor) dice "presencia
 * verificada" mientras la ficha de cada especie (que predice con lo que sabe el dispositivo) dice
 * "sin verificar". Pasa siempre que la visita se verificó desde otro dispositivo, o antes de un
 * borrado de datos del navegador, o simplemente porque los fixes los subió la cola y el estado
 * llegó de vuelta. El servidor sigue mandando; esto solo pone al día la copia local.
 */
function mergeServerVisit(parkSlug, status) {
  if (!status || !status.verified || status.suspicious || !status.visitId || !status.startedAt) return;
  const list = localVisits();
  let entry = list.find(v => v.park === parkSlug && v.serverId === status.visitId);
  if (!entry) {
    // ¿Hay ya una visita local abierta de este parque? Se adopta en vez de duplicarla.
    entry = list.filter(v => v.park === parkSlug && !v.serverId
      && Math.abs(Date.parse(status.lastFixAt) - Date.parse(v.lastFixAt)) <= SESSION_GAP_S * 1000).pop();
    if (!entry) { entry = { park: parkSlug, distanceM: 0 }; list.push(entry); }
  }
  entry.serverId = status.visitId;
  entry.startedAt = status.startedAt;
  entry.lastFixAt = status.lastFixAt;
  entry.fixCount = status.fixCount;
  entry.verified = true;
  entry.suspicious = false;
  saveLocalVisits(list);
}

/** Adopta el estado que manda el servidor y lo refleja también en la copia local. */
function adoptServerStatus(parkSlug, status) {
  if (!status) return;
  live.status = status;
  mergeServerVisit(parkSlug, status);
}

function localStatusFrom(visit) {
  if (!visit) return { active: false, verified: false, fixCount: 0, dwellSeconds: 0, local: true };
  return {
    active: true,
    verified: !!visit.verified,
    fixCount: visit.fixCount,
    dwellSeconds: Math.round((Date.parse(visit.lastFixAt) - Date.parse(visit.startedAt)) / 1000),
    minFixes: MIN_FIXES,
    minDwellSeconds: MIN_DWELL_S,
    local: true
  };
}

// --- Envío al servidor (o a la cola, si no hay cobertura) ------------------------------------------
function queueFix(parkSlug, fix) {
  if (state.userId == null) return; // invitado: no hay a dónde subirlo
  NaturDexOffline.queuePending({ kind: 'presence', user: state.userId, park: parkSlug, ...fix });
}

async function sendFix(parkSlug, fix) {
  if (state.userId == null) return null;
  if (!NaturDexOffline.isOnline()) { queueFix(parkSlug, fix); return null; }
  try {
    const res = await fetch(API_BASE + '/presence.php', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ park: parkSlug, ...fix }), signal: apiSignal()
    });
    if (!res.ok) throw new Error('presence endpoint unavailable (HTTP ' + res.status + ')');
    return await res.json();
  } catch (e) {
    // Sin red o backend caído: la posición no se pierde, se reintenta al recuperar cobertura (que
    // es el caso normal en un parque: se marca todo sin señal y se sube al volver).
    queueFix(parkSlug, fix);
    return null;
  }
}

/**
 * Vacía la cola de posiciones pendientes. Lo llama app.js al recuperar conexión, junto con la de
 * progreso. Igual que aquella: solo se retira de la cola lo que el servidor confirma.
 * @return {{sent:number, newlyUnlocked:string[]}}
 */
export async function flushPresenceQueue() {
  if (state.userId == null || !NaturDexOffline.isOnline()) return { sent: 0, newlyUnlocked: [] };
  const queue = NaturDexOffline.pendingQueue();
  const mine = queue.filter(e => e && e.kind === 'presence' && e.user === state.userId);
  if (!mine.length) return { sent: 0, newlyUnlocked: [] };

  const byPark = new Map();
  mine.forEach(e => {
    if (!byPark.has(e.park)) byPark.set(e.park, []);
    byPark.get(e.park).push({ lat: e.lat, lng: e.lng, accuracy: e.accuracy, capturedAt: e.capturedAt });
  });

  const sentParks = new Set();
  const newlyUnlocked = [];
  let sent = 0;
  for (const [park, fixes] of byPark) {
    try {
      const res = await fetch(API_BASE + '/presence.php', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ park, fixes }), signal: apiSignal()
      });
      if (!res.ok) throw new Error('presence endpoint unavailable (HTTP ' + res.status + ')');
      const data = await res.json();
      (data.newlyUnlocked || []).forEach(id => newlyUnlocked.push(id));
      if (data.status) { adoptServerStatus(park, data.status); if (park === live.parkSlug) renderBar(); }
      sentParks.add(park);
      sent += fixes.length;
    } catch (e) {
      console.info('No se pudieron subir las posiciones pendientes de ' + park + '; se reintentará.', e);
    }
  }
  if (sentParks.size) {
    NaturDexOffline.setPendingQueue(queue.filter(e =>
      !(e && e.kind === 'presence' && e.user === state.userId && sentParks.has(e.park))));
  }
  return { sent, newlyUnlocked };
}

// --- Entrada de posiciones -------------------------------------------------------------------------
let onUnlocked = null; // app.js inyecta el manejador de logros recién desbloqueados

/**
 * Aporta una posición del GPS a la presencia del parque activo. La llaman el modo explorador
 * (explorer.js, que ya tiene el watchPosition abierto) y el marcado de especies con GPS (app.js):
 * así, quien recorre el parque marcando bichos verifica su visita sin hacer nada especial.
 */
export async function notePresenceFix(lat, lng, accuracy) {
  const parkSlug = live.parkSlug;
  if (!parkSlug || typeof lat !== 'number' || typeof lng !== 'number') return;

  const atMs = Date.now();
  const decision = boundaryDecision(lat, lng, accuracy);
  if (decision.known && !decision.inside) {
    // Fuera del límite oficial: se dice, y no se manda nada (el servidor lo rechazaría igual).
    live.outsideDistanceM = null;
    live.status = { active: false, verified: false, outside: true, fixCount: 0, dwellSeconds: 0 };
    renderBar();
    return;
  }
  live.outsideDistanceM = null;

  // Ritmo de envío: se descarta lo que no aporta, salvo que te hayas movido de sitio.
  const last = live.lastSent;
  const moved = last ? haversineMeters(last.lat, last.lng, lat, lng) : Infinity;
  if (last && (atMs - last.atMs) < SEND_INTERVAL_MS && moved < SEND_DISTANCE_M) return;
  live.lastSent = { lat, lng, atMs };

  const visit = recordLocalFix(parkSlug, lat, lng, accuracy, atMs);
  live.status = localStatusFrom(visit);
  renderBar();

  const fix = { lat, lng, accuracy: typeof accuracy === 'number' ? Math.round(accuracy) : null, capturedAt: new Date(atMs).toISOString() };
  const data = await sendFix(parkSlug, fix);
  if (data) {
    // El servidor manda: su estado sustituye a la predicción local (y la corrige).
    adoptServerStatus(parkSlug, data.status);
    renderBar();
    if (data.newlyUnlocked && data.newlyUnlocked.length && onUnlocked) onUnlocked(data.newlyUnlocked);
  }
}

// --- Seguimiento propio (cuando el modo explorador está apagado) ----------------------------------
// El modo explorador ya sigue la posición con alta precisión, pero es opcional y gasta batería: si
// solo se pudiera verificar con él encendido, mucha gente marcaría cosas en el campo y no le
// contarían. Este seguimiento es el mínimo imprescindible: baja precisión, sin dibujar nada en el
// mapa, y solo si el permiso de ubicación YA estaba concedido (nunca se pide solo).
async function permissionGranted() {
  if (!navigator.permissions || !navigator.permissions.query) return false;
  try { return (await navigator.permissions.query({ name: 'geolocation' })).state === 'granted'; }
  catch (e) { return false; }
}

function startWatch() {
  if (live.watchId != null || geoUnavailableReason()) return;
  live.watchId = navigator.geolocation.watchPosition(
    pos => notePresenceFix(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy),
    () => { /* sin señal: la barra se queda como esté, no hay nada que explicar todavía */ },
    { enableHighAccuracy: false, maximumAge: 30000, timeout: 60000 }
  );
}

function stopWatch() {
  if (live.watchId != null) navigator.geolocation.clearWatch(live.watchId);
  live.watchId = null;
}

/** Enciende el registro de presencia a petición del usuario (botón de la barra). */
export function enablePresenceTracking() {
  const blocked = geoUnavailableReason();
  if (blocked) {
    live.status = { active: false, verified: false, blocked, fixCount: 0, dwellSeconds: 0 };
    renderBar();
    return;
  }
  // Petición explícita: aquí sí se pide el permiso, porque lo ha pedido la persona.
  navigator.geolocation.getCurrentPosition(
    pos => { notePresenceFix(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy); startWatch(); },
    err => {
      live.status = { active: false, verified: false, blocked: err && err.code === 1
        ? 'Sin permiso de ubicación no se pueden verificar tus salidas.' : 'No se pudo obtener tu posición.', fixCount: 0, dwellSeconds: 0 };
      renderBar();
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
  );
}

// --- Barra de estado -------------------------------------------------------------------------------
let barWired = false;

function ensureBar() {
  if (!presenceBar) return null;
  if (!barWired) {
    barWired = true;
    if (presenceAction) presenceAction.addEventListener('click', enablePresenceTracking);
  }
  return presenceBar;
}

function formatMinutes(seconds) {
  const min = Math.floor((seconds || 0) / 60);
  if (min < 60) return min + ' min';
  const h = Math.floor(min / 60);
  return h + ' h ' + (min % 60) + ' min';
}

function renderBar() {
  const bar = ensureBar();
  if (!bar) return;
  const s = presenceStatus();
  bar.hidden = !live.parkSlug || state.parkLevel === 'basic';
  if (bar.hidden) return;

  let cls = 'presence-bar';
  let text;
  let action = null;

  if (s.blocked) {
    cls += ' is-off';
    text = s.blocked;
  } else if (s.outside) {
    cls += ' is-outside';
    text = 'Estás fuera del límite del parque: lo que marques no contará para los logros.';
  } else if (s.suspicious) {
    cls += ' is-outside';
    text = 'Esta visita no se ha podido verificar. Vuelve a activar el GPS y camina un poco.';
  } else if (s.verified) {
    cls += ' is-verified';
    text = 'Presencia verificada · ' + formatMinutes(s.dwellSeconds) + ' en el parque. Lo que marques cuenta.';
  } else if (s.active) {
    cls += ' is-checking';
    const faltan = Math.max(0, (s.minDwellSeconds || MIN_DWELL_S) - (s.dwellSeconds || 0));
    text = 'Verificando tu presencia… ' + (faltan > 0 ? 'sigue por aquí ' + formatMinutes(faltan) + ' más' : 'un momento');
  } else {
    cls += ' is-off';
    text = 'Activa la ubicación para que tus avistamientos cuenten para los logros.';
    action = 'Activar';
  }

  bar.className = cls;
  if (presenceText) presenceText.textContent = text;
  if (presenceAction) {
    presenceAction.hidden = !action;
    if (action) presenceAction.textContent = action;
  }
}

// --- Ciclo de vida ---------------------------------------------------------------------------------
/**
 * Arranca el registro de presencia para un parque. Lo llama app.js al entrar en uno. No pide el
 * permiso de ubicación: si ya estaba concedido, empieza a seguir en silencio; si no, la barra
 * ofrece activarlo. Pedirlo de golpe al entrar sería justo la clase de sobresalto que hace que la
 * gente lo deniegue para siempre.
 */
export async function startPresence(parkSlug, handlers) {
  if (handlers && handlers.onUnlocked) onUnlocked = handlers.onUnlocked;
  if (live.parkSlug !== parkSlug) { stopWatch(); live.lastSent = null; }
  live.parkSlug = parkSlug;
  live.status = null;
  renderBar();
  if (!parkSlug || state.parkLevel === 'basic') return;

  // Estado ya conocido por el servidor (p. ej. la visita de hace un rato sigue abierta).
  if (state.userId != null && NaturDexOffline.isOnline()) {
    try {
      const res = await fetch(API_BASE + '/presence.php?park=' + encodeURIComponent(parkSlug), { signal: apiSignal() });
      if (res.ok) adoptServerStatus(parkSlug, await res.json());
    } catch (e) { /* sin red: se usa lo local */ }
  }
  if (!live.status) {
    const open = localVisits().filter(v => v.park === parkSlug)
      .filter(v => (Date.now() - Date.parse(v.lastFixAt)) <= SESSION_GAP_S * 1000).pop();
    live.status = localStatusFrom(open);
  }
  renderBar();

  if (await permissionGranted()) startWatch();
}

export function stopPresence() {
  stopWatch();
  live.parkSlug = null;
  live.status = null;
  renderBar();
}

/** Repinta la barra (app.js la llama tras cambiar de vista o de parque). */
export function refreshPresenceBar() { renderBar(); }
