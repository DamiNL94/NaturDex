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
  // Expuesta para que app.js y profile.js (módulos ES, sin acceso a este cierre) puedan abrir las
  // pantallas de progreso de cuenta y de perfil sin duplicar ni el mostrar/ocultar `.screen`, ni el
  // manejo de foco, ni el apilado en la pila de navegación.
  window.naturdexShowScreen = function (id) {
    if (id === 'screen-account') { pushScreen('screen-account', overlayClose(accountReturnTo)); return; }
    if (id === 'screen-profile') { pushScreen('screen-profile', overlayClose(profileReturnTo)); return; }
    showScreen(id);
  };
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

  // --- Navegación: cada pantalla es un paso deshacible -------------------------------------------
  // showScreen() solo pinta. Todo cambio de pantalla pasa además por la pila de nav.js, que le da a
  // cada paso su entrada en el historial: así el botón «atrás» del móvil (y el gesto de deslizar
  // desde el borde, que es como navega la mayoría de la gente) retrocede DENTRO de la app —parque →
  // selector → portada— en vez de sacar al usuario de la web a la primera.
  function nav() { return window.NaturDexNav || null; }

  function pushScreen(id, onBack) {
    var n = nav();
    if (n) {
      if (n.has('screen:' + id)) n.closeAbove('screen:' + id); // ya se estaba en ella: solo se cierra lo de encima
      else n.open('screen:' + id, onBack);
      // A partir del primer paso dentro de la app, salir pide una segunda pulsación (y se queda
      // pedida aunque se vuelva a la portada). Quien acaba de aterrizar en la portada y se va sin
      // tocar nada no se encuentra con ningún obstáculo: ahí el guardián sigue apagado.
      n.setExitGuard(true);
    }
    showScreen(id);
  }

  // Cierre del primer nivel: volver a la portada.
  function backToCover() {
    if (window.naturdexStopPresence) window.naturdexStopPresence();
    showScreen('screen-cover');
  }

  // Cierre de las pantallas que se abren ENCIMA de otra (perfil, progreso de cuenta): devuelven a
  // donde estabas. Volver al parque exige recalcular el tamaño del mapa: estuvo oculto
  // (display:none) y Leaflet no dibuja capas si midió el contenedor a cero.
  function overlayClose(returnTo) {
    return function () {
      showScreen(returnTo);
      if (returnTo === 'screen-park' && window.naturdexInvalidateMap) window.naturdexInvalidateMap();
    };
  }

  function readCachedUser() {
    try {
      var v = localStorage.getItem(USER_KEY);
      var u = v ? JSON.parse(v) : null;
      // Con el modo invitado desactivado, una sesión cacheada sin `id` es un invitado de antes del
      // cambio: no hay cuenta detrás, así que se descarta y la app pide entrar. Su progreso local
      // sigue guardado en el ámbito 'anon' por si el modo vuelve.
      if (u && u.id == null) { localStorage.removeItem(USER_KEY); return null; }
      return u;
    } catch (e) { return null; }
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
    // Cerrar sesión sale de todo de una vez: la pila entera se vacía para que «atrás» no devuelva a
    // pantallas de una sesión que ya no existe.
    if (nav()) { nav().reset(); nav().setExitGuard(false); }
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
    if (nav() && nav().close('screen:screen-profile')) return; // su cierre ya devuelve a donde estabas
    overlayClose(profileReturnTo)();
  }

  // --- Progreso estatal (logros de cuenta) ------------------------------------------------------
  // Mismo criterio que el perfil: se abre desde el selector y desde dentro de un parque, y el botón
  // de volver devuelve a donde estabas. Sin esto, mirar tus logros desde el parque te echaba al
  // selector y había que recargar el parque entero para seguir explorando.
  var accountReturnTo = 'screen-select';

  function openAccountProgress() {
    accountReturnTo = visibleScreenId();
    // Solo la etiqueta: el icono de flecha del botón se queda donde está.
    var back = $('#backToSelectFromAccount .back-btn-label');
    if (back) back.textContent = accountReturnTo === 'screen-park' ? 'Volver al parque' : 'Parques';
    if (window.naturdexShowAccountProgress) window.naturdexShowAccountProgress(currentUser);
  }

  function closeAccountProgress() {
    if (nav() && nav().close('screen:screen-account')) return; // su cierre ya devuelve a donde estabas
    overlayClose(accountReturnTo)();
  }

  // Abre el formulario de acceso en el modo pedido ('login' o 'register'). Lo usa el botón "Crear
  // una cuenta" que profile.js ofrece al invitado.
  function goToAuth(mode) {
    setAuthMode(mode === 'register' ? 'register' : 'login');
    pushScreen('screen-auth', backToCover);
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

  // Normaliza para buscar: sin tildes, sin mayúsculas. Escribir "espuna" tiene que encontrar
  // "Sierra Espuña", y "canaverosa" a "Cañaverosa"; si no, el buscador solo sirve al que ya sabe
  // escribir el nombre exacto, que es justo quien no lo necesita.
  function searchKey(text) {
    // NFD separa cada letra de su tilde ("ñ" -> "n" + virgulilla suelta) y el filtro se queda solo
    // con ASCII imprimible, que descarta las tildes ya sueltas. Se hace así, y no con un rango de
    // marcas diacríticas, para que este fichero no dependa de caracteres combinantes en el código.
    return String(text || '').normalize('NFD').replace(/[^\x20-\x7E]/g, '').toLowerCase().trim();
  }

  // Construye el desplegable, opcionalmente filtrado por nombre. Devuelve cuántos parques han
  // quedado; con `query` vacía, la lista completa agrupada por comunidad y provincia de siempre.
  function buildParkDropdown(reg, query) {
    var select = $('#parkSelect');
    var needle = searchKey(query);
    var matches = 0;
    select.innerHTML = '<option value="">— Elige un parque —</option>';
    ((reg && reg.communities) || []).forEach(function (c) {
      (c.provinces || []).forEach(function (p) {
        var group = document.createElement('optgroup');
        group.label = c.name + ' · ' + p.name;
        (p.parks || []).forEach(function (park) {
          // Se busca por el nombre y también por la categoría: "paisaje protegido" es una consulta
          // razonable y con solo el nombre no encontraría nada.
          if (needle && searchKey(park.name + ' ' + (park.category || '')).indexOf(needle) === -1) return;
          matches++;
          var opt = document.createElement('option');
          opt.value = park.slug;
          opt.textContent = park.name + parkOptionSuffix(park);
          if (!isSelectable(park)) opt.disabled = true;
          group.appendChild(opt);
        });
        if (group.children.length) select.appendChild(group);
      });
    });
    return matches;
  }

  // Filtra la lista mientras se escribe. Si la selección actual sobrevive al filtro se conserva; si
  // el filtro la deja fuera, se limpia (y con ella el botón de entrar) para no entrar a un parque
  // que ya no se ve en pantalla.
  function onParkSearch() {
    var query = $('#parkSearch').value;
    var matches = buildParkDropdown(registry, query);
    var counter = $('#parkSearchCount');
    if (!searchKey(query)) {
      counter.hidden = true;
    } else {
      counter.textContent = matches === 0 ? 'Ningún parque coincide con esa búsqueda.'
        : matches === 1 ? '1 parque encontrado.' : matches + ' parques encontrados.';
      counter.hidden = false;
    }
    if (selectedSlug && $('#parkSelect').querySelector('option[value="' + selectedSlug + '"]')) {
      $('#parkSelect').value = selectedSlug;
    } else if (selectedSlug) {
      selectedSlug = null;
      $('#enterParkBtn').disabled = true;
      setSelectStatus('');
    }
  }

  async function initSpainMap(reg) {
    if (spainMap) return;
    spainMap = L.map('spain-map', { zoomControl: true, scrollWheelZoom: true }).setView([40.0, -3.7], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors', maxZoom: 19, className: 'tile-osm' }).addTo(spainMap);
    // Cifras de biodiversidad (Tools/catalogo-nacional/build-biodiversidad-stats.js): la comparativa
    // entre espacios que pide el selector, sin una pantalla nueva que mantener. Sin red ni caché el
    // popup se queda como estaba, sin la línea de cifras — nunca rompe el mapa de España.
    var biodiv = {};
    try { biodiv = (await NaturDexOffline.fetchJsonCached('Data/parks-biodiversidad.json')).data.porParque || {}; }
    catch (e) { /* sin estadísticas: el popup sigue funcionando sin ellas */ }
    availableParks(reg).forEach(function (item) {
      var c = item.park.center;
      if (!c) return;
      var marker = L.marker(c).addTo(spainMap);
      var basic = item.park.status === 'basic';
      var stats = biodiv[item.park.slug];
      var statsLine = (!basic && stats) ? '<p>🌿 ' + stats.especies.total + ' especies · ' + stats.habitats.total + ' hábitats</p>' : '';
      marker.bindPopup('<strong>' + item.park.name + '</strong><br><span class="popup-type">' + (item.park.category || '') + ' · ' + item.province + '</span>'
        + (basic ? '<p>Ficha base: límite oficial y Red Natura 2000. Catálogo de especies y hábitats en preparación.</p>' : '')
        + statsLine
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
      pushScreen('screen-park', restoreSelectScreen);
      if (window.naturdexInvalidateMap) window.naturdexInvalidateMap();
      setSelectStatus('');
      // Tramo del tutorial dentro del parque: solo la primera vez que este usuario entra a uno.
      if (window.naturdexTutorial) window.naturdexTutorial.maybeAutoStart('park', currentUser && currentUser.id);
    } catch (e) {
      setSelectStatus('No se pudo cargar el parque. Si estás sin conexión, ábrelo antes una vez con internet.', true);
      console.error(e);
    }
  }

  // --- Portada ---------------------------------------------------------------------------------
  // La portada no lleva ni un dato escrito a mano: el recuento sale del índice de parques y la foto,
  // del manifiesto de uno de los espacios con catálogo, rotando por día del año. Así deja de
  // anunciar un parque piloto concreto (el rótulo es NaturDex) y se actualiza sola según se añaden
  // espacios y fotos. Todo va en try/catch: sin red ni caché, se quedan los textos de reserva del
  // index.html y el hueco de la foto en verde profundo, que es un fondo válido de por sí.
  async function fillCover() {
    try {
      if (!registry) registry = (await NaturDexOffline.fetchJsonCached('Data/parks-index.json')).data;
    } catch (e) { return; }

    var all = [];
    var communities = [];
    ((registry && registry.communities) || []).forEach(function (c) {
      if (c.name) communities.push(c.name);
      (c.provinces || []).forEach(function (p) { (p.parks || []).forEach(function (park) { all.push(park); }); });
    });
    if (!all.length) return;

    var withCatalog = all.filter(function (p) { return p.status === 'available'; });
    var stats = $('#coverStats');
    if (stats) {
      stats.textContent = all.length + (all.length === 1 ? ' espacio protegido' : ' espacios protegidos')
        + ' · ' + withCatalog.length + ' con catálogo completo';
    }
    var foot = $('#coverFoot');
    if (foot && communities.length) foot.textContent = 'Prototipo · ' + communities.join(' · ');

    // La foto rota por día del año entre los espacios con catálogo. Si al que toca no le han puesto
    // fotos todavía (hoy solo las tiene el parque por defecto), se cae al parque por defecto.
    var dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    var order = withCatalog.length ? withCatalog : all;
    var candidates = [order[dayOfYear % order.length]];
    var fallback = all.find(function (p) { return p.slug === registry.defaultPark; });
    if (fallback && candidates[0] !== fallback) candidates.push(fallback);

    for (var i = 0; i < candidates.length; i++) {
      var park = candidates[i];
      if (!park || !park.manifest) continue;
      try {
        var manifest = (await NaturDexOffline.fetchJsonCached(park.manifest)).data;
        var images = (manifest && manifest.images) || [];
        if (!images.length) continue;
        showCoverPhoto(images[dayOfYear % images.length], park.name);
        return;
      } catch (e) { /* ese parque no tiene manifiesto accesible: se prueba el siguiente */ }
    }
  }

  function showCoverPhoto(src, parkName) {
    var box = $('#coverPhoto');
    var caption = $('#coverPhotoCaption');
    if (!box || !src) return;
    var img = document.createElement('img');
    img.alt = '';                         // decorativa: el pie de foto ya dice de dónde es
    img.decoding = 'async';
    // Solo se muestra si carga: una imagen rota sobre el verde se vería peor que el verde solo.
    img.addEventListener('load', function () {
      box.insertBefore(img, box.firstChild);
      if (caption && parkName) { caption.textContent = parkName; caption.hidden = false; }
    });
    img.src = src;
  }

  // Contenido de la pantalla del selector, sin tocar la pila de navegación: lista de parques, mapa
  // de España y preselección. Lo comparten la entrada al selector y la vuelta desde un parque.
  async function fillSelectScreen() {
    updateUserLabels();
    if (!registry) {
      try { registry = (await NaturDexOffline.fetchJsonCached('Data/parks-index.json')).data; }
      catch (e) { setSelectStatus('No se pudo cargar la lista de parques.', true); return; }
    }
    // Al volver al selector la búsqueda se limpia: si no, se llegaría con la lista filtrada de la
    // vez anterior y con la mitad de los parques "desaparecidos" sin explicación.
    var search = $('#parkSearch');
    if (search) search.value = '';
    $('#parkSearchCount').hidden = true;
    buildParkDropdown(registry);
    await initSpainMap(registry);
    // Preselección: si solo hay un parque disponible, dejarlo elegido.
    var avail = availableParks(registry);
    if (avail.length === 1) choosePark(avail[0].park.slug);
    // Tramo del tutorial de selección de parque: solo la primera vez que este usuario llega aquí.
    if (window.naturdexTutorial) window.naturdexTutorial.maybeAutoStart('select', currentUser && currentUser.id);
  }

  // Cierre del nivel «parque»: se vuelve al selector. No pasa por goToSelect() a propósito — la pila
  // ya está desapilando este nivel y volver a entrar por la puerta grande sería una recursión.
  function restoreSelectScreen() {
    // Salir del parque apaga el registro de presencia: seguir gastando GPS en una pantalla que no
    // es el parque no verifica nada y sí vacía la batería (app.js · presence.js).
    if (window.naturdexStopPresence) window.naturdexStopPresence();
    showScreen('screen-select');
    setSelectStatus('');
    fillSelectScreen();
  }

  async function goToSelect() {
    var n = nav();
    // Desde dentro de un parque, «← Parques» es exactamente el paso atrás que la pila ya sabe hacer
    // (y su cierre deja el selector pintado): así el botón de la app y el del móvil hacen lo mismo.
    if (n && n.has('screen:screen-park')) { n.close('screen:screen-park'); return; }
    if (n && n.has('screen:screen-auth')) {
      // Recién identificado: el formulario de acceso deja de formar parte del camino. Atrás desde el
      // selector lleva a la portada, no de vuelta a un login ya resuelto.
      n.closeAbove('screen:screen-auth');
      n.replaceTop('screen:screen-select', backToCover);
      n.setExitGuard(true);
      showScreen('screen-select');
    } else {
      pushScreen('screen-select', backToCover);
    }
    if (window.naturdexStopPresence) window.naturdexStopPresence();
    await fillSelectScreen();
  }

  async function goFromCover() {
    // Si ya hay sesión (cacheada o del servidor), directo al selector; si no, al login.
    await refreshSession();
    if (currentUser) goToSelect(); else pushScreen('screen-auth', backToCover);
  }

  // --- Invitado (sin cuenta, sin backend) ------------------------------------------------------
  // DESACTIVADO por ahora: el backend ya sirve cuentas reales y el progreso solo se conserva de
  // verdad asociado a una. Los botones de entrada están comentados en index.html y sin cablear más
  // abajo; la función se conserva para poder reactivarlo sin rehacerlo.
  //
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
    // Modo invitado desactivado: sus dos botones están comentados en index.html, así que aquí no
    // hay nada que cablear (ver enterAsGuest más arriba para reactivarlo).
    $('#authBack').addEventListener('click', function () {
      if (nav() && nav().close('screen:screen-auth')) return;
      backToCover();
    });
    document.querySelectorAll('.auth-tab').forEach(function (t) { t.addEventListener('click', function () { setAuthMode(t.dataset.mode); }); });
    $('#authForm').addEventListener('submit', submitAuth);
    $('#parkSelect').addEventListener('change', function (e) { choosePark(e.target.value); });
    $('#parkSearch').addEventListener('input', onParkSearch);
    $('#enterParkBtn').addEventListener('click', function () { enterPark(selectedSlug); });
    $('#geoLocateBtn').addEventListener('click', geolocateNearest);
    // Cerrar sesión ya no es un icono suelto en cada cabecera: vive dentro de Perfil y ajustes,
    // junto al resto de lo que se administra de la cuenta.
    $('#profileBtn').addEventListener('click', openProfile);
    $('#profileBtnSelect').addEventListener('click', openProfile);
    $('#backFromProfile').addEventListener('click', closeProfile);
    $('#backToParks').addEventListener('click', goToSelect);
    // Gemelos de la barra superior del mapa (móvil): en la pestaña «Mapa» la barra lateral —donde
    // viven los originales— está oculta, y sin estos dos botones no había salida ni acceso al perfil
    // desde la primera pantalla que ve el usuario al entrar a un parque.
    var backMap = $('#backToParksMap');
    if (backMap) backMap.addEventListener('click', goToSelect);
    var profileMap = $('#profileBtnMap');
    if (profileMap) profileMap.addEventListener('click', openProfile);
    $('#accountProgressBtn').addEventListener('click', openAccountProgress);
    $('#accountProgressBtnPark').addEventListener('click', openAccountProgress);
    $('#backToSelectFromAccount').addEventListener('click', closeAccountProgress);
    // Botón "Entrar al parque" dentro del popup del mapa de España.
    document.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('.popup-enter');
      if (b) enterPark(b.dataset.slug);
    });

    updateUserLabels();
    // La pila arranca vacía en la portada: ahí «atrás» sale de NaturDex sin ceremonias, porque es
    // el borde real de la app.
    if (nav()) { nav().init(); nav().setExitGuard(false); }
    showScreen('screen-cover');
    NaturDexOffline.registerServiceWorker();
    fillCover();      // en segundo plano: la portada ya es usable con sus textos de reserva
    refreshSession(); // en segundo plano, para que "Comenzar" ya sepa si hay sesión
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire);
  else wire();
})();
