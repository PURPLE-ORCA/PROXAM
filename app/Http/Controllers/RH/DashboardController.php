<?php

namespace App\Http\Controllers\RH;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Unavailability; // Import the Unavailability model

class DashboardController extends Controller
{
    /**
     * Display the RH dashboard.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        // Example: Fetch recently added unavailabilities
        $recentUnavailabilities = Unavailability::with('professeur.user')
                                   ->orderBy('created_at', 'desc')
                                   ->take(5)
                                   ->get();

        // Example: Fetch count of unavailabilities for the current month
        $monthlyUnavailabilitiesCount = Unavailability::whereMonth('start_datetime', now()->month)
                                       ->whereYear('start_datetime', now()->year)
                                       ->count();

        return Inertia::render('RH/Dashboard', [
            'recentUnavailabilities' => $recentUnavailabilities,
            'monthlyUnavailabilitiesCount' => $monthlyUnavailabilitiesCount,
        ]);
    }
}
