<?php

namespace App\Services;

use App\Models\Examen;
use App\Models\Professeur;
use App\Models\Attribution;
use App\Models\Module;
use App\Models\Seson;
use App\Models\Quadrimestre;
use App\Models\ProfessorUnavailability; // Or your correct Unavailability model name
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Log; // For debugging

class ExamAssignmentService
{
    // Constants (as defined in planning)
    public const RANK_QUOTAS_PER_SESSION = [
        Professeur::RANG_PES => 2,
        Professeur::RANG_PAG => 4,
        Professeur::RANG_PA  => 6,
    ];
    public const MAX_ASSIGNMENTS_PER_DAY = 1;
    public const ASSIGNMENT_GAP_DAYS = 1;
    public const AM_PM_CUTOFF_HOUR = 13;

    public function assignProfessorsToExam(Examen $examen): array
    {
        Log::info("Starting assignment process for Exam ID: {$examen->id}");

        // 0. Initialize result
        $result = [
            'success' => true,
            'attributions_made' => 0,
            'message' => "Assignment process initiated for exam '{$examen->nom_or_id}'.", // Assuming nom_or_id helper
            'errors' => [],
            'warnings' => [],
        ];

        // Eager load relations for the given exam
        $examen->loadMissing([
            'attributions.professeur', // Load professor for existing attributions
            'module',
            'quadrimestre.seson.anneeUni' // For session context
        ]);

        // 1. Determine current state and needs
        $existingAttributions = $examen->attributions;
        $existingAttributionsCount = $existingAttributions->count();
        $slotsToFill = $examen->required_professors - $existingAttributionsCount;

        Log::info("Exam '{$examen->nom_or_id}': Required={$examen->required_professors}, Existing={$existingAttributionsCount}, SlotsToFill={$slotsToFill}");

        if ($slotsToFill <= 0) {
            $result['message'] = "Exam '{$examen->nom_or_id}' already has sufficient professors assigned.";
            Log::info($result['message']);
            return $result;
        }

        $responsableAlreadyAssigned = $existingAttributions->firstWhere('is_responsable', true);
        $responsablesNeeded = $responsableAlreadyAssigned ? 0 : 1;

        $isModuleTeacherAlreadyPresent = $existingAttributions->contains(function ($attribution) use ($examen) {
            // Ensure professor and modules relation are loaded for this check if not already
            $attribution->professeur->loadMissing('modules');
            return $attribution->professeur && $attribution->professeur->modules->contains($examen->module_id);
        });

        Log::info("ResponsablesNeeded: {$responsablesNeeded}, IsModuleTeacherAlreadyPresent: " . ($isModuleTeacherAlreadyPresent ? 'Yes' : 'No'));

        // 2. Fetch all potentially available professors
        $allActiveProfesseurs = Professeur::where('statut', 'Active')
            ->where('is_chef_service', false)
            ->with([ // Eager load everything needed for filtering and assignment
                'user',
                'service',
                'modules',
                'unavailabilities', // Use your correct model name here if different
                'attributions.examen.quadrimestre.seson' // For checking existing load
            ])
            ->get();

        Log::info("Fetched " . $allActiveProfesseurs->count() . " active, non-chef professors.");

        // --- STUB FOR NOW: Actual filtering and assignment logic will go here ---
        // $filteredCandidates = $this->filterCandidatesForExam($allActiveProfesseurs, $examen, $existingAttributions);
        // Log::info("Filtered candidates count: " . $filteredCandidates->count());
        // ... assignment logic ...

        // For now, let's just return a message indicating this part is not yet implemented
        $result['warnings'][] = "Assignment logic (filtering, selection, creation of attributions) is not yet implemented.";
        $result['message'] = "Data fetched, but assignment logic is a stub. Slots to fill: {$slotsToFill}.";
        Log::warning($result['message']);
        // --- END OF STUB ---

        return $result;
    }

    // Placeholder for nom_or_id helper (add to Examen model later)
    // This is just for cleaner logging messages in the service.
    // You'd add a getNomOrIdAttribute() accessor to your Examen model.
    // protected function getExamDisplayName(Examen $examen): string
    // {
    //     return $examen->nom ?? "ID {$examen->id}";
    // }
}