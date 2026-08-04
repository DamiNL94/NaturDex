<?php
// ================================================================================================
// account.php — gestión de la CUENTA del usuario: perfil, contraseña, preferencias, exportación
// de datos y baja. Complementa a los otros dos endpoints de usuario sin solaparse con ellos:
//
//   · auth.php             → sesión (registro, login, logout, "quién soy").
//   · account-progress.php → progreso estatal y logros (solo lectura de agregados + eventos).
//   · account.php (este)   → todo lo que el usuario cambia DE SU CUENTA desde Perfil y ajustes.
//
// Todas las acciones exigen sesión iniciada. Las que tocan identidad (email, contraseña, baja)
// exigen además la contraseña actual: tener la cookie de sesión abierta no basta para cambiar las
// credenciales ni para borrar la cuenta (defensa frente a una sesión olvidada en un móvil prestado).
//
// Nota de prototipo, igual que en auth.php: en producción esto debe ir por HTTPS, con cookie
// Secure/SameSite y límite de intentos. Aquí no hay verificación de email: cambiar el email surte
// efecto de inmediato.
// ================================================================================================
require_once __DIR__ . "/../Lib/api.php";
$conn = apiBoot(["session" => true]);
$userId = requireUserId();

/** Fila completa del usuario (incluido el hash, para verificar la contraseña actual). */
function userRow($conn, $userId) {
    $stmt = $conn->prepare("SELECT id, email, password_hash, display_name, role, prefs, created_at FROM users WHERE id = ? LIMIT 1");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    return $stmt->get_result()->fetch_assoc();
}

/** Vista pública del usuario: la MISMA forma que devuelve auth.php, para que el frontend no
 *  tenga que distinguir de qué endpoint vino el objeto `user` que guarda en localStorage. */
function publicUser($row) {
    return [
        "id" => (int) $row["id"],
        "email" => $row["email"],
        "name" => $row["display_name"],
        "isAdmin" => ($row["role"] ?? "user") === "admin",
        "createdAt" => $row["created_at"],
    ];
}

/** Preferencias guardadas (columna JSON). Objeto vacío si nunca se han guardado o si el JSON
 *  quedó corrupto: las preferencias son cosméticas y nunca deben tumbar la carga del perfil. */
function decodePrefs($row) {
    $raw = $row["prefs"] ?? null;
    if (!is_string($raw) || $raw === "") return new stdClass();
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : new stdClass();
}

/** Verifica la contraseña actual del usuario; corta con 401 si no cuadra. */
function requireCurrentPassword($row, $password) {
    if (!is_string($password) || $password === "" || !password_verify($password, $row["password_hash"])) {
        respond(["error" => "La contraseña actual no es correcta."], 401);
    }
}

/** Todas las filas de una consulta preparada con un único parámetro entero. */
function rowsFor($conn, $sql, $userId) {
    $stmt = $conn->prepare($sql);
    if (!$stmt) return [];
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $res = $stmt->get_result();
    $out = [];
    while ($row = $res->fetch_assoc()) $out[] = $row;
    return $out;
}

$method = $_SERVER["REQUEST_METHOD"];
$action = $_GET["action"] ?? "";
$row = userRow($conn, $userId);
if (!$row) {
    // Sesión que apunta a una cuenta ya borrada (p. ej. baja desde otro dispositivo). El token de
    // "seguir conectado" se fue con ella (ON DELETE CASCADE); aquí solo queda retirar la cookie.
    naturdexClearRememberCookie();
    $_SESSION = [];
    session_destroy();
    respond(["error" => "La cuenta ya no existe."], 401);
}

// ------------------------------------------------------------------------------------------------
// GET ?action=profile — datos de la cuenta + preferencias + cuatro cifras de contexto.
// ------------------------------------------------------------------------------------------------
if ($method === "GET" && ($action === "" || $action === "profile")) {
    // Cifras "de cuenta" que no están en el progreso estatal: cuántos parques tienen progreso
    // guardado en el servidor, cuántos avistamientos con coordenada GPS y desde cuándo hay
    // actividad registrada. Sirven para que Perfil no sea una pantalla de formularios a secas.
    $parks = rowsFor($conn, "SELECT park_slug, payload, updated_at FROM user_progress WHERE user_id = ? ORDER BY updated_at DESC", $userId);
    $sightings = 0;
    foreach ($parks as $p) {
        $payload = json_decode($p["payload"] ?? "", true);
        if (is_array($payload) && is_array($payload["sightings"] ?? null)) $sightings += count($payload["sightings"]);
    }
    $achievements = rowsFor($conn, "SELECT COUNT(*) AS n FROM user_achievements WHERE user_id = ?", $userId);
    $activity = rowsFor($conn, "SELECT MIN(activity_date) AS first_day, COUNT(DISTINCT activity_date) AS days FROM user_activity_log WHERE user_id = ?", $userId);
    // "Días de campo" son días con presencia verificada dentro de un espacio, no días de haber
    // abierto la app: eso último es `activeDays` y se queda como dato de uso, sin presumir de nada.
    $field = rowsFor($conn,
        "SELECT COUNT(DISTINCT DATE(started_at)) AS days, COALESCE(SUM(distance_m), 0) AS meters
         FROM user_park_visits WHERE user_id = ? AND verified = 1 AND suspicious = 0", $userId);

    respond([
        "user" => publicUser($row),
        "prefs" => decodePrefs($row),
        "stats" => [
            "parksWithProgress" => count($parks),
            "gpsSightings" => $sightings,
            "achievements" => (int) ($achievements[0]["n"] ?? 0),
            "fieldDays" => (int) ($field[0]["days"] ?? 0),
            "fieldKilometers" => (int) floor(((int) ($field[0]["meters"] ?? 0)) / 1000),
            "activeDays" => (int) ($activity[0]["days"] ?? 0),
            "firstActivity" => $activity[0]["first_day"] ?? null,
            "lastProgressAt" => $parks[0]["updated_at"] ?? null,
        ],
    ]);
}

// ------------------------------------------------------------------------------------------------
// GET ?action=export — copia completa de los datos de la cuenta, en un único JSON descargable.
// Es el derecho de portabilidad del RGPD resuelto de la forma más simple posible: todo lo que la
// base de datos guarda de esta persona, sin el hash de la contraseña.
// ------------------------------------------------------------------------------------------------
if ($method === "GET" && $action === "export") {
    header("Content-Disposition: attachment; filename=\"naturdex-mis-datos.json\"");
    $progress = [];
    foreach (rowsFor($conn, "SELECT park_slug, payload, updated_at FROM user_progress WHERE user_id = ? ORDER BY park_slug", $userId) as $p) {
        $progress[] = [
            "parkSlug" => $p["park_slug"],
            "updatedAt" => $p["updated_at"],
            "payload" => json_decode($p["payload"] ?? "", true),
        ];
    }
    respond([
        "exportedAt" => gmdate("c"),
        "app" => "NaturDex",
        "user" => publicUser($row),
        "prefs" => decodePrefs($row),
        "progressByPark" => $progress,
        "achievements" => rowsFor($conn, "SELECT achievement_id, unlocked_at, celebrated_at, context FROM user_achievements WHERE user_id = ? ORDER BY unlocked_at", $userId),
        "activityLog" => rowsFor($conn, "SELECT park_slug, activity_date FROM user_activity_log WHERE user_id = ? ORDER BY activity_date", $userId),
        // Las visitas verificadas son dato personal de pleno derecho (dónde estuvo esta persona y
        // cuándo): tienen que ir en la copia que se lleva, igual que todo lo demás.
        "parkVisits" => rowsFor($conn,
            "SELECT park_slug, started_at, last_fix_at, fix_count, distance_m, verified, suspicious, flags
             FROM user_park_visits WHERE user_id = ? ORDER BY started_at", $userId),
        "invasiveSightings" => rowsFor($conn, "SELECT e.scientific_name, e.common_name, e.ccaa, s.seen_at FROM user_invasive_sightings s JOIN especies_invasoras e ON e.id = s.invasive_id WHERE s.user_id = ? ORDER BY s.seen_at", $userId),
        "glossaryViews" => rowsFor($conn, "SELECT g.term, v.viewed_at FROM user_glossary_views v JOIN glosario g ON g.id = v.term_id WHERE v.user_id = ? ORDER BY v.viewed_at", $userId),
    ]);
}

if ($method !== "POST") {
    respond(["error" => "Método no permitido."], 405);
}

$body = json_decode(file_get_contents("php://input"), true);
if (!is_array($body)) $body = [];

// ------------------------------------------------------------------------------------------------
// POST ?action=profile — nombre visible y/o email.
// El nombre se puede cambiar sin más; el email, al ser la credencial de acceso, exige la
// contraseña actual (y solo se pide cuando el email cambia de verdad).
// ------------------------------------------------------------------------------------------------
if ($action === "profile") {
    $name = trim((string) ($body["name"] ?? ""));
    $email = trim(strtolower((string) ($body["email"] ?? "")));
    if ($name === "") respond(["error" => "El nombre no puede quedar vacío."], 400);
    if (mb_strlen($name) > 120) respond(["error" => "El nombre no puede pasar de 120 caracteres."], 400);

    $emailChanged = $email !== "" && $email !== strtolower($row["email"]);
    if ($emailChanged) {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) respond(["error" => "Email no válido."], 400);
        requireCurrentPassword($row, $body["currentPassword"] ?? "");
        $check = $conn->prepare("SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1");
        $check->bind_param("si", $email, $userId);
        $check->execute();
        if ($check->get_result()->fetch_assoc()) respond(["error" => "Ya existe otra cuenta con ese email."], 409);
        $upd = $conn->prepare("UPDATE users SET display_name = ?, email = ? WHERE id = ?");
        $upd->bind_param("ssi", $name, $email, $userId);
    } else {
        $upd = $conn->prepare("UPDATE users SET display_name = ? WHERE id = ?");
        $upd->bind_param("si", $name, $userId);
    }
    if (!$upd->execute()) respond(["error" => "No se pudieron guardar los cambios."], 500);

    respond(["user" => publicUser(userRow($conn, $userId)), "emailChanged" => $emailChanged]);
}

// ------------------------------------------------------------------------------------------------
// POST ?action=password — cambio de contraseña.
// El mínimo de 6 caracteres es el mismo que exige el registro en auth.php: si aquí fuese más
// estricto, una cuenta recién creada no podría cambiar su contraseña por una del mismo tipo.
// ------------------------------------------------------------------------------------------------
if ($action === "password") {
    $new = (string) ($body["newPassword"] ?? "");
    requireCurrentPassword($row, $body["currentPassword"] ?? "");
    if (strlen($new) < 6) respond(["error" => "La contraseña nueva debe tener al menos 6 caracteres."], 400);
    if (password_verify($new, $row["password_hash"])) respond(["error" => "La contraseña nueva es igual que la actual."], 400);

    $hash = password_hash($new, PASSWORD_DEFAULT);
    $upd = $conn->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
    $upd->bind_param("si", $hash, $userId);
    if (!$upd->execute()) respond(["error" => "No se pudo cambiar la contraseña."], 500);

    // Identificador de sesión nuevo tras cambiar la credencial (fijación de sesión).
    session_regenerate_id(true);
    // Si la contraseña se cambia porque alguien pudo entrar, dejar vivos los "seguir conectado"
    // antiguos haría inútil el cambio: se revocan TODOS y se emite uno nuevo para este dispositivo,
    // que es el único que acaba de demostrar que sabe la contraseña.
    naturdexForgetAllForUser($conn, $userId);
    naturdexRememberUser($conn, $userId);
    respond(["ok" => true]);
}

// ------------------------------------------------------------------------------------------------
// POST ?action=prefs — preferencias de la app (tema, accesibilidad, mapa, GPS…).
// El dispositivo manda: el frontend las aplica desde localStorage al instante y aquí solo las
// espeja para que la misma cuenta las recupere en otro móvil u ordenador. Se guarda el objeto tal
// cual (es un diccionario abierto y pequeño), con un tope de tamaño para que no sirva de almacén.
// ------------------------------------------------------------------------------------------------
if ($action === "prefs") {
    $prefs = $body["prefs"] ?? null;
    if (!is_array($prefs)) respond(["error" => "Se espera { prefs: { ... } }."], 400);
    $json = json_encode($prefs, JSON_UNESCAPED_UNICODE);
    if (strlen($json) > 4096) respond(["error" => "Preferencias demasiado grandes."], 413);

    $upd = $conn->prepare("UPDATE users SET prefs = ? WHERE id = ?");
    $upd->bind_param("si", $json, $userId);
    if (!$upd->execute()) respond(["error" => "No se pudieron guardar las preferencias."], 500);
    respond(["ok" => true]);
}

// ------------------------------------------------------------------------------------------------
// POST ?action=delete — baja de la cuenta. Irreversible.
// Exige contraseña actual Y la palabra de confirmación escrita a mano, para que no baste con un
// toque accidental. El resto de tablas (progreso, logros, actividad…) cuelgan de users con
// ON DELETE CASCADE, así que un único DELETE se lo lleva todo.
// ------------------------------------------------------------------------------------------------
if ($action === "delete") {
    requireCurrentPassword($row, $body["password"] ?? "");
    if (trim((string) ($body["confirm"] ?? "")) !== "BORRAR") {
        respond(["error" => "Para confirmar la baja hay que escribir BORRAR."], 400);
    }
    $del = $conn->prepare("DELETE FROM users WHERE id = ?");
    $del->bind_param("i", $userId);
    if (!$del->execute()) respond(["error" => "No se pudo borrar la cuenta."], 500);

    // Los tokens de todos sus dispositivos cuelgan de users con ON DELETE CASCADE y ya se han ido
    // con el DELETE; aquí solo hay que retirar la cookie de este.
    naturdexClearRememberCookie();
    $_SESSION = [];
    session_destroy();
    respond(["ok" => true]);
}

respond(["error" => "Acción no reconocida. Usa 'profile', 'password', 'prefs', 'export' o 'delete'."], 400);
