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
//   POST save_geometry&resource=habitats  → body {park, id, geometry}: guarda/borra el polígono
//   POST delete&resource=<r>              → body {id}
//   POST export                           → body {park}: regenera park.json + contadores (offline)
// ================================================================================================
require_once __DIR__ . "/../Lib/api.php";
require_once __DIR__ . "/../Lib/species_tips.php";
// `cors: false` a propósito: el panel se sirve del mismo origen y esta API no debe anunciarse a
// ningún otro (a diferencia de la API pública de lectura).
$conn = apiBoot(["cors" => false, "session" => true]);

// --- Guardia: sesión + rol de administrador ------------------------------------------------------
if (empty($_SESSION["user_id"])) apiError("Necesitas iniciar sesión.", 401);
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

// Convierte un texto (nombre del parque, o un slug tecleado a mano) en un slug seguro para URL/BD:
// minúsculas ASCII, acentos y ñ transliterados, y cualquier otra cosa colapsada a guiones. Se usa
// para la clave `slug` de los parques (misma convención que 'cabo-cope-puntas-calnegre'). No depende
// de la configuración de locale de iconv: la tabla de acentos es explícita para no fallar en Docker.
function slugify($text) {
    $text = trim((string) $text);
    if ($text === "") return "";
    $from = ['á','à','ä','â','ã','é','è','ë','ê','í','ì','ï','î','ó','ò','ö','ô','õ','ú','ù','ü','û','ñ','ç','Á','À','Ä','Â','Ã','É','È','Ë','Ê','Í','Ì','Ï','Î','Ó','Ò','Ö','Ô','Õ','Ú','Ù','Ü','Û','Ñ','Ç'];
    $to   = ['a','a','a','a','a','e','e','e','e','i','i','i','i','o','o','o','o','o','u','u','u','u','n','c','a','a','a','a','a','e','e','e','e','i','i','i','i','o','o','o','o','o','u','u','u','u','n','c'];
    $text = str_replace($from, $to, $text);
    $text = mb_strtolower($text, "UTF-8");
    $text = preg_replace('/[^a-z0-9]+/', '-', $text);
    return trim($text, '-');
}

// Comprueba que un anillo/estructura de coordenadas GeoJSON sea numérica hasta las hojas [lon,lat].
// La profundidad esperada: Polygon = 3 ([[[x,y]...]]), MultiPolygon = 4 ([[[[x,y]...]]]).
function coordsAllNumeric($node, $depth) {
    if (!is_array($node) || count($node) === 0) return false;
    if ($depth === 0) {
        // Hoja: par [lon, lat] con al menos dos números finitos.
        if (count($node) < 2) return false;
        foreach ($node as $n) { if (!is_int($n) && !is_float($n)) return false; if (!is_finite($n)) return false; }
        return true;
    }
    foreach ($node as $child) { if (!coordsAllNumeric($child, $depth - 1)) return false; }
    return true;
}

// Valida una geometría GeoJSON de área (Polygon o MultiPolygon) con coordenadas numéricas. Devuelve
// la geometría saneada (solo type + coordinates) o aborta con 400 si no es válida.
function validatePolygonGeometry($geom) {
    if (!is_array($geom)) respond(["error" => "La geometría debe ser un objeto GeoJSON."], 400);
    $type = $geom["type"] ?? "";
    $coords = $geom["coordinates"] ?? null;
    if ($type === "Polygon") {
        if (!coordsAllNumeric($coords, 2)) respond(["error" => "Coordenadas de Polygon no válidas."], 400);
    } elseif ($type === "MultiPolygon") {
        if (!coordsAllNumeric($coords, 3)) respond(["error" => "Coordenadas de MultiPolygon no válidas."], 400);
    } else {
        respond(["error" => "La geometría debe ser Polygon o MultiPolygon."], 400);
    }
    // Se guarda solo la geometría (type + coordinates), sin propiedades ajenas que pudieran colarse.
    return ["type" => $type, "coordinates" => $coords];
}
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
    $res = $conn->query("SELECT p.id, p.slug, p.name, p.category, p.region, p.province, p.municipality,
        p.description, p.area_hectares, p.coastline_km, p.latitude, p.longitude, p.status,
        (SELECT COUNT(*) FROM species s WHERE s.park_id = p.id) AS species_count,
        (SELECT COUNT(*) FROM habitats h WHERE h.park_id = p.id) AS habitats_count,
        (SELECT COUNT(*) FROM points_of_interest x WHERE x.park_id = p.id) AS pois_count
        FROM parks p ORDER BY p.category, p.name");
    while ($row = $res->fetch_assoc()) {
        $parks[] = [
            "id" => (int) $row["id"],
            "slug" => $row["slug"], "name" => $row["name"],
            // Figura de protección (Parque Natural / Regional / Nacional…): el panel agrupa el
            // selector por categoría para que el administrador elija el parque correcto de un vistazo.
            "category" => $row["category"],
            // Resto de la ficha del parque: el panel las usa para el formulario de edición del parque.
            "region" => $row["region"], "province" => $row["province"], "municipality" => $row["municipality"],
            "description" => $row["description"],
            "area_hectares" => $row["area_hectares"] !== null ? (float) $row["area_hectares"] : null,
            "coastline_km" => $row["coastline_km"] !== null ? (float) $row["coastline_km"] : null,
            // Centro del parque: el panel lo usa para encuadrar el mini-mapa de coordenadas.
            "latitude" => $row["latitude"] !== null ? (float) $row["latitude"] : null,
            "longitude" => $row["longitude"] !== null ? (float) $row["longitude"] : null,
            // Nivel de dato: 'basic' (ficha base), 'available' (catálogo completo) o 'planned'.
            "status" => $row["status"],
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
        $stmt = $conn->prepare("SELECT id, slug, code, name, habitat_type, description, is_priority, latitude, longitude, color, geometry, review_note, audio_url, audio_transcript FROM habitats WHERE park_id = ? ORDER BY name");
        $stmt->bind_param("i", $parkId);
        $stmt->execute();
        $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        // La geometría vive como JSON en la BD: se entrega ya parseada (objeto GeoJSON o null) para
        // que el editor de polígonos del panel la consuma sin volver a parsear.
        foreach ($rows as &$row) $row["geometry"] = $row["geometry"] !== null ? json_decode($row["geometry"]) : null;
        respond(["items" => $rows]);
    }
    if ($resource === "pois") {
        $stmt = $conn->prepare("SELECT id, slug, name, type, description, latitude, longitude, image_url, source, is_approx, audio_url, audio_transcript FROM points_of_interest WHERE park_id = ? ORDER BY name");
        $stmt->bind_param("i", $parkId);
        $stmt->execute();
        respond(["items" => $stmt->get_result()->fetch_all(MYSQLI_ASSOC)]);
    }
    if ($resource === "species") {
        $stmt = $conn->prepare("SELECT id, common_name, scientific_name, kingdom, family, primary_habitat, description, identification_tips, seasonality, image_url, latitude, longitude, rarity_score, is_featured, source, taxon_phylum, taxon_class, taxon_order, taxon_family, taxon_genus, iucn_global, iucn_spain, spain_status, regional_status, regional_ccaa, review_note FROM species WHERE park_id = ? ORDER BY common_name");
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
        foreach ($items as &$item) {
            $item["habitat_ids"] = $map[(int) $item["id"]] ?? [];
            // Las pistas viven como array JSON; el formulario las edita UNA POR LÍNEA, porque el «;»
            // puede ir dentro de una pista y ya no separa nada (Lib/species_tips.php).
            $item["identification_tips"] = speciesTipsToLines(speciesTipsDecode($item["identification_tips"]));
        }
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
        // Un punto de interés es, por definición, un punto: sin coordenadas no se puede pintar ni
        // descubrir por proximidad. A diferencia de las especies (las aves de la ZEPA vuelan y
        // adquieren ubicación cuando el usuario las marca) aquí las coordenadas son obligatorias.
        $lat = numOrNull($item, "latitude"); $lng = numOrNull($item, "longitude");
        if ($lat === null || $lng === null) respond(["error" => "El punto de interés necesita latitud y longitud: usa el mini-mapa para situarlo."], 400);
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
        $desc = sOrNull($item, "description");
        // Una pista por línea en el formulario → array JSON en la columna (Lib/species_tips.php).
        $tips = speciesTipsEncode(speciesTipsFromLines($item["identification_tips"] ?? ""));
        $season = sOrNull($item, "seasonality");
        $img = sOrNull($item, "image_url");
        $lat = numOrNull($item, "latitude"); $lng = numOrNull($item, "longitude");
        $featured = !empty($item["is_featured"]) ? 1 : 0; $source = sOrNull($item, "source");
        $tPhy = sOrNull($item, "taxon_phylum"); $tCla = sOrNull($item, "taxon_class");
        $tOrd = sOrNull($item, "taxon_order"); $tFam = sOrNull($item, "taxon_family");
        $tGen = sOrNull($item, "taxon_genus");
        $iucn = sOrNull($item, "iucn_global"); $iucnEs = sOrNull($item, "iucn_spain");
        $esp = sOrNull($item, "spain_status");
        $mur = sOrNull($item, "regional_status"); $ccaa = sOrNull($item, "regional_ccaa");
        $note = sOrNull($item, "review_note");

        $conn->begin_transaction();
        if ($id > 0) {
            $stmt = $conn->prepare("UPDATE species SET common_name=?, scientific_name=?, kingdom=?, family=?, primary_habitat=?, description=?, identification_tips=?, seasonality=?, image_url=?, latitude=?, longitude=?, rarity_score=?, is_featured=?, source=?, taxon_phylum=?, taxon_class=?, taxon_order=?, taxon_family=?, taxon_genus=?, iucn_global=?, iucn_spain=?, spain_status=?, regional_status=?, regional_ccaa=?, review_note=? WHERE id=? AND park_id=?");
            // Tipos: 9 textos + lat/lng + rareza/destacada + 12 textos + id/park_id
            $stmt->bind_param("sssssssssddiissssssssssssii", $common, $sci, $kingdom, $family, $pHab, $desc, $tips, $season, $img, $lat, $lng, $rarity, $featured, $source, $tPhy, $tCla, $tOrd, $tFam, $tGen, $iucn, $iucnEs, $esp, $mur, $ccaa, $note, $id, $parkId);
        } else {
            $stmt = $conn->prepare("INSERT INTO species (park_id, common_name, scientific_name, kingdom, family, primary_habitat, description, identification_tips, seasonality, image_url, latitude, longitude, rarity_score, is_featured, source, taxon_phylum, taxon_class, taxon_order, taxon_family, taxon_genus, iucn_global, iucn_spain, spain_status, regional_status, regional_ccaa, review_note) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
            // Tipos: park_id + 9 textos + lat/lng + rareza/destacada + 12 textos
            $stmt->bind_param("isssssssssddiissssssssssss", $parkId, $common, $sci, $kingdom, $family, $pHab, $desc, $tips, $season, $img, $lat, $lng, $rarity, $featured, $source, $tPhy, $tCla, $tOrd, $tFam, $tGen, $iucn, $iucnEs, $esp, $mur, $ccaa, $note);
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
// POST save_geometry — guarda (o borra) el polígono de un hábitat. La BD es la fuente de verdad de
// la geometría; el habitats.geojson se regenera desde aquí al "Publicar cambios offline".
// ====================================================================================================
if ($method === "POST" && $action === "save_geometry") {
    if ($resource !== "habitats") respond(["error" => "Solo los hábitats tienen geometría."], 400);
    $parkId = parkIdBySlug($conn, $body["park"] ?? "");
    if (!$parkId) respond(["error" => "Parque no encontrado."], 404);
    $id = (int) ($body["id"] ?? 0);
    if ($id <= 0) respond(["error" => "Falta el id del hábitat."], 400);

    // geometry ausente o null borra el polígono; en otro caso se valida y se guarda saneada.
    $raw = $body["geometry"] ?? null;
    if ($raw === null) {
        $json = null;
    } else {
        $json = json_encode(validatePolygonGeometry($raw), JSON_UNESCAPED_UNICODE);
    }

    $stmt = $conn->prepare("UPDATE habitats SET geometry = ? WHERE id = ? AND park_id = ?");
    $stmt->bind_param("sii", $json, $id, $parkId);
    if (!$stmt->execute()) respond(["error" => "No se pudo guardar la geometría: " . $conn->error], 500);
    if ($stmt->affected_rows === 0) {
        // Ni error de SQL ni filas afectadas: el hábitat no existe en ese parque (o no cambió nada).
        $check = $conn->prepare("SELECT 1 FROM habitats WHERE id = ? AND park_id = ? LIMIT 1");
        $check->bind_param("ii", $id, $parkId);
        $check->execute();
        if (!$check->get_result()->fetch_row()) respond(["error" => "Hábitat no encontrado en este parque."], 404);
    }
    respond(["ok" => true, "id" => $id]);
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
// POST save_park — crea (id vacío) o actualiza (id>0) la ficha de un parque. Es la raíz de la que
// cuelgan hábitats/especies/POIs: darlo de alta aquí lo hace aparecer en el selector del panel para
// rellenar su catálogo desde la GUI. `slug` se normaliza (slugify) y es único entre parques.
// ====================================================================================================
if ($method === "POST" && $action === "save_park") {
    $item = is_array($body["item"] ?? null) ? $body["item"] : [];
    $id = (int) ($item["id"] ?? 0);

    $name = sOrNull($item, "name");
    if (!$name) respond(["error" => "El nombre del parque es obligatorio."], 400);
    // slug: si el administrador teclea uno, se sanea; si lo deja vacío, se deriva del nombre.
    $slug = slugify(sOrNull($item, "slug") ?? $name);
    if ($slug === "") respond(["error" => "El slug del parque no es válido (usa letras o números)."], 400);
    $category = sOrNull($item, "category");
    if (!$category) respond(["error" => "La figura de protección (categoría) es obligatoria."], 400);
    $region = sOrNull($item, "region");
    if (!$region) respond(["error" => "La comunidad autónoma es obligatoria."], 400);
    $province = sOrNull($item, "province");
    if (!$province) respond(["error" => "La provincia es obligatoria."], 400);
    $municipality = sOrNull($item, "municipality");
    $description = sOrNull($item, "description");
    $area = numOrNull($item, "area_hectares");
    $coast = numOrNull($item, "coastline_km");
    $lat = numOrNull($item, "latitude");
    $lng = numOrNull($item, "longitude");
    if ($lat === null || $lng === null) respond(["error" => "El centro del parque (latitud y longitud) es obligatorio."], 400);
    if ($lat < -90 || $lat > 90 || $lng < -180 || $lng > 180) respond(["error" => "Las coordenadas están fuera de rango."], 400);

    // Nivel de dato del espacio. Se valida contra la lista cerrada antes de tocar la BD: el ENUM de
    // MySQL rechazaría un valor inválido, pero en modo no estricto lo guardaría como cadena vacía y
    // el espacio desaparecería del selector sin que nadie supiera por qué. Un espacio nuevo nace
    // 'basic' (ficha base) mientras no se diga lo contrario.
    $status = sOrNull($item, "status") ?? "basic";
    $allowedStatus = ["basic", "available", "planned"];
    if (!in_array($status, $allowedStatus, true)) {
        respond(["error" => "Nivel de dato no válido: '$status'. Valores admitidos: " . implode(", ", $allowedStatus) . "."], 400);
    }

    // Unicidad del slug: no puede chocar con OTRO parque (id distinto).
    $dup = $conn->prepare("SELECT id FROM parks WHERE slug = ? AND id <> ? LIMIT 1");
    $dup->bind_param("si", $slug, $id);
    $dup->execute();
    if ($dup->get_result()->fetch_row()) respond(["error" => "Ya existe un parque con el slug '$slug'. Elige otro."], 409);

    if ($id > 0) {
        $stmt = $conn->prepare("UPDATE parks SET slug=?, name=?, category=?, region=?, province=?, municipality=?, description=?, area_hectares=?, coastline_km=?, latitude=?, longitude=?, status=? WHERE id=?");
        $stmt->bind_param("sssssssddddsi", $slug, $name, $category, $region, $province, $municipality, $description, $area, $coast, $lat, $lng, $status, $id);
        if (!$stmt->execute()) respond(["error" => "No se pudo guardar el parque: " . $conn->error], 500);
        if ($stmt->affected_rows === 0) {
            $chk = $conn->prepare("SELECT 1 FROM parks WHERE id = ? LIMIT 1");
            $chk->bind_param("i", $id);
            $chk->execute();
            if (!$chk->get_result()->fetch_row()) respond(["error" => "Parque no encontrado."], 404);
        }
        respond(["ok" => true, "id" => $id, "slug" => $slug]);
    }
    $stmt = $conn->prepare("INSERT INTO parks (slug, name, category, region, province, municipality, description, area_hectares, coastline_km, latitude, longitude, status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)");
    $stmt->bind_param("sssssssdddds", $slug, $name, $category, $region, $province, $municipality, $description, $area, $coast, $lat, $lng, $status);
    if (!$stmt->execute()) respond(["error" => "No se pudo crear el parque: " . $conn->error], 500);
    respond(["ok" => true, "id" => $conn->insert_id, "slug" => $slug]);
}

// ====================================================================================================
// POST delete_park — elimina un parque, pero SOLO si está vacío. La FK ON DELETE CASCADE borraría en
// silencio todo su catálogo (hábitats/especies/POIs y sus relaciones), así que se exige vaciarlo
// antes a mano: es una salvaguarda contra borrar el trabajo de un parque por un clic accidental.
// ====================================================================================================
if ($method === "POST" && $action === "delete_park") {
    $parkId = parkIdBySlug($conn, $body["park"] ?? "");
    if (!$parkId) respond(["error" => "Parque no encontrado."], 404);
    $tables = ["especies" => "species", "hábitats" => "habitats", "puntos de interés" => "points_of_interest"];
    foreach ($tables as $label => $table) {
        $c = $conn->prepare("SELECT COUNT(*) AS n FROM $table WHERE park_id = ?");
        $c->bind_param("i", $parkId);
        $c->execute();
        $n = (int) $c->get_result()->fetch_assoc()["n"];
        if ($n > 0) respond(["error" => "El parque todavía tiene contenido ($n $label). Vacíalo antes de eliminarlo."], 409);
    }
    $stmt = $conn->prepare("DELETE FROM parks WHERE id = ?");
    $stmt->bind_param("i", $parkId);
    if (!$stmt->execute()) respond(["error" => "No se pudo eliminar el parque: " . $conn->error], 500);
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
