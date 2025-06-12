<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Quadrimestre;
use App\Models\Seson;

class QuadrimestreSeeder extends Seeder
{
    public function run()
    {
        $sesons = Seson::all();
        
        foreach ($sesons as $seson) {
            // Create 2 to 4 quadrimestres per session
            $numQuadrimestres = rand(2, 4);
            for ($i = 1; $i <= $numQuadrimestres; $i++) {
                Quadrimestre::create([
                    'code' => 'Q' . $i,
                    'seson_id' => $seson->id,
                ]);
            }
        }
    }
}
