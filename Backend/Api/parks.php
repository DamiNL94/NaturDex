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

echo json_encode($parks, JSON_UNESCAPED_UNICODE);
?>
