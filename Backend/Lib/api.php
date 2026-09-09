<?php
// ================================================================================================
// api.php — arranque y respuestas comunes de los endpoints de Backend/Api/.
// ------------------------------------------------------------------------------------------------
// Los nueve endpoints repetían el mismo prólogo (cabecera JSON, CORS, corte del preflight OPTIONS,
// carga de la conexión y de la sesión, guardia de autenticación) y tres de ellos declaraban su
// propia función `respond()` idéntica. Aquí está una sola vez.
//
// Además de quitar la repetición, esto cierra un fallo silencioso que la copia dejaba pasar: cuando
// `json_encode` fracasa —basta un byte inválido en un texto libre del catálogo— devuelve `false`,
// que se imprime como cuerpo VACÍO con un 200. El cliente veía «respuesta no es JSON» sin más
// pista. `respond()` lo detecta y responde un 500 con el motivo real.
//
// Uso típico de un endpoint público de solo lectura:
//     require_once __DIR__ . "/../Lib/api.php";
//     $conn = apiBoot();                       // cabeceras + CORS + OPTIONS + BD
//     respond(buildParkPayload($conn, $slug));
//
// Y de uno que exige sesión:
//     require_once __DIR__ . "/../Lib/api.php";
//     $conn = apiBoot(["session" => true]);
//     $userId = requireUserId();
// ================================================================================================

require_once __DIR__ . "/api_cors.php";

/**
 * Prólogo común. Devuelve la conexión `$conn` de Config/db.php.
 *
 * Opciones:
 *   cors    (bool, por defecto true)  cabeceras CORS de mismo origen. `false` en admin.php, que es
 *                                     solo mismo origen y no debe anunciar nada.
 *   session (bool, por defecto false) abre la sesión con naturdexSessionStart() (recupera además
 *                                     la sesión desde el token de "seguir conectado").
 *   db      (bool, por defecto true)  abre la conexión a MySQL. `false` en los endpoints que NO
 *                                     tocan la base (hoy solo tiempo.php, que es un proxy a AEMET).
 *
 * Por qué existe `db`: sin ella, un endpoint que no consulta nada de la base MUERE con la base.
 * `Config/db.php` responde 500 y termina el proceso si no puede conectar, así que `tiempo.php`
 * —que solo habla con AEMET— devolvía «Database connection error» con MySQL parado. La alternativa
 * era no llamar a apiBoot() en ese endpoint, y eso es peor: se perderían las cabeceras, el CORS y
 * el corte del preflight, que es exactamente la repetición que este fichero vino a quitar. Con la
 * opción, la convención «todo endpoint arranca por apiBoot()» sigue valiendo para todos.
 * Devuelve null cuando `db` es false: un endpoint que la pide es que la usa.
 */
function apiBoot(array $options = []) {
    header("Content-Type: application/json; charset=utf-8");

    if ($options["cors"] ?? true) {
        apiCorsHeaders();
        // El preflight se corta ANTES de tocar la base de datos: es una pregunta sobre cabeceras,
        // no una petición de datos, y abrir la conexión para contestarla es trabajo tirado.
        if (($_SERVER["REQUEST_METHOD"] ?? "") === "OPTIONS") { http_response_code(204); exit; }
    }

    if (!($options["db"] ?? true)) {
        // Sin base, pero con `naturdex_env()` disponible: es la única puerta a las credenciales del
        // entorno (AEMET_API_KEY entre ellas). Config/env.php la trae SIN conectar a nada, que es
        // para lo que se separó de db.php.
        require_once __DIR__ . "/../Config/env.php";
        return null;
    }

    // `global $conn` va ANTES del require, no después: un fichero incluido hereda el ámbito de
    // donde se incluye, así que dentro de esta función el `$conn = new mysqli(...)` de db.php
    // crearía una variable LOCAL. Declarándolo global primero, la asignación cae donde debe y el
    // endpoint que llama a apiBoot() ve la conexión igual que cuando incluía db.php directamente.
    global $conn;
    require_once __DIR__ . "/../Config/db.php";

    if ($options["session"] ?? false) {
        require_once __DIR__ . "/session.php";
        naturdexSessionStart($conn);
    }
    return $conn;
}

/** Responde con JSON y termina. Nunca deja un cuerpo vacío con un 200 por un fallo de codificación. */
function respond($data, $code = 200) {
    $json = json_encode($data, JSON_UNESCAPED_UNICODE);
    if ($json === false) {
        http_response_code(500);
        echo json_encode([
            "error" => "No se pudo serializar la respuesta: " . json_last_error_msg(),
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    http_response_code($code);
    echo $json;
    exit;
}

/** Atajo para los errores: `apiError("No autenticado.", 401)`. */
function apiError($message, $code = 400) {
    respond(["error" => $message], $code);
}

/**
 * Id del usuario de la sesión, o 401 y fin. Requiere que `apiBoot` se haya llamado con
 * `["session" => true]`.
 */
function requireUserId() {
    if (empty($_SESSION["user_id"])) apiError("No autenticado.", 401);
    return (int) $_SESSION["user_id"];
}

/**
 * Cuerpo JSON de la petición como array asociativo, o 400 con el mensaje que corresponda a este
 * endpoint. `$expected` describe la forma esperada, para que el error sea accionable.
 */
function requireJsonBody($expected = "un objeto JSON") {
    $body = json_decode(file_get_contents("php://input"), true);
    if (!is_array($body)) apiError("Cuerpo JSON inválido. Se espera " . $expected . ".", 400);
    return $body;
}

/** Cierre estándar de un endpoint: el método no está contemplado. */
function apiMethodNotAllowed($allowed = "GET o POST") {
    apiError("Método no permitido. Usa " . $allowed . ".", 405);
}
