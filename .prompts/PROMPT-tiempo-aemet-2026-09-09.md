# Prompt para Claude Code — el tiempo del espacio a visitar (AEMET OpenData)

Una sola tarea, en su propia rama. El bloque de «Contexto» está pensado para pegarse entero con el
resto.

---

## Contexto (pégalo con la tarea)

Trabajas en NaturDex (`C:\Users\Deathscythe\Desktop\NaturDex`), PWA offline-first sin build ni
framework: módulos ES nativos que carga `Frontend/index.html`. Backend PHP + MySQL en `Backend/`.

Antes de tocar nada lee el `CLAUDE.md` raíz, **`Frontend/Js/CLAUDE.md`** (índice de módulos) y
**`Backend/CLAUDE.md`** (índice de endpoints).

Reglas de la casa:

- **Todo en castellano**: código, comentarios, documentación y mensajes de commit.
- **Comentario de cabecera obligatorio** en cada módulo nuevo, y que explique *qué problema
  resuelve*, no qué hace. Si cambias el porqué de un bloque, reescribe su comentario.
- **`npm run validate` tiene que salir en verde** — bloquea el commit vía `.githooks/pre-commit`.
  Pasa también `npm test`.
- **Un módulo nuevo hay que reflejarlo en `SHELL_ASSETS` de `Frontend/sw.js` y subir su `VERSION`**
  (hoy `v67`). Sin eso el modo sin conexión se rompe y no lo detecta ningún test.
- Todo el HTML generado se compone con la plantilla `` html`` `` de `Frontend/Js/util.js` (escapado
  automático, anti-XSS). No concatenes cadenas a mano.
- Los módulos de `render/` **no registran eventos**: todos los clicks entran por la delegación de
  `app.js` (líneas ~606-734).
- Todo endpoint nuevo arranca con `apiBoot()` de `Backend/Lib/api.php` y responde con `respond()`.
  La forma del JSON se define **una sola vez** en `Backend/Lib/*_payload.php`.
- Comprueba el resultado a **320 px de ancho** y en escritorio (1280x720), y en **tema claro y
  oscuro** (`Frontend/Css/ranger.css` redefine bastante de `styles.css`).

---

# TAREA — Widget de condiciones meteorológicas del espacio

## Qué quiero

En la cabecera del parque, un widget que diga **qué tiempo va a hacer en el espacio que se va a
visitar**, con dato de **AEMET OpenData**. Su función es que alguien decida *si sale hoy*: se lee
antes de la excursión, no durante. Eso manda en todas las decisiones de abajo.

## Paso 0 — antes de escribir una línea

1. **Comprueba la documentación viva de AEMET OpenData** (`https://opendata.aemet.es/dist/index.html`,
   y el aviso legal / condiciones de uso del portal). Lo que dice este prompt sobre su API es lo que
   sabía quien lo escribió el 2026-09-09: si algo ha cambiado, manda la documentación, y **dilo en el
   comentario de cabecera del módulo**.
2. La `api_key` la da AEMET por correo tras darse de alta, y **la tiene que pedir Damián**: no
   intentes conseguirla ni inventes una. Escribe el código para que funcione con la clave puesta en
   una variable de entorno y **para que degrade limpiamente sin ella** (ver «Estados»), y déjalo
   escrito en `DEPLOY.md`.

## Las cuatro decisiones que hay que tomar y JUSTIFICAR en el comentario

### 1. Qué dato se pide

Candidatos de AEMET: predicción municipal **diaria** y **horaria**
(`/api/prediccion/especifica/municipio/{diaria|horaria}/{municipio}`), observación de estación
(`/api/observacion/convencional/datos/estacion/{idema}`) y predicción de **montaña** por áreas.

Mi apuesta, discútela: **predicción municipal diaria de hoy y mañana** como dato principal, porque
lo que se decide es si salir. La observación de estación es «qué está pasando ahora» en un punto que
puede estar a 30 km y a 800 m de desnivel del parque: si la añades, que sea explícitamente como
segundo bloque y **diciendo qué estación es y a qué distancia**, nunca mezclada con la predicción
como si fuera el mismo dato.

### 2. El agujero de dato: aquí NO hay código INE

`Frontend/Data/parks/**/park.json` guarda `park.municipalities` como **nombres**
(`["Águilas", "Lorca"]`), y la BD guarda una cadena `parks.municipality` que
`Backend/Lib/park_payload.php:220` parte por `" y "`. AEMET necesita el **código INE de 5 dígitos**
(provincia + municipio, sin dígito de control).

- Resuélvelo contra el **maestro del propio AEMET** (`/api/maestro/municipios`), casando por nombre
  y provincia, y **escribe el código resuelto en el dato**; no lo adivines en cada petición ni lo
  deduzcas de una tabla que te inventes. Un nombre que no case **se queda sin código y el widget no
  se pinta en ese espacio**: regla nº 2 del `CLAUDE.md` raíz, hueco documentado antes que dato
  inventado. Deja el listado de los que no casan por escrito.
- **Un parque son varios municipios.** Elige el que contiene `park.center` y **que el widget lo
  diga**: «Predicción para Águilas», con el municipio a la vista. Un parque de 17 km de costa o uno
  con 1.500 m de desnivel no tiene «un tiempo», y fingir que sí es peor que no ponerlo.
- Si el código acaba viviendo en el dato del parque, recuerda que **la API tiene prioridad sobre el
  `park.json` empaquetado**: hay que meterlo también en la BD (`park_payload.php`,
  `park_export.php`, el SQL correspondiente) o en producción no existirá. Y que
  `npm run validate` conozca el campo nuevo (`Tools/validate-park-data.js`).

### 3. Dónde vive la clave

**Nunca en `Frontend/`.** Todo lo de `Frontend/` lo sirve un servidor estático y encima lo cachea el
Service Worker: una clave ahí es una clave publicada. Va en una variable de entorno del backend
(`AEMET_API_KEY`), leída con el mismo patrón que `Backend/Config/db.php` (`naturdex_env()`), añadida
a `.env.example`, a `docker-compose*.yml` y a `DEPLOY.md`. El frontend habla **solo** con un endpoint
propio, como todo lo demás (`Frontend/Js/api.js` es el único punto de contacto con `Backend/Api/`).

### 4. Qué pasa cuando no hay nada

Dos escenarios reales, los dos habituales en este proyecto:

- **Sin conexión** (es el caso de uso: se está en el campo). El tiempo es un dato perecedero.
- **Sin backend**: existe un despliegue estático solo con `Frontend/` (`Docs/DESPLIEGUE_ESTATICO.md`,
  la demo para financiadores). Ahí `Backend/Api/` devuelve 404 y **el widget simplemente no se
  pinta**. Ni error rojo, ni hueco, ni «no disponible» permanente.

El widget es una mejora, no un requisito. Que no cuelgue nada ni ocupe sitio cuando no tiene dato.

## Arquitectura pedida

**Backend**

- `Backend/Api/tiempo.php` (endpoint, `apiBoot()` + `respond()`) y la forma del JSON en
  `Backend/Lib/tiempo_payload.php`.
- **El flujo de AEMET son dos peticiones**: la primera devuelve un JSON de control
  (`{descripcion, estado, datos, metadatos}`) y el dato de verdad está en la URL del campo `datos`.
  Comprueba `estado` (200 / 401 clave mala / 404 sin dato / 429 demasiadas peticiones) antes de
  seguir. La segunda respuesta llega en **ISO-8859-15**: conviértela a UTF-8 **antes** de
  `json_decode`, o los acentos y los nombres de municipio salen rotos y no lo avisa nadie.
- **Caché en servidor con TTL.** La predicción municipal se emite unas pocas veces al día; pegarle a
  AEMET en cada visita es tirar el cupo y ralentizar la app. Guarda la última respuesta buena (con
  su hora) y sírvela mientras esté fresca. Ante un 429 o un fallo, **sirve lo cacheado marcado como
  viejo** en vez de devolver un error.
- **Timeout corto** en la llamada saliente. Este endpoint no puede ser el que haga esperar a nadie.
- Devuelve una forma **propia y normalizada**, no el JSON de AEMET en crudo: municipio y su código,
  temperatura máxima y mínima, estado del cielo (texto **y** código), probabilidad de precipitación,
  viento y racha, UV si viene, `emitidoEn` (elaboración de AEMET), `obtenidoEn` (cuándo lo pediste
  tú) y `fuente`. Si mañana cambias de proveedor o añades la observación, el frontend no se entera.

**Frontend**

- `Frontend/Js/tiempo.js` — pedir el dato, cachear la última lectura y decidir si aún vale.
- `Frontend/Js/render/tiempo.js` — pintarlo. Nodos en `Frontend/Js/dom.js`, marcado en
  `Frontend/index.html` dentro de `<section class="park-summary">` (~línea 157).
- **Ojo con el plegado.** La cabecera pliega desde el 2026-09-04 (`app.js` líneas ~761-811,
  `initParkFold`): se pliegan la descripción y los recuentos, se quedan fuera el cartel, el progreso
  y la barra de presencia. **Decide explícitamente** si el tiempo va en la parte plegable o en la
  fija y justifícalo. Y si lo metes en la fija, vuelve a medir la cabecera: el comentario de
  `Frontend/Css/styles.css` (~línea 1112) documenta una suma de píxeles que tu cambio deja obsoleta.
- **Nada de esto entra en el precache.** El módulo `.js` sí va a `SHELL_ASSETS` de `sw.js` (y sube
  `VERSION` a `v68`); **el dato meteorológico no**, ni por el SW ni por la capa 2 de `offline.js`.
  Se guarda la última lectura en `localStorage` junto a su hora.
- **Ningún dato del tiempo se pinta sin su hora al lado.** Una predicción de anteayer presentada como
  la de hoy es exactamente el fallo silencioso que este repo persigue. Fija un umbral (¿6 h?, ¿12 h?)
  a partir del cual la lectura guardada se marca como vieja y otro a partir del cual **se deja de
  pintar**, y escribe los dos en el comentario con su porqué.

**Estados que hay que resolver, todos**: cargando · dato fresco · dato guardado y viejo (con su hora)
· sin conexión · backend que devuelve 404 (no pintar nada) · AEMET caída o 429 · `AEMET_API_KEY` sin
definir (el endpoint responde algo honesto y el widget se calla) · parque sin código INE resuelto.

## Accesibilidad y forma

- El icono **nunca** es el único portador del dato: siempre texto («Nubes altas, 12°/24°»).
- Si el widget es interactivo, el click entra por la delegación de `app.js` y el área táctil es de
  44 px mínimo. Si no lo es, que no parezca que lo es.
- Contraste comprobado en claro y en oscuro. Sin `aria-live` gritón: esto no es una alerta.
- A 320 px cabe, y no le roba a la lista del catálogo el alto que se le acaba de ganar plegando la
  cabecera.

## Atribución (no es opcional)

AEMET autoriza el uso **citando a AEMET como autora**. Lee sus condiciones de uso y **transcribe la
fórmula que exijan**, no la inventes: el crédito visible en el widget (con enlace a AEMET) y, si
procede, en «Fuentes y más información». Ese es el mismo criterio con el que este proyecto cita al
IMIDA, al MITECO y a Wikimedia.

## Egreso

Añade `opendata.aemet.es` a la lista `HOSTS` de `Tools/check-egress.js`, con su línea de **qué deja
de funcionar** si está cerrado. Es el único sitio donde está escrito de qué depende el proyecto para
funcionar con red, y una fuente nueva sin registrar ahí cuesta media hora la próxima vez.

## Lo que NO quiero

- La clave en el frontend, en el repo o en un fichero que cachee el SW.
- Un código INE deducido a ojo, ni una tabla de municipios escrita de memoria.
- Una librería nueva. Esto se hace con `fetch` y con lo que ya trae PHP.
- Tocar el pipeline de especies, hábitats o el `park.json` universal. El tiempo es dato en vivo:
  **no se escribe en `park.json`** (el código INE sí, que es dato administrativo del espacio).
- Un widget que, sin dato, deje un hueco o un mensaje de error permanente en la cabecera.

## Antes de terminar

1. `npm run validate` y `npm test` en verde.
2. Probado a 320 px y a 1280x720, en claro y en oscuro.
3. Probado **en modo avión**, con el **backend apagado**, y **sin `AEMET_API_KEY` definida**.
4. `grep -ri "aemet" Frontend/ | grep -i key` no devuelve nada.
5. `sw.js`: módulos nuevos en `SHELL_ASSETS` y `VERSION` subida.
6. Índices actualizados: la tabla de módulos de `Frontend/Js/CLAUDE.md`, la de endpoints de
   `Backend/CLAUDE.md`, `.env.example`, `docker-compose*.yml` y `DEPLOY.md`.
7. Rama propia, un commit por cosa, mensajes en castellano.
8. Cuéntame al final **qué decidiste en los cuatro puntos de arriba y por qué**, y qué queda pendiente
   (municipios sin casar, espacios sin código, lo que no diste por bueno).
