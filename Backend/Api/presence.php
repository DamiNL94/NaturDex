<?php
// ================================================================================================
// presence.php (API) — el único sitio por el que entra una posición del GPS.
// ------------------------------------------------------------------------------------------------
// POST { park, lat, lng, accuracy?, capturedAt? }           un fix suelto (la app abierta en campo)
// POST { park, fixes: [ {lat, lng, accuracy?, capturedAt?} ] }   un lote (cola offline al recuperar red)
// GET  ?park=<slug>                                          estado de presencia en ese espacio
//
// El servidor NO se cree nada de lo que llega: valida cada posición contra el límite oficial del
// espacio y contra la coherencia de la traza (ver Backend/Lib/presence.php). La respuesta dice qué
// se aceptó y por qué, para que la app pueda explicárselo al usuario en castellano en vez de
// dejarle con un logro que no llega y sin saber por qué.
// ================================================================================================
header("Content-Type: application/json; charset=utf-8");
require_once __DIR__ . "/../Lib/api_cors.php";
apiCorsHeaders();

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") { http_response_code(204); exit; }

require_once __DIR__ . "/../Config/db.php";
require_once __DIR__ . "/../Lib/session.php";
require_once __DIR__ . "/../Lib/presence.php";
require_once __DIR__ . "/../Lib/account_progress.php";
naturdexSessionStart($conn);

if (empty($_SESSION["user_id"])) {
    http_response_code(401);
    echo json_encode(["error" => "No autenticado."]);
    exit;
}
$userId = (int) $_SESSION["user_id"];
$method = $_SERVER["REQUEST_METHOD"];

if ($method === "GET") {
    $parkSlug = trim((string) ($_GET["park"] ?? ""));
    if ($parkSlug === "") {
        http_response_code(400);
        echo json_encode(["error" => "Falta el parámetro ?park=<slug>."]);
        exit;
    }
    echo json_encode(presenceCurrentStatus($conn, $userId, $parkSlug), JSON_UNESCAPED_UNICODE);
    exit;
}

if ($method === "POST") {
    $body = json_decode(file_get_contents("php://input"), true);
    $parkSlug = is_array($body) ? trim((string) ($body["park"] ?? "")) : "";
    if (!is_array($body) || $parkSlug === "") {
        http_response_code(400);
        echo json_encode(["error" => "Se espera { park, lat, lng } o { park, fixes: [...] }."]);
        exit;
    }

    $fixes = (isset($body["fixes"]) && is_array($body["fixes"])) ? $body["fixes"] : [$body];
    // Los lotes de la cola offline pueden llegar desordenados (el dispositivo los apila según se
    // vacía la cola). Se ordenan por su hora de captura antes de reconstruir la traza: si no, un fix
    // atrasado parecería un salto hacia atrás en el tiempo.
    usort($fixes, function ($a, $b) {
        return strcmp((string) ($a["capturedAt"] ?? ""), (string) ($b["capturedAt"] ?? ""));
    });
    // Tope defensivo: una cola sana de un día de campo no pasa de unos cientos de posiciones.
    $fixes = array_slice($fixes, 0, 500);

    $results = [];
    foreach ($fixes as $fix) {
        if (!is_array($fix)) continue;
        $results[] = presenceRegisterFix($conn, $userId, $parkSlug, $fix);
    }

    // Que una visita acabe de verificarse puede desbloquear logros de golpe (los que estaban a la
    // espera de que la presencia cuajara): se recalcula aquí para poder devolverlos en el acto.
    $newlyUnlocked = [];
    $accepted = count(array_filter($results, function ($r) { return !empty($r["accepted"]); }));
    if ($accepted) {
        try {
            $accountResult = recomputeAccountProgress($conn, $userId);
            $newlyUnlocked = $accountResult["newlyUnlocked"];
        } catch (Throwable $e) {
            error_log("NaturDex: fallo al recalcular el progreso tras registrar presencia: " . $e->getMessage());
        }
    }

    echo json_encode([
        "status" => presenceCurrentStatus($conn, $userId, $parkSlug),
        "results" => $results,
        "accepted" => $accepted,
        "newlyUnlocked" => $newlyUnlocked,
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

http_response_code(405);
echo json_encode(["error" => "Método no permitido. Usa GET o POST."]);
