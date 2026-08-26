# Especies por hábitat + análisis de ruido (GBIF) — Cabo Cope y Puntas de Calnegre

Fuente: GBIF (ocurrencias georreferenciadas) · método: point-in-polygon local.

## 1. Resumen

- Ocurrencias en bbox: **15325** · usadas tras filtro: **15325**
- Dentro de algún hábitat: **12864** · fuera: **2461**
- Especies distintas en hábitats: **681** → **Aves 175** / no-Aves **506**

## 2. Composición taxonómica (ocurrencias dentro de hábitats, por clase)

| Clase | Ocurrencias | % |
|---|---:|---:|
| Aves | 34678 | 88.4% |
| Magnoliopsida | 2488 | 6.3% |
| Insecta | 1002 | 2.6% |
| Liliopsida | 404 | 1.0% |
| Squamata | 160 | 0.4% |
| Gastropoda | 131 | 0.3% |
| Arachnida | 93 | 0.2% |
| Lecanoromycetes | 68 | 0.2% |
| Florideophyceae | 60 | 0.2% |
| Pinopsida | 38 | 0.1% |

## 3. Barrido de incertidumbre de coordenadas

Registros con incertidumbre declarada: **2267/15325** (15%).
| Umbral | Pasan (desc. incluidas) | Pasan (solo con dato) |
|---|---:|---:|
| sin filtro | 15325 | 2267 |
| ≤ 1000 m | 14701 | 1643 |
| ≤ 500 m | 14518 | 1460 |
| ≤ 250 m | 14428 | 1370 |
| ≤ 100 m | 14281 | 1223 |

## 4. Especies ubicuas (ruido espacial: presentes en muchos hábitats)

Especies en ≥ 9/15 hábitats: **72** (de ellas Aves: **58**).

| Especie | Clase | nº hábitats |
|---|---|---:|
| Saxicola rubicola | Aves | 14 |
| Larus michahellis | Aves | 14 |
| Lycium intricatum | Magnoliopsida | 13 |
| Morus bassanus | Aves | 13 |
| Ichthyaetus audouinii | Aves | 13 |
| Curruca melanocephala | Aves | 13 |
| Phoenicurus ochruros | Aves | 13 |
| Galerida theklae | Aves | 12 |
| Lavandula dentata | Magnoliopsida | 12 |
| Psammodromus algirus | Squamata | 12 |
| Falco tinnunculus | Aves | 12 |
| Charadrius alexandrinus | Aves | 12 |
| Pica pica | Aves | 12 |
| Passer domesticus | Aves | 12 |
| Phalacrocorax carbo | Aves | 12 |

## 5. Por hábitat: total vs sin Aves (cuánto ruido se va)

| Hábitat | HIC | Especies | Aves | **No-Aves** | Top no-Aves |
|---|---|---:|---:|---:|---|
| Matorral termomediterráneo semiárido <br><small>matorral-semiarido</small> | 5330 | 654 | 174 | **480** | Periploca laevigata (36); Launaea arborescens (29); Acanthodactylus erythrurus (25); Lavandula dentata (25); Teucrium lanigerum (25); Lycium intricatum (24); Teucrium freynii (21); Thymelaea hirsuta (20); Moraea sisyrinchium (19); Fagonia cretica (19) |
| Matorrales arborescentes de Ziziphus <br><small>azufaifar</small> | 5220 | 524 | 170 | **354** | Launaea arborescens (25); Acanthodactylus erythrurus (21); Periploca laevigata (20); Teucrium lanigerum (19); Lycium intricatum (16); Fagonia cretica (15); Lavandula dentata (15); Teucrium freynii (15); Lavandula multifida (13); Nicotiana glauca (13) |
| Matorrales halo-nitrófilos <br><small>matorral-halonitrofilo</small> | 1430 | 395 | 167 | **228** | Acanthodactylus erythrurus (17); Thymelaea hirsuta (11); Moraea sisyrinchium (10); Nicotiana glauca (10); Lycium intricatum (9); Launaea arborescens (9); Teucrium lanigerum (8); Limonium lobatum (8); Cistanche phelypaea (8); Psammodromus algirus (7) |
| Matorrales arborescentes de Juniperus spp. <br><small>sabinar-juniperus</small> | 5210 | 324 | 122 | **202** | Teucrium lanigerum (12); Teucrium freynii (10); Malva subovata (8); Convolvulus siculus (8); Juniperus phoenicea (8); Helianthemum almeriense (7); Launaea lanifera (6); Lachnaia variolosa (6); Genista umbellata (5); Limonium insigne (5) |
| Pendientes rocosas calcícolas con vegetación casmofítica <br><small>roquedos-casmofiticos</small> | 8210 | 310 | 122 | **188** | Teucrium lanigerum (11); Teucrium freynii (8); Malva subovata (8); Convolvulus siculus (8); Helianthemum almeriense (7); Genista umbellata (6); Galactites duriaei (6); Juniperus phoenicea (6); Launaea lanifera (5); Lachnaia variolosa (5) |
| Zonas subestépicas de gramíneas y anuales del Thero-Brachypodietea <br><small>subestepa-thero-brachypodietea</small> | 6220 | 282 | 121 | **161** | Malva subovata (7); Helianthemum almeriense (6); Galactites duriaei (6); Launaea lanifera (5); Convolvulus siculus (5); Genista umbellata (4); Drimia maritima (4); Roccella phycopsis (4); Lachnaia variolosa (4); Thymus hyemalis (4) |
| Galerías y matorrales ribereños termomediterráneos <br><small>galeria-ribera</small> | 92D0 | 136 | 61 | **75** | Lycium intricatum (5); Soda oppositifolia (4); Lavandula dentata (4); Tarucus theophrastus (4); Teucrium lanigerum (3); Moraea sisyrinchium (3); Anabasis articulata (3); Olea europaea (3); Thymelaea hirsuta (3); Scaurus rugulosus (3) |
| Matorrales halófilos mediterráneos y termoatlánticos <br><small>matorral-halofilo</small> | 1420 | 130 | 59 | **71** | Lycium intricatum (5); Soda oppositifolia (4); Lavandula dentata (4); Tarucus theophrastus (4); Teucrium lanigerum (3); Moraea sisyrinchium (3); Anabasis articulata (3); Olea europaea (3); Scaurus rugulosus (3); Spergularia flaccida (2) |
| Prados calcáreos cársticos o basófilos del Alysso-Sedion albi <br><small>prados-alysso-sedion</small> | 6110 | 103 | 45 | **58** | Teucrium lanigerum (8); Juniperus phoenicea (5); Teucrium freynii (5); Sphincterochila baetica (3); Genista umbellata (2); Limonium insigne (2); Psammodromus algirus (2); Malva subovata (2); Lavandula dentata (2); Heliotaurus ruficollis (2) |
| Dunas móviles embrionarias <br><small>dunas-embrionarias</small> | 2110 | 93 | 83 | **10** | Euphorbia peplis (2); Pallenis maritima (2); Patella caerulea (2); Anabasis articulata (1); Salvia rosmarinus (1); Salsola papillosa (1); Launaea arborescens (1); Chenopodiastrum murale (1); Lycium intricatum (1); Posidonia oceanica (1) |
| Vegetación anual sobre desechos marinos acumulados <br><small>veg-anual-desechos-marinos</small> | 1210 | 93 | 83 | **10** | Euphorbia peplis (2); Pallenis maritima (2); Patella caerulea (2); Anabasis articulata (1); Salvia rosmarinus (1); Salsola papillosa (1); Launaea arborescens (1); Chenopodiastrum murale (1); Lycium intricatum (1); Posidonia oceanica (1) |
| Acantilados mediterráneos con Limonium <br><small>acantilados</small> | 1240 | 76 | 17 | **59** | Frankenia corymbosa (3); Crithmum maritimum (3); Salsola kali (3); Lavandula dentata (3); Pseudomogoplistes squamiger (3); Nicotiana glauca (2); Moraea sisyrinchium (2); Pallenis maritima (2); Cistanche phelypaea (2); Sphodromantis viridis (2) |
| Dunas con céspedes del Malcomietalia <br><small>dunas-malcomietalia</small> | 2230 | 43 | 4 | **39** | Pancratium maritimum (9); Cakile maritima (8); Launaea arborescens (5); Medicago marina (4); Thymelaea hirsuta (3); Periploca laevigata (3); Echium sabulicola (3); Posidonia oceanica (3); Fagonia cretica (3); Pseudodictamnus hirsutus (2) |
| Estepas salinas mediterráneas (Limonietalia) <br><small>estepas-salinas-albardinal</small> | 1510 | 41 | 12 | **29** | Salsola kali (3); Nicotiana glauca (2); Sphodromantis viridis (2); Launaea arborescens (2); Caenocoris nerii (2); Glebionis coronaria (1); Salaria pavo (1); Ifloga spicata (1); Cistanche phelypaea (1); Euphorbia peplis (1) |
| Ríos mediterráneos de caudal permanente con Glaucium flavum <br><small>rios-glaucium</small> | 3250 | 0 | 0 | **0** | — |

> Las Aves son el grueso del ruido espacial (registros en vuelo/marinos que caen en cualquier
> polígono). Quitándolas, los hábitats botánicos quedan con su flora coherente. Las Aves NO se
> tiran: van a un apartado propio (migratorias/ZEPA) contrastable con la lista oficial del espacio.