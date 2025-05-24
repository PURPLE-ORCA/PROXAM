<?php

namespace App\Services;

use App\Models\Examen;
use App\Models\Professeur;
use App\Models\Attribution;
use App\Models\Module;
use App\Models\Seson;
use App\Models\Quadrimestre;
use App\Models\Unavailability;
use App\Models\Salle; // Ensure Salle is imported
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ExamAssignmentService
{
    // --- Constants for Rules ---
    public const RANK_QUOTAS_PER_SESSION = [
        Professeur::RANG_PES => 2,
        Professeur::RANG_PAG => 4,
        Professeur::RANG_PA  => 6,
    ];
    public const MAX_ASSIGNMENTS_PER_DAY = 1;
    public const ASSIGNMENT_GAP_DAYS = 1;
    public const AM_PM_CUTOFF_HOUR = 13;

    private array $profAssignmentsInCurrentBatch; // [prof_id => count for current batch run]
    private array $profAssignmentsInSessionTotal; // [prof_id => count for entire session (DB + batch)]
    private EloquentCollection $allActiveProfesseursForBatch; // Cache of all active professors for the batch
    private array $professorsAssignedToCurrentExamOverall; // Tracks [prof_id] assigned to any room of the current exam being processed

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
            'exams_with_errors' => [],
            'exams_with_warnings' => [],
            'success_messages' => [],
            'final_summary_message' => '',
        ];

        $examsToAssign = Examen::whereHas('quadrimestre', fn($q) => $q->where('seson_id', $seson->id))
            ->withCount('attributions') // Counts existing total attributions for the exam
            ->with([ // Eager load everything needed for individual exam processing
                'module',
                'quadrimestre.seson.anneeUni',
                'salles', // Crucial: includes pivot data 'professeurs_assignes_salle'
                'attributions.professeur.modules', // For existing attributions on exams
            ])
            ->orderBy('debut', 'asc')
            ->get()
            ->filter(function ($examen) {
                // total_required_professors is an accessor summing pivot data from 'salles'
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
        // Log::info("BATCH ASSIGNMENT: Fetched " . $this->allActiveProfesseursForBatch->count() . " total active, non-chef professors for consideration.");

        foreach ($examsToAssign as $examen) {
            $singleExamResult = $this->assignSingleExamInBatch($examen, $seson); // Pass $seson for context
            $overallResult['total_assignments_made'] += $singleExamResult['attributions_made'];

            if (!empty($singleExamResult['errors'])) {
                $overallResult['exams_with_errors'][$examen->id] = $singleExamResult['errors'];
            }
            if (!empty($singleExamResult['warnings'])) {
                $overallResult['exams_with_warnings'][$examen->id] = $singleExamResult['warnings'];
            }
            if ($singleExamResult['success'] && $singleExamResult['attributions_made'] > 0) {
                 $overallResult['success_messages'][$examen->id] = $singleExamResult['message'];
            } elseif (!$singleExamResult['success'] && empty($singleExamResult['errors'])) {
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
        $this->profAssignmentsInCurrentBatch = []; // Tracks assignments made *in this specific batch run*
        $this->profAssignmentsInSessionTotal = []; // Tracks *all* assignments for the session (DB + this batch)

        $existingSessionAttributions = Attribution::whereHas('examen.quadrimestre', fn($q) => $q->where('seson_id', $seson->id))
            ->select('professeur_id', DB::raw('count(*) as count'))
            ->groupBy('professeur_id')
            ->pluck('count', 'professeur_id')
            ->all(); // [prof_id => count]
        $this->profAssignmentsInSessionTotal = $existingSessionAttributions;
    }

    private function updateBatchAssignmentCounts(Professeur $professeur): void
    {
        $profId = $professeur->id;
        $this->profAssignmentsInCurrentBatch[$profId] = ($this->profAssignmentsInCurrentBatch[$profId] ?? 0) + 1;
        $this->profAssignmentsInSessionTotal[$profId] = ($this->profAssignmentsInSessionTotal[$profId] ?? 0) + 1;
        // Log::debug("[BATCH_COUNTS_UPDATE] Prof ID {$profId}: Batch assignments = {$this->profAssignmentsInCurrentBatch[$profId]}, Total in session = {$this->profAssignmentsInSessionTotal[$profId]}");
    }

    /**
     * Internal worker for assigning professors to a single exam, using batch state.
     */
    private function assignSingleExamInBatch(Examen $examen, Seson $sessionContext): array
    {
        // Log::info("--- Processing Exam '{$examen->nom_or_id}' (ID: {$examen->id}) ---");
        $result = ['success' => true, 'attributions_made' => 0, 'message' => '', 'errors' => [], 'warnings' => []];
        $this->professorsAssignedToCurrentExamOverall = $examen->attributions->pluck('professeur_id')->toArray(); // Init with existing

        // Iterate over each salle configured for this exam
        foreach ($examen->salles as $salle) {
            $profNeededInThisSalle = $salle->pivot->professeurs_assignes_salle;
            $existingAttributionsInThisSalle = $examen->attributions->where('salle_id', $salle->id);
            $slotsToFillInThisSalle = $profNeededInThisSalle - $existingAttributionsInThisSalle->count();

            // Log::info("[EXAM_SALLE] Salle '{$salle->nom}' (ID: {$salle->id}) for Exam '{$examen->nom_or_id}': ProfsNeeded={$profNeededInThisSalle}, ExistingInSalle={$existingAttributionsInThisSalle->count()}, SlotsToFillInSalle={$slotsToFillInThisSalle}");

            if ($slotsToFillInThisSalle <= 0) {
                // Log::info("[EXAM_SALLE] Salle '{$salle->nom}' already has sufficient staff for Exam '{$examen->nom_or_id}'.");
                continue;
            }

            $responsableAlreadyInThisSalle = $existingAttributionsInThisSalle->firstWhere('is_responsable', true);
            $responsableNeededInThisSalle = $responsableAlreadyInThisSalle ? 0 : 1;

            $isPESAlreadyInThisSalle = $existingAttributionsInThisSalle->contains(fn($att) => $att->professeur && $att->professeur->rang === Professeur::RANG_PES);

            // Candidates are those active profs not yet assigned to ANY room of THIS exam
            $candidatePoolForSalle = $this->allActiveProfesseursForBatch->whereNotIn('id', $this->professorsAssignedToCurrentExamOverall);
            $filteredCandidatesForSalle = $this->filterCandidatesForExamInBatch($candidatePoolForSalle, $examen, $isPESAlreadyInThisSalle, $sessionContext);
            // Log::info("[EXAM_SALLE] Salle '{$salle->nom}': Filtered candidates before assignment = {$filteredCandidatesForSalle->count()}");

            // Assign Responsable for this Salle
            if ($responsableNeededInThisSalle > 0 && $slotsToFillInThisSalle > 0 && $filteredCandidatesForSalle->isNotEmpty()) {
                $responsable = $this->selectResponsable($filteredCandidatesForSalle, $examen, $isPESAlreadyInThisSalle); // isPES for this salle
                if ($responsable) {
                    $this->createAttribution($examen, $responsable, true, $salle->id);
                    $this->updateBatchAssignmentCounts($responsable);
                    $this->professorsAssignedToCurrentExamOverall[] = $responsable->id;
                    $result['attributions_made']++; $slotsToFillInThisSalle--;
                    if ($responsable->rang === Professeur::RANG_PES) $isPESAlreadyInThisSalle = true;
                    $filteredCandidatesForSalle = $filteredCandidatesForSalle->except($responsable->id);
                    // Re-filter for this salle if a PES became responsable
                    if ($isPESAlreadyInThisSalle) {
                        $filteredCandidatesForSalle = $this->filterCandidatesForExamInBatch($filteredCandidatesForSalle, $examen, true, $sessionContext);
                    }
                } else { $result['warnings'][] = "No responsable for Salle '{$salle->nom}' in Exam '{$examen->nom_or_id}'."; }
            }

            // Assign Remaining Invigilators for this Salle
            while ($slotsToFillInThisSalle > 0 && $filteredCandidatesForSalle->isNotEmpty()) {
                // Module teacher check is for the overall exam, not per salle.
                // Reload current attributions for the whole exam to check for module teacher presence accurately.
                $currentExamAttributionsForModuleCheck = Attribution::where('examen_id', $examen->id)->with('professeur.modules')->get();
                $isModuleTeacherPresentForExam = $currentExamAttributionsForModuleCheck->contains(fn($att) => $att->professeur && $att->professeur->modules->contains($examen->module_id));

                $poolToSelectFrom = $this->determineCandidatePool($filteredCandidatesForSalle, $examen, $isModuleTeacherPresentForExam);
                if ($poolToSelectFrom->isEmpty()) break;

                $invigilator = $this->selectInvigilator($poolToSelectFrom, $examen, $isPESAlreadyInThisSalle); // isPES for this salle
                if ($invigilator) {
                    $this->createAttribution($examen, $invigilator, false, $salle->id);
                    $this->updateBatchAssignmentCounts($invigilator);
                    $this->professorsAssignedToCurrentExamOverall[] = $invigilator->id;
                    $result['attributions_made']++; $slotsToFillInThisSalle--;
                    if ($invigilator->rang === Professeur::RANG_PES) {
                        $isPESAlreadyInThisSalle = true;
                        $filteredCandidatesForSalle = $filteredCandidatesForSalle->except($invigilator->id);
                        $filteredCandidatesForSalle = $this->filterCandidatesForExamInBatch($filteredCandidatesForSalle, $examen, true, $sessionContext);
                    } else {
                        $filteredCandidatesForSalle = $filteredCandidatesForSalle->except($invigilator->id);
                    }
                } else { break; }
            }
            if ($slotsToFillInThisSalle > 0) {
                $result['errors'][] = "Could not fill {$slotsToFillInThisSalle} slots for Salle '{$salle->nom}' in Exam '{$examen->nom_or_id}'.";
                // $result['success'] = false; // Only set overall success to false if any exam has errors at the end
            }
        } // End foreach salle

        // Final overall checks for the exam
        $finalAttributions = Attribution::where('examen_id', $examen->id)->with('professeur.modules')->get();
        if ($finalAttributions->count() < $examen->total_required_professors) {
            $result['success'] = false; // Mark overall as not fully successful for this exam
            $slotsStillUnfilled = $examen->total_required_professors - $finalAttributions->count();
            $result['errors'][] = "Exam '{$examen->nom_or_id}' still has {$slotsStillUnfilled} unassigned slots overall.";
            // Log::error("[ASSIGNMENT_SERVICE] Exam '{$examen->nom_or_id}' unfilled slots: {$slotsStillUnfilled}");
        }

        $finalIsModuleTeacherPresentForExam = $finalAttributions->contains(fn($att) => $att->professeur && $att->professeur->modules->contains($examen->module_id));
        if ($finalAttributions->count() > 0 && !$finalIsModuleTeacherPresentForExam) {
            $result['warnings'][] = "Warning: No module teacher assigned overall for exam '{$examen->nom_or_id}'.";
            // Log::warning("[ASSIGNMENT_SERVICE] {$result['warnings'][count($result['warnings'])-1]}");
        }

        // Construct message for this single exam
        if (empty($result['errors']) && $result['attributions_made'] > 0) {
            $result['message'] = "Successfully made {$result['attributions_made']} new assignments for exam '{$examen->nom_or_id}'.";
        } elseif (empty($result['errors']) && $result['attributions_made'] === 0 && empty($result['warnings'])) {
             $initialSlotsToFill = $examen->total_required_professors - $examen->attributions()->whereNotIn('professeur_id', $this->professorsAssignedToCurrentExamOverall)->count(); // Count before this run's assignments
             if ($initialSlotsToFill > 0 ) {
                 $result['message'] = "No suitable candidates found or no new assignments made for exam '{$examen->nom_or_id}'.";
             } else {
                 $result['message'] = "No new assignments needed for exam '{$examen->nom_or_id}'.";
             }
        } elseif (!empty($result['errors'])) {
            $result['message'] = "Process for exam '{$examen->nom_or_id}' completed with errors.";
        } elseif(!empty($result['warnings'])) {
            $result['message'] = "Process for exam '{$examen->nom_or_id}' completed with warnings.";
        }
        // Log::info("[ASSIGNMENT_SERVICE] Finished processing Exam '{$examen->nom_or_id}'. Results: ", $result);
        return $result;
    }

    private function filterCandidatesForExamInBatch(EloquentCollection $professeurs, Examen $examen, bool $isPESAlreadyAssignedToThisSalle, Seson $sessionContext): EloquentCollection
    {
        $examStart = Carbon::parse($examen->debut);
        $examEnd = $examen->end_datetime;
        $examDateStr = $examStart->toDateString();

        if (!$sessionContext) {
            // Log::error("[Filter] Exam ID {$examen->id} ('{$examen->nom_or_id}') is missing session context for quota checks during batch. Quota filter might be inaccurate.");
        }

        return $professeurs->filter(function (Professeur $prof) use ($examen, $examStart, $examEnd, $examDateStr, $sessionContext, $isPESAlreadyAssignedToThisSalle) {
            $profId = $prof->id;
            if ($isPESAlreadyAssignedToThisSalle && $prof->rang === Professeur::RANG_PES) return false;

            foreach ($prof->unavailabilities as $unavailability) {
                $unavStart = Carbon::parse($unavailability->start_datetime);
                $unavEnd = Carbon::parse($unavailability->end_datetime);
                if ($examStart->lt($unavEnd) && $examEnd->gt($unavStart)) return false;
            }

            $assignmentsOnExamDayCount = 0; $assignedOnPreviousOrNextGapDay = false;
            foreach ($prof->attributions as $attribution) {
                if ($attribution->examen_id === $examen->id && $attribution->salle_id) { // If already assigned to a room for this exam
                    // This professor is already part of this exam's overall assignment,
                    // the main loop manages not re-assigning them to new *slots*.
                    // This filter ensures they are not seen as conflicting with *themselves*.
                    // However, daily/gap day rules still apply based on *other* exams.
                    if (Carbon::parse($attribution->examen->debut)->isSameDay($examStart)) {
                         // This check is tricky here. If this attribution *is* for the current exam,
                         // it shouldn't count towards the daily limit for *this* exam's assignment decision.
                         // The daily limit is about *other* distinct exams on the same day.
                         // This needs to be handled carefully to avoid self-conflict.
                         // Let's assume daily limit check should exclude current exam ID.
                    }
                    // Continue to check for other conflicts.
                } else if ($attribution->examen_id !== $examen->id) { // Check against *other* exams
                    $assignedExam = $attribution->examen;
                    if (!$assignedExam) continue;
                    $assignedExamStart = Carbon::parse($assignedExam->debut);
                    $assignedExamEnd = $assignedExam->end_datetime;
                    if ($examStart->lt($assignedExamEnd) && $examEnd->gt($assignedExamStart)) return false; // Overlap
                    if ($assignedExamStart->isSameDay($examStart)) $assignmentsOnExamDayCount++;
                    $daysDifference = $assignedExamStart->diffInDays($examStart, false);
                    if (abs($daysDifference) > 0 && abs($daysDifference) <= self::ASSIGNMENT_GAP_DAYS) $assignedOnPreviousOrNextGapDay = true;
                }
            }
            if ($assignmentsOnExamDayCount >= self::MAX_ASSIGNMENTS_PER_DAY) return false;
            if ($assignedOnPreviousOrNextGapDay) return false;

            if ($sessionContext) {
                $assignmentsInSessionForThisProf = $this->profAssignmentsInSessionTotal[$profId] ?? 0;
                $quotaForRank = self::RANK_QUOTAS_PER_SESSION[$prof->rang] ?? 999;
                if ($assignmentsInSessionForThisProf >= $quotaForRank) return false;
            }
            return true;
        });
    }

    public function assignProfessorsToExam(Examen $examen): array
    {
        if (!$examen->quadrimestre || !$examen->quadrimestre->seson) {
            //  Log::error("[ASSIGNMENT_SERVICE] Single Exam Assign: Exam ID {$examen->id} ('{$examen->nom_or_id}') is missing quadrimestre or session context.");
             return ['success' => false, 'attributions_made' => 0, 'message' => 'Exam session context missing for assignment.', 'errors' => ["Exam '{$examen->nom_or_id}' is missing necessary session information."], 'warnings' => []];
        }
        $this->initializeBatchState($examen->quadrimestre->seson);
        $this->allActiveProfesseursForBatch = Professeur::where('statut', 'Active')
            ->where('is_chef_service', false)
            ->with(['user', 'service', 'modules', 'unavailabilities', 'attributions.examen.quadrimestre.seson'])
            ->get();
        return $this->assignSingleExamInBatch($examen, $examen->quadrimestre->seson);
    }

    private function determineCandidatePool(EloquentCollection $availableCandidates, Examen $examen, bool $isModuleTeacherAlreadyPresent): EloquentCollection
    {
        if (!$isModuleTeacherAlreadyPresent) {
            $moduleTeachers = $availableCandidates->filter(fn($prof) => $prof->modules->contains($examen->module_id));
            if ($moduleTeachers->isNotEmpty()) {
                // Log::debug("[POOL_DETERMINATION] Prioritizing Module Teacher pool ({$moduleTeachers->count()}) for Exam '{$examen->nom_or_id}'.");
                return $moduleTeachers;
            }
        }
        // Log::debug("[POOL_DETERMINATION] Using General Candidate pool ({$availableCandidates->count()}) for Exam '{$examen->nom_or_id}'.");
        return $availableCandidates;
    }

    private function selectResponsable(EloquentCollection $candidates, Examen $examen, bool $isPESAlreadyAssignedToThisSalle): ?Professeur
    {
        if ($candidates->isEmpty()) return null;
        $eligibleCandidates = $isPESAlreadyAssignedToThisSalle
            ? $candidates->where('rang', '!=', Professeur::RANG_PES)
            : $candidates;
        if ($eligibleCandidates->isEmpty()) return null;
        return $eligibleCandidates->sortBy([
            fn($prof) => array_search($prof->rang, [Professeur::RANG_PES, Professeur::RANG_PAG, Professeur::RANG_PA]),
            ['date_recrutement', 'asc'],
        ])->first();
    }

    private function selectInvigilator(EloquentCollection $candidates, Examen $examen, bool $isPESAlreadyAssignedToThisSalle): ?Professeur
    {
        if ($candidates->isEmpty()) return null;
        // If a PES is assigned to this salle, $candidates passed here should already be non-PES due to re-filtering.
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

    private function createAttribution(Examen $examen, Professeur $professeur, bool $isResponsable, int $salle_id): Attribution // Added $salle_id
    {
        // Log::info("[ATTRIBUTION_CREATED] Exam ID {$examen->id} ('{$examen->nom_or_id}'), Prof ID {$professeur->id} ('{$professeur->prenom} {$professeur->nom}'), Salle ID {$salle_id}, Responsable: " . ($isResponsable ? 'Yes' : 'No'));
        return Attribution::create([
            'examen_id' => $examen->id,
            'professeur_id' => $professeur->id,
            'salle_id' => $salle_id, // Store the salle_id
            'is_responsable' => $isResponsable,
        ]);
    }
}