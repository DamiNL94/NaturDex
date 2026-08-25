-- El juego de caracteres se fija SIEMPRE: el cliente `mysql` lo toma del entorno y en un
-- contenedor sin locale eso es latin1, que convierte cada tilde en mojibake sin dar error.
SET NAMES utf8mb4;

-- salinas-arenales-san-pedro-pinatar · fusión de subespecies nominales en su especie (deuda nº 33)
-- Generado el 2026-08-25 por Tools/catalogo-nacional/funde-trinomios-nominales.js
--
-- El Formulario Normalizado de Datos cita estas aves en trinomio y el anexo de la norma en
-- binomio; EIDOS les da dos taxonid, así que salían DOS fichas del mismo bicho. La del
-- trinomio nace sin gbifSpeciesKey, sin ocurrencias y sin descripción, y acaba oculta: el
-- usuario ve un hueco que no existe. Se comprobó ficha a ficha que no aporta ningún dato
-- que la del binomio no tenga antes de retirarla.
--
-- HACE FALTA porque build-park-sql.js solo hace UPSERT: regenerar el -n2.sql da de alta y
-- corrige, pero no retira nada. Sin esto, la API sigue sirviendo el trinomio. Vale igual
-- para el trinomio RENOMBRADO: el UPSERT da de alta la fila del binomio y deja la vieja
-- viva al lado, que es el tercer rastro de un renombrado (trampa nº 3 del CLAUDE.md).
--
-- ANTES DE APLICARLO:
--   · Haz copia (npm run db:backup). Un DELETE no se deshace con otra pasada.
--   · Pasa después Tools/recalculate-account-progress.php: user_progress.payload indexa los
--     descubrimientos por species_id, y quien hubiera descubierto el trinomio conserva una
--     marca que ya no apunta a ninguna ficha.
--   · Las citas Darwin Core (user_occurrences) NO se tocan: no tienen clave foránea a
--     species precisamente para esto, y llevan su taxonomía copiada.

START TRANSACTION;

DELETE sp FROM species sp
JOIN parks pk ON pk.id = sp.park_id
WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar'
  AND sp.scientific_name IN (
    'Phalacrocorax carbo carbo'  -- se funde en Phalacrocorax carbo («Cormorán grande»)
  );

COMMIT;

-- Comprobación: debe devolver 0 trinomios y el total esperado del espacio.
SELECT
    (SELECT COUNT(*) FROM species s JOIN parks p ON p.id = s.park_id WHERE p.slug = 'salinas-arenales-san-pedro-pinatar') AS especies_del_espacio,
    (SELECT COUNT(*) FROM species s JOIN parks p ON p.id = s.park_id WHERE p.slug = 'salinas-arenales-san-pedro-pinatar' AND s.scientific_name IN ('Phalacrocorax carbo carbo')) AS trinomios_que_siguen;
