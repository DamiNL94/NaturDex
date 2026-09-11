# Prompt · (l) Biodiversidad: sincronizar con el backend y la insignia de evidencia por ficha

> Continuación de `Docs/prompts/k-biodiversidad-agregada.md`. Pégalo en Claude Code cuando la
> pestaña «Biodiversidad» ya esté en el árbol y quieras cerrar lo que quedó fuera de aquel alcance.
> Son dos entregas independientes: puedes pedir solo una.

---

La analítica agregada de biodiversidad ya funciona, pero se quedaron dos cosas fuera, documentadas
como fuera de alcance y no silenciadas. Lee primero `Frontend/Js/render/biodiversidad.js`,
`Tools/catalogo-nacional/build-biodiversidad-stats.js`, `Backend/CLAUDE.md` y
`Docs/arquitectura/PROCEDENCIA-DE-CAMPOS.md`.

## Entrega 1 · Que el dato también salga de la base de datos

Hoy `Frontend/Data/parks-biodiversidad.json` es un fichero estático que se regenera a mano con
`npm run especies:biodiversidad` leyendo los `park.json`. Con backend desplegado, la BD es la fuente
de verdad del catálogo, así que el agregado debería poder calcularse también desde ahí.

**El patrón que hay que copiar ya existe en el repo**: el glosario. Una única definición de la forma
del payload en `Backend/Lib/glossary_payload.php`, compartida por el endpoint
`Backend/Api/glossary.php` (respuesta en vivo) y el exportador `Tools/export-glossary.php` (que
regenera la copia offline `Frontend/Data/glosario.json`). Replica esa estructura de tres piezas.

Una diferencia de fondo que **no** debes pasar por alto: el glosario es contenido **autorado** y por
eso tiene su tabla `glosario`. La biodiversidad es un dato **derivado** — sale de contar las especies
y hábitats que ya están en la BD. **No crees una tabla `biodiversidad`**: sería un cuarto sitio donde
el mismo número puede quedarse viejo y discrepar. Calcúlalo con consultas de agregación sobre las
tablas que ya existen, en el `Lib/*_payload.php`.

Ojo al criterio, que tiene que dar exactamente lo mismo que el script de Node:

- Solo especies visibles (el equivalente en BD de `visible !== false`).
- La escalera de rareza es `rarityLocal ?? (rarityBasis ? rarityScore : null)`, validando 1–5, y el
  umbral de amenaza es el tramo 4. Comprueba cómo están representados esos campos en la BD antes de
  escribir el SQL; `Docs/arquitectura/PROCEDENCIA-DE-CAMPOS.md` dice de dónde sale cada uno.
- El bloque `evidencia` (N1/N2/N3) **no** está en la BD: lo mide una herramienta offline a partir de
  fuentes que la BD no guarda. O lo dejas fuera del payload del backend, o lo importas explícitamente
  — pero no lo aproximes con otra cosa parecida y lo llames igual.

Decide y **documenta** qué manda cuando hay backend: si el frontend debe seguir leyendo el JSON
estático (más simple, y el agregado cambia poco), o pedir el endpoint y caer al JSON sin conexión.
Si eliges lo segundo, recuerda que `loadBiodiversidad()` en `data.js` es hoy una sola llamada a
`NaturDexOffline.fetchJsonCached(...)`, y que el motivo por el que este dato vive fuera de
`park.json` es justo que `loadData()` sustituye `state.data` entero: no lo metas ahora ahí por la
puerta de atrás.

Actualiza `Docs/COMANDOS.md`, `Backend/CLAUDE.md` y `Docs/arquitectura/PROCEDENCIA-DE-CAMPOS.md`.

## Entrega 2 · Insignia de nivel de evidencia en cada ficha

Hoy el reparto N1/N2/N3 solo se enseña **agregado**, en la pestaña Biodiversidad. La idea es que cada
ficha de especie diga de qué se sostiene: respaldo documental directo (N1), figura legal o Atlas de
Hábitats (N2), o solo registros de campo (N3).

El cálculo por especie **ya está escrito**: `Tools/catalogo-nacional/mide-niveles-puerta.js` decide el
nivel especie a especie y lo acumula en una variable `detalle`, pero su JSON de salida solo emite los
totales por parque. Primer paso: emitir también el nivel por especie, sin cambiar el criterio.

Lo delicado es **dónde vive ese nivel**. Es un dato local del espacio y por especie, así que el sitio
natural sería un campo dentro de cada `species` de `park.json` — y ahí está la trampa que ya nos
mordió: `Backend/Lib/park_payload.php` construye la respuesta campo a campo, y `loadData()` sustituye
`state.data` entera, así que un campo nuevo en `park.json` **desaparece sin aviso** en cuanto haya
backend. Solo hay dos salidas honestas:

1. Meterlo en `park.json` **y** añadirlo a `park_payload.php`, a la BD y a `Tools/export-park.php`,
   los tres a la vez, más un caso en `npm run validate` que falle si un lado tiene el campo y el otro
   no.
2. Publicarlo en un fichero aparte indexado por especie, como se hizo con el agregado.

Elige una, di por qué, y no dejes el campo a medias. Además:

- La insignia debe explicar **qué mide** — la fuerza de la fuente, no si el avistamiento es
  correcto — con la misma frase en llano que ya usa la pestaña Biodiversidad. Reutilízala, no
  escribas una segunda redacción que luego diverja.
- Estilo con las custom properties que ya existen; nada de paleta nueva. Mira cómo se pintan hoy
  `.badge`, `.badge.review` y `.review-note` en `Frontend/Css/styles.css`.
- Sube `VERSION` en `Frontend/sw.js` y añade lo que haga falta a `SHELL_ASSETS`.

## Verificación de ambas

- Idempotencia: toda herramienta reejecutada no cambia ni un byte (regla nº 7). Compara por SHA256.
- El agregado del backend y el del script de Node tienen que dar **exactamente** los mismos números
  para los mismos espacios. Si no, uno de los dos criterios está mal; no ajustes el que te dé peor.
- `npm run validate`, `npm test`, `npm run typecheck`.
- Comprobación visual real en el navegador, escritorio y 390 px.

No hagas commit ni abras PR salvo que te lo pida.
