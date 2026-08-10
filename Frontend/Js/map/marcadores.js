// ================================================================================================
// ./map/marcadores.js — marcadores de especies y de puntos de interés
// ------------------------------------------------------------------------------------------------
// Trozo de map.js. El índice de la carpeta está en Frontend/Js/CLAUDE.md.
// ================================================================================================

import { speciesLatLng, state } from '../state.js';
import { revealOn } from './camara.js';
import { PANES, handlers, map } from './core.js';
import { poiDivIcon, speciesDivIcon } from './iconos.js';

// --- Marcadores de especies y puntos de interés ----------------------------------------------------
export function renderMarkers() {
  // La ubicación de una especie en el mapa se revela solo cuando el usuario la marca como vista
  // (es parte de la mecánica tipo pokédex, no un inventario de localizaciones pre-cargado).
  state.speciesCluster.clearLayers();
  state.markers.clear();
  state.data.species.forEach(species => {
    if (!state.seenSpecies.has(species.id)) return;
    // Las especies sin coordenada de catálogo (p. ej. las aves de la ZEPA, que vuelan) no tienen
    // un punto fijo, pero SÍ adquieren ubicación cuando el usuario las marca como vistas con GPS:
    // speciesLatLng antepone el avistamiento. Solo se quedan sin marcador si tampoco hay eso.
    const latLng = speciesLatLng(species);
    if (!latLng) return;
    const marker = L.marker(latLng, { icon: speciesDivIcon(species), pane: PANES.species });
    // Sin globo: tocar el marcador abre la ficha completa en el mismo sitio donde el usuario ya lee
    // las fichas (la columna de la derecha en escritorio, la hoja deslizante en móvil). Un globo
    // encima del mapa era un TERCER contenedor de información, con su propio cierre y su propia
    // forma de descartarse, para decir menos que la ficha.
    if (!L.Browser.touch) marker.bindTooltip(species.commonName, { direction: 'top', offset: [0, -12] });
    marker.on('click', () => {
      if (handlers.onSelectSpecies) handlers.onSelectSpecies(species.id, false);
      revealOn(latLng, map.getZoom()); // recolocar bajo la ficha: si no, la hoja lo tapa
    });
    state.speciesCluster.addLayer(marker);
    state.markers.set(species.id, marker);
  });
}

// Parte de los puntos de interés se ubicaron con topónimos y posiciones de OpenStreetMap (ODbL) y el
// resto sale del PORN, de la CARM o de fuentes documentales. Acreditar a OSM en bloque por la capa
// entera atribuiría mal los segundos, así que el crédito lo declara cada marcador según su propio
// `source`: aparece solo si hay en pantalla algún punto que de verdad venga de OSM, y se va con
// ellos al cambiar de parque. El `source` completo de cada punto sigue en su ficha; esto es el
// crédito visible permanente, que no puede depender de qué capa base esté activa.
const POI_OSM_CREDIT = 'Puntos de interés: &copy; OpenStreetMap contributors (ODbL)';
function poiAttribution(poi) {
  return /openstreetmap/i.test(poi.source || '') ? POI_OSM_CREDIT : undefined;
}

export function renderPoiMarkers() {
  state.poiGroup.clearLayers();
  state.poiMarkers.clear();
  const pois = state.data.pointsOfInterest || [];
  pois.forEach(poi => {
    // Un POI siempre debería venir ubicado, pero una ficha antigua sin coordenadas haría reventar
    // a L.marker(null). Se salta: mejor que falte un marcador a que se caiga el mapa entero.
    if (!poi.coordinates) return;
    const seen = state.seenPois.has(poi.id);
    const marker = L.marker(poi.coordinates, {
      icon: poiDivIcon(poi, seen), pane: PANES.pois, attribution: poiAttribution(poi)
    }).addTo(state.poiGroup);
    // Igual que las especies: la ficha del punto de interés se abre donde se abren todas las fichas.
    // El globo anterior traía foto de 180 px, descripción, audioguía y botón: en un móvil ocupaba
    // casi la pantalla entera, Leaflet no conseguía encajarlo y quedaba cortado por arriba o debajo
    // de la nav. Ahora ese mismo contenido cabe en la hoja, que ya sabe deslizarse, hacer scroll y
    // cerrarse con el velo, con la ✕ o con «atrás».
    if (!L.Browser.touch) marker.bindTooltip(poi.name, { direction: 'top', offset: [0, -12] });
    marker.on('click', () => {
      if (handlers.onSelectPoi) handlers.onSelectPoi(poi.id);
      revealOn(poi.coordinates, Math.max(map.getZoom(), 15));
    });
    state.poiMarkers.set(poi.id, marker);
  });
}
