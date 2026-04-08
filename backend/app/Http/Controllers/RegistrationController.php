<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class RegistrationController extends Controller
{
    public function showRoleSelect()
    {
        return view('register_role_select');
    }

    public function showPsikologForm()
    {
        return view('register_psikolog');
    }

    public function showAnonimForm()
    {
        return view('register_anonim');
    }

    public function storePsikolog(Request $request)
    {
        $request->validate([
            'email' => 'required|email|unique:users,email',
            'username' => 'required|unique:users,username',
            'password' => 'required|min:6|confirmed',
            'str_file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'ijazah_file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240',
        ]);

        $strPath = $request->file('str_file')->store('str_files', 'public');
        $ijazahPath = $request->file('ijazah_file')->store('ijazah_files', 'public');

        User::create([
            'name' => $request->username,
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'psikolog',
            'is_verified' => false,
            'str_file' => $strPath,
            'ijazah_file' => $ijazahPath,
        ]);

        return redirect()->route('login')->with('success', 'Registrasi berhasil! Akun Anda menunggu verifikasi admin. Silakan login setelah diverifikasi.');
    }

    public function storeAnonim(Request $request)
    {
        $request->validate([
            'email' => 'required|email|unique:users,email',
            'username' => 'required|unique:users,username',
            'password' => 'required|min:6|confirmed',
        ]);

        User::create([
            'name' => $request->username,
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'anonim',
            'is_verified' => true,
        ]);

        return redirect()->route('login')->with('success', 'Registrasi berhasil! Silakan login.');
    }
}
