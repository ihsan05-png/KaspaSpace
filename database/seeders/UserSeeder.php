<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'Test User',
                'email' => 'test@example.com',
                'password' => 'password',
            ],
            [
                'name' => 'Mas Ilham',
                'email' => 'user@kaspaspace.com',
                'password' => 'password',
            ],
            [
                'name' => 'Member',
                'email' => 'member@kaspaspace.com',
                'password' => 'password',
            ],
        ];

        foreach ($users as $user) {
            User::updateOrCreate(
                ['email' => $user['email']],
                [
                    'name' => $user['name'],
                    'password' => Hash::make($user['password']),
                    'role' => 'user',
                    'email_verified_at' => now(),
                ]
            );
        }

        $this->command?->info('User accounts ensured.');
    }
}
