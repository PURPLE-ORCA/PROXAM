<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Level;
use App\Models\Filiere; // To fetch Filieres for forms and context
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class LevelController extends Controller
{
    protected function baseInertiaPath(): string
    {
        return 'Admin/Levels/';
    }

    /**
     * Display a listing of levels for a specific filiere.
     */
    public function index(Request $request, Filiere $filiere) // Receive Filiere via Route Model Binding
    {
        $filiere->load('levels'); // Eager load levels for this filiere
        // For card view, usually all levels of a filiere are shown. Add search if needed.
        $levels = $filiere->levels()->orderBy('nom')->get();

        return Inertia::render($this->baseInertiaPath() . 'Index', [
            'filiere' => $filiere, // Pass the parent filiere
            'levels' => $levels,   // Pass its levels
            'filters' => $request->only(['search']), // For potential search within levels
        ]);
    }

    /**
     * Show the form for creating a new level.
     * Can optionally receive a filiere to pre-select.
     */
    public function create(Request $request)
    {
        $filieres = Filiere::orderBy('nom')->get(['id', 'nom']);
        $filiereIdFromRequest = $request->input('filiere_id'); // To pre-select if coming from a filiere page

        return Inertia::render($this->baseInertiaPath() . 'Create', [
            'filieres' => $filieres,
            'selectedFiliereId' => $filiereIdFromRequest ? (int)$filiereIdFromRequest : null,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => [
                'required', 'string', 'max:255',
                Rule::unique('levels')->where(function ($query) use ($request) {
                    return $query->where('filiere_id', $request->filiere_id);
                }),
            ],
            'filiere_id' => 'required|exists:filieres,id',
        ]);

        Level::create($validated);

        // Redirect back to the levels index for the parent filiere
        return redirect()->route('admin.levels.index', ['filiere' => $request->filiere_id])
            ->with('success', 'toasts.level_created_successfully');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Level $level)
    {
        $filieres = Filiere::orderBy('nom')->get(['id', 'nom']);
        $level->load('filiere'); // Ensure filiere is loaded

        return Inertia::render($this->baseInertiaPath() . 'Edit', [
            'levelToEdit' => $level,
            'filieres' => $filieres,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Level $level)
    {
        $validated = $request->validate([
            'nom' => [
                'required', 'string', 'max:255',
                Rule::unique('levels')->where(function ($query) use ($request) {
                    return $query->where('filiere_id', $request->filiere_id);
                })->ignore($level->id),
            ],
            'filiere_id' => 'required|exists:filieres,id',
        ]);

        $level->update($validated);

        return redirect()->route('admin.levels.index', ['filiere' => $level->filiere_id])
            ->with('success', 'toasts.level_updated_successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Level $level)
    {
        if ($level->modules()->exists()) {
            return redirect()->route('admin.levels.index', ['filiere' => $level->filiere_id])
                ->with('error', 'toasts.level_in_use_cannot_delete');
        }
        $filiereId = $level->filiere_id; // Get filiere_id before deleting for redirect
        $level->delete();

        return redirect()->route('admin.levels.index', ['filiere' => $filiereId])
            ->with('success', 'toasts.level_deleted_successfully');
    }
}