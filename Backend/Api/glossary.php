<?php
// Endpoint del glosario divulgativo nacional. Sirve la tabla `glosario` como JSON (mismo contenido
// que Frontend/Data/glosario.json, la copia offline que regenera Tools/export-glossary.php).
require_once __DIR__ . "/../Lib/api.php";
require_once __DIR__ . "/../Lib/glossary_payload.php";
$conn = apiBoot();

respond(buildGlossaryPayload($conn));
