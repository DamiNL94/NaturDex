-- habitats-imagenes.sql — portada, atribución y nota de cada hábitat.
-- GENERADO por Tools/catalogo-nacional/habitat-images.js --sql. No editar a mano.
-- Requiere las columnas habitats.image_attribution e image_note (Database/migrations.sql).

UPDATE habitats h JOIN parks p ON p.id = h.park_id SET
  h.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/611359925/original.jpg',
  h.image_attribution = 'Xavier Rufray (CC BY-NC 4.0) · iNaturalist/GBIF · obs. EAU (revisar: existe en salinas de España)',
  h.image_note = 'Portada ilustrada con Sosa jabonera (Halocnemum strobilaceum), la especie que da nombre al hábitat.'
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
