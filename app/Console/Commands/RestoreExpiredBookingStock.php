<?php

namespace App\Console\Commands;

use App\Mail\BookingExpiredMail;
use App\Models\OrderItem;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class RestoreExpiredBookingStock extends Command
{
    protected $signature = 'booking:restore-stock';
    protected $description = 'Restore stock for expired bookings (coworking space)';

    public function handle()
    {
        $this->info('Checking for expired bookings...');

        // Step 1: Send expiry email once when booking ends.
        // Window: booking_end_at <= now (expired) AND booking_end_at > now - 10min (still in tolerance).
        // Using cache lock per item to prevent duplicate sends if scheduler runs multiple times.
        $justExpiredItems = OrderItem::where('stock_reduced', true)
            ->where('stock_restored', false)
            ->whereNotNull('booking_end_at')
            ->where('booking_end_at', '<=', now())
            ->where('booking_end_at', '>', now()->subMinutes(10))
            ->with(['product', 'order'])
            ->get();

        foreach ($justExpiredItems as $item) {
            $isBookingProduct = $item->product &&
                in_array($item->product->product_type, ['share_desk', 'private_room', 'private_office', 'virtual_office']);

            if (!$isBookingProduct || !$item->order || !$item->order->customer_email) {
                continue;
            }

            $cacheKey = "booking_expiry_email_sent_{$item->id}";
            if (\Illuminate\Support\Facades\Cache::has($cacheKey)) {
                continue; // Already sent, skip
            }

            try {
                Mail::to($item->order->customer_email)
                    ->send(new BookingExpiredMail($item));

                // Mark as sent for 15 minutes so duplicate runs don't resend
                \Illuminate\Support\Facades\Cache::put($cacheKey, true, now()->addMinutes(15));

                Log::info("Booking expiry email sent to {$item->order->customer_email} for OrderItem #{$item->id}");
            } catch (\Exception $e) {
                Log::error("Failed to send booking expiry email for OrderItem #{$item->id}: " . $e->getMessage());
            }
        }

        // Step 2: Restore stock after the 10-minute tolerance window has passed.
        $expiredItems = OrderItem::where('stock_reduced', true)
            ->where('stock_restored', false)
            ->whereNotNull('booking_end_at')
            ->where('booking_end_at', '<', now()->subMinutes(10))
            ->with(['productVariant', 'product', 'order'])
            ->get();

        if ($expiredItems->isEmpty()) {
            $this->info('No expired bookings ready for stock restore.');
            return 0;
        }

        $this->info("Found {$expiredItems->count()} expired booking(s) to restore.");

        $restoredCount = 0;

        DB::transaction(function () use ($expiredItems, &$restoredCount) {
            foreach ($expiredItems as $item) {
                $isBookingProduct = $item->product &&
                    in_array($item->product->product_type, ['share_desk', 'private_room', 'private_office', 'virtual_office']);

                if ($isBookingProduct) {
                    $item->update(['stock_restored' => true]);
                    $restoredCount++;

                    Log::info("Booking expired for OrderItem #{$item->id} (no global stock change)", [
                        'order_id' => $item->order_id,
                        'variant_id' => $item->variant_id,
                        'quantity' => $item->quantity,
                        'booking_end_at' => $item->booking_end_at,
                    ]);
                } elseif ($item->productVariant) {
                    $item->productVariant->incrementStock($item->quantity);
                    $item->update(['stock_restored' => true]);
                    $restoredCount++;

                    Log::info("Stock restored for OrderItem #{$item->id}", [
                        'order_id' => $item->order_id,
                        'variant_id' => $item->variant_id,
                        'quantity' => $item->quantity,
                        'booking_end_at' => $item->booking_end_at,
                    ]);
                }
            }
        });

        $this->info("Restored stock for {$restoredCount} booking(s).");

        return 0;
    }
}
