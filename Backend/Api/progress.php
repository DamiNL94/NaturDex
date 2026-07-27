<?php
// Progreso del usuario (especies/POIs vistos y avistamientos GPS), ahora POR USUARIO y POR PARQUE.
// Requiere sesión iniciada (auth.php). Se guarda en la tabla user_progress como un JSON con la
// misma forma que antes: { seenSpeciesIds, seenPoiIds, sightings, updatedAt }.
header("Content-Type: application/json; charset=utf-8");
require_once __DIR__ . "/../Lib/api_cors.php";
apiCorsHeaders();

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") { http_response_code(204); exit; }

require_once __DIR__ . "/../Config/db.php";
require_once __DIR__ . "/../Lib/session.php";
require_once __DIR__ . "/../Lib/account_progress.php";
naturdexSessionStart($conn);

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

/**
 * Aplica un evento { type, id, seen, lat?, lng? } sobre el progreso en memoria.
 * Devuelve false si el evento está mal formado (el llamante decide si abortar o saltárselo).
 * Es idempotente a propósito: marcar dos veces lo mismo no duplica, que es lo que permite a la
 * app reintentar su cola de pendientes sin llevar la cuenta de qué llegó y qué no.
 */
function applyProgressEvent(&$progress, $event) {
    if (!is_array($event)) return false;
    $type = $event["type"] ?? null;
    $id = $event["id"] ?? null;
    if (!in_array($type, ["species", "poi"], true) || $id === null) return false;

    $seen = array_key_exists("seen", $event) ? (bool) $event["seen"] : true;
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
        $lat = isset($event["lat"]) && is_numeric($event["lat"]) ? (float) $event["lat"] : null;
        $lng = isset($event["lng"]) && is_numeric($event["lng"]) ? (float) $event["lng"] : null;
        if ($seen && $lat !== null && $lng !== null) {
            $progress["sightings"][$sightKey] = ["lat" => $lat, "lng" => $lng, "at" => gmdate("c")];
        } elseif (!$seen) {
            unset($progress["sightings"][$sightKey]);
        }
    }
    return true;
}

if ($method === "POST") {
    $body = json_decode(file_get_contents("php://input"), true);
    if (!is_array($body)) {
        http_response_code(400);
        echo json_encode(["error" => "Cuerpo JSON inválido. Se espera { type, id, seen, lat?, lng? } o { events: [...] }."]);
        exit;
    }

    // Dos formas admitidas: un evento suelto (marcar una especie con la app abierta) o un lote
    // { events: [...] }, que es como la app vacía de golpe lo que se marcó sin cobertura. El lote
    // importa porque cada POST recalcula el progreso de cuenta entero: una excursión de 20
    // especies serían 20 recálculos y aquí es uno solo.
    $isBatch = isset($body["events"]) && is_array($body["events"]);
    $events = $isBatch ? $body["events"] : [$body];

    $progress = readProgress($conn, $userId, $parkSlug);
    if (!is_array($progress["sightings"])) $progress["sightings"] = [];

    $applied = 0;
    foreach ($events as $event) {
        if (applyProgressEvent($progress, $event)) {
            $applied++;
        } elseif (!$isBatch) {
            http_response_code(400);
            echo json_encode(["error" => "Se espera { type: 'species'|'poi', id, seen }."]);
            exit;
        }
        // En un lote, un evento corrupto se ignora en vez de tumbar el envío entero: si no, ese
        // evento se quedaría atascado en la cola del dispositivo reintentándose para siempre.
    }
    if ($isBatch && $applied === 0) {
        http_response_code(400);
        echo json_encode(["error" => "El lote no traía ningún evento válido."]);
        exit;
    }
    $progress["updatedAt"] = gmdate("c");

    if (!writeProgress($conn, $userId, $parkSlug, $progress)) {
        http_response_code(500);
        echo json_encode(["error" => "No se pudo guardar el progreso."]);
        exit;
    }
    if (empty($progress["sightings"])) $progress["sightings"] = (object) [];

    // Capa de cuenta (ámbito estatal): registra el día de actividad y recalcula agregados/logros.
    // Va DESPUÉS de guardar el progreso del parque y nunca puede tumbar la respuesta de progress.php:
    // si algo falla aquí, el progreso por parque ya se guardó igual (se degrada, no se rompe).
    $newlyUnlocked = [];
    try {
        logActivity($conn, $userId, $parkSlug);
        $accountResult = recomputeAccountProgress($conn, $userId);
        $newlyUnlocked = $accountResult["newlyUnlocked"];
    } catch (Throwable $e) {
        error_log("NaturDex: fallo al recalcular el progreso de cuenta: " . $e->getMessage());
    }
    $progress["newlyUnlocked"] = $newlyUnlocked;
    echo json_encode($progress, JSON_UNESCAPED_UNICODE);
    exit;
}

http_response_code(405);
echo json_encode(["error" => "Método no permitido. Usa GET o POST."]);
