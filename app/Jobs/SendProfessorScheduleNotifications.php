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
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Barryvdh\DomPDF\Facade\Pdf;

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

            // --- START: Debugging Logs (Seson/AnneeUni/Quadrimestre) ---
            // Log::info("Seson ID for email: {$this->seson->id}");
            // Log::info("Seson Code for email: " . ($this->seson->code ?? 'SESON CODE IS NULL/EMPTY'));

            // // Ensure relations are loaded for the current $this->seson instance
            // $this->seson->loadMissing(['anneeUni', 'quadrimestres']);

            // Log::info("AnneeUni (annee) for Seson {$this->seson->id}: " . ($this->seson->anneeUni ? $this->seson->anneeUni->annee : 'ANNEEUNI IS NULL or anneeUni->annee is null'));
            // if ($this->seson->anneeUni) {
            //     Log::info("AnneeUni ID: " . $this->seson->anneeUni->id);
            // }

            // Log::info("Quadrimestres count for Seson {$this->seson->id}: " . $this->seson->quadrimestres->count());
            // if ($this->seson->quadrimestres->isNotEmpty()) {
            //     Log::info("First Quadrimestre Code for Seson {$this->seson->id}: " . ($this->seson->quadrimestres->first()->code ?? 'FIRST QUADRIMESTRE CODE IS NULL/EMPTY'));
            //     Log::info("First Quadrimestre ID: " . $this->seson->quadrimestres->first()->id);
            // } else {
            //     Log::info("No quadrimestres found for Seson {$this->seson->id}.");
            // }
            // --- END: Debugging Logs (Seson/AnneeUni/Quadrimestre) ---

            if (!$this->seson->anneeUni) { // Basic check
                Log::error("AnneeUni relation missing for Seson ID: {$this->seson->id}. Cannot generate email details.");
                throw new \Exception("Missing AnneeUni relation for email details.");
            }

            $professorIds = Attribution::whereHas('examen', fn($q) => $q->where('seson_id', $this->seson->id))
                                       ->distinct()
                                       ->pluck('professeur_id');

            // Optional: Keep PDF generation for archival or future use, but it's not sent
            $logoBase64 = ''; // (your logo logic can remain if desired)
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
                    // Ensure a single model is returned, even if find() somehow returns a collection
                    $professor = Professeur::with('user')->find($professeurId);
                    if ($professor instanceof \Illuminate\Database\Eloquent\Collection) {
                        $professor = $professor->first();
                    }

                    if (!$professor || !$professor->user || !$professor->user->email) {
                        Log::warning("Skipping notification for professor ID {$professeurId}: User or email not found.");
                        continue;
                    }

                    $assignments = Attribution::with(['examen.module', 'salle'])
                                              ->where('professeur_id', $professor->id)
                                              ->whereHas('examen', fn($q) => $q->where('seson_id', $this->seson->id))
                                              ->get();

                    // --- START: Optional PDF Generation (kept for future) ---
                    $dataForPdfView = [
                        'professor' => $professor,
                        'seson' => $this->seson,
                        'quadrimestre' => $this->seson->quadrimestres->first(),
                        'anneeUn' => $this->seson->anneeUni,
                        'assignments' => $assignments,
                        'generationDate' => now(),
                        'logoBase64' => $logoBase64,
                    ];
                    $pdf = Pdf::loadView('pdfs.professor_session_schedule', $dataForPdfView);
                    $pdfOutput = $pdf->output();

                    // --- SAVE THE PDF TO THE CORRECT, PERSISTENT LOCATION ---
                    // Define a clear, permanent path.
                    $persistentPdfPath = "convocations/{$this->seson->id}/Convocation - " . Str::slug($professor->prenom . ' ' . $professor->nom) . ".pdf";
                    
                    // Use Storage::put() to save the file. It automatically creates directories.
                    Storage::disk('local')->put($persistentPdfPath, $pdfOutput);
                    
                    Log::info("Saved persistent convocation PDF to: {$persistentPdfPath}");
                    // --- END OF NEW CODE ---

                    // --- START: Debugging Logs (Professor object) ---
                    // Log::info("Debugging Professor object before Mailable:");
                    // Log::info("professeurId: " . $professeurId);
                    // Log::info("Type of professor: " . gettype($professor));
                    // if ($professor instanceof \Illuminate\Database\Eloquent\Collection) {
                    //     Log::info("Professor is a Collection. Count: " . $professor->count());
                    // } elseif ($professor instanceof Professeur) {
                    //     Log::info("Professor is a Model. ID: " . $professor->id);
                    // } else {
                    //     Log::info("Professor is neither Collection nor Model.");
                    // }
                    // --- END: Debugging Logs (Professor object) ---

                    // Send the email with assignment details in the body
                    Mail::to($professor->user->email)->send(new ProfessorAssignmentScheduleMail(
                        $professor,
                        $this->seson, // Pass the main Seson object
                        $assignments  // Pass the collection of assignments
                    ));

                    Log::info("Plain text/HTML notification sent to {$professor->user->email} for Seson ID: {$this->seson->id}");
                    // sleep(1); // Re-enable if needed for rate limiting, but not for debugging

                } catch (\Exception $e) {
                    Log::error("Failed to send notification for professor ID {$professeurId} in Seson ID {$this->seson->id}: " . $e->getMessage());
                }
            }

            $this->seson->update(['notifications_sent_at' => now()]);
            Log::info("Finished SendProfessorScheduleNotifications job for Seson ID: {$this->seson->id}");

        } catch (\Exception $e) {
            Log::error("SendProfessorScheduleNotifications job failed for Seson ID: {$this->seson->id}. Error: " . $e->getMessage());
            throw $e;
        }
    }
}
