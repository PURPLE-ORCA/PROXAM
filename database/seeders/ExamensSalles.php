<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Examen;
use App\Models\Salle;
use App\Models\ExamensSalle;

class ExamensSallesSeeder extends Seeder
{
    public function run()
    {
        $examens = Examen::all();
        $salles = Salle::all();

        foreach ($examens as $examen) {
            // Assign 1-3 rooms to each exam
            $randomSalles = $salles->random(rand(1, 3));
            
            foreach ($randomSalles as $salle) {
                ExamensSalle::create([
                    'examen_id' => $examen->id,
                    'salle_id' => $salle->id,
                    'capacite' => $salle->default_capacite - rand(0, 5), // Slightly adjust capacity
                ]);
            }
        }
    }
}