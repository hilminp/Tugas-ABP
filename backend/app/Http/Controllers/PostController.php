<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;

class PostController extends Controller
{
    public function index()
    {
        $posts = Post::with('user:id,name,role,profile_image,username')
            ->latest()
            ->get()
            ->map(function ($post) {
                // If user role is anonim, alter their name and profile image shown in feed
                if ($post->user && $post->user->role === 'anonim') {
                    $post->user->name = 'Anonim';
                    $post->user->profile_image = null; // optionally hide their avatar
                    $post->user->username = 'anonim';
                }
                return $post;
            });

        return response()->json($posts);
    }

    public function store(Request $request)
    {
        $request->validate([
            'body' => 'required|string',
            'image' => 'nullable|file|mimes:jpg,jpeg,png,webp|max:10240',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('post_images', 'public');
        }

        $post = Post::create([
            'user_id' => $request->user()->id,
            'body' => $request->body,
            'image' => $imagePath,
        ]);

        // Return the created post with user, and apply the anonim rule
        $post->load('user:id,name,role,profile_image,username');
        if ($post->user && $post->user->role === 'anonim') {
            $post->user->name = 'Anonim';
            $post->user->profile_image = null;
            $post->user->username = 'anonim';
        }

        return response()->json(['message' => 'Post created successfully', 'post' => $post], 201);
    }
}
