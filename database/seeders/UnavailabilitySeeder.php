<?php

namespace Database\Seeders;

use App\Models\AnneeUni;
use App\Models\Professeur;
use App\Models\Unavailability;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class UnavailabilitySeeder extends Seeder
{
    public function run()
    {
        $professeurs = Professeur::pluck('id')->toArray();
        $anneeUnis = AnneeUni::pluck('id')->toArray();
        $reasons = [
            'Congé maladie', 'Formation', 'Conférence', 'Mission', 
            'Congé personnel', 'Autre engagement professionnel', 'Congé sabbatique'
        ];
        
        if (empty($professeurs) || empty($anneeUnis)) {
            $this->command->info('UnavailabilitySeeder: No professors or academic years found. Skipping.');
            return;
        }

        $unavailabilitiesToCreate = [];
        // Create a larger number of unavailabilities
        for ($i = 0; $i < 300; $i++) {
            // Vary the date range more widely
            $start = Carbon::now()->subDays(rand(0, 90))->addDays(rand(0, 180));
            // Unavailability can be from a few hours to a few days
            $end = $start->copy()->addHours(rand(2, 72));
            
            $unavailabilitiesToCreate[] = [
                'professeur_id' => $professeurs[array_rand($professeurs)],
                'annee_uni_id' => $anneeUnis[array_rand($anneeUnis)],
                'start_datetime' => $start,
                'end_datetime' => $end,
                'reason' => $reasons[array_rand($reasons)],
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        // Batch insert for performance
        Unavailability::insert($unavailabilitiesToCreate);
        $this->command->info('UnavailabilitySeeder: ' . count($unavailabilitiesToCreate) . ' unavailabilities seeded successfully.');
    }
}
