<?php

namespace App\Http\Controllers;

use App\Models\Unavailability; 
use App\Models\Professeur;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UnavailabilityController extends Controller 
{
    protected function baseInertiaPath(): string
    {
        return 'Admin/Unavailabilities/'; 
    }

    public function index(Request $request)
    {
        $unavailabilities = Unavailability::with('professeur.user') // <<< CORRECTED
            ->when($request->input('search'), function ($query, $search) {
                $query->whereHas('professeur', function ($q) use ($search) {
                    $q->where('nom', 'like', "%{$search}%")
                      ->orWhere('prenom', 'like', "%{$search}%");
                })->orWhere('reason', 'like', "%{$search}%");
            })
            ->when($request->input('professeur_id'), fn($q, $id) => $q->where('professeur_id', $id))
            ->orderBy('start_datetime', 'desc')
            ->paginate(15)
            ->withQueryString();

        $professeursForFilter = Professeur::orderBy('nom')->orderBy('prenom')->get(['id', 'nom', 'prenom']);

        return Inertia::render($this->baseInertiaPath() . 'Index', [
            'unavailabilities' => $unavailabilities, // <<< CORRECTED
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