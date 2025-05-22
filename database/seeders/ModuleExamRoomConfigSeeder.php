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
            // Assign 1 to 2 default rooms for each module's exam configuration
            $numDefaultSalles = rand(1, min(2, $salles->count()));
            $defaultSelectedSalles = $salles->random($numDefaultSalles);

            if ($defaultSelectedSalles instanceof Salle) { // If random(1) returns a single model
                $defaultSelectedSalles = collect([$defaultSelectedSalles]);
            }

            foreach ($defaultSelectedSalles as $salle) {
                $configsToInsert[] = [
                    'module_id' => $module->id,
                    'salle_id' => $salle->id,
                    'configured_capacity' => $salle->default_capacite, // Default to salle's capacity
                    'configured_prof_count' => rand(1, 2), // Default 1 or 2 profs for this room for this module
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }
        
        if (!empty($configsToInsert)) {
            // Use upsert to avoid issues if re-running, based on unique constraint ['module_id', 'salle_id']
            ModuleExamRoomConfig::upsert(
                $configsToInsert,
                ['module_id', 'salle_id'], // Unique by columns
                ['configured_capacity', 'configured_prof_count', 'updated_at'] // Columns to update on duplicate
            );
        }
        $this->command->info('ModuleExamRoomConfigSeeder: Module exam room configurations seeded successfully.');
    }
}