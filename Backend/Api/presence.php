<?php
// ================================================================================================
// presence.php (API) — el único sitio por el que entra una posición del GPS.
// ------------------------------------------------------------------------------------------------
// POST { park, lat, lng, accuracy?, capturedAt? }           un fix suelto (la app abierta en campo)
// POST { park, fixes: [ {lat, lng, accuracy?, capturedAt?} ] }   un lote (cola offline al recuperar red)
// GET  ?park=<slug>                                          estado de presencia en ese espacio
//
// El servidor NO se cree nada de lo que llega: valida cada posición contra el límite oficial del
// espacio y contra la coherencia de la traza (ver Backend/Lib/presence.php). La respuesta dice qué
// se aceptó y por qué, para que la app pueda explicárselo al usuario en castellano en vez de
// dejarle con un logro que no llega y sin saber por qué.
// ================================================================================================
require_once __DIR__ . "/../Lib/api.php";
require_once __DIR__ . "/../Lib/presence.php";
require_once __DIR__ . "/../Lib/account_progress.php";
require_once __DIR__ . "/../Lib/occurrences.php";
$conn = apiBoot(["session" => true]);
$userId = requireUserId();
$method = $_SERVER["REQUEST_METHOD"];

if ($method === "GET") {
    $parkSlug = trim((string) ($_GET["park"] ?? ""));
    if ($parkSlug === "") apiError("Falta el parámetro ?park=<slug>.");
    respond(presenceCurrentStatus($conn, $userId, $parkSlug));
}

if ($method === "POST") {
    $body = requireJsonBody("{ park, lat, lng } o { park, fixes: [...] }");
    $parkSlug = trim((string) ($body["park"] ?? ""));
    if ($parkSlug === "") apiError("Falta `park`. Se espera { park, lat, lng } o { park, fixes: [...] }.");

    $fixes = (isset($body["fixes"]) && is_array($body["fixes"])) ? $body["fixes"] : [$body];
    // Los lotes de la cola offline pueden llegar desordenados (el dispositivo los apila según se
    // vacía la cola). Se ordenan por su hora de captura antes de reconstruir la traza: si no, un fix
    // atrasado parecería un salto hacia atrás en el tiempo.
    usort($fixes, function ($a, $b) {
        return strcmp((string) ($a["capturedAt"] ?? ""), (string) ($b["capturedAt"] ?? ""));
    });
    // Tope defensivo: una cola sana de un día de campo no pasa de unos cientos de posiciones.
    $fixes = array_slice($fixes, 0, 500);

    $results = [];
    foreach ($fixes as $fix) {
        if (!is_array($fix)) continue;
        $results[] = presenceRegisterFix($conn, $userId, $parkSlug, $fix);
    }

    // Que una visita acabe de verificarse puede desbloquear logros de golpe (los que estaban a la
    // espera de que la presencia cuajara): se recalcula aquí para poder devolverlos en el acto.
    $newlyUnlocked = [];
    $accepted = count(array_filter($results, function ($r) { return !empty($r["accepted"]); }));
    if ($accepted) {
        try {
            $accountResult = recomputeAccountProgress($conn, $userId);
            $newlyUnlocked = $accountResult["newlyUnlocked"];
        } catch (Throwable $e) {
            error_log("NaturDex: fallo al recalcular el progreso tras registrar presencia: " . $e->getMessage());
        }
        // Lo mismo para la capa científica: lo que se marcó en los primeros minutos de la salida se
        // registró cuando la visita todavía no estaba verificada, y ahora ya puede colgar de ella.
        try {
            occurrencesRefreshVerification($conn, $userId, $parkSlug);
        } catch (Throwable $e) {
            error_log("NaturDex: fallo al reenganchar ocurrencias a la visita verificada: " . $e->getMessage());
        }
    }

    respond([
        "status" => presenceCurrentStatus($conn, $userId, $parkSlug),
        "results" => $results,
        "accepted" => $accepted,
        "newlyUnlocked" => $newlyUnlocked,
    ]);
}

apiMethodNotAllowed();
