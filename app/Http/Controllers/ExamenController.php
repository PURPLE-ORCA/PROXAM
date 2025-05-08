<?php

namespace App\Http\Controllers;

use App\Models\Examen;
use Illuminate\Http\Request;

class ExamenController extends Controller
{
    public function index()
    {
        return Examen::with(['module', 'quadrimestre'])->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'module_id' => 'required|exists:modules,id',
            'quadrimestre_id' => 'required|exists:quadrimestres,id',
        ]);

        return Examen::create($request->all());
    }

    public function show($id)
    {
        return Examen::with(['module', 'salles'])->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $exam = Examen::findOrFail($id);
        $exam->update($request->all());
        return $exam;
    }

    public function destroy($id)
    {
        Examen::destroy($id);
        return response()->noContent();
    }
}
