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
        $services = Service::pluck('id')->toArray();
        if (empty($services)) {
            $this->command->warn('ProfesseurSeeder: No services found. Please seed services first. Skipping.');
            return;
        }

        // Define rank distribution
        $ranksToCreate = array_merge(
            array_fill(0, 30, Professeur::RANG_PES),
            array_fill(0, 50, Professeur::RANG_PAG),
            array_fill(0, 80, Professeur::RANG_PA)
        );
        shuffle($ranksToCreate); // Randomize the order of ranks to be created

        $allStatuts = Professeur::getStatuts(true);
        $specialites = [Professeur::SPECIALITE_MEDICAL, Professeur::SPECIALITE_SURGICAL];
        $noms = ['Benali', 'Laroui', 'Cherkaoui', 'El Amrani', 'Bouzidi', 'Hakimi', 'Daoudi', 'Zeroual', 'Tazi', 'Mansouri', 'Belhaj', 'Rachidi', 'Saidi', 'Bennani', 'Khalfi', 'Naciri', 'Martin', 'Dubois', 'Bernard', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Michel', 'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier', 'Wawadi', 'Fassi', 'Jilali'];
        $prenoms = ['Mohamed', 'Ahmed', 'Fatima', 'Amina', 'Karim', 'Youssef', 'Hassan', 'Nadia', 'Samir', 'Leila', 'Khalid', 'Zahra', 'Omar', 'Salim', 'Jamila', 'Rachid', 'Jean', 'Pierre', 'Marie', 'Philippe', 'Nathalie', 'Alain', 'Sophie', 'Patrick', 'Isabelle', 'François', 'Catherine', 'Jacques', 'Valérie', 'Eric', 'Sandrine', 'El Hardi', 'Kenza'];

        $createdEmails = User::pluck('email')->toArray(); // Start with existing emails to avoid collisions

        foreach ($ranksToCreate as $rank) {
            $selectedPrenom = $prenoms[array_rand($prenoms)];
            $selectedNom = $noms[array_rand($noms)];

            $emailBase = strtolower(Str::slug($selectedPrenom . '.' . $selectedNom, '.'));
            $email = $emailBase . '@fmpo.test';
            $emailCounter = 0;
            while (in_array($email, $createdEmails)) {
                $emailCounter++;
                $email = $emailBase . $emailCounter . '@fmpo.test';
            }
            $createdEmails[] = $email;

            $user = User::create([
                'name' => $selectedPrenom . ' ' . $selectedNom,
                'email' => $email,
                'password' => Hash::make('password'),
                'role' => 'professeur',
                'email_verified_at' => now(),
            ]);

            $statut = (rand(1, 100) <= 85) ? 'Active' : $allStatuts[array_rand(array_filter($allStatuts, fn($s) => $s !== 'Active'))];

            Professeur::create([
                'user_id' => $user->id,
                'nom' => $selectedNom,
                'prenom' => $selectedPrenom,
                'rang' => $rank,
                'statut' => $statut,
                'is_chef_service' => false,
                'date_recrutement' => Carbon::instance(fake()->dateTimeBetween('-20 years', '-6 months')),
                'specialite' => $specialites[array_rand($specialites)],
                'service_id' => $services[array_rand($services)],
            ]);
        }
        $this->command->info("ProfesseurSeeder: Successfully created " . count($ranksToCreate) . " professors.");

        // Assign Chefs de Service (same logic as before)
        foreach (Service::all() as $service) {
            Professeur::where('service_id', $service->id)->update(['is_chef_service' => false]);
            $profToMakeChef = Professeur::where('service_id', $service->id)->where('statut', 'Active')->inRandomOrder()->first()
                              ?? Professeur::where('service_id', $service->id)->inRandomOrder()->first();

            if ($profToMakeChef) {
                $profToMakeChef->update(['is_chef_service' => true]);
                if ($profToMakeChef->user) {
                    $profToMakeChef->user->update(['role' => 'chef_service']);
                    $this->command->info("  - User '{$profToMakeChef->user->name}' is now Chef de Service for '{$service->nom}'.");
                }
            } else {
                $this->command->warn("ProfesseurSeeder: No professors found for service ID {$service->id} to assign as Chef de Service.");
            }
        }
    }
}
