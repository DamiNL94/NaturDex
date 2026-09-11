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
export const rarityFilterGroup = document.querySelector('#rarityFilterGroup');
export const rarityFilter = document.querySelector('#rarityFilter');
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
// Plegado de la cabecera. #parkFold es lo que se esconde (descripción + recuentos); la barra lleva
// el progreso, que NO se pliega, y el botón que lo pliega. En un espacio de ficha base se apaga la
// BARRA entera —no hay recuentos ni progreso que plegar— y el bloque se fuerza desplegado, porque
// el estado es global y si no la descripción se quedaría escondida sin botón (app.js ·
// applyParkLevel e initParkFold).
export const parkFold = document.querySelector('#parkFold');
// El tiempo del espacio (AEMET). Vive DENTRO de #parkFold, así que se pliega con la descripción y
// los recuentos: ver el porqué en el marcado de index.html. Nace `hidden` y lo enciende
// render/tiempo.js solo cuando hay dato — sin backend, sin conexión o sin municipio resuelto se
// queda apagado y la cabecera mide exactamente lo que medía antes.
export const parkWeather = document.querySelector('#parkWeather');
export const parkFoldBar = document.querySelector('#parkFoldBar');
export const parkFoldToggle = document.querySelector('#parkFoldToggle');
export const progressTrack = document.querySelector('#progressTrack');
export const progressFill = document.querySelector('#progressFill');
export const progressLabel = document.querySelector('#progressLabel');

// Aviso de "ficha base" (parques con status "basic": sin catálogo de especies ni hábitats)
export const basicNotice = document.querySelector('#basicNotice');

// Pestaña de progreso y panel de detalle
export const progressPanel = document.querySelector('#progressPanel');
export const invasorasPanel = document.querySelector('#invasorasPanel');
export const diccionarioPanel = document.querySelector('#diccionarioPanel');
export const biodiversidadPanel = document.querySelector('#biodiversidadPanel');
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

// Estado offline. El botón de descarga NO está en la barra: vive como icono en .park-nav, junto al
// diccionario y al perfil (ver el comentario de index.html). La barra solo aparece cuando NO hay
// conexión, y #offlineProgress es su canal para lectores de pantalla mientras se descarga: el
// avance que se pinta dentro del icono no lo ve nadie que no mire la pantalla.
export const saveOfflineBtn = document.querySelector('#saveOfflineBtn');
export const connStatus = document.querySelector('#connStatus');
export const offlineBar = document.querySelector('#offlineBar');
export const offlineProgress = document.querySelector('#offlineProgress');

// Barra de presencia verificada (¿cuenta para los logros lo que marco ahora mismo?)
export const presenceBar = document.querySelector('#presenceBar');
export const presenceText = document.querySelector('#presenceText');
export const presenceAction = document.querySelector('#presenceAction');

// Progreso de cuenta (ámbito estatal, pantalla propia fuera de un parque)
export const accountProgressBody = document.querySelector('#accountProgressBody');

// Perfil y ajustes (pantalla propia: cuenta, preferencias, datos y ayuda)
export const profileBody = document.querySelector('#profileBody');
