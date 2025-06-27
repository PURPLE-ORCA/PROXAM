<?php

namespace Tests\Feature;

use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Maatwebsite\Excel\Facades\Excel;
use Tests\TestCase;

class ProfessorImportTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private Service $service;

    public function setUp(): void
    {
        parent::setUp();
        // Create an admin user to perform the action
        $this->admin = User::factory()->create(['role' => 'admin']);
        // Create a valid service that our test file will reference
        $this->service = Service::factory()->create(['nom' => 'Chirurgie']);
    }

    /** @test */
    public function it_successfully_imports_a_valid_professor_from_an_excel_file()
    {
        $fileData = [
            ['P.P.R.', 'Nom', 'Prénom', 'email', 'Cadre', 'Spécialité Concours', 'Département', 'Date recrutement'],
            ['12345', 'Bennani', 'Ahmed', 'ahmed.bennani@test.com', 'Professeur de l\'Enseignement Supérieur', 'Traumatologie', 'Chirurgie', '40565'], // 40565 is Excel's int for 21/01/2011
        ];

        $file = UploadedFile::fake()->createWithContent('professeurs.xlsx', $this->createExcelContent($fileData));

        $this->actingAs($this->admin)
            ->post(route('admin.professeurs.import'), [
                'professeurs_file' => $file,
            ])
            ->assertRedirect(route('admin.professeurs.index'))
            ->assertSessionHas('success');

        $this->assertDatabaseHas('users', [
            'email' => 'ahmed.bennani@test.com',
            'role' => 'professeur',
        ]);

        $this->assertDatabaseHas('professeurs', [
            'nom' => 'Bennani',
            'prenom' => 'Ahmed',
            'rang' => 'PES',
            'service_id' => $this->service->id,
        ]);
    }

    /** @test */
    public function it_rejects_a_row_with_an_invalid_service_and_returns_an_error()
    {
        $fileData = [
            ['P.P.R.', 'Nom', 'Prénom', 'email', 'Cadre', 'Spécialité Concours', 'Département', 'Date recrutement'],
            ['12345', 'El Amrani', 'Mohammed', 'mohammed.elamrani@test.com', 'Maitre de conférence', 'Chimie', 'This Service Does Not Exist', '45568'],
        ];

        $file = UploadedFile::fake()->createWithContent('professeurs.xlsx', $this->createExcelContent($fileData));

        $this->actingAs($this->admin)
            ->post(route('admin.professeurs.import'), [
                'professeurs_file' => $file,
            ])
            ->assertRedirect()
            ->assertSessionHas('error');

        // Assert that NO user or professor was created
        $this->assertDatabaseMissing('users', ['email' => 'mohammed.elamrani@test.com']);
        $this->assertDatabaseCount('professeurs', 0);
    }

    /** @test */
    public function it_gracefully_skips_empty_rows_in_the_file()
    {
        $fileData = [
            ['P.P.R.', 'Nom', 'Prénom', 'email', 'Cadre', 'Spécialité Concours', 'Département', 'Date recrutement'],
            ['12345', 'Bennani', 'Ahmed', 'ahmed.bennani@test.com', 'Professeur de l\'Enseignement Supérieur', 'Traumatologie', 'Chirurgie', '40565'],
            [], // An empty row
            ['67890', 'El Alami', 'Youssef', 'youssef.elalami@test.com', 'Maitre de conférence', 'Médecine', 'Chirurgie', '45605'],
        ];

        $file = UploadedFile::fake()->createWithContent('professeurs.xlsx', $this->createExcelContent($fileData));

        $this->actingAs($this->admin)
            ->post(route('admin.professeurs.import'), [
                'professeurs_file' => $file,
            ])
            ->assertRedirect(route('admin.professeurs.index'))
            ->assertSessionHas('success');

        // Assert that exactly TWO professors were created, proving the empty row was skipped
        $this->assertDatabaseCount('professeurs', 2);
    }

    // Helper function to create Excel file content in memory
    private function createExcelContent(array $data): string
    {
        $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->fromArray($data, null, 'A1');
        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
        $stream = fopen('php://memory', 'r+');
        $writer->save($stream);
        rewind($stream);
        return stream_get_contents($stream);
    }
}
