<?php

namespace App\Http\Controllers;

use App\Models\Appeal;
use App\Models\User;
use Illuminate\Http\Request;

class AppealController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'reason' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !\Illuminate\Support\Facades\Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Email atau password salah.'], 401);
        }

        if (!$user->is_suspended) {
            return response()->json(['message' => 'Akun Anda tidak sedang disuspend.'], 400);
        }

        // Check if there's already a pending appeal
        $existing = Appeal::where('user_id', $user->id)->where('status', 'pending')->first();
        if ($existing) {
            return response()->json(['message' => 'Anda sudah memiliki permohonan banding yang sedang diproses.'], 400);
        }

        Appeal::create([
            'user_id' => $user->id,
            'reason' => $request->reason,
        ]);

        return response()->json(['message' => 'Permohonan banding berhasil dikirim. Silakan tunggu peninjauan admin.']);
    }

    public function index()
    {
        $appeals = Appeal::with('user:id,name,email,role,profile_image')->latest()->get();
        return response()->json($appeals);
    }

    public function handle(Request $request, $id)
    {
        $request->validate([
            'action' => 'required|in:approve,reject',
            'admin_notes' => 'nullable|string',
        ]);

        $appeal = Appeal::findOrFail($id);
        $user = $appeal->user;

        if ($request->action === 'approve') {
            $user->update([
                'is_suspended' => false,
                'suspended_reason' => null
            ]);
            $appeal->update([
                'status' => 'approved',
                'admin_notes' => $request->admin_notes
            ]);
            return response()->json(['message' => 'Banding disetujui. Akun user telah diaktifkan kembali.']);
        } else {
            $appeal->update([
                'status' => 'rejected',
                'admin_notes' => $request->admin_notes
            ]);
            return response()->json(['message' => 'Banding ditolak.']);
        }
    }
}
