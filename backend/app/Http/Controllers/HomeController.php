<?php

namespace App\Http\Controllers;

use App\Models\User;

class HomeController extends Controller
{
    public function index(\Illuminate\Http\Request $request)
    {
        $me = $request->user();
        return response()->json(['me' => $me]);
    }
}
