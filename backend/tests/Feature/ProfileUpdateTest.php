<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProfileUpdateTest extends TestCase
{
    use RefreshDatabase;

    public function test_anonymous_user_username_change_syncs_with_name(): void
    {
        $user = User::create([
            'name' => 'old_anon_username',
            'username' => 'old_anon_username',
            'email' => 'anon@example.com',
            'password' => bcrypt('password123'),
            'role' => 'anonim',
            'is_verified' => true,
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/profile/update', [
            'username' => 'new_anon_username',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'username' => 'new_anon_username',
            'name' => 'new_anon_username',
        ]);
    }

    public function test_psychologist_username_change_syncs_with_name_if_name_was_username(): void
    {
        $user = User::create([
            'name' => 'old_psych_username',
            'username' => 'old_psych_username',
            'email' => 'psych@example.com',
            'password' => bcrypt('password123'),
            'role' => 'psikolog',
            'is_verified' => true,
            'str_file' => 'test.pdf',
            'ijazah_file' => 'test.pdf',
            'spesialisasi' => 'Anak',
            'no_rekening' => '12345',
            'nama_bank' => 'BCA',
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/profile/update', [
            'username' => 'new_psych_username',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'username' => 'new_psych_username',
            'name' => 'new_psych_username',
        ]);
    }

    public function test_psychologist_username_change_does_not_overwrite_real_name(): void
    {
        $user = User::create([
            'name' => 'Dr. John Doe KTP Name',
            'username' => 'john_doe_username',
            'email' => 'john@example.com',
            'password' => bcrypt('password123'),
            'role' => 'psikolog',
            'is_verified' => true,
            'str_file' => 'test.pdf',
            'ijazah_file' => 'test.pdf',
            'spesialisasi' => 'Anak',
            'no_rekening' => '12345',
            'nama_bank' => 'BCA',
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/profile/update', [
            'username' => 'john_new_username',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'username' => 'john_new_username',
            'name' => 'Dr. John Doe KTP Name',
        ]);
    }
}
