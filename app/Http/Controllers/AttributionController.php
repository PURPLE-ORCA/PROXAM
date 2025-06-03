<?php

namespace App\Http\Controllers;

use App\Models\AnneeUni;
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
        $latestAnneeUni = AnneeUni::orderBy('annee', 'desc')->first();
        $selectedAnneeUniId = session('selected_annee_uni_id', $latestAnneeUni?->id);

        $attributionsQuery = Attribution::with([
            'examen.module.level.filiere',
            'examen.quadrimestre.seson.anneeUni',
            'professeur.user',
            'professeur.service'
        ]);

        if ($selectedAnneeUniId) {
            $attributionsQuery->whereHas('examen.quadrimestre.seson', function ($query) use ($selectedAnneeUniId) {
                $query->where('annee_uni_id', $selectedAnneeUniId);
            });
        } else {
            $attributionsQuery->whereRaw('1 = 0');
            // Log::warning('AttributionController@index: No selected_annee_uni_id. Displaying no attributions.');
        }

        // Apply other filters
        $attributionsQuery
            ->when($request->input('search_examen'), function ($query, $search) { /* ... */ })
            ->when($request->input('search_professeur'), function ($query, $search) { /* ... */ });
            // seson_id filter was here, now academic year is the primary filter

        $attributions = $attributionsQuery
            ->orderByDesc(Examen::select('debut')->whereColumn('examens.id', 'attributions.examen_id')->limit(1))
            ->orderBy(Professeur::select('nom')->whereColumn('professeurs.id', 'attributions.professeur_id')->limit(1))
            ->paginate(20)
            ->withQueryString();

        // Data for filters - now AnneeUni is primary, Sesons might be a secondary filter
        $sesonsForFilter = [];
        if ($selectedAnneeUniId) {
             $sesonsForFilter = Seson::where('annee_uni_id', $selectedAnneeUniId)
                                    ->orderBy('code')->get(['id', 'code'])
                                    ->map(fn($s) => ['id' => $s->id, 'display_name' => $s->code]); // Simpler display for filter
        }


        return Inertia::render('Admin/Attributions/Index', [
            'attributions' => $attributions,
            'filters' => $request->only(['search_examen', 'search_professeur', 'seson_id']), // Keep seson_id if you want to filter by session *within* an annee_uni
            'sesonsForFilter' => $sesonsForFilter,
        ]);
    }

}