<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Service;

class ServiceSeeder extends Seeder
{
    public function run()
    {
        $services = [
            ['nom' => 'Cardiologie'],
            ['nom' => 'Chirurgie Générale'],
            ['nom' => 'Pédiatrie'],
            ['nom' => 'Dermatologie'],
            ['nom' => 'Gynécologie'],
            ['nom' => 'Pharmacologie'],
            ['nom' => 'Biochimie'],
            ['nom' => 'Pharmacie Clinique'],
            ['nom' => 'Microbiologie'],
            ['nom' => 'Toxicologie'],
        ];

        foreach ($services as $service) {
            Service::create($service);
        }
    }
}
