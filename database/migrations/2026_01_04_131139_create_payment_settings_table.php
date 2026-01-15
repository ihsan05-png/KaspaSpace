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
        if (!Schema::hasTable('payment_settings')) {
            Schema::create('payment_settings', function (Blueprint $table) {
                $table->id();
                $table->string('qris_image')->nullable();
                $table->string('bank_name', 100)->nullable();
                $table->string('account_number', 50)->nullable();
                $table->string('account_name', 100)->nullable();
                $table->timestamp('created_at')->useCurrent();
                $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_settings');
    }
};
