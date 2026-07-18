-- ================================================================================================
-- NaturDex · catálogo de fuentes oficiales IEPNB (solo DDL)
-- ------------------------------------------------------------------------------------------------
-- Añade al esquema de naturadex (Database/schema.sql) las tablas que documentan las bases de datos
-- del Inventario Español del Patrimonio Natural y la Biodiversidad (IEPNB, https://iepnb.gob.es/,
-- MITECO) que corresponden a lo que NaturDex ya usa o podría usar: hábitats (CNH21), especies
-- (EIDOS), Red Natura 2000 y Espacios Naturales Protegidos (ENP). Ver también
-- Frontend/Data/parks/murcia/cabo-cope-puntas-calnegre/geo/FUENTES_IEPNB.md para la ficha en
-- prosa de cada fuente.
--
-- Requiere el esquema base ya creado (Database/schema.sql). Instalación:
--     mysql < Database/schema.sql
--     mysql < Database/iepnb_schema.sql
--     mysql < Database/iepnb_seed.sql
-- ================================================================================================
SET NAMES utf8mb4;
USE naturadex;

-- Una fila por cada base de datos/conjunto de datos del IEPNB relevante para NaturDex. Es un
-- catálogo de referencia (no datos de especies/hábitats en sí), pensado para saber qué fuente
-- oficial sustituye o complementa cada capa que ya usa el proyecto.
CREATE TABLE IF NOT EXISTS data_sources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(60) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    portal VARCHAR(255) NOT NULL DEFAULT 'IEPNB (iepnb.gob.es)',
    organism VARCHAR(255),
    contact_email VARCHAR(255),
    description TEXT,
    -- 'Conjunto de datos espacial' | 'Base de datos', tal cual lo etiqueta la ficha del catálogo.
    resource_type VARCHAR(120),
    coverage VARCHAR(255),
    crs VARCHAR(255),
    spatial_resolution VARCHAR(60),
    update_frequency VARCHAR(120),
    -- Categoría del conjunto de alto valor (HVD) y tema INSPIRE, tal cual figuran en la ficha.
    hvd_category VARCHAR(120),
    inspire_theme VARCHAR(120),
    catalog_url VARCHAR(500),
    api_url VARCHAR(500),
    -- Fechas de creación/última modificación tal cual las declara la propia ficha del catálogo
    -- IEPNB (no confundir con created_at/updated_at, que son de esta tabla local).
    source_created_on DATE,
    source_modified_on DATE,
    -- Qué capa, tabla o fichero de NaturDex sustituye o complementa esta fuente, y por qué.
    naturdex_equivalent TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Recursos/formatos descargables de cada fuente (lo que la ficha del catálogo IEPNB lista bajo
-- "Datos y Recursos": WMS, WFS, SHP, GeoJSON, KMZ, GML, API REST, fichas HTML, diccionarios...).
-- Relación uno-a-muchos: una fuente puede tener varios recursos.
CREATE TABLE IF NOT EXISTS data_source_resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    data_source_id INT NOT NULL,
    format VARCHAR(40) NOT NULL,
    resource_name VARCHAR(255) NOT NULL,
    resource_description TEXT,
    resource_url VARCHAR(500),
    FOREIGN KEY (data_source_id) REFERENCES data_sources(id) ON DELETE CASCADE,
    UNIQUE KEY unique_resource_per_source (data_source_id, format, resource_name)
);

-- Grupos taxonómicos de EIDOS con su volumen de registros (filtro "Grupo taxonómico" del buscador
-- de especies). Solo aplica a la fuente 'eidos'; se referencia por FK en vez de hardcodear el slug.
CREATE TABLE IF NOT EXISTS eidos_taxonomic_groups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    data_source_id INT NOT NULL,
    group_name VARCHAR(80) NOT NULL,
    species_count INT NOT NULL,
    FOREIGN KEY (data_source_id) REFERENCES data_sources(id) ON DELETE CASCADE,
    UNIQUE KEY unique_group_per_source (data_source_id, group_name)
);

-- Categorías de amenaza/estado de conservación que EIDOS permite filtrar por especie: códigos
-- UICN (LC..EX/DD/NE/RE) y códigos de estado de conservación de la Directiva Hábitats (FV/U1/U2/XX).
CREATE TABLE IF NOT EXISTS eidos_conservation_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    data_source_id INT NOT NULL,
    code VARCHAR(10) NOT NULL,
    label VARCHAR(120) NOT NULL,
    -- 'UICN' o 'Directiva Hábitats', para poder separar ambas escalas al consultar.
    category_scheme VARCHAR(40) NOT NULL,
    FOREIGN KEY (data_source_id) REFERENCES data_sources(id) ON DELETE CASCADE,
    UNIQUE KEY unique_category_per_source (data_source_id, code)
);

-- Normativas que EIDOS permite usar como filtro ("Normativa" del buscador): régimen legal bajo el
-- que se cataloga cada especie (LESRPE/CEEA, directivas europeas, catálogos de especies exóticas).
CREATE TABLE IF NOT EXISTS eidos_legal_frameworks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    data_source_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    FOREIGN KEY (data_source_id) REFERENCES data_sources(id) ON DELETE CASCADE,
    UNIQUE KEY unique_framework_per_source (data_source_id, name)
);
