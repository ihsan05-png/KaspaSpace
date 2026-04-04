<?php

namespace App\Http\Controllers;

use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Room;
use Carbon\Carbon;
use Illuminate\Http\Request;

class RoomScheduleController extends Controller
{
    /**
     * Get room availability schedule - Front Desk Panel style
     * Phase 1: Physical rooms from rooms table (with cross-product blocking)
     * Phase 2: Products not assigned to any room (backward compat, old logic)
     */
    public function getSchedule(Request $request)
    {
        $dateInput = $request->input('date', Carbon::today()->format('Y-m-d'));
        $date      = Carbon::parse($dateInput);
        $dateStr   = $date->format('Y-m-d');
        $displayDate = $date->format('j M Y');
        $isToday   = $date->isToday();

        $includeVirtual = (bool) $request->input('include_virtual', false);

        $bookingTypes = ['share_desk', 'private_room', 'private_office', 'meeting_room'];
        if ($includeVirtual) {
            $bookingTypes[] = 'virtual_office';
        }

        $schedule = [];
        $assignedProductIds = [];

        // =====================================================
        // PHASE 1: Physical rooms from rooms table
        // Admin assigns products → cross-blocking per room
        // =====================================================
        $physicalRooms = Room::where('is_active', true)
            ->with(['products' => function ($q) use ($bookingTypes) {
                $q->whereIn('product_type', $bookingTypes)
                  ->where('is_active', true)
                  ->with(['variants' => function ($vq) {
                      $vq->where('is_active', true)->orderBy('sort_order');
                  }]);
            }])
            ->orderBy('name')
            ->get();

        foreach ($physicalRooms as $physRoom) {
            if ($physRoom->products->isEmpty()) continue;

            foreach ($physRoom->products as $prod) {
                $assignedProductIds[] = $prod->id;
            }

            // Check if any exclusive booking exists in this room
            $exclusiveBooking = null;
            foreach ($physRoom->products as $prod) {
                if ($prod->product_type !== 'share_desk') {
                    $b = $this->getActiveBooking($prod->id, null, $dateStr, $physRoom->id);
                    if ($b) { $exclusiveBooking = $b; break; }
                }
            }

            // Check if any share_desk booking exists in this room
            $shareDeskBooked = false;
            foreach ($physRoom->products as $prod) {
                if ($prod->product_type === 'share_desk') {
                    if ($this->getBookedCount($prod->id, $dateStr, $physRoom->id) > 0) {
                        $shareDeskBooked = true;
                        break;
                    }
                }
            }

            $roomItems = [];

            foreach ($physRoom->products as $prod) {
                if ($prod->product_type === 'share_desk') {
                    $total = $this->getTotalStockFromDatabase($prod, $physRoom);

                    if ($exclusiveBooking) {
                        $roomItems[] = [
                            'sub_type'  => $prod->title,
                            'capacity'  => "0/{$total} meja",
                            'occupancy' => 'FULL',
                            'inv'       => $exclusiveBooking->order->order_number ?? '-',
                            'check_in'  => $exclusiveBooking->booking_start_at ? Carbon::parse($exclusiveBooking->booking_start_at)->format('g:iA') : '',
                            'check_out' => $exclusiveBooking->booking_end_at   ? Carbon::parse($exclusiveBooking->booking_end_at)->format('g:iA')   : '',
                        ];
                    } else {
                        $booked    = $this->getBookedCount($prod->id, $dateStr, $physRoom->id);
                        $available = max(0, $total - $booked);
                        $allBookings = $this->getAllActiveBookings($prod->id, $dateStr, $physRoom->id);

                        if ($allBookings->isEmpty()) {
                            $roomItems[] = [
                                'sub_type'  => $prod->title,
                                'capacity'  => "{$available}/{$total} meja",
                                'occupancy' => $available > 0 ? 'AVAILABLE' : 'FULL',
                                'inv'       => '-',
                                'check_in'  => '',
                                'check_out' => '',
                            ];
                        } else {
                            foreach ($allBookings as $idx => $booking) {
                                $roomItems[] = [
                                    'sub_type'  => $idx === 0 ? $prod->title : '',
                                    'capacity'  => $idx === 0 ? "{$available}/{$total} meja" : '',
                                    'occupancy' => $idx === 0 ? ($available > 0 ? 'AVAILABLE' : 'FULL') : '',
                                    'inv'       => $booking->order->order_number ?? '-',
                                    'check_in'  => $booking->booking_start_at ? Carbon::parse($booking->booking_start_at)->format('g:iA') : '',
                                    'check_out' => $booking->booking_end_at   ? Carbon::parse($booking->booking_end_at)->format('g:iA')   : '',
                                ];
                            }
                        }
                    }
                } else {
                    // Exclusive product (private_room, meeting_room, private_office)
                    $total   = $this->getTotalStockFromDatabase($prod, $physRoom);
                    $booking = $this->getActiveBooking($prod->id, null, $dateStr, $physRoom->id);
                    $blocked = $booking !== null || $shareDeskBooked;

                    if ($prod->product_type === 'private_office') {
                        // Private office: show per-unit rooms
                        $allBookings = $this->getAllActiveBookings($prod->id, $dateStr, $physRoom->id);
                        $unitNames   = $physRoom->unit_names ?? [];

                        // Build per-unit booking map: index → booking info
                        $unitBookingMap = [];
                        $legacyBookings = []; // bookings tanpa unit_index
                        foreach ($allBookings as $b) {
                            if ($b->unit_index !== null) {
                                $unitBookingMap[$b->unit_index] = [
                                    'inv'       => $b->order->order_number ?? '-',
                                    'variant'   => $b->variant_name ?? ($b->productVariant->name ?? '-'),
                                    'check_in'  => $b->booking_start_at ? Carbon::parse($b->booking_start_at)->format('j M Y') : '-',
                                    'check_out' => $b->booking_end_at   ? Carbon::parse($b->booking_end_at)->format('j M Y')   : '-',
                                ];
                            } else {
                                for ($q = 0; $q < $b->quantity; $q++) {
                                    $legacyBookings[] = [
                                        'inv'       => $b->order->order_number ?? '-',
                                        'variant'   => $b->variant_name ?? ($b->productVariant->name ?? '-'),
                                        'check_in'  => $b->booking_start_at ? Carbon::parse($b->booking_start_at)->format('j M Y') : '-',
                                        'check_out' => $b->booking_end_at   ? Carbon::parse($b->booking_end_at)->format('j M Y')   : '-',
                                    ];
                                }
                            }
                        }
                        $legacyIdx = 0;
                        for ($i = 1; $i <= $total; $i++) {
                            $idx       = $i - 1;
                            $unitLabel = !empty($unitNames[$idx]) ? $unitNames[$idx] : "Unit {$i}";

                            // Prioritaskan unit_index, fallback ke legacy sequential
                            if (isset($unitBookingMap[$idx])) {
                                $rd = $unitBookingMap[$idx];
                                $isBook = true;
                            } elseif (!isset($unitBookingMap[$idx]) && isset($legacyBookings[$legacyIdx])) {
                                $rd = $legacyBookings[$legacyIdx];
                                $isBook = true;
                                $legacyIdx++;
                            } else {
                                $rd = null;
                                $isBook = false;
                            }

                            $roomItems[] = [
                                'sub_type'  => $unitLabel,
                                'capacity'  => $rd ? $rd['variant'] : '-',
                                'occupancy' => $isBook ? 'FULL' : 'AVAILABLE',
                                'inv'       => $rd ? $rd['inv']       : '-',
                                'check_in'  => $rd ? $rd['check_in']  : '',
                                'check_out' => $rd ? $rd['check_out'] : '',
                            ];
                        }
                    } else {
                        $roomItems[] = [
                            'sub_type'  => $prod->title,
                            'capacity'  => $blocked ? "0/{$total} ruangan" : "{$total}/{$total} ruangan",
                            'occupancy' => $blocked ? 'FULL' : 'AVAILABLE',
                            'inv'       => $booking ? ($booking->order->order_number ?? '-') : '-',
                            'check_in'  => $booking && $booking->booking_start_at ? Carbon::parse($booking->booking_start_at)->format('g:iA') : '',
                            'check_out' => $booking && $booking->booking_end_at   ? Carbon::parse($booking->booking_end_at)->format('g:iA')   : '',
                        ];
                    }
                }
            }

            $typeLabel = $physRoom->products->map(fn($p) => $p->title)->join(' / ');

            $schedule[] = [
                'room'  => $physRoom->name,
                'date'  => $displayDate,
                'type'  => $typeLabel,
                'items' => $roomItems,
            ];
        }

        // =====================================================
        // PHASE 2: Products NOT assigned to any room
        // Backward compat — old grouping logic
        // =====================================================
        $products = Product::whereIn('product_type', $bookingTypes)
            ->where('is_active', true)
            ->whereNotIn('id', array_unique($assignedProductIds))
            ->with(['variants' => function ($q) {
                $q->where('is_active', true)->orderBy('sort_order');
            }])
            ->orderBy('sort_order')
            ->get();

        // Share Desk & Private Room (same physical space assumption)
        $shareDesk   = $products->where('product_type', 'share_desk')->first();
        $privateRoom = $products->where('product_type', 'private_room')->first();

        if ($shareDesk || $privateRoom) {
            $meetingRoomItems = [];

            $privateRoomBooked  = false;
            $privateRoomBooking = null;
            if ($privateRoom) {
                $privateRoomBooking = $this->getActiveBooking($privateRoom->id, null, $dateStr);
                $privateRoomBooked  = $privateRoomBooking !== null;
            }

            $shareDeskBooked = false;
            $bookedDesks     = 0;
            $shareDeskBooking = null;
            if ($shareDesk) {
                $bookedDesks     = $this->getBookedCount($shareDesk->id, $dateStr);
                $shareDeskBooked = $bookedDesks > 0;
                if ($shareDeskBooked) {
                    $shareDeskBooking = $this->getActiveBooking($shareDesk->id, null, $dateStr);
                }
            }

            if ($shareDesk) {
                $totalDesks = $this->getTotalStockFromDatabase($shareDesk);

                if ($privateRoomBooked) {
                    $meetingRoomItems[] = [
                        'sub_type'  => $shareDesk->title,
                        'capacity'  => "0/{$totalDesks} meja",
                        'occupancy' => 'FULL',
                        'inv'       => $privateRoomBooking->order->order_number ?? '-',
                        'check_in'  => $privateRoomBooking->booking_start_at ? Carbon::parse($privateRoomBooking->booking_start_at)->format('g:iA') : '',
                        'check_out' => $privateRoomBooking->booking_end_at   ? Carbon::parse($privateRoomBooking->booking_end_at)->format('g:iA')   : '',
                    ];
                } else {
                    $availableDesks  = max(0, $totalDesks - $bookedDesks);
                    $occupancy       = $availableDesks > 0 ? 'AVAILABLE' : 'FULL';
                    $allShareBookings = $this->getAllActiveBookings($shareDesk->id, $dateStr);

                    if ($allShareBookings->isEmpty()) {
                        $meetingRoomItems[] = [
                            'sub_type'  => $shareDesk->title,
                            'capacity'  => "{$availableDesks}/{$totalDesks} meja",
                            'occupancy' => $occupancy,
                            'inv'       => '-',
                            'check_in'  => '',
                            'check_out' => '',
                        ];
                    } else {
                        foreach ($allShareBookings as $index => $booking) {
                            $meetingRoomItems[] = [
                                'sub_type'  => $index === 0 ? $shareDesk->title : '',
                                'capacity'  => $index === 0 ? "{$availableDesks}/{$totalDesks} meja" : '',
                                'occupancy' => $index === 0 ? $occupancy : '',
                                'inv'       => $booking->order->order_number ?? '-',
                                'check_in'  => $booking->booking_start_at ? Carbon::parse($booking->booking_start_at)->format('g:iA') : '',
                                'check_out' => $booking->booking_end_at   ? Carbon::parse($booking->booking_end_at)->format('g:iA')   : '',
                            ];
                        }
                    }
                }
            }

            if ($privateRoom) {
                $totalPrivateRooms = $this->getTotalStockFromDatabase($privateRoom);
                $roomBlocked       = $privateRoomBooked || $shareDeskBooked;

                $meetingRoomItems[] = [
                    'sub_type'  => $privateRoom->title,
                    'capacity'  => $roomBlocked ? "0/{$totalPrivateRooms} ruangan" : "{$totalPrivateRooms}/{$totalPrivateRooms} ruangan",
                    'occupancy' => $roomBlocked ? 'FULL' : 'AVAILABLE',
                    'inv'       => $privateRoomBooking ? ($privateRoomBooking->order->order_number ?? '-') : '-',
                    'check_in'  => $privateRoomBooking && $privateRoomBooking->booking_start_at ? Carbon::parse($privateRoomBooking->booking_start_at)->format('g:iA') : '',
                    'check_out' => $privateRoomBooking && $privateRoomBooking->booking_end_at   ? Carbon::parse($privateRoomBooking->booking_end_at)->format('g:iA')   : '',
                ];
            }

            $schedule[] = [
                'room'  => 'Meeting Room',
                'date'  => $displayDate,
                'type'  => 'Coworking',
                'items' => $meetingRoomItems,
            ];
        }

        // Meeting Room (standalone, unassigned)
        $meetingRoomProducts = $products->where('product_type', 'meeting_room');
        foreach ($meetingRoomProducts as $product) {
            $total   = $this->getTotalStockFromDatabase($product);
            $booking = $this->getActiveBooking($product->id, null, $dateStr);
            $schedule[] = [
                'room'  => $product->title,
                'date'  => $displayDate,
                'type'  => $product->title,
                'items' => [[
                    'sub_type'  => $product->title,
                    'capacity'  => $booking ? "0/{$total} ruangan" : "{$total}/{$total} ruangan",
                    'occupancy' => $booking ? 'FULL' : 'AVAILABLE',
                    'inv'       => $booking ? ($booking->order->order_number ?? '-') : '-',
                    'check_in'  => $booking && $booking->booking_start_at ? Carbon::parse($booking->booking_start_at)->format('g:iA') : '',
                    'check_out' => $booking && $booking->booking_end_at   ? Carbon::parse($booking->booking_end_at)->format('g:iA')   : '',
                ]],
            ];
        }

        // Private Office (unassigned)
        $privateOfficeProducts = $products->where('product_type', 'private_office');
        foreach ($privateOfficeProducts as $product) {
            $totalRooms  = $this->getTotalStockFromDatabase($product);
            $officeItems = [];
            $bookings    = $this->getAllActiveBookings($product->id, $dateStr);

            $bookedRooms = [];
            foreach ($bookings as $booking) {
                for ($q = 0; $q < $booking->quantity; $q++) {
                    $bookedRooms[] = [
                        'inv'       => $booking->order->order_number ?? '-',
                        'variant'   => $booking->variant_name ?? ($booking->productVariant->name ?? '-'),
                        'check_in'  => $booking->booking_start_at ? Carbon::parse($booking->booking_start_at)->format('j M Y') : '-',
                        'check_out' => $booking->booking_end_at   ? Carbon::parse($booking->booking_end_at)->format('j M Y')   : '-',
                    ];
                }
            }

            for ($i = 1; $i <= $totalRooms; $i++) {
                $roomIndex = $i - 1;
                $isBooked  = isset($bookedRooms[$roomIndex]);
                if ($isBooked) {
                    $rd = $bookedRooms[$roomIndex];
                    $officeItems[] = [
                        'sub_type'  => "Unit {$i}",
                        'capacity'  => $rd['variant'],
                        'occupancy' => 'FULL',
                        'inv'       => $rd['inv'],
                        'check_in'  => $rd['check_in'],
                        'check_out' => $rd['check_out'],
                    ];
                } else {
                    $officeItems[] = [
                        'sub_type'  => "Unit {$i}",
                        'capacity'  => '-',
                        'occupancy' => 'AVAILABLE',
                        'inv'       => '-',
                        'check_in'  => '',
                        'check_out' => '',
                    ];
                }
            }

            $schedule[] = [
                'room'  => "Room 1 - {$totalRooms}",
                'date'  => $displayDate,
                'type'  => $product->title,
                'items' => $officeItems,
            ];
        }

        // Virtual Office (unassigned)
        if ($includeVirtual) {
            $virtualOfficeProducts = $products->where('product_type', 'virtual_office');
            foreach ($virtualOfficeProducts as $product) {
                $voItems        = [];
                $bookings       = $this->getAllActiveBookings($product->id, $dateStr);
                $activeBookings = [];

                foreach ($bookings as $booking) {
                    for ($q = 0; $q < $booking->quantity; $q++) {
                        $activeBookings[] = [
                            'inv'       => $booking->order->order_number ?? '-',
                            'check_in'  => $booking->booking_start_at ? Carbon::parse($booking->booking_start_at)->format('j M Y') : '-',
                            'check_out' => $booking->booking_end_at   ? Carbon::parse($booking->booking_end_at)->format('j M Y')   : '-',
                        ];
                    }
                }

                if (empty($activeBookings)) {
                    $voItems[] = [
                        'sub_type'  => $product->title,
                        'capacity'  => '-',
                        'occupancy' => 'AVAILABLE',
                        'inv'       => '-',
                        'check_in'  => '',
                        'check_out' => '',
                    ];
                } else {
                    foreach ($activeBookings as $index => $s) {
                        $voItems[] = [
                            'sub_type'  => $index === 0 ? $product->title : '',
                            'capacity'  => '-',
                            'occupancy' => $index === 0 ? 'AVAILABLE' : '',
                            'inv'       => $s['inv'],
                            'check_in'  => $s['check_in'],
                            'check_out' => $s['check_out'],
                        ];
                    }
                }

                $schedule[] = [
                    'room'  => 'Virtual Office',
                    'date'  => $displayDate,
                    'type'  => $product->title,
                    'items' => $voItems,
                ];
            }
        }

        return response()->json([
            'success'      => true,
            'schedule'     => $schedule,
            'date'         => $displayDate,
            'date_raw'     => $dateStr,
            'is_today'     => $isToday,
            'generated_at' => now()->toIso8601String(),
        ]);
    }

    private function getTotalStockFromDatabase(Product $product, ?\App\Models\Room $physRoom = null): int
    {
        $room = $physRoom ?? $product->rooms()->where('is_active', true)->first();

        if ($room) {
            // Share desk: pakai capacity ruangan (total meja)
            if ($product->product_type === 'share_desk') {
                return (int) $room->capacity;
            }
            // Exclusive types: pakai unit_count (jumlah unit yang bisa dipesan bersamaan)
            return (int) ($room->unit_count ?? 1);
        }

        // Fallback: variant stock (produk belum di-assign ke ruangan)
        $firstVariant = $product->variants->first();
        if ($firstVariant && $firstVariant->stock_quantity !== null) {
            return (int) $firstVariant->stock_quantity;
        }
        return 1;
    }

    private function getActiveBooking(int $productId, ?int $variantId, string $date, ?int $roomId = null)
    {
        $targetDate = Carbon::parse($date);
        $isToday    = $targetDate->isToday();

        $query = OrderItem::with('order')
            ->whereHas('product', fn($q) => $q->where('id', $productId))
            ->whereHas('order', fn($q) => $q->whereNotIn('status', ['cancelled'])->where('payment_status', '!=', 'cancelled'))
            ->where('stock_reduced', true)
            ->where('stock_restored', false);

        if ($roomId !== null) {
            $query->where('room_id', $roomId);
        }

        if ($isToday) {
            $now      = Carbon::now()->subMinutes(10);
            $endOfDay = $targetDate->copy()->endOfDay();
            $query->where('booking_start_at', '<=', $endOfDay)
                  ->where(function ($q) use ($now) {
                      $q->where('booking_end_at', '>', $now)->orWhereNull('booking_end_at');
                  });
        } else {
            $startOfDay = $targetDate->copy()->startOfDay();
            $endOfDay   = $targetDate->copy()->endOfDay();
            $query->where('booking_start_at', '<=', $endOfDay)
                  ->where(function ($q) use ($startOfDay) {
                      // > bukan >= : booking yg berakhir tepat di startOfDay (misal Apr 1 00:00)
                      // tidak lagi dianggap aktif di hari itu (Apr 1 sudah tersedia)
                      $q->where('booking_end_at', '>', $startOfDay)->orWhereNull('booking_end_at');
                  });
        }

        if ($variantId) {
            $query->where('variant_id', $variantId);
        }

        return $query->orderBy('booking_start_at', 'asc')->first();
    }

    private function getAllActiveBookings(int $productId, string $date, ?int $roomId = null)
    {
        $targetDate = Carbon::parse($date);
        $isToday    = $targetDate->isToday();

        $query = OrderItem::with(['order', 'productVariant'])
            ->whereHas('product', fn($q) => $q->where('id', $productId))
            ->whereHas('order', fn($q) => $q->whereNotIn('status', ['cancelled'])->where('payment_status', '!=', 'cancelled'))
            ->where('stock_reduced', true)
            ->where('stock_restored', false);

        if ($roomId !== null) {
            $query->where('room_id', $roomId);
        }

        if ($isToday) {
            $now      = Carbon::now()->subMinutes(10);
            $endOfDay = $targetDate->copy()->endOfDay();
            $query->where('booking_start_at', '<=', $endOfDay)
                  ->where(function ($q) use ($now) {
                      $q->where('booking_end_at', '>', $now)->orWhereNull('booking_end_at');
                  });
        } else {
            $startOfDay = $targetDate->copy()->startOfDay();
            $endOfDay   = $targetDate->copy()->endOfDay();
            $query->where('booking_start_at', '<=', $endOfDay)
                  ->where(function ($q) use ($startOfDay) {
                      $q->where('booking_end_at', '>', $startOfDay)->orWhereNull('booking_end_at');
                  });
        }

        return $query->orderBy('booking_start_at', 'asc')->get();
    }

    private function getBookedCount(int $productId, string $date, ?int $roomId = null): int
    {
        $targetDate = Carbon::parse($date);
        $isToday    = $targetDate->isToday();

        $query = OrderItem::whereHas('product', fn($q) => $q->where('id', $productId))
            ->whereHas('order', fn($q) => $q->whereNotIn('status', ['cancelled'])->where('payment_status', '!=', 'cancelled'))
            ->where('stock_reduced', true)
            ->where('stock_restored', false);

        if ($roomId !== null) {
            $query->where('room_id', $roomId);
        }

        if ($isToday) {
            $now      = Carbon::now()->subMinutes(10);
            $endOfDay = $targetDate->copy()->endOfDay();
            $query->where('booking_start_at', '<=', $endOfDay)
                  ->where('booking_end_at', '>', $now);
        } else {
            $startOfDay = $targetDate->copy()->startOfDay();
            $endOfDay   = $targetDate->copy()->endOfDay();
            $query->where('booking_start_at', '<=', $endOfDay)
                  ->where('booking_end_at', '>', $startOfDay);
        }

        return (int) $query->sum('quantity');
    }

    public function getTodaySummary()
    {
        $today = Carbon::today()->format('Y-m-d');

        $products = Product::whereIn('product_type', ['share_desk', 'private_room', 'private_office', 'meeting_room', 'virtual_office'])
            ->where('is_active', true)
            ->with(['variants' => function ($q) {
                $q->where('is_active', true)->orderBy('sort_order');
            }])
            ->orderBy('sort_order')
            ->get();

        $summary = [];

        foreach ($products as $product) {
            $assignedRooms = $product->rooms()->where('is_active', true)->get();

            // Hitung total stok dan booking dengan menjumlah per ruangan
            $totalStock  = 0;
            $bookedCount = 0;

            if ($assignedRooms->isNotEmpty()) {
                foreach ($assignedRooms as $room) {
                    $totalStock  += $this->getTotalStockFromDatabase($product, $room);
                    $bookedCount += $this->getBookedCount($product->id, $today, $room->id);
                }
            } else {
                // Fallback jika produk belum di-assign ke ruangan
                $totalStock  = $this->getTotalStockFromDatabase($product);
                $bookedCount = $this->getBookedCount($product->id, $today);
            }

            $availableCount = max(0, $totalStock - $bookedCount);

            $summary[] = [
                'product_id'   => $product->id,
                'room'         => $product->title,
                'product_type' => $product->product_type,
                'total_stock'  => $totalStock,
                'booked'       => $bookedCount,
                'available'    => $availableCount,
                'occupancy'    => $availableCount > 0 ? 'AVAILABLE' : 'FULL',
            ];
        }

        return response()->json([
            'success'      => true,
            'date'         => Carbon::today()->locale('id')->isoFormat('dddd, D MMMM YYYY'),
            'summary'      => $summary,
            'generated_at' => now()->toIso8601String(),
        ]);
    }
}
