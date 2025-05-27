<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\Echange;

class ExchangeOutcomeMail extends Mailable
{
    use Queueable, SerializesModels;

    public $echange;
    public $outcomeStatus; // 'approved' or 'refused'

    /**
     * Create a new message instance.
     */
    public function __construct(Echange $echange, string $outcomeStatus)
    {
        $this->echange = $echange;
        $this->outcomeStatus = $outcomeStatus;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = 'Your Exchange Proposal Was ' . ucfirst($this->outcomeStatus);
        return new Envelope(
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.exchange_outcome',
            with: [
                'echange' => $this->echange,
                'outcomeStatus' => $this->outcomeStatus,
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
