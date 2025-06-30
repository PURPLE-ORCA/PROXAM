<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Attribution;
use App\Models\Unavailability;

class ResolveStaleConflicts extends Command
{
    protected $signature = 'app:resolve-stale-conflicts';
    protected $description = 'Finds and resolves attributions that are no longer in conflict because their related unavailability has ended.';

    public function handle()
    {
        $this->info('Starting to resolve stale conflicts...');

        // Find all attributions that are currently marked as in conflict.
        $conflictingAttributions = Attribution::where('is_in_conflict', true)
            ->with('professeur.unavailabilities', 'examen')
            ->get();

        if ($conflictingAttributions->isEmpty()) {
            $this->info('No conflicting attributions found. All good!');
            return 0;
        }

        $this->info("Found {$conflictingAttributions->count()} attributions to check.");

        $resolvedCount = 0;
        foreach ($conflictingAttributions as $attribution) {
            $isStillInConflict = false;

            // Check if this professor has ANY active unavailability that overlaps this exam.
            foreach ($attribution->professeur->unavailabilities as $unavailability) {
                $examStart = $attribution->examen->debut;
                $examEnd = $attribution->examen->getEndDatetimeAttribute();
                $unavStart = $unavailability->start_datetime;
                $unavEnd = $unavailability->end_datetime;

                if ($examStart->lt($unavEnd) && $examEnd->gt($unavStart)) {
                    // Found an overlapping unavailability. This conflict is still valid.
                    $isStillInConflict = true;
                    break; // No need to check other unavailabilities for this professor
                }
            }

            // If after checking all unavailabilities, none of them conflict, then this attribution is stale.
            if (!$isStillInConflict) {
                $attribution->update(['is_in_conflict' => false]);
                $this->line("Resolved conflict for Attribution #{$attribution->id}.");
                $resolvedCount++;
            }
        }

        $this->info("Finished. Resolved {$resolvedCount} stale conflicts.");
        return 0;
    }
}
