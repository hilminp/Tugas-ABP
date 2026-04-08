<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Message;

class MessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Message $message;

    /**
     * Create a new event instance.
     */
    public function __construct(Message $message)
    {
        $this->message = $message;
    }

    /**
     * The data sent with the broadcasted event.
     * Laravel will JSON-serialize the public properties automatically,
     * but we prefer to control the payload using broadcastWith.
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->message->id,
            'sender_id' => $this->message->sender_id,
            'recipient_id' => $this->message->recipient_id,
            'body' => $this->message->body,
            'created_at' => (string) $this->message->created_at,
        ];
    }

    /**
     * Determine which channel the event should broadcast on.
     * We'll use a public channel named chat.{min}.{max} where min/max are
     * the numeric pair of the two users in the conversation. Using a
     * consistent pair key makes it easy to discover the channel on both
     * the sender and recipient side.
     */
    public function broadcastOn(): Channel
    {
        $a = (int) min($this->message->sender_id, $this->message->recipient_id);
        $b = (int) max($this->message->sender_id, $this->message->recipient_id);
        return new Channel("chat.{$a}.{$b}");
    }
}
