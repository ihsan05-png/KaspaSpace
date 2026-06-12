<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'order_number', 
        'customer_name', 
        'customer_email', 
        'customer_phone', 
        'notes',
        'subtotal',
        'discount_id',
        'discount_code',
        'discount_amount',
        'tax',
        'total',
        'status',
        'payment_method',
        'payment_status',
        'payment_proof',
        'paid_at',
        'doc_ktp',
        'doc_npwp',
        'doc_business_license',
        'doc_company_name',
        'doc_pic_name',
        'doc_pic_phone',
    ];

    protected $casts = [
        'paid_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function discount()
    {
        return $this->belongsTo(Discount::class);
    }

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($order) {
            $order->order_number = 'ORD-' . strtoupper(uniqid());
        });
    }
}