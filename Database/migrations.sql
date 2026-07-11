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
