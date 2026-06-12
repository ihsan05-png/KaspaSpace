<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payment_settings', function (Blueprint $table) {
            $table->boolean('ppn_enabled')->default(true)->after('close_time');
            $table->unsignedTinyInteger('ppn_rate')->default(11)->after('ppn_enabled');
        });
    }

    public function down(): void
    {
        Schema::table('payment_settings', function (Blueprint $table) {
            $table->dropColumn(['ppn_enabled', 'ppn_rate']);
        });
    }
};
