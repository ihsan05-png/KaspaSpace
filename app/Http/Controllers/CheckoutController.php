<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Discount;
use Illuminate\Support\Facades\DB;

class CheckoutController extends Controller
{
   public function index()
{
    $cart = session('cart', []);
    
    if (empty($cart)) {
        return redirect('/');
    }

    $subtotal = array_sum(array_column($cart, 'subtotal'));

    return Inertia::render('Checkout/Index', [
        'cart' => $cart,
        'subtotal' => $subtotal,
        'tax' => 0,
        'total' => $subtotal,
        'user' => auth()->user() ? [
            'name' => auth()->user()->name,
            'email' => auth()->user()->email,
            'phone' => auth()->user()->phone,
        ] : null,
    ]);
}

    public function store(Request $request)
{
    $validated = $request->validate([
        'customer_name' => 'required|string|max:255',
        'customer_email' => 'required|email|max:255',
        'customer_phone' => 'required|string|max:20',
        'notes' => 'nullable|string|max:1000',
        'payment_method' => 'required|in:midtrans,cash',
        'discount_code' => 'nullable|string|max:50',
    ]);

    $cart = session('cart', []);
    
    if (empty($cart)) {
        return back()->withErrors(['cart' => 'Keranjang kosong']);
    }

    $subtotal = array_sum(array_column($cart, 'subtotal'));
    
    // Validasi dan hitung diskon
    $discount = null;
    $discountAmount = 0;
    
    if (!empty($validated['discount_code'])) {
        $discount = Discount::where('code', $validated['discount_code'])->first();
        
        if ($discount && $discount->isValid($subtotal)) {
            // Load produk yang dipilih untuk diskon
            $discount->load('products');
            
            // Check apakah diskon berlaku untuk produk di cart
            if ($discount->products->count() > 0) {
                $cartProductIds = array_column($cart, 'product_id');
                $discountProductIds = $discount->products->pluck('id')->toArray();
                
                // Check apakah ada produk di cart yang bisa dapat diskon
                $hasApplicableProduct = false;
                foreach ($cartProductIds as $productId) {
                    if (in_array($productId, $discountProductIds)) {
                        $hasApplicableProduct = true;
                        break;
                    }
                }

                if (!$hasApplicableProduct) {
                    return back()->withErrors(['discount_code' => 'Diskon ini tidak berlaku untuk produk di keranjang Anda']);
                }
            }
            
            $discountAmount = $discount->calculateDiscount($subtotal);
        } else {
            return back()->withErrors(['discount_code' => 'Kode diskon tidak valid']);
        }
    }
    
    $total = $subtotal - $discountAmount;

    try {
        DB::beginTransaction();

        $order = Order::create([
            'customer_name' => $validated['customer_name'],
            'customer_email' => $validated['customer_email'],
            'customer_phone' => $validated['customer_phone'],
            'notes' => $validated['notes'] ?? null,
            'payment_method' => $validated['payment_method'],
            'payment_status' => 'unpaid',
            'subtotal' => $subtotal,
            'discount_id' => $discount ? $discount->id : null,
            'discount_code' => $discount ? $discount->code : null,
            'discount_amount' => $discountAmount,
            'total' => $total,
            'status' => 'pending',
        ]);

        foreach ($cart as $item) {
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $item['product_id'],
                'product_variant_id' => $item['variant_id'] ?? null,
                'product_name' => $item['product_name'],
                'variant_name' => $item['variant_name'] ?? null,
                'custom_options' => $item['custom_options'] ?? [],
                'quantity' => $item['quantity'],
                'price' => $item['price'],
                'subtotal' => $item['subtotal'],
            ]);
        }
        
        // Increment usage count jika ada diskon
        if ($discount) {
            $discount->incrementUsage();
        }

        DB::commit();

        // Hapus cart setelah order berhasil dibuat
        session()->forget('cart');

        // Jika pembayaran menggunakan Midtrans, redirect ke payment gateway
        if ($validated['payment_method'] === 'midtrans') {
            // TODO: Implementasi Midtrans Snap
            // Untuk sementara redirect ke halaman payment dengan order info
            return redirect()->route('order.payment', ['order' => $order->id]);
        }
        
        // Jika cash, redirect langsung ke halaman sukses
        return redirect()->route('checkout.success', ['order' => $order->id]);

    } catch (\Exception $e) {
        DB::rollBack();
        return back()->withErrors(['error' => 'Terjadi kesalahan: ' . $e->getMessage()]);
    }
}

    public function success(Order $order)
    {
        $order->load('items');
        
        return Inertia::render('Checkout/Success', [
            'order' => $order
        ]);
    }

    public function payment(Order $order)
    {
        $order->load('items');
        
        // Clear cart setelah user melihat halaman payment
        session()->forget('cart');

        return Inertia::render('Orders/Payment', [
            'order' => $order
        ]);
    }
}