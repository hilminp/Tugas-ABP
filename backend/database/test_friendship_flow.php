<?php
$mysqli = new mysqli('127.0.0.1', 'root', '', 'tubes_impal');
if ($mysqli->connect_errno) {
    echo "ERROR: " . $mysqli->connect_error . PHP_EOL;
    exit(1);
}

function createUserIfNotExists($mysqli, $email, $name, $username) {
    $stmt = $mysqli->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $res = $stmt->get_result();
    if ($row = $res->fetch_assoc()) {
        $stmt->close();
        return (int)$row['id'];
    }
    $stmt->close();
    $pw = password_hash('password123', PASSWORD_DEFAULT);
    $stmt = $mysqli->prepare('INSERT INTO users (name, username, email, password, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())');
    $stmt->bind_param('ssss', $name, $username, $email, $pw);
    $stmt->execute();
    $id = $mysqli->insert_id;
    $stmt->close();
    return (int)$id;
}

$u1 = createUserIfNotExists($mysqli, 'testuser1@example.com', 'Test User 1', 'testuser1');
$u2 = createUserIfNotExists($mysqli, 'testuser2@example.com', 'Test User 2', 'testuser2');

echo "users: $u1, $u2\n";

// create a friend request from u1 -> u2
$stmt = $mysqli->prepare('SELECT id FROM friendships WHERE user_id = ? AND friend_id = ?');
$stmt->bind_param('ii', $u1, $u2);
$stmt->execute();
$res = $stmt->get_result();
if ($res->fetch_assoc()) {
    echo "friendship already exists (u1->u2)\n";
} else {
    $stmt->close();
    $stmt = $mysqli->prepare('INSERT INTO friendships (user_id, friend_id, status, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())');
    $status = 'pending';
    $stmt->bind_param('iis', $u1, $u2, $status);
    $ok = $stmt->execute();
    if (!$ok) echo "INSERT ERROR: " . $mysqli->error . PHP_EOL;
    else echo "inserted friendship u1->u2\n";
    $stmt->close();
}

// show friendship count and rows
$res = $mysqli->query('SELECT COUNT(*) as cnt FROM friendships');
$row = $res->fetch_assoc();
echo "friendships_count=" . $row['cnt'] . PHP_EOL;
$res = $mysqli->query('SELECT id, user_id, friend_id, status, created_at FROM friendships ORDER BY id DESC LIMIT 10');
while ($r = $res->fetch_assoc()) {
    echo json_encode($r) . PHP_EOL;
}

$mysqli->close();
