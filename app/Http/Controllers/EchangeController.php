<?php

nnamespace App\Http\Controllers;

use App\Models\Echange;
use Illuminate\Http\Request;

class EchangeController extends Controller
{
    public function index()
    {
        return Echange::with(['attribution1.professeur', 'attribution2.professeur'])->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'attribution1_id' => 'required|exists:attributions,id',
            'attribution2_id' => 'required|exists:attributions,id',
            'etat' => 'in:en_attente,accepte,refuse',
        ]);

        return Echange::create($request->all());
    }

    public function update(Request $request, $id)
    {
        $echange = Echange::findOrFail($id);
        $echange->update($request->only('etat'));
        return $echange;
    }
}
