<?php

namespace App\Http\Controllers;

use App\Models\AnneeUni;
use Illuminate\Http\Request;

class AnneeUniController extends Controller
{
    public function index()
    {
        return AnneeUni::all();
    }

    public function store(Request $request)
    {
        $request->validate([
            'annee' => 'required|string|unique:annee_unis',
        ]);

        return AnneeUni::create($request->all());
    }

    public function update(Request $request, $id)
    {
        $annee = AnneeUni::findOrFail($id);
        $annee->update($request->all());
        return $annee;
    }

    public function destroy($id)
    {
        AnneeUni::destroy($id);
        return response()->noContent();
    }
}
