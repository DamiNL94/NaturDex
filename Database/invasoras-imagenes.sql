-- invasoras-imagenes.sql — foto y atribución de cada especie exótica invasora.
-- GENERADO por Tools/catalogo-nacional/invasoras-images.js --sql. No editar a mano.
-- La BD es la fuente de verdad de las invasoras (Backend/Api/invasoras.php): sin aplicar esto,
-- un despliegue con backend seguiría sirviendo las fotos viejas de GBIF.
-- Una especie puede tener una fila por CCAA; el UPDATE va por nombre científico y las cubre todas.

UPDATE especies_invasoras SET
  image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Psittacula_krameri_-Karnataka%2C_India-8.jpg?width=1280',
  image_attribution = 'ShivaShankar from Karkala (http://en.wikipedia.org/wiki/Karkala), I… (CC BY-SA 2.0) · Wikimedia Commons'
WHERE scientific_name = 'Psittacula krameri';

UPDATE especies_invasoras SET
  image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Lora_Myiopsitta_en_un_sauce_de_Uruguay.jpg?width=1280',
  image_attribution = 'Life is strange2 (CC BY-SA 4.0) · Wikimedia Commons'
WHERE scientific_name = 'Myiopsitta monachus';

UPDATE especies_invasoras SET
  image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Estrilda_astrild_-Gran_Canaria%2C_Canary_Islands%2C_Spain-8_(1).jpg?width=1280',
  image_attribution = 'Juan Emilio from Las Palmas de Gran Canaria, España (CC BY-SA 2.0) · Wikimedia Commons'
WHERE scientific_name = 'Estrilda astrild';

UPDATE especies_invasoras SET
  image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/2012-05-04_Fuerteventura_Atlantoxerus_Getulus_01.jpg?width=1280',
  image_attribution = 'Wo st 01 (There are 682 Pictures in my Category) See also Toolserver (CC BY-SA 3.0 de) · Wikimedia Commons'
WHERE scientific_name = 'Atlantoxerus getulus';

UPDATE especies_invasoras SET
  image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Charuteira_(Nicotiana_glauca)%2C_planta_t%C3%B3xica_parente_do_tabaco_(Bag%C3%A9-RS).jpg?width=1280',
  image_attribution = 'Gabriel Collares (CC BY 4.0) · Wikimedia Commons'
WHERE scientific_name = 'Nicotiana glauca';

UPDATE especies_invasoras SET
  image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Barbary_Dove.JPG?width=1280',
  image_attribution = 'autor no indicado (CC BY-SA 3.0) · Wikimedia Commons'
WHERE scientific_name = 'Streptopelia roseogrisea';

UPDATE especies_invasoras SET
  image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Ricinus_March_2010-1.jpg?width=1280',
  image_attribution = 'Alvesgaspar (CC BY-SA 3.0) · Wikimedia Commons'
WHERE scientific_name = 'Ricinus communis';

UPDATE especies_invasoras SET
  image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Oxalis-pes-caprae-16-Zachi-Evenor.jpg?width=1280',
  image_attribution = 'MathKnight and Zachi Evenor אביר המתמטיקה וצחי אבנור (CC BY-SA 4.0) · Wikimedia Commons'
WHERE scientific_name = 'Oxalis pes-caprae';

UPDATE especies_invasoras SET
  image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Starr_030419-0048_Ageratina_adenophora.jpg?width=1280',
  image_attribution = 'Forest & Kim Starr (CC BY 3.0) · Wikimedia Commons'
WHERE scientific_name = 'Ageratina adenophora';

UPDATE especies_invasoras SET
  image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Agave_americana74.jpg?width=1280',
  image_attribution = 'PDphoto.org (Public domain) · Wikimedia Commons'
WHERE scientific_name = 'Agave americana';

UPDATE especies_invasoras SET
  image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Purple_Fountain_Grass_(Pennisetum_setaceum)_in_Hyderabad%2C_AP_W_IMG_7797.jpg?width=1280',
  image_attribution = 'J.M.Garg (CC BY-SA 4.0) · Wikimedia Commons'
WHERE scientific_name = 'Cenchrus setaceus';

UPDATE especies_invasoras SET
  image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Red-vented_Bulbul_(Pycnonotus_cafer)_feeding_at_Kapok_(Ceiba_pentandra)_at_Kolkata_I_IMG_2535.jpg?width=1280',
  image_attribution = 'J.M.Garg (CC BY-SA 3.0) · Wikimedia Commons'
WHERE scientific_name = 'Pycnonotus cafer';

UPDATE especies_invasoras SET
  image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Rizoma_ca%C3%B1a_com%C3%BAn.jpg?width=1280',
  image_attribution = 'Xevi ssss (CC BY-SA 4.0) · Wikimedia Commons'
WHERE scientific_name = 'Arundo donax';

UPDATE especies_invasoras SET
  image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Opuntia_stricta%2C_S%C3%A8te%2C_H%C3%A9rault_01.jpg?width=1280',
  image_attribution = 'Christian Ferrer (CC BY-SA 4.0) · Wikimedia Commons'
WHERE scientific_name = 'Opuntia stricta';

UPDATE especies_invasoras SET
  image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Opuntia_dillenii_(Los_Sauces)_02_ies.jpg?width=1280',
  image_attribution = 'Frank Vincentz (CC BY-SA 3.0) · Wikimedia Commons'
WHERE scientific_name = 'Opuntia dillenii';

UPDATE especies_invasoras SET
  image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/ET_Afar_asv2018-01_img87_Abala_surroundings.jpg?width=1280',
  image_attribution = 'A.Savin (FAL) · Wikimedia Commons'
WHERE scientific_name = 'Calotropis procera';

UPDATE especies_invasoras SET
  image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Eschscholzia_californica_(2).jpg?width=1280',
  image_attribution = 'Joyce Cory on Flickr as docentjoycefrom u.s.a. (CC BY 2.0) · Wikimedia Commons'
WHERE scientific_name = 'Eschscholzia californica';

UPDATE especies_invasoras SET
  image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Ommatoiulusmoreletii.png?width=1280',
  image_attribution = 'J. Coelho (CC BY 2.0) · Wikimedia Commons'
WHERE scientific_name = 'Ommatoiulus moreletii';

UPDATE especies_invasoras SET
  image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Bons-dias_(Ipomoea_indica)_em_terreno_baldio_em_Bag%C3%A9_-_54958650515.jpg?width=1280',
  image_attribution = 'Gabriel Collares (CC BY 4.0) · Wikimedia Commons'
WHERE scientific_name = 'Ipomoea indica';

UPDATE especies_invasoras SET
  image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Armadillidium_vulgare_001.jpg?width=1280',
  image_attribution = 'Franco Folini (CC BY 2.5) · Wikimedia Commons'
WHERE scientific_name = 'Armadillidium vulgare';

UPDATE especies_invasoras SET
  image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/GardenValerian.jpg?width=1280',
  image_attribution = 'autor no indicado (CC BY-SA 3.0) · Wikimedia Commons'
WHERE scientific_name = 'Centranthus ruber';

UPDATE especies_invasoras SET
  image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Leucena.jpg?width=1280',
  image_attribution = 'Gabriel Collares (CC BY 4.0) · Wikimedia Commons'
WHERE scientific_name = 'Leucaena leucocephala';

UPDATE especies_invasoras SET
  image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Opuntia_amyclaea_Flora_Napolitana_Plate_236.jpg?width=1280',
  image_attribution = 'Michele Tenore (Copyrighted free use) · Wikimedia Commons'
WHERE scientific_name = 'Opuntia maxima';

UPDATE especies_invasoras SET
  image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/African_Sacred_Ibis%2C_Threskiornis_aethiopicus%2C_at_Pilanesberg_National_Park%2C_South_Africa_(45081681391).jpg?width=1280',
  image_attribution = 'Derek Keats from Johannesburg, South Africa (CC BY 2.0) · Wikimedia Commons'
WHERE scientific_name = 'Threskiornis aethiopicus';

UPDATE especies_invasoras SET
  image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Carpobrutus_edulis-P9200072.jpg?width=1280',
  image_attribution = 'Winfried Bruenken (Amrum) (CC BY-SA 2.5) · Wikimedia Commons'
WHERE scientific_name = 'Carpobrotus edulis';
