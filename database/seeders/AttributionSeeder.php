<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Attribution;
use App\Models\Examen;
use App\Models\Professeur;

class AttributionSeeder extends Seeder
{
    public function run()
    {
        $examens = Examen::all();
        $professeurs = Professeur::pluck('id')->toArray();
        
        foreach ($examens as $examen) {
            $required = $examen->required_professors;
            $selectedProfs = array_rand($professeurs, min($required, count($professeurs)));
            
            if (!is_array($selectedProfs)) {
                $selectedProfs = [$selectedProfs];
            }
            
            // Make one professor responsible
            $isResponsible = false;
            
            foreach ($selectedProfs as $index => $profIndex) {
                $isResponsible = $index === 0;
                
                Attribution::create([
                    'examen_id' => $examen->id,
                    'professeur_id' => $professeurs[$profIndex],
                    'is_responsable' => $isResponsible,
                ]);
            }
        }
    }
}