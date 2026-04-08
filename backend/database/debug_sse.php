<?php
// Small debug script: print conversation messages between two IDs
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Message;

$a = $argv[1] ?? 4;
$b = $argv[2] ?? 6;

$min = min((int)$a, (int)$b);
$max = max((int)$a, (int)$b);

$messages = Message::where(function($q) use ($min, $max) {
    $q->where('sender_id', '>=', $min)->where('sender_id', '<=', $max);
})->where(function($q) use ($min, $max) {
    $q->where('recipient_id', '>=', $min)->where('recipient_id', '<=', $max);
})->orderBy('id')->get();

echo "Conversation {$min}-{$max}:\n";
foreach ($messages as $m) {
    echo json_encode([
        'id' => $m->id,
        'sender' => $m->sender_id,
        'recipient' => $m->recipient_id,
        'body' => $m->body,
        'created_at' => (string)$m->created_at,
    ]) . "\n";
}

echo "Total: " . $messages->count() . "\n";

return 0;
