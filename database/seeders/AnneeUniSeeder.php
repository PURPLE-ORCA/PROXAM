<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AnneeUni;  // Make sure this import exists
use Carbon\Carbon;

class AnneeUniSeeder extends Seeder
{
    public function run()
    {
        for ($i = 0; $i < 5; $i++) {
            $year = Carbon::now()->subYears($i)->year;
            AnneeUni::create([
                'annee' => ($year - 1) . '-' . $year
            ]);
        }
    }
}