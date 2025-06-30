<?php

namespace Database\Factories;

use App\Models\Attribution;
use App\Models\Examen;
use App\Models\Professeur;
use App\Models\Salle;
use Illuminate\Database\Eloquent\Factories\Factory;

class AttributionFactory extends Factory
{
    protected $model = Attribution::class;

    public function definition(): array
    {
        return [
            'examen_id' => Examen::factory(),
            'professeur_id' => Professeur::factory(),
            'is_responsable' => $this->faker->boolean(),
            'salle_id' => Salle::factory(),
            'is_involved_in_exchange' => $this->faker->boolean(),
            'is_in_conflict' => $this->faker->boolean(),
        ];
    }
}
