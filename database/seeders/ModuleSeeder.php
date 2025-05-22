<?php

namespace Database\Seeders;

use App\Models\Level;
use Illuminate\Database\Seeder;
use App\Models\Module;

class ModuleSeeder extends Seeder
{
    public function run()
    {
        $level1Med = Level::where('nom', '1ère Année Médecine')->first();
        $level2Med = Level::where('nom', '2ème Année Médecine')->first();
        
        $modulesData = [];

        if ($level1Med) {
            $modulesData[] = ['nom' => 'Anatomie Générale', 'level_id' => $level1Med->id];
            $modulesData[] = ['nom' => 'Biochimie Structurale', 'level_id' => $level1Med->id];
            $modulesData[] = ['nom' => 'Physiologie Humaine I', 'level_id' => $level1Med->id];
        }
        if ($level2Med) {
            $modulesData[] = ['nom' => 'Pharmacologie Générale', 'level_id' => $level2Med->id];
            $modulesData[] = ['nom' => 'Microbiologie Médicale', 'level_id' => $level2Med->id];
            $modulesData[] = ['nom' => 'Physiologie Humaine II', 'level_id' => $level2Med->id];
        }

        $existingModules = [
            'Anatomie Générale', 'Biochimie Structurale', 'Physiologie Humaine', 
            'Pharmacologie Générale', 'Microbiologie Médicale', 'Pathologie Générale',
            'Chirurgie Digestive', 'Médecine Interne', 'Pédiatrie Générale',
            'Gynécologie Obstétrique', 'Radiologie Diagnostique', 'Dermatologie Clinique',
            'Neurologie Fondamentale', 'Cardiologie', 'Ophtalmologie Médicale',
            'ORL', 'Psychiatrie Adulte', 'Médecine Légale', 'Immunologie', 'Parasitologie',
            'Hématologie', 'Endocrinologie', 'Néphrologie', 'Pneumologie', 'Rhumatologie',
            'Oncologie Médicale', 'Gériatrie', 'Médecine d\'Urgence', 'Médecine du Travail', 'Médecine Tropicale'
        ];
        
        foreach ($modulesData as $module) {
            Module::create($module);
        }

            $defaultLevel = Level::first(); 
            if ($defaultLevel) {
                foreach ($existingModules as $moduleName) {
                    if (!Module::where('nom', $moduleName)->exists()) {
                        Module::create(['nom' => $moduleName, 'level_id' => $defaultLevel->id]);
                    }
                }
            } else {
                $this->command->warn('ModuleSeeder: No levels found to assign modules to.');
            }
    }
}