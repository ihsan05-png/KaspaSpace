<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Discount;
use App\Models\PaymentSetting;
use App\Models\NewsletterSubscriber;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;
use App\Models\Agreement;

class CheckoutController extends Controller
{
   public function index()
{
    $cart = session('cart', []);

    if (empty($cart)) {
        return redirect('/');
    }

    $subtotal = array_sum(array_column($cart, 'subtotal'));

    // Get payment settings for QRIS and Bank Transfer
    $paymentSetting = PaymentSetting::first();
    $paymentSettings = null;

    if ($paymentSetting) {
        $paymentSettings = [
            'qris_image' => $paymentSetting->qris_image ? Storage::url($paymentSetting->qris_image) : null,
            'bank_name' => $paymentSetting->bank_name,
            'account_number' => $paymentSetting->account_number,
            'account_name' => $paymentSetting->account_name,
        ];
    }

    return Inertia::render('Checkout/Index', [
        'cart' => $cart,
        'subtotal' => $subtotal,
        'tax' => 0,
        'total' => $subtotal,
        'user' => auth()->user() ? [
            'name' => auth()->user()->name,
            'email' => auth()->user()->email,
            'phone' => auth()->user()->phone,
            'agreed_terms' => (bool) auth()->user()->agreed_terms,
            'agreed_privacy' => (bool) auth()->user()->agreed_privacy,
            'agreed_newsletter' => (bool) auth()->user()->agreed_newsletter,
        ] : null,
        'paymentSettings' => $paymentSettings,
        'termsAgreement' => Agreement::getTerms(),
        'privacyAgreement' => Agreement::getPrivacy(),
    ]);
}

    public function store(Request $request)
{
    $validated = $request->validate([
        'customer_name' => 'required|string|max:255',
        'customer_email' => 'required|email|max:255',
        'customer_phone' => 'required|string|max:20',
        'notes' => 'nullable|string|max:1000',
        'payment_method' => 'required|in:midtrans,cash,qris,bank_transfer',
        'discount_code' => 'nullable|string|max:50',
        'agreed_newsletter' => 'nullable|boolean',
        'needs_agreement' => 'nullable|boolean',
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
            $orderItemData = [
                'order_id' => $order->id,
                'product_id' => $item['product_id'],
                'variant_id' => $item['variant_id'] ?? null,
                'product_name' => $item['product_name'],
                'variant_name' => $item['variant_name'] ?? null,
                'custom_options' => $item['custom_options'] ?? [],
                'quantity' => $item['quantity'],
                'price' => $item['price'],
                'subtotal' => $item['subtotal'],
            ];

            // Set booking timestamps for coworking products
            if (!empty($item['booking_date']) && !empty($item['booking_start_time'])) {
                $variant = \App\Models\ProductVariant::find($item['variant_id']);
                $durationHours = $variant ? ($variant->duration_hours ?? 1) : 1;
                $product = \App\Models\Product::find($item['product_id']);

                $startAt = Carbon::parse($item['booking_date'] . ' ' . $item['booking_start_time']);

                // Calculate end time based on product type
                if ($product && in_array($product->product_type, ['private_office', 'virtual_office'])) {
                    // Date-only booking: duration is in months (stored as hours, e.g., 720 = 1 month)
                    // Convert hours to months (720 hours = 1 month approximately)
                    $durationMonths = max(1, round($durationHours / 720));
                    $endAt = (clone $startAt)->addMonths($durationMonths);
                } else {
                    // Hourly booking (share_desk, private_room)
                    $endAt = (clone $startAt)->addMinutes((int) ($durationHours * 60));
                }

                $orderItemData['booking_start_at'] = $startAt;
                $orderItemData['booking_end_at'] = $endAt;

                // Re-validate availability inside transaction to prevent double booking
                if ($product && in_array($product->product_type, ['share_desk', 'private_room', 'private_office', 'virtual_office'])) {
                    if (in_array($product->product_type, ['private_office', 'virtual_office'])) {
                        // Validate date-only booking (private_office, virtual_office)
                        // All variants share the same inventory - use first variant's stock
                        $firstVariant = $product->variants()->where('is_active', true)->first();
                        $totalSlots = $firstVariant ? ($firstVariant->stock_quantity ?? 999) : 999;
                        if ($product->product_type === 'private_office' && $totalSlots <= 0) $totalSlots = 6;

                        $productType = $product->product_type;
                        $bookedSlots = OrderItem::whereHas('product', fn($q) => $q->where('product_type', $productType))
                            ->whereHas('order', fn($q) => $q->whereNotIn('status', ['cancelled']))
                            ->where('stock_reduced', true)
                            ->where('stock_restored', false)
                            ->where('booking_start_at', '<=', $endAt)
                            ->where(fn($q) => $q->whereNull('booking_end_at')->orWhere('booking_end_at', '>', $startAt))
                            ->sum('quantity');

                        $productLabel = $product->product_type === 'private_office' ? 'Private Office' : 'Virtual Office';
                        if (($totalSlots - $bookedSlots) < $item['quantity']) {
                            DB::rollBack();
                            return back()->withErrors(['booking' => "$productLabel tidak tersedia untuk tanggal {$item['booking_date']}. Silakan pilih tanggal lain."]);
                        }
                    } else {
                        // Validate share_desk and private_room
                        $bookedDesks = OrderItem::whereHas('product', fn($q) => $q->where('product_type', 'share_desk'))
                            ->whereHas('order', fn($q) => $q->whereNotIn('status', ['cancelled']))
                            ->where('stock_reduced', true)
                            ->where('stock_restored', false)
                            ->where('booking_start_at', '<', $endAt)
                            ->where('booking_end_at', '>', $startAt)
                            ->sum('quantity');

                        $privateRoomBooked = OrderItem::whereHas('product', fn($q) => $q->where('product_type', 'private_room'))
                            ->whereHas('order', fn($q) => $q->whereNotIn('status', ['cancelled']))
                            ->where('stock_reduced', true)
                            ->where('stock_restored', false)
                            ->where('booking_start_at', '<', $endAt)
                            ->where('booking_end_at', '>', $startAt)
                            ->exists();

                        if ($product->product_type === 'share_desk') {
                            $available = $privateRoomBooked ? 0 : (8 - $bookedDesks);
                            if ($available < $item['quantity']) {
                                DB::rollBack();
                                return back()->withErrors(['booking' => "Slot Share Desk tidak tersedia lagi untuk waktu {$item['booking_start_time']} pada {$item['booking_date']}. Silakan pilih waktu lain."]);
                            }
                        } else {
                            if ($privateRoomBooked || $bookedDesks > 0) {
                                DB::rollBack();
                                return back()->withErrors(['booking' => "Private Room tidak tersedia untuk waktu {$item['booking_start_time']} pada {$item['booking_date']}. Silakan pilih waktu lain."]);
                            }
                        }
                    }
                }
            }

            $orderItem = OrderItem::create($orderItemData);

            // Handle stock for booking items
            if (!empty($orderItemData['booking_start_at']) && !empty($item['variant_id'])) {
                $product = $product ?? \App\Models\Product::find($item['product_id']);

                if ($product && in_array($product->product_type, ['share_desk', 'private_room', 'private_office', 'virtual_office'])) {
                    // Booking products: availability is date/time-specific (checked above via time-slot overlap).
                    // Only set the flag so the availability queries count this booking; do NOT touch global stock_quantity.
                    $orderItem->update(['stock_reduced' => true]);
                } else {
                    // Non-booking products: use global stock as before
                    $variant = \App\Models\ProductVariant::find($item['variant_id']);
                    if ($variant && $variant->manage_stock) {
                        $decremented = $variant->decrementStock($item['quantity']);
                        if ($decremented) {
                            $orderItem->update(['stock_reduced' => true]);
                        }
                    }
                }
            }
        }
        
        // Increment usage count jika ada diskon
        if ($discount) {
            $discount->incrementUsage();
        }

        // Save agreements for logged-in users who haven't agreed yet (e.g. admin-created users)
        if (auth()->check() && !empty($validated['needs_agreement'])) {
            auth()->user()->update([
                'agreed_terms' => true,
                'agreed_privacy' => true,
                'agreed_newsletter' => true,
                'agreed_at' => now(),
            ]);
        }

        // Save newsletter subscription for guest users
        if (!auth()->check() && !empty($validated['agreed_newsletter'])) {
            NewsletterSubscriber::subscribe(
                $validated['customer_email'],
                $validated['customer_name'],
                'guest_checkout'
            );
        }

        DB::commit();

        // Hapus cart setelah order berhasil dibuat
        session()->forget('cart');

        // Redirect ke halaman payment untuk semua metode pembayaran
        return redirect()->route('order.payment', ['order' => $order->id]);

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
        $order->load('items.product');

        // Clear cart setelah user melihat halaman payment
        session()->forget('cart');

        // Get payment settings for QRIS and Bank Transfer
        $paymentSetting = PaymentSetting::first();
        $paymentSettings = null;

        if ($paymentSetting) {
            $paymentSettings = [
                'qris_image' => $paymentSetting->qris_image ? Storage::url($paymentSetting->qris_image) : null,
                'bank_name' => $paymentSetting->bank_name,
                'account_number' => $paymentSetting->account_number,
                'account_name' => $paymentSetting->account_name,
            ];
        }

        return Inertia::render('Orders/Payment', [
            'order' => $order,
            'paymentSettings' => $paymentSettings,
        ]);
    }
}