<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // =====================
        // Permissions
        // =====================
        $permissions = [
            // Produk
            'view products',
            'create products',
            'edit products',
            'delete products',

            // Kategori
            'view categories',
            'create categories',
            'edit categories',
            'delete categories',

            // Pesanan & Reservasi
            'view orders',
            'edit orders',
            'delete orders',
            'view reservations',
            'edit reservations',

            // Ruangan & Monitoring
            'view rooms',
            'create rooms',
            'edit rooms',
            'delete rooms',
            'view monitoring',

            // Jadwal
            'view schedule',
            'edit schedule',

            // Ulasan
            'view reviews',
            'edit reviews',
            'delete reviews',

            // User
            'view users',
            'create users',
            'edit users',
            'delete users',

            // Statistik & Laporan
            'view statistics',

            // Pengaturan
            'view settings',
            'edit settings',
            'view discounts',
            'create discounts',
            'edit discounts',
            'delete discounts',
            'view agreements',
            'edit agreements',
            'view integrations',
            'view news',
            'create news',
            'edit news',
            'delete news',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // =====================
        // Roles
        // =====================

        // Admin — akses penuh
        $admin = Role::firstOrCreate(['name' => 'admin']);
        $admin->syncPermissions(Permission::all());

        // Resepsionis — akses terbatas
        $resepsionis = Role::firstOrCreate(['name' => 'resepsionis']);
        $resepsionis->syncPermissions([
            'view orders', 'edit orders',
            'view reservations', 'edit reservations',
            'view rooms', 'view monitoring',
            'view schedule', 'edit schedule',
            'view reviews',
        ]);

        // User biasa — tidak ada permission admin
        Role::firstOrCreate(['name' => 'user']);

        // =====================
        // Assign role ke user yang sudah ada berdasarkan kolom role lama
        // =====================
        User::all()->each(function ($user) {
            if (!$user->roles()->exists()) {
                $roleName = $user->role ?? 'user';
                // Pastikan role valid
                if (!in_array($roleName, ['admin', 'resepsionis', 'user'])) {
                    $roleName = 'user';
                }
                $user->assignRole($roleName);
            }
        });

        $this->command->info('Roles & permissions selesai dibuat.');
        $this->command->info('- admin: semua permission');
        $this->command->info('- resepsionis: orders, reservations, rooms, monitoring, schedule, reviews');
        $this->command->info('- user: tidak ada permission admin');
    }
}
