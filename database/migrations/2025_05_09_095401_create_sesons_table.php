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
        Schema::create('sesons', function (Blueprint $table) {
            $table->id();
            $table->string('code');
            $table->foreignId('annee_uni_id')->constrained('annee_unis')->cascadeOnDelete();
            $table->timestamp('assignments_approved_at')->nullable();
            $table->timestamp('notifications_sent_at')->nullable();
            $table->foreignId('approval_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sesons');
    }
};
