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
| `respaldo-sitio.js` | `cargaEquivalencias` `clavesDe` `indexa` `busca` `probablesCambiosDeGenero` | **El puente entre el nombre que escribe una fuente oficial y el que ficha el catálogo**, y la decisión de «tiene respaldo de sitio», que es la puerta de las aves. Está aquí porque la toman dos herramientas —`build-species-seleccion.js` para los espacios nuevos y `poda-aves-sin-respaldo.js` para los ya publicados— y dos implementaciones divergirían a la primera. Tres capas: binomio normalizado, nombre aceptado en EIDOS **del nombre de la fuente**, y tabla verificada a mano. La heurística de epíteto **no se aplica**: propone tres pares falsos de cada nueve |
| `medios.js` | `medioDeHic` `mediosDeTexto` `cotejaMedio` `MEDIOS_EXIGENTES` | Qué **medio** exige cada código HIC (agua, saladar, roquedo, bosque…) y cuál declara la ficha universal de una especie, para poder cotejarlos. Es dato universal, del mismo orden que `data/hic-nombres.json`: el 7220 es un manantial en Murcia y en Girona. Lo usa la auditoría de enlaces para revisar lo escrito, y la selección de un espacio nuevo debería usarlo para no escribirlo. **Solo se atreve a contradecir en el medio acuático**, y la cabecera explica por qué en el resto el cotejo deja de discriminar |
| `atlas.js` | `especiesCaracteristicas` `binomio` | Lee el «Atlas y Manual de los Hábitats» (PDF → texto) por código HIC. Está aquí porque lo usan `atlas-hic-especies.js` y `build-species-seleccion.js`, y porque **tolera los dos formatos de extracción**: cuando el parser vivía dentro del primero y daba por hecho el de `pdftotext -layout`, con cualquier otro devolvía **cero especies en silencio**. La atribución bloque→HIC junta el **anexo de correspondencias** con el **cajetín ligado a su página**: colgarla «del cajetín más cercano» perdía 246 de 344 bloques o los colgaba del HIC de la página de al lado (2026-08-16 (l)) |
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

`export-dwc.php` (`npm run export:dwc`) genera el **Darwin Core Archive** de los avistamientos:
`occurrence.txt` + `meta.xml` + `eml.xml`. Aplica dos reglas que no se pueden delegar en quien reciba
el fichero —el **consentimiento** del observador y la **generalización** de las coordenadas de los
taxones amenazados—, y ninguna de las dos vive aquí: están en `Backend/Lib/dwc.php`, que es puro y por
eso se puede probar sin BD. Ver [`Docs/DARWIN-CORE.md`](../Docs/DARWIN-CORE.md).

`test-presence-rules.php` y `test-dwc-rules.php` son `npm test`.

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
| `especies-sitio-rn2000.js` | 246 | Capa 3: la lista OFICIAL de especies de cada sitio Red Natura 2000 del espacio (secciones 3.2 y 3.3 del Formulario Normalizado de Datos, IEPNB) → evidencia `lista_oficial_sitio`. **Es la puerta de las aves**: sin este volcado, la selección las excluye todas salvo las que salve el anexo normativo. Va ANTES de `build-species-seleccion.js` |
| `build-species-universal.js` | 600 | Capa 3: **da de alta en el catálogo universal** la ficha de un taxón que no está en ningún parque. Sale a EIDOS, GBIF y Wikimedia. Es el paso que va ANTES de `build-species-n2.js` |
| `build-species-n2.js` | 360 | Capa 3: **escribe las fichas** en `park.json` desde la selección aprobada. Ensambla, no consulta: sin red y sin inventar un campo. Idempotente |
| `poda-aves-sin-respaldo.js` | 380 | Capa 3: aplica **solo** el filtro 3 bis a un `park.json` ya escrito (`aves:poda`). Es la puerta de las aves llevada a los ocho espacios que entraron por la puerta vieja, sin volver a derivar sus plantas. `--sql` escribe el borrado para la BD, que `build-park-sql.js` **no genera** porque solo hace UPSERT. Idempotente, y **se niega a correr** si el espacio no tiene ni volcado de sitio ni anexo |
| `reconcile-taxa.js` | 84 | Capa 3: reconciliación taxonómica EIDOS ↔ GBIF |
| `mide-niveles-puerta.js` | 136 | **Mide el reparto por niveles de la puerta del catálogo** (`especies:niveles`) sobre las fichas visibles ya publicadas: N1 respaldo documental, N2 figura legal o Atlas, N3 solo GBIF. Sin red, solo lectura. Existe porque la medición ya se perdió dos veces por vivir solo en informes de sesión; su valor es el **delta con criterio constante**, no el total absoluto (la figura legal se lee del texto de la ficha, no de EIDOS en vivo) |
| `auditoria-especie-habitat.js` | 380 | Capa 3: **repasa los enlaces ya escritos** (`especies:habitats`). El vínculo especie↔hábitat se deriva de una sola señal —una ocurrencia dentro del polígono— y nadie volvía a mirarlo; esto lo coteja contra el medio del HIC, el vuelo del taxón, el barrido versionado y el Atlas. Retira lo que no tiene defensa, anota el resto y **no toca la BD**: `--sql` escribe el borrado, que `build-park-sql.js` no genera porque solo hace UPSERT. Idempotente |
| `wikimedia-images.js` · `enrich-images.js` | 177 · 267 | Fotos de especies con atribución |
| `habitat-images.js` · `poi-images.js` | 176 · 429 | Portadas de hábitat (por especie diagnóstica) y fotos de POI |
| `poi-images-alt.js` | 434 | Fotos de POI **fuera de Wikimedia** (Openverse, Flickr, Mapillary, Europeana, iNaturalist), para cuando Commons se agota. Importa de `poi-images.js` la lista blanca de licencias y el filtro de topónimo: **no hay dos listas que puedan divergir**. Todo sale `needsReview` y no escribe sin `--write --force` |
| `build-park-sql.js` | 213 | **N2 → BD**: vuelca el espacio entero (fila de `parks`, hábitats con geometría, especies y vínculos) a SQL idempotente (`park:sql`). **Va primero**: sin fila en `parks` lo demás carga cero filas en silencio |
| `build-poi-sql.js` | 113 | **N3**: vuelca el bloque `pointsOfInterest` de un `park.json` a SQL idempotente (`pois:sql`). La API manda sobre el paquete: sin este SQL, un N3 cerrado se sirve con 0 POIs |
| `invasoras-eei.js` · `invasoras-contenido.js` · `invasoras-images.js` | 72 · 317 · 159 | Invasoras: catálogo EEI ∩ GBIF, ficha desde EIDOS, foto |
| `fix-curruca-undata.js` | 150 | Corrección puntual ya aplicada: unifica la curruca rabilarga, que estaba fichada como *Curruca undata* en tres espacios y como *Sylvia undata* en otros cuatro, con **cuatro identificadores distintos** para una sola ave. Idempotente. Su pareja está en `data/equivalencias-nomenclatura.json`: sin esa entrada, la siguiente regeneración lo volvería a partir en dos |
| `fix-estado-conservacion-iepnb.js` · `fix-sierra-espuna-revision.js` · `fix-enlaces-habitat-sierra-pila.js` | 262 · 152 · 217 | Correcciones puntuales ya aplicadas. **Histórico: no relanzar sin leer su cabecera.** La última repone los 23 enlaces especie↔hábitat que la reconciliación perdió al renombrar candidatos sueltos; comprueba la huella (ocurrencias y nº de hábitats) contra la selección antes de escribir, y se niega si no cuadra |

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
- `data/anexos-normativos.json` — las especies que el PORN, el PRUG o el decreto de declaración de un
  espacio **enumeran por escrito**. Es la evidencia más fuerte de la Capa 3, la única que afirma la
  pertenencia *a ese* espacio, y la única que salva del filtro de presencia. Se transcribe a mano con
  el documento delante; **si no hay anexo con especies, no se inventa uno**: sin entrada, la
  herramienta dice «NO consultado» en vez de callarlo.
- `data/equivalencias-nomenclatura.json` — el nombre que escribe una **fuente oficial** ↔ el nombre
  con el que el catálogo ficha esa misma especie, para lo que **ni el binomio ni EIDOS reconcilian**
  solos. Cada entrada lleva con qué se verificó, en qué fecha y **por qué las capas automáticas
  fallan en ese caso**: sin eso nadie sabe si la entrada sigue haciendo falta. No se dan de alta
  equivalencias que EIDOS ya sabe —serían una segunda verdad que puede divergir— ni por parecido de
  nombre: la lista de candidatos por epíteto que sacan las herramientas propone **tres pares falsos
  de cada nueve**. Ver [`Docs/runbook/AVES.md`](../Docs/runbook/AVES.md) §5.
- `data/umbrales-seleccion.json` — el umbral del filtro de presencia cuando un espacio necesita uno
  distinto del general (2 ocurrencias en 2 hábitats). Con **motivo obligatorio**: un umbral sin motivo
  es un número a ojo. Existe porque la calibración de un espacio ya se perdió **dos veces** por vivir
  solo en su informe de cierre — la última le quitó diez fichas a Monte Arabí en silencio.
- `data/normativa-espacios.json` — de dónde se descarga cada uno de esos planes y **en qué apartado**
  está el inventario. Es el manifiesto que evita repetir la búsqueda documental; los PDF no se
  versionan. Está aquí y no en `fuentes/` porque `fuentes/` está vetado en `permissions.deny`.
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
