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
use Illuminate\Support\Facades\DB;

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

        $professorLoadData = \App\Models\Professeur::select('id', 'nom', 'prenom')
            ->withCount(['attributions' => function ($query) use ($selectedAnneeUniId) {
                $query->whereHas('examen.seson', fn($q) => $q->where('annee_uni_id', $selectedAnneeUniId));
            }])
            ->orderBy('attributions_count', 'desc')
            ->take(15)
            ->get()
            ->map(function ($prof) {
                return [
                    'name' => "{$prof->prenom} {$prof->nom}",
                    'assignments' => $prof->attributions_count,
                ];
            });

        $rankDistributionData = \App\Models\Professeur::select('rang', DB::raw('count(*) as count'))
            ->where('statut', 'Active')
            ->groupBy('rang')
            ->orderBy('rang')
            ->get()
            ->map(function ($item) {
                $colors = ['PES' => '#2f024f', 'PAG' => '#4B5563', 'PA' => '#9CA3AF']; // Using main color #2f024f for PES
                return [
                    'rank' => $item->rang,
                    'count' => $item->count,
                    'color' => $colors[$item->rang] ?? '#D1D5DB',
                ];
            });

        return Inertia::render('dashboard', [
            'kpiData' => $kpiData,
            'upcomingExams' => $upcomingExams,
            'adminNotifications' => $adminNotifications,
            'professorLoadData' => $professorLoadData,
            'rankDistributionData' => $rankDistributionData,
        ]);
    }
}
