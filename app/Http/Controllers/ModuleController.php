<?php

namespace App\Http\Controllers; 

use App\Models\Module;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ModuleController extends Controller
{
    protected function baseInertiaPath(): string
    {
        return 'Admin/Modules/';
    }

    public function index(Request $request)
    {
        $modules = Module::query()
            ->when($request->input('search'), fn ($query, $search) => $query->where('nom', 'like', "%{$search}%"))
            ->orderBy('nom')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render($this->baseInertiaPath() . 'Index', [
            'modules' => $modules,
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
            'nom' => 'required|string|max:255|unique:modules,nom',
        ]);

        Module::create($validated);

        return redirect()->route('admin.modules.index')
            ->with('success', 'toasts.module_created_successfully');
    }

    public function edit(Module $module)
    {
        return Inertia::render($this->baseInertiaPath() . 'Edit', [
            'module' => $module,
        ]);
    }

    public function update(Request $request, Module $module)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255|unique:modules,nom,' . $module->id,
        ]);

        $module->update($validated);

        return redirect()->route('admin.modules.index')
            ->with('success', 'toasts.module_updated_successfully');
    }

    public function destroy(Module $module)
    {
        // Check if the module is linked to professors or exams
        if ($module->professeurs()->exists() || $module->examens()->exists()) {
            return redirect()->route('admin.modules.index')
                ->with('error', 'toasts.module_in_use_cannot_delete');
        }

        $module->delete();

        return redirect()->route('admin.modules.index')
            ->with('success', 'toasts.module_deleted_successfully');
    }
}