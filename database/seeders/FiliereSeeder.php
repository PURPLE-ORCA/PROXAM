<?php

namespace Database\Seeders;

use App\Models\Filiere;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class FiliereSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Filiere::create(['nom' => 'Médecine']);
        Filiere::create(['nom' => 'Pharmacie']);
        Filiere::create(['nom' => 'Dentaire']);
    }
}
