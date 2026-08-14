// ================================================================================================
// glossary.js — glosario divulgativo. Resalta los términos científicos que aparecen en las
// descripciones (hábitats, especies) y muestra su definición en lenguaje llano al pulsarlos.
// ------------------------------------------------------------------------------------------------
// Datos: Frontend/Data/glosario.json (copia offline exportada de la BD; ver Tools/export-glossary.php).
// El resaltado se hace por POST-PROCESO del DOM (se envuelven los términos ya renderizados en un
// <button>), no manipulando el HTML de la plantilla: así no interfiere con el escapado anti-XSS de
// util.js y nunca inyecta HTML nuevo, solo envuelve texto que ya estaba. Solo actúa sobre los
// elementos con clase `.detail-prose` (las descripciones), no sobre insignias, taxonomía, etc.
// ================================================================================================

import { reportGlossaryView } from './achievements.js';

let TERMS = null;      // [{ term, definition, category, aliases, source }]
let MATCHER = null;    // { regex, byForm: Map(formaEnMinúsculas -> { term, definition }) }
let popoverEl = null;
let anclaEl = null;    // la palabra a la que está apuntando el popover ahora mismo

const norm = s => s.toLowerCase();

// Carga el glosario una sola vez. Si falla (sin conexión y sin cachear aún), deja el resaltado
// desactivado sin romper nada: las descripciones se muestran igual, solo sin términos pulsables.
export async function loadGlossary() {
  if (TERMS) return TERMS;
  try {
    // fetchJsonCached (offline.js) cachea el JSON en localStorage (capa 1): el glosario queda
    // disponible sin conexión aunque el Service Worker no esté activo, igual que el resto de datos.
    TERMS = (await NaturDexOffline.fetchJsonCached('Data/glosario.json')).data;
    buildMatcher();
  } catch (e) {
    TERMS = [];
  }
  return TERMS;
}

/**
 * El glosario entero, para quien quiera consultarlo sin pasar por una ficha (Js/diccionario.js).
 * Devuelve [] mientras no haya cargado: quien lo pinta debe distinguir «vacío» de «aún no cargado»
 * con `glosarioCargado()`, porque las dos situaciones se cuentan de forma muy distinta al usuario.
 */
export function glosarioTerminos() { return TERMS || []; }
export function glosarioCargado() { return TERMS !== null; }

function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

// Un acrónimo/código en mayúsculas (LC, EN, VU, HIC, ZEPA, LESRPE...) se matchea de forma
// SENSIBLE A MAYÚSCULAS: si no, el código UICN "EN" se comería la preposición «en» en cada frase.
const ACRONYM = /^[A-ZÁÉÍÓÚÜÑ0-9]{2,8}$/;

function buildMatcher() {
  const forms = [];
  const byForm = new Map();
  for (const entry of TERMS) {
    for (const f of [entry.term, ...(entry.aliases || [])]) {
      if (!f) continue;
      forms.push(f);
      byForm.set(norm(f), { term: entry.term, definition: entry.definition, exact: f, caseSensitive: ACRONYM.test(f) });
    }
  }
  // De más larga a más corta, para que "hábitat de interés comunitario" gane a "hábitat prioritario".
  forms.sort((a, b) => b.length - a.length);
  const alt = forms.map(escapeRe).join('|');
  let regex;
  try {
    // Límite por letra/número Unicode: no captura un término dentro de otra palabra ni acrónimos
    // pegados a más letras. Requiere lookbehind (navegadores modernos; la app es una PWA evergreen).
    regex = new RegExp('(?<![\\p{L}\\p{N}])(' + alt + ')(?![\\p{L}\\p{N}])', 'giu');
  } catch (e) {
    regex = new RegExp('\\b(' + alt + ')\\b', 'gi'); // respaldo sin lookbehind
  }
  MATCHER = { regex, byForm };
}

// Resalta los términos del glosario dentro de los `.detail-prose` de un contenedor ya renderizado.
export function highlightGlossary(container) {
  if (!MATCHER || !container) return;
  container.querySelectorAll('.detail-prose').forEach(highlightIn);
}

function highlightIn(root) {
  const linked = new Set(); // solo la PRIMERA aparición de cada término en este bloque (evita ruido)
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      if (node.parentElement && node.parentElement.closest('.glossary-term')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  const textNodes = [];
  let node;
  while ((node = walker.nextNode())) textNodes.push(node);

  for (const textNode of textNodes) {
    const text = textNode.nodeValue;
    MATCHER.regex.lastIndex = 0;
    const frag = document.createDocumentFragment();
    let last = 0, any = false, m;
    while ((m = MATCHER.regex.exec(text))) {
      const form = m[1];
      const info = MATCHER.byForm.get(norm(form));
      if (!info) continue;
      // Código en mayúsculas: solo enlaza si el texto también está en mayúsculas ("EN" sí, «en» no).
      if (info.caseSensitive && form !== info.exact) continue;
      if (linked.has(info.term)) continue;
      linked.add(info.term);
      any = true;
      frag.appendChild(document.createTextNode(text.slice(last, m.index)));
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'glossary-term';
      btn.textContent = form;
      btn.dataset.glossTerm = info.term;
      btn.dataset.glossDef = info.definition;
      btn.setAttribute('aria-label', form + ' (ver definición)');
      frag.appendChild(btn);
      last = m.index + form.length;
    }
    if (any) {
      frag.appendChild(document.createTextNode(text.slice(last)));
      textNode.parentNode.replaceChild(frag, textNode);
    }
  }
}

// --- Popover con la definición -----------------------------------------------------------------
export function initGlossaryPopover() {
  document.body.addEventListener('click', event => {
    const term = event.target.closest('.glossary-term');
    if (term) { event.preventDefault(); togglePopover(term); return; }
    if (popoverEl && !popoverEl.hidden && !event.target.closest('.glossary-popover')) hidePopover();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') hidePopover(); });
  // Al desplazarse, el popover SIGUE a su palabra en vez de cerrarse.
  //
  // Cerrarlo parecía lo sensato y hacía que ni llegara a verse: el término es un <button>, y al
  // pulsar uno que estaba por debajo del pliegue el navegador desplaza el panel para traerlo a la
  // vista —558 px en la ficha de un hábitat—; ese desplazamiento, disparado por el MISMO click que
  // abría el popover, lo cerraba en el acto. Es decir: cualquier palabra que no estuviera ya en
  // pantalla no tenía definición consultable. Ahora solo se cierra cuando su palabra se va de la
  // pantalla, que es cuando el popover deja de tener a qué apuntar.
  const seguir = () => {
    if (!popoverEl || popoverEl.hidden || !anclaEl) return;
    if (!document.contains(anclaEl)) { hidePopover(); return; }
    const r = anclaEl.getBoundingClientRect();
    const vh = document.documentElement.clientHeight;
    const vw = document.documentElement.clientWidth;
    if (r.bottom < 0 || r.top > vh || r.right < 0 || r.left > vw) { hidePopover(); return; }
    positionPopover(popoverEl, anclaEl);
  };
  // Agrupado en un frame: un scroll con el dedo dispara decenas de eventos y cada uno mediría el
  // popover (getBoundingClientRect fuerza reflujo).
  let pendiente = false;
  const alDesplazar = () => {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(() => { pendiente = false; seguir(); });
  };
  window.addEventListener('resize', alDesplazar);
  window.addEventListener('scroll', alDesplazar, true); // captura también el scroll interno del panel
}

function ensurePopover() {
  if (popoverEl) return popoverEl;
  popoverEl = document.createElement('div');
  popoverEl.className = 'glossary-popover';
  popoverEl.setAttribute('role', 'dialog');
  popoverEl.hidden = true;
  document.body.appendChild(popoverEl);
  return popoverEl;
}

function togglePopover(termEl) {
  const el = ensurePopover();
  if (el.dataset.for === termEl.dataset.glossTerm && !el.hidden) { hidePopover(); return; }
  el.dataset.for = termEl.dataset.glossTerm;
  anclaEl = termEl;
  reportGlossaryView(termEl.dataset.glossTerm);
  el.textContent = '';
  const h = document.createElement('strong');
  h.className = 'glossary-popover-term';
  h.textContent = termEl.dataset.glossTerm;
  const p = document.createElement('p');
  p.className = 'glossary-popover-def';
  p.textContent = termEl.dataset.glossDef;
  // Salida al diccionario completo: el popover explica UNA palabra, y quien acaba de descubrir que
  // existe un glosario querrá ver el resto. Quien lo abre es app.js por delegación (este módulo no
  // puede importar diccionario.js: diccionario.js ya importa este para leer los términos).
  const ver = document.createElement('button');
  ver.type = 'button';
  ver.className = 'glossary-popover-link';
  ver.dataset.abrirDiccionario = termEl.dataset.glossTerm;
  ver.textContent = 'Ver en el diccionario →';
  el.append(h, p, ver);
  positionPopover(el, termEl);
}

function positionPopover(el, termEl) {
  el.style.visibility = 'hidden';
  el.hidden = false;
  const r = termEl.getBoundingClientRect();
  const pw = el.offsetWidth, ph = el.offsetHeight;
  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;
  let left = Math.min(r.left, vw - pw - 12);
  left = Math.max(8, left) + window.scrollX;
  let top = r.bottom + 6;
  if (r.bottom + ph + 12 > vh) top = r.top - ph - 6; // arriba si no cabe debajo
  top += window.scrollY;
  el.style.left = left + 'px';
  el.style.top = top + 'px';
  el.style.visibility = '';
}

function hidePopover() {
  anclaEl = null;
  if (popoverEl && !popoverEl.hidden) { popoverEl.hidden = true; popoverEl.dataset.for = ''; }
}

/** Cierre del popover desde fuera (app.js, al saltar al diccionario). */
export function hideGlossaryPopover() { hidePopover(); }
