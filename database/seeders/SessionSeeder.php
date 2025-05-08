<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Session;
use App\Models\AnneeUni;

class SessionSeeder extends Seeder
{
    public function run(): void
    {
        // Optional: Clear existing sessions if needed (uncomment if necessary)
        // Session::truncate();

        $annees = AnneeUni::all();

        if ($annees->isEmpty()) {
            $this->command->warn('No academic years found in the database.');
            return;
        }

        foreach ($annees as $annee) {
            Session::create([
                'nom' => 'Session 1 ' . $annee->annee,
                'annee_uni_id' => $annee->id,
            ]);

            Session::create([
                'nom' => 'Session 2 ' . $annee->annee,
                'annee_uni_id' => $annee->id,
            ]);
        }

        $this->command->info('Sessions seeded successfully.');
    }
}
