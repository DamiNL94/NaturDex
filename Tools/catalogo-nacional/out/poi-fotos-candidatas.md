# Fotos de los POIs de Cuatro Calas y Sierra Espuña — estado al 2026-08-08

> **Los 17 POIs siguen con `image: null`.** Nada de lo que hay aquí está escrito en ningún
> `park.json`, y no debe escribirse a mano: lo escribe `poi-images.js` tras comprobar la licencia.

## Por qué sigue abierto

Tres sesiones lo han intentado y las tres se han quedado en el mismo sitio, por el mismo motivo:

| Sesión | Qué faltaba |
|---|---|
| 2026-08-07 | Sin salida a `commons.wikimedia.org` (la política de red solo permitía GitHub) |
| 2026-08-07 (b) | Commons accesible y consultado, pero **sin Node** para ejecutar `poi-images.js` |
| 2026-08-08 | Sin Node **y** sin salida a `commons.wikimedia.org` ni `es.wikipedia.org` |

No falta herramienta ni criterio: falta **una máquina con Node y salida a Commons**. Es una pasada
de un comando.

## Cómo se cierra

```bash
# Cuatro Calas — 4 POIs
node Tools/catalogo-nacional/poi-images.js --park cuatro-calas \
     --categoria "Cuatro Calas Protected Landscape" --municipio "Águilas" --list

# Sierra Espuña — 13 POIs
node Tools/catalogo-nacional/poi-images.js --park sierra-espuna \
     --categoria "Parque Regional de Sierra Espuña" --municipio "Totana" --list
```

`--list` no escribe nada: enumera qué candidata sale por POI, con autor, licencia y vía. Revisado el
listado, se repite con `--write --sql Database/poi-imagenes.sql --report Docs/fotos-poi.md` y se
aplica el SQL — `Frontend/Js/data.js` da prioridad a la API sobre el `park.json` empaquetado, así que
sin cargarlo un despliegue con backend seguiría sirviendo los POIs sin foto.

Las dos categorías de arriba están **verificadas como existentes**; lo que no se ha podido enumerar
es su contenido.

| Espacio | Categoría de Commons |
|---|---|
| Cuatro Calas | [`Category:Cuatro Calas Protected Landscape`](https://commons.wikimedia.org/wiki/Category:Cuatro_Calas_Protected_Landscape) |
| Cuatro Calas · subcategoría | [`Category:Cala de los Cocedores`](https://commons.wikimedia.org/wiki/Category:Cala_de_los_Cocedores) |
| Sierra Espuña | [`Category:Parque Regional de Sierra Espuña`](https://commons.wikimedia.org/wiki/Category:Parque_Regional_de_Sierra_Espu%C3%B1a) |
| Sierra Espuña · subcategoría | [`Category:Sanatorio de Tuberculosos de Sierra Espuña`](https://commons.wikimedia.org/wiki/Category:Sanatorio_de_Tuberculosos_de_Sierra_Espu%C3%B1a) |

## Lo que se arregló el 2026-08-08 para que esa pasada no salga en balde

La búsqueda tal y como estaba **habría devuelto vacío en el POI mejor documentado de los 17**, y no
por falta de fotos. `mencionaSitio` exige que todas las palabras con peso del nombre del POI estén
en el nombre del archivo, y aquí no lo están:

| POI (`name`) | Archivos de Commons | ¿Casaba? |
|---|---|---|
| Playa de los Cocedores | «Antiguo deposito de esparto en la Cala de los **Cocederos**» (y 9 más) | **No**: falta «playa» y «cocedores» ≠ «cocederos» |
| Vulcanismo de La Carolina | «Afloramientos rocosos en la **Cala La Carolina**» | **No**: falta «vulcanismo» |
| Conglomerados de Cuatro Calas | El IELIG lo llama «**Playa de Cuatro Calas**» | **No**: falta «conglomerados» |

Añadido **`Tools/catalogo-nacional/data/poi-alias.json`** con los nombres alternativos de los POIs de
estos dos espacios, y `poi-images.js` los aplica **solo dentro de la categoría del espacio** (donde
el sitio ya está garantizado), nunca en el buscador. Detalle del mecanismo en
`Docs/prompts/e-rollout-nacional.md` §4.6.

Los alias son una ayuda de búsqueda, no una relajación: la licencia sigue siendo lista blanca (CC0,
dominio público, CC BY, CC BY-SA), la candidata sigue teniendo que cargar de verdad, y una vía 2
sigue saliendo como «a revisar» sin escribirse.

## Qué esperar de la pasada

- **Cuatro Calas** tiene material identificado para 3 de sus 4 POIs (10 archivos de la Cala de los
  Cocederos, uno de ellos temáticamente exacto: los depósitos de esparto). El cuarto, «Playa de
  Calarreona», no tenía candidata.
- **Sierra Espuña** solo tiene identificado un archivo, «Pozos de la Nieve de Murcia 11-03-2024.jpg»,
  y la subcategoría del Sanatorio. De sus 13 POIs, lo normal es que la mayoría se quede sin foto.
- Un POI que se quede sin foto **se queda con `image: null`** y pasa a constar como hueco cerrado,
  no como pendiente. Lo que no vale es lo de ahora: «sin foto» porque no hubo con qué preguntar.

> **Ojo con los mapas.** La categoría de Sierra Espuña contiene un `Mapa sierra espuna.svg`. El
> filtro `usable()` de `lib/wikimedia.js` lo descarta por nombre y por extensión, pero es el falso
> positivo clásico de un lugar y ya hubo el precedente del `Sorbus domestica_range.svg` colado como
> foto de *Cormus domestica*. Si aparece en el informe, es que el filtro se ha quedado corto.
