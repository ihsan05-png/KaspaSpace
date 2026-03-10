<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Index pada is_active dan sort_order untuk filter cepat
        Schema::table('products', function (Blueprint $table) {
            $table->index('is_active', 'idx_products_is_active');
            $table->index('sort_order', 'idx_products_sort_order');
        });

        // FULLTEXT index untuk pencarian title & subtitle (jauh lebih cepat dari LIKE)
        DB::statement('ALTER TABLE products ADD FULLTEXT INDEX ft_products_search (title, subtitle)');
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex('idx_products_is_active');
            $table->dropIndex('idx_products_sort_order');
        });

        DB::statement('ALTER TABLE products DROP INDEX ft_products_search');
    }
};
