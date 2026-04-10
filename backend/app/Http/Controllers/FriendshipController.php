<?php

namespace App\Http\Controllers;

use App\Models\Friendship;
use App\Models\User;

class FriendshipController extends Controller
{
    public function send(\Illuminate\Http\Request $request, $id)
    {
        $me = $request->user();
        if ($me->is_admin && $request->query('viewing_as_user')) {
            return response()->json(['message' => 'Admin tidak dapat menambah teman saat mode lihat sebagai user.'], 403);
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
