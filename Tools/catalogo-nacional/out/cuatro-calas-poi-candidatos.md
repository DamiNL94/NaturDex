# Cuatro Calas — candidatos a punto de interés (N3)

> Generado por `Tools/build-park-pois.js` el 2026-08-07. **Documento de trabajo, no una
> alta.** Nada de lo que hay aquí entra en `park.json` sin pasar por el paso 2 del §4.5 de
> `Docs/prompts/e-rollout-nacional.md`: tabla de candidatos, visto bueno, y descripción
> redactada con la fuente del hecho delante.

| | |
|---|---|
| Espacio | Cuatro Calas (`cuatro-calas`) |
| Fuente consultada | OpenStreetMap vía Overpass (2026-08-07) |
| Candidatos dentro del límite | 2 |
| Fuera del polígono (descartados) | 22 |
| Descartados por regla | 5 |

## Candidatos

Coordenada en el orden de `park.json` (`[lat, lon]`). El tipo es una **sugerencia** a partir
de la etiqueta de OSM: los ocho del vocabulario cerrado del §4.1, y quien redacta decide.

| Nombre | `id` propuesto | Tipo sug. | Coordenada | Origen | A revisar |
|---|---|---|---|---|---|
| Playa de la Carolina | `playa-de-la-carolina` | Natural | 37.376287, -1.628168 | OSM way/1459077415 | — |
| Playa de la Higuerica | `playa-de-la-higuerica` | Natural | 37.379908, -1.626160 | OSM way/1459077557 | — |

**Lo que falta en cada fila y no lo puede poner un script**: el hecho comprobable y su
fuente, `approx` (y por qué), la foto con su licencia, y la descripción. Sin fuente del
hecho, el candidato no entra (§4.3.1).

## Descartados por regla

| Nombre | Etiqueta OSM | Regla que lo descarta |
|---|---|---|
| Cabezo Alto | `locality` | topónimo suelto (§4.1): solo entra si una fuente le pone un hecho detrás |
| Los Cocedores | `locality` | topónimo suelto (§4.1): solo entra si una fuente le pone un hecho detrás |
| Cañada Brusca | `locality` | topónimo suelto (§4.1): solo entra si una fuente le pone un hecho detrás |
| Playa de Calarreona | `beach` | duplicado de un POI ya dado de alta (playa-de-calarreona) — §4.3.7 |
| Cala Los Cocedores | `beach` | duplicado de un POI ya dado de alta (playa-de-los-cocedores) — §4.3.7 |

## Fuera del polígono oficial

Caen en el bbox pero no en el límite (§4.3.3), con el margen de ~50 m ya aplicado.

| Nombre | Etiqueta OSM | Coordenada |
|---|---|---|
| Castillo de San Juan de los Terreros | `castle` | 37.357222, -1.651901 |
| Despeñaperros | `locality` | 37.363937, -1.653557 |
| Cañada Blanca | `locality` | 37.381655, -1.648700 |
| Cerrón Cogón | `locality` | 37.372742, -1.656720 |
| La Moleta | `locality` | 37.376030, -1.644678 |
| Las Canales | `locality` | 37.400071, -1.650470 |
| Los Gorriones | `locality` | 37.394426, -1.632147 |
| Cabezo Negro | `locality` | 37.398714, -1.628883 |
| Cuadras de Moreno | `locality` | 37.400662, -1.618928 |
| Lo Blanco | `locality` | 37.405098, -1.643985 |
| Calarreona | `hamlet` | 37.386594, -1.618605 |
| El Cocón | `hamlet` | 37.401730, -1.663936 |
| San Juan de los Terreros | `village` | 37.360811, -1.663670 |
| Playa Casica Verde | `beach` | 37.395197, -1.602469 |
| Playa de la Herradura | `beach` | 37.387122, -1.611064 |
| Playa de Matalentisco | `beach` | 37.388721, -1.610837 |
| Cala Mijo | `beach` | 37.385882, -1.612637 |
| Cala de las Tortugas | `beach` | 37.384543, -1.615160 |
| Cala La Invencible | `beach` | 37.356356, -1.656635 |
| Playa de las Palmeras | `beach` | 37.374395, -1.638722 |
| Playa la Carolina | `beach` | 37.371164, -1.643716 |
| Playa Cañada del Negro | `beach` | 37.392628, -1.606325 |

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
