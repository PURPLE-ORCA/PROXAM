<?php

namespace App\Services;

use App\Models\Attribution;
use App\Models\Professeur;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class ConstraintCheckingService
{
    /**
     * Checks if an attribution can be offered for exchange by a professor.
     *
     * @param Attribution $attribution The attribution to be offered.
     * @param Professeur $requester The professor requesting the exchange.
     * @return bool
     */
    public function isAttributionExchangeable(Attribution $attribution, Professeur $requester): bool
    {
        // Rule 1: Attribution must belong to the requesting professor
        if ($attribution->professeur_id !== $requester->id) {
            return false;
        }

        // Rule 2: Exam must be in the future (e.g., at least 24 hours from now)
        // Assuming 'examen' relationship exists and 'debut' is a datetime column
        if ($attribution->examen->debut->lessThan(Carbon::now()->addHours(24))) {
            return false;
        }

        // Rule 3: Attribution should not already be involved in an exchange
        if ($attribution->is_involved_in_exchange) {
            return false;
        }

        // Add more rules as per project requirements:
        // - Not a sole module teacher for a critical module
        // - Not a critical PES role
        // - etc.

        return true;
    }

    /**
     * Checks if a swap between two professors for two attributions is valid.
     *
     * @param Professeur $profA The requesting professor (will take attrB).
     * @param Professeur $profB The proposing professor (will take attrA).
     * @param Attribution $attrA_original The attribution originally assigned to Prof A.
     * @param Attribution $attrB_offered The attribution offered by Prof B.
     * @return bool
     */
    public function canSwap(Professeur $profA, Professeur $profB, Attribution $attrA_original, Attribution $attrB_offered): bool
    {
        Log::info("--- ConstraintCheckingService@canSwap ---");
        Log::info("Requester (Prof A) ID: " . $profA->id);
        Log::info("Proposer (Prof B) ID: " . $profB->id);
        Log::info("Offered Attribution (attrA_original) ID: " . $attrA_original->id . ", Examen ID: " . $attrA_original->examen_id . ", Prof ID: " . $attrA_original->professeur_id);
        Log::info("Proposed Attribution (attrB_offered) ID: " . $attrB_offered->id . ", Examen ID: " . $attrB_offered->examen_id . ", Prof ID: " . $attrB_offered->professeur_id);

        // Basic checks:
        // 1. Ensure attrA_original belongs to profA
        if ($attrA_original->professeur_id !== $profA->id) {
            return false;
        }
        // 2. Ensure attrB_offered belongs to profB
        if ($attrB_offered->professeur_id !== $profB->id) {
            return false;
        }

        // --- Proceed with actual constraint checks regarding scheduling, eligibility, etc. ---

        // Rule 1: Check for time conflicts for Prof A (after swap)
        // Prof A will take attrB_offered.
        // Ensure $attrA_original->examen and $attrB_offered->examen are loaded
        $attrA_original->loadMissing('examen');
        $attrB_offered->loadMissing('examen');

        // Make sure examen relationships and their 'debut'/'fin' accessors are valid
        if (!$attrA_original->examen || !$attrB_offered->examen) {
            return false;
        }
        // If 'fin' attribute doesn't exist on Examen model, derive it (e.g., debut + 2 hours)
        // For hasTimeConflict and hasUnavailabilityConflict, ensure Examen model has a working 'fin' accessor or property.

        $profA_other_attributions = $profA->attributions()
                                        ->where('id', '!=', $attrA_original->id) // Exclude the one they are giving away
                                        ->where('examen_id', '!=', $attrB_offered->examen_id) // Exclude the exam they are about to take
                                        ->with('examen') // Eager load examen
                                        ->get();
        if ($this->hasTimeConflict($attrB_offered->examen, $profA_other_attributions)) {
            // Log::warning("canSwap: Prof A time conflict for attrB_offered.");
            return false;
        }

        // Rule 2: Check for time conflicts for Prof B (after swap)
        $profB_other_attributions = $profB->attributions()
                                        ->where('id', '!=', $attrB_offered->id) // Exclude the one they are giving away
                                        ->where('examen_id', '!=', $attrA_original->examen_id) // Exclude the exam they are about to take
                                        ->with('examen') // Eager load examen
                                        ->get();
        if ($this->hasTimeConflict($attrA_original->examen, $profB_other_attributions)) {
            // Log::warning("canSwap: Prof B time conflict for attrA_original.");
            return false;
        }

        // Rule 5: Check for any unavailabilities conflicts for Prof A (after swap)
        if ($this->hasUnavailabilityConflict($attrB_offered->examen, $profA->unavailabilities()->get())) { // fetch fresh unavailabilities
            return false;
        }

        // Rule 6: Check for any unavailabilities conflicts for Prof B (after swap)
        if ($this->hasUnavailabilityConflict($attrA_original->examen, $profB->unavailabilities()->get())) { // fetch fresh unavailabilities
            return false;
        }

        // Add more complex business rules here:
        // - Check if the swap would leave a module without a responsible professor
        // - Check specific roles (e.g., PES)
        // - Check if the exam date is too close for a swap (already handled in isAttributionExchangeable for the initial offer)
        // - Check if the exam is already completed or too close to the exam date

        return true;
    }

    /**
     * Helper to check for time conflicts between an exam and a collection of attributions.
     *
     * @param \App\Models\Examen $newExamen The exam to check for conflicts.
     * @param \Illuminate\Database\Eloquent\Collection $existingAttributions Existing attributions.
     * @return bool True if a conflict exists, false otherwise.
     */
    protected function hasTimeConflict(\App\Models\Examen $newExamen, $existingAttributions): bool
    {
        foreach ($existingAttributions as $attribution) {
            $existingExamen = $attribution->examen;
            if (!$existingExamen || !$existingExamen->debut || !$existingExamen->end_datetime) {
                continue; // Skip this problematic one or handle error
            }

            if ($newExamen->debut->lessThan($existingExamen->end_datetime) && 
                $newExamen->end_datetime->greaterThan($existingExamen->debut)) {
                return true; // Conflict
            }
        }
        return false;
    }

    /**
     * Helper to check for unavailability conflicts between an exam and a collection of unavailabilities.
     *
     * @param \App\Models\Examen $examen The exam to check.
     * @param \Illuminate\Database\Eloquent\Collection $unavailabilities The professor's unavailabilities.
     * @return bool True if a conflict exists, false otherwise.
     */
    protected function hasUnavailabilityConflict(\App\Models\Examen $examen, $unavailabilities): bool
    {
        foreach ($unavailabilities as $unavailability) {
            if ($examen->debut->lessThan($unavailability->end_datetime) && $examen->end_datetime->greaterThan($unavailability->start_datetime)) {
                return true; // Conflict
            }
        }
        return false;
    }
}
