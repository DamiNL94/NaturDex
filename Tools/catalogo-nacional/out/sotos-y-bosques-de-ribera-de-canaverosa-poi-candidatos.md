# Sotos y bosques de ribera de Cañaverosa — candidatos a punto de interés (N3)

> Generado por `Tools/build-park-pois.js` el 2026-08-22. **Documento de trabajo, no una
> alta.** Nada de lo que hay aquí entra en `park.json` sin pasar por el paso 2 del §4.5 de
> `Docs/prompts/e-rollout-nacional.md`: tabla de candidatos, visto bueno, y descripción
> redactada con la fuente del hecho delante.

| | |
|---|---|
| Espacio | Sotos y bosques de ribera de Cañaverosa (`sotos-y-bosques-de-ribera-de-canaverosa`) |
| Fuente consultada | OpenStreetMap vía Overpass (2026-08-22) |
| Candidatos dentro del límite | 1 |
| Fuera del polígono (descartados) | 26 |
| Descartados por regla | 2 |

## Candidatos

Coordenada en el orden de `park.json` (`[lat, lon]`). El tipo es una **sugerencia** a partir
de la etiqueta de OSM: los ocho del vocabulario cerrado del §4.1, y quien redacta decide.

| Nombre | `id` propuesto | Tipo sug. | Coordenada | Origen | A revisar |
|---|---|---|---|---|---|
| Santuario Nuestra Sª de la Esperanza | `santuario-nuestra-s-de-la-esperanza` | Religioso | 38.260355, -1.709433 | OSM node/1682134193 | a 19 m de una traza de trails.geojson: si lo que se quiere contar es el recorrido, ya está en la capa de senderos (§4.1) |

**Lo que falta en cada fila y no lo puede poner un script**: el hecho comprobable y su
fuente, `approx` (y por qué), la foto con su licencia, y la descripción. Sin fuente del
hecho, el candidato no entra (§4.3.1).

## Descartados por regla

| Nombre | Etiqueta OSM | Regla que lo descarta |
|---|---|---|
| Las Hoyicas | `locality` | topónimo suelto (§4.1): solo entra si una fuente le pone un hecho detrás |
| La Repunta | `locality` | topónimo suelto (§4.1): solo entra si una fuente le pone un hecho detrás |

## Fuera del polígono oficial

Caen en el bbox pero no en el límite (§4.3.3), con el margen de ~50 m ya aplicado.

| Nombre | Etiqueta OSM | Coordenada |
|---|---|---|
| Loma de las Torrentas | `locality` | 38.252558, -1.725439 |
| Fontanares | `locality` | 38.238466, -1.732358 |
| Llanos de la Estación | `locality` | 38.260228, -1.696010 |
| El Chorreador | `locality` | 38.238368, -1.693830 |
| La Huertecica | `locality` | 38.261797, -1.726386 |
| Las Escarihuelas | `locality` | 38.257753, -1.715850 |
| Lomas de la Virgen | `locality` | 38.254338, -1.716756 |
| Los Jardinicos | `locality` | 38.305105, -1.738552 |
| Finifuche | `locality` | 38.242903, -1.713586 |
| Talas Blancas | `locality` | 38.313342, -1.740227 |
| Cerro de Rotas | `locality` | 38.269383, -1.717931 |
| Hoya de la Tercia | `locality` | 38.295786, -1.708753 |
| Casica de los Cazadores | `locality` | 38.307373, -1.705207 |
| La Alquería | `locality` | 38.242380, -1.693975 |
| Las Torrentas | `locality` | 38.256421, -1.730948 |
| La Serratilla | `locality` | 38.272224, -1.709136 |
| Rotas de Abajo | `locality` | 38.250583, -1.699817 |
| Rotas de Arriba | `locality` | 38.256231, -1.702013 |
| Carreño | `locality` | 38.285214, -1.696432 |
| Casa del Moro | `locality` | 38.297234, -1.699464 |
| Cañada del Casón | `locality` | 38.293045, -1.729155 |
| La Dehesa | `locality` | 38.292564, -1.692012 |
| Hoyas de Riópar | `locality` | 38.298517, -1.726830 |
| Mirador Las Lomas | `viewpoint` | 38.256651, -1.705144 |
| Puente del Río Segura | `hamlet` | 38.242551, -1.703543 |
| Yacimiento Arqueológico Villa Vieja | `archaeological_site` | 38.245798, -1.694823 |

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
