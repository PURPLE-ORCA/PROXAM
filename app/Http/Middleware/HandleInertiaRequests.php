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
                  $selectedIdInSession = session('selected_annee_uni_id', $currentAnneeUni?->id);
                  $selectedAnneeObject = $selectedIdInSession ? $allAnneesUniversitaires->firstWhere('id', $selectedIdInSession) : null;
                  $selectedAnneeString = $selectedAnneeObject?->annee;
              
                //   Log::info("INERTIA_SHARE: Current Route: " . ($request->route()?->getName() ?? 'N/A') .
                //   ". Reading 'selected_annee_uni_id' from session: " . (session('selected_annee_uni_id') ?: 'null') . // Log raw session value
                //   ". Effective selected_id being used: " . ($selectedIdInSession ?: 'null') .
                //   ". Defaulting latestAnneeUni ID: " . ($currentAnneeUni?->id ?: 'null') .
                //   ". Session ID: " . session()->getId());

        // [$message, $author] = str(Inspiring::quotes()->random())->explode('-'); // Removed if not used

        return array_merge(parent::share($request), [
            'name' => config('app.name'),
            // 'quote' => ['message' => trim($message), 'author' => trim($author)], // Removed if not used
            'auth' => [
                'user' => $request->user(),
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