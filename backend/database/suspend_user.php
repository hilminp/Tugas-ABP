<?php
// Usage: php database/suspend_user.php <user_id> <reason>
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

$id = (int) ($argv[1] ?? 0);
$reason = $argv[2] ?? 'Suspended by admin';
if (!$id) {
    echo "Usage: php database/suspend_user.php <user_id> <reason>\n";
    exit(2);
}

$u = User::find($id);
if (!$u) { echo "User {$id} not found\n"; exit(1); }
$u->update(['is_suspended' => true, 'suspended_reason' => $reason]);
echo "User {$id} suspended. Reason: {$reason}\n";
return 0;
