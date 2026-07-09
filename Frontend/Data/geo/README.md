# Capas GeoJSON del mapa

Esta carpeta contiene la **geometría** del mapa, separada de los datos de especies
(`../cabo-cope.json`). El frontend (`Frontend/Js/app.js`) las carga con `L.geoJSON`.

## Archivos

Zonas protegidas — **geometría oficial real** descargada del servicio ArcGIS REST del IMIDA /
CARM (`geoportal.imida.es/gis/rest/services/PROYECTOS/OISMA/MapServer`), reproyectada a
EPSG:4326 (WGS84) y generalizada (`maxAllowableOffset`) para aligerar el peso web:

- **`parque-regional.geojson`** — límite del **Parque Regional de Calnegre y Cabo Cope**
  (Ley 4/1992; 2.665 ha). Es el límite legal, el mismo que representa el folleto oficial.
- **`lic.geojson`** — los dos **LIC / Red Natura 2000** del parque: `ES6200031` Cabo Cope
  (240 ha) y `ES6200012` Calnegre (781 ha).
- **`zepa.geojson`** — **ZEPA / Red Natura 2000** `ES0000261` Almenara-Moreras-Cabo Cope
  (22.201 ha; se extiende bastante al norte del parque).

> La Red Natura 2000 está formada por los LIC/ZEC y las ZEPA: por eso no hay un fichero
> "red-natura" aparte, sino las capas `lic` y `zepa`, que juntas la constituyen.

Senderos:

- **`trails.geojson`** — trazado del **GR-92 / Sendero del Mediterráneo** a su paso por el parque
  (una `Feature` `MultiLineString`), extraído de **OpenStreetMap** (© OpenStreetMap contributors,
  ODbL) vía Overpass API, recortado al `bbox` del parque y decimado a ~4 m entre puntos. Es el
  sendero de gran recorrido que recorre el litoral; los senderos locales (PR/SL) señalizados pueden
  añadirse como `Feature` adicionales cuando se disponga de su trazado.

Geometría de hábitats — **pendiente de cartografía real**:

- **`habitats.geojson`** — plantilla vacía. Mientras no haya polígonos reales, la app dibuja
  un círculo aproximado en la posición representativa de cada hábitat (`coordinates` en
  `cabo-cope.json`). Al añadir un `Feature` con `geometry` `Polygon`/`MultiPolygon` y
  `properties.slug` igual al slug del hábitat, la app **dibuja el polígono en vez del círculo
  automáticamente**, sin tocar código. No existe (o no es accesible como vector) un servicio
  oficial de Hábitats de Interés Comunitario para esta zona; habrá que exportarlos de QGIS a
  partir de la cartografía de HIC de MITECO.

## Cómo actualizar / regenerar

Las zonas protegidas se pueden volver a descargar (por si cambian los límites oficiales) con
peticiones al servicio ArcGIS REST, p. ej. para el Parque Regional:

```
https://geoportal.imida.es/gis/rest/services/PROYECTOS/OISMA/MapServer/1/query
  ?where=nombre LIKE '%Cope%'
  &outFields=nombre,Figura,Hectareas,CodigoENP
  &returnGeometry=true&outSR=4326&maxAllowableOffset=0.00015&f=geojson
```

Capas del MapServer: `1` Parques Regionales, `8` LIC, `7` ZEC, `9` ZEPA. Filtrar por
`SITE_CODE`/`site_code` (LIC/ZEPA) o `nombre` (parques).

Para incorporar cartografía de QGIS (hábitats, o un límite más fino):
1. Reproyectar a `EPSG:4326` (el origen suele venir en `EPSG:25830` ETRS89/UTM 30N).
2. Simplificar geometría para reducir vértices.
3. Exportar a GeoJSON sobre estos nombres de archivo. La web lo usa sin cambios de código.

## Slugs de hábitat válidos

`posidonia`, `acantilados`, `matorral-semiarido`, `azufaifar`, `banco-arena`, `arrecifes`,
`matorral-halofilo`, `matorral-halonitrofilo`, `galeria-ribera`, `veg-anual-desechos-marinos`,
`estepas-salinas-albardinal`, `dunas-embrionarias`, `dunas-malcomietalia`, `dunas-brachypodietalia`,
`rios-glaucium`, `rios-paspalo-agrostidion`, `sabinar-juniperus`, `prados-alysso-sedion`,
`subestepa-thero-brachypodietea`, `turberas-cladium`, `roquedos-casmofiticos`.
