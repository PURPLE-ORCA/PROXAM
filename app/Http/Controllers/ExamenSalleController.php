<?php

namespace App\Http\Controllers;

use App\Models\ExamenSalle;
use Illuminate\Http\Request;

class ExamenSalleController extends Controller
{
    public function index()
    {
        return ExamenSalle::with(['examen', 'salle'])->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'examen_id' => 'required|exists:examens,id',
            'salle_id' => 'required|exists:salles,id',
        ]);

        return ExamenSalle::create($request->all());
    }

    public function destroy($id)
    {
        ExamenSalle::destroy($id);
        return response()->noContent();
    }
}

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
