<?php
// ================================================================================================
// test-dwc-rules.php — prueba de las reglas Darwin Core (CLI, sin base de datos).
// ------------------------------------------------------------------------------------------------
// Uso:  php Tools/test-dwc-rules.php
//
// De estas reglas depende que publicar los avistamientos no haga daño: la que decide qué coordenada
// se generaliza protege a las especies amenazadas del expolio, y la que etiqueta la calidad impide
// que una observación ciudadana se lea como dato validado. Las dos son puras y se pueden comprobar
// aquí, sin levantar MySQL ni salir al monte, que es exactamente el motivo por el que las reglas
// viven en Backend/Lib/dwc.php y no dentro de una consulta.
//
// Salida: una línea por comprobación y código de salida 1 si alguna falla.
// ================================================================================================
require_once __DIR__ . "/../Backend/Lib/dwc.php";

$fail = 0;
function check($label, $got, $expected) {
    global $fail;
    $ok = $got === $expected;
    if (!$ok) $fail++;
    printf("%s %-54s obtenido=%s esperado=%s\n", $ok ? "OK  " : "FALLO", $label,
        json_encode($got, JSON_UNESCAPED_UNICODE), json_encode($expected, JSON_UNESCAPED_UNICODE));
}

// --- Generalización: a cuántos metros según el tramo de rareza legal -------------------------------
check("tramo 5 (en peligro) se generaliza a 10 km", dwcGeneralizationMeters(5), 10000);
check("tramo 4 (vulnerable) se generaliza a 1 km", dwcGeneralizationMeters(4), 1000);
check("tramo 3 (interés especial) no se generaliza", dwcGeneralizationMeters(3), 0);
check("tramo 1 (sin figura) no se generaliza", dwcGeneralizationMeters(1), 0);
// «Nadie lo ha mirado» no es «no está amenazada»: publicar la coordenada exacta de algo que podía
// estarlo no se puede deshacer, así que sin tramo se generaliza por precaución.
check("sin tramo se generaliza por precaución", dwcGeneralizationMeters(null), 1000);

// --- Generalización: qué sale publicado -------------------------------------------------------------
$exacta = dwcGeneralizeCoordinates(37.612345, -1.498765, 8, 2);
check("una especie sin amenaza conserva su coordenada", $exacta["lat"], 37.612345);
check("...y su incertidumbre del GPS", $exacta["uncertainty"], 8);
check("...y no declara generalización", $exacta["dataGeneralizations"], null);

$peligro = dwcGeneralizeCoordinates(37.612345, -1.498765, 8, 5);
check("una especie en peligro sale redondeada a 0,1°", [$peligro["lat"], $peligro["lng"]], [37.6, -1.5]);
check("...con la incertidumbre subida a 10 km", $peligro["uncertainty"], 10000);
check("...y lo dice en dataGeneralizations", is_string($peligro["dataGeneralizations"]), true);
check("...y en informationWithheld", is_string($peligro["informationWithheld"]), true);

$vulnerable = dwcGeneralizeCoordinates(37.612345, -1.498765, 8, 4);
check("una vulnerable sale redondeada a 0,01°", [$vulnerable["lat"], $vulnerable["lng"]], [37.61, -1.5]);
check("...con la incertidumbre subida a 1 km", $vulnerable["uncertainty"], 1000);

// Una incertidumbre peor que la celda manda: generalizar no puede MEJORAR la precisión declarada.
$gpsMalo = dwcGeneralizeCoordinates(37.612345, -1.498765, 25000, 5);
check("una incertidumbre peor que la celda se conserva", $gpsMalo["uncertainty"], 25000);

// Una exótica invasora NUNCA se generaliza: no hay ejemplar que proteger y su localización precisa
// es justo lo que necesita quien tiene que gestionarla.
$invasora = dwcGeneralizeCoordinates(37.612345, -1.498765, 8, null, true);
check("una invasora conserva la coordenada exacta", $invasora["lat"], 37.612345);
check("...y no declara generalización", $invasora["dataGeneralizations"], null);

// Sin coordenada no hay nada que generalizar (y no se debe inventar una).
$sinCoord = dwcGeneralizeCoordinates(null, null, null, 5);
check("sin coordenada no se genera ninguna", [$sinCoord["lat"], $sinCoord["dataGeneralizations"]], [null, null]);

// --- Calidad: lo que se le dice a quien reciba el dato ----------------------------------------------
// Las dos etiquetas tienen que decir SIEMPRE que nadie ha validado la identificación. Si alguna vez
// alguien acorta el texto y se pierde esa parte, el registro pasaría a leerse como dato validado.
check("la etiqueta de presencia verificada avisa de que no está validada",
    strpos(dwcVerificationStatus(true), "sin validar por experto") !== false, true);
check("la de presencia no verificada, también",
    strpos(dwcVerificationStatus(false), "sin validar por experto") !== false, true);
check("y las dos se distinguen", dwcVerificationStatus(true) === dwcVerificationStatus(false), false);

// --- Taxonomía: el «reino» de la app no es un reino ---------------------------------------------------
check("flora es Plantae", dwcKingdom("flora"), "Plantae");
check("fauna es Animalia", dwcKingdom("fauna"), "Animalia");
check("fungi es Fungi", dwcKingdom("fungi"), "Fungi");
check("'other' no se traduce a ningún reino", dwcKingdom("other"), null);

check("un binomio es rango de especie", dwcTaxonRank("Testudo graeca"), "species");
check("una subespecie lo declara ella", dwcTaxonRank("Testudo graeca subsp. graeca"), "subspecies");
check("una variedad, también", dwcTaxonRank("Thymus vulgaris var. palearensis"), "variety");
check("un nombre suelto no dice su rango", dwcTaxonRank("Quercus"), null);
check("un nombre ambiguo se queda sin rango", dwcTaxonRank("Sideritis leucantha incana"), null);
check("una cadena vacía no inventa nada", dwcTaxonRank("  "), null);

// --- Identificadores --------------------------------------------------------------------------------
$uuid = dwcUuidV4();
check("el UUID tiene el formato de la RFC 4122",
    (bool) preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/', $uuid), true);
check("dos UUID seguidos no coinciden", dwcUuidV4() === dwcUuidV4(), false);
check("se publica como URN", dwcOccurrenceUrn("abc"), "urn:uuid:abc");
check("la visita se publica como URN", dwcEventUrn(7), "urn:naturdex:visita:7");
check("sin visita no hay eventID", dwcEventUrn(null), null);
check("el observador es un identificador opaco", dwcRecordedByUrn(12), "urn:naturdex:observador:12");

// --- Fechas: sin huso, una fecha de ocurrencia no vale ------------------------------------------------
check("la fecha sale en ISO 8601 con huso", dwcIsoDate("2026-05-10 09:12:30"), "2026-05-10T09:12:30+00:00");
check("la hora suelta sale en UTC", dwcIsoTime("2026-05-10 09:12:30"), "09:12:30Z");
check("una fecha vacía no inventa un instante", dwcIsoDate(null), "");

// --- TSV: un salto de línea dentro de un campo parte el fichero ---------------------------------------
check("los tabuladores del texto se neutralizan", dwcTsvValue("a\tb"), "a b");
check("los saltos de línea también", dwcTsvValue("linea1\nlinea2"), "linea1 linea2");
check("null es campo vacío, no la palabra 'null'", dwcTsvValue(null), "");

// --- El diccionario de términos ------------------------------------------------------------------------
$terms = dwcTerms();
$keys = dwcRecordKeys();
check("hay tantas claves como términos", count($keys), count($terms));
check("ninguna clave se repite", count(array_unique($keys)), count($keys));
$nombres = array_map(function ($t) { return $t[1]; }, $terms);
check("ningún término se repite", count(array_unique($nombres)), count($nombres));
$urisMal = array_filter($terms, function ($t) {
    return strpos($t[2], "http://rs.tdwg.org/dwc/terms/") !== 0 && strpos($t[2], "http://purl.org/dc/terms/") !== 0;
});
check("todas las URIs son de Darwin Core o de Dublin Core", count($urisMal), 0);
// El primer campo es el identificador del registro: el meta.xml lo declara como <id index="0"/>.
check("el primer término es occurrenceID", $terms[0][1], "occurrenceID");

echo $fail === 0 ? "\nTodas las comprobaciones pasan.\n" : "\n$fail comprobación(es) fallida(s).\n";
exit($fail === 0 ? 0 : 1);
