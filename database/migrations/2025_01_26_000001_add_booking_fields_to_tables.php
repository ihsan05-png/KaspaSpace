<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Add duration_hours to product_variants for coworking space products
        Schema::table('product_variants', function (Blueprint $table) {
            $table->decimal('duration_hours', 8, 2)->nullable()->after('stock_quantity');
        });

        // Add booking tracking fields to order_items
        Schema::table('order_items', function (Blueprint $table) {
            $table->timestamp('booking_start_at')->nullable()->after('subtotal');
            $table->timestamp('booking_end_at')->nullable()->after('booking_start_at');
            $table->boolean('stock_reduced')->default(false)->after('booking_end_at');
            $table->boolean('stock_restored')->default(false)->after('stock_reduced');
        });
    }

    public function down()
    {
        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropColumn('duration_hours');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn(['booking_start_at', 'booking_end_at', 'stock_reduced', 'stock_restored']);
        });
    }
};
