<?php

namespace Database\Seeders;


use Illuminate\Database\Seeder;
use App\Models\ProfessorUnavailability;
use App\Models\Professeur;
use Carbon\Carbon;

class ProfessorUnavailabilitySeeder extends Seeder
{
    public function run()
    {
        $professeurs = Professeur::all();

        $unavailabilities = [
            // Professor Ali Bensalah (user_id 4)
            [
                'professeur_id' => 1, // Bensalah Ali is first in your array
                'start_datetime' => Carbon::now()->addDays(5)->setTime(8, 0),
                'end_datetime' => Carbon::now()->addDays(7)->setTime(17, 0),
                'reason' => 'Conference abroad',
            ],
            // Professor Sara Merad (user_id 5)
            [
                'professeur_id' => 2,
                'start_datetime' => Carbon::now()->addDays(10)->setTime(9, 0),
                'end_datetime' => Carbon::now()->addDays(12)->setTime(12, 0),
                'reason' => 'Medical leave',
            ],
            // Professor Rachid Toumi (user_id 6)
            [
                'professeur_id' => 3,
                'start_datetime' => Carbon::now()->addDays(15)->setTime(14, 0),
                'end_datetime' => Carbon::now()->addDays(16)->setTime(18, 0),
                'reason' => 'Research fieldwork',
            ],
            // Professor Fatima Kadri (user_id 24)
            [
                'professeur_id' => 4,
                'start_datetime' => Carbon::now()->addDays(20)->setTime(8, 0),
                'end_datetime' => Carbon::now()->addDays(22)->setTime(17, 0),
                'reason' => 'Training workshop',
            ],
            // Professor Karim Bouzid (user_id 25)
            [
                'professeur_id' => 5,
                'start_datetime' => Carbon::now()->addDays(25)->setTime(10, 0),
                'end_datetime' => Carbon::now()->addDays(27)->setTime(15, 0),
                'reason' => 'Sick leave',
            ],
        ];

        foreach ($unavailabilities as $unavailability) {
            ProfessorUnavailability::create($unavailability);
        }

        
    }
}