<?php

namespace App\Http\Controllers;

use App\Exports\AttributionsExport;
use App\Models\AnneeUni;
use App\Models\Attribution;
use App\Models\Examen;
use App\Models\Professeur;
use App\Models\Seson;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

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

        $attributionsQuery->when($request->input('service_search'), function ($query, $search) {
            $query->whereHas('professeur.service', function ($q) use ($search) {
                $q->where('nom', 'like', "%{$search}%");
            });
        });

        $attributionsQuery->when($request->input('in_conflict') === 'true', function ($q) {
            $q->where('attributions.is_in_conflict', true);
        });

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

    public function export(Request $request)
    {
        // --- This is the same query logic from your index() method ---
        $latestAnneeUni = AnneeUni::orderBy('annee', 'desc')->first();
        $selectedAnneeUniId = session('selected_annee_uni_id', $latestAnneeUni?->id);

        $attributionsQuery = Attribution::with(['examen.module', 'professeur.service', 'salle']);

        if ($selectedAnneeUniId) {
            $attributionsQuery->whereHas('examen.quadrimestre.seson', function ($query) use ($selectedAnneeUniId) {
                $query->where('annee_uni_id', $selectedAnneeUniId);
            });
        } else {
            $attributionsQuery->whereRaw('1 = 0');
        }
        
        // Apply all the same filters
        $attributionsQuery->when($request->input('search'), function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('examen', fn($subQ) => $subQ->where('nom', 'like', "%{$search}%"))
                  ->orWhereHas('examen.module', fn($subQ) => $subQ->where('nom', 'like', "%{$search}%"));
            });
        });

        $attributionsQuery->when($request->input('prof_search'), function ($query, $search) {
            $query->whereHas('professeur', function ($q) use ($search) {
                $q->where('nom', 'like', "%{$search}%")
                  ->orWhere('prenom', 'like', "%{$search}%");
            });
        });

        $attributionsQuery->when($request->input('service_search'), function ($query, $search) {
            $query->whereHas('professeur.service', function ($q) use ($search) {
                $q->where('nom', 'like', "%{$search}%");
            });
        });

        $attributionsQuery->when($request->input('in_conflict') === 'true', function ($q) {
            $q->where('attributions.is_in_conflict', true);
        });

        // The only difference: we use get() instead of paginate()
        $attributionsToExport = $attributionsQuery
            ->orderBy(Examen::select('debut')->whereColumn('examens.id', 'attributions.examen_id'), 'desc')
            ->orderBy('is_responsable', 'desc')
            ->get();
        
        // --- ADD THIS ---
        $filename = 'exam_assignments_' . now()->format('Y-m-d') . '.xlsx';
        
        // Trigger the download with the dynamic filename
        return Excel::download(new AttributionsExport($attributionsToExport), $filename);
    }

    public function findReplacements(Attribution $attribution)
    {
        $examen = $attribution->examen;
        $examStart = $examen->debut;
        $examEnd = $examen->getEndDatetimeAttribute(); // Get the calculated end time

        $candidates = Professeur::query()
            // RULE 1: Must be Active and not the professor we're replacing.
            ->where('statut', 'Active')
            ->where('id', '!=', $attribution->professeur_id)

            // RULE 2: Must NOT have any unavailabilities that overlap with the exam.
            ->whereDoesntHave('unavailabilities', function ($query) use ($examStart, $examEnd) {
                $query->where('start_datetime', '<', $examEnd)
                      ->where('end_datetime', '>', $examStart);
            })

            // RULE 3: Must NOT have another exam assignment that overlaps with this one.
            ->whereDoesntHave('attributions.examen', function ($query) use ($examStart, $examEnd) {
                $query->where('debut', '<', $examEnd)
                  // Use a raw expression to check the end time of other exams
                  ->whereRaw('"debut" + interval \'4 hours\' > ?', [$examStart]);
            })

            // Order by who has the fewest assignments to spread the load fairly.
            ->withCount('attributions')
            ->orderBy('attributions_count', 'asc')

            // Get the top 5.
            ->take(5)
            ->get(['id', 'nom', 'prenom']); // Only get the columns I need

        return response()->json($candidates);
    }

    public function reassign(Request $request, Attribution $attribution)
    {
        // Validate the request to make sure it has a new_professeur_id.
        $validated = $request->validate([
            'new_professeur_id' => 'required|exists:professeurs,id',
        ]);

        // Finding the Attribution (Already done via route model binding)

        // Update two fields:
        $attribution->professeur_id = $validated['new_professeur_id'];
        $attribution->is_in_conflict = false;

        // Save it.
        $attribution->save();

        // Return a success response.
        return redirect()->route('admin.attributions.index');
    }
}
