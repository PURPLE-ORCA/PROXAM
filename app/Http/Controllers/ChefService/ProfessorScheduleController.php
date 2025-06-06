<?php

namespace App\Http\Controllers\ChefService;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Professeur;
use App\Models\Attribution;
use App\Models\Service;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log; // Add this

class ProfessorScheduleController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        Log::info("ChefService Controller: User ID attempting access: " . $user->id . " with role: " . $user->role);

        $chefDeServiceProfesseur = $user->professeur;
        Log::info("ChefService Controller: Fetched Professeur record: ", $chefDeServiceProfesseur ? $chefDeServiceProfesseur->toArray() : ['Professeur record is NULL']);

        if (!$chefDeServiceProfesseur) {
            Log::error("ChefService Controller: No Professeur record found for User ID " . $user->id);
            return redirect()->route('dashboard')->with('error', 'Professor profile not found for your user account.');
        }
        if (!$chefDeServiceProfesseur->is_chef_service) {
            Log::error("ChefService Controller: Professeur ID {$chefDeServiceProfesseur->id} (User ID {$user->id}) is NOT marked as is_chef_service. Actual value: " . ($chefDeServiceProfesseur->is_chef_service ? 'true' : 'false'));
            return redirect()->route('dashboard')->with('error', 'You are not designated as a Head of Service in your professor profile.');
        }
        if (!$chefDeServiceProfesseur->service_id) {
            Log::error("ChefService Controller: Professeur ID {$chefDeServiceProfesseur->id} (User ID {$user->id}) has no service_id assigned.");
            return redirect()->route('dashboard')->with('error', 'Your professor profile is not assigned to a service.');
        }

        $serviceId = $chefDeServiceProfesseur->service_id;
        $selectedAnneeUniId = session('selected_annee_uni_id');

        $professeursInService = Professeur::where('service_id', $serviceId)
            ->with('user')
            ->orderBy('nom')
            ->orderBy('prenom')
            ->get();

        $professeurIdsInService = $professeursInService->pluck('id');

        $attributionsByProfessor = Attribution::whereIn('professeur_id', $professeurIdsInService)
            ->whereHas('examen.seson', function ($querySeson) use ($selectedAnneeUniId) {
                $querySeson->where('annee_uni_id', $selectedAnneeUniId);
            })
            ->with(['professeur.user', 'examen.module', 'salle', 'examen.seson'])
            ->join('examens', 'attributions.examen_id', '=', 'examens.id')
            ->orderBy('examens.debut', 'asc')
            ->orderBy('professeur_id')
            ->select('attributions.*')
            ->get()
            ->groupBy('professeur_id');

        $serviceName = Service::find($serviceId)->nom ?? 'Service';

        return Inertia::render('ChefService/ProfessorSchedulesIndex', [
            'professeursInService' => $professeursInService,
            'attributionsByProfessor' => $attributionsByProfessor,
            'serviceName' => $serviceName,
        ]);
    }
}
