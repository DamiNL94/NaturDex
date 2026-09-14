-- El juego de caracteres se fija SIEMPRE: el cliente `mysql` lo toma del entorno y en un
-- contenedor sin locale eso es latin1, que convierte cada tilde en mojibake sin dar error.
SET NAMES utf8mb4;

-- ================================================================================================
-- NaturDex · retirada de `species.conservation_status` (2026-09-14). BORRA DATO.
-- ------------------------------------------------------------------------------------------------
-- Escrito a mano, una vez. Es el mismo `DROP COLUMN` que lleva `migrations.sql`, en un fichero
-- aparte y **sin `DELIMITER`**, porque `Tools/import-sql.php` —la vía para una base remota— manda
-- el fichero entero con `multi_query` y `DELIMITER` es una directiva del CLIENTE `mysql`: el
-- servidor no la entiende, así que los procedimientos auxiliares de `migrations.sql` no pasan por
-- ahí. Con esto no hace falta relanzar la migración entera para una sola columna.
--
-- QUÉ ERA. Una etiqueta DERIVADA que producía `build-species-n2.js` a partir de la figura legal, y
-- cuyo último caso por defecto era el fallo: sin norma escribía el código de la UICN en el campo que
-- `Docs/arquitectura/PROCEDENCIA-DE-CAMPOS.md` reserva a la figura legal. Nadie la cotejaba
-- —`especies:legal` mira `spain_status` y `regional_status`—, y la auditoría del catálogo la midió
-- en las 2.882 fichas: **21 anunciaban una protección que su propia ficha niega** (el romero
-- «Protegida (LESRPE)» con tramo 1, la aulaga «En Peligro de Extinción») y **570 llevaban un código
-- de la UICN**.
--
-- El 2026-09-14 la PWA dejó de leerla en las dos puntas —la tarjeta del catálogo y la ficha de
-- detalle pintan un distintivo DERIVADO al vuelo (`categoriaConservacion()` de
-- `Frontend/Js/rareza.js`)—, y con ella salieron los dieciséis `park.json`, el payload de la API, el
-- formulario del AdminPanel, el generador de SQL, `schema.sql` y `seed.sql`.
--
-- NO SE PIERDE NADA RECUPERABLE: la categoría con su norma y su ámbito sigue entera en
-- `spain_status`, `regional_status`, `regional_ccaa`, `iucn_global` e `iucn_spain`.
--
-- ORDEN: va DESPUÉS de los `<slug>-n2.sql` regenerados. Da igual en rigor —ninguno nombra ya la
-- columna—, pero así la base nunca queda un instante sin el dato nuevo y sin el viejo a la vez.
--
-- Idempotente: si la columna ya no está, no hace nada y no da error. `DROP COLUMN IF EXISTS` no
-- existe en Oracle MySQL (sí en MariaDB), así que la comprobación va contra `information_schema`.
-- Necesita una base seleccionada (`DATABASE()`), como todo lo de esta carpeta.
-- ================================================================================================

SELECT COUNT(*) INTO @existe
FROM information_schema.columns
WHERE table_schema = DATABASE()
  AND table_name   = 'species'
  AND column_name  = 'conservation_status';

SET @ddl = IF(@existe > 0,
              'ALTER TABLE species DROP COLUMN conservation_status',
              'DO 0');

PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
