<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('restrict');
            $table->string('product_name');
            $table->foreignId('variant_id')->nullable()->constrained('product_variants')->onDelete('restrict');
            $table->string('variant_name')->nullable();
            // room_id tidak pakai FK constraint karena tabel rooms dibuat setelah order_items
            $table->unsignedBigInteger('room_id')->nullable();
            // null = share_desk atau room dengan unit_count=1 (tidak ada pemilihan unit spesifik)
            $table->unsignedTinyInteger('unit_index')->nullable();
            $table->json('custom_options')->nullable();
            $table->integer('quantity');
            $table->decimal('price', 15, 2);
            $table->decimal('subtotal', 15, 2);
            $table->timestamp('booking_start_at')->nullable();
            $table->timestamp('booking_end_at')->nullable();
            $table->boolean('stock_reduced')->default(false);
            $table->boolean('stock_restored')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
