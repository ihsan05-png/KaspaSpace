<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('subtitle')->nullable();
            $table->longText('description')->nullable();
            $table->string('promo_label')->nullable();
            $table->decimal('base_price', 12, 2)->default(0);
            $table->json('images')->nullable();
            $table->json('custom_options')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->integer('sort_order')->default(0);
            $table->text('meta_description')->nullable();
            $table->string('meta_keywords')->nullable();
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            // Values: 'private_office', 'share_desk', 'private_room', 'virtual_office'
            $table->string('product_type')->nullable();
            $table->string('open_time', 5)->nullable(); // e.g. "08:00"
            $table->string('close_time', 5)->nullable(); // e.g. "17:00"
            $table->index('is_active', 'idx_products_is_active');
            $table->index('sort_order', 'idx_products_sort_order');
            $table->timestamps();
        });

        DB::statement('ALTER TABLE products ADD FULLTEXT INDEX ft_products_search (title, subtitle)');
    }

    public function down()
    {
        Schema::dropIfExists('products');
    }
};
