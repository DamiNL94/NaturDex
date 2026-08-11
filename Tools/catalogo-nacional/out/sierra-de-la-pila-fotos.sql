-- Fotos de especie (EIDOS multimedia + GBIF). Generado por Tools/catalogo-nacional/enrich-images.js
-- Parque: sierra-de-la-pila · modo: missing · NC excluido · 2026-08-11T11:23:53.934Z
-- Correr DESPUÉS del INSERT INTO species (igual que el bloque de fotos del seed).

UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-de-la-pila'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/127274887/original.jpeg',
        s.image_attribution = 'Denys Vynokurov (CC BY 4.0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Colutea brevialata';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-de-la-pila'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/477327648/original.jpeg',
        s.image_attribution = 'Franck Cabot (CC BY 4.0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Helictochloa bromoides';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-de-la-pila'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/171702141/original.jpg',
        s.image_attribution = 'Sara Navarro (CC BY 4.0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Microtus duodecimcostatus';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-de-la-pila'
    SET s.image_url = 'https://bs.plantnet.org/image/o/ba404fcf16ff8c29e139d41308827c139c69f20e',
        s.image_attribution = 'González Hernández Antonio (CC BY-SA 4.0) · GBIF'
    WHERE s.scientific_name = 'Paronychia suffruticosa';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-de-la-pila'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/516003817/original.jpg',
        s.image_attribution = 'Diego Nieto Lugilde (CC BY 4.0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Cynosurus effusus';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'sierra-de-la-pila'
    SET s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/655947971/original.jpg',
        s.image_attribution = 'Juan Martínez Reina (CC BY 4.0) · iNaturalist/GBIF'
    WHERE s.scientific_name = 'Campanula mollis';
