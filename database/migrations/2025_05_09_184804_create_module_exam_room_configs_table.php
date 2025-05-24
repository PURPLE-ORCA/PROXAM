<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('module_exam_room_configs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('module_id')->constrained('modules')->cascadeOnDelete();
            $table->foreignId('salle_id')->constrained('salles')->cascadeOnDelete();
            $table->unsignedInteger('configured_capacity'); 
            $table->unsignedInteger('configured_prof_count')->default(2); 
            $table->timestamps();
            $table->unique(['module_id', 'salle_id']); 
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('module_exam_room_configs');
    }
};