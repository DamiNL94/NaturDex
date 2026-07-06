<?php
header("Content-Type: application/json; charset=utf-8");
require_once __DIR__ . "/../Config/db.php";

$parkSlug = $_GET["park"] ?? "cabo-cope-puntas-calnegre";
$parkStmt = $conn->prepare("SELECT id, slug, name, category, region, province, municipality, description, coastline_km, latitude, longitude FROM parks WHERE slug = ? LIMIT 1");
$parkStmt->bind_param("s", $parkSlug);
$parkStmt->execute();
$park = $parkStmt->get_result()->fetch_assoc();

if (!$park) {
    http_response_code(404);
    echo json_encode(["error" => "Park not found."]);
    exit;
}

$habitatStmt = $conn->prepare("SELECT code, name, description, is_priority FROM habitats WHERE park_id = ? ORDER BY name");
$habitatStmt->bind_param("i", $park["id"]);
$habitatStmt->execute();
$habitatResult = $habitatStmt->get_result();
$habitats = [];
while ($row = $habitatResult->fetch_assoc()) {
    $habitats[] = [
        "code" => $row["code"],
        "name" => $row["name"],
        "description" => $row["description"],
        "priority" => (bool) $row["is_priority"]
    ];
}

$speciesStmt = $conn->prepare("SELECT id, common_name, scientific_name, kingdom, family, primary_habitat, conservation_status, description, identification_tips, seasonality, image_url, latitude, longitude, rarity_score, is_featured FROM species WHERE park_id = ? ORDER BY is_featured DESC, common_name ASC");
$speciesStmt->bind_param("i", $park["id"]);
$speciesStmt->execute();
$result = $speciesStmt->get_result();
$species = [];
while ($row = $result->fetch_assoc()) {
    $species[] = [
        "id" => (int) $row["id"],
        "commonName" => $row["common_name"],
        "scientificName" => $row["scientific_name"],
        "kingdom" => $row["kingdom"],
        "group" => $row["family"],
        "habitat" => $row["primary_habitat"],
        "conservationStatus" => $row["conservation_status"],
        "description" => $row["description"],
        "tips" => array_filter(array_map("trim", explode(";", $row["identification_tips"] ?? ""))),
        "seasonality" => $row["seasonality"],
        "image" => $row["image_url"],
        "coordinates" => [(float) $row["latitude"], (float) $row["longitude"]],
        "rarityScore" => (int) $row["rarity_score"],
        "featured" => (bool) $row["is_featured"]
    ];
}

echo json_encode([
    "park" => [
        "id" => (int) $park["id"],
        "slug" => $park["slug"],
        "name" => $park["name"],
        "category" => $park["category"],
        "region" => $park["region"],
        "province" => $park["province"],
        "municipalities" => array_map("trim", explode(" y ", $park["municipality"] ?? "")),
        "center" => [(float) $park["latitude"], (float) $park["longitude"]],
        "coastlineKm" => (float) $park["coastline_km"],
        "summary" => $park["description"]
    ],
    "habitats" => $habitats,
    "species" => $species
], JSON_UNESCAPED_UNICODE);
?>
