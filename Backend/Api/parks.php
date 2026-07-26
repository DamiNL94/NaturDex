<?php
header("Content-Type: application/json; charset=utf-8");
require_once __DIR__ . "/../Lib/api_cors.php";
apiCorsHeaders();
require_once __DIR__ . "/../Config/db.php";

// `status` es el nivel de dato del espacio ('basic' ficha base · 'available' catálogo completo ·
// 'planned' anunciado sin datos). Se devuelve para que cualquier cliente de esta API pueda decidir
// si el espacio es abrible y con qué experiencia, sin tener que leer Frontend/Data/parks-index.json.
$sql = "SELECT id, slug, name, category, region, province, municipality, description, latitude, longitude, status FROM parks ORDER BY name";
$result = $conn->query($sql);

if (!$result) {
    http_response_code(500);
    // El fallo típico aquí es una instalación creada con un esquema anterior, sin la columna
    // `status`. Se dice explícitamente en vez de dejar un "Unable to load parks" a secas: ahorra
    // media hora de depuración a quien despliegue sobre una BD antigua.
    $hint = strpos($conn->error, "status") !== false
        ? " Puede que a la base de datos le falte la columna 'status' de la tabla parks: ejecuta Database/migrations.sql."
        : "";
    echo json_encode(["error" => "Unable to load parks." . $hint]);
    exit;
}

$parks = [];
while ($row = $result->fetch_assoc()) {
    $parks[] = [
        "id" => (int) $row["id"],
        "slug" => $row["slug"],
        "name" => $row["name"],
        "category" => $row["category"],
        "region" => $row["region"],
        "province" => $row["province"],
        "municipality" => $row["municipality"],
        "description" => $row["description"],
        "coordinates" => [(float) $row["latitude"], (float) $row["longitude"]],
        "status" => $row["status"]
    ];
}

// Agrupación por comunidad autónoma (region) -> provincia, con la MISMA forma que
// Frontend/Data/parks-index.json (incluido el `status` de cada espacio), para que el selector de
// parques pueda alimentarse indistintamente del registro empaquetado o de esta API.
$byRegion = [];
foreach ($parks as $park) {
    $region = $park["region"] ?: "Sin comunidad";
    $province = $park["province"] ?: "Sin provincia";
    if (!isset($byRegion[$region])) $byRegion[$region] = [];
    if (!isset($byRegion[$region][$province])) $byRegion[$region][$province] = [];
    $byRegion[$region][$province][] = $park;
}
$communities = [];
foreach ($byRegion as $regionName => $provinces) {
    $provList = [];
    foreach ($provinces as $provName => $provParks) {
        $provList[] = ["name" => $provName, "parks" => $provParks];
    }
    $communities[] = ["name" => $regionName, "provinces" => $provList];
}

echo json_encode([
    "parks" => $parks,
    "communities" => $communities
], JSON_UNESCAPED_UNICODE);
