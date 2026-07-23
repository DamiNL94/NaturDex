<?php
// ================================================================================================
// export-invasoras.php — regenera Frontend/Data/invasoras.json desde la base de datos (CLI).
// ------------------------------------------------------------------------------------------------
// Forma del JSON en Backend/Lib/invasoras_payload.php (compartida con Backend/Api/invasoras.php). La BD
// es la fuente de verdad; esto genera la copia empaquetada (todas las CCAA) que la app usa sin conexión,
// filtrando en el frontend por la CCAA del parque. Uso:  php Tools/export-invasoras.php
// ================================================================================================
require_once __DIR__ . "/../Backend/Config/db.php";
require_once __DIR__ . "/../Backend/Lib/invasoras_payload.php";

$FRONTEND = __DIR__ . "/../Frontend";
$payload = buildInvasorasPayload($conn, null);

$path = $FRONTEND . "/Data/invasoras.json";
$written = file_put_contents($path, json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . "\n");
if ($written === false) { fwrite(STDERR, "No se pudo escribir Data/invasoras.json\n"); exit(1); }
echo "Invasoras exportadas: " . count($payload) . " -> Data/invasoras.json\n";
