<?php
// ================================================================================================
// test-presence-rules.php — prueba de las reglas de verificación de presencia (CLI, sin BD).
// ------------------------------------------------------------------------------------------------
// Uso:  php Tools/test-presence-rules.php
//
// De estas reglas depende que un logro signifique algo, así que conviene poder comprobarlas sin
// levantar la base de datos ni salir al monte. Cubre las partes puras: el filtro de marcas de
// tiempo (lo que puede aportar la cola offline), el cupo de ritmo humano, el reparto de marcas entre
// verificadas y no verificadas, y la geometría del límite oficial de un parque real.
//
// Salida: una línea por comprobación y código de salida 1 si alguna falla.
// ================================================================================================
require_once __DIR__ . "/../Backend/Lib/presence.php";
require_once __DIR__ . "/../Backend/Lib/account_progress.php";

$fail = 0;
function check($label, $got, $expected) {
    global $fail;
    $ok = $got === $expected;
    if (!$ok) $fail++;
    printf("%s %-52s obtenido=%s esperado=%s\n", $ok ? "OK  " : "FALLO", $label,
        json_encode($got, JSON_UNESCAPED_UNICODE), json_encode($expected, JSON_UNESCAPED_UNICODE));
}

// --- Marcas de tiempo: qué puede aportar el cliente y qué no --------------------------------------
$now = time();
check("un fix sin fecha usa la del servidor", presenceResolveTimestamp(null) !== null, true);
check("una fecha del futuro se rechaza", presenceResolveTimestamp(gmdate("c", $now + 3600)), null);
check("el margen de reloj adelantado se acepta", presenceResolveTimestamp(gmdate("c", $now + 60)) !== null, true);
check("la cola offline de hace 3 días se acepta", presenceResolveTimestamp(gmdate("c", $now - 3 * 86400)) !== null, true);
check("una fecha de hace 8 días se rechaza", presenceResolveTimestamp(gmdate("c", $now - 8 * 86400)), null);
check("una fecha inválida se rechaza", presenceResolveTimestamp("no soy una fecha"), null);

// --- Cupo de ritmo humano ----------------------------------------------------------------------------
check("visita de 2 min → suelo de 10 marcas", presenceMarkAllowance(120), 10);
check("visita de 5 min → 15 marcas", presenceMarkAllowance(300), 15);
check("visita de 10 min → 30 marcas", presenceMarkAllowance(600), 30);
check("visita de 1 h → 180 marcas", presenceMarkAllowance(3600), 180);

// --- Reparto de marcas: solo cuenta lo marcado durante la visita ---------------------------------------
$t = strtotime("2026-05-10 09:00:00 UTC");
$windows = [["id" => 1, "park" => "cuatro-calas", "from" => $t, "to" => $t + 3600, "seconds" => 3600]];
$marked = [
    "species:1" => gmdate("c", $t + 60),      // durante la visita
    "species:2" => gmdate("c", $t + 120),     // durante la visita
    "poi:mirador" => gmdate("c", $t + 200),   // durante la visita
    "species:3" => gmdate("c", $t - 7200),    // dos horas antes de llegar
    "species:4" => gmdate("c", $t + 99999),   // días después, desde casa
];
$part = partitionVerifiedMarks($windows, $marked);
sort($part["species"]);
check("especies marcadas durante la visita", $part["species"], [1, 2]);
check("POIs marcados durante la visita", $part["pois"], ["mirador"]);
check("sin ninguna visita verificada no cuenta nada", partitionVerifiedMarks([], $marked), ["species" => [], "pois" => []]);

// 40 marcas en una visita de 5 minutos: nadie identifica eso, se recorta al cupo y se conservan las
// primeras (lo que viste al llegar sigue valiendo; lo que se disparó después, no).
$short = [["id" => 2, "park" => "x", "from" => $t, "to" => $t + 300, "seconds" => 300]];
$spam = [];
for ($i = 1; $i <= 40; $i++) $spam["species:" . $i] = gmdate("c", $t + $i);
$part2 = partitionVerifiedMarks($short, $spam);
check("el cupo recorta un atracón de marcas", count($part2["species"]), 15);
sort($part2["species"]);
check("y conserva las primeras que se marcaron", $part2["species"], range(1, 15));

// Bordes de la ventana de gracia.
$edge = [["id" => 3, "park" => "x", "from" => $t, "to" => $t + 600, "seconds" => 600]];
check("marca justo dentro de la ventana", count(partitionVerifiedMarks($edge, ["species:9" => gmdate("c", $t + 599)])["species"]), 1);
check("marca un segundo después de la ventana", count(partitionVerifiedMarks($edge, ["species:9" => gmdate("c", $t + 601)])["species"]), 0);

// --- Geometría del límite oficial (parque real del repositorio) ---------------------------------------
$boundary = naturdexParkBoundary("cuatro-calas");
check("se carga el límite oficial de Cuatro Calas", $boundary !== null, true);
if ($boundary) {
    $vertex = $boundary["polygons"][0][0][0]; // [lng, lat] del contorno
    check("un vértice del contorno está a 0 m", (int) round(naturdexBoundaryDistanceMeters($boundary, $vertex[1], $vertex[0])), 0);
    // 30 m al norte de ese vértice concreto caen fuera del recinto; si algún día se redibuja el
    // límite y pasan a caer dentro, esta comprobación fallará y habrá que elegir otro punto.
    $north30 = $vertex[1] + 30 / 110540;
    check("30 m fuera del contorno mide ~30 m",
        abs(naturdexBoundaryDistanceMeters($boundary, $north30, $vertex[0]) - 30) < 1.5, true);
    check("el salón de tu casa (Madrid) queda lejísimos", naturdexBoundaryDistanceMeters($boundary, 40.4168, -3.7038) > 100000, true);
    check("Madrid no está dentro del parque", naturdexBoundaryContains($boundary, 40.4168, -3.7038), false);
}

echo $fail === 0 ? "\nTodas las comprobaciones pasan.\n" : "\n$fail comprobación(es) fallida(s).\n";
exit($fail === 0 ? 0 : 1);
