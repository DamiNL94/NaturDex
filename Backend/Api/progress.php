<?php
// Progreso del usuario (especies/POIs vistos y avistamientos GPS), ahora POR USUARIO y POR PARQUE.
// Requiere sesión iniciada (auth.php). Se guarda en la tabla user_progress como un JSON con la
// misma forma que antes: { seenSpeciesIds, seenPoiIds, sightings, updatedAt }.
session_start();
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") { http_response_code(204); exit; }

require_once __DIR__ . "/../Config/db.php";

if (empty($_SESSION["user_id"])) {
    http_response_code(401);
    echo json_encode(["error" => "No autenticado."]);
    exit;
}
$userId = (int) $_SESSION["user_id"];
$parkSlug = $_GET["park"] ?? "cabo-cope-puntas-calnegre";

function emptyProgress() {
    return ["seenSpeciesIds" => [], "seenPoiIds" => [], "sightings" => (object) [], "updatedAt" => null];
}

function readProgress($conn, $userId, $parkSlug) {
    $stmt = $conn->prepare("SELECT payload FROM user_progress WHERE user_id = ? AND park_slug = ? LIMIT 1");
    $stmt->bind_param("is", $userId, $parkSlug);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    if (!$row || !$row["payload"]) return emptyProgress();
    $decoded = json_decode($row["payload"], true);
    if (!is_array($decoded)) return emptyProgress();
    $decoded["seenSpeciesIds"] = array_values(array_unique($decoded["seenSpeciesIds"] ?? []));
    $decoded["seenPoiIds"] = array_values(array_unique($decoded["seenPoiIds"] ?? []));
    $decoded["sightings"] = (isset($decoded["sightings"]) && is_array($decoded["sightings"])) ? $decoded["sightings"] : [];
    return $decoded;
}

function writeProgress($conn, $userId, $parkSlug, $progress) {
    if (empty($progress["sightings"])) $progress["sightings"] = (object) [];
    $payload = json_encode($progress, JSON_UNESCAPED_UNICODE);
    $stmt = $conn->prepare(
        "INSERT INTO user_progress (user_id, park_slug, payload) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE payload = VALUES(payload)"
    );
    $stmt->bind_param("iss", $userId, $parkSlug, $payload);
    return $stmt->execute();
}

$method = $_SERVER["REQUEST_METHOD"];

if ($method === "GET") {
    echo json_encode(readProgress($conn, $userId, $parkSlug), JSON_UNESCAPED_UNICODE);
    exit;
}

if ($method === "POST") {
    $body = json_decode(file_get_contents("php://input"), true);
    if (!is_array($body)) {
        http_response_code(400);
        echo json_encode(["error" => "Cuerpo JSON inválido. Se espera { type, id, seen, lat?, lng? }."]);
        exit;
    }
    $type = $body["type"] ?? null;
    $id = $body["id"] ?? null;
    $seen = array_key_exists("seen", $body) ? (bool) $body["seen"] : true;

    if (!in_array($type, ["species", "poi"], true) || $id === null) {
        http_response_code(400);
        echo json_encode(["error" => "Se espera { type: 'species'|'poi', id, seen }."]);
        exit;
    }

    $progress = readProgress($conn, $userId, $parkSlug);
    if (!is_array($progress["sightings"])) $progress["sightings"] = [];
    $key = $type === "species" ? "seenSpeciesIds" : "seenPoiIds";
    $normalizedId = is_numeric($id) ? (int) $id : $id;
    $current = $progress[$key];

    if ($seen) {
        if (!in_array($normalizedId, $current, true)) $current[] = $normalizedId;
    } else {
        $current = array_values(array_filter($current, function ($item) use ($normalizedId) {
            return $item !== $normalizedId;
        }));
    }
    $progress[$key] = $current;

    if ($type === "species") {
        $sightKey = (string) $normalizedId;
        $lat = isset($body["lat"]) && is_numeric($body["lat"]) ? (float) $body["lat"] : null;
        $lng = isset($body["lng"]) && is_numeric($body["lng"]) ? (float) $body["lng"] : null;
        if ($seen && $lat !== null && $lng !== null) {
            $progress["sightings"][$sightKey] = ["lat" => $lat, "lng" => $lng, "at" => gmdate("c")];
        } elseif (!$seen) {
            unset($progress["sightings"][$sightKey]);
        }
    }
    $progress["updatedAt"] = gmdate("c");

    if (!writeProgress($conn, $userId, $parkSlug, $progress)) {
        http_response_code(500);
        echo json_encode(["error" => "No se pudo guardar el progreso."]);
        exit;
    }
    if (empty($progress["sightings"])) $progress["sightings"] = (object) [];
    echo json_encode($progress, JSON_UNESCAPED_UNICODE);
    exit;
}

http_response_code(405);
echo json_encode(["error" => "Método no permitido. Usa GET o POST."]);
?>
