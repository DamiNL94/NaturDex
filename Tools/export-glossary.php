<?php
// ================================================================================================
// export-glossary.php — regenera Frontend/Data/glosario.json desde la base de datos (CLI).
// ------------------------------------------------------------------------------------------------
// La lógica de la forma del JSON vive en Backend/Lib/glossary_payload.php (compartida con el endpoint
// Backend/Api/glossary.php). La BD es la fuente de verdad; esto genera la copia empaquetada que la app
// usa sin conexión. Uso:  php Tools/export-glossary.php
// ================================================================================================
require_once __DIR__ . "/../Backend/Config/db.php";
require_once __DIR__ . "/../Backend/Lib/glossary_payload.php";

$FRONTEND = __DIR__ . "/../Frontend";
$payload = buildGlossaryPayload($conn);

$path = $FRONTEND . "/Data/glosario.json";
$written = file_put_contents($path, json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . "\n");
if ($written === false) {
    fwrite(STDERR, "No se pudo escribir Data/glosario.json (¿permisos en Frontend/Data?).\n");
    exit(1);
}
echo "Glosario exportado: " . count($payload) . " términos -> Data/glosario.json\n";
