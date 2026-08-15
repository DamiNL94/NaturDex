// ================================================================================================
// ./achievements/celebracion.js — cola de celebración: el cartel animado. Autocontenido, crea su propio DOM la primera vez
// ------------------------------------------------------------------------------------------------
// Trozo de achievements.js. El índice de la carpeta está en Frontend/Js/CLAUDE.md.
// ================================================================================================

import { apiPostQuiet } from '../api.js';
import { state } from '../state.js';
import { addCelebratedIds, getJSON, loadAchievementsCatalog, lsKey, setJSON } from './almacen.js';

// ================================================================================================
// Cola de celebración: cartel animado. Módulo autocontenido (como el popover de glossary.js): crea
// su propio DOM la primera vez que hace falta, en vez de depender de marcado ya presente en el HTML.
// ================================================================================================
export const queuedOrShown = new Set(); // ids ya encolados/mostrados en ESTA carga de página (anti-duplicado)
let queue = [];
let showing = false;
let regionEl = null;

function ensureRegion() {
  if (regionEl) return regionEl;
  regionEl = document.createElement('div');
  regionEl.id = 'achievementToastRegion';
  regionEl.className = 'achievement-toast-region';
  regionEl.setAttribute('aria-live', 'polite');
  regionEl.setAttribute('aria-atomic', 'true');
  document.body.appendChild(regionEl);
  return regionEl;
}

// "Menos movimiento": el ajuste del sistema o el de la app (Perfil y ajustes → prefs.js).
function prefersReducedMotion() {
  if (window.NaturDexPrefs) return window.NaturDexPrefs.prefersReducedMotion();
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Sonido opcional, silenciado por defecto. Se genera con Web Audio API, sin fichero de audio nuevo
// que empaquetar. Nació aquí con su propia clave de localStorage y hoy es una preferencia más: se
// delega en prefs.js (que adoptó el valor antiguo la primera vez) y se mantiene el camino directo
// como respaldo por si el script de preferencias no estuviera cargado.
function soundEnabled() {
  if (window.NaturDexPrefs) return window.NaturDexPrefs.get('achievementSound') === true;
  return getJSON(lsKey('achievementSound'), false) === true;
}
function setSoundEnabled(v) {
  if (window.NaturDexPrefs) { window.NaturDexPrefs.set('achievementSound', !!v); return; }
  setJSON(lsKey('achievementSound'), !!v);
}
function playChime() {
  if (!soundEnabled()) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [880, 1318.5].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const start = ctx.currentTime + i * 0.09;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.12, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.3);
    });
    setTimeout(() => ctx.close(), 600);
  } catch (e) { /* Web Audio no disponible: sin sonido, sin romper nada */ }
}

function confettiMarkup(rarity) {
  if (prefersReducedMotion()) return '';
  const count = rarity === 'legendario' ? 18 : rarity === 'raro' ? 12 : 7;
  const pieces = Array.from({ length: count }, (_, i) => {
    const left = Math.round(Math.random() * 100);
    const delay = (Math.random() * 0.25).toFixed(2);
    const hue = Math.round(Math.random() * 360);
    return `<i class="confetti-piece" style="left:${left}%;animation-delay:${delay}s;background:hsl(${hue} 70% 55%)"></i>`;
  }).join('');
  return `<div class="achievement-confetti" aria-hidden="true">${pieces}</div>`;
}

async function achievementById(id) {
  const catalog = (await loadAchievementsCatalog()).achievements || [];
  return catalog.find(a => a.id === id) || null;
}

// El eco de la rareza: el cartel no dice solo «Logro desbloqueado», dice CUÁL de los cuatro es. Un
// legendario y un común costaban lo mismo de leer, y no cuestan lo mismo de conseguir.
const RAREZA_ECO = {
  'comun': 'Logro conseguido',
  'poco-comun': 'Logro poco común',
  'raro': 'Logro raro',
  'legendario': '¡Logro legendario!'
};

/** «12 de 55 logros»: saber dónde queda el que se acaba de ganar es parte de la recompensa. */
async function contadorDeLogros() {
  const catalog = (await loadAchievementsCatalog()).achievements || [];
  if (!catalog.length) return '';
  return state.account.achievements.size + ' de ' + catalog.length + ' logros';
}

async function showCard(id) {
  const ach = await achievementById(id);
  const region = ensureRegion();
  const rarity = ach ? ach.rarity : 'comun';
  const card = document.createElement('div');
  card.className = 'achievement-toast rarity-' + rarity + (prefersReducedMotion() ? ' reduced' : '');
  card.setAttribute('role', 'status');
  card.tabIndex = -1;
  const title = ach ? ach.title : 'Logro desbloqueado';
  const desc = ach ? ach.description : '';
  const emoji = ach ? ach.icon : '🏅';
  const contador = await contadorDeLogros();
  // La medalla entra girando; con «menos movimiento» la clase `reduced` la deja quieta (y la regla
  // global de data-motion="reduce" en styles.css neutraliza además cualquier animación que quedara).
  card.innerHTML = `
    ${confettiMarkup(rarity)}
    <span class="achievement-toast-icon medalla-gira" aria-hidden="true">${emoji}</span>
    <div class="achievement-toast-body">
      <p class="achievement-toast-eyebrow">${escapeText(RAREZA_ECO[rarity] || 'Logro desbloqueado')}</p>
      <strong>${escapeText(title)}</strong>
      <p>${escapeText(desc)}</p>
      ${contador ? `<p class="achievement-toast-count">${escapeText(contador)}</p>` : ''}
    </div>
    <div class="achievement-toast-actions">
      <button type="button" class="achievement-toast-sound" aria-pressed="${soundEnabled()}" title="${soundEnabled() ? 'Silenciar el sonido de logro' : 'Activar el sonido de logro'}">${soundEnabled() ? '🔊' : '🔈'}</button>
      <button type="button" class="achievement-toast-close" aria-label="Cerrar aviso">✕</button>
    </div>`;
  region.appendChild(card);
  playChime();
  requestAnimationFrame(() => card.classList.add('in'));

  let dismissed = false;
  const dismiss = () => {
    if (dismissed) return;
    dismissed = true;
    card.classList.remove('in');
    card.classList.add('out');
    setTimeout(() => card.remove(), prefersReducedMotion() ? 0 : 320);
  };
  card.querySelector('.achievement-toast-close').addEventListener('click', dismiss);
  card.querySelector('.achievement-toast-sound').addEventListener('click', (e) => {
    setSoundEnabled(!soundEnabled());
    e.currentTarget.textContent = soundEnabled() ? '🔊' : '🔈';
    e.currentTarget.setAttribute('aria-pressed', String(soundEnabled()));
    if (soundEnabled()) playChime();
  });
  card.addEventListener('keydown', e => { if (e.key === 'Escape') dismiss(); });

  const timeout = setTimeout(dismiss, 5000);
  await new Promise(resolve => {
    card.addEventListener('transitionend', function onEnd(e) {
      if (e.propertyName !== 'opacity' || !dismissed) return;
      card.removeEventListener('transitionend', onEnd);
      clearTimeout(timeout);
      resolve();
    });
    // Salvaguarda por si transitionend no llega (reduced motion, pestaña en segundo plano...).
    setTimeout(() => resolve(), 6000);
  });
}

function escapeText(s) {
  const div = document.createElement('div');
  div.textContent = String(s ?? '');
  return div.innerHTML;
}

export function showBackfillSummary(ids) {
  // Con los avisos desactivados, el resumen de "progreso anterior" tampoco interrumpe.
  if (window.NaturDexPrefs && window.NaturDexPrefs.get('celebrations') === false) { markCelebrated(ids); return; }
  const region = ensureRegion();
  const card = document.createElement('div');
  card.className = 'achievement-toast discreet';
  card.setAttribute('role', 'status');
  card.innerHTML = `
    <span class="achievement-toast-icon" aria-hidden="true">🏅</span>
    <div class="achievement-toast-body">
      <strong>Has desbloqueado ${ids.length} ${ids.length === 1 ? 'logro' : 'logros'} con tu progreso anterior</strong>
      <p>Puedes verlos en tu progreso estatal.</p>
    </div>
    <button type="button" class="achievement-toast-close" aria-label="Cerrar aviso">✕</button>`;
  region.appendChild(card);
  requestAnimationFrame(() => card.classList.add('in'));
  const dismiss = () => { card.classList.remove('in'); card.classList.add('out'); setTimeout(() => card.remove(), 320); };
  card.querySelector('.achievement-toast-close').addEventListener('click', dismiss);
  setTimeout(dismiss, 6000);
  markCelebrated(ids);
}

async function markCelebrated(ids) {
  addCelebratedIds(ids);
  ids.forEach(id => {
    const entry = state.account.achievements.get(id);
    if (entry) entry.celebratedAt = new Date().toISOString();
  });
  if (state.userId != null) {
    // Si falla, se reintentará en la próxima sincronización (removeCelebratedIds no las borra).
    await apiPostQuiet('/account-progress.php', { type: 'celebrate', ids });
  }
}

async function runQueue() {
  if (showing) return;
  showing = true;
  while (queue.length) {
    // Más de 3 desbloqueados de golpe (muy probable al sincronizar tras una salida al campo): se
    // agrupan en un único aviso en vez de encadenar N carteles.
    if (queue.length > 3) {
      const batch = queue.splice(0, queue.length);
      showGroupedLive(batch);
      await markCelebrated(batch);
      continue;
    }
    const id = queue.shift();
    await showCard(id);
    await markCelebrated([id]);
  }
  showing = false;
}

function showGroupedLive(ids) {
  const region = ensureRegion();
  const card = document.createElement('div');
  card.className = 'achievement-toast grouped' + (prefersReducedMotion() ? ' reduced' : '');
  card.setAttribute('role', 'status');
  card.innerHTML = `
    ${confettiMarkup('raro')}
    <span class="achievement-toast-icon" aria-hidden="true">🎉</span>
    <div class="achievement-toast-body">
      <strong>¡${ids.length} logros nuevos!</strong>
      <p>Consulta tu progreso estatal para verlos todos.</p>
    </div>
    <button type="button" class="achievement-toast-close" aria-label="Cerrar aviso">✕</button>`;
  region.appendChild(card);
  playChime();
  requestAnimationFrame(() => card.classList.add('in'));
  const dismiss = () => { card.classList.remove('in'); card.classList.add('out'); setTimeout(() => card.remove(), 320); };
  card.querySelector('.achievement-toast-close').addEventListener('click', dismiss);
  card.addEventListener('click', e => { if (!e.target.closest('.achievement-toast-close') && window.naturdexShowAccountProgress) window.naturdexShowAccountProgress(); });
  setTimeout(dismiss, 5000);
}

export function celebrate(ids) {
  const fresh = (ids || []).filter(id => !queuedOrShown.has(id));
  if (!fresh.length) return;
  fresh.forEach(id => queuedOrShown.add(id));
  // Avisos de logro desactivados (Perfil y ajustes): el logro se gana y se registra igual, solo que
  // sin cartel. Se marca como celebrado para que no reaparezca en cuanto se vuelvan a activar.
  if (window.NaturDexPrefs && window.NaturDexPrefs.get('celebrations') === false) {
    markCelebrated(fresh);
    return;
  }
  queue.push(...fresh);
  runQueue();
}
