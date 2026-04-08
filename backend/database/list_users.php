<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

$users = User::orderBy('id')->get();
foreach ($users as $u) {
    echo sprintf("%d | %s | username=%s | is_admin=%s | suspended=%s | reason=%s\n",
        $u->id,
        $u->email,
        $u->username ?? '-',
        ($u->is_admin ? '1' : '0'),
        ($u->is_suspended ? '1' : '0'),
        $u->suspended_reason ?? '-'
    );
}

return 0;
