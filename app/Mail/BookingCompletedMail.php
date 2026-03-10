<?php

namespace App\Mail;

use App\Models\OrderItem;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BookingCompletedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public OrderItem $item
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Booking Anda Telah Selesai - Kaspa Space',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.booking-expired',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
