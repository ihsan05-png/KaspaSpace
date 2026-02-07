<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NewsletterSubscriber extends Model
{
    protected $fillable = [
        'email',
        'name',
        'source',
        'user_id',
        'is_active',
        'subscribed_at',
        'unsubscribed_at',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'subscribed_at' => 'datetime',
            'unsubscribed_at' => 'datetime',
        ];
    }

    /**
     * Get the user associated with this subscriber (if registered)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope for active subscribers only
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Subscribe an email (create or reactivate)
     */
    public static function subscribe(string $email, string $name, string $source = 'guest_checkout', ?int $userId = null): self
    {
        return self::updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'source' => $source,
                'user_id' => $userId,
                'is_active' => true,
                'subscribed_at' => now(),
                'unsubscribed_at' => null,
            ]
        );
    }

    /**
     * Unsubscribe an email
     */
    public static function unsubscribe(string $email): bool
    {
        return self::where('email', $email)->update([
            'is_active' => false,
            'unsubscribed_at' => now(),
        ]) > 0;
    }
}
