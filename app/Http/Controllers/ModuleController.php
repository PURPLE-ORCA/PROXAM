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
        $level->load(['modules', 'filiere']); // Eager load relations

        // --- ADD THIS DATA FOR THE MODAL ---
        $filieres = Filiere::orderBy('nom')->get(['id', 'nom']);
        $allLevels = Level::orderBy('nom')->get(['id', 'nom', 'filiere_id']);
        $allDistinctModuleNames = Module::select('nom')->distinct()->orderBy('nom')->pluck('nom')->all();
        // ------------------------------------

        return Inertia::render($this->baseInertiaPath() . 'LevelModulesIndex', [
            'level' => $level,
            'modules' => $level->modules,
            'filiere' => $level->filiere,
            // Pass the new data for the modal form
            'filieresForForm' => $filieres,
            'allLevelsForForm' => $allLevels,
            'allDistinctModuleNamesForForm' => $allDistinctModuleNames,
        ]);
    }

    public function getDefaultExamConfig(Module $module)
    {
        $module->load('examRoomConfigs.salle');
        return response()->json([
            // This now uses the accessor on the Module model
            'default_total_required_professors' => $module->default_total_required_professors,
            'room_configs' => $module->examRoomConfigs->map(function ($config) {
                return [
                    'salle_id' => $config->salle_id,
                    'salle_nom' => $config->salle->nom,
                    'default_capacite' => $config->salle->default_capacite,
                    'configured_capacity' => $config->configured_capacity,
                    'configured_prof_count' => $config->configured_prof_count,
                ];
            }),
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
