// ================================================================================================
// render.js — pintado del DOM. ÍNDICE de los módulos de render/.
// ------------------------------------------------------------------------------------------------
// Este fichero ya no tiene lógica: reexporta lo de `render/` para que quien importe siga escribiendo
// `from './render.js'` como siempre. La lógica está partida por pantalla, que es como se lee y como
// se toca:
//
//   render/fallbacks.js   sustitutos de imagen rota (window.__*Fallback), sin exports
//   render/catalogo.js    catálogo en tres niveles: grupos → hábitats → especies
//   render/resumen.js     cabecera del parque, ficha base y barra de progreso
//   render/detalle.js     ficha de especie, de hábitat y de POI
//   render/invasoras.js   pestaña de invasoras
//   render/progreso.js    progreso del parque, progreso de cuenta, historial de salidas
//   render/tiempo.js      el tiempo del espacio en la cabecera (AEMET)
//
// Reglas que siguen valiendo para todos ellos: leen el estado (state.js), escriben en los nodos
// (dom.js) y SIEMPRE generan HTML con la plantilla html`` de util.js (escapado automático,
// anti-XSS). No registran eventos de usuario: eso es de app.js.
//
// Un módulo nuevo aquí hay que añadirlo a SHELL_ASSETS en Frontend/sw.js o rompe el modo offline.
// ================================================================================================

import './render/fallbacks.js';

export { renderCatalogBody, renderHabitatCatalog, renderHabitatGroups, renderSpeciesList } from './render/catalogo.js';
export { renderBasicPark, renderProgress, renderSummary } from './render/resumen.js';
export { renderDetail } from './render/detalle.js';
export { renderInvasoras } from './render/invasoras.js';
export { renderAccountProgress, renderProgressTab } from './render/progreso.js';
export { renderTiempo } from './render/tiempo.js';
