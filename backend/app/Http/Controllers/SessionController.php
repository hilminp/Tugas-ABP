<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class SessionController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();
        if ($user && Hash::check($request->password, $user->password)) {
            if ($user->is_suspended) {
                $msg = 'Akun Anda telah disuspend oleh admin.';
                if ($user->suspended_reason) $msg .= ' Alasan: ' . $user->suspended_reason;
                return response()->json(['message' => $msg, 'is_suspended' => true], 403);
            }

            if ($user->role == 'psikolog' && !$user->is_verified) {
                if ($user->is_rejected) {
                    return response()->json([
                        'message' => 'Pendaftaran Anda sebagai psikolog ditolak. Alasan: ' . ($user->rejected_reason ?: 'Tidak ada alasan.'),
                        'is_rejected' => true
                    ], 403);
                }
                return response()->json(['message' => 'Akun Anda belum diverifikasi oleh admin. Silakan tunggu konfirmasi.'], 403);
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'role' => $user->role,
                    'is_admin' => $user->is_admin,
                ]
            ]);
        }

        return response()->json(['message' => 'Email atau password salah'], 401);
    }

    public function logout(Request $request)
    {
        if ($request->user()) {
            $request->user()->currentAccessToken()->delete();
        }
        return response()->json(['message' => 'Logged out successfully']);
    }

    public function reapply(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);
        
        $user = User::where('email', $request->email)->first();
        if ($user && Hash::check($request->password, $user->password) && $user->is_rejected) {
            // Delete the rejected user so they can completely re-register with the same email
            $user->delete();
            return response()->json(['message' => 'Akun lama berhasil dihapus. Anda sekarang dapat mendaftar ulang.']);
        }
        return response()->json(['message' => 'Tidak valid.'], 400);
    }
}
