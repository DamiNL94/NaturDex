<?php
// ================================================================================================
// NaturDex · importador de volcados SQL desde línea de comandos
// ------------------------------------------------------------------------------------------------
// Ejecuta ficheros .sql contra una base MySQL remota usando el mysqli de PHP. Existe porque el
// cliente `mysql` que trae XAMPP es el de MariaDB y NO soporta caching_sha2_password, el método de
// autenticación por defecto de MySQL 8 (falla con "Plugin caching_sha2_password could not be
// loaded"). El mysqli de PHP 8 sí lo soporta, así que este script permite importar sin instalar un
// cliente MySQL aparte ni recurrir a Docker.
//
// Uso (desde la raíz del proyecto):
//     php Tools\import-sql.php <URL_O_DSN> Database\schema.sql Database\seed.sql
//
// La conexión se puede indicar de dos formas:
//   a) URL completa, tal cual la da Railway en MYSQL_PUBLIC_URL:
//        php Tools\import-sql.php "mysql://root:pass@host.proxy.rlwy.net:12345/railway" ...
//   b) Variables de entorno (DB_HOST/DB_PORT/DB_USER/DB_PASS o las MYSQL* de Railway), omitiendo
//      el primer argumento:
//        php Tools\import-sql.php Database\schema.sql
//
// NOTA sobre la contraseña: si la copias de MYSQL_URL viene url-encoded (@ -> %40, # -> %23...).
// Este script la decodifica al parsear la URL, así que pega la URL COMPLETA sin retocarla. Si en
// cambio usas variables de entorno, ahí la contraseña va en crudo.
//
// No se selecciona ninguna base al conectar, a propósito: schema.sql hace su propio
// "CREATE DATABASE naturadex" + "USE naturadex", así que es autosuficiente.
// ================================================================================================

if (PHP_SAPI !== "cli") {
    http_response_code(403);
    exit("Este script solo se ejecuta por línea de comandos.\n");
}

$args = array_slice($argv, 1);
if (!$args) {
    fwrite(STDERR, "Uso: php Tools/import-sql.php [mysql://user:pass@host:puerto/base] fichero.sql [...]\n");
    exit(1);
}

// El primer argumento es la conexión solo si parece una URL; si no, todos son ficheros y la
// configuración se toma del entorno.
$dsn = null;
if (preg_match("#^(mysql|mysqli)://#i", $args[0])) {
    $dsn = array_shift($args);
}

if (!$args) {
    fwrite(STDERR, "Error: no has indicado ningún fichero .sql que importar.\n");
    exit(1);
}

// --- Datos de conexión ------------------------------------------------------------------------
$host = "localhost";
$port = 3306;
$user = "root";
$pass = "";

if ($dsn !== null) {
    $parts = parse_url($dsn);
    if (!is_array($parts) || empty($parts["host"])) {
        fwrite(STDERR, "Error: no se puede interpretar la URL de conexión.\n");
        exit(1);
    }
    $host = $parts["host"];
    $port = (int) ($parts["port"] ?? 3306);
    $user = isset($parts["user"]) ? rawurldecode($parts["user"]) : "root";
    $pass = isset($parts["pass"]) ? rawurldecode($parts["pass"]) : "";
} else {
    foreach ([["DB_HOST", "MYSQLHOST"], ["DB_PORT", "MYSQLPORT"], ["DB_USER", "MYSQLUSER"],
              ["DB_PASS", "DB_PASSWORD", "MYSQLPASSWORD"]] as $i => $names) {
        foreach ($names as $name) {
            $value = getenv($name);
            if (is_string($value) && $value !== "") {
                if ($i === 0) $host = $value;
                if ($i === 1) $port = (int) $value;
                if ($i === 2) $user = $value;
                if ($i === 3) $pass = $value;
                break;
            }
        }
    }
}

// --- Comprobación de los ficheros ANTES de conectar --------------------------------------------
// Mejor fallar aquí que a medias de la importación con la conexión ya abierta.
foreach ($args as $file) {
    if (!is_file($file) || !is_readable($file)) {
        fwrite(STDERR, "Error: no se encuentra o no se puede leer '$file'.\n");
        exit(1);
    }
}

printf("Conectando a %s:%d como '%s'...\n", $host, $port, $user);

mysqli_report(MYSQLI_REPORT_OFF);
$conn = @new mysqli($host, $user, $pass, "", $port);
if ($conn->connect_error) {
    fwrite(STDERR, "Error de conexión: {$conn->connect_error}\n");
    exit(1);
}
$conn->set_charset("utf8mb4");
printf("Conectado (servidor %s).\n\n", $conn->server_info);

// --- Importación ------------------------------------------------------------------------------
// Se envía cada fichero completo con multi_query: es el servidor quien parsea las sentencias, así
// que no hay que trocear por ';' (partirlo a mano rompería los INSERT cuyo texto contiene ';').
$failed = false;

foreach ($args as $file) {
    $sql = file_get_contents($file);
    if ($sql === false) {
        fwrite(STDERR, "Error leyendo '$file'.\n");
        $failed = true;
        break;
    }

    printf("Importando %s (%s KB)...\n", $file, number_format(strlen($sql) / 1024, 0));

    if (!$conn->multi_query($sql)) {
        fwrite(STDERR, "  FALLO: {$conn->error}\n");
        $failed = true;
        break;
    }

    // Hay que consumir TODOS los resultados: si se deja alguno pendiente, la siguiente consulta
    // falla con "Commands out of sync". El error de una sentencia intermedia solo aparece aquí.
    $statements = 0;
    do {
        if ($result = $conn->store_result()) $result->free();
        $statements++;
        if ($conn->errno) {
            fwrite(STDERR, "  FALLO en la sentencia #$statements: {$conn->error}\n");
            $failed = true;
            break 2;
        }
    } while ($conn->more_results() && $conn->next_result());

    printf("  OK · %d sentencias ejecutadas.\n\n", $statements);
}

if ($failed) {
    fwrite(STDERR, "\nImportación interrumpida. Revisa el error de arriba.\n");
    $conn->close();
    exit(1);
}

// --- Verificación -----------------------------------------------------------------------------
// Confirmar que la base y la tabla de usuarios existen de verdad: es el punto exacto que estaba
// haciendo fallar el login en producción.
$check = $conn->query("SELECT COUNT(*) AS n FROM information_schema.tables
                       WHERE table_schema = 'naturadex'");
$tables = $check ? (int) $check->fetch_assoc()["n"] : 0;

printf("Importación completada. La base 'naturadex' tiene %d tablas.\n", $tables);
if ($tables === 0) {
    fwrite(STDERR, "AVISO: no se ha creado ninguna tabla en 'naturadex'. Revisa el volcado.\n");
    $conn->close();
    exit(1);
}

$conn->close();
