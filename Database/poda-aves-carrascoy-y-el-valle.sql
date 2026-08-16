-- El juego de caracteres se fija SIEMPRE: el cliente mysql lo toma del entorno y en un
-- contenedor sin locale eso es latin1, que convierte cada tilde en mojibake sin dar error.
SET NAMES utf8mb4;

-- Carrascoy y El Valle (carrascoy-y-el-valle) · retirada de las aves sin respaldo de sitio
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
WHERE pk.slug = 'carrascoy-y-el-valle'
  AND sp.scientific_name IN (
    'Accipiter nisus',  -- Gavilán común
    'Aegithalos caudatus',  -- Mito
    'Alectoris rufa',  -- Perdiz roja
    'Anthus pratensis',  -- Bisbita común
    'Apus apus',  -- Vencejo común
    'Athene noctua',  -- Mochuelo europeo
    'Caprimulgus europaeus',  -- Chotacabras europeo
    'Carduelis carduelis',  -- Jilguero europeo
    'Cecropis daurica',  -- Golondrina dáurica
    'Certhia brachydactyla',  -- Agateador común
    'Cettia cetti',  -- Cetia ruiseñor
    'Chloris chloris',  -- Verderón común
    'Clamator glandarius',  -- Críalo
    'Coloeus monedula',  -- Grajilla occidental
    'Columba livia',  -- Paloma bravía
    'Columba oenas',  -- Paloma zurita
    'Columba palumbus',  -- Paloma torcaz
    'Corvus corax',  -- Cuervo grande
    'Cuculus canorus',  -- Cuco
    'Curruca melanocephala',  -- Curruca cabecinegra
    'Cyanistes caeruleus',  -- Herrerillo común
    'Delichon urbicum',  -- Avión común
    'Egretta garzetta',  -- Garceta común
    'Emberiza calandra',  -- Triguero
    'Emberiza cia',  -- Escribano montesino
    'Emberiza cirlus',  -- Escribano soteño
    'Erithacus rubecula',  -- Petirrojo europeo
    'Falco columbarius',  -- Esmerejón
    'Fringilla coelebs',  -- Pimientera
    'Garrulus glandarius',  -- Arrendajo euroasiático
    'Hippolais polyglotta',  -- Zarcero común
    'Hirundo rustica',  -- Golondrina común
    'Jynx torquilla',  -- Torcecuello euroasiático
    'Lanius senator',  -- Alcaudón común
    'Larus audouinii',  -- Gaviota de Audouin
    'Larus michahellis',  -- Gaviota patiamarilla
    'Linaria cannabina',  -- Pardillo común
    'Lophophanes cristatus',  -- Herrerillo capuchino
    'Luscinia megarhynchos',  -- Ruiseñor común
    'Melanocorypha calandra',  -- Calandria común
    'Monticola solitarius',  -- Roquero solitario
    'Motacilla alba',  -- Lavandera blanca
    'Oriolus oriolus',  -- Oropéndola
    'Parus major',  -- Carbonero común
    'Petronia petronia',  -- Gorrión chillón
    'Phoenicurus ochruros',  -- Colirrojo tizón
    'Phoenicurus phoenicurus',  -- Colirrojo real
    'Phylloscopus bonelli',  -- Mosquitero papialbo
    'Phylloscopus collybita',  -- Mosquitero común
    'Phylloscopus trochilus',  -- Mosquitero musical
    'Pica pica',  -- Urraca común
    'Picus sharpei',  -- Pito ibérico
    'Prunella collaris',  -- Acentor alpino
    'Prunella modularis',  -- Acentor común
    'Ptyonoprogne rupestris',  -- Avión roquero
    'Regulus ignicapilla',  -- Reyezuelo listado
    'Saxicola rubetra',  -- Tarabilla norteña
    'Serinus serinus',  -- Serín verdecillo
    'Spinus spinus',  -- Lúgano
    'Strix aluco',  -- Cárabo
    'Sturnus unicolor',  -- Estornino negro
    'Sylvia atricapilla',  -- Curruca capirotada
    'Sylvia communis',  -- Curruca zarcera
    'Sylvia hortensis',  -- Curruca mirlona
    'Tachybaptus ruficollis',  -- Zampullín común
    'Tachymarptis melba',  -- Vencejo real
    'Turdus merula',  -- Turdus merula
    'Turdus philomelos',  -- Zorzal común
    'Turdus viscivorus'  -- Zorzal charlo
  );

COMMIT;

-- Comprobación: debe devolver 0 aves de las retiradas y el total esperado del espacio.
SELECT
    (SELECT COUNT(*) FROM species s JOIN parks p ON p.id = s.park_id WHERE p.slug = 'carrascoy-y-el-valle') AS especies_del_espacio,
    (SELECT COUNT(*) FROM species s JOIN parks p ON p.id = s.park_id WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name IN ('Accipiter nisus', 'Aegithalos caudatus', 'Alectoris rufa', 'Anthus pratensis', 'Apus apus', 'Athene noctua', 'Caprimulgus europaeus', 'Carduelis carduelis', 'Cecropis daurica', 'Certhia brachydactyla', 'Cettia cetti', 'Chloris chloris', 'Clamator glandarius', 'Coloeus monedula', 'Columba livia', 'Columba oenas', 'Columba palumbus', 'Corvus corax', 'Cuculus canorus', 'Curruca melanocephala', 'Cyanistes caeruleus', 'Delichon urbicum', 'Egretta garzetta', 'Emberiza calandra', 'Emberiza cia', 'Emberiza cirlus', 'Erithacus rubecula', 'Falco columbarius', 'Fringilla coelebs', 'Garrulus glandarius', 'Hippolais polyglotta', 'Hirundo rustica', 'Jynx torquilla', 'Lanius senator', 'Larus audouinii', 'Larus michahellis', 'Linaria cannabina', 'Lophophanes cristatus', 'Luscinia megarhynchos', 'Melanocorypha calandra', 'Monticola solitarius', 'Motacilla alba', 'Oriolus oriolus', 'Parus major', 'Petronia petronia', 'Phoenicurus ochruros', 'Phoenicurus phoenicurus', 'Phylloscopus bonelli', 'Phylloscopus collybita', 'Phylloscopus trochilus', 'Pica pica', 'Picus sharpei', 'Prunella collaris', 'Prunella modularis', 'Ptyonoprogne rupestris', 'Regulus ignicapilla', 'Saxicola rubetra', 'Serinus serinus', 'Spinus spinus', 'Strix aluco', 'Sturnus unicolor', 'Sylvia atricapilla', 'Sylvia communis', 'Sylvia hortensis', 'Tachybaptus ruficollis', 'Tachymarptis melba', 'Turdus merula', 'Turdus philomelos', 'Turdus viscivorus')) AS retiradas_que_siguen;
