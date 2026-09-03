// ================================================================================================
// ./render/detalle.js — panel de detalle: ficha de especie, de hábitat y de punto de interés
// ------------------------------------------------------------------------------------------------
// Trozo de render.js. El índice de la carpeta está en Frontend/Js/CLAUDE.md.
// ================================================================================================

import { audioBlock } from '../audio.js';
import { detailPanel } from '../dom.js';
import { explicaAsociacion, explicacionFitosociologia } from '../fitosociologia.js';
import { highlightGlossary } from '../glossary.js';
import { groupSwatch, habitatGroup, habitatsOfGroup } from '../habitat-groups.js';
import { isMarkVerifiedLocally } from '../presence.js';
import { TRAMOS, baseDe, cartelAdvertencia, estrellas, recordatorioAdvertencia, tramoDe } from '../rareza.js';
import { esMigratoria, habitatAreaLabel, habitatSpeciesSeenCount, isHabitatComplete, speciesOfHabitat, state } from '../state.js';
import { atributosAmpliar, habitatImageSrc, html, kingdomEmoji, poiImageSrc, raw, speciesImageSrc } from '../util.js';
import { renderInvasoraDetail } from './invasoras.js';

// --- Panel de detalle (ficha de especie o de hábitat) ------------------------------------------------
function renderTaxonomyRow(label, value) {
  if (!value) return '';
  return html`<div><span>${label}</span><strong>${value}</strong></div>`;
}

// ¿La portada de esta ficha es una foto de verdad o una imagen generada? De ello dependen dos
// cosas: si la foto se puede ampliar (visor.js) y si hay que citar a alguien por ella.
function hayFotoPropia(item) { return !!(item && item.image && String(item.image).trim()); }
function creditoFoto(item) {
  if (!item || !item.imageAttribution) return '';
  return 'Foto: ' + item.imageAttribution + (item.imageNote ? ' — ' + item.imageNote : '');
}

// El panel de detalle de la derecha muestra o bien la etiqueta de una especie o bien la de un
// hábitat, según qué haya seleccionado el usuario (`detailMode`).
export function renderDetail() {
  if (state.detailMode === 'invasora') { renderInvasoraDetail(); return; } // ya resalta el glosario dentro
  if (state.detailMode === 'poi') renderPoiDetail();
  else if (state.detailMode === 'habitat') renderHabitatDetail();
  else renderSpeciesDetail();
  // Resalta los términos del glosario en las descripciones ya pintadas (no-op si aún no cargó).
  highlightGlossary(detailPanel);
}

// La asociación fitosociológica de la cartografía oficial, servida de forma que la entienda quien no
// es botánico. Se muestran tres cosas y en este orden: el nombre en llano (lo que el visitante tiene
// delante), la lectura de qué vegetación es, y la CITA COMPLETA —nombre latino + autores y año— que
// es el dato oficial y la referencia bibliográfica, y que por eso nunca se recorta ni se sustituye.
// Sin diccionario cargado (sin conexión y sin caché aún) se degrada a la cita sola, que es como se
// mostraba antes: se pierde la explicación, nunca el dato. Ver Frontend/Js/fitosociologia.js.
function fitosociologiaBlock(habitat) {
  const citas = habitat.fitosociologia || [];
  if (!citas.length) return '';
  const ayuda = explicacionFitosociologia();
  const items = citas.map(cadena => {
    const a = explicaAsociacion(cadena);
    const plantas = a.nombradaPor.map((p, i) => html`${i === 0 ? '' : (i === a.nombradaPor.length - 1 ? ' y ' : ', ')}<em>${p.cientifico}</em>${p.comun ? ' (' + p.comun + ')' : ''}`);
    return html`<li class="fito-item">
      ${a.nombre ? html`<p class="fito-name">${a.nombre}${a.rango ? html` <span class="fito-rank">${a.rango}</span>` : ''}</p>` : ''}
      ${a.lectura ? html`<p class="detail-prose fito-read">${a.lectura}</p>` : ''}
      ${plantas.length ? html`<p class="fito-named">Nombrada por ${plantas}</p>` : ''}
      <p class="fito-cite"><em>${a.latino}</em>${a.autoria ? html` <span class="fito-author">${a.autoria}</span>` : ''}</p>
      </li>`;
  });
  return html`<h3 class="detail-subtitle">Asociación fitosociológica</h3>
    <ul class="fito-list">${items}</ul>
    ${ayuda ? html`<details class="fito-help">
      <summary>¿Qué es esto y cómo se lee el nombre?</summary>
      <p class="detail-prose">${ayuda.texto}</p>
      <p class="detail-prose">${ayuda.comoSeLee}</p>
      <dl class="fito-suffixes">${(ayuda.terminaciones || []).map(t => html`<dt><em>${t.sufijo}</em> · ${t.rango}</dt><dd>${t.significa}</dd>`)}</dl>
      <p class="detail-prose">${ayuda.autoria}</p>
      <p class="detail-prose">${ayuda.porQueImporta}</p>
      </details>` : ''}
    <p class="detail-source">Fuente: Cartografía de Hábitats, Directiva 92/43/CEE (MITECO). La explicación en lenguaje llano es de NaturDex.</p>`;
}

function renderHabitatDetail() {
  const habitat = (state.data.habitats || []).find(item => item.id === state.selectedHabitatId)
    ?? (state.data.habitats || [])[0];
  if (!habitat) { detailPanel.innerHTML = ''; return; }
  const total = (habitat.speciesIds || []).length;
  const seen = habitatSpeciesSeenCount(habitat);
  const complete = isHabitatComplete(habitat);
  const pct = total ? Math.round((seen / total) * 100) : 0;
  const area = habitatAreaLabel(habitat);
  // El grupo va en la ficha —con su trama— y es además un enlace: desde un hábitat tocado en el
  // mapa se sube a sus vecinos de tipo sin volver al principio del catálogo.
  const group = habitatGroup(habitat);
  const groupSize = habitatsOfGroup(group.id).length;
  // En orden alfabético, el mismo que la lista del catálogo (ver state.speciesOfHabitat).
  const chips = speciesOfHabitat(habitat).map(s => {
    const wasSeen = state.seenSpecies.has(s.id);
    return html`<button type="button" class="habitat-species-chip${wasSeen ? ' seen' : ''}" data-species-chip="${s.id}"><span aria-hidden="true">${kingdomEmoji(s)}</span>${s.commonName}${wasSeen ? html` <span aria-hidden="true">✓</span><span class="sr-only">(vista)</span>` : ''}</button>`;
  });
  detailPanel.innerHTML = html`<div class="detail-image-wrap habitat-detail-image">
    <img src="${habitatImageSrc(habitat)}" alt="${habitat.name}" onerror="window.__habitatImgFallback(this,'${habitat.id}')"${atributosAmpliar(hayFotoPropia(habitat), habitat.name, creditoFoto(habitat))}>
    <span class="habitat-detail-kind">Hábitat</span>
    </div>
    <div class="detail-body">
    <span class="card-meta">
    <span class="badge habitat-code">${habitat.code || ''}</span>
    <span class="badge">${habitat.type || ''}</span>
    ${habitat.priority ? html`<span class="badge alert">prioritario UE</span>` : ''}
    ${habitat.reviewNote ? html`<span class="badge review">a revisar</span>` : ''}
    ${complete && total > 0 ? html`<span class="badge">completo 🏅</span>` : ''}
    </span>
    <button type="button" class="detail-group-link" data-habitat-group-link="${group.id}" title="Ver los hábitats de este grupo">${raw(groupSwatch(group, 18))}${group.name}${groupSize > 1 ? html` · ${groupSize} hábitats` : ''}</button>
    <h2>${habitat.name}</h2>
    <p class="detail-prose">${habitat.description}</p>
    ${audioBlock(habitat, 'Audioguía del hábitat')}
    <div class="detail-facts">
    <div><span>Código Natura 2000</span><strong>${habitat.code || '—'}</strong></div>
    ${habitat.hicSubtipos && habitat.hicSubtipos.length > 1 ? html`<div><span>Subtipos HIC</span><strong>${habitat.hicSubtipos.join(', ')}</strong></div>` : ''}
    <div><span>Superficie en el parque</span><strong>${area || 'Sin cartografiar'}</strong></div>
    </div>
    ${fitosociologiaBlock(habitat)}
    <div class="habitat-detail-progress">
    <div class="progress-track big" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" aria-label="Especies vistas en este hábitat"><div class="progress-fill" style="width:${pct}%"></div></div>
    <span class="progress-caption">${seen} / ${total} especies vistas en este hábitat</span>
    </div>
    ${total > 0 ? html`<h3 class="detail-subtitle">Especies de este hábitat</h3><div class="habitat-species-chips">${chips}</div>` : ''}
    ${habitat.reviewNote ? html`<div class="review-note"><strong>Pendiente de revisión:</strong> ${habitat.reviewNote}</div>` : ''}
    ${habitat.image && habitat.imageAttribution ? html`<p class="detail-source">Foto: ${habitat.imageAttribution}${habitat.imageNote ? ' — ' + habitat.imageNote : ''}</p>` : ''}
    <button class="seen-toggle" type="button" data-view-habitat-species="${habitat.id}">Ver ${total === 1 ? 'la especie' : 'las ' + total + ' especies'} en el catálogo</button>
    </div>`;
}

// Ficha de un punto de interés. Antes vivía dentro de un globo del mapa, apretada entre una foto de
// 180 px y el borde de la pantalla; aquí tiene el mismo formato que las demás fichas (foto de
// portada, datos, audioguía y su botón de marcar), y por tanto el mismo modo de cerrarse.
function renderPoiDetail() {
  const poi = (state.data.pointsOfInterest || []).find(item => item.id === state.selectedPoiId);
  if (!poi) { detailPanel.innerHTML = ''; return; }
  const seen = state.seenPois.has(poi.id);
  detailPanel.innerHTML = html`<div class="detail-image-wrap poi-detail-image">
    <img src="${poiImageSrc(poi)}" alt="${poi.name}" onerror="window.__poiImgFallback(this)"${atributosAmpliar(hayFotoPropia(poi), poi.name, creditoFoto(poi))}>
    <span class="habitat-detail-kind">Punto de interés</span>
    </div>
    <div class="detail-body">
    <span class="card-meta"><span class="badge">${poi.type || 'Punto de interés'}</span>${poi.approx ? html`<span class="badge review">ubicación aproximada</span>` : ''}${seen ? html`<span class="badge">visitado ✓</span>` : ''}</span>
    <h2>${poi.name}</h2>
    <p class="detail-prose">${poi.description || ''}</p>
    ${audioBlock(poi, 'Audioguía del punto de interés')}
    ${poi.approx ? html`<div class="review-note">La posición de este punto en el mapa es <strong>aproximada</strong>: sigue las indicaciones del terreno y los senderos señalizados.</div>` : ''}
    ${poi.source ? html`<p class="detail-source">Fuente: ${poi.source}</p>` : ''}
    <button class="seen-toggle ${seen ? 'is-seen' : ''}" type="button" data-toggle-poi="${poi.id}" aria-pressed="${seen ? 'true' : 'false'}">${seen ? '✓ Visitado' : 'Marcar como visitado'}</button>
    ${seen ? markVerificationNote('poi', poi.id) : ''}
    </div>`;
}

// Estado de verificación de una marca concreta, bajo su botón de "visto". Es la contrapartida
// honesta de que los logros exijan presencia: si algo no va a contar, se dice en su ficha, no se
// deja al usuario descubrirlo al ver que el contador no sube. La predicción es local (lo que este
// dispositivo sabe de tus visitas); en cuanto hay red, el servidor la corrige.
function markVerificationNote(type, id) {
  const markedIso = (state.markedAt || {})[type + ':' + id];
  const verified = markedIso ? isMarkVerifiedLocally(state.activeParkSlug, Date.parse(markedIso)) : false;
  return verified
    ? html`<p class="mark-verified">✅ Avistamiento verificado en campo: cuenta para tus logros.</p>`
    : html`<p class="mark-unverified">◌ Sin verificar: está en tu cuaderno, pero no cuenta para los logros. Solo suman las marcas hechas dentro del parque con la ubicación activada.</p>`;
}

/**
 * Qué dice el formulario oficial del sitio sobre CUÁNDO está aquí esta ave, y quién lo dice.
 *
 * El bloque existe porque el distintivo «🕊️ Ave migratoria» no puede ser la única afirmación: una
 * etiqueta sin fuente al lado es exactamente lo que la regla nº 2 del CLAUDE.md raíz prohíbe. El
 * dato ya estaba —el tipo de población del FND— pero solo dentro del párrafo de `source`, entre
 * otras cuatro citas y en mitad de una frase.
 *
 * Se pinta también cuando el ave NO es migratoria: «residente todo el año» es la misma afirmación
 * oficial, y es la que explica por qué esta ficha no lleva el distintivo que llevan las de al lado.
 */
function bloquePresenciaSitio(species) {
  const p = species.sitePresence;
  if (!p || !p.etiqueta) return '';
  return html`<h3 class="detail-subtitle">Presencia en este espacio</h3>
    <ul class="status-list">
    <li class="detail-prose"><span>Población</span>${p.etiqueta}</li>
    </ul>
    <p class="detail-source">${esMigratoria(species)
      ? 'No vive aquí todo el año: por eso su tarjeta del catálogo lleva el distintivo de migratoria.'
      : 'Aquí hay población todo el año, así que no cuenta como migratoria en este espacio.'} Fuente: ${p.fuente}</p>`;
}

function renderSpeciesDetail() {
  const species = state.data.species.find(item => item.id === state.selectedId) ?? state.data.species[0];
  if (!species) { detailPanel.innerHTML = ''; return; }
  const seen = state.seenSpecies.has(species.id);
  const tx = species.taxonomy || {};
  // Las estrellas cuentan lo excepcional que es la especie EN ESTE ESPACIO, así que mandan el tramo
  // local (la categoría legal más grave de las dos escalas, estatal y autonómica). `rarityScore` es
  // el estatal, universal, y solo se usa de reserva: en las fichas que aún no tienen tramo local Y
  // que además traen `rarityBasis`, es decir, cuando ese tramo sale de una norma y no del criterio
  // propio heredado. Una ficha sin ninguno de los dos NO cuenta como un 1: el criterio vive en
  // Js/rareza.js.
  const rareza = tramoDe(species);
  const base = baseDe(species);
  detailPanel.innerHTML = html`<div class="detail-image-wrap">
    <img src="${speciesImageSrc(species)}" alt="${species.commonName}" onerror="window.__imgFallback(this,${species.id})"${atributosAmpliar(hayFotoPropia(species), species.commonName, creditoFoto(species))}>
    </div>
    <div class="detail-body">
    <span class="card-meta"><span class="badge ${species.kingdom}">${species.kingdom}</span>
    <span class="badge alert">${species.conservationStatus}</span>
    ${esMigratoria(species) ? html`<span class="badge migratoria">🕊️ Ave migratoria</span>` : ''}
    ${species.reviewNote ? html`<span class="badge review">a revisar</span>` : ''}
    </span>
    <h2>${species.commonName}</h2><em>${species.scientificName}</em>
    ${cartelAdvertencia(species)}
    <p class="detail-prose">${species.description}</p>
    <ul class="detail-list detail-prose">${species.tips.map(tip => html`<li>${tip}</li>`)}</ul>
    <div class="detail-facts">
    <div><span>Hábitat</span><strong>${species.habitat}</strong></div>
    <div><span>Temporada</span><strong>${species.seasonality}</strong></div>
    <div><span>Grupo</span><strong>${species.group}</strong></div>
    <div><span>Rareza</span><strong>${rareza === null
      ? 'Sin calcular'
      : html`<span role="img" aria-label="${rareza} de 5">${estrellas(rareza)}</span>`}</strong></div>
    </div>
    ${rareza === null
      ? html`<p class="detail-source">La rareza sale de la <strong>categoría legal de protección</strong>, no de lo difícil que sea encontrarla. Esta ficha todavía no la tiene calculada.</p>`
      : html`<p class="detail-source">Rareza = <strong>${TRAMOS[rareza].significado}</strong>. Sale de la categoría legal vigente${base ? html`: ${base.categoria}${base.norma ? ' — ' + base.norma : ''}` : ', aunque esta ficha no guarda la norma que la justifica'}.</p>`}
    <h3 class="detail-subtitle">Taxonomía</h3>
    <div class="detail-facts detail-taxonomy">
    ${renderTaxonomyRow('Reino', tx.kingdom)}
    ${renderTaxonomyRow('Filo/División', tx.phylum)}
    ${renderTaxonomyRow('Clase', tx.class)}
    ${renderTaxonomyRow('Orden', tx.order)}
    ${renderTaxonomyRow('Familia', tx.family)}
    ${renderTaxonomyRow('Género', tx.genus)}
    </div>
    <h3 class="detail-subtitle">Estado de conservación</h3>
    <ul class="status-list">
    <li class="detail-prose"><span>UICN (global)</span>${species.iucnGlobal || 'No evaluada'}</li>
    ${/*
      * La Lista Roja ESPAÑOLA es otra evaluación de la UICN, no un matiz de la mundial: una especie
      * puede ser LC en el mundo y NT en España. Solo se pinta si el dato existe — a diferencia de la
      * mundial, que se enseña siempre con su «No evaluada»—, porque aquí un hueco significa «EIDOS
      * no trae esa fila» y no «comprobado que no está evaluada», y son cosas distintas.
      */''}
    ${species.iucnSpain ? html`<li class="detail-prose"><span>UICN (España)</span>${species.iucnSpain}</li>` : ''}
    <li class="detail-prose"><span>España</span>${species.spainStatus || 'Sin dato'}</li>
    ${/*
      * El rótulo de esta fila decía «Región de Murcia» ESCRITO A MANO, y era el último sitio donde
      * el rollout nacional seguía atado al parque piloto (deuda nº 2): la ficha de una especie de
      * Doñana habría anunciado su estado legal bajo un rótulo murciano. Ahora la comunidad viaja en
      * el dato, ficha a ficha, porque la misma especie puede estar catalogada distinto en dos
      * comunidades y el rótulo tiene que decir de cuál habla.
      *
      * Sin `regionalCcaa` NO se pone un rótulo genérico: se dice «comunidad autónoma» a secas, que
      * es lo único cierto cuando el dato no lo aclara.
      */''}
    <li class="detail-prose"><span>${species.regionalCcaa || 'Comunidad autónoma'}</span>${species.regionalStatus || 'Sin dato'}</li>
    </ul>
    ${bloquePresenciaSitio(species)}
    ${species.reviewNote ? html`<div class="review-note"><strong>Pendiente de revisión:</strong> ${species.reviewNote}</div>` : ''}
    ${species.image && species.imageAttribution ? html`<p class="detail-source">Foto: ${species.imageAttribution}</p>` : ''}
    ${species.source ? html`<p class="detail-source">Fuente: ${species.source}</p>` : ''}
    ${recordatorioAdvertencia(species)}
    <button class="seen-toggle ${seen ? 'is-seen' : ''}" type="button" data-toggle-seen="${species.id}" aria-pressed="${seen ? 'true' : 'false'}">${seen ? '✓ Visto' : 'Marcar como visto'}</button>
    ${seen ? markVerificationNote('species', species.id) : ''}
    ${seen ? html`<p class="detail-source">${state.sightings.has(species.id)
      ? '📍 Ya está en el mapa, en el punto exacto que registró tu GPS al marcarla.'
      : '📍 Ya está en el mapa, en su ubicación aproximada del catálogo (no había GPS al marcarla).'}</p>` : ''}
    </div>`;
}
