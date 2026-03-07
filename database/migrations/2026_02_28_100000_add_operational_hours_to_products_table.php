<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('open_time', 5)->nullable()->after('product_type'); // e.g. "08:00"
            $table->string('close_time', 5)->nullable()->after('open_time');  // e.g. "17:00"
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['open_time', 'close_time']);
        });
    }
};
