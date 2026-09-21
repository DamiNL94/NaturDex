-- El juego de caracteres se fija SIEMPRE: el cliente `mysql` lo toma del entorno y en un
-- contenedor sin locale eso es latin1, que convierte cada tilde en mojibake sin dar error.
SET NAMES utf8mb4;

-- ================================================================================================
-- La columna `orden` en habitats, species y points_of_interest (2026-09-21, deuda nº 3).
-- ------------------------------------------------------------------------------------------------
-- Escrito a mano. Es el mismo ALTER que lleva `migrations.sql`, suelto y SIN `DELIMITER`, porque
-- `Tools/import-sql.php` manda el fichero con `multi_query` y no entiende `DELIMITER` (ver
-- Docs/runbook/APLICAR-A-RAILWAY.md §1). No borra nada: añade tres columnas vacías.
--
-- VA ANTES DE DESPLEGAR el `Backend/Lib/park_payload.php` que ordena por ellas. Con el PHP nuevo y
-- sin estas columnas, el SELECT de hábitats falla y la API deja de servir TODOS los espacios. Con
-- las columnas y el PHP viejo no pasa nada: el viejo no las mira.
--
-- NO es idempotente: MySQL 8.4 no tiene `ADD COLUMN IF NOT EXISTS`. Aplicado dos veces, el segundo
-- pase falla con «Duplicate column name 'orden'» en la primera sentencia y no hace nada más, que es
-- inocuo. Comprobación de que hace falta, antes:
--   SELECT TABLE_NAME FROM information_schema.COLUMNS
--    WHERE TABLE_SCHEMA = DATABASE() AND COLUMN_NAME = 'orden';   -- debe devolver 0 filas
--
-- Mientras estén vacías, la API sirve el orden de antes (`orden IS NULL` va detrás y desempata como
-- siempre). Las rellenan los `<slug>-n2.sql` y `n3-pois-<slug>.sql` regenerados desde ese día.
-- ================================================================================================

ALTER TABLE habitats           ADD COLUMN orden INT NULL;
ALTER TABLE species            ADD COLUMN orden INT NULL;
ALTER TABLE points_of_interest ADD COLUMN orden INT NULL;

-- Comprobación: debe devolver las tres tablas.
SELECT TABLE_NAME FROM information_schema.COLUMNS
 WHERE TABLE_SCHEMA = DATABASE() AND COLUMN_NAME = 'orden' ORDER BY TABLE_NAME;
