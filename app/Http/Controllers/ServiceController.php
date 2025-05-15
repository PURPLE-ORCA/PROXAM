<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;
use Inertia\Inertia;
// use Illuminate\Support\Facades\Gate; // Only if you use Gate::authorize explicitly

class ServiceController extends Controller
{
    protected function baseInertiaPath(): string
    {
        return 'Admin/Services/';
    }

    public function index(Request $request)
    {
         // Gate::authorize('is_admin'); // Already handled by route middleware, but can be explicit
        $services = Service::query()
            ->when($request->input('search'), fn ($query, $search) => $query->where('nom', 'like', "%{$search}%"))
            ->orderBy('nom')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render($this->baseInertiaPath() . 'Index', [
            'services' => $services,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Services/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255|unique:services,nom',
        ]);

        Service::create($validated);

        return redirect()->route('admin.services.index')
            ->with('success', 'toasts.service_created_successfully');
    }

    public function edit(Service $service)
    {
        return Inertia::render($this->baseInertiaPath() . 'Edit', [
            'service' => $service,
        ]);
    }

    public function update(Request $request, Service $service)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255|unique:services,nom,' . $service->id,
        ]);

        $service->update($validated);

        return redirect()->route('admin.services.index')
            ->with('success', 'toasts.service_updated_successfully');
    }

    public function destroy(Service $service)
    {
        if ($service->professeurs()->exists()) {
            return redirect()->route('admin.services.index')
                ->with('error', 'toasts.service_in_use_cannot_delete');
        }

        $service->delete();

        return redirect()->route('admin.services.index')
            ->with('success', 'toasts.service_deleted_successfully');
    }
}