# Monte Arabí — candidatos a punto de interés (N3)

> Generado por `Tools/build-park-pois.js` el 2026-08-15. **Documento de trabajo, no una
> alta.** Nada de lo que hay aquí entra en `park.json` sin pasar por el paso 2 del §4.5 de
> `Docs/prompts/e-rollout-nacional.md`: tabla de candidatos, visto bueno, y descripción
> redactada con la fuente del hecho delante.

| | |
|---|---|
| Espacio | Monte Arabí (`monte-arabi`) |
| Fuente consultada | OpenStreetMap vía Overpass (2026-08-15) |
| Candidatos dentro del límite | 8 |
| Fuera del polígono (descartados) | 23 |
| Descartados por regla | 3 |

## Candidatos

Coordenada en el orden de `park.json` (`[lat, lon]`). El tipo es una **sugerencia** a partir
de la etiqueta de OSM: los ocho del vocabulario cerrado del §4.1, y quien redacta decide.

| Nombre | `id` propuesto | Tipo sug. | Coordenada | Origen | A revisar |
|---|---|---|---|---|---|
| Pocico de la Buitrera | `pocico-de-la-buitrera` | Acceso | 38.707259, -1.281978 | OSM node/1241882295 | también mapeado como: Pocico de la Buitrera (spring) |
| Abrigo de Mediodia | `abrigo-de-mediodia` | Arqueológico | 38.694606, -1.279046 | OSM node/2715239117 | — |
| Arabilejo | `arabilejo` | Arqueológico | 38.691747, -1.285696 | OSM node/2715239118 | — |
| Cantos de la Visera | `cantos-de-la-visera` | Arqueológico | 38.699472, -1.278736 | OSM node/2715239120 | — |
| Petroglifos | `petroglifos` | Arqueológico | 38.690715, -1.283891 | OSM node/2715239122 | — |
| Cueva del Tesoro | `cueva-del-tesoro` | Geológico | 38.689853, -1.291299 | OSM node/4892592323 | §4.3.6 — una cavidad con registro arqueológico y sin vigilancia no se señala en una guía de campo (precedente: Cueva C.6 de Cabo Cope). Comprobar protección antes de admitirlo |
| Cueva Horadada | `cueva-horadada` | Geológico | 38.700857, -1.279581 | OSM node/2715239121 | §4.3.6 — una cavidad con registro arqueológico y sin vigilancia no se señala en una guía de campo (precedente: Cueva C.6 de Cabo Cope). Comprobar protección antes de admitirlo |
| Arabi | `arabi` | Paisajístico | 38.697261, -1.282765 | OSM node/948505727 | — |

**Lo que falta en cada fila y no lo puede poner un script**: el hecho comprobable y su
fuente, `approx` (y por qué), la foto con su licencia, y la descripción. Sin fuente del
hecho, el candidato no entra (§4.3.1).

## Descartados por regla

| Nombre | Etiqueta OSM | Regla que lo descarta |
|---|---|---|
| Loma de los Ibáñez | `locality` | topónimo suelto (§4.1): solo entra si una fuente le pone un hecho detrás |
| Puntal del Armario | `locality` | topónimo suelto (§4.1): solo entra si una fuente le pone un hecho detrás |
| Puerta de la Iglesia | `locality` | topónimo suelto (§4.1): solo entra si una fuente le pone un hecho detrás |

## Fuera del polígono oficial

Caen en el bbox pero no en el límite (§4.3.3), con el margen de ~50 m ya aplicado.

| Nombre | Etiqueta OSM | Coordenada |
|---|---|---|
| Las Lomas | `locality` | 38.701705, -1.330415 |
| Ramblas del Arabí | `locality` | 38.709222, -1.297453 |
| El Atochar | `locality` | 38.722639, -1.273451 |
| Los Coloradizos | `locality` | 38.727346, -1.325056 |
| La Tejera | `locality` | 38.727718, -1.295944 |
| Los Cañalizos | `locality` | 38.702953, -1.319370 |
| El Cortijo | `locality` | 38.724876, -1.274858 |
| La Muleta | `locality` | 38.720777, -1.319424 |
| Los Calderones | `locality` | 38.687760, -1.329406 |
| Las Hoyicas | `locality` | 38.692829, -1.320095 |
| Herrada de Jaime | `locality` | 38.711311, -1.314735 |
| Loma de la Calera | `locality` | 38.675595, -1.292560 |
| Pedregoso Gordo | `locality` | 38.708911, -1.268273 |
| Pedregosillo Pequeño | `locality` | 38.704755, -1.264532 |
| Los Pajonares | `locality` | 38.682662, -1.264009 |
| Cuerda del Morteruelo | `locality` | 38.686586, -1.322271 |
| Loma del Cantarero | `locality` | 38.669426, -1.311431 |
| El Romeral | `locality` | 38.697369, -1.271368 |
| El Pozuelo | `locality` | 38.675382, -1.263426 |
| El Malecón | `locality` | 38.713698, -1.275737 |
| Hoya Muñoz | `locality` | 38.678241, -1.318488 |
| Morra de Charrate | `locality` | 38.694059, -1.313093 |
| Las Hoyicas | `peak` | 38.693398, -1.320032 |

## Fundidos por proximidad

A menos de 50 m de otro candidato: el mismo sitio con dos etiquetas (§4.3.7).

| Nombre | Etiqueta | Fundido con |
|---|---|---|
| Pocico de la Buitrera | `spring` | Pocico de la Buitrera |

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
