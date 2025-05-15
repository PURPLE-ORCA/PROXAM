<?php

namespace App\Http\Controllers;

use App\Models\Professeur;
use App\Models\User;
use App\Models\Service;
use App\Models\Module;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB; // For database transactions
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password as PasswordBroker; // For sending reset link
use Illuminate\Auth\Events\Registered; // Or a custom event for admin creation
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
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
        $professeurs = Professeur::with(['user', 'service'])
            ->when($request->input('search'), function ($query, $search) {
                $query->where('nom', 'like', "%{$search}%")
                      ->orWhere('prenom', 'like', "%{$search}%")
                      ->orWhereHas('user', fn($q) => $q->where('email', 'like', "%{$search}%"))
                      ->orWhereHas('service', fn($q) => $q->where('nom', 'like', "%{$search}%"));
            })
            ->when($request->input('service_id'), fn($q, $serviceId) => $q->where('service_id', $serviceId))
            ->when($request->input('rang'), fn($q, $rang) => $q->where('rang', $rang))
            ->when($request->input('statut'), fn($q, $statut) => $q->where('statut', $statut))
            ->orderBy('nom')->orderBy('prenom')
            ->paginate(15)
            ->withQueryString();

        $services = Service::orderBy('nom')->get(['id', 'nom']); // For filter dropdown

        return Inertia::render($this->baseInertiaPath() . 'Index', [
            'professeurs' => $professeurs,
            'filters' => $request->only(['search', 'service_id', 'rang', 'statut']),
            'servicesForFilter' => $services,
            // Pass enums for filters if you want to display them nicely
            'rangsForFilter' => Professeur::getRangs(), // Assuming a static method in Professeur model
            'statutsForFilter' => Professeur::getStatuts(), // Assuming a static method in Professeur model
        ]);
    }

    public function create()
    {
        $services = Service::orderBy('nom')->get(['id', 'nom']);
        $modules = Module::orderBy('nom')->get(['id', 'nom']);
        // Assuming enums are defined in the Professeur model or a config
        $rangs = Professeur::getRangs();
        $statuts = Professeur::getStatuts();

        return Inertia::render($this->baseInertiaPath() . 'Create', [
            'services' => $services,
            'modules' => $modules,
            'rangs' => $rangs,
            'statuts' => $statuts,
        ]);
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
        $allowedSpecialties = ['chirurgical', 'medical'];


        $validatedProfesseurData = $request->validate([
            'rang' => ['required', Rule::in(Professeur::getRangs(true))], // Pass true to get raw keys
            'statut' => ['required', Rule::in(Professeur::getStatuts(true))],
            'is_chef_service' => 'required|boolean',
            'date_recrutement' => 'required|date',
            'specialite' => ['required', 'string', Rule::in($allowedSpecialties)], 
            'service_id' => 'required|exists:services,id',
            'module_ids' => 'nullable|array',
            'module_ids.*' => 'exists:modules,id',
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
            if (!empty($validatedProfesseurData['module_ids'])) {
                $professeur->modules()->sync($validatedProfesseurData['module_ids']);
            }

            return redirect()->route('admin.professeurs.index')
                ->with('success', 'toasts.professeur_created_successfully');
        });
    }


    public function edit(Professeur $professeur)
    {
        $professeur->load(['user', 'service', 'modules']); // Eager load for form
        $services = Service::orderBy('nom')->get(['id', 'nom']);
        $modules = Module::orderBy('nom')->get(['id', 'nom']);
        $rangs = Professeur::getRangs();
        $statuts = Professeur::getStatuts();

        return Inertia::render($this->baseInertiaPath() . 'Edit', [
            'professeurToEdit' => $professeur, // Use different prop name
            'services' => $services,
            'modules' => $modules,
            'rangs' => $rangs,
            'statuts' => $statuts,
        ]);
    }

    public function update(Request $request, Professeur $professeur)
    {
         $validatedUserData = $request->validate([
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique(User::class)->ignore($professeur->user_id)],
        ]);
        $allowedSpecialties = ['chirurgical', 'medical'];

        $validatedProfesseurData = $request->validate([
            'professeur_nom' => 'required|string|max:255',
            'professeur_prenom' => 'required|string|max:255',
            'rang' => ['required', Rule::in(Professeur::getRangs(true))],
            'statut' => ['required', Rule::in(Professeur::getStatuts(true))],
            'is_chef_service' => 'required|boolean',
            'date_recrutement' => 'required|date',
            'specialite' => ['required', 'string', Rule::in($allowedSpecialties)], 
            'service_id' => 'required|exists:services,id',
            'module_ids' => 'nullable|array',
            'module_ids.*' => 'exists:modules,id',
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
            $professeur->modules()->sync($validatedProfesseurData['module_ids'] ?? []);

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