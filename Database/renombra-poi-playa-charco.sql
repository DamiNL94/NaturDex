-- El juego de caracteres se fija SIEMPRE: el cliente `mysql` lo toma del entorno y en un
-- contenedor sin locale eso es latin1, que convierte cada tilde en mojibake sin dar error.
SET NAMES utf8mb4;

-- renombra-poi-playa-charco.sql — `playa-Charco` → `playa-charco` (deuda nº 18)
-- Escrito a mano el 2026-08-25 (b).
--
-- QUÉ ARREGLA
-- -----------
-- El §4.3.8 del runbook pide el id de un POI en slug estable —minúsculas, sin tildes, guiones—
-- porque es `points_of_interest.slug`, ÚNICO por parque. Éste llevaba una `C` mayúscula desde el
-- piloto de Cabo Cope. `validate` lo daba como AVISO y no como error a propósito: bloquear el commit
-- por una deuda que solo se salda tocando la base dejaría el repositorio sin red de seguridad para
-- todo lo demás.
--
-- POR QUÉ HACE FALTA ESTE FICHERO
-- -------------------------------
-- El mismo literal vivía en CUATRO sitios y hay que cambiarlo en todos a la vez o el POI se duplica
-- en el siguiente import: el `park.json`, `seed.sql`, `snapshot.sql` y `recolocar-pois.sql` ya están
-- corregidos en el repositorio. El quinto sitio es la FILA VIVA, que desde el repositorio no se ve —
-- y ningún generador la toca: `build-poi-sql.js` hace UPSERT por `slug`, así que aplicar el N3 con
-- el slug nuevo NO renombraría nada: daría de alta un SEGUNDO POI y dejaría el viejo al lado.
--
-- ORDEN: este fichero va ANTES de cualquier `n3-pois-cabo-cope-puntas-calnegre.sql` posterior.
--
-- IDEMPOTENTE: si ya se aplicó, el UPDATE afecta a 0 filas. La condición del nombre es una guarda,
-- no un adorno: `slug` es único POR PARQUE, así que sin acotar el parque este UPDATE podría chocar
-- con un `playa-charco` de otro espacio.

UPDATE points_of_interest x JOIN parks p ON p.id = x.park_id
   SET x.slug = 'playa-charco'
 WHERE p.slug = 'cabo-cope-puntas-calnegre'
   AND x.slug = 'playa-Charco'
   AND x.name = 'Playa del Charco';

-- Comprobación: debe devolver exactamente una fila, con el slug ya en minúsculas.
-- SELECT x.id, x.slug, x.name FROM points_of_interest x JOIN parks p ON p.id = x.park_id
--  WHERE p.slug = 'cabo-cope-puntas-calnegre' AND x.name = 'Playa del Charco';
