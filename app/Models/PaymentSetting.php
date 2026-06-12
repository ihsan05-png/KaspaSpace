<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'qris_image',
        'bank_name',
        'account_number',
        'account_name',
        'open_time',
        'close_time',
        'ppn_enabled',
        'ppn_rate',
    ];

    protected $casts = [
        'ppn_enabled' => 'boolean',
        'ppn_rate'    => 'integer',
    ];
}