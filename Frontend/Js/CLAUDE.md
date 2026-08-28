# `Frontend/Js/` — índice de módulos

PWA sin framework y **sin paso de build**: módulos ES nativos que carga `index.html`. Cada fichero
abre con un comentario que explica *qué problema resuelve*; este índice sirve para decidir cuál abrir
sin tener que leer el resto.

> **Un módulo nuevo hay que añadirlo a `SHELL_ASSETS` en `Frontend/sw.js` y subir su `VERSION`.**
> Sin precachear, el modo sin conexión se rompe, y no lo detecta ningún test.

## Los tres barriles

`render.js`, `map.js` y `achievements.js` **ya no tienen lógica**: son índices que reexportan sus
carpetas. Quien los importa sigue escribiendo `from './map.js'` como siempre; para leer o tocar algo,
entra al trozo.

### `render/` — pintado del DOM

Leen el estado (`state.js`), escriben en los nodos (`dom.js`) y **siempre** generan HTML con la
plantilla `` html`` `` de `util.js` (escapado automático, anti-XSS). **No registran eventos de
usuario**: eso es de `app.js`.

| Trozo | Líneas | Qué pinta |
|---|---|---|
| `render/catalogo.js` | 145 | Catálogo en tres niveles: grupos de hábitats → hábitats → especies. El nivel de entrada lleva además la tarjeta **«Sin hábitat asignado»**, que es el tercer destino del nivel de especies junto a «un hábitat» y «todas»: las fichas que no cuelgan de ningún polígono. Existe porque son MAYORÍA en varios espacios —181 de 209 en Cañaverosa— y solo se llegaba a ellas por «Ver todas las especies», mezcladas y sin que nada dijera cuántas eran. Dice de qué están hechas, y son dos cosas distintas: las AVES no se adscriben a ningún polígono a propósito (regla nº 8 del `CLAUDE.md` raíz) y el resto es un hueco de evidencia |
| `render/resumen.js` | 109 | Cabecera del parque, ficha base (`status: basic`) y barra de progreso |
| `render/detalle.js` | 220 | Ficha de especie, de hábitat y de punto de interés. La de especie abre con el **cartel de advertencia** (`rareza.js`) cuando el taxón está amenazado o no tiene tramo calculado |
| `render/migratorias.js` | 55 | Pestaña de **aves migratorias**: las que el formulario del sitio Red Natura 2000 declara sin población permanente (`migratory`). La ficha que abren es la de especie de siempre — son catálogo del parque, no una colección aparte como las invasoras. La pestaña **se oculta sola** donde el espacio no tiene ninguna (`app.js · sincronizaPestanaMigratorias`) |
| `render/invasoras.js` | 55 | Pestaña de invasoras y su ficha |
| `render/progreso.js` | 300 | Progreso del parque, **medallero** de cuenta (rareza a la vista y techo del catálogo) e historial de salidas verificadas. Bajo las filas de hábitat va la línea que **reconcilia las dos barras**: «Especies» cuenta todo el catálogo y las filas de hábitat solo lo que cuelga de un polígono (28 de 209 en Cañaverosa), y sin decirlo eso se lee como que la app ha perdido la cuenta |
| `render/fallbacks.js` | 64 | Sustitutos de imagen rota (`window.__*Fallback`, los invoca el `onerror` del HTML generado). Sin exports |

### `map/` — todo lo que toca Leaflet

Orden de dependencia, de más básico a más alto. **Las acciones de la app las inyecta `app.js` con
`setMapHandlers()`**: ningún módulo de `map/` importa `app.js`, y por eso no hay ciclo.

| Trozo | Líneas | Qué resuelve |
|---|---|---|
| `map/core.js` | 274 | La instancia `map`, capas base (OSM/PNOA/`.pmtiles` del parque), planos propios y **`chromeInset()`** |
| `map/iconos.js` | 30 | Iconos DIV de especie, POI y posición del usuario |
| `map/tramas.js` | 64 | SVG a pelo: tramas por grupo de hábitat y recortes al propio recinto |
| `map/camara.js` | 145 | Encuadre (`focusOn`/`fitOn`/`revealOn`), entrada escalonada, punto azul, tamaño del contenedor |
| `map/marcadores.js` | 65 | Marcadores de especies y de puntos de interés |
| `map/capas.js` | 318 | Zonas protegidas, senderos, zonas de hábitat, resaltado y visibilidad por hábitat y por grupo |

> **Todo encuadre pasa por `chromeInset()`.** El `autoPan` de Leaflet solo garantiza que el globo
> entre en el *contenedor*, que en móvil está tapado arriba y abajo. Las etiquetas del mapa son
> fichas, no globos: abren donde se leen las fichas, con un solo modo de cerrarse.

### `achievements/` — progreso de cuenta y logros

El ámbito de almacenamiento es **la cuenta**, no el parque. La agregación local es un espejo
*best-effort* de `computeAccountAggregates()` de `Backend/Lib/account_progress.php`: la verdad la
tiene el servidor, y por eso `syncWithServer()` puede corregir lo que el cálculo local adelantó sin
conexión.

| Trozo | Líneas | Qué resuelve |
|---|---|---|
| `achievements/almacen.js` | 223 | Catálogo de logros, almacenamiento local por cuenta, clave canónica de especie, semana ISO |
| `achievements/agregacion.js` | 148 | El espejo local del agregado del backend |
| `achievements/celebracion.js` | 257 | La cola del cartel animado. Autocontenida: crea su propio DOM la primera vez |
| `achievements/sincronizacion.js` | 93 | Recalcula (local u online), evalúa y refresca `state.account` |
| `achievements/eventos.js` | 38 | Lo que llaman `app.js` y `glossary.js` cuando pasa algo |
| `achievements/arranque.js` | 42 | Migración invitado → cuenta registrada e `init` |

---

## `app.js` — el orquestador (984 líneas, **a propósito en un solo fichero**)

Se estudió partirlo y **no se partió**: sus secciones se llaman entre sí en ambos sentidos
(navegación ↔ vistas ↔ pestañas móviles, arranque ↔ UI de offline). Partirlo produciría media docena
de importaciones circulares y haría el código *más* difícil de seguir, no menos. Este índice de
secciones cumple la misma función: abre solo el rango que necesites.

| Líneas | Sección |
|---|---|
| 53–61 | Pila de navegación (`nav.js`) |
| 62–95 | **Empezar por arriba**: `vistaArriba()` y `estrenaFicha()`. Toda vista o ficha que se abre arranca por su encabezado, no por donde se quedó la anterior |
| 96–291 | Navegación del catálogo: entrar en grupo/hábitat/especie/POI/migratoria/invasora, volver atrás |
| 292–397 | Marcar visto / visitado, captura de avistamiento, aviso de «sin verificar» |
| 398–417 | Nivel de dato del espacio: ficha base vs. catálogo completo |
| 418–450 | Vistas (catálogo / migratorias / invasoras / progreso / diccionario) |
| 451–569 | Vistas móviles: nav inferior y ficha como *bottom-sheet* |
| 570–670 | Delegación de eventos (**todos los clicks entran por aquí**), incluida la foto que abre el visor y las puertas del diccionario |
| 671–696 | Modo explorador (`explorer.js`) |
| 697–866 | UI de estado offline: indicador de conexión y botón «Guardar sin conexión» |
| 867–984 | Arranque de la experiencia de un parque (`startParkExperience`) |

## Resto de módulos ES

| Módulo | Líneas | Qué resuelve |
|---|---|---|
| `state.js` | 255 | Única fuente de verdad del estado + selectores derivados y constantes. **`speciesSinHabitat()`** es lo que alimenta la tarjeta «Sin hábitat asignado» del catálogo, y `state.sinHabitatFocus` el nivel al que lleva. **`catalogSpecies()` resta las migratorias** —tienen pestaña propia y saldrían dos veces— sin tocar `speciesTotal`: siguen contando para el progreso y los logros. **Los selectores del catálogo devuelven la lista ya ordenada alfabéticamente**: el dato llega en un orden desde el `park.json` (por `id`) y en otro desde la API (`is_featured DESC, common_name ASC`), y ordenar aquí es lo que hace que el mismo parque se vea igual con y sin cobertura |
| `dom.js` | 75 | Referencias centralizadas a los nodos del DOM del parque |
| `data.js` | 297 | Registro, manifiesto, datos y geo + progreso local-first. **Todo lo que habla con red o caché pasa por aquí.** La API tiene prioridad sobre el `park.json` |
| `api.js` | 82 | **Único** punto de contacto con `Backend/Api/`: corte por tiempo, errores, `apiSignal()` |
| `util.js` | 320 | Helpers puros: sin estado, sin DOM, sin Leaflet. Aquí viven la plantilla `` html`` `` y el **colador alfabético español**, que ordena el catálogo, las chips de hábitat y el diccionario |
| `rareza.js` | 190 | La escalera de rareza **legal** en la app: el filtro del catálogo y el **cartel de advertencia** de las especies amenazadas. Misma escalera que `Tools/lib/rareza.js`, vista desde el otro lado. El cartel cita siempre la categoría y la norma, y una ficha **sin tramo calculado también avisa** (regla nº 9 del `CLAUDE.md` raíz) |
| `layers.js` | 279 | Panel de capas propio (sustituye al control nativo de Leaflet) |
| `habitat-groups.js` | 212 | **Los siete grupos de hábitat**, ordenados del mar hacia dentro. Trama y tinta idénticas en mapa, leyenda y catálogo. Criterio: código HIC |
| `presence.js` | 469 | **Presencia verificada**: la prueba de que estás dentro del espacio. Es lo que hace que los logros signifiquen algo |
| `explorer.js` | 365 | Modo explorador: GPS continuo, panel «cerca de ti», descubrimiento por proximidad |
| `profile.js` | 575 | Pantalla «Perfil y ajustes». Único sitio donde el usuario administra su cuenta |
| `tutorial.js` | 433 | Onboarding por pasos (*spotlight*). Dos tramos: `select` y `park`. **Bloqueante**: el fondo es inerte y solo se sale confirmando |
| `glossary.js` | 220 | Resalta tecnicismos en las descripciones y muestra su definición en llano. El popover **sigue** a su palabra al desplazarse, no se cierra |
| `diccionario.js` | 216 | El glosario entero como vista propia: alfabético, buscable y filtrable. **No tiene pestaña**: es nacional, no del espacio, y la fila de pestañas es la de las vistas del parque. Se entra por el icono de libro de la cabecera (`#diccionarioBtn`), por el enlace de los filtros en móvil y por el popover del glosario. La cabecera del módulo explica por qué |
| `visor.js` | 309 | La foto de la ficha a pantalla completa, con pellizco, doble toque y rueda. Solo sobre fotos reales: sobre un sustituto generado no abre |
| `fitosociologia.js` | 65 | Traduce la asociación fitosociológica a lenguaje llano **sin sustituir** la cita oficial |
| `audio.js` | 50 | Audioguías de POIs, senderos y hábitats. La transcripción es obligatoria (WCAG 1.2.1) |
| `notice.js` | 79 | Avisos discretos tipo *toast* |

## Scripts clásicos (NO son módulos ES)

Se cargan con `<script>` normal y se comunican por `window`. **No los conviertas a módulo sin
motivo**: cada uno tiene una razón para no serlo.

| Fichero | Líneas | Por qué es clásico |
|---|---|---|
| `auth.js` | 617 | IIFE. Flujo de pantallas y autenticación; expone `window.naturdexShowScreen` y llama a `window.startParkExperience` de `app.js`. Es la frontera entre el selector de parque (ligero) y la experiencia del parque (pesada) |
| `prefs.js` | 230 | Va en el `<head>`: tiene que aplicar el tema **antes del primer pintado** |
| `nav.js` | 253 | Pila de navegación y botón «atrás» del móvil. El historial se actualiza al final del turno, en microtarea: `history.go()` es asíncrono |
| `offline.js` | 297 | Almacenamiento local y funcionamiento sin cobertura |
| `../sw.js` | — | Service Worker **network-first**, para que la app nunca se atasque en una versión antigua |

## Deuda conocida en esta carpeta

- ~~`render/detalle.js` trae la etiqueta «Región de Murcia» escrita a mano.~~ — **resuelto el
  2026-08-27** (deuda nº 2). El rótulo de esa fila sale ahora de `species.regionalCcaa`, que viaja en
  el dato ficha a ficha: la misma especie puede estar catalogada distinto en dos comunidades y el
  rótulo tiene que decir de cuál habla. Sin ese campo se rotula «Comunidad autónoma» a secas, que es
  lo único cierto cuando el dato no lo aclara — **no** se pone una comunidad por defecto.

Contexto de producto —por qué la cabecera es así, por qué los grupos son siete, por qué el offline
tiene tres capas— en [`Docs/arquitectura/APLICACION.md`](../../Docs/arquitectura/APLICACION.md).
