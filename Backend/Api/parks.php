<?php
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
require_once __DIR__ . "/../Config/db.php";

$sql = "SELECT id, slug, name, category, region, province, municipality, description, latitude, longitude FROM parks ORDER BY name";
$result = $conn->query($sql);

if (!$result) {
    http_response_code(500);
    echo json_encode(["error" => "Unable to load parks."]);
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
        "coordinates" => [(float) $row["latitude"], (float) $row["longitude"]]
    ];
}

// Agrupación por comunidad autónoma (region) -> provincia, pensada para escalar el selector de
// parques cuando haya más de uno. En este prototipo solo devuelve Cabo Cope y Puntas de Calnegre.
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
?>
