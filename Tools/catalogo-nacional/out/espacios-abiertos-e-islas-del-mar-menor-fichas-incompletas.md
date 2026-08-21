# espacios-abiertos-e-islas-del-mar-menor · fichas universales con huecos

GENERADO por `Tools/catalogo-nacional/build-species-universal.js`. No editar a mano.

Cada especie de aquí **ya está dada de alta** en `data/especies-universal.json`, pero con algún
campo vacío: ninguna fuente lo sirve en el formato que pide la ficha, y rellenarlo a ojo es lo
que prohíbe la regla nº 2 de `CLAUDE.md`. Los huecos se cierran con `--curado <fichero.json>`,
un `{ "<nombre científico>": { "<campo>": <valor> } }` versionado y revisable.

Las dos columnas de la derecha son el material con el que curar **sin salirse de la fuente**:
«Descripción en EIDOS» es de donde salen las tres pistas de identificación, y «Otros nombres en
EIDOS» lista los nombres castellanos que la fuente conoce —el marcado como preferente no
siempre es por el que se conoce a la especie: EIDOS prefiere «Aguilón» a «Alimoche común».

Total: **16**.

| Especie | Campos vacíos | Otros nombres en EIDOS | Descripción en EIDOS |
|---|---|---|---|
| *Calandrella rufescens* | commonName, habitat, description, tips | — | — |
| *Porphyrio porphyrio* | habitat, tips | Calamón<br>Calamón (preferente)<br>Calamón común | El más grande de los rálidos europeos es un ave de buen tamaño y aspecto absolutamente inconfundible. Los ejemplares adultos lucen un plumaje de tonos azulados y violáceos con reflejos purpúreos, que se torna azul metálico en la cara, la parte anterior del cuello y la zona superior del pecho; las infracoberteras caudales, de color blanco puro, contrastan vivamente con el resto de la librea del ave… |
| *Calidris temminckii* | tips | Correlimos de Temminck (preferente)<br>Correlimos de Temminck | Es una limícola de reducido tamaño y de cuerpo bastante alargado, con el pico más bien pequeño y las patas más cortas que la altura del cuerpo. En todos los plumajes, la garganta y el pecho —muy oscuros— definen una especie de babero. Tiene las patas verdosas y el pico de color negro. El adulto en plumaje nupcial suele presentar las partes dorsales con una mezcla de plumas nuevas (oscuras, con bor… |
| *Gymnosporia senegalensis* | group, habitat, description, tips | Arto (preferente) | — |
| *Cressa cretica* | group, habitat, description, tips | Matojillo<br>Cresa | — |
| *Turdus pilaris* | habitat, tips | Zorzal real (preferente)<br>Zorzal real | El real es un zorzal grande y bastante corpulento, que se reconoce fácilmente por presentar la cabeza y el obispillo de color gris azulado. El plumaje de la espalda y del dorso del ala es pardo-grisáceo, algo rojizo en ocasiones, mientras que las partes inferiores son blanquecinas con manchas ocres en los flancos y el pecho —más intensas en época reproductora— y profusamente moteadas de manchas os… |
| *Ranunculus bullatus* | group, habitat, description, tips | Margarita<br>Hierba bellida<br>Jaramago<br>Margarita amarilla<br>flor de San Diego<br>botoncillo de oro | — |
| *Asplenium obovatum* | commonName, habitat, description, tips | — | — |
| *Hippocampus guttulatus* | group, habitat, description, tips | Caballito de mar (preferente) | — |
| *Platycapnos tenuiloba* | commonName, group, habitat, description, tips | — | — |
| *Anas strepera* | commonName, habitat, description, tips | — | — |
| *Artemisia gallica* | group, habitat, seasonality, rarityScore, description, tips | Tomillo blanco | — |
| *Asplenium billotii* | habitat, description, tips | Jelecho (preferente) | — |
| *Capparis zoharyi* | group, habitat, seasonality, description, tips | Alcaparra<br>Alcaparras<br>Alcaparrón<br>Alcaparroneras<br>Caparrón<br>Mata panera<br>Mierga<br>Tapanera | — |
| *Scilla autumnalis* | commonName, group, habitat, seasonality, description, tips | — | — |
| *Tadarida teniotis* | tips | Murciélago rabudo (preferente) | Murciélago de gran tamaño, con alas largas y estrechas. Cabeza característica con orejas rígidas proyectadas hacia delante. La cola sobresale por fuera de la membrana caudal y se retrae en el uropatagio en vuelo. El color del pelo es muy variable, de pardo a gris claro. Algunos ejemplares presentan áreas canosas. No se ha descrito dimorfismo sexual en cuanto al color. Las hembras son ligeramente m… |

## Nombres que EIDOS da por sinónimo

La ficha se ha dado de alta con el nombre **pedido**, que es el de la selección aprobada.
Renombrar arrastra la clave en `data/contenido/` y en el resto de parques.

- Artemisia gallica → Artemisia caerulescens subsp. gallica (Willd.) K. Perss.
- Capparis zoharyi → Capparis spinosa L. subsp. spinosa
