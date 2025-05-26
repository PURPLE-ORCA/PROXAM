<?php

namespace App\Jobs;

use App\Mail\ProfessorAssignmentScheduleMail;
use App\Models\Attribution;
use App\Models\Professeur;
use App\Models\Seson;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Barryvdh\DomPDF\Facade\Pdf; // Import the facade

class SendProfessorScheduleNotifications implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(public Seson $seson)
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            Log::info("Starting SendProfessorScheduleNotifications job for Seson ID: {$this->seson->id}");

            // Retrieve unique professors with assignments for this Seson
            $professorIds = Attribution::whereHas('examen', fn($q) => $q->where('seson_id', $this->seson->id))
                                       ->distinct()
                                       ->pluck('professeur_id');

            /** @var \App\Models\Seson $seson */
            // Load Seson with relations needed for PDF text
            // Seson has a direct anneeUni relationship, and hasMany quadrimestres.
            // The original eager load 'quadrimestre.anneeUni' was incorrect for Seson.
            $seson = Seson::with('anneeUni')->find($this->seson->id);

            // Check if seson or its direct anneeUni relation is null before proceeding
            // Seson hasMany Quadrimestres, so $seson->quadrimestre (singular) is incorrect.
            if (!$seson || !$seson->anneeUni) {
                Log::error("Seson or AnneeUni relation missing for Seson ID: {$this->seson->id}. Cannot generate PDF.");
                // Optionally, throw an exception to mark the job as failed
                throw new \Exception("Missing Seson or AnneeUni relations for PDF generation.");
            }

            // Prepare logo base64
            $logoBase64 = '';
            $logoPath = public_path('images/pdf/faculty_logo.png');
            if (file_exists($logoPath)) {
                $type = pathinfo($logoPath, PATHINFO_EXTENSION);
                $imgData = file_get_contents($logoPath);
                $logoBase64 = 'data:image/' . $type . ';base64,' . base64_encode($imgData);
            } else {
                Log::warning("Faculty logo not found at: {$logoPath}. PDF will be generated without logo.");
            }

            foreach ($professorIds as $professeurId) {
                try {
                    /** @var \App\Models\Professeur $professor */
                    $professor = Professeur::with('user')->find($professeurId);

                    if (!$professor || !$professor->user || !$professor->user->email) {
                        Log::warning("Skipping notification for professor ID {$professeurId}: User or email not found.");
                        continue;
                    }

                    // Fetch assignments for this professor in this session
                    $assignments = Attribution::with(['examen.module', 'salle'])
                                              ->where('professeur_id', $professor->id)
                                              ->whereHas('examen', fn($q) => $q->where('seson_id', $this->seson->id))
                                              ->get();

                    $dataForPdfView = [
                        'professor' => $professor,
                        'seson' => $seson,
                        // Pass the first quadrimestre if available, as Seson hasMany Quadrimestres
                        'quadrimestre' => $seson->quadrimestres->first(),
                        'anneeUn' => $seson->anneeUni, // Direct access to AnneeUni from Seson
                        'assignments' => $assignments,
                        'generationDate' => now(),
                        'logoBase64' => $logoBase64,
                    ];

                    // Generate PDF
                    $pdf = Pdf::loadView('pdfs.professor_session_schedule', $dataForPdfView);
                    $pdfOutput = $pdf->output(); // Get raw PDF string from dompdf

                    Log::info("DOMPDF Output - Type: " . gettype($pdfOutput));
                    Log::info("DOMPDF Output - Length: " . strlen($pdfOutput));
                    Log::info("DOMPDF Output - First 100 chars: " . substr($pdfOutput, 0, 100));
                    Log::info("DOMPDF Output - Last 100 chars: " . substr($pdfOutput, -100));

                    // Save it to a file FOR EVERY PROFESSOR to inspect individually
                    $tempFilename = 'generated_schedule_prof_' . $professor->id . '_seson_' . $this->seson->id . '_' . time() . '.pdf';
                    $tempPdfPath = storage_path('app/temp_pdfs/' . $tempFilename); // Create a 'temp_pdfs' directory in storage/app

                    // Ensure the directory exists
                    if (!is_dir(storage_path('app/temp_pdfs'))) {
                        mkdir(storage_path('app/temp_pdfs'), 0755, true);
                    }

                    $bytesWritten = file_put_contents($tempPdfPath, $pdfOutput);
                    if ($bytesWritten === false) {
                        Log::error("Failed to write temporary PDF to: " . $tempPdfPath);
                    } else {
                        Log::info("Successfully wrote temporary PDF ({$bytesWritten} bytes) to: " . $tempPdfPath);
                    }

                    // CONTINUE with passing $pdfOutput to your Mailable and sending
                    Mail::to($professor->user->email)->send(new ProfessorAssignmentScheduleMail(
                        $professor, // Should be a model, not a collection
                        $pdfOutput,
                        $seson // Should be a model, not a collection
                    ));

                    Log::info("Notification sent to {$professor->user->email} for Seson ID: {$this->seson->id}");

                    // Add a small delay to avoid overwhelming mail server
                    sleep(1);

                } catch (\Exception $e) {
                    Log::error("Failed to send notification for professor ID {$professeurId} in Seson ID {$this->seson->id}: " . $e->getMessage());
                }
            }

            $this->seson->update(['notifications_sent_at' => now()]);
            Log::info("Finished SendProfessorScheduleNotifications job for Seson ID: {$this->seson->id}");

        } catch (\Exception $e) {
            Log::error("SendProfessorScheduleNotifications job failed for Seson ID: {$this->seson->id}. Error: " . $e->getMessage());
            // Re-throw the exception to mark the job as failed in the queue system
            throw $e;
        }
    }
}
