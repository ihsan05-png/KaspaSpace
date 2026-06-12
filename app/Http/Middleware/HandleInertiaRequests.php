<?php

namespace App\Http\Middleware;

use App\Models\Order;
use App\Models\PaymentSetting;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $pendingOrder = null;
        if ($request->user()) {
            $pendingOrder = Order::where('customer_email', $request->user()->email)
                ->where('payment_status', 'unpaid')
                ->where('status', '!=', 'cancelled')
                ->where('created_at', '>=', now()->subHours(24))
                ->latest()
                ->first(['id', 'order_number', 'total', 'payment_status', 'payment_method', 'created_at']);
        }

        $setting = PaymentSetting::first();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? array_merge(
                    $request->user()->toArray(),
                    ['roles' => $request->user()->getRoleNames()]
                ) : null,
            ],
            'cart' => session()->get('cart', []),
            'pendingOrder' => $pendingOrder,
            'operationalHours' => [
                'open'  => $setting->open_time  ?? '08:00',
                'close' => $setting->close_time ?? '17:00',
            ],
        ];
    }
}
