<?php

namespace App\Http\Controllers\Professor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\AnneeUni; // Keep for potential error messages if needed, but not for props
use App\Models\Unavailability;
use Illuminate\Support\Facades\Log;

class UnavailabilityController extends Controller
{
    public function index(Request $request)
    {
        $professeur = $request->user()->professeur; // Assuming User model has professeur() relationship
        $selectedAnneeUniId = session('selected_annee_uni_id');

        Log::info("--- Professor UnavailabilityController ---");
        Log::info("Professeur ID: " . ($professeur?->id ?? 'NULL'));
        Log::info("Selected AnneeUni ID from session: " . ($selectedAnneeUniId ?? 'NULL'));

        if (!$selectedAnneeUniId || !$professeur) {
            Log::error("ProfessorUnavailability: Missing selectedAnneeUniId or professor model.");
            return Inertia::render('Professor/MyUnavailabilitiesPage', [
                'unavailabilities' => collect(),
                // 'errorMessage' => 'An academic year must be selected or professor data is invalid.', // Optional error message
                // 'auth' and 'academicYear' props will be automatically available from HandleInertiaRequests
            ]);
        }

        $unavailabilities = Unavailability::where('professeur_id', $professeur->id)
            ->where('annee_uni_id', $selectedAnneeUniId)
            ->orderBy('start_datetime', 'asc')
            ->get();

        Log::info("Fetched " . $unavailabilities->count() . " unavailabilities.");

        return Inertia::render('Professor/MyUnavailabilitiesPage', [
            'unavailabilities' => $unavailabilities,
            // 'auth' and 'academicYear' props will be automatically available from HandleInertiaRequests
        ]);
    }
}