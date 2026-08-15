// ================================================================================================
// ./render/progreso.js — pestaña de progreso del parque, progreso de cuenta e historial de salidas verificadas
// ------------------------------------------------------------------------------------------------
// Trozo de render.js. El índice de la carpeta está en Frontend/Js/CLAUDE.md.
// ================================================================================================

import { loadAchievementsCatalog, loadRegistry, refreshAccountProgress } from '../achievements.js';
import { accountProgressBody, progressPanel } from '../dom.js';
import { groupSwatch, groupedHabitats } from '../habitat-groups.js';
import { isMarkVerifiedLocally } from '../presence.js';
import { ACHIEVEMENT_NAME, computeProgress, state } from '../state.js';
import { html, icon, raw } from '../util.js';

// --- Pestaña de progreso ------------------------------------------------------------------------------
// Tarjeta de logro reutilizable (bloqueado/desbloqueado). `justUnlocked` anima el que se acaba de ganar.
function achievementCard(name, unlocked, desc, justUnlocked) {
  return html`<div class="achievement-card ${unlocked ? 'unlocked' : 'locked'}${justUnlocked ? ' just-unlocked' : ''}"><span class="achievement-icon" aria-hidden="true">${unlocked ? icon('trophy', 22) : icon('lock', 22)}</span><div><strong>${name}</strong><p>${desc}</p></div></div>`;
}

// Progreso del parque activo contando SOLO lo verificado en campo. Espejo local de lo que hace el
// servidor en Backend/Lib/account_progress.php: cruzar la hora de cada marca con las visitas
// verificadas. Es una predicción (lo que sabe este dispositivo); el servidor tiene la última palabra.
function verifiedParkProgress() {
  const isVerified = (type, id) => {
    const iso = (state.markedAt || {})[type + ':' + id];
    return iso ? isMarkVerifiedLocally(state.activeParkSlug, Date.parse(iso)) : false;
  };
  const species = (state.data.species || []).filter(s => state.seenSpecies.has(s.id) && isVerified('species', s.id));
  const seenIds = new Set(species.map(s => s.id));
  const pois = (state.data.pointsOfInterest || []).filter(p => state.seenPois.has(p.id) && isVerified('poi', p.id));

  const habitats = state.data.habitats || [];
  const habitatsCompleteCount = habitats.filter(h => {
    const members = h.speciesIds || [];
    return members.length > 0 && members.every(id => seenIds.has(id));
  }).length;
  const poisTotal = (state.data.pointsOfInterest || []).length;

  return {
    speciesSeen: species.length,
    poisSeen: pois.length,
    habitatsCompleteCount,
    zepaSeen: species.filter(s => s.zepaSiteCode).length,
    parkComplete: habitats.length > 0 && habitatsCompleteCount === habitats.length
      && poisTotal > 0 && pois.length === poisTotal
  };
}

export function renderProgressTab() {
  const progress = computeProgress();
  const speciesPct = progress.speciesTotal ? Math.round((progress.speciesSeen / progress.speciesTotal) * 100) : 0;
  const poiPct = progress.poisTotal ? Math.round((progress.poisSeen / progress.poisTotal) * 100) : 0;
  const nHab = progress.habitatProgress.length;

  // Hábitats subdivididos: cada uno es un mini-logro con su propia barra; al verlos todos, medalla.
  // Van agrupados igual que en el mapa y en el catálogo —el mismo orden y las mismas cabeceras—, que
  // con veintiuna filas seguidas esta lista era la más difícil de recorrer de la app.
  const progressById = new Map(progress.habitatProgress.map(h => [h.id, h]));
  const habitatsHtml = groupedHabitats().map(({ group, habitats }) => {
    const rows = habitats.map(habitat => {
      const h = progressById.get(habitat.id);
      if (!h) return '';
      const pct = h.total ? Math.round((h.seen / h.total) * 100) : 0;
      return html`<li class="progress-row habitat-goal${h.complete ? ' complete' : ''}"><span class="progress-row-label"><span class="dot" style="background:${h.color || '#2f6f4e'}"></span>${h.name}</span><span class="habitat-goal-bar"><span class="progress-track"><span class="progress-fill" style="width:${pct}%"></span></span></span><span class="progress-row-value">${h.seen}/${h.total}${h.complete ? ' 🏅' : ''}</span></li>`;
    });
    const done = habitats.filter(habitat => (progressById.get(habitat.id) || {}).complete).length;
    return html`<li class="progress-group"><span class="progress-group-title">${raw(groupSwatch(group, 16))}${group.name}<span class="progress-group-count">${done}/${habitats.length}</span></span><ul class="progress-list">${rows}</ul></li>`;
  });

  const poisHtml = (state.data.pointsOfInterest || []).map(p =>
    html`<li class="progress-row${state.seenPois.has(p.id) ? ' complete' : ''}"><span class="progress-row-label">${p.name}</span><span class="progress-row-value">${state.seenPois.has(p.id) ? 'Visitado ✓' : 'Pendiente'}</span></li>`);

  // Los tres logros de este parque se miden sobre lo VERIFICADO, no sobre el cuaderno. Las barras de
  // arriba siguen contando todo lo marcado (es tu registro personal y no se toca), pero una medalla
  // se gana en el campo: si no, esta pestaña seguiría repartiendo logros desde el sofá mientras el
  // progreso estatal ya no lo hace, y la app se contradiría a sí misma.
  const verified = verifiedParkProgress();
  const justUnlocked = verified.parkComplete && !state.parkWasComplete;
  state.parkWasComplete = verified.parkComplete;

  const habitatsAllComplete = nHab > 0 && verified.habitatsCompleteCount === nHab;
  const zepaAllSeen = progress.zepaTotal > 0 && verified.zepaSeen === progress.zepaTotal;
  const pendiente = progress.speciesSeen > verified.speciesSeen || progress.poisSeen > verified.poisSeen
    ? html`<p class="account-note">De lo que llevas marcado en este parque, <strong>${verified.speciesSeen} de ${progress.speciesSeen}</strong> ${progress.speciesSeen === 1 ? 'especie está verificada' : 'especies están verificadas'} en campo. Solo eso cuenta para las medallas.</p>`
    : '';
  const logros = [
    achievementCard('Explorador de hábitats', habitatsAllComplete,
      habitatsAllComplete ? 'Has completado todos los hábitats del parque, avistando sus especies allí mismo.' : `Completa los ${nHab} hábitats avistando todas sus especies dentro del parque (${verified.habitatsCompleteCount}/${nHab}).`, false),
    progress.zepaTotal > 0 ? achievementCard('Gran observador de aves', zepaAllSeen,
      zepaAllSeen ? '¡Lista completa! Has avistado las ' + progress.zepaTotal + ' aves migratorias de este espacio protegido (ZEPA, Red Natura 2000).' : `Completa tu lista de avistamientos de las aves migratorias del parque (${verified.zepaSeen}/${progress.zepaTotal}).`, false) : '',
    achievementCard(ACHIEVEMENT_NAME, verified.parkComplete,
      verified.parkComplete ? 'Logro desbloqueado: has completado todos los hábitats y puntos de interés de este parque, sobre el terreno.'
        : 'Completa todos los hábitats y visita todos los puntos de interés, estando allí, para desbloquear el logro final.', justUnlocked),
    pendiente
  ];

  const zepaPct = progress.zepaTotal ? Math.round((progress.zepaSeen / progress.zepaTotal) * 100) : 0;
  const zepaSection = progress.zepaTotal > 0
    ? html`<div class="progress-section"><h3>🕊️ Aves migratorias</h3><div class="progress-track big" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${zepaPct}" aria-label="Aves migratorias avistadas"><div class="progress-fill" style="width:${zepaPct}%"></div></div><span class="progress-caption">${progress.zepaSeen} / ${progress.zepaTotal} aves migratorias avistadas · tu lista de la ZEPA (Red Natura 2000)</span></div>`
    : '';

  progressPanel.innerHTML = html`<div class="progress-section"><h3>Especies</h3><div class="progress-track big" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${speciesPct}" aria-label="Especies vistas"><div class="progress-fill" style="width:${speciesPct}%"></div></div><span class="progress-caption">${progress.speciesSeen} / ${progress.speciesTotal} especies vistas</span></div><div class="progress-section"><h3>Hábitats</h3><span class="progress-caption">${progress.habitatsCompleteCount} / ${nHab} hábitats completados 🏅</span><ul class="progress-list">${habitatsHtml}</ul></div>${zepaSection}<div class="progress-section"><h3>Puntos de interés</h3><div class="progress-track big" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${poiPct}" aria-label="Puntos de interés visitados"><div class="progress-fill" style="width:${poiPct}%"></div></div><span class="progress-caption">${progress.poisSeen} / ${progress.poisTotal} puntos visitados</span><ul class="progress-list">${poisHtml}</ul></div><div class="progress-section"><h3>Logros</h3>${logros}</div>`;
}

// --- Progreso de CUENTA (ámbito estatal, pantalla "screen-account", fuera de un parque concreto) ----
function accountStat(value, label) {
  return html`<div class="account-stat"><strong>${value ?? 0}</strong><span>${label}</span></div>`;
}

/**
 * Cuánto territorio y cuántos espacios cubre HOY el catálogo. Se cuenta del registro de espacios
 * —la única fuente que sabe la verdad en cada momento—, no de una cifra escrita a mano que se
 * quedaría vieja en la primera alta. Si el registro no está a mano (sin cobertura y sin caché) se
 * devuelve null y las medallas se pintan sin la nota, que es lo que había antes.
 */
async function techoDelCatalogo() {
  try {
    const registro = await loadRegistry();
    const comunidades = (registro && registro.communities) || [];
    let espacios = 0, completos = 0, provincias = 0;
    comunidades.forEach(c => (c.provinces || []).forEach(p => {
      const lista = p.parks || [];
      if (!lista.length) return;
      provincias++;
      espacios += lista.length;
      completos += lista.filter(e => e.status !== 'basic').length;
    }));
    if (!espacios) return null;
    return { regiones: comunidades.filter(c => (c.provinces || []).some(p => (p.parks || []).length)).length, provincias, espacios, completos };
  } catch (e) {
    return null;
  }
}

// --- Medallas -------------------------------------------------------------------------------------
// La rejilla era una lista de tarjetas planas con `opacity:.6` para lo bloqueado: la RAREZA estaba
// declarada en el catálogo y documentada con su escala, pero no se veía en ninguna parte salvo un
// filete lateral, y solo en las ya conseguidas. Ahora cada logro es una medalla —disco grande, marco
// del color de su rareza y cinta con su nombre— para que un legendario se distinga de un común a un
// metro de distancia, que es la distancia a la que se mira un móvil.
const RAREZA_LABEL = {
  'comun': 'Común',
  'poco-comun': 'Poco común',
  'raro': 'Raro',
  'legendario': 'Legendario'
};

/**
 * Techo del catálogo: hasta dónde se puede llegar HOY con los espacios dados de alta. Sirve para
 * decirle al usuario, en la propia medalla, que no es que se le resista: es que la app todavía no
 * llega ahí. Es la regla 2 del proyecto —hueco documentado antes que dato inventado— aplicada a los
 * logros: sale del registro de espacios, no de una cifra escrita a mano que se quedaría vieja.
 */
function techoDeMetrica(techo, metric) {
  if (!techo) return null;
  if (metric === 'regionsVisited') return { max: techo.regiones, que: techo.regiones === 1 ? 'una comunidad autónoma' : techo.regiones + ' comunidades autónomas' };
  if (metric === 'provincesVisited') return { max: techo.provincias, que: techo.provincias === 1 ? 'una provincia' : techo.provincias + ' provincias' };
  if (metric === 'parksVisited') return { max: techo.espacios, que: techo.espacios + ' espacios' };
  if (metric === 'parksCompleted') return { max: techo.completos, que: techo.completos + ' espacios con catálogo completo' };
  return null;
}

function medallaHtml(ach, entry, totals, techo) {
  const unlocked = !!entry;
  const value = (totals && totals[ach.metric] !== undefined) ? Number(totals[ach.metric]) || 0 : 0;
  const conBarra = !unlocked && ach.threshold > 1;
  const pct = conBarra ? Math.max(0, Math.min(100, Math.round((value / ach.threshold) * 100))) : 0;
  // ¿Está fuera de alcance con el catálogo de hoy? Se dice, y así el usuario no lo lee como que
  // se le da mal: es la app la que todavía no tiene dónde conseguirlo.
  const t = !unlocked ? techoDeMetrica(techo, ach.metric) : null;
  const fueraDeAlcance = t && ach.threshold > t.max;
  return html`<article class="medalla rareza-${ach.rarity}${unlocked ? ' is-ganada' : ' is-pendiente'}${fueraDeAlcance ? ' is-lejos' : ''}">
    <span class="medalla-disco" aria-hidden="true"><span class="medalla-icono">${ach.icon}</span></span>
    <strong class="medalla-titulo">${ach.title}</strong>
    <span class="medalla-rareza">${RAREZA_LABEL[ach.rarity] || ach.rarity}${unlocked ? html` <span aria-hidden="true">✓</span><span class="sr-only">, conseguida</span>` : ''}</span>
    <p class="medalla-desc">${ach.description}</p>
    ${conBarra ? html`<div class="medalla-progreso">
      <span class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" aria-label="Progreso hacia «${ach.title}»"><span class="progress-fill" style="width:${pct}%"></span></span>
      <span class="medalla-cifra">${Math.min(value, ach.threshold)} / ${ach.threshold}</span>
      </div>` : ''}
    ${fueraDeAlcance ? html`<p class="medalla-lejos">Todavía no está a tu alcance: NaturDex solo tiene espacios en ${t.que}. Se podrá conseguir según crezca el catálogo.</p>` : ''}
    </article>`;
}

/**
 * Orden dentro de una categoría: primero lo ganado (que se enseña), y después lo que está MÁS CERCA
 * de caer. Un muro de legendarios inalcanzables por delante desanima; ver que faltan tres puntos de
 * interés para la siguiente medalla, no.
 */
function ordenaPorCercania(items, achievementsMap, totals) {
  const falta = a => {
    const value = (totals && totals[a.metric] !== undefined) ? Number(totals[a.metric]) || 0 : 0;
    return a.threshold > 0 ? Math.min(1, value / a.threshold) : 0; // 1 = a punto de caer
  };
  return items.slice().sort((a, b) => {
    const ga = achievementsMap.has(a.id), gb = achievementsMap.has(b.id);
    if (ga !== gb) return ga ? -1 : 1;
    if (ga) return a.threshold - b.threshold; // las ganadas, en el orden en que se consiguieron
    return falta(b) - falta(a);
  });
}

export async function renderAccountProgress() {
  if (!accountProgressBody) return;
  accountProgressBody.innerHTML = html`<p class="select-hint">Cargando tu progreso…</p>`;
  await refreshAccountProgress();
  const catalog = await loadAchievementsCatalog();
  const totals = state.account.totals || {};
  const achievementsMap = state.account.achievements;

  const totalsGrid = html`<div class="account-totals-grid">
    ${accountStat(totals.speciesSeen, 'especies avistadas')}
    ${accountStat(totals.parksVisited, 'espacios visitados')}
    ${accountStat(totals.parksCompleted, 'espacios completados')}
    ${accountStat(totals.regionsVisited, 'comunidades autónomas')}
    ${accountStat(totals.provincesVisited, 'provincias')}
    ${accountStat(totals.habitatsCompleted, 'hábitats completados')}
    ${accountStat(totals.poisSeen, 'puntos de interés')}
    ${accountStat(totals.gpsSightings, 'registros con GPS')}
    ${accountStat(totals.fieldDays, 'días de campo')}
    ${accountStat(totals.fieldHours, 'horas en el monte')}
    ${accountStat(totals.fieldKilometers, 'km recorridos')}
    ${accountStat(totals.weekStreak, 'semanas seguidas')}
  </div>`;

  // Regla de la casa, dicha de frente: todo lo de arriba se cuenta estando allí.
  const rulesHtml = html`<p class="account-rule">📍 Todo lo que ves aquí se gana en el campo: solo cuentan las marcas hechas <strong>dentro de un espacio protegido</strong> mientras tu ubicación confirma que estás allí.${totals.unverifiedMarks ? html` Tienes <strong>${totals.unverifiedMarks}</strong> ${totals.unverifiedMarks === 1 ? 'marca sin verificar' : 'marcas sin verificar'} en tu cuaderno: siguen ahí, pero no suman.` : ''}</p>`;

  const regionsHtml = (totals.regionsList && totals.regionsList.length)
    ? html`<div class="account-section"><h3>Comunidades autónomas exploradas</h3><div class="account-chips">${totals.regionsList.map(r => html`<span class="badge">${r}</span>`)}</div></div>`
    : '';

  const visitsHtml = renderVisitHistory();

  // Lo que ya no desbloquea logros pero se sigue registrando: se enseña aparte y sin medallas, para
  // que quede claro que es actividad de la app y no mérito de campo.
  const appStatsHtml = html`<div class="account-section"><h3>📖 Actividad en la app</h3>
    <div class="account-totals-grid small">
      ${accountStat(totals.glossaryViewed, 'términos del glosario consultados')}
      ${accountStat(totals.invasiveSeen, 'invasoras identificadas')}
    </div>
    <p class="account-note">Aprender también cuenta, pero no da logros: se puede hacer desde casa.</p></div>`;

  const techo = await techoDelCatalogo();
  const sections = (catalog.categories || []).map(cat => {
    const items = (catalog.achievements || []).filter(a => a.category === cat.key);
    if (!items.length) return '';
    const unlockedCount = items.filter(a => achievementsMap.has(a.id)).length;
    const cards = ordenaPorCercania(items, achievementsMap, totals)
      .map(a => medallaHtml(a, achievementsMap.get(a.id), totals, techo));
    return html`<div class="account-section"><h3>${cat.icon} ${cat.label} <span class="account-section-count">· ${unlockedCount} de ${items.length}</span></h3><div class="medallero">${cards}</div></div>`;
  });

  accountProgressBody.innerHTML = html`${totalsGrid}${rulesHtml}${regionsHtml}${visitsHtml}${sections}${appStatsHtml}`;
}

// --- Historial de salidas verificadas ------------------------------------------------------------
// Si el progreso depende de haber estado allí, el usuario tiene derecho a ver la lista exacta de lo
// que la app le ha contado como visita, y a que le diga por qué una no le ha valido.
const VISIT_FLAG_LABELS = {
  salto_imposible: 'posiciones incoherentes entre sí',
  gps_congelado: 'la ubicación no se movió ni un metro'
};

function renderVisitHistory() {
  const visits = (state.account.visits || []).slice(0, 12);
  if (!visits.length) {
    return html`<div class="account-section"><h3>🥾 Tus salidas</h3>
      <p class="account-note">Todavía no hay ninguna visita verificada. Entra en un espacio protegido con la ubicación activada y camina unos minutos: la app registrará tu presencia y a partir de ahí todo lo que marques contará.</p></div>`;
  }
  const rows = visits.map(v => {
    const date = new Date(v.startedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    const minutes = Math.round((v.seconds || 0) / 60);
    const km = (v.distanceM || 0) / 1000;
    const detail = [
      minutes >= 60 ? Math.floor(minutes / 60) + ' h ' + (minutes % 60) + ' min' : minutes + ' min',
      km >= 0.1 ? km.toLocaleString('es-ES', { maximumFractionDigits: 1 }) + ' km' : null
    ].filter(Boolean).join(' · ');
    const state_ = v.suspicious
      ? html`<span class="visit-state is-flagged" title="${(v.flags || []).map(f => VISIT_FLAG_LABELS[f] || f).join(', ')}">No verificada</span>`
      : (v.verified ? html`<span class="visit-state is-ok">Verificada ✓</span>` : html`<span class="visit-state">Demasiado corta</span>`);
    return html`<li class="progress-row"><span class="progress-row-label">${v.parkName}<br><small>${date} · ${detail}</small></span><span class="progress-row-value">${state_}</span></li>`;
  });
  return html`<div class="account-section"><h3>🥾 Tus salidas</h3><ul class="progress-list">${rows}</ul>
    <p class="account-note">Una salida se verifica con presencia sostenida dentro del límite oficial del espacio (varias posiciones repartidas en unos minutos).</p></div>`;
}
