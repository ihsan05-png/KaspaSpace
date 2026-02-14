<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StatisticsController extends Controller
{
    public function index()
    {
        $now = Carbon::now();
        $currentMonth = $now->month;
        $currentYear = $now->year;
        $lastMonth = $now->copy()->subMonth();


        // === SUMMARY CARDS ===
        $totalRevenue = Order::where('payment_status', 'paid')->sum('total');
        $lastMonthRevenue = Order::where('payment_status', 'paid')
            ->whereMonth('paid_at', $lastMonth->month)
            ->whereYear('paid_at', $lastMonth->year)
            ->sum('total');
        $currentMonthRevenue = Order::where('payment_status', 'paid')
            ->whereMonth('paid_at', $currentMonth)
            ->whereYear('paid_at', $currentYear)
            ->sum('total');
        $revenueChange = $lastMonthRevenue > 0
            ? round((($currentMonthRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100, 1)
            : ($currentMonthRevenue > 0 ? 100 : 0);

        $totalOrders = Order::count();
        $lastMonthOrders = Order::whereMonth('created_at', $lastMonth->month)
            ->whereYear('created_at', $lastMonth->year)->count();
        $currentMonthOrders = Order::whereMonth('created_at', $currentMonth)
            ->whereYear('created_at', $currentYear)->count();
        $ordersChange = $lastMonthOrders > 0
            ? round((($currentMonthOrders - $lastMonthOrders) / $lastMonthOrders) * 100, 1)
            : ($currentMonthOrders > 0 ? 100 : 0);

        $totalCustomers = User::where('role', '!=', 'admin')->count();
        $lastMonthCustomers = User::where('role', '!=', 'admin')
            ->whereMonth('created_at', $lastMonth->month)
            ->whereYear('created_at', $lastMonth->year)->count();
        $currentMonthCustomers = User::where('role', '!=', 'admin')
            ->whereMonth('created_at', $currentMonth)
            ->whereYear('created_at', $currentYear)->count();
        $customersChange = $lastMonthCustomers > 0
            ? round((($currentMonthCustomers - $lastMonthCustomers) / $lastMonthCustomers) * 100, 1)
            : ($currentMonthCustomers > 0 ? 100 : 0);

        $totalProductsSold = OrderItem::whereHas('order', function ($q) {
            $q->where('payment_status', 'paid');
        })->sum('quantity');
        $lastMonthProductsSold = OrderItem::whereHas('order', function ($q) use ($lastMonth) {
            $q->where('payment_status', 'paid')
                ->whereMonth('paid_at', $lastMonth->month)
                ->whereYear('paid_at', $lastMonth->year);
        })->sum('quantity');
        $currentMonthProductsSold = OrderItem::whereHas('order', function ($q) use ($currentMonth, $currentYear) {
            $q->where('payment_status', 'paid')
                ->whereMonth('paid_at', $currentMonth)
                ->whereYear('paid_at', $currentYear);
        })->sum('quantity');
        $productsSoldChange = $lastMonthProductsSold > 0
            ? round((($currentMonthProductsSold - $lastMonthProductsSold) / $lastMonthProductsSold) * 100, 1)
            : ($currentMonthProductsSold > 0 ? 100 : 0);

        // === MONTHLY REVENUE CHART (12 months) ===
        $monthlyRevenue = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = $now->copy()->subMonths($i);
            $revenue = Order::where('payment_status', 'paid')
                ->whereMonth('paid_at', $date->month)
                ->whereYear('paid_at', $date->year)
                ->sum('total');
            $monthlyRevenue[] = [
                'month' => $date->translatedFormat('M'),
                'monthFull' => $date->translatedFormat('F Y'),
                'revenue' => (float) $revenue,
            ];
        }

        // === ORDER STATUS CHART (12 months) ===
        $monthlyOrderStatus = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = $now->copy()->subMonths($i);
            $completed = Order::where('status', 'completed')
                ->whereMonth('created_at', $date->month)
                ->whereYear('created_at', $date->year)
                ->count();
            $cancelled = Order::where('status', 'cancelled')
                ->whereMonth('created_at', $date->month)
                ->whereYear('created_at', $date->year)
                ->count();
            $pending = Order::whereIn('status', ['pending', 'processing'])
                ->whereMonth('created_at', $date->month)
                ->whereYear('created_at', $date->year)
                ->count();
            $monthlyOrderStatus[] = [
                'month' => $date->translatedFormat('M'),
                'completed' => $completed,
                'cancelled' => $cancelled,
                'pending' => $pending,
            ];
        }

        // === ALL TRANSACTIONS (filtering done client-side) ===
        $recentTransactions = Order::with(['items.product'])
            ->latest()
            ->get()
            ->map(function ($order) {
                $productNames = $order->items->pluck('product_name')->filter()->implode(', ');
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'date' => $order->created_at->format('Y-m-d'),
                    'customer_name' => $order->customer_name,
                    'product' => $productNames ?: '-',
                    'total' => (float) $order->total,
                    'status' => $order->status,
                    'payment_status' => $order->payment_status,
                ];
            });

        // === TOP PRODUCTS (current month) ===
        $topProducts = OrderItem::select(
                'product_id',
                'product_name',
                DB::raw('SUM(quantity) as total_sold'),
                DB::raw('SUM(subtotal) as total_revenue')
            )
            ->whereHas('order', function ($q) use ($currentMonth, $currentYear) {
                $q->where('payment_status', 'paid')
                    ->whereMonth('paid_at', $currentMonth)
                    ->whereYear('paid_at', $currentYear);
            })
            ->groupBy('product_id', 'product_name')
            ->orderByDesc('total_revenue')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->product_name,
                    'total_sold' => (int) $item->total_sold,
                    'total_revenue' => (float) $item->total_revenue,
                ];
            });

        // If no data this month, show all-time top products
        if ($topProducts->isEmpty()) {
            $topProducts = OrderItem::select(
                    'product_id',
                    'product_name',
                    DB::raw('SUM(quantity) as total_sold'),
                    DB::raw('SUM(subtotal) as total_revenue')
                )
                ->whereHas('order', function ($q) {
                    $q->where('payment_status', 'paid');
                })
                ->groupBy('product_id', 'product_name')
                ->orderByDesc('total_revenue')
                ->limit(5)
                ->get()
                ->map(function ($item) {
                    return [
                        'name' => $item->product_name,
                        'total_sold' => (int) $item->total_sold,
                        'total_revenue' => (float) $item->total_revenue,
                    ];
                });
        }

        // === PAYMENT METHOD DISTRIBUTION ===
        $paymentMethods = Order::where('payment_status', 'paid')
            ->select('payment_method', DB::raw('COUNT(*) as count'), DB::raw('SUM(total) as total'))
            ->groupBy('payment_method')
            ->get()
            ->map(function ($item) {
                return [
                    'method' => $item->payment_method ?? 'Lainnya',
                    'count' => (int) $item->count,
                    'total' => (float) $item->total,
                ];
            });

        // === DAILY REVENUE (last 30 days) ===
        $dailyRevenue = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = $now->copy()->subDays($i);
            $revenue = Order::where('payment_status', 'paid')
                ->whereDate('paid_at', $date->toDateString())
                ->sum('total');
            $orders = Order::whereDate('created_at', $date->toDateString())->count();
            $dailyRevenue[] = [
                'date' => $date->format('d M'),
                'dateFull' => $date->format('Y-m-d'),
                'revenue' => (float) $revenue,
                'orders' => $orders,
            ];
        }

        return Inertia::render('admin/Statistics', [
            'summary' => [
                'totalRevenue' => (float) $totalRevenue,
                'revenueChange' => $revenueChange,
                'totalOrders' => $totalOrders,
                'ordersChange' => $ordersChange,
                'totalCustomers' => $totalCustomers,
                'customersChange' => $customersChange,
                'totalProductsSold' => (int) $totalProductsSold,
                'productsSoldChange' => $productsSoldChange,
            ],
            'monthlyRevenue' => $monthlyRevenue,
            'monthlyOrderStatus' => $monthlyOrderStatus,
            'recentTransactions' => $recentTransactions,
            'topProducts' => $topProducts,
            'paymentMethods' => $paymentMethods,
            'dailyRevenue' => $dailyRevenue,
        ]);
    }
}
