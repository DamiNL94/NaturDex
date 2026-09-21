-- El juego de caracteres se fija SIEMPRE: el cliente `mysql` lo toma del entorno y en un
-- contenedor sin locale eso es latin1, que convierte cada tilde en mojibake sin dar error.
SET NAMES utf8mb4;

-- cabo-cope-puntas-calnegre · retirada de 19 enlace(s) especie↔hábitat
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
WHERE pk.slug = 'cabo-cope-puntas-calnegre' AND sp.scientific_name = 'Posidonia oceanica'
  AND hb.slug = 'azufaifar';  -- medio-contradictorio: el hábitat es de medio de matorral y la ficha declara un medio marino

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'cabo-cope-puntas-calnegre' AND sp.scientific_name = 'Posidonia oceanica'
  AND hb.slug = 'matorral-semiarido';  -- medio-contradictorio: el hábitat es de medio de matorral y la ficha declara un medio marino

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'cabo-cope-puntas-calnegre' AND sp.scientific_name = 'Posidonia oceanica'
  AND hb.slug = 'dunas-malcomietalia';  -- medio-contradictorio: el hábitat es de medio dunar y la ficha declara un medio marino

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'cabo-cope-puntas-calnegre' AND sp.scientific_name = 'Posidonia oceanica'
  AND hb.slug = 'dunas-embrionarias';  -- medio-contradictorio: el hábitat es de medio dunar y la ficha declara un medio marino

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'cabo-cope-puntas-calnegre' AND sp.scientific_name = 'Posidonia oceanica'
  AND hb.slug = 'veg-anual-desechos-marinos';  -- medio-contradictorio: el hábitat es de medio costero y la ficha declara un medio marino

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'cabo-cope-puntas-calnegre' AND sp.scientific_name = 'Aquila fasciata'
  AND hb.slug = 'acantilados';  -- vuelo: taxón volador del volcado del piloto: la fuente que lo respalda es una lista de fauna DEL ESPACIO y no dice en qué hábitat vive, así que el reparto por polígonos lo puso una persona

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'cabo-cope-puntas-calnegre' AND sp.scientific_name = 'Aquila fasciata'
  AND hb.slug = 'matorral-semiarido';  -- vuelo: taxón volador del volcado del piloto: la fuente que lo respalda es una lista de fauna DEL ESPACIO y no dice en qué hábitat vive, así que el reparto por polígonos lo puso una persona

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'cabo-cope-puntas-calnegre' AND sp.scientific_name = 'Bucanetes githagineus'
  AND hb.slug = 'matorral-semiarido';  -- vuelo: taxón volador del volcado del piloto: la fuente que lo respalda es una lista de fauna DEL ESPACIO y no dice en qué hábitat vive, así que el reparto por polígonos lo puso una persona

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'cabo-cope-puntas-calnegre' AND sp.scientific_name = 'Bucanetes githagineus'
  AND hb.slug = 'azufaifar';  -- vuelo: taxón volador del volcado del piloto: la fuente que lo respalda es una lista de fauna DEL ESPACIO y no dice en qué hábitat vive, así que el reparto por polígonos lo puso una persona

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'cabo-cope-puntas-calnegre' AND sp.scientific_name = 'Burhinus oedicnemus'
  AND hb.slug = 'matorral-semiarido';  -- vuelo: taxón volador del volcado del piloto: la fuente que lo respalda es una lista de fauna DEL ESPACIO y no dice en qué hábitat vive, así que el reparto por polígonos lo puso una persona

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'cabo-cope-puntas-calnegre' AND sp.scientific_name = 'Bubo bubo'
  AND hb.slug = 'acantilados';  -- vuelo: taxón volador del volcado del piloto: la fuente que lo respalda es una lista de fauna DEL ESPACIO y no dice en qué hábitat vive, así que el reparto por polígonos lo puso una persona

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'cabo-cope-puntas-calnegre' AND sp.scientific_name = 'Charadrius alexandrinus'
  AND hb.slug = 'veg-anual-desechos-marinos';  -- vuelo: taxón volador del volcado del piloto: la fuente que lo respalda es una lista de fauna DEL ESPACIO y no dice en qué hábitat vive, así que el reparto por polígonos lo puso una persona

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'cabo-cope-puntas-calnegre' AND sp.scientific_name = 'Galerida cristata'
  AND hb.slug = 'matorral-semiarido';  -- vuelo: taxón volador del volcado del piloto: la fuente que lo respalda es una lista de fauna DEL ESPACIO y no dice en qué hábitat vive, así que el reparto por polígonos lo puso una persona

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'cabo-cope-puntas-calnegre' AND sp.scientific_name = 'Galerida theklae'
  AND hb.slug = 'matorral-semiarido';  -- vuelo: taxón volador del volcado del piloto: la fuente que lo respalda es una lista de fauna DEL ESPACIO y no dice en qué hábitat vive, así que el reparto por polígonos lo puso una persona

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'cabo-cope-puntas-calnegre' AND sp.scientific_name = 'Oenanthe leucura'
  AND hb.slug = 'matorral-semiarido';  -- vuelo: taxón volador del volcado del piloto: la fuente que lo respalda es una lista de fauna DEL ESPACIO y no dice en qué hábitat vive, así que el reparto por polígonos lo puso una persona

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'cabo-cope-puntas-calnegre' AND sp.scientific_name = 'Gulosus aristotelis'
  AND hb.slug = 'acantilados';  -- vuelo: taxón volador del volcado del piloto: la fuente que lo respalda es una lista de fauna DEL ESPACIO y no dice en qué hábitat vive, así que el reparto por polígonos lo puso una persona

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'cabo-cope-puntas-calnegre' AND sp.scientific_name = 'Curruca undata'
  AND hb.slug = 'matorral-semiarido';  -- vuelo: taxón volador del volcado del piloto: la fuente que lo respalda es una lista de fauna DEL ESPACIO y no dice en qué hábitat vive, así que el reparto por polígonos lo puso una persona

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'cabo-cope-puntas-calnegre' AND sp.scientific_name = 'Falco peregrinus'
  AND hb.slug = 'acantilados';  -- vuelo: taxón volador del volcado del piloto: la fuente que lo respalda es una lista de fauna DEL ESPACIO y no dice en qué hábitat vive, así que el reparto por polígonos lo puso una persona

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'cabo-cope-puntas-calnegre' AND sp.scientific_name = 'Calandrella brachydactyla'
  AND hb.slug = 'matorral-halofilo';  -- vuelo: taxón volador del volcado del piloto: la fuente que lo respalda es una lista de fauna DEL ESPACIO y no dice en qué hábitat vive, así que el reparto por polígonos lo puso una persona

COMMIT;

-- Comprobación: debe devolver 0.
SELECT COUNT(*) AS enlaces_retirados_que_siguen
FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id
WHERE pk.slug = 'cabo-cope-puntas-calnegre' AND (
  (sp.scientific_name = 'Posidonia oceanica' AND hb.slug = 'azufaifar') OR
  (sp.scientific_name = 'Posidonia oceanica' AND hb.slug = 'matorral-semiarido') OR
  (sp.scientific_name = 'Posidonia oceanica' AND hb.slug = 'dunas-malcomietalia') OR
  (sp.scientific_name = 'Posidonia oceanica' AND hb.slug = 'dunas-embrionarias') OR
  (sp.scientific_name = 'Posidonia oceanica' AND hb.slug = 'veg-anual-desechos-marinos') OR
  (sp.scientific_name = 'Aquila fasciata' AND hb.slug = 'acantilados') OR
  (sp.scientific_name = 'Aquila fasciata' AND hb.slug = 'matorral-semiarido') OR
  (sp.scientific_name = 'Bucanetes githagineus' AND hb.slug = 'matorral-semiarido') OR
  (sp.scientific_name = 'Bucanetes githagineus' AND hb.slug = 'azufaifar') OR
  (sp.scientific_name = 'Burhinus oedicnemus' AND hb.slug = 'matorral-semiarido') OR
  (sp.scientific_name = 'Bubo bubo' AND hb.slug = 'acantilados') OR
  (sp.scientific_name = 'Charadrius alexandrinus' AND hb.slug = 'veg-anual-desechos-marinos') OR
  (sp.scientific_name = 'Galerida cristata' AND hb.slug = 'matorral-semiarido') OR
  (sp.scientific_name = 'Galerida theklae' AND hb.slug = 'matorral-semiarido') OR
  (sp.scientific_name = 'Oenanthe leucura' AND hb.slug = 'matorral-semiarido') OR
  (sp.scientific_name = 'Gulosus aristotelis' AND hb.slug = 'acantilados') OR
  (sp.scientific_name = 'Curruca undata' AND hb.slug = 'matorral-semiarido') OR
  (sp.scientific_name = 'Falco peregrinus' AND hb.slug = 'acantilados') OR
  (sp.scientific_name = 'Calandrella brachydactyla' AND hb.slug = 'matorral-halofilo')
);
