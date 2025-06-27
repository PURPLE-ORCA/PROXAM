<?php

namespace Database\Factories;

use App\Models\Salle;
use Illuminate\Database\Eloquent\Factories\Factory;

class SalleFactory extends Factory
{
    protected $model = Salle::class;

    public function definition(): array
    {
        return [
            'nom' => $this->faker->unique()->word(),
            'default_capacite' => $this->faker->numberBetween(10, 100),
        ];
    }
}
