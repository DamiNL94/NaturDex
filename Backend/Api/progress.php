<?php
// Progreso del usuario (especies/POIs vistos y avistamientos GPS), ahora POR USUARIO y POR PARQUE.
// Requiere sesión iniciada (auth.php). Se guarda en la tabla user_progress como un JSON con la
// misma forma que antes: { seenSpeciesIds, seenPoiIds, sightings, updatedAt }.
require_once __DIR__ . "/../Lib/api.php";
require_once __DIR__ . "/../Lib/presence.php";
require_once __DIR__ . "/../Lib/account_progress.php";
$conn = apiBoot(["session" => true]);
$userId = requireUserId();
$parkSlug = $_GET["park"] ?? "cabo-cope-puntas-calnegre";

function emptyProgress() {
    return ["seenSpeciesIds" => [], "seenPoiIds" => [], "sightings" => (object) [], "markedAt" => (object) [], "updatedAt" => null];
}

/**
 * Clave de una marca dentro de `markedAt`, el registro de CUÁNDO se marcó cada cosa. Existe porque
 * la verificación de presencia no se decide al marcar (una visita tarda unos minutos en cuajar),
 * sino al agregar: se cruza esta hora con las ventanas de visita verificada del usuario. Sin ella,
 * lo marcado no se puede situar en el tiempo y, por tanto, no puede contar para ningún logro.
 */
function markKey($type, $id) { return $type . ":" . $id; }

function readProgress($conn, $userId, $parkSlug) {
    $stmt = $conn->prepare("SELECT payload FROM user_progress WHERE user_id = ? AND park_slug = ? LIMIT 1");
    $stmt->bind_param("is", $userId, $parkSlug);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    if (!$row || !$row["payload"]) return emptyProgress();
    $decoded = json_decode($row["payload"], true);
    if (!is_array($decoded)) return emptyProgress();
    $decoded["seenSpeciesIds"] = array_values(array_unique($decoded["seenSpeciesIds"] ?? []));
    $decoded["seenPoiIds"] = array_values(array_unique($decoded["seenPoiIds"] ?? []));
    $decoded["sightings"] = (isset($decoded["sightings"]) && is_array($decoded["sightings"])) ? $decoded["sightings"] : [];
    $decoded["markedAt"] = (isset($decoded["markedAt"]) && is_array($decoded["markedAt"])) ? $decoded["markedAt"] : [];
    return $decoded;
}

function writeProgress($conn, $userId, $parkSlug, $progress) {
    if (empty($progress["sightings"])) $progress["sightings"] = (object) [];
    if (empty($progress["markedAt"])) $progress["markedAt"] = (object) [];
    $payload = json_encode($progress, JSON_UNESCAPED_UNICODE);
    $stmt = $conn->prepare(
        "INSERT INTO user_progress (user_id, park_slug, payload) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE payload = VALUES(payload)"
    );
    $stmt->bind_param("iss", $userId, $parkSlug, $payload);
    return $stmt->execute();
}

$method = $_SERVER["REQUEST_METHOD"];

if ($method === "GET") {
    respond(readProgress($conn, $userId, $parkSlug));
    exit;
}

/**
 * Aplica un evento { type, id, seen, lat?, lng?, at? } sobre el progreso en memoria.
 * Devuelve false si el evento está mal formado (el llamante decide si abortar o saltárselo).
 * Es idempotente a propósito: marcar dos veces lo mismo no duplica, que es lo que permite a la
 * app reintentar su cola de pendientes sin llevar la cuenta de qué llegó y qué no.
 *
 * La hora la pone el SERVIDOR. `at` solo se admite en eventos que vienen de la cola offline (lo que
 * se marcó sin cobertura ocurrió de verdad antes) y aun así pasa por el mismo filtro de plausibilidad
 * que las posiciones del GPS: ni del futuro ni de hace más de una semana. Esa hora es la que después
 * decide si la marca cayó dentro de una visita verificada, así que dejarla al cliente sin control
 * sería regalar la llave de todos los logros.
 */
function applyProgressEvent(&$progress, $event) {
    if (!is_array($event)) return false;
    $type = $event["type"] ?? null;
    $id = $event["id"] ?? null;
    if (!in_array($type, ["species", "poi"], true) || $id === null) return false;

    $seen = array_key_exists("seen", $event) ? (bool) $event["seen"] : true;
    $key = $type === "species" ? "seenSpeciesIds" : "seenPoiIds";
    $normalizedId = is_numeric($id) ? (int) $id : $id;
    $current = $progress[$key];
    $at = presenceResolveTimestamp($event["at"] ?? null);
    if ($at === null) $at = gmdate("Y-m-d H:i:s"); // marca de tiempo inadmisible: vale la de ahora
    $atIso = gmdate("c", strtotime($at));

    if ($seen) {
        if (!in_array($normalizedId, $current, true)) $current[] = $normalizedId;
    } else {
        $current = array_values(array_filter($current, function ($item) use ($normalizedId) {
            return $item !== $normalizedId;
        }));
    }
    $progress[$key] = $current;

    // `markedAt` no se pisa si ya existía: la primera vez que se marcó algo es la que cuenta (y así
    // reenviar la cola de pendientes no mueve una marca vieja a la ventana de la visita de hoy).
    $markKey = markKey($type, $normalizedId);
    if ($seen) {
        if (!isset($progress["markedAt"][$markKey])) $progress["markedAt"][$markKey] = $atIso;
    } else {
        unset($progress["markedAt"][$markKey]);
    }

    if ($type === "species") {
        $sightKey = (string) $normalizedId;
        $lat = isset($event["lat"]) && is_numeric($event["lat"]) ? (float) $event["lat"] : null;
        $lng = isset($event["lng"]) && is_numeric($event["lng"]) ? (float) $event["lng"] : null;
        if ($seen && $lat !== null && $lng !== null) {
            $progress["sightings"][$sightKey] = ["lat" => $lat, "lng" => $lng, "at" => $atIso];
        } elseif (!$seen) {
            unset($progress["sightings"][$sightKey]);
        }
    }
    return true;
}

if ($method === "POST") {
    $body = requireJsonBody("{ type, id, seen, lat?, lng? } o { events: [...] }");

    // Dos formas admitidas: un evento suelto (marcar una especie con la app abierta) o un lote
    // { events: [...] }, que es como la app vacía de golpe lo que se marcó sin cobertura. El lote
    // importa porque cada POST recalcula el progreso de cuenta entero: una excursión de 20
    // especies serían 20 recálculos y aquí es uno solo.
    $isBatch = isset($body["events"]) && is_array($body["events"]);
    $events = $isBatch ? $body["events"] : [$body];

    $progress = readProgress($conn, $userId, $parkSlug);
    if (!is_array($progress["sightings"])) $progress["sightings"] = [];
    if (!is_array($progress["markedAt"])) $progress["markedAt"] = [];

    // Marcar una especie con el GPS encendido es, además de una marca, una prueba de que se estaba
    // allí: esa coordenada alimenta la verificación de presencia igual que las del modo explorador.
    // Así, quien recorre el parque marcando bichos acaba verificando su visita sin hacer nada más.
    foreach ($events as $event) {
        if (!is_array($event) || ($event["type"] ?? null) !== "species") continue;
        if (!isset($event["lat"], $event["lng"]) || !is_numeric($event["lat"]) || !is_numeric($event["lng"])) continue;
        if (array_key_exists("seen", $event) && !$event["seen"]) continue;
        try {
            presenceRegisterFix($conn, $userId, $parkSlug, [
                "lat" => $event["lat"], "lng" => $event["lng"],
                "accuracy" => $event["accuracy"] ?? null, "capturedAt" => $event["at"] ?? null,
            ]);
        } catch (Throwable $e) {
            error_log("NaturDex: fallo al registrar presencia desde un avistamiento: " . $e->getMessage());
        }
    }

    $applied = 0;
    foreach ($events as $event) {
        if (applyProgressEvent($progress, $event)) {
            $applied++;
        } elseif (!$isBatch) {
            apiError("Se espera { type: 'species'|'poi', id, seen }.");
        }
        // En un lote, un evento corrupto se ignora en vez de tumbar el envío entero: si no, ese
        // evento se quedaría atascado en la cola del dispositivo reintentándose para siempre.
    }
    if ($isBatch && $applied === 0) apiError("El lote no traía ningún evento válido.");
    $progress["updatedAt"] = gmdate("c");

    if (!writeProgress($conn, $userId, $parkSlug, $progress)) {
        apiError("No se pudo guardar el progreso.", 500);
    }
    if (empty($progress["sightings"])) $progress["sightings"] = (object) [];
    if (empty($progress["markedAt"])) $progress["markedAt"] = (object) [];

    // Capa de cuenta (ámbito estatal): registra el día de actividad y recalcula agregados/logros.
    // Va DESPUÉS de guardar el progreso del parque y nunca puede tumbar la respuesta de progress.php:
    // si algo falla aquí, el progreso por parque ya se guardó igual (se degrada, no se rompe).
    $newlyUnlocked = [];
    try {
        logActivity($conn, $userId, $parkSlug);
        $accountResult = recomputeAccountProgress($conn, $userId);
        $newlyUnlocked = $accountResult["newlyUnlocked"];
    } catch (Throwable $e) {
        error_log("NaturDex: fallo al recalcular el progreso de cuenta: " . $e->getMessage());
    }
    $progress["newlyUnlocked"] = $newlyUnlocked;
    // Estado de presencia: la app lo necesita para decir en el acto si lo que se acaba de marcar
    // cuenta para los logros o se queda "sin verificar" (y por qué).
    try {
        $progress["presence"] = presenceCurrentStatus($conn, $userId, $parkSlug);
    } catch (Throwable $e) { /* sin estado de presencia: la app lo pedirá aparte */ }
    respond($progress);
}

apiMethodNotAllowed();
