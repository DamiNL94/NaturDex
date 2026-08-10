// ================================================================================================
// ./render/resumen.js — cabecera del parque, ficha base (status 'basic') y barra de progreso
// ------------------------------------------------------------------------------------------------
// Trozo de render.js. El índice de la carpeta está en Frontend/Js/CLAUDE.md.
// ================================================================================================

import { basicNotice, detailPanel, habitatCount, parkEyebrow, parkSummary, poiCount, progressFill, progressLabel, progressTrack, speciesCount } from '../dom.js';
import { highlightGlossary } from '../glossary.js';
import { state } from '../state.js';
import { html } from '../util.js';

// --- Cabecera del parque (resumen + barra de progreso) -----------------------------------------------
// Tolerante con los espacios de ficha base (status "basic"): sus arrays están vacíos. app.js oculta
// la rejilla de contadores en ese caso, pero aquí no se asume nada.
export function renderSummary() {
  const park = (state.data && state.data.park) || {};
  habitatCount.textContent = (state.data.habitats || []).length;
  speciesCount.textContent = (state.data.species || []).length;
  // Un espacio sin puntos de interés cargados todavía no tiene "cero puntos": tiene el dato
  // pendiente. El guion lo dice sin fingir un recuento, igual que hacía la casilla de costa con los
  // espacios de interior.
  const pois = (state.data.pointsOfInterest || []).length;
  poiCount.textContent = pois > 0 ? pois : '—';
  // Línea de encima del rótulo: qué ES el sitio, figura de protección y superficie oficial. Nada
  // más, porque es UNA línea en versalitas y con un tercer dato se parte en dos en la columna
  // estrecha. La superficie sale de la geometría oficial (la misma que dibuja el límite en el mapa),
  // así que la tienen los dieciséis espacios, tengan catálogo o no; si alguno llegase sin ella,
  // simplemente no aparece. Lo que ocupaba antes esta línea («NaturDex piloto») era la firma de la
  // app dentro de la propia app, y el aviso de «Ficha base» que la acompañaba no se pierde: lo dan
  // el rótulo del panel de catálogo («Catálogo en preparación · Ficha base») y la insignia de la
  // propia ficha del espacio.
  if (parkEyebrow) {
    parkEyebrow.textContent = [park.category, boundaryHectares()].filter(Boolean).join(' · ');
  }
  parkSummary.textContent = park.summary || '';
  renderProgress();
}

// --- Ficha base (espacios con status "basic") ---------------------------------------------------
// Un espacio N1 tiene límite oficial y códigos Natura 2000, pero todavía no catálogo de especies ni
// hábitats. En vez de dejar el catálogo vacío y los contadores a cero sin explicación, la barra
// lateral muestra un aviso y el panel de detalle la ficha administrativa: solo dato verificado del
// park.json y de la geometría oficial, nada inventado.

// Códigos de la Red Natura 2000 leídos de la propia geometría (LIC/ZEC y ZEPA). Las capas del IEPNB
// no usan siempre la misma capitalización en las propiedades, así que se prueban ambas variantes.
function natura2000Sites() {
  const out = [];
  const collect = (geo, kind) => {
    ((geo && geo.features) || []).forEach(f => {
      const p = f.properties || {};
      const code = p.SITE_CODE || p.site_code || p.codigo || null;
      const name = p.SITE_NAME || p.site_name || p.nombre || '';
      if (code) out.push({ kind, code, name });
    });
  };
  collect(state.geo && state.geo.lic, 'LIC/ZEC');
  collect(state.geo && state.geo.zepa, 'ZEPA');
  return out;
}

// Superficie oficial del espacio, si viene en las propiedades del límite (ha).
function boundaryHectares() {
  const feats = (state.geo && state.geo.parque && state.geo.parque.features) || [];
  let total = 0;
  feats.forEach(f => {
    const p = f.properties || {};
    const ha = typeof p.Hectareas === 'number' ? p.Hectareas : (typeof p.hectares === 'number' ? p.hectares : null);
    if (ha != null) total += ha;
  });
  return total > 0 ? Math.round(total).toLocaleString('es-ES') + ' ha' : null;
}

function factRow(label, value) {
  if (!value) return '';
  return html`<div><span>${label}</span><strong>${value}</strong></div>`;
}

export function renderBasicPark() {
  const park = (state.data && state.data.park) || {};
  const sites = natura2000Sites();
  const municipios = (park.municipalities || []).join(', ');
  const area = boundaryHectares();
  const sitesLabel = sites.length ? sites.map(s => s.kind + ' ' + s.code).join(' · ') : null;

  if (basicNotice) {
    basicNotice.innerHTML = html`<div class="section-title"><h2>Catálogo en preparación</h2><span class="badge">Ficha base</span></div>
      <p class="basic-lead">De este espacio ya tenemos su <strong>límite oficial</strong> y sus <strong>códigos de la Red Natura 2000</strong>: puedes verlos dibujados en el mapa y activarlos desde el panel de capas.</p>
      <p class="basic-lead"><strong>El catálogo de especies y hábitats está en preparación para este espacio.</strong> Todavía no hay fichas que explorar aquí, y por eso no se muestran contadores ni progreso: preferimos un hueco declarado a un dato inventado.</p>
      <p class="basic-foot">Mientras tanto, desde <strong>← Parques</strong> puedes entrar a los espacios que ya tienen el catálogo completo.</p>`;
  }

  detailPanel.innerHTML = html`<div class="detail-body basic-detail">
    <span class="card-meta"><span class="badge">${park.category || 'Espacio protegido'}</span><span class="badge review">ficha base</span></span>
    <h2>${park.name || ''}</h2>
    <p class="detail-prose">${park.summary || ''}</p>
    <div class="detail-facts">
    ${factRow('Figura de protección', park.category)}
    ${factRow('Comunidad autónoma', park.region)}
    ${factRow('Provincia', park.province)}
    ${factRow('Municipios', municipios)}
    ${factRow('Superficie', area)}
    ${factRow('Red Natura 2000', sitesLabel)}
    </div>
    ${sites.length ? html`<h3 class="detail-subtitle">Sitios de la Red Natura 2000</h3><ul class="status-list">${sites.map(s => html`<li class="detail-prose"><span>${s.kind} · ${s.code}</span>${s.name || 'Sin nombre en la fuente'}</li>`)}</ul>` : ''}
    ${park.boundaryNote ? html`<p class="detail-source">Fuente del límite: ${park.boundaryNote}</p>` : ''}
    </div>`;
  highlightGlossary(detailPanel);
}

export function renderProgress() {
  if (!progressTrack) return;
  const total = state.data.species.length;
  const seen = state.seenSpecies.size;
  const pct = total ? Math.round((seen / total) * 100) : 0;
  progressFill.style.width = pct + '%';
  progressTrack.setAttribute('aria-valuenow', String(pct));
  progressLabel.textContent = seen + ' / ' + total + ' especies descubiertas';
}
