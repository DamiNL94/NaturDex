<?php
// ================================================================================================
// recalculate-account-progress.php — recalcula el progreso de CUENTA (ámbito estatal) y evalúa el
// catálogo de logros para TODOS los usuarios existentes (CLI).
// ------------------------------------------------------------------------------------------------
// Uso:
//   php Tools/recalculate-account-progress.php              recalcula (nunca retira logros)
//   php Tools/recalculate-account-progress.php --reset      vacía primero los logros y recalcula
//
// `--reset` existe por el cambio de reglas: los logros ganados cuando bastaba con pulsar "marcar
// como vista" desde el sofá no significan lo que dice su ficha, y evaluateAchievements() solo
// añade, nunca retira. Vaciar y recalcular deja el sistema coherente con la verificación de
// presencia. No toca user_progress: lo que el usuario tenía marcado sigue siendo suyo, solo que
// pasa a estar "sin verificar" hasta que vuelva al campo.
//
// Para qué sirve:
//  - Retrocompatibilidad al desplegar esta funcionalidad: usuarios que ya tenían progreso en
//    user_progress (por parque) no tienen todavía fila en user_account_progress ni logros
//    evaluados. Este script recorre todos los usuarios y llama a recomputeAccountProgress(), que
//    reconstruye los agregados desde cero (ver Backend/Lib/account_progress.php) y da de alta los
//    logros que ya se cumplan.
//  - Reparar desajustes: si alguna vez el agregado cacheado en user_account_progress se desincroniza
//    de la realidad (bug, migración de datos...), volver a ejecutar este script lo recalcula todo
//    desde user_progress/user_activity_log/user_invasive_sightings/user_glossary_views sin tocar
//    los logros ya desbloqueados (evaluateAchievements solo añade, nunca retira).
//
// Importante: los logros que este script desbloquea se guardan con celebrated_at = NULL, igual que
// cualquier desbloqueo. El frontend los agrupa en un único aviso discreto ("Has desbloqueado N
// logros con tu progreso anterior") la próxima vez que cada usuario entre, en vez de animar N
// carteles de golpe (ver achievements.js·syncWithServer). Es automático: este script no necesita
// distinguir entre "usuario nuevo" y "usuario con progreso previo".
// ================================================================================================
require_once __DIR__ . "/../Backend/Config/db.php";
require_once __DIR__ . "/../Backend/Lib/account_progress.php";

$reset = in_array("--reset", $argv ?? [], true);
if ($reset) {
    $conn->query("DELETE FROM user_achievements");
    $conn->query("DELETE FROM user_account_progress");
    echo "Logros y agregados vaciados: se recalculan desde cero con las reglas de presencia verificada.\n\n";
}

$result = $conn->query("SELECT id, email FROM users ORDER BY id");
if (!$result) {
    fwrite(STDERR, "No se pudo leer la tabla users.\n");
    exit(1);
}

$totalUsers = 0;
$totalNewAchievements = 0;
while ($user = $result->fetch_assoc()) {
    $totalUsers++;
    $userId = (int) $user["id"];
    try {
        $outcome = recomputeAccountProgress($conn, $userId);
        $newly = count($outcome["newlyUnlocked"]);
        $totalNewAchievements += $newly;
        echo "· #{$userId} ({$user["email"]}): " . $newly . " logro(s) nuevo(s), "
            . $outcome["aggregates"]["speciesSeen"] . " especies estatales, "
            . $outcome["aggregates"]["parksVisited"] . " parques visitados.\n";
    } catch (Throwable $e) {
        fwrite(STDERR, "  ! Error recalculando la cuenta #{$userId}: " . $e->getMessage() . "\n");
    }
}

echo "\nRecalculado el progreso de cuenta de {$totalUsers} usuario(s); "
    . "{$totalNewAchievements} logro(s) nuevo(s) en total (sin celebrar: se resumirán en el próximo login de cada usuario).\n";
