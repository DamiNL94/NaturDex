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

  // --- Selección de parque (mapa de España) ---------------------------------------------------
  function availableParks(reg) {
    var out = [];
    ((reg && reg.communities) || []).forEach(function (c) {
      (c.provinces || []).forEach(function (p) {
        (p.parks || []).forEach(function (park) {
          if (park.status === 'available') out.push({ community: c.name, province: p.name, park: park });
        });
      });
    });
    return out;
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
          opt.textContent = park.name + (park.status !== 'available' ? ' (próximamente)' : '');
          if (park.status !== 'available') opt.disabled = true;
          group.appendChild(opt);
        });
        if (group.children.length) select.appendChild(group);
      });
    });
  }

  function initSpainMap(reg) {
    if (spainMap) return;
    spainMap = L.map('spain-map', { zoomControl: true, scrollWheelZoom: true }).setView([40.0, -3.7], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors', maxZoom: 19 }).addTo(spainMap);
    availableParks(reg).forEach(function (item) {
      var c = item.park.center;
      if (!c) return;
      var marker = L.marker(c).addTo(spainMap);
      marker.bindPopup('<strong>' + item.park.name + '</strong><br><span class="popup-type">' + (item.park.category || '') + ' · ' + item.province + '</span>'
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
    setSelectStatus(found ? 'Seleccionado: ' + found.park.name : '');
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

  function geolocateNearest() {
    if (!('geolocation' in navigator)) { setSelectStatus('Tu navegador no tiene geolocalización.', true); return; }
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
      setSelectStatus('No se pudo obtener tu ubicación (' + (err.message || 'permiso denegado') + ').', true);
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
  }

  async function goFromCover() {
    // Si ya hay sesión (cacheada o del servidor), directo al selector; si no, al login.
    await refreshSession();
    if (currentUser) goToSelect(); else showScreen('screen-auth');
  }

  // --- Cableado -------------------------------------------------------------------------------
  function wire() {
    $('#coverStart').addEventListener('click', goFromCover);
    $('#authBack').addEventListener('click', function () { showScreen('screen-cover'); });
    document.querySelectorAll('.auth-tab').forEach(function (t) { t.addEventListener('click', function () { setAuthMode(t.dataset.mode); }); });
    $('#authForm').addEventListener('submit', submitAuth);
    $('#parkSelect').addEventListener('change', function (e) { choosePark(e.target.value); });
    $('#enterParkBtn').addEventListener('click', function () { enterPark(selectedSlug); });
    $('#geoLocateBtn').addEventListener('click', geolocateNearest);
    $('#logoutBtn').addEventListener('click', logout);
    $('#logoutBtnSelect').addEventListener('click', logout);
    $('#backToParks').addEventListener('click', goToSelect);
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
