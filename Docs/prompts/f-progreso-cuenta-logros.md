# Prompt · (f) Progreso de cuenta a nivel estatal + logros con celebración animada

> Pega esto en Claude Code para que diseñe e implemente la capa de progreso de cuenta y el sistema de logros.

---

Quiero añadir a NaturDex una **segunda capa de progreso**, por encima de la que ya existe. Hoy el
progreso vive **por parque**: cada usuario tiene un registro en `user_progress` con
`{ seenSpeciesIds, seenPoiIds, sightings, updatedAt }` para un `park_slug` concreto, y el único
"logro" es completar el parque (`ACHIEVEMENT_NAME` en `state.js`, evaluado en `render.js`). Eso
funciona dentro de un parque, pero **no cuenta nada a nivel de cuenta**: un usuario que ha recorrido
seis espacios en cuatro comunidades autónomas no ve ningún reconocimiento agregado, y al cambiar de
parque su sensación de avance se reinicia a cero.

Quiero que exista un **progreso de cuenta, de ámbito estatal**, que agregue lo hecho en todos los
parques y almacene **logros desbloqueados** de forma permanente. Y quiero que, cuando se desbloquee
un logro, aparezca un **cartelito animado de celebración**.

## Contexto del proyecto

NaturDex es una PWA offline-first en JS vanilla (módulos ES nativos, sin build ni framework) en
`Frontend/`, con backend PHP + MySQL en `Backend/` y `Database/`. Piezas relevantes:

- **`Backend/Api/progress.php`** — GET/POST del progreso por parque. Lee/escribe `user_progress`
  (clave `user_id` + `park_slug`) guardando un JSON en la columna `payload`. Requiere sesión
  (`$_SESSION["user_id"]`, ver `auth.php`).
- **`Database/schema.sql`** — tablas actuales: `parks`, `habitats`, `species`, `species_habitats`,
  `points_of_interest`, `observations`, `users`, `user_progress`, `especies_invasoras`, `glosario`.
  Los cambios de estructura se registran también en `Database/migrations.sql`.
- **`Frontend/Js/state.js`** — única fuente de verdad del frontend: objeto `state` mutable +
  selectores puros (`computeProgress()`, `getFilteredSpecies()`…). Sin DOM ni Leaflet aquí.
- **`Frontend/Js/data.js`** — carga/guardado de progreso contra la API, con `progressScope()` para
  el ámbito de persistencia local (`naturdex.<algo>.<u{id}|anon>`) y fallback offline vía
  `NaturDexOffline.saveProgressLocal()` / `loadProgressLocal()`.
- **`Frontend/Js/render.js`** — pinta la pestaña Progreso; ahí está hoy la detección
  `justUnlocked = progress.parkComplete && !state.parkWasComplete` y `achievementCard(...)`.
- **`Frontend/Js/auth.js`** — flujo de pantallas (`showScreen`), `screen-select` (mapa de España +
  selector de parque) y `enterPark(slug)` → `window.startParkExperience(slug, user)` en `app.js`.
- **`Frontend/Data/parks-index.json`** — registro nacional de espacios protegidos organizado por
  comunidad autónoma y provincia, con `status` por espacio: `basic` (ficha base sin catálogo),
  `available` (catálogo completo) y `planned` (anunciado, sin datos).

Convenciones que debes reutilizar en lugar de inventar otras:

- **Variables CSS** de `:root` en `Frontend/Css/styles.css`: `--ink`, `--muted`, `--line`, `--paper`,
  `--panel`, `--leaf`, `--sea`, `--sun`, `--danger`, `--shadow`, `--radius-sm`, `--radius-md`,
  `--shadow-sm`. Nada de colores sueltos.
- **z-index en uso**: `.explorer-hint` 460, `.mobile-nav` 800, `.sheet-scrim` 850, `.detail-dock`
  900, `.skip-link` 1200, `.glossary-popover` 2000, overlay del tutorial 3000+. El cartel de logro
  debe verse por encima de la UI normal pero **sin tapar el tutorial** ni robarle el foco.
- **Móvil**: patrón bottom-sheet (`.sheet-scrim` + panel que sube) para paneles; el cartel de logro
  debe sentirse nativo en móvil, no un modal de escritorio recortado.
- **Accesibilidad**: foco gestionado como en `showScreen()`, `Escape` para cerrar, roles ARIA,
  y respeto obligatorio a `prefers-reduced-motion`.
- **Offline-first**: todo lo nuevo debe funcionar sin red y sincronizar al recuperarla.

## Qué quiero construir

### 1. Modelo de datos: progreso de cuenta

Añade una capa de progreso **por usuario, no por parque**. Propuesta de partida (ajústala si ves algo
mejor, pero justifica el cambio):

- Tabla **`user_account_progress`** (`user_id` PK) con un `payload` JSON de agregados derivados +
  `updated_at`: totales de especies distintas vistas a nivel estatal, POIs, hábitats completados,
  parques visitados, parques completados, comunidades autónomas y provincias distintas pisadas,
  invasoras registradas, avistamientos con GPS, primera y última actividad, racha de días.
- Tabla **`user_achievements`** (`user_id`, `achievement_id`, `unlocked_at`, `context` JSON) con
  índice único `(user_id, achievement_id)`. **Un logro desbloqueado no se pierde nunca**, aunque el
  usuario después desmarque especies.
- Migración en `Database/migrations.sql` + actualización de `Database/schema.sql`.

Punto importante de diseño: los **agregados** son derivables de `user_progress`, así que deben poder
**recalcularse desde cero** (útil para usuarios existentes y para arreglar desajustes). Escribe la
lógica de agregación en un único sitio reutilizable (p. ej. `Backend/Lib/account_progress.php`) y
llámala tanto desde el POST de `progress.php` como desde un script de recálculo en `Tools/`.

Cuidado con la unicidad de especies entre parques: la misma especie puede aparecer en varios espacios
con distinto `id` local. Decide y documenta el criterio de deduplicación estatal (idealmente por
nombre científico normalizado o taxon id, no por id de fila) y aplícalo de forma consistente.

### 2. API

Crea **`Backend/Api/account-progress.php`** (mismo patrón que `progress.php`: `session_start()`,
`apiCorsHeaders()`, 401 sin sesión, JSON UTF-8 sin escapar):

- `GET` → devuelve `{ totals, achievements: [{id, unlockedAt, context}], updatedAt }`.
- El desbloqueo **se evalúa en el servidor** cuando llega un POST a `progress.php`, y la respuesta de
  `progress.php` incluye un campo nuevo `newlyUnlocked: [...]` con los logros recién conseguidos, para
  que el frontend pueda celebrarlos sin una segunda petición. El servidor es la fuente de verdad;
  el cliente puede predecir el desbloqueo en modo offline y reconciliar al sincronizar (si el cliente
  celebró un logro que el servidor no confirma, se retira en silencio; si el servidor devuelve uno que
  el cliente no había celebrado, se celebra al reconectar).
- Define el **catálogo de logros en un solo sitio compartido** (un JSON en `Frontend/Data/` o
  `Backend/Data/` leído por ambos lados) para no duplicar reglas entre PHP y JS.

### 3. Frontend

- Nuevo módulo **`Frontend/Js/achievements.js`**: carga el catálogo, mantiene el estado de cuenta en
  `state` (`state.account = { totals, achievements: Map }`), evalúa localmente en offline y expone
  `celebrate(achievementIds)`.
- **Pestaña/vista de progreso de cuenta**: hoy la pestaña "Progreso" es del parque activo. Añade una
  vista de **progreso estatal** accesible también desde `screen-select` (tiene sentido: es la
  pantalla "meta-parque"), con:
  - Tarjetas de totales estatales.
  - Rejilla de logros: desbloqueados a color, bloqueados en gris con su meta y **barra de progreso
    parcial** ("18 / 25 especies"). Los logros bloqueados deben ser visibles y motivar, no ocultarse.
  - Un desglose por comunidad autónoma coherente con `parks-index.json`.
- El logro de parque completo existente (`ACHIEVEMENT_NAME`) **se mantiene** y se integra en el nuevo
  sistema como logro por parque, sin romper nada de `render.js`.

### 4. Cartelito animado de celebración

Cuando se desbloquea un logro, aparece un cartel de celebración. Requisitos:

- **Formato**: tarjeta compacta tipo *toast* que entra con animación (escritorio: esquina superior
  derecha o centro superior; móvil: desde abajo, coherente con el patrón bottom-sheet). Muestra icono
  del logro, título, descripción corta y — si aplica — el nuevo total ("12 parques visitados").
- **Animación**: entrada con escala + fade + un pequeño rebote, brillo/destello sutil sobre el icono,
  y salida automática a los ~5 s (con opción de cerrarla antes). Puedes añadir un confeti ligero
  **hecho a mano con CSS/canvas, sin librerías externas** (el proyecto no tiene build ni dependencias
  de front). Nada de bloquear la interacción con la app mientras se muestra.
- **Cola**: si se desbloquean varios logros a la vez (muy probable al sincronizar tras una salida al
  campo), se muestran **encadenados uno a uno**, no apilados ni superpuestos. Si son más de 3, agrupa:
  "¡3 logros nuevos!" y que al pulsar lleve a la vista de logros.
- **`prefers-reduced-motion: reduce`**: sin confeti, sin rebote, sin destellos — solo un fade suave.
  Esto no es opcional.
- **Accesibilidad**: el cartel se anuncia por `aria-live="polite"`, **no roba el foco** (el usuario
  puede estar caminando y marcando especies), es cerrable con `Escape` si está enfocado, y su
  contenido es legible por lector de pantalla.
- **Sonido**: si `audio.js` lo permite, un chime muy corto y opcional, respetando el ajuste de audio
  existente y silenciado por defecto si no hay preferencia guardada.
- **No repetir**: un logro solo se celebra una vez. Persiste qué se ha celebrado ya (ámbito
  `progressScope()`) para que un refresco de página no vuelva a lanzar la animación.

### 5. Catálogo de logros y metas

Diseña los logros calibrados al **uso real de un usuario medio**, no al de un completista. Referencia
de realismo que debes asumir:

- Una excursión típica dura 2–4 h y produce **entre 5 y 15 especies marcadas**, no 60.
- Un parque `available` tiene del orden de **decenas de especies**; completarlo es cosa de varias
  visitas, no de una tarde.
- El usuario medio visita **unos pocos espacios al año**, casi siempre en su provincia o comunidad.
- Muchos usuarios **nunca completarán** un parque entero: debe haber recompensas frecuentes en el
  tramo bajo para que el sistema enganche desde el primer día.

Con eso, la curva debe ser **densa al principio y espaciada después**. Propuesta de partida —
ajústala a los datos reales de `parks-index.json` y de los catálogos de especies antes de fijarla:

**Especies (estatal, deduplicadas)** — 1 · 5 · 15 · 30 · 60 · 120 · 250 · 500
El primero se consigue en el primer minuto; el segundo, en la primera salida; el tercero, en la
primera salida buena. A partir de 120 ya es territorio de usuario veterano.

**Parques visitados** — 1 · 3 · 5 · 10 · 25
**Parques completados** — 1 · 3 · 10 (raro y valioso; aquí sí puede doler)
**Comunidades autónomas pisadas** — 1 · 3 · 6 · 10 · 17 (el último es el logro "leyenda" del sistema)
**Provincias pisadas** — 1 · 5 · 15 · 30 · 52

**Hábitats completados** — 1 · 5 · 15 · 40
**POIs visitados** — 1 · 10 · 30 · 75
**Avistamientos con GPS registrados** — 1 · 10 · 50 · 150
**Invasoras identificadas** — 1 · 5 · 15 (encaja con el módulo `invasoras.php` y tiene valor
divulgativo real: detectar invasoras es participación ciudadana)
**Términos de glosario consultados** — 5 · 25 · 75 (premia aprender, no solo caminar)

**Constancia / hábito**:
- Salidas en días distintos: 2 · 7 · 20 · 50
- Racha de semanas con al menos una salida: 2 · 4 · 12
- Volver a un mismo parque en 3 fechas distintas (premia el vínculo con "tu" parque)

**Logros de sabor** (uno o dos, sin métrica dura, para que el sistema no se sienta una hoja de
cálculo): primera especie marcada antes de las 8:00, primera salida en invierno, completar un hábitat
sin usar el buscador… Mantén aquí el tono del logro existente `¡Más aguileño que un pijo lobo!`:
cercano, con humor local, nada corporativo.

Para cada logro define: `id` estable, título, descripción corta, icono, categoría, umbral, métrica
asociada y **rareza** (común / poco común / raro / legendario) para poder colorear la tarjeta y
graduar la intensidad de la celebración — los legendarios merecen más confeti.

Escribe los textos en **español de España, en el mismo registro divulgativo y cercano del resto de la
app**: el público son excursionistas sin formación científica. Nada de jerga de gamificación
("XP", "quests", "grind").

## Restricciones

- Sin frameworks, sin build, sin dependencias nuevas de front. Módulos ES nativos.
- Todo debe funcionar **offline** y sincronizar al volver la red.
- **Retrocompatibilidad**: los usuarios existentes con progreso en `user_progress` deben obtener sus
  agregados y logros correctos en la primera carga tras el despliegue, mediante el recálculo. Un
  usuario con 200 especies ya marcadas **no debe recibir 15 carteles de celebración de golpe** al
  entrar: en el primer recálculo, marca los logros como desbloqueados **sin celebrar**, y muestra en
  su lugar un único resumen discreto ("Has desbloqueado 15 logros con tu progreso anterior").
- El modo invitado / anónimo debe seguir funcionando: logros en local, y al registrarse se migran.
- Sin romper `progress.php`, `render.js` ni el logro de parque completo existentes.

## Entrega esperada

1. Migración SQL + `schema.sql` actualizado.
2. `Backend/Lib/account_progress.php` (agregación + evaluación de logros) y
   `Backend/Api/account-progress.php`.
3. Catálogo de logros en un único fichero de datos compartido.
4. `Frontend/Js/achievements.js` + integración en `state.js`, `data.js`, `render.js`, `app.js`.
5. CSS del cartel de celebración en `styles.css`, usando las variables existentes.
6. Script de recálculo en `Tools/`.
7. Una nota breve en `README.md` o en `Docs/` explicando el modelo de dos capas (parque / cuenta) y
   cómo añadir un logro nuevo sin tocar código.

Antes de escribir código, **enséñame primero**: (a) el esquema de tablas propuesto, (b) el catálogo
de logros completo con los umbrales ya calibrados contra los datos reales del repositorio, y (c) cómo
piensas resolver la deduplicación de especies entre parques. Espera mi visto bueno en esos tres
puntos antes de implementar.
