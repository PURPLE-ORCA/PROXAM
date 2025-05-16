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
        $targetProfessorCount = 100; // Let's aim for at least 100

        $services = Service::pluck('id')->toArray();
        if (empty($services)) {
            $this->command->warn('ProfesseurSeeder: No services found. Please ensure services are seeded before professors. Skipping.');
            return;
        }

        $rangs = Professeur::getRangs(true); // e.g., ['PA', 'PAG', 'PES']
        $allStatuts = Professeur::getStatuts(true); // e.g., ['Active', 'On_Leave', ...]
        $specialites = [
            Professeur::SPECIALITE_MEDICAL,
            Professeur::SPECIALITE_SURGICAL,
        ];

        // Your predefined name lists
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

        $createdProfEmails = []; // To help generate unique emails

        for ($i = 0; $i < $targetProfessorCount; $i++) {
            $selectedPrenom = $prenoms[array_rand($prenoms)];
            $selectedNom = $noms[array_rand($noms)];

            // Generate unique email
            $emailBase = strtolower(Str::slug($selectedPrenom . '.' . $selectedNom, '.'));
            $email = $emailBase . '@fmpo.test';
            $emailCounter = 0;
            while (in_array($email, $createdProfEmails) || User::where('email', $email)->exists()) {
                $emailCounter++;
                $email = $emailBase . $emailCounter . '@fmpo.test';
            }
            $createdProfEmails[] = $email;

            $user = User::create([
                'name' => $selectedPrenom . ' ' . $selectedNom,
                'email' => $email,
                'password' => Hash::make('password'),
                'role' => 'professeur',
                'email_verified_at' => now(),
            ]);

            // Determine status: Make ~80-90% Active
            $statut = 'Active';
            if (rand(1, 10) > 8) { // Approx 20% chance for a non-active status
                $otherStatuts = array_filter($allStatuts, fn($s) => $s !== 'Active');
                if (!empty($otherStatuts)) {
                    $statut = $otherStatuts[array_rand($otherStatuts)];
                }
            }

            Professeur::create([
                'user_id' => $user->id,
                'nom' => $selectedNom,
                'prenom' => $selectedPrenom,
                'rang' => $rangs[array_rand($rangs)],
                'statut' => $statut,
                'is_chef_service' => false, // Set all to false initially
                'date_recrutement' => Carbon::instance(fake()->dateTimeBetween('-20 years', '-6 months')),
                'specialite' => $specialites[array_rand($specialites)],
                'service_id' => $services[array_rand($services)],
            ]);
        }

        // Assign exactly one Chef de Service per Service, from active professors if possible
        foreach (Service::all() as $service) {
            // First, ensure no one is currently chef for this service (clean slate for this logic)
            Professeur::where('service_id', $service->id)->update(['is_chef_service' => false]);

            // Attempt to pick an 'Active' professor from this service
            $profToMakeChef = Professeur::where('service_id', $service->id)
                                      ->where('statut', 'Active')
                                      ->inRandomOrder()
                                      ->first();

            if (!$profToMakeChef) {
                // Fallback: if no 'Active' prof in this service, pick any prof from this service
                $profToMakeChef = Professeur::where('service_id', $service->id)
                                          ->inRandomOrder()
                                          ->first();
            }

            if ($profToMakeChef) {
                $profToMakeChef->update(['is_chef_service' => true]);
            } else {
                $this->command->warn("ProfesseurSeeder: No professors found for service ID {$service->id} to assign as Chef de Service.");
            }
        }
        $this->command->info("ProfesseurSeeder: Successfully created {$targetProfessorCount} professors and assigned chefs de service.");
    }
}