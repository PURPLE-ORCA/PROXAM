<?php

namespace Tests\Feature\Admin; // Group admin-related feature tests

use App\Models\AnneeUni;
use App\Models\Examen;
use App\Models\Module;
use App\Models\Professeur;
use App\Models\Quadrimestre;
use App\Models\Seson;
use App\Models\Service;
use App\Models\User;
use App\Models\Unavailability; // Your Unavailability model
use App\Models\Attribution;
use Carbon\Carbon;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase; // If you need to extend Laravel's TestCase for Pest with `uses`

uses(RefreshDatabase::class);
// uses(TestCase::class); // If you want to use Laravel's TestCase methods like $this->actingAs

// beforeEach will run before each test in this file
beforeEach(function () {
      // <<< --- ADD THESE LINES TO FORCE CONFIGURATION --- >>>
      config(['database.default' => 'sqlite']);
      config(['database.connections.sqlite.database' => ':memory:']); // Ensure SQLite uses in-memory
      config(['queue.default' => 'sync']);
      // <<< --- END OF ADDED LINES --- >>>
    // Create an admin user to perform actions
    $this->adminUser = User::factory()->create(['role' => 'admin']);

    // Seed some basic dependent data that most tests will need
    // You can create more specific data within each test if needed
    $this->service = Service::factory()->create();
    $this->module = Module::factory()->create(); // For linking exams to modules
    $this->anneeUni = AnneeUni::factory()->create(['annee' => Carbon::now()->year . '-' . (Carbon::now()->year + 1)]);
    $this->seson = Seson::factory()->create(['annee_uni_id' => $this->anneeUni->id]);
    $this->quadrimestre = Quadrimestre::factory()->create(['seson_id' => $this->seson->id]);

    // Ensure Professeur constants are available if your factories rely on them for defaults
    // (Or set them directly in factories)
});

test('assignment engine respects professor unavailability for a single slot exam', function () {
    // 1. ARRANGE: Set up the specific data for this test case
    $examTimeStart = Carbon::now()->addDays(10)->hour(9)->minute(0)->second(0);
    $examTimeEnd = $examTimeStart->copy()->addHours(2);

    // Professor A: Available, teaches the module (optional, but good for testing preferences)
    $profA_user = User::factory()->create(['role' => 'professeur', 'name' => 'Available Prof']);
    $professeurA = Professeur::factory()->recycle($this->service)->create([
        'user_id' => $profA_user->id,
        'statut' => 'Active',
        'specialite' => Professeur::SPECIALITE_MEDICAL, // Or any valid specialty
        'rang' => Professeur::RANG_PA,
    ]);
    $professeurA->modules()->attach($this->module->id); // Prof A teaches the exam's module

    // Professor B: Unavailable during the exam, also teaches the module (to make it a clear choice if available)
    $profB_user = User::factory()->create(['role' => 'professeur', 'name' => 'Unavailable Prof']);
    $professeurB = Professeur::factory()->recycle($this->service)->create([
        'user_id' => $profB_user->id,
        'statut' => 'Active',
        'specialite' => Professeur::SPECIALITE_MEDICAL,
        'rang' => Professeur::RANG_PES, // Make this prof highly ranked to see if unavailability overrides rank
    ]);
    $professeurB->modules()->attach($this->module->id);

    Unavailability::factory()->create([
        'professeur_id' => $professeurB->id,
        'start_datetime' => $examTimeStart->copy()->subMinutes(30), // Unavailable starting before exam
        'end_datetime' => $examTimeEnd->copy()->addMinutes(30),   // Unavailable until after exam
        'reason' => 'Test Unavailability - Should Not Be Assigned',
    ]);

    $examen = Examen::factory()->recycle($this->quadrimestre)->recycle($this->module)->create([
        'required_professors' => 1,
        'nom' => 'Unavailability Test Exam For Single Slot',
        'debut' => Carbon::now()->addDays(10)->hour(9)->minute(0)->second(0),
        'fin' => Carbon::now()->addDays(10)->hour(11)->minute(0)->second(0),
    ]);

    dump("Exam created in test. ID: {$examen->id}, Required Profs: {$examen->required_professors}, Attributions Count (initial): " . $examen->attributions()->count());
    expect($examen->attributions()->count())->toBe(0, "Test Setup Error: Exam ID {$examen->id} should have 0 attributions after factory creation.");

    // --- CRUCIAL DEBUGGING POINT ---
    expect($examen->attributions()->count())->toBe(0, "Test Setup Error: Exam ID {$examen->id} ('{$examen->nom}') should have 0 attributions after factory creation.");
    // OR more specifically:
    expect($examen->attributions()->count())->toBe(0, "Test Setup Error: Exam ID {$examen->id} should have 0 attributions after factory creation.");
    // --- END DEBUGGING POINT ---

    $this->withoutMiddleware(); 

    $url = route('admin.examens.trigger-assignment', $examen); // Or $examen->id
dump("Generated URL for POST: " . $url); 
    // 2. ACT: Trigger the assignment engine as the admin user
    $response = $this->actingAs($this->adminUser)
                    ->withoutMiddleware(VerifyCsrfToken::class)
                     ->post(route('admin.examens.trigger-assignment', $examen));

                     if ($response->status() === 419) {
                        dump("Received 419 Status Code AFTER withoutMiddleware(). Dumping response content:");
                        $response->dump();
                    } elseif ($response->status() !== 302) { // If not a redirect (which we expect on success)
                        dump("Unexpected status code: " . $response->status());
                        $response->dump(); // Dump content for other errors too
                    }
dump(session()->get('success'));
dump(session()->get('error'));
dump(session()->get('warning')); 

    // 3. ASSERT: Verify the outcome
    $response->assertRedirect(route('admin.examens.index'));
    // Check for a success message (even if it's just a "stub" message for now, ensure no errors)
    $response->assertSessionHas('success'); // Or check for specific success/warning keys if your controller sets them

    // Assert Professeur A (available) was assigned
    $this->assertDatabaseHas('attributions', [
        'examen_id' => $examen->id,
        'professeur_id' => $professeurA->id,
    ]);

    // Assert Professeur B (unavailable) was NOT assigned
    $this->assertDatabaseMissing('attributions', [
        'examen_id' => $examen->id,
        'professeur_id' => $professeurB->id,
    ]);

    // Assert exactly one attribution was made for this exam
    expect(Attribution::where('examen_id', $examen->id)->count())->toBe(1);
});