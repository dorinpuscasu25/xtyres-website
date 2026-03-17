<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table): void {
            $table->json('meta_title')->nullable()->after('description');
            $table->json('meta_keywords')->nullable()->after('meta_title');
            $table->json('meta_description')->nullable()->after('meta_keywords');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table): void {
            $table->dropColumn(['meta_title', 'meta_keywords', 'meta_description']);
        });
    }
};
