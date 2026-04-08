<?php
// Lightweight script to create an admin user in the database.
// Usage: php database/create_admin.php [email] [username] [password]
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$email = $argv[1] ?? 'admin@example.com';
$username = $argv[2] ?? 'admin';
$password = $argv[3] ?? 'password';

$u = User::where('email', $email)->first();
if (!$u) {
    $u = User::create([
        'name' => 'Administrator',
        'username' => $username,
        'email' => $email,
        'password' => Hash::make($password),
        'is_admin' => true,
    ]);
    echo "Created admin user: id={$u->id}, email={$u->email}\n";
} else {
    $u->update(['is_admin' => true, 'username' => $username, 'password' => Hash::make($password)]);
    echo "Updated user id={$u->id} to admin (email={$u->email})\n";
}

// helper: print a short reminder
echo "Admin created / updated. Please change the password when you log in.\n";

return 0;
