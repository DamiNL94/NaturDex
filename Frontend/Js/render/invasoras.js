// ================================================================================================
// ./render/invasoras.js — pestaña de especies exóticas invasoras y su ficha
// ------------------------------------------------------------------------------------------------
// Trozo de render.js. El índice de la carpeta está en Frontend/Js/CLAUDE.md.
// ================================================================================================

import { isInvasiveSeenLocally } from '../achievements.js';
import { detailPanel, invasorasPanel } from '../dom.js';
import { highlightGlossary } from '../glossary.js';
import { state } from '../state.js';
import { atributosAmpliar, html, invasoraEmoji, invasoraImageSrc, plegable } from '../util.js';

// --- Pestaña de invasoras -----------------------------------------------------------------------------
// Lista de invasoras del parque (filtradas por la CCAA de la región).
function invasorasForPark() {
  const region = state.data.park && state.data.park.region;
  return (state.data.invasoras || []).filter(i => !region || i.ccaa === region);
}

export function renderInvasoras() {
  if (!invasorasPanel) return;
  const region = state.data.park && state.data.park.region;
  const list = invasorasForPark();
  // Tarjetas compactas y clicables (como las de especies): miniatura de la foto —que es justo lo
  // que hay que reconocer en el campo— y, si la foto falla, la portada con el emoji del grupo.
  //
  // Comparten la estructura de .species-card, que dejó de ser un <button> para poder llevar dentro
  // el desplegable «+N datos» (ver render/catalogo.js): la caja es el <div> y lo que se pulsa es el
  // .species-card-main de dentro. Aquí NO hay desplegable, y no por olvido: una invasora lleva
  // siempre exactamente dos distintivos —«Invasora» y su grupo—, que es justo el máximo, así que no
  // hay nada que esconder. El día que se le añada un tercero, éste es el sitio.
  const cards = list.map(i => html`<div class="species-card invasora-card${i.scientificName === state.selectedInvasora ? ' active' : ''}" data-invasora="${i.scientificName}"><button class="species-card-main" type="button"${i.scientificName === state.selectedInvasora ? html` aria-current="true"` : ''}><span class="card-thumb invasora-thumb"><img src="${invasoraImageSrc(i)}" alt="" loading="lazy" data-group="${i.group || ''}" onerror="window.__invThumbFallback(this)"></span><span><span class="card-meta"><span class="badge alert">Invasora</span><span class="badge">${i.group || ''}</span></span><h3>${i.commonName || i.scientificName}</h3><em>${i.scientificName}</em></span></button></div>`);
  const intro = list.length
    ? html`<p class="invasoras-intro">Especies exóticas <strong>invasoras</strong> registradas en ${region || 'esta zona'} (Catálogo Español de EEI, RD 630/2013). No son parte de la fauna y flora del parque: apréndelas a reconocer y <strong>no las plantes, transportes ni sueltes</strong> en el medio natural. Pulsa una para ver su ficha.</p>`
    : html`<p class="invasoras-intro">No hay invasoras catalogadas para esta zona todavía.</p>`;
  invasorasPanel.innerHTML = html`<div class="section-title"><h2>Especies invasoras</h2><span role="status">${list.length}</span></div>${intro}<div class="species-list">${cards}</div>`;
}

export function renderInvasoraDetail() {
  const list = invasorasForPark();
  const inv = list.find(i => i.scientificName === state.selectedInvasora) ?? list[0];
  if (!inv) { detailPanel.innerHTML = ''; return; }
  const emoji = invasoraEmoji(inv.group);
  const hasPhoto = inv.image && /^https?:/.test(inv.image);
  const identified = isInvasiveSeenLocally(inv.scientificName);
  detailPanel.innerHTML = html`<div class="detail-image-wrap invasora-detail-hero">
    ${hasPhoto
      ? html`<img src="${inv.image}" alt="${inv.commonName || inv.scientificName}" data-emoji="${emoji}" onerror="window.__invImgFallback(this)"${atributosAmpliar(true, inv.commonName || inv.scientificName, inv.imageAttribution ? 'Foto: ' + inv.imageAttribution : '')}>`
      : html`<span class="invasora-hero-emoji" aria-hidden="true">${emoji}</span>`}
    <span class="habitat-detail-kind">Invasora</span>
    </div>
    <div class="detail-body">
    <span class="card-meta"><span class="badge alert">Especie invasora</span><span class="badge">${inv.group || ''}</span></span>
    <h2>${inv.commonName || inv.scientificName}</h2><em>${inv.scientificName}</em>
    <p class="detail-prose">${inv.description || ''}</p>
    <div class="review-note invasora-warning"><strong>Especie exótica invasora.</strong> Introducirla en el medio natural, transportarla o comerciar con ella está prohibido (RD 630/2013). Si la tienes en el jardín, no tires los restos de poda al campo.</div>
    ${/*
      * «Por qué es un problema» y «Cómo llegó y cómo se propaga» NO se pliegan: son el motivo por
      * el que esta pestaña existe, y lo que le dice a alguien qué no hacer con la planta que tiene
      * en el jardín. Lo que se pliega es la ficha administrativa —origen, grupo, catálogo oficial,
      * cuántos registros hay en GBIF—, que se lee una vez y no cambia nada de lo que uno hace.
      */''}
    ${inv.impact ? html`<h3 class="detail-subtitle">Por qué es un problema</h3><p class="detail-prose">${inv.impact}</p>` : ''}
    ${inv.pathway ? html`<h3 class="detail-subtitle">Cómo llegó y cómo se propaga</h3><p class="detail-prose">${inv.pathway}</p>` : ''}
    <button class="seen-toggle ${identified ? 'is-seen' : ''}" type="button" data-mark-invasive="${inv.scientificName}" data-invasive-ccaa="${inv.ccaa || ''}" aria-pressed="${identified ? 'true' : 'false'}"${identified ? ' disabled' : ''}>${identified ? '✓ Identificada' : 'Marcar como identificada'}</button>
    ${plegable('Ficha administrativa', html`<ul class="status-list">
    ${inv.origin ? html`<li class="detail-prose"><span>Origen</span>${inv.origin}</li>` : ''}
    ${inv.habitat ? html`<li class="detail-prose"><span>Dónde vive</span>${inv.habitat}</li>` : ''}
    <li><span>Grupo</span>${inv.group || 'Sin dato'}</li>
    <li><span>Catálogo oficial</span>${inv.catalogo || 'Catálogo Español de EEI (RD 630/2013)'}</li>
    <li><span>Presencia en ${inv.ccaa || 'la zona'}</span>${inv.gbifOccurrences ? inv.gbifOccurrences + ' registros (GBIF)' : 'Registrada'}</li>
    </ul>`)}
    ${plegable('Fuentes y crédito de la foto', html`${hasPhoto && inv.imageAttribution ? html`<p class="detail-source">Foto: ${inv.imageAttribution}</p>` : ''}${inv.source ? html`<p class="detail-source">Fuente: ${inv.source}</p>` : ''}`)}
    </div>`;
  highlightGlossary(detailPanel);
}
