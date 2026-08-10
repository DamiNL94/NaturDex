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
3. **Universal vs. local.** Especies y hábitats son nacionales. Lo universal (qué *es* la especie, qué
   *es* el código HIC) vive en `Tools/catalogo-nacional/data/`; lo local (dónde y cómo aparece aquí)
   en cada `park.json`. **Un texto universal que nombre un espacio concreto es un error del
   validador, no un aviso.**
4. **`npm run validate` tiene que salir en verde.** Bloquea el commit vía `.githooks/pre-commit`.
5. **El huso UTM se lee del `.prj`, nunca se asume.** 28N Canarias, 29N/30N/31N península.
6. **Idempotencia como prueba.** `build-n1-espacios`, `merge-habitats`, `adopt-habitats`,
   `fix-estado-conservacion-iepnb` y `sync-species-catalog` no deben cambiar un byte en un segundo
   pase. Si un segundo pase produce diff, hay un problema.

## 2. Tres cosas que fallan EN VERDE

Sin error, sin aviso, deshaciendo trabajo en silencio. Detalle en
[`Docs/runbook/ORDEN-DE-OPERACIONES.md`](Docs/runbook/ORDEN-DE-OPERACIONES.md).

- `species:apply` sin `species:extract` antes **pisa** las fotos escritas en el `park.json`.
- Una entrada obsoleta en `data/contenido/*.json` **revierte** cualquier corrección en cada extracción.
- **La API tiene prioridad sobre el `park.json` empaquetado.** Con backend desplegado, tocar solo el
  frontend no cambia lo que ve el usuario: hay que generar y aplicar también el SQL.

---

## 3. Dónde buscar, según la tarea

| Si la tarea es… | Empieza por |
|---|---|
| Entender el modelo de datos | [`Docs/arquitectura/MODELO-DE-DATOS.md`](Docs/arquitectura/MODELO-DE-DATOS.md) |
| Saber de dónde sale un campo | [`Docs/arquitectura/PROCEDENCIA-DE-CAMPOS.md`](Docs/arquitectura/PROCEDENCIA-DE-CAMPOS.md) — campo a campo, con las URLs de las fuentes |
| Dar de alta o ampliar un espacio | [`Docs/runbook/ALTA-DE-ESPACIO.md`](Docs/runbook/ALTA-DE-ESPACIO.md) + [`Docs/runbook/TRAMPAS-CONOCIDAS.md`](Docs/runbook/TRAMPAS-CONOCIDAS.md) |
| Saber en qué estado está un espacio | [`Docs/rollout/ESTADO.md`](Docs/rollout/ESTADO.md) — **la tabla**. Los informes de cierre están en `Docs/rollout/sesiones/`, uno por periodo: entra solo al que haga falta |
| Tocar el frontend | [`Frontend/Js/CLAUDE.md`](Frontend/Js/CLAUDE.md) |
| Tocar la API | [`Backend/CLAUDE.md`](Backend/CLAUDE.md) |
| Escribir o usar una herramienta | [`Tools/CLAUDE.md`](Tools/CLAUDE.md) — **mira `Tools/lib/` antes de escribir nada nuevo** |
| Tocar SQL | [`Database/CLAUDE.md`](Database/CLAUDE.md) — qué fichero es fuente y cuál es generado |
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
