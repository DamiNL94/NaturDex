# Prompt para Claude Code — cuatro mejoras de interfaz (NaturDex)

Cuatro tareas **independientes**. Lánzalas por separado, cada una en su sesión y en su rama.
El bloque de «Contexto» se repite a propósito en cada una: cada tarea tiene que poder pegarse sola.

---

## Contexto común (pégalo con cada tarea)

Trabajas en NaturDex (`C:\Users\Deathscythe\Desktop\NaturDex`), PWA offline-first sin build ni
framework: módulos ES nativos que carga `Frontend/index.html`.

Antes de tocar nada, lee **`Frontend/Js/CLAUDE.md`** (índice de módulos) y el `CLAUDE.md` raíz.

Reglas de la casa que se aplican a las cuatro tareas:

- **Todo en castellano**: código, comentarios, documentación y mensajes de commit.
- **Comentario de cabecera obligatorio** en cada módulo, y explica *qué problema resuelve*, no qué
  hace. Si cambias el porqué de un bloque, **reescribe su comentario**; no lo borres ni lo dejes
  mintiendo. Un comentario falso no lo detecta ningún validador.
- **`npm run validate` tiene que salir en verde** — bloquea el commit vía `.githooks/pre-commit`.
  Pasa también `npm test` y, si tocas texto de fichas, `npm run glossary:check`.
- **Un módulo nuevo (o uno borrado) hay que reflejarlo en `SHELL_ASSETS` de `Frontend/sw.js` y
  subir su `VERSION`** (hoy `v65`). Sin eso el modo sin conexión se rompe y no lo detecta ningún test.
- Todo el HTML generado se compone con la plantilla `` html`` `` de `Frontend/Js/util.js` (escapado
  automático, anti-XSS). No concatenes cadenas a mano.
- Los módulos de `render/` **no registran eventos**: todos los clicks entran por la delegación de
  `app.js` (líneas ~570-670).
- Trabaja en una rama por tarea. No mezcles dos tareas en un commit.
- Comprueba el resultado a **320 px de ancho** y en escritorio (1280x720), y en **tema claro y
  oscuro** (`Frontend/Css/ranger.css` redefine bastante de `styles.css`).

---

# TAREA 1 — La cabecera del parque, plegable

## Qué quiero

`<section class="park-summary">` (`Frontend/index.html`, ~línea 157) ocupa demasiado alto fijo y
ahoga la lista del catálogo. Quiero poder **plegarla y desplegarla**, y que el estado se recuerde.

## Por dónde empezar

- `Frontend/index.html` — el marcado de `.park-summary`: cartel `.park-sign`, `#parkSummary`,
  `.summary-grid`, `.progress-wrap`, `.presence-bar` y `.offline-bar`.
- `Frontend/Js/render/resumen.js` — quien rellena esos nodos (`renderSummary`).
- `Frontend/Js/dom.js` — referencias centralizadas a nodos; el botón nuevo va aquí.
- `Frontend/Css/styles.css` — `.park-summary` (bloque inicial, y las reglas de las líneas ~303,
  ~355) y sobre todo el bloque `@media(min-width:901px)` de la línea ~1112.
- `Frontend/Css/ranger.css` — líneas ~204-215 (el cartel de latón) y ~493-497 (móvil).
- `Frontend/Js/prefs.js` si decides persistir la preferencia junto al resto de ajustes.

## Requisitos

1. Botón de plegado accesible: `aria-expanded`, `aria-controls`, rótulo que diga qué hace, área
   táctil de 44 px como mínimo. Sirve `<details>/<summary>` nativo si el cartel de latón sobrevive
   al cambio de estilos; si no, botón + `hidden`.
2. **Plegada tiene que seguir viéndose**: el rótulo del parque (`#parkTitle`) y su figura de
   protección (`#parkEyebrow`). Propón dónde queda el progreso —una línea fina de `x / y especies`
   es probablemente suficiente— y justifícalo en el comentario.
3. **`.presence-bar` no se pliega.** Es lo que avisa de si lo que marcas está contando para los
   logros (ver `Frontend/Js/presence.js`); escondida detrás de un plegado, el usuario no tiene forma
   de saber por qué su avistamiento no suma nada. Decide explícitamente si la sacas fuera de
   `.park-summary` o si la dejas siempre visible dentro.
4. Recuerda el estado (`localStorage`), y por parque o global — tú decides, pero dilo en el
   comentario. Estado inicial razonable: desplegada la primera vez que se entra a un espacio.
5. La animación, si la pones, respeta `prefers-reduced-motion`.

## Trampas concretas de este repo

- El comentario de `Frontend/Css/styles.css` (~línea 1112) documenta un cálculo medido:
  «park-nav 54 + park-summary 372 + view-tabs 53 + miga 31 + filtros 90 = 600 px de cabecera fija».
  **Ese comentario se queda obsoleto con este cambio: vuelve a medirlo y reescríbelo.**
- En móvil, `ranger.css` fija `.park-summary{flex:0 0 auto}`. Comprueba que al plegar la lista
  **gana alto de verdad** y no queda un hueco vacío.
- En escritorio la barra lateral scrollea como una sola columna con elementos pegajosos
  (`scroll-padding-top`). Verifica que el plegado no descoloca la miga de pan ni el buscador.

## Antes de terminar

`npm run validate` && `npm test`. Captura o describe cómo queda plegada y desplegada, en móvil y
escritorio, en los dos temas.

---

# TAREA 2 — El botón «Guardar sin conexión» y el indicador «En línea»

## Qué quiero

Decidir con criterio si esa barra sigue haciendo falta y, si hace falta, **que deje de ocupar tanto**.

## Primero: analiza, no supongas

Lee y dime qué encuentras:

- `Frontend/Js/offline.js` — cabecera del módulo: describe **tres capas** (1: caché automática de
  JSON en localStorage; 2: «Guardar sin conexión», que baja los binarios —fotos, audioguías y el
  paquete `.pmtiles` del mapa base— a Cache Storage; 3: el Service Worker, que cachea el armazón).
- `Frontend/Js/app.js` líneas ~697-866 — `initOfflineUI`, `downloadParkAssets`,
  `maybeOfferRevalidation`, `maybeSuggestSavingPark`, `CONFIRM_DOWNLOAD_BYTES`.
- `Frontend/Js/profile.js` — la sección «Datos» ya lista los parques guardados, su peso y permite
  borrarlos.
- `Frontend/sw.js` — qué precachea el SW por su cuenta.

**La pregunta a responder con evidencia: ¿la capa 2 la dispara algo que no sea ese botón?** Mi
lectura del código es que **no**, y que por tanto la función no es redundante: sin ella no hay
fotos, ni audioguías, ni mapa base sin cobertura. Verifícalo. Si me equivoco y hay una ruta
automática, elimina la barra entera y dímelo con la línea que lo demuestra.

## Si la función es necesaria (que es lo que espero)

Que se quede, pero encogida y discreta:

1. **El estado «En línea» no se pinta.** Solo importa el estado anómalo: «Sin conexión» y
   «Sin conexión · parque guardado». En línea, nada.
2. La descarga pasa a ser un **icono** en `.park-nav`, junto a `#diccionarioBtn` y `#profileBtn`
   (mismo tamaño y estilo que ellos), con `title` y `aria-label` que digan lo que hace y lo que pesa.
   Tres estados visuales: no guardado / guardando / guardado.
3. Añade la puerta alternativa en la sección «Datos» de `profile.js`: «Guardar este parque sin
   conexión», por si el icono pasa desapercibido.

## Lo que NO se puede romper

- `window.naturdexRefreshOfflineUI` — la llama `startParkExperience` al cambiar de parque.
- El `saveOfflineBtn.click()` que dispara el aviso de `maybeSuggestSavingPark`.
- `downloadParkAssets`, que usa `maybeOfferRevalidation` para reponer un parque desactualizado.
- La confirmación por encima de `CONFIRM_DOWNLOAD_BYTES` (20 MB): descargar sobre datos móviles
  tiene que seguir avisando del peso **antes** de gastar un byte.
- **El avance de la descarga se pinta hoy dentro del propio botón** (`Guardando… 3/57`). Si el botón
  pasa a ser un icono, ese progreso necesita otro sitio: `Frontend/Js/notice.js` o el propio icono
  con un anillo/porcentaje. Resuélvelo, no lo pierdas.
- `Frontend/Js/dom.js` exporta `saveOfflineBtn` y `connStatus`: si renombras nodos, actualízalo.

## Antes de terminar

`npm run validate` && `npm test`. Prueba a mano: con red, sin red (DevTools → Offline), y con un
parque ya guardado.

---

# TAREA 3 — Eliminar la pestaña «Migratorias»

## Qué quiero

Que las aves migratorias vuelvan al catálogo, junto al resto de la fauna, y que la pestaña
desaparezca (escritorio y nav inferior móvil). Es un cambio **de presentación**: el dato
(`migratory`, `sitePresence`, `is_migratory` en la BD, el backend) **no se toca**.

## El corte de raíz

`Frontend/Js/state.js` · `catalogSpecies()` resta hoy las migratorias del catálogo. Quítale la
resta. Con eso, y como el filtro «Fauna» del segmentado va por `species.kingdom`, las migratorias
caen solas en Fauna. **Verifícalo con datos reales** antes de dar nada por hecho.

## Lo que hay que borrar o reescribir

- `Frontend/Js/render/migratorias.js` — se borra. Y su reexport en `Frontend/Js/render.js`.
- `Frontend/Js/dom.js` — `migratoriasPanel`.
- `Frontend/index.html` — `#migratoriasPanel`, el `.view-tab[data-view="migratorias"]` y el
  `.mobile-nav-btn[data-mtab="migratorias"]`. **La nav inferior pasa de cinco botones a cuatro**:
  revisa su `grid-template-columns` en el CSS y el comentario que dice «son cinco desde que…».
- `Frontend/Js/app.js` — `showMigratorias`, `selectMigratoria`, `sincronizaPestanaMigratorias`, y
  todas las ramas `'migratorias'` de `setView`, del refresco al marcar visto y del arranque
  (`ocultaPestana`). Actualiza el índice de secciones de `Frontend/Js/CLAUDE.md`.
- `Frontend/Css/styles.css` — `.migratorias-panel`, `.migratorias-intro`, `.migratoria-card`, y el
  comentario de la línea ~415 («cuatro o cinco secciones según el espacio»).
  **`.badge.migratoria` (línea ~556 y su variante oscura ~876) SE QUEDA**: la vas a necesitar.
- `Frontend/sw.js` — quita `'Js/render/migratorias.js'` de `SHELL_ASSETS` y **sube `VERSION`**
  (`v65` → `v66`).
- `Frontend/Js/diccionario.js` — su cabecera explica que la fila de pestañas «creció con
  Migratorias». Reescríbela.
- `Frontend/Js/nav.js` — comprueba si la pila de navegación guarda la vista `'migratorias'`.

## Lo que hay que RECUPERAR en el catálogo

En `Frontend/Js/render/catalogo.js` · `renderSpeciesList` hay un comentario que explica por qué se
quitó el distintivo de migratoria: iba por `zepaSiteCode`, que dice otra cosa (que el formulario
oficial nombra al ave, población permanente incluida), y era falso en 154 fichas. **Ahora sí se
puede pintar bien**, porque `esMigratoria()` va por `migratory`, derivado del tipo de población del
Formulario Normalizado de Datos. Así que:

1. Vuelve a pintar `<span class="badge migratoria">🕊️ Migratoria</span>` en la tarjeta, pero por
   `esMigratoria(item)`, **nunca** por `zepaSiteCode`.
2. Recupera también la etiqueta de `item.sitePresence.etiqueta` que hoy pinta `migratorias.js`.
3. **Reescribe ese comentario**: hoy dice justo lo contrario de lo que va a hacer el código.
4. Lo que se pierde al borrar la pestaña es su texto de intro, que distinguía tres estados —hay
   migratorias / el formulario declara aves pero todas permanentes / no hay formulario—. Ese último
   caso es información honesta sobre un hueco de fuente. Propón dónde recolocarlo (la ficha de
   especie de un ave, o la nota de «Sin hábitat asignado»); si decides no recolocarlo, dime por qué.

## Lo que NO se toca

- `Frontend/Js/render/progreso.js` — la barra «🕊️ Aves migratorias» y el logro «Vigía de la
  migración» **se quedan**: cuelgan del dato, no de la pestaña. Pero su `progress-caption` dice
  «(pestaña «Migratorias»)» → reescríbelo.
- `esMigratoria()` en `state.js` sigue usándose (progreso, logros, ficha de detalle).
- Backend, SQL y pipeline de `Tools/`: nada.

## Documentación a actualizar

- `Frontend/Js/CLAUDE.md`: la fila de `render/migratorias.js` (fuera), la de `state.js` (ya no
  resta), la tabla de secciones de `app.js`, y la de `render/catalogo.js`.
- `Docs/arquitectura/PROCEDENCIA-DE-CAMPOS.md` línea ~64: dice que `is_migratory` «gobierna la
  pestaña Migratorias de la app». Ya no.
- `Docs/arquitectura/MODELO-DE-DATOS.md` y `Docs/arquitectura/APLICACION.md` si mencionan la pestaña.

## Antes de terminar

`npm run validate` && `npm test`. Comprueba en un espacio con muchas migratorias (San Pedro del
Pinatar, Humedal del Ajauque) que: los contadores del resumen no cambian, «Ver todas las especies»
no duplica ninguna ficha, el filtro Fauna las incluye, el progreso sigue cuadrando y el medallero
también.

---

# TAREA 4 — Jerarquía de la información: lo simple delante, lo científico en un desplegable

## Qué quiero

Que una tarjeta o una ficha abra con **lo que sirve para reconocer la especie sobre el terreno**, y
que el aparato científico —taxonomía, categorías legales, fuentes— viva detrás de un desplegable.
Aplícalo a los tres sitios: tarjetas de lista, ficha de detalle, y también hábitats, POIs e invasoras.

## 4.a — Tarjetas de la lista (`Frontend/Js/render/catalogo.js`, `render/invasoras.js`)

Hoy la `.card-meta` de una `.species-card` puede llevar cuatro distintivos a la vez: reino,
«prioritaria», rareza (cinco estrellas + categoría legal) y «a revisar». Deja **dos como máximo**
visibles y mete el resto en el desplegable.

**El problema estructural, y es el punto delicado de esta tarea:** la tarjeta entera es un
`<button>`. No puedes anidar dentro un `<details>` ni otro `<button>` — es HTML inválido y además
rompe la delegación de clicks de `app.js` (~570-670), que resuelve por `data-id`. Resuélvelo
explícitamente: o el desplegable es hermano del botón dentro de un contenedor `.species-card-wrap`,
o la tarjeta deja de ser un botón y pasa a ser un contenedor con un botón principal + un botón
«más» aparte. **Elige una, justifícala en el comentario, y comprueba que el teclado sigue
funcionando** (tabulación en orden, Enter/Espacio, foco visible) y que `aria-current` sigue
marcando la ficha abierta.

Mismo tratamiento para `habitatCard` y las tarjetas de grupo de hábitat, si aplica.

## 4.b — Ficha de especie (`Frontend/Js/render/detalle.js` · `renderSpeciesDetail`)

Orden propuesto (ajústalo si tienes un argumento mejor, pero dilo):

**Siempre visible:** foto → nombre común → nombre científico → **cartel de advertencia** →
descripción → pistas de identificación (`tips`) → hábitat / temporada / rareza en estrellas →
botón «Marcar como visto».

**Dentro de `<details>` (cerrados por defecto):** Taxonomía completa · Estado de conservación (UICN
global, UICN España, estatal, autonómico) · presencia en el sitio Red Natura 2000 · fuentes y
crédito de la foto.

**Nunca dentro de un desplegable:**

- El **cartel de advertencia** de `Frontend/Js/rareza.js` (`cartelAdvertencia`,
  `recordatorioAdvertencia`). Es la regla nº 9 del `CLAUDE.md` raíz: una especie amenazada —o **sin
  tramo calculado**— avisa, y un aviso escondido no es un aviso.
- El `reviewNote` («Pendiente de revisión»). Es el hueco documentado, y en este proyecto vale más
  que un dato relleno a ojo.
- El botón de marcar visto y su nota de verificación.

## 4.c — Hábitat, POI e invasora

- `renderHabitatDetail`: el bloque de **asociación fitosociológica** entero pasa a `<details>`
  (dentro ya tiene otro `<details>` de ayuda: anida bien o aplana, pero que no queden dos capas de
  clic para llegar a la cita). La cita latina completa con autoría **no se recorta nunca**.
- `renderPoiDetail` y `render/invasoras.js`: mismo patrón, resumen + desplegable.

## Restricciones técnicas

- `<details>/<summary>` **nativo**, sin JavaScript: funciona sin conexión, es accesible y no añade
  peso al armazón.
- Todo el HTML, con la plantilla `` html`` `` de `util.js`.
- No rompas: `highlightGlossary(detailPanel)` (comprueba que el resaltado del glosario y su popover
  funcionan **también dentro de un `<details>` que se abre después**), `visor.js` /
  `atributosAmpliar` (la foto ampliable), `audioBlock` (audioguías, con su transcripción
  obligatoria) ni `data-toggle-seen`.
- La ficha se abre siempre por arriba (`estrenaFicha`, `app.js` ~62-95): con secciones plegadas el
  encabezado tiene que seguir siendo lo primero.
- Decide si el estado abierto/cerrado se recuerda entre fichas y dilo en el comentario. Por defecto,
  cerrados.

## Antes de terminar

`npm run validate` && `npm test` && `npm run glossary:check`. Repasa a 320 px: que ningún resumen de
`<summary>` parta en tres líneas ni desborde. Y actualiza la tabla de `render/` en
`Frontend/Js/CLAUDE.md` con el porqué del cambio.
