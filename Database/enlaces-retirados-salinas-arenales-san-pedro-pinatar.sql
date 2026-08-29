-- El juego de caracteres se fija SIEMPRE: el cliente `mysql` lo toma del entorno y en un
-- contenedor sin locale eso es latin1, que convierte cada tilde en mojibake sin dar error.
SET NAMES utf8mb4;

-- salinas-arenales-san-pedro-pinatar · retirada de 10 enlace(s) especie↔hábitat
-- Generado el 2026-08-28 por
-- Tools/catalogo-nacional/auditoria-especie-habitat.js. El motivo de cada uno va al lado.
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
WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Posidonia oceanica'
  AND hb.slug = 'matorrales-halofilos-mediterraneos-1420';  -- medio-contradictorio: el hábitat es de medio salino y la ficha declara un medio marino

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Posidonia oceanica'
  AND hb.slug = 'pastizales-salinos-mediterraneos-1410';  -- medio-contradictorio: el hábitat es de medio salino y la ficha declara un medio marino

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Posidonia oceanica'
  AND hb.slug = 'dunas-con-vegetacion-2260';  -- medio-contradictorio: el hábitat es de medio dunar y la ficha declara un medio marino

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Posidonia oceanica'
  AND hb.slug = 'acantilados-con-vegetacion-1240';  -- medio-contradictorio: el hábitat es de medio costero y la ficha declara un medio marino

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Posidonia oceanica'
  AND hb.slug = 'estepas-salinas-mediterraneas-1510';  -- medio-contradictorio: el hábitat es de medio salino y la ficha declara un medio marino

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Posidonia oceanica'
  AND hb.slug = 'galerias-y-matorrales-92D0';  -- medio-contradictorio: el hábitat es de medio higrófilo y la ficha declara un medio marino

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Posidonia oceanica'
  AND hb.slug = 'matorrales-halonitrofilos-pegano-1430';  -- medio-contradictorio: el hábitat es de medio salino y la ficha declara un medio marino

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Posidonia oceanica'
  AND hb.slug = 'dunas-con-cespedes-2230';  -- medio-contradictorio: el hábitat es de medio dunar y la ficha declara un medio marino

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Posidonia oceanica'
  AND hb.slug = 'dunas-litorales-con-2250';  -- medio-contradictorio: el hábitat es de medio dunar y la ficha declara un medio marino

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Posidonia oceanica'
  AND hb.slug = 'vegetacion-halonitrofila-anual-1310';  -- medio-contradictorio: el hábitat es de medio salino y la ficha declara un medio marino

COMMIT;

-- Comprobación: debe devolver 0.
SELECT COUNT(*) AS enlaces_retirados_que_siguen
FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id
WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND (
  (sp.scientific_name = 'Posidonia oceanica' AND hb.slug = 'matorrales-halofilos-mediterraneos-1420') OR
  (sp.scientific_name = 'Posidonia oceanica' AND hb.slug = 'pastizales-salinos-mediterraneos-1410') OR
  (sp.scientific_name = 'Posidonia oceanica' AND hb.slug = 'dunas-con-vegetacion-2260') OR
  (sp.scientific_name = 'Posidonia oceanica' AND hb.slug = 'acantilados-con-vegetacion-1240') OR
  (sp.scientific_name = 'Posidonia oceanica' AND hb.slug = 'estepas-salinas-mediterraneas-1510') OR
  (sp.scientific_name = 'Posidonia oceanica' AND hb.slug = 'galerias-y-matorrales-92D0') OR
  (sp.scientific_name = 'Posidonia oceanica' AND hb.slug = 'matorrales-halonitrofilos-pegano-1430') OR
  (sp.scientific_name = 'Posidonia oceanica' AND hb.slug = 'dunas-con-cespedes-2230') OR
  (sp.scientific_name = 'Posidonia oceanica' AND hb.slug = 'dunas-litorales-con-2250') OR
  (sp.scientific_name = 'Posidonia oceanica' AND hb.slug = 'vegetacion-halonitrofila-anual-1310')
);
