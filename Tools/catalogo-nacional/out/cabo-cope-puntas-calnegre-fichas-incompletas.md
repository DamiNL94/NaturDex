# cabo-cope-puntas-calnegre · fichas universales con huecos

GENERADO por `Tools/catalogo-nacional/build-species-universal.js`. No editar a mano.

Cada especie de aquí **ya está dada de alta** en `data/especies-universal.json`, pero con algún
campo vacío: ninguna fuente lo sirve en el formato que pide la ficha, y rellenarlo a ojo es lo
que prohíbe la regla nº 2 de `CLAUDE.md`. Los huecos se cierran con `--curado <fichero.json>`,
un `{ "<nombre científico>": { "<campo>": <valor> } }` versionado y revisable.

Las dos columnas de la derecha son el material con el que curar **sin salirse de la fuente**:
«Descripción en EIDOS» es de donde salen las tres pistas de identificación, y «Otros nombres en
EIDOS» lista los nombres castellanos que la fuente conoce —el marcado como preferente no
siempre es por el que se conoce a la especie: EIDOS prefiere «Aguilón» a «Alimoche común».

Total: **4**.

| Especie | Campos vacíos | Otros nombres en EIDOS | Descripción en EIDOS |
|---|---|---|---|
| *Scrophularia arguta* | group, habitat, seasonality, description, tips | Cenizo<br>Jortiguilla<br>Ortigón<br>Ortiguilla | — |
| *Centaurium quadrifolium* | group, tips | Clavelina del campo<br>Hiel de la tierra<br>Hierba amargosa<br>Yerba amargosa<br>Yerba margosa | Presenta las hojas lineares o espatuladas, hasta con tres nervios, y lóbulos de la corola de menos de la mitad que el tubo. |
| *Orobanche cernua* | group, habitat, description, tips | Jopo (preferente) | — |
| *Ononis sicula* | commonName, group, habitat, description, image, tips | — | — |
