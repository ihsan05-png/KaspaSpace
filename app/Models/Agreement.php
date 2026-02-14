<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Agreement extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'title',
        'content',
        'is_active',
    ];

    protected $casts = [
        'content' => 'array',
        'is_active' => 'boolean',
    ];

    public static function getTerms()
    {
        return static::where('type', 'terms')->where('is_active', true)->first();
    }

    public static function getPrivacy()
    {
        return static::where('type', 'privacy')->where('is_active', true)->first();
    }
}
