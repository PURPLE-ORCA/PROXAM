<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Quadrimestre;
use App\Models\Session;

class QuadrimestreSeeder extends Seeder
{
    public function run()
    {
        $sessions = Session::all();

        foreach ($sessions as $session) {
            Quadrimestre::create([
                'nom' => 'Q1',
                'session_id' => $session->id,
            ]);

            Quadrimestre::create([
                'nom' => 'Q2', 
                'session_id' => $session->id,
            ]);
        }
    }
}
