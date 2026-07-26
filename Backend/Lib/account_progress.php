<?php
// ================================================================================================
// account_progress.php — progreso de CUENTA (ámbito estatal) y evaluación de logros.
// ------------------------------------------------------------------------------------------------
// El progreso "de siempre" (user_progress) es por parque. Esta capa agrega lo visto en TODOS los
// parques de una cuenta y evalúa el catálogo compartido de logros (Frontend/Data/achievements.json)
// contra ese agregado. Los agregados son SIEMPRE recalculables desde cero a partir de user_progress
// + user_activity_log + user_invasive_sightings + user_glossary_views (por eso Tools/recalculate-
// account-progress.php puede simplemente llamar a recomputeAccountProgress() para cada usuario).
// La única excepción es la marca "noSearchHabitat" (logro de sabor): no hay forma de derivarla del
// lado del servidor porque depende de si el usuario usó el buscador en el cliente, así que viaja
// como flag desde el frontend y se guarda de forma "pegajosa" (una vez true, siempre true).
//
// La usa Backend/Api/progress.php (tras cada POST, para poder devolver `newlyUnlocked`) y
// Backend/Api/account-progress.php (GET/POST de la pestaña de progreso estatal).
// ================================================================================================

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

// --- Actividad (días distintos, racha semanal, visitas repetidas al mismo parque) ---------------
// Única fuente que NO se puede recalcular desde user_progress (su updated_at se sobrescribe en cada
// UPSERT): user_activity_log es el registro append-only del que sale todo esto.
function activityStats($conn, $userId) {
    $stmt = $conn->prepare("SELECT park_slug, activity_date FROM user_activity_log WHERE user_id = ? ORDER BY activity_date");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

    $days = [];
    $perPark = [];
    $winterOuting = false;
    foreach ($rows as $r) {
        $date = $r["activity_date"];
        $days[$date] = true;
        $perPark[$r["park_slug"]][$date] = true;
        $month = (int) substr($date, 5, 2);
        if ($month === 12 || $month === 1 || $month === 2) $winterOuting = true;
    }
    $maxParkRevisitDays = 0;
    foreach ($perPark as $dates) $maxParkRevisitDays = max($maxParkRevisitDays, count($dates));

    // Racha de semanas ISO consecutivas con al menos un día de actividad.
    $weekKeys = [];
    foreach (array_keys($days) as $d) {
        $ts = strtotime($d);
        if ($ts !== false) $weekKeys[date("o-W", $ts)] = true;
    }
    $weekKeys = array_keys($weekKeys);
    sort($weekKeys);
    $bestStreak = 0;
    $current = 0;
    $prevTs = null;
    foreach ($weekKeys as $wk) {
        [$isoYear, $isoWeek] = explode("-", $wk);
        $dt = DateTime::createFromFormat("o-W-N", $isoYear . "-" . $isoWeek . "-1");
        $ts = $dt ? $dt->getTimestamp() : null;
        if ($ts !== null) {
            $current = ($prevTs !== null && $ts - $prevTs === 7 * 86400) ? $current + 1 : 1;
            $bestStreak = max($bestStreak, $current);
            $prevTs = $ts;
        }
    }
    return [
        "activeDays" => count($days),
        "weekStreak" => $bestStreak,
        "maxParkRevisitDays" => $maxParkRevisitDays,
        "winterOuting" => $winterOuting,
    ];
}

// Marca "madruga" (logro de sabor): alguna especie marcada vista con avistamiento GPS antes de las
// 8:00, hora peninsular. Aproximado (solo cubre avistamientos con coordenadas), suficiente para un
// logro cosmético.
function detectEarlyBird($progressRows) {
    foreach ($progressRows as $row) {
        $payload = json_decode($row["payload"] ?: "{}", true) ?: [];
        foreach (($payload["sightings"] ?? []) as $sighting) {
            if (empty($sighting["at"])) continue;
            try {
                $dt = new DateTime($sighting["at"]);
                $dt->setTimezone(new DateTimeZone("Europe/Madrid"));
                if ((int) $dt->format("G") < 8) return true;
            } catch (Exception $e) { /* fecha inválida: se ignora */ }
        }
    }
    return false;
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

function loadStoredFlags($conn, $userId) {
    $stmt = $conn->prepare("SELECT payload FROM user_account_progress WHERE user_id = ? LIMIT 1");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    if (!$row) return [];
    $decoded = json_decode($row["payload"], true);
    return (is_array($decoded) && isset($decoded["flags"]) && is_array($decoded["flags"])) ? $decoded["flags"] : [];
}

// --- Agregación completa (recalculable desde cero) -----------------------------------------------
/**
 * Recalcula los totales agregados de un usuario a partir de user_progress + user_activity_log +
 * user_invasive_sightings + user_glossary_views, y guarda el resultado en user_account_progress.
 * @param mysqli $conn
 * @param int $userId
 * @param array $incomingFlags  Flags que reporta el cliente y no se pueden derivar en servidor
 *                               (hoy solo 'noSearchHabitat'). Se combinan de forma "pegajosa" (OR)
 *                               con lo que ya hubiera guardado: una vez true, no vuelve a false.
 * @return array  El array de agregados (misma forma que se guarda en el payload).
 */
function computeAccountAggregates($conn, $userId, $incomingFlags = []) {
    $stmt = $conn->prepare(
        "SELECT up.park_slug, up.payload, p.id AS park_id, p.region, p.province
         FROM user_progress up
         JOIN parks p ON p.slug = up.park_slug
         WHERE up.user_id = ?"
    );
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $progressRows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

    $speciesKeys = [];
    $gpsKeys = [];
    $parksVisited = [];
    $regions = [];
    $provinces = [];
    $poisSeen = 0;
    $habitatsCompleted = 0;
    $parksCompleted = 0;

    foreach ($progressRows as $row) {
        $payload = json_decode($row["payload"] ?: "{}", true) ?: [];
        $seenSpecies = array_values(array_unique(array_map("intval", $payload["seenSpeciesIds"] ?? [])));
        $seenPois = array_values(array_unique($payload["seenPoiIds"] ?? []));
        $sightings = is_array($payload["sightings"] ?? null) ? $payload["sightings"] : [];
        // Un parque solo cuenta como "visitado" si hay algo realmente marcado: entrar a un espacio
        // de ficha base (sin catálogo) no deja ningún rastro que marcar, así que no se cuenta.
        if (!$seenSpecies && !$seenPois) continue;

        $parkId = (int) $row["park_id"];
        $parksVisited[$row["park_slug"]] = true;
        if (!empty($row["region"])) $regions[$row["region"]] = true;
        if (!empty($row["province"])) $provinces[$row["province"]] = true;
        $poisSeen += count($seenPois);

        $speciesCatalog = speciesByParkId($conn, $parkId);
        foreach ($seenSpecies as $sid) {
            if (!isset($speciesCatalog[$sid])) continue; // especie borrada/renumerada: se ignora
            $key = canonicalSpeciesKey($speciesCatalog[$sid]);
            $speciesKeys[$key] = true;
            if (isset($sightings[(string) $sid])) $gpsKeys[$key] = true;
        }

        $habitatIds = habitatIdsByParkId($conn, $parkId);
        $habitatsTotal = count($habitatIds);
        $habitatSpeciesMap = $habitatsTotal ? habitatSpeciesMapByParkId($conn, $parkId) : [];
        $habitatsCompleteHere = 0;
        foreach ($habitatIds as $hid) {
            $members = $habitatSpeciesMap[$hid] ?? [];
            if (!$members) continue;
            $seenHere = count(array_intersect($members, $seenSpecies));
            if ($seenHere === count($members)) $habitatsCompleteHere++;
        }
        $habitatsCompleted += $habitatsCompleteHere;

        $poisTotal = poisCountByParkId($conn, $parkId);
        $parkComplete = $habitatsTotal > 0 && $habitatsCompleteHere === $habitatsTotal
            && $poisTotal > 0 && count($seenPois) === $poisTotal;
        if ($parkComplete) $parksCompleted++;
    }

    $activity = activityStats($conn, $userId);
    $storedFlags = loadStoredFlags($conn, $userId);
    $flags = [
        "earlyBird" => !empty($storedFlags["earlyBird"]) || detectEarlyBird($progressRows),
        "winterOuting" => !empty($storedFlags["winterOuting"]) || $activity["winterOuting"],
        // No derivable en servidor: se queda con lo ya guardado OR lo que reporte este POST.
        "noSearchHabitat" => !empty($storedFlags["noSearchHabitat"]) || !empty($incomingFlags["noSearchHabitat"]),
    ];

    return [
        "speciesSeen" => count($speciesKeys),
        "parksVisited" => count($parksVisited),
        "parksCompleted" => $parksCompleted,
        "regionsVisited" => count($regions),
        "provincesVisited" => count($provinces),
        "habitatsCompleted" => $habitatsCompleted,
        "poisSeen" => $poisSeen,
        "gpsSightings" => count($gpsKeys),
        "invasiveSeen" => countUserInvasiveSightings($conn, $userId),
        "glossaryViewed" => countUserGlossaryViews($conn, $userId),
        "activeDays" => $activity["activeDays"],
        "weekStreak" => $activity["weekStreak"],
        "maxParkRevisitDays" => $activity["maxParkRevisitDays"],
        "flags" => $flags,
        "regionsList" => array_values(array_keys($regions)),
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
 * account-progress.php (tras un POST de invasoras/glosario) y el script de recálculo de Tools/.
 * @return array { aggregates, newlyUnlocked }
 */
function recomputeAccountProgress($conn, $userId, $incomingFlags = []) {
    $aggregates = computeAccountAggregates($conn, $userId, $incomingFlags);
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
