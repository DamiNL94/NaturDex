# Prompt · (i) Usabilidad para mayores y niños, diccionario, Darwin Core y logros

> Ocho encargos de una misma tanda, ordenados en cinco fases de menos a más riesgo. Se puede pegar
> entero en Claude Code, o fase a fase (recomendado: una fase, un commit).

---

## Cómo usar este documento

Cada fase es autónoma y tiene sus propios **criterios de aceptación**. No pases de fase sin que la
anterior salga verde. Si al abrir el código encuentras que el diagnóstico que aquí se da **no se
corresponde** con lo que hay, para y dilo: el diagnóstico está verificado a fecha de hoy, pero el
repo se mueve.

**Antes de tocar nada, lee** `CLAUDE.md` (raíz), `Frontend/Js/CLAUDE.md` y, según la fase,
`Backend/CLAUDE.md` y `Database/CLAUDE.md`. No leas el repo entero: los índices están para eso.

## Reglas transversales (aplican a todas las fases)

1. **Todo en castellano**: código, comentarios, documentación y mensajes de commit.
2. **Comentario de cabecera obligatorio** en cada módulo nuevo, explicando *qué problema resuelve*,
   no qué hace. Es la convención más valiosa del repo.
3. **Frontend sin build ni framework**: módulos ES nativos, cero dependencias nuevas. El HTML se
   genera **siempre** con la plantilla `` html`` `` de `util.js` (escapado anti-XSS). Los módulos de
   `render/` **no registran eventos de usuario**: eso es de `app.js` (delegación, §518–586).
4. **Módulo nuevo ⇒ añadirlo a `SHELL_ASSETS` en `Frontend/sw.js` y subir su `VERSION`.** Sin
   precachear, el modo sin conexión se rompe y no lo detecta ningún test.
5. **Todo lo que se abre es un nivel apilado** en `nav.js`: `window.NaturDexNav.open(clave, cerrar)`
   y `«atrás»`/`Escape` cierran el de arriba. Un overlay nuevo que no pase por la pila se come el
   botón «atrás» del móvil.
6. **z-index en uso**: `.explorer-hint` 460 · `.mobile-nav` 800 · `.sheet-scrim` 850 ·
   `.detail-dock` 900 · `.skip-link` 1200 · `.glossary-popover` 2000 · overlay del tutorial 3000+.
7. **Usa los tokens de `Css/ranger.css`** (`--font-display`, `--font-ui`, `--leaf`, `--radius-*`…),
   que redefine los de `styles.css`. `ranger.css` va después a propósito: nada de colores sueltos.
8. **La API tiene prioridad sobre el `park.json` empaquetado.** Con backend desplegado, tocar solo
   el frontend no cambia lo que ve el usuario.
9. Antes de dar por buena cualquier fase: `npm run validate` (bloquea el commit vía el hook),
   `npm test`, `npm run typecheck`.

---

# FASE 1 — Que se pueda usar con sesenta años o con ocho

El público objetivo de esta fase son **personas mayores y niños**: poca destreza con el móvil, dedos
imprecisos, vista cansada, miedo a «romper algo». Todo lo de esta fase se juzga con ese criterio.

## 1.1 · Al tocar una foto, que se amplíe

**Qué pasa hoy.** Las fichas pintan la foto en `render/detalle.js` (`.detail-image-wrap` para
especie, `.habitat-detail-image`, `.poi-detail-image`) y en `render/invasoras.js`. El CSS la fija a
`height:340px` en escritorio y `240px` en móvil con `object-fit:contain`
(`.detail-panel img` en `Css/styles.css`). Es decir: **la foto se ve siempre pequeña y no hay forma
de ampliarla.** En una ficha de identificación de una planta, eso es justo lo que se necesita.

**Qué hacer.** Un visor de imagen a pantalla completa, módulo nuevo `Frontend/Js/visor.js`:

- Se abre al tocar (o pulsar `Enter`/`Espacio` sobre) la foto de cualquier ficha: especie, hábitat,
  POI e invasora. La imagen debe ser **un control anunciado** (`role="button"`, `tabindex="0"`,
  `aria-label` del tipo «Ampliar la foto de <nombre>»), no una imagen muda que resulta que responde.
- Pantalla completa, fondo oscuro, imagen a `object-fit:contain` con el máximo tamaño posible.
- **Zoom**: pellizco (`touch-action` + gestos de dos dedos) y doble toque para acercar/alejar, con
  arrastre cuando está ampliada. En escritorio, rueda del ratón y arrastre.
- **Un solo botón de cerrar**, grande (≥56 px), con etiqueta visible «Cerrar», arriba a la derecha y
  fuera del alcance del pulgar que arrastra. Cierra además con `Escape`, con «atrás» del móvil
  (pila de `nav.js`, clave `'visor'`) y arrastrando hacia abajo.
- **Debajo de la imagen, la atribución de la foto** (`imageAttribution`, y `imageNote` si existe).
  No es decorativo: hay fotos en el catálogo cuya licencia obliga a citarla, y ampliada es cuando
  más se mira. Ver la deuda nº 7 de `Docs/DEUDA-TECNICA.md`.
- **No rompas los sustitutos de imagen rota** (`window.__imgFallback`, `__habitatImgFallback`,
  `__poiImgFallback` en `render/fallbacks.js`): si la imagen es un sustituto, la foto **no** debe
  abrir el visor — no hay nada que ampliar.
- z-index por encima de la hoja de detalle y del popover del glosario, por debajo del tutorial
  (p. ej. 2500). El cuerpo no debe hacer scroll por detrás mientras está abierto.
- El click se engancha por **delegación en `app.js`**, no dentro de `render/`.

**Aceptación.** Se abre y se cierra con el dedo, con teclado y con «atrás» del móvil, en las cuatro
clases de ficha; la imagen ampliada se ve mucho más grande que en la ficha; la atribución es legible;
cerrar deja el foco donde estaba; sin conexión funciona igual (la imagen ya está en caché).

## 1.2 · Al abrir una pestaña o una ficha, empezar arriba

**Qué pasa hoy.** Los contenedores con scroll propio (`.detail-panel`, `.species-list`,
`.progress-panel`, `.invasoras-panel`) **conservan su `scrollTop`** al repintarse. Al abrir una ficha
nueva desde el catálogo, o al volver a una pestaña, el usuario aparece a media altura, con el texto
cortado y sin ver la foto. Peor aún: `openDetailSheet()` en `app.js` hace
`detailPanel.focus({ preventScroll: true })`, que es justo lo que **impide** que el navegador
corrija la posición.

**Qué hacer.**

- En `renderDetail()` (o en el punto de `app.js` que la invoca) poner el contenedor de la ficha a
  `scrollTop = 0` **antes** de dar el foco. En la hoja móvil, lo mismo.
- Igual al conmutar vista o pestaña móvil (`setView`, `showMobileTab`, `setMobileTab`): la vista
  entrante arranca arriba del todo.
- El foco va al **encabezado** de lo recién abierto (el `h2` de la ficha), con `tabindex="-1"` si
  hace falta, siguiendo el mismo criterio que ya usa `showScreen()` en `auth.js` y `closeRaw()` en
  `tutorial.js`. Que el lector de pantalla anuncie el nombre de la especie, no el panel.
- Respeta `data-motion="reduce"` (`prefs.js`): si el usuario pidió menos movimiento, salto seco, sin
  desplazamiento animado.

**Aceptación.** Abrir tres fichas seguidas desde una lista larga y ya desplazada: las tres empiezan
por la foto. Cambiar de pestaña y volver: arriba. Con teclado, el foco cae en el título.

## 1.3 · Tipografía sensata

**Qué pasa hoy.** Tres cosas, y las tres son arreglables:

1. **La pila de fuentes de `styles.css` pide `Inter`, que no se carga en ninguna parte**
   (`body{font-family:Inter,ui-sans-serif,…}`). Lo que sí se carga son `Zilla Slab` y `Public Sans`,
   declaradas en `ranger.css` (`--font-display`, `--font-ui`). La línea de `styles.css` es un resto
   muerto que solo confunde.
2. **Las fuentes vienen de `fonts.googleapis.com`** (`index.html`). El Service Worker ignora a
   propósito todo lo que no sea del mismo origen — está documentado en `Vendor/README.md`, y es
   exactamente el motivo por el que Leaflet se vendorizó. **Conclusión: sin cobertura, la app pierde
   su tipografía**, justo en el monte, que es donde se usa. Hay que vendorizar los `.woff2` en
   `Frontend/Vendor/fonts/` con su `@font-face` y su licencia (ambas son OFL), quitar las dos
   `preconnect` y el `<link>` a Google, y añadir los ficheros a `SHELL_ASSETS`. De paso, deja de
   filtrarse la IP de cada usuario a un tercero.
3. **Hay demasiado texto por debajo de 12 px**: `ranger.css` usa `.62rem`, `.64rem`, `.66rem`,
   `.68rem` y `.70rem` en insignias, etiquetas de datos, pies de fuente y subtítulos, y en varios de
   esos sitios además con `text-transform:uppercase` y `letter-spacing`, que es la combinación menos
   legible que existe para una vista cansada.

**Qué hacer.** Una escala tipográfica declarada en tokens y aplicada en todo el frontend:

- Define en `:root` una escala corta y con nombre (p. ej. `--fs-xs` … `--fs-2xl`) y **sustituye los
  `font-size` literales** por ella. Suelo duro: **ningún texto por debajo de `0.8rem`** (12.8 px), y
  el cuerpo de las fichas en `1rem` como mínimo, con `line-height` ≥ 1.5.
- Los rótulos en mayúsculas con `letter-spacing` se reservan a etiquetas de una o dos palabras. Un
  texto informativo nunca va en mayúsculas.
- **Comprueba que la preferencia de tamaño de texto sigue funcionando**: `prefs.js` escribe
  `data-text-size` en `<html>` y `styles.css:742` lo traduce a `font-size:112.5%`/`125%` en la raíz.
  Eso solo escala lo que esté en `rem`: si algún tamaño quedó en `px`, se queda sordo a la
  preferencia. Búscalos y pásalos a `rem`.
- **Áreas táctiles**: mínimo 44×44 px en todo control (hoy hay `min-height:32px` y `36px` sueltos en
  `ranger.css`), y 48 px en los botones que usa alguien de pie, con guantes o con prisa: «Marcar
  como visto», la nav inferior, el cierre de la hoja y los botones del tutorial.

**Aceptación.** Sin red, la app conserva Zilla Slab y Public Sans. `rg "font-size:\.[0-7]"` sobre
`Frontend/Css/` no devuelve nada. Las tres opciones de tamaño de texto escalan toda la interfaz. Con
el zoom del navegador al 200 % no se solapa nada.

## 1.4 · El tutorial, bloqueante y a prueba de dedos

**Qué pasa hoy.** `Frontend/Js/tutorial.js` está bien construido —`spotlight`, ciclo de foco,
`Escape`, pila de navegación—, pero **es fácil salirse sin querer**:

- `backdropEl.addEventListener('click', () => close())`: **un toque en cualquier punto de la
  pantalla cierra el tutorial y lo marca como visto**, y no vuelve a salir solo. Para el público
  objetivo, esto es el fallo principal.
- El recorte del `spotlight` es solo visual (sombra del recuadro): el resto de la UI está tapada,
  pero conviene que además sea **inerte de verdad**.
- Los botones son pequeños y hay cuatro acciones a la vez («Saltar», «Atrás», «Siguiente», «✕»).

**Qué hacer.**

- **Quitar el cierre por clic fuera.** El fondo se toca y no pasa nada (o, mejor, un empujón visual
  suave que señale dónde hay que pulsar).
- **Modal de verdad**: `inert` (con respaldo `aria-hidden` + `pointer-events:none`) sobre las
  `<section class="screen">` mientras el tutorial está abierto, `overflow:hidden` en `<body>` y
  bloqueo del `touchmove` sobre el fondo. Solo los botones de la tarjeta responden. Al cerrar, se
  revierte todo.
- **Un solo camino claro**: botón primario grande «Siguiente» (≥56 px de alto, tipografía ≥ 1rem,
  ancho completo en móvil), «Atrás» secundario y discreto, y «Salir del tutorial» como texto
  pequeño abajo **con confirmación** («¿Seguro? Puedes volver a verlo desde el botón ?»). El ✕
  desaparece o se convierte en ese mismo enlace: hoy hay dos formas de irse y ninguna avisa.
- **Escape**: que siga cerrando (es la salida de teclado), pero pasando por la misma confirmación.
- El indicador de progreso, hoy `.tutorial-dot` decorativo, con texto visible: «Paso 3 de 8». Hoy
  ese texto existe pero está en `.sr-only`, solo para lectores de pantalla; que se vea.
- Revisa el **texto de los pasos** con el mismo criterio: frases cortas, sin subordinadas, sin
  paréntesis largos. El paso de «Llévate el parque en el bolsillo» es hoy el más largo de todos.
- No toques `maybeAutoStart` ni el ámbito de persistencia
  (`naturdex.tutorial.<u{id}|anon>`): el disparo automático la primera vez y el relanzamiento desde
  el «?» funcionan y son correctos.

**Aceptación.** Con el tutorial abierto: tocar el mapa, la lista, la nav inferior y la cabecera no
hace absolutamente nada; el `Tab` no sale de la tarjeta; solo se sale por «Siguiente» hasta el final
o confirmando la salida. Probado en escritorio y en un viewport de 360 px.

---

# FASE 2 — Pestaña de diccionario

**Qué hay hoy.** `Frontend/Js/glossary.js` resalta los tecnicismos **dentro de las descripciones**
(`.detail-prose`) y enseña la definición en un popover. Los datos están en
`Frontend/Data/glosario.json` (cacheado con `NaturDexOffline.fetchJsonCached`) y en la API
(`Backend/Api/glossary.php`, mismo contenido). **No hay ninguna forma de consultar el glosario
entero**: solo aparece si el término sale en un texto que el usuario esté leyendo.

**Qué hacer.** Una vista «Diccionario» que se pueda abrir por sí sola.

- **Dónde ponerla.** Hay una decisión de diseño aquí, y el criterio manda sobre la comodidad de
  implementación: **la nav inferior del móvil no puede pasar de cuatro botones** (Mapa · Catálogo ·
  Invasoras · Progreso), porque el público de la Fase 1 no navega bien entre cinco iconos pequeños.
  Propuesta: pestaña «Diccionario» en las `view-tabs` de la barra lateral en escritorio
  (`index.html:201–204`) y, en móvil, entrada desde la cabecera del catálogo y desde el popover del
  glosario. **Evalúalo y decide, pero justifica la decisión en el comentario de cabecera del módulo.**
- **Qué tiene que hacer**: lista alfabética completa; buscador que filtre por término, alias y texto
  de la definición; filtro por `category`; índice A–Z; contador de términos; y, al entrar desde el
  popover, abrir directamente en el término correspondiente («Ver en el diccionario»).
- **Funciona sin conexión**, por el mismo camino que ya usa `loadGlossary()`. Si el JSON no está
  cacheado aún, un mensaje honesto, no una pantalla vacía.
- Reutiliza `reportGlossaryView(term)` para que las consultas se sigan registrando como actividad.
  **Ojo: consultar el glosario ya NO desbloquea logros** y así debe seguir (era lo que se conseguía
  sin salir de casa; ver `Docs/PROGRESO-CUENTA-LOGROS.md`). Solo alimenta la estadística del perfil.
- **No inventes definiciones.** La deuda nº 9 de `Docs/DEUDA-TECNICA.md` dice que hay **67 términos
  sin definir**, entre ellos `caliza`, que sale en 87 fichas. La pestaña va a poner ese hueco a la
  vista, y eso es bueno: si quieres, muestra el contador de cobertura, pero el texto lo redacta una
  persona en el bloque `glosario` de `Database/seed.sql` + `npm run export:glossary`.

**Aceptación.** Se llega al diccionario sin pasar por una ficha; se busca «hábitat» y aparece;
funciona en avión; el popover sigue funcionando como antes; `npm run glossary:check` no empeora.

---

# FASE 3 — La segunda carga rara del área personal

**Qué pasa hoy, y está localizado.** En `Frontend/Js/profile.js`:

```js
export async function showProfile() {
  if (window.naturdexShowScreen) window.naturdexShowScreen('screen-profile');
  await renderProfile();          // pinta "Cargando tu perfil…" y luego el perfil entero
  await loadServerProfile();      // trae createdAt, nombre y prefs del servidor
  if (serverProfile) await renderProfile();   // ← REPINTA TODO otra vez
}
```

`renderProfile()` empieza con `profileBody.innerHTML = '<p>Cargando tu perfil…</p>'`, así que el
segundo pase **vuelve a mostrar el mensaje de carga**, tira el scroll, pierde el foco y hace saltar
la maquetación. El comentario del código dice «se repinta sin que se note el salto» — se nota. Y solo
para enriquecer con la fecha de alta y un par de cifras.

**Qué hacer.**

- **Un solo pintado.** Opción recomendada: lanzar `loadServerProfile()` **en paralelo** con el resto
  (`Promise.all` junto a `refreshAccountProgress()`, `progressSummary()` y `storageBlock()`) y pintar
  una vez, con lo que haya llegado. El perfil del servidor tiene su propio `ACCOUNT_TIMEOUT_MS`, así
  que el peor caso está acotado y sin red ni siquiera se intenta (`isGuest() || !isOnline()`).
- Si prefieres conservar el enriquecimiento posterior, entonces **no repintes el cuerpo**: parchea
  solo los nodos afectados (nombre, iniciales del avatar, fecha de alta, cifras), como ya se hace en
  las líneas 377 y 391 tras editar el nombre.
- Quita el mensaje «Cargando tu perfil…» como pintado intermedio o conviértelo en un **esqueleto de
  la misma altura** que el contenido final, para que no salte nada.
- Mismo trato al volver a la pantalla: entrar, salir y volver a entrar no debe parpadear.

**Aceptación.** Entrar en «Perfil y ajustes» muestra **una** transición, no dos; el scroll no se
mueve; grabado en vídeo o con «ralentización de red» en las DevTools no aparece un segundo salto;
en modo avión y como invitado se comporta igual.

---

# FASE 4 — Logros más vistosos y coherentes a nivel nacional

**Qué hay hoy.** `Frontend/Data/achievements.json` (v2) es la **fuente única**, leída tanto por
`Backend/Lib/account_progress.php` (evalúa) como por `Frontend/Js/achievements/` (predice sin red y
pinta). Hoy tiene **52 logros en 10 categorías** y 4 rarezas
(`comun` 10 · `poco-comun` 16 · `raro` 16 · `legendario` 10), sobre 16 métricas
(`speciesSeen`, `parksVisited`, `regionsVisited`, `provincesVisited`, `habitatsCompleted`,
`poisSeen`, `gpsSightings`, `fieldHours`, `fieldDays`, `fieldKilometers`, `weekStreak`…).
El pintado es `render/progreso.js` con `.achievement-card`: una tarjeta plana con emoji, título y
descripción, y `opacity:.6` cuando está bloqueado. **La rareza no se ve por ninguna parte**, aunque
esté declarada y tenga una escala documentada en el propio JSON.

## 4.a · Vistosidad

- **La rareza se tiene que ver**: marco, fondo y/o cinta distintos para `comun` / `poco-comun` /
  `raro` / `legendario`, coherentes con los tokens de `ranger.css` (el dorado `--sun` ya se usa para
  desbloqueado). Que un legendario se distinga de un común a un metro de distancia.
- **Medalla, no tarjeta de texto**: pieza gráfica cuadrada o circular con el icono grande, el título
  debajo y la descripción en segundo plano. La rejilla actual es una lista con opacidad.
- **Progreso hacia el siguiente**: cada logro bloqueado enseña «12 / 25» y una barra. La métrica ya
  está en el agregado de cuenta; es cuestión de leerla, no de calcular nada nuevo.
- **Orden útil**: dentro de cada categoría, primero lo que está más cerca de caer. Un muro de
  legendarios inalcanzables desanima.
- **Cabecera por categoría** con su icono y su recuento («Territorio pisado · 3 de 7»).
- **Celebración**: `achievements/celebracion.js` ya tiene cola y cartel animado. Súbele el nivel
  (medalla que entra girando, contador, el eco de la rareza), **respetando `data-motion="reduce"`**
  de `prefs.js`: con movimiento reducido, aparece sin animación.
- Silueta para los bloqueados si quieres reservar la sorpresa, pero **la pista de cómo se consigue
  siempre visible**: un logro que no se sabe cómo se gana no motiva, desconcierta.

## 4.b · Coherencia nacional

Revisa el catálogo entero con España delante, no Murcia:

- Los umbrales de `regionsVisited` (17 CCAA + 2 ciudades autónomas) y `provincesVisited` (50) tienen
  que formar una escalera con sentido, y los `legendario` han de ser **difíciles, no imposibles**:
  la escala documentada dice que legendario son «años, y recorrer España».
- **Ningún título ni descripción puede nombrar un espacio o una comunidad concreta**, ni dar por
  hecho el mar, la montaña o el clima de una región. Es la regla 3 del `CLAUDE.md` («un texto
  universal que nombre un espacio concreto es un error del validador, no un aviso»), y aquí aplica
  igual.
- Considera hitos territoriales nuevos que hoy no existen: primera comunidad completada, espacios de
  X comunidades distintas, provincias limítrofes, la vuelta a un mismo espacio en cuatro estaciones.
  Toda métrica nueva hay que **implementarla en los dos lados** (`account_progress.php` y el espejo
  de `achievements/agregacion.js`), o el logro no se evalúa igual online y offline.
- Ajusta los umbrales al catálogo real: hoy hay **16 espacios** dados de alta
  (`Docs/rollout/ESTADO.md`), no 200. Un logro de «50 espacios» hoy no es raro: es imposible.

## Reglas que no se pueden saltar en esta fase

- **`id` estable: no se reordena ni se reutiliza.** Un `id` reciclado le cambia el logro a quien ya
  lo tenía en `user_achievements`.
- Añadir un logro **es añadir una entrada al JSON**, sin tocar código en ninguno de los dos lados.
  Si te ves tocando código para un logro nuevo, es que la métrica no existe: impleméntala en los dos
  sitios, y entonces el logro vuelve a ser una entrada del JSON.
- Si tocas el criterio de deduplicación de especies, va en paralelo en
  `account_progress.php::canonicalSpeciesKey()` y `achievements.js::canonicalSpeciesKey()`.
- Tras cambiar umbrales o métricas: `php Tools/recalculate-account-progress.php`, que reconstruye el
  progreso de todos los usuarios. Está pensado justo para esto.
- Sube `version` en `achievements.json`.

**Aceptación.** La rejilla se entiende de un vistazo y distingue rarezas; cada bloqueado dice cuánto
falta; ningún texto nombra Murcia ni ningún espacio; `npm test` sigue verde; el recálculo no cambia
los logros ya ganados de un usuario de prueba salvo donde se hayan movido umbrales a propósito, y ese
movimiento está justificado en el commit.

---

# FASE 5 — Los avistamientos, en Darwin Core

Esta es la fase grande y la que tiene datos de usuario en juego. **Hazla en una sesión aparte, con
copia de seguridad de la BD (`npm run db:backup`) hecha antes de empezar.**

**El encargo**: que los registros de avistamiento sean **Darwin Core como esquema canónico**, no una
traducción a posteriori, para que en el futuro puedan servir a la ciencia (publicación en GBIF /
GBIF.ES, cesión a un banco de datos de biodiversidad, o simplemente que otro los pueda leer).

**Qué hay hoy — y por qué no vale.**

| Dónde | Qué guarda | Problema |
|---|---|---|
| `user_progress.payload` (TEXT) | `{ seenSpeciesIds, seenPoiIds, sightings: { <speciesId>: {lat,lng,at} }, markedAt, updatedAt }` | Un **JSON dentro de una columna**, indexado por el `species_id` **de ese parque**: no es una tabla de ocurrencias, no se puede consultar, y una especie solo admite **un** avistamiento por parque |
| `observations` | `species_id, user_label, note, latitude, longitude, observed_at, validation_status` | Tabla del prototipo, **no la usa nadie** en el flujo actual. Es el punto de partida natural |
| `user_park_visits` | La visita verificada: `started_at`, `fix_count`, `distance_m`, `best_accuracy_m`, `verified`, `suspicious`, `flags` | Aquí está la trazabilidad de calidad, hoy **desconectada** del avistamiento |
| `user_invasive_sightings` | `user_id, invasive_id, seen_at` | Sin coordenadas: un avistamiento de invasora **no es publicable** tal cual |

Lo que falta para que un registro sea válido como ocurrencia: **identificador estable**, `eventDate`
en ISO 8601 con huso, **incertidumbre de la coordenada** (el `accuracy` del GPS se recibe en
`presence.php` y no se guarda por avistamiento), `basisOfRecord`, taxonomía con identificadores
(`gbif_species_key`, `eidos_taxonid`), localidad y provincia, licencia, y el estado de verificación.

## Qué implementar

**1. Tabla canónica de ocurrencias.** Nueva tabla (p. ej. `user_occurrences`) cuyas **columnas sean
términos Darwin Core**, no traducciones. Mínimo:

- Registro: `occurrence_id` (UUID v4 estable, expuesto como URN — **nunca** un autoincremento),
  `basis_of_record` = `HumanObservation`, `occurrence_status` = `present`, `individual_count`,
  `occurrence_remarks`, `recorded_by` (nombre público del usuario o seudónimo), `recorded_by_id`,
  `modified`.
- Evento: `event_date` (ISO 8601 **UTC**, como el resto del backend, que escribe con `gmdate` y
  nunca `NOW()`), `event_time`, `sampling_protocol`, `event_id` ⇒ **la visita verificada**
  (`user_park_visits.id`): así cada ocurrencia hereda su trazabilidad.
- Lugar: `decimal_latitude`, `decimal_longitude`, `geodetic_datum` = `WGS84`,
  `coordinate_uncertainty_in_meters` (del `accuracy` del GPS — **hay que empezar a guardarlo**),
  `country_code` = `ES`, `state_province` (CCAA), `county` (provincia), `locality` (nombre del
  espacio), `location_id` (slug + código Natura 2000 del espacio), `georeference_protocol`.
- Taxón: `scientific_name`, `taxon_rank`, `kingdom`…`genus`, `taxon_id` (EIDOS),
  `scientific_name_id`, `taxon_concept_id` (clave GBIF como URL).
- Calidad: `identification_verification_status` (derivado de la presencia verificada: **la regla del
  proyecto es que solo cuenta lo marcado dentro de una visita verificada**, y eso es exactamente lo
  que un banco de datos necesita saber), `identified_by`, `date_identified`.
- Derechos: `license`, `rights_holder`, `institution_code`, `dataset_name`, `dataset_id`.
- Sensibilidad: `information_withheld`, `data_generalizations`.

**2. Migración de lo que ya hay, sin perder nada.** Un `ALTER`/`INSERT … SELECT` **idempotente** en
`Database/migrations.sql` que vuelque los `sightings` de `user_progress.payload` a la tabla nueva,
cruzándolos con `user_park_visits` para decidir el estado de verificación y con `species` para la
taxonomía. **`user_progress` se queda como está**: es lo que la app lee y lo que hace que el progreso
sea local-first; la tabla nueva es la capa científica que se deriva de ella. Un segundo pase de la
migración no debe cambiar un byte (regla 6 del `CLAUDE.md`).

**3. Que se capte lo que hoy se pierde.** `presence.js` envía `accuracy` y `presence.php` lo valida
contra `MAX_ACCURACY_M`, pero por avistamiento no se guarda nada de eso. Al marcar una especie
(`app.js` §248–353 → `progress.php`) hay que registrar **la precisión del GPS de ese momento**, la
visita en curso y la hora exacta con huso. Sin `coordinateUncertaintyInMeters`, un registro es
inservible para casi cualquier análisis.

**4. Invasoras al mismo modelo.** `user_invasive_sightings` no tiene coordenadas. Una cita de especie
exótica invasora georreferenciada es, de todo lo que recoge la app, **lo que más valor tiene para una
administración**. Llévala a la misma tabla de ocurrencias.

**5. Exportador Darwin Core Archive.** `Tools/export-dwc.js` (o `.php`, si necesita la BD; mira
`Tools/lib/` **antes** de escribir nada nuevo) que genere un DwC-A completo: `occurrence.txt`
(TSV, UTF-8), `meta.xml` con el mapeo de términos a sus URIs
(`http://rs.tdwg.org/dwc/terms/…`) y `eml.xml` con los metadatos del conjunto. Con `--usuario` para
un solo usuario y sin filtro para el conjunto completo. Valídalo con el
[GBIF Data Validator](https://www.gbif.org/tools/data-validator) antes de darlo por bueno y deja el
informe en `Docs/`.

**6. Sensibilidad y privacidad — y esto no es opcional.**

- **Coordenadas de especies amenazadas.** Publicar la posición exacta de un ejemplar de una especie
  en peligro es una forma conocida de facilitar su expolio. Aplica la práctica estándar:
  **generalizar** la coordenada (redondeo a 1 km o 10 km según categoría) para los taxones con
  categoría de amenaza, dejando constancia en `dataGeneralizations` e `informationWithheld`. El dato
  fino se conserva en la BD; lo que se generaliza es **la exportación**. Deriva el criterio de
  `spainStatus` / `rarityLocal`, no de una lista escrita a mano.
- **Consentimiento.** Los datos llevan nombre de observador. Añade en «Perfil y ajustes» una
  preferencia explícita —«Compartir mis avistamientos con fines científicos», por defecto **apagada**
  y explicada en llano— y respétala en el exportador. Encaja con `prefs.js` y su espejo en el
  servidor (`account.php`).
- **No se guarda la traza del paseo**, y eso sigue igual (`presence.js`): la ocurrencia es un punto,
  no un recorrido.

**7. Documentación.** `Docs/DARWIN-CORE.md`: qué término sale de dónde, con las URIs; qué se
generaliza y por qué; cómo se exporta; y qué falta para que el conjunto sea publicable en GBIF.
Actualiza `Docs/arquitectura/MODELO-DE-DATOS.md` y `PROCEDENCIA-DE-CAMPOS.md`, y añade la fila
correspondiente a `Database/CLAUDE.md` (fuente vs. generado).

> **Aviso que hay que mantener**, y que es la regla 7 del `CLAUDE.md`: este catálogo es recopilación
> sobre fuentes públicas, **no un inventario validado en campo**. Un registro de un usuario es una
> observación ciudadana sin validar por un experto, y así tiene que salir etiquetado
> (`identificationVerificationStatus`). No lo presentes como dato oficial.

**Aceptación.** La migración pasa dos veces sin diff; ninguna cita existente se pierde; un
avistamiento nuevo guarda incertidumbre, visita y hora con huso; el DwC-A generado pasa el validador
de GBIF sin errores; las especies amenazadas salen generalizadas; sin consentimiento no se exporta
nada de ese usuario; `npm run validate` y `npm test` verdes.

---

# Cierre

- **Un commit por fase**, en castellano, describiendo el problema resuelto, no el fichero tocado.
- Fase 1 y 2 tocan `Frontend/` y `sw.js`: **sube `VERSION` del Service Worker** y añade los módulos
  nuevos a `SHELL_ASSETS`.
- Fases 4 y 5 tocan la BD: recuerda que **la API tiene prioridad sobre el `park.json` empaquetado**,
  y que tras editar contenido hay que regenerar con `npm run export:park -- <slug>` subiendo
  `manifest.version`.
- Cuando acabes, actualiza `Docs/DEUDA-TECNICA.md` (tacha lo pagado, añade lo que aparezca) y deja el
  informe de la sesión en `Docs/rollout/sesiones/<periodo>.md`, con una línea en
  `Docs/rollout/ESTADO.md`.
- Prueba **de verdad en móvil**, no solo en un viewport estrecho: esta tanda entera va de eso.
