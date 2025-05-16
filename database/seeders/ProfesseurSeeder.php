<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Professeur;
use App\Models\User;
use App\Models\Service;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash; 
use Illuminate\Support\Str;         

class ProfesseurSeeder extends Seeder
{
    public function run()
    {
        $rangs = Professeur::getRangs(true);
        $statuts = Professeur::getStatuts(true); 
        $specialites = [
            Professeur::SPECIALITE_MEDICAL,
            Professeur::SPECIALITE_SURGICAL,
        ];
        
        $noms = [
            'Benali', 'Laroui', 'Cherkaoui', 'El Amrani', 'Bouzidi', 'Hakimi', 'Daoudi', 'Zeroual', 
            'Tazi', 'Mansouri', 'Belhaj', 'Rachidi', 'Saidi', 'Bennani', 'Khalfi', 'Naciri',
            'Martin', 'Dubois', 'Bernard', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon',
            'Laurent', 'Michel', 'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier'
        ];
        
        $prenoms = [
            'Mohamed', 'Ahmed', 'Fatima', 'Amina', 'Karim', 'Youssef', 'Hassan', 'Nadia',
            'Samir', 'Leila', 'Khalid', 'Zahra', 'Omar', 'Salim', 'Jamila', 'Rachid',
            'Jean', 'Pierre', 'Marie', 'Philippe', 'Nathalie', 'Alain', 'Sophie', 'Patrick',
            'Isabelle', 'François', 'Catherine', 'Jacques', 'Valérie', 'Eric', 'Sandrine'
        ];
        
        $services = Service::pluck('id')->toArray();

        if (empty($services)) {
            $this->command->warn('No services found. Please ensure services are seeded before professors. Skipping ProfesseurSeeder.');
            return;
        }
        
        $numberOfProfessorsToSeed = 60; 

        for ($i = 0; $i < $numberOfProfessorsToSeed; $i++) {
            $selectedPrenom = $prenoms[array_rand($prenoms)];
            $selectedNom = $noms[array_rand($noms)];
            $selectedServiceId = $services[array_rand($services)];
            
            $userEmail = strtolower(Str::slug($selectedPrenom . '.' . $selectedNom, '.')) . '.' . $i . '@fmpo.test'; // Ensures uniqueness with $i
            
            $user = User::create([
                'name' => $selectedPrenom . ' ' . $selectedNom,
                'email' => $userEmail,
                'password' => Hash::make('password'), 
                'role' => 'professeur',
                'email_verified_at' => now(),
            ]);
            
            Professeur::create([
                'user_id' => $user->id, 
                'nom' => $selectedNom,
                'prenom' => $selectedPrenom,
                'rang' => $rangs[array_rand($rangs)],
                'statut' => $statuts[array_rand($statuts)],
                'is_chef_service' => false, // We'll handle chef assignment in a second pass
                'date_recrutement' => Carbon::now()->subYears(rand(1, 20)),
                'specialite' => $specialites[array_rand($specialites)], 
                'service_id' => $selectedServiceId,
            ]);
        }
        
        // Ensure each service has one Chef de Service
        foreach (Service::all() as $service) {
            // Check if a chef is already assigned (less likely now, but good practice)
            $hasChef = Professeur::where('service_id', $service->id)
                                ->where('is_chef_service', true)
                                ->exists();
            
            if (!$hasChef) {
                // If no chef, pick a random professor from that service
                $profToMakeChef = Professeur::where('service_id', $service->id)->inRandomOrder()->first();
                if ($profToMakeChef) {
                    $profToMakeChef->update(['is_chef_service' => true]);
                } else {
                    // This would only happen if a service was seeded but no professors were assigned to it.
                    $this->command->warn("No professors found for service ID {$service->id} to assign a chef de service.");
                }
            }
        }
    }
}