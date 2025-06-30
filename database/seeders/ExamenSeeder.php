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
        $quadrimestres = Quadrimestre::with('seson.anneeUni')->get(); // Get full object for date context
        $modules = Module::all();
        $types = array_keys(Examen::getTypes()); // Use keys from model method

        if ($quadrimestres->isEmpty() || $modules->isEmpty()) {
            $this->command->warn('ExamenSeeder: No quadrimestres or modules found. Skipping.');
            return;
        }

        $examNames = [
            "Examen Final", "Examen Partiel", "Contrôle Continu", "Rattrapage", "Examen Blanc",
            "Évaluation Clinique", "QCM Théorique", "Analyse de Cas", "Projet Pratique", "Soutenance Orale"
        ];

        for ($i = 0; $i < 200; $i++) { // Create more exams
            $quadrimestre = $quadrimestres->random();
            $module = $modules->random();

            $yearForExam = (int)substr($quadrimestre->seson->anneeUni->annee, 0, 4);
            $monthOffset = rand(1,12);
            
            $isAM = rand(0, 1) === 0;
            $startHour = $isAM ? rand(8, 10) : rand(14, 16);
            $startMinute = rand(0,1) === 0 ? 0 : 30;

            $baseDate = Carbon::create($yearForExam, $monthOffset, rand(1, 28), $startHour, $startMinute, 0);
            $now = Carbon::now();
            if ($baseDate->lt($now->copy()->subMonths(2)) || $baseDate->gt($now->copy()->addMonths(6))) {
                $baseDate = $now->copy()->addDays(rand(10, 70))->hour($startHour)->minute($startMinute)->second(0);
            }

            $examName = $examNames[array_rand($examNames)] . " - " . $module->nom;
            $uniqueExamName = Examen::where('nom', $examName)->exists() ? $examName . " #" . ($i+1) : $examName;

            Examen::create([
                'nom' => $uniqueExamName,
                'quadrimestre_id' => $quadrimestre->id,
                'type' => $types[array_rand($types)],
                'debut' => $baseDate,
                'module_id' => $module->id,
                'seson_id' => $quadrimestre->seson->id, // Added seson_id
            ]);
        }
        $this->command->info('ExamenSeeder: Exams seeded successfully.');
    }
}
