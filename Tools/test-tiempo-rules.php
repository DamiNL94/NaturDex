<?php
// ================================================================================================
// test-tiempo-rules.php — las dos trampas de AEMET que ya fallaron EN VERDE, fijadas.  (npm test)
// ------------------------------------------------------------------------------------------------
// Por qué existe: el 2026-09-10, con la primera clave real, Backend/Lib/tiempo_payload.php falló dos
// veces sin dar un solo error, y las dos se habrían pintado tal cual en la cabecera de un espacio:
//
//   1. «Águilas» guardado con la «Á» doblemente codificada. AEMET MEZCLA UTF-8 y Latin-9 en una
//      misma respuesta —el nombre del municipio en UTF-8, el pie legal en Latin-9— y la conversión
//      del cuerpo entero rompía la mitad que venía bien.
//   2. «Lluvia 0 %» con un 95 % previsto para la tarde. En el día de HOY, pasada la mañana, AEMET
//      deja a CERO el tramo 00-24 de la probabilidad —no lo vacía, como hace con el cielo— y era el
//      tramo que se cogía.
//
// Ninguna de las dos la puede cazar `npm run validate`: validate mira los park.json, y esto es dato
// en vivo que no se escribe en ningún sitio. Puro, sin red y sin BD, igual que las otras dos pruebas
// de `npm test`. Los tramos del caso 2 son los de la predicción real de Águilas elaborada el
// 2026-09-10 a las 13:23.
// ================================================================================================

require_once __DIR__ . "/../Backend/Lib/tiempo_payload.php";

$fallos = 0;
function comprueba($nombre, $obtenido, $esperado) {
    global $fallos;
    $ok = $obtenido === $esperado;
    if (!$ok) $fallos++;
    printf("%s %-56s obtenido=%s esperado=%s\n", $ok ? "OK  " : "FALLA", $nombre,
        json_encode($obtenido, JSON_UNESCAPED_UNICODE), json_encode($esperado, JSON_UNESCAPED_UNICODE));
}
$latin9 = fn($s) => mb_convert_encoding($s, "ISO-8859-15", "UTF-8");
$tramos = fn(array $v) => array_map(fn($p, $x) => ["value" => $x, "periodo" => $p], array_keys($v), $v);

// --- 1. Codificación -----------------------------------------------------------------------------
$mezcla = aemetDecode('{"nombre":"Águilas","productor":"Agencia Estatal de ' . $latin9("Meteorología") . '"}');
comprueba("mezcla: el nombre en UTF-8 sale intacto", $mezcla["nombre"], "Águilas");
comprueba("mezcla: el pie legal en Latin-9 se convierte", $mezcla["productor"], "Agencia Estatal de Meteorología");
comprueba("Latin-9 puro (el maestro, el control de un 429)",
    aemetDecode($latin9('{"n":"Fuente Álamo de Murcia"}'))["n"], "Fuente Álamo de Murcia");
comprueba("UTF-8 puro: no se toca", aemetDecode('{"n":"Fuente Álamo de Murcia"}')["n"], "Fuente Álamo de Murcia");
comprueba("Latin-9 con ñ, ¿, ©, y el € propio del -15", aemetDecode($latin9('{"n":"Ñ ñ ¿Á? © €"}'))["n"], "Ñ ñ ¿Á? © €");
comprueba("cuerpo vacío (así responde AEMET sin api_key)", aemetDecode(""), null);

// --- 2. Los tramos del día de hoy -------------------------------------------------------------------
$cielo = fn($p, $v, $t) => ["value" => $v, "periodo" => $p, "descripcion" => $t];
$nubes = "Intervalos nubosos con lluvia escasa";
$hoy = normalizaDia([
    "fecha" => "2026-09-10T00:00:00",
    "probPrecipitacion" => $tramos(["00-24" => 0, "00-12" => 0, "12-24" => 95, "00-06" => 0,
                                    "06-12" => 55, "12-18" => 90, "18-24" => 5]),
    "estadoCielo" => [$cielo("00-24", "", ""), $cielo("00-12", "", ""), $cielo("12-24", "43", $nubes),
                      $cielo("12-18", "43", $nubes), $cielo("18-24", "11", "Despejado")],
    "rachaMax" => $tramos(["00-24" => "", "12-18" => "45", "18-24" => "30"]),
    "temperatura" => ["maxima" => 29, "minima" => 21],
]);
comprueba("hoy: la lluvia NO es el 0 del tramo 00-24 ya pasado", $hoy["probPrecipitacion"], 95);
comprueba("hoy: y dice de qué tramo sale", $hoy["probPrecipitacionPeriodo"], "12-24");
comprueba("hoy: el cielo se salta el tramo en blanco", $hoy["cielo"]["texto"], $nubes);
comprueba("hoy: la racha es la máxima de sus tramos", $hoy["viento"]["rachaMaxKmh"], 45);

comprueba("empate: se queda el tramo más estrecho",
    normalizaDia(["probPrecipitacion" => $tramos(["00-24" => 40, "12-24" => 40, "12-18" => 40])])["probPrecipitacionPeriodo"], "12-18");
comprueba("un 0 que es el único valor sigue siendo 0",
    normalizaDia(["probPrecipitacion" => $tramos(["00-24" => 0])])["probPrecipitacion"], 0);
comprueba("sin ningún valor: null, no un 0 inventado",
    normalizaDia(["probPrecipitacion" => $tramos(["00-24" => ""])])["probPrecipitacion"], null);

// --- 3. Degradación --------------------------------------------------------------------------------
comprueba("sin AEMET_API_KEY ni caché: 503 honesto", buildTiempoPayload("99999", null)["codigo"], 503);

echo $fallos ? "\n$fallos comprobación(es) fallan.\n" : "\nTodas las comprobaciones pasan.\n";
exit($fallos ? 1 : 0);
