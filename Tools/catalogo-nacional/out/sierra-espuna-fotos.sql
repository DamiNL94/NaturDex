-- Fotos de especie (EIDOS multimedia + GBIF). Generado por Tools/catalogo-nacional/enrich-images.js
-- Parque: sierra-espuna · modo: missing · NC permitido · 2026-07-28T00:51:07.452Z
-- Correr DESPUÉS del INSERT INTO species (igual que el bloque de fotos del seed).

UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://iiif.rbge.org.uk/herb/iiif/E00075087/full/1600,/0/default.jpg',
        s.image_attribution = 'Royal Botanic Garden Edinburgh (CC0) · GBIF'
    WHERE s.scientific_name = 'Centaurea boissieri';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/627565219/original.jpg',
        s.image_attribution = 'Teo Albert (CC BY 4.0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Phlomis lychnitis';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/437836161/original.jpeg',
        s.image_attribution = 'Jorge Íñiguez (CC BY 4.0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Genista cinerea';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://medialib.naturalis.nl/file/id/U.1408022/format/large',
        s.image_attribution = 'Naturalis Biodiversity Center (CC0) · GBIF'
    WHERE s.scientific_name = 'Teucrium buxifolium';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/628578481/original.jpg',
        s.image_attribution = 'Piermario Maculan (CC0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Anthyllis vulneraria';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://medialib.naturalis.nl/file/id/WAG.1212574/format/large',
        s.image_attribution = 'Naturalis Biodiversity Center (CC0) · GBIF'
    WHERE s.scientific_name = 'Salix pedicellata';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/606455750/original.jpg',
        s.image_attribution = 'Cenaida (CC BY 4.0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Polypodium cambricum';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://bs.plantnet.org/image/o/8f1901f4ecc9fbbd186cc832c499ec95aa8a582d',
        s.image_attribution = 'Naturgrama (CC BY-SA 4.0) · GBIF'
    WHERE s.scientific_name = 'Teucrium leonis';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://medialib.naturalis.nl/file/id/L.1959854/format/large',
        s.image_attribution = 'Naturalis Biodiversity Center (CC0) · GBIF'
    WHERE s.scientific_name = 'Genista longipes';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/368209816/original.jpeg',
        s.image_attribution = 'Quentin Groom (CC0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Crepis albida';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/179119056/original.jpeg',
        s.image_attribution = 'Cristian (CC BY 4.0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Colchicum triphyllum';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/604771311/original.jpg',
        s.image_attribution = 'ashevillebirder (CC BY 4.0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Sonchus tenerrimus';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/416603941/original.jpeg',
        s.image_attribution = 'Nico Hernandez (CC BY 4.0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Campanula rotundifolia';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://medialib.naturalis.nl/file/id/L.3898448/format/large',
        s.image_attribution = 'Naturalis Biodiversity Center (CC0) · GBIF'
    WHERE s.scientific_name = 'Sideritis leucantha';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://ibss-images.calacademy.org/static/botany/originals/a7/84/a7849ba7-2add-45bd-9379-1b416fa6c292.jpg',
        s.image_attribution = 'Figuerola, R.; Peris, J. B.; Stübing, G. (CC0) · GBIF'
    WHERE s.scientific_name = 'Helictotrichon filifolium';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://medialib.naturalis.nl/file/id/L.2038587/format/large',
        s.image_attribution = 'Naturalis Biodiversity Center (CC0) · GBIF'
    WHERE s.scientific_name = 'Ononis ornithopodioides';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/637056917/original.jpg',
        s.image_attribution = 'Gonzalo Ganda Álvarez (CC BY 4.0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Halimium atriplicifolium';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/184117054/original.jpeg',
        s.image_attribution = 'Santiago Martín-Bravo (CC BY 4.0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Ononis speciosa';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/611428071/original.jpg',
        s.image_attribution = 'Mehmet Baran (CC0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Calicotome villosa';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://medialib.naturalis.nl/file/id/WAG.1962403/format/large',
        s.image_attribution = 'Naturalis Biodiversity Center (CC0) · GBIF'
    WHERE s.scientific_name = 'Gaudinia fragilis';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/636964955/original.jpg',
        s.image_attribution = 'Katrin Simon (CC BY 4.0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Scorpiurus muricatus';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://medialib.naturalis.nl/file/id/WAG.1971134/format/large',
        s.image_attribution = 'Naturalis Biodiversity Center (CC0) · GBIF'
    WHERE s.scientific_name = 'Teucrium rotundifolium';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/689523642/original.jpg',
        s.image_attribution = 'Tim Johnson (CC BY 4.0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Achillea ageratum';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/605394158/original.jpg',
        s.image_attribution = 'Pennyinsole (CC0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Ulex parviflorus';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/605035077/original.jpg',
        s.image_attribution = 'Pedro (CC0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Quercus rotundifolia';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://bs.plantnet.org/image/o/31e1f83acf64870ac08a7ad2d0633858d3cfba34',
        s.image_attribution = 'asanchismico (CC BY-SA 4.0) · GBIF'
    WHERE s.scientific_name = 'Marrubium supinum';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/622500470/original.jpg',
        s.image_attribution = 'Augustin Soulard (CC BY 4.0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Pseudodictamnus hirsutus';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/625702366/original.jpg',
        s.image_attribution = 'Zoltán Stekkelpak (CC0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Limodorum abortivum';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/606854316/original.jpg',
        s.image_attribution = 'a0tero (CC0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Convolvulus althaeoides';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/660731739/original.jpg',
        s.image_attribution = 'Teo Albert (CC BY 4.0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Bupleurum fruticescens';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/626782149/original.jpg',
        s.image_attribution = 'Marc Riera (CC BY 4.0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Bupleurum rigidum';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/612450490/original.jpg',
        s.image_attribution = 'Marc Riera (CC BY 4.0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Cistus laurifolius';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/612489339/original.jpg',
        s.image_attribution = 'Marc Riera (CC BY 4.0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Bupleurum fruticosum';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/605861482/original.jpg',
        s.image_attribution = 'Pedro (CC0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Asparagus acutifolius';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/660556467/original.jpg',
        s.image_attribution = 'Andrés Asun (CC0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Centaurea calcitrapa';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/627213014/original.jpg',
        s.image_attribution = 'Piermario Maculan (CC0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Allium roseum';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/619207348/original.jpg',
        s.image_attribution = 'Augustin Soulard (CC BY 4.0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Paronychia argentea';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/678173137/original.jpg',
        s.image_attribution = 'Naturgucker Tom (CC0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Petrorhagia prolifera';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/605017250/original.jpg',
        s.image_attribution = 'insiderelic (CC0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Populus alba';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/530150387/original.jpg',
        s.image_attribution = 'Svitlana Kyiak (CC0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Galatella sedifolia';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/626815831/original.jpg',
        s.image_attribution = 'Piermario Maculan (CC0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Verbascum sinuatum';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://d2jcv3kl45hlgi.cloudfront.net/1db6e8134f4b90cbdcaed7d6b62e055b.jpg',
        s.image_attribution = 'Royal Botanic Gardens, Kew (CC BY 4.0) · GBIF'
    WHERE s.scientific_name = 'Paronychia suffruticosa';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/634409059/original.jpg',
        s.image_attribution = 'Pavel Kúr (CC0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Genista umbellata';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/364428742/original.jpg',
        s.image_attribution = 'Chris Wyse (CC0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Stachys circinata';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/634858095/original.jpg',
        s.image_attribution = 'Pavel Kúr (CC0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Ulmus minor';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/675347784/original.jpg',
        s.image_attribution = 'Philip Precey (CC0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Echinops ritro';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/626831611/original.jpg',
        s.image_attribution = 'Piermario Maculan (CC0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Muscari comosum';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/612417995/original.jpg',
        s.image_attribution = 'Tiago Peregrina (CC0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Coronilla valentina';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://archimg.mnhn.lu/Collections/Herbarium_jpg/MNHNL149404.jpg',
        s.image_attribution = 'Barbara Ruthsatz (CC0) · National Museum of Natural History, Luxembourg/GBIF'
    WHERE s.scientific_name = 'Cotoneaster granatensis';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/627354253/original.jpg',
        s.image_attribution = 'Piermario Maculan (CC0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Ruta angustifolia';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/633333732/original.jpg',
        s.image_attribution = 'Pavel Kúr (CC0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Anacyclus valentinus';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/461934168/original.jpeg',
        s.image_attribution = 'Santiago Martín-Bravo (CC BY 4.0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Lactuca tenerrima';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/648705411/original.jpg',
        s.image_attribution = 'Santiago Martín-Bravo (CC BY 4.0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Paronychia capitata';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/607210456/original.jpg',
        s.image_attribution = 'Peter de Lange (CC0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Trifolium arvense';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/626619447/original.jpg',
        s.image_attribution = 'Piermario Maculan (CC0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Plantago afra';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/633108313/original.jpg',
        s.image_attribution = 'Frederic Pascual Dose (CC BY 4.0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Cormus domestica';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/654693161/original.jpg',
        s.image_attribution = 'Ina Siebert (CC0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Nigella damascena';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://bs.plantnet.org/image/o/958fe92057c0cc570a0da3f735ef05f061045b00',
        s.image_attribution = '🌴Anxo🌿 (CC BY-SA 4.0) · GBIF'
    WHERE s.scientific_name = 'Brachypodium phoenicoides';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/662164406/original.jpg',
        s.image_attribution = 'Heiko Hentschel (CC0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Klasea pinnatifida';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/604568834/original.jpg',
        s.image_attribution = 'S. Menéndez (CC BY 4.0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Certhia brachydactyla';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/634645409/original.jpg',
        s.image_attribution = 'euqirneto (CC BY 4.0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Circus pygargus';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/604505144/original.jpg',
        s.image_attribution = 'Cenaida (CC BY 4.0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Sylvia undata';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/694833948/original.jpg',
        s.image_attribution = 'MadMagpie (CC0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Turdus torquatus';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-espuna'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/616984675/original.jpg',
        s.image_attribution = 'David Pereira (CC BY 4.0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Mauremys leprosa';
