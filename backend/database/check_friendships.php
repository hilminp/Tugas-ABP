<?php
$mysqli = new mysqli('127.0.0.1', 'root', '', 'tubes_impal');
if ($mysqli->connect_errno) {
    echo "ERROR: " . $mysqli->connect_error . PHP_EOL;
    exit(1);
}
$res = $mysqli->query("SELECT COUNT(*) as cnt FROM friendships");
if (!$res) {
    echo "ERROR: " . $mysqli->error . PHP_EOL;
    exit(1);
}
$row = $res->fetch_assoc();
echo "friendships_count=" . $row['cnt'] . PHP_EOL;
$res->close();
$mysqli->close();
