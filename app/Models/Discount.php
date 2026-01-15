<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Discount extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'description',
        'type',
        'value',
        'min_purchase',
        'max_discount',
        'usage_limit',
        'usage_count',
        'start_date',
        'end_date',
        'is_active'
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'is_active' => 'boolean',
        'value' => 'decimal:2',
        'min_purchase' => 'decimal:2',
        'max_discount' => 'decimal:2',
    ];

    /**
     * Relasi many-to-many dengan Product
     */
    public function products()
    {
        return $this->belongsToMany(Product::class, 'discount_products');
    }

    /**
     * Relasi many-to-many dengan User
     */
    public function users()
    {
        return $this->belongsToMany(User::class, 'discount_users');
    }

    /**
     * Check if discount applies to specific user
     */
    public function appliesToUser($userId = null)
    {
        // Jika tidak ada user yang dipilih, diskon berlaku untuk semua user
        if ($this->users()->count() === 0) {
            return true;
        }

        // Jika tidak ada user_id yang di-check, return false
        if ($userId === null) {
            return false;
        }

        // Check apakah user_id ada dalam list user diskon
        return $this->users()->where('user_id', $userId)->exists();
    }

    /**
     * Check if discount applies to specific product
     */
    public function appliesTo($productId = null)
    {
        // Jika tidak ada produk yang dipilih, diskon berlaku untuk semua produk
        if ($this->products()->count() === 0) {
            return true;
        }

        // Jika tidak ada product_id yang di-check, return true (untuk kasus umum)
        if ($productId === null) {
            return true;
        }

        // Check apakah product_id ada dalam list produk diskon
        return $this->products()->where('product_id', $productId)->exists();
    }

    /**
     * Check if discount is valid
     */
    public function isValid($subtotal = null)
    {
        // Check if active
        if (!$this->is_active) {
            return false;
        }

        // Check date range
        $now = Carbon::now();
        if ($this->start_date && $now->lt($this->start_date)) {
            return false;
        }
        if ($this->end_date && $now->gt($this->end_date)) {
            return false;
        }

        // Check usage limit
        if ($this->usage_limit && $this->usage_count >= $this->usage_limit) {
            return false;
        }

        // Check minimum purchase
        if ($subtotal !== null && $this->min_purchase && $subtotal < $this->min_purchase) {
            return false;
        }

        return true;
    }

    /**
     * Calculate discount amount
     */
    public function calculateDiscount($subtotal)
    {
        if (!$this->isValid($subtotal)) {
            return 0;
        }

        if ($this->type === 'percentage') {
            $discount = ($subtotal * $this->value) / 100;
            
            // Apply max discount if set
            if ($this->max_discount && $discount > $this->max_discount) {
                $discount = $this->max_discount;
            }
            
            return $discount;
        } else {
            // Fixed amount
            return min($this->value, $subtotal);
        }
    }

    /**
     * Increment usage count
     */
    public function incrementUsage()
    {
        $this->increment('usage_count');
    }

    /**
     * Format discount for display
     */
    public function getFormattedValueAttribute()
    {
        if ($this->type === 'percentage') {
            return $this->value . '%';
        } else {
            return 'Rp ' . number_format($this->value, 0, ',', '.');
        }
    }

    /**
     * Check if discount is expired
     */
    public function isExpired()
    {
        if (!$this->end_date) {
            return false;
        }
        return Carbon::now()->gt($this->end_date);
    }

    /**
     * Check if usage limit reached
     */
    public function isUsageLimitReached()
    {
        if (!$this->usage_limit) {
            return false;
        }
        return $this->usage_count >= $this->usage_limit;
    }
}
