<?php
// ================================================================================================
// geo.php — geometría oficial de los espacios protegidos, del lado del SERVIDOR.
// ------------------------------------------------------------------------------------------------
// El límite de cada parque no vive en la base de datos (es cartografía oficial descargada del
// organismo competente, ver Docs y `Frontend/Data/parks/<provincia>/<slug>/geo/parque.geojson`).
// Hasta ahora solo lo usaba el mapa del frontend para pintar el contorno; desde la verificación de
// presencia (Backend/Lib/presence.php) también es una REGLA: decide si una posición GPS está dentro
// del espacio protegido o no, y esa decisión no puede tomarla el cliente.
//
// Por eso este módulo lee los mismos ficheros que sirve el frontend, resolviéndolos por el registro
// de parques (Frontend/Data/parks-index.json → manifest.json → geo.parque), igual que
// account_progress.php lee Frontend/Data/achievements.json: fuente única, sin duplicar el dato.
// ================================================================================================

/** Ruta absoluta a un recurso publicado por el frontend (las rutas del registro son relativas a él). */
function naturdexFrontendPath($relative) {
    return __DIR__ . "/../../Frontend/" . ltrim((string) $relative, "/");
}

/** Registro de parques completo (cacheado en memoria del proceso). */
function naturdexParkRegistry() {
    static $cache = null;
    if ($cache !== null) return $cache;
    $raw = @file_get_contents(naturdexFrontendPath("Data/parks-index.json"));
    $data = $raw ? json_decode($raw, true) : null;
    $cache = is_array($data) ? $data : [];
    return $cache;
}

/** Entrada del registro de un parque por su slug, o null si no está registrado. */
function naturdexParkEntry($slug) {
    foreach ((naturdexParkRegistry()["communities"] ?? []) as $community) {
        foreach (($community["provinces"] ?? []) as $province) {
            foreach (($province["parks"] ?? []) as $park) {
                if (($park["slug"] ?? null) === $slug) return $park;
            }
        }
    }
    return null;
}

// --- Carga del límite oficial --------------------------------------------------------------------
/**
 * Límite oficial del parque, preparado para consultarlo muchas veces:
 *   [ "bbox" => [minLng, minLat, maxLng, maxLat], "polygons" => [ [anillo0, anillo1...], ... ] ]
 * Cada anillo es una lista de [lng, lat] (orden GeoJSON). El anillo 0 es el contorno y los demás
 * son agujeros. Devuelve null si el parque no está registrado o no tiene límite publicado.
 *
 * Se cachea en memoria del proceso y, si el servidor tiene APCu, también entre peticiones: el
 * GeoJSON de un parque grande ronda los 150 KB y decodificarlo en cada fix del GPS sería tirar
 * milisegundos a la basura.
 */
function naturdexParkBoundary($slug) {
    static $memo = [];
    if (array_key_exists($slug, $memo)) return $memo[$slug];

    $apcuKey = "naturdex.boundary." . $slug;
    if (function_exists("apcu_fetch")) {
        $hit = apcu_fetch($apcuKey, $ok);
        if ($ok && is_array($hit)) return $memo[$slug] = $hit;
    }

    $boundary = null;
    $entry = naturdexParkEntry($slug);
    if ($entry && !empty($entry["manifest"])) {
        $manifestRaw = @file_get_contents(naturdexFrontendPath($entry["manifest"]));
        $manifest = $manifestRaw ? json_decode($manifestRaw, true) : null;
        $geoPath = $manifest["geo"]["parque"] ?? null;
        if ($geoPath) {
            $geoRaw = @file_get_contents(naturdexFrontendPath($geoPath));
            $geo = $geoRaw ? json_decode($geoRaw, true) : null;
            $boundary = naturdexBuildBoundary($geo);
        }
    }

    if (function_exists("apcu_store")) apcu_store($apcuKey, $boundary, 3600);
    return $memo[$slug] = $boundary;
}

/** Aplana un GeoJSON (FeatureCollection / Feature / geometría suelta) a la forma interna de arriba. */
function naturdexBuildBoundary($geojson) {
    if (!is_array($geojson)) return null;
    $geometries = [];
    $type = $geojson["type"] ?? null;
    if ($type === "FeatureCollection") {
        foreach (($geojson["features"] ?? []) as $feature) {
            if (isset($feature["geometry"])) $geometries[] = $feature["geometry"];
        }
    } elseif ($type === "Feature") {
        if (isset($geojson["geometry"])) $geometries[] = $geojson["geometry"];
    } else {
        $geometries[] = $geojson;
    }

    $polygons = [];
    foreach ($geometries as $geometry) {
        $gType = $geometry["type"] ?? null;
        if ($gType === "Polygon") $polygons[] = $geometry["coordinates"];
        elseif ($gType === "MultiPolygon") foreach ($geometry["coordinates"] as $poly) $polygons[] = $poly;
    }
    if (!$polygons) return null;

    $minLng = INF; $minLat = INF; $maxLng = -INF; $maxLat = -INF;
    foreach ($polygons as $rings) {
        foreach ($rings as $ring) {
            foreach ($ring as $pt) {
                if ($pt[0] < $minLng) $minLng = $pt[0];
                if ($pt[0] > $maxLng) $maxLng = $pt[0];
                if ($pt[1] < $minLat) $minLat = $pt[1];
                if ($pt[1] > $maxLat) $maxLat = $pt[1];
            }
        }
    }
    return ["bbox" => [$minLng, $minLat, $maxLng, $maxLat], "polygons" => $polygons];
}

// --- Consultas geométricas -----------------------------------------------------------------------
/** Ray casting sobre un anillo (coordenadas GeoJSON [lng, lat]). Mismo criterio que util.js. */
function naturdexRingContains($ring, $lat, $lng) {
    $inside = false;
    $n = count($ring);
    for ($i = 0, $j = $n - 1; $i < $n; $j = $i++) {
        $xi = $ring[$i][0]; $yi = $ring[$i][1];
        $xj = $ring[$j][0]; $yj = $ring[$j][1];
        if ((($yi > $lat) !== ($yj > $lat)) && ($lng < (($xj - $xi) * ($lat - $yi)) / (($yj - $yi) ?: 1e-12) + $xi)) {
            $inside = !$inside;
        }
    }
    return $inside;
}

/** ¿Cae la coordenada dentro del límite (contorno sí, agujeros no)? */
function naturdexBoundaryContains($boundary, $lat, $lng) {
    if (!$boundary) return false;
    [$minLng, $minLat, $maxLng, $maxLat] = $boundary["bbox"];
    if ($lng < $minLng || $lng > $maxLng || $lat < $minLat || $lat > $maxLat) return false;
    foreach ($boundary["polygons"] as $rings) {
        if (!$rings || !naturdexRingContains($rings[0], $lat, $lng)) continue;
        $inHole = false;
        for ($i = 1; $i < count($rings); $i++) {
            if (naturdexRingContains($rings[$i], $lat, $lng)) { $inHole = true; break; }
        }
        if (!$inHole) return true;
    }
    return false;
}

/** Distancia en metros entre dos coordenadas (Haversine). Espejo de util.js·haversineMeters. */
function naturdexHaversineMeters($lat1, $lng1, $lat2, $lng2) {
    $r = 6371000;
    $dLat = deg2rad($lat2 - $lat1);
    $dLng = deg2rad($lng2 - $lng1);
    $a = sin($dLat / 2) ** 2 + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;
    return $r * 2 * atan2(sqrt($a), sqrt(1 - $a));
}

/** Distancia punto-segmento en metros, proyectando en plano local (exacto de sobra a esta escala). */
function naturdexPointSegmentMeters($lat, $lng, $aLat, $aLng, $bLat, $bLng) {
    $kx = 111320 * cos(deg2rad($lat));
    $ky = 110540;
    $px = ($lng - $aLng) * $kx;   $py = ($lat - $aLat) * $ky;
    $bx = ($bLng - $aLng) * $kx;  $by = ($bLat - $aLat) * $ky;
    $len2 = $bx * $bx + $by * $by;
    $t = $len2 > 0 ? max(0, min(1, ($px * $bx + $py * $by) / $len2)) : 0;
    $dx = $px - $t * $bx; $dy = $py - $t * $by;
    return sqrt($dx * $dx + $dy * $dy);
}

/**
 * Metros que separan la coordenada del límite del parque: 0 si está dentro, y si está fuera, la
 * distancia al punto más cercano del contorno. Es lo que permite un margen de tolerancia sensato
 * (el GPS no es un bisturí) sin tener que generar polígonos con buffer.
 */
function naturdexBoundaryDistanceMeters($boundary, $lat, $lng, $onlyIfCloserThan = null) {
    if (!$boundary) return INF;
    if (naturdexBoundaryContains($boundary, $lat, $lng)) return 0.0;

    // Atajo por el bbox: recorrer los miles de vértices de un parque grande para decirle a alguien
    // que está en su casa, a 40 km, es tirar el tiempo. La distancia al bbox es una cota inferior
    // exacta, así que si ya supera el margen que importa se devuelve tal cual.
    [$minLng, $minLat, $maxLng, $maxLat] = $boundary["bbox"];
    $dLat = max($minLat - $lat, 0, $lat - $maxLat) * 110540;
    $dLng = max($minLng - $lng, 0, $lng - $maxLng) * 111320 * cos(deg2rad($lat));
    $bboxDistance = sqrt($dLat * $dLat + $dLng * $dLng);
    if ($onlyIfCloserThan !== null && $bboxDistance > $onlyIfCloserThan) return $bboxDistance;

    $best = INF;
    foreach ($boundary["polygons"] as $rings) {
        foreach ($rings as $ring) {
            $n = count($ring);
            for ($i = 0, $j = $n - 1; $i < $n; $j = $i++) {
                $d = naturdexPointSegmentMeters($lat, $lng, $ring[$j][1], $ring[$j][0], $ring[$i][1], $ring[$i][0]);
                if ($d < $best) $best = $d;
            }
        }
    }
    return $best;
}
