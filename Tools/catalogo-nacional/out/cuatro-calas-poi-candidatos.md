# Cuatro Calas — candidatos a punto de interés (N3)

> Generado por `Tools/build-park-pois.js` el 2026-08-07. **Documento de trabajo, no una
> alta.** Nada de lo que hay aquí entra en `park.json` sin pasar por el paso 2 del §4.5 de
> `Docs/prompts/e-rollout-nacional.md`: tabla de candidatos, visto bueno, y descripción
> redactada con la fuente del hecho delante.

| | |
|---|---|
| Espacio | Cuatro Calas (`cuatro-calas`) |
| Fuente consultada | basemap Protomaps del repo (`Frontend/Data/parks/murcia/cuatro-calas/tiles/base.pmtiles`, ODbL) |
| Basemap | zoom máx. 15, recorte -1.6441,37.3739 → -1.6198,37.3911 |
| Candidatos dentro del límite | 4 |
| Fuera del polígono (descartados) | 9 |
| Descartados por regla | 5 |

## Candidatos

Coordenada en el orden de `park.json` (`[lat, lon]`). El tipo es una **sugerencia** a partir
de la etiqueta de OSM: los ocho del vocabulario cerrado del §4.1, y quien redacta decide.

| Nombre | `id` propuesto | Tipo sug. | Coordenada | Origen | A revisar |
|---|---|---|---|---|---|
| Cala Los Cocedores | `cala-los-cocedores` | Natural | 37.374900, -1.629254 | basemap pois | — |
| Playa de Calarreona | `playa-de-calarreona` | Natural | 37.383513, -1.621103 | basemap pois | — |
| Playa de la Carolina | `playa-de-la-carolina` | Natural | 37.376290, -1.628315 | basemap pois | — |
| Playa de la Higuerica | `playa-de-la-higuerica` | Natural | 37.379947, -1.626478 | basemap pois | a 29 m de una traza de trails.geojson: si lo que se quiere contar es el recorrido, ya está en la capa de senderos (§4.1) |

**Lo que falta en cada fila y no lo puede poner un script**: el hecho comprobable y su
fuente, `approx` (y por qué), la foto con su licencia, y la descripción. Sin fuente del
hecho, el candidato no entra (§4.3.1).

## Descartados por regla

| Nombre | Etiqueta OSM | Regla que lo descarta |
|---|---|---|
| Cabezo Alto | `locality` | topónimo suelto (§4.1): solo entra si una fuente le pone un hecho detrás |
| Los Cocedores | `locality` | topónimo suelto (§4.1): solo entra si una fuente le pone un hecho detrás |
| Cañada Brusca | `locality` | topónimo suelto (§4.1): solo entra si una fuente le pone un hecho detrás |
| Paisaje Protegido Cuatro Calas | `nature_reserve` | es el propio espacio protegido, no un punto dentro de él |
| Albergue Juvenil Calarreona | `hostel` | alojamiento |

## Fuera del polígono oficial

Caen en el bbox pero no en el límite (§4.3.3), con el margen de ~50 m ya aplicado.

| Nombre | Etiqueta OSM | Coordenada |
|---|---|---|
| Cañada Blanca | `locality` | 37.381654, -1.648700 |
| Los Gorriones | `locality` | 37.394426, -1.632146 |
| Camper Area Aníbal | `caravan_site` | 37.388726, -1.616677 |
| ANIBAL | `fuel` | 37.388834, -1.615875 |
| Autolavado | `car_wash` | 37.389150, -1.615476 |
| Calarreona | `locality` | 37.386595, -1.618606 |
| Cala de las Tortugas | `beach` | 37.384540, -1.615165 |
| Maxcaly Playa Restaurante | `restaurant` | 37.384841, -1.618563 |
| Islote Cama de Los Novios | `coastline` | 37.378304, -1.623233 |

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
