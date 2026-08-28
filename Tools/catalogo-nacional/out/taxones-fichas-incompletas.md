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

Total: **1**.

| Especie | Campos vacíos | Otros nombres en EIDOS | Descripción en EIDOS |
|---|---|---|---|
| *Enneapogon persicus* | commonName, habitat, seasonality, image, tips | — | Planta herbácea perenne, de hasta 50 cm de altura. Hojas con limbo de hasta 15 cm, enrollado; lígula pelosa. Inflorescencia en panícula densa, 120 x 20 mm, blanquecino-violácea. Espiguillas de 9-11 mm, con 2-3 flores. Lema ovado-redondeada, con 9 aristas plumosas en la base. Cariópside plumosa, hasta 10 mm de longitud (incluyendo las aristas). |
