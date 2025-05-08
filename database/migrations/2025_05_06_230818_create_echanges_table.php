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
        Schema::create('echanges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('demandeur_id')->constrained('professeurs')->onDelete('cascade');
            $table->foreignId('receveur_id')->constrained('professeurs')->onDelete('cascade');
            $table->foreignId('attribution_id')->constrained('attributions')->onDelete('cascade');
            $table->enum('status', ['pending', 'accepted', 'refused'])->default('pending');
            $table->timestamps();
        });
        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('echanges');
    }
};
