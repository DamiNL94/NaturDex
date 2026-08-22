-- El juego de caracteres se fija SIEMPRE: el cliente `mysql` lo toma del entorno y en un
-- contenedor sin locale eso es latin1, que convierte cada tilde en mojibake sin dar error.
SET NAMES utf8mb4;

-- habitats-imagenes.sql — portada, atribución y nota de cada hábitat.
-- GENERADO por Tools/catalogo-nacional/habitat-images.js --sql. No editar a mano.
-- Requiere las columnas habitats.image_attribution e image_note (Database/migrations.sql).

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Rhamnus_lycioides_fruits.JPG?width=1280',
  h.image_attribution = 'איתן פרמן (CC BY-SA 3.0) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Espino negro (Rhamnus lycioides), la especie que da nombre al hábitat.'
WHERE p.slug = 'barrancos-de-gebas' AND h.slug = 'matorrales-termomediterraneos-y-5330';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'barrancos-de-gebas' AND h.slug = 'zonas-subestepicas-de-6220';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'barrancos-de-gebas' AND h.slug = 'galerias-y-matorrales-92D0';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'cabezo-gordo' AND h.slug = 'matorrales-termomediterraneos-y-5330';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/609975159/original.jpg',
  h.image_attribution = 'Quentin Groom (CC0) · GBIF',
  h.image_note = 'Portada ilustrada con Cornical (Periploca angustifolia), la especie que da nombre al hábitat.'
WHERE p.slug = 'cabezo-gordo' AND h.slug = 'matorrales-arborescentes-de-5220';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Cosentinia_vellea_kz02.jpg?width=1280',
  h.image_attribution = 'Krzysztof Ziarnek, Kenraiz (CC BY-SA 4.0) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Cosentinia vellea (Cosentinia vellea), la especie que da nombre al hábitat.'
WHERE p.slug = 'cabezo-gordo' AND h.slug = 'pendientes-rocosas-calcicolas-8210';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'cabezo-gordo' AND h.slug = 'zonas-subestepicas-de-6220';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Limonium_cossonianum_kz01.jpg?width=1280',
  h.image_attribution = 'Krzysztof Ziarnek, Kenraiz (CC BY-SA 4.0) · Wikimedia Commons',
  h.image_note = NULL
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND h.slug = 'acantilados';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://minka-sdg.org/attachments/local_photos/files/944511/original.jpeg',
  h.image_attribution = 'maxlbe (CC BY 4.0) · GBIF',
  h.image_note = 'Portada ilustrada con Alhelí de mar (Malcolmia littorea), la especie que da nombre al hábitat.'
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND h.slug = 'dunas-malcomietalia';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Elymus_farctus_kz14.jpg?width=1280',
  h.image_attribution = 'Krzysztof Ziarnek, Kenraiz (CC BY-SA 4.0) · Wikimedia Commons',
  h.image_note = NULL
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND h.slug = 'dunas-embrionarias';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Lygeum_spartum_Closeup_12July2009_LagunadelaMata.jpg?width=1280',
  h.image_attribution = 'Javier martin (Public domain) · Wikimedia Commons',
  h.image_note = NULL
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND h.slug = 'estepas-salinas-albardinal';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Tamarix_africana.jpg?width=1280',
  h.image_attribution = 'autor no indicado (CC BY-SA 3.0) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Taray (Tamarix africana), la especie que da nombre al hábitat.'
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND h.slug = 'galeria-ribera';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/-0591_Anabasis_articulata%2C_d%C3%A9sert_d''Almeria%2C_Espagne_P1110397.JPG?width=1280',
  h.image_attribution = 'Joël Lodé (CC BY-SA 3.0) · Wikimedia Commons',
  h.image_note = NULL
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND h.slug = 'matorral-semiarido';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Juniperus_phoenicea_4.JPG?width=1280',
  h.image_attribution = 'Xemenendura (CC BY-SA 4.0) · Wikimedia Commons',
  h.image_note = NULL
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND h.slug = 'sabinar-juniperus';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Zizyphus_lotus.JPG?width=1280',
  h.image_attribution = 'Zeynel Cebeci (CC BY-SA 3.0) · Wikimedia Commons',
  h.image_note = NULL
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND h.slug = 'azufaifar';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Escobilla_-_Salsola_genistoides.jpg?width=1280',
  h.image_attribution = 'Yolanda95 (CC BY-SA 4.0) · Wikimedia Commons',
  h.image_note = NULL
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND h.slug = 'matorral-halonitrofilo';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Sarcocornia_perennis_kz01.jpg?width=1280',
  h.image_attribution = 'Krzysztof Ziarnek, Kenraiz (CC BY-SA 4.0) · Wikimedia Commons',
  h.image_note = NULL
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND h.slug = 'matorral-halofilo';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Sarcocapnos_enneaphylla_saetabensis.jpg?width=1280',
  h.image_attribution = 'Nanosanchez (Public domain) · Wikimedia Commons',
  h.image_note = NULL
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND h.slug = 'roquedos-casmofiticos';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Close-up_of_a_vegetation_of_the_Alysso-Sedion.jpg?width=1280',
  h.image_attribution = 'Lendskaip (CC0) · Wikimedia Commons',
  h.image_note = NULL
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND h.slug = 'prados-alysso-sedion';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Glaucium_flavum_-_Orto_botanico_-_Rome%2C_Italy_-_DSC09962.jpg?width=1280',
  h.image_attribution = 'Daderot (CC0) · Wikimedia Commons',
  h.image_note = NULL
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND h.slug = 'rios-glaucium';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Cakile_maritima_b.jpg?width=1280',
  h.image_attribution = 'Taken by Carsten Niehaus (user:Lumbar). (CC BY-SA 3.0) · Wikimedia Commons',
  h.image_note = NULL
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND h.slug = 'veg-anual-desechos-marinos';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Brachypodium_retusum_hivern_Canyelles.jpg?width=1280',
  h.image_attribution = 'No machine-readable author provided. Pere prlpz assumed (based on c… (CC BY-SA 2.5) · Wikimedia Commons',
  h.image_note = NULL
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND h.slug = 'subestepa-thero-brachypodietea';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Ullastre_vell.JPG?width=1280',
  h.image_attribution = 'Antoni Salvà (CC BY-SA 4.0) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Acebuche (Olea europaea subsp. europaea), la especie que da nombre al hábitat.'
WHERE p.slug = 'calblanque-monte-cenizas-pena-aguila' AND h.slug = 'matorrales-termomediterraneos-y-5330';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Teucrium_carthaginense88.jpg?width=1280',
  h.image_attribution = 'Nanosanchez (CC BY-SA 3.0) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con zamarrilla de Cartagena (Teucrium carthaginense), la especie que da nombre al hábitat.'
WHERE p.slug = 'calblanque-monte-cenizas-pena-aguila' AND h.slug = 'zonas-subestepicas-de-6220';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Teucrium_carthaginense88.jpg?width=1280',
  h.image_attribution = 'Nanosanchez (CC BY-SA 3.0) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con zamarrilla de Cartagena (Teucrium carthaginense), la especie que da nombre al hábitat.'
WHERE p.slug = 'calblanque-monte-cenizas-pena-aguila' AND h.slug = 'pendientes-rocosas-calcicolas-8210';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Limonium_cossonianum.jpg?width=1280',
  h.image_attribution = 'Nanosanchez (CC0) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Siempreviva de Cosson (Limonium cossonianum), la especie que da nombre al hábitat.'
WHERE p.slug = 'calblanque-monte-cenizas-pena-aguila' AND h.slug = 'acantilados-con-vegetacion-1240';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Sandarac_Tree_(Tetraclinis_articulata)_-_Cartagena%2C_Spain_2024-02-05_(01).jpg?width=1280',
  h.image_attribution = 'Ryan Hodnett (CC BY-SA 4.0) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Sabina de Cartagena (Tetraclinis articulata), la especie que da nombre al hábitat.'
WHERE p.slug = 'calblanque-monte-cenizas-pena-aguila' AND h.slug = 'bosques-de-tetraclinis-9570';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/609975159/original.jpg',
  h.image_attribution = 'Quentin Groom (CC0) · GBIF',
  h.image_note = 'Portada ilustrada con Cornical (Periploca angustifolia), la especie que da nombre al hábitat.'
WHERE p.slug = 'calblanque-monte-cenizas-pena-aguila' AND h.slug = 'matorrales-arborescentes-de-5220';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'calblanque-monte-cenizas-pena-aguila' AND h.slug = 'encinares-de-quercus-9340';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'calblanque-monte-cenizas-pena-aguila' AND h.slug = 'galerias-y-matorrales-92D0';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Suaeda_vera.JPG?width=1280',
  h.image_attribution = 'Xemenendura (CC BY-SA 4.0) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Sosa fina (Suaeda vera), la especie que da nombre al hábitat.'
WHERE p.slug = 'calblanque-monte-cenizas-pena-aguila' AND h.slug = 'pastizales-salinos-mediterraneos-1410';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'calblanque-monte-cenizas-pena-aguila' AND h.slug = 'matorrales-halofilos-mediterraneos-1420';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/611378691/original.jpg',
  h.image_attribution = 'Michael Bakker Paiva (CC BY 4.0) · GBIF',
  h.image_note = 'Portada ilustrada con Orgaza (Atriplex glauca), la especie que da nombre al hábitat.'
WHERE p.slug = 'calblanque-monte-cenizas-pena-aguila' AND h.slug = 'matorrales-halonitrofilos-pegano-1430';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Limonium_lobatum.jpg?width=1280',
  h.image_attribution = 'Sf2000 (CC BY-SA 4.0) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Saladilla anual (Limonium lobatum), la especie que da nombre al hábitat.'
WHERE p.slug = 'calblanque-monte-cenizas-pena-aguila' AND h.slug = 'estepas-salinas-mediterraneas-1510';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'calblanque-monte-cenizas-pena-aguila' AND h.slug = 'dunas-moviles-embrionarias-2110';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'calblanque-monte-cenizas-pena-aguila' AND h.slug = 'dunas-moviles-de-2120';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'calblanque-monte-cenizas-pena-aguila' AND h.slug = 'dunas-con-cespedes-2230';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'calblanque-monte-cenizas-pena-aguila' AND h.slug = 'vegetacion-anual-sobre-1210';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'calblanque-monte-cenizas-pena-aguila' AND h.slug = 'dunas-fijas-de-2210';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'calblanque-monte-cenizas-pena-aguila' AND h.slug = 'prados-calcareos-carsticos-6110';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Cistus_albidus_flowers.jpg?width=1280',
  h.image_attribution = 'Júlio Reis (CC BY-SA 3.0) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Jara blanca (Cistus albidus), la especie que da nombre al hábitat.'
WHERE p.slug = 'carrascoy-y-el-valle' AND h.slug = 'matorrales-termomediterraneos-y-5330';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Rhamnus_alaternus1627.JPG?width=1280',
  h.image_attribution = 'tato grasso (CC BY-SA 2.5) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Aladierno (Rhamnus alaternus), la especie que da nombre al hábitat.'
WHERE p.slug = 'carrascoy-y-el-valle' AND h.slug = 'pendientes-rocosas-calcicolas-8210';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Brachypodium_retusum_espiga_seca.jpg?width=1280',
  h.image_attribution = 'Pere prlpz (CC BY-SA 2.5) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Lastón (Brachypodium retusum), la especie que da nombre al hábitat.'
WHERE p.slug = 'carrascoy-y-el-valle' AND h.slug = 'zonas-subestepicas-de-6220';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'carrascoy-y-el-valle' AND h.slug = 'pastizales-salinos-mediterraneos-1410';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'carrascoy-y-el-valle' AND h.slug = 'galerias-y-matorrales-92D0';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'carrascoy-y-el-valle' AND h.slug = 'vegetacion-gipsicola-iberica-1520';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'carrascoy-y-el-valle' AND h.slug = 'aguas-oligomesotroficas-calcareas-3140';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'carrascoy-y-el-valle' AND h.slug = 'estanques-temporales-mediterraneos-3170';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'carrascoy-y-el-valle' AND h.slug = 'rios-mediterraneos-de-3280';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'carrascoy-y-el-valle' AND h.slug = 'prados-humedos-mediterraneos-6420';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'carrascoy-y-el-valle' AND h.slug = 'prados-calcareos-carsticos-6110';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'carrascoy-y-el-valle' AND h.slug = 'manantiales-petrificantes-con-7220';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Quercus_coccifera_1.JPG?width=1280',
  h.image_attribution = 'User:Xemenendura (CC BY-SA 3.0) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Coscoja (Quercus coccifera), la especie que da nombre al hábitat.'
WHERE p.slug = 'carrascoy-y-el-valle' AND h.slug = 'encinares-de-quercus-9340';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Eberswalde_Zoo_12-2017_img2.jpg?width=1280',
  h.image_attribution = 'A.Savin (FAL) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Jabalí (Sus scrofa), la especie que da nombre al hábitat.'
WHERE p.slug = 'carrascoy-y-el-valle' AND h.slug = 'rios-mediterraneos-de-3250';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Rhamnus_alaternus1627.JPG?width=1280',
  h.image_attribution = 'tato grasso (CC BY-SA 2.5) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Aladierno (Rhamnus alaternus), la especie que da nombre al hábitat.'
WHERE p.slug = 'carrascoy-y-el-valle' AND h.slug = 'matorrales-arborescentes-de-5210';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Arthrocnemum_macrostachyum_2LaMata.jpg?width=1280',
  h.image_attribution = 'Javier martin (Public domain) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Sosa alacranera (Arthrocnemum macrostachyum), la especie que da nombre al hábitat.'
WHERE p.slug = 'cuatro-calas' AND h.slug = 'matorrales-halofilos-mediterraneos-1420';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Salsola_oppositifolia.JPG?width=1280',
  h.image_attribution = 'Retama (CC BY-SA 3.0) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Salao negro (Salsola oppositifolia), la especie que da nombre al hábitat.'
WHERE p.slug = 'cuatro-calas' AND h.slug = 'matorrales-halonitrofilos-pegano-1430';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Limonium_insigne.jpg?width=1280',
  h.image_attribution = 'ANE (CC BY-SA 4.0) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Siempreviva insigne (Limonium insigne), la especie que da nombre al hábitat.'
WHERE p.slug = 'cuatro-calas' AND h.slug = 'estepas-salinas-mediterraneas-1510';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'cuatro-calas' AND h.slug = 'zonas-subestepicas-de-6220';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Tamarix_gallica_-_Villa_Taranto_(Verbania)_-_DSC03778.JPG?width=1280',
  h.image_attribution = 'Daderot (Public domain) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Taraje (Tamarix gallica), la especie que da nombre al hábitat.'
WHERE p.slug = 'cuatro-calas' AND h.slug = 'galerias-y-matorrales-92D0';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Teucrium_lanigerum_kz01.jpg?width=1280',
  h.image_attribution = 'Krzysztof Ziarnek, Kenraiz (CC BY-SA 4.0) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Zamarrilla lanuda (Teucrium lanigerum), la especie que da nombre al hábitat.'
WHERE p.slug = 'cuatro-calas' AND h.slug = 'matorrales-termomediterraneos-y-5330';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/609975159/original.jpg',
  h.image_attribution = 'Quentin Groom (CC0) · GBIF',
  h.image_note = 'Portada ilustrada con Cornical (Periploca angustifolia), la especie que da nombre al hábitat.'
WHERE p.slug = 'cuatro-calas' AND h.slug = 'matorrales-arborescentes-de-5220';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Lycium_intrincatum_(flor).JPG?width=1280',
  h.image_attribution = 'ANE (CC BY-SA 4.0) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Cambrón (Lycium intricatum), la especie que da nombre al hábitat.'
WHERE p.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND h.slug = 'acantilados-con-vegetacion-1240';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Suaeda_vera.JPG?width=1280',
  h.image_attribution = 'Xemenendura (CC BY-SA 4.0) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Sosa fina (Suaeda vera), la especie que da nombre al hábitat.'
WHERE p.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND h.slug = 'pastizales-salinos-mediterraneos-1410';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Arthrocnemum_macrostachyum_2LaMata.jpg?width=1280',
  h.image_attribution = 'Javier martin (Public domain) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Sosa alacranera (Arthrocnemum macrostachyum), la especie que da nombre al hábitat.'
WHERE p.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND h.slug = 'matorrales-halofilos-mediterraneos-1420';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Lygeum_spartum-1.jpg?width=1280',
  h.image_attribution = 'Nanosanchez (CC BY-SA 3.0) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Albardín (Lygeum spartum), la especie que da nombre al hábitat.'
WHERE p.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND h.slug = 'estepas-salinas-mediterraneas-1510';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND h.slug = 'dunas-con-vegetacion-2260';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Tamarix_africana.jpg?width=1280',
  h.image_attribution = 'autor no indicado (CC BY-SA 3.0) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Taray (Tamarix africana), la especie que da nombre al hábitat.'
WHERE p.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND h.slug = 'galerias-y-matorrales-92D0';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Lycium_intrincatum_(flor).JPG?width=1280',
  h.image_attribution = 'ANE (CC BY-SA 4.0) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Cambrón (Lycium intricatum), la especie que da nombre al hábitat.'
WHERE p.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND h.slug = 'matorrales-halonitrofilos-pegano-1430';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Chamaerops_humilis_Torreblanca.jpg?width=1280',
  h.image_attribution = 'Canaan (CC BY-SA 4.0) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Palmito (Chamaerops humilis), la especie que da nombre al hábitat.'
WHERE p.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND h.slug = 'matorrales-termomediterraneos-y-5330';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Cosentinia_vellea_kz02.jpg?width=1280',
  h.image_attribution = 'Krzysztof Ziarnek, Kenraiz (CC BY-SA 4.0) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Cosentinia vellea (Cosentinia vellea), la especie que da nombre al hábitat.'
WHERE p.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND h.slug = 'pendientes-rocosas-siliceas-8220';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND h.slug = 'matorrales-arborescentes-de-5220';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND h.slug = 'vegetacion-anual-sobre-1210';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND h.slug = 'dunas-moviles-embrionarias-2110';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Teucrium_dunense_Habitus_2010-7-03_ParqueNaturalLagunasdelaMata.jpg?width=1280',
  h.image_attribution = 'Javier martin (Public domain) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con polio (Teucrium dunense), la especie que da nombre al hábitat.'
WHERE p.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND h.slug = 'zonas-subestepicas-de-6220';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND h.slug = 'prados-calcareos-carsticos-6110';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Teucrium_dunense_Habitus_2010-7-03_ParqueNaturalLagunasdelaMata.jpg?width=1280',
  h.image_attribution = 'Javier martin (Public domain) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con polio (Teucrium dunense), la especie que da nombre al hábitat.'
WHERE p.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND h.slug = 'pendientes-rocosas-calcicolas-8210';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Sandarac_Tree_(Tetraclinis_articulata)_-_Cartagena%2C_Spain_2024-02-05_(01).jpg?width=1280',
  h.image_attribution = 'Ryan Hodnett (CC BY-SA 4.0) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Sabina de Cartagena (Tetraclinis articulata), la especie que da nombre al hábitat.'
WHERE p.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND h.slug = 'bosques-de-tetraclinis-9570';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Suaeda_vera.JPG?width=1280',
  h.image_attribution = 'Xemenendura (CC BY-SA 4.0) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Sosa fina (Suaeda vera), la especie que da nombre al hábitat.'
WHERE p.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND h.slug = 'dunas-con-cespedes-2230';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND h.slug = 'dunas-moviles-de-2120';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Cakile-maritima-(eurMeersenf)_1.jpg?width=1280',
  h.image_attribution = 'Jürgen Howaldt (CC BY-SA 2.0 de) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Rugueta de mar (Cakile maritima), la especie que da nombre al hábitat.'
WHERE p.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND h.slug = 'dunas-fijas-de-2210';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'humedal-del-ajauque-y-rambla-salada' AND h.slug = 'pastizales-salinos-mediterraneos-1410';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Arthrocnemum_macrostachyum_2LaMata.jpg?width=1280',
  h.image_attribution = 'Javier martin (Public domain) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Sosa alacranera (Arthrocnemum macrostachyum), la especie que da nombre al hábitat.'
WHERE p.slug = 'humedal-del-ajauque-y-rambla-salada' AND h.slug = 'matorrales-halofilos-mediterraneos-1420';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Limonium_caesium653.jpg?width=1280',
  h.image_attribution = 'Nanosanchez (CC BY-SA 3.0) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con sopaenvino (Limonium caesium), la especie que da nombre al hábitat.'
WHERE p.slug = 'humedal-del-ajauque-y-rambla-salada' AND h.slug = 'estepas-salinas-mediterraneas-1510';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'humedal-del-ajauque-y-rambla-salada' AND h.slug = 'rios-mediterraneos-de-3280';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/619019413/original.jpg',
  h.image_attribution = 'Christoph Moning (CC BY 4.0) · GBIF',
  h.image_note = 'Portada ilustrada con Taray canario (Tamarix canariensis), la especie que da nombre al hábitat.'
WHERE p.slug = 'humedal-del-ajauque-y-rambla-salada' AND h.slug = 'galerias-y-matorrales-92D0';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'humedal-del-ajauque-y-rambla-salada' AND h.slug = 'matorrales-termomediterraneos-y-5330';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'humedal-del-ajauque-y-rambla-salada' AND h.slug = 'matorrales-halonitrofilos-pegano-1430';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'humedal-del-ajauque-y-rambla-salada' AND h.slug = 'vegetacion-gipsicola-iberica-1520';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'humedal-del-ajauque-y-rambla-salada' AND h.slug = 'prados-calcareos-carsticos-6110';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Teucrium_freynii_kz01.jpg?width=1280',
  h.image_attribution = 'Krzysztof Ziarnek, Kenraiz (CC BY-SA 4.0) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Teucrio de Freyn (Teucrium freynii), la especie que da nombre al hábitat.'
WHERE p.slug = 'humedal-del-ajauque-y-rambla-salada' AND h.slug = 'pendientes-rocosas-calcicolas-8210';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Anthyllis_cytisoides.JPG?width=1280',
  h.image_attribution = 'Ximenex (CC BY-SA 2.1 es) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Albaida (Anthyllis cytisoides), la especie que da nombre al hábitat.'
WHERE p.slug = 'monte-arabi' AND h.slug = 'matorrales-termomediterraneos-y-5330';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'monte-arabi' AND h.slug = 'pendientes-rocosas-calcicolas-8210';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Cakile-maritima-(eurMeersenf)_1.jpg?width=1280',
  h.image_attribution = 'Jürgen Howaldt (CC BY-SA 2.0 de) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Rugueta de mar (Cakile maritima), la especie que da nombre al hábitat.'
WHERE p.slug = 'salinas-arenales-san-pedro-pinatar' AND h.slug = 'vegetacion-anual-sobre-1210';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Silene_ramosissima_2.jpg?width=1280',
  h.image_attribution = 'bymamo (CC BY-SA 4.0) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Colleja de arenal (Silene ramosissima), la especie que da nombre al hábitat.'
WHERE p.slug = 'salinas-arenales-san-pedro-pinatar' AND h.slug = 'dunas-con-cespedes-2230';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'salinas-arenales-san-pedro-pinatar' AND h.slug = 'dunas-moviles-de-2120';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Pistacia_lentiscus.jpg?width=1280',
  h.image_attribution = 'Lumbar~commonswiki (CC BY-SA 3.0) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Lentisco (Pistacia lentiscus), la especie que da nombre al hábitat.'
WHERE p.slug = 'salinas-arenales-san-pedro-pinatar' AND h.slug = 'dunas-moviles-embrionarias-2110';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Cakile-maritima-(eurMeersenf)_1.jpg?width=1280',
  h.image_attribution = 'Jürgen Howaldt (CC BY-SA 2.0 de) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Rugueta de mar (Cakile maritima), la especie que da nombre al hábitat.'
WHERE p.slug = 'salinas-arenales-san-pedro-pinatar' AND h.slug = 'dunas-fijas-de-2210';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Schoenus_nigricans_kz2.jpg?width=1280',
  h.image_attribution = 'Kenraiz, Krzysztof Ziarnek (CC BY-SA 4.0) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con juncia bastarda (Schoenus nigricans), la especie que da nombre al hábitat.'
WHERE p.slug = 'salinas-arenales-san-pedro-pinatar' AND h.slug = 'pastizales-salinos-mediterraneos-1410';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Sarcocornia_fruticosa.jpg?width=1280',
  h.image_attribution = 'Hans Hillewaert (CC BY-SA 3.0) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Sosa jabonera (Sarcocornia fruticosa), la especie que da nombre al hábitat.'
WHERE p.slug = 'salinas-arenales-san-pedro-pinatar' AND h.slug = 'matorrales-halofilos-mediterraneos-1420';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Suaeda_vera.JPG?width=1280',
  h.image_attribution = 'Xemenendura (CC BY-SA 4.0) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Sosa fina (Suaeda vera), la especie que da nombre al hábitat.'
WHERE p.slug = 'salinas-arenales-san-pedro-pinatar' AND h.slug = 'vegetacion-halonitrofila-anual-1310';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Juniperus_phoenicea1.jpg?width=1280',
  h.image_attribution = 'autor no indicado (CC BY-SA 3.0) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Sabina negral (Juniperus phoenicea), la especie que da nombre al hábitat.'
WHERE p.slug = 'salinas-arenales-san-pedro-pinatar' AND h.slug = 'dunas-litorales-con-2250';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Helianthemum_marminorense_EnfoqueFlor_2010-7-03_ParqueNaturalLagunasdelaMata.jpg?width=1280',
  h.image_attribution = 'Javier martin (Public domain) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Helianthemum marminorense (Helianthemum marminorense), la especie que da nombre al hábitat.'
WHERE p.slug = 'salinas-arenales-san-pedro-pinatar' AND h.slug = 'dunas-con-vegetacion-2260';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'salinas-arenales-san-pedro-pinatar' AND h.slug = 'lagunas-costeras-1150';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'salinas-arenales-san-pedro-pinatar' AND h.slug = 'acantilados-con-vegetacion-1240';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'salinas-arenales-san-pedro-pinatar' AND h.slug = 'estepas-salinas-mediterraneas-1510';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'salinas-arenales-san-pedro-pinatar' AND h.slug = 'galerias-y-matorrales-92D0';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'salinas-arenales-san-pedro-pinatar' AND h.slug = 'matorrales-halonitrofilos-pegano-1430';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Eberswalde_Zoo_12-2017_img2.jpg?width=1280',
  h.image_attribution = 'A.Savin (FAL) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Jabalí (Sus scrofa), la especie que da nombre al hábitat.'
WHERE p.slug = 'sierra-de-el-carche' AND h.slug = 'matorrales-arborescentes-de-5210';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Anthyllis_cytisoides.JPG?width=1280',
  h.image_attribution = 'Ximenex (CC BY-SA 2.1 es) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Albaida (Anthyllis cytisoides), la especie que da nombre al hábitat.'
WHERE p.slug = 'sierra-de-el-carche' AND h.slug = 'matorrales-termomediterraneos-y-5330';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Teucrium_pseudochamaepitys_M_1.jpg?width=1280',
  h.image_attribution = 'Adrian198cm (Public domain) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Hierba de la calentura (Teucrium pseudochamaepitys), la especie que da nombre al hábitat.'
WHERE p.slug = 'sierra-de-el-carche' AND h.slug = 'zonas-subestepicas-de-6220';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Carrasca_de_la_Raboseras.JPG?width=1280',
  h.image_attribution = 'Picamaderos (CC BY-SA 3.0) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Carrasca (Quercus rotundifolia), la especie que da nombre al hábitat.'
WHERE p.slug = 'sierra-de-el-carche' AND h.slug = 'encinares-de-quercus-9340';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Teucrium_pseudochamaepitys_M_1.jpg?width=1280',
  h.image_attribution = 'Adrian198cm (Public domain) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Hierba de la calentura (Teucrium pseudochamaepitys), la especie que da nombre al hábitat.'
WHERE p.slug = 'sierra-de-el-carche' AND h.slug = 'pendientes-rocosas-calcicolas-8210';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Eberswalde_Zoo_12-2017_img2.jpg?width=1280',
  h.image_attribution = 'A.Savin (FAL) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Jabalí (Sus scrofa), la especie que da nombre al hábitat.'
WHERE p.slug = 'sierra-de-el-carche' AND h.slug = 'vegetacion-gipsicola-iberica-1520';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Sedum_sediforme_hojas.jpg?width=1280',
  h.image_attribution = 'autor no indicado (CC BY-SA 3.0) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Uña de gato (Sedum sediforme), la especie que da nombre al hábitat.'
WHERE p.slug = 'sierra-de-el-carche' AND h.slug = 'prados-calcareos-carsticos-6110';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Juniperus_oxycedrus_g1.jpg?width=1280',
  h.image_attribution = 'autor no indicado (CC BY-SA 3.0) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Enebro de la miera (Juniperus oxycedrus), la especie que da nombre al hábitat.'
WHERE p.slug = 'sierra-de-el-carche' AND h.slug = 'bosques-endemicos-de-9560';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'sierra-de-el-carche' AND h.slug = 'prados-alpinos-y-6170';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/ERINACEA_ANTHYLLIS_-_SANT_MAMET.JPG?width=1280',
  h.image_attribution = 'Isidre blanc (CC BY-SA 3.0) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Aliaga (Erinacea anthyllis), la especie que da nombre al hábitat.'
WHERE p.slug = 'sierra-de-el-carche' AND h.slug = 'matorrales-mediterraneos-y-4090';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Pino_secolare_-_Castelleone_di_Suasa.JPG?width=1280',
  h.image_attribution = 'Accurimbono (CC BY-SA 3.0) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Pino carrasco (Pinus halepensis), la especie que da nombre al hábitat.'
WHERE p.slug = 'sierra-de-el-carche' AND h.slug = 'pinares-sub-mediterraneos-9530';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Eberswalde_Zoo_12-2017_img2.jpg?width=1280',
  h.image_attribution = 'A.Savin (FAL) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Jabalí (Sus scrofa), la especie que da nombre al hábitat.'
WHERE p.slug = 'sierra-de-la-pila' AND h.slug = 'matorrales-arborescentes-de-5210';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Cistus_albidus_flowers.jpg?width=1280',
  h.image_attribution = 'Júlio Reis (CC BY-SA 3.0) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Jara blanca (Cistus albidus), la especie que da nombre al hábitat.'
WHERE p.slug = 'sierra-de-la-pila' AND h.slug = 'matorrales-termomediterraneos-y-5330';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Brachypodium_retusum_espiga_seca.jpg?width=1280',
  h.image_attribution = 'Pere prlpz (CC BY-SA 2.5) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Lastón (Brachypodium retusum), la especie que da nombre al hábitat.'
WHERE p.slug = 'sierra-de-la-pila' AND h.slug = 'zonas-subestepicas-de-6220';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'sierra-de-la-pila' AND h.slug = 'prados-calcareos-carsticos-6110';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'sierra-de-la-pila' AND h.slug = 'pendientes-rocosas-calcicolas-8210';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Juniperus_oxycedrus_g1.jpg?width=1280',
  h.image_attribution = 'autor no indicado (CC BY-SA 3.0) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Enebro de la miera (Juniperus oxycedrus), la especie que da nombre al hábitat.'
WHERE p.slug = 'sierra-de-la-pila' AND h.slug = 'bosques-endemicos-de-9560';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Eberswalde_Zoo_12-2017_img2.jpg?width=1280',
  h.image_attribution = 'A.Savin (FAL) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Jabalí (Sus scrofa), la especie que da nombre al hábitat.'
WHERE p.slug = 'sierra-de-la-pila' AND h.slug = 'vegetacion-gipsicola-iberica-1520';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Quercus_coccifera_1.JPG?width=1280',
  h.image_attribution = 'User:Xemenendura (CC BY-SA 3.0) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Coscoja (Quercus coccifera), la especie que da nombre al hábitat.'
WHERE p.slug = 'sierra-de-la-pila' AND h.slug = 'encinares-de-quercus-9340';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'sierra-de-la-pila' AND h.slug = 'matorrales-mediterraneos-y-4090';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'sierra-de-la-pila' AND h.slug = 'galerias-y-matorrales-92D0';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Limonium_insigne.jpg?width=1280',
  h.image_attribution = 'ANE (CC BY-SA 4.0) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Siempreviva insigne (Limonium insigne), la especie que da nombre al hábitat.'
WHERE p.slug = 'sierra-de-las-moreras' AND h.slug = 'matorrales-termomediterraneos-y-5330';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Teucrium_lanigerum_kz01.jpg?width=1280',
  h.image_attribution = 'Krzysztof Ziarnek, Kenraiz (CC BY-SA 4.0) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Zamarrilla lanuda (Teucrium lanigerum), la especie que da nombre al hábitat.'
WHERE p.slug = 'sierra-de-las-moreras' AND h.slug = 'zonas-subestepicas-de-6220';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Chamaerops_humilis_Torreblanca.jpg?width=1280',
  h.image_attribution = 'Canaan (CC BY-SA 4.0) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Palmito (Chamaerops humilis), la especie que da nombre al hábitat.'
WHERE p.slug = 'sierra-de-las-moreras' AND h.slug = 'bosques-endemicos-de-9560';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/609975159/original.jpg',
  h.image_attribution = 'Quentin Groom (CC0) · GBIF',
  h.image_note = 'Portada ilustrada con Cornical (Periploca angustifolia), la especie que da nombre al hábitat.'
WHERE p.slug = 'sierra-de-las-moreras' AND h.slug = 'matorrales-arborescentes-de-5220';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'sierra-de-las-moreras' AND h.slug = 'prados-calcareos-carsticos-6110';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Teucrium_lanigerum_kz01.jpg?width=1280',
  h.image_attribution = 'Krzysztof Ziarnek, Kenraiz (CC BY-SA 4.0) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Zamarrilla lanuda (Teucrium lanigerum), la especie que da nombre al hábitat.'
WHERE p.slug = 'sierra-de-las-moreras' AND h.slug = 'pendientes-rocosas-calcicolas-8210';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Withania_frutescens0176.jpg?width=1280',
  h.image_attribution = 'Nanosanchez (CC BY-SA 4.0) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Oroval (Withania frutescens), la especie que da nombre al hábitat.'
WHERE p.slug = 'sierra-de-las-moreras' AND h.slug = 'matorrales-halonitrofilos-pegano-1430';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Limonium_insigne.jpg?width=1280',
  h.image_attribution = 'ANE (CC BY-SA 4.0) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Siempreviva insigne (Limonium insigne), la especie que da nombre al hábitat.'
WHERE p.slug = 'sierra-de-las-moreras' AND h.slug = 'acantilados-con-vegetacion-1240';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Lygeum_spartum-1.jpg?width=1280',
  h.image_attribution = 'Nanosanchez (CC BY-SA 3.0) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Albardín (Lygeum spartum), la especie que da nombre al hábitat.'
WHERE p.slug = 'sierra-de-las-moreras' AND h.slug = 'estepas-salinas-mediterraneas-1510';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Juniperus_oxycedrus_g1.jpg?width=1280',
  h.image_attribution = 'autor no indicado (CC BY-SA 3.0) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Enebro de la miera (Juniperus oxycedrus), la especie que da nombre al hábitat.'
WHERE p.slug = 'sierra-de-salinas' AND h.slug = 'matorrales-arborescentes-de-5210';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'sierra-de-salinas' AND h.slug = 'zonas-subestepicas-de-6220';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'sierra-de-salinas' AND h.slug = 'pendientes-rocosas-calcicolas-8210';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Carrasca_de_la_Raboseras.JPG?width=1280',
  h.image_attribution = 'Picamaderos (CC BY-SA 3.0) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Carrasca (Quercus rotundifolia), la especie que da nombre al hábitat.'
WHERE p.slug = 'sierra-de-salinas' AND h.slug = 'encinares-de-quercus-9340';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'sierra-de-salinas' AND h.slug = 'matorrales-mediterraneos-y-4090';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'sierra-de-salinas' AND h.slug = 'matorrales-termomediterraneos-y-5330';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'sierra-de-salinas' AND h.slug = 'bosques-galeria-de-92A0';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Juniperus_phoenicea1.jpg?width=1280',
  h.image_attribution = 'autor no indicado (CC BY-SA 3.0) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Sabina negral (Juniperus phoenicea), la especie que da nombre al hábitat.'
WHERE p.slug = 'sierra-espuna' AND h.slug = 'matorrales-arborescentes-de-5210';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Anthyllis_cytisoides.JPG?width=1280',
  h.image_attribution = 'Ximenex (CC BY-SA 2.1 es) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Albaida (Anthyllis cytisoides), la especie que da nombre al hábitat.'
WHERE p.slug = 'sierra-espuna' AND h.slug = 'matorrales-mediterraneos-y-4090';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Brachypodium_retusum_espiga_seca.jpg?width=1280',
  h.image_attribution = 'Pere prlpz (CC BY-SA 2.5) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Lastón (Brachypodium retusum), la especie que da nombre al hábitat.'
WHERE p.slug = 'sierra-espuna' AND h.slug = 'zonas-subestepicas-de-6220';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Quercus_coccifera_1.JPG?width=1280',
  h.image_attribution = 'User:Xemenendura (CC BY-SA 3.0) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Coscoja (Quercus coccifera), la especie que da nombre al hábitat.'
WHERE p.slug = 'sierra-espuna' AND h.slug = 'encinares-de-quercus-9340';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Juniperus_phoenicea1.jpg?width=1280',
  h.image_attribution = 'autor no indicado (CC BY-SA 3.0) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Sabina negral (Juniperus phoenicea), la especie que da nombre al hábitat.'
WHERE p.slug = 'sierra-espuna' AND h.slug = 'bosques-endemicos-de-9560';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Genista_cinerea26de_maig_2007_019.jpg?width=1280',
  h.image_attribution = 'Victor M. Vicente Selvas (Public domain) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Bolina (Genista cinerea), la especie que da nombre al hábitat.'
WHERE p.slug = 'sierra-espuna' AND h.slug = 'matorrales-termomediterraneos-y-5330';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Nerium_oleander_flowers_leaves.jpg?width=1280',
  h.image_attribution = 'Alvesgaspar (CC BY 2.5) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Baladre (Nerium oleander), la especie que da nombre al hábitat.'
WHERE p.slug = 'sierra-espuna' AND h.slug = 'galerias-y-matorrales-92D0';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'sierra-espuna' AND h.slug = 'prados-humedos-mediterraneos-6420';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Sedum_gypsicola_kz01.jpg?width=1280',
  h.image_attribution = 'Krzysztof Ziarnek, Kenraiz (CC BY-SA 4.0) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Pampajarito (Sedum gypsicola), la especie que da nombre al hábitat.'
WHERE p.slug = 'sierra-espuna' AND h.slug = 'prados-calcareos-carsticos-6110';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Centaurea_saxicola674.jpg?width=1280',
  h.image_attribution = 'Nanosanchez (CC BY-SA 3.0) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Cardo amarillo de roca (Centaurea saxicola), la especie que da nombre al hábitat.'
WHERE p.slug = 'sierra-espuna' AND h.slug = 'pendientes-rocosas-calcicolas-8210';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = NULL,
  h.image_attribution = NULL,
  h.image_note = NULL
WHERE p.slug = 'sierra-espuna' AND h.slug = 'prados-alpinos-y-6170';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Acer_monspessulanum_fg01.jpg?width=1280',
  h.image_attribution = 'Fritz Geller-Grimm (CC BY-SA 2.5) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Arce (Acer monspessulanum), la especie que da nombre al hábitat.'
WHERE p.slug = 'sierra-espuna' AND h.slug = 'robledales-ibericos-de-9240';

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Salix_pedicellata_Habitus_2009-9-27_CampoCalatrava.jpg?width=1280',
  h.image_attribution = 'javier martin (Public domain) · Wikimedia Commons',
  h.image_note = 'Portada ilustrada con Mimbre (Salix pedicellata), la especie que da nombre al hábitat.'
WHERE p.slug = 'sierra-espuna' AND h.slug = 'bosques-galeria-de-92A0';
