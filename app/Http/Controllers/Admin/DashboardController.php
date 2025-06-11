<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Professeur;
use App\Models\Examen;
use App\Models\Attribution;
use App\Models\Notification;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $selectedAnneeUniId = session('selected_annee_uni_id');

        if (!$selectedAnneeUniId) {
            return Inertia::render('dashboard', [
                'kpiData' => [],
                'upcomingExams' => [],
                'adminNotifications' => [],
            ]);
        }

        $kpiData = [
            'totalActiveProfessors' => Professeur::where('statut', 'Active')->count(),
            'totalExamsThisYear' => Examen::whereHas('seson', fn($q) => $q->where('annee_uni_id', $selectedAnneeUniId))->count(),
            'totalAssignmentsThisYear' => Attribution::whereHas('examen.seson', fn($q) => $q->where('annee_uni_id', $selectedAnneeUniId))->count(),
            'unstaffedExamsThisYear' => Examen::whereHas('seson', fn($q) => $q->where('annee_uni_id', $selectedAnneeUniId))
                ->withCount('attributions')
                ->get()
                ->filter(fn($examen) => $examen->attributions_count < $examen->total_required_professors)
                ->count(),
        ];

        $upcomingExams = Examen::whereHas('seson', fn($q) => $q->where('annee_uni_id', $selectedAnneeUniId))
            ->where('debut', '>=', now())
            ->with(['module', 'salles'])
            ->withCount('attributions')
            ->orderBy('debut', 'asc')
            ->take(5)
            ->get();

        $adminNotifications = Notification::where('user_id', Auth::id())
            ->whereNull('read_at')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        return Inertia::render('dashboard', [
            'kpiData' => $kpiData,
            'upcomingExams' => $upcomingExams,
            'adminNotifications' => $adminNotifications,
        ]);
    }
}
