# Especies por hábitat + análisis de ruido (GBIF) — Barrancos de Gebas

Fuente: GBIF (ocurrencias georreferenciadas) · método: point-in-polygon local.

## 1. Resumen

- Ocurrencias en bbox: **4876** · usadas tras filtro: **4876**
- Dentro de algún hábitat: **3271** · fuera: **1605**
- Especies distintas en hábitats: **278** → **Aves 121** / no-Aves **157**

## 2. Composición taxonómica (ocurrencias dentro de hábitats, por clase)

| Clase | Ocurrencias | % |
|---|---:|---:|
| Aves | 5390 | 84.3% |
| Mammalia | 456 | 7.1% |
| Insecta | 242 | 3.8% |
| Magnoliopsida | 220 | 3.4% |
| Arachnida | 22 | 0.3% |
| Squamata | 22 | 0.3% |
| Liliopsida | 20 | 0.3% |
| Pinopsida | 6 | 0.1% |
| Amphibia | 6 | 0.1% |
| Bryopsida | 6 | 0.1% |

## 3. Barrido de incertidumbre de coordenadas

Registros con incertidumbre declarada: **423/4876** (9%).
| Umbral | Pasan (desc. incluidas) | Pasan (solo con dato) |
|---|---:|---:|
| sin filtro | 4876 | 423 |
| ≤ 1000 m | 4641 | 188 |
| ≤ 500 m | 4627 | 174 |
| ≤ 250 m | 4625 | 172 |
| ≤ 100 m | 4620 | 167 |

## 4. Especies ubicuas (ruido espacial: presentes en muchos hábitats)

Especies en ≥ 2/3 hábitats: **278** (de ellas Aves: **121**).

| Especie | Clase | nº hábitats |
|---|---|---:|
| Zoropsis spinimana | Arachnida | 2 |
| Timon nevadensis | Squamata | 2 |
| Helichrysum stoechas | Magnoliopsida | 2 |
| Brachypodium retusum | Liliopsida | 2 |
| Dipcadi serotinum | Liliopsida | 2 |
| Moricandia arvensis | Magnoliopsida | 2 |
| Nerium oleander | Magnoliopsida | 2 |
| Muscari neglectum | Liliopsida | 2 |
| Lysimachia loeflingii | Magnoliopsida | 2 |
| Euchloe crameri | Insecta | 2 |
| Galerida theklae | Aves | 2 |
| Euphorbia serrata | Magnoliopsida | 2 |
| Thymelaea hirsuta | Magnoliopsida | 2 |
| Phragmites australis | Liliopsida | 2 |
| Helianthemum salicifolium | Magnoliopsida | 2 |

## 5. Por hábitat: total vs sin Aves (cuánto ruido se va)

| Hábitat | HIC | Especies | Aves | **No-Aves** | Top no-Aves |
|---|---|---:|---:|---:|---|
| Matorrales termomediterráneos y pre-estépicos <br><small>matorrales-termomediterraneos-y-5330</small> | 5330 | 278 | 121 | **157** | Sus scrofa (100); Vulpes vulpes (72); Ammotragus lervia (56); Cistanche phelypaea (13); Thymelaea hirsuta (8); Soda oppositifolia (8); Lasiommata megera (8); Zygaena fausta (7); Moricandia arvensis (6); Pontia daplidice (6) |
| Zonas subestépicas de gramíneas y anuales del Thero-Brachypodietea <br><small>zonas-subestepicas-de-6220</small> | 6220 | 278 | 121 | **157** | Sus scrofa (100); Vulpes vulpes (72); Ammotragus lervia (56); Cistanche phelypaea (13); Thymelaea hirsuta (8); Soda oppositifolia (8); Lasiommata megera (8); Zygaena fausta (7); Moricandia arvensis (6); Pontia daplidice (6) |
| Galerías y matorrales ribereños termomediterráneos (Nerio-Tamaricetea) <br><small>galerias-y-matorrales-92D0</small> | 92D0 | 0 | 0 | **0** | — |

> Las Aves son el grueso del ruido espacial (registros en vuelo/marinos que caen en cualquier
> polígono). Quitándolas, los hábitats botánicos quedan con su flora coherente. Las Aves NO se
> tiran: van a un apartado propio (migratorias/ZEPA) contrastable con la lista oficial del espacio.