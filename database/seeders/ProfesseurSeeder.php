<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Professeur;
use App\Models\User;
use App\Models\Service;
use Carbon\Carbon;

class ProfesseurSeeder extends Seeder  // Changed from UserSeeder to ProfesseurSeeder
{
    public function run()
    {
        $rangs = ['PA', 'PAG', 'PES'];
        $statuts = ['Active', 'On_Leave', 'Sick_Leave', 'Vacation', 'Inactive'];
        $specialites = [
            'Cardiologie', 'Neurologie', 'Pédiatrie', 'Chirurgie', 'Dermatologie',
            'Radiologie', 'Anesthésiologie', 'Gynécologie', 'Ophtalmologie', 'ORL',
            'Psychiatrie', 'Médecine Interne', 'Endocrinologie', 'Néphrologie', 'Pneumologie'
        ];
        
        $services = Service::pluck('id')->toArray();
        $users = User::where('role', 'professeur')->pluck('id')->toArray();
        
        for ($i = 0; $i < 60; $i++) {
            $serviceId = $services[array_rand($services)];
            $userId = $i < count($users) ? $users[$i] : null;
            
            $isChef = rand(0, 9) === 0; // 10% chance of being chef de service
            
            Professeur::create([
                'user_id' => $userId,
                'nom' => 'Professeur' . ($i + 1),
                'prenom' => 'Prénom' . ($i + 1),
                'rang' => $rangs[array_rand($rangs)],
                'statut' => $statuts[array_rand($statuts)],
                'is_chef_service' => $isChef,
                'date_recrutement' => Carbon::now()->subYears(rand(1, 20)),
                'specialite' => $specialites[array_rand($specialites)],
                'service_id' => $serviceId,
            ]);
        }
        
        // Update chef de service for each service
        foreach (Service::all() as $service) {
            $prof = Professeur::where('service_id', $service->id)
                ->where('is_chef_service', true)
                ->first();
            
            if (!$prof) {
                $prof = Professeur::where('service_id', $service->id)->inRandomOrder()->first();
                if ($prof) {
                    $prof->update(['is_chef_service' => true]);
                }
            }
        }
    }
}