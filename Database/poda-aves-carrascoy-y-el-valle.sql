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
    'Acrocephalus scirpaceus',  -- Carricero común
    'Aegithalos caudatus',  -- Mito
    'Alectoris rufa',  -- Perdiz roja
    'Anthus pratensis',  -- Bisbita común
    'Apus apus',  -- Vencejo común
    'Apus pallidus',  -- Vencejo pálido
    'Ardea cinerea',  -- Garza real
    'Ardeola ralloides',  -- Garcilla cangrejera
    'Athene noctua',  -- Mochuelo europeo
    'Aythya nyroca',  -- Porrón pardo
    'Bubulcus ibis',  -- Garcilla bueyera
    'Caprimulgus europaeus',  -- Chotacabras europeo
    'Cecropis daurica',  -- Golondrina dáurica
    'Certhia brachydactyla',  -- Agateador común
    'Cettia cetti',  -- Cetia ruiseñor
    'Charadrius dubius',  -- Chorlitejo chico
    'Cisticola juncidis',  -- Buitrón
    'Clamator glandarius',  -- Críalo
    'Columba oenas',  -- Paloma zurita
    'Corvus corax',  -- Cuervo grande
    'Cuculus canorus',  -- Cuco
    'Curruca melanocephala',  -- Curruca cabecinegra
    'Cyanistes caeruleus',  -- Herrerillo común
    'Delichon urbicum',  -- Avión común
    'Egretta garzetta',  -- Garceta común
    'Emberiza calandra',  -- Triguero
    'Emberiza cia',  -- Escribano montesino
    'Emberiza cirlus',  -- Escribano soteño
    'Emberiza citrinella',  -- Escribano cerillo
    'Erithacus rubecula',  -- Petirrojo europeo
    'Falco columbarius',  -- Esmerejón
    'Falco eleonorae',  -- Halcón de Eleonora
    'Falco naumanni',  -- Cernícalo primilla
    'Ficedula hypoleuca',  -- Papamoscas cerrojillo
    'Fringilla coelebs',  -- Pimientera
    'Fringilla montifringilla',  -- Pinzón real
    'Himantopus himantopus',  -- Cigüeñuela
    'Hippolais polyglotta',  -- Zarcero común
    'Hirundo rustica',  -- Golondrina común
    'Jynx torquilla',  -- Torcecuello euroasiático
    'Lanius senator',  -- Alcaudón común
    'Larus michahellis',  -- Gaviota patiamarilla
    'Lophophanes cristatus',  -- Herrerillo capuchino
    'Luscinia megarhynchos',  -- Ruiseñor común
    'Melanocorypha calandra',  -- Calandria común
    'Milvus milvus',  -- Milano real
    'Monticola solitarius',  -- Roquero solitario
    'Motacilla alba',  -- Lavandera blanca
    'Motacilla cinerea',  -- Lavandera cascadeña
    'Neophron percnopterus',  -- Alimoche común
    'Oriolus oriolus',  -- Oropéndola
    'Pandion haliaetus',  -- Águila pescadora
    'Parus major',  -- Carbonero común
    'Petronia petronia',  -- Gorrión chillón
    'Phoenicurus ochruros',  -- Colirrojo tizón
    'Phoenicurus phoenicurus',  -- Colirrojo real
    'Phylloscopus bonelli',  -- Mosquitero papialbo
    'Phylloscopus collybita',  -- Mosquitero común
    'Phylloscopus trochilus',  -- Mosquitero musical
    'Picus sharpei',  -- Pito ibérico
    'Prunella collaris',  -- Acentor alpino
    'Prunella modularis',  -- Acentor común
    'Pterocles orientalis',  -- Ganga ortega
    'Ptyonoprogne rupestris',  -- Avión roquero
    'Regulus ignicapilla',  -- Reyezuelo listado
    'Regulus regulus',  -- Reyezuelo sencillo
    'Riparia riparia',  -- Avión zapador
    'Saxicola rubetra',  -- Tarabilla norteña
    'Spinus spinus',  -- Lúgano
    'Strix aluco',  -- Cárabo
    'Sylvia atricapilla',  -- Curruca capirotada
    'Sylvia borin',  -- Curruca mosquitera
    'Tachybaptus ruficollis',  -- Zampullín común
    'Tachymarptis melba',  -- Vencejo real
    'Tadorna tadorna',  -- Tarro blanco
    'Tringa ochropus',  -- Andarríos grande
    'Tyto alba'  -- Lechuza común
  );

COMMIT;

-- Comprobación: debe devolver 0 aves de las retiradas y el total esperado del espacio.
SELECT
    (SELECT COUNT(*) FROM species s JOIN parks p ON p.id = s.park_id WHERE p.slug = 'carrascoy-y-el-valle') AS especies_del_espacio,
    (SELECT COUNT(*) FROM species s JOIN parks p ON p.id = s.park_id WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name IN ('Accipiter nisus', 'Acrocephalus scirpaceus', 'Aegithalos caudatus', 'Alectoris rufa', 'Anthus pratensis', 'Apus apus', 'Apus pallidus', 'Ardea cinerea', 'Ardeola ralloides', 'Athene noctua', 'Aythya nyroca', 'Bubulcus ibis', 'Caprimulgus europaeus', 'Cecropis daurica', 'Certhia brachydactyla', 'Cettia cetti', 'Charadrius dubius', 'Cisticola juncidis', 'Clamator glandarius', 'Columba oenas', 'Corvus corax', 'Cuculus canorus', 'Curruca melanocephala', 'Cyanistes caeruleus', 'Delichon urbicum', 'Egretta garzetta', 'Emberiza calandra', 'Emberiza cia', 'Emberiza cirlus', 'Emberiza citrinella', 'Erithacus rubecula', 'Falco columbarius', 'Falco eleonorae', 'Falco naumanni', 'Ficedula hypoleuca', 'Fringilla coelebs', 'Fringilla montifringilla', 'Himantopus himantopus', 'Hippolais polyglotta', 'Hirundo rustica', 'Jynx torquilla', 'Lanius senator', 'Larus michahellis', 'Lophophanes cristatus', 'Luscinia megarhynchos', 'Melanocorypha calandra', 'Milvus milvus', 'Monticola solitarius', 'Motacilla alba', 'Motacilla cinerea', 'Neophron percnopterus', 'Oriolus oriolus', 'Pandion haliaetus', 'Parus major', 'Petronia petronia', 'Phoenicurus ochruros', 'Phoenicurus phoenicurus', 'Phylloscopus bonelli', 'Phylloscopus collybita', 'Phylloscopus trochilus', 'Picus sharpei', 'Prunella collaris', 'Prunella modularis', 'Pterocles orientalis', 'Ptyonoprogne rupestris', 'Regulus ignicapilla', 'Regulus regulus', 'Riparia riparia', 'Saxicola rubetra', 'Spinus spinus', 'Strix aluco', 'Sylvia atricapilla', 'Sylvia borin', 'Tachybaptus ruficollis', 'Tachymarptis melba', 'Tadorna tadorna', 'Tringa ochropus', 'Tyto alba')) AS retiradas_que_siguen;
