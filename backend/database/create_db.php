<?php
$host = '127.0.0.1';
$user = 'root';
$pass = '';
$port = 3306;
$link = mysqli_connect($host, $user, $pass, '', $port);
if (! $link) {
    echo 'connect failed: ' . mysqli_connect_error();
    exit(1);
}
$res = mysqli_query($link, "CREATE DATABASE IF NOT EXISTS `tubes_impal` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
if (! $res) {
    echo 'query failed: ' . mysqli_error($link);
    exit(1);
}
echo "OK";
mysqli_close($link);
