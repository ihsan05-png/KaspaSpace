<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('booking_holds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('room_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedBigInteger('variant_id')->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            $table->string('session_id')->nullable()->index();
            $table->date('booking_date');
            $table->datetime('booking_start_at');
            $table->datetime('booking_end_at');
            $table->integer('unit_index')->nullable();
            $table->integer('quantity')->default(1);
            $table->timestamp('expires_at');
            $table->enum('status', ['active', 'converted', 'released'])->default('active')->index();
            $table->timestamps();

            // Index untuk query cepat saat cek konflik
            $table->index(['product_id', 'room_id', 'booking_date', 'status']);
            $table->index(['expires_at', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_holds');
    }
};
