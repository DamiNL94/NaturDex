-- El juego de caracteres se fija SIEMPRE: el cliente mysql lo toma del entorno y en un
-- contenedor sin locale eso es latin1, que convierte cada tilde en mojibake sin dar error.
SET NAMES utf8mb4;

-- ================================================================================================
-- Cuatro Calas · Fase 3 (N3): puntos de interés.
--
-- GENERADO por Tools/catalogo-nacional/build-poi-sql.js desde el bloque `pointsOfInterest` de
-- Frontend/Data/parks/murcia/cuatro-calas/park.json. No editar a mano: regenerar con
--   node Tools/catalogo-nacional/build-poi-sql.js --park cuatro-calas
--
-- Hace falta porque Frontend/Js/data.js da PRIORIDAD a la API sobre el park.json empaquetado: en un
-- despliegue con backend, sin este SQL el espacio se seguiría sirviendo con 0 puntos de interés.
--
-- ANTES DE APLICAR, comprobar que el espacio tiene fila en `parks`. Si no la tiene, el
-- INSERT ... SELECT de abajo no encuentra nada y **carga cero filas sin dar ningún error** (le pasó
-- a Sierra Espuña el 2026-08-08):
--   SELECT id, slug, name FROM parks WHERE slug = 'cuatro-calas';
--
-- Idempotente: ON DUPLICATE KEY UPDATE sobre la clave única (park_id, slug). Aplicar con:
--   docker exec -i naturdex-db-1 sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql --default-character-set=utf8mb4 naturadex' < Database/n3-pois-cuatro-calas.sql
-- ================================================================================================

-- 4 punto(s) de interés.
INSERT INTO points_of_interest (park_id, slug, name, type, description, latitude, longitude, image_url, source, is_approx, orden)
SELECT p.id, poi.slug, poi.name, poi.type, poi.description, poi.latitude, poi.longitude, poi.image_url, poi.source, poi.is_approx, poi.orden
FROM parks p
JOIN (
    SELECT 'vulcanismo-de-la-carolina' slug, 'Vulcanismo de La Carolina' name, 'Geológico' type, 'Afloramiento volcánico catalogado en el Inventario Español de Lugares de Interés Geológico con el código BE006. No está interestratificado: su contacto con los materiales sedimentarios mio-pliocenos aparece verticalizado, de modo que el volcanismo no fue simultáneo al depósito de esas capas. El IGME le reconoce interés principal petrológico-geoquímico y, como secundarios, el estratigráfico y el geomorfológico.' description, 37.374485 latitude, -1.627156 longitude, 'https://commons.wikimedia.org/wiki/Special:FilePath/Entrada_a_la_Cala_La_Carolina.jpg?width=1280' image_url, 'Inventario Español de Lugares de Interés Geológico (IELIG), IGME — LIG BE006 «Vulcanismo de La Carolina». La coordenada es la del propio punto del inventario; Wikimedia Commons (foto: Mabelcalabuig, CC BY-SA 3.0 es)' source, FALSE is_approx, 0 orden
    UNION ALL
    SELECT 'playa-de-los-cocedores', 'Playa de los Cocedores', 'Cultural', 'En el acantilado de marga que cierra la cala se excavaron depósitos y balsas donde se maceraba el esparto en agua antes de majarlo y trenzarlo. El topónimo nombra ese oficio: un cocedero es el sitio donde se cuece el esparto. Las cavidades y los depósitos siguen siendo visibles, y están documentados fotográficamente; la práctica está pendiente de contrastar con fuente documental escrita.', 37.374916, -1.629774, 'https://commons.wikimedia.org/wiki/Special:FilePath/Cala_Cerrada_o_de_los_Cocederos%2C_en_el_Paraje_Protegido_Las_Cuatro_Calas.JPG?width=1280', 'Posición: OpenStreetMap way/1459077450 (ODbL). Uso espartero documentado en Wikimedia Commons («Antiguo deposito de esparto en la Cala de los Cocederos», «Depositos excavados en el acantilado, Cala de los Cocederos»); pendiente de contrastar con fuente documental. El IELIG y Commons escriben «Cocederos»; OpenStreetMap, «Cocedores»; Wikimedia Commons (foto: Mabelcalabuig, CC BY-SA 3.0 es)', FALSE, 1
    UNION ALL
    SELECT 'conglomerados-de-cuatro-calas', 'Conglomerados de Cuatro Calas', 'Geológico', 'Afloran conglomerados horizontales muy fracturados de la Unidad Superior y, hacia poniente, areniscas calcáreas limosas con fauna fósil. Es el punto de mayor interés geológico del espacio: el IGME le asigna interés geomorfológico como principal y, como secundarios, el estratigráfico, el paleontológico, el tectónico y el sedimentológico.', 37.377857, -1.628044, 'https://commons.wikimedia.org/wiki/Special:FilePath/Cuatro_Calas_Murcia.jpg?width=1280', 'Inventario Español de Lugares de Interés Geológico (IELIG), IGME — LIG BE005, cuya denominación oficial es «Playa de Cuatro Calas»; aquí se le da otro nombre para no confundirlo con el del propio espacio protegido. approx: el punto del inventario representa el conjunto del tramo costero, no un afloramiento puntual; Wikimedia Commons (foto: Mynomadicbackpack, CC BY-SA 4.0)', TRUE, 2
    UNION ALL
    SELECT 'playa-de-calarreona', 'Playa de Calarreona', 'Acceso', 'La más septentrional de las cuatro calas que dan nombre al espacio y su acceso por el norte. Es una de las paradas del SL-MU 18 «Sendero de Cuatro Calas Juan F. Mota Poveda», recorrido circular de unos 5 km que enlaza Calarreona, La Higuerica, La Carolina y Los Cocedores y pasa por el saladar de Cañada Brusca.', 37.383513, -1.621103, 'https://commons.wikimedia.org/wiki/Special:FilePath/Calarreona%2C_lado_sur%2C_en_Las_Cuatro_Calas.JPG?width=1280', 'Posición: OpenStreetMap (ODbL). Sendero SL-MU 18 homologado por la FMRM. Su recorrido no aparece dibujado en el mapa: el sendero está señalizado sobre el terreno, pero no cartografiado en OpenStreetMap, que es de donde sale la capa de senderos; Wikimedia Commons (foto: Mabelcalabuig, CC BY-SA 3.0 es)', FALSE, 3
) poi
WHERE p.slug = 'cuatro-calas'
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    type = VALUES(type),
    description = VALUES(description),
    latitude = VALUES(latitude),
    longitude = VALUES(longitude),
    image_url = VALUES(image_url),
    source = VALUES(source),
    is_approx = VALUES(is_approx),
    orden = VALUES(orden);

-- Comprobación posterior: debe devolver 4.
SELECT COUNT(*) AS pois_cargados FROM points_of_interest poi
JOIN parks p ON p.id = poi.park_id WHERE p.slug = 'cuatro-calas';
