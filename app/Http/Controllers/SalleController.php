<?php

namespace App\Http\Controllers;

use App\Models\Salle;
use Illuminate\Http\Request;

class SalleController extends Controller
{
    public function index()
    {
        return Salle::all();
    }

    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|unique:salles',
            'capacite' => 'required|integer|min:1',
        ]);

        return Salle::create($request->all());
    }

    public function update(Request $request, $id)
    {
        $salle = Salle::findOrFail($id);
        $salle->update($request->all());
        return $salle;
    }

    public function destroy($id)
    {
        Salle::destroy($id);
        return response()->noContent();
    }
}

