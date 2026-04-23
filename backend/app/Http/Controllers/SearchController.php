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
            ->select('id', 'name', 'username', 'role', 'is_suspended', 'suspended_reason', 'profile_image', 'spesialisasi')
            ->withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->get();

        return response()->json(['results' => $results, 'query' => $q]);
    }

    public function psychologists(Request $request)
    {
        $category = $request->query('category');
        $limit = (int) $request->query('limit', 6);
        $offset = (int) $request->query('offset', 0);

        $limit = max(1, min($limit, 20));
        $offset = max(0, $offset);

        $query = User::query()
            ->where('role', 'psikolog')
            ->where('is_admin', false)
            ->where('is_verified', true)
            ->where('is_rejected', false)
            ->where('is_suspended', false);

        if (!empty($category)) {
            $query->where('spesialisasi', $category);
        }

        $total = (clone $query)->count();
        $psychologists = $query
            ->select('id', 'name', 'username', 'profile_image', 'spesialisasi')
            ->withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->latest()
            ->skip($offset)
            ->take($limit)
            ->get();

        return response()->json([
            'data' => $psychologists,
            'category' => $category,
            'total' => $total,
            'limit' => $limit,
            'offset' => $offset,
            'has_more' => ($offset + $psychologists->count()) < $total,
        ]);
    }
}
