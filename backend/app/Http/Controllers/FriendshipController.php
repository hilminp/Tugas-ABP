<?php

namespace App\Http\Controllers;

use App\Models\Friendship;
use App\Models\User;

class FriendshipController extends Controller
{
    public function myPsychologistStatuses(\Illuminate\Http\Request $request)
    {
        $me = $request->user();
        $meId = $me->id;

        $friendships = Friendship::where(function ($query) use ($meId) {
                $query->where('user_id', $meId)->orWhere('friend_id', $meId);
            })
            ->with(['requester:id,role', 'recipient:id,role'])
            ->get();

        $statuses = [];
        foreach ($friendships as $friendship) {
            $otherUserId = $friendship->user_id === $meId ? $friendship->friend_id : $friendship->user_id;
            $otherRole = $friendship->user_id === $meId
                ? optional($friendship->recipient)->role
                : optional($friendship->requester)->role;

            if ($otherRole !== 'psikolog') {
                continue;
            }

            $currentStatus = $statuses[$otherUserId] ?? null;
            if ($currentStatus === 'accepted') {
                continue;
            }

            $statuses[$otherUserId] = $friendship->status;
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
        if ($me && method_exists($me, 'hasFriendRequestTo') && $me->hasFriendRequestTo($id)) {
            return response()->json(['message' => 'Permintaan pertemanan sudah ada.']);
        }
        Friendship::create([
            'user_id' => $meId,
            'friend_id' => $id,
            'status' => 'pending',
        ]);
        return response()->json(['message' => 'Permintaan pertemanan terkirim.']);
    }

    public function incoming(\Illuminate\Http\Request $request)
    {
        $meId = $request->user()->id;
        $requests = Friendship::where('friend_id', $meId)
            ->where('status', 'pending')
            ->with('requester')
            ->get();
        return response()->json(['requests' => $requests]);
    }

    public function accept(\Illuminate\Http\Request $request, $id)
    {
        if ($request->user()->is_admin && $request->query('viewing_as_user')) {
            return response()->json(['message' => 'Admin tidak dapat mengelola pertemanan saat mode lihat sebagai user.'], 403);
        }
        $meId = $request->user()->id;
        $f = Friendship::where('user_id', $id)->where('friend_id', $meId)->first();
        if (!$f) return response()->json(['message' => 'Permintaan tidak ditemukan'], 404);
        $f->update(['status' => 'accepted']);
        Friendship::firstOrCreate([
            'user_id' => $meId,
            'friend_id' => $id,
        ], ['status' => 'accepted']);
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
        $f->delete();
        return response()->json(['message' => 'Permintaan pertemanan ditolak.']);
    }
}
