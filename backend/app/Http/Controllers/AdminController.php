<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Message;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function dashboard()
    {

        $totalUsers = User::count();
        $totalPsikolog = User::where('role', 'psikolog')->where('is_admin', false)->count();
        $totalAnonim = User::where('role', 'anonim')->where('is_admin', false)->count();
        $pendingCount = User::where('role', 'psikolog')->where('is_admin', false)->where('is_verified', false)->count();
        $pendingPsikolog = User::where('role', 'psikolog')->where('is_admin', false)->where('is_verified', false)->latest()->get();
        $recentUsers = User::latest()->take(10)->get();

        return response()->json(compact('totalUsers', 'totalPsikolog', 'totalAnonim', 'pendingCount', 'pendingPsikolog', 'recentUsers'));
    }

    public function verifications()
    {
        $pendingCount = User::where('role', 'psikolog')->where('is_admin', false)->where('is_verified', false)->count();
        $pendingPsikolog = User::where('role', 'psikolog')->where('is_admin', false)->where('is_verified', false)->latest()->get();
        $verifiedPsikolog = User::where('role', 'psikolog')->where('is_admin', false)->where('is_verified', true)->latest()->take(10)->get();
        return response()->json(compact('pendingCount', 'pendingPsikolog', 'verifiedPsikolog'));
    }

    public function verify($id)
    {
        $user = User::findOrFail($id);
        if ($user->role != 'psikolog') {
            return response()->json(['message' => 'User ini bukan psikolog'], 400);
        }
        $user->update(['is_verified' => true]);
        return response()->json(['message' => 'Psikolog ' . $user->name . ' berhasil diverifikasi!']);
    }

    public function reject($id)
    {
        $user = User::findOrFail($id);
        if ($user->role != 'psikolog') {
            return response()->json(['message' => 'User ini bukan psikolog'], 400);
        }
        $name = $user->name;
        $user->delete();
        return response()->json(['message' => 'Verifikasi psikolog ' . $name . ' ditolak dan akun dihapus.']);
    }

    public function users(Request $request)
    {
        $users = User::latest()->get();
        $me = $request->user();
        return response()->json(compact('users', 'me'));
    }

    public function toggleAdmin(Request $request, $id)
    {
        $meId = $request->user()->id;
        $u = User::find($id);
        if (!$u) return response()->json(['message' => 'User not found'], 404);
        if ($u->id == $meId && $u->is_admin && $request->input('allow_self_demote') !== '1') {
            return response()->json(['message' => 'Cannot demote yourself from admin.'], 400);
        }
        $u->update(['is_admin' => !$u->is_admin]);
        return response()->json(['message' => 'Updated user admin status.']);
    }

    public function suspend(Request $request, $id)
    {
        $u = User::find($id);
        if (!$u) return response()->json(['message' => 'User not found'], 404);
        $action = $request->input('action', 'suspend');
        if ($action === 'suspend') {
            $reason = (string) $request->input('reason');
            $u->update(['is_suspended' => true, 'suspended_reason' => $reason]);
        } else {
            $u->update(['is_suspended' => false, 'suspended_reason' => null]);
        }
        return response()->json(['message' => 'User suspension status updated.']);
    }

    public function message(Request $request, $id)
    {
        $request->validate(['body' => 'required|string']);
        $meId = $request->user()->id;
        $u = User::find($id);
        if (!$u) return response()->json(['message' => 'User not found'], 404);
        $clean = trim((string) $request->body);
        $clean = preg_replace("/(\r?\n){3,}/", "\n\n", $clean);
        $message = Message::create([
            'sender_id' => $meId,
            'recipient_id' => $id,
            'body' => $clean,
        ]);
        try { event(new \App\Events\MessageSent($message)); } catch (\Throwable $e) { logger()->warning('Broadcast failed: ' . $e->getMessage()); }
        return response()->json(['message' => 'Message sent to user.']);
    }
}
