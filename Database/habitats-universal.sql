-- El juego de caracteres se fija SIEMPRE: el cliente `mysql` lo toma del entorno y en un
-- contenedor sin locale eso es latin1, que convierte cada tilde en mojibake sin dar error.
SET NAMES utf8mb4;

-- habitats-universal.sql — descripción universal de las fichas de hábitat.
-- GENERADO por Tools/sync-habitat-catalog.js --apply --sql. No editar a mano:
-- la fuente es Tools/catalogo-nacional/data/contenido/habitats.json, indexada por código HIC.
--
-- Hace falta porque Frontend/Js/data.js prioriza la respuesta de la API sobre el park.json
-- empaquetado: sin aplicar esto, un despliegue con backend seguiría sirviendo los textos viejos.

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'El matorral de las zonas más cálidas y secas, allí donde prácticamente no hiela: palmito, espino negro, lentisco, cornicales, bojas, albaidas y esparto sobre laderas pedregosas y llanos soleados. Es un matorral abierto, con suelo desnudo a la vista entre mata y mata, y con muchas especies compartidas con el norte de África. Aguanta sequías de meses y rebrota en cuanto llueve.'
WHERE p.slug = 'cabezo-gordo' AND h.code = '5330';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Espinares de azufaifo (Ziziphus lotus), matas hemisféricas de ramas entrelazadas y espinas ganchudas que forman islas de sombra sobre llanos áridos. Cada mata levanta un pequeño montículo de arena y hojarasca y guarda debajo humedad, semillas y fauna que fuera no sobreviviría. Es el único hábitat de clima casi desértico de Europa occidental, y por eso figura como prioritario.'
WHERE p.slug = 'cabezo-gordo' AND h.code = '5220';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Paredes y cortados de roca caliza en los que la vegetación no vive sobre el suelo, sino dentro de las fisuras. Son plantas de raíz larguísima y crecimiento lentísimo, agarradas a la grieta, que aprovechan el agua que escurre por la pared. Los roquedos han quedado a salvo del arado y del ganado durante milenios, y por eso concentran una proporción altísima de especies que no existen en ningún otro lugar.'
WHERE p.slug = 'cabezo-gordo' AND h.code = '8210';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Pastizales secos en los que conviven gramíneas vivaces de mata dura, como el lastón (Brachypodium retusum) o el esparto, con una multitud de plantas anuales diminutas que nacen con las lluvias y se secan antes del verano. En agosto parecen un erial pardo; en abril pueden reunir cuarenta especies distintas en un metro cuadrado. Esa riqueza escondida es la razón de que sea un hábitat prioritario.'
WHERE p.slug = 'cabezo-gordo' AND h.code = '6220';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Roquedos del borde del mar, batidos por el viento y salpicados constantemente de sal. Las plantas viven agarradas a las grietas, con hojas gruesas o cerosas para no perder agua, y las más características son las siemprevivas (Limonium) y el hinojo marino. Muchas de esas siemprevivas viven solo en un tramo corto de costa y en ningún otro sitio del mundo.'
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND h.code = '1240';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Claros de arena entre el matorral dunar en los que, tras las lluvias, germina un césped efímero de plantas diminutas que florecen y se secan en pocas semanas. Pasan el resto del año como semilla enterrada, de modo que durante casi todo el verano el sitio parece arena vacía. Es un hábitat que solo se ve entero unas semanas al año, y por eso se destruye sin que nadie note que había algo.'
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND h.code = '2230';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'El primer relieve de arena de la playa, de apenas unos decímetros, que se forma donde una planta rastrera frena el viento y la arena se deposita a su alrededor. La construyen la grama de mar (Elymus farctus) y la juncia marina, capaces de crecer hacia arriba a medida que quedan enterradas. Es la duna naciente: si se pisa o se allana, todo el cordón dunar que hay detrás se queda sin recambio.'
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND h.code = '2110';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Estepas de suelos salinos pero secos, sin encharcamiento permanente, en depresiones y llanos interiores de clima duro. Dominan el albardín (Lygeum spartum), una gramínea de matas separadas y hojas punzantes, y las siemprevivas (Limonium), que en verano cubren el suelo desnudo de flores diminutas rosas y violetas. Es un paisaje de aspecto pobre que concentra un número altísimo de plantas que no crecen en ningún otro ambiente.'
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND h.code = '1510';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'La vegetación leñosa de ramblas, arroyos y ríos de caudal irregular, que unos meses llevan agua y otros son un lecho de piedras: adelfares y tarayales. La adelfa (Nerium oleander), de hojas coriáceas y flores rosas, y los tarays (Tamarix), de ramillas finas y flores en espiga, resisten tanto las avenidas violentas como meses de sequía. Toda la adelfa es muy tóxica, incluidas hojas y ramas secas.'
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND h.code = '92D0';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'El matorral de las zonas más cálidas y secas, allí donde prácticamente no hiela: palmito, espino negro, lentisco, cornicales, bojas, albaidas y esparto sobre laderas pedregosas y llanos soleados. Es un matorral abierto, con suelo desnudo a la vista entre mata y mata, y con muchas especies compartidas con el norte de África. Aguanta sequías de meses y rebrota en cuanto llueve.'
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND h.code = '5330';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Matorral alto o bosquete abierto dominado por enebros y sabinas (Juniperus), arbustos de follaje escamoso o punzante y porte denso que aguantan sequía, viento y suelos casi inexistentes. Sus frutos carnosos y azulados —los gálbulos— alimentan en invierno a zorzales y otras aves, que se encargan de dispersar la semilla. Crecen tan despacio que un ejemplar de dos metros puede tener siglos.'
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND h.code = '5210';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Espinares de azufaifo (Ziziphus lotus), matas hemisféricas de ramas entrelazadas y espinas ganchudas que forman islas de sombra sobre llanos áridos. Cada mata levanta un pequeño montículo de arena y hojarasca y guarda debajo humedad, semillas y fauna que fuera no sobreviviría. Es el único hábitat de clima casi desértico de Europa occidental, y por eso figura como prioritario.'
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND h.code = '5220';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Matorral de suelos salinos removidos y cargados de nitrógeno: bordes de camino y de cultivo, márgenes de rambla, corrales y escombreras viejas. Lo forman matas robustas de hoja gris o carnosa —orgazas, sosas, bojas y cambroneras— que rebrotan enseguida tras cualquier alteración. Aunque nace de terrenos trastocados, es vegetación propia de los ambientes áridos del sureste y a menudo el último refugio de plantas escasas.'
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND h.code = '1430';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Matorral bajo y carnoso de sosas y almajos (Sarcocornia, Arthrocnemum, Halocnemum) sobre suelos que se inundan de agua salada y luego se secan dejando costra de sal. Son matas de tallos gruesos y articulados, sin hojas aparentes, que almacenan agua y diluyen en ella la sal que absorben. En otoño viran a rojo, naranja y morado, y ese cambio de color es la señal más visible del saladar.'
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND h.code = '1420';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Paredes y cortados de roca caliza en los que la vegetación no vive sobre el suelo, sino dentro de las fisuras. Son plantas de raíz larguísima y crecimiento lentísimo, agarradas a la grieta, que aprovechan el agua que escurre por la pared. Los roquedos han quedado a salvo del arado y del ganado durante milenios, y por eso concentran una proporción altísima de especies que no existen en ningún otro lugar.'
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND h.code = '8210';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Pastos abiertos sobre repisas y lanchas de roca caliza con apenas un dedo de tierra encima. Ahí solo prosperan plantas crasas de hojas gordas, como las uñas de gato (Sedum), y hierbas anuales minúsculas que nacen, florecen y mueren entre febrero y mayo. Ocupa superficies muy pequeñas y depende de que el suelo siga siendo escaso: en cuanto se acumula tierra, otras plantas lo desplazan.'
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND h.code = '6110';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Tramos de río con agua todo el año y lecho de gravas y cantos que las crecidas remueven y vuelven a depositar. Sobre esas barras de piedra suelta crece la amapola marina (Glaucium flavum), de hojas de un verde azulado y flores amarillas grandes, junto a otras plantas que aguantan que el sustrato cambie de sitio cada invierno. Es vegetación de terreno inestable: sin crecidas, la maleza la desplaza.'
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND h.code = '3250';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'La primera línea de vegetación de una playa: plantas anuales que germinan sobre los restos que deja la marea, aprovechando el poco alimento y la humedad que guarda esa franja de algas y madera. Son hierbas carnosas de vida corta, como el rábano de mar (Cakile maritima) o la barrilla pinchosa (Salsola kali), que completan su ciclo en una sola temporada. Desaparece por completo donde se limpia la arena con maquinaria.'
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND h.code = '1210';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Pastizales secos en los que conviven gramíneas vivaces de mata dura, como el lastón (Brachypodium retusum) o el esparto, con una multitud de plantas anuales diminutas que nacen con las lluvias y se secan antes del verano. En agosto parecen un erial pardo; en abril pueden reunir cuarenta especies distintas en un metro cuadrado. Esa riqueza escondida es la razón de que sea un hábitat prioritario.'
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND h.code = '6220';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'El matorral de las zonas más cálidas y secas, allí donde prácticamente no hiela: palmito, espino negro, lentisco, cornicales, bojas, albaidas y esparto sobre laderas pedregosas y llanos soleados. Es un matorral abierto, con suelo desnudo a la vista entre mata y mata, y con muchas especies compartidas con el norte de África. Aguanta sequías de meses y rebrota en cuanto llueve.'
WHERE p.slug = 'calblanque-monte-cenizas-pena-aguila' AND h.code = '5330';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Pastizales secos en los que conviven gramíneas vivaces de mata dura, como el lastón (Brachypodium retusum) o el esparto, con una multitud de plantas anuales diminutas que nacen con las lluvias y se secan antes del verano. En agosto parecen un erial pardo; en abril pueden reunir cuarenta especies distintas en un metro cuadrado. Esa riqueza escondida es la razón de que sea un hábitat prioritario.'
WHERE p.slug = 'calblanque-monte-cenizas-pena-aguila' AND h.code = '6220';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Paredes y cortados de roca caliza en los que la vegetación no vive sobre el suelo, sino dentro de las fisuras. Son plantas de raíz larguísima y crecimiento lentísimo, agarradas a la grieta, que aprovechan el agua que escurre por la pared. Los roquedos han quedado a salvo del arado y del ganado durante milenios, y por eso concentran una proporción altísima de especies que no existen en ningún otro lugar.'
WHERE p.slug = 'calblanque-monte-cenizas-pena-aguila' AND h.code = '8210';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Roquedos del borde del mar, batidos por el viento y salpicados constantemente de sal. Las plantas viven agarradas a las grietas, con hojas gruesas o cerosas para no perder agua, y las más características son las siemprevivas (Limonium) y el hinojo marino. Muchas de esas siemprevivas viven solo en un tramo corto de costa y en ningún otro sitio del mundo.'
WHERE p.slug = 'calblanque-monte-cenizas-pena-aguila' AND h.code = '1240';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Bosques de ciprés de Cartagena (Tetraclinis articulata), una conífera norteafricana cuyas únicas poblaciones europeas están en el sureste ibérico. Tiene ramillas articuladas y aplanadas y conos leñosos de cuatro valvas que se abren como una flor de madera, y rebrota de cepa después de un incendio, cosa rara entre las coníferas. Su rareza y su área diminuta explican que sea un hábitat prioritario.'
WHERE p.slug = 'calblanque-monte-cenizas-pena-aguila' AND h.code = '9570';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Espinares de azufaifo (Ziziphus lotus), matas hemisféricas de ramas entrelazadas y espinas ganchudas que forman islas de sombra sobre llanos áridos. Cada mata levanta un pequeño montículo de arena y hojarasca y guarda debajo humedad, semillas y fauna que fuera no sobreviviría. Es el único hábitat de clima casi desértico de Europa occidental, y por eso figura como prioritario.'
WHERE p.slug = 'calblanque-monte-cenizas-pena-aguila' AND h.code = '5220';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'El bosque mediterráneo por excelencia: encinares y carrascales de hoja dura, pequeña y perenne, que aguantan tanto el calor del verano como las heladas del interior. Bajo los árboles crece un sotobosque denso de coscoja, lentisco, madroño, enebros y aromáticas, y en el suelo la bellota sostiene en otoño a jabalíes, palomas y arrendajos. Aclarado por el ser humano durante siglos, ha dado lugar a las dehesas.'
WHERE p.slug = 'calblanque-monte-cenizas-pena-aguila' AND h.code = '9340';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'La vegetación leñosa de ramblas, arroyos y ríos de caudal irregular, que unos meses llevan agua y otros son un lecho de piedras: adelfares y tarayales. La adelfa (Nerium oleander), de hojas coriáceas y flores rosas, y los tarays (Tamarix), de ramillas finas y flores en espiga, resisten tanto las avenidas violentas como meses de sequía. Toda la adelfa es muy tóxica, incluidas hojas y ramas secas.'
WHERE p.slug = 'calblanque-monte-cenizas-pena-aguila' AND h.code = '92D0';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Praderas de juncos y gramíneas sobre suelos salinos que se encharcan en invierno y se resecan en verano, tierra adentro de las marismas y en el borde de saladares y ramblas salobres. La sal se concentra en la superficie al evaporarse el agua, de modo que solo prosperan plantas capaces de bombear agua contra ella. Forman un tapiz denso y verde que contrasta con los suelos desnudos de alrededor.'
WHERE p.slug = 'calblanque-monte-cenizas-pena-aguila' AND h.code = '1410';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Matorral bajo y carnoso de sosas y almajos (Sarcocornia, Arthrocnemum, Halocnemum) sobre suelos que se inundan de agua salada y luego se secan dejando costra de sal. Son matas de tallos gruesos y articulados, sin hojas aparentes, que almacenan agua y diluyen en ella la sal que absorben. En otoño viran a rojo, naranja y morado, y ese cambio de color es la señal más visible del saladar.'
WHERE p.slug = 'calblanque-monte-cenizas-pena-aguila' AND h.code = '1420';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Matorral de suelos salinos removidos y cargados de nitrógeno: bordes de camino y de cultivo, márgenes de rambla, corrales y escombreras viejas. Lo forman matas robustas de hoja gris o carnosa —orgazas, sosas, bojas y cambroneras— que rebrotan enseguida tras cualquier alteración. Aunque nace de terrenos trastocados, es vegetación propia de los ambientes áridos del sureste y a menudo el último refugio de plantas escasas.'
WHERE p.slug = 'calblanque-monte-cenizas-pena-aguila' AND h.code = '1430';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Estepas de suelos salinos pero secos, sin encharcamiento permanente, en depresiones y llanos interiores de clima duro. Dominan el albardín (Lygeum spartum), una gramínea de matas separadas y hojas punzantes, y las siemprevivas (Limonium), que en verano cubren el suelo desnudo de flores diminutas rosas y violetas. Es un paisaje de aspecto pobre que concentra un número altísimo de plantas que no crecen en ningún otro ambiente.'
WHERE p.slug = 'calblanque-monte-cenizas-pena-aguila' AND h.code = '1510';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'El primer relieve de arena de la playa, de apenas unos decímetros, que se forma donde una planta rastrera frena el viento y la arena se deposita a su alrededor. La construyen la grama de mar (Elymus farctus) y la juncia marina, capaces de crecer hacia arriba a medida que quedan enterradas. Es la duna naciente: si se pisa o se allana, todo el cordón dunar que hay detrás se queda sin recambio.'
WHERE p.slug = 'calblanque-monte-cenizas-pena-aguila' AND h.code = '2110';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'El cordón dunar alto, de arena suelta y clara, que se levanta detrás de la playa. Lo sostiene el barrón (Ammophila arenaria), una gramínea de hojas enrolladas y punzantes que crece hacia arriba cuanta más arena la sepulta y teje bajo la superficie una red de rizomas que sujeta el montículo. Es la barrera natural que protege del temporal todo lo que queda tierra adentro.'
WHERE p.slug = 'calblanque-monte-cenizas-pena-aguila' AND h.code = '2120';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Claros de arena entre el matorral dunar en los que, tras las lluvias, germina un césped efímero de plantas diminutas que florecen y se secan en pocas semanas. Pasan el resto del año como semilla enterrada, de modo que durante casi todo el verano el sitio parece arena vacía. Es un hábitat que solo se ve entero unas semanas al año, y por eso se destruye sin que nadie note que había algo.'
WHERE p.slug = 'calblanque-monte-cenizas-pena-aguila' AND h.code = '2230';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'La primera línea de vegetación de una playa: plantas anuales que germinan sobre los restos que deja la marea, aprovechando el poco alimento y la humedad que guarda esa franja de algas y madera. Son hierbas carnosas de vida corta, como el rábano de mar (Cakile maritima) o la barrilla pinchosa (Salsola kali), que completan su ciclo en una sola temporada. Desaparece por completo donde se limpia la arena con maquinaria.'
WHERE p.slug = 'calblanque-monte-cenizas-pena-aguila' AND h.code = '1210';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Dunas ya estabilizadas, donde la arena apenas se mueve y aparecen matas leñosas bajas, líquenes y un tapiz gris azulado de hoja pequeña. Es el paso intermedio entre la duna viva y el matorral: se reconoce porque el suelo deja de ser arena limpia y empieza a tener costra y materia orgánica. Se recupera muy despacio, así que una pisada abre un claro que tarda años en cerrarse.'
WHERE p.slug = 'calblanque-monte-cenizas-pena-aguila' AND h.code = '2210';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Pastos abiertos sobre repisas y lanchas de roca caliza con apenas un dedo de tierra encima. Ahí solo prosperan plantas crasas de hojas gordas, como las uñas de gato (Sedum), y hierbas anuales minúsculas que nacen, florecen y mueren entre febrero y mayo. Ocupa superficies muy pequeñas y depende de que el suelo siga siendo escaso: en cuanto se acumula tierra, otras plantas lo desplazan.'
WHERE p.slug = 'calblanque-monte-cenizas-pena-aguila' AND h.code = '6110';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'El matorral de las zonas más cálidas y secas, allí donde prácticamente no hiela: palmito, espino negro, lentisco, cornicales, bojas, albaidas y esparto sobre laderas pedregosas y llanos soleados. Es un matorral abierto, con suelo desnudo a la vista entre mata y mata, y con muchas especies compartidas con el norte de África. Aguanta sequías de meses y rebrota en cuanto llueve.'
WHERE p.slug = 'carrascoy-y-el-valle' AND h.code = '5330';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Paredes y cortados de roca caliza en los que la vegetación no vive sobre el suelo, sino dentro de las fisuras. Son plantas de raíz larguísima y crecimiento lentísimo, agarradas a la grieta, que aprovechan el agua que escurre por la pared. Los roquedos han quedado a salvo del arado y del ganado durante milenios, y por eso concentran una proporción altísima de especies que no existen en ningún otro lugar.'
WHERE p.slug = 'carrascoy-y-el-valle' AND h.code = '8210';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Pastizales secos en los que conviven gramíneas vivaces de mata dura, como el lastón (Brachypodium retusum) o el esparto, con una multitud de plantas anuales diminutas que nacen con las lluvias y se secan antes del verano. En agosto parecen un erial pardo; en abril pueden reunir cuarenta especies distintas en un metro cuadrado. Esa riqueza escondida es la razón de que sea un hábitat prioritario.'
WHERE p.slug = 'carrascoy-y-el-valle' AND h.code = '6220';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Praderas de juncos y gramíneas sobre suelos salinos que se encharcan en invierno y se resecan en verano, tierra adentro de las marismas y en el borde de saladares y ramblas salobres. La sal se concentra en la superficie al evaporarse el agua, de modo que solo prosperan plantas capaces de bombear agua contra ella. Forman un tapiz denso y verde que contrasta con los suelos desnudos de alrededor.'
WHERE p.slug = 'carrascoy-y-el-valle' AND h.code = '1410';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'La vegetación leñosa de ramblas, arroyos y ríos de caudal irregular, que unos meses llevan agua y otros son un lecho de piedras: adelfares y tarayales. La adelfa (Nerium oleander), de hojas coriáceas y flores rosas, y los tarays (Tamarix), de ramillas finas y flores en espiga, resisten tanto las avenidas violentas como meses de sequía. Toda la adelfa es muy tóxica, incluidas hojas y ramas secas.'
WHERE p.slug = 'carrascoy-y-el-valle' AND h.code = '92D0';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Matorral bajo y ralo que crece únicamente sobre yeso, un suelo blanquecino que forma costra y en el que casi ninguna otra planta prospera. Las que lo consiguen están especializadas en ese sustrato y muchas no viven en ningún otro sitio, de modo que cada afloramiento de yeso tiene su propia flora. No se recupera: al roturar o extraer el yeso desaparecen a la vez el suelo y lo que crecía sobre él.'
WHERE p.slug = 'carrascoy-y-el-valle' AND h.code = '1520';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Fondos de charcas, lagunas y remansos de agua clara y dura, tapizados por praderas sumergidas de unas algas verdes grandes que arraigan en el limo y ramifican en pisos, con aspecto de cola de caballo. Solo prosperan donde el agua es transparente y pobre en nutrientes, así que su presencia es en sí misma una señal de que está limpia. Un vertido de abonos o un enturbiamiento que se prolongue las hacen desaparecer.'
WHERE p.slug = 'carrascoy-y-el-valle' AND h.code = '3140';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Charcas y navajos que se llenan con las lluvias y se secan por completo en verano, a veces en pocas semanas. Ese secado no es un fallo, es parte del hábitat: al no haber peces, pueden criar anfibios y crustáceos diminutos que resisten enterrados como huevo o quiste hasta la siguiente lluvia. La vegetación es de plantas menudas que aprovechan el barro húmedo del fondo cuando el agua se retira.'
WHERE p.slug = 'carrascoy-y-el-valle' AND h.code = '3170';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Ríos de caudal permanente y corriente lenta, con orillas de limo que quedan al descubierto en verano. Allí se instalan céspedes densos de gramíneas que soportan quedar sumergidas y ser pisoteadas, bajo una cortina de sauces, álamos o tarays. El agua tibia, poco profunda y bien iluminada de estas orillas es donde se concentran los insectos acuáticos y los alevines.'
WHERE p.slug = 'carrascoy-y-el-valle' AND h.code = '3280';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Juncales altos sobre suelos que mantienen humedad en profundidad todo el verano, aunque la superficie esté seca: bordes de acequia, manantiales, vegas y fondos de valle. El junco churrero (Scirpoides holoschoenus) forma macollas robustas entre las que crecen menta, lirios y a menudo orquídeas. Es un oasis de verde en pleno agosto, y desaparece en cuanto se drena o se capta el agua que lo alimenta.'
WHERE p.slug = 'carrascoy-y-el-valle' AND h.code = '6420';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Pastos abiertos sobre repisas y lanchas de roca caliza con apenas un dedo de tierra encima. Ahí solo prosperan plantas crasas de hojas gordas, como las uñas de gato (Sedum), y hierbas anuales minúsculas que nacen, florecen y mueren entre febrero y mayo. Ocupa superficies muy pequeñas y depende de que el suelo siga siendo escaso: en cuanto se acumula tierra, otras plantas lo desplazan.'
WHERE p.slug = 'carrascoy-y-el-valle' AND h.code = '6110';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Rezumaderos y paredes por donde el agua brota cargada de cal y la va depositando sobre los musgos y helechos que los tapizan, hasta formar una roca porosa y ligera llamada toba. La fabrica la propia vegetación y lo hace muy despacio, así que la roca y los seres vivos que la levantan son inseparables. Basta con que el manantial se seque o se capte su agua para que el proceso se detenga.'
WHERE p.slug = 'carrascoy-y-el-valle' AND h.code = '7220';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'El bosque mediterráneo por excelencia: encinares y carrascales de hoja dura, pequeña y perenne, que aguantan tanto el calor del verano como las heladas del interior. Bajo los árboles crece un sotobosque denso de coscoja, lentisco, madroño, enebros y aromáticas, y en el suelo la bellota sostiene en otoño a jabalíes, palomas y arrendajos. Aclarado por el ser humano durante siglos, ha dado lugar a las dehesas.'
WHERE p.slug = 'carrascoy-y-el-valle' AND h.code = '9340';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Tramos de río con agua todo el año y lecho de gravas y cantos que las crecidas remueven y vuelven a depositar. Sobre esas barras de piedra suelta crece la amapola marina (Glaucium flavum), de hojas de un verde azulado y flores amarillas grandes, junto a otras plantas que aguantan que el sustrato cambie de sitio cada invierno. Es vegetación de terreno inestable: sin crecidas, la maleza la desplaza.'
WHERE p.slug = 'carrascoy-y-el-valle' AND h.code = '3250';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Matorral alto o bosquete abierto dominado por enebros y sabinas (Juniperus), arbustos de follaje escamoso o punzante y porte denso que aguantan sequía, viento y suelos casi inexistentes. Sus frutos carnosos y azulados —los gálbulos— alimentan en invierno a zorzales y otras aves, que se encargan de dispersar la semilla. Crecen tan despacio que un ejemplar de dos metros puede tener siglos.'
WHERE p.slug = 'carrascoy-y-el-valle' AND h.code = '5210';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Matorral bajo y carnoso de sosas y almajos (Sarcocornia, Arthrocnemum, Halocnemum) sobre suelos que se inundan de agua salada y luego se secan dejando costra de sal. Son matas de tallos gruesos y articulados, sin hojas aparentes, que almacenan agua y diluyen en ella la sal que absorben. En otoño viran a rojo, naranja y morado, y ese cambio de color es la señal más visible del saladar.'
WHERE p.slug = 'cuatro-calas' AND h.code = '1420';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Matorral de suelos salinos removidos y cargados de nitrógeno: bordes de camino y de cultivo, márgenes de rambla, corrales y escombreras viejas. Lo forman matas robustas de hoja gris o carnosa —orgazas, sosas, bojas y cambroneras— que rebrotan enseguida tras cualquier alteración. Aunque nace de terrenos trastocados, es vegetación propia de los ambientes áridos del sureste y a menudo el último refugio de plantas escasas.'
WHERE p.slug = 'cuatro-calas' AND h.code = '1430';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Estepas de suelos salinos pero secos, sin encharcamiento permanente, en depresiones y llanos interiores de clima duro. Dominan el albardín (Lygeum spartum), una gramínea de matas separadas y hojas punzantes, y las siemprevivas (Limonium), que en verano cubren el suelo desnudo de flores diminutas rosas y violetas. Es un paisaje de aspecto pobre que concentra un número altísimo de plantas que no crecen en ningún otro ambiente.'
WHERE p.slug = 'cuatro-calas' AND h.code = '1510';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Pastizales secos en los que conviven gramíneas vivaces de mata dura, como el lastón (Brachypodium retusum) o el esparto, con una multitud de plantas anuales diminutas que nacen con las lluvias y se secan antes del verano. En agosto parecen un erial pardo; en abril pueden reunir cuarenta especies distintas en un metro cuadrado. Esa riqueza escondida es la razón de que sea un hábitat prioritario.'
WHERE p.slug = 'cuatro-calas' AND h.code = '6220';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'La vegetación leñosa de ramblas, arroyos y ríos de caudal irregular, que unos meses llevan agua y otros son un lecho de piedras: adelfares y tarayales. La adelfa (Nerium oleander), de hojas coriáceas y flores rosas, y los tarays (Tamarix), de ramillas finas y flores en espiga, resisten tanto las avenidas violentas como meses de sequía. Toda la adelfa es muy tóxica, incluidas hojas y ramas secas.'
WHERE p.slug = 'cuatro-calas' AND h.code = '92D0';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'El matorral de las zonas más cálidas y secas, allí donde prácticamente no hiela: palmito, espino negro, lentisco, cornicales, bojas, albaidas y esparto sobre laderas pedregosas y llanos soleados. Es un matorral abierto, con suelo desnudo a la vista entre mata y mata, y con muchas especies compartidas con el norte de África. Aguanta sequías de meses y rebrota en cuanto llueve.'
WHERE p.slug = 'cuatro-calas' AND h.code = '5330';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Espinares de azufaifo (Ziziphus lotus), matas hemisféricas de ramas entrelazadas y espinas ganchudas que forman islas de sombra sobre llanos áridos. Cada mata levanta un pequeño montículo de arena y hojarasca y guarda debajo humedad, semillas y fauna que fuera no sobreviviría. Es el único hábitat de clima casi desértico de Europa occidental, y por eso figura como prioritario.'
WHERE p.slug = 'cuatro-calas' AND h.code = '5220';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Roquedos del borde del mar, batidos por el viento y salpicados constantemente de sal. Las plantas viven agarradas a las grietas, con hojas gruesas o cerosas para no perder agua, y las más características son las siemprevivas (Limonium) y el hinojo marino. Muchas de esas siemprevivas viven solo en un tramo corto de costa y en ningún otro sitio del mundo.'
WHERE p.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND h.code = '1240';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Praderas de juncos y gramíneas sobre suelos salinos que se encharcan en invierno y se resecan en verano, tierra adentro de las marismas y en el borde de saladares y ramblas salobres. La sal se concentra en la superficie al evaporarse el agua, de modo que solo prosperan plantas capaces de bombear agua contra ella. Forman un tapiz denso y verde que contrasta con los suelos desnudos de alrededor.'
WHERE p.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND h.code = '1410';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Matorral bajo y carnoso de sosas y almajos (Sarcocornia, Arthrocnemum, Halocnemum) sobre suelos que se inundan de agua salada y luego se secan dejando costra de sal. Son matas de tallos gruesos y articulados, sin hojas aparentes, que almacenan agua y diluyen en ella la sal que absorben. En otoño viran a rojo, naranja y morado, y ese cambio de color es la señal más visible del saladar.'
WHERE p.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND h.code = '1420';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Estepas de suelos salinos pero secos, sin encharcamiento permanente, en depresiones y llanos interiores de clima duro. Dominan el albardín (Lygeum spartum), una gramínea de matas separadas y hojas punzantes, y las siemprevivas (Limonium), que en verano cubren el suelo desnudo de flores diminutas rosas y violetas. Es un paisaje de aspecto pobre que concentra un número altísimo de plantas que no crecen en ningún otro ambiente.'
WHERE p.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND h.code = '1510';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Matorral mediterráneo instalado sobre arenas ya fijadas, normalmente algo tierra adentro: jaras, jaguarzos, romero, lavandas, tomillos y enebros sobre suelo arenoso. Las hojas son duras o están cubiertas de pelillos, la defensa habitual contra el sol y la falta de agua, y muchas desprenden aroma al rozarlas. Es la etapa más madura y estable del sistema dunar, la última antes del bosque.'
WHERE p.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND h.code = '2260';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'La vegetación leñosa de ramblas, arroyos y ríos de caudal irregular, que unos meses llevan agua y otros son un lecho de piedras: adelfares y tarayales. La adelfa (Nerium oleander), de hojas coriáceas y flores rosas, y los tarays (Tamarix), de ramillas finas y flores en espiga, resisten tanto las avenidas violentas como meses de sequía. Toda la adelfa es muy tóxica, incluidas hojas y ramas secas.'
WHERE p.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND h.code = '92D0';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Matorral de suelos salinos removidos y cargados de nitrógeno: bordes de camino y de cultivo, márgenes de rambla, corrales y escombreras viejas. Lo forman matas robustas de hoja gris o carnosa —orgazas, sosas, bojas y cambroneras— que rebrotan enseguida tras cualquier alteración. Aunque nace de terrenos trastocados, es vegetación propia de los ambientes áridos del sureste y a menudo el último refugio de plantas escasas.'
WHERE p.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND h.code = '1430';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'El matorral de las zonas más cálidas y secas, allí donde prácticamente no hiela: palmito, espino negro, lentisco, cornicales, bojas, albaidas y esparto sobre laderas pedregosas y llanos soleados. Es un matorral abierto, con suelo desnudo a la vista entre mata y mata, y con muchas especies compartidas con el norte de África. Aguanta sequías de meses y rebrota en cuanto llueve.'
WHERE p.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND h.code = '5330';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Paredes y cortados de roca silícea —volcánica, granítica o de pizarra— donde la vegetación no arraiga en el suelo sino dentro de las grietas. Es el hermano ácido del roquedo calizo: las mismas plantas de raíz larga y crecimiento lentísimo agarradas a la fisura, pero sobre una roca sin cal, que selecciona especies distintas y a menudo mucho más raras. En el litoral mediterráneo aparece de forma muy puntual, allí donde asoma un afloramiento volcánico entre terrenos calizos.'
WHERE p.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND h.code = '8220';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Espinares de azufaifo (Ziziphus lotus), matas hemisféricas de ramas entrelazadas y espinas ganchudas que forman islas de sombra sobre llanos áridos. Cada mata levanta un pequeño montículo de arena y hojarasca y guarda debajo humedad, semillas y fauna que fuera no sobreviviría. Es el único hábitat de clima casi desértico de Europa occidental, y por eso figura como prioritario.'
WHERE p.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND h.code = '5220';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'La primera línea de vegetación de una playa: plantas anuales que germinan sobre los restos que deja la marea, aprovechando el poco alimento y la humedad que guarda esa franja de algas y madera. Son hierbas carnosas de vida corta, como el rábano de mar (Cakile maritima) o la barrilla pinchosa (Salsola kali), que completan su ciclo en una sola temporada. Desaparece por completo donde se limpia la arena con maquinaria.'
WHERE p.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND h.code = '1210';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'El primer relieve de arena de la playa, de apenas unos decímetros, que se forma donde una planta rastrera frena el viento y la arena se deposita a su alrededor. La construyen la grama de mar (Elymus farctus) y la juncia marina, capaces de crecer hacia arriba a medida que quedan enterradas. Es la duna naciente: si se pisa o se allana, todo el cordón dunar que hay detrás se queda sin recambio.'
WHERE p.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND h.code = '2110';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Pastizales secos en los que conviven gramíneas vivaces de mata dura, como el lastón (Brachypodium retusum) o el esparto, con una multitud de plantas anuales diminutas que nacen con las lluvias y se secan antes del verano. En agosto parecen un erial pardo; en abril pueden reunir cuarenta especies distintas en un metro cuadrado. Esa riqueza escondida es la razón de que sea un hábitat prioritario.'
WHERE p.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND h.code = '6220';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Pastos abiertos sobre repisas y lanchas de roca caliza con apenas un dedo de tierra encima. Ahí solo prosperan plantas crasas de hojas gordas, como las uñas de gato (Sedum), y hierbas anuales minúsculas que nacen, florecen y mueren entre febrero y mayo. Ocupa superficies muy pequeñas y depende de que el suelo siga siendo escaso: en cuanto se acumula tierra, otras plantas lo desplazan.'
WHERE p.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND h.code = '6110';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Paredes y cortados de roca caliza en los que la vegetación no vive sobre el suelo, sino dentro de las fisuras. Son plantas de raíz larguísima y crecimiento lentísimo, agarradas a la grieta, que aprovechan el agua que escurre por la pared. Los roquedos han quedado a salvo del arado y del ganado durante milenios, y por eso concentran una proporción altísima de especies que no existen en ningún otro lugar.'
WHERE p.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND h.code = '8210';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Bosques de ciprés de Cartagena (Tetraclinis articulata), una conífera norteafricana cuyas únicas poblaciones europeas están en el sureste ibérico. Tiene ramillas articuladas y aplanadas y conos leñosos de cuatro valvas que se abren como una flor de madera, y rebrota de cepa después de un incendio, cosa rara entre las coníferas. Su rareza y su área diminuta explican que sea un hábitat prioritario.'
WHERE p.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND h.code = '9570';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Claros de arena entre el matorral dunar en los que, tras las lluvias, germina un césped efímero de plantas diminutas que florecen y se secan en pocas semanas. Pasan el resto del año como semilla enterrada, de modo que durante casi todo el verano el sitio parece arena vacía. Es un hábitat que solo se ve entero unas semanas al año, y por eso se destruye sin que nadie note que había algo.'
WHERE p.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND h.code = '2230';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'El cordón dunar alto, de arena suelta y clara, que se levanta detrás de la playa. Lo sostiene el barrón (Ammophila arenaria), una gramínea de hojas enrolladas y punzantes que crece hacia arriba cuanta más arena la sepulta y teje bajo la superficie una red de rizomas que sujeta el montículo. Es la barrera natural que protege del temporal todo lo que queda tierra adentro.'
WHERE p.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND h.code = '2120';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Dunas ya estabilizadas, donde la arena apenas se mueve y aparecen matas leñosas bajas, líquenes y un tapiz gris azulado de hoja pequeña. Es el paso intermedio entre la duna viva y el matorral: se reconoce porque el suelo deja de ser arena limpia y empieza a tener costra y materia orgánica. Se recupera muy despacio, así que una pisada abre un claro que tarda años en cerrarse.'
WHERE p.slug = 'espacios-abiertos-e-islas-del-mar-menor' AND h.code = '2210';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Praderas de juncos y gramíneas sobre suelos salinos que se encharcan en invierno y se resecan en verano, tierra adentro de las marismas y en el borde de saladares y ramblas salobres. La sal se concentra en la superficie al evaporarse el agua, de modo que solo prosperan plantas capaces de bombear agua contra ella. Forman un tapiz denso y verde que contrasta con los suelos desnudos de alrededor.'
WHERE p.slug = 'humedal-del-ajauque-y-rambla-salada' AND h.code = '1410';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Matorral bajo y carnoso de sosas y almajos (Sarcocornia, Arthrocnemum, Halocnemum) sobre suelos que se inundan de agua salada y luego se secan dejando costra de sal. Son matas de tallos gruesos y articulados, sin hojas aparentes, que almacenan agua y diluyen en ella la sal que absorben. En otoño viran a rojo, naranja y morado, y ese cambio de color es la señal más visible del saladar.'
WHERE p.slug = 'humedal-del-ajauque-y-rambla-salada' AND h.code = '1420';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Estepas de suelos salinos pero secos, sin encharcamiento permanente, en depresiones y llanos interiores de clima duro. Dominan el albardín (Lygeum spartum), una gramínea de matas separadas y hojas punzantes, y las siemprevivas (Limonium), que en verano cubren el suelo desnudo de flores diminutas rosas y violetas. Es un paisaje de aspecto pobre que concentra un número altísimo de plantas que no crecen en ningún otro ambiente.'
WHERE p.slug = 'humedal-del-ajauque-y-rambla-salada' AND h.code = '1510';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Ríos de caudal permanente y corriente lenta, con orillas de limo que quedan al descubierto en verano. Allí se instalan céspedes densos de gramíneas que soportan quedar sumergidas y ser pisoteadas, bajo una cortina de sauces, álamos o tarays. El agua tibia, poco profunda y bien iluminada de estas orillas es donde se concentran los insectos acuáticos y los alevines.'
WHERE p.slug = 'humedal-del-ajauque-y-rambla-salada' AND h.code = '3280';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'La vegetación leñosa de ramblas, arroyos y ríos de caudal irregular, que unos meses llevan agua y otros son un lecho de piedras: adelfares y tarayales. La adelfa (Nerium oleander), de hojas coriáceas y flores rosas, y los tarays (Tamarix), de ramillas finas y flores en espiga, resisten tanto las avenidas violentas como meses de sequía. Toda la adelfa es muy tóxica, incluidas hojas y ramas secas.'
WHERE p.slug = 'humedal-del-ajauque-y-rambla-salada' AND h.code = '92D0';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'El matorral de las zonas más cálidas y secas, allí donde prácticamente no hiela: palmito, espino negro, lentisco, cornicales, bojas, albaidas y esparto sobre laderas pedregosas y llanos soleados. Es un matorral abierto, con suelo desnudo a la vista entre mata y mata, y con muchas especies compartidas con el norte de África. Aguanta sequías de meses y rebrota en cuanto llueve.'
WHERE p.slug = 'humedal-del-ajauque-y-rambla-salada' AND h.code = '5330';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Matorral de suelos salinos removidos y cargados de nitrógeno: bordes de camino y de cultivo, márgenes de rambla, corrales y escombreras viejas. Lo forman matas robustas de hoja gris o carnosa —orgazas, sosas, bojas y cambroneras— que rebrotan enseguida tras cualquier alteración. Aunque nace de terrenos trastocados, es vegetación propia de los ambientes áridos del sureste y a menudo el último refugio de plantas escasas.'
WHERE p.slug = 'humedal-del-ajauque-y-rambla-salada' AND h.code = '1430';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Matorral bajo y ralo que crece únicamente sobre yeso, un suelo blanquecino que forma costra y en el que casi ninguna otra planta prospera. Las que lo consiguen están especializadas en ese sustrato y muchas no viven en ningún otro sitio, de modo que cada afloramiento de yeso tiene su propia flora. No se recupera: al roturar o extraer el yeso desaparecen a la vez el suelo y lo que crecía sobre él.'
WHERE p.slug = 'humedal-del-ajauque-y-rambla-salada' AND h.code = '1520';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Pastos abiertos sobre repisas y lanchas de roca caliza con apenas un dedo de tierra encima. Ahí solo prosperan plantas crasas de hojas gordas, como las uñas de gato (Sedum), y hierbas anuales minúsculas que nacen, florecen y mueren entre febrero y mayo. Ocupa superficies muy pequeñas y depende de que el suelo siga siendo escaso: en cuanto se acumula tierra, otras plantas lo desplazan.'
WHERE p.slug = 'humedal-del-ajauque-y-rambla-salada' AND h.code = '6110';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Paredes y cortados de roca caliza en los que la vegetación no vive sobre el suelo, sino dentro de las fisuras. Son plantas de raíz larguísima y crecimiento lentísimo, agarradas a la grieta, que aprovechan el agua que escurre por la pared. Los roquedos han quedado a salvo del arado y del ganado durante milenios, y por eso concentran una proporción altísima de especies que no existen en ningún otro lugar.'
WHERE p.slug = 'humedal-del-ajauque-y-rambla-salada' AND h.code = '8210';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'El matorral de las zonas más cálidas y secas, allí donde prácticamente no hiela: palmito, espino negro, lentisco, cornicales, bojas, albaidas y esparto sobre laderas pedregosas y llanos soleados. Es un matorral abierto, con suelo desnudo a la vista entre mata y mata, y con muchas especies compartidas con el norte de África. Aguanta sequías de meses y rebrota en cuanto llueve.'
WHERE p.slug = 'monte-arabi' AND h.code = '5330';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Paredes y cortados de roca caliza en los que la vegetación no vive sobre el suelo, sino dentro de las fisuras. Son plantas de raíz larguísima y crecimiento lentísimo, agarradas a la grieta, que aprovechan el agua que escurre por la pared. Los roquedos han quedado a salvo del arado y del ganado durante milenios, y por eso concentran una proporción altísima de especies que no existen en ningún otro lugar.'
WHERE p.slug = 'monte-arabi' AND h.code = '8210';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'La primera línea de vegetación de una playa: plantas anuales que germinan sobre los restos que deja la marea, aprovechando el poco alimento y la humedad que guarda esa franja de algas y madera. Son hierbas carnosas de vida corta, como el rábano de mar (Cakile maritima) o la barrilla pinchosa (Salsola kali), que completan su ciclo en una sola temporada. Desaparece por completo donde se limpia la arena con maquinaria.'
WHERE p.slug = 'salinas-arenales-san-pedro-pinatar' AND h.code = '1210';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Claros de arena entre el matorral dunar en los que, tras las lluvias, germina un césped efímero de plantas diminutas que florecen y se secan en pocas semanas. Pasan el resto del año como semilla enterrada, de modo que durante casi todo el verano el sitio parece arena vacía. Es un hábitat que solo se ve entero unas semanas al año, y por eso se destruye sin que nadie note que había algo.'
WHERE p.slug = 'salinas-arenales-san-pedro-pinatar' AND h.code = '2230';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'El cordón dunar alto, de arena suelta y clara, que se levanta detrás de la playa. Lo sostiene el barrón (Ammophila arenaria), una gramínea de hojas enrolladas y punzantes que crece hacia arriba cuanta más arena la sepulta y teje bajo la superficie una red de rizomas que sujeta el montículo. Es la barrera natural que protege del temporal todo lo que queda tierra adentro.'
WHERE p.slug = 'salinas-arenales-san-pedro-pinatar' AND h.code = '2120';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'El primer relieve de arena de la playa, de apenas unos decímetros, que se forma donde una planta rastrera frena el viento y la arena se deposita a su alrededor. La construyen la grama de mar (Elymus farctus) y la juncia marina, capaces de crecer hacia arriba a medida que quedan enterradas. Es la duna naciente: si se pisa o se allana, todo el cordón dunar que hay detrás se queda sin recambio.'
WHERE p.slug = 'salinas-arenales-san-pedro-pinatar' AND h.code = '2110';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Dunas ya estabilizadas, donde la arena apenas se mueve y aparecen matas leñosas bajas, líquenes y un tapiz gris azulado de hoja pequeña. Es el paso intermedio entre la duna viva y el matorral: se reconoce porque el suelo deja de ser arena limpia y empieza a tener costra y materia orgánica. Se recupera muy despacio, así que una pisada abre un claro que tarda años en cerrarse.'
WHERE p.slug = 'salinas-arenales-san-pedro-pinatar' AND h.code = '2210';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Praderas de juncos y gramíneas sobre suelos salinos que se encharcan en invierno y se resecan en verano, tierra adentro de las marismas y en el borde de saladares y ramblas salobres. La sal se concentra en la superficie al evaporarse el agua, de modo que solo prosperan plantas capaces de bombear agua contra ella. Forman un tapiz denso y verde que contrasta con los suelos desnudos de alrededor.'
WHERE p.slug = 'salinas-arenales-san-pedro-pinatar' AND h.code = '1410';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Matorral bajo y carnoso de sosas y almajos (Sarcocornia, Arthrocnemum, Halocnemum) sobre suelos que se inundan de agua salada y luego se secan dejando costra de sal. Son matas de tallos gruesos y articulados, sin hojas aparentes, que almacenan agua y diluyen en ella la sal que absorben. En otoño viran a rojo, naranja y morado, y ese cambio de color es la señal más visible del saladar.'
WHERE p.slug = 'salinas-arenales-san-pedro-pinatar' AND h.code = '1420';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Céspedes abiertos de plantas anuales y carnosas que colonizan el fango salino en cuanto el agua se retira, en los bordes de salinas, marismas y lagunas costeras. Dominan las salicornias y sosas anuales, tallos sin hojas visibles, articulados como pequeños cactus, que a final de verano se tiñen de rojo y anaranjado. Es una vegetación efímera: cada año se instala de nuevo sobre un suelo que ha vuelto a quedar desnudo.'
WHERE p.slug = 'salinas-arenales-san-pedro-pinatar' AND h.code = '1310';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Sabinar o enebral crecido directamente sobre las dunas ya fijas, con las sabinas y enebros achaparrados y peinados por el viento marino, a veces tumbados sobre la arena y con las raíces al aire donde ésta se ha movido. Crecen muy despacio, así que un ejemplar de porte mediano puede tener siglos y una duna arrasada no lo recupera en una vida humana. Es el matorral leñoso más maduro que llega a formarse sobre arena litoral, y de los más raros: hoy sobrevive en manchas sueltas entre urbanizaciones y playas.'
WHERE p.slug = 'salinas-arenales-san-pedro-pinatar' AND h.code = '2250';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Matorral mediterráneo instalado sobre arenas ya fijadas, normalmente algo tierra adentro: jaras, jaguarzos, romero, lavandas, tomillos y enebros sobre suelo arenoso. Las hojas son duras o están cubiertas de pelillos, la defensa habitual contra el sol y la falta de agua, y muchas desprenden aroma al rozarlas. Es la etapa más madura y estable del sistema dunar, la última antes del bosque.'
WHERE p.slug = 'salinas-arenales-san-pedro-pinatar' AND h.code = '2260';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Láminas de agua salada o salobre separadas del mar por una barra de arena, con la que se comunican de forma permanente o solo en los temporales. La sal, la temperatura y el nivel cambian tanto con las lluvias y la evaporación que solo aguantan aquí unas pocas especies muy resistentes, pero las que aguantan se cuentan por miles de individuos. Es uno de los lugares donde más aves acuáticas se concentran a la vez.'
WHERE p.slug = 'salinas-arenales-san-pedro-pinatar' AND h.code = '1150';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Roquedos del borde del mar, batidos por el viento y salpicados constantemente de sal. Las plantas viven agarradas a las grietas, con hojas gruesas o cerosas para no perder agua, y las más características son las siemprevivas (Limonium) y el hinojo marino. Muchas de esas siemprevivas viven solo en un tramo corto de costa y en ningún otro sitio del mundo.'
WHERE p.slug = 'salinas-arenales-san-pedro-pinatar' AND h.code = '1240';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Estepas de suelos salinos pero secos, sin encharcamiento permanente, en depresiones y llanos interiores de clima duro. Dominan el albardín (Lygeum spartum), una gramínea de matas separadas y hojas punzantes, y las siemprevivas (Limonium), que en verano cubren el suelo desnudo de flores diminutas rosas y violetas. Es un paisaje de aspecto pobre que concentra un número altísimo de plantas que no crecen en ningún otro ambiente.'
WHERE p.slug = 'salinas-arenales-san-pedro-pinatar' AND h.code = '1510';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'La vegetación leñosa de ramblas, arroyos y ríos de caudal irregular, que unos meses llevan agua y otros son un lecho de piedras: adelfares y tarayales. La adelfa (Nerium oleander), de hojas coriáceas y flores rosas, y los tarays (Tamarix), de ramillas finas y flores en espiga, resisten tanto las avenidas violentas como meses de sequía. Toda la adelfa es muy tóxica, incluidas hojas y ramas secas.'
WHERE p.slug = 'salinas-arenales-san-pedro-pinatar' AND h.code = '92D0';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Matorral de suelos salinos removidos y cargados de nitrógeno: bordes de camino y de cultivo, márgenes de rambla, corrales y escombreras viejas. Lo forman matas robustas de hoja gris o carnosa —orgazas, sosas, bojas y cambroneras— que rebrotan enseguida tras cualquier alteración. Aunque nace de terrenos trastocados, es vegetación propia de los ambientes áridos del sureste y a menudo el último refugio de plantas escasas.'
WHERE p.slug = 'salinas-arenales-san-pedro-pinatar' AND h.code = '1430';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Matorral alto o bosquete abierto dominado por enebros y sabinas (Juniperus), arbustos de follaje escamoso o punzante y porte denso que aguantan sequía, viento y suelos casi inexistentes. Sus frutos carnosos y azulados —los gálbulos— alimentan en invierno a zorzales y otras aves, que se encargan de dispersar la semilla. Crecen tan despacio que un ejemplar de dos metros puede tener siglos.'
WHERE p.slug = 'sierra-de-el-carche' AND h.code = '5210';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'El matorral de las zonas más cálidas y secas, allí donde prácticamente no hiela: palmito, espino negro, lentisco, cornicales, bojas, albaidas y esparto sobre laderas pedregosas y llanos soleados. Es un matorral abierto, con suelo desnudo a la vista entre mata y mata, y con muchas especies compartidas con el norte de África. Aguanta sequías de meses y rebrota en cuanto llueve.'
WHERE p.slug = 'sierra-de-el-carche' AND h.code = '5330';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Pastizales secos en los que conviven gramíneas vivaces de mata dura, como el lastón (Brachypodium retusum) o el esparto, con una multitud de plantas anuales diminutas que nacen con las lluvias y se secan antes del verano. En agosto parecen un erial pardo; en abril pueden reunir cuarenta especies distintas en un metro cuadrado. Esa riqueza escondida es la razón de que sea un hábitat prioritario.'
WHERE p.slug = 'sierra-de-el-carche' AND h.code = '6220';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'El bosque mediterráneo por excelencia: encinares y carrascales de hoja dura, pequeña y perenne, que aguantan tanto el calor del verano como las heladas del interior. Bajo los árboles crece un sotobosque denso de coscoja, lentisco, madroño, enebros y aromáticas, y en el suelo la bellota sostiene en otoño a jabalíes, palomas y arrendajos. Aclarado por el ser humano durante siglos, ha dado lugar a las dehesas.'
WHERE p.slug = 'sierra-de-el-carche' AND h.code = '9340';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Paredes y cortados de roca caliza en los que la vegetación no vive sobre el suelo, sino dentro de las fisuras. Son plantas de raíz larguísima y crecimiento lentísimo, agarradas a la grieta, que aprovechan el agua que escurre por la pared. Los roquedos han quedado a salvo del arado y del ganado durante milenios, y por eso concentran una proporción altísima de especies que no existen en ningún otro lugar.'
WHERE p.slug = 'sierra-de-el-carche' AND h.code = '8210';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Matorral bajo y ralo que crece únicamente sobre yeso, un suelo blanquecino que forma costra y en el que casi ninguna otra planta prospera. Las que lo consiguen están especializadas en ese sustrato y muchas no viven en ningún otro sitio, de modo que cada afloramiento de yeso tiene su propia flora. No se recupera: al roturar o extraer el yeso desaparecen a la vez el suelo y lo que crecía sobre él.'
WHERE p.slug = 'sierra-de-el-carche' AND h.code = '1520';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Pastos abiertos sobre repisas y lanchas de roca caliza con apenas un dedo de tierra encima. Ahí solo prosperan plantas crasas de hojas gordas, como las uñas de gato (Sedum), y hierbas anuales minúsculas que nacen, florecen y mueren entre febrero y mayo. Ocupa superficies muy pequeñas y depende de que el suelo siga siendo escaso: en cuanto se acumula tierra, otras plantas lo desplazan.'
WHERE p.slug = 'sierra-de-el-carche' AND h.code = '6110';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Bosques abiertos y luminosos de sabinas y enebros arbóreos (Juniperus), con los árboles separados entre sí y un pasto o matorral bajo entre ellos. Se instalan donde el frío, el viento o la falta de suelo impiden que se cierre un bosque, desde páramos continentales hasta laderas costeras. Crecen extraordinariamente despacio y son muy longevos, así que un sabinar arrasado no vuelve en una vida humana.'
WHERE p.slug = 'sierra-de-el-carche' AND h.code = '9560';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Pastos de alta montaña sobre suelos calizos, por encima del límite del bosque, donde la nieve cubre el terreno buena parte del año. Son céspedes bajos, densos y muy diversos, con plantas de porte enano y flores desproporcionadamente grandes que florecen en cuanto se funde la nieve. El corto verano y el pastoreo tradicional han modelado juntos este paisaje.'
WHERE p.slug = 'sierra-de-el-carche' AND h.code = '6170';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Matorral almohadillado de montaña: matas espinosas y compactas —piornos, erizones, aulagas y aliagas— que crecen pegadas al suelo formando cojines redondeados. Esa forma no es casual, es la respuesta al viento, al frío y al peso de la nieve, y por dentro guarda un microclima donde se refugian otras plantas. Aparece por encima o en el lugar del bosque, en crestas y laderas expuestas.'
WHERE p.slug = 'sierra-de-el-carche' AND h.code = '4090';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Pinares de montaña de pino salgareño o laricio (Pinus nigra), de tronco recto y corteza gris agrietada, sobre crestas y laderas calizas de suelo escaso. Aguantan el frío, el viento y la nieve donde otros árboles no llegan, y los ejemplares de los cantiles pueden tener cientos o más de mil años. Su madera registra en los anillos la historia del clima, lo que convierte a estos bosques en archivos vivos.'
WHERE p.slug = 'sierra-de-el-carche' AND h.code = '9530';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Matorral alto o bosquete abierto dominado por enebros y sabinas (Juniperus), arbustos de follaje escamoso o punzante y porte denso que aguantan sequía, viento y suelos casi inexistentes. Sus frutos carnosos y azulados —los gálbulos— alimentan en invierno a zorzales y otras aves, que se encargan de dispersar la semilla. Crecen tan despacio que un ejemplar de dos metros puede tener siglos.'
WHERE p.slug = 'sierra-de-la-pila' AND h.code = '5210';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'El matorral de las zonas más cálidas y secas, allí donde prácticamente no hiela: palmito, espino negro, lentisco, cornicales, bojas, albaidas y esparto sobre laderas pedregosas y llanos soleados. Es un matorral abierto, con suelo desnudo a la vista entre mata y mata, y con muchas especies compartidas con el norte de África. Aguanta sequías de meses y rebrota en cuanto llueve.'
WHERE p.slug = 'sierra-de-la-pila' AND h.code = '5330';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Pastizales secos en los que conviven gramíneas vivaces de mata dura, como el lastón (Brachypodium retusum) o el esparto, con una multitud de plantas anuales diminutas que nacen con las lluvias y se secan antes del verano. En agosto parecen un erial pardo; en abril pueden reunir cuarenta especies distintas en un metro cuadrado. Esa riqueza escondida es la razón de que sea un hábitat prioritario.'
WHERE p.slug = 'sierra-de-la-pila' AND h.code = '6220';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Pastos abiertos sobre repisas y lanchas de roca caliza con apenas un dedo de tierra encima. Ahí solo prosperan plantas crasas de hojas gordas, como las uñas de gato (Sedum), y hierbas anuales minúsculas que nacen, florecen y mueren entre febrero y mayo. Ocupa superficies muy pequeñas y depende de que el suelo siga siendo escaso: en cuanto se acumula tierra, otras plantas lo desplazan.'
WHERE p.slug = 'sierra-de-la-pila' AND h.code = '6110';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Paredes y cortados de roca caliza en los que la vegetación no vive sobre el suelo, sino dentro de las fisuras. Son plantas de raíz larguísima y crecimiento lentísimo, agarradas a la grieta, que aprovechan el agua que escurre por la pared. Los roquedos han quedado a salvo del arado y del ganado durante milenios, y por eso concentran una proporción altísima de especies que no existen en ningún otro lugar.'
WHERE p.slug = 'sierra-de-la-pila' AND h.code = '8210';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Bosques abiertos y luminosos de sabinas y enebros arbóreos (Juniperus), con los árboles separados entre sí y un pasto o matorral bajo entre ellos. Se instalan donde el frío, el viento o la falta de suelo impiden que se cierre un bosque, desde páramos continentales hasta laderas costeras. Crecen extraordinariamente despacio y son muy longevos, así que un sabinar arrasado no vuelve en una vida humana.'
WHERE p.slug = 'sierra-de-la-pila' AND h.code = '9560';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Matorral bajo y ralo que crece únicamente sobre yeso, un suelo blanquecino que forma costra y en el que casi ninguna otra planta prospera. Las que lo consiguen están especializadas en ese sustrato y muchas no viven en ningún otro sitio, de modo que cada afloramiento de yeso tiene su propia flora. No se recupera: al roturar o extraer el yeso desaparecen a la vez el suelo y lo que crecía sobre él.'
WHERE p.slug = 'sierra-de-la-pila' AND h.code = '1520';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'El bosque mediterráneo por excelencia: encinares y carrascales de hoja dura, pequeña y perenne, que aguantan tanto el calor del verano como las heladas del interior. Bajo los árboles crece un sotobosque denso de coscoja, lentisco, madroño, enebros y aromáticas, y en el suelo la bellota sostiene en otoño a jabalíes, palomas y arrendajos. Aclarado por el ser humano durante siglos, ha dado lugar a las dehesas.'
WHERE p.slug = 'sierra-de-la-pila' AND h.code = '9340';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Matorral almohadillado de montaña: matas espinosas y compactas —piornos, erizones, aulagas y aliagas— que crecen pegadas al suelo formando cojines redondeados. Esa forma no es casual, es la respuesta al viento, al frío y al peso de la nieve, y por dentro guarda un microclima donde se refugian otras plantas. Aparece por encima o en el lugar del bosque, en crestas y laderas expuestas.'
WHERE p.slug = 'sierra-de-la-pila' AND h.code = '4090';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'La vegetación leñosa de ramblas, arroyos y ríos de caudal irregular, que unos meses llevan agua y otros son un lecho de piedras: adelfares y tarayales. La adelfa (Nerium oleander), de hojas coriáceas y flores rosas, y los tarays (Tamarix), de ramillas finas y flores en espiga, resisten tanto las avenidas violentas como meses de sequía. Toda la adelfa es muy tóxica, incluidas hojas y ramas secas.'
WHERE p.slug = 'sierra-de-la-pila' AND h.code = '92D0';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'El matorral de las zonas más cálidas y secas, allí donde prácticamente no hiela: palmito, espino negro, lentisco, cornicales, bojas, albaidas y esparto sobre laderas pedregosas y llanos soleados. Es un matorral abierto, con suelo desnudo a la vista entre mata y mata, y con muchas especies compartidas con el norte de África. Aguanta sequías de meses y rebrota en cuanto llueve.'
WHERE p.slug = 'sierra-de-las-moreras' AND h.code = '5330';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Pastizales secos en los que conviven gramíneas vivaces de mata dura, como el lastón (Brachypodium retusum) o el esparto, con una multitud de plantas anuales diminutas que nacen con las lluvias y se secan antes del verano. En agosto parecen un erial pardo; en abril pueden reunir cuarenta especies distintas en un metro cuadrado. Esa riqueza escondida es la razón de que sea un hábitat prioritario.'
WHERE p.slug = 'sierra-de-las-moreras' AND h.code = '6220';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Bosques abiertos y luminosos de sabinas y enebros arbóreos (Juniperus), con los árboles separados entre sí y un pasto o matorral bajo entre ellos. Se instalan donde el frío, el viento o la falta de suelo impiden que se cierre un bosque, desde páramos continentales hasta laderas costeras. Crecen extraordinariamente despacio y son muy longevos, así que un sabinar arrasado no vuelve en una vida humana.'
WHERE p.slug = 'sierra-de-las-moreras' AND h.code = '9560';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Espinares de azufaifo (Ziziphus lotus), matas hemisféricas de ramas entrelazadas y espinas ganchudas que forman islas de sombra sobre llanos áridos. Cada mata levanta un pequeño montículo de arena y hojarasca y guarda debajo humedad, semillas y fauna que fuera no sobreviviría. Es el único hábitat de clima casi desértico de Europa occidental, y por eso figura como prioritario.'
WHERE p.slug = 'sierra-de-las-moreras' AND h.code = '5220';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Pastos abiertos sobre repisas y lanchas de roca caliza con apenas un dedo de tierra encima. Ahí solo prosperan plantas crasas de hojas gordas, como las uñas de gato (Sedum), y hierbas anuales minúsculas que nacen, florecen y mueren entre febrero y mayo. Ocupa superficies muy pequeñas y depende de que el suelo siga siendo escaso: en cuanto se acumula tierra, otras plantas lo desplazan.'
WHERE p.slug = 'sierra-de-las-moreras' AND h.code = '6110';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Paredes y cortados de roca caliza en los que la vegetación no vive sobre el suelo, sino dentro de las fisuras. Son plantas de raíz larguísima y crecimiento lentísimo, agarradas a la grieta, que aprovechan el agua que escurre por la pared. Los roquedos han quedado a salvo del arado y del ganado durante milenios, y por eso concentran una proporción altísima de especies que no existen en ningún otro lugar.'
WHERE p.slug = 'sierra-de-las-moreras' AND h.code = '8210';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Matorral de suelos salinos removidos y cargados de nitrógeno: bordes de camino y de cultivo, márgenes de rambla, corrales y escombreras viejas. Lo forman matas robustas de hoja gris o carnosa —orgazas, sosas, bojas y cambroneras— que rebrotan enseguida tras cualquier alteración. Aunque nace de terrenos trastocados, es vegetación propia de los ambientes áridos del sureste y a menudo el último refugio de plantas escasas.'
WHERE p.slug = 'sierra-de-las-moreras' AND h.code = '1430';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Roquedos del borde del mar, batidos por el viento y salpicados constantemente de sal. Las plantas viven agarradas a las grietas, con hojas gruesas o cerosas para no perder agua, y las más características son las siemprevivas (Limonium) y el hinojo marino. Muchas de esas siemprevivas viven solo en un tramo corto de costa y en ningún otro sitio del mundo.'
WHERE p.slug = 'sierra-de-las-moreras' AND h.code = '1240';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Estepas de suelos salinos pero secos, sin encharcamiento permanente, en depresiones y llanos interiores de clima duro. Dominan el albardín (Lygeum spartum), una gramínea de matas separadas y hojas punzantes, y las siemprevivas (Limonium), que en verano cubren el suelo desnudo de flores diminutas rosas y violetas. Es un paisaje de aspecto pobre que concentra un número altísimo de plantas que no crecen en ningún otro ambiente.'
WHERE p.slug = 'sierra-de-las-moreras' AND h.code = '1510';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Matorral alto o bosquete abierto dominado por enebros y sabinas (Juniperus), arbustos de follaje escamoso o punzante y porte denso que aguantan sequía, viento y suelos casi inexistentes. Sus frutos carnosos y azulados —los gálbulos— alimentan en invierno a zorzales y otras aves, que se encargan de dispersar la semilla. Crecen tan despacio que un ejemplar de dos metros puede tener siglos.'
WHERE p.slug = 'sierra-de-salinas' AND h.code = '5210';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Pastizales secos en los que conviven gramíneas vivaces de mata dura, como el lastón (Brachypodium retusum) o el esparto, con una multitud de plantas anuales diminutas que nacen con las lluvias y se secan antes del verano. En agosto parecen un erial pardo; en abril pueden reunir cuarenta especies distintas en un metro cuadrado. Esa riqueza escondida es la razón de que sea un hábitat prioritario.'
WHERE p.slug = 'sierra-de-salinas' AND h.code = '6220';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Paredes y cortados de roca caliza en los que la vegetación no vive sobre el suelo, sino dentro de las fisuras. Son plantas de raíz larguísima y crecimiento lentísimo, agarradas a la grieta, que aprovechan el agua que escurre por la pared. Los roquedos han quedado a salvo del arado y del ganado durante milenios, y por eso concentran una proporción altísima de especies que no existen en ningún otro lugar.'
WHERE p.slug = 'sierra-de-salinas' AND h.code = '8210';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'El bosque mediterráneo por excelencia: encinares y carrascales de hoja dura, pequeña y perenne, que aguantan tanto el calor del verano como las heladas del interior. Bajo los árboles crece un sotobosque denso de coscoja, lentisco, madroño, enebros y aromáticas, y en el suelo la bellota sostiene en otoño a jabalíes, palomas y arrendajos. Aclarado por el ser humano durante siglos, ha dado lugar a las dehesas.'
WHERE p.slug = 'sierra-de-salinas' AND h.code = '9340';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Matorral almohadillado de montaña: matas espinosas y compactas —piornos, erizones, aulagas y aliagas— que crecen pegadas al suelo formando cojines redondeados. Esa forma no es casual, es la respuesta al viento, al frío y al peso de la nieve, y por dentro guarda un microclima donde se refugian otras plantas. Aparece por encima o en el lugar del bosque, en crestas y laderas expuestas.'
WHERE p.slug = 'sierra-de-salinas' AND h.code = '4090';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'El matorral de las zonas más cálidas y secas, allí donde prácticamente no hiela: palmito, espino negro, lentisco, cornicales, bojas, albaidas y esparto sobre laderas pedregosas y llanos soleados. Es un matorral abierto, con suelo desnudo a la vista entre mata y mata, y con muchas especies compartidas con el norte de África. Aguanta sequías de meses y rebrota en cuanto llueve.'
WHERE p.slug = 'sierra-de-salinas' AND h.code = '5330';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Alamedas y saucedas: la banda de árboles de hoja caduca que acompaña a los ríos, con el álamo blanco de envés plateado, chopos y sauces de raíces dentro del agua. Dan sombra al cauce, sujetan las orillas en las crecidas y sostienen una fauna que no aparece a veinte metros de allí. Es un bosque estrecho y alargado que funciona además como corredor entre sierras.'
WHERE p.slug = 'sierra-de-salinas' AND h.code = '92A0';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Matorral alto o bosquete abierto dominado por enebros y sabinas (Juniperus), arbustos de follaje escamoso o punzante y porte denso que aguantan sequía, viento y suelos casi inexistentes. Sus frutos carnosos y azulados —los gálbulos— alimentan en invierno a zorzales y otras aves, que se encargan de dispersar la semilla. Crecen tan despacio que un ejemplar de dos metros puede tener siglos.'
WHERE p.slug = 'sierra-espuna' AND h.code = '5210';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Matorral almohadillado de montaña: matas espinosas y compactas —piornos, erizones, aulagas y aliagas— que crecen pegadas al suelo formando cojines redondeados. Esa forma no es casual, es la respuesta al viento, al frío y al peso de la nieve, y por dentro guarda un microclima donde se refugian otras plantas. Aparece por encima o en el lugar del bosque, en crestas y laderas expuestas.'
WHERE p.slug = 'sierra-espuna' AND h.code = '4090';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Pastizales secos en los que conviven gramíneas vivaces de mata dura, como el lastón (Brachypodium retusum) o el esparto, con una multitud de plantas anuales diminutas que nacen con las lluvias y se secan antes del verano. En agosto parecen un erial pardo; en abril pueden reunir cuarenta especies distintas en un metro cuadrado. Esa riqueza escondida es la razón de que sea un hábitat prioritario.'
WHERE p.slug = 'sierra-espuna' AND h.code = '6220';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'El bosque mediterráneo por excelencia: encinares y carrascales de hoja dura, pequeña y perenne, que aguantan tanto el calor del verano como las heladas del interior. Bajo los árboles crece un sotobosque denso de coscoja, lentisco, madroño, enebros y aromáticas, y en el suelo la bellota sostiene en otoño a jabalíes, palomas y arrendajos. Aclarado por el ser humano durante siglos, ha dado lugar a las dehesas.'
WHERE p.slug = 'sierra-espuna' AND h.code = '9340';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Bosques abiertos y luminosos de sabinas y enebros arbóreos (Juniperus), con los árboles separados entre sí y un pasto o matorral bajo entre ellos. Se instalan donde el frío, el viento o la falta de suelo impiden que se cierre un bosque, desde páramos continentales hasta laderas costeras. Crecen extraordinariamente despacio y son muy longevos, así que un sabinar arrasado no vuelve en una vida humana.'
WHERE p.slug = 'sierra-espuna' AND h.code = '9560';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'El matorral de las zonas más cálidas y secas, allí donde prácticamente no hiela: palmito, espino negro, lentisco, cornicales, bojas, albaidas y esparto sobre laderas pedregosas y llanos soleados. Es un matorral abierto, con suelo desnudo a la vista entre mata y mata, y con muchas especies compartidas con el norte de África. Aguanta sequías de meses y rebrota en cuanto llueve.'
WHERE p.slug = 'sierra-espuna' AND h.code = '5330';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'La vegetación leñosa de ramblas, arroyos y ríos de caudal irregular, que unos meses llevan agua y otros son un lecho de piedras: adelfares y tarayales. La adelfa (Nerium oleander), de hojas coriáceas y flores rosas, y los tarays (Tamarix), de ramillas finas y flores en espiga, resisten tanto las avenidas violentas como meses de sequía. Toda la adelfa es muy tóxica, incluidas hojas y ramas secas.'
WHERE p.slug = 'sierra-espuna' AND h.code = '92D0';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Juncales altos sobre suelos que mantienen humedad en profundidad todo el verano, aunque la superficie esté seca: bordes de acequia, manantiales, vegas y fondos de valle. El junco churrero (Scirpoides holoschoenus) forma macollas robustas entre las que crecen menta, lirios y a menudo orquídeas. Es un oasis de verde en pleno agosto, y desaparece en cuanto se drena o se capta el agua que lo alimenta.'
WHERE p.slug = 'sierra-espuna' AND h.code = '6420';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Pastos abiertos sobre repisas y lanchas de roca caliza con apenas un dedo de tierra encima. Ahí solo prosperan plantas crasas de hojas gordas, como las uñas de gato (Sedum), y hierbas anuales minúsculas que nacen, florecen y mueren entre febrero y mayo. Ocupa superficies muy pequeñas y depende de que el suelo siga siendo escaso: en cuanto se acumula tierra, otras plantas lo desplazan.'
WHERE p.slug = 'sierra-espuna' AND h.code = '6110';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Paredes y cortados de roca caliza en los que la vegetación no vive sobre el suelo, sino dentro de las fisuras. Son plantas de raíz larguísima y crecimiento lentísimo, agarradas a la grieta, que aprovechan el agua que escurre por la pared. Los roquedos han quedado a salvo del arado y del ganado durante milenios, y por eso concentran una proporción altísima de especies que no existen en ningún otro lugar.'
WHERE p.slug = 'sierra-espuna' AND h.code = '8210';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Pastos de alta montaña sobre suelos calizos, por encima del límite del bosque, donde la nieve cubre el terreno buena parte del año. Son céspedes bajos, densos y muy diversos, con plantas de porte enano y flores desproporcionadamente grandes que florecen en cuanto se funde la nieve. El corto verano y el pastoreo tradicional han modelado juntos este paisaje.'
WHERE p.slug = 'sierra-espuna' AND h.code = '6170';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Bosques de quejigo (Quercus faginea) y quejigo andaluz (Quercus canariensis), parientes de la encina que buscan más humedad y suelos más profundos: umbrías, vaguadas y pies de sierra. Su hoja es marcescente, es decir, se seca en otoño pero no cae hasta que empuja la nueva, así que en invierno el bosque se queda de color pardo dorado en vez de desnudo. Bajo su sombra prospera un sotobosque más rico y verde que el del encinar.'
WHERE p.slug = 'sierra-espuna' AND h.code = '9240';

UPDATE habitats h JOIN parks p ON p.id = h.park_id
  SET h.description = 'Alamedas y saucedas: la banda de árboles de hoja caduca que acompaña a los ríos, con el álamo blanco de envés plateado, chopos y sauces de raíces dentro del agua. Dan sombra al cauce, sujetan las orillas en las crecidas y sostienen una fauna que no aparece a veinte metros de allí. Es un bosque estrecho y alargado que funciona además como corredor entre sierras.'
WHERE p.slug = 'sierra-espuna' AND h.code = '92A0';
