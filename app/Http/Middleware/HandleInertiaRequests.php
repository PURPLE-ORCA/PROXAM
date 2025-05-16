<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
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
        // [$message, $author] = str(Inspiring::quotes()->random())->explode('-'); // Removed if not used

        return array_merge(parent::share($request), [
            'name' => config('app.name'),
            // 'quote' => ['message' => trim($message), 'author' => trim($author)], // Removed if not used
            'auth' => [
                'user' => $request->user(),
                'abilities' => $this->get_abilities($request->user()), // <<< MOVED HERE
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
}