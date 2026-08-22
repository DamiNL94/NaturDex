# Barrancos de Gebas — candidatos a punto de interés (N3)

> Generado por `Tools/build-park-pois.js` el 2026-08-22. **Documento de trabajo, no una
> alta.** Nada de lo que hay aquí entra en `park.json` sin pasar por el paso 2 del §4.5 de
> `Docs/prompts/e-rollout-nacional.md`: tabla de candidatos, visto bueno, y descripción
> redactada con la fuente del hecho delante.

| | |
|---|---|
| Espacio | Barrancos de Gebas (`barrancos-de-gebas`) |
| Fuente consultada | OpenStreetMap vía Overpass (2026-08-22) |
| Candidatos dentro del límite | 5 |
| Fuera del polígono (descartados) | 78 |
| Descartados por regla | 5 |

## Candidatos

Coordenada en el orden de `park.json` (`[lat, lon]`). El tipo es una **sugerencia** a partir
de la etiqueta de OSM: los ocho del vocabulario cerrado del §4.1, y quien redacta decide.

| Nombre | `id` propuesto | Tipo sug. | Coordenada | Origen | A revisar |
|---|---|---|---|---|---|
| Yacimiento Arqueológico Cabezo de la Fuente del Murtal | `yacimiento-arqueologico-cabezo-de-la-fuente-del-murtal` | Arqueológico | 37.884373, -1.387426 | OSM way/97704918 | — |
| Cerro de la Atalaya | `cerro-de-la-atalaya` | Paisajístico | 37.884835, -1.416325 | OSM node/1304113694 | — |
| Mirador de los Barrancos de Gebas | `mirador-de-los-barrancos-de-gebas` | Paisajístico | 37.896790, -1.428111 | OSM node/9156604473 | a 22 m de una traza de trails.geojson: si lo que se quiere contar es el recorrido, ya está en la capa de senderos (§4.1) |
| Mirador del Embalse de Algeciras | `mirador-del-embalse-de-algeciras` | Paisajístico | 37.883216, -1.397629 | OSM node/8150226020 | — |
| Mirador del Embalsede Algeciras | `mirador-del-embalsede-algeciras` | Paisajístico | 37.894295, -1.385322 | OSM node/4732297124 | — |

**Lo que falta en cada fila y no lo puede poner un script**: el hecho comprobable y su
fuente, `approx` (y por qué), la foto con su licencia, y la descripción. Sin fuente del
hecho, el candidato no entra (§4.3.1).

## Descartados por regla

| Nombre | Etiqueta OSM | Regla que lo descarta |
|---|---|---|
| Lo Ramón | `locality` | topónimo suelto (§4.1): solo entra si una fuente le pone un hecho detrás |
| Cabezo Redondo | `locality` | topónimo suelto (§4.1): solo entra si una fuente le pone un hecho detrás |
| El Castellar | `locality` | topónimo suelto (§4.1): solo entra si una fuente le pone un hecho detrás |
| Barranco de los Infiernos | `locality` | topónimo suelto (§4.1): solo entra si una fuente le pone un hecho detrás |
| Estrecho del Sapo | `locality` | topónimo suelto (§4.1): solo entra si una fuente le pone un hecho detrás |

## Fuera del polígono oficial

Caen en el bbox pero no en el límite (§4.3.3), con el margen de ~50 m ya aplicado.

| Nombre | Etiqueta OSM | Coordenada |
|---|---|---|
| El mirador | `viewpoint` | 37.886576, -1.352096 |
| El Monumento | `monument` | 37.884884, -1.353777 |
| La Muela | `peak` | 37.872517, -1.410185 |
| El Aguaduchal | `locality` | 37.893481, -1.347590 |
| Loma de la Ladera de las Perdices | `locality` | 37.928408, -1.366875 |
| Cañada Alarcona | `locality` | 37.935496, -1.369176 |
| La Cabaña | `locality` | 37.898243, -1.347412 |
| La Perala | `locality` | 37.925365, -1.468940 |
| El Cocío | `locality` | 37.934714, -1.349918 |
| Montanares | `locality` | 37.869413, -1.346079 |
| Pedregalejo | `locality` | 37.877664, -1.360584 |
| Casa Nueva | `locality` | 37.885394, -1.343094 |
| Loma del Caballo | `locality` | 37.907426, -1.415477 |
| Cañada de Inés | `locality` | 37.880943, -1.352131 |
| Buena Vista | `locality` | 37.889680, -1.372497 |
| Cañada Escondida | `locality` | 37.935421, -1.381979 |
| Cañada Nueva | `locality` | 37.929941, -1.363667 |
| El Pentezuelo | `locality` | 37.913001, -1.362575 |
| Los Morales | `locality` | 37.903620, -1.343982 |
| Las Cruces | `locality` | 37.870803, -1.453598 |
| Nariz de Perro | `locality` | 37.927969, -1.373552 |
| La Sarriona | `locality` | 37.891230, -1.348536 |
| La Montalbana | `locality` | 37.895380, -1.346282 |
| Loma del Yesar | `locality` | 37.918855, -1.396972 |
| Cañada del Ratón | `locality` | 37.930756, -1.374390 |
| Cañada de la Parra | `locality` | 37.936434, -1.362044 |
| El Pino | `locality` | 37.902429, -1.354154 |
| El Pinar | `locality` | 37.933018, -1.469054 |
| La Alberquilla | `hamlet` | 37.871348, -1.353997 |
| Fuente Borrego | `locality` | 37.866662, -1.412031 |
| Morota | `locality` | 37.864482, -1.351736 |
| Peñalosa | `locality` | 37.886803, -1.345837 |
| La Balsa del Duque | `locality` | 37.900556, -1.350989 |
| Las Oliveras | `locality` | 37.923960, -1.365188 |
| Cañada del Charco | `locality` | 37.940041, -1.361554 |
| El acueducto | `ruins` | 37.880694, -1.364146 |
| Librilla | `village` | 37.885570, -1.354872 |
| Carmona | `hamlet` | 37.872488, -1.454960 |
| El Alamillo | `hamlet` | 37.896698, -1.352576 |
| Fuente Librilla | `hamlet` | 37.918560, -1.414277 |
| Gebas | `hamlet` | 37.894502, -1.449951 |
| Inchola | `hamlet` | 37.853979, -1.344341 |
| Perana | `hamlet` | 37.895097, -1.361328 |
| Retamosa | `hamlet` | 37.936589, -1.451331 |
| Sima del Vapor | `cave_entrance` | 37.856283, -1.421635 |
| Mirador de Alhama | `viewpoint` | 37.856764, -1.470033 |
| Viento y Luna (Homenaje a Antonio Fuertes) | `artwork` | 37.858125, -1.403893 |
| Corteza | `artwork` | 37.855389, -1.409194 |
| Hornacina Santo Ángel de la Guarda | `artwork` | 37.856381, -1.435862 |
| Monumento al Nazareno | `artwork` | 37.855773, -1.409215 |
| Los Ojos | `hamlet` | 37.915652, -1.427888 |
| Mirador de la Muela | `viewpoint` | 37.863520, -1.430285 |
| Cueva Luenga | `cave_entrance` | 37.881963, -1.471898 |
| Cabezo Salaoso | `peak` | 37.858745, -1.462135 |
| Cerro del Castillo | `peak` | 37.856614, -1.421860 |
| Plaza de la Cruz | `wayside_cross` | 37.889234, -1.353230 |
| La cañada | `locality` | 37.883802, -1.352677 |
| Castillo de Alhama | `castle` | 37.853846, -1.423987 |
| La Poza | `spring` | 37.897925, -1.455865 |
| El Retamar de Abajo | `hamlet` | 37.937890, -1.441317 |
| Camino del Bajo Guadalentín | `information` | 37.897385, -1.451011 |
| Senderos de Alhama | `information` | 37.897041, -1.451964 |
| Fuente del Saltador | `spring` | 37.895856, -1.453320 |
| Casas Altas | `hamlet` | 37.907435, -1.430304 |
| Fuente del Borrego | `spring` | 37.865794, -1.408708 |
| Red de Senderos de la Sierra de la Muela | `information` | 37.871575, -1.444311 |
| Iglesia de San Bartolomé | `place_of_worship` | 37.886310, -1.350600 |
| Castillo de Librilla | `ruins` | 37.886619, -1.351356 |
| Iglesia de Nuestra del Rosario | `place_of_worship` | 37.919216, -1.413545 |
| Yacimiento arqueológico El Salitre | `archaeological_site` | 37.888391, -1.351605 |
| Ermita de la Candelaria | `place_of_worship` | 37.860559, -1.419002 |
| Yacimiento Arqueológico Las Paleras | `archaeological_site` | 37.856354, -1.421838 |
| Cruz del Calvario | `wayside_cross` | 37.891014, -1.355175 |
| Plaza de la Cruz | `wayside_cross` | 37.889235, -1.353231 |
| Ermita de la Purísima | `place_of_worship` | 37.896957, -1.451659 |
| Molino Nuevo | `yes` | 37.854837, -1.454931 |
| Capilla de la Virgen del Rocío | `place_of_worship` | 37.896804, -1.459874 |
| Iglesia de Barqueros | `place_of_worship` | 37.941947, -1.367991 |

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
