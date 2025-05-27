<?php

namespace Database\Seeders;

use App\Models\AnneeUni;
use App\Models\Professeur;
use App\Models\Unavailability;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class UnavailabilitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        $professeurs = Professeur::pluck('id')->toArray();
        $anneeUnis = AnneeUni::pluck('id')->toArray(); // Fetch AnneeUni IDs
        $reasons = [
            'Congé maladie', 'Formation', 'Conférence', 
            'Mission', 'Congé personnel', 'Autre engagement'
        ];
        
        if (empty($anneeUnis)) {
            $this->command->info('No AnneeUni records found. Please seed AnneeUni first.');
            return;
        }

        for ($i = 0; $i < 20; $i++) {
            $start = Carbon::now()->addDays(rand(1, 30))->addHours(rand(9, 15));
            $end = $start->copy()->addHours(rand(1, 8));
            
            Unavailability::create([
                'professeur_id' => $professeurs[array_rand($professeurs)],
                'annee_uni_id' => $anneeUnis[array_rand($anneeUnis)], // Assign random AnneeUni ID
                'start_datetime' => $start,
                'end_datetime' => $end,
                'reason' => $reasons[array_rand($reasons)],
            ]);
        }
    }
}
