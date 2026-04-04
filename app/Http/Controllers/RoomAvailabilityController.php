<?php

namespace App\Http\Controllers;

use App\Models\OrderItem;
use App\Models\PaymentSetting;
use App\Models\Product;
use App\Models\Room;
use Carbon\Carbon;
use Illuminate\Http\Request;

class RoomAvailabilityController extends Controller
{
    /**
     * Kembalikan daftar ruangan beserta ketersediaannya untuk produk + waktu tertentu.
     * GET /api/rooms/availability?product_id=X&date=Y&start_time=Z&duration_hours=W
     */
    public function check(Request $request)
    {
        $request->validate([
            'product_id'     => 'required|exists:products,id',
            'date'           => 'required|date',
            'start_time'     => 'required|string',
            'duration_hours' => 'required|numeric|min:0.5',
        ]);

        $product = Product::with('rooms')->findOrFail($request->product_id);
        $activeRooms = $product->rooms->where('is_active', true)->values();

        if ($activeRooms->isEmpty()) {
            return response()->json(['rooms' => [], 'has_rooms' => false]);
        }

        $date        = $request->date;
        $startTime   = $request->start_time;
        $durationH   = (float) $request->duration_hours;
        $start       = Carbon::parse("$date $startTime");
        $end         = (clone $start)->addMinutes((int) ($durationH * 60));
        $productType = $product->product_type;
        $isExclusive = !in_array($productType, ['share_desk']);

        $result = $activeRooms->map(function (Room $room) use ($start, $end, $isExclusive, $product, $durationH) {
            return $this->getRoomStatus($room, $start, $end, $isExclusive, $product->id, $durationH);
        });

        return response()->json(['rooms' => $result, 'has_rooms' => true]);
    }

    /**
     * Hitung status ketersediaan sebuah ruangan pada rentang waktu tertentu.
     * Mengembalikan info per-unit jika unit_count > 1 (exclusive types only).
     */
    private function getRoomStatus(Room $room, Carbon $start, Carbon $end, bool $isExclusive, int $productId, float $durationH = 1): array
    {
        $unitCount       = (int) ($room->unit_count ?? 1);
        $unitNames       = $room->unit_names ?? [];
        $unitProductIds  = $room->unit_product_ids; // null = room-level (unit_count=1)

        // Grace period 10 menit hanya untuk booking harian/jam; untuk booking bulanan (>= 24 jam) tidak perlu
        $gracePeriod = $durationH >= 24 ? 0 : 10;
        $baseQuery = fn() => OrderItem::where('room_id', $room->id)
            ->whereHas('order', fn($q) => $q
                ->whereNotIn('status', ['cancelled'])
                ->where('payment_status', '!=', 'cancelled'))
            ->where('stock_reduced', true)
            ->where('stock_restored', false)
            ->where('booking_start_at', '<', $end)
            ->where('booking_end_at', '>', $gracePeriod > 0 ? $start->copy()->subMinutes($gracePeriod) : $start);

        // Booking shared (share_desk) yang aktif di rentang ini
        $sharedCount = (int) (clone $baseQuery())
            ->whereHas('product', fn($q) => $q->where('product_type', 'share_desk'))
            ->sum('quantity');

        if ($isExclusive) {
            if ($unitCount > 1) {
                // Per-unit availability: cek unit_index mana saja yang sudah terpesan
                $takenIndices = (clone $baseQuery())
                    ->whereHas('product', fn($q) => $q->whereNotIn('product_type', ['share_desk']))
                    ->whereNotNull('unit_index')
                    ->pluck('unit_index')
                    ->toArray();

                // Hitung juga booking yang tidak punya unit_index (legacy)
                $legacyExclusiveCount = (clone $baseQuery())
                    ->whereHas('product', fn($q) => $q->whereNotIn('product_type', ['share_desk']))
                    ->whereNull('unit_index')
                    ->count();

                // Build unit availability list
                $units = [];
                for ($i = 0; $i < $unitCount; $i++) {
                    // Filter per-unit product assignment
                    if ($unitProductIds !== null) {
                        $thisUnitProducts = $unitProductIds[$i] ?? [];
                        if (!in_array($productId, $thisUnitProducts)) {
                            continue; // unit ini tidak diassign ke produk yang diminta
                        }
                    }
                    $name = !empty($unitNames[$i]) ? $unitNames[$i] : "Unit " . ($i + 1);
                    $takenByLegacy = $i < $legacyExclusiveCount;
                    $available = $sharedCount === 0 && !in_array($i, $takenIndices) && !$takenByLegacy;
                    $units[] = [
                        'index'     => $i,
                        'name'      => $name,
                        'capacity'  => $room->getUnitCapacity($i),
                        'available' => $available,
                    ];
                }

                $availableSlots = count(array_filter($units, fn($u) => $u['available']));

                return [
                    'id'              => $room->id,
                    'name'            => $room->name,
                    'capacity'        => $room->capacity,
                    'unit_count'      => $unitCount,
                    'available'       => $availableSlots > 0,
                    'available_slots' => $availableSlots,
                    'message'         => $availableSlots > 0
                        ? "Tersedia ($availableSlots dari {$unitCount} unit)"
                        : 'Semua unit sedang digunakan',
                    'units'           => $units,
                ];
            }

            // unit_count = 1: cek total exclusive
            $exclusiveCount = (clone $baseQuery())
                ->whereHas('product', fn($q) => $q->whereNotIn('product_type', ['share_desk']))
                ->count();

            $availableUnits = $sharedCount > 0 ? 0 : max(0, $unitCount - $exclusiveCount);
            return [
                'id'              => $room->id,
                'name'            => $room->name,
                'capacity'        => $room->capacity,
                'unit_count'      => $unitCount,
                'available'       => $availableUnits > 0,
                'available_slots' => $availableUnits,
                'message'         => $availableUnits > 0 ? 'Tersedia' : 'Ruangan sedang digunakan',
                'units'           => null,
            ];
        } else {
            // Share desk: bisa masuk selama tidak ada eksklusif dan masih ada slot
            $exclusiveCount = (clone $baseQuery())
                ->whereHas('product', fn($q) => $q->whereNotIn('product_type', ['share_desk']))
                ->count();

            if ($exclusiveCount > 0) {
                return [
                    'id'              => $room->id,
                    'name'            => $room->name,
                    'capacity'        => $room->capacity,
                    'unit_count'      => $unitCount,
                    'available'       => false,
                    'available_slots' => 0,
                    'message'         => 'Ruangan sedang digunakan eksklusif',
                    'units'           => null,
                ];
            }
            // Share desk: sum kapasitas unit yang di-assign ke produk ini
            if ($unitProductIds !== null) {
                $totalDesks = 0;
                for ($i = 0; $i < $unitCount; $i++) {
                    if (in_array($productId, $unitProductIds[$i] ?? [])) {
                        $totalDesks += $room->getUnitCapacity($i);
                    }
                }
                $totalDesks = max(1, $totalDesks);
            } else {
                $totalDesks = $room->getUnitCapacity(0);
            }
            $slots = $totalDesks - $sharedCount;
            return [
                'id'              => $room->id,
                'name'            => $room->name,
                'capacity'        => $totalDesks,
                'unit_count'      => $unitCount,
                'available'       => $slots > 0,
                'available_slots' => max(0, $slots),
                'message'         => $slots > 0
                    ? "Tersedia ($slots dari {$totalDesks} meja)"
                    : 'Semua meja penuh',
                'units'           => null,
            ];
        }
    }
}
