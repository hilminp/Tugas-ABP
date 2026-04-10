<?php

namespace App\Http\Controllers;

use App\Models\Friendship;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function index(Request $request)
    {
        $meId = $request->user()->id;
        $friendIds = Friendship::where(function($q) use ($meId) {
            $q->where('user_id', $meId)->where('status', 'accepted');
        })->orWhere(function($q) use ($meId) {
            $q->where('friend_id', $meId)->where('status', 'accepted');
        })->get()->map(function($f) use ($meId) {
            return $f->user_id == $meId ? $f->friend_id : $f->user_id;
        })->unique()->values();

        $friends = User::whereIn('id', $friendIds)->get();
        return response()->json(['friends' => $friends]);
    }

    public function thread(Request $request, $id)
    {
        $meId = $request->user()->id;
        $isFriend = Friendship::where(function($q) use ($meId, $id) {
            $q->where('user_id', $meId)->where('friend_id', $id)->where('status', 'accepted');
        })->orWhere(function($q) use ($meId, $id) {
            $q->where('user_id', $id)->where('friend_id', $meId)->where('status', 'accepted');
        })->exists();
        if (!$isFriend) return response()->json(['message' => 'Anda bukan teman dengan user ini'], 403);
        $messages = Message::where(function($q) use ($meId, $id) {
            $q->where('sender_id', $meId)->where('recipient_id', $id);
        })->orWhere(function($q) use ($meId, $id) {
            $q->where('sender_id', $id)->where('recipient_id', $meId);
        })->orderBy('created_at')->get();
        $friend = User::find($id);
        return response()->json(['messages' => $messages, 'friend' => $friend]);
    }

    public function send(Request $request, $id)
    {
        $meId = $request->user()->id;
        $request->validate(['body' => 'required|string']);
        $isFriend = Friendship::where(function($q) use ($meId, $id) {
            $q->where('user_id', $meId)->where('friend_id', $id)->where('status', 'accepted');
        })->orWhere(function($q) use ($meId, $id) {
            $q->where('user_id', $id)->where('friend_id', $meId)->where('status', 'accepted');
        })->exists();
        if (!$isFriend) return response()->json(['message' => 'Anda bukan teman dengan user ini'], 403);

        // Sanitize: trim spaces and trailing newlines to avoid tall bubbles
        $clean = trim((string) $request->body);
        // Collapse 3+ consecutive blank lines into max 1 blank line
        $clean = preg_replace("/(\r?\n){3,}/", "\n\n", $clean);

        $msg = Message::create([
            'sender_id' => $meId,
            'recipient_id' => $id,
            'body' => $clean,
        ]);
        return response()->json(['message' => 'Pesan terkirim', 'msg' => $msg]);
    }
}
