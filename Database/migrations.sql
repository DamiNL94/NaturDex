-- ================================================================================================
-- NaturDex · migraciones (solo para actualizar instalaciones EXISTENTES)
-- ------------------------------------------------------------------------------------------------
-- En una instalación limpia NO hace falta: Database/schema.sql ya crea las tablas con todas estas
-- columnas. Este archivo solo sirve para poner al día una base de datos creada con un esquema
-- anterior.
--
-- Es idempotente: se puede ejecutar varias veces seguidas sin error. La comprobación de existencia
-- se hace con dos procedimientos auxiliares (naturdex_add_column / naturdex_add_index) que consultan
-- information_schema antes de cada ALTER, porque Oracle MySQL 8.4 (el objetivo del proyecto,
-- contenedor mysql:8.4) NO soporta la sintaxis `ADD COLUMN/INDEX IF NOT EXISTS` de MariaDB (aborta
-- con ERROR 1064). Los `MODIFY COLUMN` son idempotentes por sí mismos (reejecutarlos no tiene efecto).
--
-- Requiere Oracle MySQL 8.0+ (probado en 8.4) o MariaDB 10.5+.
--     mysql < Database/migrations.sql
-- ================================================================================================
-- El fichero es UTF-8, pero el cliente mysql puede conectar en latin1 (es lo que hace `mysql <
-- fichero` sin más). Sin esta línea, cualquier texto con tilde o ñ que estas migraciones INSERTEN se
-- guarda doblemente codificado (mojibake) y nadie se entera hasta que alguien lo lee. Es la misma
-- línea, y por el mismo motivo, que abre Database/schema.sql.
SET NAMES utf8mb4;
USE naturadex;

-- ------------------------------------------------------------------------------------------------
-- Procedimientos auxiliares idempotentes. Reemplazan al `IF NOT EXISTS` de MariaDB comprobando
-- information_schema y ejecutando el ALTER solo si falta la columna/índice. Se borran al final.
-- ------------------------------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS naturdex_add_column;
DROP PROCEDURE IF EXISTS naturdex_add_index;

DELIMITER $$

-- Añade una columna solo si no existe ya en la tabla (dentro de la BD actual, DATABASE()).
--   p_table:      nombre de la tabla
--   p_column:     nombre de la columna
--   p_definition: tipo y modificadores, p. ej. 'VARCHAR(60) NULL' o 'TINYINT(1) NOT NULL DEFAULT 0'
CREATE PROCEDURE naturdex_add_column(
    IN p_table VARCHAR(64),
    IN p_column VARCHAR(64),
    IN p_definition TEXT
)
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name   = p_table
          AND column_name  = p_column
    ) THEN
        SET @ddl = CONCAT('ALTER TABLE `', p_table, '` ADD COLUMN `', p_column, '` ', p_definition);
        PREPARE stmt FROM @ddl;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END$$

-- Añade un índice (o índice UNIQUE) solo si no existe ya con ese nombre en la tabla.
--   p_table:      nombre de la tabla
--   p_index:      nombre del índice (el que se comprueba en information_schema.statistics)
--   p_definition: cláusula ADD completa, p. ej. 'UNIQUE INDEX unique_x (a, b)' o 'INDEX idx_y (c)'
CREATE PROCEDURE naturdex_add_index(
    IN p_table VARCHAR(64),
    IN p_index VARCHAR(64),
    IN p_definition TEXT
)
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.statistics
        WHERE table_schema = DATABASE()
          AND table_name   = p_table
          AND index_name   = p_index
    ) THEN
        SET @ddl = CONCAT('ALTER TABLE `', p_table, '` ADD ', p_definition);
        PREPARE stmt FROM @ddl;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END$$

DELIMITER ;

-- ------------------------------------------------------------------------------------------------
-- Geolocalización, color y nota de revisión de hábitats (añadidos tras el esquema inicial).
-- ------------------------------------------------------------------------------------------------
CALL naturdex_add_column('habitats', 'slug',         'VARCHAR(60) NULL');
CALL naturdex_add_column('habitats', 'habitat_type', 'VARCHAR(60) NULL');
CALL naturdex_add_column('habitats', 'latitude',     'DECIMAL(10,6) NULL');
CALL naturdex_add_column('habitats', 'longitude',    'DECIMAL(10,6) NULL');
CALL naturdex_add_column('habitats', 'color',        'VARCHAR(20) NULL');
CALL naturdex_add_column('habitats', 'review_note',  'TEXT NULL');
CALL naturdex_add_index ('habitats', 'unique_habitat_slug_per_park',
                         'UNIQUE INDEX unique_habitat_slug_per_park (park_id, slug)');

-- Foto, cita de fuente y aviso de coordenada aproximada por punto de interés.
CALL naturdex_add_column('points_of_interest', 'image_url', 'VARCHAR(500) NULL');
CALL naturdex_add_column('points_of_interest', 'source',    'VARCHAR(500) NULL');
CALL naturdex_add_column('points_of_interest', 'is_approx', 'TINYINT(1) NOT NULL DEFAULT 0');

-- Rol de usuario para el panel de administración ('user' por defecto, 'admin' para editar
-- contenido). Promocionar a mano: UPDATE users SET role='admin' WHERE email='...';
CALL naturdex_add_column('users', 'role', "VARCHAR(20) NOT NULL DEFAULT 'user'");

-- Audioguías explicativas (accesibilidad UNE-EN 301549): audio + transcripción por hábitat y por
-- punto de interés. Las rutas (senderos) llevan su audio en las propiedades del trails.geojson.
CALL naturdex_add_column('habitats',           'audio_url',        'VARCHAR(500) NULL');
CALL naturdex_add_column('habitats',           'audio_transcript', 'TEXT NULL');
CALL naturdex_add_column('points_of_interest', 'audio_url',        'VARCHAR(500) NULL');
CALL naturdex_add_column('points_of_interest', 'audio_transcript', 'TEXT NULL');

-- ------------------------------------------------------------------------------------------------
-- Enriquecimiento del catálogo nacional (fuentes oficiales EIDOS/GBIF + HIC/fitosociología).
--  · hábitats: subtipos HIC y asociación fitosociológica (JSON) del dato MITECO/CNH21.
--  · species: claves maestras de reconciliación taxonómica — eidos_taxonid (IEPNB) y
--    gbif_species_key (GBIF). Índices NO UNIQUE (una misma clave puede repetirse entre parques).
--  · species_habitats: evidencia del vínculo (caracteristica / observada_gbif) y nº de ocurrencias
--    GBIF que lo respaldan. Ningún dato oficial afirma "especie X vive en polígono Y": es derivado.
-- ------------------------------------------------------------------------------------------------
CALL naturdex_add_column('habitats', 'hic_subtipos',   'JSON NULL');
CALL naturdex_add_column('habitats', 'fitosociologia', 'JSON NULL');

CALL naturdex_add_column('species', 'eidos_taxonid',    'INT NULL');
CALL naturdex_add_column('species', 'gbif_species_key', 'BIGINT NULL');
CALL naturdex_add_index ('species', 'idx_species_eidos_taxonid',
                         'INDEX idx_species_eidos_taxonid (eidos_taxonid)');
CALL naturdex_add_index ('species', 'idx_species_gbif_key',
                         'INDEX idx_species_gbif_key (gbif_species_key)');

CALL naturdex_add_column('species_habitats', 'evidence',         'VARCHAR(40) NULL');
CALL naturdex_add_column('species_habitats', 'gbif_occurrences', 'INT NULL');

-- Aves de la ZEPA (Red Natura 2000): codigo del espacio ZEPA cuya lista oficial (EEA/BISE) incluye
-- el ave. NULL = no es ave de la ZEPA. Las aves van a un apartado propio de parque, no a habitats.
CALL naturdex_add_column('species', 'zepa_site_code', 'VARCHAR(20) NULL');

-- Foto del hábitat en la BD. Antes la imagen del hábitat se resolvía solo por convención de archivo
-- local (Img/habitats/<slug>.jpg); ahora puede guardarse una URL externa (Wikimedia Commons) en la
-- BD, que el export prioriza sobre la ruta local si está presente.
CALL naturdex_add_column('habitats', 'image_url', 'VARCHAR(500) NULL');

-- Atribución de la foto de especie (autor + licencia + fuente). Necesaria para citar correctamente
-- las imágenes de GBIF/iNaturalist/Wikimedia (CC-BY / CC-BY-SA / CC-BY-NC).
CALL naturdex_add_column('species', 'image_attribution', 'VARCHAR(300) NULL');

-- Lo mismo para la foto del hábitat, que hasta ahora se guardaba sin autor ni licencia. `image_note`
-- explica con qué especie diagnóstica se ilustra el hábitat (la portada no es una vista general del
-- hábitat, sino una planta concreta que lo caracteriza). Lo rellena
-- Tools/catalogo-nacional/habitat-images.js.
CALL naturdex_add_column('habitats', 'image_attribution', 'VARCHAR(300) NULL');
CALL naturdex_add_column('habitats', 'image_note', 'VARCHAR(400) NULL');

-- Visibilidad en el catálogo público: FALSE oculta la especie (poca evidencia GBIF y sin figura en
-- ningún catálogo/anexo oficial) sin borrar el dato. DEFAULT TRUE mantiene visibles todas las
-- especies ya cargadas. Ver Frontend/Js/data.js `applyVisibility`.
CALL naturdex_add_column('species', 'is_visible', 'BOOLEAN NOT NULL DEFAULT TRUE');

-- ------------------------------------------------------------------------------------------------
-- Trazabilidad de la rareza y del texto (2026-08-11)
--
-- Cierra tres campos que la app servía sin decir de dónde salían:
--
--   · `rarity_score` era «criterio propio 1–5», puesto a ojo ficha a ficha. Ahora se deriva de la
--     categoría legal estatal y `rarity_basis` guarda la figura que lo justifica. La migración de
--     las 552 fichas del catálogo movió 349 de tramo, y el reparto viejo→nuevo no tenía ninguna
--     correlación: 156 pasaron de 2 a 1 y 27 estaban en tramo 4 —umbral de destacada— sin figura
--     de protección alguna detrás.
--   · `rarity_local` es el tramo que de verdad describe lo excepcional que es la especie AQUÍ, y el
--     que gobierna las estrellas. El estatal solo no sirve: manda casi todo al mismo cajón.
--   · `description_source` distingue las descripciones que sirve EIDOS de las redactadas a mano.
--
-- Todas admiten NULL a propósito: NULL significa «sin migrar / sin trazar», que es una deuda que se
-- cuenta, no un valor por defecto. Aditivas: una instalación antigua sigue funcionando sin ellas.
-- ------------------------------------------------------------------------------------------------
CALL naturdex_add_column('species', 'rarity_basis', 'JSON NULL');
CALL naturdex_add_column('species', 'rarity_local', 'TINYINT UNSIGNED NULL');
CALL naturdex_add_column('species', 'rarity_local_basis', 'JSON NULL');
CALL naturdex_add_column('species', 'hidden_reason', 'TEXT NULL');
CALL naturdex_add_column('species', 'description_source', 'TEXT NULL');

-- ------------------------------------------------------------------------------------------------
-- Fenología del ave (pestaña «Aves migratorias»).
--
-- `is_migratory` la deriva Tools/lib/fenologia.js del tipo de población que declara el Formulario
-- Normalizado de Datos del sitio Red Natura 2000, y `site_presence` guarda la cita que lo sostiene.
-- Antes de estas columnas la app clasificaba por `zepa_site_code`, que solo dice que el formulario
-- nombra al ave: 154 aves de población PERMANENTE salían rotuladas «Ave migratoria» en su ficha y
-- contadas en la barra de progreso del mismo nombre.
--
-- NULL es un estado con significado: ningún formulario nombra a esa ave (591 de las 1.150 fichas
-- de ave del catálogo, incluidos los cuatro espacios cuyo FND no lista ni un ave). No es «no es
-- migratoria»; es que no hay fuente. Aditivas: una instalación antigua sigue funcionando sin ellas.
-- ------------------------------------------------------------------------------------------------
CALL naturdex_add_column('species', 'is_migratory', 'BOOLEAN NULL');
CALL naturdex_add_column('species', 'site_presence', 'JSON NULL');

-- ------------------------------------------------------------------------------------------------
-- Campos de cita/estado a TEXT: las atribuciones y los estados de conservación con referencia
-- pueden superar los 500 caracteres. En MySQL con modo estricto (STRICT_TRANS_TABLES, por defecto
-- en 8.0) un VARCHAR corto ABORTA la carga del seed en lugar de truncar en silencio como hace la
-- configuración laxa de XAMPP. MODIFY es idempotente (se puede reejecutar sin efecto).
-- ------------------------------------------------------------------------------------------------
ALTER TABLE species
    MODIFY COLUMN source TEXT,
    MODIFY COLUMN iucn_global TEXT,
    MODIFY COLUMN spain_status TEXT,
    MODIFY COLUMN murcia_status TEXT;
ALTER TABLE points_of_interest
    MODIFY COLUMN source TEXT;

-- Especies exóticas invasoras (RD 630/2013) por CCAA. Tabla nueva e independiente.
CREATE TABLE IF NOT EXISTS especies_invasoras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    scientific_name VARCHAR(255) NOT NULL,
    common_name VARCHAR(255),
    taxon_group VARCHAR(80),
    kingdom ENUM('flora','fauna','fungi','other') NOT NULL DEFAULT 'other',
    ccaa VARCHAR(120) NOT NULL,
    description TEXT,
    origin TEXT,
    habitat TEXT,
    impact TEXT,
    pathway TEXT,
    catalogo VARCHAR(120),
    eidos_taxonid INT,
    gbif_species_key BIGINT,
    gbif_occurrences INT,
    image_url VARCHAR(500),
    image_attribution VARCHAR(300),
    source TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_invasora_ccaa (scientific_name, ccaa),
    INDEX idx_invasora_ccaa (ccaa)
);
-- Para instalaciones que ya tenían la tabla sin estas columnas (procs aux definidos arriba).
CALL naturdex_add_column('especies_invasoras', 'origin',            'TEXT NULL');
CALL naturdex_add_column('especies_invasoras', 'habitat',           'TEXT NULL');
CALL naturdex_add_column('especies_invasoras', 'image_attribution', 'VARCHAR(300) NULL');
-- Impacto y vía de entrada: las rellena Database/invasoras-contenido.sql (generado desde EIDOS).
CALL naturdex_add_column('especies_invasoras', 'impact',            'TEXT NULL');
CALL naturdex_add_column('especies_invasoras', 'pathway',           'TEXT NULL');

-- Glosario divulgativo nacional (términos científicos → definición en lenguaje llano). Tabla nueva
-- e independiente; CREATE TABLE IF NOT EXISTS es válido en MySQL 8.4 (no necesita los procs aux).
CREATE TABLE IF NOT EXISTS glosario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    term VARCHAR(80) NOT NULL UNIQUE,
    definition TEXT NOT NULL,
    category VARCHAR(60),
    aliases JSON,
    source VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------------------------
-- Nivel de dato de cada espacio protegido (rollout nacional).
-- 'basic' = ficha base (límite oficial + Natura 2000, sin catálogo) · 'available' = completo ·
-- 'planned' = anunciado sin datos. Hasta ahora este dato solo vivía en Frontend/Data/parks-index.json
-- y la BD no lo conocía; al escalar a cientos de espacios eso eran dos verdades que se separan.
-- El DEFAULT es 'basic' porque es el estado en el que nace todo espacio nuevo; a continuación se
-- corrige el de los que ya tienen catálogo completo (los que tienen especies cargadas).
-- ------------------------------------------------------------------------------------------------
-- Las comillas van dobladas ('') en vez de usar comillas dobles porque el procedimiento monta la
-- definición dentro de un CONCAT + PREPARE: con sql_mode=ANSI_QUOTES, "…" sería un identificador y
-- el ALTER fallaría. Doblarlas es el escapado estándar y funciona con cualquier sql_mode.
CALL naturdex_add_column('parks', 'status',
                         'ENUM(''basic'',''available'',''planned'') NOT NULL DEFAULT ''basic''');
CALL naturdex_add_index ('parks', 'idx_parks_status',
                         'INDEX idx_parks_status (status)');

-- Un espacio que ya tiene especies cargadas no es una ficha base: es un catálogo completo. Se
-- deduce así en vez de listar slugs a mano, para que la migración valga en cualquier instalación.
UPDATE parks p
   SET p.status = 'available'
 WHERE p.status = 'basic'
   AND EXISTS (SELECT 1 FROM species s WHERE s.park_id = p.id);

-- ------------------------------------------------------------------------------------------------
-- Preferencias de la cuenta (pantalla "Perfil y ajustes").
-- Tema, tamaño de texto, mapa base por defecto, GPS... El dispositivo manda: el frontend las aplica
-- desde localStorage sin esperar a la red (prefs.js) y esta columna solo las espeja para que la
-- misma cuenta las recupere en otro dispositivo. Ver Backend/Api/account.php?action=prefs.
-- ------------------------------------------------------------------------------------------------
CALL naturdex_add_column('users', 'prefs', 'JSON NULL');

-- Limpieza de los procedimientos auxiliares.
DROP PROCEDURE IF EXISTS naturdex_add_column;
DROP PROCEDURE IF EXISTS naturdex_add_index;

-- Limpieza de coordenadas de especies: la localización la aporta el usuario (GPS).
UPDATE species SET latitude = NULL, longitude = NULL;

-- ------------------------------------------------------------------------------------------------
-- Progreso de CUENTA (ámbito estatal) + logros. Tablas nuevas e independientes; CREATE TABLE
-- IF NOT EXISTS es válido en MySQL 8.4. Ver el bloque equivalente (con comentarios completos) en
-- Database/schema.sql y Backend/Lib/account_progress.php.
-- ------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_account_progress (
    user_id INT NOT NULL PRIMARY KEY,
    payload JSON NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    achievement_id VARCHAR(60) NOT NULL,
    unlocked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    celebrated_at TIMESTAMP NULL,
    context JSON NULL,
    UNIQUE KEY unique_user_achievement (user_id, achievement_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_achievements_user (user_id)
);

CREATE TABLE IF NOT EXISTS user_activity_log (
    user_id INT NOT NULL,
    park_slug VARCHAR(120) NOT NULL,
    activity_date DATE NOT NULL,
    PRIMARY KEY (user_id, park_slug, activity_date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_invasive_sightings (
    user_id INT NOT NULL,
    invasive_id INT NOT NULL,
    seen_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, invasive_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (invasive_id) REFERENCES especies_invasoras(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_glossary_views (
    user_id INT NOT NULL,
    term_id INT NOT NULL,
    viewed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, term_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (term_id) REFERENCES glosario(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------------------------------------------
-- Tokens de "seguir conectado" (uno por dispositivo). Tabla nueva e independiente; ver el bloque
-- equivalente, con los comentarios completos, en Database/schema.sql y Backend/Lib/session.php.
-- ------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_auth_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    selector CHAR(18) NOT NULL UNIQUE,
    validator_hash CHAR(64) NOT NULL,
    previous_hash CHAR(64) NULL,
    rotated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_auth_tokens_user (user_id),
    INDEX idx_user_auth_tokens_expires (expires_at)
);

-- ------------------------------------------------------------------------------------------------
-- Esparto: unificación del nombre científico (Stipa tenacissima -> Macrochloa tenacissima).
-- El taxón es uno solo —eidosTaxonId 27376 en la Lista Patrón del IEPNB, que acepta Macrochloa—,
-- pero Cabo Cope lo tenía dado de alta con el basónimo y los otros dos parques con el nombre
-- aceptado. Como el catálogo universal de especies se indexa por nombre científico, el taxón
-- generaba DOS fichas y contaba doble en los totales nacionales; el validador no lo veía porque
-- compara precisamente por scientific_name.
--
-- Hay que renombrar en la BD viva, no solo en seed.sql: Database/species-universal.sql localiza
-- cada fila por (parks.slug, species.scientific_name), así que sin este UPDATE sus sentencias no
-- casarían con la fila vieja y la API seguiría sirviendo la ficha duplicada. Y reejecutar seed.sql
-- sin renombrar antes insertaría una fila NUEVA junto a la vieja en vez de actualizarla.
--
-- De paso se corrige gbif_species_key: 3073 no es el esparto, es la clave de la FAMILIA Poaceae
-- (comprobado en api.gbif.org/v1/species/3073). La del taxón es 4127897.
--
-- Idempotente: la subconsulta evita renombrar si ese parque ya tiene la ficha con el nombre
-- aceptado. Va envuelta en una tabla derivada porque MySQL no deja leer en un subquery la misma
-- tabla que se está actualizando (ERROR 1093).
-- ------------------------------------------------------------------------------------------------
UPDATE species s
   SET s.scientific_name  = 'Macrochloa tenacissima',
       s.taxon_genus      = 'Macrochloa',
       s.gbif_species_key = 4127897
 WHERE s.scientific_name = 'Stipa tenacissima'
   AND s.eidos_taxonid = 27376
   AND NOT EXISTS (
         SELECT 1
           FROM (SELECT park_id FROM species WHERE scientific_name = 'Macrochloa tenacissima') ya
          WHERE ya.park_id = s.park_id
       );

-- Los parques que ya usaban el nombre aceptado pero arrastraban la clave de familia.
UPDATE species s
   SET s.gbif_species_key = 4127897
 WHERE s.scientific_name = 'Macrochloa tenacissima'
   AND s.gbif_species_key = 3073;

-- ------------------------------------------------------------------------------------------------
-- Verificación de presencia: logros que exigen haber pisado el espacio protegido.
-- ------------------------------------------------------------------------------------------------
-- Hasta aquí, todo el progreso de cuenta se podía conseguir sin salir de casa: bastaba con pulsar
-- "marcar como vista". A partir de esta tabla, lo que cuenta para un logro es dónde estaba el
-- usuario cuando lo marcó, y eso lo decide el servidor cruzando cada posición del GPS con el límite
-- oficial del espacio (Backend/Lib/geo.php + presence.php). Ver los comentarios completos en
-- Database/schema.sql y el modelo de amenazas en Docs/VERIFICACION-Y-ANTITRAMPAS.md.
CREATE TABLE IF NOT EXISTS user_park_visits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    park_slug VARCHAR(120) NOT NULL,
    started_at DATETIME NOT NULL,
    last_fix_at DATETIME NOT NULL,
    fix_count INT NOT NULL DEFAULT 0,
    distance_m INT NOT NULL DEFAULT 0,
    best_accuracy_m SMALLINT UNSIGNED NULL,
    last_lat DECIMAL(10,6) NULL,
    last_lng DECIMAL(10,6) NULL,
    frozen_streak SMALLINT NOT NULL DEFAULT 0,
    verified TINYINT(1) NOT NULL DEFAULT 0,
    verified_at DATETIME NULL,
    suspicious TINYINT(1) NOT NULL DEFAULT 0,
    flags JSON NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_park_visits_park (user_id, park_slug, last_fix_at),
    INDEX idx_user_park_visits_window (user_id, verified, started_at)
);

-- Los logros ganados con las reglas viejas (sin pisar campo) no significan lo que dice su ficha, y
-- el catálogo ha cambiado de ids: se vacían para que el sistema arranque limpio. NO se toca
-- user_progress: lo que el usuario tenía marcado sigue ahí, simplemente pasa a estar "sin verificar"
-- hasta que vuelva al campo. Tras aplicar esto, ejecutar:
--     php Tools/recalculate-account-progress.php
DELETE FROM user_achievements;
DELETE FROM user_account_progress;

-- ================================================================================================
-- Los avistamientos pasan a ser Darwin Core.
-- ------------------------------------------------------------------------------------------------
-- Antes de aplicar esto: `npm run db:backup`. Toca datos de usuario.
--
-- Dos partes: la tabla (idéntica a la de Database/schema.sql) y el VOLCADO de lo que ya había. El
-- volcado es idempotente por la clave única (user_id, source_key): un segundo pase encuentra la fila
-- y no cambia un byte —ni siquiera el occurrence_id, que es lo que hay que conservar a toda costa
-- porque es el identificador publicado—.
--
-- Lo que NO hace: tocar user_progress ni user_invasive_sightings. Siguen siendo la fuente que la app
-- lee y lo que hace que el progreso sea local-first; esta tabla se deriva de ellas.
-- ================================================================================================
-- Los comentarios de cada columna están en Database/schema.sql; aquí va la definición a secas.
CREATE TABLE IF NOT EXISTS user_occurrences (
    occurrence_id CHAR(36) NOT NULL PRIMARY KEY,
    user_id INT NOT NULL,
    source_key VARCHAR(190) NOT NULL,
    occurrence_kind ENUM('especie','invasora') NOT NULL DEFAULT 'especie',
    catalog_species_id INT NULL,
    catalog_invasive_id INT NULL,
    park_slug VARCHAR(120) NULL,

    basis_of_record VARCHAR(40) NOT NULL DEFAULT 'HumanObservation',
    occurrence_status VARCHAR(20) NOT NULL DEFAULT 'present',
    individual_count INT UNSIGNED NULL,
    occurrence_remarks TEXT NULL,
    recorded_by VARCHAR(160) NULL,
    recorded_by_id VARCHAR(120) NULL,
    modified DATETIME NOT NULL,

    event_id INT NULL,
    event_date DATETIME NOT NULL,
    sampling_protocol VARCHAR(190) NULL,

    decimal_latitude DECIMAL(10,6) NULL,
    decimal_longitude DECIMAL(10,6) NULL,
    geodetic_datum VARCHAR(20) NOT NULL DEFAULT 'WGS84',
    coordinate_uncertainty_in_meters INT UNSIGNED NULL,
    georeference_protocol VARCHAR(190) NULL,
    country_code CHAR(2) NOT NULL DEFAULT 'ES',
    state_province VARCHAR(120) NULL,
    county VARCHAR(120) NULL,
    locality VARCHAR(255) NULL,
    location_id VARCHAR(190) NULL,

    scientific_name VARCHAR(255) NOT NULL,
    taxon_rank VARCHAR(40) NULL,
    kingdom VARCHAR(60) NULL,
    phylum VARCHAR(120) NULL,
    `class` VARCHAR(120) NULL,
    `order` VARCHAR(120) NULL,
    family VARCHAR(160) NULL,
    genus VARCHAR(120) NULL,
    vernacular_name VARCHAR(255) NULL,
    taxon_id VARCHAR(120) NULL,          -- EIDOS (IEPNB): la nomenclatura canónica del proyecto
    scientific_name_id VARCHAR(190) NULL, -- identificador nomenclatural (IPNI/IF): hoy no lo tenemos
    taxon_concept_id VARCHAR(200) NULL,   -- clave GBIF como URL

    identification_verification_status VARCHAR(190) NOT NULL,
    identified_by VARCHAR(160) NULL,
    date_identified DATETIME NULL,

    license VARCHAR(190) NULL,
    rights_holder VARCHAR(160) NULL,
    institution_code VARCHAR(60) NULL,
    dataset_name VARCHAR(190) NULL,
    dataset_id VARCHAR(120) NULL,

    information_withheld TEXT NULL,
    data_generalizations TEXT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_occurrence_source (user_id, source_key),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES user_park_visits(id) ON DELETE SET NULL,
    INDEX idx_user_occurrences_user (user_id, event_date),
    INDEX idx_user_occurrences_taxon (scientific_name),
    INDEX idx_user_occurrences_park (park_slug, event_date)
);

-- ------------------------------------------------------------------------------------------------
-- VOLCADO 1/2 · los avistamientos de especies que viven dentro de user_progress.payload.
-- ------------------------------------------------------------------------------------------------
-- `payload.sightings` es un objeto indexado por el species_id DE ESE PARQUE: { "<id>": {lat,lng,at} }.
-- Se recorre con JSON_TABLE sobre JSON_KEYS —en dos tablas derivadas anidadas y sin LATERAL, para que
-- funcione igual en MySQL 8 y en MariaDB— y se cruza con `species` (taxonomía), `parks` (lugar) y
-- `user_park_visits` (estado de verificación).
--
-- Solo se vuelcan las entradas de `sightings`, es decir, las que tienen COORDENADA. Un "visto" sin
-- coordenada (marcado sin permiso de GPS) sigue siendo una marca de colección del usuario, pero no es
-- una cita: no dice dónde ocurrió nada. Se queda donde está, en user_progress, y no se pierde.
--
-- Los 600/900 segundos son los márgenes de gracia de Backend/Lib/presence.php (PRESENCE_MARK_PRE_GRACE_S
-- y PRESENCE_MARK_POST_GRACE_S). Se repiten aquí porque esto es SQL de un solo uso; la regla viva
-- sigue estando en PHP y es la que gobierna de aquí en adelante.
--
-- `payload` es TEXT y NO se hace CAST(... AS JSON): las funciones JSON de MySQL y de MariaDB ya
-- aceptan una cadena con JSON válido, y ese CAST no existe en MariaDB.
--
-- El UUID se construye con RANDOM_BYTES y no con UUID(), que en MySQL es de versión 1 y lleva dentro
-- la MAC de la máquina y la hora: un identificador que se va a publicar no puede filtrar eso.
INSERT INTO user_occurrences (
    occurrence_id, user_id, source_key, occurrence_kind, catalog_species_id, park_slug,
    basis_of_record, occurrence_status, recorded_by, recorded_by_id, modified,
    event_id, event_date, sampling_protocol,
    decimal_latitude, decimal_longitude, geodetic_datum, georeference_protocol,
    country_code, state_province, county, locality, location_id,
    scientific_name, kingdom, phylum, `class`, `order`, family, genus, vernacular_name,
    taxon_id, taxon_concept_id,
    identification_verification_status, identified_by, date_identified,
    license, rights_holder, institution_code, dataset_name, dataset_id, occurrence_remarks
)
SELECT
    LOWER(CONCAT(
        HEX(RANDOM_BYTES(4)), '-', HEX(RANDOM_BYTES(2)), '-4', SUBSTR(HEX(RANDOM_BYTES(2)), 2, 3), '-',
        SUBSTR('89ab', 1 + FLOOR(RAND() * 4), 1), SUBSTR(HEX(RANDOM_BYTES(2)), 2, 3), '-',
        HEX(RANDOM_BYTES(6))
    )),
    j.user_id,
    CONCAT('especie:', j.park_slug, ':', j.species_key),
    'especie',
    s.id,
    j.park_slug,
    'HumanObservation',
    'present',
    COALESCE(NULLIF(u.display_name, ''), 'Observador/a de NaturDex'),
    CONCAT('urn:naturdex:observador:', j.user_id),
    UTC_TIMESTAMP(),
    v.id,
    j.observed_at,
    'Observación oportunista con aplicación móvil; presencia en el espacio verificada por GPS contra el límite oficial',
    j.lat,
    j.lng,
    'WGS84',
    'GPS del dispositivo del observador en el momento de marcar',
    'ES',
    p.region,
    p.province,
    p.name,
    CONCAT('urn:naturdex:espacio:', p.slug),
    s.scientific_name,
    CASE s.kingdom WHEN 'flora' THEN 'Plantae' WHEN 'fauna' THEN 'Animalia' WHEN 'fungi' THEN 'Fungi' ELSE NULL END,
    s.taxon_phylum, s.taxon_class, s.taxon_order,
    COALESCE(NULLIF(s.taxon_family, ''), NULLIF(s.family, '')),
    s.taxon_genus,
    NULLIF(s.common_name, ''),
    CAST(s.eidos_taxonid AS CHAR),
    CASE WHEN s.gbif_species_key IS NULL THEN NULL
         ELSE CONCAT('https://www.gbif.org/species/', s.gbif_species_key) END,
    CASE WHEN v.id IS NULL
         THEN 'Observación ciudadana sin validar por experto; presencia en el espacio no verificada'
         ELSE 'Observación ciudadana sin validar por experto; presencia en el espacio verificada por GPS' END,
    COALESCE(NULLIF(u.display_name, ''), 'Observador/a de NaturDex'),
    j.observed_at,
    'http://creativecommons.org/licenses/by/4.0/legalcode',
    COALESCE(NULLIF(u.display_name, ''), 'Observador/a de NaturDex'),
    'NaturDex',
    'NaturDex · avistamientos ciudadanos en espacios naturales protegidos de España',
    'urn:naturdex:dataset:avistamientos-ciudadanos',
    'Cita anterior a la captura de la precisión del GPS: no consta coordinateUncertaintyInMeters.'
FROM (
        SELECT
            src.user_id, src.park_slug, src.species_key,
            CAST(JSON_EXTRACT(src.payload, CONCAT('$.sightings."', src.species_key, '".lat')) AS DECIMAL(10,6)) AS lat,
            CAST(JSON_EXTRACT(src.payload, CONCAT('$.sightings."', src.species_key, '".lng')) AS DECIMAL(10,6)) AS lng,
            COALESCE(
                STR_TO_DATE(SUBSTRING(REPLACE(JSON_UNQUOTE(JSON_EXTRACT(src.payload,
                    CONCAT('$.sightings."', src.species_key, '".at'))), 'T', ' '), 1, 19), '%Y-%m-%d %H:%i:%s'),
                STR_TO_DATE(SUBSTRING(REPLACE(JSON_UNQUOTE(JSON_EXTRACT(src.payload,
                    CONCAT('$.markedAt."species:', src.species_key, '"'))), 'T', ' '), 1, 19), '%Y-%m-%d %H:%i:%s'),
                src.updated_at
            ) AS observed_at
        FROM (
            SELECT up.user_id, up.park_slug, up.updated_at,
                   up.payload AS payload, k.species_key
              FROM user_progress up
              JOIN JSON_TABLE(
                       JSON_KEYS(up.payload, '$.sightings'),
                       '$[*]' COLUMNS (species_key VARCHAR(64) PATH '$')
                   ) k
             WHERE JSON_VALID(up.payload)
        ) src
     ) j
JOIN users u ON u.id = j.user_id
JOIN parks p ON p.slug = j.park_slug
JOIN species s ON s.park_id = p.id AND s.id = CAST(j.species_key AS UNSIGNED)
LEFT JOIN user_park_visits v
       ON v.user_id = j.user_id AND v.park_slug = j.park_slug
      AND v.verified = 1 AND v.suspicious = 0
      AND j.observed_at BETWEEN DATE_SUB(v.started_at, INTERVAL 600 SECOND)
                            AND DATE_ADD(v.last_fix_at, INTERVAL 900 SECOND)
WHERE j.lat IS NOT NULL AND j.lng IS NOT NULL
  AND j.observed_at IS NOT NULL
ON DUPLICATE KEY UPDATE occurrence_id = occurrence_id;

-- ------------------------------------------------------------------------------------------------
-- VOLCADO 2/2 · las invasoras identificadas (user_invasive_sightings).
-- ------------------------------------------------------------------------------------------------
-- No tienen coordenada: la tabla nunca la guardó. Se vuelcan igual —una cita sin georreferenciar
-- sigue siendo una cita, y perderla sería peor— con el hueco DICHO en occurrence_remarks en lugar de
-- inventado. Desde ahora sí se captura (Backend/Api/account-progress.php).
-- El lugar que consta es la comunidad autónoma del catálogo EEI, que es su ámbito real: una fila de
-- especies_invasoras es (especie, CCAA), no (especie, espacio).
INSERT INTO user_occurrences (
    occurrence_id, user_id, source_key, occurrence_kind, catalog_invasive_id,
    basis_of_record, occurrence_status, recorded_by, recorded_by_id, modified,
    event_date, sampling_protocol, geodetic_datum, country_code, state_province,
    scientific_name, kingdom, family, vernacular_name, taxon_id, taxon_concept_id,
    identification_verification_status, identified_by, date_identified,
    license, rights_holder, institution_code, dataset_name, dataset_id, occurrence_remarks
)
SELECT
    LOWER(CONCAT(
        HEX(RANDOM_BYTES(4)), '-', HEX(RANDOM_BYTES(2)), '-4', SUBSTR(HEX(RANDOM_BYTES(2)), 2, 3), '-',
        SUBSTR('89ab', 1 + FLOOR(RAND() * 4), 1), SUBSTR(HEX(RANDOM_BYTES(2)), 2, 3), '-',
        HEX(RANDOM_BYTES(6))
    )),
    isg.user_id,
    CONCAT('invasora:', isg.invasive_id),
    'invasora',
    e.id,
    'HumanObservation',
    'present',
    COALESCE(NULLIF(u.display_name, ''), 'Observador/a de NaturDex'),
    CONCAT('urn:naturdex:observador:', isg.user_id),
    UTC_TIMESTAMP(),
    isg.seen_at,
    'Identificación de especie exótica invasora desde la ficha de la aplicación',
    'WGS84',
    'ES',
    e.ccaa,
    e.scientific_name,
    CASE e.kingdom WHEN 'flora' THEN 'Plantae' WHEN 'fauna' THEN 'Animalia' WHEN 'fungi' THEN 'Fungi' ELSE NULL END,
    NULL,
    NULLIF(e.common_name, ''),
    CAST(e.eidos_taxonid AS CHAR),
    CASE WHEN e.gbif_species_key IS NULL THEN NULL
         ELSE CONCAT('https://www.gbif.org/species/', e.gbif_species_key) END,
    'Observación ciudadana sin validar por experto; presencia en el espacio no verificada',
    COALESCE(NULLIF(u.display_name, ''), 'Observador/a de NaturDex'),
    isg.seen_at,
    'http://creativecommons.org/licenses/by/4.0/legalcode',
    COALESCE(NULLIF(u.display_name, ''), 'Observador/a de NaturDex'),
    'NaturDex',
    'NaturDex · avistamientos ciudadanos en espacios naturales protegidos de España',
    'urn:naturdex:dataset:avistamientos-ciudadanos',
    'Cita sin georreferenciar: se registró antes de que la aplicación capturase la posición al marcar una invasora.'
FROM user_invasive_sightings isg
JOIN users u ON u.id = isg.user_id
JOIN especies_invasoras e ON e.id = isg.invasive_id
ON DUPLICATE KEY UPDATE occurrence_id = occurrence_id;
