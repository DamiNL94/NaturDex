<?php
// Cabeceras CORS de la API pública (parks, species, auth, progress).
//
// Antes se mandaba "Access-Control-Allow-Origin: *"; ahora se permite SOLO el origen propio (el
// esquema y host con los que el navegador está viendo la app). Como el frontend se sirve desde el
// mismo origen que la API, nada cambia para la app, pero otras webs ya no pueden leer respuestas
// de la API desde el navegador del usuario. (admin.php sigue sin cabeceras CORS: solo mismo origen.)
//
// El esquema se detecta también detrás del proxy TLS de producción: Apache ve HTTP en el tramo
// interno, pero Caddy añade X-Forwarded-Proto=https. Reflejar el Host es seguro: el navegador
// compara este valor con el Origin real de la página, así que un tercero nunca coincide.
function apiCorsHeaders() {
    $https = (!empty($_SERVER["HTTPS"]) && $_SERVER["HTTPS"] !== "off")
        || (($_SERVER["HTTP_X_FORWARDED_PROTO"] ?? "") === "https");
    $host = $_SERVER["HTTP_HOST"] ?? "localhost";
    header("Access-Control-Allow-Origin: " . ($https ? "https" : "http") . "://" . $host);
    header("Vary: Origin");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
}
