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
    rarity_score TINYINT UNSIGNED DEFAULT 1,
    is_featured BOOLEAN DEFAULT FALSE,
    -- Catálogo público: FALSE oculta la especie del listado/contadores sin borrar el dato ni sus
    -- referencias en species_habitats (criterio: pocas ocurrencias GBIF Y sin figura en ningún
    -- catálogo/anexo oficial de protección). NULL/TRUE = visible, igual que las especies previas a
    -- esta columna (aditivo, no rompe parques ya cargados). Ver Frontend/Js/data.js `applyVisibility`.
    is_visible BOOLEAN DEFAULT TRUE,
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

-- Registro de actividad (día en que el usuario marcó algo visto en un parque concreto). Es la ÚNICA
-- pieza de este bloque que no se puede recalcular desde user_progress: su payload sobrescribe
-- updated_at en cada UPSERT, así que no queda historial de qué días hubo actividad. Tabla pequeña y
-- de solo-inserción (INSERT IGNORE con la fecha de hoy en cada POST a progress.php); de aquí salen
-- "días de salida distintos", "racha de semanas" y "volver al mismo parque en varias fechas".
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
