-- ================================================================================================
-- NaturDex · esquema de base de datos (solo DDL)
-- ------------------------------------------------------------------------------------------------
-- Este archivo define ÚNICAMENTE la estructura (CREATE TABLE) del estado actual. No contiene datos
-- ni migraciones. Para una instalación limpia:
--     mysql < Database/schema.sql        (crea la BD y las tablas)
--     mysql < Database/seed.sql          (carga el parque piloto y su catálogo)
-- Para actualizar una instalación antigua a este esquema, ejecuta antes Database/migrations.sql.
-- ================================================================================================
-- El fichero es UTF-8, pero el cliente mysql puede conectar en latin1 (p. ej. al importarlo el
-- entrypoint del contenedor de MySQL): sin esta línea las tildes/ñ se guardarían dobles (mojibake).
SET NAMES utf8mb4;
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
    review_note TEXT,
    -- Audioguía explicativa del hábitat: URL/ruta del fichero de audio y su transcripción
    -- (alternativa textual obligatoria por accesibilidad, WCAG 1.2.1).
    audio_url VARCHAR(500),
    audio_transcript TEXT,
    FOREIGN KEY (park_id) REFERENCES parks(id) ON DELETE CASCADE,
    UNIQUE KEY unique_habitat_per_park (park_id, code),
    UNIQUE KEY unique_habitat_slug_per_park (park_id, slug)
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
    -- Campos de cita/estado de conservación: TEXT (no VARCHAR) porque las atribuciones y los
    -- estados con referencia pueden superar los 500 caracteres. Con MySQL en modo estricto un
    -- VARCHAR corto abortaría la carga del seed en lugar de truncar en silencio.
    source TEXT,
    taxon_phylum VARCHAR(120),
    taxon_class VARCHAR(120),
    taxon_order VARCHAR(120),
    taxon_family VARCHAR(120),
    taxon_genus VARCHAR(120),
    iucn_global TEXT,
    spain_status TEXT,
    murcia_status TEXT,
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
    image_url VARCHAR(500),
    source TEXT,
    is_approx TINYINT(1) NOT NULL DEFAULT 0,
    -- Audioguía explicativa del punto de interés (misma pareja de campos que habitats).
    audio_url VARCHAR(500),
    audio_transcript TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (park_id) REFERENCES parks(id) ON DELETE CASCADE,
    UNIQUE KEY unique_poi_per_park (park_id, slug)
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

-- Cuentas de usuario y progreso por usuario (login del prototipo).
-- Las contraseñas se guardan con hash (password_hash de PHP), nunca en claro.
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(120),
    -- 'user' (por defecto) o 'admin'. Los administradores acceden al panel de administración
    -- (Frontend/admin/ + Backend/Api/admin.php) para editar el contenido ambiental.
    -- Promocionar a mano: UPDATE users SET role='admin' WHERE email='...';
    role VARCHAR(20) NOT NULL DEFAULT 'user',
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
