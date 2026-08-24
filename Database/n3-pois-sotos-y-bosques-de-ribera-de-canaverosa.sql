-- El juego de caracteres se fija SIEMPRE: el cliente mysql lo toma del entorno y en un
-- contenedor sin locale eso es latin1, que convierte cada tilde en mojibake sin dar error.
SET NAMES utf8mb4;

-- ================================================================================================
-- Sotos y bosques de ribera de Cañaverosa · Fase 3 (N3): puntos de interés.
--
-- GENERADO por Tools/catalogo-nacional/build-poi-sql.js desde el bloque `pointsOfInterest` de
-- Frontend/Data/parks/murcia/sotos-y-bosques-de-ribera-de-canaverosa/park.json. No editar a mano: regenerar con
--   node Tools/catalogo-nacional/build-poi-sql.js --park sotos-y-bosques-de-ribera-de-canaverosa
--
-- Hace falta porque Frontend/Js/data.js da PRIORIDAD a la API sobre el park.json empaquetado: en un
-- despliegue con backend, sin este SQL el espacio se seguiría sirviendo con 0 puntos de interés.
--
-- ANTES DE APLICAR, comprobar que el espacio tiene fila en `parks`. Si no la tiene, el
-- INSERT ... SELECT de abajo no encuentra nada y **carga cero filas sin dar ningún error** (le pasó
-- a Sierra Espuña el 2026-08-08):
--   SELECT id, slug, name FROM parks WHERE slug = 'sotos-y-bosques-de-ribera-de-canaverosa';
--
-- Idempotente: ON DUPLICATE KEY UPDATE sobre la clave única (park_id, slug). Aplicar con:
--   docker exec -i naturdex-db-1 sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql --default-character-set=utf8mb4 naturadex' < Database/n3-pois-sotos-y-bosques-de-ribera-de-canaverosa.sql
-- ================================================================================================

-- 2 punto(s) de interés.
INSERT INTO points_of_interest (park_id, slug, name, type, description, latitude, longitude, image_url, source, is_approx)
SELECT p.id, poi.slug, poi.name, poi.type, poi.description, poi.latitude, poi.longitude, poi.image_url, poi.source, poi.is_approx
FROM parks p
JOIN (
    SELECT 'santuario-virgen-de-la-esperanza' slug, 'Santuario de la Virgen de la Esperanza' name, 'Religioso' type, 'Santuario alojado en una gruta excavada en la roca sobre el Segura, con noticias documentales desde el siglo XVII. Alberga dos imágenes de la Virgen de la Esperanza, conocidas como «La Pequeñica» y «La Grande», que ya se veneraban juntas en 1786. Su área recreativa y su albergue son las únicas instalaciones de uso público que el plan de gestión sitúa dentro de la Reserva Natural. El punto es además geológico: aquí afloran los conglomerados poligénicos pliocuaternarios sobre los que se asienta el santuario, y desde el mirador contiguo se ve la terraza aluvial del Segura y la estructura del sinclinal de Calasparra.' description, 38.260355 latitude, -1.709433 longitude, 'https://commons.wikimedia.org/wiki/Special:FilePath/Calasparra-santuario-Virgen-de-la-Esperanza.jpg?width=1280' image_url, 'Decreto n.º 55/2015, de 17 de abril, Plan de Gestión Integral de los espacios protegidos Red Natura 2000 del Noroeste de la Región de Murcia (BORM n.º 109, de 14 de mayo de 2015, suplemento n.º 1, anuncio 6009), volumen II: §13.1.4.4 enumera el «Área recreativa del Santuario Virgen de la Esperanza» entre las infraestructuras de uso público de la ZEC y §13.1.8 sitúa el «Albergue del Santuario de la Esperanza» dentro del área de la Reserva Natural de Cañaverosa; §13.1.2.2 «Lugares de Interés Geológico» describe el segundo punto del LIG «Alrededores de Calasparra» como «la formación de conglomerados poligénicos pliocuaternarios donde está situado el Santuario Virgen de la Esperanza», «una zona muy rica desde el punto de vista estratigráfico». PDF consultado de primera mano el 2026-08-22 (194 MB; la capa de texto va con el desplazamiento de glifos descrito en anexos-normativos.json). IELIG (IGME), punto PTs095 «Terraza del Segura y mirador del santuario de Nª Sª de la Esperanza», consultado el 2026-08-22 en mapas.igme.es: interés principal geomorfológico, secundario tectónico e hidrogeológico, rasgo del Plioceno al Pleistoceno, unidad geotectónica Prebético. La descripción de la gruta y de las dos imágenes procede del catálogo de datos abiertos de la CARM «Monumentos en la Región de Murcia» (código 345), consultado el 2026-08-22 vía nexo.carm.es; ese catálogo NO tiene campo de declaración BIC y Wikidata (Q94393191) no le asigna código P808, así que aquí NO se afirma que el santuario sea Bien de Interés Cultural. Coordenada de OpenStreetMap (node/1682134193, amenity=place_of_worship, ODbL), que es la más precisa de las tres disponibles: el punto del IELIG cae a 37 m y el del catálogo de monumentos, a 550 m y fuera del límite oficial; Wikimedia Commons (foto: No machine-readable author provided. Darabuc~commonswiki assumed (b…, Public domain)' source, FALSE is_approx
    UNION ALL
    SELECT 'alamo-del-santuario', 'Álamo del Santuario', 'Natural', 'Álamo de 26 metros junto al camino del santuario, en la galería de ribera que da nombre a la Reserva. El plan de gestión describe este tramo del Segura como una de las dos mejores representaciones de bosque de ribera de la Región, con la alameda de Salix alba y Populus alba (hábitat 92A0) como formación característica; un pie de este porte es lo que esas alamedas llegan a dar cuando el río no está intervenido.', 38.263367, -1.713258, NULL, 'OpenStreetMap (node/13476421793, natural=tree, height=26, denotation=natural_monument, leaf_cycle=deciduous, ODbL), consultado el 2026-08-22. AVISO SOBRE LA FUENTE: la etiqueta `denotation=natural_monument` es una apreciación de quien lo cartografió, NO una figura oficial. El árbol no figura en la relación de árboles monumentales del plan de gestión (Decreto n.º 55/2015, volumen II §13.1.3.1, que para esta ZEC solo cita un Acer granatense en el Puntal de la Chaparrada y una Quercus rotundifolia en Los Cantarrales), y no se ha localizado catálogo autonómico de árboles monumentales consultable por programa: la búsqueda en datos.gob.es no devuelve conjunto de datos de árboles singulares de la Región de Murcia. Queda PENDIENTE DE CONTRASTAR si tiene alguna declaración; la altura y la especie tampoco están verificadas en campo. El encuadre del bosque de ribera procede del Decreto n.º 55/2015, volumen II §13.1.8, que declara la Zona de Reserva «Cañaverosa» por «la singularidad e integridad de los ecosistemas que constituyen la ribera del río» y cita entre sus hábitats los «Bosques de galería de Salix alba y Populus alba (92A0)». Pertenencia comprobada por point-in-polygon contra geo/parque.geojson.', FALSE
) poi
WHERE p.slug = 'sotos-y-bosques-de-ribera-de-canaverosa'
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    type = VALUES(type),
    description = VALUES(description),
    latitude = VALUES(latitude),
    longitude = VALUES(longitude),
    image_url = VALUES(image_url),
    source = VALUES(source),
    is_approx = VALUES(is_approx);

-- Comprobación posterior: debe devolver 2.
SELECT COUNT(*) AS pois_cargados FROM points_of_interest poi
JOIN parks p ON p.id = poi.park_id WHERE p.slug = 'sotos-y-bosques-de-ribera-de-canaverosa';
