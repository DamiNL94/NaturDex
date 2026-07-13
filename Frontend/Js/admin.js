// ================================================================================================
// admin.js — panel de administración del contenido ambiental (Frontend/admin.html).
// ------------------------------------------------------------------------------------------------
// Página independiente de la app (no entra en el service worker: siempre online). Habla con
// Backend/Api/admin.php, que exige sesión de administrador; el login reutiliza auth.php. Los
// formularios se generan desde definiciones declarativas de campos (mismos nombres de columna que
// la BD), así añadir un campo nuevo es una línea aquí y otra en la lista blanca de admin.php.
// ================================================================================================

import { html, raw } from './util.js';

const API = '../Backend/Api';

// --- Definición declarativa de los formularios ----------------------------------------------------
const KINGDOMS = ['fauna', 'flora', 'fungi', 'other'];

const FIELDS = {
  species: [
    { k: 'common_name', label: 'Nombre común', req: true },
    { k: 'scientific_name', label: 'Nombre científico', req: true },
    { k: 'kingdom', label: 'Reino', type: 'select', options: KINGDOMS },
    { k: 'family', label: 'Grupo (p. ej. Aves, Matorral)' },
    { k: 'primary_habitat', label: 'Hábitat (texto de la ficha)' },
    { k: 'conservation_status', label: 'Estado de conservación' },
    { k: 'seasonality', label: 'Temporada' },
    { k: 'rarity_score', label: 'Rareza (1-5)', type: 'number', min: 1, max: 5 },
    { k: 'image_url', label: 'Foto (URL o ruta Img/…)' },
    { k: 'latitude', label: 'Latitud', type: 'number' },
    { k: 'longitude', label: 'Longitud', type: 'number' },
    { k: 'is_featured', label: 'Especie prioritaria (destacada)', type: 'checkbox' },
    { k: 'description', label: 'Descripción', type: 'textarea', wide: true },
    { k: 'identification_tips', label: 'Consejos de identificación', type: 'textarea', wide: true, hint: 'Separa cada consejo con punto y coma (;)' },
    { k: 'taxon_phylum', label: 'Filo/División' },
    { k: 'taxon_class', label: 'Clase' },
    { k: 'taxon_order', label: 'Orden' },
    { k: 'taxon_family', label: 'Familia (taxonómica)' },
    { k: 'taxon_genus', label: 'Género' },
    { k: 'iucn_global', label: 'UICN (global)' },
    { k: 'spain_status', label: 'Estado en España', wide: true },
    { k: 'murcia_status', label: 'Estado en la Región de Murcia', wide: true },
    { k: 'source', label: 'Fuente', wide: true },
    { k: 'review_note', label: 'Nota "pendiente de revisión" (vacío = ficha validada)', type: 'textarea', wide: true }
  ],
  habitats: [
    { k: 'name', label: 'Nombre', req: true },
    { k: 'code', label: 'Código Natura 2000 (p. ej. 1240)' },
    { k: 'slug', label: 'Slug (enlaza geometría y foto)', hint: 'Debe coincidir con el habitats.geojson y con Img/habitats/<slug>.jpg' },
    { k: 'habitat_type', label: 'Tipo (Marino / Litoral / Terrestre)' },
    { k: 'color', label: 'Color en el mapa (p. ej. #2f6f4e)' },
    { k: 'latitude', label: 'Latitud (centro aprox.)', type: 'number' },
    { k: 'longitude', label: 'Longitud (centro aprox.)', type: 'number' },
    { k: 'is_priority', label: 'Hábitat prioritario UE', type: 'checkbox' },
    { k: 'description', label: 'Descripción', type: 'textarea', wide: true },
    { k: 'review_note', label: 'Nota "pendiente de revisión" (vacío = validado)', type: 'textarea', wide: true }
  ],
  pois: [
    { k: 'name', label: 'Nombre', req: true },
    { k: 'slug', label: 'Slug (identificador)', req: true },
    { k: 'type', label: 'Tipo (Cultural, Paisajístico, Geológico…)' },
    { k: 'latitude', label: 'Latitud', type: 'number' },
    { k: 'longitude', label: 'Longitud', type: 'number' },
    { k: 'image_url', label: 'Foto (URL o ruta Img/…)' },
    { k: 'source', label: 'Fuente' },
    { k: 'is_approx', label: 'Ubicación aproximada (aviso en el popup)', type: 'checkbox' },
    { k: 'description', label: 'Descripción', type: 'textarea', wide: true }
  ]
};

// --- Estado ----------------------------------------------------------------------------------------
const st = {
  parks: [],
  park: null,
  tab: 'species',
  items: { species: [], habitats: [], pois: [] },
  selectedId: null,
  query: ''
};

const $ = sel => document.querySelector(sel);

// --- API -------------------------------------------------------------------------------------------
async function api(path, body) {
  const opts = body
    ? { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }, body: JSON.stringify(body) }
    : {};
  const res = await fetch(API + path, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) { const e = new Error(data.error || ('HTTP ' + res.status)); e.status = res.status; throw e; }
  return data;
}

function toast(msg, isError = false) {
  const el = $('#adminToast');
  el.textContent = msg;
  el.classList.toggle('error', isError);
  el.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { el.hidden = true; }, isError ? 6000 : 3000);
}

// --- Arranque y sesión -------------------------------------------------------------------------------
async function boot() {
  try {
    const data = await api('/admin.php?action=overview');
    showPanel(data);
  } catch (e) {
    $('#admin-panel').hidden = true;
    $('#admin-login').hidden = false;
    if (e.status === 403) showLoginError(e.message);
  }
}

function showLoginError(msg) {
  const el = $('#adminLoginError');
  el.textContent = msg;
  el.hidden = false;
}

$('#adminLoginForm').addEventListener('submit', async event => {
  event.preventDefault();
  $('#adminLoginError').hidden = true;
  try {
    await api('/auth.php?action=login', { email: $('#adminEmail').value.trim(), password: $('#adminPassword').value });
    await boot();
  } catch (e) {
    showLoginError(e.message || 'No se pudo iniciar sesión.');
  }
});

$('#adminLogout').addEventListener('click', async () => {
  try { await api('/auth.php?action=logout', {}); } catch (e) { /* da igual: recargamos */ }
  location.reload();
});

async function showPanel(overview) {
  st.parks = overview.parks;
  $('#adminUser').textContent = overview.user.name || overview.user.email;
  $('#admin-login').hidden = true;
  $('#admin-panel').hidden = false;
  const select = $('#adminParkSelect');
  select.innerHTML = String(html`${st.parks.map(p => html`<option value="${p.slug}">${p.name}</option>`)}`);
  st.park = st.parks[0] ? st.parks[0].slug : null;
  await loadPark();
}

$('#adminParkSelect').addEventListener('change', async event => {
  st.park = event.target.value;
  await loadPark();
});

async function loadPark() {
  const park = st.parks.find(p => p.slug === st.park);
  $('#adminParkName').textContent = park ? park.name : '—';
  st.selectedId = null;
  await Promise.all(['species', 'habitats', 'pois'].map(loadList));
  renderList();
  renderForm(null);
}

async function loadList(resource) {
  const data = await api(`/admin.php?action=list&resource=${resource}&park=${encodeURIComponent(st.park)}`);
  st.items[resource] = data.items;
}

// --- Pestañas, lista y búsqueda -----------------------------------------------------------------------
document.querySelectorAll('.admin-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    st.tab = btn.dataset.tab;
    st.selectedId = null;
    st.query = '';
    $('#adminSearch').value = '';
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.toggle('active', t === btn));
    renderList();
    renderForm(null);
  });
});

$('#adminSearch').addEventListener('input', event => {
  st.query = event.target.value.toLocaleLowerCase('es-ES');
  renderList();
});

function itemTitle(item) {
  if (st.tab === 'species') return item.common_name || '(sin nombre)';
  return item.name || '(sin nombre)';
}

function renderList() {
  const items = st.items[st.tab].filter(item => {
    if (!st.query) return true;
    return JSON.stringify(item).toLocaleLowerCase('es-ES').includes(st.query);
  });
  $('#adminList').innerHTML = String(html`${items.map(item => {
    const active = item.id === st.selectedId;
    if (st.tab === 'species') {
      return html`<button type="button" class="admin-item${active ? ' active' : ''}" data-id="${item.id}"><span>${item.common_name}<span class="admin-item-sub">${item.scientific_name}</span></span><span class="badge ${item.kingdom}">${item.kingdom}</span></button>`;
    }
    if (st.tab === 'habitats') {
      return html`<button type="button" class="admin-item${active ? ' active' : ''}" data-id="${item.id}"><span>${item.name}</span><span class="badge habitat-code">${item.code || '—'}</span></button>`;
    }
    return html`<button type="button" class="admin-item${active ? ' active' : ''}" data-id="${item.id}"><span>${item.name}</span><span class="badge">${item.type || '—'}</span></button>`;
  })}`) || '<p class="admin-empty">Sin resultados.</p>';
}

$('#adminList').addEventListener('click', event => {
  const btn = event.target.closest('.admin-item');
  if (!btn) return;
  st.selectedId = Number(btn.dataset.id);
  renderList();
  renderForm(st.items[st.tab].find(i => Number(i.id) === st.selectedId) || null);
});

$('#adminNewBtn').addEventListener('click', () => {
  st.selectedId = null;
  renderList();
  renderForm({}); // objeto vacío = formulario de alta
});

// --- Formulario ---------------------------------------------------------------------------------------
function fieldControl(field, value) {
  const v = value == null ? '' : value;
  if (field.type === 'textarea') return html`<textarea data-k="${field.k}">${v}</textarea>`;
  if (field.type === 'select') return html`<select data-k="${field.k}">${field.options.map(o => html`<option value="${o}" ${String(v) === o ? raw('selected') : ''}>${o}</option>`)}</select>`;
  if (field.type === 'checkbox') return html`<input type="checkbox" data-k="${field.k}" ${Number(v) ? raw('checked') : ''}>`;
  if (field.type === 'number') return html`<input type="number" step="any" ${field.min != null ? raw(`min="${field.min}" max="${field.max}"`) : ''} data-k="${field.k}" value="${v}">`;
  return html`<input type="text" data-k="${field.k}" value="${v}">`;
}

function renderForm(item) {
  const form = $('#adminForm');
  if (!item) {
    form.hidden = true;
    $('#adminEmpty').hidden = false;
    return;
  }
  form.hidden = false;
  $('#adminEmpty').hidden = true;
  form.dataset.id = item.id || '';

  const rows = FIELDS[st.tab].map(f => {
    if (f.type === 'checkbox') {
      return html`<label class="admin-field admin-check">${fieldControl(f, item[f.k])}${f.label}</label>`;
    }
    return html`<label class="admin-field${f.wide ? ' wide' : ''}">${f.label}${f.req ? ' *' : ''}${fieldControl(f, item[f.k])}${f.hint ? html`<span class="admin-hint">${f.hint}</span>` : ''}</label>`;
  });

  // Relación especie ↔ hábitats: casillas con todos los hábitats del parque.
  let rel = '';
  if (st.tab === 'species') {
    const selected = new Set(item.habitat_ids || []);
    rel = html`<div class="admin-rel"><p class="admin-rel-title">Hábitats donde vive</p><div class="admin-rel-grid">${st.items.habitats.map(h =>
      html`<label><input type="checkbox" data-rel-habitat="${h.id}" ${selected.has(Number(h.id)) ? raw('checked') : ''}>${h.name}</label>`)}</div></div>`;
  }

  $('#adminFields').innerHTML = String(html`${rows}${rel}`);
  $('#adminDeleteBtn').hidden = !item.id;
}

function collectForm() {
  const item = { id: Number($('#adminForm').dataset.id) || 0 };
  document.querySelectorAll('#adminFields [data-k]').forEach(el => {
    item[el.dataset.k] = el.type === 'checkbox' ? (el.checked ? 1 : 0) : el.value;
  });
  if (st.tab === 'species') {
    item.habitat_ids = [...document.querySelectorAll('[data-rel-habitat]:checked')].map(el => Number(el.dataset.relHabitat));
  }
  return item;
}

$('#adminForm').addEventListener('submit', async event => {
  event.preventDefault();
  const item = collectForm();
  try {
    const res = await api(`/admin.php?action=save&resource=${st.tab}`, { park: st.park, item });
    toast('Guardado ✓');
    await loadList(st.tab);
    if (st.tab === 'habitats') await loadList('species'); // las casillas de relación pueden cambiar
    st.selectedId = res.id;
    renderList();
    renderForm(st.items[st.tab].find(i => Number(i.id) === Number(res.id)) || null);
  } catch (e) {
    toast(e.message || 'No se pudo guardar.', true);
  }
});

$('#adminDeleteBtn').addEventListener('click', async () => {
  const id = Number($('#adminForm').dataset.id);
  if (!id) return;
  const name = itemTitle(st.items[st.tab].find(i => Number(i.id) === id) || {});
  if (!confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer (las relaciones se limpian en cascada).`)) return;
  try {
    await api(`/admin.php?action=delete&resource=${st.tab}`, { id });
    toast('Eliminado ✓');
    st.selectedId = null;
    await loadList(st.tab);
    renderList();
    renderForm(null);
  } catch (e) {
    toast(e.message || 'No se pudo eliminar.', true);
  }
});

// --- Publicar cambios al park.json offline --------------------------------------------------------------
$('#adminExportBtn').addEventListener('click', async () => {
  const btn = $('#adminExportBtn');
  btn.disabled = true;
  try {
    const res = await api('/admin.php?action=export', { park: st.park });
    toast(`Publicado: ${res.counts.habitats} hábitats, ${res.counts.species} especies, ${res.counts.pointsOfInterest} POIs → ${res.dataPath}`);
  } catch (e) {
    toast(e.message || 'No se pudo publicar.', true);
  } finally {
    btn.disabled = false;
  }
});

boot();
