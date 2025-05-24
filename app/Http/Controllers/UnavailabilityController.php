<?php

namespace App\Http\Controllers;

use App\Models\AnneeUni;
use App\Models\Unavailability; 
use App\Models\Professeur;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class UnavailabilityController extends Controller 
{
    protected function baseInertiaPath(): string
    {
        return 'Admin/Unavailabilities/'; 
    }

    private function getAcademicYearDateRangeFromString(string $anneeUniAnneeString): ?array
    {
        if (preg_match('/^(\d{4})-(\d{4})$/', $anneeUniAnneeString, $matches)) {
            $startYear = (int)$matches[1];
            return [
                Carbon::create($startYear, 9, 1)->startOfDay(), // September 1st
                Carbon::create($startYear + 1, 8, 31)->endOfDay(),   // August 31st
            ];
        }
        return null;
    }

    public function index(Request $request)
    {
        $latestAnneeUni = AnneeUni::orderBy('annee', 'desc')->first();
        $selectedAnneeUniId = session('selected_annee_uni_id', $latestAnneeUni?->id);
        $selectedAnneeUni = $selectedAnneeUniId ? AnneeUni::find($selectedAnneeUniId) : null;

        $unavailabilitiesQuery = Unavailability::with('professeur.user');

        if ($selectedAnneeUni && $selectedAnneeUni->annee) {
            $dateRange = $this->getAcademicYearDateRangeFromString($selectedAnneeUni->annee);
            if ($dateRange) {
                $academicYearStart = $dateRange[0];
                $academicYearEnd = $dateRange[1];

                // Filter unavailabilities that overlap with the selected academic year
                $unavailabilitiesQuery->where(function ($query) use ($academicYearStart, $academicYearEnd) {
                    $query->where(function ($q) use ($academicYearStart, $academicYearEnd) { // Starts within the year
                        $q->where('start_datetime', '>=', $academicYearStart)
                          ->where('start_datetime', '<=', $academicYearEnd);
                    })->orWhere(function ($q) use ($academicYearStart, $academicYearEnd) { // Ends within the year
                        $q->where('end_datetime', '>=', $academicYearStart)
                          ->where('end_datetime', '<=', $academicYearEnd);
                    })->orWhere(function ($q) use ($academicYearStart, $academicYearEnd) { // Spans the entire year
                        $q->where('start_datetime', '<', $academicYearStart)
                          ->where('end_datetime', '>', $academicYearEnd);
                    });
                });
            }
        } else {
            // If no specific year, maybe show upcoming unavailabilities or none by default
            // For now, let's show none if no year context is strongly defined.
             $unavailabilitiesQuery->whereRaw('1 = 0');
             Log::warning('UnavailabilityController@index: No selected_annee_uni or parsable year. Displaying no unavailabilities.');
        }

        $unavailabilitiesQuery
            ->when($request->input('search'), function ($query, $search) { /* ... existing search ... */ })
            ->when($request->input('professeur_id'), fn($q, $id) => $q->where('professeur_id', $id));

        $unavailabilities = $unavailabilitiesQuery
            ->orderBy('start_datetime', 'desc')
            ->paginate(15)
            ->withQueryString();

        $professeursForFilter = Professeur::orderBy('nom')->orderBy('prenom')->get(['id', 'nom', 'prenom']);

        return Inertia::render($this->baseInertiaPath() . 'Index', [
            'unavailabilities' => $unavailabilities,
            'filters' => $request->only(['search', 'professeur_id']),
            'professeursForFilter' => $professeursForFilter,
        ]);
    }

    public function create()
    {
        $professeurs = Professeur::orderBy('nom')->orderBy('prenom')->get()->map(fn($p) => [
            'id' => $p->id,
            'display_name' => "{$p->prenom} {$p->nom}",
        ]);
        return Inertia::render($this->baseInertiaPath() . 'Create', [
            'professeurs' => $professeurs,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'professeur_id' => 'required|exists:professeurs,id',
            'start_datetime' => 'required|date',
            'end_datetime' => 'required|date|after_or_equal:start_datetime',
            'reason' => 'nullable|string|max:255',
        ]);

        Unavailability::create($validated); // <<< CORRECTED

        return redirect()->route('admin.unavailabilities.index') // <<< CORRECTED
            ->with('success', 'toasts.unavailability_created_successfully');
    }

    public function edit(Unavailability $unavailability) // <<< CORRECTED type-hint and variable
    {
        $professeurs = Professeur::orderBy('nom')->orderBy('prenom')->get()->map(fn($p) => [
            'id' => $p->id,
            'display_name' => "{$p->prenom} {$p->nom}",
        ]);
        $unavailability->load('professeur');

        return Inertia::render($this->baseInertiaPath() . 'Edit', [
            'unavailabilityToEdit' => $unavailability, // <<< CORRECTED
            'professeurs' => $professeurs,
        ]);
    }

    public function update(Request $request, Unavailability $unavailability) // <<< CORRECTED
    {
        $validated = $request->validate([
            'professeur_id' => 'required|exists:professeurs,id',
            'start_datetime' => 'required|date',
            'end_datetime' => 'required|date|after_or_equal:start_datetime',
            'reason' => 'nullable|string|max:255',
        ]);

        $unavailability->update($validated);

        return redirect()->route('admin.unavailabilities.index') // <<< CORRECTED
            ->with('success', 'toasts.unavailability_updated_successfully');
    }

    public function destroy(Unavailability $unavailability) // <<< CORRECTED
    {
        $unavailability->delete();

        return redirect()->route('admin.unavailabilities.index') // <<< CORRECTED
            ->with('success', 'toasts.unavailability_deleted_successfully');
    }
}