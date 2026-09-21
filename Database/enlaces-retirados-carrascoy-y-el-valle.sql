-- El juego de caracteres se fija SIEMPRE: el cliente `mysql` lo toma del entorno y en un
-- contenedor sin locale eso es latin1, que convierte cada tilde en mojibake sin dar error.
SET NAMES utf8mb4;

-- carrascoy-y-el-valle · retirada de 49 enlace(s) especie↔hábitat
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
WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Anthyllis cytisoides'
  AND hb.slug = 'manantiales-petrificantes-con-7220';  -- medio-contradictorio: el hábitat es de medio acuático y la ficha declara un medio de matorral

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Anthyllis cytisoides'
  AND hb.slug = 'aguas-oligomesotroficas-calcareas-3140';  -- medio-contradictorio: el hábitat es de medio acuático y la ficha declara un medio de matorral

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Anthyllis cytisoides'
  AND hb.slug = 'rios-mediterraneos-de-3280';  -- medio-contradictorio: el hábitat es de medio acuático y la ficha declara un medio de matorral

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Cistus albidus'
  AND hb.slug = 'manantiales-petrificantes-con-7220';  -- medio-contradictorio: el hábitat es de medio acuático y la ficha declara un medio de matorral

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Pistacia lentiscus'
  AND hb.slug = 'rios-mediterraneos-de-3250';  -- medio-contradictorio: el hábitat es de medio acuático y la ficha declara un medio costero y de matorral

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Lithodora fruticosa'
  AND hb.slug = 'manantiales-petrificantes-con-7220';  -- medio-contradictorio: el hábitat es de medio acuático y la ficha declara un medio rupícola y forestal y de matorral y de pastizal

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Ceratonia siliqua'
  AND hb.slug = 'manantiales-petrificantes-con-7220';  -- medio-contradictorio: el hábitat es de medio acuático y la ficha declara un medio de matorral

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Sedum sediforme'
  AND hb.slug = 'aguas-oligomesotroficas-calcareas-3140';  -- medio-contradictorio: el hábitat es de medio acuático y la ficha declara un medio de pastizal

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Sedum sediforme'
  AND hb.slug = 'estanques-temporales-mediterraneos-3170';  -- medio-contradictorio: el hábitat es de medio acuático y la ficha declara un medio de pastizal

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Sedum sediforme'
  AND hb.slug = 'manantiales-petrificantes-con-7220';  -- medio-contradictorio: el hábitat es de medio acuático y la ficha declara un medio de pastizal

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Sedum sediforme'
  AND hb.slug = 'rios-mediterraneos-de-3280';  -- medio-contradictorio: el hábitat es de medio acuático y la ficha declara un medio de pastizal

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Juniperus oxycedrus'
  AND hb.slug = 'rios-mediterraneos-de-3250';  -- medio-contradictorio: el hábitat es de medio acuático y la ficha declara un medio rupícola y forestal y de matorral

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Sciurus vulgaris'
  AND hb.slug = 'manantiales-petrificantes-con-7220';  -- medio-contradictorio: el hábitat es de medio acuático y la ficha declara un medio forestal

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Thymus membranaceus'
  AND hb.slug = 'manantiales-petrificantes-con-7220';  -- medio-contradictorio: el hábitat es de medio acuático y la ficha declara un medio de matorral

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Chamaeleo chamaeleon'
  AND hb.slug = 'aguas-oligomesotroficas-calcareas-3140';  -- medio-contradictorio: el hábitat es de medio acuático y la ficha declara un medio costero

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Chamaeleo chamaeleon'
  AND hb.slug = 'estanques-temporales-mediterraneos-3170';  -- medio-contradictorio: el hábitat es de medio acuático y la ficha declara un medio costero

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Chamaeleo chamaeleon'
  AND hb.slug = 'rios-mediterraneos-de-3280';  -- medio-contradictorio: el hábitat es de medio acuático y la ficha declara un medio costero

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Ziziphus lotus'
  AND hb.slug = 'aguas-oligomesotroficas-calcareas-3140';  -- medio-contradictorio: el hábitat es de medio acuático y la ficha declara un medio de matorral

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Ziziphus lotus'
  AND hb.slug = 'estanques-temporales-mediterraneos-3170';  -- medio-contradictorio: el hábitat es de medio acuático y la ficha declara un medio de matorral

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Ziziphus lotus'
  AND hb.slug = 'rios-mediterraneos-de-3280';  -- medio-contradictorio: el hábitat es de medio acuático y la ficha declara un medio de matorral

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Thymelaea hirsuta'
  AND hb.slug = 'rios-mediterraneos-de-3250';  -- medio-contradictorio: el hábitat es de medio acuático y la ficha declara un medio costero y rupícola y de matorral

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Bituminaria bituminosa'
  AND hb.slug = 'aguas-oligomesotroficas-calcareas-3140';  -- medio-contradictorio: el hábitat es de medio acuático y la ficha declara un medio forestal

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Bituminaria bituminosa'
  AND hb.slug = 'estanques-temporales-mediterraneos-3170';  -- medio-contradictorio: el hábitat es de medio acuático y la ficha declara un medio forestal

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Bituminaria bituminosa'
  AND hb.slug = 'manantiales-petrificantes-con-7220';  -- medio-contradictorio: el hábitat es de medio acuático y la ficha declara un medio forestal

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Bituminaria bituminosa'
  AND hb.slug = 'rios-mediterraneos-de-3280';  -- medio-contradictorio: el hábitat es de medio acuático y la ficha declara un medio forestal

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Lotus dorycnium'
  AND hb.slug = 'aguas-oligomesotroficas-calcareas-3140';  -- medio-contradictorio: el hábitat es de medio acuático y la ficha declara un medio de matorral

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Lotus dorycnium'
  AND hb.slug = 'estanques-temporales-mediterraneos-3170';  -- medio-contradictorio: el hábitat es de medio acuático y la ficha declara un medio de matorral

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Lotus dorycnium'
  AND hb.slug = 'rios-mediterraneos-de-3280';  -- medio-contradictorio: el hábitat es de medio acuático y la ficha declara un medio de matorral

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Tarentola mauritanica'
  AND hb.slug = 'aguas-oligomesotroficas-calcareas-3140';  -- medio-contradictorio: el hábitat es de medio acuático y la ficha declara un medio rupícola

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Tarentola mauritanica'
  AND hb.slug = 'estanques-temporales-mediterraneos-3170';  -- medio-contradictorio: el hábitat es de medio acuático y la ficha declara un medio rupícola

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Tarentola mauritanica'
  AND hb.slug = 'rios-mediterraneos-de-3280';  -- medio-contradictorio: el hábitat es de medio acuático y la ficha declara un medio rupícola

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Teucrium capitatum'
  AND hb.slug = 'manantiales-petrificantes-con-7220';  -- medio-contradictorio: el hábitat es de medio acuático y la ficha declara un medio rupícola y de matorral

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Ephedra fragilis'
  AND hb.slug = 'manantiales-petrificantes-con-7220';  -- medio-contradictorio: el hábitat es de medio acuático y la ficha declara un medio costero y rupícola y de matorral

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Thymus zygis'
  AND hb.slug = 'aguas-oligomesotroficas-calcareas-3140';  -- medio-contradictorio: el hábitat es de medio acuático y la ficha declara un medio de matorral y de pastizal

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Thymus zygis'
  AND hb.slug = 'manantiales-petrificantes-con-7220';  -- medio-contradictorio: el hábitat es de medio acuático y la ficha declara un medio de matorral y de pastizal

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Thymus zygis'
  AND hb.slug = 'rios-mediterraneos-de-3280';  -- medio-contradictorio: el hábitat es de medio acuático y la ficha declara un medio de matorral y de pastizal

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Capra pyrenaica'
  AND hb.slug = 'rios-mediterraneos-de-3250';  -- medio-contradictorio: el hábitat es de medio acuático y la ficha declara un medio rupícola y de matorral

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Osyris lanceolata'
  AND hb.slug = 'aguas-oligomesotroficas-calcareas-3140';  -- medio-contradictorio: el hábitat es de medio acuático y la ficha declara un medio rupícola y de matorral

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Osyris lanceolata'
  AND hb.slug = 'manantiales-petrificantes-con-7220';  -- medio-contradictorio: el hábitat es de medio acuático y la ficha declara un medio rupícola y de matorral

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Osyris lanceolata'
  AND hb.slug = 'rios-mediterraneos-de-3280';  -- medio-contradictorio: el hábitat es de medio acuático y la ficha declara un medio rupícola y de matorral

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Hemorrhois hippocrepis'
  AND hb.slug = 'aguas-oligomesotroficas-calcareas-3140';  -- medio-contradictorio: el hábitat es de medio acuático y la ficha declara un medio de matorral

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Hemorrhois hippocrepis'
  AND hb.slug = 'estanques-temporales-mediterraneos-3170';  -- medio-contradictorio: el hábitat es de medio acuático y la ficha declara un medio de matorral

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Hemorrhois hippocrepis'
  AND hb.slug = 'rios-mediterraneos-de-3280';  -- medio-contradictorio: el hábitat es de medio acuático y la ficha declara un medio de matorral

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Narcissus serotinus'
  AND hb.slug = 'aguas-oligomesotroficas-calcareas-3140';  -- medio-contradictorio: el hábitat es de medio acuático y la ficha declara un medio costero y dunar y de matorral y de pastizal

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Narcissus serotinus'
  AND hb.slug = 'estanques-temporales-mediterraneos-3170';  -- medio-contradictorio: el hábitat es de medio acuático y la ficha declara un medio costero y dunar y de matorral y de pastizal

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Narcissus serotinus'
  AND hb.slug = 'rios-mediterraneos-de-3280';  -- medio-contradictorio: el hábitat es de medio acuático y la ficha declara un medio costero y dunar y de matorral y de pastizal

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Peganum harmala'
  AND hb.slug = 'aguas-oligomesotroficas-calcareas-3140';  -- medio-contradictorio: el hábitat es de medio acuático y la ficha declara un medio salino y rupícola y de matorral

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Peganum harmala'
  AND hb.slug = 'manantiales-petrificantes-con-7220';  -- medio-contradictorio: el hábitat es de medio acuático y la ficha declara un medio salino y rupícola y de matorral

DELETE sh FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id
WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Peganum harmala'
  AND hb.slug = 'rios-mediterraneos-de-3280';  -- medio-contradictorio: el hábitat es de medio acuático y la ficha declara un medio salino y rupícola y de matorral

COMMIT;

-- Comprobación: debe devolver 0.
SELECT COUNT(*) AS enlaces_retirados_que_siguen
FROM species_habitats sh
JOIN species sp ON sp.id = sh.species_id
JOIN habitats hb ON hb.id = sh.habitat_id
JOIN parks pk ON pk.id = sp.park_id
WHERE pk.slug = 'carrascoy-y-el-valle' AND (
  (sp.scientific_name = 'Anthyllis cytisoides' AND hb.slug = 'manantiales-petrificantes-con-7220') OR
  (sp.scientific_name = 'Anthyllis cytisoides' AND hb.slug = 'aguas-oligomesotroficas-calcareas-3140') OR
  (sp.scientific_name = 'Anthyllis cytisoides' AND hb.slug = 'rios-mediterraneos-de-3280') OR
  (sp.scientific_name = 'Cistus albidus' AND hb.slug = 'manantiales-petrificantes-con-7220') OR
  (sp.scientific_name = 'Pistacia lentiscus' AND hb.slug = 'rios-mediterraneos-de-3250') OR
  (sp.scientific_name = 'Lithodora fruticosa' AND hb.slug = 'manantiales-petrificantes-con-7220') OR
  (sp.scientific_name = 'Ceratonia siliqua' AND hb.slug = 'manantiales-petrificantes-con-7220') OR
  (sp.scientific_name = 'Sedum sediforme' AND hb.slug = 'aguas-oligomesotroficas-calcareas-3140') OR
  (sp.scientific_name = 'Sedum sediforme' AND hb.slug = 'estanques-temporales-mediterraneos-3170') OR
  (sp.scientific_name = 'Sedum sediforme' AND hb.slug = 'manantiales-petrificantes-con-7220') OR
  (sp.scientific_name = 'Sedum sediforme' AND hb.slug = 'rios-mediterraneos-de-3280') OR
  (sp.scientific_name = 'Juniperus oxycedrus' AND hb.slug = 'rios-mediterraneos-de-3250') OR
  (sp.scientific_name = 'Sciurus vulgaris' AND hb.slug = 'manantiales-petrificantes-con-7220') OR
  (sp.scientific_name = 'Thymus membranaceus' AND hb.slug = 'manantiales-petrificantes-con-7220') OR
  (sp.scientific_name = 'Chamaeleo chamaeleon' AND hb.slug = 'aguas-oligomesotroficas-calcareas-3140') OR
  (sp.scientific_name = 'Chamaeleo chamaeleon' AND hb.slug = 'estanques-temporales-mediterraneos-3170') OR
  (sp.scientific_name = 'Chamaeleo chamaeleon' AND hb.slug = 'rios-mediterraneos-de-3280') OR
  (sp.scientific_name = 'Ziziphus lotus' AND hb.slug = 'aguas-oligomesotroficas-calcareas-3140') OR
  (sp.scientific_name = 'Ziziphus lotus' AND hb.slug = 'estanques-temporales-mediterraneos-3170') OR
  (sp.scientific_name = 'Ziziphus lotus' AND hb.slug = 'rios-mediterraneos-de-3280') OR
  (sp.scientific_name = 'Thymelaea hirsuta' AND hb.slug = 'rios-mediterraneos-de-3250') OR
  (sp.scientific_name = 'Bituminaria bituminosa' AND hb.slug = 'aguas-oligomesotroficas-calcareas-3140') OR
  (sp.scientific_name = 'Bituminaria bituminosa' AND hb.slug = 'estanques-temporales-mediterraneos-3170') OR
  (sp.scientific_name = 'Bituminaria bituminosa' AND hb.slug = 'manantiales-petrificantes-con-7220') OR
  (sp.scientific_name = 'Bituminaria bituminosa' AND hb.slug = 'rios-mediterraneos-de-3280') OR
  (sp.scientific_name = 'Lotus dorycnium' AND hb.slug = 'aguas-oligomesotroficas-calcareas-3140') OR
  (sp.scientific_name = 'Lotus dorycnium' AND hb.slug = 'estanques-temporales-mediterraneos-3170') OR
  (sp.scientific_name = 'Lotus dorycnium' AND hb.slug = 'rios-mediterraneos-de-3280') OR
  (sp.scientific_name = 'Tarentola mauritanica' AND hb.slug = 'aguas-oligomesotroficas-calcareas-3140') OR
  (sp.scientific_name = 'Tarentola mauritanica' AND hb.slug = 'estanques-temporales-mediterraneos-3170') OR
  (sp.scientific_name = 'Tarentola mauritanica' AND hb.slug = 'rios-mediterraneos-de-3280') OR
  (sp.scientific_name = 'Teucrium capitatum' AND hb.slug = 'manantiales-petrificantes-con-7220') OR
  (sp.scientific_name = 'Ephedra fragilis' AND hb.slug = 'manantiales-petrificantes-con-7220') OR
  (sp.scientific_name = 'Thymus zygis' AND hb.slug = 'aguas-oligomesotroficas-calcareas-3140') OR
  (sp.scientific_name = 'Thymus zygis' AND hb.slug = 'manantiales-petrificantes-con-7220') OR
  (sp.scientific_name = 'Thymus zygis' AND hb.slug = 'rios-mediterraneos-de-3280') OR
  (sp.scientific_name = 'Capra pyrenaica' AND hb.slug = 'rios-mediterraneos-de-3250') OR
  (sp.scientific_name = 'Osyris lanceolata' AND hb.slug = 'aguas-oligomesotroficas-calcareas-3140') OR
  (sp.scientific_name = 'Osyris lanceolata' AND hb.slug = 'manantiales-petrificantes-con-7220') OR
  (sp.scientific_name = 'Osyris lanceolata' AND hb.slug = 'rios-mediterraneos-de-3280') OR
  (sp.scientific_name = 'Hemorrhois hippocrepis' AND hb.slug = 'aguas-oligomesotroficas-calcareas-3140') OR
  (sp.scientific_name = 'Hemorrhois hippocrepis' AND hb.slug = 'estanques-temporales-mediterraneos-3170') OR
  (sp.scientific_name = 'Hemorrhois hippocrepis' AND hb.slug = 'rios-mediterraneos-de-3280') OR
  (sp.scientific_name = 'Narcissus serotinus' AND hb.slug = 'aguas-oligomesotroficas-calcareas-3140') OR
  (sp.scientific_name = 'Narcissus serotinus' AND hb.slug = 'estanques-temporales-mediterraneos-3170') OR
  (sp.scientific_name = 'Narcissus serotinus' AND hb.slug = 'rios-mediterraneos-de-3280') OR
  (sp.scientific_name = 'Peganum harmala' AND hb.slug = 'aguas-oligomesotroficas-calcareas-3140') OR
  (sp.scientific_name = 'Peganum harmala' AND hb.slug = 'manantiales-petrificantes-con-7220') OR
  (sp.scientific_name = 'Peganum harmala' AND hb.slug = 'rios-mediterraneos-de-3280')
);
