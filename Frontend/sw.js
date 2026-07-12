/*
 * Service Worker de NaturDex — mejora progresiva para el funcionamiento sin conexión.
 *
 * Estrategia: NETWORK-FIRST en todo lo del mismo origen. Estando online siempre se sirve la
 * versión fresca de la red (nada de contenido cacheado antiguo); la caché solo se usa como
 * respaldo cuando NO hay conexión. Así la app nunca queda "atascada" en una versión vieja, y a la
 * vez puede arrancar y explorarse sin cobertura.
 *
 * Es opcional: si el navegador no admite Service Workers, la app sigue funcionando con la caché en
 * localStorage y Cache Storage que gestiona offline.js.
 */
var VERSION = 'v4';
var RUNTIME_CACHE = 'naturdex-runtime-' + VERSION;

// Armazón mínimo que se intenta precachear en la instalación (best-effort).
var SHELL_ASSETS = ['index.html', 'Css/styles.css', 'Js/offline.js', 'Js/util.js', 'Js/app.js', 'Js/auth.js'];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(RUNTIME_CACHE).then(function (cache) {
      return Promise.all(SHELL_ASSETS.map(function (url) {
        return cache.add(url).catch(function () { /* no crítico en install */ });
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      // Borra cualquier caché de runtime/armazón/datos de versiones anteriores. NO toca las cachés
      // de parques guardados a propósito (naturdex-park-*), que gestiona offline.js.
      return Promise.all(names.map(function (name) {
        var isOurRuntime = name.indexOf('naturdex-runtime-') === 0 ||
                           name.indexOf('naturdex-shell-') === 0 ||
                           name.indexOf('naturdex-data-') === 0;
        if (isOurRuntime && name !== RUNTIME_CACHE) return caches.delete(name);
        return null;
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;

  var url = new URL(req.url);
  // Peticiones a otros dominios (teselas del mapa, CDN de Leaflet): directas a la red, sin gestionar.
  if (url.origin !== self.location.origin) return;

  // Network-first: red si hay; si falla, lo que haya en caché; y para navegaciones, index.html.
  event.respondWith(
    fetch(req).then(function (res) {
      if (res && res.ok) {
        var copy = res.clone();
        caches.open(RUNTIME_CACHE).then(function (cache) { cache.put(req, copy); });
      }
      return res;
    }).catch(function () {
      return caches.match(req).then(function (cached) {
        if (cached) return cached;
        if (req.mode === 'navigate') return caches.match('index.html');
        return Promise.reject(new Error('sin red y sin caché para ' + req.url));
      });
    })
  );
});
