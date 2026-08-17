# Salinas y Arenales de San Pedro del Pinatar — candidatos a punto de interés (N3)

> Generado por `Tools/build-park-pois.js` el 2026-08-17. **Documento de trabajo, no una
> alta.** Nada de lo que hay aquí entra en `park.json` sin pasar por el paso 2 del §4.5 de
> `Docs/prompts/e-rollout-nacional.md`: tabla de candidatos, visto bueno, y descripción
> redactada con la fuente del hecho delante.

| | |
|---|---|
| Espacio | Salinas y Arenales de San Pedro del Pinatar (`salinas-arenales-san-pedro-pinatar`) |
| Fuente consultada | OpenStreetMap vía Overpass (2026-08-17) |
| Candidatos dentro del límite | 14 |
| Fuera del polígono (descartados) | 43 |
| Descartados por regla | 6 |

## Candidatos

Coordenada en el orden de `park.json` (`[lat, lon]`). El tipo es una **sugerencia** a partir
de la etiqueta de OSM: los ocho del vocabulario cerrado del §4.1, y quien redacta decide.

| Nombre | `id` propuesto | Tipo sug. | Coordenada | Origen | A revisar |
|---|---|---|---|---|---|
| parque regional Salinas de san pedro | `parque-regional-salinas-de-san-pedro` | Acceso | 37.823691, -0.760070 | OSM node/12458799483 | — |
| Salinas de San Pedro | `salinas-de-san-pedro` | Acceso | 37.811327, -0.769785 | OSM node/13294227359 | a 23 m de una traza de trails.geojson: si lo que se quiere contar es el recorrido, ya está en la capa de senderos (§4.1) |
| Sendero de las Encañizadas | `sendero-de-las-encanizadas` | Acceso | 37.819883, -0.776046 | OSM node/960205597 | a 22 m de una traza de trails.geojson: si lo que se quiere contar es el recorrido, ya está en la capa de senderos (§4.1) · también mapeado como: Baños de Lodo (information), Punto de informacion Turismo (information) |
| Playa de La Barraca Quemada | `playa-de-la-barraca-quemada` | Natural | 37.805068, -0.754558 | OSM way/545834239 | — |
| Playa de La Llana | `playa-de-la-llana` | Natural | 37.798489, -0.752712 | OSM way/545834240 | a 39 m de una traza de trails.geojson: si lo que se quiere contar es el recorrido, ya está en la capa de senderos (§4.1) |
| Playa de la Torre Derribada | `playa-de-la-torre-derribada` | Natural | 37.823750, -0.757787 | OSM node/1459233700 | — |
| Playa de Punta de Algas | `playa-de-punta-de-algas` | Natural | 37.793529, -0.750516 | OSM way/545833292 | — |
| Playa de Torre Derribada | `playa-de-torre-derribada` | Natural | 37.833479, -0.760027 | OSM way/545841874 | — |
| Playa La Mota | `playa-la-mota` | Natural | 37.819127, -0.775707 | OSM way/428312258 | — |
| Playa La Playuela | `playa-la-playuela` | Natural | 37.813704, -0.757178 | OSM way/545834238 | — |
| Playa Punta de los Guzmanes | `playa-punta-de-los-guzmanes` | Natural | 37.778892, -0.756121 | OSM way/941536263 | — |
| Observatorio de Aves | `observatorio-de-aves` | Paisajístico | 37.837156, -0.765919 | OSM node/6679801718 | también mapeado como: Faro de San Pedro del Pinatar (lighthouse) |
| Molino de la Calcetera | `molino-de-la-calcetera` | — | 37.799074, -0.761074 | OSM node/1397799596 | a 24 m de una traza de trails.geojson: si lo que se quiere contar es el recorrido, ya está en la capa de senderos (§4.1) · también mapeado como: Playas se La Llama (information), Salinas de San Pedro (information) |
| Molino de Quintín | `molino-de-quintin` | — | 37.820414, -0.775995 | OSM node/1397518740 | a 32 m de una traza de trails.geojson: si lo que se quiere contar es el recorrido, ya está en la capa de senderos (§4.1) |

**Lo que falta en cada fila y no lo puede poner un script**: el hecho comprobable y su
fuente, `approx` (y por qué), la foto con su licencia, y la descripción. Sin fuente del
hecho, el candidato no entra (§4.3.1).

## Descartados por regla

| Nombre | Etiqueta OSM | Regla que lo descarta |
|---|---|---|
| La Marina | `locality` | topónimo suelto (§4.1): solo entra si una fuente le pone un hecho detrás |
| La Llana | `locality` | topónimo suelto (§4.1): solo entra si una fuente le pone un hecho detrás |
| El Toyo | `locality` | topónimo suelto (§4.1): solo entra si una fuente le pone un hecho detrás |
| Las Charcas | `locality` | topónimo suelto (§4.1): solo entra si una fuente le pone un hecho detrás |
| Puerto de San Pedro | `locality` | topónimo suelto (§4.1): solo entra si una fuente le pone un hecho detrás |
| Punta de Algas | `locality` | topónimo suelto (§4.1): solo entra si una fuente le pone un hecho detrás |

## Fuera del polígono oficial

Caen en el bbox pero no en el límite (§4.3.3), con el margen de ~50 m ya aplicado.

| Nombre | Etiqueta OSM | Coordenada |
|---|---|---|
| Lo Gavilán | `locality` | 37.857217, -0.778881 |
| La Raya | `locality` | 37.849620, -0.790394 |
| La Capellanía | `locality` | 37.851664, -0.779741 |
| La Encañizada Nueva | `locality` | 37.774772, -0.761347 |
| La Encañizada Vieja | `locality` | 37.783020, -0.767162 |
| Las Palomas | `locality` | 37.841341, -0.775199 |
| La Chanca | `locality` | 37.767139, -0.752337 |
| Punta del Pudrimel | `cape` | 37.772351, -0.740402 |
| La Colonia | `locality` | 37.856788, -0.772827 |
| Los Guirres | `locality` | 37.847783, -0.775798 |
| Casa de las Palmeras | `locality` | 37.851080, -0.771937 |
| Urbanización Las Palmeras | `locality` | 37.850330, -0.770475 |
| Escultura Barco de Papel | `artwork` | 37.841842, -0.779828 |
| Molino Salinero | `windmill` | 37.776877, -0.743576 |
| Los Villenas | `locality` | 37.856846, -0.797045 |
| Huerta del Mojón | `locality` | 37.848189, -0.769515 |
| Casa de Los Guirres | `locality` | 37.848868, -0.775772 |
| Hoyo de la Cenia | `locality` | 37.846138, -0.776253 |
| Casa del Pesetas | `locality` | 37.848222, -0.778656 |
| Lo León | `locality` | 37.848833, -0.782497 |
| Aljibe de la Carrasca | `locality` | 37.861997, -0.782379 |
| La Raya | `locality` | 37.847468, -0.783741 |
| Museo del Mar | `museum` | 37.834294, -0.791478 |
| Bote | `artwork` | 37.845492, -0.786495 |
| Palacio barón de benifayó | `museum` | 37.837821, -0.792941 |
| Parroquia Santísima Trinidad | `place_of_worship` | 37.839124, -0.791698 |
| Playa El Castillico | `beach` | 37.812655, -0.792335 |
| Playa La Veneziola | `beach` | 37.772970, -0.751632 |
| Playa del Pudrimel (sur) | `beach` | 37.769282, -0.745766 |
| Nuestra Señora del Carmen | `place_of_worship` | 37.814982, -0.789106 |
| Playa del Mojón | `beach` | 37.844582, -0.762401 |
| Playa del Mojón | `beach` | 37.847612, -0.762486 |
| Playa del Pudrimel | `beach` | 37.772920, -0.742362 |
| Playa Chica | `beach` | 37.762546, -0.747868 |
| Playa de Colón | `beach` | 37.804057, -0.799839 |
| Playa La Puntica | `beach` | 37.814121, -0.787543 |
| Playa Las Charcas | `beach` | 37.819817, -0.779155 |
| Playa Villananitos | `beach` | 37.818972, -0.783358 |
| Playa del Pudrimel (norte) | `beach` | 37.776286, -0.742548 |
| Iglesia de San Pedro Apóstol | `place_of_worship` | 37.835073, -0.791550 |
| Playa de las Higuericas | `beach` | 37.853354, -0.762883 |
| Playa de las Villas | `beach` | 37.859618, -0.762614 |
| La Casa del Reloj | `manor` | 37.842690, -0.787018 |

## Fundidos por proximidad

A menos de 50 m de otro candidato: el mismo sitio con dos etiquetas (§4.3.7).

| Nombre | Etiqueta | Fundido con |
|---|---|---|
| Playas se La Llama | `information` | Molino de la Calcetera |
| Salinas de San Pedro | `information` | Molino de la Calcetera |
| Baños de Lodo | `information` | Sendero de las Encañizadas |
| Punto de informacion Turismo | `information` | Sendero de las Encañizadas |
| Faro de San Pedro del Pinatar | `lighthouse` | Observatorio de Aves |

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
