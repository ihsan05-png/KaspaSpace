<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rooms', function (Blueprint $table) {
            // unit_capacities: array kapasitas per unit, contoh: [4, 6, 8, 4, 6, 8]
            // null berarti semua unit pakai kolom capacity (default)
            $table->json('unit_capacities')->nullable()->after('unit_names');
        });
    }

    public function down(): void
    {
        Schema::table('rooms', function (Blueprint $table) {
            $table->dropColumn('unit_capacities');
        });
    }
};
