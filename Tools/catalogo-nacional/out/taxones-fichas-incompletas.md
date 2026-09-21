# taxones · fichas universales con huecos

GENERADO por `Tools/catalogo-nacional/build-species-universal.js`. No editar a mano.

Cada especie de aquí **ya está dada de alta** en `data/especies-universal.json`, pero con algún
campo vacío: ninguna fuente lo sirve en el formato que pide la ficha, y rellenarlo a ojo es lo
que prohíbe la regla nº 2 de `CLAUDE.md`. Los huecos se cierran con `--curado <fichero.json>`,
un `{ "<nombre científico>": { "<campo>": <valor> } }` versionado y revisable.

Las dos columnas de la derecha son el material con el que curar **sin salirse de la fuente**:
«Descripción en EIDOS» es de donde salen las tres pistas de identificación, y «Otros nombres en
EIDOS» lista los nombres castellanos que la fuente conoce —el marcado como preferente no
siempre es por el que se conoce a la especie: EIDOS prefiere «Aguilón» a «Alimoche común».

Total: **18**.

| Especie | Campos vacíos | Otros nombres en EIDOS | Descripción en EIDOS |
|---|---|---|---|
| *Genetta genetta* | habitat, description, tips | Gineta (preferente) | — |
| *Malpolon monspessulanus* | habitat, description, tips | Bicha<br>Culebra<br>Culebra bastarda (preferente) | — |
| *Calandrella rufescens* | habitat, description, tips | Terrera marismeña (preferente)<br>Terrera marismeña | — |
| *Regulus ignicapillus* | habitat, description, tips | Reyezuelo listado (preferente)<br>Reyezuelo listado | — |
| *Testudo graeca* | habitat, description, tips | Tortuga mora (preferente) | — |
| *Fringilla coelebs* | habitat, description, tips | Pimientera (preferente)<br>Pinzón vulgar | — |
| *Cymodocea nodosa* | group, habitat, description, tips | Seba<br>Alga (preferente)<br>Grama de mar<br>Sebadal<br>alga marina | — |
| *Charadrius alexandrinus* | habitat, description, tips | Pollito de mar<br>Chorlo nevado<br>Frailecillo blanco<br>Chorlitejo patinegro (preferente)<br>Chorlitejo patinegro | — |
| *Natrix maura* | habitat, description, tips | Culebra de agua<br>Culebra viperina (preferente) | — |
| *Macroprotodon brevis* | habitat, description, tips | Culebra de cogulla occidental (preferente) | — |
| *Zamenis scalaris* | habitat, description, tips | Bicha<br>Culebra<br>Culebra de escalera (preferente) | — |
| *Macroprotodon cucullatus* | habitat, seasonality, description, tips | Culebra de cogulla oriental<br>Culebra de cogulla (preferente)<br>Culebra de cogulla occidental | — |
| *Hemorrhois hippocrepis* | habitat, description, tips | Asperomarín<br>Culebra de herradura (preferente) | — |
| *Coronella girondica* | habitat, description, tips | Culebra lisa meridional (preferente) | — |
| *Ulex europaeus* | group, habitat, description, tips | Tojo<br>Tojo<br>Aliaga<br>Árguma<br>Aulaga | — |
| *Arbutus unedo* | group, habitat, description, tips | Madroño<br>Madroño<br>Abis<br>Agarullo<br>Alboriu<br>Albornial<br>Alborniu<br>Alborza<br>Alborzas<br>Alborzera<br>Arbetón<br>Árbol de los borrachinos<br>Armoniu<br>Bordo<br>Borrachinal<br>Borto<br>Burrubiote<br>Campanita<br>Madroña<br>Madroñal<br>Madroñera<br>Madroños<br>Mairoñera<br>Modrollera<br>Modroño<br>Aborio<br>Albornio<br>Madroñera<br>Modrollo | — |
| *Cytisus scoparius* | group, habitat, description, tips | Retama negra<br>Retamón<br>Xesta<br>Ginesta<br>Albareja<br>Ehcoba<br>Ejcoba<br>Escoba<br>Escoba amarilla<br>Escoba bermeja<br>Escoba negra<br>Escoba negral<br>Escoba rubia<br>Escoba tamariz<br>Escoba verde<br>Escobaeras<br>Escobajera<br>Escobal<br>Escobeña<br>Escobeñas<br>Escobera<br>Escoberas<br>Escobón<br>Escobones<br>Gorbiñu<br>Hiniesta<br>Hiniestra<br>Jiniesta<br>Piorno<br>Ramón<br>Retama amarilla<br>Retama colorá<br>Retama de escobas<br>Retama fina<br>Retama hiniesta<br>Retama inhiesta<br>Siniestra<br>Zapaterinos<br>Retama colorada<br>Escoba portuguesa<br>Chamosca<br>Escoba de flor amarilla<br>Escoba rubial<br>Escobadera<br>Hillesta<br>Retama | — |
| *Natrix natrix* | habitat, description, tips | Culebra de collar | — |

## Nombres que EIDOS da por sinónimo

La ficha se ha dado de alta con el nombre **pedido**, que es el de la selección aprobada.
Renombrar arrastra la clave en `data/contenido/` y en el resto de parques.

- Calandrella rufescens → Alaudala rufescens (Vieillot, 1819)
- Regulus ignicapillus → Regulus ignicapilla (Temminck, 1820)
- Natrix natrix → Natrix helvetica (Lacépède, 1789)
