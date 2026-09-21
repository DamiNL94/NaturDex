-- El juego de caracteres se fija SIEMPRE: el cliente mysql lo toma del entorno y en un
-- contenedor sin locale eso es latin1, que convierte cada tilde en mojibake sin dar error.
SET NAMES utf8mb4;

-- ================================================================================================
-- Sierra de Salinas · Fase 3 (N3): puntos de interés.
--
-- GENERADO por Tools/catalogo-nacional/build-poi-sql.js desde el bloque `pointsOfInterest` de
-- Frontend/Data/parks/murcia/sierra-de-salinas/park.json. No editar a mano: regenerar con
--   node Tools/catalogo-nacional/build-poi-sql.js --park sierra-de-salinas
--
-- Hace falta porque Frontend/Js/data.js da PRIORIDAD a la API sobre el park.json empaquetado: en un
-- despliegue con backend, sin este SQL el espacio se seguiría sirviendo con 0 puntos de interés.
--
-- ANTES DE APLICAR, comprobar que el espacio tiene fila en `parks`. Si no la tiene, el
-- INSERT ... SELECT de abajo no encuentra nada y **carga cero filas sin dar ningún error** (le pasó
-- a Sierra Espuña el 2026-08-08):
--   SELECT id, slug, name FROM parks WHERE slug = 'sierra-de-salinas';
--
-- Idempotente: ON DUPLICATE KEY UPDATE sobre la clave única (park_id, slug). Aplicar con:
--   docker exec -i naturdex-db-1 sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql --default-character-set=utf8mb4 naturadex' < Database/n3-pois-sierra-de-salinas.sql
-- ================================================================================================

-- 7 punto(s) de interés.
INSERT INTO points_of_interest (park_id, slug, name, type, description, latitude, longitude, image_url, source, is_approx, orden)
SELECT p.id, poi.slug, poi.name, poi.type, poi.description, poi.latitude, poi.longitude, poi.image_url, poi.source, poi.is_approx, poi.orden
FROM parks p
JOIN (
    SELECT 'capilla-del-fraile' slug, 'Alto de la Capilla del Fraile' name, 'Paisajístico' type, 'Cumbre de la sierra, a 1.238 m. Es el punto más elevado del término municipal de Yecla y el segundo de todo el Altiplano, y desde él se divisa una panorámica que alcanza el paisaje albacetense e incluso la costa alicantina. Sobre los lapiaces de la cumbre crece un grupo de plantas que el plan de gestión enumera una a una: armeria, boj, efedra fina, geranio de roca, enebro común, sabina negral, carrasca y séseli.' description, 38.496733 latitude, -1.013673 longitude, 'https://commons.wikimedia.org/wiki/Special:FilePath/VG_n%C2%BA_87059_La_Capilla.jpg?width=1280' image_url, 'Plan de gestión integral de los espacios protegidos del Altiplano de la Región de Murcia (Decreto n.º 28/2025, de 10 de abril; BORM n.º 103, de 6 de mayo de 2025, anuncio 2033), volumen II, §3.1.2 «Descripción e interpretación del Paisaje» (cumbre y panorámica) y §1.1.2.2.3 (las especies de los lapiaces de la Cumbre Capilla del Fraile). Coordenada del vértice mapeado en OpenStreetMap (node/8982267849, cota 1.238 m), que coincide en 6 m con el vértice geodésico «La Capilla» de Wikidata (Q115504498); Wikimedia Commons (foto: Caçavertex, CC0)' source, FALSE is_approx, 0 orden
    UNION ALL
    SELECT 'pena-del-aguila', 'Peña del Águila', 'Paisajístico', 'Uno de los alineamientos y saltos rocosos que en la sierra se llaman «peñas» y que el plan de gestión destaca por su valor paisajístico. Alcanzan envergaduras de hasta 60 metros y son el rasgo que rompe la continuidad forestal de las laderas. En los roquedos de este tipo se concentra el hábitat de pendientes rocosas calcícolas con vegetación casmofítica, uno de los dos que el plan califica de raros a escala de la región mediterránea.', 38.486684, -1.0399, NULL, 'Plan de gestión integral de los espacios protegidos del Altiplano de la Región de Murcia (Decreto n.º 28/2025, de 10 de abril; BORM n.º 103, de 6 de mayo de 2025, anuncio 2033), volumen II, §3.1.2, que la cita por su nombre entre las «peñas» de la sierra. Coordenada aproximada: es el topónimo del Instituto Geográfico Nacional que representa el paraje (OpenStreetMap node/1243068739), no un punto medido sobre el cantil.', TRUE, 1
    UNION ALL
    SELECT 'pena-de-los-machos', 'Peña de los Machos', 'Paisajístico', 'Otro de los saltos rocosos que el plan de gestión nombra entre las «peñas» de la sierra, en la vertiente sur del macizo. Como los demás, es un resalte de las calizas que quedan en pie al erosionarse los materiales margosos de alrededor, y sostiene la vegetación de grieta que no encuentra sitio en el pinar.', 38.490125, -1.046308, NULL, 'Plan de gestión integral de los espacios protegidos del Altiplano de la Región de Murcia (Decreto n.º 28/2025, de 10 de abril; BORM n.º 103, de 6 de mayo de 2025, anuncio 2033), volumen II, §3.1.2, que la cita por su nombre entre las «peñas» de la sierra. Coordenada aproximada: es el topónimo «Los Machos» del Instituto Geográfico Nacional que representa el paraje (OpenStreetMap node/1243029035), no un punto medido sobre el cantil.', TRUE, 2
    UNION ALL
    SELECT 'los-siete-cotos', 'Los Siete Cotos', 'Paisajístico', 'Escarpes rocosos de la vertiente sur, orientados al mediodía. El plan de gestión los señala como una de las cuatro estaciones botánicas de la sierra y enumera lo que crece en ellos: enebro común, sabina negral, olivardilla, carrasca, aladierno, y dos plantas de roca que solo se ven agarradas a la piedra, la pimpinela espinosa y los zapaticos de la Virgen.', 38.491976, -1.025574, NULL, 'Plan de gestión integral de los espacios protegidos del Altiplano de la Región de Murcia (Decreto n.º 28/2025, de 10 de abril; BORM n.º 103, de 6 de mayo de 2025, anuncio 2033), volumen II, §1.1.2.2.3 «Especies de flora de interés para su conservación», que describe los escarpes de Los Siete Cotos y las especies que sostienen. Coordenada aproximada: es el topónimo del Instituto Geográfico Nacional que representa el paraje (OpenStreetMap node/1243038398), no un punto medido sobre los escarpes.', TRUE, 3
    UNION ALL
    SELECT 'roquedos-del-lagrimal', 'Roquedos del Barranco del Lagrimal', 'Natural', 'Conjunto de roquedos calizos de unos 20 metros de altura y 550 de longitud que corren paralelos al Barranco del Lagrimal, en la cara norte de la sierra. Está declarado Lugar de Interés Botánico con el código YECLA-07 por ser el paraje más húmedo del cuadrante nororiental de la Región: contiene la única localidad murciana de la consuelda Saxifraga corsica subsp. cossoniana y la mejor población de poleo blanco, y es donde sobreviven los pocos ejemplares de mostajo del espacio. El plan de gestión pide para las tres seguimiento poblacional y conservación ex situ.', 38.511779, -1.028232, NULL, 'Plan de gestión integral de los espacios protegidos del Altiplano de la Región de Murcia (Decreto n.º 28/2025, de 10 de abril; BORM n.º 103, de 6 de mayo de 2025, anuncio 2033), volumen II, §1.1.2.2.3, Tabla 9 «Características más relevantes de los lugares de interés botánico», ficha «Roquedos de la Sierra de Salinas (YECLA-07)». Coordenada aproximada: la Tabla 9 no georreferencia el lugar, así que se usa el punto medio de la senda que remonta el barranco por la cara norte (OpenStreetMap way/303967536), que es el paraje que describe; no es un punto medido sobre los roquedos. Se sitúa deliberadamente sobre la senda y no sobre la boca de la cueva del mismo barranco, que no se señala (§4.3.6).', TRUE, 4
    UNION ALL
    SELECT 'colonia-coto-salinas', 'Colonia del Coto Salinas', 'Cultural', 'Poblado forestal levantado a raíz de la Ley de Colonización y Repoblación Interior de 1907, que repartió entre los colonos lotes de once a veintidós hectáreas en la sierra. La colonia llegó a tener servicio religioso, escolar y médico, y de aquello quedan la casa forestal, el almacén, la residencia, las casas de los colonos y la ermita rural. Es el único conjunto habitado que ha tenido el espacio y explica el mosaico de cultivos de secano que rodea el pinar.', 38.507866, -1.044903, NULL, 'Plan de gestión integral de los espacios protegidos del Altiplano de la Región de Murcia (Decreto n.º 28/2025, de 10 de abril; BORM n.º 103, de 6 de mayo de 2025, anuncio 2033), volumen II, §3.1.3 «Patrimonio cultural». Coordenada del conjunto mapeado en OpenStreetMap (node/2692306217 «Colonias Sierra Salinas Yecla»); la casa forestal está a 35 m (node/2692306216) y no se da de alta aparte por la regla de proximidad del §4.3.7. La ermita rural y la tejera que el plan cita no están mapeadas por separado.', FALSE, 5
    UNION ALL
    SELECT 'mirador-de-rabasa', 'Mirador de Rabasa', 'Paisajístico', 'Mirador señalizado en la vertiente norte de la sierra, junto a la pista forestal que la recorre. Asoma sobre los barrancos de umbría, que son la parte más fresca y densamente arbolada del espacio y donde se refugian el quejigo y el culantrillo blanco menor.', 38.508014, -1.025331, NULL, 'OpenStreetMap (node/3082349778, tourism=viewpoint), única fuente que lo recoge: no aparece en el plan de gestión, que para este espacio no trae inventario de uso público. El hecho que se cuenta de su entorno —los barrancos de umbría y su flora— sí sale del Plan de gestión integral de los espacios protegidos del Altiplano de la Región de Murcia (Decreto n.º 28/2025, de 10 de abril; BORM n.º 103, de 6 de mayo de 2025, anuncio 2033), volumen II, §1.1.2.2.3. Pendiente de contrastar sobre el terreno.', FALSE, 6
) poi
WHERE p.slug = 'sierra-de-salinas'
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

-- Comprobación posterior: debe devolver 7.
SELECT COUNT(*) AS pois_cargados FROM points_of_interest poi
JOIN parks p ON p.id = poi.park_id WHERE p.slug = 'sierra-de-salinas';
