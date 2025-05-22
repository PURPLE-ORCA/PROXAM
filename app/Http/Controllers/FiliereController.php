<?php

namespace App\Http\Controllers; // In Admin subfolder

use App\Http\Controllers\Controller;
use App\Models\Filiere;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class FiliereController extends Controller
{
    protected function baseInertiaPath(): string
    {
        return 'Admin/Filieres/';
    }

    /**
     * Display a listing of the resource (card view).
     */
    public function index()
    {
        // Gate::authorize('viewAny', Filiere::class); or 'can:is_admin_or_rh' on route
        $filieres = Filiere::orderBy('nom')->get(); // Get all for card display
                                                 // Add pagination if list can be very long

        return Inertia::render($this->baseInertiaPath() . 'Index', [
            'filieres' => $filieres,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Gate::authorize('create', Filiere::class);
        return Inertia::render($this->baseInertiaPath() . 'Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Gate::authorize('create', Filiere::class);
        $validated = $request->validate([
            'nom' => 'required|string|max:255|unique:filieres,nom',
        ]);

        Filiere::create($validated);

        return redirect()->route('admin.filieres.index')
            ->with('success', 'toasts.filiere_created_successfully');
    }

    // 'show' method is typically not used if 'except(['show'])' is on resource route

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Filiere $filiere)
    {
        // Gate::authorize('update', $filiere);
        return Inertia::render($this->baseInertiaPath() . 'Edit', [
            'filiereToEdit' => $filiere, // Pass as 'filiereToEdit'
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Filiere $filiere)
    {
        // Gate::authorize('update', $filiere);
        $validated = $request->validate([
            'nom' => ['required', 'string', 'max:255', Rule::unique('filieres')->ignore($filiere->id)],
        ]);

        $filiere->update($validated);

        return redirect()->route('admin.filieres.index')
            ->with('success', 'toasts.filiere_updated_successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Filiere $filiere)
    {
        // Gate::authorize('delete', $filiere);
        if ($filiere->levels()->exists()) {
            return redirect()->route('admin.filieres.index')
                ->with('error', 'toasts.filiere_in_use_cannot_delete');
        }

        $filiere->delete();

        return redirect()->route('admin.filieres.index')
            ->with('success', 'toasts.filiere_deleted_successfully');
    }
}