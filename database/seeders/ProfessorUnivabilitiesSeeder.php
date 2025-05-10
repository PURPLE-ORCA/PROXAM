<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ProfessorUnivability;
use App\Models\Professeur;
use Carbon\Carbon;

class ProfessorUnivabilitiesSeeder extends Seeder
{
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
            
            ProfessorUnivability::create([
                'professeur_id' => $professeurs[array_rand($professeurs)],
                'start_datetime' => $start,
                'end_datetime' => $end,
                'reason' => $reasons[array_rand($reasons)],
            ]);
        }
    }
}