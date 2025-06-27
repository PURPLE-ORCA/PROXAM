<?php

namespace Database\Factories;

use App\Models\AnneeUni;
use App\Models\Professeur;
use Illuminate\Database\Eloquent\Factories\Factory;

class UnavailabilityFactory extends Factory
{
    public function definition(): array
    {
        return [
            'professeur_id' => Professeur::factory(),
            'annee_uni_id' => AnneeUni::factory(),
            'start_datetime' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'end_datetime' => $this->faker->dateTimeBetween('now', '+1 month'),
            'reason' => $this->faker->sentence(),
        ];
    }

    /**
     * Indicate that the unavailability is in the past.
     */
    public function past(): static
    {
        return $this->state(fn (array $attributes) => [
            'start_datetime' => $this->faker->dateTimeBetween('-2 months', '-1 month'),
            'end_datetime' => $this->faker->dateTimeBetween('-1 month', '-1 day'),
        ]);
    }
}
