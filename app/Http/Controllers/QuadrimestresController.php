<?php

namespace App\Http\Controllers;

use App\Models\AnneeUni;
use App\Models\Quadrimestre;
use App\Models\Seson;
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
        }

        $quadrimestres = $quadrimestresQuery
            ->when($request->input('search'), function ($query, $search) {
                $query->where('code', 'like', "%{$search}%")
                      ->orWhereHas('seson.anneeUni', fn($q) => $q->where('annee', 'like', "%{$search}%"))
                      ->orWhereHas('seson', fn($q) => $q->where('code', 'like', "%{$search}%"));
            })
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

        $sesons = Seson::with('anneeUni')
            ->join('annee_unis', 'sesons.annee_uni_id', '=', 'annee_unis.id')
            ->orderBy('annee_unis.annee', 'desc')
            ->orderBy('sesons.code', 'asc')
            ->select('sesons.*')
            ->get()
            ->map(function ($seson) {
                return [
                    'id' => $seson->id,
                    'display_name' => $seson->anneeUni->annee . ' - ' . $seson->code,
                ];
            });

        return Inertia::render($this->baseInertiaPath() . 'Index', [
            'quadrimestres' => $quadrimestres,
            'filters' => $request->only(['search']),
            'sesons' => $sesons,
        ]);
    }

    // The create and edit methods are now obsolete and can be removed,
    // as the data is provided by the index method.

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50',
            'seson_id' => 'required|exists:sesons,id',
        ]);

        // --- NEW LOGIC ---
        // Find the academic year of the session being assigned.
        $seson = Seson::find($validated['seson_id']);
        if ($seson) {
            // Update the session to switch the user's view.
            session(['selected_annee_uni_id' => $seson->annee_uni_id]);
        }
        // --- END NEW LOGIC ---

        Quadrimestre::create($validated);

        return redirect()->route('admin.quadrimestres.index')
            ->with('success', 'toasts.quadrimestre_created_successfully');
    }

    public function update(Request $request, Quadrimestre $quadrimestre)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50',
            'seson_id' => 'required|exists:sesons,id',
        ]);

        // --- NEW LOGIC (also needed for update) ---
        $seson = Seson::find($validated['seson_id']);
        if ($seson) {
            session(['selected_annee_uni_id' => $seson->annee_uni_id]);
        }
        // --- END NEW LOGIC ---

        $quadrimestre->update($validated);

        return redirect()->route('admin.quadrimestres.index')
            ->with('success', 'toasts.quadrimestre_updated_successfully');
    }

    public function destroy(Quadrimestre $quadrimestre)
    {
        if ($quadrimestre->examens()->exists()) {
            return redirect()->route('admin.quadrimestres.index')
                ->with('error', 'toasts.quadrimestre_in_use_cannot_delete');
        }

        $quadrimestre->delete();

        return redirect()->route('admin.quadrimestres.index')
            ->with('success', 'toasts.quadrimestre_deleted_successfully');
    }
}
