<?php

namespace App\Http\Controllers;

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
        $quadrimestres = Quadrimestre::with(['seson', 'seson.anneeUni']) // Eager load relations
            ->when($request->input('search'), function ($query, $search) {
                $query->where('code', 'like', "%{$search}%")
                      ->orWhereHas('seson', function ($q) use ($search) {
                          $q->where('code', 'like', "%{$search}%")
                            ->orWhereHas('anneeUni', function ($qq) use ($search) {
                                $qq->where('annee', 'like', "%{$search}%");
                            });
                      });
            })
            // Consider a more robust multi-level ordering if needed
            ->orderBy(Seson::select('annee_uni_id') // Subquery for annee_uni_id from sesons
                ->join('annee_unis', 'annee_unis.id', '=', 'sesons.annee_uni_id')
                ->whereColumn('sesons.id', 'quadrimestres.seson_id')
                ->orderBy('annee_unis.annee', 'desc')
                ->limit(1), 'desc')
            ->orderBy(Seson::select('code') // Subquery for seson code
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