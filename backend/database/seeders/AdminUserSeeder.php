<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create or update a default administrator account for local development
        $email = 'admin@example.com';
        $username = 'admin';
        $password = 'password'; // change after first login

        User::updateOrCreate(
            ['email' => $email],
            [
                'name' => 'Administrator',
                'username' => $username,
                'password' => Hash::make($password),
                'is_admin' => true,
            ]
        );
    }
}
