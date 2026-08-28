-- El juego de caracteres se fija SIEMPRE: el cliente `mysql` lo toma del entorno y en un
-- contenedor sin locale eso es latin1, que convierte cada tilde en mojibake sin dar error.
SET NAMES utf8mb4;

-- ================================================================================================
-- NaturDex · comunidad autónoma del estado regional de cada ficha (2026-08-27)
-- ------------------------------------------------------------------------------------------------
-- Generado por `node Tools/catalogo-nacional/migra-estado-regional.js --write --sql`.
--
-- VA DESPUÉS de `Database/migrations.sql`, que es quien renombra `murcia_status` a
-- `regional_status` y crea `regional_ccaa`. El renombrado CONSERVA los textos: aquí no se
-- vuelve a escribir ninguno, solo se dice de qué comunidad hablan.
--
-- Una sentencia por ESPACIO y no por ficha: la comunidad es del espacio, no del taxón.
-- Idempotente: aplicado dos veces, la segunda escribe el mismo valor.
-- ================================================================================================

START TRANSACTION;

-- barrancos-de-gebas · 86 ficha(s)
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_ccaa = 'Región de Murcia'
 WHERE pk.slug = 'barrancos-de-gebas';

-- cabezo-gordo · 58 ficha(s)
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_ccaa = 'Región de Murcia'
 WHERE pk.slug = 'cabezo-gordo';

-- cabo-cope-puntas-calnegre · 162 ficha(s)
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_ccaa = 'Región de Murcia'
 WHERE pk.slug = 'cabo-cope-puntas-calnegre';

-- calblanque-monte-cenizas-pena-aguila · 204 ficha(s)
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_ccaa = 'Región de Murcia'
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila';

-- carrascoy-y-el-valle · 363 ficha(s)
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_ccaa = 'Región de Murcia'
 WHERE pk.slug = 'carrascoy-y-el-valle';

-- cuatro-calas · 93 ficha(s)
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_ccaa = 'Región de Murcia'
 WHERE pk.slug = 'cuatro-calas';

-- espacios-abiertos-e-islas-del-mar-menor · 250 ficha(s)
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_ccaa = 'Región de Murcia'
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor';

-- humedal-del-ajauque-y-rambla-salada · 183 ficha(s)
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_ccaa = 'Región de Murcia'
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada';

-- monte-arabi · 68 ficha(s)
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_ccaa = 'Región de Murcia'
 WHERE pk.slug = 'monte-arabi';

-- salinas-arenales-san-pedro-pinatar · 354 ficha(s)
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_ccaa = 'Región de Murcia'
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar';

-- sierra-de-el-carche · 303 ficha(s)
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_ccaa = 'Región de Murcia'
 WHERE pk.slug = 'sierra-de-el-carche';

-- sierra-de-la-pila · 219 ficha(s)
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_ccaa = 'Región de Murcia'
 WHERE pk.slug = 'sierra-de-la-pila';

-- sierra-de-las-moreras · 64 ficha(s)
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_ccaa = 'Región de Murcia'
 WHERE pk.slug = 'sierra-de-las-moreras';

-- sierra-de-salinas · 105 ficha(s)
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_ccaa = 'Región de Murcia'
 WHERE pk.slug = 'sierra-de-salinas';

-- sierra-espuna · 188 ficha(s)
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_ccaa = 'Región de Murcia'
 WHERE pk.slug = 'sierra-espuna';

-- sotos-y-bosques-de-ribera-de-canaverosa · 245 ficha(s)
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_ccaa = 'Región de Murcia'
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa';

COMMIT;

-- Comprobación: no debe quedar ninguna ficha con estado regional y sin comunidad.
SELECT pk.slug, COUNT(*) AS sin_comunidad
  FROM species sp JOIN parks pk ON pk.id = sp.park_id
 WHERE sp.regional_status IS NOT NULL AND sp.regional_ccaa IS NULL
 GROUP BY pk.slug;
