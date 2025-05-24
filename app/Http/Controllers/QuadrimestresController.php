<?php

namespace App\Http\Controllers;

use App\Models\AnneeUni;
use App\Models\Quadrimestre;
use App\Models\Seson; // To fetch Sessions for the form
use Illuminate\Http\Request;
use Inertia\Inertia;

class QuadrimestresController extends Controller
{
    protected function baseInertiaPath(): string
    {
        return 'Admin/Quadrimestres/';
    }
    public function index(Request $request)
    {
        $latestAnneeUni = AnneeUni::orderBy('annee', 'desc')->first();
        $selectedAnneeUniId = session('selected_annee_uni_id', $latestAnneeUni?->id);

        $quadrimestresQuery = Quadrimestre::with(['seson.anneeUni']);

        if ($selectedAnneeUniId) {
            $quadrimestresQuery->whereHas('seson', function ($query) use ($selectedAnneeUniId) {
                $query->where('annee_uni_id', $selectedAnneeUniId);
            });
        } else {
            $quadrimestresQuery->whereRaw('1 = 0');
            // Log::warning('QuadrimestreController@index: No selected_annee_uni_id. Displaying no quadrimestres.');
        }

        $quadrimestres = $quadrimestresQuery
            ->when($request->input('search'), function ($query, $search) {
                $query->where('code', 'like', "%{$search}%")
                      ->orWhereHas('seson.anneeUni', fn($q) => $q->where('annee', 'like', "%{$search}%"))
                      ->orWhereHas('seson', fn($q) => $q->where('code', 'like', "%{$search}%"));
            })
            // Consider how to best order these multi-level relationships
            ->orderBy(Seson::select('annee_uni_id')
                ->join('annee_unis', 'annee_unis.id', '=', 'sesons.annee_uni_id')
                ->whereColumn('sesons.id', 'quadrimestres.seson_id')
                ->orderBy('annee_unis.annee', 'desc')
                ->limit(1), 'desc')
            ->orderBy(Seson::select('code')
                ->whereColumn('sesons.id', 'quadrimestres.seson_id')
                ->orderBy('code', 'asc')
                ->limit(1), 'asc')
            ->orderBy('code', 'asc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render($this->baseInertiaPath() . 'Index', [
            'quadrimestres' => $quadrimestres,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        // Fetch sessions with their academic years for a more informative dropdown
        $sesons = Seson::with('anneeUni')->orderByAnneeUniThenCode()->get()->map(function ($seson) {
            return [
                'id' => $seson->id,
                'display_name' => $seson->anneeUni->annee . ' - ' . $seson->code,
            ];
        });
        return Inertia::render($this->baseInertiaPath() . 'Create', [
            'sesons' => $sesons,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50',
            'seson_id' => 'required|exists:sesons,id',
            // Add unique constraint for code within the same seson_id if needed
        ]);

        Quadrimestre::create($validated);

        return redirect()->route('admin.quadrimestres.index')
            ->with('success', 'toasts.quadrimestre_created_successfully');
    }

    public function edit(Quadrimestre $quadrimestre)
    {
        $sesons = Seson::with('anneeUni')->orderByAnneeUniThenCode()->get()->map(function ($seson) {
            return [
                'id' => $seson->id,
                'display_name' => $seson->anneeUni->annee . ' - ' . $seson->code,
            ];
        });
        $quadrimestre->load(['seson', 'seson.anneeUni']);
        return Inertia::render($this->baseInertiaPath() . 'Edit', [
            'quadrimestre' => $quadrimestre,
            'sesons' => $sesons,
        ]);
    }

    public function update(Request $request, Quadrimestre $quadrimestre)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50',
            'seson_id' => 'required|exists:sesons,id',
            // Add unique constraint for code within the same seson_id if needed
        ]);

        $quadrimestre->update($validated);

        return redirect()->route('admin.quadrimestres.index')
            ->with('success', 'toasts.quadrimestre_updated_successfully');
    }

    public function destroy(Quadrimestre $quadrimestre)
    {
        // Check if the Quadrimestre is linked to any Examens
        if ($quadrimestre->examens()->exists()) {
            return redirect()->route('admin.quadrimestres.index')
                ->with('error', 'toasts.quadrimestre_in_use_cannot_delete');
        }

        $quadrimestre->delete();

        return redirect()->route('admin.quadrimestres.index')
            ->with('success', 'toasts.quadrimestre_deleted_successfully');
    }
}