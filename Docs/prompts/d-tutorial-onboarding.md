# Prompt · (d) Tutorial de bienvenida (onboarding) + botón para reabrirlo

> Pega esto en Claude Code para que diseñe e implemente el onboarding.

---

Quiero añadir un **tutorial de bienvenida** a NaturDex: una serie de pantallas/tarjetas guiadas que
se activen automáticamente la **primera vez** que un usuario entra a la app (justo tras el login,
antes de que empiece a usarla), explicando qué es NaturDex y cómo se usa. El público son
excursionistas sin formación científica, así que la información **no puede darse de golpe**: tiene
que ir paso a paso, con lenguaje sencillo y tarjetas cortas. Además quiero un **botón "Tutorial"**
visible en la app para volver a verlo cuando se quiera.

## Contexto del proyecto

NaturDex es una PWA offline-first en JS vanilla (sin build ni framework — módulos ES nativos), en
`Frontend/`. El flujo de pantallas (todas `<section class="screen">`, mostradas/ocultadas por
`showScreen(id)` en `Frontend/Js/auth.js`) es:

1. `screen-cover` → portada.
2. `screen-auth` → login/registro (`auth.js`, función `submitAuth`).
3. `screen-select` → mapa de España + `<select>` para elegir parque (`auth.js`, `goToSelect()` /
   `initSpainMap()` / `choosePark()` / `enterPark()`).
4. `screen-park` → la app completa una vez dentro de un parque: sidebar izquierda (catálogo de
   hábitats/especies, pestañas Catálogo/Invasoras/Progreso) + mapa a la derecha
   (`Frontend/Js/app.js`, `map.js`, `layers.js`, `explorer.js`, `render.js`, `state.js`, `dom.js`).
   Se entra a esta pantalla desde `enterPark(slug)` en `auth.js`, que llama a
   `window.startParkExperience(slug, user)` (definida en `app.js`).

El login ocurre en `screen-auth`; tras él se va a `screen-select` y luego, al elegir parque, a
`screen-park`. Como el tutorial pedido cubre tanto "cómo elegir el parque" (pantalla `screen-select`)
como el resto de funciones (dentro de `screen-park`), necesita **dos tramos**, no solo uno:

- **Tramo 1** (en `screen-select`, primera vez que se llega ahí tras el login): cómo elegir un
  parque (mapa, `<select>`, botón "Ir al parque más cercano a mí" con id `geoLocateBtn`).
- **Tramo 2** (en `screen-park`, primera vez que se entra a un parque): el resto — hábitats,
  especies, capas, progreso, etc.

Sé pragmático si ves una forma mejor de encadenar ambos tramos (p. ej. un único flujo que empieza en
`screen-select` y continúa automáticamente al entrar al parque), pero el resultado debe cubrir las
dos pantallas sin que el usuario tenga que activarlo dos veces.

Patrones y convenciones ya existentes que deberías reutilizar en vez de inventar otros nuevos:

- **Overlays/paneles flotantes** ya existentes como referencia de estilo: el aviso de proximidad
  `#explorerHint` (`explorer.js` + `.explorer-hint` en `Css/styles.css`), el panel de capas
  `#layersPanel` (`layers.js`), y el popover de glosario `.glossary-popover` (`glossary.js`).
- **Variables CSS** en `Frontend/Css/styles.css` (`:root`): `--ink`, `--muted`, `--line`, `--paper`,
  `--panel`, `--leaf` (verde principal), `--sea`, `--sun`, `--danger`, `--shadow`, `--radius-sm`,
  `--radius-md`, `--shadow-sm`. Úsalas en vez de colores sueltos.
- **z-index en uso** (para que el tutorial quede por encima de todo sin romper nada): `.explorer-hint`
  460, `.mobile-nav` 800, `.sheet-scrim`/mapa en móvil 850, `.detail-dock` 900, `.skip-link` 1200,
  `.glossary-popover` 2000. El overlay del tutorial debería ir claramente por encima (p. ej. 3000+).
- **Bottom-sheet en móvil**: el patrón `.sheet-scrim` + panel que sube desde abajo (ver
  `.detail-dock`) es el que ya usa la app en móvil para fichas de detalle; el tutorial en móvil
  debería sentirse igual (tarjeta inferior), no un modal centrado tipo escritorio.
- **Accesibilidad**: `showScreen()` ya mueve el foco al `h1`/`h2` de la pantalla nueva al navegar;
  sigue ese mismo cuidado (foco al abrir cada tarjeta, `Escape` para cerrar, roles ARIA, cierre con
  el ratón fuera del recuadro).
- **Persistencia**: el patrón de scope existente es `progressScope()` en `data.js` →
  `(state.userId != null ? 'u' + state.userId : 'anon') + ':' + state.activeParkSlug`. Usa un
  esquema similar para recordar si el usuario ya vio el tutorial, p. ej.
  `naturdex.tutorial.<u{id}|anon>` en `localStorage` (como ya hace `auth.js` con `naturdex.user`),
  para que cada cuenta en el mismo dispositivo lo vea una vez, y el modo invitado también.
- **Sin dependencias nuevas**: el repo es zero-dep en el Frontend (solo Leaflet por CDN). Constrúyelo
  en JS vanilla, como módulo ES nuevo (p. ej. `Frontend/Js/tutorial.js`), siguiendo el mismo estilo
  de comentarios en español que el resto de `Js/*.js`.

## Qué debe cubrir el contenido del tutorial

Con lenguaje cercano y nada técnico (nada de jerga de "hábitat de interés comunitario" ni similares
salvo que se explique con una frase llana). Cada paso: una idea, una imagen/icono, poco texto.

**Tramo 1 — elegir parque** (pantalla `screen-select`):
- Qué es NaturDex en una frase (guía para identificar y catalogar especies mientras exploras un
  parque).
- Cómo elegir el parque: tocar en el mapa o usar el desplegable; botón de "parque más cercano a mí".

**Tramo 2 — dentro del parque** (pantalla `screen-park`), como mínimo:
- Cómo se organiza el catálogo: primero **hábitats**, y al entrar en uno, sus **especies**
  (`catalogControls`, lista de hábitats/especies en la barra lateral, ficha de detalle a la derecha
  / bottom-sheet en móvil).
- Cómo **marcar una especie como vista** (botón `.seen-toggle` en la ficha de detalle) y qué
  significa para el progreso.
- Cómo cambiar las **capas del mapa** y ver la leyenda (botón "Capas" `#layersToggle` →
  `#layersPanel`).
- Cómo **centrar/seguir tu posición** en el mapa (botón `#followToggle`) y el **modo explorador**
  (`#explorerToggle`, panel "Cerca de ti" `#nearbyPanel`) para descubrir por proximidad con GPS.
- Cómo consultar el **progreso** (pestaña "Progreso", `#progressPanel`, barra de progreso superior).
- Un repaso rápido del resto de funciones, sin necesidad de un paso dedicado a cada una: buscar y
  filtrar especies (`#searchInput`, filtros Todas/Fauna/Flora/Vistas), pestaña **Invasoras**
  (`#invasorasPanel`), **guardar el parque sin conexión** (`#saveOfflineBtn` / indicador
  `#connStatus`), navegación inferior en móvil (Catálogo/Mapa/Invasoras/Progreso), y cerrar sesión.

## Qué debe implementar

1. **Componente de tutorial reutilizable** (spotlight/coach-marks): resalta el elemento relevante de
   la UI real (no capturas ni dibujos) con un recuadro o halo, y muestra una tarjeta con texto breve,
   indicador de progreso (p. ej. puntos "● ● ○ ○"), botones "Siguiente" / "Atrás" / "Saltar tutorial"
   y cierre con la X o `Escape`. En desktop puede anclarse junto al elemento; en móvil, tarjeta
   inferior tipo `.detail-dock`.
2. **Disparo automático la primera vez**: al llegar a `screen-select` tras el login (si no se ha
   visto ese tramo) y, tras entrar a un parque por primera vez, el tramo de `screen-park`. No debe
   interrumpir a quien ya lo ha visto.
3. **Botón "Tutorial" para reabrirlo manualmente**, en dos sitios coherentes con la UI actual: junto
   al botón de cerrar sesión en la barra lateral del parque (`.park-nav`, junto a `#logoutBtn`) y en
   la cabecera de selección de parque (`.select-head`, junto a `#logoutBtnSelect`). Reabrir debe
   relanzar el tramo correspondiente a la pantalla en la que está el usuario, ignorando el flag de
   "ya visto".
4. **HTML**: añade los botones necesarios en `Frontend/index.html` (icon-btn, mismo patrón que el
   botón de logout con su SVG) y el contenedor del overlay del tutorial.
5. **CSS**: añade las reglas necesarias en `Frontend/Css/styles.css` reutilizando las variables y
   z-index descritos arriba.
6. **JS**: nuevo módulo `Frontend/Js/tutorial.js` (ES module) con la lógica de pasos, resaltado,
   persistencia y API pública mínima (p. ej. `startTutorial(stage)` / `maybeAutoStart(stage)`).
   Engánchalo desde `auth.js` (en `goToSelect()`, tras mostrar `screen-select`) y desde `app.js` o
   `auth.js` (tras `enterPark()` mostrar `screen-park` con datos ya cargados), sin romper el
   contrato existente (`window.startParkExperience`, `window.naturdexInvalidateMap`).

## Verificación

Antes de darlo por bueno: probar el flujo completo de punta a punta (login → tutorial de selección
de parque → elegir parque → tutorial dentro del parque → cerrar → recargar y comprobar que ya no
aparece solo → pulsar "Tutorial" y comprobar que se puede reabrir en ambas pantallas), en escritorio
y en un viewport móvil, y navegando con teclado (foco visible, `Escape` cierra, no queda foco
atrapado fuera del tutorial).
