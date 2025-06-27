<?php

namespace Database\Factories;

use App\Models\Module;
use App\Models\Quadrimestre;
use Illuminate\Database\Eloquent\Factories\Factory;

class ExamenFactory extends Factory
{
    public function definition(): array
    {
        $quadrimestre = Quadrimestre::factory()->create(); // Creates a Quadrimestre and its parent Seson/AnneeUni

        return [
            'nom' => $this->faker->words(3, true),
            'quadrimestre_id' => $quadrimestre->id,
            'seson_id' => $quadrimestre->seson_id,
            'module_id' => Module::factory(),
            'type' => $this->faker->randomElement(['QCM', 'theoreique', 'MIXED']),
            'debut' => $this->faker->dateTimeBetween('+1 week', '+3 weeks'),
        ];
    }
}
