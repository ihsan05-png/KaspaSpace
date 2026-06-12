<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class BookingHold extends Model
{
    protected $fillable = [
        'product_id', 'room_id', 'variant_id', 'user_id', 'order_id',
        'session_id', 'booking_date', 'booking_start_at', 'booking_end_at',
        'unit_index', 'quantity', 'expires_at', 'status',
    ];

    protected $casts = [
        'booking_date'     => 'date',
        'booking_start_at' => 'datetime',
        'booking_end_at'   => 'datetime',
        'expires_at'       => 'datetime',
    ];

    // ─── Relations ────────────────────────────────────────────
    public function product() { return $this->belongsTo(Product::class); }
    public function room()    { return $this->belongsTo(Room::class); }
    public function user()    { return $this->belongsTo(User::class); }
    public function order()   { return $this->belongsTo(Order::class); }

    // ─── Scopes ───────────────────────────────────────────────
    public function scopeActive(Builder $q): Builder
    {
        return $q->where('status', 'active')->where('expires_at', '>', now());
    }

    public function scopeExpired(Builder $q): Builder
    {
        return $q->where('status', 'active')->where('expires_at', '<=', now());
    }

    // ─── Helpers ──────────────────────────────────────────────

    /**
     * Cek apakah ada hold aktif yang konflik dengan slot ini.
     * Digunakan sebelum membuat order baru.
     */
    public static function hasActiveConflict(
        int $productId,
        ?int $roomId,
        string $date,
        string $startAt,
        string $endAt,
        int $quantity = 1,
        ?int $excludeOrderId = null
    ): bool {
        $query = static::active()
            ->where('product_id', $productId)
            ->where('booking_date', $date)
            ->where('booking_start_at', '<', $endAt)
            ->where('booking_end_at', '>', $startAt);

        if ($roomId) {
            $query->where('room_id', $roomId);
        }

        if ($excludeOrderId) {
            $query->where('order_id', '!=', $excludeOrderId);
        }

        // Untuk share_desk: cek apakah total quantity hold + existing melebihi kapasitas
        // (cukup return ada/tidak untuk sekarang — kapasitas dicek di CheckoutController)
        return $query->exists();
    }

    /**
     * Hitung total quantity yang sedang di-hold untuk slot tertentu.
     */
    public static function heldQuantity(
        int $productId,
        ?int $roomId,
        string $date,
        string $startAt,
        string $endAt,
        ?int $excludeOrderId = null
    ): int {
        $query = static::active()
            ->where('product_id', $productId)
            ->where('booking_date', $date)
            ->where('booking_start_at', '<', $endAt)
            ->where('booking_end_at', '>', $startAt);

        if ($roomId) {
            $query->where('room_id', $roomId);
        }

        if ($excludeOrderId) {
            $query->where('order_id', '!=', $excludeOrderId);
        }

        return (int) $query->sum('quantity');
    }

    /**
     * Buat hold baru selama 15 menit.
     */
    public static function createHold(array $data): static
    {
        return static::create(array_merge($data, [
            'expires_at' => now()->addMinutes(15),
            'status'     => 'active',
        ]));
    }

    /**
     * Konversi hold menjadi 'converted' setelah pembayaran berhasil.
     */
    public function markConverted(): void
    {
        $this->update(['status' => 'converted']);
    }

    /**
     * Lepaskan hold (expired atau dibatalkan).
     */
    public function release(): void
    {
        $this->update(['status' => 'released']);
    }

    /**
     * Lepaskan semua hold yang sudah expired.
     * Dipanggil oleh cron job.
     */
    public static function releaseExpired(): int
    {
        return static::expired()->update(['status' => 'released']);
    }
}
