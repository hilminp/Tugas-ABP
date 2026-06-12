<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Friendship;
use App\Models\ConsultationSession;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $notifications = [];

        if ($user->role === 'psikolog') {
            // 1. Incoming Friendship Requests (pending)
            $friendships = Friendship::where('friend_id', $user->id)
                ->where('status', 'pending')
                ->with('requester:id,name,profile_image')
                ->get();

            foreach ($friendships as $f) {
                $notifications[] = [
                    'id' => 'friend_' . $f->id,
                    'type' => 'friendship',
                    'title' => 'Permintaan Konsultasi Baru',
                    'message' => 'Pengguna ' . ($f->requester->name ?? 'Anonim') . ' mengajukan konsultasi dengan kategori: ' . ($f->category ?? 'Tidak ditentukan') . '.',
                    'is_seen' => (bool)$f->is_seen,
                    'created_at' => $f->updated_at->toIso8601String(),
                ];
            }

            // 2. Pending Approval Consultation Sessions
            $sessions = ConsultationSession::where('psychologist_id', $user->id)
                ->where('status', 'pending_approval')
                ->with('user:id,name,profile_image')
                ->get();

            foreach ($sessions as $s) {
                $notifications[] = [
                    'id' => 'session_' . $s->id,
                    'type' => 'session',
                    'title' => 'Pemesanan Jadwal Baru',
                    'message' => 'Pengguna ' . ($s->user->name ?? 'Anonim') . ' memesan jadwal sesi pada ' . $s->session_date . ' jam ' . $s->session_time . '.',
                    'is_seen' => (bool)$s->is_seen,
                    'created_at' => $s->updated_at->toIso8601String(),
                ];
            }
        } else {
            // For anonim user:
            // 1. Outgoing Friendship Requests accepted/rejected
            $friendships = Friendship::where('user_id', $user->id)
                ->whereIn('status', ['accepted', 'rejected'])
                ->with('recipient:id,name,profile_image')
                ->get();

            foreach ($friendships as $f) {
                $statusText = $f->status === 'accepted' ? 'disetujui' : 'ditolak';
                $titleText = $f->status === 'accepted' ? 'Permintaan Konsultasi Diterima' : 'Permintaan Konsultasi Ditolak';
                $notifications[] = [
                    'id' => 'friend_' . $f->id,
                    'type' => 'friendship',
                    'title' => $titleText,
                    'message' => 'Permintaan konsultasi Anda dengan Psikolog ' . ($f->recipient->name ?? 'Psikolog') . ' telah ' . $statusText . '.',
                    'is_seen' => (bool)$f->is_seen,
                    'created_at' => $f->updated_at->toIso8601String(),
                ];
            }

            // 2. Consultation Sessions booked/completed
            $sessions = ConsultationSession::where('user_id', $user->id)
                ->whereIn('status', ['booked', 'completed'])
                ->with('psychologist:id,name,profile_image')
                ->get();

            foreach ($sessions as $s) {
                $statusText = $s->status === 'booked' ? 'disetujui' : 'selesai';
                $titleText = $s->status === 'booked' ? 'Jadwal Konsultasi Disetujui' : 'Sesi Konsultasi Selesai';
                $notifications[] = [
                    'id' => 'session_' . $s->id,
                    'type' => 'session',
                    'title' => $titleText,
                    'message' => 'Jadwal konsultasi Anda dengan Psikolog ' . ($s->psychologist->name ?? 'Psikolog') . ' pada ' . $s->session_date . ' jam ' . $s->session_time . ' telah ' . $statusText . '.',
                    'is_seen' => (bool)$s->is_seen,
                    'created_at' => $s->updated_at->toIso8601String(),
                ];
            }
        }

        // Sort by created_at desc (latest first)
        usort($notifications, function ($a, $b) {
            return strcmp($b['created_at'], $a['created_at']);
        });

        return response()->json(['notifications' => $notifications]);
    }

    public function markAllAsSeen(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'psikolog') {
            Friendship::where('friend_id', $user->id)
                ->where('status', 'pending')
                ->update(['is_seen' => true]);

            ConsultationSession::where('psychologist_id', $user->id)
                ->where('status', 'pending_approval')
                ->update(['is_seen' => true]);
        } else {
            Friendship::where('user_id', $user->id)
                ->whereIn('status', ['accepted', 'rejected'])
                ->update(['is_seen' => true]);

            ConsultationSession::where('user_id', $user->id)
                ->whereIn('status', ['booked', 'completed'])
                ->update(['is_seen' => true]);
        }

        return response()->json(['message' => 'Semua notifikasi telah ditandai dibaca.']);
    }
}
