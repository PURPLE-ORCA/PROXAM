<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\ProfesseursImport;
use App\Exports\ProfesseurTemplateExport;
use Maatwebsite\Excel\Validators\ValidationException;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ProfesseurImportController extends Controller
{
public function store(Request $request)
{
    $request->validate([
        'professeurs_file' => 'required|file|mimes:xlsx,xls,csv',
    ]);

    $import = new ProfesseursImport; // Instantiate our class

    try {
        Excel::import($import, $request->file('professeurs_file'));

        // Check for our custom validation errors after import
        $failures = $import->getErrors();
        if (!empty($failures)) {
            $errorMessage = 'Import failed with validation errors: ' . implode('; ', $failures);
            return redirect()->back()->with('error', $errorMessage);
        }

        return redirect()->route('admin.professeurs.index')->with('success', 'Professors imported successfully!');

    } catch (\Exception $e) {
        // This will now only catch truly unexpected database errors
        Log::error('Professor import failed: ' . $e->getMessage());
        return redirect()->back()->with('error', 'An unexpected error occurred. Please check the log file.');
    }

    public function downloadTemplate()
    {
        return Excel::download(new ProfesseurTemplateExport, 'professeur_template.xlsx');
    }
}
}
