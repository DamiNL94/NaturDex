// ================================================================================================
// diccionario.js — el glosario entero, consultable por sí solo.
// ------------------------------------------------------------------------------------------------
// EL PROBLEMA QUE RESUELVE
// `glossary.js` resalta los tecnicismos DENTRO de las descripciones y enseña su definición en un
// popover. Eso cubre a quien tropieza con la palabra leyendo una ficha, pero no a quien ya la ha
// oído y quiere buscarla: no había ninguna forma de ver el glosario completo. 219 definiciones
// escritas en llano estaban ahí y solo aparecían por casualidad.
//
// DÓNDE VIVE, Y POR QUÉ AHÍ
// Hacía falta decidir entre poner un quinto botón en la nav inferior del móvil o buscarle otra
// puerta. Manda el criterio de la Fase 1 de usabilidad: **la nav inferior no pasa de cuatro
// botones** (Mapa · Catálogo · Invasoras · Progreso). El público al que va dirigida esta tanda
// —personas mayores y niños— ya navega con esfuerzo entre cuatro iconos pequeños; con cinco, el
// coste no lo paga el diccionario, lo pagan el mapa y el catálogo, que es lo que se usa a diario.
//
// Así que el diccionario es una VISTA de la barra lateral, con tres puertas de entrada:
//   · en escritorio, una cuarta pestaña en `.view-tabs`, donde ya está el resto;
//   · en móvil, un enlace en la cabecera del catálogo (allí es donde se está leyendo);
//   · desde el popover del glosario, «Ver en el diccionario →», que además abre ese mismo término.
//
// La tercera es la importante: es la única que llega en el momento exacto en que a alguien le
// acaba de interesar el glosario.
//
// LO QUE NO HACE
// Consultar el diccionario **no desbloquea logros**, y así debe seguir: era lo que se conseguía sin
// salir de casa (ver Docs/PROGRESO-CUENTA-LOGROS.md). Sí alimenta la estadística del perfil, por el
// mismo camino de siempre: `reportGlossaryView()`.
//
// Y no se inventa ninguna definición. Hay términos que salen en las fichas y todavía no están aquí
// —`caliza` aparece en 87 de ellas—; el diccionario los deja a la vista como hueco, que es lo
// honesto. El texto lo redacta una persona en el bloque `glosario` de Database/seed.sql.
// ================================================================================================

import { reportGlossaryView } from './achievements.js';
import { diccionarioPanel } from './dom.js';
import { glosarioCargado, glosarioTerminos, loadGlossary } from './glossary.js';
import { html, normalize } from './util.js';

// Estado propio de la vista: no vive en state.js porque no lo mira nadie más.
let consulta = '';
let materia = '';        // '' = todas
let terminoDestacado = ''; // al llegar desde el popover, el que hay que abrir y señalar

// Ordenación alfabética española: «ñ» va después de «n», y los acentos no separan palabras.
const colador = new Intl.Collator('es-ES', { sensitivity: 'base' });

function ordenados() {
  return glosarioTerminos().slice().sort((a, b) => colador.compare(a.term, b.term));
}

// La inicial con la que se agrupa. Se quitan los acentos para que «álveo» caiga en la A y no en una
// letra que no existe en el índice.
function inicial(termino) {
  const letra = String(termino || '').trim().charAt(0).toUpperCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return /[A-ZÑ]/.test(letra) ? letra : '#';
}

// Identificador estable por término, para el ancla del índice y para el salto desde el popover.
function idDe(termino) {
  return 'dicc-' + normalize(termino).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-');
}

// El buscador mira el término, sus sinónimos Y el texto de la definición: quien no recuerda la
// palabra la busca por lo que significa («la hoja con forma de aguja»), no por su nombre.
function coincide(entrada, texto) {
  if (!texto) return true;
  const aguja = normalize(texto);
  if (normalize(entrada.term).includes(aguja)) return true;
  if ((entrada.aliases || []).some(a => normalize(a).includes(aguja))) return true;
  return normalize(entrada.definition || '').includes(aguja);
}

function materias() {
  const cuenta = new Map();
  for (const e of glosarioTerminos()) {
    const c = e.category || 'sin materia';
    cuenta.set(c, (cuenta.get(c) || 0) + 1);
  }
  return Array.from(cuenta.entries()).sort((a, b) => b[1] - a[1]);
}

// --- Pintado --------------------------------------------------------------------------------------
export function renderDiccionario() {
  if (!diccionarioPanel) return;

  // Sin glosario cargado (primera visita sin cobertura y sin caché) se dice lo que pasa y qué hacer.
  // Una pantalla vacía dejaría al usuario pensando que el diccionario está vacío, que es otra cosa.
  if (!glosarioCargado() || !glosarioTerminos().length) {
    diccionarioPanel.innerHTML = html`<div class="section-title"><h2>Diccionario</h2></div>
      <p class="dicc-vacio">El diccionario todavía no está descargado en este dispositivo.
      Con cobertura se descarga solo; si vas a salir de ruta, pulsa «Guardar sin conexión» en la
      cabecera del parque y se te lleva entero, como las fichas y el mapa.</p>`;
    return;
  }

  const todos = ordenados();
  const lista = todos.filter(e => (!materia || (e.category || 'sin materia') === materia) && coincide(e, consulta));
  const buscando = !!consulta.trim();

  // Índice A–Z: las letras sin ningún término se pintan apagadas y no son pulsables. Es más útil
  // que ocultarlas —la fila de letras no baila al buscar— y dice de un vistazo por dónde hay poco.
  const conLetra = new Set(lista.map(e => inicial(e.term)));
  const letras = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('').concat(conLetra.has('#') ? ['#'] : []);
  const indice = letras.map(l => conLetra.has(l)
    ? html`<button type="button" class="dicc-letra-btn" data-dicc-letra="${l}">${l}</button>`
    : html`<span class="dicc-letra-btn is-vacia" aria-hidden="true">${l}</span>`);

  // Agrupación por inicial, en el orden ya calculado.
  const bloques = [];
  let letraActual = null;
  for (const e of lista) {
    const l = inicial(e.term);
    if (l !== letraActual) { letraActual = l; bloques.push(html`<h3 class="dicc-letra" id="dicc-letra-${l}">${l}</h3>`); }
    const abierto = buscando || idDe(e.term) === terminoDestacado;
    bloques.push(html`<details class="dicc-item${idDe(e.term) === terminoDestacado ? ' is-destacado' : ''}" id="${idDe(e.term)}" data-dicc-term="${e.term}"${abierto ? html` open` : ''}>
      <summary><span class="dicc-term">${e.term}</span>${e.category ? html`<span class="badge">${e.category}</span>` : ''}</summary>
      <p class="dicc-def">${e.definition}</p>
      ${(e.aliases || []).length ? html`<p class="dicc-alias">También: ${e.aliases.join(', ')}</p>` : ''}
      ${e.source ? html`<p class="detail-source">Fuente: ${e.source}</p>` : ''}
      </details>`);
  }

  const cats = materias().map(([c, n]) => html`<button type="button" class="filter-button${materia === c ? ' active' : ''}" data-dicc-cat="${c}" aria-pressed="${materia === c ? 'true' : 'false'}">${c} · ${n}</button>`);

  diccionarioPanel.innerHTML = html`<div class="section-title">
    <h2>Diccionario</h2>
    <span role="status">${lista.length === todos.length ? todos.length + (todos.length === 1 ? ' término' : ' términos') : lista.length + ' de ' + todos.length}</span>
    </div>
    <p class="dicc-intro">Las palabras técnicas que salen en las fichas, explicadas en llano. Es el mismo
    diccionario que se abre al pulsar una palabra subrayada dentro de una descripción.</p>
    <div class="dicc-controls">
    <label for="diccSearch">Buscar una palabra</label>
    <input id="diccSearch" type="search" placeholder="Término, sinónimo o significado" value="${consulta}" autocomplete="off">
    <div class="segmented dicc-cats" role="group" aria-label="Filtrar por materia">
    <button type="button" class="filter-button${materia ? '' : ' active'}" data-dicc-cat="" aria-pressed="${materia ? 'false' : 'true'}">Todas</button>
    ${cats}
    </div>
    </div>
    <nav class="dicc-index" aria-label="Índice alfabético">${indice}</nav>
    ${lista.length
      ? html`<div class="dicc-list">${bloques}</div>`
      : html`<p class="dicc-vacio">Ninguna palabra del diccionario coincide con «${consulta}».
        No todas las palabras técnicas de las fichas están definidas todavía: si has llegado aquí
        buscando una que falta, es un hueco conocido y está apuntado, no un fallo de la búsqueda.</p>`}
    <p class="detail-source dicc-pie">Definiciones divulgativas de NaturDex sobre fuentes públicas.
    Quedan términos de las fichas por definir; se van añadiendo.</p>`;

  // Al llegar desde el popover: la palabra a la vista y con el foco puesto, no perdida en la lista.
  if (terminoDestacado) {
    const nodo = diccionarioPanel.querySelector('#' + CSS.escape(terminoDestacado));
    if (nodo) {
      nodo.scrollIntoView({ block: 'center' });
      const resumen = nodo.querySelector('summary');
      if (resumen) resumen.focus({ preventScroll: true });
    }
    terminoDestacado = '';
  }
}

// --- Eventos --------------------------------------------------------------------------------------
// Este módulo se cablea a sí mismo sobre su propio panel, igual que layers.js y explorer.js. La
// regla de «render/ no registra eventos» es para los trozos de render.js, no para las vistas.
export function initDiccionario() {
  if (!diccionarioPanel) return;

  diccionarioPanel.addEventListener('input', event => {
    if (event.target.id !== 'diccSearch') return;
    consulta = event.target.value;
    renderDiccionario();
    // El repintado sustituye el campo: se devuelve el foco y el cursor donde estaban, o escribir
    // la segunda letra sería imposible.
    const campo = diccionarioPanel.querySelector('#diccSearch');
    if (campo) { campo.focus(); campo.setSelectionRange(campo.value.length, campo.value.length); }
  });

  diccionarioPanel.addEventListener('click', event => {
    const cat = event.target.closest('[data-dicc-cat]');
    if (cat) { materia = cat.dataset.diccCat; renderDiccionario(); return; }
    const letra = event.target.closest('[data-dicc-letra]');
    if (letra) {
      const destino = diccionarioPanel.querySelector('#dicc-letra-' + CSS.escape(letra.dataset.diccLetra));
      if (destino) destino.scrollIntoView({ block: 'start' });
    }
  });

  // Abrir una entrada cuenta como consulta del glosario, igual que abrir su popover. Sigue SIN
  // desbloquear logros (reportGlossaryView solo alimenta la estadística del perfil) y no repite
  // llamada de red por término, que ya lo evita él mismo.
  diccionarioPanel.addEventListener('toggle', event => {
    const item = event.target.closest('.dicc-item');
    if (!item || !item.open) return;
    reportGlossaryView(item.dataset.diccTerm);
  }, true); // en captura: 'toggle' no burbujea
}

/**
 * Abre el diccionario, opcionalmente por un término concreto. Lo llama app.js: desde la pestaña,
 * desde el enlace de la cabecera del catálogo y desde el «Ver en el diccionario →» del popover.
 * Se asegura de que el glosario esté cargado antes de pintar; sin red y sin caché, `loadGlossary`
 * deja la lista vacía y el propio render explica qué ha pasado.
 */
export async function abreDiccionario(termino) {
  if (!glosarioCargado()) await loadGlossary();
  if (termino) { terminoDestacado = idDe(termino); consulta = ''; materia = ''; }
  renderDiccionario();
}
