<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Module;

class ModuleSeeder extends Seeder
{
    public function run()
    {
        $moduleNames = [
            'Anatomie Humaine',
            'Physiologie',
            'Pathologie Générale',
            'Chirurgie Digestive',
            'Pédiatrie Avancée',
            'Croissance Infantile',
            'Dermatopathologie',
            'Infections Cutanées',
            'Obstétrique',
            'Santé Maternelle',
            'Pharmacocinétique',
            'Pharmacodynamie',
            'Chimie Pharmaceutique',
            'Analyse Biochimique',
            'Pharmacie Hospitalière',
            'Cas Cliniques Pharmacie',
            'Microbiologie Médicale',
            'Virologie',
            'Toxicologie Générale',
            'Pharmacovigilance',
            'Hématologie',
            'Radiologie',
            'Orthopédie',
            'Endocrinologie',
            'Immunologie',
            'Bactériologie',
            'Médecine Préventive',
            'Thérapeutique Médicale',
            'Nutrition',
            'Biophysique',
        ];

        foreach ($moduleNames as $index => $nom) {
            Module::create([
                'nom' => $nom,
                'code' => 'MOD' . str_pad($index + 1, 3, '0', STR_PAD_LEFT),
                'niveau' => rand(1, 3), // You can customize this logic
            ]);
        }
    }
}
