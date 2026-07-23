// ================================================================================================
// util.js — helpers puros de NaturDex (sin estado, sin DOM, sin Leaflet).
// ------------------------------------------------------------------------------------------------
// Módulo ES importado por app.js. Aquí viven las funciones sin efectos secundarios: escapado/HTML
// seguro, normalización de texto, emojis e imágenes-placeholder por convención, y geodistancia.
// Primer paso de la modularización del frontend (de cara a la app móvil).
// ================================================================================================

// --- HTML seguro --------------------------------------------------------------------------------
export function escapeHtml(value) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

// Plantilla etiquetada para construir HTML escapando automáticamente cada interpolación (${...}),
// de modo que sea imposible olvidar escapeHtml con datos de la BD/red (defensa contra XSS). Los
// valores que ya son HTML de confianza (resultado de otro html`` o de raw()) no se re-escapan; los
// arrays se concatenan; null/false/undefined se omiten. Uso: el.innerHTML = html`<h2>${dato}</h2>`.
class SafeHtml {
  constructor(value) { this.value = value; }
  toString() { return this.value; }
}
function htmlValue(v) {
  if (v == null || v === false) return '';
  if (v instanceof SafeHtml) return v.value;
  if (Array.isArray(v)) return v.map(htmlValue).join('');
  return escapeHtml(String(v));
}
export function html(strings, ...values) {
  let out = strings[0];
  for (let i = 0; i < values.length; i++) out += htmlValue(values[i]) + strings[i + 1];
  return new SafeHtml(out);
}
// Marca un fragmento como HTML de confianza (ya escapado o estático). Úsalo con cuidado.
export function raw(value) { return new SafeHtml(String(value)); }

// --- Iconos SVG inline ---------------------------------------------------------------------------
// Sustituyen a los emoji nativos en los controles de interfaz (botones, pestañas, insignias): mismo
// trazo (Feather/Lucide, stroke=currentColor) en toda la app, sin depender de qué emoji dibuje cada
// sistema operativo/navegador. Los emoji de contenido (tipo de especie/hábitat/POI en util.js más
// abajo, y los que aparecen dentro de frases) se mantienen: ahí funcionan como ilustración, no como
// icono de interfaz.
const ICON_PATHS = {
  power: '<path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/>',
  close: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  map: '<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>',
  book: '<path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"/>',
  award: '<circle cx="12" cy="8" r="6"/><polyline points="8.5 13.5 7 22 12 19 17 22 15.5 13.5"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="2.5"/>',
  download: '<path d="M20 15v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>',
  trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>',
  volume: '<polygon points="10 5 5 9 2 9 2 15 5 15 10 19 10 5"/><path d="M17.5 5a11 11 0 0 1 0 14M14.5 8a6.5 6.5 0 0 1 0 8"/>',
  trophy: '<path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 5H4a3 3 0 0 0 3 5"/><path d="M17 5h3a3 3 0 0 1-3 5"/>',
  lock: '<rect x="4" y="11" width="16" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'
};

/** Marcado del icono `name` como string (para innerHTML/textContent directo, fuera de html``). */
export function iconMarkup(name, size = 18) {
  const inner = ICON_PATHS[name];
  if (!inner) return '';
  return '<svg class="icon" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
    + 'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + inner + '</svg>';
}

/** Icono `name` listo para interpolar en una plantilla html`` (no se re-escapa). */
export function icon(name, size = 18) { return raw(iconMarkup(name, size)); }

// --- Texto --------------------------------------------------------------------------------------
export function normalize(value) {
  return String(value ?? '').toLocaleLowerCase('es-ES');
}

// --- Especies: emoji e imagen-placeholder -------------------------------------------------------
export function kingdomEmoji(species) {
  if (species.kingdom === 'flora') return '🌿';
  const group = normalize(species.group);
  if (group.includes('ave')) return '🐦';
  if (group.includes('reptil')) return '🦎';
  if (group.includes('anfibio')) return '🐸';
  if (group.includes('mam')) return '🐾';
  return '🐚';
}

export function placeholderImage(species) {
  const bg = species.kingdom === 'flora' ? '#e4f0e7' : '#e1eef5';
  const icon = kingdomEmoji(species);
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">'
    + '<rect width="100%" height="100%" fill="' + bg + '"/>'
    + '<text x="50%" y="55%" font-size="76" text-anchor="middle" dominant-baseline="middle">' + icon + '</text>'
    + '</svg>';
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

export function speciesImageSrc(species) {
  return species.image && species.image.trim() ? species.image : placeholderImage(species);
}

// --- Hábitats: emoji e imagen-placeholder -------------------------------------------------------
// Cada tipo tiene un emoji representativo para la portada cuando aún no hay foto real.
const HABITAT_TYPE_ICONS = { 'Marino': '🌊', 'Litoral': '🏖️', 'Terrestre': '🌿' };

export function habitatEmoji(habitat) {
  return HABITAT_TYPE_ICONS[habitat.type] || '🌿';
}

// Portada temática (degradado en el color del hábitat + emoji + código) que se usa mientras no haya
// una foto real. En cuanto un hábitat tenga `image`, se muestra esa foto en su lugar.
export function habitatPlaceholderImage(habitat) {
  const base = habitat.color || '#2f6f4e';
  const icon = habitatEmoji(habitat);
  const code = escapeHtml(habitat.code || '');
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="380" height="220">'
    + '<defs><linearGradient id="hg" x1="0" y1="0" x2="0" y2="1">'
    + '<stop offset="0" stop-color="' + base + '" stop-opacity="0.85"/>'
    + '<stop offset="1" stop-color="' + base + '" stop-opacity="0.42"/>'
    + '</linearGradient></defs>'
    + '<rect width="100%" height="100%" fill="url(#hg)"/>'
    + '<text x="50%" y="45%" font-size="88" text-anchor="middle" dominant-baseline="middle">' + icon + '</text>'
    + (code ? '<text x="50%" y="82%" font-size="20" font-family="sans-serif" font-weight="700" fill="#ffffff" text-anchor="middle" opacity="0.92">Hábitat ' + code + '</text>' : '')
    + '</svg>';
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

export function habitatImageSrc(habitat) {
  return habitat.image && habitat.image.trim() ? habitat.image : habitatPlaceholderImage(habitat);
}

// --- Puntos de interés: emoji e imagen-placeholder ----------------------------------------------
// Un icono distinto por tipo de punto de interés, en vez de una estrella genérica para todos.
// Nota: 🪨 (roca) y 🦴 (hueso) son emoji Unicode recientes sin glifo a color en muchos motores
// (aparecían como un bloque negro); se usan alternativas con soporte de color universal.
const POI_ICONS = {
  'Cultural': '🏰',
  'Paisajístico': '🏞️',
  'Geológico': '🌋',
  'Acceso': '🚪',
  'Natural': '🌊',
  'Arqueológico': '🏺',
  'Paleontológico': '🦖',
  'Religioso': '⛪'
};

export function poiEmoji(poi) {
  return POI_ICONS[poi.type] || '⭐';
}

export function poiPlaceholderImage(poi) {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="130">'
    + '<rect width="100%" height="100%" fill="#efe6d4"/>'
    + '<text x="50%" y="58%" font-size="48" text-anchor="middle" dominant-baseline="middle">' + poiEmoji(poi) + '</text>'
    + '</svg>';
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

export function poiImageSrc(poi) {
  return poi.image && poi.image.trim() ? poi.image : poiPlaceholderImage(poi);
}

// --- Punto en polígono (ray casting) ------------------------------------------------------------
// ¿Cae la coordenada dentro de una geometría GeoJSON Polygon/MultiPolygon? Se usa para saber en
// qué hábitat está físicamente el usuario (modo explorador). GeoJSON guarda [lng, lat]; el primer
// anillo es el contorno y los siguientes son agujeros.
function ringContains(ring, lat, lng) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    const intersects = ((yi > lat) !== (yj > lat)) && (lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi);
    if (intersects) inside = !inside;
  }
  return inside;
}

export function pointInGeometry(lat, lng, geometry) {
  if (!geometry) return false;
  const polygons = geometry.type === 'Polygon' ? [geometry.coordinates]
    : geometry.type === 'MultiPolygon' ? geometry.coordinates : [];
  return polygons.some(rings => {
    if (!rings.length || !ringContains(rings[0], lat, lng)) return false;
    for (let i = 1; i < rings.length; i++) if (ringContains(rings[i], lat, lng)) return false;
    return true;
  });
}

// --- Geolocalización: diagnóstico ---------------------------------------------------------------
// Los navegadores móviles (Chrome/Android sobre todo) bloquean la geolocalización si la página no
// se sirve en contexto seguro (HTTPS o localhost): fallan al instante con "permission denied" SIN
// mostrar el diálogo de permiso, lo que despista por completo. Estas dos funciones traducen cada
// caso a un mensaje accionable en castellano, para que el usuario sepa si tiene que cambiar la URL,
// tocar los permisos de Android o simplemente salir a cielo abierto.

/** Motivo por el que la geolocalización no puede funcionar aquí, o null si sí puede intentarse. */
export function geoUnavailableReason() {
  if (!('geolocation' in navigator)) return 'Este navegador no tiene geolocalización.';
  if (window.isSecureContext === false) {
    return 'El navegador bloquea la ubicación porque la app no se está sirviendo por HTTPS. '
      + 'Abre la app desde una dirección https:// para usar el GPS.';
  }
  return null;
}

/** Mensaje accionable a partir del GeolocationPositionError (códigos 1/2/3). */
export function geoErrorMessage(error) {
  const code = error && error.code;
  if (code === 1) { // PERMISSION_DENIED
    if (window.isSecureContext === false) return geoUnavailableReason();
    return 'Permiso de ubicación denegado. Tócalo en el icono de candado/ajustes junto a la '
      + 'dirección → Permisos → Ubicación → Permitir. Si no aparece, en Android ve a '
      + 'Ajustes → Aplicaciones → tu navegador → Permisos → Ubicación → Permitir.';
  }
  if (code === 2) { // POSITION_UNAVAILABLE
    return 'No hay señal de ubicación. Comprueba que la ubicación (GPS) del dispositivo está activada.';
  }
  if (code === 3) { // TIMEOUT
    return 'La ubicación tardó demasiado en llegar. Muévete a cielo abierto e inténtalo de nuevo.';
  }
  return 'No se pudo obtener tu posición' + (error && error.message ? ' (' + error.message + ')' : '') + '.';
}

// --- Geodistancia (Haversine, en metros) --------------------------------------------------------
export function haversineMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = d => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
