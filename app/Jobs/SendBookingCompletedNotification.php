<?php

namespace App\Jobs;

use App\Mail\BookingCompletedMail;
use App\Models\OrderItem;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendBookingCompletedNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    public function __construct(
        public OrderItem $item
    ) {}

    public function handle(): void
    {
        // Reload relasi terbaru
        $this->item->load(['order', 'product']);

        if (!$this->item->order || !$this->item->order->customer_email) {
            Log::warning("SendBookingCompletedNotification: no email for OrderItem #{$this->item->id}");
            return;
        }

        // Hanya kirim untuk produk booking
        $isBookingProduct = $this->item->product &&
            in_array($this->item->product->product_type, [
                'share_desk', 'private_room', 'private_office', 'virtual_office'
            ]);

        if (!$isBookingProduct) {
            return;
        }

        Mail::to($this->item->order->customer_email)
            ->send(new BookingCompletedMail($this->item));

        Log::info("Booking completed email sent to {$this->item->order->customer_email} for OrderItem #{$this->item->id}");
    }

    public function failed(\Throwable $exception): void
    {
        Log::error("SendBookingCompletedNotification failed for OrderItem #{$this->item->id}: " . $exception->getMessage());
    }
}
