<?php

namespace App\Http\Middleware;

use App\Models\AnneeUni;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;
// Illuminate\Foundation\Inspiring is not used here unless you re-add the quote
// use Illuminate\Foundation\Inspiring;


class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {

                  // Determine current academic year (latest one)
                  $currentAnneeUni = AnneeUni::orderBy('annee', 'desc')->first();

                  // Get all academic years for a potential selector later
                  $allAnneesUniversitaires = AnneeUni::orderBy('annee', 'desc')->get(['id', 'annee']);
                  $latestAnneeUni = AnneeUni::orderBy('annee', 'desc')->first();
                //   $sessionIdInSession = session('selected_annee_uni_id');
                //   $defaultId = $latestAnneeUni?->id;
    // Get selected_id from session, default to currentAnneeUni's ID
    $selectedIdInSession = session('selected_annee_uni_id');

    if (!$selectedIdInSession && $currentAnneeUni) {
        $selectedIdInSession = $currentAnneeUni->id;
        // *** CRITICAL: Write the default to the session ***
        session(['selected_annee_uni_id' => $selectedIdInSession]);
        // Log::info("Default selected_annee_uni_id ({$selectedIdInSession}) was NOT in session, NOW SET.");
    } elseif (!$selectedIdInSession && !$currentAnneeUni) {
        // Edge case: No academic years in DB, and nothing in session
        $selectedIdInSession = null; // Or handle as an error/specific state
        // Log::warning("No academic years in DB and no selected_annee_uni_id in session.");
    }


    $selectedAnneeObject = $selectedIdInSession ? $allAnneesUniversitaires->firstWhere('id', $selectedIdInSession) : null;
    $selectedAnneeString = $selectedAnneeObject?->annee;

    // ... (your existing logging) ...
    // Log::info("--- HandleInertiaRequests ---");
    // Log::info("User ID: " . ($request->user()?->id ?? 'Guest'));
    // Log::info("Session 'selected_annee_uni_id' value AT START of share(): " . (session()->has('selected_annee_uni_id') && $request->session()->get('selected_annee_uni_id') !== $selectedIdInSession ? $request->session()->get('selected_annee_uni_id') : $selectedIdInSession)); // Log what it was vs what it is now
    // Log::info("Current (latest) AnneeUni ID from DB: " . ($currentAnneeUni?->id ?? 'None found'));
    // Log::info("Effective selected_id_in_session being used for props: " . ($selectedIdInSession ?? 'NULL'));
    // Log::info("Selected AnneeUni Object found: " . ($selectedAnneeObject ? 'Yes, ID: '.$selectedAnneeObject->id . ' (Annee: ' . $selectedAnneeObject->annee . ')' : 'No'));
    // Log::info("Selected Annee String for prop: " . ($selectedAnneeString ?? 'NULL => N/A'));
    // Log::info("--- End HandleInertiaRequests ---");
              
                //   Log::info("INERTIA_SHARE: Current Route: " . ($request->route()?->getName() ?? 'N/A') .
                //   ". Reading 'selected_annee_uni_id' from session: " . (session('selected_annee_uni_id') ?: 'null') . // Log raw session value
                //   ". Effective selected_id being used: " . ($selectedIdInSession ?: 'null') .
                //   ". Defaulting latestAnneeUni ID: " . ($currentAnneeUni?->id ?: 'null') .
                //   ". Session ID: " . session()->getId());


        return array_merge(parent::share($request), [
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user() ? $request->user()->load('professeur') : null,
                'abilities' => $this->get_abilities($request->user()), 
            ],
            'ziggy' => fn (): array => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'academicYear' => [
                'current' => $currentAnneeUni, // The system's absolute latest year
                'all' => $allAnneesUniversitaires,
                'selected_id' => $selectedIdInSession, // The ID the user actually selected (or default)
                'selected_annee' => $selectedAnneeString, // The 'annee' string for the selected ID
            ],
            // 'abilities' => $this->get_abilities($request->user()), // <<< REMOVED FROM HERE
        ]);
    }

    private function get_abilities($user): array
    {
        if (!$user) {
            // Return a structure that matches what frontend expects even for guests
            return [
                'is_admin' => false,
                'is_rh' => false,
                'is_professeur' => false,
                'is_chef_service' => false,
                'is_admin_or_rh' => false,
            ];
        }

        return [
            'is_admin' => $user->hasRole('admin'),
            'is_rh' => $user->hasRole('rh'),
            'is_professeur' => $user->hasRole('professeur'),
            'is_chef_service' => $user->hasRole('chef_service'),
            'is_admin_or_rh' => $user->hasRole('admin') || $user->hasRole('rh'),
        ];
    }

    //    **`academicYear.current`**: The latest `AnneeUni` model. This is the system's default "current year".
    //    **`academicYear.all`**: A collection of all academic years, for a future dropdown selector.
    //    **`academicYear.selected_id`**: This will store the ID of the academic year the user *is currently viewing data for*. It defaults to the `currentAnneeUni->id` but will eventually be changeable by the user and stored in their session.
    //    **`academicYear.selected_annee`**: The `annee` string of the selected academic year, for display.
}
