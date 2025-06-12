<?php

namespace Database\Seeders;

use App\Models\Level;
use Illuminate\Database\Seeder;
use App\Models\Module;

class ModuleSeeder extends Seeder
{
    public function run()
    {
        $allLevels = Level::all();
        if ($allLevels->isEmpty()) {
            $this->command->warn('ModuleSeeder: No levels found. Please seed levels first.');
            return;
        }

        $moduleNames = [
            'Anatomie Générale', 'Biochimie Structurale', 'Physiologie Humaine I', 'Cytologie & Histologie', 'Génétique Fondamentale',
            'Pharmacologie Générale', 'Microbiologie Médicale', 'Physiologie Humaine II', 'Pathologie Générale', 'Sémiologie Médicale',
            'Chirurgie Digestive', 'Médecine Interne', 'Pédiatrie Générale', 'Cardiologie', 'Pneumologie',
            'Gynécologie Obstétrique', 'Radiologie Diagnostique', 'Dermatologie Clinique', 'Neurologie Fondamentale', 'Endocrinologie',
            'Ophtalmologie Médicale', 'ORL', 'Psychiatrie Adulte', 'Médecine Légale', 'Immunologie',
            'Parasitologie', 'Hématologie', 'Néphrologie', 'Rhumatologie', 'Oncologie Médicale',
            'Gériatrie', 'Médecine d\'Urgence', 'Médecine du Travail', 'Médecine Tropicale', 'Santé Publique'
        ];

        // Create a base set of all modules linked to the first level to ensure they all exist
        $firstLevelId = $allLevels->first()->id;
        foreach ($moduleNames as $moduleName) {
            Module::firstOrCreate(
                ['nom' => $moduleName, 'level_id' => $firstLevelId]
            );
        }

        // Now, assign a variety of these modules to other levels
        $allModules = Module::all();
        foreach ($allLevels as $level) {
            if ($level->id === $firstLevelId) continue; // Skip the one we already populated fully

            $numModulesToAssign = rand(5, 15); // Each level will have between 5 and 15 modules
            $selectedModules = $allModules->random($numModulesToAssign);

            foreach ($selectedModules as $module) {
                // Check if this combination already exists to avoid unique constraint errors
                if (!Module::where('nom', $module->nom)->where('level_id', $level->id)->exists()) {
                    Module::create([
                        'nom' => $module->nom,
                        'level_id' => $level->id,
                    ]);
                }
            }
        }
        $this->command->info('ModuleSeeder: Modules seeded and assigned across levels successfully.');
    }
}
