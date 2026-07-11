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
 *   2. "Guardar sin conexión" (botón): además de lo anterior, descarga las imágenes (binarias) a la
 *      Cache Storage del navegador y registra el parque como guardado. Requiere Cache Storage.
 *   3. Service Worker (sw.js): cachea el propio armazón de la app (HTML/CSS/JS) para que arranque
 *      sin red. Es una mejora progresiva; si no está disponible, las capas 1 y 2 siguen funcionando.
 *
 * Lo único que NO queda offline todavía son las teselas del mapa base (OSM/PNOA): son de otro
 * dominio y demasiado voluminosas. Offline se ve la geometría del parque sobre un fondo vacío.
 * Para uso 100% offline haría falta empaquetar teselas por parque (PMTiles/MBTiles) en el futuro.
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
  function savedParks() { return getJSON(key('savedParks')) || []; }
  function isParkSaved(slug) { return savedParks().indexOf(slug) !== -1; }
  function markParkSaved(slug) {
    var list = savedParks();
    if (list.indexOf(slug) === -1) { list.push(slug); setJSON(key('savedParks'), list); }
  }
  function forgetPark(slug) {
    setJSON(key('savedParks'), savedParks().filter(function (s) { return s !== slug; }));
    removeKey(key('manifest', slug));
    if (global.caches) { global.caches.delete(NS + '-park-' + slug).catch(function () {}); }
  }

  /**
   * Guarda un parque para uso sin conexión: cachea su manifiesto y descarga las imágenes a la
   * Cache Storage. Los JSON (datos y geo) ya se cachean solos al cargarse (capa 1).
   * onProgress(hecho, total) opcional.
   */
  async function saveParkOffline(manifest, onProgress) {
    if (!manifest || !manifest.slug) throw new Error('manifiesto inválido');
    setJSON(key('manifest', manifest.slug), manifest);

    var images = manifest.images || [];
    var total = images.length;
    var done = 0;
    if (typeof onProgress === 'function') onProgress(done, total);

    if (global.caches && total) {
      var cache = await global.caches.open(NS + '-park-' + manifest.slug);
      for (var i = 0; i < images.length; i++) {
        try { await cache.add(images[i]); } catch (e) { /* imagen no crítica */ }
        done++;
        if (typeof onProgress === 'function') onProgress(done, total);
      }
    }
    markParkSaved(manifest.slug);
    return { slug: manifest.slug, cachedImages: done, totalImages: total, cacheStorage: !!global.caches };
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
  function registerServiceWorker() {
    if (!('serviceWorker' in global.navigator)) return Promise.resolve(null);
    return global.navigator.serviceWorker.register('sw.js')
      .then(function (reg) { console.info('NaturDexOffline: Service Worker registrado'); return reg; })
      .catch(function (e) { console.info('NaturDexOffline: Service Worker no disponible', e); return null; });
  }

  global.NaturDexOffline = {
    supportsLocalStorage: hasLS,
    fetchJsonCached: fetchJsonCached,
    cacheResource: cacheResource,
    cachedResource: cachedResource,
    savedParks: savedParks,
    isParkSaved: isParkSaved,
    saveParkOffline: saveParkOffline,
    forgetPark: forgetPark,
    loadProgressLocal: loadProgressLocal,
    saveProgressLocal: saveProgressLocal,
    isOnline: isOnline,
    onConnectivityChange: onConnectivityChange,
    registerServiceWorker: registerServiceWorker
  };
})(window);
