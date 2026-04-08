<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Cek apakah sudah ada admin
$adminExists = DB::table('users')->where('email', 'admin@curhatin.com')->exists();

if ($adminExists) {
    echo "✓ Admin sudah ada di database\n";
    echo "Email: admin@curhatin.com\n";
    echo "Password: admin123\n\n";
    echo "Silakan login untuk testing!\n";
} else {
    echo "Membuat user admin baru...\n";
    DB::table('users')->insert([
        'name' => 'Admin Curhatin',
        'username' => 'admin',
        'email' => 'admin@curhatin.com',
        'password' => password_hash('admin123', PASSWORD_BCRYPT),
        'role' => 'anonim',
        'is_verified' => 1,
        'is_admin' => 1,
        'created_at' => date('Y-m-d H:i:s'),
        'updated_at' => date('Y-m-d H:i:s'),
    ]);
    echo "✓ Admin berhasil dibuat!\n\n";
    echo "=================================\n";
    echo "Email: admin@curhatin.com\n";
    echo "Password: admin123\n";
    echo "=================================\n\n";
    echo "Login di: http://localhost:8000/login\n";
}
