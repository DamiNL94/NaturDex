-- ================================================================================================
-- NaturDex · esquema de base de datos (solo DDL)
-- ------------------------------------------------------------------------------------------------
-- Este archivo define ÚNICAMENTE la estructura (CREATE TABLE) del estado actual. No contiene datos
-- ni migraciones. Para una instalación limpia:
--     mysql < Database/schema.sql        (crea la BD y las tablas)
--     mysql < Database/seed.sql          (carga el parque piloto y su catálogo)
-- Para actualizar una instalación antigua a este esquema, ejecuta antes Database/migrations.sql.
-- ================================================================================================
-- El fichero es UTF-8, pero el cliente mysql puede conectar en latin1 (p. ej. al importarlo el
-- entrypoint del contenedor de MySQL): sin esta línea las tildes/ñ se guardarían dobles (mojibake).
SET NAMES utf8mb4;
CREATE DATABASE IF NOT EXISTS naturadex CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE naturadex;

CREATE TABLE IF NOT EXISTS parks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(120) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(120) NOT NULL,
    region VARCHAR(120) NOT NULL,
    province VARCHAR(120) NOT NULL,
    municipality VARCHAR(255),
    description TEXT,
    area_hectares DECIMAL(10,2),
    coastline_km DECIMAL(6,2),
    latitude DECIMAL(10,6) NOT NULL,
    longitude DECIMAL(10,6) NOT NULL,
    -- Nivel de dato del espacio (rollout nacional, Docs/prompts/e-rollout-nacional.md):
    --   'basic'     ficha base (N1): límite oficial y códigos Natura 2000, sin catálogo.
    --   'available' completo (N2): hábitats, especies, POIs, fotos y audioguías.
    --   'planned'   anunciado, todavía sin datos.
    -- Todo espacio nace 'basic' y asciende cuando se le hace el catálogo. Es un ENUM para que la
    -- propia base de datos rechace un valor que el frontend no sabría interpretar.
    status ENUM('basic','available','planned') NOT NULL DEFAULT 'basic',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_parks_status (status)
);

CREATE TABLE IF NOT EXISTS habitats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    park_id INT NOT NULL,
    slug VARCHAR(60),
    code VARCHAR(20),
    name VARCHAR(255) NOT NULL,
    habitat_type VARCHAR(60),
    description TEXT,
    is_priority BOOLEAN DEFAULT FALSE,
    latitude DECIMAL(10,6),
    longitude DECIMAL(10,6),
    color VARCHAR(20),
    -- Geometría del área del hábitat en formato GeoJSON (objeto Polygon o MultiPolygon, coords
    -- lon/lat en CRS84). Es la fuente de verdad del polígono dibujado en el mapa: el panel la edita
    -- y el export regenera el habitats.geojson a partir de aquí. NULL = sin polígono todavía (la app
    -- dibuja un círculo aproximado en latitude/longitude).
    geometry JSON,
    review_note TEXT,
    -- Catálogo de hábitats (Directiva 92/43/CEE). `code` es el código HIC de referencia del hábitat;
    -- `hic_subtipos` es la lista de subtipos HIC concretos presentes (p. ej. 5330→["5334"]) y
    -- `fitosociologia` la lista de asociaciones fitosociológicas oficiales (Cartografía de Hábitats
    -- MITECO/BDN + planes de gestión). JSON (array de strings) para migrar limpio a jsonb en Postgres.
    hic_subtipos JSON,
    fitosociologia JSON,
    -- Audioguía explicativa del hábitat: URL/ruta del fichero de audio y su transcripción
    -- (alternativa textual obligatoria por accesibilidad, WCAG 1.2.1).
    audio_url VARCHAR(500),
    audio_transcript TEXT,
    -- Foto del hábitat: URL externa (p. ej. Wikimedia Commons) o ruta local. NULL = sin foto; la app
    -- dibuja entonces su portada temática (degradado del color del hábitat + emoji + código HIC).
    image_url VARCHAR(500),
    -- Autor + licencia + fuente de esa foto. Obligatorio para cumplir CC-BY/CC-BY-SA, igual que en
    -- species.image_attribution.
    image_attribution VARCHAR(300),
    -- Un hábitat no es un taxón y no tiene "su" foto: se ilustra con su especie diagnóstica. Aquí se
    -- explica con cuál y por qué, para que el lector sepa que la portada es una planta concreta y no
    -- una vista general del hábitat. Lo rellena Tools/catalogo-nacional/habitat-images.js.
    image_note VARCHAR(400),
    FOREIGN KEY (park_id) REFERENCES parks(id) ON DELETE CASCADE,
    UNIQUE KEY unique_habitat_per_park (park_id, code),
    UNIQUE KEY unique_habitat_slug_per_park (park_id, slug)
);

CREATE TABLE IF NOT EXISTS species (
    id INT AUTO_INCREMENT PRIMARY KEY,
    park_id INT NOT NULL,
    common_name VARCHAR(255) NOT NULL,
    scientific_name VARCHAR(255) NOT NULL,
    kingdom ENUM('flora','fauna','fungi','other') NOT NULL,
    family VARCHAR(160),
    primary_habitat VARCHAR(255),
    conservation_status VARCHAR(160),
    description TEXT,
    identification_tips TEXT,
    seasonality VARCHAR(160),
    image_url VARCHAR(500),
    -- Atribución de la foto (autor + licencia + fuente), obligatoria para cumplir CC-BY/CC-BY-SA/
    -- CC-BY-NC cuando la imagen procede de GBIF/iNaturalist/Wikimedia. NULL si la foto es propia.
    image_attribution VARCHAR(300),
    latitude DECIMAL(10,6),
    longitude DECIMAL(10,6),
    -- Tramo de rareza 1–5 derivado de la CATEGORÍA LEGAL, no de la abundancia (5 en peligro de
    -- extinción · 4 vulnerable o sensible · 3 de interés especial · 2 LESRPE o Directiva Aves ·
    -- 1 sin figura). Antes era «criterio propio»: un número puesto a ojo que nadie podía recalcular.
    -- Ver Docs/arquitectura/PROCEDENCIA-DE-CAMPOS.md y Tools/lib/rareza.js.
    rarity_score TINYINT UNSIGNED DEFAULT 1,
    -- La figura que justifica el tramo, con su ámbito y de qué campo se leyó: {categoria, ambito,
    -- origen}. JSON y no columnas sueltas porque lo que hace falta es el round-trip exacto con el
    -- park.json: aplanarlo perdería `origen`, que es justo lo que da la trazabilidad.
    -- NULL = todavía sin migrar. Ojo: «sin figura de protección» NO es NULL, es una categoría más:
    -- «comprobado que no hay» y «nadie lo ha mirado» son estados distintos y solo el segundo se
    -- arrastra como deuda (`validate` lo avisa).
    rarity_basis JSON,
    -- El mismo tramo, pero tomando la categoría más grave de los DOS ámbitos, estatal y autonómico.
    -- Es local al parque —el catálogo autonómico es territorial: la misma especie es Vulnerable en
    -- una comunidad y no figura en la de al lado— y es el que gobierna las estrellas de la ficha y
    -- las destacadas. Solo con el estatal la escalera se aplana: 74 especies caen en el mismo cajón
    -- («en régimen de protección especial») y una sola queda por encima del umbral de destacada.
    rarity_local TINYINT UNSIGNED,
    rarity_local_basis JSON,
    is_featured BOOLEAN DEFAULT FALSE,
    -- Catálogo público: FALSE oculta la especie del listado/contadores sin borrar el dato ni sus
    -- referencias en species_habitats (criterio: pocas ocurrencias GBIF Y sin figura en ningún
    -- catálogo/anexo oficial de protección). NULL/TRUE = visible, igual que las especies previas a
    -- esta columna (aditivo, no rompe parques ya cargados). Ver Frontend/Js/data.js `applyVisibility`.
    is_visible BOOLEAN DEFAULT TRUE,
    -- Por qué está oculta. Distingue «sin descripción que enseñar» (lo que escribe
    -- `npm run especies:ocultar`) de una decisión tomada a mano, para que un pase automático no pise
    -- la segunda. NULL en las visibles.
    hidden_reason TEXT,
    -- De dónde sale el TEXTO de `description`. Las descripciones tienen dos orígenes que en la app se
    -- ven idénticos —EIDOS (v_atributos_pliniancore) o redacción propia en data/contenido/— y este
    -- campo es lo único que los distingue. Era el único campo de la ficha sin procedencia.
    -- NULL = heredada, sin trazar; `validate` cuenta cuántas quedan.
    description_source TEXT,
    -- Campos de cita/estado de conservación: TEXT (no VARCHAR) porque las atribuciones y los
    -- estados con referencia pueden superar los 500 caracteres. Con MySQL en modo estricto un
    -- VARCHAR corto abortaría la carga del seed en lugar de truncar en silencio.
    source TEXT,
    taxon_phylum VARCHAR(120),
    taxon_class VARCHAR(120),
    taxon_order VARCHAR(120),
    taxon_family VARCHAR(120),
    taxon_genus VARCHAR(120),
    iucn_global TEXT,
    spain_status TEXT,
    murcia_status TEXT,
    review_note TEXT,
    -- Claves maestras de reconciliación taxonómica (las 3 fuentes reclasifican y usan nomenclaturas
    -- distintas). EIDOS (IEPNB) es la nomenclatura CANÓNICA: `eidos_taxonid` es su clave estable; el
    -- `gbif_species_key` (BIGINT: los usageKey de GBIF exceden INT) liga las ocurrencias de GBIF. No
    -- son UNIQUE: a escala nacional la misma especie se repite por parque (una fila por parque).
    eidos_taxonid INT,
    gbif_species_key BIGINT,
    -- Aves de la Red Natura 2000: código del espacio ZEPA (Zona de Especial Protección para las Aves,
    -- p. ej. 'ES0000261') en cuya lista oficial de especies (EEA/BISE) figura esta ave. NULL = no es un
    -- ave de la ZEPA. Las aves no se asignan a hábitats concretos (vuelan): la app las muestra en un
    -- apartado propio de parque, no en el catálogo de hábitats.
    zepa_site_code VARCHAR(20),
    -- Fenología declarada por el Formulario Normalizado de Datos (FND/SDF) del sitio Red Natura
    -- 2000: TRUE = migratoria (el formulario la declara y NINGUNA de sus poblaciones es
    -- permanente), FALSE = declarada con población permanente. NULL = ningún formulario la
    -- nombra, que NO es lo mismo que «no es migratoria»: es que nadie lo ha mirado, y por eso la
    -- app la deja en el catálogo general en vez de clasificarla. Ver Tools/lib/fenologia.js.
    --
    -- Existe porque la app llevaba desde el piloto llamando «Ave migratoria» a toda ave con
    -- `zepa_site_code`, y ese campo dice otra cosa: que el formulario la declara. En Sierra de
    -- las Moreras eso eran 22 aves permanentes anunciadas como migratorias en su ficha.
    is_migratory BOOLEAN,
    -- La cita que sostiene lo anterior: {tipos, etiqueta, sitios, fuente}. JSON y no columnas
    -- sueltas por el mismo motivo que los dos `*_basis`: lo que hace falta es el round-trip
    -- exacto con el park.json. Sin este campo, la ficha diría «migratoria» sin nada debajo.
    site_presence JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (park_id) REFERENCES parks(id) ON DELETE CASCADE,
    UNIQUE KEY unique_species_per_park (park_id, scientific_name),
    INDEX idx_species_park_kingdom (park_id, kingdom),
    INDEX idx_species_scientific_name (scientific_name),
    INDEX idx_species_eidos_taxonid (eidos_taxonid),
    INDEX idx_species_gbif_key (gbif_species_key)
);

-- Relación muchos-a-muchos: una especie puede clasificarse en varios hábitats
-- (p. ej. Testudo graeca vive tanto en el matorral semiárido como en el azufaifar).
CREATE TABLE IF NOT EXISTS species_habitats (
    species_id INT NOT NULL,
    habitat_id INT NOT NULL,
    -- Procedencia del vínculo especie↔hábitat (ningún dato oficial dice "la especie X vive en el
    -- polígono Y": el enlace SIEMPRE es derivado, y aquí se guarda de dónde sale). Valores:
    -- 'caracteristica' (especie característica de la asociación fitosociológica del HIC),
    -- 'observada_gbif' (ocurrencia GBIF dentro del polígono) o 'zepa' (lista oficial Natura 2000).
    -- VARCHAR (no ENUM/SET) para migrar limpio a Postgres. `gbif_occurrences` = métrica de la
    -- evidencia empírica (nº de ocurrencias GBIF en el polígono) cuando evidence='observada_gbif'.
    evidence VARCHAR(40),
    gbif_occurrences INT,
    PRIMARY KEY (species_id, habitat_id),
    FOREIGN KEY (species_id) REFERENCES species(id) ON DELETE CASCADE,
    FOREIGN KEY (habitat_id) REFERENCES habitats(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS points_of_interest (
    id INT AUTO_INCREMENT PRIMARY KEY,
    park_id INT NOT NULL,
    slug VARCHAR(120) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(120),
    description TEXT,
    latitude DECIMAL(10,6),
    longitude DECIMAL(10,6),
    image_url VARCHAR(500),
    source TEXT,
    is_approx TINYINT(1) NOT NULL DEFAULT 0,
    -- Audioguía explicativa del punto de interés (misma pareja de campos que habitats).
    audio_url VARCHAR(500),
    audio_transcript TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (park_id) REFERENCES parks(id) ON DELETE CASCADE,
    UNIQUE KEY unique_poi_per_park (park_id, slug)
);

CREATE TABLE IF NOT EXISTS observations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    species_id INT NOT NULL,
    user_label VARCHAR(120),
    note TEXT,
    latitude DECIMAL(10,6),
    longitude DECIMAL(10,6),
    observed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    validation_status ENUM('pending','verified','rejected') DEFAULT 'pending',
    FOREIGN KEY (species_id) REFERENCES species(id) ON DELETE CASCADE,
    INDEX idx_observations_species_date (species_id, observed_at)
);

-- Cuentas de usuario y progreso por usuario (login del prototipo).
-- Las contraseñas se guardan con hash (password_hash de PHP), nunca en claro.
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(120),
    -- 'user' (por defecto) o 'admin'. Los administradores acceden al panel de administración
    -- (Frontend/admin/ + Backend/Api/admin.php) para editar el contenido ambiental.
    -- Promocionar a mano: UPDATE users SET role='admin' WHERE email='...';
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    -- Preferencias de la app (tema, tamaño de texto, mapa base, GPS...). El dispositivo manda: el
    -- frontend las aplica desde localStorage sin esperar a la red y aquí solo se espejan para que
    -- la misma cuenta las recupere en otro dispositivo. Ver Backend/Api/account.php?action=prefs.
    prefs JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tokens de "seguir conectado" (uno por dispositivo). Mantienen la sesión entre aperturas de la
-- app: la cookie de sesión de PHP muere al cerrar el navegador y los ficheros de sesión del
-- servidor desaparecen en cada redespliegue, así que sin esto habría que volver a entrar sin parar.
-- Patrón selector/validador: el selector va en claro (es por lo que se busca) y del validador solo
-- se guarda el hash SHA-256, de modo que esta tabla, robada, no permite suplantar a nadie.
-- Ver Backend/Lib/session.php, que es quien los emite, rota y revoca.
CREATE TABLE IF NOT EXISTS user_auth_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    selector CHAR(18) NOT NULL UNIQUE,
    validator_hash CHAR(64) NOT NULL,
    -- Validador anterior + cuándo se rotó: se acepta unos segundos más para que las peticiones que
    -- el frontend lanza en paralelo al abrir la app no se pisen entre ellas.
    previous_hash CHAR(64) NULL,
    rotated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP NULL,
    -- Caducidad deslizante: se renueva en cada uso, así que solo expira por inactividad.
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_auth_tokens_user (user_id),
    INDEX idx_user_auth_tokens_expires (expires_at)
);

-- Progreso por usuario y por parque. payload es un JSON con la misma forma que antes tenía
-- progress.json: { seenSpeciesIds, seenPoiIds, sightings, updatedAt }. Así cada cuenta lleva su
-- propio descubrimiento en cada parque, y el modelo escala a todos los parques de España.
CREATE TABLE IF NOT EXISTS user_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    park_slug VARCHAR(120) NOT NULL,
    payload TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_park (user_id, park_slug)
);

-- Glosario divulgativo (NACIONAL, no por parque). Términos del léxico científico que aparecen en las
-- descripciones (hábitats, especies) con su definición en lenguaje llano; el frontend los resalta y
-- muestra la definición al pulsarlos. Es contenido editorial (no derivado de una fuente oficial de
-- especies), por eso vive en su propia tabla global y no lleva park_id.
-- Especies exóticas INVASORAS (NACIONAL, por comunidad autónoma). Catálogo oficial: Catálogo Español
-- de Especies Exóticas Invasoras (RD 630/2013). No son especies del parque: la app las muestra en un
-- apartado propio, por territorio (la CCAA del parque), para que el visitante sepa reconocerlas.
-- Una fila por (especie, CCAA); a escala nacional una misma especie tendrá varias filas (una por CCAA
-- donde está registrada). `gbif_occurrences` (nº de ocurrencias GBIF en la CCAA) ordena las "más comunes".
CREATE TABLE IF NOT EXISTS especies_invasoras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    scientific_name VARCHAR(255) NOT NULL,
    common_name VARCHAR(255),
    -- Grupo taxonómico de EIDOS (Aves, Plantas vasculares, Mamíferos, Invertebrados...).
    taxon_group VARCHAR(80),
    kingdom ENUM('flora','fauna','fungi','other') NOT NULL DEFAULT 'other',
    -- Comunidad autónoma donde está registrada (coincide con parks.region para filtrar por parque).
    ccaa VARCHAR(120) NOT NULL,
    -- Descripción para reconocerla, origen (distribución nativa) y hábitat: texto oficial de EIDOS
    -- (IEPNB, v_atributos_pliniancore).
    description TEXT,
    origin TEXT,
    habitat TEXT,
    -- Qué daño hace (EIDOS «Invasividad») y cómo llegó y se propaga (EIDOS «Ruta» + «Vector»). Son
    -- las dos únicas cosas que el visitante puede accionar: reconocerla y no ayudarla a extenderse.
    impact TEXT,
    pathway TEXT,
    catalogo VARCHAR(120),
    eidos_taxonid INT,
    gbif_species_key BIGINT,
    gbif_occurrences INT,
    -- Foto para reconocerla + su atribución (GBIF/iNaturalist, licencia Creative Commons).
    image_url VARCHAR(500),
    image_attribution VARCHAR(300),
    source TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_invasora_ccaa (scientific_name, ccaa),
    INDEX idx_invasora_ccaa (ccaa)
);

CREATE TABLE IF NOT EXISTS glosario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    -- Término canónico (el que se muestra como título de la definición).
    term VARCHAR(80) NOT NULL UNIQUE,
    -- Definición en lenguaje común, para un ciudadano sin formación científica.
    definition TEXT NOT NULL,
    -- Familia del término (botánica, geología, ecología, conservación...) para agrupar/filtrar.
    category VARCHAR(60),
    -- Variantes que también deben resaltarse en el texto (género/número: "casmofítico",
    -- "casmofítica", "casmofíticas"...). JSON (array de strings) para migrar limpio a jsonb.
    aliases JSON,
    -- Fuente o adaptación de la definición, si procede (glosarios oficiales, Atlas de Hábitats...).
    source VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ================================================================================================
-- Progreso de CUENTA (ámbito estatal, agregado sobre todos los parques) + logros.
-- ------------------------------------------------------------------------------------------------
-- El progreso "de siempre" (user_progress) es por parque. Esta capa vive por encima: agrega lo
-- visto en todos los parques de una cuenta y guarda qué logros ha desbloqueado, para siempre, sin
-- importar que luego el usuario desmarque especies. Ver Backend/Lib/account_progress.php.
-- ================================================================================================

-- Agregados de cuenta (especies estatales distintas, parques visitados/completados, CCAA/provincias
-- pisadas, etc.). SIEMPRE derivable desde cero a partir de user_progress + user_activity_log +
-- user_invasive_sightings + user_glossary_views (ver Tools/recalculate-account-progress.php): esta
-- tabla es una caché de lectura, no una fuente de verdad adicional.
CREATE TABLE IF NOT EXISTS user_account_progress (
    user_id INT NOT NULL PRIMARY KEY,
    payload JSON NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Logros desbloqueados. Un logro desbloqueado NUNCA se borra ni se recalcula a "bloqueado" aunque el
-- usuario pierda progreso después (evaluate_achievements en account_progress.php solo añade filas).
-- `celebrated_at` separa "desbloqueado" de "ya visto por el usuario": el recálculo retroactivo (alta
-- de usuarios con progreso previo, Tools/recalculate-account-progress.php) rellena unlocked_at pero
-- deja celebrated_at NULL, para que el frontend muestre un resumen único en vez de N carteles
-- animados de golpe. Vive en servidor (no solo en localStorage) para que "ya celebrado" no dependa
-- del dispositivo. `context` guarda detalles para el texto del cartel (p. ej. {"park":"...","count":42}).
CREATE TABLE IF NOT EXISTS user_achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    -- Id estable del catálogo compartido (Frontend/Data/achievements.json), p. ej. 'species_15'.
    achievement_id VARCHAR(60) NOT NULL,
    unlocked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    celebrated_at TIMESTAMP NULL,
    context JSON NULL,
    UNIQUE KEY unique_user_achievement (user_id, achievement_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_achievements_user (user_id)
);

-- ------------------------------------------------------------------------------------------------
-- VISITAS VERIFICADAS: la prueba de que el usuario estuvo físicamente en el espacio protegido.
-- ------------------------------------------------------------------------------------------------
-- Es la tabla que sostiene TODOS los logros de campo. Una fila = una sesión de presencia continua en
-- un espacio: la app va enviando posiciones del GPS (Backend/Api/presence.php) y cada una se valida
-- contra el límite oficial del espacio antes de acumularse aquí. `verified` no lo pide nadie: se
-- calcula (presencia sostenida = varios fixes repartidos en varios minutos) y una visita marcada como
-- sospechosa no lo alcanza nunca. Ver Backend/Lib/presence.php y Docs/VERIFICACION-Y-ANTITRAMPAS.md.
--
-- Privacidad: NO se guarda la traza del paseo, solo el agregado de la visita y la última posición
-- (necesaria para encadenar el siguiente fix y detectar saltos imposibles). Con eso basta para los
-- logros y no se convierte a la app en un registro de por dónde anda la gente.
CREATE TABLE IF NOT EXISTS user_park_visits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    park_slug VARCHAR(120) NOT NULL,
    -- Fechas en UTC (las escribe PHP con gmdate, nunca NOW(), para no depender de la zona del motor).
    started_at DATETIME NOT NULL,
    last_fix_at DATETIME NOT NULL,
    fix_count INT NOT NULL DEFAULT 0,
    -- Metros recorridos dentro del espacio (suma de tramos entre fixes válidos). De aquí salen los
    -- logros de kilómetros de campo, que son los que no se pueden fingir sentado.
    distance_m INT NOT NULL DEFAULT 0,
    best_accuracy_m SMALLINT UNSIGNED NULL,
    last_lat DECIMAL(10,6) NULL,
    last_lng DECIMAL(10,6) NULL,
    -- Fixes seguidos con la coordenada EXACTAMENTE igual: un GPS real siempre baila unos metros, así
    -- que una racha larga delata una posición fijada a mano.
    frozen_streak SMALLINT NOT NULL DEFAULT 0,
    verified TINYINT(1) NOT NULL DEFAULT 0,
    verified_at DATETIME NULL,
    -- Cuarentena, no castigo: una visita sospechosa no puntúa, pero no se borra ni bloquea la cuenta.
    -- `flags` guarda los motivos ('salto_imposible', 'gps_congelado'...) para poder auditarlo después.
    suspicious TINYINT(1) NOT NULL DEFAULT 0,
    flags JSON NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_park_visits_park (user_id, park_slug, last_fix_at),
    INDEX idx_user_park_visits_window (user_id, verified, started_at)
);

-- Registro de actividad (día en que el usuario marcó algo visto en un parque concreto). Tabla
-- histórica: desde la verificación de presencia, la constancia (días de campo, rachas, volver al
-- mismo sitio) sale de user_park_visits, porque marcar algo se puede hacer desde el sofá y estar
-- en el monte no. Se mantiene porque es un rastro barato y útil para depurar (qué días hubo
-- actividad en la app, con o sin GPS), pero NINGÚN logro depende ya de ella.
CREATE TABLE IF NOT EXISTS user_activity_log (
    user_id INT NOT NULL,
    park_slug VARCHAR(120) NOT NULL,
    activity_date DATE NOT NULL,
    PRIMARY KEY (user_id, park_slug, activity_date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Especies invasoras que el usuario ha marcado como identificadas (ficha vista/reconocida). Es dato
-- propio (no derivable): especies_invasoras es un catálogo nacional de solo lectura, sin ningún otro
-- rastro de interacción del usuario.
CREATE TABLE IF NOT EXISTS user_invasive_sightings (
    user_id INT NOT NULL,
    invasive_id INT NOT NULL,
    seen_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, invasive_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (invasive_id) REFERENCES especies_invasoras(id) ON DELETE CASCADE
);

-- Términos del glosario que el usuario ha consultado (abierto su popover al menos una vez).
CREATE TABLE IF NOT EXISTS user_glossary_views (
    user_id INT NOT NULL,
    term_id INT NOT NULL,
    viewed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, term_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (term_id) REFERENCES glosario(id) ON DELETE CASCADE
);

-- ================================================================================================
-- OCURRENCIAS EN DARWIN CORE: la capa científica del avistamiento.
-- ------------------------------------------------------------------------------------------------
-- Por qué existe: hasta aquí, un avistamiento era una entrada dentro del JSON de user_progress.payload
-- indexada por el species_id DE ESE PARQUE. Eso sirve para pintar la app y no sirve para nada más: no
-- se puede consultar, una especie solo admite un avistamiento por espacio, y le faltan justo las
-- piezas que hacen publicable una cita —identificador estable, hora con huso, incertidumbre de la
-- coordenada, taxonomía con identificadores y estado de verificación—.
--
-- Aquí las COLUMNAS SON TÉRMINOS DARWIN CORE, no una traducción a posteriori: `event_date` es
-- dwc:eventDate y `decimal_latitude` es dwc:decimalLatitude. La correspondencia completa columna ↔
-- término ↔ URI se declara una sola vez en Backend/Lib/dwc.php, y de ahí salen el occurrence.txt y
-- el meta.xml del Darwin Core Archive (Tools/export-dwc.php). Ver Docs/DARWIN-CORE.md.
--
-- Relación con user_progress: NINGUNA de sustitución. user_progress sigue siendo lo que la app lee y
-- lo que hace que el progreso sea local-first; esta tabla se DERIVA de aquello y añade lo que la app
-- no necesita. Borrar una fila de aquí no le quita nada al usuario en la app.
--
-- Aviso permanente (regla 7 del CLAUDE.md): cada fila es una observación ciudadana SIN validar por un
-- experto, y así sale etiquetada en identification_verification_status. No es dato oficial.
--
-- OJO al escribir SQL a mano: `class` y `order` son palabras reservadas de MySQL y necesitan
-- comillas invertidas. Se llaman así a propósito —son los términos dwc:class y dwc:order— porque el
-- objetivo de la tabla es no tener que traducir nada.
CREATE TABLE IF NOT EXISTS user_occurrences (
    -- --- Identidad y reconciliación (esto NO es Darwin Core: es la costura con el resto del modelo) ---
    -- dwc:occurrenceID. UUID v4 aleatorio, estable para siempre y expuesto como URN 'urn:uuid:…'.
    -- NUNCA un autoincremento: un identificador correlativo revela el tamaño del conjunto y deja de
    -- ser único en cuanto estos datos se fusionen con los de otro proveedor.
    occurrence_id CHAR(36) NOT NULL PRIMARY KEY,
    user_id INT NOT NULL,
    -- De qué marca del usuario deriva esta ocurrencia: 'especie:<park_slug>:<species_id>' o
    -- 'invasora:<invasive_id>'. Es la clave que hace IDEMPOTENTE tanto la escritura en caliente como
    -- la migración: reprocesar lo mismo actualiza la fila y conserva su occurrence_id.
    source_key VARCHAR(190) NOT NULL,
    occurrence_kind ENUM('especie','invasora') NOT NULL DEFAULT 'especie',
    -- Referencias al catálogo, SIN clave foránea a propósito: species se regenera espacio a espacio
    -- (build-park-sql.js) y un borrado en cascada se llevaría por delante la observación de una
    -- persona, que es dato propio y no derivado. Si la ficha desaparece, la cita sigue siendo válida:
    -- lleva su taxonomía copiada.
    catalog_species_id INT NULL,
    catalog_invasive_id INT NULL,
    park_slug VARCHAR(120) NULL,

    -- --- Registro (dwc: Record-level) ---
    basis_of_record VARCHAR(40) NOT NULL DEFAULT 'HumanObservation',
    occurrence_status VARCHAR(20) NOT NULL DEFAULT 'present',
    -- La app no pregunta cuántos ejemplares se vieron: se deja NULL en vez de escribir 1, que sería
    -- afirmar algo que nadie ha dicho.
    individual_count INT UNSIGNED NULL,
    occurrence_remarks TEXT NULL,
    recorded_by VARCHAR(160) NULL,
    recorded_by_id VARCHAR(120) NULL,
    modified DATETIME NOT NULL,

    -- --- Evento (dwc: Event) ---
    -- dwc:eventID ⇒ la VISITA VERIFICADA (user_park_visits.id). Con esto cada ocurrencia hereda la
    -- trazabilidad de calidad de la visita: cuántos fixes, cuánto tiempo, qué precisión.
    event_id INT NULL,
    -- Fechas SIEMPRE en UTC y escritas por PHP con gmdate, nunca con NOW(): el motor puede estar en
    -- cualquier huso y una fecha de ocurrencia sin huso no vale para nada.
    event_date DATETIME NOT NULL,
    sampling_protocol VARCHAR(190) NULL,

    -- --- Lugar (dwc: Location) ---
    decimal_latitude DECIMAL(10,6) NULL,
    decimal_longitude DECIMAL(10,6) NULL,
    geodetic_datum VARCHAR(20) NOT NULL DEFAULT 'WGS84',
    -- La pieza que faltaba: la precisión del GPS en el momento de marcar. Sin ella un registro es
    -- inservible para casi cualquier análisis, y hasta ahora se recibía en presence.php y se tiraba.
    coordinate_uncertainty_in_meters INT UNSIGNED NULL,
    georeference_protocol VARCHAR(190) NULL,
    country_code CHAR(2) NOT NULL DEFAULT 'ES',
    state_province VARCHAR(120) NULL,
    county VARCHAR(120) NULL,
    locality VARCHAR(255) NULL,
    location_id VARCHAR(190) NULL,

    -- --- Taxón (dwc: Taxon). Copiado, no referenciado: una cita publicada no puede cambiar de
    -- especie porque alguien reconcilie el catálogo tres años después. ---
    scientific_name VARCHAR(255) NOT NULL,
    taxon_rank VARCHAR(40) NULL,
    -- OJO: dwc:kingdom es el reino TAXONÓMICO ('Plantae'), no el 'flora'/'fauna' de species.kingdom,
    -- que es una agrupación de la interfaz. La traducción está en dwc.php::dwcKingdom().
    kingdom VARCHAR(60) NULL,
    phylum VARCHAR(120) NULL,
    `class` VARCHAR(120) NULL,
    `order` VARCHAR(120) NULL,
    family VARCHAR(160) NULL,
    genus VARCHAR(120) NULL,
    vernacular_name VARCHAR(255) NULL,
    taxon_id VARCHAR(120) NULL,          -- EIDOS (IEPNB): la nomenclatura canónica del proyecto
    scientific_name_id VARCHAR(190) NULL, -- identificador nomenclatural (IPNI/IF): hoy no lo tenemos
    taxon_concept_id VARCHAR(200) NULL,   -- clave GBIF como URL

    -- --- Calidad de la identificación ---
    -- Dice las dos cosas que un banco de datos necesita saber: que nadie ha validado la
    -- identificación (siempre) y si consta que la persona estaba dentro del espacio. Se recalcula
    -- cuando la visita se verifica, que ocurre minutos DESPUÉS de marcar.
    identification_verification_status VARCHAR(190) NOT NULL,
    identified_by VARCHAR(160) NULL,
    date_identified DATETIME NULL,

    -- --- Derechos ---
    license VARCHAR(190) NULL,
    rights_holder VARCHAR(160) NULL,
    institution_code VARCHAR(60) NULL,
    dataset_name VARCHAR(190) NULL,
    dataset_id VARCHAR(120) NULL,

    -- --- Sensibilidad. Se rellenan al EXPORTAR, no al guardar: el dato fino se conserva siempre en
    -- la base y lo que se generaliza es la publicación (Docs/DARWIN-CORE.md §sensibilidad). ---
    information_withheld TEXT NULL,
    data_generalizations TEXT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_occurrence_source (user_id, source_key),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES user_park_visits(id) ON DELETE SET NULL,
    INDEX idx_user_occurrences_user (user_id, event_date),
    INDEX idx_user_occurrences_taxon (scientific_name),
    INDEX idx_user_occurrences_park (park_slug, event_date)
);
