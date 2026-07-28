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
var VERSION = 'v42';
var RUNTIME_CACHE = 'naturdex-runtime-' + VERSION;

// Armazón mínimo que se intenta precachear en la instalación (best-effort).
// Vendor/* son Leaflet y markercluster (antes en unpkg). Van aquí porque el `fetch` de más abajo
// ignora a propósito todo lo que no es del mismo origen: desde un CDN jamás llegaban a la caché y,
// como map.js usa `L` al importarse, la app no arrancaba sin cobertura. Los PNG de leaflet/images
// hacen falta de verdad: el mapa de España (auth.js) usa el marcador por defecto de Leaflet.
var SHELL_ASSETS = ['index.html', 'Css/styles.css', 'manifest.webmanifest', 'Img/icon-192.png', 'Img/icon-512.png', 'Vendor/leaflet/leaflet.js', 'Vendor/leaflet/leaflet.css', 'Vendor/leaflet/images/marker-icon.png', 'Vendor/leaflet/images/marker-icon-2x.png', 'Vendor/leaflet/images/marker-shadow.png', 'Vendor/leaflet/images/layers.png', 'Vendor/leaflet/images/layers-2x.png', 'Vendor/markercluster/leaflet.markercluster.js', 'Vendor/markercluster/MarkerCluster.css', 'Vendor/markercluster/MarkerCluster.Default.css', 'Vendor/protomaps/protomaps-leaflet.js', 'Js/offline.js', 'Js/prefs.js', 'Js/util.js', 'Js/state.js', 'Js/dom.js', 'Js/data.js', 'Js/render.js', 'Js/map.js', 'Js/layers.js', 'Js/explorer.js', 'Js/audio.js', 'Js/glossary.js', 'Js/tutorial.js', 'Js/achievements.js', 'Js/notice.js', 'Js/profile.js', 'Js/app.js', 'Js/auth.js', 'Data/glosario.json', 'Data/invasoras.json', 'Data/achievements.json'];

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

  // El armazón (HTML/CSS/JS) se revalida SIEMPRE contra el servidor (cache: 'no-cache'): sin esto,
  // la caché HTTP del navegador del móvil podía seguir sirviendo un styles.css / app.js viejo aunque
  // el Service Worker fuese network-first, y la app "no se actualizaba". Los datos e imágenes usan
  // la caché normal (rápida). Se detecta por el tipo de destino de la petición.
  var isShell = req.mode === 'navigate' ||
                req.destination === 'document' ||
                req.destination === 'script' ||
                req.destination === 'style';
  var netReq = isShell ? new Request(req, { cache: 'no-cache' }) : req;

  // Network-first: red si hay; si falla, lo que haya en caché; y para navegaciones, index.html.
  event.respondWith(
    fetch(netReq).then(function (res) {
      // Las respuestas parciales (206) no se pueden meter en la Cache Storage: cache.put lanza un
      // TypeError. Llegan de las peticiones por rangos del mapa base .pmtiles, que ya viaja entero
      // en la caché del parque (lo guarda offline.js), así que no hay nada que cachear aquí.
      if (res && res.ok && res.status !== 206 && !req.headers.get('range')) {
        var copy = res.clone();
        caches.open(RUNTIME_CACHE).then(function (cache) { cache.put(req, copy); })
          .catch(function () { /* cuota llena o respuesta no almacenable: no es crítico */ });
      }
      return res;
    }).catch(function () {
      return caches.match(req).then(function (cached) {
        if (cached) return sliceIfRangeRequest(req, cached);
        if (req.mode === 'navigate') return caches.match('index.html');
        return Promise.reject(new Error('sin red y sin caché para ' + req.url));
      });
    })
  );
});

/**
 * El mapa base sin conexión (.pmtiles) se lee por rangos HTTP: el lector pide "bytes=N-M" y exige
 * un 206 con Content-Length correcto — si le devuelves el fichero entero con un 200, aborta. En la
 * Cache Storage el .pmtiles está guardado completo, así que aquí se recorta a mano el trozo pedido.
 * Sin esto el mapa base offline no llega ni a arrancar.
 */
function sliceIfRangeRequest(req, cached) {
  var range = req.headers.get('range');
  if (!range) return cached;
  var match = /^bytes=(\d+)-(\d*)$/.exec(range.trim());
  if (!match) return cached;

  return cached.arrayBuffer().then(function (buffer) {
    var total = buffer.byteLength;
    var start = parseInt(match[1], 10);
    var end = match[2] === '' ? total - 1 : Math.min(parseInt(match[2], 10), total - 1);
    if (isNaN(start) || start > end || start >= total) {
      return new Response(null, {
        status: 416,
        headers: { 'Content-Range': 'bytes */' + total }
      });
    }
    var slice = buffer.slice(start, end + 1);
    return new Response(slice, {
      status: 206,
      statusText: 'Partial Content',
      headers: {
        'Content-Type': cached.headers.get('Content-Type') || 'application/octet-stream',
        'Content-Length': String(slice.byteLength),
        'Content-Range': 'bytes ' + start + '-' + end + '/' + total
      }
    });
  });
}
