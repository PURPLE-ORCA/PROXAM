<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attribution;
use App\Models\Examen;
use App\Models\Professeur;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ExamAssignmentManagementController extends Controller
{
    public function index(Examen $examen)
    {
        // Eager load all necessary relationships
        $examen->load([
            'salles',
            'attributions.professeur.user',
            'attributions.salle',
            'module',
        ]);

        // Get a list of professors not yet assigned to this exam
        $assignedProfesseurIds = $examen->attributions->pluck('professeur_id');
        $availableProfesseurs = Professeur::whereNotIn('id', $assignedProfesseurIds)
            ->where('statut', 'Active') // Only show active professors
            ->orderBy('nom')->get()->map(fn($p) => ['id' => $p->id, 'display_name' => "{$p->prenom} {$p->nom} ({$p->service?->nom})"]);

        // Structure the data by room for the new UI
        $sallesWithAttributions = $examen->salles->map(function ($salle) use ($examen) {
            return [
                'id' => $salle->id,
                'nom' => $salle->nom,
                'required_professors' => $salle->pivot->professeurs_assignes_salle,
                'attributions' => $examen->attributions->where('salle_id', $salle->id)->values(),
            ];
        });

        return Inertia::render('Admin/Examens/ManageAssignments', [
            'examen' => $examen,
            'sallesWithAttributions' => $sallesWithAttributions,
            'availableProfesseurs' => $availableProfesseurs,
        ]);
    }

    public function storeAttribution(Request $request, Examen $examen)
    {
        $validated = $request->validate([
            'professeur_id' => 'required|exists:professeurs,id',
            'salle_id' => 'required|exists:salles,id',
            'is_responsable' => 'required|boolean',
        ]);

        // THE BUG FIX for `toggleResponsable` lives here too.
        // If we are making this new person a responsable, we must demote any existing
        // responsable *only within the same salle*.
        if ($validated['is_responsable']) {
            Attribution::where('examen_id', $examen->id)
                       ->where('salle_id', $validated['salle_id'])
                       ->update(['is_responsable' => false]);
        }

        Attribution::create([
            'examen_id' => $examen->id,
            'professeur_id' => $validated['professeur_id'],
            'salle_id' => $validated['salle_id'],
            'is_responsable' => $validated['is_responsable'],
        ]);

        return back()->with('success', 'Professor assigned successfully.');
    }

    public function toggleResponsable(Attribution $attribution)
    {
        // This is where the original bug was.
        // The fix is to ensure that when we promote one, we only demote others
        // within the SAME EXAM and SAME SALLE.
        DB::transaction(function () use ($attribution) {
            // Demote any other responsable in the same room for this exam.
            Attribution::where('examen_id', $attribution->examen_id)
                       ->where('salle_id', $attribution->salle_id)
                       ->where('id', '!=', $attribution->id)
                       ->update(['is_responsable' => false]);
            
            // Now, toggle the selected one.
            $attribution->update(['is_responsable' => !$attribution->is_responsable]);
        });

        return back()->with('success', "Professor's 'responsable' status updated.");
    }

    public function destroyAttribution(Attribution $attribution)
    {
        $attribution->delete();
        return back()->with('success', 'Assignment removed successfully.');
    }
}
