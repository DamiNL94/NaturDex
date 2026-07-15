<?php
// Conexión a MySQL. Lee la configuración de variables de entorno (para Docker / producción) y, si
// no están definidas, cae a los valores de XAMPP en local (localhost / root / sin contraseña), de
// modo que el desarrollo con XAMPP sigue funcionando sin tocar nada.
$host    = getenv("DB_HOST") ?: "localhost";
$db      = getenv("DB_NAME") ?: "naturadex";
$user    = getenv("DB_USER") ?: "root";
$pass    = getenv("DB_PASS");
if ($pass === false) $pass = "";               // "" es una contraseña válida (XAMPP por defecto).
$port    = (int) (getenv("DB_PORT") ?: 3306);
$charset = "utf8mb4";

mysqli_report(MYSQLI_REPORT_OFF);
$conn = @new mysqli($host, $user, $pass, $db, $port);

if ($conn->connect_error) {
    // El detalle del error (host, motivo) se registra en el log del servidor, NO se devuelve al
    // cliente: filtrarlo revelaría información interna de la infraestructura.
    error_log("NaturDex: error de conexión a MySQL: " . $conn->connect_error);
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
?>
