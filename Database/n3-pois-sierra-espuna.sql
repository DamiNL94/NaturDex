-- El juego de caracteres se fija SIEMPRE: el cliente mysql lo toma del entorno y en un
-- contenedor sin locale eso es latin1, que convierte cada tilde en mojibake sin dar error.
SET NAMES utf8mb4;

-- ================================================================================================
-- Sierra Espuña · Fase 3 (N3): puntos de interés.
--
-- GENERADO por Tools/catalogo-nacional/build-poi-sql.js desde el bloque `pointsOfInterest` de
-- Frontend/Data/parks/murcia/sierra-espuna/park.json. No editar a mano: regenerar con
--   node Tools/catalogo-nacional/build-poi-sql.js --park sierra-espuna
--
-- Hace falta porque Frontend/Js/data.js da PRIORIDAD a la API sobre el park.json empaquetado: en un
-- despliegue con backend, sin este SQL el espacio se seguiría sirviendo con 0 puntos de interés.
--
-- ANTES DE APLICAR, comprobar que el espacio tiene fila en `parks`. Si no la tiene, el
-- INSERT ... SELECT de abajo no encuentra nada y **carga cero filas sin dar ningún error** (le pasó
-- a Sierra Espuña el 2026-08-08):
--   SELECT id, slug, name FROM parks WHERE slug = 'sierra-espuna';
--
-- Idempotente: ON DUPLICATE KEY UPDATE sobre la clave única (park_id, slug). Aplicar con:
--   docker exec -i naturdex-db-1 sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql --default-character-set=utf8mb4 naturadex' < Database/n3-pois-sierra-espuna.sql
-- ================================================================================================

-- 13 punto(s) de interés.
INSERT INTO points_of_interest (park_id, slug, name, type, description, latitude, longitude, image_url, source, is_approx)
SELECT p.id, poi.slug, poi.name, poi.type, poi.description, poi.latitude, poi.longitude, poi.image_url, poi.source, poi.is_approx
FROM parks p
JOIN (
    SELECT 'pozos-de-la-nieve' slug, 'Pozos de la Nieve' name, 'Cultural' type, 'Conjunto de 28 pozos de nieve repartidos en dos grupos separados por menos de un kilómetro, en las umbrías de Alhama y Totana. Desde finales del siglo XVI se prensaba aquí la nieve para convertirla en hielo y bajarla a los hospitales y a las ciudades del Reino de Murcia; su apogeo fueron los siglos XVII y XVIII. Está declarado Bien de Interés Cultural con categoría de Sitio de Interés Etnográfico, y el conjunto incluye además casas y una ermita, hoy en ruinas. Dos de los pozos del término de Totana están restaurados y se visitan.' description, 37.869322 latitude, -1.570733 longitude, 'https://commons.wikimedia.org/wiki/Special:FilePath/Pozos_de_la_Nieve_de_Murcia_11-03-2024.jpg?width=1280' image_url, 'Bien de Interés Cultural, categoría Sitio de Interés Etnográfico (Dirección General de Bienes Culturales, Región de Murcia). Posición de los 28 pozos en OpenStreetMap (man_made=ice_house, ODbL). approx: la coordenada es la del Pozo 1 (node/8543844778) y representa el conjunto; Wikimedia Commons (foto: Lorenzo Soriano, CC BY 4.0)' source, TRUE is_approx
    UNION ALL
    SELECT 'pozo-de-la-nieve-de-mula', 'Pozo de la nieve de Mula', 'Cultural', 'Pozo de nieve aislado, a unos tres kilómetros y medio al norte del conjunto principal, cartografiado con nombre propio como Pozo 28. Pertenece al mismo sistema de arquitectura del frío declarado Bien de Interés Cultural, pero queda fuera de los dos grupos de Alhama y Totana. Su nombre lo vincula a la ciudad de Mula como destinataria de su hielo, extremo pendiente de contrastar.', 37.900506, -1.558394, NULL, 'OpenStreetMap node/8543903956 (historic=yes, man_made=ice_house, ODbL). El conjunto de pozos de nieve está declarado BIC como Sitio de Interés Etnográfico.', FALSE
    UNION ALL
    SELECT 'santuario-de-santa-eulalia', 'Santuario de Santa Eulalia de Mérida', 'Religioso', 'Ermita levantada en 1574 y ampliada después con edificaciones anexas hasta formar un conjunto. Conserva artesonado mudéjar y un ciclo de pinturas murales realizado entre 1601 y 1624 que recubre los muros del templo. Está declarada Bien de Interés Cultural con categoría de Monumento.', 37.800765, -1.557502, 'https://commons.wikimedia.org/wiki/Special:FilePath/Iglesia_de_Santa_Eulalia_de_Merida_(1).jpg?width=1280', 'Decreto 96/2002, de 7 de junio, del Consejo de Gobierno de la Región de Murcia, por el que se declara bien de interés cultural, con categoría de monumento, la iglesia de Santa Eulalia de Mérida, en Totana. Posición: OpenStreetMap way/152263929 (ODbL); Wikimedia Commons (foto: Pedro J Pacheco, CC BY-SA 3.0 es)', FALSE
    UNION ALL
    SELECT 'sanatorio-de-tuberculosos', 'Sanatorio de Tuberculosos de Sierra Espuña', 'Cultural', 'Ruinas del sanatorio antituberculoso levantado en la sierra para aprovechar el clima de altura, el tratamiento habitual antes de que los antibióticos hicieran innecesario el aislamiento en montaña. El edificio está hoy en ruinas y sin uso.', 37.868303, -1.512129, 'https://commons.wikimedia.org/wiki/Special:FilePath/Antiguo_Sanatorio_de_Tuberculosos_de_Sierra_Espu%C3%B1a_03.jpg?width=1280', 'OpenStreetMap way/132482920 (historic=building, building=hospital, ruins=yes, ODbL); denominación confirmada en Nominatim. Fechas de construcción y cierre pendientes de contrastar con fuente documental; Wikimedia Commons (foto: Jayma photography ltd, CC BY-SA 4.0)', FALSE
    UNION ALL
    SELECT 'torreon-de-los-exploradores', 'Torreón de los Exploradores', 'Cultural', 'Torre junto al antiguo campamento de los Exploradores. Es el punto elevado que sí se pisa en este sector de la sierra: la cima del Morrón, a 1.583 m, la ocupa el Escuadrón de Vigilancia Aérea nº 13 y es zona militar en activo, cerrada al paso.', 37.861787, -1.572962, NULL, 'OpenStreetMap way/783436635 (man_made=tower, historic=yes, ODbL). El acuartelamiento del EVA-13 figura en OpenStreetMap como zona militar.', FALSE
    UNION ALL
    SELECT 'cano-de-espuna', 'Caño de Espuña', 'Cultural', 'Conducción hidráulica histórica que lleva el agua captada en la sierra hacia el llano, cartografiada como acueducto en varios tramos.', 37.867086, -1.499334, NULL, 'OpenStreetMap relation/13221261 (historic=aqueduct, ODbL). approx: la coordenada es el centro de una obra lineal, no un punto de la propia conducción. Época y función pendientes de contrastar con fuente documental.', TRUE
    UNION ALL
    SELECT 'casas-de-malvariche', 'Casas de Malvariche', 'Cultural', 'Caserío abandonado en el sector noroeste del parque, hoy en ruinas. A pocos cientos de metros quedan la Casa de los Quintana y la Casa del Guarda, del mismo poblamiento disperso anterior a la repoblación forestal de la sierra.', 37.887263, -1.598814, NULL, 'OpenStreetMap way/698763176 (historic=ruins, ODbL); Casa de los Quintana way/698763175 y Casa del Guarda way/698763173.', FALSE
    UNION ALL
    SELECT 'casa-forestal-de-huerta-espuna', 'Casa Forestal de Huerta Espuña', 'Cultural', 'Casa forestal de Huerta Espuña, en el mismo sector que el Centro de Visitantes. Está marcada como elemento histórico y pertenece al aparato de gestión del monte que acompañó a la repoblación forestal de la sierra; su papel concreto en ella está pendiente de contrastar.', 37.857896, -1.516811, 'https://commons.wikimedia.org/wiki/Special:FilePath/Casa_Forestal_de_Huerta_Espu%C3%B1a._Sierra_Espu%C3%B1a.jpg?width=1280', 'OpenStreetMap way/900533315 (historic=yes, ODbL). Pendiente de contrastar con fuente documental; Wikimedia Commons (foto: Lorenzo Soriano, CC BY-SA 4.0)', FALSE
    UNION ALL
    SELECT 'garita-del-turullon', 'Garita del Turullón', 'Paisajístico', 'Torre en el borde oriental de la sierra, asomada al valle del Guadalentín. Consta como torre en la cartografía libre; si es un puesto de vigilancia de incendios o tiene otro origen está pendiente de comprobar en campo.', 37.861313, -1.488209, NULL, 'OpenStreetMap way/553637712 (man_made=tower, ODbL). Uso y época pendientes de contrastar.', FALSE
    UNION ALL
    SELECT 'centro-de-visitantes-ricardo-codorniu', 'Centro de Visitantes Ricardo Codorníu', 'Acceso', 'Centro de visitantes y sede de gestión del parque, y su principal puerta de entrada. Lleva el nombre del ingeniero de montes que dirigió la repoblación forestal de Sierra Espuña a finales del siglo XIX.', 37.855798, -1.512696, 'https://commons.wikimedia.org/wiki/Special:FilePath/Centro_de_Visitantes_y_Gesti%C3%B3n_Ricardo_Codorniu._Sierra_Espu%C3%B1a.jpg?width=1280', 'OpenStreetMap way/170061146 (amenity=ranger_station, tourism=information, historic=house, ODbL); Wikimedia Commons (foto: Lorenzo Soriano, CC BY-SA 4.0)', FALSE
    UNION ALL
    SELECT 'torre-del-azaraque', 'Torre del Azaraque', 'Cultural', 'Torre en ruinas en el extremo oriental del parque, junto a las Casas del Azaraque. Queda a unos quince metros del límite oficial, dentro del margen con el que se recortan las capas del espacio.', 37.837443, -1.471796, 'https://commons.wikimedia.org/wiki/Special:FilePath/Restos_de_la_Torre_del_Azaraque_(Alhama_de_Murcia).jpg?width=1280', 'OpenStreetMap way/1097841454 (historic=ruins, man_made=tower, ODbL). Época y función pendientes de contrastar con fuente documental; Wikimedia Commons (foto: Lorenzo Soriano, CC BY-SA 4.0)', FALSE
    UNION ALL
    SELECT 'hornos-de-cal-del-barranco-de-arguelles', 'Hornos de cal del Barranco de Argüelles', 'Cultural', 'El Horno del Barranco de Argüelles es el único con nombre propio de un conjunto de nueve hornos de cal repartidos por el parque; los otros ocho están cartografiados sin nombre. Son estructuras de piedra donde se calcinaba caliza para obtener cal, un oficio ligado al aprovechamiento tradicional del monte.', 37.858432, -1.532187, NULL, 'OpenStreetMap way/1047229110, «Horno del Barranco de Argüelles» (historic=yes, man_made=kiln, ruins=yes, ODbL); otros ocho hornos sin nombre dentro del límite. approx: la coordenada es la del horno con nombre y representa el conjunto.', TRUE
    UNION ALL
    SELECT 'capilla-de-la-virgen-del-rocio', 'Capilla de la Virgen del Rocío', 'Religioso', 'Capilla en el borde nororiental del parque, en el término de Alhama de Murcia. Culturalmente pertenece al caserío de Gebas, con el que la enlaza el camino que la une a la Ermita de Gebas; geométricamente, en cambio, cae dentro del Parque Regional de Sierra Espuña y no dentro del Paisaje Protegido de los Barrancos de Gebas.', 37.896804, -1.459874, NULL, 'OpenStreetMap way/989858047 (amenity=place_of_worship, building=chapel, ODbL). Pertenencia comprobada por point-in-polygon contra geo/parque.geojson: dentro de Sierra Espuña (253 m del borde) y fuera de Barrancos de Gebas (1.218 m).', FALSE
) poi
WHERE p.slug = 'sierra-espuna'
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    type = VALUES(type),
    description = VALUES(description),
    latitude = VALUES(latitude),
    longitude = VALUES(longitude),
    image_url = VALUES(image_url),
    source = VALUES(source),
    is_approx = VALUES(is_approx);

-- Comprobación posterior: debe devolver 13.
SELECT COUNT(*) AS pois_cargados FROM points_of_interest poi
JOIN parks p ON p.id = poi.park_id WHERE p.slug = 'sierra-espuna';
