# Cotejo del estado legal de las fichas contra EIDOS

Generado por `npm run especies:legal -- --online`. **Informe, no arreglo**: lo que aquí sale
hay que llevarlo al BOE y al BORM taxón a taxón, porque la contradicción va en las dos
direcciones y EIDOS no es árbitro de sí mismo (deuda nº 43, y la lección de la nº 4).

> ⚠️ **Esta copia se ha generado SIN `--online`.** Las clases A, B, C y E salen como «sin
> datos», que no es lo mismo que «ninguno»: a EIDOS no se le ha preguntado. Vuelve a pasar
> `npm run especies:legal -- --online` para completarlas.

Cotejados **1113 taxones** de **3311 fichas** en 16 espacio(s).

| Clase | Qué es | Casos |
|---|---|---|
| A | La ficha AFIRMA una figura que EIDOS no sostiene | _sin datos_ |
| B | La ficha no recoge una figura que EIDOS sí trae | _sin datos_ |
| C | Las dos ven figura, con gravedad distinta | _sin datos_ |
| G | El mismo taxón se contradice entre espacios de la MISMA comunidad | 2 |
| D | El texto no es un estado legal | 16 |
| F | La afirmación no es contrastable con `v_estadolegal` | 13 |
| E | Sin taxón en EIDOS: no hay con qué cotejar | _sin datos_ |

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

_Sin datos: esta copia se generó sin `--online`._

## B · La ficha no recoge una figura que EIDOS sí trae

_Sin datos: esta copia se generó sin `--online`._

## C · Las dos ven figura, con gravedad distinta

_Sin datos: esta copia se generó sin `--online`._

## G · El mismo taxón se contradice entre espacios de la MISMA comunidad

No hace falta EIDOS para verlo: un catálogo autonómico protege a la especie en TODA la
comunidad, así que dos espacios de la misma comunidad no pueden darle tramos distintos al
mismo taxón. **No se resuelve por mayoría** — en la chova piquirroja el texto correcto es el
del espacio que va solo—, pero uno de los dos lados está mal escrito siempre.

| Taxón | Comunidad | Variantes (tramo · espacios) |
|---|---|---|
| *Juniperus phoenicea* | Región de Murcia | **3** · Especies de interés especial (Decreto n.º 50/2003, de 30 de mayo por el que se … — cabo-cope-puntas-calnegre, calblanque-monte-cenizas-pena-aguila, carrascoy-y-el-valle, espacios-abiertos-e-islas-del-mar-menor, salinas-arenales-san-pedro-pinatar, sierra-de-el-carche, sierra-de-la-pila, sierra-de-salinas, sotos-y-bosques-de-ribera-de-canaverosa<br>**1** · No incluida en el Catálogo Regional de Flora Silvestre Protegida; población de … — sierra-espuna |
| *Rhamnus lycioides* | Región de Murcia | **3** · Especies de interés especial (Decreto n.º 50/2003, de 30 de mayo por el que se … — sierra-de-salinas<br>**1** · No incluida en el Catálogo Regional de especies protegidas (Región de Murcia) — barrancos-de-gebas, carrascoy-y-el-valle, sierra-de-el-carche, sierra-de-la-pila<br>**1** · No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de M… — cabo-cope-puntas-calnegre, monte-arabi, sierra-de-las-moreras |

## F · La afirmación no es contrastable con `v_estadolegal`

Ni acusación ni respaldo. Lo que interesa aquí es de qué cuelga cada una: son fichas cuyo
tramo —y por tanto su nivel 2 en `mide-niveles-puerta.js`— descansa entero sobre una
evaluación de conservación o sobre un instrumento supranacional, no sobre el LESRPE ni
sobre un catálogo autonómico. Es legítimo y está documentado (`lib/rareza.js` cuenta las
evaluaciones a propósito desde el 2026-08-11), pero conviene saber cuántas son.

| Taxón | Ámbito | Lo que afirma | Tramo | Espacios |
|---|---|---|---|---|
| *Accipiter gentilis* | estatal | Directiva Aves 2009/147/CE (Red Natura 2000) (2) | 2 | cabo-cope-puntas-calnegre, carrascoy-y-el-valle, monte-arabi, sierra-de-el-carche, sierra-de-las-moreras, sierra-de-salinas, sierra-de-la-pila, sotos-y-bosques-de-ribera-de-canaverosa, sierra-espuna |
| *Anacyclus valentinus* | estatal | UICN España: CR (En peligro crítico) (2010) (5) | 5 | sierra-espuna |
| *Artemisia reptans* | estatal | UICN España: VU (Vulnerable) (2010) (4) | 4 | sierra-espuna |
| *Athamanta hispanica* | estatal | UICN España: VU (Vulnerable) (2010) (4) | 4 | sierra-espuna |
| *Bucanetes githagineus* | estatal | Catalogado como Vulnerable en el Libro Rojo de las Aves de España (po… (4) | 4 | cabo-cope-puntas-calnegre, sierra-de-las-moreras |
| *Caralluma europaea* | estatal | Lista Roja de la Flora Vascular Española 2008: EN (En Peligro), crite… (5) | 5 | cabezo-gordo, calblanque-monte-cenizas-pena-aguila, espacios-abiertos-e-islas-del-mar-menor |
| *Chroicocephalus ridibundus* | estatal | Directiva Aves 2009/147/CE (Red Natura 2000) (2) | 2 | cabo-cope-puntas-calnegre, calblanque-monte-cenizas-pena-aguila, sierra-de-las-moreras, cuatro-calas, espacios-abiertos-e-islas-del-mar-menor, humedal-del-ajauque-y-rambla-salada, salinas-arenales-san-pedro-pinatar |
| *Dianthus broteri* | estatal | UICN España: VU (Vulnerable) (2010) (4) | 4 | calblanque-monte-cenizas-pena-aguila, carrascoy-y-el-valle, sotos-y-bosques-de-ribera-de-canaverosa, sierra-espuna |
| *Egretta garzetta* | estatal | Directiva Aves 2009/147/CE (Red Natura 2000) (2) | 2 | cabezo-gordo, calblanque-monte-cenizas-pena-aguila, espacios-abiertos-e-islas-del-mar-menor, humedal-del-ajauque-y-rambla-salada, salinas-arenales-san-pedro-pinatar, sotos-y-bosques-de-ribera-de-canaverosa, cabo-cope-puntas-calnegre, sierra-de-las-moreras |
| *Enneapogon persicus* | estatal | Lista Roja de la Flora Vascular Española 2008: CR (En Peligro Crítico) (5) | 5 | cabo-cope-puntas-calnegre |
| *Falco tinnunculus* | estatal | Directiva Aves 2009/147/CE (Red Natura 2000) (2) | 2 | barrancos-de-gebas, calblanque-monte-cenizas-pena-aguila, carrascoy-y-el-valle, espacios-abiertos-e-islas-del-mar-menor, humedal-del-ajauque-y-rambla-salada, monte-arabi, salinas-arenales-san-pedro-pinatar, sierra-de-el-carche, sierra-de-la-pila, sierra-de-salinas, sotos-y-bosques-de-ribera-de-canaverosa, cabo-cope-puntas-calnegre, sierra-de-las-moreras, sierra-espuna |
| *Thalasseus sandvicensis* | estatal | Directiva Aves 2009/147/CE (Red Natura 2000) (2) | 2 | cabo-cope-puntas-calnegre, sierra-de-las-moreras, calblanque-monte-cenizas-pena-aguila, espacios-abiertos-e-islas-del-mar-menor, salinas-arenales-san-pedro-pinatar, cuatro-calas |
| *Tichodroma muraria* | estatal | Directiva Aves 2009/147/CE (Red Natura 2000) (2) | 2 | cabo-cope-puntas-calnegre, sierra-de-las-moreras, carrascoy-y-el-valle, sotos-y-bosques-de-ribera-de-canaverosa, sierra-espuna |

## D · El texto no es un estado legal

No hay contradicción que resolver: hasta que la frase se reescriba como estado legal, ni
`rareza-legal.js` ni `mide-niveles-puerta.js` pueden leerla, y la ficha se queda **sin
tramo** — que es lo correcto, pero es un hueco.

| Taxón | Ámbito | Texto de la ficha | Espacios |
|---|---|---|---|
| *Accipiter gentilis* | autonómico (Región de Murcia) | Ave de la ZEPA ES0000261 (Almenara, Moreras y Cabo Cope) | sierra-espuna |
| *Capra pyrenaica* | estatal | UICN España: EN (En peligro) (1992) | carrascoy-y-el-valle, monte-arabi, sierra-de-el-carche, sotos-y-bosques-de-ribera-de-canaverosa, sierra-espuna |
| *Caprimulgus ruficollis* | autonómico (Región de Murcia) | Ave de la ZEPA ES0000261 (Almenara, Moreras y Cabo Cope) | sierra-espuna |
| *Coturnix coturnix* | estatal | UICN España: DD (Datos insuficientes) (2004) | calblanque-monte-cenizas-pena-aguila, carrascoy-y-el-valle, espacios-abiertos-e-islas-del-mar-menor, sierra-de-salinas, sotos-y-bosques-de-ribera-de-canaverosa, sierra-espuna |
| *Falco tinnunculus* | autonómico (Región de Murcia) | Ave de la ZEPA ES0000261 (Almenara, Moreras y Cabo Cope) | sierra-espuna |
| *Helianthemum violaceum* | estatal | UICN España: EN (En peligro) (2010) | cabezo-gordo, carrascoy-y-el-valle, salinas-arenales-san-pedro-pinatar, sierra-de-el-carche, sierra-de-la-pila, sierra-espuna |
| *Hieraaetus pennatus* | autonómico (Región de Murcia) | Ave de la ZEPA ES0000261 (Almenara, Moreras y Cabo Cope) | sierra-espuna |
| *Jynx torquilla* | autonómico (Región de Murcia) | Ave de la ZEPA ES0000261 (Almenara, Moreras y Cabo Cope) | sierra-espuna |
| *Melanocorypha calandra* | autonómico (Región de Murcia) | Ave de la ZEPA ES0000261 (Almenara, Moreras y Cabo Cope) | sierra-espuna |
| *Merops apiaster* | autonómico (Región de Murcia) | Fauna protegida; estival que cría en taludes de rambla | sierra-espuna |
| *Muscicapa striata* | autonómico (Región de Murcia) | Ave de la ZEPA ES0000261 (Almenara, Moreras y Cabo Cope) | sierra-espuna |
| *Oenanthe hispanica* | autonómico (Región de Murcia) | Ave de la ZEPA ES0000261 (Almenara, Moreras y Cabo Cope) | sierra-espuna |
| *Poterium ancistroides* | estatal | UICN España: NT (Casi amenazado) (2010) | carrascoy-y-el-valle, espacios-abiertos-e-islas-del-mar-menor, sierra-de-el-carche, sierra-de-salinas, sierra-espuna |
| *Streptopelia turtur* | autonómico (Región de Murcia) | Ave de la ZEPA ES0000261 (Almenara, Moreras y Cabo Cope) | sierra-espuna |
| *Tichodroma muraria* | autonómico (Región de Murcia) | Ave de la ZEPA ES0000261 (Almenara, Moreras y Cabo Cope) | sierra-espuna |
| *Upupa epops* | autonómico (Región de Murcia) | Ave de la ZEPA ES0000261 (Almenara, Moreras y Cabo Cope) | sierra-espuna |

## E · Sin taxón en EIDOS: no hay con qué cotejar

_Sin datos: esta copia se generó sin `--online`._

