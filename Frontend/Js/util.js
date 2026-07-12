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

// --- Geodistancia (Haversine, en metros) --------------------------------------------------------
export function haversineMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = d => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
