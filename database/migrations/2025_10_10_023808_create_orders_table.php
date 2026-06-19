<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->string('customer_name');
            $table->string('customer_email');
            $table->string('customer_phone');
            $table->text('notes')->nullable();
            $table->string('doc_ktp')->nullable();
            $table->string('doc_npwp')->nullable();
            $table->string('doc_business_license')->nullable();
            $table->string('doc_company_name')->nullable();
            $table->string('doc_pic_name')->nullable();
            $table->string('doc_pic_phone')->nullable();
            // discount_id tidak pakai FK constraint karena tabel discounts dibuat setelah orders
            $table->unsignedBigInteger('discount_id')->nullable();
            $table->string('discount_code')->nullable();
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('subtotal', 15, 2);
            $table->decimal('tax', 15, 2)->default(0);
            $table->decimal('total', 15, 2);
            $table->enum('status', ['pending', 'processing', 'completed', 'cancelled'])->default('pending');
            $table->string('payment_method')->nullable();
            $table->string('payment_proof')->nullable();
            $table->enum('payment_status', ['unpaid', 'paid', 'refunded', 'cancelled', 'verified', 'rejected'])->default('unpaid');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
            $table->index('payment_status');
            $table->index('status');
            $table->index('customer_email');
            $table->index('created_at');
            $table->index(['payment_status', 'created_at']);
            $table->index(['customer_email', 'payment_status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
