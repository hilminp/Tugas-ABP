<?php
$host = '127.0.0.1';
$user = 'root';
$pass = '';
$db = 'tubes_impal';
$port = 3306;
$link = mysqli_connect($host, $user, $pass, $db, $port);
if (! $link) {
    echo 'connect failed: ' . mysqli_connect_error();
    exit(1);
}
$res = mysqli_query($link, "DROP TABLE IF EXISTS `sessions`");
if (! $res) {
    echo 'drop failed: ' . mysqli_error($link);
    exit(1);
}
echo "DROPPED";
mysqli_close($link);
