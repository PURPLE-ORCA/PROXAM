<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Service;

class ServiceSeeder extends Seeder
{
    public function run()
    {
        $services = [
            'Mère et Enfant', 'Préclinique', 'Chirurgical', 'Médical'
        ];

        foreach (array_slice($services, 0, 10) as $service) {
            Service::create(['nom' => $service]);
        }
    }
}
