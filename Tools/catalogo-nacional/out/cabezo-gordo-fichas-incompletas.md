# cabezo-gordo · fichas universales con huecos

GENERADO por `Tools/catalogo-nacional/build-species-universal.js`. No editar a mano.

Cada especie de aquí **ya está dada de alta** en `data/especies-universal.json`, pero con algún
campo vacío: ninguna fuente lo sirve en el formato que pide la ficha, y rellenarlo a ojo es lo
que prohíbe la regla nº 2 de `CLAUDE.md`. Los huecos se cierran con `--curado <fichero.json>`,
un `{ "<nombre científico>": { "<campo>": <valor> } }` versionado y revisable.

Las dos columnas de la derecha son el material con el que curar **sin salirse de la fuente**:
«Descripción en EIDOS» es de donde salen las tres pistas de identificación, y «Otros nombres en
EIDOS» lista los nombres castellanos que la fuente conoce —el marcado como preferente no
siempre es por el que se conoce a la especie: EIDOS prefiere «Aguilón» a «Alimoche común».

Total: **3**.

| Especie | Campos vacíos | Otros nombres en EIDOS | Descripción en EIDOS |
|---|---|---|---|
| *Bufo bufo* | commonName, habitat, description, tips | — | — |
| *Anagyris foetida* | group, habitat, description, tips | Altramuces<br>Altramuces amargos<br>Altramuz del diablo<br>Altramuz silvestre<br>Erfa<br>Hediondo<br>Jediondo<br>Jeriondo<br>Jeyondero<br>altramuz hediondo<br>Altramuz fétido | — |
| *Plecotus austriacus* | habitat, tips | Murciélago orejudo meridional<br>Orejudo gris<br>Murciélago orejudo gris (preferente) | Es un murciélago de tamaño medio. Orejas muy grandes que se unen por la base de sus bordes internos. El dorso es gris oscuro con los pelos negruzcos en casi toda su longitud, mientras que la zona ventral es blanquecina o gris muy pálida. Los jóvenes tienen una coloración grisácea más apagada. Las hembras son por lo general algo mayores que los machos. ANT: 37,0-45,0 mm; Ps: 6,5-15 g. Fórmula denta… |
