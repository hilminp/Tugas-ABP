<?php
// Usage:
//  php database/normalize_messages.php            # real run (updates rows)
//  php database/normalize_messages.php --dry-run  # only reports, no updates

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Message;

$dry = in_array('--dry-run', $argv, true);

$total = 0; $changed = 0; $updated = 0;

Message::orderBy('id')->chunk(500, function ($chunk) use (&$total, &$changed, &$updated, $dry) {
    foreach ($chunk as $m) {
        $total++;
        $orig = (string) $m->body;
        $clean = trim($orig);
        $clean = preg_replace("/(\r?\n){3,}/", "\n\n", $clean);
        if ($clean !== $orig) {
            $changed++;
            if (!$dry) {
                $m->body = $clean;
                $m->save();
                $updated++;
            }
        }
    }
});

echo "Messages scanned: {$total}\n";
if ($dry) {
    echo "Rows needing change: {$changed} (dry run)\n";
} else {
    echo "Rows updated: {$updated}\n";
}

return 0;
