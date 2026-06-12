<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ResepsionisSeeder extends Seeder
{
    public function run(): void
    {
        $resepsionisUsers = [
            [
                'name'     => 'Resepsionis Kaspa',
                'email'    => 'resepsionis@kaspaspace.com',
                'password' => 'resepsionis123',
            ],
            [
                'name'     => 'Finance Kaspa',
                'email'    => 'finance@kaspaspace.com',
                'password' => 'finance123',
            ],
        ];

        foreach ($resepsionisUsers as $data) {
            $user = User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name'              => $data['name'],
                    'password'          => Hash::make($data['password']),
                    'role'              => 'resepsionis',
                    'email_verified_at' => now(),
                ]
            );

            // Assign Spatie role
            if (!$user->hasRole('resepsionis')) {
                $user->assignRole('resepsionis');
            }
        }

        $this->command->info('Resepsionis users ensured:');
        $this->command->info('  - resepsionis@kaspaspace.com / resepsionis123');
        $this->command->info('  - finance@kaspaspace.com / finance123');
    }
}
