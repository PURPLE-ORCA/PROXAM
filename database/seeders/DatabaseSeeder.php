<?php // Database\Seeders\DatabaseSeeder.php
namespace Database\Seeders;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        $this->call([
            ServiceSeeder::class,
            UserSeeder::class,
            FiliereSeeder::class,
            LevelSeeder::class,
            ModuleSeeder::class,      
            ProfesseurSeeder::class,
            ProfesseurModuleSeeder::class,
            AnneeUniSeeder::class,
            SesonSeeder::class,
            QuadrimestreSeeder::class,
            SalleSeeder::class,
            ModuleExamRoomConfigSeeder::class, 
            ExamenSeeder::class,               
            ExamensSallesSeeder::class,        
            UnavailabilitySeeder::class,
            // AttributionSeeder::class,     // Should be OFF for assignment engine testing
            // EchangeSeeder::class,
        ]);
    }
}