# Cotejo del estado legal de las fichas contra EIDOS

Generado por `npm run especies:legal -- --online`. **Informe, no arreglo**: lo que aquí sale
hay que llevarlo al BOE y al BORM taxón a taxón, porque la contradicción va en las dos
direcciones y EIDOS no es árbitro de sí mismo (deuda nº 43, y la lección de la nº 4).

Cotejados **1113 taxones** de **3311 fichas** en 16 espacio(s).

| Clase | Qué es | Casos |
|---|---|---|
| A | La ficha AFIRMA una figura que EIDOS no sostiene | 4 |
| B | La ficha no recoge una figura que EIDOS sí trae | 9 |
| C | Las dos ven figura, con gravedad distinta | 1 |
| G | El mismo taxón se contradice entre espacios de la MISMA comunidad | 0 |
| D | El texto no es un estado legal | 0 |
| F | La afirmación no es contrastable con `v_estadolegal` | 12 |
| E | Sin taxón en EIDOS: no hay con qué cotejar | 0 |

La escalera de tramos es la de `Tools/lib/rareza.js`, la misma con la que el pipeline
deriva `rarityScore` y `rarityLocal`:

- **5** · En peligro de extinción · Extinguida
- **4** · Vulnerable · Sensible a la alteración de su hábitat
- **3** · De interés especial
- **2** · En régimen de protección especial (LESRPE)
- **1** · Sin figura de protección

**Lo que este cotejo NO puede decidir.** `v_estadolegal` sirve NORMAS. Las evaluaciones de
conservación (UICN, Lista Roja, Libro Rojo) y los instrumentos supranacionales (Directiva
Aves, Directiva Hábitats, CITES, Berna, Bonn, Barcelona) se apartan **antes** de comparar:
las primeras viven en otra vista y los segundos llegan con `ambito: "Internacional"`, que el
filtro de lo nacional excluye por definición. Acusarlas de «no sostenidas» sería culpar a la
ficha de un filtro nuestro. Van a la clase F.

Y una limitación conocida de la escalera: EIDOS escribe `LAESRPE` en las normas de Aragón,
que el patrón `\bLESRPE\b` de `lib/rareza.js` no reconoce. No afecta a Murcia —su catálogo
usa «Especies de interés especial» y «Vulnerable»— pero hay que mirarlo al entrar en Aragón.

## A · La ficha AFIRMA una figura que EIDOS no sostiene

| Taxón | Ámbito | Texto de la ficha | Tramo ficha | Tramo EIDOS | Norma vigente en EIDOS | Espacios |
|---|---|---|---|---|---|---|
| *Burhinus oedicnemus* | estatal | LESRPE; Directiva Aves 2009/147/CE, Anexo I | 2 | 1 | — | barrancos-de-gebas, cabezo-gordo, cabo-cope-puntas-calnegre, calblanque-monte-cenizas-pena-aguila, carrascoy-y-el-valle, espacios-abiertos-e-islas-del-mar-menor, humedal-del-ajauque-y-rambla-salada, monte-arabi, salinas-arenales-san-pedro-pinatar, sierra-de-el-carche, sierra-de-la-pila, sierra-de-las-moreras, sierra-de-salinas, sierra-espuna |
| *Caralluma europaea* | autonómico (Región de Murcia) | Vulnerable (Decreto n.º 50/2003, de 30 de mayo por el que se crea el Catálogo Regional de Flora Silvestre Protegida de … | 4 | 1 | — | cabezo-gordo, calblanque-monte-cenizas-pena-aguila, espacios-abiertos-e-islas-del-mar-menor |
| *Genetta genetta* | estatal | LESRPE (Listado de Especies Silvestres en Régimen de Protección Especial); Directiva Hábitats 92/43/CEE, Anexo V | 2 | 1 | — | calblanque-monte-cenizas-pena-aguila, humedal-del-ajauque-y-rambla-salada, monte-arabi, sierra-de-el-carche, sierra-de-la-pila, sierra-de-salinas, sierra-espuna, sotos-y-bosques-de-ribera-de-canaverosa |
| *Malpolon monspessulanus* | estatal | LESRPE (Listado de Especies Silvestres en Régimen de Protección Especial) | 2 | 1 | — | barrancos-de-gebas, humedal-del-ajauque-y-rambla-salada, salinas-arenales-san-pedro-pinatar, sierra-de-la-pila, sotos-y-bosques-de-ribera-de-canaverosa, monte-arabi, sierra-de-el-carche, sierra-de-salinas |

El subconjunto que más pesa: estas fichas entran en el **nivel 2** de la puerta
(`mide-niveles-puerta.js` lee la figura del texto), así que su respaldo documental está
construido sobre una afirmación sin cotejar. Que EIDOS calle **no** las desprotege —puede
ser un hueco de EIDOS, como en las dos lavandas—, pero tampoco las respalda.

## B · La ficha no recoge una figura que EIDOS sí trae

| Taxón | Ámbito | Texto de la ficha | Tramo ficha | Tramo EIDOS | Norma vigente en EIDOS | Espacios |
|---|---|---|---|---|---|---|
| *Alyssum montanum* | estatal | Sin figura de protección de ámbito estatal (LESRPE/CEEA) en EIDOS (IEPNB) | 1 | 5 | En peligro de extinción — Real Decreto 139/2011, de 4 de febrero, para el desarrollo del Listad… | sierra-de-el-carche |
| *Calandrella rufescens* | estatal | Sin figura de protección de ámbito estatal (LESRPE/CEEA) en EIDOS (IEPNB) | 1 | 2 | En régimen de protección especial — Real Decreto 139/2011, de 4 de febrero, para el desarrollo del Listad… | espacios-abiertos-e-islas-del-mar-menor, humedal-del-ajauque-y-rambla-salada |
| *Capra pyrenaica* | autonómico (Región de Murcia) | No incluida en el Catálogo Regional de especies protegidas (Región de Murcia) | 1 | 4 | Vulnerable — Ley 7/1995, de 21 de abril, de la fauna silvestre, caza y pesca fluvi… | carrascoy-y-el-valle, monte-arabi, sierra-de-el-carche, sotos-y-bosques-de-ribera-de-canaverosa |
| *Capra pyrenaica* | autonómico (Región de Murcia) | No incluida en el Decreto 50/2003 de protección de especies silvestres de la Región de Murcia (EIDOS, consultado 2026-0… | 1 | 4 | Vulnerable — Ley 7/1995, de 21 de abril, de la fauna silvestre, caza y pesca fluvi… | sierra-espuna |
| *Micromeria fruticosa* | autonómico (Región de Murcia) | No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especie… | 1 | 4 | Vulnerable — Decreto n.º 50/2003, de 30 de mayo por el que se crea el Catálogo Reg… | sierra-de-salinas |
| *Regulus ignicapillus* | estatal | Sin figura de protección de ámbito estatal (LESRPE/CEEA) en EIDOS (IEPNB) | 1 | 2 | En régimen de protección especial — Real Decreto 139/2011, de 4 de febrero, para el desarrollo del Listad… | sotos-y-bosques-de-ribera-de-canaverosa |
| *Rhamnus pumila* | autonómico (Región de Murcia) | No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especie… | 1 | 3 | Especies de interés especial — Decreto n.º 50/2003, de 30 de mayo por el que se crea el Catálogo Reg… | sierra-de-el-carche, sierra-de-salinas |
| *Sambucus nigra* | autonómico (Región de Murcia) | No incluida en el Catálogo Regional de especies protegidas (Región de Murcia) | 1 | 4 | Vulnerable — Decreto n.º 50/2003, de 30 de mayo por el que se crea el Catálogo Reg… | sotos-y-bosques-de-ribera-de-canaverosa |
| *Scilla autumnalis* | autonómico (Región de Murcia) | No incluida en el Catálogo Regional de especies protegidas (Región de Murcia) | 1 | 3 | Especies de interés especial — Decreto n.º 50/2003, de 30 de mayo por el que se crea el Catálogo Reg… | espacios-abiertos-e-islas-del-mar-menor |

Peor que la clase A: aquí se está **perdiendo** una especie protegida. La norma vigente
dice una cosa y la ficha dice otra —o no dice nada, que sale marcado «por silencio»—, así
que su `rarityLocal` está por debajo de lo que le toca y la app no la destaca.

## C · Las dos ven figura, con gravedad distinta

| Taxón | Ámbito | Texto de la ficha | Tramo ficha | Tramo EIDOS | Norma vigente en EIDOS | Espacios |
|---|---|---|---|---|---|---|
| *Testudo graeca* | estatal | Catálogo Español de Especies Amenazadas / LESRPE (Listado de Especies Silvestres en Régimen de Protección Especial); Di… | 2 | 4 | Vulnerable — Real Decreto 139/2011, de 4 de febrero, para el desarrollo del Listad… | cabo-cope-puntas-calnegre, sierra-de-las-moreras |

## G · El mismo taxón se contradice entre espacios de la MISMA comunidad

_Ninguno._

## F · La afirmación no es contrastable con `v_estadolegal`

Ni acusación ni respaldo. Lo que interesa aquí es de qué cuelga cada una: son fichas cuyo
tramo —y por tanto su nivel 2 en `mide-niveles-puerta.js`— descansa entero sobre una
evaluación de conservación o sobre un instrumento supranacional, no sobre el LESRPE ni
sobre un catálogo autonómico. Es legítimo y está documentado (`lib/rareza.js` cuenta las
evaluaciones a propósito desde el 2026-08-11), pero conviene saber cuántas son.

| Taxón | Ámbito | Lo que afirma | Tramo | Espacios |
|---|---|---|---|---|
| *Accipiter gentilis* | estatal | Directiva Aves 2009/147/CE (Red Natura 2000) (2) | 2 | cabo-cope-puntas-calnegre, carrascoy-y-el-valle, monte-arabi, sierra-de-el-carche, sierra-de-las-moreras, sierra-de-salinas, sierra-espuna, sierra-de-la-pila, sotos-y-bosques-de-ribera-de-canaverosa |
| *Anacyclus valentinus* | estatal | UICN España: CR (En peligro crítico) (2010) (5) | 5 | sierra-espuna |
| *Artemisia reptans* | estatal | UICN España: VU (Vulnerable) (2010) (4) | 4 | sierra-espuna |
| *Athamanta hispanica* | estatal | UICN España: VU (Vulnerable) (2010) (4) | 4 | sierra-espuna |
| *Caralluma europaea* | estatal | Lista Roja de la Flora Vascular Española 2008: EN (En Peligro), crite… (5) | 5 | cabezo-gordo, calblanque-monte-cenizas-pena-aguila, espacios-abiertos-e-islas-del-mar-menor |
| *Chroicocephalus ridibundus* | estatal | Directiva Aves 2009/147/CE (Red Natura 2000) (2) | 2 | cabo-cope-puntas-calnegre, calblanque-monte-cenizas-pena-aguila, sierra-de-las-moreras, cuatro-calas, espacios-abiertos-e-islas-del-mar-menor, humedal-del-ajauque-y-rambla-salada, salinas-arenales-san-pedro-pinatar |
| *Dianthus broteri* | estatal | UICN España: VU (Vulnerable) (2010) (4) | 4 | calblanque-monte-cenizas-pena-aguila, carrascoy-y-el-valle, sotos-y-bosques-de-ribera-de-canaverosa, sierra-espuna |
| *Egretta garzetta* | estatal | Directiva Aves 2009/147/CE (Red Natura 2000) (2) | 2 | cabezo-gordo, calblanque-monte-cenizas-pena-aguila, espacios-abiertos-e-islas-del-mar-menor, humedal-del-ajauque-y-rambla-salada, salinas-arenales-san-pedro-pinatar, sotos-y-bosques-de-ribera-de-canaverosa, cabo-cope-puntas-calnegre, sierra-de-las-moreras |
| *Enneapogon persicus* | estatal | Lista Roja de la Flora Vascular Española 2008: CR (En Peligro Crítico) (5) | 5 | cabo-cope-puntas-calnegre |
| *Falco tinnunculus* | estatal | Directiva Aves 2009/147/CE (Red Natura 2000) (2) | 2 | barrancos-de-gebas, calblanque-monte-cenizas-pena-aguila, carrascoy-y-el-valle, espacios-abiertos-e-islas-del-mar-menor, humedal-del-ajauque-y-rambla-salada, monte-arabi, salinas-arenales-san-pedro-pinatar, sierra-de-el-carche, sierra-de-la-pila, sierra-de-salinas, sotos-y-bosques-de-ribera-de-canaverosa, cabo-cope-puntas-calnegre, sierra-de-las-moreras, sierra-espuna |
| *Thalasseus sandvicensis* | estatal | Directiva Aves 2009/147/CE (Red Natura 2000) (2) | 2 | cabo-cope-puntas-calnegre, sierra-de-las-moreras, calblanque-monte-cenizas-pena-aguila, espacios-abiertos-e-islas-del-mar-menor, salinas-arenales-san-pedro-pinatar, cuatro-calas |
| *Tichodroma muraria* | estatal | Directiva Aves 2009/147/CE (Red Natura 2000) (2) | 2 | cabo-cope-puntas-calnegre, sierra-de-las-moreras, sierra-espuna, carrascoy-y-el-valle, sotos-y-bosques-de-ribera-de-canaverosa |

## D · El texto no es un estado legal

_Ninguno._

## E · Sin taxón en EIDOS: no hay con qué cotejar

_Ninguno._

