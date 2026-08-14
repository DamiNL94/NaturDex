// ================================================================================================
// tutorial.js — tutorial de bienvenida (onboarding) por pasos, tipo "spotlight"/coach-marks.
// ------------------------------------------------------------------------------------------------
// Dos tramos: 'select' (elegir parque, pantalla screen-select) y 'park' (la app completa, pantalla
// screen-park). Cada tramo se dispara solo la PRIMERA vez que el usuario llega a su pantalla
// (auth.js llama a maybeAutoStart) y puede relanzarse a mano con los botones "?" de la cabecera
// (junto a cerrar sesión). El "ya visto" se guarda por usuario en localStorage con el mismo
// criterio de ámbito que progressScope() en data.js: naturdex.tutorial.<u{id}|anon>.
//
// El componente resalta el elemento real de la UI (recorte sobre un fondo atenuado, vía box-shadow
// gigante del recuadro de foco) y muestra una tarjeta corta. En escritorio la tarjeta se ancla
// junto al elemento; en móvil (≤900px) es una tarjeta inferior fija, como la bottom-sheet de la
// ficha (.detail-dock).
//
// POR QUÉ ES BLOQUEANTE
// Antes se salía sin querer con una facilidad pasmosa: un toque en CUALQUIER punto de la pantalla
// cerraba el tutorial y lo marcaba como visto, y ya no volvía a salir solo. Para alguien de setenta
// años que está aprendiendo dónde tocar, ese es el fallo principal de todo el onboarding: el primer
// toque exploratorio se lleva por delante la única explicación que iba a recibir.
//
// Ahora hay UN camino y UNA salida:
//   · El fondo se toca y no pasa nada (la tarjeta da un empujón visual para señalar dónde pulsar).
//   · El fondo es inerte de verdad: `inert` sobre las <section class="screen">, con respaldo de
//     aria-hidden + pointer-events:none, y el cuerpo sin scroll. Solo responde la tarjeta.
//   · Se avanza con «Siguiente» hasta el final, o se sale por «Salir del tutorial», que PREGUNTA.
//     Antes había dos formas de irse (✕ y «Saltar») y ninguna avisaba.
// ================================================================================================

import { state } from './state.js';
import { formatBytes } from './util.js';

const SEEN_KEY_PREFIX = 'naturdex.tutorial.';
const mobileMedia = window.matchMedia('(max-width: 900px)');

// --- Contenido de los pasos ---------------------------------------------------------------------
// target: selector (o lista de selectores: gana el primero visible; útil cuando el mismo concepto
// vive en un control distinto en móvil y en escritorio). Sin target (o target oculto) la tarjeta
// se muestra centrada, sin recorte. mobileTab: pestaña de la nav inferior móvil que hay que abrir
// para que el elemento resaltado esté en pantalla (en escritorio se ignora).
//
// Los textos se escriben con una regla: frases cortas, una idea por frase, sin subordinadas y sin
// paréntesis largos. Quien lee esto está de pie, con el móvil en una mano, y a veces tiene ocho
// años o setenta. Un paso que ocupa seis líneas no se lee: se salta.
const STAGES = {
  select: [
    { title: '¡Bienvenido a NaturDex!', text: 'NaturDex es tu guía de naturaleza. Te ayuda a reconocer las plantas y los animales de un parque, y a apuntar los que veas. Te enseñamos lo básico en un minuto.' },
    { target: '#spain-map', title: 'Elige un parque en el mapa', text: 'Cada marcador es un parque. Tócalo y pulsa «Entrar al parque».' },
    { target: '#parkSelect', title: '…o búscalo en la lista', text: 'También puedes desplegar esta lista y elegir el parque por su nombre.' },
    { target: '#geoLocateBtn', title: 'El parque más cercano', text: '¿Ya estás de ruta? Este botón usa el GPS y te lleva al parque que tengas más cerca.' }
  ],
  park: [
    { title: '¡Ya estás dentro!', text: 'Este es tu cuaderno de campo. Primero verás los hábitats del parque, que son sus tipos de paisaje: playas, montes, ramblas. Dentro de cada uno están sus especies.' },
    { target: '#speciesList', mobileTab: 'catalog', title: 'Hábitats y especies', text: 'Toca un hábitat y verás sus plantas y sus animales. El botón «← Hábitats» te devuelve a la lista.' },
    { target: '#detailPanel', mobileTab: 'catalog', title: 'Marca lo que veas', text: 'Cada especie tiene su ficha, con su foto. Pulsa «Marcar como visto» cuando la encuentres de verdad. Así completas tu colección.' },
    { target: '#layersToggle', mobileTab: 'map', title: 'Capas del mapa', text: 'Aquí eliges qué se pinta en el mapa: hábitats, senderos o puntos de interés. También está la leyenda de colores.' },
    { target: '#explorerToggle', mobileTab: 'map', title: 'Modo explorador', text: 'Actívalo durante la ruta. El mapa te sigue mientras caminas y te avisa de lo que tienes cerca. Si mueves el mapa a mano, este mismo botón te vuelve a centrar.' },
    { target: ['.mobile-nav-btn[data-mtab="progress"]', '.view-tab[data-view="progress"]'], title: 'Tu progreso', text: 'Aquí ves cuántas especies llevas descubiertas. Es como un álbum que se va completando.' },
    // El botón vive en la cabecera del parque, dentro de la barra lateral: en móvil eso es la
    // pestaña "Catálogo" (con data-mtab="map" el CSS oculta la barra entera y no se vería).
    // El texto se calcula al mostrarlo porque el tamaño depende del parque en el que estés.
    {
      target: '#saveOfflineBtn', mobileTab: 'catalog', title: 'Llévate el parque en el bolsillo',
      text: () => 'En el monte casi nunca hay cobertura. Pulsa aquí en casa, con wifi, y te llevas el parque entero'
        + (offlineSizeLabel() ? ' (unos ' + offlineSizeLabel() + ')' : '')
        + '. Después funciona igual sin señal.'
    },
    { mobileTab: 'catalog', title: 'Y un último apunte', text: 'La pestaña «Invasoras» te enseña las especies que no deberían estar aquí. Y el botón «?», junto a tu nombre, repite este tutorial cuando quieras. ¡A explorar!' }
  ]
};

// Peso de la descarga del parque activo, si el manifiesto lo declara. Sin paquete de teselas ni
// contador de activos no se inventa una cifra: el paso simplemente no la menciona.
function offlineSizeLabel() {
  if (!state.manifest || !window.NaturDexOffline) return '';
  return formatBytes(window.NaturDexOffline.parkDownloadBytes(state.manifest));
}

// --- Persistencia del "ya visto" ----------------------------------------------------------------
let scopeUserId = null; // lo actualiza maybeAutoStart() con el usuario actual (null = invitado)

function storageKey() {
  return SEEN_KEY_PREFIX + (scopeUserId != null ? 'u' + scopeUserId : 'anon');
}
function readSeen() {
  try { const v = localStorage.getItem(storageKey()); return v ? JSON.parse(v) : {}; } catch (e) { return {}; }
}
function markSeen(stage) {
  try {
    const seen = readSeen();
    seen[stage] = true;
    localStorage.setItem(storageKey(), JSON.stringify(seen));
  } catch (e) { /* sin localStorage: el tutorial simplemente volvería a salir */ }
}

// --- Estado del componente ----------------------------------------------------------------------
let overlay = null, spotEl = null, backdropEl = null, cardEl = null;
let titleEl = null, textEl = null, stepCountEl = null, dotsEl = null;
let backBtn = null, nextBtn = null, exitBtn = null, confirmEl = null, confirmStayBtn = null;
let steps = [], stepIndex = 0, activeStage = null, openerEl = null;

function isOpen() { return !!overlay && !overlay.hidden; }
function confirmandoSalida() { return !!confirmEl && !confirmEl.hidden; }

// El overlay se crea perezosamente la primera vez (mismo patrón que el popover del glosario).
function ensureOverlay() {
  if (overlay) return overlay;
  overlay = document.createElement('div');
  overlay.className = 'tutorial-overlay';
  overlay.hidden = true;
  overlay.innerHTML =
    '<div class="tutorial-backdrop"></div>' +
    '<div class="tutorial-spot" hidden></div>' +
    '<div class="tutorial-card" role="dialog" aria-modal="true" aria-labelledby="tutorialTitle" aria-describedby="tutorialText" tabindex="-1">' +
      // "Paso 3 de 8" a la vista. Existía, pero en .sr-only: solo lo sabía quien usaba lector de
      // pantalla. Saber cuánto queda es justo lo que hace que alguien no abandone a la mitad.
      '<p class="tutorial-step" id="tutorialStepCount"></p>' +
      '<h3 id="tutorialTitle"></h3>' +
      '<p id="tutorialText"></p>' +
      '<div class="tutorial-dots" aria-hidden="true"></div>' +
      '<div class="tutorial-actions">' +
        '<button type="button" class="tutorial-back">Atrás</button>' +
        '<button type="button" class="tutorial-next">Siguiente</button>' +
      '</div>' +
      '<button type="button" class="tutorial-salir">Salir del tutorial</button>' +
      '<div class="tutorial-confirm" hidden role="group" aria-label="Confirmar la salida del tutorial">' +
        '<p>¿Seguro que quieres salir? Puedes volver a verlo cuando quieras con el botón «?».</p>' +
        '<div class="tutorial-confirm-actions">' +
          '<button type="button" class="tutorial-confirm-no">Seguir con el tutorial</button>' +
          '<button type="button" class="tutorial-confirm-si">Salir</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  document.body.appendChild(overlay);

  backdropEl = overlay.querySelector('.tutorial-backdrop');
  spotEl = overlay.querySelector('.tutorial-spot');
  cardEl = overlay.querySelector('.tutorial-card');
  titleEl = overlay.querySelector('#tutorialTitle');
  textEl = overlay.querySelector('#tutorialText');
  stepCountEl = overlay.querySelector('#tutorialStepCount');
  dotsEl = overlay.querySelector('.tutorial-dots');
  backBtn = overlay.querySelector('.tutorial-back');
  nextBtn = overlay.querySelector('.tutorial-next');
  exitBtn = overlay.querySelector('.tutorial-salir');
  confirmEl = overlay.querySelector('.tutorial-confirm');
  confirmStayBtn = overlay.querySelector('.tutorial-confirm-no');

  // El fondo NO cierra. Tocarlo señala dónde hay que pulsar con un empujón visual de la tarjeta:
  // el toque exploratorio de quien está aprendiendo ya no se lleva por delante la explicación.
  backdropEl.addEventListener('click', señalaLaTarjeta);
  // Y tampoco arrastra: sin esto, el gesto de deslizar sobre el fondo movía la pantalla de debajo.
  backdropEl.addEventListener('touchmove', event => event.preventDefault(), { passive: false });

  exitBtn.addEventListener('click', pideConfirmacionSalida);
  confirmStayBtn.addEventListener('click', cancelaSalida);
  overlay.querySelector('.tutorial-confirm-si').addEventListener('click', () => close());
  backBtn.addEventListener('click', () => showStep(stepIndex - 1));
  nextBtn.addEventListener('click', () => {
    if (stepIndex >= steps.length - 1) close(); else showStep(stepIndex + 1);
  });

  // Teclado: Escape sale (pasando por la confirmación), flechas navegan y Tab queda atrapado dentro
  // de la tarjeta. En captura y con stopPropagation para que el Escape no cierre además la
  // bottom-sheet o el panel de capas (app.js y glossary.js escuchan Escape en document).
  window.addEventListener('keydown', onKeydown, true);
  window.addEventListener('resize', () => { if (isOpen()) showStep(stepIndex); });
  return overlay;
}

// Empujón visual: la tarjeta da un respingo para decir «lo que responde es esto». Con
// data-motion="reduce" la animación queda neutralizada por la regla global de styles.css, y el
// resultado es el mismo que ya se buscaba: tocar el fondo no hace nada.
function señalaLaTarjeta() {
  if (!cardEl) return;
  cardEl.classList.remove('nudge');
  void cardEl.offsetWidth; // reinicia la animación aunque se toque el fondo dos veces seguidas
  cardEl.classList.add('nudge');
}

// Los botones que se pueden enfocar AHORA: con la confirmación abierta, solo los suyos. Si no se
// acotara, el Tab pasearía por «Siguiente» y «Atrás», que están debajo y no responden.
function botonesEnfocables() {
  const raiz = confirmandoSalida() ? confirmEl : cardEl;
  return Array.from(raiz.querySelectorAll('button'))
    .filter(b => !b.hidden && (confirmandoSalida() || !confirmEl.contains(b)));
}

function pideConfirmacionSalida() {
  if (!confirmEl) return;
  confirmEl.hidden = false;
  cardEl.classList.add('is-confirming');
  confirmStayBtn.focus({ preventScroll: true }); // el foco cae en «seguir», no en «salir»
}

function cancelaSalida() {
  if (!confirmEl) return;
  confirmEl.hidden = true;
  cardEl.classList.remove('is-confirming');
  nextBtn.focus({ preventScroll: true });
}

function onKeydown(event) {
  if (!isOpen()) return;
  if (event.key === 'Escape') {
    event.stopPropagation();
    // Escape sigue siendo la salida de teclado, pero pasa por la misma pregunta que el botón. Con
    // la pregunta ya en pantalla, el segundo Escape confirma: es el patrón de «pulsa dos veces para
    // salir» que la app ya usa en el «atrás» de la raíz (ver Js/nav.js).
    if (confirmandoSalida()) close(); else pideConfirmacionSalida();
    return;
  }
  if (confirmandoSalida() && event.key !== 'Tab') return; // con la pregunta abierta, nada de navegar pasos
  if (event.key === 'ArrowRight') { nextBtn.click(); return; }
  if (event.key === 'ArrowLeft') { if (stepIndex > 0) showStep(stepIndex - 1); return; }
  if (event.key === 'Tab') {
    const focusables = botonesEnfocables();
    if (!focusables.length) return;
    const first = focusables[0], last = focusables[focusables.length - 1];
    if (event.shiftKey && (document.activeElement === first || !cardEl.contains(document.activeElement))) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    } else if (!cardEl.contains(document.activeElement) || !focusables.includes(document.activeElement)) {
      event.preventDefault(); first.focus();
    }
  }
}

// --- Fondo inerte ---------------------------------------------------------------------------------
// El recorte del spotlight solo tapaba: el resto de la interfaz seguía respondiendo a los toques y
// al tabulador. `inert` la desactiva de verdad (foco, puntero y árbol de accesibilidad de una vez);
// aria-hidden + pointer-events:none quedan de respaldo para navegadores que aún no lo admitan.
//
// La tarjeta cuelga de <body>, no de ninguna .screen, así que se queda fuera del bloqueo. Y los
// clicks que el propio tutorial dispara para cambiar de pestaña móvil (showStep) siguen
// funcionando: `inert` corta la interacción del USUARIO, no los eventos que se despachan a mano.
function bloqueaFondo(activo) {
  document.querySelectorAll('.screen').forEach(screen => {
    if (activo) { screen.setAttribute('inert', ''); screen.setAttribute('aria-hidden', 'true'); }
    else { screen.removeAttribute('inert'); screen.removeAttribute('aria-hidden'); }
  });
  document.body.classList.toggle('tutorial-open', activo);
}

// --- Resolución y colocación de cada paso -------------------------------------------------------
function firstVisible(target) {
  const selectors = Array.isArray(target) ? target : (target ? [target] : []);
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (!el) continue;
    const r = el.getBoundingClientRect();
    if (el.getClientRects().length && r.width > 0 && r.height > 0) return el;
  }
  return null;
}

/**
 * ¿Este paso tiene sentido en la pantalla actual? Un paso que señala un control que la app ha
 * ocultado (p. ej. "Tu progreso" en un espacio de ficha base, donde applyParkLevel esconde la
 * pestaña) se saltaría entero: se descarta ANTES de arrancar, para que "Paso N de M" y los puntos
 * indicadores cuenten solo lo que el usuario va a ver de verdad.
 *
 * Se mira el atributo [hidden], no la visibilidad real: en móvil media UI está oculta por CSS según
 * la pestaña activa, y esos pasos sí valen porque showStep abre antes su pestaña (mobileTab).
 */
function stepIsApplicable(step) {
  if (!step.target) return true;
  const selectors = Array.isArray(step.target) ? step.target : [step.target];
  return selectors.some(sel => {
    const el = document.querySelector(sel);
    return el && !el.hidden && !el.closest('[hidden]');
  });
}

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

function showStep(index) {
  stepIndex = clamp(index, 0, steps.length - 1);
  const step = steps[stepIndex];

  // En móvil, algunos elementos viven en otra pestaña de la nav inferior: se abre primero.
  if (mobileMedia.matches && step.mobileTab) {
    const tabBtn = document.querySelector('.mobile-nav-btn[data-mtab="' + step.mobileTab + '"]');
    if (tabBtn && !tabBtn.classList.contains('active')) {
      // El fondo está inerte. Se levanta el bloqueo lo justo para que este click —que lo dispara el
      // tutorial, no el usuario— llegue igual en cualquier navegador, y se repone acto seguido: es
      // síncrono, así que entremedias no hay ni un repintado en el que se pueda tocar nada.
      bloqueaFondo(false);
      tabBtn.click();
      bloqueaFondo(true);
    }
  }

  titleEl.textContent = step.title;
  // El texto puede ser una función cuando depende del parque activo (p. ej. cuánto ocupa guardarlo).
  textEl.textContent = typeof step.text === 'function' ? step.text() : step.text;
  stepCountEl.textContent = 'Paso ' + (stepIndex + 1) + ' de ' + steps.length;
  dotsEl.innerHTML = steps.map((s, i) =>
    '<span class="tutorial-dot' + (i === stepIndex ? ' active' : '') + '"></span>').join('');
  backBtn.hidden = stepIndex === 0;
  // En el último paso no queda nada de lo que salirse: el botón primario ya termina el tutorial.
  exitBtn.hidden = stepIndex === steps.length - 1;
  nextBtn.textContent = stepIndex === steps.length - 1 ? '¡A explorar!' : 'Siguiente';
  if (confirmandoSalida()) cancelaSalida();

  // La colocación es síncrona: getBoundingClientRect fuerza el reflujo, así que aunque se acabe de
  // cambiar de pestaña móvil las medidas ya son las buenas (rAF no vale: en pestañas en segundo
  // plano no se dispara y el paso quedaría sin colocar).
  positionStep(step);
  // El foco va al botón primario, no a la tarjeta: quien navega con teclado tiene «Siguiente» bajo
  // el Intro desde el primer paso, sin tener que tabular hasta encontrarlo.
  nextBtn.focus({ preventScroll: true });
}

function positionStep(step) {
  const el = firstVisible(step.target);
  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;

  // Un elemento puede estar "visible" para getClientRects pero desplazado fuera de pantalla (p. ej.
  // la ficha en móvil: la bottom-sheet cerrada vive tras un translateY(110%)). Si tras acercarlo
  // con scrollIntoView sigue sin pisar el viewport, se cae al modo sin recorte (fondo atenuado).
  let r = null;
  if (el) {
    if (el.scrollIntoView) el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    r = el.getBoundingClientRect();
    if (r.bottom < 0 || r.right < 0 || r.top > vh || r.left > vw) r = null;
  }

  if (r) {
    const pad = 6; // aire alrededor del elemento resaltado
    spotEl.hidden = false;
    spotEl.style.top = (r.top - pad) + 'px';
    spotEl.style.left = (r.left - pad) + 'px';
    spotEl.style.width = (r.width + pad * 2) + 'px';
    spotEl.style.height = (r.height + pad * 2) + 'px';
    backdropEl.classList.remove('dim'); // el atenuado lo pone la sombra del recorte
  } else {
    spotEl.hidden = true;
    backdropEl.classList.add('dim'); // sin recorte: se atenúa todo el fondo
  }

  // En móvil la tarjeta es inferior fija (lo impone el CSS); solo hay que colocarla en escritorio.
  if (mobileMedia.matches) { cardEl.style.top = ''; cardEl.style.left = ''; return; }

  const cw = cardEl.offsetWidth, ch = cardEl.offsetHeight, gap = 14;
  let top, left;
  if (r) {
    left = clamp(r.left + r.width / 2 - cw / 2, 12, vw - cw - 12);
    if (r.bottom + gap + ch + 12 <= vh) top = r.bottom + gap;            // debajo
    else if (r.top - gap - ch >= 12) top = r.top - gap - ch;             // encima
    else top = clamp(r.top + r.height / 2 - ch / 2, 12, vh - ch - 12);   // superpuesta (elemento grande)
  } else {
    top = (vh - ch) / 2;
    left = (vw - cw) / 2;
  }
  cardEl.style.top = Math.round(top) + 'px';
  cardEl.style.left = Math.round(left) + 'px';
}

// --- API pública --------------------------------------------------------------------------------
// Lanza un tramo desde el principio (los botones "?" lo usan, ignorando el flag de "ya visto").
export function startTutorial(stage) {
  if (!STAGES[stage]) return;
  ensureOverlay();
  activeStage = stage;
  steps = STAGES[stage].filter(stepIsApplicable);
  if (!steps.length) return;
  openerEl = document.activeElement; // para devolver el foco al cerrar
  overlay.hidden = false;
  if (confirmEl) { confirmEl.hidden = true; cardEl.classList.remove('is-confirming'); }
  bloqueaFondo(true); // a partir de aquí, lo único que responde es la tarjeta
  showStep(0);
  // El tutorial se abre por encima de todo: «atrás» debe cerrarlo a él, no la pantalla que está
  // explicando (ver Js/nav.js).
  if (window.NaturDexNav) window.NaturDexNav.open('tutorial', closeRaw);
}

// Lanza un tramo solo si ese usuario no lo ha visto aún. auth.js la llama al mostrar cada pantalla;
// userId actualiza también el ámbito de persistencia (null/undefined = invitado, ámbito 'anon').
export function maybeAutoStart(stage, userId) {
  scopeUserId = (userId != null) ? userId : null;
  if (readSeen()[stage] || isOpen()) return;
  // Pequeño respiro para que el layout (mapas Leaflet incluidos) termine de asentarse.
  setTimeout(() => { if (!isOpen()) startTutorial(stage); }, 400);
}

// Olvida el "ya visto" de este usuario, de modo que los dos tramos vuelvan a salir solos la próxima
// vez que llegue a cada pantalla. Lo usa "Que vuelva a salir solo" en Perfil y ajustes.
export function resetTutorial(userId) {
  if (userId != null) scopeUserId = userId;
  try { localStorage.removeItem(storageKey()); } catch (e) { /* sin localStorage: nada que olvidar */ }
}

// Cierre "público": pasa por la pila de navegación para que el paso quede deshecho también en el
// historial. Si no hay pila (o el tutorial no está apilado), cierra directamente.
function close() {
  if (!isOpen()) return;
  if (window.NaturDexNav && window.NaturDexNav.close('tutorial')) return;
  closeRaw();
}

function closeRaw() {
  if (!isOpen()) return;
  markSeen(activeStage); // cerrado, saltado o terminado: no volver a interrumpir a este usuario
  overlay.hidden = true;
  backdropEl.classList.remove('dim');
  if (confirmEl) { confirmEl.hidden = true; cardEl.classList.remove('is-confirming'); }
  bloqueaFondo(false); // se revierte todo: la app vuelve a responder tal cual estaba
  // El foco vuelve a quien abrió el tutorial o, si ya no está visible, al encabezado de la
  // pantalla actual (mismo criterio que showScreen en auth.js).
  if (openerEl && document.contains(openerEl) && openerEl.getClientRects().length) {
    openerEl.focus({ preventScroll: true });
  } else {
    const screen = document.querySelector('.screen:not([hidden])');
    const heading = screen && screen.querySelector('h1, h2');
    if (heading) {
      if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
  }
  openerEl = null;
}

// --- Cableado -----------------------------------------------------------------------------------
export function initTutorial() {
  const btnPark = document.querySelector('#tutorialBtn');
  const btnSelect = document.querySelector('#tutorialBtnSelect');
  if (btnPark) btnPark.addEventListener('click', () => startTutorial('park'));
  if (btnSelect) btnSelect.addEventListener('click', () => startTutorial('select'));
  // auth.js es un script clásico (no módulo): expone la API por window, como startParkExperience.
  window.naturdexTutorial = { start: startTutorial, maybeAutoStart, reset: resetTutorial };
}
