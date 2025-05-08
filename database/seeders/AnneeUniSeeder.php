<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AnneeUni;

class AnneeUniSeeder extends Seeder
{
    public function run()
    {
        $annees = [
            ['annee' => '2022-2023'],
            ['annee' => '2023-2024'],
            ['annee' => '2024-2025'],
        ];

        foreach ($annees as $annee) {
            AnneeUni::create($annee);
        }
    }
}
