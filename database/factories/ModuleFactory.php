<?php

namespace Database\Factories;

use App\Models\Filiere;
use App\Models\Level;
use App\Models\Module;
use Illuminate\Database\Eloquent\Factories\Factory;

class ModuleFactory extends Factory
{
    protected $model = Module::class;

    public function definition(): array
    {
        return [
            'nom' => $this->faker->unique()->word(),
            'level_id' => Level::factory(),
        ];
    }
}
