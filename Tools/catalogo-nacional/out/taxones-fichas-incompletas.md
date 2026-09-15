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
| *Saxifraga almeriensis* | commonName, group, habitat, seasonality, description, image, tips | — | — |

## Nombres que EIDOS da por sinónimo

La ficha se ha dado de alta con el nombre **pedido**, que es el de la selección aprobada.
Renombrar arrastra la clave en `data/contenido/` y en el resto de parques.

- Saxifraga almeriensis → Saxifraga camposii subsp. leptophylla (Willk.) D.A. Webb
