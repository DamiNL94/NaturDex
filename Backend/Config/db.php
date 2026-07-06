<?php
$host = "localhost";
$db   = "naturadex";
$user = "root";
$pass = "";
$charset = "utf8mb4";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    http_response_code(500);
    die("Database connection error.");
}

if (!$conn->set_charset($charset)) {
    http_response_code(500);
    die("Database charset error.");
}
?>
