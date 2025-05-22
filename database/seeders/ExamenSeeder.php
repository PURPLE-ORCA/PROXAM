<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Examen;
use App\Models\Quadrimestre;
use App\Models\Module;
use Carbon\Carbon;

class ExamenSeeder extends Seeder
{
    public function run()
    {
        $quadrimestres = Quadrimestre::pluck('id')->toArray();
        $modules = Module::pluck('id')->toArray();
        $types = ['QCM', 'theoreique', 'MIXED'];
        $filieres = ['Medicale', 'Pharmacie'];
        
        for ($i = 0; $i < 30; $i++) {
            $start = Carbon::now()->addDays(rand(1, 60))->addHours(rand(9, 15));
            
            Examen::create([
                'nom' => 'Examen ' . ($i + 1),
                'quadrimestre_id' => $quadrimestres[array_rand($quadrimestres)],
                'type' => $types[array_rand($types)],
                'debut' => $start,
                'module_id' => $modules[array_rand($modules)],
                'filiere' => $filieres[array_rand($filieres)],
                'required_professors' => rand(2, 5),
            ]);
        }
    }
}