<?php
// Usage: php database/send_admin_message.php <admin_id> <recipient_id> "message body"
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Message;

$admin = (int) ($argv[1] ?? 1);
$recipient = (int) ($argv[2] ?? 2);
$body = $argv[3] ?? 'This account is suspended by admin.';

$m = Message::create(['sender_id' => $admin, 'recipient_id' => $recipient, 'body' => $body]);
echo "Message created id={$m->id} sender={$m->sender_id} recipient={$m->recipient_id}\n";

try { event(new App\Events\MessageSent($m)); } catch (\Throwable $e) { echo "Broadcast failed: {$e->getMessage()}\n"; }

return 0;
