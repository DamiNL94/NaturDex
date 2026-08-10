# Comandos

| Comando | Qué hace |
|---|---|
| `npm run validate` | **Red de seguridad.** Coherencia `park.json ↔ manifest.json ↔ geojson`, integridad especie↔hábitat, contadores, coordenadas, licencias de foto, transcripciones y presupuesto offline. Bloquea el commit |
| `npm run taxones:duplicados` | El mismo taxón con dos nombres científicos. Sale con código 1 mientras queden |
| `npm run glossary:check` | Vocabulario científico de las fichas sin definición en el glosario |
| `npm run species:check / :extract / :apply` | Catálogo universal: informar / volcar / sincronizar a todos los espacios (+ SQL) |
| `npm run habitats:build / :merge` | Capa 2 desde la cartografía del MITECO |
| `npm run atlas:hic` | Especies características por HIC desde el Atlas |
| `npm run images:species / :habitats / :invasoras` | Fotos con atribución desde Wikimedia |
| `npm run contenido:invasoras` | Fichas de invasoras desde EIDOS |
| `npm run invasoras:eei` | Catálogo EEI ∩ presencia GBIF por territorio |
| `npm run eidos:diff` | Coteja la BD viva contra EIDOS (solo lectura). `-- --ccaa "<comunidad>"` |
| `npm run gbif:habitats` | Ocurrencias GBIF ∩ polígonos de hábitat, con análisis de ruido |
| `npm run tiles:build <slug>` | Paquete de mapa base offline |
| `npm run export:park / :glossary / :invasoras` | Regenera los JSON empaquetados desde la BD |
| `npm run db:status / :pull / :push / :backup` | Sincronización con el MySQL del contenedor |

Ninguna herramienta de Capa 2/3 escribe en la BD ni en el seed directamente (salvo
`enrich-images.js --write-park`, documentado en su cabecera): generan ficheros en `out/` para revisar
antes de adoptarlos.

