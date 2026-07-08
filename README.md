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
- `Backend/Api/parks.php`: endpoint de parques.
- `Backend/Api/species.php`: endpoint agregado para parque, hábitats, puntos de interés y especies.
- `Backend/Api/progress.php`: endpoint GET/POST para marcar especies y puntos de interés como vistos (persistido en `Backend/Data/progress.json`).
- `Database/schema.sql`: modelo escalable (parques, hábitats, especies, puntos de interés, observaciones, relación muchos-a-muchos especie-hábitat).

## Catálogo de datos

El catálogo semilla incluye 44 especies (15 fauna, 29 flora), 21 hábitats de interés comunitario (Directiva 92/43/CEE) y 6 puntos de interés del Parque Regional de Cabo Cope y Puntas de Calnegre. Cada especie incluye:

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

Este catálogo es un punto de partida para el prototipo: los datos deben contrastarse en campo y con las fuentes primarias (PORN/PRUG del parque, inventarios oficiales de la CARM y el MITECO) antes de un uso definitivo. Las especies añadidas en esta y la ronda anterior no tienen todavía fotografía verificada; el frontend muestra un icono de marcador de posición hasta incorporar imágenes con licencia confirmada.

### Especies marcadas para revisión personal

No todas las categorías de conservación ni identificaciones pudieron verificarse de forma independiente en esta sesión. Cada una de estas 11 especies incluye un campo `reviewNote`/`review_note` visible en la ficha de la app (etiqueta "a revisar") con el detalle concreto de la duda:

1. **Águila perdicera** (*Aquila fasciata*) - estatus regional (Murcia) estimado, confirmar categoría exacta vigente.
2. **Cormorán moñudo** (*Gulosus aristotelis*) - confirmar si la población es de la subespecie mediterránea *desmarestii*.
3. **Curruca cabecinegra** (*Curruca melanocephala*) - cambio taxonómico reciente de género (antes *Sylvia*).
4. **Pardela cenicienta** (*Calonectris diomedea*) - confirmar si hay colonia reproductora local o solo presencia en alimentación.
5. **Espino negro** (*Rhamnus lycioides* subsp. *borgiae*) - equivalencia con el nombre "Rhamnus hispanorum" del decreto regional.
6. **Centaurio de Rigual** (*Centaurium rigualii*) - **atención especial**: posible taxón inválido, excluido del Catálogo Nacional de Especies Amenazadas desde 2000; no se pudo confirmar con fuente primaria su presencia específica en Cabo Cope.
7. **Anabasis** (*Anabasis hispanica*) - confirmar identificación en campo.
8. **Siempreviva insigne** (*Limonium insigne*) - género con taxonomía compleja, confirmar frente a especies afines.
9. **Arto** (*Maytenus senegalensis* subsp. *europaea*) - la fuente solo cita el nombre común "arto"; el binomio científico es la equivalencia habitual pero no está confirmada para Cabo Cope.
10. **Tomillo de invierno** (*Thymus hyemalis*) - verificar si corresponde a la subespecie *millefloris* (única con categoría nacional confirmada).
11. **Coloquíntida** (*Citrullus colocynthis*) - no catalogada oficialmente, incluida solo por citarse expresamente como notable/rara en la fuente.

Por favor revisa estos 11 casos y avísame de cualquier corrección; actualizaré el catálogo en consecuencia.

## Mapa: límite del parque y hábitats geolocalizados

El mapa dibuja ahora un límite aproximado del Parque Regional de Cabo Cope y Puntas de Calnegre (línea discontinua roja) y un círculo por cada uno de los 21 hábitats de interés comunitario, con su código y estado de prioridad UE.

- El límite es **provisional**, guiado por el plano del folleto oficial "Calnegre y Cabo Cope" (CARM, murcianatural.carm.es) y por referencias textuales y puntos conocidos del parque (Calabardina, Torre de Cope, Cabo Cope, Lomo de Bas, Puntas de Calnegre), no de cartografía vectorial oficial. El propio folleto muestra el límite del Parque Regional y el de la Red Natura 2000 como dos líneas distintas en su leyenda, y existen conflictos legales aún no resueltos entre ambas delimitaciones (por ejemplo, el LIC ES6200031 Cabo Cope ocupa solo 241 ha según su Plan de Gestión, muy por debajo de la extensión completa del Parque Regional). Tanto `Frontend/Data/cabo-cope.json` como `Backend/Api/species.php` incluyen un campo `boundaryNote` con este aviso. Cuando se resuelva el conflicto legal y esté disponible el proyecto QGIS, este trazado debe sustituirse por la geometría real (lo más sencillo será servir un GeoJSON en vez de un array de puntos fijo).
- Cada hábitat tiene una posición representativa (no su extensión real) y un color propio. Al hacer clic se abre un popup con el recuento de especies vistas en ese hábitat y un botón para filtrar el catálogo a esas especies.
- La relación especie-hábitat es muchos-a-muchos (una especie puede vivir en varios hábitats): en el JSON de respaldo son los campos `habitatIds` (por especie) y `speciesIds` (por hábitat); en la base de datos es la tabla `species_habitats`, calculada por `species.php` a partir de nombre científico + slug de hábitat.

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
