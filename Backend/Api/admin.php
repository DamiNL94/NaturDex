<?php
// ================================================================================================
// admin.php — API del panel de administración: CRUD del contenido ambiental.
// ------------------------------------------------------------------------------------------------
// Solo para administradores (users.role = 'admin'), con sesión iniciada vía auth.php. Seguridad:
//  - Sin cabeceras CORS: solo mismo origen (a diferencia de la API pública de lectura).
//  - Toda escritura exige POST + cabecera X-Requested-With (mitiga CSRF junto a SameSite).
//  - Todas las consultas van con prepared statements; los campos se toman de una lista blanca.
//  - Nota de prototipo: en producción, servir por HTTPS y endurecer sesión/límites de intentos.
//
// Acciones (action=):
//   GET  overview                         → usuario + lista de parques con contadores
//   GET  list&resource=<r>&park=<slug>    → filas de species|habitats|pois (forma de la BD)
//   POST save&resource=<r>                → body {park, item:{...}} (item.id>0 actualiza; si no, crea)
//   POST delete&resource=<r>              → body {id}
//   POST export                           → body {park}: regenera park.json + contadores (offline)
// ================================================================================================
session_start();
header("Content-Type: application/json; charset=utf-8");

require_once __DIR__ . "/../Config/db.php";

function respond($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

// --- Guardia: sesión + rol de administrador ------------------------------------------------------
if (empty($_SESSION["user_id"])) respond(["error" => "Necesitas iniciar sesión."], 401);
$stmt = $conn->prepare("SELECT id, email, display_name, role FROM users WHERE id = ? LIMIT 1");
$stmt->bind_param("i", $_SESSION["user_id"]);
$stmt->execute();
$me = $stmt->get_result()->fetch_assoc();
if (!$me) respond(["error" => "Sesión no válida."], 401);
if (($me["role"] ?? "user") !== "admin") {
    respond(["error" => "Tu cuenta no es de administrador. Pide a un administrador: UPDATE users SET role='admin' WHERE email='" . $me["email"] . "';"], 403);
}

$method = $_SERVER["REQUEST_METHOD"];
$action = $_GET["action"] ?? "";
$resource = $_GET["resource"] ?? "";

if ($method === "POST" && ($_SERVER["HTTP_X_REQUESTED_WITH"] ?? "") !== "XMLHttpRequest") {
    respond(["error" => "Petición no válida (falta X-Requested-With)."], 400);
}

$body = [];
if ($method === "POST") {
    $body = json_decode(file_get_contents("php://input"), true);
    if (!is_array($body)) $body = [];
}

// --- Utilidades -----------------------------------------------------------------------------------
function parkIdBySlug($conn, $slug) {
    $stmt = $conn->prepare("SELECT id FROM parks WHERE slug = ? LIMIT 1");
    $stmt->bind_param("s", $slug);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    return $row ? (int) $row["id"] : null;
}
function sOrNull($item, $key) { $v = trim((string) ($item[$key] ?? "")); return $v === "" ? null : $v; }
function numOrNull($item, $key) {
    $v = $item[$key] ?? null;
    if ($v === null || $v === "") return null;
    if (!is_numeric($v)) respond(["error" => "El campo '$key' debe ser numérico."], 400);
    return (float) $v;
}

// ====================================================================================================
// GET overview — parques y contadores
// ====================================================================================================
if ($method === "GET" && $action === "overview") {
    $parks = [];
    $res = $conn->query("SELECT p.id, p.slug, p.name, p.latitude, p.longitude,
        (SELECT COUNT(*) FROM species s WHERE s.park_id = p.id) AS species_count,
        (SELECT COUNT(*) FROM habitats h WHERE h.park_id = p.id) AS habitats_count,
        (SELECT COUNT(*) FROM points_of_interest x WHERE x.park_id = p.id) AS pois_count
        FROM parks p ORDER BY p.name");
    while ($row = $res->fetch_assoc()) {
        $parks[] = [
            "slug" => $row["slug"], "name" => $row["name"],
            // Centro del parque: el panel lo usa para encuadrar el mini-mapa de coordenadas.
            "latitude" => $row["latitude"] !== null ? (float) $row["latitude"] : null,
            "longitude" => $row["longitude"] !== null ? (float) $row["longitude"] : null,
            "species" => (int) $row["species_count"],
            "habitats" => (int) $row["habitats_count"],
            "pois" => (int) $row["pois_count"]
        ];
    }
    respond(["user" => ["email" => $me["email"], "name" => $me["display_name"]], "parks" => $parks]);
}

// ====================================================================================================
// GET list — filas crudas de la BD por recurso
// ====================================================================================================
if ($method === "GET" && $action === "list") {
    $parkId = parkIdBySlug($conn, $_GET["park"] ?? "");
    if (!$parkId) respond(["error" => "Parque no encontrado."], 404);

    if ($resource === "habitats") {
        $stmt = $conn->prepare("SELECT id, slug, code, name, habitat_type, description, is_priority, latitude, longitude, color, review_note, audio_url, audio_transcript FROM habitats WHERE park_id = ? ORDER BY name");
        $stmt->bind_param("i", $parkId);
        $stmt->execute();
        respond(["items" => $stmt->get_result()->fetch_all(MYSQLI_ASSOC)]);
    }
    if ($resource === "pois") {
        $stmt = $conn->prepare("SELECT id, slug, name, type, description, latitude, longitude, image_url, source, is_approx, audio_url, audio_transcript FROM points_of_interest WHERE park_id = ? ORDER BY name");
        $stmt->bind_param("i", $parkId);
        $stmt->execute();
        respond(["items" => $stmt->get_result()->fetch_all(MYSQLI_ASSOC)]);
    }
    if ($resource === "species") {
        $stmt = $conn->prepare("SELECT id, common_name, scientific_name, kingdom, family, primary_habitat, conservation_status, description, identification_tips, seasonality, image_url, latitude, longitude, rarity_score, is_featured, source, taxon_phylum, taxon_class, taxon_order, taxon_family, taxon_genus, iucn_global, spain_status, murcia_status, review_note FROM species WHERE park_id = ? ORDER BY common_name");
        $stmt->bind_param("i", $parkId);
        $stmt->execute();
        $items = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        // Relación especie ↔ hábitat (ids de la BD, para las casillas del formulario)
        $rel = $conn->prepare("SELECT sh.species_id, sh.habitat_id FROM species_habitats sh JOIN species sp ON sp.id = sh.species_id WHERE sp.park_id = ?");
        $rel->bind_param("i", $parkId);
        $rel->execute();
        $map = [];
        $relResult = $rel->get_result();
        while ($row = $relResult->fetch_assoc()) $map[(int) $row["species_id"]][] = (int) $row["habitat_id"];
        foreach ($items as &$item) $item["habitat_ids"] = $map[(int) $item["id"]] ?? [];
        respond(["items" => $items]);
    }
    respond(["error" => "Recurso no reconocido."], 400);
}

// ====================================================================================================
// POST save — crea (id vacío) o actualiza (id>0). Campos de lista blanca, prepared statements.
// ====================================================================================================
if ($method === "POST" && $action === "save") {
    $parkId = parkIdBySlug($conn, $body["park"] ?? "");
    if (!$parkId) respond(["error" => "Parque no encontrado."], 404);
    $item = is_array($body["item"] ?? null) ? $body["item"] : [];
    $id = (int) ($item["id"] ?? 0);

    if ($resource === "habitats") {
        $name = sOrNull($item, "name");
        if (!$name) respond(["error" => "El nombre del hábitat es obligatorio."], 400);
        $slug = sOrNull($item, "slug"); $code = sOrNull($item, "code"); $type = sOrNull($item, "habitat_type");
        $desc = sOrNull($item, "description"); $prio = !empty($item["is_priority"]) ? 1 : 0;
        $lat = numOrNull($item, "latitude"); $lng = numOrNull($item, "longitude");
        $color = sOrNull($item, "color"); $note = sOrNull($item, "review_note");
        $audio = sOrNull($item, "audio_url"); $audioTx = sOrNull($item, "audio_transcript");
        if ($id > 0) {
            $stmt = $conn->prepare("UPDATE habitats SET slug=?, code=?, name=?, habitat_type=?, description=?, is_priority=?, latitude=?, longitude=?, color=?, review_note=?, audio_url=?, audio_transcript=? WHERE id=? AND park_id=?");
            $stmt->bind_param("sssssiddssssii", $slug, $code, $name, $type, $desc, $prio, $lat, $lng, $color, $note, $audio, $audioTx, $id, $parkId);
        } else {
            $stmt = $conn->prepare("INSERT INTO habitats (park_id, slug, code, name, habitat_type, description, is_priority, latitude, longitude, color, review_note, audio_url, audio_transcript) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)");
            $stmt->bind_param("isssssiddssss", $parkId, $slug, $code, $name, $type, $desc, $prio, $lat, $lng, $color, $note, $audio, $audioTx);
        }
        if (!$stmt->execute()) respond(["error" => "No se pudo guardar el hábitat: " . $conn->error], 500);
        respond(["ok" => true, "id" => $id > 0 ? $id : $conn->insert_id]);
    }

    if ($resource === "pois") {
        $name = sOrNull($item, "name"); $slug = sOrNull($item, "slug");
        if (!$name || !$slug) respond(["error" => "El punto de interés necesita nombre y slug."], 400);
        $type = sOrNull($item, "type"); $desc = sOrNull($item, "description");
        $lat = numOrNull($item, "latitude"); $lng = numOrNull($item, "longitude");
        $img = sOrNull($item, "image_url"); $src = sOrNull($item, "source");
        $approx = !empty($item["is_approx"]) ? 1 : 0;
        $audio = sOrNull($item, "audio_url"); $audioTx = sOrNull($item, "audio_transcript");
        if ($id > 0) {
            $stmt = $conn->prepare("UPDATE points_of_interest SET slug=?, name=?, type=?, description=?, latitude=?, longitude=?, image_url=?, source=?, is_approx=?, audio_url=?, audio_transcript=? WHERE id=? AND park_id=?");
            $stmt->bind_param("ssssddssissii", $slug, $name, $type, $desc, $lat, $lng, $img, $src, $approx, $audio, $audioTx, $id, $parkId);
        } else {
            $stmt = $conn->prepare("INSERT INTO points_of_interest (park_id, slug, name, type, description, latitude, longitude, image_url, source, is_approx, audio_url, audio_transcript) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)");
            $stmt->bind_param("issssddssiss", $parkId, $slug, $name, $type, $desc, $lat, $lng, $img, $src, $approx, $audio, $audioTx);
        }
        if (!$stmt->execute()) respond(["error" => "No se pudo guardar el punto de interés: " . $conn->error], 500);
        respond(["ok" => true, "id" => $id > 0 ? $id : $conn->insert_id]);
    }

    if ($resource === "species") {
        $common = sOrNull($item, "common_name"); $sci = sOrNull($item, "scientific_name");
        if (!$common || !$sci) respond(["error" => "La especie necesita nombre común y científico."], 400);
        $kingdom = $item["kingdom"] ?? "";
        if (!in_array($kingdom, ["flora", "fauna", "fungi", "other"], true)) respond(["error" => "Reino no válido."], 400);
        $rarity = (int) ($item["rarity_score"] ?? 1);
        if ($rarity < 1 || $rarity > 5) respond(["error" => "La rareza debe estar entre 1 y 5."], 400);
        $family = sOrNull($item, "family"); $pHab = sOrNull($item, "primary_habitat");
        $status = sOrNull($item, "conservation_status"); $desc = sOrNull($item, "description");
        $tips = sOrNull($item, "identification_tips"); $season = sOrNull($item, "seasonality");
        $img = sOrNull($item, "image_url");
        $lat = numOrNull($item, "latitude"); $lng = numOrNull($item, "longitude");
        $featured = !empty($item["is_featured"]) ? 1 : 0; $source = sOrNull($item, "source");
        $tPhy = sOrNull($item, "taxon_phylum"); $tCla = sOrNull($item, "taxon_class");
        $tOrd = sOrNull($item, "taxon_order"); $tFam = sOrNull($item, "taxon_family");
        $tGen = sOrNull($item, "taxon_genus");
        $iucn = sOrNull($item, "iucn_global"); $esp = sOrNull($item, "spain_status");
        $mur = sOrNull($item, "murcia_status"); $note = sOrNull($item, "review_note");

        $conn->begin_transaction();
        if ($id > 0) {
            $stmt = $conn->prepare("UPDATE species SET common_name=?, scientific_name=?, kingdom=?, family=?, primary_habitat=?, conservation_status=?, description=?, identification_tips=?, seasonality=?, image_url=?, latitude=?, longitude=?, rarity_score=?, is_featured=?, source=?, taxon_phylum=?, taxon_class=?, taxon_order=?, taxon_family=?, taxon_genus=?, iucn_global=?, spain_status=?, murcia_status=?, review_note=? WHERE id=? AND park_id=?");
            // Tipos: 10 textos + lat/lng + rareza/destacada + 10 textos + id/park_id
            $stmt->bind_param("ssssssssssddiissssssssssii", $common, $sci, $kingdom, $family, $pHab, $status, $desc, $tips, $season, $img, $lat, $lng, $rarity, $featured, $source, $tPhy, $tCla, $tOrd, $tFam, $tGen, $iucn, $esp, $mur, $note, $id, $parkId);
        } else {
            $stmt = $conn->prepare("INSERT INTO species (park_id, common_name, scientific_name, kingdom, family, primary_habitat, conservation_status, description, identification_tips, seasonality, image_url, latitude, longitude, rarity_score, is_featured, source, taxon_phylum, taxon_class, taxon_order, taxon_family, taxon_genus, iucn_global, spain_status, murcia_status, review_note) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
            // Tipos: park_id + 10 textos + lat/lng + rareza/destacada + 10 textos
            $stmt->bind_param("issssssssssddiissssssssss", $parkId, $common, $sci, $kingdom, $family, $pHab, $status, $desc, $tips, $season, $img, $lat, $lng, $rarity, $featured, $source, $tPhy, $tCla, $tOrd, $tFam, $tGen, $iucn, $esp, $mur, $note);
        }
        if (!$stmt->execute()) { $conn->rollback(); respond(["error" => "No se pudo guardar la especie: " . $conn->error], 500); }
        $speciesId = $id > 0 ? $id : $conn->insert_id;

        // Relación especie ↔ hábitats: se reemplaza entera con la selección del formulario.
        $habitatIds = array_values(array_unique(array_map("intval", is_array($item["habitat_ids"] ?? null) ? $item["habitat_ids"] : [])));
        $del = $conn->prepare("DELETE FROM species_habitats WHERE species_id = ?");
        $del->bind_param("i", $speciesId);
        $del->execute();
        if ($habitatIds) {
            $ins = $conn->prepare("INSERT INTO species_habitats (species_id, habitat_id) SELECT ?, id FROM habitats WHERE id = ? AND park_id = ?");
            foreach ($habitatIds as $hid) {
                $ins->bind_param("iii", $speciesId, $hid, $parkId);
                $ins->execute();
            }
        }
        $conn->commit();
        respond(["ok" => true, "id" => $speciesId]);
    }
    respond(["error" => "Recurso no reconocido."], 400);
}

// ====================================================================================================
// POST delete — por id, siempre acotado al recurso (las FK limpian las relaciones en cascada)
// ====================================================================================================
if ($method === "POST" && $action === "delete") {
    $id = (int) ($body["id"] ?? 0);
    if ($id <= 0) respond(["error" => "Falta el id."], 400);
    $tables = ["species" => "species", "habitats" => "habitats", "pois" => "points_of_interest"];
    if (!isset($tables[$resource])) respond(["error" => "Recurso no reconocido."], 400);
    $stmt = $conn->prepare("DELETE FROM " . $tables[$resource] . " WHERE id = ?");
    $stmt->bind_param("i", $id);
    if (!$stmt->execute()) respond(["error" => "No se pudo eliminar: " . $conn->error], 500);
    respond(["ok" => true, "deleted" => $stmt->affected_rows]);
}

// ====================================================================================================
// POST export — regenera el park.json empaquetado (offline) del parque
// ====================================================================================================
if ($method === "POST" && $action === "export") {
    require_once __DIR__ . "/../Lib/park_export.php";
    $slug = trim((string) ($body["park"] ?? ""));
    if ($slug === "") respond(["error" => "Falta el parque."], 400);
    $result = exportParkToJson($conn, __DIR__ . "/../../Frontend", $slug);
    if (!$result["ok"]) respond(["error" => $result["error"]], 500);
    respond($result);
}

respond(["error" => "Acción no reconocida."], 400);
