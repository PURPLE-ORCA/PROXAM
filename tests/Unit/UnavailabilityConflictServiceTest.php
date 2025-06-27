<?php

namespace Tests\Unit;

use App\Models\Attribution;
use App\Models\Examen;
use App\Models\Professeur;
use App\Models\Unavailability;
use App\Services\UnavailabilityConflictService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UnavailabilityConflictServiceTest extends TestCase
{
    use RefreshDatabase;

    private UnavailabilityConflictService $service;

    public function setUp(): void
    {
        parent::setUp();
        $this->service = new UnavailabilityConflictService();
    }

    /** @test */
    public function it_correctly_flags_an_attribution_as_in_conflict()
    {
        // 1. ARRANGE
        $prof = Professeur::factory()->create();
        // Create an exam that starts exactly 10 days from now at 9 AM
        $examDebut = now()->addDays(10)->setHour(9)->setMinutes(0)->setSeconds(0);
        $examen = Examen::factory()->create(['debut' => $examDebut]);

        $attribution = Attribution::factory()->create([
            'professeur_id' => $prof->id,
            'examen_id' => $examen->id,
            'is_in_conflict' => false,
        ]);

        // Create an unavailability that clearly overlaps (8 AM to 12 PM on the same day)
        $unavailability = Unavailability::factory()->create([
            'professeur_id' => $prof->id,
            'start_datetime' => $examDebut->copy()->subHour(),
            'end_datetime' => $examDebut->copy()->addHours(3),
        ]);

        // 2. ACT
        $this->service->updateConflictsFor($unavailability);

        // 3. ASSERT
        $this->assertTrue($attribution->fresh()->is_in_conflict);
    }

    /** @test */
    public function it_does_not_flag_a_non_conflicting_attribution()
    {
        // 1. ARRANGE
        $prof = Professeur::factory()->create();
        $examDebut = now()->addDays(10)->setHour(9);
        $examen = Examen::factory()->create(['debut' => $examDebut]);

        $attribution = Attribution::factory()->create([
            'professeur_id' => $prof->id,
            'examen_id' => $examen->id,
            'is_in_conflict' => false,
        ]);

        // Create an unavailability for a completely different day
        $unavailability = Unavailability::factory()->create([
            'professeur_id' => $prof->id,
            'start_datetime' => now()->addDay(),
            'end_datetime' => now()->addDay()->addHours(2),
        ]);

        // 2. ACT
        $this->service->updateConflictsFor($unavailability);

        // 3. ASSERT
        $this->assertFalse($attribution->fresh()->is_in_conflict);
    }
}
