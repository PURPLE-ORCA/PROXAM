<?php

namespace App\Http\Controllers;

use App\Models\Quadrimestre;
use Illuminate\Http\Request;

class QuadrimestreController extends Controller
{
    public function index()
    {
        return Quadrimestre::all();
    }

    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|unique:quadrimestres',
        ]);

        return Quadrimestre::create($request->all());
    }

    public function update(Request $request, $id)
    {
        $quad = Quadrimestre::findOrFail($id);
        $quad->update($request->all());
        return $quad;
    }

    public function destroy($id)
    {
        Quadrimestre::destroy($id);
        return response()->noContent();
    }
}
