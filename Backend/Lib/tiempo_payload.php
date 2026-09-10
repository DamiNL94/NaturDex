<?php
// ================================================================================================
// tiempo_payload.php — forma canónica del JSON del tiempo de un espacio, y todo lo que cuesta
// llegar hasta él (AEMET OpenData).
// ------------------------------------------------------------------------------------------------
// EL PROBLEMA QUE RESUELVE: la pregunta que se hace alguien antes de coger el coche es «¿salgo hoy
// a este espacio?», y la app no sabía contestarla. Contestarla con AEMET tiene cuatro trampas que no
// se ven hasta que muerden, y las cuatro se tapan aquí para que el endpoint quede en diez líneas:
//
//   1. EL FLUJO SON DOS PETICIONES. La primera devuelve un JSON de CONTROL
//      ({descripcion, estado, datos, metadatos}) y el dato de verdad está en la URL del campo
//      `datos`. Y el `estado` de ese control NO es el código HTTP: probado el 2026-09-09, una URL
//      de datos caducada responde **HTTP 200** con `{"descripcion":"datos expirados","estado":404}`
//      en el cuerpo, y sin api_key AEMET contesta **HTTP 200 con el cuerpo VACÍO**. Quien mire solo
//      el código HTTP se cree que tiene la predicción y lo que tiene es un `null`.
//   2. LAS RESPUESTAS NO TIENEN UNA CODIFICACIÓN: LA MEZCLAN. Lo que se da por sabido es «AEMET
//      sirve ISO-8859-15», y es verdad a medias: el maestro de municipios y el JSON de control de
//      un 429 son Latin-9, pero en la predicción municipal el nombre del municipio llega ya en
//      UTF-8 y el pie legal del bloque `origen` no, aunque la cabecera declare ISO-8859-15 para
//      todo el cuerpo. Tratar el cuerpo entero como una sola cosa
//      —en cualquiera de los dos sentidos— rompe la otra mitad sin avisar: pasó con la primera
//      predicción real, que dejó «Ãguilas» en la caché (2026-09-10). Se repara secuencia a
//      secuencia en `aemetUtf8()`, cuya cabecera explica por qué eso no es ambiguo en castellano.
//   3. EN EL DÍA DE HOY, «EL DÍA ENTERO» MIENTE. Pasada la mañana, AEMET deja a CERO —no en blanco—
//      el tramo 00-24 de la probabilidad de lluvia, y cogerlo daba «Lluvia 0 %» con un 95 % previsto
//      para la tarde (Águilas, 2026-09-10). La lluvia y la racha salen del máximo de sus tramos, con
//      el tramo del que sale: ver `aemetMaximo()`.
//   4. EL CUPO, que es MÁS ESTRECHO de lo que se suele decir. La cifra que circula es «~50
//      peticiones por minuto» y esta misma cabecera la repetía; medido el 2026-09-10 con la clave
//      del proyecto, AEMET respondió **HTTP 429 a las ~18 peticiones en un minuto** (dos pases del
//      maestro de municipios más siete predicciones de dos peticiones cada una). Y el cupo es de la
//      CLAVE, no de este servidor: lo gastan igual el endpoint, Tools/resuelve-municipio-aemet.js y
//      cualquier prueba a mano. Por eso la predicción se cachea en disco por código INE y nunca se
//      pide en cada visita; con dieciséis espacios sobre trece municipios, la caché de una hora
//      deja el gasto muy por debajo del límite en uso normal. Ante un 429 o un fallo se sirve lo
//      cacheado MARCADO COMO VIEJO en vez de devolver un error — el criterio del repo: una fuente
//      que no se ha podido consultar no dice que no.
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
 * Decodifica un cuerpo de AEMET a array de PHP. La codificación se arregla en `aemetUtf8()`.
 */
function aemetDecode($cuerpo) {
    if ($cuerpo === null || trim($cuerpo) === "") return null;   // sin api_key AEMET devuelve 200 y cuerpo vacío
    $datos = json_decode(aemetUtf8($cuerpo), true);
    return is_array($datos) ? $datos : null;
}

// Una secuencia UTF-8 VÁLIDA (grupo 1) o un byte alto SUELTO (grupo 2). Es la tabla de rangos del
// RFC 3629: excluye los inicios C0/C1 y las secuencias sobrelargas o de sustitutos. En modo byte (sin
// el modificador `u`) a propósito: con `u`, PCRE rechazaría la entrada entera por no ser UTF-8, que es
// justo el caso que hay que tratar.
const AEMET_SECUENCIA = '/([\xC2-\xDF][\x80-\xBF]|\xE0[\xA0-\xBF][\x80-\xBF]|[\xE1-\xEC\xEE\xEF][\x80-\xBF]{2}'
    . '|\xED[\x80-\x9F][\x80-\xBF]|\xF0[\x90-\xBF][\x80-\xBF]{2}|[\xF1-\xF3][\x80-\xBF]{3}'
    . '|\xF4[\x80-\x8F][\x80-\xBF]{2})|([\x80-\xFF])/';

/**
 * Un cuerpo de AEMET → UTF-8, SECUENCIA A SECUENCIA y no de golpe.
 *
 * ESTO ERA UN FALLO EN VERDE, y lo destapó la primera predicción real (2026-09-10). La versión
 * anterior miraba el cuerpo ENTERO —¿es UTF-8 válido?— y si no lo era lo convertía entero desde
 * ISO-8859-15. Pero AEMET no emite ni lo uno ni lo otro: una misma respuesta MEZCLA las dos
 * codificaciones. Medido sobre la predicción de Águilas (13.752 bytes): el campo `nombre` llega en
 * UTF-8 («Á» = C3 81) y hay exactamente CINCO bytes Latin-9 sueltos, los cinco en el bloque `origen`
 * —el pie legal: «Meteorología», «España», «©», «información», «reproducción»—. Esos cinco
 * bastaban para que el cuerpo entero se diera por Latin-9: la
 * conversión volvía a codificar la «Á» buena y la caché guardó «Ãguilas» y «Fuente Ãlamo de
 * Murcia». No fallaba nada: json_decode lo aceptaba, el widget lo habría pintado.
 * Y LA CABECERA NO SIRVE PARA DECIDIRLO: las dos respuestas declaran `charset=ISO-8859-15` para el
 * cuerpo entero, y es falso para el nombre. Hacerle caso rompería lo mismo por el otro lado.
 * Las otras respuestas tampoco se ponen de acuerdo: el maestro de municipios es Latin-9 de
 * principio a fin, y el JSON de control de un 429 también («l\xEDmites»).
 *
 * Así que se deja pasar tal cual cada secuencia UTF-8 válida y se convierte desde Latin-9 SOLO el
 * byte suelto. Para texto en castellano no hay ambigüedad posible: «Á» en Latin-9 es 0xC1, que
 * nunca puede empezar una secuencia UTF-8; y el resto de vocales acentuadas y la «ñ» solo se
 * leerían como UTF-8 si fueran seguidas de uno o dos bytes del rango 0x80-0xBF, que en Latin-9 son
 * signos sueltos (¡ ¿ º ª « » °) que no aparecen pegados a una letra.
 */
function aemetUtf8($texto) {
    if (mb_check_encoding($texto, "UTF-8")) return $texto;   // el caso bueno, sin coste
    return preg_replace_callback(AEMET_SECUENCIA, function ($m) {
        return (isset($m[2]) && $m[2] !== "") ? mb_convert_encoding($m[2], "UTF-8", "ISO-8859-15") : $m[1];
    }, $texto);
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
 * El valor MÁXIMO de un array de tramos de AEMET, con el tramo del que sale.
 * Devuelve ["valor" => int|null, "periodo" => string|null].
 *
 * ESTO ERA EL PEOR FALLO EN VERDE DEL MÓDULO, porque enseñaba lo contrario de lo que hay. Para la
 * probabilidad de lluvia se cogía el tramo del día entero («00-24») de `aemetTramo()`, que se salta
 * los tramos VACÍOS. Pero en el día de HOY, en cuanto la mañana ha pasado, AEMET no vacía los tramos
 * que ya no predice: los deja a CERO. La predicción real de Águilas elaborada el 2026-09-10 a las
 * 13:23 traía `00-24: 0`, `12-24: 95`, `12-18: 90`, y el widget decía «Lluvia 0 %» con un 95 %
 * previsto para la tarde. Con el cielo no pasa porque AEMET lo deja en blanco (`""`), y por eso la
 * trampa solo mordía la mitad de los campos: es el cotejo asimétrico del CLAUDE.md raíz.
 *
 * Así que para los dos campos con los que se DECIDE o se AVISA —la lluvia y la racha— se toma el
 * máximo de todos los tramos, que ignora solo los ceros de los tramos pasados, y se dice de qué
 * tramo sale: «Lluvia 95 % de 12 a 24 h» es la predicción de AEMET tal cual, con su franja, no una
 * cifra nuestra. En un empate se queda el tramo más estrecho, que es el que más dice. Un 0 que es
 * el único valor del día sigue siendo 0; ningún valor, null.
 */
function aemetMaximo($lista) {
    $mejor = ["valor" => null, "periodo" => null];
    if (!is_array($lista)) return $mejor;
    $ancho = function ($p) {
        return preg_match('/^(\d{2})-(\d{2})$/', (string) $p, $m) ? (int) $m[2] - (int) $m[1] : 99;
    };
    foreach ($lista as $tramo) {
        $valor = aemetEntero(is_array($tramo) ? ($tramo["value"] ?? null) : null);
        if ($valor === null) continue;
        $periodo = $tramo["periodo"] ?? null;
        if ($mejor["valor"] === null || $valor > $mejor["valor"]
            || ($valor === $mejor["valor"] && $ancho($periodo) < $ancho($mejor["periodo"]))) {
            $mejor = ["valor" => $valor, "periodo" => $periodo];
        }
    }
    return $mejor;
}

/**
 * Un día de la predicción diaria de AEMET → la forma de NaturDex.
 * Lo que la fuente no trae se queda SIN campo con valor: `null`, nunca un «no disponible» inventado.
 * La lluvia y la racha salen de `aemetMaximo()`, no de `aemetTramo()`: ver su cabecera.
 */
function normalizaDia($dia) {
    $cielo = aemetTramo($dia["estadoCielo"] ?? null);
    $viento = aemetTramo($dia["viento"] ?? null);
    $racha = aemetMaximo($dia["rachaMax"] ?? null);
    $lluvia = aemetMaximo($dia["probPrecipitacion"] ?? null);

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
        // El máximo de los tramos del día y el tramo del que sale: ver aemetMaximo(). Sin la franja,
        // un 95 % de tarde se leería como el del día entero.
        "probPrecipitacion" => $lluvia["valor"],
        "probPrecipitacionPeriodo" => $lluvia["periodo"],
        "viento" => [
            "direccion" => ($viento["direccion"] ?? "") !== "" ? $viento["direccion"] : null,
            "velocidadKmh" => aemetEntero($viento["velocidad"] ?? null),
            "rachaMaxKmh" => $racha["valor"],
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
