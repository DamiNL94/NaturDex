# Sierra de Salinas — candidatos a punto de interés (N3)

> Generado por `Tools/build-park-pois.js` el 2026-08-15. **Documento de trabajo, no una
> alta.** Nada de lo que hay aquí entra en `park.json` sin pasar por el paso 2 del §4.5 de
> `Docs/prompts/e-rollout-nacional.md`: tabla de candidatos, visto bueno, y descripción
> redactada con la fuente del hecho delante.

| | |
|---|---|
| Espacio | Sierra de Salinas (`sierra-de-salinas`) |
| Fuente consultada | OpenStreetMap vía Overpass (2026-08-15) |
| Candidatos dentro del límite | 4 |
| Fuera del polígono (descartados) | 51 |
| Descartados por regla | 24 |

## Candidatos

Coordenada en el orden de `park.json` (`[lat, lon]`). El tipo es una **sugerencia** a partir
de la etiqueta de OSM: los ocho del vocabulario cerrado del §4.1, y quien redacta decide.

| Nombre | `id` propuesto | Tipo sug. | Coordenada | Origen | A revisar |
|---|---|---|---|---|---|
| Cueva Cálida | `cueva-calida` | Geológico | 38.493399, -1.024547 | OSM node/9035518896 | §4.3.6 — una cavidad con registro arqueológico y sin vigilancia no se señala en una guía de campo (precedente: Cueva C.6 de Cabo Cope). Comprobar protección antes de admitirlo |
| Cueva del Lagrimal | `cueva-del-lagrimal` | Geológico | 38.511083, -1.020558 | OSM node/3084827813 | §4.3.6 — una cavidad con registro arqueológico y sin vigilancia no se señala en una guía de campo (precedente: Cueva C.6 de Cabo Cope). Comprobar protección antes de admitirlo |
| Alto de la Capilla del Fraile | `alto-de-la-capilla-del-fraile` | Paisajístico | 38.496733, -1.013673 | OSM node/8982267849 | — |
| Mirador de Rabasa | `mirador-de-rabasa` | Paisajístico | 38.508014, -1.025331 | OSM node/3082349778 | — |

**Lo que falta en cada fila y no lo puede poner un script**: el hecho comprobable y su
fuente, `approx` (y por qué), la foto con su licencia, y la descripción. Sin fuente del
hecho, el candidato no entra (§4.3.1).

## Descartados por regla

| Nombre | Etiqueta OSM | Regla que lo descarta |
|---|---|---|
| Els Estrets | `locality` | topónimo suelto (§4.1): solo entra si una fuente le pone un hecho detrás |
| Los Machos | `locality` | topónimo suelto (§4.1): solo entra si una fuente le pone un hecho detrás |
| Las Colmenas | `locality` | topónimo suelto (§4.1): solo entra si una fuente le pone un hecho detrás |
| Barranco de las Peñas | `locality` | topónimo suelto (§4.1): solo entra si una fuente le pone un hecho detrás |
| Los Calderones | `locality` | topónimo suelto (§4.1): solo entra si una fuente le pone un hecho detrás |
| Herrada de la Sierra | `locality` | topónimo suelto (§4.1): solo entra si una fuente le pone un hecho detrás |
| La Sabina | `locality` | topónimo suelto (§4.1): solo entra si una fuente le pone un hecho detrás |
| La Besona | `locality` | topónimo suelto (§4.1): solo entra si una fuente le pone un hecho detrás |
| Siete Cotos | `locality` | topónimo suelto (§4.1): solo entra si una fuente le pone un hecho detrás |
| El Portichuelo | `locality` | topónimo suelto (§4.1): solo entra si una fuente le pone un hecho detrás |
| Los Estrechos | `locality` | topónimo suelto (§4.1): solo entra si una fuente le pone un hecho detrás |
| La Punta de la Mina | `locality` | topónimo suelto (§4.1): solo entra si una fuente le pone un hecho detrás |
| Puntal de la Cueva de la Sierra | `locality` | topónimo suelto (§4.1): solo entra si una fuente le pone un hecho detrás |
| El Ciervo | `locality` | topónimo suelto (§4.1): solo entra si una fuente le pone un hecho detrás |
| Peña Rubia | `locality` | topónimo suelto (§4.1): solo entra si una fuente le pone un hecho detrás |
| Barranco del Búho | `locality` | topónimo suelto (§4.1): solo entra si una fuente le pone un hecho detrás |
| Las Monjas | `locality` | topónimo suelto (§4.1): solo entra si una fuente le pone un hecho detrás |
| La Beata | `locality` | topónimo suelto (§4.1): solo entra si una fuente le pone un hecho detrás |
| Peña del Águila | `locality` | topónimo suelto (§4.1): solo entra si una fuente le pone un hecho detrás |
| La Cueva | `locality` | topónimo suelto (§4.1): solo entra si una fuente le pone un hecho detrás |
| Solana Mala | `locality` | topónimo suelto (§4.1): solo entra si una fuente le pone un hecho detrás |
| La Quemada | `locality` | topónimo suelto (§4.1): solo entra si una fuente le pone un hecho detrás |
| Pocico Bartolo | `locality` | topónimo suelto (§4.1): solo entra si una fuente le pone un hecho detrás |
| La Piedra del Molino | `locality` | topónimo suelto (§4.1): solo entra si una fuente le pone un hecho detrás |

## Fuera del polígono oficial

Caen en el bbox pero no en el límite (§4.3.3), con el margen de ~50 m ya aplicado.

| Nombre | Etiqueta OSM | Coordenada |
|---|---|---|
| el Paradon | `hamlet` | 38.443172, -1.054871 |
| Casa Ciprés | `locality` | 38.455267, -0.994924 |
| Monte de Don Cristóbal | `locality` | 38.540195, -1.008171 |
| El Toscá | `locality` | 38.435390, -1.035389 |
| Cañada Cubillas | `locality` | 38.516922, -0.998754 |
| Puntal de l'Aligue | `locality` | 38.459149, -1.052450 |
| Fuente del Lobo | `locality` | 38.522463, -1.024179 |
| Casa Oliveros | `locality` | 38.482487, -1.003215 |
| Venta Terrós | `locality` | 38.455637, -1.009227 |
| Mojón Blanco | `locality` | 38.544067, -1.012263 |
| Enfonsades | `locality` | 38.446393, -1.040785 |
| Loma de La Cruz | `locality` | 38.517961, -1.010022 |
| Cañada del Enebral | `locality` | 38.503868, -1.017451 |
| El Pla de Castilla | `locality` | 38.450444, -1.065484 |
| Casa Manchego | `locality` | 38.467067, -1.015297 |
| Peñón del Tio Bernardo | `locality` | 38.526675, -1.004242 |
| Cañada de Madroñas | `locality` | 38.511591, -1.015886 |
| Albatera | `locality` | 38.463413, -1.034227 |
| Canyada del Paredó | `locality` | 38.433478, -1.056921 |
| El Puerto | `locality` | 38.537606, -1.002701 |
| Carlos | `locality` | 38.434295, -1.001600 |
| la Centenera | `locality` | 38.439867, -1.014484 |
| Lomas del Reloj | `locality` | 38.521385, -1.000477 |
| Puerto Alto | `locality` | 38.547781, -1.000721 |
| Canyada las Vinyas | `locality` | 38.446248, -0.994957 |
| Los Cabecicos | `locality` | 38.454553, -1.047578 |
| Racó de Monsepóu | `locality` | 38.435983, -1.044950 |
| Canyada de Lauteria | `locality` | 38.456280, -1.034478 |
| Derramador | `locality` | 38.438330, -1.059311 |
| Casa Quito | `locality` | 38.472809, -1.017512 |
| Punta del Portichuelo | `locality` | 38.530888, -1.058593 |
| Cerro de los Rincones | `locality` | 38.478461, -1.083732 |
| Manzorrila | `locality` | 38.535492, -1.020427 |
| Las Quebradas | `locality` | 38.465853, -1.076969 |
| Los Ambrosios | `locality` | 38.455712, -1.081192 |
| Cerricos del Lobo | `locality` | 38.547558, -1.049940 |
| Carrascalejo | `locality` | 38.543295, -1.044514 |
| Rambla de Cobatillas | `locality` | 38.473183, -1.079410 |
| Umbría de la Teatina | `locality` | 38.531718, -1.073403 |
| Cerricos de Cano | `locality` | 38.546432, -1.069511 |
| Cerralejo | `locality` | 38.530983, -1.031425 |
| Hoya del Moñigal | `locality` | 38.507709, -1.076463 |
| Solana de la Hoya del Monigal | `locality` | 38.510683, -1.088586 |
| Raspay | `hamlet` | 38.443349, -1.090869 |
| Casa de los Ambrosios | `hamlet` | 38.453118, -1.085694 |
| Venta las Quebradas | `hamlet` | 38.467724, -1.070150 |
| Quitapellejos | `hamlet` | 38.466806, -1.089373 |
| Casas de la Alberca | `hamlet` | 38.540634, -1.042762 |
| Ricardo Yáñez Sánchez | `artwork` | 38.443382, -1.090771 |
| Lel | `hamlet` | 38.450528, -1.021820 |
| Fuente del Lobo | `ruins` | 38.520953, -1.017789 |

## Resto de la cascada (§4.2) — a mano

Este script solo cubre la fuente nº 4. Las demás no tienen servicio consultable por
programa y son las que aportan el HECHO, no la coordenada:

- [ ] **1 · PORN/PRUG del espacio** — ¿hay anexo que enumere valores geológicos, culturales o paisajísticos? Citar documento y apartado.
- [ ] **2 · IELIG (IGME)** — LIG cuyo punto o polígono caiga dentro del límite.
- [ ] **3 · BIC y patrimonio** — Ministerio de Cultura + catálogo de la comunidad.
- [ ] **5 · Organismo gestor / Wikipedia** — contexto para redactar.
- [ ] **6 · Wikimedia Commons / `Frontend/Img/poi/`** — la foto, con autor y licencia.

Recordar que **el hecho y el nombre bajan por la cascada y la coordenada sube**: si el PORN
nombra un paraje que la tabla de arriba sitúa, la coordenada es la de OSM y el POI va con
`approx: true` y el porqué escrito en `source`.

---

Datos de posición: © OpenStreetMap contributors, ODbL.
