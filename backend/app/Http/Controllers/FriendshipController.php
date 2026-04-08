<?php

namespace App\Http\Controllers;

use App\Models\Friendship;
use App\Models\User;

class FriendshipController extends Controller
{
    public function send($id)
    {
        // Block admin while viewing-as-user from sending friend requests
        if (session('is_admin') && session('viewing_as_user')) {
            return back()->withErrors(['friend' => 'Admin tidak dapat menambah teman saat mode lihat sebagai user.']);
        }
        $meId = session('user_id');
        if ($meId == $id) return back()->withErrors(['friend' => 'Tidak bisa menambahkan diri sendiri']);
        $me = User::find($meId);
        if ($me && method_exists($me, 'hasFriendRequestTo') && $me->hasFriendRequestTo($id)) {
            return back()->with('info', 'Permintaan pertemanan sudah ada.');
        }
        Friendship::create([
            'user_id' => $meId,
            'friend_id' => $id,
            'status' => 'pending',
        ]);
        return back()->with('success', 'Permintaan pertemanan terkirim.');
    }

    public function incoming()
    {
        $meId = session('user_id');
        $requests = Friendship::where('friend_id', $meId)
            ->where('status', 'pending')
            ->with('requester')
            ->get();
        return view('friend_requests', ['requests' => $requests]);
    }

    public function accept($id)
    {
        // Block admin while viewing-as-user from accepting requests
        if (session('is_admin') && session('viewing_as_user')) {
            return back()->withErrors(['friend' => 'Admin tidak dapat mengelola pertemanan saat mode lihat sebagai user.']);
        }
        $meId = session('user_id');
        $f = Friendship::where('user_id', $id)->where('friend_id', $meId)->first();
        if (!$f) return back()->withErrors(['friend' => 'Permintaan tidak ditemukan']);
        $f->update(['status' => 'accepted']);
        Friendship::firstOrCreate([
            'user_id' => $meId,
            'friend_id' => $id,
        ], ['status' => 'accepted']);
        return redirect()->back()->with('success', 'Permintaan pertemanan diterima.');
    }

    public function reject($id)
    {
        // Block admin while viewing-as-user from rejecting requests
        if (session('is_admin') && session('viewing_as_user')) {
            return back()->withErrors(['friend' => 'Admin tidak dapat mengelola pertemanan saat mode lihat sebagai user.']);
        }
        $meId = session('user_id');
        $f = Friendship::where('user_id', $id)->where('friend_id', $meId)->first();
        if (!$f) return back()->withErrors(['friend' => 'Permintaan tidak ditemukan']);
        $f->delete();
        return redirect()->back()->with('success', 'Permintaan pertemanan ditolak.');
    }
}
