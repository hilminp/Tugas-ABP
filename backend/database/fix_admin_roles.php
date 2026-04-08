<?php
// Usage:
//  php database/fix_admin_roles.php            # apply changes
//  php database/fix_admin_roles.php --dry-run  # report only

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

$dry = in_array('--dry-run', $argv, true);

$totalAdmins = User::where('is_admin', true)->count();
$adminsWithRole = User::where('is_admin', true)->whereNotNull('role')->count();

echo "Total admins: {$totalAdmins}\n";
echo "Admins with non-null role: {$adminsWithRole}\n";

if ($adminsWithRole === 0) {
    echo "Nothing to change.\n";
    return 0;
}

if ($dry) {
    echo "Dry run: would set role = NULL for {$adminsWithRole} admin(s).\n";
    return 0;
}

$updated = User::where('is_admin', true)->whereNotNull('role')->update(['role' => null]);
echo "Updated rows: {$updated}\n";

return 0;
