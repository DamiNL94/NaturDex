<?php
// ================================================================================================
// export-park.php — regenera el park.json empaquetado (offline) desde la base de datos (CLI).
// ------------------------------------------------------------------------------------------------
// La lógica real vive en Backend/Lib/park_export.php (compartida con el botón "Publicar cambios
// offline" del panel de administración). Este script solo recorre el registro y la invoca.
//
// Recorre los espacios con datos en disco: los "available" (catálogo completo) y los "basic"
// (ficha base). Los "planned" no tienen carpeta, así que se saltan.
//
// Uso:  php Tools/export-park.php            (todos los espacios con datos)
//       php Tools/export-park.php <slug>     (solo ese espacio)
// ================================================================================================
require_once __DIR__ . "/../Backend/Config/db.php";
require_once __DIR__ . "/../Backend/Lib/park_export.php";

$FRONTEND = __DIR__ . "/../Frontend";
$onlySlug = $argv[1] ?? null;

$registry = json_decode(file_get_contents($FRONTEND . "/Data/parks-index.json"), true);
if (!$registry) { fwrite(STDERR, "No se pudo leer parks-index.json\n"); exit(2); }

$exported = 0;
foreach (($registry["communities"] ?? []) as $c) {
    foreach (($c["provinces"] ?? []) as $p) {
        foreach (($p["parks"] ?? []) as $park) {
            if (!in_array($park["status"] ?? "", ["available", "basic"], true)) continue;
            if ($onlySlug && $park["slug"] !== $onlySlug) continue;
            $res = exportParkToJson($conn, $FRONTEND, $park["slug"]);
            if (!$res["ok"]) { fwrite(STDERR, "  ✗ " . $park["slug"] . ": " . $res["error"] . "\n"); continue; }
            $nivel = $res["status"] === "basic" ? " [ficha base]" : "";
            echo "  ✓ " . $park["slug"] . $nivel . ": " . $res["counts"]["habitats"] . " hábitats, "
                . $res["counts"]["species"] . " especies, " . $res["counts"]["pointsOfInterest"] . " POIs -> "
                . $res["dataPath"] . "\n";
            if (!empty($res["statusSynced"])) echo "    · status actualizado a '" . $res["status"] . "' en parks-index.json\n";
            $exported++;
        }
    }
}

echo "Exportados " . $exported . " parque(s) desde la base de datos.\n";
