<?php
$host = "localhost";
$db   = "naturadex";
$user = "root";
$pass = "";
$charset = "utf8mb4";

mysqli_report(MYSQLI_REPORT_OFF);
$conn = @new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    http_response_code(500);
    header("Content-Type: application/json; charset=utf-8");
    echo json_encode(["error" => "Database connection error.", "detail" => $conn->connect_error]);
    exit;
}

if (!$conn->set_charset($charset)) {
    http_response_code(500);
    header("Content-Type: application/json; charset=utf-8");
    echo json_encode(["error" => "Database charset error."]);
    exit;
}
?>
