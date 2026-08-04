<?php
require_once __DIR__ . "/../Lib/api.php";
require_once __DIR__ . "/../Lib/park_payload.php";
$conn = apiBoot();

// La forma del JSON se define una sola vez en Backend/Lib/park_payload.php (misma fuente que usa
// el exportador Tools/export-park.php para regenerar el park.json offline).
$parkSlug = $_GET["park"] ?? "cabo-cope-puntas-calnegre";
$payload = buildParkPayload($conn, $parkSlug);

if ($payload === null) apiError("Park not found.", 404);

respond($payload);
