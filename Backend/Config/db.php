<?php
$host = "localhost";
$db   = "naturadex";
$user = "root";
$pass = "";
$charset = "utf8mb4";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("Error de conexión: " . $conn->connect_error);
}
?>