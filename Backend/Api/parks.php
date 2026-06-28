<?php
header("Content-Type: application/json");
require_once "../config/db.php";

$sql = "SELECT * FROM parks";
$result = $conn->query($sql);

$parks = [];

while ($row = $result->fetch_assoc()) {
    $parks[] = $row;
}

echo json_encode($parks);
?>