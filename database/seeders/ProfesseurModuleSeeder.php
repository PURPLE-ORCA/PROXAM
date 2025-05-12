<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ProfesseurModule;  // Make sure this import exists
use App\Models\Professeur;
use App\Models\Module;

class ProfesseurModuleSeeder extends Seeder
{
    public function run()
    {
        $professeurs = Professeur::pluck('id')->toArray();
        $modules = Module::pluck('id')->toArray();
        
        foreach ($professeurs as $profId) {
            $numModules = rand(1, 5);
            $selectedModules = array_rand($modules, min($numModules, count($modules)));
            
            if (!is_array($selectedModules)) {
                $selectedModules = [$selectedModules];
            }
            
            foreach ($selectedModules as $moduleIndex) {
                ProfesseurModule::create([
                    'professeur_id' => $profId,
                    'module_id' => $modules[$moduleIndex],
                ]);
            }
        }
    }
}