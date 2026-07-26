<?php
// Progreso de CUENTA (ámbito estatal, agregado sobre todos los parques) + logros. Complementa a
// progress.php (que sigue siendo por parque y no cambia su contrato). Requiere sesión (auth.php).
session_start();
header("Content-Type: application/json; charset=utf-8");
require_once __DIR__ . "/../Lib/api_cors.php";
apiCorsHeaders();

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") { http_response_code(204); exit; }

require_once __DIR__ . "/../Config/db.php";
require_once __DIR__ . "/../Lib/account_progress.php";

if (empty($_SESSION["user_id"])) {
    http_response_code(401);
    echo json_encode(["error" => "No autenticado."]);
    exit;
}
$userId = (int) $_SESSION["user_id"];
$method = $_SERVER["REQUEST_METHOD"];

if ($method === "GET") {
    echo json_encode(buildAccountPayload($conn, $userId), JSON_UNESCAPED_UNICODE);
    exit;
}

if ($method === "POST") {
    $body = json_decode(file_get_contents("php://input"), true);
    if (!is_array($body) || !isset($body["type"])) {
        http_response_code(400);
        echo json_encode(["error" => "Cuerpo JSON inválido. Se espera { type: 'invasive'|'glossary'|'flags'|'celebrate', ... }."]);
        exit;
    }

    switch ($body["type"]) {
        case "invasive": {
            $scientificName = trim((string) ($body["scientificName"] ?? ""));
            $ccaa = trim((string) ($body["ccaa"] ?? ""));
            if ($scientificName === "") {
                http_response_code(400);
                echo json_encode(["error" => "Se espera { type: 'invasive', scientificName, ccaa? }."]);
                exit;
            }
            if ($ccaa !== "") {
                $stmt = $conn->prepare("SELECT id FROM especies_invasoras WHERE scientific_name = ? AND ccaa = ? LIMIT 1");
                $stmt->bind_param("ss", $scientificName, $ccaa);
            } else {
                $stmt = $conn->prepare("SELECT id FROM especies_invasoras WHERE scientific_name = ? LIMIT 1");
                $stmt->bind_param("s", $scientificName);
            }
            $stmt->execute();
            $row = $stmt->get_result()->fetch_assoc();
            if (!$row) {
                http_response_code(404);
                echo json_encode(["error" => "Especie invasora no encontrada."]);
                exit;
            }
            recordInvasiveSeen($conn, $userId, (int) $row["id"]);
            $result = recomputeAccountProgress($conn, $userId);
            echo json_encode([
                "totals" => $result["aggregates"],
                "newlyUnlocked" => $result["newlyUnlocked"],
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        case "glossary": {
            $term = trim((string) ($body["term"] ?? ""));
            if ($term === "") {
                http_response_code(400);
                echo json_encode(["error" => "Se espera { type: 'glossary', term }."]);
                exit;
            }
            $stmt = $conn->prepare("SELECT id FROM glosario WHERE term = ? LIMIT 1");
            $stmt->bind_param("s", $term);
            $stmt->execute();
            $row = $stmt->get_result()->fetch_assoc();
            if (!$row) {
                http_response_code(404);
                echo json_encode(["error" => "Término de glosario no encontrado."]);
                exit;
            }
            recordGlossaryView($conn, $userId, (int) $row["id"]);
            $result = recomputeAccountProgress($conn, $userId);
            echo json_encode([
                "totals" => $result["aggregates"],
                "newlyUnlocked" => $result["newlyUnlocked"],
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // Logro de sabor "hábitat completado sin buscador": no derivable en servidor, lo reporta el
        // cliente cuando lo detecta. Se guarda de forma pegajosa (ver computeAccountAggregates).
        case "flags": {
            $flags = is_array($body["flags"] ?? null) ? $body["flags"] : [];
            $allowed = array_intersect_key($flags, ["noSearchHabitat" => true]);
            $result = recomputeAccountProgress($conn, $userId, $allowed);
            echo json_encode([
                "totals" => $result["aggregates"],
                "newlyUnlocked" => $result["newlyUnlocked"],
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // El frontend llama esto justo después de mostrar el cartel de celebración de cada logro,
        // para que un refresco de página (o entrar desde otro dispositivo) no lo vuelva a animar.
        case "celebrate": {
            $ids = is_array($body["ids"] ?? null) ? array_values(array_filter($body["ids"], "is_string")) : [];
            markAchievementsCelebrated($conn, $userId, $ids);
            echo json_encode(["ok" => true], JSON_UNESCAPED_UNICODE);
            exit;
        }

        default:
            http_response_code(400);
            echo json_encode(["error" => "type desconocido. Usa 'invasive', 'glossary', 'flags' o 'celebrate'."]);
            exit;
    }
}

http_response_code(405);
echo json_encode(["error" => "Método no permitido. Usa GET o POST."]);
