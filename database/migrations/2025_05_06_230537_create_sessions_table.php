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
        if (!Schema::hasTable('sessions')) {
            Schema::create('sessions', function (Blueprint $table) {
                $table->id();
                $table->string('nom'); // exemple: session 1
                $table->foreignId('annee_uni_id')->constrained('annee_unis')->onDelete('cascade');
                $table->timestamps();
                
                // Optional: Add index for better performance
                $table->index('annee_uni_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sessions');
    }
};