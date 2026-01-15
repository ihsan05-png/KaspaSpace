<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        if (!Schema::hasColumn('orders', 'notes')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->text('notes')->nullable()->after('customer_phone');
            });
        }
    }

    public function down()
    {
        if (Schema::hasColumn('orders', 'notes')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->dropColumn('notes');
            });
        }
    }
};
