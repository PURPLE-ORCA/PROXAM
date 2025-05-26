<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use App\Models\Professeur;
use App\Models\Seson;
use App\Models\Attribution; // Add this
use Illuminate\Support\Collection; // Add this
// use Illuminate\Mail\Mailables\Attachment; // Comment out or remove
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log; // Keep this for now, might be removed later if no logging is needed

class ProfessorAssignmentScheduleMail extends Mailable
{
    use Queueable, SerializesModels;

    // Change constructor to accept assignments instead of pdfContent/pdfPath
    public function __construct(
        public Professeur $professor,
        public Seson $seson, // Keep Seson for subject and general info
        public Collection $assignments // Collection of Attribution models
    ) {
        //
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Convocation aux Surveillances - Session ' . $this->seson->nom,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.professor.assignment_schedule',
            with: [
                // Use the correct attribute names from your database tables
                'sesonName' => $this->seson->code ?? '****', // Use 'code' for Seson
                'professorName' => $this->professor->nom_complet,
                'assignments' => $this->assignments,
                'quadrimestreName' => $this->seson->quadrimestres->first()?->code ?? 'N/A', // Use 'code' for Quadrimestre
                'anneeUniName' => $this->seson->anneeUni?->annee ?? 'N/A', // Use 'annee' for AnneeUni
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    // public function attachments(): array  // <<<< COMMENT OUT OR DELETE THIS ENTIRE METHOD
    // {
    //     // If using $this->pdfPath (from Attachment::fromPath strategy)
    //     // Log::info("MAILABLE ATTACHMENTS() - Attaching from path: " . $this->pdfPath);
    //     // if (!file_exists($this->pdfPath)) {
    //     //     Log::error("MAILABLE ATTACHMENTS(): PDF file not found at path: " . $this->pdfPath);
    //     //     return [];
    //     // }
    //     // return [
    //     //     Attachment::fromPath($this->pdfPath)
    //     //         ->as('Emploi_Du_Temps_Surveillances.pdf')
    //     //         ->withMime('application/pdf'),
    //     // ];

    //     // If using $this->pdfContent (from Attachment::fromData strategy)
    //     // Log::info("MAILABLE ATTACHMENTS() - PDF Content Length: " . strlen($this->pdfContent));
    //     // if (empty($this->pdfContent) || strlen($this->pdfContent) < 1000) {
    //     //     Log::error("MAILABLE ATTACHMENTS(): pdfContent is empty or too short!");
    //     //     return [];
    //     // }
    //     // return [
    //     //     Attachment::fromData(fn () => $this->pdfContent, 'Emploi_Du_Temps_Surveillances.pdf')
    //     //         ->withMime('application/pdf'),
    //     // ];
    // }
}
