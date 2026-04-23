<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Review;
use App\Models\User;

class ReviewController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'psikolog') {
            return response()->json(['message' => 'Hanya psikolog yang dapat melihat statistik review mereka.'], 403);
        }

        $reviews = Review::where('psychologist_id', $user->id)
            ->with(['patient' => function($query) {
                $query->select('id', 'name', 'profile_image');
            }])
            ->orderBy('created_at', 'desc')
            ->get();

        $averageRating = Review::where('psychologist_id', $user->id)->avg('rating') ?: 0;
        $totalReviews = Review::where('psychologist_id', $user->id)->count();

        return response()->json([
            'reviews' => $reviews,
            'average_rating' => round($averageRating, 1),
            'total_reviews' => $totalReviews,
        ]);
    }

    public function store(Request $request, $psychologistId)
    {
        $patient = $request->user();
        if ($patient->role !== 'anonim') {
             return response()->json(['message' => 'Hanya pasien yang dapat memberikan review.'], 403);
        }

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
            'is_anonymous' => 'nullable|boolean',
        ]);

        $review = Review::create([
            'psychologist_id' => $psychologistId,
            'patient_id' => $patient->id,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'] ?? null,
            'is_anonymous' => $request->has('is_anonymous') ? $validated['is_anonymous'] : true,
        ]);

        return response()->json([
            'message' => 'Review berhasil dikirim.',
            'review' => $review
        ]);
    }
}
