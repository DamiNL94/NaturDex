<?php
// ================================================================================================
// glossary_payload.php — única definición de la forma del JSON del glosario divulgativo.
// ------------------------------------------------------------------------------------------------
// La usan TANTO el endpoint Backend/Api/glossary.php (respuesta en tiempo real) COMO el exportador
// Tools/export-glossary.php (que regenera Frontend/Data/glosario.json para uso offline). El glosario
// es NACIONAL (no depende del parque): un único listado de términos científicos con su definición en
// lenguaje llano. La BD (tabla `glosario`) es la fuente de verdad; el frontend lo consume resaltando
// los términos en las descripciones.
// ================================================================================================

/**
 * Construye el listado completo del glosario a partir de la base de datos.
 * @param mysqli $conn  Conexión abierta.
 * @return array        Array de términos: { term, definition, category, aliases[], source }.
 */
function buildGlossaryPayload($conn) {
    $out = [];
    $res = $conn->query("SELECT term, definition, category, aliases, source FROM glosario ORDER BY term");
    if (!$res) return $out;
    while ($row = $res->fetch_assoc()) {
        $out[] = [
            "term" => $row["term"],
            "definition" => $row["definition"],
            "category" => $row["category"],
            // `aliases` es JSON en la BD; se decodifica a array (o [] si no hay variantes).
            "aliases" => $row["aliases"] !== null ? json_decode($row["aliases"], true) : [],
            "source" => $row["source"],
        ];
    }
    return $out;
}
