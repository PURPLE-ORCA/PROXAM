<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sessions', function (Blueprint $table) {
            if (!Schema::hasColumn('sessions', 'annee_uni_id')) {
                $table->foreignId('annee_uni_id')->nullable()->constrained('annee_unis')->onDelete('cascade');
            }
        });
    }

    public function down(): void
    {
        Schema::table('sessions', function (Blueprint $table) {
            $table->dropForeign(['annee_uni_id']);
            $table->dropColumn('annee_uni_id');
        });
    }
};
