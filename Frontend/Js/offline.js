/*
 * NaturDexOffline — capa de almacenamiento local y funcionamiento sin conexión.
 *
 * Problema que resuelve: muchos parques naturales no tienen cobertura. La app debe poder cargar
 * un parque ya visitado (o descargado a propósito) sin red.
 *
 * Estrategia por capas (de más garantizada a más completa):
 *   1. Caché automática en localStorage de todo JSON que se descarga (índice, manifiesto, datos del
 *      parque y geometría). Con solo visitar un parque online una vez, sus datos y mapas vectoriales
 *      quedan disponibles offline la próxima vez. No requiere Service Worker.
 *   2. "Guardar sin conexión" (botón): además de lo anterior, descarga los binarios del parque
 *      (fotos, audioguías y el paquete de teselas del mapa base) a la Cache Storage del navegador
 *      y registra el parque como guardado, con su versión. Requiere Cache Storage.
 *   3. Service Worker (sw.js): cachea el propio armazón de la app (HTML/CSS/JS) para que arranque
 *      sin red. Es una mejora progresiva; si no está disponible, las capas 1 y 2 siguen funcionando.
 *      También sirve por RANGOS el .pmtiles guardado en la capa 2: su lector pide trozos sueltos y
 *      rechaza un 200 con el fichero entero, así que sin ese troceado el mapa base offline no arranca.
 *
 * Al recuperar cobertura hay que ponerse al día en dos sentidos, y los dos se orquestan desde
 * initOfflineUI (app.js) enganchando onConnectivityChange:
 *   - BAJADA: si el manifiesto del servidor subió de versión, los binarios guardados están viejos.
 *     parkNeedsRevalidation lo detecta y revalidateParkOffline los repone. Nunca se descarga solo:
 *     puede ser mucho peso sobre datos móviles, así que lo dispara el usuario desde un aviso.
 *   - SUBIDA: lo marcado sin cobertura vive en una cola persistida (queuePending) que data.js
 *     vacía contra el backend. Reenviar un evento dos veces es inocuo (progress.php trabaja por
 *     unión), así que la cola puede reintentar sin miedo a duplicar.
 *
 * Decisión consciente: los JSON (capa 1) NO se revalidan al volver la red, solo cuando algo vuelve
 * a pedir esa URL (recargar o cambiar de parque). Lo que de verdad cambia en un parque va marcado
 * por la `version` del manifiesto, que sí se comprueba arriba; refrescar además todos los JSON al
 * reconectar duplicaría peticiones para un dato que el usuario no está mirando cambiar.
 */
(function (global) {
  'use strict';

  var NS = 'naturdex';
  var hasLS = (function () {
    try { var k = NS + '.__t'; localStorage.setItem(k, '1'); localStorage.removeItem(k); return true; }
    catch (e) { return false; }
  })();

  function key() { return NS + '.' + Array.prototype.join.call(arguments, '.'); }

  function getJSON(k) {
    if (!hasLS) return null;
    try { var v = localStorage.getItem(k); return v == null ? null : JSON.parse(v); }
    catch (e) { return null; }
  }

  function setJSON(k, val) {
    if (!hasLS) return false;
    try { localStorage.setItem(k, JSON.stringify(val)); return true; }
    catch (e) { console.info('NaturDexOffline: no se pudo guardar en localStorage (' + k + ')', e); return false; }
  }

  function removeKey(k) { if (hasLS) { try { localStorage.removeItem(k); } catch (e) {} } }

  // --- Caché genérica de recursos JSON por URL (capa 1) ---------------------------------------
  function cacheResource(url, data) { setJSON(key('res', url), data); }
  function cachedResource(url) { return getJSON(key('res', url)); }

  /**
   * Descarga un JSON por red y lo cachea; si la red falla, devuelve la copia cacheada.
   * Así, cualquier recurso visitado una vez queda disponible offline automáticamente.
   */
  async function fetchJsonCached(url) {
    try {
      var r = await fetch(url, { cache: 'no-cache' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      var data = await r.json();
      cacheResource(url, data);
      return { data: data, fromCache: false };
    } catch (e) {
      var cached = cachedResource(url);
      if (cached != null) { console.info('NaturDexOffline: usando copia offline de ' + url); return { data: cached, fromCache: true }; }
      throw e;
    }
  }

  // --- Registro de parques guardados a propósito (capa 2) --------------------------------------
  // Cada entrada es { slug, version, updatedAt, savedAt }. La versión es imprescindible: sin ella
  // no había forma de saber que el manifiesto del servidor había cambiado, así que un parque
  // guardado se quedaba con sus fotos viejas para siempre (solo forgetPark + volver a guardar lo
  // arreglaba). Los dispositivos que ya tenían la lista antigua (array de slugs "pelados") se
  // migran al leer, sin versión conocida: se tratan como "hay que revalidar".
  function savedParkEntries() {
    var raw = getJSON(key('savedParks')) || [];
    if (!Array.isArray(raw)) return [];
    var migrated = false;
    var list = [];
    for (var i = 0; i < raw.length; i++) {
      var e = raw[i];
      if (typeof e === 'string') { migrated = true; list.push({ slug: e, version: null, updatedAt: null, savedAt: null }); }
      else if (e && e.slug) list.push(e);
    }
    if (migrated) setJSON(key('savedParks'), list);
    return list;
  }
  function savedParks() { return savedParkEntries().map(function (e) { return e.slug; }); }
  function savedParkInfo(slug) {
    var found = savedParkEntries().filter(function (e) { return e.slug === slug; });
    return found.length ? found[0] : null;
  }
  function isParkSaved(slug) { return !!savedParkInfo(slug); }

  function markParkSaved(manifest) {
    var list = savedParkEntries().filter(function (e) { return e.slug !== manifest.slug; });
    list.push({
      slug: manifest.slug,
      version: manifest.version != null ? manifest.version : null,
      updatedAt: manifest.updatedAt || null,
      savedAt: new Date().toISOString()
    });
    setJSON(key('savedParks'), list);
  }

  function forgetPark(slug) {
    setJSON(key('savedParks'), savedParkEntries().filter(function (e) { return e.slug !== slug; }));
    removeKey(key('manifest', slug));
    if (global.caches) { global.caches.delete(NS + '-park-' + slug).catch(function () {}); }
  }

  /**
   * Activos binarios que hay que tener en la Cache Storage para que el parque funcione sin red.
   * Las audioguías (manifest.audio) pesan como las fotos y se descargan igual: sin ellas, el modo
   * sin conexión perdería justo el contenido pensado para escucharse en campo. El paquete de
   * teselas (manifest.tiles) es un único fichero .pmtiles con el mapa base del parque.
   */
  function parkAssets(manifest) {
    var assets = (manifest.images || []).concat(manifest.audio || []);
    if (manifest.tiles && manifest.tiles.pmtiles) assets.push(manifest.tiles.pmtiles);
    return assets;
  }

  /** Bytes que ocupará guardar el parque, según lo declarado en el manifiesto. */
  function parkDownloadBytes(manifest) {
    if (!manifest) return 0;
    var bytes = 0;
    if (manifest.tiles && manifest.tiles.bytes) bytes += manifest.tiles.bytes;
    if (manifest.counts && manifest.counts.assetBytes) bytes += manifest.counts.assetBytes;
    return bytes;
  }

  /**
   * Descarga los activos del parque a su Cache Storage. `reload` fuerza saltarse la caché HTTP del
   * navegador: es lo que distingue revalidar (traer la foto corregida) de guardar por primera vez.
   * onProgress(hecho, total) opcional. Los JSON (datos y geo) se cachean solos al cargarse (capa 1).
   */
  async function storeParkAssets(manifest, onProgress, reload) {
    if (!manifest || !manifest.slug) throw new Error('manifiesto inválido');
    setJSON(key('manifest', manifest.slug), manifest);

    var assets = parkAssets(manifest);
    var total = assets.length;
    var done = 0;
    var failed = 0;   // la red se cayó: se puede reintentar y merece la pena decirlo
    var missing = 0;  // el servidor contesta 404: ese activo no existe todavía, reintentar no arregla nada
    if (typeof onProgress === 'function') onProgress(done, total);

    if (global.caches && total) {
      var cache = await global.caches.open(NS + '-park-' + manifest.slug);
      for (var i = 0; i < assets.length; i++) {
        try {
          var res = await fetch(assets[i], { cache: reload ? 'reload' : 'default' });
          // Los manifiestos declaran fotos que aún no se han subido al repo (el validador ya avisa
          // de ello). Tratar eso como un fallo dejaría el parque sin poder guardarse nunca.
          if (res.status >= 400 && res.status < 500) { missing++; }
          else if (!res.ok) { throw new Error('HTTP ' + res.status); }
          else { await cache.put(assets[i], res); }
        } catch (e) { failed++; /* activo no crítico: el parque sigue siendo usable sin él */ }
        done++;
        if (typeof onProgress === 'function') onProgress(done, total);
      }
      // Lo que ya no está en el manifiesto se borra: si no, una foto retirada seguiría ocupando
      // espacio en el móvil para siempre.
      try {
        var wanted = {};
        assets.forEach(function (a) { wanted[new URL(a, global.location.href).href] = true; });
        var keys = await cache.keys();
        for (var k = 0; k < keys.length; k++) {
          if (!wanted[keys[k].url]) await cache.delete(keys[k]);
        }
      } catch (e) { /* la poda es best-effort */ }
    }
    // La versión solo se apunta si no se cayó la red: si se cortó a mitad, el parque queda como
    // pendiente en vez de darse por bueno con los activos incompletos. Que falten fotos aún no
    // subidas (404) no impide guardarlo: el parque es perfectamente usable sin ellas.
    if (!failed) markParkSaved(manifest);
    return {
      slug: manifest.slug, totalImages: total, cacheStorage: !!global.caches,
      cachedImages: done - failed - missing, failed: failed, missing: missing
    };
  }

  function saveParkOffline(manifest, onProgress) { return storeParkAssets(manifest, onProgress, false); }
  function revalidateParkOffline(manifest, onProgress) { return storeParkAssets(manifest, onProgress, true); }

  /**
   * ¿El manifiesto fresco es más nuevo que lo que hay guardado en el dispositivo? Solo tiene
   * sentido para parques guardados a propósito: los demás no tienen binarios que refrescar.
   * Una entrada sin versión (guardada antes de que existiera este control) cuenta como desfasada.
   */
  function parkNeedsRevalidation(manifest) {
    if (!manifest || !manifest.slug) return false;
    var info = savedParkInfo(manifest.slug);
    if (!info) return false;
    if (info.version == null) return true;
    return String(info.version) !== String(manifest.version != null ? manifest.version : '') ||
           String(info.updatedAt || '') !== String(manifest.updatedAt || '');
  }

  // --- Cola de envíos pendientes (lo hecho sin cobertura, a la espera de red) -------------------
  // Primitivas genéricas y sin conocimiento de la API: quién sabe qué significa cada evento y a
  // qué endpoint va es data.js. Aquí solo se persiste para que sobreviva a cerrar la app.
  var PENDING_MAX = 500; // tope de seguridad: localStorage es finito y una cola infinita lo llena
  function pendingQueue() {
    var q = getJSON(key('pending'));
    return Array.isArray(q) ? q : [];
  }
  function setPendingQueue(list) { setJSON(key('pending'), list.slice(-PENDING_MAX)); }
  function queuePending(entry) {
    var q = pendingQueue();
    q.push(entry);
    setPendingQueue(q);
    return q.length;
  }

  // --- Progreso del usuario, local primero (offline-safe) --------------------------------------
  function progressKey(slug) { return key('progress', slug); }
  function loadProgressLocal(slug) {
    return getJSON(progressKey(slug)) || { seenSpeciesIds: [], seenPoiIds: [], sightings: {}, updatedAt: null };
  }
  function saveProgressLocal(slug, progress) { setJSON(progressKey(slug), progress); }

  // --- Conectividad ----------------------------------------------------------------------------
  function isOnline() { return global.navigator ? global.navigator.onLine !== false : true; }
  function onConnectivityChange(cb) {
    if (!global.addEventListener) return;
    global.addEventListener('online', function () { cb(true); });
    global.addEventListener('offline', function () { cb(false); });
  }

  // --- Service Worker (mejora progresiva, capa 3) ----------------------------------------------
  // Se registra una sola vez aunque se llame desde varios sitios (auth.js y app.js lo invocan).
  var swRegistered = false;
  function registerServiceWorker() {
    if (!('serviceWorker' in global.navigator)) return Promise.resolve(null);
    if (swRegistered) return Promise.resolve(null);
    swRegistered = true;
    var swc = global.navigator.serviceWorker;

    // Cuando ENTRA en control una versión NUEVA del SW (tras skipWaiting + clients.claim en sw.js),
    // se recarga una vez para servir el armazón fresco. Clave en el móvil: sin esto la página seguía
    // corriendo el HTML/JS ya cargado hasta que el usuario cerraba y reabría. En la PRIMERA
    // instalación no había controlador previo, así que no se recarga (la carga ya fue de red).
    var hadController = !!swc.controller;
    var reloaded = false;
    swc.addEventListener('controllerchange', function () {
      if (reloaded || !hadController) return;
      reloaded = true;
      global.location.reload();
    });

    // updateViaCache:'none' evita que el navegador sirva el propio sw.js desde su caché HTTP: sin
    // esto, un móvil podía no detectar nunca la versión nueva del Service Worker.
    return swc.register('sw.js', { updateViaCache: 'none' })
      .then(function (reg) {
        console.info('NaturDexOffline: Service Worker registrado');
        try { reg.update(); } catch (e) {} // fuerza comprobación de actualización al arrancar
        return reg;
      })
      .catch(function (e) { console.info('NaturDexOffline: Service Worker no disponible', e); return null; });
  }

  global.NaturDexOffline = {
    supportsLocalStorage: hasLS,
    fetchJsonCached: fetchJsonCached,
    cacheResource: cacheResource,
    cachedResource: cachedResource,
    savedParks: savedParks,
    savedParkInfo: savedParkInfo,
    isParkSaved: isParkSaved,
    saveParkOffline: saveParkOffline,
    revalidateParkOffline: revalidateParkOffline,
    parkNeedsRevalidation: parkNeedsRevalidation,
    parkDownloadBytes: parkDownloadBytes,
    forgetPark: forgetPark,
    pendingQueue: pendingQueue,
    setPendingQueue: setPendingQueue,
    queuePending: queuePending,
    loadProgressLocal: loadProgressLocal,
    saveProgressLocal: saveProgressLocal,
    isOnline: isOnline,
    onConnectivityChange: onConnectivityChange,
    registerServiceWorker: registerServiceWorker
  };
})(window);
