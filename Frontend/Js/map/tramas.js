// ================================================================================================
// ./map/tramas.js — trabajo directo sobre el SVG de Leaflet: tramas por grupo de hábitat y recortes al propio recinto
// ------------------------------------------------------------------------------------------------
// Trozo de map.js. El índice de la carpeta está en Frontend/Js/CLAUDE.md.
// ================================================================================================

import { map } from './core.js';

// --- Trabajo directo sobre el SVG: tramas y recortes ------------------------------------------------
// Leaflet dibuja cada polígono como un <path> dentro del <svg> del plano que le toca, y no conoce ni
// tramas ni recortes: hay que inyectar los <pattern>/<clipPath> en los <defs> de ESE svg y apuntar
// el atributo del path a su id. Dos avisos que explican la forma de todo lo que sigue:
//   · Leaflet crea un <path> NUEVO cada vez que la capa vuelve al mapa (encender un hábitat en el
//     panel de capas), así que la trama se re-aplica desde el evento 'add' de la capa, no una vez.
//   · setStyle() reescribe fill y fill-opacity desde las opciones, así que después de tocar el
//     estilo (resaltado del hábitat que estás pisando) hay que volver a poner la trama.
export const SVG_NS = 'http://www.w3.org/2000/svg';
export const PAPER = '#FBF7EE'; // crema del casing: el mismo papel sobre el que se lee todo el plano

/** Recorre los <path> ya montados de una capa (una geometría suelta o un grupo GeoJSON). */
export function eachPath(layer, fn) {
  if (layer._path) fn(layer._path, layer);
  if (layer.eachLayer) layer.eachLayer(child => eachPath(child, fn));
}

export function svgDefs(path) {
  const svg = path.ownerSVGElement;
  if (!svg) return null;
  let defs = svg.querySelector('defs');
  if (!defs) {
    defs = document.createElementNS(SVG_NS, 'defs');
    svg.insertBefore(defs, svg.firstChild);
  }
  return defs;
}

// Recorte de un trazo contra su propia geometría. Un <stroke> SVG siempre se pinta centrado sobre la
// línea: para una "banda interior" se dibuja un trazo del doble de ancho y se le quita la mitad de
// fuera recortándolo contra el mismo polígono. El <clipPath> lleva una copia del `d` del path, que
// Leaflet recalcula al mover o hacer zoom, así que se resincroniza con la vista.
let clipSeq = 0;
const selfClips = [];

export function clipPathsToSelf(layer) {
  eachPath(layer, path => {
    const defs = svgDefs(path);
    if (!defs) return;
    const id = 'nd-clip-' + (++clipSeq);
    const clip = document.createElementNS(SVG_NS, 'clipPath');
    clip.setAttribute('id', id);
    const shape = document.createElementNS(SVG_NS, 'path');
    shape.setAttribute('d', path.getAttribute('d') || '');
    clip.appendChild(shape);
    defs.appendChild(clip);
    path.setAttribute('clip-path', 'url(#' + id + ')');
    selfClips.push({ clip, shape, path });
  });
  syncSelfClips();
}

function syncSelfClips() {
  for (let i = selfClips.length - 1; i >= 0; i--) {
    const entry = selfClips[i];
    // Capa dada de baja (cambio de parque, capa apagada): su <path> ya no está en el documento y el
    // recorte se queda huérfano. Se limpia aquí y no en un removeLayer para no depender del camino
    // por el que la capa desapareció.
    if (!entry.path.isConnected) { entry.clip.remove(); selfClips.splice(i, 1); continue; }
    entry.shape.setAttribute('d', entry.path.getAttribute('d') || '');
  }
}
map.on('zoomend viewreset moveend', syncSelfClips);
