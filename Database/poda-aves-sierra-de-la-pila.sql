-- Sierra de la Pila (sierra-de-la-pila) · retirada de las aves sin respaldo de sitio
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
WHERE pk.slug = 'sierra-de-la-pila'
  AND sp.scientific_name IN (
    'Accipiter nisus',  -- Gavilán común
    'Acrocephalus scirpaceus',  -- Carricero común
    'Aegithalos caudatus',  -- Mito
    'Alectoris rufa',  -- Perdiz roja
    'Anthus pratensis',  -- Bisbita común
    'Apus apus',  -- Vencejo común
    'Athene noctua',  -- Mochuelo europeo
    'Carduelis carduelis',  -- Jilguero europeo
    'Cecropis daurica',  -- Golondrina dáurica
    'Cettia cetti',  -- Cetia ruiseñor
    'Charadrius dubius',  -- Chorlitejo chico
    'Chloris chloris',  -- Verderón común
    'Coloeus monedula',  -- Grajilla occidental
    'Columba livia',  -- Paloma bravía
    'Columba palumbus',  -- Paloma torcaz
    'Corvus corax',  -- Cuervo grande
    'Cuculus canorus',  -- Cuco
    'Curruca melanocephala',  -- Curruca cabecinegra
    'Emberiza calandra',  -- Triguero
    'Emberiza cia',  -- Escribano montesino
    'Emberiza cirlus',  -- Escribano soteño
    'Erithacus rubecula',  -- Petirrojo europeo
    'Fringilla coelebs',  -- Pimientera
    'Garrulus glandarius',  -- Arrendajo euroasiático
    'Hieraaetus pennatus',  -- Águila calzada
    'Hippolais polyglotta',  -- Zarcero común
    'Hirundo rustica',  -- Golondrina común
    'Lanius excubitor',  -- Alcaudón norteño
    'Lanius senator',  -- Alcaudón común
    'Linaria cannabina',  -- Pardillo común
    'Lophophanes cristatus',  -- Herrerillo capuchino
    'Loxia curvirostra',  -- Piquituerto
    'Luscinia megarhynchos',  -- Ruiseñor común
    'Luscinia svecica',  -- Pechiazul
    'Milvus migrans',  -- Milano negro
    'Monticola solitarius',  -- Roquero solitario
    'Motacilla alba',  -- Lavandera blanca
    'Motacilla cinerea',  -- Lavandera cascadeña
    'Muscicapa striata',  -- Papamoscas gris
    'Oenanthe leucura',  -- Collalba negra
    'Oriolus oriolus',  -- Oropéndola
    'Otus scops',  -- Autillo
    'Parus major',  -- Carbonero común
    'Passer domesticus',  -- Gorrión común
    'Periparus ater',  -- Carbonero garrapinos
    'Petronia petronia',  -- Gorrión chillón
    'Phoenicurus ochruros',  -- Colirrojo tizón
    'Phylloscopus collybita',  -- Mosquitero común
    'Pica pica',  -- Urraca común
    'Picus sharpei',  -- Pito ibérico
    'Ptyonoprogne rupestris',  -- Avión roquero
    'Regulus ignicapilla',  -- Reyezuelo listado
    'Serinus serinus',  -- Serín verdecillo
    'Spinus spinus',  -- Lúgano
    'Streptopelia decaocto',  -- Tórtola turca
    'Streptopelia turtur',  -- Tórtola europea
    'Strix aluco',  -- Cárabo
    'Sturnus unicolor',  -- Estornino negro
    'Sylvia atricapilla',  -- Curruca capirotada
    'Sylvia communis',  -- Curruca zarcera
    'Sylvia hortensis',  -- Curruca mirlona
    'Tachymarptis melba',  -- Vencejo real
    'Turdus merula',  -- Turdus merula
    'Turdus philomelos',  -- Zorzal común
    'Turdus viscivorus',  -- Zorzal charlo
    'Upupa epops'  -- Abubilla
  );

COMMIT;

-- Comprobación: debe devolver 0 aves de las retiradas y el total esperado del espacio.
SELECT
    (SELECT COUNT(*) FROM species s JOIN parks p ON p.id = s.park_id WHERE p.slug = 'sierra-de-la-pila') AS especies_del_espacio,
    (SELECT COUNT(*) FROM species s JOIN parks p ON p.id = s.park_id WHERE p.slug = 'sierra-de-la-pila' AND s.scientific_name IN ('Accipiter nisus', 'Acrocephalus scirpaceus', 'Aegithalos caudatus', 'Alectoris rufa', 'Anthus pratensis', 'Apus apus', 'Athene noctua', 'Carduelis carduelis', 'Cecropis daurica', 'Cettia cetti', 'Charadrius dubius', 'Chloris chloris', 'Coloeus monedula', 'Columba livia', 'Columba palumbus', 'Corvus corax', 'Cuculus canorus', 'Curruca melanocephala', 'Emberiza calandra', 'Emberiza cia', 'Emberiza cirlus', 'Erithacus rubecula', 'Fringilla coelebs', 'Garrulus glandarius', 'Hieraaetus pennatus', 'Hippolais polyglotta', 'Hirundo rustica', 'Lanius excubitor', 'Lanius senator', 'Linaria cannabina', 'Lophophanes cristatus', 'Loxia curvirostra', 'Luscinia megarhynchos', 'Luscinia svecica', 'Milvus migrans', 'Monticola solitarius', 'Motacilla alba', 'Motacilla cinerea', 'Muscicapa striata', 'Oenanthe leucura', 'Oriolus oriolus', 'Otus scops', 'Parus major', 'Passer domesticus', 'Periparus ater', 'Petronia petronia', 'Phoenicurus ochruros', 'Phylloscopus collybita', 'Pica pica', 'Picus sharpei', 'Ptyonoprogne rupestris', 'Regulus ignicapilla', 'Serinus serinus', 'Spinus spinus', 'Streptopelia decaocto', 'Streptopelia turtur', 'Strix aluco', 'Sturnus unicolor', 'Sylvia atricapilla', 'Sylvia communis', 'Sylvia hortensis', 'Tachymarptis melba', 'Turdus merula', 'Turdus philomelos', 'Turdus viscivorus', 'Upupa epops')) AS retiradas_que_siguen;
