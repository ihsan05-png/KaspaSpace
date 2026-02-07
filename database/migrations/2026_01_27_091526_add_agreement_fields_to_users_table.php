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
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('agreed_terms')->default(false)->after('role');
            $table->boolean('agreed_privacy')->default(false)->after('agreed_terms');
            $table->boolean('agreed_newsletter')->default(false)->after('agreed_privacy');
            $table->timestamp('agreed_at')->nullable()->after('agreed_newsletter');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['agreed_terms', 'agreed_privacy', 'agreed_newsletter', 'agreed_at']);
        });
    }
};
