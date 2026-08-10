// ================================================================================================
// map.js — todo lo que toca Leaflet. ÍNDICE de los módulos de map/.
// ------------------------------------------------------------------------------------------------
// Este fichero ya no tiene lógica: reexporta lo de `map/` para que quien importe siga escribiendo
// `from './map.js'` como siempre. El orden de abajo es el de dependencia, de más básico a más alto:
//
//   map/core.js        la instancia `map`, las capas base y los planos. TODO lo demás depende de él
//   map/iconos.js      iconos DIV de especie, POI y usuario
//   map/tramas.js      SVG a pelo: tramas por grupo de hábitat y recortes al recinto
//   map/camara.js      encuadre, entrada escalonada, punto azul de tu posición
//   map/marcadores.js  marcadores de especies y de puntos de interés
//   map/capas.js       zonas protegidas, senderos, zonas de hábitat y su visibilidad
//
// Dos reglas que valen para todos:
//   · las acciones de la app las inyecta app.js con setMapHandlers(); ningún módulo de map/ importa
//     app.js, y por eso no hay ciclo.
//   · todo encuadre pasa por chromeInset() (core.js): el autoPan de Leaflet solo garantiza que el
//     globo entre en el contenedor, que en móvil está tapado arriba y abajo.
//
// Un módulo nuevo aquí hay que añadirlo a SHELL_ASSETS en Frontend/sw.js o rompe el modo offline.
// ================================================================================================

import './map/iconos.js';
import './map/tramas.js';

export { PANES, activeBaseKind, applyBaseChoice, baseOSM, basePNOA, hasParkBaseLayer, map, parkBaseLayer, setMapHandlers, setupParkBaseLayer } from './map/core.js';
export { clearUserMarker, ensureMapSized, fitOn, focusHabitatOnMap, focusOn, placeUserMarker, playEntrySequence, revealOn } from './map/camara.js';
export { renderMarkers, renderPoiMarkers } from './map/marcadores.js';
export { TRAIL_STYLES, focusHabitatGroupOnMap, highlightHabitat, renderHabitatZones, renderProtectedAreas, renderTrails, setHabitatGroupVisible, setHabitatVisible, soloHabitat, soloHabitatGroup, trailKind } from './map/capas.js';
