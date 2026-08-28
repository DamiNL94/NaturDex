-- El juego de caracteres se fija SIEMPRE: el cliente mysql lo toma del entorno y en un
-- contenedor sin locale eso es latin1, que convierte cada tilde en mojibake sin dar error.
SET NAMES utf8mb4;

-- ================================================================================================
-- Cabo Cope y Puntas de Calnegre · Fase 3 (N3): puntos de interés.
--
-- GENERADO por Tools/catalogo-nacional/build-poi-sql.js desde el bloque `pointsOfInterest` de
-- Frontend\Data\parks\murcia\cabo-cope-puntas-calnegre\park.json. No editar a mano: regenerar con
--   node Tools/catalogo-nacional/build-poi-sql.js --park cabo-cope-puntas-calnegre
--
-- Hace falta porque Frontend/Js/data.js da PRIORIDAD a la API sobre el park.json empaquetado: en un
-- despliegue con backend, sin este SQL el espacio se seguiría sirviendo con 0 puntos de interés.
--
-- ANTES DE APLICAR, comprobar que el espacio tiene fila en `parks`. Si no la tiene, el
-- INSERT ... SELECT de abajo no encuentra nada y **carga cero filas sin dar ningún error** (le pasó
-- a Sierra Espuña el 2026-08-08):
--   SELECT id, slug, name FROM parks WHERE slug = 'cabo-cope-puntas-calnegre';
--
-- Idempotente: ON DUPLICATE KEY UPDATE sobre la clave única (park_id, slug). Aplicar con:
--   docker exec -i naturdex-db-1 sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql --default-character-set=utf8mb4 naturadex' < Database\n3-pois-cabo-cope-puntas-calnegre.sql
-- ================================================================================================

-- 15 punto(s) de interés.
INSERT INTO points_of_interest (park_id, slug, name, type, description, latitude, longitude, image_url, source, is_approx)
SELECT p.id, poi.slug, poi.name, poi.type, poi.description, poi.latitude, poi.longitude, poi.image_url, poi.source, poi.is_approx
FROM parks p
JOIN (
    SELECT 'cabo-cope' slug, 'Cabo Cope' name, 'Paisajístico' type, 'Promontorio litoral y mirador natural sobre la bahía de Mazarrón. El macizo calizo de Cabo Cope está catalogado como Lugar de Interés Geológico: en él aflora muy bien representado el Complejo Maláguide (calizas, micaesquistos y cuarcitas), con interés geomorfológico, estratigráfico y neotectónico, además de su interés cultural.' description, 37.427932 latitude, -1.493014 longitude, 'Img/poi/cabo-cope.jpg' image_url, 'Anexo I del proyecto de PORN del Parque Regional Calnegre y Cabo Cope (ANSE/CARM); Wikimedia Commons (foto: J.Alberto, CC BY-SA 4.0)' source, FALSE is_approx
    UNION ALL
    SELECT 'cala-blanca', 'Cala Blanca', 'Geológico', 'Tramo costero de interés geomorfológico. Aquí afloran cuarcitas, micaesquistos, filitas y conglomerados triásicos del Complejo Alpujárride, visibles en los barrancos y el contacto con el mar.', 37.48348, -1.46224, 'https://commons.wikimedia.org/wiki/Special:FilePath/Cala_blanca_2.JPG', 'Anexo I del proyecto de PORN del Parque Regional Calnegre y Cabo Cope (ANSE/CARM); Wikimedia Commons (foto: Ingegneriadell´elizia, CC BY 3.0)', FALSE
    UNION ALL
    SELECT 'calabardina', 'Calabardina', 'Acceso', 'Núcleo costero de Águilas que funciona como puerta de entrada meridional al parque, al pie del macizo de Cabo Cope. En época púnica y romana funcionó como fondeadero protegido de los vientos de levante; la zona ha dado hallazgos continuos de ánforas de origen púnico y de todos los periodos romanos por su buen abrigo natural.', 37.43452, -1.50347, 'Img/poi/calabardina.jpg', 'Región de Murcia Digital (CARM) - Águilas, Yacimientos; Wikimedia Commons (foto: Rietje Swart, CC BY-SA 2.0). La pedanía queda 554 m FUERA del límite oficial del espacio protegido: entra como puerta de entrada por carretera, que es la función que cumple, y no como un valor de dentro. Distancia medida contra el `parque.geojson` que sirve la app.', TRUE
    UNION ALL
    SELECT 'dunas-fosiles-cope', 'Dunas fósiles de Cabo Cope', 'Geológico', 'Playas y dunas fósiles del Eutirreniense (Pleistoceno), formadas por calcarenitas de origen marino litoral muy erosionables por la acción del agua, que han originado numerosas oquedades y cavidades costeras. El Anexo I del proyecto de PORN las señala como uno de los valores geomorfológicos y paleogeográficos más singulares de la línea de costa del parque.', 37.441423, -1.484144, NULL, 'Anexo I del proyecto de PORN del Parque Regional Calnegre y Cabo Cope (ANSE/CARM). SIN FOTO a propósito desde la auditoría del 2026-08-15: la que servía era «Torre de Cope.JPG», que retrata la torre vigía del XVI —que además tiene POI propio en este mismo espacio— y no las calcarenitas dunares. Commons no tiene ninguna foto de las dunas a menos de 1,2 km (geosearch: los cinco archivos del entorno son la torre y vistas generales).', TRUE
    UNION ALL
    SELECT 'ermita-cope', 'Ermita de Cope', 'Religioso', 'Ermita del siglo XVIII que daba servicio religioso a la guarnición de la Torre de Cope, junto a la que se levanta. Según la tradición local recogida en fuentes de turismo regional, fue destruida por un incendio provocado en un ataque pirata, salvándose solo la talla de la cabeza del Cristo, hoy muy venerada; este episodio concreto está pendiente de contrastar con una fuente documental primaria.', 37.43563, -1.48484, 'https://commons.wikimedia.org/wiki/Special:FilePath/Panor%C3%A1mica_de_la_Torre_de_Cope_y_el_Golfo_de_Mazarr%C3%B3n.jpg', 'OpenStreetMap contributors (ODbL); tradición oral recogida en fuentes de turismo regional (episodio del incendio pendiente de contrastar con fuente documental primaria); Wikimedia Commons (foto: José Alberto Giménez, CC BY-SA 4.0)', FALSE
    UNION ALL
    SELECT 'fuente-piratas', 'Fuente de los piratas', 'Natural', 'Ensenada de la Fuente, cala al este de Cabo Cope que toma su nombre de un manantial de agua dulce junto al que se levanta la Torre de Cope. Fue punto de aguada para la guarnición de la torre y, según la tradición oral recogida en fuentes de turismo regional, también lo usaban las embarcaciones berberiscas que hostigaban la costa (de ahí el nombre popular).', 37.433713, -1.483251, 'https://commons.wikimedia.org/wiki/Special:FilePath/Ensenada_de_la_Fuente.jpg', 'Wikipedia - "Cabo Cope"; descubriendomurcia.com; tradición oral recogida en fuentes de turismo regional (nombre popular pendiente de confirmar con fuente documental primaria); Wikimedia Commons (foto: Jose Ignacio Martinez Navarro, CC BY-SA 3.0 es)', TRUE
    UNION ALL
    SELECT 'lomo-bas', 'Lomo de Bas', 'Geológico', 'Relieve interior que ayuda a leer el contraste entre las sierras litorales, las ramblas y la costa semiárida. Sus laderas suaves enlazan geomorfológicamente con la unidad de la Marina de Cope.', 37.511086, -1.457429, 'Img/poi/lomo-bas.jpg', 'Anexo I del proyecto de PORN del Parque Regional Calnegre y Cabo Cope (ANSE/CARM); Wikimedia Commons (foto: Mabelcalabuig, CC BY-SA 3.0 ES)', FALSE
    UNION ALL
    SELECT 'playa-calnegre', 'Playa de Calnegre', 'Paisajístico', 'Cala de arena y grava dentro del entorno protegido, punto de acceso habitual a la ruta litoral del GR-92 hacia Puntas de Calnegre.', 37.506887, -1.416314, 'Img/poi/playa-calnegre.jpg', 'OpenStreetMap contributors (ODbL); Wikimedia Commons (foto: Mueca, CC BY-SA 4.0)', FALSE
    UNION ALL
    SELECT 'playa-charco', 'Playa del Charco', 'Natural', 'Playa con uno de los mejores tarayales (Tamarix) del litoral murciano; el PORN la cita por su bosque de tarais, representativo del hábitat de interés comunitario 92D0 (galerías y matorrales ribereños termomediterráneos).', 37.449442, -1.482124, 'https://commons.wikimedia.org/wiki/Special:FilePath/Cabo_Cope%2C_desde_la_playa_del_Charco.JPG?width=1280', 'Documento previo del PORN de Calnegre y Cabo Cope (CARM, 2021); OpenStreetMap contributors (ODbL); Wikimedia Commons (foto: Mabelcalabuig, CC BY-SA 3.0 es)', FALSE
    UNION ALL
    SELECT 'punta-cabricas', 'Punta de las Cabricas', 'Paisajístico', 'Saliente rocoso del litoral entre Cabo Cope y Calabardina, con acantilados característicos de este tramo costero del parque y buenas vistas hacia el macizo de Cope.', 37.43294, -1.47693, 'https://commons.wikimedia.org/wiki/Special:FilePath/Cabo_Cope%2C_Punta_del_Cerro_de_la_Cruz_o_de_las_Cabricas.JPG?width=1280', 'OpenStreetMap contributors (ODbL). SIN FOTO a propósito desde la auditoría del 2026-08-15: la que servía era «Puntas de Calnegre, desde Piedras Negras.JPG», cuyo propio nombre dice que retrata Puntas de Calnegre —otro POI de este mismo espacio, a 10,6 km— y no este saliente; Wikimedia Commons (foto: Mabelcalabuig, CC BY-SA 3.0 es)', FALSE
    UNION ALL
    SELECT 'puntas-calnegre', 'Puntas de Calnegre', 'Paisajístico', 'Núcleo litoral en el extremo norte del parque, con playas, gravas, calas y vistas abiertas al Mediterráneo, en el tramo donde Lomo de Bas termina en el mar.', 37.507796, -1.403058, 'Img/poi/puntas-calnegre.jpg', 'OpenStreetMap contributors (ODbL); Wikimedia Commons (foto: Pau lopezca, CC BY-SA 3.0 ES); Región de Murcia Digital (CARM)', FALSE
    UNION ALL
    SELECT 'ruinas-garrobillo', 'Ruinas de la aldea de El Garrobillo', 'Cultural', 'Restos de El Garrobillo, antigua pedanía agrícola del término de Lorca en la Marina de Cope, hoy despoblada. Junto a Ramonete, forma parte de los núcleos rurales tradicionales vinculados al aprovechamiento agrícola histórico de esta zona del parque.', 37.49241, -1.49957, NULL, 'OpenStreetMap contributors (ODbL) - topónimo "El Garrobillo"; referencias generales a las pedanías históricas de Ramonete y El Garrobillo en el término de Lorca. Ubicación aproximada (posición del paraje, no de una edificación concreta verificada en campo).', TRUE
    UNION ALL
    SELECT 'torre-cope', 'Torre de Cope', 'Cultural', 'Torre vigía costera del siglo XVI, construida para la defensa frente a la piratería berberisca que asolaba el litoral murciano. Catalogada como Bien de Interés Cultural. Junto a ella se levantó la Ermita de Cope, que daba servicio religioso a su guarnición.', 37.43695, -1.48441, 'Img/poi/torre-cope.jpg', 'OpenStreetMap contributors (ODbL); Wikimedia Commons (foto: Jose Lorca, dominio público); Región de Murcia Digital (CARM)', FALSE
    UNION ALL
    SELECT 'yacimientos-cope-galera', 'Yacimientos paleontológicos de Galera-Cope', 'Paleontológico', 'Galera-1, Cope 1 y Cope 2, en el extremo sur de la Cuenca de Cope. Galera-1 documenta la transgresión pliocena mediante facies excepcionales de washover fans; Cope 1 y Cope 2, junto al saladar, aportan marcadores bioestratigráficos que sitúan temporalmente los eventos de la cuenca durante el Plioceno.', 37.471473, -1.469368, 'https://commons.wikimedia.org/wiki/Special:FilePath/Cabo_Cope_-_WLE_Spain_2015.jpg', 'Anexo I del proyecto de PORN del Parque Regional Calnegre y Cabo Cope (ANSE/CARM). Posición representativa junto al saladar y la Playa de la Galera; las coordenadas exactas de cada yacimiento no están publicadas. Wikimedia Commons (foto: Raul, CC BY 2.0)', TRUE
    UNION ALL
    SELECT 'yacimientos-garrobillo', 'Yacimientos paleontológicos de Garrobillo', 'Paleontológico', 'Garrobillo 1 y Garrobillo 2, parte de la Cuenca de Cope (Arco de Águilas, Zonas Internas Béticas). Garrobillo 1 muestra el contacto de los materiales neógenos con el basamento metamórfico bético; Garrobillo 2 conserva calcarenitas bioclásticas con concentraciones del foraminífero Lenticulina spp. y de pectínidos de origen tormentoso.', 37.494, -1.498, NULL, 'Anexo I del proyecto de PORN del Parque Regional Calnegre y Cabo Cope (ANSE/CARM). Posición representativa del paraje El Garrobillo; las coordenadas exactas de cada yacimiento no están publicadas. El topónimo queda 68 m fuera del límite oficial, por encima del margen de ~50 m del §4.3.3; se mantiene porque el paraje que el anexo cataloga sí se solapa con el espacio, y la distancia consta aquí en vez de callarse.', TRUE
) poi
WHERE p.slug = 'cabo-cope-puntas-calnegre'
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    type = VALUES(type),
    description = VALUES(description),
    latitude = VALUES(latitude),
    longitude = VALUES(longitude),
    image_url = VALUES(image_url),
    source = VALUES(source),
    is_approx = VALUES(is_approx);

-- Comprobación posterior: debe devolver 15.
SELECT COUNT(*) AS pois_cargados FROM points_of_interest poi
JOIN parks p ON p.id = poi.park_id WHERE p.slug = 'cabo-cope-puntas-calnegre';
