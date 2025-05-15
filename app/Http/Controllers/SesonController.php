<?php

namespace App\Http\Controllers; // Or App\Http\Controllers\Admin

use App\Models\Seson;
use App\Models\AnneeUni; // To fetch Academic Years for the form
use Illuminate\Http\Request;
use Inertia\Inertia;

class SesonController extends Controller
{
    protected function baseInertiaPath(): string
    {
        return 'Admin/Sesons/';
    }

    public function index(Request $request)
    {
        $sesons = Seson::with('anneeUni') // Eager load the related academic year
            ->when($request->input('search'), function ($query, $search) {
                $query->where('code', 'like', "%{$search}%")
                      ->orWhereHas('anneeUni', function ($q) use ($search) {
                          $q->where('annee', 'like', "%{$search}%");
                      });
            })
            ->orderByDesc( // Order by academic year desc, then session code asc
                AnneeUni::select('annee')
                    ->whereColumn('annee_unis.id', 'sesons.annee_uni_id')
                    ->orderBy('annee', 'desc')
                    ->limit(1)
            )
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
}