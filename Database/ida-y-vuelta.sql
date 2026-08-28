-- El juego de caracteres se fija SIEMPRE: el cliente `mysql` lo toma del entorno y en un
-- contenedor sin locale eso es latin1, que convierte cada tilde en mojibake sin dar error.
SET NAMES utf8mb4;

-- ================================================================================================
-- NaturDex · los dos campos que la ida y vuelta por la API borraba (2026-08-27)
-- ------------------------------------------------------------------------------------------------
-- Generado por `node Tools/catalogo-nacional/coteja-ida-y-vuelta.js --sql <ruta>`.
--
-- VA DESPUÉS de `Database/migrations.sql`, que es quien crea las dos columnas:
--   · `species.gbif_occurrences` — el total de la especie EN EL ESPACIO, la huella del
--     filtro de presencia. NO es `species_habitats.gbif_occurrences`, que es el recuento de
--     un solo polígono y ya existía.
--   · `habitats.origen`         — de dónde sale el recinto. Es el campo de procedencia que
--     exige la regla nº 1 del CLAUDE.md, y vivía SOLO en el geojson.
--
-- Se escribe únicamente lo que el repositorio tiene. Una ficha sin `gbifOccurrences` se
-- queda a NULL, que NO es 0: «nadie barrió» y «se barrió y no cayó ninguna» son distintos, y
-- la auditoría de enlaces los trata distinto.
--
-- Idempotente: aplicado dos veces, la segunda escribe los mismos valores.
-- ================================================================================================

START TRANSACTION;

-- ── barrancos-de-gebas ──────────────────────────────────────  86 especie(s) · 3 recinto(s)
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Lycium intricatum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Tarentola mauritanica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Hemorrhois hippocrepis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Pinus halepensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Cynomorium coccineum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Hemidactylus turcicus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Hyparrhenia hirta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Limonium insigne';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Lygeum spartum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Malpolon monspessulanus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Mauremys leprosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Ononis ornithopodioides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Pistacia lentiscus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Psammodromus algirus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Rhamnus lycioides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 122
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Curruca melanocephala';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 73
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Galerida theklae';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 61
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Falco tinnunculus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 61
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Petronia petronia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 60
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Fringilla coelebs';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 60
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Picus sharpei';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 60
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Pyrrhocorax pyrrhocorax';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 59
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Curruca undata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 59
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Oenanthe leucura';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 56
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Lanius senator';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 54
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Oriolus oriolus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 50
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Motacilla alba';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 49
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Aegithalos caudatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 48
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Parus major';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 48
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Phoenicurus ochruros';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 46
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Apus apus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 45
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Merops apiaster';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 41
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Cuculus canorus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 35
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Curruca hortensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 34
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Phylloscopus collybita';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 33
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Emberiza cia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 32
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Otus scops';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 31
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Bubo bubo';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 30
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Columba oenas';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 26
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Athene noctua';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 26
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Hirundo rustica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 25
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Erithacus rubecula';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 24
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Accipiter nisus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 22
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Oenanthe hispanica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 21
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Sylvia atricapilla';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 20
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Corvus corax';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 19
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Caprimulgus ruficollis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 18
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Aquila chrysaetos';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 18
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Buteo buteo';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 18
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Galerida cristata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 17
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Anthus pratensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 16
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Muscicapa striata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 14
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Delichon urbicum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 14
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Lophophanes cristatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 13
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Burhinus oedicnemus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 13
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Saxicola rubicola';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 12
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Emberiza calandra';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 12
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Garrulus glandarius';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 12
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Hieraaetus pennatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 11
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Loxia curvirostra';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 11
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Monticola solitarius';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 11
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Motacilla cinerea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 10
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Luscinia megarhynchos';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 9
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Spinus spinus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Upupa epops';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Circaetus gallicus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Coracias garrulus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Falco peregrinus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Ptyonoprogne rupestris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Scolopax rusticola';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Actitis hypoleucos';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Apus pallidus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Sylvia borin';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Oenanthe oenanthe';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Phylloscopus trochilus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Clamator glandarius';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Emberiza cirlus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Periparus ater';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Phylloscopus bonelli';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Alcedo atthis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Cisticola juncidis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Gyps fulvus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Pernis apivorus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Phoenicurus phoenicurus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Regulus ignicapilla';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Tachymarptis melba';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'barrancos-de-gebas' AND hb.slug = 'matorrales-termomediterraneos-y-5330';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'barrancos-de-gebas' AND hb.slug = 'zonas-subestepicas-de-6220';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'barrancos-de-gebas' AND hb.slug = 'galerias-y-matorrales-92D0';

-- ── cabezo-gordo ────────────────────────────────────────────  58 especie(s) · 4 recinto(s)
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Periploca angustifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Cosentinia vellea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Helianthemum violaceum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Polygala rupestris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Psammodromus algirus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Sideritis pusilla';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Teucrium carolipaui';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Anagyris foetida';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Atelerix algirus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Blanus cinereus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Bufo bufo';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Caralluma europaea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Centaurea saxicola';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Chamaerops humilis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Corvus corax';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Curruca communis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Egretta garzetta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Eliomys quercinus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Epidalea calamita';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Eptesicus isabellinus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Melanocorypha calandra';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Miniopterus schreibersii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Mustela nivalis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Myotis capaccinii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Myotis myotis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Oenanthe hispanica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Osyris lanceolata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Parus major';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Pipistrellus pipistrellus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Pipistrellus pygmaeus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Plecotus austriacus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Rhinolophus euryale';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Rhinolophus ferrumequinum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Tamarix canariensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Timon lepidus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Tyto alba';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Zamenis scalaris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Ziziphus lotus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 13
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Ptyonoprogne rupestris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 12
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Curruca melanocephala';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 11
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Oenanthe leucura';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 10
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Lanius meridionalis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 10
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Upupa epops';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Galerida theklae';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Athene noctua';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Burhinus oedicnemus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Hirundo rustica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Monticola solitarius';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Apus apus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Erithacus rubecula';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Bubo bubo';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Curruca undata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Oenanthe oenanthe';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Petronia petronia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Calandrella brachydactyla';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Lanius senator';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Sylvia atricapilla';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Tachymarptis melba';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'cabezo-gordo' AND hb.slug = 'matorrales-termomediterraneos-y-5330';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'cabezo-gordo' AND hb.slug = 'matorrales-arborescentes-de-5220';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'cabezo-gordo' AND hb.slug = 'pendientes-rocosas-calcicolas-8210';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'cabezo-gordo' AND hb.slug = 'zonas-subestepicas-de-6220';

-- ── calblanque-monte-cenizas-pena-aguila ────────────────────  204 especie(s) · 18 recinto(s)
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 46
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Pistacia lentiscus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 44
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Tetraclinis articulata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 25
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Chamaerops humilis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 24
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Chamaeleo chamaeleon';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 23
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Periploca angustifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 17
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Acanthodactylus erythrurus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 11
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Calicotome intermedia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 11
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Teucrium carthaginense';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 10
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Psammodromus algirus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 9
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Lycium intricatum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 9
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Pinus halepensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Lathyrus clymenum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Sedum sediforme';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Lapiedra martinezii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Olea europaea subsp. europaea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Centaurea seridis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Cheirolophus intybaceus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Helianthemum almeriense';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Cakile maritima';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Frankenia corymbosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Hemorrhois hippocrepis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Lavandula multifida';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Quercus coccifera';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Tarentola mauritanica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Clematis cirrhosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Coronella girondica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Cytinus hypocistis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Dianthus broteri';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Epidalea calamita';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Ophrys tenthredinifera';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Rhamnus alaternus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Rhamnus oleoides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Suaeda vera';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Thymus vulgaris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Artemisia barrelieri';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Calicotome spinosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Cynomorium coccineum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Erica arborea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Genista cinerea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Haplophyllum linifolium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Hemidactylus turcicus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Limonium carthaginense';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Limonium cossonianum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Limonium lobatum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Lygeum spartum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Osyris lanceolata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Prospero obtusifolium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Salsola papillosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Sideritis pusilla';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Sonchus tenerrimus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Withania frutescens';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Allium melananthum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Anabasis hispanica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Arbutus unedo';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Arthrocnemum macrostachyum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Atriplex glauca';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Blanus cinereus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Calicotome infesta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Caretta caretta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Centaurea saxicola';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Centaurium tenuiflorum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Echium sabulicola';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Eryngium ilicifolium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Filago fuscescens';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Helictotrichon filifolium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Hyparrhenia hirta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Phonus arborescens';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Polygala rupestris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Prospero autumnale';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Sarcocornia fruticosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Scorpiurus muricatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Sideritis hirsuta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Succowia balearica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Tamarix boveana';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Teucrium lanigerum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Trifolium glomeratum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Zamenis scalaris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Aphanius iberus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Atelerix algirus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Caralluma europaea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Erinaceus europaeus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Fulica atra';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Genetta genetta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Halocnemum strobilaceum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Juniperus oxycedrus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Juniperus phoenicea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Martes foina';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Maytenus senegalensis subsp. europaea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Meles meles';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Merendera filifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Mustela nivalis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Olea europaea subsp. sylvestris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Quercus rotundifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Scolopax rusticola';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Ulmus minor';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Ziziphus lotus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 171
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Larus michahellis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 108
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Larus audouinii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 99
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Himantopus himantopus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 77
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Tadorna tadorna';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 71
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Falco tinnunculus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 71
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Phoenicopterus roseus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 70
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Charadrius alexandrinus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 69
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Galerida cristata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 68
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Saxicola rubicola';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 59
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Tringa totanus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 52
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Egretta garzetta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 48
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Tringa nebularia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 39
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Fringilla coelebs';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 36
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Curruca undata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 34
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Recurvirostra avosetta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 33
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Ardea cinerea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 29
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Burhinus oedicnemus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 22
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Calidris minuta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 21
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Phalacrocorax carbo';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 20
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Actitis hypoleucos';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 20
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Thalasseus sandvicensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 19
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Anas platyrhynchos';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 19
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Lanius meridionalis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 18
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Upupa epops';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 17
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Calidris alpina';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 16
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Charadrius hiaticula';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 16
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Tringa erythropus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 15
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Falco peregrinus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 15
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Merops apiaster';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 14
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Bubulcus ibis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 13
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Larus fuscus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 13
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Oenanthe hispanica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 10
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Buteo buteo';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 10
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Motacilla flava';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 10
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Streptopelia turtur';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 9
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Gallinula chloropus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 9
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Muscicapa striata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Calidris alba';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Pluvialis squatarola';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Sterna hirundo';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Sternula albifrons';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Corvus corax';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Gallinago gallinago';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Hieraaetus pennatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Tachybaptus ruficollis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Anas crecca';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Limosa limosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Rallus aquaticus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Saxicola rubetra';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Anas acuta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Calidris pugnax';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Larus melanocephalus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Oenanthe oenanthe';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Tringa ochropus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Ardea alba';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Arenaria interpres';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Calidris ferruginea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Alcedo atthis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Charadrius dubius';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Gelochelidon nilotica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Glareola pratincola';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Jynx torquilla';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Numenius phaeopus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Phoenicurus phoenicurus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Pluvialis apricaria';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Vanellus vanellus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Acrocephalus arundinaceus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Alca torda';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Anthus spinoletta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Ardea purpurea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Asio flammeus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Calandrella brachydactyla';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Chlidonias hybrida';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Circaetus gallicus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Circus aeruginosus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Haematopus ostralegus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Limosa lapponica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Mareca penelope';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Nycticorax nycticorax';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Platalea leucorodia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Podiceps nigricollis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Riparia riparia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Spatula clypeata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Acrocephalus melanopogon';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Ardeola ralloides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Aythya ferina';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Botaurus stellaris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Calidris canutus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Chlidonias niger';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Circus cyaneus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Circus pygargus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Coracias garrulus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Coturnix coturnix';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Falco columbarius';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Ixobrychus minutus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Locustella luscinioides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Lymnocryptes minimus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Mareca strepera';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Marmaronetta angustirostris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Melanitta nigra';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Melanocorypha calandra';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Mergus serrator';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Otus scops';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Pandion haliaetus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Podiceps cristatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Porphyrio porphyrio';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Remiz pendulinus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Tringa glareola';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND hb.slug = 'matorrales-termomediterraneos-y-5330';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND hb.slug = 'zonas-subestepicas-de-6220';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND hb.slug = 'pendientes-rocosas-calcicolas-8210';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND hb.slug = 'acantilados-con-vegetacion-1240';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND hb.slug = 'bosques-de-tetraclinis-9570';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND hb.slug = 'matorrales-arborescentes-de-5220';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND hb.slug = 'encinares-de-quercus-9340';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND hb.slug = 'galerias-y-matorrales-92D0';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND hb.slug = 'pastizales-salinos-mediterraneos-1410';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND hb.slug = 'matorrales-halofilos-mediterraneos-1420';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND hb.slug = 'matorrales-halonitrofilos-pegano-1430';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND hb.slug = 'estepas-salinas-mediterraneas-1510';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND hb.slug = 'dunas-moviles-embrionarias-2110';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND hb.slug = 'dunas-moviles-de-2120';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND hb.slug = 'dunas-con-cespedes-2230';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND hb.slug = 'vegetacion-anual-sobre-1210';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND hb.slug = 'dunas-fijas-de-2210';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND hb.slug = 'prados-calcareos-carsticos-6110';

-- ── carrascoy-y-el-valle ────────────────────────────────────  363 especie(s) · 15 recinto(s)
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 255
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Sus scrofa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 189
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Vulpes vulpes';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 117
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Anthyllis cytisoides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 102
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Pinus halepensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 84
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Rhamnus lycioides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 65
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Cistus albidus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 59
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Pistacia lentiscus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 55
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Rosmarinus officinalis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 50
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Arisarum vulgare';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 42
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Lithodora fruticosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 41
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Ceratonia siliqua';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 40
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Sedum sediforme';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 38
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Cistus monspeliensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 38
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Quercus coccifera';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 36
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Rhamnus alaternus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 33
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Juniperus oxycedrus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 31
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Olea europaea subsp. europaea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 28
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Malva subovata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 27
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Sciurus vulgaris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 27
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Thymus membranaceus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 26
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Chamaerops humilis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 25
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Asparagus albus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 25
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Lapiedra martinezii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 25
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Nerium oleander';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 24
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Brachypodium retusum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 24
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Chamaeleo chamaeleon';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 24
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Quercus rotundifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 23
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Ziziphus lotus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 22
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Asparagus horridus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 22
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Teucrium pseudochamaepitys';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 21
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Thymelaea hirsuta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 20
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Arenaria montana';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 19
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Helianthemum syriacum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 19
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Smilax aspera';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 18
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Asparagus acutifolius';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 18
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Dianthus broteri';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 18
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Pelophylax perezi';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 18
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Phlomis lychnitis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 17
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Ballota hirsuta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 17
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Helichrysum stoechas';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 17
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Lonicera implexa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 17
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Ophrys fusca';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 17
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Asteriscus spinosus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 16
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Coris monspeliensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 16
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Fumana ericoides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 16
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Ruta angustifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 16
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Thymus hyemalis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 15
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Podarcis hispanicus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 14
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Convolvulus althaeoides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 14
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Coronilla juncea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 14
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Lavandula multifida';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 14
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Lobularia maritima';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 14
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Ophrys speculum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 14
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Ophrys tenthredinifera';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 14
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Ovis aries';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 14
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Thymus vulgaris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 13
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Globularia alypum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 13
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Rubia peregrina';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 13
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Viola arborescens';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 13
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Withania frutescens';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 12
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Bituminaria bituminosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 12
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Bupleurum gibraltarium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 12
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Echium creticum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 12
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Lotus dorycnium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 11
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Polygala rupestris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 11
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Sarcocapnos enneaphylla';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 11
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Tarentola mauritanica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 10
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Asplenium ceterach';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 10
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Clematis flammula';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 10
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Himantoglossum robertianum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 10
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Lafuentea rotundifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 10
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Lathyrus clymenum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 10
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Moraea sisyrinchium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 10
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Psammodromus algirus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 10
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Scrophularia tanacetifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 10
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Teucrium capitatum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 9
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Arbutus unedo';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 9
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Carex halleriana';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 9
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Cistus clusii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 9
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Daphne gnidium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 9
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Euphorbia serrata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 9
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Myrtus communis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 9
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Oeosporangium pteridioides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 9
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Phonus arborescens';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 9
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Sedum dasyphyllum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 9
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Sideritis leucantha';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Celtis australis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Ephedra fragilis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Eryngium campestre';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Macrochloa tenacissima';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Paronychia capitata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Phagnalon saxatile';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Satureja cuneifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Thapsia villosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Andryala ragusina';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Atractylis humilis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Capparis spinosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Chaenorhinum origanifolium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Cistus salviifolius';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Haplophyllum linifolium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Helianthemum cinereum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Helictotrichon filifolium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Melica minuta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Ononis natrix';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Phagnalon rupestre';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Phillyrea angustifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Teucrium carolipaui';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Ajuga iva';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Convolvulus lanuginosus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Cosentinia vellea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Cuscuta epithymum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Hyoscyamus albus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Lathyrus cicera';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Lomelosia stellata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Ononis minutissima';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Polypodium cambricum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Selaginella denticulata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Silene latifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Thymus zygis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Umbilicus horizontalis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Zygophyllum fabago';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Achillea odorata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Campanula erinus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Carthamus lanatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Centaurea aspera';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Diplotaxis harra';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Dittrichia viscosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Geranium purpureum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Geranium rotundifolium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Gladiolus communis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Helianthemum almeriense';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Malva multiflora';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Misopates orontium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Natrix maura';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Oloptum miliaceum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Ononis tridentata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Poterium ancistroides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Quercus ilex';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Santolina viscosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Sonchus tenerrimus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Stipa capensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Teucrium libanitis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Teucrium ronnigeri';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Thapsia tenuifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Valantia hispida';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Acanthodactylus erythrurus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Allium moschatum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Asphodelus cerasifer';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Capra pyrenaica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Cistanche phelypaea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Dactylis glomerata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Digitalis obscura';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Dipcadi serotinum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Ecballium elaterium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Epidalea calamita';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Euphorbia characias';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Fagonia cretica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Filago pyramidata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Fumana thymifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Haplophyllum rosmarinifolium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Helianthemum violaceum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Hypericum perforatum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Klasea flavescens';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Lygeum spartum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Mauranthemum decipiens';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Micromeria graeca';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Narcissus deficiens';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Narcissus obsoletus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Ononis speciosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Osyris lanceolata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Pardoglossum cheirifolium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Pinus pinea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Psammodromus edwarsianus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Reichardia tingitana';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Rhodalsine geniculata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Samolus valerandi';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Scirpoides holoschoenus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Senecio malacitanus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Sideritis bourgaeana';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Silene secundiflora';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Trachelium caeruleum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Umbilicus rupestris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Adiantum capillus-veneris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Artemisia barrelieri';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Asplenium onopteris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Bellardia trixago';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Brachychiton populneus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Centaurea melitensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Centranthus calcitrapae';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Cephalanthera longifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Cistus ladanifer';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Colutea atlantica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Coronella girondica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Coronilla minima';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Echinops ritro';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Euphorbia squamigera';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Ferula communis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Fraxinus angustifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Galium glaucum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Genista cinerea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Genista pseudopilosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Geranium molle';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Gladiolus italicus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Helianthemum apenninum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Helianthemum salicifolium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Helictochloa murcica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Hemorrhois hippocrepis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Hippocrepis ciliata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Launaea pumila';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Malva neglecta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Misopates microcarpum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Moricandia arvensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Moricandia moricandioides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Narcissus serotinus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Neatostema apulum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Onobrychis humilis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Onopordum macracanthum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Ophrys apifera';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Orchis anthropophora';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Oryctolagus cuniculus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Osyris quadripartita';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Parietaria lusitanica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Paronychia argentea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Peganum harmala';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Phillyrea latifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Pistacia terebinthus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Rhamnus oleoides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Thesium humifusum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Timon nevadensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Trifolium campestre';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Tripodion tetraphyllum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Urospermum picroides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Valantia muralis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Verbascum sinuatum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Vicia hybrida';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Vicia lutea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Zamenis scalaris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Achnatherum parviflorum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Argyrolobium zanonii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Aristida adscensionis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Asparagus arborescens';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Biscutella sempervirens';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Biscutella valentina';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Bromus rubens';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Bufo spinosus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Bupleurum fruticosum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Calendula arvensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Carduus bourgeanus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Carrichtera annua';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Centaurea saxicola';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Centaurea seridis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Cistus atriplicifolius';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Cistus libanotis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Coronilla scorpioides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Crataegus monogyna';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Cynanchica aristata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Dianthus pungens';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Echium sabulicola';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Erinaceus europaeus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Eruca vesicaria';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Fumana laevipes';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Fumana laevis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Gagea durieui';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Galium lucidum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Galium setaceum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Galium verrucosum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Glaucium corniculatum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Herniaria fruticosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Hypericum ericoides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Lamarckia aurea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Lathyrus setifolius';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Limonium echioides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Lysimachia linum-stellatum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Medicago minima';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Melica ciliata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Mercurialis annua';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Ononis ornithopodioides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Ophrys sphegodes';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Orchis olbiensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Papaver dubium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Papaver rhoeas';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Plantago lagopus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Prospero autumnale';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Retama sphaerocarpa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Rumex bucephalophorus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Ruscus aculeatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Scorpiurus muricatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Scorzonera angustifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Sherardia arvensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Staehelina dubia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Stipa offneri';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Thymelaea tartonraira';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Trifolium scabrum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Ulmus minor';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Andryala integrifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Asphodelus albus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Asphodelus macrocarpus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Cephalanthera rubra';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Chaenorhinum grandiflorum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Chaenorhinum rupestre';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Cheirolophus intybaceus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Eryngium ilicifolium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Galium murale';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Geranium lucidum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Guiraoa arvensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Gypsophila struthium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Halocnemum strobilaceum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Helianthemum squamatum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Hemidactylus turcicus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Hyparrhenia hirta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Juniperus phoenicea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Mauremys leprosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Osyris alba';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Saccharum ravennae';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Senecio flavus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Tamarix boveana';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Teucrium buxifolium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Teucrium pumilum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Teucrium thymifolium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Timon lepidus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Viburnum tinus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 450
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Periparus ater';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 399
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Falco tinnunculus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 338
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Buteo buteo';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 309
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Streptopelia turtur';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 297
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Caprimulgus ruficollis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 289
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Galerida cristata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 251
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Upupa epops';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 214
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Merops apiaster';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 185
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Lanius meridionalis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 181
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Curruca undata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 180
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Loxia curvirostra';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 174
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Hieraaetus pennatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 154
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Muscicapa striata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 126
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Oenanthe leucura';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 102
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Pyrrhocorax pyrrhocorax';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 100
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Oenanthe hispanica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 96
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Galerida theklae';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 88
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Circaetus gallicus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 86
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Otus scops';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 76
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Burhinus oedicnemus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 69
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Saxicola rubicola';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 57
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Falco peregrinus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 49
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Coracias garrulus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 44
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Aquila chrysaetos';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 27
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Troglodytes troglodytes';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 25
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Aquila fasciata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 22
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Lullula arborea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 22
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Pernis apivorus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 21
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Bubo bubo';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 19
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Oenanthe oenanthe';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 18
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Curruca conspicillata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 13
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Circus aeruginosus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 12
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Milvus migrans';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 11
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Falco subbuteo';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 9
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Calandrella brachydactyla';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Curruca cantillans';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Turdus torquatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Anthus campestris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Coturnix coturnix';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Circus pygargus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Gyps fulvus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Tichodroma muraria';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'carrascoy-y-el-valle' AND hb.slug = 'matorrales-termomediterraneos-y-5330';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'carrascoy-y-el-valle' AND hb.slug = 'pendientes-rocosas-calcicolas-8210';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'carrascoy-y-el-valle' AND hb.slug = 'zonas-subestepicas-de-6220';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'carrascoy-y-el-valle' AND hb.slug = 'pastizales-salinos-mediterraneos-1410';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'carrascoy-y-el-valle' AND hb.slug = 'galerias-y-matorrales-92D0';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'carrascoy-y-el-valle' AND hb.slug = 'vegetacion-gipsicola-iberica-1520';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'carrascoy-y-el-valle' AND hb.slug = 'aguas-oligomesotroficas-calcareas-3140';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'carrascoy-y-el-valle' AND hb.slug = 'estanques-temporales-mediterraneos-3170';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'carrascoy-y-el-valle' AND hb.slug = 'rios-mediterraneos-de-3280';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'carrascoy-y-el-valle' AND hb.slug = 'prados-humedos-mediterraneos-6420';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'carrascoy-y-el-valle' AND hb.slug = 'prados-calcareos-carsticos-6110';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'carrascoy-y-el-valle' AND hb.slug = 'manantiales-petrificantes-con-7220';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'carrascoy-y-el-valle' AND hb.slug = 'encinares-de-quercus-9340';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'carrascoy-y-el-valle' AND hb.slug = 'rios-mediterraneos-de-3250';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'carrascoy-y-el-valle' AND hb.slug = 'matorrales-arborescentes-de-5210';

-- ── cuatro-calas ────────────────────────────────────────────  93 especie(s) · 7 recinto(s)
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 33
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Launaea arborescens';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 20
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Salsola oppositifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 17
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Thymelaea hirsuta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 15
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Zygophyllum fabago';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 14
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Periploca angustifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 11
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Suaeda vera';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 11
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Lycium intricatum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 10
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Limonium insigne';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 9
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Helianthemum motae';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 9
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Cakile maritima';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Asteriscus maritimus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Lygeum spartum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Helianthemum almeriense';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Acanthodactylus erythrurus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Salsola papillosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Halocnemum strobilaceum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Macrochloa tenacissima';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Arthrocnemum macrostachyum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Frankenia corymbosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Teucrium lanigerum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Bupleurum semicompositum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Lotus creticus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Anabasis hispanica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Asparagus horridus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Pancratium maritimum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Rosmarinus officinalis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Limonium lobatum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Reichardia tingitana';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Cynomorium coccineum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Mesembryanthemum nodiflorum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Salsola kali';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Pseudorlaya pumila';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Filago mareotica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Genista umbellata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Carrichtera annua';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Fagonia cretica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Fumana ericoides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Sedum sediforme';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Lavandula dentata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Cistus clusii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Anthyllis terniflora';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Salsola genistoides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Mesembryanthemum crystallinum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Squilla maritima';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Atriplex glauca';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Sonchus tenerrimus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Hyparrhenia hirta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Stipa capensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Lysimachia arvensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Brachypodium retusum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Atriplex halimus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Silene ramosissima';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Crucianella maritima';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Olea europaea subsp. europaea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Anthyllis cytisoides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Artemisia barrelieri';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Limonium echioides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Convolvulus althaeoides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Limonium cossonianum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Suaeda maritima';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Frankenia pulverulenta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Tamarix gallica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Ammochloa palaestina';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Allium subvillosum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Ceratonia siliqua';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Reichardia gaditana';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Chalcides bedriagai';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Helianthemum viscarium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Eryngium ilicifolium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Aizoanthemopsis hispanica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Crassula tillaea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Erodium sanguis-christi';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Sphenopus divaricatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Ephedra fragilis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Withania frutescens';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Sternula albifrons';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 36
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Alca torda';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Calonectris diomedea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Chlidonias niger';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Hydrobates pelagicus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Larus audouinii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 11
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Larus fuscus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Larus melanocephalus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 144
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Chroicocephalus ridibundus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 48
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Morus bassanus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Stercorarius parasiticus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Stercorarius pomarinus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Sterna hirundo';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 81
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Thalasseus sandvicensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 9
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Puffinus mauretanicus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Stercorarius skua';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 331
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Larus michahellis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Calonectris borealis';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'cuatro-calas' AND hb.slug = 'matorrales-halofilos-mediterraneos-1420';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'cuatro-calas' AND hb.slug = 'matorrales-halonitrofilos-pegano-1430';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'cuatro-calas' AND hb.slug = 'estepas-salinas-mediterraneas-1510';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'cuatro-calas' AND hb.slug = 'zonas-subestepicas-de-6220';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'cuatro-calas' AND hb.slug = 'galerias-y-matorrales-92D0';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'cuatro-calas' AND hb.slug = 'matorrales-termomediterraneos-y-5330';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'cuatro-calas' AND hb.slug = 'matorrales-arborescentes-de-5220';

-- ── espacios-abiertos-e-islas-del-mar-menor ─────────────────  250 especie(s) · 19 recinto(s)
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 13
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Lycium intricatum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Withania frutescens';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Chamaerops humilis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Lygeum spartum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Arthrocnemum macrostachyum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Periploca angustifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Acanthodactylus erythrurus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Lavandula multifida';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Suaeda vera';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Atriplex glauca';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Cosentinia vellea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Gymnosporia senegalensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Limonium caesium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Rhamnus alaternus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Scorpiurus muricatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Sedum sediforme';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Asparagus macrorrhizus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Cakile maritima';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Centaurea seridis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Cynomorium coccineum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Echinophora spinosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Echium sabulicola';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Helianthemum almeriense';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Hyparrhenia hirta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Lapiedra martinezii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Lathyrus clymenum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Limonium insigne';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Natrix maura';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Plantago crassifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Psammodromus algirus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Suaeda spicata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Tetraclinis articulata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Teucrium carthaginense';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Teucrium dunense';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Ziziphus lotus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Asplenium obovatum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Cressa cretica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Epidalea calamita';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Eryngium ilicifolium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Frankenia corymbosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Hemidactylus turcicus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Hippocampus guttulatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Hymenolobus procumbens';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Juniperus phoenicea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Launaea fragilis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Limonium cossonianum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Osyris lanceolata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Platycapnos tenuiloba';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Polypodium cambricum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Prospero autumnale';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Prospero obtusifolium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Ranunculus bullatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Rhamnus oleoides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Sarcocornia fruticosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Sideritis pusilla';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Sonchus tenerrimus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Tamarix africana';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Tamarix boveana';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Thymus vulgaris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Alca torda';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Allium melananthum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Ammochloa palaestina';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Anabasis hispanica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Anas strepera';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Aphanius iberus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Artemisia gallica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Asplenium billotii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Atelerix algirus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Botaurus stellaris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Capparis zoharyi';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Caralluma europaea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Cecropis daurica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Centaurea saxicola';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Chalcides bedriagai';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Clematis cirrhosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Curruca cantillans';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Eptesicus isabellinus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Halocnemum strobilaceum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Hemorrhois hippocrepis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Ixobrychus minutus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Juniperus turbinata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Lafuentea rotundifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Launaea lanifera';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Maytenus senegalensis subsp. europaea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Merendera filifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Miniopterus schreibersii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Myotis capaccinii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Oeosporangium pteridioides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Pipistrellus pipistrellus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Pipistrellus pygmaeus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Poterium ancistroides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Psammodromus edwarsianus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Salsola papillosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Scilla autumnalis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Tadarida teniotis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Tamarix canariensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Tarentola mauritanica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Teucrium freynii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Timon lepidus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Zamenis scalaris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1382
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Larus michahellis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1188
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Egretta garzetta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1065
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Ardea cinerea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1059
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Phoenicopterus roseus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 994
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Chroicocephalus genei';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 958
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Himantopus himantopus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 897
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Tadorna tadorna';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 822
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Curruca melanocephala';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 789
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Galerida cristata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 771
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Charadrius hiaticula';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 764
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Cisticola juncidis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 742
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Charadrius alexandrinus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 739
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Falco tinnunculus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 684
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Tringa nebularia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 640
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Hirundo rustica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 638
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Chroicocephalus ridibundus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 635
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Columba palumbus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 601
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Circus aeruginosus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 598
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Saxicola rubicola';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 574
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Thalasseus sandvicensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 567
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Phalacrocorax carbo';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 533
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Recurvirostra avosetta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 530
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Arenaria interpres';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 499
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Calidris alpina';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 494
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Turdus merula';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 493
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Anas platyrhynchos';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 490
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Motacilla alba';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 460
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Larus audouinii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 455
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Tringa totanus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 446
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Podiceps cristatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 441
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Anthus pratensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 416
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Pluvialis squatarola';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 380
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Sternula albifrons';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 374
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Bubulcus ibis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 358
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Linaria cannabina';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 346
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Lanius meridionalis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 333
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Phylloscopus collybita';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 315
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Burhinus oedicnemus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 314
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Ardea alba';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 303
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Apus apus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 302
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Delichon urbicum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 265
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Podiceps nigricollis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 259
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Phoenicurus ochruros';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 257
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Calidris minuta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 243
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Glareola pratincola';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 231
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Numenius arquata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 221
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Sterna hirundo';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 218
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Actitis hypoleucos';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 215
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Erithacus rubecula';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 211
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Gallinula chloropus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 208
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Hieraaetus pennatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 179
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Motacilla flava';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 179
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Platalea leucorodia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 179
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Ptyonoprogne rupestris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 155
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Upupa epops';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 152
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Calidris alba';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 146
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Anthus spinoletta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 144
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Cettia cetti';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 143
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Calidris ferruginea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 133
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Alcedo atthis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 130
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Numenius phaeopus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 118
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Pluvialis apricaria';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 118
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Streptopelia turtur';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 118
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Tringa erythropus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 108
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Gelochelidon nilotica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 106
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Gallinago gallinago';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 104
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Circus pygargus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 93
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Sturnus vulgaris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 93
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Tringa ochropus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 89
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Fulica atra';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 86
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Haematopus ostralegus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 82
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Tringa glareola';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 80
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Muscicapa striata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 79
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Acrocephalus scirpaceus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 75
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Buteo buteo';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 75
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Luscinia svecica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 74
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Phylloscopus trochilus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 72
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Calidris pugnax';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 69
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Lanius senator';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 67
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Larus melanocephalus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 66
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Ficedula hypoleuca';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 66
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Merops apiaster';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 63
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Limosa limosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 61
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Tachybaptus ruficollis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 60
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Calandrella brachydactyla';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 57
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Emberiza schoeniclus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 57
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Nycticorax nycticorax';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 57
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Pandion haliaetus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 54
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Curruca undata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 49
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Limosa lapponica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 48
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Fringilla coelebs';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 45
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Rallus aquaticus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 45
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Saxicola rubetra';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 43
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Oenanthe oenanthe';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 43
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Phoenicurus phoenicurus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 43
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Spatula clypeata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 41
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Sylvia atricapilla';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 39
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Athene noctua';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 39
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Chlidonias niger';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 36
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Larus fuscus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 36
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Turdus philomelos';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 35
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Ardea purpurea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 35
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Luscinia megarhynchos';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 34
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Riparia riparia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 32
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Ardeola ralloides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 32
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Picus sharpei';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 32
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Tachymarptis melba';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 31
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Curruca communis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 30
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Lymnocryptes minimus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 29
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Calandrella rufescens';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 24
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Acrocephalus arundinaceus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 24
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Aythya ferina';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 22
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Calidris canutus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 21
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Coracias garrulus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 21
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Falco peregrinus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 19
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Calidris temminckii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 19
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Corvus monedula';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 19
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Porphyrio porphyrio';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 18
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Spinus spinus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 17
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Melanitta nigra';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 17
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Mergus serrator';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 17
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Motacilla cinerea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 17
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Vanellus vanellus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 16
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Anas crecca';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 15
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Anas acuta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 15
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Coturnix coturnix';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 14
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Chlidonias hybrida';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 12
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Asio flammeus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 12
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Circaetus gallicus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 12
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Oenanthe hispanica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 10
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Falco columbarius';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 10
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Mareca penelope';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 10
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Tyto alba';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Circus cyaneus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Remiz pendulinus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Marmaronetta angustirostris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Melanocorypha calandra';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Clamator glandarius';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Hippolais polyglotta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Sylvia borin';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Curruca conspicillata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Jynx torquilla';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Acrocephalus melanopogon';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Mareca strepera';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Oenanthe leucura';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Turdus viscivorus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Charadrius dubius';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Otus scops';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Turdus pilaris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Locustella luscinioides';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND hb.slug = 'acantilados-con-vegetacion-1240';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND hb.slug = 'pastizales-salinos-mediterraneos-1410';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND hb.slug = 'matorrales-halofilos-mediterraneos-1420';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND hb.slug = 'estepas-salinas-mediterraneas-1510';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND hb.slug = 'dunas-con-vegetacion-2260';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND hb.slug = 'galerias-y-matorrales-92D0';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND hb.slug = 'matorrales-halonitrofilos-pegano-1430';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND hb.slug = 'matorrales-termomediterraneos-y-5330';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND hb.slug = 'pendientes-rocosas-siliceas-8220';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND hb.slug = 'matorrales-arborescentes-de-5220';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND hb.slug = 'vegetacion-anual-sobre-1210';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND hb.slug = 'dunas-moviles-embrionarias-2110';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND hb.slug = 'zonas-subestepicas-de-6220';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND hb.slug = 'prados-calcareos-carsticos-6110';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND hb.slug = 'pendientes-rocosas-calcicolas-8210';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND hb.slug = 'bosques-de-tetraclinis-9570';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND hb.slug = 'dunas-con-cespedes-2230';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND hb.slug = 'dunas-moviles-de-2120';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND hb.slug = 'dunas-fijas-de-2210';

-- ── humedal-del-ajauque-y-rambla-salada ─────────────────────  183 especie(s) · 10 recinto(s)
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Sedum sediforme';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Arthrocnemum macrostachyum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Pinus halepensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Sarcocornia fruticosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Suaeda vera';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Acanthodactylus erythrurus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Frankenia corymbosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Lycium intricatum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Tamarix boveana';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Anabasis hispanica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Artemisia barrelieri';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Launaea lanifera';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Limonium caesium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Osyris lanceolata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Periploca angustifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Psammodromus algirus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Tarentola mauritanica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Teucrium carolipaui';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Teucrium freynii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Withania frutescens';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Aphanius iberus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Argyrolobium uniflorum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Atelerix algirus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Chamaerops humilis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Cynomorium coccineum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Epidalea calamita';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Eptesicus isabellinus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Genetta genetta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Halocnemum strobilaceum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Hemorrhois hippocrepis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Limonium cossonianum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Malpolon monspessulanus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Meles meles';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Miniopterus schreibersii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Myotis blythii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Myotis capaccinii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Myotis myotis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Natrix maura';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Pelobates cultripes';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Pelophylax perezi';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Pipistrellus kuhlii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Pipistrellus pipistrellus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Pipistrellus pygmaeus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Podarcis hispanicus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Psammodromus hispanicus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Tadarida teniotis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Tamarix canariensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Teucrium libanitis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Timon lepidus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Zamenis scalaris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 215
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Curruca melanocephala';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 213
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Himantopus himantopus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 178
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Tadorna tadorna';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 171
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Burhinus oedicnemus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 149
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Motacilla alba';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 148
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Anas platyrhynchos';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 140
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Falco tinnunculus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 137
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Circus aeruginosus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 129
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Lanius meridionalis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 115
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Tringa ochropus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 113
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Galerida cristata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 109
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Gallinula chloropus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 105
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Hirundo rustica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 98
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Cettia cetti';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 96
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Phylloscopus collybita';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 93
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Egretta garzetta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 93
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Saxicola rubicola';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 86
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Merops apiaster';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 85
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Picus sharpei';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 83
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Phalacrocorax carbo';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 77
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Bubulcus ibis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 77
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Linaria cannabina';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 76
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Tringa nebularia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 74
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Phoenicurus ochruros';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 70
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Ardea cinerea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 64
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Anthus pratensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 63
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Apus apus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 63
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Athene noctua';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 62
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Delichon urbicum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 58
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Actitis hypoleucos';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 58
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Upupa epops';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 54
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Sturnus vulgaris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 54
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Tachybaptus ruficollis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 52
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Erithacus rubecula';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 50
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Fulica atra';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 48
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Fringilla coelebs';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 47
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Podiceps nigricollis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 44
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Aythya ferina';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 44
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Curruca undata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 40
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Oxyura leucocephala';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 35
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Circus cyaneus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 34
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Sylvia atricapilla';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 32
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Recurvirostra avosetta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 31
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Accipiter nisus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 29
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Anas crecca';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 28
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Chroicocephalus ridibundus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 28
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Coracias garrulus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 27
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Acrocephalus scirpaceus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 27
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Cisticola juncidis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 26
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Spatula clypeata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 25
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Larus michahellis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 23
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Bubo bubo';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 23
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Phoenicopterus roseus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 23
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Podiceps cristatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 23
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Streptopelia turtur';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 22
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Gallinago gallinago';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 22
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Plegadis falcinellus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 19
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Clamator glandarius';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 19
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Lanius senator';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 18
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Buteo buteo';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 18
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Turdus philomelos';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 17
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Elanus caeruleus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 17
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Luscinia megarhynchos';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 16
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Ptyonoprogne rupestris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 15
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Rallus aquaticus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 14
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Alcedo atthis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 14
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Parus major';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 13
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Charadrius dubius';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 12
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Circus pygargus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 12
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Emberiza schoeniclus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 12
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Netta rufina';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 11
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Cuculus canorus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 10
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Gelochelidon nilotica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 10
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Luscinia svecica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 9
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Acrocephalus arundinaceus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 9
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Charadrius hiaticula';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 9
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Curruca conspicillata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Columba oenas';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Riparia riparia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Tringa totanus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Vanellus vanellus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Saxicola rubetra';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Tachymarptis melba';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Calidris alpina';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Hippolais polyglotta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Motacilla cinerea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Oenanthe hispanica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Turdus viscivorus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Calandrella rufescens';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Charadrius alexandrinus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Falco columbarius';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Monticola solitarius';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Calidris minuta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Jynx torquilla';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Mareca penelope';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Prunella modularis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Spatula querquedula';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Sterna hirundo';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Aegithalos caudatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Anas acuta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Calandrella brachydactyla';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Corvus corax';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Falco peregrinus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Ficedula hypoleuca';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Oenanthe leucura';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Pandion haliaetus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Phylloscopus trochilus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Aythya fuligula';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Calidris ferruginea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Cercotrichas galactotes';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Motacilla flava';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Muscicapa striata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Oenanthe oenanthe';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Remiz pendulinus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Spinus spinus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Sternula albifrons';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Sylvia borin';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Arenaria interpres';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Aythya nyroca';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Cecropis daurica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Chlidonias hybrida';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Curruca cantillans';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Curruca communis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Ixobrychus minutus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Larus fuscus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Locustella luscinioides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Marmaronetta angustirostris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Petronia petronia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Phoenicopterus ruber';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Phoenicurus phoenicurus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Pluvialis squatarola';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Tringa glareola';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Tyto alba';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND hb.slug = 'pastizales-salinos-mediterraneos-1410';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND hb.slug = 'matorrales-halofilos-mediterraneos-1420';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND hb.slug = 'estepas-salinas-mediterraneas-1510';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND hb.slug = 'rios-mediterraneos-de-3280';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND hb.slug = 'galerias-y-matorrales-92D0';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND hb.slug = 'matorrales-termomediterraneos-y-5330';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND hb.slug = 'matorrales-halonitrofilos-pegano-1430';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND hb.slug = 'vegetacion-gipsicola-iberica-1520';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND hb.slug = 'prados-calcareos-carsticos-6110';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND hb.slug = 'pendientes-rocosas-calcicolas-8210';

-- ── monte-arabi ─────────────────────────────────────────────  68 especie(s) · 2 recinto(s)
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 45
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Sus scrofa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 40
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Vulpes vulpes';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Juniperus oxycedrus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Capra pyrenaica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Cistus albidus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Quercus coccifera';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Pinus halepensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Pistacia lentiscus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Rosmarinus officinalis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Cistus clusii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Quercus rotundifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Rhamnus oleoides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Sarcocapnos enneaphylla';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Anthyllis cytisoides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Anthyllis lagascana';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Arbutus unedo';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Fritillaria lusitanica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Psammodromus algirus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Rhamnus alaternus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Sedum dasyphyllum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Teucrium franchetianum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Thymelaea tartonraira';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 12
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Pyrrhocorax pyrrhocorax';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Curruca melanocephala';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Serinus serinus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Turdus merula';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Turdus viscivorus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Carduelis carduelis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Fringilla coelebs';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Lophophanes cristatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Columba palumbus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Garrulus glandarius';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Loxia curvirostra';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Parus major';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Linaria cannabina';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Phoenicurus ochruros';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Aegithalos caudatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Buteo buteo';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Chloris chloris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Columba oenas';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Erithacus rubecula';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Falco tinnunculus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Motacilla alba';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Periparus ater';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Picus sharpei';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Regulus ignicapilla';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Saxicola rubicola';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Curruca undata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Aquila chrysaetos';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Athene noctua';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Galerida theklae';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Ptyonoprogne rupestris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Sturnus unicolor';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Alauda arvensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Bubo bubo';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Burhinus oedicnemus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Emberiza cia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Lanius meridionalis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Oenanthe leucura';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Upupa epops';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Accipiter nisus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Certhia brachydactyla';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Clamator glandarius';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Corvus corax';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Lullula arborea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Monticola solitarius';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Prunella collaris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Troglodytes troglodytes';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'monte-arabi' AND hb.slug = 'matorrales-termomediterraneos-y-5330';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'monte-arabi' AND hb.slug = 'pendientes-rocosas-calcicolas-8210';

-- ── salinas-arenales-san-pedro-pinatar ──────────────────────  354 especie(s) · 15 recinto(s)
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 73
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Chamaeleo chamaeleon';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 27
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Acanthodactylus erythrurus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 18
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Pancratium maritimum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 17
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Sarcocornia fruticosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 16
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Thymelaea hirsuta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 15
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Juniperus phoenicea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 15
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Pinus halepensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 15
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Pistacia lentiscus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 14
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Helianthemum marminorense';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 14
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Lygeum spartum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 13
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Lycium intricatum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 12
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Schoenus nigricans';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Arthrocnemum macrostachyum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Asparagus horridus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Cakile maritima';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Cynanchum acutum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Eryngium maritimum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Lobularia maritima';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Lotus creticus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Mesembryanthemum nodiflorum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Teucrium dunense';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Lagurus ovatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Posidonia oceanica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Psammodromus algirus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Salsola kali';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Cynomorium coccineum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Echium sabulicola';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Launaea fragilis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Silene ramosissima';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Suaeda vera';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Crithmum maritimum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Dittrichia viscosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Zygophyllum fabago';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Centaurea seridis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Cistanche phelypaea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Helianthemum violaceum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Helichrysum stoechas';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Ifloga spicata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Juncus acutus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Maresia nana';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Asparagus macrorrhizus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Asphodelus fistulosus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Atriplex glauca';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Erodium laciniatum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Halimione portulacoides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Juniperus oxycedrus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Ononis ramosissima';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Phragmites australis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Plantago albicans';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Pseudorlaya pumila';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Ruppia cirrhosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Aristolochia baetica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Atriplex rosea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Calendula arvensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Calystegia soldanella';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Catapodium hemipoa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Centaurea aspera';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Chalcides bedriagai';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Coronella girondica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Corynephorus divaricatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Crucianella maritima';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Cyperus capitatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Cytinus hypocistis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Euphorbia terracina';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Helianthemum almeriense';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Hemidactylus turcicus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Limonium cossonianum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Limonium echioides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Loeflingia hispanica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Malpolon monspessulanus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Malva parviflora';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Myrtus communis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Natrix maura';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Ononis natrix';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Parapholis incurva';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Paronychia suffruticosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Periploca angustifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Plantago coronopus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Polygonum maritimum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Rostraria salzmannii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Ruppia maritima';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Salvia verbenaca';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Scirpoides holoschoenus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Senecio glaucus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Senecio vulgaris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Sonchus oleraceus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Sporobolus pungens';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Stipa capensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Suaeda spicata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Tarentola mauritanica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Urospermum picroides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Zostera marina';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Aetheorhiza bulbosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Ajuga iva';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Allium sphaerocephalon';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Allium subhirsutum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Ammophila arenaria subsp. arundinacea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Anacyclus clavatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Anguilla anguilla';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Aphanius iberus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Atelerix algirus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Atriplex halimus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Atriplex prostrata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Avena barbata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Bassia hyssopifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Beta maritima';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Blackstonia perfoliata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Blanus cinereus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Brachypodium distachyon';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Brachypodium phoenicoides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Brassica tournefortii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Bromus diandrus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Bromus madritensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Bromus rigidus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Bromus rubens';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Bupleurum semicompositum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Carrichtera annua';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Centaurea melitensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Centaurium erythraea subsp. majus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Ceratonia siliqua';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Cercotrichas galactotes';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Chenopodium murale';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Convolvulus althaeoides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Crassula tillaea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Crocidura russula';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Cuscuta epithymum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Cutandia maritima';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Cutandia memphitica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Cymodocea nodosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Cynodon dactylon';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Dactylis glomerata subsp. hispanica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Daphne gnidium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Dipcadi serotinum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Dorycnium pentaphyllum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Echinophora spinosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Elymus elongatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Elymus farctus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Emex spinosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Eptesicus isabellinus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Erodium malacoides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Erodium neuradifolium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Eruca vesicaria';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Fagonia cretica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Filago mareotica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Filago pyramidata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Frankenia corymbosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Frankenia pulverulenta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Fumana hispidula';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Glaucium flavum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Halocnemum strobilaceum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Hemorrhois hippocrepis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Hordeum marinum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Hordeum murinum subsp. leporinum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Hymenolobus procumbens';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Hyparrhenia sinaica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Imperata cylindrica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Juncus bufonius';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Juncus maritimus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Juniperus turbinata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Launaea arborescens';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Lepidium draba';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Limonium angustebracteatum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Limonium caesium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Limonium delicatulum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Limonium supinum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Limonium virgatum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Linum maritimum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Linum strictum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Lobularia libyca';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Medicago littoralis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Medicago marina';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Miniopterus schreibersii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Moricandia arvensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Muscari neglectum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Myotis capaccinii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Myotis myotis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Olea europaea subsp. europaea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Ophrys speculum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Orobanche ramosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Panicum repens';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Parapholis filiformis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Paronychia capitata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Phagnalon rupestre';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Phagnalon saxatile';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Phillyrea angustifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Phylloscopus trochiloides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Pinus pinea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Pipistrellus kuhlii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Pipistrellus pipistrellus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Pipistrellus pygmaeus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Plantago crassifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Plantago lagopus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Podarcis hispanica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Polycarpon tetraphyllum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Polypogon maritimus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Psammodromus edwarsianus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Rapistrum rugosum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Reichardia gaditana';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Reichardia picroides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Rhamnus oleoides subsp. angustifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Rhinolophus euryale';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Rhinolophus ferrumequinum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Rosmarinus officinalis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Rubia peregrina';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Ruta angustifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Saccharum ravennae';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Sagina maritima';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Salicornia emerici';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Salicornia patula';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Sarcocornia perennis subsp. alpini';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Schismus barbatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Scorpiurus sulcatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Sedum sediforme';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Senecio malacitanus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Silene sclerocarpa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Sisymbrium irio';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Solanum nigrum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Sonchus tenerrimus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Spergularia bocconei';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Spergularia media';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Suaeda pruinosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Suncus etruscus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Tamarix boveana';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Tamarix canariensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Teucrium capitatum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Thesium humile';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Timon lepidus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Triplachne nitens';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Urtica urens';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Vulpia membranacea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2203
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Phoenicopterus roseus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1927
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Himantopus himantopus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1775
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Larus michahellis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1632
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Recurvirostra avosetta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1507
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Egretta garzetta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1454
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Chroicocephalus genei';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1333
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Tadorna tadorna';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1163
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Podiceps nigricollis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1101
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Chroicocephalus ridibundus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1023
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Charadrius alexandrinus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 999
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Calidris pugnax';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 970
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Passer domesticus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 926
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Larus audouinii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 921
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Calidris alba';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 905
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Hirundo rustica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 884
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Calidris alpina';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 881
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Arenaria interpres';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 873
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Sternula albifrons';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 863
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Calidris minuta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 811
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Tringa totanus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 783
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Ardea cinerea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 782
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Thalasseus sandvicensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 763
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Columba palumbus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 752
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Charadrius hiaticula';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 750
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Galerida cristata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 719
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Limosa limosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 697
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Gallinula chloropus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 644
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Sterna hirundo';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 615
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Phalacrocorax carbo';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 571
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Saxicola rubicola';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 560
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Motacilla alba';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 554
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Turdus merula';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 438
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Sturnus unicolor';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 412
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Actitis hypoleucos';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 340
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Falco tinnunculus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 304
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Carduelis carduelis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 300
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Tringa nebularia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 296
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Apus apus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 294
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Burhinus oedicnemus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 279
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Phoenicurus ochruros';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 278
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Tringa erythropus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 253
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Acrocephalus scirpaceus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 253
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Alcedo atthis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 252
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Anthus pratensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 247
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Lanius meridionalis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 243
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Phylloscopus collybita';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 237
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Motacilla flava';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 234
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Delichon urbicum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 227
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Apus pallidus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 221
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Pluvialis squatarola';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 207
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Gelochelidon nilotica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 204
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Riparia riparia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 186
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Cisticola juncidis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 180
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Platalea leucorodia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 170
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Larus melanocephalus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 156
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Erithacus rubecula';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 147
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Larus fuscus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 145
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Cettia cetti';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 145
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Podiceps cristatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 144
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Tachybaptus ruficollis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 141
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Upupa epops';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 140
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Alectoris rufa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 124
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Chlidonias niger';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 122
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Motacilla cinerea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 118
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Streptopelia turtur';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 117
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Limosa lapponica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 112
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Ptyonoprogne rupestris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 99
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Corvus monedula';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 84
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Gallinago gallinago';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 83
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Numenius arquata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 72
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Ardea alba';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 67
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Curruca undata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 57
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Tringa ochropus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 53
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Phalaropus lobatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 52
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Spatula clypeata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 50
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Circus aeruginosus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 49
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Haematopus ostralegus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 48
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Sylvia atricapilla';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 47
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Muscicapa striata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 45
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Oenanthe oenanthe';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 44
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Lanius senator';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 44
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Numenius phaeopus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 41
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Emberiza schoeniclus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 37
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Luscinia svecica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 36
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Acrocephalus arundinaceus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 36
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Sturnus vulgaris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 27
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Chlidonias hybrida';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 26
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Mergus serrator';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 26
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Remiz pendulinus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 24
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Aythya ferina';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 20
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Fringilla coelebs';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 19
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Ficedula hypoleuca';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 19
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Pandion haliaetus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 19
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Phylloscopus trochilus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 18
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Mareca penelope';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 16
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Anas crecca';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 13
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Calandrella brachydactyla';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 13
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Glareola pratincola';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 13
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Phoenicurus phoenicurus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 13
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Rallus aquaticus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 13
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Saxicola rubetra';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 12
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Merops apiaster';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 12
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Turdus philomelos';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 10
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Oenanthe hispanica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 10
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Tringa glareola';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Hieraaetus pennatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Tyto alba';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Charadrius dubius';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Clamator glandarius';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Curruca communis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Hippolais polyglotta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Marmaronetta angustirostris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Asio flammeus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Jynx torquilla';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Asio otus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Falco peregrinus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Ixobrychus minutus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Locustella luscinioides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Luscinia megarhynchos';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Sylvia borin';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Athene noctua';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Melanocorypha calandra';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Otus scops';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Porzana porzana';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND hb.slug = 'vegetacion-anual-sobre-1210';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND hb.slug = 'dunas-con-cespedes-2230';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND hb.slug = 'dunas-moviles-de-2120';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND hb.slug = 'dunas-moviles-embrionarias-2110';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND hb.slug = 'dunas-fijas-de-2210';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND hb.slug = 'pastizales-salinos-mediterraneos-1410';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND hb.slug = 'matorrales-halofilos-mediterraneos-1420';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND hb.slug = 'vegetacion-halonitrofila-anual-1310';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND hb.slug = 'dunas-litorales-con-2250';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND hb.slug = 'dunas-con-vegetacion-2260';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND hb.slug = 'lagunas-costeras-1150';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND hb.slug = 'acantilados-con-vegetacion-1240';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND hb.slug = 'estepas-salinas-mediterraneas-1510';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND hb.slug = 'galerias-y-matorrales-92D0';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND hb.slug = 'matorrales-halonitrofilos-pegano-1430';

-- ── sierra-de-el-carche ─────────────────────────────────────  303 especie(s) · 11 recinto(s)
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 152
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Sus scrofa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 119
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Vulpes vulpes';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 69
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Pinus halepensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 45
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Rosmarinus officinalis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 27
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Juniperus oxycedrus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 24
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Quercus rotundifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 20
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Cistus clusii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 20
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Quercus coccifera';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 18
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Arctostaphylos uva-ursi';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 18
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Pinus nigra';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 13
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Cistus albidus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 13
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Pinus pinaster';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 13
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Sedum sediforme';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 11
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Juniperus phoenicea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Marrubium vulgare';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Anthyllis cytisoides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Armeria filicaulis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Erinacea anthyllis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Arbutus unedo';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Genista versicolor';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Cistus laurifolius';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Sedum gypsicola';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Thymus moroderi';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Thymus vulgaris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Asplenium ceterach';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Asplenium quadrivalens';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Lonicera implexa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Pistacia lentiscus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Poterium ancistroides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Teucrium pseudochamaepitys';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Achnatherum paradoxum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Alyssum montanum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Arenaria grandiflora';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Asparagus horridus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Centaurea boissieri';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Conopodium thalictrifolium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Draba hispanica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Eryngium campestre';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Helianthemum apenninum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Oryctolagus cuniculus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Pelophylax perezi';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Saxifraga latepetiolata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Timon lepidus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Apodemus sylvaticus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Armeria quichiotis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Asphodelus ayardii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Asphodelus cerasifer';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Asplenium petrarchae';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Asplenium ruta-muraria';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Asplenium trichomanes';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Capra pyrenaica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Chiliadenus glutinosus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Cistus atriplicifolius';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Ziziphora acinos';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Coronella girondica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Eliomys quercinus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Erinaceus europaeus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Euphorbia serrata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Felis silvestris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Festuca indigesta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Fritillaria lusitanica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Fumana ericifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Genetta genetta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Helianthemum cinereum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Helianthemum marifolium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Helictotrichon filifolium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Hemidactylus turcicus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Iberis carnosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Lavandula latifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Lepus granatensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Martes foina';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Meles meles';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Meniocus linifolius';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Microtus duodecimcostatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Mus musculus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Mus spretus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Mustela nivalis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Natrix maura';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Natrix natrix';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Odontites viscosus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Pelodytes punctatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Phagnalon rupestre';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Phillyrea angustifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Plantago albicans';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Plantago sempervirens';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Poa flaccidula';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Psammodromus algirus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Rhamnus alaternus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Rubia peregrina';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Scabiosa turolensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Sciurus vulgaris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Sedum acre';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Sedum dasyphyllum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Seseli montanum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Suncus etruscus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Tarentola mauritanica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Teucrium homotrichum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Teucrium libanitis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Viburnum tinus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Alyssum alyssoides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Alytes obstetricans';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Ridolfia segetum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Anthyllis lagascana';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Anthyllis terniflora';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Anthyllis vulneraria';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Arabis auriculata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Arenaria leptoclados';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Arenaria montana';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Arenaria serpyllifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Armeria bourgaei';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Arrhenatherum elatius';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Artemisia campestris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Artemisia herba-alba';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Asphodelus fistulosus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Astragalus alopecuroides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Astragalus sesameus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Atractylis humilis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Brachypodium retusum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Buglossoides arvensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Bupleurum fruticescens';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Buxus sempervirens';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Calendula arvensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Camelina microcarpa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Carex halleriana';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Carrichtera annua';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Centaurea aspera';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Centaurea sicula';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Cerastium brachypetalum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Cerastium gracile';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Cerastium pumilum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Chaenorhinum crassifolium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Chamaerops humilis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Conopodium majus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Coronilla minima';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Cosentinia vellea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Cuscuta epithymum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Cytinus hypocistis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Daphne gnidium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Diplotaxis erucoides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Draba verna';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Ecballium elaterium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Echinaria capitata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Erigeron bonariensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Erodium celtibericum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Erodium ciconium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Erodium cicutarium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Eruca vesicaria';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Euphorbia characias';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Euphorbia nicaeensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Festuca capillifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Festuca hystrix';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Fumana ericoides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Fumana laevipes';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Fumaria parviflora';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Genista scorpius';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Geranium purpureum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Geranium rotundifolium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Haplophyllum rosmarinifolium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Helianthemum hirtum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Helianthemum squamatum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Helianthemum syriacum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Helianthemum violaceum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Helichrysum serotinum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Helichrysum stoechas';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Helictochloa bromoides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Hirschfeldia incana';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Hornungia petraea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Hypecoum procumbens';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Hypericum perforatum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Iberis ciliata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Jurinea humilis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Kickxia lanigera';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Kickxia spuria';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Lathyrus cicera';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Lavandula multifida';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Lepidium draba';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Linaria cavanillesii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Linum narbonense';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Linum strictum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Lithodora fruticosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Lobularia maritima';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Lysimachia linum-stellatum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Macrochloa tenacissima';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Marrubium alysson';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Medicago polyceratia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Medicago rigidula';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Melilotus indicus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Minuartia campestris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Minuartia hamata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Moricandia arvensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Muscari neglectum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Nepeta nepetella';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Neslia paniculata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Oeosporangium pteridioides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Olea europaea subsp. europaea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Loncomelos narbonense';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Asteriscus spinosus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Pardoglossum cheirifolium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Paronychia aretioides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Paronychia capitata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Paronychia suffruticosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Phlomis lychnitis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Platycapnos spicata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Podarcis hispanicus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Polycarpon tetraphyllum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Polygala rupestris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Portulaca oleracea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Pseudopodospermum hispanicum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Quercus ilex';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Rapistrum rugosum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Reseda lutea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Reseda phyteuma';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Retama sphaerocarpa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Rhamnus lycioides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Rhodalsine geniculata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Rosa canina';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Ruscus aculeatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Salix atrocinerea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Salsola kali';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Satureja cuneifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Schismus barbatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Sedum album';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Sideritis bourgaeana';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Sideritis montana';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Silene mellifera';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Silene vulgaris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Sisymbrium irio';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Sisymbrium orientale';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Sisymbrium runcinatum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Staehelina dubia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Stellaria media';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Stipa lagascae';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Teucrium capitatum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Teucrium chamaedrys';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Teucrium franchetianum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Teucrium leonis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Teucrium thymifolium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Thesium humifusum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Thymus hyemalis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Torilis arvensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Ulex europaeus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Vicia peregrina';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 29
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Periparus ater';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 22
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Loxia curvirostra';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 19
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Erithacus rubecula';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 19
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Parus major';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 18
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Lophophanes cristatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 17
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Fringilla coelebs';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 15
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Falco peregrinus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 15
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Curruca undata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 14
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Aegithalos caudatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 14
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Phoenicurus ochruros';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 11
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Garrulus glandarius';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 11
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Ptyonoprogne rupestris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 11
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Pyrrhocorax pyrrhocorax';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 11
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Turdus viscivorus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 10
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Curruca melanocephala';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 9
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Certhia brachydactyla';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 9
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Emberiza cia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 9
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Phylloscopus collybita';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 9
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Picus sharpei';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Hirundo rustica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Apus apus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Falco tinnunculus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Galerida cristata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Lullula arborea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Phylloscopus bonelli';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Strix aluco';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Troglodytes troglodytes';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Aquila chrysaetos';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Corvus corax';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Lanius senator';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Regulus ignicapilla';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Accipiter nisus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Anthus pratensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Bubo bubo';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Delichon urbicum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Galerida theklae';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Athene noctua';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Cuculus canorus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Merops apiaster';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Monticola solitarius';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Motacilla alba';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Oenanthe leucura';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Oriolus oriolus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Petronia petronia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Turdus torquatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Upupa epops';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Calandrella brachydactyla';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Caprimulgus ruficollis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Curruca conspicillata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Oenanthe hispanica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Prunella collaris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Alauda arvensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Hieraaetus pennatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Lanius meridionalis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Luscinia megarhynchos';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Oenanthe oenanthe';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Phylloscopus trochilus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Prunella modularis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Spinus spinus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Sylvia atricapilla';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Curruca communis';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sierra-de-el-carche' AND hb.slug = 'matorrales-arborescentes-de-5210';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sierra-de-el-carche' AND hb.slug = 'matorrales-termomediterraneos-y-5330';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sierra-de-el-carche' AND hb.slug = 'zonas-subestepicas-de-6220';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sierra-de-el-carche' AND hb.slug = 'encinares-de-quercus-9340';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sierra-de-el-carche' AND hb.slug = 'pendientes-rocosas-calcicolas-8210';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sierra-de-el-carche' AND hb.slug = 'vegetacion-gipsicola-iberica-1520';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sierra-de-el-carche' AND hb.slug = 'prados-calcareos-carsticos-6110';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sierra-de-el-carche' AND hb.slug = 'bosques-endemicos-de-9560';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sierra-de-el-carche' AND hb.slug = 'prados-alpinos-y-6170';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sierra-de-el-carche' AND hb.slug = 'matorrales-mediterraneos-y-4090';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sierra-de-el-carche' AND hb.slug = 'pinares-sub-mediterraneos-9530';

-- ── sierra-de-la-pila ───────────────────────────────────────  219 especie(s) · 10 recinto(s)
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 146
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Sus scrofa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 114
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Vulpes vulpes';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 95
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Pinus halepensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 60
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Rosmarinus officinalis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 49
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Cistus albidus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 37
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Quercus coccifera';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 26
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Anthyllis cytisoides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 22
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Juniperus oxycedrus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 22
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Pistacia lentiscus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 21
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Cistus clusii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 14
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Oryctolagus cuniculus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 13
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Cistus salviifolius';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 12
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Colutea brevialata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 11
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Festuca capillifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 11
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Juniperus phoenicea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 10
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Arenaria montana';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 10
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Helianthemum cinereum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 10
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Nepeta nepetella';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 10
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Ononis fruticosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 9
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Brachypodium retusum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 9
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Dactylis glomerata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Asphodelus cerasifer';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Carex halleriana';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Cistus atriplicifolius';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Helichrysum stoechas';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Quercus rotundifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Rhamnus lycioides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Sedum sediforme';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Meles meles';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Thymus vulgaris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Arbutus unedo';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Coronilla minima';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Helictochloa bromoides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Helictotrichon filifolium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Phillyrea angustifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Stipa offneri';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Thymus moroderi';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Epidalea calamita';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Fumana ericoides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Helianthemum origanifolium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Rhaponticum coniferum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Linaria cavanillesii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Lotus dorycnium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Polygala rupestris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Teucrium franchetianum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Teucrium gnaphalodes';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Viburnum tinus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Antirrhinum litigiosum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Argyrolobium zanonii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Globularia alypum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Lapiedra martinezii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Moricandia arvensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Osyris alba';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Pelophylax perezi';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Phagnalon rupestre';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Pistacia terebinthus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Plantago albicans';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Teucrium pseudochamaepitys';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Thymus zygis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Zamenis scalaris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Acanthodactylus erythrurus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Adiantum capillus-veneris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Arrhenatherum elatius';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Asplenium ceterach';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Astragalus alopecuroides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Atractylis humilis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Bupleurum rigidum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Centaurea boissieri';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Cytisus lanigerus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Daphne gnidium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Euphorbia serrata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Felis silvestris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Fumana thymifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Guiraoa arvensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Helianthemum squamatum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Limodorum abortivum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Lonicera implexa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Lysimachia tenella';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Oeosporangium pteridioides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Olea europaea subsp. europaea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Ophrys fusca';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Psammodromus algirus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Sciurus vulgaris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Scrophularia tanacetifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Thymus membranaceus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Timon lepidus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Aphyllanthes monspeliensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Armeria bourgaei';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Armeria filicaulis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Asparagus horridus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Asphodelus ayardii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Asplenium ruta-muraria';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Asplenium trichomanes';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Astragalus monspessulanus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Atelerix algirus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Brachypodium phoenicoides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Bupleurum fruticescens';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Cistanche phelypaea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Coronella girondica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Coronilla juncea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Crocidura russula';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Dittrichia viscosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Draba verna';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Elymus repens';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Ephedra fragilis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Epipactis helleborine';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Equisetum ramosissimum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Erinaceus europaeus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Euphorbia characias';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Genetta genetta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Genista cinerea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Helianthemum hirtum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Helianthemum syriacum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Helianthemum violaceum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Hemorrhois hippocrepis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Hypericum ericoides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Klasea flavescens';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Lactuca viminea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Lepus granatensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Linum narbonense';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Lithodora fruticosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Lygeum spartum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Macroprotodon brevis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Malpolon monspessulanus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Martes foina';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Microtus duodecimcostatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Mus spretus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Mustela nivalis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Natrix maura';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Orobanche gracilis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Asteriscus spinosus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Paronychia suffruticosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Picris hispanica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Pinus pinaster';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Polygala monspeliaca';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Psammodromus hispanicus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Rhamnus alaternus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Rhinolophus ferrumequinum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Scandix stellata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Sedum dasyphyllum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Tarentola mauritanica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Teucrium capitatum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Teucrium libanitis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Thymus funkii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Veronica praecox';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Campanula mollis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Cheirolophus intybaceus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Cytinus ruber';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Genista versicolor';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Hemidactylus turcicus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Linaria oblongifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Linaria spartea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Myosotis ramosissima';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Phlomis lychnitis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Podarcis hispanicus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Polypodium cambricum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Populus alba';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Ruscus aculeatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Scorpiurus muricatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Sideritis leucantha';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Sonchus tenerrimus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Stipa lagascae';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Ulmus minor';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 256
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Motacilla alba';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 107
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Phoenicurus ochruros';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 72
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Phylloscopus collybita';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 53
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Curruca melanocephala';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 47
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Erithacus rubecula';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 45
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Hirundo rustica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 23
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Parus major';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 23
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Turdus philomelos';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 22
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Aegithalos caudatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 21
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Oenanthe leucura';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 17
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Lophophanes cristatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 15
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Athene noctua';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 15
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Muscicapa striata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 14
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Cettia cetti';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 12
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Periparus ater';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 10
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Falco tinnunculus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 10
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Loxia curvirostra';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 9
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Curruca undata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Emberiza cirlus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Accipiter nisus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Oriolus oriolus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Pyrrhocorax pyrrhocorax';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Strix aluco';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Apus apus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Aquila chrysaetos';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Certhia brachydactyla';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Emberiza cia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Falco peregrinus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Ptyonoprogne rupestris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Anthus pratensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Galerida cristata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Galerida theklae';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Picus sharpei';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Circaetus gallicus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Cuculus canorus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Lanius meridionalis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Lullula arborea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Monticola solitarius';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Oenanthe hispanica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Petronia petronia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Accipiter gentilis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Bubo bubo';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Cecropis daurica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Lanius senator';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Otus scops';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Regulus ignicapilla';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Curruca hortensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Tachymarptis melba';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Troglodytes troglodytes';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Buteo buteo';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Hieraaetus pennatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Hippolais polyglotta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Luscinia megarhynchos';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Saxicola rubicola';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Curruca communis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Upupa epops';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sierra-de-la-pila' AND hb.slug = 'matorrales-arborescentes-de-5210';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sierra-de-la-pila' AND hb.slug = 'matorrales-termomediterraneos-y-5330';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sierra-de-la-pila' AND hb.slug = 'zonas-subestepicas-de-6220';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sierra-de-la-pila' AND hb.slug = 'prados-calcareos-carsticos-6110';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sierra-de-la-pila' AND hb.slug = 'pendientes-rocosas-calcicolas-8210';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sierra-de-la-pila' AND hb.slug = 'bosques-endemicos-de-9560';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sierra-de-la-pila' AND hb.slug = 'vegetacion-gipsicola-iberica-1520';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sierra-de-la-pila' AND hb.slug = 'encinares-de-quercus-9340';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sierra-de-la-pila' AND hb.slug = 'matorrales-mediterraneos-y-4090';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sierra-de-la-pila' AND hb.slug = 'galerias-y-matorrales-92D0';

-- ── sierra-de-las-moreras ───────────────────────────────────  64 especie(s) · 9 recinto(s)
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Limonium insigne';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Teucrium lanigerum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Chamaerops humilis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Lygeum spartum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Acanthodactylus erythrurus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Withania frutescens';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Launaea lanifera';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Limonium lobatum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Lycium intricatum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Periploca angustifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Psammodromus algirus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Salsola papillosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Teucrium carolipaui';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Artemisia barrelieri';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Atriplex glauca';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Lafuentea rotundifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Lapiedra martinezii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Plantago amplexicaulis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Santolina viscosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Senecio flavus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Suaeda spicata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Tarentola mauritanica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Teucrium freynii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Miniopterus schreibersii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Myotis blythii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Myotis myotis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Rhinolophus ferrumequinum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Rhinolophus hipposideros';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Sideritis lasiantha';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Testudo graeca';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 44
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Oenanthe leucura';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 36
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Galerida theklae';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 19
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Galerida cristata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 18
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Aquila chrysaetos';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 17
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Curruca undata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 14
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Falco tinnunculus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 14
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Saxicola rubicola';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 9
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Streptopelia turtur';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Aquila fasciata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Burhinus oedicnemus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Larus audouinii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Pyrrhocorax pyrrhocorax';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Thalasseus sandvicensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Gulosus aristotelis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Bubo bubo';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Bucanetes githagineus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Upupa epops';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Egretta garzetta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Muscicapa striata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Caprimulgus ruficollis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Charadrius alexandrinus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Chroicocephalus ridibundus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Circaetus gallicus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Curruca conspicillata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Accipiter gentilis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Calandrella brachydactyla';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Coracias garrulus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Falco peregrinus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Hieraaetus pennatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Jynx torquilla';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Melanocorypha calandra';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Oenanthe hispanica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Tachybaptus ruficollis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Tichodroma muraria';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sierra-de-las-moreras' AND hb.slug = 'matorrales-termomediterraneos-y-5330';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sierra-de-las-moreras' AND hb.slug = 'zonas-subestepicas-de-6220';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sierra-de-las-moreras' AND hb.slug = 'bosques-endemicos-de-9560';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sierra-de-las-moreras' AND hb.slug = 'matorrales-arborescentes-de-5220';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sierra-de-las-moreras' AND hb.slug = 'prados-calcareos-carsticos-6110';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sierra-de-las-moreras' AND hb.slug = 'pendientes-rocosas-calcicolas-8210';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sierra-de-las-moreras' AND hb.slug = 'matorrales-halonitrofilos-pegano-1430';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sierra-de-las-moreras' AND hb.slug = 'acantilados-con-vegetacion-1240';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sierra-de-las-moreras' AND hb.slug = 'estepas-salinas-mediterraneas-1510';

-- ── sierra-de-salinas ───────────────────────────────────────  105 especie(s) · 7 recinto(s)
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 13
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Pinus halepensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 10
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Rosmarinus officinalis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Cistus clusii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Quercus coccifera';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Quercus rotundifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Cistus albidus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Rhamnus oleoides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Cistus laurifolius';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Arenaria montana';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Iberis carnosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Phillyrea angustifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Arabis auriculata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Arbutus unedo';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Campanula rapunculus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Centaurea boissieri';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Cistus atriplicifolius';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Digitalis obscura';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Erodium ciconium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Helianthemum croceum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Iberis saxatilis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Juniperus oxycedrus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Orchis mascula';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Pistacia lentiscus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Psammodromus algirus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Pseudopodospermum hispanicum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Ranunculus gramineus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Rumex intermedius';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Viburnum tinus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Anthyllis vulneraria';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Aria edulis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Centaurea ornata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Colutea arborescens';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Erodium saxatile';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Fritillaria lusitanica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Hyparrhenia hirta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Lonicera etrusca';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Odontites viscosus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Quercus faginea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Rhamnus alaternus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 31
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Fringilla coelebs';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 26
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Parus major';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 26
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Turdus merula';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 25
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Periparus ater';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 24
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Loxia curvirostra';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 22
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Turdus viscivorus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 21
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Columba palumbus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 19
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Falco tinnunculus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 19
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Lophophanes cristatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 19
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Lullula arborea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 18
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Curruca melanocephala';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 17
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Pica pica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 16
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Aegithalos caudatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 16
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Erithacus rubecula';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 14
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Corvus corax';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 14
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Phoenicurus ochruros';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 12
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Garrulus glandarius';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 12
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Sturnus unicolor';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 10
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Galerida theklae';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 9
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Lanius meridionalis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Accipiter nisus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Alectoris rufa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Certhia brachydactyla';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Circaetus gallicus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Galerida cristata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Saxicola rubicola';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Emberiza cia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Monticola solitarius';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Phylloscopus bonelli';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Picus sharpei';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Streptopelia turtur';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Hieraaetus pennatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Hirundo rustica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Motacilla alba';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Cuculus canorus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Falco peregrinus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Pyrrhocorax pyrrhocorax';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Buteo buteo';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Petronia petronia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Sylvia atricapilla';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Apus apus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Aquila chrysaetos';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Columba livia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Emberiza calandra';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Regulus ignicapilla';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Athene noctua';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Cyanistes caeruleus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Emberiza cirlus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Lanius senator';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Spinus spinus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Curruca undata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Upupa epops';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Anthus campestris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Anthus pratensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Bubo bubo';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Calandrella brachydactyla';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Corvus monedula';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Corvus corone';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Coturnix coturnix';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Delichon urbicum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Merops apiaster';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Muscicapa striata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Oriolus oriolus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Ptyonoprogne rupestris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Strix aluco';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Troglodytes troglodytes';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sierra-de-salinas' AND hb.slug = 'matorrales-arborescentes-de-5210';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sierra-de-salinas' AND hb.slug = 'zonas-subestepicas-de-6220';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sierra-de-salinas' AND hb.slug = 'pendientes-rocosas-calcicolas-8210';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sierra-de-salinas' AND hb.slug = 'encinares-de-quercus-9340';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sierra-de-salinas' AND hb.slug = 'matorrales-mediterraneos-y-4090';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sierra-de-salinas' AND hb.slug = 'matorrales-termomediterraneos-y-5330';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sierra-de-salinas' AND hb.slug = 'bosques-galeria-de-92A0';

-- ── sierra-espuna ───────────────────────────────────────────  175 especie(s) · 13 recinto(s)
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 256
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Pinus halepensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 646
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Sus scrofa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 175
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Rosmarinus officinalis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 485
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Vulpes vulpes';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 142
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Quercus coccifera';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 136
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Pistacia lentiscus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 72
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Juniperus phoenicea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 77
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Cistus clusii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 53
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Anthyllis cytisoides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 57
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Brachypodium retusum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 15
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Phagnalon saxatile';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 25
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Asparagus horridus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 16
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Centaurea saxicola';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Withania frutescens';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Helianthemum almeriense';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 21
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Nerium oleander';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 9
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Eragrostis papposa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Olea europaea subsp. europaea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Lafuentea rotundifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Ephedra fragilis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Allium melananthum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Launaea arborescens';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Felis silvestris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Genetta genetta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Martes foina';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Meles meles';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Epidalea calamita';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Ziziphus lotus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Teucrium lanigerum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Teucrium freynii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Notoceras bicorne';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 43
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Genista cinerea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 19
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Salix pedicellata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 12
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Genista longipes';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Colchicum triphyllum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Sideritis leucantha';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Ononis ornithopodioides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Cistus atriplicifolius';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 11
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Ononis speciosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 9
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Cosentinia vellea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Bupleurum gibraltarium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Jasione foliosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Quercus ilex';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Cytisus scoparius';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Imperata cylindrica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Saxifraga camposii subsp. leptophylla';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Cytisus lanigerus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Convolvulus lineatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Campanula rotundifolia subsp. hispanica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Sedum gypsicola';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Ulex europaeus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Lonicera biflora';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Linaria cavanillesii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Trifolium gemellum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Erodium foetidum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Thymus antoninae';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Quercus lusitanica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Sideritis bourgaeana';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 185
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Cistus albidus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Juniperus oxycedrus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 64
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Quercus rotundifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 58
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Erinacea anthyllis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 57
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Thymus membranaceus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 37
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Pistacia terebinthus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 41
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Viburnum tinus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Pinus pinaster';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 29
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Sciurus vulgaris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Peucedanum officinale';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 35
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Digitalis obscura';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Genista spartioides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 24
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Linaria aeruginea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Acer monspessulanum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 14
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Limodorum abortivum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Convolvulus althaeoides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 17
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Colutea arborescens';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Erodium saxatile';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 14
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Cytinus ruber';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Ophrys lutea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 28
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Rhamnus alaternus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 18
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Poterium ancistroides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 17
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Macrochloa tenacissima';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Lonicera splendida';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 22
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Phillyrea angustifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Helianthemum viscarium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 24
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Pelophylax perezi';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Epipactis kleinii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 10
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Quercus faginea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Arbutus unedo';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 20
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Coronilla juncea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Ammoides pusilla';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Lotus dorycnium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 10
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Athamanta hispanica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 13
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Allium pallens';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Dianthus broteri';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 13
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Teucrium thymifolium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 12
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Populus alba';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 9
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Phillyrea latifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Iris lutescens';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Ononis fruticosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 10
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Klasea flavescens';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Arctostaphylos uva-ursi';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Stachys circinata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Ulmus minor';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Cephalanthera longifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Asplenium petrarchae';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Ulmus glabra';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 15
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Prunus prostrata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Myrtus communis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Cotoneaster granatensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Centranthus lecoqii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Artemisia reptans';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Anacyclus valentinus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Silene mellifera';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Cephalanthera damasonium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 18
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Ceratonia siliqua';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Erodium celtibericum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Aria edulis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Fritillaria lusitanica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 52
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Capra pyrenaica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Thymus zygis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Potentilla caulescens';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Cormus domestica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Juglans regia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Fraxinus ornus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Helianthemum violaceum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Cistus populifolius';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 14
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Erica erigena';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Neotinea maculata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Hypericum caprifolium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Epipactis atrorubens';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Accipiter gentilis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Aquila chrysaetos';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 13
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Aquila fasciata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 13
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Bubo bubo';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Burhinus oedicnemus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 17
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Caprimulgus ruficollis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 35
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Circaetus gallicus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Coracias garrulus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 65
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Falco peregrinus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 127
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Falco tinnunculus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Galerida cristata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 55
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Galerida theklae';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 134
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Hieraaetus pennatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Jynx torquilla';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 47
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Merops apiaster';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Muscicapa striata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 45
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Oenanthe hispanica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 59
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Oenanthe leucura';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Pyrrhocorax pyrrhocorax';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 48
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Streptopelia turtur';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Upupa epops';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Anthus campestris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Anthus spinoletta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Buteo buteo';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Caprimulgus europaeus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 310
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Certhia brachydactyla';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Circus pygargus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Coturnix coturnix';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Falco columbarius';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Falco subbuteo';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 628
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Fringilla coelebs';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 160
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Gyps fulvus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Loxia curvirostra';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 124
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Lullula arborea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Monticola saxatilis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Oenanthe oenanthe';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 13
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Otus scops';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Phoenicurus phoenicurus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 21
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Prunella collaris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Curruca undata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 210
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Turdus torquatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 27
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Lanius meridionalis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Curruca conspicillata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 95
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Saxicola rubicola';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Rhinolophus mehelyi';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sierra-espuna' AND hb.slug = 'matorrales-arborescentes-de-5210';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sierra-espuna' AND hb.slug = 'matorrales-mediterraneos-y-4090';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sierra-espuna' AND hb.slug = 'zonas-subestepicas-de-6220';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sierra-espuna' AND hb.slug = 'encinares-de-quercus-9340';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sierra-espuna' AND hb.slug = 'bosques-endemicos-de-9560';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sierra-espuna' AND hb.slug = 'matorrales-termomediterraneos-y-5330';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sierra-espuna' AND hb.slug = 'galerias-y-matorrales-92D0';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sierra-espuna' AND hb.slug = 'prados-humedos-mediterraneos-6420';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sierra-espuna' AND hb.slug = 'prados-calcareos-carsticos-6110';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sierra-espuna' AND hb.slug = 'pendientes-rocosas-calcicolas-8210';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sierra-espuna' AND hb.slug = 'prados-alpinos-y-6170';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sierra-espuna' AND hb.slug = 'robledales-ibericos-de-9240';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sierra-espuna' AND hb.slug = 'bosques-galeria-de-92A0';

-- ── sotos-y-bosques-de-ribera-de-canaverosa ─────────────────  245 especie(s) · 6 recinto(s)
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Sciurus vulgaris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Psammodromus algirus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Rhamnus alaternus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Allium rouyi';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Cheirolophus intybaceus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Pelophylax perezi';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Pistacia terebinthus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Populus alba';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Thymus antoninae';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Celtis australis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Crataegus monogyna';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Cytisus scoparius';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Dianthus broteri';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Fraxinus angustifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Hemorrhois hippocrepis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Lutra lutra';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Phlomis lychnitis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Pinus halepensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Ruscus aculeatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Sideritis tragoriganum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Ulmus minor';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Zamenis scalaris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Acanthodactylus erythrurus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Accipiter gentilis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Acrocephalus arundinaceus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Actitis hypoleucos';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Alytes dickhilleni';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Anas strepera';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Anemone palmata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Anthyllis lagascana';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Anthyllis onobrychioides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Arbutus unedo';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Ardea purpurea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Astragalus alopecuroides subsp. grosii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Atelerix algirus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Athene noctua';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Barbus sclateri';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Bubo bubo';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Bufo bufo';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Campanula fastigiata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Capra pyrenaica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Caralluma munbyana subsp. hispanica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Cercotrichas galactotes';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Cervus elaphus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Chaenorhinum rubrifolium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Chaenorhinum rupestre';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Cinclus cinclus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Circus aeruginosus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Clamator glandarius';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Columba oenas';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Colutea hispanica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Coriaria myrtifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Corvus corax';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Coturnix coturnix';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Crocidura russula';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Cuculus canorus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Dactylorhiza elata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Eliomys quercinus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Epidalea calamita';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Eptesicus isabellinus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Equisetum palustre';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Erinaceus europaeus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Erodium saxatile';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Falco columbarius';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Falco subbuteo';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Felis silvestris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Genetta genetta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Genista spartioides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Gobio gobio';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Guiraoa arvensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Gypsophila struthium';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Helianthemum guerrae';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Helianthemum squamatum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Herniaria fruticosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Himantopus himantopus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Ixobrychus minutus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Juniperus oxycedrus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Juniperus phoenicea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Lafuentea rotundifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Lathyrus pulcher';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Lepus granatensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Limonium cossonianum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Linaria cavanillesii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Linaria depauperata subsp. hegelmaieri';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Linum tenue';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Lonicera periclymenum subsp. hispanica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Lullula arborea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Lycocarpus fugax';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Lysimachia tenella';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Malpolon monspessulanus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Martes foina';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Mauremys leprosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Meles meles';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Miniopterus schreibersii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Monticola saxatilis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Motacilla flava';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Mustela nivalis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Mustela putorius';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Myotis blythii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Myotis capaccinii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Myotis daubentonii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Myotis emarginatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Myotis escalerai';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Myotis myotis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Natrix maura';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Natrix natrix';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Nycticorax nycticorax';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Oenanthe hispanica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Oenanthe oenanthe';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Ononis tridentata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Oryctolagus cuniculus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Osyris alba';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Pandion haliaetus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Passer montanus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Phillyrea latifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Pipistrellus kuhlii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Pipistrellus pipistrellus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Pipistrellus pygmaeus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Plecotus austriacus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Pleurodeles waltl';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Podarcis vaucheri';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Podiceps cristatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Podiceps nigricollis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Populus nigra var. nigra';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Prunella collaris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Pseudochondrostoma polylepis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Pulicaria paludosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Quercus faginea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Quercus rotundifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Regulus ignicapillus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Regulus regulus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Rhinolophus euryale';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Rhinolophus ferrumequinum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Rhinolophus hipposideros';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Rhinolophus mehelyi';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Salix eleagnos';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Salix purpurea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Sambucus nigra';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Sarcocapnos baetica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Sarcocapnos enneaphylla';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Sarcocapnos enneaphylla subsp. saetabensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Senecio auricula subsp. auricula';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Silene andryalifolia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Spatula clypeata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Squalius pyrenaicus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Strix aluco';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Sus scrofa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Sylvia borin';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Tadarida teniotis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Tamarix africana';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Tamarix boveana';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Tamarix canariensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Tamarix gallica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Teucrium balthazaris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Teucrium dunense';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Teucrium franchetianum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Teucrium libanitis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Teucrium rivas-martinezii';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Tichodroma muraria';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Timon lepidus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Tinca tinca';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Tringa ochropus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Turdus iliacus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Turdus pilaris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Turdus torquatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Tyto alba';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Vipera latastei';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 0
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Ziziphora hispanica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 71
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Curruca melanocephala';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 68
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Parus major';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 67
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Aegithalos caudatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 64
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Fringilla coelebs';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 61
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Columba palumbus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 57
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Luscinia megarhynchos';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 54
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Cettia cetti';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 47
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Sylvia atricapilla';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 37
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Erithacus rubecula';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 35
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Ptyonoprogne rupestris';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 33
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Cyanistes caeruleus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 29
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Oriolus oriolus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 28
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Motacilla alba';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 25
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Merops apiaster';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 25
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Picus sharpei';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 24
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Muscicapa striata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 20
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Hippolais polyglotta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 20
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Sturnus unicolor';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 19
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Certhia brachydactyla';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 19
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Hirundo rustica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 19
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Lophophanes cristatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 19
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Monticola solitarius';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 19
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Streptopelia turtur';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 18
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Dendrocopos major';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 18
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Troglodytes troglodytes';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 16
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Phylloscopus collybita';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 14
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Falco tinnunculus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 14
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Pica pica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 12
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Phalacrocorax carbo';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 12
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Turdus viscivorus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 11
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Apus apus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 11
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Ardea cinerea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 11
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Corvus monedula';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 11
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Galerida cristata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 11
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Lanius senator';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 10
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Delichon urbicum';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 10
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Ficedula hypoleuca';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 10
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Oenanthe leucura';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 9
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Alcedo atthis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 9
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Alectoris rufa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Periparus ater';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 8
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Turdus philomelos';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Galerida theklae';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 7
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Saxicola rubicola';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Accipiter nisus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Columba livia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 6
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Curruca communis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Caprimulgus ruficollis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Lanius meridionalis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Petronia petronia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 5
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Spinus spinus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Circaetus gallicus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Curruca hortensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Emberiza cia';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Jynx torquilla';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Phylloscopus bonelli';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Phylloscopus trochilus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Pyrrhocorax pyrrhocorax';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 4
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Remiz pendulinus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Anthus pratensis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Aquila fasciata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 3
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Cisticola juncidis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Apus pallidus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Curruca undata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Egretta garzetta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 2
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Phoenicurus phoenicurus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Aquila chrysaetos';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Coracias garrulus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Emberiza cirlus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Falco peregrinus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Gallinago gallinago';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Loxia curvirostra';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Otus scops';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Prunella modularis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Regulus ignicapilla';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Tachybaptus ruficollis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_occurrences = 1
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Tachymarptis melba';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND hb.slug = 'matorrales-termomediterraneos-y-5330';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND hb.slug = 'zonas-subestepicas-de-6220';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND hb.slug = 'vegetacion-gipsicola-iberica-1520';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND hb.slug = 'matorrales-arborescentes-de-5210';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND hb.slug = 'galerias-y-matorrales-92D0';
UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id
   SET hb.origen = 'anadido_desde_oficial'
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND hb.slug = 'bosques-galeria-de-92A0';

COMMIT;

-- Comprobación: ninguna de las dos columnas debe quedar vacía donde el repositorio tiene dato.
SELECT COUNT(*) AS especies_sin_ocurrencias FROM species WHERE gbif_occurrences IS NULL;
SELECT COUNT(*) AS recintos_sin_origen FROM habitats WHERE geometry IS NOT NULL AND origen IS NULL;
