<?php

namespace Database\Factories;

use App\Models\AnneeUni;
use App\Models\Seson;
use Illuminate\Database\Eloquent\Factories\Factory;

class SesonFactory extends Factory
{
    protected $model = Seson::class;

    public function definition(): array
    {
        $anneeUni = AnneeUni::factory()->create();

        return [
            'code' => $this->faker->unique()->word(),
            'annee_uni_id' => $anneeUni->id,
        ];
    }
}
