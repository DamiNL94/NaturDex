CREATE DATABASE IF NOT EXISTS naturadex CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE naturadex;

CREATE TABLE IF NOT EXISTS parks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(120) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(120) NOT NULL,
    region VARCHAR(120) NOT NULL,
    province VARCHAR(120) NOT NULL,
    municipality VARCHAR(255),
    description TEXT,
    area_hectares DECIMAL(10,2),
    coastline_km DECIMAL(6,2),
    latitude DECIMAL(10,6) NOT NULL,
    longitude DECIMAL(10,6) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS habitats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    park_id INT NOT NULL,
    slug VARCHAR(60),
    code VARCHAR(20),
    name VARCHAR(255) NOT NULL,
    habitat_type VARCHAR(60),
    description TEXT,
    is_priority BOOLEAN DEFAULT FALSE,
    latitude DECIMAL(10,6),
    longitude DECIMAL(10,6),
    color VARCHAR(20),
    FOREIGN KEY (park_id) REFERENCES parks(id) ON DELETE CASCADE,
    UNIQUE KEY unique_habitat_per_park (park_id, code),
    UNIQUE KEY unique_habitat_slug_per_park (park_id, slug)
);

-- Estas ALTER cubren instalaciones que ya tenían la tabla `habitats` creada antes de
-- añadir la geolocalización de hábitats; en instalaciones nuevas son no-op porque las
-- columnas ya existen en el CREATE TABLE de arriba. Requiere MySQL 8.0.29+ / MariaDB 10.5+.
ALTER TABLE habitats
    ADD COLUMN IF NOT EXISTS slug VARCHAR(60) NULL,
    ADD COLUMN IF NOT EXISTS habitat_type VARCHAR(60) NULL,
    ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,6) NULL,
    ADD COLUMN IF NOT EXISTS longitude DECIMAL(10,6) NULL,
    ADD COLUMN IF NOT EXISTS color VARCHAR(20) NULL,
    ADD COLUMN IF NOT EXISTS review_note TEXT NULL,
    ADD UNIQUE INDEX IF NOT EXISTS unique_habitat_slug_per_park (park_id, slug);

CREATE TABLE IF NOT EXISTS species (
    id INT AUTO_INCREMENT PRIMARY KEY,
    park_id INT NOT NULL,
    common_name VARCHAR(255) NOT NULL,
    scientific_name VARCHAR(255) NOT NULL,
    kingdom ENUM('flora','fauna','fungi','other') NOT NULL,
    family VARCHAR(160),
    primary_habitat VARCHAR(255),
    conservation_status VARCHAR(160),
    description TEXT,
    identification_tips TEXT,
    seasonality VARCHAR(160),
    image_url VARCHAR(500),
    latitude DECIMAL(10,6),
    longitude DECIMAL(10,6),
    rarity_score TINYINT UNSIGNED DEFAULT 1,
    is_featured BOOLEAN DEFAULT FALSE,
    source VARCHAR(500),
    taxon_phylum VARCHAR(120),
    taxon_class VARCHAR(120),
    taxon_order VARCHAR(120),
    taxon_family VARCHAR(120),
    taxon_genus VARCHAR(120),
    iucn_global VARCHAR(400),
    spain_status VARCHAR(500),
    murcia_status VARCHAR(500),
    review_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (park_id) REFERENCES parks(id) ON DELETE CASCADE,
    UNIQUE KEY unique_species_per_park (park_id, scientific_name),
    INDEX idx_species_park_kingdom (park_id, kingdom),
    INDEX idx_species_scientific_name (scientific_name)
);

-- Relación muchos-a-muchos: una especie puede clasificarse en varios hábitats
-- (p. ej. Testudo graeca vive tanto en el matorral semiárido como en el azufaifar).
CREATE TABLE IF NOT EXISTS species_habitats (
    species_id INT NOT NULL,
    habitat_id INT NOT NULL,
    PRIMARY KEY (species_id, habitat_id),
    FOREIGN KEY (species_id) REFERENCES species(id) ON DELETE CASCADE,
    FOREIGN KEY (habitat_id) REFERENCES habitats(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS points_of_interest (
    id INT AUTO_INCREMENT PRIMARY KEY,
    park_id INT NOT NULL,
    slug VARCHAR(120) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(120),
    description TEXT,
    latitude DECIMAL(10,6),
    longitude DECIMAL(10,6),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (park_id) REFERENCES parks(id) ON DELETE CASCADE,
    UNIQUE KEY unique_poi_per_park (park_id, slug)
);

-- Foto, cita de fuente y aviso de coordenada aproximada por punto de interés.
ALTER TABLE points_of_interest
    ADD COLUMN IF NOT EXISTS image_url VARCHAR(500) NULL,
    ADD COLUMN IF NOT EXISTS source VARCHAR(500) NULL,
    ADD COLUMN IF NOT EXISTS is_approx TINYINT(1) NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS observations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    species_id INT NOT NULL,
    user_label VARCHAR(120),
    note TEXT,
    latitude DECIMAL(10,6),
    longitude DECIMAL(10,6),
    observed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    validation_status ENUM('pending','verified','rejected') DEFAULT 'pending',
    FOREIGN KEY (species_id) REFERENCES species(id) ON DELETE CASCADE,
    INDEX idx_observations_species_date (species_id, observed_at)
);

INSERT INTO parks (slug, name, category, region, province, municipality, description, coastline_km, latitude, longitude)
VALUES ('cabo-cope-puntas-calnegre','Cabo Cope y Puntas de Calnegre','Parque Regional','Región de Murcia','Murcia','Águilas y Lorca','Espacio litoral protegido con calas, acantilados, matorral semiárido y praderas marinas. Este parque es el piloto de NaturDex.',17.00,37.501600,-1.449250)
ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), coastline_km = VALUES(coastline_km), updated_at = CURRENT_TIMESTAMP;

-- Hábitats de interés comunitario (Directiva 92/43/CEE) presentes en el Parque Regional Calnegre
-- y Cabo Cope: lista oficial de 15 hábitats (11 terrestres + 4 litorales) que el documento previo
-- del PORN (CARM, 2021) atribuye a los LIC de Calnegre y Cabo Cope. Se depuró un catálogo previo más
-- amplio dejando solo estos 15; quedan fuera 6 códigos que no figuran en esa lista oficial: 3 marinos
-- (1120 Posidonia, 1110 bancos de arena, 1170 arrecifes, probablemente de la ZEC marina adyacente
-- ES6200029) y 3 solo documentados en el Anexo I del proyecto de PORN/ANSE (2240, 3280, 7210).
-- Las coordenadas son un punto representativo del hábitat dentro del parque (para el círculo del
-- mapa), no su extensión real; se sustituirán por polígonos cuando llegue la cartografía QGIS.
INSERT INTO habitats (park_id, slug, code, name, habitat_type, description, is_priority, latitude, longitude, color, review_note)
SELECT p.id, h.slug, h.code, h.name, h.habitat_type, h.description, h.is_priority, h.latitude, h.longitude, h.color, h.review_note
FROM parks p
JOIN (
    SELECT 'acantilados' slug, '1240' code, 'Acantilados mediterráneos con Limonium' name, 'Litoral' habitat_type, 'litoral del parque piloto' description, FALSE is_priority, 37.423855 latitude, -1.494704 longitude, '#8b5e34' color, NULL review_note
    UNION ALL
    SELECT 'matorral-semiarido' slug, '5330' code, 'Matorral termomediterráneo semiárido' name, 'Terrestre' habitat_type, 'terrestre del parque piloto' description, FALSE is_priority, 37.501195 latitude, -1.449516 longitude, '#2f6f4e' color, NULL review_note
    UNION ALL
    SELECT 'azufaifar' slug, '5220' code, 'Matorrales arborescentes de Ziziphus' name, 'Terrestre' habitat_type, 'terrestre del parque piloto' description, TRUE is_priority, 37.501195 latitude, -1.449516 longitude, '#6f8f3a' color, NULL review_note
    UNION ALL
    SELECT 'matorral-halofilo' slug, '1420' code, 'Matorrales halófilos mediterráneos y termoatlánticos' name, 'Terrestre' habitat_type, 'terrestre del parque piloto, marina de Cope' description, FALSE is_priority, 37.482116 latitude, -1.464183 longitude, '#7a6a3a' color, NULL review_note
    UNION ALL
    SELECT 'matorral-halonitrofilo' slug, '1430' code, 'Matorrales halo-nitrófilos' name, 'Terrestre' habitat_type, 'terrestre del parque piloto, marina de Cope' description, FALSE is_priority, 37.464167 latitude, -1.480269 longitude, '#9a7b3f' color, NULL review_note
    UNION ALL
    SELECT 'galeria-ribera' slug, '92D0' code, 'Galerías y matorrales ribereños termomediterráneos' name, 'Terrestre' habitat_type, 'terrestre del parque piloto, ramblas' description, FALSE is_priority, 37.439468 latitude, -1.487286 longitude, '#3f7a5a' color, NULL review_note
    UNION ALL
    SELECT 'veg-anual-desechos-marinos' slug, '1210' code, 'Vegetación anual sobre desechos marinos acumulados' name, 'Litoral' habitat_type, 'comunidades pioneras sobre la línea de acumulación de restos marinos en las playas del parque' description, FALSE is_priority, 37.466605 latitude, -1.473536 longitude, '#c9a66b' color, NULL review_note
    UNION ALL
    SELECT 'estepas-salinas-albardinal' slug, '1510' code, 'Estepas salinas mediterráneas (Limonietalia)' name, 'Terrestre' habitat_type, 'albardinal (Lygeum spartum) sobre suelos salinos de la marina de Cope, asociado a Limonium insigne' description, TRUE is_priority, 37.50201 latitude, -1.42999 longitude, '#b3577a' color, NULL review_note
    UNION ALL
    SELECT 'dunas-embrionarias' slug, '2110' code, 'Dunas móviles embrionarias' name, 'Litoral' habitat_type, 'primer cordón dunar en formación activa junto a la orilla' description, FALSE is_priority, 37.466605 latitude, -1.473536 longitude, '#e0c56a' color, NULL review_note
    UNION ALL
    SELECT 'dunas-malcomietalia' slug, '2230' code, 'Dunas con céspedes del Malcomietalia' name, 'Litoral' habitat_type, 'céspedes anuales sobre arenas dunares estabilizadas' description, FALSE is_priority, 37.507063 latitude, -1.416075 longitude, '#d9b97e' color, 'Cartografiado con una fuente distinta a la del resto de hábitats: la cartografía de hábitats terrestres de la Región de Murcia (CARM, 2020), porque este código no aparece en los recintos del Inventario Español de Hábitats (INB) dentro del parque. Su presencia y delimitación exactas dentro del parque quedan pendientes de revisión.' review_note
    UNION ALL
    SELECT 'rios-glaucium' slug, '3250' code, 'Ríos mediterráneos de caudal permanente con Glaucium flavum' name, 'Terrestre' habitat_type, 'cauces y ramblas con lámina de agua permanente colonizados por la amapola marina' description, FALSE is_priority, 37.500643 latitude, -1.478322 longitude, '#6f9270' color, 'Cartografiado con una fuente distinta a la del resto de hábitats: la cartografía de hábitats terrestres de la Región de Murcia (CARM, 2020), porque este código no aparece en los recintos del Inventario Español de Hábitats (INB) dentro del parque. Su presencia y delimitación exactas dentro del parque quedan pendientes de revisión.' review_note
    UNION ALL
    SELECT 'sabinar-juniperus' slug, '5210' code, 'Matorrales arborescentes de Juniperus spp.' name, 'Terrestre' habitat_type, 'sabinar (Juniperus phoenicea) sobre laderas y cerros del interior del parque' description, FALSE is_priority, 37.427725 latitude, -1.486042 longitude, '#3f6b4a' color, 'Cartografiado con una fuente distinta a la del resto de hábitats: la cartografía de hábitats terrestres de la Región de Murcia (CARM, 2020), porque este código no aparece en los recintos del Inventario Español de Hábitats (INB) dentro del parque. Su presencia y delimitación exactas dentro del parque quedan pendientes de revisión.' review_note
    UNION ALL
    SELECT 'prados-alysso-sedion' slug, '6110' code, 'Prados calcáreos cársticos o basófilos del Alysso-Sedion albi' name, 'Terrestre' habitat_type, 'pastizales de terófitos y crasuláceas sobre suelos esqueléticos calcáreos de los cerros carbonatados' description, TRUE is_priority, 37.427725 latitude, -1.486042 longitude, '#9c8a5e' color, 'Cartografiado con una fuente distinta a la del resto de hábitats: la cartografía de hábitats terrestres de la Región de Murcia (CARM, 2020), porque este código no aparece en los recintos del Inventario Español de Hábitats (INB) dentro del parque. Su presencia y delimitación exactas dentro del parque quedan pendientes de revisión.' review_note
    UNION ALL
    SELECT 'subestepa-thero-brachypodietea' slug, '6220' code, 'Zonas subestépicas de gramíneas y anuales del Thero-Brachypodietea' name, 'Terrestre' habitat_type, 'pastizales terofíticos mediterráneos sobre suelos oligotróficos de llanos y laderas abiertas' description, TRUE is_priority, 37.429269 latitude, -1.489635 longitude, '#b0a066' color, NULL review_note
    UNION ALL
    SELECT 'roquedos-casmofiticos' slug, '8210' code, 'Pendientes rocosas calcícolas con vegetación casmofítica' name, 'Terrestre' habitat_type, 'roquedos y cortados calcáreos con vegetación fisurícola, con Teucrium freynii como especie característica' description, FALSE is_priority, 37.426388 latitude, -1.487499 longitude, '#8a7a6a' color, NULL review_note
) h
WHERE p.slug = 'cabo-cope-puntas-calnegre'
ON DUPLICATE KEY UPDATE name = VALUES(name), habitat_type = VALUES(habitat_type), description = VALUES(description),
    is_priority = VALUES(is_priority), latitude = VALUES(latitude), longitude = VALUES(longitude), color = VALUES(color),
    slug = VALUES(slug), review_note = VALUES(review_note);

-- Poda de hábitats fuera de la lista oficial de 15 del PORN (CARM, 2021) para los LIC de Calnegre
-- y Cabo Cope. El catálogo anterior llegó a tener 21; se retiran 6 códigos que no figuran en esa
-- lista (3 marinos —1120/1110/1170, probablemente de la ZEC marina adyacente ES6200029— y 3 solo
-- del Anexo I del proyecto de PORN/ANSE —2240/3280/7210—). Necesario porque el INSERT idempotente
-- de arriba no elimina filas ya existentes en la base de datos. Los enlaces en species_habitats
-- se borran solos por la FK ON DELETE CASCADE.
DELETE h FROM habitats h
JOIN parks p ON p.id = h.park_id
WHERE p.slug = 'cabo-cope-puntas-calnegre'
  AND h.slug IN ('posidonia', 'banco-arena', 'arrecifes', 'dunas-brachypodietalia', 'rios-paspalo-agrostidion', 'turberas-cladium');

-- Puntos de observación/interés del parque piloto.
-- Coordenadas verificadas/corregidas con topónimos de OpenStreetMap (© OpenStreetMap contributors, ODbL);
-- fotos de Wikimedia Commons con atribución en el campo source; los sitios geológicos/arqueológicos/
-- paleontológicos citan el Anexo I del proyecto de PORN (ANSE) u otras fuentes primarias. is_approx=1
-- marca posiciones representativas/estimadas, no coordenadas de campo verificadas. Ver README para el
-- aviso sobre 4 puntos históricos (Puntas de Calnegre, Playa de Calnegre, Lomo de Bas, Calabardina) que,
-- pese a estar geolocalizados correctamente, caen entre 200 y 660 m fuera del polígono oficial del
-- Parque Regional (núcleos urbanos y cumbres justo en su límite).
INSERT INTO points_of_interest (park_id, slug, name, type, description, latitude, longitude, image_url, source, is_approx)
SELECT p.id, poi.slug, poi.name, poi.type, poi.description, poi.latitude, poi.longitude, poi.image_url, poi.source, poi.is_approx
FROM parks p
JOIN (
    SELECT 'torre-cope' slug, 'Torre de Cope' name, 'Cultural' type, 'Torre vigía costera del siglo XVI, construida para la defensa frente a la piratería berberisca que asolaba el litoral murciano. Catalogada como Bien de Interés Cultural. Junto a ella se levantó la Ermita de Cope, que daba servicio religioso a su guarnición.' description, 37.43695 latitude, -1.48441 longitude, 'Img/poi/torre-cope.jpg' image_url, 'OpenStreetMap contributors (ODbL); Wikimedia Commons (foto: Jose Lorca, dominio público); Región de Murcia Digital (CARM)' source, FALSE is_approx
    UNION ALL
    SELECT 'cabo-cope' slug, 'Cabo Cope' name, 'Paisajístico' type, 'Promontorio litoral y mirador natural sobre la bahía de Mazarrón. El macizo calizo de Cabo Cope está catalogado como Lugar de Interés Geológico: en él aflora muy bien representado el Complejo Maláguide (calizas, micaesquistos y cuarcitas), con interés geomorfológico, estratigráfico y neotectónico, además de su interés cultural.' description, 37.42283 latitude, -1.49217 longitude, 'Img/poi/cabo-cope.jpg' image_url, 'Anexo I del proyecto de PORN del Parque Regional Calnegre y Cabo Cope (ANSE/CARM); Wikimedia Commons (foto: J.Alberto, CC BY-SA 4.0)' source, FALSE is_approx
    UNION ALL
    SELECT 'puntas-calnegre' slug, 'Puntas de Calnegre' name, 'Paisajístico' type, 'Núcleo litoral en el extremo norte del parque, con playas, gravas, calas y vistas abiertas al Mediterráneo, en el tramo donde Lomo de Bas termina en el mar.' description, 37.51058 latitude, -1.40198 longitude, 'Img/poi/puntas-calnegre.jpg' image_url, 'OpenStreetMap contributors (ODbL); Wikimedia Commons (foto: Pau lopezca, CC BY-SA 3.0 ES); Región de Murcia Digital (CARM)' source, FALSE is_approx
    UNION ALL
    SELECT 'playa-calnegre' slug, 'Playa de Calnegre' name, 'Paisajístico' type, 'Cala de arena y grava dentro del entorno protegido, punto de acceso habitual a la ruta litoral del GR-92 hacia Puntas de Calnegre.' description, 37.51155 latitude, -1.40063 longitude, 'Img/poi/playa-calnegre.jpg' image_url, 'OpenStreetMap contributors (ODbL); Wikimedia Commons (foto: Mueca, CC BY-SA 4.0)' source, FALSE is_approx
    UNION ALL
    SELECT 'cala-blanca' slug, 'Cala Blanca' name, 'Geológico' type, 'Tramo costero de interés geomorfológico. Aquí afloran cuarcitas, micaesquistos, filitas y conglomerados triásicos del Complejo Alpujárride, visibles en los barrancos y el contacto con el mar.' description, 37.48348 latitude, -1.46224 longitude, NULL image_url, 'Anexo I del proyecto de PORN del Parque Regional Calnegre y Cabo Cope (ANSE/CARM)' source, FALSE is_approx
    UNION ALL
    SELECT 'lomo-bas' slug, 'Lomo de Bas' name, 'Geológico' type, 'Relieve interior que ayuda a leer el contraste entre las sierras litorales, las ramblas y la costa semiárida. Sus laderas suaves enlazan geomorfológicamente con la unidad de la Marina de Cope.' description, 37.5073 latitude, -1.46446 longitude, 'Img/poi/lomo-bas.jpg' image_url, 'Anexo I del proyecto de PORN del Parque Regional Calnegre y Cabo Cope (ANSE/CARM); Wikimedia Commons (foto: Mabelcalabuig, CC BY-SA 3.0 ES)' source, FALSE is_approx
    UNION ALL
    SELECT 'calabardina' slug, 'Calabardina' name, 'Acceso' type, 'Núcleo costero de Águilas que funciona como puerta de entrada meridional al parque, al pie del macizo de Cabo Cope. En época púnica y romana funcionó como fondeadero protegido de los vientos de levante; la zona ha dado hallazgos continuos de ánforas de origen púnico y de todos los periodos romanos por su buen abrigo natural.' description, 37.43452 latitude, -1.50347 longitude, 'Img/poi/calabardina.jpg' image_url, 'Región de Murcia Digital (CARM) - Águilas, Yacimientos; Wikimedia Commons (foto: Rietje Swart, CC BY-SA 2.0)' source, FALSE is_approx
    UNION ALL
    SELECT 'playa-sombrerico' slug, 'Playa del Sombrerico' name, 'Natural' type, 'Playa con uno de los mejores tarayales (Tamarix) del litoral murciano; el PORN la cita por su bosque de tarais, representativo del hábitat de interés comunitario 92D0 (galerías y matorrales ribereños termomediterráneos).' description, 37.44479 latitude, -1.48198 longitude, NULL image_url, 'Documento previo del PORN de Calnegre y Cabo Cope (CARM, 2021); OpenStreetMap contributors (ODbL)' source, FALSE is_approx
    UNION ALL
    SELECT 'ermita-cope' slug, 'Ermita de Cope' name, 'Religioso' type, 'Ermita del siglo XVIII que daba servicio religioso a la guarnición de la Torre de Cope, junto a la que se levanta. Según la tradición local recogida en fuentes de turismo regional, fue destruida por un incendio provocado en un ataque pirata, salvándose solo la talla de la cabeza del Cristo, hoy muy venerada; este episodio concreto está pendiente de contrastar con una fuente documental primaria.' description, 37.43563 latitude, -1.48484 longitude, NULL image_url, 'OpenStreetMap contributors (ODbL); tradición oral recogida en fuentes de turismo regional (episodio del incendio pendiente de contrastar con fuente documental primaria)' source, FALSE is_approx
    UNION ALL
    SELECT 'cueva-c6' slug, 'Cueva C.6' name, 'Arqueológico' type, 'Cavidad kárstica costera inundada hace miles de años, en la ladera del macizo de Cope más expuesta a los temporales de levante. Conserva restos cerámicos del tránsito Neolítico final-Edad del Bronce (c. 3000 a.C.), el registro arqueológico más antiguo conocido en el macizo, similar a otras cuevas sumergidas del litoral Cartagena-Mazarrón.' description, 37.427 latitude, -1.493 longitude, NULL image_url, 'cuevasdemurcia.com - Cueva C.6 (Águilas); Región de Murcia Digital - Águilas, Yacimientos' source, TRUE is_approx
    UNION ALL
    SELECT 'dunas-fosiles-cope' slug, 'Dunas fósiles de Cabo Cope' name, 'Geológico' type, 'Playas y dunas fósiles del Eutirreniense (Pleistoceno), formadas por calcarenitas de origen marino litoral muy erosionables por la acción del agua, que han originado numerosas oquedades y cavidades costeras. El Anexo I del proyecto de PORN las señala como uno de los valores geomorfológicos y paleogeográficos más singulares de la línea de costa del parque.' description, 37.441 latitude, -1.4855 longitude, NULL image_url, 'Anexo I del proyecto de PORN del Parque Regional Calnegre y Cabo Cope (ANSE/CARM)' source, TRUE is_approx
    UNION ALL
    SELECT 'yacimientos-garrobillo' slug, 'Yacimientos paleontológicos de Garrobillo' name, 'Paleontológico' type, 'Garrobillo 1 y Garrobillo 2, parte de la Cuenca de Cope (Arco de Águilas, Zonas Internas Béticas). Garrobillo 1 muestra el contacto de los materiales neógenos con el basamento metamórfico bético; Garrobillo 2 conserva calcarenitas bioclásticas con concentraciones del foraminífero Lenticulina spp. y de pectínidos de origen tormentoso.' description, 37.494 latitude, -1.498 longitude, NULL image_url, 'Anexo I del proyecto de PORN del Parque Regional Calnegre y Cabo Cope (ANSE/CARM). Posición representativa del paraje El Garrobillo; las coordenadas exactas de cada yacimiento no están publicadas.' source, TRUE is_approx
    UNION ALL
    SELECT 'yacimientos-cope-galera' slug, 'Yacimientos paleontológicos de Galera-Cope' name, 'Paleontológico' type, 'Galera-1, Cope 1 y Cope 2, en el extremo sur de la Cuenca de Cope. Galera-1 documenta la transgresión pliocena mediante facies excepcionales de washover fans; Cope 1 y Cope 2, junto al saladar, aportan marcadores bioestratigráficos que sitúan temporalmente los eventos de la cuenca durante el Plioceno.' description, 37.474 latitude, -1.475 longitude, NULL image_url, 'Anexo I del proyecto de PORN del Parque Regional Calnegre y Cabo Cope (ANSE/CARM). Posición representativa junto al saladar y la Playa de la Galera; las coordenadas exactas de cada yacimiento no están publicadas.' source, TRUE is_approx
    UNION ALL
    SELECT 'fuente-piratas' slug, 'Fuente de los piratas' name, 'Natural' type, 'Ensenada de la Fuente, cala al este de Cabo Cope que toma su nombre de un manantial de agua dulce junto al que se levanta la Torre de Cope. Fue punto de aguada para la guarnición de la torre y, según la tradición oral recogida en fuentes de turismo regional, también lo usaban las embarcaciones berberiscas que hostigaban la costa (de ahí el nombre popular).' description, 37.4368 latitude, -1.4855 longitude, NULL image_url, 'Wikipedia - "Cabo Cope"; descubriendomurcia.com; tradición oral recogida en fuentes de turismo regional (nombre popular pendiente de confirmar con fuente documental primaria)' source, TRUE is_approx
    UNION ALL
    SELECT 'punta-cabricas' slug, 'Punta de las Cabricas' name, 'Paisajístico' type, 'Saliente rocoso del litoral entre Cabo Cope y Calabardina, con acantilados característicos de este tramo costero del parque y buenas vistas hacia el macizo de Cope.' description, 37.43294 latitude, -1.47693 longitude, NULL image_url, 'OpenStreetMap contributors (ODbL)' source, FALSE is_approx
    UNION ALL
    SELECT 'ruinas-garrobillo' slug, 'Ruinas de la aldea de El Garrobillo' name, 'Cultural' type, 'Restos de El Garrobillo, antigua pedanía agrícola del término de Lorca en la Marina de Cope, hoy despoblada. Junto a Ramonete, forma parte de los núcleos rurales tradicionales vinculados al aprovechamiento agrícola histórico de esta zona del parque.' description, 37.49241 latitude, -1.49957 longitude, NULL image_url, 'OpenStreetMap contributors (ODbL) - topónimo "El Garrobillo"; referencias generales a las pedanías históricas de Ramonete y El Garrobillo en el término de Lorca. Ubicación aproximada (posición del paraje, no de una edificación concreta verificada en campo).' source, TRUE is_approx
) poi
WHERE p.slug = 'cabo-cope-puntas-calnegre'
ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), type = VALUES(type),
    latitude = VALUES(latitude), longitude = VALUES(longitude), image_url = VALUES(image_url),
    source = VALUES(source), is_approx = VALUES(is_approx);

-- Catálogo de especies semilla, con taxonomía completa y tres niveles de estatus de conservación
-- (IUCN Global, Lista Roja/Catálogo nacional español, Catálogo Regional de Murcia), citando fuente por registro.
-- Fuentes generales: Región de Murcia Digital / CARM; Wikipedia "Parque regional de Cabo Cope y Puntas de Calnegre";
-- Alcaraz Ariza, F.J. "La Marina de Cope: ¿los últimos días de un paraíso botánico?" (Eubacteria nº5, Universidad de Murcia);
-- Decreto 50/2003 (BORM), Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia;
-- Sánchez Gómez et al. 2002, Libro Rojo de la Flora Silvestre Protegida de la Región de Murcia;
-- Lista Roja 2008 de la Flora Vascular Española (MITECO / listaroja.conservacionvegetal.org);
-- IUCN Red List of Threatened Species (evaluación global).
-- IMPORTANTE: varios registros incluyen review_note señalando incertidumbres (identificación, sinonimia o presencia
-- exacta en Cabo Cope) para que un especialista los revise antes de un uso definitivo. Ver README para el listado.
INSERT INTO species (park_id, common_name, scientific_name, kingdom, family, primary_habitat, conservation_status,
    description, identification_tips, seasonality, image_url, latitude, longitude, rarity_score, is_featured, source,
    taxon_phylum, taxon_class, taxon_order, taxon_family, taxon_genus, iucn_global, spain_status, murcia_status, review_note)
SELECT p.id, s.common_name, s.scientific_name, s.kingdom, s.family, s.primary_habitat, s.conservation_status,
    s.description, s.identification_tips, s.seasonality, s.image_url, s.latitude, s.longitude, s.rarity_score, s.is_featured, s.source,
    s.taxon_phylum, s.taxon_class, s.taxon_order, s.taxon_family, s.taxon_genus, s.iucn_global, s.spain_status, s.murcia_status, s.review_note
FROM parks p
JOIN (
    SELECT 'Tortuga mora' common_name, 'Testudo graeca' scientific_name, 'fauna' kingdom, 'Reptil' family, 'Matorral termomediterráneo semiárido' primary_habitat, 'Amenazada' conservation_status, 'Reptil terrestre emblemático de ambientes áridos, matorrales mediterráneos y zonas abiertas del sureste ibérico.' description, 'Caparazón abombado; Actividad en horas templadas; No manipular ni desplazar ejemplares' identification_tips, 'Primavera y otoño' seasonality, 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Testudo_graeca_Lambert_01.jpg/640px-Testudo_graeca_Lambert_01.jpg' image_url, 37.5075 latitude, -1.4422 longitude, 5 rarity_score, TRUE is_featured, 'Región de Murcia Digital (CARM) - Fauna de Cabo Cope y Puntas de Calnegre' source, 'Chordata' taxon_phylum, 'Reptilia' taxon_class, 'Testudines' taxon_order, 'Testudinidae' taxon_family, 'Testudo' taxon_genus, 'VU A1cd (evaluación IUCN de 1996; pendiente de reevaluación global reciente)' iucn_global, 'Catálogo Español de Especies Amenazadas / LESRPE (Listado de Especies Silvestres en Régimen de Protección Especial)' spain_status, 'Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de Murcia: En peligro de extinción' murcia_status, NULL review_note
    UNION ALL
    SELECT 'Águila perdicera' common_name, 'Aquila fasciata' scientific_name, 'fauna' kingdom, 'Ave rapaz' family, 'Cortados y áreas abiertas' primary_habitat, 'Amenazada' conservation_status, 'Rapaz mediterránea asociada a sierras, cortados y territorios de campeo amplios.' description, 'Silueta grande y vuelo potente; Observar a distancia; Evitar molestias en zonas de nidificación' identification_tips, 'Todo el año' seasonality, 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Bonellis_Eagle_Aquila_fasciata_by_Dr._Raju_Kasambe_DSCN1709_%2810%29.jpg/640px-Bonellis_Eagle_Aquila_fasciata_by_Dr._Raju_Kasambe_DSCN1709_%2810%29.jpg' image_url, 37.5202 latitude, -1.426 longitude, 5 rarity_score, TRUE is_featured, 'Región de Murcia Digital (CARM) - Fauna de Cabo Cope y Puntas de Calnegre; Libro Rojo de las Aves de España, SEO/BirdLife 2004; Ley 7/1995, de 21 de abril, de la Fauna Silvestre de la Región de Murcia (Anexo I)' source, 'Chordata' taxon_phylum, 'Aves' taxon_class, 'Accipitriformes' taxon_order, 'Accipitridae' taxon_family, 'Aquila' taxon_genus, 'LC (población global amplia en Asia y África pese al declive europeo)' iucn_global, 'Catálogo Español de Especies Amenazadas: Vulnerable; Libro Rojo de las Aves de España (SEO/BirdLife, 2004/2021)' spain_status, 'Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de Murcia: En peligro de extinción (población reproductora muy reducida)' murcia_status, NULL review_note
    UNION ALL
    SELECT 'Camachuelo trompetero' common_name, 'Bucanetes githagineus' scientific_name, 'fauna' kingdom, 'Ave esteparia' family, 'Paisaje árido y matorral bajo' primary_habitat, 'Interés especial' conservation_status, 'Ave ligada a paisajes semiáridos, con gran valor como indicador de biodiversidad esteparia.' description, 'Pico robusto; Tonos rosados discretos; Suele moverse en pequeños grupos' identification_tips, 'Primavera y verano' seasonality, 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Bucanetes_githagineus_2.jpg/640px-Bucanetes_githagineus_2.jpg' image_url, 37.5155 latitude, -1.4565 longitude, 4 rarity_score, TRUE is_featured, 'Región de Murcia Digital (CARM) - Fauna de Cabo Cope y Puntas de Calnegre' source, 'Chordata' taxon_phylum, 'Aves' taxon_class, 'Passeriformes' taxon_order, 'Fringillidae' taxon_family, 'Bucanetes' taxon_genus, 'LC' iucn_global, 'Catalogado como Vulnerable en el Libro Rojo de las Aves de España (población ibérica escasa y localizada)' spain_status, 'Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de Murcia: De interés especial' murcia_status, NULL review_note
    UNION ALL
    SELECT 'Cormorán moñudo' common_name, 'Gulosus aristotelis' scientific_name, 'fauna' kingdom, 'Ave marina' family, 'Litoral rocoso' primary_habitat, 'Protección especial' conservation_status, 'Ave marina de costas rocosas, islotes y aguas someras donde busca alimento.' description, 'Plumaje oscuro; Nada bajo sobre el agua; Penacho visible en época nupcial' identification_tips, 'Todo el año' seasonality, 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/European_shag_%28Phalacrocorax_aristotelis%29.jpg/640px-European_shag_%28Phalacrocorax_aristotelis%29.jpg' image_url, 37.487 latitude, -1.4714 longitude, 4 rarity_score, FALSE is_featured, 'Región de Murcia Digital (CARM) - Fauna de Cabo Cope y Puntas de Calnegre' source, 'Chordata' taxon_phylum, 'Aves' taxon_class, 'Suliformes' taxon_order, 'Phalacrocoracidae' taxon_family, 'Gulosus' taxon_genus, 'LC' iucn_global, 'Subespecie mediterránea (desmarestii) catalogada Vulnerable en el Catálogo Español de Especies Amenazadas' spain_status, 'Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de Murcia: De interés especial' murcia_status, 'Reclasificado taxonómicamente de Phalacrocorax aristotelis a Gulosus aristotelis; confirmar si la población litoral pertenece a la subespecie desmarestii.' review_note
    UNION ALL
    SELECT 'Lagarto ocelado' common_name, 'Timon lepidus' scientific_name, 'fauna' kingdom, 'Reptil' family, 'Matorral termomediterráneo semiárido' primary_habitat, 'Protección especial' conservation_status, 'Uno de los mayores lagartos de Europa, ligado a roquedos soleados y matorral mediterráneo bien conservado.' description, 'Coloración verde con ocelos azules; Adultos de gran tamaño (hasta 60 cm); Muy territorial y termorregulador' identification_tips, 'Primavera a otoño' seasonality, NULL image_url, 37.5041 latitude, -1.4489 longitude, 3 rarity_score, FALSE is_featured, 'Región de Murcia Digital (CARM) - Fauna de Cabo Cope y Puntas de Calnegre' source, 'Chordata' taxon_phylum, 'Reptilia' taxon_class, 'Squamata' taxon_order, 'Lacertidae' taxon_family, 'Timon' taxon_genus, 'NT (Casi Amenazado, evaluación de 2009 por declive poblacional en parte de su área)' iucn_global, 'LESRPE (Listado de Especies Silvestres en Régimen de Protección Especial)' spain_status, 'Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de Murcia: De interés especial' murcia_status, NULL review_note
    UNION ALL
    SELECT 'Eslizón ibérico' common_name, 'Chalcides bedriagai' scientific_name, 'fauna' kingdom, 'Reptil' family, 'Matorral termomediterráneo semiárido' primary_habitat, 'Protección especial' conservation_status, 'Reptil endémico ibérico de hábitos fosoriales, ligado a suelos sueltos y pedregosos con vegetación rala.' description, 'Cuerpo alargado y patas muy cortas; Se desplaza reptando entre hojarasca y piedras; Difícil de observar, muy escurridizo' identification_tips, 'Primavera y verano' seasonality, NULL image_url, 37.5058 latitude, -1.4448 longitude, 4 rarity_score, FALSE is_featured, 'Región de Murcia Digital (CARM) - Fauna de Cabo Cope y Puntas de Calnegre' source, 'Chordata' taxon_phylum, 'Reptilia' taxon_class, 'Squamata' taxon_order, 'Scincidae' taxon_family, 'Chalcides' taxon_genus, 'LC' iucn_global, 'LESRPE' spain_status, 'Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de Murcia: De interés especial' murcia_status, NULL review_note
    UNION ALL
    SELECT 'Búho real' common_name, 'Bubo bubo' scientific_name, 'fauna' kingdom, 'Ave rapaz nocturna' family, 'Cortados y áreas abiertas' primary_habitat, 'Protección especial' conservation_status, 'Rapaz nocturna de gran tamaño que nidifica en cortados y roquedos del parque.' description, 'Gran tamaño y penachos auriculares; Actividad crepuscular y nocturna; Ulular grave audible al atardecer' identification_tips, 'Todo el año' seasonality, NULL image_url, 37.5188 latitude, -1.4275 longitude, 4 rarity_score, FALSE is_featured, 'Región de Murcia Digital (CARM) - Fauna de Cabo Cope y Puntas de Calnegre' source, 'Chordata' taxon_phylum, 'Aves' taxon_class, 'Strigiformes' taxon_order, 'Strigidae' taxon_family, 'Bubo' taxon_genus, 'LC' iucn_global, 'LESRPE' spain_status, 'Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de Murcia: De interés especial' murcia_status, NULL review_note
    UNION ALL
    SELECT 'Halcón peregrino' common_name, 'Falco peregrinus' scientific_name, 'fauna' kingdom, 'Ave rapaz' family, 'Cortados y áreas abiertas' primary_habitat, 'Protección especial' conservation_status, 'Rapaz de vuelo veloz asociada a cortados costeros, donde caza aves en pleno vuelo.' description, 'Vuelo rápido en picado; Silueta compacta de alas puntiagudas; Nidifica en repisas de acantilado' identification_tips, 'Todo el año' seasonality, NULL image_url, 37.521 latitude, -1.4245 longitude, 4 rarity_score, FALSE is_featured, 'Región de Murcia Digital (CARM) - Fauna de Cabo Cope y Puntas de Calnegre' source, 'Chordata' taxon_phylum, 'Aves' taxon_class, 'Falconiformes' taxon_order, 'Falconidae' taxon_family, 'Falco' taxon_genus, 'LC' iucn_global, 'LESRPE' spain_status, 'Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de Murcia: De interés especial' murcia_status, NULL review_note
    UNION ALL
    SELECT 'Alcaraván' common_name, 'Burhinus oedicnemus' scientific_name, 'fauna' kingdom, 'Ave esteparia' family, 'Paisaje árido y matorral bajo' primary_habitat, 'Interés especial' conservation_status, 'Ave de hábitos crepusculares ligada a los llanos abiertos de la marina de Cope.' description, 'Ojos grandes y amarillos; Canto nocturno característico; Camuflaje excelente en suelo pedregoso' identification_tips, 'Primavera y verano' seasonality, NULL image_url, 37.5162 latitude, -1.451 longitude, 3 rarity_score, FALSE is_featured, 'Región de Murcia Digital (CARM) - Fauna de Cabo Cope y Puntas de Calnegre' source, 'Chordata' taxon_phylum, 'Aves' taxon_class, 'Charadriiformes' taxon_order, 'Burhinidae' taxon_family, 'Burhinus' taxon_genus, 'LC' iucn_global, 'LESRPE' spain_status, 'Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de Murcia: De interés especial' murcia_status, NULL review_note
    UNION ALL
    SELECT 'Curruca cabecinegra' common_name, 'Curruca melanocephala' scientific_name, 'fauna' kingdom, 'Ave' family, 'Matorral litoral y laderas secas' primary_habitat, 'Interés especial' conservation_status, 'Pequeña ave residente muy común en los matorrales mediterráneos del parque.' description, 'Capirote negro contrastado; Canto parlanchín y áspero; Se mueve entre el matorral bajo' identification_tips, 'Todo el año' seasonality, NULL image_url, 37.502 latitude, -1.439 longitude, 2 rarity_score, FALSE is_featured, 'Región de Murcia Digital (CARM) - Fauna de Cabo Cope y Puntas de Calnegre; clasificación de género Curruca conforme al IOC World Bird List' source, 'Chordata' taxon_phylum, 'Aves' taxon_class, 'Passeriformes' taxon_order, 'Sylviidae' taxon_family, 'Curruca' taxon_genus, 'LC' iucn_global, 'No catalogada (especie común y estable en España)' spain_status, 'No catalogada regionalmente' murcia_status, NULL review_note
    UNION ALL
    SELECT 'Cogujada común' common_name, 'Galerida cristata' scientific_name, 'fauna' kingdom, 'Ave' family, 'Paisaje árido y matorral bajo' primary_habitat, 'Interés especial' conservation_status, 'Ave de zonas abiertas y cultivos marginales, reconocible por su cresta puntiaguda.' description, 'Cresta erguida característica; Vuelo bajo y ondulado; Camina en vez de saltar' identification_tips, 'Todo el año' seasonality, NULL image_url, 37.5145 latitude, -1.4552 longitude, 2 rarity_score, FALSE is_featured, 'Región de Murcia Digital (CARM) - Fauna de Cabo Cope y Puntas de Calnegre' source, 'Chordata' taxon_phylum, 'Aves' taxon_class, 'Passeriformes' taxon_order, 'Alaudidae' taxon_family, 'Galerida' taxon_genus, 'LC' iucn_global, 'No catalogada (especie común)' spain_status, 'No catalogada regionalmente' murcia_status, NULL review_note
    UNION ALL
    SELECT 'Sapo corredor' common_name, 'Epidalea calamita' scientific_name, 'fauna' kingdom, 'Anfibio' family, 'Ramblas y zonas húmedas estacionales' primary_habitat, 'Interés especial' conservation_status, 'Anfibio adaptado a ambientes áridos, ligado a charcas temporales y ramblas tras las lluvias.' description, 'Línea dorsal amarillenta; Carrera en vez de salto; Activo tras lluvias y de noche' identification_tips, 'Otoño e invierno lluviosos' seasonality, NULL image_url, 37.4985 latitude, -1.4602 longitude, 3 rarity_score, FALSE is_featured, 'Región de Murcia Digital (CARM) - Fauna de Cabo Cope y Puntas de Calnegre (citado como Bufo calamita)' source, 'Chordata' taxon_phylum, 'Amphibia' taxon_class, 'Anura' taxon_order, 'Bufonidae' taxon_family, 'Epidalea' taxon_genus, 'LC' iucn_global, 'LESRPE' spain_status, 'Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de Murcia: De interés especial' murcia_status, NULL review_note
    UNION ALL
    SELECT 'Zorro' common_name, 'Vulpes vulpes' scientific_name, 'fauna' kingdom, 'Mamífero' family, 'Matorral termomediterráneo semiárido' primary_habitat, 'Preocupación menor' conservation_status, 'Mamífero generalista y de amplia distribución que recorre todos los ambientes del parque.' description, 'Cola larga con punta blanca; Hábitos crepusculares y nocturnos; Huellas ovaladas de cuatro dedos' identification_tips, 'Todo el año' seasonality, NULL image_url, 37.509 latitude, -1.446 longitude, 1 rarity_score, FALSE is_featured, 'Región de Murcia Digital (CARM) - Fauna de Cabo Cope y Puntas de Calnegre; Wikipedia' source, 'Chordata' taxon_phylum, 'Mammalia' taxon_class, 'Carnivora' taxon_order, 'Canidae' taxon_family, 'Vulpes' taxon_genus, 'LC' iucn_global, 'No catalogada (especie cinegética común)' spain_status, 'No catalogada regionalmente' murcia_status, NULL review_note
    UNION ALL
    SELECT 'Jabalí' common_name, 'Sus scrofa' scientific_name, 'fauna' kingdom, 'Mamífero' family, 'Matorrales arborescentes de Ziziphus' primary_habitat, 'Preocupación menor' conservation_status, 'Mamífero omnívoro presente en los matorrales más densos y zonas de vegetación cerrada del parque.' description, 'Huellas hendidas grandes; Rastros de hozadura en el suelo; Más activo al anochecer' identification_tips, 'Todo el año' seasonality, NULL image_url, 37.511 latitude, -1.4655 longitude, 1 rarity_score, FALSE is_featured, 'Región de Murcia Digital (CARM) - Fauna de Cabo Cope y Puntas de Calnegre; Wikipedia' source, 'Chordata' taxon_phylum, 'Mammalia' taxon_class, 'Artiodactyla' taxon_order, 'Suidae' taxon_family, 'Sus' taxon_genus, 'LC' iucn_global, 'No catalogada (especie cinegética común)' spain_status, 'No catalogada regionalmente' murcia_status, NULL review_note
    UNION ALL
    SELECT 'Sabina negral' common_name, 'Juniperus phoenicea' scientific_name, 'flora' kingdom, 'Arbusto o arbolillo' family, 'Matorral litoral y laderas secas' primary_habitat, 'Interés botánico' conservation_status, 'Conífera mediterránea resistente a viento, sequía y suelos pobres, con poblaciones de interés en Cabo Cope.' description, 'Hojas escamosas; Frutos redondeados; Porte compacto' identification_tips, 'Todo el año' seasonality, 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Juniperus_phoenicea_001.JPG/640px-Juniperus_phoenicea_001.JPG' image_url, 37.5001 latitude, -1.4384 longitude, 4 rarity_score, FALSE is_featured, 'Región de Murcia Digital (CARM) - Flora de Cabo Cope y Puntas de Calnegre; Wikipedia' source, 'Tracheophyta' taxon_phylum, 'Pinopsida' taxon_class, 'Pinales' taxon_order, 'Cupressaceae' taxon_family, 'Juniperus' taxon_genus, 'LC' iucn_global, 'No catalogada en la Lista Roja de la Flora Vascular Española 2008' spain_status, 'No incluida en el Catálogo Regional de Flora Silvestre Protegida; población de Cabo Cope señalada por su interés biogeográfico (aislada del resto de su área)' murcia_status, NULL review_note
    UNION ALL
    SELECT 'Azufaifo' common_name, 'Ziziphus lotus' scientific_name, 'flora' kingdom, 'Arbusto espinoso' family, 'Matorrales arborescentes de Ziziphus' primary_habitat, 'Hábitat prioritario UE / Vulnerable' conservation_status, 'Arbusto espinoso de ambientes cálidos y secos, importante para refugio de fauna y estructura del paisaje.' description, 'Ramas en zigzag; Espinas visibles; Porte almohadillado' identification_tips, 'Primavera a otoño' seasonality, 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Ziziphus_lotus_%28fruit%29.jpg/640px-Ziziphus_lotus_%28fruit%29.jpg' image_url, 37.5099 latitude, -1.4631 longitude, 4 rarity_score, FALSE is_featured, 'Directiva Hábitats 92/43/CEE, hábitat prioritario 5220*; Alcaraz Ariza, F.J. ''La Marina de Cope: ¿los últimos días de un paraíso botánico?'', Eubacteria nº5, Universidad de Murcia; Decreto 50/2003 (BORM), Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia; base científica: Sánchez Gómez et al. 2002, Libro Rojo de la Flora Silvestre Protegida de la Región de Murcia; Documento previo del PORN de Calnegre y Cabo Cope (CARM, 2021) - Catálogo Regional de Flora Silvestre Protegida (confirma categoría Vulnerable)' source, 'Tracheophyta' taxon_phylum, 'Magnoliopsida' taxon_class, 'Rosales' taxon_order, 'Rhamnaceae' taxon_family, 'Ziziphus' taxon_genus, 'NE (no evaluada a nivel global)' iucn_global, 'Incluida en la Lista Roja de la Flora Vascular Española 2008 (categoría exacta pendiente de confirmar en listaroja.conservacionvegetal.org)' spain_status, 'Catálogo Regional de Flora Silvestre Protegida de Murcia (Decreto 50/2003): Vulnerable' murcia_status, NULL review_note
    UNION ALL
    SELECT 'Cornical' common_name, 'Periploca angustifolia' scientific_name, 'flora' kingdom, 'Arbusto iberoafricano' family, 'Matorral termófilo' primary_habitat, 'Vulnerable' conservation_status, 'Arbusto característico de zonas cálidas del sureste ibérico, con gran interés biogeográfico. Forma los ''cornicales'', matorrales dominantes en laderas silicatadas del parque.' description, 'Hojas estrechas; Frutos alargados; Aspecto leñoso y abierto' identification_tips, 'Floración primaveral' seasonality, 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Periploca_angustifolia_kz1.jpg/640px-Periploca_angustifolia_kz1.jpg' image_url, 37.4967 latitude, -1.4528 longitude, 3 rarity_score, FALSE is_featured, 'Región de Murcia Digital (CARM) - Flora de Cabo Cope y Puntas de Calnegre; Alcaraz Ariza, F.J. ''La Marina de Cope: ¿los últimos días de un paraíso botánico?'', Eubacteria nº5, Universidad de Murcia; Decreto 50/2003 (BORM), Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia; base científica: Sánchez Gómez et al. 2002, Libro Rojo de la Flora Silvestre Protegida de la Región de Murcia; Documento previo del PORN de Calnegre y Cabo Cope (CARM, 2021) - Catálogo Regional de Flora Silvestre Protegida (confirma categoría Vulnerable)' source, 'Tracheophyta' taxon_phylum, 'Magnoliopsida' taxon_class, 'Gentianales' taxon_order, 'Apocynaceae' taxon_family, 'Periploca' taxon_genus, 'NE (no evaluada a nivel global)' iucn_global, 'Pendiente de confirmar presencia y categoría en la Lista Roja de la Flora Vascular Española 2008' spain_status, 'Catálogo Regional de Flora Silvestre Protegida de Murcia (Decreto 50/2003): Vulnerable' murcia_status, NULL review_note
    UNION ALL
    SELECT 'Espino negro' common_name, 'Rhamnus lycioides subsp. borgiae' scientific_name, 'flora' kingdom, 'Arbusto espinoso' family, 'Matorral litoral y laderas secas' primary_habitat, 'Interés especial' conservation_status, 'Arbusto espinoso perennifolio típico del matorral mediterráneo costero, importante como refugio de fauna.' description, 'Ramas espinosas entrelazadas; Hojas pequeñas y coriáceas; Frutos globosos oscuros en otoño' identification_tips, 'Todo el año' seasonality, NULL image_url, 37.5008 latitude, -1.4405 longitude, 2 rarity_score, FALSE is_featured, 'Región de Murcia Digital (CARM) - Flora de Cabo Cope y Puntas de Calnegre; Alcaraz Ariza, F.J. ''La Marina de Cope: ¿los últimos días de un paraíso botánico?'', Eubacteria nº5, Universidad de Murcia; Decreto 50/2003 (BORM), Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia; base científica: Sánchez Gómez et al. 2002, Libro Rojo de la Flora Silvestre Protegida de la Región de Murcia; World Flora Online - Rhamnus lycioides (confirma Rhamnus hispanorum como sinónimo)' source, 'Tracheophyta' taxon_phylum, 'Magnoliopsida' taxon_class, 'Rosales' taxon_order, 'Rhamnaceae' taxon_family, 'Rhamnus' taxon_genus, 'NE (no evaluada a nivel global)' iucn_global, 'No confirmada presencia en la Lista Roja de la Flora Vascular Española 2008' spain_status, 'Catálogo Regional de Flora Silvestre Protegida de Murcia (Decreto 50/2003): De interés especial (citada como Rhamnus hispanorum)' murcia_status, NULL review_note
    UNION ALL
    SELECT 'Acebuche' common_name, 'Olea europaea var. sylvestris' scientific_name, 'flora' kingdom, 'Árbol o arbusto' family, 'Matorral litoral y laderas secas' primary_habitat, 'Interés botánico / aprovechamiento regulado' conservation_status, 'Forma silvestre del olivo, presente en los matorrales costeros mejor conservados del parque.' description, 'Hojas pequeñas grisáceas; Porte arbustivo denso y espinoso en ejemplares jóvenes; Frutos pequeños (acebuchinas)' identification_tips, 'Todo el año' seasonality, NULL image_url, 37.4995 latitude, -1.442 longitude, 2 rarity_score, FALSE is_featured, 'Región de Murcia Digital (CARM) - Flora de Cabo Cope y Puntas de Calnegre; Alcaraz Ariza, F.J. ''La Marina de Cope: ¿los últimos días de un paraíso botánico?'', Eubacteria nº5, Universidad de Murcia' source, 'Tracheophyta' taxon_phylum, 'Magnoliopsida' taxon_class, 'Lamiales' taxon_order, 'Oleaceae' taxon_family, 'Olea' taxon_genus, 'LC' iucn_global, 'No catalogada en la Lista Roja de la Flora Vascular Española 2008' spain_status, 'Catálogo Regional de Flora Silvestre Protegida de Murcia (Decreto 50/2003): aprovechamiento sujeto a autorización previa (poblaciones silvestres)' murcia_status, NULL review_note
    UNION ALL
    SELECT 'Margarita de mar' common_name, 'Asteriscus maritimus' scientific_name, 'flora' kingdom, 'Planta litoral' family, 'Playas y dunas fósiles del litoral' primary_habitat, 'Interés botánico' conservation_status, 'Pequeña planta almohadillada de flores amarillas, característica de roquedos y acantilados costeros.' description, 'Flores amarillas tipo margarita; Hojas carnosas grisáceas; Forma cojinetes sobre roca litoral' identification_tips, 'Todo el año, floración prolongada' seasonality, NULL image_url, 37.4865 latitude, -1.4695 longitude, 2 rarity_score, FALSE is_featured, 'Región de Murcia Digital (CARM) - Flora de Cabo Cope y Puntas de Calnegre' source, 'Tracheophyta' taxon_phylum, 'Magnoliopsida' taxon_class, 'Asterales' taxon_order, 'Asteraceae' taxon_family, 'Asteriscus' taxon_genus, 'NE (no evaluada a nivel global)' iucn_global, 'No catalogada en la Lista Roja de la Flora Vascular Española 2008' spain_status, 'No incluida en el Catálogo Regional de Flora Silvestre Protegida' murcia_status, NULL review_note
    UNION ALL
    SELECT 'Albardín' common_name, 'Lygeum spartum' scientific_name, 'flora' kingdom, 'Gramínea' family, 'Saladar y albardinal de la marina de Cope' primary_habitat, 'Interés botánico' conservation_status, 'Gramínea perenne que forma el albardinal, comunidad vegetal característica de los suelos salinos de la marina de Cope.' description, 'Hojas rígidas y punzantes enrolladas; Inflorescencia envuelta en brácteas; Forma matas aisladas en suelo salino' identification_tips, 'Todo el año' seasonality, NULL image_url, 37.472 latitude, -1.483 longitude, 3 rarity_score, FALSE is_featured, 'Región de Murcia Digital (CARM) - Flora de Cabo Cope y Puntas de Calnegre; Alcaraz Ariza, F.J. ''La Marina de Cope: ¿los últimos días de un paraíso botánico?'', Eubacteria nº5, Universidad de Murcia' source, 'Tracheophyta' taxon_phylum, 'Liliopsida' taxon_class, 'Poales' taxon_order, 'Poaceae' taxon_family, 'Lygeum' taxon_genus, 'LC' iucn_global, 'No catalogada en la Lista Roja de la Flora Vascular Española 2008' spain_status, 'No incluida en el Catálogo Regional de Flora Silvestre Protegida' murcia_status, NULL review_note
    UNION ALL
    SELECT 'Cambrón' common_name, 'Lycium intricatum' scientific_name, 'flora' kingdom, 'Arbusto espinoso' family, 'Matorral halófilo de la marina de Cope' primary_habitat, 'Interés especial' conservation_status, 'Arbusto espinoso de suelos salinos y semiáridos, propio de los matorrales costeros de la marina de Cope.' description, 'Ramas muy ramificadas y espinosas; Hojas pequeñas y carnosas; Frutos rojos pequeños' identification_tips, 'Todo el año' seasonality, NULL image_url, 37.4735 latitude, -1.4795 longitude, 3 rarity_score, FALSE is_featured, 'Región de Murcia Digital (CARM) - Flora de Cabo Cope y Puntas de Calnegre; Alcaraz Ariza, F.J. ''La Marina de Cope: ¿los últimos días de un paraíso botánico?'', Eubacteria nº5, Universidad de Murcia; Decreto 50/2003 (BORM), Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia; base científica: Sánchez Gómez et al. 2002, Libro Rojo de la Flora Silvestre Protegida de la Región de Murcia' source, 'Tracheophyta' taxon_phylum, 'Magnoliopsida' taxon_class, 'Solanales' taxon_order, 'Solanaceae' taxon_family, 'Lycium' taxon_genus, 'NE (no evaluada a nivel global)' iucn_global, 'No confirmada presencia en la Lista Roja de la Flora Vascular Española 2008' spain_status, 'Catálogo Regional de Flora Silvestre Protegida de Murcia (Decreto 50/2003): De interés especial' murcia_status, NULL review_note
    UNION ALL
    SELECT 'Chumberillo de lobo' common_name, 'Caralluma europaea' scientific_name, 'flora' kingdom, 'Planta suculenta' family, 'Matorral halonitrófilo costero' primary_habitat, 'Vulnerable / En Peligro (España)' conservation_status, 'Pequeña planta suculenta de aspecto cactiforme, catalogada En Peligro a nivel nacional y Vulnerable en la Región de Murcia.' description, 'Tallos carnosos angulosos sin espinas; Flores pequeñas de olor desagradable; Muy localizada y difícil de encontrar' identification_tips, 'Verano y otoño (floración)' seasonality, NULL image_url, 37.478 latitude, -1.468 longitude, 5 rarity_score, TRUE is_featured, 'Lista Roja de la Flora Vascular Española 2008; Decreto 50/2003 (BORM), Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia; base científica: Sánchez Gómez et al. 2002, Libro Rojo de la Flora Silvestre Protegida de la Región de Murcia; Wikipedia; Documento previo del PORN de Calnegre y Cabo Cope (CARM, 2021) - Catálogo Regional de Flora Silvestre Protegida (confirma categoría Vulnerable)' source, 'Tracheophyta' taxon_phylum, 'Magnoliopsida' taxon_class, 'Gentianales' taxon_order, 'Apocynaceae' taxon_family, 'Caralluma' taxon_genus, 'NE (no evaluada a nivel global; distribución principal fuera de Europa, en el norte de África)' iucn_global, 'Lista Roja de la Flora Vascular Española 2008: EN (En Peligro), criterio B1ab(i,iii,iv,v)c(ii,iii,iv)+2ab(i,iii,iv,v)c(ii,iii,iv)' spain_status, 'Catálogo Regional de Flora Silvestre Protegida de Murcia (Decreto 50/2003): Vulnerable' murcia_status, NULL review_note
    UNION ALL
    SELECT 'Centaurio de Rigual' common_name, 'Centaurium rigualii' scientific_name, 'flora' kingdom, 'Planta herbácea endémica' family, 'Saladar y albardinal de la marina de Cope' primary_habitat, 'Estatus taxonómico dudoso - en revisión' conservation_status, 'Planta herbácea citada como endemismo del sureste ibérico en fuentes de divulgación, aunque su validez taxonómica actual es objeto de debate.' description, 'Porte herbáceo bajo; Flores rosadas en pequeños grupos; Ligada a suelos salinos poco alterados' identification_tips, 'Primavera' seasonality, NULL image_url, 37.4705 latitude, -1.4855 longitude, 5 rarity_score, TRUE is_featured, 'Referencias de divulgación (a contrastar); Wikipedia' source, 'Tracheophyta' taxon_phylum, 'Magnoliopsida' taxon_class, 'Gentianales' taxon_order, 'Gentianaceae' taxon_family, 'Centaurium' taxon_genus, 'NE' iucn_global, 'Excluida del Catálogo Nacional de Especies Amenazadas (CNEA) desde el año 2000 por dudas sobre su validez taxonómica' spain_status, 'Pendiente de confirmar en el Catálogo Regional vigente' murcia_status, 'REVISAR: fuentes recientes indican que Centaurium rigualii fue excluida del Catálogo Nacional de Especies Amenazadas en 2000 por problemas de validez taxonómica (posible sinónimo de otro Centaurium). No se ha podido confirmar su presencia documentada específicamente en Cabo Cope con una fuente primaria fiable dentro de esta sesión. Recomendable verificar con un botánico antes de mantenerla en el catálogo definitivo.' review_note
    UNION ALL
    SELECT 'Ajo de flor oscura' common_name, 'Allium melananthum' scientific_name, 'flora' kingdom, 'Planta bulbosa' family, 'Espartales de la marina de Cope' primary_habitat, 'Vulnerable' conservation_status, 'Ajo silvestre de flores muy oscuras, abundante en los espartales de la Marina de Cope; una de las especies más notables del área por su rareza.' description, 'Flores de color muy oscuro, casi negro; Crece entre espartales (Lygeum/Stipa); Floración llamativa a finales de primavera' identification_tips, 'Primavera' seasonality, NULL image_url, 37.475 latitude, -1.478 longitude, 5 rarity_score, TRUE is_featured, 'Alcaraz Ariza, F.J. ''La Marina de Cope: ¿los últimos días de un paraíso botánico?'', Eubacteria nº5, Universidad de Murcia; Documento previo del PORN de Calnegre y Cabo Cope (CARM, 2021) - Catálogo Regional de Flora Silvestre Protegida (confirma categoría Vulnerable); nombre común alternativo ''ajo de flor negra'' según el PORN' source, 'Tracheophyta' taxon_phylum, 'Liliopsida' taxon_class, 'Asparagales' taxon_order, 'Amaryllidaceae' taxon_family, 'Allium' taxon_genus, 'NE (no evaluada a nivel global)' iucn_global, 'No localizada en la Lista Roja de la Flora Vascular Española 2008 (pendiente de confirmar)' spain_status, 'Catálogo Regional de Flora Silvestre Protegida de Murcia (Decreto 50/2003): Vulnerable' murcia_status, NULL review_note
    UNION ALL
    SELECT 'Anabasis' common_name, 'Anabasis hispanica' scientific_name, 'flora' kingdom, 'Planta suculenta halófila' family, 'Saladar y albardinal de la marina de Cope' primary_habitat, 'Interés especial' conservation_status, 'Pequeña planta suculenta de suelos salinos, propia de los saladares de la Marina de Cope.' description, 'Tallos articulados suculentos; Aspecto de matorral bajo y compacto; Suelos salinos y yesosos' identification_tips, 'Verano-otoño' seasonality, NULL image_url, 37.4715 latitude, -1.484 longitude, 4 rarity_score, FALSE is_featured, 'Alcaraz Ariza, F.J. ''La Marina de Cope: ¿los últimos días de un paraíso botánico?'', Eubacteria nº5, Universidad de Murcia' source, 'Tracheophyta' taxon_phylum, 'Magnoliopsida' taxon_class, 'Caryophyllales' taxon_order, 'Amaranthaceae' taxon_family, 'Anabasis' taxon_genus, 'NE' iucn_global, 'No localizada en la Lista Roja de la Flora Vascular Española 2008' spain_status, 'Catálogo Regional de Flora Silvestre Protegida de Murcia (Decreto 50/2003): De interés especial' murcia_status, 'Especie poco conocida fuera de círculos botánicos especializados; confirmar identificación en campo por su similitud con otras quenopodiáceas suculentas.' review_note
    UNION ALL
    SELECT 'Salsola' common_name, 'Salsola papillosa' scientific_name, 'flora' kingdom, 'Planta halófila' family, 'Saladar y albardinal de la marina de Cope' primary_habitat, 'Vulnerable' conservation_status, 'Quenopodiácea halófila de distribución muy restringida, catalogada Vulnerable en la Región de Murcia; citada como ''patagusanos''.' description, 'Aspecto de matorral bajo grisáceo; Ligada a suelos salinos costeros; Muy localizada' identification_tips, 'Verano-otoño' seasonality, NULL image_url, 37.4698 latitude, -1.486 longitude, 5 rarity_score, TRUE is_featured, 'Alcaraz Ariza, F.J. ''La Marina de Cope: ¿los últimos días de un paraíso botánico?'', Eubacteria nº5, Universidad de Murcia; Decreto 50/2003 (BORM), Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia; base científica: Sánchez Gómez et al. 2002, Libro Rojo de la Flora Silvestre Protegida de la Región de Murcia; Documento previo del PORN de Calnegre y Cabo Cope (CARM, 2021) - Catálogo Regional de Flora Silvestre Protegida (confirma categoría Vulnerable)' source, 'Tracheophyta' taxon_phylum, 'Magnoliopsida' taxon_class, 'Caryophyllales' taxon_order, 'Amaranthaceae' taxon_family, 'Salsola' taxon_genus, 'NE' iucn_global, 'No localizada en la Lista Roja de la Flora Vascular Española 2008 (pendiente de confirmar)' spain_status, 'Catálogo Regional de Flora Silvestre Protegida de Murcia (Decreto 50/2003): Vulnerable' murcia_status, NULL review_note
    UNION ALL
    SELECT 'Espartilla de Persia' common_name, 'Enneapogon persicus' scientific_name, 'flora' kingdom, 'Gramínea' family, 'Litosuelos cálidos del piso termomediterráneo' primary_habitat, 'En peligro de extinción (Murcia) / En Peligro Crítico (España)' conservation_status, 'Gramínea perenne en penacho de litosuelos cálidos, catalogada En Peligro Crítico a nivel nacional por su rareza y distribución marginal en la península.' description, 'Forma matas densas de 10-50 cm; Tallos ligeramente pubescentes; Litosuelos cálidos semiáridos' identification_tips, 'Verano' seasonality, NULL image_url, 37.5135 latitude, -1.4498 longitude, 5 rarity_score, TRUE is_featured, 'Alcaraz Ariza, F.J. ''La Marina de Cope: ¿los últimos días de un paraíso botánico?'', Eubacteria nº5, Universidad de Murcia; Lista Roja de la Flora Vascular Española 2008 (floraprotegida.es); Documento previo del PORN de Calnegre y Cabo Cope (CARM, 2021) - Catálogo Regional de Flora Silvestre Protegida (confirma categoría En peligro de extinción)' source, 'Tracheophyta' taxon_phylum, 'Liliopsida' taxon_class, 'Poales' taxon_order, 'Poaceae' taxon_family, 'Enneapogon' taxon_genus, 'NE (no evaluada a nivel global; especie de amplia distribución en Asia y África, rara en el extremo de su área ibérica)' iucn_global, 'Lista Roja de la Flora Vascular Española 2008: CR (En Peligro Crítico)' spain_status, 'Catálogo Regional de Flora Silvestre Protegida de Murcia: En peligro de extinción' murcia_status, NULL review_note
    UNION ALL
    SELECT 'Lechuguilla lanosa' common_name, 'Launaea lanifera' scientific_name, 'flora' kingdom, 'Planta herbácea' family, 'Matorral árido y bordes de rambla' primary_habitat, 'Interés especial' conservation_status, 'Planta herbácea perenne de aspecto lanoso, propia de ambientes áridos del sureste ibérico.' description, 'Pelosidad blanquecina y lanosa; Hojas en roseta basal; Ambientes áridos y pedregosos' identification_tips, 'Primavera-verano' seasonality, NULL image_url, 37.512 latitude, -1.452 longitude, 4 rarity_score, FALSE is_featured, 'Alcaraz Ariza, F.J. ''La Marina de Cope: ¿los últimos días de un paraíso botánico?'', Eubacteria nº5, Universidad de Murcia' source, 'Tracheophyta' taxon_phylum, 'Magnoliopsida' taxon_class, 'Asterales' taxon_order, 'Asteraceae' taxon_family, 'Launaea' taxon_genus, 'NE' iucn_global, 'No localizada en la Lista Roja de la Flora Vascular Española 2008' spain_status, 'Catálogo Regional de Flora Silvestre Protegida de Murcia (Decreto 50/2003): De interés especial' murcia_status, NULL review_note
    UNION ALL
    SELECT 'Siempreviva insigne' common_name, 'Limonium insigne' scientific_name, 'flora' kingdom, 'Planta litoral' family, 'Saladar y acantilados de la marina de Cope' primary_habitat, 'Interés especial / aprovechamiento regulado' conservation_status, 'Siempreviva litoral que tapiza de color los saladares y zonas afectadas por la brisa marina a finales de primavera.' description, 'Flores lilas-azuladas en panícula; Hojas basales coriáceas; Saladares y roquedos costeros' identification_tips, 'Final de primavera' seasonality, NULL image_url, 37.4895 latitude, -1.4735 longitude, 4 rarity_score, FALSE is_featured, 'Alcaraz Ariza, F.J. ''La Marina de Cope: ¿los últimos días de un paraíso botánico?'', Eubacteria nº5, Universidad de Murcia' source, 'Tracheophyta' taxon_phylum, 'Magnoliopsida' taxon_class, 'Caryophyllales' taxon_order, 'Plumbaginaceae' taxon_family, 'Limonium' taxon_genus, 'NE (no evaluada a nivel global; género con numerosos microendemismos ibéricos)' iucn_global, 'No localizada en la Lista Roja de la Flora Vascular Española 2008 con este nombre (pendiente de confirmar sinonimia)' spain_status, 'Catálogo Regional de Flora Silvestre Protegida de Murcia (Decreto 50/2003): De interés especial; aprovechamiento sujeto a autorización previa' murcia_status, 'El género Limonium tiene una taxonomía muy compleja con numerosos microendemismos; confirmar la identificación exacta de la población de Cabo Cope frente a especies afines (L. lobatum, L. cossonianum).' review_note
    UNION ALL
    SELECT 'Cuerno de cabra' common_name, 'Notoceras bicorne' scientific_name, 'flora' kingdom, 'Planta herbácea' family, 'Matorral árido y claros de vegetación' primary_habitat, 'Interés especial' conservation_status, 'Crucífera muy escasa en el continente europeo, de flores pequeñas y fruto característico curvado.' description, 'Fruto en forma de cuerno curvado; Planta anual de pequeño tamaño; Claros de matorral árido' identification_tips, 'Primavera' seasonality, NULL image_url, 37.5165 latitude, -1.4435 longitude, 4 rarity_score, FALSE is_featured, 'Alcaraz Ariza, F.J. ''La Marina de Cope: ¿los últimos días de un paraíso botánico?'', Eubacteria nº5, Universidad de Murcia' source, 'Tracheophyta' taxon_phylum, 'Magnoliopsida' taxon_class, 'Brassicales' taxon_order, 'Brassicaceae' taxon_family, 'Notoceras' taxon_genus, 'NE' iucn_global, 'No localizada en la Lista Roja de la Flora Vascular Española 2008' spain_status, 'Catálogo Regional de Flora Silvestre Protegida de Murcia (Decreto 50/2003): De interés especial' murcia_status, NULL review_note
    UNION ALL
    SELECT 'Taray' common_name, 'Tamarix africana' scientific_name, 'flora' kingdom, 'Árbol o arbusto' family, 'Saladar junto a la playa del Sombrerico' primary_habitat, 'Interés especial' conservation_status, 'Arbusto o arbolillo que forma los bosquetes de taray de mayor biomasa de la zona, como el rodal junto a la playa del Sombrerico.' description, 'Ramas finas y flexibles; Flores rosadas en espigas; Forma bosquetes junto a saladares' identification_tips, 'Primavera-verano' seasonality, NULL image_url, 37.474 latitude, -1.478 longitude, 3 rarity_score, FALSE is_featured, 'Alcaraz Ariza, F.J. ''La Marina de Cope: ¿los últimos días de un paraíso botánico?'', Eubacteria nº5, Universidad de Murcia' source, 'Tracheophyta' taxon_phylum, 'Magnoliopsida' taxon_class, 'Caryophyllales' taxon_order, 'Tamaricaceae' taxon_family, 'Tamarix' taxon_genus, 'LC' iucn_global, 'No catalogada en la Lista Roja de la Flora Vascular Española 2008' spain_status, 'Catálogo Regional de Flora Silvestre Protegida de Murcia (Decreto 50/2003): De interés especial (citado como Tamarix sp. pl.)' murcia_status, NULL review_note
    UNION ALL
    SELECT 'Teucrio de Freyn' common_name, 'Teucrium freynii' scientific_name, 'flora' kingdom, 'Planta aromática' family, 'Ramblas y cerros carbonatados' primary_habitat, 'Interés especial' conservation_status, 'Labiada de distribución restringida, ligada a ambientes rocosos y de rambla del sureste ibérico.' description, 'Hojas aromáticas de labiada; Porte arbustivo bajo; Ambientes rocosos y ramblas' identification_tips, 'Primavera-verano' seasonality, NULL image_url, 37.4945 latitude, -1.4595 longitude, 4 rarity_score, FALSE is_featured, 'Alcaraz Ariza, F.J. ''La Marina de Cope: ¿los últimos días de un paraíso botánico?'', Eubacteria nº5, Universidad de Murcia' source, 'Tracheophyta' taxon_phylum, 'Magnoliopsida' taxon_class, 'Lamiales' taxon_order, 'Lamiaceae' taxon_family, 'Teucrium' taxon_genus, 'NE' iucn_global, 'No localizada en la Lista Roja de la Flora Vascular Española 2008' spain_status, 'Catálogo Regional de Flora Silvestre Protegida de Murcia (Decreto 50/2003): De interés especial' murcia_status, NULL review_note
    UNION ALL
    SELECT 'Zamarrilla lanuda' common_name, 'Teucrium lanigerum' scientific_name, 'flora' kingdom, 'Planta aromática' family, 'Cerros carbonatados' primary_habitat, 'Interés especial' conservation_status, 'Una de las plantas más vistosas de la zona, de porte lanoso y flores llamativas, más abundante en cerros carbonatados.' description, 'Aspecto lanoso y plateado; Flores vistosas; Más abundante en sustratos carbonatados' identification_tips, 'Primavera' seasonality, NULL image_url, 37.503 latitude, -1.4455 longitude, 4 rarity_score, TRUE is_featured, 'Alcaraz Ariza, F.J. ''La Marina de Cope: ¿los últimos días de un paraíso botánico?'', Eubacteria nº5, Universidad de Murcia' source, 'Tracheophyta' taxon_phylum, 'Magnoliopsida' taxon_class, 'Lamiales' taxon_order, 'Lamiaceae' taxon_family, 'Teucrium' taxon_genus, 'NE' iucn_global, 'No localizada en la Lista Roja de la Flora Vascular Española 2008' spain_status, 'Catálogo Regional de Flora Silvestre Protegida de Murcia (Decreto 50/2003): De interés especial' murcia_status, NULL review_note
    UNION ALL
    SELECT 'Arto' common_name, 'Maytenus senegalensis subsp. europaea' scientific_name, 'flora' kingdom, 'Arbusto espinoso' family, 'Matorral litoral y laderas secas' primary_habitat, 'Vulnerable' conservation_status, 'Arbusto espinoso iberoafricano citado por su nombre común (''arto'') entre los matorrales costeros del parque.' description, 'Ramas espinosas muy ramificadas; Hojas pequeñas coriáceas; Matorral costero denso' identification_tips, 'Todo el año' seasonality, NULL image_url, 37.501 latitude, -1.4368 longitude, 3 rarity_score, FALSE is_featured, 'Región de Murcia Digital (CARM) - Flora de Cabo Cope y Puntas de Calnegre (mención por nombre común ''arto''); El Medio Natural en Cartagena (urbanismo.cartagena.es), ficha ''Arto - Maytenus senegalensis subsp. europaea''; Documento previo del PORN de Calnegre y Cabo Cope (CARM, 2021) - Catálogo Regional de Flora Silvestre Protegida (confirma categoría Vulnerable)' source, 'Tracheophyta' taxon_phylum, 'Magnoliopsida' taxon_class, 'Celastrales' taxon_order, 'Celastraceae' taxon_family, 'Maytenus' taxon_genus, 'NE' iucn_global, 'Presente en el listado nacional de la Lista Roja de la Flora Vascular Española 2008 (categoría exacta pendiente de confirmar)' spain_status, 'Catálogo Regional de Flora Silvestre Protegida de Murcia (Decreto 50/2003): Vulnerable' murcia_status, NULL review_note
    UNION ALL
    SELECT 'Rabogato' common_name, 'Sideritis ibanyezii' scientific_name, 'flora' kingdom, 'Planta aromática' family, 'Cerros carbonatados' primary_habitat, 'Aprovechamiento regulado' conservation_status, 'Labiada aromática más abundante sobre sustratos carbonatados, citada por su nombre común ''rabogato''.' description, 'Aspecto de matorral aromático bajo; Más abundante en sustrato carbonatado; Flores amarillentas en espiga' identification_tips, 'Primavera-verano' seasonality, NULL image_url, 37.5045 latitude, -1.4475 longitude, 3 rarity_score, FALSE is_featured, 'Alcaraz Ariza, F.J. ''La Marina de Cope: ¿los últimos días de un paraíso botánico?'', Eubacteria nº5, Universidad de Murcia' source, 'Tracheophyta' taxon_phylum, 'Magnoliopsida' taxon_class, 'Lamiales' taxon_order, 'Lamiaceae' taxon_family, 'Sideritis' taxon_genus, 'NE' iucn_global, 'No localizada en la Lista Roja de la Flora Vascular Española 2008 con este nombre' spain_status, 'Catálogo Regional de Flora Silvestre Protegida de Murcia (Decreto 50/2003): aprovechamiento sujeto a autorización previa' murcia_status, NULL review_note
    UNION ALL
    SELECT 'Lentisco' common_name, 'Pistacia lentiscus' scientific_name, 'flora' kingdom, 'Arbusto' family, 'Matorral mediterráneo litoral' primary_habitat, 'Aprovechamiento regulado' conservation_status, 'Arbusto perennifolio muy común del matorral mediterráneo, con frutos apreciados por la fauna.' description, 'Hojas compuestas paripinnadas; Frutos en racimo rojos a negros; Resinoso y aromático al frotar' identification_tips, 'Todo el año' seasonality, NULL image_url, 37.5062 latitude, -1.4512 longitude, 1 rarity_score, FALSE is_featured, 'Alcaraz Ariza, F.J. ''La Marina de Cope: ¿los últimos días de un paraíso botánico?'', Eubacteria nº5, Universidad de Murcia' source, 'Tracheophyta' taxon_phylum, 'Magnoliopsida' taxon_class, 'Sapindales' taxon_order, 'Anacardiaceae' taxon_family, 'Pistacia' taxon_genus, 'LC' iucn_global, 'No catalogada (especie común mediterránea)' spain_status, 'Catálogo Regional de Flora Silvestre Protegida de Murcia (Decreto 50/2003): aprovechamiento sujeto a autorización previa' murcia_status, NULL review_note
    UNION ALL
    SELECT 'Pino carrasco' common_name, 'Pinus halepensis' scientific_name, 'flora' kingdom, 'Árbol' family, 'Laderas y cerros del interior del parque' primary_habitat, 'Aprovechamiento regulado' conservation_status, 'Conífera mediterránea de amplia distribución, presente en laderas y zonas de repoblación del interior del parque.' description, 'Copa irregular y abierta; Piñas asimétricas persistentes; Corteza rojiza agrietada' identification_tips, 'Todo el año' seasonality, NULL image_url, 37.5083 latitude, -1.4398 longitude, 1 rarity_score, FALSE is_featured, 'Alcaraz Ariza, F.J. ''La Marina de Cope: ¿los últimos días de un paraíso botánico?'', Eubacteria nº5, Universidad de Murcia' source, 'Tracheophyta' taxon_phylum, 'Pinopsida' taxon_class, 'Pinales' taxon_order, 'Pinaceae' taxon_family, 'Pinus' taxon_genus, 'LC' iucn_global, 'No catalogada (especie forestal común)' spain_status, 'Catálogo Regional de Flora Silvestre Protegida de Murcia (Decreto 50/2003): aprovechamiento sujeto a autorización previa' murcia_status, NULL review_note
    UNION ALL
    SELECT 'Tomillo de invierno' common_name, 'Thymus hyemalis' scientific_name, 'flora' kingdom, 'Planta aromática' family, 'Tomillares sobre sustrato carbonatado' primary_habitat, 'Aprovechamiento regulado' conservation_status, 'Tomillo endémico del sureste ibérico, característico de los tomillares sobre sustratos carbonatados del parque.' description, 'Matas bajas y aromáticas; Hojas pequeñas y estrechas; Sustratos carbonatados' identification_tips, 'Todo el año, floración primaveral' seasonality, NULL image_url, 37.5108 latitude, -1.4525 longitude, 2 rarity_score, FALSE is_featured, 'Alcaraz Ariza, F.J. ''La Marina de Cope: ¿los últimos días de un paraíso botánico?'', Eubacteria nº5, Universidad de Murcia' source, 'Tracheophyta' taxon_phylum, 'Magnoliopsida' taxon_class, 'Lamiales' taxon_order, 'Lamiaceae' taxon_family, 'Thymus' taxon_genus, 'NE' iucn_global, 'Una subespecie afín (Thymus hyemalis subsp. millefloris) figura en la Lista Roja de la Flora Vascular Española 2008; confirmar si aplica a la población del parque' spain_status, 'Catálogo Regional de Flora Silvestre Protegida de Murcia (Decreto 50/2003): aprovechamiento sujeto a autorización previa' murcia_status, 'Existe una subespecie (millefloris) con presencia confirmada en la Lista Roja nacional; verificar a qué subespecie/población corresponden los ejemplares de Cabo Cope.' review_note
    UNION ALL
    SELECT 'Alcaparra' common_name, 'Capparis sicula subsp. sicula' scientific_name, 'flora' kingdom, 'Arbusto' family, 'Roquedos y muros del matorral litoral' primary_habitat, 'Aprovechamiento regulado' conservation_status, 'Arbusto trepador o rastrero de roquedos, conocido por sus botones florales comestibles (alcaparras).' description, 'Hojas redondeadas y carnosas; Flores blancas vistosas de corta duración; Roquedos y taludes soleados' identification_tips, 'Verano' seasonality, NULL image_url, 37.4978 latitude, -1.446 longitude, 2 rarity_score, FALSE is_featured, 'Alcaraz Ariza, F.J. ''La Marina de Cope: ¿los últimos días de un paraíso botánico?'', Eubacteria nº5, Universidad de Murcia' source, 'Tracheophyta' taxon_phylum, 'Magnoliopsida' taxon_class, 'Brassicales' taxon_order, 'Capparaceae' taxon_family, 'Capparis' taxon_genus, 'NE' iucn_global, 'No catalogada en la Lista Roja de la Flora Vascular Española 2008' spain_status, 'Catálogo Regional de Flora Silvestre Protegida de Murcia (Decreto 50/2003): aprovechamiento sujeto a autorización previa' murcia_status, NULL review_note
    UNION ALL
    SELECT 'Azucena de mar' common_name, 'Pancratium maritimum' scientific_name, 'flora' kingdom, 'Planta bulbosa litoral' family, 'Dunas y playas del litoral' primary_habitat, 'Aprovechamiento regulado' conservation_status, 'Bulbosa litoral de grandes flores blancas y aromáticas, propia de playas y dunas bien conservadas.' description, 'Flores blancas grandes y aromáticas; Hojas glaucas en roseta; Dunas y arenales costeros' identification_tips, 'Verano' seasonality, NULL image_url, 37.541 latitude, -1.4005 longitude, 3 rarity_score, TRUE is_featured, 'Alcaraz Ariza, F.J. ''La Marina de Cope: ¿los últimos días de un paraíso botánico?'', Eubacteria nº5, Universidad de Murcia' source, 'Tracheophyta' taxon_phylum, 'Liliopsida' taxon_class, 'Asparagales' taxon_order, 'Amaryllidaceae' taxon_family, 'Pancratium' taxon_genus, 'LC' iucn_global, 'No catalogada en la Lista Roja de la Flora Vascular Española 2008 (especie común pero sensible a la degradación de playas)' spain_status, 'Catálogo Regional de Flora Silvestre Protegida de Murcia (Decreto 50/2003): aprovechamiento sujeto a autorización previa' murcia_status, NULL review_note
    UNION ALL
    SELECT 'Coloquíntida' common_name, 'Citrullus colocynthis' scientific_name, 'flora' kingdom, 'Planta rastrera' family, 'Ramblas y zonas incultas' primary_habitat, 'No catalogada, citada por su rareza' conservation_status, 'Cucurbitácea rastrera de frutos parecidos a pequeños melones, citada por su rareza en ramblas y zonas incultas de la Marina de Cope.' description, 'Frutos redondos tipo melón pequeño; Planta rastrera en ramblas; Zonas incultas y bordes de cultivo' identification_tips, 'Verano-otoño' seasonality, NULL image_url, 37.4925 latitude, -1.457 longitude, 4 rarity_score, FALSE is_featured, 'Alcaraz Ariza, F.J. ''La Marina de Cope: ¿los últimos días de un paraíso botánico?'', Eubacteria nº5, Universidad de Murcia' source, 'Tracheophyta' taxon_phylum, 'Magnoliopsida' taxon_class, 'Cucurbitales' taxon_order, 'Cucurbitaceae' taxon_family, 'Citrullus' taxon_genus, 'NE' iucn_global, 'No catalogada en la Lista Roja de la Flora Vascular Española 2008' spain_status, 'No incluida en el Catálogo Regional de Flora Silvestre Protegida' murcia_status, 'No figura en ninguna de las tres categorías del Catálogo Regional (Decreto 50/2003); se incluye únicamente por citarse expresamente como notable/rara en la fuente de la Marina de Cope.' review_note
) s
WHERE p.slug = 'cabo-cope-puntas-calnegre'
ON DUPLICATE KEY UPDATE common_name = VALUES(common_name), family = VALUES(family), primary_habitat = VALUES(primary_habitat),
    conservation_status = VALUES(conservation_status), description = VALUES(description), identification_tips = VALUES(identification_tips),
    seasonality = VALUES(seasonality), image_url = VALUES(image_url), latitude = VALUES(latitude), longitude = VALUES(longitude),
    rarity_score = VALUES(rarity_score), is_featured = VALUES(is_featured), source = VALUES(source),
    taxon_phylum = VALUES(taxon_phylum), taxon_class = VALUES(taxon_class), taxon_order = VALUES(taxon_order),
    taxon_family = VALUES(taxon_family), taxon_genus = VALUES(taxon_genus), iucn_global = VALUES(iucn_global),
    spain_status = VALUES(spain_status), murcia_status = VALUES(murcia_status), review_note = VALUES(review_note);

-- Clasificación de cada especie dentro de sus hábitats (relación muchos-a-muchos).
-- Una especie puede aparecer en más de un hábitat (p. ej. Testudo graeca en el matorral
-- semiárido y en el azufaifar). Se enlaza por nombre científico + slug de hábitat.
INSERT IGNORE INTO species_habitats (species_id, habitat_id)
SELECT sp.id, h.id
FROM (
    SELECT 'Testudo graeca' scientific_name, 'matorral-semiarido' habitat_slug
UNION ALL
    SELECT 'Testudo graeca' scientific_name, 'azufaifar' habitat_slug
UNION ALL
    SELECT 'Aquila fasciata' scientific_name, 'acantilados' habitat_slug
UNION ALL
    SELECT 'Aquila fasciata' scientific_name, 'matorral-semiarido' habitat_slug
UNION ALL
    SELECT 'Bucanetes githagineus' scientific_name, 'matorral-semiarido' habitat_slug
UNION ALL
    SELECT 'Bucanetes githagineus' scientific_name, 'azufaifar' habitat_slug
UNION ALL
    SELECT 'Gulosus aristotelis' scientific_name, 'acantilados' habitat_slug
UNION ALL
    SELECT 'Timon lepidus' scientific_name, 'matorral-semiarido' habitat_slug
UNION ALL
    SELECT 'Chalcides bedriagai' scientific_name, 'matorral-semiarido' habitat_slug
UNION ALL
    SELECT 'Bubo bubo' scientific_name, 'acantilados' habitat_slug
UNION ALL
    SELECT 'Falco peregrinus' scientific_name, 'acantilados' habitat_slug
UNION ALL
    SELECT 'Burhinus oedicnemus' scientific_name, 'matorral-semiarido' habitat_slug
UNION ALL
    SELECT 'Curruca melanocephala' scientific_name, 'matorral-semiarido' habitat_slug
UNION ALL
    SELECT 'Galerida cristata' scientific_name, 'matorral-semiarido' habitat_slug
UNION ALL
    SELECT 'Epidalea calamita' scientific_name, 'galeria-ribera' habitat_slug
UNION ALL
    SELECT 'Vulpes vulpes' scientific_name, 'matorral-semiarido' habitat_slug
UNION ALL
    SELECT 'Sus scrofa' scientific_name, 'azufaifar' habitat_slug
UNION ALL
    SELECT 'Juniperus phoenicea' scientific_name, 'matorral-semiarido' habitat_slug
UNION ALL
    SELECT 'Juniperus phoenicea' scientific_name, 'acantilados' habitat_slug
UNION ALL
    SELECT 'Ziziphus lotus' scientific_name, 'azufaifar' habitat_slug
UNION ALL
    SELECT 'Periploca angustifolia' scientific_name, 'matorral-semiarido' habitat_slug
UNION ALL
    SELECT 'Rhamnus lycioides subsp. borgiae' scientific_name, 'matorral-semiarido' habitat_slug
UNION ALL
    SELECT 'Olea europaea var. sylvestris' scientific_name, 'matorral-semiarido' habitat_slug
UNION ALL
    SELECT 'Asteriscus maritimus' scientific_name, 'matorral-halonitrofilo' habitat_slug
UNION ALL
    SELECT 'Lygeum spartum' scientific_name, 'matorral-halofilo' habitat_slug
UNION ALL
    SELECT 'Lycium intricatum' scientific_name, 'matorral-halofilo' habitat_slug
UNION ALL
    SELECT 'Caralluma europaea' scientific_name, 'matorral-halonitrofilo' habitat_slug
UNION ALL
    SELECT 'Centaurium rigualii' scientific_name, 'matorral-halofilo' habitat_slug
UNION ALL
    SELECT 'Allium melananthum' scientific_name, 'matorral-semiarido' habitat_slug
UNION ALL
    SELECT 'Anabasis hispanica' scientific_name, 'matorral-halofilo' habitat_slug
UNION ALL
    SELECT 'Salsola papillosa' scientific_name, 'matorral-halofilo' habitat_slug
UNION ALL
    SELECT 'Enneapogon persicus' scientific_name, 'matorral-semiarido' habitat_slug
UNION ALL
    SELECT 'Launaea lanifera' scientific_name, 'matorral-semiarido' habitat_slug
UNION ALL
    SELECT 'Limonium insigne' scientific_name, 'matorral-semiarido' habitat_slug
UNION ALL
    SELECT 'Notoceras bicorne' scientific_name, 'matorral-semiarido' habitat_slug
UNION ALL
    SELECT 'Tamarix africana' scientific_name, 'matorral-halofilo' habitat_slug
UNION ALL
    SELECT 'Teucrium freynii' scientific_name, 'galeria-ribera' habitat_slug
UNION ALL
    SELECT 'Teucrium lanigerum' scientific_name, 'matorral-halofilo' habitat_slug
UNION ALL
    SELECT 'Maytenus senegalensis subsp. europaea' scientific_name, 'matorral-semiarido' habitat_slug
UNION ALL
    SELECT 'Sideritis ibanyezii' scientific_name, 'matorral-semiarido' habitat_slug
UNION ALL
    SELECT 'Pistacia lentiscus' scientific_name, 'matorral-semiarido' habitat_slug
UNION ALL
    SELECT 'Pinus halepensis' scientific_name, 'matorral-semiarido' habitat_slug
UNION ALL
    SELECT 'Thymus hyemalis' scientific_name, 'matorral-semiarido' habitat_slug
UNION ALL
    SELECT 'Capparis sicula subsp. sicula' scientific_name, 'matorral-semiarido' habitat_slug
UNION ALL
    SELECT 'Pancratium maritimum' scientific_name, 'matorral-halonitrofilo' habitat_slug
UNION ALL
    SELECT 'Citrullus colocynthis' scientific_name, 'galeria-ribera' habitat_slug
) rel
JOIN species sp ON sp.scientific_name = rel.scientific_name
JOIN habitats h ON h.slug = rel.habitat_slug
JOIN parks p ON p.id = sp.park_id AND p.id = h.park_id
WHERE p.slug = 'cabo-cope-puntas-calnegre';

-- Auditoría de coherencia especie-hábitat: se comparó el texto libre "habitat" y las
-- coordenadas de cada especie contra el hábitat estructurado asignado. Se corrigen 4 casos
-- donde ambos discrepaban del hábitat original:
--  - Allium melananthum: sus coordenadas caen dentro de "matorral-halofilo" y su descripción
--    cita el albardín (Lygeum), especie indicadora de ese hábitat; se añade sin quitar el
--    matorral semiárido original (también cita Stipa).
--  - Limonium insigne: su propio texto dice "Saladar y acantilados de la marina de Cope" y
--    sus coordenadas caen junto al centro de "acantilados"; estaba asignada solo a
--    "matorral-semiarido", que no aparece mencionado en ningún lugar de su ficha.
--  - Teucrium lanigerum: su texto ("Cerros carbonatados", sin mención de suelo salino) y sus
--    coordenadas encajan con "matorral-semiarido" (igual que Sideritis ibanyezii, mismo
--    hábitat textual); estaba asignada por error a "matorral-halofilo".
--  - Asteriscus maritimus: su descripción cita explícitamente "roquedos y acantilados
--    costeros" y sus coordenadas están a apenas ~150 m del centro de "acantilados"; se añade
--    ese hábitat manteniendo el "matorral-halonitrofilo" original.
DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats h ON h.id = sh.habitat_id
JOIN parks p ON p.id = sp.park_id
WHERE p.slug = 'cabo-cope-puntas-calnegre'
  AND sp.scientific_name = 'Teucrium lanigerum'
  AND h.slug = 'matorral-halofilo';

INSERT IGNORE INTO species_habitats (species_id, habitat_id)
SELECT sp.id, h.id
FROM (
    SELECT 'Allium melananthum' scientific_name, 'matorral-halofilo' habitat_slug
    UNION ALL
    SELECT 'Limonium insigne' scientific_name, 'acantilados' habitat_slug
    UNION ALL
    SELECT 'Teucrium lanigerum' scientific_name, 'matorral-semiarido' habitat_slug
    UNION ALL
    SELECT 'Asteriscus maritimus' scientific_name, 'acantilados' habitat_slug
) rel
JOIN species sp ON sp.scientific_name = rel.scientific_name
JOIN habitats h ON h.slug = rel.habitat_slug
JOIN parks p ON p.id = sp.park_id AND p.id = h.park_id
WHERE p.slug = 'cabo-cope-puntas-calnegre';

-- Reconstrucción del catálogo de hábitats a partir de fuentes oficiales de Red Natura 2000
-- (Standard Data Form / Plan de Gestión del LIC ES6200031 Cabo Cope y Anexo I del proyecto de
-- PORN del Parque Regional Calnegre y Cabo Cope, asociacionanse.org): se pasa de 9 a los 21
-- hábitats de interés comunitario oficialmente documentados para el parque (18 terrestres + 3
-- marinos). Los 11 hábitats nuevos que no corresponden a especies ya existentes en el catálogo
-- se añaden sin especies asociadas todavía (quedan para la ronda de ampliación de especies).
-- Se corrige, en cambio, la única reclasificación inequívoca de una especie ya existente:
-- Teucrium freynii (teucrio de Freyn) es la especie característica de la asociación oficial
-- "Cosentinio bivalentis-Teucrietum freynii", propia del hábitat 8210 (pendientes rocosas
-- calcícolas con vegetación casmofítica), y no del 92D0 (galerías ribereñas) donde estaba
-- asignada por una estimación previa sin base documental oficial.
DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats h ON h.id = sh.habitat_id
JOIN parks p ON p.id = sp.park_id
WHERE p.slug = 'cabo-cope-puntas-calnegre'
  AND sp.scientific_name = 'Teucrium freynii'
  AND h.slug = 'galeria-ribera';

INSERT IGNORE INTO species_habitats (species_id, habitat_id)
SELECT sp.id, h.id
FROM species sp
JOIN habitats h ON h.slug = 'roquedos-casmofiticos' AND h.park_id = sp.park_id
JOIN parks p ON p.id = sp.park_id
WHERE p.slug = 'cabo-cope-puntas-calnegre'
  AND sp.scientific_name = 'Teucrium freynii';

-- Reorganizacion especie-habitat sobre el catalogo oficial de 21 habitats, con evidencia
-- textual concreta de las asociaciones fitosociologicas del Plan de Gestion del LIC Cabo Cope
-- y del Anexo I del PORN (misma fuente que el resto de esta reconstruccion):
--  - Juniperus phoenicea, Rhamnus lycioides subsp. borgiae y Pinus halepensis son citados en
--    la asociacion 856121 Chamaeropo humilis-Juniperetum phoeniceae (habitat 5210, sabinar):
--    se anaden a "sabinar-juniperus" sin quitar sus habitats previos.
--  - Periploca angustifolia y Pistacia lentiscus aparecen en la asociacion 422011
--    Mayteno-Periplocetum angustifoliae (habitat 5220): se anaden a "azufaifar".
--  - Lygeum spartum y Limonium insigne son las especies dominantes de la asociacion 151047
--    Limonio insignis-Lygeetum sparti (habitat 1510, nuevo): se anaden a "estepas-salinas-albardinal".
--  - Limonium insigne, Anabasis hispanica y Salsola papillosa aparecen juntas en la asociacion
--    433413 Limonio insignis-Anabasietum hispanicae (habitat 5330): se anaden a "matorral-semiarido".
--  - Lycium intricatum es la especie dominante de la asociacion 143016 Whitanio
--    frutescentis-Lycietum intricati (habitat 1430, no 1420 como estaba); esa misma asociacion
--    cita como acompanantes a Lygeum spartum y Asteriscus maritimus (este ya estaba en 1430).
--    Se corrige Lycium intricatum de "matorral-halofilo" a "matorral-halonitrofilo" y se anade
--    Lygeum spartum a "matorral-halonitrofilo".
--  - Tamarix africana se anade a "galeria-ribera" (92D0 = Nerio-Tamaricetea, definida por Tamarix).
--  - Pancratium maritimum se traslada de "matorral-halonitrofilo" a "dunas-embrionarias" (2110):
--    es una inferencia ecologica mia (especie tipica de dunas costeras), no una cita textual
--    directa de las fuentes oficiales consultadas; ver review_note en el registro de la especie.
DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats h ON h.id = sh.habitat_id
JOIN parks p ON p.id = sp.park_id
WHERE p.slug = 'cabo-cope-puntas-calnegre'
  AND (
    (sp.scientific_name = 'Lycium intricatum' AND h.slug = 'matorral-halofilo')
    OR (sp.scientific_name = 'Pancratium maritimum' AND h.slug = 'matorral-halonitrofilo')
  );

INSERT IGNORE INTO species_habitats (species_id, habitat_id)
SELECT sp.id, h.id
FROM (
    SELECT 'Juniperus phoenicea' scientific_name, 'sabinar-juniperus' habitat_slug
    UNION ALL
    SELECT 'Rhamnus lycioides subsp. borgiae' scientific_name, 'sabinar-juniperus' habitat_slug
    UNION ALL
    SELECT 'Pinus halepensis' scientific_name, 'sabinar-juniperus' habitat_slug
    UNION ALL
    SELECT 'Periploca angustifolia' scientific_name, 'azufaifar' habitat_slug
    UNION ALL
    SELECT 'Pistacia lentiscus' scientific_name, 'azufaifar' habitat_slug
    UNION ALL
    SELECT 'Lygeum spartum' scientific_name, 'estepas-salinas-albardinal' habitat_slug
    UNION ALL
    SELECT 'Limonium insigne' scientific_name, 'estepas-salinas-albardinal' habitat_slug
    UNION ALL
    SELECT 'Limonium insigne' scientific_name, 'matorral-semiarido' habitat_slug
    UNION ALL
    SELECT 'Anabasis hispanica' scientific_name, 'matorral-semiarido' habitat_slug
    UNION ALL
    SELECT 'Salsola papillosa' scientific_name, 'matorral-semiarido' habitat_slug
    UNION ALL
    SELECT 'Lycium intricatum' scientific_name, 'matorral-halonitrofilo' habitat_slug
    UNION ALL
    SELECT 'Lygeum spartum' scientific_name, 'matorral-halonitrofilo' habitat_slug
    UNION ALL
    SELECT 'Tamarix africana' scientific_name, 'galeria-ribera' habitat_slug
    UNION ALL
    SELECT 'Pancratium maritimum' scientific_name, 'dunas-embrionarias' habitat_slug
) rel
JOIN species sp ON sp.scientific_name = rel.scientific_name
JOIN habitats h ON h.slug = rel.habitat_slug
JOIN parks p ON p.id = sp.park_id AND p.id = h.park_id
WHERE p.slug = 'cabo-cope-puntas-calnegre';

UPDATE species sp
JOIN parks p ON p.id = sp.park_id AND p.slug = 'cabo-cope-puntas-calnegre'
SET sp.review_note = 'Reclasificada al hábitat oficial 2110 (dunas móviles embrionarias) por ser una especie característica de dunas costeras; esta asignación es una inferencia ecológica mía, ya que ni el Plan de Gestión del LIC Cabo Cope ni el Anexo I del PORN citan expresamente Pancratium maritimum entre las especies indicadoras de esa asociación (que mencionan Elymus farctus y Sporobolus pungens). Confirmar si procede.'
WHERE sp.scientific_name = 'Pancratium maritimum';

-- Especies añadidas a partir del Documento previo del PORN de Calnegre y Cabo Cope (CARM, 2021):
-- 3 de flora del Catálogo Regional de Flora Silvestre Protegida que faltaban en el catálogo semilla
-- (Centaurea saxicola, Lafuentea rotundifolia, Senecio flavus) y 19 de fauna citadas expresamente en
-- el documento y ausentes hasta ahora (carnívoros, aves de matorral, limícolas y reptiles). Ziziphus
-- lotus (Azufaifo) ya existía en el catálogo semilla; solo se amplió su fuente, no se duplicó. Ver
-- README para el detalle de fuente y notas de revisión de cada una.
INSERT INTO species (park_id, common_name, scientific_name, kingdom, family, primary_habitat, conservation_status,
    description, identification_tips, seasonality, image_url, latitude, longitude, rarity_score, is_featured, source,
    taxon_phylum, taxon_class, taxon_order, taxon_family, taxon_genus, iucn_global, spain_status, murcia_status, review_note)
SELECT p.id, s.common_name, s.scientific_name, s.kingdom, s.family, s.primary_habitat, s.conservation_status,
    s.description, s.identification_tips, s.seasonality, s.image_url, s.latitude, s.longitude, s.rarity_score, s.is_featured, s.source,
    s.taxon_phylum, s.taxon_class, s.taxon_order, s.taxon_family, s.taxon_genus, s.iucn_global, s.spain_status, s.murcia_status, s.review_note
FROM parks p
JOIN (
    SELECT 'Cardo amarillo de roca' common_name, 'Centaurea saxicola' scientific_name, 'flora' kingdom, 'Hierba de roquedo' family, 'Roquedos y fisuras calcáreas costeras' primary_habitat, 'Vulnerable' conservation_status, 'Herbácea rupícola de fisuras de roquedos calcáreos costeros, integrante junto a Lafuentea rotundifolia de la asociación Lafuenteo rotundifoliae-Centaureetum saxicolae (721134), propia del hábitat de interés comunitario 8210.' description, 'Vive en grietas de roquedos calcáreos; Capítulos florales amarillos; Comparte hábitat con Lafuentea rotundifolia' identification_tips, 'Floración primaveral' seasonality, NULL image_url, 37.4955 latitude, -1.4585 longitude, 4 rarity_score, FALSE is_featured, 'Documento previo del PORN de Calnegre y Cabo Cope (CARM, Consejería de Agua, Agricultura, Ganadería, Pesca y Medio Ambiente, 2021) - Catálogo Regional de Flora Silvestre Protegida' source, 'Tracheophyta' taxon_phylum, 'Magnoliopsida' taxon_class, 'Asterales' taxon_order, 'Asteraceae' taxon_family, 'Centaurea' taxon_genus, 'NE' iucn_global, 'Pendiente de contrastar con la Lista Roja de la Flora Vascular Española 2008' spain_status, 'Catálogo Regional de Flora Silvestre Protegida de Murcia (Decreto 50/2003): Vulnerable' murcia_status, 'Especie añadida a partir del PORN; falta contrastar su distribución exacta dentro del parque y su presencia en la Lista Roja de la Flora Vascular Española 2008.' review_note
    UNION ALL
    SELECT 'Orejilla de roca' common_name, 'Lafuentea rotundifolia' scientific_name, 'flora' kingdom, 'Hierba de roquedo' family, 'Roquedos y fisuras calcáreas costeras' primary_habitat, 'Vulnerable' conservation_status, 'Herbácea rupícola endémica del sureste ibérico, integrante junto a Centaurea saxicola de la asociación Lafuenteo rotundifoliae-Centaureetum saxicolae (721134), propia del hábitat de interés comunitario 8210.' description, 'Vive en fisuras de roquedos calcáreos; Hojas redondeadas; Comparte hábitat con Centaurea saxicola' identification_tips, 'Floración primaveral' seasonality, NULL image_url, 37.494 latitude, -1.461 longitude, 4 rarity_score, FALSE is_featured, 'Documento previo del PORN de Calnegre y Cabo Cope (CARM, Consejería de Agua, Agricultura, Ganadería, Pesca y Medio Ambiente, 2021) - Catálogo Regional de Flora Silvestre Protegida' source, 'Tracheophyta' taxon_phylum, 'Magnoliopsida' taxon_class, 'Lamiales' taxon_order, 'Plantaginaceae' taxon_family, 'Lafuentea' taxon_genus, 'NE' iucn_global, 'Pendiente de contrastar con la Lista Roja de la Flora Vascular Española 2008' spain_status, 'Catálogo Regional de Flora Silvestre Protegida de Murcia (Decreto 50/2003): Vulnerable' murcia_status, 'Especie añadida a partir del PORN; falta contrastar su distribución exacta dentro del parque y su presencia en la Lista Roja de la Flora Vascular Española 2008.' review_note
    UNION ALL
    SELECT 'Senecio flavus' common_name, 'Senecio flavus' scientific_name, 'flora' kingdom, 'Hierba' family, 'Sin asociación de hábitat especificada en el PORN' primary_habitat, 'Vulnerable' conservation_status, 'Especie protegida citada en el Catálogo Regional de Flora Silvestre Protegida para Calnegre y Cabo Cope; el PORN no documenta un nombre común ni una asociación de hábitat concreta dentro del parque.' description, 'Sin datos de campo documentados en el PORN' identification_tips, 'Sin datos' seasonality, NULL image_url, 37.501 latitude, -1.445 longitude, 4 rarity_score, FALSE is_featured, 'Documento previo del PORN de Calnegre y Cabo Cope (CARM, Consejería de Agua, Agricultura, Ganadería, Pesca y Medio Ambiente, 2021) - Catálogo Regional de Flora Silvestre Protegida' source, 'Tracheophyta' taxon_phylum, 'Magnoliopsida' taxon_class, 'Asterales' taxon_order, 'Asteraceae' taxon_family, 'Senecio' taxon_genus, 'NE' iucn_global, 'Pendiente de contrastar con la Lista Roja de la Flora Vascular Española 2008' spain_status, 'Catálogo Regional de Flora Silvestre Protegida de Murcia (Decreto 50/2003): Vulnerable' murcia_status, 'Sin hábitat, ubicación ni nombre común documentados en el PORN; falta confirmar en campo su localización exacta dentro del parque.' review_note
    UNION ALL
    SELECT 'Gato montés' common_name, 'Felis silvestris' scientific_name, 'fauna' kingdom, 'Mamífero carnívoro' family, 'Matorral y roquedos de las sierras costeras' primary_habitat, 'Interés especial' conservation_status, 'Carnívoro de hábitos nocturnos y esquivos, presente en las zonas montañosas de Calnegre y Cabo Cope junto a otros pequeños carnívoros ibéricos.' description, 'Hábitos nocturnos y esquivos; Muy difícil de observar directamente; Mejor rastreable por huellas o excrementos' identification_tips, 'Todo el año' seasonality, NULL image_url, 37.512 latitude, -1.455 longitude, 4 rarity_score, FALSE is_featured, 'Documento previo del PORN de Calnegre y Cabo Cope (CARM, Consejería de Agua, Agricultura, Ganadería, Pesca y Medio Ambiente, 2021)' source, 'Chordata' taxon_phylum, 'Mammalia' taxon_class, 'Carnivora' taxon_order, 'Felidae' taxon_family, 'Felis' taxon_genus, 'LC' iucn_global, 'LESRPE (Listado de Especies Silvestres en Régimen de Protección Especial)' spain_status, 'Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de Murcia: De interés especial' murcia_status, 'El PORN cita la presencia de la especie en el parque sin detallar su categoría exacta de protección regional; pendiente de confirmar con el Catálogo Regional vigente.' review_note
    UNION ALL
    SELECT 'Gineta' common_name, 'Genetta genetta' scientific_name, 'fauna' kingdom, 'Mamífero carnívoro' family, 'Matorral y roquedos de las sierras costeras' primary_habitat, 'Interés especial' conservation_status, 'Carnívoro de hábitos nocturnos y esquivos, presente en las zonas montañosas de Calnegre y Cabo Cope junto a otros pequeños carnívoros ibéricos.' description, 'Hábitos nocturnos y esquivos; Muy difícil de observar directamente; Mejor rastreable por huellas o excrementos' identification_tips, 'Todo el año' seasonality, NULL image_url, 37.513 latitude, -1.457 longitude, 4 rarity_score, FALSE is_featured, 'Documento previo del PORN de Calnegre y Cabo Cope (CARM, Consejería de Agua, Agricultura, Ganadería, Pesca y Medio Ambiente, 2021)' source, 'Chordata' taxon_phylum, 'Mammalia' taxon_class, 'Carnivora' taxon_order, 'Viverridae' taxon_family, 'Genetta' taxon_genus, 'LC' iucn_global, 'LESRPE (Listado de Especies Silvestres en Régimen de Protección Especial)' spain_status, 'Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de Murcia: De interés especial' murcia_status, 'El PORN cita la presencia de la especie en el parque sin detallar su categoría exacta de protección regional; pendiente de confirmar con el Catálogo Regional vigente.' review_note
    UNION ALL
    SELECT 'Garduña' common_name, 'Martes foina' scientific_name, 'fauna' kingdom, 'Mamífero carnívoro' family, 'Matorral y roquedos de las sierras costeras' primary_habitat, 'Interés especial' conservation_status, 'Carnívoro de hábitos nocturnos y esquivos, presente en las zonas montañosas de Calnegre y Cabo Cope junto a otros pequeños carnívoros ibéricos.' description, 'Hábitos nocturnos y esquivos; Muy difícil de observar directamente; Mejor rastreable por huellas o excrementos' identification_tips, 'Todo el año' seasonality, NULL image_url, 37.511 latitude, -1.453 longitude, 4 rarity_score, FALSE is_featured, 'Documento previo del PORN de Calnegre y Cabo Cope (CARM, Consejería de Agua, Agricultura, Ganadería, Pesca y Medio Ambiente, 2021)' source, 'Chordata' taxon_phylum, 'Mammalia' taxon_class, 'Carnivora' taxon_order, 'Mustelidae' taxon_family, 'Martes' taxon_genus, 'LC' iucn_global, 'LESRPE (Listado de Especies Silvestres en Régimen de Protección Especial)' spain_status, 'Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de Murcia: De interés especial' murcia_status, 'El PORN cita la presencia de la especie en el parque sin detallar su categoría exacta de protección regional; pendiente de confirmar con el Catálogo Regional vigente.' review_note
    UNION ALL
    SELECT 'Tejón' common_name, 'Meles meles' scientific_name, 'fauna' kingdom, 'Mamífero carnívoro' family, 'Matorral y roquedos de las sierras costeras' primary_habitat, 'Interés especial' conservation_status, 'Carnívoro de hábitos nocturnos y esquivos, presente en las zonas montañosas de Calnegre y Cabo Cope junto a otros pequeños carnívoros ibéricos.' description, 'Hábitos nocturnos y esquivos; Muy difícil de observar directamente; Mejor rastreable por huellas o excrementos' identification_tips, 'Todo el año' seasonality, NULL image_url, 37.514 latitude, -1.456 longitude, 4 rarity_score, FALSE is_featured, 'Documento previo del PORN de Calnegre y Cabo Cope (CARM, Consejería de Agua, Agricultura, Ganadería, Pesca y Medio Ambiente, 2021)' source, 'Chordata' taxon_phylum, 'Mammalia' taxon_class, 'Carnivora' taxon_order, 'Mustelidae' taxon_family, 'Meles' taxon_genus, 'LC' iucn_global, 'LESRPE (Listado de Especies Silvestres en Régimen de Protección Especial)' spain_status, 'Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de Murcia: De interés especial' murcia_status, 'El PORN cita la presencia de la especie en el parque sin detallar su categoría exacta de protección regional; pendiente de confirmar con el Catálogo Regional vigente.' review_note
    UNION ALL
    SELECT 'Terrera marismeña' common_name, 'Calandrella rufescens' scientific_name, 'fauna' kingdom, 'Ave' family, 'Glacis, saladares y estepas salinas' primary_habitat, 'Interés especial' conservation_status, 'Alondra de zonas áridas y saladares, nidificante en el glacis de Cabo Cope junto a la terrera común.' description, 'Pico robusto y corto; Vuelo bajo y ondulado; Asociada a saladares y glacis' identification_tips, 'Todo el año' seasonality, NULL image_url, 37.5195 latitude, -1.4265 longitude, 3 rarity_score, FALSE is_featured, 'Documento previo del PORN de Calnegre y Cabo Cope (CARM, Consejería de Agua, Agricultura, Ganadería, Pesca y Medio Ambiente, 2021)' source, 'Chordata' taxon_phylum, 'Aves' taxon_class, 'Passeriformes' taxon_order, 'Alaudidae' taxon_family, 'Calandrella' taxon_genus, 'LC' iucn_global, 'LESRPE (Listado de Especies Silvestres en Régimen de Protección Especial)' spain_status, 'Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de Murcia: De interés especial' murcia_status, 'El PORN cita la presencia de la especie en el parque sin detallar su categoría exacta de protección regional; pendiente de confirmar con el Catálogo Regional vigente.' review_note
    UNION ALL
    SELECT 'Terrera común' common_name, 'Calandrella brachydactyla' scientific_name, 'fauna' kingdom, 'Ave' family, 'Glacis, saladares y paisaje árido' primary_habitat, 'Interés especial' conservation_status, 'Alondra estival de paisajes abiertos y áridos, presente tanto en el glacis de Cabo Cope como en los saladares de la Marina de Cope.' description, 'Ceja clara marcada; Gregaria fuera de la época de cría; Canto en vuelo característico' identification_tips, 'Primavera y verano' seasonality, NULL image_url, 37.5198 latitude, -1.427 longitude, 3 rarity_score, FALSE is_featured, 'Documento previo del PORN de Calnegre y Cabo Cope (CARM, Consejería de Agua, Agricultura, Ganadería, Pesca y Medio Ambiente, 2021)' source, 'Chordata' taxon_phylum, 'Aves' taxon_class, 'Passeriformes' taxon_order, 'Alaudidae' taxon_family, 'Calandrella' taxon_genus, 'LC' iucn_global, 'LESRPE (Listado de Especies Silvestres en Régimen de Protección Especial)' spain_status, 'Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de Murcia: De interés especial' murcia_status, 'El PORN cita la presencia de la especie en el parque sin detallar su categoría exacta de protección regional; pendiente de confirmar con el Catálogo Regional vigente.' review_note
    UNION ALL
    SELECT 'Cogujada montesina' common_name, 'Galerida theklae' scientific_name, 'fauna' kingdom, 'Ave' family, 'Matorral litoral y laderas secas' primary_habitat, 'Interés especial' conservation_status, 'Alondra de matorral mediterráneo abierto, muy similar a la cogujada común, con la que comparte hábitat en el parque.' description, 'Muy similar a la cogujada común; Copete corto y erecto; Prefiere laderas con matorral disperso' identification_tips, 'Todo el año' seasonality, NULL image_url, 37.5025 latitude, -1.4395 longitude, 3 rarity_score, FALSE is_featured, 'Documento previo del PORN de Calnegre y Cabo Cope (CARM, Consejería de Agua, Agricultura, Ganadería, Pesca y Medio Ambiente, 2021)' source, 'Chordata' taxon_phylum, 'Aves' taxon_class, 'Passeriformes' taxon_order, 'Alaudidae' taxon_family, 'Galerida' taxon_genus, 'LC' iucn_global, 'LESRPE (Listado de Especies Silvestres en Régimen de Protección Especial)' spain_status, 'Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de Murcia: De interés especial' murcia_status, 'El PORN cita la presencia de la especie en el parque sin detallar su categoría exacta de protección regional; pendiente de confirmar con el Catálogo Regional vigente.' review_note
    UNION ALL
    SELECT 'Curruca rabilarga' common_name, 'Curruca undata' scientific_name, 'fauna' kingdom, 'Ave' family, 'Matorral litoral y laderas secas' primary_habitat, 'Interés especial' conservation_status, 'Pequeña ave residente de matorral mediterráneo denso, reclasificada taxonómicamente de Sylvia undata a Curruca undata, igual que la curruca cabecinegra.' description, 'Cola larga que mueve constantemente; Ojo y anillo ocular rojizos; Ligada a matorral denso y bajo' identification_tips, 'Todo el año' seasonality, NULL image_url, 37.5015 latitude, -1.4385 longitude, 3 rarity_score, FALSE is_featured, 'Documento previo del PORN de Calnegre y Cabo Cope (CARM, Consejería de Agua, Agricultura, Ganadería, Pesca y Medio Ambiente, 2021)' source, 'Chordata' taxon_phylum, 'Aves' taxon_class, 'Passeriformes' taxon_order, 'Sylviidae' taxon_family, 'Curruca' taxon_genus, 'LC' iucn_global, 'LESRPE (Listado de Especies Silvestres en Régimen de Protección Especial)' spain_status, 'Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de Murcia: De interés especial' murcia_status, 'El PORN cita la presencia de la especie en el parque sin detallar su categoría exacta de protección regional; pendiente de confirmar con el Catálogo Regional vigente.' review_note
    UNION ALL
    SELECT 'Collalba negra' common_name, 'Oenanthe leucura' scientific_name, 'fauna' kingdom, 'Ave' family, 'Matorral litoral, laderas secas y roquedos' primary_habitat, 'Interés especial' conservation_status, 'Ave de roquedos y matorral abierto, de plumaje negro contrastado con obispillo blanco.' description, 'Plumaje negro con obispillo blanco; Suele posarse en piedras y montículos; Cola frecuentemente abierta en abanico' identification_tips, 'Todo el año' seasonality, NULL image_url, 37.503 latitude, -1.438 longitude, 3 rarity_score, FALSE is_featured, 'Documento previo del PORN de Calnegre y Cabo Cope (CARM, Consejería de Agua, Agricultura, Ganadería, Pesca y Medio Ambiente, 2021)' source, 'Chordata' taxon_phylum, 'Aves' taxon_class, 'Passeriformes' taxon_order, 'Muscicapidae' taxon_family, 'Oenanthe' taxon_genus, 'LC' iucn_global, 'LESRPE (Listado de Especies Silvestres en Régimen de Protección Especial)' spain_status, 'Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de Murcia: De interés especial' murcia_status, 'El PORN cita la presencia de la especie en el parque sin detallar su categoría exacta de protección regional; pendiente de confirmar con el Catálogo Regional vigente.' review_note
    UNION ALL
    SELECT 'Mochuelo europeo' common_name, 'Athene noctua' scientific_name, 'fauna' kingdom, 'Ave' family, 'Matorral litoral y zonas abiertas con posaderos' primary_habitat, 'Interés especial' conservation_status, 'Rapaz nocturna de pequeño tamaño, ligada a zonas abiertas con posaderos y oquedades para nidificar.' description, 'Pequeño tamaño y postura horizontal; Activo también de día; Vuelo bajo y ondulado' identification_tips, 'Todo el año' seasonality, NULL image_url, 37.5035 latitude, -1.4405 longitude, 3 rarity_score, FALSE is_featured, 'Documento previo del PORN de Calnegre y Cabo Cope (CARM, Consejería de Agua, Agricultura, Ganadería, Pesca y Medio Ambiente, 2021)' source, 'Chordata' taxon_phylum, 'Aves' taxon_class, 'Strigiformes' taxon_order, 'Strigidae' taxon_family, 'Athene' taxon_genus, 'LC' iucn_global, 'LESRPE (Listado de Especies Silvestres en Régimen de Protección Especial)' spain_status, 'Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de Murcia: De interés especial' murcia_status, 'El PORN cita la presencia de la especie en el parque sin detallar su categoría exacta de protección regional; pendiente de confirmar con el Catálogo Regional vigente.' review_note
    UNION ALL
    SELECT 'Perdiz roja' common_name, 'Alectoris rufa' scientific_name, 'fauna' kingdom, 'Ave' family, 'Matorral litoral y laderas secas' primary_habitat, 'Interés especial' conservation_status, 'Galliforme de matorral mediterráneo abierto, común en las laderas secas del parque.' description, 'Franco ocular y collar negro característicos; Vuelo corto y explosivo; Se mueve en bandos fuera de la cría' identification_tips, 'Todo el año' seasonality, NULL image_url, 37.504 latitude, -1.441 longitude, 3 rarity_score, FALSE is_featured, 'Documento previo del PORN de Calnegre y Cabo Cope (CARM, Consejería de Agua, Agricultura, Ganadería, Pesca y Medio Ambiente, 2021)' source, 'Chordata' taxon_phylum, 'Aves' taxon_class, 'Galliformes' taxon_order, 'Phasianidae' taxon_family, 'Alectoris' taxon_genus, 'LC' iucn_global, 'LESRPE (Listado de Especies Silvestres en Régimen de Protección Especial)' spain_status, 'Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de Murcia: De interés especial' murcia_status, 'El PORN cita la presencia de la especie en el parque sin detallar su categoría exacta de protección regional; pendiente de confirmar con el Catálogo Regional vigente.' review_note
    UNION ALL
    SELECT 'Chorlitejo patinegro' common_name, 'Charadrius alexandrinus' scientific_name, 'fauna' kingdom, 'Ave' family, 'Playas de la Marina de Cope' primary_habitat, 'Interés especial' conservation_status, 'Limícola nidificante en las playas de la Marina de Cope, muy sensible a la frecuentación humana durante la cría.' description, 'Pequeño limícola de playas arenosas; Nidifica directamente en la arena; Muy sensible a molestias en época de cría' identification_tips, 'Primavera y verano' seasonality, NULL image_url, 37.5395 latitude, -1.4035 longitude, 3 rarity_score, FALSE is_featured, 'Documento previo del PORN de Calnegre y Cabo Cope (CARM, Consejería de Agua, Agricultura, Ganadería, Pesca y Medio Ambiente, 2021)' source, 'Chordata' taxon_phylum, 'Aves' taxon_class, 'Charadriiformes' taxon_order, 'Charadriidae' taxon_family, 'Charadrius' taxon_genus, 'LC' iucn_global, 'LESRPE (Listado de Especies Silvestres en Régimen de Protección Especial)' spain_status, 'Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de Murcia: De interés especial' murcia_status, 'El PORN cita la presencia de la especie en el parque sin detallar su categoría exacta de protección regional; pendiente de confirmar con el Catálogo Regional vigente.' review_note
    UNION ALL
    SELECT 'Correlimos tridáctilo' common_name, 'Calidris alba' scientific_name, 'fauna' kingdom, 'Ave' family, 'Playas de la Marina de Cope (invernante)' primary_habitat, 'Interés especial' conservation_status, 'Limícola invernante que recorre la orilla de las playas del parque al ritmo del oleaje en busca de alimento.' description, 'Corretea en la orilla al ritmo de las olas; Plumaje invernal muy pálido; Presencia invernal, no reproductora' identification_tips, 'Otoño e invierno' seasonality, NULL image_url, 37.54 latitude, -1.402 longitude, 3 rarity_score, FALSE is_featured, 'Documento previo del PORN de Calnegre y Cabo Cope (CARM, Consejería de Agua, Agricultura, Ganadería, Pesca y Medio Ambiente, 2021)' source, 'Chordata' taxon_phylum, 'Aves' taxon_class, 'Charadriiformes' taxon_order, 'Scolopacidae' taxon_family, 'Calidris' taxon_genus, 'LC' iucn_global, 'LESRPE (Listado de Especies Silvestres en Régimen de Protección Especial)' spain_status, 'Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de Murcia: De interés especial' murcia_status, 'El PORN cita la presencia de la especie en el parque sin detallar su categoría exacta de protección regional; pendiente de confirmar con el Catálogo Regional vigente.' review_note
    UNION ALL
    SELECT 'Vuelvepiedras' common_name, 'Arenaria interpres' scientific_name, 'fauna' kingdom, 'Ave' family, 'Playas y costa rocosa (invernante)' primary_habitat, 'Interés especial' conservation_status, 'Limícola invernante que busca alimento volteando piedras y algas en la orilla.' description, 'Voltea piedras y algas buscando alimento; Plumaje pardo-rojizo jaspeado en verano; Presencia invernal, no reproductora' identification_tips, 'Otoño e invierno' seasonality, NULL image_url, 37.5405 latitude, -1.4025 longitude, 3 rarity_score, FALSE is_featured, 'Documento previo del PORN de Calnegre y Cabo Cope (CARM, Consejería de Agua, Agricultura, Ganadería, Pesca y Medio Ambiente, 2021)' source, 'Chordata' taxon_phylum, 'Aves' taxon_class, 'Charadriiformes' taxon_order, 'Scolopacidae' taxon_family, 'Arenaria' taxon_genus, 'LC' iucn_global, 'LESRPE (Listado de Especies Silvestres en Régimen de Protección Especial)' spain_status, 'Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de Murcia: De interés especial' murcia_status, 'El PORN cita la presencia de la especie en el parque sin detallar su categoría exacta de protección regional; pendiente de confirmar con el Catálogo Regional vigente.' review_note
    UNION ALL
    SELECT 'Ostrero euroasiático' common_name, 'Haematopus ostralegus' scientific_name, 'fauna' kingdom, 'Ave' family, 'Playas y costa rocosa (invernante)' primary_habitat, 'Interés especial' conservation_status, 'Limícola invernante de gran tamaño, fácilmente identificable por su pico rojo y largo.' description, 'Pico rojo largo y robusto; Plumaje blanco y negro contrastado; Presencia invernal, no reproductora' identification_tips, 'Otoño e invierno' seasonality, NULL image_url, 37.541 latitude, -1.401 longitude, 3 rarity_score, FALSE is_featured, 'Documento previo del PORN de Calnegre y Cabo Cope (CARM, Consejería de Agua, Agricultura, Ganadería, Pesca y Medio Ambiente, 2021)' source, 'Chordata' taxon_phylum, 'Aves' taxon_class, 'Charadriiformes' taxon_order, 'Haematopodidae' taxon_family, 'Haematopus' taxon_genus, 'LC' iucn_global, 'LESRPE (Listado de Especies Silvestres en Régimen de Protección Especial)' spain_status, 'Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de Murcia: De interés especial' murcia_status, 'El PORN cita la presencia de la especie en el parque sin detallar su categoría exacta de protección regional; pendiente de confirmar con el Catálogo Regional vigente.' review_note
    UNION ALL
    SELECT 'Charrancito común' common_name, 'Sternula albifrons' scientific_name, 'fauna' kingdom, 'Ave' family, 'Costa y playas del parque' primary_habitat, 'Interés especial' conservation_status, 'El más pequeño de los láridos que frecuentan la costa del parque; forma parte de la taxocenosis de aves marinas y larolimícolas de las playas.' description, 'El lárido más pequeño de la zona; Pesca en vuelo con zambullidas; Reclasificado taxonómicamente de Sterna a Sternula' identification_tips, 'Primavera a otoño' seasonality, NULL image_url, 37.5385 latitude, -1.404 longitude, 3 rarity_score, FALSE is_featured, 'Documento previo del PORN de Calnegre y Cabo Cope (CARM, Consejería de Agua, Agricultura, Ganadería, Pesca y Medio Ambiente, 2021)' source, 'Chordata' taxon_phylum, 'Aves' taxon_class, 'Charadriiformes' taxon_order, 'Laridae' taxon_family, 'Sternula' taxon_genus, 'LC' iucn_global, 'LESRPE (Listado de Especies Silvestres en Régimen de Protección Especial)' spain_status, 'Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de Murcia: De interés especial' murcia_status, 'El PORN cita la presencia de la especie en el parque sin detallar su categoría exacta de protección regional; pendiente de confirmar con el Catálogo Regional vigente.' review_note
    UNION ALL
    SELECT 'Lagartija colilarga' common_name, 'Psammodromus algirus' scientific_name, 'fauna' kingdom, 'Reptil' family, 'Matorral litoral y laderas secas' primary_habitat, 'Interés especial' conservation_status, 'Lacértido común de matorral mediterráneo, de cola muy larga en relación al cuerpo.' description, 'Cola muy larga respecto al cuerpo; Escamas dorsales quilladas; Muy activa entre el matorral bajo' identification_tips, 'Primavera a otoño' seasonality, NULL image_url, 37.5045 latitude, -1.443 longitude, 3 rarity_score, FALSE is_featured, 'Documento previo del PORN de Calnegre y Cabo Cope (CARM, Consejería de Agua, Agricultura, Ganadería, Pesca y Medio Ambiente, 2021)' source, 'Chordata' taxon_phylum, 'Reptilia' taxon_class, 'Squamata' taxon_order, 'Lacertidae' taxon_family, 'Psammodromus' taxon_genus, 'LC' iucn_global, 'LESRPE (Listado de Especies Silvestres en Régimen de Protección Especial)' spain_status, 'Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de Murcia: De interés especial' murcia_status, 'El PORN cita la presencia de la especie en el parque sin detallar su categoría exacta de protección regional; pendiente de confirmar con el Catálogo Regional vigente.' review_note
    UNION ALL
    SELECT 'Culebra bastarda' common_name, 'Malpolon monspessulanus' scientific_name, 'fauna' kingdom, 'Reptil' family, 'Matorral litoral y laderas secas' primary_habitat, 'Interés especial' conservation_status, 'La culebra de mayor tamaño de la región, propia de matorral mediterráneo y zonas abiertas soleadas.' description, 'Gran tamaño (puede superar los 2 m); Levanta la cabeza cuando se siente amenazada; Activa de día en horas templadas' identification_tips, 'Primavera a otoño' seasonality, NULL image_url, 37.505 latitude, -1.444 longitude, 3 rarity_score, FALSE is_featured, 'Documento previo del PORN de Calnegre y Cabo Cope (CARM, Consejería de Agua, Agricultura, Ganadería, Pesca y Medio Ambiente, 2021)' source, 'Chordata' taxon_phylum, 'Reptilia' taxon_class, 'Squamata' taxon_order, 'Lamprophiidae' taxon_family, 'Malpolon' taxon_genus, 'LC' iucn_global, 'LESRPE (Listado de Especies Silvestres en Régimen de Protección Especial)' spain_status, 'Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de Murcia: De interés especial' murcia_status, 'El PORN cita la presencia de la especie en el parque sin detallar su categoría exacta de protección regional; pendiente de confirmar con el Catálogo Regional vigente.' review_note
    UNION ALL
    SELECT 'Lagartija colirroja' common_name, 'Acanthodactylus erythrurus' scientific_name, 'fauna' kingdom, 'Reptil' family, 'Matorral litoral y laderas secas' primary_habitat, 'Interés especial' conservation_status, 'Lacértido de zonas arenosas y matorral abierto, con la cola de tono rojizo característico en los juveniles.' description, 'Cola rojiza en ejemplares jóvenes; Ligada a suelos sueltos y arenosos; Muy rápida y esquiva' identification_tips, 'Primavera a otoño' seasonality, NULL image_url, 37.506 latitude, -1.442 longitude, 3 rarity_score, FALSE is_featured, 'Documento previo del PORN de Calnegre y Cabo Cope (CARM, Consejería de Agua, Agricultura, Ganadería, Pesca y Medio Ambiente, 2021)' source, 'Chordata' taxon_phylum, 'Reptilia' taxon_class, 'Squamata' taxon_order, 'Lacertidae' taxon_family, 'Acanthodactylus' taxon_genus, 'LC' iucn_global, 'LESRPE (Listado de Especies Silvestres en Régimen de Protección Especial)' spain_status, 'Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de Murcia: De interés especial' murcia_status, 'El PORN cita la presencia de la especie en el parque sin detallar su categoría exacta de protección regional; pendiente de confirmar con el Catálogo Regional vigente.' review_note
) s
WHERE p.slug = "cabo-cope-puntas-calnegre"
ON DUPLICATE KEY UPDATE common_name = VALUES(common_name), family = VALUES(family), primary_habitat = VALUES(primary_habitat),
    conservation_status = VALUES(conservation_status), description = VALUES(description), identification_tips = VALUES(identification_tips),
    seasonality = VALUES(seasonality), image_url = VALUES(image_url), latitude = VALUES(latitude), longitude = VALUES(longitude),
    rarity_score = VALUES(rarity_score), is_featured = VALUES(is_featured), source = VALUES(source),
    taxon_phylum = VALUES(taxon_phylum), taxon_class = VALUES(taxon_class), taxon_order = VALUES(taxon_order),
    taxon_family = VALUES(taxon_family), taxon_genus = VALUES(taxon_genus), iucn_global = VALUES(iucn_global),
    spain_status = VALUES(spain_status), murcia_status = VALUES(murcia_status), review_note = VALUES(review_note);

-- Vínculo especie-hábitat para las especies añadidas desde el PORN (Senecio flavus queda sin hábitat
-- estructurado porque el documento no especifica su asociación fitosociológica).
INSERT IGNORE INTO species_habitats (species_id, habitat_id)
SELECT sp.id, h.id
FROM (
    SELECT 'Centaurea saxicola' scientific_name, 'roquedos-casmofiticos' habitat_slug
    UNION ALL
    SELECT 'Lafuentea rotundifolia' scientific_name, 'roquedos-casmofiticos' habitat_slug
    UNION ALL
    SELECT 'Felis silvestris' scientific_name, 'matorral-semiarido' habitat_slug
    UNION ALL
    SELECT 'Genetta genetta' scientific_name, 'matorral-semiarido' habitat_slug
    UNION ALL
    SELECT 'Martes foina' scientific_name, 'matorral-semiarido' habitat_slug
    UNION ALL
    SELECT 'Meles meles' scientific_name, 'matorral-semiarido' habitat_slug
    UNION ALL
    SELECT 'Calandrella rufescens' scientific_name, 'matorral-halofilo' habitat_slug
    UNION ALL
    SELECT 'Calandrella brachydactyla' scientific_name, 'matorral-halofilo' habitat_slug
    UNION ALL
    SELECT 'Galerida theklae' scientific_name, 'matorral-semiarido' habitat_slug
    UNION ALL
    SELECT 'Curruca undata' scientific_name, 'matorral-semiarido' habitat_slug
    UNION ALL
    SELECT 'Oenanthe leucura' scientific_name, 'matorral-semiarido' habitat_slug
    UNION ALL
    SELECT 'Athene noctua' scientific_name, 'matorral-semiarido' habitat_slug
    UNION ALL
    SELECT 'Alectoris rufa' scientific_name, 'matorral-semiarido' habitat_slug
    UNION ALL
    SELECT 'Charadrius alexandrinus' scientific_name, 'veg-anual-desechos-marinos' habitat_slug
    UNION ALL
    SELECT 'Calidris alba' scientific_name, 'veg-anual-desechos-marinos' habitat_slug
    UNION ALL
    SELECT 'Arenaria interpres' scientific_name, 'veg-anual-desechos-marinos' habitat_slug
    UNION ALL
    SELECT 'Haematopus ostralegus' scientific_name, 'veg-anual-desechos-marinos' habitat_slug
    UNION ALL
    SELECT 'Sternula albifrons' scientific_name, 'veg-anual-desechos-marinos' habitat_slug
    UNION ALL
    SELECT 'Psammodromus algirus' scientific_name, 'matorral-semiarido' habitat_slug
    UNION ALL
    SELECT 'Malpolon monspessulanus' scientific_name, 'matorral-semiarido' habitat_slug
    UNION ALL
    SELECT 'Acanthodactylus erythrurus' scientific_name, 'matorral-semiarido' habitat_slug
) rel
JOIN species sp ON sp.scientific_name = rel.scientific_name
JOIN habitats h ON h.slug = rel.habitat_slug
JOIN parks p ON p.id = sp.park_id AND p.id = h.park_id
WHERE p.slug = "cabo-cope-puntas-calnegre";

-- Flora protegida añadida desde el Anexo I del proyecto de PORN (ANSE/CARM), Catálogo de Flora
-- Silvestre Protegida (Decreto 50/2003): 12 taxones que faltaban para completar la lista oficial
-- de flora protegida del parque. El hábitat de varias es inferencia (ver review_note); las coordenadas
-- son representativas. La flora vascular total del parque supera las 320 especies (Alcaraz Ariza,
-- Eubacteria nº5), pero ese inventario completo no está publicado; aquí solo se cataloga la protegida.
INSERT INTO species (park_id, common_name, scientific_name, kingdom, family, primary_habitat, conservation_status,
    description, identification_tips, seasonality, image_url, latitude, longitude, rarity_score, is_featured, source,
    taxon_phylum, taxon_class, taxon_order, taxon_family, taxon_genus, iucn_global, spain_status, murcia_status, review_note)
SELECT p.id, s.common_name, s.scientific_name, s.kingdom, s.family, s.primary_habitat, s.conservation_status,
    s.description, s.identification_tips, s.seasonality, s.image_url, s.latitude, s.longitude, s.rarity_score, s.is_featured, s.source,
    s.taxon_phylum, s.taxon_class, s.taxon_order, s.taxon_family, s.taxon_genus, s.iucn_global, s.spain_status, s.murcia_status, s.review_note
FROM parks p
JOIN (
    SELECT 'Palmito' common_name, 'Chamaerops humilis' scientific_name, 'flora' kingdom, 'Palmera' family, 'Sabinar y matorral termomediterráneo' primary_habitat, 'Interés especial' conservation_status, 'Única palmera autóctona de Europa continental, elemento termófilo característico del sabinar de Cabo Cope, donde acompaña a la sabina negral en la asociación Chamaeropo humilis-Juniperetum phoeniceae.' description, 'Hojas en abanico con peciolo espinoso; Porte arbustivo en mata; Elemento termófilo del sabinar' identification_tips, 'Todo el año' seasonality, NULL image_url, 37.4998 latitude, -1.4378 longitude, 3 rarity_score, FALSE is_featured, 'Anexo I del proyecto de PORN del Parque Regional costero-litoral de Cabo Cope (ANSE / CARM) - Catálogo de Flora Silvestre Protegida (Decreto 50/2003)' source, 'Tracheophyta' taxon_phylum, 'Liliopsida' taxon_class, 'Arecales' taxon_order, 'Arecaceae' taxon_family, 'Chamaerops' taxon_genus, 'NE' iucn_global, 'No localizada en la Lista Roja de la Flora Vascular Española 2008 (pendiente de confirmar)' spain_status, 'Catálogo Regional de Flora Silvestre Protegida de Murcia (Decreto 50/2003): De interés especial' murcia_status, 'Especie añadida desde el Catálogo de Flora Silvestre Protegida del Anexo I del PORN; el hábitat se apoya en la asociación fitosociológica citada por las fuentes oficiales del parque. Coordenadas representativas, pendientes de precisar en campo.' review_note
    UNION ALL
    SELECT 'Cinomorio' common_name, 'Cynomorium coccineum' scientific_name, 'flora' kingdom, 'Planta parásita' family, 'Saladares y matorrales halonitrófilos' primary_habitat, 'Interés especial' conservation_status, 'Planta parásita sin clorofila, de aspecto de maza rojiza, que crece sobre las raíces de quenopodiáceas halófilas de los saladares y estepas salinas.' description, 'Inflorescencia carnosa rojo-oscura en maza; Sin hojas verdes (parásita); Aparece sobre raíces de plantas halófilas' identification_tips, 'Primavera' seasonality, NULL image_url, 37.474 latitude, -1.4805 longitude, 5 rarity_score, FALSE is_featured, 'Anexo I del proyecto de PORN del Parque Regional costero-litoral de Cabo Cope (ANSE / CARM) - Catálogo de Flora Silvestre Protegida (Decreto 50/2003)' source, 'Tracheophyta' taxon_phylum, 'Magnoliopsida' taxon_class, 'Saxifragales' taxon_order, 'Cynomoriaceae' taxon_family, 'Cynomorium' taxon_genus, 'NE' iucn_global, 'No localizada en la Lista Roja de la Flora Vascular Española 2008 (pendiente de confirmar)' spain_status, 'Catálogo Regional de Flora Silvestre Protegida de Murcia (Decreto 50/2003): De interés especial' murcia_status, 'Especie añadida desde el Catálogo de Flora Silvestre Protegida del Anexo I del PORN; la asignación de hábitat es una inferencia ecológica (el Anexo no la vincula a una asociación concreta) y las coordenadas son representativas, no de una localización verificada. Confirmar en campo.' review_note
    UNION ALL
    SELECT 'Eragrostis' common_name, 'Eragrostis papposa' scientific_name, 'flora' kingdom, 'Gramínea' family, 'Pastizales de la subestepa de gramíneas' primary_habitat, 'Interés especial' conservation_status, 'Pequeña gramínea de los pastizales secos y litosuelos cálidos, componente de la subestepa de gramíneas del piso termomediterráneo.' description, 'Panícula abierta y difusa; Mata de pequeño porte; Litosuelos secos y soleados' identification_tips, 'Verano' seasonality, NULL image_url, 37.5078 latitude, -1.4405 longitude, 4 rarity_score, FALSE is_featured, 'Anexo I del proyecto de PORN del Parque Regional costero-litoral de Cabo Cope (ANSE / CARM) - Catálogo de Flora Silvestre Protegida (Decreto 50/2003)' source, 'Tracheophyta' taxon_phylum, 'Liliopsida' taxon_class, 'Poales' taxon_order, 'Poaceae' taxon_family, 'Eragrostis' taxon_genus, 'NE' iucn_global, 'No localizada en la Lista Roja de la Flora Vascular Española 2008 (pendiente de confirmar)' spain_status, 'Catálogo Regional de Flora Silvestre Protegida de Murcia (Decreto 50/2003): De interés especial' murcia_status, 'Especie añadida desde el Catálogo de Flora Silvestre Protegida del Anexo I del PORN; la asignación de hábitat es una inferencia ecológica (el Anexo no la vincula a una asociación concreta) y las coordenadas son representativas, no de una localización verificada. Confirmar en campo.' review_note
    UNION ALL
    SELECT 'Erodio' common_name, 'Erodium sanguis-christi' scientific_name, 'flora' kingdom, 'Hierba anual' family, 'Litosuelos y pastizales abiertos' primary_habitat, 'Interés especial' conservation_status, 'Pequeña geraniácea anual de suelos abiertos y pedregosos, de floración temprana en el piso termomediterráneo semiárido.' description, 'Flores rosadas pequeñas; Fruto con pico alargado característico de Erodium; Anual de suelos pedregosos' identification_tips, 'Primavera' seasonality, NULL image_url, 37.5082 latitude, -1.4412 longitude, 4 rarity_score, FALSE is_featured, 'Anexo I del proyecto de PORN del Parque Regional costero-litoral de Cabo Cope (ANSE / CARM) - Catálogo de Flora Silvestre Protegida (Decreto 50/2003)' source, 'Tracheophyta' taxon_phylum, 'Magnoliopsida' taxon_class, 'Geraniales' taxon_order, 'Geraniaceae' taxon_family, 'Erodium' taxon_genus, 'NE' iucn_global, 'No localizada en la Lista Roja de la Flora Vascular Española 2008 (pendiente de confirmar)' spain_status, 'Catálogo Regional de Flora Silvestre Protegida de Murcia (Decreto 50/2003): De interés especial' murcia_status, 'Especie añadida desde el Catálogo de Flora Silvestre Protegida del Anexo I del PORN; la asignación de hábitat es una inferencia ecológica (el Anexo no la vincula a una asociación concreta) y las coordenadas son representativas, no de una localización verificada. Confirmar en campo.' review_note
    UNION ALL
    SELECT 'Cantueso dentado' common_name, 'Lavandula dentata' scientific_name, 'flora' kingdom, 'Mata aromática' family, 'Tomillares y matorral termomediterráneo' primary_habitat, 'Interés especial' conservation_status, 'Lavanda de hojas dentadas, aromática, propia de tomillares y matorrales secos y soleados del sureste ibérico.' description, 'Hojas estrechas con margen dentado; Espiga floral violácea con penacho; Muy aromática' identification_tips, 'Primavera' seasonality, NULL image_url, 37.5052 latitude, -1.4415 longitude, 3 rarity_score, FALSE is_featured, 'Anexo I del proyecto de PORN del Parque Regional costero-litoral de Cabo Cope (ANSE / CARM) - Catálogo de Flora Silvestre Protegida (Decreto 50/2003)' source, 'Tracheophyta' taxon_phylum, 'Magnoliopsida' taxon_class, 'Lamiales' taxon_order, 'Lamiaceae' taxon_family, 'Lavandula' taxon_genus, 'NE' iucn_global, 'No localizada en la Lista Roja de la Flora Vascular Española 2008 (pendiente de confirmar)' spain_status, 'Catálogo Regional de Flora Silvestre Protegida de Murcia (Decreto 50/2003): De interés especial (Anexo II: aprovechamiento sujeto a autorización)' murcia_status, 'Especie añadida desde el Catálogo de Flora Silvestre Protegida del Anexo I del PORN; la asignación de hábitat es una inferencia ecológica (el Anexo no la vincula a una asociación concreta) y las coordenadas son representativas, no de una localización verificada. Confirmar en campo.' review_note
    UNION ALL
    SELECT 'Alhucema' common_name, 'Lavandula multifida' scientific_name, 'flora' kingdom, 'Mata aromática' family, 'Matorral semiárido y bordes soleados' primary_habitat, 'Interés especial' conservation_status, 'Lavanda de hojas muy divididas (bipinnadas), termófila, frecuente en matorrales abiertos y bordes soleados de la marina de Cope.' description, 'Hojas finamente divididas (bipinnadas); Flores azul-violáceas; Aroma intenso' identification_tips, 'Primavera a otoño' seasonality, NULL image_url, 37.5045 latitude, -1.4408 longitude, 3 rarity_score, FALSE is_featured, 'Anexo I del proyecto de PORN del Parque Regional costero-litoral de Cabo Cope (ANSE / CARM) - Catálogo de Flora Silvestre Protegida (Decreto 50/2003)' source, 'Tracheophyta' taxon_phylum, 'Magnoliopsida' taxon_class, 'Lamiales' taxon_order, 'Lamiaceae' taxon_family, 'Lavandula' taxon_genus, 'NE' iucn_global, 'No localizada en la Lista Roja de la Flora Vascular Española 2008 (pendiente de confirmar)' spain_status, 'Catálogo Regional de Flora Silvestre Protegida de Murcia (Decreto 50/2003): De interés especial (Anexo II: aprovechamiento sujeto a autorización)' murcia_status, 'Especie añadida desde el Catálogo de Flora Silvestre Protegida del Anexo I del PORN; la asignación de hábitat es una inferencia ecológica (el Anexo no la vincula a una asociación concreta) y las coordenadas son representativas, no de una localización verificada. Confirmar en campo.' review_note
    UNION ALL
    SELECT 'Leucanto litoral' common_name, 'Leucanthemum decipiens' scientific_name, 'flora' kingdom, 'Hierba de roquedo' family, 'Roquedos y acantilados costeros' primary_habitat, 'Interés especial' conservation_status, 'Margarita perenne de roquedos y acantilados litorales, integrante de las comunidades rupícolas costeras del parque.' description, 'Capítulos con lígulas blancas y centro amarillo; Vive en fisuras y repisas rocosas; Ambientes rupícolas costeros' identification_tips, 'Primavera' seasonality, NULL image_url, 37.4948 latitude, -1.4588 longitude, 4 rarity_score, FALSE is_featured, 'Anexo I del proyecto de PORN del Parque Regional costero-litoral de Cabo Cope (ANSE / CARM) - Catálogo de Flora Silvestre Protegida (Decreto 50/2003)' source, 'Tracheophyta' taxon_phylum, 'Magnoliopsida' taxon_class, 'Asterales' taxon_order, 'Asteraceae' taxon_family, 'Leucanthemum' taxon_genus, 'NE' iucn_global, 'No localizada en la Lista Roja de la Flora Vascular Española 2008 (pendiente de confirmar)' spain_status, 'Catálogo Regional de Flora Silvestre Protegida de Murcia (Decreto 50/2003): De interés especial' murcia_status, 'Especie añadida desde el Catálogo de Flora Silvestre Protegida del Anexo I del PORN; la asignación de hábitat es una inferencia ecológica (el Anexo no la vincula a una asociación concreta) y las coordenadas son representativas, no de una localización verificada. Confirmar en campo.' review_note
    UNION ALL
    SELECT 'Siempreviva de Cosson' common_name, 'Limonium cossonianum' scientific_name, 'flora' kingdom, 'Planta halófila' family, 'Acantilados y saladares costeros' primary_habitat, 'Interés especial' conservation_status, 'Siempreviva dominante de los acantilados litorales del parque, especie característica de la asociación Limonio cossoniani-Lycietum intricati (hábitat 1240) y presente también en saladares.' description, 'Roseta basal de hojas espatuladas; Panículas de flores violáceas persistentes; Domina los acantilados costeros' identification_tips, 'Verano' seasonality, NULL image_url, 37.4872 latitude, -1.4712 longitude, 3 rarity_score, FALSE is_featured, 'Anexo I del proyecto de PORN del Parque Regional costero-litoral de Cabo Cope (ANSE / CARM) - Catálogo de Flora Silvestre Protegida (Decreto 50/2003)' source, 'Tracheophyta' taxon_phylum, 'Magnoliopsida' taxon_class, 'Caryophyllales' taxon_order, 'Plumbaginaceae' taxon_family, 'Limonium' taxon_genus, 'NE' iucn_global, 'No localizada en la Lista Roja de la Flora Vascular Española 2008 (pendiente de confirmar)' spain_status, 'Catálogo Regional de Flora Silvestre Protegida de Murcia (Decreto 50/2003): De interés especial (Anexo II: aprovechamiento sujeto a autorización)' murcia_status, 'Especie añadida desde el Catálogo de Flora Silvestre Protegida del Anexo I del PORN; el hábitat se apoya en la asociación fitosociológica citada por las fuentes oficiales del parque. Coordenadas representativas, pendientes de precisar en campo.' review_note
    UNION ALL
    SELECT 'Bayón' common_name, 'Osyris lanceolata' scientific_name, 'flora' kingdom, 'Arbusto hemiparásito' family, 'Sabinar y matorral termófilo' primary_habitat, 'Interés especial' conservation_status, 'Arbusto perennifolio hemiparásito, elemento termófilo de gran interés de conservación que acompaña a la sabina negra en el sabinar de Cabo Cope.' description, 'Arbusto de hojas lanceoladas coriáceas; Hemiparásito de raíces de otras plantas; Frutos carnosos rojizos' identification_tips, 'Todo el año' seasonality, NULL image_url, 37.5003 latitude, -1.438 longitude, 3 rarity_score, FALSE is_featured, 'Anexo I del proyecto de PORN del Parque Regional costero-litoral de Cabo Cope (ANSE / CARM) - Catálogo de Flora Silvestre Protegida (Decreto 50/2003)' source, 'Tracheophyta' taxon_phylum, 'Magnoliopsida' taxon_class, 'Santalales' taxon_order, 'Santalaceae' taxon_family, 'Osyris' taxon_genus, 'NE' iucn_global, 'No localizada en la Lista Roja de la Flora Vascular Española 2008 (pendiente de confirmar)' spain_status, 'Catálogo Regional de Flora Silvestre Protegida de Murcia (Decreto 50/2003): De interés especial' murcia_status, 'Especie añadida desde el Catálogo de Flora Silvestre Protegida del Anexo I del PORN; el hábitat se apoya en la asociación fitosociológica citada por las fuentes oficiales del parque. Coordenadas representativas, pendientes de precisar en campo.' review_note
    UNION ALL
    SELECT 'Coscoja' common_name, 'Quercus coccifera' scientific_name, 'flora' kingdom, 'Arbusto esclerófilo' family, 'Matorral esclerófilo y sabinar' primary_habitat, 'Interés especial' conservation_status, 'Arbusto esclerófilo de hoja perenne y espinosa, integrante del matorral mediterráneo denso y de las orlas del sabinar.' description, 'Hojas coriáceas con margen espinoso; Bellota con cúpula de escamas punzantes; Porte arbustivo denso' identification_tips, 'Todo el año' seasonality, NULL image_url, 37.5008 latitude, -1.4392 longitude, 2 rarity_score, FALSE is_featured, 'Anexo I del proyecto de PORN del Parque Regional costero-litoral de Cabo Cope (ANSE / CARM) - Catálogo de Flora Silvestre Protegida (Decreto 50/2003)' source, 'Tracheophyta' taxon_phylum, 'Magnoliopsida' taxon_class, 'Fagales' taxon_order, 'Fagaceae' taxon_family, 'Quercus' taxon_genus, 'NE' iucn_global, 'No localizada en la Lista Roja de la Flora Vascular Española 2008 (pendiente de confirmar)' spain_status, 'Catálogo Regional de Flora Silvestre Protegida de Murcia (Decreto 50/2003): De interés especial (Anexo II: aprovechamiento sujeto a autorización)' murcia_status, 'Especie añadida desde el Catálogo de Flora Silvestre Protegida del Anexo I del PORN; la asignación de hábitat es una inferencia ecológica (el Anexo no la vincula a una asociación concreta) y las coordenadas son representativas, no de una localización verificada. Confirmar en campo.' review_note
    UNION ALL
    SELECT 'Zapatito de la Virgen' common_name, 'Sarcocapnos enneaphylla subsp. saetabensis' scientific_name, 'flora' kingdom, 'Hierba de roquedo' family, 'Extraplomos y roquedos calcáreos' primary_habitat, 'Interés especial' conservation_status, 'Pequeña planta rupícola de extraplomos y oquedades de roquedos calcáreos, integrante de la asociación Resedo paui-Sarcocapnetum saetabensis del hábitat 8210.' description, 'Cuelga de extraplomos y techos rocosos; Flores blanco-rosadas con espolón; Hojas divididas glaucas' identification_tips, 'Primavera' seasonality, NULL image_url, 37.4942 latitude, -1.4592 longitude, 4 rarity_score, FALSE is_featured, 'Anexo I del proyecto de PORN del Parque Regional costero-litoral de Cabo Cope (ANSE / CARM) - Catálogo de Flora Silvestre Protegida (Decreto 50/2003)' source, 'Tracheophyta' taxon_phylum, 'Magnoliopsida' taxon_class, 'Ranunculales' taxon_order, 'Papaveraceae' taxon_family, 'Sarcocapnos' taxon_genus, 'NE' iucn_global, 'No localizada en la Lista Roja de la Flora Vascular Española 2008 (pendiente de confirmar)' spain_status, 'Catálogo Regional de Flora Silvestre Protegida de Murcia (Decreto 50/2003): De interés especial' murcia_status, 'Especie añadida desde el Catálogo de Flora Silvestre Protegida del Anexo I del PORN; el hábitat se apoya en la asociación fitosociológica citada por las fuentes oficiales del parque. Coordenadas representativas, pendientes de precisar en campo.' review_note
    UNION ALL
    SELECT 'Serrátula' common_name, 'Serratula mucronata' scientific_name, 'flora' kingdom, 'Hierba' family, 'Matorral y pastizales secos' primary_habitat, 'Interés especial' conservation_status, 'Compuesta perenne de matorrales y pastizales secos del piso termomediterráneo, incluida en el Catálogo Regional por su interés.' description, 'Capítulos sin lígulas, de tonos purpúreos; Hojas con margen mucronado; Matorrales y pastizales secos' identification_tips, 'Verano y otoño' seasonality, NULL image_url, 37.5065 latitude, -1.4418 longitude, 4 rarity_score, FALSE is_featured, 'Anexo I del proyecto de PORN del Parque Regional costero-litoral de Cabo Cope (ANSE / CARM) - Catálogo de Flora Silvestre Protegida (Decreto 50/2003)' source, 'Tracheophyta' taxon_phylum, 'Magnoliopsida' taxon_class, 'Asterales' taxon_order, 'Asteraceae' taxon_family, 'Serratula' taxon_genus, 'NE' iucn_global, 'No localizada en la Lista Roja de la Flora Vascular Española 2008 (pendiente de confirmar)' spain_status, 'Catálogo Regional de Flora Silvestre Protegida de Murcia (Decreto 50/2003): De interés especial' murcia_status, 'Especie añadida desde el Catálogo de Flora Silvestre Protegida del Anexo I del PORN; la asignación de hábitat es una inferencia ecológica (el Anexo no la vincula a una asociación concreta) y las coordenadas son representativas, no de una localización verificada. Confirmar en campo.' review_note
) s
WHERE p.slug = "cabo-cope-puntas-calnegre"
ON DUPLICATE KEY UPDATE common_name = VALUES(common_name), family = VALUES(family), primary_habitat = VALUES(primary_habitat),
    conservation_status = VALUES(conservation_status), description = VALUES(description), identification_tips = VALUES(identification_tips),
    seasonality = VALUES(seasonality), image_url = VALUES(image_url), latitude = VALUES(latitude), longitude = VALUES(longitude),
    rarity_score = VALUES(rarity_score), is_featured = VALUES(is_featured), source = VALUES(source),
    taxon_phylum = VALUES(taxon_phylum), taxon_class = VALUES(taxon_class), taxon_order = VALUES(taxon_order),
    taxon_family = VALUES(taxon_family), taxon_genus = VALUES(taxon_genus), iucn_global = VALUES(iucn_global),
    spain_status = VALUES(spain_status), murcia_status = VALUES(murcia_status), review_note = VALUES(review_note);

-- Vínculo especie-hábitat para la flora protegida añadida desde el Anexo I del PORN.
INSERT IGNORE INTO species_habitats (species_id, habitat_id)
SELECT sp.id, h.id
FROM (
    SELECT 'Chamaerops humilis' scientific_name, 'sabinar-juniperus' habitat_slug
    UNION ALL
    SELECT 'Chamaerops humilis' scientific_name, 'matorral-semiarido' habitat_slug
    UNION ALL
    SELECT 'Cynomorium coccineum' scientific_name, 'matorral-halofilo' habitat_slug
    UNION ALL
    SELECT 'Eragrostis papposa' scientific_name, 'subestepa-thero-brachypodietea' habitat_slug
    UNION ALL
    SELECT 'Erodium sanguis-christi' scientific_name, 'subestepa-thero-brachypodietea' habitat_slug
    UNION ALL
    SELECT 'Lavandula dentata' scientific_name, 'matorral-semiarido' habitat_slug
    UNION ALL
    SELECT 'Lavandula multifida' scientific_name, 'matorral-semiarido' habitat_slug
    UNION ALL
    SELECT 'Leucanthemum decipiens' scientific_name, 'roquedos-casmofiticos' habitat_slug
    UNION ALL
    SELECT 'Leucanthemum decipiens' scientific_name, 'acantilados' habitat_slug
    UNION ALL
    SELECT 'Limonium cossonianum' scientific_name, 'acantilados' habitat_slug
    UNION ALL
    SELECT 'Limonium cossonianum' scientific_name, 'matorral-halofilo' habitat_slug
    UNION ALL
    SELECT 'Osyris lanceolata' scientific_name, 'sabinar-juniperus' habitat_slug
    UNION ALL
    SELECT 'Osyris lanceolata' scientific_name, 'matorral-semiarido' habitat_slug
    UNION ALL
    SELECT 'Quercus coccifera' scientific_name, 'matorral-semiarido' habitat_slug
    UNION ALL
    SELECT 'Quercus coccifera' scientific_name, 'sabinar-juniperus' habitat_slug
    UNION ALL
    SELECT 'Sarcocapnos enneaphylla subsp. saetabensis' scientific_name, 'roquedos-casmofiticos' habitat_slug
    UNION ALL
    SELECT 'Serratula mucronata' scientific_name, 'matorral-semiarido' habitat_slug
) rel
JOIN species sp ON sp.scientific_name = rel.scientific_name
JOIN habitats h ON h.slug = rel.habitat_slug
JOIN parks p ON p.id = sp.park_id AND p.id = h.park_id
WHERE p.slug = "cabo-cope-puntas-calnegre";

-- Fotografías incorporadas desde florasilvestre.es (galería de
-- flora del sureste ibérico) para 13 especies vegetales que carecían de imagen. Las fotos se
-- sirven localmente desde Frontend/Img/species/ (no se hotlinkea). Atribución en el campo source.
-- Uso en prototipo educativo; contrastar la licencia con el autor antes de un uso definitivo.
UPDATE species sp JOIN parks p ON p.id = sp.park_id AND p.slug = "cabo-cope-puntas-calnegre"
SET sp.image_url = 'Img/species/lycium-intricatum.jpg', sp.source = 'Región de Murcia Digital (CARM) - Flora de Cabo Cope y Puntas de Calnegre; Alcaraz Ariza, F.J. ''La Marina de Cope: ¿los últimos días de un paraíso botánico?'', Eubacteria nº5, Universidad de Murcia; Decreto 50/2003 (BORM), Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia; base científica: Sánchez Gómez et al. 2002, Libro Rojo de la Flora Silvestre Protegida de la Región de Murcia; Foto: florasilvestre.es (galería de flora del sureste ibérico)'
WHERE sp.scientific_name = 'Lycium intricatum';
UPDATE species sp JOIN parks p ON p.id = sp.park_id AND p.slug = "cabo-cope-puntas-calnegre"
SET sp.image_url = 'Img/species/caralluma-europaea.jpg', sp.source = 'Lista Roja de la Flora Vascular Española 2008; Decreto 50/2003 (BORM), Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia; base científica: Sánchez Gómez et al. 2002, Libro Rojo de la Flora Silvestre Protegida de la Región de Murcia; Wikipedia; Documento previo del PORN de Calnegre y Cabo Cope (CARM, 2021) - Catálogo Regional de Flora Silvestre Protegida (confirma categoría Vulnerable); Foto: florasilvestre.es (galería de flora del sureste ibérico)'
WHERE sp.scientific_name = 'Caralluma europaea';
UPDATE species sp JOIN parks p ON p.id = sp.park_id AND p.slug = "cabo-cope-puntas-calnegre"
SET sp.image_url = 'Img/species/allium-melananthum.jpg', sp.source = 'Alcaraz Ariza, F.J. ''La Marina de Cope: ¿los últimos días de un paraíso botánico?'', Eubacteria nº5, Universidad de Murcia; Documento previo del PORN de Calnegre y Cabo Cope (CARM, 2021) - Catálogo Regional de Flora Silvestre Protegida (confirma categoría Vulnerable); nombre común alternativo "ajo de flor negra" según el PORN; Foto: florasilvestre.es (galería de flora del sureste ibérico)'
WHERE sp.scientific_name = 'Allium melananthum';
UPDATE species sp JOIN parks p ON p.id = sp.park_id AND p.slug = "cabo-cope-puntas-calnegre"
SET sp.image_url = 'Img/species/salsola-papillosa.jpg', sp.source = 'Alcaraz Ariza, F.J. ''La Marina de Cope: ¿los últimos días de un paraíso botánico?'', Eubacteria nº5, Universidad de Murcia; Decreto 50/2003 (BORM), Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia; base científica: Sánchez Gómez et al. 2002, Libro Rojo de la Flora Silvestre Protegida de la Región de Murcia; Documento previo del PORN de Calnegre y Cabo Cope (CARM, 2021) - Catálogo Regional de Flora Silvestre Protegida (confirma categoría Vulnerable); Foto: florasilvestre.es (galería de flora del sureste ibérico)'
WHERE sp.scientific_name = 'Salsola papillosa';
UPDATE species sp JOIN parks p ON p.id = sp.park_id AND p.slug = "cabo-cope-puntas-calnegre"
SET sp.image_url = 'Img/species/limonium-insigne.jpg', sp.source = 'Alcaraz Ariza, F.J. ''La Marina de Cope: ¿los últimos días de un paraíso botánico?'', Eubacteria nº5, Universidad de Murcia; Foto: florasilvestre.es (galería de flora del sureste ibérico)'
WHERE sp.scientific_name = 'Limonium insigne';
UPDATE species sp JOIN parks p ON p.id = sp.park_id AND p.slug = "cabo-cope-puntas-calnegre"
SET sp.image_url = 'Img/species/notoceras-bicorne.jpg', sp.source = 'Alcaraz Ariza, F.J. ''La Marina de Cope: ¿los últimos días de un paraíso botánico?'', Eubacteria nº5, Universidad de Murcia; Foto: florasilvestre.es (galería de flora del sureste ibérico)'
WHERE sp.scientific_name = 'Notoceras bicorne';
UPDATE species sp JOIN parks p ON p.id = sp.park_id AND p.slug = "cabo-cope-puntas-calnegre"
SET sp.image_url = 'Img/species/teucrium-freynii.jpg', sp.source = 'Alcaraz Ariza, F.J. ''La Marina de Cope: ¿los últimos días de un paraíso botánico?'', Eubacteria nº5, Universidad de Murcia; Foto: florasilvestre.es (galería de flora del sureste ibérico)'
WHERE sp.scientific_name = 'Teucrium freynii';
UPDATE species sp JOIN parks p ON p.id = sp.park_id AND p.slug = "cabo-cope-puntas-calnegre"
SET sp.image_url = 'Img/species/maytenus-senegalensis-europaea.jpg', sp.source = 'Región de Murcia Digital (CARM) - Flora de Cabo Cope y Puntas de Calnegre (mención por nombre común ''arto''); El Medio Natural en Cartagena (urbanismo.cartagena.es), ficha ''Arto - Maytenus senegalensis subsp. europaea''; Documento previo del PORN de Calnegre y Cabo Cope (CARM, 2021) - Catálogo Regional de Flora Silvestre Protegida (confirma categoría Vulnerable); Foto: florasilvestre.es (galería de flora del sureste ibérico)'
WHERE sp.scientific_name = 'Maytenus senegalensis subsp. europaea';
UPDATE species sp JOIN parks p ON p.id = sp.park_id AND p.slug = "cabo-cope-puntas-calnegre"
SET sp.image_url = 'Img/species/citrullus-colocynthis.jpg', sp.source = 'Alcaraz Ariza, F.J. ''La Marina de Cope: ¿los últimos días de un paraíso botánico?'', Eubacteria nº5, Universidad de Murcia; Foto: florasilvestre.es (galería de flora del sureste ibérico)'
WHERE sp.scientific_name = 'Citrullus colocynthis';
UPDATE species sp JOIN parks p ON p.id = sp.park_id AND p.slug = "cabo-cope-puntas-calnegre"
SET sp.image_url = 'Img/species/lafuentea-rotundifolia.jpg', sp.source = 'Documento previo del PORN de Calnegre y Cabo Cope (CARM, Consejería de Agua, Agricultura, Ganadería, Pesca y Medio Ambiente, 2021) - Catálogo Regional de Flora Silvestre Protegida; Foto: florasilvestre.es (galería de flora del sureste ibérico)'
WHERE sp.scientific_name = 'Lafuentea rotundifolia';
UPDATE species sp JOIN parks p ON p.id = sp.park_id AND p.slug = "cabo-cope-puntas-calnegre"
SET sp.image_url = 'Img/species/senecio-flavus.jpg', sp.source = 'Documento previo del PORN de Calnegre y Cabo Cope (CARM, Consejería de Agua, Agricultura, Ganadería, Pesca y Medio Ambiente, 2021) - Catálogo Regional de Flora Silvestre Protegida; Foto: florasilvestre.es (galería de flora del sureste ibérico)'
WHERE sp.scientific_name = 'Senecio flavus';
UPDATE species sp JOIN parks p ON p.id = sp.park_id AND p.slug = "cabo-cope-puntas-calnegre"
SET sp.image_url = 'Img/species/cynomorium-coccineum.jpg', sp.source = 'Anexo I del proyecto de PORN del Parque Regional costero-litoral de Cabo Cope (ANSE / CARM) - Catálogo de Flora Silvestre Protegida (Decreto 50/2003); Foto: florasilvestre.es (galería de flora del sureste ibérico)'
WHERE sp.scientific_name = 'Cynomorium coccineum';
UPDATE species sp JOIN parks p ON p.id = sp.park_id AND p.slug = "cabo-cope-puntas-calnegre"
SET sp.image_url = 'Img/species/lavandula-multifida.jpg', sp.source = 'Anexo I del proyecto de PORN del Parque Regional costero-litoral de Cabo Cope (ANSE / CARM) - Catálogo de Flora Silvestre Protegida (Decreto 50/2003); Foto: florasilvestre.es (galería de flora del sureste ibérico)'
WHERE sp.scientific_name = 'Lavandula multifida';

-- ================================================================================================
-- Cuentas de usuario y progreso por usuario (login del prototipo).
-- Las contraseñas se guardan con hash (password_hash de PHP), nunca en claro.
-- ================================================================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(120),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Progreso por usuario y por parque. payload es un JSON con la misma forma que antes tenía
-- progress.json: { seenSpeciesIds, seenPoiIds, sightings, updatedAt }. Así cada cuenta lleva su
-- propio descubrimiento en cada parque, y el modelo escala a todos los parques de España.
CREATE TABLE IF NOT EXISTS user_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    park_slug VARCHAR(120) NOT NULL,
    payload TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_park (user_id, park_slug)
);
