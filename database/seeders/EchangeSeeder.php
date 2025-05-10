<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Echange;
use App\Models\Attribution;
use App\Models\Professeur;
use Carbon\Carbon;

class EchangeSeeder extends Seeder
{
    public function run()
    {
        $attributions = Attribution::all();
        $professeurs = Professeur::pluck('id')->toArray();
        $statuses = ['Open', 'Pending_Approval', 'Approved', 'Cancelled'];
        
        for ($i = 0; $i < 10; $i++) {
            $attribution = $attributions->random();
            $profRequester = $professeurs[array_rand($professeurs)];
            
            // Make sure requester is not the same as the assigned professor
            while ($profRequester == $attribution->professeur_id) {
                $profRequester = $professeurs[array_rand($professeurs)];
            }
            
            $status = $statuses[array_rand($statuses)];
            $profAccepter = null;
            $attributionAccepted = null;
            
            if ($status === 'Approved') {
                $profAccepter = $attribution->professeur_id;
                $attributionAccepted = $attributions->where('professeur_id', $profRequester)
                    ->where('examen_id', '!=', $attribution->examen_id)
                    ->first();
                
                if (!$attributionAccepted) {
                    $attributionAccepted = $attributions->where('professeur_id', '!=', $profRequester)
                        ->where('professeur_id', '!=', $profAccepter)
                        ->first();
                }
            }
            
            Echange::create([
                'attribution_offered_id' => $attribution->id,
                'professeur_requester_id' => $profRequester,
                'motif' => 'Motif d\'échange ' . ($i + 1),
                'status' => $status,
                'professeur_accepter_id' => $profAccepter,
                'attribution_accepted_id' => $attributionAccepted ? $attributionAccepted->id : null,
                'created_at' => Carbon::now()->subDays(rand(1, 30)),
            ]);
        }
    }
}