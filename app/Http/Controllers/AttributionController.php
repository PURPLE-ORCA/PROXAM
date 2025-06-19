<?php

namespace App\Http\Controllers;

use App\Models\AnneeUni;
use App\Models\Attribution;
use App\Models\Examen;
use App\Models\Professeur;
use App\Models\Seson;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AttributionController extends Controller
{
    public function index(Request $request)
    {
        $latestAnneeUni = AnneeUni::orderBy('annee', 'desc')->first();
        $selectedAnneeUniId = session('selected_annee_uni_id', $latestAnneeUni?->id);

        $attributionsQuery = Attribution::with([
            'examen.module',
            'professeur.service'
        ]);

        if ($selectedAnneeUniId) {
            $attributionsQuery->whereHas('examen.quadrimestre.seson', function ($query) use ($selectedAnneeUniId) {
                $query->where('annee_uni_id', $selectedAnneeUniId);
            });
        } else {
            $attributionsQuery->whereRaw('1 = 0');
        }
        
        // --- UPGRADED FILTERING LOGIC ---
        // Global search for Exam/Module
        $attributionsQuery->when($request->input('search'), function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('examen', fn($subQ) => $subQ->where('nom', 'like', "%{$search}%"))
                  ->orWhereHas('examen.module', fn($subQ) => $subQ->where('nom', 'like', "%{$search}%"));
            });
        });

        // Specific search for Professor
        $attributionsQuery->when($request->input('prof_search'), function ($query, $search) {
            $query->whereHas('professeur', function ($q) use ($search) {
                $q->where('nom', 'like', "%{$search}%")
                  ->orWhere('prenom', 'like', "%{$search}%");
            });
        });

        // Specific search for Service
        $attributionsQuery->when($request->input('service_search'), function ($query, $search) {
            $query->whereHas('professeur.service', function ($q) use ($search) {
                $q->where('nom', 'like', "%{$search}%");
            });
        });
        // --- END UPGRADED FILTERING ---

        // The existing sorting logic is perfect for grouping and should remain.
        $attributions = $attributionsQuery
            ->orderBy(Examen::select('debut')->whereColumn('examens.id', 'attributions.examen_id'), 'desc')
            ->orderBy('examen_id', 'desc')
            ->orderBy('is_responsable', 'desc') 
            ->orderBy(Professeur::select('nom')->whereColumn('professeurs.id', 'attributions.professeur_id'), 'asc')
            ->paginate(40)
            ->withQueryString();

        return Inertia::render('Admin/Attributions/Index', [
            'attributions' => $attributions,
            // Pass all possible filters back to the frontend
            'filters' => $request->only(['search', 'prof_search', 'service_search']),
        ]);
    }
}
