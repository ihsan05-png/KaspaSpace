<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // Total Pesanan
        $totalOrders = Order::count();
        
        // Total Pengguna (exclude admin)
        $totalUsers = User::where('role', '!=', 'admin')->count();
        
        // Total Pendapatan dari pesanan yang sudah dibayar
        $totalRevenue = Order::where('payment_status', 'paid')->sum('total');
        
        // Total Produk Aktif
        $activeProducts = Product::count();
        
        // Recent orders untuk aktivitas terbaru
        $recentOrders = Order::with(['items.product', 'items.productVariant'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'customer_name' => $order->customer_name,
                    'total' => (float) $order->total,
                    'payment_status' => $order->payment_status,
                    'status' => $order->status,
                    'created_at' => $order->created_at->toIso8601String(),
                    'paid_at' => $order->paid_at ? $order->paid_at->toIso8601String() : null,
                ];
            });

        return Inertia::render('admin/LandingAdmin', [
            'stats' => [
                'totalOrders' => $totalOrders,
                'totalUsers' => $totalUsers,
                'totalRevenue' => $totalRevenue,
                'activeProducts' => $activeProducts,
            ],
            'recentOrders' => $recentOrders,
        ]);
    }

    public function deleteOrder($id)
    {
        try {
            $order = Order::findOrFail($id);
            $order->delete();

            return redirect()->back()->with('success', 'Pesanan berhasil dihapus');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal menghapus pesanan');
        }
    }
}
