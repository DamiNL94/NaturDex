<?php
// ================================================================================================
// export-dwc.php — genera un Darwin Core Archive con los avistamientos de los usuarios (CLI).
// ------------------------------------------------------------------------------------------------
// El problema que resuelve: los datos ya están en Darwin Core dentro de la base (user_occurrences),
// pero un banco de biodiversidad no lee una tabla de MySQL: lee un DwC-A, que es un ZIP con tres
// piezas —el fichero de datos, un `meta.xml` que dice qué columna es qué término, y un `eml.xml` con
// los metadatos del conjunto—. Esto lo construye, y aplica las dos reglas que no se pueden delegar en
// quien reciba el fichero: el CONSENTIMIENTO del observador y la GENERALIZACIÓN de las coordenadas de
// los taxones amenazados.
//
// Uso:
//   php Tools/export-dwc.php                          conjunto completo (solo quien ha dado permiso)
//   php Tools/export-dwc.php --usuario 12             un solo usuario (por id o por correo)
//   php Tools/export-dwc.php --salida <ruta>          dónde escribir (por defecto Tools/catalogo-nacional/out/dwc)
//   php Tools/export-dwc.php --sin-consentimiento     ignora la preferencia. SOLO para la copia
//                                                     personal de un usuario que pide sus datos; el
//                                                     script se niega si no se acota con --usuario
//   php Tools/export-dwc.php --zip                    empaqueta además el .zip (necesita el binario `zip`)
//
// Lo que este script NO decide: qué es cada término (Backend/Lib/dwc.php) ni cómo se generaliza una
// coordenada (dwcGeneralizeCoordinates, también allí, para poder probarlo sin base de datos con
// `npm test`). Aquí solo hay consultas, ficheros y el informe.
//
// Después de generarlo: pásalo por el GBIF Data Validator (https://www.gbif.org/tools/data-validator)
// ANTES de darlo por bueno, y deja el resultado en Docs/DARWIN-CORE.md. Este script comprueba lo que
// se puede comprobar sin red (§verificación), que no es lo mismo que estar validado.
// ================================================================================================
require_once __DIR__ . "/../Backend/Config/db.php";
require_once __DIR__ . "/../Backend/Lib/dwc.php";

// --- Argumentos ---------------------------------------------------------------------------------
$argsv = $argv ?? [];
function opt($name, $def = null) {
    global $argsv;
    foreach ($argsv as $i => $tok) {
        if ($tok === "--" . $name) return $argsv[$i + 1] ?? $def;
        if (strpos($tok, "--" . $name . "=") === 0) return substr($tok, strlen($name) + 3);
    }
    return $def;
}
function has($name) { global $argsv; return in_array("--" . $name, $argsv, true); }

$usuario = opt("usuario");
$salida = opt("salida", __DIR__ . "/catalogo-nacional/out/dwc");
$sinConsentimiento = has("sin-consentimiento");
$hacerZip = has("zip");

if ($sinConsentimiento && !$usuario) {
    fwrite(STDERR, "✖ --sin-consentimiento solo vale acotado con --usuario: es la copia personal de\n"
        . "  alguien que pide sus datos, no una vía para publicar los de todos.\n");
    exit(2);
}

// --- A quién se exporta -------------------------------------------------------------------------
// El consentimiento se lee del ESPEJO DEL SERVIDOR (users.prefs), no de lo que diga un cliente: es
// una cesión de datos personales y no puede depender de lo que traiga una petición. Ausente = NO.
$filtro = "";
$params = [];
$tipos = "";
if ($usuario !== null) {
    if (ctype_digit((string) $usuario)) { $filtro = "u.id = ?"; $tipos = "i"; $params[] = (int) $usuario; }
    else { $filtro = "u.email = ?"; $tipos = "s"; $params[] = (string) $usuario; }
}
// Se compara el texto desenvuelto y no con CAST(... AS JSON): así la consulta vale igual en MySQL 8
// y en MariaDB, y una preferencia ausente da NULL, que no es igual a 'true' — es decir, NO.
$consentimiento = $sinConsentimiento
    ? "1"
    : "JSON_UNQUOTE(JSON_EXTRACT(u.prefs, '$.shareOccurrences')) = 'true'";

$sql = "SELECT o.*, u.id AS uid,
               s.rarity_local, s.rarity_score, s.spain_status
          FROM user_occurrences o
          JOIN users u ON u.id = o.user_id
     LEFT JOIN species s ON s.id = o.catalog_species_id
         WHERE " . $consentimiento
     . ($filtro ? " AND " . $filtro : "")
     . " ORDER BY o.event_date, o.occurrence_id";

$stmt = $conn->prepare($sql);
if ($params) $stmt->bind_param($tipos, ...$params);
$stmt->execute();
$filas = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

// --- Cuántos usuarios han dado permiso, para poder decirlo en el informe --------------------------
$totalUsuarios = (int) ($conn->query("SELECT COUNT(*) c FROM users")->fetch_assoc()["c"] ?? 0);
$conPermiso = (int) ($conn->query(
    "SELECT COUNT(*) c FROM users WHERE JSON_UNQUOTE(JSON_EXTRACT(prefs, '$.shareOccurrences')) = 'true'"
)->fetch_assoc()["c"] ?? 0);
$totalOcurrencias = (int) ($conn->query("SELECT COUNT(*) c FROM user_occurrences")->fetch_assoc()["c"] ?? 0);

if (!$filas) {
    echo "No hay ninguna ocurrencia que exportar" . ($sinConsentimiento ? "" : " con consentimiento") . ".\n";
    echo "  Ocurrencias en la base: $totalOcurrencias · usuarios que han dado permiso: $conPermiso de $totalUsuarios.\n";
    exit(0);
}

// --- Construcción de las filas publicables --------------------------------------------------------
// El tramo de rareza legal decide si la coordenada se generaliza. Se toma el LOCAL si existe (es el
// que mezcla el catálogo estatal y el autonómico, y por tanto el más grave de los dos) y si no, el
// estatal. Ninguno de los dos se recalcula aquí: son la salida de Tools/lib/rareza.js, que es la única
// escalera del repositorio.
$claves = dwcRecordKeys();
$registros = [];
$generalizadas = 0;
$sinTramo = 0;
$sinCoordenada = 0;
$sinIncertidumbre = 0;
$verificadas = 0;
$porTaxon = [];

foreach ($filas as $f) {
    $esInvasora = ($f["occurrence_kind"] ?? "") === "invasora";
    $tramo = null;
    if (!$esInvasora) {
        if ($f["rarity_local"] !== null) $tramo = (int) $f["rarity_local"];
        elseif ($f["rarity_score"] !== null) $tramo = (int) $f["rarity_score"];
    }
    if (!$esInvasora && $tramo === null) $sinTramo++;

    $geo = dwcGeneralizeCoordinates(
        $f["decimal_latitude"], $f["decimal_longitude"],
        $f["coordinate_uncertainty_in_meters"], $tramo, $esInvasora
    );
    if ($geo["dataGeneralizations"] !== null) $generalizadas++;
    if ($f["decimal_latitude"] === null) $sinCoordenada++;
    elseif ($f["coordinate_uncertainty_in_meters"] === null) $sinIncertidumbre++;
    // "Presencia verificada" se cuenta por el eventID —que apunta a la visita— y no comparando el
    // texto del estado: el dato estructural no se puede desajustar por una tilde ni por una redacción.
    if ($f["event_id"] !== null) $verificadas++;
    $porTaxon[$f["scientific_name"]] = ($porTaxon[$f["scientific_name"]] ?? 0) + 1;

    $r = [];
    foreach ($claves as $k) $r[$k] = $f[$k] ?? null;
    $r["occurrence_id"] = dwcOccurrenceUrn($f["occurrence_id"]);
    $r["event_id"] = dwcEventUrn($f["event_id"]);
    $r["event_date"] = dwcIsoDate($f["event_date"]);
    $r["event_time"] = dwcIsoTime($f["event_date"]);
    $r["date_identified"] = dwcIsoDate($f["date_identified"]);
    $r["modified"] = dwcIsoDate($f["modified"]);
    // El rango se deduce del propio nombre cuando la fila no lo trae: la regla vive en dwc.php y no
    // se duplica ni en el SQL de la migración ni aquí.
    if (!$r["taxon_rank"]) $r["taxon_rank"] = dwcTaxonRank($f["scientific_name"]);
    $r["decimal_latitude"] = $geo["lat"] === null ? null : number_format($geo["lat"], 6, ".", "");
    $r["decimal_longitude"] = $geo["lng"] === null ? null : number_format($geo["lng"], 6, ".", "");
    $r["coordinate_uncertainty_in_meters"] = $geo["uncertainty"];
    $r["data_generalizations"] = $geo["dataGeneralizations"];
    $r["information_withheld"] = $geo["informationWithheld"];
    $registros[] = $r;
}

// --- Escritura del archivo ------------------------------------------------------------------------
if (!is_dir($salida) && !mkdir($salida, 0775, true)) {
    fwrite(STDERR, "✖ No se pudo crear el directorio de salida: $salida\n");
    exit(1);
}

// occurrence.txt — TSV en UTF-8 SIN BOM y con salto \n: es lo que declara el meta.xml de abajo.
$lineas = [];
$lineas[] = implode("\t", array_map(function ($t) { return $t[1]; }, dwcTerms()));
foreach ($registros as $r) {
    $lineas[] = implode("\t", array_map(function ($k) use ($r) { return dwcTsvValue($r[$k]); }, $claves));
}
file_put_contents($salida . "/occurrence.txt", implode("\n", $lineas) . "\n");

// meta.xml — el mapeo de cada columna a la URI de su término. Sin esto, el fichero de datos es un TSV
// cualquiera: es este descriptor lo que lo convierte en Darwin Core.
$meta = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
    . "<archive xmlns=\"http://rs.tdwg.org/dwc/text/\" metadata=\"eml.xml\">\n"
    . "  <core encoding=\"UTF-8\" fieldsTerminatedBy=\"\\t\" linesTerminatedBy=\"\\n\" fieldsEnclosedBy=\"\""
    . " ignoreHeaderLines=\"1\" rowType=\"http://rs.tdwg.org/dwc/terms/Occurrence\">\n"
    . "    <files><location>occurrence.txt</location></files>\n"
    . "    <id index=\"0\" />\n";
foreach (dwcTerms() as $i => $t) {
    // El índice 0 es el occurrenceID y se declara además como <id>, que es lo que el DwC-A usa como
    // clave del registro.
    $meta .= "    <field index=\"" . $i . "\" term=\"" . htmlspecialchars($t[2], ENT_XML1) . "\" />\n";
}
$meta .= "  </core>\n</archive>\n";
file_put_contents($salida . "/meta.xml", $meta);

// eml.xml — metadatos del conjunto (perfil EML de GBIF). Dice de quién es, con qué licencia y —esto
// es lo importante— QUÉ ES: observación ciudadana sin validar, no un inventario oficial.
$hoy = gmdate("Y-m-d");
$ambito = $usuario !== null ? "Avistamientos de un único observador." : "Avistamientos de todos los observadores que han dado su consentimiento.";
$eml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
    . "<eml:eml xmlns:eml=\"eml://ecoinformatics.org/eml-2.1.1\" xmlns:dc=\"http://purl.org/dc/terms/\"\n"
    . "         packageId=\"" . htmlspecialchars(DWC_DATASET_ID, ENT_XML1) . "/" . $hoy . "\" system=\"NaturDex\" scope=\"system\" xml:lang=\"spa\">\n"
    . "  <dataset>\n"
    . "    <alternateIdentifier>" . htmlspecialchars(DWC_DATASET_ID, ENT_XML1) . "</alternateIdentifier>\n"
    . "    <title xml:lang=\"spa\">" . htmlspecialchars(DWC_DATASET_NAME, ENT_XML1) . "</title>\n"
    . "    <creator><organizationName>NaturDex</organizationName></creator>\n"
    . "    <metadataProvider><organizationName>NaturDex</organizationName></metadataProvider>\n"
    . "    <pubDate>" . $hoy . "</pubDate>\n"
    . "    <language>spa</language>\n"
    . "    <abstract>\n"
    . "      <para>Observaciones de especies registradas por usuarios de la aplicación NaturDex en espacios"
    . " naturales protegidos de España. " . $ambito . "</para>\n"
    . "      <para>AVISO IMPORTANTE SOBRE LA NATURALEZA DEL DATO: cada registro es una observación ciudadana"
    . " SIN validar por un experto. El campo identificationVerificationStatus indica, además, si consta que"
    . " la persona estaba dentro del límite oficial del espacio en ese momento (presencia verificada por GPS"
    . " contra la delimitación oficial). Ni una cosa ni la otra convierten el registro en dato oficial.</para>\n"
    . "      <para>Las coordenadas de los taxones con categoría de amenaza se publican generalizadas"
    . " (redondeadas a 1 o 10 km según la categoría), y así queda dicho en dataGeneralizations e"
    . " informationWithheld de cada registro afectado.</para>\n"
    . "    </abstract>\n"
    . "    <intellectualRights><para>Este conjunto se publica bajo licencia Creative Commons Reconocimiento"
    . " (CC BY) 4.0 · " . htmlspecialchars(DWC_LICENSE, ENT_XML1) . "</para></intellectualRights>\n"
    . "    <coverage><geographicCoverage>\n"
    . "      <geographicDescription>España</geographicDescription>\n"
    . "      <boundingCoordinates>\n"
    . "        <westBoundingCoordinate>-18.2</westBoundingCoordinate>\n"
    . "        <eastBoundingCoordinate>4.4</eastBoundingCoordinate>\n"
    . "        <northBoundingCoordinate>43.9</northBoundingCoordinate>\n"
    . "        <southBoundingCoordinate>27.6</southBoundingCoordinate>\n"
    . "      </boundingCoordinates>\n"
    . "    </geographicCoverage></coverage>\n"
    . "    <methods><methodStep><description><para>" . htmlspecialchars(DWC_SAMPLING_PROTOCOL, ENT_XML1)
    . "</para></description></methodStep></methods>\n"
    . "  </dataset>\n"
    . "</eml:eml>\n";
file_put_contents($salida . "/eml.xml", $eml);

// --- Verificación local ---------------------------------------------------------------------------
// Lo que se puede comprobar sin red. NO sustituye al GBIF Data Validator: comprueba que el archivo es
// coherente consigo mismo, no que GBIF lo acepte.
$errores = [];
$vistos = [];
foreach ($registros as $n => $r) {
    $id = $r["occurrence_id"];
    if (isset($vistos[$id])) $errores[] = "occurrenceID repetido: $id";
    $vistos[$id] = true;
    if (!$r["scientific_name"]) $errores[] = "fila " . ($n + 1) . ": sin scientificName";
    if (!$r["event_date"]) $errores[] = "fila " . ($n + 1) . ": sin eventDate";
    if ($r["decimal_latitude"] !== null) {
        $la = (float) $r["decimal_latitude"];
        $lo = (float) $r["decimal_longitude"];
        if ($la < -90 || $la > 90 || $lo < -180 || $lo > 180) $errores[] = "fila " . ($n + 1) . ": coordenada fuera de rango";
    }
}
foreach ($lineas as $n => $l) {
    if (substr_count($l, "\t") !== count($claves) - 1) $errores[] = "línea " . ($n + 1) . ": número de columnas distinto del de la cabecera";
}

// --- Informe --------------------------------------------------------------------------------------
$conCoordenada = count($registros) - $sinCoordenada;
echo "Darwin Core Archive generado en " . $salida . "\n";
echo "  occurrence.txt   " . count($registros) . " ocurrencias · " . count($claves) . " términos\n";
echo "  meta.xml         mapeo a las URIs de rs.tdwg.org\n";
echo "  eml.xml          metadatos del conjunto\n\n";
echo "  Taxones distintos ................ " . count($porTaxon) . "\n";
echo "  Con coordenada ................... $conCoordenada de " . count($registros) . "\n";
echo "  Con incertidumbre del GPS ........ " . ($conCoordenada - $sinIncertidumbre) . " de $conCoordenada\n";
echo "  Presencia verificada ............. $verificadas de " . count($registros) . "\n";
echo "  Coordenada generalizada .......... $generalizadas (de ellas, $sinTramo por no constar el tramo de rareza)\n";
if (!$sinConsentimiento) {
    echo "  Consentimiento ................... $conPermiso de $totalUsuarios usuarios; "
        . (count($registros)) . " de $totalOcurrencias ocurrencias exportables\n";
} else {
    echo "  Consentimiento ................... IGNORADO (--sin-consentimiento, copia personal)\n";
}

if ($errores) {
    echo "\n✖ " . count($errores) . " problema(s) de coherencia:\n";
    foreach (array_slice($errores, 0, 20) as $e) echo "    · $e\n";
} else {
    echo "\n✓ Coherencia interna correcta. FALTA pasarlo por el GBIF Data Validator:\n";
    echo "    https://www.gbif.org/tools/data-validator\n";
}

if ($hacerZip) {
    $zip = $salida . "/dwc-archive-" . $hoy . ".zip";
    @unlink($zip);
    exec("cd " . escapeshellarg($salida) . " && zip -q -j " . escapeshellarg($zip)
        . " occurrence.txt meta.xml eml.xml", $out, $code);
    echo $code === 0 ? "\n  Empaquetado: $zip\n" : "\n  ✖ No se pudo empaquetar (¿falta el binario `zip`?).\n";
}

exit($errores ? 1 : 0);
