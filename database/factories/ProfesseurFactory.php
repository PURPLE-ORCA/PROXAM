<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProfesseurFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'nom' => $this->faker->lastName(),
            'prenom' => $this->faker->firstName(),
            'rang' => $this->faker->randomElement(['PA', 'PAG', 'PES']),
            'statut' => $this->faker->randomElement(['Active', 'On_Leave', 'Sick_Leave', 'Vacation', 'Inactive']),
            'is_chef_service' => $this->faker->boolean(),
            'date_recrutement' => $this->faker->date(),
            'specialite' => $this->faker->word(),
            'service_id' => \App\Models\Service::factory(),
        ];
    }
}
