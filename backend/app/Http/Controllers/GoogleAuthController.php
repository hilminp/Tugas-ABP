<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use App\Models\Appeal;
use Illuminate\Support\Str;

class GoogleAuthController extends Controller
{
    /**
     * Redirect the user to the Google authentication page.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function redirectToGoogle()
    {
        /** @var \Laravel\Socialite\Two\GoogleProvider $driver */
        $driver = Socialite::driver('google');
        $url = $driver
            ->stateless()
            ->with(['prompt' => 'select_account'])
            ->redirect()
            ->getTargetUrl();
        
        return response()->json([
            'url' => $url
        ]);
    }

    /**
     * Handle the callback from Google.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function handleGoogleCallback(Request $request)
    {
        if (!$request->has('code')) {
            return response()->json(['message' => 'Authorization code is missing.'], 400);
        }

        try {
            /** @var \Laravel\Socialite\Two\GoogleProvider $driver */
            $driver = Socialite::driver('google');
            $googleUser = $driver->stateless()->user();
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Google Auth callback exception: ' . $e->getMessage(), [
                'exception' => $e,
                'request' => $request->all()
            ]);
            return response()->json([
                'message' => 'Gagal mengambil data user dari Google.',
                'error' => $e->getMessage()
            ], 422);
        }

        // Try to find the user by google_id
        $user = User::where('google_id', $googleUser->getId())->first();

        if (!$user) {
            // If google_id is not set, look up by email
            $user = User::where('email', $googleUser->getEmail())->first();

            if ($user) {
                // User exists with this email, link the accounts
                $user->google_id = $googleUser->getId();
                // Optionally update profile image if they don't have one
                if (!$user->profile_image) {
                    $user->profile_image = $googleUser->getAvatar();
                }
                $user->save();
            } else {
                // Generate a unique username
                $baseUsername = Str::slug($googleUser->getName() ?: 'user');
                if (empty($baseUsername)) {
                    $baseUsername = 'user';
                }
                
                $username = $baseUsername;
                $counter = 1;
                while (User::where('username', $username)->exists()) {
                    $username = $baseUsername . '-' . Str::random(4) . $counter;
                    $counter++;
                }

                // Create a new user (role: anonim)
                $user = User::create([
                    'name' => $googleUser->getName() ?: $username,
                    'username' => $username,
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'profile_image' => $googleUser->getAvatar(),
                    'role' => 'anonim',
                    'is_verified' => true,
                ]);
            }
        }

        // Check if the user is suspended
        if ($user->is_suspended) {
            $msg = 'Akun Anda telah disuspend oleh admin.';
            if ($user->suspended_reason) {
                $msg .= ' Alasan: ' . $user->suspended_reason;
            }
            
            $latestAppeal = Appeal::where('user_id', $user->id)->latest()->first();
            
            return response()->json([
                'message' => $msg, 
                'is_suspended' => true,
                'appeal_status' => $latestAppeal ? $latestAppeal->status : null,
                'admin_notes' => $latestAppeal ? $latestAppeal->admin_notes : null,
            ], 403);
        }

        // Check if user is a psychologist and wait for verification
        if ($user->role == 'psikolog' && !$user->is_verified) {
            if ($user->is_rejected) {
                return response()->json([
                    'message' => 'Pendaftaran Anda sebagai psikolog ditolak. Alasan: ' . ($user->rejected_reason ?: 'Tidak ada alasan.'),
                    'is_rejected' => true
                ], 403);
            }
            return response()->json(['message' => 'Akun Anda belum diverifikasi oleh admin. Silakan tunggu konfirmasi.'], 403);
        }

        // Create API Sanctum token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'role' => $user->role,
                'is_admin' => $user->is_admin,
            ]
        ]);
    }
}
