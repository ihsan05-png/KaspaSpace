<?php

namespace App\Http\Controllers;

use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use Carbon\Carbon;
use Illuminate\Http\Request;

class RoomScheduleController extends Controller
{
    /**
     * Get room availability schedule - Front Desk Panel style
     * 100% synced from database - no hardcoded values
     * Changes by admin in dashboard will reflect automatically
     */
    public function getSchedule(Request $request)
    {
        // Accept date parameter, default to today
        $dateInput = $request->input('date', Carbon::today()->format('Y-m-d'));
        $date = Carbon::parse($dateInput);
        $dateStr = $date->format('Y-m-d');
        $displayDate = $date->format('j M Y');
        $isToday = $date->isToday();

        // Get all coworking products with variants from database
        $products = Product::whereIn('product_type', ['share_desk', 'private_room', 'private_office', 'virtual_office'])
            ->where('is_active', true)
            ->with(['variants' => function ($q) {
                $q->where('is_active', true)->orderBy('sort_order');
            }])
            ->orderBy('sort_order')
            ->get();

        $schedule = [];

        // =====================================================
        // MEETING ROOM SECTION (Share Desk & Private Room)
        // Stock synced from database ProductVariant.stock_quantity
        // =====================================================
        $shareDesk = $products->where('product_type', 'share_desk')->first();
        $privateRoom = $products->where('product_type', 'private_room')->first();

        if ($shareDesk || $privateRoom) {
            $meetingRoomItems = [];

            // Check if Private Room is booked (blocks all share desks)
            $privateRoomBooked = false;
            $privateRoomBooking = null;

            if ($privateRoom) {
                $privateRoomBooking = $this->getActiveBooking($privateRoom->id, null, $dateStr);
                $privateRoomBooked = $privateRoomBooking !== null;
            }

            // Check if any Share Desk is booked (blocks private room)
            $shareDeskBooked = false;
            $shareDeskBooking = null;
            $bookedDesks = 0;

            if ($shareDesk) {
                $bookedDesks = $this->getBookedCount($shareDesk->id, $dateStr);
                $shareDeskBooked = $bookedDesks > 0;
                if ($shareDeskBooked) {
                    $shareDeskBooking = $this->getActiveBooking($shareDesk->id, null, $dateStr);
                }
            }

            // Share Desk - stock from database
            if ($shareDesk) {
                $totalDesks = $this->getTotalStockFromDatabase($shareDesk);

                if ($privateRoomBooked) {
                    // All desks blocked when private room is booked
                    $meetingRoomItems[] = [
                        'sub_type' => $shareDesk->title,
                        'capacity' => "0/{$totalDesks} meja",
                        'occupancy' => 'FULL',
                        'inv' => $privateRoomBooking->order->order_number ?? '-',
                        'check_in' => $privateRoomBooking->booking_start_at ? Carbon::parse($privateRoomBooking->booking_start_at)->format('g:iA') : '',
                        'check_out' => $privateRoomBooking->booking_end_at ? Carbon::parse($privateRoomBooking->booking_end_at)->format('g:iA') : '',
                    ];
                } else {
                    $availableDesks = max(0, $totalDesks - $bookedDesks);

                    $meetingRoomItems[] = [
                        'sub_type' => $shareDesk->title,
                        'capacity' => "{$availableDesks}/{$totalDesks} meja",
                        'occupancy' => $availableDesks > 0 ? 'AVAILABLE' : 'FULL',
                        'inv' => $shareDeskBooking ? ($shareDeskBooking->order->order_number ?? '-') : '-',
                        'check_in' => $shareDeskBooking && $shareDeskBooking->booking_start_at ? Carbon::parse($shareDeskBooking->booking_start_at)->format('g:iA') : '',
                        'check_out' => $shareDeskBooking && $shareDeskBooking->booking_end_at ? Carbon::parse($shareDeskBooking->booking_end_at)->format('g:iA') : '',
                    ];
                }
            }

            // Private Room - stock from database
            // FULL if private room is booked OR if any share desk is booked (same physical room)
            if ($privateRoom) {
                $totalPrivateRooms = $this->getTotalStockFromDatabase($privateRoom);
                $roomBlocked = $privateRoomBooked || $shareDeskBooked;

                // Determine which booking to show info from
                $displayBooking = $privateRoomBooking ?? $shareDeskBooking;

                $meetingRoomItems[] = [
                    'sub_type' => $privateRoom->title,
                    'capacity' => $roomBlocked ? "0/{$totalPrivateRooms} ruangan" : "{$totalPrivateRooms}/{$totalPrivateRooms} ruangan",
                    'occupancy' => $roomBlocked ? 'FULL' : 'AVAILABLE',
                    'inv' => $displayBooking ? ($displayBooking->order->order_number ?? '-') : '-',
                    'check_in' => $displayBooking && $displayBooking->booking_start_at ? Carbon::parse($displayBooking->booking_start_at)->format('g:iA') : '',
                    'check_out' => $displayBooking && $displayBooking->booking_end_at ? Carbon::parse($displayBooking->booking_end_at)->format('g:iA') : '',
                ];
            }

            $schedule[] = [
                'room' => 'Meeting Room',
                'date' => $displayDate,
                'type' => 'Coworking',
                'items' => $meetingRoomItems,
            ];
        }

        // =====================================================
        // PRIVATE OFFICE SECTION
        // Total rooms from database - SHARED across ALL variants
        // Variants (4 pax / 6 pax / 8 pax) are capacity options only
        // All bookings draw from the same pool
        // =====================================================
        $privateOfficeProducts = $products->where('product_type', 'private_office');

        foreach ($privateOfficeProducts as $product) {
            $totalRooms = $this->getTotalStockFromDatabase($product);
            $officeItems = [];

            // Get all active bookings (any variant)
            $bookings = $this->getAllActiveBookings($product->id, $dateStr);

            // Build booked rooms list with details
            $bookedRooms = [];
            foreach ($bookings as $booking) {
                for ($q = 0; $q < $booking->quantity; $q++) {
                    $bookedRooms[] = [
                        'inv' => $booking->order->order_number ?? '-',
                        'variant' => $booking->variant_name ?? ($booking->productVariant->name ?? '-'),
                        'check_in' => $booking->booking_start_at ? Carbon::parse($booking->booking_start_at)->format('j M Y') : '-',
                        'check_out' => $booking->booking_end_at ? Carbon::parse($booking->booking_end_at)->format('j M Y') : '-',
                    ];
                }
            }

            // Generate room list based on database stock
            for ($i = 1; $i <= $totalRooms; $i++) {
                $roomIndex = $i - 1;
                $isBooked = isset($bookedRooms[$roomIndex]);

                if ($isBooked) {
                    $roomData = $bookedRooms[$roomIndex];
                    $officeItems[] = [
                        'sub_type' => "Room {$i}",
                        'capacity' => $roomData['variant'],
                        'occupancy' => 'FULL',
                        'inv' => $roomData['inv'],
                        'check_in' => $roomData['check_in'],
                        'check_out' => $roomData['check_out'],
                    ];
                } else {
                    $officeItems[] = [
                        'sub_type' => "Room {$i}",
                        'capacity' => '-',
                        'occupancy' => 'AVAILABLE',
                        'inv' => '-',
                        'check_in' => '',
                        'check_out' => '',
                    ];
                }
            }

            $schedule[] = [
                'room' => "Room 1 - {$totalRooms}",
                'date' => $displayDate,
                'type' => $product->title, // From database
                'items' => $officeItems,
            ];
        }

        // Virtual Office is excluded - it's a service package, not physical room

        return response()->json([
            'success' => true,
            'schedule' => $schedule,
            'date' => $displayDate,
            'date_raw' => $dateStr,
            'is_today' => $isToday,
            'generated_at' => now()->toIso8601String(),
        ]);
    }

    /**
     * Get total stock from database
     * Reads ProductVariant.stock_quantity - synced with admin dashboard
     */
    private function getTotalStockFromDatabase(Product $product): int
    {
        $firstVariant = $product->variants->first();

        if ($firstVariant && $firstVariant->stock_quantity !== null) {
            return (int) $firstVariant->stock_quantity;
        }

        // Fallback only if no variant or null stock (should not happen if properly set)
        return 1;
    }

    /**
     * Get active booking for a product on a specific date
     * Today: real-time check (now)
     * Other dates: check full day overlap
     */
    private function getActiveBooking(int $productId, ?int $variantId, string $date)
    {
        $targetDate = Carbon::parse($date);
        $isToday = $targetDate->isToday();

        $query = OrderItem::with('order')
            ->whereHas('product', fn($q) => $q->where('id', $productId))
            ->whereHas('order', fn($q) => $q->whereNotIn('status', ['cancelled']))
            ->where('stock_reduced', true)
            ->where('stock_restored', false);

        if ($isToday) {
            // Today: show bookings that haven't ended yet (active + upcoming today)
            $now = Carbon::now();
            $endOfDay = $targetDate->copy()->endOfDay();
            $query->where('booking_start_at', '<=', $endOfDay)
                  ->where(function ($q) use ($now) {
                      $q->where('booking_end_at', '>', $now)
                        ->orWhereNull('booking_end_at');
                  });
        } else {
            // Other dates: any booking that overlaps with that day
            // Use >= so checkout date (e.g. 5 Mar 00:00) still counts on 5 Mar
            $startOfDay = $targetDate->copy()->startOfDay();
            $endOfDay = $targetDate->copy()->endOfDay();
            $query->where('booking_start_at', '<=', $endOfDay)
                  ->where(function ($q) use ($startOfDay) {
                      $q->where('booking_end_at', '>=', $startOfDay)
                        ->orWhereNull('booking_end_at');
                  });
        }

        if ($variantId) {
            $query->where('variant_id', $variantId);
        }

        // For today: prioritize currently active booking, then upcoming
        return $query->orderBy('booking_start_at', 'asc')->first();
    }

    /**
     * Get all active bookings for a product on a specific date
     */
    private function getAllActiveBookings(int $productId, string $date)
    {
        $targetDate = Carbon::parse($date);
        $isToday = $targetDate->isToday();

        $query = OrderItem::with(['order', 'productVariant'])
            ->whereHas('product', fn($q) => $q->where('id', $productId))
            ->whereHas('order', fn($q) => $q->whereNotIn('status', ['cancelled']))
            ->where('stock_reduced', true)
            ->where('stock_restored', false);

        if ($isToday) {
            // Today: bookings that haven't ended yet (active + upcoming)
            $now = Carbon::now();
            $endOfDay = $targetDate->copy()->endOfDay();
            $query->where('booking_start_at', '<=', $endOfDay)
                  ->where(function ($q) use ($now) {
                      $q->where('booking_end_at', '>', $now)
                        ->orWhereNull('booking_end_at');
                  });
        } else {
            $startOfDay = $targetDate->copy()->startOfDay();
            $endOfDay = $targetDate->copy()->endOfDay();
            $query->where('booking_start_at', '<=', $endOfDay)
                  ->where(function ($q) use ($startOfDay) {
                      $q->where('booking_end_at', '>=', $startOfDay)
                        ->orWhereNull('booking_end_at');
                  });
        }

        return $query->orderBy('booking_start_at', 'asc')->get();
    }

    /**
     * Get booked count for a product on a specific date
     */
    private function getBookedCount(int $productId, string $date): int
    {
        $targetDate = Carbon::parse($date);
        $isToday = $targetDate->isToday();

        $query = OrderItem::whereHas('product', fn($q) => $q->where('id', $productId))
            ->whereHas('order', fn($q) => $q->whereNotIn('status', ['cancelled']))
            ->where('stock_reduced', true)
            ->where('stock_restored', false);

        if ($isToday) {
            // Today: count bookings that haven't ended yet (active + upcoming)
            $now = Carbon::now();
            $endOfDay = $targetDate->copy()->endOfDay();
            $query->where('booking_start_at', '<=', $endOfDay)
                  ->where('booking_end_at', '>', $now);
        } else {
            $startOfDay = $targetDate->copy()->startOfDay();
            $endOfDay = $targetDate->copy()->endOfDay();
            $query->where('booking_start_at', '<=', $endOfDay)
                  ->where('booking_end_at', '>=', $startOfDay);
        }

        return (int) $query->sum('quantity');
    }

    /**
     * Get summary of today's availability
     */
    public function getTodaySummary()
    {
        $today = Carbon::today()->format('Y-m-d');

        $products = Product::whereIn('product_type', ['share_desk', 'private_room', 'private_office'])
            ->where('is_active', true)
            ->with(['variants' => function ($q) {
                $q->where('is_active', true)->orderBy('sort_order');
            }])
            ->orderBy('sort_order')
            ->get();

        $summary = [];

        foreach ($products as $product) {
            $totalStock = $this->getTotalStockFromDatabase($product);
            $bookedCount = $this->getBookedCount($product->id, $today);
            $availableCount = max(0, $totalStock - $bookedCount);

            $summary[] = [
                'product_id' => $product->id,
                'room' => $product->title,
                'product_type' => $product->product_type,
                'total_stock' => $totalStock,
                'booked' => $bookedCount,
                'available' => $availableCount,
                'occupancy' => $availableCount > 0 ? 'AVAILABLE' : 'FULL',
            ];
        }

        return response()->json([
            'success' => true,
            'date' => Carbon::today()->locale('id')->isoFormat('dddd, D MMMM YYYY'),
            'summary' => $summary,
            'generated_at' => now()->toIso8601String(),
        ]);
    }
}
