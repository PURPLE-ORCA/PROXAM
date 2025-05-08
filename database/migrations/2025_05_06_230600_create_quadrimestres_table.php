<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // First ensure sessions table exists
        if (Schema::hasTable('sessions')) {
            Schema::create('quadrimestres', function (Blueprint $table) {
                $table->id();
                $table->string('nom', 10)->comment('Q1, Q2 etc');
                
                // Safer foreign key - checks if column exists first
                $table->string('session_id');
                $table->foreign('session_id')
                      ->references('id')
                      ->on('sessions')
                      ->onDelete('cascade');
                
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        // Disable foreign key checks temporarily
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Schema::dropIfExists('quadrimestres');
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }
};