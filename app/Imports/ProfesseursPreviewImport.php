<?php

namespace App\Imports;

use App\Models\Professeur;
use App\Models\Service;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class ProfesseursPreviewImport implements ToCollection, WithHeadingRow
{
    public $validRows = [];
    public $invalidRows = [];

    /**
     * @param Collection $rows
     */
    public function collection(Collection $rows)
    {
        foreach ($rows as $index => $row) {
            // Convert column names to snake_case for consistency with database fields
            $newRow = [];
            foreach ($row->toArray() as $key => $value) {
                $newRow[Str::snake($key)] = $value;
            }
            $row = new Collection($newRow);

            $validator = Validator::make($row->toArray(), $this->rules(), $this->customValidationMessages());

            if ($validator->fails()) {
                $this->invalidRows[] = [
                    'row_number' => $index + 2, // +2 because of 0-indexed collection and 1-indexed Excel rows with heading
                    'data' => $row->toArray(),
                    'errors' => $validator->errors()->all(),
                ];
            } else {
                // Additional checks not covered by simple rules (e.g., service existence, user email existence)
                $service = Service::where('nom', $row['service'])->first();
                if (!$service) {
                    $this->invalidRows[] = [
                        'row_number' => $index + 2,
                        'data' => $row->toArray(),
                        'errors' => ['The specified service does not exist.'],
                    ];
                    continue;
                }

                // Check if a User with the provided email already exists
                // This check is crucial for preview to show existing users as invalid
                if (\App\Models\User::where('email', $row['email'])->exists()) {
                    $this->invalidRows[] = [
                        'row_number' => $index + 2,
                        'data' => $row->toArray(),
                        'errors' => ['A user with this email already exists.'],
                    ];
                    continue;
                }

                $this->validRows[] = [
                    'row_number' => $index + 2,
                    'data' => $row->toArray(),
                ];
            }
        }
    }

    public function rules(): array
    {
        return [
            'prenom' => 'required|string|max:255',
            'nom' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                // Rule::unique('users', 'email'), // Removed for preview, handled manually in collection()
            ],
            'service' => [
                'required',
                'string',
                // Rule::exists('services', 'nom'), // Removed for preview, handled manually in collection()
            ],
            'grade' => [
                'required',
                'string',
                Rule::in(Professeur::getRangs(true)),
            ],
            'specialite' => 'required|string|max:255',
            'recrutement' => 'required|integer', // Excel dates are integers
            'chef_de_service' => [
                'required',
                'string',
                Rule::in(['oui', 'non']),
            ],
        ];
    }

    public function customValidationMessages()
    {
        return [
            'email.unique' => 'A user with this email already exists.',
            'service.exists' => 'The specified service does not exist.',
            'grade.in' => 'The grade must be one of the allowed values: ' . implode(', ', Professeur::getRangs(true)) . '.',
            'recrutement.integer' => 'The recruitment date must be a valid date format (Excel integer).',
            'chef_de_service.in' => 'The "chef_de_service" field must be "oui" or "non".',
        ];
    }
}
