// ================================================================================================
// ./achievements/arranque.js — migración de datos de invitado a cuenta registrada, y arranque del módulo
// ------------------------------------------------------------------------------------------------
// Trozo de achievements.js. El índice de la carpeta está en Frontend/Js/CLAUDE.md.
// ================================================================================================

import { state } from '../state.js';
import { getJSON, loadAchievementsCatalog } from './almacen.js';
import { refreshLocal, syncWithServer } from './sincronizacion.js';

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
