<?php
// ================================================================================================
// tiempo_payload.php — forma canónica del JSON del tiempo de un espacio, y todo lo que cuesta
// llegar hasta él (AEMET OpenData).
// ------------------------------------------------------------------------------------------------
// EL PROBLEMA QUE RESUELVE: la pregunta que se hace alguien antes de coger el coche es «¿salgo hoy
// a este espacio?», y la app no sabía contestarla. Contestarla con AEMET tiene tres trampas que no
// se ven hasta que muerden, y las tres se tapan aquí para que el endpoint quede en diez líneas:
//
//   1. EL FLUJO SON DOS PETICIONES. La primera devuelve un JSON de CONTROL
//      ({descripcion, estado, datos, metadatos}) y el dato de verdad está en la URL del campo
//      `datos`. Y el `estado` de ese control NO es el código HTTP: probado el 2026-09-09, una URL
//      de datos caducada responde **HTTP 200** con `{"descripcion":"datos expirados","estado":404}`
//      en el cuerpo, y sin api_key AEMET contesta **HTTP 200 con el cuerpo VACÍO**. Quien mire solo
//      el código HTTP se cree que tiene la predicción y lo que tiene es un `null`.
//   2. LA SEGUNDA RESPUESTA NO ES UTF-8. AEMET la sirve en ISO-8859-15; si se pasa tal cual a
//      json_decode, los acentos y los nombres de municipio salen rotos y no lo avisa nadie. Aquí se
//      convierte ANTES de decodificar, y se hace COMPROBANDO la codificación en vez de convertir a
//      ciegas: el día que AEMET emita UTF-8, convertir «por si acaso» rompería lo que hoy funciona.
//   3. EL CUPO. La predicción municipal se emite unas pocas veces al día y el límite es de ~50
//      peticiones por minuto para toda la clave: pegarle a AEMET en cada visita a un espacio es
//      tirar el cupo y meter la latencia de AEMET en el arranque de la app. Se cachea en disco por
//      código INE, y ante un fallo o un 429 se sirve lo cacheado MARCADO COMO VIEJO en vez de
//      devolver un error — el criterio del repo: una fuente que no se ha podido consultar no dice
//      que no.
//
// La forma que sale de aquí es PROPIA, no el JSON de AEMET en crudo. Si mañana se añade la
// observación de estación o se cambia de proveedor, el frontend no se entera.
//
// ATRIBUCIÓN (no es opcional). La nota legal de AEMET (https://www.aemet.es/es/nota_legal), leída
// el 2026-09-09, exige para la información NO modificada:
//     «Incluir el Copyright de AEMET (© AEMET) o en su lugar el texto: "Información elaborada por
//      la Agencia Estatal de Meteorología".»
// y, en su punto 3, «mencionar la fecha de la última actualización de los documentos objeto de la
// reutilización». Aquí se emiten las dos cosas —la fórmula literal en `fuente.atribucion` y la
// fecha de elaboración en `emitidoEn`— y el widget las pinta las dos. Se usa la fórmula de la
// información no modificada (y no el «Fuente: AEMET» de los servicios de valor añadido) porque esto
// es la predicción de AEMET presentada como tal: se seleccionan y renombran campos, no se altera
// ningún valor ni se mezcla con otra fuente.
// ================================================================================================

// Host y rutas de AEMET OpenData. Documentación viva: https://opendata.aemet.es/dist/index.html
const AEMET_HOST = "https://opendata.aemet.es";
const AEMET_RUTA_DIARIA = "/opendata/api/prediccion/especifica/municipio/diaria/";

// Cortes por tiempo de las llamadas SALIENTES. Este endpoint no puede ser el que haga esperar a
// nadie: el frontend corta a los 3 s (Frontend/Js/api.js · API_TIMEOUT_MS) y son DOS peticiones
// encadenadas, así que el presupuesto de las dos junto tiene que caber holgado por debajo. Si no
// llega a tiempo se sirve lo cacheado, que es justo lo que hay que hacer.
const AEMET_TIMEOUT_S = 4;
const AEMET_CONNECT_TIMEOUT_S = 2;

// Vida de la caché de servidor.
//   FRESCA: por debajo de esto se sirve sin tocar a AEMET. Una hora, porque la predicción municipal
//           diaria se emite unas pocas veces al día: pedirla más a menudo no trae dato nuevo.
//   RESERVA: por encima de la frescura se intenta refrescar, y si AEMET falla o responde 429 se
//           sirve lo guardado marcado como viejo hasta este límite. Doce horas: una predicción de
//           esta mañana sigue diciendo algo útil sobre esta tarde; la de ayer, no.
const TIEMPO_CACHE_FRESCA_S = 3600;
const TIEMPO_CACHE_RESERVA_S = 12 * 3600;

/** Directorio de la caché. Backend/Data está fuera del webroot (docker/apache.conf) y es escribible
 *  por el usuario del servidor (Dockerfile), que es exactamente lo que hace falta. */
function tiempoCacheDir() {
    return __DIR__ . "/../Data/tiempo";
}

/** Bloque `fuente` de la respuesta. Ver el comentario de atribución de la cabecera. */
function tiempoFuente() {
    return [
        "nombre" => "AEMET · predicción municipal diaria",
        "atribucion" => "Información elaborada por la Agencia Estatal de Meteorología",
        "url" => "https://www.aemet.es",
    ];
}

/**
 * Una petición GET a AEMET. Devuelve ["ok" => bool, "cuerpo" => string|null, "motivo" => string].
 *
 * `motivo` es para el log del servidor, nunca para el usuario: distinguir «AEMET no contesta» de
 * «la clave es mala» es lo que hace depurable esto, y ninguna de las dos cosas le importa a quien
 * está mirando si llueve.
 */
function aemetGet($url, $apiKey = null) {
    if (!function_exists("curl_init")) {
        return ["ok" => false, "cuerpo" => null, "motivo" => "la extensión cURL de PHP no está instalada"];
    }
    $ch = curl_init($url);
    $cabeceras = ["Accept: application/json"];
    // La clave va en cabecera y no en la query: así no acaba escrita en los logs de acceso de
    // ningún proxy intermedio. AEMET admite las dos formas.
    if ($apiKey !== null) $cabeceras[] = "api_key: " . $apiKey;
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => $cabeceras,
        CURLOPT_TIMEOUT => AEMET_TIMEOUT_S,
        CURLOPT_CONNECTTIMEOUT => AEMET_CONNECT_TIMEOUT_S,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS => 3,
        CURLOPT_USERAGENT => "NaturDex/1.0 (+https://github.com/DamiNL94/NaturDex)",
    ]);
    $cuerpo = curl_exec($ch);
    $codigo = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $errorRed = curl_error($ch);
    curl_close($ch);

    if ($cuerpo === false) return ["ok" => false, "cuerpo" => null, "motivo" => "error de red: " . $errorRed];
    if ($codigo === 429) return ["ok" => false, "cuerpo" => null, "motivo" => "429: cupo de peticiones agotado"];
    if ($codigo < 200 || $codigo >= 300) {
        return ["ok" => false, "cuerpo" => null, "motivo" => "HTTP " . $codigo . ": " . substr((string) $cuerpo, 0, 160)];
    }
    return ["ok" => true, "cuerpo" => (string) $cuerpo, "motivo" => ""];
}

/**
 * Decodifica un cuerpo de AEMET a array de PHP, convirtiendo la codificación si hace falta.
 *
 * Ver la trampa nº 2 de la cabecera: la respuesta de datos llega en ISO-8859-15. Se COMPRUEBA en
 * vez de convertir a ciegas, porque una conversión incondicional rompería el día que AEMET emita
 * UTF-8 (y el JSON de control ya lo es hoy).
 */
function aemetDecode($cuerpo) {
    if ($cuerpo === null || trim($cuerpo) === "") return null;   // sin api_key AEMET devuelve 200 y cuerpo vacío
    if (!mb_check_encoding($cuerpo, "UTF-8")) {
        $cuerpo = mb_convert_encoding($cuerpo, "UTF-8", "ISO-8859-15");
    }
    $datos = json_decode($cuerpo, true);
    return is_array($datos) ? $datos : null;
}

/**
 * Las dos peticiones de AEMET, de la ruta al dato.
 *
 * Devuelve ["ok" => bool, "datos" => array|null, "motivo" => string]. Comprueba el `estado` del
 * JSON de control ANTES de seguir: es donde AEMET dice 401 (clave mala), 404 (sin dato) o 429
 * (demasiadas peticiones) con un HTTP 200 por delante.
 */
function aemetDatos($ruta, $apiKey) {
    $control = aemetGet(AEMET_HOST . $ruta, $apiKey);
    if (!$control["ok"]) return ["ok" => false, "datos" => null, "motivo" => $control["motivo"]];

    $sobre = aemetDecode($control["cuerpo"]);
    if ($sobre === null) {
        return ["ok" => false, "datos" => null, "motivo" => "respuesta de control vacía o ilegible (¿api_key ausente?)"];
    }
    $estado = (int) ($sobre["estado"] ?? 0);
    if ($estado !== 200 || empty($sobre["datos"])) {
        return ["ok" => false, "datos" => null,
                "motivo" => "control estado=" . $estado . " " . ($sobre["descripcion"] ?? "")];
    }

    // Segunda petición: la URL de `datos` es temporal y NO lleva clave (ya va firmada).
    $datos = aemetGet($sobre["datos"]);
    if (!$datos["ok"]) return ["ok" => false, "datos" => null, "motivo" => $datos["motivo"]];

    $contenido = aemetDecode($datos["cuerpo"]);
    if ($contenido === null) return ["ok" => false, "datos" => null, "motivo" => "datos vacíos o ilegibles"];
    // Una URL de datos caducada responde con OTRO JSON de control, no con la predicción.
    if (isset($contenido["estado"]) && (int) $contenido["estado"] !== 200) {
        return ["ok" => false, "datos" => null,
                "motivo" => "datos estado=" . $contenido["estado"] . " " . ($contenido["descripcion"] ?? "")];
    }
    return ["ok" => true, "datos" => $contenido, "motivo" => ""];
}

/**
 * El valor de un array de AEMET con tramos horarios (`estadoCielo`, `probPrecipitacion`, `viento`,
 * `rachaMax`), preferiendo el tramo del día entero.
 *
 * ESTO ES UN FALLO EN VERDE si se coge el primer elemento sin mirar: en el día de HOY, cuando la
 * predicción se emite con la mañana ya empezada, el tramo «00-24» puede no existir (quedan 12-24,
 * 18-24…) y a veces existe con el valor VACÍO. Coger `[0]` a ciegas devuelve unas veces el día
 * entero, otras un tramo suelto y otras la cadena vacía, y las tres se pintan igual de bien.
 */
function aemetTramo($lista) {
    if (!is_array($lista)) return null;
    $conValor = [];
    foreach ($lista as $tramo) {
        if (!is_array($tramo)) continue;
        // `viento` no usa `value` sino `velocidad`/`direccion`: se considera con valor si trae algo.
        $vacio = (!isset($tramo["value"]) || $tramo["value"] === "" || $tramo["value"] === null)
              && (!isset($tramo["velocidad"]) || $tramo["velocidad"] === "" || $tramo["velocidad"] === null);
        if ($vacio) continue;
        if (($tramo["periodo"] ?? "") === "00-24") return $tramo;  // el día entero, que es lo que se pide
        $conValor[] = $tramo;
    }
    return $conValor[0] ?? null;   // sin tramo de día entero: el primero que sí diga algo
}

/** Entero o null. `(int) null` es 0, y un 0 de temperatura o de probabilidad es un dato real. */
function aemetEntero($valor) {
    if ($valor === null || $valor === "" || !is_numeric($valor)) return null;
    return (int) $valor;
}

/**
 * Un día de la predicción diaria de AEMET → la forma de NaturDex.
 * Lo que la fuente no trae se queda SIN campo con valor: `null`, nunca un «no disponible» inventado.
 */
function normalizaDia($dia) {
    $cielo = aemetTramo($dia["estadoCielo"] ?? null);
    $viento = aemetTramo($dia["viento"] ?? null);
    $racha = aemetTramo($dia["rachaMax"] ?? null);
    $lluvia = aemetTramo($dia["probPrecipitacion"] ?? null);

    return [
        // `fecha` llega como "2026-09-09T00:00:00"; el día es lo único que importa aquí.
        "fecha" => substr((string) ($dia["fecha"] ?? ""), 0, 10),
        "tempMax" => aemetEntero($dia["temperatura"]["maxima"] ?? null),
        "tempMin" => aemetEntero($dia["temperatura"]["minima"] ?? null),
        "cielo" => [
            // El TEXTO es el portador del dato; el código es para elegir icono. Nunca al revés.
            "texto" => ($cielo["descripcion"] ?? "") !== "" ? $cielo["descripcion"] : null,
            "codigo" => ($cielo["value"] ?? "") !== "" ? (string) $cielo["value"] : null,
        ],
        "probPrecipitacion" => aemetEntero($lluvia["value"] ?? null),
        "viento" => [
            "direccion" => ($viento["direccion"] ?? "") !== "" ? $viento["direccion"] : null,
            "velocidadKmh" => aemetEntero($viento["velocidad"] ?? null),
            "rachaMaxKmh" => aemetEntero($racha["value"] ?? null),
        ],
        // El índice UV solo viene en los primeros días de la predicción: su ausencia es normal.
        "uvMax" => aemetEntero($dia["uvMax"] ?? null),
    ];
}

/**
 * La predicción cruda de AEMET → el payload de NaturDex.
 *
 * Se emiten HOY Y MAÑANA y nada más: lo que se decide con esto es si se sale, y a cinco días vista
 * la predicción municipal ya no sostiene esa decisión ni cabe en la cabecera.
 */
function normalizaPrediccion($crudo, $ine) {
    $raiz = is_array($crudo) && isset($crudo[0]) ? $crudo[0] : null;
    if (!is_array($raiz)) return null;
    $dias = $raiz["prediccion"]["dia"] ?? null;
    if (!is_array($dias) || !count($dias)) return null;

    $salida = [];
    foreach (array_slice($dias, 0, 2) as $dia) {
        if (is_array($dia)) $salida[] = normalizaDia($dia);
    }
    if (!count($salida)) return null;

    return [
        "municipio" => [
            "nombre" => $raiz["nombre"] ?? null,
            "ine" => $ine,
            "provincia" => $raiz["provincia"] ?? null,
        ],
        "dias" => $salida,
        // Hora de ELABORACIÓN de AEMET (hora peninsular, sin desfase en el original) y hora en la
        // que la pedimos nosotros. Son dos cosas distintas y la ficha necesita la primera: es la
        // «fecha de última actualización» que exige el punto 3 de la nota legal de AEMET.
        "emitidoEn" => $raiz["elaborado"] ?? null,
        "obtenidoEn" => gmdate("c"),
        "fuente" => tiempoFuente(),
    ];
}

// --- Caché en disco -----------------------------------------------------------------------------

function tiempoCacheRuta($ine) {
    return tiempoCacheDir() . "/" . $ine . ".json";
}

/** Lo guardado para este municipio, o null. Devuelve ["edadS" => int, "payload" => array]. */
function tiempoCacheLee($ine) {
    $ruta = tiempoCacheRuta($ine);
    if (!is_file($ruta)) return null;
    $bruto = @file_get_contents($ruta);
    if ($bruto === false) return null;
    $guardado = json_decode($bruto, true);
    if (!is_array($guardado) || !isset($guardado["guardadoEn"], $guardado["payload"])) return null;
    return [
        "edadS" => max(0, time() - (int) $guardado["guardadoEn"]),
        "payload" => $guardado["payload"],
    ];
}

/** Guarda el payload. Escritura atómica: un fichero a medias se leería como caché corrupta. */
function tiempoCacheEscribe($ine, $payload) {
    $dir = tiempoCacheDir();
    if (!is_dir($dir) && !@mkdir($dir, 0775, true) && !is_dir($dir)) return;
    $tmp = tiempoCacheRuta($ine) . "." . getmypid() . ".tmp";
    $json = json_encode(["guardadoEn" => time(), "payload" => $payload], JSON_UNESCAPED_UNICODE);
    if ($json === false) return;
    if (@file_put_contents($tmp, $json) === false) return;
    if (!@rename($tmp, tiempoCacheRuta($ine))) @unlink($tmp);
}

// --- La función que usa el endpoint -------------------------------------------------------------

/**
 * El tiempo de un municipio, listo para responder.
 *
 * Devuelve ["codigo" => int, "cuerpo" => array]: el endpoint solo tiene que pasárselo a respond().
 * Los tres desenlaces posibles, y ninguno deja al widget con un hueco:
 *   · 200 con `viejo: false` — dato fresco (de AEMET o de la caché todavía en hora).
 *   · 200 con `viejo: true`  — AEMET no ha podido consultarse y se sirve lo guardado, DICIÉNDOLO.
 *   · 503 con `error`        — no hay clave, no hay cURL o AEMET no responde y no hay nada guardado.
 *                              El widget, ante cualquier respuesta que no sea 200, no se pinta.
 */
function buildTiempoPayload($ine, $apiKey) {
    $cache = tiempoCacheLee($ine);

    // 1) Caché todavía fresca: ni se molesta a AEMET.
    if ($cache !== null && $cache["edadS"] < TIEMPO_CACHE_FRESCA_S) {
        return ["codigo" => 200, "cuerpo" => $cache["payload"] + ["cacheado" => true, "viejo" => false]];
    }

    // 2) Sin clave no se puede preguntar. Es un estado NORMAL de este proyecto (despliegue sin
    //    configurar), no una avería: se responde algo honesto y el widget se calla.
    if ($apiKey === null || $apiKey === "") {
        if ($cache !== null && $cache["edadS"] < TIEMPO_CACHE_RESERVA_S) {
            return ["codigo" => 200, "cuerpo" => $cache["payload"] + ["cacheado" => true, "viejo" => true]];
        }
        return ["codigo" => 503, "cuerpo" => [
            "error" => "El servidor no tiene configurada AEMET_API_KEY: no se puede consultar la predicción.",
            "disponible" => false,
        ]];
    }

    // 3) A AEMET.
    $respuesta = aemetDatos(AEMET_RUTA_DIARIA . rawurlencode($ine), $apiKey);
    if ($respuesta["ok"]) {
        $payload = normalizaPrediccion($respuesta["datos"], $ine);
        if ($payload !== null) {
            tiempoCacheEscribe($ine, $payload);
            return ["codigo" => 200, "cuerpo" => $payload + ["cacheado" => false, "viejo" => false]];
        }
        $respuesta["motivo"] = "la predicción de AEMET no tiene la forma esperada";
    }

    // 4) AEMET no ha podido consultarse. El motivo al log, y al usuario lo guardado marcado como
    //    viejo: una fuente que no se ha podido consultar no dice que no.
    error_log("NaturDex/tiempo: AEMET no disponible para el municipio " . $ine . " (" . $respuesta["motivo"] . ")");
    if ($cache !== null && $cache["edadS"] < TIEMPO_CACHE_RESERVA_S) {
        return ["codigo" => 200, "cuerpo" => $cache["payload"] + ["cacheado" => true, "viejo" => true]];
    }
    return ["codigo" => 503, "cuerpo" => [
        "error" => "La predicción de AEMET no está disponible en este momento.",
        "disponible" => false,
    ]];
}
