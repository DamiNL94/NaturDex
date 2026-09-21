-- El juego de caracteres se fija SIEMPRE: el cliente mysql lo toma del entorno y en un
-- contenedor sin locale eso es latin1, que convierte cada tilde en mojibake sin dar error.
SET NAMES utf8mb4;

-- ================================================================================================
-- Calblanque, Monte de las Cenizas y Peña del Águila · Fase 3 (N3): puntos de interés.
--
-- GENERADO por Tools/catalogo-nacional/build-poi-sql.js desde el bloque `pointsOfInterest` de
-- Frontend/Data/parks/murcia/calblanque-monte-cenizas-pena-aguila/park.json. No editar a mano: regenerar con
--   node Tools/catalogo-nacional/build-poi-sql.js --park calblanque-monte-cenizas-pena-aguila
--
-- Hace falta porque Frontend/Js/data.js da PRIORIDAD a la API sobre el park.json empaquetado: en un
-- despliegue con backend, sin este SQL el espacio se seguiría sirviendo con 0 puntos de interés.
--
-- ANTES DE APLICAR, comprobar que el espacio tiene fila en `parks`. Si no la tiene, el
-- INSERT ... SELECT de abajo no encuentra nada y **carga cero filas sin dar ningún error** (le pasó
-- a Sierra Espuña el 2026-08-08):
--   SELECT id, slug, name FROM parks WHERE slug = 'calblanque-monte-cenizas-pena-aguila';
--
-- Idempotente: ON DUPLICATE KEY UPDATE sobre la clave única (park_id, slug). Aplicar con:
--   docker exec -i naturdex-db-1 sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql --default-character-set=utf8mb4 naturadex' < Database/n3-pois-calblanque-monte-cenizas-pena-aguila.sql
-- ================================================================================================

-- 6 punto(s) de interés.
INSERT INTO points_of_interest (park_id, slug, name, type, description, latitude, longitude, image_url, source, is_approx, orden)
SELECT p.id, poi.slug, poi.name, poi.type, poi.description, poi.latitude, poi.longitude, poi.image_url, poi.source, poi.is_approx, poi.orden
FROM parks p
JOIN (
    SELECT 'salinas-del-rasall' slug, 'Salinas del Rasall' name, 'Natural' type, 'Salinas de agua marina en explotación tras el cordón dunar, en el extremo suroriental del parque. El plan de ordenación las distingue como Reserva Ambiental y describe sus tres piezas: las lagunas de almacenaje, las charcas calentadoras y los estanques de cristalización, rodeados de sectores de carrizal y saladar. Es una zona que conserva a la vez valores naturales y una función productiva, y por eso el plan permite seguir sacando sal mientras prohíbe entrar al recinto salinero a quien no trabaja en él: se observa desde las sendas señalizadas de fuera.' description, 37.60442 latitude, -0.738615 longitude, NULL image_url, 'Plan de Ordenación de los Recursos Naturales de Calblanque, Monte de las Cenizas y Peña del Águila (Decreto n.º 45/1995, de 26 de mayo; BORM n.º 152, de 3 de julio de 1995), artículos 51 y 52 (Reserva Ambiental). El Inventario Español de Lugares de Interés Geológico (IELIG, IGME) las recoge además dentro del LIG BEs001 «Playas de Calblanque y Salinas del Rasell», de interés principal geomorfológico. Coordenada aproximada: es el centro del recinto salinero cartografiado en OpenStreetMap (way/1240177113), no un punto medido, porque el elemento es una superficie.' source, TRUE is_approx, 0 orden
    UNION ALL
    SELECT 'duna-fosil-de-calblanque', 'Duna fósil de Calblanque', 'Geológico', 'Conjunto de dunas fósiles cementadas al sur de las salinas, entre éstas y el mar. El plan de ordenación les reserva una figura propia —Reserva Geomorfológica, la única del parque— por su singularidad y por lo que permiten leer de la evolución reciente de esta costa, además de por los elementos florísticos y faunísticos que albergan. Es la zona con el régimen más estricto del parque: solo se puede circular por las sendas y pasos habilitados, precisamente para no disgregar el arenisco.', 37.601026, -0.738425, NULL, 'Plan de Ordenación de los Recursos Naturales de Calblanque, Monte de las Cenizas y Peña del Águila (Decreto n.º 45/1995, de 26 de mayo; BORM n.º 152, de 3 de julio de 1995), artículos 55 y 56 (Reserva Geomorfológica). El artículo 56 sitúa la reserva «inmediatamente al Sur de las Salinas de Calblanque», que es donde cae el elemento cartografiado en OpenStreetMap del que se toma la coordenada (way/1243264170, «Duna Fósil de Calblanque»): el plan nombra el paraje y no lo sitúa, así que la posición viene de OSM y es la del centro de la superficie, no un punto medido sobre el afloramiento.', TRUE, 1
    UNION ALL
    SELECT 'playa-de-calblanque', 'Playa de Calblanque', 'Natural', 'La playa que da nombre al parque, de arena dorada y pendiente suave entre dos salientes rocosos. El inventario geológico explica la forma: la costa está labrada aquí sobre areniscas recientes y poco deformadas, y de ahí que predominen las playas tendidas en vez de los acantilados que cierran el parque por el este. Detrás del arenal quedan el cordón dunar y las salinas, de modo que en unos cientos de metros se pasa del agua a la duna móvil, de la duna al saladar y del saladar a la sierra.', 37.603709, -0.729777, 'https://commons.wikimedia.org/wiki/Special:FilePath/Playa_de_Calblanque.jpg?width=1280', 'Inventario Español de Lugares de Interés Geológico (IELIG, IGME), LIG BEs001 «Playas de Calblanque y Salinas del Rasell», de interés principal geomorfológico e intereses secundarios estratigráfico, tectónico y sedimentológico, consultado de primera mano en el servicio de mapas del IGME. Coordenada tomada del arenal cartografiado en OpenStreetMap (way/130546890), más precisa que el punto único con el que el IELIG representa el LIG entero; Wikimedia Commons (foto: José Miguel Grandal, CC BY-SA 4.0)', FALSE, 2
    UNION ALL
    SELECT 'costa-acantilada-de-punta-barriga-y-cala-cocon', 'Costa acantilada de Punta Barriga y Cala Cocón', 'Geológico', 'El extremo oriental del parque cambia de carácter: aquí el sustrato ya no son areniscas recientes sino rocas metamórficas fuertemente tectonizadas, y la costa responde con acantilados de una veintena de metros y calas encajadas en vez de playas tendidas. Es el mismo litoral leído dos veces, y el contraste con la playa de Calblanque, a tres kilómetros, es la lección que el inventario geológico destaca del lugar.', 37.612858, -0.718408, NULL, 'Inventario Español de Lugares de Interés Geológico (IELIG, IGME), LIG BEs002 «Costa acantilada de Punta Barriga y Cala Cocón», de interés principal geomorfológico e intereses secundarios estratigráfico, tectónico y petrológico-geoquímico, consultado de primera mano en el servicio de mapas del IGME. Coordenada aproximada: es el punto único con el que el IELIG representa el LIG, que describe un tramo de costa y no un afloramiento concreto.', TRUE, 3
    UNION ALL
    SELECT 'calzada-de-portman', 'Calzada de Portmán', 'Arqueológico', 'Tramo de calzada empedrada que subía desde la ensenada de Portmán —el Portus Magnus romano, puerto de salida del plomo y la plata de la sierra minera— hacia el interior del macizo. Está catalogada en la Carta Arqueológica de la Región de Murcia y el plan de ordenación del parque la recoge entre los elementos que su Catálogo de Elementos de Interés Singular debe incluir obligatoriamente. Hoy la cruza uno de los senderos del parque, así que se ve sin salirse del camino.', 37.591185, -0.831643, NULL, 'Plan de Ordenación de los Recursos Naturales de Calblanque, Monte de las Cenizas y Peña del Águila (Decreto n.º 45/1995, de 26 de mayo; BORM n.º 152, de 3 de julio de 1995), artículo 19.1.a, que la enumera como «Calzada de Portmán (expte. 4/84)» entre los yacimientos catalogados por la Carta Arqueológica de la Región de Murcia en el ámbito del plan. Coordenada de la traza cartografiada en OpenStreetMap (way/196203039).', FALSE, 4
    UNION ALL
    SELECT 'villa-romana-del-paturro', 'Villa romana del Paturro', 'Arqueológico', 'Villa marítima romana sobre la ladera que mira a Portmán, con termas y estancias pavimentadas, ocupada entre los siglos I y IV. Es el único elemento del entorno del parque que el plan de ordenación cita ya como Bien de Interés Cultural declarado, y no como expediente pendiente: la declaración es de 1980. Da la medida de lo que fue esta costa cuando el Portus Magnus embarcaba el metal de la sierra.', 37.588302, -0.83943, NULL, 'Plan de Ordenación de los Recursos Naturales de Calblanque, Monte de las Cenizas y Peña del Águila (Decreto n.º 45/1995, de 26 de mayo; BORM n.º 152, de 3 de julio de 1995), artículo 19.1.a, que lo enumera como «Huerto del Paturro (expte. declarado Bien de Interés Cultural. Orden 30-9-80; expte. 364/79)». Coordenada del recinto cartografiado en OpenStreetMap (way/291325184). **Cae 34,6 m FUERA del límite oficial** (§4.3.3): entra a propósito, dentro del margen de ~50 m, porque el plan del parque lo cataloga como elemento de su ámbito —que son 2.453 ha e incluye una franja de conexión alrededor del Parque Regional— y porque es un bien declarado, con protección y vigilancia, que es lo que lo distingue de los yacimientos que el mismo artículo enumera y que no se señalan aquí (§4.3.6).', FALSE, 5
) poi
WHERE p.slug = 'calblanque-monte-cenizas-pena-aguila'
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

-- Comprobación posterior: debe devolver 6.
SELECT COUNT(*) AS pois_cargados FROM points_of_interest poi
JOIN parks p ON p.id = poi.park_id WHERE p.slug = 'calblanque-monte-cenizas-pena-aguila';
