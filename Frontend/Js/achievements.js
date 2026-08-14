// ================================================================================================
// achievements.js — progreso de CUENTA (ámbito estatal) y logros. ÍNDICE de los módulos de achievements/.
// ------------------------------------------------------------------------------------------------
// Este fichero ya no tiene lógica: reexporta lo de `achievements/` para que quien importe siga
// escribiendo `from './achievements.js'` como siempre. El orden de abajo es el de dependencia:
//
//   achievements/almacen.js        catálogo de logros + almacenamiento local POR CUENTA + semana ISO
//   achievements/agregacion.js     espejo local de computeAccountAggregates() del backend
//   achievements/celebracion.js    la cola del cartel animado (autocontenida, crea su propio DOM)
//   achievements/sincronizacion.js recalcula, evalúa y sincroniza con el servidor
//   achievements/eventos.js        lo que llaman app.js y glossary.js cuando pasa algo
//   achievements/arranque.js       migración invitado → cuenta e init
//
// El ámbito de almacenamiento es LA CUENTA, no el parque: esta capa agrega sobre todos los espacios.
// La agregación local es un espejo *best-effort* del backend; la verdad la tiene el servidor, y por
// eso syncWithServer() puede corregir lo que el cálculo local había adelantado sin conexión.
//
// Un módulo nuevo aquí hay que añadirlo a SHELL_ASSETS en Frontend/sw.js o rompe el modo offline.
// ================================================================================================

import './achievements/agregacion.js';

export { loadAchievementsCatalog, loadRegistry } from './achievements/almacen.js';
export { celebrate } from './achievements/celebracion.js';
export { handleServerNewlyUnlocked, refreshAccountProgress, syncWithServer } from './achievements/sincronizacion.js';
export { isInvasiveSeenLocally, noteParkActivity, reportGlossaryView, reportInvasiveSeen } from './achievements/eventos.js';
export { initAchievements } from './achievements/arranque.js';
