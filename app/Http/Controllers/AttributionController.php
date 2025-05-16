<?php

namespace App\Http\Controllers;

use App\Models\Attribution;
use App\Models\Examen;
use App\Models\Professeur;
use App\Models\Seson; // For filtering
use Illuminate\Http\Request;
use Inertia\Inertia;

class AttributionController extends Controller
{
    public function index(Request $request)
    {
        // Admin/RH can see all attributions
        // Gate::authorize('viewAny', Attribution::class); // Or use 'is_admin_or_rh' gate

        $attributions = Attribution::with([
                'examen.module',
                'examen.quadrimestre.seson.anneeUni',
                'professeur.user',
                'professeur.service'
            ])
            ->when($request->input('search_examen'), function ($query, $search) {
                $query->whereHas('examen', fn($q) => $q->where('nom', 'like', "%{$search}%")
                    ->orWhereHas('module', fn($qm) => $qm->where('nom', 'like', "%{$search}%")));
            })
            ->when($request->input('search_professeur'), function ($query, $search) {
                $query->whereHas('professeur', fn($q) => $q->where('nom', 'like', "%{$search}%")
                    ->orWhere('prenom', 'like', "%{$search}%")
                    ->orWhereHas('user', fn($qu) => $qu->where('email', 'like', "%{$search}%")));
            })
            ->when($request->input('seson_id'), function ($query, $sesonId) {
                $query->whereHas('examen.quadrimestre', fn($q) => $q->where('seson_id', $sesonId));
            })
            ->orderByDesc(Examen::select('debut') // Order by exam start date
                ->whereColumn('examens.id', 'attributions.examen_id')
                ->limit(1)
            )
            ->orderBy(Professeur::select('nom') // Then by professor name
                ->whereColumn('professeurs.id', 'attributions.professeur_id')
                ->limit(1)
            )
            ->paginate(20) // Or your preferred page size
            ->withQueryString();

        // Data for filters
        $sesonsForFilter = Seson::with('anneeUni')->get()->map(fn($s) => [
            'id' => $s->id,
            'display_name' => "{$s->anneeUni->annee} - {$s->code}"
        ])->sortBy('display_name')->values();

        return Inertia::render('Admin/Attributions/Index', [
            'attributions' => $attributions,
            'filters' => $request->only(['search_examen', 'search_professeur', 'seson_id']),
            'sesonsForFilter' => $sesonsForFilter,
        ]);
    }

    // Other CRUD methods (create, store, edit, update, destroy) for Attributions
    // might be very limited for admins. Usually, attributions are created by the engine
    // or through a specific "manual override" interface on an Exam's detail page.
    // For now, we focus on `index`.
}