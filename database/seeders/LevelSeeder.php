<?php

namespace Database\Seeders;

use App\Models\Filiere;
use App\Models\Level;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class LevelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $medecine = Filiere::where('nom', 'Médecine')->first();
        $pharmacie = Filiere::where('nom', 'Pharmacie')->first();
        $dentaire = Filiere::where('nom', 'Dentaire')->first();

        if ($medecine) {
            Level::create(['nom' => '1ère Année Médecine', 'filiere_id' => $medecine->id]);
            Level::create(['nom' => '2ème Année Médecine', 'filiere_id' => $medecine->id]);
            Level::create(['nom' => '3ème Année Médecine', 'filiere_id' => $medecine->id]);
            Level::create(['nom' => '4ème Année Médecine', 'filiere_id' => $medecine->id]);
            Level::create(['nom' => '5ème Année Médecine', 'filiere_id' => $medecine->id]);
            Level::create(['nom' => '6ème Année Médecine', 'filiere_id' => $medecine->id]);
        }
        if ($pharmacie) {
            Level::create(['nom' => '1ère Année Pharmacie', 'filiere_id' => $pharmacie->id]);
            Level::create(['nom' => '2ème Année Pharmacie', 'filiere_id' => $pharmacie->id]);
            Level::create(['nom' => '3ème Année Pharmacie', 'filiere_id' => $pharmacie->id]);
            Level::create(['nom' => '4ème Année Pharmacie', 'filiere_id' => $pharmacie->id]);   
            Level::create(['nom' => '5ème Année Pharmacie', 'filiere_id' => $pharmacie->id]);
            Level::create(['nom' => '6ème Année Pharmacie', 'filiere_id' => $pharmacie->id]);
        }
        if ($dentaire) {
            Level::create(['nom' => '1ère Année Dentaire', 'filiere_id' => $dentaire->id]);
            Level::create(['nom' => '2ème Année Dentaire', 'filiere_id' => $pharmacie->id]);
        }
    }
    }

