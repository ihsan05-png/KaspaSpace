<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admins = [
            [
                'name' => 'Kaspa Space Admin',
                'email' => 'kaspaspace@gmail.com',
                'password' => 'kaspaspace',
            ],
            [
                'name' => 'Super Admin',
                'email' => 'admin@kaspaspace.com',
                'password' => 'admin123',
            ],
            [
                'name' => 'Administrator',
                'email' => 'administrator@kaspaspace.com',
                'password' => 'password',
            ],
        ];

        foreach ($admins as $admin) {
            User::updateOrCreate(
                ['email' => $admin['email']],
                [
                    'name' => $admin['name'],
                    'password' => Hash::make($admin['password']),
                    'role' => 'admin',
                    'email_verified_at' => now(),
                ]
            );
        }

        $this->command?->info('Admin users ensured.');
    }
}
