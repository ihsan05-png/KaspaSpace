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
        Schema::create('discounts', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // Kode diskon (misal: DISCOUNT10, NEWYEAR2026)
            $table->string('name'); // Nama diskon
            $table->text('description')->nullable(); // Deskripsi diskon
            $table->enum('type', ['percentage', 'fixed']); // percentage = persentase, fixed = nominal
            $table->decimal('value', 12, 2); // Nilai diskon (10 untuk 10%, atau 100000 untuk 100k)
            $table->decimal('min_purchase', 12, 2)->nullable(); // Minimum pembelian
            $table->decimal('max_discount', 12, 2)->nullable(); // Maksimal diskon (untuk percentage)
            $table->integer('usage_limit')->nullable(); // Batas penggunaan (null = unlimited)
            $table->integer('usage_count')->default(0); // Jumlah yang sudah digunakan
            $table->timestamp('start_date')->nullable(); // Tanggal mulai
            $table->timestamp('end_date')->nullable(); // Tanggal berakhir
            $table->boolean('is_active')->default(true); // Status aktif
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('discounts');
    }
};
