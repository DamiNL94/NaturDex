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
| `io.js` | `ROOT` `FRONTEND` `PARKS_DIR` `REGISTRY_FILE` `readJson` `writeJson` `parkFiles` `rel` `escribeEspacio` | La raíz se resuelve una vez. **`writeJson` usa el formato canónico** (2 espacios + salto final): escribir de otra forma produce un diff completo aunque no cambie ningún dato. **`escribeEspacio` es la ÚNICA puerta para escribir un `park.json`**: escribe el paquete y sube la `version` de su manifiesto en el mismo paso, porque separarlos es un fallo que no se ve desde el repositorio —el dispositivo que ya tenía el espacio guardado sin conexión no vuelve a descargarlo y se queda con el dato viejo, con el dato BIEN en el repo—. Eran SIETE copias de las mismas cuatro líneas y dos se las olvidaron: `aplica-fenologia-aves.js`, con trece espacios reescritos, y `sync-species-catalog.js`, que apareció después de contar las seis y es la que más se ejecuta (deuda nº 37). Sube la versión solo si el paquete cambió (idempotencia) y aplica los `counts` siempre |
| `eidos.js` | `resolveTaxon` `conservationByScope` `legalStatus` `commonName` `rows` `nameMatches` | Cliente de EIDOS/IEPNB. **`resolveTaxon` es la clave maestra del modelo.** `rows()` normaliza a array porque PostgREST devuelve 200 con un objeto de error |
| `gbif.js` | `matchName` `searchOccurrences` `esRangoEspecifico` | `matchName` devuelve el **rango**: una `usageKey` de género o familia no identifica ninguna especie |
| `registry.js` | `resolvePark` `readBoundaryPolygons` | Localiza los geo de un espacio. Acepta `available` **y** `basic` (un N1 ascendiendo a N2 es el caso de uso) |
| `respaldo-sitio.js` | `cargaEquivalencias` `clavesDe` `indexa` `busca` `probablesCambiosDeGenero` | **El puente entre el nombre que escribe una fuente oficial y el que ficha el catálogo**, y la decisión de «tiene respaldo de sitio», que es la puerta de las aves. Está aquí porque la toman dos herramientas —`build-species-seleccion.js` para los espacios nuevos y `poda-aves-sin-respaldo.js` para los ya publicados— y dos implementaciones divergirían a la primera. Tres capas: binomio normalizado, nombre aceptado en EIDOS **del nombre de la fuente**, y tabla verificada a mano. La heurística de epíteto **no se aplica**: propone tres pares falsos de cada nueve |
| `fenologia.js` | `TIPOS` `esTipoConocido` `clasificaPresenciaSitio` | **Quién es un ave migratoria y con qué documento se dice.** Traduce el tipo de población del Formulario Normalizado de Datos (permanente / reproductora / invernante / en concentración) a `migratory` + `sitePresence`. Está aquí porque lo usan las dos puntas —`build-species-n2.js` para los espacios nuevos y `aplica-fenologia-aves.js` para los publicados— y un criterio duplicado divergiría. Devuelve `null` cuando no hay entrada utilizable: **el campo se omite**, que es lo que distingue «nadie lo ha mirado» de «comprobado que no». El código `np` del formulario (ya no presente) se descarta, no se toma por un quinto tipo |
| `medios.js` | `medioDeHic` `mediosDeTexto` `cotejaMedio` `MEDIOS_EXIGENTES` | Qué **medio** exige cada código HIC (agua, saladar, roquedo, bosque…) y cuál declara la ficha universal de una especie, para poder cotejarlos. Es dato universal, del mismo orden que `data/hic-nombres.json`: el 7220 es un manantial en Murcia y en Girona. Lo usa la auditoría de enlaces para revisar lo escrito, y la selección de un espacio nuevo debería usarlo para no escribirlo. **Solo se atreve a contradecir en el medio acuático**, y la cabecera explica por qué en el resto el cotejo deja de discriminar |
| `atlas.js` | `especiesCaracteristicas` `binomio` `tiendePuente` `puenteDesdeCache` | Lee el «Atlas y Manual de los Hábitats» (PDF → texto) por código HIC. Está aquí porque lo usan `atlas-hic-especies.js` y `build-species-seleccion.js`, y porque **tolera los dos formatos de extracción**: cuando el parser vivía dentro del primero y daba por hecho el de `pdftotext -layout`, con cualquier otro devolvía **cero especies en silencio**. La atribución bloque→HIC junta el **anexo de correspondencias** con el **cajetín ligado a su página**: colgarla «del cajetín más cercano» perdía 246 de 344 bloques o los colgaba del HIC de la página de al lado (2026-08-16 (l)) |
| `rareza.js` | `ESCALERA` `tramoDeTexto` `tramoDeCategoria` `baseDeTramo` `SIGNIFICADO` | **La escalera de gravedad legal que traduce una figura de protección a un tramo 1–5**, y desde el 2026-08-27 también la PROCEDENCIA de ese tramo (`baseDeTramo`). Están aquí porque el mismo criterio hace falta en tres sitios con formatos distintos: `build-species-seleccion.js` (normas estructuradas de EIDOS), `rareza-legal.js` (el texto ya redactado del park.json) y `build-species-universal.js`, que desde esa fecha deriva el `rarityScore` de la figura legal en vez del recuento de GBIF — y **con dos copias el mismo taxón acabaría con dos tramos según quién lo escribiera** |
| `uicn.js` | `CATEGORIA_UICN` `etiquetaUicn` `codigoDe` | **Cómo se escribe una categoría de la UICN, y por qué el ÁMBITO va dentro de la frase.** EIDOS sirve la evaluación por ámbito —Mundial, España, Península, Canarias— y son evaluaciones distintas del mismo taxón, con autoridad y año propios: mezclarlas en un campo es el error que pagó `spainStatus` con las normas de otras comunidades. Está aquí porque lo usan el generador de fichas nuevas y el barrido de las ya escritas, y dos copias divergen a la primera corrección. `Península` y `Canarias` **no se guardan**: son subestatales y no hay campo con ese significado |
| `geo.js` `shapefile.js` `dbf.js` | Punto-en-polígono, áreas, parser `.shp` + reproyección UTM, lector dBASE | Sin dependencias |
| `pmtiles.js` | Lectura de paquetes de teselas | Permite barrer POIs sin red, desde el `base.pmtiles` del parque |
| `wikimedia.js` | Resolución de foto de un taxón contra Wikidata/Wikipedia/Commons | Lo delicado no es pedir la foto sino **descartar** la que no sirve |
| `db.js` | Acceso al MySQL del contenedor por `docker exec` | La contraseña va por `MYSQL_PWD`, **nunca** en la línea de órdenes |
| `sql.js` | `sqlStr` `sqlStrOrNull` `sqlNum` `sqlJson` | Escapa la barra invertida, que MySQL trata como carácter de escape |

## Raíz de `Tools/` — validación, sincronización y construcción

| Fichero | Líneas | Qué hace |
|---|---|---|
| `validate-park-data.js` | 494 | **La red de seguridad.** `npm run validate`, y también en `pre-commit` |
| `sync-species-catalog.js` | 411 | Una especie, una ficha, en todos los parques (`species:check/:extract/:apply/:poda`). Es la herramienta que **más veces reescribe los dieciséis `park.json`**, y hasta el 2026-08-25 (b) **no tocaba ningún manifiesto** (deuda nº 37) ni volcaba a la BD `kingdom`, `group`, la `taxonomy`, `iucnGlobal` ni `spainStatus` (deuda nº 40): una corrección universal quedaba bien en el repo y mal en lo que ve el usuario, por la ruta que manda el runbook. Ahora escribe por `escribeEspacio()` y su `--sql` lleva las quince columnas |
| `sync-habitat-catalog.js` | 231 | Un hábitat, una descripción, en todos los parques (`habitats:check/:apply`) |
| `scan-taxones-duplicados.js` | 95 | El mismo taxón con dos nombres científicos. **Sale con código 1 mientras queden** |
| `glossary-coverage.js` | 263 | Vocabulario de las fichas sin definición en el glosario |
| `eidos-diff.js` | 191 | Coteja la BD viva contra EIDOS (solo lectura). Acepta `--ccaa` |
| `gbif-habitats.js` | 325 | Ocurrencias GBIF ∩ polígonos de hábitat, con análisis de ruido |
| `build-park-tiles.js` | 216 | Paquete de mapa base offline, recortado **al límite oficial** (no al bbox) |
| `build-park-trails.js` | 721 | Senderos señalizados (GR, PR, SL) que pasan por el parque. **«Sin candidatos» no es un hecho del terreno**: si OSM no tiene la relación, el puente es `data/senderos-sin-relacion-osm.json` |
| `build-park-pois.js` | 537 | **Candidatos** a POI dentro del límite. No escribe `park.json`: solo dice dónde mirar |
| `check-egress.js` | 142 | A qué fuentes externas llega esta sesión. **Si añades una fuente nueva, añádela aquí** |
| `dev-server.js` | 75 | Sirve `Frontend/` por HTTP para poder mirar la app **sin PHP instalado**. La receta del repo es `php -S` (`.claude/launch.json`), y eso da por hecho un PHP que no está en toda máquina; con `file://` la app no arranca porque el navegador bloquea los módulos ES. **No sustituye a `php -S`**: no sirve `Backend/Api/`, así que la app cae al `park.json` empaquetado — que para repasar el pintado es justo lo que ve un dispositivo sin cobertura |

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
| `coteja-anexos-normativos.js` | 175 | **Capa 3**: caza los nombres MAL TRANSCRITOS del anexo normativo (`anexos:coteja`), que es la deuda nº 25. Una errata de OCR —«Lanius **senador**», «**Croccidura** russula»— no falla: la especie no casa, se cae de la selección y sale con un motivo escrito al lado que es falso. **El verbatim NO se toca nunca** (es la cita de la norma): la corrección va en `nombreCorregido`, y solo se escribe cuando GBIF la propone **y** EIDOS la confirma **y** pasa la guarda de distancia de edición — lo que está a más de tres letras no es una errata, es otro taxón, y ésos se enumeran para mirarlos con el documento delante |
| `atlas-puente-nomenclatura.js` | 130 | **Capa 3**: resuelve contra EIDOS los nombres con los que el Atlas de 2005 cita las especies (`atlas:puente`), y deja la caché compartida `out/atlas-eidos-nombres-cache.json` que leen los TRES sitios que cruzan Atlas ↔ catálogo. Es la deuda nº 26: `binomio()` normaliza la desinencia del epíteto pero **no el género**, así que *Stipa tenacissima* (Atlas) y *Macrochloa tenacissima* (catálogo) no casan y el esparto pierde su respaldo. **Solo puentea RECOMBINACIONES** —mismo epíteto, otro género—: EIDOS devuelve por la misma vía cambios de IDENTIDAD (*Ammophila arenaria* → *Calamagrostis arundinacea*) y aplicarlos colgaría el HIC de otro taxón, con el agravante de que el puente se usa solo en positivo. Sin `--atlas` la cobertura es parcial **y lo dice**: los índices versionados solo guardan los nombres que YA casaron |
| `atlas-hic-especies.js` | 130 | **Capa 3**: especies características por HIC desde el Atlas → evidencia `caracteristica`. Admite **varios textos** (`--atlas a.txt,b.txt`) y **`--fusiona`**, que conserva lo que ya hubiera en el índice: de qué extractor de PDF salga el `atlas.txt` cambia QUÉ enlaces se leen y **ninguno cubre al otro** —Xpdf con `-layout` recupera 34 enlaces en Sierra de El Carche que el índice versionado no tenía y pierde quince de Sierra Espuña que sí traía—, así que elegir uno solo tira dato en las dos direcciones. El Atlas se usa **solo en positivo** |
| `aplica-atlas-habitats.js` | 155 | Capa 3: **tiende en los `park.json` ya escritos los enlaces que el Atlas respalda** (`atlas:aplica`). Es la deuda nº 32 pagada sin regenerar: `build-species-n2.js` reescribiría el catálogo desde la selección, y ocho de los dieciséis espacios de Murcia pasaron DESPUÉS por `poda-aves-sin-respaldo.js` —regenerarlos devolvería las aves podadas—. Solo SUMA, nunca retira, y mantiene el espejo `habitats[].speciesIds`. Idempotente |
| `especies-sitio-rn2000.js` | 246 | Capa 3: la lista OFICIAL de especies de cada sitio Red Natura 2000 del espacio (secciones 3.2 y 3.3 del Formulario Normalizado de Datos, IEPNB) → evidencia `lista_oficial_sitio`. **Es la puerta de las aves**: sin este volcado, la selección las excluye todas salvo las que salve el anexo normativo. Va ANTES de `build-species-seleccion.js` |
| `build-species-seleccion.js` | 1.837 | Capa 3: **produce la selección aprobada** del espacio (`species:seleccion`), que es lo que `build-species-n2.js` convierte en fichas. Aplica el orden de prioridad de las fuentes (regla nº 3 del `CLAUDE.md`) y deja escrito de qué fuente sale cada cosa, con las excluidas y su motivo en `excluidas_detalle`. **`--atlas` admite VARIOS textos separados por coma y además lee siempre el índice versionado `out/<slug>-hic-especies.json`**: `fuentes/atlas.txt` **no es reproducible** —de qué extractor salga cambia qué se lee y ninguno cubre al otro (deuda nº 42)—, así que leer uno solo le quita fichas al espacio con un motivo escrito al lado que es falso. Las fuentes se **suman y no se restan nunca**; el índice no puede añadir una especie nueva (se genera como Atlas ∩ catálogo), solo impedir que una que ya está pierda su respaldo |
| `build-species-universal.js` | 600 | Capa 3: **da de alta en el catálogo universal** la ficha de un taxón que no está en ningún parque. Sale a EIDOS, GBIF y Wikimedia. Es el paso que va ANTES de `build-species-n2.js` |
| `build-species-n2.js` | 360 | Capa 3: **escribe las fichas** en `park.json` desde la selección aprobada. Ensambla, no consulta: sin red y sin inventar un campo. Idempotente. Un campo universal que el catálogo **no trae se OMITE**: hasta el 2026-08-28 (b) lo escribía como `null` y eso dejaba `validate` en rojo en cuanto se regeneraba un espacio (la coherencia entre parques compara con `JSON.stringify`, donde `null` y ausente son distintos), sin que `species:apply` pudiera arreglarlo y con el `species:extract` de detrás copiando los nulos AL catálogo universal |
| `poda-aves-sin-respaldo.js` | 380 | Capa 3: aplica **solo** el filtro 3 bis a un `park.json` ya escrito (`aves:poda`). Es la puerta de las aves llevada a los ocho espacios que entraron por la puerta vieja, sin volver a derivar sus plantas. `--sql` escribe el borrado para la BD, que `build-park-sql.js` **no genera** porque solo hace UPSERT. Idempotente, y **se niega a correr** si el espacio no tiene ni volcado de sitio ni anexo |
| `aplica-fenologia-aves.js` | 230 | Capa 3: escribe `migratory` y `sitePresence` en las aves ya fichadas (`aves:fenologia`), leyendo el `out/<slug>-rn2000-sitio.json` que ya está en el repo en vez de rehacer el catálogo. Es lo que alimenta la pestaña «Migratorias» de la app. Comparte criterio con `build-species-n2.js` vía `lib/fenologia.js`. Idempotente; un espacio **sin volcado de sitio no se toca** y lo dice; lo que no casa por nombre sale listado, nunca adivinado. **`--online` hace la capa 2 del puente** —resolver contra EIDOS el nombre de la FUENTE—, que era la que faltaba y la que no se podía suplir con equivalencias (deuda nº 35): de 53 huecos deja 29 y sube las migratorias de 405 a 420. Ojo al consultar EIDOS: el verbatim del formulario **no vale tal cual** («Sylvia cantillans ([excluding subalpina])») y el `binomio()` de `lib/atlas.js` **tampoco**, porque es la clave de cotejo y no un nombre. **Un ave que este pase no sabe cruzar CONSERVA la fenología que tuviera** y sale contada: sin `--online` la capa 2 no corre, y hasta el 2026-08-25 (b) un `--write` a secas retiraba los campos de 53 fichas en ocho espacios —deshaciendo la deuda nº 35 con un diff que parecía una limpieza—. Para retirar hace falta evidencia positiva, y aquí es haber cruzado (deuda nº 38) |
| `funde-trinomios-nominales.js` | 265 | Capa 3: **funde la subespecie NOMINAL en su especie** en los `park.json` ya escritos (`taxones:trinomios`), que es la deuda nº 33. Tres condiciones: el tercer epíteto repite el segundo, el binomio está fichado en ESE espacio, y la ficha del trinomio **no aporta ningún dato** que la del binomio no tenga (se coteja campo a campo). `--renombra` cubre el caso contrario —el trinomio que llega SOLO, como el calamón de Calblanque—, reutilizando los identificadores de los espacios que ya fichan el binomio. `--sql` escribe el borrado, que `build-park-sql.js` no genera |
| `reconcile-taxa.js` | 84 | Capa 3: reconciliación taxonómica EIDOS ↔ GBIF |
| `mide-niveles-puerta.js` | 136 | **Mide el reparto por niveles de la puerta del catálogo** (`especies:niveles`) sobre las fichas visibles ya publicadas: N1 respaldo documental, N2 figura legal o Atlas, N3 solo GBIF. Sin red, solo lectura. Existe porque la medición ya se perdió dos veces por vivir solo en informes de sesión; su valor es el **delta con criterio constante**, no el total absoluto (la figura legal se lee del texto de la ficha, no de EIDOS en vivo) |
| `coteja-estado-legal.js` | 560 | **Coteja contra EIDOS la figura legal que AFIRMA el texto de la ficha** (`especies:legal`), que es la deuda nº 43. `spainStatus` y `regionalStatus` son PROSA —39 redacciones distintas de la segunda— y de ese texto cuelgan dos campos que el usuario ve: el nivel 2 de `mide-niveles-puerta.js` y el `rarityLocal` de `rareza-legal.js`. Los dos lados usan la escalera de `lib/rareza.js`, no una copia. **No escribe nada**: la contradicción va en las dos direcciones —la culebra bastarda afirma lo que ninguna fuente sostiene, las dos lavandas citan un Decreto que EIDOS no trae— y elegir bando sería la deuda nº 4 otra vez. Aparta **antes de comparar** lo que `v_estadolegal` no puede confirmar (evaluaciones UICN y Directivas/CITES/convenios, que llegan con `ambito: "Internacional"`): sin eso, siete de los veintiún primeros hallazgos eran del propio filtro, que es el cotejo asimétrico de la posidonia otra vez. **Tres de sus siete clases salen SIN RED**, y una de ellas no necesita a EIDOS ni existiendo: el mismo taxón con dos tramos distintos en dos espacios de la misma comunidad (clase G), que `validate` no ve porque solo coteja entre parques los campos UNIVERSALES |
| `rareza-legal.js` | 300 | Capa 3: escribe `rarityLocal` + `rarityLocalBasis` leyendo el `spainStatus` y el `murciaStatus` que la ficha ya tiene (`especies:rareza`), y con `--catalogo` migra el `rarityScore` del catálogo universal. Desde el 2026-08-27 `rarityScore` **mide rareza legal** y `featured = rarityLocal >= 4` (deudas nº 29 y 31). `--destacadas` NO va por omisión: cambia qué enseña la portada. **`--sql` es imprescindible para publicar**: los tres campos que toca son LOCALES y no viajan en el `species-universal.sql`, así que sin él la única vía era regenerar el `-n2.sql` del espacio, que es la trampa nº 6 |
| `lista-roja-espana.js` | 165 | Capa 3: rellena `iucnSpain` en el catálogo universal (`especies:listaroja`), que es la deuda nº 39. EIDOS servía la Lista Roja **española** desde el principio y el pipeline se quedaba solo con la mundial: son **350 de 1.067** fichas. La resolución va por `eidosTaxonId` y solo cae al nombre si falta; si EIDOS responde que ese nombre es un **sinónimo**, no escribe nada —adoptar la evaluación del aceptado sería colgar de la ficha un dato de un taxón que nadie ha comprobado que sea el suyo, y eso es la deuda nº 36—. Lo que la fuente no trae se queda **sin campo**, nunca con un «No evaluada». Idempotente, con caché |
| `auditoria-especie-habitat.js` | 380 | Capa 3: **repasa los enlaces ya escritos** (`especies:habitats`). El vínculo especie↔hábitat se deriva de una sola señal —una ocurrencia dentro del polígono— y nadie volvía a mirarlo; esto lo coteja contra el medio del HIC, el vuelo del taxón, el barrido versionado y el Atlas. Retira lo que no tiene defensa, anota el resto y **no toca la BD**: `--sql` escribe el borrado, que `build-park-sql.js` no genera porque solo hace UPSERT. Idempotente |
| `wikimedia-images.js` · `enrich-images.js` | 177 · 267 | Fotos de especies con atribución |
| `habitat-images.js` · `poi-images.js` | 176 · 429 | Portadas de hábitat (por especie diagnóstica) y fotos de POI |
| `poi-images-alt.js` | 434 | Fotos de POI **fuera de Wikimedia** (Openverse, Flickr, Mapillary, Europeana, iNaturalist), para cuando Commons se agota. Importa de `poi-images.js` la lista blanca de licencias y el filtro de topónimo: **no hay dos listas que puedan divergir**. Todo sale `needsReview` y no escribe sin `--write --force` |
| `build-park-sql.js` | 213 | **N2 → BD**: vuelca el espacio entero (fila de `parks`, hábitats con geometría, especies y vínculos) a SQL idempotente (`park:sql`). **Va primero**: sin fila en `parks` lo demás carga cero filas en silencio |
| `build-poi-sql.js` | 113 | **N3**: vuelca el bloque `pointsOfInterest` de un `park.json` a SQL idempotente (`pois:sql`). La API manda sobre el paquete: sin este SQL, un N3 cerrado se sirve con 0 POIs |
| `invasoras-eei.js` · `invasoras-contenido.js` · `invasoras-images.js` | 72 · 317 · 159 | Invasoras: catálogo EEI ∩ GBIF, ficha desde EIDOS, foto |
| `coteja-nomenclatura.js` | 340 | **Comprueba que el nombre de una ficha sigue vigente** (`taxones:nomenclatura`). `scan-taxones-duplicados.js` caza el taxón dado de alta DOS veces; esto caza el que está una sola vez **y con el nombre equivocado**, que no tiene con qué compararse. Tres pasadas: el género sin red —el `scientificName` contra `taxonomy.genus`, que sale de EIDOS literal, y saca los nueve casos de esta clase sin gastar una petición—, el nombre y el rango del `eidosTaxonId` contra EIDOS, y la `gbifSpeciesKey` contra el backbone de GBIF. La regla que fija: **nombre e identificadores los manda EIDOS, la key la manda GBIF**, y que las dos usen géneros distintos no es un error. Con `--write` corrige solo lo que **no** cambia el nombre —la key que apunta a un sinónimo homotípico (que trae menos ocurrencias: −54 % en *Curruca communis*) y el `taxonomy.genus` que EIDOS desmiente, **en el catálogo universal y en las fichas**, porque corregirlo solo en las fichas lo revierte `species:apply`—; los renombrados los enumera. Una cuarta pasada caza la **key que no es de rango especie**: una familia es un taxón perfectamente `ACCEPTED`, así que la comprobación del ESTADO no la ve, y pedir ocurrencias con ella trae las de todo el grupo (había cinco, todas del piloto de Cabo Cope) |
| `fix-curruca-undata.js` | 150 | Corrección puntual **aplicada el 2026-08-17** (estaba escrita desde el 16 y nunca se había ejecutado): unifica la curruca rabilarga, que estaba fichada como *Curruca undata* en cinco espacios y como *Sylvia undata* en dos, con **cuatro identificadores distintos** para una sola ave. Idempotente. Su pareja está en `data/equivalencias-nomenclatura.json`: sin esa entrada, la siguiente regeneración lo volvería a partir en dos |
| `fix-nomenclatura-eidos.js` | 300 | Corrección puntual ya aplicada: los **ocho** taxones restantes que se fichaban con un nombre que EIDOS da por sinónimo (*Sylvia communis*, *Pallenis spinosa*, *Coloeus monedula*…). **No unifica géneros por parecido**, que era la trampa: EIDOS acepta *Sylvia atricapilla* igual que *Curruca undata*, y con el romero va al revés. Escribe en los tres sitios que un renombrado desengancha —`park.json`, catálogo universal (**reordenado**, o el diff entierra lo que cambia) y equivalencias— y con `--sql` redacta el cuarto, el que no se ve desde el repositorio: el borrado de la fila vieja que `build-park-sql.js` deja huérfana porque solo hace UPSERT |
| `coteja-ida-y-vuelta.js` | 195 | **Qué campos del paquete no tienen columna** (`ida-y-vuelta`), y por tanto desaparecen al regenerar el paquete desde la API — que es la fuente de verdad de lo que ve el usuario. Es la deuda nº 3, y sobre todo la comprobación que faltaba: el hueco se midió a mano UNA vez en 2026-08-11 y nadie volvió a medirlo porque exigía una base cargada. Esto lo hace **sin base**, leyendo las claves que emiten `park_payload.php` y `park_export.php`. Encontró **tres pérdidas más** que aquella medición no vio: `fuentes` y `solo_curada` de los recintos, y `gbifBboxSightings`. Tres categorías: pérdida sin decidir (**sale con código 1**), pérdida DECIDIDA con fecha y motivo, y clave que no debe estar en la base. No comprueba el ORDEN, que es la otra mitad de la deuda |
| `migra-estado-regional.js` | 160 | Corrección puntual aplicada el 2026-08-27 (`especies:regional`, deuda nº 2): renombra `murciaStatus` a `regionalStatus` en las **2.945 fichas** ya escritas y les añade `regionalCcaa` desde el `park.region` de cada espacio. Se hace in situ y **conservando la posición de la clave** dentro del objeto —reconstruir la ficha con otro orden produce un diff de 2.945 fichas que entierra lo que sí cambia—, porque regenerar con `build-species-n2.js` es la trampa nº 6. **No reescribe el texto** del estado: los 85 textos distintos son la cita de la norma, y varios traen añadidos del piloto que no son estado legal («Fauna protegida; gecko de roquedos»). Idempotente |
| `fix-recombinaciones-eidos.js` | 290 | Corrección puntual aplicada el 2026-08-28 (`taxones:recombinaciones`, deuda nº 36): renombra las **20 fichas de 48** cuyo nombre EIDOS da por sinónimo **y cuyo aceptado es la misma especie en otro género**. La regla que las separa de las otras 28 no es nueva: es la guarda de `atlas-puente-nomenclatura.js` —**mismo epíteto, otro género, mismo rango**— y la herramienta **la comprueba sobre su propia tabla** antes de escribir, en vez de solo afirmarla en la cabecera. Un cambio de epíteto es un cambio de IDENTIDAD (*Sarcocornia fruticosa* → *Salicornia lagascae*, *Natrix natrix* → *N. helvetica*) y un trinomio que se vuelve binomio cambia de RANGO: ni unos ni otros entran. Toca los tres sitios que un renombrado desengancha y con `--sql` redacta el cuarto. **No da de alta equivalencias**: EIDOS ya resuelve estos nombres y el propio fichero lo prohíbe. Idempotente |
| `fix-identificadores-incoherentes.js` | 270 | Corrección puntual aplicada el 2026-08-27 (`taxones:identificadores`, deuda nº 4): el mismo taxón con dos claves externas distintas según el espacio, y dos `gbifSpeciesKey` de rango familia o género. Las dos que `coteja-nomenclatura.js` daba por irrecuperables **sí lo eran**, preguntando por el nombre de la OTRA autoridad: GBIF escribe *Sideritis ibanezii* sin «y», y a *Salsola vermiculata* no llegaba porque el backbone tiene cuatro homónimos y ante la ambigüedad sube a la familia. **No rellena nulos** y no renombra, así que no deja fila huérfana. Idempotente |
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
- `data/catalogos-regionales.json` — **los catálogos autonómicos de especies protegidas, comunidad a
  comunidad**, con la norma copiada literal del boletín. Existe porque el estado autonómico era texto
  libre atado a Murcia (deuda nº 2): sin esta tabla, cada comunidad nueva se inventaría el nombre de
  su catálogo y la frase de «no incluida». Es una LISTA por comunidad y no una norma, y Murcia
  demuestra por qué: su flora va por el Decreto n.º 50/2003 y su fauna por la Ley 7/1995, dos normas
  con dos escaleras de categorías distintas. **Mientras una comunidad no esté aquí, sus fichas sin
  figura se quedan SIN estado regional** en vez de afirmar una negación sobre un catálogo que nadie
  ha mirado — y `build-species-n2.js` lo avisa al correr.
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
- `data/senderos-sin-relacion-osm.json` — los senderos **homologados que OSM no agrupa en una
  relación** de senderismo. `build-park-trails.js` busca relaciones, así que sin este puente devuelve
  «sin candidatos» y el sendero desaparece del mapa aunque esté señalizado sobre el terreno — que es
  un hueco de OSM, **no un hecho del terreno**. La entrada **no dibuja nada**: solo NOMBRA ways que ya
  están en OSM, porque trazar la línea a ojo sería inventar un dato de fuente. Exige **tres señales**
  y si falta una no se escribe: la **norma** o el gestor nombrando el sendero y su recorrido, la
  **homologación** de la FMRM, y algo **físico** del sendero (paneles, señales, el mirador)
  cartografiado sobre esos ways — la tercera es la que separa «este camino va hacia allí» de «este
  camino **es** el sendero». La identificación es DERIVADA y viaja escrita como tal en el `source` del
  sendero. Si aparece la relación en OSM, **manda ella** y hay que borrar la entrada.
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
