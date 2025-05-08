<?php

namespace App\Http\Controllers;

use App\Models\ProfesseurModule;
use Illuminate\Http\Request;

class ProfesseurModuleController extends Controller
{
    public function index()
    {
        return ProfesseurModule::with(['professeur', 'module'])->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'professeur_id' => 'required|exists:professeurs,id',
            'module_id' => 'required|exists:modules,id',
        ]);

        return ProfesseurModule::create($request->all());
    }

    public function destroy($id)
    {
        ProfesseurModule::destroy($id);
        return response()->noContent();
    }
}
