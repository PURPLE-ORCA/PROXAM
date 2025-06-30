<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Module;
use App\Models\Salle;
use App\Models\ModuleExamRoomConfig;
use Illuminate\Support\Facades\DB;

class ModuleExamRoomConfigSeeder extends Seeder
{
    public function run(): void
    {
        $modules = Module::all();
        $salles = Salle::all();

        if ($modules->isEmpty() || $salles->isEmpty()) {
            $this->command->warn('ModuleExamRoomConfigSeeder: No modules or salles found. Skipping.');
            return;
        }

        $configsToInsert = [];

        foreach ($modules as $module) {
            $numDefaultSalles = rand(1, min(4, $salles->count())); // Increase number of default rooms
            $defaultSelectedSalles = $salles->random($numDefaultSalles);

            if ($defaultSelectedSalles instanceof Salle) {
                $defaultSelectedSalles = collect([$defaultSelectedSalles]);
            }

            foreach ($defaultSelectedSalles as $salle) {
                $configsToInsert[] = [
                    'module_id' => $module->id,
                    'salle_id' => $salle->id,
                    'configured_capacity' => $salle->default_capacite,
                    'configured_prof_count' => rand(3, 6), // Increase profs per room to 3-6
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }
        
        if (!empty($configsToInsert)) {
            ModuleExamRoomConfig::upsert(
                $configsToInsert,
                ['module_id', 'salle_id'],
                ['configured_capacity', 'configured_prof_count', 'updated_at']
            );
        }
        $this->command->info('ModuleExamRoomConfigSeeder: Module exam room configurations seeded successfully.');
    }
}
