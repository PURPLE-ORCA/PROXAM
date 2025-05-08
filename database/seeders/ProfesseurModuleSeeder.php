<?php



namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Professeur;
use App\Models\Module;

class ProfesseurModuleSeeder extends Seeder
{
    public function run()
    {
        $professeurs = Professeur::all();
        $modules = Module::all();

        // Specific module assignments based on specialties
        $assignments = [
            // Medical specialty professors
            [
                'professeur_ids' => [1, 3, 4, 6, 8, 10, 12, 14, 16, 18, 20], // IDs of medical specialty profs
                'module_ids' => [1, 2, 5, 6, 7, 8, 21, 22, 24, 27, 29], // Medical modules
            ],
            // Surgical specialty professors
            [
                'professeur_ids' => [2, 5, 7, 9, 11, 13, 15, 17, 19], // IDs of surgical specialty profs
                'module_ids' => [3, 4, 9, 10, 11, 12, 23, 25, 28], // Surgical modules
            ],
        ];

        foreach ($assignments as $group) {
            $profGroup = Professeur::whereIn('id', $group['professeur_ids'])->get();
            $moduleGroup = Module::whereIn('id', $group['module_ids'])->get();
            
            foreach ($profGroup as $prof) {
                $randomModules = $moduleGroup->random(rand(3, 5));
                foreach ($randomModules as $module) {
                    $prof->modules()->syncWithoutDetaching([$module->id]);
                }
            }
        }

        // Ensure each module has at least one professor
        foreach ($modules as $module) {
            if ($module->professeurs()->count() === 0) {
                $randomProfessor = $professeurs->random();
                $randomProfessor->modules()->syncWithoutDetaching([$module->id]);
            }
        }
    }
}
