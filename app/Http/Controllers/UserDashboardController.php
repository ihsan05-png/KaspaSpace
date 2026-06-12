<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Order;
use App\Models\Discount;
use App\Models\Agreement;
use Illuminate\Support\Facades\DB;

class UserDashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        // Auto-cancel orders that are unpaid for more than 24 hours
        $ordersToAutoCancel = Order::where('customer_email', $user->email)
            ->where('payment_status', 'unpaid')
            ->where('created_at', '<', now()->subHours(24))
            ->with('discount')
            ->get();

        foreach ($ordersToAutoCancel as $orderToCancel) {
            $orderToCancel->update(['payment_status' => 'cancelled']);
            if ($orderToCancel->discount_id && $orderToCancel->discount) {
                $orderToCancel->discount->decrementUsage();
            }
        }
        
        // Get user orders
        $orders = Order::where('customer_email', $user->email)
            ->with('items.product:id,slug')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();
        
        // Get IDs of discounts already used by this user in active (non-cancelled) orders
        $usedDiscountIds = Order::where('customer_email', $user->email)
            ->whereNotNull('discount_id')
            ->where('status', '!=', 'cancelled')
            ->where('payment_status', '!=', 'cancelled')
            ->pluck('discount_id')
            ->unique()
            ->toArray();

        // Get active discounts (available for user, excluding already used ones)
        $activeDiscounts = Discount::select('id','code','name','type','value','min_purchase','usage_limit','usage_count','start_date','end_date','created_at')
            ->where('is_active', true)
            ->where(function($query) {
                $query->whereNull('start_date')
                    ->orWhere('start_date', '<=', now());
            })
            ->where(function($query) {
                $query->whereNull('end_date')
                    ->orWhere('end_date', '>=', now());
            })
            ->where(function($query) {
                $query->whereNull('usage_limit')
                    ->orWhereRaw('usage_count < usage_limit');
            })
            ->whereHas('users', function($q) use ($user) {
                $q->where('users.id', $user->id);
            })
            ->whereNotIn('id', $usedDiscountIds)
            ->orderBy('created_at', 'desc')
            ->get();
        
        // Calculate statistics
        $totalOrders = Order::where('customer_email', $user->email)->count();
        
        // Count completed orders (paid status)
        $completedOrders = Order::where('customer_email', $user->email)
            ->where('payment_status', 'paid')
            ->count();
        
        // Total spent for paid orders only
        $totalSpent = Order::where('customer_email', $user->email)
            ->where('payment_status', 'paid')
            ->sum('total');
        
        // Product IDs yang sudah di-review user ini
        $reviewedProductIds = $user->reviews()->pluck('product_id')->toArray();

        return Inertia::render('User/Dashboard', [
            'orders' => $orders,
            'reviewedProductIds' => $reviewedProductIds,
            'activeDiscounts' => $activeDiscounts,
            'stats' => [
                'totalOrders' => $totalOrders,
                'completedOrders' => $completedOrders,
                'totalSpent' => $totalSpent
            ],
            'agreement' => [
                'agreed_terms'      => $user->agreed_terms,
                'agreed_privacy'    => $user->agreed_privacy,
                'agreed_newsletter' => $user->agreed_newsletter,
                'agreed_at'         => $user->agreed_at?->format('d M Y, H:i'),
            ],
            'termsAgreement'   => Agreement::getTerms(),
            'privacyAgreement' => Agreement::getPrivacy(),
        ]);
    }

    public function cancelOrder(Order $order)
    {
        $user = auth()->user();

        // Verify order belongs to user and can be cancelled
        if ($order->customer_email !== $user->email) {
            return back()->with('error', 'Order tidak ditemukan');
        }

        if ($order->payment_status !== 'unpaid' || $order->status === 'cancelled') {
            return back()->with('error', 'Order tidak dapat dibatalkan');
        }

        $order->load('discount', 'items.product', 'items.productVariant');

        DB::transaction(function () use ($order) {
            $order->update(['status' => 'cancelled', 'payment_status' => 'cancelled']);

            // Restore booking slots / stock so the schedule is freed immediately
            foreach ($order->items as $item) {
                if ($item->stock_reduced && !$item->stock_restored) {
                    $isBookingProduct = $item->product &&
                        in_array($item->product->product_type, ['share_desk', 'private_room', 'private_office', 'virtual_office']);

                    if ($isBookingProduct) {
                        $item->update(['stock_restored' => true]);
                    } elseif ($item->variant_id && $item->productVariant) {
                        $item->productVariant->incrementStock($item->quantity);
                        $item->update(['stock_restored' => true]);
                    }
                }
            }
        });

        // Kembalikan usage diskon jika order menggunakan diskon
        if ($order->discount_id && $order->discount) {
            $order->discount->decrementUsage();
        }

        return back()->with('success', 'Order berhasil dibatalkan');
    }
}
