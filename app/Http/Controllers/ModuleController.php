<?php

namespace App\Http\Controllers;

use App\Models\Module;
use Illuminate\Http\Request;

class ModuleController extends Controller
{
    public function index()
    {
        return Module::all();
    }

    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|unique:modules',
        ]);

        return Module::create($request->all());
    }

    public function update(Request $request, $id)
    {
        $module = Module::findOrFail($id);
        $module->update($request->all());
        return $module;
    }

    public function destroy($id)
    {
        Module::destroy($id);
        return response()->noContent();
    }
}
