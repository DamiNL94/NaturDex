-- El juego de caracteres se fija SIEMPRE: el cliente mysql lo toma del entorno y en un
-- contenedor sin locale eso es latin1, que convierte cada tilde en mojibake sin dar error.
SET NAMES utf8mb4;

-- ================================================================================================
-- NaturDex · retirada de las fichas que dejó el realineado de nomenclatura del 2026-08-17
-- ------------------------------------------------------------------------------------------------
-- Generado por `node Tools/catalogo-nacional/fix-nomenclatura-eidos.js --sql`.
--
-- QUÉ ES ESTO, Y POR QUÉ NO LO GENERA `build-park-sql.js`
--
-- `build-park-sql.js` solo hace UPSERT y casa por `scientific_name`: ante un renombrado
-- inserta la ficha nueva y deja la vieja donde estaba, con su id y sus vínculos. La base
-- acaba con las dos, y la API manda sobre el paquete, así que el usuario ve las dos.
--
-- NINGUNA especie desaparece del catálogo: todas siguen ahí con su nombre de hoy, el que
-- acepta EIDOS. Lo que se retira es el nombre anterior, que ya no ficha nada.
--
-- LOS RENOMBRADOS, y con qué se comprobó cada uno:
--   · Sylvia communis  →  Curruca communis
--     taxonid 80921: «Sylvia communis Latham, 1787» es Sinónimo y «Curruca communis (Latham, 1787)» Aceptado/válido
--   · Sylvia hortensis  →  Curruca hortensis
--     taxonid 80927: «Sylvia hortensis (Gmelin, JF, 1789)» es Sinónimo y «Curruca hortensis (Gmelin, 1789)» Aceptado/válido
--   · Pallenis spinosa  →  Asteriscus spinosus
--     taxonid 80443: «Pallenis spinosa (L.) Cass.» es Sinónimo y «Asteriscus spinosus (L.) Schulz Bip.» Aceptado/válido
--   · Clinopodium acinos  →  Ziziphora acinos
--     taxonid 1795: «Clinopodium acinos (L.) Kuntze» es Sinónimo y «Ziziphora acinos (L.) Melnikov» Aceptado/válido
--   · Anethum ridolfia  →  Ridolfia segetum
--     taxonid 7791: «Anethum ridolfia Spalik & Reduron» es Sinónimo y «Ridolfia segetum (L.) Moris» Aceptado/válido
--   · Ornithogalum narbonense  →  Loncomelos narbonense
--     taxonid 6794: «Ornithogalum narbonense L.» es Sinónimo y «Loncomelos narbonense (L.) Raf.» Aceptado/válido
--   · Leuzea conifera  →  Rhaponticum coniferum
--     taxonid 643 es «Rhaponticum coniferum (L.) Greuter subsp. coniferum», la SUBESPECIE; la especie es el taxonid 7755, «Rhaponticum coniferum (L.) Greuter», Aceptado/válido. «Leuzea conifera (L.) DC.» es Sinónimo
--   · Coloeus monedula  →  Corvus monedula
--     taxonid 11769: «Coloeus monedula» es Sinónimo y «Corvus monedula Linnaeus, 1758» Aceptado/válido
--   · Sylvia undata  →  Curruca undata
--     taxonid 80931: «Sylvia undata (Boddaert, 1783)» es Sinónimo y «Curruca undata (Boddaert, 1783)» Aceptado/válido. Aplicado por fix-curruca-undata.js
--
-- DÓNDE SE BORRA. En los espacios donde hoy está el nombre NUEVO, que es más ancho que
-- «donde se renombró hoy» y a propósito: así barre también lo que dejara una carga
-- anterior. Donde el nombre viejo no exista, el DELETE no hace nada.
--
--   cabo-cope-puntas-calnegre: Sylvia undata
--   carrascoy-y-el-valle: Pallenis spinosa, Sylvia undata
--   monte-arabi: Sylvia undata
--   sierra-de-el-carche: Sylvia communis, Pallenis spinosa, Clinopodium acinos, Anethum ridolfia, Ornithogalum narbonense, Sylvia undata
--   sierra-de-la-pila: Sylvia communis, Sylvia hortensis, Pallenis spinosa, Leuzea conifera, Sylvia undata
--   sierra-de-salinas: Coloeus monedula, Sylvia undata
--   sierra-espuna: Sylvia undata
--
-- DEPENDENCIAS, las mismas que comprobó `poda-renombrados-cabo-cope-puntas-calnegre.sql`:
--   · `species_habitats` tiene ON DELETE CASCADE; sus vínculos se van con la ficha.
--   · `observations` referencia `species_id`: el borrado se ABORTA si hay alguna, porque
--     una observación de un usuario no se tira para cuadrar un contador.
--   · `user_occurrences` (Darwin Core) no tiene clave foránea a `species` y lleva su
--     taxonomía copiada, precisamente para esto: no se toca.
--   · Después de aplicarlo, `Tools/recalculate-account-progress.php`.
--
-- ORDEN: va DESPUÉS del `-n2.sql` de cada espacio, que es quien da de alta el nombre nuevo.
-- Es idempotente: aplicado dos veces, la segunda no borra nada.
-- ================================================================================================

START TRANSACTION;

-- ── cabo-cope-puntas-calnegre ───────────────────────────────────
-- Guardián: si algún usuario ha observado una de estas fichas, este SELECT lo deja dicho
-- antes de borrar, y el DELETE de abajo la respeta por su NOT EXISTS.
SELECT COUNT(*) AS observaciones_que_bloquean_el_borrado
  FROM observations o JOIN species sp ON sp.id = o.species_id
  JOIN parks pk ON pk.id = sp.park_id
 WHERE pk.slug = 'cabo-cope-puntas-calnegre' AND sp.scientific_name IN ('Sylvia undata');

DELETE sp FROM species sp
JOIN parks pk ON pk.id = sp.park_id
WHERE pk.slug = 'cabo-cope-puntas-calnegre'
  AND sp.scientific_name IN (
    'Sylvia undata'
  )
  AND NOT EXISTS (SELECT 1 FROM observations o WHERE o.species_id = sp.id);

-- ── carrascoy-y-el-valle ────────────────────────────────────────
-- Guardián: si algún usuario ha observado una de estas fichas, este SELECT lo deja dicho
-- antes de borrar, y el DELETE de abajo la respeta por su NOT EXISTS.
SELECT COUNT(*) AS observaciones_que_bloquean_el_borrado
  FROM observations o JOIN species sp ON sp.id = o.species_id
  JOIN parks pk ON pk.id = sp.park_id
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name IN ('Pallenis spinosa', 'Sylvia undata');

DELETE sp FROM species sp
JOIN parks pk ON pk.id = sp.park_id
WHERE pk.slug = 'carrascoy-y-el-valle'
  AND sp.scientific_name IN (
    'Pallenis spinosa',
    'Sylvia undata'
  )
  AND NOT EXISTS (SELECT 1 FROM observations o WHERE o.species_id = sp.id);

-- ── monte-arabi ─────────────────────────────────────────────────
-- Guardián: si algún usuario ha observado una de estas fichas, este SELECT lo deja dicho
-- antes de borrar, y el DELETE de abajo la respeta por su NOT EXISTS.
SELECT COUNT(*) AS observaciones_que_bloquean_el_borrado
  FROM observations o JOIN species sp ON sp.id = o.species_id
  JOIN parks pk ON pk.id = sp.park_id
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name IN ('Sylvia undata');

DELETE sp FROM species sp
JOIN parks pk ON pk.id = sp.park_id
WHERE pk.slug = 'monte-arabi'
  AND sp.scientific_name IN (
    'Sylvia undata'
  )
  AND NOT EXISTS (SELECT 1 FROM observations o WHERE o.species_id = sp.id);

-- ── sierra-de-el-carche ─────────────────────────────────────────
-- Guardián: si algún usuario ha observado una de estas fichas, este SELECT lo deja dicho
-- antes de borrar, y el DELETE de abajo la respeta por su NOT EXISTS.
SELECT COUNT(*) AS observaciones_que_bloquean_el_borrado
  FROM observations o JOIN species sp ON sp.id = o.species_id
  JOIN parks pk ON pk.id = sp.park_id
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name IN ('Sylvia communis', 'Pallenis spinosa', 'Clinopodium acinos', 'Anethum ridolfia', 'Ornithogalum narbonense', 'Sylvia undata');

DELETE sp FROM species sp
JOIN parks pk ON pk.id = sp.park_id
WHERE pk.slug = 'sierra-de-el-carche'
  AND sp.scientific_name IN (
    'Sylvia communis',
    'Pallenis spinosa',
    'Clinopodium acinos',
    'Anethum ridolfia',
    'Ornithogalum narbonense',
    'Sylvia undata'
  )
  AND NOT EXISTS (SELECT 1 FROM observations o WHERE o.species_id = sp.id);

-- ── sierra-de-la-pila ───────────────────────────────────────────
-- Guardián: si algún usuario ha observado una de estas fichas, este SELECT lo deja dicho
-- antes de borrar, y el DELETE de abajo la respeta por su NOT EXISTS.
SELECT COUNT(*) AS observaciones_que_bloquean_el_borrado
  FROM observations o JOIN species sp ON sp.id = o.species_id
  JOIN parks pk ON pk.id = sp.park_id
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name IN ('Sylvia communis', 'Sylvia hortensis', 'Pallenis spinosa', 'Leuzea conifera', 'Sylvia undata');

DELETE sp FROM species sp
JOIN parks pk ON pk.id = sp.park_id
WHERE pk.slug = 'sierra-de-la-pila'
  AND sp.scientific_name IN (
    'Sylvia communis',
    'Sylvia hortensis',
    'Pallenis spinosa',
    'Leuzea conifera',
    'Sylvia undata'
  )
  AND NOT EXISTS (SELECT 1 FROM observations o WHERE o.species_id = sp.id);

-- ── sierra-de-salinas ───────────────────────────────────────────
-- Guardián: si algún usuario ha observado una de estas fichas, este SELECT lo deja dicho
-- antes de borrar, y el DELETE de abajo la respeta por su NOT EXISTS.
SELECT COUNT(*) AS observaciones_que_bloquean_el_borrado
  FROM observations o JOIN species sp ON sp.id = o.species_id
  JOIN parks pk ON pk.id = sp.park_id
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name IN ('Coloeus monedula', 'Sylvia undata');

DELETE sp FROM species sp
JOIN parks pk ON pk.id = sp.park_id
WHERE pk.slug = 'sierra-de-salinas'
  AND sp.scientific_name IN (
    'Coloeus monedula',
    'Sylvia undata'
  )
  AND NOT EXISTS (SELECT 1 FROM observations o WHERE o.species_id = sp.id);

-- ── sierra-espuna ───────────────────────────────────────────────
-- Guardián: si algún usuario ha observado una de estas fichas, este SELECT lo deja dicho
-- antes de borrar, y el DELETE de abajo la respeta por su NOT EXISTS.
SELECT COUNT(*) AS observaciones_que_bloquean_el_borrado
  FROM observations o JOIN species sp ON sp.id = o.species_id
  JOIN parks pk ON pk.id = sp.park_id
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name IN ('Sylvia undata');

DELETE sp FROM species sp
JOIN parks pk ON pk.id = sp.park_id
WHERE pk.slug = 'sierra-espuna'
  AND sp.scientific_name IN (
    'Sylvia undata'
  )
  AND NOT EXISTS (SELECT 1 FROM observations o WHERE o.species_id = sp.id);

COMMIT;

-- Comprobación: las dos cuentas deben salir a 0.
SELECT 'cabo-cope-puntas-calnegre' AS espacio, COUNT(*) AS nombres_viejos_que_siguen
  FROM species sp JOIN parks pk ON pk.id = sp.park_id
 WHERE pk.slug = 'cabo-cope-puntas-calnegre' AND sp.scientific_name IN ('Sylvia undata');
SELECT 'carrascoy-y-el-valle' AS espacio, COUNT(*) AS nombres_viejos_que_siguen
  FROM species sp JOIN parks pk ON pk.id = sp.park_id
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name IN ('Pallenis spinosa', 'Sylvia undata');
SELECT 'monte-arabi' AS espacio, COUNT(*) AS nombres_viejos_que_siguen
  FROM species sp JOIN parks pk ON pk.id = sp.park_id
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name IN ('Sylvia undata');
SELECT 'sierra-de-el-carche' AS espacio, COUNT(*) AS nombres_viejos_que_siguen
  FROM species sp JOIN parks pk ON pk.id = sp.park_id
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name IN ('Sylvia communis', 'Pallenis spinosa', 'Clinopodium acinos', 'Anethum ridolfia', 'Ornithogalum narbonense', 'Sylvia undata');
SELECT 'sierra-de-la-pila' AS espacio, COUNT(*) AS nombres_viejos_que_siguen
  FROM species sp JOIN parks pk ON pk.id = sp.park_id
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name IN ('Sylvia communis', 'Sylvia hortensis', 'Pallenis spinosa', 'Leuzea conifera', 'Sylvia undata');
SELECT 'sierra-de-salinas' AS espacio, COUNT(*) AS nombres_viejos_que_siguen
  FROM species sp JOIN parks pk ON pk.id = sp.park_id
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name IN ('Coloeus monedula', 'Sylvia undata');
SELECT 'sierra-espuna' AS espacio, COUNT(*) AS nombres_viejos_que_siguen
  FROM species sp JOIN parks pk ON pk.id = sp.park_id
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name IN ('Sylvia undata');
