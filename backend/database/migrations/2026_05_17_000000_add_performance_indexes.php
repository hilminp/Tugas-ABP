<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tambah index pada kolom-kolom yang sering digunakan dalam WHERE/ORDER BY
     * untuk menghilangkan full table scan yang menyebabkan loading lambat.
     */
    public function up(): void
    {
        // ─── friendships ────────────────────────────────────────────────────
        // Dipakai di: MessageController, FriendshipController, ConsultationSessionController
        // Query: WHERE user_id = ? AND status = 'accepted'
        //        WHERE friend_id = ? AND status = 'pending'
        Schema::table('friendships', function (Blueprint $table) {
            if (!$this->hasIndex('friendships', 'friendships_user_id_status_index')) {
                $table->index(['user_id', 'status'], 'friendships_user_id_status_index');
            }
            if (!$this->hasIndex('friendships', 'friendships_friend_id_status_index')) {
                $table->index(['friend_id', 'status'], 'friendships_friend_id_status_index');
            }
            if (!$this->hasIndex('friendships', 'friendships_is_seen_index')) {
                $table->index(['is_seen'], 'friendships_is_seen_index');
            }
        });

        // ─── messages ───────────────────────────────────────────────────────
        // Dipakai di: MessageController@thread, MessageController@send
        // Query: WHERE (sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?)
        //        ORDER BY created_at ASC
        Schema::table('messages', function (Blueprint $table) {
            if (!$this->hasIndex('messages', 'messages_sender_recipient_created_index')) {
                $table->index(['sender_id', 'recipient_id', 'created_at'], 'messages_sender_recipient_created_index');
            }
        });

        // ─── posts ──────────────────────────────────────────────────────────
        // Dipakai di: PostController@index
        // Query: ORDER BY created_at DESC  (load semua post ke dashboard)
        //        AdminController@analytics: whereDate('created_at', ...)
        Schema::table('posts', function (Blueprint $table) {
            if (!$this->hasIndex('posts', 'posts_created_at_index')) {
                $table->index(['created_at'], 'posts_created_at_index');
            }
            if (!$this->hasIndex('posts', 'posts_user_id_created_at_index')) {
                $table->index(['user_id', 'created_at'], 'posts_user_id_created_at_index');
            }
        });

        // ─── post_likes ─────────────────────────────────────────────────────
        // Dipakai di: PostController@index (withCount likes, withExists likes)
        // Query: WHERE post_id = ? AND user_id = ?
        //        AdminController@analytics: whereDate('created_at', ...)
        Schema::table('post_likes', function (Blueprint $table) {
            if (!$this->hasIndex('post_likes', 'post_likes_post_id_user_id_index')) {
                $table->index(['post_id', 'user_id'], 'post_likes_post_id_user_id_index');
            }
            if (!$this->hasIndex('post_likes', 'post_likes_created_at_index')) {
                $table->index(['created_at'], 'post_likes_created_at_index');
            }
        });

        // ─── post_comments ──────────────────────────────────────────────────
        // Dipakai di: PostController@index (with comments)
        // Query: WHERE post_id = ? ORDER BY created_at DESC
        //        AdminController@analytics: whereDate('created_at', ...)
        Schema::table('post_comments', function (Blueprint $table) {
            if (!$this->hasIndex('post_comments', 'post_comments_post_id_created_at_index')) {
                $table->index(['post_id', 'created_at'], 'post_comments_post_id_created_at_index');
            }
            if (!$this->hasIndex('post_comments', 'post_comments_created_at_index')) {
                $table->index(['created_at'], 'post_comments_created_at_index');
            }
        });

        // ─── users ──────────────────────────────────────────────────────────
        // Dipakai di: SearchController@psychologists, AdminController@dashboard & users
        // Query: WHERE role = 'psikolog' AND is_verified = 1 AND is_suspended = 0
        //        WHERE is_premium = 1
        //        WHERE name LIKE '%q%' (LIKE tidak bisa pakai index biasa, tapi prefix query bisa)
        Schema::table('users', function (Blueprint $table) {
            if (!$this->hasIndex('users', 'users_role_verified_suspended_index')) {
                $table->index(['role', 'is_verified', 'is_suspended'], 'users_role_verified_suspended_index');
            }
            if (!$this->hasIndex('users', 'users_is_premium_index')) {
                $table->index(['is_premium'], 'users_is_premium_index');
            }
            if (!$this->hasIndex('users', 'users_is_admin_index')) {
                $table->index(['is_admin'], 'users_is_admin_index');
            }
            if (!$this->hasIndex('users', 'users_created_at_index')) {
                $table->index(['created_at'], 'users_created_at_index');
            }
        });

        // ─── consultation_sessions ──────────────────────────────────────────
        // Dipakai di: ConsultationSessionController (index, myBookedSessions, notifications)
        //             MessageController@thread & send (active session check)
        // Query: WHERE psychologist_id = ? AND status = ?
        //        WHERE user_id = ? AND status != 'completed'
        //        WHERE psychologist_id = ? AND status = 'pending_approval' AND is_seen = 0
        Schema::table('consultation_sessions', function (Blueprint $table) {
            if (!$this->hasIndex('consultation_sessions', 'cs_psychologist_id_status_index')) {
                $table->index(['psychologist_id', 'status'], 'cs_psychologist_id_status_index');
            }
            if (!$this->hasIndex('consultation_sessions', 'cs_user_id_status_index')) {
                $table->index(['user_id', 'status'], 'cs_user_id_status_index');
            }
            if (!$this->hasIndex('consultation_sessions', 'cs_psychologist_id_status_is_seen_index')) {
                $table->index(['psychologist_id', 'status', 'is_seen'], 'cs_psychologist_id_status_is_seen_index');
            }
            if (!$this->hasIndex('consultation_sessions', 'cs_session_date_index')) {
                $table->index(['session_date'], 'cs_session_date_index');
            }
        });
    }

    /**
     * Hapus semua index yang ditambahkan.
     */
    public function down(): void
    {
        Schema::table('friendships', function (Blueprint $table) {
            $table->dropIndexIfExists('friendships_user_id_status_index');
            $table->dropIndexIfExists('friendships_friend_id_status_index');
            $table->dropIndexIfExists('friendships_is_seen_index');
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->dropIndexIfExists('messages_sender_recipient_created_index');
        });

        Schema::table('posts', function (Blueprint $table) {
            $table->dropIndexIfExists('posts_created_at_index');
            $table->dropIndexIfExists('posts_user_id_created_at_index');
        });

        Schema::table('post_likes', function (Blueprint $table) {
            $table->dropIndexIfExists('post_likes_post_id_user_id_index');
            $table->dropIndexIfExists('post_likes_created_at_index');
        });

        Schema::table('post_comments', function (Blueprint $table) {
            $table->dropIndexIfExists('post_comments_post_id_created_at_index');
            $table->dropIndexIfExists('post_comments_created_at_index');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndexIfExists('users_role_verified_suspended_index');
            $table->dropIndexIfExists('users_is_premium_index');
            $table->dropIndexIfExists('users_is_admin_index');
            $table->dropIndexIfExists('users_created_at_index');
        });

        Schema::table('consultation_sessions', function (Blueprint $table) {
            $table->dropIndexIfExists('cs_psychologist_id_status_index');
            $table->dropIndexIfExists('cs_user_id_status_index');
            $table->dropIndexIfExists('cs_psychologist_id_status_is_seen_index');
            $table->dropIndexIfExists('cs_session_date_index');
        });
    }

    private function hasIndex(string $table, string $indexName): bool
    {
        $conn = \Illuminate\Support\Facades\DB::connection();
        if ($conn->getDriverName() === 'sqlite') {
            $indexes = $conn->select("PRAGMA index_list(`{$table}`)");
            foreach ($indexes as $index) {
                if ($index->name === $indexName) {
                    return true;
                }
            }
            return false;
        }

        $indexes = \Illuminate\Support\Facades\DB::select(
            "SHOW INDEX FROM `{$table}` WHERE Key_name = ?",
            [$indexName]
        );
        return count($indexes) > 0;
    }
};
