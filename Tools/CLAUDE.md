# `Tools/` — índice del tooling

Node sin dependencias salvo `polygon-clipping`. Casi todo sale a fuentes externas: si fallan con
errores de red que no explican nada, `npm run red:check` lo aclara en diez segundos.

> **Regla nº 1: antes de escribir una herramienta nueva, mira `lib/`.** Cada módulo de ahí existe
> porque su lógica estaba copiada en varios sitios y las copias divergieron.
>
> **Regla nº 2: ninguna herramienta de Capa 2/3 escribe en la BD ni en el seed.** Generan ficheros en
> `catalogo-nacional/out/` para revisar antes de adoptarlos. La única excepción documentada es
> `enrich-images.js --write-park`.

## `lib/` — infraestructura compartida

| Módulo | Qué da | Por qué está aquí |
|---|---|---|
| `cli.js` | `arg` `num` `flag` `requireArgs` `die` `sleep` | Admite `--x v` y `--x=v`, con guiones o sin ellos. Había catorce copias con dos convenciones incompatibles |
| `http.js` | `getText` `getJson` `pool` | Acumula en Buffer (no parte caracteres multibyte), comprueba `statusCode`, reintenta ante 429/5xx |
| `io.js` | `ROOT` `FRONTEND` `PARKS_DIR` `REGISTRY_FILE` `readJson` `writeJson` `parkFiles` `rel` | La raíz se resuelve una vez. **`writeJson` usa el formato canónico** (2 espacios + salto final): escribir de otra forma produce un diff completo aunque no cambie ningún dato |
| `eidos.js` | `resolveTaxon` `conservationByScope` `legalStatus` `commonName` `rows` `nameMatches` | Cliente de EIDOS/IEPNB. **`resolveTaxon` es la clave maestra del modelo.** `rows()` normaliza a array porque PostgREST devuelve 200 con un objeto de error |
| `gbif.js` | `matchName` `searchOccurrences` `esRangoEspecifico` | `matchName` devuelve el **rango**: una `usageKey` de género o familia no identifica ninguna especie |
| `registry.js` | `resolvePark` `readBoundaryPolygons` | Localiza los geo de un espacio. Acepta `available` **y** `basic` (un N1 ascendiendo a N2 es el caso de uso) |
| `geo.js` `shapefile.js` `dbf.js` | Punto-en-polígono, áreas, parser `.shp` + reproyección UTM, lector dBASE | Sin dependencias |
| `pmtiles.js` | Lectura de paquetes de teselas | Permite barrer POIs sin red, desde el `base.pmtiles` del parque |
| `wikimedia.js` | Resolución de foto de un taxón contra Wikidata/Wikipedia/Commons | Lo delicado no es pedir la foto sino **descartar** la que no sirve |
| `db.js` | Acceso al MySQL del contenedor por `docker exec` | La contraseña va por `MYSQL_PWD`, **nunca** en la línea de órdenes |
| `sql.js` | `sqlStr` `sqlStrOrNull` `sqlNum` `sqlJson` | Escapa la barra invertida, que MySQL trata como carácter de escape |

## Raíz de `Tools/` — validación, sincronización y construcción

| Fichero | Líneas | Qué hace |
|---|---|---|
| `validate-park-data.js` | 494 | **La red de seguridad.** `npm run validate`, y también en `pre-commit` |
| `sync-species-catalog.js` | 392 | Una especie, una ficha, en todos los parques (`species:check/:extract/:apply/:poda`) |
| `sync-habitat-catalog.js` | 231 | Un hábitat, una descripción, en todos los parques (`habitats:check/:apply`) |
| `scan-taxones-duplicados.js` | 95 | El mismo taxón con dos nombres científicos. **Sale con código 1 mientras queden** |
| `glossary-coverage.js` | 263 | Vocabulario de las fichas sin definición en el glosario |
| `eidos-diff.js` | 191 | Coteja la BD viva contra EIDOS (solo lectura). Acepta `--ccaa` |
| `gbif-habitats.js` | 325 | Ocurrencias GBIF ∩ polígonos de hábitat, con análisis de ruido |
| `build-park-tiles.js` | 216 | Paquete de mapa base offline, recortado **al límite oficial** (no al bbox) |
| `build-park-trails.js` | 621 | Senderos señalizados (GR, PR, SL) que pasan por el parque |
| `build-park-pois.js` | 537 | **Candidatos** a POI dentro del límite. No escribe `park.json`: solo dice dónde mirar |
| `check-egress.js` | 142 | A qué fuentes externas llega esta sesión. **Si añades una fuente nueva, añádela aquí** |

### PHP en `Tools/`

`export-park.php` · `export-glossary.php` · `export-invasoras.php` regeneran los JSON empaquetados
desde la BD (la lógica vive en `Backend/Lib/`). `import-sql.php` ejecuta volcados contra MySQL
remoto. `recalculate-account-progress.php` recalcula progreso y logros de todos los usuarios.
`test-presence-rules.php` es `npm test`.

## `catalogo-nacional/` — el pipeline por espacio

Orden real de uso; el runbook completo está en
[`Docs/runbook/ALTA-DE-ESPACIO.md`](../Docs/runbook/ALTA-DE-ESPACIO.md).

| Fichero | Líneas | Fase |
|---|---|---|
| `build-n1-espacios.js` | 822 | **N1**: fichas base de una comunidad entera. Idempotente; respeta la marca `CodigoIMIDA` |
| `refina-limites-imida.js` | 346 | N1: sustituye el límite generalizado del MITECO por el del geoportal autonómico |
| `build-habitats.js` | 316 | **Capa 2**: reproyecta UTM→WGS84 y recorta al límite. Vértices fuera debe ser **0** |
| `merge-habitats.js` | 187 | Capa 2: conserva lo curado a mano, actualiza desde la fuente lo que es dato |
| `adopt-habitats.js` | 194 | Capa 2: lo lleva a `Frontend/` y recalcula contadores. **No pasa por la BD** |
| `atlas-hic-especies.js` | 100 | **Capa 3**: especies características por HIC desde el Atlas → evidencia `caracteristica` |
| `build-species-universal.js` | 600 | Capa 3: **da de alta en el catálogo universal** la ficha de un taxón que no está en ningún parque. Sale a EIDOS, GBIF y Wikimedia. Es el paso que va ANTES de `build-species-n2.js` |
| `build-species-n2.js` | 360 | Capa 3: **escribe las fichas** en `park.json` desde la selección aprobada. Ensambla, no consulta: sin red y sin inventar un campo. Idempotente |
| `reconcile-taxa.js` | 84 | Capa 3: reconciliación taxonómica EIDOS ↔ GBIF |
| `wikimedia-images.js` · `enrich-images.js` | 177 · 267 | Fotos de especies con atribución |
| `habitat-images.js` · `poi-images.js` | 176 · 423 | Portadas de hábitat (por especie diagnóstica) y fotos de POI |
| `invasoras-eei.js` · `invasoras-contenido.js` · `invasoras-images.js` | 72 · 317 · 159 | Invasoras: catálogo EEI ∩ GBIF, ficha desde EIDOS, foto |
| `fix-estado-conservacion-iepnb.js` · `fix-sierra-espuna-revision.js` | 262 · 152 | Correcciones puntuales ya aplicadas. **Histórico: no relanzar sin leer su cabecera** |

### Datos de entrada que hay que mantener a mano

- `data/descripciones-espacios.json` — la descripción de cada espacio (130–150 caracteres). **El
  único texto del pipeline que no sale de una fuente oficial.** Vive aquí y no en el `park.json` para
  que una regeneración con `n1:build` no pueda pisarlo.
- `data/contenido/habitats.json` — descripción por código HIC. **Universal: no puede nombrar un
  espacio concreto.**
- `data/contenido/fitosociologia.json` — la lectura en llano de cada asociación.
- `data/hic-nombres.json` y `data/hic-prioritarios.json` — **hay que ampliarlos al entrar en una
  provincia nueva.** Un código ausente de `hic-nombres.json` **se salta el filtro marino** y mete un
  hábitat que no debería estar.
- `data/curacion-especies.json` — los campos de la ficha universal que ninguna fuente sirve tal cual:
  el **porte** de una planta cuando EIDOS no trae descripción, el **nombre común** usual cuando el que
  EIDOS marca como preferente es un localismo (da «Aguilón» para el alimoche) y las **tres pistas de
  identificación**. Lo lee `build-species-universal.js --curado`. Solo admite los campos de su lista
  `CURABLES`: lo que sale de una fuente no se cura a mano.
- `fuentes/*.json` — el registro reproducible de qué se descarga y de dónde. Se versiona; las
  descargas en sí, no.

`fuentes/` y `out/` están excluidos de la búsqueda (ver `.ignore`): son megabytes de dato
descargable y reproducible.

## `db-sync/`

`npm run db:status / :pull / :push / :backup`. Sincronización con el MySQL del contenedor.
