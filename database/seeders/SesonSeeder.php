<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Seson;
use App\Models\AnneeUni;

class SesonSeeder extends Seeder
{
    public function run()
    {
        $annees = AnneeUni::pluck('id')->toArray();
        $codes = ['Automne', 'Printemps', 'Été'];
        
        // Assuming a user with ID 1 exists for approval_user_id
        $adminUserId = 1; 

        foreach ($annees as $anneeId) {
            foreach ($codes as $index => $code) {
                $data = [
                    'code' => $code,
                    'annee_uni_id' => $anneeId,
                    'assignments_approved_at' => null,
                    'notifications_sent_at' => null,
                    'approval_user_id' => null,
                ];

                // For the first session of the first academic year, simulate approval and notification
                if ($anneeId === $annees[0] && $index === 0) {
                    $data['assignments_approved_at'] = now()->subDays(5);
                    $data['notifications_sent_at'] = now()->subDays(3);
                    $data['approval_user_id'] = $adminUserId;
                }

                Seson::create($data);
            }
        }
    }
}
