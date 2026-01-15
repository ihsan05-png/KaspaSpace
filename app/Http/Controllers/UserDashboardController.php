<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Order;
use App\Models\Discount;

class UserDashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        // Auto-cancel orders that are unpaid for more than 24 hours
        Order::where('customer_email', $user->email)
            ->where('payment_status', 'unpaid')
            ->where('created_at', '<', now()->subHours(24))
            ->update(['payment_status' => 'cancelled']);
        
        // Get user orders
        $orders = Order::where('customer_email', $user->email)
            ->with('items')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();
        
        // Get active discounts (available for user)
        $activeDiscounts = Discount::where('is_active', true)
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
                // Hanya tampilkan diskon yang user-nya di-assign ke user ini
                $q->where('users.id', $user->id);
            })
            ->with('users')
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
        
        return Inertia::render('User/Dashboard', [
            'orders' => $orders,
            'activeDiscounts' => $activeDiscounts,
            'stats' => [
                'totalOrders' => $totalOrders,
                'completedOrders' => $completedOrders,
                'totalSpent' => $totalSpent
            ]
        ]);
    }

    public function cancelOrder(Order $order)
    {
        $user = auth()->user();
        
        // Verify order belongs to user and can be cancelled
        if ($order->customer_email !== $user->email) {
            return back()->with('error', 'Order tidak ditemukan');
        }
        
        if ($order->payment_status !== 'unpaid') {
            return back()->with('error', 'Order tidak dapat dibatalkan');
        }
        
        $order->update(['payment_status' => 'cancelled']);
        
        return back()->with('success', 'Order berhasil dibatalkan');
    }
}
