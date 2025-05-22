<?php

namespace App\Http\Controllers;

use App\Models\Examen;
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
        // Fetch Quadrimestres with their Seson and AnneeUni for better display
        $quadrimestres = Quadrimestre::with(['seson.anneeUni'])
            ->get()
            ->map(function ($q) {
                return [
                    'id' => $q->id,
                    'display_name' => $q->seson->anneeUni->annee . ' - ' . $q->seson->code . ' - ' . $q->code,
                ];
            })
            ->sortBy('display_name') // Sort after mapping
            ->values(); // Re-index array

        $modules = Module::orderBy('nom')->get(['id', 'nom']);
        $salles = Salle::orderBy('nom')->get(['id', 'nom', 'default_capacite']);

        // Assuming enums are defined in the Examen model or a config
        $types = Examen::getTypes();     // e.g., ['QCM' => 'QCM', 'theoreique' => 'Théorique']
        $filieres = Examen::getFilieres(); // e.g., ['Medicale' => 'Médicale', 'Pharmacie' => 'Pharmacie']

        return compact('quadrimestres', 'modules', 'salles', 'types', 'filieres');
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
            // Add more sophisticated ordering if needed
            ->orderBy('debut', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render($this->baseInertiaPath() . 'Index', [
            'examens' => $examens,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render($this->baseInertiaPath() . 'Create', $this->getFormData());
    }

    public function store(Request $request)
    {
        // Define allowed enum values from model or config
        $allowedTypes = array_keys(Examen::getTypes());
        $allowedFilieres = array_keys(Examen::getFilieres());

        $validated = $request->validate([
            'nom' => 'nullable|string|max:255',
            'quadrimestre_id' => 'required|exists:quadrimestres,id',
            'module_id' => 'required|exists:modules,id',
            'type' => ['required', Rule::in($allowedTypes)],
            'filiere' => ['required', Rule::in($allowedFilieres)],
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
                'filiere' => $validated['filiere'],
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
        $allowedFilieres = array_keys(Examen::getFilieres());

        $validated = $request->validate([
            'nom' => 'nullable|string|max:255',
            'quadrimestre_id' => 'required|exists:quadrimestres,id',
            'module_id' => 'required|exists:modules,id',
            'type' => ['required', Rule::in($allowedTypes)],
            'filiere' => ['required', Rule::in($allowedFilieres)],
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
                'filiere' => $validated['filiere'],
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