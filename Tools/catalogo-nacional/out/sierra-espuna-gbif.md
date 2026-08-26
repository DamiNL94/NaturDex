# Especies por hábitat + análisis de ruido (GBIF) — Sierra Espuña

Fuente: GBIF (ocurrencias georreferenciadas) · método: point-in-polygon local.

## 1. Resumen

- Ocurrencias en bbox: **25688** · usadas tras filtro: **25688**
- Dentro de algún hábitat: **21453** · fuera: **4235**
- Especies distintas en hábitats: **2118** → **Aves 140** / no-Aves **1978**

## 2. Composición taxonómica (ocurrencias dentro de hábitats, por clase)

| Clase | Ocurrencias | % |
|---|---:|---:|
| Aves | 43207 | 48.9% |
| Insecta | 22423 | 25.4% |
| Magnoliopsida | 14474 | 16.4% |
| Mammalia | 2089 | 2.4% |
| Liliopsida | 1958 | 2.2% |
| Pinopsida | 1645 | 1.9% |
| Agaricomycetes | 753 | 0.9% |
| Arachnida | 328 | 0.4% |
| Squamata | 324 | 0.4% |
| Myxomycetes | 259 | 0.3% |

## 3. Barrido de incertidumbre de coordenadas

Registros con incertidumbre declarada: **7383/25688** (29%).
| Umbral | Pasan (desc. incluidas) | Pasan (solo con dato) |
|---|---:|---:|
| sin filtro | 25688 | 7383 |
| ≤ 1000 m | 20896 | 2591 |
| ≤ 500 m | 20553 | 2248 |
| ≤ 250 m | 20438 | 2133 |
| ≤ 100 m | 20185 | 1880 |

## 4. Especies ubicuas (ruido espacial: presentes en muchos hábitats)

Especies en ≥ 8/13 hábitats: **462** (de ellas Aves: **94**).

| Especie | Clase | nº hábitats |
|---|---|---:|
| Lophophanes cristatus | Aves | 12 |
| Fringilla coelebs | Aves | 12 |
| Loxia curvirostra | Aves | 12 |
| Aegithalos caudatus | Aves | 12 |
| Parus major | Aves | 12 |
| Erithacus rubecula | Aves | 12 |
| Phylloscopus collybita | Aves | 12 |
| Turdus merula | Aves | 12 |
| Ammotragus lervia | Mammalia | 11 |
| Pyrrhocorax pyrrhocorax | Aves | 11 |
| Garrulus glandarius | Aves | 11 |
| Serinus serinus | Aves | 11 |
| Pistacia terebinthus | Magnoliopsida | 11 |
| Phoenicurus ochruros | Aves | 11 |
| Corvus corax | Aves | 11 |

## 5. Por hábitat: total vs sin Aves (cuánto ruido se va)

| Hábitat | HIC | Especies | Aves | **No-Aves** | Top no-Aves |
|---|---|---:|---:|---:|---|
| Zonas subestépicas de gramíneas y anuales del Thero-Brachypodietea <br><small>zonas-subestepicas-de-6220</small> | 6220 | 1938 | 138 | **1800** | Pinus halepensis (162); Sus scrofa (143); Ammotragus lervia (128); Cistus albidus (113); Colias croceus (111); Vulpes vulpes (103); Juniperus oxycedrus (96); Quercus coccifera (96); Salvia rosmarinus (91); Pontia daplidice (88) |
| Matorrales mediterráneos y oromediterráneos primarios y secundarios con dominio frecuente de genisteas <br><small>matorrales-mediterraneos-y-4090</small> | 4090 | 1818 | 135 | **1683** | Pinus halepensis (151); Sus scrofa (140); Ammotragus lervia (130); Colias croceus (114); Cistus albidus (107); Vulpes vulpes (102); Juniperus oxycedrus (96); Quercus coccifera (94); Lycaena phlaeas (88); Pontia daplidice (87) |
| Encinares de Quercus ilex y Quercus rotundifolia <br><small>encinares-de-quercus-9340</small> | 9340 | 1605 | 129 | **1476** | Sus scrofa (139); Pinus halepensis (136); Ammotragus lervia (106); Vulpes vulpes (97); Cistus albidus (92); Quercus coccifera (79); Pistacia lentiscus (78); Salvia rosmarinus (73); Juniperus oxycedrus (72); Leptidea sinapis (61) |
| Matorrales termomediterráneos y pre-estépicos <br><small>matorrales-termomediterraneos-y-5330</small> | 5330 | 1573 | 131 | **1442** | Pinus halepensis (146); Sus scrofa (105); Ammotragus lervia (96); Cistus albidus (94); Salvia rosmarinus (83); Pistacia lentiscus (69); Juniperus oxycedrus (69); Quercus coccifera (63); Leptidea sinapis (55); Vulpes vulpes (53) |
| Matorrales arborescentes de Juniperus spp. <br><small>matorrales-arborescentes-de-5210</small> | 5210 | 1315 | 117 | **1198** | Pinus halepensis (120); Cistus albidus (102); Quercus coccifera (75); Juniperus oxycedrus (70); Ammotragus lervia (70); Salvia rosmarinus (67); Pistacia lentiscus (65); Sus scrofa (58); Leptidea sinapis (48); Colias croceus (45) |
| Bosques endémicos de Juniperus spp. <br><small>bosques-endemicos-de-9560</small> | 9560 | 1036 | 105 | **931** | Colias croceus (57); Lasiommata megera (53); Pontia daplidice (52); Lycaena phlaeas (50); Pinus halepensis (46); Aricia cramera (45); Ammotragus lervia (42); Pieris rapae (39); Lysandra bellargus (37); Sus scrofa (37) |
| Pendientes rocosas calcícolas con vegetación casmofítica <br><small>pendientes-rocosas-calcicolas-8210</small> | 8210 | 837 | 107 | **730** | Colias croceus (54); Ammotragus lervia (49); Sus scrofa (46); Pontia daplidice (45); Aricia cramera (44); Lycaena phlaeas (43); Lasiommata megera (42); Lysandra bellargus (33); Polyommatus celina (32); Damora pandora (31) |
| Prados alpinos y subalpinos calcáreos <br><small>prados-alpinos-y-6170</small> | 6170 | 571 | 102 | **469** | Colias croceus (57); Lycaena phlaeas (42); Pontia daplidice (42); Aricia cramera (42); Lasiommata megera (42); Polyommatus celina (32); Hipparchia hermione (32); Damora pandora (31); Lysandra bellargus (31); Lasiommata maera (29) |
| Prados calcáreos cársticos o basófilos del Alysso-Sedion albi <br><small>prados-calcareos-carsticos-6110</small> | 6110 | 308 | 36 | **272** | Peridroma saucia (23); Agrotis segetum (17); Bryonycta pineti (17); Mythimna vitellina (16); Autographa gamma (15); Mythimna sicula (15); Odice pergrata (15); Acontia lucida (14); Caradrina clavipalpis (14); Eublemma ostrina (14) |
| Galerías y matorrales ribereños termomediterráneos (Nerio-Tamaricetea) <br><small>galerias-y-matorrales-92D0</small> | 92D0 | 121 | 31 | **90** | Sus scrofa (45); Ammotragus lervia (24); Vulpes vulpes (8); Xerocrassa subrogata (6); Pinus halepensis (6); Nerium oleander (5); Salvia rosmarinus (5); Asparagus albus (5); Medicago sativa (5); Sedum dasyphyllum (4) |
| Robledales ibéricos de Quercus faginea y Quercus canariensis <br><small>robledales-ibericos-de-9240</small> | 9240 | 37 | 3 | **34** | Helleborus foetidus (5); Juniperus phoenicea (4); Acer monspessulanum (3); Hormathophylla spinosa (2); Phlomis lychnitis (1); Linaria aeruginea (1); Erodium saxatile (1); Asplenium trichomanes (1); Asplenium ceterach (1); Cotoneaster granatensis (1) |
| Prados húmedos mediterráneos de hierbas altas del Molinion-Holoschoenion <br><small>prados-humedos-mediterraneos-6420</small> | 6420 | 29 | 26 | **3** | Helianthemum cinereum (1); Viburnum tinus (1); Pistacia terebinthus (1) |
| Bosques galería de Salix alba y Populus alba <br><small>bosques-galeria-de-92A0</small> | 92A0 | 21 | 18 | **3** | Helianthemum cinereum (1); Viburnum tinus (1); Pistacia terebinthus (1) |

> Las Aves son el grueso del ruido espacial (registros en vuelo/marinos que caen en cualquier
> polígono). Quitándolas, los hábitats botánicos quedan con su flora coherente. Las Aves NO se
> tiran: van a un apartado propio (migratorias/ZEPA) contrastable con la lista oficial del espacio.