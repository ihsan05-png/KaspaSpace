<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('doc_ktp')->nullable()->after('notes');
            $table->string('doc_npwp')->nullable()->after('doc_ktp');
            $table->string('doc_business_license')->nullable()->after('doc_npwp');
            $table->string('doc_company_name')->nullable()->after('doc_business_license');
            $table->string('doc_pic_name')->nullable()->after('doc_company_name');
            $table->string('doc_pic_phone')->nullable()->after('doc_pic_name');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'doc_ktp', 'doc_npwp', 'doc_business_license',
                'doc_company_name', 'doc_pic_name', 'doc_pic_phone',
            ]);
        });
    }
};
