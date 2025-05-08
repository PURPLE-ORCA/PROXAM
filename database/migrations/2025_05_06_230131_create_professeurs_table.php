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
        Schema::create('professeurs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->nullable()->constrained('users')->onDelete('cascade');
            $table->string('nom');
            $table->string('prenom');
            $table->enum('rang', ['PA', 'PAG', 'PES']);
            $table->enum('statut', ['Active', 'On_Leave', 'Sick_Leave', 'Vacation', 'Inactive']);
            $table->boolean('is_chef_service');
            $table->date('date_recrutement');
            $table->enum('specialite', ['medicale', 'chirurgien']);
            $table->foreignId('service_id')->constrained('services')->onDelete('cascade');
            $table->timestamps();
        });
        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('professeurs');
    }
};
