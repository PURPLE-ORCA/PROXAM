<?php

namespace App\Http\Controllers\Admin; // In Admin subfolder

use App\Http\Controllers\Controller;
use App\Models\Examen;
use App\Models\Professeur;
use App\Models\Attribution;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB; // For transactions

class ExamAssignmentManagementController extends Controller
{
    /**
     * Display the assignment management page for a specific exam.
     */
    public function index(Examen $examen)
    {
        $examen->load(['attributions.professeur.user', 'module', 'quadrimestre.seson.anneeUni']);

        $assignedProfesseurIds = $examen->attributions->pluck('professeur_id')->toArray();

        // Fetch professors who are active, not chefs, and NOT already assigned to this exam
        $availableProfesseurs = Professeur::where('statut', 'Active')
            ->where('is_chef_service', false)
            ->whereNotIn('id', $assignedProfesseurIds)
            ->orderBy('nom')->orderBy('prenom')
            ->get(['id', 'nom', 'prenom'])
            ->map(fn($p) => ['id' => $p->id, 'display_name' => "{$p->prenom} {$p->nom}"]);

        return Inertia::render('Admin/Examens/ManageAssignments', [
            'examen' => $examen,
            'currentAttributions' => $examen->attributions,
            'availableProfesseurs' => $availableProfesseurs,
        ]);
    }

    /**
     * Store a new manual attribution for an exam.
     */
    public function storeAttribution(Request $request, Examen $examen)
    {
        $validated = $request->validate([
            'professeur_id' => [
                'required',
                'exists:professeurs,id',
                Rule::unique('attributions')->where(function ($query) use ($examen) {
                    return $query->where('examen_id', $examen->id);
                }), // Ensure professor is not already assigned to this exam
            ],
            'is_responsable' => 'required|boolean',
        ]);

        // Constraint: Check if adding this attribution exceeds required_professors
        if ($examen->attributions()->count() >= $examen->required_professors) {
            return back()->with('error', 'toasts.examen_slots_full_cannot_add');
        }

        DB::transaction(function () use ($examen, $validated) {
            // If setting this one as responsable, ensure no other is responsable
            if ($validated['is_responsable']) {
                $examen->attributions()->where('is_responsable', true)->update(['is_responsable' => false]);
            }
            Attribution::create([
                'examen_id' => $examen->id,
                'professeur_id' => $validated['professeur_id'],
                'is_responsable' => $validated['is_responsable'],
            ]);
        });

        return back()->with('success', 'toasts.attribution_added_successfully');
    }

    /**
     * Toggle the is_responsable status of an attribution.
     */
    public function toggleResponsable(Attribution $attribution)
    {
        DB::transaction(function () use ($attribution) {
            $newResponsableStatus = !$attribution->is_responsable;

            // If making this one responsable, demote any existing responsable for this exam
            if ($newResponsableStatus) {
                Attribution::where('examen_id', $attribution->examen_id)
                    ->where('id', '!=', $attribution->id)
                    ->where('is_responsable', true)
                    ->update(['is_responsable' => false]);
            }
            $attribution->update(['is_responsable' => $newResponsableStatus]);
        });

        return back()->with('success', 'toasts.attribution_responsable_toggled');
    }

    /**
     * Delete a manual attribution.
     */
    public function destroyAttribution(Attribution $attribution)
    {
        $attribution->delete();
        return back()->with('success', 'toasts.attribution_deleted_successfully');
    }
}