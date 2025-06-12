<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\ProfesseursImport;
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

        try {
            Excel::import(new ProfesseursImport, $request->file('professeurs_file'));

            return redirect()->route('admin.professeurs.index')->with('success', 'Professors imported successfully!');

        } catch (ValidationException $e) {
            $failures = $e->failures();
            $errorMessages = [];

            foreach ($failures as $failure) {
                $row = $failure->row();
                $attribute = $failure->attribute();
                $errors = implode(', ', $failure->errors());
                $errorMessages[] = "Row {$row}, Column '{$attribute}': {$errors}";
            }

            return redirect()->back()->with('error', 'Import failed due to validation errors: ' . implode('; ', $errorMessages));

        } catch (\Exception $e) {
            Log::error('Professor import failed: ' . $e->getMessage(), ['exception' => $e]);
            return redirect()->back()->with('error', 'An unexpected error occurred during import. Please try again or contact support.');
        }
    }
}
