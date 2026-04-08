<?php

namespace App\Http\Controllers;

use App\Models\User;

class HomeController extends Controller
{
    public function index()
    {
        $me = User::find(session('user_id'));
        return view('home', ['me' => $me]);
    }
}
