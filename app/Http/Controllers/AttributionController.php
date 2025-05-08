<?php

namespace App\Http\Controllers;

use App\Models\Attribution;
use Illuminate\Http\Request;

class AttributionController extends Controller
{
    public function index()
    {
        return Attribution::with(['examen', 'professeur'])->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'examen_id' => 'required|exists:examens,id',
            'professeur_id' => 'required|exists:professeurs,id',
        ]);

        return Attribution::create($request->all());
    }

    public function update(Request $request, $id)
    {
        $attr = Attribution::findOrFail($id);
        $attr->update($request->all());
        return $attr;
    }

    public function destroy($id)
    {
        Attribution::destroy($id);
        return response()->noContent();
    }
}
