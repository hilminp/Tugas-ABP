<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\SessionController;
use App\Http\Controllers\RegistrationController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\FriendshipController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ChatbotController;
use Illuminate\Http\Request;

Route::get('/status', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'Sanctuary is ready.',
        'timestamp' => now()->toIso8601String(),
    ]);
});

// Public Auth
Route::post('/login', [SessionController::class, 'login']);
Route::post('/reapply', [SessionController::class, 'reapply']);
Route::post('/register/psikolog', [RegistrationController::class, 'storePsikolog']);
Route::post('/register/anonim', [RegistrationController::class, 'storeAnonim']);
Route::get('/chat/start', [ChatbotController::class, 'start']);
Route::post('/chat/next', [ChatbotController::class, 'next']);
Route::post('/chat/reset', [ChatbotController::class, 'reset']);

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [SessionController::class, 'logout']);

    // Home
    Route::get('/home', [HomeController::class, 'index']);

    // Posts
    Route::get('/posts', [PostController::class, 'index']);
    Route::post('/posts', [PostController::class, 'store']);

    // Profile Management
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::post('/profile/update', [ProfileController::class, 'update']);

    // Payments (Midtrans)
    Route::post('/payment/token', [PaymentController::class, 'getToken']);
    Route::post('/payment/success', [PaymentController::class, 'verifySuccess']);

    // Friendships
    Route::post('/friend/{id}', [FriendshipController::class, 'send']);
    Route::get('/friend-requests', [FriendshipController::class, 'incoming']);
    Route::post('/friend/{id}/accept', [FriendshipController::class, 'accept']);
    Route::post('/friend/{id}/reject', [FriendshipController::class, 'reject']);

    // Messages
    Route::get('/messages', [MessageController::class, 'index']);
    Route::get('/messages/{id}', [MessageController::class, 'thread']);
    Route::post('/messages/{id}', [MessageController::class, 'send']);

    // Search
    Route::get('/search', [SearchController::class, 'index']);

    // Admin Group
    Route::prefix('admin')->middleware(\App\Http\Middleware\EnsureAdmin::class)->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard']);
        Route::get('/verifications', [AdminController::class, 'verifications']);
        Route::post('/verify/{id}', [AdminController::class, 'verify']);
        Route::post('/reject/{id}', [AdminController::class, 'reject']);
        Route::get('/users', [AdminController::class, 'users']);
        Route::post('/user/{id}/toggle-admin', [AdminController::class, 'toggleAdmin']);
        Route::post('/user/{id}/suspend', [AdminController::class, 'suspend']);
        Route::post('/user/{id}/message', [AdminController::class, 'message']);
    });
});
