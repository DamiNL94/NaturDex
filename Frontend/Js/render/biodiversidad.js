// ================================================================================================
// ./render/biodiversidad.js — pestaña de biodiversidad: habitats, especies, rareza legal y, si hay
// evidencia documental medida, su reparto N1/N2/N3.
// ------------------------------------------------------------------------------------------------
// Trozo de render.js. El indice de la carpeta esta en Frontend/Js/CLAUDE.md.
//
// Analitica pura sobre el catalogo YA publicado: nada de lo que se pinta aqui sale de una fuente
// nueva ni se recalcula en el navegador. El dato llega agregado en
// Frontend/Data/parks-biodiversidad.json (lo genera `npm run especies:biodiversidad`, no se edita a
// mano) y se carga aparte de species.php a proposito -- ver la cabecera de
// Tools/catalogo-nacional/build-biodiversidad-stats.js para el porque: data.js::loadData() sustituye
// state.data ENTERO cuando hay backend accesible, asi que un campo nuevo dentro de park.json
// desaparecería en cuanto hubiera backend desplegado sin avisar. Aqui no hay ese riesgo porque el
// dato nunca vive dentro de park.json.
// ================================================================================================

import { loadBiodiversidad } from '../data.js';
import { biodiversidadPanel } from '../dom.js';
import { TRAMO_AMENAZA, TRAMOS } from '../rareza.js';
import { state } from '../state.js';
import { html } from '../util.js';

// Los grupos con mas fichas primero: es lo que responde "que hay sobre todo aqui", y con mas de
// veinte grupos distintos en algunos espacios (ver carrascoy-y-el-valle) una lista sin ordenar obliga
// a leerla entera para saber que domina.
function gruposOrdenados(porGrupo) {
  return Object.entries(porGrupo || {}).sort((a, b) => b[1] - a[1]);
}

// Una fila de la escalera de rareza, con el mismo color que ya tiñe la tarjeta del catalogo y la
// ficha (`.progress-row.rareza-N`, Css/styles.css) -- nunca una paleta nueva. `tramo` es `null` para
// la fila "sin calcular", que es un tramo aparte y no un cero (ver Frontend/Js/rareza.js).
function filaRareza(tramo, n, total) {
  const clase = tramo === null ? 'rareza-nd' : 'rareza-' + tramo;
  const etiqueta = tramo === null ? 'Sin tramo calculado' : TRAMOS[tramo].corto;
  const pct = total > 0 ? Math.round((n * 100) / total) : 0;
  return html`<li class="progress-row ${clase}"><span class="progress-row-label">${etiqueta}</span><span class="progress-row-value">${n} · ${pct}%</span></li>`;
}

// El nivel de evidencia mide de cuanto se sostiene documentalmente una ficha (regla n.3 del
// CLAUDE.md raiz), NO si el avistamiento es correcto: un N3 es una especie con solo registros de
// campo (GBIF) y ninguna figura legal ni respaldo normativo que la cite en este espacio -- el dato
// puede ser perfectamente cierto, solo que esta app no tiene, todavia, con que citarlo por escrito.
const NIVEL_EVIDENCIA = [
  ['n1', 'respaldo documental directo (norma o formulario del sitio)'],
  ['n2', 'figura legal o Atlas de Hábitats'],
  ['n3', 'solo registros de campo (GBIF)'],
];

export async function renderBiodiversidadTab() {
  if (!biodiversidadPanel) return;
  biodiversidadPanel.innerHTML = html`<p class="select-hint">Cargando biodiversidad…</p>`;
  const porParque = await loadBiodiversidad();
  const stats = porParque[state.activeParkSlug];
  if (!stats) {
    biodiversidadPanel.innerHTML = html`<div class="progress-section"><h3>Biodiversidad</h3>
      <p class="account-note">Todavía no hay estadísticas agregadas para este espacio.</p></div>`;
    return;
  }

  const habitatsSection = html`<div class="progress-section"><h3>Hábitats</h3>
    <span class="progress-caption">${stats.habitats.prioritarios} de ${stats.habitats.total} son hábitats prioritarios (${stats.habitats.prioritariosPct}%)</span></div>`;

  const gruposHtml = gruposOrdenados(stats.especies.porGrupo).map(([grupo, n]) =>
    html`<li class="progress-row"><span class="progress-row-label">${grupo}</span><span class="progress-row-value">${n}</span></li>`);
  const especiesSection = html`<div class="progress-section"><h3>Especies</h3>
    <span class="progress-caption">${stats.especies.total} especies · ${stats.especies.flora} de flora, ${stats.especies.fauna} de fauna</span>
    <ul class="progress-list">${gruposHtml}</ul></div>`;

  const t = stats.rareza.tramos;
  const filasRareza = [5, 4, 3, 2, 1].map(n => filaRareza(n, t[n] || 0, stats.especies.total));
  if (t.sinCalcular) filasRareza.push(filaRareza(null, t.sinCalcular, stats.especies.total));
  const rarezaSection = html`<div class="progress-section"><h3>Rareza legal</h3>
    <span class="progress-caption">${stats.rareza.conProteccionPct}% con alguna figura de protección · ${stats.rareza.amenazadasPct}% en categoría de amenaza (tramo ≥ ${TRAMO_AMENAZA})</span>
    <ul class="progress-list">${filasRareza}</ul></div>`;

  const ev = stats.evidencia;
  const evidenciaSection = ev ? html`<div class="progress-section"><h3>Respaldo documental</h3>
    <p class="account-note">De cuánto se sostiene por escrito cada ficha, no de si el avistamiento es correcto: ${NIVEL_EVIDENCIA.map(([clave, texto]) => `${ev[clave]} con ${texto}`).join(', ')}.</p></div>` : '';

  biodiversidadPanel.innerHTML = html`${habitatsSection}${especiesSection}${rarezaSection}${evidenciaSection}
    <p class="account-note">Cifras agregadas sobre el catálogo ya publicado de este espacio: no son un inventario validado en campo, y crecen según avanza el alta de especies y hábitats.</p>`;
}
