<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Panggil seeder lain
        $this->call([
            UserSeeder::class,
            CategorySeeder::class,
            ProductSeeder::class,
            AdminSeeder::class,
        ]);
    }
}
