<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Salle;

class SalleSeeder extends Seeder
{
    public function run()
    {
        $salles = [
            ['nom' => 'Amphi A', 'default_capacite' => 120],
            ['nom' => 'Amphi B', 'default_capacite' => 100],
            ['nom' => 'Salle 101', 'default_capacite' => 40],
            ['nom' => 'Salle 102', 'default_capacite' => 40],
            ['nom' => 'Salle 103', 'default_capacite' => 30],
            ['nom' => 'Salle 201', 'default_capacite' => 50],
            ['nom' => 'Salle 202', 'default_capacite' => 50],
            ['nom' => 'Salle 203', 'default_capacite' => 30],
            ['nom' => 'Labo Chimie', 'default_capacite' => 20],
            ['nom' => 'Labo Biologie', 'default_capacite' => 25],
        ];

        foreach ($salles as $salle) {
            Salle::create($salle);
        }
    }
}

