-- El juego de caracteres se fija SIEMPRE: el cliente `mysql` lo toma del entorno y en un
-- contenedor sin locale eso es latin1, que convierte cada tilde en mojibake sin dar error.
SET NAMES utf8mb4;

-- sierra-espuna · retirada de 3 enlace(s) especie↔hábitat
-- Generado el 2026-09-21 por
-- Tools/catalogo-nacional/auditoria-especie-habitat.js. El motivo de cada uno va al lado.
--
-- Es una COLA ACUMULADA: lleva también los borrados de pases anteriores, que el park.json ya
-- no tiene y la auditoría por eso ya no ve. Lo ya aplicado no cuesta nada: un DELETE sin fila
-- no hace nada. Solo sale de la cola el enlace que el park.json vuelve a tener.
--
-- HACE FALTA porque build-park-sql.js solo hace UPSERT: regenerar el -n2.sql da de alta los
-- enlaces que quedan pero no retira ninguno. Sin este fichero la API sigue sirviéndolos.
--
-- ANTES DE APLICARLO: haz copia (npm run db:backup). Un DELETE no se deshace con otra pasada.
-- Esto NO borra ninguna ficha de especie ni ninguna cita de usuario: solo el vínculo con el
-- hábitat, así que el progreso de nadie cambia de sitio. Lo que sí cambia es el TOTAL de
-- especies de esos hábitats, y con él lo que hace falta para completarlos.

START TRANSACTION;

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Pipistrellus nathusii'
  AND hb.slug = 'encinares-de-quercus-9340';  -- vuelo: taxón volador cuyo enlace sale del barrido de ocurrencias: un registro en vuelo cae dentro de cualquier polígono (CLAUDE.md, regla nº 8)

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Pipistrellus nathusii'
  AND hb.slug = 'matorrales-mediterraneos-y-4090';  -- vuelo: taxón volador cuyo enlace sale del barrido de ocurrencias: un registro en vuelo cae dentro de cualquier polígono (CLAUDE.md, regla nº 8)

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Pipistrellus nathusii'
  AND hb.slug = 'zonas-subestepicas-de-6220';  -- vuelo: taxón volador cuyo enlace sale del barrido de ocurrencias: un registro en vuelo cae dentro de cualquier polígono (CLAUDE.md, regla nº 8)

COMMIT;

-- Comprobación: debe devolver 0.
SELECT COUNT(*) AS enlaces_retirados_que_siguen
FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id
WHERE pk.slug = 'sierra-espuna' AND (
  (sp.scientific_name = 'Pipistrellus nathusii' AND hb.slug = 'encinares-de-quercus-9340') OR
  (sp.scientific_name = 'Pipistrellus nathusii' AND hb.slug = 'matorrales-mediterraneos-y-4090') OR
  (sp.scientific_name = 'Pipistrellus nathusii' AND hb.slug = 'zonas-subestepicas-de-6220')
);
