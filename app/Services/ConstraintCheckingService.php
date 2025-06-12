<?php

namespace App\Services;

use App\Models\Attribution;
use App\Models\Professeur;
use App\Models\Module; // Added for Sole Module Teacher check
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB; // Added for Rank Quotas check

class ConstraintCheckingService
{
    // Define rank quotas per session
    const RANK_QUOTAS_PER_SESSION = [
        Professeur::RANG_PES => 2, // Example: Max 2 PES per session
        Professeur::RANG_PAG => 3, // Example: Max 3 PAG per session
        Professeur::RANG_PA => 5,  // Example: Max 5 PA per session
    ];

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
     * Helper to check if a professor's departure from an attribution removes the last module teacher for that module.
     *
     * @param Professeur $professorToLeave The professor who is leaving the attribution.
     * @param Attribution $attributionToLeave The attribution the professor is leaving.
     * @return bool True if the professor was the sole module teacher and is being removed, false otherwise.
     */
    protected function removesLastModuleTeacher(Professeur $professorToLeave, Attribution $attributionToLeave): bool
    {
        $examen = $attributionToLeave->examen;
        $module = $examen->module; // Assuming Examen has a 'module' relationship

        // Check if the professor is a teacher for this module
        if (!$professorToLeave->modules->contains('id', $module->id)) {
            // If they are NOT a module teacher, this swap doesn't remove a module teacher.
            return false;
        }

        // If they ARE a module teacher, check if any other professors assigned to the same exam are also module teachers.
        $otherAttributions = Attribution::where('examen_id', $examen->id)
            ->where('professeur_id', '!=', $professorToLeave->id)
            ->with('professeur.modules')
            ->get();

        foreach ($otherAttributions as $otherAttribution) {
            if ($otherAttribution->professeur->modules->contains('id', $module->id)) {
                // Found another professor who is a teacher for this module, so $professorToLeave is not the last one.
                return false;
            }
        }

        // If we reach here, no other module teacher was found for this exam, meaning $professorToLeave was the last one.
        return true;
    }

    /**
     * Helper to check if a swap violates the defined rank quotas per session.
     *
     * @param Professeur $profA The requesting professor (will take attrB).
     * @param Professeur $profB The proposing professor (will take attrA).
     * @param Attribution $attrA_original The attribution originally assigned to Prof A.
     * @param Attribution $attrB_offered The attribution offered by Prof B.
     * @return bool True if the swap violates rank quotas, false otherwise.
     */
    protected function violatesRankQuota(Professeur $profA, Professeur $profB, Attribution $attrA_original, Attribution $attrB_offered): bool
    {
        $rankA = $profA->rang;
        $rankB = $profB->rang;

        // If ranks are the same, the quotas don't change for this session.
        if ($rankA === $rankB) {
            return false;
        }

        $sesonId = $attrA_original->examen->seson_id; // Get the session ID from one of the exams

        // Get current assignment counts for each rank within this session
        $currentCounts = Attribution::whereHas('examen', fn($q) => $q->where('seson_id', $sesonId))
            ->join('professeurs', 'attributions.professeur_id', '=', 'professeurs.id')
            ->select('professeurs.rang', DB::raw('count(*) as count'))
            ->groupBy('professeurs.rang')
            ->pluck('count', 'rang');

        // Simulate the swap
        // Prof A leaves attrA_original (rankA), takes attrB_offered (rankB)
        // Prof B leaves attrB_offered (rankB), takes attrA_original (rankA)

        // Decrement count for profA's original rank (as they are leaving attrA_original)
        $currentCounts[$rankA] = ($currentCounts[$rankA] ?? 0) - 1;
        // Increment count for profA's new rank (as they are taking attrB_offered)
        $currentCounts[$rankB] = ($currentCounts[$rankB] ?? 0) + 1;

        // Decrement count for profB's original rank (as they are leaving attrB_offered)
        $currentCounts[$rankB] = ($currentCounts[$rankB] ?? 0) - 1;
        // Increment count for profB's new rank (as they are taking attrA_original)
        $currentCounts[$rankA] = ($currentCounts[$rankA] ?? 0) + 1;

        $quotas = self::RANK_QUOTAS_PER_SESSION;

        // Check if any of the new simulated counts exceed the defined quotas
        if (($currentCounts[$rankA] ?? 0) > ($quotas[$rankA] ?? 999)) {
            Log::warning("violatesRankQuota: Simulated count for rank {$rankA} ({$currentCounts[$rankA]}) exceeds quota ({$quotas[$rankA]}).");
            return true;
        }
        if (($currentCounts[$rankB] ?? 0) > ($quotas[$rankB] ?? 999)) {
            Log::warning("violatesRankQuota: Simulated count for rank {$rankB} ({$currentCounts[$rankB]}) exceeds quota ({$quotas[$rankB]}).");
            return true;
        }

        return false;
    }

    /**
     * Re-evaluates and assigns the 'responsable' role for attributions within a specific exam and salle.
     * The professor with the highest rank (and earliest recruitment date as tie-breaker) becomes responsable.
     *
     * @param int $examenId The ID of the exam.
     * @param int $salleId The ID of the salle.
     * @return void
     */
    public function reassignResponsableForExamSalle(int $examenId, int $salleId): void
    {
        $attributions = Attribution::where('examen_id', $examenId)
            ->where('salle_id', $salleId)
            ->with('professeur')
            ->get();

        if ($attributions->isEmpty()) {
            return;
        }

        // Define rank order for sorting (higher index means higher rank)
        $rankOrder = [
            Professeur::RANG_PA => 1,
            Professeur::RANG_PAG => 2,
            Professeur::RANG_PES => 3,
        ];

        // Find the professor with the highest rank (and earliest recruitment date as tie-breaker)
        $highestRankedProfAttribution = $attributions->sortByDesc(function ($attribution) use ($rankOrder) {
            return $rankOrder[$attribution->professeur->rang] ?? 0;
        })->sortBy(function ($attribution) {
            return $attribution->professeur->date_recrutement; // Assuming this is a Carbon instance or comparable
        })->first();

        // Set is_responsable = false for all attributions in this group
        foreach ($attributions as $attribution) {
            $attribution->is_responsable = false;
            $attribution->save(); // Save individually to trigger events/updates if any
        }

        // Set is_responsable = true for the highest-ranked professor's attribution
        if ($highestRankedProfAttribution) {
            $highestRankedProfAttribution->is_responsable = true;
            $highestRankedProfAttribution->save();
            Log::info("Reassigned responsable for Examen ID: {$examenId}, Salle ID: {$salleId} to Prof ID: {$highestRankedProfAttribution->professeur_id}");
        }
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
        // Log::info("--- ConstraintCheckingService@canSwap ---");
        // Log::info("Requester (Prof A) ID: " . $profA->id);
        // Log::info("Proposer (Prof B) ID: " . $profB->id);
        // Log::info("Offered Attribution (attrA_original) ID: " . $attrA_original->id . ", Examen ID: " . $attrA_original->examen_id . ", Prof ID: " . $attrA_original->professeur_id);
        // Log::info("Proposed Attribution (attrB_offered) ID: " . $attrB_offered->id . ", Examen ID: " . $attrB_offered->examen_id . ", Prof ID: " . $attrB_offered->professeur_id);

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
        // Load necessary relations once
        $attrA_original->loadMissing(['examen.salles', 'salle']);
        $attrB_offered->loadMissing(['examen.salles', 'salle']);

        // --- NEW: Get the professor's other assignments for checking ---
        // Note: The previous logic excluding the swapped-in exam_id was to prevent self-time-conflict.
        // We now need a more complete list for daily/gap day checks, but we still need to
        // be careful not to compare an exam against itself.
        $profA_other_attributions = $profA->attributions()->where('id', '!=', $attrA_original->id)->with('examen')->get();
        $profB_other_attributions = $profB->attributions()->where('id', '!=', $attrB_offered->id)->with('examen')->get();


        // --- Check 1: Duplicate Assignment (YOUR BUG FIX) ---
        if ($profA_other_attributions->contains('examen_id', $attrB_offered->examen_id)) {
            // Log::warning("canSwap: Prof A is already assigned to the exam of attrB_offered.");
            return false;
        }
        if ($profB_other_attributions->contains('examen_id', $attrA_original->examen_id)) {
            // Log::warning("canSwap: Prof B is already assigned to the exam of attrA_original.");
            return false;
        }

        // --- Check 2: Unavailability (Existing Check) ---
        if ($this->hasUnavailabilityConflict($attrB_offered->examen, $profA->unavailabilities()->get()) ||
            $this->hasUnavailabilityConflict($attrA_original->examen, $profB->unavailabilities()->get())) {
            // Log::warning("canSwap: An unavailability conflict was found.");
            return false;
        }

        // --- Check 3: Scheduling Violations (Daily Limit, Gap Days, Time Overlap) ---
        if ($this->hasSchedulingViolation($attrB_offered->examen, $profA_other_attributions) ||
            $this->hasSchedulingViolation($attrA_original->examen, $profB_other_attributions)) {
            // Log::warning("canSwap: A scheduling violation (overlap, daily limit, or gap day) was found.");
            return false;
        }

        // --- Check 4: Max PES per Salle ---
        if ($this->violatesPesPerSalleRule($profA, $attrB_offered) ||
            $this->violatesPesPerSalleRule($profB, $attrA_original)) {
            // Log::warning("canSwap: A Max PES per Salle violation was found.");
            return false;
        }

        // --- Check 7: Sole Module Teacher ---
        // Check if Prof A leaving attrA_original removes the last module teacher
        if ($this->removesLastModuleTeacher($profA, $attrA_original)) {
            Log::warning("canSwap: Swap violates the Sole Module Teacher rule for Prof A leaving original attribution.");
            return false;
        }
        // Check if Prof B leaving attrB_offered removes the last module teacher
        if ($this->removesLastModuleTeacher($profB, $attrB_offered)) {
            Log::warning("canSwap: Swap violates the Sole Module Teacher rule for Prof B leaving offered attribution.");
            return false;
        }

        // --- Check 8: Rank Quotas per Session ---
        if ($this->violatesRankQuota($profA, $profB, $attrA_original, $attrB_offered)) {
            Log::warning("canSwap: Swap violates session-wide rank quotas.");
            return false;
        }

        // Log::info("canSwap: All constraint checks passed.");
        return true;
    }

    /**
     * Helper to check for scheduling conflicts (time overlap, daily limit, gap days)
     * between an exam and a collection of attributions.
     *
     * @param \App\Models\Examen $newExamen The exam to check for conflicts.
     * @param \Illuminate\Database\Eloquent\Collection $existingAttributions Existing attributions.
     * @return bool True if a conflict exists, false otherwise.
     */
    protected function hasSchedulingViolation(\App\Models\Examen $newExamen, $existingAttributions): bool
    {
        $newExamenStart = $newExamen->debut;
        $newExamenEnd = $newExamen->end_datetime;

        foreach ($existingAttributions as $attribution) {
            $existingExamen = $attribution->examen;
            if (!$existingExamen || !$existingExamen->debut) continue;

            $existingExamenStart = $existingExamen->debut;
            $existingExamenEnd = $existingExamen->end_datetime;

            // 1. Check for direct time overlap (existing check)
            if ($newExamenStart->lessThan($existingExamenEnd) && $newExamenEnd->greaterThan($existingExamenStart)) {
                // Log::debug("Scheduling Violation: Time overlap found between new exam {$newExamen->id} and existing exam {$existingExamen->id}.");
                return true;
            }

            // 2. Check for same-day assignment (violates daily limit)
            if ($newExamenStart->isSameDay($existingExamenStart)) {
                // Log::debug("Scheduling Violation: Same-day assignment found between new exam {$newExamen->id} and existing exam {$existingExamen->id}.");
                return true;
            }

            // 3. Check for gap day violation
            $daysDifference = $newExamenStart->diffInDays($existingExamenStart);
            if (abs($daysDifference) === 1) { // Exactly one day apart (consecutive days)
                // Log::debug("Scheduling Violation: Gap day violation found between new exam {$newExamen->id} and existing exam {$existingExamen->id}.");
                return true;
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

    /**
     * Helper to check if assigning an incoming professor to a salle violates the Max PES per Salle rule.
     *
     * @param Professeur $incomingProf The professor who is potentially being assigned.
     * @param Attribution $targetAttribution The attribution (exam and salle) to which the professor is being assigned.
     * @return bool True if a violation exists, false otherwise.
     */
    protected function violatesPesPerSalleRule(Professeur $incomingProf, Attribution $targetAttribution): bool
    {
        // This rule only applies if the incoming professor is a PES
        if ($incomingProf->rang !== Professeur::RANG_PES) {
            return false;
        }

        // Get all other professors already assigned to the same exam and same salle
        $otherProfesseursInSalle = Attribution::where('examen_id', $targetAttribution->examen_id)
            ->where('salle_id', $targetAttribution->salle_id)
            ->where('professeur_id', '!=', $targetAttribution->professeur_id) // Exclude the prof being swapped out
            ->with('professeur')
            ->get()
            ->pluck('professeur');

        // Check if any of them are also PES
        if ($otherProfesseursInSalle->contains('rang', Professeur::RANG_PES)) {
            // Log::warning("PES Rule Violation: Attempting to assign Prof ID {$incomingProf->id} (PES) to a salle that already has a PES professor.");
            return true;
        }

        return false;
    }
}
