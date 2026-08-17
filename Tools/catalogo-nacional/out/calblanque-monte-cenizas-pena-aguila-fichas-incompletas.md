# calblanque-monte-cenizas-pena-aguila · fichas universales con huecos

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
| *Olea europaea subsp. sylvestris* | commonName, group, habitat, seasonality, rarityScore, description, tips | — | — |
| *Scolopax rusticola* | habitat, tips | Chocha perdiz (preferente)<br>Chocha perdiz<br>Becada | Es una limícola relativamente grande, de largo pico, patas bastante cortas y grandes ojos oscuros, muy desplazados hacia atrás y hacia arriba en la cabeza. Posee un plumaje extremadamente críptico, dominado por los tonos marrones y rojizos, que en el dorso adquieren una notable complejidad, con un diseño abigarrado de barrados, punteados y manchas de diferente tonalidad. Las regiones ventrales son… |
| *Melanitta nigra* | tips | Negrón común<br>Negrón común<br>Negrón común | Se trata de un pato marino de ancho pico, larga cola apuntada y plumaje muy oscuro. El macho adulto es completamente negro, a excepción de una porción del pico, que es anaranjada. En vuelo se ve muy oscuro, aunque con las primarias algo pálidas. La hembra es gris pardo muy oscuro, con las mejillas y parte del cuello de color marrón claro. El joven, aunque similar a la hembra, resulta ligeramente m… |

## Nombres que EIDOS da por sinónimo

La ficha se ha dado de alta con el nombre **pedido**, que es el de la selección aprobada.
Renombrar arrastra la clave en `data/contenido/` y en el resto de parques.

- Olea europaea subsp. sylvestris → Olea europaea L. subsp. europaea
