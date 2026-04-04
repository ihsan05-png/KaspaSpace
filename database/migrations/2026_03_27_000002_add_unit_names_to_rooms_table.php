<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rooms', function (Blueprint $table) {
            // unit_names: array JSON nama tiap unit, contoh: ["Room A","Room B","Room C"]
            $table->json('unit_names')->nullable()->after('unit_count');
        });
    }

    public function down(): void
    {
        Schema::table('rooms', function (Blueprint $table) {
            $table->dropColumn('unit_names');
        });
    }
};
