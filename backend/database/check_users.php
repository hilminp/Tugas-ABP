<?php
$host = '127.0.0.1';
$user = 'root';
$pass = '';
$db = 'tubes_impal';
$port = 3306;
$link = mysqli_connect($host, $user, $pass, $db, $port);
if (! $link) {
    echo 'connect failed: ' . mysqli_connect_error() . PHP_EOL;
    exit(1);
}
$res = mysqli_query($link, "SELECT COUNT(*) AS cnt FROM users");
if (! $res) {
    echo 'query failed: ' . mysqli_error($link) . PHP_EOL;
    exit(1);
}
$row = mysqli_fetch_assoc($res);
echo 'users_count=' . ($row['cnt'] ?? 0) . PHP_EOL;
$res2 = mysqli_query($link, "SELECT id, name, email, created_at FROM users ORDER BY id DESC LIMIT 5");
if ($res2) {
    echo "last_5_users:\n";
    while ($r = mysqli_fetch_assoc($res2)) {
        echo implode(' | ', [$r['id'] ?? '', $r['name'] ?? '', $r['email'] ?? '', $r['created_at'] ?? '']) . PHP_EOL;
    }
}
mysqli_close($link);
