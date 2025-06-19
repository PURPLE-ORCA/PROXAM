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
        // ... (all existing logic for academic year filtering is fine)
        $latestAnneeUni = AnneeUni::orderBy('annee', 'desc')->first();
        $selectedAnneeUniId = session('selected_annee_uni_id', $latestAnneeUni?->id);
        $selectedAnneeUni = $selectedAnneeUniId ? AnneeUni::find($selectedAnneeUniId) : null;

        $unavailabilitiesQuery = Unavailability::with('professeur.user');

        if ($selectedAnneeUni && $selectedAnneeUni->annee) {
            $dateRange = $this->getAcademicYearDateRangeFromString($selectedAnneeUni->annee);
            if ($dateRange) {
                // ... (date range filtering logic is fine)
            }
        } else {
             $unavailabilitiesQuery->whereRaw('1 = 0');
             Log::warning('UnavailabilityController@index: No selected_annee_uni or parsable year. Displaying no unavailabilities.');
        }

        // --- THIS IS THE FIX ---
        $unavailabilitiesQuery
            ->when($request->input('search'), function ($query, $search) {
                // Search in the reason column of the unavailabilities table
                $query->where('reason', 'like', "%{$search}%")
                      // Also search in the related professor's name
                      ->orWhereHas('professeur', function ($q) use ($search) {
                          $q->where('nom', 'like', "%{$search}%")
                            ->orWhere('prenom', 'like', "%{$search}%");
                      });
            })
            ->when($request->input('professeur_id'), fn($q, $id) => $q->where('professeur_id', $id));
        // --- END OF FIX ---

        $unavailabilities = $unavailabilitiesQuery
            ->orderBy('start_datetime', 'desc')
            ->paginate(30)
            ->withQueryString();

        $professeurs = Professeur::orderBy('nom')->orderBy('prenom')->get()->map(fn($p) => [
            'id' => $p->id,
            'display_name' => "{$p->prenom} {$p->nom}",
        ]);
        $anneeUnis = AnneeUni::orderBy('annee', 'desc')->get(['id', 'annee']);

        return Inertia::render($this->baseInertiaPath() . 'Index', [
            'unavailabilities' => $unavailabilities,
            'filters' => $request->only(['search', 'professeur_id']),
            'professeursForForm' => $professeurs,
            'anneeUnisForForm' => $anneeUnis,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'professeur_id' => 'required|exists:professeurs,id',
            'annee_uni_id' => 'required|exists:annee_unis,id',
            'start_datetime' => 'required|date',
            'end_datetime' => 'required|date|after_or_equal:start_datetime',
            'reason' => 'nullable|string|max:255',
        ]);

        Unavailability::create($validated);

        return redirect()->route('admin.unavailabilities.index')
            ->with('success', 'toasts.unavailability_created_successfully');
    }

    public function update(Request $request, Unavailability $unavailability)
    {
        $validated = $request->validate([
            'professeur_id' => 'required|exists:professeurs,id',
            'annee_uni_id' => 'required|exists:annee_unis,id',
            'start_datetime' => 'required|date',
            'end_datetime' => 'required|date|after_or_equal:start_datetime',
            'reason' => 'nullable|string|max:255',
        ]);

        $unavailability->update($validated);

        return redirect()->route('admin.unavailabilities.index')
            ->with('success', 'toasts.unavailability_updated_successfully');
    }

    public function destroy(Unavailability $unavailability)
    {
        $unavailability->delete();

        return redirect()->route('admin.unavailabilities.index')
            ->with('success', 'toasts.unavailability_deleted_successfully');
    }}
