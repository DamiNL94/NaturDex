# Cabezo Gordo — candidatos a punto de interés (N3)

> Generado por `Tools/build-park-pois.js` el 2026-08-21. **Documento de trabajo, no una
> alta.** Nada de lo que hay aquí entra en `park.json` sin pasar por el paso 2 del §4.5 de
> `Docs/prompts/e-rollout-nacional.md`: tabla de candidatos, visto bueno, y descripción
> redactada con la fuente del hecho delante.

| | |
|---|---|
| Espacio | Cabezo Gordo (`cabezo-gordo`) |
| Fuente consultada | OpenStreetMap vía Overpass (2026-08-21) |
| Candidatos dentro del límite | 3 |
| Fuera del polígono (descartados) | 1 |
| Descartados por regla | 2 |

## Candidatos

Coordenada en el orden de `park.json` (`[lat, lon]`). El tipo es una **sugerencia** a partir
de la etiqueta de OSM: los ocho del vocabulario cerrado del §4.1, y quien redacta decide.

| Nombre | `id` propuesto | Tipo sug. | Coordenada | Origen | A revisar |
|---|---|---|---|---|---|
| Espada de Excalibur | `espada-de-excalibur` | Cultural | 37.802742, -0.909900 | OSM node/13699111101 | — |
| Sima de las Palomas | `sima-de-las-palomas` | Geológico | 37.798394, -0.896913 | OSM node/3897212249 | §4.3.6 — una cavidad con registro arqueológico y sin vigilancia no se señala en una guía de campo (precedente: Cueva C.6 de Cabo Cope). Comprobar protección antes de admitirlo · también mapeado como: Yacimiento paleoantropológico "Sima de las Palomas" (information) |
| Cabezo Gordo | `cabezo-gordo` | Paisajístico | 37.801600, -0.908073 | OSM node/3982456195 | — |

**Lo que falta en cada fila y no lo puede poner un script**: el hecho comprobable y su
fuente, `approx` (y por qué), la foto con su licencia, y la descripción. Sin fuente del
hecho, el candidato no entra (§4.3.1).

## Descartados por regla

| Nombre | Etiqueta OSM | Regla que lo descarta |
|---|---|---|
| Veta de Magnetica | `locality` | topónimo suelto (§4.1): solo entra si una fuente le pone un hecho detrás |
| Galeria | `locality` | topónimo suelto (§4.1): solo entra si una fuente le pone un hecho detrás |

## Fuera del polígono oficial

Caen en el bbox pero no en el límite (§4.3.3), con el margen de ~50 m ya aplicado.

| Nombre | Etiqueta OSM | Coordenada |
|---|---|---|
| Los Camachos | `locality` | 37.792912, -0.910358 |

## Fundidos por proximidad

A menos de 50 m de otro candidato: el mismo sitio con dos etiquetas (§4.3.7).

| Nombre | Etiqueta | Fundido con |
|---|---|---|
| Yacimiento paleoantropológico "Sima de las Palomas" | `information` | Sima de las Palomas |

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
