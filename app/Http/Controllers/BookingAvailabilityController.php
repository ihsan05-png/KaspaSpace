<?php

namespace App\Http\Controllers;

use App\Models\OrderItem;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Http\Request;

class BookingAvailabilityController extends Controller
{
    /**
     * Check booking availability for a given product, date, and time range.
     */
    public function check(Request $request)
    {
        try {
            $request->validate([
                'product_id' => 'required|exists:products,id',
                'date' => 'required|date|after_or_equal:today',
                'start_time' => 'required|string',
                'duration_hours' => 'required|numeric|min:1',
                'date_only' => 'nullable',
            ]);

            $product = Product::findOrFail($request->product_id);
            $date = $request->date;
            $productType = $product->product_type;

            if (!in_array($productType, ['share_desk', 'private_room', 'private_office', 'virtual_office'])) {
                return response()->json(['error' => 'Tipe produk tidak mendukung booking waktu'], 400);
            }

            // Handle date-only booking (private_office, virtual_office)
            if (in_array($productType, ['private_office', 'virtual_office'])) {
                return $this->checkDateOnlyBookingAvailability($product, $date);
            }

            // Handle hourly booking (share_desk, private_room)
            $durationHours = (float) $request->duration_hours;
            $startTime = $request->start_time;

            // Parse start and end times
            $start = Carbon::parse("$date $startTime");
            $end = (clone $start)->addMinutes((int) ($durationHours * 60));

            // Validate operating hours (08:00 - 17:00)
            $opStart = Carbon::parse("$date 08:00");
            $opEnd = Carbon::parse("$date 17:00");

            // Reject past times for today
            if ($start->lt(now())) {
                return response()->json([
                    'available' => false,
                    'message' => 'Jam yang dipilih sudah lewat. Silakan pilih jam yang akan datang.',
                ]);
            }

            if ($start->lt($opStart)) {
                return response()->json([
                    'available' => false,
                    'message' => 'Jam operasional dimulai dari 08:00',
                ]);
            }

            if ($end->gt($opEnd)) {
                return response()->json([
                    'available' => false,
                    'message' => 'Booking melebihi jam operasional (17:00)',
                ]);
            }

            // Check conflicts
            $bookedDesks = $this->getBookedCount('share_desk', $start, $end);
            $privateRoomBooked = $this->isPrivateRoomBooked($start, $end);

            if ($productType === 'share_desk') {
                $available = $privateRoomBooked ? 0 : (8 - $bookedDesks);
                if ($available <= 0) {
                    return response()->json([
                        'available' => false,
                        'message' => $privateRoomBooked
                            ? 'Private Room sedang di-booking pada waktu ini, semua desk tidak tersedia'
                            : 'Semua desk sudah terisi pada waktu ini',
                    ]);
                }

                return response()->json([
                    'available' => true,
                    'remaining' => $available,
                    'message' => "Tersedia ($available dari 8 desk)",
                ]);
            } else {
                // private_room
                if ($privateRoomBooked || $bookedDesks > 0) {
                    return response()->json([
                        'available' => false,
                        'message' => $privateRoomBooked
                            ? 'Private Room sudah di-booking pada waktu ini'
                            : 'Ada desk yang sedang digunakan pada waktu ini, Private Room tidak tersedia',
                    ]);
                }

                return response()->json([
                    'available' => true,
                    'remaining' => 1,
                    'message' => 'Private Room tersedia',
                ]);
            }
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'available' => false,
                'message' => 'Validasi gagal: ' . implode(', ', $e->validator->errors()->all()),
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Booking Availability Check Error: ' . $e->getMessage(), [
                'request' => $request->all(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'available' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Check date-only booking availability (private_office, virtual_office).
     * These products are rented monthly/yearly, so we just check by date.
     */
    private function checkDateOnlyBookingAvailability(Product $product, string $date): \Illuminate\Http\JsonResponse
    {
        try {
            $productType = $product->product_type;
            $productLabel = $productType === 'private_office' ? 'Private Office' : 'Virtual Office';

            // Get total available slots - all variants share the same inventory
            // Use the stock from first active variant
            $firstVariant = $product->variants()->where('is_active', true)->first();
            $totalSlots = $firstVariant ? ($firstVariant->stock_quantity ?? 999) : 999;

            // For virtual_office, stock is typically unlimited (999)
            // For private_office, use actual stock or default to 6
            if ($productType === 'private_office' && $totalSlots <= 0) {
                $totalSlots = 6;
            }

            $startDate = Carbon::parse($date)->startOfDay();
            $endDate = Carbon::parse($date)->endOfDay();

            // Count active bookings for this product type that include this date
            $bookedSlots = OrderItem::whereHas('product', function ($q) use ($productType) {
                    $q->where('product_type', $productType);
                })
                ->whereHas('order', function ($q) {
                    $q->whereNotIn('status', ['cancelled']);
                })
                ->where('stock_reduced', true)
                ->where('stock_restored', false)
                ->where('booking_start_at', '<=', $endDate)
                ->where(function ($q) use ($startDate) {
                    $q->whereNull('booking_end_at')
                      ->orWhere('booking_end_at', '>', $startDate);
                })
                ->sum('quantity');

            $available = $totalSlots - $bookedSlots;

            if ($available <= 0) {
                return response()->json([
                    'available' => false,
                    'message' => "Semua $productLabel sudah terisi untuk tanggal ini",
                ]);
            }

            return response()->json([
                'available' => true,
                'remaining' => $available,
                'message' => "Tersedia ($available slot)",
            ]);
        } catch (\Exception $e) {
            \Log::error('Date-Only Booking Availability Check Error: ' . $e->getMessage(), [
                'product_id' => $product->id,
                'product_type' => $product->product_type,
                'date' => $date,
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'available' => false,
                'message' => 'Gagal memeriksa ketersediaan: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Count booked desks for share_desk in a time range.
     */
    private function getBookedCount(string $type, Carbon $start, Carbon $end): int
    {
        return (int) OrderItem::whereHas('product', function ($q) use ($type) {
                $q->where('product_type', $type);
            })
            ->whereHas('order', function ($q) {
                $q->whereNotIn('status', ['cancelled']);
            })
            ->where('stock_reduced', true)
            ->where('stock_restored', false)
            ->where('booking_start_at', '<', $end)
            ->where('booking_end_at', '>', $start)
            ->sum('quantity');
    }

    /**
     * Check if private room is booked in a time range.
     */
    private function isPrivateRoomBooked(Carbon $start, Carbon $end): bool
    {
        return OrderItem::whereHas('product', function ($q) {
                $q->where('product_type', 'private_room');
            })
            ->whereHas('order', function ($q) {
                $q->whereNotIn('status', ['cancelled']);
            })
            ->where('stock_reduced', true)
            ->where('stock_restored', false)
            ->where('booking_start_at', '<', $end)
            ->where('booking_end_at', '>', $start)
            ->exists();
    }
}
