<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Module;

class ModuleSeeder extends Seeder
{
    public function run()
    {
        $modules = [
            'Anatomie Générale', 'Biochimie Structurale', 'Physiologie Humaine', 
            'Pharmacologie Générale', 'Microbiologie Médicale', 'Pathologie Générale',
            'Chirurgie Digestive', 'Médecine Interne', 'Pédiatrie Générale',
            'Gynécologie Obstétrique', 'Radiologie Diagnostique', 'Dermatologie Clinique',
            'Neurologie Fondamentale', 'Cardiologie', 'Ophtalmologie Médicale',
            'ORL', 'Psychiatrie Adulte', 'Médecine Légale', 'Immunologie', 'Parasitologie',
            'Hématologie', 'Endocrinologie', 'Néphrologie', 'Pneumologie', 'Rhumatologie',
            'Oncologie Médicale', 'Gériatrie', 'Médecine d\'Urgence', 'Médecine du Travail', 'Médecine Tropicale'
        ];
        
        foreach ($modules as $module) {
            Module::create(['nom' => $module]);
        }
    }
}