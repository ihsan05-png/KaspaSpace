<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // orders table indexes
        Schema::table('orders', function (Blueprint $table) {
            $table->index('payment_status');
            $table->index('status');
            $table->index('customer_email');
            $table->index('created_at');
            $table->index(['payment_status', 'created_at']);
            $table->index(['customer_email', 'payment_status']);
        });

        // order_items table indexes
        Schema::table('order_items', function (Blueprint $table) {
            $table->index('order_id');
            $table->index('product_id');
        });

        // discounts table indexes
        Schema::table('discounts', function (Blueprint $table) {
            $table->index('is_active');
            $table->index('start_date');
            $table->index('end_date');
            $table->index(['is_active', 'start_date', 'end_date']);
        });

        // reviews table indexes
        Schema::table('reviews', function (Blueprint $table) {
            $table->index('product_id');
            $table->index('is_approved');
            $table->index(['product_id', 'is_approved']);
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['payment_status']);
            $table->dropIndex(['status']);
            $table->dropIndex(['customer_email']);
            $table->dropIndex(['created_at']);
            $table->dropIndex(['payment_status', 'created_at']);
            $table->dropIndex(['customer_email', 'payment_status']);
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropIndex(['order_id']);
            $table->dropIndex(['product_id']);
        });

        Schema::table('discounts', function (Blueprint $table) {
            $table->dropIndex(['is_active']);
            $table->dropIndex(['start_date']);
            $table->dropIndex(['end_date']);
            $table->dropIndex(['is_active', 'start_date', 'end_date']);
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->dropIndex(['product_id']);
            $table->dropIndex(['is_approved']);
            $table->dropIndex(['product_id', 'is_approved']);
        });
    }
};
