<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        $this->call([
            ServiceSeeder::class,
            UserSeeder::class,
            ProfesseurSeeder::class,
            ModuleSeeder::class,
            SalleSeeder::class,
            ProfesseurModuleSeeder::class,
            AnneeUniSeeder::class,
            SesonSeeder::class,
            QuadrimestreSeeder::class,
            ExamenSeeder::class,
            ExamensSallesSeeder::class,
            AttributionSeeder::class,
            EchangeSeeder::class,
            UnavailabilitySeeder::class,
        ]);
    }
}