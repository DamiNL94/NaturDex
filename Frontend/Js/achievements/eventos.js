// ================================================================================================
// ./achievements/eventos.js — los eventos que alimentan el progreso de cuenta; los llaman app.js y glossary.js
// ------------------------------------------------------------------------------------------------
// Trozo de achievements.js. El índice de la carpeta está en Frontend/Js/CLAUDE.md.
// ================================================================================================

import { apiPostQuiet } from '../api.js';
import { state } from '../state.js';
import { normalize } from '../util.js';
import { addLocalParkIndex, getJSON, lsKey, recordLocalActivity, setJSON } from './almacen.js';
import { handleServerNewlyUnlocked, refreshLocal } from './sincronizacion.js';

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
    // offline: la predicción local ya quedó registrada y se reconcilia al reconectar, así que un
    // fallo aquí no debe romper nada (apiPostQuiet devuelve null en vez de lanzar).
    const data = await apiPostQuiet('/account-progress.php', { type: 'invasive', scientificName, ccaa });
    if (data) handleServerNewlyUnlocked(data.newlyUnlocked);
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
    const data = await apiPostQuiet('/account-progress.php', { type: 'glossary', term });
    if (data) handleServerNewlyUnlocked(data.newlyUnlocked);
  }
}
