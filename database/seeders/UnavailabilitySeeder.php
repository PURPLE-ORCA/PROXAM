<?php

namespace Database\Seeders;

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
        $reasons = [
            'Congé maladie', 'Formation', 'Conférence', 
            'Mission', 'Congé personnel', 'Autre engagement'
        ];
        
        for ($i = 0; $i < 20; $i++) {
            $start = Carbon::now()->addDays(rand(1, 30))->addHours(rand(9, 15));
            $end = $start->copy()->addHours(rand(1, 8));
            
            Unavailability::create([
                'professeur_id' => $professeurs[array_rand($professeurs)],
                'start_datetime' => $start,
                'end_datetime' => $end,
                'reason' => $reasons[array_rand($reasons)],
            ]);
        }
    }
}
