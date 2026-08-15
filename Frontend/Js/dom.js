// ================================================================================================
// dom.js — referencias a los elementos del DOM de la pantalla del parque.
// ------------------------------------------------------------------------------------------------
// Módulo ES importado por app.js (y por los futuros render.js). Centraliza todos los
// `querySelector` para que el resto de módulos no toquen el documento directamente. Se evalúa al
// importarse: como app.js es un <script type="module"> (deferred), el DOM ya está parseado.
// ================================================================================================

// Catálogo (barra lateral)
// La barra lateral es el contenedor que SCROLLEA en móvil (allí es la pantalla entera): al conmutar
// de pestaña o de nivel del catálogo hay que devolverla arriba, o la vista entrante aparece a media
// altura con el texto cortado (ver app.js · vistaArriba).
export const sidebar = document.querySelector('.sidebar');
export const speciesList = document.querySelector('#speciesList');
export const searchInput = document.querySelector('#searchInput');
export const resultCount = document.querySelector('#resultCount');
export const catalogControls = document.querySelector('#catalogControls');
export const catalogPanel = document.querySelector('#catalogPanel');
export const catalogCrumb = document.querySelector('#catalogCrumb');
export const catalogCrumbLabel = document.querySelector('#catalogCrumbLabel');
export const backToHabitatsBtn = document.querySelector('#backToHabitats');
export const catalogTitle = document.querySelector('#catalogTitle');
export const speciesFilterGroup = document.querySelector('#speciesFilterGroup');
export const searchLabel = document.querySelector('#searchLabel');

// Cabecera del parque (resumen y progreso)
export const parkTitle = document.querySelector('#parkTitle');
export const parkEyebrow = document.querySelector('#parkEyebrow');
export const speciesCount = document.querySelector('#speciesCount');
export const habitatCount = document.querySelector('#habitatCount');
export const poiCount = document.querySelector('#poiCount');
export const parkSummary = document.querySelector('#parkSummary');
export const parkStats = document.querySelector('#parkStats');
export const parkProgressWrap = document.querySelector('#parkProgressWrap');
export const progressTrack = document.querySelector('#progressTrack');
export const progressFill = document.querySelector('#progressFill');
export const progressLabel = document.querySelector('#progressLabel');

// Aviso de "ficha base" (parques con status "basic": sin catálogo de especies ni hábitats)
export const basicNotice = document.querySelector('#basicNotice');

// Pestaña de progreso y panel de detalle
export const progressPanel = document.querySelector('#progressPanel');
export const invasorasPanel = document.querySelector('#invasorasPanel');
export const diccionarioPanel = document.querySelector('#diccionarioPanel');
export const detailPanel = document.querySelector('#detailPanel');
export const sheetClose = document.querySelector('#sheetClose'); // cierre de la bottom-sheet (móvil)
export const sheetScrim = document.querySelector('#sheetScrim'); // velo tras la bottom-sheet (móvil)

// Modo explorador ("cerca de ti"). El mismo botón enciende el GPS y el seguimiento del mapa.
export const explorerToggle = document.querySelector('#explorerToggle');
export const nearbyPanel = document.querySelector('#nearbyPanel');
export const nearbyStatus = document.querySelector('#nearbyStatus');
export const nearbyList = document.querySelector('#nearbyList');
export const nearbyClose = document.querySelector('#nearbyClose');
export const explorerHint = document.querySelector('#explorerHint');

// Panel de capas del mapa
export const layersToggle = document.querySelector('#layersToggle');
export const layersPanel = document.querySelector('#layersPanel');

// Barra de estado offline
export const saveOfflineBtn = document.querySelector('#saveOfflineBtn');
export const connStatus = document.querySelector('#connStatus');

// Barra de presencia verificada (¿cuenta para los logros lo que marco ahora mismo?)
export const presenceBar = document.querySelector('#presenceBar');
export const presenceText = document.querySelector('#presenceText');
export const presenceAction = document.querySelector('#presenceAction');

// Progreso de cuenta (ámbito estatal, pantalla propia fuera de un parque)
export const accountProgressBody = document.querySelector('#accountProgressBody');

// Perfil y ajustes (pantalla propia: cuenta, preferencias, datos y ayuda)
export const profileBody = document.querySelector('#profileBody');
