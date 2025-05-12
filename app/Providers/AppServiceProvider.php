<?php

namespace App\Providers;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        Gate::define('is_admin', function ($user) {
            return $user->hasRole('admin');
        });
        

        Gate::define('is_rh', function ($user) {
            return $user->hasRole('rh');
        });
        

        Gate::define('is_professeur', function ($user) {
            return $user->hasRole('professeur');

        });
        Gate::define('is_chef_service', function ($user) {
            return $user->hasRole('chef_service');

        });


    }
}
