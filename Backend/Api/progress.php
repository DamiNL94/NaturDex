<?php
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

$dataFile = __DIR__ . "/../Data/progress.json";

function readProgress($path) {
    if (!file_exists($path)) {
        return ["seenSpeciesIds" => [], "seenPoiIds" => [], "updatedAt" => null];
    }
    $raw = file_get_contents($path);
    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) {
        return ["seenSpeciesIds" => [], "seenPoiIds" => [], "updatedAt" => null];
    }
    $decoded["seenSpeciesIds"] = array_values(array_unique($decoded["seenSpeciesIds"] ?? []));
    $decoded["seenPoiIds"] = array_values(array_unique($decoded["seenPoiIds"] ?? []));
    return $decoded;
}

function writeProgress($path, $progress) {
    $handle = fopen($path, "c+");
    if (!$handle) {
        return false;
    }
    flock($handle, LOCK_EX);
    ftruncate($handle, 0);
    rewind($handle);
    fwrite($handle, json_encode($progress, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    fflush($handle);
    flock($handle, LOCK_UN);
    fclose($handle);
    return true;
}

$method = $_SERVER["REQUEST_METHOD"];

if ($method === "GET") {
    echo json_encode(readProgress($dataFile), JSON_UNESCAPED_UNICODE);
    exit;
}

if ($method === "POST") {
    $body = json_decode(file_get_contents("php://input"), true);
    if (!is_array($body)) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid or missing JSON body. Expected { type: 'species'|'poi', id, seen }."]);
        exit;
    }
    $type = $body["type"] ?? null;
    $id = $body["id"] ?? null;
    $seen = array_key_exists("seen", $body) ? (bool) $body["seen"] : true;

    if (!in_array($type, ["species", "poi"], true) || $id === null) {
        http_response_code(400);
        echo json_encode(["error" => "Expected { type: 'species'|'poi', id, seen }."]);
        exit;
    }

    $progress = readProgress($dataFile);
    $key = $type === "species" ? "seenSpeciesIds" : "seenPoiIds";
    $normalizedId = is_numeric($id) ? (int) $id : $id;
    $current = $progress[$key];

    if ($seen) {
        if (!in_array($normalizedId, $current, true)) {
            $current[] = $normalizedId;
        }
    } else {
        $current = array_values(array_filter($current, function ($item) use ($normalizedId) {
            return $item !== $normalizedId;
        }));
    }

    $progress[$key] = $current;
    $progress["updatedAt"] = gmdate("c");

    if (!writeProgress($dataFile, $progress)) {
        http_response_code(500);
        echo json_encode(["error" => "Unable to save progress."]);
        exit;
    }

    echo json_encode($progress, JSON_UNESCAPED_UNICODE);
    exit;
}

http_response_code(405);
echo json_encode(["error" => "Method not allowed. Use GET or POST."]);
?>
