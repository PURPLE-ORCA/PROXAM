<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Professeur;
use App\Models\Examen;
use App\Models\Attribution;
use App\Models\Notification;
use App\Models\Service;
use App\Models\Salle;
use App\Models\Echange;
use App\Models\Unavailability;
use App\Models\AnneeUni;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
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
                'professorLoadData' => [],
                'rankDistributionData' => [],
                'serviceLoadData' => [],
                'roomUtilizationData' => [],
                'exchangeMetrics' => [],
                'recentRecords' => [],
                'examTypeDistribution' => [],
                'upcomingExamsForTimeline' => [],
                'assignmentHotspots' => [],
                'lastAssignmentRunSummary' => null,
                'unconfiguredProfessors' => [],
            ]);
        }

        $kpiData = $this->getKpiData($selectedAnneeUniId);
        $upcomingExams = $this->getUpcomingExams($selectedAnneeUniId);
        $adminNotifications = $this->getAdminNotifications();
        $professorLoadData = $this->getProfessorLoadData($selectedAnneeUniId);
        $rankDistributionData = $this->getRankDistributionData();
        $serviceLoadData = $this->getServiceLoadData($selectedAnneeUniId);
        $roomUtilizationData = $this->getRoomUtilizationData($selectedAnneeUniId);
        $exchangeMetrics = $this->getExchangeMetrics($selectedAnneeUniId);
        $recentRecords = $this->getRecentRecords();
        $examTypeDistribution = $this->getExamTypeDistribution($selectedAnneeUniId);
        $upcomingExamsForTimeline = $this->getUpcomingExamsForTimeline($selectedAnneeUniId);
        $assignmentHotspots = $this->getAssignmentHotspots($selectedAnneeUniId);
        $lastAssignmentRunSummary = $this->getLastAssignmentRunSummary();
        $unconfiguredProfessors = $this->getUnconfiguredProfessors();


        return Inertia::render('dashboard', [
            'kpiData' => $kpiData,
            'upcomingExams' => $upcomingExams,
            'adminNotifications' => $adminNotifications,
            'professorLoadData' => $professorLoadData,
            'rankDistributionData' => $rankDistributionData,
            'serviceLoadData' => $serviceLoadData,
            'roomUtilizationData' => $roomUtilizationData,
            'exchangeMetrics' => $exchangeMetrics,
            'recentRecords' => $recentRecords,
            'examTypeDistribution' => $examTypeDistribution,
            'upcomingExamsForTimeline' => $upcomingExamsForTimeline,
            'assignmentHotspots' => $assignmentHotspots,
            'lastAssignmentRunSummary' => $lastAssignmentRunSummary,
            'unconfiguredProfessors' => $unconfiguredProfessors,
        ]);
    }

    private function getKpiData($selectedAnneeUniId)
    {
        return [
            'totalActiveProfessors' => Professeur::where('statut', 'Active')->count(),
            'totalExamsThisYear' => Examen::whereHas('seson', fn($q) => $q->where('annee_uni_id', $selectedAnneeUniId))->count(),
            'totalAssignmentsThisYear' => Attribution::whereHas('examen.seson', fn($q) => $q->where('annee_uni_id', $selectedAnneeUniId))->count(),
            'unstaffedExamsThisYear' => Examen::whereHas('seson', fn($q) => $q->where('annee_uni_id', $selectedAnneeUniId))
                ->withCount('attributions')
                ->get()
                ->filter(fn($examen) => $examen->attributions_count < $examen->total_required_professors)
                ->count(),
        ];
    }

    private function getUpcomingExams($selectedAnneeUniId)
    {
        return Examen::whereHas('seson', fn($q) => $q->where('annee_uni_id', $selectedAnneeUniId))
            ->where('debut', '>=', now())
            ->with(['module', 'salles'])
            ->withCount('attributions')
            ->orderBy('debut', 'asc')
            ->take(5)
            ->get();
    }

    private function getAdminNotifications()
    {
        return Notification::where('user_id', Auth::id())
            ->whereNull('read_at')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();
    }

    private function getProfessorLoadData($selectedAnneeUniId)
    {
        return Professeur::select('id', 'nom', 'prenom')
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
    }

    private function getRankDistributionData()
    {
        return Professeur::select('rang', DB::raw('count(*) as count'))
            ->where('statut', 'Active')
            ->groupBy('rang')
            ->orderBy('rang')
            ->get()
            ->map(function ($item) {
                $colors = ['PES' => '#2f024f', 'PAG' => '#4B5563', 'PA' => '#9CA3AF'];
                return [
                    'rank' => $item->rang,
                    'count' => $item->count,
                    'color' => $colors[$item->rang] ?? '#D1D5DB',
                ];
            });
    }

    private function getServiceLoadData($selectedAnneeUniId)
    {
        return Service::select('services.nom as service_name')
            ->join('professeurs', 'services.id', '=', 'professeurs.service_id')
            ->join('attributions', 'professeurs.id', '=', 'attributions.professeur_id')
            ->join('examens', 'attributions.examen_id', '=', 'examens.id')
            ->join('sesons', 'examens.seson_id', '=', 'sesons.id')
            ->where('sesons.annee_uni_id', $selectedAnneeUniId)
            ->groupBy('services.nom')
            ->selectRaw('services.nom as service_name, count(attributions.id) * 2 as total_hours')
            ->orderBy('total_hours', 'desc')
            ->get();
    }

    private function getRoomUtilizationData($selectedAnneeUniId)
    {
        return Salle::select('salles.nom as room_name')
            ->join('examens_salles', 'salles.id', '=', 'examens_salles.salle_id')
            ->join('examens', 'examens_salles.examen_id', '=', 'examens.id')
            ->join('sesons', 'examens.seson_id', '=', 'sesons.id')
            ->where('sesons.annee_uni_id', $selectedAnneeUniId)
            ->groupBy('salles.nom')
            ->selectRaw('salles.nom as room_name, count(examens_salles.id) as usage_count')
            ->orderBy('usage_count', 'desc')
            ->take(10)
            ->get();
    }

    private function getExchangeMetrics($selectedAnneeUniId)
    {
        $exchangeMetrics = [];
        $baseExchangeQuery = Echange::whereHas('offeredAttribution.examen.seson', fn($q) => $q->where('annee_uni_id', $selectedAnneeUniId));

        $exchangeMetrics['totalRequests'] = (clone $baseExchangeQuery)->count();
        $exchangeMetrics['approvedRequests'] = (clone $baseExchangeQuery)->where('status', 'Approved')->count();
        $exchangeMetrics['rejectedRequests'] = (clone $baseExchangeQuery)->whereIn('status', ['Refused_By_Requester', 'Cancelled_By_Requester', 'Cancelled_Auto_Expired'])->count();

        $exchangeMetrics['mostActiveUsers'] = Professeur::select('professeurs.id', 'professeurs.nom', 'professeurs.prenom')
            ->withCount([
                'exchangeRequests as requests_made' => fn($q) => $q->whereHas('offeredAttribution.examen.seson', fn($sq) => $sq->where('annee_uni_id', $selectedAnneeUniId)),
                'exchangeAcceptances as proposals_made' => fn($q) => $q->whereHas('offeredAttribution.examen.seson', fn($sq) => $sq->where('annee_uni_id', $selectedAnneeUniId)),
            ])
            ->get()
            ->map(function ($prof) {
                $prof->total_exchange_activity = $prof->requests_made + $prof->proposals_made;
                return $prof;
            })
            ->sortByDesc('total_exchange_activity')
            ->take(3)
            ->map(fn($prof) => "{$prof->prenom} {$prof->nom}")
            ->values();

        return $exchangeMetrics;
    }

    private function getRecentRecords()
    {
        $p = Professeur::latest()->with('user')->take(3)->get()->map(fn($i) => ['type' => 'Professor', 'name' => $i->user->name, 'created_at' => $i->created_at, 'action' => 'Added']);
        $e = Examen::latest()->with('module')->take(3)->get()->map(fn($i) => ['type' => 'Exam', 'name' => $i->module->nom, 'created_at' => $i->created_at, 'action' => 'Created']);
        $u = Unavailability::latest()->with('professeur.user')->take(3)->get()->map(fn($i) => ['type' => 'Unavailability', 'name' => $i->professeur->user->name, 'created_at' => $i->created_at, 'action' => 'Added']);
        
        $recentRecords = collect()->merge($p)->merge($e)->merge($u)
                            ->sortByDesc('created_at')
                            ->take(5)
                            ->values();
        return $recentRecords;
    }

    private function getExamTypeDistribution($selectedAnneeUniId)
    {
        return Examen::whereHas('seson', fn($q) => $q->where('annee_uni_id', $selectedAnneeUniId))
            ->groupBy('type')
            ->select('type', DB::raw('count(*) as count'))
            ->pluck('count', 'type')
            ->all();
    }

    private function getUpcomingExamsForTimeline($selectedAnneeUniId)
    {
        $exams = Examen::whereHas('seson', fn($q) => $q->where('annee_uni_id', $selectedAnneeUniId))
            ->whereBetween('debut', [now(), now()->addDays(30)])
            ->with('module')
            ->orderBy('debut', 'asc')
            ->get();

        return $exams->groupBy(function ($exam) {
            return $exam->debut->format('Y-m-d');
        });
    }

    private function getAssignmentHotspots($selectedAnneeUniId)
    {
        $anneeUni = AnneeUni::find($selectedAnneeUniId);
        if (!$anneeUni) return [];

        return Examen::whereHas('seson', fn($q) => $q->where('annee_uni_id', $selectedAnneeUniId))
            ->select(DB::raw("CAST(debut AS DATE) as date"), DB::raw('count(*) as count'))
            ->groupBy('date')
            ->pluck('count', 'date')
            ->all();
    }

    private function getLastAssignmentRunSummary()
    {
        return Cache::get('last_assignment_run_summary');
    }

    private function getUnconfiguredProfessors()
    {
        return [
            'without_service' => Professeur::whereNull('service_id')->with('user')->get(),
            'without_modules' => Professeur::whereDoesntHave('modules')->where('statut', 'Active')->with('user')->get(),
        ];
    }
}
