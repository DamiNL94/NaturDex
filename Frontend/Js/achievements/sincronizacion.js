// ================================================================================================
// ./achievements/sincronizacion.js — recalcula (local u online), evalúa y refresca state.account; sincroniza con el servidor
// ------------------------------------------------------------------------------------------------
// Trozo de achievements.js. El índice de la carpeta está en Frontend/Js/CLAUDE.md.
// ================================================================================================

import { apiGetJson } from '../api.js';
import { localVerifiedWindows } from '../presence.js';
import { state } from '../state.js';
import { computeLocalAggregates, evaluateLocally } from './agregacion.js';
import { getCelebratedIds, removeCelebratedIds } from './almacen.js';
import { celebrate, queuedOrShown, showBackfillSummary } from './celebracion.js';

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
export async function refreshLocal() {
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
    const data = await apiGetJson('/account-progress.php');
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
