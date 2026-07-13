<?php
// ================================================================================================
// park_export.php — vuelca un parque de la base de datos al park.json empaquetado (offline).
// ------------------------------------------------------------------------------------------------
// Única definición de la exportación: la usan TANTO Tools/export-park.php (CLI) COMO el botón
// "Publicar cambios offline" del panel de administración (Backend/Api/admin.php). La BD es la
// fuente de verdad del contenido; esto regenera el park.json del parque y los contadores de su
// manifiesto. La geometría (GeoJSON) y las imágenes se gestionan aparte y no se tocan aquí.
// ================================================================================================
require_once __DIR__ . "/park_payload.php";

/**
 * Exporta un parque "available" del registro al park.json de su manifiesto.
 * @param mysqli $conn         Conexión abierta.
 * @param string $frontendDir  Ruta absoluta a Frontend/ (donde viven Data/ y los manifiestos).
 * @param string $parkSlug     Slug del parque en el registro.
 * @return array               ["ok" => bool, "error" => str?, "counts" => [...]?, "dataPath" => str?]
 */
function exportParkToJson($conn, $frontendDir, $parkSlug) {
    $registry = json_decode(@file_get_contents($frontendDir . "/Data/parks-index.json"), true);
    if (!$registry) return ["ok" => false, "error" => "No se pudo leer parks-index.json"];

    $entry = null;
    foreach (($registry["communities"] ?? []) as $c) {
        foreach (($c["provinces"] ?? []) as $p) {
            foreach (($p["parks"] ?? []) as $park) {
                if (($park["slug"] ?? "") === $parkSlug) { $entry = $park; break 3; }
            }
        }
    }
    if (!$entry) return ["ok" => false, "error" => "El parque '$parkSlug' no está en el registro."];
    if (($entry["status"] ?? "") !== "available") return ["ok" => false, "error" => "El parque '$parkSlug' no está disponible."];

    $manifestPath = $frontendDir . "/" . $entry["manifest"];
    if (!is_file($manifestPath)) return ["ok" => false, "error" => "Manifiesto no encontrado: " . $entry["manifest"]];
    $manifest = json_decode(file_get_contents($manifestPath), true);
    $slug = $manifest["apiSlug"] ?? $entry["slug"];

    $payload = buildParkPayload($conn, $slug);
    if ($payload === null) return ["ok" => false, "error" => "El parque '$slug' no está en la base de datos."];

    // 1) park.json (barras escapadas \/ como el park.json histórico)
    $dataPath = $frontendDir . "/" . $manifest["data"];
    file_put_contents($dataPath, json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . "\n");

    // 2) contadores del manifiesto (derivados de la BD; images/geo se gestionan aparte)
    $counts = [
        "species" => count($payload["species"]),
        "habitats" => count($payload["habitats"]),
        "pointsOfInterest" => count($payload["pointsOfInterest"]),
    ];
    $manifest["counts"] = array_merge($manifest["counts"] ?? [], $counts);
    file_put_contents($manifestPath, json_encode($manifest, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) . "\n");

    return ["ok" => true, "counts" => $counts, "dataPath" => $manifest["data"]];
}
