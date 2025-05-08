<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            ServiceSeeder::class,
            UserSeeder::class,
            ProfesseurSeeder::class,
            ModuleSeeder::class,
            ProfesseurModuleSeeder::class,
            AnneeUniSeeder::class,
            SessionSeeder::class,
            QuadrimestreSeeder::class,
            SalleSeeder::class,
            ExamenSeeder::class,
            ExamensSallesSeeder::class,
            AttributionSeeder::class,
            ProfessorUnavailabilitySeeder::class,
            EchangeTableSeeder::class,
        ]);
        
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'role' => "admin",
        ]);
    }
}
