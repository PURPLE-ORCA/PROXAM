<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\Salle;
use App\Models\ModuleExamRoomConfig;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ModuleExamRoomConfigController extends Controller
{
    protected function baseInertiaPath(): string
    {
        return 'Admin/Modules/ExamConfigs/'; // New view path
    }

    /**
     * Display the exam room configurations for a specific module.
     */
    public function index(Module $module)
    {
        $module->load(['examRoomConfigs.salle', 'level.filiere']); // Eager load for display

        $configuredSalleIds = $module->examRoomConfigs->pluck('salle_id')->toArray();
        $availableSalles = Salle::whereNotIn('id', $configuredSalleIds)
                                ->orderBy('nom')
                                ->get(['id', 'nom', 'default_capacite']);

        return Inertia::render($this->baseInertiaPath() . 'Index', [
            'module' => $module,
            'currentConfigs' => $module->examRoomConfigs,
            'availableSalles' => $availableSalles, // For the "Add Room" form
        ]);
    }

    /**
     * Store a new room configuration for a module.
     */
    public function store(Request $request, Module $module)
    {
        $validated = $request->validate([
            'salle_id' => [
                'required',
                'exists:salles,id',
                Rule::unique('module_exam_room_configs')->where(function ($query) use ($module) {
                    return $query->where('module_id', $module->id);
                }), // Ensure salle is not already configured for this module
            ],
            'configured_capacity' => 'required|integer|min:1',
            'configured_prof_count' => 'required|integer|min:1',
        ]);

        $module->examRoomConfigs()->create($validated);

        return back()->with('success', 'toasts.module_exam_config_added');
    }

    /**
     * Update an existing room configuration.
     * (We might not have a dedicated edit form, edits might be inline or part of delete/re-add)
     * This method assumes you pass all fields to update a specific config.
     */
    public function update(Request $request, ModuleExamRoomConfig $config) // $config is the ModuleExamRoomConfig instance
    {
        $validated = $request->validate([
            // salle_id typically isn't changed on update, one would delete and re-add with new salle
            'configured_capacity' => 'required|integer|min:1',
            'configured_prof_count' => 'required|integer|min:1',
        ]);

        $config->update($validated);

        return back()->with('success', 'toasts.module_exam_config_updated');
    }

    /**
     * Remove a room configuration from a module.
     */
    public function destroy(ModuleExamRoomConfig $config)
    {
        $config->delete();
        return back()->with('success', 'toasts.module_exam_config_removed');
    }
}