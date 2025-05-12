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
            $quadrimestres = [
                ['code' => 'Q1', 'seson_id' => $seson->id],
                ['code' => 'Q2', 'seson_id' => $seson->id],
            ];
            
            foreach ($quadrimestres as $quadrimestre) {
                Quadrimestre::create($quadrimestre);
            }
        }
    }
}