-- ================================================================================================
-- NaturDex · migraciones (solo para actualizar instalaciones EXISTENTES)
-- ------------------------------------------------------------------------------------------------
-- En una instalación limpia NO hace falta: Database/schema.sql ya crea las tablas con todas estas
-- columnas. Este archivo solo sirve para poner al día una base de datos creada con un esquema
-- anterior. Es idempotente (ADD COLUMN IF NOT EXISTS). Requiere MySQL 8.0.29+ / MariaDB 10.5+.
--     mysql < Database/migrations.sql
-- ================================================================================================
USE naturadex;

-- Geolocalización, color y nota de revisión de hábitats (añadidos tras el esquema inicial).
ALTER TABLE habitats
    ADD COLUMN IF NOT EXISTS slug VARCHAR(60) NULL,
    ADD COLUMN IF NOT EXISTS habitat_type VARCHAR(60) NULL,
    ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,6) NULL,
    ADD COLUMN IF NOT EXISTS longitude DECIMAL(10,6) NULL,
    ADD COLUMN IF NOT EXISTS color VARCHAR(20) NULL,
    ADD COLUMN IF NOT EXISTS review_note TEXT NULL,
    ADD UNIQUE INDEX IF NOT EXISTS unique_habitat_slug_per_park (park_id, slug);

-- Foto, cita de fuente y aviso de coordenada aproximada por punto de interés.
ALTER TABLE points_of_interest
    ADD COLUMN IF NOT EXISTS image_url VARCHAR(500) NULL,
    ADD COLUMN IF NOT EXISTS source VARCHAR(500) NULL,
    ADD COLUMN IF NOT EXISTS is_approx TINYINT(1) NOT NULL DEFAULT 0;

-- Rol de usuario para el panel de administración ('user' por defecto, 'admin' para editar
-- contenido). Promocionar a mano: UPDATE users SET role='admin' WHERE email='...';
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user';

-- Audioguías explicativas (accesibilidad UNE-EN 301549): audio + transcripción por hábitat y por
-- punto de interés. Las rutas (senderos) llevan su audio en las propiedades del trails.geojson.
ALTER TABLE habitats
    ADD COLUMN IF NOT EXISTS audio_url VARCHAR(500) NULL,
    ADD COLUMN IF NOT EXISTS audio_transcript TEXT NULL;
ALTER TABLE points_of_interest
    ADD COLUMN IF NOT EXISTS audio_url VARCHAR(500) NULL,
    ADD COLUMN IF NOT EXISTS audio_transcript TEXT NULL;

-- Campos de cita/estado a TEXT: las atribuciones y los estados de conservación con referencia
-- pueden superar los 500 caracteres. En MySQL con modo estricto (STRICT_TRANS_TABLES, por defecto
-- en 8.0) un VARCHAR corto ABORTA la carga del seed en lugar de truncar en silencio como hace la
-- configuración laxa de XAMPP. MODIFY es idempotente (se puede reejecutar sin efecto).
ALTER TABLE species
    MODIFY COLUMN source TEXT,
    MODIFY COLUMN iucn_global TEXT,
    MODIFY COLUMN spain_status TEXT,
    MODIFY COLUMN murcia_status TEXT;
ALTER TABLE points_of_interest
    MODIFY COLUMN source TEXT;
