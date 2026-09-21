<?php
// ================================================================================================
// species_tips.php — cómo se guardan en la base las pistas de identificación de una especie.
// ------------------------------------------------------------------------------------------------
// El problema: `tips` es una LISTA de frases y `species.identification_tips` es una sola columna de
// texto. Hasta el 2026-09-11 la lista se guardaba unida con «; » (build-park-sql.js) o con saltos de
// línea (el species-universal.sql de sync-species-catalog.js), y se leía partiendo por «;»
// (park_payload.php). Una pista con un punto y coma propio —«Alas largas y estrechas; vuelo veloz y
// alto», del murciélago de cueva— volvía partida en dos viñetas: 24 fichas de 5 taxones en 13
// espacios, sin error ni aviso, porque la comprobación de ida y vuelta miraba que la CLAVE volviera y
// no el valor. Lo escrito con saltos de línea volvía peor: las tres pistas en una sola viñeta.
//
// El formato: un array JSON de cadenas —`["…","…"]`— en la MISMA columna TEXT. JSON escapa lo que haga
// falta, así que no queda separador que pueda aparecer dentro de una pista. La columna NO pasa a tipo
// JSON, y no por descuido: `Database/seed.sql` —que el contenedor carga en la primera instalación sin
// pasar por migrations.sql, y que `db-sync push` reaplica sobre la base viva— trae las pistas en el
// formato viejo. Con una columna JSON, o con un CHECK, una instalación limpia dejaría de arrancar.
//
// Por eso la LECTURA acepta los dos: lo que es un array JSON de cadenas se devuelve tal cual; lo demás
// es una fila vieja que migrations.sql aún no ha convertido, y se parte por «;» y por salto de línea,
// que es la misma regla con la que la migración la convierte (`naturdex_tips_a_json`). La ESCRITURA
// solo produce el formato nuevo. El lado Node es `columnaTips()` de Tools/lib/sql.js, y
// `npm run ida-y-vuelta` comprueba —valor a valor, ejecutando este código— que siguen siendo inversos.
// ================================================================================================

/** Lo que guarda la columna → la lista de pistas que sirve la API. */
function speciesTipsDecode($raw) {
    if ($raw === null || trim((string) $raw) === "") return [];
    $raw = (string) $raw;
    if (ltrim($raw)[0] === "[") {
        $lista = json_decode($raw, true);
        if (is_array($lista) && array_values($lista) === $lista
            && count(array_filter($lista, "is_string")) === count($lista)) {
            return $lista;
        }
    }
    // Formato viejo. `array_filter` sin callback tiraría también una pista que fuera «0».
    $piezas = array_map("trim", preg_split('/[;\n]/', str_replace("\r", "", $raw)));
    return array_values(array_filter($piezas, fn($t) => $t !== ""));
}

/** La lista de pistas → lo que se guarda. Sin pistas, NULL: «sin dato», como el resto de textos libres. */
function speciesTipsEncode(array $tips) {
    $lista = array_values(array_map("strval", $tips));
    return $lista ? json_encode($lista, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : null;
}

/*
 * El panel de administración edita las pistas en un textarea, UNA POR LÍNEA. Antes pedía separarlas
 * con «;», que es justo el carácter que no se puede reservar: va dentro de las pistas. Ninguna pista
 * del catálogo lleva salto de línea (medido el 2026-09-11), y en un textarea es el separador natural.
 */
function speciesTipsFromLines($texto) {
    $piezas = array_map("trim", preg_split('/\R/u', (string) $texto));
    return array_values(array_filter($piezas, fn($t) => $t !== ""));
}

function speciesTipsToLines(array $tips) {
    return implode("\n", $tips);
}
