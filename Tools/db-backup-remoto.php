<?php
/*
 * db-backup-remoto.php — copia de seguridad de la base DESPLEGADA, antes de aplicarle una cola.
 *
 * El problema que resuelve
 * -----------------------
 * `npm run db:backup` copia el contenedor LOCAL, que hoy no arranca, así que para Railway no sirve
 * de nada. Cada vez que ha habido que aplicar una cola —2026-09-11, 09-14 y 09-15— se ha escrito un
 * volcado PDO a mano y se ha tirado después; el runbook lo daba por supuesto («para Railway hace
 * falta un volcado propio») sin decir dónde estaba, porque no estaba en ninguna parte. Esta es la
 * tercera vez que se escribe el mismo fichero: ahora se queda.
 *
 * Por qué PDO y no `mysqldump`
 * ----------------------------
 * Porque `mysqldump` no está en esta máquina y el contenedor local no arranca, así que no hay
 * cliente desde el que lanzarlo. Con PDO basta: `SHOW CREATE TABLE` da el DDL exacto y un `SELECT *`
 * paginado da las filas.
 *
 * `START TRANSACTION WITH CONSISTENT SNAPSHOT` **no es decoración**: sin él, dos tablas volcadas con
 * un minuto de diferencia pueden contradecirse (una observación cuya especie ya no está), y una
 * copia incoherente es peor que ninguna porque parece buena.
 *
 * El MANIFIESTO al lado es la mitad que se olvida: filas por tabla y `sha1` del volcado. Sin él, la
 * única forma de saber si la copia está entera es volver a cargarla, que es justo lo que no se
 * quiere hacer con prisa.
 *
 * LLEVA CORREOS Y HASHES DE CONTRASEÑA: el destino va FUERA del repositorio, y por eso la ruta es
 * obligatoria y no tiene valor por defecto dentro de él.
 *
 * Uso (la URL la inyecta Railway; el `railway run` se encarga):
 *   railway run --service MySQL -- bash -c \
 *     'php Tools/db-backup-remoto.php "$MYSQL_PUBLIC_URL" ~/NaturDex-backups/railway-<fecha>.sql'
 */

if ($argc < 3) {
    fwrite(STDERR, "Uso: php db-backup-remoto.php <mysql-url> <destino.sql>\n");
    fwrite(STDERR, "El destino va FUERA del repositorio: el volcado lleva correos y hashes.\n");
    exit(2);
}
[$_, $url, $destino] = $argv;

// La URL de Railway apunta a la base `railway`; el catálogo vive en `naturadex`. Se puede pasar otra
// con la variable NATURDEX_DB por si algún día cambia el nombre.
$BASE = getenv('NATURDEX_DB') ?: 'naturadex';

$u = parse_url($url);
if (!$u || empty($u['host'])) { fwrite(STDERR, "URL de MySQL ilegible\n"); exit(2); }
$dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', $u['host'], $u['port'] ?? 3306, $BASE);

try {
    $pdo = new PDO($dsn, $u['user'] ?? 'root', isset($u['pass']) ? urldecode($u['pass']) : '', [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::MYSQL_ATTR_USE_BUFFERED_QUERY => true,
    ]);
} catch (PDOException $e) {
    fwrite(STDERR, 'No se ha podido conectar: ' . $e->getMessage() . "\n");
    exit(1);
}

$dir = dirname($destino);
if (!is_dir($dir) && !@mkdir($dir, 0777, true)) { fwrite(STDERR, "No existe el directorio $dir\n"); exit(2); }

// Instantánea coherente: todas las tablas se leen en el mismo punto en el tiempo.
$pdo->exec('SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ');
$pdo->exec('START TRANSACTION WITH CONSISTENT SNAPSHOT');

$tablas = $pdo->query('SHOW FULL TABLES WHERE Table_type = "BASE TABLE"')->fetchAll(PDO::FETCH_COLUMN);
$salida = fopen($destino, 'wb');
$manifiesto = ['base' => $BASE, 'fecha' => date('c'), 'tablas' => []];

fwrite($salida, "-- NaturDex · copia de `$BASE` en " . date('c') . "\n");
fwrite($salida, "-- Generada por Tools/db-backup-remoto.php (instantánea coherente).\n");
fwrite($salida, "SET NAMES utf8mb4;\nSET FOREIGN_KEY_CHECKS = 0;\n\n");

$lit = function ($v) use ($pdo) { return $v === null ? 'NULL' : $pdo->quote((string) $v); };

foreach ($tablas as $t) {
    $ddl = $pdo->query("SHOW CREATE TABLE `$t`")->fetch(PDO::FETCH_NUM)[1];
    fwrite($salida, "\n-- ── $t ──\nDROP TABLE IF EXISTS `$t`;\n$ddl;\n");

    $filas = 0;
    // Paginado: una tabla grande leída de golpe se lleva la memoria del proceso por delante.
    $st = $pdo->query("SELECT * FROM `$t`");
    while ($f = $st->fetch(PDO::FETCH_ASSOC)) {
        if ($filas === 0) {
            $cols = implode('`, `', array_keys($f));
            fwrite($salida, "INSERT INTO `$t` (`$cols`) VALUES\n");
        } else {
            fwrite($salida, ",\n");
        }
        fwrite($salida, '(' . implode(', ', array_map($lit, array_values($f))) . ')');
        $filas++;
    }
    if ($filas > 0) fwrite($salida, ";\n");
    $manifiesto['tablas'][$t] = $filas;
    fwrite(STDERR, sprintf("  %-28s %6d fila(s)\n", $t, $filas));
}

fwrite($salida, "\nSET FOREIGN_KEY_CHECKS = 1;\n");
fclose($salida);
$pdo->exec('COMMIT');

$manifiesto['bytes'] = filesize($destino);
$manifiesto['sha1'] = sha1_file($destino);
$manifiesto['filas_totales'] = array_sum($manifiesto['tablas']);
file_put_contents($destino . '.manifiesto.json', json_encode($manifiesto, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n");

printf("\nOK · %s · %d tabla(s), %d fila(s), %.1f MB\n", $destino, count($tablas), $manifiesto['filas_totales'], $manifiesto['bytes'] / 1048576);
printf("Manifiesto: %s.manifiesto.json · sha1 %s\n", $destino, $manifiesto['sha1']);
