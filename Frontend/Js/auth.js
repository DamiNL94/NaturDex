/*
 * auth.js — flujo de pantallas, autenticación y selección de parque.
 *
 * Pantallas: portada -> login/registro -> mapa de España (selector de parque) -> parque.
 * Al elegir un parque se llama a window.startParkExperience(slug, user) (definido en app.js), que
 * carga todo lo del parque. Así el mapa de España es un selector ligero y solo se cargan los datos
 * pesados del parque que el usuario va a explorar (no todo de golpe).
 */
(function () {
  'use strict';

  var API_BASE = '../Backend/Api';
  var USER_KEY = 'naturdex.user';
  var registry = null;
  var spainMap = null;
  var selectedSlug = null;
  var currentUser = readCachedUser();

  // --- Utilidades de pantalla -----------------------------------------------------------------
  // Expuesta para que app.js (módulo ES, sin acceso a este cierre) pueda mostrar la pantalla de
  // progreso de cuenta sin duplicar la lógica de mostrar/ocultar `.screen` ni el manejo de foco.
  window.naturdexShowScreen = showScreen;
  var screenShownOnce = false;
  function showScreen(id) {
    var screens = document.querySelectorAll('.screen');
    var shown = null;
    for (var i = 0; i < screens.length; i++) {
      screens[i].hidden = (screens[i].id !== id);
      if (screens[i].id === id) shown = screens[i];
    }
    window.scrollTo(0, 0);
    // Accesibilidad (2.4.3): al cambiar de "pantalla" en esta SPA, el foco se lleva al encabezado
    // de la nueva vista para que el lector de pantalla siga el hilo. En la carga inicial no se
    // mueve el foco (el usuario aún no ha interactuado).
    if (screenShownOnce && shown) {
      var heading = shown.querySelector('h1, h2');
      if (heading) {
        if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      }
    }
    screenShownOnce = true;
  }
  function $(sel) { return document.querySelector(sel); }

  function readCachedUser() {
    try { var v = localStorage.getItem(USER_KEY); return v ? JSON.parse(v) : null; } catch (e) { return null; }
  }
  function setUser(user) {
    currentUser = user;
    try { user ? localStorage.setItem(USER_KEY, JSON.stringify(user)) : localStorage.removeItem(USER_KEY); } catch (e) {}
    updateUserLabels();
    // Las preferencias son por cuenta y prefs.js deduce el ámbito de este mismo `naturdex.user`:
    // al entrar, salir o cambiar de cuenta hay que releerlas y reaplicarlas (tema, tamaño…).
    if (window.NaturDexPrefs) window.NaturDexPrefs.reload();
  }
  function updateUserLabels() {
    var name = currentUser ? (currentUser.name || currentUser.email) : '';
    ['#userName', '#userNameSelect'].forEach(function (s) { var el = $(s); if (el) el.textContent = name; });
  }

  // --- Peticiones de autenticación ------------------------------------------------------------
  async function api(action, method, body) {
    var opts = { method: method, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    // Si el backend no responde en 3 s se aborta: así "Comenzar" no se queda colgado sin conexión
    // y se cae enseguida a la sesión cacheada (mismo criterio que data.js).
    if (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) opts.signal = AbortSignal.timeout(3000);
    var res = await fetch(API_BASE + '/auth.php?action=' + action, opts);
    var data = await res.json().catch(function () { return {}; });
    if (!res.ok) throw new Error(data.error || ('HTTP ' + res.status));
    return data;
  }

  async function refreshSession() {
    if (!navigator.onLine) return currentUser; // offline: se usa el usuario cacheado
    try {
      var data = await api('me', 'GET');
      setUser(data.user || null);
      return currentUser;
    } catch (e) { return currentUser; }
  }

  // --- Login / registro -----------------------------------------------------------------------
  var authMode = 'login';
  function setAuthMode(mode) {
    authMode = mode;
    document.querySelectorAll('.auth-tab').forEach(function (t) {
      var active = t.dataset.mode === mode;
      t.classList.toggle('active', active);
      t.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    $('#nameField').hidden = mode !== 'register';
    $('#authSubmit').textContent = mode === 'register' ? 'Crear cuenta' : 'Entrar';
    $('#authPassword').setAttribute('autocomplete', mode === 'register' ? 'new-password' : 'current-password');
    hideAuthError();
  }
  function showAuthError(msg) { var e = $('#authError'); e.textContent = msg; e.hidden = false; }
  function hideAuthError() { $('#authError').hidden = true; }

  async function submitAuth(event) {
    event.preventDefault();
    hideAuthError();
    var email = $('#authEmail').value.trim();
    var password = $('#authPassword').value;
    var name = $('#authName').value.trim();
    if (!email || !password) { showAuthError('Rellena email y contraseña.'); return; }
    if (password.length < 6) { showAuthError('La contraseña debe tener al menos 6 caracteres.'); return; }
    var submit = $('#authSubmit');
    submit.disabled = true;
    try {
      var payload = authMode === 'register' ? { email: email, password: password, name: name } : { email: email, password: password };
      var data = await api(authMode, 'POST', payload);
      setUser(data.user);
      goToSelect();
    } catch (e) {
      showAuthError(e.message || 'No se pudo completar la operación.');
    } finally {
      submit.disabled = false;
    }
  }

  async function logout() {
    try { await api('logout', 'POST'); } catch (e) {}
    setUser(null);
    showScreen('screen-cover');
  }

  // --- Perfil y ajustes -------------------------------------------------------------------------
  // La pantalla de perfil se abre desde dos sitios (el selector de parque y el parque) y "← Volver"
  // debe devolver a donde estabas, no siempre al selector: si estás explorando un parque y entras a
  // cambiar un ajuste, volver al selector te haría recargar el parque entero.
  var profileReturnTo = 'screen-select';

  function visibleScreenId() {
    var screens = document.querySelectorAll('.screen');
    for (var i = 0; i < screens.length; i++) if (!screens[i].hidden) return screens[i].id;
    return 'screen-select';
  }

  function openProfile() {
    profileReturnTo = visibleScreenId();
    if (window.naturdexShowProfile) window.naturdexShowProfile(currentUser);
  }

  function closeProfile() {
    // Volver al parque exige recalcular el tamaño del mapa: estuvo oculto (display:none) mientras
    // el perfil estaba abierto y Leaflet no dibuja capas si midió el contenedor a cero.
    showScreen(profileReturnTo);
    if (profileReturnTo === 'screen-park' && window.naturdexInvalidateMap) window.naturdexInvalidateMap();
  }

  // Abre el formulario de acceso en el modo pedido ('login' o 'register'). Lo usa el botón "Crear
  // una cuenta" que profile.js ofrece al invitado.
  function goToAuth(mode) {
    setAuthMode(mode === 'register' ? 'register' : 'login');
    showScreen('screen-auth');
  }

  // API para los módulos ES (profile.js), que no comparten este cierre. Mismo patrón que
  // window.naturdexShowScreen: auth.js sigue siendo el dueño de la sesión y de la navegación.
  window.naturdexAuth = {
    getUser: function () { return currentUser; },
    setUser: setUser,
    logout: logout,
    goToSelect: function () { goToSelect(); },
    goToAuth: goToAuth
  };

  // --- Selección de parque (mapa de España) ---------------------------------------------------
  // Tres niveles de dato en parks-index.json (ver su `_comment`):
  //   'available' → catálogo completo (N2). 'basic' → ficha base (N1): límite oficial y Red Natura
  //   2000, sin especies ni hábitats. 'planned' → anunciado, sin datos.
  // Los dos primeros son SELECCIONABLES: un espacio con ficha base ya tiene mapa que enseñar y el
  // frontend avisa de que su catálogo está en preparación. 'planned' sigue deshabilitado.
  function isSelectable(park) {
    return park && (park.status === 'available' || park.status === 'basic');
  }

  // Espacios que el usuario puede abrir (los usa el mapa de España, el "más cercano" y la
  // preselección). El nombre se mantiene por compatibilidad con el resto del fichero.
  function availableParks(reg) {
    var out = [];
    ((reg && reg.communities) || []).forEach(function (c) {
      (c.provinces || []).forEach(function (p) {
        (p.parks || []).forEach(function (park) {
          if (isSelectable(park)) out.push({ community: c.name, province: p.name, park: park });
        });
      });
    });
    return out;
  }

  function parkOptionSuffix(park) {
    if (park.status === 'basic') return ' (ficha base)';
    if (park.status !== 'available') return ' (próximamente)';
    return '';
  }

  function buildParkDropdown(reg) {
    var select = $('#parkSelect');
    select.innerHTML = '<option value="">— Elige un parque —</option>';
    ((reg && reg.communities) || []).forEach(function (c) {
      (c.provinces || []).forEach(function (p) {
        var group = document.createElement('optgroup');
        group.label = c.name + ' · ' + p.name;
        (p.parks || []).forEach(function (park) {
          var opt = document.createElement('option');
          opt.value = park.slug;
          opt.textContent = park.name + parkOptionSuffix(park);
          if (!isSelectable(park)) opt.disabled = true;
          group.appendChild(opt);
        });
        if (group.children.length) select.appendChild(group);
      });
    });
  }

  function initSpainMap(reg) {
    if (spainMap) return;
    spainMap = L.map('spain-map', { zoomControl: true, scrollWheelZoom: true }).setView([40.0, -3.7], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors', maxZoom: 19, className: 'tile-osm' }).addTo(spainMap);
    availableParks(reg).forEach(function (item) {
      var c = item.park.center;
      if (!c) return;
      var marker = L.marker(c).addTo(spainMap);
      var basic = item.park.status === 'basic';
      marker.bindPopup('<strong>' + item.park.name + '</strong><br><span class="popup-type">' + (item.park.category || '') + ' · ' + item.province + '</span>'
        + (basic ? '<p>Ficha base: límite oficial y Red Natura 2000. Catálogo de especies y hábitats en preparación.</p>' : '')
        + '<br><button type="button" class="popup-enter" data-slug="' + item.park.slug + '">Entrar al parque</button>');
      marker.on('click', function () { choosePark(item.park.slug); });
    });
    setTimeout(function () { spainMap.invalidateSize(); }, 200);
  }

  function choosePark(slug) {
    selectedSlug = slug;
    $('#parkSelect').value = slug;
    $('#enterParkBtn').disabled = !slug;
    var found = availableParks(registry).find(function (i) { return i.park.slug === slug; });
    if (found && found.park.center && spainMap) spainMap.setView(found.park.center, 11, { animate: true });
    setSelectStatus(found
      ? 'Seleccionado: ' + found.park.name + (found.park.status === 'basic' ? ' · ficha base, catálogo en preparación' : '')
      : '');
  }

  function setSelectStatus(msg, isError) {
    var el = $('#selectStatus');
    if (!msg) { el.hidden = true; return; }
    el.textContent = msg;
    el.classList.toggle('error', !!isError);
    el.hidden = false;
  }

  function distanceMeters(aLat, aLng, bLat, bLng) {
    var R = 6371000, toRad = function (d) { return d * Math.PI / 180; };
    var dLat = toRad(bLat - aLat), dLng = toRad(bLng - aLng);
    var s = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
  }

  // Versión local del diagnóstico de geolocalización de util.js (este script no es un módulo ES y
  // no puede importarlo). Los navegadores móviles bloquean el GPS sin HTTPS fallando con "permiso
  // denegado" sin enseñar el diálogo; sin este aviso el usuario no sabe qué tiene que arreglar.
  function geoBlockedReason() {
    if (!('geolocation' in navigator)) return 'Este navegador no tiene geolocalización.';
    if (window.isSecureContext === false) {
      return 'El navegador bloquea la ubicación porque la app no se está sirviendo por HTTPS. '
        + 'Abre la app desde una dirección https:// para usar el GPS.';
    }
    return null;
  }

  function geoErrorText(err) {
    if (err && err.code === 1) {
      return geoBlockedReason() || ('Permiso de ubicación denegado. Tócalo en el icono de candado/ajustes '
        + 'junto a la dirección → Permisos → Ubicación → Permitir. Si no aparece, en Android ve a '
        + 'Ajustes → Aplicaciones → tu navegador → Permisos → Ubicación → Permitir.');
    }
    if (err && err.code === 2) return 'No hay señal de ubicación. Comprueba que la ubicación (GPS) del dispositivo está activada.';
    if (err && err.code === 3) return 'La ubicación tardó demasiado en llegar. Muévete a cielo abierto e inténtalo de nuevo.';
    return 'No se pudo obtener tu ubicación' + (err && err.message ? ' (' + err.message + ')' : '') + '.';
  }

  function geolocateNearest() {
    var blocked = geoBlockedReason();
    if (blocked) { setSelectStatus(blocked, true); return; }
    setSelectStatus('Buscando tu ubicación…');
    navigator.geolocation.getCurrentPosition(function (pos) {
      var parks = availableParks(registry).filter(function (i) { return i.park.center; });
      if (!parks.length) { setSelectStatus('Todavía no hay parques disponibles.', true); return; }
      var nearest = null, best = Infinity;
      parks.forEach(function (i) {
        var d = distanceMeters(pos.coords.latitude, pos.coords.longitude, i.park.center[0], i.park.center[1]);
        if (d < best) { best = d; nearest = i; }
      });
      var km = (best / 1000).toFixed(best < 100000 ? 1 : 0);
      setSelectStatus('Parque más cercano: ' + nearest.park.name + ' (a ' + km + ' km). Cargando…');
      enterPark(nearest.park.slug);
    }, function (err) {
      setSelectStatus(geoErrorText(err), true);
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 });
  }

  async function enterPark(slug) {
    if (!slug) return;
    setSelectStatus('Cargando el parque…');
    try {
      await window.startParkExperience(slug, currentUser);
      showScreen('screen-park');
      if (window.naturdexInvalidateMap) window.naturdexInvalidateMap();
      setSelectStatus('');
      // Tramo del tutorial dentro del parque: solo la primera vez que este usuario entra a uno.
      if (window.naturdexTutorial) window.naturdexTutorial.maybeAutoStart('park', currentUser && currentUser.id);
    } catch (e) {
      setSelectStatus('No se pudo cargar el parque. Si estás sin conexión, ábrelo antes una vez con internet.', true);
      console.error(e);
    }
  }

  async function goToSelect() {
    updateUserLabels();
    showScreen('screen-select');
    if (!registry) {
      try { registry = (await NaturDexOffline.fetchJsonCached('Data/parks-index.json')).data; }
      catch (e) { setSelectStatus('No se pudo cargar la lista de parques.', true); return; }
    }
    buildParkDropdown(registry);
    initSpainMap(registry);
    // Preselección: si solo hay un parque disponible, dejarlo elegido.
    var avail = availableParks(registry);
    if (avail.length === 1) choosePark(avail[0].park.slug);
    // Tramo del tutorial de selección de parque: solo la primera vez que este usuario llega aquí.
    if (window.naturdexTutorial) window.naturdexTutorial.maybeAutoStart('select', currentUser && currentUser.id);
  }

  async function goFromCover() {
    // Si ya hay sesión (cacheada o del servidor), directo al selector; si no, al login.
    await refreshSession();
    if (currentUser) goToSelect(); else showScreen('screen-auth');
  }

  // --- Invitado (sin cuenta, sin backend) ------------------------------------------------------
  // Formaliza como usuario real el caso que refreshSession() ya trataba de forma implícita en
  // offline: un usuario cacheado sin llamar a la API. Sin `id`, progressScope() (data.js) usa el
  // ámbito 'anon', así que el progreso del invitado es siempre local y nunca intenta sincronizar
  // con el backend. Es la ruta que hace que la demo funcione en hosting estático (sin Backend/Api).
  function enterAsGuest() {
    setUser({ name: 'Invitado' });
    goToSelect();
  }

  // --- Cableado -------------------------------------------------------------------------------
  function wire() {
    $('#coverStart').addEventListener('click', goFromCover);
    $('#guestStart').addEventListener('click', enterAsGuest);
    $('#guestStartAuth').addEventListener('click', enterAsGuest);
    $('#authBack').addEventListener('click', function () { showScreen('screen-cover'); });
    document.querySelectorAll('.auth-tab').forEach(function (t) { t.addEventListener('click', function () { setAuthMode(t.dataset.mode); }); });
    $('#authForm').addEventListener('submit', submitAuth);
    $('#parkSelect').addEventListener('change', function (e) { choosePark(e.target.value); });
    $('#enterParkBtn').addEventListener('click', function () { enterPark(selectedSlug); });
    $('#geoLocateBtn').addEventListener('click', geolocateNearest);
    // Cerrar sesión ya no es un icono suelto en cada cabecera: vive dentro de Perfil y ajustes,
    // junto al resto de lo que se administra de la cuenta.
    $('#profileBtn').addEventListener('click', openProfile);
    $('#profileBtnSelect').addEventListener('click', openProfile);
    $('#backFromProfile').addEventListener('click', closeProfile);
    $('#backToParks').addEventListener('click', goToSelect);
    $('#accountProgressBtn').addEventListener('click', function () { if (window.naturdexShowAccountProgress) window.naturdexShowAccountProgress(currentUser); });
    $('#backToSelectFromAccount').addEventListener('click', goToSelect);
    // Botón "Entrar al parque" dentro del popup del mapa de España.
    document.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('.popup-enter');
      if (b) enterPark(b.dataset.slug);
    });

    updateUserLabels();
    showScreen('screen-cover');
    NaturDexOffline.registerServiceWorker();
    refreshSession(); // en segundo plano, para que "Comenzar" ya sepa si hay sesión
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire);
  else wire();
})();
