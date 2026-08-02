-- Fotos de especie (EIDOS multimedia + GBIF). Generado por Tools/catalogo-nacional/enrich-images.js
-- Parque: cuatro-calas · modo: missing · NC permitido · 2026-08-02T14:20:25.565Z
-- Correr DESPUÉS del INSERT INTO species (igual que el bloque de fotos del seed).

UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'cuatro-calas'
    SET s.image_url = 'https://observation.org/photos/125530399.jpg',
        s.image_attribution = 'Humedales de Navarra (CC BY-NC-ND 4.0) · GBIF'
    WHERE s.scientific_name = 'Bupleurum semicompositum';
UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = 'cuatro-calas'
    SET s.image_url = 'https://bs.plantnet.org/image/o/1cea66c737471deba2e169427549192ca0e41571',
        s.image_attribution = 'Diego Alex (CC BY-SA 4.0) · GBIF'
    WHERE s.scientific_name = 'Ammochloa palaestina';
