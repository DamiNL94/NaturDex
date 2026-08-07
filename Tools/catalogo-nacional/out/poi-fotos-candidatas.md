# Fotos para los POIs de Cuatro Calas y Sierra Espuña — búsqueda del 2026-08-07

> **Ninguna de estas fotos se ha verificado y ninguna está escrita en `park.json`.** La sesión en la
> que se hizo esta búsqueda no tenía salida a `commons.wikimedia.org`, `upload.wikimedia.org` ni
> `es.wikipedia.org` (la política de red del entorno solo permitía GitHub), así que **no se ha podido
> abrir la ficha de ningún archivo**: ni su licencia, ni su autor, ni qué retrata exactamente.
>
> Lo que hay abajo sale del índice de un buscador web restringido al dominio de Commons. Que una URL
> aparezca ahí prueba que la página existe; no prueba nada más. Cerrar esto es una pasada de
> `Tools/catalogo-nacional/poi-images.js` desde una máquina con red.

## Lo que sí se ha encontrado

Las dos primeras filas son las importantes: son **categorías del espacio**, no archivos sueltos. Un
archivo que está dentro de la categoría de Cuatro Calas está en Cuatro Calas por construcción, y eso
es exactamente el ancla sobre la que trabaja `poi-images.js`.

| Espacio | Recurso en Commons | Para qué serviría |
|---|---|---|
| Cuatro Calas | [`Category:Cuatro Calas Protected Landscape`](https://commons.wikimedia.org/wiki/Category:Cuatro_Calas_Protected_Landscape) | **La categoría del espacio.** Punto de partida de los cuatro POIs |
| Sierra Espuña | [`Category:Parque Regional de Sierra Espuña`](https://commons.wikimedia.org/wiki/Category:Parque_Regional_de_Sierra_Espu%C3%B1a) | **La categoría del espacio**, ~75 archivos según el buscador |
| Cuatro Calas | [`Category:Cala de los Cocedores`](https://commons.wikimedia.org/wiki/Category:Cala_de_los_Cocedores) | Subcategoría, POI «Playa de los Cocedores» |
| Cuatro Calas | [`File:Playa de los Cocedores (Águilas, Murcia).jpg`](https://commons.wikimedia.org/wiki/File:Playa_de_los_Cocedores_(%C3%81guilas,_Murcia).jpg) | POI «Playa de los Cocedores». El paréntesis con «Águilas, Murcia» es buena señal: distingue de la cala almeriense |
| Cuatro Calas | [`File:Afloramientos rocosos en la Cala La Carolina.JPG`](https://commons.wikimedia.org/wiki/File:Afloramientos_rocosos_en_la_Cala_La_Carolina.JPG) | POI «Punta Parda – Playa de la Carolina», y **temáticamente exacta**: el hecho de ese POI es justo el afloramiento volcánico |
| Sierra Espuña | [`Category:Sanatorio de Tuberculosos de Sierra Espuña`](https://commons.wikimedia.org/wiki/Category:Sanatorio_de_Tuberculosos_de_Sierra_Espu%C3%B1a) | El candidato pendiente de coordenada |
| Sierra Espuña | [`File:Sierra-espuna.jpg`](https://commons.wikimedia.org/wiki/File:Sierra-espuna.jpg) | Paisaje general. No sirve para ningún POI concreto |

## Lo que NO se ha encontrado

Buscando en Commons no ha salido nada utilizable para: **Pozos de la Nieve**, **Santuario de Santa
Eulalia de Mérida**, **Torreón de los Exploradores**, **Arco de Sigismondi**, **Casas de
Malvariche**, **Ermita de Santa Leocadia**, **Centro de Visitantes Ricardo Codorníu**, **Paredes de
Leiva**, **Los Ojos del Dragón**, **Torre del Azaraque**, **Playa de la Higuerica** y **Playa de
Calarreona**.

Ese «no ha salido» vale poco: el buscador devolvía sobre todo homónimos de otras provincias
(basílicas de Santa Eulalia en Mérida y Murcia, Collado Villalba, la sierra de Leiva riojana). La
categoría del parque, que es donde de verdad estarían, no se ha podido enumerar. **Con la API de
Commons esta lista puede quedar muy distinta.**

## Dos trampas concretas que hay que evitar al cerrarlo

1. **`Playa de las Higuericas` no es `Playa de la Higuerica`.** La primera está en Pilar de la
   Horadada (Alicante), a 200 km. Salió como resultado al buscar la nuestra. `poi-images.js` compara
   palabras completas, no subcadenas, precisamente por este caso, y tiene la comprobación en su test.
2. **`Ermita de Santa Leocadia` hay al menos tres en España** (Urnieta, Bertizarana, Aledo). El
   nombre no basta: por eso la vía buena es la categoría del espacio y no el buscador.

## Cómo se cierra

```bash
node Tools/catalogo-nacional/poi-images.js --park cuatro-calas \
     --categoria "Cuatro Calas Protected Landscape" --municipio "Águilas" --list
node Tools/catalogo-nacional/poi-images.js --park sierra-espuna \
     --categoria "Parque Regional de Sierra Espuña" --list
```

`--list` no escribe nada: enumera qué candidata sale para cada POI, con su autor, su licencia y por
qué vía. Solo con `--write` se tocan los `park.json`, y aun así el script **no escribe** una
candidata marcada «a revisar» —las que salen del buscador— ni ninguna cuya licencia no sea CC0,
dominio público, CC BY o CC BY-SA.

Si un POI se queda sin foto, se queda con `image: null`. Es la regla del §4.5 y no hay prisa que la
levante: sin foto es mejor que con foto de licencia dudosa.
