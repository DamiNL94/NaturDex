<?php
// ================================================================================================
// export-park.php — regenera el park.json empaquetado (offline) desde la base de datos.
// ------------------------------------------------------------------------------------------------
// La BD es la fuente de verdad del contenido; este script la vuelca al park.json de cada parque
// "available" del registro y actualiza los contadores del manifiesto. Así la copia offline no
// puede divergir de la API (ambas usan Backend/Lib/park_payload.php). La geometría (GeoJSON) y las
// imágenes se gestionan aparte y no las toca este script.
//
// Uso:  php Tools/export-park.php            (todos los parques "available")
//       php Tools/export-park.php <slug>     (solo ese parque)
// ================================================================================================
require_once __DIR__ . "/../Backend/Config/db.php";
require_once __DIR__ . "/../Backend/Lib/park_payload.php";

$FRONTEND = __DIR__ . "/../Frontend";
$onlySlug = $argv[1] ?? null;

$registry = json_decode(file_get_contents($FRONTEND . "/Data/parks-index.json"), true);
if (!$registry) { fwrite(STDERR, "No se pudo leer parks-index.json\n"); exit(2); }

// Aplana el registro a la lista de parques.
$parks = [];
foreach (($registry["communities"] ?? []) as $c) {
    foreach (($c["provinces"] ?? []) as $p) {
        foreach (($p["parks"] ?? []) as $park) { $parks[] = $park; }
    }
}

$parkJsonOpts = JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT;                        // barras escapadas (\/), como el park.json actual
$manifestOpts = JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT; // rutas legibles en el manifiesto

$exported = 0;
foreach ($parks as $park) {
    if (($park["status"] ?? "") !== "available") continue;
    if ($onlySlug && $park["slug"] !== $onlySlug) continue;

    $manifestPath = $FRONTEND . "/" . $park["manifest"];
    if (!is_file($manifestPath)) { fwrite(STDERR, "  ✗ manifiesto no encontrado: " . $park["manifest"] . "\n"); continue; }
    $manifest = json_decode(file_get_contents($manifestPath), true);
    $slug = $manifest["apiSlug"] ?? $park["slug"];

    $payload = buildParkPayload($conn, $slug);
    if ($payload === null) { fwrite(STDERR, "  ✗ el parque '" . $slug . "' no está en la base de datos\n"); continue; }

    // 1) park.json
    $dataPath = $FRONTEND . "/" . $manifest["data"];
    file_put_contents($dataPath, json_encode($payload, $parkJsonOpts) . "\n");

    // 2) contadores del manifiesto (los derivados de la BD; images/geo se gestionan aparte)
    $manifest["counts"] = array_merge($manifest["counts"] ?? [], [
        "species" => count($payload["species"]),
        "habitats" => count($payload["habitats"]),
        "pointsOfInterest" => count($payload["pointsOfInterest"]),
    ]);
    file_put_contents($manifestPath, json_encode($manifest, $manifestOpts) . "\n");

    echo "  ✓ " . $slug . ": " . count($payload["habitats"]) . " hábitats, "
        . count($payload["species"]) . " especies, " . count($payload["pointsOfInterest"]) . " POIs -> "
        . $manifest["data"] . "\n";
    $exported++;
}

echo "Exportados " . $exported . " parque(s) desde la base de datos.\n";
