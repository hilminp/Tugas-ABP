<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

$id = (int) ($argv[1] ?? 1);
$u = User::find($id);
if (!$u) {
    echo "User {$id} not found\n";
    exit(1);
}
$u->update(['is_admin' => true]);
echo "User {$id} is now admin\n";
return 0;
