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
    code VARCHAR(20),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_priority BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (park_id) REFERENCES parks(id) ON DELETE CASCADE,
    UNIQUE KEY unique_habitat_per_park (park_id, code)
);

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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (park_id) REFERENCES parks(id) ON DELETE CASCADE,
    UNIQUE KEY unique_species_per_park (park_id, scientific_name),
    INDEX idx_species_park_kingdom (park_id, kingdom),
    INDEX idx_species_scientific_name (scientific_name)
);

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

INSERT INTO habitats (park_id, code, name, description, is_priority)
SELECT p.id, h.code, h.name, h.description, h.is_priority
FROM parks p
JOIN (
    SELECT '1120' code, 'Praderas de Posidonia oceanica' name, 'marino del parque piloto' description, TRUE is_priority
    UNION ALL
    SELECT '1240' code, 'Acantilados mediterráneos con Limonium' name, 'litoral del parque piloto' description, FALSE is_priority
    UNION ALL
    SELECT '5330' code, 'Matorral termomediterráneo semiárido' name, 'terrestre del parque piloto' description, FALSE is_priority
    UNION ALL
    SELECT '5220' code, 'Matorrales arborescentes de Ziziphus' name, 'terrestre del parque piloto' description, TRUE is_priority
) h
WHERE p.slug = 'cabo-cope-puntas-calnegre'
ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), is_priority = VALUES(is_priority);

INSERT INTO species (park_id, common_name, scientific_name, kingdom, family, primary_habitat, conservation_status, description, identification_tips, seasonality, image_url, latitude, longitude, rarity_score, is_featured)
SELECT p.id, s.common_name, s.scientific_name, s.kingdom, s.family, s.primary_habitat, s.conservation_status, s.description, s.identification_tips, s.seasonality, s.image_url, s.latitude, s.longitude, s.rarity_score, s.is_featured
FROM parks p
JOIN (
    SELECT 'Posidonia oceánica' common_name, 'Posidonia oceanica' scientific_name, 'flora' kingdom, 'Planta marina' family, 'Praderas de Posidonia oceanica' primary_habitat, 'Hábitat prioritario UE' conservation_status, 'Planta marina formadora de praderas submarinas esenciales para la biodiversidad costera y la protección del litoral.' description, 'Hojas largas en forma de cinta; Restos fibrosos acumulados en orilla; Indicadora de aguas bien conservadas' identification_tips, 'Todo el año' seasonality, 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Posidonia_oceanica.jpg/640px-Posidonia_oceanica.jpg' image_url, 37.4912 latitude, -1.4777 longitude, 5 rarity_score, TRUE is_featured
    UNION ALL
    SELECT 'Tortuga mora' common_name, 'Testudo graeca' scientific_name, 'fauna' kingdom, 'Reptil' family, 'Matorral termomediterráneo semiárido' primary_habitat, 'Amenazada' conservation_status, 'Reptil terrestre emblemático de ambientes áridos, matorrales mediterráneos y zonas abiertas del sureste ibérico.' description, 'Caparazón abombado; Actividad en horas templadas; No manipular ni desplazar ejemplares' identification_tips, 'Primavera y otoño' seasonality, 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Testudo_graeca_Lambert_01.jpg/640px-Testudo_graeca_Lambert_01.jpg' image_url, 37.5075 latitude, -1.4422 longitude, 5 rarity_score, TRUE is_featured
    UNION ALL
    SELECT 'Águila perdicera' common_name, 'Aquila fasciata' scientific_name, 'fauna' kingdom, 'Ave rapaz' family, 'Cortados y áreas abiertas' primary_habitat, 'Amenazada' conservation_status, 'Rapaz mediterránea asociada a sierras, cortados y territorios de campeo amplios.' description, 'Silueta grande y vuelo potente; Observar a distancia; Evitar molestias en zonas de nidificación' identification_tips, 'Todo el año' seasonality, 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Bonellis_Eagle_Aquila_fasciata_by_Dr._Raju_Kasambe_DSCN1709_%2810%29.jpg/640px-Bonellis_Eagle_Aquila_fasciata_by_Dr._Raju_Kasambe_DSCN1709_%2810%29.jpg' image_url, 37.5202 latitude, -1.426 longitude, 5 rarity_score, TRUE is_featured
    UNION ALL
    SELECT 'Camachuelo trompetero' common_name, 'Bucanetes githagineus' scientific_name, 'fauna' kingdom, 'Ave esteparia' family, 'Paisaje árido y matorral bajo' primary_habitat, 'Interés especial' conservation_status, 'Ave ligada a paisajes semiáridos, con gran valor como indicador de biodiversidad esteparia.' description, 'Pico robusto; Tonos rosados discretos; Suele moverse en pequeños grupos' identification_tips, 'Primavera y verano' seasonality, 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Bucanetes_githagineus_2.jpg/640px-Bucanetes_githagineus_2.jpg' image_url, 37.5155 latitude, -1.4565 longitude, 4 rarity_score, TRUE is_featured
    UNION ALL
    SELECT 'Sabina negral' common_name, 'Juniperus phoenicea' scientific_name, 'flora' kingdom, 'Arbusto o arbolillo' family, 'Matorral litoral y laderas secas' primary_habitat, 'Interés botánico' conservation_status, 'Conífera mediterránea resistente a viento, sequía y suelos pobres, con poblaciones de interés en Cabo Cope.' description, 'Hojas escamosas; Frutos redondeados; Porte compacto' identification_tips, 'Todo el año' seasonality, 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Juniperus_phoenicea_001.JPG/640px-Juniperus_phoenicea_001.JPG' image_url, 37.5001 latitude, -1.4384 longitude, 4 rarity_score, FALSE is_featured
    UNION ALL
    SELECT 'Azufaifo' common_name, 'Ziziphus lotus' scientific_name, 'flora' kingdom, 'Arbusto espinoso' family, 'Matorrales arborescentes de Ziziphus' primary_habitat, 'Hábitat prioritario UE' conservation_status, 'Arbusto espinoso de ambientes cálidos y secos, importante para refugio de fauna y estructura del paisaje.' description, 'Ramas en zigzag; Espinas visibles; Porte almohadillado' identification_tips, 'Primavera a otoño' seasonality, 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Ziziphus_lotus_%28fruit%29.jpg/640px-Ziziphus_lotus_%28fruit%29.jpg' image_url, 37.5099 latitude, -1.4631 longitude, 4 rarity_score, FALSE is_featured
    UNION ALL
    SELECT 'Cornical' common_name, 'Periploca angustifolia' scientific_name, 'flora' kingdom, 'Arbusto iberoafricano' family, 'Matorral termófilo' primary_habitat, 'Interés botánico' conservation_status, 'Arbusto característico de zonas cálidas del sureste ibérico, con gran interés biogeográfico.' description, 'Hojas estrechas; Frutos alargados; Aspecto leñoso y abierto' identification_tips, 'Floración primaveral' seasonality, 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Periploca_angustifolia_kz1.jpg/640px-Periploca_angustifolia_kz1.jpg' image_url, 37.4967 latitude, -1.4528 longitude, 3 rarity_score, FALSE is_featured
    UNION ALL
    SELECT 'Cormorán moñudo' common_name, 'Gulosus aristotelis' scientific_name, 'fauna' kingdom, 'Ave marina' family, 'Litoral rocoso' primary_habitat, 'Protección especial' conservation_status, 'Ave marina de costas rocosas, islotes y aguas someras donde busca alimento.' description, 'Plumaje oscuro; Nada bajo sobre el agua; Penacho visible en época nupcial' identification_tips, 'Todo el año' seasonality, 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/European_shag_%28Phalacrocorax_aristotelis%29.jpg/640px-European_shag_%28Phalacrocorax_aristotelis%29.jpg' image_url, 37.487 latitude, -1.4714 longitude, 4 rarity_score, FALSE is_featured
) s
WHERE p.slug = 'cabo-cope-puntas-calnegre'
ON DUPLICATE KEY UPDATE common_name = VALUES(common_name), family = VALUES(family), primary_habitat = VALUES(primary_habitat), conservation_status = VALUES(conservation_status), description = VALUES(description), identification_tips = VALUES(identification_tips), seasonality = VALUES(seasonality), image_url = VALUES(image_url), latitude = VALUES(latitude), longitude = VALUES(longitude), rarity_score = VALUES(rarity_score), is_featured = VALUES(is_featured);
