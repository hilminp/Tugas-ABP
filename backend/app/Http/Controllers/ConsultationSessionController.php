<?php

namespace App\Http\Controllers;

use App\Models\ConsultationSession;
use App\Models\Friendship;
use App\Models\User;
use Illuminate\Http\Request;

class ConsultationSessionController extends Controller
{
    // Psychologist viewing their own sessions
    public function index(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'psikolog') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $sessions = ConsultationSession::where('psychologist_id', $user->id)
            ->with('user:id,name,username,profile_image')
            ->orderBy('session_date', 'asc')
            ->orderBy('session_time', 'asc')
            ->get();

        return response()->json(['sessions' => $sessions]);
    }

    // Psychologist creating a session
    public function store(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'psikolog') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'session_date' => 'required|date|after_or_equal:today',
            'session_time' => 'required',
        ]);

        $session = ConsultationSession::create([
            'psychologist_id' => $user->id,
            'session_date' => $request->session_date,
            'session_time' => $request->session_time,
            'status' => 'available',
        ]);

        return response()->json(['message' => 'Sesi berhasil dibuat', 'session' => $session]);
    }

    // User viewing available sessions for a psychologist
    public function availableSessions(Request $request, $psychologistId)
    {
        $user = $request->user();
        
        // Check if user is premium
        if (!$user->is_premium) {
             return response()->json(['message' => 'Hanya user premium yang bisa melihat jadwal.'], 403);
        }

        // Check if there is an accepted friendship/consultation request
        $isConnected = Friendship::where(function($q) use ($user, $psychologistId) {
            $q->where('user_id', $user->id)->where('friend_id', $psychologistId);
        })->orWhere(function($q) use ($user, $psychologistId) {
            $q->where('user_id', $psychologistId)->where('friend_id', $user->id);
        })->where('status', 'accepted')->exists();

        if (!$isConnected) {
            return response()->json(['message' => 'Anda harus terhubung dengan psikolog ini terlebih dahulu.'], 403);
        }

        $sessions = ConsultationSession::where('psychologist_id', $psychologistId)
            ->where('status', 'available')
            ->where('session_date', '>=', now()->toDateString())
            ->orderBy('session_date', 'asc')
            ->orderBy('session_time', 'asc')
            ->get();

        return response()->json(['sessions' => $sessions]);
    }

    // User booking a session
    public function book(Request $request, $sessionId)
    {
        $user = $request->user();
        if (!$user->is_premium) {
            return response()->json(['message' => 'Hanya user premium yang bisa memesan sesi.'], 403);
        }

        $session = ConsultationSession::findOrFail($sessionId);
        if ($session->status !== 'available') {
            return response()->json(['message' => 'Sesi tidak tersedia.'], 400);
        }

        // Check connection
        $isConnected = Friendship::where(function($q) use ($user, $session) {
            $q->where('user_id', $user->id)->where('friend_id', $session->psychologist_id);
        })->orWhere(function($q) use ($user, $session) {
            $q->where('user_id', $session->psychologist_id)->where('friend_id', $user->id);
        })->where('status', 'accepted')->exists();

        if (!$isConnected) {
             return response()->json(['message' => 'Anda belum terhubung dengan psikolog ini.'], 403);
        }

        $session->update([
            'user_id' => $user->id,
            'status' => 'pending_approval',
            'is_seen' => false,
        ]);

        return response()->json(['message' => 'Permintaan sesi berhasil dikirim. Menunggu persetujuan psikolog.', 'session' => $session]);
    }

    // Psychologist approving a session request
    public function approve(Request $request, $sessionId)
    {
        $user = $request->user();
        $session = ConsultationSession::findOrFail($sessionId);

        if ($user->id !== $session->psychologist_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($session->status !== 'pending_approval') {
            return response()->json(['message' => 'Sesi tidak dalam status menunggu persetujuan.'], 400);
        }

        $session->update([
            'status' => 'booked',
            'is_seen' => false,
        ]);

        return response()->json(['message' => 'Sesi berhasil dikonfirmasi.', 'session' => $session]);
    }

    // Psychologist starting a session manually (Chat Now)
    public function start(Request $request, $sessionId)
    {
        $user = $request->user();
        $session = ConsultationSession::findOrFail($sessionId);

        if ($user->id !== $session->psychologist_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($session->status !== 'booked') {
            return response()->json(['message' => 'Sesi harus disetujui terlebih dahulu.'], 400);
        }

        $session->update(['started_at' => now()]);

        return response()->json(['message' => 'Sesi dimulai. Chat sekarang sudah terbuka.', 'session' => $session]);
    }

    // Psychologist ending a session manually
    public function end(Request $request, $sessionId)
    {
        $user = $request->user();
        $session = ConsultationSession::findOrFail($sessionId);

        if ($user->id !== $session->psychologist_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $session->update([
            'ended_at' => now(),
            'status' => 'completed',
            'is_seen' => false,
        ]);

        return response()->json(['message' => 'Sesi telah berakhir. Chat telah dikunci.', 'session' => $session]);
    }

    // Psychologist or User cancelling a session
    public function cancel(Request $request, $sessionId)
    {
        $user = $request->user();
        $session = ConsultationSession::findOrFail($sessionId);

        if ($user->id !== $session->psychologist_id && $user->id !== $session->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($user->role === 'psikolog') {
            // Psychologist cancels, delete it
            $session->delete(); 
            return response()->json(['message' => 'Sesi berhasil dihapus.']);
        } else {
            // User cancels booking
            $session->update([
                'user_id' => null,
                'status' => 'available',
            ]);
            return response()->json(['message' => 'Pemesanan sesi berhasil dibatalkan.']);
        }
    }

    // User viewing their own booked sessions (excluding completed ones)
    public function myBookedSessions(Request $request)
    {
        $user = $request->user();
        $sessions = ConsultationSession::where('user_id', $user->id)
            ->where('status', '!=', 'completed')
            ->with('psychologist:id,name,username,profile_image,spesialisasi')
            ->orderBy('session_date', 'asc')
            ->orderBy('session_time', 'asc')
            ->get();

        return response()->json(['sessions' => $sessions]);
    }

    public function notifications(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'psikolog') {
            // Notifications for psychologist: new bookings (pending_approval) that are unseen
            $count = ConsultationSession::where('psychologist_id', $user->id)
                ->where('status', 'pending_approval')
                ->where('is_seen', false)
                ->count();
        } else {
            // Notifications for user: accepted bookings (booked) or completed that are unseen
            $count = ConsultationSession::where('user_id', $user->id)
                ->whereIn('status', ['booked', 'completed'])
                ->where('is_seen', false)
                ->count();
        }

        return response()->json(['count' => $count]);
    }

    public function markAsSeen(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'psikolog') {
            ConsultationSession::where('psychologist_id', $user->id)
                ->where('status', 'pending_approval')
                ->update(['is_seen' => true]);
        } else {
            ConsultationSession::where('user_id', $user->id)
                ->whereIn('status', ['booked', 'completed'])
                ->update(['is_seen' => true]);
        }

        return response()->json(['message' => 'Notifikasi jadwal ditandai telah dilihat.']);
    }
}
