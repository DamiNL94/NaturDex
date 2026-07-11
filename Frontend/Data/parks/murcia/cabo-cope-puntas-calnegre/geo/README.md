# Capas GeoJSON del mapa

Esta carpeta contiene la **geometría** del mapa, separada de los datos de especies
(`../park.json`). El frontend (`Frontend/Js/app.js`) las carga con `L.geoJSON`.

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

Geometría de hábitats — **cartografía real** (dos fuentes):

- **`habitats.geojson`** — un `Feature` `MultiPolygon` por hábitat cartografiado, con
  `properties.slug` (= slug del hábitat), `code` (código Natura 2000), `hectares` (superficie
  dentro del parque) y `source`. La app dibuja el polígono automáticamente; los hábitats sin
  `Feature` siguen dibujándose como círculo aproximado (`coordinates` en `park.json`).

  De los 15 hábitats oficiales, **11 provienen del Inventario Español de Hábitats Terrestres
  (INB, MITECO)**, huso 30 (ETRS89 / UTM 30N, EPSG:25830): shapefile `INB_Habitat30_ETRS89_H30`
  de recintos + tabla `Datos30.dbf` (relación recinto→código `CODUE`). Se recortaron al polígono
  del Parque Regional y se ensamblaron por código.

  > ⚠️ **Los otros 4 hábitats (`dunas-malcomietalia` 2230, `rios-glaucium` 3250,
  > `sabinar-juniperus` 5210, `prados-alysso-sedion` 6110) NO aparecen en los recintos del INB
  > dentro del parque.** Se han cartografiado con una **fuente distinta**: la **cartografía de
  > hábitats terrestres de la Región de Murcia (CARM, 2020)**, servicio WFS
  > `SIG_HAB_HABITATS_CARM:habitats_terrestres_2020` de `mapas-gis-inter.carm.es`. Estos 4
  > llevan `properties.review = true` en el GeoJSON y una `reviewNote` en `park.json` (con lo que
  > la app les muestra la insignia «a revisar»). **Su presencia y delimitación exactas dentro
  > del parque quedan PENDIENTES DE REVISIÓN**, por proceder de una fuente y metodología
  > distintas a las del resto y no estar contrastadas con el INB ni con trabajo de campo.

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

Para regenerar la geometría de hábitats:
1. **INB (11 hábitats):** recortar el shapefile de recintos al `parque-regional.geojson`
   (mismo CRS 25830), unir con `Datos30.dbf` por `HAB_LAY` para obtener el `CODUE` de cada
   recinto, y ensamblar un `MultiPolygon` por código. Reproyectar a `EPSG:4326`.
2. **CARM 2020 (4 hábitats pendientes):** `GetFeature` del WFS
   `SIG_HAB_HABITATS_CARM:habitats_terrestres_2020` (EPSG:25830) por el `bbox` del parque,
   recortar al polígono del parque y filtrar por el campo `codtipohab` (admite mosaicos
   separados por comas). Reproyectar a `EPSG:4326`.
3. Exportar a GeoJSON sobre estos nombres de archivo. La web lo usa sin cambios de código.

Endpoint WFS CARM (capacidades):
`https://mapas-gis-inter.carm.es/geoserver/ows?service=WFS&version=2.0.0&request=GetCapabilities`

## Slugs de hábitat válidos (los 15 oficiales del PORN, CARM 2021)

`acantilados`, `matorral-semiarido`, `azufaifar`, `matorral-halofilo`, `matorral-halonitrofilo`,
`galeria-ribera`, `veg-anual-desechos-marinos`, `estepas-salinas-albardinal`, `dunas-embrionarias`,
`dunas-malcomietalia`\*, `rios-glaucium`\*, `sabinar-juniperus`\*, `prados-alysso-sedion`\*,
`subestepa-thero-brachypodietea`, `roquedos-casmofiticos`.

\* Cartografiados con la fuente CARM 2020 (no INB) — **pendientes de revisión** (ver arriba).
