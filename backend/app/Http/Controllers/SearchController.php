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
            return view('search_results', ['results' => collect(), 'query' => '']);
        }

        $results = User::where('is_admin', false)
            ->where(function($query) use ($q) {
                $query->where('name', 'like', "%{$q}%")
                      ->orWhere('username', 'like', "%{$q}%")
                      ->orWhere('email', 'like', "%{$q}%");
            })
            ->get();

        return view('search_results', ['results' => $results, 'query' => $q]);
    }
}
