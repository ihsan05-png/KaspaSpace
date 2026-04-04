<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rooms', function (Blueprint $table) {
            // unit_product_ids: array per-unit, tiap elemen = array product_id
            // contoh: [[1],[1],[1,3],[1],[1]] → unit 3 punya Private Office + Share Desk
            // null = semua unit pakai product_rooms pivot (room-level, unit_count=1)
            $table->json('unit_product_ids')->nullable()->after('unit_capacities');
        });
    }

    public function down(): void
    {
        Schema::table('rooms', function (Blueprint $table) {
            $table->dropColumn('unit_product_ids');
        });
    }
};
