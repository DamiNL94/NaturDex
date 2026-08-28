-- El juego de caracteres se fija SIEMPRE: el cliente `mysql` lo toma del entorno y en un
-- contenedor sin locale eso es latin1, que convierte cada tilde en mojibake sin dar error.
SET NAMES utf8mb4;

-- ================================================================================================
-- NaturDex · retirada de las fichas que dejó el renombrado de recombinaciones del 2026-08-28
-- ------------------------------------------------------------------------------------------------
-- Generado por `node Tools/catalogo-nacional/fix-recombinaciones-eidos.js --write --sql`.
--
-- QUÉ ES ESTO. `build-park-sql.js` solo hace UPSERT y casa por `scientific_name`: ante un
-- renombrado inserta la ficha nueva y deja la vieja donde estaba, con su id y sus vínculos.
-- La base acaba con las dos, y la API manda sobre el paquete, así que el usuario ve las dos.
--
-- NINGUNA especie desaparece del catálogo: las veinte siguen ahí con el nombre que acepta
-- EIDOS. Lo que se retira es el nombre anterior, que ya no ficha nada.
--
-- LOS RENOMBRADOS, y la regla que los separa de los otros 28 casos de la deuda nº 36:
-- mismo epíteto, otro género, mismo rango. Un cambio de epíteto es un cambio de IDENTIDAD
-- y un trinomio que se vuelve binomio cambia de RANGO; ni unos ni otros están aquí.
--   · Eptesicus isabellinus  →  Cnephaeus isabellinus  (EIDOS taxonid 16225)
--   · Stipa capensis  →  Stipellula capensis  (EIDOS taxonid 10149)
--   · Saccharum ravennae  →  Tripidium ravennae  (EIDOS taxonid 80560)
--   · Ballota hirsuta  →  Pseudodictamnus hirsutus  (EIDOS taxonid 2631)
--   · Halimione portulacoides  →  Atriplex portulacoides  (EIDOS taxonid 5035)
--   · Salsola vermiculata  →  Caroxylon vermiculatum  (EIDOS taxonid 1341)
--   · Arthrocnemum macrostachyum  →  Arthrocaulon macrostachyum  (EIDOS taxonid 33034)
--   · Sedum sediforme  →  Petrosedum sediforme  (EIDOS taxonid 8225)
--   · Pseudorlaya pumila  →  Daucus pumilus  (EIDOS taxonid 7405)
--   · Calicotome intermedia  →  Cytisus intermedius  (EIDOS taxonid 2950)
--   · Calicotome spinosa  →  Cytisus spinosus  (EIDOS taxonid 2952)
--   · Calicotome infesta  →  Cytisus infestus  (EIDOS taxonid 2949)
--   · Merendera filifolia  →  Colchicum filifolium  (EIDOS taxonid 6169)
--   · Hymenolobus procumbens  →  Hornungia procumbens  (EIDOS taxonid 5124)
--   · Calystegia soldanella  →  Convolvulus soldanella  (EIDOS taxonid 2982)
--   · Chenopodium murale  →  Chenopodiastrum murale  (EIDOS taxonid 3549)
--   · Elymus elongatus  →  Thinopyrum elongatum  (EIDOS taxonid 10013)
--   · Orobanche ramosa  →  Phelipanche ramosa  (EIDOS taxonid 6861)
--   · Barbus sclateri  →  Luciobarbus sclateri  (EIDOS taxonid 12174)
--   · Lycocarpus fugax  →  Sisymbrium fugax  (EIDOS taxonid 5925)
--
-- DEPENDENCIAS, las mismas que comprobó `poda-renombrados-cabo-cope-puntas-calnegre.sql`:
--   · `species_habitats` tiene ON DELETE CASCADE; sus vínculos se van con la ficha.
--   · `observations` referencia `species_id`: el borrado lo RESPETA por su NOT EXISTS, y el
--     SELECT de arriba deja dicho cuántas hay antes de tocar nada.
--   · `user_occurrences` (Darwin Core) no tiene clave foránea a `species` y lleva su
--     taxonomía copiada, precisamente para esto: no se toca.
--   · Después de aplicarlo, `Tools/recalculate-account-progress.php`.
--
-- ORDEN: va DESPUÉS del `-n2.sql` de cada espacio, que es quien da de alta el nombre nuevo.
-- Es idempotente: aplicado dos veces, la segunda no borra nada.
-- ================================================================================================

START TRANSACTION;

-- ── cabezo-gordo ────────────────────────────────────────────  1 ficha(s)
SELECT COUNT(*) AS observaciones_que_bloquean_el_borrado
  FROM observations o JOIN species sp ON sp.id = o.species_id
  JOIN parks pk ON pk.id = sp.park_id
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name IN ('Eptesicus isabellinus');

DELETE sp FROM species sp
JOIN parks pk ON pk.id = sp.park_id
WHERE pk.slug = 'cabezo-gordo'
  AND sp.scientific_name IN ('Eptesicus isabellinus')
  AND NOT EXISTS (SELECT 1 FROM observations o WHERE o.species_id = sp.id);

-- ── cabo-cope-puntas-calnegre ───────────────────────────────  9 ficha(s)
SELECT COUNT(*) AS observaciones_que_bloquean_el_borrado
  FROM observations o JOIN species sp ON sp.id = o.species_id
  JOIN parks pk ON pk.id = sp.park_id
 WHERE pk.slug = 'cabo-cope-puntas-calnegre' AND sp.scientific_name IN ('Stipa capensis', 'Saccharum ravennae', 'Ballota hirsuta', 'Halimione portulacoides', 'Salsola vermiculata', 'Arthrocnemum macrostachyum', 'Sedum sediforme', 'Pseudorlaya pumila', 'Calicotome intermedia');

DELETE sp FROM species sp
JOIN parks pk ON pk.id = sp.park_id
WHERE pk.slug = 'cabo-cope-puntas-calnegre'
  AND sp.scientific_name IN ('Stipa capensis', 'Saccharum ravennae', 'Ballota hirsuta', 'Halimione portulacoides', 'Salsola vermiculata', 'Arthrocnemum macrostachyum', 'Sedum sediforme', 'Pseudorlaya pumila', 'Calicotome intermedia')
  AND NOT EXISTS (SELECT 1 FROM observations o WHERE o.species_id = sp.id);

-- ── calblanque-monte-cenizas-pena-aguila ────────────────────  6 ficha(s)
SELECT COUNT(*) AS observaciones_que_bloquean_el_borrado
  FROM observations o JOIN species sp ON sp.id = o.species_id
  JOIN parks pk ON pk.id = sp.park_id
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name IN ('Calicotome intermedia', 'Sedum sediforme', 'Calicotome spinosa', 'Arthrocnemum macrostachyum', 'Calicotome infesta', 'Merendera filifolia');

DELETE sp FROM species sp
JOIN parks pk ON pk.id = sp.park_id
WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila'
  AND sp.scientific_name IN ('Calicotome intermedia', 'Sedum sediforme', 'Calicotome spinosa', 'Arthrocnemum macrostachyum', 'Calicotome infesta', 'Merendera filifolia')
  AND NOT EXISTS (SELECT 1 FROM observations o WHERE o.species_id = sp.id);

-- ── carrascoy-y-el-valle ────────────────────────────────────  4 ficha(s)
SELECT COUNT(*) AS observaciones_que_bloquean_el_borrado
  FROM observations o JOIN species sp ON sp.id = o.species_id
  JOIN parks pk ON pk.id = sp.park_id
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name IN ('Sedum sediforme', 'Ballota hirsuta', 'Stipa capensis', 'Saccharum ravennae');

DELETE sp FROM species sp
JOIN parks pk ON pk.id = sp.park_id
WHERE pk.slug = 'carrascoy-y-el-valle'
  AND sp.scientific_name IN ('Sedum sediforme', 'Ballota hirsuta', 'Stipa capensis', 'Saccharum ravennae')
  AND NOT EXISTS (SELECT 1 FROM observations o WHERE o.species_id = sp.id);

-- ── cuatro-calas ────────────────────────────────────────────  4 ficha(s)
SELECT COUNT(*) AS observaciones_que_bloquean_el_borrado
  FROM observations o JOIN species sp ON sp.id = o.species_id
  JOIN parks pk ON pk.id = sp.park_id
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name IN ('Arthrocnemum macrostachyum', 'Pseudorlaya pumila', 'Sedum sediforme', 'Stipa capensis');

DELETE sp FROM species sp
JOIN parks pk ON pk.id = sp.park_id
WHERE pk.slug = 'cuatro-calas'
  AND sp.scientific_name IN ('Arthrocnemum macrostachyum', 'Pseudorlaya pumila', 'Sedum sediforme', 'Stipa capensis')
  AND NOT EXISTS (SELECT 1 FROM observations o WHERE o.species_id = sp.id);

-- ── espacios-abiertos-e-islas-del-mar-menor ─────────────────  5 ficha(s)
SELECT COUNT(*) AS observaciones_que_bloquean_el_borrado
  FROM observations o JOIN species sp ON sp.id = o.species_id
  JOIN parks pk ON pk.id = sp.park_id
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name IN ('Arthrocnemum macrostachyum', 'Sedum sediforme', 'Hymenolobus procumbens', 'Eptesicus isabellinus', 'Merendera filifolia');

DELETE sp FROM species sp
JOIN parks pk ON pk.id = sp.park_id
WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor'
  AND sp.scientific_name IN ('Arthrocnemum macrostachyum', 'Sedum sediforme', 'Hymenolobus procumbens', 'Eptesicus isabellinus', 'Merendera filifolia')
  AND NOT EXISTS (SELECT 1 FROM observations o WHERE o.species_id = sp.id);

-- ── humedal-del-ajauque-y-rambla-salada ─────────────────────  3 ficha(s)
SELECT COUNT(*) AS observaciones_que_bloquean_el_borrado
  FROM observations o JOIN species sp ON sp.id = o.species_id
  JOIN parks pk ON pk.id = sp.park_id
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name IN ('Sedum sediforme', 'Arthrocnemum macrostachyum', 'Eptesicus isabellinus');

DELETE sp FROM species sp
JOIN parks pk ON pk.id = sp.park_id
WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada'
  AND sp.scientific_name IN ('Sedum sediforme', 'Arthrocnemum macrostachyum', 'Eptesicus isabellinus')
  AND NOT EXISTS (SELECT 1 FROM observations o WHERE o.species_id = sp.id);

-- ── salinas-arenales-san-pedro-pinatar ──────────────────────  12 ficha(s)
SELECT COUNT(*) AS observaciones_que_bloquean_el_borrado
  FROM observations o JOIN species sp ON sp.id = o.species_id
  JOIN parks pk ON pk.id = sp.park_id
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name IN ('Arthrocnemum macrostachyum', 'Halimione portulacoides', 'Pseudorlaya pumila', 'Calystegia soldanella', 'Stipa capensis', 'Chenopodium murale', 'Elymus elongatus', 'Eptesicus isabellinus', 'Hymenolobus procumbens', 'Orobanche ramosa', 'Saccharum ravennae', 'Sedum sediforme');

DELETE sp FROM species sp
JOIN parks pk ON pk.id = sp.park_id
WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar'
  AND sp.scientific_name IN ('Arthrocnemum macrostachyum', 'Halimione portulacoides', 'Pseudorlaya pumila', 'Calystegia soldanella', 'Stipa capensis', 'Chenopodium murale', 'Elymus elongatus', 'Eptesicus isabellinus', 'Hymenolobus procumbens', 'Orobanche ramosa', 'Saccharum ravennae', 'Sedum sediforme')
  AND NOT EXISTS (SELECT 1 FROM observations o WHERE o.species_id = sp.id);

-- ── sierra-de-el-carche ─────────────────────────────────────  1 ficha(s)
SELECT COUNT(*) AS observaciones_que_bloquean_el_borrado
  FROM observations o JOIN species sp ON sp.id = o.species_id
  JOIN parks pk ON pk.id = sp.park_id
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name IN ('Sedum sediforme');

DELETE sp FROM species sp
JOIN parks pk ON pk.id = sp.park_id
WHERE pk.slug = 'sierra-de-el-carche'
  AND sp.scientific_name IN ('Sedum sediforme')
  AND NOT EXISTS (SELECT 1 FROM observations o WHERE o.species_id = sp.id);

-- ── sierra-de-la-pila ───────────────────────────────────────  1 ficha(s)
SELECT COUNT(*) AS observaciones_que_bloquean_el_borrado
  FROM observations o JOIN species sp ON sp.id = o.species_id
  JOIN parks pk ON pk.id = sp.park_id
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name IN ('Sedum sediforme');

DELETE sp FROM species sp
JOIN parks pk ON pk.id = sp.park_id
WHERE pk.slug = 'sierra-de-la-pila'
  AND sp.scientific_name IN ('Sedum sediforme')
  AND NOT EXISTS (SELECT 1 FROM observations o WHERE o.species_id = sp.id);

-- ── sotos-y-bosques-de-ribera-de-canaverosa ─────────────────  3 ficha(s)
SELECT COUNT(*) AS observaciones_que_bloquean_el_borrado
  FROM observations o JOIN species sp ON sp.id = o.species_id
  JOIN parks pk ON pk.id = sp.park_id
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name IN ('Barbus sclateri', 'Eptesicus isabellinus', 'Lycocarpus fugax');

DELETE sp FROM species sp
JOIN parks pk ON pk.id = sp.park_id
WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa'
  AND sp.scientific_name IN ('Barbus sclateri', 'Eptesicus isabellinus', 'Lycocarpus fugax')
  AND NOT EXISTS (SELECT 1 FROM observations o WHERE o.species_id = sp.id);

COMMIT;

-- Comprobación: ninguno de los nombres viejos debe quedar vivo.
SELECT sp.scientific_name, COUNT(*) AS filas FROM species sp
 WHERE sp.scientific_name IN ('Eptesicus isabellinus', 'Stipa capensis', 'Saccharum ravennae', 'Ballota hirsuta', 'Halimione portulacoides', 'Salsola vermiculata', 'Arthrocnemum macrostachyum', 'Sedum sediforme', 'Pseudorlaya pumila', 'Calicotome intermedia', 'Calicotome spinosa', 'Calicotome infesta', 'Merendera filifolia', 'Hymenolobus procumbens', 'Calystegia soldanella', 'Chenopodium murale', 'Elymus elongatus', 'Orobanche ramosa', 'Barbus sclateri', 'Lycocarpus fugax')
 GROUP BY sp.scientific_name;
