-- El juego de caracteres se fija SIEMPRE: el cliente mysql lo toma del entorno y en un
-- contenedor sin locale eso es latin1, que convierte cada tilde en mojibake sin dar error.
SET NAMES utf8mb4;

-- Cuatro Calas (cuatro-calas) · retirada de las aves sin respaldo de sitio
-- Generado el 2026-08-16 por Tools/catalogo-nacional/poda-aves-sin-respaldo.js
--
-- Estas aves estaban en el catálogo del espacio por sus ocurrencias de GBIF, que en un ave
-- no miden pertenencia al espacio: vuela, y un registro en vuelo cae dentro de cualquier
-- recinto. Ninguna fuente oficial de sitio —el Formulario Normalizado de Datos del sitio
-- Red Natura 2000 ni el anexo normativo del plan de gestión— las sitúa aquí.
--
-- HACE FALTA porque build-park-sql.js solo hace UPSERT: regenerar el -n2.sql corrige y da de
-- alta, pero no retira nada. Sin este fichero, la API sigue sirviendo las aves podadas.
--
-- ANTES DE APLICARLO, dos cosas:
--   · Haz copia (npm run db:backup). Un DELETE no se deshace con otra pasada.
--   · user_progress.payload indexa los descubrimientos por el species_id de cada parque, así
--     que quien hubiera descubierto una de estas aves conserva una marca que ya no apunta a
--     ninguna ficha. Después de aplicar esto hay que pasar
--     Tools/recalculate-account-progress.php para que el progreso y los logros cuadren.
--   · Las citas Darwin Core (user_occurrences) NO se tocan: no tienen clave foránea a
--     species precisamente para esto, y llevan su taxonomía copiada.

START TRANSACTION;

DELETE sp FROM species sp
JOIN parks pk ON pk.id = sp.park_id
WHERE pk.slug = 'cuatro-calas'
  AND sp.scientific_name IN (
    'Alcedo atthis',  -- Martín pescador
    'Burhinus oedicnemus',  -- Alcaraván
    'Caprimulgus ruficollis',  -- Chotacabras cuellirrojo
    'Coracias garrulus',  -- Carraca europea
    'Egretta garzetta',  -- Garceta común
    'Falco peregrinus',  -- Halcón peregrino
    'Himantopus himantopus',  -- Cigüeñuela
    'Oenanthe leucura',  -- Collalba negra
    'Streptopelia turtur'  -- Tórtola europea
  );

COMMIT;

-- Comprobación: debe devolver 0 aves de las retiradas y el total esperado del espacio.
SELECT
    (SELECT COUNT(*) FROM species s JOIN parks p ON p.id = s.park_id WHERE p.slug = 'cuatro-calas') AS especies_del_espacio,
    (SELECT COUNT(*) FROM species s JOIN parks p ON p.id = s.park_id WHERE p.slug = 'cuatro-calas' AND s.scientific_name IN ('Alcedo atthis', 'Burhinus oedicnemus', 'Caprimulgus ruficollis', 'Coracias garrulus', 'Egretta garzetta', 'Falco peregrinus', 'Himantopus himantopus', 'Oenanthe leucura', 'Streptopelia turtur')) AS retiradas_que_siguen;
