<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class SearchController extends Controller
{
    public function index(Request $request)
    {
        $q = $request->query('q');
        if (!$q) {
            return response()->json(['results' => [], 'query' => '']);
        }

        $results = User::where('is_admin', false)
            ->where(function($query) use ($q) {
                $query->where('name', 'like', "%{$q}%")
                      ->orWhere('username', 'like', "%{$q}%")
                      ->orWhere('email', 'like', "%{$q}%");
            })
            ->get();

        return response()->json(['results' => $results, 'query' => $q]);
    }
}
