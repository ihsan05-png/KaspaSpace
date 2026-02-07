<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\ProductVariant;
use Carbon\Carbon;
use Inertia\Inertia;

class CartController extends Controller
{
    public function index()
    {
        $cart = session('cart', []);
        
        return Inertia::render('Cart/Index', [
            'cart' => $cart
        ]);
    }

    public function add(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'product_name' => 'required|string',
            'product_type' => 'nullable|string',
            'variant_id' => 'nullable|exists:product_variants,id',
            'variant_name' => 'nullable|string',
            'custom_options' => 'nullable|array',
            'quantity' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0',
            'booking_date' => 'nullable|date|after_or_equal:today',
            'booking_start_time' => 'nullable|string',
        ]);

        $cart = session('cart', []);


        if ($validated['variant_id']) {
            $variant = ProductVariant::find($validated['variant_id']);
            $product = Product::find($validated['product_id']);

            // Booking products: availability is date/time-specific,
            // checked via BookingAvailabilityController. Skip global stock_quantity check.
            $isBookingProduct = $product && in_array($product->product_type, ['share_desk', 'private_room', 'private_office', 'virtual_office']);

            if (!$isBookingProduct && $variant->manage_stock && $variant->stock_quantity < $validated['quantity']) {
                return back()->withErrors(['stock' => 'Stok tidak mencukupi']);
            }
        }

        // Validate booking time for coworking products (hourly booking only)
        if (!empty($validated['booking_date']) && !empty($validated['booking_start_time'])) {
            $product = Product::find($validated['product_id']);

            // Skip time validation for private_office (date-only booking)
            if (in_array($product->product_type, ['share_desk', 'private_room'])) {
                $variant = ProductVariant::find($validated['variant_id']);
                $durationHours = $variant->duration_hours ?? 1;

                $timeParts = explode(':', $validated['booking_start_time']);
                $startMinutes = ((int) $timeParts[0]) * 60 + ((int) ($timeParts[1] ?? 0));
                $endMinutes = $startMinutes + ($durationHours * 60);

                if ($endMinutes > 17 * 60) {
                    return back()->withErrors(['booking' => 'Booking melebihi jam operasional (17:00)']);
                }

                if ($startMinutes < 8 * 60) {
                    return back()->withErrors(['booking' => 'Jam operasional dimulai dari 08:00']);
                }

                // Reject past times for today
                $bookingStart = \Carbon\Carbon::parse($validated['booking_date'] . ' ' . $validated['booking_start_time']);
                if ($bookingStart->lt(now())) {
                    return back()->withErrors(['booking' => 'Jam yang dipilih sudah lewat. Silakan pilih jam yang akan datang.']);
                }
            }
        }

        $cartItem = [
            'id' => uniqid(),
            'product_id' => $validated['product_id'],
            'product_name' => $validated['product_name'],
            'product_type' => $validated['product_type'] ?? null,
            'variant_id' => $validated['variant_id'] ?? null,
            'variant_name' => $validated['variant_name'] ?? null,
            'custom_options' => $validated['custom_options'] ?? [],
            'quantity' => $validated['quantity'],
            'price' => $validated['price'],
            'subtotal' => $validated['price'] * $validated['quantity'],
            'booking_date' => $validated['booking_date'] ?? null,
            'booking_start_time' => $validated['booking_start_time'] ?? null,
        ];

        $cart[] = $cartItem;
        session(['cart' => $cart]);

        return back()->with('success', 'Produk berhasil ditambahkan ke keranjang');
    }

    public function remove(Request $request)
    {
        $cart = session('cart', []);
        $itemId = $request->input('id');
        
        $cart = array_filter($cart, function($item) use ($itemId) {
            return $item['id'] !== $itemId;
        });
        
        session(['cart' => array_values($cart)]);

        return back()->with('success', 'Produk berhasil dihapus dari keranjang');
    }

    public function updateQuantity(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required',
            'quantity' => 'required|integer|min:1',
        ]);

        $cart = session('cart', []);
        
        foreach ($cart as &$item) {
            if ($item['id'] === $validated['id']) {
                // Cek stok jika variant memiliki stock management (skip untuk booking products)
                if ($item['variant_id']) {
                    $variant = ProductVariant::find($item['variant_id']);
                    $product = Product::find($item['product_id']);
                    $isBookingProduct = $product && in_array($product->product_type, ['share_desk', 'private_room', 'private_office', 'virtual_office']);

                    if (!$isBookingProduct && $variant->manage_stock && $variant->stock_quantity < $validated['quantity']) {
                        return back()->withErrors(['stock' => 'Stok tidak mencukupi']);
                    }
                }
                
                $item['quantity'] = $validated['quantity'];
                $item['subtotal'] = $item['price'] * $validated['quantity'];
                break;
            }
        }
        
        session(['cart' => $cart]);

        return back();
    }
}
