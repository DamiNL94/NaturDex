<?php
// Endpoint de especies exóticas invasoras (Catálogo Español de EEI, RD 630/2013), por CCAA.
// ?ccaa=Región de Murcia  -> solo las de esa comunidad (mismo contenido que Frontend/Data/invasoras.json).
require_once __DIR__ . "/../Lib/api.php";
require_once __DIR__ . "/../Lib/invasoras_payload.php";
$conn = apiBoot();

respond(buildInvasorasPayload($conn, $_GET["ccaa"] ?? null));
