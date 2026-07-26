// ================================================================================================
// notice.js — avisos discretos (tipo "toast") para cosas que no deben interrumpir al usuario.
// ------------------------------------------------------------------------------------------------
// Nace con el modo sin conexión: "este parque tiene fotos nuevas", "guárdalo antes de salir de
// ruta". Todo eso pasa mientras la persona está explorando y nada de ello merece un modal.
//
// Reutiliza a propósito la región y las clases de los avisos de logro (achievements.js) en vez de
// montar una pila propia: son dos posiciones fijas en la misma esquina, así que con dos regiones
// distintas los avisos se taparían entre sí. Compartiendo el contenedor flex se apilan solos.
// ================================================================================================

const REGION_ID = 'achievementToastRegion';

function ensureRegion() {
  let region = document.getElementById(REGION_ID);
  if (region) return region;
  region = document.createElement('div');
  region.id = REGION_ID;
  region.className = 'achievement-toast-region';
  region.setAttribute('aria-live', 'polite');
  region.setAttribute('aria-atomic', 'true');
  document.body.appendChild(region);
  return region;
}

function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = String(s ?? '');
  return div.innerHTML;
}

// Un aviso por "tema": si el usuario cambia de parque dos veces seguidas no queremos tres carteles
// de "guarda este parque" apilados. La clave la pone quien llama.
const openByKey = new Map();

/**
 * Muestra un aviso discreto. Devuelve una función para cerrarlo a mano.
 * `action` es opcional: { label, onClick }. Con acción, el aviso NO se cierra solo — si desaparece
 * antes de que dé tiempo a leerlo y pulsarlo, el botón no sirve de nada.
 */
export function showNotice({ key, icon = 'ℹ️', title, text, action = null, timeout = 7000 }) {
  const previous = openByKey.get(key);
  if (previous) previous();

  const region = ensureRegion();
  const card = document.createElement('div');
  card.className = 'achievement-toast discreet';
  card.setAttribute('role', 'status');
  card.innerHTML = `
    <span class="achievement-toast-icon" aria-hidden="true">${escapeHtml(icon)}</span>
    <div class="achievement-toast-body">
      <strong>${escapeHtml(title)}</strong>
      ${text ? `<p>${escapeHtml(text)}</p>` : ''}
      ${action ? `<button type="button" class="notice-action">${escapeHtml(action.label)}</button>` : ''}
    </div>
    <button type="button" class="achievement-toast-close" aria-label="Cerrar aviso">✕</button>`;

  region.appendChild(card);
  requestAnimationFrame(() => card.classList.add('in'));

  let timer = null;
  const dismiss = () => {
    if (timer) clearTimeout(timer);
    if (openByKey.get(key) === dismiss) openByKey.delete(key);
    card.classList.remove('in');
    card.classList.add('out');
    setTimeout(() => card.remove(), 320);
  };
  if (key) openByKey.set(key, dismiss);

  card.querySelector('.achievement-toast-close').addEventListener('click', dismiss);
  const actionBtn = card.querySelector('.notice-action');
  if (actionBtn) {
    actionBtn.addEventListener('click', () => { dismiss(); action.onClick(); });
  } else if (timeout) {
    timer = setTimeout(dismiss, timeout);
  }
  return dismiss;
}
