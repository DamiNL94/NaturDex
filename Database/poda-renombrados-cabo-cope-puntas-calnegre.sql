-- El juego de caracteres se fija SIEMPRE: el cliente mysql lo toma del entorno y en un
-- contenedor sin locale eso es latin1, que convierte cada tilde en mojibake sin dar error.
SET NAMES utf8mb4;

-- ================================================================================================
-- NaturDex · Cabo Cope y Puntas de Calnegre — retirada de tres fichas que dejó un renombrado
-- ------------------------------------------------------------------------------------------------
-- QUÉ ES ESTO, Y POR QUÉ NO LO GENERA `build-park-sql.js`
--
-- `build-park-sql.js` solo hace UPSERT (`INSERT … ON DUPLICATE KEY UPDATE`), y casa por
-- `scientific_name`. Eso vale para dar de alta y para corregir, y **no vale para un RENOMBRADO**:
-- cuando el catálogo pasa a llamar de otra forma a un taxón, el UPSERT inserta la ficha nueva y
-- deja la vieja donde estaba, con su `id` y sus vínculos. La base acaba con las dos.
--
-- El `CLAUDE.md` §2 avisa de que renombrar un taxón deja rastro en dos sitios —el catálogo universal
-- y `data/contenido/`—. Éste es el tercero, y es el único que no se ve desde el repositorio: hace
-- falta cargar el SQL y contar. Al hacerlo (2026-08-16) salieron **165 fichas en la base contra 162
-- en el paquete**.
--
-- LAS TRES, UNA A UNA. Ninguna desaparece del catálogo: las tres siguen ahí con su nombre de hoy.
--
--   · id 19  `Olea europaea var. sylvestris`  →  hoy es `Olea europaea subsp. europaea` (#19)
--   · id 159 `Salvia rosmarinus`              →  hoy es `Rosmarinus officinalis` (#159)
--   · id 101 `Leucanthemum decipiens`         →  ya no está en el paquete del piloto con ningún
--            nombre del género; se retira porque la API no puede servir una ficha que el paquete no
--            tiene, y si vuelve, vuelve por el pipeline y no por un resto del `seed.sql`.
--
-- DEPENDENCIAS, comprobadas antes de escribir esto sobre la carga del 2026-08-16:
--   · `species_habitats` tiene ON DELETE CASCADE; sus vínculos se van con la ficha.
--   · `observations` referencia `species_id`: se comprueba antes de borrar y el borrado se ABORTA si
--     hay alguna, porque una observación de un usuario no se tira para cuadrar un contador.
--   · `user_occurrences` (Darwin Core) NO tiene clave foránea a `species` y lleva su taxonomía
--     copiada, precisamente para esto: no se toca.
--   · Después de aplicarlo hay que pasar `Tools/recalculate-account-progress.php`, igual que tras
--     una poda de aves.
--
-- Es idempotente: aplicado dos veces, la segunda no borra nada.
-- ================================================================================================

START TRANSACTION;

-- Guardián: si algún usuario ha observado una de las tres, este SELECT falla el script antes de
-- borrar nada. Cuadrar un contador nunca vale lo que vale el registro de una persona.
SELECT
  IF(COUNT(*) = 0, 'sin observaciones: se puede borrar',
     (SELECT CONCAT('ABORTADO: ', COUNT(*), ' observacion(es) de usuario apuntan a estas fichas')
        FROM observations o JOIN species sp2 ON sp2.id = o.species_id
        JOIN parks pk2 ON pk2.id = sp2.park_id
       WHERE pk2.slug = 'cabo-cope-puntas-calnegre'
         AND sp2.scientific_name IN ('Olea europaea var. sylvestris', 'Salvia rosmarinus', 'Leucanthemum decipiens'))
  ) AS comprobacion
FROM observations o
JOIN species sp ON sp.id = o.species_id
JOIN parks pk ON pk.id = sp.park_id
WHERE pk.slug = 'cabo-cope-puntas-calnegre'
  AND sp.scientific_name IN ('Olea europaea var. sylvestris', 'Salvia rosmarinus', 'Leucanthemum decipiens');

DELETE sp FROM species sp
JOIN parks pk ON pk.id = sp.park_id
WHERE pk.slug = 'cabo-cope-puntas-calnegre'
  AND sp.scientific_name IN (
    'Olea europaea var. sylvestris',  -- Acebuche · hoy Olea europaea subsp. europaea
    'Salvia rosmarinus',              -- Romero · hoy Rosmarinus officinalis
    'Leucanthemum decipiens'          -- Leucanto litoral · ya no está en el paquete
  )
  AND NOT EXISTS (
    SELECT 1 FROM observations o WHERE o.species_id = sp.id
  );

COMMIT;
