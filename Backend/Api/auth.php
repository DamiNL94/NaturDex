<?php
// Autenticación del prototipo: registro, login, logout y comprobación de sesión.
// Cuentas reales en MySQL, contraseñas con hash (password_hash/password_verify), sesión PHP.
// Nota de prototipo: en producción esto debe servirse por HTTPS y endurecer la sesión
// (cookie Secure/SameSite, límites de intentos, verificación de email, etc.).
session_start();
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") { http_response_code(204); exit; }

require_once __DIR__ . "/../Config/db.php";

function respond($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function currentUser($conn) {
    if (empty($_SESSION["user_id"])) return null;
    $stmt = $conn->prepare("SELECT id, email, display_name FROM users WHERE id = ? LIMIT 1");
    $stmt->bind_param("i", $_SESSION["user_id"]);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();
    if (!$user) return null;
    return ["id" => (int) $user["id"], "email" => $user["email"], "name" => $user["display_name"]];
}

$method = $_SERVER["REQUEST_METHOD"];
$action = $_GET["action"] ?? "";

// GET: sesión actual.
if ($method === "GET" && $action === "me") {
    respond(["user" => currentUser($conn)]);
}

if ($method !== "POST") {
    respond(["error" => "Método no permitido."], 405);
}

$body = json_decode(file_get_contents("php://input"), true);
if (!is_array($body)) $body = [];

if ($action === "logout") {
    $_SESSION = [];
    session_destroy();
    respond(["ok" => true]);
}

if ($action === "register") {
    $email = trim(strtolower($body["email"] ?? ""));
    $password = (string) ($body["password"] ?? "");
    $name = trim($body["name"] ?? "");

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) respond(["error" => "Email no válido."], 400);
    if (strlen($password) < 6) respond(["error" => "La contraseña debe tener al menos 6 caracteres."], 400);
    if ($name === "") $name = explode("@", $email)[0];

    $check = $conn->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
    $check->bind_param("s", $email);
    $check->execute();
    if ($check->get_result()->fetch_assoc()) respond(["error" => "Ya existe una cuenta con ese email."], 409);

    $hash = password_hash($password, PASSWORD_DEFAULT);
    $ins = $conn->prepare("INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)");
    $ins->bind_param("sss", $email, $hash, $name);
    if (!$ins->execute()) respond(["error" => "No se pudo crear la cuenta."], 500);

    $_SESSION["user_id"] = $conn->insert_id;
    respond(["user" => currentUser($conn)]);
}

if ($action === "login") {
    $email = trim(strtolower($body["email"] ?? ""));
    $password = (string) ($body["password"] ?? "");

    $stmt = $conn->prepare("SELECT id, password_hash FROM users WHERE email = ? LIMIT 1");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();

    if (!$row || !password_verify($password, $row["password_hash"])) {
        respond(["error" => "Email o contraseña incorrectos."], 401);
    }
    $_SESSION["user_id"] = (int) $row["id"];
    respond(["user" => currentUser($conn)]);
}

respond(["error" => "Acción no reconocida."], 400);
?>
