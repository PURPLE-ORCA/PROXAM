<?php

namespace Database\Factories;

use App\Models\AnneeUni;
use Illuminate\Database\Eloquent\Factories\Factory;

class AnneeUniFactory extends Factory
{
    protected $model = AnneeUni::class;

    public function definition(): array
    {
        return [
            'annee' => $this->faker->unique()->year(),
        ];
    }
}
