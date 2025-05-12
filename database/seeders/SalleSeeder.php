<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Salle;

class SalleSeeder extends Seeder
{
    public function run()
    {
        $salles = [
            ['nom' => 'Amphi A', 'default_capacite' => 150],
            ['nom' => 'Amphi B', 'default_capacite' => 200],
            ['nom' => 'Amphi C', 'default_capacite' => 180],
            ['nom' => 'Amphi D', 'default_capacite' => 120],
            ['nom' => 'Amphi E', 'default_capacite' => 100],
            ['nom' => 'Amphi F', 'default_capacite' => 80],
            ['nom' => 'Amphi G', 'default_capacite' => 90],
            ['nom' => 'Bib 1', 'default_capacite' => 50],
            ['nom' => 'Bib 2', 'default_capacite' => 60],
            ['nom' => 'Salle TP 1', 'default_capacite' => 30],
            ['nom' => 'Salle TP 2', 'default_capacite' => 35],
            ['nom' => 'Salle TP 3', 'default_capacite' => 40],
        ];
        
        foreach ($salles as $salle) {
            Salle::create($salle);
        }
    }
}