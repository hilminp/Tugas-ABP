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
        
        // Active Session Check
        $isLocked = false;
        $lockMessage = '';
        if ($request->user()->role === 'psikolog' || $friend->role === 'psikolog') {
            $psychologistId = $request->user()->role === 'psikolog' ? $request->user()->id : $friend->id;
            $userId = $request->user()->role === 'psikolog' ? $friend->id : $request->user()->id;

            $now = now();
            $currentTime = $now->toTimeString();
            $oneHourAgoTime = $now->copy()->subHour()->toTimeString();
            $oneHourAgoTimestamp = $now->copy()->subHour();

            $activeSession = \App\Models\ConsultationSession::where('psychologist_id', $psychologistId)
                ->where('user_id', $userId)
                ->where('status', 'booked')
                ->whereNull('ended_at')
                ->where(function($query) use ($now, $currentTime, $oneHourAgoTime, $oneHourAgoTimestamp) {
                    $query->where(function($q) use ($now, $currentTime, $oneHourAgoTime) {
                        $q->where('session_date', $now->toDateString())
                          ->where('session_time', '<=', $currentTime)
                          ->where('session_time', '>', $oneHourAgoTime);
                    })
                    ->orWhere(function($q) use ($oneHourAgoTimestamp) {
                        $q->whereNotNull('started_at')
                          ->where('started_at', '>=', $oneHourAgoTimestamp);
                    });
                })
                ->exists();

            if (!$activeSession) {
                $isLocked = true;
                $lockMessage = 'Chat dikunci. Sesi konsultasi belum dimulai atau sudah berakhir.';
            }
        }

        return response()->json([
            'messages' => $messages, 
            'friend' => $friend,
            'is_locked' => $isLocked,
            'lock_message' => $lockMessage
        ]);
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

        // Chat Lock Logic: Only allow chat if there is an active session
        $sender = $request->user();
        $recipient = User::findOrFail($id);

        if ($sender->role === 'psikolog' || $recipient->role === 'psikolog') {
            $psychologistId = $sender->role === 'psikolog' ? $sender->id : $recipient->id;
            $userId = $sender->role === 'psikolog' ? $recipient->id : $sender->id;

            $now = now();
            $currentTime = $now->toTimeString();
            $oneHourAgoTime = $now->copy()->subHour()->toTimeString();
            $oneHourAgoTimestamp = $now->copy()->subHour();

            $activeSession = \App\Models\ConsultationSession::where('psychologist_id', $psychologistId)
                ->where('user_id', $userId)
                ->where('status', 'booked')
                ->whereNull('ended_at')
                ->where(function($query) use ($now, $currentTime, $oneHourAgoTime, $oneHourAgoTimestamp) {
                    $query->where(function($q) use ($now, $currentTime, $oneHourAgoTime) {
                        $q->where('session_date', $now->toDateString())
                          ->where('session_time', '<=', $currentTime)
                          ->where('session_time', '>', $oneHourAgoTime);
                    })
                    ->orWhere(function($q) use ($oneHourAgoTimestamp) {
                        $q->whereNotNull('started_at')
                          ->where('started_at', '>=', $oneHourAgoTimestamp);
                    });
                })
                ->exists();

            if (!$activeSession) {
                return response()->json(['message' => 'Chat dikunci. Anda hanya dapat mengirim pesan saat sesi konsultasi berlangsung.'], 403);
            }
        }

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
