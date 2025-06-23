<?php

namespace App\Http\Controllers;

use App\Models\Professeur;
use App\Models\User;
use App\Models\Service;
use App\Models\Module;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB; 
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password as PasswordBroker;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Illuminate\Support\Str;

class ProfesseurController extends Controller
{
    protected function baseInertiaPath(): string
    {
        return 'Admin/Professeurs/';
    }

    public function index(Request $request)
    {
        $professeursQuery = Professeur::with(['user', 'service']);

        // --- REFINED FILTERING LOGIC ---
        // Global search (if you keep it, it searches across multiple fields)
        $professeursQuery->when($request->input('search'), function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->where('nom', 'like', "%{$search}%")
                  ->orWhere('prenom', 'like', "%{$search}%")
                  ->orWhereHas('user', fn($subQ) => $subQ->where('email', 'like', "%{$search}%"));
            });
        });

        // Specific Column Filters
        $professeursQuery->when($request->input('filters.fullName'), function ($query, $name) {
            $query->where(function ($q) use ($name) {
                $q->where('nom', 'like', "%{$name}%")
                  ->orWhere('prenom', 'like', "%{$name}%");
            });
        });
        $professeursQuery->when($request->input('filters.user.email'), function ($query, $email) {
            $query->whereHas('user', fn($q) => $q->where('email', 'like', "%{$email}%"));
        });
        $professeursQuery->when($request->input('filters.service.nom'), function ($query, $serviceName) {
            $query->whereHas('service', fn($q) => $q->where('nom', 'like', "%{$serviceName}%"));
        });
        $professeursQuery->when($request->input('filters.rang'), function ($query, $rang) {
            $query->where('rang', $rang);
        });
        $professeursQuery->when($request->input('filters.statut'), function ($query, $statut) {
            $query->where('statut', $statut);
        });
        // --- END REFINED FILTERING LOGIC ---

        $professeurs = $professeursQuery->orderBy('nom')->orderBy('prenom')
            ->paginate($request->input('per_page', 40))
            ->withQueryString();

        // --- ADD THIS DATA FOR THE MODAL ---
        $services = Service::orderBy('nom')->get(['id', 'nom']);
        
        // --- THIS IS THE FIX ---
        // Instead of getting all module records, get only the distinct names.
        $modules = Module::select('nom')
                         ->distinct()
                         ->orderBy('nom')
                         ->pluck('nom') // This gives you a simple array: ['Anatomie Générale', 'Biochimie Structurale', ...]
                         ->all();
        // --- END OF FIX ---

        $rangs = Professeur::getRangs();
        $statuts = Professeur::getStatuts();
        $existingSpecialties = Professeur::select('specialite')
                                        ->whereNotNull('specialite')
                                        ->where('specialite', '!=', '')
                                        ->distinct()
                                        ->pluck('specialite')
                                        ->toArray();
        // --- END ADD ---

        return Inertia::render($this->baseInertiaPath() . 'Index', [
            'professeurs' => $professeurs,
            'filters' => $request->all(['search', 'filters']),
            // Keep existing data for MRT filters
            'servicesForFilter' => $services,
            'rangsForFilter' => $rangs,
            'statutsForFilter' => $statuts,
            // Pass new data for the modal form
            'servicesForForm' => $services,
            'modulesForForm' => $modules, // Pass the new, unique list
            'rangsForForm' => $rangs,
            'statutsForForm' => $statuts,
            'existingSpecialtiesForForm' => $existingSpecialties,
        ]);
    }

    public function show(Professeur $professeur)
    {
        // Eager load all the relationships we need for the edit form
        $professeur->load(['user', 'service', 'modules']);
        return response()->json($professeur);
    }

    public function store(Request $request)
    {
        // Note: User creation part
        $validatedUserData = $request->validate([
            'professeur_nom' => 'required|string|max:255', // Using prefixed names to avoid conflict
            'professeur_prenom' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            // No password here, will be set via activation link
        ]);

        $validatedProfesseurData = $request->validate([
            'rang' => ['required', Rule::in(Professeur::getRangs(true))], // Pass true to get raw keys
            'statut' => ['required', Rule::in(Professeur::getStatuts(true))],
            'is_chef_service' => 'required|boolean',
            'date_recrutement' => 'required|date',
            'specialite' => ['required', 'string', 'max:255'],
            'service_id' => 'required|exists:services,id',
            'module_names' => 'nullable|array', // Validate the array of names
            'module_names.*' => 'string|exists:modules,nom', // Ensure each name exists
        ]);

        return DB::transaction(function () use ($request, $validatedUserData, $validatedProfesseurData) {
            // 1. Create User
            $user = User::create([
                'name' => $validatedUserData['professeur_prenom'] . ' ' . $validatedUserData['professeur_nom'],
                'email' => $validatedUserData['email'],
                'password' => Hash::make(Str::random(16)), // Temporary secure password
                'role' => 'professeur',
                'email_verified_at' => null, // Will be verified via activation/password set
            ]);

            // event(new Registered($user)); // Or a custom "AdminCreatedProfesseurUser" event

            // Send password reset/activation link
            // This uses Laravel's built-in password reset notification system.
            // Ensure your User model uses Notifiable trait and you have mail configured.
            PasswordBroker::broker()->sendResetLink(['email' => $user->email]);

            // 2. Create Professeur
            $professeur = $user->professeur()->create([
                'nom' => $validatedUserData['professeur_nom'],
                'prenom' => $validatedUserData['professeur_prenom'],
                'rang' => $validatedProfesseurData['rang'],
                'statut' => $validatedProfesseurData['statut'],
                'is_chef_service' => $validatedProfesseurData['is_chef_service'],
                'date_recrutement' => $validatedProfesseurData['date_recrutement'],
                'specialite' => $validatedProfesseurData['specialite'],
                'service_id' => $validatedProfesseurData['service_id'],
            ]);

            // 3. Sync Modules
            // --- MODIFIED MODULE SYNC LOGIC ---
            if (!empty($validatedProfesseurData['module_names'])) {
                // Find all module IDs that match the submitted names
                $moduleIds = Module::whereIn('nom', $validatedProfesseurData['module_names'])->pluck('id');
                $professeur->modules()->sync($moduleIds);
            }
            // ------------------------------------

            return redirect()->route('admin.professeurs.index')
                ->with('success', 'toasts.professeur_created_successfully');
        });
    }

    public function update(Request $request, Professeur $professeur)
    {
         $validatedUserData = $request->validate([
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique(User::class)->ignore($professeur->user_id)],
        ]);

        $validatedProfesseurData = $request->validate([
            'professeur_nom' => 'required|string|max:255',
            'professeur_prenom' => 'required|string|max:255',
            'rang' => ['required', Rule::in(Professeur::getRangs(true))],
            'statut' => ['required', Rule::in(Professeur::getStatuts(true))],
            'is_chef_service' => 'required|boolean',
            'date_recrutement' => 'required|date',
            'specialite' => ['required', 'string', 'max:255'], // Validation is now just a string
            'service_id' => 'required|exists:services,id',
            'module_names' => 'nullable|array',
            'module_names.*' => 'string|exists:modules,nom',
        ]);

        return DB::transaction(function () use ($request, $professeur, $validatedUserData, $validatedProfesseurData) {
            // 1. Update User
            $professeur->user->update([
                'name' => $validatedProfesseurData['professeur_prenom'] . ' ' . $validatedProfesseurData['professeur_nom'],
                'email' => $validatedUserData['email'],
                // Role shouldn't change here typically unless intended
            ]);

            // 2. Update Professeur
            $professeur->update([
                'nom' => $validatedProfesseurData['professeur_nom'],
                'prenom' => $validatedProfesseurData['professeur_prenom'],
                'rang' => $validatedProfesseurData['rang'],
                'statut' => $validatedProfesseurData['statut'],
                'is_chef_service' => $validatedProfesseurData['is_chef_service'],
                'date_recrutement' => $validatedProfesseurData['date_recrutement'],
                'specialite' => $validatedProfesseurData['specialite'],
                'service_id' => $validatedProfesseurData['service_id'],
            ]);

            // 3. Sync Modules
            // --- MODIFIED MODULE SYNC LOGIC ---
            $moduleIds = [];
            if (!empty($validatedProfesseurData['module_names'])) {
                $moduleIds = Module::whereIn('nom', $validatedProfesseurData['module_names'])->pluck('id');
            }
            $professeur->modules()->sync($moduleIds);
            // ------------------------------------

            return redirect()->route('admin.professeurs.index')
                ->with('success', 'toasts.professeur_updated_successfully');
        });
    }

    public function destroy(Professeur $professeur)
    {
        // Add checks for attributions, etc., if deletion needs to be restricted
        // if ($professeur->attributions()->exists() || ... ) {
        //     return redirect()->route('admin.professeurs.index')
        //         ->with('error', 'toasts.professeur_in_use_cannot_delete');
        // }

        DB::transaction(function () use ($professeur) {
            $user = $professeur->user;
            $professeur->modules()->detach(); // Detach from pivot table
            $professeur->delete(); // Deletes Professeur record
            // The User record is also deleted due to cascadeOnDelete on professeurs.user_id
            // If no cascade, or if you want to keep the user but change role:
            // $user->delete(); // Or $user->update(['role' => 'some_other_role']);
        });

        return redirect()->route('admin.professeurs.index')
            ->with('success', 'toasts.professeur_deleted_successfully');
    }
}
