<?php

namespace Database\Factories;

use App\Models\Quadrimestre;
use App\Models\Seson;
use Illuminate\Database\Eloquent\Factories\Factory;

class QuadrimestreFactory extends Factory
{
    protected $model = Quadrimestre::class;

    public function definition(): array
    {
        $seson = Seson::factory()->create();

        return [
            'code' => $this->faker->unique()->word(),
            'seson_id' => $seson->id,
        ];
    }
}
