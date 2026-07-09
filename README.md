# NaturDex

NaturDex es un prototipo de guía virtual para identificar, catalogar e informar sobre especies vegetales y animales en parques naturales y nacionales de España.

El primer parque piloto es el Parque Regional de Cabo Cope y Puntas de Calnegre, en la Región de Murcia. La app está planteada como una experiencia tipo pokédex: mapa, catálogo, filtros, fichas de especie, hábitats y puntos de observación.

## Objetivo del prototipo

- Validar una experiencia profesional de exploración en campo.
- Estructurar los datos para escalar a otros parques españoles.
- Separar parque, hábitat, especie y observación para que el modelo crezca sin rehacer la base.
- Empezar con datos semilla de Cabo Cope y sustituirlos progresivamente por fuentes verificadas.

## Estructura

- `Frontend/index.html`: interfaz principal del prototipo.
- `Frontend/Css/styles.css`: diseño responsive de la experiencia NaturDex.
- `Frontend/Js/app.js`: mapa, filtros, catálogo, ficha de especie y progreso tipo pokédex.
- `Frontend/Data/cabo-cope.json`: datos semilla del parque piloto (respaldo sin backend).
- `Frontend/Data/geo/`: geometría del mapa en GeoJSON (límite del parque y hábitats) + su README con el flujo de sustitución por cartografía real de QGIS.
- `Frontend/Img/species/`: fotografías locales de especies (servidas desde el propio proyecto, no hotlinkeadas).
- `Backend/Api/parks.php`: endpoint de parques.
- `Backend/Api/species.php`: endpoint agregado para parque, hábitats, puntos de interés y especies.
- `Backend/Api/progress.php`: endpoint GET/POST para marcar especies y puntos de interés como vistos (persistido en `Backend/Data/progress.json`).
- `Database/schema.sql`: modelo escalable (parques, hábitats, especies, puntos de interés, observaciones, relación muchos-a-muchos especie-hábitat).

## Catálogo de datos

El catálogo incluye 78 especies (34 fauna, 44 flora), 21 hábitats de interés comunitario (Directiva 92/43/CEE) y 6 puntos de interés del Parque Regional de Cabo Cope y Puntas de Calnegre. Cada especie incluye:

- Taxonomía completa (reino, filo/división, clase, orden, familia, género).
- Estado de conservación en tres escalas: **UICN (evaluación global)**, **España** (Catálogo Español de Especies Amenazadas / Lista Roja de la Flora Vascular Española 2008 para flora) y **Región de Murcia** (Catálogo Regional de Especies Amenazadas de la Fauna Silvestre / Catálogo Regional de Flora Silvestre Protegida, Decreto 50/2003).
- Un campo `source`/`fuente` con la referencia usada.

Fuentes consultadas:

- Región de Murcia Digital (CARM) - Cabo Cope y Puntas de Calnegre (Características, Flora, Fauna): https://www.regmurcia.com
- Wikipedia "Parque regional de Cabo Cope y Puntas de Calnegre", con referencias a MITECO y Red Natura 2000 (LIC ES6200012 Calnegre / LIC ES6200031 Cabo Cope).
- Universidad de Murcia, revista *Eubacteria* nº5 - Alcaraz Ariza, F.J. "La Marina de Cope: ¿los últimos días de un paraíso botánico?" (fuente principal para las especies de flora añadidas en esta ronda, específica del parque).
- Decreto 50/2003 (BORM), Catálogo Regional de Flora Silvestre Protegida de la Región de Murcia; base científica: Sánchez Gómez, P. et al. 2002, *Libro Rojo de la Flora Silvestre Protegida de la Región de Murcia*.
- Lista Roja 2008 de la Flora Vascular Española (MITECO / SEBiCoP, listaroja.conservacionvegetal.org).
- IUCN Red List of Threatened Species (evaluación global) - iucnredlist.org.
- Baraza Martínez, F. 1999. "Los hábitats comunitarios en la Región de Murcia", DGMN-CARM.

Este catálogo es un punto de partida para el prototipo: los datos deben contrastarse en campo y con las fuentes primarias (PORN/PRUG del parque, inventarios oficiales de la CARM y el MITECO) antes de un uso definitivo. Muchas especies añadidas no tienen todavía fotografía; el frontend muestra un icono de marcador de posición hasta incorporar imágenes con licencia confirmada.

### Fotografías de flora (florasilvestre.es)

Se han incorporado **13 fotografías de especies vegetales** descargadas de [florasilvestre.es](https://www.florasilvestre.es/mediterranea/sudeste.htm) (galería de flora del sureste ibérico), coincidencias exactas por nombre científico: *Allium melananthum*, *Caralluma europaea*, *Citrullus colocynthis*, *Cynomorium coccineum*, *Lafuentea rotundifolia*, *Lavandula multifida*, *Limonium insigne*, *Lycium intricatum*, *Maytenus senegalensis* subsp. *europaea*, *Notoceras bicorne*, *Salsola papillosa*, *Senecio flavus* y *Teucrium freynii*. Consideraciones:

- Las imágenes se guardan **localmente** en `Frontend/Img/species/` y se sirven desde el propio proyecto (no se hotlinkea, porque el sitio verifica el *referer*). Cada ficha lleva la atribución `Foto: florasilvestre.es` en su campo `source`.
- Solo se usaron **coincidencias exactas de género + especie**; no se sustituyó ninguna especie por la foto de otra afín del mismo género (evita identificaciones erróneas). Por eso el resto de la flora del sitio no se incorporó.
- **Aviso de licencia**: las fotos son propiedad de florasilvestre.es y se usan aquí solo en el contexto de este prototipo educativo. Antes de cualquier uso público/definitivo hay que **confirmar la licencia o el permiso con el autor del sitio**, o sustituirlas por imágenes de licencia libre (p. ej. Wikimedia Commons).

### Especies marcadas para revisión personal

De las 11 especies marcadas inicialmente como "a revisar", una ronda de investigación adicional (fuentes oficiales y bibliográficas) permitió resolver 5 con confianza razonable; se les quitó el campo `reviewNote`/`review_note` y su fuente quedó ampliada con la referencia que resuelve la duda:

- **Águila perdicera** (*Aquila fasciata*) - confirmado: la Ley 7/1995 de Fauna Silvestre de la Región de Murcia (Anexo I) la cataloga "en peligro de extinción" a nivel regional, coincidiendo con el dato ya presente en el catálogo.
- **Curruca cabecinegra** (*Curruca melanocephala*) - confirmado: el género *Curruca* (en vez de *Sylvia*) es el estándar taxonómico vigente según la IOC World Bird List.
- **Pardela cenicienta** (*Calonectris diomedea*) - confirmado: no hay colonia reproductora conocida en Cabo Cope; la única colonia murciana documentada está en la Isla de las Palomas (San Pedro del Pinatar), por lo que la presencia en el parque es de paso/alimentación.
- **Espino negro** (*Rhamnus lycioides* subsp. *borgiae*) - confirmado: "Rhamnus hispanorum" (nombre usado en el decreto regional) es sinónimo de este taxón según World Flora Online.
- **Arto** (*Maytenus senegalensis* subsp. *europaea*) - confirmado: una ficha oficial del Ayuntamiento de Cartagena usa exactamente ese binomio para la especie común "arto", resolviendo la equivalencia de nombre.

Las 6 especies restantes siguen sin poder verificarse de forma independiente y mantienen su `reviewNote`/`review_note` visible en la app (etiqueta "a revisar"):

1. **Cormorán moñudo** (*Gulosus aristotelis*) - la subespecie mediterránea *desmarestii* es la esperable en el litoral murciano, pero la fuente consultada (RegMurcia) solo confirma nidificación en Isla Grosa, no en Cabo Cope, y da la categoría regional como "especie vulnerable" (Ley 7/95), distinta de "interés especial" que figura hoy en el catálogo; pendiente de decidir si se corrige.
2. **Centaurio de Rigual** (*Centaurium rigualii*) - **atención especial**: fuentes taxonómicas (Kew/POWO) lo tratan como sinónimo o forma de *Centaurium quadrifolium*, reforzando la sospecha de que no es un taxón válido independiente; sigue sin confirmarse con fuente primaria su presencia específica en Cabo Cope.
3. **Anabasis** (*Anabasis hispanica*) - su presencia regional y el hábitat (suelos margosos/salinos) son coherentes con el catálogo, pero la identificación de campo frente a otras quenopodiáceas suculentas sigue sin confirmar.
4. **Siempreviva insigne** (*Limonium insigne*) - hay indicios de que tiene distribución óptima específicamente en el territorio de Cabo Cope, lo que reduce la duda de presencia, pero la complejidad taxonómica del género frente a especies afines (*L. lobatum*, *L. cossonianum*) sigue sin resolverse.
5. **Tomillo de invierno** (*Thymus hyemalis*) - la subespecie amenazada *millefloris* parece documentada solo en Almería; lo más probable es que la población de Cabo Cope sea la subsp. *hyemalis* típica, pero falta confirmarlo antes de ajustar `spainStatus`.
6. **Coloquíntida** (*Citrullus colocynthis*) - no catalogada oficialmente; no se encontraron fuentes que confirmen ni descarten su presencia específica en Cabo Cope (solo hay referencias a Mula/Yecla, en el interior de Murcia, y a Cabo de Gata, en Almería).

Por favor revisa estos 6 casos y avísame de cualquier corrección; actualizaré el catálogo en consecuencia.

## Mapa: zonas protegidas oficiales, capas base y hábitats

El mapa muestra ahora la **geometría oficial real** de las figuras de protección, dos capas base
conmutables y los hábitats, todo activable/desactivable desde el control de capas (arriba a la derecha).

### Zonas protegidas con geometría oficial (IMIDA/CARM)

El límite aproximado de puntos que había antes se ha sustituido por geometría vectorial oficial,
descargada del servicio ArcGIS REST del IMIDA/CARM (`geoportal.imida.es/.../OISMA/MapServer`),
reproyectada a EPSG:4326 y generalizada para peso web (ver `Frontend/Data/geo/README.md`). Cada
figura es una capa propia, con su estilo y un popup con nombre, código y superficie:

- **Parque Regional** de Calnegre y Cabo Cope (Ley 4/1992; 2.665 ha) — línea verde continua. Es el
  límite legal, el mismo que representa el folleto oficial (ya no un trazado aproximado).
- **LIC · Red Natura 2000** — `ES6200031` Cabo Cope (240 ha) y `ES6200012` Calnegre (781 ha); línea
  azul-teal discontinua.
- **ZEPA · Red Natura 2000** — `ES0000261` Almenara-Moreras-Cabo Cope (22.201 ha); línea púrpura
  punteada (se extiende bastante al norte del parque). Los LIC y la ZEPA juntos constituyen la Red
  Natura 2000. Vienen apagados por defecto para no saturar el mapa; se activan desde el control de capas.

### La ubicación de una especie la aporta el GPS al marcarla como vista

Los marcadores de especies **ya no aparecen pre-cargados** en el mapa. La localización es parte de la
mecánica tipo pokédex y proviene del **GPS del dispositivo**: al marcar una especie como vista, el
navegador pide la posición (`navigator.geolocation.getCurrentPosition`) y el marcador se coloca **donde
el usuario realmente la ha visto**. Al desmarcar, el marcador y su ubicación desaparecen.

- La ubicación del avistamiento se persiste en el backend (`progress.php` → `Backend/Data/progress.json`,
  campo `sightings` con `{lat, lng, at}` por especie) y se restaura al recargar.
- Si el usuario **deniega el permiso** o el dispositivo no tiene GPS, la especie se marca igualmente como
  vista y el marcador cae en la coordenada representativa del catálogo, indicándolo en el popup
  ("Ubicación aproximada (sin GPS)" frente a "Ubicación registrada por GPS").
- La geolocalización del navegador requiere contexto seguro (HTTPS o `localhost`).

### Senderos del parque (GR-92)

Se dibuja el trazado real del **GR-92 / Sendero del Mediterráneo** a su paso por el parque (capa
*Senderos*, línea naranja), extraído de **OpenStreetMap** (© OpenStreetMap contributors, ODbL) y guardado
en `Frontend/Data/geo/trails.geojson`. Recorre el litoral entre Calabardina y Puntas de Calnegre. Los
senderos locales señalizados (PR/SL) se pueden añadir al mismo fichero cuando se disponga de su trazado.

### Puntos de interés con coordenadas verificadas

Los 6 puntos de interés se han **corregido con topónimos de OpenStreetMap** (varios estaban desplazados:
la Torre de Cope ~1,5 km y Cala Blanca ~5 km) y se han añadido 2 nuevos: **Calabardina** (puerta de
entrada meridional) y **Playa del Sombrerico** (por su tarayal, hábitat 92D0, citado en el PORN). Son 8
en total, aplicados al JSON, la base de datos y `schema.sql`.

### Capas base y clústeres

- **Dos capas base** conmutables: *Mapa* (OpenStreetMap) y *Satélite (PNOA)* — ortofoto aérea del
  Instituto Geográfico Nacional por WMTS (`OI.OrthoimageCoverage`, cuadrícula `GoogleMapsCompatible`).
- **Agrupación de marcadores** (Leaflet.markercluster): las especies vistas próximas se agrupan en un
  clúster con su recuento y se despliegan al hacer zoom. Al seleccionar una especie ya vista desde el
  catálogo, el mapa hace zoom hasta sacar su marcador del clúster y abre el popup.

### Hábitats: círculos aproximados, listos para polígonos reales

- Cada uno de los 21 hábitats de interés comunitario se dibuja como un **círculo en una posición
  representativa** (no su extensión real), con su código, prioridad UE y color. Al hacer clic se abre un
  popup con el recuento de especies vistas en ese hábitat y un botón para filtrar el catálogo a esas especies.
- La geometría de hábitats vive en `Frontend/Data/geo/habitats.geojson` (plantilla vacía por ahora). Es la
  **fontanería lista para QGIS**: `app.js` dibuja el polígono real de un hábitat en cuanto se añade a ese
  fichero un `Feature` con `properties.slug`, sin tocar código. No se localizó un servicio oficial de
  Hábitats de Interés Comunitario accesible como vector para esta zona; habrá que exportarlo de QGIS a
  partir de la cartografía de HIC de MITECO.
- La relación especie-hábitat es muchos-a-muchos (una especie puede vivir en varios hábitats): en el JSON de
  respaldo son los campos `habitatIds` (por especie) y `speciesIds` (por hábitat); en la base de datos es la
  tabla `species_habitats`, calculada por `species.php` a partir de nombre científico + slug de hábitat.

### Reconstrucción del catálogo de hábitats (9 → 21, fuente Red Natura 2000)

El catálogo de hábitats se ha reconstruido por completo a partir de fuentes oficiales de Red Natura 2000, sustituyendo la selección inicial (basada en referencias de divulgación) por los **21 hábitats de interés comunitario** (Directiva 92/43/CEE) oficialmente documentados para todo el Parque Regional: 18 terrestres y 3 marinos, de los cuales 5 son prioritarios (marcados `*`).

Fuentes usadas exclusivamente para esta reconstrucción:

- **Anexo I del proyecto de PORN del Parque Regional Calnegre y Cabo Cope** (asociacionanse.org): catálogo completo de los 21 hábitats para todo el parque, con código, nombre, rareza (muy raro/raro/no raro) y prioridad.
- **Standard Data Form y Plan de Gestión del LIC ES6200031 Cabo Cope** (asociacionanse.org): descripciones detalladas de las asociaciones fitosociológicas de los hábitats presentes específicamente en el sector de Cabo Cope, incluida la delimitación textual oficial de esa sub-zona (241,02 ha).

Los 21 hábitats: 1110 (bancos de arena), 1120* (Posidonia oceanica), 1170 (arrecifes), 1210 (vegetación anual sobre desechos marinos), 1240 (acantilados con Limonium), 1420 (matorrales halófilos), 1430 (matorrales halo-nitrófilos), 1510* (estepas salinas/albardinal), 2110 (dunas móviles embrionarias), 2230 (dunas con céspedes del Malcomietalia), 2240 (dunas con céspedes del Brachypodietalia), 3250 (ríos con Glaucium flavum), 3280 (ríos del Paspalo-Agrostidion), 5210 (sabinar de Juniperus), 5220* (azufaifares de Ziziphus), 5330 (matorral termomediterráneo semiárido), 6110* (prados calcáreos del Alysso-Sedion), 6220* (subestepa de Thero-Brachypodietea), 7210 (turberas calcáreas de Cladium mariscus), 8210 (roquedos casmofíticos) y 92D0 (galerías de Tamarix).

Los 9 hábitats que ya existían en el catálogo se mantienen (mismo slug, mismas especies asociadas) por corresponder exactamente a 9 de estos 21 códigos oficiales. Se corrige, además, la única reclasificación de especie inequívoca que surge de esta reconstrucción: **Teucrium freynii** (teucrio de Freyn) pasa de "Galerías ribereñas" (92D0) a "Roquedos casmofíticos" (8210), ya que la fuente oficial la cita como especie característica de la asociación *Cosentinio bivalentis-Teucrietum freynii*, propia de ese hábitat rocoso, y no de las galerías de ribera.

Los 11 hábitats nuevos que no correspondían a especies ya presentes en el catálogo (dunas, ríos, estepas, prados y turberas) se añadieron con su código, nombre, prioridad y descripción oficial. La incorporación de especies nuevas (~25 candidatas identificadas en el Standard Data Form de 1994 y en el Anexo I del PORN) sigue pendiente para una siguiente ronda, según lo acordado; la reclasificación de especies ya existentes hacia estos hábitats se completó en la ronda siguiente (ver más abajo).

### Reorganización especie-hábitat sobre el catálogo oficial de 21 hábitats

Con el catálogo de 21 hábitats ya en su sitio, se releyeron las descripciones textuales de las asociaciones fitosociológicas del Plan de Gestión del LIC Cabo Cope y del Anexo I del PORN (las mismas fuentes de la reconstrucción anterior) para reclasificar 12 especies ya catalogadas hacia los hábitats que les corresponden oficialmente. Cada cambio se apoya en una cita textual concreta, no en una suposición:

- **Sabina negral** (*Juniperus phoenicea*), **Espino negro** (*Rhamnus lycioides* subsp. *borgiae*) y **Pino carrasco** (*Pinus halepensis*): los tres aparecen citados en la asociación oficial 856121 *Chamaeropo humilis-Juniperetum phoeniceae* (hábitat 5210, sabinar); se añaden a "Sabinar de Juniperus" sin quitar sus hábitats previos.
- **Cornical** (*Periploca angustifolia*) y **Lentisco** (*Pistacia lentiscus*): citados en la asociación 422011 *Mayteno-Periplocetum angustifoliae* (hábitat 5220); se añaden a "Azufaifar".
- **Albardín** (*Lygeum spartum*) y **Siempreviva insigne** (*Limonium insigne*): son las especies dominantes de la asociación 151047 *Limonio insignis-Lygeetum sparti* (hábitat 1510, nuevo); se añaden a "Estepas salinas/albardinal".
- **Siempreviva insigne**, **Anabasis** (*Anabasis hispanica*) y **Salsola** (*Salsola papillosa*): las tres aparecen juntas en la asociación 433413 *Limonio insignis-Anabasietum hispanicae* (hábitat 5330); se añaden a "Matorral semiárido".
- **Cambrón** (*Lycium intricatum*): es la especie dominante de la asociación 143016 *Whitanio frutescentis-Lycietum intricati* (hábitat 1430, no 1420 como estaba asignada); esa misma asociación cita como acompañantes a *Lygeum spartum* y *Asteriscus maritimus* (este último ya estaba correctamente en 1430 desde la auditoría anterior). Se corrige *Lycium intricatum* de "Matorral halófilo" a "Matorral halo-nitrófilo" y se añade *Lygeum spartum* también a ese hábitat.
- **Taray** (*Tamarix africana*): se añade a "Galerías de Tamarix" (92D0 = Nerio-Tamaricetea, el hábitat definido precisamente por el género Tamarix), sin quitar el matorral halófilo original.
- **Azucena de mar** (*Pancratium maritimum*): se traslada de "Matorral halo-nitrófilo" a "Dunas móviles embrionarias" (2110), resolviendo el vacío de hábitat dunar detectado en la auditoría anterior. A diferencia de los cambios anteriores, esta es una **inferencia ecológica mía** (es una especie típica de dunas costeras), no una cita textual directa: ni el Plan de Gestión del LIC Cabo Cope ni el Anexo I del PORN mencionan expresamente *Pancratium maritimum* entre las especies indicadoras de esa asociación (que cita *Elymus farctus* y *Sporobolus pungens*). Queda marcada con `reviewNote` para que se confirme.

Los 7 hábitats que siguen sin especies asociadas (1210, 2230, 2240, 3250, 3280, 6110, 6220) es porque ninguna especie ya catalogada coincide con las especies indicadoras que citan las fuentes oficiales para esas asociaciones concretas; sus especies candidatas forman parte de la ampliación pendiente del catálogo.

### Auditoría de coherencia especie-hábitat

Se comparó el texto libre `habitat` y las coordenadas de cada una de las 44 especies contra el hábitat estructurado que tenía asignado, y se corrigieron 4 casos donde ambos discrepaban del original (en `cabo-cope.json` y en el parche SQL de `species_habitats`):

- **Ajo de flor oscura** (*Allium melananthum*): se añade el hábitat "Matorrales halófilos" (sus coordenadas caen dentro de ese círculo y su descripción cita el albardín, especie indicadora), sin quitar el matorral semiárido original.
- **Siempreviva insigne** (*Limonium insigne*): estaba solo en "Matorral semiárido", que no aparece mencionado en ningún lugar de su ficha; se corrige a "Matorrales halófilos" + "Acantilados", que es justo lo que dice su propio texto ("Saladar y acantilados de la marina de Cope").
- **Zamarrilla lanuda** (*Teucrium lanigerum*): estaba en "Matorrales halófilos" por error; su texto ("Cerros carbonatados", sin mención de suelo salino) y coordenadas encajan con "Matorral semiárido", igual que el Rabogato (*Sideritis ibanyezii*), que comparte el mismo hábitat textual.
- **Margarita de mar** (*Asteriscus maritimus*): se añade "Acantilados" (su descripción cita literalmente "roquedos y acantilados costeros" y sus coordenadas están a ~150 m del centro de ese hábitat), manteniendo el matorral halonitrófilo original.

Limitación detectada de paso: la *Azucena de mar* (*Pancratium maritimum*) vive en dunas y playas, pero el catálogo de 9 hábitats no incluye ningún hábitat dunar/de playa; se mantiene en "Matorral halonitrófilo" por ser la opción más cercana disponible. Si se añade cartografía de hábitats más detallada, valdría la pena crear un hábitat de dunas litorales.

## Actualización a partir del PORN de Calnegre y Cabo Cope (documento previo, CARM 2021)

Se ha contrastado el catálogo contra el [Documento previo del PORN de Calnegre y Cabo Cope](https://transparencia.carm.es/wres/transparencia/doc/Organos-colegiados/Consejo_Asesor_Regional_Medio_Ambiente/2021-02-18/PORN_CALNEGRE_Documento_previo_CARMA.pdf) (CARM, 2021), el instrumento de planificación ambiental más autorizado disponible para este espacio. Es un documento *previo* de 28 páginas: solo su apartado "Patrimonio natural y biodiversidad" tiene contenido sustantivo (hábitats, especies catalogadas, fauna); la zonificación por usos todavía no está redactada en esta versión. (El límite del mapa **sí** se ha actualizado después a la geometría oficial del Parque Regional y de la Red Natura 2000 — ver "Mapa: zonas protegidas oficiales" más arriba.)

- **22 especies nuevas** incorporadas al catálogo (66 especies en total, antes 44): 3 de flora del Catálogo Regional de Flora Silvestre Protegida citadas expresamente para la zona y ausentes hasta ahora (*Centaurea saxicola* -cardo amarillo de roca-, *Lafuentea rotundifolia* -orejilla de roca- y *Senecio flavus*) y 19 de fauna citadas en el documento (mamíferos carnívoros: gato montés, gineta, garduña, tejón; aves de matorral, saladar y playa: terrera marismeña, terrera común, cogujada montesina, curruca rabilarga, collalba negra, mochuelo europeo, perdiz roja, chorlitejo patinegro, correlimos tridáctilo, vuelvepiedras, ostrero euroasiático, charrancito común; reptiles: lagartija colilarga, culebra bastarda, lagartija colirroja). Todas incluyen `reviewNote` indicando que el PORN cita su presencia sin detallar categoría de protección regional exacta ni, en el caso de *Senecio flavus*, hábitat o nombre común.
- *Ziziphus lotus* (Azufaifo) **ya existía** en el catálogo (no se duplicó); solo se amplió su fuente con la cita del PORN, que confirma su categoría Vulnerable.
- **6 especies ya existentes confirmadas** con categoría oficial exacta y cita añadida a su fuente: Cornical, Chumberillo de lobo, Ajo de flor oscura y Salsola (las cuatro ya estaban como Vulnerable, ahora con respaldo directo del PORN) y dos correcciones de categoría: **Arto** (*Maytenus senegalensis* subsp. *europaea*) pasa de "pendiente de confirmar" a **Vulnerable**, y **Espartilla de Persia** (*Enneapogon persicus*) pasa de "de interés especial" a **en peligro de extinción** en el Catálogo Regional de Murcia (categoría distinta de su "en peligro crítico" nacional, que no cambia).
- **Conflicto de recuento de hábitats sin resolver**: el PORN dice que los LIC de Calnegre y Cabo Cope suman **15 tipos de hábitat** (4 prioritarios), no 21. Coincide con 15 de los 21 códigos ya catalogados; los 6 restantes (1110, 1120\*, 1170, 2240, 3280, 7210) no aparecen en esta lista oficial "de los LIC de Calnegre y Cabo Cope". El documento sí menciona que el LIC Cabo Cope linda con la ZEC marina "Franja Litoral Sumergida de la Región de Murcia" (ES6200029), lo que podría explicar los 3 hábitats marinos (1110, 1120\*, 1170) como pertenecientes a esa zona adyacente y no al LIC en sí; los otros 3 (2240, 3280, 7210) quedan sin explicación por ahora. Se mantienen los 21 en el catálogo por precaución, pero conviene revisar el Standard Data Form u otra fuente que justificara originalmente esos 6 códigos antes de darlos por buenos.

### Completado del catálogo de flora protegida (Anexo I del proyecto de PORN, ANSE)

La flora vascular total del parque se estima en **322 especies y subespecies** (dato de Wikipedia, atribuido a Alcaraz Ariza, *"La Marina de Cope: ¿los últimos días de un paraíso botánico?"*, *Eubacteria* nº5, Universidad de Murcia; el [Anexo I del proyecto de PORN](https://www.asociacionanse.org/wp-content/uploads/2020/12/ANEXO-I_PROYECTO_PORN_COPE.pdf) de ANSE lo corrobora como ">320 taxones de flora vascular" solo en las ~800 ha de vegetación natural de la Marina de Cope). **Ese inventario florístico completo no está publicado en ninguna fuente accesible en línea**: ni el documento previo del PORN, ni el Anexo I de ANSE, ni Wikipedia ni RegMurcia enumeran las 322; solo publican la tabla de flora protegida (~40 taxones), una lista de especies invasoras y algunos ejemplos en prosa. El catálogo de la app **no pretende, por tanto, cubrir las 322**, sino el subconjunto realmente documentado.

Sí se ha completado la **lista oficial de flora protegida del parque** (~40 taxones del Catálogo Regional de Flora Silvestre Protegida, Decreto 50/2003, según el Anexo I de ANSE). De esos ~40, 26 ya estaban en el catálogo y se han añadido los **12 taxones que faltaban** (78 especies en total, antes 66): *Chamaerops humilis* (palmito), *Cynomorium coccineum* (cinomorio), *Eragrostis papposa*, *Erodium sanguis-christi*, *Lavandula dentata* (cantueso dentado), *Lavandula multifida* (alhucema), *Leucanthemum decipiens*, *Limonium cossonianum* (siempreviva de Cosson, especie dominante de los acantilados según la asociación *Limonio cossoniani-Lycietum intricati*), *Osyris lanceolata* (bayón), *Quercus coccifera* (coscoja), *Sarcocapnos enneaphylla* subsp. *saetabensis* (zapatito de la Virgen, del hábitat rocoso 8210) y *Serratula mucronata*. Notas:

- Se descartaron *Rhamnus hispanorum* (sinónimo del Espino negro ya catalogado, *Rhamnus lycioides* subsp. *borgiae*) y *Tamarix canariensis* (co-citada con el Taray, *Tamarix africana*, ya presente).
- La tabla del PDF del Anexo tiene los **nombres comunes descolocados de columna** (etiqueta a *Cynomorium* como "palmito", que en realidad es *Chamaerops*, etc.); se han usado los nombres científicos y nombres comunes correctos, no los del PDF.
- Para *Chamaerops humilis*, *Osyris lanceolata*, *Limonium cossonianum* y *Sarcocapnos enneaphylla* subsp. *saetabensis* el hábitat se apoya en la asociación fitosociológica citada por las fuentes oficiales; para las 8 restantes la asignación de hábitat es una **inferencia ecológica** (marcada con `reviewNote`) y las coordenadas son representativas, no de una localización verificada en campo.

## Pestaña "Progreso"

La barra lateral tiene ahora dos pestañas: **Catálogo** (vista de siempre) y **Progreso**, con:

- Barra global de especies vistas / total.
- Lista de hábitats con su recuento de especies vistas y una marca ✓ cuando un hábitat se completa (todas sus especies vistas).
- Barra y lista de puntos de interés visitados / total.
- Una tarjeta de logro: al completar todos los hábitats y todos los puntos de interés se desbloquea **"¡Más aguileño que un pijo lobo!"**, con una animación al desbloquearse. El estado de "completo" se recalcula siempre a partir de `seenSpecies`/`seenPois`, no se guarda por separado.

## Progreso tipo pokédex

`app.js` guarda qué especies y puntos de interés se han marcado como "vistos" llamando a `Backend/Api/progress.php`, que persiste el estado en `Backend/Data/progress.json` (sin autenticación, pensado para un único usuario en este prototipo). Si el backend no está disponible, el progreso se mantiene solo en la sesión del navegador.

## Próximos pasos recomendados

1. Recargar `Database/schema.sql` en MySQL: añade `slug`/`habitat_type`/`latitude`/`longitude`/`color` a `habitats` y crea la tabla `species_habitats` (usa `ADD COLUMN IF NOT EXISTS`, así que es seguro volver a ejecutarlo sobre una base de datos ya existente; requiere MySQL 8.0.29+ o MariaDB 10.5+).
2. Abrir `Frontend/index.html` desde el servidor local del proyecto.
3. Sustituir el límite aproximado del parque y las posiciones de hábitat por la cartografía real en cuanto esté lista en QGIS (idealmente sirviendo un GeoJSON desde el backend).
4. Sustituir progresivamente las citas genéricas por referencias documentales concretas (informes PORN/PRUG, fichas de especie oficiales) y curar fotografías con licencia verificada.
5. Añadir autenticación y subida de observaciones cuando el prototipo visual esté validado.
