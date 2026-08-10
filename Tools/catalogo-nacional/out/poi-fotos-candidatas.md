# Fotos de los POIs de Cuatro Calas y Sierra Espuña — cerrado el 2026-08-09

> **10 de los 17 POIs llevan foto; los otros 7 se quedan sin ella porque no hay material libre en
> Commons.** Escritas por `poi-images.js` en los dos `park.json` y en `Database/poi-imagenes.sql`
> (10 `UPDATE`, **aplicado y verificado** contra la BD: `Frontend/Js/data.js` da prioridad a la API
> sobre el `park.json` empaquetado, así que sin cargarlo el despliegue seguiría sirviendo lo viejo).

## Qué salió

**Cuatro Calas — 4 de 4.** Las cuatro elegidas a mano en `data/poi-foto.json` tras mirar las 40 fotos
de la categoría (ver §"Las que elegía el orden alfabético eran malas").

| POI | Archivo | Autor | Licencia |
|---|---|---|---|
| Vulcanismo de La Carolina | `Entrada a la Cala La Carolina.jpg` | Mabelcalabuig | CC BY-SA 3.0 es |
| Playa de los Cocedores | `Cala Cerrada o de los Cocederos, en el Paraje Protegido Las Cuatro Calas.JPG` | Mabelcalabuig | CC BY-SA 3.0 es |
| Conglomerados de Cuatro Calas | `Cuatro Calas Murcia.jpg` | Mynomadicbackpack | CC BY-SA 4.0 |
| Playa de Calarreona | `Calarreona, lado sur, en Las Cuatro Calas.JPG` | Mabelcalabuig | CC BY-SA 3.0 es |

**Sierra Espuña — 6 de 13**, en tres pasadas con tres categorías distintas.

| POI | Archivo | Licencia | Categoría usada |
|---|---|---|---|
| Pozos de la Nieve | `Pozos de la Nieve de Murcia 11-03-2024.jpg` | CC BY 4.0 | del parque |
| Casa Forestal de Huerta Espuña | `Casa Forestal de Huerta Espuña. Sierra Espuña.jpg` | CC BY-SA 4.0 | del parque |
| Centro de Visitantes Ricardo Codorníu | `Centro de Visitantes y Gestión Ricardo Codorniu. Sierra Espuña.jpg` | CC BY-SA 4.0 | del parque |
| Sanatorio de Tuberculosos | `Antiguo Sanatorio de Tuberculosos de Sierra Espuña 03.jpg` | CC BY-SA 4.0 | `Category:Sanatorio de Tuberculosos de Sierra Espuña` |
| Santuario de Santa Eulalia de Mérida | `Iglesia de Santa Eulalia de Merida (1).jpg` | CC BY-SA 3.0 es | `Category:Church of Santa Eulalia de Mérida, Totana` |
| Torre del Azaraque | `Restos de la Torre del Azaraque (Alhama de Murcia).jpg` | CC BY-SA 4.0 | buscador, con `--force` |

## Los comandos que se ejecutaron

> Las cuatro de Cuatro Calas se reescribieron después con `--all`, ya con `data/poi-foto.json` puesto.

```bash
node Tools/catalogo-nacional/poi-images.js --park cuatro-calas \
     --categoria "Cuatro Calas Protected Landscape" --municipio "Águilas" --write
node Tools/catalogo-nacional/poi-images.js --park sierra-espuna \
     --categoria "Parque Regional de Sierra Espuña" --municipio "Totana" --write
node Tools/catalogo-nacional/poi-images.js --park sierra-espuna \
     --categoria "Sanatorio de Tuberculosos de Sierra Espuña" --municipio "Alhama de Murcia" --write
node Tools/catalogo-nacional/poi-images.js --park sierra-espuna \
     --categoria "Sanatorio de Tuberculosos de Sierra Espuña" --municipio "Alhama de Murcia" --force --write
node Tools/catalogo-nacional/poi-images.js --park sierra-espuna \
     --categoria "Church of Santa Eulalia de Mérida, Totana" --municipio "Totana" --write
```

Cada pasada escribe su propio `--sql`, así que los cinco ficheros se concatenaron a mano en
`Database/poi-imagenes.sql`. El script sobrescribe el `--sql` en cada ejecución: no acumula.

## Las tres cosas que hubo que resolver

### 1 · El bug que decía «sin candidata» teniendo candidata

`resuelvePoi` devolvía `{ ...elegida, rechazos }` —la candidata aplanada— y `procesaParque` lee
`res.elegida`, que ahí es `undefined`. **Cuando encontraba foto, informaba de que no había ninguna**,
y como los rechazos venían vacíos lo anotaba como «ninguna candidata pasó licencia y carga». Con 40
archivos utilizables en Cuatro Calas y 78 en Sierra Espuña, los 17 POIs salían a cero. Corregido a
`return { elegida, rechazos }` en las dos salidas de la función.

### 2 · Dos categorías que el barrido no alcanza

`cmtype=subcat` devuelve **cero subcategorías** tanto para `Category:Cuatro Calas Protected Landscape`
como para `Category:Parque Regional de Sierra Espuña`. Ni la del Sanatorio ni la de Santa Eulalia
cuelgan de la del parque, así que el barrido de un nivel no las ve y hubo que pasarlas en
`--categoria`. No es un fallo del ancla: el ancla garantiza el sitio porque no sale de la categoría.

Los 14 archivos de `Category:Cala de los Cocedores` sí están además en la categoría del espacio, así
que esa subcategoría no hizo falta.

### 3 · Dos coincidencias verificadas a mano por coordenadas

- **Torre del Azaraque** salió por el buscador y por tanto como «a revisar». El archivo declara
  **37.8374849, −1.47182282** y el POI está en **37.837443, −1.471796**: unos 5 m. Mismo torreón, y
  era la única candidata «a revisar» de esa pasada, así que `--force` no podía colar otra cosa.
- **Santuario de Santa Eulalia**: su categoría en Commons se llama «Church of…» y en Totana hay
  iglesia parroquial aparte. La categoría declara **37.800832, −1.557237** y el POI **37.800765,
  −1.557502**: unos 25 m. Coincide con el *Decreto 96/2002* que ya citaba el `source` del POI.

## Las que elegía el orden alfabético eran malas

De las 40 fotos de la categoría de Cuatro Calas, **el script se quedaba con la primera por orden
alfabético del nombre del archivo**, y ese orden no tiene nada que ver con cuál ilustra mejor el
sitio. Salían un primer plano de roca con cielo gris, otro de un depósito de esparto con el cielo
quemado, una vista desde la carretera y unos afloramientos rocosos al atardecer. Todas correctas de
sitio; todas malas de imagen.

Las 40 se miraron una a una y las elegidas están en **`Tools/catalogo-nacional/data/poi-foto.json`**
(nuevo), que `poi-images.js` aplica como **vía 0**, antes que la categoría. No salta ninguna
comprobación: el archivo elegido pasa por la misma lista blanca de licencias y la misma comprobación
de carga, y si no las pasa se anota como descartado y la cadena sigue.

La que más gana es la de los Cocedores: `Cala Cerrada o de los Cocederos…` enseña **los propios
cocederos excavados en el acantilado de marga**, que es el hecho que cuenta la ficha, y además es
buena foto. La anterior también los enseñaba, pero de cerca y con el cielo blanco.

**Sierra Espuña no se ha tocado**: sus seis fotos se revisaron igual y son buenas —los dos pozos de
nieve con la sierra detrás, el sanatorio en ruinas, y el interior de Santa Eulalia con el artesonado
mudéjar y el ciclo de pinturas murales, que es exactamente lo que describe su ficha—.

## Tres vías más para buscar, y qué dieron

Además del nombre de archivo dentro de la categoría, se probó:

| Vía | Cómo | Qué dio |
|---|---|---|
| **Geosearch de Commons** (`list=geosearch`) | archivos geoetiquetados en 500 m del POI | **Incorporada al script como vía 2.** Alcanza archivos que no están en ninguna categoría del espacio |
| Categoría padre y de municipio | `Category:Sierra Espuña` (89 archivos con sus subcategorías), `Totana`, `Aledo`, `Alhama de Murcia`, `Mula`, `Pliego` | Nada nuevo para los 7 sin foto |
| Wikidata (`wbsearchentities`) y es.wikipedia (`prop=images`) | por nombre del POI | **Ninguno de los 7 tiene elemento en Wikidata**; los artículos de Wikipedia no aportan imágenes que no estén ya en las categorías |

La geosearch merece la pena explicarla porque su garantía es distinta: **las coordenadas garantizan el
sitio, no el sujeto**. En 500 m de un POI de Sierra Espuña hay fotos de mariposas (`Polyommatus
celina`, a 449 m de los Pozos de la Nieve). Por eso la vía 2 sigue exigiendo la mención por nombre o
alias, igual que la vía 1: coordenadas para el sitio, nombre para el elemento. El informe anota la
distancia de la candidata elegida.

## El alias corregido

`conglomerados-de-cuatro-calas` llevaba como alias el nombre oficial del LIG BE005, «Playa de Cuatro
Calas», y eso casaba con «Calarreona, algas en la playa (Las Cuatro Calas)»: un primer plano de algas
en otra cala, para un POI **geológico**. Cambiado a «Cuatro calas aguilas», que trae las vistas
generales del tramo costero, que es lo que el propio inventario dice que representa el punto. No vale
«Cuatro Calas Murcia»: casa también con la foto de la Cala La Carolina.

## Los 7 sin foto: hueco cerrado, no pendiente

Pozo de la nieve de Mula, Torreón de los Exploradores, Caño de Espuña, Casas de Malvariche, Garita
del Turullón, Hornos de cal del Barranco de Argüelles y Capilla de la Virgen del Rocío. Buscados por
**cinco vías independientes**: nombre de archivo, texto completo del buscador de Commons, barrido de
categorías (del espacio, la padre y las de los cinco municipios), geosearch a 1.500 m y Wikidata.
**No hay material.**

Cinco de los siete **no tienen ni un solo archivo geoetiquetado en 1 km**, que es la confirmación más
limpia: no es que la búsqueda por nombre falle, es que no hay fotos. El sexto, Hornos de cal del
Barranco de Argüelles, solo tiene a 745 m fotos genéricas de sendas importadas de Panoramio.

Los falsos positivos que aparecieron y el filtro descartó bien: «Pozo de la nieve (El Tiemblo)»
(Ávila), una ermita aragonesa de «los Tres Canyos» para el Caño de Espuña, y **«El Cañico.jpg», que
es una fuente del casco urbano de Totana**, no la conducción hidráulica del parque.

> **Ojo con los mapas.** La categoría de Sierra Espuña contiene un `Mapa sierra espuna.svg`. El
> filtro `usable()` de `lib/wikimedia.js` lo descartó, como debía. Si alguna vez aparece en el
> informe, es que el filtro se ha quedado corto.
