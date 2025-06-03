<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\Echange;

class ExchangeProposalReceivedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $echange;
    public $examNameForMessage; // Add this

    /**
     * Create a new message instance.
     */
    public function __construct(Echange $echange, string $examNameForMessage) // Add $examNameForMessage
    {
        $this->echange = $echange;
        $this->examNameForMessage = $examNameForMessage; // Assign it
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New Exchange Proposal for Your Exam Duty: ' . $this->examNameForMessage, // Use it in the subject
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.exchange_proposal_received',
            with: [
                'echange' => $this->echange,
                'examNameForMessage' => $this->examNameForMessage, // Pass it to the view
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
