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
// Subir esta versión invalida la caché del armazón. Hay que hacerlo SIEMPRE que cambie la lista de
// SHELL_ASSETS: un módulo nuevo que no esté precacheado deja la app rota sin cobertura, y la
// estrategia network-first no lo salva porque justo entonces no hay red de la que tirar.
// (v54 y no v53 porque `main` y esta rama subieron a v53 por separado, cada una con un armazón
// distinto: dejar las dos con el mismo número habría hecho que un cliente con una ya cacheada no
// se actualizara a la otra.)
// v55: entran Js/fitosociologia.js y Data/fitosociologia.json (lectura en llano de la asociación).
// v56: render.js, map.js y achievements.js se parten en Js/render/*, Js/map/* y Js/achievements/*.
//      Los tres siguen existiendo como barril (reexportan), así que quien los importa no cambia,
//      pero AHORA HAY 18 FICHEROS MÁS QUE PRECACHEAR: sin ellos el barril resuelve a un 404 y la
//      app no arranca sin cobertura. Es exactamente el fallo contra el que avisa el comentario de
//      arriba, y por eso la lista de abajo está agrupada por carpeta y no en una sola línea.
// v57: Fase 1 de usabilidad. Entran Js/visor.js (la foto de la ficha a pantalla completa) y, sobre
//      todo, LAS TIPOGRAFÍAS: Zilla Slab y Public Sans venían de fonts.googleapis.com y el fetch de
//      más abajo ignora a propósito todo lo que no es del mismo origen, así que sin cobertura la
//      app perdía su tipografía. Ahora son diez .woff2 en Vendor/fonts/ (~220 KB) más su hoja.
// v58: entra Js/diccionario.js (el glosario entero como vista propia). Data/glosario.json ya estaba
//      precacheado desde antes, así que el diccionario funciona sin cobertura desde el primer día.
// v59: Data/achievements.json sube a v3 (umbrales recalibrados, dos métricas nuevas y tres logros
//      más) y la rejilla pasa a ser un medallero. El JSON ya estaba precacheado, pero un cliente con
//      la v2 en caché seguiría evaluando con los umbrales viejos hasta que caducara el armazón.
var VERSION = 'v60';
var RUNTIME_CACHE = 'naturdex-runtime-' + VERSION;

// Armazón mínimo que se intenta precachear en la instalación (best-effort).
// Vendor/* son Leaflet y markercluster (antes en unpkg). Van aquí porque el `fetch` de más abajo
// ignora a propósito todo lo que no es del mismo origen: desde un CDN jamás llegaban a la caché y,
// como map.js usa `L` al importarse, la app no arrancaba sin cobertura. Los PNG de leaflet/images
// hacen falta de verdad: el mapa de España (auth.js) usa el marcador por defecto de Leaflet.
var SHELL_ASSETS = [
  // Armazón
  'index.html', 'Css/styles.css', 'Css/ranger.css', 'manifest.webmanifest',
  'Img/icon-192.png', 'Img/icon-512.png',

  // Vendor (Leaflet, markercluster, protomaps). Ver el comentario de arriba: nunca desde CDN.
  'Vendor/leaflet/leaflet.js', 'Vendor/leaflet/leaflet.css',
  'Vendor/leaflet/images/marker-icon.png', 'Vendor/leaflet/images/marker-icon-2x.png',
  'Vendor/leaflet/images/marker-shadow.png', 'Vendor/leaflet/images/layers.png',
  'Vendor/leaflet/images/layers-2x.png',
  'Vendor/markercluster/leaflet.markercluster.js', 'Vendor/markercluster/MarkerCluster.css',
  'Vendor/markercluster/MarkerCluster.Default.css',
  'Vendor/protomaps/protomaps-leaflet.js',

  // Tipografías (antes en fonts.googleapis.com, ver Vendor/fonts/fonts.css). Sin ellas precacheadas
  // la app se ve en la fuente del sistema justo donde más se usa: en el monte y sin cobertura.
  'Vendor/fonts/fonts.css',
  'Vendor/fonts/public-sans-normal-latin.woff2', 'Vendor/fonts/public-sans-normal-latin-ext.woff2',
  'Vendor/fonts/public-sans-italic-latin.woff2', 'Vendor/fonts/public-sans-italic-latin-ext.woff2',
  'Vendor/fonts/zilla-slab-500-latin.woff2', 'Vendor/fonts/zilla-slab-500-latin-ext.woff2',
  'Vendor/fonts/zilla-slab-600-latin.woff2', 'Vendor/fonts/zilla-slab-600-latin-ext.woff2',
  'Vendor/fonts/zilla-slab-700-latin.woff2', 'Vendor/fonts/zilla-slab-700-latin-ext.woff2',

  // Scripts clásicos (no módulos ES)
  'Js/offline.js', 'Js/nav.js', 'Js/prefs.js', 'Js/auth.js',

  // Módulos ES sueltos
  'Js/util.js', 'Js/state.js', 'Js/api.js', 'Js/habitat-groups.js', 'Js/dom.js', 'Js/data.js',
  'Js/layers.js', 'Js/explorer.js', 'Js/audio.js', 'Js/glossary.js', 'Js/fitosociologia.js',
  'Js/tutorial.js', 'Js/presence.js', 'Js/notice.js', 'Js/profile.js', 'Js/visor.js',
  'Js/diccionario.js', 'Js/app.js',

  // Barriles + sus trozos. El barril solo reexporta: SIN los trozos la app no arranca offline.
  'Js/render.js',
  'Js/render/fallbacks.js', 'Js/render/catalogo.js', 'Js/render/resumen.js',
  'Js/render/detalle.js', 'Js/render/invasoras.js', 'Js/render/progreso.js',

  'Js/map.js',
  'Js/map/core.js', 'Js/map/iconos.js', 'Js/map/tramas.js',
  'Js/map/camara.js', 'Js/map/marcadores.js', 'Js/map/capas.js',

  'Js/achievements.js',
  'Js/achievements/almacen.js', 'Js/achievements/agregacion.js', 'Js/achievements/celebracion.js',
  'Js/achievements/sincronizacion.js', 'Js/achievements/eventos.js', 'Js/achievements/arranque.js',

  // Datos del armazón
  'Data/glosario.json', 'Data/fitosociologia.json', 'Data/invasoras.json', 'Data/achievements.json'
];

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
