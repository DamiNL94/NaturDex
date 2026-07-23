<?php
// Endpoint del glosario divulgativo nacional. Sirve la tabla `glosario` como JSON (mismo contenido
// que Frontend/Data/glosario.json, la copia offline que regenera Tools/export-glossary.php).
header("Content-Type: application/json; charset=utf-8");
require_once __DIR__ . "/../Lib/api_cors.php";
apiCorsHeaders();
require_once __DIR__ . "/../Config/db.php";
require_once __DIR__ . "/../Lib/glossary_payload.php";

echo json_encode(buildGlossaryPayload($conn), JSON_UNESCAPED_UNICODE);
