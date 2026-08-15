<?php
// Progreso de CUENTA (ámbito estatal, agregado sobre todos los parques) + logros. Complementa a
// progress.php (que sigue siendo por parque y no cambia su contrato). Requiere sesión (auth.php).
require_once __DIR__ . "/../Lib/api.php";
require_once __DIR__ . "/../Lib/account_progress.php";
require_once __DIR__ . "/../Lib/occurrences.php";
$conn = apiBoot(["session" => true]);
$userId = requireUserId();
$method = $_SERVER["REQUEST_METHOD"];

if ($method === "GET") {
    $payload = buildAccountPayload($conn, $userId);
    // El historial de salidas viaja con el progreso: si los logros dependen de haber estado allí,
    // el usuario tiene que poder ver qué visitas se le han contado (y cuáles no) sin preguntar.
    $payload["visits"] = buildVisitHistory($conn, $userId);
    respond($payload);
}

if ($method === "POST") {
    $body = requireJsonBody("{ type: 'invasive'|'glossary'|'celebrate', ... }");
    if (!isset($body["type"])) apiError("Falta `type`. Se espera { type: 'invasive'|'glossary'|'celebrate', ... }.");

    switch ($body["type"]) {
        case "invasive": {
            $scientificName = trim((string) ($body["scientificName"] ?? ""));
            $ccaa = trim((string) ($body["ccaa"] ?? ""));
            if ($scientificName === "") apiError("Se espera { type: 'invasive', scientificName, ccaa? }.");
            if ($ccaa !== "") {
                $stmt = $conn->prepare("SELECT id FROM especies_invasoras WHERE scientific_name = ? AND ccaa = ? LIMIT 1");
                $stmt->bind_param("ss", $scientificName, $ccaa);
            } else {
                $stmt = $conn->prepare("SELECT id FROM especies_invasoras WHERE scientific_name = ? LIMIT 1");
                $stmt->bind_param("s", $scientificName);
            }
            $stmt->execute();
            $row = $stmt->get_result()->fetch_assoc();
            if (!$row) apiError("Especie invasora no encontrada.", 404);
            recordInvasiveSeen($conn, $userId, (int) $row["id"]);
            // Una cita georreferenciada de una especie del Catálogo Español de EEI es lo que más
            // valor tiene, de todo lo que recoge la app, para quien tiene que gestionar el problema.
            // Hasta ahora se guardaba sin coordenada y era, por tanto, impublicable.
            try {
                occurrenceRecordInvasive($conn, $userId, (int) $row["id"], [
                    "lat" => $body["lat"] ?? null, "lng" => $body["lng"] ?? null,
                    "accuracy" => $body["accuracy"] ?? null,
                ]);
            } catch (Throwable $e) {
                error_log("NaturDex: fallo al registrar la ocurrencia de invasora: " . $e->getMessage());
            }
            $result = recomputeAccountProgress($conn, $userId);
            respond(["totals" => $result["aggregates"], "newlyUnlocked" => $result["newlyUnlocked"]]);
        }

        case "glossary": {
            $term = trim((string) ($body["term"] ?? ""));
            if ($term === "") apiError("Se espera { type: 'glossary', term }.");
            $stmt = $conn->prepare("SELECT id FROM glosario WHERE term = ? LIMIT 1");
            $stmt->bind_param("s", $term);
            $stmt->execute();
            $row = $stmt->get_result()->fetch_assoc();
            if (!$row) apiError("Término de glosario no encontrado.", 404);
            recordGlossaryView($conn, $userId, (int) $row["id"]);
            $result = recomputeAccountProgress($conn, $userId);
            respond(["totals" => $result["aggregates"], "newlyUnlocked" => $result["newlyUnlocked"]]);
        }

        // El frontend llama esto justo después de mostrar el cartel de celebración de cada logro,
        // para que un refresco de página (o entrar desde otro dispositivo) no lo vuelva a animar.
        case "celebrate": {
            $ids = is_array($body["ids"] ?? null) ? array_values(array_filter($body["ids"], "is_string")) : [];
            markAchievementsCelebrated($conn, $userId, $ids);
            respond(["ok" => true]);
        }

        default:
            apiError("type desconocido. Usa 'invasive', 'glossary' o 'celebrate'.");
    }
}

apiMethodNotAllowed();
