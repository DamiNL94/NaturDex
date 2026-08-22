-- El juego de caracteres se fija SIEMPRE: el cliente mysql lo toma del entorno y en un
-- contenedor sin locale eso es latin1, que convierte cada tilde en mojibake sin dar error.
SET NAMES utf8mb4;

-- ================================================================================================
-- Barrancos de Gebas · Fase 3 (N3): puntos de interés.
--
-- GENERADO por Tools/catalogo-nacional/build-poi-sql.js desde el bloque `pointsOfInterest` de
-- Frontend/Data/parks/murcia/barrancos-de-gebas/park.json. No editar a mano: regenerar con
--   node Tools/catalogo-nacional/build-poi-sql.js --park barrancos-de-gebas
--
-- Hace falta porque Frontend/Js/data.js da PRIORIDAD a la API sobre el park.json empaquetado: en un
-- despliegue con backend, sin este SQL el espacio se seguiría sirviendo con 0 puntos de interés.
--
-- ANTES DE APLICAR, comprobar que el espacio tiene fila en `parks`. Si no la tiene, el
-- INSERT ... SELECT de abajo no encuentra nada y **carga cero filas sin dar ningún error** (le pasó
-- a Sierra Espuña el 2026-08-08):
--   SELECT id, slug, name FROM parks WHERE slug = 'barrancos-de-gebas';
--
-- Idempotente: ON DUPLICATE KEY UPDATE sobre la clave única (park_id, slug). Aplicar con:
--   docker exec -i naturdex-db-1 sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql --default-character-set=utf8mb4 naturadex' < Database/n3-pois-barrancos-de-gebas.sql
-- ================================================================================================

-- 4 punto(s) de interés.
INSERT INTO points_of_interest (park_id, slug, name, type, description, latitude, longitude, image_url, source, is_approx)
SELECT p.id, poi.slug, poi.name, poi.type, poi.description, poi.latitude, poi.longitude, poi.image_url, poi.source, poi.is_approx
FROM parks p
JOIN (
    SELECT 'mirador-de-los-barrancos-de-gebas' slug, 'Mirador de los Barrancos de Gebas' name, 'Paisajístico' type, 'El balcón sobre el «paisaje lunar»: desde aquí se abarca de una vez el sistema de cárcavas excavadas en las margas blancas que da nombre al espacio. El PORN cataloga esta cabecera como Lugar de Interés Geológico por su contenido geomorfológico y su utilización didáctica, y le asigna categoría de importancia internacional. Los «bad lands» aparecen en varias zonas del ámbito del Plan, pero es aquí donde alcanzan su máximo desarrollo, sobre los sustratos margosos que continúan el Barranco de Valdelaparra.' description, 37.89679 latitude, -1.428111 longitude, 'https://commons.wikimedia.org/wiki/Special:FilePath/Barrancos_de_Gebas.jpg?width=1280' image_url, 'Decreto n.º 13/1995, de 31 de marzo, por el que se aprueba el Plan de Ordenación de los Recursos Naturales de Sierra Espuña (incluido Barrancos de Gebas) y se declara como Paisaje Protegido los Barrancos de Gebas (BORM n.º 85, de 11 de abril de 1995), Memoria Descriptiva §1.3.1.2: el área catalogada como Lugar de Interés Geológico por la Agencia Regional para el Medio Ambiente y la Naturaleza es la «Cabecera de la Rambla de Algeciras», también denominada Barrancos de Gebas, «considerada de interés por su contenido geomorfológico y su utilización didáctica, con una categoría de importancia internacional»; el mismo apartado sitúa en Gebas el máximo desarrollo de los «bad lands». PDF consultado de primera mano el 2026-08-22. Coordenada de OpenStreetMap (node/9156604473, tourism=viewpoint, ODbL). NOTA: este LIG regional de 1995 NO es ninguno de los dos puntos que el IELIG nacional tiene hoy dentro del límite (GR005 y GR006), que llevan otro nombre y están dados de alta como POI aparte; Wikimedia Commons (foto: Aleuze, CC BY-SA 3.0)' source, FALSE is_approx
    UNION ALL
    SELECT 'rambla-de-librilla', 'Rambla de Librilla', 'Geológico', 'Tramo de rambla excavado en materiales terciarios del Tortoniense al Plioceno superior. El Inventario Español de Lugares de Interés Geológico lo recoge por sus formas erosivas y, en particular, por unas chimeneas de hadas singulares: columnas de marga que quedan en pie porque un bloque más duro en la cima protege de la lluvia la columna que tiene debajo. Su interés principal es geomorfológico, y secundariamente estratigráfico, tectónico y sedimentológico.', 37.907138, -1.373886, NULL, 'IELIG (IGME), lugar GR006 «Rambla de Librilla», consultado de primera mano el 2026-08-22 en mapas.igme.es (servicio BasesDatos/IGME_IELIG, capa 1 de puntos): interés principal geomorfológico, secundario «Estratigráfico. Tectónico. Sedimentológico.», unidad geológica «Depósitos y formas de modelado de origen fluvial y eólico»; la descripción del IGME es la que menciona las «chimeneas de hadas singulares». La ficha NO trae valor científico, didáctico ni turístico calculados (los campos VC, VD y VT vienen vacíos), así que aquí no se les cita ninguno. approx: el IELIG da UN punto para lo que es una rambla —un elemento lineal de kilómetros—, de modo que la coordenada es la representativa del IGME y no la de un afloramiento concreto. Pertenencia comprobada por point-in-polygon contra geo/parque.geojson: dentro, a 372 m del vértice más próximo del límite.', TRUE
    UNION ALL
    SELECT 'barranco-del-infierno', 'Barranco del Infierno o de La Saladilla', 'Geológico', 'Barranco encajado en la cuenca terciaria de Alhama de Murcia-Alcantarilla que atraviesa la mayoría de sus unidades estratigráficas, desde el Tortoniense hasta el Mioceno terminal: recorrerlo es ir cortando de arriba abajo la serie sedimentaria de la cuenca. Está inventariado por su interés geomorfológico, con interés secundario estratigráfico, paleontológico y sedimentológico.', 37.91575, -1.385436, NULL, 'IELIG (IGME), lugar GR005 «Barranco del Infierno o de La Saladilla», consultado de primera mano el 2026-08-22 en mapas.igme.es (servicio BasesDatos/IGME_IELIG, capa 1 de puntos): «Está situado geológicamente en la cuenca terciaria de Alhama de Murcia-Alcantarilla y atraviesa la mayoría de las unidades estratigráficas de la misma desde el Tortoniense al Mioceno terminal»; interés principal geomorfológico, secundario «Estratigráfico. Paleontológico. Sedimentológico.». Los campos de valor científico, didáctico y turístico vienen vacíos y no se les cita ninguno. approx: el IELIG da UN punto para un barranco, que es un elemento lineal; la coordenada es la representativa del IGME. OpenStreetMap sitúa el cauce con el mismo nombre (way/480199423) unos 700 m al este, dentro también del límite: la discrepancia es de qué punto del barranco se elige, no de qué barranco es. Pertenencia comprobada por point-in-polygon contra geo/parque.geojson: dentro, a 139 m del vértice más próximo del límite.', TRUE
    UNION ALL
    SELECT 'mirador-del-embalse-de-algeciras', 'Mirador del Embalse de Algeciras', 'Paisajístico', 'Mirador orientado al noreste sobre el embalse de la Rambla de Algeciras, la lámina de agua que cierra el extremo oriental del espacio. El PORN prohíbe con carácter general la caza en el embalse y en una banda de 500 metros alrededor de sus orillas, y lo hace en un artículo titulado «Protección de aves acuáticas»: el agua embalsada en mitad de un paisaje árido funciona como refugio de acuáticas, y la norma lo trata como tal.', 37.883216, -1.397629, NULL, 'Decreto n.º 13/1995, de 31 de marzo, PORN de Sierra Espuña (incluido Barrancos de Gebas), artículo 51 «Protección de aves acuáticas» (BORM n.º 85, de 11 de abril de 1995): «Se prohíbe con carácter general el ejercicio de la caza en el Embalse de la Rambla de Algeciras, incluyendo una banda periférica de 500 metros alrededor de sus orillas». PDF consultado de primera mano el 2026-08-22. Coordenada de OpenStreetMap (node/8150226020, tourism=viewpoint, direction=NE, ODbL). Dentro del límite hay un SEGUNDO nodo de OSM con el mismo nombre y una errata (node/4732297124, «Mirador del Embalsede Algeciras»), a 1,6 km de éste; no se da de alta porque contaría dos veces el mismo hecho sobre el mismo embalse.', FALSE
) poi
WHERE p.slug = 'barrancos-de-gebas'
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    type = VALUES(type),
    description = VALUES(description),
    latitude = VALUES(latitude),
    longitude = VALUES(longitude),
    image_url = VALUES(image_url),
    source = VALUES(source),
    is_approx = VALUES(is_approx);

-- Comprobación posterior: debe devolver 4.
SELECT COUNT(*) AS pois_cargados FROM points_of_interest poi
JOIN parks p ON p.id = poi.park_id WHERE p.slug = 'barrancos-de-gebas';
