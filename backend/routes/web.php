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
use App\Http\Middleware\EnsureSessionAuthenticated;
use App\Http\Middleware\EnsureAdmin;

Route::get('/', function () {
    return view('welcome');
});

// Auth & Registration
Route::get('/login', [SessionController::class, 'showLogin'])->name('login');
Route::post('/login', [SessionController::class, 'login']);
Route::post('/logout', [SessionController::class, 'logout'])->name('logout');

Route::get('/register', [RegistrationController::class, 'showRoleSelect'])->name('register');
Route::get('/register/psikolog', [RegistrationController::class, 'showPsikologForm'])->name('register.psikolog');
Route::post('/register/psikolog', [RegistrationController::class, 'storePsikolog'])->name('register.psikolog.post');
Route::get('/register/anonim', [RegistrationController::class, 'showAnonimForm'])->name('register.anonim');
Route::post('/register/anonim', [RegistrationController::class, 'storeAnonim'])->name('register.anonim.post');

// Home (auth)
Route::middleware([EnsureSessionAuthenticated::class])->group(function () {
    Route::get('/home', [HomeController::class, 'index'])->name('home');

    // Profile Management
    Route::get('/api/profile', [ProfileController::class, 'show']);
    Route::post('/api/profile/update', [ProfileController::class, 'update']);

    // Friendships (auth)
    Route::post('/friend/{id}', [FriendshipController::class, 'send']);
    Route::get('/friend-requests', [FriendshipController::class, 'incoming'])->name('friend.requests');
    Route::post('/friend/{id}/accept', [FriendshipController::class, 'accept']);
    Route::post('/friend/{id}/reject', [FriendshipController::class, 'reject']);

    // Messages (auth)
    Route::get('/messages', [MessageController::class, 'index'])->name('messages.index');
    Route::get('/messages/{id}', [MessageController::class, 'thread'])->name('messages.thread');
    Route::post('/messages/{id}', [MessageController::class, 'send']);
});

// Admin
Route::prefix('admin')->middleware([EnsureAdmin::class])->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('admin.dashboard');
    Route::get('/view-as-user', [AdminController::class, 'viewAsUser'])->name('admin.view-as-user');
    Route::get('/exit-view', [AdminController::class, 'exitView'])->name('admin.exit-view');
    Route::get('/verifications', [AdminController::class, 'verifications'])->name('admin.verifications');
    Route::post('/verify/{id}', [AdminController::class, 'verify'])->name('admin.verify');
    Route::post('/reject/{id}', [AdminController::class, 'reject'])->name('admin.reject');
    Route::get('/users', [AdminController::class, 'users'])->name('admin.users');
    Route::post('/user/{id}/toggle-admin', [AdminController::class, 'toggleAdmin'])->name('admin.user.toggle');
    Route::post('/user/{id}/suspend', [AdminController::class, 'suspend'])->name('admin.user.suspend');
    Route::post('/user/{id}/message', [AdminController::class, 'message'])->name('admin.user.message');
});

// Search
Route::get('/search', [SearchController::class, 'index'])->name('search');

use App\Http\Controllers\Api\TestController;

Route::get('/test', [TestController::class, 'index']);

// Messages & friendships are now under auth group
