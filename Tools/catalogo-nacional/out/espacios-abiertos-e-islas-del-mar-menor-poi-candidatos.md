# Espacios Abiertos e Islas del Mar Menor — candidatos a punto de interés (N3)

> Generado por `Tools/build-park-pois.js` el 2026-08-21. **Documento de trabajo, no una
> alta.** Nada de lo que hay aquí entra en `park.json` sin pasar por el paso 2 del §4.5 de
> `Docs/prompts/e-rollout-nacional.md`: tabla de candidatos, visto bueno, y descripción
> redactada con la fuente del hecho delante.

| | |
|---|---|
| Espacio | Espacios Abiertos e Islas del Mar Menor (`espacios-abiertos-e-islas-del-mar-menor`) |
| Fuente consultada | OpenStreetMap vía Overpass (2026-08-21) |
| Candidatos dentro del límite | 19 |
| Fuera del polígono (descartados) | 376 |
| Descartados por regla | 4 |

## Candidatos

Coordenada en el orden de `park.json` (`[lat, lon]`). El tipo es una **sugerencia** a partir
de la etiqueta de OSM: los ocho del vocabulario cerrado del §4.1, y quien redacta decide.

| Nombre | `id` propuesto | Tipo sug. | Coordenada | Origen | A revisar |
|---|---|---|---|---|---|
| Camino del Mar Mediterráneo | `camino-del-mar-mediterraneo` | Acceso | 37.674730, -0.824857 | OSM node/13165920158 | a 3 m de una traza de trails.geojson: si lo que se quiere contar es el recorrido, ya está en la capa de senderos (§4.1) |
| Oficina de Turismo La Manga del Mar Menor | `oficina-de-turismo-la-manga-del-mar-menor` | Acceso | 37.635266, -0.708211 | OSM way/224642630 | — |
| Poblado ibérico de La Loma del Escorial | `poblado-iberico-de-la-loma-del-escorial` | Arqueológico | 37.648149, -0.774497 | OSM node/13331482812 | a 40 m de una traza de trails.geojson: si lo que se quiere contar es el recorrido, ya está en la capa de senderos (§4.1) |
| Yacimiento de las Amoladeras | `yacimiento-de-las-amoladeras` | Arqueológico | 37.638649, -0.708599 | OSM node/10262785374 | — |
| Castillo del Barón de Benifayó | `castillo-del-baron-de-benifayo` | Cultural | 37.693790, -0.766178 | OSM way/971756753 | — |
| Cabezo Carmolí | `cabezo-carmoli` | Geológico | 37.687466, -0.842823 | OSM node/387506706 | — |
| Cueva Victoria | `cueva-victoria` | Geológico | 37.632628, -0.820784 | OSM node/3905429443 | §4.3.6 — una cavidad con registro arqueológico y sin vigilancia no se señala en una guía de campo (precedente: Cueva C.6 de Cabo Cope). Comprobar protección antes de admitirlo |
| Amoladeras | `amoladeras` | Natural | 37.639473, -0.707877 | OSM relation/3974792 | — |
| Playa del Pudrimel | `playa-del-pudrimel` | Natural | 37.772920, -0.742362 | OSM way/478799430 | — |
| Playa del Pudrimel (norte) | `playa-del-pudrimel-norte` | Natural | 37.776286, -0.742548 | OSM way/550886917 | — |
| Cerro de San Ginés | `cerro-de-san-gines` | Paisajístico | 37.635418, -0.827157 | OSM node/1304132100 | — |
| La Esparteña | `la-espartena` | Paisajístico | 37.697242, -0.797468 | OSM node/1304111900 | — |
| Peña Blanca | `pena-blanca` | Paisajístico | 37.702183, -0.802478 | OSM node/1243037770 | — |
| Punta de la Esparteña | `punta-de-la-espartena` | Paisajístico | 37.696311, -0.797502 | OSM node/3308579261 | — |
| Punta del Fraile | `punta-del-fraile` | Paisajístico | 37.702682, -0.771447 | OSM node/3308505135 | — |
| Punta del Pudrimel | `punta-del-pudrimel` | Paisajístico | 37.772351, -0.740402 | OSM node/3010182101 | — |
| Punta la Seca | `punta-la-seca` | Paisajístico | 37.691894, -0.765069 | OSM node/8994057254 | también mapeado como: Playa del Muelle (beach) |
| Punta Lengua de Vaca | `punta-lengua-de-vaca` | Paisajístico | 37.649240, -0.773927 | OSM node/12160462881 | — |
| Molino Salinero | `molino-salinero` | — | 37.776877, -0.743576 | OSM node/6670241077 | — |

**Lo que falta en cada fila y no lo puede poner un script**: el hecho comprobable y su
fuente, `approx` (y por qué), la foto con su licencia, y la descripción. Sin fuente del
hecho, el candidato no entra (§4.3.1).

## Descartados por regla

| Nombre | Etiqueta OSM | Regla que lo descarta |
|---|---|---|
| Marquesita e Hiti | `locality` | topónimo suelto (§4.1): solo entra si una fuente le pone un hecho detrás |
| Soto de Miralles | `locality` | topónimo suelto (§4.1): solo entra si una fuente le pone un hecho detrás |
| El Puntal | `locality` | topónimo suelto (§4.1): solo entra si una fuente le pone un hecho detrás |
| Los Triolas | `locality` | topónimo suelto (§4.1): solo entra si una fuente le pone un hecho detrás |

## Fuera del polígono oficial

Caen en el bbox pero no en el límite (§4.3.3), con el margen de ~50 m ya aplicado.

| Nombre | Etiqueta OSM | Coordenada |
|---|---|---|
| Faro de Cabo de Palos | `building` | 37.634689, -0.690265 |
| Cabezo Beaza | `peak` | 37.628441, -0.956038 |
| Punta Parreño | `cape` | 37.595488, -0.772324 |
| Cabezo de la Fuente | `peak` | 37.603490, -0.771276 |
| Punta Negrete | `cape` | 37.596485, -0.766555 |
| Punta del Hacho | `cape` | 37.593900, -0.776662 |
| Monte Blanco | `viewpoint` | 37.665215, -0.726279 |
| Peña del Águila | `peak` | 37.601924, -0.840584 |
| Los Benzales | `locality` | 37.643311, -0.858821 |
| El Periñán | `locality` | 37.661223, -0.908275 |
| Los Aparicios | `locality` | 37.661387, -0.928834 |
| Lo Subiela | `locality` | 37.659468, -0.852281 |
| La Encañizada Nueva | `locality` | 37.774772, -0.761347 |
| Diente la Vieja | `locality` | 37.595871, -0.892755 |
| Los Camachos | `locality` | 37.792912, -0.910358 |
| El Olivar del Llano | `locality` | 37.744019, -0.937689 |
| Los Escribanos | `locality` | 37.664410, -0.914716 |
| Huerto de las Calesas | `locality` | 37.603126, -0.828643 |
| Perín | `locality` | 37.626556, -0.869148 |
| Los Martínez | `locality` | 37.662427, -0.975095 |
| Las Lomas | `locality` | 37.599225, -0.767380 |
| El Jarape | `locality` | 37.637792, -0.967012 |
| El Chichas | `locality` | 37.649592, -0.911004 |
| Rastrojera | `locality` | 37.646490, -0.928806 |
| Los Garridos | `locality` | 37.630564, -0.765321 |
| Matas Gordas | `locality` | 37.735264, -0.745223 |
| El Racilla | `locality` | 37.648104, -0.875185 |
| Los Buenos | `locality` | 37.783358, -0.831055 |
| Los Bartolomés | `locality` | 37.664162, -0.880090 |
| Gollerón | `locality` | 37.663672, -0.736940 |
| Los Bastidas | `locality` | 37.759500, -0.948485 |
| Boca Rambla | `locality` | 37.714125, -0.866733 |
| Fuente y Horno | `locality` | 37.607162, -0.772534 |
| Los Solanos | `locality` | 37.644943, -0.965706 |
| Los Mulas | `locality` | 37.614543, -0.928311 |
| El Caperucho | `locality` | 37.642473, -0.925336 |
| La Campana | `locality` | 37.733832, -0.945245 |
| Las Monarcas | `locality` | 37.787097, -0.864999 |
| Los Llanos | `locality` | 37.658064, -0.864303 |
| La Gloria | `locality` | 37.618641, -0.781516 |
| Los Lorenzos | `locality` | 37.754004, -0.868380 |
| Las Bodegas | `locality` | 37.631771, -0.932274 |
| Sancti Spíritus | `locality` | 37.609203, -0.850963 |
| Las Pocilgas | `locality` | 37.606890, -0.885522 |
| El Almidón | `locality` | 37.653633, -0.935295 |
| Los Roches | `locality` | 37.630888, -0.922032 |
| Lo Mitre | `locality` | 37.651757, -0.835218 |
| Coto del Sabinar | `locality` | 37.625383, -0.807125 |
| Cimarros | `locality` | 37.598990, -0.785996 |
| El Hondón | `locality` | 37.607897, -0.966399 |
| Los Lobos | `locality` | 37.662044, -0.917480 |
| Cuesta de los Morenos | `locality` | 37.615945, -0.870923 |
| Los López | `locality` | 37.646053, -0.955407 |
| Filo de Caballo | `locality` | 37.630368, -0.757350 |
| La Fonseca | `locality` | 37.618119, -0.918479 |
| Alto del Villar | `locality` | 37.788459, -0.846303 |
| Los Pavos | `locality` | 37.653111, -0.892033 |
| Montes Franci | `locality` | 37.629924, -0.862015 |
| La Cañada | `locality` | 37.760141, -0.975086 |
| La Escucha | `locality` | 37.614934, -0.947038 |
| El Geringal | `locality` | 37.663979, -0.930678 |
| La Llana | `locality` | 37.786396, -0.754867 |
| Garci-Pérez | `locality` | 37.619784, -0.741569 |
| Los Maestres | `locality` | 37.619675, -0.946081 |
| Lo Luengo | `locality` | 37.661633, -0.874788 |
| Barranco del Moro | `locality` | 37.594312, -0.837450 |
| Tiro de Pichón | `locality` | 37.638677, -0.881154 |
| Los Saurines | `locality` | 37.796646, -0.974998 |
| La Patria | `locality` | 37.617725, -0.913505 |
| Las Ratoneras | `locality` | 37.614877, -0.736586 |
| Casa Blanca | `locality` | 37.778685, -0.817646 |
| Lo Gallego | `locality` | 37.624784, -0.971525 |
| El Seco Grande | `locality` | 37.757573, -0.744069 |
| Martínez del Huerto | `locality` | 37.751603, -0.922610 |
| Los Macocas | `locality` | 37.662594, -0.886653 |
| Villa Pilar | `locality` | 37.664553, -0.896380 |
| La Roma | `locality` | 37.741164, -0.870973 |
| Los Aragoneses | `locality` | 37.671505, -0.843771 |
| Los Valencianos | `locality` | 37.777334, -0.850475 |
| Mina Blanca | `locality` | 37.631506, -0.846922 |
| Lugar Nuevo | `locality` | 37.769560, -0.911720 |
| El Gallo | `locality` | 37.595085, -0.940618 |
| Tajos Quebrados | `locality` | 37.610905, -0.723600 |
| La Parreta | `locality` | 37.608963, -0.924138 |
| Los Rangos | `locality` | 37.654688, -0.860047 |
| Lo José | `locality` | 37.639798, -0.870345 |
| La Petra | `locality` | 37.642085, -0.948988 |
| La Encañizada Vieja | `locality` | 37.783020, -0.767162 |
| Lo Poyo | `locality` | 37.652621, -0.821456 |
| Las Lajas | `locality` | 37.604778, -0.877823 |
| Los Alcaraces | `locality` | 37.768742, -0.923038 |
| Los Gallegos | `locality` | 37.793441, -0.819790 |
| Los Rodríguez | `locality` | 37.651325, -0.942454 |
| Ponce | `locality` | 37.612420, -0.829313 |
| Los Derramadores | `locality` | 37.645527, -0.837541 |
| El Llano | `locality` | 37.620776, -0.845634 |
| Huncos | `locality` | 37.604669, -0.783709 |
| Las Cuevas | `locality` | 37.623472, -0.930759 |
| Los Riscales | `locality` | 37.650520, -0.926006 |
| Pedreras Altas | `locality` | 37.615280, -0.908272 |
| Ventaríquez | `locality` | 37.684751, -0.959074 |
| La Tira | `locality` | 37.615812, -0.754898 |
| La Embestida | `locality` | 37.675796, -0.729191 |
| El Toyo | `locality` | 37.781890, -0.755614 |
| Lo Tejero | `locality` | 37.648987, -0.897806 |
| Calblanque | `locality` | 37.606627, -0.746747 |
| El Descargador | `locality` | 37.620541, -0.867926 |
| La Fortuna | `locality` | 37.607175, -0.864320 |
| Los Colorados | `locality` | 37.732327, -0.867640 |
| El Cordonero | `locality` | 37.657255, -0.927555 |
| La Chanca | `locality` | 37.767139, -0.752337 |
| Los Chalos | `locality` | 37.634062, -0.753510 |
| Molino Colorado | `locality` | 37.655502, -0.903335 |
| La Leona | `locality` | 37.618426, -0.927194 |
| Hoyamorena | `locality` | 37.733711, -0.909652 |
| La Capellanía | `locality` | 37.665810, -0.864081 |
| El Corralón | `locality` | 37.609877, -0.786998 |
| El Garbanzal | `locality` | 37.624549, -0.898426 |
| El Mataperros | `locality` | 37.605307, -0.950542 |
| La Clara | `locality` | 37.662184, -0.969963 |
| La Peraleja | `locality` | 37.607042, -0.895045 |
| El Zorra | `locality` | 37.619675, -0.966848 |
| Los Caños | `locality` | 37.654472, -0.929140 |
| Hortichuela | `locality` | 37.782976, -0.969784 |
| Los Alcaraz | `locality` | 37.659548, -0.967597 |
| Lo Moloy | `locality` | 37.658552, -0.839646 |
| El Plameral | `locality` | 37.682727, -0.842902 |
| Llanos del Sabinar | `locality` | 37.620916, -0.794194 |
| La Batería | `locality` | 37.615231, -0.961078 |
| Fontes | `locality` | 37.726479, -0.967062 |
| Las Rochas | `locality` | 37.642856, -0.972234 |
| Las Minas | `locality` | 37.619773, -0.717121 |
| Lo Mayor | `locality` | 37.638500, -0.955886 |
| El Palmeral | `locality` | 37.762825, -0.831802 |
| La Peseta | `locality` | 37.659441, -0.891231 |
| La Primavera | `locality` | 37.619292, -0.815427 |
| Iglésia Nuestra Señora de la Asunción | `place_of_worship` | 37.744444, -0.847957 |
| Centro Integral de Información Turístico | `information` | 37.764404, -0.844286 |
| Cabezo Ventura | `peak` | 37.642076, -0.930610 |
| Cabezo de la Fraila | `peak` | 37.623482, -0.968657 |
| Cabezo de la Escucha | `peak` | 37.613886, -0.722192 |
| Cabezo de Trujillo | `peak` | 37.625508, -0.859898 |
| Cerro de los Cuatro Tiros | `peak` | 37.612812, -0.741827 |
| Cerro del Calnegre | `peak` | 37.664699, -0.732353 |
| Cabezo de la Viuda | `peak` | 37.612009, -0.957549 |
| Cabezo Negro | `peak` | 37.617188, -0.761242 |
| Alto Mediano | `peak` | 37.621663, -0.851893 |
| Cabezo de Marcelino | `peak` | 37.605043, -0.956740 |
| Cabezo de Don Juan | `peak` | 37.612405, -0.841296 |
| Cabezo Roche | `peak` | 37.629753, -0.909544 |
| El Machón | `peak` | 37.596434, -0.897609 |
| Cabezo Otahonero | `peak` | 37.638717, -0.911956 |
| Cabezo de Álvarez | `peak` | 37.635173, -0.869559 |
| Cabecico del Molino | `peak` | 37.607404, -0.905825 |
| Cerro de los Cuervos | `peak` | 37.622109, -0.721188 |
| Cabezo de La Atalaya | `peak` | 37.640693, -0.896617 |
| Cabezo de los Martínez | `peak` | 37.615141, -0.741842 |
| Cerro del Atalayón | `peak` | 37.616616, -0.721838 |
| Cabezo de las Cuneras | `peak` | 37.593348, -0.907383 |
| Cabezo Mingote | `peak` | 37.638691, -0.795571 |
| Cabezo Rajado | `peak` | 37.616253, -0.900302 |
| Cabezo de los Cuernos | `peak` | 37.601561, -0.947164 |
| Casas de Ventura | `locality` | 37.641184, -0.925053 |
| Los Popos | `locality` | 37.657278, -0.947140 |
| Punta de Algas | `locality` | 37.791064, -0.748695 |
| Fuente de los Pescadores | `viewpoint` | 37.743840, -0.847268 |
| Cabezo de la Fuente | `viewpoint` | 37.603460, -0.771257 |
| Parroquia Santiago Apóstol | `place_of_worship` | 37.797151, -0.804816 |
| Mirador Monte Blanco | `viewpoint` | 37.666043, -0.725669 |
| Mirador del Estacio | `viewpoint` | 37.745579, -0.725650 |
| Mirador Playa Matas Gordas | `viewpoint` | 37.726760, -0.739885 |
| La Manga Consorcio | `information` | 37.655092, -0.720125 |
| Homenaje al Peregrino | `artwork` | 37.797234, -0.804065 |
| Escultura de Santiago | `memorial` | 37.597291, -0.973629 |
| Iglesia Santa María del Mar | `place_of_worship` | 37.631425, -0.701913 |
| Batería de Sierra Gorda | `castle` | 37.594850, -0.929839 |
| Centro de Interpretación Parque Minero | `museum` | 37.615359, -0.872900 |
| San Javier | `information` | 37.797174, -0.807615 |
| Punta del Galán | `locality` | 37.690073, -0.742655 |
| Punta el Pedruchillo | `locality` | 37.706069, -0.745680 |
| Parque Mediterráneo | `parking` | 37.624230, -0.947274 |
| Vagoneta | `artwork` | 37.761147, -0.835180 |
| Espacio Mediterráneo | `parking` | 37.626688, -0.948528 |
| Cabezo de los Moros | `peak` | 37.601109, -0.973350 |
| Molino del Tío Pacorro | `monument` | 37.746525, -0.953533 |
| Los Sotos Nuevos | `hamlet` | 37.761928, -0.963168 |
| Torre de la Iglesia | `monument` | 37.742849, -0.953333 |
| Santiago Apóstol | `memorial` | 37.747733, -0.963047 |
| Plane Parking | `parking` | 37.787460, -0.838775 |
| Museo Etnológico Municipal | `museum` | 37.626880, -0.922852 |
| Molino de Bolea | `windmill` | 37.689977, -0.965935 |
| Molino de las Casicas | `windmill` | 37.715202, -0.918916 |
| Cabo de Palos | `cape` | 37.635000, -0.690000 |
| Iglesia Virgen de la Caridad | `place_of_worship` | 37.738071, -0.850863 |
| Sierra Gorda | `peak` | 37.594292, -0.930016 |
| Ponce | `peak` | 37.610577, -0.826788 |
| Sancti Spiritu | `peak` | 37.610476, -0.861171 |
| Monumento al minero | `memorial` | 37.617274, -0.875611 |
| Faro del Estacio | `attraction` | 37.745720, -0.725940 |
| Salón del reino de los Testigos de Jehova | `place_of_worship` | 37.624098, -0.888447 |
| Isla del Pato | `viewpoint` | 37.634486, -0.695104 |
| Museo Minero | `museum` | 37.617218, -0.878310 |
| Punta del Cocedor | `locality` | 37.749952, -0.728183 |
| Lo Salgado | `locality` | 37.678208, -0.973406 |
| Los López | `locality` | 37.678049, -0.967895 |
| Los Celdranes | `locality` | 37.680264, -0.965146 |
| Los Marines | `locality` | 37.681918, -0.966000 |
| Los Ingleses | `locality` | 37.682866, -0.967909 |
| Ventarique | `locality` | 37.679283, -0.958881 |
| Los Cortijos | `locality` | 37.676117, -0.959653 |
| Los Manzanares | `locality` | 37.677895, -0.949214 |
| Zabalas | `locality` | 37.676514, -0.941961 |
| Las Cañas | `locality` | 37.679397, -0.941896 |
| Espines | `locality` | 37.677537, -0.938391 |
| Campobajo | `locality` | 37.671520, -0.943260 |
| Oficina de Turismo | `information` | 37.742300, -0.953623 |
| Cueva El Mani | `cave_entrance` | 37.598017, -0.929914 |
| Manantial del Barranco | `spring` | 37.598044, -0.948479 |
| Iglesia de Jesucristo de los Santos de los últimos días | `place_of_worship` | 37.761952, -0.845913 |
| Avión Casa C-101 | `artwork` | 37.757221, -0.846192 |
| Monumento a Saza | `artwork` | 37.738838, -0.848336 |
| Molino del Pasico | `information` | 37.757203, -0.963525 |
| Ermita de la Virgen del Pasico | `information` | 37.757579, -0.963210 |
| Castillo de los Moros | `castle` | 37.601209, -0.973624 |
| Museo Arqueológico de Portman | `museum` | 37.593284, -0.853630 |
| Collado de Ponce | `saddle` | 37.613044, -0.820737 |
| Collado de la Rebollada | `saddle` | 37.598677, -0.836323 |
| El sueño de Turing | `artwork` | 37.738342, -0.856233 |
| AOA | `artwork` | 37.789605, -0.804093 |
| Salt Church Mar Menor | `place_of_worship` | 37.796217, -0.838214 |
| Monumento al Voluntario | `artwork` | 37.739114, -0.852139 |
| Monumento al Huertano | `memorial` | 37.746626, -0.846313 |
| Spa | `information` | 37.673696, -0.823673 |
| Noria de la Tía Anselma | `yes` | 37.761814, -0.923310 |
| Los Partidarios | `hamlet` | 37.610995, -0.906060 |
| Museo Aeronáutico | `museum` | 37.736032, -0.854222 |
| Reserva Marina Cabo Palos | `information` | 37.632982, -0.689866 |
| Proyecto Biodiversidad Faro Cabo Palos | `information` | 37.632856, -0.689730 |
| Life Transfer Seacrass Transplantarion for transitional ecosustem recovery | `information` | 37.692692, -0.837428 |
| Balnearios del Mar Menor | `information` | 37.695031, -0.839083 |
| Reserva marina de Cabo de Palos - Islas Hormigas | `information` | 37.634482, -0.690017 |
| Playa Ensenada del Esparto | `information` | 37.750938, -0.738611 |
| Red Natura 2000 | `information` | 37.747806, -0.730657 |
| Gola del Estacio | `information` | 37.747067, -0.733144 |
| Torre Ciega | `monument` | 37.614808, -0.970348 |
| Playa Parreño | `beach` | 37.597054, -0.768385 |
| Playa Parreño | `beach` | 37.597038, -0.770848 |
| Playa Parreño | `beach` | 37.596749, -0.771740 |
| Centro de Visitantes Las Cobaticas | `information` | 37.609971, -0.757258 |
| Cala de las Mulas | `beach` | 37.594613, -0.782488 |
| Cala Fría | `beach` | 37.633323, -0.689763 |
| Iglesia Los Narejos | `place_of_worship` | 37.755289, -0.838543 |
| Playa de Calblanque | `beach` | 37.603709, -0.729777 |
| Cala Arturo | `beach` | 37.605234, -0.726473 |
| Cala Magre | `beach` | 37.605469, -0.724503 |
| Aparcamiento Parque Minero | `parking` | 37.615482, -0.873485 |
| Iglesia de Nuestra Señora de las Nieves | `place_of_worship` | 37.641418, -0.763760 |
| Iglesia de Nuestra Señora de la Asunción | `place_of_worship` | 37.639070, -0.762074 |
| Playa de Levante de Islas Menores | `beach` | 37.644591, -0.764237 |
| Playa Lomas del Castillico | `beach` | 37.633469, -0.744879 |
| Cala de Huncos | `beach` | 37.594887, -0.780137 |
| Calzada Romana | `archaeological_site` | 37.591185, -0.831643 |
| Parroquia de Santa María del Mar | `place_of_worship` | 37.631387, -0.702048 |
| Iglesia Nuestra Señora del Carmen | `place_of_worship` | 37.680750, -0.829589 |
| Mina Blanca | `museum` | 37.629961, -0.848922 |
| Mina Las Matildes | `museum` | 37.631823, -0.854894 |
| Mina La Sierva | `ruins` | 37.617202, -0.887465 |
| Pasaje Mina Sierva | `ruins` | 37.621003, -0.886336 |
| Mina Lo Veremos | `ruins` | 37.618239, -0.886951 |
| Mina La Sierva | `ruins` | 37.617320, -0.888690 |
| Gollerón | `beach` | 37.664123, -0.734123 |
| Parroquia de Santa Florentina | `place_of_worship` | 37.688870, -0.962424 |
| Iglesia Salvador Mundo | `place_of_worship` | 37.645834, -0.719523 |
| Iglesia Santa María Reina de Los Apóstoles | `place_of_worship` | 37.679498, -0.733190 |
| Parking Aldi | `parking` | 37.633555, -0.708024 |
| Parroquia Nuestra Señora de Los Llanos | `place_of_worship` | 37.648224, -0.867005 |
| Parroquia de San Isidro Labrador | `place_of_worship` | 37.622925, -0.775967 |
| Ermita de la Virgen del Pasico | `place_of_worship` | 37.757691, -0.963459 |
| Iglesia de Nª Sra. de los Dolores | `place_of_worship` | 37.632698, -0.925928 |
| Cala del Descargador | `beach` | 37.620705, -0.709106 |
| Cala Roja | `beach` | 37.632570, -0.690019 |
| Parroquia del Sagrado Corazón de Jesús | `place_of_worship` | 37.716809, -0.920581 |
| Torre del Negro | `tower` | 37.685966, -0.868851 |
| Iglesia de San Roque | `place_of_worship` | 37.604382, -0.915808 |
| Ermita El Pasico | `place_of_worship` | 37.660325, -0.955903 |
| aparcamiento disuasorio | `parking` | 37.736654, -0.855190 |
| Virgen de la Asunción | `place_of_worship` | 37.744442, -0.847971 |
| Nuestra Señora de Los Dolores | `place_of_worship` | 37.665344, -0.955483 |
| Museo del Vidrio | `museum` | 37.598634, -0.969972 |
| Parroquia de Santiago Apóstol | `place_of_worship` | 37.598622, -0.972751 |
| Parroquia San Isidoro | `place_of_worship` | 37.603871, -0.973150 |
| La Galera - Isla del Pato | `beach` | 37.633938, -0.695426 |
| Cala Roja | `beach` | 37.632438, -0.690867 |
| El Cañonero | `beach` | 37.629930, -0.695697 |
| Cala de las Melvas | `beach` | 37.630781, -0.696619 |
| Cala Botella | `beach` | 37.630044, -0.694375 |
| Cala Medina | `beach` | 37.627253, -0.703996 |
| Cala Flores | `beach` | 37.625229, -0.704767 |
| Cala Túnez | `beach` | 37.634753, -0.691996 |
| Cala Reona | `beach` | 37.618283, -0.714121 |
| Playa de Los Urrutias | `beach` | 37.683861, -0.830949 |
| Playa de Los Nietos | `beach` | 37.651839, -0.786461 |
| Playa de Mar de Cristal | `beach` | 37.641973, -0.757626 |
| Playa de Poniente de Islas Menores | `beach` | 37.646553, -0.769012 |
| Playa Honda | `beach` | 37.632371, -0.735303 |
| Hospital General Universitario Santa Lucía | `parking` | 37.601942, -0.962355 |
| Playa de los Alemanes | `beach` | 37.639248, -0.724156 |
| Punto de Información Turística Playa Mistral | `information` | 37.737239, -0.738792 |
| Playa Paraíso | `beach` | 37.635079, -0.727951 |
| Playa del Pedruchillo | `beach` | 37.705116, -0.743147 |
| Playa de las Antillas | `beach` | 37.708098, -0.744112 |
| Playa de Poniente | `beach` | 37.700302, -0.741225 |
| Playa Perla de Levante | `beach` | 37.673286, -0.823356 |
| Plaza Bohemia | `parking` | 37.662816, -0.723888 |
| Playa El Galán | `beach` | 37.692619, -0.740578 |
| Playa Ensenada del Esparto | `beach` | 37.748864, -0.732448 |
| Playa La Veneziola | `beach` | 37.772970, -0.751632 |
| Playa Matasgordas | `beach` | 37.727886, -0.740004 |
| Playa Mistral | `beach` | 37.736563, -0.739638 |
| Playa del Estacio | `beach` | 37.732796, -0.738272 |
| Playa del Pudrimel (sur) | `beach` | 37.769282, -0.745766 |
| Cala de los Dentoles | `beach` | 37.607429, -0.719880 |
| Cala Cocón | `beach` | 37.612475, -0.717247 |
| Parque Mediterráneo | `parking` | 37.624434, -0.950012 |
| Molino | `ruins` | 37.670833, -0.957360 |
| Molino El Abasto | `memorial` | 37.670857, -0.951459 |
| Molino | `ruins` | 37.673198, -0.962664 |
| Molino | `memorial` | 37.662854, -0.959884 |
| Plaza Cavanna | `parking` | 37.656574, -0.721788 |
| Plaza José Bolea | `parking` | 37.668314, -0.952600 |
| Iglesia Nuestra Señora del Rosario | `place_of_worship` | 37.742945, -0.953547 |
| Casa Fontes | `museum` | 37.734454, -0.960370 |
| Plaza Ramón González Pardo | `parking` | 37.749334, -0.944174 |
| Torre del Rame | `tower` | 37.728708, -0.866377 |
| Parroquia Nuestra Señora de Belén | `place_of_worship` | 37.608507, -0.943691 |
| Playa Chica | `beach` | 37.762546, -0.747868 |
| Playa de El Pescador | `beach` | 37.798504, -0.803019 |
| Playa de Barnuevo | `beach` | 37.796249, -0.803206 |
| Playa de Punta de Algas | `beach` | 37.793529, -0.750516 |
| Playa de La Llana | `beach` | 37.798489, -0.752712 |
| playa Galua | `beach` | 37.659266, -0.720040 |
| Molino de la Hotichuela | `windmill` | 37.771843, -0.971148 |
| Playa Ensenada del Esparto | `beach` | 37.755496, -0.742888 |
| Parroquia de Nuestra Señora de los Remedios | `place_of_worship` | 37.771205, -0.859305 |
| Los Lorenzos | `locality` | 37.753377, -0.866284 |
| Playa Chica | `beach` | 37.753440, -0.742219 |
| Playa Punta de los Guzmanes | `beach` | 37.778892, -0.756121 |
| Torre Aredo | `tower` | 37.703657, -0.899129 |
| Molino del Pasico | `windmill` | 37.756991, -0.963759 |
| Torre de Lo Poyo | `tower` | 37.653687, -0.809628 |
| Torreblanca | `tower` | 37.634535, -0.889514 |
| Casa Palacio de Los Marqueses de Rozalejo | `manor` | 37.771347, -0.859115 |
| Área El Atochar | `parking` | 37.601128, -0.752286 |
| Área Negrete | `parking` | 37.599671, -0.759235 |
| Cala del Reventón | `beach` | 37.595252, -0.774781 |
| Cala del Muerto | `beach` | 37.595905, -0.773984 |
| Playa de Punta Brava | `beach` | 37.693294, -0.837881 |
| Playa Larga | `beach` | 37.598312, -0.753330 |
| Playa Negrete | `beach` | 37.597737, -0.761306 |
| Playa de Levante | `beach` | 37.634946, -0.701167 |
| Playa de la Gola | `beach` | 37.654567, -0.723028 |
| Puerto Bello | `beach` | 37.648981, -0.719842 |
| Playa de Monteblanco | `beach` | 37.665128, -0.724398 |
| Cala del Pino | `beach` | 37.666829, -0.732558 |
| Playa Calnegre | `beach` | 37.667303, -0.725984 |
| Bahía de las Palmeras | `beach` | 37.662193, -0.730490 |
| Playa Cavanna | `beach` | 37.658887, -0.726020 |
| Isla del Ciervo | `beach` | 37.661363, -0.729826 |
| La Gola | `beach` | 37.649806, -0.722800 |
| Marchamalo / Barco Perdido | `beach` | 37.647909, -0.713846 |
| El Vivero | `beach` | 37.644305, -0.722018 |
| Playa Banco del Tabal | `beach` | 37.673052, -0.728853 |
| Playa Alíseos | `beach` | 37.677076, -0.735362 |
| Playa El Arenal/Playa Pedrucho | `beach` | 37.699210, -0.736314 |
| Playa Lebeche | `beach` | 37.685163, -0.737674 |
| Playa de la Isla | `beach` | 37.668994, -0.733081 |

## Fundidos por proximidad

A menos de 50 m de otro candidato: el mismo sitio con dos etiquetas (§4.3.7).

| Nombre | Etiqueta | Fundido con |
|---|---|---|
| Playa del Muelle | `beach` | Punta la Seca |

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
