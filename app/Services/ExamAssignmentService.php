<?php

namespace App\Services;

use App\Models\Examen;
use App\Models\Professeur;
use App\Models\Attribution;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Facades\Log;

class ExamAssignmentService
{
    // --- Constants for Rules ---
    public const RANK_QUOTAS_PER_SESSION = [
        Professeur::RANG_PES => 2, // e.g., 'PES' => 2
        Professeur::RANG_PAG => 4, // e.g., 'PAG' => 4
        Professeur::RANG_PA  => 6, // e.g., 'PA'  => 6
    ];
    public const MAX_ASSIGNMENTS_PER_DAY = 1;
    public const ASSIGNMENT_GAP_DAYS = 1; // At least 1 full day between assignments
    public const AM_PM_CUTOFF_HOUR = 13; // Exams starting before this hour (e.g., 1 PM) are AM

    public function assignProfessorsToExam(Examen $examen): array
    {
        // Log::info("------------------------------------------------------------------");
        // Log::info("[ASSIGNMENT_SERVICE] Starting assignment process for Exam '{$examen->nom_or_id}' (ID: {$examen->id})");

        $result = [
            'success' => true,
            'attributions_made' => 0,
            'message' => "Assignment process initiated for exam '{$examen->nom_or_id}'.",
            'errors' => [],
            'warnings' => [],
        ];

        $examen->loadMissing(['attributions.professeur.modules', 'module', 'quadrimestre.seson.anneeUni']);

        $existingAttributions = $examen->attributions;
        $existingAttributionsCount = $existingAttributions->count();
        $slotsToFill = $examen->required_professors - $existingAttributionsCount;

        // Log::info("[ASSIGNMENT_SERVICE] Exam '{$examen->nom_or_id}': Required={$examen->required_professors}, Existing={$existingAttributionsCount}, SlotsToFill={$slotsToFill}");

        if ($slotsToFill <= 0) {
            $result['message'] = "Exam '{$examen->nom_or_id}' already has sufficient professors assigned.";
            Log::info("[ASSIGNMENT_SERVICE] {$result['message']}");
            return $result;
        }

        $responsableAlreadyAssigned = $existingAttributions->firstWhere('is_responsable', true);
        $responsablesNeeded = $responsableAlreadyAssigned ? 0 : 1;

        $isModuleTeacherAlreadyPresent = $existingAttributions->contains(function ($attribution) use ($examen) {
            return $attribution->professeur && $attribution->professeur->modules->contains($examen->module_id);
        });

        // Log::info("[ASSIGNMENT_SERVICE] ResponsablesNeeded: {$responsablesNeeded}, IsModuleTeacherAlreadyPresent: " . ($isModuleTeacherAlreadyPresent ? 'Yes' : 'No'));

        $allActiveProfesseurs = Professeur::where('statut', 'Active')
            ->where('is_chef_service', false)
            ->with([
                'user', 'service', 'modules', 'unavailabilities',
                'attributions.examen.quadrimestre.seson' // For checking existing load and session quotas
            ])
            ->get();

        // Log::info("[ASSIGNMENT_SERVICE] Fetched " . $allActiveProfesseurs->count() . " active, non-chef professors for consideration.");

        // Filter out professors already assigned to THIS exam for NEW slots
        $profIdsAlreadyAssignedToThisExam = $existingAttributions->pluck('professeur_id')->toArray();
        $candidatePoolForNewSlots = $allActiveProfesseurs->whereNotIn('id', $profIdsAlreadyAssignedToThisExam);

        $filteredCandidates = $this->filterCandidatesForExam($candidatePoolForNewSlots, $examen);
        // Log::info("[ASSIGNMENT_SERVICE] After initial filtering, " . $filteredCandidates->count() . " candidates remain.");


        // --- Assign Responsable ---
        if ($responsablesNeeded > 0 && $slotsToFill > 0 && $filteredCandidates->isNotEmpty()) {
            $responsable = $this->selectResponsable($filteredCandidates, $examen);
            if ($responsable) {
                // Log::info("[ASSIGNMENT_SERVICE] Selected Responsable: Prof ID {$responsable->id} ({$responsable->prenom} {$responsable->nom})");
                $this->createAttribution($examen, $responsable, true);
                $result['attributions_made']++;
                $slotsToFill--;
                $responsablesNeeded--;
                if ($responsable->modules->contains($examen->module_id)) {
                    $isModuleTeacherAlreadyPresent = true;
                }
                // Remove assigned professor from further consideration for this exam's remaining slots
                $filteredCandidates = $filteredCandidates->except($responsable->id);
            } else {
                $warningMsg = "Could not assign a 'Responsable' for exam '{$examen->nom_or_id}'.";
                $result['warnings'][] = $warningMsg;
                // Log::warning("[ASSIGNMENT_SERVICE] {$warningMsg}");
            }
        }

        // --- Assign Remaining Invigilators ---
        while ($slotsToFill > 0 && $filteredCandidates->isNotEmpty()) {
            // Log::info("[ASSIGNMENT_SERVICE] Attempting to fill {$slotsToFill} more slots. Candidates: {$filteredCandidates->count()}");
            $poolToSelectFrom = $this->determineCandidatePool($filteredCandidates, $examen, $isModuleTeacherAlreadyPresent);

            if ($poolToSelectFrom->isEmpty()) {
                // Log::warning("[ASSIGNMENT_SERVICE] No candidates left in the determined pool.");
                break;
            }

            $invigilator = $this->selectInvigilator($poolToSelectFrom, $examen);
            if ($invigilator) {
                // Log::info("[ASSIGNMENT_SERVICE] Selected Invigilator: Prof ID {$invigilator->id} ({$invigilator->prenom} {$invigilator->nom})");
                $this->createAttribution($examen, $invigilator, false);
                $result['attributions_made']++;
                $slotsToFill--;
                if (!$isModuleTeacherAlreadyPresent && $invigilator->modules->contains($examen->module_id)) {
                    $isModuleTeacherAlreadyPresent = true;
                }
                $filteredCandidates = $filteredCandidates->except($invigilator->id);
            } else {
                // Log::warning("[ASSIGNMENT_SERVICE] No suitable invigilator found from the current pool.");
                break;
            }
        }

        // --- Final Checks and Reporting ---
        if ($slotsToFill > 0) {
            $errorMsg = "Could not fill all required slots for exam '{$examen->nom_or_id}'. {$slotsToFill} slots remain.";
            $result['errors'][] = $errorMsg;
            $result['success'] = false; // Mark as not fully successful if slots remain
            // Log::error("[ASSIGNMENT_SERVICE] {$errorMsg}");
        }
        // Reload attributions to get the most current count for the module teacher check
        $finalAttributionsCount = $examen->fresh()->attributions()->count();
        if ($finalAttributionsCount > 0 && !$isModuleTeacherAlreadyPresent) {
            $warningMsg = "Warning: No module teacher assigned for exam '{$examen->nom_or_id}'.";
            $result['warnings'][] = $warningMsg;
            // Log::warning("[ASSIGNMENT_SERVICE] {$warningMsg}");
        }

        if (empty($result['errors']) && $result['attributions_made'] > 0) {
            $result['message'] = "Successfully made {$result['attributions_made']} new assignments for exam '{$examen->nom_or_id}'.";
        } elseif (empty($result['errors']) && $result['attributions_made'] === 0 && empty($result['warnings']) && $slotsToFill === ($examen->required_professors - $existingAttributionsCount)) {
            // No new assignments made, and no slots were open OR no candidates found initially
             if (($examen->required_professors - $existingAttributionsCount) > 0 && $allActiveProfesseurs->count() > 0 && $this->filterCandidatesForExam($allActiveProfesseurs->whereNotIn('id', $profIdsAlreadyAssignedToThisExam), $examen)->isEmpty()){
                $result['message'] = "No suitable candidates found for exam '{$examen->nom_or_id}'.";
             } else if (($examen->required_professors - $existingAttributionsCount) <=0) {
                 // This case is handled at the top
             }
             else {
                 $result['message'] = "No new assignments made for exam '{$examen->nom_or_id}'. All slots might be filled or no suitable candidates found.";
             }
        } elseif (!empty($result['errors'])) {
            $result['message'] = "Assignment process for exam '{$examen->nom_or_id}' failed to fill all slots.";
        } elseif(!empty($result['warnings'])) {
            $result['message'] = "Assignment process for exam '{$examen->nom_or_id}' completed with warnings.";
        }


        // Log::info("[ASSIGNMENT_SERVICE] Finished assignment process for Exam ID: {$examen->id}. Result: ", $result);
        // Log::info("------------------------------------------------------------------");
        return $result;
    }

    private function filterCandidatesForExam(EloquentCollection $professeurs, Examen $examen): EloquentCollection
    {
        $examStart = Carbon::parse($examen->debut);
        $examEnd = Carbon::parse($examen->fin);
        $examDateStr = $examStart->toDateString();
        $sessionForQuota = $examen->quadrimestre->seson; // Assumes quadrimestre.seson is loaded

        if (!$sessionForQuota) {
            // Log::error("[Filter] Exam ID {$examen->id} is missing session information for quota checks. Skipping quota filter.");
            // Potentially return empty collection or throw exception if session is mandatory
        }

        return $professeurs->filter(function (Professeur $prof) use ($examen, $examStart, $examEnd, $examDateStr, $sessionForQuota) {
            $profId = $prof->id;
            // Log::debug("[Filter][Prof ID: {$profId}] Starting checks for {$prof->prenom} {$prof->nom}.");

            // 1. Unavailability Check
            foreach ($prof->unavailabilities as $unavailability) {
                $unavStart = Carbon::parse($unavailability->start_datetime);
                $unavEnd = Carbon::parse($unavailability->end_datetime);
                if ($examStart->lt($unavEnd) && $examEnd->gt($unavStart)) {
                    // Log::debug("[Filter][Prof ID: {$profId}] FAILED: Unavailability overlap {$unavStart->toDateTimeString()}-{$unavEnd->toDateTimeString()}.");
                    return false;
                }
            }

            // 2. Existing Assignments Checks
            $assignmentsOnExamDayCount = 0;
            $assignedOnPreviousOrNextGapDay = false;

            foreach ($prof->attributions as $attribution) {
                if ($attribution->examen_id === $examen->id) continue; // Skip self

                $assignedExamStart = Carbon::parse($attribution->examen->debut);
                $assignedExamEnd = Carbon::parse($attribution->examen->fin);

                if ($examStart->lt($assignedExamEnd) && $examEnd->gt($assignedExamStart)) {
                    // Log::debug("[Filter][Prof ID: {$profId}] FAILED: Overlapping assignment with Exam ID {$attribution->examen_id}.");
                    return false;
                }
                if ($assignedExamStart->isSameDay($examStart)) {
                    $assignmentsOnExamDayCount++;
                }

                $daysDifference = $assignedExamStart->diffInDays($examStart, false);
                if (abs($daysDifference) > 0 && abs($daysDifference) <= self::ASSIGNMENT_GAP_DAYS) {
                    $assignedOnPreviousOrNextGapDay = true;
                }
            }

            if ($assignmentsOnExamDayCount >= self::MAX_ASSIGNMENTS_PER_DAY) {
                // Log::debug("[Filter][Prof ID: {$profId}] FAILED: Exceeds max assignments ({$assignmentsOnExamDayCount}) for day {$examDateStr}.");
                return false;
            }
            if ($assignedOnPreviousOrNextGapDay) {
                // Log::debug("[Filter][Prof ID: {$profId}] FAILED: 1-day gap rule violation around {$examDateStr}.");
                return false;
            }

            // 3. Rank Quotas
            if ($sessionForQuota) {
                $assignmentsInSessionCount = $prof->attributions->filter(function ($att) use ($sessionForQuota) {
                    return $att->examen && $att->examen->quadrimestre && $att->examen->quadrimestre->seson_id === $sessionForQuota->id;
                })->count();

                $quotaForRank = self::RANK_QUOTAS_PER_SESSION[$prof->rang] ?? 999;
                if ($assignmentsInSessionCount >= $quotaForRank) {
                    // Log::debug("[Filter][Prof ID: {$profId}] FAILED: Exceeds rank quota ({$assignmentsInSessionCount}/{$quotaForRank}) for rank {$prof->rang} in Session ID {$sessionForQuota->id}.");
                    return false;
                }
            }

            // Log::debug("[Filter][Prof ID: {$profId}] PASSED all filters.");
            return true;
        });
    }

    private function determineCandidatePool(EloquentCollection $availableCandidates, Examen $examen, bool $isModuleTeacherAlreadyPresent): EloquentCollection
    {
        if (!$isModuleTeacherAlreadyPresent) {
            $moduleTeachers = $availableCandidates->filter(function ($prof) use ($examen) {
                return $prof->modules->contains($examen->module_id);
            });
            if ($moduleTeachers->isNotEmpty()) {
                // Log::debug("[ASSIGNMENT_SERVICE] Prioritizing Module Teacher pool ({$moduleTeachers->count()} candidates).");
                return $moduleTeachers;
            }
        }
        // Log::debug("[ASSIGNMENT_SERVICE] Using General Candidate pool ({$availableCandidates->count()} candidates).");
        return $availableCandidates;
    }

    private function selectResponsable(EloquentCollection $candidates, Examen $examen): ?Professeur
    {
        if ($candidates->isEmpty()) return null;
        return $candidates->sortBy([
            fn($prof) => array_search($prof->rang, [Professeur::RANG_PES, Professeur::RANG_PAG, Professeur::RANG_PA]), // PES=0, PAG=1, PA=2
            ['date_recrutement', 'asc'],
        ])->first();
    }

    private function selectInvigilator(EloquentCollection $candidates, Examen $examen): ?Professeur
    {
        if ($candidates->isEmpty()) return null;
        $isExamAM = Carbon::parse($examen->debut)->hour < self::AM_PM_CUTOFF_HOUR;

        return $candidates->sortBy(function (Professeur $prof) use ($isExamAM) {
            $priorityScore = 0; // Lower is better
            if ($isExamAM && $prof->specialite === Professeur::SPECIALITE_MEDICAL) $priorityScore -= 10;
            elseif (!$isExamAM && $prof->specialite === Professeur::SPECIALITE_SURGICAL) $priorityScore -= 10;

            $rankOrder = [Professeur::RANG_PA => 0, Professeur::RANG_PAG => 1, Professeur::RANG_PES => 2];
            $priorityScore += $rankOrder[$prof->rang] ?? 3;
            return $priorityScore;
        })->first();
    }

    private function createAttribution(Examen $examen, Professeur $professeur, bool $isResponsable): Attribution
    {
        // Log::info("[ASSIGNMENT_SERVICE] Creating attribution: Exam ID {$examen->id}, Prof ID {$professeur->id}, Responsable: " . ($isResponsable ? 'Yes' : 'No'));
        return Attribution::create([
            'examen_id' => $examen->id,
            'professeur_id' => $professeur->id,
            'is_responsable' => $isResponsable,
        ]);
    }
}