<?php
// Endpoint de especies exóticas invasoras (Catálogo Español de EEI, RD 630/2013), por CCAA.
// ?ccaa=Región de Murcia  -> solo las de esa comunidad (mismo contenido que Frontend/Data/invasoras.json).
header("Content-Type: application/json; charset=utf-8");
require_once __DIR__ . "/../Lib/api_cors.php";
apiCorsHeaders();
require_once __DIR__ . "/../Config/db.php";
require_once __DIR__ . "/../Lib/invasoras_payload.php";

$ccaa = $_GET["ccaa"] ?? null;
echo json_encode(buildInvasorasPayload($conn, $ccaa), JSON_UNESCAPED_UNICODE);
