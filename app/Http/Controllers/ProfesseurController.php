<?php

namespace App\Http\Controllers;

use App\Models\Professeur;
use App\Models\Service;
use Illuminate\Http\Request;

class ProfesseurController extends Controller
{
    public function index()
    {
        return Professeur::with('service')->get(); // assuming 'service' is a relation
    }

    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string',
            'prenom' => 'required|string',
            'service_id' => 'required|exists:services,id',
        ]);

        return Professeur::create($request->all());
    }

    public function show($id)
    {
        return Professeur::with('modules')->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $prof = Professeur::findOrFail($id);
        $prof->update($request->all());
        return $prof;
    }

    public function destroy($id)
    {
        Professeur::destroy($id);
        return response()->noContent();
    }
}
