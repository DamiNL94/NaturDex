# Fotos de los POIs de Cuatro Calas y Sierra Espuña — cerrado el 2026-08-09

> **10 de los 17 POIs llevan foto; los otros 7 se quedan sin ella porque no hay material libre en
> Commons.** Escritas por `poi-images.js` en los dos `park.json` y en `Database/poi-imagenes.sql`
> (10 `UPDATE`, **pendiente de aplicar contra la BD**: `Frontend/Js/data.js` da prioridad a la API
> sobre el `park.json` empaquetado).

## Qué salió

**Cuatro Calas — 4 de 4.** Los cuatro por la vía 1 (categoría del espacio) y por alias, CC BY-SA 3.0 es.

| POI | Archivo | Autor |
|---|---|---|
| Vulcanismo de La Carolina | `Afloramientos rocosos en la Cala La Carolina.JPG` | Mabelcalabuig |
| Playa de los Cocedores | `Antiguo deposito de esparto en la Cala de los Cocederos.JPG` | Mabelcalabuig |
| Conglomerados de Cuatro Calas | `Cuatro calas aguilas vista desde carretera.jpg` | Edumartinez89 |
| Playa de Calarreona | `Calarreona, afloramientos rocosos.Las Cuatro Calas.JPG` | Mabelcalabuig |

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

## El alias corregido

`conglomerados-de-cuatro-calas` llevaba como alias el nombre oficial del LIG BE005, «Playa de Cuatro
Calas», y eso casaba con «Calarreona, algas en la playa (Las Cuatro Calas)»: un primer plano de algas
en otra cala, para un POI **geológico**. Cambiado a «Cuatro calas aguilas», que trae las vistas
generales del tramo costero, que es lo que el propio inventario dice que representa el punto. No vale
«Cuatro Calas Murcia»: casa también con la foto de la Cala La Carolina.

## Los 7 sin foto: hueco cerrado, no pendiente

Pozo de la nieve de Mula, Torreón de los Exploradores, Caño de Espuña, Casas de Malvariche, Garita
del Turullón, Hornos de cal del Barranco de Argüelles y Capilla de la Virgen del Rocío. Buscados uno
a uno en Commons por nombre y en el espacio de nombres de categorías: **no hay material**. Los dos
únicos resultados que aparecieron eran de otras provincias —«Pozo de la nieve (El Tiemblo)», Ávila, y
una ermita aragonesa— y el filtro los descartó por no mencionar el sitio.

> **Ojo con los mapas.** La categoría de Sierra Espuña contiene un `Mapa sierra espuna.svg`. El
> filtro `usable()` de `lib/wikimedia.js` lo descartó, como debía. Si alguna vez aparece en el
> informe, es que el filtro se ha quedado corto.
