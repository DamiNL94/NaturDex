<?php
// ================================================================================================
// account_progress.php — progreso de CUENTA (ámbito estatal) y evaluación de logros.
// ------------------------------------------------------------------------------------------------
// El progreso "de siempre" (user_progress) es por parque. Esta capa agrega lo visto en TODOS los
// parques de una cuenta y evalúa el catálogo compartido de logros (Frontend/Data/achievements.json)
// contra ese agregado.
//
// REGLA CENTRAL: para los logros no cuenta lo que el usuario marca, sino lo que marcó ESTANDO ALLÍ.
// Una marca solo suma si su hora cae dentro de la ventana de una visita verificada al espacio que la
// contiene (Backend/Lib/presence.php: posiciones del GPS validadas contra el límite oficial). Lo
// demás se guarda igual —el cuaderno personal del usuario es suyo— pero no puntúa. Antes bastaba
// con pulsar "marcar como vista" desde el sofá y la colección entera se podía completar sin salir
// de casa; ver Docs/VERIFICACION-Y-ANTITRAMPAS.md.
//
// Los agregados son SIEMPRE recalculables desde cero a partir de user_progress + user_park_visits +
// user_invasive_sightings + user_glossary_views (por eso Tools/recalculate-account-progress.php
// puede simplemente llamar a recomputeAccountProgress() para cada usuario). Ya no hay ningún flag
// reportado por el cliente: los logros "de sabor" también se derivan de visitas verificadas.
//
// La usa Backend/Api/progress.php (tras cada POST, para poder devolver `newlyUnlocked`),
// Backend/Api/presence.php (una visita que cuaja puede desbloquear logros) y
// Backend/Api/account-progress.php (GET/POST de la pestaña de progreso estatal).
// ================================================================================================

require_once __DIR__ . "/presence.php";

/**
 * Ruta al catálogo de logros compartido (mismo fichero que lee el frontend).
 */
function achievementsCatalogPath() {
    return __DIR__ . "/../../Frontend/Data/achievements.json";
}

/**
 * Catálogo de logros, cacheado en memoria del proceso (una sola lectura por petición PHP).
 * @return array Lista de logros { id, category, metric, threshold, ... }.
 */
function loadAchievementCatalog() {
    static $cache = null;
    if ($cache !== null) return $cache;
    $raw = @file_get_contents(achievementsCatalogPath());
    $data = $raw ? json_decode($raw, true) : null;
    $cache = ($data && isset($data["achievements"])) ? $data["achievements"] : [];
    return $cache;
}

// --- Clave canónica de especie (deduplicación entre parques) ------------------------------------
// Prioridad: gbif_species_key > eidos_taxonid > nombre científico normalizado. Las dos claves
// numéricas están pensadas para esto (ver el comentario de `species` en Database/schema.sql); el
// nombre científico normalizado es el mismo criterio que ya usa el frontend (state.js·speciesGroupKey)
// dentro de un parque, aquí extendido entre parques.
function canonicalSpeciesKey($speciesRow) {
    if (!empty($speciesRow["gbif_species_key"])) return "gbif:" . $speciesRow["gbif_species_key"];
    if (!empty($speciesRow["eidos_taxonid"])) return "eidos:" . $speciesRow["eidos_taxonid"];
    $name = mb_strtolower(trim((string) ($speciesRow["scientific_name"] ?? "")), "UTF-8");
    $name = preg_replace('/\s+/', ' ', $name);
    return "sci:" . $name;
}

// --- Helpers de catálogo por parque (se cargan enteros y se filtran en PHP: los catálogos de un
// parque son de decenas/cientos de filas, no hace falta SQL dinámico con listas de ids) -----------
function speciesByParkId($conn, $parkId) {
    $stmt = $conn->prepare("SELECT id, scientific_name, eidos_taxonid, gbif_species_key FROM species WHERE park_id = ?");
    $stmt->bind_param("i", $parkId);
    $stmt->execute();
    $out = [];
    foreach ($stmt->get_result()->fetch_all(MYSQLI_ASSOC) as $r) $out[(int) $r["id"]] = $r;
    return $out;
}

function habitatSpeciesMapByParkId($conn, $parkId) {
    $stmt = $conn->prepare(
        "SELECT sh.habitat_id, sh.species_id FROM species_habitats sh
         JOIN habitats h ON h.id = sh.habitat_id WHERE h.park_id = ?"
    );
    $stmt->bind_param("i", $parkId);
    $stmt->execute();
    $map = [];
    foreach ($stmt->get_result()->fetch_all(MYSQLI_ASSOC) as $r) {
        $map[(int) $r["habitat_id"]][] = (int) $r["species_id"];
    }
    return $map;
}

function habitatIdsByParkId($conn, $parkId) {
    $stmt = $conn->prepare("SELECT id FROM habitats WHERE park_id = ?");
    $stmt->bind_param("i", $parkId);
    $stmt->execute();
    return array_map("intval", array_column($stmt->get_result()->fetch_all(MYSQLI_ASSOC), "id"));
}

function poisCountByParkId($conn, $parkId) {
    $stmt = $conn->prepare("SELECT COUNT(*) AS n FROM points_of_interest WHERE park_id = ?");
    $stmt->bind_param("i", $parkId);
    $stmt->execute();
    return (int) $stmt->get_result()->fetch_assoc()["n"];
}

// --- Verificación: qué marcas cuentan y cuáles se quedan en el cuaderno personal ------------------
/**
 * Reparte las marcas de un parque entre verificadas y no verificadas.
 *
 * Una marca cuenta si (1) tiene hora registrada (`markedAt`, lo sella el servidor en progress.php),
 * (2) esa hora cae dentro de la ventana de una visita verificada a ESE espacio, y (3) entra dentro
 * del cupo de ritmo humano de esa visita: nadie identifica cuarenta especies en un minuto, así que
 * cada visita solo puede avalar tantas marcas como dé de sí su duración (presenceMarkAllowance).
 * Cuando se pasa del cupo, se descartan las ÚLTIMAS por hora: lo primero que viste sigue contando.
 *
 * @param array $windows   Ventanas de visita verificada a este parque (presenceVerifiedWindows).
 * @param array $markedAt  Mapa 'species:12' | 'poi:mirador' => fecha ISO.
 * @return array { species: int[], pois: string[] } claves verificadas.
 */
function partitionVerifiedMarks($windows, $markedAt) {
    if (!$windows || !$markedAt) return ["species" => [], "pois" => []];

    // 1) Cada marca, a la primera ventana que la contenga.
    $perWindow = [];
    foreach ($markedAt as $markKey => $iso) {
        $ts = strtotime((string) $iso);
        if ($ts === false) continue;
        foreach ($windows as $i => $w) {
            if ($ts >= $w["from"] && $ts <= $w["to"]) { $perWindow[$i][] = ["key" => $markKey, "ts" => $ts]; break; }
        }
    }

    // 2) Cupo por ventana, respetando el orden en que se marcaron.
    $species = [];
    $pois = [];
    foreach ($perWindow as $i => $marks) {
        usort($marks, function ($a, $b) { return $a["ts"] <=> $b["ts"]; });
        $allowed = presenceMarkAllowance($windows[$i]["seconds"]);
        foreach (array_slice($marks, 0, $allowed) as $mark) {
            [$type, $id] = array_pad(explode(":", $mark["key"], 2), 2, null);
            if ($id === null) continue;
            if ($type === "species") $species[] = (int) $id;
            elseif ($type === "poi") $pois[] = $id;
        }
    }
    return ["species" => array_values(array_unique($species)), "pois" => array_values(array_unique($pois))];
}

/** Región y provincia de cada parque, indexadas por slug (tabla pequeña: se lee entera). */
function parksBySlug($conn) {
    $result = $conn->query("SELECT slug, id, region, province FROM parks");
    $out = [];
    foreach ($result->fetch_all(MYSQLI_ASSOC) as $r) $out[$r["slug"]] = $r;
    return $out;
}

function countUserInvasiveSightings($conn, $userId) {
    $stmt = $conn->prepare("SELECT COUNT(*) AS n FROM user_invasive_sightings WHERE user_id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    return (int) $stmt->get_result()->fetch_assoc()["n"];
}

function countUserGlossaryViews($conn, $userId) {
    $stmt = $conn->prepare("SELECT COUNT(*) AS n FROM user_glossary_views WHERE user_id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    return (int) $stmt->get_result()->fetch_assoc()["n"];
}

// --- Agregación completa (recalculable desde cero) -----------------------------------------------
/**
 * Recalcula los totales agregados de un usuario a partir de user_progress + user_park_visits +
 * user_invasive_sightings + user_glossary_views, y guarda el resultado en user_account_progress.
 *
 * Todo lo que alimenta un logro sale de una visita verificada. Lo que el usuario tenga marcado sin
 * haber estado allí sigue en su cuaderno (y se cuenta aparte, en `unverifiedMarks`, para poder
 * decírselo con claridad en la pantalla de progreso), pero no entra en ninguna métrica.
 *
 * @return array  El array de agregados (misma forma que se guarda en el payload).
 */
function computeAccountAggregates($conn, $userId) {
    $field = presenceFieldStats($conn, $userId);
    $windowsByPark = [];
    foreach ($field["windows"] as $w) $windowsByPark[$w["park"]][] = $w;

    $stmt = $conn->prepare("SELECT park_slug, payload FROM user_progress WHERE user_id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $progressRows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $parks = parksBySlug($conn);

    $speciesKeys = [];
    $gpsKeys = [];
    $regions = [];
    $provinces = [];
    $poisSeen = 0;
    $habitatsCompleted = 0;
    $parksCompleted = 0;
    $unverifiedMarks = 0;

    // Comunidades y provincias: se cuentan por haber PISADO el espacio (visita verificada), no por
    // haber marcado nada en él. Pisar un parque y no ver ni un bicho sigue siendo haber estado allí.
    foreach ($field["parksList"] as $slug) {
        $park = $parks[$slug] ?? null;
        if (!$park) continue;
        if (!empty($park["region"])) $regions[$park["region"]] = true;
        if (!empty($park["province"])) $provinces[$park["province"]] = true;
    }

    foreach ($progressRows as $row) {
        $slug = $row["park_slug"];
        $park = $parks[$slug] ?? null;
        if (!$park) continue;
        $payload = json_decode($row["payload"] ?: "{}", true) ?: [];
        $seenSpecies = array_values(array_unique(array_map("intval", $payload["seenSpeciesIds"] ?? [])));
        $seenPois = array_values(array_unique($payload["seenPoiIds"] ?? []));
        $sightings = is_array($payload["sightings"] ?? null) ? $payload["sightings"] : [];
        $markedAt = is_array($payload["markedAt"] ?? null) ? $payload["markedAt"] : [];
        if (!$seenSpecies && !$seenPois) continue;

        $verified = partitionVerifiedMarks($windowsByPark[$slug] ?? [], $markedAt);
        // Solo se consideran verificadas las marcas que además siguen marcadas hoy (el usuario pudo
        // desmarcar algo después; `markedAt` se limpia al desmarcar, esto es el cinturón).
        $verifiedSpecies = array_values(array_intersect($verified["species"], $seenSpecies));
        $verifiedPois = array_values(array_intersect($verified["pois"], $seenPois));
        $unverifiedMarks += (count($seenSpecies) - count($verifiedSpecies)) + (count($seenPois) - count($verifiedPois));
        if (!$verifiedSpecies && !$verifiedPois) continue;

        $parkId = (int) $park["id"];
        $poisSeen += count($verifiedPois);
        $boundary = naturdexParkBoundary($slug);

        $speciesCatalog = speciesByParkId($conn, $parkId);
        foreach ($verifiedSpecies as $sid) {
            if (!isset($speciesCatalog[$sid])) continue; // especie borrada/renumerada: se ignora
            $key = canonicalSpeciesKey($speciesCatalog[$sid]);
            $speciesKeys[$key] = true;
            // Avistamiento georreferenciado: además de estar verificado, la coordenada del propio
            // avistamiento tiene que caer dentro del espacio. Es el dato con valor científico.
            $sighting = $sightings[(string) $sid] ?? null;
            if ($sighting && isset($sighting["lat"], $sighting["lng"]) && $boundary
                && naturdexBoundaryContains($boundary, (float) $sighting["lat"], (float) $sighting["lng"])) {
                $gpsKeys[$key] = true;
            }
        }

        $habitatIds = habitatIdsByParkId($conn, $parkId);
        $habitatsTotal = count($habitatIds);
        $habitatSpeciesMap = $habitatsTotal ? habitatSpeciesMapByParkId($conn, $parkId) : [];
        $habitatsCompleteHere = 0;
        foreach ($habitatIds as $hid) {
            $members = $habitatSpeciesMap[$hid] ?? [];
            if (!$members) continue;
            $seenHere = count(array_intersect($members, $verifiedSpecies));
            if ($seenHere === count($members)) $habitatsCompleteHere++;
        }
        $habitatsCompleted += $habitatsCompleteHere;

        $poisTotal = poisCountByParkId($conn, $parkId);
        $parkComplete = $habitatsTotal > 0 && $habitatsCompleteHere === $habitatsTotal
            && $poisTotal > 0 && count($verifiedPois) === $poisTotal;
        if ($parkComplete) $parksCompleted++;
    }

    return [
        // --- Métricas de logro (todas exigen presencia verificada) --------------------------------
        "speciesSeen" => count($speciesKeys),
        "parksVisited" => $field["parksVisited"],
        "parksCompleted" => $parksCompleted,
        "regionsVisited" => count($regions),
        "provincesVisited" => count($provinces),
        "habitatsCompleted" => $habitatsCompleted,
        "poisSeen" => $poisSeen,
        "gpsSightings" => count($gpsKeys),
        "fieldDays" => $field["fieldDays"],
        "weekStreak" => $field["weekStreak"],
        "maxParkRevisitDays" => $field["maxParkRevisitDays"],
        // Estaciones del año con salida verificada (y el mejor registro dentro de un mismo espacio).
        // Espejo: computeLocalAggregates() en Frontend/Js/achievements/agregacion.js.
        "seasonsVisited" => $field["seasonsVisited"],
        "sameParkSeasons" => $field["sameParkSeasons"],
        "fieldHours" => $field["fieldHours"],
        "fieldKilometers" => $field["fieldKilometers"],
        // --- Estadísticas de la app (se muestran, pero ya no desbloquean nada) --------------------
        "invasiveSeen" => countUserInvasiveSightings($conn, $userId),
        "glossaryViewed" => countUserGlossaryViews($conn, $userId),
        "unverifiedMarks" => $unverifiedMarks,
        "regionsList" => array_values(array_keys($regions)),
        // --- Logros "de sabor", ahora también derivados de visitas reales --------------------------
        "flags" => [
            "earlyBird" => $field["earlyBird"],
            "winterVisit" => $field["winterVisit"],
            "longVisit" => $field["longestVisitHours"] >= 3,
        ],
    ];
}

function metricValue($aggregates, $metric) {
    if (array_key_exists($metric, $aggregates)) return (int) $aggregates[$metric];
    if (isset($aggregates["flags"][$metric])) return $aggregates["flags"][$metric] ? 1 : 0;
    return 0;
}

/**
 * Evalúa el catálogo de logros contra los agregados dados e inserta los que se acaban de cumplir.
 * Un logro NUNCA se retira: solo se comprueba "¿falta por desbloquear?" e INSERT si toca. Se guarda
 * siempre con celebrated_at = NULL; quien llama decide si lo anuncia ya (progress.php → newlyUnlocked,
 * el frontend lo celebra y luego lo marca) o lo deja para el resumen agrupado del primer login
 * (account-progress.php GET, ver Restricciones del encargo original).
 * @return string[] Ids de los logros recién insertados en esta llamada.
 */
function evaluateAchievements($conn, $userId, $aggregates) {
    $catalog = loadAchievementCatalog();
    if (!$catalog) return [];

    $stmt = $conn->prepare("SELECT achievement_id FROM user_achievements WHERE user_id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $already = array_fill_keys(array_column($stmt->get_result()->fetch_all(MYSQLI_ASSOC), "achievement_id"), true);

    $insert = $conn->prepare(
        "INSERT IGNORE INTO user_achievements (user_id, achievement_id, context) VALUES (?, ?, ?)"
    );
    $newly = [];
    foreach ($catalog as $ach) {
        $id = $ach["id"];
        if (isset($already[$id])) continue;
        $value = metricValue($aggregates, $ach["metric"]);
        if ($value < (int) $ach["threshold"]) continue;
        $context = json_encode(["value" => $value], JSON_UNESCAPED_UNICODE);
        $insert->bind_param("iss", $userId, $id, $context);
        if ($insert->execute() && $insert->affected_rows > 0) $newly[] = $id;
    }
    return $newly;
}

/**
 * Recalcula, persiste y evalúa: el punto de entrada único que llaman progress.php (tras cada POST),
 * presence.php (cuando una visita se verifica), account-progress.php (invasoras/glosario) y el
 * script de recálculo de Tools/.
 * @return array { aggregates, newlyUnlocked }
 */
function recomputeAccountProgress($conn, $userId) {
    $aggregates = computeAccountAggregates($conn, $userId);
    $payload = json_encode($aggregates, JSON_UNESCAPED_UNICODE);
    $stmt = $conn->prepare(
        "INSERT INTO user_account_progress (user_id, payload) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE payload = VALUES(payload)"
    );
    $stmt->bind_param("is", $userId, $payload);
    $stmt->execute();

    $newlyUnlocked = evaluateAchievements($conn, $userId, $aggregates);
    return ["aggregates" => $aggregates, "newlyUnlocked" => $newlyUnlocked];
}

/** INSERT IGNORE de un día de actividad (idempotente: se puede llamar en cada POST de progress.php). */
function logActivity($conn, $userId, $parkSlug, $dateStr = null) {
    $date = $dateStr ?: gmdate("Y-m-d");
    $stmt = $conn->prepare("INSERT IGNORE INTO user_activity_log (user_id, park_slug, activity_date) VALUES (?, ?, ?)");
    $stmt->bind_param("iss", $userId, $parkSlug, $date);
    $stmt->execute();
}

function recordInvasiveSeen($conn, $userId, $invasiveId) {
    $stmt = $conn->prepare("INSERT IGNORE INTO user_invasive_sightings (user_id, invasive_id) VALUES (?, ?)");
    $stmt->bind_param("ii", $userId, $invasiveId);
    return $stmt->execute();
}

function recordGlossaryView($conn, $userId, $termId) {
    $stmt = $conn->prepare("INSERT IGNORE INTO user_glossary_views (user_id, term_id) VALUES (?, ?)");
    $stmt->bind_param("ii", $userId, $termId);
    return $stmt->execute();
}

function markAchievementsCelebrated($conn, $userId, $achievementIds) {
    if (!$achievementIds) return;
    $stmt = $conn->prepare(
        "UPDATE user_achievements SET celebrated_at = NOW()
         WHERE user_id = ? AND achievement_id = ? AND celebrated_at IS NULL"
    );
    foreach ($achievementIds as $id) {
        $stmt->bind_param("is", $userId, $id);
        $stmt->execute();
    }
}

/** Payload GET de account-progress.php: totales + lista de logros con su estado. */
function buildAccountPayload($conn, $userId) {
    $stmt = $conn->prepare("SELECT payload, updated_at FROM user_account_progress WHERE user_id = ? LIMIT 1");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    if (!$row) {
        // Primera consulta de esta cuenta: recalcula sobre la marcha (cubre altas antiguas que aún
        // no tengan fila; el recálculo masivo de Tools/ es para no forzar este cálculo bajo demanda
        // en cada usuario a la vez tras un despliegue).
        $result = recomputeAccountProgress($conn, $userId);
        $totals = $result["aggregates"];
        $updatedAt = gmdate("c");
    } else {
        $totals = json_decode($row["payload"], true) ?: [];
        $updatedAt = $row["updated_at"] ? gmdate("c", strtotime($row["updated_at"])) : null;
    }

    $stmt = $conn->prepare("SELECT achievement_id, unlocked_at, celebrated_at, context FROM user_achievements WHERE user_id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $achievements = array_map(function ($r) {
        return [
            "id" => $r["achievement_id"],
            "unlockedAt" => gmdate("c", strtotime($r["unlocked_at"])),
            "celebratedAt" => $r["celebrated_at"] ? gmdate("c", strtotime($r["celebrated_at"])) : null,
            "context" => $r["context"] ? json_decode($r["context"], true) : null,
        ];
    }, $stmt->get_result()->fetch_all(MYSQLI_ASSOC));

    // Los flags de sabor son uso interno de evaluateAchievements(): su resultado ya vive en
    // `achievements` (desbloqueado o no), así que no hace falta exponerlos en `totals`.
    unset($totals["flags"]);
    return ["totals" => $totals, "achievements" => $achievements, "updatedAt" => $updatedAt];
}

/**
 * Historial de visitas verificadas de un usuario, para la pantalla de progreso ("tus salidas al
 * campo"). Es la contrapartida honesta de exigir presencia: si los logros dependen de esto, el
 * usuario tiene derecho a ver exactamente qué salidas le ha contado la app y cuáles no.
 */
function buildVisitHistory($conn, $userId, $limit = 50) {
    $stmt = $conn->prepare(
        "SELECT v.park_slug, p.name AS park_name, v.started_at, v.last_fix_at, v.fix_count,
                v.distance_m, v.verified, v.suspicious, v.flags
         FROM user_park_visits v LEFT JOIN parks p ON p.slug = v.park_slug
         WHERE v.user_id = ? ORDER BY v.started_at DESC LIMIT ?"
    );
    $stmt->bind_param("ii", $userId, $limit);
    $stmt->execute();
    return array_map(function ($r) {
        return [
            "park" => $r["park_slug"],
            "parkName" => $r["park_name"] ?: $r["park_slug"],
            "startedAt" => gmdate("c", strtotime($r["started_at"])),
            "seconds" => max(0, strtotime($r["last_fix_at"]) - strtotime($r["started_at"])),
            "distanceM" => (int) $r["distance_m"],
            "fixCount" => (int) $r["fix_count"],
            "verified" => (bool) $r["verified"],
            "suspicious" => (bool) $r["suspicious"],
            "flags" => $r["flags"] ? json_decode($r["flags"], true) : [],
        ];
    }, $stmt->get_result()->fetch_all(MYSQLI_ASSOC));
}
