// ================================================================================================
// profile.js — pantalla "Perfil y ajustes" (screen-profile).
// ------------------------------------------------------------------------------------------------
// Módulo ES importado por app.js. Es el único sitio de la app donde el usuario administra SU CUENTA
// y SU EXPERIENCIA, en vez de tener los controles desperdigados por las cabeceras:
//
//   1. Cuenta      → nombre visible, email, contraseña, cerrar sesión, baja (Backend/Api/account.php).
//   2. Progreso    → resumen del progreso estatal + acceso a la pantalla completa (screen-account).
//   3. Ajustes     → preferencias de tema, accesibilidad, mapa, GPS y avisos (prefs.js).
//   4. Datos       → parques guardados sin conexión, espacio ocupado, exportación y borrado local.
//   5. Ayuda       → tutorial, versión de la app y fuentes.
//
// Reparto de responsabilidades, igual que en el resto del frontend:
//   · prefs.js (global NaturDexPrefs) guarda y APLICA las preferencias; aquí solo se pintan.
//   · auth.js (global naturdexAuth) es el dueño de la sesión; aquí se le pide el usuario y se le
//     devuelve actualizado tras un cambio de nombre/email, para que las etiquetas de las cabeceras
//     y el localStorage de sesión no se queden desfasados.
//   · achievements.js aporta los totales del progreso de cuenta ya calculados.
//
// El modo invitado (sin `id`) funciona entero salvo lo que necesita servidor: se le ofrece crear
// cuenta, y sus ajustes y datos locales se gestionan igual bajo el ámbito 'anon'.
// ================================================================================================

import { html, raw, icon } from './util.js';
import { API_BASE, state } from './state.js';
import { apiFetch, apiPostJson } from './api.js';
import { profileBody } from './dom.js';
import { loadAchievementsCatalog, refreshAccountProgress } from './achievements.js';

// Las acciones de cuenta (cambiar email, contraseña, exportar, darse de baja) hacen más trabajo en
// el servidor que una lectura: se les da algo más de margen.
const ACCOUNT_TIMEOUT_MS = 5000;

function auth() { return window.naturdexAuth || null; }
function currentUser() { const a = auth(); return a ? a.getUser() : null; }
function isGuest() { const u = currentUser(); return !u || u.id == null; }
function prefs() { return window.NaturDexPrefs; }

// Datos que solo tiene el servidor (alta, cifras de la cuenta) y preferencias espejadas. Se cargan
// al abrir la pantalla; sin red o sin sesión se queda a null y la pantalla se pinta igual.
let serverProfile = null;

// --- Utilidades de presentación -----------------------------------------------------------------
function formatDate(value) {
  if (!value) return null;
  const d = new Date(String(value).replace(' ', 'T'));
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatBytes(bytes) {
  if (typeof bytes !== 'number' || bytes <= 0) return null;
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1).replace('.', ',') + ' MB';
}

function initials(name) {
  const parts = String(name || '?').trim().split(/\s+/).slice(0, 2);
  return parts.map(p => p.charAt(0).toUpperCase()).join('') || '?';
}

/** Aviso dentro de un bloque (`data-msg="clave"`), en verde si va bien y en rojo si falla. */
function setMessage(key, text, isError) {
  const el = profileBody.querySelector('[data-msg="' + key + '"]');
  if (!el) return;
  el.textContent = text || '';
  el.hidden = !text;
  el.classList.toggle('error', !!isError);
  el.setAttribute('role', isError ? 'alert' : 'status');
}

// --- Bloques de interfaz reutilizables ----------------------------------------------------------
function section(id, iconName, title, body, hint) {
  return html`<section class="profile-section" id="${id}">
    <h3><span class="profile-section-icon" aria-hidden="true">${icon(iconName, 18)}</span>${title}</h3>
    ${hint ? html`<p class="profile-hint">${hint}</p>` : ''}
    ${body}
    </section>`;
}

/** Grupo de opciones excluyentes (tema, tamaño de texto, mapa base) como botones con estado. */
function choiceRow(prefName, label, options, hint) {
  const value = prefs().get(prefName);
  return html`<div class="profile-row">
    <div class="profile-row-text"><strong id="lbl-${prefName}">${label}</strong>${hint ? html`<span>${hint}</span>` : ''}</div>
    <div class="profile-choices" role="group" aria-labelledby="lbl-${prefName}">
    ${options.map(o => html`<button type="button" class="profile-choice${o.value === value ? ' active' : ''}" data-pref-choice="${prefName}" data-value="${o.value}" aria-pressed="${o.value === value ? 'true' : 'false'}">${o.label}</button>`)}
    </div>
    </div>`;
}

/** Interruptor de una preferencia booleana (checkbox real: accesible con teclado y lector). */
function toggleRow(prefName, label, hint) {
  const on = prefs().get(prefName) === true;
  return html`<div class="profile-row">
    <div class="profile-row-text"><strong>${label}</strong>${hint ? html`<span>${hint}</span>` : ''}</div>
    <label class="profile-switch"><input type="checkbox" data-pref-toggle="${prefName}"${on ? raw(' checked') : ''}><span class="profile-switch-track" aria-hidden="true"></span><span class="sr-only">${label}</span></label>
    </div>`;
}

// --- 1. Cabecera de identidad -------------------------------------------------------------------
function identityCard() {
  const user = currentUser();
  const guest = isGuest();
  const name = guest ? (user && user.name) || 'Invitado' : (user.name || user.email);
  const since = serverProfile && formatDate(serverProfile.user.createdAt);
  return html`<div class="profile-identity">
    <span class="profile-avatar" aria-hidden="true">${initials(name)}</span>
    <div class="profile-identity-body">
    <h2 class="profile-name">${name}</h2>
    <p class="profile-email">${guest ? 'Estás explorando sin cuenta' : user.email}</p>
    <div class="profile-chips">
    ${guest ? html`<span class="badge review">Modo invitado</span>` : ''}
    ${user && user.isAdmin ? html`<span class="badge alert">Administrador</span>` : ''}
    ${since ? html`<span class="badge">Explorando desde ${since}</span>` : ''}
    </div>
    </div>
    </div>`;
}

// --- 2. Resumen del progreso de cuenta ----------------------------------------------------------
async function progressSummary() {
  const totals = state.account.totals || {};
  const catalog = await loadAchievementsCatalog();
  const totalAchievements = (catalog.achievements || []).length;
  const unlocked = state.account.achievements.size;
  const stat = (value, label) => html`<div class="account-stat"><strong>${value ?? 0}</strong><span>${label}</span></div>`;
  // Días de campo = días con presencia verificada, no días de haber abierto la app.
  const fieldDays = serverProfile ? serverProfile.stats.fieldDays : totals.fieldDays;
  return html`<div class="account-totals-grid profile-totals">
    ${stat(totals.speciesSeen, 'especies avistadas')}
    ${stat(totals.parksVisited, 'espacios visitados')}
    ${stat(unlocked + ' / ' + totalAchievements, 'logros')}
    ${stat(fieldDays, 'días de campo')}
    </div>
    <button type="button" class="btn-secondary" data-action="open-account">${icon('trophy', 16)} Ver tu progreso estatal completo</button>`;
}

// --- 3. Cuenta: nombre, email, contraseña -------------------------------------------------------
function accountForms() {
  const user = currentUser();
  if (isGuest()) {
    return html`<p class="profile-warning">${icon('alert', 16)} Tu progreso se guarda <strong>solo en este dispositivo</strong>. Si borras los datos del navegador o cambias de móvil, lo pierdes. Al crear una cuenta se conserva en el servidor y lo que ya has descubierto como invitado se traslada a ella automáticamente.</p>
      <form class="profile-form" data-form="guest-name">
      <label class="auth-field">Cómo quieres que te llamemos
      <input type="text" name="name" maxlength="120" autocomplete="nickname" value="${(user && user.name) || 'Invitado'}">
      </label>
      <p class="profile-msg" data-msg="guest-name" hidden></p>
      <button type="submit" class="btn-secondary">Guardar nombre en este dispositivo</button>
      </form>
      <button type="button" class="btn-primary" data-action="create-account">Crear una cuenta</button>`;
  }

  return html`<form class="profile-form" data-form="profile">
    <label class="auth-field">Nombre visible
    <input type="text" name="name" maxlength="120" autocomplete="name" required value="${user.name || ''}">
    </label>
    <label class="auth-field">Email
    <input type="email" name="email" autocomplete="email" required value="${user.email || ''}">
    </label>
    <label class="auth-field" data-email-password hidden>Contraseña actual (necesaria para cambiar el email)
    <input type="password" name="currentPassword" autocomplete="current-password" placeholder="Tu contraseña">
    </label>
    <p class="profile-msg" data-msg="profile" hidden></p>
    <button type="submit" class="btn-primary">Guardar cambios</button>
    </form>

    <h4 class="profile-subtitle">${icon('key', 15)} Cambiar la contraseña</h4>
    <form class="profile-form" data-form="password">
    <label class="auth-field">Contraseña actual
    <input type="password" name="currentPassword" autocomplete="current-password" required>
    </label>
    <label class="auth-field">Contraseña nueva
    <input type="password" name="newPassword" autocomplete="new-password" minlength="6" required placeholder="Mínimo 6 caracteres">
    </label>
    <label class="auth-field">Repite la contraseña nueva
    <input type="password" name="repeatPassword" autocomplete="new-password" minlength="6" required>
    </label>
    <p class="profile-msg" data-msg="password" hidden></p>
    <button type="submit" class="btn-primary">Cambiar la contraseña</button>
    </form>`;
}

// --- 4. Ajustes ---------------------------------------------------------------------------------
function settingsBlock() {
  return html`${choiceRow('theme', 'Tema', [
      { value: 'auto', label: 'Automático' },
      { value: 'claro', label: 'Claro' },
      { value: 'oscuro', label: 'Oscuro' }
    ], 'En automático sigue al ajuste de tu móvil u ordenador.')}
    ${choiceRow('textSize', 'Tamaño del texto', [
      { value: 'normal', label: 'Normal' },
      { value: 'grande', label: 'Grande' },
      { value: 'enorme', label: 'Enorme' }
    ], 'Agranda toda la interfaz, no solo las descripciones.')}
    ${toggleRow('reduceMotion', 'Menos movimiento', 'Quita animaciones y confeti. Útil si te marean o para ahorrar batería.')}
    ${choiceRow('mapBase', 'Mapa base por defecto', [
      { value: 'osm', label: 'Mapa' },
      { value: 'pnoa', label: 'Satélite' }
    ], 'Con cuál se abre el mapa del parque. Puedes cambiarlo en cualquier momento desde «Capas».')}
    ${toggleRow('followByDefault', 'Seguirme al explorar', 'El modo explorador arranca ya con el mapa moviéndose contigo.')}
    ${toggleRow('highAccuracyGps', 'GPS de alta precisión', 'Más exactitud para saber en qué hábitat estás; gasta más batería.')}
    ${toggleRow('celebrations', 'Avisos de logro', 'El cartel animado al desbloquear un logro. Desactivado, los logros se siguen ganando en silencio.')}
    ${toggleRow('achievementSound', 'Sonido al desbloquear', 'Un tono corto cuando consigues un logro.')}
    <p class="profile-msg" data-msg="prefs" hidden></p>
    <button type="button" class="btn-secondary" data-action="reset-prefs">${icon('refresh', 15)} Restablecer los ajustes</button>`;
}

// --- 5. Datos y almacenamiento ------------------------------------------------------------------
async function storageBlock() {
  const saved = NaturDexOffline.savedParks();
  let usage = null;
  try {
    if (navigator.storage && navigator.storage.estimate) {
      const est = await navigator.storage.estimate();
      usage = formatBytes(est.usage);
    }
  } catch (e) { /* sin API de cuota: se omite la cifra */ }

  const parkList = saved.length
    ? html`<ul class="profile-list">${saved.map(slug => html`<li><span>${slug}</span><button type="button" class="link-btn danger" data-forget-park="${slug}">Eliminar descarga</button></li>`)}</ul>`
    : html`<p class="profile-hint">Todavía no has guardado ningún parque para usarlo sin cobertura. Puedes hacerlo desde el propio parque, con «Guardar sin conexión».</p>`;

  return html`<h4 class="profile-subtitle">Parques guardados sin conexión</h4>
    ${parkList}
    ${usage ? html`<p class="profile-hint">Este navegador tiene ocupados unos <strong>${usage}</strong> con datos de NaturDex (fichas, mapas, fotos y audioguías descargadas).</p>` : ''}
    <h4 class="profile-subtitle">Compartir con la ciencia</h4>
    <p class="profile-hint">Cuando marcas una especie, NaturDex guarda dónde y cuándo la viste. Si lo
    autorizas, esos avistamientos pueden cederse a bancos de datos de biodiversidad (como GBIF) para
    estudiar cómo cambia la naturaleza. Se cederían con el nombre que uses en la app. <strong>La
    posición exacta de las especies amenazadas nunca se publica</strong>: se redondea a varios
    kilómetros para que nadie pueda ir a buscarlas. Puedes cambiar de opinión cuando quieras.</p>
    ${toggleRow('shareOccurrences', 'Compartir mis avistamientos con fines científicos', 'Está desactivado salvo que lo actives tú. Sin activarlo, tus avistamientos no salen de tu cuenta.')}
    <h4 class="profile-subtitle">Tus datos</h4>
    <div class="profile-actions">
    <button type="button" class="btn-secondary" data-action="export-local">${icon('download', 15)} Descargar lo guardado en este dispositivo</button>
    ${!isGuest() ? html`<button type="button" class="btn-secondary" data-action="export-server">${icon('database', 15)} Descargar todos mis datos del servidor</button>` : ''}
    </div>
    <p class="profile-msg" data-msg="storage" hidden></p>
    <h4 class="profile-subtitle">Borrar los datos de este dispositivo</h4>
    <p class="profile-hint">Elimina el progreso local, los parques descargados y los ajustes guardados en este navegador. ${isGuest() ? 'Como estás en modo invitado, tu progreso <strong>no se puede recuperar</strong> después.' : 'Tu progreso seguirá en el servidor y volverá a bajarse al entrar de nuevo.'}</p>
    <button type="button" class="btn-danger" data-action="clear-local">${icon('trash', 15)} Borrar los datos locales</button>`;
}

// --- 6. Ayuda y acerca de -----------------------------------------------------------------------
function helpBlock() {
  return html`<div class="profile-actions">
    <button type="button" class="btn-secondary" data-action="tutorial">Ver el tutorial otra vez</button>
    <button type="button" class="btn-secondary" data-action="reset-tutorial">Que vuelva a salir solo</button>
    <button type="button" class="btn-secondary" data-action="check-update">${icon('refresh', 15)} Buscar actualizaciones</button>
    </div>
    <p class="profile-msg" data-msg="help" hidden></p>
    <p class="profile-hint">NaturDex es un <strong>prototipo</strong>. Los datos ambientales proceden de fuentes oficiales (IEPNB/EIDOS, GBIF, Atlas de Hábitats del MITECO, Red Natura 2000 e IMIDA) y las fichas citan su fuente. Las especies marcadas «a revisar» están pendientes de contraste.</p>`;
}

// --- 7. Zona de riesgo: baja de la cuenta -------------------------------------------------------
function dangerBlock() {
  if (isGuest()) return '';
  return html`<p class="profile-hint">Se borra la cuenta y <strong>todo</strong> lo asociado a ella: progreso de todos los parques, logros, avistamientos y días de campo. No se puede deshacer. Si solo quieres una copia, descarga antes tus datos.</p>
    <form class="profile-form" data-form="delete">
    <label class="auth-field">Contraseña
    <input type="password" name="password" autocomplete="current-password" required>
    </label>
    <label class="auth-field">Escribe BORRAR para confirmar
    <input type="text" name="confirm" autocomplete="off" placeholder="BORRAR" required>
    </label>
    <p class="profile-msg" data-msg="delete" hidden></p>
    <button type="submit" class="btn-danger">Borrar mi cuenta definitivamente</button>
    </form>`;
}

// --- Pintado completo ---------------------------------------------------------------------------
// UN SOLO PINTADO, y no es un detalle de estilo.
//
// Antes se pintaba dos veces: `showProfile` llamaba a `renderProfile` (que abría con «Cargando tu
// perfil…» y luego pintaba la pantalla entera), después esperaba a `loadServerProfile` y, si había
// respuesta, volvía a llamar a `renderProfile` — que volvía a poner «Cargando tu perfil…». Es decir:
// la pantalla se montaba, se desmontaba y se volvía a montar, tirando el scroll y el foco por el
// camino, y todo para añadir la fecha de alta y un par de cifras. El comentario del código decía
// «se repinta sin que se note el salto». Se notaba.
//
// Ahora el perfil del servidor va EN PARALELO con el resto y se pinta una sola vez, con lo que haya
// llegado. El peor caso está acotado por su propio ACCOUNT_TIMEOUT_MS, y como invitado o sin
// cobertura ni siquiera se intenta.
//
// `conServidor` distingue las dos llamadas: al ABRIR la pantalla hay que ir a buscarlo; en los
// repintados de dentro (restablecer ajustes, eliminar una descarga) ya está en memoria y volver a
// pedirlo solo añadiría una espera de red a un botón que debería responder al instante.

// Esqueleto de la MISMA forma que el contenido final, para que la llegada de los datos no haga
// saltar la maquetación. Solo se pinta cuando no hay nada que enseñar todavía: en un repintado se
// deja el contenido anterior a la vista hasta que el nuevo está listo, o entrar, salir y volver a
// entrar parpadearía igual que antes.
function esqueleto() {
  const bloque = alto => html`<div class="profile-skeleton-block" style="height:${alto}px"></div>`;
  return html`<div class="profile-skeleton" aria-hidden="true">
    ${bloque(96)}${bloque(200)}${bloque(300)}${bloque(420)}${bloque(260)}${bloque(180)}
    </div>
    <p class="sr-only" role="status">Cargando tu perfil…</p>`;
}

export async function renderProfile({ conServidor = false } = {}) {
  if (!profileBody) return;
  if (!profileBody.childElementCount) profileBody.innerHTML = esqueleto();

  // El progreso de cuenta ya sabe funcionar sin red (predice en local); el perfil del servidor es
  // el único dato que puede faltar, y su ausencia solo quita la fecha de alta y un par de cifras.
  // Los tres van a la vez: ninguno necesita el resultado de los otros.
  const [, , storage] = await Promise.all([
    conServidor ? loadServerProfile() : Promise.resolve(),
    refreshAccountProgress(),
    storageBlock()
  ]);
  const summary = await progressSummary(); // necesita el agregado que acaba de refrescarse

  // El contenedor con scroll es la pantalla entera (.screen-profile). Al vaciar el cuerpo su altura
  // se desploma y el navegador recorta el scroll a 0; se guarda y se repone alrededor del cambio.
  const contenedor = profileBody.closest('.screen-profile');
  const scroll = contenedor ? contenedor.scrollTop : 0;

  profileBody.innerHTML = html`${identityCard()}
    ${section('profile-progress', 'award', 'Tu progreso', summary)}
    ${section('profile-account', 'user', 'Cuenta', accountForms(),
      isGuest() ? null : 'Tu nombre es lo que se ve en la app. El email es con lo que entras.')}
    ${section('profile-settings', 'sliders', 'Ajustes', settingsBlock())}
    ${section('profile-data', 'database', 'Datos y almacenamiento', storage)}
    ${section('profile-help', 'info', 'Ayuda y acerca de', helpBlock())}
    ${isGuest() ? '' : html`<button type="button" class="btn-secondary profile-logout" data-action="logout">${icon('power', 15)} Cerrar sesión</button>`}
    ${isGuest() ? '' : section('profile-danger', 'alert', 'Borrar la cuenta', dangerBlock())}`;

  if (contenedor && scroll) contenedor.scrollTop = scroll;
}

/** Carga el perfil del servidor y adopta las preferencias espejadas. No bloquea el pintado. */
async function loadServerProfile() {
  serverProfile = null;
  if (isGuest() || !NaturDexOffline.isOnline()) return;
  try {
    const res = await apiFetch('/account.php?action=profile', { timeoutMs: ACCOUNT_TIMEOUT_MS });
    if (!res.ok) return;
    const data = await res.json();
    serverProfile = data;
    if (prefs() && data.prefs) prefs().adoptServerPrefs(data.prefs);
    // El servidor manda sobre el objeto de sesión cacheado (p. ej. si el nombre se cambió desde
    // otro dispositivo), y de paso trae `createdAt`, que auth.php no incluía.
    if (auth() && data.user) auth().setUser(Object.assign({}, currentUser(), data.user));
  } catch (e) { /* sin red: la pantalla funciona igual con lo local */ }
}

/** Punto de entrada desde app.js / auth.js: muestra la pantalla y la pinta (una vez). */
export async function showProfile() {
  if (window.naturdexShowScreen) window.naturdexShowScreen('screen-profile');
  await renderProfile({ conServidor: true });
}

// ================================================================================================
// Acciones (delegación de eventos sobre el contenedor: el cuerpo se repinta entero a menudo)
// ================================================================================================
async function postAccount(action, body) {
  return apiPostJson('/account.php?action=' + action, body, { timeoutMs: ACCOUNT_TIMEOUT_MS });
}

/** Descarga un objeto como fichero JSON, sin pasar por el servidor. */
function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Todo lo que este dispositivo guarda de NaturDex (progreso local incluido), tal cual. */
function localDataDump() {
  const out = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k || k.indexOf('naturdex.') !== 0) continue;
    try { out[k] = JSON.parse(localStorage.getItem(k)); }
    catch (e) { out[k] = localStorage.getItem(k); }
  }
  return { exportedAt: new Date().toISOString(), app: 'NaturDex', device: true, entries: out };
}

async function clearLocalData() {
  // Los parques guardados se retiran con la API de offline.js (borra también su Cache Storage).
  NaturDexOffline.savedParks().slice().forEach(slug => NaturDexOffline.forgetPark(slug));
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    // Se conserva la sesión (naturdex.user): borrar los datos locales no es cerrar sesión.
    if (k && k.indexOf('naturdex.') === 0 && k !== 'naturdex.user') keys.push(k);
  }
  keys.forEach(k => { try { localStorage.removeItem(k); } catch (e) { /* ignorado */ } });
  if (window.caches) {
    try {
      const names = await caches.keys();
      await Promise.all(names.filter(n => n.indexOf('naturdex-') === 0).map(n => caches.delete(n)));
    } catch (e) { /* Cache Storage no disponible */ }
  }
}

function handleFormSubmit(event) {
  const form = event.target.closest('[data-form]');
  if (!form) return;
  event.preventDefault();
  const kind = form.dataset.form;
  const values = Object.fromEntries(new FormData(form).entries());
  const submit = form.querySelector('button[type="submit"]');

  const run = async () => {
    if (submit) submit.disabled = true;
    try {
      if (kind === 'guest-name') {
        const name = String(values.name || '').trim() || 'Invitado';
        auth().setUser(Object.assign({}, currentUser(), { name }));
        setMessage('guest-name', 'Nombre guardado en este dispositivo.');
        profileBody.querySelector('.profile-name').textContent = name;
        profileBody.querySelector('.profile-avatar').textContent = initials(name);
        return;
      }

      if (kind === 'profile') {
        const data = await postAccount('profile', {
          name: values.name,
          email: values.email,
          currentPassword: values.currentPassword || ''
        });
        auth().setUser(Object.assign({}, currentUser(), data.user));
        setMessage('profile', data.emailChanged ? 'Nombre y email actualizados.' : 'Cambios guardados.');
        profileBody.querySelector('.profile-name').textContent = data.user.name || data.user.email;
        profileBody.querySelector('.profile-email').textContent = data.user.email;
        profileBody.querySelector('.profile-avatar').textContent = initials(data.user.name || data.user.email);
        return;
      }

      if (kind === 'password') {
        if (values.newPassword !== values.repeatPassword) {
          setMessage('password', 'Las dos contraseñas nuevas no coinciden.', true);
          return;
        }
        await postAccount('password', { currentPassword: values.currentPassword, newPassword: values.newPassword });
        form.reset();
        setMessage('password', 'Contraseña cambiada. La sesión sigue abierta en este dispositivo.');
        return;
      }

      if (kind === 'delete') {
        await postAccount('delete', { password: values.password, confirm: values.confirm });
        // La sesión ya está destruida en el servidor; aquí se limpia el rastro local y se vuelve
        // a la portada como si fuese la primera vez.
        await clearLocalData();
        auth().setUser(null);
        window.naturdexShowScreen('screen-cover');
        return;
      }
    } catch (e) {
      setMessage(kind, e.message || 'No se pudo completar la operación.', true);
    } finally {
      if (submit) submit.disabled = false;
    }
  };
  run();
}

async function handleClick(event) {
  const target = event.target;

  // Preferencias: opción excluyente.
  const choice = target.closest('[data-pref-choice]');
  if (choice) {
    prefs().set(choice.dataset.prefChoice, choice.dataset.value);
    choice.parentElement.querySelectorAll('.profile-choice').forEach(b => {
      const active = b === choice;
      b.classList.toggle('active', active);
      b.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    return;
  }

  const action = target.closest('[data-action]');
  const forget = target.closest('[data-forget-park]');
  if (forget) {
    NaturDexOffline.forgetPark(forget.dataset.forgetPark);
    await renderProfile();
    setMessage('storage', 'Descarga eliminada. El parque sigue disponible con conexión.');
    return;
  }
  if (!action) return;

  switch (action.dataset.action) {
    case 'open-account':
      if (window.naturdexShowAccountProgress) window.naturdexShowAccountProgress(currentUser());
      break;

    case 'create-account':
      // El progreso de invitado no se pierde: achievements.js lo migra a la cuenta nueva.
      if (auth()) auth().goToAuth('register');
      break;

    case 'logout':
      if (auth()) auth().logout();
      break;

    case 'reset-prefs':
      prefs().reset();
      await renderProfile();
      setMessage('prefs', 'Ajustes restablecidos.');
      break;

    case 'export-local':
      downloadJson('naturdex-datos-dispositivo.json', localDataDump());
      setMessage('storage', 'Descargando lo guardado en este dispositivo.');
      break;

    case 'export-server':
      // Descarga directa del endpoint (llega con Content-Disposition: attachment).
      window.location.href = API_BASE + '/account.php?action=export';
      break;

    case 'clear-local': {
      const msg = isGuest()
        ? 'Vas a borrar TODO tu progreso de este dispositivo. Como estás en modo invitado, no hay copia en el servidor y no se podrá recuperar. ¿Seguro?'
        : 'Vas a borrar el progreso guardado en este dispositivo, los parques descargados y los ajustes. Tu progreso del servidor no se toca. ¿Seguro?';
      if (!window.confirm(msg)) return;
      await clearLocalData();
      window.location.reload();
      break;
    }

    case 'tutorial':
      // El tutorial resalta elementos de la pantalla del parque o del selector: hay que salir del
      // perfil antes de lanzarlo, o señalaría a elementos ocultos.
      if (auth()) auth().goToSelect();
      if (window.naturdexTutorial) window.naturdexTutorial.start('select');
      break;

    case 'reset-tutorial':
      if (window.naturdexTutorial && window.naturdexTutorial.reset) {
        window.naturdexTutorial.reset(currentUser() && currentUser().id);
        setMessage('help', 'Hecho: el tutorial volverá a salir solo la próxima vez que entres.');
      }
      break;

    case 'check-update':
      setMessage('help', 'Comprobando…');
      try {
        const reg = navigator.serviceWorker && await navigator.serviceWorker.getRegistration();
        if (!reg) { setMessage('help', 'Este navegador no tiene la app instalada como aplicación sin conexión.'); break; }
        await reg.update();
        setMessage('help', 'Comprobado. Si había una versión nueva, la app se recargará sola en unos segundos.');
      } catch (e) {
        setMessage('help', 'No se pudo comprobar (¿sin conexión?).', true);
      }
      break;
  }
}

function handleChange(event) {
  const toggle = event.target.closest('[data-pref-toggle]');
  if (toggle) { prefs().set(toggle.dataset.prefToggle, toggle.checked); return; }

  // El email solo se puede cambiar confirmando la contraseña: el campo aparece en cuanto el valor
  // difiere del actual, en vez de pedirla siempre (cambiar solo el nombre no debe exigir nada).
  const emailInput = event.target.closest('[data-form="profile"] input[name="email"]');
  if (emailInput) {
    const user = currentUser();
    const field = profileBody.querySelector('[data-email-password]');
    if (field && user) field.hidden = emailInput.value.trim().toLowerCase() === String(user.email || '').toLowerCase();
  }
}

export function initProfile() {
  if (!profileBody) return;
  profileBody.addEventListener('click', handleClick);
  profileBody.addEventListener('submit', handleFormSubmit);
  profileBody.addEventListener('change', handleChange);
  profileBody.addEventListener('input', handleChange); // el campo de email reacciona al teclear
}
