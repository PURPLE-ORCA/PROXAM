<?php

namespace App\Http\Controllers\Professor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Attribution;
use App\Models\Echange;
use App\Models\Notification;
// Remove unused models if Examen, Module, Salle are only accessed via relations
// use App\Models\Examen;
// use App\Models\Module;
// use App\Models\Salle;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $professeur = $request->user()->professeur;
        $selectedAnneeUniId = session('selected_annee_uni_id');

        if (!$selectedAnneeUniId || !$professeur) {
            // Handle cases where essential data is missing
            return Inertia::render('Professor/Dashboard', [
                'upcomingAssignments' => collect(),
                'totalAssignmentsThisYear' => 0,
                // Consider passing an error message or specific state
            ]);
        }

        // Fetch Data for "Upcoming Assignments" Widget
        $upcomingAssignments = Attribution::where('professeur_id', $professeur->id)
            ->whereHas('examen.seson', function ($querySeson) use ($selectedAnneeUniId) { // <<<< CORRECTED PATH
                $querySeson->where('annee_uni_id', $selectedAnneeUniId); // Filter directly on seson's annee_uni_id
            })
            ->whereHas('examen', function ($queryExamen) { // Separate whereHas for debut condition on examen
                $queryExamen->where('debut', '>=', now());
            })
            ->with(['examen.module', 'salle'])
            ->join('examens', 'attributions.examen_id', '=', 'examens.id')
            ->orderBy('examens.debut', 'asc')
            ->select('attributions.*')
            ->take(3)
            ->get();

        // Fetch Data for "Assignment Summary" Widget
        $totalAssignmentsThisYear = Attribution::where('professeur_id', $professeur->id)
            ->whereHas('examen.seson', function ($querySeson) use ($selectedAnneeUniId) { // <<<< CORRECTED PATH
                $querySeson->where('annee_uni_id', $selectedAnneeUniId); // Filter directly on seson's annee_uni_id
            })
            ->count();

        // Fetch Data for "Pending Exchange Actions" Widget
        $pendingReviewRequests = Echange::where('professeur_requester_id', $professeur->id)
            ->where('status', 'Pending_Requester_Decision')
            ->whereHas('offeredAttribution.examen.seson', fn($q) => $q->where('annee_uni_id', $selectedAnneeUniId))
            ->with(['offeredAttribution.examen.module', 'accepter.user'])
            ->orderBy('updated_at', 'desc')
            ->take(3)
            ->get();

        $pendingReviewRequestsCount = Echange::where('professeur_requester_id', $professeur->id)
            ->where('status', 'Pending_Requester_Decision')
            ->whereHas('offeredAttribution.examen.seson', fn($q) => $q->where('annee_uni_id', $selectedAnneeUniId))
            ->count();

        // Fetch Data for "Recent Notifications" Widget
        $latestUnreadNotifications = Notification::where('user_id', $request->user()->id)
                            ->whereNull('read_at')
                            ->orderBy('created_at', 'desc')
                            ->take(3)
                            ->get();

        return Inertia::render('Professor/Dashboard', [
            'upcomingAssignments' => $upcomingAssignments,
            'totalAssignmentsThisYear' => $totalAssignmentsThisYear,
            'pendingReviewRequests' => $pendingReviewRequests,
            'pendingReviewRequestsCount' => $pendingReviewRequestsCount,
            'latestUnreadNotifications' => $latestUnreadNotifications,
        ]);
    }
}
