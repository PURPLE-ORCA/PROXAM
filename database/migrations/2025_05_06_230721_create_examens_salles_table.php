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
        Schema::create('examens_salles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('examen_id')->constrained('examens')->onDelete('cascade');
            $table->foreignId('salle_id')->constrained('salles')->onDelete('cascade');
            $table->timestamps();
        
            $table->unique(['examen_id', 'salle_id']);
        });
        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('examens_salles');
    }
};
