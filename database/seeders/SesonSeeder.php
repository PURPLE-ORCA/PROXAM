<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Seson;
use App\Models\AnneeUni;

class SesonSeeder extends Seeder
{
    public function run()
    {
        $annees = AnneeUni::pluck('id')->toArray();
        $codes = ['Automne', 'Printemps', 'Été'];
        
        foreach ($annees as $anneeId) {
            foreach ($codes as $code) {
                Seson::create([
                    'code' => $code,
                    'annee_uni_id' => $anneeId
                ]);
            }
        }
    }
}