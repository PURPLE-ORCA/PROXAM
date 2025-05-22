<?php

namespace App\Http\Controllers;

use App\Models\Filiere;
use App\Models\Level;
use App\Models\Module;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ModuleController extends Controller
{
    protected function baseInertiaPath(): string
    {
        return 'Admin/Modules/';
    }

    public function indexForLevel(Request $request, Level $level)
    {
        $level->load(['modules' => function ($query) use ($request) { // Added $request for search
            $query->orderBy('nom')
                  ->when($request->input('search_module'), fn ($q, $search) => $q->where('nom', 'like', "%{$search}%")); // Search specific to modules here
        }, 'filiere']);

        return Inertia::render($this->baseInertiaPath() . 'LevelModulesIndex', [
            'level' => $level,
            'modules' => $level->modules, // These are now filtered if search_module is present
            'filiere' => $level->filiere, // Pass parent filiere for breadcrumbs
            'filters' => $request->only(['search_module']),
        ]);
    }

    public function create(Request $request, Level $level) // Level is now directly injected
    {
        // We have the $level, so we also know its filiere.
        $level->load('filiere'); // Ensure filiere is loaded for context if needed in the view

        // For the form, if you allow changing the Level (which is less common when "adding to this level"),
        // you'd pass all filieres and levels.
        // If the form *fixes* the level to the one from the URL, you only need to pass that.
        $filieres = Filiere::orderBy('nom')->get(['id', 'nom']); // Still useful if form shows filiere context
        $allLevels = Level::with('filiere:id,nom')
                        ->orderBy('filiere_id')->orderBy('nom')->get()
                        ->map(fn($l) => [
                            'id' => $l->id,
                            'nom' => $l->nom,
                            'filiere_nom' => $l->filiere->nom,
                            'filiere_id' => $l->filiere_id
                        ]);


        return Inertia::render($this->baseInertiaPath() . 'Create', [
            'filieres' => $filieres,  // For the Filiere part of the cascaded select in ModuleForm
            'allLevels' => $allLevels, // For the Level part of the cascaded select in ModuleForm
            'currentLevel' => $level, // Pass the specific level context
            'selectedLevelId' => $level->id, // Pre-fill and potentially disable level selection in the form
        ]);
    }    

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => [
                'required', 'string', 'max:255',
                Rule::unique('modules')->where(function ($query) use ($request) {
                    return $query->where('level_id', $request->level_id);
                }),
            ],
            'level_id' => 'required|exists:levels,id', // <<< ADD THIS VALIDATION
        ]);

        Module::create($validated); // $validated will now include level_id

        // Redirect to the modules list for the level this module was added to
        return redirect()->route('admin.modules.index', ['level' => $request->level_id])
            ->with('success', 'toasts.module_created_successfully');
    }

    public function edit(Module $module)
    {
        $module->load(['level.filiere']);
        $filieres = Filiere::orderBy('nom')->get(['id', 'nom']);
        $allLevels = Level::with('filiere:id,nom')
                         ->orderBy('filiere_id')->orderBy('nom')->get()
                         ->map(fn($l) => [
                            'id' => $l->id, 'nom' => $l->nom, 'filiere_nom' => $l->filiere->nom, 'filiere_id' => $l->filiere_id
                         ]);

        return Inertia::render($this->baseInertiaPath() . 'Edit', [
            'moduleToEdit' => $module, // Renamed prop for clarity
            'filieres' => $filieres,
            'allLevels' => $allLevels,
        ]);
    }

    public function update(Request $request, Module $module)
    {
        $validated = $request->validate([
            'nom' => [
                'required', 'string', 'max:255',
                Rule::unique('modules')->where(function ($query) use ($request) {
                    return $query->where('level_id', $request->level_id);
                })->ignore($module->id),
            ],
            'level_id' => 'required|exists:levels,id', // <<< ADD THIS VALIDATION
        ]);

        $module->update($validated); // $validated will include level_id

        return redirect()->route('admin.modules.index', ['level' => $module->level_id])
            ->with('success', 'toasts.module_updated_successfully');
    }

    public function destroy(Module $module)
    {
        // Check if the module is linked to professors or exams
        if ($module->professeurs()->exists() || $module->examens()->exists()) {
            return redirect()->route('admin.modules.index', ['level' => $module->level_id]) // Redirect to parent level
                ->with('error', 'toasts.module_in_use_cannot_delete');
        }
        $levelId = $module->level_id; // Get level_id before deleting
        $module->delete();

        return redirect()->route('admin.modules.index', ['level' => $levelId])
            ->with('success', 'toasts.module_deleted_successfully');
    }
}