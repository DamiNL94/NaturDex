-- ================================================================================================
-- NaturDex · datos del catálogo de fuentes IEPNB (DML)
-- ------------------------------------------------------------------------------------------------
-- Carga las 4 bases de datos del IEPNB (https://iepnb.gob.es/) relevantes para NaturDex: CNH21
-- (hábitats), EIDOS (especies), Red Natura 2000 y Espacios Naturales Protegidos (ENP), con sus
-- recursos descargables y, para EIDOS, sus grupos taxonómicos, categorías de amenaza y normativas
-- filtrables. Idempotente (INSERT ... ON DUPLICATE KEY UPDATE), se puede reejecutar sin duplicar.
-- Requiere Database/schema.sql y Database/iepnb_schema.sql ya aplicados.
--     mysql < Database/schema.sql
--     mysql < Database/iepnb_schema.sql
--     mysql < Database/iepnb_seed.sql
-- ================================================================================================
SET NAMES utf8mb4;
USE naturadex;

-- --------------------------------------------------------------------------------------------
-- 1) Las 4 fuentes
-- --------------------------------------------------------------------------------------------
INSERT INTO data_sources (slug, name, organism, contact_email, description, resource_type, coverage, crs, spatial_resolution, update_frequency, hvd_category, inspire_theme, catalog_url, api_url, source_created_on, source_modified_on, naturdex_equivalent, notes)
VALUES
('cnh21', 'Cartografía Nacional de Hábitats 2021 (CNH21)',
 'Subdirección General del Sistema Integrado de Información de la Biodiversidad (SGSIIB), Dirección General Biodiversidad, Bosques y Desertificación, MITECO',
 'buzon-bdatos@miteco.es',
 'Producto homogéneo a nivel estatal que abarca los tipos de hábitats terrestres y marítimo-terrestres. Está basada en información geográfica preexistente coherente con el Mapa Forestal de España (MFE) y el SIGPAC. Doble leyenda: Lista Patrón de los Hábitats presentes en España (LPEH) y Hábitats de Interés Comunitario (HIC, Anexo I Directiva 92/43/CEE). Genera 2 productos derivados: CNH21_LPEH (todos los polígonos, solo contenido LPEH) y CNH21_HIC (solo polígonos/contenidos de interés comunitario). Elaborada principalmente con fines estadísticos; el propio MITECO recomienda complementar los HIC con la información de las comunidades autónomas. Financiada por la Unión Europea (NextGenerationEU, PRTR, C04-L01-H66).',
 'Conjunto de datos espacial', 'España (península, Baleares y Canarias)',
 'EPSG:25830 (ETRS89 UTM 30N) en península/Baleares; EPSG:32628 (WGS84 UTM 28N) en Canarias',
 NULL, NULL, 'Observación de la Tierra y medio ambiente', 'Medio ambiente / Hábitats y biotopos (HB)',
 'https://iepnb.gob.es/catalogo/dataset/2a7fc624-0d69-4788-9bdd-49ee01fb1fe9', NULL,
 '2026-06-29', '2026-06-29',
 'Sustituye/actualiza el shapefile INB_Habitat30_ETRS89_H30 que cita geo/README.md como fuente de 11 de los 15 hábitats de habitats.geojson. Pendiente comprobar si los 4 hábitats "a revisar" (fuente CARM 2020) ya aparecen en esta versión 2021.',
 NULL),

('eidos', 'Inventario de Especies Silvestres: EIDOS',
 'Ministerio para la Transición Ecológica y el Reto Demográfico (MITECO)',
 'buzon-bdatos@miteco.es',
 'Base de datos oficial no restringida sobre las especies silvestres de flora y fauna presentes en España, recopilada a partir de Atlas, Libros Rojos, catálogos, inventarios e informes del MITECO. +75.000 registros en 12 grupos taxonómicos. Cada ficha incluye taxonomía completa, sinonimia, nombre común en 7 idiomas, ámbito (marino/terrestre/ambos), origen (nativa/no nativa/indeterminado), descripción con fuente, y estado legal y de conservación desglosado por LESRPE y UICN en 4 ámbitos territoriales (Canarias, España, Península, Mundial). Permite descargar ficha y cartografía de distribución por especie.',
 'Base de datos', 'España (incluye desglose Canarias/Península)',
 NULL, NULL, 'Continuamente actualizado', 'Distribución de las especies', 'Biota',
 'https://iepnb.gob.es/catalogo/dataset/eidos', 'https://iepnb.gob.es/recursos/servicios-interoperables/apirest-eidos',
 '2025-05-26', '2026-06-25',
 'Fuente candidata para verificar/actualizar de forma oficial los ~78 registros de species (34 fauna + 44 flora) de Database/seed.sql, hoy basados en fuentes dispersas (regmurcia.com, Lista Roja 2008, IUCN Red List, Decreto 50/2003 CARM). Los campos iucn_global/spain_status/murcia_status de la tabla species se corresponden con los 4 ámbitos UICN de EIDOS.',
 'Ficha de ejemplo consultada: /areas-tematicas/especies-silvestres/eidos/33007/alaudala-rufescens-vieillot-1819 (Alaudala rufescens, terrera marismeña).'),

('red_natura_2000', 'Espacios Protegidos de la Red Natura 2000',
 'MITECO (Área de Banco de Datos de la Naturaleza)', 'buzon-bdatos@miteco.es',
 'Red ecológica europea de áreas de conservación de la biodiversidad: Zonas Especiales de Conservación (ZEC/LIC, Directiva Hábitats 92/43/CEE) y Zonas de Especial Protección para las Aves (ZEPA, Directiva Aves 2009/147/CE). Incluye fichas HTML por ZEC/LIC y por ZEPA, diccionario de campos, tabla resumen y base de datos completa (CNTRYES, formato Access).',
 'Conjunto de datos espacial', 'España', 'EPSG:3857 (dataset); exportable directamente a GeoJSON sin reproyectar',
 '1:50.000', 'Continuamente actualizado', 'Lugares protegidos', 'Biota',
 'https://iepnb.gob.es/catalogo/dataset/dc7a3014-cd9a-51b8-ad62-7aab55afecdd', NULL,
 '2021-07-21', '2026-06-25',
 'Alternativa nacional a la fuente ArcGIS del IMIDA/CARM que usa hoy lic.geojson y zepa.geojson (que requiere reproyectar desde EPSG:25830). Permite contrastar ES6200031 (Cabo Cope), ES6200012 (Calnegre) y ES0000261 (ZEPA Almenara-Moreras-Cabo Cope).',
 'Formatos de descarga directa: WMS, WFS, SHP, GeoJSON, KMZ, GML. También ofrece una API de "datos de alto valor" (HVD).'),

('enp', 'Espacios Naturales Protegidos (ENP)',
 'Área de Banco de Datos de la Naturaleza, Dirección General Biodiversidad, Bosques y Desertificación, MITECO', 'buzon-bdatos@miteco.es',
 'Servicio Web de Mapas de los Espacios Naturales Protegidos declarados conforme a la Ley 42/2007 (Parques, Reservas Naturales, Áreas Marinas Protegidas, Monumentos Naturales, Paisajes Protegidos) y a la normativa autonómica (+45 figuras de protección posibles en total), complementado con el Common Database on Designated Areas (CDDA) de la Agencia Europea de Medio Ambiente.',
 'Conjunto de datos espacial', 'España',
 'EPSG:4326 (WGS84) nativo, además de EPSG:4230/4258 y varios husos UTM (25828-25831, 23028-23031, 32628-32631)',
 '1:50.000', 'Anual (revisión por altas/bajas/reclasificaciones autonómicas)', 'Lugares protegidos', 'Biota',
 'https://iepnb.gob.es/catalogo/dataset/408ec0c0-7823-5c91-9f72-8c06e3df8b9e', 'https://wms.mapama.gob.es/sig/Biodiversidad/ENP/wms.aspx',
 '2021-07-21', '2026-06-25',
 'Alternativa nacional al límite del Parque Regional (parque-regional.geojson) que hoy se descarga del servicio ArcGIS del IMIDA; permite contrastar la superficie oficial de 2.665 ha (Ley 4/1992) contra el registro estatal.',
 'Identificador INSPIRE: ESMAGRAMAWMSENP20101220.')
ON DUPLICATE KEY UPDATE
    name = VALUES(name), organism = VALUES(organism), contact_email = VALUES(contact_email),
    description = VALUES(description), resource_type = VALUES(resource_type), coverage = VALUES(coverage),
    crs = VALUES(crs), spatial_resolution = VALUES(spatial_resolution), update_frequency = VALUES(update_frequency),
    hvd_category = VALUES(hvd_category), inspire_theme = VALUES(inspire_theme), catalog_url = VALUES(catalog_url),
    api_url = VALUES(api_url), source_created_on = VALUES(source_created_on), source_modified_on = VALUES(source_modified_on),
    naturdex_equivalent = VALUES(naturdex_equivalent), notes = VALUES(notes), updated_at = CURRENT_TIMESTAMP;

-- --------------------------------------------------------------------------------------------
-- 2) Recursos/formatos descargables de cada fuente
-- --------------------------------------------------------------------------------------------
INSERT INTO data_source_resources (data_source_id, format, resource_name, resource_description, resource_url)
SELECT ds.id, r.format, r.resource_name, r.resource_description, r.resource_url
FROM data_sources ds
JOIN (
    SELECT 'cnh21' src, 'HTML' format, 'Distribución HTML' resource_name, 'Visor/base de datos de la Cartografía Nacional de Hábitats 2021' resource_description, NULL resource_url
) r ON ds.slug = r.src
UNION ALL
SELECT ds.id, r.format, r.resource_name, r.resource_description, r.resource_url
FROM data_sources ds
JOIN (
    SELECT 'eidos' src, 'HTML' format, 'Inventario de Especies Silvestres: EIDOS' resource_name, 'Buscador y ficha individual por especie' resource_description, 'https://iepnb.gob.es/areas-tematicas/especies-silvestres/eidos' resource_url
    UNION ALL
    SELECT 'eidos', 'WMS', 'WMS EIDOS', 'Web Map Service de distribución de especies', NULL
    UNION ALL
    SELECT 'eidos', 'WFS', 'WFS EIDOS', 'Web Feature Service de distribución de especies', NULL
    UNION ALL
    SELECT 'eidos', 'API REST', 'API REST EIDOS', 'API REST (OpenAPI 2.0) de la taxonomía de especies silvestres, formato JSON', 'https://iepnb.gob.es/recursos/servicios-interoperables/apirest-eidos'
) r ON ds.slug = r.src
UNION ALL
SELECT ds.id, r.format, r.resource_name, r.resource_description, r.resource_url
FROM data_sources ds
JOIN (
    SELECT 'red_natura_2000' src, 'WMS' format, 'Servicio Web de Mapas (WMS)' resource_name, 'Capa geoserver: rn2000' resource_description, NULL resource_url
    UNION ALL
    SELECT 'red_natura_2000', 'WFS', 'Servicio Web de Mapas (WFS)', 'Capa geoserver: rn2000', NULL
    UNION ALL
    SELECT 'red_natura_2000', 'SHP', 'Cartografía Red Natura 2000 (Shapefile)', NULL, NULL
    UNION ALL
    SELECT 'red_natura_2000', 'GeoJSON', 'Cartografía Red Natura 2000 (GeoJSON)', NULL, NULL
    UNION ALL
    SELECT 'red_natura_2000', 'KMZ', 'Cartografía Red Natura 2000 (Google Earth)', NULL, NULL
    UNION ALL
    SELECT 'red_natura_2000', 'GML', 'Cartografía Red Natura 2000 (GML)', NULL, NULL
    UNION ALL
    SELECT 'red_natura_2000', 'PDF', 'Mapa de la Red Natura', NULL, NULL
    UNION ALL
    SELECT 'red_natura_2000', 'HTML', 'Fichas ZEC / LIC', 'Fichas de las Zonas Especiales de Conservación y Lugares de Importancia Comunitaria', NULL
    UNION ALL
    SELECT 'red_natura_2000', 'HTML', 'Fichas ZEPA', 'Fichas de las Zonas de Especial Protección para las Aves', NULL
    UNION ALL
    SELECT 'red_natura_2000', 'XLSX', 'Diccionario de datos', 'Descripción de los campos de las capas' , NULL
    UNION ALL
    SELECT 'red_natura_2000', 'XLSX', 'Tabla resumen de la Red Natura 2000', NULL, NULL
    UNION ALL
    SELECT 'red_natura_2000', 'accdb', 'Base de datos (CNTRYES)', 'Base de datos de los espacios protegidos Red Natura 2000 de España', NULL
    UNION ALL
    SELECT 'red_natura_2000', 'API', 'API de datos de alto valor Red Natura 2000', 'API que sirve los datos conforme al reglamento de datos de alto valor (HVD)', NULL
) r ON ds.slug = r.src
UNION ALL
SELECT ds.id, r.format, r.resource_name, r.resource_description, r.resource_url
FROM data_sources ds
JOIN (
    SELECT 'enp' src, 'WMS' format, 'Servicio Web de Mapas (WMS)' resource_name, 'Capa geoserver: enp; URL estatal: https://wms.mapama.gob.es/sig/Biodiversidad/ENP/wms.aspx' resource_description, 'https://wms.mapama.gob.es/sig/Biodiversidad/ENP/wms.aspx' resource_url
    UNION ALL
    SELECT 'enp', 'WFS', 'Servicio Web de Mapas (WFS)', 'Capa geoserver: enp', NULL
    UNION ALL
    SELECT 'enp', 'XML', 'Descripción de los Campos', 'XML con la descripción de los campos de Espacios Naturales Protegidos', NULL
    UNION ALL
    SELECT 'enp', 'SHP', 'Shapefile de los Espacios Protegidos Naturales', NULL, NULL
    UNION ALL
    SELECT 'enp', 'KMZ', 'KMZ de los Espacios Protegidos Naturales', NULL, NULL
    UNION ALL
    SELECT 'enp', 'GeoJSON', 'Geojson de los Espacios Protegidos Naturales', NULL, NULL
) r ON ds.slug = r.src
ON DUPLICATE KEY UPDATE resource_description = VALUES(resource_description), resource_url = VALUES(resource_url);

-- --------------------------------------------------------------------------------------------
-- 3) EIDOS · grupos taxonómicos (filtro "Grupo taxonómico" del buscador de especies)
-- --------------------------------------------------------------------------------------------
INSERT INTO eidos_taxonomic_groups (data_source_id, group_name, species_count)
SELECT ds.id, g.group_name, g.species_count
FROM data_sources ds
JOIN (
    SELECT 'Algas' group_name, 1130 species_count
    UNION ALL SELECT 'Anfibios', 110
    UNION ALL SELECT 'Ascidios', 270
    UNION ALL SELECT 'Aves', 2066
    UNION ALL SELECT 'Cromistas y Bacterias', 1072
    UNION ALL SELECT 'Hongos', 7119
    UNION ALL SELECT 'Invertebrados', 47212
    UNION ALL SELECT 'Mamíferos', 620
    UNION ALL SELECT 'Peces', 2055
    UNION ALL SELECT 'Plantas no vasculares', 1377
    UNION ALL SELECT 'Plantas vasculares', 11607
    UNION ALL SELECT 'Reptiles', 507
) g ON ds.slug = 'eidos'
ON DUPLICATE KEY UPDATE species_count = VALUES(species_count);

-- --------------------------------------------------------------------------------------------
-- 4) EIDOS · categorías de amenaza / estado de conservación (filtro "Categorías de amenaza")
-- --------------------------------------------------------------------------------------------
INSERT INTO eidos_conservation_categories (data_source_id, code, label, category_scheme)
SELECT ds.id, c.code, c.label, c.category_scheme
FROM data_sources ds
JOIN (
    SELECT 'LC' code, 'Preocupación menor' label, 'UICN' category_scheme
    UNION ALL SELECT 'NT', 'Casi amenazado', 'UICN'
    UNION ALL SELECT 'VU', 'Vulnerable', 'UICN'
    UNION ALL SELECT 'EN', 'En peligro', 'UICN'
    UNION ALL SELECT 'CR', 'En peligro crítico', 'UICN'
    UNION ALL SELECT 'EW', 'Extinto en estado silvestre', 'UICN'
    UNION ALL SELECT 'EX', 'Extinto', 'UICN'
    UNION ALL SELECT 'DD', 'Datos insuficientes', 'UICN'
    UNION ALL SELECT 'NE', 'No evaluado', 'UICN'
    UNION ALL SELECT 'RE', 'Extinto regionalmente', 'UICN'
    UNION ALL SELECT 'FV', 'Favorable', 'Directiva Hábitats'
    UNION ALL SELECT 'U1', 'Desfavorable-inadecuado', 'Directiva Hábitats'
    UNION ALL SELECT 'U2', 'Desfavorable-malo', 'Directiva Hábitats'
    UNION ALL SELECT 'XX', 'Desconocido', 'Directiva Hábitats'
) c ON ds.slug = 'eidos'
ON DUPLICATE KEY UPDATE label = VALUES(label), category_scheme = VALUES(category_scheme);

-- --------------------------------------------------------------------------------------------
-- 5) EIDOS · normativas filtrables (filtro "Normativa" del buscador de especies)
-- --------------------------------------------------------------------------------------------
INSERT INTO eidos_legal_frameworks (data_source_id, name)
SELECT ds.id, f.name
FROM data_sources ds
JOIN (
    SELECT 'Listado de Especies Silvestres en Régimen de Protección Especial y Catálogo español de especies amenazadas (RD 139/2011)' name
    UNION ALL SELECT 'Directiva 92/43/CEE (Directiva Hábitats)'
    UNION ALL SELECT 'Directiva 2009/147/CE (Directiva Aves)'
    UNION ALL SELECT 'Catálogo español de especies exóticas invasoras (RD 630/2013)'
    UNION ALL SELECT 'Lista de especies exóticas invasoras preocupantes para la Unión (Reglamento (UE) nº 1143/2014)'
) f ON ds.slug = 'eidos'
ON DUPLICATE KEY UPDATE name = VALUES(name);
