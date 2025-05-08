<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Attribution;
use App\Models\Examen;
use App\Models\Professeur;
use Carbon\Carbon;

class AttributionSeeder extends Seeder
{
    public function run()
    {
        $examens = Examen::all();
        $professeurs = Professeur::all();

        foreach ($examens as $examen) {
            // Get professors who teach this module
            $moduleProfessors = $examen->module->professeurs;
            
            // If no professors teach this module, use all professors
            if ($moduleProfessors->isEmpty()) {
                $moduleProfessors = $professeurs;
            }

            // Filter available professors (not unavailable during exam)
            $availableProfessors = $moduleProfessors->filter(function ($professor) use ($examen) {
                return !$professor->unavailabilities()
                    ->where('start_datetime', '<=', $examen->fin)
                    ->where('end_datetime', '>=', $examen->debut)
                    ->exists();
            });

            // Select required number of professors (minimum 1, maximum required_professors)
            $required = min($examen->required_professors, $availableProfessors->count());
            $selectedProfessors = $availableProfessors->random($required);
            
            // Mark first as responsable if possible
            $isFirst = true;
            
            foreach ($selectedProfessors as $professor) {
                Attribution::create([
                    'examen_id' => $examen->id,
                    'professeur_id' => $professor->id,
                    'is_responsable' => $isFirst,
                ]);
                $isFirst = false;
            }
        }
    }
}