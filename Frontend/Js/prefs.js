/*
 * prefs.js — preferencias de la app (tema, accesibilidad, mapa, GPS, avisos).
 *
 * Es un script CLÁSICO cargado en el <head>, no un módulo ES, y a propósito:
 *   1. El tema (claro/oscuro) tiene que estar puesto en <html> ANTES del primer pintado. Un módulo
 *      ES es diferido (se ejecuta tras parsear el documento) y se vería un fogonazo blanco al
 *      abrir la app en oscuro.
 *   2. Así lo puede usar tanto auth.js (script clásico) como los módulos ES (window.NaturDexPrefs),
 *      igual que ya ocurre con NaturDexOffline.
 *
 * Ámbito: las preferencias son POR CUENTA en este dispositivo, con el mismo criterio que el resto
 * de datos locales (progressScope en data.js, tutorial.js, achievements.js): 'u<id>' si hay sesión
 * cacheada, 'anon' para el modo invitado. Se leen del mismo `naturdex.user` que escribe auth.js, de
 * modo que aquí no hace falta esperar a nadie para saber de quién son.
 *
 * El dispositivo manda: todo se aplica desde localStorage al instante, sin esperar a la red. El
 * envío a Backend/Api/account.php?action=prefs es un espejo para recuperarlas en otro dispositivo,
 * y se resuelve por "última escritura gana" comparando `updatedAt` (ver adoptServerPrefs).
 */
(function (global) {
  'use strict';

  var USER_KEY = 'naturdex.user';
  var API_BASE = '../Backend/Api';

  // --- Catálogo de preferencias -----------------------------------------------------------------
  // Cada una la aplica applyPrefs() y/o la lee el módulo correspondiente (map.js, explorer.js,
  // achievements.js). Añadir una preferencia nueva = añadirla aquí y pintarla en profile.js.
  var DEFAULTS = {
    theme: 'auto',            // 'auto' | 'claro' | 'oscuro'  → data-theme en <html>
    textSize: 'normal',       // 'normal' | 'grande' | 'enorme' → escala la raíz en rem
    reduceMotion: false,      // fuerza el "menos movimiento" aunque el sistema no lo pida
    mapBase: 'osm',           // capa base por defecto del mapa del parque: 'osm' | 'pnoa'
    followByDefault: false,   // el modo explorador arranca con "el mapa se mueve contigo"
    highAccuracyGps: true,    // enableHighAccuracy en el seguimiento (gasta más batería)
    celebrations: true,       // carteles animados al desbloquear un logro
    achievementSound: false,  // sonido corto al desbloquear (heredada de achievements.js)
    // Consentimiento para que los avistamientos de esta cuenta salgan en la exportación Darwin Core
    // (Tools/export-dwc.php). APAGADO por defecto y a propósito: publicar la observación de alguien
    // con su nombre es una cesión de datos personales, y una cesión no se presume, se pide. El
    // exportador lo comprueba en el espejo del servidor (users.prefs), no en el dispositivo.
    shareOccurrences: false
  };

  var LISTENERS = [];
  var current = null;   // { updatedAt, values } ya normalizado
  var currentScope = null;

  // --- Almacenamiento ---------------------------------------------------------------------------
  function scope() {
    try {
      var raw = localStorage.getItem(USER_KEY);
      var user = raw ? JSON.parse(raw) : null;
      return (user && user.id != null) ? 'u' + user.id : 'anon';
    } catch (e) { return 'anon'; }
  }

  function storageKey(sc) { return 'naturdex.prefs.' + sc; }

  function readStored(sc) {
    try {
      var raw = localStorage.getItem(storageKey(sc));
      var parsed = raw ? JSON.parse(raw) : null;
      if (parsed && typeof parsed === 'object' && parsed.values) return parsed;
      // Formato antiguo (objeto plano de valores) o inexistente.
      if (parsed && typeof parsed === 'object') return { updatedAt: null, values: parsed };
    } catch (e) { /* localStorage bloqueado o JSON corrupto: se usan los valores por defecto */ }
    return { updatedAt: null, values: {} };
  }

  function writeStored(sc, payload) {
    try { localStorage.setItem(storageKey(sc), JSON.stringify(payload)); }
    catch (e) { /* almacenamiento lleno/bloqueado: las preferencias solo durarán esta sesión */ }
  }

  // El sonido de logro existía antes de esta pantalla, guardado por achievements.js en su propia
  // clave. Se adopta la primera vez para que quien ya lo hubiera activado no lo pierda.
  function adoptLegacySound(sc, values) {
    if (values.achievementSound !== undefined) return;
    try {
      var raw = localStorage.getItem('naturdex.achievementSound.' + sc);
      if (raw != null) values.achievementSound = JSON.parse(raw) === true;
    } catch (e) { /* ignorado */ }
  }

  function load() {
    currentScope = scope();
    var stored = readStored(currentScope);
    adoptLegacySound(currentScope, stored.values);
    current = { updatedAt: stored.updatedAt, values: stored.values };
    return current;
  }

  // --- Aplicación al documento ------------------------------------------------------------------
  var mediaDark = global.matchMedia ? global.matchMedia('(prefers-color-scheme: dark)') : null;

  function resolvedTheme() {
    var theme = get('theme');
    if (theme === 'oscuro') return 'dark';
    if (theme === 'claro') return 'light';
    return (mediaDark && mediaDark.matches) ? 'dark' : 'light';
  }

  function applyPrefs() {
    var root = document.documentElement;
    var dark = resolvedTheme() === 'dark';
    root.dataset.theme = dark ? 'dark' : 'light';
    root.dataset.textSize = get('textSize');
    // data-motion="reduce" replica en CSS lo que ya hace @media (prefers-reduced-motion), para
    // quien quiere menos movimiento SOLO en esta app sin tocar los ajustes de su sistema.
    if (get('reduceMotion')) root.dataset.motion = 'reduce'; else delete root.dataset.motion;
    // La barra del navegador/PWA acompaña al tema (si no, en oscuro queda una franja verde clara).
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#101a14' : '#2f6f4e');
  }

  // Con el tema en "automático", seguir al sistema en caliente (el usuario puede cambiarlo desde el
  // móvil con la app abierta). addEventListener sobre MediaQueryList no existe en navegadores
  // antiguos: se cae a addListener.
  if (mediaDark) {
    var onSystemThemeChange = function () { if (get('theme') === 'auto') { applyPrefs(); notify(); } };
    if (mediaDark.addEventListener) mediaDark.addEventListener('change', onSystemThemeChange);
    else if (mediaDark.addListener) mediaDark.addListener(onSystemThemeChange);
  }

  // --- Sincronización con el servidor (espejo, nunca bloqueante) --------------------------------
  var syncTimer = null;
  function queueServerSync() {
    if (currentScope === 'anon') return;          // invitado: no hay cuenta donde espejar
    if (global.navigator && global.navigator.onLine === false) return;
    if (syncTimer) clearTimeout(syncTimer);
    // Agrupado: mover tres interruptores seguidos manda una sola petición.
    syncTimer = setTimeout(function () {
      syncTimer = null;
      var payload = { prefs: Object.assign({}, current.values, { updatedAt: current.updatedAt }) };
      fetch(API_BASE + '/account.php?action=prefs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(function () { /* sin red o sin sesión: el dispositivo ya tiene el valor bueno */ });
    }, 600);
  }

  /**
   * Fusiona las preferencias que devuelve el servidor (account.php?action=profile).
   * Última escritura gana: si el espejo del servidor es más reciente que lo guardado en este
   * dispositivo, se adopta; si no, se mantiene lo local y se reenvía al servidor.
   */
  function adoptServerPrefs(serverPrefs) {
    if (!serverPrefs || typeof serverPrefs !== 'object') return;
    var serverAt = serverPrefs.updatedAt || null;
    var localAt = current.updatedAt || null;
    if (serverAt && (!localAt || serverAt > localAt)) {
      var values = {};
      Object.keys(DEFAULTS).forEach(function (k) {
        if (serverPrefs[k] !== undefined) values[k] = serverPrefs[k];
      });
      current = { updatedAt: serverAt, values: values };
      writeStored(currentScope, current);
      applyPrefs();
      notify();
    } else if (localAt && (!serverAt || localAt > serverAt)) {
      queueServerSync();
    }
  }

  // --- API pública ------------------------------------------------------------------------------
  function get(name) {
    if (!current) load();
    var v = current.values[name];
    return v === undefined ? DEFAULTS[name] : v;
  }

  function all() {
    if (!current) load();
    return Object.assign({}, DEFAULTS, current.values);
  }

  function notify() {
    var snapshot = all();
    LISTENERS.forEach(function (cb) { try { cb(snapshot); } catch (e) { console.info('prefs listener', e); } });
  }

  function set(name, value) {
    if (!(name in DEFAULTS)) return;
    if (!current) load();
    if (get(name) === value) return;
    current.values[name] = value;
    current.updatedAt = new Date().toISOString();
    writeStored(currentScope, current);
    applyPrefs();
    notify();
    queueServerSync();
  }

  function reset() {
    if (!current) load();
    current = { updatedAt: new Date().toISOString(), values: {} };
    writeStored(currentScope, current);
    applyPrefs();
    notify();
    queueServerSync();
  }

  /** Relee el ámbito (tras iniciar o cerrar sesión) y reaplica lo que corresponda a esa cuenta. */
  function reload() {
    var before = currentScope;
    load();
    applyPrefs();
    if (before !== currentScope) notify();
  }

  function onChange(cb) { if (typeof cb === 'function') LISTENERS.push(cb); }

  load();
  applyPrefs(); // en el <head>: el tema queda puesto antes de que se pinte nada

  global.NaturDexPrefs = {
    DEFAULTS: DEFAULTS,
    get: get,
    all: all,
    set: set,
    reset: reset,
    reload: reload,
    onChange: onChange,
    apply: applyPrefs,
    resolvedTheme: resolvedTheme,
    adoptServerPrefs: adoptServerPrefs,
    /** ¿Hay que evitar animaciones? Preferencia de la app O ajuste del sistema. */
    prefersReducedMotion: function () {
      if (get('reduceMotion')) return true;
      return !!(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }
  };
})(window);
