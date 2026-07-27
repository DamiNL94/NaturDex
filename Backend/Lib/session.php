<?php
// ================================================================================================
// session.php — sesión de usuario y "seguir conectado" entre aperturas de la app.
// ------------------------------------------------------------------------------------------------
// Por qué existe: la cookie de sesión de PHP muere al cerrar el navegador, y los ficheros de sesión
// del servidor viven en el sistema de ficheros del contenedor, que en Railway es efímero (cada
// redespliegue los borra). Con solo session_start(), el usuario tendría que volver a entrar una y
// otra vez. Es el contrapeso de haber desactivado el modo invitado: si la app exige cuenta, la
// sesión tiene que aguantar.
//
// Mecanismo: patrón selector/validador, el clásico de "recuérdame".
//   · Al entrar se emite un token y se guarda en la cookie `naturdex_remember` con la forma
//     "<selector>:<validador>". En la BD (user_auth_tokens) queda el selector en claro —para poder
//     buscar por índice— y SOLO el hash SHA-256 del validador: quien se lleve la tabla no puede
//     fabricar la cookie, igual que pasa con las contraseñas.
//   · Si llega una petición sin sesión, se busca por selector y se compara el validador con
//     hash_equals() (comparación en tiempo constante, no filtra información por lo que tarda).
//   · El validador ROTA en cada uso: una cookie robada deja de valer en cuanto el dueño legítimo
//     vuelve a abrir la app. El validador anterior se acepta 60 s más (ver naturdexRestoreRemembered).
//   · Caducidad deslizante: mientras se use no expira; tras una parada larga, fuera.
//
// Todas las marcas de tiempo se calculan en SQL (NOW(), INTERVAL) y nunca con date()/strtotime():
// PHP y MySQL pueden estar en zonas horarias distintas y la comparación saldría torcida.
//
// SHA-256 a secas para el validador (no password_hash) es lo correcto aquí: no es una contraseña
// elegida por una persona, son 32 bytes aleatorios, así que no hay nada que descubrir por fuerza
// bruta y sí interesa que la comprobación sea rápida (ocurre en cada arranque de la app).
// ================================================================================================

const NATURDEX_REMEMBER_COOKIE = "naturdex_remember";
const NATURDEX_REMEMBER_DAYS   = 60;   // caducidad deslizante del token
const NATURDEX_ROTATION_GRACE  = 60;   // segundos que sigue valiendo el validador anterior

/**
 * ¿La petición llegó por HTTPS? Detrás del proxy TLS (Caddy en producción, el borde de Railway)
 * el tramo interno es HTTP, así que hay que mirar también X-Forwarded-Proto. Mismo criterio que
 * apiCorsHeaders() en api_cors.php.
 */
function naturdexHttps() {
    return (!empty($_SERVER["HTTPS"]) && $_SERVER["HTTPS"] !== "off")
        || (($_SERVER["HTTP_X_FORWARDED_PROTO"] ?? "") === "https");
}

/**
 * Arranca la sesión y, si no hay ninguna, intenta recuperarla del token de "seguir conectado".
 * Sustituye a session_start() en todos los endpoints que usan sesión. Hay que llamarla DESPUÉS de
 * Config/db.php (necesita $conn) y ANTES de imprimir nada (manda cabeceras Set-Cookie).
 */
function naturdexSessionStart($conn) {
    if (session_status() === PHP_SESSION_ACTIVE) return;

    // Por defecto PHP acepta cualquier identificador de sesión que mande el cliente y crea la
    // sesión con él, lo que permite fijarle a alguien una sesión conocida de antemano. En modo
    // estricto, un identificador que el servidor no haya emitido se descarta y se genera otro.
    ini_set("session.use_strict_mode", "1");
    session_set_cookie_params([
        // Cookie de sesión "de navegador" a propósito: la persistencia la da el token, que sí se
        // puede revocar desde el servidor. Una cookie de sesión larga no se puede retirar.
        "lifetime" => 0,
        "path"     => "/",
        "httponly" => true,
        "secure"   => naturdexHttps(),
        "samesite" => "Lax",
    ]);
    session_start();

    if (empty($_SESSION["user_id"])) naturdexRestoreRemembered($conn);
}

/** Opciones de la cookie del token. $maxAge <= 0 la borra (fecha en el pasado). */
function naturdexRememberCookieOptions($maxAge) {
    return [
        "expires"  => $maxAge > 0 ? time() + $maxAge : 1,
        "path"     => "/",
        "httponly" => true,
        "secure"   => naturdexHttps(),
        "samesite" => "Lax",
    ];
}

function naturdexSetRememberCookie($selector, $validator) {
    setcookie(
        NATURDEX_REMEMBER_COOKIE,
        $selector . ":" . $validator,
        naturdexRememberCookieOptions(NATURDEX_REMEMBER_DAYS * 86400)
    );
}

function naturdexClearRememberCookie() {
    setcookie(NATURDEX_REMEMBER_COOKIE, "", naturdexRememberCookieOptions(0));
    unset($_COOKIE[NATURDEX_REMEMBER_COOKIE]);
}

/** Devuelve [selector, validador] de la cookie, o null si no hay o está mal formada. */
function naturdexRememberCookieParts() {
    $raw = (string) ($_COOKIE[NATURDEX_REMEMBER_COOKIE] ?? "");
    if ($raw === "" || strpos($raw, ":") === false) return null;
    list($selector, $validator) = explode(":", $raw, 2);
    if ($selector === "" || $validator === "") return null;
    return [$selector, $validator];
}

/**
 * Emite un token nuevo para este dispositivo. Se llama al entrar y al registrarse.
 *
 * Si la tabla no existe (base de datos sin migrar), no se rompe nada: prepare() devuelve false, se
 * sale sin cookie y el usuario sigue con la sesión normal de PHP, como antes de todo esto.
 */
function naturdexRememberUser($conn, $userId) {
    $selector  = bin2hex(random_bytes(9));   // 18 caracteres, va en claro y con índice único
    $validator = bin2hex(random_bytes(32));  // 64 caracteres, de él solo se guarda el hash

    $sql = "INSERT INTO user_auth_tokens (user_id, selector, validator_hash, expires_at)
            VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL " . NATURDEX_REMEMBER_DAYS . " DAY))";
    $stmt = $conn->prepare($sql);
    if (!$stmt) return;
    $hash = hash("sha256", $validator);
    $stmt->bind_param("iss", $userId, $selector, $hash);
    if (!$stmt->execute()) return;

    naturdexSetRememberCookie($selector, $validator);

    // Limpieza oportunista: los tokens caducados no sirven para nada y esto ocurre poco (una vez
    // por inicio de sesión), así que no hace falta una tarea programada.
    $conn->query("DELETE FROM user_auth_tokens WHERE expires_at < NOW()");
}

/**
 * Intenta abrir sesión a partir de la cookie del token. Silenciosa: si algo no cuadra, se limpia
 * la cookie y la petición sigue como anónima (cada endpoint ya responde 401 si le hace falta).
 */
function naturdexRestoreRemembered($conn) {
    $parts = naturdexRememberCookieParts();
    if (!$parts) return;
    list($selector, $validator) = $parts;

    // La ventana de gracia se calcula en SQL por lo dicho arriba sobre las zonas horarias.
    $sql = "SELECT id, user_id, validator_hash, previous_hash,
                   (previous_hash IS NOT NULL
                    AND rotated_at > DATE_SUB(NOW(), INTERVAL " . NATURDEX_ROTATION_GRACE . " SECOND)) AS grace
            FROM user_auth_tokens
            WHERE selector = ? AND expires_at > NOW() LIMIT 1";
    $stmt = $conn->prepare($sql);
    if (!$stmt) return;
    $stmt->bind_param("s", $selector);
    if (!$stmt->execute()) return;
    $row = $stmt->get_result()->fetch_assoc();

    // Selector desconocido o caducado: cookie inservible, se retira para no repetir la consulta.
    if (!$row) { naturdexClearRememberCookie(); return; }

    $hash    = hash("sha256", $validator);
    $current = hash_equals($row["validator_hash"], $hash);
    // Validador anterior dentro de la ventana de gracia. Hace falta porque el frontend lanza varias
    // peticiones a la vez al abrir la app (sesión, progreso, logros…): si todas llegan sin sesión,
    // todas canjean la misma cookie y solo la primera ve el validador vigente. Sin esta ventana,
    // las demás lo tomarían por robo y cerrarían la sesión recién abierta.
    $graced  = !$current && (int) $row["grace"] === 1 && hash_equals((string) $row["previous_hash"], $hash);

    if (!$current && !$graced) {
        // Selector válido con validador que no cuadra: o es una cookie vieja de un token ya rotado
        // hace rato, o alguien la ha copiado. En ambos casos el token deja de valer.
        $del = $conn->prepare("DELETE FROM user_auth_tokens WHERE id = ?");
        if ($del) { $del->bind_param("i", $row["id"]); $del->execute(); }
        naturdexClearRememberCookie();
        return;
    }

    $_SESSION["user_id"] = (int) $row["user_id"];
    // Identificador de sesión nuevo al abrirla desde el token (fijación de sesión).
    session_regenerate_id(true);

    // Solo rota quien presentó el validador vigente. Las peticiones que entran por la ventana de
    // gracia no tocan nada: la cookie buena ya se la llevó la primera.
    if ($current) naturdexRotateToken($conn, (int) $row["id"], $selector, $row["validator_hash"]);
}

/** Cambia el validador del token y renueva cookie y caducidad. */
function naturdexRotateToken($conn, $tokenId, $selector, $previousHash) {
    $validator = bin2hex(random_bytes(32));
    $sql = "UPDATE user_auth_tokens
               SET validator_hash = ?, previous_hash = ?, rotated_at = NOW(), last_used_at = NOW(),
                   expires_at = DATE_ADD(NOW(), INTERVAL " . NATURDEX_REMEMBER_DAYS . " DAY)
             WHERE id = ?";
    $stmt = $conn->prepare($sql);
    if (!$stmt) return;
    $hash = hash("sha256", $validator);
    $stmt->bind_param("ssi", $hash, $previousHash, $tokenId);
    if (!$stmt->execute()) return;
    naturdexSetRememberCookie($selector, $validator);
}

/**
 * Olvida SOLO este dispositivo (cerrar sesión). Cerrar sesión en el móvil no tiene por qué echar
 * a la misma cuenta del ordenador.
 */
function naturdexForgetRemembered($conn) {
    $parts = naturdexRememberCookieParts();
    if ($parts) {
        $stmt = $conn->prepare("DELETE FROM user_auth_tokens WHERE selector = ?");
        if ($stmt) { $stmt->bind_param("s", $parts[0]); $stmt->execute(); }
    }
    naturdexClearRememberCookie();
}

/**
 * Revoca los tokens de TODOS los dispositivos de una cuenta. Se usa al cambiar la contraseña: si
 * se cambia porque alguien pudo entrar, dejar vivos los "seguir conectado" antiguos lo haría inútil.
 */
function naturdexForgetAllForUser($conn, $userId) {
    $stmt = $conn->prepare("DELETE FROM user_auth_tokens WHERE user_id = ?");
    if ($stmt) { $stmt->bind_param("i", $userId); $stmt->execute(); }
    naturdexClearRememberCookie();
}
