<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminOrderController extends Controller
{
    public function index()
    {
        $orders = Order::with('items.product', 'items.productVariant')
            ->latest()
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'customer_name' => $order->customer_name,
                    'customer_email' => $order->customer_email,
                    'customer_phone' => $order->customer_phone,
                    'total' => (float) $order->total,
                    'payment_method' => $order->payment_method,
                    'payment_status' => $order->payment_status,
                    'status' => $order->status,
                    'payment_proof' => $order->payment_proof ? Storage::url($order->payment_proof) : null,
                    'notes' => $order->notes,
                    'created_at' => $order->created_at->toIso8601String(),
                    'paid_at' => $order->paid_at ? $order->paid_at->toIso8601String() : null,
                    'items' => $order->items->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'product_name' => $item->product_name,
                            'variant_name' => $item->variant_name,
                            'quantity' => $item->quantity,
                            'price' => (float) $item->price,
                            'subtotal' => (float) $item->subtotal,
                        ];
                    })->toArray(),
                ];
            })
            ->values()
            ->toArray();
        
        return Inertia::render('admin/Orders/Index', [
            'orders' => $orders
        ]);
    }

    public function show(Order $order)
    {
        $order->load('items.product', 'items.productVariant');
        
        return Inertia::render('admin/Orders/Show', [
            'order' => $order
        ]);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'payment_status' => 'required|in:unpaid,paid,cancelled'
        ]);

        $updateData = ['payment_status' => $validated['payment_status']];
        
        // Jika diubah jadi paid, set paid_at
        if ($validated['payment_status'] === 'paid' && !$order->paid_at) {
            $updateData['paid_at'] = now();
        }

        $order->update($updateData);

        return back()->with('success', 'Status pembayaran berhasil diupdate');
    }

    /**
     * Halaman verifikasi pembayaran
     */
    public function payments()
    {
        $orders = Order::whereIn('payment_method', ['qris', 'bank_transfer', 'cash'])
            ->latest()
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'customer_name' => $order->customer_name,
                    'customer_email' => $order->customer_email,
                    'total' => $order->total,
                    'payment_method' => $order->payment_method,
                    'payment_status' => $order->payment_status,
                    'payment_proof' => $order->payment_proof ? Storage::url($order->payment_proof) : null,
                    'created_at' => $order->created_at,
                    'paid_at' => $order->paid_at,
                ];
            })
            ->values()
            ->toArray();


        
        return Inertia::render('admin/Payments/Index', [
            'orders' => $orders
        ]);
    }

    /**
     * Verifikasi pembayaran
     */
    public function verifyPayment(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:verified,rejected'
        ]);

        $order->update([
            'payment_status' => $validated['status'],
            'paid_at' => $validated['status'] === 'verified' ? ($order->paid_at ?? now()) : null,
        ]);

        return back()->with('success', 'Status pembayaran berhasil diupdate');
    }
}