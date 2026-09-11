# Prompt · (k) Analítica de biodiversidad agregada por espacio

> Pega esto en Claude Code, en la raíz del repo, para construir desde cero la pestaña
> «Biodiversidad» y la herramienta que la alimenta. Es autocontenido: no da por supuesto nada de
> conversaciones anteriores. Si los ficheros ya existen en el árbol de trabajo, léelos primero y
> trátalo como una revisión, no como una reimplementación.

---

NaturDex ya publica, para cada espacio dado de alta, un catálogo de hábitats (con código HIC y si son
prioritarios) y de especies (con `kingdom`, `group`, taxonomía y el tramo de rareza legal 1–5). Lo
que no existe es ninguna vista que **agregue** ese dato: hoy solo se ve ficha a ficha.

Quiero **analítica ecológica sobre el catálogo ya publicado**: riqueza de especies, reparto de
rareza legal, hábitats prioritarios y comparativa entre espacios. Es agregación pura — no se
inventa, se importa ni se recalcula ningún dato nuevo, en coherencia con la regla del `CLAUDE.md`
raíz: ante la duda, hueco documentado antes que dato inventado.

Lee antes de empezar: `CLAUDE.md` (raíz), `Tools/CLAUDE.md`, `Frontend/Js/CLAUDE.md`,
`Docs/arquitectura/APLICACION.md` y `Docs/COMANDOS.md`.

## El hallazgo que condiciona todo el diseño

`Frontend/Js/data.js::loadData()` **sustituye por completo** `state.data` por la respuesta de
`Backend/Api/species.php` cuando hay backend accesible — no hace merge. Esa respuesta la construye
`Backend/Lib/park_payload.php` campo a campo desde la BD. Por tanto **cualquier campo nuevo metido
dentro de un `park.json` (p. ej. `park.biodiversity`) desaparecería sin error ni aviso en cuanto
hubiera un backend desplegado.**

Así que el dato agregado **no va dentro de `park.json`**. Va en un fichero nuevo e independiente,
`Frontend/Data/parks-biodiversidad.json`, cargado aparte con
`NaturDexOffline.fetchJsonCached(...)` — el mismo mecanismo que ya usan `Data/glosario.json` y
`Data/achievements.json`, que tampoco pasan por `species.php`. Así el dato sobrevive tanto al modo
estático como al modo con backend.

## 1. La herramienta

Crea `Tools/catalogo-nacional/build-biodiversidad-stats.js`, registrado como
`npm run especies:biodiversidad` en `package.json` (junto a los `especies:*` que ya existen).

- Solo lectura de los `park.json` ya publicados, vía `parkFiles()` de `Tools/lib/io.js`. **Sin red.**
  No usa `escribeEspacio()`: no toca ningún `park.json`.
- Procesa cada espacio con `park.species.length > 0` — el mismo criterio que ya usa
  `mide-niveles-puerta.js`, no una lista de slugs a mano: el rollout sigue avanzando.
- Cuenta solo especies con `visible !== false`, el mismo criterio que `applyVisibility()` en
  `data.js`.

Por espacio calcula:

- **Hábitats**: total, cuántos son prioritarios (`habitat.priority === true`) y su porcentaje.
- **Especies**: total, desglose flora/fauna por `kingdom` y recuento por `group`.
- **Rareza**: recuento por tramo 1–5 más un cubo `sinCalcular` para las que no tienen tramo
  (null/ausente **no es lo mismo que tramo 1** en este catálogo), el `%` con alguna figura de
  protección (tramo ≥ 2) y el `%` en categoría de amenaza (tramo ≥ 4).
- **Evidencia documental (opcional)**: si existe `Tools/catalogo-nacional/out/niveles-puerta.json`
  (lo genera `npm run especies:niveles -- --json <ruta>`), incorpora el reparto N1/N2/N3 de ese
  espacio tal cual. Si no existe, **omite el campo entero y avisa por stderr** con el comando que
  haría falta. No lo inventes ni lo recalcules por otra vía.

Dos detalles que no son opcionales:

- El tramo de rareza se lee con exactamente la misma escalera que el frontend, no con una propia.
  `Frontend/Js/rareza.js::tramoDe()` hace `rarityLocal ?? (rarityBasis ? rarityScore : null)` y
  valida que caiga en 1–5. Node y el navegador no pueden compartir ese módulo, así que se duplica en
  el script **con un comentario cruzado que apunte al otro lado**; el repo ya acepta ese patrón para
  el resto de la escalera. Igual con el umbral de amenaza (`TRAMO_AMENAZA = 4`).
- **No escribas ningún `generatedAt`, timestamp ni hash de ejecución en la salida.** La regla nº 7
  del repo es que reejecutar cualquier herramienta no cambie ni un byte, y una marca de tiempo la
  rompe. Comprueba la idempotencia comparando el SHA256 de dos pasadas seguidas.

Salida, un único `Frontend/Data/parks-biodiversidad.json` con un `_comment` de «generado, no editar a
mano» y un objeto `porParque` indexado por slug.

## 2. El frontend

- **Módulo nuevo** `Frontend/Js/render/biodiversidad.js`, reexportado desde el barril
  `Frontend/Js/render.js`. Sigue la convención de `render/*`: lee de `state.js`, escribe por las
  referencias de `dom.js`, genera HTML **solo** con la plantilla etiquetada `html` de `util.js` (que
  escapa sola) y **no registra listeners** — de eso se encarga la delegación de `app.js`.
- Reutiliza el vocabulario y los colores que ya define `Frontend/Js/rareza.js` (`TRAMOS`, las clases
  `rareza-N` que ya tiñen las tarjetas). **Nunca una segunda paleta.** Los fondos salen de las
  custom properties `--rareza-N-bg` que ya existen, aplicadas con selectores compuestos y acotados
  (`.progress-row.rareza-N`), nunca con una regla genérica `.rareza-N{}`.
- **Carga del dato**: un `loadBiodiversidad()` en `data.js` que haga
  `NaturDexOffline.fetchJsonCached('Data/parks-biodiversidad.json')` y devuelva `porParque`,
  con `try/catch` que caiga a `{}` — sin el fichero, la pestaña dice que todavía no hay datos, no
  revienta.
- **Pestaña**: un `<button class="view-tab" data-view="biodiversidad">` en `index.html` junto a los
  tres que ya hay, su `<section id="biodiversidadPanel" class="progress-panel" hidden>`, y el wire en
  `app.js` (`setView()`, `vistaArriba()`, y el selector de `applyParkLevel()` que oculta la pestaña
  en los espacios `basic` igual que ya oculta Progreso).
- **Móvil**: **no** añadas un quinto icono a la nav inferior — ya tiene cuatro y el quinto la
  aprieta. Se entra por un enlace al final de la pestaña Progreso, el mismo patrón exacto que ya usa
  el Diccionario (`.dicc-link`), incluido el ocultarse en escritorio ≥901px, donde la pestaña ya da
  acceso.
- **Comparativa entre espacios**: en vez de una pantalla nueva, añade una línea compacta
  («🌿 93 especies · 7 hábitats») al popup de cada marcador del mapa de España del selector, en
  `auth.js`, leyendo el mismo `parks-biodiversidad.json`. Ojo: `auth.js` es un script clásico (IIFE),
  no un módulo ES; `initSpainMap()` tendrá que pasar a `async` y su llamada a `await`.
- **Service worker**: sube `VERSION` en `Frontend/sw.js` y añade el módulo nuevo y el JSON nuevo a
  `SHELL_ASSETS`, con el comentario fechado que lleva cada entrada. Sin eso la app queda rota sin
  conexión — es una regla explícita del propio fichero.

## 3. Documentación

Una línea en cada sitio, siguiendo la convención de cada tabla: `Tools/CLAUDE.md`,
`Frontend/Js/CLAUDE.md`, `Docs/COMANDOS.md` y un párrafo corto en `Docs/arquitectura/APLICACION.md`
explicando **por qué** el dato vive fuera de `park.json` y por qué en móvil no hay quinto icono.

## Trampas ya conocidas (ahórratelas)

- **La cuarta pestaña no cabe en una fila.** `.view-tabs` era `display:flex` con `flex:1 1 auto`, y
  con cuatro botones el rótulo más largo se corta a media palabra dentro de la columna izquierda.
  Hace falta `flex-wrap:wrap` y una base del 50 % para que se repartan en dos filas de dos; en los
  espacios `basic`, donde quedan dos, siguen ocupando una sola fila.
- El repo escribe siempre **«Atlas de Hábitats»**, con tilde.
- Los porcentajes con un decimal (`42.9%`, `8.6%`) se leen bien; no los redondees a entero.

## Verificación

1. Ejecuta la herramienta dos veces seguidas y comprueba por SHA256 que la salida no cambia. Prueba
   también la rama con y sin `out/niveles-puerta.json`.
2. Contrasta los totales de especies contra la salida de `npm run especies:niveles`, que los cuenta
   por su cuenta: deben coincidir espacio por espacio. Si no coinciden, el filtro de visibilidad está
   mal.
3. `npm run validate`, `npm test` y `npm run typecheck` en verde. (`npm test` necesita PHP en el
   PATH.)
4. Comprobación visual real, no solo estática: sirve `Frontend/` y recorre portada → selector →
   un espacio con catálogo → pestaña Biodiversidad, y repite a 390 px de ancho para el enlace desde
   Progreso. Mira que ninguna pestaña se corte y que los colores de rareza sean los del catálogo.
5. En DevTools → Application, que el módulo y el JSON nuevos queden precacheados tras subir
   `VERSION`.

No hagas commit ni abras PR salvo que te lo pida.
