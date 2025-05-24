<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Examen; // Examen model
use App\Models\Salle;
use Illuminate\Support\Facades\DB; // For direct pivot table insertion

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
            // Each exam should have at least one room, up to 3 or available salles
            $numSallesToAssign = rand(1, min(3, $salles->count()));
            $selectedSalles = $salles->random($numSallesToAssign);

            // Ensure $selectedSalles is always a collection
            if ($selectedSalles instanceof Salle) {
                $selectedSalles = collect([$selectedSalles]);
            }
            
            $totalProfsForExam = 0;

            foreach ($selectedSalles as $salle) {
                $profsInThisRoom = rand(1, 2); // Assign 1 or 2 profs per room for this exam
                $totalProfsForExam += $profsInThisRoom;

                $pivotEntries[] = [
                    'examen_id' => $examen->id,
                    'salle_id' => $salle->id,
                    'capacite' => $salle->default_capacite, // Can be overridden by module config or exam edit later
                    'professeurs_assignes_salle' => $profsInThisRoom,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            // Note: The Examen's total required_professors is now a calculated attribute.
            // This seeder creates the pivot entries that the accessor will sum up.
        }

        if (!empty($pivotEntries)) {
            DB::table('examens_salles')->insert($pivotEntries); // Batch insert
        }
        $this->command->info('ExamensSallesSeeder: Exam-salle links seeded successfully.');
    }
}