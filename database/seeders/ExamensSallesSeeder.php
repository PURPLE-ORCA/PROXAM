<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Examen;
use App\Models\Salle;
use Illuminate\Support\Facades\DB;

class ExamensSallesSeeder extends Seeder
{
    public function run()
    {
        $examens = Examen::all();
        $salles = Salle::all();

        if ($examens->isEmpty() || $salles->isEmpty()) {
            $this->command->warn('ExamensSallesSeeder: No exams or salles found. Skipping.');
            return;
        }
        
        $pivotEntries = [];

        foreach ($examens as $examen) {
            $numSallesToAssign = rand(2, min(5, $salles->count())); // Increase to 2-5 salles per exam
            $selectedSalles = $salles->random($numSallesToAssign);

            if ($selectedSalles instanceof Salle) {
                $selectedSalles = collect([$selectedSalles]);
            }
            
            foreach ($selectedSalles as $salle) {
                $pivotEntries[] = [
                    'examen_id' => $examen->id,
                    'salle_id' => $salle->id,
                    'capacite' => $salle->default_capacite,
                    'professeurs_assignes_salle' => rand(3, 6), // Increase to 3-6 profs per room
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        if (!empty($pivotEntries)) {
            DB::table('examens_salles')->insert($pivotEntries);
        }
        $this->command->info('ExamensSallesSeeder: Exam-salle links seeded successfully.');
    }
}
