# Especies por hábitat + análisis de ruido (GBIF) — Sotos y bosques de ribera de Cañaverosa

Fuente: GBIF (ocurrencias georreferenciadas) · método: point-in-polygon local.

## 1. Resumen

- Ocurrencias en bbox: **2096** · usadas tras filtro: **2096**
- Dentro de algún hábitat: **1834** · fuera: **262**
- Especies distintas en hábitats: **208** → **Aves 102** / no-Aves **106**

## 2. Composición taxonómica (ocurrencias dentro de hábitats, por clase)

| Clase | Ocurrencias | % |
|---|---:|---:|
| Aves | 3200 | 94.2% |
| Magnoliopsida | 94 | 2.8% |
| Liliopsida | 43 | 1.3% |
| Insecta | 34 | 1.0% |
| Mammalia | 9 | 0.3% |
| Squamata | 6 | 0.2% |
| Pinopsida | 3 | 0.1% |
| Myxomycetes | 3 | 0.1% |
| Amphibia | 2 | 0.1% |
| Agaricomycetes | 2 | 0.1% |

## 3. Barrido de incertidumbre de coordenadas

Registros con incertidumbre declarada: **223/2096** (11%).
| Umbral | Pasan (desc. incluidas) | Pasan (solo con dato) |
|---|---:|---:|
| sin filtro | 2096 | 223 |
| ≤ 1000 m | 1974 | 101 |
| ≤ 500 m | 1970 | 97 |
| ≤ 250 m | 1964 | 91 |
| ≤ 100 m | 1953 | 80 |

## 4. Especies ubicuas (ruido espacial: presentes en muchos hábitats)

Especies en ≥ 4/6 hábitats: **77** (de ellas Aves: **75**).

| Especie | Clase | nº hábitats |
|---|---|---:|
| Phalacrocorax carbo | Aves | 6 |
| Luscinia megarhynchos | Aves | 6 |
| Ardea cinerea | Aves | 6 |
| Anas platyrhynchos | Aves | 6 |
| Gallinula chloropus | Aves | 6 |
| Phylloscopus bonelli | Aves | 6 |
| Egretta garzetta | Aves | 5 |
| Falco tinnunculus | Aves | 4 |
| Sciurus vulgaris | Mammalia | 4 |
| Sylvia atricapilla | Aves | 4 |
| Phoenicurus ochruros | Aves | 4 |
| Turdus merula | Aves | 4 |
| Cyanistes caeruleus | Aves | 4 |
| Phylloscopus collybita | Aves | 4 |
| Lophophanes cristatus | Aves | 4 |

## 5. Por hábitat: total vs sin Aves (cuánto ruido se va)

| Hábitat | HIC | Especies | Aves | **No-Aves** | Top no-Aves |
|---|---|---:|---:|---:|---|
| Bosques galería de Salix alba y Populus alba <br><small>bosques-galeria-de-92A0</small> | 92A0 | 183 | 90 | **93** | Sciurus vulgaris (5); Nerium oleander (4); Platycnemis latipes (4); Rhamnus alaternus (3); Psammodromus algirus (3); Diachea leucopodia (3); Asparagus acutifolius (3); Pelophylax perezi (2); Cheirolophus intybaceus (2); Daphne gnidium (2) |
| Matorrales termomediterráneos y pre-estépicos <br><small>matorrales-termomediterraneos-y-5330</small> | 5330 | 101 | 86 | **15** | Iris xiphium (4); Genista umbellata (2); Allium ampeloprasum (2); Gladiolus illyricus (2); Sciurus vulgaris (1); Acanthus mollis (1); Biscutella valentina (1); Phlomis lychnitis (1); Sideritis bourgeana (1); Ulmus minor (1) |
| Matorrales arborescentes de Juniperus spp. <br><small>matorrales-arborescentes-de-5210</small> | 5210 | 96 | 82 | **14** | Iris xiphium (4); Genista umbellata (2); Allium ampeloprasum (2); Gladiolus illyricus (2); Sciurus vulgaris (1); Biscutella valentina (1); Phlomis lychnitis (1); Sideritis bourgeana (1); Ulmus minor (1); Allium pallens (1) |
| Galerías y matorrales ribereños termomediterráneos (Nerio-Tamaricetea) <br><small>galerias-y-matorrales-92D0</small> | 92D0 | 96 | 82 | **14** | Iris xiphium (4); Genista umbellata (2); Allium ampeloprasum (2); Gladiolus illyricus (2); Sciurus vulgaris (1); Biscutella valentina (1); Phlomis lychnitis (1); Sideritis bourgeana (1); Ulmus minor (1); Allium pallens (1) |
| Zonas subestépicas de gramíneas y anuales del Thero-Brachypodietea <br><small>zonas-subestepicas-de-6220</small> | 6220 | 12 | 11 | **1** | Acanthus mollis (1) |
| Vegetación gipsícola ibérica (Gypsophiletalia) <br><small>vegetacion-gipsicola-iberica-1520</small> | 1520 | 11 | 11 | **0** | — |

> Las Aves son el grueso del ruido espacial (registros en vuelo/marinos que caen en cualquier
> polígono). Quitándolas, los hábitats botánicos quedan con su flora coherente. Las Aves NO se
> tiran: van a un apartado propio (migratorias/ZEPA) contrastable con la lista oficial del espacio.