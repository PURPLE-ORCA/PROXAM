<?php

namespace App\Http\Controllers; // Or App\Http\Controllers\Admin

use App\Models\AnneeUni;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AnneeUniController extends Controller
{
    protected function baseInertiaPath(): string
    {
        // Using a consistent naming convention for Inertia views
        return 'Admin/AnneesUniversitaires/';
    }

    public function index(Request $request)
    {
        $anneesUniversitaires = AnneeUni::query()
            ->when($request->input('search'), fn ($query, $search) => $query->where('annee', 'like', "%{$search}%"))
            ->orderBy('annee', 'desc') // Often makes sense to show newest first
            ->paginate(15)
            ->withQueryString();

        return Inertia::render($this->baseInertiaPath() . 'Index', [
            'anneesUniversitaires' => $anneesUniversitaires, // Pass with a clear name
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
            'annee' => 'required|string|max:20|unique:annee_unis,annee|regex:/^\d{4}-\d{4}$/',
            // Example regex for YYYY-YYYY format, adjust if your format is different
        ]);

        AnneeUni::create($validated);

        return redirect()->route('admin.annees-universitaires.index') // Use the named route
            ->with('success', 'toasts.annee_uni_created_successfully');
    }

    // Note the type-hinted variable name $anneeUni matches the ->parameters() mapping
    public function edit(AnneeUni $anneeUni)
    {
        return Inertia::render($this->baseInertiaPath() . 'Edit', [
            'anneeUni' => $anneeUni,
        ]);
    }

    public function update(Request $request, AnneeUni $anneeUni)
    {
        $validated = $request->validate([
            'annee' => 'required|string|max:20|unique:annee_unis,annee,' . $anneeUni->id . '|regex:/^\d{4}-\d{4}$/',
        ]);

        $anneeUni->update($validated);

        return redirect()->route('admin.annees-universitaires.index')
            ->with('success', 'toasts.annee_uni_updated_successfully');
    }

    public function destroy(AnneeUni $anneeUni)
    {
        // Check if the AnneeUni is linked to any Sesons (academic sessions)
        if ($anneeUni->sesons()->exists()) {
            return redirect()->route('admin.annees-universitaires.index')
                ->with('error', 'toasts.annee_uni_in_use_cannot_delete');
        }

        $anneeUni->delete();

        return redirect()->route('admin.annees-universitaires.index')
            ->with('success', 'toasts.annee_uni_deleted_successfully');
    }
}