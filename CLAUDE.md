# NaturDex — guía para agentes

PWA offline-first de los espacios naturales protegidos de España: mapa con límites oficiales,
catálogo de hábitats y especies, y una mecánica tipo pokédex en la que descubrir una especie exige
**estar allí** (la posición se verifica contra el límite oficial).

**Esto es el índice, no el manual.** Está pensado para leerse entero (son dos páginas) y para que
después cargues **solo** el documento o la carpeta que la tarea necesite. No leas el repo a ciegas.

---

## 1. Las reglas que no se negocian

1. **El vínculo especie↔hábitat es siempre derivado.** Ninguna fuente oficial lo afirma. Se construye
   cruzando dos señales y guardando de dónde sale cada una, en `species_habitats.evidence`. Límites,
   hábitats, taxonomía y estado de conservación **sí** son dato oficial directo.
2. **Ante la duda, hueco documentado antes que dato inventado.** Un `reviewNote` visible en la app
   vale más que un campo relleno a ojo. **Nunca rellenes un campo de fuente con una suposición.**
3. **El orden de prioridad de las fuentes: legislación → EIDOS → GBIF, y GBIF solo corrobora.**
   Ninguna especie entra en el catálogo de un espacio porque GBIF tenga avistamientos suyos ahí
   dentro. Manda lo que la **norma del espacio** enumera (anexo del PORN/PRUG o del decreto de
   declaración) y lo que declara el **formulario oficial del sitio Red Natura 2000**; después, la
   figura legal de **EIDOS** y las especies características del HIC según el **Atlas**; y GBIF, al
   final, solo para **confirmar que eso está aquí**. El motivo es que GBIF no distingue lo
   característico de lo que pasaba por allí: dentro del límite de un parque caen olivos de bancal,
   ornamentales de una casa de campo y bichos en tránsito, y la app existe para enseñar la riqueza de
   un espacio protegido, no el jardín de al lado. Lo aplica `build-species-seleccion.js`, en tres
   niveles y con `--gbif-sin-respaldo` como escotilla explícita.
   > **Y lo que cuesta, que hay que tenerlo delante:** los catálogos legales enumeran *lo protegido*,
   > no *lo característico*, y lo común no está protegido por ser común. Medido el 2026-08-16,
   > **330 de 1.161 fichas (28 %) se sostienen solo en GBIF** — el romero y el pino carrasco de
   > Sierra de la Pila entre ellas. La salida no es relajar la puerta. El **índice del Atlas** —la
   > fuente que dice «esta especie es característica de este hábitat»— se completó ese mismo día y
   > rescata 32 (el pino carrasco sí; el romero **no**: el Atlas enumera diagnósticas, no
   > dominantes), así que el grueso cuelga de **transcribir los planes de gestión que faltan**
   > (deuda nº 1).
4. **Universal vs. local.** Especies y hábitats son nacionales. Lo universal (qué *es* la especie, qué
   *es* el código HIC) vive en `Tools/catalogo-nacional/data/`; lo local (dónde y cómo aparece aquí)
   en cada `park.json`. **Un texto universal que nombre un espacio concreto es un error del
   validador, no un aviso.**
5. **`npm run validate` tiene que salir en verde.** Bloquea el commit vía `.githooks/pre-commit`.
6. **El huso UTM se lee del `.prj`, nunca se asume.** 28N Canarias, 29N/30N/31N península.
7. **Idempotencia como prueba.** `build-n1-espacios`, `merge-habitats`, `adopt-habitats`,
   `fix-estado-conservacion-iepnb`, `sync-species-catalog` y el volcado de ocurrencias de
   `migrations.sql` no deben cambiar un byte en un segundo pase. Si un segundo pase produce diff, hay
   un problema.
8. **Un ave no entra por sus ocurrencias.** Vuela: un registro en vuelo cae dentro de cualquier
   polígono, así que la prueba de constancia que vale para una planta ahí no mide nada. La puerta de
   las aves es el **respaldo de sitio** —el formulario oficial del sitio Red Natura 2000 o el anexo
   normativo del espacio—, y GBIF queda como confirmación.
   [`Docs/runbook/AVES.md`](Docs/runbook/AVES.md).
9. **La coordenada de una especie amenazada no se publica exacta.** Al exportar se generaliza a 1 o
   10 km según su tramo de rareza legal, y el registro lo dice. Un taxón **sin** tramo calculado se
   generaliza igual: «nadie lo ha mirado» no es «no está amenazada», y publicar de más no se puede
   deshacer. Ver [`Docs/DARWIN-CORE.md`](Docs/DARWIN-CORE.md).

## 2. Doce cosas que fallan EN VERDE

Sin error, sin aviso, deshaciendo trabajo en silencio. Detalle en
[`Docs/runbook/ORDEN-DE-OPERACIONES.md`](Docs/runbook/ORDEN-DE-OPERACIONES.md).

- `species:apply` sin `species:extract` antes **pisa** las fotos escritas en el `park.json`.
- Una entrada obsoleta en `data/contenido/*.json` **revierte** cualquier corrección en cada extracción.
- **Renombrar un taxón** desengancha su entrada del catálogo universal y su texto de
  `data/contenido/`, que se indexan por nombre científico. Cambia la clave allí también y pasa
  `npm run species:poda`. Y deja **un tercer rastro que no se ve desde el repositorio**: en la BD, la
  fila con el nombre viejo, porque `build-park-sql.js` solo hace UPSERT. El borrado va aparte
  (`Database/poda-renombrados-*.sql`).
- **Corregir un campo UNIVERSAL en el `park.json`** —`taxonomy`, `description`, `image`…— y no en
  `data/especies-universal.json`: el siguiente `species:apply` lo revierte en silencio, porque es de
  ahí de donde reparte. Pasó el 2026-08-17 con el género del romero, corregido en los ocho espacios y
  devuelto a «Salvia» acto seguido. La prueba de que la corrección está en el sitio bueno es pasar
  `species:extract` + `species:apply` detrás y ver «actualizadas 0».
- **Un nombre científico que la autoridad ya da por sinónimo** no falla: el cruce contra el
  formulario del sitio o el anexo de la norma se hace por nombre, así que la especie queda fuera con
  un motivo escrito al lado que es mentira. `scan-taxones-duplicados` **no puede verlo** —busca un
  taxón dado de alta dos veces y éste está una sola—; lo caza `taxones:nomenclatura`.
- **La API tiene prioridad sobre el `park.json` empaquetado.** Con backend desplegado, tocar solo el
  frontend no cambia lo que ve el usuario: hay que generar y aplicar también el SQL.
- **Un extractor de PDF distinto = cero resultados sin aviso.** Le pasó al Atlas de Hábitats, que solo
  se sabía leer en el formato de `pdftotext -layout`. Si una herramienta que lee texto extraído
  devuelve 0, sospecha del formato antes que del dato — y haz que se queje, como hace ya
  `lib/atlas.js`.
- **Cruzar una fuente oficial con el catálogo por el nombre**: la fuente cita con la nomenclatura de
  su época (*Sylvia undata*) y el catálogo con la de hoy (*Curruca undata*). No falla: excluye la
  especie y escribe al lado un motivo que es mentira («no figura en el formulario oficial»). Resuelve
  contra EIDOS el nombre **de la fuente**, no solo el del candidato. Ver
  [`Docs/runbook/AVES.md`](Docs/runbook/AVES.md) §5.
- **Una corrección hecha en el `park.json` y no en el pipeline** la deshace la siguiente
  regeneración. La curruca rabilarga se arregló en una ficha el 2026-08-09 y las cuatro Capas 3
  generadas después la volvieron a partir en dos. Arregla **el dato y la entrada de `data/`**.
- **`build-park-sql.js` solo hace UPSERT.** Quitar una ficha del `park.json` y regenerar el SQL deja
  la BD igual, y la API manda sobre el paquete: el usuario la sigue viendo. El borrado va aparte.
- **Un `rarityScore` sin `rarityBasis` es un número puesto a ojo, y ascendía solo al campo que ve el
  usuario.** `build-species-n2.js` lo usaba de suelo del `rarityLocal` —«el local incluye al
  estatal»— sin comprobar que viniera de una norma, y de paso pisaba el `rarityLocalBasis` derivado
  con uno sin `categoria` ni `norma`, así que el cartel de la ficha se quedaba sin la figura legal
  que debía citar. Nada fallaba: el número estaba en el tramo 1–5 y `validate` solo lo avisaba. En
  Calblanque eran 32 de 205 fichas, y la siempreviva de Cartagena salía «En peligro» siendo
  **Vulnerable** en el Decreto 50/2003. Tapado el 2026-08-21 en las dos puntas —el pipeline y la
  reserva de `Frontend/Js/rareza.js`—; la migración de fondo es la deuda nº 29.
- **Una ocurrencia dentro de un polígono no dice que la especie viva ahí.** Es la regla con la que se
  derivan los 4.379 enlaces especie↔hábitat, y en un hábitat que es una cinta de metros —un
  manantial, una charca, un cauce— cualquier registro tomado en el sendero de al lado cae dentro. En
  Carrascoy había una ardilla roja y un algarrobo fichados en manantiales petrificantes. Se repasa
  con `npm run especies:habitats`; el **40 % de los enlaces medibles se sostiene sobre un solo
  registro** y eso sigue abierto (deuda nº 22).

---

## 3. Dónde buscar, según la tarea

| Si la tarea es… | Empieza por |
|---|---|
| Entender el modelo de datos | [`Docs/arquitectura/MODELO-DE-DATOS.md`](Docs/arquitectura/MODELO-DE-DATOS.md) |
| Saber de dónde sale un campo | [`Docs/arquitectura/PROCEDENCIA-DE-CAMPOS.md`](Docs/arquitectura/PROCEDENCIA-DE-CAMPOS.md) — campo a campo, con las URLs de las fuentes |
| Dar de alta o ampliar un espacio | [`Docs/runbook/ALTA-DE-ESPACIO.md`](Docs/runbook/ALTA-DE-ESPACIO.md) + [`Docs/runbook/TRAMPAS-CONOCIDAS.md`](Docs/runbook/TRAMPAS-CONOCIDAS.md) |
| Tocar cualquier cosa de aves | [`Docs/runbook/AVES.md`](Docs/runbook/AVES.md) — **entran por otra puerta que el resto**, y el documento dice también qué NO cubre esa puerta |
| Dudar de si una especie pertenece al hábitat del que cuelga | [`Docs/auditoria-especie-habitat.md`](Docs/auditoria-especie-habitat.md) — el estado de los 4.379 enlaces, enlace a enlace. Lo regenera `npm run especies:habitats`; el criterio vive en la cabecera de la herramienta y en `Tools/lib/medios.js` |
| Saber en qué estado está un espacio | [`Docs/rollout/ESTADO.md`](Docs/rollout/ESTADO.md) — **la tabla**. Los informes de cierre están en `Docs/rollout/sesiones/`, uno por periodo: entra solo al que haga falta |
| Tocar el frontend | [`Frontend/Js/CLAUDE.md`](Frontend/Js/CLAUDE.md) |
| Tocar la API | [`Backend/CLAUDE.md`](Backend/CLAUDE.md) |
| Escribir o usar una herramienta | [`Tools/CLAUDE.md`](Tools/CLAUDE.md) — **mira `Tools/lib/` antes de escribir nada nuevo** |
| Tocar SQL | [`Database/CLAUDE.md`](Database/CLAUDE.md) — qué fichero es fuente y cuál es generado |
| Tocar avistamientos, ocurrencias o su exportación | [`Docs/DARWIN-CORE.md`](Docs/DARWIN-CORE.md) — término a término, qué se generaliza y por qué |
| Elegir el siguiente trabajo | [`Docs/DEUDA-TECNICA.md`](Docs/DEUDA-TECNICA.md), por orden de rentabilidad |
| Recordar un comando | [`Docs/COMANDOS.md`](Docs/COMANDOS.md) |

## 4. Búsqueda: lo que está excluido a propósito

`.ignore` (para `rg`) y `permissions.deny` en `.claude/settings.json` sacan de las búsquedas los
bundles compilados, los volcados SQL de datos, las teselas, los binarios y las descargas de fuentes.
Son megabytes de dato generado sin nada que buscar a mano.

**Sí** se buscan: `Database/schema.sql`, `Database/migrations.sql`, todo `Frontend/Js/`,
`Backend/`, `Tools/`, `AdminPanel/src/` y `Docs/`.

Para saltarse la exclusión puntualmente: `rg --no-ignore <patrón> <ruta>`.

---

## 5. Comprobaciones antes de dar nada por hecho

```bash
npm run validate            # BLOQUEA. Coherencia park.json ↔ manifest ↔ geojson, contadores,
                            # integridad especie↔hábitat, licencias de foto, presupuesto offline
npm test                    # reglas de presencia y progreso (PHP, sin BD)
npm run typecheck           # tsc --noEmit sobre AdminPanel
npm run taxones:duplicados  # sale con código 1 mientras queden
npm run taxones:nomenclatura # el nombre de la ficha contra EIDOS y GBIF; sin --online no gasta red
npm run especies:habitats   # repasa los enlaces especie↔hábitat; sin --write no toca nada
npm run glossary:check      # editorial, no bloquea
```

Sin red externa, casi todo `Tools/` falla con errores que no explican nada: `npm run red:check` lo
dice en diez segundos.

## 6. Convenciones de este repo

- **Comentarios de cabecera obligatorios.** Cada módulo abre explicando *qué problema resuelve*, no
  qué hace. Es la convención más valiosa que tiene el repo: mantenla en todo fichero nuevo.
- **Todo en castellano**: código, comentarios, documentación y commits.
- **Frontend sin build ni framework**: módulos ES nativos. El AdminPanel sí es React+Vite y se
  compila a `Frontend/admin/`.
- **Tooling zero-dep** salvo `polygon-clipping`.
- **JSON canónico**: `io.writeJson` (2 espacios + salto final). Escribir de otra forma produce un
  diff completo aunque no cambie ningún dato.
- **Al cerrar una sesión de rollout**: el informe va en `Docs/rollout/sesiones/<periodo>.md` y en
  `Docs/rollout/ESTADO.md` solo la fila de la tabla y una línea de índice.

## 7. Aviso

Este catálogo es recopilación sobre fuentes públicas, **no un inventario validado en campo**. No
presentes un dato derivado como si fuera oficial.
