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
            $table->foreignId('attribution_offered_id')->constrained('attributions')->cascadeOnDelete();
            $table->foreignId('professeur_requester_id')->constrained('professeurs')->cascadeOnDelete();
            $table->string('motif')->nullable();
            $table->enum('status', ['Open', 'Pending_Requester_Decision', 'Approved', 'Refused_By_Requester', 'Withdrawn_By_Proposer', 'Cancelled_By_Admin', 'Cancelled_Auto_Expired']);
            $table->foreignId('professeur_accepter_id')->nullable()->constrained('professeurs')->nullOnDelete();
            $table->foreignId('attribution_accepted_id')->nullable()->constrained('attributions')->nullOnDelete();
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
