<?php

namespace App\Services;

use App\Models\Examen;
use App\Models\Professeur;
use App\Models\Attribution;
use App\Models\Module;
use App\Models\Seson;
use App\Models\Quadrimestre;
use App\Models\Unavailability;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ExamAssignmentService
{
    public const RANK_QUOTAS_PER_SESSION = [
        Professeur::RANG_PES => 2,
        Professeur::RANG_PAG => 4,
        Professeur::RANG_PA  => 6,
    ];
    public const MAX_ASSIGNMENTS_PER_DAY = 1;
    public const ASSIGNMENT_GAP_DAYS = 1;
    public const AM_PM_CUTOFF_HOUR = 13;

    private array $profAssignmentsInCurrentBatch;
    private array $profAssignmentsInSessionTotal;
    private EloquentCollection $allActiveProfesseursForBatch;

    /**
     * Assigns professors to all pending exams within a given Seson.
     */
    public function assignExamsForSeson(Seson $seson): array
    {
        // Log::info("BATCH ASSIGNMENT: Starting for Seson ID {$seson->id} ('{$seson->code}') of AnneeUni ID {$seson->annee_uni_id}.");
        $this->initializeBatchState($seson);

        $overallResult = [
            'total_exams_processed' => 0,
            'total_assignments_made' => 0,
            'exams_with_errors' => [], // [exam_id => [error_messages]]
            'exams_with_warnings' => [], // [exam_id => [warning_messages]]
            'success_messages' => [],    // [exam_id => success_message]
            'final_summary_message' => '',
        ];

        $examsToAssign = Examen::whereHas('quadrimestre', fn($q) => $q->where('seson_id', $seson->id))
            ->withCount('attributions')
            ->with(['module', 'quadrimestre.seson.anneeUni', 'attributions.professeur.modules']) // Load all needed relations
            ->orderBy('debut', 'asc')
            ->get()
            ->filter(function ($examen) {
                return $examen->attributions_count < $examen->total_required_professors;
            });

        $overallResult['total_exams_processed'] = $examsToAssign->count();
        // Log::info("BATCH ASSIGNMENT: Found {$examsToAssign->count()} exams needing assignments in Seson ID {$seson->id}.");

        if ($examsToAssign->isEmpty()) {
            $overallResult['final_summary_message'] = "No exams currently require assignment in this session.";
            return $overallResult;
        }

        $this->allActiveProfesseursForBatch = Professeur::where('statut', 'Active')
            ->where('is_chef_service', false)
            ->with(['user', 'service', 'modules', 'unavailabilities', 'attributions.examen.quadrimestre.seson'])
            ->get();
        // Log::info("BATCH ASSIGNMENT: Fetched " . $this->allActiveProfesseursForBatch->count() . " total active, non-chef professors.");

        foreach ($examsToAssign as $examen) {
            $singleExamResult = $this->assignSingleExamInBatch($examen, $seson);
            $overallResult['total_assignments_made'] += $singleExamResult['attributions_made'];

            if (!empty($singleExamResult['errors'])) {
                $overallResult['exams_with_errors'][$examen->id] = $singleExamResult['errors'];
            }
            if (!empty($singleExamResult['warnings'])) {
                $overallResult['exams_with_warnings'][$examen->id] = $singleExamResult['warnings'];
            }
            if ($singleExamResult['success'] && $singleExamResult['attributions_made'] > 0) {
                 $overallResult['success_messages'][$examen->id] = $singleExamResult['message'];
            } elseif (!$singleExamResult['success'] && empty($singleExamResult['errors'])) { // If success is false but no specific errors
                $overallResult['exams_with_errors'][$examen->id] = [$singleExamResult['message']];
            }

        }

        $finalMessage = "Batch assignment for Seson '{$seson->code}' completed. " .
                        "Exams processed: {$overallResult['total_exams_processed']}. " .
                        "Total new assignments made: {$overallResult['total_assignments_made']}.";
        if (!empty($overallResult['exams_with_errors'])) $finalMessage .= " Exams with errors: " . count($overallResult['exams_with_errors']) . ".";
        if (!empty($overallResult['exams_with_warnings'])) $finalMessage .= " Exams with warnings: " . count($overallResult['exams_with_warnings']) . ".";

        $overallResult['final_summary_message'] = $finalMessage;
        // Log::info("BATCH ASSIGNMENT: {$finalMessage}");
        return $overallResult;
    }

    private function initializeBatchState(Seson $seson): void
    {
        $this->profAssignmentsInCurrentBatch = [];
        $this->profAssignmentsInSessionTotal = [];

        $existingSessionAttributions = Attribution::whereHas('examen.quadrimestre', fn($q) => $q->where('seson_id', $seson->id))
            ->select('professeur_id', DB::raw('count(*) as count'))
            ->groupBy('professeur_id')
            ->pluck('count', 'professeur_id')
            ->all();
        $this->profAssignmentsInSessionTotal = $existingSessionAttributions;
    }

    private function updateBatchAssignmentCounts(Professeur $professeur): void
    {
        $profId = $professeur->id;
        // For current batch run (if needed for "fewest in batch" tie-breaker later, or just general tracking)
        $this->profAssignmentsInCurrentBatch[$profId] = ($this->profAssignmentsInCurrentBatch[$profId] ?? 0) + 1;
        // For overall session quota tracking (including this new assignment)
        $this->profAssignmentsInSessionTotal[$profId] = ($this->profAssignmentsInSessionTotal[$profId] ?? 0) + 1;

        Log::debug("[BATCH_COUNTS_UPDATE] Prof ID {$profId}: Batch assignments = {$this->profAssignmentsInCurrentBatch[$profId]}, Total in session = {$this->profAssignmentsInSessionTotal[$profId]}");
    }

    /**
     * Assigns professors to a single exam, using batch state.
     */
    private function assignSingleExamInBatch(Examen $examen, Seson $sessionContext): array
    {
        // Log::info("------------------------------------------------------------------");
        // Log::info("[ASSIGNMENT_SERVICE] Starting assignment process for Exam '{$examen->nom_or_id}' (ID: {$examen->id}).");

        $result = [
            'success' => true,
            'attributions_made' => 0,
            'message' => "Assignment process initiated for exam '{$examen->nom_or_id}'.",
            'errors' => [],
            'warnings' => [],
        ];

        // Exam relations should already be loaded by the calling batch method
        $existingAttributions = $examen->attributions;
        $existingAttributionsCount = $existingAttributions->count();
        $slotsToFill = $examen->total_required_professors - $existingAttributionsCount;

        // Log::info("[ASSIGNMENT_SERVICE] Exam '{$examen->nom_or_id}': TotalRequired={$examen->total_required_professors}, Existing={$existingAttributionsCount}, SlotsToFill={$slotsToFill}");

        if ($slotsToFill <= 0) {
            $result['message'] = "Exam '{$examen->nom_or_id}' already has sufficient professors assigned.";
            // Log::info("[ASSIGNMENT_SERVICE] {$result['message']}");
            return $result;
        }

        $responsableAlreadyAssigned = $existingAttributions->firstWhere('is_responsable', true);
        $responsablesNeeded = $responsableAlreadyAssigned ? 0 : 1;

        $isModuleTeacherAlreadyPresent = $existingAttributions->contains(function ($attribution) use ($examen) {
            // Make sure modules relation is loaded on the professor if not already
            $attribution->professeur->loadMissing('modules');
            return $attribution->professeur && $attribution->professeur->modules->contains($examen->module_id);
        });

        $isPESAlreadyAssignedToThisExam = $existingAttributions->contains(function ($attribution) {
            return $attribution->professeur && $attribution->professeur->rang === Professeur::RANG_PES;
        });
        // Log::info("[ASSIGNMENT_SERVICE] Initial state for Exam '{$examen->nom_or_id}': ResponsablesNeeded={$responsablesNeeded}, ModuleTeacherPresent=" . ($isModuleTeacherAlreadyPresent ? 'Yes' : 'No') . ", PESAlreadyAssigned=" . ($isPESAlreadyAssignedToThisExam ? 'Yes' : 'No'));

        $profIdsAlreadyAssignedToThisExam = $existingAttributions->pluck('professeur_id')->toArray();
        $candidatePoolForNewSlots = $this->allActiveProfesseursForBatch->whereNotIn('id', $profIdsAlreadyAssignedToThisExam);

        $filteredCandidates = $this->filterCandidatesForExamInBatch($candidatePoolForNewSlots, $examen, $isPESAlreadyAssignedToThisExam, $sessionContext);
        // Log::info("[ASSIGNMENT_SERVICE] After initial filtering for '{$examen->nom_or_id}', " . $filteredCandidates->count() . " candidates remain.");

        if ($responsablesNeeded > 0 && $slotsToFill > 0 && $filteredCandidates->isNotEmpty()) {
            $responsable = $this->selectResponsable($filteredCandidates, $examen, $isPESAlreadyAssignedToThisExam);
            if ($responsable) {
                // Log::info("[ASSIGNMENT_SERVICE] Selected Responsable for '{$examen->nom_or_id}': Prof ID {$responsable->id} ({$responsable->prenom} {$responsable->nom})");
                $this->createAttribution($examen, $responsable, true);
                $this->updateBatchAssignmentCounts($responsable);
                $result['attributions_made']++; $slotsToFill--; $responsablesNeeded--;
                if ($responsable->modules->contains($examen->module_id)) $isModuleTeacherAlreadyPresent = true;
                if ($responsable->rang === Professeur::RANG_PES) {
                    $isPESAlreadyAssignedToThisExam = true;
                    $filteredCandidates = $filteredCandidates->except($responsable->id);
                    $filteredCandidates = $this->filterCandidatesForExamInBatch($filteredCandidates, $examen, true, $sessionContext);
                } else {
                    $filteredCandidates = $filteredCandidates->except($responsable->id);
                }
            } else {
                $warningMsg = "Could not assign a 'Responsable' for exam '{$examen->nom_or_id}'. No suitable candidate after filtering.";
                $result['warnings'][] = $warningMsg;
                Log::warning("[ASSIGNMENT_SERVICE] {$warningMsg}");
            }
        }

        while ($slotsToFill > 0 && $filteredCandidates->isNotEmpty()) {
            // Log::info("[ASSIGNMENT_SERVICE] Attempting to fill {$slotsToFill} more slots for '{$examen->nom_or_id}'. Candidates left: {$filteredCandidates->count()}");
            $poolToSelectFrom = $this->determineCandidatePool($filteredCandidates, $examen, $isModuleTeacherAlreadyPresent);
            if ($poolToSelectFrom->isEmpty()) {
                Log::warning("[ASSIGNMENT_SERVICE] No candidates left in the determined pool for '{$examen->nom_or_id}'.");
                break;
            }
            $invigilator = $this->selectInvigilator($poolToSelectFrom, $examen, $isPESAlreadyAssignedToThisExam);
            if ($invigilator) {
                // Log::info("[ASSIGNMENT_SERVICE] Selected Invigilator for '{$examen->nom_or_id}': Prof ID {$invigilator->id} ({$invigilator->prenom} {$invigilator->nom})");
                $this->createAttribution($examen, $invigilator, false);
                $this->updateBatchAssignmentCounts($invigilator);
                $result['attributions_made']++; $slotsToFill--;
                if (!$isModuleTeacherAlreadyPresent && $invigilator->modules->contains($examen->module_id)) $isModuleTeacherAlreadyPresent = true;
                if ($invigilator->rang === Professeur::RANG_PES) {
                    $isPESAlreadyAssignedToThisExam = true;
                    $filteredCandidates = $filteredCandidates->except($invigilator->id);
                    $filteredCandidates = $this->filterCandidatesForExamInBatch($filteredCandidates, $examen, true, $sessionContext);
                } else {
                    $filteredCandidates = $filteredCandidates->except($invigilator->id);
                }
            } else {
                Log::warning("[ASSIGNMENT_SERVICE] No suitable invigilator found from the current pool for '{$examen->nom_or_id}'.");
                break;
            }
        }

        if ($slotsToFill > 0) {
            $errorMsg = "Could not fill all required slots for exam '{$examen->nom_or_id}'. {$slotsToFill} slots remain.";
            $result['errors'][] = $errorMsg; $result['success'] = false;
            // Log::error("[ASSIGNMENT_SERVICE] {$errorMsg}");
        }
        $examen->loadCount('attributions'); // Refresh count for final module teacher check
        if ($examen->attributions_count > 0 && !$isModuleTeacherAlreadyPresent) {
            $warningMsg = "Warning: No module teacher assigned for exam '{$examen->nom_or_id}'.";
            $result['warnings'][] = $warningMsg;
            Log::warning("[ASSIGNMENT_SERVICE] {$warningMsg}");
        }

        if (empty($result['errors']) && $result['attributions_made'] > 0) {
            $result['message'] = "Successfully made {$result['attributions_made']} new assignments for exam '{$examen->nom_or_id}'.";
        } elseif (empty($result['errors']) && $result['attributions_made'] === 0 && empty($result['warnings'])) {
            if (($examen->total_required_professors - $existingAttributionsCount) > 0 && $this->allActiveProfesseursForBatch->isNotEmpty()) {
                $initialCandidates = $this->allActiveProfesseursForBatch->whereNotIn('id', $profIdsAlreadyAssignedToThisExam);
                if ($this->filterCandidatesForExamInBatch($initialCandidates, $examen, $isPESAlreadyAssignedToThisExam, $sessionContext)->isEmpty() && $initialCandidates->isNotEmpty()){
                    $result['message'] = "No suitable candidates found for exam '{$examen->nom_or_id}'.";
                } else {
                     $result['message'] = "No new assignments made for exam '{$examen->nom_or_id}'. All slots might be filled or no candidates were available.";
                }
            } else {
                 $result['message'] = "No new assignments needed or made for exam '{$examen->nom_or_id}'.";
            }
        } elseif (!empty($result['errors'])) {
            $result['message'] = "Assignment process for exam '{$examen->nom_or_id}' failed to fill all slots.";
        } elseif(!empty($result['warnings'])) {
            $result['message'] = "Assignment process for exam '{$examen->nom_or_id}' completed with warnings.";
        }

        // Log::info("[ASSIGNMENT_SERVICE] Finished individual assignment for Exam '{$examen->nom_or_id}'. Made: {$result['attributions_made']}. Message: {$result['message']}");
        return $result;
    }


    private function filterCandidatesForExamInBatch(EloquentCollection $professeurs, Examen $examen, bool $isPESAlreadyAssignedToThisExam, Seson $sessionContext): EloquentCollection
    {
        $examStart = Carbon::parse($examen->debut);
        $examEnd = $examen->end_datetime;
        $examDateStr = $examStart->toDateString();

        return $professeurs->filter(function (Professeur $prof) use ($examen, $examStart, $examEnd, $examDateStr, $sessionContext, $isPESAlreadyAssignedToThisExam) {
            $profId = $prof->id;

            if ($isPESAlreadyAssignedToThisExam && $prof->rang === Professeur::RANG_PES) {
                // Log::debug("[Filter][Prof ID: {$profId}] FAILED: PES already assigned to this Exam ID {$examen->id}.");
                return false;
            }

            foreach ($prof->unavailabilities as $unavailability) {
                $unavStart = Carbon::parse($unavailability->start_datetime);
                $unavEnd = Carbon::parse($unavailability->end_datetime);
                if ($examStart->lt($unavEnd) && $examEnd->gt($unavStart)) {
                    // Log::debug("[Filter][Prof ID: {$profId}] FAILED: Unavailability overlap with Exam ID {$examen->id}.");
                    return false;
                }
            }

            $assignmentsOnExamDayCount = 0;
            $assignedOnPreviousOrNextGapDay = false;
            foreach ($prof->attributions as $attribution) {
                if ($attribution->examen_id === $examen->id) continue; // Already assigned to this exam, handled by initial pool filter

                $assignedExam = $attribution->examen; // Relation should be loaded
                if (!$assignedExam) continue; // Should not happen if eager loaded

                $assignedExamStart = Carbon::parse($assignedExam->debut);
                $assignedExamEnd = $assignedExam->end_datetime;

                if ($examStart->lt($assignedExamEnd) && $examEnd->gt($assignedExamStart)) {
                    // Log::debug("[Filter][Prof ID: {$profId}] FAILED: Overlapping with other Exam ID {$assignedExam->id}.");
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
                // Log::debug("[Filter][Prof ID: {$profId}] FAILED: Daily limit violation for date {$examDateStr}.");
                return false;
            }
            if ($assignedOnPreviousOrNextGapDay) {
                // Log::debug("[Filter][Prof ID: {$profId}] FAILED: Gap day rule violation around {$examDateStr}.");
                return false;
            }

            // Use the batch-aware total session assignment count for quota check
            $assignmentsInSessionForThisProf = $this->profAssignmentsInSessionTotal[$profId] ?? 0;
            $quotaForRank = self::RANK_QUOTAS_PER_SESSION[$prof->rang] ?? 999;
            if ($assignmentsInSessionForThisProf >= $quotaForRank) {
                // Log::debug("[Filter][Prof ID: {$profId}] FAILED: Rank quota ({$assignmentsInSessionForThisProf}/{$quotaForRank}) for rank {$prof->rang} in Session ID {$sessionContext->id}.");
                return false;
            }
            return true;
        });
    }

    // Original per-exam trigger method, now wraps batch logic for consistency
    public function assignProfessorsToExam(Examen $examen): array
    {
        if (!$examen->quadrimestre || !$examen->quadrimestre->seson) {
            //  Log::error("[ASSIGNMENT_SERVICE] Exam ID {$examen->id} ('{$examen->nom_or_id}') is missing quadrimestre or session context. Cannot proceed.");
             return ['success' => false, 'attributions_made' => 0, 'message' => 'Exam session context missing.', 'errors' => ["Exam '{$examen->nom_or_id}' is missing necessary session information."], 'warnings' => []];
        }
        $this->initializeBatchState($examen->quadrimestre->seson);
        $this->allActiveProfesseursForBatch = Professeur::where('statut', 'Active')
            ->where('is_chef_service', false)
            ->with(['user', 'service', 'modules', 'unavailabilities', 'attributions.examen.quadrimestre.seson'])
            ->get();

        // Call the internal worker method
        $result = $this->assignSingleExamInBatch($examen, $examen->quadrimestre->seson);
        // Final message construction is now inside assignSingleExamInBatch
        return $result;
    }


    private function determineCandidatePool(EloquentCollection $availableCandidates, Examen $examen, bool $isModuleTeacherAlreadyPresent): EloquentCollection
    {
        if (!$isModuleTeacherAlreadyPresent) {
            $moduleTeachers = $availableCandidates->filter(fn($prof) => $prof->modules->contains($examen->module_id));
            if ($moduleTeachers->isNotEmpty()) {
                Log::debug("[POOL_DETERMINATION] Prioritizing Module Teacher pool ({$moduleTeachers->count()}) for Exam '{$examen->nom_or_id}'.");
                return $moduleTeachers;
            }
        }
        Log::debug("[POOL_DETERMINATION] Using General Candidate pool ({$availableCandidates->count()}) for Exam '{$examen->nom_or_id}'.");
        return $availableCandidates;
    }

    private function selectResponsable(EloquentCollection $candidates, Examen $examen, bool $isPESAlreadyAssignedToExam): ?Professeur
    {
        if ($candidates->isEmpty()) return null;
        $eligibleCandidates = $isPESAlreadyAssignedToExam
            ? $candidates->where('rang', '!=', Professeur::RANG_PES)
            : $candidates;
        if ($eligibleCandidates->isEmpty()) return null;

        return $eligibleCandidates->sortBy([
            fn($prof) => array_search($prof->rang, [Professeur::RANG_PES, Professeur::RANG_PAG, Professeur::RANG_PA]),
            ['date_recrutement', 'asc'],
        ])->first();
    }

    private function selectInvigilator(EloquentCollection $candidates, Examen $examen, bool $isPESAlreadyAssignedToExam): ?Professeur
    {
        if ($candidates->isEmpty()) return null;
        // If a PES is assigned, eligible candidates passed here should already be non-PES
        // $eligibleCandidates = $isPESAlreadyAssignedToExam ? $candidates->where('rang', '!=', Professeur::RANG_PES) : $candidates;
        // if ($eligibleCandidates->isEmpty()) return null;
        // The above is now handled by the main loop's re-filtering after a PES is assigned.
        // So, $candidates here is already the correct pool considering the PES rule for this exam.

        $isExamAM = Carbon::parse($examen->debut)->hour < self::AM_PM_CUTOFF_HOUR;
        return $candidates->sortBy(function (Professeur $prof) use ($isExamAM) {
            $priorityScore = 0;
            if ($isExamAM && $prof->specialite === Professeur::SPECIALITE_MEDICAL) $priorityScore -= 10;
            elseif (!$isExamAM && $prof->specialite === Professeur::SPECIALITE_SURGICAL) $priorityScore -= 10;
            $rankOrder = [Professeur::RANG_PA => 0, Professeur::RANG_PAG => 1, Professeur::RANG_PES => 2];
            $priorityScore += $rankOrder[$prof->rang] ?? 3;
            return $priorityScore;
        })->first();
    }

    private function createAttribution(Examen $examen, Professeur $professeur, bool $isResponsable): Attribution
    {
        // Log::info("[ATTRIBUTION_CREATED] Exam ID {$examen->id} ('{$examen->nom_or_id}'), Prof ID {$professeur->id} ('{$professeur->prenom} {$professeur->nom}'), Responsable: " . ($isResponsable ? 'Yes' : 'No'));
        return Attribution::create([
            'examen_id' => $examen->id,
            'professeur_id' => $professeur->id,
            'is_responsable' => $isResponsable,
        ]);
    }
}