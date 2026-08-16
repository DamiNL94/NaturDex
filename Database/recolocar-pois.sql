-- El juego de caracteres se fija SIEMPRE: el cliente mysql lo toma del entorno y en un
-- contenedor sin locale eso es latin1, que convierte cada tilde en mojibake sin dar error.
SET NAMES utf8mb4;

-- ================================================================================
-- Recolocación de puntos de interés que perdieron sus coordenadas.
-- Origen del dato: Frontend/Data/parks/**/park.json (versionado en git), contrastado
-- contra Database/snapshot.sql. Ambas fuentes coinciden hasta la sexta cifra decimal.
--
-- SOLO toca filas con latitude o longitude a NULL: una coordenada que ya tenga valor
-- (la original, o una que hayas corregido a mano) se queda como está. Es idempotente:
-- pasarlo dos veces no cambia nada la segunda vez.
-- ================================================================================

START TRANSACTION;

-- cabo-cope-puntas-calnegre (15 POIs)
UPDATE points_of_interest x JOIN parks p ON p.id = x.park_id
   SET x.latitude = 37.427932, x.longitude = -1.493014
 WHERE p.slug = 'cabo-cope-puntas-calnegre' AND x.slug = 'cabo-cope'
   AND (x.latitude IS NULL OR x.longitude IS NULL);
UPDATE points_of_interest x JOIN parks p ON p.id = x.park_id
   SET x.latitude = 37.48348, x.longitude = -1.46224
 WHERE p.slug = 'cabo-cope-puntas-calnegre' AND x.slug = 'cala-blanca'
   AND (x.latitude IS NULL OR x.longitude IS NULL);
UPDATE points_of_interest x JOIN parks p ON p.id = x.park_id
   SET x.latitude = 37.43452, x.longitude = -1.50347
 WHERE p.slug = 'cabo-cope-puntas-calnegre' AND x.slug = 'calabardina'
   AND (x.latitude IS NULL OR x.longitude IS NULL);
UPDATE points_of_interest x JOIN parks p ON p.id = x.park_id
   SET x.latitude = 37.441423, x.longitude = -1.484144
 WHERE p.slug = 'cabo-cope-puntas-calnegre' AND x.slug = 'dunas-fosiles-cope'
   AND (x.latitude IS NULL OR x.longitude IS NULL);
UPDATE points_of_interest x JOIN parks p ON p.id = x.park_id
   SET x.latitude = 37.43563, x.longitude = -1.48484
 WHERE p.slug = 'cabo-cope-puntas-calnegre' AND x.slug = 'ermita-cope'
   AND (x.latitude IS NULL OR x.longitude IS NULL);
UPDATE points_of_interest x JOIN parks p ON p.id = x.park_id
   SET x.latitude = 37.433713, x.longitude = -1.483251
 WHERE p.slug = 'cabo-cope-puntas-calnegre' AND x.slug = 'fuente-piratas'
   AND (x.latitude IS NULL OR x.longitude IS NULL);
UPDATE points_of_interest x JOIN parks p ON p.id = x.park_id
   SET x.latitude = 37.511086, x.longitude = -1.457429
 WHERE p.slug = 'cabo-cope-puntas-calnegre' AND x.slug = 'lomo-bas'
   AND (x.latitude IS NULL OR x.longitude IS NULL);
UPDATE points_of_interest x JOIN parks p ON p.id = x.park_id
   SET x.latitude = 37.506887, x.longitude = -1.416314
 WHERE p.slug = 'cabo-cope-puntas-calnegre' AND x.slug = 'playa-calnegre'
   AND (x.latitude IS NULL OR x.longitude IS NULL);
UPDATE points_of_interest x JOIN parks p ON p.id = x.park_id
   SET x.latitude = 37.449442, x.longitude = -1.482124
 WHERE p.slug = 'cabo-cope-puntas-calnegre' AND x.slug = 'playa-Charco'
   AND (x.latitude IS NULL OR x.longitude IS NULL);
UPDATE points_of_interest x JOIN parks p ON p.id = x.park_id
   SET x.latitude = 37.43294, x.longitude = -1.47693
 WHERE p.slug = 'cabo-cope-puntas-calnegre' AND x.slug = 'punta-cabricas'
   AND (x.latitude IS NULL OR x.longitude IS NULL);
UPDATE points_of_interest x JOIN parks p ON p.id = x.park_id
   SET x.latitude = 37.507796, x.longitude = -1.403058
 WHERE p.slug = 'cabo-cope-puntas-calnegre' AND x.slug = 'puntas-calnegre'
   AND (x.latitude IS NULL OR x.longitude IS NULL);
UPDATE points_of_interest x JOIN parks p ON p.id = x.park_id
   SET x.latitude = 37.49241, x.longitude = -1.49957
 WHERE p.slug = 'cabo-cope-puntas-calnegre' AND x.slug = 'ruinas-garrobillo'
   AND (x.latitude IS NULL OR x.longitude IS NULL);
UPDATE points_of_interest x JOIN parks p ON p.id = x.park_id
   SET x.latitude = 37.43695, x.longitude = -1.48441
 WHERE p.slug = 'cabo-cope-puntas-calnegre' AND x.slug = 'torre-cope'
   AND (x.latitude IS NULL OR x.longitude IS NULL);
UPDATE points_of_interest x JOIN parks p ON p.id = x.park_id
   SET x.latitude = 37.471473, x.longitude = -1.469368
 WHERE p.slug = 'cabo-cope-puntas-calnegre' AND x.slug = 'yacimientos-cope-galera'
   AND (x.latitude IS NULL OR x.longitude IS NULL);
UPDATE points_of_interest x JOIN parks p ON p.id = x.park_id
   SET x.latitude = 37.494, x.longitude = -1.498
 WHERE p.slug = 'cabo-cope-puntas-calnegre' AND x.slug = 'yacimientos-garrobillo'
   AND (x.latitude IS NULL OR x.longitude IS NULL);

-- Comprobación: si esto devuelve alguna fila, ese POI no estaba en el park.json y hay
-- que situarlo a mano desde el panel (el mini-mapa del formulario).
SELECT p.slug AS parque, x.slug, x.name
  FROM points_of_interest x JOIN parks p ON p.id = x.park_id
 WHERE x.latitude IS NULL OR x.longitude IS NULL;

COMMIT;
