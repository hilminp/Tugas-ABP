<?php

namespace App\Http\Controllers;

use App\Models\Friendship;
use App\Models\User;
use App\Models\ConsultationSession;

class FriendshipController extends Controller
{
    public function myPsychologistStatuses(\Illuminate\Http\Request $request)
    {
        $me = $request->user();
        $meId = $me->id;

        // Ambil semua friendship yang dibuat oleh user ini ke psikolog
        // (user_id = me, friend_id = psikolog)
        $outgoing = Friendship::where('user_id', $meId)
            ->with(['recipient:id,role'])
            ->get();

        // Ambil semua friendship dari psikolog ke user ini
        // (user_id = psikolog, friend_id = me) - dibuat saat accept
        $incoming = Friendship::where('friend_id', $meId)
            ->with(['requester:id,role'])
            ->get();

        $statuses = [];

        // Prioritaskan outgoing requests (user → psikolog)
        foreach ($outgoing as $friendship) {
            $otherRole = optional($friendship->recipient)->role;
            if ($otherRole !== 'psikolog') {
                continue;
            }
            $otherUserId = $friendship->friend_id;
            // 'accepted' selalu menang
            if (($statuses[$otherUserId] ?? null) !== 'accepted') {
                $statuses[$otherUserId] = $friendship->status;
            }
        }

        // Proses incoming (psikolog → user), hanya update jika belum ada atau bisa upgrade ke 'accepted'
        foreach ($incoming as $friendship) {
            $otherRole = optional($friendship->requester)->role;
            if ($otherRole !== 'psikolog') {
                continue;
            }
            $otherUserId = $friendship->user_id;
            // Jika ada record dari psikolog ke user dengan status 'accepted',
            // artinya permintaan sudah diterima
            if ($friendship->status === 'accepted') {
                $statuses[$otherUserId] = 'accepted';
            } elseif (!isset($statuses[$otherUserId])) {
                $statuses[$otherUserId] = $friendship->status;
            }
        }

        return response()->json(['statuses' => $statuses]);
    }


    public function send(\Illuminate\Http\Request $request, $id)
    {
        $me = $request->user();
        if ($me->is_admin && $request->query('viewing_as_user')) {
            return response()->json(['message' => 'Admin tidak dapat menambah teman saat mode lihat sebagai user.'], 403);
        }
        if ($me->role !== 'anonim' || !$me->is_premium) {
            return response()->json(['message' => 'Hanya akun anonim Premium yang dapat menambahkan psikolog.'], 403);
        }

        $targetUser = User::find($id);
        if (!$targetUser) {
            return response()->json(['message' => 'Psikolog tidak ditemukan.'], 404);
        }
        if ($targetUser->role !== 'psikolog' || !$targetUser->is_verified || $targetUser->is_rejected || $targetUser->is_suspended) {
            return response()->json(['message' => 'Target bukan psikolog aktif.'], 400);
        }

        $meId = $me->id;
        if ($meId == $id) return response()->json(['message' => 'Tidak bisa menambahkan diri sendiri'], 400);
        
        $existing = Friendship::where('user_id', $meId)->where('friend_id', $id)->first();
        if ($existing) {
            if ($existing->status === 'pending') {
                return response()->json(['message' => 'Permintaan pertemanan sudah ada.']);
            } elseif ($existing->status === 'accepted') {
                return response()->json(['message' => 'Anda sudah berteman dengan psikolog ini.']);
            } elseif ($existing->status === 'rejected') {
                $existing->update([
                    'status' => 'pending',
                    'category' => $request->category,
                    'is_seen' => false
                ]);
                return response()->json(['message' => 'Permintaan pertemanan dikirim ulang.']);
            }
        } else {
            Friendship::create([
                'user_id' => $meId,
                'friend_id' => $id,
                'status' => 'pending',
                'category' => $request->category,
            ]);
            return response()->json(['message' => 'Permintaan pertemanan terkirim.']);
        }
    }

    public function incoming(\Illuminate\Http\Request $request)
    {
        $user = $request->user();
        $meId = $user->id;

        if ($user->role === 'psikolog') {
            // Psikolog hanya melihat permintaan yang masih PENDING (belum diproses)
            $requests = Friendship::where('friend_id', $meId)
                ->where('status', 'pending')
                ->select('friendships.*')
                ->addSelect(['latest_session_status' => ConsultationSession::select('status')
                    ->whereColumn('user_id', 'friendships.user_id')
                    ->whereColumn('psychologist_id', 'friendships.friend_id')
                    ->latest()
                    ->limit(1)
                ])
                ->with(['requester'])
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            // Anonim user melihat semua request yang mereka kirimkan (untuk tracking status)
            $requests = Friendship::where('user_id', $meId)
                ->select('friendships.*')
                ->addSelect(['latest_session_status' => ConsultationSession::select('status')
                    ->whereColumn('user_id', 'friendships.user_id')
                    ->whereColumn('psychologist_id', 'friendships.friend_id')
                    ->latest()
                    ->limit(1)
                ])
                ->with(['recipient'])
                ->orderBy('created_at', 'desc')
                ->get();
        }
        return response()->json(['requests' => $requests]);
    }


    public function notifications(\Illuminate\Http\Request $request)
    {
        $user = $request->user();
        $meId = $user->id;

        if ($user->role === 'psikolog') {
            $count = Friendship::where('friend_id', $meId)
                ->where('status', 'pending')
                ->where('is_seen', false)
                ->count();
        } else {
            $count = Friendship::where('user_id', $meId)
                ->whereIn('status', ['accepted', 'rejected'])
                ->where('is_seen', false)
                ->count();
        }

        return response()->json(['count' => $count]);
    }

    public function markAsSeen(\Illuminate\Http\Request $request)
    {
        $user = $request->user();
        $meId = $user->id;

        if ($user->role === 'psikolog') {
            Friendship::where('friend_id', $meId)
                ->where('status', 'pending')
                ->update(['is_seen' => true]);
        } else {
            Friendship::where('user_id', $meId)
                ->whereIn('status', ['accepted', 'rejected'])
                ->update(['is_seen' => true]);
        }

        return response()->json(['message' => 'Notifications marked as seen.']);
    }

    public function accept(\Illuminate\Http\Request $request, $id)
    {
        if ($request->user()->is_admin && $request->query('viewing_as_user')) {
            return response()->json(['message' => 'Admin tidak dapat mengelola pertemanan saat mode lihat sebagai user.'], 403);
        }
        $meId = $request->user()->id;
        $f = Friendship::where('user_id', $id)->where('friend_id', $meId)->first();
        if (!$f) return response()->json(['message' => 'Permintaan tidak ditemukan'], 404);
        $f->update(['status' => 'accepted', 'is_seen' => false]);
        Friendship::firstOrCreate([
            'user_id' => $meId,
            'friend_id' => $id,
        ], ['status' => 'accepted', 'is_seen' => true]);
        return response()->json(['message' => 'Permintaan pertemanan diterima.']);
    }

    public function reject(\Illuminate\Http\Request $request, $id)
    {
        if ($request->user()->is_admin && $request->query('viewing_as_user')) {
            return response()->json(['message' => 'Admin tidak dapat mengelola pertemanan saat mode lihat sebagai user.'], 403);
        }
        $meId = $request->user()->id;
        $f = Friendship::where('user_id', $id)->where('friend_id', $meId)->first();
        if (!$f) return response()->json(['message' => 'Permintaan tidak ditemukan'], 404);
        $f->update(['status' => 'rejected', 'is_seen' => false]);
        return response()->json(['message' => 'Permintaan pertemanan ditolak.']);
    }
}
