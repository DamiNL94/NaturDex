-- El juego de caracteres se fija SIEMPRE: el cliente mysql lo toma del entorno y en un
-- contenedor sin locale eso es latin1, que convierte cada tilde en mojibake sin dar error.
SET NAMES utf8mb4;

-- ================================================================================================
-- Cabezo Gordo · Fase 3 (N3): puntos de interés.
--
-- GENERADO por Tools/catalogo-nacional/build-poi-sql.js desde el bloque `pointsOfInterest` de
-- Frontend/Data/parks/murcia/cabezo-gordo/park.json. No editar a mano: regenerar con
--   node Tools/catalogo-nacional/build-poi-sql.js --park cabezo-gordo
--
-- Hace falta porque Frontend/Js/data.js da PRIORIDAD a la API sobre el park.json empaquetado: en un
-- despliegue con backend, sin este SQL el espacio se seguiría sirviendo con 0 puntos de interés.
--
-- ANTES DE APLICAR, comprobar que el espacio tiene fila en `parks`. Si no la tiene, el
-- INSERT ... SELECT de abajo no encuentra nada y **carga cero filas sin dar ningún error** (le pasó
-- a Sierra Espuña el 2026-08-08):
--   SELECT id, slug, name FROM parks WHERE slug = 'cabezo-gordo';
--
-- Idempotente: ON DUPLICATE KEY UPDATE sobre la clave única (park_id, slug). Aplicar con:
--   docker exec -i naturdex-db-1 sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql --default-character-set=utf8mb4 naturadex' < Database/n3-pois-cabezo-gordo.sql
-- ================================================================================================

-- 3 punto(s) de interés.
INSERT INTO points_of_interest (park_id, slug, name, type, description, latitude, longitude, image_url, source, is_approx)
SELECT p.id, poi.slug, poi.name, poi.type, poi.description, poi.latitude, poi.longitude, poi.image_url, poi.source, poi.is_approx
FROM parks p
JOIN (
    SELECT 'cima-del-cabezo-gordo' slug, 'Cima del Cabezo Gordo' name, 'Paisajístico' type, 'Los 308 m de un cerro que se levanta solo en mitad de la llanura del Campo de Cartagena, sin nada alrededor que le haga sombra. El plan lo describe como un hito montañoso de planta ovoidal y laderas orientadas al norte y al sur, escarpadas en la parte central y suavizándose hacia el llano, y lo considera un elemento estructural del paisaje comarcal por su calidad visual. Desde arriba se abarca de una vez el Campo de Cartagena entero y, al fondo, el Mar Menor.' description, 37.8016 latitude, -0.908073 longitude, NULL image_url, 'Plan de gestión integral de los espacios protegidos del Mar Menor y la franja litoral mediterránea de la Región de Murcia (Decreto n.º 259/2019, de 10 de octubre; BORM n.º 242, de 19 de octubre de 2019, suplemento n.º 7), volumen II, §2.2.3 «Descripción del paisaje» —«El Cabezo Gordo se considera un elemento estructural del paisaje del Campo de Cartagena con un interés muy relevante, destacando como enclave de gran calidad visual en la extensa llanura circundante… Constituye un hito montañoso de planta ovoidal que presenta mediana altitud (alcanza como cota máxima 308 msnm)»—. Coordenada exacta: nodo de la cima en OpenStreetMap (node/3982456195), con un mirador etiquetado en el mismo punto (node/3982456196). AVISO recogido del propio plan (§2.2.4): «cabe destacar la existencia de cavidades y antiguas galerías mineras no protegidas que pueden suponer un riesgo para la seguridad de los visitantes».' source, FALSE is_approx
    UNION ALL
    SELECT 'mirador-de-la-sima-de-las-palomas', 'Mirador de la Sima de las Palomas', 'Arqueológico', 'El mirador que el plan de gestión señaliza sobre la Sima de las Palomas, el yacimiento que da fama al cerro: dentro se han encontrado restos de Homo sapiens neanderthalensis y de Homo sapiens arcaico datados entre 200.000 y 500.000 años. Se llega por la Senda del Cabezo Gordo (SL-MU 11), que sale del aparcamiento y termina aquí, con señalización interpretativa por el camino. En agosto, coincidiendo con los campos de trabajo de las excavaciones, se hacen jornadas de puertas abiertas; el resto del año lo que se visita es el mirador, no la cavidad.', 37.798414, -0.896848, NULL, 'Plan de gestión integral de los espacios protegidos del Mar Menor y la franja litoral mediterránea de la Región de Murcia (Decreto n.º 259/2019, de 10 de octubre; BORM n.º 242, de 19 de octubre de 2019, suplemento n.º 7), volumen II, §2.2.4 «Uso Público», que enumera entre los equipamientos «el mirador Sima de las Palomas y el sendero natural “Senda del Cabezo Gordo (SL-MU11)”, cuyo trazado discurre entre el aparcamiento y la Sima de las Palomas», y §2.2.1 y §1.1.5.1, que describen el interés paleoantropológico del yacimiento. Coordenada exacta: nodo del mirador en OpenStreetMap (node/4075151748). SE SEÑALA EL MIRADOR Y NO LA BOCA DE LA CAVIDAD (§4.3.6, precedente Cueva C.6 de Cabo Cope): el punto que entra en el catálogo es el equipamiento que el propio plan señaliza para el visitante. AVISO recogido del propio plan (§2.2.4): «cabe destacar la existencia de cavidades y antiguas galerías mineras no protegidas que pueden suponer un riesgo para la seguridad de los visitantes».', FALSE
    UNION ALL
    SELECT 'aparcamiento-senda-del-cabezo-gordo', 'Aparcamiento y arranque de la Senda del Cabezo Gordo', 'Acceso', 'El único acceso ordenado al espacio, al sur del cerro, que es donde el plan concentra el uso público. De aquí arranca la Senda del Cabezo Gordo (SL-MU 11), el sendero natural señalizado que sube hasta el mirador de la Sima de las Palomas, y aquí están los paneles informativos. En abril llega hasta este entorno la romería del Cabezo Gordo, que parte de Dolores de Pacheco.', 37.795639, -0.900031, NULL, 'Plan de gestión integral de los espacios protegidos del Mar Menor y la franja litoral mediterránea de la Región de Murcia (Decreto n.º 259/2019, de 10 de octubre; BORM n.º 242, de 19 de octubre de 2019, suplemento n.º 7), volumen II, §2.2.4 «Uso Público»: «El uso público se concentra al sur del Paisaje Protegido… Entre los equipamientos e instalaciones cabe mencionar un aparcamiento, el mirador Sima de las Palomas y el sendero natural “Senda del Cabezo Gordo (SL-MU11)”… El sendero dispone de señalización informativa-interpretativa básica»; la romería de abril desde Dolores de Pacheco consta en el mismo apartado. Coordenada aproximada: centro del recinto de aparcamiento cartografiado en OpenStreetMap (way/386402813), con dos paneles informativos etiquetados junto a él (node/3897233058 y node/3897233079). AVISO recogido del propio plan (§2.2.4): «cabe destacar la existencia de cavidades y antiguas galerías mineras no protegidas que pueden suponer un riesgo para la seguridad de los visitantes».', TRUE
) poi
WHERE p.slug = 'cabezo-gordo'
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    type = VALUES(type),
    description = VALUES(description),
    latitude = VALUES(latitude),
    longitude = VALUES(longitude),
    image_url = VALUES(image_url),
    source = VALUES(source),
    is_approx = VALUES(is_approx);

-- Comprobación posterior: debe devolver 3.
SELECT COUNT(*) AS pois_cargados FROM points_of_interest poi
JOIN parks p ON p.id = poi.park_id WHERE p.slug = 'cabezo-gordo';
