<?php
// ================================================================================================
// park_export.php — vuelca un parque de la base de datos al park.json empaquetado (offline).
// ------------------------------------------------------------------------------------------------
// Única definición de la exportación: la usan TANTO Tools/export-park.php (CLI) COMO el botón
// "Publicar cambios offline" del panel de administración (Backend/Api/admin.php). La BD es la
// fuente de verdad del contenido; esto regenera el park.json del parque, su habitats.geojson (los
// polígonos de hábitat viven ahora en la columna habitats.geometry) y los contadores de su
// manifiesto. Las imágenes y el resto de GeoJSON (parque, LIC, ZEPA, senderos) se gestionan aparte.
// ================================================================================================
require_once __DIR__ . "/park_payload.php";

// --- Área geodésica de una geometría GeoJSON (para la propiedad `hectares`) ----------------------
// Fórmula esférica sobre coordenadas lon/lat (misma que usa la app pública para etiquetar áreas):
// reproduce los valores oficiales del INB a 1 decimal y se mantiene viva tras editar un polígono.
function geojsonRingAreaM2($ring) {
    $R = 6378137.0; // radio medio terrestre (WGS84), en metros
    $sum = 0.0;
    $n = count($ring);
    for ($i = 0; $i < $n; $i++) {
        $p1 = $ring[$i];
        $p2 = $ring[($i + 1) % $n];
        $sum += deg2rad($p2[0] - $p1[0]) * (2 + sin(deg2rad($p1[1])) + sin(deg2rad($p2[1])));
    }
    return abs($sum * $R * $R / 2.0);
}
function geojsonPolygonAreaM2($poly) {
    if (!is_array($poly) || count($poly) === 0) return 0.0;
    $area = geojsonRingAreaM2($poly[0]);            // anillo exterior
    for ($i = 1; $i < count($poly); $i++) $area -= geojsonRingAreaM2($poly[$i]); // huecos
    return $area;
}
function geojsonAreaHectares($geom) {
    $m2 = 0.0;
    $type = $geom["type"] ?? "";
    if ($type === "Polygon") {
        $m2 = geojsonPolygonAreaM2($geom["coordinates"]);
    } elseif ($type === "MultiPolygon") {
        foreach ($geom["coordinates"] as $poly) $m2 += geojsonPolygonAreaM2($poly);
    }
    $ha = round($m2 / 10000.0, 1);
    // Los enteros se emiten sin decimal (21.9 pero 1218), como en el habitats.geojson histórico.
    return $ha == (int) $ha ? (int) $ha : $ha;
}

/**
 * Regenera el habitats.geojson del parque desde la columna habitats.geometry de la base de datos.
 * Calca el contrato del fichero histórico (la app pública lo consume tal cual): FeatureCollection en
 * CRS84, propiedades slug, code, name, type, priority, hectares y las de procedencia (source,
 * review) que NO viven en la BD y se conservan del fichero anterior por slug. Formato compacto, sin
 * escapar barras ni unicode y sin salto de línea final, idéntico al original.
 * @return bool  true si se escribió (o no había geojson que regenerar); false si falló la escritura.
 */
function regenerateHabitatsGeojson($conn, $frontendDir, $manifest, $parkSlug) {
    $geoRel = $manifest["geo"]["habitats"] ?? null;
    if (!$geoRel) return true; // el manifiesto no declara habitats.geojson: nada que regenerar
    $geojsonPath = $frontendDir . "/" . $geoRel;

    // Propiedades de procedencia (no editables, ausentes de la BD): se conservan del fichero actual.
    $preserved = [];
    if (is_file($geojsonPath)) {
        $existing = json_decode(file_get_contents($geojsonPath), true);
        foreach (($existing["features"] ?? []) as $feat) {
            $slug = $feat["properties"]["slug"] ?? null;
            if ($slug === null) continue;
            $preserved[$slug] = $feat["properties"];
        }
    }

    $parkStmt = $conn->prepare("SELECT id FROM parks WHERE slug = ? LIMIT 1");
    $parkStmt->bind_param("s", $parkSlug);
    $parkStmt->execute();
    $parkRow = $parkStmt->get_result()->fetch_assoc();
    if (!$parkRow) return true;
    $parkId = (int) $parkRow["id"];

    $stmt = $conn->prepare("SELECT slug, code, name, habitat_type, is_priority, hic_subtipos, fitosociologia, geometry FROM habitats WHERE park_id = ? AND geometry IS NOT NULL ORDER BY name");
    $stmt->bind_param("i", $parkId);
    $stmt->execute();
    $result = $stmt->get_result();

    $features = [];
    while ($row = $result->fetch_assoc()) {
        $slug = $row["slug"];
        if ($slug === null || $slug === "") continue; // sin slug no hay enlace con la app pública
        $geom = json_decode($row["geometry"], true);
        if (!is_array($geom)) continue;
        $type = $geom["type"] ?? "";
        if ($type !== "Polygon" && $type !== "MultiPolygon") continue;

        // Orden de propiedades calcado del fichero histórico + enriquecimiento oficial (subtipos HIC
        // y asociaciones fitosociológicas), que ahora viven en la BD y se emiten desde aquí.
        $props = [
            "slug" => $slug,
            "code" => $row["code"],
            "name" => $row["name"],
            "type" => $row["habitat_type"],
            "priority" => (bool) $row["is_priority"],
            "hectares" => geojsonAreaHectares($geom),
        ];
        if ($row["hic_subtipos"] !== null) $props["hic_subtipos"] = json_decode($row["hic_subtipos"], true);
        if ($row["fitosociologia"] !== null) $props["fitosociologia"] = json_decode($row["fitosociologia"], true);
        $old = $preserved[$slug] ?? [];
        if (isset($old["source"])) $props["source"] = $old["source"];
        if (array_key_exists("review", $old)) $props["review"] = $old["review"];

        $features[] = [
            "type" => "Feature",
            "properties" => $props,
            "geometry" => ["type" => $type, "coordinates" => $geom["coordinates"]],
        ];
    }

    $featureCollection = [
        "type" => "FeatureCollection",
        "name" => "habitats",
        "crs" => ["type" => "name", "properties" => ["name" => "urn:ogc:def:crs:OGC:1.3:CRS84"]],
        "features" => $features,
    ];
    $written = file_put_contents($geojsonPath, json_encode($featureCollection, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    return $written !== false;
}

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

    // 2) habitats.geojson regenerado desde la BD (polígonos de hábitat = fuente de verdad).
    if (!regenerateHabitatsGeojson($conn, $frontendDir, $manifest, $slug)) {
        return ["ok" => false, "error" => "No se pudo escribir el habitats.geojson (¿permisos en Frontend/Data?)."];
    }

    // 3) contadores del manifiesto (derivados de la BD; images/geo se gestionan aparte)
    $counts = [
        "species" => count($payload["species"]),
        "habitats" => count($payload["habitats"]),
        "pointsOfInterest" => count($payload["pointsOfInterest"]),
    ];
    $manifest["counts"] = array_merge($manifest["counts"] ?? [], $counts);
    file_put_contents($manifestPath, json_encode($manifest, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) . "\n");

    return ["ok" => true, "counts" => $counts, "dataPath" => $manifest["data"]];
}
