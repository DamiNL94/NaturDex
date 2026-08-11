# Comandos

| Comando | Qué hace |
|---|---|
| `npm run validate` | **Red de seguridad.** Coherencia `park.json ↔ manifest.json ↔ geojson`, integridad especie↔hábitat, contadores, coordenadas, licencias de foto, transcripciones y presupuesto offline. Bloquea el commit |
| `npm run taxones:duplicados` | El mismo taxón con dos nombres científicos. Sale con código 1 mientras queden |
| `npm run glossary:check` | Vocabulario científico de las fichas sin definición en el glosario |
| `npm run species:check / :extract / :apply` | Catálogo universal: informar / volcar / sincronizar a todos los espacios (+ SQL) |
| `npm run species:poda` | `:extract` que además **retira** las entradas del catálogo que ya no usa ningún parque (nombres que dejó atrás un renombrado). Sin él solo se listan |
| `npm run habitats:build / :merge` | Capa 2 desde la cartografía del MITECO |
| `npm run atlas:hic -- --atlas <atlas.txt> --park <slug>` | Especies características por HIC desde el Atlas, **cruzadas con el catálogo ya escrito**. Es un paso posterior a la Capa 3: en un espacio sin especies da 0 por construcción |
| `npm run species:seleccion -- --park <slug> --atlas <atlas.txt>` | **La lista aprobada** que consume `species:build` → `out/<slug>-seleccion-especies.json` + informe. Cuatro filtros (constancia GBIF, autoctonía, presencia, alcance taxonómico) y **reconciliación por `eidosTaxonId`**, que es lo que impide que el sinónimo y el nombre aceptado de GBIF entren como dos especies. `--clases`, `--todas-las-clases`, `--min-occ`, `--min-habitats` |
| `npm run species:build -- --park <slug> [--dry] [--podar]` | **Capa 3**: escribe las fichas de especie en `park.json` desde la selección aprobada. Ensambla lo que ya hay en el repo; no sale a la red. Idempotente. `--podar` retira las fichas que la selección ya no respalda —hace falta tras un renombrado, o el nombre viejo se queda como especie fantasma— |
| `npm run images:species / :habitats / :invasoras` | Fotos con atribución desde Wikimedia |
| `npm run contenido:invasoras` | Fichas de invasoras desde EIDOS |
| `npm run invasoras:eei` | Catálogo EEI ∩ presencia GBIF por territorio |
| `npm run eidos:diff` | Coteja la BD viva contra EIDOS (solo lectura). `-- --ccaa "<comunidad>"` |
| `npm run gbif:habitats` | Ocurrencias GBIF ∩ polígonos de hábitat, con análisis de ruido |
| `npm run pois:build <slug> [--fuente=auto\|overpass\|basemap]` | **Fase 3**: candidatos a punto de interés dentro del límite oficial → `out/<slug>-poi-candidatos.md`. Escribe candidatos, nunca `park.json` |
| `npm run images:pois -- --park <slug> --categoria "<Categoría de Commons>"` | Foto y crédito de cada POI. **Con `--park` reescribe `Database/poi-imagenes.sql` solo con ese espacio**: hay que conservar a mano las sentencias ya aplicadas de los demás |
| `npm run images:pois:alt -- --park <slug>` | Las fotos de POI que Commons no tiene, en Openverse, Flickr, Mapillary, Europeana e iNaturalist → `Docs/fotos-poi-alt.md`. **Todo sale «a revisar» y no escribe nada** sin `--write --force`. Claves por entorno: `FLICKR_API_KEY`, `MAPILLARY_TOKEN`, `EUROPEANA_WSKEY` |
| `npm run pois:sql -- --park <slug>` | Vuelca el bloque `pointsOfInterest` de un `park.json` a SQL idempotente → `Database/n3-pois-<slug>.sql`. **La API manda sobre el paquete**: sin aplicarlo, el espacio se sirve con 0 POIs |
| `npm run park:sql -- --park <slug>` | Vuelca el **N2 completo** —fila de `parks`, hábitats con geometría, especies y vínculos— → `Database/<slug>-n2.sql`. **Va antes que `pois:sql`**: sin fila en `parks`, todo lo demás carga cero filas en silencio |
| `npm run tiles:build <slug>` | Paquete de mapa base offline |
| `npm run trails:build <slug>` | Senderos señalizados (GR, PR, SL) que pasan por el parque |
| `npm run export:park / :glossary / :invasoras` | Regenera los JSON empaquetados desde la BD |
| `npm run db:status / :pull / :push / :backup` | Sincronización con el MySQL del contenedor |

Ninguna herramienta de Capa 2/3 escribe en la BD ni en el seed directamente (salvo
`enrich-images.js --write-park`, documentado en su cabecera): generan ficheros en `out/` para revisar
antes de adoptarlos.

