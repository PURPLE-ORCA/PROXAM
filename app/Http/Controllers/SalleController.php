<?php

namespace App\Http\Controllers; // Or App\Http\Controllers\Admin

use App\Models\Salle;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SalleController extends Controller
{
    protected function baseInertiaPath(): string
    {
        return 'Admin/Salles/';
    }

    public function index(Request $request)
    {
        $salles = Salle::query()
            ->when($request->input('search'), fn ($query, $search) => $query->where('nom', 'like', "%{$search}%"))
            ->orderBy('nom')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render($this->baseInertiaPath() . 'Index', [
            'salles' => $salles,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render($this->baseInertiaPath() . 'Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255|unique:salles,nom',
            'default_capacite' => 'required|integer|min:1',
        ]);

        Salle::create($validated);

        return redirect()->route('admin.salles.index')
            ->with('success', 'toasts.salle_created_successfully');
    }

    public function edit(Salle $salle)
    {
        return Inertia::render($this->baseInertiaPath() . 'Edit', [
            'salle' => $salle,
        ]);
    }

    public function update(Request $request, Salle $salle)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255|unique:salles,nom,' . $salle->id,
            'default_capacite' => 'required|integer|min:1',
        ]);

        $salle->update($validated);

        return redirect()->route('admin.salles.index')
            ->with('success', 'toasts.salle_updated_successfully');
    }

    public function destroy(Salle $salle)
    {
        // Check if the salle is linked to any exams
        if ($salle->examens()->exists()) {
            return redirect()->route('admin.salles.index')
                ->with('error', 'toasts.salle_in_use_cannot_delete');
        }

        $salle->delete();

        return redirect()->route('admin.salles.index')
            ->with('success', 'toasts.salle_deleted_successfully');
    }
}