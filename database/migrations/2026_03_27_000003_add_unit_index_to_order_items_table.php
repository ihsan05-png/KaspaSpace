<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            // unit_index: indeks unit yang dipesan (0-based) dalam sebuah room dengan unit_count > 1
            // null berarti tidak ada pemilihan unit spesifik (share_desk, atau room unit_count=1)
            $table->unsignedTinyInteger('unit_index')->nullable()->after('room_id');
        });
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn('unit_index');
        });
    }
};
