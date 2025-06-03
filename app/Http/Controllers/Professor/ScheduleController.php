<?php

namespace App\Http\Controllers\Professor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Attribution;
use App\Models\User; 
use App\Models\Professeur; 
use App\Models\Examen;
use App\Models\Module;
use App\Models\Salle;
use App\Models\Seson;
use App\Models\Quadrimestre;
use App\Models\AnneeUni;
use Illuminate\Support\Facades\Log;

class ScheduleController extends Controller
{
    /**
     * Display a listing of the professor's exam schedule.
     */
    public function index(Request $request)
    {

// Log::info("--- Professor ScheduleController ---");
$selectedAnneeUniId = session('selected_annee_uni_id');
// Log::info("User ID: " . ($request->user()?->id));
// Log::info("Selected AnneeUni ID from session in Controller: " . ($selectedAnneeUniId ?? 'NULL'));
        /** @var \App\Models\User $user */
        $user = $request->user();
        
        $professeur = $user->professeur; 

        if (!$professeur) {
            // Handle case where no professor is associated with the user
            // This might be an error or a user without a professor profile
            return Inertia::render('Error', ['status' => 403, 'message' => 'No professor profile associated with this user.']);
        }

        $selectedAnneeUniId = session('selected_annee_uni_id');

        if (!$selectedAnneeUniId) {
            // Handle case where no academic year is selected in session
            // This might redirect to a year selection page or show a message
            return Inertia::render('Professor/MySchedulePage', [
                'attributions' => [],
                'academicYear' => ['selected_annee' => 'N/A'], // Provide a default or empty academic year
                'error' => 'No academic year selected. Please select one from the dashboard.'
            ]);
        }

        $attributions = Attribution::where('professeur_id', $professeur->id)
            ->whereHas('examen.quadrimestre.seson.anneeUni', function ($query) use ($selectedAnneeUniId) {
                $query->where('id', $selectedAnneeUniId);
            })
            ->with(['examen.module', 'salle', 'examen.seson', 'examen.quadrimestre.seson.anneeUni']) // Eager load necessary data
            ->join('examens', 'attributions.examen_id', '=', 'examens.id') // Join for sorting
            ->orderBy('examens.debut', 'asc') // Order by exam start time
            ->select('attributions.*') // Select only attribution columns to avoid ambiguity
            ->get();

        // Fetch the selected academic year details for display
        $academicYearDetails = AnneeUni::find($selectedAnneeUniId);
        $academicYearName = $academicYearDetails ? $academicYearDetails->nom : 'N/A';


        return Inertia::render('Professor/MySchedulePage', [
            'attributions' => $attributions,
            'academicYear' => ['selected_annee' => $academicYearName],
        ]);
    }
}
