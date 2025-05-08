<?php

namespace App\Http\Controllers;

use App\Models\Session;
use Illuminate\Http\Request;

class SessionController extends Controller
{
    public function index()
    {
        return Session::all();
    }

    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|unique:sessions',
        ]);

        return Session::create($request->all());
    }

    public function update(Request $request, $id)
    {
        $session = Session::findOrFail($id);
        $session->update($request->all());
        return $session;
    }

    public function destroy($id)
    {
        Session::destroy($id);
        return response()->noContent();
    }
}
