-- species-universal.sql — contenido universal de las fichas de especie.
-- GENERADO por Tools/sync-species-catalog.js --apply --sql. No editar a mano:
-- la fuente es Tools/catalogo-nacional/data/especies-universal.json.
--
-- Hace falta porque Frontend/Js/data.js prioriza la respuesta de la API sobre el park.json
-- empaquetado: sin aplicar esto, un despliegue con backend seguiría sirviendo los textos viejos.

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Águila perdicera',
  s.primary_habitat = 'Sierras con cortados rocosos y amplias zonas abiertas de matorral y cultivo para cazar',
  s.description = 'Águila mediana de alas largas y cola larga, con el vientre blanco finamente rayado y una mancha blanca en la espalda que se ve bien en vuelo. Caza a gran velocidad y a poca altura, sorprendiendo a perdices, conejos y palomas. Las parejas ocupan el mismo cortado durante años.',
  s.identification_tips = 'Mancha blanca en el centro de la espalda, visible desde arriba
Vientre claro y muy rayado, con una banda oscura en el borde del ala
Vuelo bajo y rápido cuando caza, no en círculos altos',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Aguila_perdicera.jpg?width=1280',
  s.image_attribution = 'Paco Gómez from Castellón, Spain (CC BY-SA 2.0) · Wikimedia Commons',
  s.rarity_score = 5
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Aquila fasciata';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Ajo de flor oscura',
  s.primary_habitat = 'Espartales, pastizales secos y claros de matorral sobre suelos margosos',
  s.description = 'Ajo silvestre de flores de un púrpura tan oscuro que parece negro, agrupadas en una umbela apretada al final de un tallo largo y desnudo. Es un endemismo del sureste ibérico, de área muy reducida, que pasa el verano bajo tierra en forma de bulbo.',
  s.identification_tips = 'Flores de púrpura casi negro, muy oscuras
Umbela compacta sobre un tallo largo y liso
Huele a ajo al estrujar las hojas o el bulbo',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Allium_melananthum02.jpg?width=1280',
  s.image_attribution = 'Nanosanchez (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 5
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Allium melananthum';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Azucena de mar',
  s.primary_habitat = 'Dunas y playas del litoral',
  s.description = 'Bulbosa de dunas con flores blancas grandes, en forma de trompeta y con una corona membranosa entre los estambres. Se abren al atardecer y despiden un perfume intenso que atrae a polillas nocturnas. Sus hojas son acintadas y de un verde azulado, y a menudo se secan antes de la floración.',
  s.identification_tips = 'Flores blancas en trompeta con una corona membranosa dentro
Se abren al atardecer y huelen intensamente
Hojas acintadas y de verde azulado, saliendo de la arena',
  s.seasonality = 'Verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Pancratium_maritimum2.jpg?width=1280',
  s.image_attribution = 'autor no indicado (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Pancratium maritimum';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Camachuelo trompetero',
  s.primary_habitat = 'Ramblas, laderas peladas y llanos pedregosos de clima muy árido',
  s.description = 'Pequeño fringílido de aspecto discreto y pardo arenoso, con un pico corto, muy grueso y de color rojo coral en primavera. El macho tiene además el pecho y el obispillo teñidos de rosa. Su reclamo es un zumbido nasal inconfundible, como una trompeta de juguete.',
  s.identification_tips = 'Pico corto y muy grueso, rojo coral en primavera
Reclamo nasal y zumbante, como una corneta pequeña
Tonos rosados en pecho y obispillo del macho',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Bucanetes_githagineus_-Salinas_de_Janubio%2C_Lanzarote%2C_Spain-8.jpg?width=1280',
  s.image_attribution = 'Frank Vassen from Brussels, Belgium (CC BY 2.0) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Bucanetes githagineus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Centaurio de Rigual',
  s.primary_habitat = 'Bordes de saladar, suelos margosos húmedos y depresiones con algo de sal',
  s.description = 'Pequeña hierba anual de la familia de las gencianas, con flores rosadas de cinco pétalos abiertas en estrella. Es un endemismo muy localizado del sureste peninsular, ligado a suelos húmedos y algo salinos, un ambiente escaso y fácil de destruir.',
  s.identification_tips = 'Flores rosas de cinco pétalos, abiertas al sol
Planta anual y menuda, de pocos centímetros
Hojas opuestas en pares a lo largo del tallo',
  s.seasonality = 'Primavera',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/498014263/original.jpeg',
  s.image_attribution = 'naturcope (CC BY-NC 4.0) · iNaturalist/GBIF · obs. Águilas (parque)',
  s.rarity_score = 5
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Centaurium rigualii';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Chumberillo de lobo',
  s.primary_habitat = 'Matorral halonitrófilo costero',
  s.description = 'Suculenta de aspecto cactiforme, con tallos carnosos de cuatro caras y dientes blandos, sin espinas verdaderas. Sus flores, en corona, son de un pardo amarillento jaspeado y desprenden olor a carroña para atraer moscas, que son sus polinizadoras.',
  s.identification_tips = 'Tallos carnosos de sección cuadrada, con dientes blandos
Flores jaspeadas en pardo y amarillo, dispuestas en corona
Olor desagradable, a carne pasada, en floración',
  s.seasonality = 'Verano y otoño (floración)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Caralluma_europaea45.JPG?width=1280',
  s.image_attribution = 'Nanosanchez (Public domain) · Wikimedia Commons',
  s.rarity_score = 5
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Caralluma europaea';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Espartilla de Persia',
  s.primary_habitat = 'Litosuelos cálidos del piso termomediterráneo',
  s.description = 'Gramínea perenne que forma pequeñas matas densas en suelos pedregosos y muy cálidos. Sus espiguillas rematan en nueve aristas plumosas, un rasgo que da nombre al género y que la distingue de cualquier otra gramínea del entorno.',
  s.identification_tips = 'Nueve aristas plumosas en cada espiguilla
Mata compacta y baja, de hasta medio metro
Tallos y hojas cubiertos de pelusa corta',
  s.seasonality = 'Verano',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/616035449/original.jpg',
  s.image_attribution = 'naturcope (CC BY-NC 4.0) · GBIF',
  s.rarity_score = 5
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Enneapogon persicus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Salsola',
  s.primary_habitat = 'Estepas salinas y suelos margosos y yesosos con sal',
  s.description = 'Mata baja y densa de hojas cortas y carnosas cubiertas de pequeñas papilas que le dan un tacto áspero. Es un endemismo ibérico ligado a suelos salinos y margosos, con una distribución muy fragmentada, lo que la hace especialmente sensible a la roturación.',
  s.identification_tips = 'Superficie de las hojas rugosa, con papilas visibles de cerca
Mata compacta y grisácea, de porte bajo
Frutos con alas membranosas al madurar',
  s.seasonality = 'Verano y otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Salsola_papillosa1160031.jpg?width=1280',
  s.image_attribution = 'Nanosanchez (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 5
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Salsola papillosa';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Tortuga mora',
  s.primary_habitat = 'Matorral termomediterráneo semiárido',
  s.description = 'Tortuga terrestre de caparazón abombado con dibujo de placas amarillas y negras, la única silvestre del sureste peninsular. Se reconoce por un tubérculo córneo a cada lado de la cola —el «espolón»— y por no tener el peto articulado. Pasa el verano y el invierno inactiva, refugiada bajo matas y madrigueras.',
  s.identification_tips = 'Un tubérculo córneo a cada lado de la base de la cola
Caparazón abombado con placas amarillas y negras
Peto sin bisagra: no puede cerrarse del todo',
  s.seasonality = 'Primavera y otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Nabeulensis_sarda.JPG?width=1280',
  s.image_attribution = 'Gisella D. (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 5
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Testudo graeca';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Zamarrilla lanuda',
  s.primary_habitat = 'Matorral y cerros sobre suelos calizos y margosos secos',
  s.description = 'Mata cubierta por una lana blanca y espesa que la hace destacar en el matorral. Sus flores, rosadas o purpúreas, se agrupan en cabezuelas terminales y carecen de labio superior, con los estambres al descubierto. Es un endemismo del sureste ibérico.',
  s.identification_tips = 'Toda la planta cubierta de lana blanca y espesa
Flores sin labio superior, con los estambres asomando
Cabezuelas apretadas en el extremo de las ramas',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Teucrium_lanigerum_kz01.jpg?width=1280',
  s.image_attribution = 'Krzysztof Ziarnek, Kenraiz (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Teucrium lanigerum';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Abubilla',
  s.primary_habitat = 'Campos abiertos, dehesas, cultivos con arbolado y bordes de matorral',
  s.description = 'Ave inconfundible de color canela con alas y cola a franjas blancas y negras, y una cresta eréctil que despliega en abanico al posarse. Sondea el suelo blando con el pico largo y curvo en busca de larvas e insectos. Su canto, un «up-up-up» sordo y repetido, se oye de lejos en primavera.',
  s.identification_tips = 'Vuelo ondulante y torpe, como una mariposa grande
Cresta que abre en abanico justo al aterrizar
Camina por el suelo clavando el pico largo y curvo',
  s.seasonality = 'Todo el año en el sur peninsular; estival en el resto',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Wiedehopf_mit_Puppe_als_Futter.jpg?width=1280',
  s.image_attribution = 'Sven Damerow (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Upupa epops';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Acebuche',
  s.primary_habitat = 'Matorral alto, laderas secas y barrancos del piso más cálido',
  s.description = 'El acebuche es el olivo silvestre: mismo árbol, sin siglos de selección. Tiene las hojas más pequeñas y duras, las ramas jóvenes a menudo espinosas y aceitunas diminutas. Forma matorrales altos y es el árbol característico de las laderas cálidas mediterráneas.',
  s.identification_tips = 'Hojas pequeñas, verdes arriba y plateadas por debajo
Ramillas jóvenes rígidas y a veces espinosas
Aceitunas muy pequeñas, de poco más de un centímetro',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Ullastre_vell.JPG?width=1280',
  s.image_attribution = 'Antoni Salvà (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Olea europaea subsp. europaea';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Acelga marina',
  s.primary_habitat = 'Playas de cantos, pie de acantilado y suelos removidos con sal cerca del mar',
  s.description = 'Antepasada silvestre de la acelga y la remolacha, con hojas gruesas, lustrosas y algo carnosas que aguantan la sal y el viento. Crece donde el mar deja restos orgánicos acumulados. Sus flores son verdosas y pasan desapercibidas, dispuestas en largas espigas.',
  s.identification_tips = 'Hojas gruesas y brillantes, como de acelga pequeña
Tallos rojizos tumbados en la arena o entre cantos
Espigas largas de flores verdes sin pétalos vistosos',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Beta_vulgaris_maritima02.jpg?width=1280',
  s.image_attribution = 'Meneerke bloem (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Beta maritima';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Águila calzada',
  s.primary_habitat = 'Bosques y sierras con arbolado, cazando sobre zonas abiertas cercanas',
  s.description = 'Águila pequeña, del tamaño de un ratonero, con dos formas de plumaje muy distintas: una clara con el vientre blanco y otra oscura y uniforme. Nidifica en árboles dentro del bosque y caza en campo abierto lanzándose desde altura. Se identifica en vuelo por las «luces de posición»: dos manchas blancas en el arranque de las alas.',
  s.identification_tips = 'Dos manchas blancas donde el ala se une al cuerpo
Existen ejemplares claros y oscuros de la misma especie
Cola larga y recta, sin la muesca del milano',
  s.seasonality = 'Primavera y verano (estival); algunos ejemplares invernan',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Booted_eagle%2C_Hieraaetus_pennatus%2C_at_Kgalagadi_Transfrontier_Pa_(32334023348).jpg?width=1280',
  s.image_attribution = 'Derek Keats from Johannesburg, South Africa (CC BY 2.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Hieraaetus pennatus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Águila real',
  s.primary_habitat = 'Montañas y sierras con cortados rocosos y amplias zonas abiertas de caza',
  s.description = 'La mayor de las águilas ibéricas, con casi dos metros y medio de envergadura y una nuca dorada que le da nombre. Cría en repisas de cantiles y usa territorios enormes, que una pareja defiende durante años. Planea con las alas en una «V» muy suave y bate poco, lo que la distingue de las rapaces menores.',
  s.identification_tips = 'Nuca y cogote de tono dorado, visibles a buena luz
Planea con las alas en «V» muy abierta y bate poco
Tamaño enorme: dobla al ratonero en el mismo cielo',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Maakotka_(Aquila_chrysaetos)_by_Jarkko_J%C3%A4rvinen.jpg?width=1280',
  s.image_attribution = 'Jarkko Järvinen (CC BY-SA 2.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Aquila chrysaetos';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Albaida',
  s.primary_habitat = 'Matorral seco y soleado sobre margas y suelos pobres',
  s.description = 'Mata de aspecto blanquecino por la fina pelusa que cubre hojas y tallos, un recurso frente al sol y la sequía. En primavera se llena de espigas de flores amarillas que atraen a muchos insectos. Es una de las leguminosas que primero coloniza laderas degradadas y taludes.',
  s.identification_tips = 'Aspecto grisáceo y aterciopelado al tacto
Flores amarillas pequeñas en espigas apretadas
Hojas divididas en tres, la del centro más larga',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Anthyllis_cytisoides.JPG?width=1280',
  s.image_attribution = 'Ximenex (CC BY-SA 2.1 es) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Anthyllis cytisoides';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Albardín',
  s.primary_habitat = 'Estepas salinas, margas y suelos yesosos secos; forma albardinales',
  s.description = 'Gramínea perenne de hojas duras y punzantes que forma matas separadas sobre suelos salinos y margosos donde poco más prospera. Su inflorescencia es inconfundible: una espata blanca y sedosa que envuelve las flores como un capuchón de papel.',
  s.identification_tips = 'Espata blanca y sedosa envolviendo la espiga
Hojas rígidas terminadas en punta punzante
Matas espaciadas sobre suelo desnudo y claro',
  s.seasonality = 'Todo el año (espigado en primavera)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Lygeum_spartum-1.jpg?width=1280',
  s.image_attribution = 'Nanosanchez (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Lygeum spartum';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Albardín brezo',
  s.primary_habitat = 'Estepas salinas, saladares y suelos margosos con sal',
  s.description = 'Mata baja y muy ramificada, de hojas diminutas y enrolladas que a menudo aparecen cubiertas de una costra blanca: son cristales de sal que la planta expulsa por glándulas especializadas. Sus flores son rosadas y pequeñas, apiñadas en el extremo de las ramas.',
  s.identification_tips = 'Costra blanca de sal cristalizada sobre las hojas
Hojas minúsculas y enrolladas, casi como escamas
Flores rosadas pequeñas agrupadas en el extremo',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/464713930/original.jpeg',
  s.image_attribution = 'Rafael Medina (CC BY 4.0) · GBIF',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Frankenia corymbosa';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Alcaparra',
  s.primary_habitat = 'Roquedos y muros del matorral litoral',
  s.description = 'Arbusto de ramas colgantes que crece en roquedos y muros, con hojas redondeadas y carnosas y estípulas transformadas en espinas curvas. Sus flores, grandes y blancas con un penacho de estambres violáceos, se abren al amanecer y duran un solo día. Los botones en salmuera son las alcaparras.',
  s.identification_tips = 'Un par de espinas curvas en la base de cada hoja
Flores blancas con muchos estambres largos y violáceos
Cada flor dura un solo día',
  s.seasonality = 'Verano',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/673180503/original.jpg',
  s.image_attribution = 'Heiko Hentschel (CC0) · GBIF · Capparis sicula (especie)',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Capparis sicula subsp. sicula';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Alcaraván',
  s.primary_habitat = 'Llanos pedregosos, cultivos de secano, ramblas y eriales con poca cobertura',
  s.description = 'Ave de aspecto extraño y ojos amarillos enormes, adaptados a la actividad nocturna. De día permanece agachada e inmóvil, confiada en su plumaje críptico, y solo al anochecer se activa y delata con un reclamo silbado y melancólico que recuerda al del zarapito.',
  s.identification_tips = 'Ojos amarillos desproporcionadamente grandes
Dos barras blancas y negras en el ala plegada
Reclamo silbado y triste al anochecer',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Burhinus_oedicnemus_insularum_Lanzarote_1.jpg?width=1280',
  s.image_attribution = 'Frank Vassen from Brussels, Belgium (CC BY 2.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Burhinus oedicnemus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Alhucema',
  s.primary_habitat = 'Matorral seco, ribazos y bordes soleados de clima cálido',
  s.description = 'Alhucema de hojas muy divididas, casi como las de un helecho, y aspecto grisáceo. Florece durante buena parte del año en espigas azul violeta rematadas por dos brácteas alargadas. Su olor es más resinoso y menos dulce que el del espliego cultivado.',
  s.identification_tips = 'Hojas finamente divididas, de aspecto plumoso
Espigas azul violeta con dos brácteas en la punta
Aroma resinoso e intenso al frotar',
  s.seasonality = 'Casi todo el año, con máximo en primavera y otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Lavandula_multifida.jpg?width=1280',
  s.image_attribution = 'Laitche (Public domain) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Lavandula multifida';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Amapola marina',
  s.primary_habitat = 'Ríos mediterráneos con Glaucium flavum',
  s.description = 'Amapola perenne glauca de grandes flores amarillas y cápsula muy larga, propia de gravas y cauces; es la especie que da nombre al hábitat 3250.',
  s.identification_tips = 'Flores amarillas grandes
Follaje glauco y lobulado
Fruto en cápsula muy larga',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Glaucium_flavum_2015-06-16_442.JPG?width=1280',
  s.image_attribution = 'Salicyna (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Glaucium flavum';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Anabasis',
  s.primary_habitat = 'Suelos salinos y margosos áridos, estepas y ramblas de clima muy seco',
  s.description = 'Mata de tallos verdes, carnosos y articulados, sin hojas visibles, muy parecida a las sosas de saladar pero de porte más rígido y ramificado. Es una planta iberoafricana que en la península solo vive en los enclaves más áridos del sureste.',
  s.identification_tips = 'Tallos articulados y suculentos, sin hojas
Porte rígido y muy ramificado desde la base
En los suelos más áridos y salinos, casi desnudos',
  s.seasonality = 'Verano y otoño',
  s.image_url = 'https://observation.org/photos/111149341.jpg',
  s.image_attribution = 'Ans Gorter (CC BY-NC-ND 4.0) · observation.org / GBIF',
  s.rarity_score = 4
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Anabasis hispanica';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Arto',
  s.primary_habitat = 'Matorral árido de clima muy cálido, ramblas y glacis pedregosos',
  s.description = 'Arbusto denso y espinoso de origen tropical africano, superviviente de climas más cálidos que el actual, que en Europa solo pervive en el extremo sureste ibérico. Sus ramas verdes acaban en pincho y sus hojas, algo carnosas, caen en los veranos más duros.',
  s.identification_tips = 'Ramas verdes rematadas en espina fuerte
Hojas algo carnosas de borde finamente dentado
Porte redondeado y muy denso, difícil de atravesar',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Arto_Negro_01.jpg?width=1280',
  s.image_attribution = 'Eduardo Milla (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Maytenus senegalensis subsp. europaea';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Aulaga',
  s.primary_habitat = 'Matorral árido, ramblas y bordes de camino en clima muy seco',
  s.description = 'Mata en forma de bola formada por ramas verdes, rígidas y terminadas en pincho, casi sin hojas: la fotosíntesis la hacen los propios tallos. Al romper una rama suelta un látex blanco. Sus flores amarillas recuerdan a las del diente de león en miniatura.',
  s.identification_tips = 'Matorral redondo de ramas verdes y espinosas, casi sin hojas
Suelta látex blanco al partir un tallo
Flores amarillas tipo diente de león',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Launaea_arborescens_-_Oasis_Park_botanical_garden_-_Fuerteventura_-_02.jpg?width=1280',
  s.image_attribution = 'Norbert Nagel, Mörfelden-Walldorf, Germany (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Launaea arborescens';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Azor común',
  s.primary_habitat = 'Bosques maduros y masas forestales densas con claros',
  s.description = 'Rapaz forestal de alas cortas y anchas y cola larga, diseñada para perseguir presas entre los árboles a gran velocidad. Es esquiva y se ve casi siempre de refilón. La hembra llega a ser un tercio mayor que el macho, una diferencia poco habitual entre las aves.',
  s.identification_tips = 'Ceja blanca marcada sobre el ojo, como un antifaz al revés
Vuelo de varios aleteos rápidos seguidos de un planeo corto
Pecho finamente rayado en horizontal en los adultos',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Northern_Goshawk_ad_M2.jpg?width=1280',
  s.image_attribution = 'Norbert Kenntner, Berlin (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Accipiter gentilis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Azufaifo',
  s.primary_habitat = 'Matorrales arborescentes de Ziziphus',
  s.description = 'Arbusto espinoso que forma cúpulas densas de varios metros, un microhábitat en sí mismo: bajo su copa se refugian aves, reptiles y mamíferos, y la humedad y el suelo son distintos que fuera. Sus ramas zigzaguean con dos espinas en cada nudo, una recta y otra ganchuda.',
  s.identification_tips = 'Ramas en zigzag con dos espinas por nudo, una recta y otra curva
Porte en cúpula o almohadón, muy denso
Frutos redondos que pasan de verde a pardo amarillento',
  s.seasonality = 'Primavera a otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Ziziphus_lotus_20200928_191923.jpg?width=1280',
  s.image_attribution = 'Nanosanchez (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Ziziphus lotus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Baladre',
  s.primary_habitat = 'Cauces de rambla y ramblizos con humedad subterránea y crecidas',
  s.description = 'Arbusto de hojas coriáceas, alargadas y opuestas, que forma masas densas en el lecho de las ramblas y aguanta las riadas gracias a su raigambre. Florece en rosa intenso durante buena parte del verano. Toda la planta es muy tóxica, savia incluida.',
  s.identification_tips = 'Hojas duras y lanceoladas con el nervio central marcado
Flores rosas grandes en el extremo de las ramas
Frutos en vaina larga que se abre soltando semillas con vilano',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Nerium_oleander_flowers_leaves.jpg?width=1280',
  s.image_attribution = 'Alvesgaspar (CC BY 2.5) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Nerium oleander';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Barba de chivo',
  s.primary_habitat = 'Pastizales anuales sobre suelos secos y pedregosos',
  s.description = 'Gramínea anual que agosta pronto y cubre los claros de matorral de un rubio pajizo. Cada semilla lleva una arista larga y retorcida que gira con los cambios de humedad y va enroscándose hasta clavarla en el suelo. Es la responsable de las «agujas» que se enganchan en los calcetines.',
  s.identification_tips = 'Aristas largas y retorcidas, en espiral al secarse
Planta anual: en verano queda seca y pajiza
Las semillas se clavan en la ropa y el pelaje',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Stipa_capensis.JPG?width=1280',
  s.image_attribution = 'Juanmadro (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Stipa capensis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Barrilla pinchosa',
  s.primary_habitat = 'Arenas y gravas del primer cordón de playa y suelos removidos salinos',
  s.description = 'Hierba anual muy ramificada, de hojas carnosas rematadas en un pincho fino, que forma una bola. Al secarse se desprende del suelo y rueda con el viento dispersando las semillas. Coloniza la línea donde el mar deja restos de algas y madera.',
  s.identification_tips = 'Hojas carnosas terminadas en una punta pinchuda
Forma una mata redondeada que rueda al secarse
Tallos con finas líneas rojizas o rosadas',
  s.seasonality = 'Verano y otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Salsola_kali_habito.jpg?width=1280',
  s.image_attribution = 'autor no indicado (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Salsola kali';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Bayón',
  s.primary_habitat = 'Matorral alto, sabinares y laderas secas sobre suelo pedregoso',
  s.description = 'Arbusto de ramas verdes y erguidas con hojas estrechas y coriáceas. Es hemiparásito: fabrica su propio alimento pero además conecta sus raíces a las de otras plantas para robarles agua y sales. Sus frutos son bayas rojas o anaranjadas muy vistosas.',
  s.identification_tips = 'Ramas verdes y erectas, de aspecto escobiforme
Bayas rojo anaranjado brillantes al madurar
Hojas estrechas, duras y de punta aguda',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Osyris_lanceolata.JPG?width=1280',
  s.image_attribution = 'Xemenendura (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Osyris lanceolata';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Búho real',
  s.primary_habitat = 'Cortados rocosos, barrancos y laderas con matorral y zonas abiertas de caza',
  s.description = 'El mayor búho de Europa, con casi dos metros de envergadura, penachos de plumas erguidos sobre la cabeza y ojos de un naranja encendido. Caza conejos, ratas e incluso otras rapaces. Su canto es un «bu-bo» profundo que se propaga kilómetros por los barrancos en las noches de invierno.',
  s.identification_tips = 'Penachos de plumas erguidos a los lados de la cabeza
Ojos naranjas muy intensos
Canto grave y profundo en las noches de invierno',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Bubo_bubo_sibiricus_-_01.JPG?width=1280',
  s.image_attribution = 'Carlos Delgado (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Bubo bubo';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Calandria común',
  s.primary_habitat = 'Llanos cerealistas, pastizales y estepas de suelo profundo',
  s.description = 'La mayor de las alondras ibéricas, robusta y de pico grueso, con una mancha negra muy marcada a cada lado del cuello. Canta en vuelo, describiendo círculos altos con un torrente de notas en el que imita a otras aves. En invierno forma bandos numerosos en los llanos.',
  s.identification_tips = 'Babero negro a cada lado del cuello
Borde trasero del ala blanco y visible en vuelo
Pico grueso y pálido, de granívora',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Melanocorypha_calandra.jpg?width=1280',
  s.image_attribution = 'Bereşe.jpg: Dûrzan cîrano derivative work: Osado (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Melanocorypha calandra';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cambrón',
  s.primary_habitat = 'Matorral costero y suelos salinos y nitrificados de clima cálido',
  s.description = 'Arbusto de ramas enmarañadas y espinosas, con hojitas carnosas agrupadas en manojos. Sus flores son pequeñas, tubulares y de color violeta pálido, y da bayas rojas que comen muchas aves. Forma setos impenetrables que dan refugio a pájaros y reptiles.',
  s.identification_tips = 'Ramas enredadas entre sí y terminadas en espina
Hojas carnosas en manojitos a lo largo de la rama
Bayas rojas pequeñas y flores tubulares violáceas',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Lycium_intrincatum_(flor).JPG?width=1280',
  s.image_attribution = 'ANE (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Lycium intricatum';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Canadillo',
  s.primary_habitat = 'Roquedos, matorral seco y pie de acantilado en clima cálido',
  s.description = 'Arbusto de aspecto extraño: un manojo de tallos verdes, articulados y colgantes, casi sin hojas, que se quiebran con facilidad por los nudos. No es una planta con flores, sino un pariente lejano de las coníferas; sus semillas van envueltas en una cubierta roja y carnosa.',
  s.identification_tips = 'Tallos verdes articulados que se rompen por los nudos
Sin hojas visibles, solo escamas en cada nudo
Frutos rojos carnosos con una semilla dentro',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Ephedra_fragilis_3.JPG?width=1280',
  s.image_attribution = 'User:falconaumanni (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Ephedra fragilis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cantueso dentado',
  s.primary_habitat = 'Tomillares y matorral termomediterráneo',
  s.description = 'Lavanda de hojas estrechas con el borde recortado en dientes redondeados, muy aromática. Su espiga violácea remata en un penacho de brácteas del mismo color, más corto que el del cantueso común. Florece durante buena parte del año en clima cálido.',
  s.identification_tips = 'Bordes de la hoja recortados en dientes romos
Penacho de brácteas violetas en lo alto de la espiga
Aroma intenso, entre lavanda y alcanfor',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Lavandula_dentata1.jpg?width=1280',
  s.image_attribution = 'KENPEI (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Lavandula dentata';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cardo amarillo de roca',
  s.primary_habitat = 'Roquedos y fisuras calcáreas costeras',
  s.description = 'Compuesta rupícola que crece colgando de las fisuras de los cantiles calizos, con hojas divididas y algo carnosas y capítulos amarillos rodeados de brácteas con apéndices espinosos. Es un endemismo del sureste ibérico ligado a paredes de roca costeras y de interior.',
  s.identification_tips = 'Capítulos amarillos con brácteas de apéndice espinoso
Hojas divididas y algo carnosas, en roseta colgante
Crece encajada en la grieta, no en el suelo',
  s.seasonality = 'Floración primaveral',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Centaurea_saxicola674.jpg?width=1280',
  s.image_attribution = 'Nanosanchez (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Centaurea saxicola';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Carraca europea',
  s.primary_habitat = 'Campos abiertos con arbolado disperso, ribazos y construcciones con huecos',
  s.description = 'Del tamaño de una paloma y de un azul turquesa intenso que sorprende al levantar el vuelo. Caza al acecho desde cables y postes, dejándose caer sobre saltamontes y escarabajos. Cría en huecos de árboles viejos y de edificios, de ahí que dependa de que queden árboles añosos y ruinas en el campo.',
  s.identification_tips = 'Azul turquesa que solo se aprecia bien cuando vuela
Espalda de color canela que contrasta con el azul
Posada quieta en cables, oteando el suelo',
  s.seasonality = 'Primavera y verano (estival)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/European_roller.jpg?width=1280',
  s.image_attribution = 'Christian Svane (CC BY-SA 2.5) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Coracias garrulus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Carrizo real',
  s.primary_habitat = 'Ramblas, cauces y suelos húmedos con capa freática cercana',
  s.description = 'Gramínea gigante que levanta cañas de dos y tres metros rematadas por penachos plumosos plateados, muy vistosos al contraluz de finales de verano. Forma matas grandes en cauces y bordes de rambla, donde sujeta el sustrato.',
  s.identification_tips = 'Penachos plumosos plateados en lo alto de cañas altas
Forma matas grandes y densas, no céspedes
Hojas largas de borde muy áspero, cortante al pasar la mano',
  s.seasonality = 'Verano y otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Saccharum_ravennae_-_J._C._Raulston_Arboretum_-_DSC06214.JPG?width=1280',
  s.image_attribution = 'Daderot (Public domain) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Saccharum ravennae';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cernícalo vulgar',
  s.primary_habitat = 'Campos abiertos, matorral, cortados y también ciudades',
  s.description = 'El halcón más común y fácil de ver, gracias a su costumbre de cernirse: se queda suspendido en el aire batiendo las alas con la cabeza inmóvil, buscando ratones y lagartijas. El macho tiene la cabeza gris y el dorso rojizo con puntos negros; la hembra es más parda y barrada.',
  s.identification_tips = 'Se queda «clavado» en el aire cerniéndose
Dorso rojizo salpicado de puntos negros
Cola larga con una banda negra ancha en la punta',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Common_kestrel_falco_tinnunculus.jpg?width=1280',
  s.image_attribution = 'Andreas Trepte (CC BY-SA 2.5) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Falco tinnunculus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cerrillo',
  s.primary_habitat = 'Laderas secas, ribazos y pastizales sobre suelos pedregosos',
  s.description = 'Gramínea perenne que forma matas y espiga en verano, cuando el resto del pastizal ya está agostado. Sus espiguillas van por parejas, cubiertas de pelos rojizos y con aristas retorcidas. Da al paisaje un tono dorado rojizo a final de verano.',
  s.identification_tips = 'Espiguillas peludas agrupadas por parejas
Aristas retorcidas y acodadas
Espiga en verano, cuando lo demás está seco',
  s.seasonality = 'Verano y otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Hyparrhenia_hirta_Habitus_ValledeAlcudia.jpg?width=1280',
  s.image_attribution = 'Javier martin (Public domain) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Hyparrhenia hirta';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Charrán patinegro',
  s.primary_habitat = 'Costas, bahías y salinas; pesca sobre aguas someras',
  s.description = 'Charrán grande y pálido, con un penacho negro despeinado en la nuca y un pico negro rematado en amarillo, como si lo hubiera mojado en mostaza. Pesca zambulléndose de golpe desde varios metros de altura. Fuera de la época de cría pierde el negro de la frente y queda con la coronilla blanca.',
  s.identification_tips = 'Punta amarilla en el pico negro
Nuca con plumas negras erizadas, en penacho
Se lanza al agua en picado, plegando las alas',
  s.seasonality = 'Otoño e invierno principalmente',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/606127388/original.jpg',
  s.image_attribution = 'Diego González Dopico (CC BY 4.0) · GBIF',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Thalasseus sandvicensis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Charrancito común',
  s.primary_habitat = 'Playas de arena y grava, salinas y lagunas costeras',
  s.description = 'El más pequeño de los charranes europeos, con la frente blanca y el pico amarillo de punta negra. Cría directamente sobre la arena o la grava, en nidos que son poco más que un hoyo, lo que lo hace muy sensible al tránsito de personas en las playas.',
  s.identification_tips = 'Frente blanca que contrasta con el capirote negro
Pico amarillo con la punta negra
Se ciñe sobre el agua antes de zambullirse en picado',
  s.seasonality = 'Primavera y verano (estival)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Little_Tern_6820C.jpg?width=1280',
  s.image_attribution = 'Little_Tern_6820.jpg: Alnus derivative work: Osado (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Sternula albifrons';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Chorlitejo patinegro',
  s.primary_habitat = 'Playas, salinas, marismas y llanos arenosos junto al mar',
  s.description = 'Chorlitejo pequeño y pálido, de patas oscuras, que corretea por la arena en carreras cortas seguidas de paradas bruscas. Su nido es una simple depresión en la arena con los huevos perfectamente camuflados, por lo que las puestas se pierden con facilidad bajo el pisoteo.',
  s.identification_tips = 'Collar oscuro interrumpido en el centro del pecho
Corre a ratos y se para en seco, una y otra vez
Plumaje muy pálido, del color de la arena seca',
  s.seasonality = 'Todo el año, con máximos en primavera y verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Charadrius_alexandrinus_-_Kentish_Plover_03.jpg?width=1280',
  s.image_attribution = 'Zeynel Cebeci (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Charadrius alexandrinus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Chotacabras cuellirrojo',
  s.primary_habitat = 'Matorral abierto, pinares aclarados, ramblas y caminos térreos',
  s.description = 'Ave crepuscular de plumaje jaspeado que imita la hojarasca, tan mimético que de día resulta casi imposible verla posada en el suelo. Caza polillas en vuelo con la boca muy abierta. Su canto nocturno es un «cu-toc, cu-toc» repetido de forma monótona durante minutos.',
  s.identification_tips = 'Collar rojizo en la nuca, más marcado que en su pariente europeo
Se levanta del camino al anochecer y vuelve a posarse unos metros más allá
Canto nocturno monótono, como un motor lejano',
  s.seasonality = 'Primavera y verano (estival)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Caprimulgus_ruficollis_-Portugal-8.jpg?width=1280',
  s.image_attribution = 'Olivença (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Caprimulgus ruficollis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Chova piquirroja',
  s.primary_habitat = 'Cortados rocosos, cantiles y montañas, alimentándose en pastizales cercanos',
  s.description = 'Córvido negro y brillante con el pico rojo, largo y curvo, y las patas del mismo color encendido. Vuela en grupos acrobáticos junto a los cantiles, plegando las alas y dejándose caer por puro juego. Busca larvas hurgando en el suelo de los pastos con ese pico de sonda.',
  s.identification_tips = 'Pico rojo, largo y curvado hacia abajo
Reclamo agudo, un «chiaa» nasal muy característico
Plumas de la punta del ala muy separadas, como dedos',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Pyrrhocorax_pyrrhocorax_-standing-8.jpg?width=1280',
  s.image_attribution = 'File:Alpenkrähe.jpg: "Malte Uhl (User:Zzzip)" derivative work: Snow… (CC BY-SA 2.5) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Pyrrhocorax pyrrhocorax';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cinomorio',
  s.primary_habitat = 'Saladares y matorrales halonitrófilos',
  s.description = 'Planta parásita sin clorofila, de aspecto de maza rojiza, que crece sobre las raíces de quenopodiáceas halófilas de los saladares y estepas salinas.',
  s.identification_tips = 'Inflorescencia carnosa rojo-oscura en maza
Sin hojas verdes (parásita)
Aparece sobre raíces de plantas halófilas',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Cynomorium_coccineum_vMH375.jpg?width=1280',
  s.image_attribution = 'autor no indicado (Public domain) · Wikimedia Commons',
  s.rarity_score = 5
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Cynomorium coccineum';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cogujada común',
  s.primary_habitat = 'Cultivos, caminos, eriales y bordes de poblado con suelo desnudo',
  s.description = 'Alondra parda de cresta alta y puntiaguda, muy ligada a caminos, cunetas y descampados junto a los pueblos. Camina en vez de saltar y, al volar, deja ver el forro rojizo de las alas y la cola con los bordes canela.',
  s.identification_tips = 'Cresta larga y puntiaguda, casi siempre erguida
Forro de las alas rojizo, visible al levantar el vuelo
Camina por el suelo en vez de saltar',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Crested_Lark_-_Qatar.jpg?width=1280',
  s.image_attribution = 'Ashraf Kotb (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Galerida cristata';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cogujada montesina',
  s.primary_habitat = 'Matorral bajo, laderas pedregosas y eriales con vegetación rala',
  s.description = 'Cogujada de cresta puntiaguda, muy parecida a la común pero de pico más corto y grueso y con el pecho más nítidamente rayado. Prefiere el matorral y las laderas pedregosas, mientras que la común busca cultivos, caminos y bordes de pueblo.',
  s.identification_tips = 'Cresta alta y afilada, casi triangular
Pico más corto y romo que el de la cogujada común
Rayado del pecho bien definido, no difuminado',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Galerida_theklae_Madrid.jpg?width=1280',
  s.image_attribution = 'Adrian198cm (Public domain) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Galerida theklae';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Collalba negra',
  s.primary_habitat = 'Matorral litoral, laderas secas y roquedos',
  s.description = 'La mayor de las collalbas, enteramente negra salvo el obispillo y la base de la cola, blancos. Vive en cortados y laderas rocosas, donde construye junto al nido una plataforma de piedrecitas que acarrea una a una. Su canto es potente y melodioso.',
  s.identification_tips = 'Cuerpo negro con obispillo blanco muy contrastado
«T» negra invertida en la cola blanca al volar
Montoncitos de piedrecitas junto a la grieta del nido',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Black_Wheatear%2C_Isla_Plana_3.jpg?width=1280',
  s.image_attribution = 'Andrew Thomas from Shrewsbury, UK (CC BY-SA 2.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Oenanthe leucura';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Collalba rubia',
  s.primary_habitat = 'Laderas secas y pedregosas con matorral bajo y suelo desnudo',
  s.description = 'Collalba pequeña y contrastada: el macho es color arena claro con las alas negras y un antifaz o una garganta negros según la variedad. Como todas las collalbas, enseña al volar una cola blanca con una «T» negra invertida. Caza insectos lanzándose al suelo desde una piedra o una mata.',
  s.identification_tips = 'Cola blanca con una «T» negra al abrirse
Alas negras que resaltan sobre el cuerpo color arena
Se posa erguida en piedras y matas, muy visible',
  s.seasonality = 'Primavera y verano (estival)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Black-eared_Wheatear%2C_Punta_del_Sabinar%2C_Spain.jpg?width=1280',
  s.image_attribution = 'Vince Smith from London, United Kingdom (CC BY-SA 2.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Oenanthe hispanica';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Colleja de arenal',
  s.primary_habitat = 'Dunas con céspedes del Malcolmietalia',
  s.description = 'Colleja anual muy ramificada desde la base, característica de las dunas semifijas; da nombre a la asociación Triplachno nitentis-Silenetum ramosissimae.',
  s.identification_tips = 'Muy ramificada desde la base
Cáliz inflado con nervios marcados
Anual de vida corta',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Silene_ramosissima_2.jpg?width=1280',
  s.image_attribution = 'bymamo (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Silene ramosissima';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Coloquíntida',
  s.primary_habitat = 'Ramblas, arenales y suelos removidos de clima árido',
  s.description = 'Pariente silvestre de la sandía, de tallos rastreros y zarcillos, que extiende sus ramas por el suelo desnudo de ramblas y baldíos. Sus frutos son bolas del tamaño de una naranja, verdes jaspeadas al principio y amarillas al madurar, de pulpa amarguísima y tóxica.',
  s.identification_tips = 'Tallos tumbados por el suelo, con zarcillos
Frutos esféricos jaspeados que amarillean al madurar
Hojas profundamente lobuladas y ásperas',
  s.seasonality = 'Verano y otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Citrullus_colocynthis_(L.)_Schrad._(31794489158).jpg?width=1280',
  s.image_attribution = 'Dinesh Valke from Thane, India (CC BY-SA 2.0) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Citrullus colocynthis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cormorán moñudo',
  s.primary_habitat = 'Costas rocosas, acantilados e islotes; pesca buceando cerca de la orilla',
  s.description = 'Cormorán marino de plumaje negro con reflejos verdosos, más esbelto que el grande y con la frente empinada. Bucea desde la superficie con un salto característico y persigue peces bajo el agua. Se seca con las alas abiertas sobre las rocas.',
  s.identification_tips = 'Salta hacia arriba antes de sumergirse
Frente muy empinada y pico fino
Se posa en roca con las alas abiertas al sol',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Shag_Phalacrocorax_aristotelis.jpg?width=1280',
  s.image_attribution = 'Andreas Trepte (CC BY-SA 2.5) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Gulosus aristotelis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cornical',
  s.primary_habitat = 'Matorral cálido, laderas soleadas y barrancos de clima muy seco',
  s.description = 'Arbusto de hojas estrechas y coriáceas y flores pequeñas con cinco pétalos de un pardo verdoso y aspecto aterciopelado. Sus frutos son dos vainas largas y curvas dispuestas en forma de cuerno, de donde le viene el nombre popular de cornical. Suelta látex al romperse.',
  s.identification_tips = 'Frutos en dos vainas curvas enfrentadas, como cuernos
Látex blanco al partir una hoja o rama
Flores pardo verdosas con aspecto de terciopelo',
  s.seasonality = 'Primavera y verano (floración)',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/609975159/original.jpg',
  s.image_attribution = 'Quentin Groom (CC0) · GBIF',
  s.rarity_score = 3
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Periploca angustifolia';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Correlimos tridáctilo',
  s.primary_habitat = 'Playas de arena expuestas; también salinas y marismas costeras',
  s.description = 'Limícola pequeña y muy pálida que se ve casi siempre en la misma escena: corriendo tras la ola que se retira y huyendo de la siguiente, con las patas moviéndose a toda velocidad. En invierno es el más blanco de los correlimos, con una mancha negra en el hombro.',
  s.identification_tips = 'Corre persiguiendo el vaivén de las olas
Plumaje de invierno muy blanco y limpio
Mancha negra en el hombro y barra alar blanca en vuelo',
  s.seasonality = 'Otoño e invierno',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Calidris-alba-001.jpg?width=1280',
  s.image_attribution = 'Original photo by Mdf (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Calidris alba';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Coscoja',
  s.primary_habitat = 'Matorral esclerófilo y sabinar',
  s.description = 'Arbusto esclerófilo de hoja perenne y espinosa, integrante del matorral mediterráneo denso y de las orlas del sabinar.',
  s.identification_tips = 'Hojas coriáceas con margen espinoso
Bellota con cúpula de escamas punzantes
Porte arbustivo denso',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Quercus_coccifera_1.JPG?width=1280',
  s.image_attribution = 'User:Xemenendura (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Quercus coccifera';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cuernecillo de mar',
  s.primary_habitat = 'Dunas móviles embrionarias',
  s.description = 'Leguminosa rastrera de follaje sedoso-plateado y flores amarillas, característica de las arenas litorales móviles.',
  s.identification_tips = 'Flores amarillas papilionadas
Follaje sedoso-plateado
Porte rastrero sobre arena',
  s.seasonality = 'Primavera',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/619207211/original.jpg',
  s.image_attribution = 'Augustin Soulard (CC BY 4.0) · GBIF',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Lotus creticus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cuerno de cabra',
  s.primary_habitat = 'Matorral árido y claros de vegetación',
  s.description = 'Crucífera anual y menuda, de tallos tendidos y hojas pequeñas, con flores blanquecinas poco vistosas. Lo característico son los frutos: pequeñas silículas rematadas por dos cuernecillos divergentes que le dan el nombre.',
  s.identification_tips = 'Frutos con dos cuernecillos divergentes en la punta
Planta anual diminuta y tendida por el suelo
Flores blanquecinas muy pequeñas, casi inapreciables',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Notoceras_bicorne_kz08.jpg?width=1280',
  s.image_attribution = 'Krzysztof Ziarnek, Kenraiz (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Notoceras bicorne';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Culebra bastarda',
  s.primary_habitat = 'Matorral litoral y laderas secas',
  s.description = 'La culebra más grande de la península, de hasta dos metros y medio, con un aspecto inconfundible: ojos grandes de pupila redonda bajo unas escamas salientes que le dan «cejas» y expresión de enfado. Es diurna, muy rápida y venenosa, pero con los colmillos al fondo de la boca, por lo que no supone riesgo si no se la manipula.',
  s.identification_tips = 'Escamas prominentes sobre los ojos, como cejas
Ojo grande con pupila redonda y iris amarillento
Adultos de dorso pardo oliváceo uniforme; jóvenes muy manchados',
  s.seasonality = 'Primavera a otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Culebra_bastarda_(Malpolon_monspessulanus)%2C_Nig%C3%BCella%2C_Zaragoza%2C_Espa%C3%B1a%2C_2017-05-24%2C_DD_07.jpg?width=1280',
  s.image_attribution = 'Diego Delso (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Malpolon monspessulanus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Culebrera europea',
  s.primary_habitat = 'Sierras y llanos con matorral, ramblas y bosque abierto',
  s.description = 'Águila grande y muy pálida por debajo, especializada en comer culebras y lagartos. Se ciñe en el aire durante largos ratos, con las patas colgando, escrutando el suelo antes de dejarse caer. La cabeza, ancha y con ojos amarillos muy frontales, le da un aire de lechuza.',
  s.identification_tips = 'Vientre y alas casi blancos vistos desde abajo
Se mantiene cerniéndose, algo raro en un águila tan grande
Cabeza ancha y ojos amarillos, aspecto de búho',
  s.seasonality = 'Primavera y verano (estival)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Aguila_culebrera_(Circaetus_gallicus).jpg?width=1280',
  s.image_attribution = 'Paco Gómez (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Circaetus gallicus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Curruca cabecinegra',
  s.primary_habitat = 'Matorral mediterráneo denso, setos y bordes de arbolado',
  s.description = 'La curruca más común del matorral mediterráneo. El macho tiene la cabeza negra hasta por debajo del ojo, la garganta blanca y un llamativo anillo ocular rojo. Es ruidosa y territorial: su reclamo de alarma es un traqueteo seco que delata su presencia constantemente.',
  s.identification_tips = 'Capucha negra que baja por debajo del ojo
Anillo ocular rojo intenso
Reclamo de alarma como una carraca seca',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Sardinian_Warbler.jpg?width=1280',
  s.image_attribution = 'Andreas Trepte (CC BY-SA 2.5) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Curruca melanocephala';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Curruca rabilarga',
  s.primary_habitat = 'Matorral bajo y denso, jarales, brezales y tomillares',
  s.description = 'Curruca pequeña, oscura y de cola muy larga que suele llevar levantada. El macho tiene el vientre vinoso y el ojo rojo rodeado de un anillo del mismo color. Es muy inquieta y rara vez se deja ver más de unos segundos antes de volver a hundirse en la mata.',
  s.identification_tips = 'Cola larga y erguida, casi vertical al posarse
Ojo y anillo ocular rojos
Vientre de color vinoso, con motitas blancas en la garganta',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Fauvette_pitchou_Ichkeul_NP.jpg?width=1280',
  s.image_attribution = 'El Golli Mohamed (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Curruca undata';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Curruca tomillera',
  s.primary_habitat = 'Matorral bajo y abierto, tomillares y saladares con arbustos dispersos',
  s.description = 'Curruca menuda de matorral raso, gris en la cabeza, parda en el dorso y con las plumas del ala ribeteadas de castaño encendido. El anillo blanco del ojo le da el aire de «gafas» que le da nombre. Es inquieta y suele delatarse por su reclamo antes de dejarse ver.',
  s.identification_tips = 'Anillo blanco alrededor del ojo bien marcado
Panel castaño vivo en el ala plegada
Vive en matorral muy bajo, no en arbolado',
  s.seasonality = 'Todo el año en el sureste; parcialmente migradora',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Fauvette_%C3%A0_lunettes_Aqueduc_de_Zaghouan.jpg?width=1280',
  s.image_attribution = 'El Golli Mohamed (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Curruca conspicillata';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Eragrostis',
  s.primary_habitat = 'Pastizales de la subestepa de gramíneas',
  s.description = 'Gramínea de panícula muy abierta y ligera, con espiguillas diminutas sostenidas por ramas finísimas que tiemblan con el viento. Es una planta de estirpe saharo-arábiga que en Europa solo aparece en los enclaves más áridos del sureste ibérico.',
  s.identification_tips = 'Panícula muy abierta y difusa, casi transparente
Espiguillas diminutas colgando de ramas capilares
Mata pequeña, de menos de medio metro',
  s.seasonality = 'Verano',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/591856810/original.jpg',
  s.image_attribution = 'Alejandro Rodríguez Zapata (CC BY 4.0) · GBIF/iNaturalist',
  s.rarity_score = 4
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Eragrostis papposa';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Erodio',
  s.primary_habitat = 'Litosuelos y pastizales abiertos',
  s.description = 'Pequeña geraniácea anual de suelos abiertos y pedregosos, de floración temprana en el piso termomediterráneo semiárido.',
  s.identification_tips = 'Flores rosadas pequeñas
Fruto con pico alargado característico de Erodium
Anual de suelos pedregosos',
  s.seasonality = 'Primavera',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/642301345/original.jpg',
  s.image_attribution = 'Laia Lahoz (CC BY-NC 4.0) · iNaturalist/GBIF',
  s.rarity_score = 4
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Erodium sanguis-christi';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Escrofularia de perro',
  s.primary_habitat = 'Ríos mediterráneos con Glaucium flavum',
  s.description = 'Escrofularia perenne de tallos ramosos y flores diminutas pardo-purpúreas, típica de gravas fluviales y cauces pedregosos.',
  s.identification_tips = 'Hojas divididas
Flores diminutas pardo-rojizas
Crece en gravas de cauce',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/636689170/original.jpg',
  s.image_attribution = 'Antón David Pérez Rodríguez (CC0) · GBIF',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Scrophularia canina';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Eslizón ibérico',
  s.primary_habitat = 'Matorral termomediterráneo semiárido',
  s.description = 'Eslizón de cuerpo cilíndrico y brillante, con las patas tan reducidas que apenas se usan: se desplaza reptando y buceando entre la arena y la hojarasca. Su dorso, dorado o bronceado, lleva hileras de ocelos oscuros con el centro claro.',
  s.identification_tips = 'Patas diminutas, casi inútiles para caminar
Cuerpo cilíndrico y muy brillante, como pulido
Hileras de ocelos oscuros de centro claro en el dorso',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Chalcides_bedriagai_01_by-dpc.jpg?width=1280',
  s.image_attribution = 'David Perez (CC BY 3.0) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Chalcides bedriagai';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Esparraguera blanca',
  s.primary_habitat = 'Matorral seco, ribazos y bajo arbustos en clima cálido',
  s.description = 'Esparraguera de tallos blanquecinos y muy espinosos que pierde el follaje en verano y florece en otoño, al revés que casi todo el matorral. Lo que parecen hojas son ramillas finas agrupadas en haces. Sus brotes tiernos son los espárragos silvestres de recolección tradicional.',
  s.identification_tips = 'Tallos claros, casi blancos, con espinas fuertes
Ramillas finas agrupadas en manojitos
Florece en otoño, con flores blancas y olorosas',
  s.seasonality = 'Otoño (floración)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Art%C3%A0_-_Ermita_de_Betlem_-_Asparagus_albus_03_ies.jpg?width=1280',
  s.image_attribution = 'Frank Vincentz (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Asparagus albus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Esparto',
  s.primary_habitat = 'Laderas secas y llanos sobre suelos pobres; forma espartales extensos',
  s.description = 'El esparto, nombrado también como Stipa tenacissima, forma matas densas y duraderas que dan nombre a los espartales, uno de los paisajes característicos del sureste ibérico. Sus hojas se enrollan sobre sí mismas en los días secos para perder menos agua y se abren tras la lluvia. Durante siglos se recolectó para hacer cuerdas, esteras y alpargatas.',
  s.identification_tips = 'Matas grandes y compactas de hojas duras enrolladas
Las hojas se abren tras la lluvia y se enrollan al secar
Espigas altas y plateadas a final de primavera',
  s.seasonality = 'Primavera (espigado)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Stipa_tenacissima.jpg?width=1280',
  s.image_attribution = 'autor no indicado (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Macrochloa tenacissima';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Espino negro',
  s.primary_habitat = 'Matorral litoral y laderas secas',
  s.description = 'Arbusto muy ramificado cuyas ramillas terminan todas en una espina rígida, formando una maraña impenetrable. Sus hojas son pequeñas, estrechas y agrupadas en manojos, y sus frutos, drupas que pasan de rojo a negro y consumen muchas aves.',
  s.identification_tips = 'Todas las ramillas rematadas en espina rígida
Hojas pequeñas y estrechas agrupadas en manojitos
Frutos que viran de rojo a negro al madurar',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/11702748/original.jpeg',
  s.image_attribution = 'Rafael Medina (CC BY 4.0) · GBIF',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Rhamnus lycioides subsp. borgiae';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Fagonia',
  s.primary_habitat = 'Suelos pedregosos, ramblas y litosuelos de clima árido',
  s.description = 'Planta baja y tendida, de tallos angulosos, hojas divididas en tres y estípulas convertidas en espinas finas. Sus flores tienen cinco pétalos de un lila rosado que se abren durante las horas centrales del día. Es de estirpe norteafricana y aquí vive en el extremo de su área.',
  s.identification_tips = 'Porte tendido y desordenado, pegado al suelo
Hojas de tres foliolos con espinas en la base
Flores lila con cinco pétalos bien separados',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Fagonia_cretica.jpg?width=1280',
  s.image_attribution = 'Retama (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Fagonia cretica';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Gamoncillo',
  s.primary_habitat = 'Pastizales secos, bordes de camino y terrenos removidos',
  s.description = 'Gamón pequeño de hojas cilíndricas y huecas —de ahí su nombre— que salen todas de la base. Levanta un tallo ramificado con flores blancas de nervio rosado, que se abren de forma escalonada durante semanas. Es una de las primeras plantas en colonizar cunetas y baldíos.',
  s.identification_tips = 'Hojas finas, cilíndricas y huecas por dentro
Flores blancas con una raya rosa en cada pétalo
Cápsulas redondas y pequeñas al fructificar',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/A._fistulosus-flor-2.JPG?width=1280',
  s.image_attribution = 'Philmarin (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Asphodelus fistulosus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Garceta común',
  s.primary_habitat = 'Marismas, salinas, ramblas con agua, arrozales y orillas costeras',
  s.description = 'Garza blanca y esbelta, de tamaño medio, con el pico negro y las patas negras rematadas en unos pies amarillos llamativos. Pesca removiendo el fondo con esas patas para levantar peces y camarones. En época de cría luce dos plumas largas y finas en la nuca.',
  s.identification_tips = 'Pies amarillos al final de patas negras
Pico negro y fino, no amarillo
Remueve el fondo con una pata mientras acecha',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Aigrette_garzette_au_lac_sud_de_Tunis_(site_RAMSAR).jpg?width=1280',
  s.image_attribution = 'El Golli Mohamed (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Egretta garzetta';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Garduña',
  s.primary_habitat = 'Roquedos, bosques, ruinas y construcciones rurales',
  s.description = 'Mustélido nocturno de cuerpo alargado y cola espesa, con un babero blanco en la garganta que suele bifurcarse hacia las patas delanteras. Trepa con soltura y aprovecha desde roquedos hasta desvanes. Es omnívora: come frutos, insectos, huevos y pequeños vertebrados.',
  s.identification_tips = 'Babero blanco en la garganta, a menudo dividido en dos
Excrementos retorcidos y con pelos o semillas, sobre piedras
Rastro nocturno; muy rara vez se ve de día',
  s.seasonality = 'Todo el año (actividad nocturna)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Steinmarder_01.jpg?width=1280',
  s.image_attribution = 'Zefram (CC BY 2.0 de) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Martes foina';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Gato montés',
  s.primary_habitat = 'Bosque, matorral denso y roquedos con buena población de conejos y roedores',
  s.description = 'Gato salvaje europeo, más robusto que un gato doméstico atigrado, con la cola gruesa, roma en la punta y anillada de negro. Es solitario, esquivo y sobre todo nocturno. Su mayor amenaza es la hibridación con gatos asilvestrados, que diluye la población silvestre.',
  s.identification_tips = 'Cola gruesa, de punta roma y con anillos negros nítidos
Raya negra continua a lo largo del lomo
Aspecto más recio y patilargo que un gato casero',
  s.seasonality = 'Todo el año (actividad crepuscular y nocturna)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Felis_silvestris_Kocka_divok%C3%A1_zoo_cropped.jpg?width=1280',
  s.image_attribution = 'Felis_silvestris_Kočka_divoká_ZOO_Děčín.jpg: Alena Houšková derivat… (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Felis silvestris';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Gaviota de Audouin',
  s.primary_habitat = 'Islotes y costas mediterráneas; pesca en mar abierto cerca de la orilla',
  s.description = 'Gaviota mediterránea de tamaño medio, elegante y de aspecto más «limpio» que la patiamarilla, con el pico rojo coral anillado de negro y las patas verdosas oscuras. Pesca al vuelo rozando el agua, sobre todo de noche y de madrugada. Cría en colonias muy concentradas en islotes y salinas.',
  s.identification_tips = 'Pico rojo coral con una banda negra cerca de la punta
Patas verde oscuro, no amarillas
Ojo oscuro que le da expresión suave',
  s.seasonality = 'Todo el año, con concentraciones en verano',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/611415320/original.jpg',
  s.image_attribution = 'Michael Bakker Paiva (CC BY 4.0) · GBIF',
  s.rarity_score = 4
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Larus audouinii';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Gaviota reidora',
  s.primary_habitat = 'Costas, salinas, embalses, ríos y campos de cultivo inundados',
  s.description = 'Gaviota pequeña y ágil, muy común en invierno tierra adentro. En verano lleva la cabeza cubierta por una capucha de color chocolate; en invierno solo le queda una mancha oscura tras el ojo. En vuelo enseña una cuña blanca inconfundible en el borde delantero del ala.',
  s.identification_tips = 'Cuña blanca en el filo delantero del ala, visible en vuelo
En invierno, una mancha oscura como un auricular tras el ojo
Pico y patas rojo oscuro',
  s.seasonality = 'Otoño e invierno',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/605325270/original.jpg',
  s.image_attribution = 'lalaia (CC BY 4.0) · GBIF',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Chroicocephalus ridibundus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Gineta',
  s.primary_habitat = 'Bosque, matorral denso, roquedos y sotos con cobertura y refugios',
  s.description = 'Carnívoro esbelto de pelaje gris con manchas negras y una cola larguísima anillada en blanco y negro, tan larga como el resto del cuerpo. Es un trepador excelente y estrictamente nocturno. Deja sus excrementos en letrinas fijas sobre piedras y troncos, que usa durante años.',
  s.identification_tips = 'Cola muy larga con anillos blancos y negros bien marcados
Pelaje gris con hileras de manchas negras
Letrinas repetidas en el mismo punto elevado',
  s.seasonality = 'Todo el año (actividad nocturna)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Genetta_genetta_felina_(Wroclaw_zoo).JPG?width=1280',
  s.image_attribution = 'Guérin Nicolas (messages) (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Genetta genetta';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Grama de mar',
  s.primary_habitat = 'Dunas móviles embrionarias',
  s.description = 'Gramínea rizomatosa y glauca que entrelaza la arena con sus largos rizomas y levanta las primeras dunas embrionarias; especie dominante de este hábitat en el Mediterráneo.',
  s.identification_tips = 'Rizomas largos que traban la arena
Hojas glaucas y rígidas
Espiga que se fragmenta al madurar',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Elymus_farctus_kz16.jpg?width=1280',
  s.image_attribution = 'Krzysztof Ziarnek, Kenraiz (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Elymus farctus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Halcón peregrino',
  s.primary_habitat = 'Cortados y áreas abiertas',
  s.description = 'Halcón robusto de alas puntiagudas y cola corta, capaz de superar los 300 km/h en el picado con que abate a otras aves en pleno vuelo. Se reconoce por la ancha bigotera negra que baja desde el ojo sobre un pecho claro y barrado.',
  s.identification_tips = 'Bigotera negra ancha bajo el ojo, como un casco
Silueta de ancla: alas puntiagudas y cola corta
Pecho claro con barrado fino en horizontal',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Falco_peregrinus_-_01.jpg?width=1280',
  s.image_attribution = 'Carlos Delgado (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Falco peregrinus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Hinojo marino',
  s.primary_habitat = 'Grietas de acantilados y rocas batidas por el salpicón del mar',
  s.description = 'Planta carnosa de acantilado, con hojas gruesas divididas en segmentos cilíndricos que almacenan agua y toleran la sal. Sus flores, amarillo verdoso, se agrupan en umbelas planas. Se ha consumido tradicionalmente encurtida, con un sabor intenso a mar y a hinojo.',
  s.identification_tips = 'Hojas carnosas divididas en segmentos como deditos
Umbelas planas de florecillas verde amarillentas
Solo en la roca costera, al alcance de la salpicadura',
  s.seasonality = 'Verano y otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Crithmum_maritimum.jpg?width=1280',
  s.image_attribution = 'Júlio Reis (Tintazul) (CC BY-SA 2.5) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Crithmum maritimum';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Hornungia',
  s.primary_habitat = 'Prados calcáreos del Alysso-Sedion albi',
  s.description = 'Minúsculo terófito calcícola de floración muy temprana tras las lluvias, diagnóstico de los prados pioneros del Alysso-Sedion albi sobre suelos esqueléticos.',
  s.identification_tips = 'Anual diminuta primaveral
Florece muy pronto tras las lluvias
Fruto en silícula',
  s.seasonality = 'Invierno y primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Hornungia_petraea2_eF.jpg?width=1280',
  s.image_attribution = 'autor no indicado (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Hornungia petraea';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Jabalí',
  s.primary_habitat = 'Bosque, matorral denso y cultivos; necesita cobertura y puntos de agua',
  s.description = 'Ungulado robusto y adaptable, con el cuerpo cubierto de cerdas ásperas y una cabeza en cuña rematada por un hocico potente con el que remueve el suelo. Los rayones —las crías— nacen con líneas claras a lo largo del lomo. Es omnívoro y ha ampliado mucho su área en las últimas décadas.',
  s.identification_tips = 'Hozaduras: zonas de suelo removido como si lo hubieran arado
Huellas hendidas grandes con las pezuñas laterales marcadas
Barros y árboles con el tronco embarrado a media altura',
  s.seasonality = 'Todo el año (actividad sobre todo nocturna)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Eberswalde_Zoo_12-2017_img2.jpg?width=1280',
  s.image_attribution = 'A.Savin (FAL) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Sus scrofa';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Jarilla de Almería',
  s.primary_habitat = 'Tomillares y matorral abierto sobre suelos secos y pedregosos',
  s.description = 'Jarilla enana de hojas pequeñas y blanquecinas, cubiertas de pelos que reflejan la luz y reducen la pérdida de agua. En primavera se cubre de flores blancas con el centro amarillo, cuyos pétalos duran apenas una mañana. Sus raíces se asocian con hongos comestibles del desierto.',
  s.identification_tips = 'Mata baja y grisácea, de hojas muy pequeñas
Flores blancas con el centro amarillo, efímeras
Pétalos arrugados, como de papel de seda',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Helianthemum_almeriense_flor.jpg?width=1280',
  s.image_attribution = 'Retama (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Helianthemum almeriense';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Juncia marina',
  s.primary_habitat = 'Dunas móviles embrionarias',
  s.description = 'Ciperácea de arenales litorales, con tallos de sección triangular y cabezuela globosa; especie característica de las dunas embrionarias mediterráneas.',
  s.identification_tips = 'Tallo de sección triangular
Inflorescencia en cabezuela apretada
Crece sobre arena suelta',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Cyperus_capitatus.JPG?width=1280',
  s.image_attribution = 'Taken by Carsten Niehaus (user:Lumbar). (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Cyperus capitatus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Lagartija colilarga',
  s.primary_habitat = 'Matorral litoral y laderas secas',
  s.description = 'Lagartija esbelta de escamas grandes, quilladas y brillantes, con dos líneas claras muy marcadas a cada lado del dorso. La cola puede medir el doble que el cuerpo. Los machos lucen en primavera manchas azules en el hombro y las mejillas anaranjadas.',
  s.identification_tips = 'Dos líneas claras nítidas a lo largo de cada costado
Escamas grandes y quilladas, de aspecto brillante
Cola larguísima, hasta el doble que el cuerpo',
  s.seasonality = 'Primavera a otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Psammodromus_algirus_-_01.jpg?width=1280',
  s.image_attribution = 'Carlos Delgado (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Psammodromus algirus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Lagartija colirroja',
  s.primary_habitat = 'Matorral litoral y laderas secas',
  s.description = 'Lagartija de suelos arenosos, de cuerpo aplanado y dedos con escamas laterales en forma de peine que le sirven de raqueta sobre la arena suelta. Los jóvenes tienen la cola y las patas traseras de un rojo intenso que se apaga en los adultos.',
  s.identification_tips = 'Dedos con flecos de escamas a los lados, como peines
Jóvenes con cola y patas traseras rojo intenso
Cuerpo aplanado, con rayas y ocelos claros en el dorso',
  s.seasonality = 'Primavera a otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Benny_Trapp_Acanthodactylus_erythrurus.jpg?width=1280',
  s.image_attribution = 'Benny Trapp (CC BY 3.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Acanthodactylus erythrurus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Lagarto ocelado',
  s.primary_habitat = 'Matorral termomediterráneo semiárido',
  s.description = 'El lagarto más grande de Europa, de hasta 60 cm con la cola incluida. Su dorso es verde con un fino reticulado negro y, en los costados, hileras de ocelos de un azul intenso. Los machos viejos tienen una cabeza enorme y maciza. Es diurno y muy desconfiado.',
  s.identification_tips = 'Ocelos azules alineados en los costados
Dorso verde con retícula negra muy fina
Tamaño grande y cabeza maciza en los machos adultos',
  s.seasonality = 'Primavera a otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Jewelled_Lizard_(Timon_lepidus)_male_found_under_a_stone_by_Jean_NICOLAS_(14166347788).jpg?width=1280',
  s.image_attribution = 'Bernard DUPONT from FRANCE (CC BY-SA 2.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Timon lepidus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Lastón',
  s.primary_habitat = 'Pastizales, claros de matorral y ribazos sobre suelos calizos',
  s.description = 'Gramínea perenne y rizomatosa que forma céspedes extensos en los claros del matorral mediterráneo. Sus hojas son cortas, rígidas y de punta roma. Es de las plantas que más rápido rebrota tras un incendio, gracias a sus rizomas subterráneos.',
  s.identification_tips = 'Céspedes extensos y bajos, no matas aisladas
Hojas cortas y rígidas, de punta redondeada
Espiguillas alineadas a un lado de un eje rígido',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Brachypodium_retusum_espiga_seca.jpg?width=1280',
  s.image_attribution = 'Pere prlpz (CC BY-SA 2.5) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Brachypodium retusum';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Lechetrezna de playa',
  s.primary_habitat = 'Dunas móviles embrionarias',
  s.description = 'Lechetrezna perenne, glauca y de hojas carnosas imbricadas, propia de la primera línea de playa y las dunas embrionarias; exuda un látex blanco irritante.',
  s.identification_tips = 'Hojas carnosas imbricadas
Látex blanco irritante (no manipular)
Porte erecto glauco',
  s.seasonality = 'Primavera a otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Euphorbe_maritime_en_Baie_d''Authie.jpg?width=1280',
  s.image_attribution = 'JackyM59 (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Euphorbia paralias';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Lechuguilla lanosa',
  s.primary_habitat = 'Matorral árido y bordes de rambla',
  s.description = 'Compuesta de aspecto blanquecino por la lana que cubre tallos y hojas, con una roseta basal y capítulos amarillos tipo diente de león. Suelta látex blanco al romperse. Es una planta iberoafricana ligada a los ambientes más áridos.',
  s.identification_tips = 'Lana blanca cubriendo tallos y base de las hojas
Capítulos amarillos tipo diente de león
Látex blanco al partir un tallo',
  s.seasonality = 'Primavera-verano',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/627205605/original.jpg',
  s.image_attribution = 'Olivier Argagnon (CC BY 4.0) · GBIF/iNaturalist',
  s.rarity_score = 4
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Launaea lanifera';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Lentisco',
  s.primary_habitat = 'Matorral mediterráneo litoral',
  s.description = 'Arbusto perennifolio de hojas compuestas sin foliolo terminal y con el raquis alado, un detalle que lo separa de la cornicabra. Al frotarlo huele intensamente a resina. Sus frutos, en racimo, pasan de rojo a negro y son alimento clave para aves en otoño.',
  s.identification_tips = 'Hoja compuesta con número par de foliolos, sin uno terminal
Raquis de la hoja con dos alas laterales
Olor fuerte a resina al frotar las hojas',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Pistacia_lentiscus.jpg?width=1280',
  s.image_attribution = 'Lumbar~commonswiki (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Pistacia lentiscus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Leucanto litoral',
  s.primary_habitat = 'Fisuras y repisas de roquedos calizos, sobre todo en umbrías',
  s.description = 'Margarita rupícola de hojas carnosas y recortadas que crece agarrada a las grietas de la roca. Sus flores son las clásicas cabezuelas de centro amarillo y lígulas blancas. Es un endemismo del sureste ibérico y del norte de África, de área muy pequeña.',
  s.identification_tips = 'Crece en grietas de pared rocosa, no en el suelo
Hojas algo carnosas y recortadas en dientes
Cabezuelas blancas de centro amarillo, solitarias',
  s.seasonality = 'Primavera',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/614232981/original.jpg',
  s.image_attribution = 'faluke (CC BY-NC 4.0) · iNaturalist/GBIF',
  s.rarity_score = 4
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Mauranthemum decipiens';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Loeflingia',
  s.primary_habitat = 'Dunas con céspedes del Malcolmietalia',
  s.description = 'Planta anual diminuta, de apenas unos centímetros, con hojas lineares terminadas en punta y estípulas membranosas. Sus flores son minúsculas y verdosas. Forma parte de los pastizales efímeros que aparecen sobre arenas tras las lluvias.',
  s.identification_tips = 'Planta de pocos centímetros, pegada al suelo
Hojas lineares con estípulas blancas y membranosas
Flores verdosas minúsculas, casi sin pétalos',
  s.seasonality = 'Primavera',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/622499178/original.jpg',
  s.image_attribution = 'Augustin Soulard (CC BY 4.0) · GBIF',
  s.rarity_score = 3
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Loeflingia hispanica';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Manrubio negro',
  s.primary_habitat = 'Ribazos, taludes y matorral nitrificado en clima seco',
  s.description = 'Mata de la familia de la menta, cubierta por completo de una pelusa blanca y áspera que le da aspecto grisáceo. Las flores, rosadas y agrupadas en verticilos alrededor del tallo, salen de un cáliz en forma de embudo con dientes. Al frotarla desprende un olor fuerte y poco agradable.',
  s.identification_tips = 'Toda la planta cubierta de pelusa blanca y áspera
Flores en anillos alrededor del tallo cuadrado
Olor fuerte y desagradable al frotar las hojas',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Ballota_hirsuta_1_(Espagne).jpg?width=1280',
  s.image_attribution = 'Ghislain118 http://www.fleurs-des-montagnes.net (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Ballota hirsuta';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Maresia',
  s.primary_habitat = 'Dunas con céspedes del Malcolmietalia',
  s.description = 'Diminuto terófito de floración efímera primaveral, diagnóstico de los céspedes anuales sobre arenas dunares del Malcolmietalia; forma la asociación Loeflingio hispanicae-Maresietum nanae.',
  s.identification_tips = 'Planta anual diminuta
Flores lilas o blanquecinas
Solo visible en primavera lluviosa',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Maresia_nana_-_Yanalot_01.jpg?width=1280',
  s.image_attribution = 'Zeynel Cebeci (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Maresia nana';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Margarita de mar',
  s.primary_habitat = 'Playas y dunas fósiles del litoral',
  s.description = 'Mata que forma cojines sobre la roca litoral, con hojas espatuladas, carnosas y ásperas al tacto. Sus capítulos amarillos, casi sentados sobre el follaje, están rodeados de brácteas verdes que sobresalen entre las lígulas. Florece durante casi todo el año.',
  s.identification_tips = 'Cojines densos sobre roca costera
Brácteas verdes asomando entre los pétalos amarillos
Hojas espatuladas, carnosas y ásperas',
  s.seasonality = 'Todo el año, floración prolongada',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Asteriscus_maritimus1.jpg?width=1280',
  s.image_attribution = 'Ximenex (CC BY-SA 2.1 es) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Asteriscus maritimus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Mata del vizque',
  s.primary_habitat = 'Ríos mediterráneos con Glaucium flavum',
  s.description = 'Compuesta blanco-tomentosa de capítulos amarillos, pionera de gravas y arenas de rambla; extendida por toda la Región de Murcia.',
  s.identification_tips = 'Aspecto blanco-lanoso
Capítulos amarillos
Coloniza gravas removidas de cauce',
  s.seasonality = 'Primavera a otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/114Andryala_ragusina.JPG?width=1280',
  s.image_attribution = 'Ziegler175 Rose Ziegler (CC0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Andryala ragusina';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Mata pulguera',
  s.primary_habitat = 'Roquedos, muros, taludes y grietas soleadas',
  s.description = 'Mata pequeña y leñosa en la base que crece agarrada a la roca y a los muros. Sus hojas son estrechas y blanquecinas por el envés. Las cabezuelas, solitarias sobre tallos largos y desnudos, están rodeadas de brácteas secas y pardas que persisten mucho tiempo.',
  s.identification_tips = 'Cabezuelas pardas y secas al final de tallos largos y pelados
Hojas estrechas, verdes arriba y blancas por debajo
Casi siempre sobre roca, muro o talud',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Phagnalon_saxatile.JPG?width=1280',
  s.image_attribution = 'Xemenendura (CC BY 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Phagnalon saxatile';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Melica menor',
  s.primary_habitat = 'Grietas de roquedos calizos, cornisas y pies de cantil sombreados',
  s.description = 'Gramínea perenne y grácil que crece en repisas y fisuras de roca, formando matas laxas de hojas finas. Su inflorescencia es una panícula abierta y ligera, con espiguillas nacaradas que brillan a contraluz. Es una de las pocas gramíneas que prospera en pared vertical.',
  s.identification_tips = 'Panícula muy laxa, casi transparente al trasluz
Espiguillas brillantes y algo nacaradas
Crece en grietas de roca, colgando de la pared',
  s.seasonality = 'Primavera',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/626575126/original.jpg',
  s.image_attribution = 'Piermario Maculan (CC0) · GBIF',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Melica minuta';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Mochuelo europeo',
  s.primary_habitat = 'Matorral litoral y zonas abiertas con posaderos',
  s.description = 'Búho pequeño y rechoncho, de cabeza plana y ojos amarillos con un ceño que le da expresión severa. Es el más diurno de nuestros búhos: se ve posado en postes y ruinas a plena luz. Vuela con un ondulado marcado, a golpes de aleteo y planeo.',
  s.identification_tips = 'Cabeza plana y ancha, sin penachos
Cejas blancas marcadas que le dan aspecto ceñudo
Vuelo ondulado, a rachas de aleteo y planeo',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Mochuelo_Com%C3%BAn_(_Athene_noctua_)(1).jpg?width=1280',
  s.image_attribution = 'Arturo Nikolai from Galicia, Spain (CC BY-SA 2.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Athene noctua';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Olivarda',
  s.primary_habitat = 'Cunetas, taludes, ramblas y suelos removidos',
  s.description = 'Mata pegajosa y de olor penetrante que florece cuando casi todo lo demás está seco, cubriéndose de cabezuelas amarillas a finales de verano. Esa floración tardía la convierte en un refugio clave para insectos. Sus hojas dejan las manos resinosas al tocarlas.',
  s.identification_tips = 'Hojas pegajosas y aromáticas al tacto
Florece amarillo en pleno final de verano y otoño
Abundante en cunetas y terrenos alterados',
  s.seasonality = 'Verano y otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Inula_viscosa_flowers.jpg?width=1280',
  s.image_attribution = 'No machine-readable author provided. Rickjpelleg assumed (based on … (CC BY 2.5) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Dittrichia viscosa';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Orejilla de roca',
  s.primary_habitat = 'Roquedos y fisuras calcáreas costeras',
  s.description = 'Planta rupícola de hojas redondeadas, dentadas y algo carnosas, que forma matas colgantes en las paredes calizas. Sus flores, blanquecinas con toques amarillos, se agrupan en racimos erguidos. Es un endemismo iberoafricano restringido al sureste peninsular y al norte de África.',
  s.identification_tips = 'Hojas redondas y dentadas, casi como monedas
Racimos de flores blanquecinas erguidos sobre el follaje
Forma matas colgantes en pared caliza',
  s.seasonality = 'Floración primaveral',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Lafuentea_rotundifolia80857.jpg?width=1280',
  s.image_attribution = 'Nanosanchez (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Lafuentea rotundifolia';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Orgaza',
  s.primary_habitat = 'Suelos salinos y nitrificados, ramblas y bordes de saladar',
  s.description = 'Arbusto de color gris plateado, cubierto de escamas microscópicas que reflejan la luz y ayudan a expulsar sal. Sus hojas son de forma romboidal y algo carnosas. Aguanta suelos que casi ninguna otra planta tolera, por lo que se usa para restaurar terrenos degradados.',
  s.identification_tips = 'Follaje gris plateado, harinoso al tacto
Hojas con forma de rombo o de punta de flecha
Frutos rodeados de dos valvas membranosas',
  s.seasonality = 'Verano y otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Atriplex_halimus_kz1.JPG?width=1280',
  s.image_attribution = 'Krzysztof Ziarnek, Kenraiz (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Atriplex halimus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Oroval',
  s.primary_habitat = 'Matorral cálido, roquedos y ramblas de clima muy seco',
  s.description = 'Arbusto de la familia del tomate y la belladona, con hojas ovaladas algo carnosas y flores verdosas discretas. Los frutos son bayas rojas y brillantes envueltas en el cáliz. Es una especie de raíz norteafricana que en la península solo vive en los rincones más cálidos del sureste.',
  s.identification_tips = 'Bayas rojas pequeñas asomando del cáliz
Hojas ovales, algo carnosas y de verde apagado
Flores verde amarillentas, poco vistosas',
  s.seasonality = 'Primavera y otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Withania_frutescens0176.jpg?width=1280',
  s.image_attribution = 'Nanosanchez (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Withania frutescens';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Orzaga marina',
  s.primary_habitat = 'Saladares y marismas, en la franja que la marea o la escorrentía encharca',
  s.description = 'Mata tendida de hojas opuestas, carnosas y de un gris azulado inconfundible, que forma alfombras en el borde de los saladares. Marca con bastante precisión la zona que se encharca con agua salada. Sus flores son diminutas y de color pardo dorado.',
  s.identification_tips = 'Hojas opuestas, carnosas y de gris azulado
Porte tendido, formando manchas continuas
Siempre en el borde encharcable del saladar',
  s.seasonality = 'Verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Sea_Purslane.jpg?width=1280',
  s.image_attribution = 'autor no indicado (Public domain) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Halimione portulacoides';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Ostrero euroasiático',
  s.primary_habitat = 'Playas y costa rocosa (invernante)',
  s.description = 'Limícola grande, blanco y negro, con un pico rojo largo y aplanado que usa como cuña para abrir mejillones y berberechos. Sus patas son rosadas y su reclamo, un silbido agudo y penetrante que delata su presencia antes de verlo.',
  s.identification_tips = 'Pico rojo largo, recto y aplanado lateralmente
Contraste tajante entre el negro y el blanco
Silbido agudo y repetido, muy sonoro',
  s.seasonality = 'Otoño e invierno',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Haematopus_ostralegus_Norway.jpg?width=1280',
  s.image_attribution = 'Bjørn Christian Tørrissen (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Haematopus ostralegus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Palmito',
  s.primary_habitat = 'Matorral cálido, laderas soleadas y acantilados del piso termomediterráneo',
  s.description = 'La única palmera silvestre de Europa continental. Suele crecer en mata, con varios troncos cortos, aunque con los años puede levantar un tronco único. Sus hojas son abanicos rígidos con pecíolos muy espinosos. Del cogollo se sacaba el «palmito», y de las hojas, cordelería y escobas.',
  s.identification_tips = 'Hojas en abanico, rígidas y divididas en segmentos
Pecíolos con espinas fuertes en los bordes
Porte en mata, con varios troncos desde la base',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Chamaerops_humilis_Torreblanca.jpg?width=1280',
  s.image_attribution = 'Canaan (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Chamaerops humilis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Papamoscas gris',
  s.primary_habitat = 'Arbolado abierto, bordes de bosque, huertos y jardines con perchas altas',
  s.description = 'Pájaro discreto de color pardo grisáceo, sin marcas llamativas, que se reconoce mejor por su conducta que por su aspecto: se posa muy erguido en una rama descubierta, sale disparado a cazar un insecto en el aire y vuelve exactamente a la misma percha. Repite la maniobra decenas de veces.',
  s.identification_tips = 'Vuelve siempre a la misma rama tras cada vuelo de caza
Postura muy vertical, con las alas caídas
Frente y pecho con un rayado fino y difuso',
  s.seasonality = 'Primavera y verano (estival)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/SpottedFlycatcheronfence.jpg?width=1280',
  s.image_attribution = 'Andrew Easton (Attribution) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Muscicapa striata';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Perdiz roja',
  s.primary_habitat = 'Mosaicos de cultivo, matorral bajo y laderas pedregosas',
  s.description = 'Perdiz de patas y pico rojos, con un collar negro que se deshace en un salpicado de motas sobre el pecho y flancos barrados en blanco, negro y castaño. Prefiere correr a volar, y cuando por fin levanta lo hace de golpe y a ras de suelo, planeando ladera abajo.',
  s.identification_tips = 'Flancos con barras nítidas blancas, negras y castañas
Collar negro que se disgrega en motas sobre el pecho
Corre agachada antes que volar; levanta de golpe y planea',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Perdiz_roja.jpg?width=1280',
  s.image_attribution = 'Juan Lacruz (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Alectoris rufa';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Pino carrasco',
  s.primary_habitat = 'Laderas secas y soleadas sobre calizas y margas, en clima mediterráneo cálido',
  s.description = 'Pino de copa clara e irregular y follaje de un verde pálido, el más resistente a la sequía y a los suelos pobres de los pinos ibéricos. Sus piñas, alargadas y asimétricas, quedan colgadas años en la rama y liberan las semillas tras los incendios, lo que le permite recolonizar rápido.',
  s.identification_tips = 'Copa irregular y poco densa, de verde claro
Piñas asimétricas y persistentes, apuntando hacia atrás
Corteza clara y agrietada, rojiza en las ramas jóvenes',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Pino_secolare_-_Castelleone_di_Suasa.JPG?width=1280',
  s.image_attribution = 'Accurimbono (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Pinus halepensis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Rabogato',
  s.primary_habitat = 'Tomillares y matorral raso sobre margas y suelos yesosos',
  s.description = 'Rabogato endémico del sureste ibérico, de tallos blanquecinos y lanudos y flores amarillentas dispuestas en verticilos a lo largo de la espiga. Bajo cada grupo de flores hay brácteas anchas y punzantes que persisten secas mucho tiempo.',
  s.identification_tips = 'Tallos y hojas cubiertos de pelusa blanca
Flores amarillentas en anillos separados a lo largo del tallo
Brácteas anchas y punzantes bajo cada verticilo',
  s.seasonality = 'Primavera-verano',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/616107243/original.jpg',
  s.image_attribution = 'Ben Jobson (CC BY 4.0) · GBIF',
  s.rarity_score = 3
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Sideritis ibanyezii';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Romerina',
  s.primary_habitat = 'Tomillares y matorral seco sobre calizas y margas',
  s.description = 'Jara pequeña de hojas muy estrechas y enrolladas por los bordes, verdes arriba y blancas por debajo, que a distancia recuerdan al romero. Se distingue enseguida al florecer: da grupos de flores blancas de cinco pétalos, mucho mayores que las del romero.',
  s.identification_tips = 'Hojas estrechas enrolladas, blancas por el envés
Flores blancas de cinco pétalos, varias juntas
Sin el olor a romero, aunque se le parezca de lejos',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Cistus_clusii_(habitus).jpg?width=1280',
  s.image_attribution = 'Hans Hillewaert (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Cistus clusii';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Romero',
  s.primary_habitat = 'Matorral seco y soleado sobre suelos calizos y pedregosos',
  s.description = 'Arbusto aromático de hojas estrechas como agujas, verde oscuro por el haz y blanquecinas por el envés, con los bordes enrollados hacia abajo. Florece casi todo el año en azul pálido, y en pleno invierno es una de las pocas fuentes de néctar del matorral.',
  s.identification_tips = 'Hojas como agujas, blancas por debajo
Olor inconfundible al frotar entre los dedos
Flores azul claro repartidas por las ramas casi todo el año',
  s.seasonality = 'Todo el año, con máximo de floración en invierno y primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Rosemary_in_bloom.JPG?width=1280',
  s.image_attribution = 'Margalob (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Rosmarinus officinalis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Rugueta de mar',
  s.primary_habitat = 'Arena suelta de la primera línea de playa, sobre restos orgánicos del mar',
  s.description = 'Crucífera anual y carnosa que coloniza la arena batida donde el mar deposita algas. Sus hojas son gruesas y recortadas y sus flores, lilas o blancas, tienen los cuatro pétalos en cruz de la familia. El fruto se parte en dos: una mitad queda en la planta y la otra flota y viaja por mar.',
  s.identification_tips = 'Hojas carnosas y recortadas, algo azuladas
Flores lilas o blancas de cuatro pétalos en cruz
Frutos duros en dos piezas, como pequeños barrilitos',
  s.seasonality = 'Primavera a otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Cakile-maritima-(eurMeersenf)_1.jpg?width=1280',
  s.image_attribution = 'Jürgen Howaldt (CC BY-SA 2.0 de) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Cakile maritima';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Sabina negral',
  s.primary_habitat = 'Roquedos, arenales, acantilados y crestas ventosas sobre suelos pobres',
  s.description = 'Sabina de hojas diminutas en forma de escama, pegadas a la ramilla, que dan a las ramas un aspecto de cordón redondeado. Aguanta viento, sequía y salinidad como pocas plantas leñosas. Sus gálbulos —los falsos frutos— maduran de verde a un rojo pardusco en dos años.',
  s.identification_tips = 'Hojas en escama pegadas a la rama, no punzantes
Ramillas cilíndricas, como cordones
Gálbulos redondos que pasan de verde a pardo rojizo',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Juniperus_phoenicea1.jpg?width=1280',
  s.image_attribution = 'autor no indicado (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Juniperus phoenicea';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Sapo corredor',
  s.primary_habitat = 'Ramblas y zonas húmedas estacionales',
  s.description = 'Sapo de patas cortas que corre en vez de saltar, con una línea amarilla nítida a lo largo del centro del lomo. Se reproduce en charcas efímeras que se llenan con las lluvias, y los machos forman coros de un canto vibrante y estridente que se oye a kilómetros.',
  s.identification_tips = 'Raya amarilla continua por el centro del lomo
Corre a cuatro patas en vez de saltar
Canto nocturno vibrante y muy sonoro tras las lluvias',
  s.seasonality = 'Otoño e invierno lluviosos',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Epidalea_calamita_02_by-dpc.jpg?width=1280',
  s.image_attribution = 'David Perez (CC BY 3.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Epidalea calamita';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Sedo de hojas gruesas',
  s.primary_habitat = 'Prados calcáreos del Alysso-Sedion albi',
  s.description = 'Crasulácea diminuta de hojas gruesas, casi esféricas y de un gris azulado, dispuestas de dos en dos y cubiertas de pelillos glandulosos que la hacen pegajosa. Forma almohadillas en grietas y muros y da flores blancas con venas rosadas.',
  s.identification_tips = 'Hojas casi esféricas, opuestas y de gris azulado
Tacto pegajoso por los pelillos glandulosos
Flores blancas con finas venas rosadas',
  s.seasonality = 'Verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Sedum_dasyphyllum_(1)_6.jpg?width=1280',
  s.image_attribution = 'Ghislain118 http://www.fleurs-des-montagnes.net (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Sedum dasyphyllum';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Senecio flavus',
  s.primary_habitat = 'Ramblas, arenales y suelos removidos de clima árido',
  s.description = 'Hierba anual de hojas carnosas y algo azuladas, con cabezuelas amarillas cuyas lígulas se enrollan hacia atrás al abrirse. Es una planta de estirpe sahariana que en Europa solo aparece en los rincones más áridos del sureste ibérico, tras las lluvias.',
  s.identification_tips = 'Lígulas amarillas enrolladas hacia atrás
Hojas carnosas y de verde azulado
Aparece en masa tras las lluvias y desaparece pronto',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Senecio_flavus_1.jpg?width=1280',
  s.image_attribution = 'Gideon Pisanty (Gidip) גדעון פיזנטי (CC BY 3.0) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Senecio flavus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Serrátula',
  s.primary_habitat = 'Matorral y pastizales secos',
  s.description = 'Compuesta de tallos erguidos y hojas de borde aserrado con cada diente rematado en una punta rígida. Sus capítulos, purpúreos y sin lígulas, recuerdan a un cardo sin espinas. Es una planta escasa y de distribución fragmentada.',
  s.identification_tips = 'Capítulos purpúreos sin pétalos radiales, como pinceles
Hojas aserradas con la punta de cada diente rígida
Tallos erguidos y poco ramificados',
  s.seasonality = 'Verano y otoño',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/411165247/original.jpeg',
  s.image_attribution = 'Maël Taupin (CC BY-NC 4.0) · iNaturalist/GBIF, obs. Murcia',
  s.rarity_score = 4
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Serratula mucronata';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Siempreviva de Cosson',
  s.primary_habitat = 'Saladares, acantilados costeros y suelos salinos margosos',
  s.description = 'Siempreviva de roseta basal de hojas espatuladas y tallos ramificados que sostienen espiguillas de flores diminutas de color lila. Los cálices secos y papiráceos permanecen en la planta hasta el invierno siguiente, dando al saladar un tono pajizo persistente.',
  s.identification_tips = 'Roseta basal de hojas anchas y espatuladas
Ramificación en zigzag, muy abierta
Cálices secos que persisten meses tras florecer',
  s.seasonality = 'Verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Limonium_cossonianum.jpg?width=1280',
  s.image_attribution = 'Nanosanchez (CC0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Limonium cossonianum';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Siempreviva de saladar',
  s.primary_habitat = 'Saladares, estepas salinas y suelos margosos con sal',
  s.description = 'Siempreviva de saladar con una roseta basal de hojas en la base y tallos muy ramificados que sostienen espiguillas de flores diminutas. Los pétalos son lilas o blanquecinos y el cáliz, seco y papiráceo, aguanta meses en la planta: de ahí el nombre de «siempreviva».',
  s.identification_tips = 'Roseta de hojas en la base y tallos ramificados desnudos
Flores diminutas en espiguillas de un solo lado
El cáliz seco persiste mucho después de la floración',
  s.seasonality = 'Verano',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/476031749/original.jpeg',
  s.image_attribution = 'Christoph Moning (CC BY 4.0) · GBIF',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Limonium delicatulum';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Siempreviva insigne',
  s.primary_habitat = 'Suelos margosos y yesosos salinos, en estepas y taludes áridos',
  s.description = 'Una de las siemprevivas más vistosas: sus inflorescencias forman un ramillete denso de un lila rosado intenso que destaca sobre el gris de las margas. Es un endemismo del sureste ibérico, ligado a suelos salinos y yesosos, y muy usado en seco como flor ornamental.',
  s.identification_tips = 'Floración densa y de lila rosado vivo, muy llamativa
Hojas en roseta basal, gruesas y de borde ondulado
Sobre margas y yesos claros, en terreno casi desnudo',
  s.seasonality = 'Final de primavera y verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Limonium_insigne.jpg?width=1280',
  s.image_attribution = 'ANE (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Limonium insigne';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Sisallo',
  s.primary_habitat = 'Suelos salinos y nitrificados, ramblas, majadas y bordes de camino',
  s.description = 'Mata muy ramificada de hojas cortas, gruesas y algo peludas que en verano se vuelven grisáceas. Es de las mejores indicadoras de suelos con sal y con exceso de nitrógeno, como los antiguos apriscos de ganado. Al fructificar, cada semilla se rodea de alas membranosas.',
  s.identification_tips = 'Hojitas cortas, gruesas y con pelusa
Frutos con alas membranosas rosadas o pajizas
Aparece donde ha habido ganado o remoción del suelo',
  s.seasonality = 'Verano y otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Salsola_vermiculata.jpg?width=1280',
  s.image_attribution = 'autor no indicado (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Salsola vermiculata';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Sosa alacranera',
  s.primary_habitat = 'Saladares y marismas con encharcamiento salino prolongado',
  s.description = 'Planta sin hojas aparentes: sus tallos son cilíndricos, carnosos y divididos en segmentos que parecen articulaciones. Vive donde la sal se acumula y en otoño se tiñe de tonos rojizos y anaranjados que cambian el color de todo el saladar.',
  s.identification_tips = 'Tallos carnosos articulados, como collares de cuentas
Sin hojas visibles
Vira a rojo y naranja en otoño',
  s.seasonality = 'Verano y otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Arthrocnemum_macrostachyum_2LaMata.jpg?width=1280',
  s.image_attribution = 'Javier martin (Public domain) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Arthrocnemum macrostachyum';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Sosa fina',
  s.primary_habitat = 'Bordes de saladar y suelos salinos algo más secos y elevados',
  s.description = 'Mata leñosa de hojas carnosas, cilíndricas y de un verde azulado, que ocupa la orla algo más alta y seca del saladar. Se diferencia de sus vecinas en que sí tiene hojas bien visibles y no tallos articulados. Sus flores son minúsculas y verdosas, en las axilas de las hojas.',
  s.identification_tips = 'Hojas carnosas y cilíndricas, verde azuladas
Base leñosa y ramificada, no herbácea
En la parte más seca y alta del saladar',
  s.seasonality = 'Verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Suaeda_vera.JPG?width=1280',
  s.image_attribution = 'Xemenendura (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Suaeda vera';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Sosa jabonera',
  s.primary_habitat = 'Saladares con encharcamiento salino frecuente',
  s.description = 'Planta de tallos suculentos y articulados, de base leñosa y porte erguido, que forma matas densas en el saladar. Como su parienta la sosa alacranera, es difícil de separar a simple vista: la clave está en el porte y en la longitud de los segmentos. En otoño toma tonos rojizos.',
  s.identification_tips = 'Tallos verdes articulados, erguidos y ramificados
Base leñosa, no herbácea
Cambia a tonos rojizos al final del verano',
  s.seasonality = 'Verano y otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Sarcocornia_fruticosa.jpg?width=1280',
  s.image_attribution = 'Hans Hillewaert (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Sarcocornia fruticosa';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Tarabilla europea',
  s.primary_habitat = 'Matorral bajo, herbazales, ribazos y bordes de cultivo con posaderos',
  s.description = 'Pájaro pequeño y regordete que se posa en lo alto de las matas, muy erguido y a la vista, para lanzarse al suelo a por insectos. El macho tiene la cabeza negra, un collar blanco a los lados y el pecho naranja. Su reclamo suena como dos piedras golpeadas, de donde le viene el nombre.',
  s.identification_tips = 'Siempre en lo alto de una mata, bien visible
Macho con capucha negra y medio collar blanco
Reclamo como el chasquido de dos cantos rodados',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Malestonechatseaham_Cropped.jpg?width=1280',
  s.image_attribution = 'derivative work: Myosotis Scorpioides (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Saxicola rubicola';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Taray',
  s.primary_habitat = 'Saladar junto a la playa del Sombrerico',
  s.description = 'Arbusto o arbolillo que forma los bosquetes de taray de mayor biomasa de la zona, como el rodal junto a la playa del Sombrerico.',
  s.identification_tips = 'Ramas finas y flexibles
Flores rosadas en espigas
Forma bosquetes junto a saladares',
  s.seasonality = 'Primavera-verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Tamarix_africana.jpg?width=1280',
  s.image_attribution = 'autor no indicado (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Tamarix africana';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Tejón',
  s.primary_habitat = 'Bosque, matorral y ribazos con suelo blando para excavar tejoneras',
  s.description = 'Mustélido corpulento y de patas cortas, con la cabeza blanca cruzada por dos bandas negras que pasan por los ojos. Excava madrigueras complejas —las tejoneras— que una misma familia amplía y usa durante generaciones. Es omnívoro y muy aficionado a las lombrices.',
  s.identification_tips = 'Cabeza blanca con dos franjas negras longitudinales
Tejoneras: varias bocas grandes con montones de tierra
Letrinas en hoyos poco profundos cerca de la madriguera',
  s.seasonality = 'Todo el año (actividad nocturna)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Badger-badger.jpg?width=1280',
  s.image_attribution = 'BadgerHero (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Meles meles';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Terrera común',
  s.primary_habitat = 'Llanos de cultivo, eriales y pastizales rasos con suelo desnudo',
  s.description = 'Alondra pequeña y pálida de aspecto muy limpio, con el pecho sin apenas rayado salvo una mancha oscura a cada lado del cuello. Anida en el suelo, en cultivos y baldíos. En migración se agrupa en bandos que se levantan del suelo todos a la vez.',
  s.identification_tips = 'Mancha oscura a cada lado del cuello, como un botón
Pecho limpio, sin rayado extenso
Ceja clara y pico corto y grueso de granívora',
  s.seasonality = 'Primavera y verano (estival)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Alondra.jpg?width=1280',
  s.image_attribution = 'Juan Lacruz (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Calandrella brachydactyla';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Terrera marismeña',
  s.primary_habitat = 'Saladares, estepas salinas, eriales y llanos áridos con vegetación rala',
  s.description = 'La alondra más pequeña de Europa, de plumaje pardo grisáceo y con el pecho finamente rayado de arriba abajo, sin las manchas laterales de su parienta. Vive ligada a los llanos más áridos y salinos, un hábitat en retroceso, y se camufla tan bien que suele verse solo al levantar el vuelo.',
  s.identification_tips = 'Rayado fino y extendido por todo el pecho
Muy pequeña y compacta, de aspecto grisáceo
Prefiere los llanos salinos y las estepas más áridas',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Calandrella_rufescens_Canarias.jpg?width=1280',
  s.image_attribution = 'Calandrella_rufescens_-Canary_Islands_-Spain-8.jpg: Tony Hisgett de… (CC BY 2.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Alaudala rufescens';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Teucrio de Freyn',
  s.primary_habitat = 'Roquedos, pedregales y ramblas sobre suelos calizos secos',
  s.description = 'Teucrio endémico del sureste ibérico, de porte bajo y aspecto blanquecino, con hojas pequeñas y enrolladas y flores rosadas o blanquecinas sin labio superior. Como todas las labiadas, tiene el tallo de sección cuadrada y desprende aroma al frotarlo.',
  s.identification_tips = 'Flores sin labio superior, con los estambres asomando
Tallo de sección cuadrada, típico de labiada
Hojas pequeñas y enrolladas, de aspecto grisáceo',
  s.seasonality = 'Primavera-verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Teucrium_freynii_kz01.jpg?width=1280',
  s.image_attribution = 'Krzysztof Ziarnek, Kenraiz (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Teucrium freynii';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Tomillo de invierno',
  s.primary_habitat = 'Tomillares y matorral raso sobre suelos calizos y margosos secos',
  s.description = 'Tomillo del sureste ibérico que florece en pleno invierno, cuando casi nada más lo hace, cubriéndose de espigas de flores blancas o rosadas. Ese calendario lo convierte en un recurso decisivo para los insectos en la estación fría y en una planta melífera muy apreciada.',
  s.identification_tips = 'Florece en invierno, adelantándose al resto del tomillar
Hojas pequeñas con el borde enrollado hacia abajo
Aroma fuerte a tomillo al frotar entre los dedos',
  s.seasonality = 'Todo el año, con floración de invierno a primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Thymus_hyemalis_re.jpg?width=1280',
  s.image_attribution = 'Retama (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Thymus hyemalis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Torcecuello euroasiático',
  s.primary_habitat = 'Bosques abiertos, sotos, huertos y arboledas con madera muerta',
  s.description = 'Pariente de los pájaros carpinteros que ni pica la madera ni trepa por los troncos: se posa de través en las ramas y come hormigas del suelo con una lengua larguísima. Su plumaje jaspeado en grises y pardos imita la corteza. Si se le molesta en el nido, retuerce el cuello como una culebra, de ahí su nombre.',
  s.identification_tips = 'Plumaje veteado como corteza, difícil de ver quieto
Se posa a lo largo de la rama, no agarrado al tronco
Franja oscura desde la nuca hasta la mitad de la espalda',
  s.seasonality = 'Paso migratorio e invernada',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Jinxtorquilla.jpg?width=1280',
  s.image_attribution = 'User:Aelwyn (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Jynx torquilla';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Tórtola europea',
  s.primary_habitat = 'Sotos, arboledas y matorral alto junto a cultivos y ramblas',
  s.description = 'La más pequeña y grácil de nuestras palomas, con el dorso escamado en negro y canela y un parche a rayas blancas y negras en el cuello. Su arrullo ronco y adormecedor es uno de los sonidos del verano. Sus poblaciones han caído mucho en Europa por la pérdida de barbechos y setos.',
  s.identification_tips = 'Espalda escamada, como un mosaico canela y negro
Parche rayado blanco y negro a los lados del cuello
Arrullo ronco y vibrante, muy distinto al de la tórtola turca',
  s.seasonality = 'Primavera y verano (estival)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Streptopelia_turtur_Grlica0036.jpg?width=1280',
  s.image_attribution = 'Zrno at Serbian Wikipedia (Public domain) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Streptopelia turtur';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Treparriscos',
  s.primary_habitat = 'Paredes rocosas, cantiles y barrancos; en invierno baja a roquedos y edificios',
  s.description = 'Pájaro de alta montaña que trepa por paredes verticales agitando las alas como una mariposa gigante, mostrando unos vistosos paneles rojos. Extrae insectos de las grietas con un pico largo y fino. En invierno desciende y puede aparecer en cortados bajos, castillos y presas.',
  s.identification_tips = 'Manchas rojo carmín en las alas al abrirlas
Trepa por la roca a saltos, aleteando sin parar
Pico largo, fino y algo curvado',
  s.seasonality = 'Otoño e invierno fuera de la alta montaña',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Tichodroma_muraria02_cropped.jpg?width=1280',
  s.image_attribution = 'derivative work: Hämbörger (talk) Tichodroma_muraria02.jpg: User:Kulac (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Tichodroma muraria';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Uña de gato',
  s.primary_habitat = 'Prados calcáreos del Alysso-Sedion albi',
  s.description = 'Crasulácea perenne de hojas suculentas puntiagudas y flores amarillo-verdosas, muy extendida por Murcia en repisas rocosas y prados calcáreos; especie característica del hábitat prioritario.',
  s.identification_tips = 'Hojas carnosas puntiagudas
Inflorescencia amarillo pálido
Coloniza repisas y suelos esqueléticos',
  s.seasonality = 'Verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Sedum_sediforme_hojas.jpg?width=1280',
  s.image_attribution = 'autor no indicado (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Sedum sediforme';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Uña de gato blanca',
  s.primary_habitat = 'Prados calcáreos del Alysso-Sedion albi',
  s.description = 'Crasulácea de hojas cilíndricas globosas y flores blancas estrelladas, componente típico de los prados pioneros del Alysso-Sedion albi sobre caliza; se enrojece al sol.',
  s.identification_tips = 'Flores blancas estrelladas
Hojas pequeñas y globosas
Se enrojece con la insolación',
  s.seasonality = 'Verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Sedum_album.jpg?width=1280',
  s.image_attribution = 'Franz Xaver (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Sedum album';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Vuelvepiedras',
  s.primary_habitat = 'Playas y costa rocosa (invernante)',
  s.description = 'Limícola robusta de patas naranjas y pico corto y algo respingón, que se gana la vida volteando piedras, conchas y algas para capturar lo que hay debajo. En vuelo muestra un llamativo diseño blanco y negro en alas y espalda.',
  s.identification_tips = 'Voltea piedras y algas con el pico corto y cuneiforme
Patas de color naranja vivo
Diseño blanco y negro muy contrastado en vuelo',
  s.seasonality = 'Otoño e invierno',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Arenaria_interpres_(habitus).jpg?width=1280',
  s.image_attribution = 'Hans Hillewaert (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Arenaria interpres';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Zamarrilla',
  s.primary_habitat = 'Tomillares y matorral raso sobre suelo calizo pedregoso',
  s.description = 'Mata pequeña y grisácea, de hojas estrechas con el borde enrollado, que remata sus tallos en cabezuelas apretadas de flores blancas o crema. Es una de las plantas más constantes del tomillar y una fuente de néctar importante en pleno verano.',
  s.identification_tips = 'Cabezuelas redondas y compactas al final del tallo
Aspecto general blanquecino o grisáceo
Flores sin labio superior, típicas del género',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Teucrium_capitatum2006.jpg?width=1280',
  s.image_attribution = 'No machine-readable author provided. Víctor M. Vicente Selvas~commo… (Public domain) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Teucrium capitatum';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Zampullín común',
  s.primary_habitat = 'Charcas, embalses, ramblas remansadas y canales con vegetación',
  s.description = 'El más pequeño de los somormujos, rechoncho y sin cola aparente, que pasa más tiempo bajo el agua que sobre ella. En primavera luce las mejillas y el cuello de color castaño y una mancha amarilla en la comisura del pico. Su reclamo es un relincho agudo y vibrante muy característico.',
  s.identification_tips = 'Silueta redonda, sin cola visible, como un corcho
Se sumerge sin salpicar y reaparece lejos
Relincho agudo y tembloroso desde la vegetación',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Zwergtaucher_060319_3.jpg?width=1280',
  s.image_attribution = 'autor no indicado (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Tachybaptus ruficollis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Zapatito de la Virgen',
  s.primary_habitat = 'Extraplomos y roquedos calcáreos',
  s.description = 'Pequeña planta rupícola de extraplomos y oquedades de roquedos calcáreos, integrante de la asociación Resedo paui-Sarcocapnetum saetabensis del hábitat 8210.',
  s.identification_tips = 'Cuelga de extraplomos y techos rocosos
Flores blanco-rosadas con espolón
Hojas divididas glaucas',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Orella_de_ratol%C3%AD_(Sarcocapnos_saetabensis)_al_castell_de_X%C3%A0tiva.jpg?width=1280',
  s.image_attribution = 'Joanbanjo (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Sarcocapnos enneaphylla subsp. saetabensis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Zaragatona blanca',
  s.primary_habitat = 'Pastizales secos, ribazos y claros de matorral sobre suelos margosos',
  s.description = 'Llantén de aspecto plateado, cubierto de pelos sedosos, con hojas estrechas que salen todas de la base. Levanta espigas cilíndricas y densas en las que las flores se abren de abajo arriba, dejando ver unos estambres largos y colgantes. Resiste bien el pisoteo y la sequía.',
  s.identification_tips = 'Hojas estrechas y plateadas, todas desde la base
Espigas cilíndricas apretadas sobre tallos largos
Estambres largos y colgantes durante la floración',
  s.seasonality = 'Primavera',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/633859652/original.jpg',
  s.image_attribution = 'Pavel Kúr (CC0) · GBIF',
  s.rarity_score = 1
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Plantago albicans';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Zorro',
  s.primary_habitat = 'Prácticamente cualquier ambiente: bosque, matorral, cultivos y periferias urbanas',
  s.description = 'El carnívoro silvestre más adaptable y extendido: vive desde la alta montaña hasta el borde de las ciudades. Es omnívoro y oportunista, lo que explica su éxito. Se reconoce por la cola larga y espesa —la «hopa»— rematada casi siempre en blanco.',
  s.identification_tips = 'Cola muy espesa con la punta blanca
Huella alargada con las cuatro almohadillas alineadas
Excrementos retorcidos y con pelos, sobre piedras y caminos',
  s.seasonality = 'Todo el año (actividad sobre todo nocturna)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Vulpes_vulpes_2.jpg?width=1280',
  s.image_attribution = 'Juan Lacruz (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Vulpes vulpes';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Sosa jabonera',
  s.primary_habitat = 'Saladares muy salinos con encharcamiento estacional',
  s.description = 'Mata de tallos articulados y suculentos, con las ramas jóvenes agrupadas en apretados manojos que recuerdan a piñas diminutas, de donde le viene el nombre. Vive en los suelos más salinos del saladar, donde apenas compite con otras plantas.',
  s.identification_tips = 'Ramillas agrupadas en manojos con aspecto de piña
Tallos gruesos y articulados de color verde grisáceo
En las zonas más saladas y desnudas del saladar',
  s.seasonality = 'Verano y otoño',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/611359925/original.jpg',
  s.image_attribution = 'Xavier Rufray (CC BY-NC 4.0) · iNaturalist/GBIF · obs. EAU (revisar: existe en salinas de España)',
  s.rarity_score = 4
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Halocnemum strobilaceum';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Salado',
  s.primary_habitat = 'Matorrales halófilos mediterráneos y termoatlánticos',
  s.description = 'Arbusto de saladar de hojas glaucas cubiertas de sales y flores rosadas; ocupa el borde interno de saladares y ramblas salinas del litoral.',
  s.identification_tips = 'Flores rosadas en espiga
Hojas con costra de sal
Marca el límite del saladar',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Limoniastrum_monopetalum_2.JPG?width=1280',
  s.image_attribution = 'Xemenendura (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Limoniastrum monopetalum';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Grama de mar',
  s.primary_habitat = 'Dunas móviles embrionarias',
  s.description = 'Gramínea rastrera de rizomas punzantes que fija la arena de las primeras dunas, tolerando el enterramiento y la sal marina.',
  s.identification_tips = 'Puntas de hoja punzantes
Fija la arena con rizomas
Pionera de la duna embrionaria',
  s.seasonality = 'Verano',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/609975695/original.jpg',
  s.image_attribution = 'Quentin Groom (CC0) · GBIF',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Sporobolus pungens';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Mielga marina',
  s.primary_habitat = 'Dunas móviles embrionarias',
  s.description = 'Leguminosa lanosa de color blanco-plateado que tapiza la arena de las dunas costeras con flores amarillas y frutos espiralados.',
  s.identification_tips = 'Aspecto blanquecino y lanoso
Flores amarillas en primavera
Fruto en espiral',
  s.seasonality = 'Primavera',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/609975634/original.jpg',
  s.image_attribution = 'Quentin Groom (CC0) · GBIF',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Medicago marina';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Alhelí de mar',
  s.primary_habitat = 'Dunas con céspedes del Malcomietalia',
  s.description = 'Crucífera de flores lilas y hojas grisáceas que crece en los claros arenosos de la duna, dando nombre a la comunidad del Malcolmietalia.',
  s.identification_tips = 'Flores lilas de cuatro pétalos
Céspedes abiertos sobre arena
Da nombre al hábitat (Malcolmietalia)',
  s.seasonality = 'Primavera a otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Malcolmia_littorea_3_(Espagne).jpg?width=1280',
  s.image_attribution = 'Ghislain118 https://www.fleurs-des-montagnes.net (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Malcolmia littorea';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Zanahoria de mar',
  s.primary_habitat = 'Dunas con céspedes del Malcomietalia',
  s.description = 'Pequeña umbelífera anual de las arenas litorales, con umbelas blanco-rosadas y frutos espinosos que se dispersan por la duna.',
  s.identification_tips = 'Umbelas blanco-rosadas
Frutos con espinas
Anual de dunas semifijas',
  s.seasonality = 'Primavera',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/475241861/original.jpeg',
  s.image_attribution = 'Christoph Moning (CC BY 4.0) · GBIF',
  s.rarity_score = 3
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Pseudorlaya pumila';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cutandia marítima',
  s.primary_habitat = 'Dunas con céspedes del Malcomietalia',
  s.description = 'Gramínea anual de arenas costeras, con una panícula rígida y quebradiza cuyas ramas salen casi en ángulo recto. Se agosta pronto y sus fragmentos ruedan por la playa dispersando las semillas.',
  s.identification_tips = 'Panícula rígida con ramas casi en ángulo recto
Se quiebra con facilidad al tocarla
Planta anual sobre arena suelta, de porte bajo',
  s.seasonality = 'Primavera',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/387794514/original.jpg',
  s.image_attribution = 'Tim Johnson (CC BY 4.0) · GBIF',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Cutandia maritima';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Algodonosa',
  s.primary_habitat = 'Dunas móviles embrionarias',
  s.description = 'Mata blanco-lanosa de las dunas costeras (antes Otanthus maritimus), con capítulos amarillos densos y follaje algodonoso que refleja la insolación.',
  s.identification_tips = 'Toda la planta blanco-algodonosa
Capítulos amarillos en verano
Sinónimo: Otanthus maritimus',
  s.seasonality = 'Verano',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/463767986/original.jpeg',
  s.image_attribution = 'Pennyinsole (CC0) · GBIF',
  s.rarity_score = 3
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Achillea maritima';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Aliaga morisca',
  s.primary_habitat = 'Matorrales arborescentes de Ziziphus',
  s.description = 'Retama espinosa de flores amarillas que acompaña a los azufaifares y matorrales termófilos sobre suelos pedregosos.',
  s.identification_tips = 'Ramas verdes muy espinosas
Flores amarillas de leguminosa
Acompaña al azufaifo (Ziziphus)',
  s.seasonality = 'Primavera',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/476714358/original.jpeg',
  s.image_attribution = 'Christoph Moning (CC BY 4.0) · GBIF',
  s.rarity_score = 3
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Calicotome intermedia';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Escobilla',
  s.primary_habitat = 'Matorrales halo-nitrófilos',
  s.description = 'Mata en forma de escoba, con ramas verdes, largas y erguidas, casi sin hojas, que florece a final de verano. Sus frutos van rodeados de alas membranosas rosadas que la vuelven muy vistosa en otoño. Es un endemismo del sureste ibérico.',
  s.identification_tips = 'Porte en escoba, con ramas verdes largas y erectas
Hojas reducidas casi a escamas
Frutos con alas membranosas rosadas en otoño',
  s.seasonality = 'Verano y otoño',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/474144349/original.jpeg',
  s.image_attribution = 'Gabriel Dixon (CC0) · GBIF',
  s.rarity_score = 3
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Salsola genistoides';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Boja negra',
  s.primary_habitat = 'Matorrales halo-nitrófilos',
  s.description = 'Mata aromática grisácea de las bojas del sureste árido, colonizadora de suelos alterados, bordes de camino y matorrales nitrificados.',
  s.identification_tips = 'Olor aromático fuerte al frotar
Follaje gris-plateado
Indica suelos alterados',
  s.seasonality = 'Otoño',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/173279674/original.jpeg',
  s.image_attribution = 'Yamil J.R (CC0) · GBIF',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Artemisia barrelieri';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Orgaza',
  s.primary_habitat = 'Matorrales halo-nitrófilos',
  s.description = 'Mata baja y extendida, de hojas pequeñas, grisáceas y cubiertas de escamas harinosas que reflejan la luz. Marca los suelos con sal y exceso de nitrógeno, como los antiguos apriscos. Sus frutos van encerrados entre dos valvas endurecidas.',
  s.identification_tips = 'Hojas pequeñas, grises y harinosas al tacto
Porte bajo y muy extendido, casi tendido
Frutos entre dos valvas duras y dentadas',
  s.seasonality = 'Verano',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/611378691/original.jpg',
  s.image_attribution = 'Michael Bakker Paiva (CC BY 4.0) · GBIF',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Atriplex glauca';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Sosa articulada',
  s.primary_habitat = 'Matorrales halo-nitrófilos',
  s.description = 'Mata de tallos articulados y suculentos, sin hojas visibles, con los segmentos separados por nudos bien marcados. Vive en los suelos más áridos y salinos, donde tiene poca competencia. Es una planta de raíz sahariana muy escasa en Europa.',
  s.identification_tips = 'Tallos articulados con nudos muy marcados
Sin hojas visibles, solo escamas en cada nudo
Porte bajo y ramificado, de color verde grisáceo',
  s.seasonality = 'Verano y otoño',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/539160949/original.jpg',
  s.image_attribution = 'yusuf_c (CC BY 4.0) · GBIF · obs. SA',
  s.rarity_score = 3
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Hammada articulata';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Uña de gato',
  s.primary_habitat = 'Prados calcáreos cársticos o basófilos del Alysso-Sedion albi',
  s.description = 'Crasulácea de hojas diminutas suculentas y flores amarillo-brillantes que coloniza costras y suelos esqueléticos sobre roca caliza.',
  s.identification_tips = 'Hojas minúsculas y carnosas
Flores amarillas estrelladas
Sobre roca y suelos someros',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/665351988/original.jpg',
  s.image_attribution = 'Santiago Martín-Bravo (CC BY 4.0) · GBIF',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Sedum acre';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Taray de saladar',
  s.primary_habitat = 'Galerías y matorrales ribereños termomediterráneos',
  s.description = 'Taray de saladar de flores blanco-rosadas y porte arbustivo, propio de bordes de ramblas salinas y depresiones halófilas del litoral.',
  s.identification_tips = 'Flores en espigas densas
Tolera suelos muy salinos
Bordes de rambla y saladar',
  s.seasonality = 'Primavera',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/621745664/original.jpg',
  s.image_attribution = 'melendrete (CC BY-NC 4.0) · GBIF',
  s.rarity_score = 4
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Tamarix boveana';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Taray canario',
  s.primary_habitat = 'Galerías y matorrales ribereños termomediterráneos',
  s.description = 'Taray de floración prolongada y espigas rosadas que forma galerías y tarayales en cauces y ramblas del litoral árido.',
  s.identification_tips = 'Espigas rosadas abundantes
Floración prolongada
Forma tarayales en ramblas',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/619019413/original.jpg',
  s.image_attribution = 'Christoph Moning (CC BY 4.0) · GBIF',
  s.rarity_score = 3
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Tamarix canariensis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Esparraguera de gato',
  s.primary_habitat = 'Matorrales arborescentes de Juniperus spp.',
  s.description = 'Esparraguera muy espinosa y densa que se enreda entre el matorral y el sabinar litoral, con cladodios rígidos y punzantes.',
  s.identification_tips = 'Cladodios rígidos y punzantes
Se enreda en el matorral
Frutos negros en otoño',
  s.seasonality = 'Otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Asparagus_stipularis_(detail).jpg?width=1280',
  s.image_attribution = 'Hans Hillewaert (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Asparagus horridus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Carrizo',
  s.primary_habitat = 'Ríos mediterráneos de caudal permanente con Glaucium flavum',
  s.description = 'Carrizo alto y rizomatoso que forma carrizales densos en los tramos con agua o freático somero de ramblas y cauces litorales.',
  s.identification_tips = 'Cañas altas con penacho plumoso
Indica agua o suelo húmedo
Forma carrizales densos',
  s.seasonality = 'Verano y otoño',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/605083728/original.jpg',
  s.image_attribution = 'Zoltán Stekkelpak (CC0) · GBIF',
  s.rarity_score = 1
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Phragmites australis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Roquero solitario',
  s.primary_habitat = 'Acantilados mediterráneos con Limonium',
  s.description = 'Pájaro rupícola de plumaje azul pizarra en el macho, ligado a acantilados marinos y roquedos, donde canta desde cornisas destacadas.',
  s.identification_tips = 'Macho azul pizarra
Canta desde cornisas y cumbres
Acantilados y roquedos calcáreos',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Blue_rock_thrush_(male)_at_Gamla_Nature_Reserve.jpg?width=1280',
  s.image_attribution = 'Artemy Voikhansky (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Monticola solitarius';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Avión roquero',
  s.primary_habitat = 'Acantilados mediterráneos con Limonium',
  s.description = 'Hirundínido pardo y robusto que vuela pegado a las paredes rocosas de acantilados y barrancos, donde construye su nido de barro.',
  s.identification_tips = 'Vuelo pegado a las paredes
Manchas claras en la cola
Nido de barro en cortados',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Ptyonoprogne_rupestris_in_flight.jpg?width=1280',
  s.image_attribution = 'ferran pestaña (CC BY-SA 2.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Ptyonoprogne rupestris';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Alcaudón común',
  s.primary_habitat = 'Matorral termomediterráneo semiárido',
  s.description = 'Alcaudón estival de cabeza castaña que caza insectos desde posaderos en el matorral abierto, empalando presas en espinas a modo de despensa.',
  s.identification_tips = 'Capirote castaño rojizo
Caza desde posaderos
Estival de mayo a agosto',
  s.seasonality = 'Primavera y verano (estival)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Lanius_senator01_new.jpg?width=1280',
  s.image_attribution = 'Lanius_senator01.jpg: chausinho derivative work: Bogbumper (talk) (CC BY-SA 2.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Lanius senator';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Triguero',
  s.primary_habitat = 'Cultivos de secano, pastizales y llanos abiertos con posaderos',
  s.description = 'Escribano grande y rechoncho, pardo y rayado, sin marcas llamativas. Canta desde un cable o una mata con una frase acelerada que suena como un manojo de llaves agitado, y vuela distancias cortas dejando las patas colgando.',
  s.identification_tips = 'Canto como un manojo de llaves agitándose
Vuela con las patas colgando, sin recogerlas
Aspecto pesado y pardo, sin marcas vistosas',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/606625336/original.jpg',
  s.image_attribution = 'euqirneto (CC BY 4.0) · GBIF',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Emberiza calandra';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Abejaruco europeo',
  s.primary_habitat = 'Matorral termomediterráneo semiárido',
  s.description = 'Ave colorida y gregaria que caza abejas y libélulas en vuelo sobre espacios abiertos y cría en galerías excavadas en taludes terrosos.',
  s.identification_tips = 'Colorido inconfundible
Reclamo ''prruip'' en vuelo
Cría en taludes de rambla',
  s.seasonality = 'Primavera y verano (estival)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/%C5%9Eahl%C3%BBr-33.jpg?width=1280',
  s.image_attribution = 'Dûrzan cîrano (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Merops apiaster';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Salamanquesa común',
  s.primary_habitat = 'Pendientes rocosas calcícolas con vegetación casmofítica',
  s.description = 'Gecko robusto de piel tuberculada, activo al anochecer sobre roquedos, muros y cortados, donde caza insectos atraídos por la luz.',
  s.identification_tips = 'Piel rugosa con tubérculos
Activa al atardecer
Trepa por rocas y muros',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/605672084/original.jpg',
  s.image_attribution = 'jrodben (CC BY-NC 4.0) · GBIF',
  s.rarity_score = 1
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Tarentola mauritanica';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Salamanquesa rosada',
  s.primary_habitat = 'Pendientes rocosas calcícolas con vegetación casmofítica',
  s.description = 'Gecko pequeño y translúcido de tonos rosados, de hábitos nocturnos, que se refugia en grietas de roquedos, muros de piedra y ruinas.',
  s.identification_tips = 'Piel rosada casi translúcida
Cola con anillos espinosos
Nocturna y discreta',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Hemidactylus_turcicus_on_a_wall_in_Greece.jpg?width=1280',
  s.image_attribution = 'Koppi2 (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Hemidactylus turcicus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Culebra de herradura',
  s.primary_habitat = 'Matorral termomediterráneo semiárido',
  s.description = 'Culebra ágil y trepadora con dibujo dorsal en herradura, ligada a matorrales termófilos y roquedos soleados del sureste ibérico.',
  s.identification_tips = 'Manchas dorsales en herradura
Ágil y trepadora
Inofensiva para las personas',
  s.seasonality = 'Primavera a otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Hemorrhois_hippocrepis_121004.jpg?width=1280',
  s.image_attribution = 'Accipiter (R. Altenkamp, Berlin) (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Hemorrhois hippocrepis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Conejo',
  s.primary_habitat = 'Matorral termomediterráneo semiárido',
  s.description = 'Lagomorfo excavador que vive en madrigueras coloniales; pieza clave del ecosistema mediterráneo como presa de águila perdicera, búho real y carnívoros.',
  s.identification_tips = 'Excava madrigueras coloniales
Presa clave de rapaces
Activo al amanecer y atardecer',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Oryctolagus_cuniculus_Tasmania_2.jpg?width=1280',
  s.image_attribution = 'JJ Harrison (https://www.jjharrison.com.au/) (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Oryctolagus cuniculus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Erizo moruno',
  s.primary_habitat = 'Matorral termomediterráneo semiárido',
  s.description = 'Erizo de orejas grandes y color claro, propio del matorral árido del sureste ibérico; nocturno e insectívoro, se refugia bajo la vegetación densa.',
  s.identification_tips = 'Orejas grandes y tono claro
Nocturno e insectívoro
Se ovilla ante el peligro',
  s.seasonality = 'Primavera a otoño (hiberna)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Erizo_moruno_(Atelerix_algirus).jpg?width=1280',
  s.image_attribution = 'Galanthus (CC BY 3.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Atelerix algirus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Pijolobo',
  s.primary_habitat = 'Saladares, estepas salinas y matorrales halófilos, sobre las raíces de quenopodiáceas',
  s.description = 'Planta sin una sola hoja verde: no hace fotosíntesis y vive enganchada a las raíces de las sosas y los almajos del saladar, de los que toma agua y alimento. Todo el año es invisible bajo tierra y, en primavera, saca de golpe una espiga carnosa de hasta medio metro cubierta de grandes flores amarillas, un espectáculo desconcertante en un suelo desnudo y salado. En Águilas y su comarca se la conoce como pijolobo; en el resto del sureste, como jopo de lobo.',
  s.identification_tips = 'Espiga carnosa amarilla que brota directamente del suelo, sin tallo con hojas
Escamas pardas en vez de hojas a lo largo del tallo
Siempre al pie de una sosa, un almajo o un salado: es su hospedador',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/CistanchePhelypaea.jpg?width=1280',
  s.image_attribution = 'Ziegler175 (Public domain) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name = 'Cistanche phelypaea';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Jabalí',
  s.primary_habitat = 'Bosque, matorral denso y cultivos; necesita cobertura y puntos de agua',
  s.description = 'Ungulado robusto y adaptable, con el cuerpo cubierto de cerdas ásperas y una cabeza en cuña rematada por un hocico potente con el que remueve el suelo. Los rayones —las crías— nacen con líneas claras a lo largo del lomo. Es omnívoro y ha ampliado mucho su área en las últimas décadas.',
  s.identification_tips = 'Hozaduras: zonas de suelo removido como si lo hubieran arado
Huellas hendidas grandes con las pezuñas laterales marcadas
Barros y árboles con el tronco embarrado a media altura',
  s.seasonality = 'Todo el año (actividad sobre todo nocturna)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Eberswalde_Zoo_12-2017_img2.jpg?width=1280',
  s.image_attribution = 'A.Savin (FAL) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Sus scrofa';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Zorro',
  s.primary_habitat = 'Prácticamente cualquier ambiente: bosque, matorral, cultivos y periferias urbanas',
  s.description = 'El carnívoro silvestre más adaptable y extendido: vive desde la alta montaña hasta el borde de las ciudades. Es omnívoro y oportunista, lo que explica su éxito. Se reconoce por la cola larga y espesa —la «hopa»— rematada casi siempre en blanco.',
  s.identification_tips = 'Cola muy espesa con la punta blanca
Huella alargada con las cuatro almohadillas alineadas
Excrementos retorcidos y con pelos, sobre piedras y caminos',
  s.seasonality = 'Todo el año (actividad sobre todo nocturna)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Vulpes_vulpes_2.jpg?width=1280',
  s.image_attribution = 'Juan Lacruz (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Vulpes vulpes';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Albaida',
  s.primary_habitat = 'Matorral seco y soleado sobre margas y suelos pobres',
  s.description = 'Mata de aspecto blanquecino por la fina pelusa que cubre hojas y tallos, un recurso frente al sol y la sequía. En primavera se llena de espigas de flores amarillas que atraen a muchos insectos. Es una de las leguminosas que primero coloniza laderas degradadas y taludes.',
  s.identification_tips = 'Aspecto grisáceo y aterciopelado al tacto
Flores amarillas pequeñas en espigas apretadas
Hojas divididas en tres, la del centro más larga',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Anthyllis_cytisoides.JPG?width=1280',
  s.image_attribution = 'Ximenex (CC BY-SA 2.1 es) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Anthyllis cytisoides';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Pino carrasco',
  s.primary_habitat = 'Laderas secas y soleadas sobre calizas y margas, en clima mediterráneo cálido',
  s.description = 'Pino de copa clara e irregular y follaje de un verde pálido, el más resistente a la sequía y a los suelos pobres de los pinos ibéricos. Sus piñas, alargadas y asimétricas, quedan colgadas años en la rama y liberan las semillas tras los incendios, lo que le permite recolonizar rápido.',
  s.identification_tips = 'Copa irregular y poco densa, de verde claro
Piñas asimétricas y persistentes, apuntando hacia atrás
Corteza clara y agrietada, rojiza en las ramas jóvenes',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Pino_secolare_-_Castelleone_di_Suasa.JPG?width=1280',
  s.image_attribution = 'Accurimbono (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Pinus halepensis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Espino negro',
  s.primary_habitat = NULL,
  s.description = 'Es un arbustillo de hasta 3 m de altura (López González, 2001), que frecuentemente tiene aspecto de mata alta o media, más o menos espinoso, de ramificación intricada y de perennifolio a semicaducifolio facultativo. Sus especímenes tienen espinas pero presentan una variabilidad: los de las regiones continentales y mediterráneas más áridas las llegan a tener en cantidad y longitud exagerada, pero otros son casi inermes. Presenta también unas ramillas laterales cortas terminadas en un fascículo de hojas. Éstas se disponen alternas, aunque a veces algunas se muestran casi opuestas; son simples, sin peciolo y con un limbo estrecho (tíìcamente menor de 0,5 cm), a veces muy corto, menor de 1,2 cm (subsp. borgiae), de trasovado-oblongo a espatulado-linear, lampiño o con un pelillo muy corto (subesp. velutina).',
  s.identification_tips = '',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Rhamnus_lycioides_fruits.JPG?width=1280',
  s.image_attribution = 'איתן פרמן (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Rhamnus lycioides';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Jara blanca',
  s.primary_habitat = 'Matorral y laderas soleadas sobre suelos calizos secos',
  s.description = 'Jara de hojas blanquecinas, aterciopeladas al tacto y sin peciolo, con flores grandes de color rosa malva y pétalos arrugados como papel de seda que duran solo unas horas. Es una de las plantas que da color al matorral en primavera.',
  s.identification_tips = 'Hojas blanquecinas y aterciopeladas, sentadas en la rama
Flores rosa malva grandes, de pétalos arrugados
Cada flor dura apenas una mañana',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Cistus_albidus_flowers.jpg?width=1280',
  s.image_attribution = 'Júlio Reis (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Cistus albidus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Lentisco',
  s.primary_habitat = 'Matorral mediterráneo litoral',
  s.description = 'Arbusto perennifolio de hojas compuestas sin foliolo terminal y con el raquis alado, un detalle que lo separa de la cornicabra. Al frotarlo huele intensamente a resina. Sus frutos, en racimo, pasan de rojo a negro y son alimento clave para aves en otoño.',
  s.identification_tips = 'Hoja compuesta con número par de foliolos, sin uno terminal
Raquis de la hoja con dos alas laterales
Olor fuerte a resina al frotar las hojas',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Pistacia_lentiscus.jpg?width=1280',
  s.image_attribution = 'Lumbar~commonswiki (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Pistacia lentiscus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Romero',
  s.primary_habitat = 'Matorral seco y soleado sobre suelos calizos y pedregosos',
  s.description = 'Arbusto aromático de hojas estrechas como agujas, verde oscuro por el haz y blanquecinas por el envés, con los bordes enrollados hacia abajo. Florece casi todo el año en azul pálido, y en pleno invierno es una de las pocas fuentes de néctar del matorral.',
  s.identification_tips = 'Hojas como agujas, blancas por debajo
Olor inconfundible al frotar entre los dedos
Flores azul claro repartidas por las ramas casi todo el año',
  s.seasonality = 'Todo el año, con máximo de floración en invierno y primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Rosemary_in_bloom.JPG?width=1280',
  s.image_attribution = 'Margalob (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Rosmarinus officinalis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Algarrobo',
  s.primary_habitat = 'Laderas cálidas, antiguos cultivos y matorral del piso termomediterráneo',
  s.description = 'Árbol perennifolio de copa densa y hojas compuestas con foliolos redondeados y lustrosos. Florece en otoño directamente sobre el tronco y las ramas viejas. Sus vainas pardas y dulces, las algarrobas, se han usado durante siglos como pienso y alimento.',
  s.identification_tips = 'Hojas compuestas de foliolos redondos y brillantes
Flores nacidas directamente del tronco y las ramas gruesas
Vainas pardas y aplanadas colgando del árbol',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Ceratonia_siliqua_Keciboynuzu_1370984_Nevit.jpg?width=1280',
  s.image_attribution = 'Nevit Dilmen (talk) (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Ceratonia siliqua';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Aladierno',
  s.primary_habitat = 'Matorral alto, encinares y barrancos sobre suelos pedregosos',
  s.description = 'Arbusto perennifolio de hojas alternas, coriáceas y de borde finamente dentado, sin espinas. Sus frutos maduran de rojo a negro y son muy buscados por los pájaros. Se distingue del espino negro por carecer de espinas y tener hojas mayores.',
  s.identification_tips = 'Sin espinas, a diferencia de otros ramnos
Hojas alternas, coriáceas y algo dentadas
Frutos que pasan de rojo a negro al madurar',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Rhamnus_alaternus1627.JPG?width=1280',
  s.image_attribution = 'tato grasso (CC BY-SA 2.5) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Rhamnus alaternus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Coscoja',
  s.primary_habitat = 'Matorral esclerófilo y sabinar',
  s.description = 'Arbusto esclerófilo de hoja perenne y espinosa, integrante del matorral mediterráneo denso y de las orlas del sabinar.',
  s.identification_tips = 'Hojas coriáceas con margen espinoso
Bellota con cúpula de escamas punzantes
Porte arbustivo denso',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Quercus_coccifera_1.JPG?width=1280',
  s.image_attribution = 'User:Xemenendura (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Quercus coccifera';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Bayón',
  s.primary_habitat = 'Matorral alto, sabinares y laderas secas sobre suelo pedregoso',
  s.description = 'Arbusto de ramas verdes y erguidas con hojas estrechas y coriáceas. Es hemiparásito: fabrica su propio alimento pero además conecta sus raíces a las de otras plantas para robarles agua y sales. Sus frutos son bayas rojas o anaranjadas muy vistosas.',
  s.identification_tips = 'Ramas verdes y erectas, de aspecto escobiforme
Bayas rojo anaranjado brillantes al madurar
Hojas estrechas, duras y de punta aguda',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Osyris_lanceolata.JPG?width=1280',
  s.image_attribution = 'Xemenendura (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Osyris lanceolata';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Tomillo blanco',
  s.primary_habitat = 'Tomillares y matorral raso sobre suelos calizos secos',
  s.description = 'Tomillo endémico del sureste ibérico, fácil de reconocer por unas brácteas grandes, blancas y membranosas que rodean la inflorescencia y parecen pétalos. Ese conjunto vistoso, más que las flores en sí, es lo que atrae a los insectos.',
  s.identification_tips = 'Brácteas blancas grandes y papiráceas rodeando la flor
Cabezuelas terminales muy vistosas y redondeadas
Aroma intenso a tomillo al frotar',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Thymus_membranaceus_(3).jpg?width=1280',
  s.image_attribution = 'Nanosanchez (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Thymus membranaceus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Enebro de la miera',
  s.primary_habitat = 'Matorral, pinares aclarados y laderas pedregosas',
  s.description = 'Enebro de hojas aciculares y punzantes dispuestas de tres en tres, con dos bandas blancas en la cara superior que lo separan a simple vista de la sabina. Sus gálbulos son rojizos al madurar. De su madera se destilaba el aceite de miera.',
  s.identification_tips = 'Hojas punzantes en grupos de tres, no en escama
Dos rayas blancas en la cara superior de cada hoja
Gálbulos rojizos y brillantes al madurar',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Juniperus_oxycedrus_g1.jpg?width=1280',
  s.image_attribution = 'autor no indicado (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Juniperus oxycedrus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Ardilla roja',
  s.primary_habitat = 'Pinares y bosques con arbolado maduro y producción de piñones o frutos',
  s.description = 'Ardilla arborícola de cola larga y esponjosa y orejas con pinceles de pelo más marcados en invierno. En los pinares mediterráneos su rastro más evidente son las piñas roídas hasta dejar solo el eje, abandonadas en tocones y piedras.',
  s.identification_tips = 'Piñas roídas hasta el raspón, apiladas en un mismo posadero
Cola larga y esponjosa que mantiene erguida al saltar
Pinceles de pelo en las orejas, sobre todo en invierno',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Eichh%C3%B6rnchen_D%C3%BCsseldorf_Hofgarten_edit.jpg?width=1280',
  s.image_attribution = 'Ray eye (CC BY-SA 2.0 de) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Sciurus vulgaris';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Narciso',
  s.primary_habitat = NULL,
  s.description = NULL,
  s.identification_tips = '',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Lapiedra_martinezii_-_Flor_de_la_estrella.jpg?width=1280',
  s.image_attribution = 'Formater (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Lapiedra martinezii';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Camaleón común',
  s.primary_habitat = 'Presente en zonas de costa por lo general, a baja altitud y sobre suelos arenosos',
  s.description = 'Especie de aspecto inconfundible: cuerpo aplanado lateralmente, ojos prominentes, cabeza con casco llamativo, cola prensil, escamas granulares y dedos distribuidos en disposición 3+2. Se registra dicromatismo sexual con un patrón de coloración corporal (o librea) muy complejo y relacionado con el sexo, estado reproductor y las necesidades de termorregulación. Longitud total máxima de 282 mm en machos y 301 en hembras.',
  s.identification_tips = '',
  s.seasonality = 'Febrero a noviembre',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/BennyTrapp_Chamaeleo_chamaeleon_Samos_Griechenland.jpg?width=1280',
  s.image_attribution = 'Benny Trapp (CC BY 3.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Chamaeleo chamaeleon';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Esparraguera blanca',
  s.primary_habitat = 'Matorral seco, ribazos y bajo arbustos en clima cálido',
  s.description = 'Esparraguera de tallos blanquecinos y muy espinosos que pierde el follaje en verano y florece en otoño, al revés que casi todo el matorral. Lo que parecen hojas son ramillas finas agrupadas en haces. Sus brotes tiernos son los espárragos silvestres de recolección tradicional.',
  s.identification_tips = 'Tallos claros, casi blancos, con espinas fuertes
Ramillas finas agrupadas en manojitos
Florece en otoño, con flores blancas y olorosas',
  s.seasonality = 'Otoño (floración)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Art%C3%A0_-_Ermita_de_Betlem_-_Asparagus_albus_03_ies.jpg?width=1280',
  s.image_attribution = 'Frank Vincentz (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Asparagus albus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Azufaifo',
  s.primary_habitat = 'Matorrales arborescentes de Ziziphus',
  s.description = 'Arbusto espinoso que forma cúpulas densas de varios metros, un microhábitat en sí mismo: bajo su copa se refugian aves, reptiles y mamíferos, y la humedad y el suelo son distintos que fuera. Sus ramas zigzaguean con dos espinas en cada nudo, una recta y otra ganchuda.',
  s.identification_tips = 'Ramas en zigzag con dos espinas por nudo, una recta y otra curva
Porte en cúpula o almohadón, muy denso
Frutos redondos que pasan de verde a pardo amarillento',
  s.seasonality = 'Primavera a otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Ziziphus_lotus_20200928_191923.jpg?width=1280',
  s.image_attribution = 'Nanosanchez (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Ziziphus lotus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Lastón',
  s.primary_habitat = 'Pastizales, claros de matorral y ribazos sobre suelos calizos',
  s.description = 'Gramínea perenne y rizomatosa que forma céspedes extensos en los claros del matorral mediterráneo. Sus hojas son cortas, rígidas y de punta roma. Es de las plantas que más rápido rebrota tras un incendio, gracias a sus rizomas subterráneos.',
  s.identification_tips = 'Céspedes extensos y bajos, no matas aisladas
Hojas cortas y rígidas, de punta redondeada
Espiguillas alineadas a un lado de un eje rígido',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Brachypodium_retusum_espiga_seca.jpg?width=1280',
  s.image_attribution = 'Pere prlpz (CC BY-SA 2.5) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Brachypodium retusum';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Palmito',
  s.primary_habitat = 'Matorral cálido, laderas soleadas y acantilados del piso termomediterráneo',
  s.description = 'La única palmera silvestre de Europa continental. Suele crecer en mata, con varios troncos cortos, aunque con los años puede levantar un tronco único. Sus hojas son abanicos rígidos con pecíolos muy espinosos. Del cogollo se sacaba el «palmito», y de las hojas, cordelería y escobas.',
  s.identification_tips = 'Hojas en abanico, rígidas y divididas en segmentos
Pecíolos con espinas fuertes en los bordes
Porte en mata, con varios troncos desde la base',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Chamaerops_humilis_Torreblanca.jpg?width=1280',
  s.image_attribution = 'Canaan (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Chamaerops humilis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Baladre',
  s.primary_habitat = 'Cauces de rambla y ramblizos con humedad subterránea y crecidas',
  s.description = 'Arbusto de hojas coriáceas, alargadas y opuestas, que forma masas densas en el lecho de las ramblas y aguanta las riadas gracias a su raigambre. Florece en rosa intenso durante buena parte del verano. Toda la planta es muy tóxica, savia incluida.',
  s.identification_tips = 'Hojas duras y lanceoladas con el nervio central marcado
Flores rosas grandes en el extremo de las ramas
Frutos en vaina larga que se abre soltando semillas con vilano',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Nerium_oleander_flowers_leaves.jpg?width=1280',
  s.image_attribution = 'Alvesgaspar (CC BY 2.5) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Nerium oleander';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Carrasca',
  s.primary_habitat = 'Bosques y matorrales mediterráneos continentales, sobre suelos secos y pobres',
  s.description = 'La encina de interior, más adaptada al frío y a la sequía continental, con hojas más redondeadas y bellotas dulces. A menudo crece en mata por el efecto del ramoneo y las cortas repetidas. Muchos autores la consideran una subespecie de la encina.',
  s.identification_tips = 'Hojas más redondeadas y pequeñas que las de la encina litoral
Bellotas de sabor dulce, no amargas
Frecuente en porte de mata, con varios pies',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Carrasca_de_la_Raboseras.JPG?width=1280',
  s.image_attribution = 'Picamaderos (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Quercus rotundifolia';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Esparraguera de gato',
  s.primary_habitat = 'Matorrales arborescentes de Juniperus spp.',
  s.description = 'Esparraguera muy espinosa y densa que se enreda entre el matorral y el sabinar litoral, con cladodios rígidos y punzantes.',
  s.identification_tips = 'Cladodios rígidos y punzantes
Se enreda en el matorral
Frutos negros en otoño',
  s.seasonality = 'Otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Asparagus_stipularis_(detail).jpg?width=1280',
  s.image_attribution = 'Hans Hillewaert (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Asparagus horridus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Bolaga',
  s.primary_habitat = 'Matorral costero y semiárido, arenas y suelos pedregosos con influencia marina',
  s.description = 'Mata de ramas largas y flexibles cubiertas de hojitas escamosas, apretadas contra el tallo como las tejas de un tejado, con el envés blanco y peludo. Las flores son verdosas y pasan desapercibidas, pero su corteza es tan fibrosa y resistente que se ha usado tradicionalmente como cuerda.',
  s.identification_tips = 'Hojas minúsculas y solapadas, cubriendo el tallo como escamas
La rama no se rompe al doblarla: la corteza es fibrosa y correosa
Flores verde-amarillentas pegadas a la rama, sin pétalos vistosos',
  s.seasonality = 'Floración de otoño a primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Thymelaea_hirsuta_Bonifacio.jpg?width=1280',
  s.image_attribution = 'Pancrat (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Thymelaea hirsuta';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Clavellina',
  s.primary_habitat = 'Pastizales secos, arenales y claros de matorral sobre suelos pobres',
  s.description = 'Clavellina silvestre de tallos finos y hojas muy estrechas, con flores rosadas de pétalos profundamente recortados en flecos. El cáliz es un tubo largo y estrecho del que asoman los pétalos. Desprende una fragancia suave, más perceptible al atardecer.',
  s.identification_tips = 'Pétalos rosados recortados en flecos finos
Cáliz en tubo largo y delgado
Hojas muy estrechas, casi como agujas',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Dianthus_broteri.jpg?width=1280',
  s.image_attribution = 'Nanosanchez (Public domain) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Dianthus broteri';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Abejera',
  s.primary_habitat = NULL,
  s.description = NULL,
  s.identification_tips = '',
  s.seasonality = 'Febrero a mayo',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Ophrys_tenthredinifera_b.JPG?width=1280',
  s.image_attribution = 'autor no indicado (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Ophrys tenthredinifera';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Jarilla de brezo',
  s.primary_habitat = 'Matorrales y pastizales pedregosos sobre calizas, en solanas secas',
  s.description = 'Matita leñosa de hojas estrechas y punzantes parecidas a las del brezo, de donde le viene el nombre. Sus flores amarillas, de cinco pétalos delicados, se abren por la mañana y pierden los pétalos el mismo día.',
  s.identification_tips = 'Hojas lineares, rígidas y puntiagudas, como agujas cortas
Flores amarillas efímeras, con pétalos arrugados
Mata baja y leñosa en la base, muy ramificada',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Fumana_ericoides_Tallos_2010-7-03_ParqueNaturalLagunasdelaMata.jpg?width=1280',
  s.image_attribution = 'Javier martin (Public domain) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Fumana ericoides';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Rana común',
  s.primary_habitat = 'Charcas, balsas, acequias y tramos remansados con vegetación',
  s.description = 'La rana verde ibérica, la más común y adaptable de nuestros anfibios: coloniza desde ramblas y balsas de riego hasta fuentes urbanas. Su canto es un cacareo entrecortado que forma coros al atardecer. Salta al agua al menor movimiento en la orilla.',
  s.identification_tips = 'Línea clara a lo largo del centro del lomo en muchos ejemplares
Canto entrecortado, como una risa o un cacareo
Salta al agua desde la orilla al notar movimiento',
  s.seasonality = 'Primavera a otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Pelophylax_perezi_by-dpc.jpg?width=1280',
  s.image_attribution = 'David Perez (CC BY 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Pelophylax perezi';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Tomillo de invierno',
  s.primary_habitat = 'Tomillares y matorral raso sobre suelos calizos y margosos secos',
  s.description = 'Tomillo del sureste ibérico que florece en pleno invierno, cuando casi nada más lo hace, cubriéndose de espigas de flores blancas o rosadas. Ese calendario lo convierte en un recurso decisivo para los insectos en la estación fría y en una planta melífera muy apreciada.',
  s.identification_tips = 'Florece en invierno, adelantándose al resto del tomillar
Hojas pequeñas con el borde enrollado hacia abajo
Aroma fuerte a tomillo al frotar entre los dedos',
  s.seasonality = 'Todo el año, con floración de invierno a primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Thymus_hyemalis_re.jpg?width=1280',
  s.image_attribution = 'Retama (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Thymus hyemalis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Campanica',
  s.primary_habitat = 'Ribazos, cunetas, cultivos y claros de matorral',
  s.description = 'Correhuela trepadora de flores rosadas grandes y llamativas, con hojas muy variables: las de abajo casi enteras y las de arriba profundamente divididas y plateadas. Se enreda en la vegetación de ribazos y márgenes.',
  s.identification_tips = 'Flores rosa intenso en embudo, grandes y vistosas
Hojas superiores muy recortadas y de aspecto plateado
Tallos volubles que se enredan en otras plantas',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Convolvulus_althaeoides_1.JPG?width=1280',
  s.image_attribution = 'User:Xemenendura (CC BY-SA 2.1 es) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Convolvulus althaeoides';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Alhucema',
  s.primary_habitat = 'Matorral seco, ribazos y bordes soleados de clima cálido',
  s.description = 'Alhucema de hojas muy divididas, casi como las de un helecho, y aspecto grisáceo. Florece durante buena parte del año en espigas azul violeta rematadas por dos brácteas alargadas. Su olor es más resinoso y menos dulce que el del espliego cultivado.',
  s.identification_tips = 'Hojas finamente divididas, de aspecto plumoso
Espigas azul violeta con dos brácteas en la punta
Aroma resinoso e intenso al frotar',
  s.seasonality = 'Casi todo el año, con máximo en primavera y otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Lavandula_multifida.jpg?width=1280',
  s.image_attribution = 'Laitche (Public domain) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Lavandula multifida';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Oroval',
  s.primary_habitat = 'Matorral cálido, roquedos y ramblas de clima muy seco',
  s.description = 'Arbusto de la familia del tomate y la belladona, con hojas ovaladas algo carnosas y flores verdosas discretas. Los frutos son bayas rojas y brillantes envueltas en el cáliz. Es una especie de raíz norteafricana que en la península solo vive en los rincones más cálidos del sureste.',
  s.identification_tips = 'Bayas rojas pequeñas asomando del cáliz
Hojas ovales, algo carnosas y de verde apagado
Flores verde amarillentas, poco vistosas',
  s.seasonality = 'Primavera y otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Withania_frutescens0176.jpg?width=1280',
  s.image_attribution = 'Nanosanchez (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Withania frutescens';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Floreta',
  s.primary_habitat = 'Matorral seco y laderas soleadas sobre suelos pedregosos',
  s.description = 'Leguminosa de tallos verdes, largos y flexibles, casi sin hojas —que caen pronto para ahorrar agua—, rematados en umbelas de flores amarillas. Sus frutos son legumbres articuladas que se rompen en segmentos con una semilla cada uno.',
  s.identification_tips = 'Tallos verdes y juncosos, casi sin hojas
Umbelas de flores amarillas en el extremo
Legumbres articuladas, como collares de cuentas',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Coronilla_juncea.JPG?width=1280',
  s.image_attribution = 'Mario Modesto Mata (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Coronilla juncea';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Bocha blanca',
  s.primary_habitat = 'Matorral, ribazos y claros sobre suelos secos y calizos',
  s.description = 'Mata baja y grisácea por la pelusa que la cubre, con hojas divididas en foliolos estrechos y ramilletes apretados de florecillas blancas con la quilla oscura. Es muy frecuente en los claros del matorral.',
  s.identification_tips = 'Ramilletes densos de flores blancas muy pequeñas
Quilla de la flor con la punta oscura
Aspecto grisáceo por la pelusa que cubre la planta',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Dorycnium_pentaphyllum_Habitat_2010-6-15_DehesaBoyaldePuertollano.jpg?width=1280',
  s.image_attribution = 'Javier martin (Public domain) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Lotus dorycnium';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Salamanquesa común',
  s.primary_habitat = 'Pendientes rocosas calcícolas con vegetación casmofítica',
  s.description = 'Gecko robusto de piel tuberculada, activo al anochecer sobre roquedos, muros y cortados, donde caza insectos atraídos por la luz.',
  s.identification_tips = 'Piel rugosa con tubérculos
Activa al atardecer
Trepa por rocas y muros',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/605672084/original.jpg',
  s.image_attribution = 'jrodben (CC BY-NC 4.0) · GBIF',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Tarentola mauritanica';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Zamarrilla',
  s.primary_habitat = 'Tomillares y matorral raso sobre suelo calizo pedregoso',
  s.description = 'Mata pequeña y grisácea, de hojas estrechas con el borde enrollado, que remata sus tallos en cabezuelas apretadas de flores blancas o crema. Es una de las plantas más constantes del tomillar y una fuente de néctar importante en pleno verano.',
  s.identification_tips = 'Cabezuelas redondas y compactas al final del tallo
Aspecto general blanquecino o grisáceo
Flores sin labio superior, típicas del género',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Teucrium_capitatum2006.jpg?width=1280',
  s.image_attribution = 'No machine-readable author provided. Víctor M. Vicente Selvas~commo… (Public domain) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Teucrium capitatum';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cardoncha',
  s.primary_habitat = 'Vive en laderas pedregosas y campos abandonados sobre sustratos básicos, hasta 1300 m',
  s.description = 'Hierba perenne, hasta de 2,5 m, leñosa en la base, con varios tallos, espinosa, fétida, muy pelosa, con tallos con costillas longitudinales. Hojas de 5-15 x 1,5-6 cm, pinnatifidas, con lóbulos espinosos, con nervios amarillentos prominentes. Capítulos de 2-5 cm, terminales, en grupos, ovoides o acampanados, con siete filas de brácteas, con corolas de unos 3,5 cm, de color amarillo. Frutos en aquenio de 5-7 mm, comprimidos lateralmente, negruzcos, con vilano simple, caedizo.',
  s.identification_tips = '',
  s.seasonality = 'Diciembre, febrero, marzo, abril, mayo, junio, julio, agosto',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/C._arborescens-1.JPG?width=1280',
  s.image_attribution = 'Philmarin (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Phonus arborescens';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Lagartija colilarga',
  s.primary_habitat = 'Matorral litoral y laderas secas',
  s.description = 'Lagartija esbelta de escamas grandes, quilladas y brillantes, con dos líneas claras muy marcadas a cada lado del dorso. La cola puede medir el doble que el cuerpo. Los machos lucen en primavera manchas azules en el hombro y las mejillas anaranjadas.',
  s.identification_tips = 'Dos líneas claras nítidas a lo largo de cada costado
Escamas grandes y quilladas, de aspecto brillante
Cola larguísima, hasta el doble que el cuerpo',
  s.seasonality = 'Primavera a otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Psammodromus_algirus_-_01.jpg?width=1280',
  s.image_attribution = 'Carlos Delgado (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Psammodromus algirus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Madroño',
  s.primary_habitat = 'Umbrías, barrancos y matorral alto sobre suelos frescos',
  s.description = 'Arbusto o arbolillo de hojas lustrosas y dentadas y corteza rojiza que se desprende en tiras. En otoño coinciden en la misma rama las flores blancas en racimos colgantes y los frutos rojos y granulosos del año anterior.',
  s.identification_tips = 'Flores y frutos a la vez en la misma rama, en otoño
Frutos rojos esféricos de superficie granulosa
Corteza rojiza que se desprende en tiras finas',
  s.seasonality = 'Otoño e invierno (flor y fruto a la vez)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Arbutus_unedo_Corsica.jpg?width=1280',
  s.image_attribution = 'jxandreani (CC BY 2.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Arbutus unedo';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Mirto',
  s.primary_habitat = 'Barrancos, umbrías y matorral alto sobre suelos frescos',
  s.description = 'Arbusto aromático de hojas opuestas, brillantes y coriáceas que al mirarlas a contraluz muestran puntitos translúcidos: son las glándulas de aceite esencial. Sus flores blancas tienen un penacho de estambres y sus frutos son bayas azul negruzcas.',
  s.identification_tips = 'Puntos translúcidos en la hoja al mirarla a contraluz
Aroma intenso al estrujar una hoja
Flores blancas con muchos estambres, como un pincel',
  s.seasonality = 'Verano (floración) y otoño (fruto)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Starr_080304-3229_Myrtus_communis.jpg?width=1280',
  s.image_attribution = 'Forest & Kim Starr (CC BY 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Myrtus communis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Rabo de gato',
  s.primary_habitat = 'Tomillares y matorral raso sobre suelos calizos y margosos',
  s.description = 'Rabogato de tallos erguidos cubiertos de pelusa blanca, con flores de color blanco crema dispuestas en verticilos separados a lo largo de la espiga. Es un endemismo del sureste ibérico y una de las plantas usadas tradicionalmente en infusión.',
  s.identification_tips = 'Flores blanco crema en anillos separados por el tallo
Toda la planta blanquecina y algo lanuda
Brácteas anchas y punzantes bajo cada grupo de flores',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Alb-S.leucantha-13.jpg?width=1280',
  s.image_attribution = 'Philmarin (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Sideritis leucantha';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Canadillo',
  s.primary_habitat = 'Roquedos, matorral seco y pie de acantilado en clima cálido',
  s.description = 'Arbusto de aspecto extraño: un manojo de tallos verdes, articulados y colgantes, casi sin hojas, que se quiebran con facilidad por los nudos. No es una planta con flores, sino un pariente lejano de las coníferas; sus semillas van envueltas en una cubierta roja y carnosa.',
  s.identification_tips = 'Tallos verdes articulados que se rompen por los nudos
Sin hojas visibles, solo escamas en cada nudo
Frutos rojos carnosos con una semilla dentro',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Ephedra_fragilis_3.JPG?width=1280',
  s.image_attribution = 'User:falconaumanni (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Ephedra fragilis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Orejilla de roca',
  s.primary_habitat = 'Roquedos y fisuras calcáreas costeras',
  s.description = 'Planta rupícola de hojas redondeadas, dentadas y algo carnosas, que forma matas colgantes en las paredes calizas. Sus flores, blanquecinas con toques amarillos, se agrupan en racimos erguidos. Es un endemismo iberoafricano restringido al sureste peninsular y al norte de África.',
  s.identification_tips = 'Hojas redondas y dentadas, casi como monedas
Racimos de flores blanquecinas erguidos sobre el follaje
Forma matas colgantes en pared caliza',
  s.seasonality = 'Floración primaveral',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Lafuentea_rotundifolia80857.jpg?width=1280',
  s.image_attribution = 'Nanosanchez (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Lafuentea rotundifolia';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Almez',
  s.primary_habitat = 'En vegas y riberas de ríos, sobre suelos húmedos y profundos de aluvión',
  s.description = 'Árbol caducifolio hasta de 30 m y amplia copa, con corteza muy lisa de color gris plateado, parecida a la piel de los elefantes. Ramas con frecuencia colgantes. Hojas 5-15 x 1,5-6 cm, simples, alternas, pecioladas, asimétricas en la base, lanceoladas, largamente acuminadas, aserradas, más o menos pelosas, con el haz verde oscuro y envés verde claro. Flores masculinas o hermafroditas, pequeñas y solitarias, poco vistosas, verdosas, con una sola envoltura floral y con un largo pedúnculo de 2-8 cm. Fruto de 8-12 mm, en drupa redondeada y con largo pedúnculo, color negro azulado en la madurez.',
  s.identification_tips = '',
  s.seasonality = 'Abril a enero',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Celtis_australis_(2).JPG?width=1280',
  s.image_attribution = 'Marija Gajić (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Celtis australis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Clujía',
  s.primary_habitat = 'Roquedos, laderas pedregosas y matorral seco sobre calizas',
  s.description = 'Umbelífera leñosa, algo insólita en una familia de hierbas, con hojas estrechas, coriáceas y de un verde azulado. Sus umbelas de flores amarillas se abren en pleno verano. Desprende un olor resinoso característico al romper una rama.',
  s.identification_tips = 'Umbelífera con base leñosa, no herbácea
Hojas estrechas, duras y de verde azulado
Umbelas amarillas en pleno verano',
  s.seasonality = 'Verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/B._gibraltarium-1.JPG?width=1280',
  s.image_attribution = 'Philmarin (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Bupleurum gibraltarium';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Romerina',
  s.primary_habitat = 'Tomillares y matorral seco sobre calizas y margas',
  s.description = 'Jara pequeña de hojas muy estrechas y enrolladas por los bordes, verdes arriba y blancas por debajo, que a distancia recuerdan al romero. Se distingue enseguida al florecer: da grupos de flores blancas de cinco pétalos, mucho mayores que las del romero.',
  s.identification_tips = 'Hojas estrechas enrolladas, blancas por el envés
Flores blancas de cinco pétalos, varias juntas
Sin el olor a romero, aunque se le parezca de lejos',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Cistus_clusii_(habitus).jpg?width=1280',
  s.image_attribution = 'Hans Hillewaert (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Cistus clusii';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Mata pulguera',
  s.primary_habitat = 'Roquedos, muros, taludes y grietas soleadas',
  s.description = 'Mata pequeña y leñosa en la base que crece agarrada a la roca y a los muros. Sus hojas son estrechas y blanquecinas por el envés. Las cabezuelas, solitarias sobre tallos largos y desnudos, están rodeadas de brácteas secas y pardas que persisten mucho tiempo.',
  s.identification_tips = 'Cabezuelas pardas y secas al final de tallos largos y pelados
Hojas estrechas, verdes arriba y blancas por debajo
Casi siempre sobre roca, muro o talud',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Phagnalon_saxatile.JPG?width=1280',
  s.image_attribution = 'Xemenendura (CC BY 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Phagnalon saxatile';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Sedo de hojas gruesas',
  s.primary_habitat = 'Prados calcáreos del Alysso-Sedion albi',
  s.description = 'Crasulácea diminuta de hojas gruesas, casi esféricas y de un gris azulado, dispuestas de dos en dos y cubiertas de pelillos glandulosos que la hacen pegajosa. Forma almohadillas en grietas y muros y da flores blancas con venas rosadas.',
  s.identification_tips = 'Hojas casi esféricas, opuestas y de gris azulado
Tacto pegajoso por los pelillos glandulosos
Flores blancas con finas venas rosadas',
  s.seasonality = 'Verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Sedum_dasyphyllum_(1)_6.jpg?width=1280',
  s.image_attribution = 'Ghislain118 http://www.fleurs-des-montagnes.net (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Sedum dasyphyllum';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Melica menor',
  s.primary_habitat = 'Grietas de roquedos calizos, cornisas y pies de cantil sombreados',
  s.description = 'Gramínea perenne y grácil que crece en repisas y fisuras de roca, formando matas laxas de hojas finas. Su inflorescencia es una panícula abierta y ligera, con espiguillas nacaradas que brillan a contraluz. Es una de las pocas gramíneas que prospera en pared vertical.',
  s.identification_tips = 'Panícula muy laxa, casi transparente al trasluz
Espiguillas brillantes y algo nacaradas
Crece en grietas de roca, colgando de la pared',
  s.seasonality = 'Primavera',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/626575126/original.jpg',
  s.image_attribution = 'Piermario Maculan (CC0) · GBIF',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Melica minuta';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Oeosporangium pteridioides',
  s.primary_habitat = NULL,
  s.description = NULL,
  s.identification_tips = '',
  s.seasonality = 'Octubre a junio',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Oeosporangium_pteridioides.jpg?width=1280',
  s.image_attribution = 'Marc Riera (CC BY 4.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Oeosporangium pteridioides';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Esparto',
  s.primary_habitat = 'Laderas secas y llanos sobre suelos pobres; forma espartales extensos',
  s.description = 'El esparto, nombrado también como Stipa tenacissima, forma matas densas y duraderas que dan nombre a los espartales, uno de los paisajes característicos del sureste ibérico. Sus hojas se enrollan sobre sí mismas en los días secos para perder menos agua y se abren tras la lluvia. Durante siglos se recolectó para hacer cuerdas, esteras y alpargatas.',
  s.identification_tips = 'Matas grandes y compactas de hojas duras enrolladas
Las hojas se abren tras la lluvia y se enrollan al secar
Espigas altas y plateadas a final de primavera',
  s.seasonality = 'Primavera (espigado)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Stipa_tenacissima.jpg?width=1280',
  s.image_attribution = 'autor no indicado (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Macrochloa tenacissima';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Tomillo',
  s.primary_habitat = 'Tomillares, pastizales secos y claros de matorral sobre suelos pobres',
  s.description = 'Tomillo de hojas estrechas y con pelos largos en la base, que forma matas bajas y ramificadas. Es la especie de la que se extrae buena parte del tomillo de uso culinario y de la que se destila aceite esencial rico en timol.',
  s.identification_tips = 'Hojas estrechas con pelos largos y blancos en la base
Espigas de flores blancas o rosadas al final de las ramas
Aroma potente, el clásico del tomillo de cocina',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Thymus_zygis_1.JPG?width=1280',
  s.image_attribution = 'Ximenex (CC BY-SA 2.1 es) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Thymus zygis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Labiérnago',
  s.primary_habitat = 'Matorral mediterráneo y laderas secas sobre suelos pedregosos',
  s.description = 'Arbusto de hojas opuestas, estrechas y coriáceas, muy parecido a un acebuche pero con las hojas verdes por ambas caras. Sus frutos son pequeñas drupas azuladas o negras que consumen zorzales y currucas.',
  s.identification_tips = 'Hojas opuestas y estrechas, verdes por las dos caras
Sin el reverso plateado del acebuche
Frutos pequeños azulados o negros',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Phyllirea_angustifolia.jpg?width=1280',
  s.image_attribution = 'autor no indicado (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Phillyrea angustifolia';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cosentinia vellea',
  s.primary_habitat = 'Grietas de roquedos secos y soleados, paredones y pedregales',
  s.description = 'Helecho pequeño cubierto por completo de una densa lana parda que le da aspecto afieltrado y le permite sobrevivir en roca seca y al sol. En sequía se enrolla sobre sí mismo hasta parecer muerto, y se despliega en cuanto llueve.',
  s.identification_tips = 'Frondes cubiertas de lana parda, aspecto afieltrado
Se enrolla en verano y revive con la lluvia
En roca seca y soleada, no en umbrías húmedas',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Cosentinia_vellea_kz02.jpg?width=1280',
  s.image_attribution = 'Krzysztof Ziarnek, Kenraiz (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Cosentinia vellea';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Morsana',
  s.primary_habitat = 'Suelos removidos, cunetas, ramblas y bordes de saladar en clima árido',
  s.description = 'Hierba perenne de tallos gruesos y quebradizos con hojas carnosas partidas en dos folíolos redondeados, como dos gotas verdes enfrentadas. Coloniza suelos pisoteados y salinos, y sus frutos alargados, en forma de cápsula estriada, cuelgan durante buena parte del verano.',
  s.identification_tips = 'Hojas de solo dos folíolos carnosos y redondeados
Tallos hinchados en los nudos, que se quiebran con facilidad
Cápsulas alargadas y acostilladas colgando tras la floración',
  s.seasonality = 'Floración de primavera a verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Morsana-1.JPG?width=1280',
  s.image_attribution = 'Philmarin (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Zygophyllum fabago';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Olivarda',
  s.primary_habitat = 'Cunetas, taludes, ramblas y suelos removidos',
  s.description = 'Mata pegajosa y de olor penetrante que florece cuando casi todo lo demás está seco, cubriéndose de cabezuelas amarillas a finales de verano. Esa floración tardía la convierte en un refugio clave para insectos. Sus hojas dejan las manos resinosas al tocarlas.',
  s.identification_tips = 'Hojas pegajosas y aromáticas al tacto
Florece amarillo en pleno final de verano y otoño
Abundante en cunetas y terrenos alterados',
  s.seasonality = 'Verano y otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Inula_viscosa_flowers.jpg?width=1280',
  s.image_attribution = 'No machine-readable author provided. Rickjpelleg assumed (based on … (CC BY 2.5) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Dittrichia viscosa';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Polipodio',
  s.primary_habitat = 'Coloniza grietas de roquedos o muros sombríos y musgosos, así como troncos u horcaduras de árboles, desde tierra baja hasta 1500 (2000) m',
  s.description = 'Helecho perenne, con rizoma rastrero recubier to de escamas de color castaño (páleas). Las frondes pueden alcanzar 50 cm; presentan una lámina a veces deltoide, de color verde tierno, que suele sobrepasar la longitud del pecíolo; sus pinnas enfrentadas son agudas y las dos inferiores quedan reflejas. Al madurar forman, a cada lado del ner vio central, por el envés, una fila de montoncitos elípticos, amarillentos, que contienen los esporangios o soros.',
  s.identification_tips = '',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Polypodium_cambricum_''Oakley''.JPG?width=1280',
  s.image_attribution = 'Queeste (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Polypodium cambricum';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Lucema',
  s.primary_habitat = NULL,
  s.description = NULL,
  s.identification_tips = '',
  s.seasonality = 'Todo el año',
  s.image_url = NULL,
  s.image_attribution = NULL,
  s.rarity_score = 4
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Teucrium libanitis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Mata del vizque',
  s.primary_habitat = 'Ríos mediterráneos con Glaucium flavum',
  s.description = 'Compuesta blanco-tomentosa de capítulos amarillos, pionera de gravas y arenas de rambla; extendida por toda la Región de Murcia.',
  s.identification_tips = 'Aspecto blanco-lanoso
Capítulos amarillos
Coloniza gravas removidas de cauce',
  s.seasonality = 'Primavera a otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/114Andryala_ragusina.JPG?width=1280',
  s.image_attribution = 'Ziegler175 Rose Ziegler (CC0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Andryala ragusina';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Culebra viperina',
  s.primary_habitat = 'Se trata de una culebra que frecuenta ríos, riachuelos, pantanos, balsas y marismas, siendo menos frecuente lejos de los puntos de agua',
  s.description = 'Serpiente de tamaño medio, cola corta y cabeza ensanchada y bien delimitada respecto al resto del cuerpo. Generalmente hay dos escamas preoculares y dos postoculares, 7 escamas supralabiales y 9 escamas infralabiales. Dorsales claramente carenadas. El diseño es muy llamativo pues se trata de una amplia banda en forma de zig zag que recorre todo el cuerpo en posición dorsal. Existe un patrón alternativo que consiste en dos líneas longitudinales y paralelas, de colores claros, de recorrido también dorsal. El diseño rayado es más frecuente hacia el sur de la península y la costa mediterránea, aunque poblaciones muy cercanas pueden tener frecuencias muy dispares. La coloración corporal de fondo es variable aunque destacan los tonos verdosos, pardos y oliváceos. El vientre es generalmente gris amarillento con manchas oscuras en forma de diseño ajedrezado. Las hembras son mayores pero la longitud de cola y el número de subcaudales son mayores en machos. Longitud total máxima en la Península Ibérica, 910 mm.',
  s.identification_tips = '',
  s.seasonality = 'Febrero a octubre',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Viperine_Snake_(Natrix_maura)_(14198769323).jpg?width=1280',
  s.image_attribution = 'Bernard DUPONT from FRANCE (CC BY-SA 2.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Natrix maura';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'ajete junciero',
  s.primary_habitat = NULL,
  s.description = NULL,
  s.identification_tips = '',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Allium_moschatum.jpg?width=1280',
  s.image_attribution = 'Александр Фатерыга (Alexander Fateryga) (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Allium moschatum';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cabra montés',
  s.primary_habitat = 'Roquedos, canchales y laderas escarpadas con matorral',
  s.description = 'Bóvido de montaña perfectamente adaptado a la roca: pezuñas con borde duro y almohadilla blanda que agarra en pendientes imposibles. Los machos lucen cuernos grandes, curvados hacia atrás y con abultamientos; las hembras los tienen cortos y rectos.',
  s.identification_tips = 'Machos con cuernos grandes curvados hacia atrás
Se mueve por cortados donde nada más puede subir
Excrementos en montoncitos de bolitas cilíndricas',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Capra_pyrenaica_in_Sierra_de_Guadarrama.jpg?width=1280',
  s.image_attribution = 'Thomas Holbach (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Capra pyrenaica';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Jarilla',
  s.primary_habitat = 'Tomillares y matorral raso sobre suelos calizos y margosos secos',
  s.description = 'Jarilla pequeña de hojas estrechas y grisáceas con el borde enrollado, que se cubre en primavera de flores amarillas efímeras. Como en todas las jarillas, los pétalos apenas duran una mañana y se renuevan cada día.',
  s.identification_tips = 'Hojas estrechas con el borde enrollado hacia abajo
Flores amarillas que duran solo unas horas
Mata baja y grisácea del tomillar',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Helianthemum_violaceum_habitus_SierraMadrona.jpg?width=1280',
  s.image_attribution = 'Javier martin (Public domain) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Helianthemum violaceum';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Albardín',
  s.primary_habitat = 'Estepas salinas, margas y suelos yesosos secos; forma albardinales',
  s.description = 'Gramínea perenne de hojas duras y punzantes que forma matas separadas sobre suelos salinos y margosos donde poco más prospera. Su inflorescencia es inconfundible: una espata blanca y sedosa que envuelve las flores como un capuchón de papel.',
  s.identification_tips = 'Espata blanca y sedosa envolviendo la espiga
Hojas rígidas terminadas en punta punzante
Matas espaciadas sobre suelo desnudo y claro',
  s.seasonality = 'Todo el año (espigado en primavera)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Lygeum_spartum-1.jpg?width=1280',
  s.image_attribution = 'Nanosanchez (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Lygeum spartum';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Hierba de la cruz',
  s.primary_habitat = 'Roquedos, pedregales y pastizales pedregosos de montaña',
  s.description = 'Pimpinela de base leñosa y hojas divididas en foliolos pequeños y dentados, con cabezuelas globosas de flores verdosas y rojizas que carecen de pétalos. Crece agarrada a la roca y a los pedregales calizos.',
  s.identification_tips = 'Cabezuelas globosas verdosas o rojizas, sin pétalos
Hojas divididas en muchos foliolos dentados
Base leñosa y porte compacto sobre roca',
  s.seasonality = 'Primavera',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/517007573/original.jpg',
  s.image_attribution = 'FloresdeMurcia.com (CC BY-NC 4.0) · GBIF/iNaturalist',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Poterium ancistroides';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Rabo de gato',
  s.primary_habitat = 'Tomillares y matorral raso sobre suelos calizos secos',
  s.description = 'Rabogato de tallos blanquecinos y flores agrupadas en verticilos separados, característico del sureste ibérico. Es un taxón raro y poco fotografiado: como otras labiadas del grupo, se ha usado tradicionalmente en infusiones.',
  s.identification_tips = 'Tallos y hojas cubiertos de pelusa blanca
Flores en anillos bien separados a lo largo del tallo
Brácteas anchas y algo punzantes bajo cada verticilo',
  s.seasonality = 'Primavera y verano',
  s.image_url = NULL,
  s.image_attribution = NULL,
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Sideritis bourgaeana';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cerraja fina',
  s.primary_habitat = 'Muros, taludes, cunetas y pies de roca en ambientes secos y alterados',
  s.description = 'Cerraja de hojas muy divididas en segmentos estrechos, casi filiformes, que la distinguen de sus parientes de hoja ancha. Brota en cualquier grieta o talud, suelta látex blanco al partirla y florece prácticamente todo el año en clima cálido.',
  s.identification_tips = 'Hojas partidas en segmentos muy estrechos y separados
Látex blanco abundante al romper el tallo
Capítulos amarillo pálido y vilanos sedosos y blancos',
  s.seasonality = 'Casi todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Sonchus_tenerrimus_01.JPG?width=1280',
  s.image_attribution = 'Luca Fornasari (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Sonchus tenerrimus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Sanjuán blanco',
  s.primary_habitat = 'Bosques y pinares con sombra y hojarasca, sobre suelos calizos',
  s.description = 'Orquídea de porte erguido con hojas largas y estrechas dispuestas en dos filas y flores blancas que apenas llegan a abrirse del todo. Vive en la penumbra del bosque y depende de hongos del suelo para germinar y crecer.',
  s.identification_tips = 'Flores blancas semicerradas, en espiga laxa
Hojas largas y estrechas en dos filas
En sombra de bosque, sobre hojarasca',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Cephalanthera_longifolia_300508.jpg?width=1280',
  s.image_attribution = 'Bernd Haynold (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Cephalanthera longifolia';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Vidriera',
  s.primary_habitat = 'Matorral, pedregales y laderas soleadas sobre suelos calizos',
  s.description = 'Dedalera leñosa en la base, con hojas estrechas, brillantes y de borde entero, muy distinta de las digitales de hoja ancha. Sus flores son tubos colgantes de un naranja rojizo con manchas oscuras en el interior. Toda la planta es tóxica.',
  s.identification_tips = 'Flores en dedal de color naranja rojizo
Hojas estrechas, lustrosas y de borde liso
Base leñosa, no herbácea',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Digitalis_obscura_1.jpg?width=1280',
  s.image_attribution = 'Cillas (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Digitalis obscura';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Sapo corredor',
  s.primary_habitat = 'Ramblas y zonas húmedas estacionales',
  s.description = 'Sapo de patas cortas que corre en vez de saltar, con una línea amarilla nítida a lo largo del centro del lomo. Se reproduce en charcas efímeras que se llenan con las lluvias, y los machos forman coros de un canto vibrante y estridente que se oye a kilómetros.',
  s.identification_tips = 'Raya amarilla continua por el centro del lomo
Corre a cuatro patas en vez de saltar
Canto nocturno vibrante y muy sonoro tras las lluvias',
  s.seasonality = 'Otoño e invierno lluviosos',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Epidalea_calamita_02_by-dpc.jpg?width=1280',
  s.image_attribution = 'David Perez (CC BY 3.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Epidalea calamita';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Fagonia',
  s.primary_habitat = 'Suelos pedregosos, ramblas y litosuelos de clima árido',
  s.description = 'Planta baja y tendida, de tallos angulosos, hojas divididas en tres y estípulas convertidas en espinas finas. Sus flores tienen cinco pétalos de un lila rosado que se abren durante las horas centrales del día. Es de estirpe norteafricana y aquí vive en el extremo de su área.',
  s.identification_tips = 'Porte tendido y desordenado, pegado al suelo
Hojas de tres foliolos con espinas en la base
Flores lila con cinco pétalos bien separados',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Fagonia_cretica.jpg?width=1280',
  s.image_attribution = 'Retama (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Fagonia cretica';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Culebra de herradura',
  s.primary_habitat = 'Matorral termomediterráneo semiárido',
  s.description = 'Culebra ágil y trepadora con dibujo dorsal en herradura, ligada a matorrales termófilos y roquedos soleados del sureste ibérico.',
  s.identification_tips = 'Manchas dorsales en herradura
Ágil y trepadora
Inofensiva para las personas',
  s.seasonality = 'Primavera a otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Hemorrhois_hippocrepis_121004.jpg?width=1280',
  s.image_attribution = 'Accipiter (R. Altenkamp, Berlin) (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Hemorrhois hippocrepis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Encina',
  s.primary_habitat = 'Bosques y matorrales mediterráneos sobre suelos variados, en clima no extremo',
  s.description = 'Árbol perennifolio de copa densa y redondeada, con hojas coriáceas verde oscuro por el haz y blanquecinas y afieltradas por el envés. Las hojas jóvenes y las de las ramas bajas tienen el borde espinoso, un mecanismo de defensa frente a los herbívoros.',
  s.identification_tips = 'Envés de la hoja blanquecino y afieltrado
Hojas de las ramas bajas con borde espinoso
Copa densa y oscura, muy cerrada a la luz',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Carrasca_de_la_Raboseras.JPG?width=1280',
  s.image_attribution = 'Picamaderos (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Quercus ilex';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Brochera pegajosa',
  s.primary_habitat = 'Vive en tomillares sobre yesos, hasta 600 m',
  s.description = 'Planta de 15-45 cm, cubierta de glandulas sésiles, por lo que resulta pegajosa, con tallos densamente foliosos, hojas de 8-25 mm, con largo pecíolo, pinnatisectas con cinco hileras de segmentos, las superiores lineares. Capítulos numerosos, solitarios en cada escapo, de 5-10 mm de diámetro, subglobosos, con varias filas de brácteas. Florecillas todas tubulares, glandulosas, amarillas. Aquenios 1,2-1,5 mm, angulosos, sin vilano.',
  s.identification_tips = '',
  s.seasonality = 'Marzo a julio',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Santolina_viscosa_kz01.jpg?width=1280',
  s.image_attribution = 'Krzysztof Ziarnek, Kenraiz (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Santolina viscosa';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Boja negra',
  s.primary_habitat = 'Matorrales halo-nitrófilos',
  s.description = 'Mata aromática grisácea de las bojas del sureste árido, colonizadora de suelos alterados, bordes de camino y matorrales nitrificados.',
  s.identification_tips = 'Olor aromático fuerte al frotar
Follaje gris-plateado
Indica suelos alterados',
  s.seasonality = 'Otoño',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/173279674/original.jpeg',
  s.image_attribution = 'Yamil J.R (CC0) · GBIF',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Artemisia barrelieri';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Fresno',
  s.primary_habitat = 'Vive sobre sustratos frescos y en general profundos, hasta 1400 m',
  s.description = 'Árbol hasta de 20 m, caducifolio, con corteza grisácea, agrietada. Hojas de 10-30 cm, compuestas imparipinnadas, con siete a 13 folíolos hasta de 9 cm, lanceolados o elípticos, levemente dentados, pecioladas. Flores dispuestas en racimos axilares, simplificadas, minúsculas, unisexuales o hermafroditas, con dos estambres casi sentados y un estilo con estigma bilobulado. Fruto en sámara hasta de 5 cm, alada por los bordes.',
  s.identification_tips = '',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Fresno_(Colmenar_Viejo).jpg?width=1280',
  s.image_attribution = 'Wiki LIC (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Fraxinus angustifolia';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Klasea flavescens',
  s.primary_habitat = 'Pastizales secos, claros de matorral y taludes sobre suelos margosos',
  s.description = 'Compuesta de hojas divididas y algo espinosas, con capítulos grandes de flores amarillas rodeados de brácteas secas y brillantes. A distancia recuerda a un cardo, pero sus hojas pinchan mucho menos.',
  s.identification_tips = 'Capítulos amarillos grandes y solitarios
Brácteas secas y algo brillantes bajo la flor
Hojas divididas, con dientes poco punzantes',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Klasea_flavescens0001_01.jpg?width=1280',
  s.image_attribution = 'Philmarin (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Klasea flavescens';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'escorzonerilla falsa',
  s.primary_habitat = NULL,
  s.description = NULL,
  s.identification_tips = '',
  s.seasonality = 'Marzo a julio',
  s.image_url = NULL,
  s.image_attribution = NULL,
  s.rarity_score = 3
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Launaea pumila';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Collejón',
  s.primary_habitat = NULL,
  s.description = NULL,
  s.identification_tips = '',
  s.seasonality = 'Enero a junio',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Moricandia_moricandioides_2018-10-22_3399.jpg?width=1280',
  s.image_attribution = 'Salicyna (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Moricandia moricandioides';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Labiérnago prieto',
  s.primary_habitat = 'Encinares, matorral alto y umbrías sobre suelos pedregosos',
  s.description = 'Arbusto o arbolillo de hojas opuestas, coriáceas y de borde dentado, más anchas que las de su pariente de hoja estrecha. Las hojas jóvenes son marcadamente dentadas y las adultas casi enteras, lo que despista con frecuencia.',
  s.identification_tips = 'Hojas opuestas y anchas, dentadas en las ramas jóvenes
Verde oscuro por las dos caras
Frutos pequeños azul negruzcos',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Phillyrea_latifolia.jpg?width=1280',
  s.image_attribution = 'autor no indicado (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Phillyrea latifolia';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cerrajón',
  s.primary_habitat = 'Suelos arenosos, ramblas y terrenos removidos en clima cálido y seco',
  s.description = 'Hierba anual de aspecto lampiño con capítulos amarillos que llevan en el centro una mancha oscura, casi negra, como un ojo. Al cortar el tallo suelta látex blanco, rasgo compartido con las cerrajas y los dientes de león.',
  s.identification_tips = 'Capítulo amarillo con el centro oscuro, casi negro
Látex blanco al partir el tallo o una hoja
Brácteas anchas y membranosas en el borde, bajo la flor',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Reich-ting-2.jpg?width=1280',
  s.image_attribution = 'Philmarin (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Reichardia tingitana';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Pijolobo',
  s.primary_habitat = 'Saladares, estepas salinas y matorrales halófilos, sobre las raíces de quenopodiáceas',
  s.description = 'Planta sin una sola hoja verde: no hace fotosíntesis y vive enganchada a las raíces de las sosas y los almajos del saladar, de los que toma agua y alimento. Todo el año es invisible bajo tierra y, en primavera, saca de golpe una espiga carnosa de hasta medio metro cubierta de grandes flores amarillas, un espectáculo desconcertante en un suelo desnudo y salado. En Águilas y su comarca se la conoce como pijolobo; en el resto del sureste, como jopo de lobo.',
  s.identification_tips = 'Espiga carnosa amarilla que brota directamente del suelo, sin tallo con hojas
Escamas pardas en vez de hojas a lo largo del tallo
Siempre al pie de una sosa, un almajo o un salado: es su hospedador',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/CistanchePhelypaea.jpg?width=1280',
  s.image_attribution = 'Ziegler175 (Public domain) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Cistanche phelypaea';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Bolina',
  s.primary_habitat = 'Matorral y laderas soleadas de montaña media, sobre suelos calizos',
  s.description = 'Retama de ramas finas, sedosas y de un verde grisáceo, sin espinas, que en floración se cubre de flores amarillas fragantes. Sus hojas son diminutas y caen pronto: la fotosíntesis la hacen los tallos.',
  s.identification_tips = 'Ramas finas y flexibles, sin espinas
Aspecto grisáceo por los pelos sedosos de las ramillas
Floración amarilla abundante y perfumada',
  s.seasonality = 'Primavera y principio de verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Genista_cinerea26de_maig_2007_019.jpg?width=1280',
  s.image_attribution = 'Victor M. Vicente Selvas (Public domain) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Genista cinerea';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Jarilla de Almería',
  s.primary_habitat = 'Tomillares y matorral abierto sobre suelos secos y pedregosos',
  s.description = 'Jarilla enana de hojas pequeñas y blanquecinas, cubiertas de pelos que reflejan la luz y reducen la pérdida de agua. En primavera se cubre de flores blancas con el centro amarillo, cuyos pétalos duran apenas una mañana. Sus raíces se asocian con hongos comestibles del desierto.',
  s.identification_tips = 'Mata baja y grisácea, de hojas muy pequeñas
Flores blancas con el centro amarillo, efímeras
Pétalos arrugados, como de papel de seda',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Helianthemum_almeriense_flor.jpg?width=1280',
  s.image_attribution = 'Retama (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Helianthemum almeriense';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Leucanto litoral',
  s.primary_habitat = 'Fisuras y repisas de roquedos calizos, sobre todo en umbrías',
  s.description = 'Margarita rupícola de hojas carnosas y recortadas que crece agarrada a las grietas de la roca. Sus flores son las clásicas cabezuelas de centro amarillo y lígulas blancas. Es un endemismo del sureste ibérico y del norte de África, de área muy pequeña.',
  s.identification_tips = 'Crece en grietas de pared rocosa, no en el suelo
Hojas algo carnosas y recortadas en dientes
Cabezuelas blancas de centro amarillo, solitarias',
  s.seasonality = 'Primavera',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/614232981/original.jpg',
  s.image_attribution = 'faluke (CC BY-NC 4.0) · iNaturalist/GBIF',
  s.rarity_score = 4
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Mauranthemum decipiens';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Rascavieja',
  s.primary_habitat = 'Matorral seco y laderas soleadas sobre suelos pedregosos',
  s.description = 'Leguminosa arbustiva y pegajosa, con hojas de tres foliolos y racimos densos y erguidos de flores de un amarillo intenso. Es un endemismo del sur peninsular y del norte de África, y una de las plantas más vistosas del matorral en plena floración.',
  s.identification_tips = 'Racimos densos y erguidos de flores amarillo vivo
Toda la planta pegajosa por los pelos glandulosos
Hojas de tres foliolos dentados',
  s.seasonality = 'Primavera',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/184117054/original.jpeg',
  s.image_attribution = 'Santiago Martín-Bravo (CC BY 4.0) · iNaturalist/GBIF',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Ononis speciosa';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Sabina de Cartagena',
  s.primary_habitat = NULL,
  s.description = NULL,
  s.identification_tips = '',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Sandarac_Tree_(Tetraclinis_articulata)_-_Cartagena%2C_Spain_2024-02-05_(01).jpg?width=1280',
  s.image_attribution = 'Ryan Hodnett (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Tetraclinis articulata';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Lagartija colirroja',
  s.primary_habitat = 'Matorral litoral y laderas secas',
  s.description = 'Lagartija de suelos arenosos, de cuerpo aplanado y dedos con escamas laterales en forma de peine que le sirven de raqueta sobre la arena suelta. Los jóvenes tienen la cola y las patas traseras de un rojo intenso que se apaga en los adultos.',
  s.identification_tips = 'Dedos con flecos de escamas a los lados, como peines
Jóvenes con cola y patas traseras rojo intenso
Cuerpo aplanado, con rayas y ocelos claros en el dorso',
  s.seasonality = 'Primavera a otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Benny_Trapp_Acanthodactylus_erythrurus.jpg?width=1280',
  s.image_attribution = 'Benny Trapp (CC BY 3.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Acanthodactylus erythrurus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Jara pringosa',
  s.primary_habitat = 'Se encuentra formando jarales sobre sustratos silíceos pobres, con suelos poco desarrollados, hasta 1500 m',
  s.description = 'Arbusto hasta de 3 m, muy leñoso, con corteza que se desprende en tiras. Hojas de 4-8 x 1-2 cm, lanceoladas, coriáceas, con nervio central marcado y con pelos estrellados por el envés, impregnadas de una sustancia pegajosa y aromática llamada ládano. Flores abiertas, con cinco pétalos de 3-5 cm, blancos, con una mancha amarilla en la base, a veces con una más oscura, con muchos estambres cortos que forman una corona. Fruto en cápsula de 1-1,5 cm, esférica, que se abre por diez valvas. Semillas minúsculas, negras.',
  s.identification_tips = '',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Aracena_-_Cistus_ladanifer_01.jpg?width=1280',
  s.image_attribution = 'Basotxerri (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Cistus ladanifer';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Culebra lisa meridional',
  s.primary_habitat = 'Se encuentra desde el nivel del mar, pero es más frecuente en claros de bosque y matorral mediterráneo en zonas de media montaña',
  s.description = 'La culebra lisa meridional Coronella girondica es de pequeño tamaño, cabeza pequeña y cola relativamente corta. En general hay 21 hileras de dorsales aunque es frecuente observar 19 hileras en ejemplares de las cordilleras béticas. Dorso y flancos generalmente de color pardo o gris, con una hilera de manchas transversales por el dorso. En el vientre destacan unas manchas cuadradas oscuras en un diseño ajedrezado. En la parte dorsal de la cabeza hay una gran mancha en forma de U, y a ambos lados de la cabeza, una brida oscura que atraviesa el ojo y se prolonga por delante de la placa frontal uniendo las manchas de ambos lados. No hay dimorfismo sexual en la longitud cabeza-cloaca ni en la folidosis cefálica. En cambio se aprecian ligeras diferencias en el número de dorsales (19 hileras más frecuente en machos) y ventrales (más en hembras), pero sobre todo en la cola (mayor longitud relativa y mayor número de subcaudales en machos). No hay subespecies descritas, pero se aprecian diferencias poblacionales en el número de ventrales. En machos, se observa una clina latitudinal en la longitud de hocico-cloaca y número de ventrales, siendo mayores los ejemplares más septentrionales. Longitud total máxima en la Península Ibérica, 800 mm.',
  s.identification_tips = '',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/BennyTrapp_Coronella_girondica.jpg?width=1280',
  s.image_attribution = 'Benny Trapp (CC BY 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Coronella girondica';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Conejo',
  s.primary_habitat = 'Matorral termomediterráneo semiárido',
  s.description = 'Lagomorfo excavador que vive en madrigueras coloniales; pieza clave del ecosistema mediterráneo como presa de águila perdicera, búho real y carnívoros.',
  s.identification_tips = 'Excava madrigueras coloniales
Presa clave de rapaces
Activo al amanecer y atardecer',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Oryctolagus_cuniculus_Tasmania_2.jpg?width=1280',
  s.image_attribution = 'JJ Harrison (https://www.jjharrison.com.au/) (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Oryctolagus cuniculus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cardo amarillo de roca',
  s.primary_habitat = 'Roquedos y fisuras calcáreas costeras',
  s.description = 'Compuesta rupícola que crece colgando de las fisuras de los cantiles calizos, con hojas divididas y algo carnosas y capítulos amarillos rodeados de brácteas con apéndices espinosos. Es un endemismo del sureste ibérico ligado a paredes de roca costeras y de interior.',
  s.identification_tips = 'Capítulos amarillos con brácteas de apéndice espinoso
Hojas divididas y algo carnosas, en roseta colgante
Crece encajada en la grieta, no en el suelo',
  s.seasonality = 'Floración primaveral',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Centaurea_saxicola674.jpg?width=1280',
  s.image_attribution = 'Nanosanchez (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Centaurea saxicola';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Jara blanca',
  s.primary_habitat = 'Matorral y jarales sobre suelos secos y soleados de montaña media',
  s.description = 'Arbusto de hojas anchas, ovaladas y cubiertas de una pelusa plateada que le da un aspecto casi blanco. En primavera se llena de flores amarillas de cinco pétalos con una mancha oscura en la base. Es un endemismo del sur y sureste peninsular.',
  s.identification_tips = 'Hojas anchas y plateadas, no estrechas como las jaras
Flores amarillas con una manchita oscura en la base del pétalo
Porte erguido, más alto que las jarillas comunes',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Halimium_commutatum1.jpg?width=1280',
  s.image_attribution = 'Ximenex (CC BY-SA 2.1 es) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Cistus atriplicifolius';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Pincelillo',
  s.primary_habitat = NULL,
  s.description = NULL,
  s.identification_tips = '',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Hypericum_ericoides_fruto.jpg?width=1280',
  s.image_attribution = 'Retama 11:14, 14 April 2007 (UTC) (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Hypericum ericoides';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Ononis ornithopodioides',
  s.primary_habitat = 'Pastizales anuales y claros de matorral sobre suelos secos',
  s.description = 'Pequeña leguminosa anual de tallos finos y glandulosos, con hojas de tres foliolos y flores amarillas diminutas. Sus legumbres, curvadas y dispuestas en grupo, recuerdan a los dedos de una pata de pájaro, lo que le da el nombre científico.',
  s.identification_tips = 'Legumbres curvas agrupadas, como una pata de ave
Flores amarillas muy pequeñas
Tallos pegajosos al tacto, con pelos glandulosos',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Ononis_ornithopodioides_kz1.jpg?width=1280',
  s.image_attribution = 'Krzysztof Ziarnek, Kenraiz (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Ononis ornithopodioides';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Abejera',
  s.primary_habitat = NULL,
  s.description = NULL,
  s.identification_tips = '',
  s.seasonality = 'Marzo a junio',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Ophrys_sphegodes_(as_Ophrys_aranifera)_-_Bot._Reg._14_pl._1197_(1828).jpg?width=1280',
  s.image_attribution = 'Designer: M. Hart - Engraver: J. Watts (Public domain) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Ophrys sphegodes';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Escila de otoño',
  s.primary_habitat = NULL,
  s.description = NULL,
  s.identification_tips = '',
  s.seasonality = 'Agosto a noviembre',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Scilla_autumnalis0.jpg?width=1280',
  s.image_attribution = 'autor no indicado (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Prospero autumnale';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Olmo común',
  s.primary_habitat = 'Sotos, vegas y suelos profundos con humedad freática',
  s.description = 'Árbol de hojas asimétricas en la base —un lado baja más que el otro— y borde doblemente aserrado. Florece antes de echar la hoja y fructifica en sámaras redondeadas y membranosas. La grafiosis ha diezmado sus poblaciones adultas.',
  s.identification_tips = 'Base de la hoja claramente asimétrica
Sámaras redondas y papiráceas antes que las hojas
Rebrota de raíz formando setos y orlas',
  s.seasonality = 'Primavera a otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Blismes_elm_2007.jpg?width=1280',
  s.image_attribution = 'Eric Collin. Original uploader was Ptelea at en.wikipedia (GFDL) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Ulmus minor';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cuchareta',
  s.primary_habitat = 'Pastizales anuales, eriales y suelos margosos removidos en clima árido',
  s.description = 'Crucífera anual de flores blanquecinas con nervios violáceos, inconfundible por su fruto: una vainita corta rematada por una lengüeta plana y curvada que recuerda a una cuchara. Los frutos secos persisten sobre la planta y son la mejor pista para identificarla.',
  s.identification_tips = 'Frutos con una pala plana en el extremo, como cucharillas
Hojas muy divididas, de segmentos estrechos
Planta anual pelosa, de pocos decímetros, en suelo pelado',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Carrichtera_annua2.JPG?width=1280',
  s.image_attribution = 'Flora y Vegetación de Lanzarote (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Carrichtera annua';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Majuelo',
  s.primary_habitat = 'En claros y orlas de bosques, como encinares, alcornocales, quejigares, melojares, robledales, o formando setos, en barrancos, zarzales y espinares',
  s.description = 'Pequeño árbol de 5-6 (10) m, caducifolio, de corteza lisa y grisácea, de porte irregular y copa redondeada. Ramas jóvenes a veces con espinas hasta de 2-2,5 cm. Hojas 20-50 x 8-50 mm, con pecíolo de 1-3 cm, obovado-espatuladas, con 1-3 pares de lóbulos laterales, dentadas por arriba, cuneadas en la base, más o menos pelosas. Inflorescencias en ramilletes corimbiformes, pediceladas, con 5-10 (12) flores, de 1-1,5 cm diámetro. Cáliz con sépalos de 1,5-4,5 x 1,5-2,5 mm. Pétalos de 4-8 x 4-7 mm blancos o algo coloreados. Estambres 15-20, con las anteras de color púrpura. Fruto de 5,5-12 x 5-10 mm, en pomo, globoso, con un hueso o pireno.',
  s.identification_tips = '',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Crataegus_monogyna_-_Common_hawthorn.jpg?width=1280',
  s.image_attribution = 'autor no indicado (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Crataegus monogyna';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Acelguilla espinosa',
  s.primary_habitat = 'Pastizales secos, suelos margosos y salinos en clima árido',
  s.description = 'Saladilla anual pequeña, con una roseta de hojas ásperas al tacto y tallos ramificados en zigzag que llevan las flores en espiguillas cortas. Las flores, blanquecinas o violáceas, conservan el cáliz seco y papiráceo mucho después de marchitarse.',
  s.identification_tips = 'Hojas de la roseta ásperas, con pelillos duros
Tallos en zigzag, con ramas divaricadas
Cálices secos y papiráceos persistiendo tras la flor',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Limonium_echioides233.JPG?width=1280',
  s.image_attribution = 'Nanosanchez (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Limonium echioides';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cornicabra',
  s.primary_habitat = 'Barrancos, umbrías y matorral alto sobre suelos frescos',
  s.description = 'Arbusto o arbolillo de hoja caduca, con hojas compuestas de foliolos grandes y brillantes y un raquis sin alas, lo que lo separa del lentisco. Suele presentar agallas rojizas y curvadas en forma de cuerno, provocadas por pulgones, que le dan el nombre.',
  s.identification_tips = 'Agallas rojizas curvadas como cuernos en las hojas
Pierde la hoja en invierno, al contrario que el lentisco
Hoja compuesta con foliolo terminal y raquis sin alas',
  s.seasonality = 'Primavera a otoño (pierde la hoja en invierno)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Pistachier2.JPG?width=1280',
  s.image_attribution = 'greffer.net (CC BY 2.5) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Pistacia terebinthus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Culebra de escalera',
  s.primary_habitat = 'Ocupa todo tipo de suelos en ambientes mediterráneos de matorral y borde de bosque, pues precisa de cierta cobertura vegetal y de lugares relativamente húmedos',
  s.description = 'Longitud hocico-cloaca media de 720 mm (rango 233-1.385 mm), cola relativamente corta. Cabeza algo pequeña, con hocico agudo, que sobrepasa netamente el extremo anterior de la mandíbula. 27 rangos de escamas dorsales. Color de fondo amarillento, con diseño de manchas dorsales en escalera en los ejemplares pequeños, y dos líneas dorsolaterales en los ejemplares de mayor tamaño. Longitud total máxima, 1.650 mm.',
  s.identification_tips = '',
  s.seasonality = 'Febrero a noviembre',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Rhinechis_scalaris_cropped.jpg?width=1280',
  s.image_attribution = 'Benny_Trapp_Rhinechis_scalaris_Portugal.jpg: Benny Trapp derivative… (CC BY 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Zamenis scalaris';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Chaenorhinum grandiflorum',
  s.primary_habitat = NULL,
  s.description = NULL,
  s.identification_tips = '',
  s.seasonality = 'Enero a junio',
  s.image_url = NULL,
  s.image_attribution = NULL,
  s.rarity_score = 4
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Chaenorhinum grandiflorum';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Boja de las calenturas',
  s.primary_habitat = NULL,
  s.description = NULL,
  s.identification_tips = '',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/BUPLEURUM_FRUTISCENS_-_AGUDA_-_IB-327_(Botja_groga).JPG?width=1280',
  s.image_attribution = 'Isidre blanc (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Bupleurum fruticescens';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cephalanthera rubra',
  s.primary_habitat = NULL,
  s.description = NULL,
  s.identification_tips = '',
  s.seasonality = 'Mayo a julio',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Cephalanthera_rubra_02_Luxemburg.jpg?width=1280',
  s.image_attribution = 'Orchi (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Cephalanthera rubra';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cerambyx cerdo',
  s.primary_habitat = NULL,
  s.description = NULL,
  s.identification_tips = '',
  s.seasonality = 'Junio a agosto',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Ceramby_cerdo.jpg?width=1280',
  s.image_attribution = 'Xavier Vázquez (Public domain) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Cerambyx cerdo';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Espuelilla de yesos',
  s.primary_habitat = NULL,
  s.description = NULL,
  s.identification_tips = '',
  s.seasonality = 'Abril a junio',
  s.image_url = NULL,
  s.image_attribution = NULL,
  s.rarity_score = 4
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Chaenorhinum rupestre';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'achicoria falsa',
  s.primary_habitat = 'Habita sobre acantilados y laderas de naturaleza margo-arenosa muy deleznables junto a la línea de costa, en el piso termomediterráneo de ombroclima seco',
  s.description = 'Planta procumbente y multicaule, de base sufruticosa y hojas subcrasas, las inferiores liradopinnatipartidas y las superiores linear-lanceoladas. Tallos floríferos estriado-glandulosos, subáfilos y engrosados por debajo del capítulo. Brácteas del involucro oblongas, con apéndice semilunar y con 9-11 cilios. Aquenios de 4x2 mm, negruzcos, glabrescentes y con vilano de hasta 3 mm de longitud.',
  s.identification_tips = '',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Cheirolophus_intybaceus_kz01.jpg?width=1280',
  s.image_attribution = 'Krzysztof Ziarnek, Kenraiz (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Cheirolophus intybaceus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Jara de Cartagena',
  s.primary_habitat = NULL,
  s.description = 'Arbusto 80-120 cm, muy ramoso, perennifolio, de vida larga (30 años o más). Tallos con pelos estrellados y algunos simples, largos. Hojas 5-20 x 2-10 mm, sésiles o subsésiles, elíptico-lanceoladas, las adultas vellosas, falciformes y con el borde fuertemente revuelto hacia el envés. Sépalos acuminados, seríceos. Pétalos rosados. Estilo sobresaliente entre los estambres. Cápsula 7-9 mm, globosa. Semillas 1-2 mm, angulosas, papilosas, de color marrón claro.',
  s.identification_tips = '',
  s.seasonality = NULL,
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Cistus_heterophyllus2.jpg?width=1280',
  s.image_attribution = 'Nanosanchez (Public domain) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Cistus heterophyllus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Jara cervuna',
  s.primary_habitat = 'Jarales y claros de bosque sobre suelos silíceos o descarbonatados',
  s.description = 'Jara de hojas anchas y acorazonadas con peciolo, parecidas a las de un chopo, lo que la hace inconfundible entre las jaras ibéricas. Sus flores son blancas, grandes y con el centro amarillo, y salen agrupadas en el extremo de las ramas.',
  s.identification_tips = 'Hojas anchas y acorazonadas, con peciolo largo
Flores blancas grandes con el centro amarillo
Sépalos externos grandes y muy visibles en el capullo',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Cistus_populifolius.jpg?width=1280',
  s.image_attribution = 'Taken by Carsten Niehaus (user:Lumbar). (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Cistus populifolius';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cardo mancaperros',
  s.primary_habitat = 'Pastizales secos, eriales y suelos margosos pisoteados',
  s.description = 'Cardo corredor anual, muy espinoso y rígido, con hojas duras parecidas a las de la encina —de ahí el nombre— y cabezuelas espinosas azuladas rodeadas de brácteas punzantes. Al secarse se vuelve leñoso y persiste todo el verano pinchando a quien pase.',
  s.identification_tips = 'Hojas rígidas y espinosas, recortadas como las de la encina
Cabezuelas con brácteas largas y punzantes en estrella
Tonos azulados en las brácteas durante la floración',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Eryngium_ilicifolium_InflorescenceCloseup2_DehesaBoyaldePuertollano.jpg?width=1280',
  s.image_attribution = 'Javier martin (Public domain) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Eryngium ilicifolium';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'flor del príncipe',
  s.primary_habitat = 'Vive en sustratos yesíferos secos, entre 40-900 m',
  s.description = 'Perenne sufruticosa, de 10-40 cm; cubierta de escamas peltadas, plateadas, con tallo tetragonal. Hojas de 8-25 x 3-10 mm, de oblongo a lineares, pecioladas, opuestas, estipuladas. Pétalos de 3,5-5 mm, amarillos. Cápsula de 3-3,5 mm, tomentosa arriba.',
  s.identification_tips = '',
  s.seasonality = 'Octubre, noviembre, diciembre, marzo, abril, mayo, junio, julio',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Helianthemum_squamatum_1_(Espagne).jpg?width=1280',
  s.image_attribution = 'Ghislain118 http://www.fleurs-des-montagnes.net (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Helianthemum squamatum';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Salamanquesa rosada',
  s.primary_habitat = 'Pendientes rocosas calcícolas con vegetación casmofítica',
  s.description = 'Gecko pequeño y translúcido de tonos rosados, de hábitos nocturnos, que se refugia en grietas de roquedos, muros de piedra y ruinas.',
  s.identification_tips = 'Piel rosada casi translúcida
Cola con anillos espinosos
Nocturna y discreta',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Hemidactylus_turcicus_on_a_wall_in_Greece.jpg?width=1280',
  s.image_attribution = 'Koppi2 (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Hemidactylus turcicus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Galápago leproso',
  s.primary_habitat = 'Ríos, charcas, balsas y tramos remansados con vegetación y soleaderos',
  s.description = 'Galápago de agua con el caparazón aplanado y de color verde oliva a pardo, a menudo cubierto de algas. Los ejemplares jóvenes muestran manchas anaranjadas en el cuello y en los lados de la cabeza que se van apagando con la edad. Toma el sol sobre piedras y troncos y se lanza al agua al menor ruido.',
  s.identification_tips = 'Manchas anaranjadas en el cuello, más vivas de joven
Caparazón bajo y aplanado, a menudo con algas
Se tira al agua en cuanto detecta movimiento en la orilla',
  s.seasonality = 'Primavera a otoño (inactivo en invierno)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Mauremys_leprosa_03_by-dpc.jpg?width=1280',
  s.image_attribution = 'David Perez (CC BY 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Mauremys leprosa';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Bayón',
  s.primary_habitat = NULL,
  s.description = NULL,
  s.identification_tips = '',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Osyris_alba_1.JPG?width=1280',
  s.image_attribution = 'User:Xemenendura (CC BY-SA 2.1 es) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Osyris alba';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'poliol real',
  s.primary_habitat = NULL,
  s.description = NULL,
  s.identification_tips = '',
  s.seasonality = 'Todo el año',
  s.image_url = NULL,
  s.image_attribution = NULL,
  s.rarity_score = 3
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Teucrium buxifolium';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Lagarto ocelado',
  s.primary_habitat = 'Matorral termomediterráneo semiárido',
  s.description = 'El lagarto más grande de Europa, de hasta 60 cm con la cola incluida. Su dorso es verde con un fino reticulado negro y, en los costados, hileras de ocelos de un azul intenso. Los machos viejos tienen una cabeza enorme y maciza. Es diurno y muy desconfiado.',
  s.identification_tips = 'Ocelos azules alineados en los costados
Dorso verde con retícula negra muy fina
Tamaño grande y cabeza maciza en los machos adultos',
  s.seasonality = 'Primavera a otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Jewelled_Lizard_(Timon_lepidus)_male_found_under_a_stone_by_Jean_NICOLAS_(14166347788).jpg?width=1280',
  s.image_attribution = 'Bernard DUPONT from FRANCE (CC BY-SA 2.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Timon lepidus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Durillo',
  s.primary_habitat = 'Umbrías, barrancos y sotobosque de encinar y pinar húmedo',
  s.description = 'Arbusto de hojas perennes, opuestas y coriáceas, que florece en pleno invierno con corimbos de flores blancas nacidas de capullos rosados. Sus frutos son bayas de un azul metálico oscuro muy llamativo.',
  s.identification_tips = 'Florece en invierno, en corimbos blancos planos
Capullos rosados antes de abrir
Frutos azul metálico oscuro, casi negros',
  s.seasonality = 'Invierno y primavera (floración)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/T2_37_Viburnum_tinus_par_Pierre-Joseph_Redout%C3%A9.jpeg?width=1280',
  s.image_attribution = 'Pierre-Joseph Redouté (Public domain) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Viburnum tinus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'erguen',
  s.primary_habitat = 'Matorral y laderas soleadas sobre suelos secos y pedregosos',
  s.description = 'Arbusto espinoso y muy ramificado que en primavera se cubre por completo de flores amarillas. Sus ramas terminan en espinas fuertes y sus legumbres van cubiertas de pelos sedosos. Forma masas impenetrables que dan refugio a aves de matorral.',
  s.identification_tips = 'Ramas rematadas en espinas rígidas y punzantes
Floración amarilla masiva que cubre toda la mata
Legumbres cubiertas de pelos blancos y sedosos',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Calycotome_villosa1.jpg?width=1280',
  s.image_attribution = 'Ximenex (CC BY-SA 2.1 es) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Cytisus lanigerus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Guiraoa arvensis',
  s.primary_habitat = NULL,
  s.description = NULL,
  s.identification_tips = '',
  s.seasonality = 'Marzo a julio',
  s.image_url = NULL,
  s.image_attribution = NULL,
  s.rarity_score = 4
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Guiraoa arvensis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'albada',
  s.primary_habitat = NULL,
  s.description = NULL,
  s.identification_tips = '',
  s.seasonality = 'Abril a diciembre',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/GYPSOPHYLA_STRUTHIUM_-_EMPALOUS_-_IB-507_(Trincola).JPG?width=1280',
  s.image_attribution = 'Isidre blanc (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Gypsophila struthium';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Sosa jabonera',
  s.primary_habitat = 'Saladares muy salinos con encharcamiento estacional',
  s.description = 'Mata de tallos articulados y suculentos, con las ramas jóvenes agrupadas en apretados manojos que recuerdan a piñas diminutas, de donde le viene el nombre. Vive en los suelos más salinos del saladar, donde apenas compite con otras plantas.',
  s.identification_tips = 'Ramillas agrupadas en manojos con aspecto de piña
Tallos gruesos y articulados de color verde grisáceo
En las zonas más saladas y desnudas del saladar',
  s.seasonality = 'Verano y otoño',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/611359925/original.jpg',
  s.image_attribution = 'Xavier Rufray (CC BY-NC 4.0) · iNaturalist/GBIF · obs. EAU (revisar: existe en salinas de España)',
  s.rarity_score = 4
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Halocnemum strobilaceum';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cerrillo',
  s.primary_habitat = 'Laderas secas, ribazos y pastizales sobre suelos pedregosos',
  s.description = 'Gramínea perenne que forma matas y espiga en verano, cuando el resto del pastizal ya está agostado. Sus espiguillas van por parejas, cubiertas de pelos rojizos y con aristas retorcidas. Da al paisaje un tono dorado rojizo a final de verano.',
  s.identification_tips = 'Espiguillas peludas agrupadas por parejas
Aristas retorcidas y acodadas
Espiga en verano, cuando lo demás está seco',
  s.seasonality = 'Verano y otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Hyparrhenia_hirta_Habitus_ValledeAlcudia.jpg?width=1280',
  s.image_attribution = 'Javier martin (Public domain) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Hyparrhenia hirta';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Senecio flavus',
  s.primary_habitat = 'Ramblas, arenales y suelos removidos de clima árido',
  s.description = 'Hierba anual de hojas carnosas y algo azuladas, con cabezuelas amarillas cuyas lígulas se enrollan hacia atrás al abrirse. Es una planta de estirpe sahariana que en Europa solo aparece en los rincones más áridos del sureste ibérico, tras las lluvias.',
  s.identification_tips = 'Lígulas amarillas enrolladas hacia atrás
Hojas carnosas y de verde azulado
Aparece en masa tras las lluvias y desaparece pronto',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Senecio_flavus_1.jpg?width=1280',
  s.image_attribution = 'Gideon Pisanty (Gidip) גדעון פיזנטי (CC BY 3.0) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Senecio flavus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Taray de saladar',
  s.primary_habitat = 'Galerías y matorrales ribereños termomediterráneos',
  s.description = 'Taray de saladar de flores blanco-rosadas y porte arbustivo, propio de bordes de ramblas salinas y depresiones halófilas del litoral.',
  s.identification_tips = 'Flores en espigas densas
Tolera suelos muy salinos
Bordes de rambla y saladar',
  s.seasonality = 'Primavera',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/621745664/original.jpg',
  s.image_attribution = 'melendrete (CC BY-NC 4.0) · GBIF',
  s.rarity_score = 4
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Tamarix boveana';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Pimientera',
  s.primary_habitat = 'Bosques, arboledas, huertos y jardines con arbolado',
  s.description = 'Uno de los pájaros más abundantes de Europa. El macho luce el pecho vinoso y la nuca gris azulada; la hembra es parda. Ambos comparten dos barras alares blancas muy visibles en vuelo. Su canto es una frase descendente que acaba en un floreo, repetida sin descanso en primavera.',
  s.identification_tips = 'Dos barras blancas bien marcadas en cada ala
Bordes blancos en la cola, visibles al volar
Canto en frase descendente que remata en un adorno',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Fringilla_coelebs_(chaffinch)%2C_male.jpg?width=1280',
  s.image_attribution = 'Self: Commons user MichaelMaggs (CC BY-SA 2.5) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Fringilla coelebs';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Mito',
  s.primary_habitat = NULL,
  s.description = 'Es fácil de identificar por la notable longitud de su cola (7-9 centímetros), que contrasta con su pequeño cuerpecillo, de cortas y redondeadas alas. En un primer vistazo resulta un ave con una apariencia general oscura. Sin embargo, observada con atención se aprecia una banda clara que recorre toda la cabeza, así como una pechuga grisácea con tintes rojizos, que contrasta con los tonos negros y grises del dorso, la cola y las alas.',
  s.identification_tips = '',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Long-tailed_Tit_Aegithalos_caudatus.jpg?width=1280',
  s.image_attribution = 'Andreas Trepte (CC BY-SA 2.5) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Aegithalos caudatus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Curruca cabecinegra',
  s.primary_habitat = 'Matorral mediterráneo denso, setos y bordes de arbolado',
  s.description = 'La curruca más común del matorral mediterráneo. El macho tiene la cabeza negra hasta por debajo del ojo, la garganta blanca y un llamativo anillo ocular rojo. Es ruidosa y territorial: su reclamo de alarma es un traqueteo seco que delata su presencia constantemente.',
  s.identification_tips = 'Capucha negra que baja por debajo del ojo
Anillo ocular rojo intenso
Reclamo de alarma como una carraca seca',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Sardinian_Warbler.jpg?width=1280',
  s.image_attribution = 'Andreas Trepte (CC BY-SA 2.5) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Curruca melanocephala';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Carbonero común',
  s.primary_habitat = NULL,
  s.description = 'Se trata de una especie fácilmente reconocible por el color amarillo de su cuerpo, que contrasta con el azul de las alas y la cola. La cabeza es de color negro-azabache y con las mejillas muy blancas, salvo en los jóvenes del año, algo amarillenta. Los machos se distinguen de las hembras por poseer una conspicua banda negra que recorre su cuerpo desde la garganta hasta la base de la cola. Las hembras, en cambio, tienen muy poco marcada dicha banda, que se desdibuja en el vientre.',
  s.identification_tips = '',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/%D0%A1%D0%B8%D0%BD%D0%B8%D1%86%D0%B0_(Parus_major%2C_fem)%2C_%D0%91%D0%B8%D1%82%D1%86%D0%B5%D0%B2%D1%81%D0%BA%D0%B8%D0%B9_%D0%BB%D0%B5%D1%81.jpg?width=1280',
  s.image_attribution = 'Dion Art (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Parus major';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Pito ibérico',
  s.primary_habitat = NULL,
  s.description = 'Es un pájaro carpintero grande y robusto, de aspecto inconfundible, en cuyo plumaje dominan claramente los tonos verdosos, más intensos en las regiones dorsales, ligeramente grisáceos en las ventrales y con matices amarillentos en el obispillo. Carece de moteados y listas —salvo, tenuemente, en la región anal—, pero luce un llamativo patrón de coloración en la cabeza, donde el píleo es rojo y los ojos, amarillentos, aparecen enmarcados por un antifaz negro. Los machos y los jóvenes presentan una bigotera negra y roja, que es exclusivamente negra en las hembras. El plumaje juvenil se caracteriza por ser fuertemente moteado, especialmente en las partes inferiores, aunque, en conjunto, su coloración es más apagada que la del adulto, no presentan antifaz y poseen un iris más oscuro. Su vuelo es muy característico, con una trayectoria ondulatoria en la que el ave combina tramos en los que bate las alas con otros en que las pliega.',
  s.identification_tips = '',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Iberian_Green_Woodpecker_(Pito_Ib%C3%A9rico)_(Picus_sharpei)_-_Torrevieja%2C_Spain_2024-02-04.jpg?width=1280',
  s.image_attribution = 'Ryan Hodnett (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Picus sharpei';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Mosquitero común',
  s.primary_habitat = NULL,
  s.description = 'Se trata de un pequeño pajarillo de pico fino y patas oscuras. Presenta tonos verdosos o pardo-grisáceos en el dorso y blanquecinos en las partes inferiores. Ambos sexos resultan similares, si bien los machos son ligeramente mayores que las hembras. Es una especie prácticamente idéntica en el campo al mosquitero ibérico, del que se distingue por su canto y por encontrarse presente en nuestro territorio durante todo el año o en invierno —según las regiones—, mientras que el ibérico es un ave únicamente estival. Es también muy similar al mosquitero musical, pero este posee las patas y el pico pálidos, así como la lista superciliar y otras finas marcas auriculares más definidas. Además, el musical solo está presente en paso.',
  s.identification_tips = '',
  s.seasonality = 'Octubre a abril',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Chiffchaff_-_Phylloscopus_collybita.jpg?width=1280',
  s.image_attribution = 'Andreas Trepte (CC BY-SA 2.5) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Phylloscopus collybita';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Carbonero garrapinos',
  s.primary_habitat = NULL,
  s.description = 'Ave pequeña, con plumaje de colores apagados. El dorso y las alas son de color azul grisáceo, mientras que el pecho y el vientre presentan una tonalidad ante. Su rasgo más distintivo es la mancha blanca en la nuca. Se muestra muy activo y explora minuciosamente las ramas, ramitas, hojas y piñas. En su exhaustiva búsqueda de alimento llega a realizar auténticas acrobacias, muchas veces quedando colgado o realizando cortos cernidos. Habita preferentemente en pinares, pero también se localiza en formaciones de frondosas y en áreas ajardinadas. Tras el periodo reproductor se mueve en pequeños grupos, que en numerosas ocasiones están integrados por varias especies, pues se mezcla con otros páridos, reyezuelos, mosquiteros, etc.',
  s.identification_tips = '',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/005Large.jpg?width=1280',
  s.image_attribution = 'John GB Garrett (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Periparus ater';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Perdiz roja',
  s.primary_habitat = 'Mosaicos de cultivo, matorral bajo y laderas pedregosas',
  s.description = 'Perdiz de patas y pico rojos, con un collar negro que se deshace en un salpicado de motas sobre el pecho y flancos barrados en blanco, negro y castaño. Prefiere correr a volar, y cuando por fin levanta lo hace de golpe y a ras de suelo, planeando ladera abajo.',
  s.identification_tips = 'Flancos con barras nítidas blancas, negras y castañas
Collar negro que se disgrega en motas sobre el pecho
Corre agachada antes que volar; levanta de golpe y planea',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Perdiz_roja.jpg?width=1280',
  s.image_attribution = 'Juan Lacruz (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Alectoris rufa';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Herrerillo capuchino',
  s.primary_habitat = NULL,
  s.description = 'Pequeño pajarillo de apariencia inconfundible, gracias sobre todo a su característica cresta triangular y apuntada, de plumas blancas y negras y que despliega habitualmente. Su cara es también un juego de bandas negras y blancas: presenta una conspicua corbata negra que se prolonga a modo de collar; además tiene una línea ocular negra, y otra que recorre la mejilla, siempre sobre fondo claro o blanco. Por el contrario, el dorso, las alas y la cola son de color pardo oscuro, que contrasta con los flancos, el pecho y el vientre, de un tono gris-canela muy apagado. Al igual que los carboneros garrapinos u otros páridos, habita en bosques de coníferas (pinos, abetos, etc.). Pero también se localiza en formaciones de frondosas —caducifolias y perennes— y se observa en áreas ajardinadas. No es un ave especialmente gregaria, pero en otoño e invierno puede constituir pequeños grupos de 2-10 individuos, que exploran conjuntamente tanto el suelo como, sobre todo, la corteza, las ramas y las hojas de los árboles. Con frecuencia se mezcla con otros páridos, con agateadores y con reyezuelos, conformando ruidosos bandos mixtos.',
  s.identification_tips = '',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/083_Wild_European_crested_tit_at_Parc_naturel_r%C3%A9gional_Jura_vaudois_Photo_by_Giles_Laurent.jpg?width=1280',
  s.image_attribution = 'Giles Laurent (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Lophophanes cristatus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Petirrojo europeo',
  s.primary_habitat = NULL,
  s.description = 'Pajarillo de constitución rechoncha, sobre todo en invierno, cuando ahueca sus plumas para generar una capa de aire caliente interior. Machos y hembras son idénticos en coloración. En su plumaje destaca la amplia mancha anaranjada que se extiende por la cara, la garganta y el pecho, la cual aparece bordeada por una irregular y sutil banda gris. El resto del plumaje resulta poco vistoso. Domina el color pardo verdoso en el dorso y las alas, y el blanco sucio en el vientre. Los jóvenes volantones, antes de la muda parcial a finales del verano, muestran un plumaje pardo, con casi todas sus plumas punteadas en su extremo con motas amarillentas. El petirrojo europeo se mueve habitualmente por el suelo en busca de insectos. Para cantar se posa en las ramas altas de los árboles, ya sea en invierno o durante la temporada de cría. Es muy agresivo, tanto con ejemplares de su misma especie como con el resto de las aves, no solo en la época reproductora, sino también durante la invernada. En este último periodo, las parejas se separan y defienden territorios individuales.',
  s.identification_tips = '',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Erithacus_rubecula_with_cocked_head.jpg?width=1280',
  s.image_attribution = 'Francis C. Franklin (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Erithacus rubecula';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cernícalo vulgar',
  s.primary_habitat = 'Campos abiertos, matorral, cortados y también ciudades',
  s.description = 'El halcón más común y fácil de ver, gracias a su costumbre de cernirse: se queda suspendido en el aire batiendo las alas con la cabeza inmóvil, buscando ratones y lagartijas. El macho tiene la cabeza gris y el dorso rojizo con puntos negros; la hembra es más parda y barrada.',
  s.identification_tips = 'Se queda «clavado» en el aire cerniéndose
Dorso rojizo salpicado de puntos negros
Cola larga con una banda negra ancha en la punta',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Common_kestrel_falco_tinnunculus.jpg?width=1280',
  s.image_attribution = 'Andreas Trepte (CC BY-SA 2.5) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Falco tinnunculus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Busardo ratonero',
  s.primary_habitat = 'Mosaicos de bosque y campo abierto, con arbolado para nidificar',
  s.description = 'La rapaz mediana más frecuente y variable de plumaje: los hay casi blancos y casi negros. Pasa mucho tiempo posado en postes y en el suelo, y planea en círculos con las alas ligeramente levantadas. Su reclamo es un maullido lastimero muy reconocible.',
  s.identification_tips = 'Planea en círculos con las alas en «V» poco marcada
Maullido agudo y quejumbroso al volar
Muy variable: desde ejemplares claros a muy oscuros',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Buizerd-rh_20091021_002_(cropped).jpg?width=1280',
  s.image_attribution = 'RonaldHuijssen (CC BY-SA 3.0 nl) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Buteo buteo';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Tórtola europea',
  s.primary_habitat = 'Sotos, arboledas y matorral alto junto a cultivos y ramblas',
  s.description = 'La más pequeña y grácil de nuestras palomas, con el dorso escamado en negro y canela y un parche a rayas blancas y negras en el cuello. Su arrullo ronco y adormecedor es uno de los sonidos del verano. Sus poblaciones han caído mucho en Europa por la pérdida de barbechos y setos.',
  s.identification_tips = 'Espalda escamada, como un mosaico canela y negro
Parche rayado blanco y negro a los lados del cuello
Arrullo ronco y vibrante, muy distinto al de la tórtola turca',
  s.seasonality = 'Primavera y verano (estival)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Streptopelia_turtur_Grlica0036.jpg?width=1280',
  s.image_attribution = 'Zrno at Serbian Wikipedia (Public domain) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Streptopelia turtur';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Colirrojo tizón',
  s.primary_habitat = NULL,
  s.description = 'Ave de pequeño tamaño y diseño peculiar, con obispillo y cola de característico color rojo. El macho presenta el pecho y la cara de color negro azabache, y el resto del cuerpo oscuro, con una mancha blanca en las alas. Las hembras y los jóvenes son pardogrisáceos. Muy terrestre, acostumbra a posarse con figura erguida mientras agita su cola roja. Tiene vuelo amariposado, con batido rápido de alas.',
  s.identification_tips = '',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Hausrotschwanz_Brutpflege_2006-05-21-05.jpg?width=1280',
  s.image_attribution = 'Stefan-Xp (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Phoenicurus ochruros';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cogujada común',
  s.primary_habitat = 'Cultivos, caminos, eriales y bordes de poblado con suelo desnudo',
  s.description = 'Alondra parda de cresta alta y puntiaguda, muy ligada a caminos, cunetas y descampados junto a los pueblos. Camina en vez de saltar y, al volar, deja ver el forro rojizo de las alas y la cola con los bordes canela.',
  s.identification_tips = 'Cresta larga y puntiaguda, casi siempre erguida
Forro de las alas rojizo, visible al levantar el vuelo
Camina por el suelo en vez de saltar',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Crested_Lark_-_Qatar.jpg?width=1280',
  s.image_attribution = 'Ashraf Kotb (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Galerida cristata';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Abubilla',
  s.primary_habitat = 'Campos abiertos, dehesas, cultivos con arbolado y bordes de matorral',
  s.description = 'Ave inconfundible de color canela con alas y cola a franjas blancas y negras, y una cresta eréctil que despliega en abanico al posarse. Sondea el suelo blando con el pico largo y curvo en busca de larvas e insectos. Su canto, un «up-up-up» sordo y repetido, se oye de lejos en primavera.',
  s.identification_tips = 'Vuelo ondulante y torpe, como una mariposa grande
Cresta que abre en abanico justo al aterrizar
Camina por el suelo clavando el pico largo y curvo',
  s.seasonality = 'Todo el año en el sur peninsular; estival en el resto',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Wiedehopf_mit_Puppe_als_Futter.jpg?width=1280',
  s.image_attribution = 'Sven Damerow (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Upupa epops';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Chotacabras cuellirrojo',
  s.primary_habitat = 'Matorral abierto, pinares aclarados, ramblas y caminos térreos',
  s.description = 'Ave crepuscular de plumaje jaspeado que imita la hojarasca, tan mimético que de día resulta casi imposible verla posada en el suelo. Caza polillas en vuelo con la boca muy abierta. Su canto nocturno es un «cu-toc, cu-toc» repetido de forma monótona durante minutos.',
  s.identification_tips = 'Collar rojizo en la nuca, más marcado que en su pariente europeo
Se levanta del camino al anochecer y vuelve a posarse unos metros más allá
Canto nocturno monótono, como un motor lejano',
  s.seasonality = 'Primavera y verano (estival)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Caprimulgus_ruficollis_-Portugal-8.jpg?width=1280',
  s.image_attribution = 'Olivença (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Caprimulgus ruficollis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Vencejo común',
  s.primary_habitat = 'Nidos:edificios,acantilados rocosos,cuevas,cajas nido, en colonias.En todo tipo de habitats',
  s.description = 'Presenta silueta en forma de ballesta, cola corta y ahorquillada, y alas estrechas y largas. Posee pico corto, plano y con la boca muy ancha; patas emplumadas y extremadamente cortas, que le impiden posarse en el suelo; y pies pequeños y de fuertes garras, con los cuatro dedos dirigidos hacia delante. Muestra coloración uniforme de tono pardo oscuro, casi negro, excepto en la garganta, que es blanca; la cara inferior de las alas resulta un poco más pálida. En otoño, con su plumaje desgastado, es algo más claro. Ambos sexos son iguales. Los jóvenes se parecen mucho a los adultos, aunque con un tono algo más oscuro y un aspecto escamoso, por los pequeños ribetes blancos que tienen en las plumas. Esta ave es observada casi siempre en vuelo y en grupo. Las condiciones de luz, el fondo y la distancia determinan su apariencia, pudiendo confundirse con frecuencia con el vencejo pálido. Se localiza habitualmente en núcleos urbanos, volando de forma incansable a gran velocidad. Pasa la mayor parte de su vida en el aire, y únicamente se la ve posada cuando entra o sale del nido. Duerme tanto en el nido como en vuelo.',
  s.identification_tips = '',
  s.seasonality = 'Abril a agosto',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Apus_apus_-Barcelona%2C_Spain-8_(1).jpg?width=1280',
  s.image_attribution = 'pau.artigas (CC BY-SA 2.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Apus apus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Lavandera blanca',
  s.primary_habitat = NULL,
  s.description = 'Pájaro estilizado de aspecto muy distintivo, con larga cola y tonos blancos, negros y grises. Exhibe dorso gris ceniza, vientre blanco, y alas negras y con bandas blancas cuando están plegadas. Posee cola larga y negra, con plumas externas blancas, y patas y pico negros. El patrón de la cabeza resulta muy contrastado, con la cara blanca rodeada arriba y abajo de negro. Luce un plumaje invernal similar, aunque el color negro en la cabeza está más reducido, y muestra garganta blanca y banda pectoral negra. La lavandera enlutada (M. a. yarrelli), de origen británico, presenta tonos negros en dorso y flancos. Ambos sexos son parecidos, pero la hembra tiene la nuca gris. Los jóvenes resultan más uniformes, sin negro en la cabeza y con banda pectoral grisácea. Un hábito destacado de esta ave es el continuo balanceo de la cola. En invierno se vuelve muy gregaria y se reúne en dormideros.',
  s.identification_tips = '',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/White-Wagtail.jpg?width=1280',
  s.image_attribution = 'Andreas Trepte (CC BY-SA 2.5) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Motacilla alba';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Abejaruco europeo',
  s.primary_habitat = 'Matorral termomediterráneo semiárido',
  s.description = 'Ave colorida y gregaria que caza abejas y libélulas en vuelo sobre espacios abiertos y cría en galerías excavadas en taludes terrosos.',
  s.identification_tips = 'Colorido inconfundible
Reclamo ''prruip'' en vuelo
Cría en taludes de rambla',
  s.seasonality = 'Primavera y verano (estival)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/%C5%9Eahl%C3%BBr-33.jpg?width=1280',
  s.image_attribution = 'Dûrzan cîrano (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Merops apiaster';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Mochuelo europeo',
  s.primary_habitat = 'Matorral litoral y zonas abiertas con posaderos',
  s.description = 'Búho pequeño y rechoncho, de cabeza plana y ojos amarillos con un ceño que le da expresión severa. Es el más diurno de nuestros búhos: se ve posado en postes y ruinas a plena luz. Vuela con un ondulado marcado, a golpes de aleteo y planeo.',
  s.identification_tips = 'Cabeza plana y ancha, sin penachos
Cejas blancas marcadas que le dan aspecto ceñudo
Vuelo ondulado, a rachas de aleteo y planeo',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Mochuelo_Com%C3%BAn_(_Athene_noctua_)(1).jpg?width=1280',
  s.image_attribution = 'Arturo Nikolai from Galicia, Spain (CC BY-SA 2.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Athene noctua';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Golondrina común',
  s.primary_habitat = NULL,
  s.description = 'Ave delicada, grácil y aerodinámica, de color negro, con reflejos azules metálicos por arriba y blancos crema en las partes inferiores. Tiene la frente y la garganta rojas y un collar negro. Las alas, largas y apuntadas, muestran tonos blancos en la parte inferior delantera. Su cola, muy larga y ahorquillada, es de color negro, con pequeños óvalos blancos cuando la extiende. Posee patas cortas sin emplumar, boca muy ancha, y pico corto, plano y negro. Presenta variación latitudinal en el tamaño corporal y en la longitud de la cola, que son menores hacia el sur. Aunque ambos sexos se parecen, la hembra es menos brillante, más blanca por abajo y con la cola más corta. Los jóvenes lucen tonos negros mate, tienen la frente y la garganta naranjas y una cola mucho más corta. De vuelo ágil, rápido y acrobático, la golondrina común ocupa en el espacio aéreo las capas bajas, por debajo de aviones y vencejos.',
  s.identification_tips = '',
  s.seasonality = 'Marzo a octubre',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Landsvale.jpg?width=1280',
  s.image_attribution = 'Malene Thyssen (CC BY 2.5) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Hirundo rustica';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Piquituerto',
  s.primary_habitat = 'Pinares y masas de coníferas con producción de piñas',
  s.description = 'Fringílido de pico único: las dos mandíbulas se cruzan en la punta, una herramienta para abrir las escamas de las piñas y sacar el piñón. El macho es rojo ladrillo y la hembra verde oliva. Cría incluso en invierno si hay piñas, y se mueve en bandos ruidosos de copa en copa.',
  s.identification_tips = 'Puntas del pico cruzadas, visibles de cerca
Macho rojizo, hembra verde amarillenta
Reclamo metálico «chip-chip» de los bandos en vuelo',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Red_Crossbills_(Male).jpg?width=1280',
  s.image_attribution = 'Elaine R. Wilson, www.naturespicsonline.com (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Loxia curvirostra';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Curruca capirotada',
  s.primary_habitat = NULL,
  s.description = 'Curruca de mediano tamaño, de aspecto más compacto y robusto que la mayor parte de sus congéneres, aunque muy similar en tamaño y silueta a la curruca mosquitera. Al igual que ésta, y a diferencia de la mayoría de las currucas, no presenta ni rectrices externas ni garganta blanquecinas. Luce una tonalidad general grisácea, aunque la hembra muestra en las alas y en las regiones ventrales tintes más pardo rojizos. Los machos poseen el capirote negro, mientras que las hembras y los jóvenes lo tienen de color castaño.',
  s.identification_tips = '',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Sylvia_atricapilla_-Lullington_Heath%2C_East_Sussex%2C_England_-male-8.jpg?width=1280',
  s.image_attribution = 'Ron Knight from Seaford, East Sussex, United Kingdom (CC BY 2.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Sylvia atricapilla';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Águila calzada',
  s.primary_habitat = 'Bosques y sierras con arbolado, cazando sobre zonas abiertas cercanas',
  s.description = 'Águila pequeña, del tamaño de un ratonero, con dos formas de plumaje muy distintas: una clara con el vientre blanco y otra oscura y uniforme. Nidifica en árboles dentro del bosque y caza en campo abierto lanzándose desde altura. Se identifica en vuelo por las «luces de posición»: dos manchas blancas en el arranque de las alas.',
  s.identification_tips = 'Dos manchas blancas donde el ala se une al cuerpo
Existen ejemplares claros y oscuros de la misma especie
Cola larga y recta, sin la muesca del milano',
  s.seasonality = 'Primavera y verano (estival); algunos ejemplares invernan',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Booted_eagle%2C_Hieraaetus_pennatus%2C_at_Kgalagadi_Transfrontier_Pa_(32334023348).jpg?width=1280',
  s.image_attribution = 'Derek Keats from Johannesburg, South Africa (CC BY 2.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Hieraaetus pennatus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Oropéndola',
  s.primary_habitat = 'Bosques de ribera,hileras de olmos,chopos,sotos,generalmente fluviales,parques,jardines...Mar-1600m',
  s.description = 'Ave de tamaño similar a un mirlo y llamativo color amarillento. El macho exhibe un intenso color amarillo limón en la cabeza — rayada con una línea ocular oscura— y en el cuerpo, que contrasta bastante con las anchas y redondeadas alas, totalmente negras, a excepción de dos parches amarillos a la altura de la articulación de la muñeca. La cola es igualmente amarilla, aunque presenta una ancha banda terminal negra. Posee patas de tono grisáceo y pico rojizo. La hembra, que recuerda a un pequeño pito real, muestra tonos más apagados que el macho, con partes superiores de color verde oliva e inferiores blanquecinas y rayadas en gris. Tiene las alas y la cola pardas, y el pico rojo sucio. Los jóvenes son casi iguales a las hembras, aunque con el pico pardo oscuro y el ojo negruzco. Se trata de un ave esquiva, por lo que la mayoría de las observaciones corresponden a individuos en vuelos breves entre la espesura. Su vuelo, directo y ondulado, alterna aleteos y alas plegadas, de modo similar al del pito real. Su carácter agresivo se evidencia en los frecuentes acosos a otras especies, incluso de mayor tamaño.',
  s.identification_tips = '',
  s.seasonality = 'Abril a agosto',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Oriole_2.jpg?width=1280',
  s.image_attribution = 'autor no indicado (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Oriolus oriolus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Papamoscas gris',
  s.primary_habitat = 'Arbolado abierto, bordes de bosque, huertos y jardines con perchas altas',
  s.description = 'Pájaro discreto de color pardo grisáceo, sin marcas llamativas, que se reconoce mejor por su conducta que por su aspecto: se posa muy erguido en una rama descubierta, sale disparado a cazar un insecto en el aire y vuelve exactamente a la misma percha. Repite la maniobra decenas de veces.',
  s.identification_tips = 'Vuelve siempre a la misma rama tras cada vuelo de caza
Postura muy vertical, con las alas caídas
Frente y pecho con un rayado fino y difuso',
  s.seasonality = 'Primavera y verano (estival)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/SpottedFlycatcheronfence.jpg?width=1280',
  s.image_attribution = 'Andrew Easton (Attribution) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Muscicapa striata';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Curruca rabilarga',
  s.primary_habitat = 'Matorral bajo y denso, jarales, brezales y tomillares',
  s.description = 'Curruca pequeña, oscura y de cola muy larga que suele llevar levantada. El macho tiene el vientre vinoso y el ojo rojo rodeado de un anillo del mismo color. Es muy inquieta y rara vez se deja ver más de unos segundos antes de volver a hundirse en la mata.',
  s.identification_tips = 'Cola larga y erguida, casi vertical al posarse
Ojo y anillo ocular rojos
Vientre de color vinoso, con motitas blancas en la garganta',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Fauvette_pitchou_Ichkeul_NP.jpg?width=1280',
  s.image_attribution = 'El Golli Mohamed (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Curruca undata';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cuco',
  s.primary_habitat = 'Zonas arboladas de todo tipo.Bosques,linderos,bosquetes,cultivos,huertos frutales,piornales',
  s.description = 'Esta ave, de tamaño medio y aspecto estilizado, se caracteriza por poseer una larga cola y unas alas apuntadas, por lo que su silueta puede confundirse en vuelo con la de una pequeña rapaz, como el cernícalo vulgar o el gavilán. En la coloración del macho dominan los tonos grises, sobre todo en el dorso, la cabeza y el cuello. Por su parte, las regiones ventrales son blancas, pero finamente barreadas. La hembra puede lucir dos tipos de plumaje: uno grisáceo, muy parecido al del macho, y otro rojizo, bastante menos frecuente que el anterior. Los inmaduros se asemejan en parte a las hembras de fase rojiza, aunque tienen las plumas orladas de blanco y una característica mancha blanca en la nuca.',
  s.identification_tips = '',
  s.seasonality = 'Marzo a junio',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Cuckoo_(51169010335).jpg?width=1280',
  s.image_attribution = 'Andy Morffew from Itchen Abbas, Hampshire, UK (CC BY 2.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Cuculus canorus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Alcaudón real',
  s.primary_habitat = 'Campo abierto con matorral disperso, cables y posaderos altos',
  s.description = 'Alcaudón grande, gris por encima y con un antifaz negro que le cruza el ojo. Caza al acecho desde un posadero alto y tiene la costumbre de empalar sus presas —insectos, lagartijas, ratones— en espinas y alambres, formando pequeñas despensas.',
  s.identification_tips = 'Antifaz negro sobre fondo gris claro
Siempre en lo alto de un cable, poste o mata
Presas empaladas en espinos cerca de su territorio',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/S%C3%BCdlicher-Raubw%C3%BCrger_2018-01-07_0003.jpg?width=1280',
  s.image_attribution = 'Andreas Trepte (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Lanius meridionalis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Alcaudón común',
  s.primary_habitat = 'Matorral termomediterráneo semiárido',
  s.description = 'Alcaudón estival de cabeza castaña que caza insectos desde posaderos en el matorral abierto, empalando presas en espinas a modo de despensa.',
  s.identification_tips = 'Capirote castaño rojizo
Caza desde posaderos
Estival de mayo a agosto',
  s.seasonality = 'Primavera y verano (estival)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Lanius_senator01_new.jpg?width=1280',
  s.image_attribution = 'Lanius_senator01.jpg: chausinho derivative work: Bogbumper (talk) (CC BY-SA 2.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Lanius senator';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cuervo grande',
  s.primary_habitat = NULL,
  s.description = 'El rasgo más llamativo del cuervo es, sin duda, su colosal tamaño, que lo convierte en el representante más voluminoso del orden de los paseriformes. Dentro de su anatomía destaca sobre todo el pico, notablemente largo, robusto y grueso. Por lo demás, luce un plumaje homogéneamente negro, con algunos brillos metálicos. El vuelo de este enorme pájaro es lento y suele intercalar aleteos con largos planeos, que el ave ejecuta gracias a sus largas alas apuntadas y a su cola en forma de cuña.',
  s.identification_tips = '',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Corvus_corax.001_-_Tower_of_London.JPG?width=1280',
  s.image_attribution = 'Fernando Losada Rodríguez (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Corvus corax';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Avión común',
  s.primary_habitat = NULL,
  s.description = 'Pequeña golondrina de aspecto compacto, negro azulada brillante por arriba y blanca por abajo, con límites netos entre colores. Posee alas largas y apuntadas y cola corta ahorquillada de color negro; pico corto, plano y negro; boca muy ancha, y patas cortas cubiertas de finas plumas blancas. Destaca su obispillo de color blanco, la única zona clara de las partes dorsales. Ambos sexos son iguales. Los jóvenes resultan menos contrastados, más parduzcos, sobre todo por abajo, con límites difusos entre partes negras y blancas, y con puntas blancas en las terciarias. Este pájaro suele observarse en vuelo y agrupado. Su vuelo es rápido y ágil, aunque menos que en la golondrina común, y a menudo se produce a mayor altura que en esta. Se posa con frecuencia, a veces en el suelo.',
  s.identification_tips = '',
  s.seasonality = 'Febrero a octubre',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Delichon_urbicum_-Iceland_-flying-8_(1).jpg?width=1280',
  s.image_attribution = 'Ómar Runólfsson (CC BY 2.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Delichon urbicum';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Avión roquero',
  s.primary_habitat = 'Acantilados mediterráneos con Limonium',
  s.description = 'Hirundínido pardo y robusto que vuela pegado a las paredes rocosas de acantilados y barrancos, donde construye su nido de barro.',
  s.identification_tips = 'Vuelo pegado a las paredes
Manchas claras en la cola
Nido de barro en cortados',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Ptyonoprogne_rupestris_in_flight.jpg?width=1280',
  s.image_attribution = 'ferran pestaña (CC BY-SA 2.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Ptyonoprogne rupestris';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Escribano montesino',
  s.primary_habitat = NULL,
  s.description = 'Se trata de un escribano bastante grande y voluminoso, con las alas relativamente cortas y la cola larga, que luce en la cabeza tres características listas oscuras. La cabeza, el cuello, la nuca y la parte superior del pecho son de color grisáceo, en tanto que el resto del cuerpo presenta tonos pardos o rojizos. Fuera de la estación reproductora, los machos se asemejan a las hembras y a los inmaduros, aunque en el periodo de cría su coloración se hace más brillante, con abundancia de tonos anaranjados en el pecho y en el vientre. El joven presenta un plumaje parduzco y fuertemente estriado en el pecho; la cabeza es marrón-ocre y no presenta bandas laterales.',
  s.identification_tips = '',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Emberiza_cia.jpg?width=1280',
  s.image_attribution = 'autor no indicado (Public domain) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Emberiza cia';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Collalba negra',
  s.primary_habitat = 'Matorral litoral, laderas secas y roquedos',
  s.description = 'La mayor de las collalbas, enteramente negra salvo el obispillo y la base de la cola, blancos. Vive en cortados y laderas rocosas, donde construye junto al nido una plataforma de piedrecitas que acarrea una a una. Su canto es potente y melodioso.',
  s.identification_tips = 'Cuerpo negro con obispillo blanco muy contrastado
«T» negra invertida en la cola blanca al volar
Montoncitos de piedrecitas junto a la grieta del nido',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Black_Wheatear%2C_Isla_Plana_3.jpg?width=1280',
  s.image_attribution = 'Andrew Thomas from Shrewsbury, UK (CC BY-SA 2.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Oenanthe leucura';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Gavilán común',
  s.primary_habitat = 'Bosques mixtos de coníferas y frondosas.Sotos, grandes arbustos',
  s.description = 'Esta pequeña rapaz de hábitos forestales, larga cola y alas cortas y redondeadas presenta un acusado dimorfismo sexual invertido, por el cual las hembras resultan ostensiblemente más corpulentas que los machos; además, entre ambos sexos existen marcadas diferencias en cuanto al diseño del plumaje. El macho adulto tiene las partes superiores y el píleo de un color grisáceo bastante intenso, en tanto que las inferiores son pálidas con un fino barrado transversal y un tono rojizo que puede ser muy notorio, principalmente en las mejillas y los flancos; sobre el ojo luce una leve línea blanca a modo de ceja. Las patas son amarillas y con los largos tarsos sin emplumar. La hembra, mucho más pesada y robusta, posee un patrón de coloración dominado por los tonos pardogrisáceos en el dorso y el píleo, con las regiones inferiores blanquecinas, muy finamente barradas de pardo; la ceja es más grande y evidente que en su compañero. El plumaje de los jóvenes presenta las partes superiores parduzcas, con las plumas orladas de ante, y las inferiores blanquecinas y toscamente barradas de pardo rojizo. Sobre el ojo —que es amarillo— exhibe una marcada ceja. Visto en vuelo, el gavilán es un ave bastante pálida, en cuya silueta llama la atención una cola larga y de base estrecha. Normalmente, se lo observa volando velozmente a baja altura entre los árboles, aunque también puede elevarse y planear durante un tiempo sobre el dosel forestal.',
  s.identification_tips = '',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Eurasian_Sparrowhawk_by_Steve_Ward.jpg?width=1280',
  s.image_attribution = 'Steve Ward (CC BY 2.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Accipiter nisus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Agateador común',
  s.primary_habitat = 'Bosques y arboledas con troncos gruesos y corteza resquebrajada',
  s.description = 'Pájaro diminuto y críptico que sube por los troncos en espiral, apoyándose en la cola rígida, y baja volando a la base del árbol siguiente para empezar de nuevo. Extrae insectos de las grietas de la corteza con un pico fino y curvado.',
  s.identification_tips = 'Trepa siempre hacia arriba, nunca cabeza abajo
Dorso jaspeado como corteza y vientre blanco
Pico fino y curvo, como una aguja doblada',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Short-toed_Treecreeper_(Certhia_brachydactyla)_(cropped_version).jpg?width=1280',
  s.image_attribution = 'Short-toed_Treecreeper_(Certhia_brachydactyla).jpg: א (Aleph) deriv… (CC BY-SA 2.5) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Certhia brachydactyla';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Chova piquirroja',
  s.primary_habitat = 'Cortados rocosos, cantiles y montañas, alimentándose en pastizales cercanos',
  s.description = 'Córvido negro y brillante con el pico rojo, largo y curvo, y las patas del mismo color encendido. Vuela en grupos acrobáticos junto a los cantiles, plegando las alas y dejándose caer por puro juego. Busca larvas hurgando en el suelo de los pastos con ese pico de sonda.',
  s.identification_tips = 'Pico rojo, largo y curvado hacia abajo
Reclamo agudo, un «chiaa» nasal muy característico
Plumas de la punta del ala muy separadas, como dedos',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Pyrrhocorax_pyrrhocorax_-standing-8.jpg?width=1280',
  s.image_attribution = 'File:Alpenkrähe.jpg: "Malte Uhl (User:Zzzip)" derivative work: Snow… (CC BY-SA 2.5) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Pyrrhocorax pyrrhocorax';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cogujada montesina',
  s.primary_habitat = 'Matorral bajo, laderas pedregosas y eriales con vegetación rala',
  s.description = 'Cogujada de cresta puntiaguda, muy parecida a la común pero de pico más corto y grueso y con el pecho más nítidamente rayado. Prefiere el matorral y las laderas pedregosas, mientras que la común busca cultivos, caminos y bordes de pueblo.',
  s.identification_tips = 'Cresta alta y afilada, casi triangular
Pico más corto y romo que el de la cogujada común
Rayado del pecho bien definido, no difuminado',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Galerida_theklae_Madrid.jpg?width=1280',
  s.image_attribution = 'Adrian198cm (Public domain) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Galerida theklae';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Collalba rubia',
  s.primary_habitat = 'Laderas secas y pedregosas con matorral bajo y suelo desnudo',
  s.description = 'Collalba pequeña y contrastada: el macho es color arena claro con las alas negras y un antifaz o una garganta negros según la variedad. Como todas las collalbas, enseña al volar una cola blanca con una «T» negra invertida. Caza insectos lanzándose al suelo desde una piedra o una mata.',
  s.identification_tips = 'Cola blanca con una «T» negra al abrirse
Alas negras que resaltan sobre el cuerpo color arena
Se posa erguida en piedras y matas, muy visible',
  s.seasonality = 'Primavera y verano (estival)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Black-eared_Wheatear%2C_Punta_del_Sabinar%2C_Spain.jpg?width=1280',
  s.image_attribution = 'Vince Smith from London, United Kingdom (CC BY-SA 2.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Oenanthe hispanica';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Autillo',
  s.primary_habitat = 'Arboledas, sotos, huertos y parques con árboles viejos',
  s.description = 'El búho más pequeño de Europa, apenas mayor que un puño, con un plumaje jaspeado que lo hace invisible pegado a un tronco. Se detecta por el oído: un silbido monótono y flautado que repite cada dos o tres segundos durante toda la noche de primavera.',
  s.identification_tips = 'Silbido corto y flautado repetido de forma monótona
Diminuto, con dos penachos de plumas en la cabeza
Plumaje veteado que imita la corteza',
  s.seasonality = 'Primavera y verano (estival)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Scops_Owl_(Otus_scops)%2C_Kalloni%2C_Lesvos%2C_Greece%2C_19.04.2015_(16773748434).jpg?width=1280',
  s.image_attribution = 'Frank Vassen from Brussels, Belgium (CC BY 2.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Otus scops';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Culebrera europea',
  s.primary_habitat = 'Sierras y llanos con matorral, ramblas y bosque abierto',
  s.description = 'Águila grande y muy pálida por debajo, especializada en comer culebras y lagartos. Se ciñe en el aire durante largos ratos, con las patas colgando, escrutando el suelo antes de dejarse caer. La cabeza, ancha y con ojos amarillos muy frontales, le da un aire de lechuza.',
  s.identification_tips = 'Vientre y alas casi blancos vistos desde abajo
Se mantiene cerniéndose, algo raro en un águila tan grande
Cabeza ancha y ojos amarillos, aspecto de búho',
  s.seasonality = 'Primavera y verano (estival)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Aguila_culebrera_(Circaetus_gallicus).jpg?width=1280',
  s.image_attribution = 'Paco Gómez (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Circaetus gallicus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Roquero solitario',
  s.primary_habitat = 'Acantilados mediterráneos con Limonium',
  s.description = 'Pájaro rupícola de plumaje azul pizarra en el macho, ligado a acantilados marinos y roquedos, donde canta desde cornisas destacadas.',
  s.identification_tips = 'Macho azul pizarra
Canta desde cornisas y cumbres
Acantilados y roquedos calcáreos',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Blue_rock_thrush_(male)_at_Gamla_Nature_Reserve.jpg?width=1280',
  s.image_attribution = 'Artemy Voikhansky (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Monticola solitarius';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Escribano soteño',
  s.primary_habitat = NULL,
  s.description = 'De tamaño algo menor que el escribano cerillo, el soteño es ligeramente más colicorto y posee un pico más robusto. La coloración general se asemeja también a la del cerillo, sobre todo en jóvenes y hembras. Se diferencian, sin embargo, por el color del obispillo — gris oliváceo en el soteño—, por la posesión de marcadas bandas laterales en la cara y, en general, por presentar menos áreas amarillentas en el plumaje. El macho en época reproductora luce una amplia franja pectoral gris olivácea, un llamativo babero negro en la garganta y un antifaz del mismo color; además, conserva todo el año el píleo y la nuca extensamente coloreados de gris oliváceo, con finas listas oscuras.',
  s.identification_tips = '',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Emberiza_cirlus.jpg?width=1280',
  s.image_attribution = 'autor no indicado (Public domain) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Emberiza cirlus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Alcaraván',
  s.primary_habitat = 'Llanos pedregosos, cultivos de secano, ramblas y eriales con poca cobertura',
  s.description = 'Ave de aspecto extraño y ojos amarillos enormes, adaptados a la actividad nocturna. De día permanece agachada e inmóvil, confiada en su plumaje críptico, y solo al anochecer se activa y delata con un reclamo silbado y melancólico que recuerda al del zarapito.',
  s.identification_tips = 'Ojos amarillos desproporcionadamente grandes
Dos barras blancas y negras en el ala plegada
Reclamo silbado y triste al anochecer',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Burhinus_oedicnemus_insularum_Lanzarote_1.jpg?width=1280',
  s.image_attribution = 'Frank Vassen from Brussels, Belgium (CC BY 2.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Burhinus oedicnemus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Triguero',
  s.primary_habitat = 'Cultivos de secano, pastizales y llanos abiertos con posaderos',
  s.description = 'Escribano grande y rechoncho, pardo y rayado, sin marcas llamativas. Canta desde un cable o una mata con una frase acelerada que suena como un manojo de llaves agitado, y vuela distancias cortas dejando las patas colgando.',
  s.identification_tips = 'Canto como un manojo de llaves agitándose
Vuela con las patas colgando, sin recogerlas
Aspecto pesado y pardo, sin marcas vistosas',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/606625336/original.jpg',
  s.image_attribution = 'euqirneto (CC BY 4.0) · GBIF',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Emberiza calandra';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Halcón peregrino',
  s.primary_habitat = 'Cortados y áreas abiertas',
  s.description = 'Halcón robusto de alas puntiagudas y cola corta, capaz de superar los 300 km/h en el picado con que abate a otras aves en pleno vuelo. Se reconoce por la ancha bigotera negra que baja desde el ojo sobre un pecho claro y barrado.',
  s.identification_tips = 'Bigotera negra ancha bajo el ojo, como un casco
Silueta de ancla: alas puntiagudas y cola corta
Pecho claro con barrado fino en horizontal',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Falco_peregrinus_-_01.jpg?width=1280',
  s.image_attribution = 'Carlos Delgado (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Falco peregrinus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Tarabilla europea',
  s.primary_habitat = 'Matorral bajo, herbazales, ribazos y bordes de cultivo con posaderos',
  s.description = 'Pájaro pequeño y regordete que se posa en lo alto de las matas, muy erguido y a la vista, para lanzarse al suelo a por insectos. El macho tiene la cabeza negra, un collar blanco a los lados y el pecho naranja. Su reclamo suena como dos piedras golpeadas, de donde le viene el nombre.',
  s.identification_tips = 'Siempre en lo alto de una mata, bien visible
Macho con capucha negra y medio collar blanco
Reclamo como el chasquido de dos cantos rodados',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Malestonechatseaham_Cropped.jpg?width=1280',
  s.image_attribution = 'derivative work: Myosotis Scorpioides (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Saxicola rubicola';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Bisbita común',
  s.primary_habitat = NULL,
  s.description = 'Ave de aspecto poco llamativo y sin caracteres muy distintivos, similar al resto de bisbitas. Exhibe dorso pardo, un tanto verdoso al principio del otoño, con muchas estrías oscuras; vientre blanco sucio muy rayado; y flancos anaranjados en otoño, que se aclaran según avanza el invierno. Posee alas redondeadas, cola larga y con plumas externas blancas, pico fino, y patas finas, con la uña posterior larga y recta. La garganta es blanca, con una fina bigotera negra. Ambos sexos son iguales. Los jóvenes, cuando llegan a España, no se distinguen de los adultos. Este pájaro se observa casi siempre en el suelo y en grupo. Para diferenciarlo de otros bisbitas hay que atender a las fechas, a su voz, a su pequeño tamaño, y a detalles del plumaje como flancos con estrías más gruesas y dorso menos contrastado.',
  s.identification_tips = '',
  s.seasonality = 'Octubre a abril',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Anthus_pratensis.jpg?width=1280',
  s.image_attribution = 'Hans Hillewaert (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Anthus pratensis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Vencejo pálido',
  s.primary_habitat = 'Nidos: roquedos,acantilados costeros, edificios, puentes de piedra, iglesias,árboles',
  s.description = 'Presenta silueta en forma de ballesta, cola corta y ahorquillada, y alas largas y estrechas. Posee pico corto, plano y con la boca muy ancha; patas emplumadas y extremadamente cortas, que le impiden posarse en el suelo; y pies pequeños y de fuertes garras, con los cuatro dedos dirigidos hacia delante. Luce una coloración uniforme de tono pardo grisáceo, excepto en la garganta, que es blanca; la parte inferior interna de las alas resulta más clara. Con plumaje poco desgastado muestra un aspecto general escamoso. Se confunde fácilmente con el vencejo común, y para diferenciarlos se necesitan buenas condiciones de luz y hay que situarse a corta distancia. El vencejo pálido tiene un tono general más claro y parduzco, y mayor extensión en el blanco de la garganta; además, a veces se aprecia un antifaz más marcado, mayor contraste en la parte inferior de las alas y aspecto más escamoso. Ambos sexos son iguales. Los jóvenes, muy similares a los adultos, presentan un tono un poco más oscuro y un aspecto escamoso más marcado por la presencia de plumas ribeteadas en blanco. Esta ave pasa la mayor parte de su vida en el aire, por lo que casi siempre se la ve volando y agrupada, tanto en núcleos urbanos como en acantilados costeros y de interior.',
  s.identification_tips = '',
  s.seasonality = 'Marzo a septiembre',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Vencejo_p%C3%A1lido_20250901_03.jpg?width=1280',
  s.image_attribution = 'Ismael Olea (CC BY 4.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Apus pallidus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Reyezuelo listado',
  s.primary_habitat = NULL,
  s.description = 'Se trata de una de las aves más diminutas de la avifauna europea. En un primer vistazo, aparece como un pájaro de aspecto general rechoncho, con tonalidades verdosas y cabeza adornada por un característico diseño de listas. Presenta el dorso verde brillante, en contraste con las alas oscuras, surcadas por dos bandas blanquecinas. Las partes inferiores son pálidas, aunque muestran ligeros tonos anaranjados en el pecho del macho. La especie posee un diseño cefálico característico en el que destaca el píleo naranja en los machos, o amarillo en las hembras, flanqueado por una banda negra y una marcada ceja blanca. Asimismo, luce una lista ocular negra y un semianillo blanco que circunda la parte inferior del ojo.',
  s.identification_tips = '',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Firecrest93.JPG?width=1280',
  s.image_attribution = 'NAUMANN, NATURGESCHICHTE DER VÖGEL MITTELEUROPAS: Band II, Tafel 15… (Public domain) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Regulus ignicapilla';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Águila real',
  s.primary_habitat = 'Montañas y sierras con cortados rocosos y amplias zonas abiertas de caza',
  s.description = 'La mayor de las águilas ibéricas, con casi dos metros y medio de envergadura y una nuca dorada que le da nombre. Cría en repisas de cantiles y usa territorios enormes, que una pareja defiende durante años. Planea con las alas en una «V» muy suave y bate poco, lo que la distingue de las rapaces menores.',
  s.identification_tips = 'Nuca y cogote de tono dorado, visibles a buena luz
Planea con las alas en «V» muy abierta y bate poco
Tamaño enorme: dobla al ratonero en el mismo cielo',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Maakotka_(Aquila_chrysaetos)_by_Jarkko_J%C3%A4rvinen.jpg?width=1280',
  s.image_attribution = 'Jarkko Järvinen (CC BY-SA 2.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Aquila chrysaetos';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Lúgano',
  s.primary_habitat = 'Sus preferencias de hábitat van ligadas a sus requerimientos tróficos',
  s.description = 'Se trata de un ave pequeña, de pico corto y fino, que muestra cola corta y escotada cuando está cerrada. Su coloración puede recordar a la de verdecillos, verderones comunes y verderones serranos. Pero los lúganos se distinguen bien por la combinación de los siguientes caracteres: pequeño tamaño, manchas amarillas en alas y cola, y franjas amarillas en los “hombros” de las alas. Además, los machos tienen el capirote y la garganta negros. Es una especie gregaria que se mezcla con otras, sobre todo fringílidos como pardillos, pinzones vulgares, verdecillos, verderones serranos, pinzones reales, etc. Pero, a diferencia de la mayoría de los fringílidos, el lúgano también busca alimento en las ramas de árboles de ribera, siendo común observarlo en alisos, olmos y abedules.',
  s.identification_tips = '',
  s.seasonality = 'Octubre a abril',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Carduelis_Spinus_(55339970).jpeg?width=1280',
  s.image_attribution = 'Kobolt (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Spinus spinus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Carraca europea',
  s.primary_habitat = 'Campos abiertos con arbolado disperso, ribazos y construcciones con huecos',
  s.description = 'Del tamaño de una paloma y de un azul turquesa intenso que sorprende al levantar el vuelo. Caza al acecho desde cables y postes, dejándose caer sobre saltamontes y escarabajos. Cría en huecos de árboles viejos y de edificios, de ahí que dependa de que queden árboles añosos y ruinas en el campo.',
  s.identification_tips = 'Azul turquesa que solo se aprecia bien cuando vuela
Espalda de color canela que contrasta con el azul
Posada quieta en cables, oteando el suelo',
  s.seasonality = 'Primavera y verano (estival)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/European_roller.jpg?width=1280',
  s.image_attribution = 'Christian Svane (CC BY-SA 2.5) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Coracias garrulus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Vencejo real',
  s.primary_habitat = 'Nidos:Acantilados,cortados,marinos e interior.Hasta 1900m.Sustrato preferido calizo,...Edificaciones',
  s.description = 'Se trata del más grande y vistoso de los vencejos españoles. Presenta una silueta típica en forma de ballesta, cola corta y levemente ahorquillada, y alas muy largas y estrechas, de aleteos lentos. Posee pico corto, plano y con la boca muy ancha; patas emplumadas y extremadamente cortas, que le impiden posarse en el suelo; y pies pequeños y de fuertes garras, con los cuatro dedos dirigidos hacia delante. Muestra coloración general pardo oliva, más oscura en las alas, con dos destacadas áreas blancas en el vientre y la garganta, separadas ambas por un collar parduzco. Ambos sexos son iguales. Los jóvenes resultan muy similares a los adultos, aunque un poco más oscuros y con plumas ribeteadas de blanco. Esta ave pasa la mayor parte de su vida en el aire, por lo que casi siempre se la ve volando y agrupada, tanto en núcleos urbanos como en acantilados costeros y de interior.',
  s.identification_tips = '',
  s.seasonality = 'Marzo a octubre',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Tachymarptis_melba_-Barcelona%2C_Spain_-flying-8.jpg?width=1280',
  s.image_attribution = 'Birdwatching Barcelona (CC BY-SA 2.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Tachymarptis melba';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Paloma zurita',
  s.primary_habitat = NULL,
  s.description = 'Paloma similar a la bravía, pero de tamaño algo menor, y más ligera que la torcaz. En su plumaje, totalmente gris, destacan los tonos vinosos del cuello, el color gris pálido del obispillo y unas franjas más claras en las alas. Ambos sexos resultan similares. Tiene un vuelo más rápido y con mayor frecuencia de aleteo que la torcaz. Al volar se ve oscura la zona inferior de sus alas, que es pálida en las palomas bravía y torcaz.',
  s.identification_tips = '',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/2019-03-17_Columba_oenas%2C_Jesmond_Dene_1.jpg?width=1280',
  s.image_attribution = 'MPF (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Columba oenas';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Gaviota patiamarilla',
  s.primary_habitat = 'Costas, puertos, playas, acantilados y basureros',
  s.description = 'La gaviota grande más común del Mediterráneo: manto gris claro, patas amarillas y un pico robusto con una mancha roja en la mandíbula inferior. Es oportunista hasta el extremo —pesca, roba, carroñea y frecuenta puertos y vertederos— y sus colonias ocupan islotes y cortados costeros.',
  s.identification_tips = 'Patas amarillas y pico amarillo con mancha roja
Manto gris claro con puntas de las alas negras y espejos blancos
Los jóvenes son pardos moteados y tardan cuatro años en cambiar',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Larus_michahellis_LC0046.jpg?width=1280',
  s.image_attribution = 'Jörg Hempel (CC BY-SA 2.0 de) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Larus michahellis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Chochín',
  s.primary_habitat = NULL,
  s.description = 'El chochín común es un pajarillo de pequeño tamaño, aspecto compacto, cabeza voluminosa y cola corta, que se caracteriza por poseer un plumaje pardo-rojizo —algo más claro en las partes inferiores— finamente vermiculado de tonos más oscuros. Sobre el ojo presenta una marcada ceja de color crema. El pico es fino y algo curvado, con distinta longitud según la subespecie. Las diferencias entre edades y sexos son muy sutiles y resultan difíciles de reconocer en el campo. De carácter inquieto, el chochín —una de las especies más pequeñas de nuestra avifauna— cuando se excita suele sacudir y levantar su cola formando un ángulo de 90 grados, antes de desaparecer entre la densa vegetación.',
  s.identification_tips = '',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Carri%C3%A7a%2C_carricinha%2C_carruira%2C_no_seu_canto_possante_e_melodioso%2C_Winter_Wren%2C_with_a_melodious_and_powerful_singing_(53737498699)_(cropped).jpg?width=1280',
  s.image_attribution = 'Luiz Lapa from Oeiras, Portugal (CC BY 2.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Troglodytes troglodytes';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Águila perdicera',
  s.primary_habitat = 'Sierras con cortados rocosos y amplias zonas abiertas de matorral y cultivo para cazar',
  s.description = 'Águila mediana de alas largas y cola larga, con el vientre blanco finamente rayado y una mancha blanca en la espalda que se ve bien en vuelo. Caza a gran velocidad y a poca altura, sorprendiendo a perdices, conejos y palomas. Las parejas ocupan el mismo cortado durante años.',
  s.identification_tips = 'Mancha blanca en el centro de la espalda, visible desde arriba
Vientre claro y muy rayado, con una banda oscura en el borde del ala
Vuelo bajo y rápido cuando caza, no en círculos altos',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Aguila_perdicera.jpg?width=1280',
  s.image_attribution = 'Paco Gómez from Castellón, Spain (CC BY-SA 2.0) · Wikimedia Commons',
  s.rarity_score = 5
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Aquila fasciata';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Alondra totovía',
  s.primary_habitat = 'Claros de bosque, dehesas y laderas con matorral y árboles dispersos',
  s.description = 'Alondra pequeña de cola muy corta y cresta discreta, con una ceja blanca ancha que se une en la nuca. Canta en vuelo circular, sobre todo al amanecer y en noches claras, con una frase melancólica y descendente de una belleza reconocida.',
  s.identification_tips = 'Cola muy corta, silueta rechoncha en vuelo
Cejas blancas que se juntan por detrás de la cabeza
Marca blanca y negra en el borde delantero del ala',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Lullula_arborea.jpg?width=1280',
  s.image_attribution = 'autor no indicado (Public domain) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Lullula arborea';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Abejero europeo',
  s.primary_habitat = 'Bosque con algunos claros, gran variedad de especies arbóreas.Desde el mar a 1600m, templado-húmedo',
  s.description = 'La coloración de esta especie presenta considerables diferencias individuales, de tal manera que han llegado a distinguirse hasta 10 fases de plumaje diferentes. Como norma, las partes inferiores son claras y están provistas de un profuso barreado transversal marronáceo, en tanto que las dorsales, parduzcas, resultan bastante más oscuras que las ventrales; la cola, por su parte, muestra un característico franjeado. En la cabeza, que presenta una tonalidad grisácea, destaca el iris intensamente amarillo. Dentro de este patrón general, existen notables variaciones, y se pueden hallar desde individuos muy claros hasta otros extremadamente oscuros, casi melánicos; en todo caso, los ejemplares de coloración intermedia son los más frecuentes. Aparte de algunas diferencias en el diseño y coloración del plumaje, el rasgo más distintivo entre machos y hembras es el mayor tamaño de estas. Los jóvenes, por su parte, tienden a ser oscuros, con el iris marrón. En vuelo es llamativo el barreado ventral, así como las franjas de la cola, si bien lo más significativo y que permite diferenciar fácilmente al abejero de otras rapaces similares, como el busardo ratonero, es su silueta, con la cabeza apuntada, la cola larga —de ángulos algo redondeados— y las alas rectas y estrechas.',
  s.identification_tips = '',
  s.seasonality = 'Mayo a septiembre',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Wespenbussard_European_honey_buzzard_Pernis_apivorus.jpg?width=1280',
  s.image_attribution = 'Andreas Trepte (CC BY-SA 2.5) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Pernis apivorus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Búho real',
  s.primary_habitat = 'Cortados rocosos, barrancos y laderas con matorral y zonas abiertas de caza',
  s.description = 'El mayor búho de Europa, con casi dos metros de envergadura, penachos de plumas erguidos sobre la cabeza y ojos de un naranja encendido. Caza conejos, ratas e incluso otras rapaces. Su canto es un «bu-bo» profundo que se propaga kilómetros por los barrancos en las noches de invierno.',
  s.identification_tips = 'Penachos de plumas erguidos a los lados de la cabeza
Ojos naranjas muy intensos
Canto grave y profundo en las noches de invierno',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Bubo_bubo_sibiricus_-_01.JPG?width=1280',
  s.image_attribution = 'Carlos Delgado (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Bubo bubo';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Gorrión chillón',
  s.primary_habitat = NULL,
  s.description = 'El chillón es un gorrión grande y corpulento, con la cabeza robusta y el pico muy fuerte. En su plumaje dominan los tonos marróngrisáceos con un profuso listado oscuro en el dorso. Las partes inferiores, por el contrario, son claras y están adornadas con amplias listas de color gris parduzco. En la cabeza destacan tres listas anchas: una clara; otra marrón-grisácea tras el ojo bajo aquella, y, por encima, una parda oscura. Otra lista de color marrón pálido recorre el píleo. Bajo la garganta presenta una mancha amarilla que a menudo permanece oculta o poco visible. En la cola aparecen unas manchas blancas hacia los extremos, que resultan bien visibles en vuelo. No hay diferencias de coloración entre machos y hembras. Los jóvenes son difíciles de distinguir de los adultos, incluso recién volados del nido. Se diferencian de estos por carecer de la mancha amarilla en la garganta. Asimismo, el dibujo de la cara presenta en ellos un aspecto poco definido y su coloración general es más suave.',
  s.identification_tips = '',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Petronia_petronia_-Ariege%2C_Midi-Pyrenee%2C_France-8-4c.jpg?width=1280',
  s.image_attribution = 'Petronia_petronia_-Ariege,_Midi-Pyrenee,_France-8.jpg: Sandra from … (CC BY 2.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Petronia petronia';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Lavandera cascadeña',
  s.primary_habitat = NULL,
  s.description = NULL,
  s.identification_tips = '',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Grey_Wagtail.jpg?width=1280',
  s.image_attribution = 'User:Kclama (CC SA 1.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Motacilla cinerea';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Collalba gris',
  s.primary_habitat = 'Pastizales pedregosos, canchales y zonas abiertas de montaña',
  s.description = 'Collalba de dorso gris en el macho, con antifaz negro y alas oscuras. Como todas las collalbas, delata su identidad al volar: obispillo blanco y cola blanca con una «T» negra invertida. Se posa erguida en piedras y hace carreras cortas por el suelo.',
  s.identification_tips = 'Obispillo blanco y «T» negra en la cola
Macho con antifaz negro y dorso gris
Carreras cortas por el suelo entre piedra y piedra',
  s.seasonality = 'Paso migratorio y cría en montaña',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Oenanthe_oenanthe_Larvik.JPG?width=1280',
  s.image_attribution = 'Arnstein Rønning (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Oenanthe oenanthe';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Papamoscas cerrojillo',
  s.primary_habitat = 'Zonas boscosas,de caducifolios, robles,hayas,pinares de altura,sotos espesos.Migrac:muy repartido,',
  s.description = 'Es un paseriforme de pequeño tamaño, cuerpo compacto, cabeza ancha y pico fino. Fuera de la época de reproducción no hay diferencias entre los sexos en lo que al plumaje se refiere, ya que ambos lo poseen de color pardo claro por el dorso y blanco ocre en las partes inferiores. Los ojos, las patas y el pico son negros. En primavera, los machos adquieren un plumaje nupcial negro o marrón muy oscuro en las partes superiores, con una llamativa mancha blanca en la frente y un extenso panel blanco en las alas. Las partes inferiores se aclaran hasta adquirir un color blanco puro. A menudo queda algún resto de plumaje pardo en la cabeza o en las coberteras del hombro. Los jóvenes recién salidos del nido, por su parte, presentan un plumaje, en general, muy moteado de marrón claro y pardo, con aspecto escamoso.',
  s.identification_tips = '',
  s.seasonality = 'Abril, mayo, junio, agosto, septiembre, octubre',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Ficedula_hypoleuca_NRM.jpg?width=1280',
  s.image_attribution = 'Uploaded by Aelwyn with the permission of the Author, who works wit… (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Ficedula hypoleuca';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Zarcero común',
  s.primary_habitat = 'Amplio espectro de hábitats,soleados,densa cobertura arbustiva,<2m altura.Zarzales,majuelos,jarales',
  s.description = 'Se trata de un pájaro de tamaño pequeño y tonos generales amarillo-verdosos. Presenta el dorso de color verde grisáceo y la zona ventral amarillenta (más pálida en los jóvenes). Es muy similar al raro zarcero icterino, del que resulta difícil de distinguir en el campo. Algunos ejemplares muy pálidos o con el plumaje muy desgastado pueden generar también confusión con otras especies, como el zarcero pálido o la curruca mosquitera. Ambos sexos son similares.',
  s.identification_tips = '',
  s.seasonality = 'Abril a septiembre',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Melodious_warbler_(Hippolais_polyglotta)%2C_Le_Petit_Loc''h%2C_Guidel%2C_Brittany%2C_France_(19765512360).jpg?width=1280',
  s.image_attribution = 'Frank Vassen from Brussels, Belgium (CC BY 2.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Hippolais polyglotta';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cárabo',
  s.primary_habitat = NULL,
  s.description = 'Lo primero que llama la atención en el aspecto del cárabo común es su voluminosa cabeza, en la que destacan unos enormes y globosos ojos negros, lo que, unido a la ausencia de penachos cefálicos (“orejas”) y a su aspecto rechoncho y robusto, permite diferenciarlo fácilmente del resto de nuestras rapaces nocturnas. Su plumaje resulta extraordinariamente mimético y presenta una gran variabilidad en cuanto a color, ya que existen ejemplares grisáceos, rojizos y marrones. En todos los casos, el diseño consiste en una compleja mezcla de punteados, barrados y vermiculados, que imitan a la perfección la corteza de los árboles. La cara es de color blancuzco, grisáceo o rojizo, y en ella destacan dos listas blanquecinas a modo de “cejas”.',
  s.identification_tips = '',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/%D0%A1%D0%BE%D0%B2%D1%91%D0%BD%D0%BE%D0%BA_%D0%A4%D0%B8%D0%BB%D1%8F%2C_%D0%A1%D0%B5%D1%80%D0%B0%D1%8F_%D0%BD%D0%B5%D1%8F%D1%81%D1%8B%D1%82%D1%8C_(Strix_aluco%2C_juv)%2C_%D0%A4%D0%B8%D0%BB%D1%91%D0%B2%D1%81%D0%BA%D0%B8%D0%B9_%D0%BF%D0%B0%D1%80%D0%BA.jpg?width=1280',
  s.image_attribution = 'Dion Art (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Strix aluco';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Buitrón',
  s.primary_habitat = NULL,
  s.description = 'Se trata de una de las aves más pequeñas de Europa. Posee el dorso y el píleo de color pardo oscuro y fuertemente listados, el obispillo rojizo y las partes inferiores claras con los flancos y el pecho de color ocráceo. En vuelo ejecuta una trayectoria muy ondulante y presenta una silueta característica, con las alas redondeadas y la cola —que suele mantener parcialmente desplegada— con un perfil también redondeado y de longitud creciente de los extremos hacia el centro. En su parte distal, la cola muestra una banda de manchas negras y blancas muy visibles en vuelo. Cuando se posa entre la vegetación, suele aferrarse a los tallos manteniendo la verticalidad a la vez que agita continuamente la cola.',
  s.identification_tips = '',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Zitting_cisticola_2024_04_19_(cropped).jpg?width=1280',
  s.image_attribution = 'Alexis Lours (CC BY 4.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Cisticola juncidis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Ruiseñor común',
  s.primary_habitat = 'Pisos bioclimáticos termo,meso,supramediterráneos,matorrales,sotos densos,montes bajos, jardines...',
  s.description = 'Ave estilizada, de pico fino y cola larga. Hembras y machos son iguales. Su manto y sus alas presentan un color pardo ocráceo uniforme, excepto en la cola, que posee un distintivo tono pardo rojizo. Las partes inferiores, mucho más claras, tienen color blanco crema. Este pájaro, muy escondidizo, rara vez abandona la protección de la espesura de la vegetación, pero resulta muy fácil de detectar por su inconfundible canto, muy sonoro, emitido incansablemente durante el día y la noche. Los jóvenes volantones, previamente a la muda parcial de su plumaje que tiene lugar antes de que comience la migración, exhiben un plumaje pardo que muestra plumas manchadas en su extremo con motas amarillentas. Los adultos se pueden confundir con carriceros comunes y ruiseñores bastardos, con los que a veces conviven en malezas ribereñas. Sin embargo, los carriceros presentan un tono ocre más pálido y amarillento, y carecen de la cola rojiza que luce el ruiseñor común. Lo mismo sucede con el ruiseñor bastardo, que además tiene una conspicua línea blanca sobre el ojo y posee unas alas y una cola cortas y redondeadas.',
  s.identification_tips = '',
  s.seasonality = 'Abril a septiembre',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Luscinia_megarhynchos_-_01.jpg?width=1280',
  s.image_attribution = 'Carlos Delgado (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Luscinia megarhynchos';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Milano negro',
  s.primary_habitat = NULL,
  s.description = 'Esta rapaz de mediano tamaño y coloración general bastante oscura se caracteriza por poseer unas alas más bien largas, así como una larga cola ahorquillada, si bien bastante menos que la de su cercano pariente, el milano real, que ofrece un aspecto más estilizado y es de mayor tamaño. El adulto luce una coloración considerablemente oscura en conjunto, aunque con la cabeza de color grisáceo y finamente listada; las partes inferiores se muestran algo rojizas y aparecen surcadas longitudinalmente por motas alargadas, en tanto que las coberteras alares presentan bordes bastante claros, por lo que definen un característico dibujo dorsal. La cola es marrón-grisácea con abundante barrado. El plumaje del joven es más claro y ostenta un patente moteado pálido en las regiones ventrales, mientras que en las dorsales las coberteras aparecen orladas de color crema, lo que le otorga un aspecto escamoso. La cola no es tan ahorquillada como en el adulto (a veces incluso carece de escotadura), en tanto que las alas, en su parte inferior, muestran dos grandes parches más claros que el resto, aunque no demasiado evidentes. En vuelo, el milano negro es un ave ágil que muestra una extraordinaria capacidad para maniobrar en el aire, aunque no resulta tan elegante como el milano real.',
  s.identification_tips = '',
  s.seasonality = 'Marzo a septiembre',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Milvus_migrans_front(ThKraft).jpg?width=1280',
  s.image_attribution = 'Thomas Kraft (ThKraft) (CC BY-SA 2.5) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Milvus migrans';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Aguilucho lagunero occidental',
  s.primary_habitat = 'Masas de vegetación palustre,lagunas, ríos y pantanos.Nidos en vegetación a pocos cm del agua,suelo',
  s.description = 'El aguilucho lagunero es una rapaz de tamaño medio y aspecto bastante estilizado, aunque ciertamente más robusto que los restantes aguiluchos presentes en nuestra fauna, a los que también supera en envergadura. La especie presenta, como es habitual en otros miembros del género Circus, un acusado dimorfismo sexual, ya que la hembra es bastante mayor y más pesada que el macho, y ambos sexos exhiben plumajes muy diferentes. En el macho adulto predominan los tonos marrones en el dorso, aunque la cabeza y la nuca son amarillentas o ligeramente grisáceas y surcadas por finas estrías oscuras. Las partes inferiores —especialmente a la altura de las patas y el bajo vientre— suelen adquirir un color rojizo, que va dando paso al crema o blanco sucio a medida que subimos hacia el pecho y la garganta, los cuales aparecen suavemente listados. Las rectrices y rémiges secundarias son grises; estas últimas describen una extensa banda alar, muy visible en vuelo . Ventralmente, las alas del macho son más bien claras —blancuzcas o de color gris pálido— y en ellas destacan fuertemente las negras rémiges primarias. Las hembras adultas, por su parte, resultan bastante más oscuras y menos contrastadas, en conjunto, que sus parejas, pues lucen un plumaje —tanto dorsal como ventralmente— dominado por los tonos pardoachocolatados, que en la cabeza, la garganta y los hombros son sustituidos por otros amarillentos o blanquecinos. Los ejemplares recién salidos del nido se parecen bastante a las hembras, aunque resultan más homogéneos y ligeramente más oscuros; además, solo presentan manchas más claras en la cabeza, la nuca y la garganta. Entre la librea juvenil y la de adulto existen varios plumajes de transición, que definen las diferentes edades del ave. Por otra parte, el aguilucho lagunero es una especie en la que no son infrecuentes los casos de melanismo y la aparición de diseños atípicos, lo que en ocasiones puede dificultar su identificación y propiciar las confusiones con especies de tamaño semejante.',
  s.identification_tips = '',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Circus_aeruginosus_samiec2.jpg?width=1280',
  s.image_attribution = 'Artur Mikołajewski (CC BY 2.5) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Circus aeruginosus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Herrerillo común',
  s.primary_habitat = NULL,
  s.description = 'Sus alas, cola y cabeza exhiben un bello color azulado, que se completa con un collar azul cobalto. El dorso posee tintes verdosos, y las partes inferiores son amarillentas. Presenta mejillas de color blanco en los adultos y amarillo pálido en los volantones. La coloración general podría recordar a la de un carbonero común. Pero este es notablemente mayor, con la cabeza negra y una banda de igual color que divide en dos el amarillo del pecho.',
  s.identification_tips = '',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Eurasian_blue_tit_Lancashire.jpg?width=1280',
  s.image_attribution = 'Francis Franklin (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Cyanistes caeruleus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Alcotán',
  s.primary_habitat = 'Campo abierto con arbolado disperso, cerca de zonas húmedas',
  s.description = 'Halcón esbelto con silueta de vencejo gigante: alas muy largas y afiladas y cola corta. Caza libélulas e incluso vencejos en pleno vuelo, con una agilidad extraordinaria. Los adultos tienen los «calzones» y la zona anal de un rojo ladrillo característico.',
  s.identification_tips = 'Silueta de hoz, como un vencejo enorme
Calzones y bajo vientre rojizos en el adulto
Bigotera negra ancha sobre garganta blanca',
  s.seasonality = 'Primavera y verano (estival)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Hobby_-_Falco_subbuteo.jpg?width=1280',
  s.image_attribution = 'Andy Morffew from Itchen Abbas, Hampshire, UK (CC BY 2.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Falco subbuteo';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Chotacabras europeo',
  s.primary_habitat = 'Claros de bosque, brezales y matorral con suelo desnudo',
  s.description = 'Ave nocturna de plumaje jaspeado que descansa de día tumbada a lo largo de una rama o en el suelo, confundida con la corteza. Caza polillas al vuelo con la boca enorme. Su canto es un ronroneo continuo y mecánico que puede durar minutos sin pausa.',
  s.identification_tips = 'Canto como un motor lejano, continuo y vibrante
Vuela al anochecer con giros silenciosos y bruscos
El macho muestra manchas blancas en alas y cola',
  s.seasonality = 'Primavera y verano (estival)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Nachtzwaluw_-_European_nightjar_-_Caprimulgus_europaeus_2.jpg?width=1280',
  s.image_attribution = 'Bouke ten Cate (CC BY 4.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Caprimulgus europaeus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Lechuza común',
  s.primary_habitat = 'Es una especie típica de paisajes humanizados con áreas agrícolas en mosaico',
  s.description = 'El único representante de la familia Tytonidae en territorio europeo es una rapaz de tamaño medio, aspecto esbelto, largas patas y voluminosa cabeza, que luce un contrastado plumaje en el que predominan los tonos leonados y dorados en el dorso y el blanco puro —incluso ligeramente plateado— en las zonas ventrales. Las plumas dorsales y la parte superior de las alas y la cola aparecen finamente vermiculadas por sutiles punteados de color negro, gris y blancuzco, en tanto que las regiones ventrales pueden mostrar un moteado variable. En el rostro —inconfundible por su forma de corazón— destacan los ojos intensamente negros y el prominente pico de color claro. Los jóvenes poseen un plumaje muy similar al de los adultos, de los que se diferencian por sutiles detalles, difíciles de distinguir en el campo. El vuelo de esta rapaz nocturna —de alas largas y relativamente anchas— es elegante, silencioso y ágil gracias al escaso peso del ave. No es raro ver a la lechuza cernirse hábilmente sobre un punto, mientras escudriña el terreno en busca de presas.',
  s.identification_tips = '',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Tyto_alba_close_up.jpg?width=1280',
  s.image_attribution = 'Stevie B (CC BY 2.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Tyto alba';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Águila pescadora',
  s.primary_habitat = NULL,
  s.description = 'Rapaz de mediano tamaño. Los adultos poseen partes inferiores blancas, con un moteado variable en el pecho; los individuos que tienen un collar de estrías más marcado en el pecho suelen ser hembras. Como contraste presentan partes superiores muy oscuras. El píleo es blanco, y tras el ojo aparece una lista ocular, a modo de antifaz, que recorre parte del cuello. En vuelo exhiben una silueta bastante característica, con cola corta y alas relativamente estrechas y “anguladas”. Vistos desde abajo, el cuerpo y las partes anteriores del ala, blancas, contrastan con las franjas oscuras que recorren las plumas de vuelo. La cola muestra una sucesión de barras oscuras. El joven es muy similar, pero sus partes superiores parecen como escamadas —debido al borde pálido en las plumas— y, en vuelo, las secundarias resultan algo más pálidas que en los adultos, con un barreado más patente. Cuando el águila pescadora vuela en busca de alimento, es capaz de cernirse con profundos aleteos antes de lanzarse al agua para capturar los peces con sus garras.',
  s.identification_tips = '',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/2010-kabini-osprey.jpg?width=1280',
  s.image_attribution = 'Yathin S Krishnappa (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Pandion haliaetus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Terrera común',
  s.primary_habitat = 'Llanos de cultivo, eriales y pastizales rasos con suelo desnudo',
  s.description = 'Alondra pequeña y pálida de aspecto muy limpio, con el pecho sin apenas rayado salvo una mancha oscura a cada lado del cuello. Anida en el suelo, en cultivos y baldíos. En migración se agrupa en bandos que se levantan del suelo todos a la vez.',
  s.identification_tips = 'Mancha oscura a cada lado del cuello, como un botón
Pecho limpio, sin rayado extenso
Ceja clara y pico corto y grueso de granívora',
  s.seasonality = 'Primavera y verano (estival)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Alondra.jpg?width=1280',
  s.image_attribution = 'Juan Lacruz (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Calandrella brachydactyla';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Mosquitero musical',
  s.primary_habitat = 'Bosques abiertos de frondosas, robledales, hayedos,castañares,arbustos,a media altura, media altura..',
  s.description = 'Presenta gran parecido con otros congéneres, especialmente los mosquiteros común e ibérico, de los que se diferencia por poseer el pico y las patas pálidos, las listas faciales más marcadas —con una lista superciliar muy patente—, las partes inferiores más amarillas y el dorso de un tono verdoso más brillante.',
  s.identification_tips = '',
  s.seasonality = 'Marzo, abril, mayo, agosto, septiembre, octubre',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Willow_Warbler_Phylloscopus_trochilus.jpg?width=1280',
  s.image_attribution = 'Andreas Trepte (CC BY-SA 2.5) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Phylloscopus trochilus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Garza real',
  s.primary_habitat = 'Se distribuye en invierno por zonas de aguas remansadas y poco profundas, coincidiendo con su carácter eminentemente ictiófago',
  s.description = 'La garza real es un ave de gran tamaño —la mayor de las ardeidas que frecuentan nuestro país—, de figura estilizada, largo cuello y coloración general grisácea, con un diseño variable según la edad y la época del año. Durante el periodo reproductor, la cabeza de los adultos luce una coloración blanca y aparece adornada por una línea negra y un par de largas plumas de este mismo color, en tanto que el cuello, blanco también, se halla surcado longitudinalmente por dos bandas paralelas negruzcas. El largo y afilado pico presenta un tono rojizo, y las regiones dorsales son mayoritariamente cenicientas, con una llamativa mancha negra en los hombros. Fuera de la época de cría, el diseño es menos contrastado, sin las plumas ornamentales de la cabeza y con el pico amarillento. En vuelo adopta la postura característica de las garzas, con el cuello encogido en forma de “S” y las patas estiradas sobresaliendo por detrás de la cola, si bien la garza real resulta fácilmente diferenciable del resto de sus parientes debido a su gran tamaño.',
  s.identification_tips = '',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Ardea_cinerea_-_Pak_Thale.jpg?width=1280',
  s.image_attribution = 'JJ Harrison (https://www.jjharrison.com.au/) (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Ardea cinerea';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Halcón de Eleonora',
  s.primary_habitat = 'Estival presente de abril a primeros de noviembre',
  s.description = 'Este halcón de mediano tamaño y aspecto estilizado se caracteriza por presentar varias fases de plumaje que nada tienen que ver con el sexo, pues machos y hembras se diferencian, además de por su tamaño —las hembras son mayores—, por tener la cera del pico, así como el anillo ocular, de diferente color (amarillo en el macho y grisáceo en la hembra). Los ejemplares adultos de plumaje más claro se parecen, en cierta medida, a un alcotán que tuviera las partes inferiores de color canela. Las zonas superiores y el píleo son de color pardo oscuro; las calzas y el vientre, rojizos y barrados; y las mejillas, pálidas y surcadas por una marcada bigotera. En el aire da la impresión de ser bastante oscuro por debajo, con las plumas de vuelo algo más pálidas. El adulto de plumaje intermedio es similar al anterior, pero las mejillas y el vientre resultan más oscuros, y carece de las tonalidades herrumbre de la fase clara. El adulto oscuro, por su parte, luce un plumaje completamente negruzco (aunque hay variantes de garganta y mejillas pálidas), algo más intenso en el dorso y ligeramente achocolatado —con un finísimo barrado apenas visible— en las regiones ventrales. En vuelo se ve un ave muy oscura, pero con las rémiges y rectrices más claras. El joven pálido es similar al adulto de la misma fase, pero más pardo en general y sin calzas rojizas, aunque con orlas claras en las plumas coberteras, lo que le da un cierto aspecto escamoso. El joven oscuro es completamente negruzco, con las rémiges y rectrices más pálidas y barradas.',
  s.identification_tips = '',
  s.seasonality = 'Mayo a octubre',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Eleonorenfalke1.jpg?width=1280',
  s.image_attribution = 'Jürgen Dietrich (CC BY 3.0 de) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Falco eleonorae';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Acentor alpino',
  s.primary_habitat = 'Roquedos y pedreras de alta montaña; en invierno baja a cortados',
  s.description = 'Pájaro robusto de montaña, pardo y discreto salvo por dos detalles: los flancos con listas castañas y una garganta blanca finamente moteada de negro. Camina entre las rocas buscando insectos y semillas, y en invierno desciende a cortados y construcciones.',
  s.identification_tips = 'Flancos con anchas listas castañas
Garganta blanca con motas negras, como un babero
Base del pico amarilla',
  s.seasonality = 'Otoño e invierno en cotas bajas',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Alpine_accentor_saganta.jpg?width=1280',
  s.image_attribution = 'Paco Gómez from Castellón, Spain (CC BY-SA 2.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Prunella collaris';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Garcilla bueyera',
  s.primary_habitat = NULL,
  s.description = 'Esta garza de pequeño o mediano tamaño y formas bastante compactas se caracteriza por tener el cuello, las patas y el pico relativamente cortos y por el color mayoritariamente blanco de su plumaje, en el que apenas se aprecian diferencias sexuales. En el individuo adulto durante la época nupcial predomina el color blanco, pero adornado con tonos entre ocráceos y anaranjados en el píleo, la nuca, el pecho y la espalda; además, luce un intenso color rojizo en el pico, el ojo y las patas. El ave no reproductora es mucho más pálida, con un ligero tinte ocráceo en el píleo, el pico amarillo y las patas de un color muy variable. El joven es similar al adulto no reproductor, pero completamente blanco. Esta ave resulta muy blanca y rechoncha en vuelo, con las formas más compactas que otras garzas.',
  s.identification_tips = '',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Cattle_Egret_(Bubulcus_ibis)_Crop.jpg?width=1280',
  s.image_attribution = 'Cattle_Egret_(Bubulcus_ibis)_-Florida_Keys.jpg: Stig Nygaard deriva… (CC BY 2.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Bubulcus ibis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cigüeñuela',
  s.primary_habitat = 'Salinas, marismas, charcas someras y humedales salobres',
  s.description = 'Limícola blanca y negra de patas rosadas larguísimas, desproporcionadas para su tamaño, que le permiten caminar por aguas someras picoteando insectos en la superficie. Es ruidosa y muy territorial cerca del nido, y sobrevuela en círculos a quien se acerca.',
  s.identification_tips = 'Patas rojizas extremadamente largas, que sobresalen en vuelo
Contraste limpio de blanco y negro, con pico fino y recto
Reclamo insistente y chillón al sobrevolar al intruso',
  s.seasonality = 'Sobre todo de primavera a verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Himantopus_himantopus.jpg?width=1280',
  s.image_attribution = '(Hans Hillewaert) (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Himantopus himantopus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Acentor común',
  s.primary_habitat = NULL,
  s.description = 'Pájaro del tamaño de un gorrión común, con el pico fino y puntiagudo, y las patas fuertes y rojizas. De comportamiento huidizo, le gusta moverse entre la vegetación baja y caminar por el suelo. Tiene las partes superiores del plumaje marrones y con escamado pardo oscuro, semejantes al dorso de un gorrión común. La cabeza, la garganta y el pecho son de un color gris plomizo, más intenso en los machos, con la zona auricular y el píleo marrones. Las partes posteriores del vientre poseen un tono gris más claro, con los flancos marrones. Los jóvenes exhiben cabeza y garganta de color castaño, en lugar de gris, y muestran todo el plumaje fuertemente listado de pardo oscuro. La base de su pico es naranja amarillenta, mientras que los adultos presentan todo el pico negro.',
  s.identification_tips = '',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Acentor_com%C3%BAn23_by_Paco_G%C3%B3mez.jpg?width=1280',
  s.image_attribution = 'Paco Gómez (CC BY-SA 2.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Prunella modularis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Tarabilla norteña',
  s.primary_habitat = 'Herbazales, prados altos y cultivos con tallos donde posarse',
  s.description = 'Tarabilla migradora que solo se ve en los pasos. Se distingue de la europea por una ceja blanca ancha y muy marcada y por las bases blancas de la cola. Como su parienta, se posa en lo alto de tallos y matas y baja al suelo a cazar insectos.',
  s.identification_tips = 'Ceja blanca ancha y bien marcada
Base de la cola blanca a ambos lados
Pecho anaranjado que va difuminándose hacia el vientre',
  s.seasonality = 'Paso migratorio',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Saxicola_rubetra_poklaskwa_AM.jpg?width=1280',
  s.image_attribution = 'Artur Mikołajewski (CC BY 2.5) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Saxicola rubetra';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Zampullín común',
  s.primary_habitat = 'Charcas, embalses, ramblas remansadas y canales con vegetación',
  s.description = 'El más pequeño de los somormujos, rechoncho y sin cola aparente, que pasa más tiempo bajo el agua que sobre ella. En primavera luce las mejillas y el cuello de color castaño y una mancha amarilla en la comisura del pico. Su reclamo es un relincho agudo y vibrante muy característico.',
  s.identification_tips = 'Silueta redonda, sin cola visible, como un corcho
Se sumerge sin salpicar y reaparece lejos
Relincho agudo y tembloroso desde la vegetación',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Zwergtaucher_060319_3.jpg?width=1280',
  s.image_attribution = 'autor no indicado (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Tachybaptus ruficollis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Mirlo capiblanco',
  s.primary_habitat = 'Montaña con matorral y pastos; en paso, sierras con enebros y bayas',
  s.description = 'Mirlo de montaña que se distingue del común por una banda blanca en forma de media luna sobre el pecho y por las plumas del ala ribeteadas de claro, que dan un aspecto escamado. Es muy desconfiado y se aleja en cuanto detecta movimiento.',
  s.identification_tips = 'Media luna blanca en el pecho
Alas con aspecto escamado y plateado
Mucho más esquivo que el mirlo común',
  s.seasonality = 'Paso migratorio e invernada en montaña',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/2015-04-20_Turdus_torquatus_torquatus_Cairngorm_3.jpg?width=1280',
  s.image_attribution = 'MPF (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Turdus torquatus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Críalo',
  s.primary_habitat = 'Bosques,zonas con córvidos',
  s.description = 'Es un ave de tamaño medio, morfológicamente muy semejante al cuco, del que se diferencia por su aspecto más esbelto, por tener una cola más larga y por el colorido del plumaje. Este es de tono marrón grisáceo en las regiones dorsales, que aparecen salpicadas de motas blancas, al igual que ocurre con las plumas del ala. La zona ventral es de color blanquecino, con la garganta teñida de ocre-amarillento. En la cabeza luce un capirote de color gris plateado —que remata en una pequeña cresta ligeramente eréctil— y un anillo ocular rojo. El joven presenta una coloración incluso más vistosa que los adultos, pues exhibe un intenso color achocolatado con abundantes motas blancas en el dorso y unas regiones ventrales blancas, que se tornan amarillo-ocráceas en pecho y cuello. Las plumas de vuelo poseen un vistoso color rojizo, en tanto que el capirote es negro y el anillo ocular más conspicuo que el de los adultos.',
  s.identification_tips = '',
  s.seasonality = 'Febrero a julio',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Clamator_glandarius.jpg?width=1280',
  s.image_attribution = 'autor no indicado (Public domain) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Clamator glandarius';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Colirrojo real',
  s.primary_habitat = 'Bosques abiertos, sotos y arboledas con huecos para criar',
  s.description = 'Pájaro elegante con la cola de un naranja encendido que hace vibrar sin parar al posarse. El macho tiene la garganta negra, la frente blanca y el pecho anaranjado; la hembra es parda pero conserva la misma cola vibrante, que es la mejor pista para identificarlos.',
  s.identification_tips = 'Cola naranja que tiembla constantemente
Macho con frente blanca y garganta negra
Se posa en ramas bajas y baja al suelo a por insectos',
  s.seasonality = 'Paso migratorio',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Common_Redstart_-_Segrate_-_Italy_S4E2518-1_(19357313382).jpg?width=1280',
  s.image_attribution = 'Francesco Veronesi from Italy (CC BY-SA 2.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Phoenicurus phoenicurus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Garceta común',
  s.primary_habitat = 'Marismas, salinas, ramblas con agua, arrozales y orillas costeras',
  s.description = 'Garza blanca y esbelta, de tamaño medio, con el pico negro y las patas negras rematadas en unos pies amarillos llamativos. Pesca removiendo el fondo con esas patas para levantar peces y camarones. En época de cría luce dos plumas largas y finas en la nuca.',
  s.identification_tips = 'Pies amarillos al final de patas negras
Pico negro y fino, no amarillo
Remueve el fondo con una pata mientras acecha',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Aigrette_garzette_au_lac_sud_de_Tunis_(site_RAMSAR).jpg?width=1280',
  s.image_attribution = 'El Golli Mohamed (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Egretta garzetta';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Bisbita campestre',
  s.primary_habitat = 'Llanos secos, pastizales ralos y claros pedregosos con poca vegetación',
  s.description = 'Bisbita grande, esbelto y de tonos arena, con muy poco rayado en el pecho comparado con sus parientes. Camina por el suelo desnudo moviendo la cola arriba y abajo. Anida entre piedras y matas bajas, y su canto es una frase corta y monótona que emite en vuelo.',
  s.identification_tips = 'Pecho casi liso, sin el rayado denso de otros bisbitas
Camina en vez de saltar, meneando la cola
Ceja clara marcada y patas largas y pálidas',
  s.seasonality = 'Primavera y verano (estival)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/AnthusCampestris_cropped.jpg?width=1280',
  s.image_attribution = 'AnthusCampestris.jpg: Lip Kee derivative work: Bogbumper (talk) (CC BY-SA 2.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Anthus campestris';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Codorniz común',
  s.primary_habitat = 'Cereales, herbazales altos y pastizales densos',
  s.description = 'La más pequeña de nuestras gallináceas y la única migradora. Es mucho más fácil de oír que de ver: su canto trisilábico —el clásico «pal-pa-lá»— se emite desde el interior del cereal. Solo levanta el vuelo cuando se la pisa casi encima, y lo hace en línea recta y rasante.',
  s.identification_tips = 'Canto trisilábico repetido desde dentro del herbazal
Vuela raso y en línea recta al levantarse
Del tamaño de un puño, mucho menor que una perdiz',
  s.seasonality = 'Primavera y verano (estival)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Quaglia.jpg?width=1280',
  s.image_attribution = 'Raniero Massoli Novelli (CC BY 2.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Coturnix coturnix';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Mosquitero papialbo',
  s.primary_habitat = 'Forestal termófila,laderas de solana.Nidos:bosque planifolio,conífera.Zona montana,submediterránea',
  s.description = 'El papialbo presenta la típica silueta de los mosquiteros: cuerpecillo rechoncho, patas frágiles y pico fino, pero se diferencia de los demás por su coloración general mucho más clara, especialmente en la cabeza y las partes ventrales. Las patas son negras y las alas, el dorso y las partes exteriores de la cola, verdosos, en contraste con el resto del cuerpo, de color blanquecino. La especie no manifiesta dimorfismo sexual.',
  s.identification_tips = '',
  s.seasonality = 'Abril a agosto',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Western_Bonelli''s_Warbler_-_Aosta_Valley_-_Italy_S4E5346_(19079885220).jpg?width=1280',
  s.image_attribution = 'Francesco Veronesi from Italy (CC BY-SA 2.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Phylloscopus bonelli';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Curruca mosquitera',
  s.primary_habitat = 'Campiñas verdes,sotos,orlas de bosque,zonas de vegetación ribereña,masas arboladas con sotobosque..',
  s.description = 'Pajarillo de fisonomía más compacta y robusta que la de otras currucas —aunque bastante similar a la de la curruca capirotada—, con cabeza más redondeada y pico más corto y grueso. Un fino anillo orbital rodea al ojo. De todas formas, se trata de un ave que no cuenta con rasgos distintivos realmente identificativos o llamativos, y su aspecto general resulta bastante uniforme. Presenta las partes ventrales de color ante pálido y el dorso pardo-grisáceo. En torno a su cuello destaca ligeramente un discreto collar más grisáceo. Ambos sexos son iguales.',
  s.identification_tips = '',
  s.seasonality = 'Abril, mayo, agosto, septiembre, octubre',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Sylvia_borin_(%C3%96rebro_County).jpg?width=1280',
  s.image_attribution = 'Biillyboy (CC BY 2.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Sylvia borin';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Porrón pardo',
  s.primary_habitat = NULL,
  s.description = 'Este pato buceador de pequeño o mediano tamaño y cuerpo bastante corto presenta una cabeza con el característico perfil de porrón, es decir, frente alta y píleo apuntado. El macho adulto en plumaje nupcial exhibe una bella tonalidad herrumbre o castaño intenso, más oscuro en el dorso y más pálido en los flancos. El iris es de color blanco, por lo que destaca vivamente sobre el plumaje de la cabeza. La hembra adulta resulta más sombría y menos contrastada y tiene el iris de color pardo. Los jóvenes son similares a la hembra adulta, pero de color más apagado, en general. En vuelo se observan muy nítidamente unas anchas bandas de color blanco puro que llegan hasta los extremos alares, así como la coloración blanca del vientre y la popa.',
  s.identification_tips = '',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Aythya_nyroca_at_Martin_Mere_1.jpg?width=1280',
  s.image_attribution = 'Francis Franklin (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 5
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Aythya nyroca';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cetia ruiseñor',
  s.primary_habitat = NULL,
  s.description = 'Se trata de un pájaro de pequeño tamaño, de diseño muy discreto y aspecto rechoncho, con alas y cola redondeadas. Presenta el dorso de color pardo-rojizo oscuro y las zonas inferiores grisáceas, con motas claras en las infracoberteras caudales. Posee una ceja pálida, así como una zona auricular grisácea y un pico muy fino. Ambos sexos son iguales en apariencia y solamente se diferencian por pequeñas variaciones de tamaño. De hábitos escondidizos, resulta difícil de observar, pero es, en cambio, muy fácil de detectar en las espesas marañas ribereñas que frecuenta por su inconfundible y sonoro canto. Cuando se desplaza entre la vegetación, levanta y despliega frecuentemente la cola.',
  s.identification_tips = '',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/37-090505-cettis-warbler-at-Kalloni-east-river.jpg?width=1280',
  s.image_attribution = 'Mark S Jobling (CC BY 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Cettia cetti';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Milano real',
  s.primary_habitat = NULL,
  s.description = 'En el plumaje de esta mediana rapaz dominan los tonos rojizos, profusamente rayados de oscuro en las regiones ventrales y con un característico aspecto orlado en el dorso debido a los bordes pálidos de las coberteras alares. La cabeza y el cuello, por su parte, presentan un tono gris pálido surcado por finas estrías muy oscuras. En vuelo resulta inconfundible, no solo por la extraordinaria habilidad con la que ejecuta todo tipo de maniobras y regates, sino por poseer una silueta característica, en la que destacan una cola profundamente ahorquillada, de color rojizo anaranjado, y unas largas alas acodadas y provistas de una mancha blanca muy visible. Cuando está posado, también resulta fácil diferenciarlo de otras rapaces de tamaño similar, además de por la forma de la cola, por poseer una figura bastante estilizada. Los jóvenes son similares a los adultos, aunque con una coloración general más clara y uniforme, sin el característico tono grisáceo de la cabeza y con la cola más corta y menos ahorquillada.',
  s.identification_tips = '',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Milvus_milvus_R(ThKraft).jpg?width=1280',
  s.image_attribution = 'Thomas Kraft (ThKraft) (CC BY-SA 2.5) · Wikimedia Commons',
  s.rarity_score = 5
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Milvus milvus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Avión zapador',
  s.primary_habitat = 'Cría:en colonias excadas en taludes arenosos junto a ríos o lagos,muros.Dormideros en carrizales',
  s.description = 'Se trata del menor de nuestros aviones y golondrinas, aunque sólo es ligeramente más pequeño que el resto. Exhibe partes superiores de color pardo mate e inferiores blanquecinas, con límites netos entre ambas. Posee alas largas y apuntadas, que en vuelo destacan por su parte inferior y anterior más oscura. Tiene cola corta levemente ahorquillada, patas cortas sin emplumar, boca muy ancha, y pico corto, plano y negro. Resulta característica la ancha banda transversal de color pardo en el pecho. Ambos sexos son iguales. Los jóvenes, muy similares a los adultos, presentan la cabeza, el cuello y el bajo vientre teñidos de color cremarojizo, en tanto que las plumas del dorso y la cabeza muestran bordes pálidos. El avión zapador suele observarse en grupos, tanto en vuelo como posado en taludes y cables, y está más ligado al agua que otros aviones y golondrinas.',
  s.identification_tips = '',
  s.seasonality = 'Marzo a septiembre',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Riparia_riparia.jpg?width=1280',
  s.image_attribution = 'Axel Strauß (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Riparia riparia';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Treparriscos',
  s.primary_habitat = 'Paredes rocosas, cantiles y barrancos; en invierno baja a roquedos y edificios',
  s.description = 'Pájaro de alta montaña que trepa por paredes verticales agitando las alas como una mariposa gigante, mostrando unos vistosos paneles rojos. Extrae insectos de las grietas con un pico largo y fino. En invierno desciende y puede aparecer en cortados bajos, castillos y presas.',
  s.identification_tips = 'Manchas rojo carmín en las alas al abrirlas
Trepa por la roca a saltos, aleteando sin parar
Pico largo, fino y algo curvado',
  s.seasonality = 'Otoño e invierno fuera de la alta montaña',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Tichodroma_muraria02_cropped.jpg?width=1280',
  s.image_attribution = 'derivative work: Hämbörger (talk) Tichodroma_muraria02.jpg: User:Kulac (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Tichodroma muraria';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Aguilucho cenizo',
  s.primary_habitat = 'Cerealistas, herbazales y matorral bajo en zonas llanas',
  s.description = 'Aguilucho grácil y de alas largas y estrechas que patrulla a poca altura, basculando con el viento y con las alas en «V». El macho es gris ceniza con las puntas negras; la hembra, parda y listada, con un obispillo blanco. Cría en el suelo, entre la vegetación.',
  s.identification_tips = 'Vuelo bajo y balanceante, con las alas en «V»
Macho gris ceniza con una barra negra en el ala
Alas muy largas y estrechas en proporción al cuerpo',
  s.seasonality = 'Primavera y verano (estival)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Flickr_-_don_macauley_-_Bird_015.jpg?width=1280',
  s.image_attribution = 'Donald Macauley (CC BY-SA 2.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Circus pygargus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Escribano cerillo',
  s.primary_habitat = NULL,
  s.description = 'Se trata de un escribano de considerable tamaño y cola larga, en el que predominan los tonos acastañados, amarillentos y pardogrisáceos. El macho, durante la época de cría, luce la cabeza y el vientre de un brillante amarillo, con el característico antifaz de tres bandas propio de los escribanos muy desdibujado, casi inexistente, mientras que el pecho y el obispillo se tornan rojizos. La librea de la hembra se asemeja a la del macho durante el periodo invernal; en ella dominan las coloraciones más apagadas, grisáceas y pardas, con tonos amarillos más pálidos y menos extendidos. Los jóvenes se parecen mucho a las hembras, pero son más grisáceos, con apenas una leve tonalidad amarilla en la región ventral.',
  s.identification_tips = '',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Emberiza_citrinella_-New_Zealand_-North_Island-8.jpg?width=1280',
  s.image_attribution = 'Alan Vernon (CC BY 2.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Emberiza citrinella';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Buitre común',
  s.primary_habitat = 'Sierras con cortados para criar; se alimenta en campo abierto',
  s.description = 'Buitre grande y pardo, con la cabeza y el cuello cubiertos de plumón blanco y una gorguera de plumas en la base del cuello. Planea horas sin batir las alas aprovechando las térmicas, y localiza los cadáveres vigilando lo que hacen los demás buitres a kilómetros de distancia.',
  s.identification_tips = 'Alas enormes y rectangulares, con los «dedos» separados
Cabeza pálida y pequeña en proporción al cuerpo
Planea en círculos sin apenas batir las alas',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Vulture_beak_sideview_A.jpg?width=1280',
  s.image_attribution = 'Thermos (CC BY-SA 2.5) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Gyps fulvus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Reyezuelo sencillo',
  s.primary_habitat = NULL,
  s.description = 'Junto a su cercano pariente, el listado, el reyezuelo sencillo es una de las aves más pequeñas de Europa. Presenta el dorso verdoso, con alas más oscuras sobre las que destaca una franja blanquecina. Se diferencia de su pariente por carecer de la lista superciliar clara, así como de la lista ocular negra. Dos tiras negras —que no se unen en la frente— surcan su píleo, flanqueando una tercera banda frontal más ancha de color naranja en los machos y amarillo en las hembras. Los jóvenes carecen de todas estas listas.',
  s.identification_tips = '',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/%D0%96%D0%B5%D0%BB%D1%82%D0%BE%D0%B3%D0%BE%D0%BB%D0%BE%D0%B2%D1%8B%D0%B9_%D0%BA%D0%BE%D1%80%D0%BE%D0%BB%D1%91%D0%BA_(Regulus_regulus)%2C_%D0%91%D0%B8%D1%82%D1%86%D0%B5%D0%B2%D1%81%D0%BA%D0%B8%D0%B9_%D0%BB%D0%B5%D1%81.jpg?width=1280',
  s.image_attribution = 'Dion Art (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Regulus regulus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Esmerejón',
  s.primary_habitat = 'Llanos abiertos, marismas y pastizales durante la invernada',
  s.description = 'El halcón más pequeño de Europa, poco mayor que un mirlo, con vuelo rápido y bajo pegado al terreno para sorprender a pequeñas aves. El macho es gris azulado por encima; la hembra, parda. No se ciñe como el cernícalo: siempre está en movimiento.',
  s.identification_tips = 'Muy pequeño y compacto, con aleteo rápido
Vuela bajo y en línea recta, casi rozando el suelo
Sin bigotera marcada, a diferencia del peregrino',
  s.seasonality = 'Otoño e invierno',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Falco_columbarius_Male.jpg?width=1280',
  s.image_attribution = 'Raj Boora from Edmonton, Canada (CC BY 2.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Falco columbarius';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Andarríos grande',
  s.primary_habitat = NULL,
  s.description = 'Se trata de un ave limícola de tamaño entre pequeño y mediano, de aspecto estilizado, con patas de mediana longitud que apenas sobresalen de la cola en vuelo, y pico igual a la longitud de la cabeza. Como otros andarríos, cuando está posado suele realizar un continuo movimiento de balanceo. La coloración es bastante oscura en la región dorsal, en marcado contraste con la garganta y las zonas ventrales, de color blanco. Presenta un límite nítido entre el pecho oscuro y el vientre blanco. Las patas son de color grisáceo oscuro y muestra también una ceja blanca, que es corta y solo se extiende entre el pico y el ojo. El adulto en plumaje nupcial exhibe numerosas pintas blancas en las partes superiores, que destacan notablemente sobre el fondo marrón oscuro. El píleo, el cuello y el pecho aparecen listados de marrón y blanco. Los ejemplares no reproductores presentan motas menos destacadas, de color ante apagado, el píleo apenas estriado de claro y el pecho grisáceo, con un estriado más difuso. El juvenil, por su parte, es semejante al adulto no reproductor, pero con las pintas de las partes superiores más conspicuas y con un estriado menos definido en el pecho. El andarríos grande es un ave tímida y nerviosa, a la que, normalmente, no se descubre hasta que alza el vuelo. En ese momento resulta fácil de identificar debido a su color muy oscuro, en el que resalta el obispillo blanco y el barrado transversal de la cola',
  s.identification_tips = '',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Green_Sandpiper_(Tringa_ochropus)-_In_Breeding_plumage_at_Bharatpur_I_IMG_5533.jpg?width=1280',
  s.image_attribution = 'J.M.Garg (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Tringa ochropus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Garcilla cangrejera',
  s.primary_habitat = 'Estival (desde finales de abril), aunque también se da invernada en nuestro país',
  s.description = 'Garza de pequeño-mediano tamaño. El adulto reproductor tiene las partes superiores rosado-anaranjadas y las inferiores más blanquecinas. Del píleo le cuelgan largas plumas pardas, con raquis más pálido, que le dibujan una melena sobre el dorso. Su pico es azulado, con el extremo negro, y luce patas naranjas. El adulto no reproductor es mucho más parduzco, con toda la cabeza y el cuello repletos de estrías longitudinales blancas y pardas, patas amarillentas y pico naranja sucio. Los jóvenes son muy similares a los adultos no reproductores. En vuelo, la garcilla cangrejera se muestra muy pálida, ya que sus alas y cola son blancas, y el cuerpo y la cabeza rosados. Se localiza generalmente en aguazales abiertos, en orillas o en aguas someras.',
  s.identification_tips = '',
  s.seasonality = 'Marzo a octubre',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Crabier_chevelu.jpg?width=1280',
  s.image_attribution = 'Pierre Dalous (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Ardeola ralloides';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Golondrina dáurica',
  s.primary_habitat = 'Desde parameras secas hasta altas cumbres.Nidos bajo puentes,riscos,acantilados,zonas llanas bajas',
  s.description = 'De apariencia similar a la golondrina común, exhibe dorso negro, con reflejos azulados, y vientre blanco sucio, con flancos anaranjados y algunas rayas tenues. Los rasgos más característicos de la especie son la nuca y la cara anaranjadas, del mismo color que el obispillo. Las alas, largas y apuntadas, también muestran tonos naranjas en la parte inferior delantera. Posee una cola muy larga y muy ahorquillada,de color negro uniforme, tanto por arriba como por abajo. Tiene patas cortas sin emplumar, boca muy ancha, y pico corto, plano y negro. Ambos sexos son iguales. Los jóvenes presentan en el dorso plumaje negro mate, con plumas ribeteadas en blanco, siendo las zonas naranjas de menor intensidad; incluso el obispillo parece blanco en ocasiones. Esta ave se observa frecuentemente cerca de puentes y roquedos, y exhibe un vuelo ágil, rápido y acrobático.',
  s.identification_tips = '',
  s.seasonality = 'Abril a septiembre',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Golondrina_d%C3%A1urica_Cecropis_daurica_1.jpg?width=1280',
  s.image_attribution = 'Agustín Povedano from El Puerto de Santa María, Extremadura y Andal… (CC BY 2.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Cecropis daurica';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cernícalo primilla',
  s.primary_habitat = NULL,
  s.description = 'De aspecto bastante similar al del cernícalo vulgar, el primilla se distingue de este por su menor tamaño y por una serie de características morfológicas que algunas veces —como sucede con el color de las uñas: blancas en el primilla, negras en el vulgar— no son fácilmente identificables en el campo. El macho adulto tiene el dorso rojizo, sin manchas. La cabeza y las grandes coberteras son de color gris azulado; las plumas de vuelo, negras, y las partes inferiores, de un suave tono crema con tintes rosados y levemente tachonado de pintas oscuras. Carece de bigotera, a diferencia del cernícalo vulgar, y presenta la cera del pico y el anillo ocular de color amarillo. En vuelo ofrece un aspecto muy pálido, tanto en la cara inferior de las alas como en el cuerpo y la cola; esta es de color gris claro y aparece rematada por una banda terminal negra sobre la que destacan las rectrices centrales, que son más largas. La hembra luce un tono general bastante más apagado y homogéneo. Sus partes superiores son de color marrón rojizo, con un profuso barrado transversal, y las inferiores, muy claras, aunque con un moteado más abundante que el del macho. La bigotera resulta menos marcada que la de la hembra del cernícalo vulgar, y en vuelo las partes inferiores son más pálidas y menos barradas. El joven es muy similar a la hembra adulta y también a hembras y jóvenes de cernícalo vulgar. De los segundos se distingue por tener una bigotera poco marcada y ser menos barrado en la parte inferior.',
  s.identification_tips = '',
  s.seasonality = 'Marzo a septiembre',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Lesser_Kestrel_from_Fujeirah.jpg?width=1280',
  s.image_attribution = 'Shah Jahan (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Falco naumanni';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Pinzón real',
  s.primary_habitat = NULL,
  s.description = 'Los machos y hembras de pinzón real tienen el pecho y la garganta de color anaranjado pálido, el pico amarillento y el vientre blanco. En plumaje nupcial los machos presentan un intenso color negro en la cabeza, que comienzan a adquirir ya durante el invierno, junto con un pico que se muestra de color negro. Muy similar en forma y tamaño al pinzón vulgar, del que se diferencia por su conspicuo obispillo blanco y por carecer de las bandas blancas de las alas y la cola típicas de los pinzones vulgares.',
  s.identification_tips = '',
  s.seasonality = 'Octubre a marzo',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Pinson_du_nord.jpg?width=1280',
  s.image_attribution = 'Pierre Dalous (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Fringilla montifringilla';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Alimoche común',
  s.primary_habitat = 'Nidifica en cavidades de acantilados',
  s.description = 'A medio camino entre las rapaces estrictamente carroñeras y las cazadoras, el alimoche es un ave de tamaño entre mediano y grande y aspecto completamente inconfundible. Los ejemplares adultos lucen un plumaje mayoritariamente blanco sucio —con algunas regiones teñidas de crema—, a excepción de las rémiges, que son completamente negras. En la anatomía de esta rapaz destacan, por otra parte, una llamativa gorguera de plumas desflecadas y un tanto desordenadas en la cabeza y el cuello —lo que le confiere un aire bastante peculiar—, además de la cara, que aparece desnuda y coloreada de un llamativo amarillo. Los jóvenes son mucho más oscuros, pues exhiben una librea parda que, a lo largo de sucesivas mudas, va pasando por diferentes patrones de coloración hasta llegar al plumaje definitivo cuando cuentan con cinco años. Los jóvenes presentan también la cara de color gris azulado. Otra de las características anatómicas del alimoche es la posesión de un pico fino y relativamente largo, que le impide desgarrar los cueros de los grandes cadáveres como hacen los buitres mayores, aunque le confiere, en cambio, una gran adaptabilidad a la hora de seleccionar el alimento. En vuelo, el adulto aparece como un ave muy blanca, en cuya silueta destacan las estrechas y largas alas y una cola larga, en forma de cuña, que dotan al ave de gran capacidad de maniobra. El joven, sin embargo, aunque mantiene la característica silueta de la especie, resulta muy oscuro.',
  s.identification_tips = '',
  s.seasonality = 'Febrero a octubre',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Egyptian_vulture_2.jpg?width=1280',
  s.image_attribution = 'Egyptian_vulture.jpg: Kousik Nandy derivative work: Robertonemo (talk) (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 5
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Neophron percnopterus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Tarro blanco',
  s.primary_habitat = NULL,
  s.description = 'Anátida intermedia (por forma y comportamiento) entre un ganso y un pato típicos, que presenta las patas muy centradas en el cuerpo, en una posición que facilita la acción de pastar. Su coloración general es blanca, con el dorso más oscuro (verdoso) y un ancho collar pardorrojizo en el pecho. La cabeza y el cuello son de un verde oscuro, a modo de capuchón. El pico rojo posee un llamativo abultamiento en la frente de los machos. Los jóvenes son mucho más pálidos, sin collar y sin capucha definida, con el dorso pardo escamado, cabeza y cuello oscuros, cara blanquecina y pico rosado. En vuelo, las primarias y secundarias, de color muy oscuro —las últimas de un tono verde botella—, contrastan con el tono general blanco.',
  s.identification_tips = '',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Common_Shellduck_(Tadorna_tadorna)_(26499348215).jpg?width=1280',
  s.image_attribution = 'Bernard DUPONT from FRANCE (CC BY-SA 2.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Tadorna tadorna';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Carricero común',
  s.primary_habitat = 'Marismas,estuarios costeros,lagunas interiores,riberas fluviales,humedales con plantas palustres...',
  s.description = 'Pequeño pájaro insectívoro de tonos ocres uniformes. Como otros carriceros y carricerines, posee una cabeza apuntada, con la frente aplanada y el pico relativamente largo y fino. Tiene el dorso de color marrón, con tintes oliváceos o grises dependiendo de la edad y el desgaste del plumaje. Las partes inferiores muestran tonos ocres pálidos. Carece de las listas y cejas cefálicas distintivas de otras especies del género Acrocephalus y, a diferencia de otros carriceros, presenta el obispillo de color marrón rojizo. Ambos sexos son similares.',
  s.identification_tips = '',
  s.seasonality = 'Abril a octubre',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Carricerocomun.jpg?width=1280',
  s.image_attribution = 'Carles Pastor (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Acrocephalus scirpaceus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Chorlitejo chico',
  s.primary_habitat = NULL,
  s.description = 'Esta limícola de pequeño tamaño, movimientos rápidos y cabeza voluminosa se caracteriza por poseer un pico muy corto y patas algo más largas que la anchura del cuerpo. El macho en plumaje nupcial tiene el píleo de color marrón grisáceo y separado del dorso —también grisáceo— por un doble collar blanco y negro cerrado completamente por su parte frontal; en la cabeza presenta un diseño característico, que viene definido por una frente blanca y por la presencia de una barra frontal negra separada del píleo mediante una fina banda blanca. El anillo ocular, al igual que las patas, es amarillo. La hembra resulta similar, pero con el negro de la cabeza más apagado. En el adulto no reproductor, sin embargo, casi todo el negro aparece sustituido por marrón. El diseño general del joven es semejante al del no reproductor, pero con los bordes de las plumas de las partes superiores orlados de ante pálido; el collar es oscuro y no se cierra por completo.',
  s.identification_tips = '',
  s.seasonality = 'Enero, marzo, abril, mayo, junio, julio, agosto, septiembre, octubre',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Charadrius_dubius_4_(Marek_Szczepanek).jpg?width=1280',
  s.image_attribution = 'Marek Szczepanek (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Charadrius dubius';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Calandria común',
  s.primary_habitat = 'Llanos cerealistas, pastizales y estepas de suelo profundo',
  s.description = 'La mayor de las alondras ibéricas, robusta y de pico grueso, con una mancha negra muy marcada a cada lado del cuello. Canta en vuelo, describiendo círculos altos con un torrente de notas en el que imita a otras aves. En invierno forma bandos numerosos en los llanos.',
  s.identification_tips = 'Babero negro a cada lado del cuello
Borde trasero del ala blanco y visible en vuelo
Pico grueso y pálido, de granívora',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Melanocorypha_calandra.jpg?width=1280',
  s.image_attribution = 'Bereşe.jpg: Dûrzan cîrano derivative work: Osado (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Melanocorypha calandra';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Ganga ortega',
  s.primary_habitat = NULL,
  s.description = 'Ave de hábitos terrestres, compacta, corpulenta y de colores miméticos. El macho posee tonos grises en la cabeza y el cuello, excepto en la garganta, naranja y con la base negra. Una banda pectoral negra delimita el pecho asalmonado, mientras que el vientre se muestra llamativamente negro. El dorso y las alas plegadas exhiben grandes ocelos dorados sobre un fondo grisáceo. La cola es corta, vermiculada por arriba y blanca con banda subterminal negra por abajo. Tiene grises el pico y las patas, estas últimas de dedos cortos y con la parte anterior del tarso emplumada en blanco. Se distingue de la ganga ibérica por su mayor tamaño, su vientre negro y su cola más corta, sin las largas plumas centrales. La hembra resulta menos vistosa que el macho, con un patrón general terroso muy vermiculado, tanto en el dorso como en el pecho, el píleo y la nuca. Además de la banda pectoral y el vientre negro, tiene una pequeña línea negra en la garganta, mientras que posee un pecho. Los jóvenes son una versión más pálida y menos contrastada de los adultos de cada sexo. Se trata de una especie de hábitos gregarios, más marcados fuera de la época de cría, y a la que se suele ver en pequeños grupos. Su vuelo es poderoso y de batir lento, y cuando vuela muestra sus alas apuntadas, blancas y negras por abajo.',
  s.identification_tips = '',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Pterocles_orientalis_(Charyn).jpg?width=1280',
  s.image_attribution = 'Ron Khight (CC BY 2.0) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Pterocles orientalis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Torcecuello euroasiático',
  s.primary_habitat = 'Bosques abiertos, sotos, huertos y arboledas con madera muerta',
  s.description = 'Pariente de los pájaros carpinteros que ni pica la madera ni trepa por los troncos: se posa de través en las ramas y come hormigas del suelo con una lengua larguísima. Su plumaje jaspeado en grises y pardos imita la corteza. Si se le molesta en el nido, retuerce el cuello como una culebra, de ahí su nombre.',
  s.identification_tips = 'Plumaje veteado como corteza, difícil de ver quieto
Se posa a lo largo de la rama, no agarrado al tronco
Franja oscura desde la nuca hasta la mitad de la espalda',
  s.seasonality = 'Paso migratorio e invernada',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Jinxtorquilla.jpg?width=1280',
  s.image_attribution = 'User:Aelwyn (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'carrascoy-y-el-valle' AND s.scientific_name = 'Jynx torquilla';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Aulaga',
  s.primary_habitat = 'Matorral árido, ramblas y bordes de camino en clima muy seco',
  s.description = 'Mata en forma de bola formada por ramas verdes, rígidas y terminadas en pincho, casi sin hojas: la fotosíntesis la hacen los propios tallos. Al romper una rama suelta un látex blanco. Sus flores amarillas recuerdan a las del diente de león en miniatura.',
  s.identification_tips = 'Matorral redondo de ramas verdes y espinosas, casi sin hojas
Suelta látex blanco al partir un tallo
Flores amarillas tipo diente de león',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Launaea_arborescens_-_Oasis_Park_botanical_garden_-_Fuerteventura_-_02.jpg?width=1280',
  s.image_attribution = 'Norbert Nagel, Mörfelden-Walldorf, Germany (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Launaea arborescens';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Salao negro',
  s.primary_habitat = 'Ramblas, taludes y matorrales sobre suelos salinos o removidos, en clima muy seco',
  s.description = 'Mata leñosa y ramosa, de hasta metro y medio, con hojas carnosas cortas y opuestas —de ahí el nombre— que dan a la planta un aspecto de escobilla gris azulada. Aguanta suelos salinos y alterados donde casi nada más prospera, y sus flores, diminutas, se reconocen porque el fruto queda envuelto en un ala membranosa circular.',
  s.identification_tips = 'Hojas carnosas y cortas dispuestas por pares, una frente a otra
Frutos con un ala redonda y translúcida, como una moneda de papel
Porte de escobilla gris azulada en taludes y bordes de rambla',
  s.seasonality = 'Floración de verano a otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Salsola_oppositifolia.JPG?width=1280',
  s.image_attribution = 'Retama (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Salsola oppositifolia';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Bolaga',
  s.primary_habitat = 'Matorral costero y semiárido, arenas y suelos pedregosos con influencia marina',
  s.description = 'Mata de ramas largas y flexibles cubiertas de hojitas escamosas, apretadas contra el tallo como las tejas de un tejado, con el envés blanco y peludo. Las flores son verdosas y pasan desapercibidas, pero su corteza es tan fibrosa y resistente que se ha usado tradicionalmente como cuerda.',
  s.identification_tips = 'Hojas minúsculas y solapadas, cubriendo el tallo como escamas
La rama no se rompe al doblarla: la corteza es fibrosa y correosa
Flores verde-amarillentas pegadas a la rama, sin pétalos vistosos',
  s.seasonality = 'Floración de otoño a primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Thymelaea_hirsuta_Bonifacio.jpg?width=1280',
  s.image_attribution = 'Pancrat (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Thymelaea hirsuta';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Morsana',
  s.primary_habitat = 'Suelos removidos, cunetas, ramblas y bordes de saladar en clima árido',
  s.description = 'Hierba perenne de tallos gruesos y quebradizos con hojas carnosas partidas en dos folíolos redondeados, como dos gotas verdes enfrentadas. Coloniza suelos pisoteados y salinos, y sus frutos alargados, en forma de cápsula estriada, cuelgan durante buena parte del verano.',
  s.identification_tips = 'Hojas de solo dos folíolos carnosos y redondeados
Tallos hinchados en los nudos, que se quiebran con facilidad
Cápsulas alargadas y acostilladas colgando tras la floración',
  s.seasonality = 'Floración de primavera a verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Morsana-1.JPG?width=1280',
  s.image_attribution = 'Philmarin (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Zygophyllum fabago';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cornical',
  s.primary_habitat = 'Matorral cálido, laderas soleadas y barrancos de clima muy seco',
  s.description = 'Arbusto de hojas estrechas y coriáceas y flores pequeñas con cinco pétalos de un pardo verdoso y aspecto aterciopelado. Sus frutos son dos vainas largas y curvas dispuestas en forma de cuerno, de donde le viene el nombre popular de cornical. Suelta látex al romperse.',
  s.identification_tips = 'Frutos en dos vainas curvas enfrentadas, como cuernos
Látex blanco al partir una hoja o rama
Flores pardo verdosas con aspecto de terciopelo',
  s.seasonality = 'Primavera y verano (floración)',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/609975159/original.jpg',
  s.image_attribution = 'Quentin Groom (CC0) · GBIF',
  s.rarity_score = 3
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Periploca angustifolia';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Sosa fina',
  s.primary_habitat = 'Bordes de saladar y suelos salinos algo más secos y elevados',
  s.description = 'Mata leñosa de hojas carnosas, cilíndricas y de un verde azulado, que ocupa la orla algo más alta y seca del saladar. Se diferencia de sus vecinas en que sí tiene hojas bien visibles y no tallos articulados. Sus flores son minúsculas y verdosas, en las axilas de las hojas.',
  s.identification_tips = 'Hojas carnosas y cilíndricas, verde azuladas
Base leñosa y ramificada, no herbácea
En la parte más seca y alta del saladar',
  s.seasonality = 'Verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Suaeda_vera.JPG?width=1280',
  s.image_attribution = 'Xemenendura (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Suaeda vera';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cambrón',
  s.primary_habitat = 'Matorral costero y suelos salinos y nitrificados de clima cálido',
  s.description = 'Arbusto de ramas enmarañadas y espinosas, con hojitas carnosas agrupadas en manojos. Sus flores son pequeñas, tubulares y de color violeta pálido, y da bayas rojas que comen muchas aves. Forma setos impenetrables que dan refugio a pájaros y reptiles.',
  s.identification_tips = 'Ramas enredadas entre sí y terminadas en espina
Hojas carnosas en manojitos a lo largo de la rama
Bayas rojas pequeñas y flores tubulares violáceas',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Lycium_intrincatum_(flor).JPG?width=1280',
  s.image_attribution = 'ANE (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Lycium intricatum';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Siempreviva insigne',
  s.primary_habitat = 'Suelos margosos y yesosos salinos, en estepas y taludes áridos',
  s.description = 'Una de las siemprevivas más vistosas: sus inflorescencias forman un ramillete denso de un lila rosado intenso que destaca sobre el gris de las margas. Es un endemismo del sureste ibérico, ligado a suelos salinos y yesosos, y muy usado en seco como flor ornamental.',
  s.identification_tips = 'Floración densa y de lila rosado vivo, muy llamativa
Hojas en roseta basal, gruesas y de borde ondulado
Sobre margas y yesos claros, en terreno casi desnudo',
  s.seasonality = 'Final de primavera y verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Limonium_insigne.jpg?width=1280',
  s.image_attribution = 'ANE (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Limonium insigne';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Jarilla de Mota',
  s.primary_habitat = 'Matorrales abiertos y pastizales sobre suelos margosos y yesosos del sureste árido',
  s.description = 'Jarilla pequeña y grisácea, de hojas estrechas cubiertas de pelo blanquecino que reflejan la luz y le ahorran agua. Es un endemismo del sureste ibérico de área muy reducida, ligado a los suelos margosos de las zonas más áridas de la península.',
  s.identification_tips = 'Mata baja de aspecto plateado por el fieltro de pelos
Flores amarillas de cinco pétalos que duran un solo día
Hojas estrechas y enrolladas hacia el envés',
  s.seasonality = 'Floración en primavera',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/640806369/original.jpg',
  s.image_attribution = 'faluke (CC BY-NC 4.0) · iNaturalist/GBIF',
  s.rarity_score = 2
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Helianthemum motae';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Rugueta de mar',
  s.primary_habitat = 'Arena suelta de la primera línea de playa, sobre restos orgánicos del mar',
  s.description = 'Crucífera anual y carnosa que coloniza la arena batida donde el mar deposita algas. Sus hojas son gruesas y recortadas y sus flores, lilas o blancas, tienen los cuatro pétalos en cruz de la familia. El fruto se parte en dos: una mitad queda en la planta y la otra flota y viaja por mar.',
  s.identification_tips = 'Hojas carnosas y recortadas, algo azuladas
Flores lilas o blancas de cuatro pétalos en cruz
Frutos duros en dos piezas, como pequeños barrilitos',
  s.seasonality = 'Primavera a otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Cakile-maritima-(eurMeersenf)_1.jpg?width=1280',
  s.image_attribution = 'Jürgen Howaldt (CC BY-SA 2.0 de) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Cakile maritima';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Margarita de mar',
  s.primary_habitat = 'Playas y dunas fósiles del litoral',
  s.description = 'Mata que forma cojines sobre la roca litoral, con hojas espatuladas, carnosas y ásperas al tacto. Sus capítulos amarillos, casi sentados sobre el follaje, están rodeados de brácteas verdes que sobresalen entre las lígulas. Florece durante casi todo el año.',
  s.identification_tips = 'Cojines densos sobre roca costera
Brácteas verdes asomando entre los pétalos amarillos
Hojas espatuladas, carnosas y ásperas',
  s.seasonality = 'Todo el año, floración prolongada',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Asteriscus_maritimus1.jpg?width=1280',
  s.image_attribution = 'Ximenex (CC BY-SA 2.1 es) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Asteriscus maritimus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Albardín',
  s.primary_habitat = 'Estepas salinas, margas y suelos yesosos secos; forma albardinales',
  s.description = 'Gramínea perenne de hojas duras y punzantes que forma matas separadas sobre suelos salinos y margosos donde poco más prospera. Su inflorescencia es inconfundible: una espata blanca y sedosa que envuelve las flores como un capuchón de papel.',
  s.identification_tips = 'Espata blanca y sedosa envolviendo la espiga
Hojas rígidas terminadas en punta punzante
Matas espaciadas sobre suelo desnudo y claro',
  s.seasonality = 'Todo el año (espigado en primavera)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Lygeum_spartum-1.jpg?width=1280',
  s.image_attribution = 'Nanosanchez (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Lygeum spartum';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Jarilla de Almería',
  s.primary_habitat = 'Tomillares y matorral abierto sobre suelos secos y pedregosos',
  s.description = 'Jarilla enana de hojas pequeñas y blanquecinas, cubiertas de pelos que reflejan la luz y reducen la pérdida de agua. En primavera se cubre de flores blancas con el centro amarillo, cuyos pétalos duran apenas una mañana. Sus raíces se asocian con hongos comestibles del desierto.',
  s.identification_tips = 'Mata baja y grisácea, de hojas muy pequeñas
Flores blancas con el centro amarillo, efímeras
Pétalos arrugados, como de papel de seda',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Helianthemum_almeriense_flor.jpg?width=1280',
  s.image_attribution = 'Retama (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Helianthemum almeriense';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Lagartija colirroja',
  s.primary_habitat = 'Matorral litoral y laderas secas',
  s.description = 'Lagartija de suelos arenosos, de cuerpo aplanado y dedos con escamas laterales en forma de peine que le sirven de raqueta sobre la arena suelta. Los jóvenes tienen la cola y las patas traseras de un rojo intenso que se apaga en los adultos.',
  s.identification_tips = 'Dedos con flecos de escamas a los lados, como peines
Jóvenes con cola y patas traseras rojo intenso
Cuerpo aplanado, con rayas y ocelos claros en el dorso',
  s.seasonality = 'Primavera a otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Benny_Trapp_Acanthodactylus_erythrurus.jpg?width=1280',
  s.image_attribution = 'Benny Trapp (CC BY 3.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Acanthodactylus erythrurus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Salsola',
  s.primary_habitat = 'Estepas salinas y suelos margosos y yesosos con sal',
  s.description = 'Mata baja y densa de hojas cortas y carnosas cubiertas de pequeñas papilas que le dan un tacto áspero. Es un endemismo ibérico ligado a suelos salinos y margosos, con una distribución muy fragmentada, lo que la hace especialmente sensible a la roturación.',
  s.identification_tips = 'Superficie de las hojas rugosa, con papilas visibles de cerca
Mata compacta y grisácea, de porte bajo
Frutos con alas membranosas al madurar',
  s.seasonality = 'Verano y otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Salsola_papillosa1160031.jpg?width=1280',
  s.image_attribution = 'Nanosanchez (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 5
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Salsola papillosa';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Sosa jabonera',
  s.primary_habitat = 'Saladares muy salinos con encharcamiento estacional',
  s.description = 'Mata de tallos articulados y suculentos, con las ramas jóvenes agrupadas en apretados manojos que recuerdan a piñas diminutas, de donde le viene el nombre. Vive en los suelos más salinos del saladar, donde apenas compite con otras plantas.',
  s.identification_tips = 'Ramillas agrupadas en manojos con aspecto de piña
Tallos gruesos y articulados de color verde grisáceo
En las zonas más saladas y desnudas del saladar',
  s.seasonality = 'Verano y otoño',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/611359925/original.jpg',
  s.image_attribution = 'Xavier Rufray (CC BY-NC 4.0) · iNaturalist/GBIF · obs. EAU (revisar: existe en salinas de España)',
  s.rarity_score = 4
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Halocnemum strobilaceum';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Esparto',
  s.primary_habitat = 'Laderas secas y llanos sobre suelos pobres; forma espartales extensos',
  s.description = 'El esparto, nombrado también como Stipa tenacissima, forma matas densas y duraderas que dan nombre a los espartales, uno de los paisajes característicos del sureste ibérico. Sus hojas se enrollan sobre sí mismas en los días secos para perder menos agua y se abren tras la lluvia. Durante siglos se recolectó para hacer cuerdas, esteras y alpargatas.',
  s.identification_tips = 'Matas grandes y compactas de hojas duras enrolladas
Las hojas se abren tras la lluvia y se enrollan al secar
Espigas altas y plateadas a final de primavera',
  s.seasonality = 'Primavera (espigado)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Stipa_tenacissima.jpg?width=1280',
  s.image_attribution = 'autor no indicado (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Macrochloa tenacissima';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Sosa alacranera',
  s.primary_habitat = 'Saladares y marismas con encharcamiento salino prolongado',
  s.description = 'Planta sin hojas aparentes: sus tallos son cilíndricos, carnosos y divididos en segmentos que parecen articulaciones. Vive donde la sal se acumula y en otoño se tiñe de tonos rojizos y anaranjados que cambian el color de todo el saladar.',
  s.identification_tips = 'Tallos carnosos articulados, como collares de cuentas
Sin hojas visibles
Vira a rojo y naranja en otoño',
  s.seasonality = 'Verano y otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Arthrocnemum_macrostachyum_2LaMata.jpg?width=1280',
  s.image_attribution = 'Javier martin (Public domain) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Arthrocnemum macrostachyum';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Albardín brezo',
  s.primary_habitat = 'Estepas salinas, saladares y suelos margosos con sal',
  s.description = 'Mata baja y muy ramificada, de hojas diminutas y enrolladas que a menudo aparecen cubiertas de una costra blanca: son cristales de sal que la planta expulsa por glándulas especializadas. Sus flores son rosadas y pequeñas, apiñadas en el extremo de las ramas.',
  s.identification_tips = 'Costra blanca de sal cristalizada sobre las hojas
Hojas minúsculas y enrolladas, casi como escamas
Flores rosadas pequeñas agrupadas en el extremo',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/464713930/original.jpeg',
  s.image_attribution = 'Rafael Medina (CC BY 4.0) · GBIF',
  s.rarity_score = 2
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Frankenia corymbosa';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Zamarrilla lanuda',
  s.primary_habitat = 'Matorral y cerros sobre suelos calizos y margosos secos',
  s.description = 'Mata cubierta por una lana blanca y espesa que la hace destacar en el matorral. Sus flores, rosadas o purpúreas, se agrupan en cabezuelas terminales y carecen de labio superior, con los estambres al descubierto. Es un endemismo del sureste ibérico.',
  s.identification_tips = 'Toda la planta cubierta de lana blanca y espesa
Flores sin labio superior, con los estambres asomando
Cabezuelas apretadas en el extremo de las ramas',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Teucrium_lanigerum_kz01.jpg?width=1280',
  s.image_attribution = 'Krzysztof Ziarnek, Kenraiz (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Teucrium lanigerum';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Perfollada anual',
  s.primary_habitat = 'Pastizales anuales, claros de matorral y suelos margosos secos',
  s.description = 'Umbelífera anual diminuta, de pocos centímetros, con hojas estrechas de un verde azulado y umbelas tan pequeñas que parecen botones. Es una de esas plantas efímeras que germinan con las lluvias, florecen deprisa y desaparecen antes del verano.',
  s.identification_tips = 'Planta anual muy pequeña, de aspecto rígido y verde azulado
Hojas lineares sin dientes, atravesadas por nervios paralelos
Umbelas minúsculas con brácteas que sobrepasan a las flores',
  s.seasonality = 'Primavera',
  s.image_url = 'https://observation.org/photos/125530399.jpg',
  s.image_attribution = 'Humedales de Navarra (CC BY-NC-ND 4.0) · observation.org / GBIF',
  s.rarity_score = 2
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Bupleurum semicompositum';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cuernecillo de mar',
  s.primary_habitat = 'Dunas móviles embrionarias',
  s.description = 'Leguminosa rastrera de follaje sedoso-plateado y flores amarillas, característica de las arenas litorales móviles.',
  s.identification_tips = 'Flores amarillas papilionadas
Follaje sedoso-plateado
Porte rastrero sobre arena',
  s.seasonality = 'Primavera',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/619207211/original.jpg',
  s.image_attribution = 'Augustin Soulard (CC BY 4.0) · GBIF',
  s.rarity_score = 2
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Lotus creticus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Anabasis',
  s.primary_habitat = 'Suelos salinos y margosos áridos, estepas y ramblas de clima muy seco',
  s.description = 'Mata de tallos verdes, carnosos y articulados, sin hojas visibles, muy parecida a las sosas de saladar pero de porte más rígido y ramificado. Es una planta iberoafricana que en la península solo vive en los enclaves más áridos del sureste.',
  s.identification_tips = 'Tallos articulados y suculentos, sin hojas
Porte rígido y muy ramificado desde la base
En los suelos más áridos y salinos, casi desnudos',
  s.seasonality = 'Verano y otoño',
  s.image_url = 'https://observation.org/photos/111149341.jpg',
  s.image_attribution = 'Ans Gorter (CC BY-NC-ND 4.0) · observation.org / GBIF',
  s.rarity_score = 4
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Anabasis hispanica';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Esparraguera de gato',
  s.primary_habitat = 'Matorrales arborescentes de Juniperus spp.',
  s.description = 'Esparraguera muy espinosa y densa que se enreda entre el matorral y el sabinar litoral, con cladodios rígidos y punzantes.',
  s.identification_tips = 'Cladodios rígidos y punzantes
Se enreda en el matorral
Frutos negros en otoño',
  s.seasonality = 'Otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Asparagus_stipularis_(detail).jpg?width=1280',
  s.image_attribution = 'Hans Hillewaert (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Asparagus horridus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Azucena de mar',
  s.primary_habitat = 'Dunas y playas del litoral',
  s.description = 'Bulbosa de dunas con flores blancas grandes, en forma de trompeta y con una corona membranosa entre los estambres. Se abren al atardecer y despiden un perfume intenso que atrae a polillas nocturnas. Sus hojas son acintadas y de un verde azulado, y a menudo se secan antes de la floración.',
  s.identification_tips = 'Flores blancas en trompeta con una corona membranosa dentro
Se abren al atardecer y huelen intensamente
Hojas acintadas y de verde azulado, saliendo de la arena',
  s.seasonality = 'Verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Pancratium_maritimum2.jpg?width=1280',
  s.image_attribution = 'autor no indicado (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Pancratium maritimum';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Romero',
  s.primary_habitat = 'Matorral seco y soleado sobre suelos calizos y pedregosos',
  s.description = 'Arbusto aromático de hojas estrechas como agujas, verde oscuro por el haz y blanquecinas por el envés, con los bordes enrollados hacia abajo. Florece casi todo el año en azul pálido, y en pleno invierno es una de las pocas fuentes de néctar del matorral.',
  s.identification_tips = 'Hojas como agujas, blancas por debajo
Olor inconfundible al frotar entre los dedos
Flores azul claro repartidas por las ramas casi todo el año',
  s.seasonality = 'Todo el año, con máximo de floración en invierno y primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Rosemary_in_bloom.JPG?width=1280',
  s.image_attribution = 'Margalob (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Rosmarinus officinalis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Saladilla anual',
  s.primary_habitat = 'Saladares, arenas litorales y suelos salinos secos',
  s.description = 'Saladilla anual —a diferencia de la mayoría de sus parientes, que son perennes— con una roseta de hojas lobuladas pegada al suelo y tallos alados que rematan en espigas de flores azuladas o violáceas. Sus flores conservan el color al secarse, un truco común en el género.',
  s.identification_tips = 'Roseta basal de hojas con lóbulos redondeados
Tallos con alas o costillas, no cilíndricos
Flores azuladas agrupadas en espiguillas de un solo lado',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Limonium_lobatum.jpg?width=1280',
  s.image_attribution = 'Sf2000 (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Limonium lobatum';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cerrajón',
  s.primary_habitat = 'Suelos arenosos, ramblas y terrenos removidos en clima cálido y seco',
  s.description = 'Hierba anual de aspecto lampiño con capítulos amarillos que llevan en el centro una mancha oscura, casi negra, como un ojo. Al cortar el tallo suelta látex blanco, rasgo compartido con las cerrajas y los dientes de león.',
  s.identification_tips = 'Capítulo amarillo con el centro oscuro, casi negro
Látex blanco al partir el tallo o una hoja
Brácteas anchas y membranosas en el borde, bajo la flor',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Reich-ting-2.jpg?width=1280',
  s.image_attribution = 'Philmarin (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Reichardia tingitana';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cinomorio',
  s.primary_habitat = 'Saladares y matorrales halonitrófilos',
  s.description = 'Planta parásita sin clorofila, de aspecto de maza rojiza, que crece sobre las raíces de quenopodiáceas halófilas de los saladares y estepas salinas.',
  s.identification_tips = 'Inflorescencia carnosa rojo-oscura en maza
Sin hojas verdes (parásita)
Aparece sobre raíces de plantas halófilas',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Cynomorium_coccineum_vMH375.jpg?width=1280',
  s.image_attribution = 'autor no indicado (Public domain) · Wikimedia Commons',
  s.rarity_score = 5
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Cynomorium coccineum';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Algazul',
  s.primary_habitat = 'Saladares, arenas litorales y suelos salinos removidos',
  s.description = 'Planta rastrera de hojas cilíndricas y carnosas cubiertas de papilas que brillan al sol como gotas de agua. Acumula sal en sus tejidos y, al secarse en verano, toma tonos rojizos que tiñen el suelo del saladar; se quemaba para obtener sosa, de ahí su nombre.',
  s.identification_tips = 'Hojas gruesas, cilíndricas y con aspecto escarchado
Porte tendido, formando alfombras pegadas al suelo
Vira a rojo intenso al agostarse, en pleno verano',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Mesambryanthemum_nodiflorum.jpg?width=1280',
  s.image_attribution = 'Tigerente (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Mesembryanthemum nodiflorum';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Barrilla pinchosa',
  s.primary_habitat = 'Arenas y gravas del primer cordón de playa y suelos removidos salinos',
  s.description = 'Hierba anual muy ramificada, de hojas carnosas rematadas en un pincho fino, que forma una bola. Al secarse se desprende del suelo y rueda con el viento dispersando las semillas. Coloniza la línea donde el mar deja restos de algas y madera.',
  s.identification_tips = 'Hojas carnosas terminadas en una punta pinchuda
Forma una mata redondeada que rueda al secarse
Tallos con finas líneas rojizas o rosadas',
  s.seasonality = 'Verano y otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Salsola_kali_habito.jpg?width=1280',
  s.image_attribution = 'autor no indicado (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Salsola kali';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Zanahoria de mar',
  s.primary_habitat = 'Dunas con céspedes del Malcomietalia',
  s.description = 'Pequeña umbelífera anual de las arenas litorales, con umbelas blanco-rosadas y frutos espinosos que se dispersan por la duna.',
  s.identification_tips = 'Umbelas blanco-rosadas
Frutos con espinas
Anual de dunas semifijas',
  s.seasonality = 'Primavera',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/475241861/original.jpeg',
  s.image_attribution = 'Christoph Moning (CC BY 4.0) · GBIF',
  s.rarity_score = 3
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Pseudorlaya pumila';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Algodonosa',
  s.primary_habitat = 'Pastizales anuales sobre arenas y suelos secos y sueltos',
  s.description = 'Hierba anual pequeña, cubierta por completo de un fieltro blanco y lanoso que la protege del sol. Sus capítulos son minúsculos y se agrupan en glomérulos apretados en las horquillas del tallo, difíciles de ver si no se busca de cerca.',
  s.identification_tips = 'Toda la planta blanquecina y algodonosa al tacto
Capítulos diminutos apiñados en las bifurcaciones del tallo
Porte erguido de pocos centímetros, ramificado en horquilla',
  s.seasonality = 'Primavera',
  s.image_url = 'https://observation.org/photos/144643107.jpg',
  s.image_attribution = 'Ans Gorter (CC BY-NC-ND 4.0) · observation.org / GBIF',
  s.rarity_score = 2
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Filago mareotica';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Bolina',
  s.primary_habitat = 'Matorrales secos y soleados sobre suelos pobres del sureste ibérico',
  s.description = 'Mata en forma de bola, densa y ramosa, con ramillas finas y estriadas que hacen la fotosíntesis porque las hojas duran muy poco. En pleno invierno se cubre de flores amarillas agrupadas en el extremo de las ramas, en umbelas apretadas.',
  s.identification_tips = 'Mata redondeada de ramillas verdes, finas y sin espinas
Flores amarillas reunidas al final de la rama, como un ramillete
Hojas diminutas y caedizas: casi siempre parece desnuda',
  s.seasonality = 'Floración de invierno a primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Genista_umbellata.JPG?width=1280',
  s.image_attribution = 'Nanosanchez (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Genista umbellata';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cuchareta',
  s.primary_habitat = 'Pastizales anuales, eriales y suelos margosos removidos en clima árido',
  s.description = 'Crucífera anual de flores blanquecinas con nervios violáceos, inconfundible por su fruto: una vainita corta rematada por una lengüeta plana y curvada que recuerda a una cuchara. Los frutos secos persisten sobre la planta y son la mejor pista para identificarla.',
  s.identification_tips = 'Frutos con una pala plana en el extremo, como cucharillas
Hojas muy divididas, de segmentos estrechos
Planta anual pelosa, de pocos decímetros, en suelo pelado',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Carrichtera_annua2.JPG?width=1280',
  s.image_attribution = 'Flora y Vegetación de Lanzarote (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Carrichtera annua';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Fagonia',
  s.primary_habitat = 'Suelos pedregosos, ramblas y litosuelos de clima árido',
  s.description = 'Planta baja y tendida, de tallos angulosos, hojas divididas en tres y estípulas convertidas en espinas finas. Sus flores tienen cinco pétalos de un lila rosado que se abren durante las horas centrales del día. Es de estirpe norteafricana y aquí vive en el extremo de su área.',
  s.identification_tips = 'Porte tendido y desordenado, pegado al suelo
Hojas de tres foliolos con espinas en la base
Flores lila con cinco pétalos bien separados',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Fagonia_cretica.jpg?width=1280',
  s.image_attribution = 'Retama (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Fagonia cretica';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Jarilla de brezo',
  s.primary_habitat = 'Matorrales y pastizales pedregosos sobre calizas, en solanas secas',
  s.description = 'Matita leñosa de hojas estrechas y punzantes parecidas a las del brezo, de donde le viene el nombre. Sus flores amarillas, de cinco pétalos delicados, se abren por la mañana y pierden los pétalos el mismo día.',
  s.identification_tips = 'Hojas lineares, rígidas y puntiagudas, como agujas cortas
Flores amarillas efímeras, con pétalos arrugados
Mata baja y leñosa en la base, muy ramificada',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Fumana_ericoides_Tallos_2010-7-03_ParqueNaturalLagunasdelaMata.jpg?width=1280',
  s.image_attribution = 'Javier martin (Public domain) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Fumana ericoides';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Uña de gato',
  s.primary_habitat = 'Prados calcáreos del Alysso-Sedion albi',
  s.description = 'Crasulácea perenne de hojas suculentas puntiagudas y flores amarillo-verdosas, muy extendida por Murcia en repisas rocosas y prados calcáreos; especie característica del hábitat prioritario.',
  s.identification_tips = 'Hojas carnosas puntiagudas
Inflorescencia amarillo pálido
Coloniza repisas y suelos esqueléticos',
  s.seasonality = 'Verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Sedum_sediforme_hojas.jpg?width=1280',
  s.image_attribution = 'autor no indicado (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Sedum sediforme';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cantueso dentado',
  s.primary_habitat = 'Tomillares y matorral termomediterráneo',
  s.description = 'Lavanda de hojas estrechas con el borde recortado en dientes redondeados, muy aromática. Su espiga violácea remata en un penacho de brácteas del mismo color, más corto que el del cantueso común. Florece durante buena parte del año en clima cálido.',
  s.identification_tips = 'Bordes de la hoja recortados en dientes romos
Penacho de brácteas violetas en lo alto de la espiga
Aroma intenso, entre lavanda y alcanfor',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Lavandula_dentata1.jpg?width=1280',
  s.image_attribution = 'KENPEI (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Lavandula dentata';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Romerina',
  s.primary_habitat = 'Tomillares y matorral seco sobre calizas y margas',
  s.description = 'Jara pequeña de hojas muy estrechas y enrolladas por los bordes, verdes arriba y blancas por debajo, que a distancia recuerdan al romero. Se distingue enseguida al florecer: da grupos de flores blancas de cinco pétalos, mucho mayores que las del romero.',
  s.identification_tips = 'Hojas estrechas enrolladas, blancas por el envés
Flores blancas de cinco pétalos, varias juntas
Sin el olor a romero, aunque se le parezca de lejos',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Cistus_clusii_(habitus).jpg?width=1280',
  s.image_attribution = 'Hans Hillewaert (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Cistus clusii';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Albaida fina',
  s.primary_habitat = 'Matorrales áridos y espartales sobre suelos pobres del sureste ibérico',
  s.description = 'Mata blanquecina, cubierta de pelos sedosos, con las flores agrupadas de tres en tres a lo largo de las ramas, que es lo que le da nombre. Es una leguminosa del extremo árido del sureste peninsular y del norte de África, adaptada a suelos yesosos y margas.',
  s.identification_tips = 'Flores en grupos de tres, dispuestas a lo largo de la rama
Follaje sedoso y plateado por el pelo tumbado
Cáliz hinchado y peludo que envuelve la flor',
  s.seasonality = 'Floración de invierno a primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Anthyllis_terniflora_kz01.jpg?width=1280',
  s.image_attribution = 'Krzysztof Ziarnek, Kenraiz (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Anthyllis terniflora';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Escobilla',
  s.primary_habitat = 'Matorrales halo-nitrófilos',
  s.description = 'Mata en forma de escoba, con ramas verdes, largas y erguidas, casi sin hojas, que florece a final de verano. Sus frutos van rodeados de alas membranosas rosadas que la vuelven muy vistosa en otoño. Es un endemismo del sureste ibérico.',
  s.identification_tips = 'Porte en escoba, con ramas verdes largas y erectas
Hojas reducidas casi a escamas
Frutos con alas membranosas rosadas en otoño',
  s.seasonality = 'Verano y otoño',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/474144349/original.jpeg',
  s.image_attribution = 'Gabriel Dixon (CC0) · GBIF',
  s.rarity_score = 3
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Salsola genistoides';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Escarchada',
  s.primary_habitat = 'Suelos salinos y arenosos, taludes y bordes de saladar en clima cálido',
  s.description = 'Planta carnosa y tendida cuyas hojas están cubiertas de vesículas transparentes llenas de agua salada: al sol parecen cristales de hielo o gotas de rocío que no se secan. Esas vesículas almacenan la sal que la planta extrae del suelo y le permiten vivir donde el terreno es demasiado salino para otras.',
  s.identification_tips = 'Hojas anchas cubiertas de ampollitas brillantes, como escarcha
Porte rastrero, formando manchas amplias sobre suelo desnudo
Tonos rosados o rojizos al final de su ciclo',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Unk_desert_flower_3.jpg?width=1280',
  s.image_attribution = 'Yummifruitbat (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Mesembryanthemum crystallinum';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cebolla albarrana',
  s.primary_habitat = 'Matorrales secos, laderas pedregosas y arenas litorales en clima cálido',
  s.description = 'Bulbo enorme, del tamaño de un puño o mayor, que asoma medio enterrado y que en pleno agosto emite un tallo desnudo de más de un metro rematado por una larga espiga de flores blancas. Las hojas, anchas y correosas, aparecen después y desaparecen antes de florecer, así que rara vez se ven flores y hojas a la vez. Es tóxica y también se cita como Drimia maritima o Urginea maritima.',
  s.identification_tips = 'Bulbo grande y visible, asomando entre las piedras
Vara floral alta y desnuda, sin hojas, a final de verano
Roseta de hojas anchas y carnosas en invierno, sin flor',
  s.seasonality = 'Hojas en invierno; floración a final de verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Young_Drimia_maritima%2C_near_Ramon_crater%2C_Israel.jpg?width=1280',
  s.image_attribution = 'Someone35 (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Squilla maritima';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Orgaza',
  s.primary_habitat = 'Matorrales halo-nitrófilos',
  s.description = 'Mata baja y extendida, de hojas pequeñas, grisáceas y cubiertas de escamas harinosas que reflejan la luz. Marca los suelos con sal y exceso de nitrógeno, como los antiguos apriscos. Sus frutos van encerrados entre dos valvas endurecidas.',
  s.identification_tips = 'Hojas pequeñas, grises y harinosas al tacto
Porte bajo y muy extendido, casi tendido
Frutos entre dos valvas duras y dentadas',
  s.seasonality = 'Verano',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/611378691/original.jpg',
  s.image_attribution = 'Michael Bakker Paiva (CC BY 4.0) · GBIF',
  s.rarity_score = 2
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Atriplex glauca';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cerraja fina',
  s.primary_habitat = 'Muros, taludes, cunetas y pies de roca en ambientes secos y alterados',
  s.description = 'Cerraja de hojas muy divididas en segmentos estrechos, casi filiformes, que la distinguen de sus parientes de hoja ancha. Brota en cualquier grieta o talud, suelta látex blanco al partirla y florece prácticamente todo el año en clima cálido.',
  s.identification_tips = 'Hojas partidas en segmentos muy estrechos y separados
Látex blanco abundante al romper el tallo
Capítulos amarillo pálido y vilanos sedosos y blancos',
  s.seasonality = 'Casi todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Sonchus_tenerrimus_01.JPG?width=1280',
  s.image_attribution = 'Luca Fornasari (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Sonchus tenerrimus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cerrillo',
  s.primary_habitat = 'Laderas secas, ribazos y pastizales sobre suelos pedregosos',
  s.description = 'Gramínea perenne que forma matas y espiga en verano, cuando el resto del pastizal ya está agostado. Sus espiguillas van por parejas, cubiertas de pelos rojizos y con aristas retorcidas. Da al paisaje un tono dorado rojizo a final de verano.',
  s.identification_tips = 'Espiguillas peludas agrupadas por parejas
Aristas retorcidas y acodadas
Espiga en verano, cuando lo demás está seco',
  s.seasonality = 'Verano y otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Hyparrhenia_hirta_Habitus_ValledeAlcudia.jpg?width=1280',
  s.image_attribution = 'Javier martin (Public domain) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Hyparrhenia hirta';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Barba de chivo',
  s.primary_habitat = 'Pastizales anuales sobre suelos secos y pedregosos',
  s.description = 'Gramínea anual que agosta pronto y cubre los claros de matorral de un rubio pajizo. Cada semilla lleva una arista larga y retorcida que gira con los cambios de humedad y va enroscándose hasta clavarla en el suelo. Es la responsable de las «agujas» que se enganchan en los calcetines.',
  s.identification_tips = 'Aristas largas y retorcidas, en espiral al secarse
Planta anual: en verano queda seca y pajiza
Las semillas se clavan en la ropa y el pelaje',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Stipa_capensis.JPG?width=1280',
  s.image_attribution = 'Juanmadro (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Stipa capensis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Murajes',
  s.primary_habitat = 'Cultivos, cunetas, claros y suelos removidos',
  s.description = 'Hierbecilla tendida de tallos cuadrangulares y hojas enfrentadas, con flores solitarias que salen de la axila de cada hoja. Las hay de color naranja asalmonado y de color azul intenso, y ambas cierran los pétalos cuando el cielo se nubla, de ahí que se la llamara «hierba del buen tiempo».',
  s.identification_tips = 'Flores solitarias sobre un pedúnculo largo y fino
Tallos de sección cuadrada, tendidos por el suelo
Pétalos que se cierran al nublarse o a media tarde',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/A._arvensis-flor-1.JPG?width=1280',
  s.image_attribution = 'Philmarin (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Lysimachia arvensis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Lastón',
  s.primary_habitat = 'Pastizales, claros de matorral y ribazos sobre suelos calizos',
  s.description = 'Gramínea perenne y rizomatosa que forma céspedes extensos en los claros del matorral mediterráneo. Sus hojas son cortas, rígidas y de punta roma. Es de las plantas que más rápido rebrota tras un incendio, gracias a sus rizomas subterráneos.',
  s.identification_tips = 'Céspedes extensos y bajos, no matas aisladas
Hojas cortas y rígidas, de punta redondeada
Espiguillas alineadas a un lado de un eje rígido',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Brachypodium_retusum_espiga_seca.jpg?width=1280',
  s.image_attribution = 'Pere prlpz (CC BY-SA 2.5) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Brachypodium retusum';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Orgaza',
  s.primary_habitat = 'Suelos salinos y nitrificados, ramblas y bordes de saladar',
  s.description = 'Arbusto de color gris plateado, cubierto de escamas microscópicas que reflejan la luz y ayudan a expulsar sal. Sus hojas son de forma romboidal y algo carnosas. Aguanta suelos que casi ninguna otra planta tolera, por lo que se usa para restaurar terrenos degradados.',
  s.identification_tips = 'Follaje gris plateado, harinoso al tacto
Hojas con forma de rombo o de punta de flecha
Frutos rodeados de dos valvas membranosas',
  s.seasonality = 'Verano y otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Atriplex_halimus_kz1.JPG?width=1280',
  s.image_attribution = 'Krzysztof Ziarnek, Kenraiz (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Atriplex halimus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Colleja de arenal',
  s.primary_habitat = 'Dunas con céspedes del Malcolmietalia',
  s.description = 'Colleja anual muy ramificada desde la base, característica de las dunas semifijas; da nombre a la asociación Triplachno nitentis-Silenetum ramosissimae.',
  s.identification_tips = 'Muy ramificada desde la base
Cáliz inflado con nervios marcados
Anual de vida corta',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Silene_ramosissima_2.jpg?width=1280',
  s.image_attribution = 'bymamo (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Silene ramosissima';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Rubia marina',
  s.primary_habitat = 'Dunas y arenas litorales estabilizadas',
  s.description = 'Matita rígida de las arenas costeras, con las hojas dispuestas en verticilos de cuatro que envuelven el tallo formando una columna geométrica de un verde glauco. Sus flores amarillentas se abren en espigas terminales apretadas, y sus tallos leñosos fijan la arena a su alrededor.',
  s.identification_tips = 'Hojas en anillos de cuatro alrededor del tallo, muy regulares
Aspecto rígido y azulado, casi de plástico, sobre arena
Espigas terminales de flores pequeñas y amarillentas',
  s.seasonality = 'Primavera y principio de verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Crucianella_maritima_1.JPG?width=1280',
  s.image_attribution = 'Gideon Pisanty (Gidip) גדעון פיזנטי (CC BY 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Crucianella maritima';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Acebuche',
  s.primary_habitat = 'Matorral alto, laderas secas y barrancos del piso más cálido',
  s.description = 'El acebuche es el olivo silvestre: mismo árbol, sin siglos de selección. Tiene las hojas más pequeñas y duras, las ramas jóvenes a menudo espinosas y aceitunas diminutas. Forma matorrales altos y es el árbol característico de las laderas cálidas mediterráneas.',
  s.identification_tips = 'Hojas pequeñas, verdes arriba y plateadas por debajo
Ramillas jóvenes rígidas y a veces espinosas
Aceitunas muy pequeñas, de poco más de un centímetro',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Ullastre_vell.JPG?width=1280',
  s.image_attribution = 'Antoni Salvà (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Olea europaea subsp. europaea';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Albaida',
  s.primary_habitat = 'Matorral seco y soleado sobre margas y suelos pobres',
  s.description = 'Mata de aspecto blanquecino por la fina pelusa que cubre hojas y tallos, un recurso frente al sol y la sequía. En primavera se llena de espigas de flores amarillas que atraen a muchos insectos. Es una de las leguminosas que primero coloniza laderas degradadas y taludes.',
  s.identification_tips = 'Aspecto grisáceo y aterciopelado al tacto
Flores amarillas pequeñas en espigas apretadas
Hojas divididas en tres, la del centro más larga',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Anthyllis_cytisoides.JPG?width=1280',
  s.image_attribution = 'Ximenex (CC BY-SA 2.1 es) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Anthyllis cytisoides';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Boja negra',
  s.primary_habitat = 'Matorrales halo-nitrófilos',
  s.description = 'Mata aromática grisácea de las bojas del sureste árido, colonizadora de suelos alterados, bordes de camino y matorrales nitrificados.',
  s.identification_tips = 'Olor aromático fuerte al frotar
Follaje gris-plateado
Indica suelos alterados',
  s.seasonality = 'Otoño',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/173279674/original.jpeg',
  s.image_attribution = 'Yamil J.R (CC0) · GBIF',
  s.rarity_score = 2
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Artemisia barrelieri';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Acelguilla espinosa',
  s.primary_habitat = 'Pastizales secos, suelos margosos y salinos en clima árido',
  s.description = 'Saladilla anual pequeña, con una roseta de hojas ásperas al tacto y tallos ramificados en zigzag que llevan las flores en espiguillas cortas. Las flores, blanquecinas o violáceas, conservan el cáliz seco y papiráceo mucho después de marchitarse.',
  s.identification_tips = 'Hojas de la roseta ásperas, con pelillos duros
Tallos en zigzag, con ramas divaricadas
Cálices secos y papiráceos persistiendo tras la flor',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Limonium_echioides233.JPG?width=1280',
  s.image_attribution = 'Nanosanchez (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Limonium echioides';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Campanica',
  s.primary_habitat = 'Ribazos, cunetas, cultivos y claros de matorral',
  s.description = 'Correhuela trepadora de flores rosadas grandes y llamativas, con hojas muy variables: las de abajo casi enteras y las de arriba profundamente divididas y plateadas. Se enreda en la vegetación de ribazos y márgenes.',
  s.identification_tips = 'Flores rosa intenso en embudo, grandes y vistosas
Hojas superiores muy recortadas y de aspecto plateado
Tallos volubles que se enredan en otras plantas',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Convolvulus_althaeoides_1.JPG?width=1280',
  s.image_attribution = 'User:Xemenendura (CC BY-SA 2.1 es) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Convolvulus althaeoides';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Siempreviva de Cosson',
  s.primary_habitat = 'Saladares, acantilados costeros y suelos salinos margosos',
  s.description = 'Siempreviva de roseta basal de hojas espatuladas y tallos ramificados que sostienen espiguillas de flores diminutas de color lila. Los cálices secos y papiráceos permanecen en la planta hasta el invierno siguiente, dando al saladar un tono pajizo persistente.',
  s.identification_tips = 'Roseta basal de hojas anchas y espatuladas
Ramificación en zigzag, muy abierta
Cálices secos que persisten meses tras florecer',
  s.seasonality = 'Verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Limonium_cossonianum.jpg?width=1280',
  s.image_attribution = 'Nanosanchez (CC0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Limonium cossonianum';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Sosa blanca',
  s.primary_habitat = 'Marismas, saladares y orillas de aguas salobres',
  s.description = 'Hierba anual de hojas cilíndricas y carnosas que crece en los suelos más encharcados y salinos del saladar, donde el agua sube y baja. Al final del ciclo toma tonos rojizos o purpúreos que delatan su presencia a distancia.',
  s.identification_tips = 'Hojas carnosas, cilíndricas y de punta roma
Flores diminutas y verdosas en la axila de las hojas
Coloración rojiza al final del verano, en suelo salino húmedo',
  s.seasonality = 'Verano y otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Suaeda_maritima_01_by_Line1.JPG?width=1280',
  s.image_attribution = 'Liné1 (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Suaeda maritima';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Albohol',
  s.primary_habitat = 'Saladares, depresiones salinas y suelos arcillosos que se encharcan en invierno',
  s.description = 'Hierba anual tendida, de hojas pequeñas y enfrentadas con el envés cubierto de un polvillo blanco de sal que la planta expulsa por glándulas propias. Forma alfombras bajas y ralas en los claros del saladar, con flores rosadas de cinco pétalos diminutos.',
  s.identification_tips = 'Envés de las hojas blanquecino, como espolvoreado
Porte tendido y menudo, pegado al suelo salino
Flores rosadas muy pequeñas, en la axila de las hojas',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Frankenia_pulverulenta_kz2.jpg?width=1280',
  s.image_attribution = 'Krzysztof Ziarnek, Kenraiz (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Frankenia pulverulenta';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Taraje',
  s.primary_habitat = 'Ramblas, cauces salinos, márgenes de saladar y arenas húmedas',
  s.description = 'Arbolillo de porte ligero y ramas colgantes cubiertas de hojas escamosas diminutas, con un follaje que de lejos parece humo verde. Tolera la sal como pocos árboles: la excreta por sus hojas, y sus espigas rosadas de flores minúsculas cubren la copa en primavera.',
  s.identification_tips = 'Hojas escamosas de un par de milímetros, pegadas a la ramilla
Ramas finas y péndulas, de aspecto plumoso
Espigas densas de florecillas rosadas o blanquecinas',
  s.seasonality = 'Floración de primavera a verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Tamarix_gallica_-_Villa_Taranto_(Verbania)_-_DSC03778.JPG?width=1280',
  s.image_attribution = 'Daderot (Public domain) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Tamarix gallica';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Grama de arena',
  s.primary_habitat = 'Arenas litorales y suelos sueltos y secos',
  s.description = 'Gramínea anual enana que forma una mata apretada a ras de suelo, con la inflorescencia reducida a una cabezuela compacta casi sin tallo, medio escondida entre las hojas. Vive en arenas móviles, donde su ciclo relámpago aprovecha la humedad de las lluvias.',
  s.identification_tips = 'Inflorescencia en cabezuela apretada, casi sentada sobre la mata
Planta enana, de pocos centímetros, sobre arena suelta
Hojas cortas y rígidas, agrupadas en la base',
  s.seasonality = 'Primavera',
  s.image_url = NULL,
  s.image_attribution = NULL,
  s.rarity_score = 3
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Ammochloa palaestina';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Ajo porro',
  s.primary_habitat = 'Arenas litorales, pastizales secos y claros de matorral',
  s.description = 'Ajo silvestre de flores blancas agrupadas en una umbela laxa sobre un tallo fino, con las hojas estrechas y con el borde y el nervio ligeramente pelosos. Como todos los ajos, delata su identidad en cuanto se estruja una hoja.',
  s.identification_tips = 'Umbela de flores blancas con nervio verdoso en cada pétalo
Hojas estrechas con pelillos en el margen
Olor claro a ajo al frotar las hojas o el bulbo',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Allium_subvillosum.JPG?width=1280',
  s.image_attribution = 'Xemenendura (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Allium subvillosum';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Algarrobo',
  s.primary_habitat = 'Laderas cálidas, antiguos cultivos y matorral del piso termomediterráneo',
  s.description = 'Árbol perennifolio de copa densa y hojas compuestas con foliolos redondeados y lustrosos. Florece en otoño directamente sobre el tronco y las ramas viejas. Sus vainas pardas y dulces, las algarrobas, se han usado durante siglos como pienso y alimento.',
  s.identification_tips = 'Hojas compuestas de foliolos redondos y brillantes
Flores nacidas directamente del tronco y las ramas gruesas
Vainas pardas y aplanadas colgando del árbol',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Ceratonia_siliqua_Keciboynuzu_1370984_Nevit.jpg?width=1280',
  s.image_attribution = 'Nevit Dilmen (talk) (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Ceratonia siliqua';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cerraja gaditana',
  s.primary_habitat = 'Arenas litorales, suelos salinos y eriales cercanos a la costa',
  s.description = 'Pariente cercana del cerrajón, anual y de hojas carnosas abrazadas al tallo, con capítulos amarillos y látex blanco. Es propia de suelos arenosos y algo salinos del suroeste y del sureste peninsular.',
  s.identification_tips = 'Hojas basales carnosas, con dientes anchos y triangulares
Capítulos amarillos con brácteas de borde membranoso
Látex blanco al partir cualquier parte de la planta',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Reichardia_gaditana_2.JPG?width=1280',
  s.image_attribution = 'Xemenendura (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Reichardia gaditana';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Eslizón ibérico',
  s.primary_habitat = 'Matorral termomediterráneo semiárido',
  s.description = 'Eslizón de cuerpo cilíndrico y brillante, con las patas tan reducidas que apenas se usan: se desplaza reptando y buceando entre la arena y la hojarasca. Su dorso, dorado o bronceado, lleva hileras de ocelos oscuros con el centro claro.',
  s.identification_tips = 'Patas diminutas, casi inútiles para caminar
Cuerpo cilíndrico y muy brillante, como pulido
Hileras de ocelos oscuros de centro claro en el dorso',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Chalcides_bedriagai_01_by-dpc.jpg?width=1280',
  s.image_attribution = 'David Perez (CC BY 3.0) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Chalcides bedriagai';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Helianthemum viscarium',
  s.primary_habitat = 'Tomillares y matorral raso sobre margas y suelos yesosos',
  s.description = 'Jarilla pequeña y pegajosa, con hojas estrechas y tallos cubiertos de pelos glandulosos que retienen el polvo. Sus flores amarillas duran apenas unas horas y se renuevan cada día. Es un endemismo del sureste ibérico ligado a suelos margosos.',
  s.identification_tips = 'Tallos pegajosos, con polvo y arena adheridos
Flores amarillas efímeras, de un solo día
Sobre margas y yesos, en terreno claro',
  s.seasonality = 'Primavera',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/384325778/original.jpg',
  s.image_attribution = 'anarkis (CC BY-NC 4.0) · GBIF/iNaturalist',
  s.rarity_score = 1
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Helianthemum viscarium';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cardo mancaperros',
  s.primary_habitat = 'Pastizales secos, eriales y suelos margosos pisoteados',
  s.description = 'Cardo corredor anual, muy espinoso y rígido, con hojas duras parecidas a las de la encina —de ahí el nombre— y cabezuelas espinosas azuladas rodeadas de brácteas punzantes. Al secarse se vuelve leñoso y persiste todo el verano pinchando a quien pase.',
  s.identification_tips = 'Hojas rígidas y espinosas, recortadas como las de la encina
Cabezuelas con brácteas largas y punzantes en estrella
Tonos azulados en las brácteas durante la floración',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Eryngium_ilicifolium_InflorescenceCloseup2_DehesaBoyaldePuertollano.jpg?width=1280',
  s.image_attribution = 'Javier martin (Public domain) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Eryngium ilicifolium';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cosco',
  s.primary_habitat = 'Suelos salinos y margosos desnudos, en depresiones áridas',
  s.description = 'Anual carnosa y tendida, cubierta de papilas que le dan aspecto áspero y blanquecino, con flores pequeñas sin pétalos que se abren estrelladas al sol. Es una planta de los suelos más pobres y salinos, donde forma manchas dispersas sobre el barro desnudo.',
  s.identification_tips = 'Ramas carnosas y tendidas, ásperas y grisáceas
Flores sin pétalos, con sépalos que se abren en estrella
Crece sobre suelo desnudo, salino o margoso',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Aizoon_hispanicum_2b.JPG?width=1280',
  s.image_attribution = 'Ghislain118 https://www.fleurs-des-montagnes.net (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Aizoanthemopsis hispanica';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Crásula enana',
  s.primary_habitat = 'Claros arenosos y suelos someros que se encharcan brevemente en invierno',
  s.description = 'Una de las plantas con flor más pequeñas de la península: apenas un centímetro de tallos carnosos con hojitas apretadas en pares, que al madurar se tiñen de rojo intenso y colorean el suelo. Hay que agacharse mucho para verla, pero cuando abunda pinta manchas rojizas inconfundibles.',
  s.identification_tips = 'Planta minúscula, de menos de dos centímetros
Hojas carnosas opuestas y apretadas a lo largo del tallo
Vira a rojo intenso al madurar, tiñendo el suelo',
  s.seasonality = 'Final de invierno y primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Crassula_connata.jpg?width=1280',
  s.image_attribution = 'Mike (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Crassula tillaea';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Erodio',
  s.primary_habitat = 'Litosuelos y pastizales abiertos',
  s.description = 'Pequeña geraniácea anual de suelos abiertos y pedregosos, de floración temprana en el piso termomediterráneo semiárido.',
  s.identification_tips = 'Flores rosadas pequeñas
Fruto con pico alargado característico de Erodium
Anual de suelos pedregosos',
  s.seasonality = 'Primavera',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/642301345/original.jpg',
  s.image_attribution = 'Laia Lahoz (CC BY-NC 4.0) · iNaturalist/GBIF',
  s.rarity_score = 4
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Erodium sanguis-christi';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Grama salada',
  s.primary_habitat = 'Saladares, depresiones salinas y suelos arcillosos con sal',
  s.description = 'Gramínea anual delicada, de tallos finísimos y panícula muy abierta con las ramas separadas casi en ángulo recto, que en conjunto parece una nube. Es una de las pocas gramíneas capaces de completar su ciclo en los suelos salinos del saladar.',
  s.identification_tips = 'Panícula muy abierta, con ramas separadas en ángulo recto
Planta anual grácil, de tallos capilares
Espiguillas diminutas en el extremo de las ramas',
  s.seasonality = 'Primavera',
  s.image_url = 'https://observation.org/photos/125538681.jpg',
  s.image_attribution = 'Humedales de Navarra (CC BY-NC-ND 4.0) · observation.org / GBIF',
  s.rarity_score = 2
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Sphenopus divaricatus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Canadillo',
  s.primary_habitat = 'Roquedos, matorral seco y pie de acantilado en clima cálido',
  s.description = 'Arbusto de aspecto extraño: un manojo de tallos verdes, articulados y colgantes, casi sin hojas, que se quiebran con facilidad por los nudos. No es una planta con flores, sino un pariente lejano de las coníferas; sus semillas van envueltas en una cubierta roja y carnosa.',
  s.identification_tips = 'Tallos verdes articulados que se rompen por los nudos
Sin hojas visibles, solo escamas en cada nudo
Frutos rojos carnosos con una semilla dentro',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Ephedra_fragilis_3.JPG?width=1280',
  s.image_attribution = 'User:falconaumanni (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Ephedra fragilis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Oroval',
  s.primary_habitat = 'Matorral cálido, roquedos y ramblas de clima muy seco',
  s.description = 'Arbusto de la familia del tomate y la belladona, con hojas ovaladas algo carnosas y flores verdosas discretas. Los frutos son bayas rojas y brillantes envueltas en el cáliz. Es una especie de raíz norteafricana que en la península solo vive en los rincones más cálidos del sureste.',
  s.identification_tips = 'Bayas rojas pequeñas asomando del cáliz
Hojas ovales, algo carnosas y de verde apagado
Flores verde amarillentas, poco vistosas',
  s.seasonality = 'Primavera y otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Withania_frutescens0176.jpg?width=1280',
  s.image_attribution = 'Nanosanchez (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Withania frutescens';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Martín pescador',
  s.primary_habitat = 'Ríos, ramblas con pozas, canales y láminas de agua con posaderos y taludes terrosos',
  s.description = 'Pájaro rechoncho de color azul turquesa iridiscente por encima y naranja por debajo, con un pico largo y recto desproporcionado. Pesca lanzándose en picado desde una rama sobre el agua y anida en un túnel que excava en taludes de tierra.',
  s.identification_tips = 'Destello azul eléctrico volando bajo y recto sobre el agua
Silbido agudo y penetrante, casi siempre antes de verlo
Posado inmóvil en una rama sobre el agua, cabeza gacha',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Common_Kingfisher_Alcedo_atthis.jpg?width=1280',
  s.image_attribution = 'Andreas Trepte (CC BY-SA 2.5) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Alcedo atthis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Alcaraván',
  s.primary_habitat = 'Llanos pedregosos, cultivos de secano, ramblas y eriales con poca cobertura',
  s.description = 'Ave de aspecto extraño y ojos amarillos enormes, adaptados a la actividad nocturna. De día permanece agachada e inmóvil, confiada en su plumaje críptico, y solo al anochecer se activa y delata con un reclamo silbado y melancólico que recuerda al del zarapito.',
  s.identification_tips = 'Ojos amarillos desproporcionadamente grandes
Dos barras blancas y negras en el ala plegada
Reclamo silbado y triste al anochecer',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Burhinus_oedicnemus_insularum_Lanzarote_1.jpg?width=1280',
  s.image_attribution = 'Frank Vassen from Brussels, Belgium (CC BY 2.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Burhinus oedicnemus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Chotacabras cuellirrojo',
  s.primary_habitat = 'Matorral abierto, pinares aclarados, ramblas y caminos térreos',
  s.description = 'Ave crepuscular de plumaje jaspeado que imita la hojarasca, tan mimético que de día resulta casi imposible verla posada en el suelo. Caza polillas en vuelo con la boca muy abierta. Su canto nocturno es un «cu-toc, cu-toc» repetido de forma monótona durante minutos.',
  s.identification_tips = 'Collar rojizo en la nuca, más marcado que en su pariente europeo
Se levanta del camino al anochecer y vuelve a posarse unos metros más allá
Canto nocturno monótono, como un motor lejano',
  s.seasonality = 'Primavera y verano (estival)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Caprimulgus_ruficollis_-Portugal-8.jpg?width=1280',
  s.image_attribution = 'Olivença (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Caprimulgus ruficollis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Carraca europea',
  s.primary_habitat = 'Campos abiertos con arbolado disperso, ribazos y construcciones con huecos',
  s.description = 'Del tamaño de una paloma y de un azul turquesa intenso que sorprende al levantar el vuelo. Caza al acecho desde cables y postes, dejándose caer sobre saltamontes y escarabajos. Cría en huecos de árboles viejos y de edificios, de ahí que dependa de que queden árboles añosos y ruinas en el campo.',
  s.identification_tips = 'Azul turquesa que solo se aprecia bien cuando vuela
Espalda de color canela que contrasta con el azul
Posada quieta en cables, oteando el suelo',
  s.seasonality = 'Primavera y verano (estival)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/European_roller.jpg?width=1280',
  s.image_attribution = 'Christian Svane (CC BY-SA 2.5) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Coracias garrulus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Garceta común',
  s.primary_habitat = 'Marismas, salinas, ramblas con agua, arrozales y orillas costeras',
  s.description = 'Garza blanca y esbelta, de tamaño medio, con el pico negro y las patas negras rematadas en unos pies amarillos llamativos. Pesca removiendo el fondo con esas patas para levantar peces y camarones. En época de cría luce dos plumas largas y finas en la nuca.',
  s.identification_tips = 'Pies amarillos al final de patas negras
Pico negro y fino, no amarillo
Remueve el fondo con una pata mientras acecha',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Aigrette_garzette_au_lac_sud_de_Tunis_(site_RAMSAR).jpg?width=1280',
  s.image_attribution = 'El Golli Mohamed (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Egretta garzetta';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Halcón peregrino',
  s.primary_habitat = 'Cortados y áreas abiertas',
  s.description = 'Halcón robusto de alas puntiagudas y cola corta, capaz de superar los 300 km/h en el picado con que abate a otras aves en pleno vuelo. Se reconoce por la ancha bigotera negra que baja desde el ojo sobre un pecho claro y barrado.',
  s.identification_tips = 'Bigotera negra ancha bajo el ojo, como un casco
Silueta de ancla: alas puntiagudas y cola corta
Pecho claro con barrado fino en horizontal',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Falco_peregrinus_-_01.jpg?width=1280',
  s.image_attribution = 'Carlos Delgado (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Falco peregrinus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cigüeñuela',
  s.primary_habitat = 'Salinas, marismas, charcas someras y humedales salobres',
  s.description = 'Limícola blanca y negra de patas rosadas larguísimas, desproporcionadas para su tamaño, que le permiten caminar por aguas someras picoteando insectos en la superficie. Es ruidosa y muy territorial cerca del nido, y sobrevuela en círculos a quien se acerca.',
  s.identification_tips = 'Patas rojizas extremadamente largas, que sobresalen en vuelo
Contraste limpio de blanco y negro, con pico fino y recto
Reclamo insistente y chillón al sobrevolar al intruso',
  s.seasonality = 'Sobre todo de primavera a verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Himantopus_himantopus.jpg?width=1280',
  s.image_attribution = '(Hans Hillewaert) (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Himantopus himantopus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Collalba negra',
  s.primary_habitat = 'Matorral litoral, laderas secas y roquedos',
  s.description = 'La mayor de las collalbas, enteramente negra salvo el obispillo y la base de la cola, blancos. Vive en cortados y laderas rocosas, donde construye junto al nido una plataforma de piedrecitas que acarrea una a una. Su canto es potente y melodioso.',
  s.identification_tips = 'Cuerpo negro con obispillo blanco muy contrastado
«T» negra invertida en la cola blanca al volar
Montoncitos de piedrecitas junto a la grieta del nido',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Black_Wheatear%2C_Isla_Plana_3.jpg?width=1280',
  s.image_attribution = 'Andrew Thomas from Shrewsbury, UK (CC BY-SA 2.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Oenanthe leucura';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Tórtola europea',
  s.primary_habitat = 'Sotos, arboledas y matorral alto junto a cultivos y ramblas',
  s.description = 'La más pequeña y grácil de nuestras palomas, con el dorso escamado en negro y canela y un parche a rayas blancas y negras en el cuello. Su arrullo ronco y adormecedor es uno de los sonidos del verano. Sus poblaciones han caído mucho en Europa por la pérdida de barbechos y setos.',
  s.identification_tips = 'Espalda escamada, como un mosaico canela y negro
Parche rayado blanco y negro a los lados del cuello
Arrullo ronco y vibrante, muy distinto al de la tórtola turca',
  s.seasonality = 'Primavera y verano (estival)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Streptopelia_turtur_Grlica0036.jpg?width=1280',
  s.image_attribution = 'Zrno at Serbian Wikipedia (Public domain) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Streptopelia turtur';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Charrancito común',
  s.primary_habitat = 'Playas de arena y grava, salinas y lagunas costeras',
  s.description = 'El más pequeño de los charranes europeos, con la frente blanca y el pico amarillo de punta negra. Cría directamente sobre la arena o la grava, en nidos que son poco más que un hoyo, lo que lo hace muy sensible al tránsito de personas en las playas.',
  s.identification_tips = 'Frente blanca que contrasta con el capirote negro
Pico amarillo con la punta negra
Se ciñe sobre el agua antes de zambullirse en picado',
  s.seasonality = 'Primavera y verano (estival)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Little_Tern_6820C.jpg?width=1280',
  s.image_attribution = 'Little_Tern_6820.jpg: Alnus derivative work: Osado (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Sternula albifrons';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Alca común',
  s.primary_habitat = 'Mar abierto y aguas costeras fuera de la época de cría',
  s.description = 'Ave marina compacta, negra por arriba y blanca por debajo, con un pico grueso y comprimido lateralmente cruzado por una línea blanca. Vuela bajo y rápido, rozando el agua, y bucea propulsándose con las alas para perseguir peces pequeños.',
  s.identification_tips = 'Pico grueso y aplanado de lado, con una raya blanca vertical
Vuelo rápido a ras de agua, con aleteo rígido
Se zambulle desde la superficie, sin lanzarse desde el aire',
  s.seasonality = 'Invierno',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Razorbill_iceland.JPG?width=1280',
  s.image_attribution = 'autor no indicado (Public domain) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Alca torda';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Pardela cenicienta mediterránea',
  s.primary_habitat = 'Mar abierto; cría en islotes e islas del Mediterráneo',
  s.description = 'Pardela grande de dorso pardo ceniciento y vientre blanco, con pico amarillento, que planea largamente sobre las olas alternando ascensos y descensos casi sin batir las alas. Cría en colonias en islotes rocosos y se acerca a ellos de noche, con reclamos que recuerdan a un llanto.',
  s.identification_tips = 'Vuelo planeado en arcos largos, casi sin aletear
Dorso pardo ceniciento sin capucha oscura marcada
Pico amarillento con la punta oscura',
  s.seasonality = 'De primavera a otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/CorysShearwaterBottom.jpg?width=1280',
  s.image_attribution = 'TomAllmendinger (CC BY 2.5) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Calonectris diomedea';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Fumarel común',
  s.primary_habitat = 'Humedales, lagunas y costas someras durante el paso migratorio',
  s.description = 'Charrán pequeño y oscuro que en plumaje nupcial es casi negro con las alas grises, y en invierno gris y blanco con una mancha oscura en el lado del pecho. No se zambulle como los charranes marinos: vuela errático sobre el agua y picotea la superficie al pasar.',
  s.identification_tips = 'Vuelo errático y buceante sobre el agua, sin zambullirse
Mancha oscura a los lados del pecho en plumaje de invierno
Cola poco ahorquillada, más corta que la de los charranes',
  s.seasonality = 'Pasos de primavera y otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Chlidonias_niger.jpg?width=1280',
  s.image_attribution = 'USGov (Public domain) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Chlidonias niger';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Paíño europeo',
  s.primary_habitat = 'Mar abierto; cría en grietas y cuevas de islotes',
  s.description = 'El ave marina más pequeña del Mediterráneo, apenas del tamaño de un gorrión, negruzca con una banda blanca muy marcada en la rabadilla. Revolotea a ras de agua como una mariposa, con las patas colgando y rozando la superficie.',
  s.identification_tips = 'Tamaño diminuto, negruzco, con obispillo blanco evidente
Vuelo aleteado y errático, casi pegado al agua
Patas colgando que rozan la superficie al alimentarse',
  s.seasonality = 'Sobre todo de primavera a otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Hydrobates_pelagicus.jpg?width=1280',
  s.image_attribution = 'Júlio Reis (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Hydrobates pelagicus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Gaviota de Audouin',
  s.primary_habitat = 'Islotes y costas mediterráneas; pesca en mar abierto cerca de la orilla',
  s.description = 'Gaviota mediterránea de tamaño medio, elegante y de aspecto más «limpio» que la patiamarilla, con el pico rojo coral anillado de negro y las patas verdosas oscuras. Pesca al vuelo rozando el agua, sobre todo de noche y de madrugada. Cría en colonias muy concentradas en islotes y salinas.',
  s.identification_tips = 'Pico rojo coral con una banda negra cerca de la punta
Patas verde oscuro, no amarillas
Ojo oscuro que le da expresión suave',
  s.seasonality = 'Todo el año, con concentraciones en verano',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/611415320/original.jpg',
  s.image_attribution = 'Michael Bakker Paiva (CC BY 4.0) · GBIF',
  s.rarity_score = 4
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Larus audouinii';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Gaviota sombría',
  s.primary_habitat = 'Costas, puertos, playas y vertederos, sobre todo en invierno',
  s.description = 'Gaviota grande de dorso gris oscuro o casi negro y patas amarillas, que cría en el norte de Europa e inverna en gran número en las costas ibéricas. Se mezcla con la patiamarilla, de la que se distingue por el manto mucho más oscuro y el porte algo más estilizado.',
  s.identification_tips = 'Manto gris pizarra oscuro, mucho más que en la patiamarilla
Patas amarillas y pico amarillo con mancha roja
Presente sobre todo en invierno, en bandos mixtos',
  s.seasonality = 'Otoño e invierno',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Larus-fuscus-taxbox.jpg?width=1280',
  s.image_attribution = 'Andreas Trepte (CC BY-SA 2.5) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Larus fuscus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Gaviota cabecinegra',
  s.primary_habitat = 'Costas, playas, salinas y lagunas litorales',
  s.description = 'Gaviota mediana de alas blanquecinas sin puntas negras, pico rojo coral y capucha negra completa en primavera. En vuelo destaca por sus primarias sin marcas oscuras, un rasgo que la separa de la reidora aun de lejos.',
  s.identification_tips = 'Alas blancas sin puntas negras, muy pálidas en vuelo
Pico rojo intenso y grueso, con anillo ocular blanco
Capucha negra completa en primavera; mancha en la oreja en invierno',
  s.seasonality = 'Otoño e invierno, con paso en primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Larus_melanocephalus_aka_Mediterranean_Gull_rare_guest_in_Sweden2.jpg?width=1280',
  s.image_attribution = 'Martin Olsson (mnemo on en/sv wikipedia and commons, martin@minimum… (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Larus melanocephalus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Gaviota reidora',
  s.primary_habitat = 'Costas, salinas, embalses, ríos y campos de cultivo inundados',
  s.description = 'Gaviota pequeña y ágil, muy común en invierno tierra adentro. En verano lleva la cabeza cubierta por una capucha de color chocolate; en invierno solo le queda una mancha oscura tras el ojo. En vuelo enseña una cuña blanca inconfundible en el borde delantero del ala.',
  s.identification_tips = 'Cuña blanca en el filo delantero del ala, visible en vuelo
En invierno, una mancha oscura como un auricular tras el ojo
Pico y patas rojo oscuro',
  s.seasonality = 'Otoño e invierno',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/605325270/original.jpg',
  s.image_attribution = 'lalaia (CC BY 4.0) · GBIF',
  s.rarity_score = 2
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Chroicocephalus ridibundus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Alcatraz atlántico',
  s.primary_habitat = 'Mar abierto y aguas costeras en invierno',
  s.description = 'Ave marina grande y blanca con las puntas de las alas negras y la cabeza teñida de amarillo, de silueta afilada como una lanza. Pesca lanzándose en picado desde decenas de metros y entrando en el agua como un arpón, en zambullidas que se ven desde la costa.',
  s.identification_tips = 'Silueta blanca en cruz, con las puntas de las alas negras
Zambullidas verticales espectaculares desde gran altura
Cabeza y cuello con tinte amarillento en los adultos',
  s.seasonality = 'Otoño e invierno',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Morus_bassanus_adu.jpg?width=1280',
  s.image_attribution = 'Andreas Trepte (CC BY-SA 2.5) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Morus bassanus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Págalo parásito',
  s.primary_habitat = 'Mar abierto y aguas costeras durante los pasos migratorios',
  s.description = 'Ave marina de vuelo rápido y ágil, con aspecto de gaviota estilizada y las dos plumas centrales de la cola alargadas en punta. Se alimenta persiguiendo a charranes y gaviotas hasta obligarlos a soltar la presa, un comportamiento llamado cleptoparasitismo.',
  s.identification_tips = 'Persigue a otras aves marinas en vuelo, acosándolas
Dos plumas centrales de la cola alargadas y puntiagudas
Manchas blancas en la base de las primarias, visibles en vuelo',
  s.seasonality = 'Pasos de primavera y otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Arctic_skua_(Stercorarius_parasiticus)_on_an_ice_floe%2C_Svalbard.jpg?width=1280',
  s.image_attribution = 'AWeith (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Stercorarius parasiticus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Págalo pomarino',
  s.primary_habitat = 'Mar abierto, en paso migratorio frente a las costas',
  s.description = 'Págalo grande y robusto, de pecho ancho y vuelo potente, con las plumas centrales de la cola ensanchadas y retorcidas en cuchara cuando es adulto. Como sus parientes, roba comida a otras aves marinas y sigue a los barcos de pesca.',
  s.identification_tips = 'Plumas centrales de la cola anchas y retorcidas en el adulto
Cuerpo pesado y pecho ancho, más que en el págalo parásito
Vuelo directo y potente, con aleteo profundo',
  s.seasonality = 'Pasos de otoño y primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Stercorarius_pomarinusPCCA20070623-3985B.jpg?width=1280',
  s.image_attribution = 'Patrick Coin (Patrick Coin) (CC BY-SA 2.5) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Stercorarius pomarinus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Charrán común',
  s.primary_habitat = 'Costas, salinas, deltas y lagunas litorales',
  s.description = 'Charrán esbelto de alas estrechas y cola muy ahorquillada, gris pálido por encima, con capirote negro y pico rojo de punta oscura. Pesca cerniéndose sobre el agua y lanzándose en picado corto, y su reclamo áspero delata las colonias a distancia.',
  s.identification_tips = 'Pico rojo con la punta negra en primavera y verano
Cola muy ahorquillada, con las plumas externas largas
Se cierne y se lanza en picado corto sobre el agua',
  s.seasonality = 'De primavera a otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Charr%C3%A1n_Com%C3%BAn_(Sterna_hirundo_hirundo)_in_Canary_Islands.jpg?width=1280',
  s.image_attribution = 'Juan Emilio from Las Palmas de Gran Canaria, España (CC BY-SA 2.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Sterna hirundo';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Charrán patinegro',
  s.primary_habitat = 'Costas, bahías y salinas; pesca sobre aguas someras',
  s.description = 'Charrán grande y pálido, con un penacho negro despeinado en la nuca y un pico negro rematado en amarillo, como si lo hubiera mojado en mostaza. Pesca zambulléndose de golpe desde varios metros de altura. Fuera de la época de cría pierde el negro de la frente y queda con la coronilla blanca.',
  s.identification_tips = 'Punta amarilla en el pico negro
Nuca con plumas negras erizadas, en penacho
Se lanza al agua en picado, plegando las alas',
  s.seasonality = 'Otoño e invierno principalmente',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/606127388/original.jpg',
  s.image_attribution = 'Diego González Dopico (CC BY 4.0) · GBIF',
  s.rarity_score = 2
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Thalasseus sandvicensis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Pardela balear',
  s.primary_habitat = 'Mar abierto y aguas costeras; cría solo en las Baleares',
  s.description = 'Pardela mediana, parda por arriba y sucia por debajo, que vuela en bandos bajos y rasantes alternando planeos y series de aleteos rápidos. Es el ave marina más amenazada de Europa: cría únicamente en las Baleares y su población total se cuenta por miles.',
  s.identification_tips = 'Vuelo bajo y rasante, alternando planeo y aleteos rápidos
Partes inferiores pardo sucio, sin blanco limpio
Suele verse en bandos que siguen la línea de costa',
  s.seasonality = 'Sobre todo de final de invierno a verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Puffinus_mauretanicus.jpg?width=1280',
  s.image_attribution = 'Conselleria de Medi Ambient i Mobilitat, Govern des Illes Balears (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 5
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Puffinus mauretanicus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Págalo grande',
  s.primary_habitat = 'Mar abierto y aguas costeras en invierno',
  s.description = 'El mayor de los págalos, pardo y macizo, del tamaño de una gaviota grande, con manchas blancas muy llamativas en la base de las alas que destellan a cada aleteo. Es un pirata consumado: acosa a alcatraces y gaviotas y también captura presas directamente.',
  s.identification_tips = 'Manchas blancas conspicuas en la base de las primarias
Plumaje pardo uniforme y cuerpo macizo, de gaviota grande
Vuelo pesado que se vuelve ágil al perseguir a otras aves',
  s.seasonality = 'Otoño e invierno',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Great_Skua.jpg?width=1280',
  s.image_attribution = 'Andreas Trepte (CC BY-SA 2.5) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Stercorarius skua';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Gaviota patiamarilla',
  s.primary_habitat = 'Costas, puertos, playas, acantilados y basureros',
  s.description = 'La gaviota grande más común del Mediterráneo: manto gris claro, patas amarillas y un pico robusto con una mancha roja en la mandíbula inferior. Es oportunista hasta el extremo —pesca, roba, carroñea y frecuenta puertos y vertederos— y sus colonias ocupan islotes y cortados costeros.',
  s.identification_tips = 'Patas amarillas y pico amarillo con mancha roja
Manto gris claro con puntas de las alas negras y espejos blancos
Los jóvenes son pardos moteados y tardan cuatro años en cambiar',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Larus_michahellis_LC0046.jpg?width=1280',
  s.image_attribution = 'Jörg Hempel (CC BY-SA 2.0 de) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Larus michahellis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Pardela cenicienta atlántica',
  s.primary_habitat = 'Mar abierto; cría en islas atlánticas y se ve en paso por el Mediterráneo occidental',
  s.description = 'Gemela de la pardela cenicienta mediterránea, algo mayor y más robusta, con el mismo vuelo planeador en arcos sobre el mar. Cría en el Atlántico —Canarias, Azores, Madeira— y entra en el Mediterráneo occidental fuera de la época de cría.',
  s.identification_tips = 'Silueta grande y pesada planeando en arcos sobre las olas
Dorso pardo uniforme y vientre blanco limpio
Alas más anchas y batido más lento que en gaviotas',
  s.seasonality = 'De verano a otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Cory''s_Shearwater_from_the_Crossley_ID_Guide_Britain_and_Ireland_crop.jpg?width=1280',
  s.image_attribution = 'Richard Crossley (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'cuatro-calas' AND s.scientific_name = 'Calonectris borealis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Pino carrasco',
  s.primary_habitat = 'Laderas secas y soleadas sobre calizas y margas, en clima mediterráneo cálido',
  s.description = 'Pino de copa clara e irregular y follaje de un verde pálido, el más resistente a la sequía y a los suelos pobres de los pinos ibéricos. Sus piñas, alargadas y asimétricas, quedan colgadas años en la rama y liberan las semillas tras los incendios, lo que le permite recolonizar rápido.',
  s.identification_tips = 'Copa irregular y poco densa, de verde claro
Piñas asimétricas y persistentes, apuntando hacia atrás
Corteza clara y agrietada, rojiza en las ramas jóvenes',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Pino_secolare_-_Castelleone_di_Suasa.JPG?width=1280',
  s.image_attribution = 'Accurimbono (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Pinus halepensis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Jabalí',
  s.primary_habitat = 'Bosque, matorral denso y cultivos; necesita cobertura y puntos de agua',
  s.description = 'Ungulado robusto y adaptable, con el cuerpo cubierto de cerdas ásperas y una cabeza en cuña rematada por un hocico potente con el que remueve el suelo. Los rayones —las crías— nacen con líneas claras a lo largo del lomo. Es omnívoro y ha ampliado mucho su área en las últimas décadas.',
  s.identification_tips = 'Hozaduras: zonas de suelo removido como si lo hubieran arado
Huellas hendidas grandes con las pezuñas laterales marcadas
Barros y árboles con el tronco embarrado a media altura',
  s.seasonality = 'Todo el año (actividad sobre todo nocturna)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Eberswalde_Zoo_12-2017_img2.jpg?width=1280',
  s.image_attribution = 'A.Savin (FAL) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Sus scrofa';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Romero',
  s.primary_habitat = 'Matorral seco y soleado sobre suelos calizos y pedregosos',
  s.description = 'Arbusto aromático de hojas estrechas como agujas, verde oscuro por el haz y blanquecinas por el envés, con los bordes enrollados hacia abajo. Florece casi todo el año en azul pálido, y en pleno invierno es una de las pocas fuentes de néctar del matorral.',
  s.identification_tips = 'Hojas como agujas, blancas por debajo
Olor inconfundible al frotar entre los dedos
Flores azul claro repartidas por las ramas casi todo el año',
  s.seasonality = 'Todo el año, con máximo de floración en invierno y primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Rosemary_in_bloom.JPG?width=1280',
  s.image_attribution = 'Margalob (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Rosmarinus officinalis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Zorro',
  s.primary_habitat = 'Prácticamente cualquier ambiente: bosque, matorral, cultivos y periferias urbanas',
  s.description = 'El carnívoro silvestre más adaptable y extendido: vive desde la alta montaña hasta el borde de las ciudades. Es omnívoro y oportunista, lo que explica su éxito. Se reconoce por la cola larga y espesa —la «hopa»— rematada casi siempre en blanco.',
  s.identification_tips = 'Cola muy espesa con la punta blanca
Huella alargada con las cuatro almohadillas alineadas
Excrementos retorcidos y con pelos, sobre piedras y caminos',
  s.seasonality = 'Todo el año (actividad sobre todo nocturna)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Vulpes_vulpes_2.jpg?width=1280',
  s.image_attribution = 'Juan Lacruz (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Vulpes vulpes';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Coscoja',
  s.primary_habitat = 'Matorral esclerófilo y sabinar',
  s.description = 'Arbusto esclerófilo de hoja perenne y espinosa, integrante del matorral mediterráneo denso y de las orlas del sabinar.',
  s.identification_tips = 'Hojas coriáceas con margen espinoso
Bellota con cúpula de escamas punzantes
Porte arbustivo denso',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Quercus_coccifera_1.JPG?width=1280',
  s.image_attribution = 'User:Xemenendura (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Quercus coccifera';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Lentisco',
  s.primary_habitat = 'Matorral mediterráneo litoral',
  s.description = 'Arbusto perennifolio de hojas compuestas sin foliolo terminal y con el raquis alado, un detalle que lo separa de la cornicabra. Al frotarlo huele intensamente a resina. Sus frutos, en racimo, pasan de rojo a negro y son alimento clave para aves en otoño.',
  s.identification_tips = 'Hoja compuesta con número par de foliolos, sin uno terminal
Raquis de la hoja con dos alas laterales
Olor fuerte a resina al frotar las hojas',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Pistacia_lentiscus.jpg?width=1280',
  s.image_attribution = 'Lumbar~commonswiki (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Pistacia lentiscus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Sabina negral',
  s.primary_habitat = 'Roquedos, arenales, acantilados y crestas ventosas sobre suelos pobres',
  s.description = 'Sabina de hojas diminutas en forma de escama, pegadas a la ramilla, que dan a las ramas un aspecto de cordón redondeado. Aguanta viento, sequía y salinidad como pocas plantas leñosas. Sus gálbulos —los falsos frutos— maduran de verde a un rojo pardusco en dos años.',
  s.identification_tips = 'Hojas en escama pegadas a la rama, no punzantes
Ramillas cilíndricas, como cordones
Gálbulos redondos que pasan de verde a pardo rojizo',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Juniperus_phoenicea1.jpg?width=1280',
  s.image_attribution = 'autor no indicado (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Juniperus phoenicea';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Romerina',
  s.primary_habitat = 'Tomillares y matorral seco sobre calizas y margas',
  s.description = 'Jara pequeña de hojas muy estrechas y enrolladas por los bordes, verdes arriba y blancas por debajo, que a distancia recuerdan al romero. Se distingue enseguida al florecer: da grupos de flores blancas de cinco pétalos, mucho mayores que las del romero.',
  s.identification_tips = 'Hojas estrechas enrolladas, blancas por el envés
Flores blancas de cinco pétalos, varias juntas
Sin el olor a romero, aunque se le parezca de lejos',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Cistus_clusii_(habitus).jpg?width=1280',
  s.image_attribution = 'Hans Hillewaert (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Cistus clusii';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Albaida',
  s.primary_habitat = 'Matorral seco y soleado sobre margas y suelos pobres',
  s.description = 'Mata de aspecto blanquecino por la fina pelusa que cubre hojas y tallos, un recurso frente al sol y la sequía. En primavera se llena de espigas de flores amarillas que atraen a muchos insectos. Es una de las leguminosas que primero coloniza laderas degradadas y taludes.',
  s.identification_tips = 'Aspecto grisáceo y aterciopelado al tacto
Flores amarillas pequeñas en espigas apretadas
Hojas divididas en tres, la del centro más larga',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Anthyllis_cytisoides.JPG?width=1280',
  s.image_attribution = 'Ximenex (CC BY-SA 2.1 es) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Anthyllis cytisoides';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Lastón',
  s.primary_habitat = 'Pastizales, claros de matorral y ribazos sobre suelos calizos',
  s.description = 'Gramínea perenne y rizomatosa que forma céspedes extensos en los claros del matorral mediterráneo. Sus hojas son cortas, rígidas y de punta roma. Es de las plantas que más rápido rebrota tras un incendio, gracias a sus rizomas subterráneos.',
  s.identification_tips = 'Céspedes extensos y bajos, no matas aisladas
Hojas cortas y rígidas, de punta redondeada
Espiguillas alineadas a un lado de un eje rígido',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Brachypodium_retusum_espiga_seca.jpg?width=1280',
  s.image_attribution = 'Pere prlpz (CC BY-SA 2.5) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Brachypodium retusum';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Mata pulguera',
  s.primary_habitat = 'Roquedos, muros, taludes y grietas soleadas',
  s.description = 'Mata pequeña y leñosa en la base que crece agarrada a la roca y a los muros. Sus hojas son estrechas y blanquecinas por el envés. Las cabezuelas, solitarias sobre tallos largos y desnudos, están rodeadas de brácteas secas y pardas que persisten mucho tiempo.',
  s.identification_tips = 'Cabezuelas pardas y secas al final de tallos largos y pelados
Hojas estrechas, verdes arriba y blancas por debajo
Casi siempre sobre roca, muro o talud',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Phagnalon_saxatile.JPG?width=1280',
  s.image_attribution = 'Xemenendura (CC BY 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Phagnalon saxatile';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Esparraguera de gato',
  s.primary_habitat = 'Matorrales arborescentes de Juniperus spp.',
  s.description = 'Esparraguera muy espinosa y densa que se enreda entre el matorral y el sabinar litoral, con cladodios rígidos y punzantes.',
  s.identification_tips = 'Cladodios rígidos y punzantes
Se enreda en el matorral
Frutos negros en otoño',
  s.seasonality = 'Otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Asparagus_stipularis_(detail).jpg?width=1280',
  s.image_attribution = 'Hans Hillewaert (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Asparagus horridus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cardo amarillo de roca',
  s.primary_habitat = 'Roquedos y fisuras calcáreas costeras',
  s.description = 'Compuesta rupícola que crece colgando de las fisuras de los cantiles calizos, con hojas divididas y algo carnosas y capítulos amarillos rodeados de brácteas con apéndices espinosos. Es un endemismo del sureste ibérico ligado a paredes de roca costeras y de interior.',
  s.identification_tips = 'Capítulos amarillos con brácteas de apéndice espinoso
Hojas divididas y algo carnosas, en roseta colgante
Crece encajada en la grieta, no en el suelo',
  s.seasonality = 'Floración primaveral',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Centaurea_saxicola674.jpg?width=1280',
  s.image_attribution = 'Nanosanchez (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Centaurea saxicola';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Oroval',
  s.primary_habitat = 'Matorral cálido, roquedos y ramblas de clima muy seco',
  s.description = 'Arbusto de la familia del tomate y la belladona, con hojas ovaladas algo carnosas y flores verdosas discretas. Los frutos son bayas rojas y brillantes envueltas en el cáliz. Es una especie de raíz norteafricana que en la península solo vive en los rincones más cálidos del sureste.',
  s.identification_tips = 'Bayas rojas pequeñas asomando del cáliz
Hojas ovales, algo carnosas y de verde apagado
Flores verde amarillentas, poco vistosas',
  s.seasonality = 'Primavera y otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Withania_frutescens0176.jpg?width=1280',
  s.image_attribution = 'Nanosanchez (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Withania frutescens';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Jarilla de Almería',
  s.primary_habitat = 'Tomillares y matorral abierto sobre suelos secos y pedregosos',
  s.description = 'Jarilla enana de hojas pequeñas y blanquecinas, cubiertas de pelos que reflejan la luz y reducen la pérdida de agua. En primavera se cubre de flores blancas con el centro amarillo, cuyos pétalos duran apenas una mañana. Sus raíces se asocian con hongos comestibles del desierto.',
  s.identification_tips = 'Mata baja y grisácea, de hojas muy pequeñas
Flores blancas con el centro amarillo, efímeras
Pétalos arrugados, como de papel de seda',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Helianthemum_almeriense_flor.jpg?width=1280',
  s.image_attribution = 'Retama (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Helianthemum almeriense';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Baladre',
  s.primary_habitat = 'Cauces de rambla y ramblizos con humedad subterránea y crecidas',
  s.description = 'Arbusto de hojas coriáceas, alargadas y opuestas, que forma masas densas en el lecho de las ramblas y aguanta las riadas gracias a su raigambre. Florece en rosa intenso durante buena parte del verano. Toda la planta es muy tóxica, savia incluida.',
  s.identification_tips = 'Hojas duras y lanceoladas con el nervio central marcado
Flores rosas grandes en el extremo de las ramas
Frutos en vaina larga que se abre soltando semillas con vilano',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Nerium_oleander_flowers_leaves.jpg?width=1280',
  s.image_attribution = 'Alvesgaspar (CC BY 2.5) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Nerium oleander';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Eragrostis',
  s.primary_habitat = 'Pastizales de la subestepa de gramíneas',
  s.description = 'Gramínea de panícula muy abierta y ligera, con espiguillas diminutas sostenidas por ramas finísimas que tiemblan con el viento. Es una planta de estirpe saharo-arábiga que en Europa solo aparece en los enclaves más áridos del sureste ibérico.',
  s.identification_tips = 'Panícula muy abierta y difusa, casi transparente
Espiguillas diminutas colgando de ramas capilares
Mata pequeña, de menos de medio metro',
  s.seasonality = 'Verano',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/591856810/original.jpg',
  s.image_attribution = 'Alejandro Rodríguez Zapata (CC BY 4.0) · GBIF/iNaturalist',
  s.rarity_score = 4
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Eragrostis papposa';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Acebuche',
  s.primary_habitat = 'Matorral alto, laderas secas y barrancos del piso más cálido',
  s.description = 'El acebuche es el olivo silvestre: mismo árbol, sin siglos de selección. Tiene las hojas más pequeñas y duras, las ramas jóvenes a menudo espinosas y aceitunas diminutas. Forma matorrales altos y es el árbol característico de las laderas cálidas mediterráneas.',
  s.identification_tips = 'Hojas pequeñas, verdes arriba y plateadas por debajo
Ramillas jóvenes rígidas y a veces espinosas
Aceitunas muy pequeñas, de poco más de un centímetro',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Ullastre_vell.JPG?width=1280',
  s.image_attribution = 'Antoni Salvà (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Olea europaea subsp. europaea';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Orejilla de roca',
  s.primary_habitat = 'Roquedos y fisuras calcáreas costeras',
  s.description = 'Planta rupícola de hojas redondeadas, dentadas y algo carnosas, que forma matas colgantes en las paredes calizas. Sus flores, blanquecinas con toques amarillos, se agrupan en racimos erguidos. Es un endemismo iberoafricano restringido al sureste peninsular y al norte de África.',
  s.identification_tips = 'Hojas redondas y dentadas, casi como monedas
Racimos de flores blanquecinas erguidos sobre el follaje
Forma matas colgantes en pared caliza',
  s.seasonality = 'Floración primaveral',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Lafuentea_rotundifolia80857.jpg?width=1280',
  s.image_attribution = 'Nanosanchez (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Lafuentea rotundifolia';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Canadillo',
  s.primary_habitat = 'Roquedos, matorral seco y pie de acantilado en clima cálido',
  s.description = 'Arbusto de aspecto extraño: un manojo de tallos verdes, articulados y colgantes, casi sin hojas, que se quiebran con facilidad por los nudos. No es una planta con flores, sino un pariente lejano de las coníferas; sus semillas van envueltas en una cubierta roja y carnosa.',
  s.identification_tips = 'Tallos verdes articulados que se rompen por los nudos
Sin hojas visibles, solo escamas en cada nudo
Frutos rojos carnosos con una semilla dentro',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Ephedra_fragilis_3.JPG?width=1280',
  s.image_attribution = 'User:falconaumanni (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Ephedra fragilis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Ajo de flor oscura',
  s.primary_habitat = 'Espartales, pastizales secos y claros de matorral sobre suelos margosos',
  s.description = 'Ajo silvestre de flores de un púrpura tan oscuro que parece negro, agrupadas en una umbela apretada al final de un tallo largo y desnudo. Es un endemismo del sureste ibérico, de área muy reducida, que pasa el verano bajo tierra en forma de bulbo.',
  s.identification_tips = 'Flores de púrpura casi negro, muy oscuras
Umbela compacta sobre un tallo largo y liso
Huele a ajo al estrujar las hojas o el bulbo',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Allium_melananthum02.jpg?width=1280',
  s.image_attribution = 'Nanosanchez (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 5
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Allium melananthum';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Aulaga',
  s.primary_habitat = 'Matorral árido, ramblas y bordes de camino en clima muy seco',
  s.description = 'Mata en forma de bola formada por ramas verdes, rígidas y terminadas en pincho, casi sin hojas: la fotosíntesis la hacen los propios tallos. Al romper una rama suelta un látex blanco. Sus flores amarillas recuerdan a las del diente de león en miniatura.',
  s.identification_tips = 'Matorral redondo de ramas verdes y espinosas, casi sin hojas
Suelta látex blanco al partir un tallo
Flores amarillas tipo diente de león',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Launaea_arborescens_-_Oasis_Park_botanical_garden_-_Fuerteventura_-_02.jpg?width=1280',
  s.image_attribution = 'Norbert Nagel, Mörfelden-Walldorf, Germany (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Launaea arborescens';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Gato montés',
  s.primary_habitat = 'Bosque, matorral denso y roquedos con buena población de conejos y roedores',
  s.description = 'Gato salvaje europeo, más robusto que un gato doméstico atigrado, con la cola gruesa, roma en la punta y anillada de negro. Es solitario, esquivo y sobre todo nocturno. Su mayor amenaza es la hibridación con gatos asilvestrados, que diluye la población silvestre.',
  s.identification_tips = 'Cola gruesa, de punta roma y con anillos negros nítidos
Raya negra continua a lo largo del lomo
Aspecto más recio y patilargo que un gato casero',
  s.seasonality = 'Todo el año (actividad crepuscular y nocturna)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Felis_silvestris_Kocka_divok%C3%A1_zoo_cropped.jpg?width=1280',
  s.image_attribution = 'Felis_silvestris_Kočka_divoká_ZOO_Děčín.jpg: Alena Houšková derivat… (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Felis silvestris';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Gineta',
  s.primary_habitat = 'Bosque, matorral denso, roquedos y sotos con cobertura y refugios',
  s.description = 'Carnívoro esbelto de pelaje gris con manchas negras y una cola larguísima anillada en blanco y negro, tan larga como el resto del cuerpo. Es un trepador excelente y estrictamente nocturno. Deja sus excrementos en letrinas fijas sobre piedras y troncos, que usa durante años.',
  s.identification_tips = 'Cola muy larga con anillos blancos y negros bien marcados
Pelaje gris con hileras de manchas negras
Letrinas repetidas en el mismo punto elevado',
  s.seasonality = 'Todo el año (actividad nocturna)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Genetta_genetta_felina_(Wroclaw_zoo).JPG?width=1280',
  s.image_attribution = 'Guérin Nicolas (messages) (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Genetta genetta';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Garduña',
  s.primary_habitat = 'Roquedos, bosques, ruinas y construcciones rurales',
  s.description = 'Mustélido nocturno de cuerpo alargado y cola espesa, con un babero blanco en la garganta que suele bifurcarse hacia las patas delanteras. Trepa con soltura y aprovecha desde roquedos hasta desvanes. Es omnívora: come frutos, insectos, huevos y pequeños vertebrados.',
  s.identification_tips = 'Babero blanco en la garganta, a menudo dividido en dos
Excrementos retorcidos y con pelos o semillas, sobre piedras
Rastro nocturno; muy rara vez se ve de día',
  s.seasonality = 'Todo el año (actividad nocturna)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Steinmarder_01.jpg?width=1280',
  s.image_attribution = 'Zefram (CC BY 2.0 de) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Martes foina';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Tejón',
  s.primary_habitat = 'Bosque, matorral y ribazos con suelo blando para excavar tejoneras',
  s.description = 'Mustélido corpulento y de patas cortas, con la cabeza blanca cruzada por dos bandas negras que pasan por los ojos. Excava madrigueras complejas —las tejoneras— que una misma familia amplía y usa durante generaciones. Es omnívoro y muy aficionado a las lombrices.',
  s.identification_tips = 'Cabeza blanca con dos franjas negras longitudinales
Tejoneras: varias bocas grandes con montones de tierra
Letrinas en hoyos poco profundos cerca de la madriguera',
  s.seasonality = 'Todo el año (actividad nocturna)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Badger-badger.jpg?width=1280',
  s.image_attribution = 'BadgerHero (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Meles meles';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Sapo corredor',
  s.primary_habitat = 'Ramblas y zonas húmedas estacionales',
  s.description = 'Sapo de patas cortas que corre en vez de saltar, con una línea amarilla nítida a lo largo del centro del lomo. Se reproduce en charcas efímeras que se llenan con las lluvias, y los machos forman coros de un canto vibrante y estridente que se oye a kilómetros.',
  s.identification_tips = 'Raya amarilla continua por el centro del lomo
Corre a cuatro patas en vez de saltar
Canto nocturno vibrante y muy sonoro tras las lluvias',
  s.seasonality = 'Otoño e invierno lluviosos',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Epidalea_calamita_02_by-dpc.jpg?width=1280',
  s.image_attribution = 'David Perez (CC BY 3.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Epidalea calamita';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Azufaifo',
  s.primary_habitat = 'Matorrales arborescentes de Ziziphus',
  s.description = 'Arbusto espinoso que forma cúpulas densas de varios metros, un microhábitat en sí mismo: bajo su copa se refugian aves, reptiles y mamíferos, y la humedad y el suelo son distintos que fuera. Sus ramas zigzaguean con dos espinas en cada nudo, una recta y otra ganchuda.',
  s.identification_tips = 'Ramas en zigzag con dos espinas por nudo, una recta y otra curva
Porte en cúpula o almohadón, muy denso
Frutos redondos que pasan de verde a pardo amarillento',
  s.seasonality = 'Primavera a otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Ziziphus_lotus_20200928_191923.jpg?width=1280',
  s.image_attribution = 'Nanosanchez (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Ziziphus lotus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Zamarrilla lanuda',
  s.primary_habitat = 'Matorral y cerros sobre suelos calizos y margosos secos',
  s.description = 'Mata cubierta por una lana blanca y espesa que la hace destacar en el matorral. Sus flores, rosadas o purpúreas, se agrupan en cabezuelas terminales y carecen de labio superior, con los estambres al descubierto. Es un endemismo del sureste ibérico.',
  s.identification_tips = 'Toda la planta cubierta de lana blanca y espesa
Flores sin labio superior, con los estambres asomando
Cabezuelas apretadas en el extremo de las ramas',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Teucrium_lanigerum_kz01.jpg?width=1280',
  s.image_attribution = 'Krzysztof Ziarnek, Kenraiz (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Teucrium lanigerum';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Teucrio de Freyn',
  s.primary_habitat = 'Roquedos, pedregales y ramblas sobre suelos calizos secos',
  s.description = 'Teucrio endémico del sureste ibérico, de porte bajo y aspecto blanquecino, con hojas pequeñas y enrolladas y flores rosadas o blanquecinas sin labio superior. Como todas las labiadas, tiene el tallo de sección cuadrada y desprende aroma al frotarlo.',
  s.identification_tips = 'Flores sin labio superior, con los estambres asomando
Tallo de sección cuadrada, típico de labiada
Hojas pequeñas y enrolladas, de aspecto grisáceo',
  s.seasonality = 'Primavera-verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Teucrium_freynii_kz01.jpg?width=1280',
  s.image_attribution = 'Krzysztof Ziarnek, Kenraiz (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Teucrium freynii';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cuerno de cabra',
  s.primary_habitat = 'Matorral árido y claros de vegetación',
  s.description = 'Crucífera anual y menuda, de tallos tendidos y hojas pequeñas, con flores blanquecinas poco vistosas. Lo característico son los frutos: pequeñas silículas rematadas por dos cuernecillos divergentes que le dan el nombre.',
  s.identification_tips = 'Frutos con dos cuernecillos divergentes en la punta
Planta anual diminuta y tendida por el suelo
Flores blanquecinas muy pequeñas, casi inapreciables',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Notoceras_bicorne_kz08.jpg?width=1280',
  s.image_attribution = 'Krzysztof Ziarnek, Kenraiz (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Notoceras bicorne';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Bolina',
  s.primary_habitat = 'Matorral y laderas soleadas de montaña media, sobre suelos calizos',
  s.description = 'Retama de ramas finas, sedosas y de un verde grisáceo, sin espinas, que en floración se cubre de flores amarillas fragantes. Sus hojas son diminutas y caen pronto: la fotosíntesis la hacen los tallos.',
  s.identification_tips = 'Ramas finas y flexibles, sin espinas
Aspecto grisáceo por los pelos sedosos de las ramillas
Floración amarilla abundante y perfumada',
  s.seasonality = 'Primavera y principio de verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Genista_cinerea26de_maig_2007_019.jpg?width=1280',
  s.image_attribution = 'Victor M. Vicente Selvas (Public domain) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Genista cinerea';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Mimbre',
  s.primary_habitat = 'Riberas, fuentes y cauces con humedad permanente',
  s.description = 'Sauce mediterráneo de porte arbustivo o de arbolillo, con hojas alargadas verdes por encima y algo blanquecinas por debajo. Florece antes de echar la hoja, en amentos peludos. Forma parte de las orlas de vegetación que fijan las márgenes de los cauces.',
  s.identification_tips = 'Amentos peludos en las ramas desnudas, antes que las hojas
Hojas alargadas, más pálidas por el envés
Siempre junto a agua o en suelos con humedad permanente',
  s.seasonality = 'Primavera (floración) y todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Salix_pedicellata_Habitus_2009-9-27_CampoCalatrava.jpg?width=1280',
  s.image_attribution = 'javier martin (Public domain) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Salix pedicellata';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Alagua',
  s.primary_habitat = 'Crestas, pedregales y matorral almohadillado de montaña',
  s.description = 'Genista espinosa que forma cojines densos y bajos, adaptados al viento y al frío de las cumbres. Sus flores amarillas salen sobre pedúnculos largos, un rasgo que le da el nombre. Es un endemismo del sureste ibérico.',
  s.identification_tips = 'Cojín compacto y espinoso, muy bajo
Flores amarillas sobre pedúnculos largos y finos
En crestas y pedregales de montaña, expuesta al viento',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Genista-longipes-2019.jpg?width=1280',
  s.image_attribution = 'MottaW (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Genista longipes';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'bulbocodio de primavera',
  s.primary_habitat = 'Pastizales y claros de matorral en montaña, sobre suelos pedregosos',
  s.description = 'Bulbosa que florece muy pronto, a veces con la nieve aún cerca, sacando del suelo flores rosadas o lilas en forma de copa junto a tres hojas estrechas. El resto del año permanece bajo tierra. Toda la planta es tóxica, como el resto del género.',
  s.identification_tips = 'Flores rosa lila en copa, casi a ras de suelo
Tres hojas estrechas acompañando a la flor
Florece muy temprano, antes que la mayoría del pastizal',
  s.seasonality = 'Final de invierno y principio de primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Colchicum_triphyllum_001_GotBot_2016.jpg?width=1280',
  s.image_attribution = 'Averater (CC BY 4.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Colchicum triphyllum';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Rabo de gato',
  s.primary_habitat = 'Tomillares y matorral raso sobre suelos calizos y margosos',
  s.description = 'Rabogato de tallos erguidos cubiertos de pelusa blanca, con flores de color blanco crema dispuestas en verticilos separados a lo largo de la espiga. Es un endemismo del sureste ibérico y una de las plantas usadas tradicionalmente en infusión.',
  s.identification_tips = 'Flores blanco crema en anillos separados por el tallo
Toda la planta blanquecina y algo lanuda
Brácteas anchas y punzantes bajo cada grupo de flores',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Alb-S.leucantha-13.jpg?width=1280',
  s.image_attribution = 'Philmarin (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Sideritis leucantha';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Ononis ornithopodioides',
  s.primary_habitat = 'Pastizales anuales y claros de matorral sobre suelos secos',
  s.description = 'Pequeña leguminosa anual de tallos finos y glandulosos, con hojas de tres foliolos y flores amarillas diminutas. Sus legumbres, curvadas y dispuestas en grupo, recuerdan a los dedos de una pata de pájaro, lo que le da el nombre científico.',
  s.identification_tips = 'Legumbres curvas agrupadas, como una pata de ave
Flores amarillas muy pequeñas
Tallos pegajosos al tacto, con pelos glandulosos',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Ononis_ornithopodioides_kz1.jpg?width=1280',
  s.image_attribution = 'Krzysztof Ziarnek, Kenraiz (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Ononis ornithopodioides';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Jara blanca',
  s.primary_habitat = 'Matorral y jarales sobre suelos secos y soleados de montaña media',
  s.description = 'Arbusto de hojas anchas, ovaladas y cubiertas de una pelusa plateada que le da un aspecto casi blanco. En primavera se llena de flores amarillas de cinco pétalos con una mancha oscura en la base. Es un endemismo del sur y sureste peninsular.',
  s.identification_tips = 'Hojas anchas y plateadas, no estrechas como las jaras
Flores amarillas con una manchita oscura en la base del pétalo
Porte erguido, más alto que las jarillas comunes',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Halimium_commutatum1.jpg?width=1280',
  s.image_attribution = 'Ximenex (CC BY-SA 2.1 es) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Cistus atriplicifolius';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Rascavieja',
  s.primary_habitat = 'Matorral seco y laderas soleadas sobre suelos pedregosos',
  s.description = 'Leguminosa arbustiva y pegajosa, con hojas de tres foliolos y racimos densos y erguidos de flores de un amarillo intenso. Es un endemismo del sur peninsular y del norte de África, y una de las plantas más vistosas del matorral en plena floración.',
  s.identification_tips = 'Racimos densos y erguidos de flores amarillo vivo
Toda la planta pegajosa por los pelos glandulosos
Hojas de tres foliolos dentados',
  s.seasonality = 'Primavera',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/184117054/original.jpeg',
  s.image_attribution = 'Santiago Martín-Bravo (CC BY 4.0) · iNaturalist/GBIF',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Ononis speciosa';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cosentinia vellea',
  s.primary_habitat = 'Grietas de roquedos secos y soleados, paredones y pedregales',
  s.description = 'Helecho pequeño cubierto por completo de una densa lana parda que le da aspecto afieltrado y le permite sobrevivir en roca seca y al sol. En sequía se enrolla sobre sí mismo hasta parecer muerto, y se despliega en cuanto llueve.',
  s.identification_tips = 'Frondes cubiertas de lana parda, aspecto afieltrado
Se enrolla en verano y revive con la lluvia
En roca seca y soleada, no en umbrías húmedas',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Cosentinia_vellea_kz02.jpg?width=1280',
  s.image_attribution = 'Krzysztof Ziarnek, Kenraiz (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Cosentinia vellea';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Clujía',
  s.primary_habitat = 'Roquedos, laderas pedregosas y matorral seco sobre calizas',
  s.description = 'Umbelífera leñosa, algo insólita en una familia de hierbas, con hojas estrechas, coriáceas y de un verde azulado. Sus umbelas de flores amarillas se abren en pleno verano. Desprende un olor resinoso característico al romper una rama.',
  s.identification_tips = 'Umbelífera con base leñosa, no herbácea
Hojas estrechas, duras y de verde azulado
Umbelas amarillas en pleno verano',
  s.seasonality = 'Verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/B._gibraltarium-1.JPG?width=1280',
  s.image_attribution = 'Philmarin (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Bupleurum gibraltarium';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Botón azul',
  s.primary_habitat = 'Fisuras y repisas de roquedos calizos de montaña',
  s.description = 'Planta rupícola que forma matas compactas en las grietas de la roca, con cabezuelas globosas de flores azules formadas por muchas florecillas estrechas. Es un endemismo ibérico ligado a los cantiles calizos, donde escapa de la competencia y del ganado.',
  s.identification_tips = 'Cabezuelas azules redondas, como pompones
Crece encajada en grietas de pared rocosa
Hojas estrechas agrupadas en la base',
  s.seasonality = 'Verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Jasione_foliosa_var._Minuta_GotBot_2015_001.jpg?width=1280',
  s.image_attribution = 'Averater (CC BY 4.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Jasione foliosa';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Encina',
  s.primary_habitat = 'Bosques y matorrales mediterráneos sobre suelos variados, en clima no extremo',
  s.description = 'Árbol perennifolio de copa densa y redondeada, con hojas coriáceas verde oscuro por el haz y blanquecinas y afieltradas por el envés. Las hojas jóvenes y las de las ramas bajas tienen el borde espinoso, un mecanismo de defensa frente a los herbívoros.',
  s.identification_tips = 'Envés de la hoja blanquecino y afieltrado
Hojas de las ramas bajas con borde espinoso
Copa densa y oscura, muy cerrada a la luz',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Carrasca_de_la_Raboseras.JPG?width=1280',
  s.image_attribution = 'Picamaderos (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Quercus ilex';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Retama de escobas',
  s.primary_habitat = 'Claros de bosque, laderas y taludes sobre suelos silíceos o descarbonatados',
  s.description = 'Arbusto de ramas verdes, angulosas y flexibles, casi sin hojas, que en primavera se cubre de flores amarillas grandes. Sus legumbres, negras al madurar, se abren con un chasquido audible en los días secos y lanzan las semillas a varios metros.',
  s.identification_tips = 'Ramas verdes de sección angulosa, flexibles
Legumbres negras y peludas en los bordes
Las vainas estallan con un chasquido en verano',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Cytisus_scoparius_by_Danny_S._-_001.JPG?width=1280',
  s.image_attribution = 'Danny S. (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Cytisus scoparius';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cisca',
  s.primary_habitat = 'Arenales, ramblas y suelos húmedos con capa freática cercana',
  s.description = 'Gramínea perenne que se extiende por rizomas y levanta espigas cilíndricas de un blanco plateado y sedoso, muy vistosas a contraluz. Coloniza arenales y bordes de rambla, donde ayuda a fijar el sustrato suelto.',
  s.identification_tips = 'Espigas cilíndricas de un blanco sedoso brillante
Se extiende en manchas por rizomas subterráneos
Hojas rígidas con el nervio central pálido y marcado',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Impera_cylind_071122-1339_stgd.jpg?width=1280',
  s.image_attribution = 'W.A. Djatmiko (Wie146) (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Imperata cylindrica';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Saxifraga almeriensis',
  s.primary_habitat = 'Grietas y repisas umbrías de roquedos calizos de montaña',
  s.description = 'Saxífraga rupícola que forma pequeñas rosetas de hojas carnosas y algo divididas encajadas en la roca, con tallos finos rematados en flores blancas de cinco pétalos. Es un endemismo del sureste ibérico restringido a unas pocas sierras.',
  s.identification_tips = 'Rosetas pequeñas y carnosas metidas en la fisura
Flores blancas de cinco pétalos sobre tallos finos
Casi siempre en paredes umbrías y frescas',
  s.seasonality = 'Primavera',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/111644731/original.jpeg',
  s.image_attribution = 'faluke (CC BY-NC 4.0) · GBIF/iNaturalist',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Saxifraga camposii subsp. leptophylla';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'erguen',
  s.primary_habitat = 'Matorral y laderas soleadas sobre suelos secos y pedregosos',
  s.description = 'Arbusto espinoso y muy ramificado que en primavera se cubre por completo de flores amarillas. Sus ramas terminan en espinas fuertes y sus legumbres van cubiertas de pelos sedosos. Forma masas impenetrables que dan refugio a aves de matorral.',
  s.identification_tips = 'Ramas rematadas en espinas rígidas y punzantes
Floración amarilla masiva que cubre toda la mata
Legumbres cubiertas de pelos blancos y sedosos',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Calycotome_villosa1.jpg?width=1280',
  s.image_attribution = 'Ximenex (CC BY-SA 2.1 es) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Cytisus lanigerus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'campanilla espigada',
  s.primary_habitat = 'Pastizales secos, ribazos y claros de matorral sobre suelos margosos',
  s.description = 'Correhuela de porte bajo y no trepadora, con hojas estrechas cubiertas de pelos sedosos que las hacen brillar con una pátina plateada. Sus flores son embudos rosados o blanquecinos que se abren por la mañana y se cierran con el calor.',
  s.identification_tips = 'Hojas estrechas con brillo sedoso plateado
No trepa: forma matitas bajas y extendidas
Flores en embudo, rosadas o casi blancas',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Convolvulus_lineatus_2.jpg?width=1280',
  s.image_attribution = 'Ghislain118 https://www.fleurs-des-montagnes.net (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Convolvulus lineatus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'campanillas de cantil',
  s.primary_habitat = 'Fisuras de roquedos, taludes y pedregales de montaña',
  s.description = 'Campánula de tallos finos y flexibles con flores azul violeta en forma de campana colgante. Crece en grietas de roca y en pedregales, donde sus raíces alcanzan la humedad que retiene la piedra. Las hojas de la base tienen forma redondeada y las del tallo son estrechas.',
  s.identification_tips = 'Flores azuladas en campana, colgando del tallo
Hojas basales redondeadas, muy distintas de las del tallo
En grietas y repisas de roca, a menudo colgando',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Campanula_hispanica_1.jpg?width=1280',
  s.image_attribution = 'Ghislain118 http://www.fleurs-des-montagnes.net (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Campanula rotundifolia subsp. hispanica';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Pampajarito',
  s.primary_habitat = 'Litosuelos, costras yesosas y repisas rocosas secas',
  s.description = 'Crasulácea diminuta de hojas cilíndricas y carnosas apretadas contra el tallo, que forma almohadillas sobre suelos yesosos y roca desnuda. En verano toma tonos rojizos y saca flores blancas estrelladas.',
  s.identification_tips = 'Hojitas carnosas y cilíndricas apretadas al tallo
Vira a rojizo con la sequía y el sol
Flores blancas estrelladas de cinco pétalos',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Sedum_gypsicola_kz01.jpg?width=1280',
  s.image_attribution = 'Krzysztof Ziarnek, Kenraiz (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Sedum gypsicola';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Tojo',
  s.primary_habitat = 'Matorral sobre suelos ácidos y frescos, claros y bordes de camino',
  s.description = 'Arbusto totalmente cubierto de espinas rígidas —hojas y ramillas transformadas— que en invierno y primavera se llena de flores amarillas con olor a coco. Forma masas impenetrables que sirven de refugio a pájaros de matorral.',
  s.identification_tips = 'Espinas rígidas por toda la planta, muy punzantes
Flores amarillas con aroma dulce, a coco
Florece en pleno invierno, adelantándose al resto',
  s.seasonality = 'Invierno y primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Ulex_europaeus.jpg?width=1280',
  s.image_attribution = 'J.F. Gaffard Jeffdelonge at fr.wikipedia (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Ulex europaeus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Madreselva mediterránea',
  s.primary_habitat = 'Roquedos, matorral denso y barrancos cálidos',
  s.description = 'Madreselva de tallos trepadores o apoyantes y hojas opuestas algo carnosas, con flores blanquecinas agrupadas de dos en dos, de donde le viene el nombre. Sus frutos son bayas rojas o negruzcas que consumen las aves.',
  s.identification_tips = 'Flores agrupadas por parejas en la axila de la hoja
Hojas opuestas, a veces soldadas por la base
Tallos que se apoyan y trepan sobre otros arbustos',
  s.seasonality = 'Primavera',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/527297838/original.jpg',
  s.image_attribution = 'Finlay F. K. Thorpe (CC BY-NC 4.0) · GBIF/iNaturalist',
  s.rarity_score = 1
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Lonicera biflora';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Linaria cavanillesii',
  s.primary_habitat = 'Repisas y fisuras de cantiles calizos, generalmente en umbría',
  s.description = 'Linaria rupícola de tallos colgantes y hojas algo carnosas y verticiladas, con flores amarillas provistas de un espolón largo y curvado. Es un endemismo ibérico de área muy reducida, restringido a un puñado de cantiles.',
  s.identification_tips = 'Tallos colgando de la pared rocosa
Flores amarillas con espolón largo por detrás
Hojas dispuestas en anillos alrededor del tallo',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/501474709/original.jpeg',
  s.image_attribution = 'deutschle (CC BY-NC 4.0) · GBIF/iNaturalist',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Linaria cavanillesii';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Trebillos',
  s.primary_habitat = 'Pastizales anuales sobre suelos arenosos y ácidos',
  s.description = 'Trébol anual diminuto, de tallos tendidos y cabezuelas pequeñas y peludas que a menudo salen emparejadas, de donde le viene el nombre. Forma parte de los pastizales efímeros que se secan en cuanto llega el calor.',
  s.identification_tips = 'Cabezuelas pequeñas y peludas, con frecuencia de dos en dos
Planta anual y menuda, tendida por el suelo
Hojas de tres foliolos, típicas de trébol',
  s.seasonality = 'Primavera',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/601798690/original.jpg',
  s.image_attribution = 'Miguel A. Casado (CC BY-NC 4.0) · GBIF/iNaturalist',
  s.rarity_score = 1
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Trifolium gemellum';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Erodium foetidum',
  s.primary_habitat = 'Grietas y repisas de roquedos calizos',
  s.description = 'Geranio rupícola que forma rosetas de hojas recortadas y algo pegajosas, con flores blancas o rosadas veteadas. Como todos los erodios, sus frutos rematan en un pico largo que se enrosca al secarse y va clavando la semilla en las grietas.',
  s.identification_tips = 'Rosetas de hojas recortadas encajadas en la roca
Frutos con pico largo que se enrosca en espiral
Olor desagradable al estrujar las hojas',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/ERODIUM_FOETIDUM_-_S%C3%92BOL_-_IB-784_(Cargola_de_roca).jpg?width=1280',
  s.image_attribution = 'Isidre blanc (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Erodium foetidum';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Tomillo',
  s.primary_habitat = 'Tomillares y pastizales pedregosos de montaña sobre calizas',
  s.description = 'Tomillo endémico del sureste ibérico, de área muy restringida, que forma matitas bajas y grisáceas con espigas de flores rosadas o blanquecinas. Su rareza y la fragmentación de su hábitat lo convierten en una de las plantas más vulnerables del grupo.',
  s.identification_tips = 'Mata baja y grisácea, de hojas muy pequeñas
Espigas cortas de flores rosadas o blancas
Aroma a tomillo, más suave que el de sus parientes comunes',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/411356756/original.jpeg',
  s.image_attribution = 'Maël Taupin (CC BY-NC 4.0) · GBIF/iNaturalist',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Thymus antoninae';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Quejigueta',
  s.primary_habitat = 'Matorral y claros de bosque sobre suelos silíceos o descarbonatados',
  s.description = 'Roble enano que rara vez supera el medio metro y se extiende por rizomas formando manchas. Sus hojas son pequeñas, dentadas y algo coriáceas, y las bellotas, diminutas. Es un arbusto, no un árbol joven: nunca llega a levantar tronco.',
  s.identification_tips = 'Porte muy bajo, casi rastrero, en manchas extensas
Hojas pequeñas y dentadas, algo rígidas
Bellotas muy pequeñas, casi sentadas en la rama',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Quercus_lusitanica_kz01.jpg?width=1280',
  s.image_attribution = 'Krzysztof Ziarnek, Kenraiz (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Quercus lusitanica';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Rabo de gato',
  s.primary_habitat = 'Tomillares y matorral raso sobre suelos calizos secos',
  s.description = 'Rabogato de tallos blanquecinos y flores agrupadas en verticilos separados, característico del sureste ibérico. Es un taxón raro y poco fotografiado: como otras labiadas del grupo, se ha usado tradicionalmente en infusiones.',
  s.identification_tips = 'Tallos y hojas cubiertos de pelusa blanca
Flores en anillos bien separados a lo largo del tallo
Brácteas anchas y algo punzantes bajo cada verticilo',
  s.seasonality = 'Primavera y verano',
  s.image_url = NULL,
  s.image_attribution = NULL,
  s.rarity_score = 1
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Sideritis bourgaeana';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Jara blanca',
  s.primary_habitat = 'Matorral y laderas soleadas sobre suelos calizos secos',
  s.description = 'Jara de hojas blanquecinas, aterciopeladas al tacto y sin peciolo, con flores grandes de color rosa malva y pétalos arrugados como papel de seda que duran solo unas horas. Es una de las plantas que da color al matorral en primavera.',
  s.identification_tips = 'Hojas blanquecinas y aterciopeladas, sentadas en la rama
Flores rosa malva grandes, de pétalos arrugados
Cada flor dura apenas una mañana',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Cistus_albidus_flowers.jpg?width=1280',
  s.image_attribution = 'Júlio Reis (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Cistus albidus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Enebro de la miera',
  s.primary_habitat = 'Matorral, pinares aclarados y laderas pedregosas',
  s.description = 'Enebro de hojas aciculares y punzantes dispuestas de tres en tres, con dos bandas blancas en la cara superior que lo separan a simple vista de la sabina. Sus gálbulos son rojizos al madurar. De su madera se destilaba el aceite de miera.',
  s.identification_tips = 'Hojas punzantes en grupos de tres, no en escama
Dos rayas blancas en la cara superior de cada hoja
Gálbulos rojizos y brillantes al madurar',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Juniperus_oxycedrus_g1.jpg?width=1280',
  s.image_attribution = 'autor no indicado (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Juniperus oxycedrus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Carrasca',
  s.primary_habitat = 'Bosques y matorrales mediterráneos continentales, sobre suelos secos y pobres',
  s.description = 'La encina de interior, más adaptada al frío y a la sequía continental, con hojas más redondeadas y bellotas dulces. A menudo crece en mata por el efecto del ramoneo y las cortas repetidas. Muchos autores la consideran una subespecie de la encina.',
  s.identification_tips = 'Hojas más redondeadas y pequeñas que las de la encina litoral
Bellotas de sabor dulce, no amargas
Frecuente en porte de mata, con varios pies',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Carrasca_de_la_Raboseras.JPG?width=1280',
  s.image_attribution = 'Picamaderos (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Quercus rotundifolia';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Aliaga',
  s.primary_habitat = 'Crestas ventosas, pastizales pedregosos y matorral almohadillado de montaña',
  s.description = 'Leguminosa que forma cojines rígidos y espinosos, una arquitectura que le permite resistir el viento, el frío y el pisoteo en las cumbres. En primavera se cubre de flores azul violeta que contrastan con el verde grisáceo de las espinas.',
  s.identification_tips = 'Cojín compacto y espinoso, duro al tacto
Flores azul violeta sobre un almohadón de espinas
En crestas y collados expuestos al viento',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/ERINACEA_ANTHYLLIS_-_SANT_MAMET.JPG?width=1280',
  s.image_attribution = 'Isidre blanc (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Erinacea anthyllis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Tomillo blanco',
  s.primary_habitat = 'Tomillares y matorral raso sobre suelos calizos secos',
  s.description = 'Tomillo endémico del sureste ibérico, fácil de reconocer por unas brácteas grandes, blancas y membranosas que rodean la inflorescencia y parecen pétalos. Ese conjunto vistoso, más que las flores en sí, es lo que atrae a los insectos.',
  s.identification_tips = 'Brácteas blancas grandes y papiráceas rodeando la flor
Cabezuelas terminales muy vistosas y redondeadas
Aroma intenso a tomillo al frotar',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Thymus_membranaceus_(3).jpg?width=1280',
  s.image_attribution = 'Nanosanchez (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Thymus membranaceus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cornicabra',
  s.primary_habitat = 'Barrancos, umbrías y matorral alto sobre suelos frescos',
  s.description = 'Arbusto o arbolillo de hoja caduca, con hojas compuestas de foliolos grandes y brillantes y un raquis sin alas, lo que lo separa del lentisco. Suele presentar agallas rojizas y curvadas en forma de cuerno, provocadas por pulgones, que le dan el nombre.',
  s.identification_tips = 'Agallas rojizas curvadas como cuernos en las hojas
Pierde la hoja en invierno, al contrario que el lentisco
Hoja compuesta con foliolo terminal y raquis sin alas',
  s.seasonality = 'Primavera a otoño (pierde la hoja en invierno)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Pistachier2.JPG?width=1280',
  s.image_attribution = 'greffer.net (CC BY 2.5) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Pistacia terebinthus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Durillo',
  s.primary_habitat = 'Umbrías, barrancos y sotobosque de encinar y pinar húmedo',
  s.description = 'Arbusto de hojas perennes, opuestas y coriáceas, que florece en pleno invierno con corimbos de flores blancas nacidas de capullos rosados. Sus frutos son bayas de un azul metálico oscuro muy llamativo.',
  s.identification_tips = 'Florece en invierno, en corimbos blancos planos
Capullos rosados antes de abrir
Frutos azul metálico oscuro, casi negros',
  s.seasonality = 'Invierno y primavera (floración)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/T2_37_Viburnum_tinus_par_Pierre-Joseph_Redout%C3%A9.jpeg?width=1280',
  s.image_attribution = 'Pierre-Joseph Redouté (Public domain) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Viburnum tinus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Pino rodeno',
  s.primary_habitat = 'Laderas y sierras sobre suelos silíceos o arenosos, en clima algo húmedo',
  s.description = 'Pino de acículas largas, gruesas y rígidas, las mayores de los pinos ibéricos, y piñas grandes y brillantes con escamas terminadas en pincho. Su corteza, gruesa y profundamente agrietada, muestra tonos rojizos en el fondo de las grietas.',
  s.identification_tips = 'Acículas muy largas y gruesas, que pinchan al apretarlas
Piñas grandes y brillantes con escamas apuntadas
Corteza muy gruesa y agrietada, rojiza por dentro',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Pinus_pinaster_20131229.jpg?width=1280',
  s.image_attribution = 'Luis Fernández García (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Pinus pinaster';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Ardilla roja',
  s.primary_habitat = 'Pinares y bosques con arbolado maduro y producción de piñones o frutos',
  s.description = 'Ardilla arborícola de cola larga y esponjosa y orejas con pinceles de pelo más marcados en invierno. En los pinares mediterráneos su rastro más evidente son las piñas roídas hasta dejar solo el eje, abandonadas en tocones y piedras.',
  s.identification_tips = 'Piñas roídas hasta el raspón, apiladas en un mismo posadero
Cola larga y esponjosa que mantiene erguida al saltar
Pinceles de pelo en las orejas, sobre todo en invierno',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Eichh%C3%B6rnchen_D%C3%BCsseldorf_Hofgarten_edit.jpg?width=1280',
  s.image_attribution = 'Ray eye (CC BY-SA 2.0 de) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Sciurus vulgaris';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Yerbatú',
  s.primary_habitat = 'Herbazales, claros de matorral y bordes de bosque sobre suelos profundos',
  s.description = 'Umbelífera robusta que levanta tallos de más de un metro rematados en grandes umbelas de flores amarillas. Sus hojas están divididas muchas veces en segmentos estrechos y largos. Es planta nutricia de varias mariposas.',
  s.identification_tips = 'Umbelas amarillas amplias sobre tallos altos
Hojas divididas en segmentos muy finos y largos
Cepa gruesa y leñosa en la base',
  s.seasonality = 'Verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Raskovnik33Joe-Laserpitium_siler.JPG?width=1280',
  s.image_attribution = 'Струјајое (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Peucedanum officinale';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Vidriera',
  s.primary_habitat = 'Matorral, pedregales y laderas soleadas sobre suelos calizos',
  s.description = 'Dedalera leñosa en la base, con hojas estrechas, brillantes y de borde entero, muy distinta de las digitales de hoja ancha. Sus flores son tubos colgantes de un naranja rojizo con manchas oscuras en el interior. Toda la planta es tóxica.',
  s.identification_tips = 'Flores en dedal de color naranja rojizo
Hojas estrechas, lustrosas y de borde liso
Base leñosa, no herbácea',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Digitalis_obscura_1.jpg?width=1280',
  s.image_attribution = 'Cillas (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Digitalis obscura';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Apalaín',
  s.primary_habitat = 'Laderas secas, ramblas y matorral sobre suelos margosos y pedregosos',
  s.description = 'Retama de ramas juncales, verdes y erguidas, prácticamente sin hojas, que florece en amarillo a final de verano, cuando casi todo el matorral está en reposo. Es un endemismo del sureste ibérico.',
  s.identification_tips = 'Ramas verdes largas y juncales, sin hojas visibles
Florece a final de verano y en otoño
Porte erguido en escoba, no en cojín',
  s.seasonality = 'Verano y otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Genista_spartioides_kz01.jpg?width=1280',
  s.image_attribution = 'Krzysztof Ziarnek, Kenraiz (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Genista spartioides';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Arenaria',
  s.primary_habitat = 'Pedregales, gravas y taludes móviles de montaña',
  s.description = 'Linaria de tallos tendidos y hojas algo carnosas de un verde azulado, con flores de colores muy variables —del amarillo al pardo violáceo, a veces bicolores— provistas de un espolón. Vive en pedregales sueltos, donde pocas plantas se asientan.',
  s.identification_tips = 'Color de la flor muy variable, a menudo bicolor
Follaje verde azulado y algo carnoso
Sobre gravas y pedregales sueltos',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Linaria_aeruginea.jpg?width=1280',
  s.image_attribution = 'This image is created by user Stijn Hantson at Observation.org, a g… (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Linaria aeruginea';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Arce',
  s.primary_habitat = 'Barrancos, umbrías y bosques mixtos sobre suelos frescos y calizos',
  s.description = 'Arce pequeño de hojas coriáceas divididas en tres lóbulos redondeados, mucho menores que las de otros arces. En otoño vira a tonos amarillos y rojizos que destacan en las umbrías. Sus frutos son sámaras dobles con las alas casi paralelas.',
  s.identification_tips = 'Hojas de tres lóbulos redondeados, pequeñas y duras
Sámaras dobles con las alas casi juntas y paralelas
Color otoñal amarillo y rojizo en barrancos umbríos',
  s.seasonality = 'Todo el año, con color otoñal marcado',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Acer_monspessulanum_fg01.jpg?width=1280',
  s.image_attribution = 'Fritz Geller-Grimm (CC BY-SA 2.5) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Acer monspessulanum';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Mayos',
  s.primary_habitat = 'Pinares y bosques con hojarasca, en media sombra',
  s.description = 'Orquídea sin apenas clorofila que emerge del suelo como un tallo violáceo con las hojas reducidas a escamas. Se alimenta a través de hongos conectados a las raíces de los árboles, así que no depende de la luz. Muchos años ni siquiera llega a abrir las flores.',
  s.identification_tips = 'Tallo violáceo entero, sin hojas verdes
Aparece de golpe entre la hojarasca del pinar
Flores grandes de color lila que a veces no llegan a abrirse',
  s.seasonality = 'Primavera y principio de verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Limodorum_abortivum_Mallorca_04.jpg?width=1280',
  s.image_attribution = 'Orchi (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Limodorum abortivum';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Campanica',
  s.primary_habitat = 'Ribazos, cunetas, cultivos y claros de matorral',
  s.description = 'Correhuela trepadora de flores rosadas grandes y llamativas, con hojas muy variables: las de abajo casi enteras y las de arriba profundamente divididas y plateadas. Se enreda en la vegetación de ribazos y márgenes.',
  s.identification_tips = 'Flores rosa intenso en embudo, grandes y vistosas
Hojas superiores muy recortadas y de aspecto plateado
Tallos volubles que se enredan en otras plantas',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Convolvulus_althaeoides_1.JPG?width=1280',
  s.image_attribution = 'User:Xemenendura (CC BY-SA 2.1 es) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Convolvulus althaeoides';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Espantalobos',
  s.primary_habitat = 'Bordes de bosque, barrancos y matorral sobre suelos frescos',
  s.description = 'Leguminosa arbustiva de flores amarillas y hojas compuestas, célebre por sus frutos: vainas infladas como globos de papel que estallan con un chasquido al apretarlas, de donde le viene el nombre de espantalobos.',
  s.identification_tips = 'Vainas infladas y traslúcidas, como globos
Flores amarillas de forma amariposada
Hojas compuestas por varios pares de foliolos redondeados',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Colutea_arborescens01.jpg?width=1280',
  s.image_attribution = 'autor no indicado (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Colutea arborescens';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Geranio de roca',
  s.primary_habitat = 'Fisuras y repisas de roquedos calizos',
  s.description = 'Geranio rupícola de rosetas compactas y hojas divididas y algo peludas, con flores rosadas o blanquecinas de venas marcadas. Vive encajado en las grietas de los cantiles, donde encuentra humedad y escapa de los herbívoros.',
  s.identification_tips = 'Rosetas apretadas metidas en la grieta de la roca
Flores rosadas con venas más oscuras
Frutos con pico largo que se enrolla al secarse',
  s.seasonality = 'Primavera',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/483580471/original.jpeg',
  s.image_attribution = 'Olivier Argagnon (CC BY 4.0) · GBIF/iNaturalist',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Erodium saxatile';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cabrilla',
  s.primary_habitat = 'Sobre las raíces de jaras y jarillas, en matorral mediterráneo',
  s.description = 'Planta parásita sin clorofila que vive dentro de las raíces de las jaras y solo asoma para florecer: un ramillete de flores rosadas y blancas que brota directamente del suelo, al pie de la mata hospedadora. El resto del año es invisible.',
  s.identification_tips = 'Brota directamente del suelo, sin tallo ni hojas verdes
Siempre al pie de una jara o jarilla
Flores rosadas con brácteas carnosas y llamativas',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Cytinus_ruber_(flowering_plants).jpg?width=1280',
  s.image_attribution = 'Hans Hillewaert (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Cytinus ruber';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Mayos',
  s.primary_habitat = 'Pastizales, claros de matorral y tomillares sobre suelos calizos',
  s.description = 'Orquídea que engaña a los insectos: su labelo imita el cuerpo de una abeja hembra, con un ancho borde amarillo y una mancha central azulada y aterciopelada. Los machos intentan copular con la flor y salen cargados de polen.',
  s.identification_tips = 'Labelo con ancho reborde amarillo brillante
Mancha central azulada y aterciopelada, como un espejo
Flores pocas y espaciadas en un tallo corto',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Ophrys_lutea.JPG?width=1280',
  s.image_attribution = 'autor no indicado (CC BY-SA 1.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Ophrys lutea';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Aladierno',
  s.primary_habitat = 'Matorral alto, encinares y barrancos sobre suelos pedregosos',
  s.description = 'Arbusto perennifolio de hojas alternas, coriáceas y de borde finamente dentado, sin espinas. Sus frutos maduran de rojo a negro y son muy buscados por los pájaros. Se distingue del espino negro por carecer de espinas y tener hojas mayores.',
  s.identification_tips = 'Sin espinas, a diferencia de otros ramnos
Hojas alternas, coriáceas y algo dentadas
Frutos que pasan de rojo a negro al madurar',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Rhamnus_alaternus1627.JPG?width=1280',
  s.image_attribution = 'tato grasso (CC BY-SA 2.5) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Rhamnus alaternus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Hierba de la cruz',
  s.primary_habitat = 'Roquedos, pedregales y pastizales pedregosos de montaña',
  s.description = 'Pimpinela de base leñosa y hojas divididas en foliolos pequeños y dentados, con cabezuelas globosas de flores verdosas y rojizas que carecen de pétalos. Crece agarrada a la roca y a los pedregales calizos.',
  s.identification_tips = 'Cabezuelas globosas verdosas o rojizas, sin pétalos
Hojas divididas en muchos foliolos dentados
Base leñosa y porte compacto sobre roca',
  s.seasonality = 'Primavera',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/517007573/original.jpg',
  s.image_attribution = 'FloresdeMurcia.com (CC BY-NC 4.0) · GBIF/iNaturalist',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Poterium ancistroides';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Esparto',
  s.primary_habitat = 'Laderas secas y llanos sobre suelos pobres; forma espartales extensos',
  s.description = 'El esparto, nombrado también como Stipa tenacissima, forma matas densas y duraderas que dan nombre a los espartales, uno de los paisajes característicos del sureste ibérico. Sus hojas se enrollan sobre sí mismas en los días secos para perder menos agua y se abren tras la lluvia. Durante siglos se recolectó para hacer cuerdas, esteras y alpargatas.',
  s.identification_tips = 'Matas grandes y compactas de hojas duras enrolladas
Las hojas se abren tras la lluvia y se enrollan al secar
Espigas altas y plateadas a final de primavera',
  s.seasonality = 'Primavera (espigado)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Stipa_tenacissima.jpg?width=1280',
  s.image_attribution = 'autor no indicado (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Macrochloa tenacissima';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Madreselva',
  s.primary_habitat = 'Roquedos, barrancos y matorral sobre suelos calizos',
  s.description = 'Madreselva trepadora de hojas opuestas, azuladas y soldadas por la base formando un disco que atraviesa el tallo. Sus flores blanquecinas o rosadas, muy perfumadas, se abren al atardecer para atraer polillas. Es un endemismo del sur peninsular.',
  s.identification_tips = 'Hojas superiores soldadas en un disco atravesado por el tallo
Follaje de tono azulado o glauco
Flores muy perfumadas que abren al anochecer',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Lonicera_splendida_2018-05-22_2462.jpg?width=1280',
  s.image_attribution = 'Salicyna (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Lonicera splendida';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Labiérnago',
  s.primary_habitat = 'Matorral mediterráneo y laderas secas sobre suelos pedregosos',
  s.description = 'Arbusto de hojas opuestas, estrechas y coriáceas, muy parecido a un acebuche pero con las hojas verdes por ambas caras. Sus frutos son pequeñas drupas azuladas o negras que consumen zorzales y currucas.',
  s.identification_tips = 'Hojas opuestas y estrechas, verdes por las dos caras
Sin el reverso plateado del acebuche
Frutos pequeños azulados o negros',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Phyllirea_angustifolia.jpg?width=1280',
  s.image_attribution = 'autor no indicado (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Phillyrea angustifolia';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Helianthemum viscarium',
  s.primary_habitat = 'Tomillares y matorral raso sobre margas y suelos yesosos',
  s.description = 'Jarilla pequeña y pegajosa, con hojas estrechas y tallos cubiertos de pelos glandulosos que retienen el polvo. Sus flores amarillas duran apenas unas horas y se renuevan cada día. Es un endemismo del sureste ibérico ligado a suelos margosos.',
  s.identification_tips = 'Tallos pegajosos, con polvo y arena adheridos
Flores amarillas efímeras, de un solo día
Sobre margas y yesos, en terreno claro',
  s.seasonality = 'Primavera',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/384325778/original.jpg',
  s.image_attribution = 'anarkis (CC BY-NC 4.0) · GBIF/iNaturalist',
  s.rarity_score = 1
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Helianthemum viscarium';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Rana común',
  s.primary_habitat = 'Charcas, balsas, acequias y tramos remansados con vegetación',
  s.description = 'La rana verde ibérica, la más común y adaptable de nuestros anfibios: coloniza desde ramblas y balsas de riego hasta fuentes urbanas. Su canto es un cacareo entrecortado que forma coros al atardecer. Salta al agua al menor movimiento en la orilla.',
  s.identification_tips = 'Línea clara a lo largo del centro del lomo en muchos ejemplares
Canto entrecortado, como una risa o un cacareo
Salta al agua desde la orilla al notar movimiento',
  s.seasonality = 'Primavera a otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Pelophylax_perezi_by-dpc.jpg?width=1280',
  s.image_attribution = 'David Perez (CC BY 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Pelophylax perezi';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Epipactis kleinii',
  s.primary_habitat = 'Pinares y bosques secos con hojarasca, en media sombra',
  s.description = 'Orquídea forestal de tallo delgado y hojas estrechas dispuestas en dos filas, con flores pequeñas de tonos blanquecinos y rosados. Es discreta y se pasa por alto con facilidad entre la hojarasca del pinar.',
  s.identification_tips = 'Hojas estrechas alineadas en dos filas a lo largo del tallo
Flores pequeñas y colgantes, blanquecinas o rosadas
Crece dispersa entre la hojarasca de pinares y bosques secos',
  s.seasonality = 'Primavera y principio de verano',
  s.image_url = 'https://bs.plantnet.org/image/o/fa3e211eacbd1612f2e8967c671667bdfafb8228',
  s.image_attribution = 'janet_phi (CC BY-SA 4.0) · GBIF',
  s.rarity_score = 1
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Epipactis kleinii';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Quejigo',
  s.primary_habitat = 'Umbrías y suelos frescos y profundos, en transición al bosque mediterráneo',
  s.description = 'Roble mediterráneo de hojas dentadas, más grandes que las de la encina, verdes por el haz y algo blanquecinas por el envés. Es marcescente: las hojas secas quedan colgando del árbol todo el invierno y no caen hasta que brotan las nuevas.',
  s.identification_tips = 'Hojas secas que persisten en la rama todo el invierno
Hoja dentada, mayor y más blanda que la de la encina
Prefiere umbrías y vaguadas con suelo profundo',
  s.seasonality = 'Primavera a otoño (marcescente en invierno)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Quercus_faginea_centenario.jpg?width=1280',
  s.image_attribution = 'Carlosblh (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Quercus faginea';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Madroño',
  s.primary_habitat = 'Umbrías, barrancos y matorral alto sobre suelos frescos',
  s.description = 'Arbusto o arbolillo de hojas lustrosas y dentadas y corteza rojiza que se desprende en tiras. En otoño coinciden en la misma rama las flores blancas en racimos colgantes y los frutos rojos y granulosos del año anterior.',
  s.identification_tips = 'Flores y frutos a la vez en la misma rama, en otoño
Frutos rojos esféricos de superficie granulosa
Corteza rojiza que se desprende en tiras finas',
  s.seasonality = 'Otoño e invierno (flor y fruto a la vez)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Arbutus_unedo_Corsica.jpg?width=1280',
  s.image_attribution = 'jxandreani (CC BY 2.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Arbutus unedo';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Floreta',
  s.primary_habitat = 'Matorral seco y laderas soleadas sobre suelos pedregosos',
  s.description = 'Leguminosa de tallos verdes, largos y flexibles, casi sin hojas —que caen pronto para ahorrar agua—, rematados en umbelas de flores amarillas. Sus frutos son legumbres articuladas que se rompen en segmentos con una semilla cada uno.',
  s.identification_tips = 'Tallos verdes y juncosos, casi sin hojas
Umbelas de flores amarillas en el extremo
Legumbres articuladas, como collares de cuentas',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Coronilla_juncea.JPG?width=1280',
  s.image_attribution = 'Mario Modesto Mata (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Coronilla juncea';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Ammoides',
  s.primary_habitat = 'Pastizales anuales, claros de matorral y suelos removidos',
  s.description = 'Umbelífera anual y menuda, con hojas divididas en segmentos filiformes y pequeñas umbelas de flores blancas. Desprende un olor aromático fuerte al estrujarla. Forma parte de las comunidades efímeras que aparecen tras las lluvias de primavera.',
  s.identification_tips = 'Hojas divididas en segmentos como hilos
Umbelas blancas pequeñas y de pocos radios
Olor aromático marcado al estrujar la planta',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Ammoides_pusilla_Enfoqueflores_2011-6-11_CampodeCalatrava.jpg?width=1280',
  s.image_attribution = 'javier martin (Public domain) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Ammoides pusilla';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Bocha blanca',
  s.primary_habitat = 'Matorral, ribazos y claros sobre suelos secos y calizos',
  s.description = 'Mata baja y grisácea por la pelusa que la cubre, con hojas divididas en foliolos estrechos y ramilletes apretados de florecillas blancas con la quilla oscura. Es muy frecuente en los claros del matorral.',
  s.identification_tips = 'Ramilletes densos de flores blancas muy pequeñas
Quilla de la flor con la punta oscura
Aspecto grisáceo por la pelusa que cubre la planta',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Dorycnium_pentaphyllum_Habitat_2010-6-15_DehesaBoyaldePuertollano.jpg?width=1280',
  s.image_attribution = 'Javier martin (Public domain) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Lotus dorycnium';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Athamanta hispanica',
  s.primary_habitat = 'Fisuras y repisas de roquedos calizos de montaña',
  s.description = 'Umbelífera rupícola de hojas muy divididas y cubiertas de pelos, con umbelas de flores blancas sostenidas por tallos finos. Es un endemismo ibérico restringido a cantiles calizos del sureste, donde forma pequeñas poblaciones aisladas.',
  s.identification_tips = 'Hojas muy divididas y con pelos, de aspecto grisáceo
Umbelas blancas pequeñas, en pared rocosa
Crece encajada en fisuras, colgando del cantil',
  s.seasonality = 'Verano',
  s.image_url = 'https://observation.org/photos/83864093.jpg',
  s.image_attribution = 'Fco. Javier López Espino (CC BY-NC-ND 4.0) · observation.org / GBIF',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Athamanta hispanica';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Ajo silvestre',
  s.primary_habitat = 'Pastizales secos, ribazos y claros de matorral',
  s.description = 'Ajo silvestre de umbela laxa y colgante, con flores acampanadas de tonos rosados o pardo claro sobre pedicelos largos y desiguales. Las brácteas que envuelven la inflorescencia acaban en dos puntas largas como cuernos.',
  s.identification_tips = 'Umbela laxa y desmadejada, con flores colgantes
Dos brácteas largas como cuernos bajo la umbela
Olor a ajo al estrujar las hojas',
  s.seasonality = 'Verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Laguna_de_San_Juan_20100617_3431.jpg?width=1280',
  s.image_attribution = 'Alberto Salguero (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Allium pallens';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Clavellina',
  s.primary_habitat = 'Pastizales secos, arenales y claros de matorral sobre suelos pobres',
  s.description = 'Clavellina silvestre de tallos finos y hojas muy estrechas, con flores rosadas de pétalos profundamente recortados en flecos. El cáliz es un tubo largo y estrecho del que asoman los pétalos. Desprende una fragancia suave, más perceptible al atardecer.',
  s.identification_tips = 'Pétalos rosados recortados en flecos finos
Cáliz en tubo largo y delgado
Hojas muy estrechas, casi como agujas',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Dianthus_broteri.jpg?width=1280',
  s.image_attribution = 'Nanosanchez (Public domain) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Dianthus broteri';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'poliol atomillado',
  s.primary_habitat = 'Roquedos, pedregales y matorral raso sobre calizas de montaña',
  s.description = 'Mata pequeña y grisácea de hojas diminutas y enrolladas parecidas a las del tomillo, con flores de un rosa purpúreo. Como todos los teucrios, la flor carece de labio superior, dejando los estambres al descubierto. Es un endemismo del sureste ibérico.',
  s.identification_tips = 'Hojas minúsculas y enrolladas, como de tomillo
Flores rosa púrpura sin labio superior
Sobre roca y pedregal calizo, en matas bajas',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/627242096/original.jpg',
  s.image_attribution = 'Finlay F. K. Thorpe (CC BY-NC 4.0) · GBIF/iNaturalist',
  s.rarity_score = 1
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Teucrium thymifolium';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Álamo blanco',
  s.primary_habitat = 'Riberas, sotos y suelos con capa freática cercana',
  s.description = 'Árbol de ribera con el envés de las hojas cubierto de un fieltro blanco que hace que la copa parezca cambiar de color con el viento. La corteza es clara y con lenticelas romboidales oscuras. Rebrota de raíz con facilidad y forma bosquetes clonales.',
  s.identification_tips = 'Envés de la hoja blanco: la copa «platea» con el viento
Corteza clara con marcas romboidales oscuras
Retoños de raíz alrededor del pie principal',
  s.seasonality = 'Primavera a otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Populus_alba_01.jpg?width=1280',
  s.image_attribution = 'la la means I love you (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Populus alba';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Labiérnago prieto',
  s.primary_habitat = 'Encinares, matorral alto y umbrías sobre suelos pedregosos',
  s.description = 'Arbusto o arbolillo de hojas opuestas, coriáceas y de borde dentado, más anchas que las de su pariente de hoja estrecha. Las hojas jóvenes son marcadamente dentadas y las adultas casi enteras, lo que despista con frecuencia.',
  s.identification_tips = 'Hojas opuestas y anchas, dentadas en las ramas jóvenes
Verde oscuro por las dos caras
Frutos pequeños azul negruzcos',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Phillyrea_latifolia.jpg?width=1280',
  s.image_attribution = 'autor no indicado (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Phillyrea latifolia';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Lirio',
  s.primary_habitat = 'Pastizales pedregosos, ribazos y claros de matorral sobre calizas',
  s.description = 'Lirio enano de rizoma superficial y hojas en abanico, con flores grandes que pueden ser amarillas o violetas en la misma población. Los pétalos externos llevan una cresta de pelos que guía a los abejorros hacia el néctar.',
  s.identification_tips = 'Flores grandes sobre un tallo muy corto, casi a ras de suelo
Cresta de pelos en los pétalos externos
Hojas planas dispuestas en abanico',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Iris_lutescens_(flowers).jpg?width=1280',
  s.image_attribution = 'Hans Hillewaert (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Iris lutescens';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Salado',
  s.primary_habitat = 'Pedregales, taludes y matorral sobre suelos calizos y margosos',
  s.description = 'Leguminosa arbustiva de hojas con tres foliolos estrechos y dentados y racimos de flores rosadas con venas más oscuras. Es una planta pionera que fija taludes y pedregales, donde sus raíces profundas aguantan el movimiento del sustrato.',
  s.identification_tips = 'Flores rosadas con venas oscuras bien marcadas
Hojas de tres foliolos estrechos y dentados
Coloniza taludes y pedregales sueltos',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Ononis_fruticosa.jpg?width=1280',
  s.image_attribution = 'Arrakatanga33 (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Ononis fruticosa';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Klasea flavescens',
  s.primary_habitat = 'Pastizales secos, claros de matorral y taludes sobre suelos margosos',
  s.description = 'Compuesta de hojas divididas y algo espinosas, con capítulos grandes de flores amarillas rodeados de brácteas secas y brillantes. A distancia recuerda a un cardo, pero sus hojas pinchan mucho menos.',
  s.identification_tips = 'Capítulos amarillos grandes y solitarios
Brácteas secas y algo brillantes bajo la flor
Hojas divididas, con dientes poco punzantes',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Klasea_flavescens0001_01.jpg?width=1280',
  s.image_attribution = 'Philmarin (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Klasea flavescens';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Gayuba',
  s.primary_habitat = 'Pinares aclarados, crestas y laderas pedregosas de montaña',
  s.description = 'Mata rastrera de hojas pequeñas, coriáceas y brillantes que forma alfombras densas sobre el suelo del pinar. Sus flores son urnas blanco rosadas colgantes y sus frutos, bayas rojas y harinosas. Ayuda a fijar el suelo en laderas pedregosas.',
  s.identification_tips = 'Porte rastrero formando alfombras continuas
Hojas pequeñas, duras y muy brillantes
Flores en urna colgante y frutos rojos harinosos',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Gayuba.jpg?width=1280',
  s.image_attribution = 'No machine-readable author provided. Carlosblh assumed (based on co… (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Arctostaphylos uva-ursi';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Ortiga muerta',
  s.primary_habitat = 'Roquedos, taludes umbríos y pies de cantil',
  s.description = 'Labiada de hojas anchas, arrugadas y cubiertas de pelo suave, que crece en repisas y pies de roca umbríos. Sus flores, blanquecinas o rosadas con manchas, se agrupan en verticilos. Recuerda a una ortiga, pero no pica.',
  s.identification_tips = 'Hojas anchas y arrugadas, de tacto aterciopelado
Flores en anillos alrededor del tallo cuadrado
En pies de roca y taludes umbríos',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Stachys_circinata.JPG?width=1280',
  s.image_attribution = 'Xemenendura (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Stachys circinata';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Olmo común',
  s.primary_habitat = 'Sotos, vegas y suelos profundos con humedad freática',
  s.description = 'Árbol de hojas asimétricas en la base —un lado baja más que el otro— y borde doblemente aserrado. Florece antes de echar la hoja y fructifica en sámaras redondeadas y membranosas. La grafiosis ha diezmado sus poblaciones adultas.',
  s.identification_tips = 'Base de la hoja claramente asimétrica
Sámaras redondas y papiráceas antes que las hojas
Rebrota de raíz formando setos y orlas',
  s.seasonality = 'Primavera a otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Blismes_elm_2007.jpg?width=1280',
  s.image_attribution = 'Eric Collin. Original uploader was Ptelea at en.wikipedia (GFDL) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Ulmus minor';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Sanjuán blanco',
  s.primary_habitat = 'Bosques y pinares con sombra y hojarasca, sobre suelos calizos',
  s.description = 'Orquídea de porte erguido con hojas largas y estrechas dispuestas en dos filas y flores blancas que apenas llegan a abrirse del todo. Vive en la penumbra del bosque y depende de hongos del suelo para germinar y crecer.',
  s.identification_tips = 'Flores blancas semicerradas, en espiga laxa
Hojas largas y estrechas en dos filas
En sombra de bosque, sobre hojarasca',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Cephalanthera_longifolia_300508.jpg?width=1280',
  s.image_attribution = 'Bernd Haynold (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Cephalanthera longifolia';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'culantrillo glanduloso',
  s.primary_habitat = 'Grietas de roquedos calizos secos y soleados, y muros antiguos',
  s.description = 'Helecho pequeño que sobrevive en fisuras de roca caliza expuestas al sol, algo insólito en un grupo que suele buscar la humedad. Sus frondes son cortas, divididas y cubiertas de pelos glandulosos. En sequía se enrolla y parece muerto, y revive con la lluvia.',
  s.identification_tips = 'Frondes pequeñas, divididas y con pelos pegajosos
En grietas de roca seca y soleada, no en umbrías húmedas
Se reseca y enrolla en verano, y rebrota con la lluvia',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Petrarchae.jpg?width=1280',
  s.image_attribution = 'Juan Bibiloni (CC BY 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Asplenium petrarchae';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Olmo de montaña',
  s.primary_habitat = 'Barrancos húmedos y umbrías frescas de montaña',
  s.description = 'Olmo de hojas grandes, ásperas al tacto como papel de lija y con la base muy asimétrica, a menudo con la punta dividida en tres. Prefiere barrancos frescos y umbríos, y no rebrota de raíz como el olmo común.',
  s.identification_tips = 'Hojas grandes y muy ásperas al tacto
Punta de la hoja a menudo dividida en tres lóbulos
En barrancos umbríos y frescos, no en vegas secas',
  s.seasonality = 'Primavera a otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Ulmus_glabra_horizontalis.jpg?width=1280',
  s.image_attribution = 'Melburnian (CC BY 2.5) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Ulmus glabra';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cerezo rastrero',
  s.primary_habitat = 'Crestas, pedregales y matorral almohadillado de alta montaña',
  s.description = 'Cerezo enano de porte rastrero y ramas retorcidas, adaptado al viento y al frío de las cumbres. Florece en rosa antes de echar la hoja y da drupas rojas pequeñas y ácidas. Rara vez levanta más de un palmo del suelo.',
  s.identification_tips = 'Porte rastrero y retorcido, pegado a la roca
Flores rosadas antes de que salgan las hojas
Frutillos rojos parecidos a cerezas diminutas',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Prunus_prostrata.jpg?width=1280',
  s.image_attribution = 'User:Tigerente (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Prunus prostrata';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Mirto',
  s.primary_habitat = 'Barrancos, umbrías y matorral alto sobre suelos frescos',
  s.description = 'Arbusto aromático de hojas opuestas, brillantes y coriáceas que al mirarlas a contraluz muestran puntitos translúcidos: son las glándulas de aceite esencial. Sus flores blancas tienen un penacho de estambres y sus frutos son bayas azul negruzcas.',
  s.identification_tips = 'Puntos translúcidos en la hoja al mirarla a contraluz
Aroma intenso al estrujar una hoja
Flores blancas con muchos estambres, como un pincel',
  s.seasonality = 'Verano (floración) y otoño (fruto)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Starr_080304-3229_Myrtus_communis.jpg?width=1280',
  s.image_attribution = 'Forest & Kim Starr (CC BY 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Myrtus communis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Guillomero',
  s.primary_habitat = 'Roquedos, pedregales y matorral de montaña, a menudo en umbría',
  s.description = 'Arbusto de hojas ovaladas, verdes por el haz y blanquecinas y afieltradas por el envés, con flores blancas o rosadas agrupadas en corimbos. En otoño da frutos rojos que atraen a zorzales y currucas. Es un endemismo del sur y sureste peninsular.',
  s.identification_tips = 'Envés de la hoja blanquecino y afieltrado
Frutos rojos pequeños agrupados, muy visibles en otoño
Porte arbustivo entre rocas, a menudo colgante',
  s.seasonality = 'Primavera (floración) y otoño (fruto)',
  s.image_url = 'https://observation.org/photos/83833755.jpg',
  s.image_attribution = 'Paco (Faluke) (CC BY-NC-ND 4.0) · observation.org / GBIF',
  s.rarity_score = 3
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Cotoneaster granatensis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Milamores',
  s.primary_habitat = 'Roquedos, muros, taludes y pedregales',
  s.description = 'Planta de hojas opuestas y algo carnosas, de un verde azulado, con densos ramilletes de flores rosadas o lilas provistas de un espolón fino. Coloniza muros viejos, taludes y pedregales, donde forma manchas muy vistosas.',
  s.identification_tips = 'Ramilletes densos de flores rosadas o lilas
Cada flor con un espolón fino por detrás
Follaje glauco, algo carnoso y azulado',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Centranthus_lecoqii_subsp._lecoqii_4154.JPG?width=1280',
  s.image_attribution = 'Vachiclub (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Centranthus lecoqii';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Artemisia reptans',
  s.primary_habitat = 'Pedregales, gravas y suelos removidos de montaña',
  s.description = 'Artemisia de porte rastrero que se extiende por el suelo formando alfombras, con hojas divididas y cubiertas de pelo blanco. Sus capítulos son pequeños y poco vistosos, como en casi todas las artemisias. Desprende un olor amargo característico.',
  s.identification_tips = 'Porte rastrero, extendiéndose por el suelo
Hojas divididas y cubiertas de pelusa blanca
Olor amargo y aromático al frotar',
  s.seasonality = 'Verano y otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Artemisia_reptans_Samuel_Correa_Falc%C3%B3n_2022_GC.jpg?width=1280',
  s.image_attribution = 'SamuelCorreaFalcón (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Artemisia reptans';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Manzanilla bastarda',
  s.primary_habitat = 'Cunetas, eriales, ramblas y suelos removidos',
  s.description = 'Compuesta anual de hojas muy divididas y capítulos amarillos que suelen carecer de lígulas, por lo que parecen botones sin pétalos. Es una planta pionera muy frecuente en bordes de camino y terrenos alterados.',
  s.identification_tips = 'Capítulos amarillos sin pétalos visibles, como botones
Hojas finamente divididas, de aspecto plumoso
Frecuente en cunetas y suelos removidos',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/A._valentinus-1.JPG?width=1280',
  s.image_attribution = 'Philmarin (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Anacyclus valentinus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Silene mellifera',
  s.primary_habitat = 'Roquedos, taludes y claros de matorral sobre suelos calizos',
  s.description = 'Silene de flores blancas cuyos pétalos se abren al atardecer y desprenden un perfume dulce e intenso que atrae a polillas nocturnas. El cáliz es un tubo alargado con venas marcadas. De día las flores suelen aparecer mustias y cerradas.',
  s.identification_tips = 'Flores blancas que abren al anochecer y huelen intensamente
Cáliz tubular con venas bien marcadas
De día las flores parecen marchitas',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Silene_mellifera_Enfoque_2012-05-27_Robledillo_SierraMadrona.jpg?width=1280',
  s.image_attribution = 'Javier martin (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Silene mellifera';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'epipacte blanca',
  s.primary_habitat = 'Bosques umbríos con hojarasca sobre suelos calizos',
  s.description = 'Orquídea de bosque con hojas anchas y ovaladas y flores de un blanco cremoso que casi nunca llegan a abrirse por completo. Se autopoliniza dentro de la flor cerrada, lo que la hace independiente de los insectos.',
  s.identification_tips = 'Flores color marfil que apenas se entreabren
Hojas anchas y ovaladas, no estrechas
En bosque umbrío, sobre hojarasca',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Cephalanthera_damasonium_050606.jpg?width=1280',
  s.image_attribution = 'Bernd Haynold (CC BY 2.5) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Cephalanthera damasonium';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Algarrobo',
  s.primary_habitat = 'Laderas cálidas, antiguos cultivos y matorral del piso termomediterráneo',
  s.description = 'Árbol perennifolio de copa densa y hojas compuestas con foliolos redondeados y lustrosos. Florece en otoño directamente sobre el tronco y las ramas viejas. Sus vainas pardas y dulces, las algarrobas, se han usado durante siglos como pienso y alimento.',
  s.identification_tips = 'Hojas compuestas de foliolos redondos y brillantes
Flores nacidas directamente del tronco y las ramas gruesas
Vainas pardas y aplanadas colgando del árbol',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Ceratonia_siliqua_Keciboynuzu_1370984_Nevit.jpg?width=1280',
  s.image_attribution = 'Nevit Dilmen (talk) (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Ceratonia siliqua';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Erodium celtibericum',
  s.primary_habitat = 'Pedregales calizos y crestas de montaña',
  s.description = 'Geranio de montaña que forma rosetas compactas de hojas plateadas y muy divididas, con flores rosadas de venas marcadas. Es un endemismo ibérico ligado a pedregales calizos de altura, con poblaciones pequeñas y aisladas.',
  s.identification_tips = 'Rosetas densas de hojas plateadas y muy divididas
Flores rosadas con venas más oscuras
En pedregales de altura, sobre caliza',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://inaturalist-open-data.s3.amazonaws.com/photos/205785187/original.jpg',
  s.image_attribution = 'Denys Vynokurov (CC BY 4.0) · GBIF/iNaturalist',
  s.rarity_score = 1
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Erodium celtibericum';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Mostajo',
  s.primary_habitat = 'Umbrías y barrancos frescos de montaña, en bosque mixto',
  s.description = 'Arbolillo de hojas anchas, dentadas y cubiertas por el envés de un fieltro blanco que las hace destacar cuando sopla el viento. Da corimbos de flores blancas en primavera y frutos rojos y harinosos en otoño, buscados por zorzales y mirlos.',
  s.identification_tips = 'Envés de la hoja blanco y afieltrado
Corimbos de flores blancas en primavera
Frutos rojos harinosos en otoño',
  s.seasonality = 'Primavera (flor) y otoño (fruto y color)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Weilburg_-_Tiergarten_-_Mehlbeere.jpg?width=1280',
  s.image_attribution = 'Oliver Abels (SBT) (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Aria edulis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Tablero de damas',
  s.primary_habitat = 'Pastizales, claros de matorral y pedregales de montaña',
  s.description = 'Bulbosa de tallo fino y hojas estrechas que cuelga una o dos flores en forma de campana, con un jaspeado pardo y verdoso que recuerda a un tablero de ajedrez. Pasa desapercibida entre la hierba pese a su forma llamativa.',
  s.identification_tips = 'Flor colgante en campana con dibujo ajedrezado
Tallo fino con pocas hojas estrechas
Colores apagados que la camuflan en el pastizal',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Fritillaria_lusitanica_2_2601.jpg?width=1280',
  s.image_attribution = 'Balles2601 (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Fritillaria lusitanica';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cabra montés',
  s.primary_habitat = 'Roquedos, canchales y laderas escarpadas con matorral',
  s.description = 'Bóvido de montaña perfectamente adaptado a la roca: pezuñas con borde duro y almohadilla blanda que agarra en pendientes imposibles. Los machos lucen cuernos grandes, curvados hacia atrás y con abultamientos; las hembras los tienen cortos y rectos.',
  s.identification_tips = 'Machos con cuernos grandes curvados hacia atrás
Se mueve por cortados donde nada más puede subir
Excrementos en montoncitos de bolitas cilíndricas',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Capra_pyrenaica_in_Sierra_de_Guadarrama.jpg?width=1280',
  s.image_attribution = 'Thomas Holbach (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Capra pyrenaica';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Tomillo',
  s.primary_habitat = 'Tomillares, pastizales secos y claros de matorral sobre suelos pobres',
  s.description = 'Tomillo de hojas estrechas y con pelos largos en la base, que forma matas bajas y ramificadas. Es la especie de la que se extrae buena parte del tomillo de uso culinario y de la que se destila aceite esencial rico en timol.',
  s.identification_tips = 'Hojas estrechas con pelos largos y blancos en la base
Espigas de flores blancas o rosadas al final de las ramas
Aroma potente, el clásico del tomillo de cocina',
  s.seasonality = 'Primavera y verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Thymus_zygis_1.JPG?width=1280',
  s.image_attribution = 'Ximenex (CC BY-SA 2.1 es) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Thymus zygis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cincoenrama',
  s.primary_habitat = 'Fisuras y repisas de roquedos calizos, sobre todo en umbría',
  s.description = 'Planta rupícola de hojas divididas en cinco foliolos dentados y flores blancas de cinco pétalos algo separados entre sí. Crece colgando de las grietas de los cantiles calizos, formando matas laxas.',
  s.identification_tips = 'Hojas divididas en cinco foliolos dentados
Flores blancas con los pétalos algo separados
Cuelga de fisuras en pared caliza',
  s.seasonality = 'Verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Potentilla_caulescens.jpg?width=1280',
  s.image_attribution = 'User:Tigerente (CC BY 2.5) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Potentilla caulescens';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Serbal común',
  s.primary_habitat = 'Umbrías, barrancos y antiguos cultivos de montaña media',
  s.description = 'Árbol de hojas compuestas por muchos foliolos dentados, parecido al serbal de cazadores pero con frutos mayores, en forma de pera o manzana diminuta, que solo se vuelven comestibles cuando se pasan y ablandan.',
  s.identification_tips = 'Hoja compuesta de muchos foliolos alargados y dentados
Frutos con forma de perita o manzanita
Corteza que se agrieta en placas rectangulares con la edad',
  s.seasonality = 'Primavera (flor) y otoño (fruto)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Sorbus_domestica_FruitsLeaves_BotGardBln0906a.JPG?width=1280',
  s.image_attribution = 'BotBln (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Cormus domestica';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Nogal',
  s.primary_habitat = 'Vegas, barrancos y suelos profundos y frescos; a menudo plantado',
  s.description = 'Árbol de hoja caduca con hojas compuestas de foliolos grandes y aromáticos y corteza gris que se agrieta con la edad. Sus raíces liberan sustancias que inhiben el crecimiento de otras plantas, por lo que bajo su copa suele haber poco sotobosque.',
  s.identification_tips = 'Hojas compuestas de olor fuerte al estrujarlas
Nueces envueltas en una cáscara verde carnosa
Poca vegetación bajo su copa',
  s.seasonality = 'Primavera a otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/20110802Walnussbaum_Plankstadt2.jpg?width=1280',
  s.image_attribution = 'AnRo0002 (CC0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Juglans regia';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Fresno de flor',
  s.primary_habitat = 'Umbrías, barrancos y bosques mixtos sobre suelos frescos',
  s.description = 'Fresno que, a diferencia de sus parientes, tiene flores blancas y vistosas con pétalos, agrupadas en panículas fragantes que aparecen con las hojas. De su corteza se obtiene el maná, una savia azucarada que se recolectaba tradicionalmente.',
  s.identification_tips = 'Panículas de flores blancas perfumadas, con pétalos
Hojas compuestas opuestas, de foliolos dentados
Yemas grises o pardas, no negras como en otros fresnos',
  s.seasonality = 'Primavera (floración) a otoño',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Fraxinus_ornus_JPG2.jpg?width=1280',
  s.image_attribution = 'Jean-Pol GRANDMONT (CC BY 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Fraxinus ornus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Jarilla',
  s.primary_habitat = 'Tomillares y matorral raso sobre suelos calizos y margosos secos',
  s.description = 'Jarilla pequeña de hojas estrechas y grisáceas con el borde enrollado, que se cubre en primavera de flores amarillas efímeras. Como en todas las jarillas, los pétalos apenas duran una mañana y se renuevan cada día.',
  s.identification_tips = 'Hojas estrechas con el borde enrollado hacia abajo
Flores amarillas que duran solo unas horas
Mata baja y grisácea del tomillar',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Helianthemum_violaceum_habitus_SierraMadrona.jpg?width=1280',
  s.image_attribution = 'Javier martin (Public domain) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Helianthemum violaceum';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Jara cervuna',
  s.primary_habitat = 'Jarales y claros de bosque sobre suelos silíceos o descarbonatados',
  s.description = 'Jara de hojas anchas y acorazonadas con peciolo, parecidas a las de un chopo, lo que la hace inconfundible entre las jaras ibéricas. Sus flores son blancas, grandes y con el centro amarillo, y salen agrupadas en el extremo de las ramas.',
  s.identification_tips = 'Hojas anchas y acorazonadas, con peciolo largo
Flores blancas grandes con el centro amarillo
Sépalos externos grandes y muy visibles en el capullo',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Cistus_populifolius.jpg?width=1280',
  s.image_attribution = 'Taken by Carsten Niehaus (user:Lumbar). (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Cistus populifolius';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Erica erigena',
  s.primary_habitat = 'Suelos húmedos, bordes de curso de agua y zonas de rezume',
  s.description = 'Brezo de hojas diminutas en verticilos y flores rosadas en forma de campanilla que se abren en pleno invierno. A diferencia de la mayoría de brezos, necesita humedad constante en el suelo, lo que restringe mucho su presencia.',
  s.identification_tips = 'Flores rosadas acampanadas, en invierno
Hojas minúsculas dispuestas en anillos
Siempre en suelos con humedad permanente',
  s.seasonality = 'Invierno y primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Erica_erigena_2c.JPG?width=1280',
  s.image_attribution = 'Consultaplantas (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Erica erigena';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Neotinea maculata',
  s.primary_habitat = 'Pastizales, claros de matorral y pinares sobre suelos calizos',
  s.description = 'Orquídea discreta y pequeña, con una espiga densa de flores blanquecinas o rosadas que apenas se abren. Sus hojas basales llevan a menudo un moteado pardo violáceo que le da el nombre. Pasa desapercibida salvo que se busque a propósito.',
  s.identification_tips = 'Espiga apretada de flores muy pequeñas y semicerradas
Hojas basales con manchas pardas o violáceas
Planta menuda, de pocos centímetros',
  s.seasonality = 'Primavera',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Neotinea_maculata_(Sardinia).jpg?width=1280',
  s.image_attribution = '(Hans Hillewaert) (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Neotinea maculata';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Hipérico de fuente',
  s.primary_habitat = 'Fuentes, rezumes, acequias y bordes de curso de agua',
  s.description = 'Hipérico de tallos erguidos con hojas opuestas y soldadas por la base, que rodean el tallo. Vive ligado a puntos con agua permanente, así que su presencia señala fuentes y rezumaderos. Sus flores amarillas tienen los estambres agrupados en haces.',
  s.identification_tips = 'Hojas opuestas soldadas alrededor del tallo
Flores amarillas con muchos estambres en manojos
Siempre junto a fuentes, acequias o rezumes',
  s.seasonality = 'Verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Hypericum_caprifolium_(NHS).jpg?width=1280',
  s.image_attribution = 'The Trustees of the National History Museum in London (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Hypericum caprifolium';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Heleborina rojo oscuro',
  s.primary_habitat = 'Pedregales, claros de bosque y taludes calizos de montaña',
  s.description = 'Orquídea de flores de un rojo vinoso oscuro que desprenden aroma a vainilla y atraen a avispas. Crece en pedregales y claros calizos, a menudo en pequeños grupos. Es una de las orquídeas de floración más tardía.',
  s.identification_tips = 'Flores de rojo vinoso oscuro, muy características
Aroma dulce a vainilla al acercarse
En pedregales y taludes calizos, en verano',
  s.seasonality = 'Verano',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Epipactis_atrorubens_flowers.jpg?width=1280',
  s.image_attribution = 'autor no indicado (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Epipactis atrorubens';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Azor común',
  s.primary_habitat = 'Bosques maduros y masas forestales densas con claros',
  s.description = 'Rapaz forestal de alas cortas y anchas y cola larga, diseñada para perseguir presas entre los árboles a gran velocidad. Es esquiva y se ve casi siempre de refilón. La hembra llega a ser un tercio mayor que el macho, una diferencia poco habitual entre las aves.',
  s.identification_tips = 'Ceja blanca marcada sobre el ojo, como un antifaz al revés
Vuelo de varios aleteos rápidos seguidos de un planeo corto
Pecho finamente rayado en horizontal en los adultos',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Northern_Goshawk_ad_M2.jpg?width=1280',
  s.image_attribution = 'Norbert Kenntner, Berlin (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Accipiter gentilis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Águila real',
  s.primary_habitat = 'Montañas y sierras con cortados rocosos y amplias zonas abiertas de caza',
  s.description = 'La mayor de las águilas ibéricas, con casi dos metros y medio de envergadura y una nuca dorada que le da nombre. Cría en repisas de cantiles y usa territorios enormes, que una pareja defiende durante años. Planea con las alas en una «V» muy suave y bate poco, lo que la distingue de las rapaces menores.',
  s.identification_tips = 'Nuca y cogote de tono dorado, visibles a buena luz
Planea con las alas en «V» muy abierta y bate poco
Tamaño enorme: dobla al ratonero en el mismo cielo',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Maakotka_(Aquila_chrysaetos)_by_Jarkko_J%C3%A4rvinen.jpg?width=1280',
  s.image_attribution = 'Jarkko Järvinen (CC BY-SA 2.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Aquila chrysaetos';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Águila perdicera',
  s.primary_habitat = 'Sierras con cortados rocosos y amplias zonas abiertas de matorral y cultivo para cazar',
  s.description = 'Águila mediana de alas largas y cola larga, con el vientre blanco finamente rayado y una mancha blanca en la espalda que se ve bien en vuelo. Caza a gran velocidad y a poca altura, sorprendiendo a perdices, conejos y palomas. Las parejas ocupan el mismo cortado durante años.',
  s.identification_tips = 'Mancha blanca en el centro de la espalda, visible desde arriba
Vientre claro y muy rayado, con una banda oscura en el borde del ala
Vuelo bajo y rápido cuando caza, no en círculos altos',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Aguila_perdicera.jpg?width=1280',
  s.image_attribution = 'Paco Gómez from Castellón, Spain (CC BY-SA 2.0) · Wikimedia Commons',
  s.rarity_score = 5
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Aquila fasciata';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Búho real',
  s.primary_habitat = 'Cortados rocosos, barrancos y laderas con matorral y zonas abiertas de caza',
  s.description = 'El mayor búho de Europa, con casi dos metros de envergadura, penachos de plumas erguidos sobre la cabeza y ojos de un naranja encendido. Caza conejos, ratas e incluso otras rapaces. Su canto es un «bu-bo» profundo que se propaga kilómetros por los barrancos en las noches de invierno.',
  s.identification_tips = 'Penachos de plumas erguidos a los lados de la cabeza
Ojos naranjas muy intensos
Canto grave y profundo en las noches de invierno',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Bubo_bubo_sibiricus_-_01.JPG?width=1280',
  s.image_attribution = 'Carlos Delgado (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Bubo bubo';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Alcaraván',
  s.primary_habitat = 'Llanos pedregosos, cultivos de secano, ramblas y eriales con poca cobertura',
  s.description = 'Ave de aspecto extraño y ojos amarillos enormes, adaptados a la actividad nocturna. De día permanece agachada e inmóvil, confiada en su plumaje críptico, y solo al anochecer se activa y delata con un reclamo silbado y melancólico que recuerda al del zarapito.',
  s.identification_tips = 'Ojos amarillos desproporcionadamente grandes
Dos barras blancas y negras en el ala plegada
Reclamo silbado y triste al anochecer',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Burhinus_oedicnemus_insularum_Lanzarote_1.jpg?width=1280',
  s.image_attribution = 'Frank Vassen from Brussels, Belgium (CC BY 2.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Burhinus oedicnemus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Chotacabras cuellirrojo',
  s.primary_habitat = 'Matorral abierto, pinares aclarados, ramblas y caminos térreos',
  s.description = 'Ave crepuscular de plumaje jaspeado que imita la hojarasca, tan mimético que de día resulta casi imposible verla posada en el suelo. Caza polillas en vuelo con la boca muy abierta. Su canto nocturno es un «cu-toc, cu-toc» repetido de forma monótona durante minutos.',
  s.identification_tips = 'Collar rojizo en la nuca, más marcado que en su pariente europeo
Se levanta del camino al anochecer y vuelve a posarse unos metros más allá
Canto nocturno monótono, como un motor lejano',
  s.seasonality = 'Primavera y verano (estival)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Caprimulgus_ruficollis_-Portugal-8.jpg?width=1280',
  s.image_attribution = 'Olivença (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Caprimulgus ruficollis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Culebrera europea',
  s.primary_habitat = 'Sierras y llanos con matorral, ramblas y bosque abierto',
  s.description = 'Águila grande y muy pálida por debajo, especializada en comer culebras y lagartos. Se ciñe en el aire durante largos ratos, con las patas colgando, escrutando el suelo antes de dejarse caer. La cabeza, ancha y con ojos amarillos muy frontales, le da un aire de lechuza.',
  s.identification_tips = 'Vientre y alas casi blancos vistos desde abajo
Se mantiene cerniéndose, algo raro en un águila tan grande
Cabeza ancha y ojos amarillos, aspecto de búho',
  s.seasonality = 'Primavera y verano (estival)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Aguila_culebrera_(Circaetus_gallicus).jpg?width=1280',
  s.image_attribution = 'Paco Gómez (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Circaetus gallicus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Carraca europea',
  s.primary_habitat = 'Campos abiertos con arbolado disperso, ribazos y construcciones con huecos',
  s.description = 'Del tamaño de una paloma y de un azul turquesa intenso que sorprende al levantar el vuelo. Caza al acecho desde cables y postes, dejándose caer sobre saltamontes y escarabajos. Cría en huecos de árboles viejos y de edificios, de ahí que dependa de que queden árboles añosos y ruinas en el campo.',
  s.identification_tips = 'Azul turquesa que solo se aprecia bien cuando vuela
Espalda de color canela que contrasta con el azul
Posada quieta en cables, oteando el suelo',
  s.seasonality = 'Primavera y verano (estival)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/European_roller.jpg?width=1280',
  s.image_attribution = 'Christian Svane (CC BY-SA 2.5) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Coracias garrulus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Halcón peregrino',
  s.primary_habitat = 'Cortados y áreas abiertas',
  s.description = 'Halcón robusto de alas puntiagudas y cola corta, capaz de superar los 300 km/h en el picado con que abate a otras aves en pleno vuelo. Se reconoce por la ancha bigotera negra que baja desde el ojo sobre un pecho claro y barrado.',
  s.identification_tips = 'Bigotera negra ancha bajo el ojo, como un casco
Silueta de ancla: alas puntiagudas y cola corta
Pecho claro con barrado fino en horizontal',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Falco_peregrinus_-_01.jpg?width=1280',
  s.image_attribution = 'Carlos Delgado (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Falco peregrinus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cernícalo vulgar',
  s.primary_habitat = 'Campos abiertos, matorral, cortados y también ciudades',
  s.description = 'El halcón más común y fácil de ver, gracias a su costumbre de cernirse: se queda suspendido en el aire batiendo las alas con la cabeza inmóvil, buscando ratones y lagartijas. El macho tiene la cabeza gris y el dorso rojizo con puntos negros; la hembra es más parda y barrada.',
  s.identification_tips = 'Se queda «clavado» en el aire cerniéndose
Dorso rojizo salpicado de puntos negros
Cola larga con una banda negra ancha en la punta',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Common_kestrel_falco_tinnunculus.jpg?width=1280',
  s.image_attribution = 'Andreas Trepte (CC BY-SA 2.5) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Falco tinnunculus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cogujada común',
  s.primary_habitat = 'Cultivos, caminos, eriales y bordes de poblado con suelo desnudo',
  s.description = 'Alondra parda de cresta alta y puntiaguda, muy ligada a caminos, cunetas y descampados junto a los pueblos. Camina en vez de saltar y, al volar, deja ver el forro rojizo de las alas y la cola con los bordes canela.',
  s.identification_tips = 'Cresta larga y puntiaguda, casi siempre erguida
Forro de las alas rojizo, visible al levantar el vuelo
Camina por el suelo en vez de saltar',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Crested_Lark_-_Qatar.jpg?width=1280',
  s.image_attribution = 'Ashraf Kotb (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Galerida cristata';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Cogujada montesina',
  s.primary_habitat = 'Matorral bajo, laderas pedregosas y eriales con vegetación rala',
  s.description = 'Cogujada de cresta puntiaguda, muy parecida a la común pero de pico más corto y grueso y con el pecho más nítidamente rayado. Prefiere el matorral y las laderas pedregosas, mientras que la común busca cultivos, caminos y bordes de pueblo.',
  s.identification_tips = 'Cresta alta y afilada, casi triangular
Pico más corto y romo que el de la cogujada común
Rayado del pecho bien definido, no difuminado',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Galerida_theklae_Madrid.jpg?width=1280',
  s.image_attribution = 'Adrian198cm (Public domain) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Galerida theklae';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Águila calzada',
  s.primary_habitat = 'Bosques y sierras con arbolado, cazando sobre zonas abiertas cercanas',
  s.description = 'Águila pequeña, del tamaño de un ratonero, con dos formas de plumaje muy distintas: una clara con el vientre blanco y otra oscura y uniforme. Nidifica en árboles dentro del bosque y caza en campo abierto lanzándose desde altura. Se identifica en vuelo por las «luces de posición»: dos manchas blancas en el arranque de las alas.',
  s.identification_tips = 'Dos manchas blancas donde el ala se une al cuerpo
Existen ejemplares claros y oscuros de la misma especie
Cola larga y recta, sin la muesca del milano',
  s.seasonality = 'Primavera y verano (estival); algunos ejemplares invernan',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Booted_eagle%2C_Hieraaetus_pennatus%2C_at_Kgalagadi_Transfrontier_Pa_(32334023348).jpg?width=1280',
  s.image_attribution = 'Derek Keats from Johannesburg, South Africa (CC BY 2.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Hieraaetus pennatus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Torcecuello euroasiático',
  s.primary_habitat = 'Bosques abiertos, sotos, huertos y arboledas con madera muerta',
  s.description = 'Pariente de los pájaros carpinteros que ni pica la madera ni trepa por los troncos: se posa de través en las ramas y come hormigas del suelo con una lengua larguísima. Su plumaje jaspeado en grises y pardos imita la corteza. Si se le molesta en el nido, retuerce el cuello como una culebra, de ahí su nombre.',
  s.identification_tips = 'Plumaje veteado como corteza, difícil de ver quieto
Se posa a lo largo de la rama, no agarrado al tronco
Franja oscura desde la nuca hasta la mitad de la espalda',
  s.seasonality = 'Paso migratorio e invernada',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Jinxtorquilla.jpg?width=1280',
  s.image_attribution = 'User:Aelwyn (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Jynx torquilla';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Abejaruco europeo',
  s.primary_habitat = 'Matorral termomediterráneo semiárido',
  s.description = 'Ave colorida y gregaria que caza abejas y libélulas en vuelo sobre espacios abiertos y cría en galerías excavadas en taludes terrosos.',
  s.identification_tips = 'Colorido inconfundible
Reclamo ''prruip'' en vuelo
Cría en taludes de rambla',
  s.seasonality = 'Primavera y verano (estival)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/%C5%9Eahl%C3%BBr-33.jpg?width=1280',
  s.image_attribution = 'Dûrzan cîrano (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Merops apiaster';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Papamoscas gris',
  s.primary_habitat = 'Arbolado abierto, bordes de bosque, huertos y jardines con perchas altas',
  s.description = 'Pájaro discreto de color pardo grisáceo, sin marcas llamativas, que se reconoce mejor por su conducta que por su aspecto: se posa muy erguido en una rama descubierta, sale disparado a cazar un insecto en el aire y vuelve exactamente a la misma percha. Repite la maniobra decenas de veces.',
  s.identification_tips = 'Vuelve siempre a la misma rama tras cada vuelo de caza
Postura muy vertical, con las alas caídas
Frente y pecho con un rayado fino y difuso',
  s.seasonality = 'Primavera y verano (estival)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/SpottedFlycatcheronfence.jpg?width=1280',
  s.image_attribution = 'Andrew Easton (Attribution) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Muscicapa striata';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Collalba rubia',
  s.primary_habitat = 'Laderas secas y pedregosas con matorral bajo y suelo desnudo',
  s.description = 'Collalba pequeña y contrastada: el macho es color arena claro con las alas negras y un antifaz o una garganta negros según la variedad. Como todas las collalbas, enseña al volar una cola blanca con una «T» negra invertida. Caza insectos lanzándose al suelo desde una piedra o una mata.',
  s.identification_tips = 'Cola blanca con una «T» negra al abrirse
Alas negras que resaltan sobre el cuerpo color arena
Se posa erguida en piedras y matas, muy visible',
  s.seasonality = 'Primavera y verano (estival)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Black-eared_Wheatear%2C_Punta_del_Sabinar%2C_Spain.jpg?width=1280',
  s.image_attribution = 'Vince Smith from London, United Kingdom (CC BY-SA 2.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Oenanthe hispanica';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Collalba negra',
  s.primary_habitat = 'Matorral litoral, laderas secas y roquedos',
  s.description = 'La mayor de las collalbas, enteramente negra salvo el obispillo y la base de la cola, blancos. Vive en cortados y laderas rocosas, donde construye junto al nido una plataforma de piedrecitas que acarrea una a una. Su canto es potente y melodioso.',
  s.identification_tips = 'Cuerpo negro con obispillo blanco muy contrastado
«T» negra invertida en la cola blanca al volar
Montoncitos de piedrecitas junto a la grieta del nido',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Black_Wheatear%2C_Isla_Plana_3.jpg?width=1280',
  s.image_attribution = 'Andrew Thomas from Shrewsbury, UK (CC BY-SA 2.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Oenanthe leucura';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Chova piquirroja',
  s.primary_habitat = 'Cortados rocosos, cantiles y montañas, alimentándose en pastizales cercanos',
  s.description = 'Córvido negro y brillante con el pico rojo, largo y curvo, y las patas del mismo color encendido. Vuela en grupos acrobáticos junto a los cantiles, plegando las alas y dejándose caer por puro juego. Busca larvas hurgando en el suelo de los pastos con ese pico de sonda.',
  s.identification_tips = 'Pico rojo, largo y curvado hacia abajo
Reclamo agudo, un «chiaa» nasal muy característico
Plumas de la punta del ala muy separadas, como dedos',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Pyrrhocorax_pyrrhocorax_-standing-8.jpg?width=1280',
  s.image_attribution = 'File:Alpenkrähe.jpg: "Malte Uhl (User:Zzzip)" derivative work: Snow… (CC BY-SA 2.5) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Pyrrhocorax pyrrhocorax';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Tórtola europea',
  s.primary_habitat = 'Sotos, arboledas y matorral alto junto a cultivos y ramblas',
  s.description = 'La más pequeña y grácil de nuestras palomas, con el dorso escamado en negro y canela y un parche a rayas blancas y negras en el cuello. Su arrullo ronco y adormecedor es uno de los sonidos del verano. Sus poblaciones han caído mucho en Europa por la pérdida de barbechos y setos.',
  s.identification_tips = 'Espalda escamada, como un mosaico canela y negro
Parche rayado blanco y negro a los lados del cuello
Arrullo ronco y vibrante, muy distinto al de la tórtola turca',
  s.seasonality = 'Primavera y verano (estival)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Streptopelia_turtur_Grlica0036.jpg?width=1280',
  s.image_attribution = 'Zrno at Serbian Wikipedia (Public domain) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Streptopelia turtur';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Abubilla',
  s.primary_habitat = 'Campos abiertos, dehesas, cultivos con arbolado y bordes de matorral',
  s.description = 'Ave inconfundible de color canela con alas y cola a franjas blancas y negras, y una cresta eréctil que despliega en abanico al posarse. Sondea el suelo blando con el pico largo y curvo en busca de larvas e insectos. Su canto, un «up-up-up» sordo y repetido, se oye de lejos en primavera.',
  s.identification_tips = 'Vuelo ondulante y torpe, como una mariposa grande
Cresta que abre en abanico justo al aterrizar
Camina por el suelo clavando el pico largo y curvo',
  s.seasonality = 'Todo el año en el sur peninsular; estival en el resto',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Wiedehopf_mit_Puppe_als_Futter.jpg?width=1280',
  s.image_attribution = 'Sven Damerow (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Upupa epops';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Bisbita campestre',
  s.primary_habitat = 'Llanos secos, pastizales ralos y claros pedregosos con poca vegetación',
  s.description = 'Bisbita grande, esbelto y de tonos arena, con muy poco rayado en el pecho comparado con sus parientes. Camina por el suelo desnudo moviendo la cola arriba y abajo. Anida entre piedras y matas bajas, y su canto es una frase corta y monótona que emite en vuelo.',
  s.identification_tips = 'Pecho casi liso, sin el rayado denso de otros bisbitas
Camina en vez de saltar, meneando la cola
Ceja clara marcada y patas largas y pálidas',
  s.seasonality = 'Primavera y verano (estival)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/AnthusCampestris_cropped.jpg?width=1280',
  s.image_attribution = 'AnthusCampestris.jpg: Lip Kee derivative work: Bogbumper (talk) (CC BY-SA 2.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Anthus campestris';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Bisbita alpino',
  s.primary_habitat = 'Pastos de montaña en verano; orillas, ramblas y encharcados en invierno',
  s.description = 'Bisbita robusto de patas oscuras que cría en la alta montaña y en invierno baja a orillas de agua y campos húmedos. En plumaje nupcial adquiere un pecho rosado y sin rayas; en invierno queda pardo grisáceo con el pecho listado.',
  s.identification_tips = 'Patas oscuras, no rosadas como en otros bisbitas
Ceja blanca clara sobre el ojo
En invierno, casi siempre junto a agua o suelo húmedo',
  s.seasonality = 'Otoño e invierno fuera de la alta montaña',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Anthus_spinoletta.jpg?width=1280',
  s.image_attribution = 'Original uploader was Marboline at pl.wikipedia (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Anthus spinoletta';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Busardo ratonero',
  s.primary_habitat = 'Mosaicos de bosque y campo abierto, con arbolado para nidificar',
  s.description = 'La rapaz mediana más frecuente y variable de plumaje: los hay casi blancos y casi negros. Pasa mucho tiempo posado en postes y en el suelo, y planea en círculos con las alas ligeramente levantadas. Su reclamo es un maullido lastimero muy reconocible.',
  s.identification_tips = 'Planea en círculos con las alas en «V» poco marcada
Maullido agudo y quejumbroso al volar
Muy variable: desde ejemplares claros a muy oscuros',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Buizerd-rh_20091021_002_(cropped).jpg?width=1280',
  s.image_attribution = 'RonaldHuijssen (CC BY-SA 3.0 nl) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Buteo buteo';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Chotacabras europeo',
  s.primary_habitat = 'Claros de bosque, brezales y matorral con suelo desnudo',
  s.description = 'Ave nocturna de plumaje jaspeado que descansa de día tumbada a lo largo de una rama o en el suelo, confundida con la corteza. Caza polillas al vuelo con la boca enorme. Su canto es un ronroneo continuo y mecánico que puede durar minutos sin pausa.',
  s.identification_tips = 'Canto como un motor lejano, continuo y vibrante
Vuela al anochecer con giros silenciosos y bruscos
El macho muestra manchas blancas en alas y cola',
  s.seasonality = 'Primavera y verano (estival)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Nachtzwaluw_-_European_nightjar_-_Caprimulgus_europaeus_2.jpg?width=1280',
  s.image_attribution = 'Bouke ten Cate (CC BY 4.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Caprimulgus europaeus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Agateador común',
  s.primary_habitat = 'Bosques y arboledas con troncos gruesos y corteza resquebrajada',
  s.description = 'Pájaro diminuto y críptico que sube por los troncos en espiral, apoyándose en la cola rígida, y baja volando a la base del árbol siguiente para empezar de nuevo. Extrae insectos de las grietas de la corteza con un pico fino y curvado.',
  s.identification_tips = 'Trepa siempre hacia arriba, nunca cabeza abajo
Dorso jaspeado como corteza y vientre blanco
Pico fino y curvo, como una aguja doblada',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Short-toed_Treecreeper_(Certhia_brachydactyla)_(cropped_version).jpg?width=1280',
  s.image_attribution = 'Short-toed_Treecreeper_(Certhia_brachydactyla).jpg: א (Aleph) deriv… (CC BY-SA 2.5) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Certhia brachydactyla';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Aguilucho cenizo',
  s.primary_habitat = 'Cerealistas, herbazales y matorral bajo en zonas llanas',
  s.description = 'Aguilucho grácil y de alas largas y estrechas que patrulla a poca altura, basculando con el viento y con las alas en «V». El macho es gris ceniza con las puntas negras; la hembra, parda y listada, con un obispillo blanco. Cría en el suelo, entre la vegetación.',
  s.identification_tips = 'Vuelo bajo y balanceante, con las alas en «V»
Macho gris ceniza con una barra negra en el ala
Alas muy largas y estrechas en proporción al cuerpo',
  s.seasonality = 'Primavera y verano (estival)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Flickr_-_don_macauley_-_Bird_015.jpg?width=1280',
  s.image_attribution = 'Donald Macauley (CC BY-SA 2.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Circus pygargus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Codorniz común',
  s.primary_habitat = 'Cereales, herbazales altos y pastizales densos',
  s.description = 'La más pequeña de nuestras gallináceas y la única migradora. Es mucho más fácil de oír que de ver: su canto trisilábico —el clásico «pal-pa-lá»— se emite desde el interior del cereal. Solo levanta el vuelo cuando se la pisa casi encima, y lo hace en línea recta y rasante.',
  s.identification_tips = 'Canto trisilábico repetido desde dentro del herbazal
Vuela raso y en línea recta al levantarse
Del tamaño de un puño, mucho menor que una perdiz',
  s.seasonality = 'Primavera y verano (estival)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Quaglia.jpg?width=1280',
  s.image_attribution = 'Raniero Massoli Novelli (CC BY 2.0) · Wikimedia Commons',
  s.rarity_score = 1
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Coturnix coturnix';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Esmerejón',
  s.primary_habitat = 'Llanos abiertos, marismas y pastizales durante la invernada',
  s.description = 'El halcón más pequeño de Europa, poco mayor que un mirlo, con vuelo rápido y bajo pegado al terreno para sorprender a pequeñas aves. El macho es gris azulado por encima; la hembra, parda. No se ciñe como el cernícalo: siempre está en movimiento.',
  s.identification_tips = 'Muy pequeño y compacto, con aleteo rápido
Vuela bajo y en línea recta, casi rozando el suelo
Sin bigotera marcada, a diferencia del peregrino',
  s.seasonality = 'Otoño e invierno',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Falco_columbarius_Male.jpg?width=1280',
  s.image_attribution = 'Raj Boora from Edmonton, Canada (CC BY 2.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Falco columbarius';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Alcotán',
  s.primary_habitat = 'Campo abierto con arbolado disperso, cerca de zonas húmedas',
  s.description = 'Halcón esbelto con silueta de vencejo gigante: alas muy largas y afiladas y cola corta. Caza libélulas e incluso vencejos en pleno vuelo, con una agilidad extraordinaria. Los adultos tienen los «calzones» y la zona anal de un rojo ladrillo característico.',
  s.identification_tips = 'Silueta de hoz, como un vencejo enorme
Calzones y bajo vientre rojizos en el adulto
Bigotera negra ancha sobre garganta blanca',
  s.seasonality = 'Primavera y verano (estival)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Hobby_-_Falco_subbuteo.jpg?width=1280',
  s.image_attribution = 'Andy Morffew from Itchen Abbas, Hampshire, UK (CC BY 2.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Falco subbuteo';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Pimientera',
  s.primary_habitat = 'Bosques, arboledas, huertos y jardines con arbolado',
  s.description = 'Uno de los pájaros más abundantes de Europa. El macho luce el pecho vinoso y la nuca gris azulada; la hembra es parda. Ambos comparten dos barras alares blancas muy visibles en vuelo. Su canto es una frase descendente que acaba en un floreo, repetida sin descanso en primavera.',
  s.identification_tips = 'Dos barras blancas bien marcadas en cada ala
Bordes blancos en la cola, visibles al volar
Canto en frase descendente que remata en un adorno',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Fringilla_coelebs_(chaffinch)%2C_male.jpg?width=1280',
  s.image_attribution = 'Self: Commons user MichaelMaggs (CC BY-SA 2.5) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Fringilla coelebs';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Buitre común',
  s.primary_habitat = 'Sierras con cortados para criar; se alimenta en campo abierto',
  s.description = 'Buitre grande y pardo, con la cabeza y el cuello cubiertos de plumón blanco y una gorguera de plumas en la base del cuello. Planea horas sin batir las alas aprovechando las térmicas, y localiza los cadáveres vigilando lo que hacen los demás buitres a kilómetros de distancia.',
  s.identification_tips = 'Alas enormes y rectangulares, con los «dedos» separados
Cabeza pálida y pequeña en proporción al cuerpo
Planea en círculos sin apenas batir las alas',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Vulture_beak_sideview_A.jpg?width=1280',
  s.image_attribution = 'Thermos (CC BY-SA 2.5) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Gyps fulvus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Piquituerto',
  s.primary_habitat = 'Pinares y masas de coníferas con producción de piñas',
  s.description = 'Fringílido de pico único: las dos mandíbulas se cruzan en la punta, una herramienta para abrir las escamas de las piñas y sacar el piñón. El macho es rojo ladrillo y la hembra verde oliva. Cría incluso en invierno si hay piñas, y se mueve en bandos ruidosos de copa en copa.',
  s.identification_tips = 'Puntas del pico cruzadas, visibles de cerca
Macho rojizo, hembra verde amarillenta
Reclamo metálico «chip-chip» de los bandos en vuelo',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Red_Crossbills_(Male).jpg?width=1280',
  s.image_attribution = 'Elaine R. Wilson, www.naturespicsonline.com (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Loxia curvirostra';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Alondra totovía',
  s.primary_habitat = 'Claros de bosque, dehesas y laderas con matorral y árboles dispersos',
  s.description = 'Alondra pequeña de cola muy corta y cresta discreta, con una ceja blanca ancha que se une en la nuca. Canta en vuelo circular, sobre todo al amanecer y en noches claras, con una frase melancólica y descendente de una belleza reconocida.',
  s.identification_tips = 'Cola muy corta, silueta rechoncha en vuelo
Cejas blancas que se juntan por detrás de la cabeza
Marca blanca y negra en el borde delantero del ala',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Lullula_arborea.jpg?width=1280',
  s.image_attribution = 'autor no indicado (Public domain) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Lullula arborea';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Roquero rojo',
  s.primary_habitat = 'Pastos y roquedos de montaña por encima del bosque',
  s.description = 'El macho en primavera es de los pájaros más vistosos de la montaña: cabeza azul, pecho naranja y una mancha blanca en la espalda. La hembra es parda y escamada. Ambos comparten la cola rojiza que destaca al volar. Es esquivo y suele verse a distancia sobre una roca.',
  s.identification_tips = 'Cola rojo anaranjado, llamativa en vuelo
Macho con cabeza azul y pecho naranja
Mancha blanca en la espalda del macho',
  s.seasonality = 'Primavera y verano (estival)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Monsax.jpg?width=1280',
  s.image_attribution = 'Pierre Dalous (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Monticola saxatilis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Collalba gris',
  s.primary_habitat = 'Pastizales pedregosos, canchales y zonas abiertas de montaña',
  s.description = 'Collalba de dorso gris en el macho, con antifaz negro y alas oscuras. Como todas las collalbas, delata su identidad al volar: obispillo blanco y cola blanca con una «T» negra invertida. Se posa erguida en piedras y hace carreras cortas por el suelo.',
  s.identification_tips = 'Obispillo blanco y «T» negra en la cola
Macho con antifaz negro y dorso gris
Carreras cortas por el suelo entre piedra y piedra',
  s.seasonality = 'Paso migratorio y cría en montaña',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Oenanthe_oenanthe_Larvik.JPG?width=1280',
  s.image_attribution = 'Arnstein Rønning (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Oenanthe oenanthe';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Autillo',
  s.primary_habitat = 'Arboledas, sotos, huertos y parques con árboles viejos',
  s.description = 'El búho más pequeño de Europa, apenas mayor que un puño, con un plumaje jaspeado que lo hace invisible pegado a un tronco. Se detecta por el oído: un silbido monótono y flautado que repite cada dos o tres segundos durante toda la noche de primavera.',
  s.identification_tips = 'Silbido corto y flautado repetido de forma monótona
Diminuto, con dos penachos de plumas en la cabeza
Plumaje veteado que imita la corteza',
  s.seasonality = 'Primavera y verano (estival)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Scops_Owl_(Otus_scops)%2C_Kalloni%2C_Lesvos%2C_Greece%2C_19.04.2015_(16773748434).jpg?width=1280',
  s.image_attribution = 'Frank Vassen from Brussels, Belgium (CC BY 2.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Otus scops';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Colirrojo real',
  s.primary_habitat = 'Bosques abiertos, sotos y arboledas con huecos para criar',
  s.description = 'Pájaro elegante con la cola de un naranja encendido que hace vibrar sin parar al posarse. El macho tiene la garganta negra, la frente blanca y el pecho anaranjado; la hembra es parda pero conserva la misma cola vibrante, que es la mejor pista para identificarlos.',
  s.identification_tips = 'Cola naranja que tiembla constantemente
Macho con frente blanca y garganta negra
Se posa en ramas bajas y baja al suelo a por insectos',
  s.seasonality = 'Paso migratorio',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Common_Redstart_-_Segrate_-_Italy_S4E2518-1_(19357313382).jpg?width=1280',
  s.image_attribution = 'Francesco Veronesi from Italy (CC BY-SA 2.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Phoenicurus phoenicurus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Acentor alpino',
  s.primary_habitat = 'Roquedos y pedreras de alta montaña; en invierno baja a cortados',
  s.description = 'Pájaro robusto de montaña, pardo y discreto salvo por dos detalles: los flancos con listas castañas y una garganta blanca finamente moteada de negro. Camina entre las rocas buscando insectos y semillas, y en invierno desciende a cortados y construcciones.',
  s.identification_tips = 'Flancos con anchas listas castañas
Garganta blanca con motas negras, como un babero
Base del pico amarilla',
  s.seasonality = 'Otoño e invierno en cotas bajas',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Alpine_accentor_saganta.jpg?width=1280',
  s.image_attribution = 'Paco Gómez from Castellón, Spain (CC BY-SA 2.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Prunella collaris';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Curruca rabilarga',
  s.primary_habitat = 'Matorral bajo y denso, jarales, brezales y tomillares',
  s.description = 'Curruca pequeña, oscura y de cola muy larga que suele llevar levantada. El macho tiene el vientre vinoso y el ojo rojo rodeado de un anillo del mismo color. Es muy inquieta y rara vez se deja ver más de unos segundos antes de volver a hundirse en la mata.',
  s.identification_tips = 'Cola larga y erguida, casi vertical al posarse
Ojo y anillo ocular rojos
Vientre de color vinoso, con motitas blancas en la garganta',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Fauvette_pitchou_Ichkeul_NP.jpg?width=1280',
  s.image_attribution = 'El Golli Mohamed (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Curruca undata';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Mirlo capiblanco',
  s.primary_habitat = 'Montaña con matorral y pastos; en paso, sierras con enebros y bayas',
  s.description = 'Mirlo de montaña que se distingue del común por una banda blanca en forma de media luna sobre el pecho y por las plumas del ala ribeteadas de claro, que dan un aspecto escamado. Es muy desconfiado y se aleja en cuanto detecta movimiento.',
  s.identification_tips = 'Media luna blanca en el pecho
Alas con aspecto escamado y plateado
Mucho más esquivo que el mirlo común',
  s.seasonality = 'Paso migratorio e invernada en montaña',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/2015-04-20_Turdus_torquatus_torquatus_Cairngorm_3.jpg?width=1280',
  s.image_attribution = 'MPF (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Turdus torquatus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Alcaudón real',
  s.primary_habitat = 'Campo abierto con matorral disperso, cables y posaderos altos',
  s.description = 'Alcaudón grande, gris por encima y con un antifaz negro que le cruza el ojo. Caza al acecho desde un posadero alto y tiene la costumbre de empalar sus presas —insectos, lagartijas, ratones— en espinas y alambres, formando pequeñas despensas.',
  s.identification_tips = 'Antifaz negro sobre fondo gris claro
Siempre en lo alto de un cable, poste o mata
Presas empaladas en espinos cerca de su territorio',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/S%C3%BCdlicher-Raubw%C3%BCrger_2018-01-07_0003.jpg?width=1280',
  s.image_attribution = 'Andreas Trepte (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Lanius meridionalis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Curruca tomillera',
  s.primary_habitat = 'Matorral bajo y abierto, tomillares y saladares con arbustos dispersos',
  s.description = 'Curruca menuda de matorral raso, gris en la cabeza, parda en el dorso y con las plumas del ala ribeteadas de castaño encendido. El anillo blanco del ojo le da el aire de «gafas» que le da nombre. Es inquieta y suele delatarse por su reclamo antes de dejarse ver.',
  s.identification_tips = 'Anillo blanco alrededor del ojo bien marcado
Panel castaño vivo en el ala plegada
Vive en matorral muy bajo, no en arbolado',
  s.seasonality = 'Todo el año en el sureste; parcialmente migradora',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Fauvette_%C3%A0_lunettes_Aqueduc_de_Zaghouan.jpg?width=1280',
  s.image_attribution = 'El Golli Mohamed (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Curruca conspicillata';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Tarabilla europea',
  s.primary_habitat = 'Matorral bajo, herbazales, ribazos y bordes de cultivo con posaderos',
  s.description = 'Pájaro pequeño y regordete que se posa en lo alto de las matas, muy erguido y a la vista, para lanzarse al suelo a por insectos. El macho tiene la cabeza negra, un collar blanco a los lados y el pecho naranja. Su reclamo suena como dos piedras golpeadas, de donde le viene el nombre.',
  s.identification_tips = 'Siempre en lo alto de una mata, bien visible
Macho con capucha negra y medio collar blanco
Reclamo como el chasquido de dos cantos rodados',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Malestonechatseaham_Cropped.jpg?width=1280',
  s.image_attribution = 'derivative work: Myosotis Scorpioides (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Saxicola rubicola';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Murciélago mediano de herradura',
  s.primary_habitat = 'Cuevas cálidas del ámbito mediterráneo; caza en matorral y bosque abierto',
  s.description = 'Murciélago de herradura mediterráneo, uno de los más escasos y amenazados de Europa. Se reconoce por un antifaz oscuro alrededor de los ojos y por el contraste neto entre el dorso pardo grisáceo y el vientre casi blanco. Depende por completo de un puñado de cuevas.',
  s.identification_tips = 'Antifaz oscuro marcado alrededor de los ojos
Contraste fuerte entre dorso gris pardo y vientre blanquecino
Hoja nasal ancha en la base que se estrecha de golpe',
  s.seasonality = 'Todo el año (hiberna en invierno)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Rhinolophus_mehelyi-cropped.jpg?width=1280',
  s.image_attribution = 'F. C. Robiller / naturlichter.de (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Rhinolophus mehelyi';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Murciélago de cueva',
  s.primary_habitat = 'Cuevas y minas; caza en vuelo alto sobre bosque, campo y láminas de agua',
  s.description = 'Murciélago de alas largas y estrechas y vuelo rápido y alto, casi como el de un vencejo. Tiene la frente muy abombada y el pelo corto y erizado en la cabeza. Recorre decenas de kilómetros entre las cuevas de cría, de tránsito y de invernada.',
  s.identification_tips = 'Frente muy abombada y pelo corto y de punta
Alas largas y estrechas; vuelo veloz y alto
Forma colonias enormes y muy apretadas en cueva',
  s.seasonality = 'Todo el año, con desplazamientos estacionales entre cuevas',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Miniopterus_schreibersii_dasythrix.jpg?width=1280',
  s.image_attribution = 'Andrew Smith (Public domain) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Miniopterus schreibersii';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Murciélago ratonero mediano',
  s.primary_habitat = 'Cuevas y desvanes; caza saltamontes en pastizales y herbazales',
  s.description = 'Casi idéntico al ratonero grande, con el que a menudo comparte colonia, pero algo menor y con el hocico más estrecho y una mancha clara en la frente. Está especializado en cazar saltamontes en pastizales altos, lo que reparte el alimento entre ambas especies.',
  s.identification_tips = 'Muy parecido al ratonero grande, pero algo menor
Mancha clara difusa entre los ojos
Hocico más fino y estrecho',
  s.seasonality = 'Todo el año (hiberna en invierno)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Myotis-blythii-cropped.jpg?width=1280',
  s.image_attribution = 'C. Robiller / www.naturlichter.de (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Myotis blythii';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Murciélago patudo',
  s.primary_habitat = 'Cuevas próximas a ríos y balsas; caza rozando la lámina de agua',
  s.description = 'Murciélago ligado al agua: caza volando a pocos centímetros de la superficie de ríos y balsas y captura insectos —e incluso pececillos— con sus pies desproporcionadamente grandes y peludos. Esa dependencia del agua limpia lo hace muy vulnerable.',
  s.identification_tips = 'Pies muy grandes y peludos en proporción al cuerpo
Vuela rozando la lámina de agua
Membrana del ala insertada en el tobillo, no en el dedo',
  s.seasonality = 'Todo el año (hiberna en invierno)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Myotis_capaccinii_0105b_cropped.jpg?width=1280',
  s.image_attribution = 'This image was improved or created by the Wikigraphists of the Grap… (FAL) · Wikimedia Commons',
  s.rarity_score = 4
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Myotis capaccinii';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Murciélago de Geoffroy o de oreja partida',
  s.primary_habitat = 'Cuevas y desvanes; caza arañas e insectos en el follaje de bosques y sotos',
  s.description = 'Murciélago de pelaje lanoso y rojizo, con una escotadura muy marcada en el borde de la oreja que le da nombre. Recoge sus presas directamente del follaje y de las paredes, cerniéndose frente a ellas, en vez de capturarlas en pleno vuelo.',
  s.identification_tips = 'Muesca clara en el borde externo de la oreja
Pelaje lanoso y de tono rojizo
Se ciñe frente a hojas y muros para capturar arañas',
  s.seasonality = 'Todo el año (hiberna en invierno)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Myotis_emarginatus.jpg?width=1280',
  s.image_attribution = 'Rémi Bigonneau (CC BY 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Myotis emarginatus';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Murciélago ratonero grande',
  s.primary_habitat = 'Cuevas y desvanes; caza escarabajos en pastos, claros y bosque sin sotobosque',
  s.description = 'Uno de los murciélagos más grandes de Europa, con orejas largas y anchas y hocico de aspecto perruno. Caza cerca del suelo, capturando escarabajos que localiza por el ruido que hacen al andar, no solo con el sonar. Cría en colonias numerosas en cuevas y bajo cubiertas.',
  s.identification_tips = 'Talla grande y orejas largas y anchas
Hocico ancho, de aspecto casi perruno
Caza a ras de suelo, en zonas despejadas',
  s.seasonality = 'Todo el año (hiberna en invierno)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Myotis.jpg?width=1280',
  s.image_attribution = 'Urheber: Manuel Werner, Germany, Wikipedia-Kontakt: http://de.wikip… (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Myotis myotis';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Murciélago de herradura mediterráneo',
  s.primary_habitat = 'Cuevas cálidas; caza en bosque mediterráneo y mosaicos arbolados',
  s.description = 'Murciélago de herradura de tamaño medio, de costumbres muy cavernícolas, que forma colonias de cría densas junto a otras especies. Vuela muy pegado a la vegetación, capturando polillas entre las ramas. Sus colonias son muy vulnerables a la visita de cuevas en primavera.',
  s.identification_tips = 'Talla intermedia entre el grande y el pequeño de herradura
Apéndice superior de la nariz apuntado y algo curvado
Forma colonias apretadas en cueva, con otras especies',
  s.seasonality = 'Todo el año (hiberna en invierno)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Rhinolophus_euryale-cropped.jpg?width=1280',
  s.image_attribution = 'Carlosblh (CC BY 3.0) · Wikimedia Commons',
  s.rarity_score = 3
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Rhinolophus euryale';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Murciélago grande de herradura',
  s.primary_habitat = 'Cuevas, minas y desvanes para refugiarse; caza en mosaicos de bosque y pasto',
  s.description = 'El mayor de los murciélagos de herradura ibéricos. Debe el nombre a la hoja nasal en forma de herradura con la que emite el sonar por la nariz, no por la boca. Al reposar se envuelve por completo en las alas, como en una capa, y cuelga libre del techo.',
  s.identification_tips = 'Al dormir se envuelve entero en las alas
Hoja nasal en forma de herradura alrededor de las fosas
Cuelga separado del techo, no metido en una grieta',
  s.seasonality = 'Todo el año (hiberna en invierno)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Grand_Rhinolophe_2.jpg?width=1280',
  s.image_attribution = 'Marie Jullion (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Rhinolophus ferrumequinum';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Murciélago pequeño de herradura',
  s.primary_habitat = 'Cuevas, minas y edificios; caza en bosque, sotos y setos',
  s.description = 'El más pequeño de los murciélagos de herradura europeos: colgado y envuelto en sus alas no llega al tamaño de una ciruela. Vuela bajo y muy cerca de la vegetación, con revoloteo de mariposa. Es muy sensible a las molestias en sus refugios de cría e invernada.',
  s.identification_tips = 'Tamaño minúsculo, como una ciruela colgando
Vuelo bajo y revoloteante junto a setos y muros
Se envuelve en las alas al reposar, como sus parientes',
  s.seasonality = 'Todo el año (hiberna en invierno)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Kleine_Hufeisennase.jpg?width=1280',
  s.image_attribution = 'F. C. Robiller / naturlichter.de (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Rhinolophus hipposideros';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Galápago leproso',
  s.primary_habitat = 'Ríos, charcas, balsas y tramos remansados con vegetación y soleaderos',
  s.description = 'Galápago de agua con el caparazón aplanado y de color verde oliva a pardo, a menudo cubierto de algas. Los ejemplares jóvenes muestran manchas anaranjadas en el cuello y en los lados de la cabeza que se van apagando con la edad. Toma el sol sobre piedras y troncos y se lanza al agua al menor ruido.',
  s.identification_tips = 'Manchas anaranjadas en el cuello, más vivas de joven
Caparazón bajo y aplanado, a menudo con algas
Se tira al agua en cuanto detecta movimiento en la orilla',
  s.seasonality = 'Primavera a otoño (inactivo en invierno)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Mauremys_leprosa_03_by-dpc.jpg?width=1280',
  s.image_attribution = 'David Perez (CC BY 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Mauremys leprosa';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Calandria común',
  s.primary_habitat = 'Llanos cerealistas, pastizales y estepas de suelo profundo',
  s.description = 'La mayor de las alondras ibéricas, robusta y de pico grueso, con una mancha negra muy marcada a cada lado del cuello. Canta en vuelo, describiendo círculos altos con un torrente de notas en el que imita a otras aves. En invierno forma bandos numerosos en los llanos.',
  s.identification_tips = 'Babero negro a cada lado del cuello
Borde trasero del ala blanco y visible en vuelo
Pico grueso y pálido, de granívora',
  s.seasonality = 'Todo el año',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Melanocorypha_calandra.jpg?width=1280',
  s.image_attribution = 'Bereşe.jpg: Dûrzan cîrano derivative work: Osado (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Melanocorypha calandra';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Treparriscos',
  s.primary_habitat = 'Paredes rocosas, cantiles y barrancos; en invierno baja a roquedos y edificios',
  s.description = 'Pájaro de alta montaña que trepa por paredes verticales agitando las alas como una mariposa gigante, mostrando unos vistosos paneles rojos. Extrae insectos de las grietas con un pico largo y fino. En invierno desciende y puede aparecer en cortados bajos, castillos y presas.',
  s.identification_tips = 'Manchas rojo carmín en las alas al abrirlas
Trepa por la roca a saltos, aleteando sin parar
Pico largo, fino y algo curvado',
  s.seasonality = 'Otoño e invierno fuera de la alta montaña',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Tichodroma_muraria02_cropped.jpg?width=1280',
  s.image_attribution = 'derivative work: Hämbörger (talk) Tichodroma_muraria02.jpg: User:Kulac (CC BY-SA 3.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Tichodroma muraria';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Tarabilla norteña',
  s.primary_habitat = 'Herbazales, prados altos y cultivos con tallos donde posarse',
  s.description = 'Tarabilla migradora que solo se ve en los pasos. Se distingue de la europea por una ceja blanca ancha y muy marcada y por las bases blancas de la cola. Como su parienta, se posa en lo alto de tallos y matas y baja al suelo a cazar insectos.',
  s.identification_tips = 'Ceja blanca ancha y bien marcada
Base de la cola blanca a ambos lados
Pecho anaranjado que va difuminándose hacia el vientre',
  s.seasonality = 'Paso migratorio',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Saxicola_rubetra_poklaskwa_AM.jpg?width=1280',
  s.image_attribution = 'Artur Mikołajewski (CC BY 2.5) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Saxicola rubetra';

UPDATE species s JOIN parks p ON p.id = s.park_id SET
  s.common_name = 'Curruca carrasqueña',
  s.primary_habitat = 'Matorral alto, jarales, encinares aclarados y bordes de bosque',
  s.description = 'Curruca de tamaño medio, con el macho de dorso gris, garganta y pecho color teja y un bigote blanco muy nítido que separa ambos. El anillo ocular es rojo. Canta desde el interior del matorral y hace vuelos cortos de exhibición sobre las matas.',
  s.identification_tips = 'Bigote blanco que bordea la garganta rojiza
Anillo ocular rojo anaranjado
Prefiere matorral alto, no el raso',
  s.seasonality = 'Primavera y verano (estival)',
  s.image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/%CE%9A%CE%BF%CE%BA%CE%BA%CE%B9%CE%BD%CE%BF%CF%84%CF%83%CE%B9%CF%81%CE%BF%CE%B2%CE%AC%CE%BA%CE%BF%CF%82.jpg?width=1280',
  s.image_attribution = 'Antonios Tsaknakis (CC BY-SA 4.0) · Wikimedia Commons',
  s.rarity_score = 2
WHERE p.slug = 'sierra-espuna' AND s.scientific_name = 'Curruca cantillans';
