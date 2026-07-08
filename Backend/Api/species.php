<?php
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
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

$habitatStmt = $conn->prepare("SELECT id, slug, code, name, habitat_type, description, is_priority, latitude, longitude, color FROM habitats WHERE park_id = ? ORDER BY name");
$habitatStmt->bind_param("i", $park["id"]);
$habitatStmt->execute();
$habitatResult = $habitatStmt->get_result();
$habitats = [];
$habitatDbIdToSlug = [];
while ($row = $habitatResult->fetch_assoc()) {
    // Si el hábitat todavía no tiene slug/coordenadas (instalación previa a la geolocalización
    // de hábitats), se usa el código como id y se omiten coordenadas: el círculo no se dibuja
    // en el mapa hasta rellenar esos campos, pero el resto de la app sigue funcionando.
    $slug = $row["slug"] ?: $row["code"];
    $habitatDbIdToSlug[$row["id"]] = $slug;
    $habitats[] = [
        "id" => $slug,
        "code" => $row["code"],
        "name" => $row["name"],
        "type" => $row["habitat_type"],
        "description" => $row["description"],
        "priority" => (bool) $row["is_priority"],
        "coordinates" => ($row["latitude"] !== null && $row["longitude"] !== null)
            ? [(float) $row["latitude"], (float) $row["longitude"]]
            : null,
        "color" => $row["color"],
        "speciesIds" => []
    ];
}
$habitatsBySlug = [];
foreach ($habitats as $index => $habitat) {
    $habitatsBySlug[$habitat["id"]] = $index;
}

$relStmt = $conn->prepare("SELECT sh.species_id, sh.habitat_id FROM species_habitats sh JOIN species sp ON sp.id = sh.species_id WHERE sp.park_id = ?");
$relStmt->bind_param("i", $park["id"]);
$relStmt->execute();
$relResult = $relStmt->get_result();
$speciesIdToHabitatSlugs = [];
while ($row = $relResult->fetch_assoc()) {
    $slug = $habitatDbIdToSlug[$row["habitat_id"]] ?? null;
    if ($slug === null) continue;
    $speciesIdToHabitatSlugs[(int) $row["species_id"]][] = $slug;
    if (isset($habitatsBySlug[$slug])) {
        $habitats[$habitatsBySlug[$slug]]["speciesIds"][] = (int) $row["species_id"];
    }
}

$speciesStmt = $conn->prepare("SELECT id, common_name, scientific_name, kingdom, family, primary_habitat, conservation_status, description, identification_tips, seasonality, image_url, latitude, longitude, rarity_score, is_featured, source, taxon_phylum, taxon_class, taxon_order, taxon_family, taxon_genus, iucn_global, spain_status, murcia_status, review_note FROM species WHERE park_id = ? ORDER BY is_featured DESC, common_name ASC");
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
        "featured" => (bool) $row["is_featured"],
        "source" => $row["source"],
        "taxonomy" => [
            "kingdom" => $row["kingdom"] === "flora" ? "Plantae" : "Animalia",
            "phylum" => $row["taxon_phylum"],
            "class" => $row["taxon_class"],
            "order" => $row["taxon_order"],
            "family" => $row["taxon_family"],
            "genus" => $row["taxon_genus"]
        ],
        "iucnGlobal" => $row["iucn_global"],
        "spainStatus" => $row["spain_status"],
        "murciaStatus" => $row["murcia_status"],
        "reviewNote" => $row["review_note"],
        "habitatIds" => $speciesIdToHabitatSlugs[(int) $row["id"]] ?? []
    ];
}

$poiStmt = $conn->prepare("SELECT slug, name, type, description, latitude, longitude FROM points_of_interest WHERE park_id = ? ORDER BY name");
$poiStmt->bind_param("i", $park["id"]);
$poiStmt->execute();
$poiResult = $poiStmt->get_result();
$pointsOfInterest = [];
while ($row = $poiResult->fetch_assoc()) {
    $pointsOfInterest[] = [
        "id" => $row["slug"],
        "name" => $row["name"],
        "type" => $row["type"],
        "description" => $row["description"],
        "coordinates" => [(float) $row["latitude"], (float) $row["longitude"]]
    ];
}

// El límite del parque aún no se modela en la base de datos (pendiente de una columna de
// geometría/PostGIS cuando llegue la cartografía QGIS definitiva). De momento se sirve como
// un trazado aproximado fijo, igual que el usado en el JSON de respaldo del frontend.
$parkBoundary = [
    [37.5490, -1.3930], [37.5446, -1.3975], [37.5389, -1.4037], [37.5292, -1.4166],
    [37.5100, -1.4350], [37.4870, -1.4714], [37.4855, -1.4750], [37.4209, -1.4917],
    [37.4219, -1.5035], [37.4130, -1.5090], [37.4230, -1.4850], [37.4560, -1.4650],
    [37.4864, -1.4332], [37.5050, -1.4200], [37.5300, -1.4050], [37.5490, -1.3930]
];
$parkBoundaryNote = "Límite aproximado dibujado a partir de referencias textuales y puntos conocidos del parque (Calabardina, Torre de Cope, Cabo Cope, Lomo de Bas, Puntas de Calnegre). Es un trazado provisional: se sustituirá por la cartografía oficial cuando esté disponible el proyecto QGIS.";

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
        "summary" => $park["description"],
        "boundary" => $parkBoundary,
        "boundaryNote" => $parkBoundaryNote
    ],
    "habitats" => $habitats,
    "pointsOfInterest" => $pointsOfInterest,
    "species" => $species
], JSON_UNESCAPED_UNICODE);
?>
