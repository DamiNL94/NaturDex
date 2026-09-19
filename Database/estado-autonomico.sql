-- NaturDex · estado legal autonómico corregido (regional_status)
-- El juego de caracteres se fija SIEMPRE: el cliente `mysql` lo toma del entorno y en un
-- contenedor sin locale eso es latin1, que convierte cada tilde en mojibake sin dar error.
SET NAMES utf8mb4;

-- Generado por `node Tools/catalogo-nacional/corrige-estado-autonomico.js --sql <ruta>`.
-- Cada UPDATE lleva la corrección que `data/estado-autonomico-correcciones.json` declara y
-- que el cotejo contra EIDOS y el boletín respaldan. Solo toca esa columna: NO regenera la
-- ficha (trampa nº 6). Idempotente, y espejo de lo que dice el repositorio.

START TRANSACTION;

-- ── barrancos-de-gebas ──
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Burhinus oedicnemus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Galerida theklae';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Oenanthe leucura';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de Murcia (Ley 7/1995): De interés especial'
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Pyrrhocorax pyrrhocorax';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'barrancos-de-gebas' AND sp.scientific_name = 'Rhamnus lycioides';

-- ── cabezo-gordo ──
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Burhinus oedicnemus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'Vulnerable (Decreto n.º 50/2003, de 30 de mayo por el que se crea el Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia y se dictan Normas para el aprovechamiento de diversas especies forestales.)'
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Caralluma europaea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Epidalea calamita';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Galerida theklae';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'cabezo-gordo' AND sp.scientific_name = 'Oenanthe leucura';

-- ── cabo-cope-puntas-calnegre ──
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'cabo-cope-puntas-calnegre' AND sp.scientific_name = 'Accipiter gentilis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'cabo-cope-puntas-calnegre' AND sp.scientific_name = 'Burhinus oedicnemus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'cabo-cope-puntas-calnegre' AND sp.scientific_name = 'Caprimulgus ruficollis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'cabo-cope-puntas-calnegre' AND sp.scientific_name = 'Falco tinnunculus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'cabo-cope-puntas-calnegre' AND sp.scientific_name = 'Galerida theklae';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de Murcia (Ley 7/1995): Vulnerable'
 WHERE pk.slug = 'cabo-cope-puntas-calnegre' AND sp.scientific_name = 'Gulosus aristotelis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'cabo-cope-puntas-calnegre' AND sp.scientific_name = 'Hieraaetus pennatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'Especies de interés especial (Decreto n.º 50/2003, de 30 de mayo por el que se crea el Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia y se dictan Normas para el aprovechamiento de diversas especies forestales.)'
 WHERE pk.slug = 'cabo-cope-puntas-calnegre' AND sp.scientific_name = 'Juniperus phoenicea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'cabo-cope-puntas-calnegre' AND sp.scientific_name = 'Jynx torquilla';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'cabo-cope-puntas-calnegre' AND sp.scientific_name = 'Melanocorypha calandra';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'cabo-cope-puntas-calnegre' AND sp.scientific_name = 'Muscicapa striata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'cabo-cope-puntas-calnegre' AND sp.scientific_name = 'Oenanthe hispanica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'cabo-cope-puntas-calnegre' AND sp.scientific_name = 'Oenanthe leucura';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de Murcia (Ley 7/1995): De interés especial'
 WHERE pk.slug = 'cabo-cope-puntas-calnegre' AND sp.scientific_name = 'Pyrrhocorax pyrrhocorax';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'cabo-cope-puntas-calnegre' AND sp.scientific_name = 'Rhamnus lycioides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'cabo-cope-puntas-calnegre' AND sp.scientific_name = 'Streptopelia turtur';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'cabo-cope-puntas-calnegre' AND sp.scientific_name = 'Tichodroma muraria';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'cabo-cope-puntas-calnegre' AND sp.scientific_name = 'Upupa epops';

-- ── calblanque-monte-cenizas-pena-aguila ──
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Burhinus oedicnemus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'Vulnerable (Decreto n.º 50/2003, de 30 de mayo por el que se crea el Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia y se dictan Normas para el aprovechamiento de diversas especies forestales.)'
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Caralluma europaea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Epidalea calamita';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Genetta genetta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'Especies de interés especial (Decreto n.º 50/2003, de 30 de mayo por el que se crea el Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia y se dictan Normas para el aprovechamiento de diversas especies forestales.)'
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Juniperus phoenicea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Martes foina';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'calblanque-monte-cenizas-pena-aguila' AND sp.scientific_name = 'Quercus coccifera';

-- ── carrascoy-y-el-valle ──
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Accipiter gentilis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Burhinus oedicnemus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'Vulnerable (Ley 7/1995, de 21 de abril, de la fauna silvestre, caza y pesca fluvial de la Región de Murcia.)'
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Capra pyrenaica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Epidalea calamita';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Galerida theklae';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'Especies de interés especial (Decreto n.º 50/2003, de 30 de mayo por el que se crea el Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia y se dictan Normas para el aprovechamiento de diversas especies forestales.)'
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Juniperus phoenicea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Oenanthe leucura';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de Murcia (Ley 7/1995): De interés especial'
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Pyrrhocorax pyrrhocorax';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Quercus coccifera';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'carrascoy-y-el-valle' AND sp.scientific_name = 'Rhamnus lycioides';

-- ── cuatro-calas ──
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de Murcia (Ley 7/1995): Vulnerable'
 WHERE pk.slug = 'cuatro-calas' AND sp.scientific_name = 'Hydrobates pelagicus';

-- ── espacios-abiertos-e-islas-del-mar-menor ──
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Burhinus oedicnemus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'Vulnerable (Decreto n.º 50/2003, de 30 de mayo por el que se crea el Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia y se dictan Normas para el aprovechamiento de diversas especies forestales.)'
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Caralluma europaea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Epidalea calamita';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'Especies de interés especial (Decreto n.º 50/2003, de 30 de mayo por el que se crea el Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia y se dictan Normas para el aprovechamiento de diversas especies forestales.)'
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Juniperus phoenicea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Oenanthe leucura';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'Especies de interés especial (Decreto n.º 50/2003, de 30 de mayo por el que se crea el Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia y se dictan Normas para el aprovechamiento de diversas especies forestales.)'
 WHERE pk.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND sp.scientific_name = 'Scilla autumnalis';

-- ── humedal-del-ajauque-y-rambla-salada ──
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Burhinus oedicnemus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Epidalea calamita';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Genetta genetta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'humedal-del-ajauque-y-rambla-salada' AND sp.scientific_name = 'Oenanthe leucura';

-- ── monte-arabi ──
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Accipiter gentilis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Burhinus oedicnemus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'Vulnerable (Ley 7/1995, de 21 de abril, de la fauna silvestre, caza y pesca fluvial de la Región de Murcia.)'
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Capra pyrenaica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Caprimulgus ruficollis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Epidalea calamita';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Galerida theklae';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Genetta genetta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Hieraaetus pennatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Martes foina';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Melanocorypha calandra';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Merops apiaster';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Muscicapa striata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Oenanthe hispanica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Oenanthe leucura';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de Murcia (Ley 7/1995): De interés especial'
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Pyrrhocorax pyrrhocorax';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Quercus coccifera';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Rhamnus lycioides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'monte-arabi' AND sp.scientific_name = 'Streptopelia turtur';

-- ── salinas-arenales-san-pedro-pinatar ──
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Burhinus oedicnemus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Epidalea calamita';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'Especies de interés especial (Decreto n.º 50/2003, de 30 de mayo por el que se crea el Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia y se dictan Normas para el aprovechamiento de diversas especies forestales.)'
 WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar' AND sp.scientific_name = 'Juniperus phoenicea';

-- ── sierra-de-el-carche ──
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Accipiter gentilis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Burhinus oedicnemus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'Vulnerable (Ley 7/1995, de 21 de abril, de la fauna silvestre, caza y pesca fluvial de la Región de Murcia.)'
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Capra pyrenaica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Epidalea calamita';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Galerida theklae';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Genetta genetta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'Especies de interés especial (Decreto n.º 50/2003, de 30 de mayo por el que se crea el Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia y se dictan Normas para el aprovechamiento de diversas especies forestales.)'
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Juniperus phoenicea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Martes foina';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Muscicapa striata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Oenanthe leucura';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de Murcia (Ley 7/1995): De interés especial'
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Pyrrhocorax pyrrhocorax';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Quercus coccifera';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Rhamnus lycioides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'Especies de interés especial (Decreto n.º 50/2003, de 30 de mayo por el que se crea el Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia y se dictan Normas para el aprovechamiento de diversas especies forestales.)'
 WHERE pk.slug = 'sierra-de-el-carche' AND sp.scientific_name = 'Rhamnus pumila';

-- ── sierra-de-la-pila ──
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Burhinus oedicnemus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Caprimulgus ruficollis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Epidalea calamita';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Galerida theklae';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Genetta genetta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'Especies de interés especial (Decreto n.º 50/2003, de 30 de mayo por el que se crea el Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia y se dictan Normas para el aprovechamiento de diversas especies forestales.)'
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Juniperus phoenicea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Jynx torquilla';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Martes foina';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Merops apiaster';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Oenanthe leucura';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de Murcia (Ley 7/1995): De interés especial'
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Pyrrhocorax pyrrhocorax';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Quercus coccifera';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-de-la-pila' AND sp.scientific_name = 'Rhamnus lycioides';

-- ── sierra-de-las-moreras ──
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Accipiter gentilis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Burhinus oedicnemus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Caprimulgus ruficollis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Falco tinnunculus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Galerida theklae';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de Murcia (Ley 7/1995): Vulnerable'
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Gulosus aristotelis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Hieraaetus pennatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Jynx torquilla';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Melanocorypha calandra';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Muscicapa striata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Oenanthe hispanica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Oenanthe leucura';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de Murcia (Ley 7/1995): De interés especial'
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Pyrrhocorax pyrrhocorax';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Rhamnus lycioides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Streptopelia turtur';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Tichodroma muraria';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-de-las-moreras' AND sp.scientific_name = 'Upupa epops';

-- ── sierra-de-salinas ──
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Accipiter gentilis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Burhinus oedicnemus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Caprimulgus ruficollis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Galerida theklae';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Genetta genetta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'Especies de interés especial (Decreto n.º 50/2003, de 30 de mayo por el que se crea el Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia y se dictan Normas para el aprovechamiento de diversas especies forestales.)'
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Juniperus phoenicea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Martes foina';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Melanocorypha calandra';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'Vulnerable (Decreto n.º 50/2003, de 30 de mayo por el que se crea el Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia y se dictan Normas para el aprovechamiento de diversas especies forestales.)'
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Micromeria fruticosa';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Oenanthe hispanica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Oenanthe leucura';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de Murcia (Ley 7/1995): De interés especial'
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Pyrrhocorax pyrrhocorax';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Quercus coccifera';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Rhamnus lycioides';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'Especies de interés especial (Decreto n.º 50/2003, de 30 de mayo por el que se crea el Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia y se dictan Normas para el aprovechamiento de diversas especies forestales.)'
 WHERE pk.slug = 'sierra-de-salinas' AND sp.scientific_name = 'Rhamnus pumila';

-- ── sierra-espuna ──
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Accipiter gentilis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Burhinus oedicnemus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'Vulnerable (Ley 7/1995, de 21 de abril, de la fauna silvestre, caza y pesca fluvial de la Región de Murcia.)'
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Capra pyrenaica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Caprimulgus ruficollis';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Epidalea calamita';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Falco tinnunculus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Galerida theklae';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Genetta genetta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Hieraaetus pennatus';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'Especies de interés especial (Decreto n.º 50/2003, de 30 de mayo por el que se crea el Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia y se dictan Normas para el aprovechamiento de diversas especies forestales.)'
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Juniperus phoenicea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Jynx torquilla';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Martes foina';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Melanocorypha calandra';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Merops apiaster';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Muscicapa striata';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Oenanthe hispanica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Oenanthe leucura';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de Murcia (Ley 7/1995): De interés especial'
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Pyrrhocorax pyrrhocorax';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Quercus coccifera';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Streptopelia turtur';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Tichodroma muraria';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Upupa epops';

-- ── sotos-y-bosques-de-ribera-de-canaverosa ──
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'Vulnerable (Ley 7/1995, de 21 de abril, de la fauna silvestre, caza y pesca fluvial de la Región de Murcia.)'
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Capra pyrenaica';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Epidalea calamita';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Galerida theklae';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Genetta genetta';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'Especies de interés especial (Decreto n.º 50/2003, de 30 de mayo por el que se crea el Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia y se dictan Normas para el aprovechamiento de diversas especies forestales.)'
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Juniperus phoenicea';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Martes foina';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'No incluida en Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia ni en Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de la Región de Murcia ni en Catalogación de la malvasía cabeciblanca (Región de Murcia)'
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Oenanthe leucura';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de Murcia (Ley 7/1995): De interés especial'
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Pyrrhocorax pyrrhocorax';
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.regional_status = 'Vulnerable (Decreto n.º 50/2003, de 30 de mayo por el que se crea el Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia y se dictan Normas para el aprovechamiento de diversas especies forestales.)'
 WHERE pk.slug = 'sotos-y-bosques-de-ribera-de-canaverosa' AND sp.scientific_name = 'Sambucus nigra';

COMMIT;
