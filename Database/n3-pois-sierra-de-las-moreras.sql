-- El juego de caracteres se fija SIEMPRE: el cliente mysql lo toma del entorno y en un
-- contenedor sin locale eso es latin1, que convierte cada tilde en mojibake sin dar error.
SET NAMES utf8mb4;

-- ================================================================================================
-- Sierra de las Moreras · Fase 3 (N3): puntos de interés.
--
-- GENERADO por Tools/catalogo-nacional/build-poi-sql.js desde el bloque `pointsOfInterest` de
-- Frontend/Data/parks/murcia/sierra-de-las-moreras/park.json. No editar a mano: regenerar con
--   node Tools/catalogo-nacional/build-poi-sql.js --park sierra-de-las-moreras
--
-- Hace falta porque Frontend/Js/data.js da PRIORIDAD a la API sobre el park.json empaquetado: en un
-- despliegue con backend, sin este SQL el espacio se seguiría sirviendo con 0 puntos de interés.
--
-- ANTES DE APLICAR, comprobar que el espacio tiene fila en `parks`. Si no la tiene, el
-- INSERT ... SELECT de abajo no encuentra nada y **carga cero filas sin dar ningún error** (le pasó
-- a Sierra Espuña el 2026-08-08):
--   SELECT id, slug, name FROM parks WHERE slug = 'sierra-de-las-moreras';
--
-- Idempotente: ON DUPLICATE KEY UPDATE sobre la clave única (park_id, slug). Aplicar con:
--   docker exec -i naturdex-db-1 sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql --default-character-set=utf8mb4 naturadex' < Database/n3-pois-sierra-de-las-moreras.sql
-- ================================================================================================

-- 2 punto(s) de interés.
INSERT INTO points_of_interest (park_id, slug, name, type, description, latitude, longitude, image_url, source, is_approx, orden)
SELECT p.id, poi.slug, poi.name, poi.type, poi.description, poi.latitude, poi.longitude, poi.image_url, poi.source, poi.is_approx, poi.orden
FROM parks p
JOIN (
    SELECT 'cabezo-del-plomo' slug, 'Cabezo del Plomo' name, 'Arqueológico' type, 'Poblado fortificado del Neolítico final y el Calcolítico, sobre un cerro amesetado en las estribaciones de la sierra. En la parte alta se conservan la muralla —levantada con dos hiladas de piedra rellenas de otras menores y jalonada de bastiones adosados— y las cabañas circulares con zócalo de piedra; al pie del poblado queda el tholos, cámara funeraria delimitada por ortostatos y único enterramiento conservado de su necrópolis. La Universidad de Murcia lo excavó entre 1979 y 1985 bajo la dirección de Ana María Muñoz Amilibia, y está declarado Bien de Interés Cultural con la categoría de Zona Arqueológica. La vida del poblado se sitúa entre el final del IV milenio y mediados del III a.C.' description, 37.576505 latitude, -1.302119 longitude, 'https://commons.wikimedia.org/wiki/Special:FilePath/Cabezo_del_Plomo_-_Megalitismo._Sepulgro_tipo_Tholos.jpg?width=1280' image_url, 'Catálogo de Monumentos de la Región de Murcia (datos abiertos de la CARM, nexo.carm.es, registro n.º 5611), consultado el 2026-08-22, de donde salen el hecho y la coordenada. Declaración BIC corroborada en Wikidata (Q43175856, P808 = RI-55-0000172, Zona Arqueológica), que aquí es SUSTITUTO del boletín: el catálogo no cita la norma de declaración y no se ha podido llegar a ella (el índice de anuncios del BORM da entrada por la ficha de la norma, y esta declaración es de patrimonio, no de medio ambiente). OpenStreetMap (way/669396011, ODbL) coincide en la posición dentro de 70 m y añade la fecha de inscripción, 2006-03-24; Wikimedia Commons (foto: Bertobarc90, CC BY-SA 4.0)' source, FALSE is_approx, 0 orden
    UNION ALL
    SELECT 'morron-blanco', 'Morrón Blanco', 'Paisajístico', 'Vértice geodésico del Instituto Geográfico Nacional en lo alto de la sierra, a 489,4 m sobre el nivel del mar. Pertenece a la Red de Orden Inferior con el código 97654 y tiene reseña publicada, así que su altitud y su posición son dato oficial y no una estimación. Desde el pilar se domina de una vez la vertiente que cae al Mediterráneo y el interior del valle del Guadalentín. No es el punto más alto del espacio: dentro del límite hay una cota de 493 m, kilómetro y medio al oeste, que no tiene nombre en la cartografía consultada.', 37.572843, -1.341536, 'https://commons.wikimedia.org/wiki/Special:FilePath/Punto_Geodesico_Morron_Blanco.jpg?width=1280', 'Vértice geodésico 97654 de la Red ROI del IGN. Los datos (código, altitud 489,4 m y coordenada) se han leído en Wikidata (Q115506724: P528, P2044, P625), que aquí es SUSTITUTO de la fuente primaria: los dos hosts del IGN que la sirven —api-features.ign.es y datos-geodesia.ign.es, este último con la reseña oficial en https://datos-geodesia.ign.es/Red_Geodesica/Hoja0976/097654.pdf— quedan fuera de la política de egreso de esta sesión (403 en el CONNECT, comprobado con npm run red:check). OpenStreetMap (node/948499834, ODbL) confirma posición y altitud citando la misma Red ROI. La cota sin nombre de 493 m es OpenStreetMap (node/11390346158); Wikimedia Commons (foto: MarkJessop1, CC BY-SA 4.0)', FALSE, 1
) poi
WHERE p.slug = 'sierra-de-las-moreras'
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

-- Comprobación posterior: debe devolver 2.
SELECT COUNT(*) AS pois_cargados FROM points_of_interest poi
JOIN parks p ON p.id = poi.park_id WHERE p.slug = 'sierra-de-las-moreras';
