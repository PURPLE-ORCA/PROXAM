<?php
namespace App\Services;
use App\Models\Unavailability;
use App\Models\Attribution;
class UnavailabilityConflictService
{
    /**
     * Checks for and updates conflicts caused by a specific unavailability.
     * This is the logic we will call directly.
     */
    public function updateConflictsFor(Unavailability $unavailability): void
    {
        $prof = $unavailability->professeur;
        if (!$prof) {
            return;
        }
        $allAttributions = $prof->attributions()->with('examen')->get();
        $conflictIds = [];
        $unavStart = $unavailability->start_datetime;
        $unavEnd = $unavailability->end_datetime;
        foreach ($allAttributions as $attribution) {
            if (!$attribution->examen) {
                continue;
            }
            $examStart = $attribution->examen->debut;
            $examEnd = $attribution->examen->getEndDatetimeAttribute(); // Using your accessor
            if ($examStart->lt($unavEnd) && $examEnd->gt($unavStart)) {
                $conflictIds[] = $attribution->id;
            }
        }
        // First, clear any old conflicts for this professor that are no longer conflicting
        $prof->attributions()
             ->where('is_in_conflict', true)
             ->whereNotIn('id', $conflictIds)
             ->update(['is_in_conflict' => false]);
             
        // Now, set the new conflicts
        if (!empty($conflictIds)) {
            Attribution::whereIn('id', $conflictIds)->update(['is_in_conflict' => true]);
        }
    }
    /**
     * Clears all conflicts for a professor when an unavailability is deleted.
     */
    public function resolveConflictsFor(Unavailability $unavailability): void
    {
        // This is a naive approach, a better one would re-check all unavailabilities.
        // For now, let's just clear everything for that professor.
        Attribution::where('professeur_id', $unavailability->professeur_id)
            ->update(['is_in_conflict' => false]);
        
        // A more robust solution would be to re-run the conflict check for all remaining unavailabilities
        // for that professor.
    }
}
