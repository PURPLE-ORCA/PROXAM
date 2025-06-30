<?php

namespace Tests\Feature;

use App\Models\Attribution;
use App\Models\Examen;
use App\Models\Professeur;
use App\Models\Unavailability;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use PHPUnit\Framework\Attributes\Test;

class StaleConflictCommandTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function it_clears_the_conflict_flag_for_a_past_unavailability()
    {
        // 1. ARRANGE
        // Create a professor with an assignment that was in conflict, but isn't anymore.
        $prof = Professeur::factory()->create();
        // Ensure no other unavailabilities interfere with this test
        $prof->unavailabilities()->delete();

        $examen = Examen::factory()->create(['debut' => now()->subDays(10)]); // Exam was 10 days ago

        // The attribution is still incorrectly flagged as in conflict
        $attribution = Attribution::factory()->create([
            'professeur_id' => $prof->id,
            'examen_id' => $examen->id,
            'is_in_conflict' => true,
        ]);

        // Create the unavailability record that CAUSED the conflict, also in the past.
        Unavailability::factory()->past()->create([
            'professeur_id' => $prof->id,
        ]);

        // 2. ACT
        // Run the janitor command
        $this->artisan('app:resolve-stale-conflicts')->assertExitCode(0);

        // 3. ASSERT
        // The janitor should have cleaned up the flag.
        $this->assertFalse($attribution->fresh()->is_in_conflict);
    }

    #[test]
    public function it_does_not_clear_the_flag_for_an_active_conflict()
    {
        // 1. ARRANGE
        // Create a professor with a FUTURE assignment that is legitimately in conflict.
        $prof = Professeur::factory()->create();
        $examDebut = now()->addDays(10);
        $examen = Examen::factory()->create(['debut' => $examDebut]);

        // The attribution is correctly flagged as in conflict
        $attribution = Attribution::factory()->create([
            'professeur_id' => $prof->id,
            'examen_id' => $examen->id,
            'is_in_conflict' => true,
        ]);

        // Create an unavailability that is still active and overlaps the exam
        Unavailability::factory()->create([
            'professeur_id' => $prof->id,
            'start_datetime' => $examDebut->copy()->subHour(),
            'end_datetime' => $examDebut->copy()->addHour(),
        ]);

        // 2. ACT
        // Run the janitor command
        $this->artisan('app:resolve-stale-conflicts')->assertExitCode(0);

        // 3. ASSERT
        // The janitor should have checked this conflict but left it alone because it's still valid.
        $this->assertTrue($attribution->fresh()->is_in_conflict);
    }
}
