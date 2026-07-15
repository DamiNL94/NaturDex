<?php
header("Content-Type: application/json; charset=utf-8");
require_once __DIR__ . "/../Lib/api_cors.php";
apiCorsHeaders();
require_once __DIR__ . "/../Config/db.php";
require_once __DIR__ . "/../Lib/park_payload.php";

// La forma del JSON se define una sola vez en Backend/Lib/park_payload.php (misma fuente que usa
// el exportador Tools/export-park.php para regenerar el park.json offline).
$parkSlug = $_GET["park"] ?? "cabo-cope-puntas-calnegre";
$payload = buildParkPayload($conn, $parkSlug);

if ($payload === null) {
    http_response_code(404);
    echo json_encode(["error" => "Park not found."]);
    exit;
}

echo json_encode($payload, JSON_UNESCAPED_UNICODE);
