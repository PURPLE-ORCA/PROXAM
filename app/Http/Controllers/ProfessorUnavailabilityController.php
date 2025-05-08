<?php

namespace App\Http\Controllers;

use App\Models\ProfessorUnavailability;
use Illuminate\Http\Request;

class ProfessorUnavailabilityController extends Controller
{
    public function index()
    {
        return ProfessorUnavailability::with('professeur')->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'professeur_id' => 'required|exists:professeurs,id',
            'date' => 'required|date',
            'heure_debut' => 'required|date_format:H:i',
            'heure_fin' => 'required|date_format:H:i|after:heure_debut',
        ]);

        return ProfessorUnavailability::create($request->all());
    }

    public function destroy($id)
    {
        ProfessorUnavailability::destroy($id);
        return response()->noContent();
    }
}
