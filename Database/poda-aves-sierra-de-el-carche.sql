-- El juego de caracteres se fija SIEMPRE: el cliente mysql lo toma del entorno y en un
-- contenedor sin locale eso es latin1, que convierte cada tilde en mojibake sin dar error.
SET NAMES utf8mb4;

-- Sierra de El Carche (sierra-de-el-carche) · retirada de las aves sin respaldo de sitio
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
WHERE pk.slug = 'sierra-de-el-carche'
  AND sp.scientific_name IN (
    'Alectoris rufa',  -- Perdiz roja
    'Apus pallidus',  -- Vencejo pálido
    'Aquila fasciata',  -- Águila perdicera
    'Buteo buteo',  -- Busardo ratonero
    'Carduelis carduelis',  -- Jilguero europeo
    'Chloris chloris',  -- Verderón común
    'Ciconia nigra',  -- Cigüeña negra
    'Circus pygargus',  -- Aguilucho cenizo
    'Clamator glandarius',  -- Críalo
    'Columba livia',  -- Paloma bravía
    'Columba oenas',  -- Paloma zurita
    'Columba palumbus',  -- Paloma torcaz
    'Corvus corone',  -- Corneja negra
    'Coturnix coturnix',  -- Codorniz común
    'Curruca iberiae',  -- Curruca iberiae
    'Emberiza calandra',  -- Triguero
    'Erythropygia galactotes',  -- Alzacola
    'Falco subbuteo',  -- Alcotán
    'Gyps fulvus',  -- Buitre común
    'Lanius excubitor',  -- Alcaudón norteño
    'Linaria cannabina',  -- Pardillo común
    'Melanocorypha calandra',  -- Calandria común
    'Passer domesticus',  -- Gorrión común
    'Pica pica',  -- Urraca común
    'Saxicola rubetra',  -- Tarabilla norteña
    'Saxicola rubicola',  -- Tarabilla europea
    'Serinus serinus',  -- Serín verdecillo
    'Streptopelia decaocto',  -- Tórtola turca
    'Streptopelia turtur',  -- Tórtola europea
    'Sturnus unicolor',  -- Estornino negro
    'Turdus iliacus',  -- Zorzal alirrojo
    'Turdus merula',  -- Turdus merula
    'Turdus philomelos'  -- Zorzal común
  );

COMMIT;

-- Comprobación: debe devolver 0 aves de las retiradas y el total esperado del espacio.
SELECT
    (SELECT COUNT(*) FROM species s JOIN parks p ON p.id = s.park_id WHERE p.slug = 'sierra-de-el-carche') AS especies_del_espacio,
    (SELECT COUNT(*) FROM species s JOIN parks p ON p.id = s.park_id WHERE p.slug = 'sierra-de-el-carche' AND s.scientific_name IN ('Alectoris rufa', 'Apus pallidus', 'Aquila fasciata', 'Buteo buteo', 'Carduelis carduelis', 'Chloris chloris', 'Ciconia nigra', 'Circus pygargus', 'Clamator glandarius', 'Columba livia', 'Columba oenas', 'Columba palumbus', 'Corvus corone', 'Coturnix coturnix', 'Curruca iberiae', 'Emberiza calandra', 'Erythropygia galactotes', 'Falco subbuteo', 'Gyps fulvus', 'Lanius excubitor', 'Linaria cannabina', 'Melanocorypha calandra', 'Passer domesticus', 'Pica pica', 'Saxicola rubetra', 'Saxicola rubicola', 'Serinus serinus', 'Streptopelia decaocto', 'Streptopelia turtur', 'Sturnus unicolor', 'Turdus iliacus', 'Turdus merula', 'Turdus philomelos')) AS retiradas_que_siguen;
