<?php

namespace App\Console\Commands;

use App\Models\OrderItem;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RestoreExpiredBookingStock extends Command
{
    protected $signature = 'booking:restore-stock';
    protected $description = 'Restore stock for expired bookings (coworking space)';

    public function handle()
    {
        $this->info('Checking for expired bookings...');

        // Find order items where:
        // - booking_end_at has passed
        // - stock_reduced is true
        // - stock_restored is false
        $expiredItems = OrderItem::where('stock_reduced', true)
            ->where('stock_restored', false)
            ->whereNotNull('booking_end_at')
            ->where('booking_end_at', '<=', now())
            ->with(['productVariant', 'product'])
            ->get();

        if ($expiredItems->isEmpty()) {
            $this->info('No expired bookings found.');
            return 0;
        }

        $this->info("Found {$expiredItems->count()} expired booking(s).");

        $restoredCount = 0;

        DB::transaction(function () use ($expiredItems, &$restoredCount) {
            foreach ($expiredItems as $item) {
                // Check if this is a booking product
                $isBookingProduct = $item->product &&
                    in_array($item->product->product_type, ['share_desk', 'private_room', 'private_office', 'virtual_office']);

                if ($isBookingProduct) {
                    // Booking products: only flip the flag so time-slot queries exclude this booking.
                    // No global stock_quantity to restore.
                    $item->update(['stock_restored' => true]);
                    $restoredCount++;

                    Log::info("Booking expired for OrderItem #{$item->id} (no global stock change)", [
                        'order_id' => $item->order_id,
                        'variant_id' => $item->variant_id,
                        'quantity' => $item->quantity,
                        'booking_end_at' => $item->booking_end_at,
                    ]);
                } elseif ($item->productVariant) {
                    // Non-booking products: restore global stock as before
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
