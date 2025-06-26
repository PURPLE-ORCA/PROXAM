<?php

namespace App\Imports;

use App\Models\Professeur;
use App\Models\User;
use App\Models\Service;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Validator; // <-- IMPORTANT
use Illuminate\Support\Str;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithStartRow;
use Illuminate\Validation\Rule;

class ProfesseursImport implements ToCollection, WithStartRow
{
    public array $errors = []; // To store validation failures

    public function startRow(): int
    {
        return 2;
    }

    public function collection(Collection $rows)
    {
        $rowIndex = $this->startRow(); // Start row index for error reporting

        foreach ($rows as $row) {
            // THE MOST IMPORTANT CHECK: If the row is empty, skip it entirely.
            if (empty(array_filter($row->toArray()))) {
                $rowIndex++;
                continue;
            }

            // --- MANUAL VALIDATION ---
            $validator = Validator::make($row->toArray(), [
                '1' => 'required|string|max:255', // Nom
                '2' => 'required|string|max:255', // Prénom
                '3' => ['required', 'email', 'max:255', Rule::unique('users', 'email')],
                '4' => 'required|string', // Cadre
                '5' => 'required|string|max:255', // Spécialité
                '6' => ['required', 'string', Rule::exists('services', 'nom')],
                '7' => 'required|integer', // Date recrutement
            ], $this->customValidationMessages());

            if ($validator->fails()) {
                foreach ($validator->errors()->all() as $error) {
                    $this->errors[] = "Row {$rowIndex}: {$error}";
                }
                $rowIndex++;
                continue; // Skip to the next row
            }

            // If validation passes, process the row
            $this->processRow($row->toArray());
            $rowIndex++;
        }
    }

    private function processRow(array $row): void
    {
        DB::transaction(function () use ($row) {
            $lastName = $row[1];
            $firstName = $row[2];
            $email = $row[3];
            $rankSystem = $this->mapRank($row[4]);
            $specialty = $row[5];
            $service = Service::where('nom', trim($row[6]))->first();
            $recruitmentDate = $row[7];
            $isChefService = false;

            // 1. Create the User.
            $createdUser = User::create([
                'name'     => $firstName . ' ' . $lastName,
                'email'    => $email,
                'password' => Hash::make(Str::random(16)),
                'role'     => $isChefService ? 'chef_service' : 'professeur',
            ]);

            // --- THIS IS THE UGLY, BUT NECESSARY FIX ---
            // 2. Immediately re-fetch the user from the database by their email.
            // This guarantees we have a clean, persisted model with a valid ID.
            $user = User::where('email', $email)->firstOrFail();
            // --- END OF FIX ---
            
            // 3. Now create the Professor with the guaranteed user ID.
            Professeur::create([
                'user_id'          => $user->id, // This CANNOT be null now.
                'nom'              => $lastName,
                'prenom'           => $firstName,
                'rang'             => $rankSystem,
                'statut'           => 'Active',
                'is_chef_service'  => $isChefService,
                'date_recrutement' => \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($recruitmentDate),
                'specialite'       => $specialty,
                'service_id'       => $service->id,
            ]);

            // 4. Send the activation email.
            Password::broker()->sendResetLink(['email' => $user->email]);
        });
    }

    private function mapRank(?string $frenchRank): ?string
    {
        if (is_null($frenchRank)) {
            return null;
        }
        
        $rankMap = [
            'maitre de conference' => 'PA',
            'professeur agrege' => 'PAG',
            'professeur de l enseignement superieur' => 'PES',
        ];

        // This is a more aggressive normalization. It strips accents, apostrophes,
        // extra spaces, and makes it all lowercase. It is EXTREMELY robust.
        $normalizedRank = strtolower(trim($frenchRank));
        $normalizedRank = str_replace("'", " ", $normalizedRank); // remove apostrophes
        $normalizedRank = iconv('UTF-8', 'ASCII//TRANSLIT', $normalizedRank); // remove accents
        $normalizedRank = preg_replace('/[^a-z0-9\s]/', '', $normalizedRank); // remove anything not a letter/number/space
        $normalizedRank = preg_replace('/\s+/', ' ', $normalizedRank); // collapse multiple spaces

        return $rankMap[$normalizedRank] ?? null;
    }

    public function customValidationMessages(): array
    {
        return [
            '1.required' => 'Last name in Column B is required.',
            '2.required' => 'First name in Column C is required.',
            '3.required' => 'Email in Column D is required.',
            '3.email' => 'Email in Column D must be a valid email address.',
            '3.unique' => 'A user with this email in Column D already exists.',
            '4.required' => 'Rank in Column E is required.',
            '5.required' => 'Specialty in Column F is required.',
            '6.required' => 'Department in Column G is required.',
            '6.exists' => 'The specified department in Column G does not exist.',
            '7.required' => 'Recruitment date in Column H is required.',
            '7.integer' => 'The recruitment date in Column H must be a valid date format (Excel integer).',
        ];
    }

    // New helper to get errors
    public function getErrors(): array
    {
        return $this->errors;
    }
}
