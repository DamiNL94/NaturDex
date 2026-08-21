-- El juego de caracteres se fija SIEMPRE: el cliente mysql lo toma del entorno y en un
-- contenedor sin locale eso es latin1, que convierte cada tilde en mojibake sin dar error.
SET NAMES utf8mb4;

-- ================================================================================================
-- NaturDex · retirada de las dos fichas que llevaban la AUTORÍA dentro del nombre científico
-- ------------------------------------------------------------------------------------------------
-- `scientificName` es el binomio, no la cita. Estas dos entraron por el Formulario Normalizado
-- del sitio Red Natura 2000 —que cita con autoría— y nadie se la quitó:
--
--   · «Merendera filifolia Cambess.»  →  «Merendera filifolia»
--   · «Echinophora spinosa L.»        →  «Echinophora spinosa»
--
-- No es cosmético. El nombre es la clave con la que se indexan el catálogo universal, los textos
-- de `data/contenido/` y la fila de `species`, así que la ficha con autoría no casaba con su
-- propia especie escrita en ningún otro sitio — y estaba a punto de propagarse a un tercer
-- espacio, porque las dos figuran también en el anexo del Plan del Mar Menor.
--
-- QUÉ ES ESTO, Y POR QUÉ NO LO GENERA `build-park-sql.js`
--
-- `build-park-sql.js` solo hace UPSERT y casa por `scientific_name`: ante un renombrado
-- inserta la ficha nueva y deja la vieja donde estaba, con su id y sus vínculos. La base acaba
-- con las dos, y la API manda sobre el paquete, así que el usuario ve las dos.
--
-- NINGUNA especie desaparece del catálogo: las dos siguen ahí con el binomio limpio.
--
-- OJO CON LO QUE ESTO **NO** ARREGLA: `Merendera filifolia` es un nombre que EIDOS da por
-- SINÓNIMO de `Colchicum filifolium`. Quitarle la autoría no la renombra, solo la deja
-- consistente con las otras 21 fichas que están en ese mismo caso (deuda nº 27), que se resuelven
-- una a una y con la fuente delante. `Echinophora spinosa` sí es el nombre que acepta EIDOS.
--
-- `species_habitats` tiene ON DELETE CASCADE; sus vínculos se van con la ficha.
-- Es idempotente: aplicado dos veces, la segunda no borra nada.
-- ================================================================================================

START TRANSACTION;

-- ── calblanque-monte-cenizas-pena-aguila ───────────────────────────────────
-- Guardián: si algún usuario ha observado una de estas fichas, este SELECT lo deja dicho
-- antes de borrar, y el DELETE de abajo la respeta por su NOT EXISTS.
SELECT COUNT(*) AS observaciones_que_bloquean_el_borrado
  FROM observations o JOIN species sp ON sp.id = o.species_id
  JOIN parks pk ON pk.id = sp.park_id
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name IN ('Merendera filifolia Cambess.');

DELETE sp FROM species sp
JOIN parks pk ON pk.id = sp.park_id
WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila'
  AND sp.scientific_name IN ('Merendera filifolia Cambess.')
  AND NOT EXISTS (SELECT 1 FROM observations o WHERE o.species_id = sp.id);

-- ── espacios-abiertos-e-islas-del-mar-menor ───────────────────────────────────
-- Guardián: si algún usuario ha observado una de estas fichas, este SELECT lo deja dicho
-- antes de borrar, y el DELETE de abajo la respeta por su NOT EXISTS.
SELECT COUNT(*) AS observaciones_que_bloquean_el_borrado
  FROM observations o JOIN species sp ON sp.id = o.species_id
  JOIN parks pk ON pk.id = sp.park_id
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name IN ('Echinophora spinosa L.', 'Merendera filifolia Cambess.');

DELETE sp FROM species sp
JOIN parks pk ON pk.id = sp.park_id
WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor'
  AND sp.scientific_name IN ('Echinophora spinosa L.', 'Merendera filifolia Cambess.')
  AND NOT EXISTS (SELECT 1 FROM observations o WHERE o.species_id = sp.id);

-- ── salinas-arenales-san-pedro-pinatar ───────────────────────────────────
-- Guardián: si algún usuario ha observado una de estas fichas, este SELECT lo deja dicho
-- antes de borrar, y el DELETE de abajo la respeta por su NOT EXISTS.
SELECT COUNT(*) AS observaciones_que_bloquean_el_borrado
  FROM observations o JOIN species sp ON sp.id = o.species_id
  JOIN parks pk ON pk.id = sp.park_id
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name IN ('Echinophora spinosa L.');

DELETE sp FROM species sp
JOIN parks pk ON pk.id = sp.park_id
WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar'
  AND sp.scientific_name IN ('Echinophora spinosa L.')
  AND NOT EXISTS (SELECT 1 FROM observations o WHERE o.species_id = sp.id);

COMMIT;
