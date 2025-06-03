<?php

namespace App\Http\Controllers; // Or App\Http\Controllers\Admin

use App\Models\Seson;
use App\Models\AnneeUni; // To fetch Academic Years for the form
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\ExamAssignmentService; 
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;

class SesonController extends Controller
{
    protected function baseInertiaPath(): string
    {
        return 'Admin/Sesons/';
    }

    public function index(Request $request)
    {
        $latestAnneeUni = AnneeUni::orderBy('annee', 'desc')->first();
        $selectedAnneeUniId = session('selected_annee_uni_id', $latestAnneeUni?->id);

        $sesonsQuery = Seson::with('anneeUni');

        if ($selectedAnneeUniId) {
            $sesonsQuery->where('annee_uni_id', $selectedAnneeUniId);
        } else {
            // If no academic year selected or exists, show no sessions
            $sesonsQuery->whereRaw('1 = 0');
            // Log::warning('SesonController@index: No selected_annee_uni_id. Displaying no sesons.');
        }

        $sesons = $sesonsQuery
            ->when($request->input('search'), function ($query, $search) {
                $query->where('code', 'like', "%{$search}%")
                      ->orWhereHas('anneeUni', fn($q) => $q->where('annee', 'like', "%{$search}%"));
            })
            ->orderBy(AnneeUni::select('annee')->whereColumn('annee_unis.id', 'sesons.annee_uni_id')->orderBy('annee', 'desc')->limit(1), 'desc') // Order by AnneeUni's annee
            ->orderBy('code', 'asc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render($this->baseInertiaPath() . 'Index', [
            'sesons' => $sesons,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        $anneesUniversitaires = AnneeUni::orderBy('annee', 'desc')->get(['id', 'annee']);
        return Inertia::render($this->baseInertiaPath() . 'Create', [
            'anneesUniversitaires' => $anneesUniversitaires,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50',
            'annee_uni_id' => 'required|exists:annee_unis,id',
            // Add unique constraint for code within the same annee_uni_id if needed
            // Rule::unique('sesons')->where(fn ($query) => $query->where('annee_uni_id', $request->annee_uni_id)),
        ]);

        Seson::create($validated);

        return redirect()->route('admin.sesons.index')
            ->with('success', 'toasts.seson_created_successfully');
    }

    public function edit(Seson $seson)
    {
        $anneesUniversitaires = AnneeUni::orderBy('annee', 'desc')->get(['id', 'annee']);
        $seson->load('anneeUni'); // Ensure anneeUni is loaded for the form
        return Inertia::render($this->baseInertiaPath() . 'Edit', [
            'seson' => $seson,
            'anneesUniversitaires' => $anneesUniversitaires,
        ]);
    }

    public function update(Request $request, Seson $seson)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50',
            'annee_uni_id' => 'required|exists:annee_unis,id',
            // Add unique constraint for code within the same annee_uni_id if needed
            // Rule::unique('sesons')->where(fn ($query) => $query->where('annee_uni_id', $request->annee_uni_id))->ignore($seson->id),
        ]);

        $seson->update($validated);

        return redirect()->route('admin.sesons.index')
            ->with('success', 'toasts.seson_updated_successfully');
    }

    public function destroy(Seson $seson)
    {
        // Check if the Seson is linked to any Quadrimestres
        if ($seson->quadrimestres()->exists()) {
            return redirect()->route('admin.sesons.index')
                ->with('error', 'toasts.seson_in_use_cannot_delete');
        }

        $seson->delete();

        return redirect()->route('admin.sesons.index')
            ->with('success', 'toasts.seson_deleted_successfully');
    }

    public function batchAssignExams(Seson $seson, ExamAssignmentService $assignmentService): RedirectResponse
    {
        // Optional: Add specific authorization if needed, though route middleware covers basic access.
        // Gate::authorize('batch-assign-exams-for-seson', $seson);

        Log::info("Controller: Triggering BATCH assignment for Seson ID: {$seson->id}");

        $result = $assignmentService->assignExamsForSeson($seson);

        Log::info("Controller: BATCH Assignment service result for Seson ID {$seson->id}: ", $result);

        $flashMessage = $result['final_summary_message'] ?? 'Batch assignment process completed.';
        $flashType = 'success'; // Default

        if (!empty($result['exams_with_errors'])) {
            $flashType = 'error';
            // You might want to append a note about errors to the summary message
            // or rely on the user checking the logs/a future report.
        } elseif (!empty($result['exams_with_warnings'])) {
            // If you have a 'warning' toast type, use it. Otherwise, prepend "Notice:"
            $flashType = 'success'; // Or 'warning' if your toast system supports it
            $flashMessage = "Notice: " . $flashMessage;
        }

        return redirect()->route('admin.sesons.index', ['anneeUni' => $seson->annee_uni_id]) // Redirect back to sessions list for that year
            ->with($flashType, $flashMessage);
    }
}