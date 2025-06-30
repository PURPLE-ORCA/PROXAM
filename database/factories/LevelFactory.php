<?php

namespace Database\Factories;

use App\Models\Level;
use Illuminate\Database\Eloquent\Factories\Factory;

class LevelFactory extends Factory
{
    protected $model = Level::class;

    public function definition(): array
    {
        return [
            'nom' => $this->faker->unique()->word(),
            'filiere_id' => \App\Models\Filiere::factory(),
        ];
    }
}
