<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rooms', function (Blueprint $table) {
            // unit_count: jumlah unit fisik yang bisa dipesan secara bersamaan
            // (contoh: private_office 6 unit = 6 ruangan bisa terisi bersamaan)
            $table->integer('unit_count')->default(1)->after('capacity');
        });
    }

    public function down(): void
    {
        Schema::table('rooms', function (Blueprint $table) {
            $table->dropColumn('unit_count');
        });
    }
};
