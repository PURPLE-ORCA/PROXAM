<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Echange;
use App\Models\Attribution;
use App\Models\Professeur;

class EchangeSeeder extends Seeder
{
    public function run()
    {
        $attributions = Attribution::all();
        $professeurs = Professeur::all();

        // Create some exchange requests
        $echanges = [
            // Professor Ali Bensalah wants to exchange an exam
            [
                'attribution_offered_id' => $attributions->where('professeur_id', 1)->first()->id,
                'professeur_requester_id' => 1,
                'motif' => 'Family commitment',
                'status' => 'Open',
            ],
            // Professor Sara Merad wants to exchange an exam
            [
                'attribution_offered_id' => $attributions->where('professeur_id', 2)->first()->id,
                'professeur_requester_id' => 2,
                'motif' => 'Medical appointment',
                'status' => 'Pending_Approval',
                'professeur_accepter_id' => 3, // Rachid Toumi
                'attribution_accepted_id' => $attributions->where('professeur_id', 3)->first()->id,
            ],
            // Completed exchange between Fatima Kadri and Karim Bouzid
            [
                'attribution_offered_id' => $attributions->where('professeur_id', 4)->first()->id,
                'professeur_requester_id' => 4,
                'motif' => 'Research fieldwork',
                'status' => 'Approved',
                'professeur_accepter_id' => 5,
                'attribution_accepted_id' => $attributions->where('professeur_id', 5)->first()->id,
            ],
        ];

        foreach ($echanges as $echange) {
            Echange::create($echange);
        }

        // Create some random exchanges
        for ($i = 0; $i < 5; $i++) {
            $offered = $attributions->random();
            $accepted = $attributions->where('professeur_id', '!=', $offered->professeur_id)
                ->where('examen_id', '!=', $offered->examen_id)
                ->first();
            
            if ($accepted) {
                Echange::create([
                    'attribution_offered_id' => $offered->id,
                    'professeur_requester_id' => $offered->professeur_id,
                    'motif' => ['Conflict', 'Travel', 'Personal'][rand(0, 2)],
                    'status' => ['Open', 'Pending_Approval', 'Approved'][rand(0, 2)],
                    'professeur_accepter_id' => rand(0, 1) ? $accepted->professeur_id : null,
                    'attribution_accepted_id' => rand(0, 1) ? $accepted->id : null,
                ]);
            }
        }
    }
}
