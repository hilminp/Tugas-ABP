<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\PostComment;
use App\Models\PostLike;
use Illuminate\Http\Request;

class PostController extends Controller
{
    public function index(Request $request)
    {
        $posts = Post::with([
                'user:id,name,role,profile_image,username,is_premium',
                'comments' => function ($query) {
                    $query->latest();
                },
                'comments.user:id,name,role,profile_image,username,is_premium',
            ])
            ->withCount(['likes', 'comments'])
            ->latest()
            ->get()
            ->map(function ($post) use ($request) {
                $this->maskAnonymousUser($post->user);
                
                // Cek apakah user saat ini menyukai post ini
                $post->is_liked = $post->likes()->where('user_id', $request->user()->id)->exists();
            ->map(function ($post) {
                $this->maskAnonymousUser($post->user);

                if ($post->comments) {
                    $post->comments->each(function ($comment) {
                        $this->maskAnonymousUser($comment->user);
                    });
                }

                return $post;
            });

        return response()->json($posts);
    }

    public function store(Request $request)
    {
        if ($request->user()->role === 'anonim' && !$request->user()->is_premium) {
            return response()->json(['message' => 'Silakan upgrade akun ke Premium untuk mempublikasikan curhatan Anda.'], 403);
        }

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

        // Muat relasi dan hitung count agar frontend punya data lengkap
        $post->load(['user:id,name,role,profile_image,username,is_premium']);
        $post->loadCount(['likes', 'comments']);
        $post->is_liked = false; // Post baru tentu belum dilike siapapun
        
        // Return the created post with user, and apply the anonim rule
        $post->load('user:id,name,role,profile_image,username,is_premium');
        $this->maskAnonymousUser($post->user);

        return response()->json(['message' => 'Post created successfully', 'post' => $post], 201);
    }

    public function toggleLike(Request $request, $id)
    {
        $post = Post::find($id);
        if (!$post) {
            return response()->json(['message' => 'Post tidak ditemukan.'], 404);
        }

        $existingLike = PostLike::where('post_id', $post->id)
            ->where('user_id', $request->user()->id)
            ->first();

        if ($existingLike) {
            $existingLike->delete();

            return response()->json([
                'message' => 'Like dihapus.',
                'liked' => false,
                'likes_count' => PostLike::where('post_id', $post->id)->count(),
            ]);
        }

        PostLike::create([
            'post_id' => $post->id,
            'user_id' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Post disukai.',
            'liked' => true,
            'likes_count' => PostLike::where('post_id', $post->id)->count(),
        ]);
    }

    public function comment(Request $request, $id)
    {
        $post = Post::find($id);
        if (!$post) {
            return response()->json(['message' => 'Post tidak ditemukan.'], 404);
        }

        $request->validate([
            'content' => 'required|string',
        ]);

        $content = trim((string) $request->content);
        if ($content === '') {
            return response()->json([
                'message' => 'The given data was invalid.',
                'errors' => [
                    'content' => ['Kolom content wajib diisi.'],
                ],
            ], 422);
        }

        $comment = PostComment::create([
            'post_id' => $post->id,
            'user_id' => $request->user()->id,
            'content' => $content,
        ]);

        $comment->load('user:id,name,role,profile_image,username,is_premium');
        $this->maskAnonymousUser($comment->user);

        return response()->json([
            'message' => 'Komentar berhasil ditambahkan.',
            'comment' => $comment,
        ], 201);
    }

    private function maskAnonymousUser($user): void
    {
        if ($user && $user->role === 'anonim') {
            $user->name = $user->is_premium ? "Anonim \u{2B50}" : 'Anonim';
            $user->profile_image = null;
            $user->username = 'anonim';
        }
    }
}
