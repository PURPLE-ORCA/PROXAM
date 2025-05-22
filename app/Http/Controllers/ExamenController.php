<?php

namespace App\Http\Controllers;

use App\Models\Examen;
use App\Models\Filiere;
use App\Models\Level;
use App\Models\Quadrimestre;
use App\Models\Module;
use App\Models\Salle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use App\Services\ExamAssignmentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;

class ExamenController extends Controller
{
    protected function baseInertiaPath(): string
    {
        return 'Admin/Examens/';
    }

    private function getFormData()
    {
        // Test this part first
        $quadrimestres = Quadrimestre::with(['seson.anneeUni'])->get();
        // dd($quadrimestres->first()?->seson?->anneeUni?->annee); // Check if relations are loading
        $quadrimestres = $quadrimestres->map(function ($q) {
            return [
                'id' => $q->id,
                'display_name' => ($q->seson && $q->seson->anneeUni ? $q->seson->anneeUni->annee : 'ERR_ANNEE') .
                                  ' - ' . ($q->seson ? $q->seson->code : 'ERR_SESON') .
                                  ' - ' . ($q->code ?? 'ERR_QUAD'),
            ];
        })->sortBy('display_name')->values();
        // dd('Quadrimestres loaded and mapped');
    
        $filieres = Filiere::orderBy('nom')->get(['id', 'nom']);
        // dd('Filieres loaded');
    
        $allLevels = Level::with('filiere:id,nom')->orderBy('filiere_id')->orderBy('nom')->get(['id', 'nom', 'filiere_id']);
        // dd('Levels loaded');
        
        $allModules = Module::with('level.filiere')->orderBy('level_id')->orderBy('nom')->get(['id', 'nom', 'level_id']);
        // dd('Modules loaded');
    
        $salles = Salle::orderBy('nom')->get(['id', 'nom', 'default_capacite']);
        // dd('Salles loaded');
        
        $types = Examen::getTypes();
        // dd('Types loaded');
    
        return compact('quadrimestres', 'filieres', 'allLevels', 'allModules', 'salles', 'types');
    }

    public function index(Request $request)
    {
        $examens = Examen::with(['quadrimestre.seson.anneeUni', 'module'])
            ->withCount('attributions')
            ->when($request->input('search'), function ($query, $search) {
                $query->where('nom', 'like', "%{$search}%")
                      ->orWhereHas('module', fn($q) => $q->where('nom', 'like', "%{$search}%"))
                      ->orWhereHas('quadrimestre.seson.anneeUni', fn($q) => $q->where('annee', 'like', "%{$search}%"));
            })

            ->orderBy('debut', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render($this->baseInertiaPath() . 'Index', [
            'examens' => $examens,
            'filters' => $request->only(['search']),
        ]);
    }

// In ExamenController@create
    public function create()
    {
        $formData = $this->getFormData();
        // dd($formData); // Last check here to see the full structure before Inertia render

        return Inertia::render($this->baseInertiaPath() . 'Create', [
            'quadrimestres' => $formData['quadrimestres']->toArray(), // Explicitly toArray()
            'filieres' => $formData['filieres']->toArray(),
            'allLevels' => $formData['allLevels']->toArray(),
            'allModules' => $formData['allModules']->toArray(),
            'salles' => $formData['salles']->toArray(),
            'types' => $formData['types'], // This is already an array from Examen::getTypes()
        ]);
    }

    public function store(Request $request)
    {
        // Define allowed enum values from model or config
        $allowedTypes = array_keys(Examen::getTypes());

        $validated = $request->validate([
            'nom' => 'nullable|string|max:255',
            'quadrimestre_id' => 'required|exists:quadrimestres,id',
            'module_id' => 'required|exists:modules,id',
            'type' => ['required', Rule::in($allowedTypes)],
            'debut' => 'required|date|after_or_equal:today',
            'required_professors' => 'required|integer|min:1',
            'salles_pivot' => 'required|array|min:1', // Array of {salle_id, capacite}
            'salles_pivot.*.salle_id' => 'required|exists:salles,id',
            'salles_pivot.*.capacite' => 'required|integer|min:0', // 0 might mean use default
        ]);

        return DB::transaction(function () use ($validated) {
            $examen = Examen::create([
                'nom' => $validated['nom'],
                'quadrimestre_id' => $validated['quadrimestre_id'],
                'module_id' => $validated['module_id'],
                'type' => $validated['type'],
                'debut' => $validated['debut'],
                'required_professors' => $validated['required_professors'],
            ]);

            // Sync salles with pivot data
            $sallesToSync = [];
            foreach ($validated['salles_pivot'] as $salleData) {
                $sallesToSync[$salleData['salle_id']] = ['capacite' => $salleData['capacite']];
            }
            $examen->salles()->sync($sallesToSync);

            return redirect()->route('admin.examens.index')
                ->with('success', 'toasts.examen_created_successfully');
        });
    }

    public function edit(Examen $examen)
    {
        $examen->load(['quadrimestre.seson.anneeUni', 'module', 'salles']); // Eager load relations
        $formData = array_merge($this->getFormData(), ['examenToEdit' => $examen]);
        return Inertia::render($this->baseInertiaPath() . 'Edit', $formData);
    }

    public function update(Request $request, Examen $examen)
    {
        $allowedTypes = array_keys(Examen::getTypes());

        $validated = $request->validate([
            'nom' => 'nullable|string|max:255',
            'quadrimestre_id' => 'required|exists:quadrimestres,id',
            'module_id' => 'required|exists:modules,id',
            'type' => ['required', Rule::in($allowedTypes)],
            'debut' => 'required|date',
            'required_professors' => 'required|integer|min:1',
            'salles_pivot' => 'required|array|min:1',
            'salles_pivot.*.salle_id' => 'required|exists:salles,id',
            'salles_pivot.*.capacite' => 'required|integer|min:0',
        ]);

        return DB::transaction(function () use ($examen, $validated) {
            $examen->update([
                'nom' => $validated['nom'],
                'quadrimestre_id' => $validated['quadrimestre_id'],
                'module_id' => $validated['module_id'],
                'type' => $validated['type'],
                'debut' => $validated['debut'],
                'required_professors' => $validated['required_professors'],
            ]);

            $sallesToSync = [];
            foreach ($validated['salles_pivot'] as $salleData) {
                $sallesToSync[$salleData['salle_id']] = ['capacite' => $salleData['capacite']];
            }
            $examen->salles()->sync($sallesToSync);

            return redirect()->route('admin.examens.index')
                ->with('success', 'toasts.examen_updated_successfully');
        });
    }

    public function destroy(Examen $examen)
    {
        if ($examen->attributions()->exists()) {
            return redirect()->route('admin.examens.index')
                ->with('error', 'toasts.examen_in_use_cannot_delete');
        }

        DB::transaction(function () use ($examen) {
            $examen->salles()->detach(); // Detach from salles pivot
            $examen->delete();
        });

        return redirect()->route('admin.examens.index')
            ->with('success', 'toasts.examen_deleted_successfully');
    }

    /**
     * Trigger the assignment process for a specific exam.
     */
    public function triggerAssignment(Examen $examen, ExamAssignmentService $assignmentService): RedirectResponse
    {
        // Gate::authorize('assign-professors', $examen); // Optional: more granular policy if needed

        Log::info("Controller: Triggering assignment for Exam ID: {$examen->id}");

        $result = $assignmentService->assignProfessorsToExam($examen);

        Log::info("Controller: Assignment service result for Exam ID {$examen->id}: ", $result);

        // Prepare flash message based on the service result
        if ($result['success'] && empty($result['errors']) && empty($result['warnings'])) {
            $flash = ['success' => $result['message'] ?? 'toasts.examen_assignment_triggered_successfully'];
        } elseif ($result['success'] && (!empty($result['errors']) || !empty($result['warnings']))) {
            $warningMessage = $result['message'] ?? 'Assignment completed with issues.';
            if (!empty($result['errors'])) $warningMessage .= " Errors: " . implode('; ', $result['errors']);
            if (!empty($result['warnings'])) $warningMessage .= " Warnings: " . implode('; ', $result['warnings']);
            // For now, use 'success' toast type for warnings until SonnerToastProvider is enhanced
            $flash = ['success' => "Notice: " . $warningMessage]; // Or use a 'warning' key if Sonner supports it
        } else { // Not successful or major errors
            $errorMessage = $result['message'] ?? 'Assignment process failed.';
            if(!empty($result['errors'])) $errorMessage .= " Details: " . implode('; ', $result['errors']);
            $flash = ['error' => $errorMessage];
        }

        return redirect()->route('admin.examens.index')->with($flash);
    }
}