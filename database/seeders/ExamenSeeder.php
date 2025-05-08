<?php

namespace Database\Seeders;

use App\Models\Examen;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class ExamenSeeder extends Seeder
{
    public function run()
    {
        $examens = [
            [
                'date' => Carbon::create(2025, 1, 10, 8, 30), // Jan 10, 2025 at 8:30 AM
                'duree' => 120, // 2 hours
                'module_id' => 1, 
                'quadrimestre_id' => 1
            ],
            [
                'date' => Carbon::create(2025, 1, 12, 13, 0), // Jan 12, 2025 at 1:00 PM
                'duree' => 90, // 1.5 hours
                'module_id' => 2, 
                'quadrimestre_id' => 1
            ],
            [
                'date' => Carbon::create(2025, 1, 15, 9, 0), // Jan 15, 2025 at 9:00 AM
                'duree' => 180, // 3 hours
                'module_id' => 3, 
                'quadrimestre_id' => 1
            ],
            [
                'date' => Carbon::create(2025, 1, 17, 8, 0), // Jan 17, 2025 at 8:00 AM
                'duree' => 120, // 2 hours
                'module_id' => 4, 
                'quadrimestre_id' => 2
            ],
            [
                'date' => Carbon::create(2025, 2, 5, 14, 30), // Feb 5, 2025 at 2:30 PM
                'duree' => 150, // 2.5 hours
                'module_id' => 5, 
                'quadrimestre_id' => 2
            ],
            [
                'date' => Carbon::create(2025, 2, 7, 10, 0), // Feb 7, 2025 at 10:00 AM
                'duree' => 90, // 1.5 hours
                'module_id' => 6, 
                'quadrimestre_id' => 2
            ],
            [
                'date' => Carbon::create(2025, 3, 10, 8, 30), // Mar 10, 2025 at 8:30 AM
                'duree' => 120, // 2 hours
                'module_id' => 7, 
                'quadrimestre_id' => 3
            ],
            [
                'date' => Carbon::create(2025, 3, 12, 13, 30), // Mar 12, 2025 at 1:30 PM
                'duree' => 180, // 3 hours
                'module_id' => 8, 
                'quadrimestre_id' => 3
            ],
            [
                'date' => Carbon::create(2025, 3, 15, 9, 0), // Mar 15, 2025 at 9:00 AM
                'duree' => 120, // 2 hours
                'module_id' => 9, 
                'quadrimestre_id' => 4
            ],
            [
                'date' => Carbon::create(2025, 3, 17, 14, 0), // Mar 17, 2025 at 2:00 PM
                'duree' => 150, // 2.5 hours
                'module_id' => 10, 
                'quadrimestre_id' => 4
            ],
            // Add more exams up to 30 if needed
        ];

        foreach ($examens as $exam) {
            Examen::create($exam);
        }

        // Generate additional random exams if needed
        if (count($examens) < 30) {
            $additionalExams = 30 - count($examens);
            $modules = range(1, 30); // Assuming you have 30 modules
            $quadrimestres = range(1, 4); // Assuming you have 4 quadrimestres

            for ($i = 0; $i < $additionalExams; $i++) {
                $date = Carbon::create(2025, rand(1, 6), rand(1, 28), rand(8, 14), [0, 30][rand(0, 1)]);
                
                Examen::create([
                    'date' => $date,
                    'duree' => [60, 90, 120, 180][rand(0, 3)], // Random duration
                    'module_id' => $modules[rand(0, count($modules) - 1)],
                    'quadrimestre_id' => $quadrimestres[rand(0, count($quadrimestres) - 1)]
                ]);
            }
        }
    }
}