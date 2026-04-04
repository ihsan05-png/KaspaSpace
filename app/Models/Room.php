<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description', 'capacity', 'unit_count', 'unit_names', 'unit_capacities', 'unit_product_ids', 'is_active'];

    protected $casts = [
        'is_active'        => 'boolean',
        'capacity'         => 'integer',
        'unit_count'       => 'integer',
        'unit_names'       => 'array',
        'unit_capacities'  => 'array',
        'unit_product_ids' => 'array',
    ];

    /**
     * Kembalikan kapasitas unit tertentu (per-unit override, fallback ke capacity default).
     */
    public function getUnitCapacity(int $index): int
    {
        $caps = $this->unit_capacities ?? [];
        if (isset($caps[$index]) && (int) $caps[$index] > 0) {
            return (int) $caps[$index];
        }
        return (int) $this->capacity;
    }

    public function products()
    {
        return $this->belongsToMany(Product::class, 'product_rooms');
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }
}
