<?php

namespace App\Imports;

use App\Models\Professeur;
use App\Models\User;
use App\Models\Service;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Password;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Illuminate\Validation\Rule;

class ProfesseursImport implements ToModel, WithHeadingRow, WithValidation, WithBatchInserts
{
    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        // Convert column names to snake_case for consistency with database fields
        $newRow = [];
        foreach ($row as $key => $value) {
            $newRow[Str::snake($key)] = $value;
        }
        $row = $newRow;

        // Find the Service ID based on the service name
        $service = Service::where('nom', $row['service'])->first();

        if (!$service) {
            // If service not found, skip this row with a warning (handled by validation)
            return null;
        }

        // Check if a User with the provided email already exists
        $existingUser = User::where('email', $row['email'])->first();

        if ($existingUser) {
            // If user already exists, skip this row with a warning (handled by validation)
            return null;
        }

        return DB::transaction(function () use ($row, $service) {
            $isChefService = (strtolower($row['chef_de_service']) === 'oui');
            $role = $isChefService ? 'chef_service' : 'professeur';

            // Generate a temporary password
            $temporaryPassword = Str::random(10);

            $user = User::create([
                'name' => $row['prenom'] . ' ' . $row['nom'],
                'email' => $row['email'],
                'password' => Hash::make($temporaryPassword),
                'role' => $role,
            ]);

            // Trigger password activation email
            Password::broker()->sendResetLink(['email' => $user->email]);

            return new Professeur([
                'user_id' => $user->id,
                'nom' => $row['nom'],
                'prenom' => $row['prenom'],
                'rang' => $row['grade'], // maps to rang
                'statut' => 'Active', // Default status
                'is_chef_service' => $isChefService,
                'date_recrutement' => \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($row['recrutement']),
                'specialite' => $row['specialite'],
                'service_id' => $service->id,
            ]);
        });
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
                Rule::unique('users', 'email'),
            ],
            'service' => [
                'required',
                'string',
                Rule::exists('services', 'nom'),
            ],
            'grade' => [
                'required',
                'string',
                Rule::in(Professeur::getRangs(true)), // Use the static method to get raw keys
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

    public function batchSize(): int
    {
        return 100;
    }
}
