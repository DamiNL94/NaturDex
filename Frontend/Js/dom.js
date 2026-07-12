// ================================================================================================
// dom.js — referencias a los elementos del DOM de la pantalla del parque.
// ------------------------------------------------------------------------------------------------
// Módulo ES importado por app.js (y por los futuros render.js). Centraliza todos los
// `querySelector` para que el resto de módulos no toquen el documento directamente. Se evalúa al
// importarse: como app.js es un <script type="module"> (deferred), el DOM ya está parseado.
// ================================================================================================

// Catálogo (barra lateral)
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
export const speciesCount = document.querySelector('#speciesCount');
export const habitatCount = document.querySelector('#habitatCount');
export const coastlineKm = document.querySelector('#coastlineKm');
export const parkSummary = document.querySelector('#parkSummary');
export const progressTrack = document.querySelector('#progressTrack');
export const progressFill = document.querySelector('#progressFill');
export const progressLabel = document.querySelector('#progressLabel');

// Pestaña de progreso y panel de detalle
export const progressPanel = document.querySelector('#progressPanel');
export const detailPanel = document.querySelector('#detailPanel');
export const sheetClose = document.querySelector('#sheetClose'); // cierre de la bottom-sheet (móvil)

// Modo explorador ("cerca de ti")
export const explorerToggle = document.querySelector('#explorerToggle');
export const nearbyPanel = document.querySelector('#nearbyPanel');
export const nearbyStatus = document.querySelector('#nearbyStatus');
export const nearbyList = document.querySelector('#nearbyList');
export const nearbyClose = document.querySelector('#nearbyClose');

// Barra de estado offline
export const saveOfflineBtn = document.querySelector('#saveOfflineBtn');
export const connStatus = document.querySelector('#connStatus');
