<?php
// ================================================================================================
// test-tips-rules.php — las pistas de identificación, ida y vuelta por su columna.  (npm test)
// ------------------------------------------------------------------------------------------------
// Por qué existe: el 2026-09-11 se midió que una pista con un «;» propio —«Alas largas y estrechas;
// vuelo veloz y alto», del murciélago de cueva— volvía de la API partida en dos viñetas: 24 fichas de
// 5 taxones en 13 espacios, con la comprobación de ida y vuelta en verde porque solo miraba claves.
// `npm run ida-y-vuelta` lo caza ahora sobre el catálogo entero; esto fija las reglas del formato en
// sí, puras, sin BD y sin park.json: el array JSON vuelve igual, el formato viejo (seed.sql, filas sin
// migrar) se sigue leyendo con la misma regla que usa la migración, y el panel —una pista por línea—
// no parte por «;».
// ================================================================================================

require_once __DIR__ . "/../Backend/Lib/species_tips.php";

$fallos = 0;
function comprueba($nombre, $obtenido, $esperado) {
    global $fallos;
    $ok = $obtenido === $esperado;
    if (!$ok) $fallos++;
    printf("%s %-58s obtenido=%s esperado=%s\n", $ok ? "OK  " : "FALLA", $nombre,
        json_encode($obtenido, JSON_UNESCAPED_UNICODE), json_encode($esperado, JSON_UNESCAPED_UNICODE));
}

$murcielago = [
    "Frente muy abombada y pelo corto y de punta",
    "Alas largas y estrechas; vuelo veloz y alto",
    "Forma colonias enormes y muy apretadas en cueva",
];

// --- 1. El formato nuevo es el inverso exacto ------------------------------------------------------
comprueba("array JSON: la pista con «;» vuelve entera", speciesTipsDecode(speciesTipsEncode($murcielago)), $murcielago);
comprueba("comillas, barras y tildes sobreviven", speciesTipsDecode(speciesTipsEncode(['Dice "¡ojo!" a/b \\ c'])), ['Dice "¡ojo!" a/b \\ c']);
comprueba("escribe lo mismo que columnaTips() de Node", speciesTipsEncode(["Á/b; c"]), '["Á/b; c"]');
comprueba("sin pistas se guarda NULL", speciesTipsEncode([]), null);
comprueba("NULL se lee como lista vacía", speciesTipsDecode(null), []);
comprueba("cadena en blanco, lista vacía", speciesTipsDecode("  "), []);

// --- 2. El formato viejo se sigue leyendo, con la regla de la migración ------------------------------
comprueba("viejo con «; » (build-park-sql.js)", speciesTipsDecode("Uno; Dos; Tres"), ["Uno", "Dos", "Tres"]);
comprueba("viejo con saltos de línea (species-universal.sql)", speciesTipsDecode("Uno\nDos\r\nTres"), ["Uno", "Dos", "Tres"]);
comprueba("viejo: las piezas vacías se tiran", speciesTipsDecode("Uno;; ;Dos;"), ["Uno", "Dos"]);
comprueba("viejo: una pista «0» no se pierde", speciesTipsDecode("0; Dos"), ["0", "Dos"]);
comprueba("viejo que empieza por «[» sin ser JSON", speciesTipsDecode("[sic] Uno; Dos"), ["[sic] Uno", "Dos"]);

// --- 3. El panel: una pista por línea ---------------------------------------------------------------
comprueba("panel: el «;» NO separa", speciesTipsFromLines("Alas largas y estrechas; vuelo veloz y alto\nOtra"),
    ["Alas largas y estrechas; vuelo veloz y alto", "Otra"]);
comprueba("panel: fuera líneas en blanco y espacios", speciesTipsFromLines("  Uno \r\n\r\n Dos\n"), ["Uno", "Dos"]);
comprueba("panel: lo que enseña es lo que guarda", speciesTipsFromLines(speciesTipsToLines($murcielago)), $murcielago);

echo $fallos ? "\n$fallos comprobación(es) FALLAN\n" : "\nLas pistas de identificación vuelven iguales.\n";
exit($fallos ? 1 : 0);
