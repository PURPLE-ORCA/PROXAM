<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Service;

class ServiceSeeder extends Seeder
{
    public function run()
    {
        $services = [
            'Anatomie', 'Biochimie', 'Physiologie', 'Pharmacologie', 'Microbiologie',
            'Pathologie', 'Chirurgie', 'Médecine Interne', 'Pédiatrie', 'Gynécologie',
            'Radiologie', 'Dermatologie', 'Neurologie', 'Cardiologie', 'Ophtalmologie',
            'ORL', 'Psychiatrie', 'Médecine Légale', 'Immunologie', 'Parasitologie'
        ];

        foreach (array_slice($services, 0, 10) as $service) {
            Service::create(['nom' => $service]);
        }
    }
}
