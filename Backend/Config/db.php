<?php
// Conexión a MySQL. Lee la configuración de variables de entorno (para Docker / producción) y, si
// no están definidas, cae a los valores de XAMPP en local (localhost / root / sin contraseña), de
// modo que el desarrollo con XAMPP sigue funcionando sin tocar nada.
//
// Orden de precedencia de la configuración:
//   1. DB_HOST / DB_NAME / DB_USER / DB_PASS / DB_PORT   -> docker-compose.yml, .env, XAMPP
//   2. MYSQLHOST / MYSQLDATABASE / MYSQLUSER / ...        -> [RAILWAY] plugin de MySQL
//   3. MYSQL_URL o DATABASE_URL (mysql://user:pass@host:port/db) -> [RAILWAY] variable única
//   4. Valores por defecto de XAMPP
//
// [RAILWAY] Los bloques marcados así existen solo para el despliegue en Railway, que inyecta las
// credenciales con SUS propios nombres de variable (MYSQL*) en vez de los DB_* que usa el resto
// del proyecto. Cuando se deje de usar Railway se pueden borrar sin tocar nada más: la precedencia
// hace que DB_* siempre gane, así que Docker y XAMPP se comportan igual con o sin ellos.

/**
 * Devuelve el valor de la primera variable de entorno definida y no vacía.
 *
 * Se consultan getenv(), $_ENV y $_SERVER porque, según cómo se pase la variable al proceso
 * (entorno del contenedor, SetEnv/PassEnv de Apache, php-fpm...), acaba en unos sitios u otros.
 */
function naturdex_env(array $names) {
    foreach ($names as $name) {
        foreach ([getenv($name), $_ENV[$name] ?? false, $_SERVER[$name] ?? false] as $value) {
            if (is_string($value) && $value !== "") return $value;
        }
    }
    return null;
}

// --- [RAILWAY] Cadena de conexión única -------------------------------------------------------
// Railway publica MYSQL_URL (mysql://usuario:contraseña@host:puerto/base). Si está definida se usa
// como fuente de datos, pero siempre por debajo de las variables sueltas: cualquier DB_* o MYSQL*
// que se defina a mano tiene prioridad sobre lo que venga en la URL.
$url = [];
$rawUrl = naturdex_env(["MYSQL_URL", "DATABASE_URL"]);
if ($rawUrl !== null) {
    $parts = parse_url($rawUrl);
    if (is_array($parts)) {
        $url = [
            "host" => $parts["host"] ?? null,
            "port" => $parts["port"] ?? null,
            "user" => isset($parts["user"]) ? rawurldecode($parts["user"]) : null,
            // La contraseña va urlencoded dentro de la URL: hay que decodificarla o fallará el
            // login cuando contenga caracteres como @, # o /.
            "pass" => isset($parts["pass"]) ? rawurldecode($parts["pass"]) : null,
            "name" => isset($parts["path"]) ? ltrim($parts["path"], "/") : null,
        ];
    }
}
// --- fin [RAILWAY] ----------------------------------------------------------------------------

// DB_PASSWORD se acepta como alias de DB_PASS: es el nombre que usa .env.example (y el que se
// escribe por costumbre al configurar el panel de Railway a mano), y el descuadre entre ambos es
// una fuente clásica de "access denied" difíciles de ver.
$host = naturdex_env(["DB_HOST", "MYSQLHOST"])                  ?? $url["host"] ?? "localhost";
$db   = naturdex_env(["DB_NAME", "MYSQLDATABASE"])              ?? $url["name"] ?? "naturadex";
$user = naturdex_env(["DB_USER", "MYSQLUSER"])                  ?? $url["user"] ?? "root";
$pass = naturdex_env(["DB_PASS", "DB_PASSWORD", "MYSQLPASSWORD"]) ?? $url["pass"] ?? "";
$port = (int) (naturdex_env(["DB_PORT", "MYSQLPORT"])           ?? $url["port"] ?? 3306);

$charset = "utf8mb4";

mysqli_report(MYSQLI_REPORT_OFF);
$conn = @new mysqli($host, $user, $pass, $db, $port);

if ($conn->connect_error) {
    // El detalle del error (host, motivo) se registra en el log del servidor, NO se devuelve al
    // cliente: filtrarlo revelaría información interna de la infraestructura.
    error_log(sprintf(
        "NaturDex: error de conexión a MySQL (host=%s puerto=%d base=%s usuario=%s): %s",
        $host, $port, $db, $user, $conn->connect_error
    ));
    http_response_code(500);
    header("Content-Type: application/json; charset=utf-8");
    echo json_encode(["error" => "Database connection error."]);
    exit;
}

if (!$conn->set_charset($charset)) {
    http_response_code(500);
    header("Content-Type: application/json; charset=utf-8");
    echo json_encode(["error" => "Database charset error."]);
    exit;
}
