<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ExamenSalle;
use App\Models\Examen;
use App\Models\Salle;

class ExamensSallesSeeder extends Seeder
{
    public function run()
    {
        $examens = Examen::all();
        $salles = Salle::all(); // Get all existing salles
        
        foreach ($examens as $examen) {
            $numSalles = rand(1, min(3, count($salles))); // Ensure we don't request more than exist
            $selectedSalles = $salles->random($numSalles);
            
            foreach ($selectedSalles as $salle) {
                ExamenSalle::create([
                    'examen_id' => $examen->id,
                    'salle_id' => $salle->id,
                    'capacite' => $salle->default_capacite,
                ]);
            }
        }
    }
}