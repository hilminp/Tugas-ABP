<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class SessionController extends Controller
{
    public function showLogin()
    {
        return view('auth.login');
    }

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
                return back()->withErrors(['suspended' => $msg]);
            }

            if ($user->role == 'psikolog' && !$user->is_verified) {
                return back()->withErrors(['email' => 'Akun Anda belum diverifikasi oleh admin. Silakan tunggu konfirmasi.']);
            }

            session([
                'user_id' => $user->id,
                'user_name' => $user->name,
                'user_role' => $user->role,
                'is_admin' => $user->is_admin,
            ]);

            if ($user->is_admin) {
                return redirect('/admin/dashboard');
            }

            return redirect('/home');
        }

        return back()->withErrors(['email' => 'Email atau password salah']);
    }

    public function logout()
    {
        session()->flush();
        return redirect('/login');
    }
}
