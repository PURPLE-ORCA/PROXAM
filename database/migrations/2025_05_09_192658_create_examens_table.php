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
        Schema::create('examens', function (Blueprint $table) {
            $table->id();
            $table->string('nom')->nullable();
            $table->foreignId('quadrimestre_id')->constrained('quadrimestres')->cascadeOnDelete();
            $table->enum('type', ['QCM', 'theoreique']);
            $table->dateTime('debut');
            $table->dateTime('fin');
            $table->foreignId('module_id')->constrained('modules')->cascadeOnDelete();
            $table->enum('filiere', ['Medicale', 'Pharmacie']);
            $table->unsignedInteger('required_professors');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('examens');
    }
};
