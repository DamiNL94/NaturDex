<?php
// ================================================================================================
// tiempo.php — «¿qué tiempo va a hacer en el espacio al que voy?» (AEMET OpenData).
// ------------------------------------------------------------------------------------------------
// Por qué existe este endpoint y no un fetch directo desde el frontend: la api_key de AEMET NO
// PUEDE VIVIR EN Frontend/. Todo lo de esa carpeta lo sirve un servidor estático y encima lo cachea
// el Service Worker, así que una clave ahí es una clave publicada. Aquí la clave se queda en el
// servidor —variable de entorno AEMET_API_KEY, misma lectura que la contraseña de la BD— y el
// frontend habla solo con este endpoint, como con todo lo demás.
//
// Toda la lógica (dos peticiones, control de `estado`, ISO-8859-15, caché con TTL, degradación)
// vive en Lib/tiempo_payload.php, que es donde se define la forma del JSON una sola vez.
//
//   GET tiempo.php?municipio=30003     ->  200 con la predicción, o 503 con `error`
//
// El parámetro es el código INE de 5 dígitos del municipio, que la app lleva en el dato del espacio
// (`park.weather.ine`, resuelto contra el maestro del propio AEMET por
// Tools/resuelve-municipio-aemet.js). No se acepta un slug de parque a propósito: eso obligaría a
// resolverlo contra la base de datos y a que la predicción dependiese de que MySQL esté vivo.
//
// `apiBoot(["db" => false])` — es el único endpoint que NO abre la base, y es deliberado: aquí no se
// consulta nada de MySQL, y con la conexión puesta este endpoint moría con la base (probado: con
// MySQL parado respondía «Database connection error», y con él el widget del tiempo). Sigue
// arrancando por apiBoot(), que es la convención de la casa: lo que se apaga es la conexión, no el
// prólogo común de cabeceras, CORS y corte del preflight.
// ================================================================================================

require_once __DIR__ . "/../Lib/api.php";
require_once __DIR__ . "/../Lib/tiempo_payload.php";

apiBoot(["db" => false]);

if (($_SERVER["REQUEST_METHOD"] ?? "GET") !== "GET") apiMethodNotAllowed("GET");

$municipio = trim((string) ($_GET["municipio"] ?? ""));
// Cinco dígitos exactos: provincia (2) + municipio (3), sin dígito de control. Se valida aquí y no
// más adentro para que una entrada rara no llegue nunca a componer una URL saliente.
if (!preg_match('/^\d{5}$/', $municipio)) {
    apiError("Falta el código INE del municipio (5 dígitos). Ejemplo: ?municipio=30003", 400);
}

$resultado = buildTiempoPayload($municipio, naturdex_env(["AEMET_API_KEY"]));
respond($resultado["cuerpo"], $resultado["codigo"]);
