# Prompt: completar el modo sin conexión (teselas del mapa, tutorial y revalidación al recuperar red)

> Prompt para Claude Code sobre el repo NaturDex. Contexto: el modo sin conexión ya existe en
> tres capas (`Frontend/Js/offline.js` capas 1 y 2, `Frontend/sw.js` capa 3) y funciona, pero
> tiene tres huecos: el mapa base no está disponible offline, el tutorial no explica cuándo
> guardar el parque, y lo guardado nunca se revalida al recuperar cobertura.

---

## Contexto del estado actual (verificado en el código, no reinvestigar desde cero)

**Capa 1 — JSON en localStorage.** `NaturDexOffline.fetchJsonCached(url)` es network-first con
`cache: 'no-cache'` y guarda cada respuesta en `naturdex.res.<url>`. Visitar un parque online una
vez ya deja su `manifest.json`, `park.json` y GeoJSON disponibles offline.

**Capa 2 — "Guardar sin conexión".** `saveParkOffline(manifest, onProgress)` mete
`manifest.images` + `manifest.audio` en una Cache Storage por parque (`naturdex-park-<slug>`) con
`cache.add()`, y añade el slug a `naturdex.savedParks`. `forgetPark(slug)` lo deshace.

**Capa 3 — Service Worker (`sw.js`, `VERSION = 'v37'`).** Network-first en el mismo origen, con
`cache: 'no-cache'` forzado para HTML/CSS/JS, `updateViaCache: 'none'` al registrar y un
`location.reload()` único en `controllerchange`. En `activate` borra `naturdex-runtime-*` /
`naturdex-shell-*` / `naturdex-data-*` viejas pero **respeta a propósito** las `naturdex-park-*`.

**Progreso.** Local-first: `persistProgress()` guarda en
`naturdex.progress.<u<id>|anon>:<slug>` y luego intenta `POST /progress.php`. `loadProgress()`
aplica el local al instante y fusiona **por unión** lo que devuelve el servidor.

**Mapa.** `Frontend/Js/map.js` define dos capas base: `baseOSM`
(`https://{s}.tile.openstreetmap.org/...`, maxZoom 19) y `basePNOA` (WMTS del IGN, maxZoom 19).
El manifiesto ya reserva un campo `tiles`, hoy siempre `null`.

**Restricción del repo.** El Frontend es zero-dep (`package.json` solo trae `polygon-clipping`,
y es para el tooling de `Tools/catalogo-nacional`, no para la app). Leaflet y markercluster se
cargan por `<script>` desde unpkg. Cualquier dependencia nueva del Frontend hay que justificarla
explícitamente y, si entra, se vendoriza en el repo — no se añade un `npm install` a la app.

---

## Tarea 1 — Mapa base disponible sin conexión

Hoy offline se ve la geometría vectorial del parque sobre un fondo vacío, porque las teselas son
de otro dominio y `sw.js` ignora a propósito todo lo que no sea del mismo origen.

Antes de escribir código, **propón y justifica un enfoque** entre estas opciones (y dime cuál
recomiendas y por qué, teniendo en cuenta el zero-dep y que el peso lo descarga un móvil en 4G
antes de entrar al parque):

- **A) Teselas raster empaquetadas por parque.** Un script en `Tools/` que recorta el bbox del
  parque a un rango de zooms acotado y produce un único archivo servido desde nuestro dominio.
  Sin librería nueva, pero hay que resolver el empaquetado y el servidor de rangos.
- **B) PMTiles.** Un `.pmtiles` por parque, leído por rangos HTTP. Es el formato pensado para
  esto, pero implica vendorizar `pmtiles.js` (+ `protomaps-leaflet` si se va a vectorial).
- **C) Prefetch de teselas a Cache Storage.** Durante "Guardar sin conexión", recorrer las
  URLs de tesela del bbox × zooms y meterlas en `naturdex-park-<slug>-tiles`, más un
  `L.TileLayer` propio que resuelva desde esa caché cuando la red falle. Cero librerías y muy
  poco código nuevo, pero son miles de peticiones cruzadas y hay que respetar los límites de
  uso del proveedor.

Requisitos, sea cual sea el enfoque:

- Rellenar de verdad el campo `tiles` del manifiesto (`Data/parks/<ccaa>/<slug>/manifest.json`)
  con lo que necesite el enfoque elegido: ruta o rutas del paquete, bbox, rango de zooms,
  tamaño en bytes y atribución. Actualizar `Tools/validate-park-data.js` para validarlo y el
  generador de manifiestos que corresponda.
- **Acotar el peso**: zooms altos solo dentro del límite del parque, no del bbox completo.
  Fijar un presupuesto por parque (propón una cifra; algo del orden de 20–40 MB) y hacer que el
  script falle si se pasa.
- **Mostrar el coste antes de descargar.** El botón "Guardar sin conexión" debe pasar a decir
  el tamaño total (p. ej. "Guardar sin conexión · 34 MB") y pedir confirmación explícita si
  supera un umbral. Hoy `initOfflineUI` en `app.js` solo cuenta `manifest.images.length`; el
  contador de progreso tiene que incluir el mapa.
- **Licencias.** OSM y PNOA/IGN no permiten descarga masiva sin condiciones. Revisa la política
  de uso de cada uno antes de decidir, documenta en el PR qué permite cada fuente y mantén la
  atribución visible también en modo offline. Si una de las dos fuentes no es viable
  legalmente, dilo y propón alternativa en lugar de implementarla igualmente.
- Degradación limpia: si el parque no tiene paquete de teselas o el navegador no soporta lo que
  haga falta, se sigue viendo la geometría sobre fondo vacío como ahora, sin errores en consola.
- Actualizar la cabecera de `offline.js`, que hoy documenta esta laguna como pendiente.

## Tarea 2 — El tutorial debe decir cuándo activar el guardado sin conexión

En `Frontend/Js/tutorial.js`, el array `STAGES` tiene dos etapas y el guardado offline solo
aparece de refilón, en la última frase del último paso de la etapa del parque ("…y guardar el
parque para usarlo sin cobertura"), sin señalar el botón.

- Añade un **paso propio** en la etapa del parque, con `target: '#saveOfflineBtn'` y
  `mobileTab: 'map'` (comprueba en qué pestaña móvil queda visible el botón y ajusta), colocado
  antes del paso de cierre "Y un último apunte".
- El texto debe transmitir **cuándo y por qué**, no solo qué hace el botón: descargar el parque
  **estando en casa con wifi, antes de salir de ruta**, porque en muchos parques no hay
  cobertura; que incluye fichas, fotos, audioguías y el mapa; y que ocupa espacio en el móvil
  (menciona el tamaño si la Tarea 1 ya lo expone). Tono cercano y en español, como el resto de
  los pasos.
- Quita de "Y un último apunte" la mención al guardado, que quedaría duplicada.
- El paso solo debe aparecer si el botón existe y es visible: el posicionador ya usa
  `firstVisible(step.target)`, verifica que un `target` ausente no rompa la numeración
  ("Paso N de M") ni los puntos indicadores.
- Considera además un aviso puntual y no intrusivo cuando el usuario entra a un parque **no
  guardado estando online** (una sola vez por parque, recordable con localStorage). No lo
  conviertas en un modal que estorbe.

## Tarea 3 — Revalidar al recuperar la conexión

Esto es lo que **hoy no funciona**, confirmado leyendo el código. Trátalo como corrección de
errores, no como mejora opcional:

1. **Las fotos y audios de un parque guardado nunca se refrescan.** `saveParkOffline` usa
   `cache.add()` una sola vez y `naturdex.savedParks` guarda solo el slug, sin versión. Si el
   manifiesto sube de `version: 1` a `2` con fotos nuevas o corregidas, el dispositivo se queda
   con las viejas para siempre; solo `forgetPark` + volver a guardar lo arregla. Guarda la
   `version` (y `updatedAt`) junto al slug, compara al arrancar contra el manifiesto fresco y,
   si hay versión nueva, revalida en segundo plano y avisa al usuario de forma discreta antes
   de gastarle datos móviles.

2. **El progreso marcado sin cobertura no llega nunca al servidor.** `persistProgress()` guarda
   en local y, si el `POST` falla, solo hace `console.info` — no hay reintento. Y
   `loadProgress()` únicamente hace `GET` y fusiona servidor → local: nada sube local →
   servidor. Resultado: las especies marcadas offline se quedan en el móvil y no cuentan para
   los logros de cuenta. Implementa una **cola de pendientes** persistida en localStorage que
   se vacíe al recuperar conexión y al arrancar, idempotente (reenviar dos veces el mismo
   "visto" no debe duplicar nada) y con la unión ya existente como red de seguridad. Revisa si
   `Backend/progress.php` necesita aceptar un lote además de eventos sueltos.

3. **Nada reacciona al volver la conexión en caliente.** El único `onConnectivityChange` de la
   app (`app.js:404`) solo cambia el texto de la etiqueta "En línea / Sin conexión". Engancha
   ahí el vaciado de la cola del punto 2, la revalidación del punto 1 y la
   `syncWithServer()` de `achievements.js` (que hoy solo corre al arrancar, tras un
   `isOnline()`). Cuidado con no disparar tormentas de peticiones si la conectividad va y
   viene: aplica debounce y evita solapar sincronizaciones.

4. **Los JSON solo se refrescan al recargar la página.** `fetchJsonCached` es network-first,
   así que la copia de localStorage se actualiza sola… pero únicamente cuando algo vuelve a
   pedir esa URL, es decir al recargar o cambiar de parque. Decide si merece la pena revalidar
   en caliente al volver la red o si basta documentarlo como comportamiento aceptado. Justifica
   la decisión.

5. **Leaflet y markercluster vienen de unpkg**, y `sw.js` ignora a propósito todo lo que no sea
   del mismo origen. Comprueba si la app realmente arranca sin red en frío: si no lo hace
   porque falta `L`, hay que vendorizar Leaflet y markercluster en `Frontend/` y meterlos en
   `SHELL_ASSETS`. Verifícalo antes de cambiar nada — puede que la caché HTTP del navegador lo
   esté tapando en pruebas.

Al terminar, **sube `VERSION` en `sw.js`** y revisa que la limpieza de `activate` siga sin borrar
las cachés de parques guardados (ni las nuevas de teselas, si la Tarea 1 crea alguna).

---

## Cómo trabajar

1. Empieza leyendo `Frontend/Js/offline.js`, `Frontend/sw.js`, `Frontend/Js/data.js`,
   `Frontend/Js/map.js`, `Frontend/Js/tutorial.js` y `initOfflineUI` en `Frontend/Js/app.js`.
2. **Antes de escribir código**, expón tu plan: enfoque elegido para la Tarea 1 con su
   justificación, y el orden en que abordarás las tres tareas. Espera confirmación.
3. Respeta el estilo del repo: comentarios en español explicando el *por qué* (no el *qué*),
   ES modules en `Js/` salvo `offline.js` y `auth.js` que son scripts clásicos, y sin
   dependencias nuevas en la app sin justificarlo.
4. Cambios pequeños y revisables. Si una tarea se desmadra, párate y coméntalo.

## Verificación exigida

No des nada por terminado sin comprobarlo, y dime explícitamente qué probaste y qué viste:

- **Offline en frío**: DevTools → Network → Offline, cerrar y reabrir la pestaña. La app arranca,
  entra al parque guardado y se ve el mapa base, no un fondo vacío.
- **Revalidación**: guardar un parque, subir `version` en su manifiesto y cambiar una imagen,
  recargar online → el dispositivo se queda con la nueva.
- **Cola de progreso**: marcar 3 especies offline, volver online → los 3 aparecen en
  `progress.php` y no duplicados. Repetir el proceso dos veces para confirmar idempotencia.
- **Tutorial**: recorrerlo entero en móvil y en escritorio, con el parque ya guardado y sin
  guardar. La numeración de pasos cuadra en los dos casos.
- **Peso real**: medir cuánto ocupa un parque guardado con teselas (`navigator.storage.estimate()`)
  y confirmar que respeta el presupuesto fijado.
- `npm run validate` en verde con los manifiestos actualizados.
