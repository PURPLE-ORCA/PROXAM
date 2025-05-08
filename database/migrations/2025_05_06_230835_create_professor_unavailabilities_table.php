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
        Schema::create('professor_unavailabilities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('professeur_id')->constrained('professeurs')->onDelete('cascade');
            $table->date('date');
            $table->string('heure'); // matin, après-midi, etc.
            $table->timestamps();
        });
        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('professor_unavailabilities');
    }
};
