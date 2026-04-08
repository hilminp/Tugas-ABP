<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Cek apakah kolom sudah ada sebelum menambahkan
            if (!Schema::hasColumn('users', 'is_verified')) {
                $table->boolean('is_verified')->default(false)->after('password');
            }
            if (!Schema::hasColumn('users', 'str_file')) {
                $table->string('str_file')->nullable()->after('is_verified');
            }
            if (!Schema::hasColumn('users', 'ijazah_file')) {
                $table->string('ijazah_file')->nullable()->after('str_file');
            }
        });
        
        // Update role enum jika perlu
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('anonim', 'psikolog') DEFAULT 'anonim'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'is_verified')) {
                $table->dropColumn('is_verified');
            }
            if (Schema::hasColumn('users', 'str_file')) {
                $table->dropColumn('str_file');
            }
            if (Schema::hasColumn('users', 'ijazah_file')) {
                $table->dropColumn('ijazah_file');
            }
        });
    }
};
